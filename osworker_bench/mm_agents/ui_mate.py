"""
UI-Mate agent implementation.

Combines:
- UI-Mate's action space, l1/l2/l3 prompt structure, and PyAutoGUI conversion.
- UI-Mate's XML tool-call format, <tool_response> message wrapping,
  history collapse mechanism, and OpenAI-compatible API backend.
"""

import base64
import json
import logging
import os
import re
from io import BytesIO
from typing import Dict, List, Optional, Tuple

from PIL import Image

from core.llm import GenParams, LLMClient, OpenAIClient
from mm_agents.utils.vision_utils import smart_resize
from workflow.consume import apply_workflow_obs, patch_tools_schema

logger = None


# ============================================================================
# Image processing
# ============================================================================

def process_image(image_bytes: bytes) -> str:
    """Resize + re-encode screenshot and return base64 PNG."""
    image = Image.open(BytesIO(image_bytes))
    width, height = image.size
    resized_height, resized_width = smart_resize(
        height=height, width=width, factor=32,
        max_pixels=16 * 16 * 4 * 12800,
    )
    image = image.resize((resized_width, resized_height))
    buffer = BytesIO()
    image.save(buffer, format="PNG")
    return base64.b64encode(buffer.getvalue()).decode("utf-8")


# ============================================================================
# Screenshot collapse mechanism
# ============================================================================

def _collapse_messages(messages, images_to_keep=10, min_removal_threshold=10,
                       collapse_text="This screenshot has been collapsed."):
    """Remove oldest image blocks from user messages to reduce context size."""
    if not messages or images_to_keep is None:
        return messages, False

    total_images = 0
    for msg in messages:
        if msg.get("role") != "user":
            continue
        content = msg.get("content")
        if not isinstance(content, list):
            continue
        for block in content:
            if isinstance(block, dict) and block.get("type") == "image_url":
                total_images += 1

    images_to_remove = total_images - images_to_keep
    images_to_remove -= images_to_remove % min_removal_threshold

    if images_to_remove <= 0:
        return messages, False

    remaining_to_remove = images_to_remove
    collapsed_any = False

    for msg in messages:
        if remaining_to_remove <= 0:
            break
        if msg.get("role") != "user":
            continue
        content = msg.get("content")
        if not isinstance(content, list):
            continue

        has_text = any(
            isinstance(block, dict) and block.get("type") == "text"
            for block in content
        )
        new_content = []
        removed_here = 0
        for block in content:
            if (isinstance(block, dict) and block.get("type") == "image_url"
                    and remaining_to_remove > 0):
                remaining_to_remove -= 1
                removed_here += 1
                continue
            new_content.append(block)

        if removed_here > 0:
            collapsed_any = True
            remaining_text = ''.join(
                block.get("text", "")
                for block in new_content
                if isinstance(block, dict) and block.get("type") == "text"
            ).strip()

            text_normalized = remaining_text.replace('\n', '').replace(' ', '').replace('\t', '').replace('\r', '')
            is_empty_or_xml_only = (
                not remaining_text or
                text_normalized == "<tool_response></tool_response>" or
                text_normalized == ""
            )

            if not has_text or is_empty_or_xml_only:
                is_xml_format = "<tool_response>" in remaining_text
                if is_xml_format:
                    placeholder_text = "<tool_response>\n" + collapse_text + "\n</tool_response>"
                else:
                    placeholder_text = collapse_text
                new_content = [{"type": "text", "text": placeholder_text}]
            else:
                new_content = [{"type": "text", "text": collapse_text}] + new_content
            msg["content"] = new_content

        if remaining_to_remove <= 0:
            break

    return messages, collapsed_any


# ============================================================================
# UI-Mate action space and tool definition
# ============================================================================

