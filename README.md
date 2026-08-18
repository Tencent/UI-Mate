<div align="center">

# <img src="assets/UI-Mate-icon.png" width="40" align="absmiddle" alt=""> UI-Mate

### Advancing Foundation GUI Agents with In-Context Demonstrations

**Show the workflow once. Let the agent adapt it to the task at hand.**

Tencent HY Frontier

[![Project Page](https://img.shields.io/badge/Project%20Page-ui--mate.github.io-2456e6?logo=googlechrome&logoColor=white)](https://ui-mate.github.io)
[![arXiv](https://img.shields.io/badge/arXiv-b31b1b?logo=arxiv&logoColor=white)](https://arxiv.org/abs/2608.15930)
[![Models](https://img.shields.io/badge/%F0%9F%A4%97%20Models-tencent%2Fui--mate-ffd21e)](https://huggingface.co/collections/tencent/ui-mate)
[![Code](https://img.shields.io/badge/Code-Tencent%2FUI--Mate-181717?logo=github&logoColor=white)](https://github.com/Tencent/UI-Mate)
[![OSWorkerBench](https://img.shields.io/badge/%F0%9F%A4%97%20OSWorkerBench-Coming%20Soon-ff8f00)]()

</div>

<img width="3008" height="724" alt="github_teaser" src="https://github.com/user-attachments/assets/6ff5b154-5105-4d3a-b5a0-7e95e95deffe" />


## 🔍 Overview

UI-Mate is a foundation GUI agent for long-horizon work across applications and
operating systems. It observes the live screen, reasons over visible state, and
acts through keyboard and mouse events on the native desktop.

Most computer-use agents accept only a text instruction. That works when the
goal is easy to describe, but real workflows also depend on personal tools,
file layouts, naming conventions, and organization-specific procedures. These
details are often easier to **show** than to write down.

UI-Mate therefore supports two complementary ways to express intent:


| General computer use                                                                          | Demonstration-guided computer use                                                                        |
| --------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| The agent plans and executes a task from a natural-language instruction and live screenshots. | A related human demonstration is distilled into a reusable workflow that guides execution on a new task. |


The demonstration is **advice, not a script**. UI-Mate follows the demonstrated
procedure where it carries user intent, while re-planning from the live
interface whenever the target task, data, window layout, or application state
differs.

## ✨ Highlights



### 🔄 Scalable, environment-grounded training

UI-Mate uses a closed-loop data engine that connects:

```text
task synthesis → environment construction → rollout → verification & filtering
      ↑                                                        ↓
      └──────── capability diagnosis & data rebalancing ───────┘
```

- Instructions are sourced from open datasets, failed-rollout decomposition,
authentic work files, static websites, and application capability trees.
- Runnable environments are automatically constructed with task-specific
files, application state, and randomized visual configurations.
- A unified rollout layer supports heterogeneous Ubuntu, Windows, and macOS
environments.
- Multimodal filtering verifies task validity and checks evidence for every
required deliverable instead of trusting the agent's final claim.
- A hierarchical capability tree identifies coverage gaps and redirects data
generation toward underrepresented applications, operations, and task
lengths.



### 🧠 Training a General CUA

Supervised fine-tuning first teaches the interaction protocol, visual
grounding, application workflows, and cross-application execution. UI-Mate is
then optimized online in executable environments using programmatic task
verifiers and end-to-end completion rewards.

The training stack includes:

- asynchronous group-relative optimization for long and variable rollout
horizons;
- trajectory-to-token credit assignment through decision-turn centering and
token-level advantage normalization;
- adaptive curriculum sampling that reallocates rollouts toward weak
application domains; and
- an optional Process Credit Model (PCM) that localizes verifier-derived credit
to the decisions most relevant to success or failure.



### 🎬 Learn procedures from one demonstration

A UI-Mate demonstration is a recorded successful desktop execution: every
keyboard and pointer action together with screenshots immediately before and
after each one. It may be recorded by a human, or taken from a successful
rollout of a stronger GUI agent. The trace is then:

1. normalized into a consistent action-and-frame representation;
2. grounded with the recorded action facts and annotated by a vision-language
  model;
3. segmented into named subtasks with goals and completion criteria; and
4. injected at inference time as a compact workflow for the current subtask.

Low-level coordinates are not treated as the solution. The live screenshot
remains authoritative, allowing the agent to transfer a procedure across
different content, layouts, and application states.

### 🖥️ A native, model-agnostic desktop application

The UI-Mate application is an OpenAI-compatible client rather than a bundled
inference engine. The same desktop client can connect to a hosted endpoint, a
self-hosted model, or an on-device model while keeping the agent policy in one
shared harness.

It provides:

- native screen observation and keyboard/mouse actuation;
- step-by-step screenshots, actions, status, and timing;
- demonstration capture, retrieval, editing, and attachment;
- pause, resume, and user interjection during a run; and
- inspectable session and demonstration artifacts.



## 🧪 OSWorkerBench

We introduce **OSWorkerBench**, an office-centric benchmark for realistic,
long-horizon workflows and one-shot procedural learning.


| 100 tasks                     | 41 applications                             | 10 job families                | 33 + 45 demonstrations              |
| ----------------------------- | ------------------------------------------- | ------------------------------ | ----------------------------------- |
| Long-horizon office workflows | Normalized enterprise and productivity apps | Diverse professional scenarios | Same-task and variant-task guidance |


OSWorkerBench contains:

- **67 Long-Memory tasks** that require delayed reuse of dynamic information or
sustained tracking of workflow constraints;
- **49 Multi-App tasks** that transfer dynamic, multi-field information across
at least three logical applications;
- **two demonstration collections** — 33 self-demo targets paired with a
successful same-task rollout from a stronger agent, and 45 variant-demo targets
paired with a human recording of a related but non-identical task — both
evaluated under a protocol that holds the target, environment, budget, and
verifier fixed with and without the demonstration;
- **99 tasks involving at least two applications**, with 3.26 applications per
task on average and up to seven; and
- dense executable evaluators with 1–13 checkpoints per task (4.86 on average)
for both strict task success and partial progress.

The 33 and 45 pairings are separate demonstration collections rather than a
partition of the 100 tasks. The variant-demo protocol in particular measures
whether an agent can extract a reusable procedure from a related example—not
whether it can replay the example's action sequence.

## 📈 Results

Final public-benchmark numbers are being verified.

### Instruction-only benchmarks


| Benchmark                            | UI-Mate-9B | UI-Mate-27B |
| ------------------------------------ | ---------- | ----------- |
| OSWorld-Verified · avg score         | **66.2**   | **77.0**    |
| WindowsAgentArena · avg score        | **61.7**   | **66.2**    |
| OSWorkerBench (100) · strict success | **34.00**  | **41.00**   |
| OSWorkerBench (100) · progress       | **66.55**  | **76.86**   |


On OSWorkerBench, UI-Mate-27B improves over its Qwen3.6-27B base model by
**17.67 points** in strict success and **24.51 points** in progress.

### Demonstration-guided execution

UI-Mate-27B in the **self-demo** setting, where each target is paired with a
successful rollout of that same task from a stronger agent. Initial states,
budgets, and evaluators are identical; only the demonstration differs.


| Evaluation set · metric                        | Instruction only | + one self-demo | Change    |
| ---------------------------------------------- | ---------------- | --------------- | --------- |
| OSWorkerBench-Subset (33) · strict success (%) | 17.17            | **35.35**       | +18.18 pp |
| OSWorkerBench-Subset (33) · progress (%)       | 67.85            | **81.14**       | +13.29 pp |
| OSWorld-Subset (30) · progress (%)             | 40.27            | **65.75**       | +25.48 pp |
| GameDev (10) · avg score (%)                   | 76.76            | **81.15**       | +4.39 pp  |
| GameDev (10) · avg trajectory length (steps)   | 303.6            | **253.1**       | −16.6%    |


Averaged over three runs per target on OSWorkerBench-Subset, five elsewhere.
Shorter GameDev trajectories at higher scores suggest demonstrations also remove
exploratory detours.

## 💻 Example Usage

UI-Mate runs against any OpenAI-compatible endpoint. Click a section to expand.

<details>
<summary><b>1 · Serve a checkpoint with vLLM</b></summary>

Two flags matter more than the rest. `--chat-template-content-format openai`
is required because the agent sends OpenAI-style content lists, and
`--limit-mm-per-prompt` has to admit at least `images_to_keep + 1` images —
six with the default of five, since the newest screenshot arrives before the
oldest is collapsed.

```bash
pip install openai pillow

vllm serve /path/to/UI-Mate-27B \
    --trust-remote-code \
    --served-model-name UI_Mate \
    --port 8000 \
    --tensor-parallel-size 2 \
    --gpu-memory-utilization 0.85 \
    --mm-encoder-tp-mode data \
    --chat-template-content-format openai \
    --limit-mm-per-prompt '{"image":6,"video":0}'
```

Confirm the name the server ended up exposing before pointing the agent at it:

```bash
curl -s http://127.0.0.1:8000/v1/models
```

</details>

<details>
<summary><b>2 · Run the bundled examples</b></summary>

Single-step mode walks five screenshots from unrelated tasks, resetting between
each, so every prediction is that task's opening move:

```bash
python examples/run_agent.py --base-url http://127.0.0.1:8000/v1
```

Replay mode walks one whole episode without resetting, which is what exercises
the behaviour that only appears over time: the growing `Previous actions` list,
past replies fed back as history, and older screenshots collapsing into
placeholders once more than `images_to_keep` have piled up:

```bash
python examples/run_agent.py --replay --base-url http://127.0.0.1:8000/v1
```

Or point it at a screenshot of your own:

```bash
python examples/run_agent.py \
    --image /path/to/screen.png \
    --instruction "Export this sheet as HTML and open it in Chrome"
```

Both modes write screenshots to `outputs/` with the predicted positions
marked. Pass `--model` whenever the endpoint serves something other than
`UI_Mate`; the script checks the name against `/v1/models` and stops early
rather than failing later as an empty response.

</details>

<details>
<summary><b>3 · Drive the agent from Python</b></summary>

```python
from agents.ui_mate_agent import UIMateAgent

agent = UIMateAgent(base_url="http://127.0.0.1:8000/v1")

response, actions = agent.predict(
    "Install the autoDocstring extension in VS Code.",
    {"screenshot": open("screen.png", "rb").read()},
)

print(response)   # <think> reasoning, <action> summary, <tool_call> blocks
print(actions)    # ['pyautogui.click(92, 302)']

agent.reset()     # drop history before starting another episode
```

`predict` keeps its own history, so call it once per step of an episode and
`reset` only between episodes. The endpoint can also come from
`OPENAI_BASE_URL` and `OPENAI_API_KEY` instead of constructor arguments.

The model reasons in a normalized 1000x1000 screen space; returned actions are
already rescaled to the screenshot's own pixel size, so they can be executed or
plotted as they come. A step may also yield the control tokens `WAIT`, `DONE`,
or `FAIL` in place of pyautogui calls.

</details>

## 🚀 Planned Release


| Artifact                                                      | Status      |
| ------------------------------------------------------------- | ----------- |
| UI-Mate technical report                                      | [arXiv](https://arxiv.org/abs/2608.15930) |
| Desktop application                                           | [Download Link](https://ui-mate.github.io/#app) |
| OSWorkerBench tasks, demonstrations, metadata, and evaluators | Coming soon |




## 🛡️ Safety

Computer-use agents can make mistakes, encounter prompt injection, or trigger
consequential actions. Run UI-Mate in an isolated environment when possible,
avoid high-stakes authenticated workflows, inspect the live trajectory, and
require human confirmation for sensitive operations. An agent declaring
success is not evidence that the intended real-world outcome was achieved;
verify the resulting application and artifact state.

## 📚 Citation

If you find UI-Mate useful in your research or applications, please cite:

```bibtex
@article{uimate2026,
  title         = {UI-Mate: Advancing Open-Weight Foundation GUI Agents with In-Context Demonstrations},
  author        = {Tencent HY Frontier Team},
  journal       = {arXiv preprint arXiv:2608.15930},
  year          = {2026},
}
```

## 📄 License

UI-Mate is licensed under Apache-2.0, except for the third-party components
listed in [LICENSE](LICENSE), which remain under their original licenses.
