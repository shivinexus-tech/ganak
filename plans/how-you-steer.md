# How you steer Ganak (without clicking Allow)

**You decide what.** Agents decide how — and run without waiting on Allow/Run.

## Your control panel
1. `plans/backlog.md` — what’s next / what’s done
2. `plans/task-log.md` — which agent is doing what, on which branch
3. Browser / phone smoke test when a slice says “ready”

You do **not** need to approve every shell command.

## Safety net
- Agents work **inside a sandbox** (project folder + allowed tools only).
- **Recovery vault:** `~/Ganak-Recovery/LATEST`  
  Agents are blocked from changing it.  
  Refresh after green gates / before big risk:
  ```bash
  export PATH="/opt/homebrew/bin:$PATH"
  ./scripts/snapshot-recovery.sh
  ```
- Temp files: `.scratch/` only (never `/tmp`).

## One-time switches (you)

### Cursor
Settings → Cursor Settings → Agents → Approvals & Execution  
→ Run Mode: **Auto-review** (safer) or **Run Everything** (fewest clicks)

### Claude Code
1. New session in this project  
2. Type `/sandbox` → **auto-allow**  
3. Mode indicator: **Auto** (Shift+Tab if needed)

### Codex
Use approval policy **never** / full-auto for this repo (so it doesn’t wait on Run).  
Still assign it backlog items via `plans/task-log.md` so Claude can review/commit.

## What “done” looks like
Agent finishes a backlog item → updates task-log → gates green → you glance at backlog and decide the next checkbox. No Allow once in between.
