# Codex task brief — Phase 1 bundle (content + Chart wire + hide/deploy)

Hand this whole file to Codex. Read `AGENTS.md` and `.cursorrules` first.
Log every slice in `plans/task-log.md` (RESERVED → ACTIVE → MERGED).

**You own tracks 1–3 below.** Claude owns Daily / Prashna / Muhurat polish + docs —
do **not** edit Claude’s files while those rows are ACTIVE (see file lists).

**Cursor is idle** on this bundle unless the owner reassigns.

---

## Hard sequencing (do not parallelize shell work)

| Order | Track | Touches `kundli-app.tsx`? |
|---|---|---|
| **A (now, parallel OK)** | **1 — Content** | No — data/engine/validation/plans only |
| **B (after A started; alone on shell)** | **2 — Chart/Jyotish wire** | **Yes — sole writer on shell** |
| **C (only after 2 is MERGED)** | **3 — Hide Chart tab + deploy** | Yes (tiny hide) + hosting config |

Never start track 3 while track 2 is mid-edit. Content (1) may keep running during 2 and 3.

---

## Track 1 — Panchang content (P1-CONTENT + P1-VRATVIDHI)

**Goal:** Credible Phase 1 festival/fast coverage + sourced vrat vidhis.  
**Not:** Invent ritual text. Sourced only (Drik + second source or named text). Mark `// TODO: source` rather than invent. Owner verifies religious copy.

### Allowed files
- `src/data/festival-meta.ts`
- `src/data/vrat-vidhis.ts`
- `src/engine/festivals.ts` (only if a new observance needs a calc hook)
- `validation/content-dates.cjs` / related anchors
- New research under `plans/` (e.g. extend `plans/drik-gap-analysis.md`, vidhi notes)

### Forbidden while Claude is ACTIVE on polish
- `src/screens/MuhuratHub.tsx`, `CalendarPage.tsx`, `PrashnaScreen.tsx`
- `src/i18n.ts`, `src/engine/panchaka.ts`, `src/engine/muhurat.ts` (unless owner reassigns)

### Method
1. Prefer Tier 1–2 gaps from `plans/backlog.md` §C and `plans/drik-gap-analysis.md`.
2. Each new observance: bilingual name/gloss + 2026 Delhi (or stated) anchor + sources.
3. Each vidhi: bilingual verdict/vidhi/diet/timing; never AI-invented sankalpa/mantra.
4. Run: `content-dates.cjs` + full gate set if you touch engine calc.
5. Commit+push per slice (owner standing policy). One-line status to owner.

### Done when
- Measurable coverage bump (list what you added in the commit message).
- Gates green; no unsourced ritual claims.

---

## Track 2 — Wire Chart / Jyotish peels (SPLIT-UI-CHART wire)

**Goal:** Delete shell copies; import peeled modules. Pure move + fix orphans. Shrink `kundli-app.tsx`.

### Modules already on `main` (wire these)
`src/engine/kundli.ts`, `shadbala.ts`, `varga.ts`, `classical.ts`, `bhrigu.ts`,
`dasha.ts`, `special-points.ts`, `bhava.ts`, `houses.ts`, `gochar.ts`,
`src/screens/JyotishBnnScreen.tsx`, `RectifyScreen.tsx`,
`src/components/DashaTree.tsx`, `ChartVault.tsx`, `DiamondChart.tsx` (already wired),
`MatchingScreen.tsx` (already wired), `src/data/chart-divisions.ts`.

### Allowed files
- `src/kundli-app.tsx` (**exclusive** during this track)
- The module files above (imports / tiny bugfixes only — prefer not to rewrite calc)
- `plans/task-log.md`, a short handoff under `plans/` if needed

### Forbidden
- Daily/Prashna/Muhurat UI modules Claude may be editing
- Content data files Codex track 1 owns (coordinate if both need a shared export)

### Method
1. Reserve `SPLIT-UI-CHART-WIRE` in task-log; confirm no other ACTIVE shell writer.
2. Diff each peeled module vs shell copy before deleting (byte-identical preferred).
3. Import → delete shell copy → parse-check until clean.
4. Fix real bugs the wire exposes (same class as Daily: bare `useState` without import).
5. Gates (always):
   ```bash
   export PATH="/opt/homebrew/bin:$PATH"
   node validation/parse-check.js src/kundli-app.tsx   # + touched modules
   node validation/prashna-parity.js src/screens/PrashnaScreen.tsx
   node validation/prashna-calc.js
   node validation/muhurat-anchors.cjs
   node validation/content-dates.cjs
   npm run build
   ```
6. Browser smoke: cast a chart; Matching; BNN/Rectify if reachable; 0 console errors.
7. Commit+push; mark MERGED; tell owner shell line count before/after.

### Done when
- Shell no longer defines `computeKundli` / Shadbala / BNN UI / Rectify / DashaTree / ChartVault / etc. as local copies.
- Gates + Chart smoke green.

---

## Track 3 — Hide Chart tab + web deploy (Phase 1 launch plumbing)

**Start only after Track 2 is MERGED.**

### 3a Hide birth-chart tab
- In shell nav: Phase 1 shows **Daily + Prashna** only (Muhurat lives inside Daily).
- Chart / Matching / vault entry points not reachable from top nav (code may remain).
- Bilingual: no dead “Chart” tab label left in hi/en.
- Smoke: Daily + Prashna still work; no blank screens.

### 3b Deploy
- Static Vite build → Vercel / Netlify / Cloudflare Pages (free tier).
- Document URL + how to redeploy in a short `plans/` or README note.
- Production smoke on phone if possible.
- Optional follow-ups (separate commits): Sentry free tier, privacy one-pager — ask owner before adding analytics.

### Allowed files
- `src/kundli-app.tsx` (hide only — minimal diff)
- Hosting config (`vercel.json` / `netlify.toml` / etc. as needed)
- `package.json` scripts if needed
- Docs: README / `plans/deploy-notes.md`

### Done when
- Public URL loads Ganak Daily; Chart tab not in Phase 1 nav; owner has the link.

---

## Standing rules
- One writer on `kundli-app.tsx` at a time.
- No `localStorage` / `sessionStorage`.
- Hindu observances only (Buddha Purnima excepted); sourced content.
- Bilingual user-facing strings.
- Evidence before “done” — paste gate output in the commit body or task-log notes.
