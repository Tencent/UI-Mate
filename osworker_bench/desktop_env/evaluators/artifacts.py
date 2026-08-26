"""Save evaluator inputs and source code for offline reproduction."""

from __future__ import annotations

import ast
import inspect
import json
import logging
import os
import shutil
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, TYPE_CHECKING

from desktop_env.evaluators import metrics as metrics_pkg
from desktop_env.evaluators.replay import write_replay_script
from desktop_env.evaluators.results import MetricRecord

if TYPE_CHECKING:
    from desktop_env.desktop_env import DesktopEnv

logger = logging.getLogger("desktopenv.evaluator.artifacts")

_LARGE_TEXT_THRESHOLD = 256 * 1024
_FILE_MARKER = "__type__"
_COMPONENTS_SIDECAR_NAME = "_cua_reward_components.json"


def artifacts_enabled() -> bool:
    return os.environ.get("OSWORLD_SAVE_EVALUATOR_ARTIFACTS", "0") != "0"


def _json_dump(path: str, data: Any) -> None:
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        f.write("\n")


def _load_components_sidecar(env: "DesktopEnv") -> Optional[Dict[str, Any]]:
    """Read the per-module components sidecar written by ``cua_gym_reward``.

    Falls back to parsing ``_cua_reward_stdout.txt`` on demand via
    ``ensure_components_sidecar`` — this covers the case where
    ``DesktopEnv.evaluate()`` short-circuits on a FAIL action and skips
    ``_evaluate_metrics()`` (so ``cua_gym_reward`` never ran) but the
    postconfig has already captured the reward.py stdout with COMPONENT
    lines. Returns None when no component info is available. Never raises.
    """
    eval_cache_dir = getattr(env, "eval_cache_dir", None)
    if not eval_cache_dir:
        return None
    stdout_path = os.path.join(eval_cache_dir, "_cua_reward_stdout.txt")
    try:
        from desktop_env.evaluators.metrics.cua_gym import ensure_components_sidecar
        return ensure_components_sidecar(stdout_path)
    except Exception:  # noqa: BLE001 — purely additive metadata
        return None


def _unique_dest_path(files_dir: str, basename: str) -> str:
    dest = os.path.join(files_dir, basename)
    if not os.path.exists(dest):
        return dest
    stem, ext = os.path.splitext(basename)
    counter = 1
    while True:
        candidate = os.path.join(files_dir, f"{stem}_{counter}{ext}")
        if not os.path.exists(candidate):
            return candidate
        counter += 1


def serialize_value(
    value: Any,
    files_dir: str,
    copied_cache: Dict[str, str],
    text_counter: List[int],
) -> Any:
    """Serialize evaluator input values, copying files into files_dir."""
    if value is None:
        return None

    if isinstance(value, str):
        if os.path.isfile(value):
            if value in copied_cache:
                saved_as = copied_cache[value]
            else:
                os.makedirs(files_dir, exist_ok=True)
                basename = os.path.basename(value)
                dest = _unique_dest_path(files_dir, basename)
                shutil.copy2(value, dest)
                saved_as = os.path.join("files", os.path.basename(dest))
                copied_cache[value] = saved_as
            return {
                _FILE_MARKER: "file",
                "saved_as": saved_as,
                "original_path": value,
            }

        encoded = value.encode("utf-8")
        if len(encoded) > _LARGE_TEXT_THRESHOLD:
            os.makedirs(files_dir, exist_ok=True)
            text_counter[0] += 1
            filename = f"large_text_{text_counter[0]}.txt"
            dest = os.path.join(files_dir, filename)
            with open(dest, "w", encoding="utf-8") as f:
                f.write(value)
            saved_as = os.path.join("files", filename)
            return {_FILE_MARKER: "text_file", "saved_as": saved_as}

        return value

    if isinstance(value, (list, tuple)):
        return [serialize_value(item, files_dir, copied_cache, text_counter) for item in value]

    if isinstance(value, dict):
        return {
            key: serialize_value(item, files_dir, copied_cache, text_counter)
            for key, item in value.items()
        }

    try:
        json.dumps(value)
        return value
    except (TypeError, ValueError):
        return {_FILE_MARKER: "repr", "value": repr(value)}


def _metrics_dir() -> str:
    return os.path.dirname(metrics_pkg.__file__)


def _repo_root() -> str:
    """Directory holding the importable ``desktop_env`` package.

    Copied metric modules still import ``desktop_env.evaluators.metrics`` for
    their shared helpers, so replay needs this path on ``sys.path``.
    """
    return os.path.dirname(os.path.dirname(os.path.dirname(_metrics_dir())))


def _extract_function_source(py_file: str, function_name: str) -> Optional[str]:
    with open(py_file, "r", encoding="utf-8") as f:
        source = f.read()
    tree = ast.parse(source, filename=py_file)
    for node in tree.body:
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)) and node.name == function_name:
            segment = ast.get_source_segment(source, node)
            if segment:
                return segment
    return None


def _find_builtin_function_source(function_name: str) -> tuple[str, str]:
    metrics_dir = _metrics_dir()
    for py_file in sorted(os.path.join(metrics_dir, name) for name in os.listdir(metrics_dir)):
        if not py_file.endswith(".py"):
            continue
        function_source = _extract_function_source(py_file, function_name)
        if function_source:
            rel_path = os.path.relpath(py_file, metrics_dir)
            return rel_path, f"# Source: desktop_env/evaluators/metrics/{rel_path}\n{function_source}"
    raise FileNotFoundError(
        f"Could not find builtin metric function '{function_name}' under {metrics_dir}"
    )


