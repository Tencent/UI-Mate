"""
Shared Utilities

Logging setup, result tracking, and other common utilities.
Extracted from duplicated code across run scripts.
"""

import datetime
import logging
import os
import shutil
import sys
from typing import Dict, List, Optional, Any


class ImageDataFilter(logging.Filter):
    """
    Filter log records that contain large base64 image data.
    Prevents debug logs from being bloated by image payloads
    (e.g. from openai/httpx HTTP request/response bodies).
    """

    IMAGE_INDICATORS = [
        'data:image',
        'ivborw0kggo',     # PNG base64 beginning (lowercase for comparison)
        '/9j/',            # JPEG base64 beginning
        'r0lgod',          # GIF base64 beginning
        'ukligr',          # WEBP base64 beginning
    ]

    def filter(self, record):
        try:
            if hasattr(record, 'msg') and record.msg:
                msg_str = str(record.msg)
                if len(msg_str) > 5000:
                    msg_lower = msg_str.lower()
                    if any(ind in msg_lower for ind in self.IMAGE_INDICATORS):
                        record.msg = (
                            f"[Filtered] Log contains image data "
                            f"(size: {len(msg_str)} chars) - truncated"
                        )
                        record.args = ()
            if hasattr(record, 'args') and record.args:
                new_args = []
                for arg in record.args:
                    if isinstance(arg, str) and len(arg) > 5000:
                        arg_lower = arg.lower()
                        if any(ind in arg_lower for ind in self.IMAGE_INDICATORS):
                            new_args.append(
                                f"[Filtered image data, size: {len(arg)} chars]"
                            )
                            continue
                    new_args.append(arg)
                record.args = tuple(new_args)
        except Exception:
            pass
        return True


def setup_logging(log_level: str = "INFO", log_dir: str = "logs") -> None:
    """
    Setup logging with standard configuration.

    Creates file handlers for normal, debug, and sdebug logs,
    plus a stdout handler for console output.

    Args:
        log_level: Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        log_dir: Directory to store log files
    """
    logger = logging.getLogger()
    level = getattr(logging, log_level.upper())
    logger.setLevel(logging.DEBUG)  # Capture all, filter at handler level

    datetime_str = datetime.datetime.now().strftime("%Y%m%d@%H%M%S")

    os.makedirs(log_dir, exist_ok=True)

    # File handlers
    file_handler = logging.FileHandler(
        os.path.join(log_dir, f"normal-{datetime_str}.log"), encoding="utf-8"
    )
    debug_handler = logging.FileHandler(
        os.path.join(log_dir, f"debug-{datetime_str}.log"), encoding="utf-8"
    )
    sdebug_handler = logging.FileHandler(
        os.path.join(log_dir, f"sdebug-{datetime_str}.log"), encoding="utf-8"
    )
    stdout_handler = logging.StreamHandler(sys.stdout)

    # Set levels
    file_handler.setLevel(logging.INFO)
    debug_handler.setLevel(logging.DEBUG)
    sdebug_handler.setLevel(logging.DEBUG)
    stdout_handler.setLevel(level)

    # Formatter with colors
    formatter = logging.Formatter(
        fmt="\x1b[1;33m[%(asctime)s \x1b[31m%(levelname)s "
        "\x1b[32m%(module)s/%(lineno)d-%(processName)s\x1b[1;33m] \x1b[0m%(message)s"
    )
    plain_formatter = logging.Formatter(
        fmt="[%(asctime)s %(levelname)s %(module)s/%(lineno)d-%(processName)s] %(message)s"
    )

    file_handler.setFormatter(plain_formatter)
    debug_handler.setFormatter(plain_formatter)
    sdebug_handler.setFormatter(plain_formatter)
    stdout_handler.setFormatter(formatter)

    # Add filter for stdout to only show desktopenv messages
    class DesktopEnvFilter(logging.Filter):
        def filter(self, record):
            return record.name.startswith("desktopenv") or record.name == "root"

    stdout_handler.addFilter(DesktopEnvFilter())

    # Filter image data from debug logs to prevent bloated log files
    if os.getenv('KEEP_IMAGE_LOGS', 'false').lower() != 'true':
        image_filter = ImageDataFilter()
        debug_handler.addFilter(image_filter)
        sdebug_handler.addFilter(image_filter)

    # Suppress verbose third-party library debug logs (openai/httpx dump
    # full HTTP bodies including base64 images at DEBUG level)
    for lib_name in ('openai', 'httpx', 'httpcore'):
        logging.getLogger(lib_name).setLevel(logging.WARNING)

    # Add handlers
    logger.addHandler(file_handler)
    logger.addHandler(debug_handler)
    logger.addHandler(sdebug_handler)
    logger.addHandler(stdout_handler)


