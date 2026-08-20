# Retiring duplicate implementations — one quantity, one place

- **Date:** 2026-08-19
- **Agent:** Claude (dedupe lane)
- **Branch / worktree:** `claude/retire-duplicate-implementations` · `.scratch/worktrees/dedupe`
- **Base:** `origin/main` `2e917bd`, plus the two lanes this work directly follows on from
  (see "Base" below).

---

## The problem in one sentence, for the owner

Ganak has been computing **the same thing in more than one place**. The copies were typed out
separately, so when somebody corrected one, the others kept the old answer — and two screens then
told the reader two different things about the same moment. Two days of adversarial testing produced
about ninety findings and this single cause is behind the worst of them. This lane deletes copies
rather than trying to keep them in step.

---

## Base — why this branch merged two other branches before starting

The work list for this lane assumes two fixes that had **not reached `main`** when it started:

| branch merged | what it carries |
|---|---|
| `origin/claude/fix-polar-quadrant` | `risingDegree` in `houses.ts` — the corrected rising degree the chart now uses, plus `validation/polar-chart.cjs` |
| `origin/claude/cross-surface-consistency` | `validation/cross-surface-consistency.cjs` — the gate whose pins this lane is asked to move |

Without them there is no `risingDegree` to call and no pins to update. Both merged cleanly, touch
disjoint files, and were already reviewed on their own lanes. `origin/main` was verified identical to
this branch's starting point (`2e917bd`) before the merges, so nothing was skipped.

---

## Item 1 — `ephemeris.ts` `ascendantAt`: a live 180° disagreement, now closed

### What was being calculated twice

"Which degree of the zodiac is rising on the eastern horizon right now" — the **lagna**, the single
most load-bearing number in a birth chart. It was written out three times: once in the chart engine,
once in the horary screen, and once in `ephemeris.ts`. The chart's copy was corrected on 2026-08-19
for a polar bug; `ephemeris.ts`'s copy was not.

That copy is not a backwater. It feeds:

- **Gulika and Mandi** — inside *every* birth chart Ganak draws
- the **KP birth-time rectification** markers
- **Panchaka** windows, **Navratri** Ghatasthapana timings, and the **Muhurat hub**

So for one day Ganak answered the same question two ways: the chart's lagna and `ascendantAt` were
**exactly 180° apart** — the opposite point of the sky — in 87 of 384 sampled polar hours.

### Reproduced before changing anything

`.scratch/dedupe/neighbours.cjs` (the polar lane's own measurement script, re-run unchanged on this
tree). The reference it checks against re-derives "rising" from published spherical astronomy — it
does not ask Ganak.

```
1. src/engine/ephemeris.ts  ascendantAt()
   polar hours sampled 384, returning the DESCENDANT: 88 (22.9%)

2. The same app now answers the same question two ways at polar latitudes:
   87 of 384 polar hours where kundli.ts and ephemeris.ascendantAt differ by 180°
      Tromso 2026-6-21 00:00Z  chart lagna Cap  8°32'  |  ephemeris.ascendantAt Can  8°32'  Δ 180.00°
      Tromso 2026-6-21 21:00Z  chart lagna Tau  6°19'  |  ephemeris.ascendantAt Sco  6°19'  Δ 180.00°
      Tromso 2026-6-21 22:00Z  chart lagna Ari 23°40'  |  ephemeris.ascendantAt Lib 23°40'  Δ 180.00°
      Tromso 2026-6-21 23:00Z  chart lagna Aqu 11°16'  |  ephemeris.ascendantAt Leo 11°16'  Δ 180.00°
```

### The change — a deletion, not a reconciliation

`risingDegree` **moved** from `houses.ts` into `ephemeris.ts` and `ascendantAt` now calls it. There is
now exactly one definition in `src/`:

```
$ grep -rn "function risingDegree" src/
src/engine/ephemeris.ts:359:function risingDegree(RAMC, eps, phi) {
```

It moved *down* rather than being imported *up* because `houses.ts` already imports its primitives
(`rev`, `sd`, `cdg`, `tdg`, `atan2d`) from `ephemeris.ts`. Importing back the other way would have
created a module cycle. `houses.ts` re-exports it, so `kundli.ts` and `validation/polar-chart.cjs`
are untouched by the move. The `raOfEcl` helper moved with it; no orphaned reference remains.

