"""
Configuration System

Dataclass-based configuration with YAML/JSON support.
Eliminates argument parser duplication across scripts.
"""

from dataclasses import dataclass, field, asdict
from typing import Any, Dict, Optional
import argparse
import json
import os

# Try to import yaml, but make it optional
try:
    import yaml
    YAML_AVAILABLE = True
except ImportError:
    YAML_AVAILABLE = False


@dataclass
class EnvironmentConfig:
    """Configuration for the desktop environment."""
    provider_name: str = "docker"
    region: str = "us-east-1"
    path_to_vm: Optional[str] = None
    snapshot_name: str = "init_state"
    headless: bool = False
    screen_width: int = 1920
    screen_height: int = 1080
    os_type: str = "Ubuntu"
    enable_proxy: bool = False
    force_proxy: bool = False
    client_password: str = ""
    cache_dir: str = "cache"  # cache directory for task-related files

    def __post_init__(self):
        if not self.client_password:
            self.client_password = "password"


@dataclass
class AgentConfig:
    """Configuration for the agent."""
    name: str = "ui_mate"  # Agent class name or registered name
    model: str = "UI_Mate"
    model_path: str = "tencent/UI-Mate-27B"
    action_space: str = "pyautogui"
    observation_type: str = "screenshot"
    max_tokens: int = 1500
    temperature: float = 1.0
    top_p: float = 0.9
    max_trajectory_length: int = 3

    # Agent-specific config (passed to agent constructor)
    extra: Dict[str, Any] = field(default_factory=dict)


@dataclass
class RunConfig:
    """Configuration for a run."""
    mode: str = "test"  # test, rollout, data_collection, human, eval_only
    max_steps: int = 15
    sleep_after_execution: float = 3.0
    env_ready_wait: float = 60.0  # Wait time after reset
    settle_wait: float = 20.0  # Wait time before evaluation
    record_video: bool = True

    # Task selection
    domain: str = "all"
    test_all_meta_path: str = "evaluation_examples/test_all.json"
    test_config_base_dir: str = "evaluation_examples"

    # Output
    result_dir: str = "./results"

    # Parallelization
    num_envs: int = 1

    # Logging
    log_level: str = "INFO"

    # Data collection specific
    collect_pre_action_obs: bool = False

    # When True, treat empty or error-like actions as end of episode (e.g. EvoCUA)
    empty_actions_break: bool = False

    # A root, not a file: {demo_dir}/{example_id}/trajectory_captioned*.json.
    demo_dir: Optional[str] = None

    def get(self, key: str, default: Any = None) -> Any:
        """Dict-like access for backward compatibility."""
        return getattr(self, key, default)


@dataclass
class ExperimentConfig:
    """Complete configuration for an experiment."""
    environment: EnvironmentConfig = field(default_factory=EnvironmentConfig)
    agent: AgentConfig = field(default_factory=AgentConfig)
    run: RunConfig = field(default_factory=RunConfig)

    def __post_init__(self):
        # Fail fast before VM startup.
        from core.env_factory import resolve_stack
        resolve_stack(self.environment.os_type)
        if self.environment.provider_name != "docker":
            raise ValueError("This release supports only provider_name='docker'.")
        if self.agent.action_space != "pyautogui":
            raise ValueError("This release supports only action_space='pyautogui'.")
        if self.agent.observation_type != "screenshot":
            raise ValueError("This release supports only observation_type='screenshot'.")

    @classmethod
    def from_yaml(cls, path: str) -> "ExperimentConfig":
        """Load configuration from YAML file."""
        if not YAML_AVAILABLE:
            raise ImportError("PyYAML is required to load YAML configs. Install with: pip install pyyaml")
        with open(path, "r") as f:
            data = yaml.safe_load(f)
        return cls.from_dict(data)

    @classmethod
    def from_json(cls, path: str) -> "ExperimentConfig":
        """Load configuration from JSON file."""
        with open(path, "r") as f:
            data = json.load(f)
        return cls.from_dict(data)

    @classmethod
    def from_dict(cls, data: Dict) -> "ExperimentConfig":
        """Create config from dictionary."""
        env_data = data.get("environment", {})
        agent_data = data.get("agent", {})
        run_data = data.get("run", {})

        return cls(
            environment=EnvironmentConfig(**env_data),
            agent=AgentConfig(**agent_data),
            run=RunConfig(**run_data),
        )

    def to_dict(self) -> Dict:
        """Convert to dictionary."""
        return {
            "environment": asdict(self.environment),
            "agent": asdict(self.agent),
            "run": asdict(self.run),
        }

    def save_yaml(self, path: str) -> None:
        """Save configuration to YAML file."""
        if not YAML_AVAILABLE:
            raise ImportError("PyYAML is required to save YAML configs. Install with: pip install pyyaml")
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, "w") as f:
            yaml.dump(self.to_dict(), f, default_flow_style=False)

    def save_json(self, path: str) -> None:
        """Save configuration to JSON file."""
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, "w") as f:
            json.dump(self.to_dict(), f, indent=2)


