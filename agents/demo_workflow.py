"""Demonstration-guided execution: one recorded episode as an in-context workflow.

A demonstration is a successful desktop execution already segmented into subtasks
(``trajectory_captioned*.json``). :class:`DemoWorkflow` turns it into per-step
guidance: the current subtask, its completion criterion and its key steps are written
into ``obs``, the agent folds them into the prompt, and the pointer advances when the
model reports ``subtask_complete``. Coordinates are never replayed — the live
screenshot stays authoritative.

The prompt fragments below are byte-aligned to the demonstration-guided training
format; they are checkpoint-fixed rather than tunable.

Quick start::

    from agents.ui_mate_agent import UIMateAgent

    agent = UIMateAgent(base_url=..., demo="examples/trajectory_captioned_ssh_user.json")
    agent.reset()
    response, actions = agent.predict(instruction, {"screenshot": png_bytes})
"""

from __future__ import annotations

import json
import logging
import re
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Dict, List, Optional, Union

logger = logging.getLogger("ui_mate.demo_workflow")

DEMO_GLOB = "trajectory_captioned*.json"
SUBTASK_COMPLETE_ACTION = "subtask_complete"

# obs keys: the workflow writes them, the agent only reads them.
OBS_GUIDANCE = "workflow_guidance"
OBS_SYSTEM_PROMPT = "workflow_system_prompt"
OBS_ACTION_PATCH = "workflow_action_patch"


# ---------------------------------------------------------------------------
# Training-fixed prompt fragments
# ---------------------------------------------------------------------------
WORKFLOW_SYSTEM_SECTION = """# Workflow

An external runtime injects a workflow into every user turn, right after the current screenshot:
- `<workflow_progress>` — the subtask checklist with markers (【✅】completed, 【➡️】current, 【 】upcoming).
- `<current_subtask>` — the current subtask's `sub_instruction` + `subtask_complete_flag` (+ optional `intent_summary`). Work on THIS subtask only; `sub_instruction` is your per-turn goal.
- `<current_subtask_action_list>` — an ordered list of the current subtask's KEY milestones (lines like "Key Step N: ..."). It is a reference plan of milestones, not every low-level primitive and not pixel coordinates. Reaching one key step often takes several primitives on the live screen (focus clicks, scrolls, submit keys, dismissing popups). The live screenshot is authoritative: follow the list when it agrees, and adapt when the screen has diverged, an element is missing, a popup appears, or a recovery step is needed.

Workflow rules:
- Reason inside `<think>` within the scope of the CURRENT subtask, and compare the current screenshot against its `subtask_complete_flag`.
- Every response makes exactly one `computer_use` call. Keep using a GUI action (click/type/scroll/…) until the current screenshot satisfies the current subtask's `subtask_complete_flag`; then call `computer_use` with `action=subtask_complete` (instead of a GUI action) to let the runtime advance the subtask pointer on the next turn.
- If this was the final subtask, the runtime shows you the resulting screenshot on one more turn; then emit `computer_use` with `action=finished` (status=success) to terminate the task."""

# Replaces the baseline "instruction and previous actions" line on the guided turn.
GUIDANCE_LINE = (
    "Please generate the next move according to the UI screenshot, "
    "workflow context and instruction."
)

# Mirrors the training schema for computer_use with subtask reporting enabled.
SUBTASK_COMPLETE_PATCH: Dict[str, Any] = {
    "action_enum": [SUBTASK_COMPLETE_ACTION],
    "action_description": (
        f"* `{SUBTASK_COMPLETE_ACTION}`: Signal that the CURRENT subtask is complete and"
        " advance the workflow. Use this INSTEAD OF a GUI action, only when the current"
        " screenshot already satisfies the subtask's completion criterion; never combine"
        " it with another action."
    ),
    "extra_properties": {
        "current_subtask_idx": {
            "description": (
                "0-indexed pointer of the subtask you are finishing. Required only for"
                f" `action={SUBTASK_COMPLETE_ACTION}`."
            ),
            "type": "integer",
        },
        "evidence": {
            "description": (
                "One sentence pointing to the screenshot evidence that the completion"
                f" criterion is satisfied. Required only for `action={SUBTASK_COMPLETE_ACTION}`."
            ),
            "type": "string",
        },
    },
}


# ---------------------------------------------------------------------------
# Plan model and demo parsing
# ---------------------------------------------------------------------------
@dataclass(frozen=True)
class Subtask:
    """One subtask of a demonstration. ``key_steps`` are its milestone captions."""

    title: str
    goal: str
    completion_flag: str = ""
    key_steps: List[str] = field(default_factory=list)


