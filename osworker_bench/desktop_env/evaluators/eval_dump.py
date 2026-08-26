"""Persistent dump of evaluator inputs for offline re-grading.

After ``DesktopEnv.evaluate()`` resolves ``(func, options, result_state,
expected_state)`` for each metric, this module writes the tuple to
``<eval_result_dir>/cache/_eval_dump/`` so an external harness can replay
the metric without spinning up a sandbox.

Layout::

    cache/_eval_dump/
        meta.json
        call_00.json
        call_01.json   # only when evaluator.func is a list (MULTI)
        ...

``meta.json`` records the live score plus the evaluator checksum (when the
task JSON carries ``_evaluator_meta.checksum``).  Each ``call_NN.json``
records ``{func, options, has_expected, result, expected, replayable,
result_kind}``.

Serialization rules:

* JSON-native primitives (str/int/float/bool/None/dict/list) pass through.
* ``bytes`` become ``{"__b64__": <base64>}``.
* Anything else falls back to ``repr()`` and the call is marked
  ``replayable=false`` so the harness can route the task back to static
  review instead of pretending to replay garbage.
"""

from __future__ import annotations

import base64
import datetime as _dt
import json
import logging
import os
from typing import Any, Dict, List, Optional, Tuple

logger = logging.getLogger("desktopenv.eval_dump")

DUMP_DIRNAME = "_eval_dump"
META_FILENAME = "meta.json"

_JSON_PRIMITIVES = (str, int, float, bool, type(None))


def _serialize(value: Any) -> Tuple[Any, str, bool]:
    """Return ``(payload, kind, replayable)``.

    ``payload`` is JSON-safe.  ``kind`` is a short label
    (``"str"``/``"dict"``/``"path"``/``"bytes"``/``"unknown"``...).
    ``replayable`` is ``False`` when we could not faithfully encode the
    value (caller should disable replay for that metric).
    """

    if isinstance(value, _JSON_PRIMITIVES):
        if isinstance(value, str) and value and os.path.isabs(value) and os.path.exists(value):
            return value, "path", True
        return value, type(value).__name__, True

    if isinstance(value, bytes):
        return {"__b64__": base64.b64encode(value).decode("ascii")}, "bytes", True

    if isinstance(value, (list, tuple)):
        encoded: List[Any] = []
        replayable = True
        kinds: List[str] = []
        for item in value:
            payload, kind, ok = _serialize(item)
            encoded.append(payload)
            kinds.append(kind)
            replayable = replayable and ok
        return encoded, f"list[{','.join(sorted(set(kinds)))}]", replayable

    if isinstance(value, dict):
        encoded_dict: Dict[str, Any] = {}
        replayable = True
        for k, v in value.items():
            if not isinstance(k, str):
                # JSON keys must be strings; coerce and flag as lossy
                k = str(k)
                replayable = False
            payload, _, ok = _serialize(v)
            encoded_dict[k] = payload
            replayable = replayable and ok
        return encoded_dict, "dict", replayable

    # Fallback: best-effort textual representation; never replayable.
    try:
        text = repr(value)
    except Exception as exc:  # pragma: no cover - defensive
        text = f"<unrepresentable: {exc}>"
    return {"__repr__": text}, type(value).__name__, False


def _dump_dir(eval_cache_dir: str) -> str:
    path = os.path.join(eval_cache_dir, DUMP_DIRNAME)
    os.makedirs(path, exist_ok=True)
    return path


def reset_dump(eval_cache_dir: str) -> None:
    """Remove any prior dump so stale files never confuse a re-grade.

    Called once at the start of ``evaluate()`` before any metric runs.
    """

    dump_dir = os.path.join(eval_cache_dir, DUMP_DIRNAME)
    if not os.path.isdir(dump_dir):
        return
    try:
        for name in os.listdir(dump_dir):
            full = os.path.join(dump_dir, name)
            if os.path.isfile(full):
                os.remove(full)
    except OSError as exc:  # pragma: no cover - best-effort cleanup
        logger.warning("Failed to reset eval dump dir %s: %s", dump_dir, exc)


def dump_call(
    eval_cache_dir: str,
    call_idx: int,
    func_name: str,
    options: Optional[Dict[str, Any]],
    result_state: Any,
    expected_state: Any,
    has_expected: bool,
) -> None:
    """Persist the inputs for a single metric invocation."""

    if not eval_cache_dir:
        return

    try:
        dump_dir = _dump_dir(eval_cache_dir)
        result_payload, result_kind, r_ok = _serialize(result_state)
        if has_expected:
            expected_payload, expected_kind, e_ok = _serialize(expected_state)
        else:
            expected_payload, expected_kind, e_ok = None, "none", True

        record: Dict[str, Any] = {
            "func": func_name,
            "options": options or {},
            "has_expected": has_expected,
            "result": result_payload,
            "result_kind": result_kind,
            "expected": expected_payload,
            "expected_kind": expected_kind,
            "replayable": bool(r_ok and e_ok),
        }
        out_path = os.path.join(dump_dir, f"call_{call_idx:02d}.json")
        with open(out_path, "w", encoding="utf-8") as fh:
            json.dump(record, fh, ensure_ascii=False, indent=2, default=str)
    except Exception as exc:  # pragma: no cover - never fail evaluation
        logger.warning(
            "Failed to dump eval inputs for call %d (%s): %s",
            call_idx,
            func_name,
            exc,
        )


