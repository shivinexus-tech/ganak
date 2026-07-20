# Status + reassignment — shell finish sprint (2026-07-19 ~23:00 PT)

Agents stopped. This is **assigned vs delivered**, **pending**, and **who does what next**.

---

## 1. Assigned vs delivered

### Claude (`plans/claude-task-daily-prashna-polish.md`)

| Chip | Status | Evidence |
|---|---|---|
| Housekeeping / ownership map | Done | `ac68da5` |
| A — zero-length panchaka | **MERGED** | `7adcda6` |
| B — E-0.7 / `tr()` Hindi | **MERGED** | `6f611f5` (root cause was `tr()` itself) |
| C — muhurat factors bilingual | **MERGED** | `f9fb686` (§5 skip-reasons; §4 already done) |
| D — Prashna messaging | **MERGED (no-op)** | Already fixed earlier; verified |
| E — dead Anthropic path | **MERGED (no-op)** | Already removed; verified |
| F — startup scan profile | **MERGED (docs)** | `deb6af9` → `plans/perf-startup-scan.md` |
| Incident log | Noted | `d7c4395` (swept Codex staged files — lesson recorded) |

**Claude brief: effectively complete.** One leftover noted under Chip C (not invented): Hindi lunar-month names in Chaturmas blockers (`info.lmonthName`).

### Codex (`plans/codex-task-phase1-bundle.md`)

| Track | Status | Evidence |
|---|---|---|
| 1 — Content (Diwali + Chhath) | **MERGED** | `6aca6b8` + `plans/phase1-content-diwali-chhath.md` |
| 2 — Chart/Jyotish wire | **MERGED** | Shell **3,001 → 1,285**; engines/UI imports; task-log `SPLIT-UI-CHART-WIRE` |
| 3a — Hide Chart tab | **Done locally, not cleanly finished** | Working-tree diff removes Chart from nav; task-log says gates green |
| 3b — Deploy | **BLOCKED** | **Codex usage quota** exhausted (owner correction — not git). Browser profile also blocks Vercel/Netlify/Cloudflare. |

**Codex brief: Tracks 1–2 done. Track 3 incomplete (hide uncommitted / deploy blocked).**

### Cursor
Idle since briefs; peeled engines earlier (now wired by Codex).

---

## 2. Pending items (from old briefs + shell goal)

| # | Item | Blocker |
|---|---|---|
| P1 | **Commit + push Chart-hide** (Daily+Prashna nav only) | Codex stopped on **usage quota**; Cursor can commit hide with ChartScreen |
| P2 | **Web deploy** (Vercel/Netlify/CF) | Needs Codex (or owner) when quota resets + host allowlist; not Cursor-blocked by git |
| P3 | **Extract `ChartScreen.tsx`** — ~1,200 lines of Chart UI still inside `KundliApp` | Needs sole shell writer (the 48h finish line) |
| P4 | Trim shell to nav+compose (~250–400 lines) | After P3 |
| P5 | Chip C leftover: Hindi lunar-month table | Needs sourced month names (not invent) |
| P6 | Perf cheap-wins from `plans/perf-startup-scan.md` | Owner pick; touches Daily/MuhuratHub if shipped |
| P7 | More Phase-1 content beyond Diwali/Chhath | Ongoing; not shell-critical |
| P8 | Mark `CLAUDE-DAILY-POLISH` / `CODEX-P1-BUNDLE` / `P1-HIDE-DEPLOY` correctly in task-log | Docs |

---

## 3. New assignments (shell-finish sprint)

**Goal:** single-file bottleneck gone by tomorrow = thin shell + `ChartScreen`.  
**Rule:** one writer on `src/kundli-app.tsx` at a time.

### Cursor — integrator (sole shell writer)
**Owns:** `src/kundli-app.tsx` exclusively until ChartScreen is MERGED.

1. Commit/push any outstanding Chart-hide diff if still uncommitted (or fold hide into ChartScreen PR).
2. Extract **`src/screens/ChartScreen.tsx`** (pure move of Chart-mode JSX + state it needs via props/`chartCtx`).
3. Shell left with: theme, URL prefs, mode tabs (Daily/Prashna [+ Chart if owner wants it visible again later]), compose `<MuhuratHub/>` / `<PrashnaScreen/>` / `<ChartScreen/>`.
4. Full gates + browser smoke (Daily, Prashna, cast chart path even if tab hidden — e.g. temp or direct).
5. Target: shell **&lt; 400 lines**. Mark EPIC-UI-SPLIT Chart items done in backlog/task-log.

**Do not:** content festivals, deploy hosting, Muhurat polish.

### Codex — modules-only Chart panels (no shell) + content when idle
**Forbidden while Cursor ACTIVE on shell:** `src/kundli-app.tsx`.

1. **First (parallel with Cursor):** peel Chart subsections into new files (copy from current shell Chart JSX; do not delete from shell — Cursor deletes when wiring):
   - e.g. `src/components/chart/ShadbalaPanel.tsx`, `YogasPanel.tsx`, `KPPanel.tsx`, `GrahasTable.tsx` (names flexible)
2. Parse-check each; commit+push; short note in task-log.
3. **When Cursor’s ChartScreen MERGED:** optional more **P1-CONTENT** (next festival cluster) — data files only.
4. **Deploy:** only when Codex quota resets and owner unblocks hosting; then finish `P1-HIDE-DEPLOY` docs + public URL.

### Claude — short tedious work, **zero dependency** on Cursor/Codex shell race
**Forbidden:** `src/kundli-app.tsx`, Chart panel files Codex is peeling, festival content files Codex may extend.

Pick in order (stop when Cursor says shell is free if you need Daily files):

| Priority | Task | Files | Why no dep |
|---|---|---|---|
| **1** | **Privacy / terms draft** for Phase-1 launch | New `plans/legal-privacy-terms-draft.md` only | Docs only |
| **2** | **Harden `server/` proxy** (README, rate limit, `.env.example`, safe errors) | `server/**` only | Separate tree |
| **3** | **Expand gazetteer** (diaspora cities) | `src/data/places.ts` only | Tiny, shared later |
| **4** *(optional)* | Sourced Hindi **lunar month** name table for Chip C leftover | `src/engine/muhurat.ts` + cite sources in commit | After 1–3; avoid if Codex touches muhurat |

**Do not start** perf behaviour changes in MuhuratHub until shell sprint ends (collides with Daily lane).

---

## 4. Paste lines for each agent

**Cursor:**  
> You are sole writer on `src/kundli-app.tsx`. Extract `ChartScreen.tsx`, leave shell as nav+compose (&lt;400 lines). See `plans/shell-finish-reassign.md`. Commit hide-chart if still dirty. Gates + smoke required.

**Codex:**  
> Stay off `kundli-app.tsx`. Peel Chart UI panels into `src/components/chart/*` (modules-only). When Cursor merges ChartScreen, resume content or deploy if owner unblocks host. See `plans/shell-finish-reassign.md`.

**Claude:**  
> Your Daily polish brief is done. Next: (1) `plans/legal-privacy-terms-draft.md`, then (2) harden `server/`, then (3) expand `src/data/places.ts`. No shell, no Chart panels, no festival-meta. See `plans/shell-finish-reassign.md`.

---

## 5. Success check (tomorrow)

- [ ] `wc -l src/kundli-app.tsx` → under ~400  
- [ ] `src/screens/ChartScreen.tsx` exists and is what renders Chart  
- [ ] Gates green on `main`  
- [ ] Claude delivered at least legal draft + server harden or places expand  
- [ ] Deploy still may be BLOCKED — OK; not part of “single-file resolved”