@dataclass(frozen=True)
class WorkflowPlan:
    subtasks: List[Subtask] = field(default_factory=list)


def _key_step(step: Dict[str, Any]) -> str:
    value = step.get("value") or {}
    executor = value.get("executor_layer") or {}
    planner = value.get("planner_layer") or {}
    return (executor.get("action_description") or planner.get("intent") or "").strip()


def _parse_subtask(raw: Dict[str, Any]) -> Subtask:
    return Subtask(
        title=(raw.get("intent_summary") or "").strip(),
        goal=raw.get("sub_instruction") or "",
        completion_flag=raw.get("subtask_complete_flag") or "",
        key_steps=[
            text
            for text in (_key_step(s) for s in raw.get("steps") or [] if isinstance(s, dict))
            if text
        ],
    )


def find_demo_file(path: Union[str, Path]) -> Path:
    """Accept the demo file itself or a directory holding ``trajectory_captioned*.json``."""
    path = Path(path)
    if path.is_file():
        return path
    found = sorted(path.glob(DEMO_GLOB)) if path.is_dir() else []
    if not found:
        raise FileNotFoundError(f"no {DEMO_GLOB} demonstration under {path}")
    return found[0]


def load_plan(path: Union[str, Path]) -> WorkflowPlan:
    """Parse a demonstration into a :class:`WorkflowPlan`.

    An unusable demo raises instead of degrading into an unguided run, which would
    otherwise be indistinguishable from a guided one in the logs.
    """
    demo_file = find_demo_file(path)
    raw = json.loads(demo_file.read_text(encoding="utf-8"))
    subtasks = [
        _parse_subtask(st) for st in raw.get("subtasks") or [] if isinstance(st, dict)
    ]
    if not subtasks:
        raise ValueError(f"demonstration {demo_file} has no subtasks")
    return WorkflowPlan(subtasks=subtasks)


# ---------------------------------------------------------------------------
# Rendering
# ---------------------------------------------------------------------------
def build_guidance(plan: WorkflowPlan, current_index: int) -> str:
    """Render the three workflow blocks the model sees, plus the guided-turn line."""
    progress = ["<workflow_progress>"]
    for i, subtask in enumerate(plan.subtasks):
        mark = "【✅】" if i < current_index else ("【➡️】" if i == current_index else "【 】")
        goal = (subtask.goal or "").strip().replace("\n", " ")
        progress.append(f"{mark}subtask {i}: {goal}")
    progress.append("</workflow_progress>")

    subtask = plan.subtasks[current_index]
    current = [
        "<current_subtask>",
        f"index: {current_index}",
        f"sub_instruction: {(subtask.goal or '').strip()}",
        f"subtask_complete_flag: {(subtask.completion_flag or '').strip()}",
    ]
    if subtask.title:
        current.append(f"intent_summary: {subtask.title}")
    current.append("</current_subtask>")

    body = (
        "\n".join(f"Key Step {i}: {step}" for i, step in enumerate(subtask.key_steps))
        if subtask.key_steps
        else "None"
    )
    action_list = f"<current_subtask_action_list>\n{body}\n</current_subtask_action_list>"

    blocks = "\n\n".join(["\n".join(progress), "\n".join(current), action_list])
    return f"{blocks}\n{GUIDANCE_LINE}"


# ---------------------------------------------------------------------------
# Completion-signal detection
# ---------------------------------------------------------------------------
_BLOCK_RE = re.compile(r"<tool_call>.*?</tool_call>", re.IGNORECASE | re.DOTALL)

# Models mix `.` and `_` in tool names.
_SC_ALT = r"(?:subtask_complete|subtask\.complete)"

# Same signal, different serialisations per server and chat template.
_SC_PATTERNS = [
    re.compile(pattern.replace("{name}", _SC_ALT), re.IGNORECASE | re.DOTALL)
    for pattern in (
        r'<tool_call>[^<]*"name"\s*:\s*"{name}"[^<]*>',
        r'"action"\s*:\s*"{name}"',
        r"<parameter\s*=\s*action>\s*{name}\s*</parameter>",
        r"```[\s\S]*?{name}\s*\(.*?\)[\s\S]*?```",
        r"\b{name}\s*\(",
    )
]


