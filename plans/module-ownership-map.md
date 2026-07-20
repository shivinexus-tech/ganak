# Ganak — Module ownership map (live board)

**This is the live coordination board.** Before editing any code, find your lane
here, confirm the file exists, and reserve it in `plans/task-log.md`.
Superseded: `plans/parallel-agent-brief.md` (historical, single-file era).

Verified against the working tree on 2026-07-19 **after DailyScreen
(`SPLIT-UI-DAILY-SCREEN`)** — shell **143 lines**. Nav-only shell ideal: hit.

---

## Honest status: how many lanes are actually live today

| | Lanes |
|---|---|
| ✅ **Assignable now (code)** | Daily · Muhurat · Hora/Gochar · Prashna · Matching · Chart · Validation · Backend · more content |
| 🔒 **Reserved right now** | Claude privacy (`CLAUDE-LAUNCH-PRIVACY` → shell/fonts) · Codex deploy (`P1-HIDE-DEPLOY`) |
| ♾️ **Always open** | Research/docs lanes in `plans/` — no file contention |

The single-file bottleneck is **resolved**. Shell is **143 lines** (was 6,000+):
theme, lang/screen URL prefs, shared place, hero/nav/footer, compose
`DailyScreen` / `PrashnaScreen` / `ChartScreen`.

### Wired vs peeled

Everything users see is in a module. The shell only composes.

> ⚠️ After a peel, verify the shell imports the module and check the browser —
> gates alone are not enough.

---

## The board

| # | Lane | Files | Status | Who may reserve next |
|---|---|---|---|---|
| 1 | **Daily/Panchang** | DailyScreen, MuhuratHub, CalendarPage, today-panchang, … | **MERGED** | ✅ Open |
| 2 | **Festivals/Vrats** | festival-meta, vrat-vidhis, festivals engine | **MERGED** | ✅ Open for more content |
| 3 | **Muhurat** | muhurat.ts, panchaka.ts; UI in MuhuratHub | **MERGED** | ✅ Open — further perf (lunarMonthInfo cache) optional |
| 4 | **Chart** | ChartScreen + engines/UI | **MERGED** | ✅ Open for panel peels / polish |
| 5 | **Matching** | matching.ts, MatchingScreen | **MERGED** | ✅ Open |
| 6 | **Prashna** | PrashnaScreen | **MERGED** | ✅ Open |
| 7 | **Hora/Gochar** | hora, gochar, transit-copy; UI in MuhuratHub / DailyScreen | **MERGED** | ✅ Open |
| 8 | **Jyotish tools** | bhrigu, dasha, JyotishBnnScreen, RectifyScreen | **MERGED** | ✅ Open for polish |
| 9 | **Validation** | `validation/*` | Open | ✅ Reservable per-file |
| 10 | **Backend/deployment** | `server/*`, hosting | Open | 🔒 Codex on `P1-HIDE-DEPLOY` |

### Shared / integration-owned files (reserve before editing)

| File | Lines | Note |
|---|---|---|
| `src/kundli-app.tsx` | **143** | Shell. 🔒 Claude (`CLAUDE-LAUNCH-PRIVACY` — footer + fonts). Shared `panchPlace` (Prashna + Daily). |
| `src/screens/DailyScreen.tsx` | ~255 | Daily chrome + MuhuratHub + gochar. |
| `src/i18n.ts` | — | Bilingual strings + `tr`/`trN`/`obsLabel`. **Add keys; never fork `L`.** |
| `src/components/tokens.ts` | 14 | Design tokens. |
| `src/components/format.ts` | — | `fmtDeg`, `fmtTime`, `fmtTimeD`, `fmtDateT`. |
| `src/engine/ephemeris.ts` | — | Astronomy + `ascendantAt`. |
| `src/engine/panchang.ts` | — | Tithi/nakshatra/sunrise/ayanamsa, `SIGN_LORD`, `VIM_LORDS`. |
| `src/engine/festivals.ts` | — | Festival + day-part selection. |

---

## Reservation protocol

1. Find your lane above and check the status column.
2. Add a row to `plans/task-log.md` with: ID, agent, branch/worktree, **exact file
   list**, task, status `RESERVED`.
3. Work only inside your listed files. Anything outside needs a new reservation.
4. Finish with gate evidence + a handoff. `REVIEW` → integrator merges → `MERGED`.

**Never** edit an integration-owned file (shell, tokens, i18n, navigation) without an
explicit assignment in the log.

### ⚠️ Failure modes we have actually hit

- **A foreign staged index.** Check `git status` for staged files you did not add
  before committing while someone else is active.
- **Half-committed cross-file move.** A move that changes two files must land in
  *one* commit.
- **Hooks that only fail at runtime.** Browser smoke is not optional.

---

## What unlocks what (remaining)

```
Claude — CLAUDE-LAUNCH-PRIVACY (footer + self-host fonts + server smoke)  ← do this next
Codex  — P1-HIDE-DEPLOY       → Phase-1 public URL
Cursor — CURSOR-MUHURAT-PERF  MERGED (async + 90d scan)
```

Agents needing work *today* and not already reserved should take: Matching (Lane 5),
Validation (Lane 9), more P1 content (Lane 2), Chart panel peels (Lane 4, modules
only — stay off shell while Claude has it), or any `plans/` research.