def build_argparser() -> argparse.ArgumentParser:
    """
    Build argument parser with all standard arguments.

    Returns:
        ArgumentParser that can be extended with agent-specific args.
    """
    parser = argparse.ArgumentParser(
        description="OSWorld Universal Evaluation Runner",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )

    # Config file (highest priority)
    parser.add_argument(
        "--config",
        type=str,
        help="Path to YAML/JSON config file",
    )
    # Environment args
    env_group = parser.add_argument_group("Environment")
    env_group.add_argument(
        "--provider",
        type=str,
        default=None,
        choices=["docker"],
        help="VM provider",
    )
    env_group.add_argument("--region", type=str, default=None, help="Cloud region")
    env_group.add_argument("--path_to_vm", type=str, default=None, help="Path to VM or VM identifier")
    env_group.add_argument("--headless", action="store_true", help="Run in headless mode")
    env_group.add_argument("--screen_width", type=int, default=None, help="Screen width")
    env_group.add_argument("--screen_height", type=int, default=None, help="Screen height")
    env_group.add_argument("--client_password", type=str, default=None, help="VM client password")
    env_group.add_argument(
        "--cache_dir",
        type=str,
        default=None,
        help=(
            "Base dir for per-task cache files; each task resolves under "
            "{cache_dir}/{task_id}. E.g. point at a verified benchmark's cache."
        ),
    )

    # Agent args
    agent_group = parser.add_argument_group("Agent")
    agent_group.add_argument(
        "--agent",
        type=str,
        default=None,
        help="Agent name (registered name or module.ClassName)",
    )
    agent_group.add_argument("--model", type=str, default=None, help="Model name")
    agent_group.add_argument(
        "--action_space",
        type=str,
        default=None,
        choices=["pyautogui"],
        help="Action space type",
    )
    agent_group.add_argument(
        "--observation_type",
        type=str,
        default=None,
        choices=["screenshot"],
        help="Observation type",
    )
    agent_group.add_argument("--max_tokens", type=int, default=None, help="Max tokens for LLM")
    agent_group.add_argument("--temperature", type=float, default=None, help="LLM temperature")
    agent_group.add_argument("--top_p", type=float, default=None, help="LLM top_p")
    agent_group.add_argument("--max_trajectory_length", type=int, default=None, help="Max history length")
    agent_group.add_argument("--prompt_type", type=str, default=None, help="Prompt type (e.g. l2, l3), overrides agent.extra.prompt_type")
    agent_group.add_argument("--history_n", type=int, default=None, help="History turns for agent, overrides agent.extra.history_n")
    agent_group.add_argument("--recent_think_steps", type=int, default=None, help="Keep <think> only for the most recent N history steps; overrides agent.extra.recent_think_steps. Pass a large value (>= max_steps) to preserve all.")

    # Run args
    run_group = parser.add_argument_group("Run")
    run_group.add_argument(
        "--mode",
        type=str,
        default=None,
        choices=["test", "rollout", "data_collection", "human", "eval_only"],
        help="Run mode",
    )
    run_group.add_argument("--max_steps", type=int, default=None, help="Max steps per episode")
    run_group.add_argument("--sleep_after_execution", type=float, default=None, help="Sleep after each action")
    run_group.add_argument("--domain", type=str, default=None, help="Domain to evaluate (or 'all')")
    run_group.add_argument("--test_all_meta_path", type=str, default=None, help="Path to test metadata JSON")
    run_group.add_argument("--test_config_base_dir", type=str, default=None, help="Base dir for task configs")
    run_group.add_argument("--result_dir", type=str, default=None, help="Output directory for results")
    run_group.add_argument("--num_envs", type=int, default=None, help="Number of parallel environments")
    run_group.add_argument(
        "--log_level",
        type=str,
        default=None,
        choices=["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"],
        help="Logging level",
    )

    run_group.add_argument(
        "--demo_dir",
        type=str,
        default=None,
        help="Per-task demo root: {dir}/{example_id}/trajectory_captioned*.json.",
    )

    return parser


