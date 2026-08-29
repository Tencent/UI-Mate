"""Generic base class + registry for workflow hooks (see README.md)."""
from __future__ import annotations

from typing import Callable, Dict, Optional, Type, TYPE_CHECKING

from core.runners import RunnerHook
from workflow import engine

if TYPE_CHECKING:
    from core.config import ExperimentConfig


class WorkflowHook(RunnerHook):
    """Holds the per-episode plan and its subtask tracker.

    Subclasses resolve a plan in ``on_episode_start`` via ``self._bind(plan)``, then
    override ``on_before_step`` / ``on_after_predict``. With no plan bound the hook is
    inert, which is how tasks without a demo run untouched.
    """

    def __init__(self, config: "ExperimentConfig"):
        self._plan: Optional[engine.WorkflowPlan] = None
        self._tracker: Optional[engine.SubtaskTracker] = None

    def _bind(self, plan: Optional[engine.WorkflowPlan]) -> None:
        self._plan = plan
        self._tracker = engine.SubtaskTracker(plan) if plan is not None else None

    @property
    def active(self) -> bool:
        return self._plan is not None and self._tracker is not None


# === Hook registry =========================================================
# ``agent.extra.demo_in_the_loop_mode`` -> WorkflowHook class.
WORKFLOW_HOOKS: Dict[str, Type[WorkflowHook]] = {}


def register_hook(name: str) -> Callable[[Type[WorkflowHook]], Type[WorkflowHook]]:
    """Class decorator: makes the hook selectable as ``demo_in_the_loop_mode:<name>``."""
    def _decorator(cls: Type[WorkflowHook]) -> Type[WorkflowHook]:
        WORKFLOW_HOOKS[name] = cls
        return cls
    return _decorator


def create_workflow_hook(config: "ExperimentConfig") -> WorkflowHook:
    """Instantiate the hook named by ``agent.extra.demo_in_the_loop_mode``; a missing or
    unknown name is a config error rather than a silently demo-less run."""
    name = config.agent.extra.get("demo_in_the_loop_mode")
    cls = WORKFLOW_HOOKS.get(name) if name else None
    if cls is None:
        raise ValueError(
            f"enable_demo_in_the_loop is true but demo_in_the_loop_mode is "
            f"{'unknown' if name else 'missing'} ({name!r}); "
            f"available: {sorted(WORKFLOW_HOOKS)}"
        )
    return cls(config)
