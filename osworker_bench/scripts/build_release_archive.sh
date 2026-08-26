#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${ROOT}"

if [ -n "$(git status --porcelain)" ]; then
    echo "[ERROR] Refusing to build a release archive from a dirty worktree." >&2
    exit 1
fi

REVISION="$(git rev-parse --short=12 HEAD)"
OUTPUT_DIR="${OUTPUT_DIR:-${ROOT}/dist}"
OUTPUT="${OUTPUT_DIR}/mini-osworld-${REVISION}.tar.gz"

mkdir -p "${OUTPUT_DIR}"
git archive \
    --format=tar.gz \
    --prefix="mini-osworld-${REVISION}/" \
    --output="${OUTPUT}" \
    HEAD

echo "Created ${OUTPUT}"
