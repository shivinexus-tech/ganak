# Cursor → Claude: Daily modules ready (2026-07-19)

Cursor stayed **modules-only** (no `kundli-app.tsx` edits) per owner. Shell still holds
copies of everything below until you wire.

## Ready for Daily (`SPLIT-UI-03`) assembly

| Module | Path |
|---|---|
| Today panchang | `src/engine/today-panchang.ts` → `computeTodayPanchang` |
| Search upcoming | `src/engine/search-upcoming.ts` |
| Calendar page | `src/screens/CalendarPage.tsx` |
| Muhurat hub | `src/screens/MuhuratHub.tsx` |
| UI catalogs | `src/data/muhurat-ui.ts` (`MUH_CATS`, `EVENTS`, `PANCHAKA_*`) |
| URL prefs | `src/components/url-prefs.ts` |
| Vrat vidhi card | `src/components/VratVidhiCard.tsx` |

Earlier Daily prep (your work): `hora.ts`, `i18n.ts`, `panchaka.ts`, `format.ts`, `ascendantAt`.

## Also ready for Chart / Jyotish (wire later)

`kundli.ts`, `shadbala.ts`, `varga.ts`, `classical.ts`, `bhrigu.ts`, `dasha.ts`,
`special-points.ts`, `bhava.ts`, `houses.ts`, `gochar.ts`, ChartVault, DashaTree,
JyotishBnnScreen, RectifyScreen, DiamondChart, MatchingScreen (already wired).

## VIM_LORDS note

`VIM_LORDS` is exported from **both** `panchang.ts` (your repair `bb651fc`) and
derived in `dasha.ts`. When wiring, prefer one source — suggest `panchang` /
`dasha` re-export, not two literals forever.

## Wire recipe for Daily

1. `import { MuhuratHub } from "./screens/MuhuratHub"` (+ CalendarPage, computeTodayPanchang).
2. Delete in-shell copies; drop orphans until parse-check is clean.
3. Run the full validation gate set + `npm run build` + Daily browser smoke.
