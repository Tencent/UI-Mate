#!/usr/bin/env python3
"""Safely migrate Our Benchmark mock endpoints.

Full migration to the current deployment, run from the mini-osworld root::

    python3 scripts/cua_gym/cua_gym_convert/remap_ours_benchmark_endpoints.py \\
      --host mock-host.example \\
      --meta evaluation_examples/OSWorker/osworker_benchmark_full.json \\
      --check-workers 4 --connect-timeout 8 \\
      --update-direct-bridges --sync-socat-bridges --apply

``--apply`` verifies the result before returning.  To re-check later without
touching anything::

    python3 scripts/cua_gym/cua_gym_convert/remap_ours_benchmark_endpoints.py \\
      --host mock-host.example \\
      --meta evaluation_examples/OSWorker/osworker_benchmark_full.json \\
      --skip-connectivity-check --verify-only

Drop ``--apply`` to preview; the default mode is a dry-run.  Endpoint rewrites
cover ``initial_setup.py``, ``reward.py`` and the mock URLs quoted in
task-config instructions.  Bridge changes are opt-in:

* ``--update-direct-bridges`` updates the host embedded in existing direct-IP
  bridge scripts and any explicit bridge host argument in task JSON.
* ``--sync-socat-bridges`` additionally replaces legacy socat bridge scripts
  with the repository's direct-IP template.

Destination ports can be generated from ``--base-port`` or supplied as an
arbitrary per-mock JSON mapping with ``--endpoint-map``.  ``reward_label.json``
holds LLM annotation metadata that nothing executes, so it is left alone.
"""

import argparse
import concurrent.futures
import json
import math
import os
import re
import shlex
import shutil
import socket
import subprocess
import sys
import tempfile
import threading
import time
from pathlib import Path
from typing import Dict, Iterable, List, Mapping, Match, MutableMapping, NamedTuple, Optional, Sequence, Set, Tuple
from urllib.parse import urlsplit

from remap_cua_gym_ip import MOCK_ENDPOINTS


SCRIPT_PATH = Path(__file__).resolve()
REPO_ROOT = SCRIPT_PATH.parents[3]
DEFAULT_DESTINATION_HOST = os.environ.get("MOCK_APP_HOST") or urlsplit(
    os.environ.get("MOCK_APP_BASE_URL", "")
).hostname or ""

DEFAULT_SOURCE_LAYOUTS = (
    "mock-host.example:8100",
    "old-mock-host.example:8120",
    "mock-host.example:8100",
    "mock-host.example:8100",
    "old-mock-host.example:8120",
)
DEFAULT_SOURCE_ALIASES = (
    "gusto_mock=http://old-mock-host.example:8218",
)
TEXT_FILENAMES = ("initial_setup.py", "reward.py")
DIRECT_MARKER = 'MOCK_HOST="${4:-'
SOCAT_MARKER = "socat TCP-LISTEN"
BRIDGE_FILENAME = "_cua_gym_vm_bridge.sh"
DYNAMIC_SCAN_HOST = "172.17.0.1"


class MigrationError(RuntimeError):
    """A user-actionable validation error."""


class Endpoint(NamedTuple):
    scheme: str
    host: str
    port: int

    @property
    def url(self) -> str:
        return f"{self.scheme}://{self.host}:{self.port}"


class Change(NamedTuple):
    path: Path
    original: str
    updated: str
    reason: str
    replacements: int


class RewriteResult(NamedTuple):
    text: str
    replacements: int
    bare_port_replacements: int


def canonical_mock_names() -> List[str]:
    """Match deploy-all.sh's ``LC_ALL=C sort`` for the ASCII mock names."""
    names = sorted(MOCK_ENDPOINTS, key=lambda value: value.encode("utf-8"))
    if len(names) != len(set(names)):
        raise MigrationError("MOCK_ENDPOINTS contains duplicate mock names")
    return names


def validate_host(host: str, option: str) -> str:
    host = host.strip()
    if not host:
        raise MigrationError(f"{option}: host is empty")
    if any(char.isspace() for char in host) or any(char in host for char in "\"'/:"):
        raise MigrationError(
            f"{option}: unsupported host {host!r}; use an IPv4 address or DNS name"
        )
    return host


def validate_port(port: int, option: str) -> int:
    if not 1 <= port <= 65535:
        raise MigrationError(f"{option}: invalid port {port}")
    return port


def parse_endpoint(value: str, option: str) -> Endpoint:
    parsed = urlsplit(value)
    if parsed.scheme not in {"http", "https"}:
        raise MigrationError(f"{option}: endpoint must use http or https: {value!r}")
    if not parsed.hostname or parsed.port is None:
        raise MigrationError(f"{option}: endpoint must include host and port: {value!r}")
    if parsed.path not in {"", "/"} or parsed.query or parsed.fragment:
        raise MigrationError(f"{option}: endpoint must be a base URL: {value!r}")
    return Endpoint(
        parsed.scheme,
        validate_host(parsed.hostname, option),
        validate_port(parsed.port, option),
    )


def parse_layout(value: str) -> Tuple[str, int]:
    try:
        host, raw_port = value.rsplit(":", 1)
        port = int(raw_port)
    except (ValueError, TypeError) as exc:
        raise MigrationError(
            f"--source-layout must be HOST:BASE_PORT, got {value!r}"
        ) from exc
    return validate_host(host, "--source-layout"), validate_port(
        port, "--source-layout"
    )


def parse_alias(value: str) -> Tuple[str, Endpoint]:
    try:
        mock_name, raw_endpoint = value.split("=", 1)
    except ValueError as exc:
        raise MigrationError(
            f"--source-alias must be MOCK_NAME=http://HOST:PORT, got {value!r}"
        ) from exc
    mock_name = mock_name.strip()
    if mock_name not in MOCK_ENDPOINTS:
        raise MigrationError(f"--source-alias references unknown mock {mock_name!r}")
    return mock_name, parse_endpoint(raw_endpoint.strip(), "--source-alias")


