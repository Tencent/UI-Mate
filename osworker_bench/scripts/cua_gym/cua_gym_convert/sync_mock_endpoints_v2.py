#!/usr/bin/env python3
"""Synchronize the canonical 100-task benchmark to ``.MOCK_HOST``.

The target mapping stores only app ports::

    gmail_mock: 8138
    google_sheets_mock: 8145

The shared scheme and host come from ``MOCK_APP_BASE_URL`` in the process
environment or repository ``.env`` file, for example ``http://mock-host``.

Only task IDs listed by ``evaluation_examples/OSWorker/osworker_benchmark_full.json``
are in scope.  The script owns:

* ``osworker_cache/<task>/initial_setup.py``
* ``osworker_cache/<task>/reward.py``
* ``osworker_cache/<task>/_cua_gym_vm_bridge.sh``
* matching task JSON files under ``evaluation_examples/OSWorker/examples``

The current direct bridge format supports one destination host.  The script
therefore requires all target endpoints to share one host, updates every
direct bridge default, and updates explicit bridge host arguments in task
JSON.  Legacy socat bridges are rejected rather than silently rewritten.

Default mode is a read-only dry-run.  ``--apply`` writes staged changes only
after all prospective Python, JSON, endpoint and bridge checks pass.  The
applied map is updated last.  If the applied map does not exist, read-only
modes assume the verified current baseline equals the target map; writes
require the explicit ``--bootstrap-applied`` flag.
"""

import argparse
import contextlib
import fcntl
import json
import os
import re
import shlex
import sys
import tempfile
import time
from pathlib import Path
from typing import Dict, Iterable, List, Mapping, MutableMapping, Optional, Sequence, Set, Tuple
from urllib.parse import urlsplit

import yaml

import remap_ours_benchmark_endpoints as legacy


SCRIPT_PATH = Path(__file__).resolve()
REPO_ROOT = SCRIPT_PATH.parents[3]
DEFAULT_TARGET_MAP = REPO_ROOT / ".MOCK_HOST"
DEFAULT_CACHE_DIR = REPO_ROOT / "osworker_cache"
DEFAULT_APPLIED_MAP = DEFAULT_CACHE_DIR / ".MOCK_HOST.applied"
DEFAULT_META = REPO_ROOT / "evaluation_examples/OSWorker" / "osworker_benchmark_full.json"
DEFAULT_EXAMPLES_DIR = REPO_ROOT / "evaluation_examples/OSWorker" / "examples"
OWNED_PYTHON_FILES = ("initial_setup.py", "reward.py")
BRIDGE_FILE = "_cua_gym_vm_bridge.sh"
URL_RE = re.compile(r"https?://[A-Za-z0-9.-]+:\d{1,5}")
MOCK_APP_BASE_URL_ENV = "MOCK_APP_BASE_URL"


class SyncError(RuntimeError):
    """User-actionable synchronization failure."""


def relative_display(path: Path) -> str:
    try:
        return str(path.resolve().relative_to(REPO_ROOT))
    except ValueError:
        return str(path)


def canonical_names() -> List[str]:
    return legacy.canonical_mock_names()


def read_dotenv_value(path: Path, key: str) -> Optional[str]:
    try:
        lines = path.read_text(encoding="utf-8").splitlines()
    except FileNotFoundError:
        return None
    except OSError as exc:
        raise SyncError("cannot read dotenv file {}: {}".format(path, exc))

    for raw_line in lines:
        line = raw_line.strip()
        if not line or line.startswith("#"):
            continue
        if line.startswith("export "):
            line = line[len("export "):].lstrip()
        name, separator, value = line.partition("=")
        if not separator or name.strip() != key:
            continue
        value = value.strip()
        if len(value) >= 2 and value[0] == value[-1] and value[0] in {"'", '"'}:
            value = value[1:-1]
        return value
    return None


