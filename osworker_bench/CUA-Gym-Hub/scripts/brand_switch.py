#!/usr/bin/env python3
"""
brand_switch.py - Reversibly switch mock brand names between their REAL names
and trademark-safe PLACEHOLDER names, one app (or all apps) at a time.

Background
----------
Every mock in this repo is meant to *display* a deliberately altered brand name
(e.g. ``gmail_mock`` renders as "Xmail") to reduce trademark confusion, while the
directory keeps the real identifier for engineering reference (see TRADEMARKS.md).

The placeholder is derived from the real name by replacing its first alphabetic
character with ``X`` (or ``x`` when that character is lowercase):

    Amazon -> Xmazon      AWS -> XWS        eBay -> xBay
    Cloudflare -> Xloudflare                Google -> Xoogle

Irregular cases (e.g. ``12306`` -> ``Y2306``) are listed under ``overrides`` in
``brand_registry.json``.

Key differences from ``rename_brand.py``
----------------------------------------
* Bidirectional: ``--to real`` or ``--to placeholder``.
* Driven by ``brand_registry.json`` - no need to remember each X-name.
* Uses **whole-word boundaries**, so it never corrupts substrings
  (e.g. the lowercase "xpensify" inside the real word "expensify" is left alone).
* Operates per app (``--app <dir>``) or across every mock (``--all``).

Examples
--------
    # See the mapping table
    python3 scripts/brand_switch.py --list

    # Dry-run: what would change in gmail_mock when restoring real names?
    python3 scripts/brand_switch.py --app gmail_mock --to real --show-matches

    # Apply: turn gmail_mock back into placeholders (trademark-safe)
    python3 scripts/brand_switch.py --app gmail_mock --to placeholder --apply

    # Restore real names for a single brand everywhere
    python3 scripts/brand_switch.py --all --brand Stripe --to real --apply

    # Expensify: keep real lowercase URLs intact when obfuscating
    python3 scripts/brand_switch.py --app Expensify_mock --to placeholder --no-lower --apply

Compatible with Python 3.6+. Defaults to DRY-RUN.
"""

import argparse
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT = os.path.dirname(HERE)
DEFAULT_REGISTRY = os.path.join(HERE, "brand_registry.json")
DEFAULT_WEBSITES = os.path.join(REPO_ROOT, "websites")

DEFAULT_EXCLUDED_DIRS = {
    ".git", "node_modules", "dist", "build", ".next", ".turbo",
    ".cache", ".vite", "__pycache__", ".venv", "venv",
}

SKIP_EXTENSIONS = {
    ".png", ".jpg", ".jpeg", ".gif", ".webp", ".ico",
    ".woff", ".woff2", ".ttf", ".otf", ".eot",
    ".mp4", ".mp3", ".wav", ".mov", ".webm",
    ".pdf", ".zip", ".gz", ".tar", ".7z",
    ".so", ".dll", ".dylib", ".exe", ".bin",
    ".lock", ".map",
}


# ---- Registry / placeholder derivation ----------------------------------------

def derive_placeholder(real, overrides):
    """Placeholder = real name with its first alphabetic char replaced by X/x."""
    if real in overrides:
        return overrides[real]
    for i, ch in enumerate(real):
        if ch.isalpha():
            repl = "X" if ch.isupper() else "x"
            return real[:i] + repl + real[i + 1:]
    raise ValueError(
        "Cannot derive a placeholder for {!r} (no alphabetic character); "
        "add an entry under 'overrides' in the registry.".format(real))


def load_registry(path):
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    overrides = data.get("overrides", {})
    brands = []
    for entry in data.get("brands", []):
        real = entry["real"]
        brands.append({
            "real": real,
            "placeholder": derive_placeholder(real, overrides),
            "apps": entry.get("apps", []),
            "note": entry.get("note", ""),
        })
    return brands


# ---- Rule building -------------------------------------------------------------

def case_variants(src, dst, include_title, include_lower, include_upper):
    raw = []
    if include_title:
        raw.append((src, dst))
    if include_lower:
        raw.append((src.lower(), dst.lower()))
    if include_upper:
        raw.append((src.upper(), dst.upper()))
    out = []
    seen = set()
    for s, d in raw:
        if s == d or s in seen:
            continue
        seen.add(s)
        out.append((s, d))
    return out


def build_rules(brands, direction, flags):
    """Return [(compiled_regex, dst, src_literal)], longest src first."""
    pairs = []
    seen = set()
    for b in brands:
        if direction == "placeholder":
            src, dst = b["real"], b["placeholder"]
        else:
            src, dst = b["placeholder"], b["real"]
        for s, d in case_variants(src, dst, *flags):
            if s in seen:
                continue
            seen.add(s)
            pairs.append((s, d))
    pairs.sort(key=lambda p: -len(p[0]))
    return [(re.compile(r"\b" + re.escape(s) + r"\b"), d, s) for s, d in pairs]


# ---- File handling -------------------------------------------------------------

def is_text_file(path):
    ext = os.path.splitext(path)[1].lower()
    if ext in SKIP_EXTENSIONS:
        return False
    try:
        with open(path, "rb") as f:
            return b"\x00" not in f.read(4096)
    except OSError:
        return False


def iter_candidate_files(root, excluded_dirs):
    if os.path.isfile(root):
        if is_text_file(root):
            yield root
        return
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in excluded_dirs]
        for fname in filenames:
            full = os.path.join(dirpath, fname)
            if is_text_file(full):
                yield full


