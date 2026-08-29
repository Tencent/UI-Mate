#!/bin/bash
# start_osworker_benchmark_democua_test.sh
# DemoCUA evaluation script (proxy mode)
#
# Design goals:
#   1. [Launch pattern] Same outer orchestration as start_osworker_benchmark_test.sh
#      (YAML parsing, automatic model-path inference, GPU monitoring, vLLM startup,
#      task validation, automatic retry of missing result.txt files, and REPEAT_RUNS).
#   2. [Task set] Run the 33 cases listed in
#      evaluation_examples/democua/osworker_benchmark_democua.json, with task configs from
#      evaluation_examples/democua/osworker_benchmark_democua and setup/reward files from
#      osworker_cache/<task_id>/. These 33 cases are a subset of the 100-case OSWorker
#      Benchmark and share its cache unchanged.
#   3. [Demo in the loop] Every case ships a recorded guide at
#      <demo_dir>/<task_id>/trajectory_captioned*.json, selected by run.demo_dir. A missing
#      guide only produces a runtime warning and the case then runs without guidance, so
#      this script verifies all 33 guides before starting.
#
# Usage:
#   MOCK_APP_BASE_URL=http://<mock-host> VLLM_ENDPOINT=<ip:port> \
#   MODEL_NAME=<served-model-name> \
#     bash scripts/osworker_benchmark/start_osworker_benchmark_democua_test.sh
#   CONFIG_FILE=configs/osworker_benchmark/ui_mate_democua.yaml REPEAT_RUNS=3 \
#     bash scripts/osworker_benchmark/start_osworker_benchmark_democua_test.sh
#
# Environment variables (all optional; defaults come from the YAML config):
#   MOCK_APP_BASE_URL   Mock backend base URL, e.g. http://10.0.0.1 (no port)
#   VLLM_ENDPOINT       Reuse an existing endpoint as ip:port; disables vLLM startup
#   MODEL_NAME          Must match vLLM's --served-model-name
#   CACHE_DIR           Directory holding each task's setup and reward files
#   DEMO_DIR            Directory holding each task's demo guide
#   NUM_ENVS/MAX_STEPS  Parallel environments and per-case step limit
#   REPEAT_RUNS         Number of evaluation rounds, default 1

set -uo pipefail

# ============ Path configuration ============
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# By default, CODE_PATH resolves two levels above this script (the repository root).
CODE_PATH="${CODE_PATH:-$(cd "${SCRIPT_DIR}/../.." && pwd)}"
MODEL_BASE_PATH="${MODEL_BASE_PATH:-}"

# ============ Configuration file ============
CONFIG_FILE="${CONFIG_FILE:-${CODE_PATH}/configs/osworker_benchmark/ui_mate_democua.yaml}"
if [ ! -f "${CONFIG_FILE}" ]; then
    echo "[ERROR] Config file does not exist: ${CONFIG_FILE}"
    exit 1
fi
# Normalize to an absolute path because the script later changes to CODE_PATH.
CONFIG_FILE="$(cd "$(dirname "${CONFIG_FILE}")" && pwd)/$(basename "${CONFIG_FILE}")"
echo "========== Loading config from: ${CONFIG_FILE} =========="

# Save evaluator inputs, source files, and offline replay artifacts by default; set to 0 to disable.
export OSWORLD_SAVE_EVALUATOR_ARTIFACTS="${OSWORLD_SAVE_EVALUATOR_ARTIFACTS:-1}"
# Every reward.py here awards partial credit, so run the evaluator even after a case fails.
export OSWORLD_ALLOW_PARTIAL_REWARD_ON_FAIL="${OSWORLD_ALLOW_PARTIAL_REWARD_ON_FAIL:-1}"

# ============ Parse YAML ============
parse_yaml() {
    python3 -c "
import yaml, shlex, json
with open('${CONFIG_FILE}', 'r') as f: config = yaml.safe_load(f)
def get_nested(d, keys, default=''):
    for key in keys:
        if isinstance(d, dict) and key in d: d = d[key]
        else: return default
    return d if d is not None else default
def q(v): return shlex.quote(str(v))
print('AGENT_NAME=' + q(get_nested(config, ['agent', 'name'], 'qwen35vl')))
print('MODEL_NAME=' + q(get_nested(config, ['agent', 'model'], 'qwen36-27B')))
print('MODEL_PATH_OVERRIDE=' + q(get_nested(config, ['agent', 'model_path'], '')))
print('REGION=' + q(get_nested(config, ['environment', 'region'], '')))
print('RUN_MODE=' + q(get_nested(config, ['run', 'mode'], 'test')))
print('MAX_STEPS=' + q(get_nested(config, ['run', 'max_steps'], 100)))
print('NUM_ENVS=' + q(get_nested(config, ['run', 'num_envs'], 15)))
print('RESULT_DIR=' + q(get_nested(config, ['run', 'result_dir'], './results/democua/osworker_benchmark_democua')))
print('TENSOR_PARALLEL_SIZE=' + q(get_nested(config, ['vllm', 'tensor_parallel_size'], 1)))
print('DATA_PARALLEL_SIZE=' + q(get_nested(config, ['vllm', 'data_parallel_size'], 1)))
print('PIPELINE_PARALLEL_SIZE=' + q(get_nested(config, ['vllm', 'pipeline_parallel_size'], 1)))
print('NNODES=' + q(get_nested(config, ['vllm', 'nnodes'], 1)))
print('VLLM_PORT=' + q(get_nested(config, ['vllm', 'port'], 8081)))
print('CFG_VLLM_ENDPOINT=' + q(get_nested(config, ['vllm', 'endpoint'], '')))
print('VLLM_EXTRA_ARGS=' + q(get_nested(config, ['vllm', 'extra_args'], '')))
print('MAX_MODEL_LEN=' + q(get_nested(config, ['vllm', 'max_model_len'], '')))
vllm_env = get_nested(config, ['vllm', 'env'], {})
if isinstance(vllm_env, dict):
    for k, v in vllm_env.items():
        print('VLLM_ENV_EXPORT_' + k + '=' + q(str(v)))
extra = get_nested(config, ['agent', 'extra'], {})
if isinstance(extra, dict):
    print('IMAGES_TO_KEEP=' + q(extra.get('images_to_keep', 5)))
    # Demo switch and mode, consumed by the pre-run validation below.
    print('CFG_ENABLE_DEMO=' + q(extra.get('enable_demo_in_the_loop', False)))
    print('CFG_DEMO_MODE=' + q(extra.get('demo_in_the_loop_mode', '')))
# Task set: falls back to run.test_config_base_dir and run.test_all_meta_path.
task_root = get_nested(config, ['benchmark', 'task_root'], get_nested(config, ['run', 'test_config_base_dir'], 'evaluation_examples/democua/osworker_benchmark_democua'))
benchmark_meta = get_nested(config, ['benchmark', 'meta_path'], get_nested(config, ['run', 'test_all_meta_path'], ''))
cache_dir = get_nested(config, ['environment', 'cache_dir'], 'cache')
print('CFG_TASK_ROOT=' + q(task_root))
print('CFG_BENCHMARK_META=' + q(benchmark_meta))
print('CFG_CACHE_DIR=' + q(cache_dir))
# Root directory of the demo guides, one subdirectory per task.
print('CFG_DEMO_DIR=' + q(get_nested(config, ['run', 'demo_dir'], '')))
# The top-level proxy_pool is serialized into PROXY_CONFIG_FILE and cannot live under environment.
print('CFG_PROXY_POOL_JSON=' + q(json.dumps(get_nested(config, ['proxy_pool'], []), ensure_ascii=False)))
"
}
# Record explicit environment overrides first: eval overwrites these names with YAML values.
_ENV_MAX_STEPS="${MAX_STEPS:-}"
_ENV_NUM_ENVS="${NUM_ENVS:-}"
_ENV_MODEL_PATH="${MODEL_PATH:-}"
_ENV_MODEL_NAME="${MODEL_NAME:-}"
eval "$(parse_yaml)"
IMAGES_TO_KEEP="${IMAGES_TO_KEEP:-5}"
# Per-request image cap for vLLM, one more than images_to_keep as headroom.
VLLM_IMAGE_LIMIT="${VLLM_IMAGE_LIMIT:-$((IMAGES_TO_KEEP + 1))}"
# An explicit MODEL_NAME takes precedence over YAML: it must match vLLM's
# --served-model-name, otherwise requests fail with model not found. When reusing an
# endpoint someone else started, that side owns the name, so YAML must be overridable.
[ -n "${_ENV_MODEL_NAME}" ] && MODEL_NAME="${_ENV_MODEL_NAME}"

