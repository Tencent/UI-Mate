"""
Task Config & Evaluator Validation Library

Provides offline and VM-based validation for OSWorld task configuration
JSON files. Covers two aspects:

  1. Task config validation: JSON structure, required fields, config step
     types, and evaluator references.
  2. Evaluator deep validation: metric/getter existence, signature
     compatibility, cross-field consistency.

This module is a pure library — the CLI entry point lives in validate.py.
"""

from __future__ import annotations

import inspect
import json
import os
import traceback
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional

from desktop_env.evaluators import getters, metrics
from desktop_env.controllers.setup import SetupController


# ══════════════════════════════════════════════════════════════════════
# Data structures
# ══════════════════════════════════════════════════════════════════════

@dataclass
class Issue:
    """A single validation issue."""
    level: str  # "error", "warning", "info"
    field: str
    message: str


@dataclass
class ValidationResult:
    """Aggregated result for one task config file."""
    file_path: str
    task_id: str = ""
    domain: str = ""
    issues: List[Issue] = field(default_factory=list)

    # ── convenience accessors ────────────────────────────────────
    @property
    def errors(self) -> List[Issue]:
        return [i for i in self.issues if i.level == "error"]

    @property
    def warnings(self) -> List[Issue]:
        return [i for i in self.issues if i.level == "warning"]

    @property
    def infos(self) -> List[Issue]:
        return [i for i in self.issues if i.level == "info"]

    @property
    def ok(self) -> bool:
        return len(self.errors) == 0

    def add(self, level: str, fld: str, msg: str):
        self.issues.append(Issue(level, fld, msg))

    def add_error(self, fld: str, msg: str):
        self.add("error", fld, msg)

    def add_warning(self, fld: str, msg: str):
        self.add("warning", fld, msg)


# ══════════════════════════════════════════════════════════════════════
# Introspection helpers (cached at module level)
# ══════════════════════════════════════════════════════════════════════

def _get_valid_setup_types() -> Dict[str, List[str]]:
    """Introspect SetupController for _<type>_setup methods.
    Returns mapping type_name -> list of parameter names."""
    result = {}
    for name in dir(SetupController):
        if name.startswith("_") and name.endswith("_setup") and not name.startswith("__"):
            type_name = name[1:-6]
            method = getattr(SetupController, name)
            sig = inspect.signature(method)
            params = [p for p in sig.parameters if p != "self"]
            result[type_name] = params
    return result


def _get_valid_metric_names() -> set:
    """All callable metric names in the metrics module."""
    return {
        name for name in dir(metrics)
        if callable(getattr(metrics, name)) and not name.startswith("_")
    }


def _get_valid_getter_types() -> set:
    """Getter type names (the part after 'get_')."""
    return {
        name[4:]
        for name in dir(getters)
        if name.startswith("get_") and callable(getattr(getters, name))
    }


def _get_metric_info() -> Dict[str, Dict[str, Any]]:
    """Detailed metric introspection: params, has_kwargs, func reference."""
    info = {}
    for name in dir(metrics):
        obj = getattr(metrics, name)
        if callable(obj) and not name.startswith("_"):
            sig = inspect.signature(obj)
            params = []
            has_kwargs = False
            for pname, p in sig.parameters.items():
                if p.kind == inspect.Parameter.VAR_KEYWORD:
                    has_kwargs = True
                elif p.kind == inspect.Parameter.VAR_POSITIONAL:
                    continue
                else:
                    params.append({
                        "name": pname,
                        "required": p.default is inspect.Parameter.empty,
                        "default": None if p.default is inspect.Parameter.empty else p.default,
                    })
            info[name] = {"func": obj, "params": params, "has_kwargs": has_kwargs}
    return info


def _get_getter_info() -> Dict[str, Dict[str, Any]]:
    """Detailed getter introspection: func, func_name, params."""
    info = {}
    for name in dir(getters):
        if name.startswith("get_") and callable(getattr(getters, name)):
            obj = getattr(getters, name)
            gtype = name[4:]
            sig = inspect.signature(obj)
            params = list(sig.parameters.keys())
            info[gtype] = {"func": obj, "func_name": name, "params": params}
    return info


