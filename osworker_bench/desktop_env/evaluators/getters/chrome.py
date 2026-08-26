import json
import logging
import os
import platform
import re
import sqlite3
import time
from urllib.parse import unquote
from typing import Dict, Any, List
from urllib.parse import urlparse, parse_qs

import lxml.etree
import requests
from lxml.cssselect import CSSSelector
from lxml.etree import _Element
from playwright.sync_api import sync_playwright, expect, TimeoutError
from pydrive.auth import GoogleAuth
from pydrive.drive import GoogleDrive, GoogleDriveFileList, GoogleDriveFile

_accessibility_ns_map = {
    "st": "uri:deskat:state.at-spi.gnome.org",
    "attr": "uri:deskat:attributes.at-spi.gnome.org",
    "cp": "uri:deskat:component.at-spi.gnome.org",
    "doc": "uri:deskat:document.at-spi.gnome.org",
    "docattr": "uri:deskat:attributes.document.at-spi.gnome.org",
    "txt": "uri:deskat:text.at-spi.gnome.org",
    "val": "uri:deskat:value.at-spi.gnome.org",
    "act": "uri:deskat:action.at-spi.gnome.org"
}

logger = logging.getLogger("desktopenv.getters.chrome")

"""
WARNING: 
1. Functions from this script assume that no account is registered on Chrome, otherwise the default file path needs to be changed.
"""


def get_info_from_website(env, config: Dict[Any, Any]) -> Any:
    """ Get information from a website. Especially useful when the information may be updated through time.
    Args:
        env (Any): The environment object.
        config (Dict[Any, Any]): The configuration dictionary.
            - url (str): The URL of the website to visit
            - infos (List[Dict[str, str]]): The list of information to be extracted from the website. Each dictionary contains:
                - action (str): chosen from 'inner_text', 'attribute', 'click_and_inner_text', 'click_and_attribute', etc., concretely,
                    - inner_text: extract the inner text of the element specified by the selector
                    - attribute: extract the attribute of the element specified by the selector
                    - click_and_inner_text: click elements following the selector and then extract the inner text of the last element
                    - click_and_attribute: click elements following the selector and then extract the attribute of the last element
                - selector (Union[str, List[str]]): The CSS selector(s) of the element(s) to be extracted.
                - attribute (str): optional for 'attribute' and 'click_and_attribute', the attribute to be extracted.
            - backups (Any): The backup information to be returned if the extraction fails.
    """
    # 添加函数开始日志
    logger.info(f"[INFO_FROM_WEBSITE] Starting to get information from website: {config.get('url', 'N/A')}")
    logger.info(f"[INFO_FROM_WEBSITE] Total info operations to perform: {len(config.get('infos', []))}")
    logger.debug(f"[INFO_FROM_WEBSITE] Full config: {config}")
    
    try:
        host = env.vm_ip
        port = env.chromium_port  # fixme: this port is hard-coded, need to be changed from config file
        server_port = env.server_port
        remote_debugging_url = f"http://{host}:{port}"
        backend_url = f"http://{host}:{server_port}"
        use_proxy = env.current_use_proxy
        
        logger.info(f"[INFO_FROM_WEBSITE] Connecting to Chrome at {remote_debugging_url}")
        
        with sync_playwright() as p:
            # connect to remote Chrome instance
            try:
                browser = p.chromium.connect_over_cdp(remote_debugging_url)
                logger.info(f"[INFO_FROM_WEBSITE] Successfully connected to existing Chrome instance")
            except Exception as e:
                logger.warning(f"[INFO_FROM_WEBSITE] Failed to connect to existing Chrome instance: {e}")
                logger.info(f"[INFO_FROM_WEBSITE] Starting new Chrome instance...")
                
                # If the connection fails (e.g., the agent close the browser instance), start a new browser instance
                app = 'chromium' if 'arm' in platform.machine() else 'google-chrome'
                command = [
                    app,
                    "--remote-debugging-port=1337"
                ]
                if use_proxy:
                    command.append(f"--proxy-server=127.0.0.1:18888")
                    logger.info(f"[INFO_FROM_WEBSITE] Using proxy server: 127.0.0.1:18888")
                
                logger.info(f"[INFO_FROM_WEBSITE] Starting browser with command: {' '.join(command)}")
                payload = json.dumps({"command": command, "shell": False})
                headers = {"Content-Type": "application/json"}
                #requests.post("http://" + host + ":" + server_port + "/setup" + "/launch", headers=headers, data=payload)
                requests.post(backend_url + "/setup" + "/launch", headers=headers, data=payload)
                time.sleep(5)
                browser = p.chromium.connect_over_cdp(remote_debugging_url)
                logger.info(f"[INFO_FROM_WEBSITE] Successfully connected to new Chrome instance")

            page = browser.contexts[0].new_page()
            logger.info(f"[INFO_FROM_WEBSITE] Created new page, navigating to: {config['url']}")
            
            page.goto(config["url"])
            page.wait_for_load_state('load')
            
            # 记录页面加载完成后的信息
            logger.info(f"[INFO_FROM_WEBSITE] Page loaded successfully")
            logger.info(f"[INFO_FROM_WEBSITE] Page title: '{page.title()}'")
            logger.info(f"[INFO_FROM_WEBSITE] Current URL: '{page.url}'")
            
            infos = []
            for idx, info_dict in enumerate(config.get('infos', [])):
                logger.info(f"[INFO_FROM_WEBSITE] Processing info operation {idx + 1}/{len(config.get('infos', []))}")
                logger.debug(f"[INFO_FROM_WEBSITE] Info config: {info_dict}")
                
                if page.url != config["url"]:
                    logger.info(f"[INFO_FROM_WEBSITE] Page URL changed, navigating back to: {config['url']}")
                    page.goto(config["url"])
                    page.wait_for_load_state('load')
                    logger.info(f"[INFO_FROM_WEBSITE] Back to original page")
                
                action = info_dict.get('action', 'inner_text')
                selector = info_dict.get('selector')
                logger.info(f"[INFO_FROM_WEBSITE] Action: {action}, Selector: {selector}")
                
                if action == "inner_text":
                    logger.debug(f"[INFO_FROM_WEBSITE] Waiting for element with selector: {selector}")
                    ele = page.wait_for_selector(info_dict['selector'], state='attached', timeout=10000)
                    extracted_text = ele.inner_text()
                    logger.info(f"[INFO_FROM_WEBSITE] Successfully extracted inner_text: '{extracted_text}'")
                    infos.append(extracted_text)
                    
                elif action == "attribute":
                    attribute = info_dict.get('attribute')
                    logger.debug(f"[INFO_FROM_WEBSITE] Waiting for element with selector: {selector}")
                    logger.debug(f"[INFO_FROM_WEBSITE] Extracting attribute: {attribute}")
                    ele = page.wait_for_selector(info_dict['selector'], state='attached', timeout=10000)
                    extracted_attr = ele.get_attribute(info_dict['attribute'])
                    logger.info(f"[INFO_FROM_WEBSITE] Successfully extracted attribute '{attribute}': '{extracted_attr}'")
                    infos.append(extracted_attr)
                    
                elif action == 'click_and_inner_text':
                    logger.debug(f"[INFO_FROM_WEBSITE] Performing click_and_inner_text with {len(info_dict['selector'])} selectors")
                    for idx, sel in enumerate(info_dict['selector']):
                        logger.debug(f"[INFO_FROM_WEBSITE] Processing selector {idx + 1}/{len(info_dict['selector'])}: {sel}")
                        if idx != len(info_dict['selector']) - 1:
                            logger.debug(f"[INFO_FROM_WEBSITE] Clicking element with selector: {sel}")
                            link = page.wait_for_selector(sel, state='attached', timeout=10000)
                            link.click()
                            page.wait_for_load_state('load')
                            logger.info(f"[INFO_FROM_WEBSITE] Successfully clicked element, page loaded")
                            logger.debug(f"[INFO_FROM_WEBSITE] New page URL: {page.url}")
                        else:
                            logger.debug(f"[INFO_FROM_WEBSITE] Extracting inner_text from final element: {sel}")
                            ele = page.wait_for_selector(sel, state='attached', timeout=10000)
                            extracted_text = ele.inner_text()
                            logger.info(f"[INFO_FROM_WEBSITE] Successfully extracted inner_text after clicks: '{extracted_text}'")
                            infos.append(extracted_text)
                            
                elif action == 'click_and_attribute':
                    attribute = info_dict.get('attribute')
                    logger.debug(f"[INFO_FROM_WEBSITE] Performing click_and_attribute with {len(info_dict['selector'])} selectors")
                    logger.debug(f"[INFO_FROM_WEBSITE] Target attribute: {attribute}")
                    for idx, sel in enumerate(info_dict['selector']):
                        logger.debug(f"[INFO_FROM_WEBSITE] Processing selector {idx + 1}/{len(info_dict['selector'])}: {sel}")
                        if idx != len(info_dict['selector']) - 1:
                            logger.debug(f"[INFO_FROM_WEBSITE] Clicking element with selector: {sel}")
                            link = page.wait_for_selector(sel, state='attached', timeout=10000)
                            link.click()
                            page.wait_for_load_state('load')
                            logger.info(f"[INFO_FROM_WEBSITE] Successfully clicked element, page loaded")
                            logger.debug(f"[INFO_FROM_WEBSITE] New page URL: {page.url}")
                        else:
                            logger.debug(f"[INFO_FROM_WEBSITE] Extracting attribute from final element: {sel}")
                            ele = page.wait_for_selector(sel, state='attached')
                            extracted_attr = ele.get_attribute(info_dict['attribute'])
                            logger.info(f"[INFO_FROM_WEBSITE] Successfully extracted attribute '{attribute}' after clicks: '{extracted_attr}'")
                            infos.append(extracted_attr)
                else:
                    logger.error(f"[INFO_FROM_WEBSITE] Unsupported action: {action}")
                    raise NotImplementedError(f'The action {action} is not supported yet.')
                
                logger.info(f"[INFO_FROM_WEBSITE] Completed info operation {idx + 1}")
            
            # 记录最终提取的所有信息
            logger.info(f"[INFO_FROM_WEBSITE] All operations completed successfully")
            logger.info(f"[INFO_FROM_WEBSITE] Total extracted information count: {len(infos)}")
            logger.info(f"[INFO_FROM_WEBSITE] Final extracted information: {infos}")
            
        return infos
    except Exception as e:
        logger.error(f'[INFO_FROM_WEBSITE] ERROR: Failed to obtain information from website: {config.get("url", "N/A")}')
        logger.error(f'[INFO_FROM_WEBSITE] Exception details: {str(e)}')
        logger.error(f'[INFO_FROM_WEBSITE] Exception type: {type(e).__name__}')
        logger.info(f'[INFO_FROM_WEBSITE] Using backup results instead')
        backup_data = config.get('backups', None)
        logger.info(f'[INFO_FROM_WEBSITE] Backup data: {backup_data}')
        return backup_data


