#!/usr/bin/env python3
"""
Generate a cache manifest (path -> MD5) as ground truth for verifying cache
after unpacking. No need to keep a full gold cache; only the manifest is stored.

Run after cache is filled (e.g. by prepare_cache). The manifest can be
versioned or distributed; use verify_cache.py to check a cache dir against it.

Usage:
  python scripts/generate_cache_manifest.py --config evaluation_examples/test_nogdrive.json \\
      --examples-dir evaluation_examples --cache-dir ./cache --manifest-out cache_manifest.json
"""

import argparse
import hashlib
import json
import logging
import os
import sys
from typing import Dict, List, Tuple

# Allow importing from scripts when run from repo root
_SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
_ROOT = os.path.dirname(_SCRIPT_DIR)
if _ROOT not in sys.path:
    sys.path.insert(0, _ROOT)

from scripts.cache_common import collect_all_downloads

logger = logging.getLogger("generate_cache_manifest")

CHUNK_SIZE = 65536


def file_hash(path: str, alg: str) -> str:
    """Compute hash of file; return hex digest. alg is 'md5' or 'sha256'."""
    h = hashlib.md5() if alg == "md5" else hashlib.sha256()
    with open(path, "rb") as f:
        while True:
            chunk = f.read(CHUNK_SIZE)
            if not chunk:
                break
            h.update(chunk)
    return h.hexdigest()


def generate_manifest(
    config_path: str,
    examples_dir: str,
    cache_dir: str,
    manifest_out: str,
    alg: str = "md5",
) -> int:
    """
    Collect required cache paths from config/tasks; for each existing file
    compute hash and write manifest. Returns 0 if all expected files were
    present and manifest written, 1 if some were missing (manifest still
    written for present files; verify will fail for missing).
    """
    items = collect_all_downloads(config_path, examples_dir, cache_dir)
    manifest: Dict[str, str] = {}
    missing: List[str] = []
    cache_dir_abs = os.path.abspath(cache_dir)

    for _url, cache_path in items:
        if not os.path.isfile(cache_path):
            rel = os.path.relpath(cache_path, cache_dir_abs).replace("\\", "/")
            missing.append(rel)
            continue
        rel = os.path.relpath(cache_path, cache_dir_abs).replace("\\", "/")
        digest = file_hash(cache_path, alg)
        manifest[rel] = digest

    out_data = {
        "alg": alg,
        "config": os.path.basename(config_path),
        "files": manifest,
    }
    os.makedirs(os.path.dirname(manifest_out) or ".", exist_ok=True)
    with open(manifest_out, "w", encoding="utf-8") as f:
        json.dump(out_data, f, indent=2, ensure_ascii=False)
    logger.info("Wrote manifest with %d entries to %s", len(manifest), manifest_out)
    if missing:
        logger.warning("Missing %d file(s) in cache (not in manifest):", len(missing))
        for m in missing[:20]:
            logger.warning("  %s", m)
        if len(missing) > 20:
            logger.warning("  ... and %d more", len(missing) - 20)
        return 1
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Generate cache manifest (path -> MD5) for later verification.",
    )
    parser.add_argument("--config", required=True, help="Config JSON (e.g. evaluation_examples/test_nogdrive.json)")
    parser.add_argument("--examples-dir", default="evaluation_examples", help="Evaluation examples root")
    parser.add_argument("--cache-dir", default="cache", help="Cache directory to hash")
    parser.add_argument("--manifest-out", default="evaluation_examples/cache_manifest.json", help="Output manifest path")
    parser.add_argument("--alg", default="md5", choices=("md5", "sha256"), help="Hash algorithm (default: md5)")
    parser.add_argument("-v", "--verbose", action="store_true", help="Verbose logging")
    args = parser.parse_args()

    logging.basicConfig(
        level=logging.DEBUG if args.verbose else logging.INFO,
        format="%(levelname)s: %(message)s",
    )

    if not os.path.isfile(args.config):
        logger.error("Config file not found: %s", args.config)
        return 1
    if not os.path.isdir(args.cache_dir):
        logger.error("Cache directory not found: %s", args.cache_dir)
        return 1

    return generate_manifest(
        args.config,
        args.examples_dir,
        args.cache_dir,
        args.manifest_out,
        args.alg,
    )


if __name__ == "__main__":
    sys.exit(main())
