# Handoff — wire Matching extract (SPLIT-UI-MATCH-01)

**Status:** new modules ready; **shell not wired** (Claude Code owns `kundli-app.tsx` for i18n).

## Already created
- `src/engine/matching.ts` — Ashtakoota tables + `gunaMilan` + `computeMatch(computeKundli, boy, girl)`
- `src/screens/MatchingScreen.tsx` — `DoshaCard`, `MatchPerson`, `MatchMaker` (needs `computeKundli` prop)

## Wire steps (integrator / Cursor after i18n MERGED)
1. Confirm Claude’s `src/i18n.ts` is committed and shell is free.
2. In `src/kundli-app.tsx`:
   - `import MatchMaker from "./screens/MatchingScreen";`
   - Delete the Ashtakoota block (`/* Ashtakoota…` through `computeMatch`) and the
     UI block (`DoshaCard` / `MatchPerson` / `MatchMaker`).
   - Leave shell `NF` in place until Shadbala extracts (matching has its own copy).
   - Replace `<MatchMaker C={C} card={card} />` with
     `<MatchMaker C={C} card={card} computeKundli={computeKundli} />`.
3. Run all gates + build; Matching tab smoke (run a sample match).
4. Mark SPLIT-UI-MATCH-01 **MERGED**; update ownership map Lane 5.

## Do not
- Edit shell while Claude’s i18n is uncommitted.
- Delete shell `NF` yet (Shadbala still uses it).