# A Hugging Face repository ID is passed directly to vLLM, which downloads and
# caches it automatically. MODEL_BASE_PATH is an optional local-only override.
if [ "${MODEL_NAME}" = "UI_Mate_DemoCUA" ]; then
    MODEL_PATH="tencent/UI-Mate-democua-27B"
elif [ -n "${MODEL_BASE_PATH}" ] && [[ "${MODEL_NAME}" != */* ]]; then
    MODEL_PATH="${MODEL_BASE_PATH}/${MODEL_NAME}"
else
    MODEL_PATH="${MODEL_NAME}"
fi
# Precedence: environment MODEL_PATH > YAML agent.model_path > automatic inference from MODEL_NAME.
[ -n "${MODEL_PATH_OVERRIDE}" ] && MODEL_PATH="${MODEL_PATH_OVERRIDE}"
[ -n "${_ENV_MODEL_PATH}" ] && MODEL_PATH="${_ENV_MODEL_PATH}"

# ============ Task set and runtime parameters (environment > YAML) ============
TASK_ROOT="${TASK_ROOT:-${CFG_TASK_ROOT}}"
case "${TASK_ROOT}" in /*) : ;; *) TASK_ROOT="${CODE_PATH}/${TASK_ROOT}" ;; esac
BENCHMARK_META="${BENCHMARK_META:-${CFG_BENCHMARK_META}}"
if [ -n "${BENCHMARK_META}" ]; then
    case "${BENCHMARK_META}" in /*|all|none|All|ALL|None|NONE) : ;; *) BENCHMARK_META="${CODE_PATH}/${BENCHMARK_META}" ;; esac
fi
CACHE_DIR="${CACHE_DIR:-${CFG_CACHE_DIR}}"
case "${CACHE_DIR}" in /*) : ;; *) CACHE_DIR="${CODE_PATH}/${CACHE_DIR}" ;; esac
# Demo guide directory (environment > YAML).
DEMO_DIR="${DEMO_DIR:-${CFG_DEMO_DIR}}"
if [ -n "${DEMO_DIR}" ]; then
    case "${DEMO_DIR}" in /*) : ;; *) DEMO_DIR="${CODE_PATH}/${DEMO_DIR}" ;; esac
fi
# Explicit MAX_STEPS and NUM_ENVS environment values take precedence over YAML.
[ -n "${_ENV_MAX_STEPS}" ] && MAX_STEPS="${_ENV_MAX_STEPS}"
[ -n "${_ENV_NUM_ENVS}" ] && NUM_ENVS="${_ENV_NUM_ENVS}"
VLLM_ENDPOINT="${VLLM_ENDPOINT:-${CFG_VLLM_ENDPOINT}}"
if [ -n "${VLLM_ENDPOINT}" ]; then
    case "${VLLM_ENDPOINT}" in
        *:*) VLLM_HOST="${VLLM_ENDPOINT%:*}"; VLLM_PORT="${VLLM_ENDPOINT##*:}" ;;
        *) echo "[ERROR] vllm.endpoint must use ip:port format: ${VLLM_ENDPOINT}" >&2; exit 1 ;;
    esac
    case "${VLLM_PORT}" in ''|*[!0-9]*) echo "[ERROR] vllm.endpoint has an invalid port: ${VLLM_ENDPOINT}" >&2; exit 1 ;; esac
    START_VLLM=0
else
    START_VLLM="${START_VLLM:-1}"
fi
VLLM_EXISTING_WAIT_TIMEOUT="${VLLM_EXISTING_WAIT_TIMEOUT:-10}"
VLLM_READY_TIMEOUT="${VLLM_READY_TIMEOUT:-3600}"
RETRY_MISSING_RESULTS="${RETRY_MISSING_RESULTS:-1}"
MAX_MISSING_RESULT_RETRIES="${MAX_MISSING_RESULT_RETRIES:-1}"
VLLM_HOST="${VLLM_HOST:-localhost}"

# ============ Validate the demo configuration before starting ============
# With a demo missing, the runtime only logs a warning and continues without guidance,
# which silently makes the scores incomparable. Fail fast instead.
if [ "${CFG_ENABLE_DEMO}" = "True" ] || [ "${CFG_ENABLE_DEMO}" = "true" ]; then
    if [ -z "${CFG_DEMO_MODE}" ]; then
        echo "[ERROR] enable_demo_in_the_loop is set but demo_in_the_loop_mode is empty" >&2
        exit 1
    fi
    if [ -z "${DEMO_DIR}" ]; then
        echo "[ERROR] enable_demo_in_the_loop is set but demo_dir is not; set run.demo_dir in YAML or DEMO_DIR" >&2
        exit 1
    fi
    if [ ! -d "${DEMO_DIR}" ]; then
        echo "[ERROR] demo_dir is not a directory: ${DEMO_DIR}" >&2
        exit 1
    fi
fi

# ============ Proxy configuration ============
# The mock backend is reachable only through the private network and returns 403 through
# http_proxy, so it has to go into no_proxy. The host is derived from MOCK_APP_BASE_URL;
# leaving it unset simply drops one bypass rule.
MOCK_APP_PORTS="${MOCK_APP_PORTS:-8001 8003 8004 8005 1234}"
MOCK_APP_HOST="${MOCK_APP_HOST:-$(printf '%s' "${MOCK_APP_BASE_URL:-}" | sed -E 's#^https?://##; s#[:/].*$##')}"
# Also bypass the surrounding /16 so a new mock IP needs no script change.
MOCK_APP_NET="$(printf '%s' "${MOCK_APP_HOST}" | awk -F. 'NF==4 && $1 ~ /^[0-9]+$/ {print $1"."$2".0.0/16"}')"
[ -n "${MOCK_APP_BASE_URL:-}" ] && export MOCK_APP_BASE_URL
configure_region_proxy() {
    local base_no_proxy
    local combined_no_proxy
    local mock_no_proxy=""
    local port
    local host

    export http_proxy="${http_proxy:-${HTTP_PROXY:-}}"
    export https_proxy="${https_proxy:-${HTTPS_PROXY:-${http_proxy}}}"
    base_no_proxy="${no_proxy:-localhost,127.0.0.1,::1,10.0.2.2,172.17.0.1,host.docker.internal,10.0.0.0/8,172.16.0.0/12,192.168.0.0/16}"

    for port in ${MOCK_APP_PORTS}; do
        for host in localhost 127.0.0.1 0.0.0.0 10.0.2.2 172.17.0.1 host.docker.internal; do
            mock_no_proxy="${mock_no_proxy},${host}:${port}"
        done
    done
    # Bypass the mock host itself without ports: enumerating every port is verbose and
    # drifts easily, and requests matches no_proxy by host more reliably.
    [ -n "${MOCK_APP_HOST}" ] && mock_no_proxy="${mock_no_proxy},${MOCK_APP_HOST}"
    [ -n "${MOCK_APP_NET}" ]  && mock_no_proxy="${mock_no_proxy},${MOCK_APP_NET}"
    combined_no_proxy="${base_no_proxy}${mock_no_proxy}"
    if [ -n "${NO_PROXY:-}" ]; then
        combined_no_proxy="${NO_PROXY},${combined_no_proxy}"
    fi
    export no_proxy="${combined_no_proxy}"
    export NO_PROXY="${combined_no_proxy}"
    [ -n "${http_proxy}" ] && export HTTP_PROXY="${HTTP_PROXY:-${http_proxy}}"
    [ -n "${https_proxy}" ] && export HTTPS_PROXY="${HTTPS_PROXY:-${https_proxy}}"
    DOCKER_HTTP_PROXY="${DOCKER_HTTP_PROXY:-${http_proxy}}"
    DOCKER_HTTPS_PROXY="${DOCKER_HTTPS_PROXY:-${https_proxy}}"
    DOCKER_NO_PROXY="${DOCKER_NO_PROXY:-${combined_no_proxy}}"
    OSWORLD_PROXY_HOST="${OSWORLD_PROXY_HOST:-$(printf '%s' "${http_proxy}" | sed -nE 's#^https?://([^/:]+).*#\1#p')}"
    OSWORLD_PROXY_PORT="${OSWORLD_PROXY_PORT:-$(printf '%s' "${http_proxy}" | sed -nE 's#^https?://[^/:]+:([0-9]+)/?.*#\1#p')}"
    export OSWORLD_PROXY_HOST OSWORLD_PROXY_PORT
}
configure_region_proxy
START_DOCKER_DAEMON="${START_DOCKER_DAEMON:-1}"
RESTART_DOCKER_DAEMON="${RESTART_DOCKER_DAEMON:-1}"
LOAD_OSWORLD_IMAGE="${LOAD_OSWORLD_IMAGE:-1}"

# ============ VM qcow2 paths ============
# Prefer the in-repository image, then a shared copy one level up, and only then Hugging Face.
if [ -z "${OSWORLD_VM_SOURCE_PATH:-}" ]; then
    for _cand in \
        "${CODE_PATH}/docker_vm_data/Ubuntu.qcow2" \
        "$(cd "${CODE_PATH}/.." && pwd)/docker_vm_data/Ubuntu.qcow2"; do
        [ -r "${_cand}" ] && { OSWORLD_VM_SOURCE_PATH="${_cand}"; break; }
    done
    OSWORLD_VM_SOURCE_PATH="${OSWORLD_VM_SOURCE_PATH:-${CODE_PATH}/docker_vm_data/Ubuntu.qcow2}"
fi
OSWORLD_DOCKER_VM_PATH="${OSWORLD_DOCKER_VM_PATH:-${CODE_PATH}/docker_vm_data/Ubuntu.qcow2}"
OSWORLD_VM_READY_TIMEOUT="${OSWORLD_VM_READY_TIMEOUT:-180}"
export OSWORLD_DOCKER_VM_PATH
# DockerVMManager always looks for ${OSWORLD_VMS_DIR}/Ubuntu.qcow2.
export OSWORLD_VMS_DIR="${OSWORLD_VMS_DIR:-$(dirname "${OSWORLD_DOCKER_VM_PATH}")}"
export OSWORLD_VM_READY_TIMEOUT

# ============ Environment variables ============
export OPENAI_API_KEY="${OPENAI_API_KEY:-EMPTY}"
export OPENAI_BASE_URL="http://${VLLM_HOST}:${VLLM_PORT}/v1"
export TOKENIZERS_PARALLELISM=false

# ============ In-VM proxy pool ============
# Write the top-level YAML proxy_pool or the proxy supplied through environment variables.
# This is required: with the proxy enabled, every task draws one proxy from the pool,
# and an empty pool fails each task in turn.
if [ -z "${PROXY_CONFIG_FILE:-}" ]; then
    VM_PROXY_POOL_JSON="${CFG_PROXY_POOL_JSON:-[]}"
    if [ "${VM_PROXY_POOL_JSON}" = "[]" ] && [ -n "${OSWORLD_PROXY_HOST}" ] && [ -n "${OSWORLD_PROXY_PORT}" ]; then
        VM_PROXY_POOL_JSON="$(python3 -c 'import json,os; print(json.dumps([{"host":os.environ["OSWORLD_PROXY_HOST"],"port":int(os.environ["OSWORLD_PROXY_PORT"]),"protocol":"http"}]))')"
    fi
    PROXY_CONFIG_FILE="$(mktemp /tmp/democua_proxy_pool.XXXXXX.json)"
    printf '%s\n' "${VM_PROXY_POOL_JSON}" > "${PROXY_CONFIG_FILE}"
    PROXY_CONFIG_FILE_IS_TEMP=1
fi
export PROXY_CONFIG_FILE
# Fail fast: on a missing or empty file, load_proxies_from_file only warns and returns an
# empty pool, so every task raises "No proxy available from proxy pool" across a full run.
if [ ! -s "${PROXY_CONFIG_FILE}" ]; then
    echo "[ERROR] PROXY_CONFIG_FILE points to a missing or empty file: ${PROXY_CONFIG_FILE}" >&2
    echo "        desktop_env would receive an empty proxy pool, causing every task to raise 'No proxy available from proxy pool'." >&2
    echo "        Define proxy_pool at the top level of the YAML file, or point PROXY_CONFIG_FILE to valid JSON." >&2
    exit 1
fi
echo "[proxy-pool] PROXY_CONFIG_FILE=${PROXY_CONFIG_FILE} <- $(cat "${PROXY_CONFIG_FILE}")"

for _vllm_env_var in $(compgen -v | grep '^VLLM_ENV_EXPORT_'); do
    _key="${_vllm_env_var#VLLM_ENV_EXPORT_}"
    _val="${!_vllm_env_var}"
    export "${_key}=${_val}"
    echo "[vllm.env] export ${_key}=${_val}"
done

# ============ Cleanup ============
VLLM_PID=""
GPU_OCCUPY_PID=""
cleanup() {
    local code=$?
    trap - INT TERM EXIT
    if [ -n "${VLLM_PID:-}" ] && kill -0 "${VLLM_PID}" 2>/dev/null; then
        echo "Stopping vLLM PID: ${VLLM_PID}"
        kill -TERM "${VLLM_PID}" 2>/dev/null || true
        pkill -TERM -P "${VLLM_PID}" 2>/dev/null || true
        sleep 3
        kill -KILL "${VLLM_PID}" 2>/dev/null || true
        pkill -KILL -P "${VLLM_PID}" 2>/dev/null || true
    fi
    [ -n "${GPU_OCCUPY_PID:-}" ] && kill "${GPU_OCCUPY_PID}" 2>/dev/null || true
    # Remove only the proxy pool file this script created; leave an external PROXY_CONFIG_FILE alone.
    [ "${PROXY_CONFIG_FILE_IS_TEMP:-0}" = "1" ] && rm -f "${PROXY_CONFIG_FILE}" 2>/dev/null || true
    exit "$code"
}
trap cleanup INT TERM EXIT

echo "=========================================="
echo "DemoCUA Benchmark Runner (33 tasks, demo-in-the-loop)"
echo "=========================================="
echo "CONFIG_FILE:          ${CONFIG_FILE}"
echo "AGENT_NAME:           ${AGENT_NAME}"
echo "MODEL_NAME:           ${MODEL_NAME}"
echo "MODEL_PATH:           ${MODEL_PATH}"
echo "TASK_ROOT:            ${TASK_ROOT}"
echo "BENCHMARK_META:       ${BENCHMARK_META:-<all>}"
echo "CACHE_DIR:            ${CACHE_DIR}"
echo "DEMO_DIR:             ${DEMO_DIR:-<none>}"
echo "DEMO_MODE:            ${CFG_DEMO_MODE:-<off>} (enable=${CFG_ENABLE_DEMO})"
echo "NUM_ENVS:             ${NUM_ENVS}"
echo "MAX_STEPS:            ${MAX_STEPS}"
echo "NNODES:               ${NNODES}"
echo "VLLM_ENDPOINT:        ${VLLM_HOST}:${VLLM_PORT}"
echo "VM qcow2:             ${OSWORLD_DOCKER_VM_PATH}"
echo "VM source:            ${OSWORLD_VM_SOURCE_PATH}"
echo "Docker HTTP proxy:    ${DOCKER_HTTP_PROXY}"
echo "CODE_PATH:            ${CODE_PATH}"
echo "=========================================="

cd "${CODE_PATH}"

if command -v python3 >/dev/null 2>&1; then
    PYTHON_BIN="python3"
elif command -v python >/dev/null 2>&1; then
    PYTHON_BIN="python"
else
    echo "[ERROR] Neither python3 nor python is available; cannot start evaluation"
    exit 1
fi

# ============ Activate Python virtual environment if present ============
if [ -f /workspace/osworld/bin/activate ]; then
    . /workspace/osworld/bin/activate
fi
pip install openai pyyaml huggingface_hub -q 2>/dev/null || true

# Optional pip_packages from the YAML config.
PIP_PKGS=$(python3 -c "
import yaml
cfg = yaml.safe_load(open('${CONFIG_FILE}')) or {}
print(' '.join(cfg.get('pip_packages', [])))
" 2>/dev/null)
if [ -n "${PIP_PKGS}" ]; then
    echo "Installing extra packages: ${PIP_PKGS}"
    pip install -U ${PIP_PKGS} -q || true
fi

HF_ASSET_REPO="${HF_ASSET_REPO:-SamuelGuo/OSworker_cache}"
HF_REVISION="${HF_REVISION:-b6753bc357a756301f3429a95b38362da6035030}"
HF_ASSET_URL="https://huggingface.co/datasets/${HF_ASSET_REPO}"
hf_download_retry() {
    local expected_path="$1"
    shift
    local attempt

    for attempt in 1 2; do
        if hf download "$@" && [ -e "${expected_path}" ]; then
            return 0
        fi
        [ "${attempt}" -eq 1 ] && echo "[Hugging Face] The CLI may have just initialized or upgraded; retrying the download..."
    done
    return 1
}

download_hf_asset() {
    local remote_path="$1"
    local target_path="$2"
    local asset_name="$3"
    local download_dir="${target_path}.hf-download.$$"
    local downloaded_path="${download_dir}/${remote_path}"

    if ! command -v hf >/dev/null 2>&1; then
        echo "[ERROR] Cannot retrieve ${asset_name} from ${HF_ASSET_URL}: Hugging Face CLI (hf) is not installed." >&2
        return 1
    fi
    mkdir -p "$(dirname "${target_path}")"
    rm -rf "${download_dir}"
    echo "${asset_name} is missing locally; downloading from ${HF_ASSET_URL}/resolve/main/${remote_path}..."
    if ! hf_download_retry "${downloaded_path}" \
        "${HF_ASSET_REPO}" "${remote_path}" --repo-type dataset --local-dir "${download_dir}"; then
        rm -rf "${download_dir}"
        echo "[ERROR] Cannot retrieve ${asset_name} from ${HF_ASSET_URL}; check network access, proxy settings, and repository permissions." >&2
        return 1
    fi
    if [ ! -f "${downloaded_path}" ] || ! mv "${downloaded_path}" "${target_path}"; then
        rm -rf "${download_dir}"
        echo "[ERROR] Downloaded ${asset_name}, but could not write it to local path: ${target_path}" >&2
        return 1
    fi
    rm -rf "${download_dir}"
}

# ============ VM qcow2 (download from Hugging Face when missing) ============
if [ ! -r "${OSWORLD_VM_SOURCE_PATH}" ]; then
    download_hf_asset \
        "${OSWORLD_VM_HF_PATH:-images/Ubuntu.qcow2}" \
        "${OSWORLD_VM_SOURCE_PATH}" \
        "OSWorld VM image" || exit 1
fi
if [ ! -e "${OSWORLD_DOCKER_VM_PATH}" ]; then
    echo "Docker VM image path does not exist; linking it to: ${OSWORLD_DOCKER_VM_PATH}"
    mkdir -p "$(dirname "${OSWORLD_DOCKER_VM_PATH}")"
    ln -sfn "${OSWORLD_VM_SOURCE_PATH}" "${OSWORLD_DOCKER_VM_PATH}" || {
        echo "[ERROR] Failed to link VM image: ${OSWORLD_VM_SOURCE_PATH} -> ${OSWORLD_DOCKER_VM_PATH}" >&2
        exit 1
    }
fi
if [ ! -r "${OSWORLD_DOCKER_VM_PATH}" ]; then
    echo "[ERROR] VM image is missing or unreadable from the current runtime directory: ${OSWORLD_DOCKER_VM_PATH}" >&2
    exit 1
fi

# ============ OSWorker Benchmark cache (download from Hugging Face when missing) ============
# These 33 tasks are a subset of the 100-case benchmark and use the same cache.
if [ ! -e "${CACHE_DIR}" ]; then
    HF_CACHE_REPO="${HF_CACHE_REPO:-SamuelGuo/OSworker_cache}"
    HF_CACHE_URL="https://huggingface.co/datasets/${HF_CACHE_REPO}"
    CACHE_DOWNLOAD_DIR="${CACHE_DIR}.download.$$"
    echo "Benchmark cache is missing from the repository; downloading from ${HF_CACHE_URL} to: ${CACHE_DIR}"
    if ! command -v hf >/dev/null 2>&1; then
        echo "[ERROR] Cannot retrieve the OSWorker benchmark cache from ${HF_CACHE_URL}: Hugging Face CLI (hf) is not installed." >&2
        exit 1
    fi
    mkdir -p "$(dirname "${CACHE_DIR}")"
    rm -rf "${CACHE_DOWNLOAD_DIR}"
    if ! hf_download_retry "${CACHE_DOWNLOAD_DIR}" "${HF_CACHE_REPO}" --repo-type dataset \
        --revision "${HF_REVISION}" \
        --local-dir "${CACHE_DOWNLOAD_DIR}" --exclude "images/*"; then
        rm -rf "${CACHE_DOWNLOAD_DIR}"
        echo "[ERROR] Cannot retrieve the OSWorker benchmark cache from ${HF_CACHE_URL}; check network access, proxy settings, and repository permissions." >&2
        exit 1
    fi
    if ! mv "${CACHE_DOWNLOAD_DIR}" "${CACHE_DIR}"; then
        rm -rf "${CACHE_DOWNLOAD_DIR}"
        echo "[ERROR] Downloaded the cache from ${HF_CACHE_URL}, but could not write it to local directory: ${CACHE_DIR}" >&2
        exit 1
    fi
    printf '%s\n' "${HF_REVISION}" > "${CACHE_DIR}/.HF_REVISION"
fi
if [ ! -d "${CACHE_DIR}" ] || [ ! -r "${CACHE_DIR}" ]; then
    echo "[ERROR] Benchmark cache path exists but is not a readable directory: ${CACHE_DIR}" >&2
    exit 1
fi
if [ "${ALLOW_UNVERIFIED_CACHE:-0}" != "1" ]; then
    if [ ! -f "${CACHE_DIR}/.HF_REVISION" ]; then
        echo "[ERROR] Cache revision marker is missing: ${CACHE_DIR}/.HF_REVISION" >&2
        echo "        Re-download the cache or set ALLOW_UNVERIFIED_CACHE=1 for a manually verified cache." >&2
        exit 1
    fi
    CACHE_REVISION="$(tr -d '[:space:]' < "${CACHE_DIR}/.HF_REVISION")"
    if [ "${CACHE_REVISION}" != "${HF_REVISION}" ]; then
        echo "[ERROR] Cache revision ${CACHE_REVISION} does not match required ${HF_REVISION}." >&2
        exit 1
    fi
fi
echo "CACHE_DIR ready: ${CACHE_DIR}"

# ============ Mock endpoint sync (disabled by default) ============
# The sync script requires every endpoint to share one host and only understands the
# 100-case OSWorker layout, so running it here would corrupt the cache. The endpoints in
# the cache are already usable. Set AUTO_SYNC_MOCK_ENDPOINTS=1 to opt in anyway.
AUTO_SYNC_MOCK_ENDPOINTS="${AUTO_SYNC_MOCK_ENDPOINTS:-0}"
case "${AUTO_SYNC_MOCK_ENDPOINTS}" in
    0)
        echo "[mock-endpoint-sync] skipped (endpoints in the cache are already usable)"
        ;;
    1)
        echo "[mock-endpoint-sync] enabled manually; note the sync script requires every endpoint to share one host" >&2
        MOCK_ENDPOINT_MAP_FILE="${MOCK_ENDPOINT_MAP_FILE:-${CODE_PATH}/.MOCK_HOST}"
        MOCK_ENDPOINT_APPLIED_MAP="${MOCK_ENDPOINT_APPLIED_MAP:-${CACHE_DIR}/.MOCK_HOST.applied}"
        MOCK_ENDPOINT_META_FILE="${MOCK_ENDPOINT_META_FILE:-${BENCHMARK_META}}"
        MOCK_ENDPOINT_EXAMPLES_DIR="${MOCK_ENDPOINT_EXAMPLES_DIR:-${TASK_ROOT}/examples}"
        MOCK_ENDPOINT_SYNC_LOCK_TIMEOUT="${MOCK_ENDPOINT_SYNC_LOCK_TIMEOUT:-300}"
        "${PYTHON_BIN}" "${CODE_PATH}/scripts/cua_gym/cua_gym_convert/sync_mock_endpoints_v2.py" \
            --target-map "${MOCK_ENDPOINT_MAP_FILE}" \
            --applied-map "${MOCK_ENDPOINT_APPLIED_MAP}" \
            --meta "${MOCK_ENDPOINT_META_FILE}" \
            --cache-dir "${CACHE_DIR}" \
            --examples-dir "${MOCK_ENDPOINT_EXAMPLES_DIR}" \
            --apply \
            --bootstrap-applied \
            --lock-timeout "${MOCK_ENDPOINT_SYNC_LOCK_TIMEOUT}"
        MOCK_ENDPOINT_SYNC_STATUS=$?
        if [ "${MOCK_ENDPOINT_SYNC_STATUS}" -ne 0 ]; then
            echo "[ERROR] Mock endpoint sync failed; aborting startup: exit=${MOCK_ENDPOINT_SYNC_STATUS}" >&2
            exit "${MOCK_ENDPOINT_SYNC_STATUS}"
        fi
        ;;
    *)
        echo "[ERROR] AUTO_SYNC_MOCK_ENDPOINTS accepts only 0 or 1; current value: ${AUTO_SYNC_MOCK_ENDPOINTS}" >&2
        exit 2
        ;;
esac

# ============ Start Docker daemon through the proxy ============
ensure_docker_ready() {
    if ! command -v docker >/dev/null 2>&1; then
        echo "Installing Docker..."
        cp /etc/apt/sources.list /etc/apt/sources.list.bak 2>/dev/null || true
        cat > /etc/apt/sources.list <<'EOF'
deb http://mirrors.tencentyun.com/ubuntu/ jammy main restricted universe multiverse
deb http://mirrors.tencentyun.com/ubuntu/ jammy-updates main restricted universe multiverse
deb http://mirrors.tencentyun.com/ubuntu/ jammy-backports main restricted universe multiverse
deb http://mirrors.tencentyun.com/ubuntu/ jammy-security main restricted universe multiverse
EOF
        apt-get update -qq || true
        apt-get install -y -qq docker.io || { echo "[ERROR] Failed to install docker.io"; exit 1; }
    fi

    mkdir -p ~/.docker 2>/dev/null || true
    cat > ~/.docker/config.json <<EOF
{
  "proxies": {
    "default": {
      "httpProxy": "${DOCKER_HTTP_PROXY}",
      "httpsProxy": "${DOCKER_HTTPS_PROXY}",
      "noProxy": "${DOCKER_NO_PROXY}"
    }
  }
}
EOF

    if [ "${START_DOCKER_DAEMON}" = "1" ] && { [ "${RESTART_DOCKER_DAEMON}" = "1" ] || ! docker info >/dev/null 2>&1; }; then
        echo "Starting Docker daemon (proxy mode)..."
        pkill -9 dockerd 2>/dev/null || true
        sleep 2
        tmux kill-session -t docker 2>/dev/null || true
        local storage_driver_arg="--storage-driver=vfs"
        if [ -f /etc/docker/daemon.json ] && "${PYTHON_BIN}" - <<'PY' >/dev/null 2>&1
import json
with open("/etc/docker/daemon.json", "r", encoding="utf-8") as f:
    cfg = json.load(f)
raise SystemExit(0 if "storage-driver" in cfg else 1)
PY
        then
            storage_driver_arg=""
            echo "Docker daemon.json already defines storage-driver; omit dockerd --storage-driver flag."
        fi
        local dockerd_cmd="HTTP_PROXY=${DOCKER_HTTP_PROXY} HTTPS_PROXY=${DOCKER_HTTPS_PROXY} NO_PROXY=${DOCKER_NO_PROXY} dockerd ${storage_driver_arg} >/tmp/dockerd.log 2>&1"
        if command -v tmux >/dev/null 2>&1; then
            tmux new-session -d -s docker "$dockerd_cmd" 2>/dev/null || \
              env HTTP_PROXY="$DOCKER_HTTP_PROXY" HTTPS_PROXY="$DOCKER_HTTPS_PROXY" NO_PROXY="$DOCKER_NO_PROXY" nohup dockerd ${storage_driver_arg} >/tmp/dockerd.log 2>&1 &
        else
            env HTTP_PROXY="$DOCKER_HTTP_PROXY" HTTPS_PROXY="$DOCKER_HTTPS_PROXY" NO_PROXY="$DOCKER_NO_PROXY" nohup dockerd ${storage_driver_arg} >/tmp/dockerd.log 2>&1 &
        fi
    fi

    echo "Waiting for Docker daemon to be ready..."
    local waited=0
    local docker_ready_timeout="${DOCKER_READY_TIMEOUT:-120}"
    while ! docker info >/dev/null 2>&1; do
        sleep 2; waited=$((waited + 2))
        if [ $((waited % 10)) -eq 0 ]; then
            echo "  still waiting for Docker daemon (${waited}s), log: /tmp/dockerd.log"
        fi
        if [ $waited -ge "$docker_ready_timeout" ]; then
            echo "[ERROR] Docker daemon did not become ready within ${docker_ready_timeout}s" >&2
            [ -f /tmp/dockerd.log ] && tail -n 80 /tmp/dockerd.log >&2 || true
            exit 1
        fi
    done
    echo "Docker daemon is ready."

    echo "Cleaning up old OSWorld containers..."
    docker ps -a --filter "ancestor=osworld" -q | xargs -r docker rm -f 2>/dev/null || true
    docker ps -a --filter "ancestor=happysixd/osworld-docker" -q | xargs -r docker rm -f 2>/dev/null || true

    if [ "${LOAD_OSWORLD_IMAGE}" = "1" ] && ! docker images | grep -qE 'osworld|happysixd'; then
        local image_tar=""
        for cand in \
            "${OSWORLD_DOCKER_IMAGE_TAR:-}" \
            "${CODE_PATH}/osworld_image.tar" \
            ; do
            [ -n "$cand" ] && [ -f "$cand" ] && { image_tar="$cand"; break; }
        done
        if [ -z "$image_tar" ]; then
            image_tar="${OSWORLD_DOCKER_IMAGE_TAR:-${CODE_PATH}/osworld_image.tar}"
            download_hf_asset \
                "${OSWORLD_DOCKER_IMAGE_HF_PATH:-images/osworld_image.tar}" \
                "${image_tar}" \
                "OSWorld Docker image" || exit 1
        fi
        echo "Loading Docker image from: $image_tar"
        docker load -i "$image_tar" || {
            echo "[ERROR] Failed to load Docker image: ${image_tar}" >&2
            exit 1
        }
    fi
    docker images | grep -qE 'osworld|happysixd' || echo "[WARN] No osworld docker image found" >&2
}
ensure_docker_ready

# ============ GPU monitoring ============
if [ -f "${SCRIPT_DIR}/gpu_watcher/gpu_occupy.py" ]; then
    "${PYTHON_BIN}" "${SCRIPT_DIR}/gpu_watcher/gpu_occupy.py" &
    GPU_OCCUPY_PID=$!
fi

# ============ Multi-node discovery ============
if [ "${NNODES}" -gt 1 ] 2>/dev/null; then
    echo "========== Multi-node mode: ${NNODES} nodes =========="
    export NCCL_IB_TIMEOUT=24 NCCL_IB_GID_INDEX=3 NCCL_IB_SL=3 NCCL_CHECK_DISABLE=1
    export NCCL_P2P_DISABLE=0 NCCL_IB_DISABLE=0 NCCL_LL_THRESHOLD=16384
    export NCCL_IB_CUDA_SUPPORT=1 NCCL_SOCKET_IFNAME=bond1 UCX_NET_DEVICES=bond1
    export NCCL_IB_HCA=mlx5_bond_1,mlx5_bond_5,mlx5_bond_3,mlx5_bond_7,mlx5_bond_4,mlx5_bond_8,mlx5_bond_2,mlx5_bond_6
    export NCCL_COLLNET_ENABLE=0 SHARP_COLL_ENABLE_SAT=0 NCCL_NET_GDR_LEVEL=2
    export NCCL_IB_QPS_PER_CONNECTION=4 NCCL_IB_TC=160 NCCL_PXN_DISABLE=1 NCCL_NVLS_ENABLE=0

    # vllm.env from YAML wins; an empty string unsets the variable.
    for _vllm_env_var in $(compgen -v | grep '^VLLM_ENV_EXPORT_'); do
        _key="${_vllm_env_var#VLLM_ENV_EXPORT_}"
        _val="${!_vllm_env_var}"
        if [ -z "${_val}" ]; then unset "${_key}"; echo "[vllm.env][multi-node] unset ${_key}"; else export "${_key}=${_val}"; echo "[vllm.env][multi-node] export ${_key}=${_val}"; fi
    done

    if   [ -n "${INDEX:-}" ]; then RANK=$INDEX
    elif [ -n "${RANK:-}" ]; then RANK=$RANK
    elif [ -n "${OMPI_COMM_WORLD_RANK:-}" ]; then RANK=$OMPI_COMM_WORLD_RANK
    elif [ -n "${PMI_RANK:-}" ]; then RANK=$PMI_RANK
    else RANK=0; fi

    if   [ -n "${NODE_IP_0:-}" ]; then MASTER_IP=$NODE_IP_0
    elif [ -n "${MASTER_ADDR:-}" ]; then MASTER_IP=$MASTER_ADDR
    elif [ -n "${CHIEF_IP:-}" ]; then MASTER_IP=$CHIEF_IP
    else MASTER_IP=""; fi

    if   [ -n "${LOCAL_IP:-}" ]; then MY_IP=$LOCAL_IP
    elif [ -n "${POD_IP:-}" ]; then MY_IP=$POD_IP
    else MY_IP=$(hostname -I 2>/dev/null | awk '{print $1}'); fi
    echo "RANK=$RANK  MASTER_IP=$MASTER_IP  MY_IP=$MY_IP"

    { [ -z "$MASTER_IP" ] || [ -z "$MY_IP" ]; } && { echo "[ERROR] Could not determine the node IP"; env | sort; exit 1; }
    IS_MASTER=false
    [ "$MY_IP" = "$MASTER_IP" ] && IS_MASTER=true

    MY_NIC=$(ip -o -4 addr show 2>/dev/null | awk -v ip="${MY_IP}" '$4 ~ "^"ip"/" {print $2; exit}')
    [ -z "${MY_NIC}" ] && MY_NIC=$(ip route get "${MASTER_IP}" 2>/dev/null | awk '{for(i=1;i<=NF;i++) if($i=="dev") {print $(i+1); exit}}')
    if [ -n "${MY_NIC}" ]; then
        : "${GLOO_SOCKET_IFNAME:=${MY_NIC}}"; : "${TP_SOCKET_IFNAME:=${MY_NIC}}"; : "${NCCL_SOCKET_IFNAME:=${MY_NIC}}"
        export GLOO_SOCKET_IFNAME TP_SOCKET_IFNAME NCCL_SOCKET_IFNAME
        echo "[multi-node net] *_SOCKET_IFNAME=${MY_NIC}"
    fi
    VLLM_HOST="${MY_IP}"
    export OPENAI_BASE_URL="http://${MY_IP}:${VLLM_PORT}/v1"
fi

# ============ Local endpoint health checks without http_proxy ============
openai_endpoint_ready() {
    env -u http_proxy -u https_proxy -u HTTP_PROXY -u HTTPS_PROXY -u ALL_PROXY -u all_proxy \
        curl -fsS --max-time 5 --noproxy '*' "http://${VLLM_HOST}:${VLLM_PORT}/health" >/dev/null 2>&1 \
    || env -u http_proxy -u https_proxy -u HTTP_PROXY -u HTTPS_PROXY -u ALL_PROXY -u all_proxy \
        curl -fsS --max-time 5 --noproxy '*' "http://${VLLM_HOST}:${VLLM_PORT}/v1/models" >/dev/null 2>&1
}
wait_openai_endpoint() {
    local waited=0
    echo "Waiting for OpenAI endpoint: http://${VLLM_HOST}:${VLLM_PORT}/v1"
    while ! openai_endpoint_ready; do
        sleep 10; waited=$((waited + 10))
        [ $waited -ge "$VLLM_READY_TIMEOUT" ] && { echo "[ERROR] vLLM did not become ready within ${waited}s"; return 1; }
        echo "  still waiting... (${waited}s)"
    done
    echo "OpenAI endpoint is ready: http://${VLLM_HOST}:${VLLM_PORT}/v1"
}
wait_existing_openai_endpoint() {
    local waited=0
    echo "Waiting up to ${VLLM_EXISTING_WAIT_TIMEOUT}s for an existing OpenAI endpoint..."
    while [ "$waited" -lt "${VLLM_EXISTING_WAIT_TIMEOUT}" ]; do
        sleep 1
        waited=$((waited + 1))
        openai_endpoint_ready && return 0
    done
    return 1
}

# ============ Start vLLM ============
DATA_PARALLEL_ARG=""; [ "${DATA_PARALLEL_SIZE}" -gt 1 ] 2>/dev/null && DATA_PARALLEL_ARG="--data-parallel-size ${DATA_PARALLEL_SIZE}"
PIPELINE_PARALLEL_ARG=""; [ "${PIPELINE_PARALLEL_SIZE}" -gt 1 ] 2>/dev/null && PIPELINE_PARALLEL_ARG="--pipeline-parallel-size ${PIPELINE_PARALLEL_SIZE}"
MAX_MODEL_LEN_ARG=""; [ -n "${MAX_MODEL_LEN}" ] && MAX_MODEL_LEN_ARG="--max-model-len ${MAX_MODEL_LEN}"

SERVE_MM_ARGS=()
if [ "${AGENT_NAME}" = "scalecua" ]; then
    SERVE_MM_ARGS+=(--compilation-config "{\"cudagraph_mode\": \"PIECEWISE\"}")
else
    SERVE_MM_ARGS+=(--limit-mm-per-prompt "{\"image\":${VLLM_IMAGE_LIMIT},\"video\":0}")
fi

if [ "${NNODES}" -gt 1 ] 2>/dev/null && [ "${IS_MASTER:-true}" != true ]; then
    # ---- Multi-node worker: serve vLLM only, do not run the benchmark ----
    echo "[multi-node worker] starting vLLM (headless), will not run benchmark"
    vllm serve "${MODEL_PATH}" --trust-remote-code \
        --chat-template-content-format openai \
        "${SERVE_MM_ARGS[@]}" \
        --tensor-parallel-size "${TENSOR_PARALLEL_SIZE}" \
        ${PIPELINE_PARALLEL_ARG} ${DATA_PARALLEL_ARG} ${MAX_MODEL_LEN_ARG} \
        --port "${VLLM_PORT}" --served-model-name "${MODEL_NAME}" \
        --host "${MY_IP}" --nnodes "${NNODES}" --node-rank "${RANK}" --master-addr "${MASTER_IP}" \
        --headless ${VLLM_EXTRA_ARGS} &
    VLLM_PID=$!
    wait "${VLLM_PID}"
    exit $?
fi

# ---- Master or single node ----
START_LOCAL_VLLM=0
if openai_endpoint_ready; then
    echo "OpenAI endpoint already running, reuse: http://${VLLM_HOST}:${VLLM_PORT}/v1"
elif [ "${START_VLLM}" = "0" ] || [ "${START_VLLM}" = "false" ] || [ -z "${MODEL_PATH}" ] || [ ! -e "${MODEL_PATH}" ]; then
    if [ "${START_VLLM}" = "0" ] || [ "${START_VLLM}" = "false" ]; then
        echo "Not auto-starting vLLM: START_VLLM=${START_VLLM}. Waiting for an existing endpoint..."
    elif [ -z "${MODEL_PATH}" ]; then
        echo "Not auto-starting vLLM: MODEL_PATH is empty. Waiting for an existing endpoint..."
    else
        echo "[WARN] Not auto-starting vLLM: MODEL_PATH does not exist: ${MODEL_PATH}" >&2
        echo "       The model directory was inferred from agent.model ('${MODEL_NAME}'). To start vLLM locally," >&2
        echo "       override it with MODEL_PATH=/path/to/checkpoint, or set agent.model_path in the YAML." >&2
        echo "       Falling back to waiting for an existing endpoint..." >&2
    fi
    wait_openai_endpoint || exit 1
else
    if wait_existing_openai_endpoint; then
        echo "OpenAI endpoint is ready, reuse: http://${VLLM_HOST}:${VLLM_PORT}/v1"
    else
        echo "No existing endpoint after ${VLLM_EXISTING_WAIT_TIMEOUT}s; auto-starting vLLM."
        START_LOCAL_VLLM=1
    fi
fi

if [ "${START_LOCAL_VLLM}" = "1" ]; then
    echo "Starting vLLM server for ${MODEL_NAME} (TP=${TENSOR_PARALLEL_SIZE}, DP=${DATA_PARALLEL_SIZE}, PP=${PIPELINE_PARALLEL_SIZE}, NNODES=${NNODES})..."
    if [ "${NNODES}" -gt 1 ] 2>/dev/null; then
        vllm serve "${MODEL_PATH}" --trust-remote-code \
            --chat-template-content-format openai \
            "${SERVE_MM_ARGS[@]}" \
            --tensor-parallel-size "${TENSOR_PARALLEL_SIZE}" \
            ${PIPELINE_PARALLEL_ARG} ${DATA_PARALLEL_ARG} ${MAX_MODEL_LEN_ARG} \
            --port "${VLLM_PORT}" --served-model-name "${MODEL_NAME}" \
            --host "${MY_IP}" --nnodes "${NNODES}" --node-rank "${RANK}" --master-addr "${MASTER_IP}" \
            ${VLLM_EXTRA_ARGS} &
    else
        vllm serve "${MODEL_PATH}" --trust-remote-code \
            --chat-template-content-format openai \
            "${SERVE_MM_ARGS[@]}" \
            --tensor-parallel-size "${TENSOR_PARALLEL_SIZE}" \
            ${PIPELINE_PARALLEL_ARG} ${DATA_PARALLEL_ARG} ${MAX_MODEL_LEN_ARG} \
            --port "${VLLM_PORT}" --served-model-name "${MODEL_NAME}" \
            ${VLLM_EXTRA_ARGS} &
    fi
    VLLM_PID=$!
    echo "vLLM PID: ${VLLM_PID}"
    wait_openai_endpoint || exit 1
fi

# ============ Bypass the proxy for the local endpoint ============
# Append rather than overwrite: configure_region_proxy already adds the mock host and Docker networks
# to no_proxy. Replacing the entire value would remove them, route host-side reward.py requests back
# through the proxy, and trigger a difficult-to-diagnose 403 that produces a zero score.
export no_proxy="${no_proxy:+${no_proxy},}localhost,127.0.0.1,${VLLM_HOST}"
export NO_PROXY="${no_proxy}"

# ============ Task validation and run ============
run_one_evaluation() {
local repeat_index="$1"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
case "${RESULT_DIR}" in /*) RESULT_ROOT="${RESULT_DIR}" ;; *) RESULT_ROOT="${CODE_PATH}/${RESULT_DIR}" ;; esac
MODEL_RESULT_NAME="${MODEL_NAME//\//_}"
RUN_INDEX=1
for EXISTING_DIR in "${RESULT_ROOT}/${MODEL_RESULT_NAME}_run"*_*; do
    [ -d "${EXISTING_DIR}" ] || continue
    EXISTING_NAME="${EXISTING_DIR##*/}"
    EXISTING_RUN="${EXISTING_NAME:${#MODEL_RESULT_NAME}+4}"
    EXISTING_RUN="${EXISTING_RUN%%_*}"
    case "${EXISTING_RUN}" in ''|*[!0-9]*) continue ;; esac
    [ "${EXISTING_RUN}" -ge "${RUN_INDEX}" ] && RUN_INDEX=$((EXISTING_RUN + 1))
