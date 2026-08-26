"""
UI-Mate PromptV2 — evaluation-only variant.

One change on top of the base UI-Mate agent:
  1. Add Claude 4.7 prompt additions to the system prompt (copied from the
     official OSWorld mm_agents/anthropic/utils.py CLAUDE_47_PROMPT_ADDITIONS):
       - Do not use LibreOffice macros / GIMP Script-Fu; always use the GUI
       - For GIMP tasks, do not save/export unless explicitly asked
       - If the app's native GUI cannot do the task, declare it infeasible
         instead of bypassing via CLI/scripts/other apps
       - After finishing, verify the visible result; if nothing changed,
         reconsider whether the task is infeasible
"""

import base64
import json
import logging
import os
from io import BytesIO
from typing import Dict, List, Optional, Tuple

from PIL import Image

# Reuse all shareable pieces from the parent module
# (image processing / collapse / history compact / coords / XML parse / pyautogui).
from mm_agents.ui_mate import (
    UIMateAgent,
    process_image,
    _collapse_messages,
    _compact_response_for_history,
    _build_description_prompt,
    _get_r3_tools_def,
    _build_tools_and_format_block,
    parse_response,
)

logger = None


# keep-first-image collapse (promptv2-local; do not change the base file)
def _collapse_messages_keep_first(messages, images_to_keep=10, min_removal_threshold=10,
                                  collapse_text="This screenshot has been collapsed."):
    """Keep the first image (step0) plus the latest images_to_keep images (+1 total; vLLM limit needs +1). Reuses base _collapse_messages."""
    for msg in messages:
        if msg.get("role") != "user" or not isinstance(msg.get("content"), list):
            continue
        idx = next((i for i, b in enumerate(msg["content"])
                    if isinstance(b, dict) and b.get("type") == "image_url"), None)
        if idx is None:
            continue
        first_block = msg["content"].pop(idx)   # Pull out the first image so the base collapser will not drop it.
        messages, collapsed = _collapse_messages(
            messages, images_to_keep=images_to_keep,
            min_removal_threshold=min_removal_threshold, collapse_text=collapse_text)
        msg["content"].insert(0, first_block)    # Put it back in place.
        return messages, collapsed
    return _collapse_messages(
        messages, images_to_keep=images_to_keep,
        min_removal_threshold=min_removal_threshold, collapse_text=collapse_text)


# ============================================================================
# Claude 4.7 prompt additions (copied from OSWorld mm_agents/anthropic/utils.py)
# ============================================================================
CLAUDE_47_PROMPT_ADDITIONS = """<IMPORTANT_NOTES>
* DO NOT use LibreOffice macros or GIMP Script-Fu to complete tasks. Always use the GUI interface directly with mouse and keyboard actions. Macros and scripting cause reliability issues and task failures.
* For GIMP tasks, do NOT save or export files unless the instruction explicitly asks you to. Note that existing tasks that require file output will ask you to "export", not "save". Most GIMP tasks are evaluated automatically without requiring you to save.
* Before starting a task, consider whether it is achievable with the designated application's native GUI features. If the app fundamentally lacks the requested capability, declare it infeasible (finish with status=failure) instead of using CLI tools, Python scripts, or other applications as workarounds.
* After completing a task, verify the visible or functional result. If your actions had no real effect, reconsider whether the task is feasible.
</IMPORTANT_NOTES>"""


def get_system_message_l1_v2() -> str:
    desc = _build_description_prompt()
    tools_def = _get_r3_tools_def(desc)
    tools_block = _build_tools_and_format_block(tools_def)
    return (
        "You are a helpful GUI agent.\n\n"
        + tools_block + "\n\n"
        + CLAUDE_47_PROMPT_ADDITIONS + "\n\n"
        "# Response format\n\n"
        "Response format for every step:\n"
        "1) Action: A single <action>...</action> block containing a short imperative describing what to do in the UI.\n"
        "2) A single or multiple <tool_call>...</tool_call> blocks.\n\n"
        "Rules:\n"
        "- Output exactly in the order: <action>...</action>, <tool_call>...</tool_call>.\n"
        "- Be brief: one sentence for action description.\n"
        "- Do not output anything else outside those parts.\n"
        "- If finishing, use action=finished in the tool call. If the task is infeasible, finish with status=failure."
    ).strip()


