import json
import logging
import os
from copy import deepcopy
import os.path
import platform
import shlex
import shutil
import socket
import sqlite3
import tempfile
import time
import traceback
import uuid
from datetime import datetime, timedelta
from typing import Any, Union, Optional
from typing import Dict, List
from urllib.parse import urlparse

import requests
from playwright.sync_api import sync_playwright, TimeoutError
from pydrive.auth import GoogleAuth
from pydrive.drive import GoogleDrive, GoogleDriveFile, GoogleDriveFileList
from requests_toolbelt.multipart.encoder import MultipartEncoder

from desktop_env.exceptions import SetupFailedError

from desktop_env.controllers.python import PythonController
from desktop_env.evaluators.metrics.utils import compare_urls
from desktop_env.proxy_pool import get_global_proxy_pool, init_proxy_pool, ProxyInfo

import dotenv
# Load environment variables from .env file
dotenv.load_dotenv()


PROXY_CONFIG_FILE = os.getenv("PROXY_CONFIG_FILE", "evaluation_examples/settings/proxy/dataimpulse.json")  # Default proxy config file

logger = logging.getLogger("desktopenv.setup")

FILE_PATH = os.path.dirname(os.path.abspath(__file__))

init_proxy_pool(PROXY_CONFIG_FILE)  # initialize the global proxy pool

MAX_RETRIES = 20