def get_unfinished_tasks(
    action_space: str,
    model: str,
    observation_type: str,
    result_dir: str,
    total_file_json: Dict[str, List[str]],
) -> Dict[str, List[str]]:
    """
    Get tasks that haven't been completed yet.

    Scans the result directory and removes completed tasks from the
    input task list. Also cleans up incomplete runs (no result.txt).

    Args:
        action_space: Action space type
        model: Model name
        observation_type: Observation type
        result_dir: Base result directory
        total_file_json: Dict mapping domain -> list of example IDs

    Returns:
        Dict with only unfinished tasks
    """
    target_dir = os.path.join(result_dir, action_space, observation_type, model)

    if not os.path.exists(target_dir):
        return total_file_json

    finished: Dict[str, List[str]] = {}

    for domain in os.listdir(target_dir):
        domain_path = os.path.join(target_dir, domain)
        if not os.path.isdir(domain_path):
            continue

        finished[domain] = []

        for example_id in os.listdir(domain_path):
            if example_id == "onboard":
                continue

            example_path = os.path.join(domain_path, example_id)
            if not os.path.isdir(example_path):
                continue

            result_file = os.path.join(example_path, "result.txt")
            if not os.path.exists(result_file):
                # Clean up incomplete run
                _cleanup_incomplete_run(example_path)
            else:
                finished[domain].append(example_id)

    if not finished:
        return total_file_json

    # Filter out finished tasks
    result = {}
    for domain, examples in total_file_json.items():
        finished_examples = finished.get(domain, [])
        remaining = [x for x in examples if x not in finished_examples]
        if remaining:
            result[domain] = remaining

    return result


def _cleanup_incomplete_run(example_path: str) -> None:
    """Clean up an incomplete run directory."""
    try:
        for file in os.listdir(example_path):
            file_path = os.path.join(example_path, file)
            if os.path.isdir(file_path):
                shutil.rmtree(file_path)
            else:
                os.remove(file_path)
    except Exception as e:
        logging.getLogger("desktopenv.utils").warning(
            f"Failed to cleanup {example_path}: {e}"
        )


def get_current_results(
    action_space: str,
    model: str,
    observation_type: str,
    result_dir: str,
) -> Optional[Dict[str, Any]]:
    """
    Get current results and print summary statistics.

    Args:
        action_space: Action space type
        model: Model name
        observation_type: Observation type
        result_dir: Base result directory

    Returns:
        Dict with results summary, or None if no results exist
    """
    target_dir = os.path.join(result_dir, action_space, observation_type, model)

    if not os.path.exists(target_dir):
        print("New experiment, no results yet.")
        return None

    all_results: List[float] = []
    domain_results: Dict[str, List[float]] = {}

    for domain in os.listdir(target_dir):
        domain_path = os.path.join(target_dir, domain)
        if not os.path.isdir(domain_path):
            continue

        domain_results[domain] = []

        for example_id in os.listdir(domain_path):
            example_path = os.path.join(domain_path, example_id)
            if not os.path.isdir(example_path):
                continue

            result_file = os.path.join(example_path, "result.txt")
            if os.path.exists(result_file):
                try:
                    with open(result_file, "r") as f:
                        score = float(f.read().strip())
                        all_results.append(score)
                        domain_results[domain].append(score)
                except (ValueError, IOError):
                    all_results.append(0.0)
                    domain_results[domain].append(0.0)

    if not all_results:
        print("New experiment, no results yet.")
        return None

    # Calculate statistics
    success_rate = sum(all_results) / len(all_results) * 100
    print(f"\n{'='*60}")
    print(f"Current Results: {len(all_results)} tasks completed")
    print(f"Overall Success Rate: {success_rate:.2f}%")
    print(f"{'='*60}")

    # Per-domain breakdown
    for domain, scores in sorted(domain_results.items()):
        if scores:
            domain_rate = sum(scores) / len(scores) * 100
            print(f"  {domain}: {domain_rate:.2f}% ({len(scores)} tasks)")

    print(f"{'='*60}\n")

    return {
        "total_tasks": len(all_results),
        "success_rate": success_rate,
        "domain_results": domain_results,
    }


def build_result_dir(
    base_dir: str,
    action_space: str,
    observation_type: str,
    model: str,
    domain: str,
    example_id: str,
) -> str:
    """
    Build the result directory path for a specific task.

    Args:
        base_dir: Base result directory
        action_space: Action space type
        observation_type: Observation type
        model: Model name
        domain: Task domain
        example_id: Task example ID

    Returns:
        Full path to the result directory
    """
    return os.path.join(
        base_dir,
        action_space,
        observation_type,
        model,
        domain,
        example_id,
    )


def ensure_dir(path: str) -> str:
    """
    Ensure a directory exists, creating it if necessary.

    Args:
        path: Directory path

    Returns:
        The same path (for chaining)
    """
    os.makedirs(path, exist_ok=True)
    return path
