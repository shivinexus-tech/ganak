# Independent bug bash — `claude/drik-divergences-c3`

**Date:** 2026-08-15

**Auditor:** Codex

**Target:** exact commit `8e1a29a`

**Disposition:** **do not merge as permanent-quality yet**. The ordinary India
anchors pass, but the moonset rule returns a provably mis-paired set at high
latitudes and the shared clock contract is one-hour wrong across DST.

No product code was fixed in this audit. Disposable probes live under `.scratch/`
and are not part of the branch.

## Findings

### F1 · P1 correctness — the two-day lunar scan can return the previous set after a valid rise

`moonEvents()` stores the first in-day set in `setInDay`, scans only through the
end of the following civil day, and finally returns `setInDay` whenever no closing
set was found. At high latitudes the Moon can rise and remain above the horizon
beyond that two-day window. In that case `rise !== null`, but the function falls
back to a set *before* the rise—the exact pairing error this change is meant to
eliminate.

Measured sweep: 976 sampled place-days (eight locations, every third day of 2026),
comparing the shipped five-minute scan with a one-minute scan. The scan resolution
was stable to under 0.000003 seconds and produced no coarse/fine event-presence
differences, so five minutes did not skip a crossing in this sample. It nevertheless
found **18 `set <= rise` pairings**, including:

| Place/date | Returned rise | Returned set | Set minus rise |
|---|---:|---:|---:|
| Tromsø, 2026-07-09 | 19:30 | 18:25 | −1.08 h |
| Reykjavík, 2026-02-24 | 07:29 | 06:38 | −0.85 h |
| Longyearbyen, 2026-01-25 | 05:17 | 03:50 | −1.44 h |

The submitted gate stays green because its sweep contains only Delhi, Mumbai,
Chennai and Kolkata. This is a real gate escape, not a theoretical mutation.

**Required handback:** when a rise exists, never return `setInDay`. Continue far
enough to find the closing set or return an explicit unavailable value; add polar
and high-latitude anchors that exercise a closing set beyond the current scan.

### F2 · P1 correctness — fixed numeric timezone offsets make next-day clocks wrong across DST

The new formatter accepts one numeric `tz` for the anchor and every later instant.
That cannot represent a panchang night whose civil timezone offset changes. Using
New York fixtures:

| Panchang anchor | Fixed-offset output | IANA-zone output | Error |
|---|---|---|---:|
| 2026-03-07 → next sunrise | `6:18 AM, Mar 8` | `Mar 8, 7:18 AM` | −60 min |
| 2026-10-31 → next sunrise | `7:26 AM, Nov 1` | `Nov 1, 6:26 AM` | +60 min |

The UTC sunrise instant is sound; only its reader-visible local clock is wrong.
The cross-midnight gate uses India only and therefore cannot see this. Half-hour
and quarter-hour fixed offsets do format correctly; the defect is specifically an
offset transition within the sunrise-to-sunrise span.

**Required handback:** the shared contract needs an IANA-zone-aware path (or an
instant-aware offset callback), and a permanent spring-forward/fall-back gate.

### F3 · P2 contract drift — a multi-day window prints two dates, not one at the end

The declared contract says a window prints its date once at the end. A probe whose
start and end are both on different non-anchor days returns:

`11:00 PM, Jan 2–1:00 AM, Jan 3`

That is two date labels. The current gate covers only a window wholly on one next
date (Nishita), so this branch is untested. Several MuhuratHub ranges also call
`fmtTimeD()` independently for each endpoint instead of using `dayRange()`, which
can produce the same doubled-date shape.

**Required handback:** decide the actual long-window layout and pin it. If the
standing one-date contract remains authoritative, `dayRange()` and all range call
sites must follow it.

### F4 · P2 evidence integrity — one “published” Drik moon anchor is not reproducible

