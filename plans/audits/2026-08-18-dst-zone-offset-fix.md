# Fix — the birth timezone was looked up for the wrong moment (F1)

**Agent:** Claude Code (fix lane). **Branch** `claude/fix-dst-zone-offset`,
worktree `.scratch/worktrees/fix-dst-zone`, base `origin/main` `b14e13c`.
**Fixes:** finding **F1** in `plans/audits/2026-08-18-bugbash-utility-calculators.md`.
**Files changed:** `src/engine/panchang.ts` (the `zoneOffset` function only) and
`validation/zone-offset-dst.cjs` (new gate). No snapshot baseline moved — nothing
needed one.

---

## What was wrong

`zoneOffset(zone, y, m, d)` resolved the offset at `Date.UTC(y, m-1, d, 12)` —
**noon UTC on the birth date** — and the caller then applied that offset to the
birth *time*. On a DST-transition day the offset came from the wrong side of the
transition. Noon UTC is also the **wrong local date** for far-eastern zones: for
`Pacific/Auckland` (+13) it is 01:00 the *next* local day, so a whole Auckland or
Sydney day could take the neighbouring day's offset.

Reproduced before touching anything:

```
== NY 2024-03-10 00:30 (spring forward at 02:00 local; 00:30 is still EST -5) ==
app  tz=-4 Purva Bhadrapada pada 1 sound Se से
true tz=-5  Purva Bhadrapada pada 2 sound So सो
== NY 1961-10-29 00:30 (fall back at 02:00 local; 00:30 is still EDT -4) ==
app  tz=-5 Simha (Leo)
true tz=-4  Karka (Cancer)
```

## What changed

`zoneOffset(zone, y, m, d, hh = 12, mi = 0)` now resolves the offset **at the
wall clock it is given**. A wall clock is genuinely circular — converting it to an
instant needs the offset, and the offset is defined on instants — so the function
generates the candidate offsets in force around the target and keeps the ones that
are *self-consistent*: offset `o` is valid for wall clock `W` iff the zone really
is at `o` at the instant `W - o`. Probing `W ± 18h` brackets any transition that
can affect it (no zone is further than 14h from UTC; none has changed offset twice
inside 36 hours).

Two supporting changes in the same block: the `Intl.DateTimeFormat` is now cached
per zone (it used to be constructed on **every** call), and the raw
instant→offset lookup is split out as `zoneOffsetAt`. Despite doing 3–5 probes
instead of 1, the new function is **4.4× faster**: 200,000 calls take 2.0 s
against 9.0 s for the shipped version.

### Convention — the skipped hour (spring forward)

A wall clock like `America/New_York 2024-03-10 02:30` **never existed**; no
candidate offset is self-consistent.

**Chosen: the offset in force BEFORE the change** (the smaller one). 02:30 maps to
the real instant 07:30 UTC = 03:30 EDT — shifted forward by the size of the gap.

*Why:* it is what `java.time.ZonedDateTime`, moment-timezone and Temporal's
`"compatible"` disambiguation all do, and it is the only choice that keeps later
wall clocks mapping to later instants (picking the post-change offset would map
02:30 to an instant *before* 01:59). A birth certificate showing a skipped time is
a recording error; shifting forward keeps the record and the chart in the same
order rather than silently reordering two births minutes apart.

### Convention — the repeated hour (autumn fall back)

A wall clock like `America/New_York 2024-11-03 01:30` **happens twice**; two
candidate offsets are self-consistent.

**Chosen: the offset in force BEFORE the change** (the larger one) — i.e. the
**first** of the two passes.

*Why:* same default as `java.time`, Python's `fold=0`, moment-timezone and
Temporal `"compatible"`, so it matches what any cross-check tool will say. It is
also the likelier reading of a birth record: the clocks had not been turned back
yet when the time was written down. The second pass is genuinely unreachable
through this function — a caller that needs it must work in UTC instants.

Both cases therefore follow **one** rule, which is what makes it easy to state:
*use the offset in force immediately before the transition.*

---

## Blast radius — measured, not estimated

**Day-level callers are untouched.** ~40 panchang engines call `zoneOffset` with
only `(zone, y, m, d)`; they now get the offset at **local** noon instead of UTC
noon. Every gazetteer zone × every calendar day 1900-01-01 → 2030-12-31:

```
EXHAUSTIVE day-level: 4019148 lookups (84 zones x every day 1900-01-01..2030-12-31)
  4-arg results that changed: 1
    America/Sao_Paulo 1
    eg America/Sao_Paulo 1931-10-3: -3 -> -2
```

**One** day in 131 years across the whole gazetteer. Brazil's first DST began
1931-10-03 at 11:00 local, so that civil day genuinely had both offsets; −2 covers
11:00 onward and is the better representative of the day. No gate anchors it.

**Births on DST-transition days move, which is the point.** Same sweep shape as
the auditor's (7 DST cities × 1960–2026 × 12 months × 5 days × 4 night hours):

```
[2] BIRTH sweep 7 DST cities 1960-2026: 111160 births
    offsets changed   : 337
    ascendants changed: 173
    nakshatra padas   : 62
    nakshatras        : 15
    Moon signs        : 2
      eg America/New_York 1961-10-29 00:30 tz -5->-4 lagna Simha (Leo) -> Karka (Cancer)
      eg America/New_York 1962-04-29 00:30 tz -4->-5 lagna Dhanu (Sagittarius) -> Makara (Capricorn)
```

