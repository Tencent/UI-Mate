#!/usr/bin/env python3
"""Rewrite CUA-Gym mock endpoints to a self-hosted IP deployment.

CUA-Gym mock services were moved from official ``*.xlang.ai`` hosts to a
self-hosted ``http://mock-host.example:81xx`` deployment. This script is a
simple rule-based rewrite:

  https://cua-gym-instagram.xlang.ai   ->  http://mock-host.example:8152
  cua-gym-instagram.xlang.ai           ->  mock-host.example:8152          (bare host)

Where the rewrite rules come from
---------------------------------
* ``url_variables.json`` (shipped with CUA-Gym data) lists the ``default``
  value of each placeholder, e.g. ``https://cua-gym-instagram.xlang.ai`` /
  ``cua-gym-instagram.xlang.ai`` (bare host). Those are the old addresses
  to replace.
* ``MOCK_ENDPOINTS`` below is the self-hosted ``<mock_name> -> URL`` map,
  i.e. the new addresses. The script infers the mock name from the default
  slug and looks it up to get from->to.

What this script does
---------------------
Whether task files still contain ``__CUA_GYM_*__`` placeholders or already
materialized xlang.ai addresses, this script rewrites them to the
self-hosted IP in one pass. Port mappings live in ``MOCK_ENDPOINTS`` below,
so no extra environment variables are required. The rewrite is idempotent.

Usage
-----
  # Preview replacements without writing files
  python scripts/cua_gym/cua_gym_convert/remap_cua_gym_ip.py --dry-run

  # Apply (defaults: cache_cua_gym + evaluation_examples_cua_gym)
  python scripts/cua_gym/cua_gym_convert/remap_cua_gym_ip.py

  # Different host / only some directories
  MOCK_APP_BASE_URL=http://your-mock-host.example \
  python scripts/cua_gym/cua_gym_convert/remap_cua_gym_ip.py \
      --target-dirs cache_cua_gym
"""

import argparse
import json
import os
import sys
from pathlib import Path
from typing import Dict, List, Tuple
from urllib.parse import urlsplit

# Rewrite text files only; skip binaries.
TEXT_SUFFIXES = {".json", ".md", ".py", ".sh", ".txt", ".yaml", ".yml"}

# The endpoint table uses a neutral template host; the real host must come from
# --host, MOCK_APP_HOST, or MOCK_APP_BASE_URL.
ENDPOINT_TEMPLATE_HOST = "mock-host.example"
ENV_HOST = os.environ.get("MOCK_APP_HOST") or urlsplit(
    os.environ.get("MOCK_APP_BASE_URL", "")
).hostname