# Module-level caches
VALID_SETUP_TYPES = _get_valid_setup_types()
VALID_METRIC_NAMES = _get_valid_metric_names()
VALID_GETTER_TYPES = _get_valid_getter_types()
METRIC_INFO = _get_metric_info()
GETTER_INFO = _get_getter_info()


# ══════════════════════════════════════════════════════════════════════
# Task file collection
# ══════════════════════════════════════════════════════════════════════

def collect_task_files(
    base_dir: str = "evaluation_examples",
    domain: Optional[str] = None,
    meta_path: Optional[str] = None,
) -> List[str]:
    """Collect task config JSON file paths.

    Args:
        base_dir: Base directory for evaluation examples.
        domain: Filter by domain (e.g. "chrome", "chrome,vlc"). None or "all" = no filter.
        meta_path: Path to test_all.json index file. Defaults to <base_dir>/test_all.json.
    """
    if meta_path is None:
        meta_path = os.path.join(base_dir, "test_all.json")

    if not os.path.exists(meta_path):
        files = []
        examples_dir = os.path.join(base_dir, "examples")
        if os.path.isdir(examples_dir):
            for root, _, filenames in os.walk(examples_dir):
                for fn in filenames:
                    if fn.endswith(".json"):
                        files.append(os.path.join(root, fn))
        return files

    with open(meta_path, "r", encoding="utf-8") as f:
        test_all = json.load(f)

    domains = None
    if domain and domain != "all":
        domains = [d.strip() for d in domain.split(",")]

    files = []
    for d, ids in test_all.items():
        if domains and d not in domains:
            continue
        for eid in ids:
            fp = os.path.join(base_dir, f"examples/{d}/{eid}.json")
            files.append(fp)
    return files


# ══════════════════════════════════════════════════════════════════════
# Shared helpers
# ══════════════════════════════════════════════════════════════════════

def _extract_domain(file_path: str) -> str:
    parts = file_path.replace("\\", "/").split("/")
    if "examples" in parts:
        idx = parts.index("examples")
        if idx + 1 < len(parts):
            return parts[idx + 1]
    return ""


def _load_task_json(file_path: str, result: ValidationResult) -> Optional[dict]:
    """Load and basic-check a task JSON. Returns None on failure."""
    if not os.path.exists(file_path):
        result.add_error("file", f"File not found: {file_path}")
        return None
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            config = json.load(f)
    except json.JSONDecodeError as e:
        result.add_error("json", f"Invalid JSON: {e}")
        return None
    if not isinstance(config, dict):
        result.add_error("root", "Root element must be a JSON object")
        return None
    result.task_id = config.get("id", "")
    result.domain = _extract_domain(file_path)
    return config


# ══════════════════════════════════════════════════════════════════════
# 1. Task config validation (offline)
# ══════════════════════════════════════════════════════════════════════

def validate_task_config(file_path: str) -> ValidationResult:
    """Offline (Level 1) validation of a task config JSON."""
    result = ValidationResult(file_path=file_path)
    config = _load_task_json(file_path, result)
    if config is None:
        return result

    # Required top-level fields
    required_fields = {"id": str, "instruction": str, "evaluator": dict}
    for fld, expected_type in required_fields.items():
        if fld not in config:
            result.add_error(fld, f"Missing required field '{fld}'")
        elif not isinstance(config[fld], expected_type):
            result.add_error(fld, f"Field '{fld}' must be {expected_type.__name__}, got {type(config[fld]).__name__}")

    # Filename vs id
    if "id" in config:
        basename = os.path.splitext(os.path.basename(file_path))[0]
        if basename != config["id"]:
            result.add_warning("id", f"Filename '{basename}' does not match id '{config['id']}'")

    # Optional typed fields
    optional_typed = {
        "snapshot": str, "config": list,
        "trajectory": str, "related_apps": list, "proxy": bool,
        "fixed_ip": bool, "possibility_of_env_change": str,
    }
    for fld, expected_type in optional_typed.items():
        if fld in config and not isinstance(config[fld], expected_type):
            result.add_error(fld, f"Field '{fld}' should be {expected_type.__name__}, got {type(config[fld]).__name__}")

    # 'source' is metadata-only, accept str or list
    if "source" in config and not isinstance(config["source"], (str, list)):
        result.add_warning("source", f"Field 'source' should be str or list, got {type(config['source']).__name__}")

    # Config setup steps
    _validate_config_steps(config.get("config", []), result)

    # Evaluator (basic)
    if "evaluator" in config and isinstance(config["evaluator"], dict):
        _validate_evaluator_basic(config["evaluator"], result)

    return result