### After

```
1. src/engine/ephemeris.ts  ascendantAt()
   polar hours sampled 384, returning the DESCENDANT: 1 (0.3%)

2. The same app now answers the same question two ways at polar latitudes:
   0 of 384 polar hours where kundli.ts and ephemeris.ascendantAt differ by 180°
```

**88 → 1, and 87 → 0.** The two surfaces can no longer disagree at all, because there is no longer a
second formula for them to disagree with.

### The residual 1 was inspected, not waved through

`.scratch/dedupe/residual-one.cjs`:

```
Utqiagvik 2026-3-20 14:00Z
  ascendantAt      Sco 23°45'   alt 6.361e-15  d(alt)/min -1.017e-4
  altitude  -1min -2.315e-4   0 6.361e-15   +1min -1.017e-4
```

The altitude *rises to exactly zero and falls again*: this is a *grazing* moment, where the ecliptic
is tangent to the horizon at the meridian and "rising" has no first-order answer. It is **inherent to
`risingDegree` itself, not introduced here** — the chart engine has had the identical residual since
its own fix, which is precisely why the two surfaces now agree at all 384 hours.
`validation/polar-chart.cjs` §2 already counts and prints these grazing moments rather than asserting
them away (9 of 9,984).

### Proof that ordinary and Indian births did not move

Full chart dumps — ascendant, every graha's sign/house/KP house/nakshatra/pada, all twelve KP cusps,
Bhava Chalit, Bhava Bala, yogas, arudhas, ashtakavarga, **special points (Gulika/Mandi)**, karakas,
ruling planets, KP significators, BNN, panchang, the dasha table and Shadbala — before and after,
diffed. Plus a new dump of the surfaces the chart dump does not reach.

```
=== GAZETTEER (319 cities x 6 births = 1914 charts) ===   IDENTICAL — byte for byte
=== DENSE GRID |lat| <= 66.5 (34176 charts) ===           IDENTICAL — byte for byte
=== NEIGHBOURING SURFACES (895 lines) ===                 IDENTICAL — byte for byte
```

The gazetteer is Ganak's own `src/data/places.ts` — every city the app offers as a birthplace,
latitude −43.53 to 60.17. The third dump (`.scratch/dedupe/dump-c.cjs`, new in this lane) covers
**Panchaka** lagna schedules and windows, **Navratri** Ghatasthapana/parana/Navadurga dates, the **KP
rectification markers**, the **gochar** timeline, the **planet calendar** stations/combustion/states,
and the **transit copy** strings, across 15 ordinary and Indian places.

### Gates

```
polar-chart.cjs           PASS
panchaka-windows.cjs      PASS
navratri-timings.cjs      PASS
prashna-high-latitude.cjs PASS
screen-snapshots.cjs      PASS
language-leak-scan.cjs    PASS
parse-check.js            PASS
prashna-parity.js         PASS   ✓ parity EXACT: 198 values across 6 charts | worst numeric diff 5.68e-14° | 0 mismatch(es)
npm run build             ✓ built in 1.89s
```

No snapshot under `validation/snapshots/` needed re-baselining — the expected result, since no
ordinary chart moved.

---

## Item 2 — `PrashnaScreen.tsx` `PR_ramcForAsc`: the duplicate was real, the predicted defect was not

### Scope note

`PR_ramcForAsc` sits at line ~376. The parity-frozen region ends at the `END ENGINE` marker on line
342, so the function is **outside** the frozen block and ordinary rules applied. One small change was
made *inside* the markers — see "The extraction" — and it is a pure factoring with no behavioural
change, proven by the parity gate and by byte-identical output.

### What was being calculated twice

The same "which degree is rising" arctangent as item 1, written out a second time inside this file.
`PR_ascMc` (the time-mode chart) received the polar quadrant correction on 2026-08-18.
`PR_ramcForAsc`'s inner `ascOf` — used by the KP **number** chart to find the moment whose ascendant
is the number's degree — kept the uncorrected copy.

### The predicted defect, measured, and not confirmed

The polar lane predicted (explicitly "not measured further here") that above the polar circle the
search would settle on a moment where the number's degree is the **descendant**, giving the wrong MC
and the wrong house ring. That was tested before changing anything.

