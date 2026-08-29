"""key-action-runtime: demo-derived key-action workflow, l1_5 SFT format.

Reproduces the prompt the l1_5 checkpoint was SFT'd on: the ``# Workflow`` system
section, the ``subtask_complete`` computer_use action, and the workflow blocks on the
FIRST user turn. Subtasks advance on ``subtask_complete`` and the last one terminates
on ``finished``; the plan is the per-task demo under ``run.demo_dir``.

The constants below are checkpoint-fixed, not config: they are byte-aligned to the
training-data builder. That includes the section still claiming the workflow comes on
"every user turn", which training never updated when it moved to the first turn.
"""
from __future__ import annotations

import logging
import re
from typing import Any, Dict, TYPE_CHECKING

from workflow import engine, democua_source, consume
from workflow.base import WorkflowHook, register_hook

if TYPE_CHECKING:
    from core.config import ExperimentConfig

logger = logging.getLogger("desktopenv.workflow.key_action_runtime")

_SC_TOOL = "subtask_complete"
# Presence marks "this step is mine"; without it the rewriter below is passthrough.
_TASK_INSTRUCTION = "workflow_task_instruction"

# The agent tags nothing, so this prefix is the only handle on the block we must
# drop: training puts the instruction AFTER the workflow.
_BASELINE_USER_PREFIX = (
    "\nPlease generate the next move according to the UI screenshot, "
    "instruction and previous actions."
)

# VERBATIM from ``build_swift_sft._build_instruction_prompt``.
_SFT_GUIDANCE_LINE = (
    "Please generate the next move according to the UI screenshot, "
    "workflow context and instruction."
)

# VERBATIM from ``prompts/system_workflow_l1_5.md``, inlined so the system prompt
# byte-matches training (``{term}`` = termination).
_SFT_WORKFLOW_SECTION = """# Workflow

An external runtime injects a workflow into every user turn, right after the current screenshot:
- `<workflow_progress>` — the subtask checklist with markers (【✅】completed, 【➡️】current, 【 】upcoming).
- `<current_subtask>` — the current subtask's `sub_instruction` + `subtask_complete_flag` (+ optional `intent_summary`). Work on THIS subtask only; `sub_instruction` is your per-turn goal.
- `<current_subtask_action_list>` — an ordered list of the current subtask's KEY milestones (lines like "Key Step N: ..."). It is a reference plan of milestones, not every low-level primitive and not pixel coordinates. Reaching one key step often takes several primitives on the live screen (focus clicks, scrolls, submit keys, dismissing popups). The live screenshot is authoritative: follow the list when it agrees, and adapt when the screen has diverged, an element is missing, a popup appears, or a recovery step is needed.

Workflow rules:
- Reason inside `<think>` within the scope of the CURRENT subtask, and compare the current screenshot against its `subtask_complete_flag`.
- Every response makes exactly one `computer_use` call. Keep using a GUI action (click/type/scroll/…) until the current screenshot satisfies the current subtask's `subtask_complete_flag`; then call `computer_use` with `action=subtask_complete` (instead of a GUI action) to let the runtime advance the subtask pointer on the next turn.
- {term}"""

_TERM = ("If this was the final subtask, the runtime shows you the resulting screenshot "
         "on one more turn; then emit `computer_use` with `action=finished` "
         "(status=success) to terminate the task.")


# --- Completion-signal detection ---================================

_BLOCK_RE = re.compile(r"<tool_call>.*?</tool_call>", re.IGNORECASE | re.DOTALL)

# Models mix `.` and `_` in tool names.
_SC_ALT = "(?:subtask_complete|subtask\\.complete)"

# Same signal, different serialisations per server and chat template.
_SC_PATTERNS = [
    re.compile(p.replace("{name}", _SC_ALT), re.IGNORECASE | re.DOTALL)
    for p in (
        r'<tool_call>[^<]*"name"\s*:\s*"{name}"[^<]*>',
        r'"action"\s*:\s*"{name}"',
        r"<parameter\s*=\s*action>\s*{name}\s*</parameter>",
        r"```[\s\S]*?{name}\s*\(.*?\)[\s\S]*?```",
        r"\b{name}\s*\(",
    )
]


def detect_tool_call_report(response: Any) -> bool:
    """Matches only inside ``<tool_call>`` blocks, so a mention in <think>/<action>
    narration cannot falsely advance the subtask."""
    search_text = "\n".join(_BLOCK_RE.findall(engine.text_of(response)))
    return bool(search_text) and any(p.search(search_text) for p in _SC_PATTERNS)


# --- l1_5 rendering ---=============================================


def build_l15_guidance(plan: engine.WorkflowPlan, current_index: int) -> str:
    """Byte-identical to sft_v3's build_workflow_user_content; the action list is the
    demo's full step list."""
    subs = plan.subtasks
    progress = ["<workflow_progress>"]
    for i, st in enumerate(subs):
        mark = "【✅】" if i < current_index else ("【➡️】" if i == current_index else "【 】")
        progress.append(f"{mark}subtask {i}: {(st.goal or '').strip().replace(chr(10), ' ')}")
    progress.append("</workflow_progress>")

    st = subs[current_index]
    current = ["<current_subtask>", f"index: {current_index}",
               f"sub_instruction: {(st.goal or '').strip()}",
               f"subtask_complete_flag: {(st.completion_flag or '').strip()}"]
    if st.title:
        current.append(f"intent_summary: {st.title}")
    current.append("</current_subtask>")

    body = ("\n".join(f"Key Step {i}: {a}" for i, a in enumerate(st.key_steps))
            if st.key_steps else "None")
    action_list = f"<current_subtask_action_list>\n{body}\n</current_subtask_action_list>"

    return "\n\n".join(["\n".join(progress), "\n".join(current), action_list])