The gate records New Delhi 2026-07-25 as moonrise `16:20`, moonset `02:16` on Jul
26. Drik Panchang's current New Delhi monthly page instead lists **moonrise 16:16
and moonset 26:21+** (02:21 Jul 26). Ganak's computed 16:15/02:20 is actually close
to that live source, but the gate's claimed transcription is not what the cited
publisher currently shows. See [Drik Panchang's New Delhi monthly moon table](https://www.drikpanchang.com/astronomy/sunrisemoonrise/monthly/sunrisemoonrise.html?geoname-id=1261481).

The Godhuli rule itself is consistent with independently visible Drik day pages:
Drik starts Godhuli exactly at sunset and varies its length; for example its New
Delhi Jul 30 page shows 19:14–19:34 and its Chennai Jul 30 page shows 18:37–18:59.
The submitted formula reproduces that structure. [New Delhi example](https://www.drikpanchang.com/panchang/day-panchang.html?geoname-id=14823),
[Chennai example](https://www.drikpanchang.com/panchang/day-panchang.html?geoname-id=1264527).

**Required handback:** correct the provenance/date values in the gate and source
matrix, or record why a different Drik location/configuration is authoritative.
This does not presently imply a Ganak lunar calculation error; it is a test-evidence
error.

### F5 · P2 maintainability — festival clocks still duplicate the date contract

`FestivalGuideScreen.tsx::formatLocalClock()` independently compares year/month/day
and appends a date instead of calling `withDayDate()`/`dayClock()`. Its behavior is
currently compatible for ordinary fixed-offset cases, but it disproves the claim
that there is “one shared contract” and leaves a drift path outside the contract
gate. The same file's range surfaces format endpoints one at a time.

This is not the separate Hindi 12/24-hour decision; the clock style can remain a
caller concern while the date-crossing decision is shared.

## Edge-case results that passed

- Five-minute versus one-minute lunar scan: no skipped crossings across 976
  sampled place-days; maximum refined-time delta under 0.000003 seconds.
- No-rise fallback was exercised 34 times; 320 sampled high-latitude days had
  neither event in the scan window.
- Godhuli remained formula-consistent for short/long nights. Measured 2026 range:
  Quito 23.75–23.79 min; Tromsø 2.42–46.51 min; Longyearbyen 2.56–45.53 min;
  McMurdo 4.46–44.44 min. When sunset or next sunrise is absent,
  `computeDailyWindows()` returns unavailable rather than fabricating a window
  (120/242/239 unavailable days respectively at the three polar locations).
- Fixed half-hour (`+09:30`), quarter-hour (`+05:45`) and Dec 31 → Jan 1 cases
  attach the expected date. Null/undefined anchors do not throw, but silently
  suppress date suffixes; callers must continue to surface missing astronomy.

## Gate and mutation evidence

Clean target:

```text
node validation/drik-reference-anchors.cjs
drik-reference-anchors: PASS — 381 checks, 4 published anchors, 360 days swept across 4 cities, 183 cross-midnight moonsets

node validation/cross-midnight-date.cjs
cross-midnight-date: PASS — 8406 checks · contract: 8390 crossing values over 320 day-renders (4 cities × EN/HI) · as-rendered: 8 crossing values on Today in EN and HI
```

Independent negative mutations in disposable copies:

- Replacing both engine fixes with `origin/main` made the reference gate fail on
  the 43/46-minute moonset errors, wrong civil dates, 10–14-minute Godhuli starts,
  exact rule assertions and hundreds of `moonset precedes moonrise` sweep rows.
- Rebinding Today's clock to each value itself made the rendered layer fail three
  times, including exact `till 3:42 AM` without `Aug 15`, while the contract layer
  remained exercised. The gate therefore detects the stated ordinary-latitude
  regressions; F1–F3 are mutations/cases it does not cover.

## Limitations

- Drik pages are dynamic and their indexed output did not expose all four exact
  submitted day/location combinations. The New Delhi lunar mismatch above is the
  exact published monthly row available now; Mumbai/Chennai values were not treated
  as exact-coordinate proof.
- No physical-device or live-URL visual test was appropriate: this is an unmerged
  branch audit. Rendering was checked through the branch's static-render gate.
- No product fixes were made, per the assignment.
