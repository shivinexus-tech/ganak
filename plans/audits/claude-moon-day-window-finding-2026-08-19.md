# Finding — moon events are selected for the wrong panchang day (on `main`)

**Date:** 2026-08-19
**Found by:** Claude
**Status:** **HANDOFF — not fixed.** `src/engine/panchang.ts` (`moonEvents`) is on
the exclusive file list of `CODEX-DRIK-C3-INDEPENDENT-BUGBASH-2026-08-15`, which
is **ACTIVE**. Reporting rather than editing, per the pre-flight rule.
**Measured against:** `origin/main` `4cec288` (not a branch, not a stale base).
**Related:** `C3-MOONSET-DRIK`; the ACTIVE Codex row above already owns
"high-latitude moonset pairing".

---

## The defect in one line

For about a quarter of the year, Ganak reports **the following day's moonset**
(and, symmetrically, the previous day's moonrise) for the panchang day being
displayed.

## Scale, measured

New Delhi (28.6139, 77.2090, Asia/Kolkata), Lahiri, all 365 days of 2026,
comparing each reported event against that day's own sunrise→next-sunrise window:

| | count |
|---|---|
| Moon events reported | 717 |
| Legitimately absent | 13 |
| **Moonrise outside its panchang day** | **92** |
| **Moonset outside its panchang day** | **92** |
| **Total wrong** | **184 (25.7%)** |

The wrong days come in runs of roughly six consecutive days each month, which is
why spot-checking a single date misses it — and why the 25 July anchor already
recorded in `C3-MOONSET-DRIK` now looks correct on `main` while the underlying
fault is untouched.

## Corroborated against Drik, on dates chosen because they fail

Not a single-source claim. Three independent dates, two failing and one control:

| Date (Delhi) | Ganak on `main` | Drik Panchang | Verdict |
|---|---|---|---|
| **3 Jan 2026** | moonset **08:08, 4 Jan** | **"No Moonset"** | Ganak invents a moonset for a day that has none |
| **4 Jan 2026** | moonset **08:55, 5 Jan** | moonset **08:03 AM** (same day) | Ganak is one event late |
| **18 Nov 2026** (control) | moonset **01:05, 19 Nov** | moonset **01:02 AM, Nov 19** | agrees within 3 min |

The 4 January pair is the clearest proof: moonset drifts ~50 min later each day,
so Drik's 08:03 on 4 Jan and Ganak's 08:55 on 5 Jan are **the same sequence one
day apart**. Ganak is not computing a different time; it is selecting the next
occurrence.

Note also what Drik does on 18 Nov: it prints **"01:02 AM, Nov 19"** — the date is
appended because the value crosses midnight. That is the same convention
`C3-CROSSMIDNIGHT-DATE` asks for, and it is worth confirming
`validation/cross-midnight-date.cjs` on `main` already covers moonset specifically.

## Why it happens

`main`'s `moonEvents` scans from **local midnight** and pairs each rise with the
next set that follows it, without bounding the result to the panchang day:

```js
const start = Date.UTC(y, m - 1, day, 0, 0) - tz * 3600000, dayEnd = start + DAY;
...
if (rise === null && ms - step < dayEnd) rise = ...        // rise: civil-day bounded
...
if (rise !== null && cross > rise) { set = cross; break; } // set: unbounded
```

The rise is constrained to the *civil* day and the set to "after that rise" — but
the panchang day is **sunrise → next sunrise**. When the civil day and the
panchang day disagree about which moonrise belongs to the day, the paired set is
dragged along with it.

This is a genuine improvement over the older code, which had the same fault in
the opposite direction (reporting a set that preceded the day's sunrise). The
rewrite fixed the 25 July symptom without changing the day definition, so the
error simply moved from undershoot to overshoot.

## What a fix has to do

1. Select moon events against the **panchang day window** (`anchor = sunrise`,
   `end = next sunrise`), not the civil day.
2. Return **every** crossing in the window, not the first — a caller should never
   be handed the wrong one of two.
3. Report **no moonset** when the window genuinely contains none, as Drik does on
   3 January. Absence is a correct answer, not a gap to fill.
4. Keep the civil-day behaviour available for the callers that legitimately want
   it — eclipse visibility, muhurat scans and festival rules all call
   `moonEvents` and should not silently change.
5. High latitude: `main`'s 16-day pairing search exists for polar cases where the
   Moon stays up for days. A window-bounded selector must still return "none"
   there rather than reaching outside the day.

## Reproduction

A ready-made gate and a DOM-free helper module exist on
`claude/panchang-day-contract` (built on a stale base, so **do not merge it** —
take the two files, not the branch):

- `validation/panchang-day-contract.cjs` — pins the Delhi anchor against the
  reference, asserts every moon event across 365 days lies inside its own
  panchang day, asserts a window scanner returns multiple crossings in order,
  and proves itself non-vacuous. **One assertion must be re-pinned before use on
  `main`:** it asserts the *old* civil-day return value and will fail on `main`
  by design.
- `src/engine/dated-instant.ts` — tags and formats an instant that crosses
  midnight (`02:20` vs `02:20, 26 Jul`, EN and HI). No equivalent on `main`.

Bare reproduction without those files:

```js
// New Delhi, 3 Jan 2026 — expect "no moonset", not 08:08 on 4 Jan
computeTodayPanchang({lat:28.6139,lon:77.2090,zone:'Asia/Kolkata'}, 'lahiri',
  Date.UTC(2026,0,3,12,0) - 5.5*3600000).moonset
```

## Caveat on the reference

Drik is one source, and this repo's own rule is that a divergence from one
reference is a question rather than a verdict. Here it is a verdict, because the
three dates agree on the *rule* rather than on a value: Ganak reports an event
Drik places on a different day, and on the control date — where both agree the
event is inside the day — the two match within three minutes.