def _get_r3_action_description():
    """UI-Mate action descriptions."""
    return """* `left_click`: Click the left mouse button at the specified (x, y) coordinate.
* `right_click`: Click the right mouse button at the specified (x, y) coordinate.
* `middle_click`: Click the middle mouse button at the specified (x, y) coordinate.
* `double_click`: Double-click the left mouse button at the specified (x, y) coordinate.
* `triple_click`: Triple-click the left mouse button at a specified (x, y) coordinate.
* `drag`: Click and drag the mouse cursor from its current position to the specified (x, y) coordinate.
* `mouse_move`: Move the cursor to the specified (x, y) coordinate without clicking.
* `type`: Type a specified string of text.
* `hotkey`: Press a combination of keys (e.g., ["ctrl", "v"]).
* `press`: Press a single key or a sequence of keys, provided as an array of strings (e.g., ["backspace"], ["enter"], ["a", "b", "c"]).
* `key_down`: Press and HOLD the specified key(s) down in order (no release). Use this for stateful holds like holding Shift while clicking.
* `key_up`: Release the specified key(s) in reverse order.
* `scroll`: Scroll the mouse wheel by a specified number of pixels. Use "direction" to specify vertical (default, positive for up, negative for down) or horizontal (positive for right, negative for left) scrolling.
* `wait`: Pause execution for a specified number of seconds.
* `finished`: Terminate the task and indicate whether it was a 'success' or 'failure'."""


def _get_r3_tools_def(description_prompt: str):
    """Build the UI-Mate tool definition."""
    action_description = _get_r3_action_description()
    return {
        "type": "function",
        "function": {
            "name": "computer_use",
            "description": description_prompt,
            "parameters": {
                "properties": {
                    "action": {
                        "description": action_description,
                        "enum": [
                            "left_click", "right_click", "middle_click",
                            "double_click", "triple_click", "drag", "mouse_move",
                            "type", "hotkey", "press", "key_down", "key_up",
                            "scroll", "wait", "finished",
                        ],
                        "type": "string",
                    },
                    "coordinate": {
                        "description": "The (x, y) coordinates (0-999). Required for: clicks, mouse_move, drag.",
                        "type": "array",
                    },
                    "text": {
                        "description": "The text to type. Required only for `action=type`.",
                        "type": "string",
                    },
                    "keys": {
                        "description": "An array of key names (e.g. ['a'], ['ctrl', 'c']). Required for: hotkey, press, key_down, key_up.",
                        "type": "array",
                    },
                    "pixels": {
                        "description": "The number of pixels to scroll. Required only for `action=scroll`.",
                        "type": "number",
                    },
                    "direction": {
                        "description": "The scroll direction. 'vertical' (default) for up/down scrolling, 'horizontal' for left/right scrolling. Required only for `action=scroll`.",
                        "type": "string",
                        "enum": ["vertical", "horizontal"]
                    },
                    "time": {
                        "description": "Seconds to wait. Required only for `action=wait`.",
                        "type": "number",
                    },
                    "status": {
                        "description": "The outcome of the task. Required only for `action=finished`.",
                        "type": "string",
                        "enum": ["success", "failure"],
                    },
                },
                "required": ["action"],
                "type": "object",
            },
        },
    }


# ============================================================================
# System prompt builders for L1 / L2 / L3
# Uses UI-Mate's XML tool-call format and prompt structure.
# ============================================================================

def _build_description_prompt():
    """Environment description lines (shared across L1/L2/L3)."""
    lines = [
        "Use a mouse and keyboard to interact with a computer, and take screenshots.",
        "* This is an interface to a desktop GUI. You do not have access to a terminal or applications menu. You must click on desktop icons to start applications.",
        "* Some applications may take time to start or process actions, so you may need to wait and take successive screenshots to see the results of your actions. E.g. if you click on Firefox and a window doesn't open, try wait and taking another screenshot.",
        "* The screen's resolution is 1000x1000.",
        "* Whenever you intend to move the cursor to click on an element like an icon, you should consult a screenshot to determine the coordinates of the element before moving the cursor.",
        "* If you tried clicking on a program or link but it failed to load even after waiting, try adjusting your cursor position so that the tip of the cursor visually falls on the element that you want to click.",
        "* Make sure to click any buttons, links, icons, etc with the cursor tip in the center of the element. Don't click boxes on their edges unless asked.",
    ]
    return "\n".join(lines)