def _validate_config_steps(config_steps: list, result: ValidationResult):
    """Validate the 'config' / 'postconfig' array of setup steps."""
    if not isinstance(config_steps, list):
        result.add_error("config", "Field 'config' must be a list")
        return

    for i, step in enumerate(config_steps):
        prefix = f"config[{i}]"
        if not isinstance(step, dict):
            result.add_error(prefix, "Each config step must be a dict")
            continue
        if "type" not in step:
            result.add_error(f"{prefix}.type", "Missing 'type' field")
            continue

        step_type = step["type"]
        if not isinstance(step_type, str):
            result.add_error(f"{prefix}.type", f"'type' must be a string, got {type(step_type).__name__}")
            continue
        if step_type not in VALID_SETUP_TYPES:
            result.add_error(f"{prefix}.type", f"Unknown config type '{step_type}'. Valid: {sorted(VALID_SETUP_TYPES.keys())}")
            continue

        if "parameters" not in step:
            result.add_error(f"{prefix}.parameters", "Missing 'parameters' field")
            continue
        params = step["parameters"]
        if not isinstance(params, dict):
            result.add_error(f"{prefix}.parameters", f"'parameters' must be a dict, got {type(params).__name__}")
            continue

        # Check against method signature
        method = getattr(SetupController, f"_{step_type}_setup")
        sig = inspect.signature(method)
        method_params = {n: p for n, p in sig.parameters.items() if n != "self"}

        for pname, p in method_params.items():
            if (
                p.default is inspect.Parameter.empty
                and p.kind not in (inspect.Parameter.VAR_POSITIONAL, inspect.Parameter.VAR_KEYWORD)
                and pname not in params
            ):
                result.add_warning(f"{prefix}.parameters.{pname}",
                                   f"Setup type '{step_type}' expects parameter '{pname}' but it's not provided")

        has_var_keyword = any(p.kind == inspect.Parameter.VAR_KEYWORD for p in method_params.values())
        if not has_var_keyword:
            for pname in params:
                if pname not in method_params:
                    result.add_warning(f"{prefix}.parameters.{pname}",
                                       f"Unknown parameter '{pname}' for setup type '{step_type}'")


def _validate_evaluator_basic(evaluator: dict, result: ValidationResult):
    """Basic evaluator checks (used by task config validation)."""
    prefix = "evaluator"
    if "func" not in evaluator:
        result.add_error(f"{prefix}.func", "Missing required field 'func'")
        return

    func = evaluator["func"]
    if func == "infeasible":
        return

    func_list = func if isinstance(func, list) else [func]
    is_multi = isinstance(func, list)
    n_metrics = len(func_list)

    for i, fn in enumerate(func_list):
        fld = f"{prefix}.func[{i}]" if is_multi else f"{prefix}.func"
        if not isinstance(fn, str):
            result.add_error(fld, f"Metric function name must be a string, got {type(fn).__name__}")
            continue
        if fn not in VALID_METRIC_NAMES:
            result.add_error(fld, f"Unknown metric function '{fn}'. Check metrics/__init__.py")

    if is_multi and n_metrics > 1:
        conj = evaluator.get("conj", "and")
        if conj not in ("and", "or"):
            result.add_error(f"{prefix}.conj", f"'conj' must be 'and' or 'or', got '{conj}'")

    _validate_getter_field_basic(evaluator, "result", n_metrics, is_multi, result, prefix)
    if "expected" in evaluator:
        _validate_getter_field_basic(evaluator, "expected", n_metrics, is_multi, result, prefix)

    if "options" in evaluator:
        opts = evaluator["options"]
        if is_multi:
            if not isinstance(opts, list):
                result.add_error(f"{prefix}.options", "When func is a list, options must also be a list")
            elif len(opts) != n_metrics:
                result.add_error(f"{prefix}.options", f"Length mismatch: {len(opts)} options vs {n_metrics} metrics")
        else:
            if not isinstance(opts, dict):
                result.add_error(f"{prefix}.options", "Options must be a dict for single metric")

    if "postconfig" in evaluator:
        pc = evaluator["postconfig"]
        if not isinstance(pc, list):
            result.add_error(f"{prefix}.postconfig", "postconfig must be a list")
        else:
            _validate_config_steps(pc, result)

    if is_multi and n_metrics > 1:
        for fld_name in ("result", "expected", "options"):
            if fld_name in evaluator:
                val = evaluator[fld_name]
                if isinstance(val, list) and len(val) != n_metrics:
                    result.add_error(f"{prefix}.{fld_name}",
                                     f"Length mismatch: {len(val)} {fld_name}(s) vs {n_metrics} metrics")


