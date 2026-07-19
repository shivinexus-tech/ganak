# Claude Code — parallel assignment (while Cursor finishes SPLIT-UI-02)

Date: 2026-07-19  
Owner: assign in Claude Code session after reading this file.

> ## ✅ PARALLEL-LANES-01 — DONE (2026-07-19)
> Board created at [`plans/module-ownership-map.md`](module-ownership-map.md);
> `parallel-agent-brief.md` marked historical and repointed; backlog + task-log
> updated. Docs-only — **no `src/**` or `validation/**` file was touched.**
> Flagged for the integration owner: stale `src/PrashnaScreen.jsx` duplicates the
> live `src/screens/PrashnaScreen.tsx` — a real "edit the wrong file" hazard.

## Hard rule
**Do not edit any `src/**` file** until SPLIT-UI-02 is MERGED (Cursor owns
`kundli-app.tsx`, `src/data/places.ts`, `src/components/PlaceInput.tsx`).

## Assigned task: PARALLEL-LANES-01
Turn the outdated single-file `plans/parallel-agent-brief.md` into a **live
ten-lane ownership board**, and create `plans/module-ownership-map.md`.

### Deliverables
1. `plans/module-ownership-map.md` — one table row per lane with:
   - lane name
   - intended files (even if not extracted yet — mark TBD vs exists)
   - current status (`Waiting` / `Extracted` / `MERGED`)
   - who may reserve next
2. Update `plans/parallel-agent-brief.md` header to say it is historical for the
   single-file era, and point readers to the new ownership map + `task-log.md`.
3. Append a short note under EPIC-10-LANES in `plans/backlog.md` only if you
   need a one-line “board lives at …” pointer — **do not reshuffle Phase 1
   content priorities**.

### Allowed files
- `plans/parallel-agent-brief.md`
- `plans/module-ownership-map.md` (create)
- `plans/claude-handoff-parallel.md` (this file — status updates OK)
- `plans/task-log.md` — **only** the Ten-lane target ownership table and the
  PARALLEL-LANES-01 row (coordinate if Cursor is also editing the log)

### Forbidden
- `src/**`
- `validation/**`
- `.claude/settings*.json` (unless owner separately asks)
- Religious festival/vrat **invention** — content research may be planned in
  `plans/` but dates/vidhis require Drik + second source + owner verify later

### Done looks like
- Ownership map exists and matches the ten lanes already sketched in task-log
- Brief clearly labeled historical
- Task-log PARALLEL-LANES-01 → REVIEW with gate not required (docs-only)
- Paste a short summary for the owner in plain language

## Optional later (only after SPLIT-UI-02 MERGED)
- Reserve **SPLIT-UI-03** Daily/Panchang screen shell on a new branch
- Or start **P1-CONTENT** research notes for the next fest batch (plans only)