def detect_subtask_complete(response: str) -> bool:
    """Matched inside ``<tool_call>`` blocks only, so narration that merely mentions
    the report cannot advance the pointer."""
    search_text = "\n".join(_BLOCK_RE.findall(response or ""))
    return bool(search_text) and any(p.search(search_text) for p in _SC_PATTERNS)


# ---------------------------------------------------------------------------
# Agent-side consumer
# ---------------------------------------------------------------------------
def patch_tools_schema(
    tools_def: Optional[Dict[str, Any]], obs: Optional[Dict[str, Any]]
) -> Optional[Dict[str, Any]]:
    """Fold ``obs[OBS_ACTION_PATCH]`` into a computer_use schema (in place; no-op if absent)."""
    if not isinstance(obs, dict) or not isinstance(tools_def, dict):
        return tools_def
    patch = obs.get(OBS_ACTION_PATCH)
    if not isinstance(patch, dict):
        return tools_def
    try:
        properties = tools_def["function"]["parameters"]["properties"]
        action = properties["action"]
    except (KeyError, TypeError):
        logger.warning("%s present but tools_def is not a computer_use schema; skipping.",
                       OBS_ACTION_PATCH)
        return tools_def

    enum = action.setdefault("enum", [])
    for name in patch.get("action_enum") or []:
        if name not in enum:
            enum.append(name)
    extra_description = patch.get("action_description")
    if extra_description:
        action["description"] = (
            (action.get("description", "") or "") + "\n" + extra_description
        ).strip("\n")
    extra_properties = patch.get("extra_properties")
    if isinstance(extra_properties, dict):
        properties.update(extra_properties)
    return tools_def


# ---------------------------------------------------------------------------
# Workflow driver
# ---------------------------------------------------------------------------
class DemoWorkflow:
    """Tracks which subtask of a demonstration is being executed.

    The pointer only moves on a reported completion, so finishing a subtask advances
    the workflow instead of ending the episode.
    """

    def __init__(self, plan: WorkflowPlan):
        if not plan.subtasks:
            raise ValueError("a workflow plan needs at least one subtask")
        self.plan = plan
        self._index = 0
        self._await_finish = False

    @classmethod
    def from_path(cls, path: Union[str, Path]) -> "DemoWorkflow":
        """Build from a demo file, or from a directory holding one."""
        return cls(load_plan(path))

    # -- state ---------------------------------------------------------------

    @property
    def current_index(self) -> int:
        return self._index

    @property
    def is_last(self) -> bool:
        return self._index >= len(self.plan.subtasks) - 1

    @property
    def progress(self) -> str:
        goal = (self.plan.subtasks[self._index].goal or "").strip()
        return f"subtask {self._index + 1}/{len(self.plan.subtasks)}: {goal}"

    def reset(self) -> None:
        self._index = 0
        self._await_finish = False

    # -- per-step hooks ------------------------------------------------------

    def decorate_obs(self, obs: Dict[str, Any]) -> Dict[str, Any]:
        """Return a copy of ``obs`` carrying this step's guidance."""
        return {
            **obs,
            OBS_GUIDANCE: build_guidance(self.plan, self._index),
            OBS_SYSTEM_PROMPT: WORKFLOW_SYSTEM_SECTION,
            OBS_ACTION_PATCH: SUBTASK_COMPLETE_PATCH,
        }

    def after_predict(self, response: str, actions: List[str]) -> List[str]:
        """Advance the pointer on a completion report, and keep that step harmless."""
        if detect_subtask_complete(response):
            if not self.is_last:
                self._await_finish = False
                self._index += 1
                return ["WAIT"]
            # Trained to emit `finished` one turn later, so give it that turn.
            if self._await_finish:
                return ["DONE"]
            self._await_finish = True
            return ["WAIT"]
        self._await_finish = False
        # The model mistook a subtask for the whole task; advancing beats an early exit.
        if not self.is_last and any(action == "DONE" for action in actions):
            self._index += 1
            return ["WAIT"]
        return actions


__all__ = [
    "DemoWorkflow",
    "GUIDANCE_LINE",
    "OBS_ACTION_PATCH",
    "OBS_GUIDANCE",
    "OBS_SYSTEM_PROMPT",
    "SUBTASK_COMPLETE_ACTION",
    "SUBTASK_COMPLETE_PATCH",
    "Subtask",
    "WORKFLOW_SYSTEM_SECTION",
    "WorkflowPlan",
    "build_guidance",
    "detect_subtask_complete",
    "load_plan",
    "patch_tools_schema",
]
