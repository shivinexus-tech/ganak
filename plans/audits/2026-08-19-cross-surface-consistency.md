# Cross-surface consistency — a gate for "two Ganak surfaces state the same fact differently"

- **Date:** 2026-08-19
- **Agent:** Claude (test-infrastructure lane)
- **Branch / worktree:** `claude/cross-surface-consistency` · `.scratch/worktrees/cross-surface`, base `origin/main` `f8c0273`
- **Files added:** `validation/cross-surface-consistency.cjs`, this note. **Nothing else was touched** —
  this lane is read-only on all product code and on every existing gate.
- **Status:** the gate ships green (exit 0). **Four defects it found are NOT fixed here**; they are
  pinned inside the gate so they stay visible and can only shrink, and written up below with
  reproduction and the one-line fix that retires each pin.

---

## Why this lane existed

Two days of adversarial testing produced roughly ninety findings. The single most damaging class was
not "a calculation is wrong" — it was **"two Ganak surfaces state the same fact differently"**: the
matching card calling one partner Manglik while Ganak's own calculator called both; the chart and the
planet calendar disagreeing about retrograde for hours after every station; the dosha panel saying
*Shankhachuda* while its own "Full page →" said *Karkotaka*; the Muhurat hub printing one interval
under both "Good windows today" and "Best avoided today"; a footnote saying *sāyana* in Hindi and
*Sidereal* in English for the same numbers.

Each was found by a human pointing at it. The repository has ~100 gates and every one of them checks
**one** surface against a rule. **Nothing asked whether two surfaces agree with each other**, so the
next one would have shipped too.

### Why this is not "Ganak compared to a copy of Ganak"

AGENTS.md forbids a gate that re-implements a calculation in the harness and then congratulates the
engine for matching it — that passes when both copies are wrong. **This gate re-implements nothing.**
It takes two *different shipping code paths*, each of which a reader can see on a different screen,
and asks whether they say the same thing. A disagreement is a defect whichever side is right, so the
check discriminates without an external oracle. Where a specific **value** is asserted rather than an
agreement, it is anchored to a dated, attributed published source:

| tag | source | what it pins |
|---|---|---|
| `[D-RK]` | drikpanchang.com — Rahu Kalam / Gulikai Kalam / Yamaganda | the eighth-part sequence per weekday |
| `[D-AB]` | drikpanchang.com — Abhijit Muhurat | ~48 min centred on local noon, **void on Wednesday** |
| `[BPHS]` | Brihat Parashara Hora Shastra / every published Manglik table | Mars in houses 1, 2, 4, 7, 8, 12 from Lagna, Moon and Venus |

---

## What the gate does

`node validation/cross-surface-consistency.cjs` — ten sections, ~72 seconds, **5,478 cross-surface
agreements verified** on a green run.

| § | The two (or three, or four) surfaces | What is compared |
|---|---|---|
| §1 | engine name tables vs `src/i18n/panchang-terms.ts`; four private window-label tables | one word for one thing |
| §2 | birth chart · planet calendar card · gochar timeline · upcoming-transit line | retrograde and sign, swept through all 12 of 2026's stations |
| §3 | matching card · `/calculator/mangal-dosha`; chart dosha panel · its own "Full page →" | Manglik verdict, Kala Sarpa / Pitra / Papa verdicts, and the panel's ayanamsa disclosure |
| §4 | Panchang screen · muhurat finder · medical muhurat screen | Abhijit and the Rahu/Gulika/Yamaganda belts, same day, same city |
| §5 | "Good windows today" lane · "Best avoided today" lane, on one card | the two lanes must be disjoint |
| §6 | Panchang daily-windows card · festival guide's Lakshmi Puja panel | one interval per name |
| §7 | the on-screen note "Rahu, Gulika and Yamaganda are excluded" · the windows above it | a claim about another surface must be true |
| §8 | every rendered screen in English · the same screen in Hindi | clock times, worded and numeric dates, years, score fractions |
| §9 | English "Sidereal"/"Tropical" · Hindi निरयण/सायन, on every rendered surface | one convention, one word, both languages |
| §10 | the source tree against itself | duplicated literal tables, duplicated speed estimators |

Coverage actually swept, printed by the gate itself:

```
  §2  12 stations of 2026 cross-checked between the planet calendar, the gochar timeline and the transit line; 276 chart-vs-calendar retrograde samples around them; 53 dates × 9 grahas of sign placement
  §3  500 births swept for Manglik (matching card vs calculator) and 120 for Kala Sarpa / Pitra / Papa (chart panel vs "Full page →")
  §4  150 city-days across 5 cities: Abhijit, Rahu, Gulika and Yamaganda compared between the Panchang screen, the muhurat finder and the medical screen
  §5  750 activity-days of the Muhurat hub's own two lanes
  §6  100 city-evenings of Pradosha (Panchang daily-windows card vs the festival guide's Lakshmi Puja panel)
  §7  3192 windows rendered under the "Rahu, Gulika and Yamaganda are excluded" note, checked against those three belts
  §8  30 rendered surfaces compared English-vs-Hindi (clock times, worded and numeric dates, years, score fractions)
  §10 127 source files scanned for duplicated literal tables and duplicated speed estimators
```

### What it does NOT cover

Stated plainly, because a green run on a gate whose reach is oversold is worse than no gate.

- **Layout, overflow, contrast, focus order.** §8 and §9 read rendered TEXT through
  `renderToStaticMarkup`, exactly as `screen-snapshots.cjs` does: no effects, no layout box, no CSS.
- **Screens not in `snapshot-generate.cjs`'s `SCREENS` list**, and any surface that only appears after
  an interaction that is not seeded there — MuhuratHub, CalendarPage's month/day views,
  FestivalGuideScreen, ChartScreen's own dosha cards. §4–§7 reach those surfaces at the **engine**
  level instead, calling exactly the functions those screens call. That proves the values agree; it
  does not prove the screen renders them. **Rendering MuhuratHub and ChartScreen with seeded state is
  the single biggest extension available to this gate** (see Handoffs).
- **Server-side facts** (`server/`, `functions/`) are not loaded.
- **Any fact only one surface states.** This gate is blind by construction to a value that is wrong
  everywhere at once. That is what the anchored gates are for (`drik-reference-anchors`,
  `muhurat-anchors`, `adhik-masa`, `vimshottari-dasha`, …).
- **§10's static hunt** finds duplicates by pattern. A duplicate written a different way is invisible
  to it, so its inventory is a floor, not a ceiling.

---

## Findings — recorded, pinned, NOT fixed

All four are **on `origin/main` `f8c0273`**, reproduced by the gate itself. Run
`node validation/cross-surface-consistency.cjs --pins` for the full evidence block for each.

### F1 (P1) — the Muhurat hub still recommends and forbids the same minutes

This is the known 2026-08-18 finding. **It is still live.** MuhuratHub renders "Good windows today"
and "Best avoided today" side by side from one object; the good lane is a choghadiya filter and the
avoid lane is the three belts, and nothing subtracts one from the other.

```
src/screens/MuhuratHub.tsx:458  goodSlots  = allChogha.filter(c => ev.good.includes(c.key) && c.end > nowMs).slice(0, 6)
src/screens/MuhuratHub.tsx:459  avoidSlots = [["rahu", todayP.rahu], ["gulika", todayP.gulika], ["yama", todayP.yama]]…
```

Measured: **540 of 750 activity-days** across five cities carry at least one such interval, and the
worst cases are identical to the minute:

```
Delhi 2026-01-05 · activity "travel":   "char" 08:14Z..09:32Z under GOOD, Gulika Kalam 08:14Z..09:32Z under AVOID  ← identical
Delhi 2026-01-31 · activity "purchase": "labh" 08:25Z..09:46Z under GOOD, Yamaganda    08:25Z..09:46Z under AVOID  ← identical
```

**Both surfaces are computed correctly.** The choghadiya *is* Char; the belt *is* Gulika. The defect is
that one card offers a reader a window it forbids six inches to the right.

**Resolves the pin:** subtract the belts from `goodSlots`. `src/engine/hora-verdict.ts subtractWindows`
already does exactly this — for the hora lane **on the same screen**, three lanes down. Pin
`XS-MUHURAT-LANES`, expected 540.

### F2 (P1, NEW) — the screen says the belts are excluded, and for six activities they are not

Under the best-day window list MuhuratHub prints, in both languages:

> "These windows come from this activity's own filter; Rahu, Gulika and Yamaganda are excluded."
> "ऊपर के समय इस कार्य की अलग छँटाई से निकले हैं; राहु/गुलिक/यमगण्ड हटाए गए हैं।"

`src/engine/muhurat.ts:422 activityWindows` has two branches feeding that one list:

```js
if (PANCHAKA_WINDOW_CATEGORIES.has(category)) {          // wedding, engagement, housewarming,
  const clean = (p.panchakaWindows || [])                // bhoomi, construction, puja
    .filter((w) => w.shubha && …)                        // ← shubha only. The belts are never read.
  return clean.length ? clean : cleanChoghadiyaWindows(info, category);
}
return cleanChoghadiyaWindows(info, category);           // ← this branch DOES subtract the belts (417-419)
```