class SetupController:
    def __init__(self, vm_ip: str, server_port: int = 5000, chromium_port: int = 9222, vlc_port: int = 8080, cache_dir: str = "cache", client_password: str = "", screen_width: int = 1920, screen_height: int = 1080, provider_name: str = None):
        self.vm_ip: str = vm_ip
        self.server_port: int = server_port
        self.chromium_port: int = chromium_port
        self.vlc_port: int = vlc_port
        self.http_server: str = f"http://{vm_ip}:{server_port}"
        self.http_server_setup_root: str = f"http://{vm_ip}:{server_port}/setup"
        self.cache_dir: str = cache_dir
        self._eval_cache_dir: str = ""  # set via reset_cache_dir; falls back to cache_dir
        self.use_proxy: bool = False
        self.proxy_url: str = None
        self.client_password: str = client_password
        self.screen_width: int = screen_width
        self.screen_height: int = screen_height
        self.provider_name: str = provider_name

    def reset_cache_dir(self, cache_dir: str, eval_cache_dir: str = ""):
        self.cache_dir = cache_dir
        self._eval_cache_dir = eval_cache_dir

    @property
    def eval_cache_dir(self) -> str:
        """Directory for runtime-generated files (stdout/stderr captures).

        When ``_eval_cache_dir`` is set (by the caller via
        :meth:`reset_cache_dir`), returns that path so that runtime
        outputs are isolated from the gold-standard cache.  Falls back
        to ``self.cache_dir`` for backward compatibility.
        """
        return self._eval_cache_dir or self.cache_dir

    def _host_cache_root_for_shared_wallpaper(self) -> str:
        """Parent of cache_dir when basename is a task UUID; else cache_dir itself."""
        norm = os.path.normpath(self.cache_dir)
        base = os.path.basename(norm)
        try:
            uuid.UUID(base)
        except ValueError:
            return norm
        return os.path.dirname(norm) or norm

    def setup(self, config: List[Dict[str, Any]], use_proxy: bool = False)-> bool:
        """
        Args:
            config (List[Dict[str, Any]]): list of dict like {str: Any}. each
              config dict has the structure like
                {
                    "type": str, corresponding to the `_{:}_setup` methods of
                      this class
                    "parameters": dict like {str, Any} providing the keyword
                      parameters
                }
        """  
        self.use_proxy = use_proxy

        # Validate that the server address is usable before attempting connections
        if not self.vm_ip or not self.vm_ip.strip():
            logger.error(
                "SetupController has empty vm_ip – cannot connect to http://<empty>:%d. "
                "Aborting setup.", self.server_port,
            )
            return False

        # make sure connection can be established
        logger.info(f"try to connect {self.http_server}")
        retry = 0
        while retry < MAX_RETRIES:
            try:
                _ = requests.get(self.http_server + "/terminal", timeout=10)
                break
            except:
                time.sleep(5)
                retry += 1
                logger.info(f"retry: {retry}/{MAX_RETRIES}")
            
            if retry == MAX_RETRIES:
                return False

        # Disable packagekit and apt auto-update on Docker only (avoid apt lock conflicts e.g. packagekitd holding /var/lib/apt/lists/lock)
        if self.provider_name == "docker":
            self._disable_apt_auto_update_setup()

        for i, cfg in enumerate(config):
            config_type: str = cfg["type"]
            parameters: Dict[str, Any] = cfg["parameters"]

            # Assumes all the setup the functions should follow this name
            # protocol
            setup_function: str = "_{:}_setup".format(config_type)
            assert hasattr(self, setup_function), f'Setup controller cannot find init function {setup_function}'
            
            try:
                logger.info(f"Executing setup step {i+1}/{len(config)}: {setup_function}")
                logger.debug(f"Setup parameters: {parameters}")
                getattr(self, setup_function)(**parameters)
                logger.info(f"SETUP COMPLETED: {setup_function}({str(parameters)})")
            except Exception as e:
                logger.error(f"SETUP FAILED at step {i+1}/{len(config)}: {setup_function}({str(parameters)})")
                logger.error(f"Error details: {e}")
                logger.error(f"Traceback: {traceback.format_exc()}")
                raise SetupFailedError(f"Setup step {i+1} failed: {setup_function} - {e}") from e
        
        return True

    def _disable_apt_auto_update_setup(self):
        """Disable packagekit and apt automatic update services to avoid apt lock conflicts (e.g. packagekitd holding /var/lib/apt/lists/lock)."""
        password = self.client_password
        cmd = (
            f"echo '{password}' | sudo -S bash -c '"
            "systemctl stop packagekit 2>/dev/null || true; "
            "systemctl disable packagekit 2>/dev/null || true; "
            "systemctl stop apt-daily.timer 2>/dev/null || true; "
            "systemctl disable apt-daily.timer 2>/dev/null || true; "
            "systemctl stop apt-daily-upgrade.timer 2>/dev/null || true; "
            "systemctl disable apt-daily-upgrade.timer 2>/dev/null || true"
            "'"
        )
        self._execute_setup([cmd], shell=True)

    def _download_setup(self, files: List[Dict[str, str]]):
        """
        Args:
            files (List[Dict[str, str]]): files to download. lisf of dict like
              {
                "url": str, the url to download
                "path": str, the path on the VM to store the downloaded file
              }
        """
        for f in files:
            url: str = f["url"]
            path: str = f["path"]
            cache_path: str = os.path.join(self.cache_dir, "{:}_{:}".format(
                uuid.uuid5(uuid.NAMESPACE_URL, url),
                os.path.basename(path)))
            if not url or not path:
                raise Exception(f"Setup Download - Invalid URL ({url}) or path ({path}).")

            if not os.path.exists(cache_path):
                logger.info(f"Cache file not found, downloading from {url} to {cache_path}")
                max_retries = 3
                downloaded = False
                e = None
                for i in range(max_retries):
                    try:
                        logger.info(f"Download attempt {i+1}/{max_retries} for {url}")
                        response = requests.get(url, stream=True, timeout=300)  # Add 5 minute timeout
                        response.raise_for_status()
                        
                        # Get file size if available
                        total_size = int(response.headers.get('content-length', 0))
                        if total_size > 0:
                            logger.info(f"File size: {total_size / (1024*1024):.2f} MB")

                        downloaded_size = 0
                        with open(cache_path, 'wb') as f:
                            for chunk in response.iter_content(chunk_size=8192):
                                if chunk:
                                    f.write(chunk)
                                    downloaded_size += len(chunk)
                                    if total_size > 0 and downloaded_size % (1024*1024) == 0:  # Log every MB
                                        progress = (downloaded_size / total_size) * 100
                                        logger.info(f"Download progress: {progress:.1f}%")
                        
                        logger.info(f"File downloaded successfully to {cache_path} ({downloaded_size / (1024*1024):.2f} MB)")
                        downloaded = True
                        break

                    except requests.RequestException as e:
                        logger.error(
                            f"Failed to download {url} caused by {e}. Retrying... ({max_retries - i - 1} attempts left)")
                        # Clean up partial download
                        if os.path.exists(cache_path):
                            os.remove(cache_path)
                if not downloaded:
                    raise requests.RequestException(f"Failed to download {url}. No retries left.")

            form = MultipartEncoder({
                "file_path": path,
                "file_data": (os.path.basename(path), open(cache_path, "rb"))
            })
            headers = {"Content-Type": form.content_type}
            logger.debug(form.content_type)

            # send request to server to upload file
            try:
                logger.info(f"Uploading {os.path.basename(path)} to VM at {path}")
                logger.debug("REQUEST ADDRESS: %s", self.http_server + "/setup" + "/upload")
                response = requests.post(self.http_server + "/setup" + "/upload", headers=headers, data=form, timeout=600)  # 10 minute timeout for upload
                if response.status_code == 200:
                    logger.info(f"File uploaded successfully: {path}")
                else:
                    logger.error(
                        "Failed to upload file %s. Status code: %d",
                        path,
                        response.status_code,
                    )
                    raise requests.RequestException(f"Upload failed with status {response.status_code}")
            except requests.exceptions.RequestException as e:
                logger.error(f"An error occurred while trying to upload {path}: {e}")
                raise

    def _upload_cache_file_setup(self, files: List[Dict[str, str]]):
        """
        Same as :meth:`_upload_file_setup`, but before uploading deep-copies ``files`` and
        resolves each ``local_path``: if it is not absolute, it is joined with
        ``self.cache_dir`` (typically ``{cache_root}/{task_id}``).

        Use absolute ``local_path`` in JSON when the file is outside the task cache tree.
        """
        resolved: List[Dict[str, str]] = deepcopy(files)
        for f in resolved:
            lp = f.get("local_path") or ""
            if lp and not os.path.isabs(lp):
                f["local_path"] = os.path.normpath(os.path.join(self.cache_dir, lp))
        self._upload_file_setup(resolved)

    def _upload_file_setup(self, files: List[Dict[str, str]]):
        """
        Args:
            files (List[Dict[str, str]]): files to download. lisf of dict like
              {
                "local_path": str, the local path to the file to upload
                "path": str, the path on the VM to store the downloaded file
              }
        """
        for f in files:
            local_path: str = f["local_path"]
            path: str = f["path"]

            if not os.path.exists(local_path):
                raise Exception(f"Setup Upload - Invalid local path ({local_path}).")

            file_size = None
            try:
                file_size = os.path.getsize(local_path)
            except Exception:
                pass

            max_retries = 3
            last_error: Optional[Exception] = None

            for attempt in range(max_retries):
                try:
                    logger.info(
                        f"Uploading {os.path.basename(local_path)}{f' ({file_size} bytes)' if file_size is not None else ''} "
                        f"to VM at {path} (attempt {attempt + 1}/{max_retries})"
                    )
                    logger.debug("REQUEST ADDRESS: %s", self.http_server + "/setup" + "/upload")

                    # Open the file inside each attempt to ensure fresh stream position
                    with open(local_path, "rb") as fp:
                        form = MultipartEncoder({
                            "file_path": path,
                            "file_data": (os.path.basename(path), fp)
                        })
                        headers = {"Content-Type": form.content_type}
                        logger.debug(form.content_type)

                        # Explicit connect/read timeout to avoid hanging forever
                        response = requests.post(
                            self.http_server + "/setup" + "/upload",
                            headers=headers,
                            data=form,
                            timeout=(10, 600)
                        )

                        if response.status_code == 200:
                            logger.info(f"File uploaded successfully: {path}")
                            last_error = None
                            break
                        else:
                            msg = f"Failed to upload file {path}. Status code: {response.status_code}"
                            logger.error(msg)
                            last_error = requests.RequestException(msg)

                except requests.exceptions.RequestException as e:
                    last_error = e
                    logger.error(f"Upload attempt {attempt + 1} failed for {path}: {e}")

                # Exponential backoff between retries
                if attempt < max_retries - 1:
                    time.sleep(2 ** attempt)

            if last_error is not None:
                raise last_error

    def _change_wallpaper_setup(self, path: str):
        if not path:
            raise Exception(f"Setup Wallpaper - Invalid path ({path}).")

        payload = json.dumps({"path": path})
        headers = {
            'Content-Type': 'application/json'
        }

        # send request to server to change wallpaper
        try:
            response = requests.post(self.http_server + "/setup" + "/change_wallpaper", headers=headers, data=payload)
            if response.status_code == 200:
                logger.debug("Wallpaper changed successfully")
            else:
                logger.error("Failed to change wallpaper. Status code: %d", response.status_code)
        except requests.exceptions.RequestException as e:
            logger.error("An error occurred while trying to send the request: %s", e)

    def _change_wallpaper_from_cache_setup(self, local_path: str, path: str):
        """
        Upload a wallpaper image from the host to the VM, then set it as desktop background.

        **Relative** ``local_path`` lookup order:

        1. :attr:`cache_dir` / ``local_path`` (per-task cache, e.g. ``.../cache/<task_id>/``)
        2. Shared pool: if ``cache_dir`` ends with a task UUID, ``dirname(cache_dir)/wallpapers/``
           else ``cache_dir/wallpapers/``, plus basename(``local_path``)
           (e.g. ``.../cache/wallpapers/wallpaper_94ae9819.jpg``)

        Absolute ``local_path`` must exist as given.

        Args:
            local_path: Relative file name or path under task cache, or under shared ``wallpapers/``
                (only the basename is used for the shared dir), or an absolute path.
            path: Path on the VM (e.g. ``/home/user/Pictures/wallpaper_94ae9819.jpg``).

        Task JSON example::

            {
              "type": "change_wallpaper_from_cache",
              "parameters": {
                "local_path": "wallpaper_94ae9819.jpg",
                "path": "/home/user/Pictures/wallpaper_94ae9819.jpg"
              }
            }
        """
        if not path:
            raise Exception(f"Setup change_wallpaper_from_cache - invalid VM path ({path!r}).")
        lp = (local_path or "").strip()
        if not lp:
            raise Exception("Setup change_wallpaper_from_cache - local_path is empty.")
        if os.path.isabs(lp):
            resolved = lp if os.path.isfile(lp) else ""
        else:
            in_task = os.path.normpath(os.path.join(self.cache_dir, lp))
            root = self._host_cache_root_for_shared_wallpaper()
            in_shared = os.path.normpath(
                os.path.join(root, "wallpapers", os.path.basename(lp))
            )
            if os.path.isfile(in_task):
                resolved = in_task
            elif os.path.isfile(in_shared):
                resolved = in_shared
            else:
                resolved = ""
        if not resolved:
            shared_hint = os.path.join(
                self._host_cache_root_for_shared_wallpaper(), "wallpapers"
            )
            raise Exception(
                f"Setup change_wallpaper_from_cache - file not found ({local_path!r}); "
                f"tried {self.cache_dir!r} and shared {shared_hint!r} (by basename)."
            )
        self._upload_file_setup([{"local_path": resolved, "path": path}])
        self._change_wallpaper_setup(path)

    def _tidy_desktop_setup(self, **config):
        raise NotImplementedError()

    def _open_setup(self, path: str):
        if not path:
            raise Exception(f"Setup Open - Invalid path ({path}).")

        payload = json.dumps({"path": path})
        headers = {
            'Content-Type': 'application/json'
        }

        # send request to server to open file
        try:
            # The server-side call is now blocking and can take time.
            # We set a timeout that is slightly longer than the server's timeout (1800s).
            response = requests.post(self.http_server + "/setup" + "/open_file", headers=headers, data=payload, timeout=1810)
            response.raise_for_status()  # This will raise an exception for 4xx and 5xx status codes
            logger.debug("File opened successfully")
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to open file '{path}'. An error occurred while trying to send the request or the server responded with an error: {e}")
            raise Exception(f"Failed to open file '{path}'. An error occurred while trying to send the request or the server responded with an error: {e}") from e

    def _launch_setup(self, command: Union[str, List[str]], shell: bool = False):
        if not command:
            raise Exception("Empty command to launch.")

        if not shell and isinstance(command, str) and len(command.split()) > 1:
            logger.warning("Command should be a list of strings. Now it is a string. Will split it by space.")
            command = command.split()
            
        def _insert_chrome_flag(flag: str):
            """Insert a Chrome flag before the first URL/non-option argument."""
            if not isinstance(command, list):
                return
            flag_key = flag.split("=", 1)[0]
            if any(str(c) == flag or str(c).startswith(flag_key + "=") for c in command):
                return
            insert_at = len(command)
            for i, arg in enumerate(command[1:], start=1):
                s = str(arg)
                if not s.startswith("-"):
                    insert_at = i
                    break
            command.insert(insert_at, flag)

        if (not shell and isinstance(command, list)
                and command[0] in ("google-chrome", "chromium", "chromium-browser")):
            # 避免 Chrome 首次启动欢迎弹窗遮住 Odoo/Stirling 页面。
            for flag in (
                "--no-first-run",
                "--no-default-browser-check",
                "--disable-search-engine-choice-screen",
            ):
                _insert_chrome_flag(flag)

            if self.use_proxy:
                if os.environ.get("USE_TINYPROXY_SERVER", "False") == "True":
                    _insert_chrome_flag("--proxy-server=http://127.0.0.1:18888")
                else:
                    _insert_chrome_flag(f"--proxy-server={self.proxy_url}")
                # 确保访问 localhost/127.0.0.1 时不走代理（webapp benchmark 需要
                # Chrome 直接访问 VM 本地的 Stirling-PDF:8001 / Odoo:8003）
                _insert_chrome_flag("--proxy-bypass-list=localhost;127.0.0.1;127.0.0.0/8;10.0.2.2")

        # =====================================================================
        # Auto-inject --remote-debugging-port for Chrome if not already present.
        # InfiniteWeb (and similar) task configs launch Chrome without debug
        # port, which makes CDP-based evaluation impossible. By always ensuring
        # the debug port is set, the evaluator can connect via CDP later.
        # =====================================================================
        _is_chrome = (
            not shell
            and isinstance(command, list)
            and len(command) > 0
            and command[0] in ("google-chrome", "chromium", "chromium-browser")
        )
        if not _is_chrome and isinstance(command, str):
            _is_chrome = command.strip().startswith("google-chrome") or command.strip().startswith("chromium")

        _needs_debug_port = _is_chrome and not any(
            "--remote-debugging-port" in str(c) for c in (command if isinstance(command, list) else [command])
        )
        if _needs_debug_port:
            if isinstance(command, list):
                command.append("--remote-debugging-port=1337")
            else:
                command = command + " --remote-debugging-port=1337"
            logger.info("[SETUP] Auto-injected --remote-debugging-port=1337 into Chrome launch command")

        # =====================================================================
        # Strip Qt plugin-path env vars from launched GUI apps.
        #
        # Some VM images pip-install opencv-python (cv2) into the system Python.
        # cv2/__init__.py sets QT_QPA_PLATFORM_PLUGIN_PATH=<.../cv2/qt/plugins>
        # at import time. The in-VM server imports cv2, so every app it spawns
        # via subprocess inherits that path. System Qt apps (VLC, etc.) then try
        # to load cv2's bundled (ABI-mismatched) xcb plugin and abort before
        # drawing a window -- the launch "succeeds" but no UI ever appears.
        #
        # We strip those vars from only the *child* app's environment. This does
        # NOT affect Python's own `import cv2` (cv2 re-sets the var inside its own
        # process) or cv2's array operations, so evaluators are unaffected.
        #   - shell=True string  -> prepend `unset <vars>;` so a leading shell
        #                           builtin / pipeline / $(...) keeps working.
        #   - otherwise          -> prepend an `env -u <vars>` argv wrapper.
        # =====================================================================
        _QT_VARS = ["QT_QPA_PLATFORM_PLUGIN_PATH", "QT_PLUGIN_PATH"]
        if shell and isinstance(command, str):
            command = "unset " + " ".join(_QT_VARS) + "; " + command
        else:
            argv = [command] if isinstance(command, str) else command
            command = ["env"] + [tok for v in _QT_VARS for tok in ("-u", v)] + argv
        logger.info("[SETUP] Stripped Qt plugin-path env vars from launch command")

        payload = json.dumps({"command": command, "shell": shell})
        headers = {"Content-Type": "application/json"}

        try:
            logger.info("REQUEST ADDRESS: %s", self.http_server + "/setup" + "/launch")
            response = requests.post(self.http_server + "/setup" + "/launch", headers=headers, data=payload)
            if response.status_code == 200:
                logger.debug("Application launched successfully")
            else:
                logger.error(
                    "Failed to launch application. Status code: %d",
                    response.status_code,
                )
                raise SetupFailedError(
                    f"Failed to launch application: HTTP {response.status_code}"
                )
        except SetupFailedError:
            raise
        except requests.exceptions.RequestException as e:
            logger.error("An error occurred while trying to send the request: %s", e)
            raise SetupFailedError(
                f"Failed to launch '{command}': request error - {e}"
            ) from e

        # After Chrome is launched with debug port, also start socat forwarding
        # (9222 -> 1337) so the CDP port is accessible from outside the VM.
        # This is a fire-and-forget operation; if socat is already running or
        # not needed, it will harmlessly fail or be a no-op.
        if _needs_debug_port:
            try:
                _socat_payload = json.dumps({
                    "command": ["socat", "tcp-listen:9222,fork,reuseaddr", "tcp:localhost:1337"],
                    "shell": False
                })
                requests.post(
                    self.http_server + "/setup" + "/launch",
                    headers=headers,
                    data=_socat_payload,
                    timeout=10,
                )
                logger.info("[SETUP] Launched socat 9222->1337 for Chrome CDP forwarding")
            except Exception as _socat_err:
                logger.warning(f"[SETUP] socat launch error (non-fatal): {_socat_err}")


    def _execute_setup(
            self,
            command: List[str],
            stdout: str = "",
            stderr: str = "",
            shell: bool = False,
            until: Optional[Dict[str, Any]] = None,
            raise_on_error: bool = False
    ):
        if not command:
            raise Exception("Empty command to launch.")

        # For cua_gym `initial_setup.py`: auto-capture its stdout/stderr and
        # enable strict failure detection (raise on non-zero returncode), since
        # the reward script depends on it. Other commands stay raise_on_error=False.
        _cmd_str = " ".join(command) if isinstance(command, list) else str(command)
        if "initial_setup.py" in _cmd_str:
            if not stdout and not stderr:
                stdout = "_cua_setup_stdout.txt"
                stderr = "_cua_setup_stderr.txt"
            raise_on_error = True

        until: Dict[str, Any] = until or {}
        terminates: bool = False
        nb_failings = 0
        def replace_screen_env_in_command(command):
            password = self.client_password
            width = self.screen_width
            height = self.screen_height
            width_half = str(width // 2)
            height_half = str(height // 2)
            new_command_list = []
            new_command = ""
            if isinstance(command, str):
                new_command = command.replace("{CLIENT_PASSWORD}", password)
                new_command = new_command.replace("{SCREEN_WIDTH_HALF}", width_half)
                new_command = new_command.replace("{SCREEN_HEIGHT_HALF}", height_half)
                new_command = new_command.replace("{SCREEN_WIDTH}", str(width))
                new_command = new_command.replace("{SCREEN_HEIGHT}", str(height))
                return new_command
            else:
                for item in command:
                    item = item.replace("{CLIENT_PASSWORD}", password)
                    item = item.replace("{SCREEN_WIDTH_HALF}", width_half)
                    item = item.replace("{SCREEN_HEIGHT_HALF}", height_half)
                    item = item.replace("{SCREEN_WIDTH}", str(width))
                    item = item.replace("{SCREEN_HEIGHT}", str(height))
                    new_command_list.append(item)
                return new_command_list
        command = replace_screen_env_in_command(command)

        # Re-source /etc/environment per command when proxy is in effect.
        # The OSWorld VM agent server (desktop_env/server/main.py) runs
        # `subprocess.run(command, ...)` without `env=`, so spawned children
        # inherit the server's *original* env (captured by systemd/PAM at
        # boot). _proxy_setup writes proxy variables into /etc/environment,
        # but those won't reach an already-running server. Wrapping each
        # command so the spawned shell first sources /etc/environment makes
        # the freshly-written http_proxy/https_proxy/no_proxy visible to
        # things like `python3 initial_setup.py` (which uses `requests`,
        # which reads only os.environ). Gate on self.use_proxy so this is
        # a no-op when the task isn't configured for proxy.
        if self.use_proxy:
            _src = "set -a; . /etc/environment 2>/dev/null; set +a; "
            if isinstance(command, str):
                # String command — prepend env reload and force shell mode.
                command = _src + command
                shell = True
            elif isinstance(command, list) and command:
                if shell:
                    # Preserve shell semantics for callers that pass ["cmd | ..."] with shell=True.
                    # Quoting the whole string would make /bin/sh try to exec a literal filename.
                    inner = str(command[0]) if len(command) == 1 else " ".join(str(a) for a in command)
                    command = _src + inner
                else:
                    # List form — convert to a shell command so we can prepend the env reload prefix.
                    inner = " ".join(shlex.quote(str(a)) for a in command)
                    command = _src + "exec " + inner
                shell = True

        payload = json.dumps({"command": command, "shell": shell})
        headers = {"Content-Type": "application/json"}
        while not terminates:
            try:
                response = requests.post(self.http_server + "/setup" + "/execute", headers=headers, data=payload)
                if response.status_code == 200:
                    results: Dict[str, str] = response.json()
                    # Write stdout/stderr captures to eval_cache_dir so
                    # that runtime outputs are isolated from the shared
                    # read-only cache.  get_cache_file() in getters/file.py
                    # reads from env.eval_cache_dir accordingly.
                    if stdout:
                        _out_dir = self.eval_cache_dir
                        os.makedirs(_out_dir, exist_ok=True)
                        with open(os.path.join(_out_dir, stdout), "w") as f:
                            f.write(results["output"])
                    if stderr:
                        _out_dir = self.eval_cache_dir
                        os.makedirs(_out_dir, exist_ok=True)
                        with open(os.path.join(_out_dir, stderr), "w") as f:
                            f.write(results["error"])
                    logger.debug(
                        "Setup command completed: returncode=%s",
                        results.get("returncode", 0),
                    )
                    returncode = results.get("returncode", 0)
                    status = results.get("status", "success")
                    if not until and (status != "success" or returncode != 0):
                        # Legacy OSWorld behaviour ignores non-zero returncodes
                        # (pkill/killall/rm etc. legitimately exit non-zero).
                        # Only abort when raise_on_error is set (cua_gym).
                        if raise_on_error:
                            raise SetupFailedError(
                                f"Command failed during setup: returncode={returncode}, status={status}"
                            )
                        else:
                            logger.warning(
                                "Setup command returned non-zero (ignored): returncode=%s, status=%s, command=%s",
                                returncode,
                                status,
                                " ".join(command) if isinstance(command, list) else command,
                            )
                            # Still persist stdout/stderr to eval_cache_dir for
                            # post-mortem (append per-command, skip if explicit
                            # captures were already written above).
                            if (
                                not stdout
                                and not stderr
                                and os.environ.get(
                                    "OSWORLD_SAVE_SETUP_FAILURE_OUTPUT", "0"
                                ) == "1"
                            ):
                                _out_dir = self.eval_cache_dir
                                os.makedirs(_out_dir, exist_ok=True)
                                _hdr = f"===== returncode={returncode} =====\n"
                                with open(os.path.join(_out_dir, "_setup_nonzero_stdout.txt"), "a") as f:
                                    f.write(_hdr + results.get("output", "")[:4000] + "\n")
                                with open(os.path.join(_out_dir, "_setup_nonzero_stderr.txt"), "a") as f:
                                    f.write(_hdr + results.get("error", "")[:4000] + "\n")
                else:
                    logger.error(
                        "Failed to execute setup command. Status code: %d",
                        response.status_code,
                    )
                    results = None
                    nb_failings += 1
            except requests.exceptions.RequestException as e:
                logger.error("An error occurred while trying to send the request: %s", e)
                traceback.print_exc()
                results = None
                nb_failings += 1
            if len(until) == 0:
                terminates = True
            elif results is not None:
                terminates = "returncode" in until and results["returncode"] == until["returncode"] \
                             or "stdout" in until and until["stdout"] in results["output"] \
                             or "stderr" in until and until["stderr"] in results["error"]
            terminates = terminates or nb_failings >= 5
            if not terminates:
                time.sleep(0.3)

    def _execute_with_verification_setup(
            self,
            command: List[str],
            verification: Dict[str, Any] = None,
            max_wait_time: int = 10,
            check_interval: float = 1.0,
            shell: bool = False
    ):
        """Execute command with verification of results
        
        Args:
            command: Command to execute
            verification: Dict with verification criteria:
                - window_exists: Check if window with this name exists
                - command_success: Execute this command and check if it succeeds
            max_wait_time: Maximum time to wait for verification
            check_interval: Time between verification checks
            shell: Whether to use shell
        """
        if not command:
            raise Exception("Empty command to launch.")

        verification = verification or {}
        
        payload = json.dumps({
            "command": command, 
            "shell": shell,
            "verification": verification,
            "max_wait_time": max_wait_time,
            "check_interval": check_interval
        })
        headers = {"Content-Type": "application/json"}

        try:
            response = requests.post(self.http_server + "/setup" + "/execute_with_verification", 
                                   headers=headers, data=payload, timeout=max_wait_time + 10)
            if response.status_code == 200:
                result = response.json()
                logger.debug("Setup command completed and passed verification")
                return result
            else:
                logger.error(
                    "Failed to execute with verification. Status code: %d",
                    response.status_code,
                )
                raise Exception(
                    f"Command verification failed with HTTP {response.status_code}"
                )
        except requests.exceptions.RequestException as e:
            logger.error("An error occurred while trying to send the request: %s", e)
            traceback.print_exc()
            raise Exception(f"Request failed: {e}")

    def _command_setup(self, command: List[str], **kwargs):
        self._execute_setup(command, **kwargs)

    def _sleep_setup(self, seconds: float):
        time.sleep(seconds)

    def _set_system_time_setup(self, date: str, time: str = "00:00:00"):
        """Set the system date and time on the VM.

        Args:
            date (str): Date string in YYYY-MM-DD format (e.g. "2026-03-03").
            time (str): Time string in HH:MM:SS format (e.g. "09:00:00"). Defaults to "00:00:00".
        """
        datetime_str = f"{date} {time}"
        password = self.client_password
        # Use timedatectl to disable NTP first, then set the time, to prevent
        # the system clock from being reset immediately by the time-sync service.
        cmd = (
            f"echo '{password}' | sudo -S bash -c '"
            "timedatectl set-ntp false 2>/dev/null || true; "
            f"timedatectl set-time \"{datetime_str}\" 2>/dev/null || "
            f"date -s \"{datetime_str}\"'"
        )
        self._execute_setup([cmd], shell=True)
        logger.info(f"System time set to: {datetime_str}")

    def _act_setup(self, action_seq: List[Union[Dict[str, Any], str]]):
        # TODO
        raise NotImplementedError()

    def _replay_setup(self, trajectory: str):
        """
        Args:
            trajectory (str): path to the replay trajectory file
        """

        # TODO
        raise NotImplementedError()

    def _activate_window_setup(self, window_name: str, strict: bool = False, by_class: bool = False):
        if not window_name:
            raise Exception(f"Setup Open - Invalid path ({window_name}).")

        payload = json.dumps({"window_name": window_name, "strict": strict, "by_class": by_class})
        headers = {
            'Content-Type': 'application/json'
        }

        # send request to server to open file
        try:
            response = requests.post(self.http_server + "/setup" + "/activate_window", headers=headers, data=payload)
            if response.status_code == 200:
                logger.debug("Window activated successfully")
            else:
                logger.error(
                    "Failed to activate window %s. Status code: %d",
                    window_name,
                    response.status_code,
                )
        except requests.exceptions.RequestException as e:
            logger.error("An error occurred while trying to send the request: %s", e)

    def _close_window_setup(self, window_name: str, strict: bool = False, by_class: bool = False):
        if not window_name:
            raise Exception(f"Setup Open - Invalid path ({window_name}).")

        payload = json.dumps({"window_name": window_name, "strict": strict, "by_class": by_class})
        headers = {
            'Content-Type': 'application/json'
        }

        # send request to server to open file
        try:
            response = requests.post(self.http_server + "/setup" + "/close_window", headers=headers, data=payload)
            if response.status_code == 200:
                logger.debug("Window closed successfully")
            else:
                logger.error(
                    "Failed to close window %s. Status code: %d",
                    window_name,
                    response.status_code,
                )
        except requests.exceptions.RequestException as e:
            logger.error("An error occurred while trying to send the request: %s", e)

    def _proxy_setup(self, client_password: str = ""):
        """Setup system-wide proxy configuration using proxy pool
        
        Args:
            client_password (str): Password for sudo operations, defaults to "password"
        """
        retry = 0
        while retry < MAX_RETRIES:
            try:
                _ = requests.get(self.http_server + "/terminal")
                break
            except:
                time.sleep(5)
                retry += 1
                logger.info(f"retry: {retry}/{MAX_RETRIES}")
            
            if retry == MAX_RETRIES:
                return False
            
        # Get proxy from global proxy pool
        proxy_pool = get_global_proxy_pool()
        current_proxy = proxy_pool.get_next_proxy()
        
        if not current_proxy:
            logger.error("No proxy available from proxy pool")
            raise Exception("No proxy available from proxy pool")
        
        # Format proxy URL.  The VM may not be able to resolve internal WOA DNS
        # names even when the host Pod can, so resolve the proxy hostname here
        # and inject the IP-based proxy URL into the VM.
        proxy_host_for_vm = current_proxy.host
        try:
            resolved_ips = [info[4][0] for info in socket.getaddrinfo(current_proxy.host, current_proxy.port)]
            resolved_ips = list(dict.fromkeys(resolved_ips))
            if resolved_ips:
                proxy_host_for_vm = resolved_ips[0]
                if proxy_host_for_vm != current_proxy.host:
                    logger.info(
                        "Resolved proxy host for VM: %s -> %s",
                        current_proxy.host,
                        proxy_host_for_vm,
                    )
        except Exception as e:
            logger.warning("Failed to resolve proxy host %s on host side: %s", current_proxy.host, e)

        if current_proxy.username and current_proxy.password:
            proxy_url = f"{current_proxy.protocol}://{current_proxy.username}:{current_proxy.password}@{proxy_host_for_vm}:{current_proxy.port}"
        else:
            proxy_url = f"{current_proxy.protocol}://{proxy_host_for_vm}:{current_proxy.port}"
        self.proxy_url = proxy_url
        logger.info(
            "Setting up proxy: %s:%s (VM uses %s:%s)",
            current_proxy.host,
            current_proxy.port,
            proxy_host_for_vm,
            current_proxy.port,
        )

        # OSWorker's mock backends are reachable only by direct IP; going through
        # the woa proxy gets a 403. The per-task _cua_gym_vm_bridge.sh rewrites
        # no_proxy with the runtime-detected values, but it runs *after* this
        # method, and only the 88 mock-backed tasks ship one. Seeding the host
        # here closes that window instead of relying on ordering.
        # MOCK_APP_BASE_URL is the same knob sync_mock_endpoints_v2.py reads.
        _mock_bypass = []
        _mock_base_url = os.environ.get("MOCK_APP_BASE_URL", "").strip()
        if _mock_base_url:
            _mock_host = urlparse(_mock_base_url).hostname
            if _mock_host:
                _mock_bypass.append(_mock_host)
                # Same /16 too, so a mock IP move on that segment stays bypassed.
                _octets = _mock_host.split(".")
                if len(_octets) == 4 and all(o.isdigit() for o in _octets):
                    _mock_bypass.append(f"{_octets[0]}.{_octets[1]}.0.0/16")
        no_proxy_value = ",".join(["localhost", "127.0.0.1", "28.33.*"] + _mock_bypass)
        # GNOME wants a Python-list literal, and it governs Chrome inside the VM.
        gnome_ignore_hosts = "[{}]".format(
            ", ".join(
                "'{}'".format(h)
                for h in ["localhost", "127.0.0.0/8", "28.33.*"] + _mock_bypass
            )
        )

        # Configure system proxy environment variables
        if os.environ.get("USE_TINYPROXY_SERVER", "False") == "True":
            proxy_commands = [
                f"echo '{client_password}' | sudo -S bash -c \"apt-get update\"", ## TODO: remove this line if ami is already updated
                f"echo '{client_password}' | sudo -S bash -c \"apt-get install -y tinyproxy\"", ## TODO: remove this line if tinyproxy is already installed
                f"echo '{client_password}' | sudo -S bash -c \"echo 'Port 18888' > /tmp/tinyproxy.conf\"",
                f"echo '{client_password}' | sudo -S bash -c \"echo 'Allow 127.0.0.1' >> /tmp/tinyproxy.conf\"",
                f"echo '{client_password}' | sudo -S bash -c \"echo 'Upstream http {current_proxy.username}:{current_proxy.password}@{proxy_host_for_vm}:{current_proxy.port}' >> /tmp/tinyproxy.conf\"",
            ]
        else:
            proxy_commands = [
                # GNOME commands to set system-wide proxy
                f"gsettings set org.gnome.system.proxy mode manual",
                f"gsettings set org.gnome.system.proxy.http host {proxy_host_for_vm}",
                f"gsettings set org.gnome.system.proxy.http port {current_proxy.port}",
                f"gsettings set org.gnome.system.proxy.https host {proxy_host_for_vm}",
                f"gsettings set org.gnome.system.proxy.https port {current_proxy.port}",
                f"gsettings set org.gnome.system.proxy.socks host {proxy_host_for_vm}",
                f"gsettings set org.gnome.system.proxy.socks port {current_proxy.port}",
                f"gsettings set org.gnome.system.proxy.ftp host {proxy_host_for_vm}",
                f"gsettings set org.gnome.system.proxy.ftp port {current_proxy.port}",
                # GNOME ignore-hosts for localhost (避免VM访问自己的端口时走代理)
                f"gsettings set org.gnome.system.proxy ignore-hosts \"{gnome_ignore_hosts}\"",
                # APT commands to set system-wide proxy
                f"echo '{client_password}' | sudo -S bash -c 'echo \"Acquire::http::Proxy \\\"{proxy_url}\\\";\" > /etc/apt/apt.conf.d/proxy.conf'",
                # VSCode commands to set system-wide proxy
                # "mkdir -p ~/.config/Code/User",
                f'echo \'{{"http.proxy": "{proxy_url}", "http.proxyStrictSSL": false, "http.proxySupport": "on"}}\' | tee ~/.config/Code/User/settings.json'
            ]
        proxy_commands.extend([
            # CML commands to set environment variables for proxy
            f"echo 'export http_proxy={proxy_url}' >> ~/.bashrc",
            f"echo 'export https_proxy={proxy_url}' >> ~/.bashrc",
            f"echo 'export HTTP_PROXY={proxy_url}' >> ~/.bashrc",
            f"echo 'export HTTPS_PROXY={proxy_url}' >> ~/.bashrc",
            # no_proxy for localhost and local network (避免VM访问自己的端口时走代理)
            f"echo 'export no_proxy={no_proxy_value}' >> ~/.bashrc",
            f"echo 'export NO_PROXY={no_proxy_value}' >> ~/.bashrc",
            # /etc/environment so non-login non-interactive shells inherit too
            # (e.g. `python3 /home/user/initial_setup.py` invoked via /setup/execute
            # does NOT source ~/.bashrc, so requests/urllib won't see the proxy
            # unless it's in /etc/environment.)
            f"echo '{client_password}' | sudo -S bash -c \"sed -i '/^\\(http_proxy\\|https_proxy\\|HTTP_PROXY\\|HTTPS_PROXY\\|no_proxy\\|NO_PROXY\\)=/d' /etc/environment; "
            f"{{ echo 'http_proxy=\\\"{proxy_url}\\\"'; "
            f"echo 'https_proxy=\\\"{proxy_url}\\\"'; "
            f"echo 'HTTP_PROXY=\\\"{proxy_url}\\\"'; "
            f"echo 'HTTPS_PROXY=\\\"{proxy_url}\\\"'; "
            f"echo 'no_proxy=\\\"{no_proxy_value}\\\"'; "
            f"echo 'NO_PROXY=\\\"{no_proxy_value}\\\"'; }} >> /etc/environment\"",
        ])

        # Execute all proxy configuration commands
        for cmd in proxy_commands:
            try:
                self._execute_setup([cmd], shell=True)
            except Exception as e:
                logger.error(f"Failed to execute proxy setup command: {e}")
                proxy_pool.mark_proxy_failed(current_proxy)
                raise
        
        if current_proxy.username and current_proxy.password:
            self._launch_setup(["tinyproxy -c /tmp/tinyproxy.conf -d"], shell=True)
        
        # Reload environment variables
        reload_cmd = "source /etc/environment"
        try:
            logger.info(f"Proxy setup completed successfully for {current_proxy.host}:{current_proxy.port}")
            proxy_pool.mark_proxy_success(current_proxy)
        except Exception as e:
            logger.error(f"Failed to reload environment variables: {e}")
            proxy_pool.mark_proxy_failed(current_proxy)
            raise

    # Chrome setup
    def _chrome_open_tabs_setup(self, urls_to_open: List[str]):
        host = self.vm_ip
        port = self.chromium_port  # fixme: this port is hard-coded, need to be changed from config file

        remote_debugging_url = f"http://{host}:{port}"
        logger.info("Connect to Chrome @: %s", remote_debugging_url)
        logger.debug("PLAYWRIGHT ENV: %s", repr(os.environ))
        for attempt in range(15):
            if attempt > 0:
                time.sleep(5)

            browser = None
            with sync_playwright() as p:
                try:
                    browser = p.chromium.connect_over_cdp(remote_debugging_url)
                    # break
                except Exception as e:
                    if attempt < 14:
                        logger.error(f"Attempt {attempt + 1}: Failed to connect, retrying. Error: {e}")
                        # time.sleep(10)
                        continue
                    else:
                        logger.error(f"Failed to connect after multiple attempts: {e}")
                        raise e

                if not browser:
                    return

                logger.info("Opening %s...", urls_to_open)
                for i, url in enumerate(urls_to_open):
                    # Use the first context (which should be the only one if using default profile)
                    if i == 0:
                        context = browser.contexts[0]

                    page = context.new_page()  # Create a new page (tab) within the existing context
                    try:
                        page.goto(url, timeout=60000)
                    except:
                        logger.warning("Opening %s exceeds time limit", url)  # only for human test
                    logger.info(f"Opened tab {i + 1}: {url}")

                    if i == 0:
                        # clear the default tab
                        default_page = context.pages[0]
                        default_page.close()

                # Do not close the context or browser; they will remain open after script ends
                return browser, context

    def _chrome_close_tabs_setup(self, urls_to_close: List[str]):
        time.sleep(5)  # Wait for Chrome to finish launching

        host = self.vm_ip
        port = self.chromium_port  # fixme: this port is hard-coded, need to be changed from config file

        remote_debugging_url = f"http://{host}:{port}"
        with sync_playwright() as p:
            browser = None
            for attempt in range(15):
                try:
                    browser = p.chromium.connect_over_cdp(remote_debugging_url)
                    break
                except Exception as e:
                    if attempt < 14:
                        logger.error(f"Attempt {attempt + 1}: Failed to connect, retrying. Error: {e}")
                        time.sleep(5)
                    else:
                        logger.error(f"Failed to connect after multiple attempts: {e}")
                        raise e

            if not browser:
                return

            for i, url in enumerate(urls_to_close):
                # Use the first context (which should be the only one if using default profile)
                if i == 0:
                    context = browser.contexts[0]

                for page in context.pages:

                    # if two urls are the same, close the tab
                    if compare_urls(page.url, url):
                        context.pages.pop(context.pages.index(page))
                        page.close()
                        logger.info(f"Closed tab {i + 1}: {url}")
                        break

            # Do not close the context or browser; they will remain open after script ends
            return browser, context

    # google drive setup
    def _googledrive_setup(self, **config):
        """ Clean google drive space (eliminate the impact of previous experiments to reset the environment)
        @args:
            config(Dict[str, Any]): contain keys
                settings_file(str): path to google drive settings file, which will be loaded by pydrive.auth.GoogleAuth()
                operation(List[str]): each operation is chosen from ['delete', 'upload']
                args(List[Dict[str, Any]]): parameters for each operation
            different args dict for different operations:
                for delete:
                    query(str): query pattern string to search files or folder in google drive to delete, please refer to
                        https://developers.google.com/drive/api/guides/search-files?hl=en about how to write query string.
                    trash(bool): whether to delete files permanently or move to trash. By default, trash=false, completely delete it.
                for mkdirs:
                    path(List[str]): the path in the google drive to create folder
                for upload:
                    path(str): remote url to download file
                    dest(List[str]): the path in the google drive to store the downloaded file
        """
        settings_file = config.get('settings_file', 'evaluation_examples/settings/googledrive/settings.yml')
        gauth = GoogleAuth(settings_file=settings_file)
        drive = GoogleDrive(gauth)

        def mkdir_in_googledrive(paths: List[str]):
            paths = [paths] if type(paths) != list else paths
            parent_id = 'root'
            for p in paths:
                q = f'"{parent_id}" in parents and title = "{p}" and mimeType = "application/vnd.google-apps.folder" and trashed = false'
                folder = drive.ListFile({'q': q}).GetList()
                if len(folder) == 0:  # not exists, create it
                    parents = {} if parent_id == 'root' else {'parents': [{'id': parent_id}]}
                    file = drive.CreateFile({'title': p, 'mimeType': 'application/vnd.google-apps.folder', **parents})
                    file.Upload()
                    parent_id = file['id']
                else:
                    parent_id = folder[0]['id']
            return parent_id

        for oid, operation in enumerate(config['operation']):
            if operation == 'delete':  # delete a specific file
                # query pattern string, by default, remove all files/folders not in the trash to the trash
                params = config['args'][oid]
                q = params.get('query', '')
                trash = params.get('trash', False)
                q_file = f"( {q} ) and mimeType != 'application/vnd.google-apps.folder'" if q.strip() else "mimeType != 'application/vnd.google-apps.folder'"
                filelist: GoogleDriveFileList = drive.ListFile({'q': q_file}).GetList()
                q_folder = f"( {q} ) and mimeType = 'application/vnd.google-apps.folder'" if q.strip() else "mimeType = 'application/vnd.google-apps.folder'"
                folderlist: GoogleDriveFileList = drive.ListFile({'q': q_folder}).GetList()
                for file in filelist:  # first delete file, then folder
                    file: GoogleDriveFile
                    if trash:
                        file.Trash()
                    else:
                        file.Delete()
                for folder in folderlist:
                    folder: GoogleDriveFile
                    # note that, if a folder is trashed/deleted, all files and folders in it will be trashed/deleted
                    if trash:
                        folder.Trash()
                    else:
                        folder.Delete()
            elif operation == 'mkdirs':
                params = config['args'][oid]
                mkdir_in_googledrive(params['path'])
            elif operation == 'upload':
                params = config['args'][oid]
                url = params['url']
                with tempfile.NamedTemporaryFile(mode='wb', delete=False) as tmpf:
                    response = requests.get(url, stream=True)
                    response.raise_for_status()
                    for chunk in response.iter_content(chunk_size=8192):
                        if chunk:
                            tmpf.write(chunk)
                    tmpf.close()
                    paths = [params['path']] if params['path'] != list else params['path']
                    parent_id = mkdir_in_googledrive(paths[:-1])
                    parents = {} if parent_id == 'root' else {'parents': [{'id': parent_id}]}
                    file = drive.CreateFile({'title': paths[-1], **parents})
                    file.SetContentFile(tmpf.name)
                    file.Upload()
                return
            else:
                raise ValueError('[ERROR]: not implemented clean type!')

    def _login_setup(self, **config):
        """ Login to a website with account and password information.
        @args:
            config(Dict[str, Any]): contain keys
                settings_file(str): path to the settings file
                platform(str): platform to login, implemented platforms include:
                    googledrive: https://drive.google.com/drive/my-drive

        """
        host = self.vm_ip
        port = self.chromium_port

        remote_debugging_url = f"http://{host}:{port}"
        with sync_playwright() as p:
            browser = None
            for attempt in range(15):
                try:
                    browser = p.chromium.connect_over_cdp(remote_debugging_url)
                    break
                except Exception as e:
                    if attempt < 14:
                        logger.error(f"Attempt {attempt + 1}: Failed to connect, retrying. Error: {e}")
                        time.sleep(5)
                    else:
                        logger.error(f"Failed to connect after multiple attempts: {e}")
                        raise e
            if not browser:
                return

            context = browser.contexts[0]
            platform = config['platform']

            if platform == 'googledrive':
                url = 'https://drive.google.com/drive/my-drive'
                page = context.new_page()  # Create a new page (tab) within the existing context
                try:
                    page.goto(url, timeout=60000)
                except:
                    logger.warning("Opening %s exceeds time limit", url)  # only for human test
                logger.info(f"Opened new page: {url}")
                settings = json.load(open(config['settings_file']))
                email, password = settings['email'], settings['password']

                try:
                    page.wait_for_selector('input[type="email"]', state="visible", timeout=3000)
                    page.fill('input[type="email"]', email)
                    page.click('#identifierNext > div > button')
                    page.wait_for_selector('input[type="password"]', state="visible", timeout=5000)
                    page.fill('input[type="password"]', password)
                    page.click('#passwordNext > div > button')
                    page.wait_for_load_state('load', timeout=5000)
                except TimeoutError:
                    logger.info('[ERROR]: timeout when waiting for google drive login page to load!')
                    return

            else:
                raise NotImplementedError

            return browser, context

    def _update_browse_history_setup(self, **config):
        cache_path = os.path.join(self.cache_dir, "history_new.sqlite")
        db_url = "https://huggingface.co/datasets/xlangai/ubuntu_osworld_file_cache/resolve/main/chrome/44ee5668-ecd5-4366-a6ce-c1c9b8d4e938/history_empty.sqlite?download=true"
        if not os.path.exists(cache_path):
            max_retries = 3
            downloaded = False
            e = None
            for i in range(max_retries):
                try:
                    response = requests.get(db_url, stream=True)
                    response.raise_for_status()

                    with open(cache_path, 'wb') as f:
                        for chunk in response.iter_content(chunk_size=8192):
                            if chunk:
                                f.write(chunk)
                    logger.info("File downloaded successfully")
                    downloaded = True
                    break

                except requests.RequestException as e:
                    logger.error(
                        f"Failed to download {db_url} caused by {e}. Retrying... ({max_retries - i - 1} attempts left)")
            if not downloaded:
                raise requests.RequestException(f"Failed to download {db_url}. No retries left. Error: {e}")
        else:
            logger.info("File already exists in cache directory")
        # copy a new history file in the tmp folder
        with tempfile.TemporaryDirectory() as tmp_dir:
            db_path = os.path.join(tmp_dir, "history_empty.sqlite")
            shutil.copy(cache_path, db_path)

            history = config['history']

            for history_item in history:
                url = history_item['url']
                title = history_item['title']
                visit_time = datetime.now() - timedelta(seconds=history_item['visit_time_from_now_in_seconds'])

                # Chrome use ms from 1601-01-01 as timestamp
                epoch_start = datetime(1601, 1, 1)
                chrome_timestamp = int((visit_time - epoch_start).total_seconds() * 1000000)

                conn = sqlite3.connect(db_path)
                cursor = conn.cursor()

                cursor.execute('''
                    INSERT INTO urls (url, title, visit_count, typed_count, last_visit_time, hidden)
                    VALUES (?, ?, ?, ?, ?, ?)
                ''', (url, title, 1, 0, chrome_timestamp, 0))

                url_id = cursor.lastrowid

                cursor.execute('''
                    INSERT INTO visits (url, visit_time, from_visit, transition, segment_id, visit_duration)
                    VALUES (?, ?, ?, ?, ?, ?)
                ''', (url_id, chrome_timestamp, 0, 805306368, 0, 0))

                conn.commit()
                conn.close()

            logger.info('Fake browsing history added successfully.')

            controller = PythonController(self.vm_ip, self.server_port)

            if "arm" in platform.machine():
                chrome_history_path = controller.execute_python_command(
                    "import os; print(os.path.join(os.getenv('HOME'), 'snap', 'chromium', 'common', 'chromium', 'Default', 'History'))")[
                    'output'].strip()
            else:
                chrome_history_path = controller.execute_python_command(
                    "import os; print(os.path.join(os.getenv('HOME'), '.config', 'google-chrome', 'Default', 'History'))")[
                    'output'].strip()

            form = MultipartEncoder({
                "file_path": chrome_history_path,
                "file_data": (os.path.basename(chrome_history_path), open(db_path, "rb"))
            })
            headers = {"Content-Type": form.content_type}
            logger.debug(form.content_type)

            # send request to server to upload file
            try:
                logger.debug("REQUEST ADDRESS: %s", self.http_server + "/setup" + "/upload")
                response = requests.post(self.http_server + "/setup" + "/upload", headers=headers, data=form)
                if response.status_code == 200:
                    logger.debug("Chrome history uploaded successfully")
                else:
                    logger.error(
                        "Failed to upload Chrome history. Status code: %d",
                        response.status_code,
                    )
            except requests.exceptions.RequestException as e:
                logger.error("An error occurred while trying to send the request: %s", e)

            self._execute_setup(["sudo chown -R user:user /home/user/.config/google-chrome/Default/History"], shell=True)
