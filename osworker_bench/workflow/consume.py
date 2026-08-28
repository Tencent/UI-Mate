"""Agent-side read-only consumer of workflow ``obs`` keys. No-op when absent."""
from __future__ import annotations

import json
import logging
from typing import Any, Callable, Dict, List, Optional

logger = logging.getLogger("desktopenv.workflow.consume")

_POST_PROCESSORS: List[Callable[..., List[Dict[str, Any]]]] = []


def patch_tools_schema(
    tools_def: Optional[Dict[str, Any]], obs: Optional[Dict[str, Any]]
) -> Optional[Dict[str, Any]]:
    """Fold obs["workflow_action_patch"] into a computer_use schema (in place; no-op if missing)."""
    if not isinstance(obs, dict) or not isinstance(tools_def, dict):
        return tools_def
    patch = obs.get("workflow_action_patch")
    if not isinstance(patch, dict):
        return tools_def
    try:
        props = tools_def["function"]["parameters"]["properties"]
        action = props["action"]
    except (KeyError, TypeError):
        logger.warning("workflow_action_patch present but tools_def is not a "
                       "computer_use-style schema; skipping.")
        return tools_def

    enum = action.setdefault("enum", [])
    for name in patch.get("action_enum", []) or []:
        if name not in enum:
            enum.append(name)
    extra_desc = patch.get("action_description")
    if extra_desc:
        action["description"] = ((action.get("description", "") or "") + "\n" + extra_desc).strip("\n")
    frag = patch.get("extra_properties_json")
    if frag:
        try:
            extra = json.loads("{" + frag + "}")
        except json.JSONDecodeError as exc:
            logger.warning("Failed to parse workflow_action_patch.extra_properties_json: %s", exc)
        else:
            if isinstance(extra, dict):
                props.update(extra)
    return tools_def


def register_post_processor(fn: Callable[[List[Dict[str, Any]], Dict[str, Any]],
                                         List[Dict[str, Any]]]) -> None:
    """Register a ``(messages, obs) -> messages`` rewriter for placement only the
    message assembler can do; runs at the end of :func:`apply_workflow_obs`. Idempotent."""
    if fn not in _POST_PROCESSORS:
        _POST_PROCESSORS.append(fn)


def apply_workflow_obs(
    messages: List[Dict[str, Any]], obs: Optional[Dict[str, Any]]
) -> List[Dict[str, Any]]:
    """Fold obs["workflow_system_prompt"] into the system message, then let the
    registered post-processors place the guidance (new list; no-op if absent)."""
    if not isinstance(obs, dict) or not messages:
        return messages
    out = messages
    system_note = obs.get("workflow_system_prompt")
    if isinstance(system_note, str) and system_note and out[0].get("role") == "system":
        out = _append_text(out, 0, system_note)
    for post in _POST_PROCESSORS:
        out = post(out, obs)
    return out


def _append_text(messages: List[Dict[str, Any]], idx: int, text: str) -> List[Dict[str, Any]]:
    """Append a text part to messages[idx]."""
    msg = dict(messages[idx])
    content = msg.get("content")
    if not isinstance(content, list):  # tolerate plain-string content
        content = [{"type": "text", "text": content}] if isinstance(content, str) else []
    msg["content"] = content + [{"type": "text", "text": text}]
    out = list(messages)
    out[idx] = msg
    return out
