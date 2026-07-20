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
| ✅ **Assignable now (code)** | Daily · Muhurat · Hora/Gochar · Prashna · Matching · Validation · Backend |
| 🔒 **Reserved right now** | Chart + Jyotish (Codex Track 2 wire) · Content-data (Codex Track 1) · Daily/Prashna/Muhurat polish (Claude) |
| ♾️ **Always open** | Research/docs lanes in `plans/` — no file contention, any number of agents |

The single-file bottleneck is **gone**. The shell is down to **3,001 lines** from 6,000+,
and 29 modules are live. What limits parallelism now is reservation overlap, not extraction.

### Wired vs peeled

Two different things, and confusing them causes the "I edited it but nothing changed" bug:

- **Live (29 modules)** — reachable from `src/kundli-app.tsx` through the import graph.
  Editing these changes what users see.
- **Peeled but unwired (12 modules, 1,577 lines)** — the file exists and is committed,
  but *nothing imports it*. Editing these changes nothing until someone wires them.

Currently unwired (all Chart/Jyotish — **Codex Track 2 owns the wire**):

`ChartVault.tsx` · `DashaTree.tsx` · `chart-divisions.ts` · `bhava.ts` · `bhrigu.ts` ·
`classical.ts` · `houses.ts` · `kundli.ts` · `shadbala.ts` · `special-points.ts` ·
`JyotishBnnScreen.tsx` · `RectifyScreen.tsx`

> ⚠️ **Do not "fix" behaviour in an unwired module and call it done.** The app still runs
> the shell's copy. Verify in the browser, not just in the gates.

---

## The board

Status: `MERGED` (extracted + wired) · `Peeled` (module exists, wire pending) ·
`Open` (reservable now) · `Reserved` (someone is on it)

| # | Lane | Files | Status | Who may reserve next |
|---|---|---|---|---|
| 1 | **Daily/Panchang** | `screens/MuhuratHub.tsx` · `screens/CalendarPage.tsx` · `engine/today-panchang.ts` · `engine/search-upcoming.ts` · `data/muhurat-ui.ts` · `components/VratVidhiCard.tsx` | **MERGED** | 🔒 Claude (polish chips A–E) |
| 2 | **Festivals/Vrats** | Data: `data/festival-meta.ts` · `data/vrat-vidhis.ts`<br>Engine: `engine/festivals.ts`<br>UI now lives in Daily's modules | **MERGED** | 🔒 Codex Track 1 (content data) |
| 3 | **Muhurat** | `engine/muhurat.ts` · `engine/panchaka.ts`<br>UI in `screens/MuhuratHub.tsx` | **MERGED** | 🔒 Claude (chips B, C, E) |
| 4 | **Chart** | Wired: `components/DiamondChart.tsx`<br>Peeled: `engine/kundli.ts` · `houses.ts` · `shadbala.ts` · `classical.ts` · `bhava.ts` · `special-points.ts` · `data/chart-divisions.ts` · `components/ChartVault.tsx` · `DashaTree.tsx` | **Peeled** | 🔒 Codex Track 2 (shell wire) |
| 5 | **Matching** | `engine/matching.ts` · `screens/MatchingScreen.tsx` | **MERGED** | ✅ Open |
| 6 | **Prashna** | `screens/PrashnaScreen.tsx` (487 lines) | **MERGED** | 🔒 Claude (chip D) |
| 7 | **Hora/Gochar** | `engine/hora.ts` · `engine/gochar.ts` · `engine/transit-copy.ts`<br>UI in `screens/MuhuratHub.tsx` | **MERGED** | ✅ Open |
| 8 | **Jyotish tools** | Peeled: `engine/bhrigu.ts` · `engine/dasha.ts` (live) · `screens/JyotishBnnScreen.tsx` · `screens/RectifyScreen.tsx` | **Peeled** | 🔒 Codex Track 2 |
| 9 | **Validation** | `validation/*` | Open | ✅ Reservable per-file (name the exact gate file) |
| 10 | **Backend/deployment** | `server/*`, hosting/monitoring config | Open | 🔒 Codex Track 3 (hide Chart + deploy) |

### Shared / integration-owned files (reserve before editing)

| File | Lines | Note |
|---|---|---|
| `src/kundli-app.tsx` | 3,001 | The shell. **Integration-owned.** Was 6,000+ before the split. |
| `src/i18n.ts` | 71 | Bilingual strings + `tr`/`trN`/`obsLabel`. **Add keys; never fork `L`.** |
| `src/components/tokens.ts` | 14 | Design tokens. |
| `src/components/format.ts` | 34 | `fmtDeg`, `fmtTime`, `fmtTimeD`, `fmtDateT`. |
| `src/engine/ephemeris.ts` | 329 | Astronomy + `ascendantAt`. Guarded by parity + calc gates. |
| `src/engine/panchang.ts` | 291 | Tithi/nakshatra/sunrise/ayanamsa, `SIGN_LORD`, `VIM_LORDS`. |
| `src/engine/festivals.ts` | 356 | Festival + day-part selection. |

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