def load_mock_base_url() -> Tuple[str, str]:
    value = os.environ.get(MOCK_APP_BASE_URL_ENV)
    if value is None:
        value = read_dotenv_value(REPO_ROOT / ".env", MOCK_APP_BASE_URL_ENV)
    if not value:
        raise SyncError(
            "{} must be set in the environment or {} when the target map "
            "contains port-only values".format(
                MOCK_APP_BASE_URL_ENV, REPO_ROOT / ".env"
            )
        )

    parsed = urlsplit(value.strip())
    if (
        parsed.scheme not in {"http", "https"}
        or not parsed.hostname
        or parsed.port is not None
        or parsed.path not in {"", "/"}
        or parsed.query
        or parsed.fragment
    ):
        raise SyncError(
            "{} must be an http(s) base URL without a port or path: {!r}".format(
                MOCK_APP_BASE_URL_ENV, value
            )
        )
    try:
        host = legacy.validate_host(parsed.hostname, MOCK_APP_BASE_URL_ENV)
    except legacy.MigrationError as exc:
        raise SyncError(str(exc))
    return parsed.scheme, host


def load_mapping(path: Path, label: str) -> Dict[str, legacy.Endpoint]:
    try:
        raw = yaml.safe_load(path.read_text(encoding="utf-8"))
    except (OSError, yaml.YAMLError) as exc:
        raise SyncError("{}: cannot read YAML {}: {}".format(label, path, exc))
    if not isinstance(raw, dict):
        raise SyncError("{}: expected a YAML mapping in {}".format(label, path))

    names = canonical_names()
    expected = set(names)
    supplied = set(raw)
    missing = sorted(expected - supplied)
    extra = sorted(supplied - expected)
    if missing or extra:
        raise SyncError(
            "{}: mapping keys must exactly match the {} canonical mocks; "
            "missing={}, extra={}".format(label, len(names), missing, extra)
        )

    port_only = any(
        isinstance(value, int) and not isinstance(value, bool)
        for value in raw.values()
    )
    base = load_mock_base_url() if port_only else None

    endpoints: Dict[str, legacy.Endpoint] = {}
    for name in names:
        value = raw[name]
        option = "{}[{}]".format(label, name)
        if isinstance(value, int) and not isinstance(value, bool):
            assert base is not None
            try:
                endpoints[name] = legacy.Endpoint(
                    base[0],
                    base[1],
                    legacy.validate_port(value, option),
                )
            except legacy.MigrationError as exc:
                raise SyncError(str(exc))
        elif isinstance(value, str):
            try:
                endpoints[name] = legacy.parse_endpoint(value.strip(), option)
            except legacy.MigrationError as exc:
                raise SyncError(str(exc))
        else:
            raise SyncError(
                "{}: endpoint must be an integer port or full URL string".format(
                    option
                )
            )

    endpoint_to_names: Dict[legacy.Endpoint, List[str]] = {}
    for name, endpoint in endpoints.items():
        endpoint_to_names.setdefault(endpoint, []).append(name)
    duplicates = {
        endpoint.url: names_for_endpoint
        for endpoint, names_for_endpoint in endpoint_to_names.items()
        if len(names_for_endpoint) > 1
    }
    if duplicates:
        raise SyncError("{}: duplicate endpoints: {}".format(label, duplicates))
    return endpoints


def mapping_text(mapping: Mapping[str, legacy.Endpoint]) -> str:
    return "".join(
        "{}: {}\n".format(name, mapping[name].url) for name in canonical_names()
    )


def validate_transition(
    current: Mapping[str, legacy.Endpoint],
    target: Mapping[str, legacy.Endpoint],
) -> None:
    """Reject endpoint ownership swaps that cannot be verified from raw text."""
    current_owner = {endpoint.url: name for name, endpoint in current.items()}
    target_owner = {endpoint.url: name for name, endpoint in target.items()}
    conflicts = {
        endpoint: (current_owner[endpoint], target_owner[endpoint])
        for endpoint in set(current_owner) & set(target_owner)
        if current_owner[endpoint] != target_owner[endpoint]
    }
    if conflicts:
        raise SyncError(
            "current/target maps reuse endpoint URLs for different mocks: {}".format(
                conflicts
            )
        )


