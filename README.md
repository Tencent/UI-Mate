<div align="center">

# <img src="assets/UI-Mate-icon.png" width="40" align="absmiddle" alt=""> UI-Mate

### Advancing Foundation GUI Agents with In-Context Demonstrations

**Show the workflow once. Let the agent adapt it to the task at hand.**

Tencent HY Frontier

[![Project Page](https://img.shields.io/badge/Project%20Page-ui--mate.github.io-2456e6?logo=googlechrome&logoColor=white)](https://ui-mate.github.io)
[![arXiv](https://img.shields.io/badge/arXiv-b31b1b?logo=arxiv&logoColor=white)](https://arxiv.org/abs/2608.15930)
[![Models](https://img.shields.io/badge/%F0%9F%A4%97%20Models-tencent%2Fui--mate-ffd21e)](https://huggingface.co/collections/tencent/ui-mate)
[![OSWorkerBench](https://img.shields.io/badge/%F0%9F%A4%97%20OSWorkerBench-osworker__bench-ff8f00)](osworker_bench/)
[![Dataset](https://img.shields.io/badge/%F0%9F%A4%97%20Dataset-tencent%2FOSWorkerBench-ffd21e)](https://huggingface.co/datasets/tencent/OSWorkerBench)

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

UI-Mate therefore supports two complementary ways to express intent, each served
by its own checkpoint:


| General computer use                                                                          | Demonstration-guided computer use                                                                        |
| --------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| The agent plans and executes a task from a natural-language instruction and live screenshots. | A related human demonstration is distilled into a reusable workflow that guides execution on a new task. |
| `UI-Mate-9B` · `UI-Mate-27B`                                                                  | `UI-Mate-democua-27B`                                                                                    |


The demonstration is **advice, not a script**. UI-Mate follows the demonstrated
procedure where it carries user intent, while re-planning from the live
interface whenever the target task, data, window layout, or application state
differs.

## 🤖 Models


| Checkpoint                                                                | Base model  | Use it for                        |
| ------------------------------------------------------------------------- | ----------- | --------------------------------- |
| [UI-Mate-9B](https://huggingface.co/tencent/UI-Mate-9B)                   | Qwen3.5-9B  | General computer use              |
| [UI-Mate-27B](https://huggingface.co/tencent/UI-Mate-27B)                 | Qwen3.6-27B | General computer use              |
| [UI-Mate-democua-27B](https://huggingface.co/tencent/UI-Mate-democua-27B) | Qwen3.6-27B | Demonstration-guided computer use |


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

This mode is served by the dedicated `UI-Mate-democua-27B` checkpoint, obtained
by continuing from the general CUA checkpoint after RL and training on a mixture
of general and demonstration-augmented data.

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
long-horizon workflows and one-shot procedural learning. The evaluation
harness, tasks, demonstrations, and evaluators live in
[`osworker_bench/`](osworker_bench/).

The dataset is also available at
[`tencent/OSWorkerBench`](https://huggingface.co/datasets/tencent/OSWorkerBench)
with a browser-based Dataset Viewer and a detailed end-to-end evaluation guide.
The default configuration contains the 100 benchmark tasks, while the
`demonstrations` configuration exposes 3,989 captioned GUI-action steps from
the 33 released self-demonstrations:

```python
from datasets import load_dataset

tasks = load_dataset("tencent/OSWorkerBench")
demonstrations = load_dataset("tencent/OSWorkerBench", "demonstrations")
```

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

`UI-Mate-democua-27B` in the **self-demo** setting, where each target is paired
with a successful rollout of that same task from a stronger agent. Initial
states, budgets, and evaluators are identical; only the demonstration differs.
Both columns below are that same demonstration-guided checkpoint, run with and
without the demonstration.


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

UI-Mate runs against any OpenAI-compatible endpoint. The two model families are
used differently, so each has its own walkthrough. Click a section to expand.

<details>
<summary><b>General CUA</b></summary>

Runs on `UI-Mate-9B` or `UI-Mate-27B`, from an instruction and screenshots alone.

**Serve with vLLM**

```bash
pip install openai pillow

# or /path/to/UI-Mate-9B
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



**Run the bundled examples**

Single-step mode walks five screenshots from unrelated tasks, resetting between
each, so every prediction is that task's opening move:

```bash
python examples/run_agent.py --base-url http://127.0.0.1:8000/v1
```

Replay mode walks one whole episode without resetting, so it exercises the
behaviour that only appears over time: accumulated action history and older
screenshots collapsing into placeholders:

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



**Drive the agent from Python**

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

A step may also yield the control tokens `WAIT`, `DONE`, or `FAIL` in place of
pyautogui calls.

</details>

<details>
<summary><b>DemoCUA</b></summary>

Runs on `UI-Mate-democua-27B`. Consuming a workflow and emitting
`subtask_complete` are behaviours learned in this checkpoint's
demonstration-augmented SFT stage, so a general checkpoint will accept the same
prompt without acting on it.

**Serve with vLLM**

```bash
pip install openai pillow

vllm serve /path/to/UI-Mate-democua-27B \
    --trust-remote-code \
    --served-model-name UI_Mate \
    --port 8000 \
    --tensor-parallel-size 2 \
    --gpu-memory-utilization 0.85 \
    --mm-encoder-tp-mode data \
    --chat-template-content-format openai \
    --limit-mm-per-prompt '{"image":6,"video":0}'
```

**Guide a run with a demonstration**

A demonstration is a successful episode already segmented into subtasks. Point
the agent at one and the run becomes demonstration-guided: each step is shown the
subtask checklist, the current subtask with its completion criterion, and that
subtask's key steps. When the model reports `subtask_complete` the pointer moves
on; recorded coordinates are never replayed, so the live screenshot stays
authoritative.

`resources/example_demonstration/` holds a real one:


| File                        | What it is                                                                                                                                                                                     |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `task.json`                 | The task, byte-identical to its definition in [OSWorld](https://github.com/xlang-ai/OSWorld) (`os/5812b315-...`) — instruction, setup and evaluator. Configuring a chroot-restricted SSH user. |
| `trajectory_captioned.json` | A run of that task scored 1.0, distilled into 12 subtasks over 42 steps. Same task, so this is the self-demo setting.                                                                          |


```bash
# --instruction is the "instruction" field of task.json, quoted verbatim.
python examples/run_agent.py \
    --demo resources/example_demonstration/trajectory_captioned.json \
    --image resources/example_single_step/os_install_spotify.png \
    --instruction 'Please create an SSH user named "charles" with password "Ex@mpleP@55w0rd!" on Ubuntu who is only allowed to access the folder "/home/test1".' \
    --base-url http://127.0.0.1:8000/v1
```

This shows the guidance being assembled: three blocks placed before the
instruction — `<workflow_progress>`, `<current_subtask>` and
`<current_subtask_action_list>` — and `subtask_complete` added to the tool schema.
It does not show what guidance is worth. Opening a terminal is the obvious first
move here and the model makes it either way; the demonstration earns its keep
later, on the steps that cannot be read off the screen (`Match User`,
`ChrootDirectory`, `ForceCommand`, and the ownership a chroot demands). Seeing
that requires running the task in a real environment against `task.json`'s
evaluator, which lives in OSWorld rather than here.

In your own loop, pass `demo=` a demo file, or a directory holding a single
`trajectory_captioned*.json`:

```python
from agents.ui_mate_agent import UIMateAgent

agent = UIMateAgent(
    base_url="http://127.0.0.1:8000/v1",
    demo="resources/example_demonstration/trajectory_captioned.json",
)
agent.reset()
response, actions = agent.predict(instruction, {"screenshot": png_bytes})
```

A step where the model only reports progress comes back as `WAIT`, and a
premature `finished` on a non-final subtask advances the workflow instead of
ending the episode, so completing one subtask cannot end the task.

</details>



## 🖥️ Desktop Application

UI-Mate provides a standalone desktop application for automated GUI interactions and evaluation.

- **Download**: Get the latest release from the [UI-Mate App Download](https://ui-mate.github.io/#app) page.
- **Tutorial & Documentation**: Check out the comprehensive setup and usage guide in the [UI-Mate App Usage Guide](https://ui-mate.github.io/usage.html).

### Quick Start

1. **Install & Launch**: Download the package for your operating system and open the UI-Mate desktop client.
2. **Configure Endpoint**: Set your model endpoint (e.g., `http://127.0.0.1:8000/v1`) and required API keys in the settings panel. Serve `UI-Mate-9B` or `UI-Mate-27B` for instruction-only runs, or `UI-Mate-democua-27B` if you plan to attach demonstrations.
3. **Grant Permissions**: Ensure accessibility and screen-recording permissions are granted so the agent can inspect UI elements and execute actions.
4. **Execute Tasks**: Enter natural language instructions in the input bar to begin automated workflows.

## 🚀 Planned Release


| Artifact                                                      | Status                                          |
| ------------------------------------------------------------- | ----------------------------------------------- |
| UI-Mate technical report                                      | [arXiv](https://arxiv.org/abs/2608.15930)       |
| Desktop application                                           | [Download Link](https://ui-mate.github.io/#app) |
| OSWorkerBench tasks, demonstrations, metadata, and evaluators | [`osworker_bench/`](osworker_bench/)            |


## 🛡️ Safety

Computer-use agents can make mistakes, encounter prompt injection, or trigger
consequential actions. Run UI-Mate in an isolated environment when possible,
avoid high-stakes authenticated workflows, inspect the live trajectory, and
require human confirmation for sensitive operations. An agent declaring
success is not evidence that the intended real-world outcome was achieved;
verify the resulting application and artifact state.

## 📚 Citation

If you find UI-Mate useful in your research or applications, please cite our technical report:

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