def _validate_getter_field_basic(
    evaluator: dict, field_name: str, n_metrics: int,
    is_multi: bool, result: ValidationResult, prefix: str,
):
    if field_name not in evaluator:
        if field_name == "result":
            result.add_warning(f"{prefix}.{field_name}", "Missing 'result' field (some evaluators may need it)")
        return
    val = evaluator[field_name]
    if is_multi:
        if not isinstance(val, list):
            result.add_error(f"{prefix}.{field_name}", f"When func is a list, {field_name} must also be a list")
            return
        items = val
    else:
        items = [val]

    for i, item in enumerate(items):
        fld = f"{prefix}.{field_name}[{i}]" if is_multi else f"{prefix}.{field_name}"
        if item is None:
            continue
        if not isinstance(item, dict):
            result.add_error(fld, f"Getter config must be a dict, got {type(item).__name__}")
            continue
        if "type" not in item:
            result.add_error(f"{fld}.type", "Missing 'type' field in getter config")
            continue
        getter_type = item["type"]
        if not isinstance(getter_type, str):
            result.add_error(f"{fld}.type", "Getter type must be a string")
            continue
        if getter_type not in VALID_GETTER_TYPES:
            result.add_error(f"{fld}.type",
                             f"Unknown getter type '{getter_type}'. No 'get_{getter_type}' function found")


# ══════════════════════════════════════════════════════════════════════
# 2. Evaluator deep validation (offline)
# ══════════════════════════════════════════════════════════════════════

def validate_evaluator(file_path: str) -> ValidationResult:
    """Deep offline validation of a task's evaluator configuration."""
    result = ValidationResult(file_path=file_path)
    config = _load_task_json(file_path, result)
    if config is None:
        return result

    if "evaluator" not in config:
        result.add_error("evaluator", "Missing 'evaluator' field")
        return result

    evaluator = config["evaluator"]
    if not isinstance(evaluator, dict):
        result.add_error("evaluator", "Evaluator must be a dict")
        return result

    _validate_evaluator_deep(evaluator, result)
    return result


