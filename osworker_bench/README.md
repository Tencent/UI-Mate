<p align="center">
  <img src="docs/assets/osworker-benchmark-logo.svg" alt="OSWorker Benchmark" width="720">
</p>

# OSWorker Benchmark

OSWorker Benchmark is a desktop GUI-agent benchmark built on
[OSWorld](https://github.com/xlang-ai/OSWorld). It contains **100 long-horizon
office tasks spanning 41 applications** and supports both instruction-only and
demonstration-guided evaluation. An agent observes screenshots, controls an
Ubuntu desktop VM with mouse and keyboard actions, and is scored automatically.

To our knowledge, **OSWorkerBench is the first CUA benchmark to provide
multimodal demonstrations as explicit one-shot guidance during evaluation.**

For demonstration-guided evaluation, OSWorker provides two complementary
resource sets:

- **Self-demo (33 tasks):** successful strong-agent rollouts on the same target
  tasks.
- **Variant-demo (45 tasks):** human-recorded demonstrations of related but
  non-identical tasks.

## 🚀 Quick Start

### Prerequisites

- Python 3.9 or newer.
- A Linux environment with permission to run Docker and the benchmark VMs.
- For local inference, a working `vllm` command, sufficient GPU capacity, and
  access to [tencent/UI-Mate-27B](https://huggingface.co/tencent/UI-Mate-27B).
  Alternatively, provide an existing OpenAI-compatible vLLM endpoint.
- Network access to the benchmark assets on
  [Hugging Face](https://huggingface.co/datasets/SamuelGuo/OSworker_cache).
- A separately deployed mock-application host reachable from every benchmark
  VM, as described below.

Install all dependencies from the requirements file:

```bash
pip install -r requirements.txt
```

Alternatively, install the package with the extras you need. `env` installs the
Docker/Ubuntu VM runtime, `eval` installs task evaluators, and `full` installs
both. The wheel is the reusable Python library; running the benchmark launcher
also requires a source checkout because configs, scripts, and task data are
repository assets.

```bash
pip install -e ".[full]"
```

### Deploy the mock applications

The mock applications come from
[CUA-Gym-Hub](https://github.com/xlang-ai/cua-gym-hub); follow its
[deployment guide](https://github.com/xlang-ai/cua-gym-hub/blob/main/DEPLOY.md).
This repository neither ships nor starts the 98 mock applications. They must be
deployed separately, or you must obtain a compatible host from your benchmark
operator. Of the 100 benchmark tasks, 88 require these applications; the other
12 are local-file tasks.

`MOCK_APP_BASE_URL` supplies the common scheme and host used with the app-to-port
mapping in `.MOCK_HOST`. The endpoint synchronizer reads it from the process
environment first and then from the repository's `.env` file. Its value must be
only a scheme plus host, such as `http://mock-host.example`, with no port or
path. The host and mapped application ports must be reachable from the benchmark
VMs.

Port alignment is critical. Upstream CUA-Gym-Hub's `deploy-all.sh` defaults to
ports `8000-8097`, while this repository's `.MOCK_HOST` expects the app-to-port
mapping at `8100-8197`. Before running the benchmark, align the deployment with
`.MOCK_HOST`; for example, configure the upstream base port as `8100` and verify
that the application ordering matches the mapping.

`scripts/cua_gym/cua_gym_convert/sync_mock_endpoints_v2.py` only rewrites the
setup, reward, bridge, and task endpoints. It does not deploy mock applications.
The Hugging Face `OSworker_cache` dataset also does not provide mock servers.

### Run through the supported launcher

The Bash wrapper is the supported first-run and full-orchestration path. If
`CONFIG_FILE` is omitted, it loads
`configs/osworker_benchmark/ui_mate.yaml`. That configuration selects
agent `ui_mate_promptv2`, serves `tencent/UI-Mate-27B`, and exposes it as
`UI_Mate` through the OpenAI-compatible API.

On first launch, vLLM downloads the model from Hugging Face and stores it in the
standard Hugging Face cache. Set `HF_HOME` to choose another cache directory, or
set `MODEL_PATH` to use another Hugging Face repository or local checkpoint:

```bash
MOCK_APP_BASE_URL=http://mock-host.example \
bash scripts/osworker_benchmark/start_osworker_benchmark_test.sh
```

The wrapper checks for and, when necessary, downloads the VM image and benchmark
cache; synchronizes mock endpoints; ensures Docker is available; starts or
reuses vLLM; validates the task files and cache; and then invokes
`run_multienv_new.py`.

To select another configuration explicitly:

```bash
MOCK_APP_BASE_URL=http://mock-host.example \
MODEL_PATH=/path/to/checkpoint \
CONFIG_FILE=configs/osworker_benchmark/ui_mate.yaml \
bash scripts/osworker_benchmark/start_osworker_benchmark_test.sh
```

### Run the demonstration-guided (DemoCUA) suite

A separate launcher runs the 33 self-demo tasks with demonstration guidance. It
defaults to `configs/osworker_benchmark/ui_mate_democua.yaml`, which selects
agent `ui_mate`, serves `tencent/UI-Mate-democua-27B`, and enables
demonstration-guided mode. Each task is paired with a recorded trajectory under
`evaluation_examples/democua/osworker_benchmark_democua/demos/`, and all 33 are
verified before the run starts.

These 33 tasks are a subset of the 100 benchmark tasks and use the same
`osworker_cache`, since the demonstrations are an extra input to the agent and do
not change setup or scoring:

```bash
MOCK_APP_BASE_URL=http://mock-host.example \
bash scripts/osworker_benchmark/start_osworker_benchmark_democua_test.sh
```

The launcher accepts the same environment variables as the main one. See
`evaluation_examples/democua/README.md` for the task layout and cache contents.

### Run the Python runner directly

Direct runner invocation is only for a fully prepared environment: the VM image
and cache must already exist, Docker must be ready, mock endpoints must already
be synchronized, and an OpenAI-compatible model endpoint must already be
running. The direct runner does not start vLLM.

Set both URLs explicitly:

```bash
OPENAI_BASE_URL=http://127.0.0.1:8081/v1 \
MOCK_APP_BASE_URL=http://mock-host.example \
python run_multienv_new.py \
  --config configs/osworker_benchmark/ui_mate.yaml
```

If `OPENAI_BASE_URL` is unset, the direct runner defaults to
`http://127.0.0.1:8000/v1`. It does not derive the API URL from `vllm.port` in
the YAML file.

### Common launcher environment variables

| Variable | Purpose |
|---|---|
| `MOCK_APP_BASE_URL` | Mock scheme and host, for example `http://10.0.0.1`; no port or path |
| `CONFIG_FILE` | Configuration path; defaults to `configs/osworker_benchmark/ui_mate.yaml` |
| `MODEL_PATH` | Optional Hugging Face repository ID or local checkpoint; overrides YAML `agent.model_path` |
| `HF_HOME` / `HF_TOKEN` | Optional Hugging Face cache directory and access token |
| `HTTP_PROXY` / `HTTPS_PROXY` / `NO_PROXY` | Optional host-side network proxy settings |
| `OSWORLD_PROXY_HOST` / `OSWORLD_PROXY_PORT` | Optional proxy injected into benchmark VMs |
| `VLLM_ENDPOINT` | Existing endpoint as `host:port`; suppresses automatic vLLM startup |
| `NUM_ENVS` / `MAX_STEPS` | Override YAML concurrency and per-task step limit |
| `REPEAT_RUNS` | Number of complete evaluation passes; defaults to `1` |
| `AUTO_SYNC_MOCK_ENDPOINTS` | Set to `0` to skip endpoint synchronization |
| `HF_REVISION` | Pinned Hugging Face dataset revision; defaults to the release-tested commit |
| `ALLOW_UNVERIFIED_CACHE` | Set to `1` only for a manually verified cache without `.HF_REVISION` |

## 🗂️ Repository Layout

```text
mini-osworld/
├── core/                    # Framework, configuration, runners, and execution
│   ├── protocols.py         # AgentProtocol and BaseAgent interfaces
│   ├── config.py            # EnvironmentConfig, AgentConfig, and RunConfig
│   ├── env_factory.py       # DesktopEnv assembly
│   ├── registry.py          # Agent registration and dynamic loading
│   ├── runners.py           # Test, rollout, collection, evaluation, and human modes
│   ├── executor.py          # Single-process and multiprocessing execution
│   ├── session.py           # In-process HarnessSession
│   ├── adapters.py          # Legacy agent adapters
│   ├── utils.py             # Logging, task discovery, and result summaries
│   └── validation.py        # Task configuration validation
├── desktop_env/             # Ubuntu desktop environment runtime
│   ├── desktop_env.py       # gym.Env implementation and VM lifecycle
│   ├── controllers/         # Environment setup and remote PyAutoGUI execution
│   ├── evaluators/          # Metrics and result getters
│   ├── providers/           # VM provider implementations
│   └── server/              # In-VM screenshot, input, and accessibility server
├── mm_agents/               # Multimodal agents registered by core/registry.py
│   ├── ui_mate.py           # UI-Mate implementation
│   ├── ui_mate_promptv2.py  # Default UI-Mate PromptV2 variant
│   └── utils/               # Shared agent utilities
├── configs/
│   └── osworker_benchmark/  # Benchmark configurations
├── evaluation_examples/
│   └── OSWorker/            # 100 tasks across 17 domains
├── osworker_cache/          # Per-task setup, reward, and asset cache
├── workflow/                # OSWorker workflow runtime required by UI-Mate
└── scripts/
    ├── osworker_benchmark/  # Supported benchmark launcher
    └── cua_gym/             # Mock-endpoint synchronization utilities
```

## 🧪 Benchmark Tasks

<p align="center">
  <img
    src="docs/assets/osworker-benchmark-statistics.png"
    alt="OSWorker Benchmark distributions by job family, applications per task, most frequent applications, and evaluator checkpoints"
    width="60%"
  >
</p>

<p align="center">
  <sub><strong>Benchmark overview.</strong> Job-family coverage, application breadth, frequently used applications, and evaluator depth across all 100 tasks.</sub>
</p>

The figure presents 10 reader-facing job families; the repository organizes the
same 100 tasks into the following 17 operational tracks:

| Domain | Tasks | Domain | Tasks | Domain | Tasks |
|---|---:|---|---:|---|---:|
| `ar` | 12 | `ops` | 12 | `mktg` | 11 |
| `hr` | 9 | `recruit` | 8 | `sdr` | 6 |
| `csops` | 6 | `calc` | 5 | `csm` | 5 |
| `ae` | 4 | `am` | 4 | `itops` | 4 |
| `qa` | 4 | `pm` | 3 | `sre` | 3 |
| `fin` | 2 | `img` | 2 |  |  |

The task manifest is
`evaluation_examples/OSWorker/osworker_benchmark_full.json`. Individual task
configurations are stored at
`evaluation_examples/OSWorker/examples/<domain>/<task_id>.json`, and their setup
and reward files are stored under `osworker_cache/<task_id>/`.

For mock-backed tasks, `_cua_gym_vm_bridge.sh` configures in-VM DNS and proxy
bypass behavior.

## ⚙️ Configuration

Benchmark YAML files use `environment`, `agent`, `run`, and `vllm` sections plus
an optional top-level `proxy_pool`. The direct runner merges command-line
arguments over the selected config and then defaults. The Bash wrapper
also applies its documented environment-variable overrides over YAML values.

Available benchmark configurations:

| Configuration | Agent | Purpose |
|---|---|---|
| `configs/osworker_benchmark/ui_mate.yaml` | `ui_mate_promptv2` | Default benchmark configuration |
| `configs/osworker_benchmark/ui_mate_democua.yaml` | `ui_mate` | Demonstration-guided 33-task suite |

## 🤖 Add an Agent

1. Implement the agent class under `mm_agents/`.
2. Register it with `register_agent(...)` in `core/registry.py`.
3. Add a YAML file under `configs/` whose `agent.name` uses the registered name.

Agents enter the runtime only through `core/registry.py`. `register_agent` skips
entries whose modules are absent, so `get_registered_agents()` reports only
agents available in this release. `parse_config` validates `agent.name` before
starting an environment, avoiding a late failure after VM startup.

## 📦 Use as a Library

```python
from core.session import HarnessSession

session = HarnessSession.from_request(request, env=my_env)
result = session.run()
```

## 🖥️ VM Providers

Docker is the default (`environment.provider_name: docker`), using
`docker_vm_data/Ubuntu_openpyxl.qcow2`. This release supports Ubuntu only.

## 🧰 Utilities

```bash
# Download task files before the first run
python scripts/prepare_cache.py \
  --config evaluation_examples/OSWorker/osworker_benchmark_full.json \
  --examples-dir evaluation_examples/OSWorker \
  --cache-dir osworker_cache

# Generate the cache manifest after initial setup or cache changes
python scripts/generate_cache_manifest.py \
  --config evaluation_examples/OSWorker/osworker_benchmark_full.json \
  --examples-dir evaluation_examples/OSWorker \
  --cache-dir osworker_cache \
  --manifest-out evaluation_examples/OSWorker/cache_manifest.json \
  --alg sha256

# Verify cache integrity at any time
python scripts/verify_cache.py \
  --cache-dir osworker_cache \
  --manifest evaluation_examples/OSWorker/cache_manifest.json

# Inspect mock endpoint synchronization; without --apply it is a dry-run
python scripts/cua_gym/cua_gym_convert/sync_mock_endpoints_v2.py --help
```

## 🧹 Release scope

- The public names are `UI-Mate`, `ui_mate`, and `ui_mate_promptv2`.
- The registry advertises only the three agents included in this release.
- Windows overlays and debug `draft/` artifacts are not distributed.
- `evaluation_examples/democua/` is intentionally included; the workflow
  runtime loads its demonstration trajectories through `run.demo_dir`.
- Docker, vLLM startup, and mock-host connectivity depend on the local
  deployment and should be smoke-tested before a benchmark run.

Build source releases only from tracked files:

```bash
bash scripts/build_release_archive.sh
```

The script refuses a dirty worktree and uses `git archive`, so local VM images,
caches, results, logs, `.env` files, and Git history are excluded. Do not publish
the internal remote or push the existing full history to a public repository;
publish the generated clean snapshot instead.

## 📚 Citation

If you find OSWorkerBench useful in your research or applications, please cite:

```bibtex
@article{uimate2026,
  title   = {UI-Mate: Advancing Open-Weight Foundation GUI Agents with In-Context Demonstrations},
  author  = {Tencent HY Frontier Team},
  journal = {arXiv preprint arXiv:2608.15930},
  year    = {2026},
}
```

## 📄 License

See [LICENSE](LICENSE).
