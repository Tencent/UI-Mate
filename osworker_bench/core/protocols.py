"""
Agent Protocol and Base Classes

Defines the standard interface that all agents must implement.
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional, Protocol, runtime_checkable
import logging


@dataclass
class AgentResponse:
    """
    Standardized response from agent prediction.

    Attributes:
        raw_response: Original LLM response (for logging/debugging)
        actions: List of parsed actions to execute
        thought: Agent's reasoning/thought process (optional)
        metadata: Extra information for data collection or debugging
    """
    raw_response: Any
    actions: List[Any]
    thought: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = field(default_factory=dict)


@runtime_checkable
class AgentProtocol(Protocol):
    """
    Protocol that all agents must implement.

    This defines the minimal interface required for an agent to work
    with the OSWorld framework. Agents can implement this protocol
    directly or extend BaseAgent.
    """

    def predict(self, instruction: str, obs: Dict[str, Any]) -> AgentResponse:
        """
        Predict the next action(s) based on instruction and observation.

        Args:
            instruction: Task instruction for the agent
            obs: Observation dict with keys like 'screenshot', 'accessibility_tree', etc.

        Returns:
            AgentResponse containing parsed actions and metadata
        """
        ...

    def reset(self, logger: Optional[logging.Logger] = None, **kwargs) -> None:
        """
        Reset agent state for a new episode.

        Args:
            logger: Optional logger for this episode
            **kwargs: Additional reset parameters (e.g., vm_ip)
        """
        ...


@runtime_checkable
class EnvProtocol(Protocol):
    """Contract the runner requires from a desktop environment.

    ``DesktopEnv`` is the built-in implementation, but any object satisfying
    this protocol can be injected instead (a self-managed sandbox, a remote
    fleet, a mock), which is what keeps the episode loop independent of VM
    virtualization. ``evaluate()`` is required by ``mode="test"`` and never
    called by ``mode="rollout"``; recording (``controller.start_recording()`` /
    ``controller.end_recording(path)``) is only needed with ``record_video``.
    """

    vm_ip: str                       # passed to agent.reset(vm_ip=...); "" if N/A
    eval_result_dir: Optional[str]   # runner writes the result dir here

    def reset(
        self,
        task_config: Optional[Dict[str, Any]] = None,
        seed: Any = None,
        options: Any = None,
    ) -> Dict[str, Any]:
        """Apply ``task_config``'s initial state and return the first obs."""
        ...

    def _get_obs(self) -> Dict[str, Any]:
        """Return ``{"screenshot": png_bytes}``, plus "accessibility_tree" /
        "terminal" when the observation type asks for them."""
        ...

    def step(self, action: Any, pause: float = 2):
        """Execute ``action`` and return ``(obs, reward, done, info)``."""
        ...

    def close(self) -> None:
        """Release any resources held by the environment."""
        ...


class BaseAgent(ABC):
    """
    Abstract base class for all agents.

    Provides common functionality and enforces the AgentProtocol.
    Agents can extend this class for convenience, or implement
    AgentProtocol directly for more flexibility.
    """

    def __init__(
        self,
        model: str,
        action_space: str = "pyautogui",
        observation_type: str = "screenshot",
        **config
    ):
        """
        Initialize the agent.

        Args:
            model: Model name/identifier
            action_space: Action space type ("pyautogui")
            observation_type: Observation type ("screenshot")
            **config: Additional agent-specific configuration
        """
        self.model = model
        self.action_space = action_space
        self.observation_type = observation_type
        self.config = config
        self._logger = logging.getLogger(f"desktopenv.agent.{self.__class__.__name__}")

        # Episode state
        self.thoughts: List[str] = []
        self.actions: List[Any] = []
        self.observations: List[Dict] = []

    @abstractmethod
    def predict(self, instruction: str, obs: Dict[str, Any]) -> AgentResponse:
        """
        Predict the next action(s). Subclasses must implement this.

        Args:
            instruction: Task instruction
            obs: Current observation

        Returns:
            AgentResponse with actions to execute
        """
        pass

    def reset(self, logger: Optional[logging.Logger] = None, **kwargs) -> None:
        """
        Reset agent state for a new episode.

        Args:
            logger: Optional logger for this episode
            **kwargs: Additional reset parameters
        """
        if logger is not None:
            self._logger = logger
        self.thoughts.clear()
        self.actions.clear()
        self.observations.clear()
        # Allow subclasses to handle extra kwargs
        self._on_reset(**kwargs)

    def _on_reset(self, **kwargs) -> None:
        """
        Hook for subclasses to handle additional reset parameters.

        Override this method to handle agent-specific reset logic
        (e.g., setting vm_ip, clearing caches, etc.)
        """
        pass

    @property
    def logger(self) -> logging.Logger:
        """Get the current logger."""
        return self._logger

    def _record_step(self, thought: str, action: Any, obs: Dict) -> None:
        """
        Record a step in the episode history.

        Args:
            thought: Agent's thought/reasoning for this step
            action: Action taken
            obs: Observation received
        """
        self.thoughts.append(thought)
        self.actions.append(action)
        self.observations.append(obs)