Measured: **630 of 3,192** windows rendered under that note overlap a belt. The seven
choghadiya-driven activities (travel, business, venture, document, property, vehicle, purchase) are
clean; the six Panchaka-driven ones are not — and the note is identical.

```
Delhi 2026-01-05 "wedding": a panchaka-rahita window 07:54Z..08:35Z overlaps Gulika 08:14Z..09:32Z
                            (also engagement, housewarming, bhoomi, construction, puja — same window)
```

That the six affected activities are **weddings, engagements and housewarmings** is why this is P1
rather than P2: they are the activities a reader is most likely to act on.

**Resolves the pin:** run the panchaka-rahita branch through the same belt subtraction, or stop
printing the exclusion note over windows that were never filtered. Pin `XS-EXCLUSION-CLAIM`,
expected 630.

### F3 (P2, NEW) — two intervals ship under the name Pradosha

`Pradosha` on the Panchang daily-windows card and `Pradosh Kaal` on the festival guide's Lakshmi Puja
panel are the same word to a reader and two different intervals in the code:

```
src/engine/daily-windows.ts:248  pradosha = { start: set - (set - rise)/10, end: set + (nextRise - set)/10 }   // 3 muhurtas CENTRED on sunset
src/engine/lakshmi-puja.ts:49    pradosh  = { start: set,                   end: set + nightLen/5 }            // sunset → first fifth of night
```

**100 of 100** sampled city-evenings differ, by roughly an hour at each end:

```
Delhi 2026-01-09: daily-windows "Pradosha" 11:08Z..13:32Z · Lakshmi-Puja "Pradosh Kaal" 12:11Z..14:54Z  (starts 63 min apart, ends 81 min apart)
Delhi 2026-03-01: daily-windows "Pradosha" 11:41Z..14:05Z · Lakshmi-Puja "Pradosh Kaal" 12:50Z..15:19Z  (starts 69 min apart, ends 74 min apart)
```

`src/engine/festivals.ts:529` uses the daily-windows form to *decide* the festival day, while the
Lakshmi Puja panel on that same festival page shows the other. `lakshmi-puja.ts`'s own header
attributes its definition to Drik Panchang; `daily-windows.ts` cites no source for its.

**Resolves the pin:** pick one, put it in one place, have both surfaces read it. Pin
`XS-PRADOSHA-TWO`, expected 100.

### F4 (P3, NEW) — one window, four hand-written label tables, two English spellings

```
"Rahu Kalam"      ←  src/i18n.ts (tr(lang, "rahuL"))            "Rahu Kaal"   ←  src/components/TimingLanes.tsx BLOCKER_LABEL
"Rahu Kalam"      ←  src/screens/MuhuratHub.tsx winName          "Rahu Kaal"   ←  src/data/medical-muhurat-ui.ts
"Gulika Kalam"    ←  i18n.ts, MuhuratHub                         "Gulika Kaal" ←  TimingLanes.tsx
"Abhijit Muhurat" ←  i18n.ts, MuhuratHub                         "Abhijit Muhurta" ← medical-muhurat-ui.ts
```

MuhuratHub **renders TimingLanes** (`MuhuratHub.tsx:1373`), so "Rahu Kalam" and "Rahu Kaal" appear on
one screen, one above the other. The Hindi is consistent (राहु काल everywhere) — English is the
degraded language here, which is the same shape as the Papa Dosha finding closed on 2026-08-19.

**Resolves the pin:** delete the three private tables; read `tr(lang, "rahuL"/"gulikaL"/"yamaL"/"abhijitL")`.
Pin `XS-LABEL-BELTS`, expected 3 (three keys disagreeing in English).

### F5 (structural, pinned as an inventory) — where the next disagreement will come from

Facts computed **twice** are where the disagreements have actually been. The August retrograde defect
was fixed by *deleting* a duplicate speed estimator, not by making two copies agree. So the duplicates
themselves are an output of this gate, pinned as an inventory that may only shrink.

**Five separate implementations of "how fast is this planet moving"** (`XS-DUP-SPEED`, expected 5):