def save_metric_source(
    code_dir: str,
    func_names: List[str],
) -> Dict[str, str]:
    """Copy or extract metric source code. Returns func_name -> code filename."""
    os.makedirs(code_dir, exist_ok=True)
    func_to_file: Dict[str, str] = {}

    for func_name in func_names:
        metric = getattr(metrics_pkg, func_name)
        dest_name = f"{func_name}.py"
        dest_path = os.path.join(code_dir, dest_name)
        # Copy the whole defining module so offline replay has access to
        # imports and module-level helpers (loggers, compiled regexes, …)
        # that the function body depends on. Using inspect.getsource() alone
        # would only yield the function definition and miss those deps.
        try:
            module_path = inspect.getfile(metric)
        except (TypeError, OSError):
            rel_path, _ = _find_builtin_function_source(func_name)
            module_path = os.path.join(_metrics_dir(), rel_path)
        shutil.copy2(module_path, dest_path)
        func_to_file[func_name] = dest_name

    return func_to_file


def _func_names(evaluator: Dict[str, Any]) -> List[str]:
    funcs = evaluator.get("func")
    if isinstance(funcs, str):
        return [funcs]
    if isinstance(funcs, list):
        return [str(name) for name in funcs]
    return []


def save_evaluator_artifacts(
    env: "DesktopEnv",
    metric_records: List[MetricRecord],
    score: float,
    *,
    error: Optional[str] = None,
) -> Optional[str]:
    """Persist evaluator artifacts under env.eval_result_dir/evaluator."""
    if not artifacts_enabled():
        return None
    if not env.eval_result_dir:
        return None

    artifact_dir = os.path.join(env.eval_result_dir, "evaluator")
    metrics_root = os.path.join(artifact_dir, "metrics")
    code_dir = os.path.join(artifact_dir, "code")
    os.makedirs(artifact_dir, exist_ok=True)

    evaluator = getattr(env, "evaluator", {}) or {}
    func_names = _func_names(evaluator)
    components_sidecar = _load_components_sidecar(env)

    try:
        func_to_file = save_metric_source(code_dir, func_names)
    except Exception as exc:
        logger.warning("Failed to save evaluator source code: %s", exc)
        func_to_file = {}

    for idx, record in enumerate(metric_records):
        # Accept a MetricRecord (the normal path) or a legacy dict (defensive:
        # older callers may still pass dicts). Normalize to MetricRecord so the
        # rest of the loop is plain attribute access.
        if isinstance(record, dict):
            record = MetricRecord.from_dict(record, idx=idx)

        metric_dir = os.path.join(metrics_root, str(idx))
        inputs_dir = os.path.join(metric_dir, "inputs")
        files_dir = os.path.join(inputs_dir, "files")
        os.makedirs(inputs_dir, exist_ok=True)

        copied_cache: Dict[str, str] = {}
        text_counter = [0]

        result_serialized = serialize_value(
            record.result_state,
            files_dir,
            copied_cache,
            text_counter,
        )
        expected_serialized = serialize_value(
            record.expected_state,
            files_dir,
            copied_cache,
            text_counter,
        )

        func_name = record.func_name if record.func_name is not None else (
            func_names[idx] if idx < len(func_names) else "unknown"
        )
        with open(os.path.join(metric_dir, "func.txt"), "w", encoding="utf-8") as f:
            f.write(func_name)

        _json_dump(os.path.join(metric_dir, "result_getter.json"), record.result_getter_config)
        _json_dump(os.path.join(metric_dir, "expected_getter.json"), record.expected_getter_config)
        _json_dump(os.path.join(metric_dir, "options.json"), record.options or {})
        _json_dump(os.path.join(inputs_dir, "result.json"), result_serialized)
        _json_dump(os.path.join(inputs_dir, "expected.json"), expected_serialized)

        metric_score = record.metric_score
        if metric_score is not None:
            score_payload: Dict[str, Any] = {"score": metric_score}
            if components_sidecar and func_name == "cua_gym_reward":
                score_payload["components"] = components_sidecar
            _json_dump(os.path.join(metric_dir, "metric_score.json"), score_payload)

        code_file = func_to_file.get(func_name)
        if code_file:
            with open(os.path.join(metric_dir, "code_file.txt"), "w", encoding="utf-8") as f:
                f.write(code_file)

    _json_dump(os.path.join(artifact_dir, "config.json"), evaluator)

    manifest = {
        "task_id": getattr(env, "task_id", None),
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "score": score,
        "conj": evaluator.get("conj", "and"),
        "func": evaluator.get("func"),
        "postconfig": evaluator.get("postconfig", []),
        "code_files": func_to_file,
        "metric_count": len(metric_records),
        "error": error,
        "components": components_sidecar,
        "repo_root": _repo_root(),
    }
    _json_dump(os.path.join(artifact_dir, "manifest.json"), manifest)
    write_replay_script(artifact_dir)
    logger.info("Saved evaluator artifacts to %s", artifact_dir)
    return artifact_dir