def _build_tools_and_format_block(tools_def: dict) -> str:
    """Build UI-Mate tools and XML-format instructions."""
    return (
        "# Tools\n\n"
        "You have access to the following functions:\n\n"
        "<tools>\n"
        + json.dumps(tools_def)
        + "\n</tools>\n\n"
        "If you choose to call a function ONLY reply in the following format with NO suffix:\n\n"
        "<tool_call>\n"
        "<function=example_function_name>\n"
        "<parameter=example_parameter_1>\n"
        "value_1\n"
        "</parameter>\n"
        "<parameter=example_parameter_2>\n"
        "This is the value for the second parameter\n"
        "that can span\n"
        "multiple lines\n"
        "</parameter>\n"
        "</function>\n"
        "</tool_call>\n\n"
        "<IMPORTANT>\n"
        "Reminder:\n"
        "- Function calls MUST follow the specified format: an inner <function=...></function> block must be nested within <tool_call></tool_call> XML tags\n"
        "- Required parameters MUST be specified\n"
        "- You may provide optional reasoning for your function call in natural language BEFORE the function call, but NOT after\n"
        "- If there is no function call available, answer the question like normal with your current knowledge and do not tell the user about function calls\n"
        "</IMPORTANT>"
    )


def get_system_message_l1(tools_def: dict) -> str:
    """L1: Action + Tool Call only."""
    tools_block = _build_tools_and_format_block(tools_def)

    return (
        "You are a helpful GUI agent.\n\n"
        + tools_block + "\n\n"
        "# Response format\n\n"
        "Response format for every step:\n"
        "1) Action: A single <action>...</action> block containing a short imperative describing what to do in the UI.\n"
        "2) A single or multiple <tool_call>...</tool_call> blocks.\n\n"
        "Rules:\n"
        "- Output exactly in the order: <action>...</action>, <tool_call>...</tool_call>.\n"
        "- Be brief: one sentence for action description.\n"
        "- Do not output anything else outside those parts.\n"
        "- If finishing, use action=finished in the tool call."
    ).strip()


def get_system_message_l2(tools_def: dict) -> str:
    """L2: Think + Action + Tool Call."""
    tools_block = _build_tools_and_format_block(tools_def)

    return (
        "You are a helpful GUI agent.\n\n"
        + tools_block + "\n\n"
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
        "- If finishing, use action=finished in the tool call."
    ).strip()


def get_system_message_l3(tools_def: dict) -> str:
    """L3: Observation + Think + Action + Tool Call."""
    tools_block = _build_tools_and_format_block(tools_def)

    return (
        "You are a helpful GUI agent.\n\n"
        + tools_block + "\n\n"
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
        "- If finishing, use action=finished in the tool call."
    ).strip()


def _build_system_prompt(prompt_type: str, tools_def: dict) -> str:
    if prompt_type == "l1":
        return get_system_message_l1(tools_def)
    elif prompt_type == "l2":
        return get_system_message_l2(tools_def)
    elif prompt_type == "l3":
        return get_system_message_l3(tools_def)
    else:
        raise ValueError(f"Invalid prompt type: {prompt_type}")


# ============================================================================
# Response parsing helpers adapted for XML tool calls.
# ============================================================================

def _extract_action_text(response: str) -> str:
    match = re.search(r"<action>\s*(.*?)\s*</action>", response, re.DOTALL | re.IGNORECASE)
    if not match:
        return ""
    return match.group(1).strip()


def _compact_response_for_history(
    response: str,
    include_observation: bool = False,
    include_thinking: bool = False,
    prompt_type: str = "l1",
) -> str:
    """Trim response for history: optionally strip observation/thinking blocks."""
    if include_observation:
        assert prompt_type in ["l3"], "Observation is only supported for prompt type l3"
        match = re.search(r"<observation\b[^>]*>", response, re.IGNORECASE)
        if not match:
            return response
        return response[match.start():].strip()

    if include_thinking:
        assert prompt_type in ["l2", "l3"], "Thinking is only supported for prompt type l2 and l3"
        match = re.search(r"<think\b[^>]*>", response, re.IGNORECASE)
        if not match:
            return response
        return response[match.start():].strip()

    # Only keep from <action> onwards
    match = re.search(r"<action\b[^>]*>", response, re.IGNORECASE)
    if not match:
        return response
    return response[match.start():].strip()


# ============================================================================
# XML tool-call parsing
# ============================================================================

