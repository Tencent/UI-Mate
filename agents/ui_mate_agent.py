"""UI-Mate GUI agent — a standalone computer-use agent.

UI-Mate observes the live screen, reasons over the visible state, and acts
through keyboard and mouse events. It drives any OpenAI-compatible endpoint
serving a UI-Mate checkpoint, and depends on nothing but ``pillow`` and
``openai``: prompt construction, screenshot preprocessing, response parsing and
action translation all live in this file.

Quick start::

    from agents.ui_mate_agent import UIMateAgent

    agent = UIMateAgent(base_url="http://127.0.0.1:8000/v1")
    agent.reset()
    response, actions = agent.predict("Open Firefox", {"screenshot": png_bytes})
"""

from __future__ import annotations

import base64
import json
import logging
import math
import os
import re
import time
from io import BytesIO
from typing import Dict, List, Optional, Sequence, Tuple, Union

from PIL import Image

logger = logging.getLogger("ui_mate.agent")

AGENT_NAME = "ui_mate"

# ---------------------------------------------------------------------------
# Defaults — the reference UI-Mate evaluation configuration
# ---------------------------------------------------------------------------
DEFAULT_MODEL = "UI_Mate"
DEFAULT_PLATFORM = "ubuntu"
DEFAULT_ACTION_SPACE = "pyautogui"
DEFAULT_OBSERVATION_TYPE = "screenshot"
DEFAULT_API_BACKEND = "openai"

DEFAULT_MAX_TOKENS = 16384
DEFAULT_TEMPERATURE = 1.0
DEFAULT_TOP_P = 0.95
DEFAULT_MAX_TRAJECTORY_LENGTH = 3

DEFAULT_HISTORY_N = 100
DEFAULT_IMAGES_TO_KEEP = 5
DEFAULT_COORDINATE_TYPE = "relative"
DEFAULT_INCLUDE_THINKING_IN_HISTORY = True

DEFAULT_RECENT_THINK_STEPS: Optional[int] = None
DEFAULT_ADD_THOUGHT_PREFIX = False
DEFAULT_ENABLE_THINKING = True
DEFAULT_ENABLE_TRAJ_SLICE = False
DEFAULT_TRAJ_SLICE_INTERVAL = 10

DEFAULT_MAX_STEPS = 100
DEFAULT_SCREEN_SIZE = (1920, 1080)
DEFAULT_CLIENT_PASSWORD = "password"

DEFAULT_BASE_URL = "http://127.0.0.1:8000/v1"
DEFAULT_API_KEY = "EMPTY"

COLLAPSED_SCREENSHOT_TEXT = "This screenshot has been collapsed."


# ---------------------------------------------------------------------------
# Image preprocessing
# ---------------------------------------------------------------------------
def round_by_factor(number: float, factor: int) -> int:
    return round(number / factor) * factor


def ceil_by_factor(number: float, factor: int) -> int:
    return math.ceil(number / factor) * factor


def floor_by_factor(number: float, factor: int) -> int:
    return math.floor(number / factor) * factor


def smart_resize(
    height: int,
    width: int,
    factor: int = 28,
    min_pixels: int = 56 * 56,
    max_pixels: int = 14 * 14 * 4 * 1280,
    max_long_side: int = 8192,
) -> Tuple[int, int]:
    """Pick a (height, width) that is factor-aligned, within the pixel budget,
    and keeps the aspect ratio."""
    if height < 2 or width < 2:
        raise ValueError(f"height:{height} or width:{width} must be larger than factor:{factor}")
    if max(height, width) / min(height, width) > 200:
        raise ValueError(f"absolute aspect ratio must be smaller than 200, got {height} / {width}")

    if max(height, width) > max_long_side:
        beta = max(height, width) / max_long_side
        height, width = int(height / beta), int(width / beta)

    h_bar = round_by_factor(height, factor)
    w_bar = round_by_factor(width, factor)
    if h_bar * w_bar > max_pixels:
        beta = math.sqrt((height * width) / max_pixels)
        h_bar = floor_by_factor(height / beta, factor)
        w_bar = floor_by_factor(width / beta, factor)
    elif h_bar * w_bar < min_pixels:
        beta = math.sqrt(min_pixels / (height * width))
        h_bar = ceil_by_factor(height * beta, factor)
        w_bar = ceil_by_factor(width * beta, factor)
    return h_bar, w_bar


def process_image(image_bytes: bytes) -> str:
    """Resize + re-encode a screenshot and return it as base64 PNG."""
    image = Image.open(BytesIO(image_bytes))
    width, height = image.size
    resized_height, resized_width = smart_resize(
        height=height,
        width=width,
        factor=32,
        max_pixels=16 * 16 * 4 * 12800,
    )
    image = image.resize((resized_width, resized_height))
    buffer = BytesIO()
    image.save(buffer, format="PNG")
    return base64.b64encode(buffer.getvalue()).decode("utf-8")


