# Codex task — independent second bug-bash: Jyotish suite (2026-07-26)

**Assigned:** Codex (independent Agent-2 adversarial pass).
**Built by:** Claude Code this session — five REVIEW features listed below.
**Why:** Backlog closure contract — *no item is 100% until at least two different
agents have each spent 30+ focused minutes trying to break the finished feature,
recorded in `plans/task-log.md`.* Claude Code is Agent-1; you are Agent-2. Also
apply the `TEST-STD-CALCULATORS` standard (4–5 recorded test rounds) to the
calculator/finder-style parts.

## Pre-flight (mandatory)
1. `git fetch` and confirm your base matches `origin/main` (a stale base has cost a
   full session before). Tip `ae45dea` or later.
2. Read `plans/task-log.md` — all five rows below are **REVIEW, owned by Claude
   Code**. This is a **testing-only** pass: `src/**` is **read-only** unless the
   owner assigns you the fixes. Do **not** silently rewrite non-trivial defects.
3. Read `plans/module-ownership-map.md`. Don't collide with Cursor's ACTIVE lanes
   (festival hero art, dev-API deploy).

## Scope — what to break (features + task IDs + where)
1. **`CLAUDE-P0-DOSHAS-01`** — Kala Sarpa (12 named types), Pitra Dosha (5 forms +
   causes + remedies), Papa Dosha, Papasamyam. Routes `/calculator/kala-sarpa`,
   `/calculator/pitra-dosha`, `/calculator/papa-dosha`; plus the Kundli `#doshas`
   section and the Papasamyam card in Matching. Engine `src/engine/doshas.ts`,
   content `src/data/dosha-explainers.ts`, gate `validation/doshas.cjs`.
2. **`CLAUDE-P0-CHARTSTYLES-AYAN-01`** — North/South/East chart styles (toggle
   persisted in URL `cstyle`) + ayanamshas Lahiri/Raman/KP/True-Chitra (live
   auto-recast). `src/components/SouthChart.tsx`, `EastChart.tsx`,
   `src/screens/ChartScreen.tsx`, `src/engine/panchang.ts` (AYANAMSA), gate
   `validation/chart-styles-ayanamsha.cjs`.
3. **`CLAUDE-P0-PLANET-CALENDAR-01`** — retrograde/direct + combustion (Asta/Udaya)
   12-month calendar in the Daily gochar area. `src/engine/planet-calendar.ts`,
   `src/components/PlanetCalendarCard.tsx`, gate `validation/planet-calendar.cjs`.
4. **`CLAUDE-P0-MATCHING-DASHAKOOTA-01`** — Dashakoota (10-koota) + marriage-timing
   `#marriage` section. `src/engine/matching.ts`, `src/engine/marriage-timing.ts`,
   `src/screens/MatchingScreen.tsx`, `src/screens/ChartScreen.tsx`, gate
   `validation/dashakoota.cjs`.
5. **`CLAUDE-P0-PDF-PRINT-01`** — browser print-to-PDF ("Save as PDF" on the Kundli
   and Match results). `@media print` in `src/kundli-app.tsx`, gate
   `validation/print-reports.cjs`.

## How to run
- Prod: `https://ganak.pages.dev` (deep-links above). Also run a local dev server
  for iteration. Test **EN and HI** at desktop **and 320–390px phone width**.
- Baseline every gate first: `node validation/{doshas,chart-styles-ayanamsha,planet-calendar,dashakoota,print-reports,jyotish-panel-exposure,utility-calculators}.cjs` + `npm run build`. Note anything already red (5 pre-existing fails belong to Cursor's festival-hero-art lane — not this scope).

## Adversarial matrix (per feature — aim to actually break it)
**Correctness / astrology**
- Cross-check a few dosha/koota/station outputs against an independent site or a
  known chart. Kala Sarpa named type vs Rahu house; Pitra "form fired" vs the
  actual placement; Papasamyam totals both directions; Dashakoota Rajju/Vedha
  hard-blocks (feed a same-rajju and a vedha-pair birth pair and confirm 0 points);
  Mercury-retrograde dates in the planet calendar vs reality; ayanamsha shift
  magnitudes (Raman ≈ +1°28′, KP ≈ +6′, True-Chitra ≈ Lahiri).
- East chart: verify the **Bengali convention** (Rashi-fixed, Aries top-centre,
  anti-clockwise) — this used web sources; confirm planet compartments are right
  for a known chart. Flag if a regional variant differs.
**Interaction (TEST-STD-CALCULATORS — 4–5 rounds)**
- Re-calculate after **every** input change (date, time, place, language, 2nd
  person); confirm stale results clear and nothing silently keeps old coords.
- Unconfirmed/blank/typo place guard; boundary + invalid inputs; leading zeros.
- Chart-style toggle + ayanamsha switch persist across reload / URL share / Back.
- Ayanamsha auto-recast (`#marriage`, doshas, chart all update live).
**Presentation / i18n / a11y**
- No horizontal overflow at 320/375/390px anywhere. No English leaking into Hindi
  (rashi/nakshatra/planet/koota names) — log leaks against `I18N-DEVANAGARI-TERMS`.
- Print-to-PDF: actually run **File→Print / Save as PDF** in a real browser (this
  is the one thing automation can't do) — confirm the Kundli and Match reports
  print cleanly (chrome hidden, chart + tables legible, print-only header shows,
  collapsibles expanded, no clipped/blank pages), EN and HI.
- Console must be error-free through all of the above.

## Deliverables
- Findings file `plans/codex-bugbash-jyotish-suite-results.md`: one row per finding
  with **severity (P0/P1/P2/P3)**, feature/route, exact repro steps, expected vs
  actual, and screen size/lang. Rank most-severe first.
- A `CODEX-BUGBASH-JYOTISH-01` row in `plans/task-log.md` recording time spent,
  gates re-run, prod/local coverage, and the findings summary.
- Do **not** fix non-trivial defects — hand P0/P1 back to the Claude Code rows
  above (or to the owner). Trivial copy/typo fixes may be applied if the owner ok's
  editing those files; otherwise report only.
- End with the honest verdict: which of the five are safe to call 100% after owner
  live sign-off, and which need a fix round first.
