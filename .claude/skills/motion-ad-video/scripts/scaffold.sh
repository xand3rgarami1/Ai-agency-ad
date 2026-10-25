#!/usr/bin/env bash
# Copy the Remotion ad template into <dest> and install pinned dependencies.
# Usage: scaffold.sh <dest-dir>
set -euo pipefail
dest="${1:?usage: scaffold.sh <dest-dir>}"
here="$(cd "$(dirname "$0")/.." && pwd)"
mkdir -p "$dest"
# -n: never overwrite files the user already has
cp -rn "$here/assets/template/." "$dest/"
cd "$dest"
npm install --no-audit --no-fund
npx tsc --noEmit && echo "scaffold ok: $dest"