def dump_meta(
    eval_cache_dir: str,
    func: Any,
    conj: Optional[str],
    live_score: Optional[float] = None,
    evaluator_checksum: Optional[str] = None,
) -> None:
    """Write the per-task ``meta.json``.

    ``live_score`` is optional — when called from
    :func:`before_evaluate` we don't yet know the final score and write
    ``null``.  The harness recomputes the score during replay anyway.
    """

    if not eval_cache_dir:
        return

    try:
        dump_dir = _dump_dir(eval_cache_dir)
        record = {
            "func": func,
            "conj": conj,
            "live_score": float(live_score) if live_score is not None else None,
            "evaluator_checksum": evaluator_checksum,
            "evaluated_at": _dt.datetime.utcnow().isoformat() + "Z",
            "schema_version": 1,
        }
        out_path = os.path.join(dump_dir, META_FILENAME)
        with open(out_path, "w", encoding="utf-8") as fh:
            json.dump(record, fh, ensure_ascii=False, indent=2)
    except Exception as exc:  # pragma: no cover
        logger.warning("Failed to write eval dump meta: %s", exc)


def _evaluator_checksum(evaluator: Dict[str, Any]) -> Optional[str]:
    """Stable SHA-256 of an evaluator dict (must match the harness side)."""
    try:
        import hashlib
        blob = json.dumps(evaluator, sort_keys=True, ensure_ascii=False).encode("utf-8")
        return hashlib.sha256(blob).hexdigest()
    except Exception:
        return None


def before_evaluate(eval_cache_dir: str,
                    evaluator: Dict[str, Any],
                    conj: Optional[str]) -> None:
    """Single call from ``DesktopEnv.evaluate()`` at the very top.

    Wipes any prior dump and writes a meta.json carrying the func / conj
    / evaluator checksum / timestamp.  Score is left ``null`` and is not
    backfilled — the harness recomputes it during replay.

    Best-effort: any failure is swallowed so dumping never fails the
    live evaluation.
    """

    if not eval_cache_dir:
        return
    try:
        reset_dump(eval_cache_dir)
        dump_meta(
            eval_cache_dir,
            evaluator.get("func"),
            conj,
            live_score=None,
            evaluator_checksum=_evaluator_checksum(evaluator),
        )
    except Exception as exc:  # pragma: no cover - never fail evaluation
        logger.warning("eval_dump.before_evaluate failed: %s", exc)


def dump_metric_call(eval_cache_dir: str,
                     evaluator: Dict[str, Any],
                     idx: int,
                     result_state: Any,
                     expected_state: Any,
                     has_expected: bool) -> None:
    """Wrapper around :func:`dump_call` that derives ``func_name`` and
    ``options`` from the evaluator dict + index.
    """

    if not eval_cache_dir:
        return
    try:
        func_field = evaluator.get("func")
        if isinstance(func_field, list):
            func_name = func_field[idx] if idx < len(func_field) else str(func_field[-1])
        else:
            func_name = str(func_field)

        opts_field = evaluator.get("options")
        if isinstance(opts_field, list):
            options = opts_field[idx] if idx < len(opts_field) else {}
        else:
            options = opts_field or {}

        dump_call(
            eval_cache_dir,
            idx,
            func_name,
            options if isinstance(options, dict) else {},
            result_state,
            expected_state,
            has_expected,
        )
    except Exception as exc:  # pragma: no cover - never fail evaluation
        logger.warning("eval_dump.dump_metric_call failed: %s", exc)


def wrap_metric(env: Any, evaluator: Dict[str, Any], fn: Any, idx: int = 0):
    """Return a callable mirroring ``fn`` but persisting its inputs to
    ``<env.eval_cache_dir>/_eval_dump/`` so an offline harness can
    re-grade without a sandbox.

    On the first invocation per task we also reset the dump dir and
    write ``meta.json``.  Per-task state lives on ``env._eval_dump_done``
    which the caller (``DesktopEnv._set_task_info``) resets at task
    setup.

    All failures are swallowed: dumping must never break evaluation.
    """

    def _wrapped(result_state, *args, **kwargs):
        try:
            cache_dir = getattr(env, "eval_cache_dir", None) or ""
            if cache_dir and not getattr(env, "_eval_dump_done", False):
                conj = getattr(env, "metric_conj", None) if isinstance(
                    getattr(env, "metric", None), list) else None
                before_evaluate(cache_dir, evaluator, conj)
                env._eval_dump_done = True
            has_expected = len(args) >= 1
            expected_state = args[0] if has_expected else None
            dump_metric_call(cache_dir, evaluator, idx,
                             result_state, expected_state, has_expected)
        except Exception as exc:  # pragma: no cover - never fail evaluation
            logger.warning("eval_dump.wrap_metric pre-hook failed: %s", exc)
        return fn(result_state, *args, **kwargs)

    return _wrapped


def deserialize(payload: Any) -> Any:
    """Inverse of :func:`_serialize` for use by the harness."""

    if isinstance(payload, dict) and "__b64__" in payload and len(payload) == 1:
        return base64.b64decode(payload["__b64__"])
    if isinstance(payload, dict) and "__repr__" in payload and len(payload) == 1:
        raise ValueError(f"Non-replayable payload: {payload['__repr__']}")
    if isinstance(payload, list):
        return [deserialize(x) for x in payload]
    if isinstance(payload, dict):
        return {k: deserialize(v) for k, v in payload.items()}
    return payload
