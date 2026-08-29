# osworker_benchmark_democua

33 multi-application tasks over mock web applications, **each paired with one
recorded demonstration trajectory**, used for demo-in-the-loop evaluation.

Task IDs are aligned with the 100-case OSWorker Benchmark and take the form
`<track>_<capability>_<seq>__long`. The `domain` is one of 12 business tracks:

| track | tasks | track | tasks | track | tasks |
|---|---|---|---|---|---|
| `ar` | 6 | `hr` | 3 | `pm` | 2 |
| `recruit` | 5 | `csops` | 3 | `sre` | 2 |
| `ops` | 4 | `sdr` | 3 | `am` | 1 |
| `ae` | 2 | `mktg` | 1 | `qa` | 1 |

## Layout

```text
evaluation_examples/democua/
├── README.md
├── osworker_benchmark_democua.json            # meta: domain -> task ID list
└── osworker_benchmark_democua/
    ├── examples/{track}/{id}.json             # config + evaluator
    └── demos/{id}/trajectory_captioned.json   # demonstration trajectory
```

For each task the following must match exactly, and all of them have to be
updated together when a task is renamed:

```text
ID in meta  ==  example filename  ==  config "id"  ==  demo directory  ==  cache directory
```

## Cache

Each task's setup and reward scripts live outside this directory, under
`osworker_cache/{id}/`, as three files:

```text
initial_setup.py          # inject the initial state into the mock applications
reward.py                 # scoring
_cua_gym_vm_bridge.sh     # in-VM DNS and proxy-bypass setup
```

These 33 tasks are a subset of the 100-case OSWorker Benchmark and share its
cache unchanged: the demonstrations are an extra input to the agent and do not
affect setup or scoring. The launch script downloads the cache from the Hugging
Face `OSworker_cache` dataset when it is missing.

## Run

With the launch script, which brings up the Docker daemon, reuses an existing
vLLM endpoint, and verifies the cache and demonstrations before starting:

```bash
MOCK_APP_BASE_URL=http://<mock-host> \
VLLM_ENDPOINT=<ip:port> MODEL_NAME=<served-model-name> \
  bash scripts/osworker_benchmark/start_osworker_benchmark_democua_test.sh
```

Or call the runner directly when the surrounding environment is already up:

```bash
python run_multienv_new.py \
    --config    configs/osworker_benchmark/ui_mate_democua.yaml \
    --model     <served-model-name> \
    --result_dir ./results/democua/osworker_benchmark_democua
```

The runtime resolves:

- task config: `{test_config_base_dir}/examples/{domain}/{id}.json`
- demonstration: `{demo_dir}/{id}/trajectory_captioned.json`
- cache: `{cache_dir}/{config "id"}/`

## Notes

- `enable_demo_in_the_loop` and `demo_in_the_loop_mode` in the config are what
  make this a demo run. To run the no-demo control arm, set
  `enable_demo_in_the_loop` to `false` and drop `demo_in_the_loop_mode`;
  `--demo_dir` may still be passed.
- A missing demonstration is not an error: the framework logs a single warning
  and continues without guidance, which silently makes the scores
  incomparable. The launch script checks all 33 demonstrations before starting.
