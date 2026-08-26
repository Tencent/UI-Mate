import json
import logging
import platform
import time
from typing import Dict, Any, Union

import requests
from playwright.sync_api import sync_playwright

logger = logging.getLogger("desktopenv.getters.website")


def _ensure_playwright_installed(env) -> bool:
    """
    Ensure playwright is installed in the container.
    Always runs pip install (pip handles already-installed case efficiently).

    Args:
        env: Environment object with vm_ip and server_port

    Returns:
        True if playwright installation succeeded, False otherwise
    """
    execute_url = f"http://{env.vm_ip}:{env.server_port}/execute"

    try:
        # Always run pip install - it's idempotent and handles "already installed" efficiently
        logger.info(f"[WEBSITE_EVAL] Installing playwright in {env.vm_ip}...")

        install_response = requests.post(
            execute_url,
            json={"command": ["pip3", "install", "playwright"], "shell": False},
            timeout=180
        )

        if install_response.status_code == 200:
            data = install_response.json()
            returncode = data.get('returncode', 1)

            if returncode == 0:
                logger.info(f"[WEBSITE_EVAL] Playwright ready in {env.vm_ip}")
                return True
            else:
                logger.warning(f"[WEBSITE_EVAL] pip3 install failed in {env.vm_ip}, returncode={returncode}, error={data.get('error', '')[:200]}")
                return False
        else:
            logger.warning(f"[WEBSITE_EVAL] Install request failed with HTTP status {install_response.status_code}")
            return False

    except Exception as e:
        logger.warning(f"[WEBSITE_EVAL] Error installing playwright in {env.vm_ip}: {e}")
        return False


