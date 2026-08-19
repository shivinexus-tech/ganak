# Bug bash — Vimshottari dasha + transits (independent adversarial pass)

- **Date:** 2026-08-18
- **Agent:** independent adversarial test agent (Claude), branch `claude/bugbash-dasha-transit`,
  worktree based on `origin/main` `8752753`.
- **Why this surface:** a dasha table is the practitioner's answer to *when*. Unlike a chart it
  has no visual tell — a wrong table looks exactly as plausible as a right one. Ganak ships
  **106 validation gates and not one of them tests a Vimshottari period.** `ruling-planets.cjs`
  touches `dasha.ts` only for the KP Ruling-Planet strip; nothing anywhere asserts a mahadasha
  start date, an antardasha span, or that the levels tile.
- **Scope:** `src/engine/dasha.ts`, the Vimshottari block of `src/engine/kundli.ts`,
  `src/components/DashaTree.tsx`, the dasha + marriage regions of `src/screens/ChartScreen.tsx`,
  `src/engine/marriage-timing.ts`, `src/engine/gochar.ts`, `src/engine/transit-copy.ts`,
  `src/engine/planet-calendar.ts`, `panchang.ts upcomingEvents`, the transit region of
  `src/screens/DailyScreen.tsx`, `src/engine/search-upcoming.ts`, and the gates
  `validation/ruling-planets.cjs` and `validation/transit-event-language.cjs`.
- **Standing:** READ-ONLY on all product code. Nothing under `src/` or `validation/` was
  modified. This document is the only write. Probe scripts live in `.scratch/bugbash/`
  (gitignored, inside the worktree).
- **Baseline:** `ruling-planets.cjs` and `transit-event-language.cjs` are green before and after
  this pass. **Every finding below is invisible to both, and to all 106 gates.**

## Pass log

| # | Pass | What it probed | How |
|---|------|----------------|-----|
| 1 | Vimshottari arithmetic | Balance of dasha from the Moon's nakshatra fraction; the 120-year cycle; the nine mahadasha lengths; antar/pratyantar/sookshma/prana proportions; **exact tiling** of every level against its parent, four levels deep, all nine lords. | `.scratch/bugbash/p1-vim.cjs` |
| 2 | Boundaries | Nakshatra cusp to the minute; near-zero and near-full balance; the very start/end of the 120-year table; leap day 2000-02-29; a full sweep of the **supported** 1800–2150 birth-year range; two-digit years; determinism including after an ayanamsa switch. | `.scratch/bugbash/p2-bound.cjs`, `p2b-sweep.cjs` |
| 3 | Transits, cross-surface | The same ingress and the same station computed by three independent code paths — `upcomingEvents` (Daily card), `planetGochar` (the expanded panel under that card) and `planet-calendar.ts` (the planet-calendar card) — compared instant by instant across 2026; gochar's "now here" sign vs a direct `planetSidMs` reading for all nine grahas. | `.scratch/bugbash/p3-transit.cjs` |
| 4 | Bilingual + copy | Rendered EN/HI text of the dasha card (maha table, progress bar, five-level strip, antar tree) and the transit card, plus every convention footnote on a transit surface. | `.scratch/bugbash/render-chart.cjs`, source read |
| 5 | Timing claims | `marriage-timing.ts` and the marriage card against `plans/religious-content-policy.md`. | source + probes |

### How the dasha and transit surfaces were rendered

