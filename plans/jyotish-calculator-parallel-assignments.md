# Jyotish/calculator parallel assignments — backlog #33–#36

Created: 2026-07-28
Purpose: make the overlapping Jyotish/calculator backlog items safely assignable to
multiple agents without file collisions.

## Why this split exists

Rows #33–#36 are partly built already. The risk is not “no code exists”; the risk is
that a vague assignment like “work on Jyotish calculators” sends multiple agents
into the same shared files:

- `src/screens/UtilityCalculatorScreen.tsx`
- `src/engine/utility-calculators.ts`
- `src/screens/ChartScreen.tsx`
- `src/engine/dasha.ts`

So Wave 1 separates research/engine/proof/presentation work into non-overlapping
files. Wave 2 is a single integration pass that wires approved outputs into shared
screens.

## Wave 1 — parallel-safe assignments

| Backlog | Task ID | Suggested agent | Exact owned files | Do not touch |
|---|---|---|---|---|
| #33 Sade Sati calculator/report | `CODEX-P0-SADE-SATI-REPORT-33` | Codex | `plans/research/sade-sati-report-rules.md` (new), `src/engine/sade-sati-report.ts` (new), `src/data/sade-sati-report.ts` (new), `validation/sade-sati-report.cjs` (new), task-log row only | `src/screens/UtilityCalculatorScreen.tsx`, `src/engine/utility-calculators.ts`, `src/data/utility-calculators.ts`, `src/screens/ChartScreen.tsx` |
| #34 Mangal Dosha three-reference analysis | `CLAUDE-P0-MANGAL-THREE-REF-34` | Claude Code | `plans/research/mangal-dosha-three-reference.md` (new), `src/engine/mangal-dosha.ts` (new), `src/data/mangal-dosha-report.ts` (new), `validation/mangal-dosha.cjs` (new), task-log row only | `src/screens/UtilityCalculatorScreen.tsx`, `src/engine/utility-calculators.ts`, `src/data/utility-calculators.ts`, `src/data/dosha-explainers.ts`, `src/screens/ChartScreen.tsx` |
| #35 Arudha, Bhavabala, Special Lagnas/Upagrahas | `CURSOR-P0-ARUDHA-BHAVA-SPECIAL-35` | Cursor | `plans/research/arudha-bhava-special-presentation.md` (new), `src/screens/ChartScreen.tsx` only in the `#arudha`, `#chalit`, `#special` sections, `validation/jyotish-special-panels.cjs` (new), task-log row only | calculator files, `src/engine/classical.ts`, `src/engine/bhava.ts`, `src/engine/special-points.ts`, `src/engine/dasha.ts`, shared nav unless separately reserved |
| #36 Ruling Planets | `CODEX-P0-RULING-PLANETS-RULEMAP-36` | Codex | `plans/research/ruling-planets-ksk-rule-map.md` (new), `src/engine/dasha.ts` only around `computeRulingPlanets`/KP exports, `validation/ruling-planets.cjs` (new), task-log row only | `src/screens/ChartScreen.tsx`, `src/screens/PrashnaScreen.tsx`, `src/engine/kp-horary.ts`, calculator files |

## Wave 2 — single integration pass after Wave 1 review

Task ID: `INTEGRATOR-P0-JYOTISH-CALC-WIRE-33-36`

Owned files should be reserved only after all Wave 1 tasks are in `REVIEW`:

- `src/screens/UtilityCalculatorScreen.tsx`
- `src/engine/utility-calculators.ts`
- `src/data/utility-calculators.ts`
- `src/screens/ChartScreen.tsx`
- `src/components/JyotishPanelNav.tsx`
- relevant validation gates from Wave 1

Integrator responsibilities:

1. Wire the new Sade Sati report into `/calculator/sade-sati`.
2. Wire the approved Mangal Dosha report into `/calculator/mangal-dosha`.
3. Merge the #35 Jyotish panel copy/presentation without overwriting other Chart work.
4. Add the #36 Ruling Planets explanation/ranking only after the KSK rule map is
   accepted.
5. Run the universal gates plus all new gates.
6. Update `plans/backlog-acceptance-register.md`, `plans/backlog-sheet-sync.json`,
   `plans/task-log.md`, then Sheet sync checks.

## Gate expectations

Minimum gates before each Wave 1 task can move to `REVIEW`:

- New feature-specific gate passes.
- `node validation/parse-check.js src/kundli-app.tsx`
- `npm run build`

Additional gates:

- #33/#34: `node validation/utility-calculators.cjs`
- #35/#36: `node validation/jyotish-panel-exposure.cjs` if navigation or panel
  exposure changes in the integration pass.

Do not mark any row 100% until live/production verification and the required owner
review/bug-bash evidence are recorded.