# ─────────────────────────────────────────────────────────────────────────
# Self-hosted service map: <mock_name> -> URL
# Taken from the ops port-allocation table (http://mock-host.example:81xx).
# Add or adjust services here.
# ─────────────────────────────────────────────────────────────────────────
MOCK_ENDPOINTS: Dict[str, str] = {
    "12306_mock": "http://mock-host.example:8100",
    "Canvas-LMS_mock": "http://mock-host.example:8101",
    "Expensify_mock": "http://mock-host.example:8102",
    "PACS-viewer_mock": "http://mock-host.example:8103",
    "SAP_mock": "http://mock-host.example:8104",
    "ServiceNow_mock": "http://mock-host.example:8105",
    "TradingView_mock": "http://mock-host.example:8106",
    "Zendesk_mock": "http://mock-host.example:8107",
    "adp_mock": "http://mock-host.example:8108",
    "airtable_mock": "http://mock-host.example:8109",
    "aliyun_mock": "http://mock-host.example:8110",
    "amazon_mock": "http://mock-host.example:8111",
    "amazon_seller_mock": "http://mock-host.example:8112",
    "amplitude_mock": "http://mock-host.example:8113",
    "asana_mock": "http://mock-host.example:8114",
    "aws_console_mock": "http://mock-host.example:8115",
    "azure_mock": "http://mock-host.example:8116",
    "bamboohr_mock": "http://mock-host.example:8117",
    "booking_com_mock": "http://mock-host.example:8118",
    "canva_mock": "http://mock-host.example:8119",
    "canvas_mock": "http://mock-host.example:8120",
    "circleci_mock": "http://mock-host.example:8121",
    "clio_mock": "http://mock-host.example:8122",
    "cloudflare_mock": "http://mock-host.example:8123",
    "coinbase_mock": "http://mock-host.example:8124",
    "confluence_mock": "http://mock-host.example:8125",
    "contractbook_mock": "http://mock-host.example:8126",
    "datadog_mock": "http://mock-host.example:8127",
    "dingtalk_mock": "http://mock-host.example:8128",
    "discord_mock": "http://mock-host.example:8129",
    "docusign_mock": "http://mock-host.example:8130",
    "ebay_mock": "http://mock-host.example:8131",
    "epic-health_mock": "http://mock-host.example:8132",
    "expedia_mock": "http://mock-host.example:8133",
    "facebook_mock": "http://mock-host.example:8134",
    "feishu_mock": "http://mock-host.example:8135",
    "github_mock": "http://mock-host.example:8136",
    "gitlab_mock": "http://mock-host.example:8137",
    "gmail_mock": "http://mock-host.example:8138",
    "google_ads_mock": "http://mock-host.example:8139",
    "google_analytics_mock": "http://mock-host.example:8140",
    "google_calendar_mock": "http://mock-host.example:8141",
    "google_docs_mock": "http://mock-host.example:8142",
    "google_drive_mock": "http://mock-host.example:8143",
    "google_flights_mock": "http://mock-host.example:8144",
    "google_sheets_mock": "http://mock-host.example:8145",
    "greenhouse_mock": "http://mock-host.example:8146",
    "gusto_mock": "http://mock-host.example:8147",
    "hotjar_mock": "http://mock-host.example:8148",
    "hubspot_marketing_mock": "http://mock-host.example:8149",
    "hubspot_mock": "http://mock-host.example:8150",
    "instacart_mock": "http://mock-host.example:8151",
    "instagram_mock": "http://mock-host.example:8152",
    "jira_mock": "http://mock-host.example:8153",
    "klaviyo_mock": "http://mock-host.example:8154",
    "lattice_mock": "http://mock-host.example:8155",
    "linear_mock": "http://mock-host.example:8156",
    "linkedin_mock": "http://mock-host.example:8157",
    "looker_studio_mock": "http://mock-host.example:8158",
    "lucidchart_mock": "http://mock-host.example:8159",
    "mailchimp_mock": "http://mock-host.example:8160",
    "meta_ads_mock": "http://mock-host.example:8161",
    "microsoft_teams_mock": "http://mock-host.example:8162",
    "miro_mock": "http://mock-host.example:8163",
    "mixpanel_mock": "http://mock-host.example:8164",
    "monday_mock": "http://mock-host.example:8165",
    "notion_mock": "http://mock-host.example:8166",
    "openreview_mock": "http://mock-host.example:8167",
    "outlook_web_mock": "http://mock-host.example:8168",
    "paypal_mock": "http://mock-host.example:8169",
    "pinterest_mock": "http://mock-host.example:8170",
    "postman_mock": "http://mock-host.example:8171",
    "quickbooks_mock": "http://mock-host.example:8172",
    "reddit_mock": "http://mock-host.example:8173",
    "robinhood_mock": "http://mock-host.example:8174",
    "salesforce_mock": "http://mock-host.example:8175",
    "sentry_mock": "http://mock-host.example:8176",
    "shopify_admin_mock": "http://mock-host.example:8177",
    "slack_mock": "http://mock-host.example:8178",
    "stripe_dashboard_mock": "http://mock-host.example:8179",
    "tableau_mock": "http://mock-host.example:8180",
    "taobao_seller_mock": "http://mock-host.example:8181",
    "trello_mock": "http://mock-host.example:8182",
    "tripadvisor_mock": "http://mock-host.example:8183",
    "twitter_mock": "http://mock-host.example:8184",
    "uber_eats_mock": "http://mock-host.example:8185",
    "vercel_mock": "http://mock-host.example:8186",
    "wandb_mock": "http://mock-host.example:8187",
    "wechat_mock": "http://mock-host.example:8188",
    "weibo_mock": "http://mock-host.example:8189",
    "westlaw_mock": "http://mock-host.example:8190",
    "woocommerce_mock": "http://mock-host.example:8191",
    "workday_mock": "http://mock-host.example:8192",
    "xiaohongshu_mock": "http://mock-host.example:8193",
    "youtube_mock": "http://mock-host.example:8194",
    "zhihu_mock": "http://mock-host.example:8195",
    "zillow_mock": "http://mock-host.example:8196",
    "zoom_web_mock": "http://mock-host.example:8197",
}


def default_to_mock_name(default: str) -> str:
    """``https://cua-gym-google-docs.xlang.ai`` -> ``google_docs_mock``.

    Strip the scheme, ``cua-gym-`` prefix, and ``.xlang.ai`` suffix, convert
    hyphens to underscores, and append ``_mock`` (skip if the slug already
    ends with ``*-mock``).
    """
    host = default.split("://", 1)[-1]          # drop http(s)://
    host = host.split("/", 1)[0]                # drop path
    slug = host
    if slug.startswith("cua-gym-"):
        slug = slug[len("cua-gym-"):]
    for suffix in (".xlang.ai",):
        if slug.endswith(suffix):
            slug = slug[: -len(suffix)]
    slug = slug.replace("-", "_")
    if not slug.endswith("_mock"):
        slug = slug + "_mock"
    return slug


