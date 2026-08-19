#!/bin/bash
# Run every validation gate in the repository and print one line per gate.
#
# Why this exists: the project has ~90 gates and no way to run them all. AGENTS.md
# lists a couple of dozen by name, so in practice each agent runs the handful it
# remembers and nobody ever sees the whole board. A full run takes a couple of
# minutes and is the only honest answer to "is main green?".
#
#   bash scripts/run-all-gates.sh              # run everything
#   bash scripts/run-all-gates.sh muhurat      # run only gates whose name matches
#
# Exits non-zero if any gate fails. Per-gate output is kept in .scratch/gate-logs/
# so a failure can be read without re-running the suite.
#
# Note: `timeout` is GNU-only and is deliberately not used here — macOS does not
# ship it, and an earlier version of this script reported every gate as failing
# for exactly that reason.

set -uo pipefail
export PATH="/opt/homebrew/bin:$PATH"

cd "$(dirname "$0")/.." || exit 1

filter="${1:-}"
logs=".scratch/gate-logs"
report=".scratch/gate-report.txt"
mkdir -p "$logs"
: > "$report"

pass=0
fail=0
failed_names=()

run_gate() {
  local label="$1"; shift
  local start elapsed
  start=$(date +%s)
  if node "$@" > "$logs/$label.txt" 2>&1; then
    elapsed=$(( $(date +%s) - start ))
    printf 'PASS  %-42s %3ss\n' "$label" "$elapsed" | tee -a "$report"
    pass=$((pass + 1))
  else
    elapsed=$(( $(date +%s) - start ))
    printf 'FAIL  %-42s %3ss\n' "$label" "$elapsed" | tee -a "$report"
    fail=$((fail + 1))
    failed_names+=("$label")
  fi
}

for gate in validation/*.cjs; do
  name=$(basename "$gate")
  case "$name" in _*) continue;; esac                       # helpers, not gates
  [ -n "$filter" ] && case "$name" in *"$filter"*) ;; *) continue;; esac
  run_gate "$name" "$gate"
done

# The three gates that take an argument.
if [ -z "$filter" ]; then
  run_gate "parse-check.js" validation/parse-check.js src/kundli-app.tsx
  run_gate "prashna-parity.js" validation/prashna-parity.js src/screens/PrashnaScreen.tsx
  run_gate "prashna-calc.js" validation/prashna-calc.js
fi

echo
echo "$pass passed, $fail failed."
if [ "$fail" -gt 0 ]; then
  echo "Failed gates (full output in $logs/):"
  for name in "${failed_names[@]}"; do echo "  - $name  ->  $logs/$name.txt"; done
  exit 1
fi
