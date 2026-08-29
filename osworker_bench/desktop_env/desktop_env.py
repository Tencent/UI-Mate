from __future__ import annotations

import logging
import os
import time
import re
from typing import Callable, Any, Optional, Tuple
from typing import List, Dict, Union

import gymnasium as gym
import requests

from desktop_env.controllers.python import PythonController
from desktop_env.controllers.setup import SetupController
from desktop_env.evaluators import metrics, getters
from desktop_env.evaluators import eval_dump as _eval_dump
from desktop_env.evaluators.artifacts import artifacts_enabled, save_evaluator_artifacts
from desktop_env.evaluators.results import EvalResult, MetricRecord
from desktop_env.exceptions import ScreenshotUnavailableError
from desktop_env.providers import create_vm_manager_and_provider

logger = logging.getLogger("desktopenv.env")

Metric = Callable[[Any, Any], float]
Getter = Callable[[gym.Env, Dict[str, Any]], Any]

MAX_RETRIES = 5 # Maximum retries for environment setup



def _fix_pyautogui_less_than_bug(command: str) -> str:
    """
    Fix PyAutoGUI '<' character bug by converting it to hotkey("shift", ',') calls.
    
    This fixes the known PyAutoGUI issue where typing '<' produces '>' instead.
    References:
    - https://github.com/asweigart/pyautogui/issues/198
    - https://github.com/xlang-ai/OSWorld/issues/257
    
    Args:
        command (str): The original pyautogui command
        
    Returns:
        str: The fixed command with '<' characters handled properly
    """
    # Pattern to match press('<') or press('\u003c') calls  
    press_pattern = r'pyautogui\.press\(["\'](?:<|\\u003c)["\']\)'

    # Handle press('<') calls
    def replace_press_less_than(match):
        return 'pyautogui.hotkey("shift", ",")'
    
    # First handle press('<') calls
    command = re.sub(press_pattern, replace_press_less_than, command)

    # Pattern to match typewrite calls with quoted strings
    typewrite_pattern = r'pyautogui\.typewrite\((["\'])(.*?)\1\)'
    
    # Then handle typewrite calls
    def process_typewrite_match(match):
        quote_char = match.group(1)
        content = match.group(2)
        
        # Preprocess: Try to decode Unicode escapes like \u003c to actual '<'
        # This handles cases where '<' is represented as escaped Unicode
        try:
            # Attempt to decode unicode escapes
            decoded_content = content.encode('utf-8').decode('unicode_escape')
            content = decoded_content
        except UnicodeDecodeError:
            # If decoding fails, proceed with original content to avoid breaking existing logic
            pass  # English comment: Graceful degradation - fall back to original content if decoding fails
        
        # Check if content contains '<'
        if '<' not in content:
            return match.group(0)
        
        # Split by '<' and rebuild
        parts = content.split('<')
        result_parts = []
        
        for i, part in enumerate(parts):
            if i == 0:
                # First part
                if part:
                    result_parts.append(f"pyautogui.typewrite({quote_char}{part}{quote_char})")
            else:
                # Add hotkey for '<' and then typewrite for the rest
                result_parts.append('pyautogui.hotkey("shift", ",")')
                if part:
                    result_parts.append(f"pyautogui.typewrite({quote_char}{part}{quote_char})")
        
        return '; '.join(result_parts)
    
    command = re.sub(typewrite_pattern, process_typewrite_match, command)
    
    return command


