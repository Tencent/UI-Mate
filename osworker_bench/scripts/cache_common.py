"""
Shared logic for collecting required cache file paths from config and task JSONs.
Used by prepare_cache, generate_cache_manifest, and verify_cache.
"""

import json
import logging
import os
import uuid
from typing import Any, Dict, List, Tuple

logger = logging.getLogger("cache_common")


def load_config(config_path: str) -> Dict[str, List[str]]:
    """Load config JSON: { domain: [task_id, ...], ... }."""
    with open(config_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    if not isinstance(data, dict):
        raise ValueError(f"Config must be a dict (domain -> list of task ids), got {type(data)}")
    return data


def task_json_path(examples_dir: str, domain: str, task_id: str) -> str:
    """Path to task JSON: {examples_dir}/examples/{domain}/{task_id}.json"""
    return os.path.join(examples_dir, "examples", domain, f"{task_id}.json")


def collect_from_setup_download(config_list: List[Dict[str, Any]], cache_dir: str) -> List[Tuple[str, str]]:
    """
    From task config (list of setup steps), collect (url, cache_path) for type=="download".
    Cache path must match setup.py _download_setup: cache_dir / "{uuid5(url)}_{basename(path)}".
    """
    out: List[Tuple[str, str]] = []
    for item in config_list or []:
        if item.get("type") != "download":
            continue
        params = item.get("parameters") or {}
        files = params.get("files") or []
        for f in files:
            url = f.get("url") or ""
            path = f.get("path") or ""
            if not url or not path:
                logger.warning("Setup download entry missing url or path: %s", f)
                continue
            name = "{:}_{:}".format(uuid.uuid5(uuid.NAMESPACE_URL, url), os.path.basename(path))
            cache_path = os.path.join(cache_dir, name)
            out.append((url, cache_path))
    return out


def _collect_cloud_file_one(cache_dir: str, path: Any, dest: Any, multi: bool) -> List[Tuple[str, str]]:
    """Collect (url, cache_path) for one cloud_file expected (single or multi)."""
    out: List[Tuple[str, str]] = []
    if not multi:
        path = [path] if isinstance(path, str) else []
        dest = [dest] if isinstance(dest, str) else []
    else:
        path = path if isinstance(path, list) else []
        dest = dest if isinstance(dest, list) else []
    for p, d in zip(path, dest):
        if isinstance(p, str) and isinstance(d, str) and p and d:
            out.append((p, os.path.join(cache_dir, d)))
    return out


def collect_from_update_browse_history(config_list: List[Dict[str, Any]], cache_dir: str) -> List[Tuple[str, str]]:
    """
    From task config (list of setup steps), collect (url, cache_path) for type=="update_browse_history".
    This setup type has a hardcoded download in setup.py _update_browse_history_setup:
      URL  -> huggingface history_empty.sqlite
      dest -> cache_dir / "history_new.sqlite"
    """
    out: List[Tuple[str, str]] = []
    for item in config_list or []:
        if item.get("type") != "update_browse_history":
            continue
        url = (
            "https://huggingface.co/datasets/xlangai/ubuntu_osworld_file_cache/resolve/main/"
            "chrome/44ee5668-ecd5-4366-a6ce-c1c9b8d4e938/history_empty.sqlite?download=true"
        )
        cache_path = os.path.join(cache_dir, "history_new.sqlite")
        out.append((url, cache_path))
    return out


def collect_from_expected(expected: Any, cache_dir: str) -> List[Tuple[str, str]]:
    """
    From evaluator.expected (dict or list), collect (url, cache_path) for type=="cloud_file".
    Cache path must match get_cloud_file: cache_dir / dest. Handles multi=True (path/dest lists).
    """
    out: List[Tuple[str, str]] = []
    if isinstance(expected, dict):
        if expected.get("type") == "cloud_file":
            multi = expected.get("multi", False)
            if isinstance(multi, str):
                multi = multi.lower() == "true"
            path = expected.get("path")
            dest = expected.get("dest")
            out.extend(_collect_cloud_file_one(cache_dir, path, dest, multi))
            if not out and (path or dest):
                logger.warning("Expected cloud_file path/dest invalid or empty: %s", expected)
        return out
    if isinstance(expected, list):
        for exp in expected:
            out.extend(collect_from_expected(exp, cache_dir))
        return out
    return out


def collect_all_downloads(
    config_path: str,
    examples_dir: str,
    cache_dir: str,
) -> List[Tuple[str, str]]:
    """
    Load config, resolve all task JSONs, collect (url, cache_path) from setup download,
    setup update_browse_history (hardcoded URL), evaluator postconfig download,
    and evaluator expected cloud_file.
    Deduplicate by cache_path (first occurrence wins).
    """
    meta = load_config(config_path)
    by_path: Dict[str, str] = {}  # cache_path -> url

    for domain, task_ids in meta.items():
        if not isinstance(task_ids, list):
            logger.warning("Config domain %r value is not a list, skipping", domain)
            continue
        for task_id in task_ids:
            path = task_json_path(examples_dir, domain, task_id)
            if not os.path.isfile(path):
                logger.warning("Task JSON not found: %s", path)
                continue
            try:
                with open(path, "r", encoding="utf-8") as f:
                    task = json.load(f)
            except Exception as e:
                logger.warning("Failed to load %s: %s", path, e)
                continue

            task_cache_dir = os.path.join(cache_dir, task_id)

            for url, cache_path in collect_from_setup_download(task.get("config"), task_cache_dir):
                if cache_path not in by_path:
                    by_path[cache_path] = url

            for url, cache_path in collect_from_update_browse_history(task.get("config"), task_cache_dir):
                if cache_path not in by_path:
                    by_path[cache_path] = url

            evaluator = task.get("evaluator") or {}
            for url, cache_path in collect_from_setup_download(evaluator.get("postconfig"), task_cache_dir):
                if cache_path not in by_path:
                    by_path[cache_path] = url

            expected = evaluator.get("expected")
            if expected is not None:
                for url, cache_path in collect_from_expected(expected, task_cache_dir):
                    if cache_path not in by_path:
                        by_path[cache_path] = url

            # Also collect cloud_file entries from evaluator.result.
            # At runtime, get_cloud_file() downloads these into cache_dir
            # (see getters/file.py), so they must be pre-cached as well.
            result = evaluator.get("result")
            if result is not None:
                for url, cache_path in collect_from_expected(result, task_cache_dir):
                    if cache_path not in by_path:
                        by_path[cache_path] = url

    return [(url, cache_path) for cache_path, url in by_path.items()]
