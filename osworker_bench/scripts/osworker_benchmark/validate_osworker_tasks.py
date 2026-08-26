#!/usr/bin/env python3
"""Helpers invoked by start_osworker_benchmark_test.sh.

Commands:
  validate <task_root> <meta_path> <cache_dir>
  missing <result_dir> <meta_path> <retry_meta_path> <missing_tasks_path>
"""
from __future__ import annotations

import json
import sys
from pathlib import Path


def validate(task_root: Path, meta_path: Path, cache_dir: Path) -> None:
    meta = json.load(meta_path.open(encoding="utf-8"))
    if not isinstance(meta, dict):
        raise SystemExit(f"Benchmark meta must be a domain -> task ids mapping: {meta_path}")

    missing_configs, missing_cache, count = [], [], 0
    for domain, task_ids in meta.items():
        for task_id in task_ids:
            count += 1
            legacy = task_root / "examples" / domain / f"{task_id}.json"
            directory = task_root / "examples" / domain / task_id / "task.json"
            if not legacy.is_file() and not directory.is_file():
                missing_configs.append(f"{domain}/{task_id}")
            if not (cache_dir / task_id).is_dir():
                missing_cache.append(task_id)
    if missing_configs:
        raise SystemExit(f"Missing task configs ({len(missing_configs)}): {missing_configs}")
    if missing_cache:
        raise SystemExit(f"Missing task cache dirs ({len(missing_cache)}): {missing_cache}")
    print(f"Validated {count} tasks across {len(meta)} domains")


def write_missing(
    result_dir: Path,
    meta_path: Path,
    retry_meta_path: Path,
    missing_tasks_path: Path,
) -> None:
    source_meta = json.load(meta_path.open(encoding="utf-8"))
    missing_by_domain = {}
    missing_flat = []
    for domain, task_ids in source_meta.items():
        missing = [
            task_id
            for task_id in task_ids
            if not list(result_dir.glob(f"**/{domain}/{task_id}/result.txt"))
        ]
        if missing:
            missing_by_domain[domain] = missing
            missing_flat.extend(f"{domain}/{task_id}" for task_id in missing)
    missing_tasks_path.write_text("".join(f"{t}\n" for t in missing_flat), encoding="utf-8")
    retry_meta_path.write_text(
        json.dumps(missing_by_domain, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    print(len(missing_flat))


def main(argv: list[str]) -> None:
    if len(argv) < 2:
        raise SystemExit(f"Usage: {Path(__file__).name} validate|missing ...")
    cmd, args = argv[1], argv[2:]
    if cmd == "validate":
        if len(args) != 3:
            raise SystemExit("validate requires <task_root> <meta_path> <cache_dir>")
        validate(Path(args[0]).resolve(), Path(args[1]).resolve(), Path(args[2]).resolve())
        return
    if cmd == "missing":
        if len(args) != 4:
            raise SystemExit(
                "missing requires <result_dir> <meta_path> <retry_meta_path> <missing_tasks_path>"
            )
        write_missing(
            Path(args[0]).resolve(),
            Path(args[1]).resolve(),
            Path(args[2]),
            Path(args[3]),
        )
        return
    raise SystemExit(f"Unknown command: {cmd}")


if __name__ == "__main__":
    main(sys.argv)