`renderToStaticMarkup` runs no handlers, so a screen snapshot of ChartScreen only ever sees the
empty birth form — which is why no committed baseline has ever contained a dasha date. Following
the technique recorded in `plans/audits/2026-08-18-bugbash-matching-dosha.md`, the probes
intercept `React.useState` by call order and seed the slots that hold the cast result
(`ChartScreen` #10 `result`, #11 `chartContext`, #19 `openD`; `DailyScreen` #14 `expandedEvent`)
with a **real** `computeKundli` / `upcomingEvents` output, then render. **Every "observed" block
below is literal harness output**, not a paraphrase.

---

## Published reference anchors (recorded, so the next pass does not re-fetch them)

Drik Panchang, New Delhi (`geoname-id=1273294`), fetched 2026-08-18. Ganak's nakshatra-exit
instant is the direct input to the balance of dasha, so pinning it pins the balance:

| Birth date | Drik: nakshatra ends | Ganak (bisected `moonSidMs`) | Δ |
|---|---|---|---|
| 1990-01-01 | Dhanishtha upto **12:22 PM** | Dhanishta → Shatabhisha **12:21** | 1 min |
| 1975-06-15 | Magha upto **02:11 PM** | Magha → Purva Phalguni **14:09** | 2 min |
| 2001-09-11 | Mrigashira upto **10:38 PM** | Mrigashira → Ardra **22:36** | 2 min |
| 1948-01-30 | Uttara Phalguni upto **09:14 AM** | Uttara Phalguni → Hasta **09:12** | 2 min |
| 2024-02-29 | Chitra upto **10:22 AM** | Chitra → Swati **10:21** | 1 min |

**The Vimshottari arithmetic itself is correct.** Delhi 1990-01-01 12:00 IST: Moon 306.4687°
sidereal = Dhanishta 98.51 % elapsed, star lord Mars, balance `(1 − 0.9851) × 7 = 0.1039 y`,
Mars mahadasha ending 1990-02-08 — which is exactly what Ganak prints. The nine mahadasha
lengths, the sequence, the `yrs/120 × parent` proportion at every level and the 120-year total
all check out (see the CLEAN section). The defects below are elsewhere.

---

## Findings

### F1 — P0 · The transit card tells the Hindi reader the opposite zodiac from the English reader, and contradicts Ganak's own planet calendar

The Rashi Gochar panel's convention footnote — the one line a practitioner reads to decide
whether to trust the dates above it.

**Reproduction:** `node .scratch/bugbash/render-daily.cjs`, Delhi, expand any planetary event.

**Observed — the same footnote, same card, two languages:**
```
EN  Sidereal (Lahiri) · times in Delhi time · ±1 day for slow planets
HI  सायन (लाहिरी) · समय Delhi समय अनुसार · धीमे ग्रहों हेतु ±1 दिन
```

**Expected:** सायन (*sāyana*) means **tropical**. The Hindi word for sidereal is **निरयण**
(*nirayana*). The Hindi line therefore states the exact opposite of the English line about the
same numbers.

This is not a debatable rendering — **Ganak's own copy settles it in two other places**:
- `src/components/PlanetCalendarCard.tsx:62` — the *other* transit surface — pairs the identical
  English string with `"निरयण (लाहिरी)"`.
- `src/screens/UtilityCalculatorScreen.tsx:13` glosses the Moon sign as
  `"लाहिरी निरयन चन्द्र राशि"` and the Sun sign as `"लाहिरी निरयन सूर्य राशि—सायन राशि नहीं"`
  — *Lahiri sidereal, **not** the sayana sign*. The transit panel labels the Lahiri numbers
  with the very word the calculator page uses to say what they are not.
- `src/screens/DailyScreen.tsx:340` on the *same screen* says `"सूर्य का निरयण राशि-प्रवेश"`.

**Cause:** `src/screens/DailyScreen.tsx:424`.
**Fix:** `सायन (लाहिरी)` → `निरयण (लाहिरी)`. Then settle the spelling — the app has both
`निरयण` (PlanetCalendarCard, SeasonClockCard, DailyScreen:340) and `निरयन`
(UtilityCalculatorScreen:13) — and extend `language-leak-scan.cjs` with a rule that
`सायन` may never appear on a surface whose English says "Sidereal".

---

### F2 — P0 · The antardasha list opens fifteen months before the native was born, and silently drops the first three sub-periods

**Reproduction:** cast 29 Feb 2024, 23:59, Kolkata (22.5726 N, 88.3639 E, IST). Open the
Vimshottari card. `node .scratch/bugbash/render-chart.cjs`.

**Observed (literal harness output, EN — the Hindi is identical):**
```
Lord  From          To            Years
Rahu · current   29 Feb 2024   5 Dec 2032   8.8
...
Rahu Antardashas — tap any period to drill down
▸ Mercury   17 Nov 2022 – 6 Jun 2025
▸ Ketu       6 Jun 2025 – 24 Jun 2026
▾ Venus     24 Jun 2026 – 24 Jun 2029   now
```

Two claims, five lines apart, on one card: the mahadasha begins **29 Feb 2024**; the first
antardasha inside it begins **17 Nov 2022** — 469 days before the native existed. A practitioner
reading down the card has no way to know which line to believe.

Worse, the list is also **incomplete**: the Rahu antar sequence is Rahu → Jupiter → Saturn →
Mercury → …, and the first three are gone entirely, with no ellipsis, no "before birth" marker
and no note. The reader sees a Rahu mahadasha whose sub-periods begin at Mercury.

**Expected:** Vimshottari sub-periods of a *balance* mahadasha are correctly computed over the
notional full span (the code does this, and it is the right convention) — but the **rendered**
period must be clipped to the native's life: the surviving first antar should start at the birth
instant, and the periods that fell wholly before birth should either be shown greyed with a
"before birth" label or explicitly summarised, never silently deleted.

**Cause:** `src/engine/kundli.ts:104` —
`antars = vimSub(current.lord, fullStart, current.yrs * YEAR).filter((a) => a.end > birthMs);`
The filter drops the fully-prenatal periods but leaves the straddling one un-clipped;
`src/screens/ChartScreen.tsx:1236` renders `r.antars` verbatim, and
`src/components/DashaTree.tsx:18` recurses `vimSub(p.lord, p.start, …)` so every pratyantar,
sookshma and prana under that first antar inherits the pre-birth start.

**Fix:** clamp on the way out —
`.map((a) => ({ ...a, start: Math.max(a.start, birthMs) }))` after the filter — and add a
count/label for the periods that elapsed before birth. **Reach:** every chart whose *current*
mahadasha is the balance mahadasha, i.e. every native younger than their balance period —
routine for child and young-adult charts, which is exactly the audience for a "when" question.

---

### F3 — P0 · Searching for Purnima gives one date in Latin and a different date in Devanagari, and the Latin answer contradicts Ganak's own event engine

**Reproduction:** Calendar page search box, Delhi, "today" = 18 Aug 2026.
`node .scratch/bugbash/p6b.cjs`.

**Observed:**
```
purnima     2026-08-27(tithi:Purnima)   2026-09-26   2026-10-25
पूर्णिमा     2026-08-28(fast:purnima)    2026-09-26   2026-09-26
amavasya    2026-09-10(tithi:Amavasya)  2026-10-10   2026-11-08
अमावस्या     2026-09-11(fast:amavasya)   2026-10-10   2026-10-10

exact instants from the engine (upcomingEvents / solveCross):
   Purnima   2026-08-28 09:48 IST
   Amavasya  2026-09-11 08:57 IST
```

Three Ganak surfaces, two answers. The Devanagari search and the "Upcoming planetary events"
card both say **28 Aug**; the Latin search says **27 Aug**, a day early. Same for Amavasya
(11 Sep vs 10 Sep).

**Expected:** one date. The Devanagari/event-card answer is the right one — the full moon
instant is 28 Aug 09:48 IST.

**Cause:** `src/engine/search-upcoming.ts:53-80`. The generic-tithi branch samples the tithi
index at local **noon** of each day (`noon(k)`, line 14) and reports the first civil day on which
the tithi is *current at noon*. Purnima tithi begins ~27 Aug morning and ends 28 Aug 09:48, so
noon on 27 Aug is inside it and 27 Aug wins. The Devanagari query never reaches this branch at
all — the tithi matchers are Latin-only (`lowerT`, `isPurnima`, `isAmavasya`) — so it falls
through to `scanPanchangCalendar`, which applies the real observance-day rule and answers
correctly.

**Fix:** the tithi branch must use the same observance-day rule as `scanPanchangCalendar`
(or be replaced by it), and the tithi matchers must accept Devanagari via
`src/i18n/panchang-terms.ts` `TITHI_HI` so both scripts take the same code path.

---

### F4 — P1 · For 67 % of the birth years Ganak says it supports, the entire dasha drill-down silently disappears

`src/components/birth-input.ts:33` declares the supported range **1800–2150** and rejects
anything outside it with an explicit message. Inside that range, the whole Vimshottari
drill-down vanishes without a word.

**Reproduction:** cast any chart with a birth date before ~1910 or after today —
e.g. 2 Oct **1869**, 07:45, Porbandar; or 15 Jun **2030**, Delhi.
`node .scratch/bugbash/p2-bound.cjs`, `p2b-sweep.cjs`.

**Observed:**
```
births sampled 702 over the SUPPORTED 1800-2150 range; 473 (67.4%) render NO current dasha,
NO antardasha tree, NO drill-down, NO progress bar
affected birth years: 1800-1909, 1911-1914, 1919, 2027-2150

 1869: tableEnds 1985-04-01  current=UNDEFINED  antars=0
 1900: tableEnds 2019-10-18  current=UNDEFINED  antars=0
 2030: tableEnds 2142-09-03  current=UNDEFINED  antars=0
```

What the reader gets is a bare nine-row table and then nothing — no "current" highlight, no
"% elapsed" bar, no five-level *Maha › Antar › Pratyantar › Sookshma › Prana* strip, no
antardasha tree, and **no message explaining why**. AGENTS.md: *"Errors must surface visibly in
the UI. Silent failure is unacceptable."* The marriage card then prints
*"No clearly supportive window found in the next twenty years"* — a substantive-sounding
astrological statement whose actual cause is that the timeline ran out.

**Cause:** `src/engine/kundli.ts:88-97` builds exactly **nine** mahadashas — one 120-year cycle
from birth — and `current = dashas.find(d => now >= d.start && now < d.end)` returns `undefined`
outside it; `src/screens/ChartScreen.tsx:1193` gates the entire block on `{r.current && …}`.
Vimshottari repeats after 120 years; the engine stops.

**Fix:** extend the timeline until it covers `now` (repeat the cycle — 2–3 cycles is cheap), and
when `current` is still absent, say so in words instead of rendering nothing.

---

### F5 — P1 · Every date and time in the Vimshottari surface is hardcoded English, in both languages

**Reproduction:** the Hindi render in `render-chart.cjs`.

**Observed (HI):**
```
स्वामी    आरम्भ         अंत           वर्ष
राहु · वर्तमान   29 Feb 2024   5 Dec 2032   8.8
गुरु            5 Dec 2032    5 Dec 2048   16.0
…
वर्तमान प्राण: राहु · 19 Aug, 5:25 AM – 20 Aug, 7:46 PM
▸ बुध    17 Nov 2022 – 6 Jun 2025
▸ शुक्र   24 Jun, 7:36 PM – 25 Jul, 6:06 AM
▸ गुरु    25 Sept, 3:38 PM – 20 Oct, 12:02 AM
```

Lord names are correctly Devanagari (they go through `planetName`). Every **date** — the entire
answer to "when" — is Latin, including the month abbreviations and the inconsistent
`Sept`/`Dec`/`Jun` mix that `en-IN` produces.

**Expected:** the app already has a language-aware date formatter and uses it on the transit
card two screens away — `fmtDateZone(ms, tz, lang, zone)` at `src/components/format.ts:56`,
which renders `17 अग॰`, `15 जून 2026`. The dasha surface uses a different helper that has no
`lang` parameter at all.

**Cause:** `src/components/format.ts:95-102` — `fmtDateT(ms, tz, withTime)` hardcodes
`toLocaleDateString("en-IN", …)`. Called from `ChartScreen.tsx:1183, 1184, 1228`,
`DashaTree.tsx:27`, and also `RectifyScreen.tsx` and `JyotishBnnScreen.tsx:163`, so the whole
"Dashas" panel group is affected.

**Fix:** give `fmtDateT` a `lang` parameter (or route it through `fmtDateZone`) and thread
`lang` from the four call sites. Add the dasha date column to `validation/snapshot-results.cjs`
— it currently mirrors the dasha **lord names** only (`snapshot-results.cjs:57`), which is
precisely why this survived the 2026-08-18 B10 centralisation pass.

---

### F6 — P1 · The only explanation of a transit is English-only, and is printed verbatim into the Hindi journey

**Reproduction:** Hindi Daily screen, Delhi, expand any planetary event.
`node .scratch/bugbash/render-daily.cjs`.

**Observed (HI):**
```
17 अग॰ · 7:48 AM
सूर्य प्रवेश सिंह · संक्रांति
2d 22h
▼
Sankranti marks the Sun's entry into a new sign, shifting seasonal energies and the rhythm of nature.
सूर्य राशि गोचर
…
कन्या        30 days      17 सित॰ 2026 · 7:43 AM
धनु          29 days      16 दिस॰ 2026 · 10:15 AM
मेष          1m 1d        14 अप्रैल 2027 · 3:17 PM
```

Three separate English leaks, all inside Devanagari:
1. **`EVENT_DESC`** (`src/engine/transit-copy.ts:19-27`) — all six glosses are English-only, and
   `eventDetail` (line 29) returns `desc` with no language argument. This is the *entire*
   explanation the "answer-before-data" principle promises a Hindi reader.
2. **`timeStr`** (`transit-copy.ts:37`) — `"2d 22h"`, `"5h"`, and the literal word **`"Today"`**.
3. **`fmtDur`** (`transit-copy.ts:4-16`) — `"30 days"`, `"1m 1d"`, and the plain string
   `"ongoing"` at `DailyScreen.tsx:395`.

**Why the gate missed it:** `validation/transit-event-language.cjs` proves `transitLabel` is
clean in both languages. It never touches `eventDetail`, `EVENT_DESC` or `fmtDur` — the three
strings that surround the label on screen.

**Fix:** make all three bilingual (`{en, hi}` records keyed the same way as `LUNATION_GLOSS`,
which is already correct), and extend the gate past `transitLabel` to the whole rendered row.

---

### F7 — P1 · The marriage card prints a date range that is not the dasha period it names

**Reproduction:** cast 29 Feb 2024, 23:59, Kolkata. Read the "Marriage — supportive timing"
card. `node .scratch/bugbash/p10-marriage.cjs`.

**Observed:**
```
 card row: "Mar 2042 – Jun 2043   Jupiter / Venus dasha"
   TRUE Jupiter/Venus antardasha: Oct 2040 – Jun 2043   *** card start is 1.37 y later ***
```

The four rows below it are exact. Only the first is wrong, and it is wrong every time, because
`src/engine/marriage-timing.ts:37` clamps `start` to the marriageable-age floor
(`fromMs = birthMs + 18 × YEAR`, line 23) while still labelling the row with the antardasha's
name — and the card never says a clamp happened. The dasha tree on the same screen shows
Jupiter/Venus beginning Oct 2040. Same page, two start dates for one period.

**Expected:** either print the period's real span and mark the pre-18 part, or say in the row
that the window has been trimmed to marriageable age.

**Fix:** carry both (`periodStart`, `windowStart`) and render the difference explicitly.

---

### F8 — P1 · The birth chart and the planet calendar disagree about retrograde for six hours after every station

**Reproduction:** `node .scratch/bugbash/p7-retro.cjs` — sweeps ±36 h around all 12 of 2026's
station events at one-hour resolution and compares `computeKundli(...).rows[p].retro` with
`planetStatesAt(t)`.

**Observed:**
```
station events in 2026: 12
total disagreeing hourly samples: 79
  Mercury station 2026-02-26 06:48 UTC: disagree for 7 sampled hours, 06:48 .. 12:48 UTC
  Jupiter station 2026-03-11 03:29 UTC: disagree for 6 sampled hours, 03:29 .. 08:29 UTC
  Saturn  station 2026-07-26 19:27 UTC: disagree for 7 sampled hours, 19:27 .. 01:27 UTC
  Venus   station 2026-10-03 07:14 UTC: disagree for 7 sampled hours, 07:14 .. 13:14 UTC
  … (all 12 stations, 6–7 h each)
```

A chart cast for a birth inside one of those windows prints `℞` next to a planet that the app's
own planet-calendar card, the gochar timeline and the transit event line all call direct — or
the reverse.

**Cause:** two different speed estimators for the same quantity.
- `src/engine/kundli.ts:30,41` uses a **backward** difference: `tropPrev = tropicalLongitudes(d − 0.5)`,
  `retro = (trop[k] − tropPrev[k]) < 0` — the mean motion over the 12 h *before* the moment, so
  the flag turns over ~6 h late.
- `src/engine/planet-calendar.ts:16` (and `gochar.ts` `speed()`) uses a **centred** ±12 h
  difference, which flips at the true station.

The centred estimator is the correct one, so **the chart is the surface that is wrong**.

**Fix:** move the chart's retrograde flag onto the same centred estimator (ideally onto
`planetSpeed` from `planet-calendar.ts`, so there is one definition), and add a gate that
asserts the two agree at N sampled instants around every 2026 station.

