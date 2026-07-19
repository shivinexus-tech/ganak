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

### Standing owner decision (2026-07-19)
**Do not ask every time.** When a named slice (or docs sync) is finished and
gates are green (or the change is docs-only), agents **commit and push** on
their own, then say what they did in one line. Ask only if something is
risky, gates are red, or the change is an unstable experiment.

Owner can still override with: “commit only,” “don’t push,” or “wait.”

### When to **commit** (save a chapter)
Default **yes** when:
1. A **named backlog slice** (or clear docs/coordination fix) is finished.
2. **Gates are green** (or docs-only).
3. A restore point is useful even if the epic isn’t finished.

Skip if: still mid-edit, gates red, or “just exploring.”

### When to **push** (publish that chapter)
Default **yes** right after that commit (GitHub should match the Mac).

### When to refresh **~/Ganak-Recovery**
After a good commit (especially before a scary next slice), without waiting
for another owner click unless the owner said not to.

### Tiny vs big changes
| Change type | Commit? | Push? |
|---|---|---|
| Product/code slice after green gates | Yes (auto) | Yes (auto) |
| Task-log / backlog / steer docs | Yes (auto) | Yes (auto) |
| Sandbox/settings still unstable | Wait | Wait |
| Failed experiment | Don’t | Never |

### Override phrases (owner → agent)
- “**Commit only** — don’t push.”
- “**Don’t touch git** until I say.”
- “**Commit + push**, then refresh Recovery.”

### Why `*.drikpanchang.com` is in Claude settings
Ganak’s **benchmark** website is Drik Panchang. Agents sometimes **look up**
festival/muhurat pages there to verify accuracy. The sandbox allow-list lets
those lookups run without an Allow prompt. It is **not** shipping Drik code
into the app, and it is **not** required for city search (that uses
Open-Meteo). Listing it once is enough; we don’t need to keep re-adding it.