done
FINAL_RESULT_DIR="${RESULT_ROOT}/${MODEL_RESULT_NAME}_run${RUN_INDEX}_${TIMESTAMP}"
META_PATH="${BENCHMARK_META}"
RETRY_META_PATH="${FINAL_RESULT_DIR}/.batch_task_retry_meta.json"
MISSING_TASKS_PATH="${FINAL_RESULT_DIR}/.missing_result_tasks.txt"
RUN_LOG="${FINAL_RESULT_DIR}/run_osworker_benchmark_democua.log"
mkdir -p "${FINAL_RESULT_DIR}"

if [ ! -d "${TASK_ROOT}" ]; then
    echo "[ERROR] TASK_ROOT does not exist: ${TASK_ROOT}"; exit 1
fi
if [ ! -f "${META_PATH}" ]; then
    echo "[ERROR] BENCHMARK_META does not exist: ${META_PATH}"; exit 1
fi
if [ ! -d "${CACHE_DIR}" ]; then
    echo "[ERROR] CACHE_DIR does not exist: ${CACHE_DIR}"; exit 1
fi

# Beyond task configs and cache directories, also check that each task's setup files and
# demo guide are present. Missing either makes the results unusable, so stop early.
"$PYTHON_BIN" - "$TASK_ROOT" "$META_PATH" "$CACHE_DIR" "${DEMO_DIR:-}" <<'PY'
import json, sys
from pathlib import Path

