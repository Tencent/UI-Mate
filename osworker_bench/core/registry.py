"""
Agent Registry

Registration and factory system for agents.
Enables the universal entrypoint to load any agent by name.
"""

from typing import Any, Dict, List, Optional
import importlib
import importlib.util
import logging

logger = logging.getLogger("desktopenv.registry")


def _module_available(module_path: str) -> bool:
    """True if ``module_path`` can be located without importing it.

    ``find_spec`` imports parent packages, so a missing parent raises
    ModuleNotFoundError rather than returning None; ValueError/ImportError can
    also surface for half-initialised packages. Any of those means "not here".
    """
    try:
        return importlib.util.find_spec(module_path) is not None
    except (ImportError, AttributeError, ValueError):
        return False

# Agent registry: name -> registration info
_AGENT_REGISTRY: Dict[str, Dict[str, Any]] = {}


def register_agent(
    name: str,
    module_path: str,
    class_name: str,
    default_config: Optional[Dict[str, Any]] = None,
    predict_signature: str = "standard",
) -> None:
    """
    Register an agent.

    Args:
        name: Unique name for the agent (e.g., "ui_mate")
        module_path: Python module path (e.g., "mm_agents.ui_mate")
        class_name: Class name in the module (e.g., "UIMateAgent")
        default_config: Default configuration for the agent
        predict_signature: Prediction signature type:
            - "standard": (instruction, obs) -> AgentResponse
            - "tuple": returns (response, actions) tuple
            - "opencua": returns (response, actions, info_dict) tuple
    """
    # Trimmed distributions (e.g. the OSWorker benchmark release) ship only a
    # subset of mm_agents/. Registering an agent whose module was stripped out
    # would make it show up in --help and in "Available registered agents", then
    # fail with ModuleNotFoundError at create_agent time — after the env is
    # already up. Skip it here so the advertised list matches what can run.
    # find_spec only reads metadata; it does not execute the module.
    if not _module_available(module_path):
        logger.debug(
            f"Skipping agent {name!r}: module {module_path!r} is not present in this distribution"
        )
        return

    _AGENT_REGISTRY[name] = {
        "module_path": module_path,
        "class_name": class_name,
        "default_config": default_config or {},
        "predict_signature": predict_signature,
    }
    logger.debug(f"Registered agent: {name} ({module_path}.{class_name})")


def get_registered_agents() -> List[str]:
    """Get list of registered agent names."""
    return list(_AGENT_REGISTRY.keys())


def get_agent_info(name: str) -> Optional[Dict[str, Any]]:
    """Get registration info for an agent."""
    return _AGENT_REGISTRY.get(name)


def create_agent(name: str, **kwargs) -> Any:
    """
    Create an agent by name.

    Args:
        name: Registered agent name or module.ClassName path
        **kwargs: Arguments passed to agent constructor

    Returns:
        Agent instance (possibly wrapped in LegacyAgentAdapter)

    Raises:
        ValueError: If agent cannot be found or loaded
    """
    if name in _AGENT_REGISTRY:
        info = _AGENT_REGISTRY[name]
        module = importlib.import_module(info["module_path"])
        agent_class = getattr(module, info["class_name"])

        # Merge default config with provided kwargs
        config = {**info["default_config"], **kwargs}

        logger.info(f"Creating agent: {name} ({info['module_path']}.{info['class_name']})")
        agent = agent_class(**config)

        # Wrap in adapter if needed
        if info["predict_signature"] != "standard":
            from core.adapters import LegacyAgentAdapter

            agent = LegacyAgentAdapter(agent, info["predict_signature"])
            logger.debug(f"Wrapped agent in LegacyAgentAdapter (signature: {info['predict_signature']})")

        return agent

    # Try to load as module.ClassName path
    if "." in name:
        parts = name.rsplit(".", 1)
        module_path, class_name = parts
        try:
            module = importlib.import_module(module_path)
            agent_class = getattr(module, class_name)
            logger.info(f"Creating agent from path: {name}")
            return agent_class(**kwargs)
        except (ImportError, AttributeError) as e:
            raise ValueError(f"Could not load agent '{name}': {e}")

    raise ValueError(
        f"Unknown agent: {name}. "
        f"Available registered agents: {list(_AGENT_REGISTRY.keys())}. "
        f"You can also specify a full module path like 'mm_agents.ui_mate.UIMateAgent'."
    )


# ================== Register Built-in Agents ==================

# UI-Mate agent. keep_first_image and recent_think_steps are per-configuration
# knobs on this one class; see configs/osworker_benchmark/.
register_agent(
    name="ui_mate",
    module_path="mm_agents.ui_mate",
    class_name="UIMateAgent",
    default_config={
        "action_space": "pyautogui",
        "observation_type": "screenshot",
        "history_n": 100,
        "coordinate_type": "relative",
        "api_backend": "openai",
        "images_to_keep": 20,
    },
    predict_signature="tuple",
)