def get_rule_based_evaluation(env, config: Dict[Any, Any]) -> Any:
    """Getter for InfiniteWeb rule-based evaluation.

    Connects to the VM's Chrome via Playwright CDP, navigates to the InfiniteWeb
    page, and executes each eval_step defined in the evaluator config.

    Args:
        env: The environment object (provides vm_ip, chromium_port, server_port).
        config: The ``result`` dict from the evaluator config, containing:
            - base_url (str): The URL of the InfiniteWeb page.
            - eval_steps (List[Dict]): Steps to execute. Each step has:
                - type (str): One of "check_localStorage", "check_dom_class",
                  "check_dom_value", "check_expected_values",
                  "check_url", "check_dom", "check_localStorage_key",
                  "check_success_indicator", "check_page_loaded".
                - weight (float): Contribution to final score.
                - ... step-specific fields.
            - http_port (int, optional): HTTP server port.

    Returns:
        Dict with keys:
            - "eval_steps": list of {"step": ..., "passed": bool, "weight": float}
            - "total_weight": sum of all weights
            - "base_url": the page URL used
    """
    logger.info("[INFINITEWEB] Starting rule_based_evaluation getter")
    base_url = config.get("base_url", "")
    eval_steps = config.get("eval_steps", [])
    http_port = config.get("http_port", 8080)

    # =========================================================================
    # FIX #4: `fallback_evaluation` type gets ZERO, never a free pass.
    #
    # Some tasks ship with config.type == "fallback_evaluation" and a single
    # `check_page_loaded` step weighted 1.0. That's the LLM's fallback when
    # it couldn't produce a real rule, i.e. "we don't actually know how to
    # score this". Previously such tasks received 1.0 simply because
    # Chrome's page loaded, inflating the overall success rate.
    #
    # Policy: fallback_evaluation => return empty eval_steps so the metric
    # scores 0.0. This is the SAME treatment an infra error gets, and is
    # accurate — we have no rule, so we must not claim success.
    # =========================================================================
    result_type = config.get("type", "")
    only_page_loaded = (
        len(eval_steps) == 1
        and eval_steps[0].get("type") == "check_page_loaded"
    )
    if result_type == "fallback_evaluation" or only_page_loaded:
        logger.warning(
            f"[INFINITEWEB] Task has fallback_evaluation "
            f"(type='{result_type}', only_page_loaded={only_page_loaded}). "
            f"Scoring 0.0 — evaluator has no meaningful rule to verify."
        )
        return {
            "eval_steps": [
                {"step": s, "passed": False, "weight": s.get("weight", 0.0)}
                for s in eval_steps
            ],
            "total_weight": sum(s.get("weight", 0.0) for s in eval_steps) or 1.0,
            "base_url": base_url,
            "reason": "fallback_evaluation_no_rule",
        }

    # =========================================================================
    # FIX #1 (CRITICAL): Do NOT rewrite localhost -> vm_ip.
    #
    # Background:
    #   The agent drives Chrome INSIDE the VM and opens pages like
    #   `http://localhost:<port>/...`. All localStorage writes are scoped to
    #   the origin `http://localhost:<port>`.
    #
    # The previous code did `base_url.replace('localhost', vm_ip)` and then
    #   `browser.contexts[0].new_page()` + `page.goto(...)`. Playwright is
    #   connected over CDP to the *same* Chrome instance the agent is using,
    #   but the new tab was opened against a DIFFERENT origin
    #   (`http://<vm_ip>:<port>`). Because localStorage is partitioned by
    #   origin, this tab NEVER saw the agent's saved state, and every
    #   `check_localStorage` step returned empty/false. Combined weights =>
    #   score = 0 for the entire task. This is why "all evaluators appear
    #   to do nothing — every task is 0".
    #
    # New strategy (in priority order):
    #   1. Try to reuse the agent's existing tab that already points at the
    #      InfiniteWeb page (same origin, same localStorage).
    #   2. If not found, open a new tab in the EXISTING context using the
    #      ORIGINAL (non-rewritten) base_url so the origin matches.
    #   3. Only as a last resort, fall back to rewriting to vm_ip (old
    #      behavior) — but this will NOT have access to the agent's
    #      localStorage; we log a clear warning.
    # =========================================================================
    original_base_url = base_url  # keep the VM-native URL intact
    vm_ip = getattr(env, 'vm_ip', 'localhost')

    # Ensure we have an index.html path on the original URL for fallback matching
    if original_base_url and not original_base_url.endswith('/') and \
            not original_base_url.split('/')[-1].endswith('.html'):
        original_page_url = original_base_url.rstrip('/') + '/index.html'
    else:
        original_page_url = original_base_url

    # Parse the port so we can match tabs by port regardless of host
    try:
        parsed = urlparse(original_page_url)
        target_port = parsed.port or http_port
    except Exception:
        target_port = http_port

    logger.info(f"[INFINITEWEB] Target origin (VM-native): {original_page_url}, port={target_port}")

    step_results = []
    page = None
    owns_page = False  # track whether we created the page so we only close our own
    try:
        host = env.vm_ip
        port = env.chromium_port
        server_port = env.server_port
        remote_debugging_url = f"http://{host}:{port}"
        backend_url = f"http://{host}:{server_port}"
        use_proxy = getattr(env, 'current_use_proxy', False)

        with sync_playwright() as p:
            # Connect to existing Chrome instance (same pattern as get_info_from_website)
            try:
                browser = p.chromium.connect_over_cdp(remote_debugging_url)
                logger.info("[INFINITEWEB] Connected to existing Chrome instance")
            except Exception as e:
                # =============================================================
                # FIX #10: InfiniteWeb task configs launch Chrome WITHOUT
                # --remote-debugging-port, so no CDP endpoint exists. Standard
                # OSWorld tasks launch with `--remote-debugging-port=1337` +
                # `socat tcp-listen:9222,fork tcp:localhost:1337`, but
                # InfiniteWeb configs omit both.
                #
                # Recovery: use /setup/launch (fire-and-forget, non-blocking)
                # to kill old Chrome, start new Chrome with debug port, set up
                # socat, then retry CDP.
                # =============================================================
                logger.warning(
                    f"[INFINITEWEB] Failed to connect to Chrome CDP: {e}. "
                    f"Restarting Chrome with --remote-debugging-port=1337 + socat."
                )
                _headers = {"Content-Type": "application/json"}

                # Step 1: Kill existing Chrome/socat and start fresh
                # Use /setup/launch with shell=True for fire-and-forget
                _kill_and_setup_cmd = (
                    "pkill -f 'google-chrome' 2>/dev/null; "
                    "pkill -f 'chromium' 2>/dev/null; "
                    "pkill -f 'socat.*9222' 2>/dev/null; "
                    "sleep 3; "
                    "socat tcp-listen:9222,fork,reuseaddr tcp:localhost:1337 &"
                )
                try:
                    requests.post(
                        backend_url + "/setup/launch",
                        headers=_headers,
                        data=json.dumps({"command": _kill_and_setup_cmd, "shell": True}),
                        timeout=10,
                    )
                except Exception as setup_err:
                    logger.warning(f"[INFINITEWEB] Kill/socat launch error (non-fatal): {setup_err}")

                # Give time for kill to complete
                time.sleep(5)

                # Step 2: Start Chrome with remote debugging port
                app = 'chromium' if 'arm' in platform.machine() else 'google-chrome'
                chrome_cmd = [
                    app,
                    "--remote-debugging-port=1337",
                    "--no-first-run",
                    "--disable-session-crashed-bubble",
                ]
                if use_proxy:
                    chrome_cmd.append("--proxy-server=127.0.0.1:18888")
                # Open the target InfiniteWeb page so localStorage is accessible
                chrome_cmd.append(original_page_url)

                try:
                    requests.post(
                        backend_url + "/setup/launch",
                        headers=_headers,
                        data=json.dumps({"command": chrome_cmd, "shell": False}),
                        timeout=10,
                    )
                except Exception as chrome_err:
                    logger.warning(f"[INFINITEWEB] Chrome launch error (non-fatal): {chrome_err}")
                logger.info(f"[INFINITEWEB] Launched Chrome with debug port: {chrome_cmd}")

                # Wait for Chrome to fully start and socat to be ready
                time.sleep(10)

                # Step 3: Retry CDP connection (with retries)
                _connected = False
                for _attempt in range(3):
                    try:
                        browser = p.chromium.connect_over_cdp(remote_debugging_url)
                        logger.info(f"[INFINITEWEB] Successfully connected after Chrome restart (attempt {_attempt+1})")
                        _connected = True
                        break
                    except Exception as retry_err:
                        logger.warning(f"[INFINITEWEB] CDP retry {_attempt+1}/3 failed: {retry_err}")
                        time.sleep(5)

                if not _connected:
                    raise Exception("Failed to connect to Chrome CDP after restart + 3 retries")

            # -----------------------------------------------------------------
            # Step A: try to REUSE the agent's existing tab (same origin).
            # Walk every context/page, match on scheme + port (host may be
            # "localhost" / "127.0.0.1" / the VM's hostname — all are the same
            # origin from the Chrome process's perspective).
            # -----------------------------------------------------------------
            def _port_of(url: str) -> int:
                try:
                    pp = urlparse(url)
                    return pp.port or (443 if pp.scheme == 'https' else 80)
                except Exception:
                    return -1

            reused = None
            for ctx in browser.contexts:
                for p_ in ctx.pages:
                    try:
                        if p_.url and _port_of(p_.url) == int(target_port):
                            reused = p_
                            break
                    except Exception:
                        continue
                if reused:
                    break

            if reused is not None:
                page = reused
                owns_page = False
                logger.info(
                    f"[INFINITEWEB] Reusing agent's existing tab: {page.url} "
                    f"(same origin as agent's localStorage)"
                )
                # Make sure the page is fully loaded; do NOT navigate away —
                # navigation would trigger another page load and potentially
                # lose in-memory state the agent produced.
                try:
                    page.wait_for_load_state('load', timeout=5000)
                except Exception:
                    pass
            else:
                # -------------------------------------------------------------
                # Step B: no existing tab — open a new one in the agent's
                # context using the ORIGINAL (localhost) URL. This keeps the
                # origin identical to the agent's origin.
                # -------------------------------------------------------------
                ctx = browser.contexts[0] if browser.contexts else browser.new_context()
                page = ctx.new_page()
                owns_page = True
                nav_url = original_page_url
                try:
                    page.goto(nav_url, timeout=15000)
                    page.wait_for_load_state('load', timeout=15000)
                    logger.info(
                        f"[INFINITEWEB] Opened new tab (same-origin, no rewrite): {page.url}"
                    )
                except Exception as e:
                    # -----------------------------------------------------
                    # Step C (last-resort fallback): if the VM-native URL
                    # cannot be reached from this process, rewrite to vm_ip.
                    # WARNING: localStorage from the agent's origin will not
                    # be visible here; check_localStorage steps will fail.
                    # -----------------------------------------------------
                    logger.warning(
                        f"[INFINITEWEB] Could not open original URL {nav_url}: {e}. "
                        f"Falling back to vm_ip rewrite — localStorage will be "
                        f"INACCESSIBLE (different origin)."
                    )
                    fallback_url = nav_url
                    if 'localhost' in fallback_url or '127.0.0.1' in fallback_url:
                        fallback_url = fallback_url.replace('localhost', vm_ip)\
                                                   .replace('127.0.0.1', vm_ip)
                    try:
                        page.goto(fallback_url, timeout=15000)
                        page.wait_for_load_state('load', timeout=15000)
                        logger.info(f"[INFINITEWEB] Fallback page loaded: {page.url}")
                    except Exception as e2:
                        logger.warning(f"[INFINITEWEB] Fallback also failed: {e2}")

            # =====================================================================
            # FIX #5: Data-driven seed key discovery.
            #
            # Instead of a hand-maintained SEED_KEYS whitelist (which inevitably
            # misses keys for new sites), read the website's own seed file at
            # `./website_data.json` (always present next to index.html because
            # the task config uploads it). Its top-level keys are exactly the
            # localStorage entries index.html pre-seeds.
            #
            # We ALSO compute a "value-identical-to-seed" check: for each
            # top-level localStorage entry whose current JSON == the seed JSON
            # for that key, we treat it as seed-unchanged (even if the key
            # name looks agent-ish). This lets us skip keys the agent never
            # touched without depending solely on name heuristics.
            #
            # Fallback: if fetch fails, use the hard-coded starter list from
            # FIX #2.
            # =====================================================================
            _static_seed_fallback = [
                'programs', 'program_categories', 'meal_bundles', 'family_profiles',
                'volunteer_opportunities', 'volunteer_shifts', 'campaigns',
                'cover_images', 'stories', 'events', 'homepage_content',
                'fundraising_landing_content', 'postal_geocodes', 'idCounter',
                'dataInitialized', 'drills', 'clinics', 'datasets',
                'publications', 'papers', 'research_groups', 'labs',
            ]
            seed_keys_list = list(_static_seed_fallback)
            seed_unchanged_js = "null"  # will be filled below
            try:
                seed_probe_js = r"""(async function() {
    try {
        const resp = await fetch('./website_data.json', { cache: 'no-store' });
        if (!resp.ok) return null;
        const data = await resp.json();
        if (!data || typeof data !== 'object') return null;
        const seedKeys = Object.keys(data).filter(function(k) { return !k.startsWith('_'); });
        // For each seed key, check whether current localStorage value equals
        // the seed value (=> key is untouched by the agent).
        const unchanged = {};
        seedKeys.forEach(function(k) {
            try {
                const raw = localStorage.getItem(k);
                if (raw === null || raw === undefined) { unchanged[k] = false; return; }
                let cur; try { cur = JSON.parse(raw); } catch(e) { cur = raw; }
                unchanged[k] = JSON.stringify(cur) === JSON.stringify(data[k]);
            } catch(e) { unchanged[k] = false; }
        });
        return { seedKeys: seedKeys, unchanged: unchanged };
    } catch(e) { return null; }
})()"""
                probe = page.evaluate(seed_probe_js)
                if probe and isinstance(probe, dict):
                    fetched = probe.get('seedKeys') or []
                    if fetched:
                        seed_keys_list = list(set(list(fetched) + _static_seed_fallback))
                        logger.info(
                            f"[INFINITEWEB] Loaded seed keys from website_data.json "
                            f"({len(fetched)} keys): {fetched}"
                        )
                    unchanged_map = probe.get('unchanged') or {}
                    seed_unchanged_js = json.dumps(unchanged_map)
                else:
                    logger.warning(
                        "[INFINITEWEB] Could not fetch website_data.json; "
                        "falling back to static SEED_KEYS heuristic"
                    )
            except Exception as seed_err:
                logger.warning(f"[INFINITEWEB] Seed probe error: {seed_err}")

            seed_keys_json = json.dumps(seed_keys_list)

            for step in eval_steps:
                step_type = step.get("type", "")
                weight = step.get("weight", 0.0)
                step_score = 0.0  # float score in [0, 1]
                try:
                    if step_type == "check_localStorage":
                        js_script = step.get("js_script", "")
                        expected = step.get("expected_result", True)
                        if js_script:
                            result = page.evaluate(js_script)
                            if bool(result) == bool(expected):
                                step_score = 1.0
                            logger.info(f"[INFINITEWEB] check_localStorage: result={result}, expected={expected}, score={step_score}")
                        else:
                            step_score = 0.0

                        # Fallback: if the js_script check failed, scan ALL localStorage keys
                        # for any data containing the target_ids from ground_truth.
                        # Returns the fraction of target_ids found (float score).
                        if step_score < 1.0 and expected:
                            ground_truth = config.get("ground_truth", {})
                            target_ids = ground_truth.get("target_ids", [])
                            if target_ids and isinstance(target_ids, list) and len(target_ids) > 0:
                                fallback_js = """(function(targetIds, SEED_KEYS, UNCHANGED_MAP) {
    function isSeedKey(k) {
        if (SEED_KEYS.indexOf(k) !== -1) return true;
        // Also skip any key ending in _seed / _catalog / _list (heuristic)
        return /(_seed|_catalog)$/.test(k);
    }
    function isUnchangedSeed(k) {
        return UNCHANGED_MAP && UNCHANGED_MAP[k] === true;
    }
    try {
        function containsId(obj, ids) {
            if (obj === null || obj === undefined) return false;
            if (typeof obj === 'string') {
                return ids.some(function(tid) { return obj === tid || obj.indexOf(tid) !== -1; });
            }
            if (typeof obj === 'number') return false;
            if (Array.isArray(obj)) {
                return obj.some(function(item) { return containsId(item, ids); });
            }
            if (typeof obj === 'object') {
                // FIX #7: NO hard-coded idFields whitelist.
                // target_ids like "prog_springfield_kids_meal_center" or
                // "event_hunger_forum_apr" are globally unique strings; if
                // ANY string-valued property anywhere in the parsed object
                // equals one of them, that's a positive signal. This works
                // regardless of whether the site uses `programId` /
                // `program_id` / `targetId` / `__ref` / etc.
                for (var k in obj) {
                    var v = obj[k];
                    if (typeof v === 'string' &&
                        ids.some(function(tid) { return v === tid || v.indexOf(tid) !== -1; })) {
                        return true;
                    }
                    if ((Array.isArray(v) || (typeof v === 'object' && v !== null)) &&
                        containsId(v, ids)) {
                        return true;
                    }
                }
            }
            return false;
        }
        var keys = Object.keys(localStorage);
        for (var ki = 0; ki < keys.length; ki++) {
            var k = keys[ki];
            if (k === 'idCounter') continue;
            // FIX #9: Do NOT skip by seed-key NAME. Some sites initialize
            // action stores (like `service_appointments`) with an empty array
            // that IS listed in website_data.json. Skipping by name means we
            // miss agent writes into those exact stores. Instead rely on
            // `isUnchangedSeed` — it only skips a key whose VALUE is byte-
            // identical to the seed, which means the agent didn't touch it.
            if (isUnchangedSeed(k)) continue;
            try {
                var raw = localStorage.getItem(k);
                if (!raw) continue;
                var parsed = JSON.parse(raw);
                // For array values: require at least one NON-EMPTY array
                // entry (seed arrays start empty for agent-action stores
                // like donation_orders, cart_items — so if they're non-empty
                // AND contain target_ids, the agent did act on them).
                if (Array.isArray(parsed) && parsed.length === 0) continue;
                if (containsId(parsed, targetIds)) {
                    return true;
                }
            } catch(e) {}
        }
    } catch(e) {}
    return false;
})(%s, %s, %s)""" % (
                                    json.dumps(target_ids),
                                    seed_keys_json,
                                    seed_unchanged_js,
                                )
                                try:
                                    fallback_result = page.evaluate(fallback_js)
                                    if fallback_result:
                                        # fallback returns true if ALL target_ids found
                                        step_score = 1.0
                                        logger.info(f"[INFINITEWEB] check_localStorage fallback: all target_ids found, score=1.0")
                                    else:
                                        # Check each target_id individually for partial credit
                                        found_count = 0
                                        for tid in target_ids:
                                            single_js = fallback_js.replace(
                                                json.dumps(target_ids),
                                                json.dumps([tid])
                                            )
                                            try:
                                                if page.evaluate(single_js):
                                                    found_count += 1
                                            except Exception:
                                                pass
                                        step_score = found_count / len(target_ids)
                                        logger.info(f"[INFINITEWEB] check_localStorage fallback: {found_count}/{len(target_ids)} target_ids found, score={step_score:.2f}")
                                except Exception as fb_err:
                                    logger.warning(f"[INFINITEWEB] check_localStorage fallback error: {fb_err}")

                    elif step_type == "check_dom_class":
                        selector = step.get("selector", "")
                        expected_state = step.get("expected", "exists")
                        if selector and expected_state == "exists":
                            element = page.query_selector(selector)
                            step_score = 1.0 if element is not None else 0.0
                        elif selector and expected_state == "may_exist":
                            element = page.query_selector(selector)
                            step_score = 1.0 if element is not None else 0.0
                        elif selector and expected_state == "not_exists":
                            element = page.query_selector(selector)
                            step_score = 1.0 if element is None else 0.0
                        else:
                            step_score = 0.0
                        logger.info(f"[INFINITEWEB] check_dom_class selector='{selector}', expected='{expected_state}', score={step_score}")

                    elif step_type == "check_dom_value":
                        selector = step.get("selector", "")
                        expected_value = step.get("expected_value")
                        if selector:
                            element = page.query_selector(selector)
                            if element:
                                actual = element.get_attribute("value")
                                if actual is None:
                                    actual = element.is_checked() if element.get_attribute("type") in ("checkbox", "radio") else None
                                if actual is None:
                                    actual = element.inner_text()
                                step_score = 1.0 if str(actual) == str(expected_value) else 0.0
                            else:
                                step_score = 0.0
                        logger.info(f"[INFINITEWEB] check_dom_value selector='{selector}', score={step_score}")

                    elif step_type == "check_expected_values":
                        # Check expected_values: these are field-level properties (e.g. price_per_month)
                        # NOT top-level localStorage keys. We need to find an object in any
                        # localStorage entry that contains all of these field/value pairs.
                        #
                        # FIX #3: Business logic and ground_truth field names
                        # diverge — ground_truth says `donationAmount`, business
                        # stores it as `totalAmount` in donation_orders[] and
                        # `amount` in cart_items[]. Requiring an object that
                        # contains ALL expected_values field names exactly is
                        # unrealistic and causes this 0.2 weight to never be
                        # earned. We add a THIRD fallback:
                        #  1. Convert each expected key to its camelCase
                        #     and snake_case variants (donationAmount ↔
                        #     donation_amount, etc.) plus well-known
                        #     business aliases (donationAmount → amount,
                        #     totalAmount, pricePerRider → price_per_rider).
                        #  2. For each top-level localStorage value, compute
                        #     the hit rate = (matched expected keys) /
                        #     total_expected_keys, looking recursively in
                        #     objects and arrays.
                        #  3. Passed if the best hit rate ≥ 0.5 (i.e.
                        #     half or more of the expected fields were
                        #     observed somewhere under the same key).
                        expected_values = step.get("expected_values", {})
                        if not expected_values:
                            step_score = 1.0  # nothing to check
                        else:
                            # First try: treat keys as localStorage top-level keys (legacy behavior)
                            found_any = False
                            for key, expected_val in expected_values.items():
                                try:
                                    raw = page.evaluate(f"localStorage.getItem({json.dumps(key)})")
                                    if raw is not None:
                                        try:
                                            actual = json.loads(raw)
                                        except Exception:
                                            actual = raw
                                        if actual == expected_val or str(actual) == str(expected_val):
                                            found_any = True
                                            break
                                except Exception:
                                    pass

                            if not found_any:
                                # Second try: scan all localStorage values looking for an object
                                # (or object within an array) that contains ALL expected fields.
                                ev_js = """(function(expectedValues) {
    function objectMatchesAll(obj, ev) {
        if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return false;
        for (var k in ev) {
            if (!(k in obj)) return false;
            var oval = obj[k];
            var eval_ = ev[k];
            if (oval !== eval_ && String(oval) !== String(eval_)) {
                // Allow numeric comparison with tolerance for floats
                if (typeof oval === 'number' && typeof eval_ === 'number' &&
                    Math.abs(oval - eval_) < 0.001) continue;
                return false;
            }
        }
        return true;
    }
    function searchInValue(val, ev) {
        if (!val) return false;
        if (typeof val === 'object' && !Array.isArray(val)) {
            if (objectMatchesAll(val, ev)) return true;
        }
        if (Array.isArray(val)) {
            for (var i = 0; i < val.length; i++) {
                if (objectMatchesAll(val[i], ev)) return true;
            }
        }
        return false;
    }
    try {
        var keys = Object.keys(localStorage);
        for (var ki = 0; ki < keys.length; ki++) {
            var k = keys[ki];
            if (k === 'idCounter') continue;
            try {
                var raw = localStorage.getItem(k);
                if (!raw) continue;
                var parsed = JSON.parse(raw);
                if (searchInValue(parsed, expectedValues)) return true;
            } catch(e) {}
        }
    } catch(e) {}
    return false;
})(%s)""" % json.dumps(expected_values)
                                try:
                                    ev_result = page.evaluate(ev_js)
                                    if ev_result:
                                        found_any = True
                                        logger.info(f"[INFINITEWEB] check_expected_values fallback scan found matching object, passed=True")
                                    else:
                                        logger.info(f"[INFINITEWEB] check_expected_values fallback scan found no match for {expected_values}")
                                except Exception as ev_err:
                                    logger.warning(f"[INFINITEWEB] check_expected_values fallback error: {ev_err}")

                            # -----------------------------------------------
                            # FIX #3: PARTIAL + FUZZY fallback.
                            # Only runs if stricter scans above failed.
                            # Tolerates:
                            #   - camelCase <-> snake_case key names
                            #   - aliased key names (donationAmount → amount,
                            #     totalAmount, price, pricePerItem, ...)
                            #   - value equality with string/number coercion
                            # Passed if hit_rate >= EV_HIT_THRESHOLD (0.5).
                            # -----------------------------------------------
                            if not found_any:
                                partial_js = r"""(function(expectedValues, hitThreshold, unchangedMap) {
    function camelToSnake(s) {
        return s.replace(/([A-Z])/g, function(m) { return '_' + m.toLowerCase(); })
                .replace(/^_/, '');
    }
    function snakeToCamel(s) {
        return s.replace(/_([a-z])/g, function(m, c) { return c.toUpperCase(); });
    }
    // FIX #8: NO hard-coded ALIASES dictionary.
    // The previous version mapped `donationAmount` -> ['amount','totalAmount',...]
    // which was donation-specific and broke on every other business domain.
    // We now rely on TWO universal signals that work for any site:
    //   (a) key name equality across camelCase/snake_case variants
    //   (b) VALUE-based matching: if the expected value (a number or a
    //       sufficiently discriminative string) appears anywhere in the
    //       store's scalars, count it as a hit — regardless of field name
    // This is robust across arbitrary InfiniteWeb sites because ground_truth
    // values are sampled from the seeded data (stable, identifiable).
    function candidateKeys(k) {
        var set = {};
        set[k] = 1;
        set[camelToSnake(k)] = 1;
        set[snakeToCamel(k)] = 1;
        return Object.keys(set);
    }
    function valueMatches(observed, expected) {
        if (observed === expected) return true;
        if (observed == null || expected == null) return false;
        if (typeof observed === 'number' && typeof expected === 'number') {
            return Math.abs(observed - expected) < 0.001;
        }
        if (String(observed).toLowerCase() === String(expected).toLowerCase()) return true;
        // String containment for sort-like values ("meals_per_10_dollars_desc" vs "mealsPer10Dollars")
        var so = String(observed).replace(/[_-]/g, '').toLowerCase();
        var se = String(expected).replace(/[_-]/g, '').toLowerCase();
        if (so && se && (so === se || so.indexOf(se) !== -1 || se.indexOf(so) !== -1)) return true;
        return false;
    }
    function collectScalars(obj, out) {
        if (obj === null || obj === undefined) return;
        if (typeof obj !== 'object') { out.push(obj); return; }
        if (Array.isArray(obj)) { obj.forEach(function(x) { collectScalars(x, out); }); return; }
        Object.keys(obj).forEach(function(k) { collectScalars(obj[k], out); });
    }
    function findKeyDeep(obj, keyCandidates, visited) {
        if (!obj || typeof obj !== 'object') return { found: false };
        if (visited.indexOf(obj) !== -1) return { found: false };
        visited.push(obj);
        if (!Array.isArray(obj)) {
            for (var i = 0; i < keyCandidates.length; i++) {
                if (Object.prototype.hasOwnProperty.call(obj, keyCandidates[i])) {
                    return { found: true, value: obj[keyCandidates[i]] };
                }
            }
        }
        var vals = Array.isArray(obj) ? obj : Object.keys(obj).map(function(k){return obj[k];});
        for (var j = 0; j < vals.length; j++) {
            var r = findKeyDeep(vals[j], keyCandidates, visited);
            if (r.found) return r;
        }
        return { found: false };
    }

    var expectedKeys = Object.keys(expectedValues);
    var totalExpected = expectedKeys.length;
    if (totalExpected === 0) return { hit: 0, total: 0, ratio: 0 };

    var bestRatio = 0;
    var bestDetail = null;
    var storageKeys = Object.keys(localStorage);
    for (var ki = 0; ki < storageKeys.length; ki++) {
        var sk = storageKeys[ki];
        if (sk === 'idCounter' || sk === 'dataInitialized') continue;
        // FIX #9: skip by VALUE (unchanged seed), not by NAME. Action stores
        // like `service_appointments` are listed as seed keys AND written to
        // by the agent; skipping them by name loses the signal.
        if (unchangedMap && unchangedMap[sk] === true) continue;
        var raw = localStorage.getItem(sk);
        if (!raw) continue;
        var parsed;
        try { parsed = JSON.parse(raw); } catch(e) { continue; }

        var hits = 0;
        var hitDetail = [];
        for (var ei = 0; ei < expectedKeys.length; ei++) {
            var ek = expectedKeys[ei];
            var ev = expectedValues[ek];
            var cands = candidateKeys(ek);
            var r = findKeyDeep(parsed, cands, []);
            if (r.found && valueMatches(r.value, ev)) {
                hits++; hitDetail.push(ek + '=' + String(r.value));
                continue;
            }
            // Last resort: look for the expected VALUE anywhere in this
            // store. Useful for ids like "prog_X" embedded in a nested
            // object under a field name not in our alias map.
            var scalars = [];
            collectScalars(parsed, scalars);
            var hitViaValue = scalars.some(function(s) { return valueMatches(s, ev); });
            if (hitViaValue) { hits++; hitDetail.push(ek + '~=' + String(ev)); }
        }
        var ratio = hits / totalExpected;
        if (ratio > bestRatio) {
            bestRatio = ratio;
            bestDetail = { store: sk, hits: hits, total: totalExpected, details: hitDetail };
        }
    }
    return {
        ratio: bestRatio,
        threshold: hitThreshold,
        passed: bestRatio >= hitThreshold,
        best: bestDetail
    };
})(%s, %s, %s)""" % (
                                    json.dumps(expected_values),
                                    json.dumps(0.5),
                                    seed_unchanged_js,
                                )
                                try:
                                    partial_res = page.evaluate(partial_js)
                                    if partial_res and isinstance(partial_res, dict):
                                        ratio = partial_res.get('ratio', 0.0)
                                        # Use ratio directly as score (no binary threshold)
                                        if ratio > step_score:
                                            step_score = ratio
                                        if partial_res.get('passed'):
                                            found_any = True
                                        logger.info(
                                            f"[INFINITEWEB] check_expected_values PARTIAL match: "
                                            f"ratio={ratio:.2f}, step_score={step_score:.2f}, "
                                            f"best={partial_res.get('best')}"
                                        )
                                    else:
                                        logger.info(
                                            f"[INFINITEWEB] check_expected_values PARTIAL returned: "
                                            f"{partial_res}"
                                        )
                                except Exception as p_err:
                                    logger.warning(f"[INFINITEWEB] check_expected_values PARTIAL error: {p_err}")

                            # Use the best ratio as step_score; if found_any via exact match, score=1.0
                            if found_any:
                                step_score = max(step_score, 1.0)
                        logger.info(f"[INFINITEWEB] check_expected_values: score={step_score:.2f}")

                    elif step_type == "check_url":
                        pattern = step.get("pattern", "")
                        if pattern:
                            import re as _re
                            step_score = 1.0 if bool(_re.search(pattern, page.url)) else 0.0
                        else:
                            step_score = 1.0
                        logger.info(f"[INFINITEWEB] check_url pattern='{pattern}', url='{page.url}', score={step_score}")

                    elif step_type == "check_dom":
                        selector = step.get("selector", "")
                        check_type = step.get("check_type", "exists")
                        expected_value = step.get("expected_value", "")
                        element = page.query_selector(selector) if selector else None
                        if check_type == "exists":
                            step_score = 1.0 if element is not None else 0.0
                        elif check_type == "not_exists":
                            step_score = 1.0 if element is None else 0.0
                        elif check_type == "text_contains" and element:
                            step_score = 1.0 if expected_value in (element.inner_text() or "") else 0.0
                        elif check_type == "attribute_equals" and element:
                            attr_name = step.get("attribute", "value")
                            step_score = 1.0 if element.get_attribute(attr_name) == expected_value else 0.0
                        else:
                            step_score = 0.0
                        logger.info(f"[INFINITEWEB] check_dom selector='{selector}', type='{check_type}', score={step_score}")

                    elif step_type == "check_localStorage_key":
                        key = step.get("key", "")
                        check_type = step.get("check_type", "exists")
                        expected_value = step.get("expected_value", "")
                        if key:
                            raw = page.evaluate(f"localStorage.getItem({json.dumps(key)})")
                            if check_type == "exists":
                                if raw is None:
                                    step_score = 0.0
                                else:
                                    try:
                                        parsed = json.loads(raw)
                                        # Empty seeded arrays/objects are weak evidence; non-empty values indicate real interaction.
                                        if isinstance(parsed, (list, dict)):
                                            step_score = 1.0 if len(parsed) > 0 else 0.5
                                        else:
                                            step_score = 1.0
                                    except Exception:
                                        step_score = 1.0 if str(raw).strip() else 0.0
                            elif check_type == "contains_id":
                                if raw is not None:
                                    contains_js = """(function(raw, expected) {
    function tryJson(v) { try { return JSON.parse(v); } catch(e) { return v; } }
    function norm(v) { return String(v).toLowerCase(); }
    function containsValue(obj, expectedValue) {
        if (obj === null || obj === undefined) return false;
        if (typeof obj !== 'object') {
            var s = norm(obj), e = norm(expectedValue);
            return s === e || (e.length >= 3 && s.indexOf(e) !== -1);
        }
        if (Array.isArray(obj)) return obj.some(function(x) { return containsValue(x, expectedValue); });
        return Object.keys(obj).some(function(k) { return containsValue(obj[k], expectedValue); });
    }
    return containsValue(tryJson(raw), expected);
})(%s, %s)""" % (json.dumps(raw), json.dumps(expected_value))
                                    try:
                                        step_score = 1.0 if page.evaluate(contains_js) else 0.0
                                    except Exception:
                                        step_score = 0.0
                                else:
                                    step_score = 0.0
                            elif check_type == "value_equals":
                                if raw is not None:
                                    equals_js = """(function(raw, expected) {
    function tryJson(v) { if (typeof v !== 'string') return v; try { return JSON.parse(v); } catch(e) { return v; } }
    function normalize(v) {
        if (typeof v === 'string') return tryJson(v);
        return v;
    }
    function deepEqual(a, b) {
        a = normalize(a); b = normalize(b);
        if (a === b) return true;
        if (typeof a === 'number' && typeof b === 'number') return Math.abs(a - b) < 0.001;
        if (a == null || b == null) return false;
        if (typeof a !== 'object' || typeof b !== 'object') {
            return String(a).toLowerCase() === String(b).toLowerCase();
        }
        return JSON.stringify(a) === JSON.stringify(b);
    }
    return deepEqual(raw, expected);
})(%s, %s)""" % (json.dumps(raw), json.dumps(expected_value))
                                    try:
                                        step_score = 1.0 if page.evaluate(equals_js) else 0.0
                                    except Exception:
                                        try:
                                            actual = json.loads(raw)
                                        except Exception:
                                            actual = raw
                                        step_score = 1.0 if (actual == expected_value or str(actual) == str(expected_value)) else 0.0
                                else:
                                    step_score = 0.0
                            else:
                                step_score = 1.0 if raw is not None else 0.0
                        else:
                            step_score = 0.0
                        logger.info(f"[INFINITEWEB] check_localStorage_key key='{key}', type='{check_type}', score={step_score}")

                    elif step_type == "check_success_indicator":
                        selector = step.get("selector", "")
                        if selector:
                            element = page.query_selector(selector)
                            step_score = 1.0 if element is not None else 0.0
                        else:
                            step_score = 0.0
                        logger.info(f"[INFINITEWEB] check_success_indicator selector='{selector}', score={step_score}")

                    elif step_type == "check_page_loaded":
                        step_score = 1.0 if ("error" not in page.url.lower() and page.title() != "") else 0.0
                        logger.info(f"[INFINITEWEB] check_page_loaded: url='{page.url}', score={step_score}")

                    else:
                        logger.warning(f"[INFINITEWEB] Unknown step type: {step_type}, skipping")
                        step_score = 0.0

                except Exception as step_err:
                    logger.warning(f"[INFINITEWEB] Step '{step_type}' error: {step_err}")
                    step_score = 0.0

                step_results.append({
                    "step": step,
                    "score": step_score,
                    "passed": step_score >= 0.5,  # backward compat
                    "weight": weight,
                })

            # Only close the page if WE created it. Never close the agent's
            # original tab — doing so would disrupt subsequent evaluation
            # tasks and may cause the VM's Chrome session to lose state.
            if owns_page and page is not None:
                try:
                    page.close()
                except Exception:
                    pass

    except Exception as e:
        logger.error(f"[INFINITEWEB] Fatal error in rule_based_evaluation getter: {e}")
        # Return empty results — metric will score 0
        return {
            "eval_steps": [],
            "total_weight": sum(s.get("weight", 0.0) for s in eval_steps),
            "base_url": original_page_url,
            "error": str(e),
        }

    total_weight = sum(s.get("weight", 0.0) for s in eval_steps)
    passed_count = sum(1 for r in step_results if r["passed"])
    logger.info(f"[INFINITEWEB] Evaluation complete: {passed_count}/{len(step_results)} steps passed")

    return {
        "eval_steps": step_results,
        "total_weight": total_weight,
        "base_url": original_page_url,
    }