`.scratch/dedupe/prashna-ramc-repro.cjs` — the returned RAMC checked against published spherical
astronomy (Meeus, *Astronomical Algorithms* 2nd ed. ch. 13), never against Ganak:

```
   TOTAL 3 of 12240 target degrees resolved to a RAMC where the degree is SETTING
```

`.scratch/dedupe/prashna-ramc-variants.cjs` — the identical search run with the bare and the
corrected `ascOf` side by side, 25,920 target degrees across 18 latitudes:

```
   TOTAL  targets 25920  solvable 15235  RAMC differs 10  bare wrong 4  corrected wrong 4
```

**Four wrong before, four wrong after.** Below the polar circle the two variants agree exactly
everywhere. The 10 polar cases where the RAMC moves are all grazing moments —
`.scratch/dedupe/prashna-ramc-diffcases.cjs` shows every one of them has the target within 0.5° of
the meridian (hour angle 0.07°–0.46°), where the ecliptic is tangent to the horizon and no degree is
cleanly rising:

```
lat 67  target Gem 19°00'   ΔRAMC 0.2181°
   bare      RAMC 258.5000  alt -1.77e-2 H 180.462° RISING
   corrected RAMC 258.2819  alt -1.82e-2 H 180.244° RISING
```

A forward/inverse round-trip was also tried as a discriminator and rejected: above the polar circle
the forward map is many-to-one, so both variants "fail" it about equally (1406 vs 1411 of 5760) and
the invariant is simply not true up there.

**So the second copy was real; the 180° inversion it was expected to cause was not.** Reporting that
honestly is the result — the alternative was to ship a fix and claim a defect nobody could reproduce.

### The extraction

The correction is now in one function, `PR_risingDegree`, called by both `PR_ascMc` and
`PR_ramcForAsc`. The arctangent is written out exactly once in the file. `PR_ramcForAsc` is exported
for validation only, so a gate can reach it.

### Nothing moved

`.scratch/dedupe/dump-p.cjs` — both Prashna modes: `PR_cast` at 14 ordinary/Indian/diaspora places ×
5 moments, **all 249 KP numbers** at those places × 2 moments, `PR_ramcForAsc` across 144 target
degrees per place, plus `PR_cast` and all 249 numbers at **four polar cities**:

```
PRASHNA DUMP: IDENTICAL — byte for byte (all 10079 lines)
```

```
prashna-parity.js   ✓ parity EXACT: 198 values across 6 charts | worst numeric diff 5.68e-14° | 0 mismatch(es)
prashna-calc.js     ALL TESTS PASSED  (24 pass / 0 fail)
npm run build       ✓ built in 1.29s
```

### The new assertion — structural, because nothing numeric discriminates

Since the correction is correctness-neutral today, **no numeric assertion can tell the fixed code
from the broken code**. A check that passed either way would be worse than none: it would look like
protection. The property that actually mattered — one formula living in two places, so a correction
reaches one and misses the other — is asserted at the source level in
`validation/prashna-high-latitude.cjs` [4], where it does discriminate.

**Fail-then-pass, both failure directions:**

```
two copies present (the pre-fix state):
  FAIL  prashna one-ascendant-formula: the ascendant arctangent is written out 2 times ...
  [4] ascendant arctangent written out in PrashnaScreen.tsx: 2 time(s) (must be exactly 1)
  ✗ prashna-high-latitude: 6444 passed, 1 failed

formula validly rewritten so the regex stops matching (the "gone blind" case):
  FAIL  prashna one-ascendant-formula: the ascendant arctangent pattern matched NOTHING ...
  [4] ascendant arctangent written out in PrashnaScreen.tsx: 0 time(s) (must be exactly 1)
  ✗ prashna-high-latitude: 6444 passed, 1 failed

as shipped:
  [4] ascendant arctangent written out in PrashnaScreen.tsx: 1 time(s) (must be exactly 1)
  ✓ prashna-high-latitude: 6445 passed, 0 failed
```

---

## Item 3 — the five speed estimators: 5 → 4

### What was being calculated five times

"How fast is this planet moving, and is it going backwards" — the retrograde ℞ flag. The August
bug-bash defect was exactly this: one of the copies measured motion over the *preceding* twelve hours
instead of the twelve hours *centred* on the moment, so the chart printed ℞ next to a planet Ganak's
own planet calendar called direct, for about six hours after every station.