def inject_subtask_complete_patch(obs: Dict[str, Any]) -> Dict[str, Any]:
    """Enum entry, description and params mirror training's
    ``get_computer_use_tool(include_subtask_complete=True)`` verbatim, so the inference
    ``<tools>`` block matches the v5 SFT schema."""
    out = {**obs}
    out["workflow_action_patch"] = {
        "action_description": (
            f"* `{_SC_TOOL}`: Signal that the CURRENT subtask is "
            "complete and advance the workflow. Use this INSTEAD OF a GUI action, "
            "only when the current screenshot already satisfies the subtask's "
            "completion criterion; never combine it with another action."),
        "action_enum": [_SC_TOOL],
        "extra_properties_json": (
            '"current_subtask_idx": {"description": "0-indexed pointer of the '
            f'subtask you are finishing. Required only for `action={_SC_TOOL}`.", '
            '"type": "integer"}, '
            '"evidence": {"description": "One sentence pointing to the screenshot '
            f'evidence that the completion criterion is satisfied. Required only for '
            f'`action={_SC_TOOL}`.", "type": "string"}}'),
    }
    return out


# --- First-turn user layout ---=====================================


def _place_workflow_on_first_turn(messages, obs):
    """Move the workflow onto the FIRST user turn, leaving later turns baseline.

    Reproduces ``build_swift_sft --history-q-mode first_turn_workflow``: the agent's own
    instruction prompt is dropped and rewritten after the workflow blocks, which is the
    order the checkpoint was trained on.
    """
    instruction = obs.get(_TASK_INSTRUCTION) if isinstance(obs, dict) else None
    if not isinstance(instruction, str) or not messages:
        return messages

    user_indices = [
        i for i, message in enumerate(messages)
        if isinstance(message, dict) and message.get("role") == "user"
    ]
    if not user_indices:
        return messages
    first_idx = user_indices[0]
    first = dict(messages[first_idx])
    content = first.get("content")
    if not isinstance(content, list):
        return messages

    guidance = obs.get("workflow_guidance") or ""
    baseline_found = False
    cleaned = []
    for part in content:
        text = part.get("text") if isinstance(part, dict) else None
        if isinstance(text, str) and text.startswith(_BASELINE_USER_PREFIX):
            baseline_found = True
            continue
        cleaned.append(part)
    if not baseline_found:
        return messages

    # One newline after the image, two before Instruction: byte parity with training.
    text = "\n" + guidance.lstrip("\n") + "\n\nInstruction: " + instruction
    cleaned.append({"type": "text", "text": text})
    first["content"] = cleaned
    out = list(messages)
    out[first_idx] = first
    return out


@register_hook("key-action-runtime")
class KeyActionRuntimeHook(WorkflowHook):
    """Demo key-action workflow in l1_5 SFT format, on the first user turn."""

    def __init__(self, config: "ExperimentConfig"):
        super().__init__(config)
        # Only the message assembler can place the workflow; registered on use, not
        # on import.
        consume.register_post_processor(_place_workflow_on_first_turn)
        self._demo_dir = getattr(config.run, "demo_dir", None)
        self._system_note = _SFT_WORKFLOW_SECTION.format(term=_TERM)
        self._await_finish = False

    def on_episode_start(self, agent, env, task_config, result_dir) -> None:
        self._await_finish = False
        plan = democua_source.resolve_plan(task_config.get("id"), demo_dir=self._demo_dir)
        logger.info("key-action-runtime %s: %s", task_config.get("id"),
                    f"{len(plan.subtasks)} subtasks" if plan else "passthrough")
        self._bind(plan)

    def on_before_step(self, step_idx, instruction, obs, env, result_dir):
        if not self.active or self._tracker.current_subtask is None:
            return obs
        blocks = build_l15_guidance(self._plan, self._tracker.current_index)
        obs = engine.inject_guidance(obs, "\n\n" + blocks + "\n" + _SFT_GUIDANCE_LINE)
        obs[_TASK_INSTRUCTION] = instruction
        # Leading blank line: the training system prompt has one before `# Workflow`.
        obs = engine.inject_system_prompt(obs, "\n\n" + self._system_note)
        return inject_subtask_complete_patch(obs)

    def on_after_predict(self, step_idx, instruction, obs, response):
        if not self.active:
            return response
        if detect_tool_call_report(response):
            if not self._tracker.is_last:
                self._await_finish = False
                self._tracker.force_advance()
                return engine.replace_actions(response, ["WAIT"])
            # Trained to emit `finished` one turn later, so give it that turn.
            if self._await_finish:
                return engine.replace_actions(response, ["DONE"])
            self._await_finish = True
            return engine.replace_actions(response, ["WAIT"])
        self._await_finish = False
        # The model mistook a subtask for the task; advancing beats an early exit.
        if not self._tracker.is_last and any(a == "DONE" for a in engine.extract_actions(response)):
            self._tracker.force_advance()
            return engine.replace_actions(response, ["WAIT"])
        return response