def build_source_maps(
    current: Mapping[str, legacy.Endpoint],
) -> Tuple[Dict[str, str], Dict[str, Dict[int, str]]]:
    source_to_mock: Dict[str, str] = {}
    source_ports: Dict[str, Dict[int, str]] = {}
    for name in canonical_names():
        legacy.register_source_endpoint(
            source_to_mock, source_ports, name, current[name]
        )
    return source_to_mock, source_ports


def load_scope(
    cache_dir: Path, meta_path: Path, examples_dir: Path
) -> Tuple[List[Path], Dict[str, Path], Set[str]]:
    task_ids = legacy.load_meta_task_ids(meta_path)
    if len(task_ids) != 100:
        raise SyncError(
            "{} must define exactly 100 unique task IDs, found {}".format(
                meta_path, len(task_ids)
            )
        )
    task_dirs = legacy.select_task_dirs(cache_dir, meta_path, None)
    task_json_index = legacy.build_task_json_index(examples_dir)
    missing_json = sorted(task_id for task_id in task_ids if task_id not in task_json_index)
    if missing_json:
        raise SyncError(
            "{} scoped task IDs have no task JSON: {}".format(
                len(missing_json), missing_json
            )
        )
    return task_dirs, task_json_index, task_ids


def discover_bridge_source_hosts(
    task_dirs: Sequence[Path],
    task_json_index: Mapping[str, Path],
    current: Mapping[str, legacy.Endpoint],
) -> Set[str]:
    """Collect endpoint, bridge-default and explicit bridge-command hosts."""
    hosts = {endpoint.host for endpoint in current.values()}
    for task_dir in task_dirs:
        bridge_path = task_dir / BRIDGE_FILE
        if bridge_path.is_file():
            bridge_text = bridge_path.read_text(encoding="utf-8", errors="replace")
            match = legacy.BRIDGE_DEFAULT_RE.search(bridge_text)
            if match:
                hosts.add(match.group("host"))

        task_json_path = task_json_index[task_dir.name]
        try:
            task_json = json.loads(task_json_path.read_text(encoding="utf-8"))
        except json.JSONDecodeError as exc:
            raise SyncError(
                "cannot parse task JSON {}: {}".format(task_json_path, exc)
            )
        for command in legacy.bridge_commands(task_json):
            try:
                tokens = shlex.split(command)
            except ValueError as exc:
                raise SyncError(
                    "cannot parse bridge command in {}: {}".format(
                        task_json_path, exc
                    )
                )
            if len(tokens) >= 6:
                hosts.add(tokens[-1])
    return hosts


