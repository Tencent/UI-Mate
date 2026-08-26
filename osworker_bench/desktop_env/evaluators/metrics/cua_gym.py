"""Metric for CUA-Gym tasks.

Reads the stdout captured from VM-side ``reward.py`` execution (written
by ``SetupController._execute_setup`` to ``env.eval_cache_dir`` when the
postconfig step provides a ``stdout`` field), and returns the float
score parsed from the last ``REWARD: <float>`` line.

Additionally parses per-module component results from the stdout and
writes a ``_cua_reward_components.json`` sidecar next to the stdout file.
This is purely additive: component parsing/writing is best-effort and
never changes the aggregate score.

Standard mini-osworld evaluator pattern — no special pipeline needed:

    "evaluator": {
        "func": "cua_gym_reward",
        "result": {"type": "cache_file", "path": "_cua_reward_stdout.txt"},
        "postconfig": [
            {"type": "execute",
             "parameters": {
                 "command": ["python3", "/home/user/_cua_reward.py"],
                 "stdout": "_cua_reward_stdout.txt",
                 "stderr": "_cua_reward_stderr.txt"
             }}
        ]
    }
"""
from __future__ import annotations

import json
import logging
import os
import re
from typing import Any, Dict, List, Optional

logger = logging.getLogger("desktopenv.metric.cua_gym")

_REWARD_RE = re.compile(r"REWARD\s*:\s*([0-9]*\.?[0-9]+)")
_COMPONENT_RE = re.compile(r"^COMPONENT\s*:\s*(\{.*\})\s*$", re.MULTILINE)
_PASS_FAIL_RE = re.compile(
    r"^(?P<status>PASS|FAIL)\s*:\s*"
    r"(?:Component\s+(?P<cid>\d+)\s*[—\-:]\s*)?"
    r"(?P<name>.+?)"
    # reward.py writes the per-component award as "(+0.15)", so the sign is
    # optional here; without it the weight leaks into the component name and
    # every component reports a 0.0 score.
    r"(?:\s*\(\s*(?P<weight>[+-]?[0-9]*\.?[0-9]+)\s*(?:pts?)?\))?\s*$",
    re.MULTILINE,
)
_COMPONENTS_SIDECAR = "_cua_reward_components.json"


def _parse_structured(content: str) -> List[Dict[str, Any]]:
    """Parse ``COMPONENT: {json}`` lines emitted by newer reward scripts."""
    components: List[Dict[str, Any]] = []
    for raw in _COMPONENT_RE.findall(content):
        try:
            obj = json.loads(raw)
        except (json.JSONDecodeError, ValueError):
            continue
        if not isinstance(obj, dict):
            continue
        components.append({
            "id": obj.get("id"),
            "name": obj.get("name", ""),
            "weight": obj.get("weight"),
            "passed": bool(obj.get("passed", False)),
            "score": float(obj.get("score", 0.0) or 0.0),
            "detail": obj.get("detail", ""),
            "description": obj.get("description", ""),
        })
    return components


def _parse_fallback(content: str) -> List[Dict[str, Any]]:
    """Best-effort parse for legacy stdout containing only PASS/FAIL lines."""
    components: List[Dict[str, Any]] = []
    for match in _PASS_FAIL_RE.finditer(content):
        status = match.group("status")
        cid_raw = match.group("cid")
        weight_raw = match.group("weight")

        try:
            cid = int(cid_raw) if cid_raw is not None else None
        except ValueError:
            cid = None
        try:
            weight = float(weight_raw) if weight_raw is not None else None
        except ValueError:
            weight = None

        passed = status == "PASS"
        components.append({
            "id": cid,
            "name": (match.group("name") or "").strip(),
            "weight": weight,
            "passed": passed,
            "score": (weight or 0.0) if passed else 0.0,
            "detail": "",
        })
    return components


def _build_components_payload(content: str) -> Optional[Dict[str, Any]]:
    components = _parse_structured(content)
    source = "structured" if components else "none"
    if not components:
        components = _parse_fallback(content)
        if components:
            source = "fallback_regex"
    if not components:
        return None

    total_weight = sum((component.get("weight") or 0.0) for component in components)
    return {
        "components": components,
        "source": source,
        "total_weight": round(total_weight, 4),
    }


def _write_components_sidecar(stdout_path: str, payload: Dict[str, Any]) -> None:
    try:
        sidecar_path = os.path.join(os.path.dirname(stdout_path), _COMPONENTS_SIDECAR)
        with open(sidecar_path, "w", encoding="utf-8") as f:
            json.dump(payload, f, indent=2, ensure_ascii=False)
    except Exception as exc:  # noqa: BLE001 - sidecar must not affect scoring
        logger.warning("[cua_gym_reward] failed to write components sidecar: %s", exc)


def ensure_components_sidecar(stdout_path: Optional[str]) -> Optional[Dict[str, Any]]:
    """Ensure ``_cua_reward_components.json`` exists when stdout is parseable.

    This helper is used by ``DesktopEnv.evaluate()`` before early returns,
    e.g. when the agent chose FAIL and metric execution is skipped after
    postconfig captured reward.py stdout.
    """
    if not stdout_path:
        return None

    sidecar_path = os.path.join(os.path.dirname(stdout_path), _COMPONENTS_SIDECAR)
    try:
        with open(sidecar_path, "r", encoding="utf-8") as f:
            existing = json.load(f)
        if isinstance(existing, dict) and existing.get("components"):
            return existing
    except (FileNotFoundError, OSError, json.JSONDecodeError, ValueError):
        pass

    try:
        with open(stdout_path, "r", encoding="utf-8", errors="replace") as f:
            content = f.read()
    except (FileNotFoundError, OSError):
        return None

    payload = _build_components_payload(content)
    if payload is None:
        return None
    _write_components_sidecar(stdout_path, payload)
    return payload


def cua_gym_reward(stdout_path: Optional[str], **_: Any) -> float:
    """Parse the last ``REWARD: <float>`` line from the captured stdout.

    Args:
        stdout_path: Local host path returned by ``get_cache_file``.
            ``None`` means the file was not retrievable.

    Returns:
        Float score in [0.0, 1.0]. ``0.0`` on any error (missing file,
        no REWARD line, malformed score).
    """
    if not stdout_path:
        logger.warning("[cua_gym_reward] stdout path is None")
        return 0.0

    try:
        with open(stdout_path, "r", encoding="utf-8", errors="replace") as f:
            content = f.read()
    except (FileNotFoundError, OSError) as e:
        logger.warning("[cua_gym_reward] cannot open %s: %s", stdout_path, e)
        return 0.0

    try:
        payload = _build_components_payload(content)
        if payload is not None:
            _write_components_sidecar(stdout_path, payload)
    except Exception as exc:  # noqa: BLE001 - component parsing is additive
        logger.warning("[cua_gym_reward] component parsing failed: %s", exc)

    matches = _REWARD_RE.findall(content)
    if not matches:
        # Truncate to keep logs readable
        tail = content[-512:] if content else "(empty)"
        logger.warning("[cua_gym_reward] no REWARD line; stdout tail:\n%s", tail)
        return 0.0

    # reward.py conventionally prints REWARD as its final action; take
    # the LAST match so earlier debug REWARD lines can't corrupt scoring.
    try:
        score = float(matches[-1])
    except ValueError:
        logger.warning("[cua_gym_reward] non-numeric score: %r", matches[-1])
        return 0.0

    return max(0.0, min(1.0, score))
