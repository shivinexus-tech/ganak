# Ganak — Module ownership map (live board)

**This is the live coordination board.** Before editing any code, find your lane
here, confirm the file exists, and reserve it in `plans/task-log.md`.
Superseded: `plans/parallel-agent-brief.md` (historical, single-file era).

Verified against the working tree on 2026-07-19 — file existence below is real,
not aspirational.

---

## Honest status: how many lanes are actually live today

Ten lanes are *planned*; **not all are assignable yet** — a lane only opens when its
files exist. Right now:

| | Lanes |
|---|---|
| ✅ **Assignable now (code)** | Prashna · Validation · Backend/deployment · **Content-data** |
| 🟡 **Partially open** | Festivals/Vrats and Muhurat — their **engine/data** layers exist, but the **UI** is still inside the shell |
| ⛔ **Waiting on extraction** | Daily · Chart · Matching · Hora/Gochar · Jyotish tools |
| ♾️ **Always open** | Research/docs lanes in `plans/` — no file contention, any number of agents |

**So: ~4 code lanes + unlimited docs lanes today**, growing with each UI slice. The
constraint is extraction progress, not agent availability.

---

## The board

Status: `MERGED` (extracted + integrated) · `Partial` (engine/data out, UI not) ·
`Waiting` (still inside `kundli-app.tsx`) · `Open` (exists, reservable now)

| # | Lane | Files | Exists? | Status | Who may reserve next |
|---|---|---|---|---|---|
| 1 | **Daily/Panchang** | Modules ready: `MuhuratHub.tsx`, `CalendarPage.tsx`, `today-panchang.ts`, `search-upcoming.ts`, `muhurat-ui.ts` (Cursor peels). `DailyScreen.tsx` shell still TBD | Partial | Waiting on **wire** into `kundli-app.tsx` | See `plans/cursor-handoff-daily-ready.md` |
| 2 | **Festivals/Vrats** | UI: `src/features/festivals/*` ❌ TBD<br>Data: `src/data/festival-meta.ts` ✅, `src/data/vrat-vidhis.ts` ✅<br>Engine: `src/engine/festivals.ts` ✅ | Partial | Partial | **Content agent may take the two `src/data/` files now.** UI waits for SPLIT-UI-04 |
| 3 | **Muhurat** | UI: `src/features/muhurat/*` ❌ TBD<br>Engine: `src/engine/muhurat.ts` ✅ | Partial | Partial | Engine reservable for fixes; UI waits for SPLIT-UI-05 |
| 4 | **Chart** | `src/screens/ChartScreen.tsx` + chart components | ❌ TBD | Waiting | After Daily slice |
| 5 | **Matching** | `src/features/matching/*` | ❌ TBD | Waiting | After Chart slice |
| 6 | **Prashna** | `src/screens/PrashnaScreen.tsx` ✅ (487 lines) | ✅ | **MERGED** | ✅ **Open now** — any agent, exclusive |
| 7 | **Hora/Gochar** | Engine: `src/engine/hora.ts` ✅<br>UI: `src/features/hora/*`, `src/features/gochar/*` ❌ TBD | Partial | **Hora engine reservable now** (SPLIT-UI-03a). UI waits for Daily slice |
| 8 | **Jyotish tools** | `src/features/jyotish-tools/*` (KP, BNN, Bhrigu, rectification) | ❌ TBD | Waiting | Last UI slice |
| 9 | **Validation** | `validation/*` | ✅ | Open | ✅ Reservable per-file (name the exact gate file) |
| 10 | **Backend/deployment** | `server/*`, hosting/monitoring config | ✅ | Open | ✅ **Open now** — fully independent of `src/` |

### Extracted shared modules (integration-owned — reserve before editing)

| File | Lines | Note |
|---|---|---|
| `src/kundli-app.tsx` | 4,460 | The shell. **Integration-owned.** Every UI slice shrinks it. |
| `src/engine/ephemeris.ts` | 319 | Astronomy. Guarded by parity + calc gates. |
| `src/engine/panchang.ts` | 284 | Tithi/nakshatra/sunrise/ayanamsa. |
| `src/engine/festivals.ts` | 356 | Festival + day-part selection. |
| `src/engine/muhurat.ts` | 323 | Muhurat scoring/shuddhi. |
| `src/engine/panchaka.ts` | 62 | Lagna schedule + Panchaka windows. Extracted SPLIT-UI-03c. |
| `src/engine/hora.ts` | 199 | Planetary hours + hora advisor. Extracted SPLIT-UI-03a. |
| `src/i18n.ts` | 71 | Bilingual strings + `tr`/`trN`/`obsLabel`. **Shared, integration-owned** — add strings, never fork. |
| `src/components/tokens.ts` | 14 | Design tokens — **shared, integration-owned.** |
| `src/components/format.ts` | 23 | `fmtDeg`, `fmtTime`, `fmtTimeD` — shared. |
| `src/components/PlaceInput.tsx` | 72 | Shared place search UI. |
| `src/data/places.ts` | 43 | Gazetteer. |

---

## ⚠️ Hazard: duplicate Prashna files

The working tree contains **two** Prashna files with nearly identical names:

- ✅ `src/screens/PrashnaScreen.tsx` — **the live module** (487 lines, imported by the shell)
- ⛔ `src/PrashnaScreen.jsx` — **stale**, the original 2026-07-16 handoff artifact, not imported by anything

Also stale: `src/kundli-app.tsx.backup-before-prashna`.

**Risk:** a Prashna-lane agent could edit the wrong file, pass its own review, and
change nothing the app renders. Recommend the integration owner delete both stale
files in the next `src/` slice. (Not done here — this task is forbidden from `src/`.)

---

## Reservation protocol

1. Find your lane above; confirm **Exists? = ✅**. If ❌ TBD, the lane isn't open — ask
   for the extraction slice first.
2. Add a row to `plans/task-log.md` with: ID, agent, branch/worktree, **exact file
   list**, task, status `RESERVED`.
3. Work only inside your listed files. Anything outside needs a new reservation.
4. Finish with gate evidence + a handoff doc. `REVIEW` → integrator merges → `MERGED`.

**Never** edit an integration-owned file (shell, tokens, navigation) without an
explicit assignment in the log.

---

## Dependency order (what unlocks what)

```
SPLIT-UI-03 Daily/Panchang shell   ← the big unlock
        ├── opens Lane 1 (Daily)
        ├── opens Lane 7 (Hora/Gochar — they live in Daily today)
        └── makes Lanes 2 & 3 UI extractable
SPLIT-UI-04 Festivals/Vrats UI     → fully opens Lane 2
SPLIT-UI-05 Muhurat + Hora UI      → fully opens Lane 3
SPLIT-UI-06 Chart form + chart UI  → opens Lane 4, then 5 and 8
```

**Daily is the highest-leverage next slice** — it's the largest remaining block in
the shell and it gates three lanes.

Meanwhile, agents needing work *today* should take: Content-data (Lane 2 data files),
Backend (Lane 10), Validation (Lane 9), Prashna (Lane 6), or any `plans/` research.
