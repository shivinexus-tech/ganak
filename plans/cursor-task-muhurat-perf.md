# Cursor — MuhuratHub startup perf

**ID:** `CURSOR-MUHURAT-PERF`  
**Agent:** Cursor  
**Status:** ACTIVE  
**Owner assigned:** 2026-07-19

Claude’s Chip F measured a **16.6 s** sync 400-day `scanPanchangCalendar` inside
`MuhuratHub` `useMemo` on every Daily load. Proposals in `plans/perf-startup-scan.md`.
This task ships the cheapest safe wins.

---

## Goal

Daily first paint must not freeze ~16 s. Keep the fasts/festivals list useful
(still shows top ~10). Full-year calendar stays behind its own click.

## Exclusive files

| Path | Role |
|---|---|
| `src/screens/MuhuratHub.tsx` | Move scan off critical path; shorten window |
| `plans/perf-startup-scan.md` | Note what shipped vs still proposed |
| `plans/task-log.md` / ownership / backlog | Reservation + evidence |

**Stay off:** shell (`kundli-app.tsx` — Claude’s privacy task), `server/**`, Chart.

## Implementation (locked)

1. **Async scan** — replace sync `useMemo(…400…)` with state + `useEffect` (or
   `setTimeout(0)` / chunked yield). Paint the rest of Daily first; show a short
   bilingual “scanning…” line in the Fasts & festivals card until results land.
2. **Window 400 → 90 days** — UI already `.slice(0, 10)`; CalendarPage owns the
   full year. Cap stays 46. Document the trade-off in the perf note.
3. Do **not** invent lunar-month Hindi; do **not** change muhurat finder scoring.

Optional follow-up (out of scope unless free): memoize `lunarMonthInfo` in
`festivals.ts` — only if (1)+(2) still leave >2 s and you reserve that file.

## Gates

Full set + build. Browser: Daily loads without multi-second freeze; list fills;
Vaishnava toggle still works; 0 console errors.

## Done when

- [ ] Sync 400-day `useMemo` gone
- [ ] Perceived startup ≪ 16 s (measure and paste)
- [ ] Gates green; commit+push
