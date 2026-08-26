#!/usr/bin/env python3
"""Standalone offline replay for saved evaluator artifacts."""

from __future__ import annotations

import importlib.util
import inspect
import json
import os
import shutil
import sys
from typing import Any


REPLAY_SCRIPT_NAME = "replay.py"


def _artifact_dir() -> str:
    return os.path.dirname(os.path.abspath(__file__))


def _load_json(path: str) -> Any:
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def deserialize_value(data: Any, inputs_dir: str) -> Any:
    if data is None:
        return None
    if isinstance(data, dict) and data.get("__type__") == "file":
        return os.path.join(inputs_dir, data["saved_as"])
    if isinstance(data, dict) and data.get("__type__") == "text_file":
        with open(os.path.join(inputs_dir, data["saved_as"]), "r", encoding="utf-8") as f:
            return f.read()
    if isinstance(data, dict) and data.get("__type__") == "repr":
        return data.get("value")
    if isinstance(data, list):
        return [deserialize_value(item, inputs_dir) for item in data]
    if isinstance(data, dict):
        return {key: deserialize_value(value, inputs_dir) for key, value in data.items()}
    return data


def _ensure_repo_importable(manifest: dict) -> None:
    """Put the recorded repository root on ``sys.path``.

    Copied metric modules import ``desktop_env.evaluators.metrics`` for shared
    helpers, so replay cannot load them without an importable ``desktop_env``.
    ``OSWORLD_REPO_ROOT`` overrides the path recorded at save time, which is
    what you need after moving artifacts to another machine.
    """
    for root in (os.environ.get("OSWORLD_REPO_ROOT"), manifest.get("repo_root")):
        if not root or not os.path.isdir(os.path.join(root, "desktop_env")):
            continue
        if root not in sys.path:
            sys.path.insert(0, root)
        return


def _load_metric_from_snapshot(module_path: str, func_name: str):
    spec = importlib.util.spec_from_file_location(f"replay_metric_{func_name}", module_path)
    if spec is None or spec.loader is None:
        raise ImportError(f"Could not import metric module: {module_path}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return getattr(module, func_name)


def _load_metric_from_package(func_name: str):
    try:
        package = importlib.import_module("desktop_env.evaluators.metrics")
    except ImportError as exc:
        raise ImportError(
            f"{exc}. Point OSWORLD_REPO_ROOT at a mini-osworld checkout so the "
            "saved metric can be resolved."
        ) from exc
    return getattr(package, func_name)


def _load_metric(code_dir: str, code_file: str, func_name: str):
    """Prefer the saved snapshot; fall back to the installed metrics package.

    Snapshots of package-internal modules use relative imports, which cannot be
    executed as a standalone file, so those replay against the checkout that
    ``_ensure_repo_importable`` put on ``sys.path``.
    """
    module_path = os.path.join(code_dir, code_file)
    metric = None
    if os.path.isfile(module_path):
        try:
            metric = _load_metric_from_snapshot(module_path, func_name)
        except (ImportError, AttributeError) as exc:
            print(
                f"note: snapshot {code_file} needs its package context ({exc}); "
                "replaying against the desktop_env checkout instead",
                file=sys.stderr,
            )
    if metric is None:
        metric = _load_metric_from_package(func_name)
    if not callable(metric):
        raise TypeError(f"{func_name} is not callable")
    return metric


def _combine_scores(scores: list[float], conj: str) -> float:
    if not scores:
        return 0.0
    if conj == "or":
        return float(max(scores))
    return float(sum(scores) / len(scores))


def write_replay_script(artifact_dir: str) -> str:
    """Copy this dependency-free module into an artifact directory."""
    replay_path = os.path.join(artifact_dir, REPLAY_SCRIPT_NAME)
    shutil.copy2(__file__, replay_path)
    os.chmod(replay_path, 0o755)
    return replay_path


def main() -> int:
    artifact_dir = _artifact_dir()
    manifest = _load_json(os.path.join(artifact_dir, "manifest.json"))
    config = _load_json(os.path.join(artifact_dir, "config.json"))
    conj = config.get("conj", manifest.get("conj", "and"))
    _ensure_repo_importable(manifest)

    if config.get("func") == "infeasible":
        print("Task uses infeasible evaluator; replay is not applicable.")
        print(f"Saved score: {manifest.get('score')}")
        return 0

    metrics_root = os.path.join(artifact_dir, "metrics")
    code_dir = os.path.join(artifact_dir, "code")
    metric_dirs = sorted(
        [
            os.path.join(metrics_root, name)
            for name in os.listdir(metrics_root)
            if os.path.isdir(os.path.join(metrics_root, name))
        ],
        key=lambda path: int(os.path.basename(path)),
    )

    scores: list[float] = []
    for metric_dir in metric_dirs:
        func_name = open(
            os.path.join(metric_dir, "func.txt"), encoding="utf-8"
        ).read().strip()
        code_file = open(
            os.path.join(metric_dir, "code_file.txt"), encoding="utf-8"
        ).read().strip()
        options = _load_json(os.path.join(metric_dir, "options.json"))
        inputs_dir = os.path.join(metric_dir, "inputs")
        result_state = deserialize_value(
            _load_json(os.path.join(inputs_dir, "result.json")), inputs_dir
        )
        expected_path = os.path.join(inputs_dir, "expected.json")
        expected_state = None
        if os.path.isfile(expected_path):
            expected_state = deserialize_value(_load_json(expected_path), inputs_dir)

        metric = _load_metric(code_dir, code_file, func_name)
        positional = [
            param
            for param in inspect.signature(metric).parameters.values()
            if param.kind in (
                inspect.Parameter.POSITIONAL_ONLY,
                inspect.Parameter.POSITIONAL_OR_KEYWORD,
            )
        ]
        if len(positional) >= 2:
            metric_score = float(metric(result_state, expected_state, **options))
        else:
            metric_score = float(metric(result_state, **options))
        scores.append(metric_score)
        print(f"metric {os.path.basename(metric_dir)} ({func_name}): {metric_score}")

    replay_score = _combine_scores(scores, conj)
    saved_score = float(manifest.get("score", 0.0))
    print(f"Replay score: {replay_score}")
    print(f"Saved score:  {saved_score}")
    if abs(replay_score - saved_score) > 1e-9:
        print("WARNING: replay score differs from saved score", file=sys.stderr)
        return 1
    print("Replay matches saved score.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
