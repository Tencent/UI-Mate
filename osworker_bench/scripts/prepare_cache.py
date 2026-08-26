#!/usr/bin/env python3
"""
Prepare cache for evaluation tasks: download files required by setup (download steps)
and evaluator expected (cloud_file) into a cache directory, so that running tasks
does not need to download them again.

When the cache directory is non-empty, existing files are first verified (HEAD
request + Content-Length vs local size). Missing or corrupted files are then
(re)downloaded; already-OK files are skipped.

Usage:
  python scripts/prepare_cache.py --config evaluation_examples/test_nogdrive.json \\
      --examples-dir evaluation_examples --cache-dir ./cache
  python scripts/prepare_cache.py --config evaluation_examples/test_nogdrive.json --dry-run
"""

import argparse
import json
import logging
import os
import shutil
import sys
from typing import Any, Dict, List, Optional, Tuple

import requests
from tqdm import tqdm

# Allow importing from scripts when run from repo root
_SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
_ROOT = os.path.dirname(_SCRIPT_DIR)
if _ROOT not in sys.path:
    sys.path.insert(0, _ROOT)
from scripts.cache_common import collect_all_downloads

logger = logging.getLogger("prepare_cache")

# Match setup.py and getters/file.py
CHUNK_SIZE = 8192
DOWNLOAD_TIMEOUT = 300
MAX_RETRIES = 3
HEAD_TIMEOUT = 15


def verify_cached_file(url: str, cache_path: str) -> bool:
    """
    Verify that an existing cache file is not corrupted by comparing size with
    server Content-Length (HEAD). Returns True if file is OK, False if missing,
    corrupted (size mismatch), or unreadable.
    If the server does not support HEAD or does not send Content-Length, we
    assume the file is OK (True) to avoid unnecessary re-downloads.
    """
    if not os.path.isfile(cache_path):
        return False
    try:
        local_size = os.path.getsize(cache_path)
    except OSError:
        return False
    try:
        resp = requests.head(url, timeout=HEAD_TIMEOUT, allow_redirects=True)
        resp.raise_for_status()
        content_length = resp.headers.get("Content-Length")
        if content_length is None:
            return True  # Cannot verify, assume OK
        expected = int(content_length)
        if local_size != expected:
            logger.debug(
                "Size mismatch for %s: local %d vs expected %d",
                cache_path,
                local_size,
                expected,
            )
            return False
        return True
    except requests.RequestException:
        return True  # HEAD failed (e.g. 405), assume OK and skip re-download


def verify_cached_file_against_gold(cache_path: str, gold_path: str) -> bool:
    """
    Verify a cached file against the gold cache by comparing file sizes.
    Returns True if file exists and size matches gold, False otherwise.
    """
    if not os.path.isfile(cache_path):
        return False
    if not os.path.isfile(gold_path):
        logger.warning("Gold cache file not found: %s", gold_path)
        return False
    try:
        return os.path.getsize(cache_path) == os.path.getsize(gold_path)
    except OSError:
        return False


def filter_to_missing_or_corrupted(
    items: List[Tuple[str, str]],
    verify_existing: bool,
    gold_cache_dir: Optional[str] = None,
) -> Tuple[List[Tuple[str, str]], int]:
    """
    Split items into (to_download, already_ok).
    When gold_cache_dir is set, verify against gold files (size comparison).
    Otherwise, when verify_existing is True, verify via HEAD/size from server.
    """
    to_download: List[Tuple[str, str]] = []
    already_ok = 0
    desc = "Verifying cache" if verify_existing else "Checking cache"
    for url, cache_path in tqdm(items, desc=desc, unit="file"):
        if not os.path.exists(cache_path):
            to_download.append((url, cache_path))
            continue
        if not verify_existing:
            already_ok += 1
            continue
        if gold_cache_dir:
            gold_path = _gold_path_for(cache_path, gold_cache_dir)
            if verify_cached_file_against_gold(cache_path, gold_path):
                already_ok += 1
                continue
        elif verify_cached_file(url, cache_path):
            already_ok += 1
            continue
        logger.warning("Corrupted or size mismatch, will re-download: %s", cache_path)
        try:
            os.remove(cache_path)
        except OSError as e:
            logger.warning("Could not remove corrupted file %s: %s", cache_path, e)
        to_download.append((url, cache_path))
    return to_download, already_ok


def _gold_path_for(cache_path: str, gold_cache_dir: str) -> str:
    """
    Derive the gold cache path from a target cache_path.
    cache_path is like: {cache_dir}/{task_id}/{filename}
    gold_path should be: {gold_cache_dir}/{task_id}/{filename}
    """
    # Extract the last two path components: task_id/filename
    parts = cache_path.replace("\\", "/").split("/")
    rel = os.path.join(parts[-2], parts[-1]) if len(parts) >= 2 else parts[-1]
    return os.path.join(gold_cache_dir, rel)