task_root = Path(sys.argv[1]).resolve()
meta_path = Path(sys.argv[2]).resolve()
cache_dir = Path(sys.argv[3]).resolve()
demo_dir = Path(sys.argv[4]).resolve() if sys.argv[4] else None
meta = json.load(meta_path.open(encoding="utf-8"))
if not isinstance(meta, dict):
    raise SystemExit(f"Benchmark meta must be a domain -> task ids mapping: {meta_path}")

missing_configs, missing_cache, missing_cache_files, missing_demos = [], [], [], []
count = 0
for domain, task_ids in meta.items():
    for task_id in task_ids:
        count += 1
        legacy = task_root / "examples" / domain / f"{task_id}.json"
        directory = task_root / "examples" / domain / task_id / "task.json"
        cfg_path = legacy if legacy.is_file() else directory
        if not cfg_path.is_file():
            missing_configs.append(f"{domain}/{task_id}")
            continue
        task_cache = cache_dir / task_id
        if not task_cache.is_dir():
            missing_cache.append(task_id)
        else:
            cfg = json.load(cfg_path.open(encoding="utf-8"))
            for step in cfg.get("config") or []:
                if step.get("type") != "upload_cache_file":
                    continue
                for f in (step.get("parameters") or {}).get("files") or []:
                    rel = f.get("local_path") or ""
                    if rel and not Path(rel).is_absolute() and not (task_cache / rel).is_file():
                        missing_cache_files.append(f"{task_id}/{rel}")
        if demo_dir is not None:
            if not sorted((demo_dir / task_id).glob("trajectory_captioned*.json")):
                missing_demos.append(task_id)