def override_host(url: str, new_host: str) -> str:
    """Replace the default host in MOCK_ENDPOINTS with ``--host``; keep the port."""
    scheme, _, rest = url.partition("://")
    hostport = rest.split("/", 1)[0]
    port = hostport.split(":", 1)[1] if ":" in hostport else ""
    return f"{scheme}://{new_host}:{port}" if port else f"{scheme}://{new_host}"


def mock_name_to_slug(mock: str) -> str:
    """``google_docs_mock`` -> ``google-docs`` (slug used in the xlang hostname).

    Inverse of default_to_mock_name: strip the trailing ``_mock``, convert
    underscores to hyphens, and lowercase, so the official hostname is
    ``cua-gym-<slug>.xlang.ai``.
    Examples: ``Canvas-LMS_mock`` -> ``canvas-lms``, ``12306_mock`` -> ``12306``.
    """
    slug = mock
    if slug.endswith("_mock"):
        slug = slug[: -len("_mock")]
    return slug.replace("_", "-").lower()


def build_remap(manifest_path: Path, host: str) -> Tuple[Dict[str, str], List[str]]:
    """Build the full old-address -> new self-hosted-address map.

    Coverage is a union so all 97+ mocks are rewritten in one pass:
    1. **MOCK_ENDPOINTS is authoritative:** for each mock, reverse-engineer
       the official hostname ``cua-gym-<slug>.xlang.ai`` and emit both URL
       and bare-host rules. This does not need the manifest.
    2. **Manifest extras:** if url_variables.json is present, also merge:
       - unmaterialized placeholders ``__CUA_GYM_*__`` -> self-hosted URL / bare host;
       - special-alias defaults (e.g. ``cua-gym-notion-mock.xlang.ai``).
       So whether the cache is still placeholders or already xlang.ai, one
       run lands on the self-hosted IP.
    """
    remap: Dict[str, str] = {}
    unmatched: List[str] = []

    def add(src: str, dst: str) -> None:
        if src and src != dst:
            remap[src] = dst

    # ── 1) Reverse-engineer the full port table ──────────────────────────
    for mock, endpoint in MOCK_ENDPOINTS.items():
        if host != ENDPOINT_TEMPLATE_HOST:
            endpoint = override_host(endpoint, host)
        slug = mock_name_to_slug(mock)
        xlang_host = f"cua-gym-{slug}.xlang.ai"
        bare_dst = endpoint.split("://", 1)[-1]            # mock-host.example:81xx
        # URL form (cover both https and http)
        add(f"https://{xlang_host}", endpoint.rstrip("/"))
        add(f"http://{xlang_host}", endpoint.rstrip("/"))
        # Bare-host form
        add(xlang_host, bare_dst)

    # ── 2) Manifest extras: unmaterialized placeholders + alias defaults ─
    # Works for both "converted but not materialized" and "already xlang.ai".
    if manifest_path and manifest_path.exists():
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
        variables = manifest.get("variables") or {}
        for placeholder, spec in variables.items():
            kind = spec.get("kind", "url")
            default = spec.get("default")
            if not default or kind == "url_template":
                continue
            mock = default_to_mock_name(default)
            endpoint = MOCK_ENDPOINTS.get(mock)
            if endpoint is None:
                unmatched.append(f"{default}  (-> {mock} not in the port table)")
                continue
            if host != ENDPOINT_TEMPLATE_HOST:
                endpoint = override_host(endpoint, host)
            if kind == "url":
                add(default.rstrip("/"), endpoint.rstrip("/"))
                add(placeholder, endpoint.rstrip("/"))         # placeholder -> URL
            elif kind == "host":
                bare = endpoint.split("://", 1)[-1]
                add(default, bare)
                add(placeholder, bare)                         # placeholder -> bare host

    return remap, unmatched


def apply_remap(root: Path, remap: Dict[str, str], dry_run: bool) -> Tuple[int, int]:
    """Rewrite files under root. Apply longer (URL) rules before shorter
    (host) rules so ``https://cua-gym-x.xlang.ai`` is not truncated to
    ``https://mock-host.example:81xx`` by a host rule.
    """
    ordered = sorted(remap.items(), key=lambda kv: len(kv[0]), reverse=True)
    touched_files = 0
    total_replacements = 0

    for path in root.rglob("*"):
        if not path.is_file() or path.suffix not in TEXT_SUFFIXES:
            continue
        try:
            original = path.read_text(encoding="utf-8")
        except (UnicodeDecodeError, OSError):
            continue
        updated = original
        file_hits = 0
        for src, dst in ordered:
            c = updated.count(src)
            if c:
                updated = updated.replace(src, dst)
                file_hits += c
        if file_hits and updated != original:
            total_replacements += file_hits
            touched_files += 1
            if not dry_run:
                path.write_text(updated, encoding="utf-8")

    return touched_files, total_replacements