def copy_from_gold(gold_path: str, cache_path: str, dry_run: bool) -> bool:
    """Copy a file from gold cache to target cache path. Return True on success."""
    if os.path.exists(cache_path):
        logger.debug("Already exists: %s", cache_path)
        return True
    if not os.path.isfile(gold_path):
        logger.error("Gold cache file not found: %s", gold_path)
        return False
    if dry_run:
        logger.info("[dry-run] would copy %s -> %s", gold_path, cache_path)
        return True
    os.makedirs(os.path.dirname(cache_path) or ".", exist_ok=True)
    try:
        shutil.copy2(gold_path, cache_path)
        logger.info("Copied: %s", cache_path)
        return True
    except OSError as e:
        logger.error("Failed to copy %s -> %s: %s", gold_path, cache_path, e)
        return False


def download_one(url: str, cache_path: str, dry_run: bool) -> bool:
    """Download url to cache_path. Return True on success (or skip), False on failure."""
    if os.path.exists(cache_path):
        logger.debug("Already exists: %s", cache_path)
        return True
    if dry_run:
        logger.info("[dry-run] would download %s -> %s", url, cache_path)
        return True
    os.makedirs(os.path.dirname(cache_path) or ".", exist_ok=True)
    last_error = None
    for attempt in range(MAX_RETRIES):
        try:
            response = requests.get(url, stream=True, timeout=DOWNLOAD_TIMEOUT)
            response.raise_for_status()
            with open(cache_path, "wb") as f:
                for chunk in response.iter_content(chunk_size=CHUNK_SIZE):
                    if chunk:
                        f.write(chunk)
            logger.info("Downloaded: %s", cache_path)
            return True
        except requests.RequestException as e:
            last_error = e
            if os.path.exists(cache_path):
                try:
                    os.remove(cache_path)
                except OSError:
                    pass
            logger.warning(
                "Attempt %d/%d failed for %s: %s",
                attempt + 1,
                MAX_RETRIES,
                url,
                e,
            )
    logger.error("Failed to download %s after %d attempts: %s", url, MAX_RETRIES, last_error)
    return False


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Pre-download files for evaluation tasks (setup download + evaluator cloud_file) into cache.",
    )
    parser.add_argument(
        "--config",
        required=True,
        help="Path to config JSON (e.g. evaluation_examples/test_nogdrive.json)",
    )
    parser.add_argument(
        "--examples-dir",
        default="evaluation_examples",
        help="Root directory for evaluation examples (default: evaluation_examples)",
    )
    parser.add_argument(
        "--cache-dir",
        default="cache",
        help="Cache directory (default: cache)",
    )
    parser.add_argument(
        "--gold-cache-dir",
        default=None,
        help="Gold cache directory. When set, copy files from gold cache instead of downloading from network.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Only print what would be downloaded, do not write files",
    )
    parser.add_argument(
        "-v",
        "--verbose",
        action="store_true",
        help="Verbose logging",
    )
    args = parser.parse_args()

    logging.basicConfig(
        level=logging.DEBUG if args.verbose else logging.INFO,
        format="%(levelname)s: %(message)s",
    )

    if not os.path.isfile(args.config):
        logger.error("Config file not found: %s", args.config)
        return 1

    if args.gold_cache_dir and not os.path.isdir(args.gold_cache_dir):
        logger.error("Gold cache directory not found: %s", args.gold_cache_dir)
        return 1

    items = collect_all_downloads(args.config, args.examples_dir, args.cache_dir)
    logger.info("Collected %d unique file(s) in total", len(items))

    # When cache dir is non-empty (has subdirectories with files), verify
    # existing files; then download/copy only missing or corrupted ones.
    try:
        verify_existing = os.path.isdir(args.cache_dir) and any(
            os.path.isfile(os.path.join(args.cache_dir, d, f))
            for d in os.listdir(args.cache_dir)
            if os.path.isdir(os.path.join(args.cache_dir, d))
            for f in os.listdir(os.path.join(args.cache_dir, d))
        )
    except OSError:
        verify_existing = False
    to_download, already_ok = filter_to_missing_or_corrupted(
        items, verify_existing=verify_existing, gold_cache_dir=args.gold_cache_dir,
    )
    action = "copy" if args.gold_cache_dir else "download"
    logger.info(
        "Already present and OK: %d, to %s (missing or corrupted): %d",
        already_ok,
        action,
        len(to_download),
    )

    failed: List[Tuple[str, str]] = []
    pbar = tqdm(to_download, desc="Copying" if args.gold_cache_dir else "Downloading", unit="file")
    for url, cache_path in pbar:
        pbar.set_postfix_str(os.path.basename(cache_path), refresh=True)
        if args.gold_cache_dir:
            gold_path = _gold_path_for(cache_path, args.gold_cache_dir)
            if not copy_from_gold(gold_path, cache_path, args.dry_run):
                failed.append((url, cache_path))
        else:
            if not download_one(url, cache_path, args.dry_run):
                failed.append((url, cache_path))

    if failed:
        logger.error("Failed %d download(s):", len(failed))
        for url, cache_path in failed:
            logger.error("  %s -> %s", url, cache_path)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