def _parse_xml_tool_call(xml_content: str) -> Optional[Dict]:
    """Parse a UI-Mate XML tool call into a flat params dict."""
    params: Dict = {}
    func_match = re.search(r"<function=([^>]+)>", xml_content)
    if not func_match or func_match.group(1) != "computer_use":
        return None

    for match in re.finditer(r"<parameter=([^>]+)>\s*(.*?)\s*</parameter>", xml_content, re.DOTALL):
        name = match.group(1)
        value = match.group(2).strip()
        if value.startswith("[") or value.startswith("{"):
            try:
                params[name] = json.loads(value)
                continue
            except json.JSONDecodeError:
                pass
        params[name] = value
    return params


def _extract_xml_tool_calls(response: str) -> List[Dict]:
    """Extract all XML tool_call blocks from response."""
    results = []
    for m in re.finditer(r"<tool_call>(.*?)\</tool_call\>", response, re.DOTALL):
        params = _parse_xml_tool_call(m.group(1))
        if params:
            results.append(params)
    return results


# ============================================================================
# PyAutoGUI action conversion.
# ============================================================================

def _scale_coordinate(x: float, y: float, original_width: int, original_height: int, coordinate_type: str) -> Tuple[int, int]:
    if coordinate_type == "absolute":
        return int(x), int(y)
    x_scale = original_width / 999.0
    y_scale = original_height / 999.0
    return int(x * x_scale), int(y * y_scale)


def _clean_keys(raw_keys):
    keys = raw_keys if isinstance(raw_keys, list) else [raw_keys]
    cleaned_keys = []
    for key in keys:
        if isinstance(key, str):
            if key.startswith("keys=["):
                key = key[6:]
            if key.endswith("]"):
                key = key[:-1]
            if key.startswith("['") or key.startswith('["'):
                key = key[2:] if len(key) > 2 else key
            if key.endswith("']") or key.endswith('"]'):
                key = key[:-2] if len(key) > 2 else key
            key = key.strip()
            cleaned_keys.append(key)
        else:
            cleaned_keys.append(key)
    return cleaned_keys


