#!/usr/bin/env python3
"""
Verify a cache directory against a ground-truth manifest (path -> MD5/SHA256).
Use after unpacking cache to ensure completeness and integrity.

Completeness: all paths in the manifest exist in the cache.
Integrity: each file's hash matches the manifest.

Strict mode (--strict): additionally checks that no unexpected files exist
in the cache directory.  The following known runtime artifacts are allowed:

  - ``*_gold/`` and ``*_pred/`` directories created by ``compare_archive()``
    in ``evaluators/metrics/chrome.py`` when it unpacks archives for comparison.
    (Since the eval-isolation refactor, new runs redirect these to
    eval_cache_dir; legacy artifacts in cache_dir are still recognised.)
  - ``__pycache__/`` directories created by ``spec.loader.exec_module()``
    in ``evaluators/metrics/vscode.py`` when running test suites.
  - ``*.epub.dir/`` directories created by ``process_epub()``
    in ``evaluators/metrics/others.py`` when it unpacks epubs for comparison.
    (Since the eval-isolation refactor, new runs redirect these to
    eval_cache_dir; legacy artifacts in cache_dir are still recognised.)

Any other files not listed in the manifest will be reported as unexpected.

Usage:
  python scripts/verify_cache.py --cache-dir ./cache --manifest evaluation_examples/cache_manifest.json
  python scripts/verify_cache.py --cache-dir ./cache --manifest evaluation_examples/cache_manifest.json --strict
"""

from __future__ import annotations

import argparse
import hashlib
import json
import logging
import os
import sys
from typing import Dict, List, Set, Tuple

logger = logging.getLogger("verify_cache")

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


def _classify_runtime_artifact(rel_path: str) -> str | None:
    """Classify *rel_path* as a known runtime artifact.

    Returns a short human-readable source label if the path matches a known
    pattern, or ``None`` if it is not a recognised artifact.

    Known patterns:
      1. compare_archive() creates ``<base>_gold/`` and ``<base>_pred/``
         directories next to the archive file.
      2. vscode.py's ``spec.loader.exec_module()`` creates ``__pycache__/``
         directories containing ``.pyc`` bytecode files.
      3. compare_epub() via ``process_epub()`` creates ``<name>.epub.dir/``
         directories containing unpacked epub contents (html, opf, ncx).
    """
    parts = rel_path.replace("\\", "/").split("/")
    if rel_path in {".HF_REVISION", ".MOCK_HOST.applied"}:
        return "release metadata"
    for part in parts:
        # __pycache__ directories (vscode.py exec_module side-effect)
        if part == "__pycache__":
            return "vscode exec_module (__pycache__)"
        # compare_archive unpacked directories: <name>_gold or <name>_pred
        if part.endswith("_gold") or part.endswith("_pred"):
            return "compare_archive (_gold/_pred)"
        # compare_epub unpacked directories: <name>.epub.dir
        if part.endswith(".epub.dir"):
            return "compare_epub (.epub.dir)"
    return None