class DesktopEnv(gym.Env):
    """
    DesktopEnv with OpenAI Gym interface. It provides a desktop environment for setting and evaluating desktop automation tasks.
    """

    # Namespaces used to resolve Ubuntu evaluator names.
    evaluator_metrics = metrics
    evaluator_getters = getters

    def __init__(
            self,
            provider_name: str = "docker",
            region: str = None,
            path_to_vm: str = None,
            snapshot_name: str = "init_state",
            action_space: str = "pyautogui",
            cache_dir: str = "cache",
            screen_size: Tuple[int] = (int(os.environ.get("SCREEN_WIDTH", 1920)), int(os.environ.get("SCREEN_HEIGHT", 1080))),
            headless: bool = False,
            os_type: str = "Ubuntu",
            enable_proxy: bool = False,
            client_password: str = "",
            force_proxy: bool = False,
    ):
        """
        Args:
            provider_name (str): virtualization provider name; this release supports Docker
            region (str): provider region label retained for interface compatibility
            path_to_vm (str): path to .vmx file
            snapshot_name (str): snapshot name to revert to, default to "init_state"
            action_space (str): "pyautogui"
            cache_dir (str): cache directory to cache task-related stuffs like
              reference file for evaluation
            screen_size (Tuple[int]): screen size of the VM
            headless (bool): whether to run the VM in headless mode
            os_type (str): operating system type, default to "Ubuntu"
            enable_proxy (bool): whether to enable proxy support, default to False
            force_proxy (bool): apply the configured proxy to every task
        """
        # Initialize VM manager and vitualization provider
        self.region = region
        self.provider_name = provider_name
        self.force_proxy = force_proxy
        self.enable_proxy = enable_proxy  # Store proxy enablement setting
        self.client_password = client_password or "password"

        self.screen_width = screen_size[0]
        self.screen_height = screen_size[1]

        # Default 
        self.server_port = 5000
        self.chromium_port = 9222
        self.vnc_port = 8006
        self.vlc_port = 8080
        
        # Initialize with default (no proxy) provider
        self.current_use_proxy = False
        self.manager, self.provider = create_vm_manager_and_provider(provider_name, region)

        self.os_type = os_type

        self.is_environment_used = False

        # Initialize environment variables
        if path_to_vm:
            self.path_to_vm = path_to_vm
        else:
            self.path_to_vm = self.manager.get_vm_path(os_type=self.os_type, region=region, screen_size=(self.screen_width, self.screen_height))
        
        self.snapshot_name = snapshot_name
        self.cache_dir_base: str = cache_dir
        # todo: add the logic to get the screen size from the VM
        self.headless = headless

        # Initialize emulator and controller
        logger.info("Initializing...")
        self._start_emulator()

        self.instruction = None
        if action_space != "pyautogui":
            raise ValueError("This release supports only the pyautogui action space.")
        self.action_space = action_space

        # Directory for writing evaluation result files (VM outputs).
        # Set by the runner before evaluation to isolate VM results from
        # gold-standard cache files.  Getter helpers should use
        # self.eval_cache_dir instead of self.cache_dir when writing.
        self.eval_result_dir: Optional[str] = None

        # episodic stuffs, like counters, will be updated or reset
        # when calling self.reset()
        self._traj_no: int = -1
        self._step_no: int = 0
        self.action_history: List[Dict[str, any]] = []


    def _start_emulator(self):
        try:
            # Power on the virtual machine
            self.provider.start_emulator(self.path_to_vm, self.headless, self.os_type)

            # Get the ip from the virtual machine, and setup the controller
            raw_ip = self.provider.get_ip_address(self.path_to_vm)
            if not raw_ip or not raw_ip.strip():
                raise RuntimeError(
                    f"Provider returned empty IP address for VM {self.path_to_vm}. "
                    f"Cannot initialise controllers (would produce http://:5000)."
                )

            vm_ip_ports = raw_ip.split(':')
            self.vm_ip = vm_ip_ports[0]

            if not self.vm_ip or not self.vm_ip.strip():
                raise RuntimeError(
                    f"Parsed empty VM IP from provider response '{raw_ip}'. "
                    f"Cannot initialise controllers."
                )

            # Get the ports from the virtual machine (for Docker provider only)
            if len(vm_ip_ports) > 1:
                self.server_port = int(vm_ip_ports[1])
                self.chromium_port = int(vm_ip_ports[2])
                self.vnc_port = int(vm_ip_ports[3])
                self.vlc_port = int(vm_ip_ports[4])
            self.controller = PythonController(vm_ip=self.vm_ip, server_port=self.server_port)
            self.setup_controller = SetupController(vm_ip=self.vm_ip, server_port=self.server_port, chromium_port=self.chromium_port, vlc_port=self.vlc_port, cache_dir=self.cache_dir_base, client_password=self.client_password, screen_width=self.screen_width, screen_height=self.screen_height, provider_name=self.provider_name)

            # A stale guest image must not be a hard failure: the VM is usable
            # even when the sync cannot be performed.
            try:
                self._sync_guest_server_files()
            except Exception as sync_err:
                logger.warning(f"Guest server sync skipped: {sync_err}")

        except Exception as e:
            logger.error(f"_start_emulator failed: {e}")
            try:
                self.provider.stop_emulator(self.path_to_vm)
            except Exception as stop_err:
                logger.warning(f"Cleanup after interrupt failed: {stop_err}")
            raise

    # The guest runs its own copy of ``desktop_env/server`` baked into the VM
    # image, so fixes made in this repo stay invisible until the files are
    # pushed into the guest and the service is restarted. Listed files are kept
    # in sync on every emulator start.
    _GUEST_SERVER_DIR = "/home/user/server"
    _GUEST_SERVER_FILES = ("pyxcursor.py",)
    _GUEST_SERVER_SERVICE = "osworld.service"
    _GUEST_RESTART_SETTLE = 3  # seconds
    _GUEST_RESTART_TIMEOUT = 120  # seconds

    def _sync_guest_server_files(self) -> None:
        """Replace outdated guest-server files and restart the guest service.

        A guest whose files already match is left untouched, so this costs one
        small download per boot once the VM image itself carries the fix.
        """
        if self.os_type != "Ubuntu":
            return

        local_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "server")
        outdated = []
        for name in self._GUEST_SERVER_FILES:
            local_path = os.path.join(local_dir, name)
            try:
                with open(local_path, "rb") as local_file:
                    local_bytes = local_file.read()
            except OSError as read_err:
                logger.warning(f"Cannot read guest server file {local_path}: {read_err}")
                continue
            remote_path = f"{self._GUEST_SERVER_DIR}/{name}"
            if self.controller.get_file(remote_path) == local_bytes:
                continue
            outdated.append({"url": local_path, "path": remote_path})

        if not outdated:
            return

        logger.info("Updating guest server files: %s", [f["path"] for f in outdated])
        self.setup_controller.download(outdated)
        # ``systemctl restart`` tears down the whole unit cgroup, which includes
        # the process running this very command, so the restart is handed to a
        # transient unit that lives outside that cgroup.
        self.setup_controller.execute([
            "bash",
            "-c",
            f"rm -rf {self._GUEST_SERVER_DIR}/__pycache__; "
            f"echo '{{CLIENT_PASSWORD}}' | sudo -S systemd-run --no-block --collect "
            f"systemctl restart {self._GUEST_SERVER_SERVICE}",
        ])
        self._wait_for_guest_server()

    def _wait_for_guest_server(self) -> None:
        # systemd-run returns before the old server is torn down, so wait out
        # the teardown first; otherwise the poll below would immediately
        # succeed against the process that is about to die.
        time.sleep(self._GUEST_RESTART_SETTLE)
        deadline = time.time() + self._GUEST_RESTART_TIMEOUT
        while time.time() < deadline:
            try:
                response = requests.post(
                    f"http://{self.vm_ip}:{self.server_port}/execute",
                    json={"command": ["true"]},
                    timeout=5,
                )
                if response.status_code == 200:
                    logger.info("Guest server restarted successfully.")
                    return
            except requests.RequestException:
                pass
            time.sleep(2)
        logger.warning(
            f"Guest server did not come back within {self._GUEST_RESTART_TIMEOUT}s after restart."
        )

    def _revert_to_snapshot(self):
        # Revert to certain snapshot of the virtual machine, and refresh the path to vm and ip of vm
        # due to the fact it could be changed when implemented by cloud services
        path_to_vm = self.provider.revert_to_snapshot(self.path_to_vm, self.snapshot_name)
        if path_to_vm and not path_to_vm == self.path_to_vm:
            # path_to_vm has to be a new path 
            
            self.manager.delete_vm(self.path_to_vm, self.region)
            self.manager.add_vm(path_to_vm, self.region)
            self.manager.occupy_vm(path_to_vm, os.getpid(), self.region)
            self.path_to_vm = path_to_vm

    def _save_state(self, snapshot_name=None):
        # Save the current virtual machine state to a certain snapshot name
        self.provider.save_state(self.path_to_vm, snapshot_name)

    def close(self):
        # Close (release) the virtual machine
        self.provider.stop_emulator(self.path_to_vm)

    def reset(self, task_config: Optional[Dict[str, Any]] = None, seed=None, options=None) -> Dict[str, Any]:
        
        # Reset to certain task in OSWorld
        logger.info("Resetting environment...")
        logger.info("Switching task...")
        logger.info("Setting counters...")
        self._traj_no += 1
        self._step_no = 0
        self.action_history.clear()
        for attempt in range(MAX_RETRIES):
            # Only revert to snapshot if environment has been used (step/setup)
            # Avoid unnecessary restart work for a clean environment.
            
            if task_config is not None:
                # Determine if proxy should be used for this task
                if self.force_proxy:
                    task_use_proxy = self.enable_proxy
                else:
                    task_use_proxy = task_config.get("proxy", False) and self.enable_proxy
                    if not self.enable_proxy and task_config.get("proxy", False):
                        logger.info("Task requires proxy but proxy is disabled at system level, ignoring proxy requirement.")
                
                if task_use_proxy != self.current_use_proxy:
                    # keep because get_info_from_website depend on this
                    self.current_use_proxy = task_use_proxy
            
            if self.is_environment_used:
                logger.info("Environment has been used, reverting to snapshot {}...".format(self.snapshot_name))
                self._revert_to_snapshot()
                logger.info("Starting emulator...")
                self._start_emulator()
                logger.info("Emulator started.")
                # Reset the usage flag after reverting
                self.is_environment_used = False
            else:
                logger.info("Environment is clean, skipping snapshot revert (provider: {}).".format(self.provider_name))

            if task_config is not None:
                # Determine whether to set up proxy
                if self.force_proxy:
                    should_setup_proxy = self.enable_proxy
                else:
                    should_setup_proxy = self.enable_proxy and task_config.get("proxy", False)
                
                if should_setup_proxy:
                    # Set up the proxy configuration
                    self.setup_controller._proxy_setup(self.client_password)
                self._set_task_info(task_config)
                self.setup_controller.reset_cache_dir(self.cache_dir, self.eval_cache_dir)
                logger.info("Setting up environment...")
                success = self.setup_controller.setup(self.config, should_setup_proxy)
                if success:
                    # Mark environment as used when setup is successfully executed
                    if self.config:  # Only mark as used if there were actual setup operations
                        self.is_environment_used = True
                    break
                else:
                    logger.error(
                        "Environment setup failed, retrying (%d/%d)...",
                        attempt + 1,
                        MAX_RETRIES,
                    )
                    time.sleep(5)
            else:
                break
            
        logger.info("Environment setup complete.")

        observation = self._get_obs()
        return observation

    _SCREENSHOT_OBS_RETRIES = 3
    _SCREENSHOT_OBS_RETRY_DELAY = 5  # seconds

    def _get_obs(self):
        # We provide screenshot, accessibility_tree (optional), terminal (optional), and instruction.
        # can be customized and scaled
        screenshot = self.controller.get_screenshot()

        # Retry screenshot capture – a transient failure should not immediately
        # propagate a None screenshot to the agent (which would TypeError).
        if screenshot is None:
            for attempt in range(1, self._SCREENSHOT_OBS_RETRIES + 1):
                logger.warning(
                    "Screenshot is None, retrying (%d/%d) after %ds...",
                    attempt, self._SCREENSHOT_OBS_RETRIES,
                    self._SCREENSHOT_OBS_RETRY_DELAY,
                )
                time.sleep(self._SCREENSHOT_OBS_RETRY_DELAY)
                screenshot = self.controller.get_screenshot()
                if screenshot is not None:
                    break

        if screenshot is None:
            raise ScreenshotUnavailableError(
                "Screenshot still None after all retries. "
                "The VM screenshot service is unreachable; "
                "environment restart is required."
            )

        obs = {
            "screenshot": screenshot,
            "instruction": self.instruction
        }
        return obs

    @property
    def vm_platform(self):
        return self.controller.get_vm_platform()

    @property
    def vm_screen_size(self):
        return self.controller.get_vm_screen_size()

    @property
    def eval_cache_dir(self) -> str:
        """Directory for writing VM evaluation result files.

        When eval_result_dir is set (by the runner), returns
        ``eval_result_dir/cache/`` so that VM outputs are isolated from
        the gold-standard cache.  Falls back to ``self.cache_dir`` for
        backward compatibility.
        """
        if self.eval_result_dir:
            d = os.path.join(self.eval_result_dir, "cache")
            os.makedirs(d, exist_ok=True)
            return d
        return self.cache_dir

    def _set_task_info(self, task_config: Dict[str, Any]):
        """Set task info (proxy logic is handled in reset method)"""
        self.task_id: str = task_config["id"]
        self.cache_dir: str = os.path.join(self.cache_dir_base, self.task_id)
        os.makedirs(self.cache_dir, exist_ok=True)
        self.instruction = task_config["instruction"]
        self.config = task_config["config"] if "config" in task_config else []
        
        self._set_evaluator_info(task_config)

    def _set_evaluator_info(self, task_config: Dict[str, Any]):
        """Set evaluator information from task config"""
        # evaluator dict
        # func -> metric function string, or list of metric function strings
        # conj -> conjunction of multiple metrics if func is a list with length > 1, "and"/"or"
        # result -> result getter config, or list of result getter configs
        # expected (optional) -> expected getter config, or list of expected getter configs
        # options (optional) -> metric options, or list of metric options
        # if func is a str list, then result, expected (if exists), options (if exists) should also be lists of the same length
        # even if one of the metrics does not need expected or options field, it should be included in the list with None
        self.evaluator = task_config["evaluator"]
        self._evaluator_valid = True
        self._evaluator_error = ""

        try:
            metrics_ns, getters_ns = self.evaluator_metrics, self.evaluator_getters
            self.metric: Metric = [getattr(metrics_ns, func) for func in self.evaluator["func"]] \
                if isinstance(self.evaluator["func"], list) \
                else getattr(metrics_ns, self.evaluator["func"])
            self.metric_conj: str = self.evaluator.get("conj", "and")  # take conjunction of multiple metrics
            if "result" in self.evaluator and len(self.evaluator["result"]) > 0:
                self.result_getter: Getter = [getattr(getters_ns, "get_{:}".format(res["type"])) for res in
                                              self.evaluator["result"]] \
                    if isinstance(self.evaluator["result"], list) \
                    else getattr(getters_ns, "get_{:}".format(self.evaluator["result"]["type"]))
            else:
                self.result_getter = [None] * len(self.metric) \
                    if isinstance(self.metric, list) \
                    else None

            if "expected" in self.evaluator and len(self.evaluator["expected"]) > 0:
                self.expected_getter: Getter = [getattr(getters_ns, "get_{:}".format(exp["type"])) if exp else None for exp in
                                                self.evaluator["expected"]] \
                    if isinstance(self.evaluator["expected"], list) \
                    else getattr(getters_ns, "get_{:}".format(self.evaluator["expected"]["type"]))
            else:
                self.expected_getter = [None] * len(self.metric) \
                    if isinstance(self.metric, list) \
                    else None
            self.metric_options: Union[List[Dict[str, Any]], Dict[str, Any]] = [opt if opt else {} for opt in
                                                                                self.evaluator["options"]] \
                if isinstance(self.evaluator.get("options", {}), list) \
                else self.evaluator["options"] \
                if "options" in self.evaluator \
                else [{}] * len(self.metric) \
                if isinstance(self.metric, list) \
                else {}

            if isinstance(self.evaluator["func"], list):
                lengths = {
                    "metric": len(self.metric),
                    "result_getter": len(self.result_getter) if isinstance(self.result_getter, list) else 1,
                    "expected_getter": len(self.expected_getter) if isinstance(self.expected_getter, list) else 1,
                    "metric_options": len(self.metric_options) if isinstance(self.metric_options, list) else 1,
                }
                if len(set(lengths.values())) > 1:
                    self._evaluator_valid = False
                    self._evaluator_error = (
                        f"Evaluator config length mismatch: {lengths}. "
                        f"Evaluation will be skipped for this task."
                    )
                    logger.warning("Task %s: %s", task_config.get("id", "?"), self._evaluator_error)

            # Opt-in eval-dump: when the task JSON carries a top-level
            # ``dump_eval_state: true`` we wrap each metric so its
            # (result, expected, options) is recorded under
            # ``<eval_cache_dir>/_eval_dump/`` for offline re-grading.
            # Tasks without the flag keep the original ``self.metric``
            # untouched.
            if task_config.get("dump_eval_state", False):
                self._eval_dump_done = False
                if isinstance(self.metric, list):
                    self.metric = [_eval_dump.wrap_metric(self, self.evaluator, m, idx=i)
                                   for i, m in enumerate(self.metric)]
                else:
                    self.metric = _eval_dump.wrap_metric(self, self.evaluator, self.metric, idx=0)

        except Exception as e:
            self._evaluator_valid = False
            self._evaluator_error = f"Failed to parse evaluator config: {e}"
            logger.warning("Task %s: %s", task_config.get("id", "?"), self._evaluator_error)

    def step(self, action, pause=2):
        self._step_no += 1
        self.action_history.append(action)
        
        # Mark environment as used when step is called
        self.is_environment_used = True

        reward = 0  # todo: Define reward calculation for each example
        done = False  # todo: Define episode termination condition for each example
        info = {}
        logger.debug("Executing step %d in trajectory %d", self._step_no, self._traj_no)
        # handle the special actions
        if action in ['WAIT', 'FAIL', 'DONE'] or (
            type(action) == dict
            and action.get('action_type') in ['WAIT', 'FAIL', 'DONE']
        ):
            if action == 'WAIT' or (type(action) == dict and action.get('action_type') == 'WAIT'):
                time.sleep(pause)
            elif action == 'FAIL' or (type(action) == dict and action.get('action_type') == 'FAIL'):
                done = True
                info = {"fail": True}
            elif action == 'DONE' or (type(action) == dict and action.get('action_type') == 'DONE'):
                done = True
                info = {"done": True}

        if action in ['WAIT', 'FAIL', 'DONE'] or (
            type(action) == dict
            and action.get('action_type') in ['WAIT', 'FAIL', 'DONE']
        ):
            self.controller.execute_action(action)
        elif type(action) == str:
            fixed_command = _fix_pyautogui_less_than_bug(action)
            self.controller.execute_python_command(fixed_command)
        elif type(action) == dict:
            fixed_command = _fix_pyautogui_less_than_bug(action['command'])
            self.controller.execute_python_command(fixed_command)

        time.sleep(pause)
        observation = self._get_obs()

        return observation, reward, done, info

    def _make_record(self, idx, result_state, expected_state, metric_score) -> MetricRecord:
        """Build a MetricRecord, pulling the per-metric config out of the
        evaluator dict. Pure — no side effects, no I/O."""
        funcs = self.evaluator.get("func")
        results = self.evaluator.get("result")
        expected = self.evaluator.get("expected")
        options = self.metric_options
        return MetricRecord(
            idx=idx,
            func_name=funcs[idx] if isinstance(funcs, list) else funcs,
            result_getter_config=results[idx] if isinstance(results, list) else results,
            expected_getter_config=expected[idx] if isinstance(expected, list) else expected,
            options=options[idx] if isinstance(options, list) else options,
            result_state=result_state,
            expected_state=expected_state,
            metric_score=metric_score,
        )

    def evaluate(self):
        """
        Evaluate whether the task is successfully completed.

        Thin wrapper: delegate scoring to ``_evaluate_core`` (pure, no I/O)
        and handle optional artifact persistence here, so the scoring logic
        never has to know about artifact dumping.
        """
        capture_records = artifacts_enabled()
        result = self._evaluate_core(capture_records=capture_records)
        records = result.records
        score = float(result.score)
        error = result.error
        if not capture_records:
            return result.score
        try:
            save_evaluator_artifacts(
                self,
                records,
                score,
                error=error,
            )
        except Exception as exc:
            logger.warning("Failed to save evaluator artifacts: %s", exc)
        return result.score

    def _evaluate_core(self, capture_records: bool = True) -> EvalResult:
        """Compute the task score.

        Returns an :class:`EvalResult` carrying the final score plus a
        record of every metric that was actually evaluated. This method has
        no persistence side effects — callers decide what to do with the
        records. Control flow (short-circuits, conjunction semantics) is
        byte-for-byte identical to the historical ``evaluate()`` body.
        """
        records: List[MetricRecord] = []

        if not getattr(self, '_evaluator_valid', True):
            error = getattr(self, '_evaluator_error', 'unknown error')
            logger.warning(
                "Skipping evaluation due to invalid evaluator config: %s",
                error,
            )
            return EvalResult(0.0, records, error=error)

        postconfig = self.evaluator.get("postconfig", [])
        # Re-sync setup_controller's eval_cache_dir: the runner sets
        # env.eval_result_dir *after* reset(), so the value passed in
        # reset_cache_dir() during reset() may be stale.
        self.setup_controller.reset_cache_dir(self.cache_dir, self.eval_cache_dir)
        self.setup_controller.setup(postconfig, self.current_use_proxy)
        # Mark environment as used if there were postconfig setup operations
        if postconfig:
            self.is_environment_used = True

        if self.evaluator['func'] == "infeasible":
            if len(self.action_history) > 0:
                last_action = self.action_history[-1]
                if last_action == "FAIL" or (type(last_action) == dict and last_action.get('action_type') == 'FAIL'):
                    return EvalResult(1, records)
            return EvalResult(0, records)
        else:
            if len(self.action_history) > 0:
                last_action = self.action_history[-1]
                is_fail = (
                    last_action == "FAIL"
                    or (type(last_action) == dict and last_action.get('action_type') == 'FAIL')
                )
                allow_partial_on_fail = (
                    os.environ.get("OSWORLD_ALLOW_PARTIAL_REWARD_ON_FAIL", "0") == "1"
                )
                if is_fail and not allow_partial_on_fail:
                    return EvalResult(0, records)

        if type(self.metric) == list:
            # Multiple metrics to evaluate whether the task is successfully completed
            results = []
            for idx, metric in enumerate(self.metric):
                try:
                    config = self.evaluator["result"][idx]
                    result_state = self.result_getter[idx](self, config)
                except FileNotFoundError:
                    logger.error("File not found!")
                    result_state = None

                if result_state is None:
                    logger.warning("Result state is None for metric %d, treating as failure", idx)
                    if capture_records:
                        records.append(self._make_record(idx, result_state, None, 0.0))
                    if self.metric_conj == 'and':
                        return EvalResult(0, records)
                    else:
                        results.append(0)
                        continue

                expected_state = None
                if "expected" in self.evaluator and self.expected_getter and self.evaluator["expected"]:
                    expected_state = self.expected_getter[idx](self, self.evaluator["expected"][idx])
                    metric: int = metric(result_state, expected_state, **self.metric_options[idx])
                else:
                    metric: int = metric(result_state, **self.metric_options[idx])
                if capture_records:
                    records.append(self._make_record(idx, result_state, expected_state, metric))

                if self.metric_conj == 'and' and float(metric) == 0.0:
                    return EvalResult(0, records)
                elif self.metric_conj == 'or' and float(metric) == 1.0:
                    return EvalResult(1, records)
                else:
                    results.append(metric)

            score = sum(results) / len(results) if self.metric_conj == 'and' else max(results)
            return EvalResult(score, records)
        else:
            # Single metric to evaluate whether the task is successfully completed
            try:
                result_state = self.result_getter(self, self.evaluator["result"])
            except FileNotFoundError:
                logger.error("File not found!")
                result_state = None

            if result_state is None:
                logger.warning("Result state is None, treating as failure")
                if capture_records:
                    records.append(self._make_record(0, result_state, None, 0.0))
                return EvalResult(0, records)

            expected_state = None
            if "expected" in self.evaluator and self.expected_getter and self.evaluator["expected"]:
                expected_state = self.expected_getter(self, self.evaluator["expected"])
                metric: float = self.metric(result_state, expected_state, **self.metric_options)
            else:
                metric: float = self.metric(result_state, **self.metric_options)
            if capture_records:
                records.append(self._make_record(0, result_state, expected_state, metric))

        return EvalResult(metric, records)

    def render(self, mode='rgb_array'):
        if mode == 'rgb_array':
            return self.controller.get_screenshot()
        else:
            raise ValueError('Unsupported render mode: {}'.format(mode))