if missing_configs:
    raise SystemExit(f"Missing task configs ({len(missing_configs)}): {missing_configs}")
if missing_cache:
    raise SystemExit(f"Missing task cache dirs ({len(missing_cache)}): {missing_cache}")
if missing_cache_files:
    raise SystemExit(f"Missing cache files ({len(missing_cache_files)}): {missing_cache_files}")
if missing_demos:
    raise SystemExit(
        f"Missing demos ({len(missing_demos)}) under {demo_dir}: {missing_demos}\n"
        "demo-in-the-loop is on; a missing demo silently degrades that task to the "
        "no-demo control arm, so refusing to start."
    )
print(f"Validated {count} tasks across {len(meta)} domains"
      + (f", demos OK under {demo_dir}" if demo_dir is not None else ""))
PY
[ $? -ne 0 ] && { echo "[ERROR] Task discovery failed"; exit 1; }

echo "=========================================="
echo "Evaluation Run: ${repeat_index}/${REPEAT_RUNS}"
echo "Starting DemoCUA benchmark evaluation..."
echo "Result Dir:   ${FINAL_RESULT_DIR}"
echo "Meta Path:    ${META_PATH}"
echo "Task Root:    ${TASK_ROOT}"
echo "Cache Dir:    ${CACHE_DIR}"
echo "Demo Dir:     ${DEMO_DIR:-<none>}"
echo "API Endpoint: http://${VLLM_HOST}:${VLLM_PORT}/v1"
echo "=========================================="

