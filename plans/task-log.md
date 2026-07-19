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
| SPLIT-ENGINE-01 | MERGED | Codex | `main` @ `a21260d` | `src/kundli-app.tsx`, `src/engine/*`, `plans/codex-handoff-engine-split.md` | Pure astronomy engine split | Gates/build/browser green; handoff `plans/codex-handoff-engine-split.md`; committed+pushed in `a21260d` (2026-07-19) |
| SPLIT-UI-01 | MERGED | Codex | `main` @ `a21260d` | `src/kundli-app.tsx`, `src/screens/PrashnaScreen.tsx`, `src/components/tokens.ts`, `src/components/format.ts`, `validation/prashna-parity.js`, coordination docs | First pure UI slice: extracted Prashna screen plus exact shared tokens/formatter moves; no intended behaviour or styling change | Parse clean; parity EXACT (198 values/6 charts); Prashna 24/24; Muhurat/content anchors pass; production build passes; Daily + Prashna browser smoke pass with 0 console errors; review: `plans/codex-review-ui-split.md`; committed+pushed in `a21260d` (2026-07-19) |
| SPLIT-UI-02 | MERGED | Cursor | `main` | `src/kundli-app.tsx`, `src/data/places.ts`, `src/components/PlaceInput.tsx`, coordination docs | Shared place search + gazetteer extraction (pure move) | Gates green; auto commit+push per owner standing policy 2026-07-19 |
| SPLIT-UI-03a | MERGED | Claude Code | `main` | `src/engine/hora.ts` (new), `src/engine/panchang.ts`, `src/kundli-app.tsx`, coordination docs | Prep slice for Daily: extract the hora (planetary hours) engine out of the shell, and move `SIGN_LORD` to `panchang.ts` so hora needs nothing from the shell | Pure move. Parse clean ×3; parity EXACT (198/6); Prashna 24/24; muhurat-anchors pass; content-dates pass; build passes; browser smoke: hora timeline + advisor + ascendant personalization all correct, 0 console errors. **Guard proven non-vacuous:** removing the new import made parse-check fail with all 8 hora orphans. Shell 4,787 → 4,593 lines. |
| SPLIT-UI-03b | MERGED | Claude Code | `main` | `src/i18n.ts` (new), `src/kundli-app.tsx`, coordination docs | Prep slice for Daily: extract bilingual string dictionary `L` plus `tr`/`trN`/`obsLabel` into a shared i18n module | Pure move. Parse clean ×2; parity EXACT; Prashna 24/24; muhurat-anchors + content-dates pass; build passes; browser smoke both languages (248 Devanagari runs; Yogini Ekadashi/Ravi Pradosh variant labels translate via the rewired cross-module dicts), 0 console errors. **Guard proven:** dropping the import failed parse-check with tr/trN/obsLabel orphans. Shell 4,593 → 4,534. |
| SPLIT-UI-03c | MERGED | Claude Code | `main` | `src/engine/panchaka.ts` (new), `src/engine/ephemeris.ts`, `src/components/format.ts`, `src/kundli-app.tsx`, coordination docs | Final prep slice for Daily: `fmtTime`/`fmtTimeD` → format.ts, `ascendantAt` → ephemeris.ts, `computeLagnaPanchaka` + `PANCHAKA_TYPE` + `panchakaRem` → new panchaka engine | Pure move. Parse clean ×4; parity EXACT; Prashna 24/24; muhurat-anchors + content-dates pass; build passes. Browser: Udaya Lagna schedule, Panchaka Rahita windows, birth chart (Lagna Meena 1°25′, Sun Makara — consistent), and both `computeLagnaPanchaka` callers incl. finder top-day panchaka; 0 errors on instrumented remount. **Guard proven:** dropping both imports failed parse-check with ascendantAt + computeLagnaPanchaka orphans. Shell 4,534 → 4,460. **Daily is now unblocked.** |
| PARALLEL-LANES-01 | MERGED | Claude Code | `main` @ `11d339e` | `plans/module-ownership-map.md`, `plans/parallel-agent-brief.md`, `plans/backlog.md`, `plans/task-log.md` | Turn ten-lane brief into a live ownership board | Docs-only on GitHub as `11d339e`. Stale `src/PrashnaScreen.jsx` removed in follow-up `73c08dd`. |
| SPLIT-UI-MATCH-01 | MERGED | Cursor | `main` | `src/engine/matching.ts`, `src/screens/MatchingScreen.tsx`, `src/kundli-app.tsx` | Extract + wire Kundali Matching | Gates green after wire; MatchMaker via prop-injected computeKundli. |
| SPLIT-UI-CHART-01a | MERGED | Cursor | `main` | `src/components/DiamondChart.tsx`, `src/kundli-app.tsx` | Extract + wire North Indian DiamondChart | Gates green; shell uses imported component. |
| SPLIT-UI-JYOTISH-01a | MERGED | Cursor | `main` @ follow-up | `src/engine/bhrigu.ts`, `src/engine/gochar.ts` | Extract BNN+BCP/BSP calc + gochar helpers for bnnTiming | Modules on GitHub; parse-clean after gochar import fix. |
| SPLIT-UI-JYOTISH-01b | MERGED | Cursor | `main` (modules only) | `src/engine/classical.ts` | Extract Ashtakavarga/Arudhas/Yogas calc | Module on GitHub; shell wire still pending. |
| SPLIT-UI-JYOTISH-01c | MERGED | Cursor | `main` (modules only) | `src/engine/shadbala.ts`, `src/engine/varga.ts` | Extract Shadbala calc + shared `vargaSign` helper | Modules on GitHub; shell wire still pending. Claude owns shell (Daily). |
| SPLIT-UI-JYOTISH-01d | MERGED | Cursor | `main` (modules only) | `src/engine/dasha.ts` | Vimshottari + KP sub-lord/significators + rectification helpers | Own VIM_LORDS (no fight with Claude's panchang WIP). Wire deferred. |
| SPLIT-UI-JYOTISH-01e | MERGED | Cursor | `main` (modules only) | `src/engine/special-points.ts` | Special lagnas / points / upagrahas | Wire deferred. |
| SPLIT-UI-JYOTISH-01f | MERGED | Cursor | `main` (modules only) | `src/engine/bhava.ts` | Bhava Chalit + Bhava Bala | Wire deferred. |
| SPLIT-UI-CHART-01b | MERGED | Cursor | `main` (modules only) | `src/engine/houses.ts` | Placidus cusps | Wire deferred. |
| SPLIT-UI-CHART-01c | MERGED | Cursor | `main` (modules only) | `src/data/chart-divisions.ts` | VARGAS + SPECIAL_CHARTS catalogs | Wire deferred. |
| SPLIT-UI-CHART-02 | MERGED | Cursor | `main` (modules only) | `src/engine/kundli.ts` | `computeKundli` birth-chart engine | Smoke OK (Delhi sample). Shell wire still pending — Daily owns shell. |

| SPLIT-UI-JYOTISH-02 | MERGED | Cursor | `main` (modules only) | `src/screens/JyotishBnnScreen.tsx`, `src/components/format.ts` (fmtDateT), `src/data/chart-divisions.ts` (SIGN_SHORT) | BNN + Bhrigu UI modules | Wire deferred. |
| SPLIT-UI-JYOTISH-03 | MERGED | Cursor | `main` (modules only) | `src/screens/RectifyScreen.tsx` | Birth-time rectification UI | Wire deferred. |

| SPLIT-UI-CHART-03 | MERGED | Cursor | `main` (modules only) | `src/components/DashaTree.tsx`, `src/engine/dasha.ts` (DASHA_LEVELS) | Dasha tree UI | Wire deferred. |
| SPLIT-UI-CONTENT-01 | MERGED | Cursor | `main` (modules only) | `src/components/VratVidhiCard.tsx` | Vrat vidhi card UI | Wire deferred. |

| SPLIT-UI-CHART-04 | MERGED | Cursor | `main` (modules only) | `src/components/ChartVault.tsx` | Vault/export/share UI | Wire deferred. |
| SPLIT-UI-CHART-05 | MERGED | Cursor | `main` (modules only) | `src/engine/transit-copy.ts` | Transit duration + event gloss | Wire deferred. |

| SPLIT-UI-03d | MERGED | Cursor | `main` (modules only) | `src/engine/today-panchang.ts` | computeTodayPanchang engine | Smoke Delhi 2026-07-19 OK. Wire deferred. |
| SPLIT-UI-03e | MERGED | Cursor | `main` (modules only) | `src/engine/search-upcoming.ts` | Upcoming observances search | Wire deferred. |
| SPLIT-UI-03f | MERGED | Cursor | `main` (modules only) | `src/screens/CalendarPage.tsx` | Calendar page UI | Wire deferred — helps Daily. |

## Ten-lane target ownership

**→ Live board with file-existence detail: [`plans/module-ownership-map.md`](module-ownership-map.md)**

These lanes become simultaneously assignable as their files are extracted. A lane
must replace `TBD` with real branch/worktree and exact files before work starts.
**Reality check (2026-07-19): ~4 code lanes are actually open** (Prashna, Validation,
Backend, Content-data) plus unlimited `plans/` research lanes — the rest await UI
extraction. Daily is the highest-leverage next slice; it gates three lanes.

| Lane | Scope | Intended module ownership | Current state |
|---|---|---|---|
| 1 | Daily/Panchang | `src/screens/DailyScreen.tsx`, daily-only components | Waiting — **next slice (SPLIT-UI-03), gates lanes 1/7 and 2/3 UI** |
| 2 | Festivals/Vrats | UI `src/features/festivals/*` TBD; data `src/data/festival-meta.ts` + `src/data/vrat-vidhis.ts` exist | **Partial — data files reservable now** (P1-CONTENT work) |
| 3 | Muhurat | UI `src/features/muhurat/*` TBD; engine `src/engine/muhurat.ts` exists | Partial — engine reservable for fixes |
| 4 | Chart | `src/screens/ChartScreen.tsx`, chart-only components | Waiting for extraction |
| 5 | Matching | `src/features/matching/*` | Waiting for extraction |
| 6 | Prashna | `src/screens/PrashnaScreen.tsx` | Extracted; MERGED on `main` @ `a21260d` |
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