def _to_pyautogui_code(
    action: str,
    args: dict,
    original_width: int,
    original_height: int,
    coordinate_type: str,
) -> str:
    """Convert a parsed action + args dict to pyautogui code string(s).
    Convert a normalized coordinate to screen pixels.
    """
    adj_x, adj_y = None, None
    if action in ("left_click", "click", "right_click", "middle_click",
                   "double_click", "triple_click", "drag", "mouse_move"):
        if "coordinate" in args and isinstance(args["coordinate"], (list, tuple)) and len(args["coordinate"]) >= 2:
            x, y = args["coordinate"][:2]
            adj_x, adj_y = _scale_coordinate(float(x), float(y), original_width, original_height, coordinate_type)

    if action in ["left_click", "click"]:
        return f"pyautogui.click({adj_x}, {adj_y})" if adj_x is not None else "pyautogui.click()"

    if action == "right_click":
        return f"pyautogui.rightClick({adj_x}, {adj_y})" if adj_x is not None else "pyautogui.rightClick()"

    if action == "middle_click":
        return f"pyautogui.middleClick({adj_x}, {adj_y})" if adj_x is not None else "pyautogui.middleClick()"

    if action == "double_click":
        return f"pyautogui.doubleClick({adj_x}, {adj_y})" if adj_x is not None else "pyautogui.doubleClick()"

    if action == "triple_click":
        return f"pyautogui.tripleClick({adj_x}, {adj_y})" if adj_x is not None else "pyautogui.tripleClick()"

    if action == "drag":
        duration = args.get("duration", 0.5)
        if adj_x is not None:
            return f"pyautogui.dragTo({adj_x}, {adj_y}, duration={duration})" if duration else f"pyautogui.dragTo({adj_x}, {adj_y})"
        return "pyautogui.dragTo(0, 0)"

    if action == "mouse_move":
        return f"pyautogui.moveTo({adj_x}, {adj_y})" if adj_x is not None else "pyautogui.moveTo(0, 0)"

    if action == "type":
        text = args.get("text", "")
        try:
            text = text.encode('latin-1', 'backslashreplace').decode('unicode_escape')
        except Exception:
            pass

        code_str = ""
        for char in text:
            if char == '\n':
                code_str += "pyautogui.press('enter')\n"
            elif char == "'":
                code_str += 'pyautogui.press("\'")\n'
            elif char == '\\':
                code_str += "pyautogui.press('\\\\')\n"
            elif char == '"':
                code_str += "pyautogui.press('\"')\n"
            else:
                code_str += f"pyautogui.press('{char}')\n"
        return code_str

    if action == "hotkey":
        keys = args.get("keys", [])
        if isinstance(keys, str):
            keys = keys.split("+")
            keys = [k.strip() for k in keys]
        if isinstance(keys, list):
            cleaned = []
            for key in keys:
                if isinstance(key, str):
                    if "+" in key and key != "+":
                        cleaned.extend([k.strip() for k in key.split("+")])
                    else:
                        cleaned.append(key.strip())
                else:
                    cleaned.append(key)
            keys = cleaned
        elif keys is not None:
            keys = [keys]
        else:
            keys = []
        keys_str = ", ".join([f"'{k}'" for k in keys])
        return f"pyautogui.hotkey({keys_str})" if len(keys) > 1 else f"pyautogui.press({keys_str})"

    if action == "press":
        keys = args.get("keys", [])
        if isinstance(keys, list):
            keys = _clean_keys(keys)
        elif keys is not None:
            keys = [keys]
        else:
            keys = []
        if len(keys) == 1:
            return f"pyautogui.press({repr(keys[0])})"
        return f"pyautogui.press({repr(keys)})"

    if action == "key_down":
        keys = _clean_keys(args.get("keys", []))
        return [f"pyautogui.keyDown('{k}')" for k in keys]

    if action == "key_up":
        keys = _clean_keys(args.get("keys", []))
        return [f"pyautogui.keyUp('{k}')" for k in reversed(keys)]
    
    if action in ["sroll", "scroll"]:
        pixels = args.get("pixels", 0)
        direction = args.get("direction", "vertical")
        if direction == "horizontal":
            return f"pyautogui.hscroll({pixels})"
        return f"pyautogui.scroll({pixels})"

    if action == "wait":
        return "WAIT"

    if action == "finished":
        status = str(args.get("status", "")).lower()
        return "DONE" if status in ["success", "successful", "yes", "ok"] else "FAIL"

    return ""


def parse_response(
    response: str,
    original_width: int,
    original_height: int,
    coordinate_type: str,
) -> Tuple[str, List[str]]:
    """Parse LLM response: extract <action> + XML <tool_call> → pyautogui codes.
    
    Converts UI-Mate XML tool calls to PyAutoGUI actions.
    """
    low_level_instruction = _extract_action_text(response)
    if not low_level_instruction:
        return "<Error>: no <action> block found in response", ["FAIL"]

    tool_calls = _extract_xml_tool_calls(response)
    if not tool_calls:
        return "<Error>: no <tool_call> blocks found in response", ["FAIL"]

    pyautogui_codes: List[str] = []
    for params in tool_calls:
        action = params.get("action")
        if not action:
            pyautogui_codes.append("FAIL")
            continue

        if action in ("subtask_complete", "subtask.complete"):
            # The hook rewrites the action list off the raw response, so this only has
            # to keep the step harmless instead of scoring it as a parse failure.
            pyautogui_codes.append("WAIT")
            continue

        code = _to_pyautogui_code(action, params, original_width, original_height, coordinate_type)
        if not code:
            pyautogui_codes.append("FAIL")
            continue

        if isinstance(code, list):
            pyautogui_codes.extend(code)
        else:
            pyautogui_codes.append(code)

    if not pyautogui_codes:
        return "<Error>: no pyautogui code generated", ["FAIL"]

    # Merge multiple generated actions.
    if len(pyautogui_codes) > 1:
        has_modifier = any("'ctrl'" in c or "'shift'" in c for c in pyautogui_codes
                           if "keyDown" in c or "keyUp" in c)
        force_join = any(k in c for c in pyautogui_codes
                         for k in ("'enter'", "'backspace'", "'tab'", "'space'"))
        if not has_modifier or force_join:
            return low_level_instruction, ["\n".join(pyautogui_codes)]

    return low_level_instruction, pyautogui_codes