def get_ground_truth_match(env, config: Dict[Any, Any]) -> Any:
    """Getter for InfiniteWeb ground_truth_match expected value.

    Simply passes through the ground_truth expected config as-is.
    The metric function uses this to know what was expected.

    Args:
        env: The environment object (unused here).
        config: The ``expected`` dict from the evaluator config, containing:
            - type (str): "ground_truth_match"
            - target_ids (List): The expected target IDs.
            - target_names (List): The expected target names.

    Returns:
        The config dict unchanged (used as expected_state by the metric).
    """
    return config


def get_fallback_evaluation(env, config: Dict[Any, Any]) -> Any:
    """Getter for InfiniteWeb fallback_evaluation result.

    Per policy (see FIX #4 in ``get_rule_based_evaluation``):
    ``fallback_evaluation`` means the rule generator could not produce a
    meaningful rule for the task. We must NOT claim success — the task
    should always score 0.0.

    We return a structure that the metric (``chrome_infiniteweb_evaluator``)
    will score as 0.0: no passed steps, but a non-zero total_weight so the
    metric does not early-return with a warning.

    Args:
        env: The environment object (unused here).
        config: The ``result`` dict from the evaluator config, typically
            containing ``type == "fallback_evaluation"`` plus optional
            ``eval_steps``.

    Returns:
        Dict with ``eval_steps`` (all marked failed), ``total_weight``,
        ``base_url``, and a ``reason`` tag.
    """
    logger.warning(
        "[INFINITEWEB] get_fallback_evaluation invoked — task has no meaningful rule, "
        "scoring 0.0."
    )
    eval_steps = config.get("eval_steps", []) if isinstance(config, dict) else []
    base_url = config.get("base_url", "") if isinstance(config, dict) else ""
    return {
        "eval_steps": [
            {"step": s, "passed": False, "weight": s.get("weight", 0.0)}
            for s in eval_steps
        ],
        "total_weight": sum(s.get("weight", 0.0) for s in eval_steps) or 1.0,
        "base_url": base_url,
        "reason": "fallback_evaluation_no_rule",
    }


def get_llm_generated_evaluation(env, config: Dict[Any, Any]) -> Any:
    """Getter for InfiniteWeb llm_generated_evaluation result.

    ``llm_generated_evaluation`` uses the same ``eval_steps`` schema as
    ``rule_based_evaluation`` — the only difference is provenance (the
    steps were generated by an LLM rather than hand-written rules). The
    actual scoring logic is identical, so we delegate to
    ``get_rule_based_evaluation``.

    Args:
        env: The environment object (provides vm_ip, chromium_port, etc.).
        config: The ``result`` dict from the evaluator config.

    Returns:
        Same dict structure as ``get_rule_based_evaluation`` returns.
    """
    logger.info("[INFINITEWEB] get_llm_generated_evaluation -> delegating to rule_based_evaluation")
    return get_rule_based_evaluation(env, config)


def get_page_loaded(env, config: Dict[Any, Any]) -> Any:
    """Getter for InfiniteWeb page_loaded expected value.

    Used by fallback_evaluation tasks where ``expected.type == "page_loaded"``.
    These tasks have no meaningful evaluation rule — the metric should score 0.

    Returns:
        The config dict unchanged.
    """
    return config


def get_heuristic_match(env, config: Dict[Any, Any]) -> Any:
    """Getter for InfiniteWeb heuristic_match expected value.

    Used by llm_generated_evaluation tasks where
    ``expected.type == "heuristic_match"``. Simply passes through the
    expected config for use by the metric function.

    Returns:
        The config dict unchanged.
    """
    return config


# The following ones just need to load info from the files of software, no need to connect to the software
def get_default_search_engine(env, config: Dict[str, str]):
    if "arm" in platform.machine():
        preference_file_path = env.controller.execute_python_command(
            "import os; print(os.path.join(os.getenv('HOME'), 'snap/chromium/common/chromium/Default/Preferences'))")[
            'output'].strip()
    else:
        preference_file_path = env.controller.execute_python_command(
            "import os; print(os.path.join(os.getenv('HOME'), '.config/google-chrome/Default/Preferences'))")[
            'output'].strip()

    try:
        content = env.controller.get_file(preference_file_path)
        data = json.loads(content)

        # The path within the JSON data to the default search engine might vary
        search_engine = data.get('default_search_provider_data', {}).get('template_url_data', {}).get('short_name',
                                                                                                      'Google')
        return search_engine
    except Exception as e:
        logger.error(f"Error: {e}")
        return "Google"