def load_json_object(path: Path, option: str) -> Mapping[str, object]:
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise MigrationError(f"{option}: cannot read JSON {path}: {exc}") from exc
    if not isinstance(value, dict):
        raise MigrationError(f"{option}: expected a JSON object in {path}")
    return value


def build_destination_endpoints(
    args: argparse.Namespace, mock_names: Sequence[str]
) -> Dict[str, Endpoint]:
    if not args.endpoint_map:
        host = validate_host(args.host, "--host")
        base_port = validate_port(args.base_port, "--base-port")
        if base_port + len(mock_names) - 1 > 65535:
            raise MigrationError(
                f"--base-port {base_port} does not leave room for "
                f"{len(mock_names)} consecutive ports"
            )
        endpoints = {
            mock_name: Endpoint(args.scheme, host, base_port + index)
            for index, mock_name in enumerate(mock_names)
        }
    else:
        raw_mapping = load_json_object(args.endpoint_map, "--endpoint-map")
        expected = set(mock_names)
        supplied = set(raw_mapping)
        missing = sorted(expected - supplied)
        extra = sorted(supplied - expected)
        if missing or extra:
            raise MigrationError(
                "--endpoint-map must contain exactly the canonical mock names; "
                f"missing={missing}, extra={extra}"
            )

        host = validate_host(args.host, "--host")
        endpoints = {}
        for mock_name in mock_names:
            raw_value = raw_mapping[mock_name]
            if isinstance(raw_value, int):
                endpoints[mock_name] = Endpoint(
                    args.scheme,
                    host,
                    validate_port(raw_value, f"--endpoint-map[{mock_name}]"),
                )
            elif isinstance(raw_value, str):
                endpoints[mock_name] = parse_endpoint(
                    raw_value, f"--endpoint-map[{mock_name}]"
                )
            else:
                raise MigrationError(
                    f"--endpoint-map[{mock_name}] must be an integer port or URL"
                )

    endpoint_to_mocks: Dict[Endpoint, List[str]] = {}
    for mock_name, endpoint in endpoints.items():
        endpoint_to_mocks.setdefault(endpoint, []).append(mock_name)
    duplicates = {
        endpoint.url: names
        for endpoint, names in endpoint_to_mocks.items()
        if len(names) > 1
    }
    if duplicates:
        raise MigrationError(
            f"destination endpoints must be unique per mock: {duplicates}"
        )
    return endpoints


def register_source_endpoint(
    source_to_mock: MutableMapping[str, str],
    source_ports: MutableMapping[str, Dict[int, str]],
    mock_name: str,
    endpoint: Endpoint,
) -> None:
    for scheme in {"http", "https", endpoint.scheme}:
        source_url = f"{scheme}://{endpoint.host}:{endpoint.port}"
        previous = source_to_mock.get(source_url)
        if previous and previous != mock_name:
            raise MigrationError(
                f"source endpoint {source_url} maps to both {previous} and {mock_name}"
            )
        source_to_mock[source_url] = mock_name

    host_ports = source_ports.setdefault(endpoint.host, {})
    previous = host_ports.get(endpoint.port)
    if previous and previous != mock_name:
        raise MigrationError(
            f"source {endpoint.host}:{endpoint.port} maps to both "
            f"{previous} and {mock_name}"
        )
    host_ports[endpoint.port] = mock_name


def load_source_endpoint_map(
    path: Path,
    source_to_mock: MutableMapping[str, str],
    source_ports: MutableMapping[str, Dict[int, str]],
) -> None:
    raw_mapping = load_json_object(path, "--source-endpoint-map")
    for mock_name, raw_value in raw_mapping.items():
        if mock_name not in MOCK_ENDPOINTS:
            raise MigrationError(
                f"--source-endpoint-map references unknown mock {mock_name!r}"
            )
        values = raw_value if isinstance(raw_value, list) else [raw_value]
        if not values or not all(isinstance(value, str) for value in values):
            raise MigrationError(
                f"--source-endpoint-map[{mock_name}] must be a URL or URL list"
            )
        for value in values:
            register_source_endpoint(
                source_to_mock,
                source_ports,
                mock_name,
                parse_endpoint(value, f"--source-endpoint-map[{mock_name}]"),
            )


def build_source_maps(
    args: argparse.Namespace, mock_names: Sequence[str]
) -> Tuple[Dict[str, str], Dict[str, Dict[int, str]]]:
    source_to_mock: Dict[str, str] = {}
    source_ports: Dict[str, Dict[int, str]] = {}

    raw_layouts: List[str] = []
    raw_aliases: List[str] = []
    if not args.no_default_sources:
        raw_layouts.extend(DEFAULT_SOURCE_LAYOUTS)
        raw_aliases.extend(DEFAULT_SOURCE_ALIASES)
    raw_layouts.extend(args.source_layout or [])
    raw_aliases.extend(args.source_alias or [])

    for raw_layout in raw_layouts:
        host, base_port = parse_layout(raw_layout)
        if base_port + len(mock_names) - 1 > 65535:
            raise MigrationError(
                f"source layout {raw_layout!r} cannot fit {len(mock_names)} mocks"
            )
        for index, mock_name in enumerate(mock_names):
            register_source_endpoint(
                source_to_mock,
                source_ports,
                mock_name,
                Endpoint("http", host, base_port + index),
            )

    for raw_alias in raw_aliases:
        mock_name, endpoint = parse_alias(raw_alias)
        register_source_endpoint(
            source_to_mock, source_ports, mock_name, endpoint
        )

    if args.source_endpoint_map:
        load_source_endpoint_map(
            args.source_endpoint_map, source_to_mock, source_ports
        )

    if not source_to_mock:
        raise MigrationError(
            "no source endpoints configured; add --source-layout or "
            "--source-endpoint-map"
        )
    return source_to_mock, source_ports