---

### F9 — P2 · The Hindi transit headline is not a Hindi sentence

**Observed:** `बुध प्रवेश सिंह`, `सूर्य प्रवेश सिंह · संक्रांति`, `मंगल प्रवेश कर्क`.

`src/engine/transit-copy.ts:67` does `.replace(/ enters /, " प्रवेश ")` — an in-place word swap
that leaves English SVO order. Hindi is verb-final: the reading is
`बुध सिंह में प्रवेश` / `बुध का सिंह में प्रवेश`. The same event is also phrased two ways on the
same card: the headline says `शुक्र वक्री ℞` while the gochar timeline five lines below says
`वक्री होता है` (`DailyScreen.tsx:416`).

**Fix:** build the Hindi label from the structured `{planet, type, sign}` fields the event
already carries (`transit-event-language.cjs` §6 proves they survive) rather than by
find-and-replace on an English sentence.

---

### F10 — P2 · The dasha card states no calculation convention at all, while the periods move eighteen days with the ayanamsa selector

Every other timing surface names its basis — the gochar panel (F1's line), the planet calendar
(`PlanetCalendarCard.tsx:62`), the Sade Sati report, the calendar-mode note. The Vimshottari
card names nothing: not the ayanamsa, not mean/true node, not the 365.25-day year, not the
"antars computed over the notional full maha" convention that produces F2.

**Observed** (`p2-bound.cjs`, Mumbai 1975-06-15 04:30):
```
lahiri maha0 Ketu 3.024203 y     kp maha0 Ketu 2.973453 y
```
0.0507 y = **18.5 days** of difference in the first mahadasha boundary — and in every boundary
after it — driven by a selector the reader can change on the same screen with no restatement.

**Fix:** a one-line footnote on the dasha card, in both languages, naming the ayanamsa in force,
mean Rahu/Ketu, and the 365.25-day Vimshottari year.

---

### F11 — P2 · Minute-level precision on a figure that carries a multi-day uncertainty

The prana rows print to the minute (`19 Aug, 5:25 AM – 20 Aug, 7:46 PM`) and the maha table to
the day. Against the published anchors above, Ganak's Moon runs 1–2 minutes from Drik.

**Observed** (`node .scratch/bugbash/p9-precision.cjs` — shifting the birth time by the measured
2-minute discrepancy):
```
2024-02-29 Delhi (Rahu 18y)
  balance   16.89331 y -> 16.87078 y
  maha0 end 2041-01-20 -> 2041-01-12    shift -8.23 days
  maha8 end 2143-01-22 -> 2143-01-14    shift -8.23 days
1990-01-01 Delhi (Mars 7y)   shift -3.57 days
1975-06-15 Delhi (Ketu 7y)   shift -3.81 days
```

A 2-minute lunar difference moves **every boundary in the table** by 3.6–8.2 days. The card
should either declare that tolerance or stop printing minutes. (`drik-reference-anchors.cjs`
already declares `LUNAR_TOL = 6` minutes for the Moon; nothing propagates that into the dasha
surface.)

---

### F12 — P2 · Sub-period rows drop the year

`src/components/DashaTree.tsx:27` calls `fmtDateT(p.start, tz, level >= 2)`, and `fmtDateT`'s
with-time branch (`format.ts:98`) omits `year`. So from pratyantar level down the reader sees
`24 Jun, 7:36 PM – 25 Jul, 6:06 AM` with no year. A sookshma list that straddles 31 December
reads as though it runs backwards.

---

### F13 — P2 · The mahadasha note carries real content in English and a placeholder in Hindi

`ChartScreen.tsx:1208`:
- EN — *"The native runs Rahu mahadasha — a period classically associated with **worldly hunger,
  foreign influence, dizzying rise and obsession**."* (`DASHA_NOTE`, `ChartScreen.tsx:44-54`,
  nine per-lord entries.)
