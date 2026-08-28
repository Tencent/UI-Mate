"""Workflow core: plan model, subtask tracker, response adapters, obs injection.

Independent of any demo format (see ``democua_source.py``) and of any guidance
layout (see a hook such as ``key_action_runtime.py``).
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional


# --- Plan model ---=================================================


@dataclass(frozen=True)
class Subtask:
    """One workflow subtask. ``key_steps`` are the demo's milestone descriptions."""

    title: str
    goal: str
    completion_flag: str = ""
    key_steps: List[str] = field(default_factory=list)


@dataclass(frozen=True)
class WorkflowPlan:
    subtasks: List[Subtask] = field(default_factory=list)


# --- SubtaskTracker ---=============================================


class SubtaskTracker:
    """Tracks the current subtask; advances only on ``force_advance()``, i.e. when
    a completion signal is detected."""

    def __init__(self, plan: WorkflowPlan):
        self._subtasks = plan.subtasks
        self._current_idx = 0

    @property
    def current_index(self) -> int:
        return self._current_idx

    @property
    def current_subtask(self) -> Optional[Subtask]:
        if self._current_idx < len(self._subtasks):
            return self._subtasks[self._current_idx]
        return None

    @property
    def is_last(self) -> bool:
        return self._current_idx >= len(self._subtasks) - 1

    def force_advance(self) -> None:
        if self._current_idx < len(self._subtasks):
            self._current_idx += 1


# --- Response/action adapters ---===================================
# Keeps ``AgentResponse``'s layout the harness's business, not a hook's.


def text_of(response: Any) -> str:
    """The model's raw text (what the completion detector matches against)."""
    return str(getattr(response, "raw_response", response))


def extract_actions(response: Any) -> List[Any]:
    """The response's action list (empty list if none)."""
    return getattr(response, "actions", None) or []


def replace_actions(response: Any, new_actions: List[Any]) -> Any:
    """Replace the action list in place and return the response."""
    response.actions = new_actions
    return response


# --- obs injection mechanism ---====================================
# Wire format only (payload is the hook's call), so the agent side stays a dumb reader.


def inject_guidance(obs: Dict[str, Any], text: str) -> Dict[str, Any]:
    """Payload only; placement is the hook's business (see
    ``consume.register_post_processor``)."""
    if not text:
        return obs
    return {**obs, "workflow_guidance": text}


def inject_system_prompt(obs: Dict[str, Any], text: str) -> Dict[str, Any]:
    """Write obs["workflow_system_prompt"] (appended to the system message by consume)."""
    if not text:
        return obs
    return {**obs, "workflow_system_prompt": text}