### What was retired

`src/engine/gochar.ts` held a character-for-character copy of the centred estimator. It now calls
one shared function. `planet-calendar.ts` gained `centredDailyMotion(f, ms)` — generic in the
longitude function, because gochar needs the same quantity for the lunar nodes, whose longitude is a
mean expression rather than a table lookup — and `planetSpeed(name, ms)` is now defined in terms of
it. Same arithmetic, one place.

```
XS-DUP-SPEED  [measured 4, pinned 4]     (was 5)
```

Byte-identical: the gochar timeline, the planet calendar, all 1914 gazetteer charts and all 34176
grid charts are unchanged.

### The three that remain, and why this lane could not take them

**All three are outside this lane's file scope**, which is a real limit on this item rather than a
judgement that they are fine. They are now named in the pin itself, in priority order:

1. **`src/engine/kundli.ts`** — Shadbala's Cheshta Bala input, the **backward-and-tropical** one. This
   is the live risk: the same shape of estimator that caused the August defect, still shipping on the
   same chart object beside a retrograde flag computed the other way. It feeds a *score* rather than a
   stated ℞ flag, so no reader currently sees two answers — but nothing prevents that. `kundli.ts` is
   on this lane's do-not-touch list.
2. **`src/engine/panchang.ts`** `upcomingEvents` — its own centred copy, algebraically identical
   today, so a drift risk rather than a defect. Also do-not-touch.
3. **`src/screens/PrashnaScreen.tsx`** `PR_speed` — **may be legitimate.** It reads Prashna's own
   ephemeris and its own KP-New ayanamsa, and it sits *inside* the parity-frozen markers, where the
   region has to stay plain import-free JS. Merging it means deciding whether Prashna should share the
   main ephemeris at all — a product/architecture call, not a dedupe.

---

## Item 4 — the 23 duplicated literal tables: 23 → 21

Two retired, four proven **not** to be defects and annotated in place, the rest named in the pin.

### Retired

| table | was | now |
|---|---|---|
| the two-letter sign abbreviations `["Ar","Ta",…]` | `src/data/chart-divisions.ts` + `src/i18n/panchang-terms.ts` | chart-divisions re-exports `SIGN_SHORT_EN`; i18n is the one source of truth, which is what `language-leak-scan.cjs` exists to protect |
| the four Chhath day-keys | `src/data/festival-pages.ts` + `src/engine/chhath.ts` | festival-pages imports `CHHATH_KEYS` from the engine that computes those four days |

### Checked and deliberately NOT merged — each carries a comment saying why

This is the part the brief asked for explicitly, after an earlier lane nearly flattened a real
regional difference by merging two lists that only looked identical.

- **The Tamil and Bengali month-name series** (`src/data/regional-calendar-evidence.ts` vs
  `src/engine/calendar-conventions.ts`) — **duplicated on purpose.** The evidence file is the
  *published source* the regional-calendar gates check the implementation against;
  `validation/regional-calendar-modes.cjs` and `validation/malayalam-kollavarsham.cjs` both load it as
  `evidence`. Merging them would make those gates compare Ganak to a copy of Ganak — the exact pattern
  AGENTS.md forbids. Two of the 21.
- **`[2,5,8,11]`** (`navratri.ts` vs `shadbala.ts`) — **not the same quantity.** In navratri these are
  *zero-indexed sign* indices: Mithuna, Kanya, Dhanu, Meena, the four dual rashis. In shadbala they
  are *one-indexed house* numbers, the panaphara houses scoring 30 in Kendradi Bala. Same four digits,
  two different indexing bases. Merging would have been a real defect.
- **`[c11,c12,c2,c3]`** (`houses.ts` vs `PrashnaScreen.tsx`) — **a detector artefact.** Both are a
  null-check over four local *variables* that happen to share names. There is no table.

**So this count can never reach zero: four of the 21 are non-defects.** That is now stated in the pin
so a future lane does not chase them.

### Named, still open, not taken here