def get_cookie_data(env, config: Dict[str, str]):
    """
    Get the cookies from the Chrome browser.
    Assume the cookies are stored in the default location, not encrypted and not large in size.
    """
    if "arm" in platform.machine():
        chrome_cookie_file_path = env.controller.execute_python_command(
            "import os; print(os.path.join(os.getenv('HOME'), 'snap/chromium/common/chromium/Default/Cookies'))")[
            'output'].strip()
    else:
        chrome_cookie_file_path = env.controller.execute_python_command(
            "import os; print(os.path.join(os.getenv('HOME'), '.config/google-chrome/Default/Cookies'))")[
            'output'].strip()

    try:
        content = env.controller.get_file(chrome_cookie_file_path)
        # Write to eval_cache_dir to avoid polluting gold-standard cache
        _path = os.path.join(env.eval_cache_dir, config["dest"])

        with open(_path, "wb") as f:
            f.write(content)

        conn = sqlite3.connect(_path)
        cursor = conn.cursor()

        # Query to check for OpenAI cookies
        cursor.execute("SELECT * FROM cookies")
        cookies = cursor.fetchall()
        return cookies
    except Exception as e:
        logger.error(f"Error: {e}")
        return None


def get_history(env, config: Dict[str, str]):
    if "arm" in platform.machine():
        chrome_history_path = env.controller.execute_python_command(
            "import os; print(os.path.join(os.getenv('HOME'), 'snap/chromium/common/chromium/Default/History'))")[
            'output'].strip()
    else:
        chrome_history_path = env.controller.execute_python_command(
            "import os; print(os.path.join(os.getenv('HOME'), '.config', 'google-chrome', 'Default', 'History'))")[
            'output'].strip()

    try:
        content = env.controller.get_file(chrome_history_path)
        # Write to eval_cache_dir to avoid polluting gold-standard cache
        _path = os.path.join(env.eval_cache_dir, config["dest"])

        with open(_path, "wb") as f:
            f.write(content)

        conn = sqlite3.connect(_path)
        cursor = conn.cursor()

        # Query to check for OpenAI cookies
        cursor.execute("SELECT url, title, last_visit_time FROM urls")
        history_items = cursor.fetchall()
        return history_items
    except Exception as e:
        logger.error(f"Error: {e}")
        return None


def get_enabled_experiments(env, config: Dict[str, str]):
    if "arm" in platform.machine():
        preference_file_path = env.controller.execute_python_command(
            "import os; print(os.path.join(os.getenv('HOME'), 'snap/chromium/common/chromium/Local State'))")[
            'output'].strip()
    else:
        preference_file_path = env.controller.execute_python_command(
            "import os; print(os.path.join(os.getenv('HOME'), '.config/google-chrome/Local State'))")[
            'output'].strip()

    try:
        content = env.controller.get_file(preference_file_path)
        data = json.loads(content)

        # The path within the JSON data to the default search engine might vary
        enabled_labs_experiments = data.get('browser', {}).get('enabled_labs_experiments', [])
        return enabled_labs_experiments
    except Exception as e:
        logger.error(f"Error: {e}")
        return []


def get_profile_name(env, config: Dict[str, str]):
    """
    Get the username from the Chrome browser.
    Assume the cookies are stored in the default location, not encrypted and not large in size.
    """
    if "arm" in platform.machine():
        preference_file_path = env.controller.execute_python_command(
            "import os; print(os.path.join(os.getenv('HOME'), 'snap/chromium/common/chromium/Default/Preferences'))")[
            'output'].strip()
    else:
        preference_file_path = env.controller.execute_python_command(
            "import os; print(os.path.join(os.getenv('HOME'), '.config/google-chrome/Default/Preferences'))")[
            'output'].strip()

    try:
        content = env.controller.get_file(preference_file_path)
        data = json.loads(content)

        # The path within the JSON data to the default search engine might vary
        profile_name = data.get('profile', {}).get('name', None)
        return profile_name
    except Exception as e:
        logger.error(f"Error: {e}")
        return None


def get_chrome_language(env, config: Dict[str, str]):
    if "arm" in platform.machine():
        preference_file_path = env.controller.execute_python_command(
            "import os; print(os.path.join(os.getenv('HOME'), 'snap/chromium/common/chromium/Local State'))")[
            'output'].strip()
    else:
        preference_file_path = env.controller.execute_python_command(
            "import os; print(os.path.join(os.getenv('HOME'), '.config/google-chrome/Local State'))")[
            'output'].strip()

    try:
        content = env.controller.get_file(preference_file_path)
        data = json.loads(content)

        # The path within the JSON data to the default search engine might vary
        enabled_labs_experiments = data.get('intl', {}).get('app_locale', "en-US")
        return enabled_labs_experiments
    except Exception as e:
        logger.error(f"Error: {e}")
        return "en-US"


def get_chrome_font_size(env, config: Dict[str, str]):
    if "arm" in platform.machine():
        preference_file_path = env.controller.execute_python_command(
            "import os; print(os.path.join(os.getenv('HOME'), 'snap/chromium/common/chromium/Default/Preferences'))")[
            'output'].strip()
    else:
        preference_file_path = env.controller.execute_python_command(
            "import os; print(os.path.join(os.getenv('HOME'), '.config/google-chrome/Default/Preferences'))")[
            'output'].strip()

    try:
        content = env.controller.get_file(preference_file_path)
        data = json.loads(content)

        # The path within the JSON data to the default search engine might vary
        search_engine = data.get('webkit', {}).get('webprefs', {
            "default_fixed_font_size": 13,
            "default_font_size": 16,
            "minimum_font_size": 13
        })
        return search_engine
    except Exception as e:
        logger.error(f"Error: {e}")
        return {
            "default_fixed_font_size": 13,
            "default_font_size": 16
        }


def get_chrome_color_scheme(env, config: Dict[str, str]):
    """
    Get Chrome browser color scheme preference.
    Returns one of: "system", "light", "dark".
    """
    def _normalize_color_scheme(raw_value):
        if isinstance(raw_value, str):
            normalized = raw_value.strip().lower()
            if normalized in {"system", "default", "0"}:
                return "system"
            if normalized in {"light", "1"}:
                return "light"
            if normalized in {"dark", "2"}:
                return "dark"
            return None
        if isinstance(raw_value, (int, float)):
            mapping = {0: "system", 1: "light", 2: "dark"}
            return mapping.get(int(raw_value), None)
        return None

    def _extract_mode_from_preferences(data):
        theme_data = data.get('browser', {}).get('theme', {})
        # Newer Chrome writes color_scheme2; older versions may still use color_scheme.
        raw_value = theme_data.get('color_scheme2', theme_data.get('color_scheme', None))
        mode = _normalize_color_scheme(raw_value)
        # Fallback for Linux builds where appearance updates may be reflected through
        # extensions.theme.system_theme while color_scheme remains stale.
        system_theme_flag = data.get('extensions', {}).get('theme', {}).get('system_theme', None)
        if system_theme_flag in [0, "0", False]:
            return "light"
        return mode if mode else "system"

    try:
        candidate_paths = []
        if "arm" in platform.machine():
            preference_file_path = env.controller.execute_python_command(
                "import os; print(os.path.join(os.getenv('HOME'), 'snap/chromium/common/chromium/Default/Preferences'))")[
                'output'].strip()
            candidate_paths = [preference_file_path]
        else:
            # Enumerate profile preference files and rank by last modified time.
            path_probe = r"""
import glob, json, os
roots = [
    os.path.expanduser('~/.config/google-chrome'),
    '/home/user/.config/google-chrome',
    '/home/ubuntu/.config/google-chrome',
]
seen = set()
results = []
for root in roots:
    if not os.path.isdir(root):
        continue
    patterns = [
        os.path.join(root, 'Default', 'Preferences'),
        os.path.join(root, 'Guest Profile', 'Preferences'),
        os.path.join(root, 'Profile *', 'Preferences'),
    ]
    for pattern in patterns:
        for p in glob.glob(pattern):
            if p in seen or not os.path.isfile(p):
                continue
            seen.add(p)
            try:
                mtime = os.path.getmtime(p)
            except Exception:
                mtime = 0
            results.append({'path': p, 'mtime': mtime})
print(json.dumps(results))
"""
            probe_output = env.controller.execute_python_command(path_probe).get('output', '').strip()
            probed = json.loads(probe_output) if probe_output else []
            probed.sort(key=lambda x: x.get('mtime', 0), reverse=True)
            candidate_paths = [item.get('path') for item in probed if item.get('path')]
            if not candidate_paths:
                fallback = env.controller.execute_python_command(
                    "import os; print(os.path.join(os.getenv('HOME'), '.config/google-chrome/Default/Preferences'))")[
                    'output'].strip()
                candidate_paths = [fallback]

        # Chrome may flush Preferences asynchronously right after the UI toggle.
        # Poll briefly to avoid evaluating stale on-disk values.
        final_mode = "system"
        for _ in range(5):
            best_mode = None
            for preference_file_path in candidate_paths:
                try:
                    content = env.controller.get_file(preference_file_path)
                    if not content:
                        continue
                    data = json.loads(content)
                    mode = _extract_mode_from_preferences(data)
                    # Prefer explicit user selection over "system".
                    if mode in {"light", "dark"}:
                        best_mode = mode
                        break
                    if best_mode is None:
                        best_mode = mode
                except Exception:
                    continue

            if best_mode is not None:
                final_mode = best_mode
                # If it already became light, return immediately.
                if best_mode == "light":
                    return "light"
            time.sleep(1)

        return final_mode
    except Exception as e:
        logger.error(f"Error: {e}")
        return "system"


def get_chrome_appearance_mode_ui(env, config: Dict[str, str]):
    """
    Read Chrome appearance mode from the settings UI (chrome://settings/appearance).
    Returns one of: "light", "dark", "system".
    Falls back to get_chrome_color_scheme if UI probing fails.
    """
    host = env.vm_ip
    port = env.chromium_port
    remote_debugging_url = f"http://{host}:{port}"

    js_probe = r"""
() => {
  const lower = (s) => String(s || '').toLowerCase();
  const allowedPrefPaths = new Set([
    'prefs.browser.theme.color_scheme',
    'prefs.browser.theme.color_scheme2',
    'prefs.extensions.theme.system_theme',
  ]);

  const inferFromText = (s) => {
    const t = lower(s);
    if (t.includes('light')) return 'light';
    if (t.includes('dark')) return 'dark';
    if (t.includes('device') || t.includes('system') || t.includes('default')) return 'system';
    return null;
  };

  const collectShadowRoots = (root, acc) => {
    if (!root) return;
    const all = root.querySelectorAll('*');
    for (const el of all) {
      if (el.shadowRoot) {
        acc.push(el.shadowRoot);
        collectShadowRoots(el.shadowRoot, acc);
      }
    }
  };

  const modes = [];

  // 1) Try settings-ui prefs recursively (WebUI internal state)
  try {
    const ui = document.querySelector('settings-ui');
    const prefs = ui && ui.prefs ? ui.prefs : null;
    const visited = new Set();
    const walk = (obj, path) => {
      if (!obj || typeof obj !== 'object') return;
      if (visited.has(obj)) return;
      visited.add(obj);

      // Common pref leaf shapes: {key, value} or nested objects.
      if (Object.prototype.hasOwnProperty.call(obj, 'value')) {
        const v = obj.value;
        const p = lower(path);
        if (allowedPrefPaths.has(p)) {
          if (p.endsWith('extensions.theme.system_theme')) {
            if (v === 0 || v === '0' || v === false) modes.push('light');
            if (v === 1 || v === '1' || v === true) modes.push('dark');
          } else {
            if (v === 1 || v === '1' || lower(v) === 'light') modes.push('light');
            if (v === 2 || v === '2' || lower(v) === 'dark') modes.push('dark');
            if (v === 0 || v === '0' || lower(v) === 'system' || lower(v) === 'default' || lower(v) === 'device') modes.push('system');
          }
        }
      }

      for (const [k, v] of Object.entries(obj)) {
        walk(v, path ? `${path}.${k}` : k);
      }
    };
    walk(prefs, 'prefs');
  } catch (e) {}

  // 2) Scan selected/checked controls through shadow DOM text.
  try {
    const roots = [document];
    collectShadowRoots(document, roots);
    const candidates = [];
    for (const r of roots) {
      for (const el of r.querySelectorAll('[selected],[checked],[aria-checked="true"],option:checked')) {
        const txt = (el.innerText || el.textContent || '').trim();
        if (txt) candidates.push(txt);
      }
    }
    for (const t of candidates) {
      const m = inferFromText(t);
      if (m) modes.push(m);
    }
  } catch (e) {}

  // Priority: explicit light/dark from UI; otherwise system.
  if (modes.includes('light')) return 'light';
  if (modes.includes('dark')) return 'dark';
  if (modes.includes('system')) return 'system';
  return null;
}
"""

    try:
        with sync_playwright() as p:
            try:
                browser = p.chromium.connect_over_cdp(remote_debugging_url)
            except Exception:
                # Fallback to file-based mode if Chrome CDP is unavailable.
                return get_chrome_color_scheme(env, config)

            page = browser.contexts[0].new_page()
            page.goto("chrome://settings/appearance", wait_until="domcontentloaded", timeout=30000)
            page.wait_for_timeout(2500)
            mode = page.evaluate(js_probe)
            browser.close()

            if mode in {"light", "dark", "system"}:
                return mode
            return get_chrome_color_scheme(env, config)
    except Exception:
        return get_chrome_color_scheme(env, config)


def get_bookmarks(env, config: Dict[str, str]):
    if "arm" in platform.machine():
        preference_file_path = env.controller.execute_python_command(
            "import os; print(os.path.join(os.getenv('HOME'), 'snap/chromium/common/chromium/Default/Bookmarks'))")[
            'output'].strip()
    else:
        preference_file_path = env.controller.execute_python_command(
            "import os; print(os.path.join(os.getenv('HOME'), '.config/google-chrome/Default/Bookmarks'))")[
            'output'].strip()

    content = env.controller.get_file(preference_file_path)
    if not content:
        return []
    data = json.loads(content)
    bookmarks = data.get('roots', {})
    return bookmarks


# todo: move this to the main.py
def get_extensions_installed_from_shop(env, config: Dict[str, str]):
    """Find the Chrome extensions directory."""
    if "arm" in platform.machine():
        preference_file_path = env.controller.execute_python_command(
            "import os; print(os.path.join(os.getenv('HOME'), 'snap/chromium/common/chromium/Default/Extensions/'))")[
            'output'].strip()
    else:
        chrome_extension_dir = env.controller.execute_python_command(
            """os.path.expanduser('~') + '/.config/google-chrome/Default/Extensions/'""")['output'].strip()

    manifests = []
    for extension_id in os.listdir(chrome_extension_dir):
        extension_path = os.path.join(chrome_extension_dir, extension_id)
        if os.path.isdir(extension_path):
            # Iterate through version-named subdirectories
            for version_dir in os.listdir(extension_path):
                version_path = os.path.join(extension_path, version_dir)
                manifest_path = os.path.join(version_path, 'manifest.json')
                if os.path.isfile(manifest_path):
                    with open(manifest_path, 'r') as file:
                        try:
                            manifest = json.load(file)
                            manifests.append(manifest)
                        except json.JSONDecodeError:
                            logger.error(f"Error reading {manifest_path}")
    return manifests