def _evaluate_via_execute_endpoint(env, evaluation_logic: str, task_url: str = None) -> Union[bool, None]:
    """
    Execute localStorage evaluation via the /execute endpoint.

    This method sends Python code to run inside the container, where Playwright
    connects to Chrome via localhost (more stable than cross-network CDP).

    Args:
        env: Environment object with vm_ip and server_port
        evaluation_logic: JavaScript code to evaluate in browser context
        task_url: Optional URL to navigate to before evaluation

    Returns:
        bool result if successful, None if method unavailable or failed
    """
    try:
        execute_url = f"http://{env.vm_ip}:{env.server_port}/execute"

        # Check/install playwright (no caching - each VM needs its own check)
        if not _ensure_playwright_installed(env):
            logger.warning(f"[WEBSITE_EVAL] Playwright not available in {env.vm_ip}, skipping container execution")
            return None

        # Escape the evaluation logic for embedding in Python string
        # Use base64 encoding to avoid escaping issues with complex JS code
        import base64
        encoded_logic = base64.b64encode(evaluation_logic.encode()).decode()
        encoded_url = base64.b64encode((task_url or '').encode()).decode() if task_url else ''

        # Python code to execute inside the container
        python_code = f'''
import json
import base64
import subprocess
import time
from playwright.sync_api import sync_playwright

evaluation_logic = base64.b64decode("{encoded_logic}").decode()
task_url = base64.b64decode("{encoded_url}").decode() if "{encoded_url}" else None

def connect_to_chrome(p, max_retries=5):
    """Try to connect to Chrome, start it if not running."""
    for attempt in range(max_retries):
        try:
            browser = p.chromium.connect_over_cdp("http://localhost:1337")
            return browser
        except Exception as e:
            if attempt == 0:
                # First failure - kill all Chrome processes and start fresh
                try:
                    subprocess.run(["pkill", "-9", "chrome"], stderr=subprocess.DEVNULL)
                    subprocess.run(["pkill", "-9", "chromium"], stderr=subprocess.DEVNULL)
                    time.sleep(1)  # Wait for processes to die
                    subprocess.Popen(
                        ["google-chrome", "--remote-debugging-port=1337", "--no-first-run", "--no-default-browser-check"],
                        stdout=subprocess.DEVNULL,
                        stderr=subprocess.DEVNULL
                    )
                    time.sleep(5)  # Wait for Chrome to start
                except:
                    pass
            elif attempt < max_retries - 1:
                time.sleep(2)  # Longer wait between retries
    return None

try:
    with sync_playwright() as p:
        browser = connect_to_chrome(p)
        if not browser:
            print(json.dumps({{"status": "error", "message": "Failed to connect to Chrome"}}))
        elif not browser.contexts:
            print(json.dumps({{"status": "error", "message": "No browser context"}}))
        else:
            if task_url:
                page = browser.contexts[0].new_page()
                page.goto(task_url, timeout=5000, wait_until="domcontentloaded")
            else:
                pages = browser.contexts[0].pages
                page = pages[0] if pages else browser.contexts[0].new_page()

            wrapped_logic = f"(function() {{{{ {{evaluation_logic}} }}}})()"
            result = page.evaluate(wrapped_logic)

            print(json.dumps({{"status": "success", "result": result}}))
except Exception as e:
    print(json.dumps({{"status": "error", "message": str(e)}}))
'''

        logger.info(f"[WEBSITE_EVAL] Trying container execution via /execute endpoint")

        # Send the Python code to execute
        response = requests.post(
            execute_url,
            json={"command": ["python3", "-c", python_code], "shell": False},
            timeout=60
        )

        if response.status_code == 200:
            data = response.json()
            if data.get('status') == 'success':
                output = data.get('output', '').strip()
                if output:
                    try:
                        result_data = json.loads(output)
                        if result_data.get('status') == 'success':
                            result = result_data.get('result', 0.0)
                            logger.info(f"[WEBSITE_EVAL] Container execution succeeded, result: {result}")
                            # Support dense reward: return float directly if numeric, else convert bool to float
                            if isinstance(result, (int, float)):
                                return float(result)
                            elif isinstance(result, bool):
                                return 1.0 if result else 0.0
                            else:
                                return 0.0
                        else:
                            logger.warning(f"[WEBSITE_EVAL] Container execution returned error: {result_data.get('message')}")
                            return None
                    except json.JSONDecodeError:
                        logger.warning(f"[WEBSITE_EVAL] Failed to parse container output: {output}")
                        return None
                else:
                    # Check stderr for errors
                    stderr = data.get('error', '')
                    if stderr:
                        logger.warning(f"[WEBSITE_EVAL] Container execution stderr: {stderr}")
                    return None
            else:
                logger.warning(f"[WEBSITE_EVAL] Execute endpoint returned error: {data.get('message')}")
                return None
        else:
            logger.warning(f"[WEBSITE_EVAL] Execute endpoint returned status {response.status_code}")
            return None

    except requests.exceptions.Timeout:
        logger.warning("[WEBSITE_EVAL] Container execution request timed out")
        return None
    except requests.exceptions.ConnectionError:
        logger.warning("[WEBSITE_EVAL] Container execution endpoint not available")
        return None
    except Exception as e:
        logger.warning(f"[WEBSITE_EVAL] Container execution failed: {e}")
        return None


