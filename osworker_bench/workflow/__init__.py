"""Composable runner hooks. "Demo in the loop" is one effect built on the
mechanism; see README.md for the layout and how to add a hook."""
from workflow.base import WorkflowHook, create_workflow_hook
# Self-register the built-in hook.
from workflow import key_action_runtime  # noqa: F401

__all__ = ["WorkflowHook", "create_workflow_hook"]