def _validate_evaluator_deep(evaluator: dict, result: ValidationResult):
    """Deep validation: function compatibility, cross-field checks."""
    P = "evaluator"

    if "func" not in evaluator:
        result.add("error", f"{P}.func", "Missing 'func'")
        return

    func = evaluator["func"]
    if func == "infeasible":
        if "result" in evaluator and evaluator["result"]:
            result.add("warning", P, "infeasible task has 'result' field (will be ignored)")
        return

    func_list = func if isinstance(func, list) else [func]
    is_multi = isinstance(func, list)
    n = len(func_list)

    # Validate metric functions
    metric_funcs = []
    for i, fn in enumerate(func_list):
        fld = f"{P}.func[{i}]" if is_multi else f"{P}.func"
        if not isinstance(fn, str):
            result.add("error", fld, f"Must be string, got {type(fn).__name__}")
            metric_funcs.append(None)
            continue
        if fn not in METRIC_INFO:
            result.add("error", fld, f"Unknown metric '{fn}'")
            metric_funcs.append(None)
        else:
            metric_funcs.append(METRIC_INFO[fn])

    # conj
    if is_multi and n > 1:
        conj = evaluator.get("conj")
        if conj is None:
            result.add("warning", f"{P}.conj", "Multi-metric but no 'conj' specified (defaults to 'and')")
        elif conj not in ("and", "or"):
            result.add("error", f"{P}.conj", f"Must be 'and' or 'or', got '{conj}'")

    # result / expected getters
    _validate_getter_configs(evaluator, "result", n, is_multi, result, P)
    _validate_getter_configs(evaluator, "expected", n, is_multi, result, P)
    has_expected = "expected" in evaluator and evaluator["expected"]

    # options
    options_list = _validate_options(evaluator, n, is_multi, result, P)

    # Cross-check metric signatures
    for i, minfo in enumerate(metric_funcs):
        if minfo is None:
            continue
        fld = f"{P}.metric_check[{i}]" if is_multi else f"{P}.metric_check"
        fn_name = func_list[i]
        params = minfo["params"]
        positional_required = [p for p in params if p["required"]]
        n_positional = len(positional_required)

        if n_positional >= 2 and not has_expected:
            result.add("warning", fld,
                        f"Metric '{fn_name}' has {n_positional} required params "
                        f"({[p['name'] for p in positional_required]}) "
                        f"but no 'expected' getter is configured")

        if n_positional <= 1 and has_expected:
            exp_val = evaluator["expected"]
            exp_item = exp_val[i] if isinstance(exp_val, list) else exp_val
            if exp_item is not None:
                result.add("info", fld,
                            f"Metric '{fn_name}' has {n_positional} required param(s) "
                            f"but an 'expected' getter is configured — "
                            f"fine if metric accepts optional positional args")

        if options_list and i < len(options_list) and options_list[i]:
            opts = options_list[i]
            if isinstance(opts, dict):
                known = {p["name"] for p in params}
                for key in opts:
                    if key not in known and not minfo["has_kwargs"]:
                        result.add("warning", f"{fld}.options",
                                    f"Option key '{key}' not in metric '{fn_name}' signature "
                                    f"and metric does not accept **kwargs")

    # postconfig
    if "postconfig" in evaluator:
        pc = evaluator["postconfig"]
        if not isinstance(pc, list):
            result.add("error", f"{P}.postconfig", "Must be a list")
        else:
            for i, step in enumerate(pc):
                if not isinstance(step, dict):
                    result.add("error", f"{P}.postconfig[{i}]", "Must be a dict")
                    continue
                if "type" not in step:
                    result.add("error", f"{P}.postconfig[{i}]", "Missing 'type'")
                elif step["type"] not in VALID_SETUP_TYPES:
                    result.add("error", f"{P}.postconfig[{i}].type", f"Unknown type '{step['type']}'")


def _validate_getter_configs(
    evaluator: dict, field_name: str, n_metrics: int,
    is_multi: bool, result: ValidationResult, prefix: str,
) -> List[Optional[Dict]]:
    if field_name not in evaluator:
        return [None] * n_metrics
    val = evaluator[field_name]
    if is_multi:
        if not isinstance(val, list):
            result.add("error", f"{prefix}.{field_name}", "Must be a list when func is a list")
            return [None] * n_metrics
        if len(val) != n_metrics:
            result.add("error", f"{prefix}.{field_name}", f"Length {len(val)} != {n_metrics} metrics")
        items = val
    else:
        items = [val]

    getter_infos = []
    for i, item in enumerate(items):
        fld = f"{prefix}.{field_name}[{i}]" if is_multi else f"{prefix}.{field_name}"
        if item is None:
            getter_infos.append(None)
            continue
        if not isinstance(item, dict):
            result.add("error", fld, f"Must be a dict, got {type(item).__name__}")
            getter_infos.append(None)
            continue
        if "type" not in item:
            result.add("error", f"{fld}.type", "Missing 'type'")
            getter_infos.append(None)
            continue
        gtype = item["type"]
        if gtype not in GETTER_INFO:
            result.add("error", f"{fld}.type", f"Unknown getter type '{gtype}' (no get_{gtype} function)")
            getter_infos.append(None)
        else:
            getter_infos.append(GETTER_INFO[gtype])
    return getter_infos


def _validate_options(
    evaluator: dict, n_metrics: int, is_multi: bool,
    result: ValidationResult, prefix: str,
) -> List[Optional[Dict]]:
    if "options" not in evaluator:
        return [{}] * n_metrics
    opts = evaluator["options"]
    if is_multi:
        if not isinstance(opts, list):
            result.add("error", f"{prefix}.options", "Must be a list when func is a list")
            return [{}] * n_metrics
        if len(opts) != n_metrics:
            result.add("error", f"{prefix}.options", f"Length {len(opts)} != {n_metrics} metrics")
        return [o if o else {} for o in opts]
    else:
        if not isinstance(opts, dict):
            result.add("error", f"{prefix}.options", f"Must be a dict, got {type(opts).__name__}")
            return [{}]
        return [opts]


