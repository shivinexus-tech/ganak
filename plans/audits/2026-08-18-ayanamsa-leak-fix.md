# F8 fix — the ayanamsa leak (one reader's chart changing another reader's calendar)

**Lane:** `claude/fix-ayanamsa-leak` · worktree `.scratch/worktrees/fix-ayanamsa` · base `origin/main` `cc3113d`
**Fixes:** F8 (P1) in `plans/audits/2026-08-18-bugbash-matching-dosha.md`

## In plain words

Ganak offers astrologers a choice of *ayanamsa* — the small correction that decides
where the zodiac starts. Lahiri is the house convention; Raman sits about a degree
and a half away from it. That choice was meant to apply to the astrologer's own chart.

It did not stay there. The calculation engine kept a single sticky note saying
"the current ayanamsa," and casting a chart overwrote that note for the whole
session without ever putting it back. The moment one reader cast a chart on Raman,
**everything else in the app — including the free daily Panchang, a page that never
offered the choice at all — quietly started answering on Raman too**, until some
unrelated screen happened to overwrite the note again. A degree and a half is enough
to move a tithi, a nakshatra or a muhurat window across a boundary. Two people
sharing a session could be shown two different calendars for the same day, and
nothing anywhere would say a thing had changed.

The choice itself was never the problem, and it has not been taken away. What has
changed is that the choice now travels *with the request that made it* instead of
being left lying around for the next reader to pick up.

## Reproduced first (before any change)

One shared module graph, exactly as the real Vite bundle loads it:

```
baseline (Lahiri)                          Moon sidereal now = 190.3297
after casting a chart on RAMAN             Moon sidereal now = 191.8087
after opening the Mangal-Dosha calculator  Moon sidereal now = 190.3297
```

1.479° of drift, then silently forced back by an unrelated calculator. The instant is
pinned to 2026-08-18 06:30 UTC so the figures are reproducible; the bug-bash run used
`Date.now()`, hence its slightly different numbers for the same 1.479° shift.

**Why the existing gate never saw it:** `validation/_load-app.cjs` bundles each entry
point separately, so `loadApp('src/engine/panchang.ts')` and
`loadApp('src/engine/kundli.ts')` each received their *own private copy* of the
global. The old gate could not observe the leak even in principle. The new
assertions build one shared graph.

**How wide it was.** Sweeping all 16 engine entry points against all three
non-default ayanamsas on the pre-fix code, **39 of 48 combinations contaminated the
shared Panchang**:

```
PRE-FIX LEAK SURVEY — 39 of 48 caster x mode combinations contaminated the shared Panchang:
  LEAK  computeKundli(raman)             Moon 190.3297 -> 191.8087
  LEAK  muhuratForDate(raman)            Moon 190.3297 -> 191.8087
  LEAK  muhuratScanRange(raman)          Moon 190.3297 -> 191.8087
  LEAK  vaishnavaEkadashi(raman)         Moon 190.3297 -> 191.8087
  LEAK  vaishnavaEkadashiDay(raman)      Moon 190.3297 -> 191.8087
  LEAK  vratDetail(raman)                Moon 190.3297 -> 191.8087
  LEAK  computeLagnaPanchaka(raman)      Moon 190.3297 -> 191.8087
  LEAK  computeVedicSeasonClock(raman)   Moon 190.3297 -> 191.8087
  LEAK  medicalMuhuratDay(raman)         Moon 190.3297 -> 191.8087
  LEAK  natalMoonSign(raman)             Moon 190.3297 -> 191.8087
  LEAK  natalAnchors(raman)              Moon 190.3297 -> 191.8087
  LEAK  rectAtMin(raman)                 Moon 190.3297 -> 191.8087
  LEAK  mahaTimelineAt(raman)            Moon 190.3297 -> 191.8087
  ... the same 13 casters again on kp    Moon 190.3297 -> 190.4264
  ... and again on trueChitra            Moon 190.3297 -> 190.3300
```

It was never only `computeKundli`. Every muhurat, panchaka, season-clock, medical and
rectification entry point that accepted an ayanamsa wrote the same global and left it.

## The fix — a parameter, not a global

The audit offered two options: thread the mode through, or save and restore around
each cast. **Threading was chosen.** Save/restore leaves the identical trap standing
for the next caller who forgets the `finally`; the defect *is* the shared mutable
cell, not any one caller's manners.

`src/engine/panchang.ts` now exposes the mode on the call:

- `ayanAt(JD, mode?)`, `sunSidMs(ms, mode?)`, `moonSidMs(ms, mode?)`, `elongMs(ms, mode?)`,
  `lunYogaMs(ms, mode?)`, `planetSidMs(name, ms, mode?)` — an optional trailing mode.
- `sidereal(mode)` — the supported entry point. It returns the whole accessor set bound
  to that one mode, so a caller writes `const S = sidereal(ayanamsa)` once, hands
  `S.moonSidMs` straight to `solveCross` as a callback, and nothing global moves.
- An unknown mode now throws `unknown ayanamsa: …` at the boundary instead of a bare
  `TypeError` forty frames deeper.

Every caster in `src/engine/` was converted: `kundli.ts`, `dasha.ts`, `muhurat.ts`,
`panchaka.ts`, `lakshmi-puja.ts`, `vedic-season-clock.ts`, `medical-muhurat.ts`,
`personal-muhurat.ts`, `navratri.ts`. Two exported readers that took no mode at all —
`dayMuhurat` and `findMuhurat` — gained an optional trailing `ayanamsa`; without it
they are Lahiri by definition instead of "whatever the last caster left."

`natalAnchors` now returns the ayanamsa it was computed on, so `personalFit` reads the
same convention the anchors were built with rather than the ambient one. That is the
only change to any returned shape in the whole lane.

## Proof 1 — the default is untouched

`.scratch/sweep.cjs` dumps every engine entry point that touches the ayanamsa path:
**8 places** (Delhi, Chennai, Guwahati, London, New York, Sydney, Nairobi, Reykjavik —
five continents, both hemispheres, DST and non-DST zones, one above the Arctic-adjacent
latitude band) × **14 dates from 1900 to 2050** (including 1947-08-15, a leap day, two
solstices, a Makar Sankranti and two US/EU DST transition dates), plus a 24-point
sidereal grid per date and month-long muhurat and medical scans per city.

**2,651 keys, 9,131,091 bytes. Before and after are byte-identical.**

```
sweep: 2651 keys, 9131091 bytes -> .scratch/before.json     (pristine cc3113d engine)
sweep: 2651 keys, 9133331 bytes -> .scratch/after.json      (fixed engine)

BYTE-IDENTICAL
6723e79f263c60a95e8fa874aab71958dd55b9ed5b53086b49ac6c13970ce576  .scratch/before.stripped.json
6723e79f263c60a95e8fa874aab71958dd55b9ed5b53086b49ac6c13970ce576  .scratch/after.stripped.json
```

The 2,240-byte size difference is **entirely** the one deliberate shape change:
112 `natalAnchors` results now carry `"ayanamsa":"lahiri"`. Every *computed* value —
2,651 of 2,651 keys — is identical to the last bit; the hashes above are of both dumps
with that single new key removed. Not one number moved by a ULP.

Type-checking noise was also held flat: 294 pre-existing `tsc` errors before, the same
294 after, the same set (only one message now mentions the new optional parameter).
`npm run build` is clean.

## Proof 2 — the leak is gone

Same reproduction, same instant, fixed engine:

```
baseline (Lahiri)                          Moon sidereal now = 190.3297
after casting a chart on RAMAN             Moon sidereal now = 190.3297
after opening the Mangal-Dosha calculator  Moon sidereal now = 190.3297
```

## Proof 3 — gated permanently, fail-then-pass

`validation/chart-styles-ayanamsha.cjs` gained the contamination sweep. It builds one
**shared** module graph (the old per-entry-point bundling is exactly why this was
invisible), takes a full Panchang reading from a session that never cast anything,
then for each of 3 non-default ayanamsas × 16 casters builds a fresh graph, casts, and
requires the Panchang reading to be identical. It also runs every caster on every mode
back-to-back in one graph, because the real app is a long-lived tab and not one call.
Two further blocks assert that non-default modes still *work* (`moonSidMs(ms,'raman')`
still shifts +1.479°, `sidereal()` defaults to Lahiri, an unknown mode throws), and a
source guard fails the build if `setAyanMode` gains a call site.

Red against the pre-fix engine:

```
AssertionError [ERR_ASSERTION]: AYANAMSHA LEAK: computeKundli(raman) changed what the
Panchang answers for everybody else. Moon sidereal went 190.3297 -> 191.8087 at
2026-08-18T06:30:00.000Z. The ayanamsha must be a parameter (see sidereal(mode) in
src/engine/panchang.ts), never a module global.
See plans/audits/2026-08-18-ayanamsa-leak-fix.md.
```

Green against the fixed engine:

```
chart-styles-ayanamsha.cjs OK — 4 ayanamshas (Raman shift verified) + South & East layouts
  + no ayanamsha leak (3 modes x 16 casters, shared module graph)
```

