# The birth chart's rising sign above the polar circle — fixed 2026-08-19

**Lane:** `claude/fix-polar-quadrant`, worktree `.scratch/worktrees/polar-quadrant`, base `origin/main` `cfe17a6`.
**Owned:** `src/engine/kundli.ts`, `src/engine/houses.ts`, `src/engine/bhava.ts` (untouched — see §7),
`validation/polar-chart.cjs` (new), `validation/chart-styles-ayanamsha.cjs`, this note.
**Read but never edited:** `src/screens/PrashnaScreen.tsx`, `src/engine/kp-horary.ts`,
`src/engine/ephemeris.ts`, `src/engine/special-points.ts`.
**Handed to this lane by** `claude/prashna-house-system`, which found the defect while fixing the
horary side, wrote out the exact change, and could not apply it because `kundli.ts` was not its file
(`plans/audits/2026-08-19-prashna-house-system.md`, § OPEN HANDOFF).

---

## 1. In one sentence, for the owner

Anyone born far enough north or south — Tromsø, Murmansk, northern Alaska, Svalbard, an Antarctic
station — could have been handed a birth chart that was **upside down**: the sign Ganak called
"rising" was in fact the sign *setting* on the opposite horizon, and every house in the chart was
six places out. It happened for about **one birth hour in four** at those latitudes, and it is now
fixed and permanently guarded. **No chart anywhere else in the world moved by so much as a decimal
place** — every Indian city and every ordinary birth is byte-for-byte what it was.

## 2. Reproduced first, before anything was changed

The rising degree has a published definition that owes nothing to Ganak: it is the point of the
zodiac sitting **on the horizon** and **climbing**, not sinking. `.scratch/polar/repro.cjs` computes
that independently (Meeus, *Astronomical Algorithms* 2nd ed., ch. 12–13) and asks the shipped engine
for its answer. Against the tree as it stood this morning:

```
  Tromso, Norway  ...  2026-06-21 00:00Z  chart says lagna Cap  8°32'
      but that degree is SETTING (alt -0.0000°, hour angle 117.8° = west of meridian)
      -> the rising degree is Can  8°32'   Δ 180.00°
  Murmansk, Russia     2026-12-21 08:00Z  chart says lagna Sco 10°17'  ... -> Tau 10°17'  Δ 180.00°
  Utqiagvik, Alaska    2026-09-15 ...      chart says lagna Lib 29°31'  ... -> Ari 29°31'  Δ 180.00°
  Longyearbyen         2026-06-21 03:00Z  chart says lagna Leo  4°55'  ... -> Aqu  4°55'  Δ 180.00°

  polar hours sampled: 192
  hours where the chart's lagna is actually the descendant: 46
  => 46 of 192 polar charts are rotated by exactly six houses.
```

Every failure was **exactly 180°**, and every one had the reported degree **west of the meridian** —
i.e. past its high point and on the way down. Nothing was ever a near miss. That is the signature of
a quadrant error, not a precision error.

## 3. The cause

`src/engine/kundli.ts` computed the ascendant with the bare textbook arctangent:

```js
const ascTrop = atan2d(cdg(ramc), -(sd(ramc) * cdg(eps) + tdg(lat) * sd(eps)));
```

That formula returns **one of the two antipodal points** where the ecliptic cuts the horizon. Below
the polar circle it is always the eastern, rising one. Above it the arctangent lands in the other
quadrant for part of the day and returns the **descendant**.

`src/screens/PrashnaScreen.tsx` received the correction for this on 2026-08-18. `kundli.ts` never
did. So for a day Ganak's two surfaces answered the same question 180° apart.

## 4. The correction, and why it is right

Diurnal motion is uniform, so the fix is the definition itself. Differentiating the published
altitude relation

```
sin(alt) = sin(phi) sin(dec) + cos(phi) cos(dec) cos(H)
```

with respect to the hour angle `H`, which increases uniformly with time:

```
d(sin alt)/dH = -cos(phi) cos(dec) sin(H)
```

so a point is **rising exactly while `sin(H) < 0`** — that is, while it is **east of the meridian**.
The two ecliptic/horizon intersections are antipodal, so their hour angles differ by exactly 180°
and precisely one of them is east. Take the hour angle of the computed point; if it is west, the
formula returned the descendant, so take its opposite.

**This was verified before it was applied**, not after. `.scratch/polar/verify-correction.cjs` over
latitude −89.5…89.5 × RAMC 0…359 × three obliquities:

```
samples                                    387720
RAW formula fails the definition            32294  (8.33%)
    above polar circle                     32294
    below polar circle                         0
CORRECTED formula fails the definition         54   <-- investigated, see below
worst |altitude| of the corrected point     1.606e-13°
samples the correction MOVES                32284
    ... at |lat| <= polar circle (66.5607°)     0
lowest |latitude| the correction touches    67.00°
```

**The 54 residuals were the test's fault, not the correction's.** They all sat within 0.1253° of the
meridian, with an altitude changing by ~1e-4°/minute — points about to culminate. The "is it rising"
test used a *forward* difference over one sidereal minute (0.2507° of LST), so a point that goes
over the top within the next half-minute reads as lower a minute later even though it is
instantaneously rising. Prediction: shrink the step and the band shrinks with it, pinned at step/2.
`.scratch/polar/step-size-proof.cjs`:

```
  step (deg LST)   clock       fail   widest failure   predicted
                                      from meridian    (= step/2)
  0.250684       1 minute       54   0.123096°       0.125342°
  0.062671       15 seconds     16   0.029720°       0.031336°
  0.004178       1 second        2   0.000284°       0.002089°
  0.000418       100 ms          0   0.000000°       0.000209°

=== The analytic statement, over the same grid ===
samples                                          387720
corrected point NOT east of the meridian              0
worst |altitude| of the corrected point       1.606e-13°
```

Dead on the prediction, and zero at a 100 ms step. The correction is right.

## 5. Applied at the cause — one definition, not two

The point of the lane that found this was that **two surfaces disagreeing is the defect class doing
the most damage in this codebase**. So the correction is not pasted into two places. There is now
**one** `risingDegree` in `src/engine/houses.ts`, carrying the derivation and the no-op proof, used
by both the chart's ascendant and the Placidus cusp 1:

```js
function risingDegree(RAMC, eps, phi) {
  const asc = atan2d(cdg(RAMC), -(sd(RAMC) * cdg(eps) + tdg(phi) * sd(eps)));
  return sd(rev(RAMC - raOfEcl(asc, eps))) > 0 ? rev(asc + 180) : asc;
}
```

`kundli.ts` also stopped recomputing RAMC and the obliquity from duplicate expressions (`ramcK`,
`epsObl`, `epsB` were each a second copy of a local already in scope). That duplication is precisely
how a correction lands on one copy of a formula and not the other; there is now one local each.

## 6. The sweep, and the proof that ordinary births did not move

**Inverted samples, before and after** — latitudes from the mid-sixties to the poles, both
hemispheres, all 24 hours, across the year:

| sweep | before | after |
|---|---|---|
| 4 polar cities × 2 solstices × 24 h (`repro.cjs`) | **46 of 192** | **0 of 192** |
| \|lat\| 64–89 both hemispheres × 4 dates × 2 longitudes × 24 h (gate §2) | — | **0 of 9984** |
| lat −89.5…89.5 × RAMC 0…359 × 3 obliquities (gate §3) | 32,294 wrong | **0 wrong** |

**Ordinary latitudes are byte-identical.** Two dumps of the *entire* chart — ascendant, every graha's
sign/house/KP house/nakshatra/pada, all twelve KP cusps, Bhava Chalit madhyas and placements, Bhava
Bala, yogas, arudhas, ashtakavarga, special points, karakas, ruling planets, KP significators, BNN,
panchang and the dasha table — generated before the edit and after it, then diffed:

```
=== GAZETTEER (319 cities x 6 births = 1914 charts) ===
IDENTICAL — byte for byte
=== DENSE GRID |lat| <= 66.5 (34176 charts) ===
IDENTICAL — byte for byte
```

The gazetteer is Ganak's own `src/data/places.ts`, i.e. every city the app offers as a birthplace —
every Indian city, the whole diaspora list, latitude range −43.53 to 60.17.

Extending the same grid to |lat| ≤ 89 changes 3,706 charts, and **every changed latitude is above the
polar circle**:

```
distinct latitudes of changed charts:
  -89.0 -87.5 -86.0 -84.5 -83.0 -81.5 -80.0 -78.5 -77.0 -75.5 -74.0 -72.5 -71.0 -69.5 -68.0
   67.0  68.5  70.0  71.5  73.0  74.5  76.0  77.5  79.0  80.5  82.0  83.5  85.0  86.5  88.0
lowest |latitude| that moved: 67      (polar circle 66.5607)
```

## 7. `src/engine/bhava.ts` needed no edit

It takes `ascSid` as an argument and holds no ascendant of its own, so Bhava Chalit, the madhyas,
the sandhis and Bhava Bala all corrected themselves the moment the ascendant did. Confirmed in the
dumps above, which include every one of those fields.