def find_default_cua_gym_dir(repo_root: Path) -> str:
    """Probe common locations for a CUA-Gym data dir that contains url_variables.json.

    The data dir may sit next to the repo, in a parent ``data/``, or inside
    the repo ``data/``. Return the first directory that contains the manifest.
    """
    if os.environ.get("CUA_GYM_DATA_DIR"):
        return os.environ["CUA_GYM_DATA_DIR"]
    candidates = [
        repo_root.parent.parent / "data" / "CUA-Gym",
        repo_root.parent / "data" / "CUA-Gym",
        repo_root / "data" / "CUA-Gym",
    ]
    for c in candidates:
        if (c / "url_variables.json").exists():
            return str(c.resolve())
    return str(candidates[0].resolve())


def main() -> int:
    repo_root_default = str(Path(__file__).resolve().parents[3])
    cua_gym_default = find_default_cua_gym_dir(Path(repo_root_default))

    p = argparse.ArgumentParser(
        description="Rewrite CUA-Gym mock endpoints from xlang.ai to a self-hosted IP")
    p.add_argument("--cua_gym_data_dir", default=cua_gym_default,
                   help="CUA-Gym data directory containing url_variables.json "
                        "(default $CUA_GYM_DATA_DIR or ../data/CUA-Gym)")
    p.add_argument("--manifest", default=None,
                   help="Path to url_variables.json (default <cua_gym_data_dir>/url_variables.json)")
    p.add_argument("--mini_osworld_dir", default=repo_root_default,
                   help="mini-osworld root (default: the repository that contains this script)")
    p.add_argument("--host", default=ENV_HOST,
                   help="Self-hosted mock host IP/domain (default: MOCK_APP_HOST or MOCK_APP_BASE_URL)")
    p.add_argument("--target-dirs", nargs="*", default=None,
                   help="Directories to rewrite, relative to --mini_osworld_dir "
                        "(default: cache_cua_gym, evaluation_examples_cua_gym)")
    p.add_argument("--dry-run", action="store_true",
                   help="Preview rewrite rules and hit counts without writing files")
    args = p.parse_args()
    if not args.host:
        p.error("--host is required unless MOCK_APP_HOST or MOCK_APP_BASE_URL is set")

    cua_gym_dir = Path(args.cua_gym_data_dir).expanduser().resolve()
    manifest_path = (Path(args.manifest).expanduser().resolve()
                     if args.manifest else cua_gym_dir / "url_variables.json")
    if not manifest_path.exists():
        print(f"[remap] note: url_variables.json not found ({manifest_path}); "
              f"generating the full rule set from the built-in port table (MOCK_ENDPOINTS) only.")

    remap, unmatched = build_remap(manifest_path, args.host)
    if not remap:
        print("No rewrite rules (port table and manifest did not match).")
        return 1

    print(f"[remap] host={args.host}  {len(remap)} rewrite rules:")
    for src, dst in sorted(remap.items()):
        print(f"    {src:<42} -> {dst}")
    if unmatched:
        print("[remap] these manifest defaults had no matching mock in the port table (skipped):")
        for u in unmatched:
            print(f"    {u}")

    mini_dir = Path(args.mini_osworld_dir).expanduser().resolve()
    target_subdirs = args.target_dirs or [
        "cache_cua_gym",
        "evaluation_examples_cua_gym",
    ]

    print(f"\n[remap] target dirs (mini_osworld_dir={mini_dir})"
          + ("  [DRY-RUN]" if args.dry_run else ""))
    any_processed = False
    grand_files = grand_repl = 0
    for sub in target_subdirs:
        d = (mini_dir / sub).resolve()
        if not d.exists():
            print(f"    - {sub}: missing, skip")
            continue
        any_processed = True
        files, repl = apply_remap(d, remap, args.dry_run)
        grand_files += files
        grand_repl += repl
        verb = "would rewrite" if args.dry_run else "rewrote"
        print(f"    - {sub}: {verb} {repl} occurrence(s) in {files} file(s)")

    if not any_processed:
        print(f"  No target directories found under {mini_dir}.")
        return 1

    print(f"\n[remap] total: {'would replace' if args.dry_run else 'replaced'} {grand_repl} occurrence(s) "
          f"in {grand_files} file(s).")
    if args.dry_run:
        print("[remap] dry-run; no files were written. Drop --dry-run to apply.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
