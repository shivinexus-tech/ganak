# Ganak

All project conventions live in **AGENTS.md** (canonical for every agent — Claude,
Codex, Gemini, or human). Read it first and follow it exactly; do not let this
file and AGENTS.md drift apart — AGENTS.md wins.

Claude-specific notes:
- On this machine Node/npm live at `/opt/homebrew/bin` (not on the harness PATH):
  prefix shell commands with `export PATH="/opt/homebrew/bin:$PATH"`.
- Dev server: use the Browser pane with launch config `kundli-dev`
  (`.claude/launch.json`), not a raw shell.