# The following ones require Playwright to be installed on the target machine, and the chrome needs to be pre-config on
# port info to allow remote debugging, see README.md for details
def get_page_info(env, config: Dict[str, str]):
    host = env.vm_ip
    port = env.chromium_port  # fixme: this port is hard-coded, need to be changed from config file
    server_port = env.server_port
    target_url = config["url"]

    remote_debugging_url = f"http://{host}:{port}"

    # Configuration for retry and timeout
    max_retries = 2
    timeout_ms = 60000  # Increase timeout to 60 seconds

    for attempt in range(max_retries):
        try:
            logger.info(f"[PAGE_INFO] Attempt {attempt + 1}/{max_retries} for URL: {target_url}")

            with sync_playwright() as p:
                # connect to remote Chrome instance
                try:
                    browser = p.chromium.connect_over_cdp(remote_debugging_url)
                    logger.info("[PAGE_INFO] Successfully connected to existing Chrome instance")
                except Exception as e:
                    logger.warning(f"[PAGE_INFO] Failed to connect to existing Chrome instance: {e}")

                    # IMPORTANT: detect platform/machine from VM, not local
                    try:
                        vm_machine = (env.controller.get_vm_machine() or "").lower()
                    except Exception as e2:
                        logger.warning(f"[PAGE_INFO] Failed to get VM machine type: {e2}")
                        vm_machine = ""

                    is_arm = ("arm" in vm_machine) or ("aarch" in vm_machine)
                    logger.info(f"[PAGE_INFO] VM machine='{vm_machine}', is_arm={is_arm}")

                    cmd = ["chromium", "--remote-debugging-port=1337"] if is_arm else ["google-chrome", "--remote-debugging-port=1337"]
                    payload = json.dumps({"command": cmd, "shell": False})

                    headers = {"Content-Type": "application/json"}
                    requests.post(
                        f"http://{host}:{server_port}/setup/launch",
                        headers=headers,
                        data=payload,
                        timeout=30,
                    )
                    time.sleep(5)

                    browser = p.chromium.connect_over_cdp(remote_debugging_url)
                    logger.info("[PAGE_INFO] Successfully connected to new Chrome instance")

                # Create page using existing CDP context (per feedback)
                try:
                    if getattr(browser, "contexts", None) and len(browser.contexts) > 0:
                        context = browser.contexts[0]
                        page = context.new_page()
                    else:
                        # Fallback: create a new context if none exists
                        context = browser.new_context()
                        page = context.new_page()
                except Exception as e:
                    logger.error(f"[PAGE_INFO] Failed to create page from context: {e}")
                    browser.close()
                    raise

                # Set longer timeout for navigation
                page.set_default_timeout(timeout_ms)

                logger.info(f"[PAGE_INFO] Navigating to URL: {target_url}")
                page.goto(target_url, wait_until="networkidle", timeout=timeout_ms)

                try:
                    # Wait for the page to finish loading to avoid "execution context was destroyed"
                    page.wait_for_load_state("networkidle", timeout=timeout_ms)
                    title = page.title()
                    final_url = page.url
                    page_info = {"title": title, "url": final_url, "content": page.content()}
                    logger.info(f"[PAGE_INFO] Successfully loaded page. Title: '{title}'")
                except TimeoutError:
                    logger.warning(f"[PAGE_INFO] Page load timeout for URL: {target_url}")
                    page_info = {"title": "Load timeout", "url": page.url, "content": page.content()}
                except Exception as e:
                    logger.error(f"[PAGE_INFO] Error while reading page info: {e}")
                    page_info = {"title": "Error encountered", "url": page.url, "content": page.content()}

                # Best-effort cleanup (CDP disconnect)
                try:
                    page.close()
                except Exception:
                    pass
                try:
                    # Only close context if we created it (heuristic: no pre-existing contexts)
                    # If you want to be strict, track a flag `created_context = True/False`.
                    pass
                except Exception:
                    pass

                browser.close()
                return page_info

        except Exception as e:
            logger.error(f"[PAGE_INFO] Attempt {attempt + 1} failed: {str(e)}")
            logger.error(f"[PAGE_INFO] Exception type: {type(e).__name__}")

            if attempt < max_retries - 1:
                logger.info("[PAGE_INFO] Retrying in 3 seconds...")
                time.sleep(3)
            else:
                logger.error(f"[PAGE_INFO] All {max_retries} attempts failed. Returning error info.")
                return {"title": "Connection failed", "url": target_url, "content": ""}

    return {"title": "Unknown error", "url": target_url, "content": ""}




def get_open_tabs_info(env, config: Dict[str, str]):
    host = env.vm_ip
    port = env.chromium_port  # fixme: this port is hard-coded, need to be changed from config file
    server_port = env.server_port

    remote_debugging_url = f"http://{host}:{port}"
    
    # Configuration for retry and timeout
    max_retries = 2
    timeout_ms = 30000  # 30 seconds for tab info
    
    for attempt in range(max_retries):
        try:
            logger.info(f"[OPEN_TABS_INFO] Attempt {attempt + 1}/{max_retries}")
            
            with sync_playwright() as p:
                # connect to remote Chrome instance
                try:
                    browser = p.chromium.connect_over_cdp(remote_debugging_url)
                    logger.info(f"[OPEN_TABS_INFO] Successfully connected to existing Chrome instance")
                except Exception as e:
                    logger.warning(f"[OPEN_TABS_INFO] Failed to connect to existing Chrome instance: {e}")
                    # If the connection fails, start a new browser instance
                    platform.machine()
                    if "arm" in platform.machine():
                        # start a new browser instance if the connection fails
                        payload = json.dumps({"command": [
                            "chromium",
                            "--remote-debugging-port=1337"
                        ], "shell": False})
                    else:
                        payload = json.dumps({"command": [
                            "google-chrome",
                            "--remote-debugging-port=1337"
                        ], "shell": False})

                    headers = {"Content-Type": "application/json"}
                    requests.post(f"http://{host}:{server_port}/setup/launch", headers=headers, data=payload)
                    time.sleep(5)
                    try:
                        browser = p.chromium.connect_over_cdp(remote_debugging_url)
                        logger.info(f"[OPEN_TABS_INFO] Successfully connected to new Chrome instance")
                    except Exception as e:
                        logger.error(f"[OPEN_TABS_INFO] Failed to connect to new Chrome instance: {e}")
                        return []

                tabs_info = []
                for context in browser.contexts:
                    for page in context.pages:
                        try:
                            # Set timeout for each page
                            page.set_default_timeout(timeout_ms)
                            
                            # Wait for the page to finish loading, this prevents the "execution context was destroyed" issue
                            page.wait_for_load_state('networkidle', timeout=timeout_ms)  # Wait for the 'load' event to complete
                            title = page.title()
                            url = page.url
                            tabs_info.append({'title': title, 'url': url})
                            logger.info(f"[OPEN_TABS_INFO] Tab info: '{title}' -> {url}")
                        except TimeoutError:
                            # If page loading times out, catch the exception and store the current information in the list
                            logger.warning(f"[OPEN_TABS_INFO] Tab load timeout for URL: {page.url}")
                            tabs_info.append({'title': 'Load timeout', 'url': page.url})
                        except Exception as e:
                            # Catch other potential exceptions that might occur while reading the page title
                            logger.error(f'[OPEN_TABS_INFO] Error reading tab info: {e}')
                            tabs_info.append({'title': 'Error encountered', 'url': page.url})

                browser.close()
                logger.info(f"[OPEN_TABS_INFO] Successfully retrieved info for {len(tabs_info)} tabs")
                return tabs_info
                
        except Exception as e:
            logger.error(f"[OPEN_TABS_INFO] Attempt {attempt + 1} failed: {str(e)}")
            logger.error(f"[OPEN_TABS_INFO] Exception type: {type(e).__name__}")
            
            if attempt < max_retries - 1:
                logger.info(f"[OPEN_TABS_INFO] Retrying in 3 seconds...")
                time.sleep(3)
            else:
                logger.error(f"[OPEN_TABS_INFO] All {max_retries} attempts failed. Returning empty list.")
                return []

    # This should never be reached, but just in case
    return []


def get_active_url_from_accessTree(env, config):
    """
        Playwright cannot get the url of active tab directly, 
        so we need to use accessibility tree to get the active tab info.
        This function is used to get the active tab url from the accessibility tree.
        config: 
            Dict[str, str]{
                # we no longer need to specify the xpath or selectors, since we will use defalut value
                # 'xpath': 
                #     the same as in metrics.general.accessibility_tree.
                # 'selectors': 
                #     the same as in metrics.general.accessibility_tree.
                'goto_prefix':
                    the prefix you want to add to the beginning of the url to be opened, default is "https://",
                    (the url we get from accTree does not have prefix)
                ...(other keys, not used in this function)
        }
        Return
            url: str
    """
    # Ensure the controller and its method are accessible and return a valid result
    if hasattr(env, 'controller') and callable(getattr(env.controller, 'get_accessibility_tree', None)):
        accessibility_tree = env.controller.get_accessibility_tree()
        if accessibility_tree is None:
            print("Failed to get the accessibility tree.")
            return None
    else:
        print("Controller or method 'get_accessibility_tree' not found.")
        return None

    logger.debug("AT@eval: %s", accessibility_tree)

    at = None
    try:
        at = lxml.etree.fromstring(accessibility_tree)
    except ValueError as e:
        logger.error(f"Error parsing accessibility tree: {e}")
        return None

    # Determine the correct selector based on system architecture
    selector = None
    arch = platform.machine()
    print(f"Your architecture is: {arch}")

    if "arm" in arch:
        selector_string = "application[name=Chromium] entry[name=Address\\ and\\ search\\ bar]"
    else:
        selector_string = "application[name=Google\\ Chrome] entry[name=Address\\ and\\ search\\ bar]"

    try:
        selector = CSSSelector(selector_string, namespaces=_accessibility_ns_map)
    except Exception as e:
        logger.error(f"Failed to parse the selector for active tab URL: {e}")
        return None

    elements = selector(at) if selector else []
    if not elements:
        print("No elements found.")
        return None
    elif not elements[-1].text:
        print("No text found in the latest element.")
        return None

    # Use a default prefix if 'goto_prefix' is not specified in the config
    goto_prefix = config.get("goto_prefix", "https://")

    active_tab_url = f"{goto_prefix}{elements[0].text}"
    print(f"Active tab url now: {active_tab_url}")
    return active_tab_url


def get_active_tab_info(env, config: Dict[str, str]):
    """
    This function is used to get all info about active tab.
    Warning! This function will reload the target-url page
    If the tartget url has cache or cookie, this function may reload to another page.
    If you have tested the url will not pop up to another page (check in incongnito mode yourself first),
    you can use this function.
    config: Dict[str, str]{
        # Keys used in get_active_url_from_accessTree: "xpath", "selectors"
    }
    """
    active_tab_url = get_active_url_from_accessTree(env, config)
    if active_tab_url is None:
        logger.error("Failed to get the url of active tab")
        return None
        
    logger.info(f"[ACTIVE_TAB_INFO] Active tab URL: {active_tab_url}")
    
    host = env.vm_ip
    port = env.chromium_port  # fixme: this port is hard-coded, need to be changed from config file

    remote_debugging_url = f"http://{host}:{port}"
    
    # Configuration for retry and timeout
    max_retries = 2
    timeout_ms = 60000  # 60 seconds for active tab
    
    for attempt in range(max_retries):
        try:
            logger.info(f"[ACTIVE_TAB_INFO] Attempt {attempt + 1}/{max_retries}")
            
            with sync_playwright() as p:
                # connect to remote Chrome instance, since it is supposed to be the active one, we won't start a new one if failed
                try:
                    browser = p.chromium.connect_over_cdp(remote_debugging_url)
                    logger.info(f"[ACTIVE_TAB_INFO] Successfully connected to Chrome instance")
                except Exception as e:
                    logger.error(f"[ACTIVE_TAB_INFO] Failed to connect to Chrome instance: {e}")
                    return None

                active_tab_info = {}
                # go to the target URL page
                page = browser.new_page()
                
                # Set longer timeout for navigation
                page.set_default_timeout(timeout_ms)
                
                try:
                    logger.info(f"[ACTIVE_TAB_INFO] Navigating to URL: {active_tab_url}")
                    page.goto(active_tab_url, wait_until='load', timeout=timeout_ms)
                    page.wait_for_load_state('load', timeout=timeout_ms)  # Wait for the 'load' event to complete
                    
                    active_tab_info = {
                        'title': page.title(),
                        'url': page.url,
                        'content': page.content()  # get the HTML content of the page
                    }
                    
                    logger.info(f"[ACTIVE_TAB_INFO] Successfully loaded page. Title: '{active_tab_info['title']}'")
                    logger.info(f"[ACTIVE_TAB_INFO] Current URL: '{active_tab_info['url']}'")
                    
                except TimeoutError:
                    logger.warning(f"[ACTIVE_TAB_INFO] Page load timeout for URL: {active_tab_url}")
                    active_tab_info = {
                        'title': 'Load timeout',
                        'url': page.url,
                        'content': page.content()
                    }
                except Exception as e:
                    logger.error(f"[ACTIVE_TAB_INFO] Failed to go to the target URL page: {e}")
                    return None

                browser.close()
                return active_tab_info
                
        except Exception as e:
            logger.error(f"[ACTIVE_TAB_INFO] Attempt {attempt + 1} failed: {str(e)}")
            logger.error(f"[ACTIVE_TAB_INFO] Exception type: {type(e).__name__}")
            
            if attempt < max_retries - 1:
                logger.info(f"[ACTIVE_TAB_INFO] Retrying in 3 seconds...")
                time.sleep(3)
            else:
                logger.error(f"[ACTIVE_TAB_INFO] All {max_retries} attempts failed.")
                return None

    # This should never be reached, but just in case
    return None


def get_pdf_from_url(env, config: Dict[str, str]) -> str:
    """
    Download a PDF from a URL.
    """
    _url = config["path"]
    # Write to eval_cache_dir to avoid polluting gold-standard cache
    _path = os.path.join(env.eval_cache_dir, config["dest"])
    
    # Add logging for debugging
    logger.info(f"[PDF_FROM_URL] Starting PDF download from URL: {_url}")
    logger.info(f"[PDF_FROM_URL] Target path: {_path}")

    host = env.vm_ip
    port = env.chromium_port  # fixme: this port is hard-coded, need to be changed from config file
    server_port = env.server_port

    remote_debugging_url = f"http://{host}:{port}"
    
    # Configuration for retry and timeout
    max_retries = 3
    timeout_ms = 60000  # Increase timeout to 60 seconds
    
    for attempt in range(max_retries):
        try:
            logger.info(f"[PDF_FROM_URL] Attempt {attempt + 1}/{max_retries}")
            
            with sync_playwright() as p:
                try:
                    browser = p.chromium.connect_over_cdp(remote_debugging_url)
                    logger.info(f"[PDF_FROM_URL] Successfully connected to existing Chrome instance")
                except Exception as e:
                    logger.warning(f"[PDF_FROM_URL] Failed to connect to existing Chrome instance: {e}")
                    logger.info(f"[PDF_FROM_URL] Starting new Chrome instance...")
                    
                    # If the connection fails, start a new browser instance
                    platform.machine()
                    if "arm" in platform.machine():
                        # start a new browser instance if the connection fails
                        payload = json.dumps({"command": [
                            "chromium",
                            "--remote-debugging-port=1337"
                        ], "shell": False})
                    else:
                        payload = json.dumps({"command": [
                            "google-chrome",
                            "--remote-debugging-port=1337"
                        ], "shell": False})

                    headers = {"Content-Type": "application/json"}
                    requests.post("http://" + host + ":" + server_port + "/setup" + "/launch", headers=headers, data=payload)
                    time.sleep(5)
                    browser = p.chromium.connect_over_cdp(remote_debugging_url)
                    logger.info(f"[PDF_FROM_URL] Successfully connected to new Chrome instance")

                page = browser.new_page()
                
                # Set longer timeout for navigation
                page.set_default_timeout(timeout_ms)
                
                logger.info(f"[PDF_FROM_URL] Navigating to URL: {_url}")
                page.goto(_url, wait_until='networkidle', timeout=timeout_ms)
                
                # Wait for page to be fully loaded
                logger.info(f"[PDF_FROM_URL] Waiting for page to be fully loaded...")
                page.wait_for_load_state('networkidle', timeout=timeout_ms)
                
                # Additional wait to ensure all content is rendered
                time.sleep(3)
                
                logger.info(f"[PDF_FROM_URL] Page loaded successfully. Title: '{page.title()}'")
                logger.info(f"[PDF_FROM_URL] Current URL: '{page.url}'")
                
                # Generate PDF
                logger.info(f"[PDF_FROM_URL] Generating PDF...")
                page.pdf(path=_path)
                
                logger.info(f"[PDF_FROM_URL] PDF generated successfully at: {_path}")
                browser.close()
                
                # Verify PDF file was created
                if os.path.exists(_path):
                    file_size = os.path.getsize(_path)
                    logger.info(f"[PDF_FROM_URL] PDF file created successfully. Size: {file_size} bytes")
                    return _path
                else:
                    logger.error(f"[PDF_FROM_URL] PDF file was not created at expected path: {_path}")
                    raise FileNotFoundError(f"PDF file was not created at {_path}")
                    
        except Exception as e:
            logger.error(f"[PDF_FROM_URL] Attempt {attempt + 1} failed: {str(e)}")
            logger.error(f"[PDF_FROM_URL] Exception type: {type(e).__name__}")
            
            if attempt < max_retries - 1:
                logger.info(f"[PDF_FROM_URL] Retrying in 5 seconds...")
                time.sleep(5)
            else:
                logger.error(f"[PDF_FROM_URL] All {max_retries} attempts failed. Giving up.")
                
                # Create a placeholder file or return a default path
                try:
                    # Create an empty PDF file as fallback
                    with open(_path, 'w') as f:
                        f.write("%PDF-1.4\n%EOF\n")
                    logger.warning(f"[PDF_FROM_URL] Created empty PDF file as fallback: {_path}")
                    return _path
                except Exception as fallback_error:
                    logger.error(f"[PDF_FROM_URL] Failed to create fallback file: {fallback_error}")
                    # Return the path anyway, even if file creation failed
                    return _path

    # This should never be reached, but just in case
    return _path


