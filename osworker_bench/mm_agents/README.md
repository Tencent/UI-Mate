# mm_agents

Implementations of multimodal GUI agents. Each agent is registered in `core/registry.py`
and dynamically loaded by name at runtime via `create_agent(name)`.

## Registered Agents

| Name | Class | Module | `predict` signature |
|------|-----|------|--------------|
| `ui_mate` | `UIMateAgent` | `ui_mate.py` | tuple |
| `ui_mate_promptv2` | `UIMatePromptV2Agent` | `ui_mate_promptv2.py` | tuple |

The "`predict` signature" describes the return shape of each class's own implementation:
`tuple` returns `(response, actions)`, while `opencua` returns
`(response, actions, info)`. This shape is declared through `predict_signature` during
registration, and `LegacyAgentAdapter` in `core/adapters.py` normalizes each shape into
an `AgentResponse`. As a result, an agent obtained from the registry returns an
`AgentResponse`, rather than a tuple, from `predict()`.

`utils/` is not itself an agent; its consumers pull it into the runtime.

## Usage

Create agents by name rather than importing concrete agent classes directly:

```python
from core.registry import create_agent

agent = create_agent("ui_mate_promptv2", model="UI_Mate")
agent.reset()

instruction = "Please help me to find the nearest restaurant."
obs = {"screenshot": open("path/to/observation.jpg", "rb").read()}
response = agent.predict(instruction, obs)   # AgentResponse
response.actions      # List of actions to execute
response.thought      # Reasoning trace (optional)
response.raw_response # Raw LLM output for debugging
```

Importing `UIMateAgent` directly with
`from mm_agents.ui_mate import UIMateAgent` couples that agent's dependencies
to the caller and bypasses the registry's default configuration.

## Observation and Action Spaces

All currently available agents use `observation_type="screenshot"` and
`action_space="pyautogui"`; these are the only accepted public values.

## Adding an Agent

Implement `AgentProtocol` from `core/protocols.py` (or subclass `BaseAgent`), then
register the implementation in `core/registry.py`. See "Adding a New Agent" in the
root README for the complete procedure.