## What remains — one writer, and a handoff

**`src/engine/today-panchang.ts` is now the only module left that sets the ambient
mode** (line 33). It is owned by another lane today, so this lane did not touch it. It
sets the mode and then reads bare accessors, so it cannot be converted without editing
it. It is *self-consistent* — it always writes before it reads — and every screen calls
it with `"lahiri"` (`DailyScreen.tsx:44` hard-codes it; `MuhuratHub.tsx:68` defaults to
it), so no in-app path can contaminate anything today. But the trap is still loaded:

```
### RESIDUAL: the one ambient writer left (today-panchang.ts, NOT this lane's file) ###
baseline (Lahiri)                            Moon sidereal now = 190.3297
after ONE computeTodayPanchang(...,"raman")  Moon sidereal now = 191.8087
after any caller re-sets lahiri              Moon sidereal now = 190.3297
```

**Handoff — whoever owns `today-panchang.ts` next:** replace the `setAyanMode(ayanamsa)`
on line 33 with `const S = sidereal(ayanamsa)` and prefix its `elongMs`/`lunYogaMs`/
`moonSidMs`/`sunSidMs` reads with `S.`. Then delete `setAyanMode` and `AYAN_MODE` from
`panchang.ts` entirely, drop `setAyanMode` from `server/api/engines.mjs` line 36 and its
four now-redundant call sites in `server/api/v1.mjs` (lines 137, 157, 173, 214), and
tighten the gate's source guard to expect zero call sites. That closes the class.

**Why it matters more on the server than in the browser.** `server/api/v1.mjs` runs one
long-lived shared process for every caller. `GET /panchang?ayanamsa=raman` reaches
`computeTodayPanchang` and leaves that process on Raman. Today nothing is harmed: every
other route either passes its own mode (`/muhurat`, `/panchaka`) or re-sets Lahiri
first (`/festivals`, `/hora`). That is luck, not design — one new route that reads
without setting turns this into one customer's ayanamsa choice changing another
customer's Panchang. This lane removed the same hazard from every browser path; the
server path is one small edit from being closed too.

**A consequence worth stating plainly.** Several Jyotish surfaces take no ayanamsa
parameter at all and simply read the ambient: `gochar.ts`, `sade-sati-report.ts`,
`special-points.ts`, `planet-calendar.ts`, `search-upcoming.ts`, `utility-calculators.ts`,
`daily-windows.ts`, `festivals.ts`, `calendar-conventions.ts`. Before this fix, a
practitioner on Raman would see those computed on Raman — *by accident*, and equally
they would have flipped to whatever another tab cast last. They are now deterministically
Lahiri, which is what AGENTS.md says they are and what their own comments claim. If the
product wants transits and Sade Sati to follow the practitioner's chosen ayanamsa, that
is now a one-line change per engine (`sidereal(ayanamsa)`) and a real product decision —
**owner's call, not an accident to be preserved.**

## Files changed

- `src/engine/panchang.ts` — ayanamsa path only (`AYANAMSA`/`AYAN_MODE`/`setAyanMode`
  and the six sidereal accessors); `sidereal(mode)` added. `moonEvents`, `zoneOffset`
  and the lunar-month window were not touched and the file was not reformatted.
- `src/engine/{kundli,dasha,muhurat,panchaka,lakshmi-puja,vedic-season-clock,
  medical-muhurat,personal-muhurat,navratri}.ts` — thread the mode.
- `validation/chart-styles-ayanamsha.cjs` — the contamination sweep and source guard.
- `plans/audits/2026-08-18-ayanamsa-leak-fix.md` — this note.

Not touched, as reserved by other lanes: `today-panchang.ts`, `festivals.ts`,
`matching.ts`, `format.ts`, every screen, `kundli-app.tsx`, design tokens,
`plans/task-log.md`, `plans/backlog*.md`, `plans/backlog-sheet-sync.json`.

**Task-log note:** at base `cc3113d` there is no reservation row for this lane
(`fix-ayanamsa` / `AYANAMSA-LEAK` appear nowhere in `plans/task-log.md`), and this lane
is not permitted to edit that file. The integrator should add the row on merge.

## Status

- [x] Reproduced, in one shared module graph
- [x] Fixed structurally — the mode is a parameter
- [x] Default-Lahiri output proven byte-identical across 2,651 sweep keys
- [x] Leak proven gone
- [x] Gated, fail-then-pass
- [ ] One ambient writer remains in `today-panchang.ts` — handed off above