(The auditor reported 275 / 131 over 110,684 births. This sweep is 111,160 births
— slightly different day sampling — and additionally counts the skipped- and
repeated-hour clocks, which the audit's count did not separate out. Same defect,
same order of magnitude.)

**India and non-DST regions are byte-identical.**

```
[3] BIRTH sweep 8 Indian cities 1960-2026: 127040 births
    offsets changed   : 0   ascendants changed: 0

[4] NO-DST zone invariance: 988920 lookups over 41 zones x 1960-2026 x 6 clock times
    old !== new (either 4-arg or 6-arg): 53
```

Those 53 are not regressions — the "no DST" list was **wrong**. Every one is a
real historical DST or offset change: Hong Kong (DST until 1979), Shanghai
(1986–91), Seoul (1960, 1987–88), Perth (1992, 2009 trials), Phoenix (1967),
Brisbane (1989–92), Jamaica (1978–79), Karachi (2008–09), Lima (summer time),
Guyana (the 1975 −3:45 → −3 change). **All 53 are 6-arg differences; the 4-arg
day-level result changed on none of them, and `Asia/Kolkata` has zero mismatches
of either kind.**

Ganak's core audience is safe: **32,507 consecutive days of `Asia/Kolkata`,
1947–2035, are +5:30 before and after**, asserted permanently in the new gate.

---

## Gates

`bash scripts/run-all-gates.sh` — **90 passed, 0 failed** before the new gate was
added, and **91 passed, 0 failed** with it. **No anchor moved and no gate was
weakened**; every dated Drik/published anchor in the suite is an Indian or
day-level value, which this change provably does not touch. `npm run build` is
clean (198 route HTML files, sitemap 198 URLs).

### New gate — `validation/zone-offset-dst.cjs`

65 checks: hour-awareness (the assertion that goes red the instant anyone resolves
at a fixed moment again), both F1 worked examples end-to-end through a chart, the
skipped- and repeated-hour conventions in 5 zones each, both sides of both
transitions in 4 zones, historical rules (India wartime +6:30, Kolkata's pre-1906
Madras Mean Time +5:21, Nepal +5:30→+5:45, the 1968–71 British Standard Time
experiment, Iran +4:30), fractional zones (Kathmandu +5:45, Chatham +12:45/+13:45,
Kabul +4:30, Yangon +6:30, Adelaide +9:30/+10:30), unknown zone → `null`, the
India day-level invariance loop above, an 80,472-lookup check that the 4-arg
default really is local noon, and a 250-case round trip proving the returned
offset is the one the zone actually has at the instant it resolves to.

**Fail-then-pass proof.** With `zoneOffset` reverted to the shipped noon-UTC
version (`git show HEAD:src/engine/panchang.ts`):

```
FAIL hour-awareness: NY 2024-03-10 00:30 is EST: expected -5, got -4
FAIL hour-awareness: zoneOffset ignores the clock time — the F1 defect is back
FAIL F1 example 1: pada (was 1 with the noon-UTC offset): expected 2, got 1
FAIL F1 example 1: naming syllable (was "Se"): expected So, got Se
FAIL F1 example 2: lagna (was "Simha (Leo)"): expected Karka (Cancer), got Simha (Leo)
... 26 FAILURES (39 passed)
```

Restored:

```
zone-offset-dst: PASS — 65 checks · hour-aware offsets, skipped/repeated-hour
conventions pinned, historical + fractional zones, day-level invariance
```

---

## STILL OPEN — the call sites, which this lane was not allowed to touch

**This fix makes the correct answer available. It does not yet reach the screen.**
The engine now returns −5 for New York 2024-03-10 00:30, but
`UtilityCalculatorScreen` still calls `zoneOffset(place.zone, y, m, day)` with no
clock time, so it still gets the local-noon offset (−4) and still prints pada 1 /
"Se". Every screen is reserved by another agent for this wave, so the call sites
were deliberately left alone rather than creating a merge collision.

Eight call sites hold a **birth wall clock** and must pass `hh, mi`. `hh`/`mi` are
already in scope at every one of them, so each is a one-line change:

| File | Line | What it computes |
|---|---|---|
| `src/screens/UtilityCalculatorScreen.tsx` | 32 (`makeInput`) | all 14 public calculators — the F1 site |
| `src/screens/MatchingScreen.tsx` | 66, 67 | boy's and girl's charts for Dashakoota |
| `src/screens/ChartScreen.tsx` | 207 | the auto-resolved offset shown in the form |
| `src/screens/ChartScreen.tsx` | 217, 239, 264 | saved chart, cast chart, ayanamsa recompute |
| `src/screens/RectifyScreen.tsx` | 13 | birth-time rectification |
| `src/engine/medical-muhurat.ts` | 60 (`natalMoonSign`) | natal Moon sign for medical muhurat |

Every **other** caller (`today-panchang`, `festivals`, `muhurat`,
`daily-windows`, `panchaka`, `lakshmi-puja`, `eclipse`, `chhath`,
`vedic-season-clock`, `calendar-conventions`, `regional-calendar-shadow-check`,
`DailyScreen`, `CalendarPage`, `FestivalGuideScreen`, `MuhuratHub`) is genuinely
day-scoped and is correct with the 4-arg form. Do **not** change those.

**Also still open, not this lane:** finding **F3** — a malformed `zone` makes
`zoneOffset` return `null` and every caller silently falls back to `?? 5.5` (IST)
with no message. `zoneOffset` returning `null` is the right engine behaviour; the
`?? 5.5` at ~40 call sites is the defect, and it needs a product decision about
what the user is told.