def parse_config(args: argparse.Namespace) -> ExperimentConfig:
    """
    Parse config from arguments, with config file taking precedence.

    Priority (highest to lowest):
    1. Command line arguments (if explicitly provided)
    2. Config file
    3. Defaults

    Args:
        args: Parsed argument namespace

    Returns:
        ExperimentConfig with merged configuration
    """
    # Start with defaults
    config = ExperimentConfig()

    # Load from config file if provided.
    if args.config:
        if args.config.endswith(".yaml") or args.config.endswith(".yml"):
            config = ExperimentConfig.from_yaml(args.config)
        elif args.config.endswith(".json"):
            config = ExperimentConfig.from_json(args.config)
        print("Loaded config file: ", args.config)
    # Override with command line args (only if explicitly provided)
    # Environment config
    if args.provider is not None:
        config.environment.provider_name = args.provider
    if args.region is not None:
        config.environment.region = args.region
    if args.path_to_vm is not None:
        config.environment.path_to_vm = args.path_to_vm
    if args.headless:
        config.environment.headless = True
    if args.screen_width is not None:
        config.environment.screen_width = args.screen_width
    if args.screen_height is not None:
        config.environment.screen_height = args.screen_height
    if args.client_password is not None:
        config.environment.client_password = args.client_password
    if args.cache_dir is not None:
        config.environment.cache_dir = args.cache_dir

    # Agent config
    if args.agent is not None:
        config.agent.name = args.agent
    if args.model is not None:
        config.agent.model = args.model
    if args.action_space is not None:
        config.agent.action_space = args.action_space
    if args.observation_type is not None:
        config.agent.observation_type = args.observation_type
    if args.max_tokens is not None:
        config.agent.max_tokens = args.max_tokens
    if args.temperature is not None:
        config.agent.temperature = args.temperature
    if args.top_p is not None:
        config.agent.top_p = args.top_p
    if args.max_trajectory_length is not None:
        config.agent.max_trajectory_length = args.max_trajectory_length
    # Extra overrides: merge into agent.extra dict (CLI > YAML)
    if args.prompt_type is not None:
        config.agent.extra["prompt_type"] = args.prompt_type
    if args.history_n is not None:
        config.agent.extra["history_n"] = args.history_n
    if args.recent_think_steps is not None:
        config.agent.extra["recent_think_steps"] = args.recent_think_steps

    # Run config
    if args.mode is not None:
        config.run.mode = args.mode
    if args.max_steps is not None:
        config.run.max_steps = args.max_steps
    if args.sleep_after_execution is not None:
        config.run.sleep_after_execution = args.sleep_after_execution
    if args.domain is not None:
        config.run.domain = args.domain
    if args.test_all_meta_path is not None:
        config.run.test_all_meta_path = args.test_all_meta_path
    if args.test_config_base_dir is not None:
        config.run.test_config_base_dir = args.test_config_base_dir
    if args.result_dir is not None:
        config.run.result_dir = args.result_dir
    if args.num_envs is not None:
        config.run.num_envs = args.num_envs
    if args.log_level is not None:
        config.run.log_level = args.log_level

    if getattr(args, "demo_dir", None) is not None:
        config.run.demo_dir = args.demo_dir

    # Re-validate after CLI overrides.
    from core.env_factory import resolve_stack
    resolve_stack(config.environment.os_type)
    if config.environment.provider_name != "docker":
        raise ValueError("This release supports only provider_name='docker'.")
    if config.agent.action_space != "pyautogui":
        raise ValueError("This release supports only action_space='pyautogui'.")
    if config.agent.observation_type != "screenshot":
        raise ValueError("This release supports only observation_type='screenshot'.")

    # Fail here rather than at create_agent time. By then the runner has already
    # booted a VM/container per env, so an unknown agent name would cost a full
    # startup before surfacing. A dotted path is resolved by create_agent itself,
    # so only bare names are checked against the registry.
    agent_name = config.agent.name
    if agent_name and "." not in agent_name:
        from core.registry import get_registered_agents
        available = get_registered_agents()
        if agent_name not in available:
            raise ValueError(
                f"Unknown agent: {agent_name!r}. Available agents: {sorted(available)}. "
                f"Agents whose module is absent from this distribution are not "
                f"registered — see mm_agents/."
            )

    return config
