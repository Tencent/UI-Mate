"""DemoCUA demo source: ``trajectory_captioned*.json`` -> :class:`WorkflowPlan`.

``resolve_plan`` is the only entry point other layers use, so swapping this module
supports a different demo format without touching ``engine.py`` or any hook.
"""
from __future__ import annotations

import json
import logging
from pathlib import Path
from typing import Any, Dict, List, Optional

from workflow.engine import Subtask, WorkflowPlan

logger = logging.getLogger("desktopenv.workflow.democua_source")


def _key_step(step: Dict[str, Any]) -> str:
    """One milestone description; the demo's other layers carry no text a renderer uses."""
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
            text for text in (_key_step(s) for s in raw.get("steps") or [] if isinstance(s, dict))
            if text
        ],
    )


def resolve_plan(example_id: Optional[str], *, demo_dir: Optional[str] = None) -> Optional[WorkflowPlan]:
    """``example_id -> Optional[WorkflowPlan]``, looked up as
    ``{demo_dir}/{example_id}/trajectory_captioned*.json`` (None on miss or malformed)."""
    if not example_id or not demo_dir:
        return None
    found = sorted((Path(demo_dir) / example_id).glob("trajectory_captioned*.json"))
    if not found:
        logger.warning("No per-task demo for %s under %s", example_id, demo_dir)
        return None
    try:
        raw = json.loads(found[0].read_text(encoding="utf-8"))
        subtasks: List[Subtask] = [
            _parse_subtask(st) for st in raw.get("subtasks") or [] if isinstance(st, dict)
        ]
    except Exception as e:  # noqa: BLE001 - tolerate any malformed demo
        logger.warning("Failed to load demo %s: %s", found[0], e)
        return None
    if not subtasks:
        # An empty plan would still count as "on the last subtask", so the first
        # completion signal would terminate the episode. Run without a demo instead.
        logger.warning("Demo %s has no subtasks", found[0])
        return None
    return WorkflowPlan(subtasks=subtasks)
