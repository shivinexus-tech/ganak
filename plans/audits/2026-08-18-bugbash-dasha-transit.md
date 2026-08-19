# Bug bash — Vimshottari dasha + transits (independent adversarial pass)

- **Date:** 2026-08-18
- **Agent:** independent adversarial test agent (Claude), branch `claude/bugbash-dasha-transit`,
  worktree based on `origin/main` `8752753`.
- **Why this surface:** a dasha table is the practitioner's answer to *when*. Unlike a chart it
  has no visual tell — a wrong table looks exactly as plausible as a right one. Ganak ships
  **106 validation gates and not one of them tests a Vimshottari period.** `ruling-planets.cjs`
  touches `dasha.ts` only for the KP Ruling-Planet strip; nothing anywhere asserts a mahadasha
  start date, an antardasha span, or that the levels tile.
- **Scope:** `src/engine/dasha.ts`, the Vimshottari block of `src/engine/kundli.ts`,
  `src/components/DashaTree.tsx`, the dasha + marriage regions of `src/screens/ChartScreen.tsx`,
  `src/engine/marriage-timing.ts`, `src/engine/gochar.ts`, `src/engine/transit-copy.ts`,
  `src/engine/planet-calendar.ts`, `panchang.ts upcomingEvents`, the transit region of
  `src/screens/DailyScreen.tsx`, `src/engine/search-upcoming.ts`, and the gates
  `validation/ruling-planets.cjs` and `validation/transit-event-language.cjs`.
- **Standing:** READ-ONLY on all product code. Nothing under `src/` or `validation/` was
  modified. This document is the only write. Probe scripts live in `.scratch/bugbash/`
  (gitignored, inside the worktree).
- **Baseline:** `ruling-planets.cjs` and `transit-event-language.cjs` are green before and after
  this pass. **Every finding below is invisible to both, and to all 106 gates.**

## Pass log

| # | Pass | What it probed | How |
|---|------|----------------|-----|
| 1 | Vimshottari arithmetic | Balance of dasha from the Moon's nakshatra fraction; the 120-year cycle; the nine mahadasha lengths; antar/pratyantar/sookshma/prana proportions; **exact tiling** of every level against its parent, four levels deep, all nine lords. | `.scratch/bugbash/p1-vim.cjs` |
| 2 | Boundaries | Nakshatra cusp to the minute; near-zero and near-full balance; the very start/end of the 120-year table; leap day 2000-02-29; a full sweep of the **supported** 1800–2150 birth-year range; two-digit years; determinism including after an ayanamsa switch. | `.scratch/bugbash/p2-bound.cjs`, `p2b-sweep.cjs` |
| 3 | Transits, cross-surface | The same ingress and the same station computed by three independent code paths — `upcomingEvents` (Daily card), `planetGochar` (the expanded panel under that card) and `planet-calendar.ts` (the planet-calendar card) — compared instant by instant across 2026; gochar's "now here" sign vs a direct `planetSidMs` reading for all nine grahas. | `.scratch/bugbash/p3-transit.cjs` |
| 4 | Bilingual + copy | Rendered EN/HI text of the dasha card (maha table, progress bar, five-level strip, antar tree) and the transit card, plus every convention footnote on a transit surface. | `.scratch/bugbash/render-chart.cjs`, source read |
| 5 | Timing claims | `marriage-timing.ts` and the marriage card against `plans/religious-content-policy.md`. | source + probes |

