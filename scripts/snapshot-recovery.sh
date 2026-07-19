#!/bin/bash
# Refresh ~/Ganak-Recovery from the current project.
# Owner-run (or CI) only — agents must NOT write into ~/Ganak-Recovery.
set -euo pipefail
export PATH="/opt/homebrew/bin:$PATH"

SRC="$(cd "$(dirname "$0")/.." && pwd)"
REC="$HOME/Ganak-Recovery"
STAMP=$(date +%Y-%m-%d-%H%M%S)
DEST_HIST="$REC/HISTORY/$STAMP"

mkdir -p "$REC/HISTORY" "$REC/LATEST" "$DEST_HIST"

# LATEST may be chmod'd a-w; unlock briefly, then re-lock.
chmod -R u+w "$REC/LATEST" 2>/dev/null || true

rsync -a --delete \
  --exclude node_modules \
  --exclude dist \
  --exclude .git \
  --exclude .scratch \
  --exclude '.DS_Store' \
  "$SRC/" "$DEST_HIST/"

rsync -a --delete \
  --exclude node_modules \
  --exclude dist \
  --exclude .git \
  --exclude .scratch \
  --exclude '.DS_Store' \
  "$SRC/" "$REC/LATEST/"

SHORT=$(git -C "$SRC" rev-parse --short HEAD)
INFO="Ganak recovery snapshot
created: $STAMP
git_commit: $SHORT
source: $SRC
DO NOT LET AGENTS MODIFY THIS FOLDER"

printf '%s\n' "$INFO" > "$REC/LATEST/RECOVERY-INFO.txt"
cp "$REC/LATEST/RECOVERY-INFO.txt" "$DEST_HIST/RECOVERY-INFO.txt"

chmod -R a-w "$REC/LATEST" 2>/dev/null || true
chmod u+w "$REC" "$REC/HISTORY" "$REC/LATEST" 2>/dev/null || true

echo "Recovery updated → $REC/LATEST (commit $SHORT)"
echo "History copy     → $DEST_HIST"