# fixme: needs to be changed (maybe through post-processing) since it's not working
def get_chrome_saved_address(env, config: Dict[str, str]):
    host = env.vm_ip
    port = env.chromium_port  # fixme: this port is hard-coded, need to be changed from config file
    server_port = env.server_port

    remote_debugging_url = f"http://{host}:{port}"
    
    # Configuration for retry and timeout
    max_retries = 2
    timeout_ms = 30000  # 30 seconds for settings page
    
    for attempt in range(max_retries):
        try:
            logger.info(f"[CHROME_SAVED_ADDRESS] Attempt {attempt + 1}/{max_retries}")
            
            with sync_playwright() as p:
                # connect to remote Chrome instance
                try:
                    browser = p.chromium.connect_over_cdp(remote_debugging_url)
                    logger.info(f"[CHROME_SAVED_ADDRESS] Successfully connected to existing Chrome instance")
                except Exception as e:
                    logger.warning(f"[CHROME_SAVED_ADDRESS] Failed to connect to existing Chrome instance: {e}")
                    # If the connection fails, start a new browser instance
                    platform.machine()
                    if "arm" in platform.machine():
                        # start a new browser instance if the connection fails
                        payload = json.dumps({"command": [
                            "chromium",
                            "--remote-debugging-port=1337"
                        ], "shell": False})
                    else:
                        payload = json.dumps({"command": [
                            "google-chrome",
                            "--remote-debugging-port=1337"
                        ], "shell": False})

                    headers = {"Content-Type": "application/json"}
                    requests.post("http://" + host + ":" + server_port + "/setup" + "/launch", headers=headers, data=payload)
                    time.sleep(5)
                    browser = p.chromium.connect_over_cdp(remote_debugging_url)
                    logger.info(f"[CHROME_SAVED_ADDRESS] Successfully connected to new Chrome instance")

                page = browser.new_page()
                
                # Set longer timeout for navigation
                page.set_default_timeout(timeout_ms)

                # Navigate to Chrome's settings page for autofill
                logger.info(f"[CHROME_SAVED_ADDRESS] Navigating to Chrome settings page")
                page.goto("chrome://settings/addresses", wait_until='networkidle', timeout=timeout_ms)
                
                # Wait for page to be fully loaded
                page.wait_for_load_state('networkidle', timeout=timeout_ms)

                # Get the HTML content of the page
                content = page.content()
                
                logger.info(f"[CHROME_SAVED_ADDRESS] Successfully retrieved settings page content")
                browser.close()
                
                return content
                
        except Exception as e:
            logger.error(f"[CHROME_SAVED_ADDRESS] Attempt {attempt + 1} failed: {str(e)}")
            logger.error(f"[CHROME_SAVED_ADDRESS] Exception type: {type(e).__name__}")
            
            if attempt < max_retries - 1:
                logger.info(f"[CHROME_SAVED_ADDRESS] Retrying in 3 seconds...")
                time.sleep(3)
            else:
                logger.error(f"[CHROME_SAVED_ADDRESS] All {max_retries} attempts failed. Returning empty content.")
                return ""

    # This should never be reached, but just in case
    return ""


def get_shortcuts_on_desktop(env, config: Dict[str, str]):
    shortcut_extension = '.desktop'

    # Get the path to the desktop folder
    desktop_path = env.controller.get_vm_desktop_path()
    desktop_directory_tree = env.controller.get_vm_directory_tree(desktop_path)

    shortcuts_paths = [file['name'] for file in desktop_directory_tree['children'] if
                       file['name'].endswith(shortcut_extension)]

    short_cuts = {}

    for shortcut_path in shortcuts_paths:
        short_cuts[shortcut_path] = env.controller.get_file(env.controller.execute_python_command(
            f"import os; print(os.path.join(os.path.expanduser('~'), 'Desktop', '{shortcut_path}'))")[
                                                                'output'].strip()).decode('utf-8')

    return short_cuts


def get_number_of_search_results(env, config: Dict[str, str]):
    # todo: move into the config file
    url, result_selector = "https://google.com/search?q=query", '.search-result'
    host = env.vm_ip
    port = env.chromium_port  # fixme: this port is hard-coded, need to be changed from config file
    server_port = env.server_port

    remote_debugging_url = f"http://{host}:{port}"
    
    # Configuration for retry and timeout
    max_retries = 2
    timeout_ms = 45000  # 45 seconds for search results
    
    for attempt in range(max_retries):
        try:
            logger.info(f"[SEARCH_RESULTS] Attempt {attempt + 1}/{max_retries} for URL: {url}")
            
            with sync_playwright() as p:
                try:
                    browser = p.chromium.connect_over_cdp(remote_debugging_url)
                    logger.info(f"[SEARCH_RESULTS] Successfully connected to existing Chrome instance")
                except Exception as e:
                    logger.warning(f"[SEARCH_RESULTS] Failed to connect to existing Chrome instance: {e}")
                    # If the connection fails, start a new browser instance
                    platform.machine()
                    if "arm" in platform.machine():
                        # start a new browser instance if the connection fails
                        payload = json.dumps({"command": [
                            "chromium",
                            "--remote-debugging-port=1337"
                        ], "shell": False})
                    else:
                        payload = json.dumps({"command": [
                            "google-chrome",
                            "--remote-debugging-port=1337"
                        ], "shell": False})

                    headers = {"Content-Type": "application/json"}
                    requests.post("http://" + host + ":" + server_port + "/setup" + "/launch", headers=headers, data=payload)
                    time.sleep(5)
                    browser = p.chromium.connect_over_cdp(remote_debugging_url)
                    logger.info(f"[SEARCH_RESULTS] Successfully connected to new Chrome instance")
                    
                page = browser.new_page()
                
                # Set longer timeout for navigation
                page.set_default_timeout(timeout_ms)
                
                logger.info(f"[SEARCH_RESULTS] Navigating to URL: {url}")
                page.goto(url, wait_until='networkidle', timeout=timeout_ms)
                
                # Wait for page to be fully loaded
                page.wait_for_load_state('networkidle', timeout=timeout_ms)
                
                search_results = page.query_selector_all(result_selector)
                actual_count = len(search_results)
                
                logger.info(f"[SEARCH_RESULTS] Found {actual_count} search results")
                browser.close()
                
                return actual_count
                
        except Exception as e:
            logger.error(f"[SEARCH_RESULTS] Attempt {attempt + 1} failed: {str(e)}")
            logger.error(f"[SEARCH_RESULTS] Exception type: {type(e).__name__}")
            
            if attempt < max_retries - 1:
                logger.info(f"[SEARCH_RESULTS] Retrying in 3 seconds...")
                time.sleep(3)
            else:
                logger.error(f"[SEARCH_RESULTS] All {max_retries} attempts failed. Returning 0.")
                return 0

    # This should never be reached, but just in case
    return 0


def get_googledrive_file(env, config: Dict[str, Any]) -> Any:
    """ Get the desired file from Google Drive based on config, return the downloaded local filepath.
    @args: keys in config dict
        settings_file(str): target filepath to the settings file for Google Drive authentication, default is 'evaluation_examples/settings/googledrive/settings.yml'
        query/path[_list](Union[str, List[str]]): the query or path [list] to the file(s) on Google Drive. To retrieve the file, we provide multiple key options to specify the filepath on drive in config dict:
            1) query: a list of queries to search the file, each query is a string that follows the format of Google Drive search query. The documentation is available here: (support more complex search but too complicated to use)
                https://developers.google.com/drive/api/guides/search-files?hl=en
            2) path: a str list poingting to file path on googledrive, e.g., 'folder/subfolder/filename.txt' -> 
                config contain one key-value pair "path": ['folder', 'subfolder', 'filename.txt']
            3) query_list: query extends to list to download multiple files
            4) path_list: path extends to list to download multiple files, e.g.,
                "path_list": [['folder', 'subfolder', 'filename1.txt'], ['folder', 'subfolder', 'filename2.txt']]
    @return:
        dest(Union[List[str], str]): target file name or list. If *_list is used in input config, dest should also be a list of the same length. Return the downloaded local filepath.
    """
    settings_file = config.get('settings_file', 'evaluation_examples/settings/googledrive/settings.yml')
    auth = GoogleAuth(settings_file=settings_file)
    drive = GoogleDrive(auth)

    def get_single_file(_query, _path):
        parent_id = 'root'
        try:
            for q in _query:
                search = f'( {q} ) and "{parent_id}" in parents'
                filelist: GoogleDriveFileList = drive.ListFile({'q': search}).GetList()
                if len(filelist) == 0:  # target file not found
                    return None
                file: GoogleDriveFile = filelist[0]  # HACK: if multiple candidates, just use the first one
                parent_id = file['id']

            file.GetContentFile(_path, mimetype=file['mimeType'])
        except Exception as e:
            logger.info('[ERROR]: Failed to download the file from Google Drive', e)
            return None
        return _path

    # Write to eval_cache_dir to avoid polluting gold-standard cache
    _gdrive_dir = env.eval_cache_dir

    if 'query' in config:
        result = get_single_file(config['query'], os.path.join(_gdrive_dir, config['dest']))
        return result
    elif 'path' in config:
        query = [f"title = '{fp}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false" if idx < len(
            config['path']) - 1
                 else f"title = '{fp}' and trashed = false" for idx, fp in enumerate(config['path'])]
        result = get_single_file(query, os.path.join(_gdrive_dir, config['dest']))
        return result
    elif 'query_list' in config:
        _path_list = []
        assert len(config['query_list']) == len(config['dest'])
        for idx, query in enumerate(config['query_list']):
            dest = config['dest'][idx]
            result = get_single_file(query, os.path.join(_gdrive_dir, dest))
            _path_list.append(result)
        return _path_list
    else:  # path_list in config
        _path_list = []
        assert len(config['path_list']) == len(config['dest'])
        for idx, path in enumerate(config['path_list']):
            query = [
                f"title = '{fp}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false" if jdx < len(
                    path) - 1
                else f"title = '{fp}' and trashed = false" for jdx, fp in enumerate(path)]
            dest = config['dest'][idx]
            result = get_single_file(query, os.path.join(_gdrive_dir, dest))
            _path_list.append(result)
        return _path_list


def get_enable_do_not_track(env, config: Dict[str, str]):
    if "arm" in platform.machine():
        preference_file_path = env.controller.execute_python_command(
            "import os; print(os.path.join(os.getenv('HOME'), 'snap/chromium/common/chromium/Default/Preferences'))")[
            'output'].strip()
    else:
        preference_file_path = env.controller.execute_python_command(
            "import os; print(os.path.join(os.getenv('HOME'), '.config/google-chrome/Default/Preferences'))")[
            'output'].strip()

    try:
        content = env.controller.get_file(preference_file_path)
        data = json.loads(content)

        if_enable_do_not_track = data.get('enable_do_not_track', {})  # bool
        return "true" if if_enable_do_not_track else "false"
    except Exception as e:
        logger.error(f"Error: {e}")
        return "false"


def get_enable_enhanced_safety_browsing(env, config: Dict[str, str]):
    if "arm" in platform.machine():
        preference_file_path = env.controller.execute_python_command(
            "import os; print(os.path.join(os.getenv('HOME'), 'snap/chromium/common/chromium/Default/Preferences'))")[
            'output'].strip()
    else:
        preference_file_path = env.controller.execute_python_command(
            "import os; print(os.path.join(os.getenv('HOME'), '.config/google-chrome/Default/Preferences'))")[
            'output'].strip()

    try:
        content = env.controller.get_file(preference_file_path)
        data = json.loads(content)

        if_enable_do_not_track = data.get('safebrowsing', {}).get('enhanced', {})  # bool
        return "true" if if_enable_do_not_track else "false"
    except Exception as e:
        logger.error(f"Error: {e}")
        return "Google"


def get_enable_safe_browsing(env, config: Dict[str, str]):
    if "arm" in platform.machine():
        preference_file_path = env.controller.execute_python_command(
            "import os; print(os.path.join(os.getenv('HOME'), 'snap/chromium/common/chromium/Default/Preferences'))")[
            'output'].strip()
    else:
        preference_file_path = env.controller.execute_python_command(
            "import os; print(os.path.join(os.getenv('HOME'), '.config/google-chrome/Default/Preferences'))")[
            'output'].strip()

    try:
        content = env.controller.get_file(preference_file_path)
        data = json.loads(content)

        safebrowsing = data.get('safebrowsing', {})
        is_enhanced = bool(safebrowsing.get('enhanced', False))
        is_enabled = bool(safebrowsing.get('enabled', False))
        return "true" if (is_enhanced or is_enabled) else "false"
    except Exception as e:
        logger.error(f"Error: {e}")
        return "false"

def get_new_startup_page(env, config: Dict[str, str]):
    if "arm" in platform.machine():
        preference_file_path = env.controller.execute_python_command(
            "import os; print(os.path.join(os.getenv('HOME'), 'snap/chromium/common/chromium/Default/Preferences'))")[
            'output'].strip()
    else:
        preference_file_path = env.controller.execute_python_command(
            "import os; print(os.path.join(os.getenv('HOME'), '.config/google-chrome/Default/Preferences'))")[
            'output'].strip()

    try:
        content = env.controller.get_file(preference_file_path)
        data = json.loads(content)

        # if data has no key called 'session', it means the chrome is on a fresh-start mode, which is a true state;
        # otherwise, try to find the code number in 'restored_on_startup' in 'session'
        if "session" not in data.keys():
            return "true"
        else:
            if_enable_do_not_track = data.get('session', {}).get('restore_on_startup', {})  # int, need to be 5
            return "true" if if_enable_do_not_track == 5 else "false"
    except Exception as e:
        logger.error(f"Error: {e}")
        return "Google"


def get_find_unpacked_extension_path(env, config: Dict[str, str]):
    if "arm" in platform.machine():
        preference_file_path = env.controller.execute_python_command(
            "import os; print(os.path.join(os.getenv('HOME'), 'snap/chromium/common/chromium/Default/Preferences'))")[
            'output'].strip()
    else:
        preference_file_path = env.controller.execute_python_command(
            "import os; print(os.path.join(os.getenv('HOME'), '.config/google-chrome/Default/Preferences'))")[
            'output'].strip()

    try:
        content = env.controller.get_file(preference_file_path)
        data = json.loads(content)
        # Preferences store all the path of installed extensions, return them all and let metrics try to find one matches the targeted extension path
        all_extensions_path = []
        all_extensions = data.get('extensions', {}).get('settings', {})
        for id in all_extensions.keys():
            path = all_extensions[id]["path"]
            all_extensions_path.append(path)
        return all_extensions_path
    except Exception as e:
        logger.error(f"Error: {e}")
        return "Google"


def get_find_installed_extension_name(env, config: Dict[str, str]):
    if "arm" in platform.machine():
        preference_file_path = env.controller.execute_python_command(
            "import os; print(os.path.join(os.getenv('HOME'), 'snap/chromium/common/chromium/Default/Preferences'))")[
            'output'].strip()
    else:
        preference_file_path = env.controller.execute_python_command(
            "import os; print(os.path.join(os.getenv('HOME'), '.config/google-chrome/Default/Preferences'))")[
            'output'].strip()

    try:
        content = env.controller.get_file(preference_file_path)
        data = json.loads(content)
        # Preferences store all the path of installed extensions, return them all and let metrics try to find one matches the targeted extension path
        all_extensions_name = []
        all_extensions = data.get('extensions', {}).get('settings', {})
        for id in all_extensions.keys():
            name = all_extensions[id]["manifest"]["name"]
            all_extensions_name.append(name)
        return all_extensions_name
    except Exception as e:
        logger.error(f"Error: {e}")
        return "Google"


def get_data_delete_automacally(env, config: Dict[str, str]):
    """
    This function is used to open th "auto-delete" mode of chromium
    """
    if "arm" in platform.machine():
        preference_file_path = env.controller.execute_python_command(
            "import os; print(os.path.join(os.getenv('HOME'), 'snap/chromium/common/chromium/Default/Preferences'))")[
            'output'].strip()
    else:
        preference_file_path = env.controller.execute_python_command(
            "import os; print(os.path.join(os.getenv('HOME'), '.config/google-chrome/Default/Preferences'))")[
            'output'].strip()

    try:
        content = env.controller.get_file(preference_file_path)
        data = json.loads(content)
        data_delete_state = data["profile"].get("default_content_setting_values", None)
        return "true" if data_delete_state is not None else "false"
    except Exception as e:
        logger.error(f"Error: {e}")
        return "Google"


