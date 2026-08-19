# Prashna / KP horary — fix pass against the 2026-08-18 bug bash

- **Date:** 2026-08-18
- **Agent:** fix agent (Claude), branch `claude/fix-prashna-findings`,
  worktree `.scratch/worktrees/fix-prashna`, synced to `origin/main`.
- **Input:** `plans/audits/2026-08-18-bugbash-prashna-kp.md` — 17 findings (1 P0, 8 P1, 8 P2)
  from an independent adversarial pass.
- **Owned files:** `src/screens/PrashnaScreen.tsx`, `src/engine/kp-horary.ts`,
  `src/engine/houses.ts`, `src/engine/special-points.ts`, the Prashna gates,
  `validation/screen-snapshots.cjs` + `validation/snapshots/**` for Prashna baselines,
  the Prashna sourcing docs, and this note.
- **Method:** every defect reproduced and its wrong output printed *before* any edit;
  every fix gated by a sweep, not a spot check; every new assertion carries a
  fail-then-pass proof (red against the pre-fix tree, green after).

---

## F3 — P0 · the high-latitude "equal house" fallback was not equal

### What was wrong

`PR_placidus` bails out above 60° latitude. The fallback then replaced only cusps
11, 12, 2 and 3 with 30° steps from the ascendant and **left cusp 10 as the real
MC** — and the derivation loop `for (const h of [4..9]) trop[h] = trop[opposite] + 180`
then made cusp 4 the real IC. Two real angles were pinned inside an otherwise equal
ring. Below ~60° MC ≈ asc+270 so nothing showed; above it the two angles overtook
their neighbours.

Reproduced (`.scratch/fix-prashna/f3-repro.cjs`), literal output, **before** the fix:

```
=== TIME MODE (PR_cast), 2026-08-18 12:00 UTC ===
Oslo                   sys=placidus sum=  360.00  monotonic=yes  maxPlanetsInOneHouse=4
exactly 60             sys=placidus sum=  360.00  monotonic=yes  maxPlanetsInOneHouse=4
just past 60           sys=equal    sum= 1080.00  monotonic=NO   maxPlanetsInOneHouse=8
Helsinki               sys=equal    sum= 1080.00  monotonic=NO   maxPlanetsInOneHouse=8
   cusps: c1=205.99 c2=235.99 c3=265.99 c4=326.86 c5=325.99 c6=355.99 c7=25.99 c8=55.99 c9=85.99 c10=146.86 c11=145.99 c12=175.99
   spans: 30.00 30.00 60.87 359.13 30.00 30.00 30.00 30.00 60.87 359.13 30.00 30.00
   planets: Su:h4 Mo:h4 Ma:h4 Me:h4 Ju:h4 Ve:h4 Sa:h4 Ra:h3 Ke:h4
Tromso                 sys=equal    sum= 1080.00  monotonic=NO   maxPlanetsInOneHouse=7

=== BLAST RADIUS ===
just past 60           time-mode broken hours 12/24   number-mode broken numbers 129/249
Helsinki               time-mode broken hours 12/24   number-mode broken numbers 130/249
Anchorage              time-mode broken hours 13/24   number-mode broken numbers 134/249
Reykjavik              time-mode broken hours 14/24   number-mode broken numbers 148/249
Fairbanks              time-mode broken hours 14/24   number-mode broken numbers 150/249
Tromso                 time-mode broken hours 15/24   number-mode broken numbers 166/249
```

`c4 = 326.86 > c5 = 325.99`, so "house 4" was read the long way round the zodiac —
359.1° of it. The twelve spans summed to 1080°: the ring wrapped three times.
Identical output from the reference engine `validation/prashna-calc.js` — which is
why parity was green.

### What was changed

Three copies carried the same defect and all three are fixed identically:

1. `src/screens/PrashnaScreen.tsx` `PR_cast` — **inside the parity-frozen markers**
2. `src/screens/PrashnaScreen.tsx` `PR_castNumber` — below the markers
3. `validation/prashna-calc.js` `houseCusps` — the reference engine parity compares against

The duplicated inline block is now one named builder in each file (`PR_ring` /
`cuspRing`) so the two branches cannot drift apart again.

**High-latitude convention implemented: EQUAL HOUSE reckoned from the ascendant** —
`cusp h = ascendant + 30 × (h − 1)` for all twelve houses, the MC included. In
equal house the MC is *not* the tenth cusp; it is a free sensitive point that lands
in the 9th, 10th or 11th. Reasons, in order:

- The shipped user-facing disclosure already says *"equal houses — high-latitude
  fallback"* / *"समान भाव — उच्च अक्षांश विकल्प"* and the share card says
  *"Equal (high-latitude fallback)"*. The code simply did not build equal houses.
  This makes the code match the promise rather than changing the promise.
- Equal house exists at every latitude where an ascendant exists, and it keeps the
  ascendant — the one angle KP horary is actually judged from — exact.
- **Doctrine:** Krishnamurti's KP is a Placidus system and the KP Readers record
  **no** polar convention at all. Nothing here is or can be attributed to KSK. It
  is recorded as a Ganak product decision in the citation index (rule 9), in the
  same category as rule 7, and it is stated in the user-facing copy.

After the fix, same probe:

```
just past 60           sys=equal    sum=  360.00  monotonic=yes  maxPlanetsInOneHouse=2
Helsinki               sys=equal    sum=  360.00  monotonic=yes  maxPlanetsInOneHouse=2
Reykjavik              sys=equal    sum=  360.00  monotonic=yes  maxPlanetsInOneHouse=2
Tromso                 sys=equal    sum=  360.00  monotonic=yes  maxPlanetsInOneHouse=4
... time-mode broken hours 0/24, number-mode broken numbers 0/249 at every latitude
```

---

## F3b — a SECOND high-latitude defect, found by the new gate, not in the audit

Building the external anchor turned up something the bug bash did not have: **above
the polar circle the engine returned the DESCENDANT and labelled it the ascendant.**

The textbook arctangent for the ascendant returns one of the two antipodal points
where the ecliptic crosses the horizon. Below the polar circle that is always the
eastern (rising) one. Above it the arctangent lands in the other quadrant for part
of the day. Definitional test — hold the ecliptic degree fixed, advance the sky by
one minute, and see whether it goes up or down (`.scratch/fix-prashna/polar-asc.cjs`),
**before** the fix:

```
place        lat      hourZ  reported Asc   alt@t     alt@t+60s   verdict
Tromso      69.6496  18    Sco 22°56'      -0.0000    -0.0358   SETTING (this is the DESCENDANT)
Tromso      69.6496  20    Leo 4°28'        0.0000    -0.0289   SETTING (this is the DESCENDANT)
Tromso      69.6496  12    Sco 6°46'       -0.0000     0.0634   RISING (ascendant)
Murmansk    68.9585  18    Sco 29°13'      -0.0000    -0.0278   SETTING (this is the DESCENDANT)
85N         85        0    Vir 17°21'       0.0000    -0.0011   SETTING (this is the DESCENDANT)
Reykjavik   64.1466  18    Cap 16°09'      -0.0000     0.0525   RISING (ascendant)
Helsinki    60.1699  18    Aqu 9°16'       -0.0000     0.0978   RISING (ascendant)
Delhi       28.6139  18    Pis 10°19'      -0.0000     0.2175   RISING (ascendant)
```

At Tromsø that rotates the entire chart by six houses. An equal ring built on the
descendant is still the wrong chart, so fixing F3 without this would have left a
wrong answer standing at exactly the latitudes F3 was about.

**Fix:** one line in `PR_ascMc` (and its twin in `prashna-calc.js`) — diurnal motion
is uniform, so everything on the eastern half of the horizon is rising; if the
computed point is west of the meridian, take its opposite. Verified to be a **no-op
below the polar circle**, so no existing gate output moves.

> **Judgment call, surfaced not parked.** This edit is also inside the parity-frozen
> markers and it is not one of the 17 findings. I took it because it is the same
> defect family, in the same code region, discovered by the gate this lane was asked
> to build, and because `AGENTS.md` is explicit that a failing gate must be fixed at
> the cause and never weakened to pass. The alternative was to ship a gate that
> documents a known wrong answer. Flagging it here for the owner rather than
> mentioning it nowhere.

---

## The structural fix — breaking the tautology

The audit's most important point was not the arithmetic. It was that
`validation/prashna-parity.js` compares `PrashnaScreen.tsx`'s inlined engine against
`validation/prashna-calc.js`, **both copies carried the same defect**, and so parity
was exact and meant nothing. Its own case list names *"Reykjavik, equal-house
fallback"* — it was exercising the broken branch in both copies and calling the
agreement a pass. A gate that compares a thing to itself proves nothing.

New gate: **`validation/prashna-high-latitude.cjs`**. It never compares one Ganak
copy to another. Three independent legs:

**[1] External published charts.** Two independently published natal charts, both
cast for latitudes above 60°N — inside the exact band the defect lived in. Their
Ascendant and Midheaven are pinned as literals with source, Rodden rating and
retrieval date. Both engine copies are checked against those literals *separately*.

| chart | place | latitude | published Asc | published MC | source |
|---|---|---|---|---|---|
| Björk, 1965-11-21 08:10 (UTC−1) | Reykjavík | 64°09′N 21°51′W | 18°19′ Scorpio | 25°26′ Virgo | Astrotheme, Rodden **AA**, retrieved 2026-08-18 |
| Jean Sibelius, 1865-12-08 00:30 LMT | Hämeenlinna | 60°59′N 24°28′E | 26°26′ Virgo | 24°39′ Gemini | Astrotheme, Rodden **B**, retrieved 2026-08-18 |

Measured agreement: **0.1′ / 0.3′** (Björk) and **1.5′ / 2.1′** (Sibelius).
Declared tolerance 4′, with the reason stated in the gate.

Both anchors also confirm the *convention*, against external numbers rather than
against a comment: the published MC falls in equal house **11** (Björk) and **9**
(Sibelius) — never the 10th cusp. That is the defining property of the Equal House
system, and it is now an assertion.

**[2] The geometric definition, recomputed by a different published route.**
IAU 1980 obliquity, ecliptic→equatorial conversion, horizon altitude. An ascendant
is by definition the ecliptic degree on the horizon that is rising. The gate asserts
altitude 0°, east of the meridian, and rising — the last two tested two ways so
neither can be a sign-convention artefact. The Midheaven needed for the local
sidereal time is recovered **without asking the engine for it**: the MC depends only
on the instant and the longitude, never the latitude, so the same instant cast at
the equator (where Placidus always holds and cusp 10 therefore *is* the MC) yields
it. That keeps the check available at latitudes where cusp 10 is deliberately not
the MC. 528 latitude/hour pairs; worst |altitude| **0.00000°**.

**[3] Ring invariants**, which are arithmetic and need no source: monotonic once
round the zodiac, twelve spans summing to exactly 360°, no house degenerate or over
120°, and in the equal branch every span exactly 30°. 1,437 rings across 23
latitudes (0, 28.6, 51.5, 59.9, 59.99, **60.0**, **60.01**, 60.17, 60.72, 61.22,
62.45, 63.43, 64.15, 64.84, 66.56, 68.96, **69.65**, 85, 89.9 and four southern
mirrors) × 12 hours × both modes, plus all 249 numbers at 60.01, 64.15 and 69.65.

### Fail-then-pass proof

Red — the new gate run against the pre-fix tree (`git stash` of the two engine files):

```
FAIL  Björk … / PR_cast: equal-house cusp 10 is Virgo 25°26'19", expected ascendant+270° = Leo 18°18'53"
FAIL  Björk … / PR_cast: the published MC 25°26′ Virgo falls in equal house 4; the Equal House system places it in the 9th, 10th or 11th
FAIL  Björk … / PR_cast: cusp 10 equals the real MC — that is the defect this gate exists to catch, an equal ring with a real angle pinned into it
FAIL  Björk … / prashna-calc.js castChart: equal-house cusp 4 is Pisces 25°26'19", expected ascendant+90° = Aquarius 18°18'53"
FAIL  PR_castNumber | 69.65° number 249: the chart says 'equal houses' but its widest span is off 30° by 309.1048°
…
worst |span sum−360|   7.20e+2°
✗ prashna-high-latitude: 3488 passed, 2955 failed
```

Green — the same gate against the fixed tree:

```
      Asc Scorpio 18°18'53"  (0.1′ from published)
      MC  Virgo 25°26'19"  (0.3′ from published)
      published MC falls in equal-house 11 …
      Asc Virgo 26°27'30"  (1.5′ from published)
      MC  Gemini 24°41'05"  (2.1′ from published)
      published MC falls in equal-house 9 …
rings checked          1437
geometric asc checks   528   worst |altitude| 0.00000° (tolerance 0.02°)
worst |span sum−360|   5.68e-14°
✓ prashna-high-latitude: 6443 passed, 0 failed
```

The nine pre-existing Prashna gates are unchanged and still green, including
`prashna-parity.js` (`✓ parity EXACT: 198 values across 6 charts | worst numeric diff
5.68e-14° | 0 mismatch(es)`) — parity is still proved, but it is no longer the *only*
thing proved.
