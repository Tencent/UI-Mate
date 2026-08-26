"""Host-side Python evaluation getter.

This getter lets task evaluators ship a Python script that runs on the
HOST (not the VM), with one or more files pulled from the VM injected via
environment variables.  This avoids installing Python libraries (such as
``python-pptx`` or ``python-docx``) inside the VM when the host already
has them.

Task JSON shape::

    "evaluator": {
        "result": {
            "type": "host_python_eval",
            "files": [
                {"path": "/home/user/Desktop/x.pptx",
                 "dest": "result.pptx", "var": "RESULT_FILE"},
                {"path": "/tmp/gold/x_gold.pptx",
                 "dest": "gold.pptx",   "var": "GOLD_FILE"}
            ],
            "script": "from pptx import Presentation\\n...\\nprint('PASS')",
            "timeout": 60
        },
        "expected": {"type": "rule", "rules": {"include": ["PASS"], "exclude": ["FAIL"]}},
        "func": "check_include_exclude"
    }

The getter:
  1. pulls each file from the VM (via ``env.controller.get_file``) into
     ``env.eval_cache_dir`` under the given ``dest`` filename
  2. spawns ``python3 -c <script>`` on the host with each ``var`` env-var
     set to the corresponding cached path
  3. returns the script's stdout so that downstream metrics (typically
     ``check_include_exclude``) can match against it

Errors during fetch or script execution are surfaced as stderr-prefixed
strings in the returned text, which the include/exclude rules can be
written to detect.
"""
from __future__ import annotations

import logging
import os
import subprocess
import sys
from typing import Any, Dict, List, Optional

logger = logging.getLogger("desktopenv.getters.host_eval")


def _fetch_vm_files(env, files: List[Dict[str, str]]) -> Dict[str, str]:
    """Pull each file from the VM into env.eval_cache_dir.  Returns a map
    of var-name -> absolute host path."""
    host_paths: Dict[str, str] = {}
    cache_dir = env.eval_cache_dir
    os.makedirs(cache_dir, exist_ok=True)

    for entry in files:
        # Accept both ``path`` (documented) and ``vm_path`` (used by an early
        # prototype converter).  We don't fall back silently — log a warning
        # if the legacy key is hit so the task JSON can be migrated.
        vm_path = entry.get("path") or entry.get("vm_path")
        if not vm_path:
            logger.error("host_python_eval: file entry missing 'path' (or "
                         "legacy 'vm_path'); entry=%r", entry)
            continue
        if "vm_path" in entry and "path" not in entry:
            logger.warning("host_python_eval: file entry uses legacy "
                           "'vm_path' key; please migrate to 'path'. entry=%r",
                           entry)
        dest = entry.get("dest") or os.path.basename(vm_path)
        var = entry.get("var") or os.path.splitext(os.path.basename(dest))[0].upper()
        local_path = os.path.join(cache_dir, dest)

        try:
            blob = env.controller.get_file(vm_path)
        except Exception as e:
            logger.error("host_python_eval: VM fetch failed for %s: %s", vm_path, e)
            host_paths[var] = ""
            continue

        if blob is None:
            logger.warning("host_python_eval: VM file missing: %s", vm_path)
            host_paths[var] = ""
            continue

        with open(local_path, "wb") as f:
            f.write(blob)
        host_paths[var] = local_path

    return host_paths


def get_host_python_eval(env, config: Dict[str, Any]) -> Optional[str]:
    """Run a host-side Python script with VM files pulled to host.

    Returns the script's stdout as a string (so it can be consumed by
    ``check_include_exclude`` or similar text metrics).  Returns ``None``
    only on catastrophic input-shape failures.
    """
    files = config.get("files") or []
    script = config.get("script")
    timeout = int(config.get("timeout", 60))
    extra_env = config.get("env") or {}

    if not isinstance(script, str) or not script.strip():
        logger.error("host_python_eval: config.script missing or empty")
        return None
    if not isinstance(files, list):
        logger.error("host_python_eval: config.files must be a list")
        return None

    host_paths = _fetch_vm_files(env, files)

    # Build subprocess env.  Start from a clean PATH-preserving copy.
    env_vars = os.environ.copy()
    env_vars.update({k: str(v) for k, v in extra_env.items()})
    for var, path in host_paths.items():
        env_vars[var] = path

    # If any required file failed to fetch, emit a deterministic banner so
    # the include/exclude rules can detect it (and avoid false-positive PASS).
    missing = [v for v, p in host_paths.items() if not p]
    if missing:
        banner = "FAIL:vm_file_missing:" + ",".join(missing)
        logger.warning("host_python_eval: %s", banner)
        return banner

    try:
        proc = subprocess.run(
            [sys.executable, "-c", script],
            env=env_vars,
            capture_output=True,
            text=True,
            timeout=timeout,
        )
    except subprocess.TimeoutExpired:
        logger.error("host_python_eval: script timed out after %ds", timeout)
        return f"FAIL:host_script_timeout:{timeout}s"
    except Exception as e:
        logger.error("host_python_eval: subprocess error: %s", e)
        return f"FAIL:host_script_subprocess_error:{e}"

    stdout = proc.stdout or ""
    if proc.returncode != 0:
        # Surface stderr tail so it can also be matched as FAIL.
        stderr_tail = (proc.stderr or "").strip().splitlines()[-5:]
        stdout = (
            stdout.rstrip()
            + f"\nFAIL:host_script_nonzero_exit:{proc.returncode}\n"
            + "\n".join(stderr_tail)
        )
    return stdout
