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

## Git for owners (no code reading required)

Think of three copies of the project:

| Copy | Where | What it is |
|---|---|---|
| **Working desk** | Your Mac folder (`ClaudeProjects/Kundli`) | Live files agents are editing — can be messy mid-task |
| **Saved chapter** | **Commit** (local Git history) | A named snapshot: “this moment is a restore point” |
| **Published book** | **Push** (GitHub) | Same snapshot shared online / backup / other devices |

```
desk ──commit──► local history ──push──► GitHub
                    │
                    └── optional: refresh ~/Ganak-Recovery
```

### When to **commit** (save a chapter)
Say **yes to commit** when all of these feel true:
1. The agent finished a **named backlog slice** (or a clear docs/coordination fix).
2. **Gates are green** (or the change is docs-only, like the task-log MERGED update).
3. You want a restore point *even if* the epic isn’t finished.

You do **not** need the whole EPIC done. One finished checkbox is enough.

Skip commit if: still mid-edit, gates red, or “just exploring.”

### When to **push** (publish that chapter)
Say **yes to push** after a commit when you want any of:
- GitHub to match your Mac (backup / other agents / other machines)
- The work to be “official” for the project history
- Peace of mind after a big slice

You can commit today and push tomorrow. Pushing later is fine.

Skip push if: you’re still unsure the chapter is right *and* you’re okay with it only existing on this Mac + Recovery.

### When to refresh **~/Ganak-Recovery**
After a good commit (especially before a scary next slice).  
This is a belt-and-suspenders offline copy agents must not touch.

### Tiny vs big changes
| Change type | Commit? | Push? |
|---|---|---|
| Product/code slice (Prashna extract, engine move) | Yes, after gates | Yes soon |
| Task-log “MERGED” / backlog checkbox | Yes (small docs commit) | Optional same day |
| Sandbox/settings experiments still unstable | Wait | Wait |
| Failed experiment | Don’t commit — leave or discard | Never |

### One sentence to tell the agent
- “**Commit** the finished slice; don’t push yet.”
- “**Push** what’s already committed.”
- “**Commit + push**, then refresh Recovery.”
- “Docs-only: update the task-log and commit that.”

### The question agents will ask you
When you hear *“local only — commit or push?”* translate it as:

> Is this moment worth a save? If yes → **commit**.  
> Should the online copy match? If yes → **push**.

You don’t need to understand the files. You need: **backlog name + gates green + save/publish preference**.