| where | step | frame |
|---|---|---|
| `src/engine/planet-calendar.ts:21` `planetSpeed` — **the one definition**; `computeKundli` already imports it | centred ±12 h | sidereal |
| `src/engine/gochar.ts:24` (local `speed` inside `signSeq`) | centred ±12 h | sidereal |
| `src/engine/panchang.ts:332` (local `speed` inside `upcomingEvents`) | centred ±12 h | sidereal |
| `src/screens/PrashnaScreen.tsx:263` `PR_speed` | centred ±12 h | Prashna's own ephemeris **and own ayanamsa** |
| `src/engine/kundli.ts:180-183` (Shadbala's Cheshta Bala input) | **backward, 0.5 day** | **tropical** |

The last one is the odd member and the live risk: it is the *same shape of estimator* that produced
the F8 retrograde defect, still shipping on one chart object alongside `rows[].retro` computed the
other way. Its output is a score rather than a stated retrograde flag, so no reader currently sees
two answers — but nothing stops that.

**23 literal tables typed out in more than one module** (`XS-DUP-TABLES`, expected 23). The ones that
matter: the 27 Latin nakshatra names (`panchang.ts` + `panchang-terms.ts` — `language-leak-scan.cjs`
proves there is one *Devanagari* table, nothing proved the Latin ones agree), the Gregorian month
names (three screens plus `birth-input.ts`), the weekday names (`muhurat.ts` + `panchang-terms.ts`),
and the Manglik house set `[1,2,4,7,8,12]` (`doshas.ts` + `mangal-dosha.ts` + `matching.ts`).

---

## What the gate found to be CLEAN — and therefore now locks

Named explicitly, because "found nothing new" is a result only if you say what was looked at.

- **Retrograde and sign.** The chart, the planet calendar card, the gochar timeline and the
  upcoming-transit line agree at all 276 sampled instants around all 12 of 2026's stations, and on
  sign placement for 53 dates × 9 grahas. The August fix (one `planetSpeed`) holds; the three
  remaining copies are algebraically identical **today**, which is exactly why F5 pins them.
- **Manglik.** 500 births: the matching card's `manglikProfile` and the calculator's
  `mangalDoshaReport` agree on presence, strength, raw count, adjusted score, and all three
  reference houses and mitigations — despite being two implementations of one published rule.
- **Kala Sarpa / Pitra / Papa.** 120 births: the chart panel and its own "Full page →" agree on a
  Lahiri chart, and the panel still carries the ayanamsa disclosure in both languages.
- **Abhijit and the three belts.** 150 city-days: the Panchang screen, the muhurat finder and the
  medical screen print the same clock times, and none of them offers Abhijit on a Wednesday `[D-AB]`.
- **English vs Hindi.** All 30 rendered surfaces state the same clock times, the same dates (worded
  and numeric, across both locale orders), the same years and the same score fractions. Nothing like
  "27 August in Latin, 28 August in Devanagari" survives anywhere the snapshot harness can see.
- **निरयण / सायन.** No rendered surface names the opposite zodiac in the two languages.

Two cosmetic differences were observed and deliberately **not** reported as failures, because the
value agrees: the Daily ghati sentence writes `6:19 am` in English and `6:19 AM` in Hindi, and the
date header writes `14 अग` where the rest of the Hindi render writes `15 अग॰`.

---

## Handoffs (this lane is read-only; none of these were done here)

1. **F1–F4 above.** Each pin names the one-line fix that retires it. Fixing one must be followed by
   re-running the gate and lowering (or inverting) its pin — a pin that rots hides the next regression.
2. **Render MuhuratHub and ChartScreen with seeded state**, the way `snapshot-results.cjs` already
   seeds MatchingScreen and PrashnaScreen. §4–§7 currently reach those screens at the engine level;
   with a seeded render they would be compared as *rendered text*, which is what a reader sees, and
   §8's English-vs-Hindi sweep would cover them too. This is the largest single increase in this
   gate's reach.
3. **Retro state is carried as an English substring.** `src/engine/panchang.ts:347` encodes
   retrograde only inside the label `"… turns retrograde ℞"`, and `DailyScreen.tsx:372` sniffs for
   `℞` to colour the row while `transit-copy.ts:144` regex-replaces the phrase for Hindi. A wording
   change silently drops the colouring. A boolean on the event would make it checkable.
4. **`/v1/muhurat` publishes nulls.** `server/api/contract.mjs:113-121` reads `d.date`, `d.verdict`,
   `d.reasons`, `d.windows`; `muhuratScanRange` emits `y/m/day`, `score`, `valid`, `blockers`,
   `activityWindows`, `samskaraWindows`. Noticed while mapping the surfaces, **not verified by this
   gate** (it does not load the server) — worth an independent check by whoever owns the API.

---

## Fail-then-pass proof

See the commit that follows this note. The historical disagreement reintroduced is the Manglik one:
`MANGLIK_HOUSES` in `src/engine/matching.ts` dropped house 2, so the matching card and the Mangal
Dosha calculator read one birth differently — the shape of the original finding, "the matching card
said one partner was Manglik while Ganak's own calculator said both were". The gate went red with a
named birth, a named reference and both surfaces' answers; the edit was reverted and it went green.