# ══════════════════════════════════════════════════════════════════════
# 3. VM-based validation (Level 2)
# ══════════════════════════════════════════════════════════════════════

def _create_vm_env(exp_config):
    """Create a DesktopEnv from experiment config (lazy import)."""
    from core.env_factory import build_desktop_env
    env_cfg = exp_config.environment
    return build_desktop_env(
        path_to_vm=env_cfg.path_to_vm,
        action_space="pyautogui",
        provider_name=env_cfg.provider_name,
        region=env_cfg.region,
        snapshot_name=env_cfg.snapshot_name,
        screen_size=(env_cfg.screen_width, env_cfg.screen_height),
        headless=env_cfg.headless,
        os_type=env_cfg.os_type,
        enable_proxy=env_cfg.enable_proxy,
        force_proxy=env_cfg.force_proxy,
        client_password=env_cfg.client_password,
        cache_dir=env_cfg.cache_dir,
    )


def validate_task_config_with_vm(file_path: str, exp_config) -> ValidationResult:
    """Level 2: boot VM, run config setup + evaluator."""
    result = validate_task_config(file_path)
    if not result.ok:
        result.add_error("vm", "Skipping VM validation due to offline errors")
        return result

    with open(file_path, "r", encoding="utf-8") as f:
        task_config = json.load(f)

    env = None
    try:
        env = _create_vm_env(exp_config)
        try:
            obs = env.reset(task_config=task_config)
            if obs is None:
                result.add_error("vm.reset", "env.reset() returned None — setup may have failed")
        except Exception as e:
            result.add_error("vm.reset", f"env.reset() failed: {e}")
            return result

        try:
            env._set_evaluator_info(task_config)
        except AttributeError as e:
            result.add_error("vm.evaluator", f"Evaluator function/getter not found: {e}")
        except AssertionError as e:
            result.add_error("vm.evaluator", f"Evaluator length mismatch: {e}")
        except Exception as e:
            result.add_error("vm.evaluator", f"Evaluator setup failed: {e}")

        try:
            score = env.evaluate()
            result.add_warning("vm.evaluate", f"Evaluation returned score: {score} (expected 0 since no agent ran)")
        except Exception as e:
            result.add_error("vm.evaluate", f"env.evaluate() failed: {e}")
    except Exception as e:
        result.add_error("vm", f"VM setup failed: {e}")
    finally:
        if env is not None:
            try:
                env.close()
            except Exception:
                pass
    return result


def validate_evaluator_with_vm(file_path: str, exp_config) -> ValidationResult:
    """Level 2: boot VM, run evaluator only."""
    result = validate_evaluator(file_path)
    if not result.ok:
        result.add("error", "vm", "Skipping VM test due to offline errors")
        return result

    with open(file_path, "r", encoding="utf-8") as f:
        task_config = json.load(f)

    env = None
    try:
        env = _create_vm_env(exp_config)
        try:
            obs = env.reset(task_config=task_config)
            if obs is None:
                result.add("error", "vm.reset", "env.reset() returned None")
                return result
            result.add("info", "vm.reset", "env.reset() succeeded")
        except Exception as e:
            result.add("error", "vm.reset", f"Failed: {e}")
            return result

        try:
            env._set_evaluator_info(task_config)
            result.add("info", "vm.evaluator_info", "Evaluator info loaded successfully")
        except Exception as e:
            result.add("error", "vm.evaluator_info", f"Failed to load evaluator info: {e}")
            return result

        try:
            score = env.evaluate()
            result.add("info", "vm.evaluate",
                        f"Evaluation completed — score={score} (expected ~0 since no agent ran)")
        except FileNotFoundError as e:
            result.add("error", "vm.evaluate", f"Getter couldn't find file: {e}")
        except AttributeError as e:
            result.add("error", "vm.evaluate", f"Missing function/attribute: {e}")
        except TypeError as e:
            result.add("error", "vm.evaluate", f"Type error in metric/getter call: {e}")
        except Exception as e:
            result.add("error", "vm.evaluate", f"Evaluation failed: {e}\n{traceback.format_exc()}")
    except Exception as e:
        result.add("error", "vm", f"VM setup error: {e}")
    finally:
        if env is not None:
            try:
                env.close()
            except Exception:
                pass
    return result