run_benchmark() {
    local meta="$1"
    local log="$2"
    local demo_args=()
    # Pass --demo_dir explicitly; the agent uses it to locate each task's guide.
    [ -n "${DEMO_DIR:-}" ] && demo_args=(--demo_dir "${DEMO_DIR}")
    "$PYTHON_BIN" run_multienv_new.py \
        --config "${CONFIG_FILE}" \
        --model "${MODEL_NAME}" \
        --test_all_meta_path "${meta}" \
        --test_config_base_dir "${TASK_ROOT}" \
        --cache_dir "${CACHE_DIR}" \
        "${demo_args[@]}" \
        --domain all \
        --result_dir "${FINAL_RESULT_DIR}" \
        --num_envs "${NUM_ENVS}" \
        --max_steps "${MAX_STEPS}" \
        --log_level INFO \
        2>&1 | tee "${log}"
    return "${PIPESTATUS[0]}"
}

log_has_execution_error() {
    grep -Eq "Executor error|Unexpected error|DockerException|Traceback \(most recent call last\)|Prediction failed:|No valid actions \(empty/error\)" "$1"
}

EXIT_CODE=0
run_benchmark "${META_PATH}" "${RUN_LOG}"
EXIT_CODE=$?
if log_has_execution_error "${RUN_LOG}"; then
    EXIT_CODE=1
