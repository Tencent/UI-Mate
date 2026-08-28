#!/usr/bin/env python3
"""
rename_brand.py - Batch rename a brand/product name across a mock app directory.

Handles three case variants automatically:

    1. TitleCase   -> Original  -> Target            (e.g. Xmplitude -> Amplitude)
    2. lowercase   -> original  -> target            (e.g. xmplitude -> amplitude)
    3. UPPERCASE   -> ORIGINAL  -> TARGET            (e.g. XMPLITUDE -> AMPLITUDE)

By default it runs in DRY-RUN mode and prints a per-file / per-variant summary
plus the matching lines (with line numbers) so a reviewer (or a model) can
validate the change set before applying it.

Examples
--------
    # Dry run (default)
    python3 rename_brand.py --original Xmplitude --target Amplitude \\
        --dir websites/amplitude_mock

    # Show match context for review
    python3 rename_brand.py --original Xmplitude --target Amplitude \\
        --dir websites/amplitude_mock --show-matches

    # Actually write changes (after review)
    python3 rename_brand.py --original Xmplitude --target Amplitude \\
        --dir websites/amplitude_mock --apply

    # Customize ignored directories
    python3 rename_brand.py --original Xmplitude --target Amplitude \\
        --dir websites/amplitude_mock --exclude dist node_modules .git

Compatible with Python 3.6+.
"""

import argparse
import json
import os
import sys

# ---- Defaults -----------------------------------------------------------------

DEFAULT_EXCLUDED_DIRS = {
    ".git", "node_modules", "dist", "build", ".next", ".turbo",
    ".cache", ".vite", "__pycache__", ".venv", "venv",
}

# Binary / non-text extensions we never want to touch.
SKIP_EXTENSIONS = {
    ".png", ".jpg", ".jpeg", ".gif", ".webp", ".ico",
    ".woff", ".woff2", ".ttf", ".otf", ".eot",
    ".mp4", ".mp3", ".wav", ".mov", ".webm",
    ".pdf", ".zip", ".gz", ".tar", ".7z",
    ".so", ".dll", ".dylib", ".exe", ".bin",
    ".lock",
    ".map",
}


# ---- Core logic ---------------------------------------------------------------

def build_variants(original, target, include_title, include_lower, include_upper):
    """Return list of dicts: {name, src, dst}, deduplicated by src."""
    raw = []
    if include_title:
        raw.append(("TitleCase", original, target))
    if include_lower:
        raw.append(("lowercase", original.lower(), target.lower()))
    if include_upper:
        raw.append(("UPPERCASE", original.upper(), target.upper()))

    variants = []
    seen_src = set()
    for name, src, dst in raw:
        if src == dst:
            continue
        if src in seen_src:
            continue
        seen_src.add(src)
        variants.append({"name": name, "src": src, "dst": dst})
    # Sort by descending src length so longer/more-specific patterns hit first.
    variants.sort(key=lambda v: -len(v["src"]))
    return variants


def is_text_file(path):
    ext = os.path.splitext(path)[1].lower()
    if ext in SKIP_EXTENSIONS:
        return False
    try:
        with open(path, "rb") as f:
            chunk = f.read(4096)
        return b"\x00" not in chunk
    except OSError:
        return False


def iter_candidate_files(root, excluded_dirs):
    for dirpath, dirnames, filenames in os.walk(root):
        # Prune excluded dirs in-place so os.walk skips them entirely.
        dirnames[:] = [d for d in dirnames if d not in excluded_dirs]
        for fname in filenames:
            full = os.path.join(dirpath, fname)
            if is_text_file(full):
                yield full


def apply_variants_to_line(line, variants):
    new_line = line
    for v in variants:
        if v["src"] in new_line:
            new_line = new_line.replace(v["src"], v["dst"])
    return new_line


def scan_file(path, variants):
    """Return dict {path, matches: {variant_name: [(line_no, before, after), ...]}}
    or None if the file has no matches."""
    try:
        with open(path, "r", encoding="utf-8") as f:
            text = f.read()
    except (UnicodeDecodeError, OSError):
        return None

    if not any(v["src"] in text for v in variants):
        return None

    matches = {}
    for i, raw in enumerate(text.splitlines(), start=1):
        new_line = apply_variants_to_line(raw, variants)
        if new_line == raw:
            continue
        # Attribute the line to the first matching variant for the summary.
        for v in variants:
            if v["src"] in raw:
                matches.setdefault(v["name"], []).append((i, raw, new_line))
                break
    if not matches:
        return None
    total = sum(len(v) for v in matches.values())
    return {"path": path, "matches": matches, "total": total}


def rewrite_file(path, variants):
    with open(path, "r", encoding="utf-8") as f:
        text = f.read()
    new_text = text
    total = 0
    for v in variants:
        count = new_text.count(v["src"])
        if count:
            total += count
            new_text = new_text.replace(v["src"], v["dst"])
    if new_text != text:
        with open(path, "w", encoding="utf-8") as f:
            f.write(new_text)
    return total


# ---- Reporting ----------------------------------------------------------------

def relpath(path, root):
    try:
        return os.path.relpath(path, root)
    except ValueError:
        return path