# ============================================================================
# Agent class
# ============================================================================

class UIMateAgent:
    """
    UI-Mate GUI agent.

    Combines UI-Mate's:
    - Action space (hotkey, press, key_down, key_up, drag, finished, etc.)
    - L1/L2/L3 prompt structure (<action>, <think>, <observation>)
    - to_pyautogui conversion logic

    With UI-Mate's:
    - XML tool-call output format (<function=...><parameter=...>)
    - <tool_response> message wrapping for non-first-turn screenshots
    - History collapse mechanism (images_to_keep)
    - OpenAI-compatible API backend
    """

    COLLAPSED_SCREENSHOT_TEXT = "This screenshot has been collapsed."

    def __init__(
        self,
        model: str = "UI_Mate",
        prompt_type: str = "l1",
        max_tokens: int = 32768,
        top_p: float = 0.9,
        temperature: float = 0.0,
        action_space: str = "pyautogui",
        observation_type: str = "screenshot",
        history_n: int = 100,
        include_observation_in_history: bool = False,
        include_thinking_in_history: bool = False,
        coordinate_type: str = "relative",
        api_backend: str = "openai",
        images_to_keep: int = 20,
        collapse_text: Optional[str] = None,
        enable_traj_slice: bool = False,
        traj_slice_interval: int = 10,
        enable_thinking: bool = False,
        llm_client: Optional[LLMClient] = None,
        **kwargs,  # Accept extra kwargs from registry (name, max_steps, screen_size, client_password, max_trajectory_length, etc.)
    ):
        self.model = model
        self.prompt_type = prompt_type
        self.include_observation_in_history = include_observation_in_history
        self.include_thinking_in_history = include_thinking_in_history

        self.max_tokens = max_tokens
        self.top_p = top_p
        self.temperature = temperature
        self.action_space = action_space
        self.observation_type = observation_type
        self.history_n = history_n
        self.coordinate_type = coordinate_type
        self.api_backend = api_backend
        self.images_to_keep = int(images_to_keep)
        self.collapse_text = collapse_text or self.COLLAPSED_SCREENSHOT_TEXT
        self.enable_traj_slice = enable_traj_slice
        self.traj_slice_interval = traj_slice_interval
        self.enable_thinking = enable_thinking
        self._llm: LLMClient = llm_client or OpenAIClient()

        self.collapsed_message_count = 0
        self.sliced_message_count = 0
        self.sliced_messages_dir: Optional[str] = None
        self.full_messages_history: List[Dict] = []

        if action_space != "pyautogui":
            raise ValueError("UI-Mate only supports pyautogui action space")
        if observation_type != "screenshot":
            raise ValueError("UI-Mate only supports screenshot observations")
        if api_backend != "openai":
            raise ValueError("UI-Mate only supports OpenAI-compatible APIs")
        if self.images_to_keep < 1:
            raise ValueError("images_to_keep must be >= 1")

        self.thoughts: List[str] = []
        self.actions: List[str] = []
        self.observations: List[Dict] = []
        self.responses: List[str] = []
        self.screenshots: List[str] = []

    def _wrap_tool_response(self, parts: List[Dict]) -> List[Dict]:
        """Wrap content in <tool_response> XML tags."""
        return (
            [{"type": "text", "text": "<tool_response>\n"}]
            + parts
            + [{"type": "text", "text": "\n</tool_response>"}]
        )

    @staticmethod
    def _sanitize_messages_for_dump(messages: List[Dict]) -> List[Dict]:
        sanitized: List[Dict] = []
        for message in messages:
            cloned = {"role": message.get("role"), "content": []}
            for part in message.get("content", []) or []:
                if isinstance(part, dict) and part.get("type") == "image_url":
                    url = ((part.get("image_url") or {}).get("url")) or ""
                    if url.startswith("data:image/"):
                        cloned["content"].append(
                            {"type": "image_url", "image_url": {"url": url[:40] + "...<omitted>"}}
                        )
                    else:
                        cloned["content"].append(part)
                else:
                    cloned["content"].append(part)
            sanitized.append(cloned)
        return sanitized

    def predict(self, instruction: str, obs: Dict) -> Tuple[str, List[str]]:
        """Predict the next action(s) based on the current observation."""
        screenshot_bytes = obs["screenshot"]

        original_img = Image.open(BytesIO(screenshot_bytes))
        original_width, original_height = original_img.size

        processed_b64 = process_image(screenshot_bytes)
        processed_img = Image.open(BytesIO(base64.b64decode(processed_b64)))
        processed_width, processed_height = processed_img.size

        self.screenshots.append(processed_b64)
        total_steps = len(self.screenshots)

        start_step = max(1, total_steps - self.history_n)

        # Release memory for old screenshots
        for _i in range(start_step - 1):
            if self.screenshots[_i] is not None:
                self.screenshots[_i] = None

        # Build previous_actions text for steps outside the history window
        previous_actions = [
            f"Step {i + 1}: {self.actions[i]}"
            for i in range(0, min(start_step - 1, len(self.actions)))
        ]
        previous_actions_str = "\n".join(previous_actions) if previous_actions else "None"

        # Rebuilt per step: a hook may patch the schema, and only this obs knows how.
        tools_def = _get_r3_tools_def(_build_description_prompt())
        patch_tools_schema(tools_def, obs)
        system_prompt = _build_system_prompt(self.prompt_type, tools_def=tools_def)

        instruction_prompt = (
            f"\nPlease generate the next move according to the UI screenshot, instruction and previous actions.\n\n"
            f"Instruction: {instruction}\n\n"
            f"Previous actions:\n"
            f"{previous_actions_str}"
        )

        # Build messages with <tool_response> wrapping.
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
                # Compact history response based on prompt_type settings
                compact_resp = _compact_response_for_history(
                    self.responses[step_num - 1],
                    include_observation=self.include_observation_in_history,
                    include_thinking=self.include_thinking_in_history,
                    prompt_type=self.prompt_type,
                )
                messages.append(
                    {"role": "assistant", "content": [{"type": "text", "text": compact_resp}]}
                )

        # Traj slice mechanism
        _traj_save_snapshot = False
        if self.enable_traj_slice:
            turn_idx = len(self.responses) + 1
            interval = self.traj_slice_interval

            if self.collapsed_message_count > 0:
                messages = self._apply_permanent_collapses(messages)

            if interval > 1:
                if (turn_idx % interval == 0) and (turn_idx >= interval * 2):
                    _traj_save_snapshot = True
                elif (turn_idx % interval == 1) and (turn_idx > interval * 2):
                    messages, _collapsed = _collapse_messages(
                        messages,
                        images_to_keep=interval,
                        min_removal_threshold=interval,
                        collapse_text=self.collapse_text,
                    )
                    if _collapsed:
                        self.collapsed_message_count += interval

        # Apply collapse
        messages, _ = _collapse_messages(
            messages,
            images_to_keep=self.images_to_keep,
            min_removal_threshold=1,
            collapse_text=self.collapse_text,
        )

        # After collapse: trimming would otherwise drop or displace the injected text.
        messages = apply_workflow_obs(messages, obs)

        # Debug dump
        try:
            draft_dir = "./draft/message_cache"
            os.makedirs(draft_dir, exist_ok=True)
            step_idx = total_steps - 1
            path = os.path.join(draft_dir, f"ui_mate_messages_step_{step_idx}.json")
            with open(path, "w", encoding="utf-8") as f:
                json.dump(self._sanitize_messages_for_dump(messages), f, ensure_ascii=False, indent=2)
        except Exception:
            pass

        # Call LLM
        response = self.call_llm(
            {
                "model": self.model,
                "messages": messages,
                "max_tokens": self.max_tokens,
                # "top_p": self.top_p,
                # "temperature": self.temperature,
            },
            self.model,
        )

        if logger:
            logger.debug("UI-Mate response received (%d characters)", len(response or ""))
        self.responses.append(response or "")

        # Save traj snapshot
        if self.enable_traj_slice:
            _asst_msg = {"role": "assistant", "content": [{"type": "text", "text": response or ""}]}
            _msgs_to_save = list(messages) + [_asst_msg]
            if _traj_save_snapshot:
                self._save_message_snapshot(_msgs_to_save, self.collapsed_message_count)
            self.full_messages_history = [{
                "messages_to_save": _msgs_to_save,
                "collapsed_length": self.collapsed_message_count,
            }]

        # Parse the response and convert XML tool calls to actions.
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

    # ------------------------------------------------------------------
    # LLM call
    # ------------------------------------------------------------------

    def set_llm_client(self, client: LLMClient) -> None:
        """Replace the transport after construction."""
        self._llm = client

    def call_llm(self, payload: Dict, model: str) -> str:
        """Resolve sampling settings and hand the messages to the transport."""
        params = GenParams(
            model=model,
            max_tokens=payload.get("max_tokens", self.max_tokens),
            temperature=payload.get("temperature", self.temperature),
            top_p=payload.get("top_p", self.top_p),
            enable_thinking=self.enable_thinking,
        )
        return self._llm.generate(payload["messages"], params).text

    # ------------------------------------------------------------------
    # Collapse helpers
    # ------------------------------------------------------------------

    def _apply_permanent_collapses(self, messages: List[Dict]) -> List[Dict]:
        collapsed_count = self.collapsed_message_count
        if collapsed_count <= 0:
            return messages

        result: List[Dict] = []
        user_msg_count = 0

        for msg in messages:
            if msg.get("role") != "user":
                result.append(msg)
                continue

            user_msg_count += 1
            if user_msg_count <= collapsed_count:
                content = msg.get("content", [])
                has_text = any(isinstance(b, dict) and b.get("type") == "text" for b in content)
                new_content = [b for b in content if not (isinstance(b, dict) and b.get("type") == "image_url")]

                remaining_text = ''.join(
                    b.get("text", "") for b in new_content
                    if isinstance(b, dict) and b.get("type") == "text"
                ).strip()

                text_normalized = remaining_text.replace('\n', '').replace(' ', '').replace('\t', '').replace('\r', '')
                is_empty_or_xml_only = (
                    not remaining_text
                    or text_normalized == "<tool_response></tool_response>"
                    or text_normalized == ""
                )

                if not has_text or is_empty_or_xml_only:
                    is_xml_format = "<tool_response>" in remaining_text
                    placeholder = ("<tool_response>\n" + self.collapse_text + "\n</tool_response>") if is_xml_format else self.collapse_text
                    result.append({"role": "user", "content": [{"type": "text", "text": placeholder}]})
                else:
                    result.append({"role": msg.get("role"), "content": new_content})
            else:
                result.append(msg)

        return result

    def _save_message_snapshot(self, messages: List[Dict], collapsed_length: int) -> None:
        if not self.sliced_messages_dir:
            return
        snapshot = {
            "messages": self._sanitize_messages_for_dump(messages),
            "collapsed_length": collapsed_length,
        }
        self.sliced_message_count += 1
        try:
            os.makedirs(self.sliced_messages_dir, exist_ok=True)
            path = os.path.join(self.sliced_messages_dir, f"sliced_messages_{self.sliced_message_count}.json")
            with open(path, "w", encoding="utf-8") as f:
                json.dump(snapshot, f, indent=2)
        except Exception as exc:
            if logger:
                logger.warning("[UI-Mate] failed to save message snapshot: %s", exc)

    def save_remaining_messages(self) -> None:
        if not self.enable_traj_slice or not self.full_messages_history:
            return
        interval = self.traj_slice_interval
        total_turns = len(self.responses)
        last_save_turn = 0
        if interval > 1 and total_turns >= interval * 2:
            last_save_turn = (total_turns // interval) * interval
            if last_save_turn < interval * 2:
                last_save_turn = 0
        if total_turns > last_save_turn:
            latest = self.full_messages_history[-1]
            self._save_message_snapshot(latest["messages_to_save"], latest.get("collapsed_length", 0))

    def reset(self, _logger=None, *args, **kwargs):
        global logger
        logger = _logger if _logger is not None else logging.getLogger("desktopenv.ui_mate")
        self.thoughts = []
        self.actions = []
        self.observations = []
        self.responses = []
        self.screenshots = []
        self.collapsed_message_count = 0
        self.sliced_message_count = 0
        self.full_messages_history = []