def ping_host(host: str, timeout: float) -> Optional[bool]:
    ping_binary = shutil.which("ping")
    if not ping_binary:
        return None
    timeout_seconds = max(1, int(math.ceil(timeout)))
    completed = subprocess.run(
        [ping_binary, "-c", "1", "-W", str(timeout_seconds), host],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        check=False,
    )
    return completed.returncode == 0


class ProbeRateLimiter:
    """Space connection attempts globally, even with multiple worker threads."""

    def __init__(self, interval: float) -> None:
        self.interval = interval
        self.lock = threading.Lock()
        self.next_probe_at = 0.0

    def wait(self) -> None:
        if self.interval <= 0:
            return
        with self.lock:
            now = time.monotonic()
            delay = max(0.0, self.next_probe_at - now)
            self.next_probe_at = max(now, self.next_probe_at) + self.interval
        if delay:
            time.sleep(delay)


def tcp_probe(
    endpoint: Endpoint,
    timeout: float,
    rate_limiter: Optional[ProbeRateLimiter] = None,
) -> Tuple[Endpoint, Optional[str]]:
    if rate_limiter:
        rate_limiter.wait()
    try:
        with socket.create_connection((endpoint.host, endpoint.port), timeout=timeout):
            return endpoint, None
    except OSError as exc:
        return endpoint, str(exc)


def check_connectivity(
    endpoints: Mapping[str, Endpoint],
    timeout: float,
    workers: int,
    allow_unreachable: bool,
    check_interval: float,
) -> None:
    unique_endpoints = sorted(
        set(endpoints.values()), key=lambda endpoint: (endpoint.host, endpoint.port)
    )
    hosts = sorted({endpoint.host for endpoint in unique_endpoints})

    print("[preflight] Connectivity check (before scanning files)")
    ping_results: Dict[str, Optional[bool]] = {}
    for host in hosts:
        result = ping_host(host, timeout)
        ping_results[host] = result
        if result is None:
            print(f"  PING {host}: SKIP (ping command not installed)")
        else:
            print(f"  PING {host}: {'OK' if result else 'FAILED'}")

    failures: List[Tuple[Endpoint, str]] = []

    # Probe one endpoint first. If the route is entirely unavailable, fail in
    # one timeout instead of waiting for all 98 endpoints.
    first_endpoint = unique_endpoints[0]
    _, first_error = tcp_probe(first_endpoint, timeout)
    if first_error:
        failures.append((first_endpoint, first_error))
        print(
            f"  TCP first probe FAILED: {first_endpoint.host}:"
            f"{first_endpoint.port}: {first_error}"
        )
        if not allow_unreachable:
            raise MigrationError(
                "the first destination endpoint is unreachable; deployment "
                "files were not scanned or changed"
            )

    remaining_endpoints = unique_endpoints[1:]
    rate_limiter = ProbeRateLimiter(check_interval)
    print(
        f"  TCP: probing remaining {len(remaining_endpoints)} endpoints "
        f"(workers={workers}, minimum interval={check_interval:.3f}s)"
    )
    with concurrent.futures.ThreadPoolExecutor(max_workers=workers) as executor:
        futures = [
            executor.submit(tcp_probe, endpoint, timeout, rate_limiter)
            for endpoint in remaining_endpoints
        ]
        for future in concurrent.futures.as_completed(futures):
            endpoint, error = future.result()
            if error:
                failures.append((endpoint, error))

    # Some hosts/firewalls reject a fast sweep even though each service is
    # healthy. Cool down, then retry only failures with fewer workers and a
    # stricter global rate limit before declaring the deployment unreachable.
    if failures:
        print(
            f"  TCP: retrying {len(failures)} failed endpoint(s) after cooldown"
        )
        time.sleep(1.0)
        retry_limiter = ProbeRateLimiter(max(check_interval, 0.1))
        retry_failures: List[Tuple[Endpoint, str]] = []
        retry_timeout = min(timeout, 3.0)
        with concurrent.futures.ThreadPoolExecutor(
            max_workers=min(workers, 4)
        ) as executor:
            futures = [
                executor.submit(
                    tcp_probe, endpoint, retry_timeout, retry_limiter
                )
                for endpoint, _ in failures
            ]
            for future in concurrent.futures.as_completed(futures):
                endpoint, error = future.result()
                if error:
                    retry_failures.append((endpoint, error))
        recovered = len(failures) - len(retry_failures)
        if recovered:
            print(f"  TCP: retry recovered {recovered} endpoint(s)")
        failures = retry_failures

    if failures:
        failures.sort(key=lambda item: (item[0].host, item[0].port))
        print(
            f"  TCP: FAILED {len(failures)}/{len(unique_endpoints)} configured endpoints"
        )
        for endpoint, error in failures:
            print(f"    - {endpoint.host}:{endpoint.port}: {error}")
        if not allow_unreachable:
            raise MigrationError(
                "destination connectivity check failed; deployment files were not "
                "scanned or changed. Use --allow-unreachable only if intentional."
            )
        print("  WARNING: continuing because --allow-unreachable was supplied")
    else:
        print(f"  TCP: OK ({len(unique_endpoints)}/{len(unique_endpoints)} endpoints)")

    failed_ping = [host for host, result in ping_results.items() if result is False]
    if failed_ping and not failures:
        print(
            "  NOTE: ICMP ping failed but every configured TCP port is reachable; "
            "the server likely blocks ICMP, so migration may continue."
        )


def load_meta_task_ids(path: Path) -> Set[str]:
    raw_meta = load_json_object(path, "--meta")
    task_ids: Set[str] = set()
    for domain, raw_ids in raw_meta.items():
        if not isinstance(raw_ids, list) or not all(
            isinstance(task_id, str) for task_id in raw_ids
        ):
            raise MigrationError(
                f"--meta: domain {domain!r} must map to a list of task IDs"
            )
        task_ids.update(raw_ids)
    return task_ids


