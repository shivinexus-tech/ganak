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
