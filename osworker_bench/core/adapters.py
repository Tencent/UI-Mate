"""
Legacy Agent Adapters

Adapters for agents that don't conform to the standard AgentProtocol.
Provides backward compatibility with existing agent implementations.
"""

import re
from typing import Any, Dict, List, Optional, Tuple
import logging

from core.protocols import AgentProtocol, AgentResponse

logger = logging.getLogger("desktopenv.adapter")


def extract_thought_from_response(response: Any) -> Optional[str]:
    """
    Extract thought/reasoning from a raw response string using simple patterns.
    Used when the legacy agent returns a single string (no separate thought field).

    TODO: Prefer per-model thought parsing (each agent knows its own output format).
    This is a generic fallback. Due to thinking prompts, the opening <think> tag often
    does not appear in the output, so we prioritize "content before </think>".

    Tries in order:
    1. Content before </think> (thinking often has no opening tag in output)
    2. Content inside <think>...</think> (when both tags present)
    3. Content inside <thinking>...</thinking>
    4. Content between "Thought:" and the next "Action:" (or end of string)
    """
    if response is None:
        return None
    if isinstance(response, dict):
        return response.get("thought")
    text = str(response).strip()
    if not text:
        return None
    # 1) Content before </think> (opening tag often missing in output)
    if "</think>" in text:
        part = text.split("</think>", 1)[0].strip()
        if part:
            return part
    # 2) <think>...</think> (both tags present)
    m = re.search(r"<think>\s*(.*?)\s*</think>", text, re.DOTALL | re.IGNORECASE)
    if m:
        t = m.group(1).strip()
        if t:
            return t
    # 3) <thinking>...</thinking>
    m = re.search(r"<thinking>\s*(.*?)\s*</thinking>", text, re.DOTALL | re.IGNORECASE)
    if m:
        t = m.group(1).strip()
        if t:
            return t
    # 4) Thought: ... (until Action: or end)
    m = re.search(r"Thought:\s*(.*?)(?=\s*Action:|$)", text, re.DOTALL | re.IGNORECASE)
    if m:
        t = m.group(1).strip()
        if t:
            return t
    return None


class LegacyAgentAdapter:
    """
    Adapter to wrap legacy agents that don't implement AgentProtocol.

    Handles different prediction signatures:
    - "tuple": Returns (response, actions) tuple
    - "opencua": Returns (response, actions, info_dict) tuple. Named after the
      agent it was written for, which is gone; kimi and kimi_k3 use it now.
    """

    def __init__(self, legacy_agent: Any, predict_signature: str = "tuple"):
        """
        Initialize the adapter.

        Args:
            legacy_agent: The legacy agent instance to wrap
            predict_signature: The prediction signature type
        """
        self._legacy_agent = legacy_agent
        self._predict_signature = predict_signature

        # Copy relevant attributes from legacy agent
        self.model = getattr(legacy_agent, "model", "unknown")
        self.action_space = getattr(legacy_agent, "action_space", "pyautogui")
        self.observation_type = getattr(legacy_agent, "observation_type", "screenshot")

        logger.debug(
            f"Created LegacyAgentAdapter for {type(legacy_agent).__name__} "
            f"with signature '{predict_signature}'"
        )

    def predict(self, instruction: str, obs: Dict[str, Any], **kwargs) -> AgentResponse:
        """
        Adapt legacy predict calls to new protocol.

        Args:
            instruction: Task instruction
            obs: Observation dict
            **kwargs: Additional arguments

        Returns:
            AgentResponse with standardized format
        """
        try:
            if self._predict_signature == "opencua":
                return self._predict_opencua(instruction, obs)
            else:  # "tuple" or "standard"
                return self._predict_tuple(instruction, obs)
        except Exception as e:
            logger.error(f"Prediction failed: {e}")
            import traceback
            logger.error(traceback.format_exc())
            return AgentResponse(
                raw_response=str(e),
                actions=[],
                thought=None,
                metadata={"error": str(e)},
            )

    def _predict_tuple(self, instruction: str, obs: Dict) -> AgentResponse:
        """Handle agents that return (response, actions) tuple."""
        result = self._legacy_agent.predict(instruction, obs)

        # Handle different return formats
        if isinstance(result, tuple) and len(result) >= 2:
            response, actions = result[0], result[1]
        elif isinstance(result, AgentResponse):
            return result
        else:
            # Single value returned, assume it's the response
            response = result
            actions = []

        # Ensure actions is a list
        if actions is None:
            actions = []
        elif not isinstance(actions, list):
            actions = [actions]

        # TODO: Prefer per-model thought parsing in each agent; here we use simple generic patterns.
        thought = extract_thought_from_response(response)

        return AgentResponse(
            raw_response=response,
            actions=actions,
            thought=thought,
        )

    def _predict_opencua(self, instruction: str, obs: Dict) -> AgentResponse:
        """Handle OpenCUA agents that return (response, actions, info_dict)."""
        result = self._legacy_agent.predict(instruction, obs)

        if isinstance(result, tuple) and len(result) >= 3:
            response, actions, info_dict = result[0], result[1], result[2]
        elif isinstance(result, tuple) and len(result) >= 2:
            response, actions = result[0], result[1]
            info_dict = {}
        else:
            response = result
            actions = []
            info_dict = {}

        if actions is None:
            actions = []
        elif not isinstance(actions, list):
            actions = [actions]

        # TODO: Prefer per-model thought parsing in each agent; here we use simple generic patterns.
        thought = extract_thought_from_response(response)

        return AgentResponse(
            raw_response=response,
            actions=actions,
            thought=thought,
            metadata=info_dict,
        )

    def reset(self, logger: Optional[logging.Logger] = None, **kwargs) -> None:
        """
        Reset the wrapped agent.

        Args:
            logger: Optional logger for this episode
            **kwargs: Additional reset parameters
        """
        # Try different reset signatures
        try:
            self._legacy_agent.reset(logger, **kwargs)
        except TypeError:
            try:
                self._legacy_agent.reset(logger)
            except TypeError:
                try:
                    self._legacy_agent.reset()
                except Exception as e:
                    logger.warning(f"Failed to reset legacy agent: {e}")

    def __getattr__(self, name: str) -> Any:
        """
        Forward attribute access to the wrapped agent.

        This allows accessing agent-specific attributes through the adapter.
        """
        return getattr(self._legacy_agent, name)