## 8. The gate — `validation/polar-chart.cjs`

AGENTS.md now states it outright: *"A gate must never compare Ganak to a copy of Ganak."* This one
does not.

### The anchor: the US Naval Observatory

Sunrise, upper transit and sunset for five real polar places, taken from the USNO Astronomical
Applications Department API (`https://aa.usno.navy.mil/api/rstt/oneday`, retrieved 2026-08-19) and
pinned in the gate as literals with coordinates and date. The assertion is a **sign test with no
tolerance at all**: at a published *sunrise* the Sun is on the eastern horizon, so the rising degree
must be on the Sun's side of the meridian; at a published *sunset* it must be on the opposite side.
That is exactly what the defect got backwards.

**Two sources that could NOT be used, and why:**

* **Drik Panchang**, Ganak's usual benchmark, refuses the whole latitude band. Asked for a
  high-latitude day it answers `High Latitudes are not entertained. Aborting...!` (retrieved
  2026-08-19). Ganak is doing something its benchmark declines to attempt, which is precisely why
  this area had no external check.
* **A Rodden-rated natal chart for a birth above the polar circle** does not appear to exist to pin.
  The charts the horary lane used — Björk at Reykjavík 64.15°N, Sibelius at Hämeenlinna 60.98°N —
  are both *below* the polar circle and never enter this branch; searching for Tromsø-born subjects
  returns only Rodden **XX** (birth time unknown). Rather than invent one, this gate uses the polar
  published source that does exist. The Sun at its own published rising is a stronger discriminator
  than a natal ascendant anyway: it separates the two candidate answers by 180°.

### What it checks

* **[1] USNO.** Cross-validates the gate's own spherical astronomy against USNO first (the Sun's
  centre must sit at −0.8333° — 34′ refraction + 16′ semi-diameter — at a published rise/set), then
  runs the sign test, then anchors the chart's **Midheaven** to the Sun's published upper transit.
* **[2] The published definition,** swept over 9,984 polar charts: altitude zero, and altitude
  **increasing**, tested with a centred ±1 s finite difference — not by re-asking the engine.
  Genuine grazing moments, where the ecliptic is tangent to the horizon and "rising" has no answer,
  are **counted and printed** rather than asserted away (9 of 9,984).
* **[3] The no-op invariant:** `risingDegree` against the plain textbook arctangent over 387,720
  samples; they must agree **exactly** below the polar circle. This is the guard that keeps every
  Indian birth safe.
* **[4] The two surfaces side by side** — the one deliberate Ganak-to-Ganak comparison, labelled in
  the file as a consistency check and never as a reason to believe either surface.

### Passing output

```
  Tromso, Norway  2026-09-15  69.6496, 18.9560
     Rise  03:57UT  Sun Virgo 22°20' east  |  lagna Virgo 21°08' east  |  Sun centre alt -0.8236° (USNO -0.8333°)  ok
     Set   17:20UT  Sun Virgo 22°53' west  |  lagna Pisces 7°56' east  |  Sun centre alt -0.8689° (USNO -0.8333°)  ok
     Transit 10:39UT  Sun Virgo 22°36' culminating  |  chart MC Virgo 22°30'  (6.8' apart, tol 15')
  ...
  McMurdo Station, Antarctica  2026-09-15  -77.8419, 166.6863
     Rise  19:25UT  Sun Virgo 22°58' east  |  lagna Virgo 27°05' east  |  Sun centre alt -0.8071° (USNO -0.8333°)  ok
     Set   06:08UT  Sun Virgo 22°25' west  |  lagna Pisces 23°50' east  |  Sun centre alt -0.8120° (USNO -0.8333°)  ok
     Transit 00:49UT  Sun Virgo 22°13' culminating  |  chart MC Virgo 22°18'  (5.9' apart, tol 15')

  worst |Sun centre altitude - USNO definition|   0.03562°  (tolerance 0.15)
  worst |Sun hour angle| at published transit    0.10375°  (tolerance 0.5)
  worst chart-MC vs culminating Sun              6.77'  (tolerance 15')

=== [2] The published definition of a rising degree, swept ===
  polar charts swept (|lat| 64..89, both hemispheres, 24 h, 4 dates, 2 longitudes)  9984
  worst |altitude| of the rising degree      1.365e-5°  (tolerance 0.02)
  charts where it was on the horizon but SETTING (the defect)   0
  grazing moments, where "rising" is undefined                  9
  charts whose rising degree was not east of the meridian       0

=== [3] The correction is a strict no-op below the polar circle ===
  latitude/RAMC/obliquity samples                387720
  samples the correction moves                   32284
  ... at or below the polar circle               0  (must be 0)
  lowest |latitude| the correction touches       67.00°  (polar circle 66.56°)

=== [4] Chart engine and horary engine, same place, same moment ===
  polar moments compared                        768
  worst disagreement                            2.98"  (tolerance 60", set by the two ayanamsa expressions)
  Before the correction the same sweep read 180.00° apart at many of these moments.

✓ polar-chart: 20766 passed, 0 failed
```