fi

# ============ Automatically retry missing result.txt files ============
write_missing_retry_meta() {
    "$PYTHON_BIN" - "${FINAL_RESULT_DIR}" "${META_PATH}" "${RETRY_META_PATH}" "${MISSING_TASKS_PATH}" <<'PY'
import json, sys
from pathlib import Path
result_dir = Path(sys.argv[1]).resolve()
source_meta = json.load(Path(sys.argv[2]).open(encoding="utf-8"))
retry_meta_path = Path(sys.argv[3])
missing_tasks_path = Path(sys.argv[4])
missing_by_domain = {}
missing_flat = []
for domain, task_ids in source_meta.items():
    missing = [
        task_id for task_id in task_ids
        if not list(result_dir.glob(f"**/{domain}/{task_id}/result.txt"))
    ]
    if missing:
        missing_by_domain[domain] = missing
        missing_flat.extend(f"{domain}/{task_id}" for task_id in missing)
with missing_tasks_path.open("w", encoding="utf-8") as f:
    f.writelines(f"{t}\n" for t in missing_flat)
with retry_meta_path.open("w", encoding="utf-8") as f:
    json.dump(missing_by_domain, f, indent=2, ensure_ascii=False); f.write("\n")
print(len(missing_flat))
PY
}

if [ "${RETRY_MISSING_RESULTS}" = "1" ] && [ "${MAX_MISSING_RESULT_RETRIES}" -gt 0 ]; then
    retry_index=1
    while [ "${retry_index}" -le "${MAX_MISSING_RESULT_RETRIES}" ]; do
        missing_count="$(write_missing_retry_meta)"
        if [ "${missing_count}" = "0" ]; then
            echo "No missing result.txt files after run."
            break
        fi
        echo ""
        echo "Detected ${missing_count} tasks without result.txt. Retry ${retry_index}/${MAX_MISSING_RESULT_RETRIES}."
        cat "${MISSING_TASKS_PATH}"
        RETRY_LOG="${FINAL_RESULT_DIR}/run_osworker_benchmark_democua_retry_${retry_index}.log"
        run_benchmark "${RETRY_META_PATH}" "${RETRY_LOG}"
        RETRY_EXIT_CODE=$?
        if log_has_execution_error "${RETRY_LOG}"; then
            RETRY_EXIT_CODE=1
        fi
        [ "${RETRY_EXIT_CODE}" -ne 0 ] && EXIT_CODE="${RETRY_EXIT_CODE}"
        retry_index=$((retry_index + 1))
    done