# ---------------------------------------------------------------------------
# History collapsing
# ---------------------------------------------------------------------------
def collapse_messages(
    messages: List[Dict],
    images_to_keep: Optional[int] = 10,
    min_removal_threshold: int = 10,
    collapse_text: str = COLLAPSED_SCREENSHOT_TEXT,
) -> Tuple[List[Dict], bool]:
    """Drop the oldest screenshots from user messages to bound context size.

    The step-0 screenshot (the initial state of the task) is never dropped, and
    removals happen in chunks of ``min_removal_threshold`` so that the shared
    prefix stays stable for vLLM's prefix cache.
    """
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
    global_img_idx = -1

    for msg in messages:
        if remaining_to_remove <= 0:
            break
        if msg.get("role") != "user":
            continue
        content = msg.get("content")
        if not isinstance(content, list):
            continue

        has_text = any(
            isinstance(block, dict) and block.get("type") == "text" for block in content
        )
        new_content: List[Dict] = []
        removed_here = 0
        for block in content:
            if isinstance(block, dict) and block.get("type") == "image_url":
                global_img_idx += 1
                if global_img_idx == 0:
                    # step-0 screenshot is pinned for the whole episode
                    new_content.append(block)
                    continue
                if remaining_to_remove > 0:
                    remaining_to_remove -= 1
                    removed_here += 1
                    continue
            new_content.append(block)

        if removed_here > 0:
            collapsed_any = True
            msg["content"] = _replace_with_placeholder(new_content, has_text, collapse_text)

        if remaining_to_remove <= 0:
            break

    return messages, collapsed_any


def _replace_with_placeholder(
    new_content: List[Dict], has_text: bool, collapse_text: str
) -> List[Dict]:
    """Swap a stripped-down user message for its collapse placeholder."""
    remaining_text = "".join(
        block.get("text", "")
        for block in new_content
        if isinstance(block, dict) and block.get("type") == "text"
    ).strip()

    text_normalized = (
        remaining_text.replace("\n", "").replace(" ", "").replace("\t", "").replace("\r", "")
    )
    is_empty_or_xml_only = (
        not remaining_text
        or text_normalized == "<tool_response></tool_response>"
        or text_normalized == ""
    )

    if not has_text or is_empty_or_xml_only:
        if "<tool_response>" in remaining_text:
            placeholder_text = "<tool_response>\n" + collapse_text + "\n</tool_response>"
        else:
            placeholder_text = collapse_text
        return [{"type": "text", "text": placeholder_text}]
    return [{"type": "text", "text": collapse_text}] + new_content


# ---------------------------------------------------------------------------
# Prompt building
# ---------------------------------------------------------------------------
PROMPT_ADDITIONS = """<IMPORTANT_NOTES>
* DO NOT use LibreOffice macros or GIMP Script-Fu to complete tasks. Always use the GUI interface directly with mouse and keyboard actions. Macros and scripting cause reliability issues and task failures.
* For GIMP tasks, do NOT save or export files unless the instruction explicitly asks you to. Note that existing tasks that require file output will ask you to "export", not "save". Most GIMP tasks are evaluated automatically without requiring you to save.
* Before starting a task, consider whether it is achievable with the designated application's native GUI features. If the app fundamentally lacks the requested capability, declare it infeasible (finish with status=failure) instead of using CLI tools, Python scripts, or other applications as workarounds.
* After completing a task, verify the visible or functional result. If your actions had no real effect, reconsider whether the task is feasible.
</IMPORTANT_NOTES>"""


def build_description_prompt() -> str:
    """Environment description shared by L1/L2/L3."""
    lines = [
        "Use a mouse and keyboard to interact with a computer, and take screenshots.",
        "* This is an interface to a desktop GUI. You do not have access to a terminal"
        " or applications menu. You must click on desktop icons to start applications.",
        "* Some applications may take time to start or process actions, so you may need"
        " to wait and take successive screenshots to see the results of your actions."
        " E.g. if you click on Firefox and a window doesn't open, try wait and taking"
        " another screenshot.",
        "* The screen's resolution is 1000x1000.",
        "* Whenever you intend to move the cursor to click on an element like an icon,"
        " you should consult a screenshot to determine the coordinates of the element"
        " before moving the cursor.",
        "* If you tried clicking on a program or link but it failed to load even after"
        " waiting, try adjusting your cursor position so that the tip of the cursor"
        " visually falls on the element that you want to click.",
        "* Make sure to click any buttons, links, icons, etc with the cursor tip in the"
        " center of the element. Don't click boxes on their edges unless asked.",
    ]
    return "\n".join(lines)


