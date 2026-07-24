# Ganak

All project conventions live in **AGENTS.md** (canonical for every agent — Claude,
Codex, Gemini, or human). Read it first and follow it exactly; do not let this
file and AGENTS.md drift apart — AGENTS.md wins.

Claude-specific notes:
- On this machine Node/npm live at `/opt/homebrew/bin` (not on the harness PATH):
  prefix shell commands with `export PATH="/opt/homebrew/bin:$PATH"`.
- Dev server: use the Browser pane with launch config `kundli-dev`
  (`.claude/launch.json`), not a raw shell.
- **NEVER write to `/tmp` (or anywhere outside this repo).** Temp backups go in
  `.scratch/` only. Writing outside the project escapes the sandbox and forces an
  "Allow once" prompt — that is a bug in the command, not something the owner
  should approve. Rewrite the command; do not ask to run unsandboxed.
- **NEVER touch `~/Ganak-Recovery/`.** That is the owner's restore vault.
- Work autonomously inside the sandbox. Do not wait for Allow/Run clicks for
  routine gates, git, or builds. The owner steers via `plans/backlog.md` and
  `plans/task-log.md`.
- **Pre-flight:** before code edits, read `plans/task-log.md` and report to the
  owner: In progress / Unassigned / Stopped midway (which agent + where + why; see AGENTS.md Workflow).