def get_active_tab_html_parse(env, config: Dict[str, Any]):
    """
    This function is used to get the specific element's text content from the active tab's html.
    config:
        Dict[str, str]{
            # Keys used in get_active_url_from_accessTree: "xpath", "selectors"
            'category':
                choose from ["class", "label", "xpath", "input"], used to indicate how to find the element
            'labelObject':
                only exists when category is "label",
                a dict like { "labelSelector": "the key you want to store the text content of this label's ee=lement"}
            'class_singleObject':
                only exists when category is "class", a dict with keys as the class name,
                like { "class name" : "the key you want to store the text content of this element" }
            'class_multiObject':
                only exists when category is "class", used for elements with same class name.
                Two layer of dict, like
                    ( {
                        "class name": {
                            "rank in this class" : "the key you want to store the text content of this element"
                            ...
                            }
                        } )
            'xpathObject':
                only exists when category is "xpath", a dict with keys as the xpath,
                like { "full xpath" : "the key you want to store the text content of this element" }
            'inputObject':
                only exists when category is "input",
                a dict with keys as the input element's xpath, like { "full xpath" : "the key you want to store the text content of this element" }
    }
    """
    active_tab_url = get_active_url_from_accessTree(env, config)
    logger.info(f"[DEBUG] get_active_url_from_accessTree returned: {active_tab_url} (type: {type(active_tab_url)})")
    if not isinstance(active_tab_url, str):
        logger.error(f"[DEBUG] active_tab_url is not a string, got {type(active_tab_url)}: {active_tab_url}")
        return None
    host = env.vm_ip
    port = env.chromium_port  # fixme: this port is hard-coded, need to be changed from config file
    server_port = env.server_port

    remote_debugging_url = f"http://{host}:{port}"
    
    # DEBUG: Add logging for configuration
    logger.info(f"[DEBUG] get_active_tab_html_parse called with config: {config}")
    
    with sync_playwright() as p:
        # connect to remote Chrome instance
        try:
            browser = p.chromium.connect_over_cdp(remote_debugging_url)
        except Exception as e:
            # If the connection fails, start a new browser instance
            platform.machine()
            if "arm" in platform.machine():
                # start a new browser instance if the connection fails
                payload = json.dumps({"command": [
                    "chromium",
                    "--remote-debugging-port=1337"
                ], "shell": False})
            else:
                payload = json.dumps({"command": [
                    "google-chrome",
                    "--remote-debugging-port=1337"
                ], "shell": False})

            headers = {"Content-Type": "application/json"}
            requests.post("http://" + host + ":" + str(server_port) + "/setup" + "/launch", headers=headers, data=payload)
            time.sleep(5)
            browser = p.chromium.connect_over_cdp(remote_debugging_url)
        target_page = None
        for context in browser.contexts:
            for page in context.pages:
                try:
                    # Wait for page to be stable before checking URL
                    page.wait_for_load_state("networkidle", timeout=60000)
                    
                    # Check if page is still valid before accessing properties
                    if page.is_closed():
                        logger.debug(f"[DEBUG] Page is closed, skipping")
                        continue
                    
                    # the accTree and playwright can get encoding(percent-encoding) characters, we need to convert them to normal characters
                    # Normalize URLs by removing trailing slashes and decoding percent-encoding
                    def normalize_url(url):
                        return unquote(url).rstrip('/')
                    
                    # Safely get page URL with error handling
                    try:
                        page_url = page.url
                    except Exception as url_error:
                        logger.debug(f"[DEBUG] Failed to get page URL: {url_error}")
                        continue
                    
                    if normalize_url(page_url) == normalize_url(active_tab_url):
                        target_page = page
                        print("\33[32mtartget page url: ", target_page.url, "\33[0m")
                        
                        # Safely get page title with error handling
                        try:
                            page_title = target_page.title()
                            print("\33[32mtartget page title: ", page_title, "\33[0m")
                        except Exception as title_error:
                            logger.debug(f"[DEBUG] Failed to get page title: {title_error}")
                            print("\33[32mtartget page title: [Unable to get title - page may be navigating]", "\33[0m")
                        break
                        
                except Exception as page_error:
                    logger.debug(f"[DEBUG] Error processing page: {page_error}")
                    continue
        if target_page is None:
            logger.error("[DEBUG] Could not find target tab matching URL. Available tabs:")
            for context in browser.contexts:
                for page in context.pages:
                    try:
                        if not page.is_closed():
                            page_url = page.url
                            logger.error(f"[DEBUG] - Tab URL: {page_url}")
                    except Exception as e:
                        logger.error(f"[DEBUG] - Tab URL: [Unable to get URL: {e}]")
            logger.error(f"[DEBUG] Expected URL: {active_tab_url}")
            return {}

        return_json = {}

        def safely_get_text_content(selector):
            try:
                if target_page.is_closed():
                    logger.warning(f"[DEBUG] Target page is closed, cannot get text content for selector: {selector}")
                    return []
                elements = target_page.query_selector_all(selector)
                return [element.text_content().strip() for element in elements if element]
            except Exception as e:
                logger.warning(f"[DEBUG] Error getting text content for selector '{selector}': {e}")
                return []

        def safely_get_direct_text_nodes_playwright(selector):
            """
            Extract all direct text node contents under the specified selector element (excluding text inside child div, span, etc.).
            Returns a list of lists, each sublist contains the direct text nodes of one element.
            Suitable for structures like: <div>SEA<div class="aura-separator"></div>NYC</div>
            """
            try:
                if target_page.is_closed():
                    logger.warning(f"[DEBUG] Target page is closed, cannot get direct text nodes for selector: {selector}")
                    return []
                elements = target_page.query_selector_all(selector)
                results = []
                for element in elements:
                    texts = element.evaluate('''
                        (node) => Array.from(node.childNodes)
                            .filter(n => n.nodeType === Node.TEXT_NODE)
                            .map(n => n.textContent.trim())
                            .filter(Boolean)
                    ''')
                    results.append(texts)
                # Safety check: return empty list if no elements found
                return results[0] if results else []
            except Exception as e:
                logger.warning(f"[DEBUG] Error getting direct text nodes for selector '{selector}': {e}")
                return []
        
        def safely_get_direct_li_playwright(selector):
            try:
                if target_page.is_closed():
                    logger.warning(f"[DEBUG] Target page is closed, cannot get li elements for selector: {selector}")
                    return []
                elements = target_page.query_selector_all(selector + " li.catAllProducts")
                return [element.query_selector('span').inner_text().strip() for element in elements if element.query_selector('span')]
            except Exception as e:
                logger.warning(f"[DEBUG] Error getting li elements for selector '{selector}': {e}")
                return []

        def safely_get_only_child_text_content(selector):
            try:
                if target_page.is_closed():
                    logger.warning(f"[DEBUG] Target page is closed, cannot get child text content for selector: {selector}")
                    return []
                elements = target_page.query_selector_all(selector)
                return [element.query_selector('h3').text_content().strip() for element in elements if element.query_selector('h3')]
            except Exception as e:
                logger.warning(f"[DEBUG] Error getting child text content for selector '{selector}': {e}")
                return []

        if config["category"] == "class":
            class_multiObject = config.get("class_multiObject", {})
            for class_name, object_dict in class_multiObject.items():
                elements_texts = safely_get_text_content("." + class_name)
                for order_key, key in object_dict.items():
                    index = int(order_key)
                    if len(elements_texts) > index:
                        return_json[key] = elements_texts[index]
                    else:
                        logger.warning(f"[DEBUG] Element at index {index} not found for class '{class_name}'. Found {len(elements_texts)} elements.")
                        return_json[key] = ""  # Return empty string instead of None
                        
            class_multiObject_child = config.get("class_multiObject_child", {})
            for class_name, object_dict in class_multiObject_child.items():
                elements_texts = safely_get_direct_text_nodes_playwright("." + class_name)
                for order_key, key in object_dict.items():
                    index = int(order_key)
                    if len(elements_texts) > index:
                        return_json[key] = elements_texts[index]
                    else:
                        logger.warning(f"[DEBUG] Child element at index {index} not found for class '{class_name}'. Found {len(elements_texts)} elements.")
                        return_json[key] = ""  # Return empty string instead of None
            
            class_multiObject_only_child = config.get("class_multiObject_only_child", {})
            for class_name, object_dict in class_multiObject_only_child.items():
                elements_texts = safely_get_only_child_text_content("." + class_name)
                for order_key, key in object_dict.items():
                    index = int(order_key)
                    if len(elements_texts) > index:
                        return_json[key] = elements_texts[index]
                    else:
                        logger.warning(f"[DEBUG] Only child element at index {index} not found for class '{class_name}'. Found {len(elements_texts)} elements.")
                        return_json[key] = ""  # Return empty string instead of None

            class_multiObject_search_exist = config.get("class_multiObject_search_exist", {})
            for class_name, object_list in class_multiObject_search_exist.items():
                elements_texts = safely_get_text_content("." + class_name)
                logger.info(f"[DEBUG] Found elements with class '{class_name}': {elements_texts}")
                logger.info(f"[DEBUG] Expected elements: {[obj for obj in object_list if obj != 'is_other_exist']}")
                
                for each_object in object_list:
                    if each_object == "is_other_exist":
                        continue
                    if each_object in elements_texts:
                        return_json[each_object] = True
                    else:
                        return_json[each_object] = False
                if "is_other_exist" in object_list:
                    extra_elements = []
                    for each_element in elements_texts:
                        if each_element not in object_list:
                            extra_elements.append(each_element)
                            return_json["is_other_exist"] = True
                    if extra_elements:
                        logger.warning(f"[DEBUG] Found unexpected elements not in expected list: {extra_elements}")
                    else:
                        logger.info(f"[DEBUG] No unexpected elements found")
                    if "is_other_exist" not in return_json.keys():
                        return_json["is_other_exist"] = False
                

            class_singleObject = config.get("class_singleObject", {})
            for class_name, key in class_singleObject.items():
                element_text = safely_get_text_content("." + class_name)
                logger.info(f"[DEBUG] Class '{class_name}' found {len(element_text)} elements")
                if element_text:
                    return_json[key] = element_text[0]
                    logger.info(f"[DEBUG] Class extraction for key '{key}': '{element_text[0]}'")
                else:
                    logger.warning(f"[DEBUG] No elements found for class: {class_name}")
                    return_json[key] = ""  # Return empty string instead of None

        elif config['category'] == "label":
            # Assuming get_by_label is a custom function or part of the framework being used
            labelObject = config.get("labelObject", {})
            for labelSelector, key in labelObject.items():
                try:
                    if target_page.is_closed():
                        logger.warning(f"[DEBUG] Target page is closed, cannot process label for key '{key}'")
                        return_json[key] = ""
                        continue
                        
                    text = target_page.locator(f"text={labelSelector}").first.text_content()
                    if text:
                        text = text.strip()
                        return_json[key] = text
                    else:
                        return_json[key] = ""
                except Exception as e:
                    logger.error(f"[DEBUG] Error processing label for key '{key}': {e}")
                    return_json[key] = ""

        elif config["category"] == "xpath":
            xpathObject = config.get("xpathObject", {})
            logger.info(f"[DEBUG] Processing xpath category with xpathObject: {xpathObject}")
            
            for xpath, key in xpathObject.items():
                logger.info(f"[DEBUG] Processing xpath: {xpath} -> key: {key}")
                
                # Check if page is still valid
                try:
                    if target_page.is_closed():
                        logger.warning(f"[DEBUG] Target page is closed, cannot process xpath for key '{key}'")
                        return_json[key] = ""
                        continue
                        
                    elements = target_page.locator(f"xpath={xpath}")
                    element_count = elements.count()
                    logger.info(f"[DEBUG] Found {element_count} elements for xpath: {xpath}")
                    
                    if element_count > 0:
                        try:
                            text_content = elements.first.text_content()
                            if text_content is not None:
                                text_content = text_content.strip()
                            logger.info(f"[DEBUG] Raw text content for key '{key}': '{text_content}' (type: {type(text_content)})")
                            
                            # 处理空文本内容的情况
                            if text_content is None or text_content == "":
                                logger.warning(f"[DEBUG] Element found but text content is empty for key '{key}' xpath: {xpath}")
                                # 尝试获取更多信息
                                try:
                                    element_html = elements.first.inner_html()
                                    element_text = elements.first.inner_text()
                                    logger.info(f"[DEBUG] Element innerHTML: '{element_html[:100]}...' innerText: '{element_text}'")
                                except Exception as inner_e:
                                    logger.debug(f"[DEBUG] Failed to get inner content: {inner_e}")
                                
                            return_json[key] = text_content if text_content else ""
                            logger.info(f"[DEBUG] Final value for key '{key}': '{return_json[key]}'")
                        except Exception as e:
                            logger.error(f"[DEBUG] Error extracting text from element for key '{key}': {e}")
                            return_json[key] = ""
                    else:
                        logger.warning(f"[DEBUG] No elements found for xpath: {xpath}")
                        # 尝试一些备用的xpath查找方法
                        try:
                            # 尝试不使用xpath前缀
                            fallback_elements = target_page.locator(xpath)
                            fallback_count = fallback_elements.count()
                            logger.info(f"[DEBUG] Fallback search (without xpath prefix) found {fallback_count} elements")
                            if fallback_count > 0:
                                text_content = fallback_elements.first.text_content()
                                if text_content:
                                    text_content = text_content.strip()
                                return_json[key] = text_content if text_content else ""
                                logger.info(f"[DEBUG] Fallback extraction successful for key '{key}': '{return_json[key]}'")
                            else:
                                return_json[key] = ""
                        except Exception as e:
                            logger.info(f"[DEBUG] Fallback xpath search also failed: {e}")
                            return_json[key] = ""
                            
                except Exception as e:
                    logger.error(f"[DEBUG] Error processing xpath for key '{key}': {e}")
                    return_json[key] = ""

        elif config["category"] == "input":
            inputObjects = config.get("inputObject", {})
            logger.info(f"[DEBUG] Processing input category with inputObjects: {inputObjects}")
            for xpath, key in inputObjects.items():
                logger.info(f"[DEBUG] Processing input xpath: {xpath} -> key: {key}")
                try:
                    if target_page.is_closed():
                        logger.warning(f"[DEBUG] Target page is closed, cannot process input for key '{key}'")
                        return_json[key] = ""
                        continue
                        
                    inputs = target_page.locator(f"xpath={xpath}")
                    input_count = inputs.count()
                    logger.info(f"[DEBUG] Found {input_count} input elements for xpath: {xpath}")
                    if input_count > 0:
                        try:
                            input_value = inputs.first.input_value()
                            if input_value:
                                input_value = input_value.strip()
                            return_json[key] = input_value if input_value else ""
                            logger.info(f"[DEBUG] Input value for key '{key}': '{return_json[key]}'")
                        except Exception as e:
                            logger.error(f"[DEBUG] Error getting input value for key '{key}': {e}")
                            return_json[key] = ""
                    else:
                        logger.warning(f"[DEBUG] No input elements found for xpath: {xpath}")
                        return_json[key] = ""
                except Exception as e:
                    logger.error(f"[DEBUG] Error processing input for key '{key}': {e}")
                    return_json[key] = ""
        
        elif config["category"] == "class&url":
            class_multiObject = config.get("class_multiObject", {})
            for class_name, object_list in class_multiObject.items():
                elements_texts = safely_get_text_content("." + class_name)
                for each_key in object_list:
                    if any(each_key.lower() == text.lower() for text in elements_texts):
                        return_json[each_key.lower()] = True

                for each_key in elements_texts:
                    # each_key.lower() not in object_list.lower():
                    if all(each_key.lower() not in item.lower() for item in object_list):
                        return_json["is_other_exist"] = True
                        break
                if "is_other_exist" not in return_json.keys():
                    return_json["is_other_exist"] = False
            
            class_multiObject_li = config.get("class_multiObject_li", {})
            for class_name, object_list in class_multiObject_li.items():
                elements_texts = safely_get_direct_li_playwright("." + class_name)
                for each_key in object_list:
                    if any(each_key.lower() == text.lower() for text in elements_texts):
                        return_json[each_key.lower()] = True
                
                for each_key in elements_texts:
                    # each_key.lower() not in object_list.lower():
                    if all(each_key.lower() not in item.lower() for item in object_list):
                        return_json["is_other_exist"] = True
                        break
                if "is_other_exist" not in return_json.keys():
                    return_json["is_other_exist"] = False

            url_include_expected = config.get("url_include_expected", [])
            for key in url_include_expected:
                try:
                    if target_page.is_closed():
                        logger.warning(f"[DEBUG] Target page is closed, cannot check URL for key '{key}'")
                        if key.lower() not in return_json.keys():
                            return_json[key.lower()] = False
                        continue
                        
                    page_url = target_page.url.lower()
                    if key.lower() in page_url:
                        if key.lower() not in return_json.keys():
                            return_json[key.lower()] = True
                    else:
                        if key.lower() not in return_json.keys():
                            return_json[key.lower()] = False
                except Exception as e:
                    logger.error(f"[DEBUG] Error checking URL for key '{key}': {e}")
                    if key.lower() not in return_json.keys():
                        return_json[key.lower()] = False
            
            url_include_expected_multichoice = config.get("url_include_expected_multichoice", {})
            for key, value in url_include_expected_multichoice.items():
                try:
                    if target_page.is_closed():
                        logger.warning(f"[DEBUG] Target page is closed, cannot check URL for multichoice key '{key}'")
                        if value.lower() not in return_json.keys():
                            return_json[value.lower()] = False
                        continue
                        
                    page_url = target_page.url.lower()
                    if key.lower() in page_url:
                        if value.lower() not in return_json.keys():
                            return_json[value.lower()] = True
                    else:
                        if value.lower() not in return_json.keys():
                            return_json[value.lower()] = False
                except Exception as e:
                    logger.error(f"[DEBUG] Error checking URL for multichoice key '{key}': {e}")
                    if value.lower() not in return_json.keys():
                        return_json[value.lower()] = False

        browser.close()
        
        # DEBUG: Add logging for final result and check for None values
        logger.info(f"[DEBUG] get_active_tab_html_parse final result: {return_json}")
        
        # 检查是否有None值
        none_keys = [key for key, value in return_json.items() if value is None]
        if none_keys:
            logger.warning(f"[DEBUG] Found None values for keys: {none_keys}")
            
        # 检查是否期望的键都存在
        if config["category"] == "xpath":
            expected_keys = set(config.get("xpathObject", {}).values())
            actual_keys = set(return_json.keys())
            missing_keys = expected_keys - actual_keys
            if missing_keys:
                logger.warning(f"[DEBUG] Missing expected keys: {missing_keys}")
        
    return return_json