def stage_changes(
    task_dirs: Sequence[Path],
    task_json_index: Mapping[str, Path],
    current: Mapping[str, legacy.Endpoint],
    target: Mapping[str, legacy.Endpoint],
) -> Dict[Path, legacy.Change]:
    source_to_mock, source_ports = build_source_maps(current)
    changes: Dict[Path, legacy.Change] = {}
    try:
        destination_bridge_host = legacy.destination_bridge_host(target)
    except legacy.MigrationError as exc:
        raise SyncError(
            "V2 bridge synchronization requires a single target host: {}".format(
                exc
            )
        )
    bridge_source_hosts = discover_bridge_source_hosts(
        task_dirs, task_json_index, current
    )

    for task_dir in task_dirs:
        for filename in OWNED_PYTHON_FILES:
            path = task_dir / filename
            if not path.is_file():
                continue
            original = path.read_text(encoding="utf-8")
            result = legacy.rewrite_setup_or_reward(
                original, source_to_mock, source_ports, target
            )
            if result.text != original:
                legacy.validate_python(path, result.text)
                legacy.stage_change(
                    changes,
                    path,
                    original,
                    result.text,
                    "mock endpoint rewrite",
                    result.replacements,
                )

        bridge_path = task_dir / BRIDGE_FILE
        if bridge_path.is_file():
            original_bridge = bridge_path.read_text(encoding="utf-8")
            if legacy.SOCAT_MARKER in original_bridge:
                raise SyncError(
                    "{} is a legacy socat bridge; initialize the direct-bridge "
                    "baseline before V2 synchronization".format(bridge_path)
                )
            if legacy.DIRECT_MARKER not in original_bridge:
                raise SyncError(
                    "{} is not a recognized direct bridge".format(bridge_path)
                )
            updated_bridge, bridge_replacements = legacy.update_direct_bridge(
                original_bridge,
                destination_bridge_host,
                bridge_source_hosts,
            )
            if updated_bridge != original_bridge:
                legacy.validate_shell(bridge_path, updated_bridge)
                legacy.stage_change(
                    changes,
                    bridge_path,
                    original_bridge,
                    updated_bridge,
                    "direct bridge host rewrite",
                    bridge_replacements,
                )

        task_json_path = task_json_index[task_dir.name]
        original_json = task_json_path.read_text(encoding="utf-8")
        updated_json, url_replacements = legacy.rewrite_task_json_urls(
            original_json, source_to_mock, target
        )
        updated_json, bridge_replacements = legacy.update_explicit_bridge_command(
            task_json_path,
            updated_json,
            destination_bridge_host,
            bridge_source_hosts,
        )
        if updated_json != original_json:
            legacy.validate_json(task_json_path, updated_json)
            reasons = []
            if url_replacements:
                reasons.append("mock URLs")
            if bridge_replacements:
                reasons.append("bridge host argument")
            legacy.stage_change(
                changes,
                task_json_path,
                original_json,
                updated_json,
                "task config " + " + ".join(reasons),
                url_replacements + bridge_replacements,
            )
    return changes


def prospective_text(path: Path, changes: Mapping[Path, legacy.Change]) -> str:
    change = changes.get(path)
    if change is not None:
        return change.updated
    return path.read_text(encoding="utf-8", errors="replace")


def endpoint_url_variants(endpoint: legacy.Endpoint) -> Set[str]:
    return {
        "http://{}:{}".format(endpoint.host, endpoint.port),
        "https://{}:{}".format(endpoint.host, endpoint.port),
    }


def endpoint_problems(
    path: Path,
    text: str,
    current: Mapping[str, legacy.Endpoint],
    target: Mapping[str, legacy.Endpoint],
) -> List[str]:
    problems: List[str] = []
    target_urls = {endpoint.url for endpoint in target.values()}
    stale_urls: Set[str] = set()
    for name in canonical_names():
        if current[name] != target[name]:
            stale_urls.update(endpoint_url_variants(current[name]))

    for stale in sorted(stale_urls, key=len, reverse=True):
        if stale in text:
            problems.append(
                "{}: still contains stale endpoint {}".format(
                    relative_display(path), stale
                )
            )

    managed_pairs = {
        (endpoint.host, endpoint.port)
        for endpoint in list(current.values()) + list(target.values())
    }
    for raw_url in URL_RE.findall(text):
        try:
            parsed = urlsplit(raw_url)
            pair = (parsed.hostname, parsed.port)
        except ValueError:
            continue
        if pair in managed_pairs and raw_url not in target_urls:
            problems.append(
                "{}: managed endpoint is not a target mapping value: {}".format(
                    relative_display(path), raw_url
                )
            )
    return problems


def bridge_command_host(task_json: Mapping[str, object]) -> Optional[str]:
    commands = legacy.bridge_commands(task_json)
    explicit_hosts: Set[str] = set()
    for command in commands:
        try:
            tokens = shlex.split(command)
        except ValueError as exc:
            raise SyncError("cannot parse bridge command {!r}: {}".format(command, exc))
        # bash SCRIPT PASSWORD 9000 9097 HOST
        if len(tokens) >= 6:
            explicit_hosts.add(tokens[-1])
    if len(explicit_hosts) > 1:
        raise SyncError(
            "task JSON contains multiple explicit bridge hosts: {}".format(
                sorted(explicit_hosts)
            )
        )
    return next(iter(explicit_hosts)) if explicit_hosts else None


