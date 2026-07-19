# Ganak — Shared Agent Task Log

Purpose: the durable coordination record for Claude Code, Codex, Cursor and other
agents. Record work here before editing code so parallel branches never claim the
same file.

## Rules

1. One active writer per file. Directory ownership is preferred for feature work.
2. Concurrent coding uses a separate Git branch and worktree per agent.
3. The integration owner alone edits shared shell/navigation/token files while merges
   are in progress.
4. Every entry lists exact allowed files. Anything outside that list requires a new
   reservation before editing.
5. Finish with gate evidence and a handoff. Never mark a task done because code was
   drafted but not validated.

## Status key

- `RESERVED` — assigned; editing may begin.
- `ACTIVE` — work in progress.
- `REVIEW` — implementation complete and left for review.
- `MERGED` — integrated and validated on the integration branch.
- `BLOCKED` — cannot progress; reason and required decision recorded.

## Active and recent tasks

| ID | Status | Agent | Branch/worktree | Exclusive files | Task | Evidence / handoff |
|---|---|---|---|---|---|---|
| SPLIT-ENGINE-01 | REVIEW | Codex | current integration worktree | `src/kundli-app.tsx`, `src/engine/*`, `plans/codex-handoff-engine-split.md` | Pure astronomy engine split | All gates/build/browser green; see `plans/codex-handoff-engine-split.md`; uncommitted |
| SPLIT-UI-01 | REVIEW | Codex | current integration worktree | `src/kundli-app.tsx`, `src/screens/PrashnaScreen.tsx`, `src/components/tokens.ts`, `src/components/format.ts`, `validation/prashna-parity.js`, coordination docs | First pure UI slice: extracted Prashna screen plus exact shared tokens/formatter moves; no intended behaviour or styling change | Parse clean; parity EXACT (198 values/6 charts); deliberate mutation made parity fail, then restored; Prashna 24/24; Muhurat/content anchors pass; production build passes; Daily + Prashna browser smoke pass with 0 console errors; review: `plans/codex-review-ui-split.md`; uncommitted |

## Ten-lane target ownership

These lanes become simultaneously assignable as their files are extracted. A lane
must replace `TBD` with real branch/worktree and exact files before work starts.

| Lane | Scope | Intended module ownership | Current state |
|---|---|---|---|
| 1 | Daily/Panchang | `src/screens/DailyScreen.tsx`, daily-only components | Waiting for extraction |
| 2 | Festivals/Vrats | `src/features/festivals/*` | Waiting for extraction |
| 3 | Muhurat | `src/features/muhurat/*` | Waiting for extraction |
| 4 | Chart | `src/screens/ChartScreen.tsx`, chart-only components | Waiting for extraction |
| 5 | Matching | `src/features/matching/*` | Waiting for extraction |
| 6 | Prashna | `src/screens/PrashnaScreen.tsx` | Extracted; available after review/integration |
| 7 | Hora/Gochar | `src/features/hora/*`, `src/features/gochar/*` | Waiting for extraction |
| 8 | Jyotish tools | `src/features/jyotish-tools/*` | Waiting for extraction |
| 9 | Validation | `validation/*` with task-specific reservation | Available for non-overlapping gates |
| 10 | Backend/deployment | `server/*`, hosting/monitoring config | Available now |

## Integration-owned files

- `src/kundli-app.tsx`
- shared navigation and app-level state
- shared design tokens/theme
- `AGENTS.md`, `.cursorrules`, `plans/backlog.md`, this task log

Agents may read these files. They may edit them only when the log explicitly assigns
integration ownership for that task.