def scan_file(path, rules):
    try:
        with open(path, "r", encoding="utf-8") as f:
            text = f.read()
    except (UnicodeDecodeError, OSError):
        return None

    matches = []
    for i, raw in enumerate(text.splitlines(), start=1):
        new_line = raw
        for rx, dst, _src in rules:
            new_line = rx.sub(dst, new_line)
        if new_line != raw:
            matches.append((i, raw, new_line))
    if not matches:
        return None
    return {"path": path, "matches": matches, "total": len(matches)}


def rewrite_file(path, rules):
    with open(path, "r", encoding="utf-8") as f:
        text = f.read()
    new_text = text
    total = 0
    for rx, dst, _src in rules:
        new_text, n = rx.subn(dst, new_text)
        total += n
    if new_text != text:
        with open(path, "w", encoding="utf-8") as f:
            f.write(new_text)
    return total


# ---- Reporting -----------------------------------------------------------------

def print_summary(changes, root, show_matches, max_lines_per_file):
    if not changes:
        print("No matches found. Nothing to do.")
        return
    total = sum(c["total"] for c in changes)
    print("=" * 72)
    print("Scan root      : {}".format(root))
    print("Files affected : {}".format(len(changes)))
    print("Lines changed  : {}".format(total))
    print("=" * 72)
    for c in sorted(changes, key=lambda x: x["path"]):
        rel = os.path.relpath(c["path"], REPO_ROOT)
        print("\n[{:>3}] {}".format(c["total"], rel))
        if show_matches:
            for shown, (line_no, before, after) in enumerate(c["matches"]):
                if shown >= max_lines_per_file:
                    print("      ... ({} more line(s) suppressed)".format(c["total"] - shown))
                    break
                print("      L{:<5} - {}".format(line_no, before.strip()))
                print("      L{:<5} + {}".format(line_no, after.strip()))


# ---- CLI -----------------------------------------------------------------------

def parse_args():
    p = argparse.ArgumentParser(
        description="Reversibly switch mock brand names between real names and "
                    "trademark-safe placeholders. Defaults to dry-run.")
    scope = p.add_mutually_exclusive_group(required=True)
    scope.add_argument("--app", help="Mock directory name under websites/ (e.g. gmail_mock).")
    scope.add_argument("--all", action="store_true", help="Process every mock under websites/.")
    scope.add_argument("--list", action="store_true", help="Print the brand mapping table and exit.")

    p.add_argument("--to", choices=["real", "placeholder"],
                   help="Target form: 'real' brand names or 'placeholder' (X-) names.")
    p.add_argument("--brand", help="Limit the switch to a single brand (real name, e.g. Stripe).")
    p.add_argument("--registry", default=DEFAULT_REGISTRY, help="Path to brand_registry.json.")
    p.add_argument("--websites-root", default=DEFAULT_WEBSITES, help="Path to the websites/ dir.")
    p.add_argument("--no-title", action="store_true", help="Disable TitleCase variant.")
    p.add_argument("--no-lower", action="store_true", help="Disable lowercase variant.")
    p.add_argument("--no-upper", action="store_true", help="Disable UPPERCASE variant.")
    p.add_argument("--show-matches", action="store_true", help="Print before/after context lines.")
    p.add_argument("--max-lines-per-file", type=int, default=30)
    p.add_argument("--apply", action="store_true",
                   help="Write changes. Without this flag the script is a dry-run.")
    return p.parse_args()


def main():
    args = parse_args()
    brands = load_registry(args.registry)

    if args.list:
        print("{:<14} {:<16} {}".format("REAL", "PLACEHOLDER", "APPS"))
        print("-" * 72)
        for b in sorted(brands, key=lambda x: x["real"].lower()):
            print("{:<14} {:<16} {}".format(b["real"], b["placeholder"], ", ".join(b["apps"])))
        print("\n{} brand(s) registered.".format(len(brands)))
        return 0

    if not args.to:
        print("ERROR: --to {real,placeholder} is required for --app/--all.", file=sys.stderr)
        return 2

    if args.brand:
        sel = [b for b in brands if b["real"].lower() == args.brand.lower()]
        if not sel:
            print("ERROR: brand {!r} not found in registry.".format(args.brand), file=sys.stderr)
            return 2
        brands = sel

    flags = (not args.no_title, not args.no_lower, not args.no_upper)
    rules = build_rules(brands, args.to, flags)
    if not rules:
        print("ERROR: no replacement rules (all variants disabled?).", file=sys.stderr)
        return 2

    if args.all:
        root = args.websites_root
    else:
        root = os.path.join(args.websites_root, args.app)
        if not os.path.isdir(root):
            print("ERROR: app directory not found: {}".format(root), file=sys.stderr)
            return 2

    mode = "APPLY" if args.apply else "DRY-RUN"
    print("[{}] Switching --to {} ({} brand(s), {} rule(s))".format(
        mode, args.to, len(brands), len(rules)))

    changes = []
    for path in iter_candidate_files(root, DEFAULT_EXCLUDED_DIRS):
        c = scan_file(path, rules)
        if c is not None:
            changes.append(c)

    print_summary(changes, root, args.show_matches, args.max_lines_per_file)

    if not args.apply:
        print("\nDry-run complete. Re-run with --apply to write the changes.")
        return 0

    if changes:
        print("\nApplying changes...")
        files = matches = 0
        for c in changes:
            n = rewrite_file(c["path"], rules)
            if n:
                files += 1
                matches += n
        print("Done. Modified {} file(s), {} occurrence(s) replaced.".format(files, matches))
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except BrokenPipeError:
        # Happens when output is piped into e.g. `head`; exit quietly.
        try:
            sys.stdout.close()
        except Exception:
            pass
        sys.exit(0)