def _evaluate_lightweight_via_execute(env, evaluation_logic: str) -> Dict[str, Any]:
    """
    Lightweight localStorage evaluation via /execute endpoint for per-step progress eval.

    Key differences from _evaluate_via_execute_endpoint():
    1. NO pkill chrome / restart Chrome on connection failure — just retry CDP connect
    2. NO new_page() — uses existing pages[0] (agent's active page, same origin for localStorage)
    3. Returns {"score": float, "success": bool} instead of float/None

    Everything else (pip install, retry count, timeouts) stays the same.
    """
    try:
        execute_url = f"http://{env.vm_ip}:{env.server_port}/execute"

        # Check/install playwright (idempotent, fast if already installed)
        if not _ensure_playwright_installed(env):
            logger.warning(f"[LIGHTWEIGHT_EVAL] Playwright not available in {env.vm_ip}")
            return {"score": 0.0, "success": False}

        import base64
        encoded_logic = base64.b64encode(evaluation_logic.encode()).decode()

        # Python code to execute inside the container
        # Two key differences from the original:
        # 1. connect_to_chrome: NO pkill/restart on failure, just retry
        # 2. Page selection: use pages[0] directly, NO new_page()
        python_code = f'''
import json
import base64
import time
from playwright.sync_api import sync_playwright

evaluation_logic = base64.b64decode("{encoded_logic}").decode()

def connect_to_chrome(p, max_retries=5):
    """Try to connect to Chrome. NO kill/restart — just retry."""
    for attempt in range(max_retries):
        try:
            browser = p.chromium.connect_over_cdp("http://localhost:1337")
            return browser
        except Exception as e:
            if attempt < max_retries - 1:
                time.sleep(2)
    return None

try:
    with sync_playwright() as p:
        browser = connect_to_chrome(p)
        if not browser:
            print(json.dumps({{"status": "error", "message": "Failed to connect to Chrome"}}))
        elif not browser.contexts:
            print(json.dumps({{"status": "error", "message": "No browser context"}}))
        elif not browser.contexts[0].pages:
            print(json.dumps({{"status": "error", "message": "No pages available"}}))
        else:
            page = browser.contexts[0].pages[0]

            wrapped_logic = f"(function() {{{{ {{evaluation_logic}} }}}})()"
            result = page.evaluate(wrapped_logic)

            print(json.dumps({{"status": "success", "result": result}}))
except Exception as e:
    print(json.dumps({{"status": "error", "message": str(e)}}))
'''

        logger.debug(f"[LIGHTWEIGHT_EVAL] Executing lightweight eval in {env.vm_ip}")

        # Send the Python code to execute (same timeout as original)
        response = requests.post(
            execute_url,
            json={"command": ["python3", "-c", python_code], "shell": False},
            timeout=60
        )

        if response.status_code == 200:
            data = response.json()
            if data.get('status') == 'success':
                output = data.get('output', '').strip()
                if output:
                    try:
                        result_data = json.loads(output)
                        if result_data.get('status') == 'success':
                            result = result_data.get('result', 0.0)
                            if isinstance(result, (int, float)):
                                return {"score": float(result), "success": True}
                            elif isinstance(result, bool):
                                return {"score": 1.0 if result else 0.0, "success": True}
                            else:
                                return {"score": 0.0, "success": True}
                        else:
                            logger.warning(f"[LIGHTWEIGHT_EVAL] Error: {result_data.get('message')}")
                            return {"score": 0.0, "success": False}
                    except json.JSONDecodeError:
                        logger.warning(f"[LIGHTWEIGHT_EVAL] Failed to parse output: {output[:200]}")
                        return {"score": 0.0, "success": False}

        return {"score": 0.0, "success": False}

    except requests.exceptions.Timeout:
        logger.warning("[LIGHTWEIGHT_EVAL] Request timed out")
        return {"score": 0.0, "success": False}
    except requests.exceptions.ConnectionError:
        logger.warning("[LIGHTWEIGHT_EVAL] Endpoint not available")
        return {"score": 0.0, "success": False}
    except Exception as e:
        logger.warning(f"[LIGHTWEIGHT_EVAL] Failed: {e}")
        return {"score": 0.0, "success": False}


def get_website_localStorage_lightweight(env, config: Dict[str, Any]) -> Dict[str, Any]:
    """
    Lightweight per-step progress evaluation for PPO-Returns mode.

    Designed to be called repeatedly every step without side effects:
    - NO new browser tabs (uses existing pages[0])
    - NO Chrome kill/restart (just retries CDP connection)
    - Everything else (pip install, timeouts, retries) stays the same as original

    Args:
        env: Environment object with vm_ip, server_port, task_id
        config: Dict with 'evaluation_logic' key (JavaScript code)

    Returns:
        Dict: {"score": float (0.0-1.0), "success": bool}
    """
    evaluation_logic = config.get('evaluation_logic', '')

    if not evaluation_logic:
        logger.warning("[LIGHTWEIGHT_EVAL] No evaluation_logic provided")
        return {"score": 0.0, "success": False}

    try:
        return _evaluate_lightweight_via_execute(env, evaluation_logic)
    except Exception as e:
        logger.warning(f"[LIGHTWEIGHT_EVAL] Unexpected error: {e}")
        return {"score": 0.0, "success": False}