def bridge_problems(
    task_dir: Path,
    task_json_text: str,
    target: Mapping[str, legacy.Endpoint],
    bridge_text: Optional[str] = None,
) -> List[str]:
    bridge_path = task_dir / BRIDGE_FILE
    if not bridge_path.is_file():
        return []
    if bridge_text is None:
        bridge_text = bridge_path.read_text(encoding="utf-8", errors="replace")
    if legacy.SOCAT_MARKER in bridge_text:
        return [
            "{}: legacy socat bridge is outside the V2 baseline".format(
                relative_display(bridge_path)
            )
        ]
    match = legacy.BRIDGE_DEFAULT_RE.search(bridge_text)
    if not match:
        return [
            "{}: direct bridge default host is not parseable".format(
                relative_display(bridge_path)
            )
        ]

    try:
        task_json = json.loads(task_json_text)
    except json.JSONDecodeError as exc:
        return [
            "{}: cannot parse task JSON for bridge check: {}".format(
                task_dir.name, exc
            )
        ]
    target_hosts = {endpoint.host for endpoint in target.values()}
    if len(target_hosts) != 1:
        return [
            "{}: V2 bridge synchronization requires one target host, got {}".format(
                relative_display(bridge_path), sorted(target_hosts)
            )
        ]
    target_host = next(iter(target_hosts))
    default_host = match.group("host")
    explicit_host = bridge_command_host(task_json)
    problems: List[str] = []
    if default_host != target_host:
        problems.append(
            "{}: bridge default host {} != target host {}".format(
                relative_display(bridge_path), default_host, target_host
            )
        )
    if explicit_host is not None and explicit_host != target_host:
        problems.append(
            "{}: explicit bridge host {} != target host {}".format(
                task_dir.name, explicit_host, target_host
            )
        )
    return problems


def verify_scope(
    task_dirs: Sequence[Path],
    task_json_index: Mapping[str, Path],
    current: Mapping[str, legacy.Endpoint],
    target: Mapping[str, legacy.Endpoint],
    changes: Optional[Mapping[Path, legacy.Change]] = None,
    check_bridges: bool = True,
) -> List[str]:
    changes = changes or {}
    problems: List[str] = []
    source_to_mock, source_ports = build_source_maps(current)
    for task_dir in task_dirs:
        for filename in OWNED_PYTHON_FILES:
            path = task_dir / filename
            if not path.is_file():
                continue
            text = prospective_text(path, changes)
            try:
                legacy.validate_python(path, text)
            except legacy.MigrationError as exc:
                problems.append(str(exc))
                continue
            problems.extend(endpoint_problems(path, text, current, target))
            try:
                repeated = legacy.rewrite_setup_or_reward(
                    text, source_to_mock, source_ports, target
                )
                if repeated.text != text:
                    problems.append(
                        "{}: endpoint rewrite is not at a fixed point".format(
                            relative_display(path)
                        )
                    )
            except legacy.MigrationError as exc:
                problems.append(str(exc))

        task_json_path = task_json_index[task_dir.name]
        task_json_text = prospective_text(task_json_path, changes)
        try:
            legacy.validate_json(task_json_path, task_json_text)
        except legacy.MigrationError as exc:
            problems.append(str(exc))
            continue
        problems.extend(
            endpoint_problems(task_json_path, task_json_text, current, target)
        )
        repeated_json, _ = legacy.rewrite_task_json_urls(
            task_json_text, source_to_mock, target
        )
        if repeated_json != task_json_text:
            problems.append(
                "{}: task JSON endpoint rewrite is not at a fixed point".format(
                    relative_display(task_json_path)
                )
            )
        if check_bridges:
            bridge_path = task_dir / BRIDGE_FILE
            problems.extend(
                bridge_problems(
                    task_dir,
                    task_json_text,
                    target,
                    prospective_text(bridge_path, changes)
                    if bridge_path.is_file()
                    else None,
                )
            )
    return problems