def get_system_message_l2_v2() -> str:
    desc = _build_description_prompt()
    tools_def = _get_r3_tools_def(desc)
    tools_block = _build_tools_and_format_block(tools_def)
    return (
        "You are a helpful GUI agent.\n\n"
        + tools_block + "\n\n"
        + CLAUDE_47_PROMPT_ADDITIONS + "\n\n"
        "# Response format\n\n"
        "Response format for every step:\n"
        "1) Thought: A single <think>...</think> block containing step by step progress assessment and next action analysis.\n"
        "2) Action: A single <action>...</action> block containing a short imperative describing what to do in the UI.\n"
        "3) Tool Execution: A single or multiple <tool_call>...</tool_call> blocks.\n\n"
        "Rules:\n"
        "- Output exactly in the order: <think>...</think>, <action>...</action>, <tool_call>...</tool_call>.\n"
        "- From a first-person perspective, systematically assess progress and errors, evaluate potential next steps, and precisely plan text inputs (cursor position and expected outcomes)\n"
        "- Be brief for Action: one sentence for action description.\n"
        "- Do not output anything else outside those parts.\n"
        "- If finishing, use action=finished in the tool call. If the task is infeasible, finish with status=failure."
    ).strip()


def get_system_message_l3_v2() -> str:
    desc = _build_description_prompt()
    tools_def = _get_r3_tools_def(desc)
    tools_block = _build_tools_and_format_block(tools_def)
    return (
        "You are a helpful GUI agent.\n\n"
        + tools_block + "\n\n"
        + CLAUDE_47_PROMPT_ADDITIONS + "\n\n"
        "# Response format\n\n"
        "Response format for every step:\n"
        "1) Observation: A single <observation>...</observation> block describing the current computer state based on the full screenshot.\n"
        "2) Thought: A single <think>...</think> block containing step by step progress assessment and next action analysis.\n"
        "3) Action: A single <action>...</action> block containing a short imperative describing what to do in the UI.\n"
        "4) Tool Execution: A single or multiple <tool_call>...</tool_call> blocks.\n\n"
        "Rules:\n"
        "- Output exactly in the order: <observation>...</observation>, <think>...</think>, <action>...</action>, <tool_call>...</tool_call>.\n"
        "- For Observation: provide a detailed visual audit of the current state, identifying active applications, interface layouts, and all UI elements or clues relevant to the task goal.\n"
        "- For Thought: from a first-person perspective, systematically assess progress and errors, evaluate potential next steps, and precisely plan text inputs (cursor position and expected outcomes)\n"
        "- Be brief for Action: one sentence for action description.\n"
        "- Do not output anything else outside those parts.\n"
        "- If finishing, use action=finished in the tool call. If the task is infeasible, finish with status=failure."
    ).strip()


def _build_system_prompt_v2(prompt_type: str = "l1") -> str:
    if prompt_type == "l1":
        return get_system_message_l1_v2()
    elif prompt_type == "l2":
        return get_system_message_l2_v2()
    elif prompt_type == "l3":
        return get_system_message_l3_v2()
    else:
        raise ValueError(f"Invalid prompt type: {prompt_type}")