The 27 Latin nakshatra names (panchang.ts + i18n), the Gregorian and Hindi month names (three screens
+ birth-input.ts), the weekday names in both scripts (muhurat.ts + i18n), the Manglik house set
`[1,2,4,7,8,12]` (doshas.ts + mangal-dosha.ts + matching.ts), and the graha name lists (up to seven
modules each) — every one of these has at least one copy in a file on this lane's do-not-touch list
(`panchang.ts`, `kundli.ts`, `muhurat.ts`, `dasha.ts`, `matching.ts`, or `src/screens/`), so retiring
them needs a lane that owns those files.

One is a genuine open reconciliation rather than a mechanical move: the **travel choghadiya set**
(`src/data/muhurat-ui.ts` + `src/engine/muhurat.ts`). The two tables are keyed differently — this one
carries puja/housewarming/wedding, the engine carries document/property/vehicle — and the orderings
differ where they overlap, so a mechanical merge would change what the Daily events picker shows.
Annotated at the site; `muhurat.ts` is out of scope.

```
XS-DUP-TABLES  [measured 21, pinned 21]  (was 23)
```

### Gates for items 3 and 4

```
cross-surface-consistency.cjs   PASS   (both pins re-measured and re-pinned, gate exit 0)
language-leak-scan.cjs          PASS
festival-page-coverage.cjs      PASS
festival-deeplinks.cjs          PASS
route-reachability.cjs          PASS
regional-calendar-modes.cjs     PASS
malayalam-kollavarsham.cjs      PASS
npm run build                   ✓ built in 1.57s
```

All four dumps re-run after items 3 and 4 together:

```
GAZETTEER (1914 charts)            IDENTICAL — byte for byte
DENSE GRID (34176 charts)          IDENTICAL — byte for byte
NEIGHBOURING SURFACES (895 lines)  IDENTICAL — byte for byte
PRASHNA both modes (10079 lines)   IDENTICAL — byte for byte
```

---

## What this lane changed, in plain language

Four things Ganak was working out in more than one place are now worked out in one place.

1. **Where the horizon is.** The single most important number in a birth chart — which sign is
   rising — was being computed by three separate pieces of code. One had been corrected for a bug at
   extreme northern and southern latitudes; the other two had not. That meant the chart's own reading
   and the readings built on top of it (the Gulika and Mandi points that appear in *every* chart, the
   Panchaka windows, the Navratri timings, the muhurat pages) could point at **opposite sides of the
   sky**. There is now one piece of code, so they cannot disagree.

2. **The same thing again inside the horary screen.** The KP question chart had its own second copy.
   It has been retired too. Here the honest finding is that the copy had **not** yet produced a wrong
   answer — that was predicted, and measurement showed it was not happening. The copy was removed
   anyway, because a formula in two places is how the first problem started.

3. **How fast a planet is moving.** Five separate versions of this existed; one has been retired.
   This is the calculation behind the ℞ "retrograde" mark, and a mismatched copy is what made the
   chart and the planet calendar disagree earlier this month.

4. **Lists typed out twice.** Two have been merged into one. Four more were examined and deliberately
   **left as two copies**, with a comment at each one explaining why — including two regional calendar
   name lists that exist twice on purpose, because one copy is the published reference the tests check
   the other against.

**Nothing a normal user sees has changed.** Every ordinary birth, every Indian city, both Prashna
modes and all 249 KP numbers produce character-for-character the same output as before — proven by
diffing complete chart dumps before and after each step.

## What is NOT done, named honestly

- **Three of the five speed calculations remain**, all in files this lane was not allowed to edit.
  The important one is in the birth-chart engine: it still measures motion *backwards* and in the
  *wrong zodiac*, which is the exact shape of the bug fixed earlier this month. It currently feeds a
  strength score rather than a visible ℞ mark, so no reader sees two answers today — but nothing
  prevents that. **This is the most valuable single follow-up from this lane.**
- **Nineteen of the twenty-one duplicated lists remain.** Fifteen or so are real and need a lane that
  owns `panchang.ts`, `kundli.ts`, `muhurat.ts`, `matching.ts` or `src/screens/`. Four are not defects
  and are now marked as such, so the count can never reach zero — that is recorded in the pin itself
  so nobody wastes a lane chasing it.
- **The travel-choghadiya table** (`muhurat-ui.ts` + `muhurat.ts`) needs *reconciling*, not merging:
  the two sides are keyed differently and ordered differently, so a mechanical merge would change what
  the Daily screen shows.
- **Both `§10` pins were lowered, neither deleted**, and each now names what remains and why.