def select_task_dirs(
    cache_dir: Path,
    meta_path: Optional[Path],
    requested_task_ids: Optional[Sequence[str]],
) -> List[Path]:
    if not cache_dir.is_dir():
        raise MigrationError(f"cache directory does not exist: {cache_dir}")

    if meta_path and requested_task_ids:
        raise MigrationError("--meta and --task-id cannot be used together")

    if meta_path:
        selected_ids = load_meta_task_ids(meta_path)
    elif requested_task_ids:
        selected_ids = set(requested_task_ids)
    else:
        selected_ids = set()

    if selected_ids:
        missing = sorted(
            task_id for task_id in selected_ids if not (cache_dir / task_id).is_dir()
        )
        if missing:
            raise MigrationError(
                f"{len(missing)} selected task IDs have no cache directory: {missing}"
            )
        return [cache_dir / task_id for task_id in sorted(selected_ids)]

    return sorted(path for path in cache_dir.iterdir() if path.is_dir())


def single_destination_base(
    endpoints: Mapping[str, Endpoint],
) -> Optional[Tuple[str, str]]:
    bases = {(endpoint.scheme, endpoint.host) for endpoint in endpoints.values()}
    return next(iter(bases)) if len(bases) == 1 else None


def replace_port_number(
    raw_port: str,
    source_port_to_mock: Mapping[int, str],
    destinations: Mapping[str, Endpoint],
) -> str:
    source_port = int(raw_port)
    mock_name = source_port_to_mock.get(source_port)
    if not mock_name:
        return raw_port
    return str(destinations[mock_name].port)


def rewrite_bare_port_constructs(
    text: str,
    source_port_to_mock: Mapping[int, str],
    destinations: Mapping[str, Endpoint],
) -> Tuple[str, int]:
    replacements = 0

    def fstring_callback(match: Match[str]) -> str:
        nonlocal replacements
        old_port = match.group("port")
        new_port = replace_port_number(
            old_port, source_port_to_mock, destinations
        )
        if new_port != old_port:
            replacements += 1
        return f"{match.group('prefix')}{new_port}"

    text = re.sub(
        r"(?P<prefix>\{[A-Za-z_][A-Za-z0-9_]*\}:)"
        r"(?P<port>\d{4,5})\b",
        fstring_callback,
        text,
    )

    def assignment_callback(match: Match[str]) -> str:
        nonlocal replacements
        old_port = match.group("port")
        new_port = replace_port_number(
            old_port, source_port_to_mock, destinations
        )
        if new_port != old_port:
            replacements += 1
        return f"{match.group('prefix')}{new_port}"

    text = re.sub(
        r"(?m)(?P<prefix>^\s*PORT[A-Z0-9_]*\s*=\s*)"
        r"(?P<port>\d{4,5})\b",
        assignment_callback,
        text,
    )

    ports_block_pattern = re.compile(
        r"(?ms)(?P<start>^\s*PORTS\s*=\s*\{)"
        r"(?P<body>.*?)"
        r"(?P<end>^\s*\})"
    )

    def block_callback(match: Match[str]) -> str:
        nonlocal replacements

        def value_callback(value_match: Match[str]) -> str:
            nonlocal replacements
            old_port = value_match.group("port")
            new_port = replace_port_number(
                old_port, source_port_to_mock, destinations
            )
            if new_port != old_port:
                replacements += 1
            return f"{value_match.group('prefix')}{new_port}"

        body = re.sub(
            r"(?P<prefix>:\s*)(?P<port>\d{4,5})\b",
            value_callback,
            match.group("body"),
        )
        return f"{match.group('start')}{body}{match.group('end')}"

    text = ports_block_pattern.sub(block_callback, text)
    return text, replacements


def build_url_replacer(
    source_to_mock: Mapping[str, str], destinations: Mapping[str, Endpoint]
) -> Tuple["re.Pattern", Dict[str, str]]:
    """Longest-first pattern over full ``scheme://host:port`` endpoints."""
    source_to_destination = {
        source_url: destinations[mock_name].url
        for source_url, mock_name in source_to_mock.items()
    }
    ordered_urls = sorted(source_to_destination, key=len, reverse=True)
    pattern = re.compile("|".join(re.escape(url) for url in ordered_urls))
    return pattern, source_to_destination


def rewrite_task_json_urls(
    original: str,
    source_to_mock: Mapping[str, str],
    destinations: Mapping[str, Endpoint],
) -> Tuple[str, int]:
    """Rewrite mock URLs quoted in a task config (``instruction`` included).

    Only full URLs are touched, so a bare host such as the bridge command's
    fourth argument is left to ``update_explicit_bridge_command``.
    """
    pattern, mapping = build_url_replacer(source_to_mock, destinations)
    return pattern.subn(lambda match: mapping[match.group(0)], original)