def report_problems(problems: Sequence[str]) -> None:
    if not problems:
        print("[verify] OK — canonical 100-task endpoints and bridge invariants")
        return
    print("[verify] {} problem(s):".format(len(problems)))
    for problem in problems:
        print("    - {}".format(problem))


def write_new_or_existing_atomic(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    mode = path.stat().st_mode if path.exists() else 0o644
    descriptor, temporary_name = tempfile.mkstemp(
        prefix=".{}.".format(path.name), dir=str(path.parent)
    )
    temporary_path = Path(temporary_name)
    try:
        with os.fdopen(descriptor, "w", encoding="utf-8", newline="") as handle:
            handle.write(text)
            handle.flush()
            os.fsync(handle.fileno())
        os.chmod(str(temporary_path), mode)
        os.replace(str(temporary_path), str(path))
    finally:
        try:
            temporary_path.unlink()
        except FileNotFoundError:
            pass


@contextlib.contextmanager
def exclusive_lock(path: Path, timeout: float):
    path.parent.mkdir(parents=True, exist_ok=True)
    handle = path.open("a+")
    deadline = time.monotonic() + timeout
    acquired = False
    try:
        while not acquired:
            try:
                fcntl.flock(handle.fileno(), fcntl.LOCK_EX | fcntl.LOCK_NB)
                acquired = True
            except BlockingIOError:
                if time.monotonic() >= deadline:
                    raise SyncError(
                        "timed out waiting {:.1f}s for {}".format(timeout, path)
                    )
                time.sleep(0.2)
        yield
    finally:
        if acquired:
            fcntl.flock(handle.fileno(), fcntl.LOCK_UN)
        handle.close()


def load_current_mapping(
    applied_map_path: Path,
    target: Mapping[str, legacy.Endpoint],
    allow_missing: bool,
) -> Tuple[Dict[str, legacy.Endpoint], bool]:
    if applied_map_path.is_file():
        return load_mapping(applied_map_path, "--applied-map"), False
    if not allow_missing:
        raise SyncError(
            "applied map is missing: {}. Use --bootstrap-applied only after "
            "the current baseline verifies against the target map.".format(
                applied_map_path
            )
        )
    print(
        "[bootstrap] Applied map is missing; using target map as the assumed "
        "current baseline for read-only verification."
    )
    return dict(target), True


def print_changes(changes: Mapping[Path, legacy.Change], apply: bool) -> None:
    for change in sorted(changes.values(), key=lambda item: str(item.path)):
        print(
            "  {} {} [{}; replacements={}]".format(
                "WRITE" if apply else "WOULD WRITE",
                relative_display(change.path),
                change.reason,
                change.replacements,
            )
        )


def synchronize(args: argparse.Namespace) -> int:
    target_map_path = args.target_map.resolve()
    applied_map_path = args.applied_map.resolve()
    target = load_mapping(target_map_path, "--target-map")
    current, applied_missing = load_current_mapping(
        applied_map_path,
        target,
        allow_missing=(not args.apply or args.bootstrap_applied),
    )
    validate_transition(current, target)
    task_dirs, task_json_index, task_ids = load_scope(
        args.cache_dir.resolve(), args.meta.resolve(), args.examples_dir.resolve()
    )
    print(
        "[scope] {} canonical task IDs; {} cache directories; target endpoints={}".format(
            len(task_ids), len(task_dirs), len(target)
        )
    )

    if args.verify_only:
        problems = verify_scope(
            task_dirs,
            task_json_index,
            current,
            target,
            check_bridges=not args.skip_bridge_check,
        )
        report_problems(problems)
        return 1 if problems else 0

    changes = stage_changes(task_dirs, task_json_index, current, target)
    prospective_problems = verify_scope(
        task_dirs,
        task_json_index,
        current,
        target,
        changes=changes,
        check_bridges=not args.skip_bridge_check,
    )
    report_problems(prospective_problems)
    if prospective_problems:
        raise SyncError("prospective verification failed; no files were written")

    print(
        "[plan] owned-file changes={}; applied-map-missing={}".format(
            len(changes), applied_missing
        )
    )
    print_changes(changes, args.apply)

    if not args.apply:
        if not changes:
            print("[result] Dry-run: endpoint map already synchronized; no file changes.")
        else:
            print(
                "[result] Dry-run only: {} files would change.".format(len(changes))
            )
        return 0

    if applied_missing and not args.bootstrap_applied:
        raise SyncError(
            "--apply requires an existing applied map or --bootstrap-applied"
        )

    for change in sorted(changes.values(), key=lambda item: str(item.path)):
        legacy.atomic_write(change.path, change.updated)

    disk_problems = verify_scope(
        task_dirs,
        task_json_index,
        current,
        target,
        check_bridges=not args.skip_bridge_check,
    )
    report_problems(disk_problems)
    if disk_problems:
        raise SyncError(
            "post-write verification failed; applied map was not updated"
        )

    desired_applied_text = mapping_text(target)
    current_applied_text = (
        applied_map_path.read_text(encoding="utf-8")
        if applied_map_path.is_file()
        else None
    )
    if current_applied_text != desired_applied_text:
        write_new_or_existing_atomic(applied_map_path, desired_applied_text)

    if changes:
        print("[result] Applied {} file changes and updated applied map.".format(len(changes)))
    elif applied_missing:
        print("[result] Baseline verified; applied map bootstrapped with no endpoint changes.")
    else:
        print("[result] Endpoint map already synchronized; no file changes.")
    return 0


def make_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description=(
            "Synchronize the canonical 100-task benchmark to the root "
            ".MOCK_HOST mapping. Default mode is a read-only dry-run."
        )
    )
    parser.add_argument("--target-map", type=Path, default=DEFAULT_TARGET_MAP)
    parser.add_argument("--applied-map", type=Path, default=DEFAULT_APPLIED_MAP)
    parser.add_argument("--meta", type=Path, default=DEFAULT_META)
    parser.add_argument("--cache-dir", type=Path, default=DEFAULT_CACHE_DIR)
    parser.add_argument("--examples-dir", type=Path, default=DEFAULT_EXAMPLES_DIR)
    parser.add_argument(
        "--apply", action="store_true", help="write staged endpoint changes"
    )
    parser.add_argument(
        "--verify-only",
        action="store_true",
        help="verify disk state without staging replacements",
    )
    parser.add_argument(
        "--bootstrap-applied",
        action="store_true",
        help=(
            "allow --apply when the applied map is missing; the current files "
            "must already verify against the target map"
        ),
    )
    parser.add_argument(
        "--skip-bridge-check",
        action="store_true",
        help="skip the read-only direct-bridge network invariant check",
    )
    parser.add_argument("--lock-timeout", type=float, default=300.0)
    return parser


def main(argv: Optional[Sequence[str]] = None) -> int:
    parser = make_parser()
    args = parser.parse_args(argv)
    try:
        if args.apply and args.verify_only:
            raise SyncError("--apply and --verify-only are mutually exclusive")
        if args.bootstrap_applied and not args.apply:
            raise SyncError("--bootstrap-applied requires --apply")
        if args.lock_timeout <= 0:
            raise SyncError("--lock-timeout must be positive")

        if args.apply:
            lock_path = args.cache_dir.resolve() / ".mock_endpoint_remap.lock"
            print("[lock] Waiting for {}".format(lock_path))
            with exclusive_lock(lock_path, args.lock_timeout):
                print("[lock] Acquired")
                return synchronize(args)
        return synchronize(args)
    except (SyncError, legacy.MigrationError, OSError) as exc:
        print("ERROR: {}".format(exc), file=sys.stderr)
        return 2


if __name__ == "__main__":
    sys.exit(main())