Tolerances are derived, not guessed. The 15′ MC bound is twice USNO's own whole-minute rounding of
the transit time (the MC sweeps ~15′ per minute of clock); measured worst is 6.77′, consistent with
exactly that.

### Fail-then-pass

Each perturbation applied to the real source, the gate run, the source restored
(`.scratch/polar/fail-then-pass.sh`; files parked in `.scratch/`, never `git stash` — the stash
stack is shared between worktrees here).

```
--- A. the defect itself — chart engine back on the bare arctangent (the state shipped until today)
    ✗ polar-chart: 17739 passed, 3027 failed
      [2] rising, not setting                  2821 FAIL
      [1] USNO sunrise/sunset sign test           6 FAIL
        e.g. McMurdo Station, Antarctica Rise 19:25UT: the Sun is EAST (rising) of the meridian
             and the chart's lagna Pisces 27°05' is WEST — at a published rise they must be on
             the SAME side(s). The engine returned the DESCENDANT.
      [4] chart vs horary consistency           200 FAIL
        e.g. lat -86 2026-12-21 21:00Z — chart lagna Pisces 10°51' but horary lagna Virgo 10°51',
             179.9992° apart. The two surfaces have drifted.

--- B. correction deleted from BOTH kundli.ts and houses.ts — the two copies agree and are both wrong
    ✗ polar-chart: 17738 passed, 3028 failed
      [2] rising, not setting                  2821 FAIL
      [3] no-op below the polar circle            1 FAIL   ("not wired in")
      [1] USNO sunrise/sunset sign test           6 FAIL
      [4] chart vs horary consistency           200 FAIL

--- C. condition inverted — the correction now moves ORDINARY latitudes (every Indian birth)
    ✗ polar-chart: 10009 passed, 10757 failed
      [2] rising, not setting                  9975 FAIL
      [3] no-op below the polar circle            2 FAIL
        e.g. the correction reached down to |latitude| 0, below the polar circle
      [1] USNO sunrise/sunset sign test          12 FAIL
      [4] chart vs horary consistency           768 FAIL

--- D. every chart handed the descendant on purpose (one flip, in the shared definition)
    ✗ polar-chart: 13036 passed, 7730 failed
      [2] rising, not setting                  7154 FAIL   [3] 2 FAIL   [1] 6 FAIL   [4] 568 FAIL

--- E. a small 0.33 deg error at polar latitudes only — far too small to be a quadrant flip
    ✗ polar-chart: 11335 passed, 9434 failed
      [2] altitude of the rising degree        8780 FAIL
        e.g. lat -89 ... — lagna Aries 0°41' is not on the horizon (altitude -0.13645°)
      [4] chart vs horary consistency           640 FAIL

--- RESTORED — the real tree
    ✓ polar-chart: 20766 passed, 0 failed
```

**B is the case that matters most.** Both copies of the formula were made wrong *together*, so any
gate comparing one Ganak surface to another would have stayed green — and this gate still went red,
because its assertions are anchored to USNO and to the published definition. E proves the gate is
not merely a 180° detector: a 0.33° nudge, far too small to be a quadrant flip, reddens it too.

## 9. The neighbours — same correction, places it still has not reached

`.scratch/polar/neighbours.cjs`. **Both are outside this lane's file scope**; they are measured here
so the handoff carries numbers rather than a hunch.

### (a) `src/engine/ephemeris.ts` — `ascendantAt()` — NOT this lane's file

The identical uncorrected arctangent, and this one is used all over the engine:

```
polar hours sampled 384, returning the DESCENDANT: 88 (22.9%)
callers: src/engine/special-points.ts (Gulika/Mandi, inside EVERY birth chart),
         src/engine/dasha.ts (KP time-sensitive markers), src/engine/panchaka.ts,
         src/engine/navratri.ts, src/screens/MuhuratHub.tsx
```

Because `kundli.ts` is now right and `ascendantAt` is not, the app currently answers the same
question two ways at polar latitudes — **87 of 384 sampled polar hours, 180° apart**:

```
Tromso 2026-6-21 00:00Z  chart lagna Cap  8°32'  |  ephemeris.ascendantAt Can  8°32'  Δ 180.00°
Tromso 2026-6-21 21:00Z  chart lagna Tau  6°19'  |  ephemeris.ascendantAt Sco  6°19'  Δ 180.00°
Tromso 2026-6-21 22:00Z  chart lagna Ari 23°40'  |  ephemeris.ascendantAt Lib 23°40'  Δ 180.00°
Tromso 2026-6-21 23:00Z  chart lagna Aqu 11°16'  |  ephemeris.ascendantAt Leo 11°16'  Δ 180.00°
```

The cleanest fix is for whoever owns `ephemeris.ts` to have `ascendantAt` call the same
`risingDegree` this lane put in `houses.ts`, so there is one definition for the whole engine rather
than three. **Note this is a live inconsistency introduced by fixing only half of it** — it is not
worse than the original defect (that surface was already wrong 22.9% of the time at those
latitudes), but it should be closed promptly.

### (b) `src/screens/PrashnaScreen.tsx` — `PR_ramcForAsc` (line ~376) — ANOTHER LANE'S FILE

The horary screen corrected `PR_ascMc` (line ~124) on 2026-08-18 but **left a second, uncorrected
copy of the arctangent** in `PR_ramcForAsc`'s inner `ascOf`. `PR_castNumber` uses it to search for
the RAMC whose ascendant is the KP number's degree, so above the polar circle the search can settle
on a moment where that degree is the **descendant**, yielding the wrong MC and the wrong Placidus
ring for a KP number chart. Not measured further here — it is that lane's file and it is being
edited right now.

## 10. Gate board

`bash scripts/run-all-gates.sh`, whole repository, on the tree carrying the fix (`7878f0e`):

```
102 passed, 0 failed.
```

The gates closest to this change:

```
PASS  polar-chart.cjs                              5s     <- new in this lane
PASS  chart-styles-ayanamsha.cjs                  29s
PASS  prashna-high-latitude.cjs                    1s
PASS  screen-snapshots.cjs                        23s
PASS  parse-check.js                               0s
PASS  prashna-parity.js                            0s
```

`screen-snapshots.cjs` passed **unchanged** — no snapshot under `validation/snapshots/` needed
re-baselining, which is the expected result: no screen's rendered text moved, because no ordinary
chart moved. Nothing in `validation/snapshots/**` was touched.

One inert change landed after that board: `raOfEcl` was dropped from `houses.ts`'s export list
(nothing imports it; `risingDegree` is the only export this lane added that anything uses). It was
re-verified on its own — build clean, the gazetteer and grid dumps still byte-identical to pre-fix,
the reproduction still 0 of 192, and `polar-chart`, `chart-styles-ayanamsha`, `screen-snapshots`,
`prashna-high-latitude`, `parse-check` and `prashna-parity` all green — and then confirmed by a
second full run of the suite.

`npm run build`: `✓ built in 1.93s`, no errors.

**One operational note for other agents:** running gates *concurrently* with a full
`scripts/run-all-gates.sh` can report spurious FAILs — `parse-check.js` and `prashna-parity.js` both
reported FAIL while the suite was running beside them and both exit 0 when run on their own. Do not
trust a gate result taken while another suite is in flight.

## 11. What is closed and what is not

* **Closed.** The birth chart's rising degree is correct at every latitude, in both hemispheres, at
  every hour, anchored to the US Naval Observatory and to the published definition rather than to
  Ganak's own output. Ordinary and Indian births are byte-identical. One shared definition, so the
  chart's ascendant and its Placidus cusp 1 cannot drift apart again.
* **Open, handed off, not this lane's files:**
  1. `src/engine/ephemeris.ts` `ascendantAt` — §9(a). Should call `risingDegree`.
  2. `src/screens/PrashnaScreen.tsx` `PR_ramcForAsc` — §9(b). Second uncorrected copy.
  3. Still unresolved from the horary lane's note: above the polar circle Prashna falls back to
     **equal house** and the Jyotish chart to **Porphyry**. Neither is doctrine, both are honestly
     labelled on their own screen, but one app should pick one convention. That is a product call
     and it changes shipped Jyotish charts, so it was not taken here.
* **Observed, not acted on:** `src/engine/kundli.ts` imports `ascendantAt` and `moonLon` from
  `ephemeris.ts` and uses neither. Pre-existing, unrelated to this fix, left alone deliberately.
* **Not touched:** `plans/task-log.md`, `plans/backlog.md`, `plans/backlog-acceptance-register.md`,
  `plans/backlog-sheet-sync.json`, and every file on this lane's do-not-touch list.