fi

# Refresh these files after the final attempt so they describe the final state.
remaining_missing_count="$(write_missing_retry_meta)"
if [ "${remaining_missing_count}" != "0" ]; then
    echo "[ERROR] ${remaining_missing_count} tasks still have no result.txt; see ${MISSING_TASKS_PATH}" >&2
    EXIT_CODE=1
fi

echo "=========================================="
echo "DemoCUA benchmark evaluation completed!"
echo "Results:   ${FINAL_RESULT_DIR}"
echo "Run Log:   ${RUN_LOG}"
echo "Exit Code: ${EXIT_CODE}"
echo "=========================================="

return "${EXIT_CODE}"
}

REPEAT_RUNS="${REPEAT_RUNS:-1}"
case "${REPEAT_RUNS}" in
    ''|*[!0-9]*|0) echo "[ERROR] REPEAT_RUNS must be a positive integer: ${REPEAT_RUNS}" >&2; exit 1 ;;
esac

OVERALL_EXIT_CODE=0
for ((repeat_index = 1; repeat_index <= REPEAT_RUNS; repeat_index++)); do
    run_one_evaluation "${repeat_index}"
    run_exit_code=$?
    [ "${run_exit_code}" -ne 0 ] && OVERALL_EXIT_CODE="${run_exit_code}"
done

exit "${OVERALL_EXIT_CODE}"