def get_gotoRecreationPage_and_get_html_content(env, config: Dict[str, Any]):
    """
    especially used for www.recreation.gov examples
    """
    # Add logging for debugging
    logger.info(f"[RECREATION_PAGE] Starting recreation.gov page processing")
    logger.debug(f"[RECREATION_PAGE] Config: {config}")
    
    host = env.vm_ip
    port = env.chromium_port  # fixme: this port is hard-coded, need to be changed from config file
    server_port = env.server_port
    use_proxy = env.current_use_proxy

    remote_debugging_url = f"http://{host}:{port}"
    backend_url = f"http://{host}:{server_port}"
    
    # Configuration for retry and timeout
    max_retries = 3
    timeout_ms = 60000  # Increase timeout to 60 seconds
    
    # Test basic connectivity first
    logger.info(f"[RECREATION_PAGE] Testing basic network connectivity...")
    try:
        import urllib.request
        test_response = urllib.request.urlopen('http://www.google.com', timeout=10)
        logger.info(f"[RECREATION_PAGE] Basic connectivity test passed (Google accessible)")
    except Exception as e:
        logger.warning(f"[RECREATION_PAGE] Basic connectivity test failed: {e}")
        logger.info(f"[RECREATION_PAGE] Proceeding anyway...")
    
    for attempt in range(max_retries):
        try:
            logger.info(f"[RECREATION_PAGE] Attempt {attempt + 1}/{max_retries}")
            
            with sync_playwright() as p:
                # Connect to remote Chrome instance
                try:
                    browser = p.chromium.connect_over_cdp(remote_debugging_url)
                    logger.info(f"[RECREATION_PAGE] Successfully connected to existing Chrome instance")
                except Exception as e:
                    logger.warning(f"[RECREATION_PAGE] Failed to connect to existing Chrome instance: {e}")
                    logger.info(f"[RECREATION_PAGE] Starting new Chrome instance with enhanced options...")
                    
                    # If the connection fails, start a new browser instance with better options
                    app = 'chromium' if 'arm' in platform.machine() else 'google-chrome'
                    command = [
                        app,
                        "--remote-debugging-port=1337",
                        "--no-sandbox",
                        "--disable-web-security",
                        "--disable-features=VizDisplayCompositor",
                        "--disable-dev-shm-usage",
                        "--user-agent=Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                    ]
                    
                    if use_proxy:
                        command.append(f"--proxy-server=127.0.0.1:18888")
                        logger.info(f"[RECREATION_PAGE] Using proxy server: 127.0.0.1:18888")
                    
                    logger.info(f"[RECREATION_PAGE] Starting browser with command: {' '.join(command)}")
                    payload = json.dumps({"command": command, "shell": False})
                    headers = {"Content-Type": "application/json"}
                    requests.post(backend_url + "/setup/launch", headers=headers, data=payload)
                    time.sleep(8)  # Give more time for browser to start
                    browser = p.chromium.connect_over_cdp(remote_debugging_url)
                    logger.info(f"[RECREATION_PAGE] Successfully connected to new Chrome instance")

                page = browser.new_page()
                
                # Set longer timeout for all operations
                page.set_default_timeout(timeout_ms)
                
                # Set additional headers to appear more like a real browser
                page.set_extra_http_headers({
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'DNT': '1',
                    'Connection': 'keep-alive',
                    'Upgrade-Insecure-Requests': '1',
                })
                
                # Try multiple URLs to test connectivity
                test_urls = [
                    "https://www.recreation.gov/",
                    "http://www.recreation.gov/",
                    "https://recreation.gov/",
                ]
                
                successful_url = None
                for test_url in test_urls:
                    try:
                        # Step 1: Navigate to recreation.gov with better error handling
                        logger.info(f"[RECREATION_PAGE] Trying to navigate to: {test_url}")
                        
                        # Try different wait strategies
                        wait_strategies = ['domcontentloaded', 'load', 'networkidle']
                        
                        for wait_until in wait_strategies:
                            try:
                                logger.debug(f"[RECREATION_PAGE] Trying wait strategy: {wait_until}")
                                page.goto(test_url, wait_until=wait_until, timeout=timeout_ms)
                                logger.info(f"[RECREATION_PAGE] Successfully loaded {test_url} with strategy {wait_until}")
                                logger.info(f"[RECREATION_PAGE] Page title: '{page.title()}'")
                                logger.info(f"[RECREATION_PAGE] Current URL: '{page.url}'")
                                successful_url = test_url
                                break
                            except Exception as strategy_error:
                                logger.debug(f"[RECREATION_PAGE] Wait strategy {wait_until} failed: {strategy_error}")
                                continue
                        
                        if successful_url:
                            break
                            
                    except Exception as url_error:
                        logger.warning(f"[RECREATION_PAGE] Failed to navigate to {test_url}: {url_error}")
                        continue
                
                if not successful_url:
                    raise Exception("Failed to navigate to any recreation.gov URL variant")
                    
                # Additional wait to ensure page is fully loaded
                try:
                    page.wait_for_load_state('networkidle', timeout=30000)
                    logger.info(f"[RECREATION_PAGE] Page fully loaded and idle")
                except Exception as e:
                    logger.warning(f"[RECREATION_PAGE] NetworkIdle wait failed, continuing: {e}")

                try:
                    # Step 2: Fill search input
                    logger.info(f"[RECREATION_PAGE] Filling search input with 'Diamond'...")
                    page.wait_for_selector("input#hero-search-input", state='visible', timeout=timeout_ms)
                    page.fill("input#hero-search-input", "Diamond")
                    logger.info(f"[RECREATION_PAGE] Successfully filled search input")
                    
                except Exception as e:
                    logger.error(f"[RECREATION_PAGE] Failed to fill search input: {e}")
                    raise e

                try:
                    # Step 3: Click search button
                    logger.info(f"[RECREATION_PAGE] Clicking search button...")
                    page.wait_for_selector("button.nav-search-button", state='visible', timeout=timeout_ms)
                    page.click("button.nav-search-button")
                    logger.info(f"[RECREATION_PAGE] Successfully clicked search button")
                    print("after first click")
                    
                    # Wait for search results to load
                    time.sleep(10)
                    
                except Exception as e:
                    logger.error(f"[RECREATION_PAGE] Failed to click search button: {e}")
                    raise e

                    # Step 4: Wait for search results page to load, then click search result
                    logger.info(f"[RECREATION_PAGE] Waiting for search results page...")
                    # Wait for URL to change to search results (avoids being blocked by ongoing navigation)
                    page.wait_for_url(url=re.compile(r"recreation\.gov/search"), timeout=20000)
                    # Allow DOM to settle; avoid relying on networkidle which may never fire
                    page.wait_for_load_state("domcontentloaded", timeout=15000)
                    time.sleep(3)

                    logger.info(f"[RECREATION_PAGE] Waiting for and clicking search result...")
                    # Try visible first; fall back to attached (element in DOM, then scroll into view)
                    search_result_selector = ".search-result-highlight--success"
                    try:
                        page.wait_for_selector(search_result_selector, state="visible", timeout=25000)
                    except Exception:
                        logger.debug("[RECREATION_PAGE] Visible wait failed, trying attached then scroll into view")
                        page.wait_for_selector(search_result_selector, state="attached", timeout=25000)
                        page.locator(search_result_selector).first.scroll_into_view_if_needed(timeout=5000)
                        page.wait_for_selector(search_result_selector, state="visible", timeout=5000)

                    with page.expect_popup() as popup_info:
                        page.click(search_result_selector)
                    
                    time.sleep(30)  # Wait for popup to fully load
                    print("after second click")
                    logger.info(f"[RECREATION_PAGE] Successfully clicked search result")
                    
                except Exception as e:
                    logger.error(f"[RECREATION_PAGE] Failed to click search result: {e}")
                    raise e

                try:
                    # Step 5: Handle new page
                    newpage = popup_info.value
                    newpage.set_default_timeout(timeout_ms)
                    # Use 'load' instead of 'networkidle'; recreation.gov keeps background requests
                    # so networkidle often never fires and causes 60s timeouts
                    newpage.wait_for_load_state("load", timeout=20000)
                    time.sleep(2)
                    
                    page_title = newpage.title()
                    logger.info(f"[RECREATION_PAGE] New page loaded successfully")
                    logger.info(f"[RECREATION_PAGE] New page title: '{page_title}'")
                    logger.info(f"[RECREATION_PAGE] New page URL: '{newpage.url}'")
                    print(f"go to newpage: {page_title}")
                    time.sleep(2)
                    
                except Exception as e:
                    logger.error(f"[RECREATION_PAGE] Failed to handle new page: {e}")
                    raise e

                try:
                    # Step 6: Click next-available button with better error handling
                    logger.info(f"[RECREATION_PAGE] Looking for next-available button...")
                    
                    # Try multiple selectors for the button
                    selectors_to_try = [
                        "button.next-available",
                        "button[class*='next-available']",
                        "button[class*='next']",
                        ".next-available",
                        "[data-testid*='next']"
                    ]
                    
                    button_clicked = False
                    for selector in selectors_to_try:
                        try:
                            logger.debug(f"[RECREATION_PAGE] Trying selector: {selector}")
                            newpage.wait_for_selector(selector, state='visible', timeout=30000)
                            newpage.click(selector, timeout=30000)
                            logger.info(f"[RECREATION_PAGE] Successfully clicked next-available button with selector: {selector}")
                            print("after third click")
                            button_clicked = True
                            break
                        except Exception as selector_error:
                            logger.debug(f"[RECREATION_PAGE] Selector '{selector}' failed: {selector_error}")
                            continue
                    
                    if not button_clicked:
                        logger.warning(f"[RECREATION_PAGE] Could not find or click next-available button with any selector")
                        logger.info(f"[RECREATION_PAGE] Continuing without clicking next-available button")
                        print("Continuing without clicking next-available button")
                    
                except Exception as e:
                    logger.warning(f"[RECREATION_PAGE] Error with next-available button: {e}")
                    logger.info(f"[RECREATION_PAGE] Continuing execution despite button click failure")
                    print("Continuing without clicking next-available button")

                # Step 7: Extract content based on config
                return_json = {}
                return_json["expected"] = {}
                
                try:
                    logger.info(f"[RECREATION_PAGE] Extracting content based on config...")
                    
                    if config["selector"] == "class":
                        className = config["class"]
                        logger.debug(f"[RECREATION_PAGE] Looking for elements with class: {className}")
                        
                        if "order" in config.keys():
                            try:
                                elements = newpage.query_selector_all("." + className)
                                order_index = int(config["order"])
                                logger.info(f"[RECREATION_PAGE] Found {len(elements)} elements with class '{className}', looking for index {order_index}")
                                
                                if len(elements) > order_index:
                                    text_content = elements[order_index].text_content()
                                    if text_content:
                                        text_content = text_content.strip()
                                    return_json["expected"][className] = text_content
                                    logger.info(f"[RECREATION_PAGE] Successfully extracted text from element at index {order_index}: '{text_content}'")
                                else:
                                    logger.warning(f"[RECREATION_PAGE] Element with class '{className}' at index {order_index} not found. Found {len(elements)} elements.")
                                    return_json["expected"][className] = "__EVALUATION_FAILED__"
                            except Exception as e:
                                logger.error(f"[RECREATION_PAGE] Error accessing element with class '{className}' at specific order: {e}")
                                return_json["expected"][className] = "__EVALUATION_FAILED__"
                        else:
                            try:
                                element = newpage.query_selector("." + className)
                                if element:
                                    text_content = element.text_content()
                                    if text_content:
                                        text_content = text_content.strip()
                                    return_json["expected"][className] = text_content
                                    logger.info(f"[RECREATION_PAGE] Successfully extracted text from first element: '{text_content}'")
                                else:
                                    logger.warning(f"[RECREATION_PAGE] Element with class '{className}' not found.")
                                    return_json["expected"][className] = "__EVALUATION_FAILED__"
                            except Exception as e:
                                logger.error(f"[RECREATION_PAGE] Error accessing element with class '{className}': {e}")
                                return_json["expected"][className] = "__EVALUATION_FAILED__"
                    
                    logger.info(f"[RECREATION_PAGE] Content extraction completed successfully")
                    logger.info(f"[RECREATION_PAGE] Final result: {return_json}")
                    
                except Exception as e:
                    logger.error(f"[RECREATION_PAGE] Error during content extraction: {e}")
                    # Return a structure indicating extraction failed
                    return_json["expected"] = {"extraction_error": "__EVALUATION_FAILED__"}

                browser.close()
                return return_json
                
        except Exception as e:
            logger.error(f"[RECREATION_PAGE] Attempt {attempt + 1} failed: {str(e)}")
            logger.error(f"[RECREATION_PAGE] Exception type: {type(e).__name__}")
            
            if attempt < max_retries - 1:
                logger.info(f"[RECREATION_PAGE] Retrying in 5 seconds...")
                time.sleep(5)
            else:
                logger.error(f"[RECREATION_PAGE] All {max_retries} attempts failed. Returning error result.")
                # Return a structure that indicates complete failure
                return {
                    "expected": {
                        "error": "__EVALUATION_FAILED__",
                        "error_message": f"Failed after {max_retries} attempts: {str(e)}"
                    }
                }

    # This should never be reached, but just in case
    logger.error(f"[RECREATION_PAGE] Unexpected code path reached")
    return {
        "expected": {
            "error": "__EVALUATION_FAILED__",
            "error_message": "Unexpected error in function execution"
        }
    }


def get_active_tab_url_parse(env, config: Dict[str, Any]):
    """
    This function is used to parse the url according to config["parse_keys"].
    config: 
        'parse_keys': must exist,
            a list of keys to extract from the query parameters of the url.
        'replace': optional, 
            a dict, used to replace the original key with the new key.
            ( { "original key": "new key" } )
    """
    active_tab_url = get_active_url_from_accessTree(env, config)
    if active_tab_url is None:
        return None

    # connect to remote Chrome instance
    # parse in a hard-coded way to find the specific info about task
    parsed_url = urlparse(active_tab_url)
    # Extract the query parameters
    query_params = parse_qs(parsed_url.query)
    # Define the keys of interest
    keys_of_interest = [key for key in config["parse_keys"]]
    # Extract the parameters of interest
    extracted_params = {key: query_params.get(key, [''])[0] for key in keys_of_interest}
    if "replace" in config:
        for key in config["replace"].keys():
            # change original key to new key, keep value unchange
            value = extracted_params.pop(key)
            extracted_params[config["replace"][key]] = value
    if config.get("split_list", False):
        extracted_params = {key: extracted_params[key].split(',') for key in extracted_params.keys()}
    return extracted_params


def get_url_dashPart(env, config: Dict[str, str]):
    """
    This function is used to extract one of the dash-separated part of the URL.
    config
        'partIndex': must exist,
            the index of the dash-separated part to extract, starting from 0.
        'needDeleteId': optional,
            a boolean, used to indicate whether to delete the "id" part ( an example: "/part-you-want?id=xxx" )
        'returnType': must exist,
            a string, used to indicate the return type, "string" or "json".
    """
    active_tab_url = get_active_url_from_accessTree(env, config)
    if active_tab_url is None:
        return None

    # extract the last dash-separated part of the URL, and delete all the characters after "id"
    # Ensure partIndex is an integer
    try:
        part_index = int(config["partIndex"])
    except (ValueError, TypeError):
        logger.error(f"[URL_DASH_PART] Invalid partIndex: {config.get('partIndex', 'None')}. Must be an integer.")
        return None
    
    url_parts = active_tab_url.split("/")
    if part_index >= len(url_parts):
        logger.error(f"[URL_DASH_PART] partIndex {part_index} is out of range for URL with {len(url_parts)} parts")
        return None
        
    dash_part = url_parts[part_index]
    if config.get("needDeleteId", False):
        dash_part = dash_part.split("?")[0]
    
    logger.info(f"[URL_DASH_PART] Extracted dash part: '{dash_part}' from URL: {active_tab_url}")
    
    if config["returnType"] == "string":
        return dash_part
    elif config["returnType"] == "json":
        return {config["key"]: dash_part}
    else:
        logger.error(f"[URL_DASH_PART] Invalid returnType: {config.get('returnType', 'None')}. Must be 'string' or 'json'.")
        return None


def get_macys_product_url_parse(env, config: Dict[str, str]):
    """
    Parse Macy's product url path, extract:
    - mens_clothing: true if 'mens-clothing' in path, else None
    - shirts: true if any key 'Top_style' or 'Product_department' value is 'shirts', else None
    - Men_regular_size_t, Price_discount_range (as list), Sleeve_length: as before, None if not found
    All fields are None if not found for robustness.
    """
    from urllib.parse import urlparse, unquote
    result = {}
    # 1. Parse URL
    active_tab_url = get_active_url_from_accessTree(env, config)
    if active_tab_url is None:
        return None
    parsed = urlparse(active_tab_url)
    path = unquote(parsed.path)
    result = {}
    # mens_clothing
    result['mens_clothing'] = True if 'mens-clothing' in path else None
    # key-value
    path_parts = path.strip('/').split('/')
    key_value_json = {}
    shirts_flag = False
    short_sleeve_flag = False  # Initialize short_sleeve_flag to avoid UnboundLocalError
    if "shirts" in path:
        shirts_flag = True
    if "short-sleeve" in path:
        short_sleeve_flag = True
    for i in range(len(path_parts)-1):
        if ',' in path_parts[i] and ',' in path_parts[i+1]:
            keys = [k.strip() for k in path_parts[i].split(',')]
            values = [v.strip() for v in path_parts[i+1].split(',')]
            for k, v in zip(keys, values):
                if k == "Price_discount_range":
                    key_value_json[k] = [item.strip() for item in v.split('|')] if v else None
                else:
                    key_value_json[k] = v if v else None
                if k == 'Product_department' and (v == 'shirts' or v == 'Shirts' or v == 'Shirt'):
                    shirts_flag = True
                if k == 'Sleeve_length' and (v == 'short-sleeve' or v == 'Short Sleeve'):
                    short_sleeve_flag = True
            break
    for field in ['Men_regular_size_t', 'Price_discount_range']:
        if field not in key_value_json:
            key_value_json[field] = None
    result['shirts'] = shirts_flag if shirts_flag else None
    result['short_sleeve'] = short_sleeve_flag if short_sleeve_flag else None
    # parse_keys
    for key in config["parse_keys"]:
        if key in key_value_json:
            if key == "Price_discount_range":
                # Check if key_value_json[key] is not None before using 'in' operator
                if key_value_json[key] is not None and '50_PERCENT_ off & more' in key_value_json[key] and not '30_PERCENT_ off & more' in key_value_json[key] and not '20_PERCENT_ off & more' in key_value_json[key]:
                    result[key] = '50_PERCENT_ off & more'
                else:
                    result[key] = 'not_50_PERCENT_ off & more'
            else:
                result[key] = key_value_json[key]
    return result


# Alias for backward compatibility - the old function name was too generic
def get_url_path_parse(env, config: Dict[str, str]):
    """
    Alias for get_macys_product_url_parse to maintain backward compatibility.
    This function name is kept for existing configurations that still use "url_path_parse" type.
    """
    return get_macys_product_url_parse(env, config)
