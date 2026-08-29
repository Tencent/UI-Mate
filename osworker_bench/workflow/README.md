# workflow/

Demo-in-the-loop guidance for an OSWorld agent: split each task demo into a subtask sequence, write the current subtask's guidance into `obs` at every step, and advance when the model emits a completion signal. Tasks without a matching demo run unchanged (passthrough).

**Core constraint:** all control flow stays in the harness (a `core.runners.RunnerHook`); do not wrap the agent. The agent only **reads** a few `obs` keys via `consume.py`. Dependency is one-way `workflow → core`, with zero reverse dependency.

## File layout

Three layers from most stable to most specific, plus a framework layer and an agent consumption layer:

| File | Layer | Role |
|------|-------|------|
| `base.py` | Framework | `WorkflowHook` base class and `name→class` registry (`register_hook` / `create_workflow_hook`), independent of any playstyle |
| `engine.py` | **L1 stable core** | Data models (`Subtask` / `WorkflowPlan`), state machine (`SubtaskTracker`), response adapters (`text_of` / `extract_actions` / `replace_actions`), obs injection (`inject_guidance` / `inject_system_prompt`). Shared by all workflows |
| `democua_source.py` | **L2 data source** | Parse `trajectory_captioned*.json` into a `WorkflowPlan` (single exit `resolve_plan`). Change this layer only when the demo format changes |
| `key_action_runtime.py` | **L3 playstyle** | Built-in hook `KeyActionRuntimeHook` (registered name `key-action-runtime`): put the demo key-action workflow in the **first user turn** in l1_5 SFT format; `subtask_complete` advances, `finished` terminates. Copy this file for a new playstyle |
| `consume.py` | Consumption | Agent-side read-only access to obs keys written by the hook; missing keys are a no-op |

## How one episode is guided

```
on_episode_start : resolve plan from task_config["id"], _bind(plan)   (no plan → passthrough)
 → on_before_step   : write guidance into obs  --consume-->  fold into the model prompt
 → agent.predict
 → on_after_predict : detect the completion signal → advance the tracker;
                      intercept a mistaken task-level DONE; replace the completion action with WAIT
 → execute → next step
```

The runner step loop is unchanged. The hook owns the subtask tracker and translates "subtask complete" and a mistaken "DONE" into tracker advance + a harmless `WAIT`, so finishing one subtask does not end the episode.

## Three obs keys (hook writes, consume reads)

| obs key | Writer | consume folds into |
|---------|--------|----------------|
| `workflow_system_prompt` | `engine.inject_system_prompt` | system message (append) |
| `workflow_action_patch` | `key_action_runtime.inject_subtask_complete_patch` | computer_use tool schema |
| `workflow_guidance` | `engine.inject_guidance` | payload only; **which user turn it lands in is the hook's choice** — register a `(messages, obs) -> messages` rewriter via `consume.register_post_processor` (`key-action-runtime` uses this to put the workflow in the first user turn) |

`register_post_processor` is the only exit for "placement is known only when messages are assembled": the hook writes obs, the rewriter applies its own layout marker, and a mismatch returns messages unchanged.

## Adding a new workflow hook

1. Create `workflow/my_workflow.py`, inherit `WorkflowHook`; in `on_episode_start` resolve the plan and `self._bind(plan)`, then override `on_before_step` / `on_after_predict` as needed. Reuse `engine` for the mechanism (tracker, obs injection, response adapters) and reuse or replace `democua_source` for the plan.
2. Register with `@register_hook("my_workflow")`.
3. Import it in `workflow/__init__.py` (triggers self-registration).
4. Set `agent.extra.demo_in_the_loop_mode: my_workflow` in the config.

```python
# workflow/my_workflow.py
from workflow import engine, democua_source
from workflow.base import WorkflowHook, register_hook

@register_hook("my_workflow")
class MyWorkflowHook(WorkflowHook):
    def on_episode_start(self, agent, env, task_config, result_dir):
        self._bind(democua_source.resolve_plan(task_config.get("id"), demo_dir=...))  # None → passthrough

    def on_before_step(self, step_idx, instruction, obs, env, result_dir):
        if not self.active:
            return obs
        # Use engine.inject_* to write guidance into obs, and add a matching read-only reader in consume.py
        return obs

    def on_after_predict(self, step_idx, instruction, obs, response):
        if not self.active:
            return response
        # Inspect the response, advance self._tracker, rewrite actions if needed
        return response
```

**Constraint:** to inject anything new into the model, write it into an `obs` key and add a matching **read-only** reader in `consume.py` (or register a post-processor). Keep all decisions in the hook; the agent side only consumes data.

## Configuration

| key | Meaning |
|-----|------|
| `agent.extra.enable_demo_in_the_loop` | `true` attaches the hook, otherwise no-op |
| `agent.extra.demo_in_the_loop_mode` | which hook to use (required when enable is true) |
| `run.demo_dir` | demo source, looked up as `{demo_dir}/{example_id}/trajectory_captioned*.json` (also overridable with `--demo_dir`) |

You can create a DemoCUA config from `configs/osworker_benchmark/ui_mate.yaml`
and enable `agent.extra.enable_demo_in_the_loop`.