def build_action_description() -> str:
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
* `call_user`: Ask the user for information or confirmation. Use this when you genuinely need user input, or when the task cannot be completed (in that case clearly state why it is infeasible).
* `finished`: Terminate the task and indicate whether it was a 'success' or 'failure'."""


def build_tools_def(description_prompt: str) -> Dict:
    return {
        "type": "function",
        "function": {
            "name": "computer_use",
            "description": description_prompt,
            "parameters": {
                "properties": {
                    "action": {
                        "description": build_action_description(),
                        "enum": [
                            "left_click", "right_click", "middle_click",
                            "double_click", "triple_click", "drag", "mouse_move",
                            "type", "hotkey", "press", "key_down", "key_up",
                            "scroll", "wait", "call_user", "finished",
                        ],
                        "type": "string",
                    },
                    "coordinate": {
                        "description": "The (x, y) coordinates (0-999). Required for: clicks, mouse_move, drag.",
                        "type": "array",
                    },
                    "text": {
                        "description": (
                            "The text to type, or the message to the user."
                            " Required for `action=type` and `action=call_user`."
                        ),
                        "type": "string",
                    },
                    "keys": {
                        "description": (
                            "An array of key names (e.g. ['a'], ['ctrl', 'c'])."
                            " Required for: hotkey, press, key_down, key_up."
                        ),
                        "type": "array",
                    },
                    "pixels": {
                        "description": "The number of pixels to scroll. Required only for `action=scroll`.",
                        "type": "number",
                    },
                    "direction": {
                        "type": "string",
                        "enum": ["vertical", "horizontal"],
                        "description": (
                            "The scroll direction. 'vertical' (default) for up/down"
                            " scrolling, 'horizontal' for left/right scrolling."
                            " Required only for `action=scroll`."
                        ),
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


def build_tools_and_format_block(tools_def: Dict) -> str:
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
        "- Function calls MUST follow the specified format: an inner"
        " <function=...></function> block must be nested within"
        " <tool_call></tool_call> XML tags\n"
        "- Required parameters MUST be specified\n"
        "- You may provide optional reasoning for your function call in natural"
        " language BEFORE the function call, but NOT after\n"
        "- If there is no function call available, answer the question like normal"
        " with your current knowledge and do not tell the user about function calls\n"
        "</IMPORTANT>"
    )


RESPONSE_FORMAT = (
    "Response format for every step:\n"
    "1) Thought: A single <think>...</think> block containing step by step progress"
    " assessment and next action analysis.\n"
    "2) Action: A single <action>...</action> block containing a short imperative describing what to do in the UI.\n"
    "3) Tool Execution: A single or multiple <tool_call>...</tool_call> blocks.\n\n"
    "Rules:\n"
    "- Output exactly in the order: <think>...</think>, <action>...</action>, <tool_call>...</tool_call>.\n"
    "- From a first-person perspective, systematically assess progress and errors,"
    " evaluate potential next steps, and precisely plan text inputs"
    " (cursor position and expected outcomes)\n"
    "- Be brief for Action: one sentence for action description.\n"
    "- Do not output anything else outside those parts.\n"
    "- If finishing, use action=finished in the tool call. If the task is infeasible, finish with status=failure."
)


def build_system_prompt() -> str:
    tools_block = build_tools_and_format_block(build_tools_def(build_description_prompt()))
    return (
        "You are a helpful GUI agent.\n\n"
        + tools_block + "\n\n"
        + PROMPT_ADDITIONS + "\n\n"
        "# Response format\n\n"
        + RESPONSE_FORMAT
    ).strip()


# ---------------------------------------------------------------------------
# Response parsing
# ---------------------------------------------------------------------------
_INFEASIBLE_LITERALS = (
    "not possible", "impossible", "not feasible", "cannot be completed",
    "can't be completed", "cannot be done", "cannot complete", "can't complete",
    "unable to complete", "cannot do this task", "can't do this task",
    "cannot complete this task as described", "cannot be completed as specified",
    "can't be completed as specified", "not available in your country", "not available",
    "unavailable", "not supported", "does not support", "doesn't support",
    "cannot natively", "does not have a built-in", "doesn't have a built-in",
    "does not include", "is not among the natively built-in", "will fall back to english",
    "requires the official", "no bluetooth found", "plug in a dongle", "folder is empty",
    "downloads folder is empty", "do not have the credentials", "don't have the credentials",
    "do not have the account credentials", "don't have the account credentials",
    "need the user's google account credentials", "requires a language pack extension",
    "requires email verification", "requires a sign-up", "requires sign-up",
    "requires google account credentials", "requires a google account",
    "sign in to the google account", "drm-protected", "drm protection",
    "cannot directly play", "no legitimate way", "requires a plugin", "requires an extension",
    "requires extension", "requires plugin", "requires a valid account", "requires purchase",
    "requires a purchased", "no valid account", "hidden audio", "could you clarify",
)

_INFEASIBLE_REGEXES = (
    r"\bthere is no [a-z0-9 _-]+\b",
    r"\bno [a-z0-9 _-]+ in [a-z0-9 _-]+ list\b",
    r"\brequires? (an? )?(extension|plugin|account|credentials|hardware|language pack)\b",
    r"\bneed(?:s)? (an? )?(extension|plugin|account|credentials|hardware|language pack)\b",
    r"\b(without|no) (extensions?|plugins?|terminal|ffmpeg|other apps?)"
    r".{0,120}\b(cannot|can't|not possible|not feasible)\b",
)


def looks_infeasible_response(text: str) -> bool:
    """Heuristic used to turn a give-up response into FAIL rather than DONE."""
    lowered = (text or "").lower()
    if "infeasible" in lowered:
        return True
    if any(pattern in lowered for pattern in _INFEASIBLE_LITERALS):
        return True
    return any(re.search(pattern, lowered) for pattern in _INFEASIBLE_REGEXES)


def extract_action_text(response: str) -> str:
    match = re.search(r"<action>\s*(.*?)\s*</action>", response, re.DOTALL | re.IGNORECASE)
    return match.group(1).strip() if match else ""


def compact_response_for_history(response: str, include_thinking: bool = False) -> str:
    """Trim a past response before replaying it as assistant history.

    Keeping the thinking means replaying the response from ``<think>`` onwards;
    otherwise history starts at ``<action>``.
    """
    tag = r"<think\b[^>]*>" if include_thinking else r"<action\b[^>]*>"
    match = re.search(tag, response, re.IGNORECASE)
    if not match:
        return response
    return response[match.start():].strip()


def parse_xml_tool_call(xml_content: str) -> Optional[Dict]:
    """Parse one XML tool call into a flat params dict."""
    func_match = re.search(r"<function=([^>]+)>", xml_content)
    if not func_match or func_match.group(1) != "computer_use":
        return None

    params: Dict = {}
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


def extract_xml_tool_calls(response: str) -> List[Dict]:
    results = []
    for match in re.finditer(r"<tool_call>(.*?)</tool_call>", response, re.DOTALL):
        params = parse_xml_tool_call(match.group(1))
        if params:
            results.append(params)
    return results


def scale_coordinate(
    x: float, y: float, original_width: int, original_height: int, coordinate_type: str
) -> Tuple[int, int]:
    if coordinate_type == "absolute":
        return int(x), int(y)
    return int(x * original_width / 999.0), int(y * original_height / 999.0)


def _clean_keys(raw_keys) -> List:
    keys = raw_keys if isinstance(raw_keys, list) else [raw_keys]
    cleaned_keys = []
    for key in keys:
        if not isinstance(key, str):
            cleaned_keys.append(key)
            continue
        if key.startswith("keys=["):
            key = key[6:]
        if key.endswith("]"):
            key = key[:-1]
        if key.startswith("['") or key.startswith('["'):
            key = key[2:] if len(key) > 2 else key
        if key.endswith("']") or key.endswith('"]'):
            key = key[:-2] if len(key) > 2 else key
        cleaned_keys.append(key.strip())
    return cleaned_keys


def to_pyautogui_code(
    action: str,
    args: Dict,
    original_width: int,
    original_height: int,
    coordinate_type: str,
) -> Union[str, List[str]]:
    """Convert one parsed action into pyautogui source (or a control token)."""
    adj_x = adj_y = None
    if action in ("left_click", "click", "right_click", "middle_click",
                  "double_click", "triple_click", "drag", "mouse_move"):
        coordinate = args.get("coordinate")
        if isinstance(coordinate, (list, tuple)) and len(coordinate) >= 2:
            x, y = coordinate[:2]
            adj_x, adj_y = scale_coordinate(
                float(x), float(y), original_width, original_height, coordinate_type
            )

    if action in ("left_click", "click"):
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
        if adj_x is None:
            return "pyautogui.dragTo(0, 0)"
        if duration:
            return f"pyautogui.dragTo({adj_x}, {adj_y}, duration={duration})"
        return f"pyautogui.dragTo({adj_x}, {adj_y})"

    if action == "mouse_move":
        return f"pyautogui.moveTo({adj_x}, {adj_y})" if adj_x is not None else "pyautogui.moveTo(0, 0)"

    if action == "type":
        text = args.get("text", "")
        try:
            text = text.encode("latin-1", "backslashreplace").decode("unicode_escape")
        except (UnicodeError, AttributeError):
            # Malformed escapes, or a non-string payload: type the value as given.
            pass
        code_str = ""
        for char in text:
            if char == "\n":
                code_str += "pyautogui.press('enter')\n"
            elif char == "'":
                code_str += 'pyautogui.press("\'")\n'
            elif char == "\\":
                code_str += "pyautogui.press('\\\\')\n"
            elif char == '"':
                code_str += "pyautogui.press('\"')\n"
            else:
                code_str += f"pyautogui.press('{char}')\n"
        return code_str

    if action == "hotkey":
        keys = args.get("keys", [])
        if isinstance(keys, str):
            keys = [k.strip() for k in keys.split("+")]
        elif isinstance(keys, list):
            cleaned = []
            for key in keys:
                if isinstance(key, str) and "+" in key and key != "+":
                    cleaned.extend([k.strip() for k in key.split("+")])
                elif isinstance(key, str):
                    cleaned.append(key.strip())
                else:
                    cleaned.append(key)
            keys = cleaned
        elif keys is not None:
            keys = [keys]
        else:
            keys = []
        keys_str = ", ".join(f"'{k}'" for k in keys)
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
            return f"pyautogui.press({keys[0]!r})"
        return f"pyautogui.press({keys!r})"

    if action == "key_down":
        return [f"pyautogui.keyDown('{k}')" for k in _clean_keys(args.get("keys", []))]

    if action == "key_up":
        return [f"pyautogui.keyUp('{k}')" for k in reversed(_clean_keys(args.get("keys", [])))]

    if action in ("scroll", "sroll"):
        pixels = args.get("pixels", 0)
        if args.get("direction", "vertical") == "horizontal":
            return f"pyautogui.hscroll({pixels})"
        return f"pyautogui.scroll({pixels})"

    if action == "wait":
        return "WAIT"

    if action == "finished":
        status = str(args.get("status", "")).lower()
        return "DONE" if status in ("success", "successful", "yes", "ok") else "FAIL"

    return ""


def parse_response(
    response: str,
    original_width: int,
    original_height: int,
    coordinate_type: str = DEFAULT_COORDINATE_TYPE,
) -> Tuple[str, List[str]]:
    """Turn a model response into (action text, pyautogui code / control tokens).

    ``call_user`` and responses without a usable action fall back to the
    infeasibility heuristic: FAIL when the model is giving up, DONE otherwise.
    """
    infeasible = looks_infeasible_response(response or "")

    low_level_instruction = extract_action_text(response)
    if not low_level_instruction:
        return "<Error>: no <action> block found in response", ["FAIL"]

    tool_calls = extract_xml_tool_calls(response)
    if not tool_calls:
        return (
            "<Error>: no <tool_call> blocks found in response",
            ["FAIL" if infeasible else "DONE"],
        )

    pyautogui_codes: List[str] = []
    for params in tool_calls:
        action = params.get("action")
        if not action:
            pyautogui_codes.append("FAIL")
            continue

        if action == "call_user":
            pyautogui_codes.append("FAIL" if infeasible else "DONE")
            continue

        code = to_pyautogui_code(
            action, params, original_width, original_height, coordinate_type
        )
        if not code:
            pyautogui_codes.append("FAIL")
        elif isinstance(code, list):
            pyautogui_codes.extend(code)
        else:
            pyautogui_codes.append(code)

    if not pyautogui_codes:
        return "<Error>: no pyautogui code generated", ["FAIL" if infeasible else "DONE"]

    # A terminal signal is returned on its own, never merged with other code.
    for code in pyautogui_codes:
        if code in ("FAIL", "DONE"):
            return low_level_instruction, [code]

    if len(pyautogui_codes) > 1:
        has_modifier = any(
            "'ctrl'" in c or "'shift'" in c
            for c in pyautogui_codes
            if "keyDown" in c or "keyUp" in c
        )
        force_join = any(
            k in c for c in pyautogui_codes
            for k in ("'enter'", "'backspace'", "'tab'", "'space'")
        )
        if not has_modifier or force_join:
            return low_level_instruction, ["\n".join(pyautogui_codes)]

    return low_level_instruction, pyautogui_codes


# ---------------------------------------------------------------------------
# Agent
# ---------------------------------------------------------------------------
class UIMateAgent:
    """UI-Mate computer-use agent against an OpenAI-compatible endpoint.

    The defaults are the reference evaluation configuration, so ``UIMateAgent()``
    is ready to run; only the endpoint needs to be supplied, either as a
    constructor argument or through ``OPENAI_BASE_URL``.
    """

    def __init__(
        self,
        model: str = DEFAULT_MODEL,
        platform: str = DEFAULT_PLATFORM,
        action_space: str = DEFAULT_ACTION_SPACE,
        observation_type: str = DEFAULT_OBSERVATION_TYPE,
        api_backend: str = DEFAULT_API_BACKEND,
        # --- generation ---
        max_tokens: int = DEFAULT_MAX_TOKENS,
        temperature: float = DEFAULT_TEMPERATURE,
        top_p: float = DEFAULT_TOP_P,
        enable_thinking: bool = DEFAULT_ENABLE_THINKING,
        # --- prompt / message organisation ---
        history_n: int = DEFAULT_HISTORY_N,
        images_to_keep: int = DEFAULT_IMAGES_TO_KEEP,
        coordinate_type: str = DEFAULT_COORDINATE_TYPE,
        include_thinking_in_history: bool = DEFAULT_INCLUDE_THINKING_IN_HISTORY,
        recent_think_steps: Optional[int] = DEFAULT_RECENT_THINK_STEPS,
        add_thought_prefix: bool = DEFAULT_ADD_THOUGHT_PREFIX,
        collapse_text: Optional[str] = None,
        enable_traj_slice: bool = DEFAULT_ENABLE_TRAJ_SLICE,
        traj_slice_interval: int = DEFAULT_TRAJ_SLICE_INTERVAL,
        max_trajectory_length: int = DEFAULT_MAX_TRAJECTORY_LENGTH,
        # --- endpoint ---
        base_url: Optional[str] = None,
        api_key: Optional[str] = None,
        request_timeout: Optional[float] = None,
        max_retry_times: Optional[int] = None,
        # --- runner-side context (accepted for parity, unused by predict) ---
        max_steps: int = DEFAULT_MAX_STEPS,
        screen_size: Sequence[int] = DEFAULT_SCREEN_SIZE,
        client_password: str = DEFAULT_CLIENT_PASSWORD,
        **kwargs,
    ):
        if action_space != "pyautogui":
            raise ValueError("UIMateAgent only supports the pyautogui action space")
        if observation_type != "screenshot":
            raise ValueError("UIMateAgent only supports screenshot observations")
        if api_backend != "openai":
            raise ValueError("UIMateAgent only supports OpenAI-compatible APIs")
        if int(images_to_keep) < 1:
            raise ValueError("images_to_keep must be >= 1")

        self.model = model
        self.platform = platform
        self.action_space = action_space
        self.observation_type = observation_type
        self.api_backend = api_backend

        self.max_tokens = max_tokens
        self.temperature = temperature
        self.top_p = top_p
        self.enable_thinking = enable_thinking

        self.history_n = history_n
        self.images_to_keep = int(images_to_keep)
        self.coordinate_type = coordinate_type
        self.include_thinking_in_history = include_thinking_in_history
        self.recent_think_steps = recent_think_steps
        self.add_thought_prefix = add_thought_prefix
        self.collapse_text = collapse_text or COLLAPSED_SCREENSHOT_TEXT
        self.enable_traj_slice = enable_traj_slice
        self.traj_slice_interval = traj_slice_interval
        self.max_trajectory_length = max_trajectory_length

        self.base_url = base_url or os.environ.get("OPENAI_BASE_URL", DEFAULT_BASE_URL)
        self.api_key = api_key or os.environ.get("OPENAI_API_KEY", DEFAULT_API_KEY)
        self.request_timeout = float(
            request_timeout
            if request_timeout is not None
            else os.environ.get("UI_MATE_REQUEST_TIMEOUT", 130.0)
        )
        self.max_retry_times = int(
            max_retry_times
            if max_retry_times is not None
            else os.environ.get("UI_MATE_MAX_RETRY_TIMES", 2)
        )

        self.max_steps = max_steps
        self.screen_size = tuple(screen_size)
        self.client_password = client_password
        self.extra_kwargs = kwargs

        self.logger = logger
        self.sliced_messages_dir: Optional[str] = None

        self.thoughts: List[str] = []
        self.actions: List[str] = []
        self.observations: List[Dict] = []
        self.responses: List[str] = []
        self.screenshots: List[Optional[str]] = []
        self.collapsed_message_count = 0
        self.sliced_message_count = 0
        self.full_messages_history: List[Dict] = []

        self.logger.info(
            "UIMateAgent ready | model=%s | endpoint=%s", self.model, self.base_url
        )

    # -- message construction ------------------------------------------------

    def _wrap_tool_response(self, parts: List[Dict]) -> List[Dict]:
        return (
            [{"type": "text", "text": "<tool_response>\n"}]
            + parts
            + [{"type": "text", "text": "\n</tool_response>"}]
        )

    def build_messages(self, instruction: str) -> List[Dict]:
        """Build the chat messages for the current step from agent state."""
        total_steps = len(self.screenshots)
        start_step = max(1, total_steps - self.history_n)

        # Release the screenshots that fell out of the history window.
        for i in range(start_step - 1):
            self.screenshots[i] = None

        previous_actions = [
            f"Step {i + 1}: {self.actions[i]}"
            for i in range(0, min(start_step - 1, len(self.actions)))
        ]
        instruction_prompt = (
            "\nPlease generate the next move according to the UI screenshot, "
            "instruction and previous actions.\n\n"
            f"Instruction: {instruction}\n\n"
            "Previous actions:\n"
            f"{chr(10).join(previous_actions) if previous_actions else 'None'}"
        )

        messages: List[Dict] = [
            {
                "role": "system",
                "content": [{"type": "text", "text": build_system_prompt()}],
            }
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
                image_block = {"type": "image_url", "image_url": {"url": img_url}}
                if is_first_turn:
                    user_content = [image_block, {"type": "text", "text": instruction_prompt}]
                else:
                    user_content = self._wrap_tool_response([image_block])
            messages.append({"role": "user", "content": user_content})

            if step_num <= total_steps - 1 and (step_num - 1) < len(self.responses):
                messages.append(
                    {
                        "role": "assistant",
                        "content": [
                            {
                                "type": "text",
                                "text": self._compact_history_step(step_num, total_steps),
                            }
                        ],
                    }
                )

        return messages

    def _compact_history_step(self, step_num: int, total_steps: int) -> str:
        """Compact one past response, honouring the recent_think_steps window."""
        include_thinking = self.include_thinking_in_history
        if include_thinking and self.recent_think_steps is not None:
            distance_from_newest = (total_steps - 1) - step_num
            if distance_from_newest >= self.recent_think_steps:
                include_thinking = False
        return compact_response_for_history(
            self.responses[step_num - 1], include_thinking=include_thinking
        )

    # -- main loop -----------------------------------------------------------

    def predict(self, instruction: str, obs: Dict) -> Tuple[str, List[str]]:
        """Produce the next action(s) for the current screenshot."""
        screenshot_bytes = obs["screenshot"]
        original_width, original_height = Image.open(BytesIO(screenshot_bytes)).size

        self.screenshots.append(process_image(screenshot_bytes))

        messages = self.build_messages(instruction)

        save_snapshot = False
        if self.enable_traj_slice:
            turn_idx = len(self.responses) + 1
            interval = self.traj_slice_interval
            if self.collapsed_message_count > 0:
                messages = self._apply_permanent_collapses(messages)
            if interval > 1:
                if turn_idx % interval == 0 and turn_idx >= interval * 2:
                    save_snapshot = True
                elif turn_idx % interval == 1 and turn_idx > interval * 2:
                    messages, collapsed = collapse_messages(
                        messages,
                        images_to_keep=interval,
                        min_removal_threshold=interval,
                        collapse_text=self.collapse_text,
                    )
                    if collapsed:
                        self.collapsed_message_count += interval

        messages, _ = collapse_messages(
            messages,
            images_to_keep=self.images_to_keep,
            min_removal_threshold=1,
            collapse_text=self.collapse_text,
        )

        response = self.call_llm(
            {
                "model": self.model,
                "messages": messages,
                "max_tokens": self.max_tokens,
            },
            self.model,
        )
        self.logger.info("UIMateAgent output: %s", response)
        self.responses.append(response or "")

        if self.enable_traj_slice:
            messages_to_save = list(messages) + [
                {"role": "assistant", "content": [{"type": "text", "text": response or ""}]}
            ]
            if save_snapshot:
                self._save_message_snapshot(messages_to_save, self.collapsed_message_count)
            self.full_messages_history = [
                {
                    "messages_to_save": messages_to_save,
                    "collapsed_length": self.collapsed_message_count,
                }
            ]

        low_level_instruction, pyautogui_code = parse_response(
            response or "", original_width, original_height, self.coordinate_type
        )
        self.logger.info("Low level instruction: %s", low_level_instruction)
        self.logger.info("Pyautogui code: %s", pyautogui_code)

        self.actions.append(low_level_instruction)
        return response or "", pyautogui_code

    # -- LLM ------------------------------------------------------------------

    @staticmethod
    def _extract_content_text(content) -> str:
        if content is None:
            return ""
        if isinstance(content, str):
            return content
        if isinstance(content, list):
            parts = []
            for part in content:
                if isinstance(part, dict):
                    if "text" in part:
                        parts.append(part.get("text", ""))
                else:
                    text = getattr(part, "text", None)
                    if text:
                        parts.append(text)
            return "".join(parts)
        return str(content)

    def call_llm(self, payload: Dict, model: Optional[str] = None) -> str:
        """Call the OpenAI-compatible endpoint, retrying transient failures.

        Returns an empty string once the retries are exhausted; downstream that
        parses into a FAIL action, which lets the runner record the failed step
        instead of aborting the whole episode.
        """
        import openai
        from requests.exceptions import SSLError

        model = model or payload.get("model") or self.model
        try:
            client = openai.OpenAI(
                base_url=self.base_url, api_key=self.api_key, timeout=self.request_timeout
            )
        except TypeError:
            client = openai.OpenAI(base_url=self.base_url, api_key=self.api_key)

        retryable_types = tuple(
            exc for exc in [
                SSLError,
                getattr(openai, "APIConnectionError", None),
                getattr(openai, "APITimeoutError", None),
                getattr(openai, "RateLimitError", None),
                getattr(openai, "BadRequestError", None),
                getattr(openai, "InternalServerError", None),
            ] if isinstance(exc, type)
        )

        last_err: Optional[Exception] = None
        for attempt in range(1, self.max_retry_times + 1):
            try:
                resp = client.chat.completions.create(
                    model=model,
                    messages=payload["messages"],
                    max_tokens=payload.get("max_tokens", self.max_tokens),
                    temperature=payload.get("temperature", self.temperature),
                    top_p=payload.get("top_p", self.top_p),
                    extra_body={
                        "chat_template_kwargs": {"enable_thinking": self.enable_thinking}
                    },
                )
                return self._extract_content_text(resp.choices[0].message.content)
            except retryable_types as exc:
                last_err = exc
                self.logger.warning(
                    "call_llm failed attempt %d/%d: %s", attempt, self.max_retry_times, exc
                )
                time.sleep(min(5.0 * attempt, 30.0))

        self.logger.error(
            "call_llm exhausted %d attempts; returning empty response (-> FAIL). Last error: %s",
            self.max_retry_times, last_err,
        )
        return ""

    # -- persistence helpers ---------------------------------------------------

    @staticmethod
    def sanitize_messages(messages: List[Dict]) -> List[Dict]:
        """Copy messages with inline base64 images truncated, for logging."""
        sanitized: List[Dict] = []
        for message in messages:
            cloned = {"role": message.get("role"), "content": []}
            for part in message.get("content", []) or []:
                if isinstance(part, dict) and part.get("type") == "image_url":
                    url = ((part.get("image_url") or {}).get("url")) or ""
                    if url.startswith("data:image/"):
                        part = {
                            "type": "image_url",
                            "image_url": {"url": url[:40] + "...<omitted>"},
                        }
                cloned["content"].append(part)
            sanitized.append(cloned)
        return sanitized

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
            if user_msg_count > collapsed_count:
                result.append(msg)
                continue

            content = msg.get("content", [])
            has_text = any(isinstance(b, dict) and b.get("type") == "text" for b in content)
            new_content = [
                b for b in content
                if not (isinstance(b, dict) and b.get("type") == "image_url")
            ]
            result.append(
                {
                    "role": "user",
                    "content": _replace_with_placeholder(new_content, has_text, self.collapse_text),
                }
            )
        return result

    def _save_message_snapshot(self, messages: List[Dict], collapsed_length: int) -> None:
        if not self.sliced_messages_dir:
            return
        self.sliced_message_count += 1
        try:
            os.makedirs(self.sliced_messages_dir, exist_ok=True)
            path = os.path.join(
                self.sliced_messages_dir, f"sliced_messages_{self.sliced_message_count}.json"
            )
            with open(path, "w", encoding="utf-8") as f:
                json.dump(
                    {
                        "messages": self.sanitize_messages(messages),
                        "collapsed_length": collapsed_length,
                    },
                    f,
                    indent=2,
                )
        except OSError as exc:
            self.logger.warning("failed to save message snapshot: %s", exc)

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
            self._save_message_snapshot(
                latest["messages_to_save"], latest.get("collapsed_length", 0)
            )

    def reset(self, _logger: Optional[logging.Logger] = None, *args, **kwargs) -> None:
        """Clear per-episode state. The runner passes its own logger in."""
        self.logger = _logger if _logger is not None else logger
        self.thoughts = []
        self.actions = []
        self.observations = []
        self.responses = []
        self.screenshots = []
        self.collapsed_message_count = 0
        self.sliced_message_count = 0
        self.full_messages_history = []


__all__ = [
    "AGENT_NAME",
    "UIMateAgent",
    "build_system_prompt",
    "collapse_messages",
    "looks_infeasible_response",
    "parse_response",
    "process_image",
    "smart_resize",
    "to_pyautogui_code",
]