def print_summary(changes, variants, root, show_matches, max_lines_per_file):
    if not changes:
        print("No matches found. Nothing to do.")
        return

    total_matches = sum(c["total"] for c in changes)
    by_variant = {v["name"]: 0 for v in variants}
    for c in changes:
        for vname, items in c["matches"].items():
            by_variant[vname] = by_variant.get(vname, 0) + len(items)

    print("=" * 72)
    print("Scan root      : {}".format(root))
    print("Files affected : {}".format(len(changes)))
    print("Total matches  : {}".format(total_matches))
    print("Variants:")
    for v in variants:
        print("  - {:<10} {!r:>20} -> {!r:<20} : {} hit(s)".format(
            v["name"], v["src"], v["dst"], by_variant.get(v["name"], 0)))
    print("=" * 72)

    for c in sorted(changes, key=lambda x: x["path"]):
        rel = relpath(c["path"], root)
        print("\n[{:>3}] {}".format(c["total"], rel))
        for vname, items in c["matches"].items():
            print("    {}: {} hit(s)".format(vname, len(items)))
        if show_matches:
            shown = 0
            done = False
            for vname, items in c["matches"].items():
                for line_no, before, after in items:
                    if shown >= max_lines_per_file:
                        remaining = c["total"] - shown
                        print("      ... ({} more match(es) suppressed)".format(remaining))
                        done = True
                        break
                    print("      L{:<5} - {}".format(line_no, before.strip()))
                    print("      L{:<5} + {}".format(line_no, after.strip()))
                    shown += 1
                if done:
                    break


def emit_json_report(changes, variants, root, out_path):
    payload = {
        "root": root,
        "variants": variants,
        "files": [
            {
                "path": relpath(c["path"], root),
                "total": c["total"],
                "matches": {
                    vname: [
                        {"line": ln, "before": before, "after": after}
                        for ln, before, after in items
                    ]
                    for vname, items in c["matches"].items()
                },
            }
            for c in sorted(changes, key=lambda x: x["path"])
        ],
    }
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2, ensure_ascii=False)
    print("\nJSON report written to: {}".format(out_path))


# ---- CLI ----------------------------------------------------------------------

def parse_args():
    p = argparse.ArgumentParser(
        description="Batch rename a brand/product name across a mock app directory "
                    "with case-aware variants. Defaults to dry-run.",
    )
    p.add_argument("--original", required=True,
                   help="Original brand name in TitleCase (e.g. Xmplitude).")
    p.add_argument("--target", required=True,
                   help="Target brand name in TitleCase (e.g. Amplitude).")
    p.add_argument("--dir", required=True,
                   help="Mock app directory to scan / rewrite.")
    p.add_argument("--exclude", nargs="*", default=None,
                   help="Directory names to exclude. "
                        "Default: {}".format(sorted(DEFAULT_EXCLUDED_DIRS)))
    p.add_argument("--no-title", action="store_true",
                   help="Disable TitleCase variant.")
    p.add_argument("--no-lower", action="store_true",
                   help="Disable lowercase variant.")
    p.add_argument("--no-upper", action="store_true",
                   help="Disable UPPERCASE variant.")
    p.add_argument("--show-matches", action="store_true",
                   help="Print before/after context lines for each match.")
    p.add_argument("--max-lines-per-file", type=int, default=20,
                   help="Cap how many match lines are printed per file "
                        "in --show-matches mode (default: 20).")
    p.add_argument("--json-report", type=str, default=None,
                   help="Optional path to write a machine-readable JSON report "
                        "for handing off to a model for validation.")
    p.add_argument("--apply", action="store_true",
                   help="Actually write changes. Without this flag the script "
                        "runs in dry-run mode.")
    return p.parse_args()


def main():
    args = parse_args()

    root = os.path.abspath(args.dir)
    if not os.path.isdir(root):
        print("ERROR: --dir {} is not a directory.".format(root), file=sys.stderr)
        return 2

    excluded = set(args.exclude) if args.exclude is not None else set(DEFAULT_EXCLUDED_DIRS)

    variants = build_variants(
        args.original, args.target,
        include_title=not args.no_title,
        include_lower=not args.no_lower,
        include_upper=not args.no_upper,
    )
    if not variants:
        print("ERROR: no variants enabled / all variants are no-ops.", file=sys.stderr)
        return 2

    mode = "APPLY" if args.apply else "DRY-RUN"
    print("[{}] Renaming {!r} -> {!r} under {}".format(
        mode, args.original, args.target, root))
    print("Excluded dirs: {}".format(sorted(excluded)))

    changes = []
    for path in iter_candidate_files(root, excluded):
        c = scan_file(path, variants)
        if c is not None:
            changes.append(c)

    print_summary(changes, variants, root,
                  show_matches=args.show_matches,
                  max_lines_per_file=args.max_lines_per_file)

    if args.json_report:
        emit_json_report(changes, variants, root, os.path.abspath(args.json_report))

    if not args.apply:
        print("\nDry-run complete. Re-run with --apply to write the changes.")
        return 0

    if not changes:
        return 0

    print("\nApplying changes...")
    written_files = 0
    written_matches = 0
    for c in changes:
        n = rewrite_file(c["path"], variants)
        if n:
            written_files += 1
            written_matches += n
    print("Done. Modified {} file(s), {} occurrence(s) replaced.".format(
        written_files, written_matches))
    return 0


if __name__ == "__main__":
    sys.exit(main())