# ============================================================================
# Agent class
# ============================================================================
class UIMatePromptV2Agent(UIMateAgent):
    """Same behavior as the base UI-Mate agent, with a different system prompt and history collapse."""

    def __init__(self, *args, recent_think_steps: Optional[int] = None,
                 keep_first_image: bool = True, **kwargs):
        # recent_think_steps: keep <think> only for the newest N history steps
        # and strip older ones (same meaning as the training converter).
        # None = no truncation (keep all when include_thinking_in_history=True).
        # The old base __init__ does not take this argument, so absorb it here
        # before calling super.
        # keep_first_image: always keep the first image (step0) when collapsing;
        # default True; promptv2-only.
        super().__init__(*args, **kwargs)
        self.recent_think_steps = recent_think_steps
        self.keep_first_image = keep_first_image

    def _build_system_prompt(self) -> str:
        """System-prompt build hook (subclasses may override). Default behavior is unchanged."""
        return _build_system_prompt_v2(self.prompt_type)

    def predict(self, instruction: str, obs: Dict) -> Tuple[str, List[str]]:
        screenshot_bytes = obs["screenshot"]

        original_img = Image.open(BytesIO(screenshot_bytes))
        original_width, original_height = original_img.size

        processed_b64 = process_image(screenshot_bytes)
        processed_img = Image.open(BytesIO(base64.b64decode(processed_b64)))
        processed_width, processed_height = processed_img.size

        self.screenshots.append(processed_b64)
        total_steps = len(self.screenshots)

        start_step = max(1, total_steps - self.history_n)

        for _i in range(start_step - 1):
            if self.screenshots[_i] is not None:
                self.screenshots[_i] = None

        previous_actions = [
            f"Step {i + 1}: {self.actions[i]}"
            for i in range(0, min(start_step - 1, len(self.actions)))
        ]
        previous_actions_str = "\n".join(previous_actions) if previous_actions else "None"

        # Change 1: v2 system prompt (via hook, subclasses may override)
        system_prompt = self._build_system_prompt()

        instruction_prompt = (
            f"\nPlease generate the next move according to the UI screenshot, instruction and previous actions.\n\n"
            f"Instruction: {instruction}\n\n"
            f"Previous actions:\n"
            f"{previous_actions_str}"
        )

        messages: List[Dict] = [
            {"role": "system", "content": [{"type": "text", "text": system_prompt}]}
        ]

        for step_num in range(start_step, total_steps + 1):
            is_first_turn = step_num == start_step
            screenshot_data = self.screenshots[step_num - 1]

            if screenshot_data is None:
                if is_first_turn:
                    user_content = [{"type": "text", "text": instruction_prompt}]
                else:
                    user_content = self._wrap_tool_response(
                        [{"type": "text", "text": self.collapse_text}]
                    )
            else:
                img_url = f"data:image/png;base64,{screenshot_data}"
                if is_first_turn:
                    user_content = [
                        {"type": "image_url", "image_url": {"url": img_url}},
                        {"type": "text", "text": instruction_prompt},
                    ]
                else:
                    user_content = self._wrap_tool_response(
                        [{"type": "image_url", "image_url": {"url": img_url}}]
                    )
            messages.append({"role": "user", "content": user_content})

            if step_num <= total_steps - 1 and (step_num - 1) < len(self.responses):
                step_include_thinking = self.include_thinking_in_history
                if step_include_thinking and self.recent_think_steps is not None:
                    distance_from_newest_hist = (total_steps - 1) - step_num
                    if distance_from_newest_hist >= self.recent_think_steps:
                        step_include_thinking = False
                compact_resp = _compact_response_for_history(
                    self.responses[step_num - 1],
                    include_observation=self.include_observation_in_history,
                    include_thinking=step_include_thinking,
                    prompt_type=self.prompt_type,
                )
                messages.append(
                    {"role": "assistant", "content": [{"type": "text", "text": compact_resp}]}
                )

        _traj_save_snapshot = False
        # keep_first_image=True uses keep-first collapse; otherwise fall back to the base collapser.
        _collapse = _collapse_messages_keep_first if getattr(self, "keep_first_image", True) else _collapse_messages
        if self.enable_traj_slice:
            turn_idx = len(self.responses) + 1
            interval = self.traj_slice_interval
            if self.collapsed_message_count > 0:
                messages = self._apply_permanent_collapses(messages)
            if interval > 1:
                if (turn_idx % interval == 0) and (turn_idx >= interval * 2):
                    _traj_save_snapshot = True
                elif (turn_idx % interval == 1) and (turn_idx > interval * 2):
                    messages, _collapsed = _collapse(
                        messages,
                        images_to_keep=interval,
                        min_removal_threshold=interval,
                        collapse_text=self.collapse_text,
                    )
                    if _collapsed:
                        self.collapsed_message_count += interval

        messages, _ = _collapse(
            messages,
            images_to_keep=self.images_to_keep,
            min_removal_threshold=1,
            collapse_text=self.collapse_text,
        )

        try:
            draft_dir = "./draft/message_cache"
            os.makedirs(draft_dir, exist_ok=True)
            step_idx = total_steps - 1
            path = os.path.join(draft_dir, f"ui_mate_promptv2_messages_step_{step_idx}.json")
            with open(path, "w", encoding="utf-8") as f:
                json.dump(self._sanitize_messages_for_dump(messages), f, ensure_ascii=False, indent=2)
        except Exception:
            pass

        response = self.call_llm(
            {
                "model": self.model,
                "messages": messages,
                "max_tokens": self.max_tokens,
            },
            self.model,
        )

        if logger:
            logger.debug(
                "UI-Mate PromptV2 response received (%d characters)",
                len(response or ""),
            )
        self.responses.append(response or "")

        if self.enable_traj_slice:
            _asst_msg = {"role": "assistant", "content": [{"type": "text", "text": response or ""}]}
            _msgs_to_save = list(messages) + [_asst_msg]
            if _traj_save_snapshot:
                self._save_message_snapshot(_msgs_to_save, self.collapsed_message_count)
            self.full_messages_history = [{
                "messages_to_save": _msgs_to_save,
                "collapsed_length": self.collapsed_message_count,
            }]

        low_level_instruction, pyautogui_code = parse_response(
            response or "",
            original_width,
            original_height,
            self.coordinate_type,
        )

        if logger:
            logger.info("Low level instruction: %s", low_level_instruction)
            logger.info("Pyautogui code: %s", pyautogui_code)

        self.actions.append(low_level_instruction)
        return response or "", pyautogui_code

    def reset(self, _logger=None, *args, **kwargs):
        global logger
        logger = _logger if _logger is not None else logging.getLogger("desktopenv.ui_mate_promptv2")
        # Reuse the parent class state reset.
        super().reset(_logger=_logger, *args, **kwargs)
        # Tolerate older base classes that lack recent_think_steps
        # (only the leonscoutli version has it). predict() reads it only when
        # include_thinking_in_history=True; promptv2 defaults that to False, so
        # this path is unused, but the default still avoids AttributeError when
        # inheriting the old base.
        if not hasattr(self, "recent_think_steps"):
            self.recent_think_steps = None