def rewrite_setup_or_reward(
    original: str,
    source_to_mock: Mapping[str, str],
    source_ports: Mapping[str, Dict[int, str]],
    destinations: Mapping[str, Endpoint],
) -> RewriteResult:
    url_pattern, source_to_destination = build_url_replacer(
        source_to_mock, destinations
    )
    text, endpoint_replacements = url_pattern.subn(
        lambda match: source_to_destination[match.group(0)], original
    )

    bare_hosts: List[str] = []
    for host in source_ports:
        if re.search(
            rf"https?://{re.escape(host)}(?=[\"'])",
            original,
        ):
            bare_hosts.append(host)

    bare_port_replacements = 0
    if bare_hosts:
        destination_base = single_destination_base(destinations)
        if destination_base is None:
            raise MigrationError(
                "cannot rewrite BASE/HOST-style endpoint construction when "
                "--endpoint-map uses multiple destination hosts or schemes"
            )

        combined_port_map: Dict[int, str] = {}
        for host in bare_hosts:
            for port, mock_name in source_ports[host].items():
                previous = combined_port_map.get(port)
                if previous and previous != mock_name:
                    raise MigrationError(
                        f"ambiguous bare source port {port}: {previous} vs {mock_name}"
                    )
                combined_port_map[port] = mock_name

        text, bare_port_replacements = rewrite_bare_port_constructs(
            text, combined_port_map, destinations
        )

    source_hosts_present = [host for host in source_ports if host in text]
    if source_hosts_present:
        destination_base = single_destination_base(destinations)
        if destination_base is None:
            raise MigrationError(
                "source host literals remain outside full URLs, but destination "
                "endpoints use multiple hosts; they cannot be rewritten safely"
            )
        destination_host = destination_base[1]
        host_pattern = re.compile(
            "|".join(
                re.escape(host)
                for host in sorted(source_hosts_present, key=len, reverse=True)
            )
        )
        text, host_replacements = host_pattern.subn(destination_host, text)
    else:
        host_replacements = 0

    return RewriteResult(
        text=text,
        replacements=endpoint_replacements + host_replacements
        + bare_port_replacements,
        bare_port_replacements=bare_port_replacements,
    )


def find_python_validator() -> str:
    """Use a modern parser even when this utility itself runs on Python 3.6."""
    for candidate in (
        "python3.13",
        "python3.12",
        "python3.11",
        "python3.10",
        "python3.9",
        "python3.8",
        sys.executable,
    ):
        resolved = shutil.which(candidate)
        if resolved:
            return resolved
    return sys.executable


PYTHON_VALIDATOR = find_python_validator()


def validate_python(path: Path, text: str) -> None:
    completed = subprocess.run(
        [
            PYTHON_VALIDATOR,
            "-c",
            "import sys; compile(sys.stdin.read(), sys.argv[1], 'exec')",
            str(path),
        ],
        input=text,
        universal_newlines=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        check=False,
    )
    if completed.returncode != 0:
        raise MigrationError(
            f"rewritten Python is invalid: {path}: {completed.stderr.strip()}"
        )


def validate_json(path: Path, text: str) -> None:
    try:
        json.loads(text)
    except json.JSONDecodeError as exc:
        raise MigrationError(f"rewritten JSON is invalid: {path}: {exc}") from exc


def validate_shell(path: Path, text: str) -> None:
    bash = shutil.which("bash")
    if not bash:
        raise MigrationError("bash is required to validate bridge scripts")
    completed = subprocess.run(
        [bash, "-n"],
        input=text,
        universal_newlines=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        check=False,
    )
    if completed.returncode != 0:
        raise MigrationError(
            f"rewritten shell is invalid: {path}: {completed.stderr.strip()}"
        )


def destination_bridge_host(
    destinations: Mapping[str, Endpoint],
) -> str:
    hosts = {endpoint.host for endpoint in destinations.values()}
    if len(hosts) != 1:
        raise MigrationError(
            "bridge updates require every destination endpoint to use one host; "
            f"configured hosts={sorted(hosts)}"
        )
    return next(iter(hosts))


BRIDGE_DEFAULT_RE = re.compile(r'MOCK_HOST="\$\{4:-(?P<host>[^}]+)\}"')
BRIDGE_NETWORK_COMMENT_RE = re.compile(
    r"(?m)(?P<prefix>^# stay bypassed too \().*(?P<suffix>\)\.$)"
)


def bridge_network_description(host: str) -> str:
    octets = host.split(".")
    if len(octets) == 4 and all(
        octet.isdigit() and 0 <= int(octet) <= 255 for octet in octets
    ):
        network = f"{octets[0]}.{octets[1]}.0.0/16"
        return f"{host} -> {network}"
    return f"{host} -> /16 derived only when host is IPv4"


def update_bridge_network_comment(text: str, host: str) -> Tuple[str, int]:
    return BRIDGE_NETWORK_COMMENT_RE.subn(
        lambda match: (
            f"{match.group('prefix')}{bridge_network_description(host)}"
            f"{match.group('suffix')}"
        ),
        text,
    )


def render_direct_template(template: str, destination_host: str) -> str:
    match = BRIDGE_DEFAULT_RE.search(template)
    if not match or SOCAT_MARKER in template:
        raise MigrationError(
            "direct bridge template is missing MOCK_HOST default or still uses socat"
        )
    old_host = match.group("host")
    rendered = template.replace(old_host, destination_host)
    rendered, _ = update_bridge_network_comment(rendered, destination_host)
    return rendered


def update_direct_bridge(
    original: str,
    destination_host: str,
    source_hosts: Iterable[str],
) -> Tuple[str, int]:
    match = BRIDGE_DEFAULT_RE.search(original)
    if not match:
        raise MigrationError("direct bridge is missing its MOCK_HOST default")

    hosts_to_replace = set(source_hosts)
    hosts_to_replace.add(match.group("host"))
    hosts_to_replace.discard(destination_host)
    if not hosts_to_replace:
        return original, 0

    pattern = re.compile(
        "|".join(
            re.escape(host) for host in sorted(hosts_to_replace, key=len, reverse=True)
        )
    )
    updated, replacements = pattern.subn(destination_host, original)
    updated, comment_replacements = update_bridge_network_comment(
        updated, destination_host
    )
    return updated, replacements + comment_replacements


