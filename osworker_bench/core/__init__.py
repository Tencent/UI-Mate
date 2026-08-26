"""
OSWorld Core Framework

A clean, class-based architecture for running OSWorld experiments.
"""

from core.protocols import AgentProtocol, AgentResponse, BaseAgent, EnvProtocol
from core.config import (
    EnvironmentConfig,
    AgentConfig,
    RunConfig,
    ExperimentConfig,
    build_argparser,
    parse_config,
)
from core.runners import (
    BaseRunner,
    TestRunner,
    RolloutRunner,
    DataCollectionRunner,
    HumanRunner,
    create_runner,
)
from core.executor import (
    ExecutionStrategy,
    SequentialExecutor,
    MultiProcessExecutor,
    create_executor,
)
from core.registry import register_agent, create_agent
from core.adapters import LegacyAgentAdapter

__all__ = [
    # Protocols
    "AgentProtocol",
    "AgentResponse",
    "BaseAgent",
    "EnvProtocol",
    # Config
    "EnvironmentConfig",
    "AgentConfig",
    "RunConfig",
    "ExperimentConfig",
    "build_argparser",
    "parse_config",
    # Runners
    "BaseRunner",
    "TestRunner",
    "RolloutRunner",
    "DataCollectionRunner",
    "HumanRunner",
    "create_runner",
    # Executors
    "ExecutionStrategy",
    "SequentialExecutor",
    "MultiProcessExecutor",
    "create_executor",
    # Registry
    "register_agent",
    "create_agent",
    # Adapters
    "LegacyAgentAdapter",
]