- HI — *"अभी राहु महादशा चल रही है—यह अवधि उस ग्रह के कारकत्व, स्थिति और स्वामित्व वाले भावों को
  प्रमुख बनाती है।"* — one generic sentence used for all nine lords.

Against `plans/religious-content-policy.md`: the English is framed as convention
("classically associated with"), which is right, but it is unsourced, has no caveat of the kind
the marriage card carries three lines later, and the two languages do not carry equal weight.

---

### F14 — P2 · Tithi search works in Latin and only accidentally in Devanagari

Beyond the date contradiction in F3, the tithi branch is unreachable from Devanagari, so a
Hindi-mode reader's query falls through to the festival matcher and returns whatever festival
happens to contain that word:

```
tritiya   ->  5 results    तृतीया  -> 2 results
saptami   ->  5 results    सप्तमी  -> 2 results
dwadashi  ->  5 results    द्वादशी -> 1 result
```

Same query, same language toggle, different answer set. `search-upcoming.ts:53-56`.

---

### F15 — P2 · Nothing anywhere tests a Vimshottari period

Across **106 files in `validation/`** there is no assertion about a mahadasha start, an
antardasha span, the balance of dasha, or the tiling of the levels. `ruling-planets.cjs` loads
`dasha.ts` only for the KP Ruling-Planets strip; `snapshot-results.cjs:57` mirrors the nine
dasha **lord names** and no dates. That is why F2, F4, F5, F10 and F12 have all been shippable.

The cheapest gate that would have caught the most: pin the five anchor charts above (dates now
recorded), assert each maha boundary to the day, assert `antars[0].start >= birthMs`, and assert
the four-level tiling that this pass verified clean.