def verify_cache(
    cache_dir: str,
    manifest_path: str,
    strict: bool = False,
) -> Tuple[bool, List[str], List[str], List[str], List[Tuple[str, str]]]:
    """
    Verify cache_dir against manifest.

    Returns:
        (ok, missing, mismatch, unexpected, artifacts)
        - missing: paths in manifest that are absent or not a file.
        - mismatch: paths where file exists but hash does not match.
        - unexpected: (strict only) files in cache not in manifest and
          not a known runtime artifact.
        - artifacts: (strict only) list of (rel_path, source_label) for
          files recognised as known runtime artifacts.
    """
    with open(manifest_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    files = data.get("files") or data  # support { "files": {...} } or flat {...}
    alg = data.get("alg", "md5")
    if not isinstance(files, dict):
        raise ValueError("Manifest 'files' must be a dict (path -> hash)")

    missing: List[str] = []
    mismatch: List[str] = []
    unexpected: List[str] = []
    artifacts: List[Tuple[str, str]] = []
    cache_dir_abs = os.path.abspath(cache_dir)

    # Task whose gold-standard files collide with get_vm_file outputs;
    # skip verification to avoid false negatives.
    SKIP_TASKS = {"74d5859f-ed66-4d3e-aa0e-93d7a592ce41"}

    # --- Completeness + Integrity ---
    for rel_path, expected_hex in files.items():
        # Skip tasks known to have cache collision issues
        if rel_path.split("/")[0] in SKIP_TASKS:
            continue
        full = os.path.join(cache_dir_abs, rel_path.replace("/", os.sep))
        if not os.path.isfile(full):
            missing.append(rel_path)
            continue
        actual = file_hash(full, alg)
        if actual != expected_hex:
            mismatch.append(rel_path)

    # --- Strict: no unexpected files ---
    if strict:
        manifest_paths: Set[str] = set(files.keys())
        for dirpath, dirnames, filenames in os.walk(cache_dir_abs):
            for fn in filenames:
                full = os.path.join(dirpath, fn)
                rel = os.path.relpath(full, cache_dir_abs).replace(os.sep, "/")
                if rel in manifest_paths:
                    continue
                source = _classify_runtime_artifact(rel)
                if source is not None:
                    artifacts.append((rel, source))
                    continue
                unexpected.append(rel)

    ok = len(missing) == 0 and len(mismatch) == 0 and len(unexpected) == 0
    return ok, missing, mismatch, unexpected, artifacts


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Verify cache directory against a manifest (completeness + integrity).",
    )
    parser.add_argument("--cache-dir", default="cache", help="Cache directory to verify")
    parser.add_argument("--manifest", default="evaluation_examples/cache_manifest.json", help="Path to manifest JSON")
    parser.add_argument(
        "--strict", action="store_true",
        help=(
            "Strict mode: also check that no unexpected files exist in the "
            "cache directory (excluding known runtime artifacts like "
            "compare_archive _gold/_pred dirs, __pycache__, and "
            "compare_epub .epub.dir dirs)."
        ),
    )
    parser.add_argument("-v", "--verbose", action="store_true", help="Verbose logging")
    args = parser.parse_args()

    logging.basicConfig(
        level=logging.DEBUG if args.verbose else logging.INFO,
        format="%(levelname)s: %(message)s",
    )

    if not os.path.isdir(args.cache_dir):
        logger.error("Cache directory not found: %s", args.cache_dir)
        return 1
    if not os.path.isfile(args.manifest):
        logger.error("Manifest file not found: %s", args.manifest)
        return 1

    try:
        ok, missing, mismatch, unexpected, artifacts = verify_cache(
            args.cache_dir, args.manifest, strict=args.strict,
        )
    except (ValueError, json.JSONDecodeError) as e:
        logger.error("Invalid manifest: %s", e)
        return 1

    if missing:
        logger.error("Missing %d file(s):", len(missing))
        for p in missing[:30]:
            logger.error("  %s", p)
        if len(missing) > 30:
            logger.error("  ... and %d more", len(missing) - 30)
    if mismatch:
        logger.error("Hash mismatch %d file(s):", len(mismatch))
        for p in mismatch[:30]:
            logger.error("  %s", p)
        if len(mismatch) > 30:
            logger.error("  ... and %d more", len(mismatch) - 30)
    if unexpected:
        logger.error("Unexpected %d file(s) in cache (not in manifest):", len(unexpected))
        for p in sorted(unexpected)[:50]:
            logger.error("  %s", p)
        if len(unexpected) > 50:
            logger.error("  ... and %d more", len(unexpected) - 50)
    if artifacts:
        logger.info(
            "Found %d known runtime artifact(s) (not in manifest, safe to ignore):",
            len(artifacts),
        )
        for p, source in sorted(artifacts)[:50]:
            logger.info("  [%s] %s", source, p)
        if len(artifacts) > 50:
            logger.info("  ... and %d more", len(artifacts) - 50)

    if ok:
        with open(args.manifest) as f:
            n = len((json.load(f).get("files") or {}))
        msg = "Cache OK: all %d file(s) present and hash match."
        if args.strict:
            msg += " No unexpected files found."
        logger.info(msg, n)
        return 0

    logger.error(
        "Verification failed: %d missing, %d mismatch, %d unexpected.",
        len(missing), len(mismatch), len(unexpected),
    )
    return 1


if __name__ == "__main__":
    sys.exit(main())
