# Ganak — Module ownership map (live board)

**This is the live coordination board.** Before editing any code, find your lane
here, confirm the file exists, and reserve it in `plans/task-log.md`.
Superseded: `plans/parallel-agent-brief.md` (historical, single-file era).

Verified against the working tree on 2026-07-19 **after the Daily wire (`3b3b6b2`)** —
file existence and wire status below were computed from the actual import graph, not
assumed.

---

## Honest status: how many lanes are actually live today

| | Lanes |
|---|---|
| ✅ **Assignable now (code)** | Daily · Muhurat · Hora/Gochar · Prashna · Matching · Validation · Backend · more content |
| 🔒 **Reserved right now** | Shell / ChartScreen (`SHELL-FINISH-48H` → Cursor) · Claude no-dep chores (legal/server/places) · Codex Chart panels (modules-only) |
| ♾️ **Always open** | Research/docs lanes in `plans/` — no file contention, any number of agents |

The single-file bottleneck is **mostly gone** but not finished. The shell is
**1,285 lines** (was 6,000+ → 3,001 after Daily → 1,285 after Chart *engine* wire).
What remains is Chart **UI JSX** still inside `KundliApp` — extract to
`ChartScreen.tsx` (see `plans/shell-finish-reassign.md`). Parallelism is limited
by reservation overlap, not by “everything in one file.”

### Wired vs peeled

Two different things, and confusing them causes the "I edited it but nothing changed" bug:

- **Live (wired)** — reachable from `src/kundli-app.tsx` through the import graph.
  Editing these changes what users see. Includes Daily modules **and** Chart/Jyotish
  engines/UI modules wired in `SPLIT-UI-CHART-WIRE` (`kundli`, shadbala, BNN, Rectify,
  ChartVault, DashaTree, etc.).
- **Still in the shell (not a separate screen yet)** — the Chart *tab’s JSX* (~most of
  the 1,285-line file) still lives inside `KundliApp`. That is the next extract
  (`ChartScreen.tsx`), owned by Cursor under `SHELL-FINISH-48H`.

> ⚠️ **Do not "fix" behaviour in a file nothing imports and call it done.** After a
> peel, verify the shell imports the module (or that ChartScreen does) and check the
> browser — gates alone are not enough.

---

## The board

Status: `MERGED` (extracted + wired) · `Open` (reservable) · `Reserved` (someone is on it)

| # | Lane | Files | Status | Who may reserve next |
|---|---|---|---|---|
| 1 | **Daily/Panchang** | MuhuratHub, CalendarPage, today-panchang, search-upcoming, muhurat-ui, VratVidhiCard | **MERGED** | ✅ Open (Claude polish complete) |
| 2 | **Festivals/Vrats** | festival-meta, vrat-vidhis, festivals engine | **MERGED** | ✅ Open for more content (Codex did Diwali/Chhath) |
| 3 | **Muhurat** | muhurat.ts, panchaka.ts; UI in MuhuratHub | **MERGED** | ✅ Open — **perf:** 400-day sync scan (~16.6s) documented in `plans/perf-startup-scan.md` |
| 4 | **Chart** | Engines/UI modules **wired**; Chart tab JSX still in shell | **Partial** | 🔒 Cursor (`SHELL-FINISH-48H` → ChartScreen) |
| 5 | **Matching** | matching.ts, MatchingScreen | **MERGED** | ✅ Open |
| 6 | **Prashna** | PrashnaScreen | **MERGED** | ✅ Open |
| 7 | **Hora/Gochar** | hora, gochar, transit-copy; UI in MuhuratHub | **MERGED** | ✅ Open |
| 8 | **Jyotish tools** | bhrigu, dasha, JyotishBnnScreen, RectifyScreen | **MERGED** (wired) | ✅ Open for polish |
| 9 | **Validation** | `validation/*` | Open | ✅ Reservable per-file |
| 10 | **Backend/deployment** | `server/*`, hosting | Open | Deploy still BLOCKED for Codex; Claude may harden `server/` |

### Shared / integration-owned files (reserve before editing)

| File | Lines | Note |
|---|---|---|
| `src/kundli-app.tsx` | **1,285** | Shell. **Cursor owns** until ChartScreen lands. |
| `src/i18n.ts` | — | Bilingual strings + `tr`/`trN`/`obsLabel`. **Add keys; never fork `L`.** (`tr()` Hindi bug fixed in CHIP-B.) |
| `src/components/tokens.ts` | 14 | Design tokens. |
| `src/components/format.ts` | — | `fmtDeg`, `fmtTime`, `fmtTimeD`, `fmtDateT`. |
| `src/engine/ephemeris.ts` | — | Astronomy + `ascendantAt`. |
| `src/engine/panchang.ts` | — | Tithi/nakshatra/sunrise/ayanamsa, `SIGN_LORD`, `VIM_LORDS`. |
| `src/engine/festivals.ts` | — | Festival + day-part selection. |

---

## Reservation protocol

1. Find your lane above and check the status column. `Peeled` means the wire is someone
   else's job — don't wire it yourself without a reservation.
2. Add a row to `plans/task-log.md` with: ID, agent, branch/worktree, **exact file
   list**, task, status `RESERVED`.
3. Work only inside your listed files. Anything outside needs a new reservation.
4. Finish with gate evidence + a handoff doc. `REVIEW` → integrator merges → `MERGED`.

**Never** edit an integration-owned file (shell, tokens, i18n, navigation) without an
explicit assignment in the log.

### ⚠️ Two failure modes we have actually hit

- **A foreign staged index.** `git commit` writes the *whole index*, not just the paths you passed to `git add`. If another agent left files staged, your commit takes them too — this happened in `7adcda6`. Run `git status` and check for staged files you did not add before committing while someone else is active.
- **Half-committed cross-file move.** A move that changes two files must land in *one*
  commit. `VIM_LORDS` went out of the shell in one agent's commit and into `panchang.ts`
  in another's — `main` did not build until `bb651fc`. Use targeted `git add`, never
  `git add -A`, when another agent is active.
- **Hooks that only fail at runtime.** `CalendarPage` and `VratVidhiCard` used bare
  `useState`/`useMemo` without importing them. Parse-check passed. The build passed.
  Only clicking the UI caught it. **Browser smoke is not optional.**

---

## What unlocks what (remaining)

```
Codex Track 2 — Chart/Jyotish shell wire   ← the last big wire
        ├── makes Lane 4 (Chart) live
        └── makes Lane 8 (Jyotish tools) live
Codex Track 3 — hide Chart tab + deploy    → Phase-1 web launch
```

Everything Daily-side is already wired; the remaining shell work is Chart/Jyotish.

Agents needing work *today* and not already reserved should take: Matching (Lane 5),
Hora/Gochar (Lane 7), Validation (Lane 9), or any `plans/` research.