def build_task_json_index(examples_dir: Path) -> Dict[str, Path]:
    if not examples_dir.is_dir():
        raise MigrationError(f"examples directory does not exist: {examples_dir}")

    index: Dict[str, Path] = {}
    for path in examples_dir.rglob("*.json"):
        try:
            value = json.loads(path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            continue
        if not isinstance(value, dict) or not isinstance(value.get("id"), str):
            continue
        task_id = value["id"]
        previous = index.get(task_id)
        if previous and previous != path:
            raise MigrationError(
                f"duplicate task id {task_id!r} in {previous} and {path}"
            )
        index[task_id] = path
    return index


def bridge_commands(task_json: Mapping[str, object]) -> List[str]:
    commands: List[str] = []
    config = task_json.get("config")
    if not isinstance(config, list):
        return commands
    for step in config:
        if not isinstance(step, dict) or step.get("type") != "execute":
            continue
        parameters = step.get("parameters")
        if not isinstance(parameters, dict):
            continue
        command = parameters.get("command")
        if isinstance(command, str) and BRIDGE_FILENAME in command:
            commands.append(command)
    return commands


def update_explicit_bridge_command(
    path: Path,
    original: str,
    destination_host: str,
    source_hosts: Set[str],
) -> Tuple[str, int]:
    try:
        parsed = json.loads(original)
    except json.JSONDecodeError as exc:
        raise MigrationError(f"invalid task JSON {path}: {exc}") from exc
    if not isinstance(parsed, dict):
        return original, 0

    text = original
    replacements = 0
    for command in bridge_commands(parsed):
        try:
            tokens = shlex.split(command)
        except ValueError as exc:
            raise MigrationError(f"cannot parse bridge command in {path}: {exc}") from exc
        if len(tokens) < 6:
            continue
        explicit_host = tokens[-1]
        if explicit_host == destination_host:
            continue
        if explicit_host not in source_hosts:
            print(
                f"  WARNING: {path} has unrecognized explicit bridge host "
                f"{explicit_host!r}; leaving it unchanged"
            )
            continue
        new_command = command[: command.rfind(explicit_host)] + destination_host
        if text.count(command) != 1:
            raise MigrationError(
                f"expected one exact bridge command occurrence in {path}"
            )
        text = text.replace(command, new_command, 1)
        replacements += 1

    if replacements:
        try:
            json.loads(text)
        except json.JSONDecodeError as exc:
            raise MigrationError(
                f"bridge command rewrite produced invalid JSON {path}: {exc}"
            ) from exc
    return text, replacements


def stage_change(
    changes: MutableMapping[Path, Change],
    path: Path,
    original: str,
    updated: str,
    reason: str,
    replacements: int,
) -> None:
    if original == updated:
        return
    if path in changes:
        raise MigrationError(f"internal error: staged {path} more than once")
    changes[path] = Change(path, original, updated, reason, replacements)


def atomic_write(path: Path, text: str) -> None:
    mode = path.stat().st_mode
    descriptor, temporary_name = tempfile.mkstemp(
        prefix=f".{path.name}.", dir=path.parent
    )
    temporary_path = Path(temporary_name)
    try:
        with os.fdopen(descriptor, "w", encoding="utf-8", newline="") as handle:
            handle.write(text)
            handle.flush()
            os.fsync(handle.fileno())
        os.chmod(temporary_path, mode)
        os.replace(temporary_path, path)
    finally:
        try:
            temporary_path.unlink()
        except FileNotFoundError:
            pass


def relative_display(path: Path) -> str:
    try:
        return str(path.resolve().relative_to(REPO_ROOT))
    except ValueError:
        return str(path)


def verify_migration(
    task_dirs: Sequence[Path],
    task_json_index: Mapping[str, Path],
    source_hosts: Set[str],
    destinations: Mapping[str, Endpoint],
) -> List[str]:
    """Check every file this tool owns against the configured deployment.

    Scope is deliberately the same set the migration writes: each task's
    authoritative config plus its setup/reward/bridge. ``reward_label.json``
    and the task-config copies inside the cache are annotation/leftovers that
    nothing loads at runtime, so stale hosts there are not failures.
    """
    problems: List[str] = []

    destination_hosts = {endpoint.host for endpoint in destinations.values()}
    stale_hosts = sorted(source_hosts - destination_hosts, key=len, reverse=True)
    stale_pattern = (
        re.compile("|".join(re.escape(host) for host in stale_hosts))
        if stale_hosts
        else None
    )

    allowed_ports: Dict[str, Set[int]] = {}
    for endpoint in destinations.values():
        allowed_ports.setdefault(endpoint.host, set()).add(endpoint.port)
    # 4-5 digits keeps documentation placeholders such as ":81xx" from matching.
    port_patterns = {
        host: re.compile(re.escape(host) + r":(\d{4,5})") for host in allowed_ports
    }

    for task_dir in task_dirs:
        scanned = [task_dir / name for name in TEXT_FILENAMES]
        scanned.append(task_dir / BRIDGE_FILENAME)
        config_path = task_json_index.get(task_dir.name)
        if config_path:
            scanned.append(config_path)

        targets_destination = False
        for path in scanned:
            if not path.is_file():
                continue
            text = path.read_text(encoding="utf-8", errors="replace")
            if stale_pattern:
                found = sorted(set(stale_pattern.findall(text)))
                if found:
                    problems.append(
                        f"{relative_display(path)}: still references "
                        + ", ".join(found)
                    )
            for host, pattern in port_patterns.items():
                for match in pattern.finditer(text):
                    targets_destination = True
                    port = int(match.group(1))
                    if port not in allowed_ports[host]:
                        problems.append(
                            f"{relative_display(path)}: {host}:{port} is not one "
                            "of the configured destination ports"
                        )

        bridge_path = task_dir / BRIDGE_FILENAME
        if targets_destination and bridge_path.is_file():
            bridge_text = bridge_path.read_text(encoding="utf-8", errors="replace")
            if SOCAT_MARKER in bridge_text:
                problems.append(
                    f"{relative_display(bridge_path)}: still a socat bridge while "
                    "the task targets the direct-IP deployment"
                )

    return problems


def report_verification(problems: Sequence[str]) -> None:
    if not problems:
        print("[verify] OK — every task config, setup, reward and bridge in scope")
        return
    print(f"[verify] {len(problems)} problem(s):")
    for problem in problems:
        print(f"    {problem}")


def make_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description=(
            "Remap Our Benchmark setup/reward mock endpoints. Default: dry-run."
        ),
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""Examples:
  # Preview the default mock-host.example:8100-8197 migration.
  python scripts/cua_gym/cua_gym_convert/remap_ours_benchmark_endpoints.py

  # Apply setup/reward changes and update existing direct bridge hosts.
  python scripts/cua_gym/cua_gym_convert/remap_ours_benchmark_endpoints.py \\
      --apply --update-direct-bridges

  # Also replace legacy socat bridges with the direct-IP template.
  python scripts/cua_gym/cua_gym_convert/remap_ours_benchmark_endpoints.py \\
      --apply --update-direct-bridges --sync-socat-bridges

  # Convert one socat task first for a guest-network smoke test.
  python scripts/cua_gym/cua_gym_convert/remap_ours_benchmark_endpoints.py \\
      --task-id 054e615f-1839-53e0-9ff5-c49b63297ce0 \\
      --apply --sync-socat-bridges

  # Different host and consecutive port range.
  python scripts/cua_gym/cua_gym_convert/remap_ours_benchmark_endpoints.py \\
      --host 10.20.30.40 --base-port 9000

  # Arbitrary per-app ports/hosts.
  python scripts/cua_gym/cua_gym_convert/remap_ours_benchmark_endpoints.py \\
      --endpoint-map /path/to/endpoints.json
""",
    )
    parser.add_argument(
        "--host",
        default=DEFAULT_DESTINATION_HOST,
        help="destination host (default: MOCK_APP_HOST or MOCK_APP_BASE_URL)",
    )
    parser.add_argument(
        "--base-port",
        type=int,
        default=8100,
        help="first destination port in canonical mock-name order",
    )
    parser.add_argument(
        "--scheme", choices=("http", "https"), default="http"
    )
    parser.add_argument(
        "--endpoint-map",
        type=Path,
        help=(
            "JSON object: mock name -> integer port or full base URL; "
            "overrides --base-port"
        ),
    )
    parser.add_argument(
        "--source-layout",
        action="append",
        help="additional old deployment as HOST:BASE_PORT (repeatable)",
    )
    parser.add_argument(
        "--source-alias",
        action="append",
        help="additional old endpoint as MOCK_NAME=http://HOST:PORT (repeatable)",
    )
    parser.add_argument(
        "--source-endpoint-map",
        type=Path,
        help="JSON object: mock name -> old URL or list of old URLs",
    )
    parser.add_argument(
        "--no-default-sources",
        action="store_true",
        help="disable the built-in historical source layouts and Gusto alias",
    )
    parser.add_argument(
        "--cache-dir", type=Path, default=REPO_ROOT / "osworker_cache"
    )
    parser.add_argument(
        "--examples-dir",
        type=Path,
        default=REPO_ROOT / "evaluation_examples/OSWorker" / "examples",
    )
    parser.add_argument(
        "--meta",
        type=Path,
        help="optional domain->task IDs JSON; restrict changes to those task IDs",
    )
    parser.add_argument(
        "--task-id",
        action="append",
        help=(
            "restrict changes to one task ID (repeatable); useful for a bridge "
            "smoke test and mutually exclusive with --meta"
        ),
    )
    parser.add_argument(
        "--direct-bridge-template",
        type=Path,
        default=SCRIPT_PATH.with_name(BRIDGE_FILENAME),
    )
    parser.add_argument(
        "--update-direct-bridges",
        action="store_true",
        help=(
            "update existing direct-IP bridge defaults and explicit task JSON "
            "bridge host arguments"
        ),
    )
    parser.add_argument(
        "--sync-socat-bridges",
        action="store_true",
        help=(
            "replace selected legacy socat bridges with the direct-IP template; "
            "implies --update-direct-bridges"
        ),
    )
    parser.add_argument(
        "--skip-connectivity-check",
        action="store_true",
        help="skip initial ICMP and TCP checks (intended for offline dry-runs/tests)",
    )
    parser.add_argument(
        "--allow-unreachable",
        action="store_true",
        help="continue when destination TCP checks fail",
    )
    parser.add_argument("--connect-timeout", type=float, default=2.0)
    parser.add_argument("--check-workers", type=int, default=32)
    parser.add_argument(
        "--check-interval",
        type=float,
        default=0.05,
        help="minimum seconds between TCP probe starts (default: 0.05)",
    )
    parser.add_argument(
        "--apply",
        action="store_true",
        help="write staged changes; without this flag the script is a dry-run",
    )
    parser.add_argument(
        "--verify-only",
        action="store_true",
        help="only check the current state against the configured deployment",
    )
    return parser


def main(argv: Optional[Sequence[str]] = None) -> int:
    parser = make_parser()
    args = parser.parse_args(argv)
    try:
        if args.connect_timeout <= 0:
            raise MigrationError("--connect-timeout must be positive")
        if args.check_workers <= 0:
            raise MigrationError("--check-workers must be positive")
        if args.check_interval < 0:
            raise MigrationError("--check-interval cannot be negative")

        mock_names = canonical_mock_names()
        destinations = build_destination_endpoints(args, mock_names)
        source_to_mock, source_ports = build_source_maps(args, mock_names)

        # Deliberately run before scanning any migration target.
        if args.skip_connectivity_check:
            print("[preflight] Connectivity check: SKIPPED")
        else:
            check_connectivity(
                destinations,
                args.connect_timeout,
                args.check_workers,
                args.allow_unreachable,
                args.check_interval,
            )

        task_dirs = select_task_dirs(
            args.cache_dir.resolve(), args.meta, args.task_id
        )
        task_json_index = build_task_json_index(args.examples_dir.resolve())
        print(
            f"[scope] {len(task_dirs)} cache task directories; "
            f"destination endpoints={len(destinations)}"
        )

        if args.verify_only:
            problems = verify_migration(
                task_dirs, task_json_index, set(source_ports), destinations
            )
            report_verification(problems)
            return 1 if problems else 0

        changes: Dict[Path, Change] = {}
        endpoint_task_count = 0
        bare_file_count = 0
        dynamic_scan_tasks: Set[str] = set()
        for task_dir in task_dirs:
            task_changed = False
            for filename in TEXT_FILENAMES:
                path = task_dir / filename
                if not path.is_file():
                    continue
                original = path.read_text(encoding="utf-8")
                if DYNAMIC_SCAN_HOST in original and "PORT_SCAN_" in original:
                    dynamic_scan_tasks.add(task_dir.name)
                result = rewrite_setup_or_reward(
                    original, source_to_mock, source_ports, destinations
                )
                if result.text != original:
                    validate_python(path, result.text)
                    stage_change(
                        changes,
                        path,
                        original,
                        result.text,
                        "mock endpoint rewrite",
                        result.replacements,
                    )
                    task_changed = True
                    if result.bare_port_replacements:
                        bare_file_count += 1
            if task_changed:
                endpoint_task_count += 1

        update_direct = args.update_direct_bridges or args.sync_socat_bridges
        direct_count = 0
        socat_count = 0
        direct_task_ids: Set[str] = set()
        source_hosts = set(source_ports)
        bridge_host = destination_bridge_host(destinations) if update_direct else ""
        if update_direct:
            template_text = args.direct_bridge_template.read_text(encoding="utf-8")
            rendered_template = render_direct_template(template_text, bridge_host)
            validate_shell(args.direct_bridge_template, rendered_template)

            for task_dir in task_dirs:
                bridge_path = task_dir / BRIDGE_FILENAME
                if not bridge_path.is_file():
                    continue
                original = bridge_path.read_text(encoding="utf-8")
                if DIRECT_MARKER in original:
                    updated, replacements = update_direct_bridge(
                        original, bridge_host, source_hosts
                    )
                    if updated != original:
                        validate_shell(bridge_path, updated)
                        stage_change(
                            changes,
                            bridge_path,
                            original,
                            updated,
                            "direct bridge host update",
                            replacements,
                        )
                    direct_count += 1
                    direct_task_ids.add(task_dir.name)
                elif SOCAT_MARKER in original and args.sync_socat_bridges:
                    validate_shell(bridge_path, rendered_template)
                    stage_change(
                        changes,
                        bridge_path,
                        original,
                        rendered_template,
                        "socat -> direct-IP bridge",
                        1,
                    )
                    socat_count += 1
                    direct_task_ids.add(task_dir.name)

        # Task configs carry mock URLs in their instruction text, which the
        # agent reads, and optionally the bridge host argument. Both live in the
        # same file, so they are rewritten together to keep one staged change.
        instruction_file_count = 0
        for task_dir in task_dirs:
            path = task_json_index.get(task_dir.name)
            if not path:
                continue
            original = path.read_text(encoding="utf-8")
            updated, url_replacements = rewrite_task_json_urls(
                original, source_to_mock, destinations
            )
            bridge_replacements = 0
            if update_direct and task_dir.name in direct_task_ids:
                updated, bridge_replacements = update_explicit_bridge_command(
                    path, updated, bridge_host, source_hosts
                )
            if updated == original:
                continue
            validate_json(path, updated)
            reasons = []
            if url_replacements:
                reasons.append("mock URLs")
                instruction_file_count += 1
            if bridge_replacements:
                reasons.append("bridge host argument")
            stage_change(
                changes,
                path,
                original,
                updated,
                "task config " + " + ".join(reasons),
                url_replacements + bridge_replacements,
            )

        print(
            f"[plan] endpoint tasks={endpoint_task_count}; "
            f"BASE/HOST-style files={bare_file_count}; "
            f"task configs with mock URLs={instruction_file_count}; "
            f"direct bridges inspected={direct_count}; "
            f"socat bridges to sync={socat_count}; "
            f"dynamic port-scan tasks untouched={len(dynamic_scan_tasks)}"
        )
        if dynamic_scan_tasks:
            print(
                "[note] Dynamic 172.17.0.1 port-scan task(s) were intentionally "
                f"left unchanged: {sorted(dynamic_scan_tasks)}"
            )
        if endpoint_task_count and not update_direct:
            print(
                "[warning] Bridge files are not being changed. If the VM uses an "
                "HTTP proxy, the new direct host may require "
                "--update-direct-bridges; legacy socat tasks may additionally "
                "require --sync-socat-bridges."
            )
        if args.sync_socat_bridges:
            print(
                "[warning] Host-side ping/TCP success does not prove direct "
                "reachability from inside the QEMU guest. Dry-run first and "
                "smoke-test one converted task before a full benchmark."
            )

        for change in sorted(changes.values(), key=lambda item: str(item.path)):
            print(
                f"  {'WRITE' if args.apply else 'WOULD WRITE'} "
                f"{relative_display(change.path)} "
                f"[{change.reason}; replacements={change.replacements}]"
            )

        if not changes:
            print("[result] No changes needed.")
        elif args.apply:
            for change in sorted(changes.values(), key=lambda item: str(item.path)):
                atomic_write(change.path, change.updated)
            print(f"[result] Applied {len(changes)} file changes.")
        else:
            print(
                f"[result] Dry-run only: {len(changes)} files would change. "
                "Re-run with --apply to write them."
            )
            return 0

        # Verifying a dry-run would just describe the pre-migration state, so
        # this runs only once the files on disk are meant to be final.
        problems = verify_migration(
            task_dirs, task_json_index, set(source_ports), destinations
        )
        report_verification(problems)
        return 1 if problems else 0
    except (MigrationError, OSError) as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    sys.exit(main())