def get_website_localStorage_evaluation(env, config: Dict[str, Any]) -> float:
    """
    Execute JavaScript evaluation logic in the browser context to check localStorage-based conditions.

    This function first tries to execute via the container's /execute endpoint (more stable),
    and falls back to direct CDP connection if that fails.

    Args:
        env (Any): The environment object containing VM connection details.
        config (Dict[str, Any]): The configuration dictionary containing:
            - evaluation_logic (str): JavaScript code that returns a float value (0.0-1.0)
                                     for dense reward, or boolean for binary reward.
                                     The code has access to localStorage and can execute
                                     any evaluation logic needed.

    Returns:
        float: The result of executing evaluation_logic in the browser context (0.0-1.0).
               Returns 0.0 if any error occurs during evaluation.

    Example config:
        {
            "evaluation_logic": "const input = localStorage.getItem('lastSearchInput'); return input !== null ? 1.0 : 0.0;"
        }
    """
    evaluation_logic = config.get('evaluation_logic', '')

    if not evaluation_logic:
        logger.error("[WEBSITE_EVAL] No evaluation_logic provided in config")
        return 0.0

    logger.info("[WEBSITE_EVAL] Starting localStorage-based evaluation")
    logger.debug(f"[WEBSITE_EVAL] Evaluation logic length: {len(evaluation_logic)} characters")

    # Construct task URL for localStorage evaluation
    website_dir = env.task_id.rsplit('_', 1)[0] if hasattr(env, 'task_id') else None
    task_url = f"file:///home/user/{website_dir}/index.html" if website_dir else None

    # Method 1: Try container execution via /execute endpoint (more stable)
    result = _evaluate_via_execute_endpoint(env, evaluation_logic, task_url)
    if result is not None:
        return result

    # Method 2: Fall back to direct CDP connection (original method)
    logger.warning("[WEBSITE_EVAL] Container execution failed, falling back to direct CDP connection (less stable)...")

    try:
        host = env.vm_ip
        port = env.chromium_port
        server_port = env.server_port
        remote_debugging_url = f"http://{host}:{port}"
        backend_url = f"http://{host}:{server_port}"
        use_proxy = env.current_use_proxy

        logger.info(f"[WEBSITE_EVAL] Connecting to Chrome at {remote_debugging_url}")

        with sync_playwright() as p:
            # Connect to remote Chrome instance with retry logic
            browser = None
            connection_successful = False

            # Try connecting to existing browser with retries
            for attempt in range(3):
                try:
                    browser = p.chromium.connect_over_cdp(remote_debugging_url, timeout=15000)  # 15 seconds timeout
                    logger.info(f"[WEBSITE_EVAL] Successfully connected to existing Chrome instance on attempt {attempt + 1}")
                    connection_successful = True
                    break
                except Exception as e:
                    if attempt < 2:
                        logger.warning(f"[WEBSITE_EVAL] Connection attempt {attempt + 1}/3 failed: {e}, retrying...")
                        time.sleep(2)
                    else:
                        logger.warning(f"[WEBSITE_EVAL] Failed to connect to existing Chrome instance after 3 attempts: {e}")

            # If connection still failed, start new browser instance
            if not connection_successful:
                logger.warning("[WEBSITE_EVAL] Starting new Chrome instance...")

                # Use fixed port 1337 to match task configuration
                # Task config launches Chrome with --remote-debugging-port=1337
                app = 'chromium' if 'arm' in platform.machine() else 'google-chrome'
                internal_port = 1337

                command = [app, f"--remote-debugging-port={internal_port}"]

                logger.warning(f"[WEBSITE_EVAL] Starting browser with command: {' '.join(command)}")
                payload = json.dumps({"command": command, "shell": False})
                headers = {"Content-Type": "application/json"}
                requests.post(backend_url + "/setup/launch", headers=headers, data=payload)

                time.sleep(5)  # Wait for Chrome to start
                browser = p.chromium.connect_over_cdp(remote_debugging_url, timeout=15000)  # 15 seconds timeout
                logger.warning("[WEBSITE_EVAL] Successfully connected to new Chrome instance")
                connection_successful = True

            if not browser:
                raise RuntimeError("[WEBSITE_EVAL] Failed to establish browser connection")

            # Ensure browser context exists
            if not browser.contexts:
                logger.error("[WEBSITE_EVAL] No browser context found")
                return {
                    "result": 0.0,
                    "error_type": "chrome_connection_error",
                    "error_message": "No browser context found"
                }

            # Load task page for localStorage evaluation
            # Extract website directory from task_id (e.g., "95_news_website_4" -> "95_news_website")
            website_dir = env.task_id.rsplit('_', 1)[0] if hasattr(env, 'task_id') else None

            if website_dir:
                # Construct task page URL
                task_url = f"file:///home/user/{website_dir}/index.html"
                page = browser.contexts[0].new_page()
                try:
                    # Use domcontentloaded for faster loading of local files
                    page.goto(task_url, timeout=5000, wait_until='domcontentloaded')
                    logger.info(f"[WEBSITE_EVAL] Loaded task page: {task_url}")
                except Exception as goto_error:
                    logger.warning(f"[WEBSITE_EVAL] Failed to load task page {task_url}: {goto_error}")
                    # Fallback: use existing page if available
                    if browser.contexts[0].pages:
                        page = browser.contexts[0].pages[0]
                        logger.info("[WEBSITE_EVAL] Using fallback: first existing page")
                    else:
                        logger.warning("[WEBSITE_EVAL] No fallback page available, using blank page")
            else:
                # Fallback: use existing page if no task_id available
                logger.warning("[WEBSITE_EVAL] No task_id available, using first existing page")
                if browser.contexts[0].pages:
                    page = browser.contexts[0].pages[0]
                else:
                    page = browser.contexts[0].new_page()
                    logger.warning("[WEBSITE_EVAL] No existing pages, created blank page")

            # Wrap the evaluation logic in an IIFE (Immediately Invoked Function Expression)
            # to ensure proper scoping and return value
            wrapped_logic = f"(function() {{ {evaluation_logic} }})()"

            logger.info("[WEBSITE_EVAL] Executing evaluation logic in browser context...")

            # Execute the evaluation logic in the browser context
            try:
                result = page.evaluate(wrapped_logic)
                logger.info(f"[WEBSITE_EVAL] Evaluation result: {result}")

                # Support dense reward: convert result to float
                if isinstance(result, (int, float)):
                    result = float(result)
                elif isinstance(result, bool):
                    result = 1.0 if result else 0.0
                else:
                    logger.warning(f"[WEBSITE_EVAL] Unexpected result type: {type(result)}. Converting to 0.0")
                    result = 0.0

            except Exception as eval_error:
                logger.error(f"[WEBSITE_EVAL] Error executing evaluation logic: {eval_error}")
                result = 0.0

            return result

    except Exception as e:
        logger.error(f"[WEBSITE_EVAL] Unexpected error during evaluation: {e}", exc_info=True)
        # Check if this is a Chrome connection error
        error_msg = str(e).lower()
        is_chrome_error = any(keyword in error_msg for keyword in [
            'connection refused', 'connect_over_cdp', 'timeout',
            'failed to connect', 'browser connection', 'browser closed',
            'target closed', 'cdp', 'chromium'
        ])
        return {
            "result": 0.0,
            "error_type": "chrome_connection_error" if is_chrome_error else "evaluation_error",
            "error_message": str(e)
        }


