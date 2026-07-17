# Plan: Prashna Chart (Horary) — integration into kundli-app.jsx

**Status entering this plan:** research, engine, and UI are DONE and validated.
This plan covers integration only (Task 4) plus release (Task 5).

## Goal
User taps a question category → chart is cast for this exact moment and place →
a plain-language verdict card appears FIRST (answer-before-data), with the full
Prashna chart one tap below. No birth data required.

## What already exists (do not rebuild)
- `validation/prashna-calc.js` — standalone engine. 24/24 self-tests against Drik
  Panchang anchors (`node validation/prashna-calc.js`).
- `src/PrashnaScreen.jsx` — the finished component. Contains an inlined copy of
  the same engine, bracketed by two marker comments. TSX-clean, no orphans,
  no browser storage.
- `validation/parse-check.js` — syntax + duplicate + orphan + storage + cutBlock gate.
- `validation/prashna-parity.js` — proves the inlined engine == the validated engine.

## Global constraints
See CLAUDE.md. Single file. cutBlock registration. No browser storage.
Validate after every structural edit. Complete fixes only — never partial.

---

## Task 1 — Baseline the gates before touching anything
```bash
npm i -D typescript
node validation/prashna-calc.js                     # expect: ALL TESTS PASSED (24/24)
node validation/parse-check.js src/PrashnaScreen.jsx # expect: ✓ clean
node validation/prashna-parity.js src/PrashnaScreen.jsx # expect: ✓ parity EXACT
node validation/parse-check.js kundli-app.jsx        # baseline the app AS-IS
```
If the last command reports pre-existing issues, **stop and report them** — do not
fix them inside this plan, and do not start the splice on a red baseline.

**Done when:** the first three pass, and the app's baseline state is known.

---

## Task 2 — Collision audit (READ ONLY — write no code yet)
The app already computes astronomy. Find every overlap before merging anything:
```bash
grep -nE 'ayanamsa|ayanamsha|lahiri|julian|jd(UT|TT)|sidereal|nutation|obliquity' kundli-app.jsx
grep -nE 'function .*(sun|moon|Sun|Moon)Long|nakshatra|subLord|sub_lord|tithi' kundli-app.jsx
grep -nE 'PR_|PrashnaScreen|QUESTIONS|GRAHA|RASHI_|SIGN_LORD|NAK_EN|DASHA_YRS' kundli-app.jsx
```
The third grep matters most: the component declares `QUESTIONS`, `GRAHA`, `RASHI_EN`,
`RASHI_HI`, `SIGN_LORD`, `NAK_EN`, `GRAHA_EN`, `GRAHA_HI`, `DASHA_YRS` at top level.
**If any of those names already exist in kundli-app.jsx, they will become duplicate
top-level definitions and parse-check will fail the build.**

Resolution rule:
- Name exists and the app's version is **equivalent** → delete the copy from the
  pasted engine and use the app's.
- Name exists but the app's version **differs** (different order, different content)
  → rename the incoming one with a `PR_` prefix (e.g. `PR_RASHI_EN`) and update its
  references inside the Prashna block only. Do not modify the app's version.

**Done when:** you have a written list of every colliding name and its resolution.
Report the list before proceeding.

---

## Task 3 — Splice
1. Paste the whole `ENGINE (validated)` … `END ENGINE` block from `PrashnaScreen.jsx`
   into kundli-app.jsx, **keeping both marker comments byte-for-byte** — `prashna-parity.js`
   locates the block by those markers and fails loudly if they're gone.
2. Paste `SecHead` (rename if the app already has one), `Gloss`, `Chip`, `buildReasons`,
   `VERDICT_STYLE`, `HOUSE_MEANING`, and `PrashnaScreen` — converting
   `export default function PrashnaScreen` to `function PrashnaScreen`, since the app
   has its own default export.
3. Apply every resolution from Task 2.
4. Replace the local `TOKENS` object with the app's existing style constants. The
   canonical values it must land on: 42px control height, 11px radius, SecHead
   bilingual headers.
5. Wire `lat` / `lon` / `placeLabel` from the app's existing location state.
6. Register `PrashnaScreen` (and any new sub-components) in the cutBlock list in
   `validation/build-engine.js`.
7. Add the nav entry / route so the screen is reachable.

**Done when:** all of the above are applied. Do not declare done before Task 4 passes.

---

## Task 4 — Gate (this is the definition of done)
```bash
node validation/parse-check.js kundli-app.jsx     # syntax, duplicates, orphans, storage, cutBlock
node validation/prashna-parity.js kundli-app.jsx  # inlined engine still == validated engine
node validation/ui-lint.js                        # control-style drift
node validation/prashna-calc.js                   # engine self-tests still green
```
All four must pass. If parity fails after a dedupe in Task 2, that means the app's
astronomy and the validated engine **disagree** — that is a real finding, not a
nuisance. Stop, print the numeric difference, and report it: one of the two is wrong,
and it matters for every other screen in the app, not just Prashna.

**Done when:** four green checks, pasted as evidence. No "should work" claims.

---

## Task 5 — Phone smoke test (no console available — errors must be visible in-app)
Walk these by hand:
- Tap each of the 12 question chips → verdict card renders, no blank screen.
- Verdict card appears **above** the chart data, never below.
- "Full Prashna chart" expands and collapses.
- Ask the same question twice a minute apart → Lagna degree advances (chart is live,
  not frozen).
- Airplane mode → still works (engine is fully local, zero network).

**Done when:** all five pass on device.

---

## Known limitations to carry into beta QA (do not silently "fix")
- **Jupiter/Saturn ~3–10 arcmin.** Unperturbed Kepler elements. Sign and nakshatra are
  safe; a sub-lord boundary flip is possible when either sits within ~10' of a sub
  boundary. If Prashna verdicts ever need to be exact to the arcsecond, the upgrade
  path is VSOP87 truncated series or a Swiss Ephemeris WASM build — a deliberate
  scope decision, not a bug fix to sneak in here.
- **Verdict is significator-based, not dasha-timed.** v1 answers "will it?" — not
  "when?". Ruling-planet timing is a v2 feature. Do not fake a timing answer.
- **Above 60° latitude** Placidus degenerates and the engine falls back to equal
  houses. This is labelled in the UI. Correct behaviour, not a defect.
