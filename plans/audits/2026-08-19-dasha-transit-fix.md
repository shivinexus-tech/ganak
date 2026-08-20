# Fix pass — Vimshottari dasha + transits

- **Date:** 2026-08-19
- **Agent:** Claude Code (fix agent, lead-dispatched), task `CLAUDE-FIX-DASHA-TRANSIT-2026-08-18`
- **Branch / worktree:** `claude/fix-dasha-transit` · `.scratch/worktrees/fix-dasha`, based on
  `origin/main` `b9ceee5`
- **Input:** `plans/audits/2026-08-18-bugbash-dasha-transit.md` — 17 findings from an
  independent adversarial pass (3 P0, 6 P1, 8 P2)
- **Every "before" block below is literal pre-fix output** from `.scratch/fix/repro.cjs`
  (gitignored, inside the worktree), and every "after" block is literal post-fix output.
  Nothing here is paraphrased.

## What this pass was really about

The bug bash closed on a structural finding, not a defect: across **106 files in
`validation/`, nothing asserted a mahadasha date, an antardasha span, a balance of dasha, or
the tiling of one level into its parent.** Five of the seventeen findings were shippable for
exactly that reason. So the deliverable of this lane was never "fix the list" — it was
**close the hole**, then fix the list. `validation/vimshottari-dasha.cjs` now runs 1712
assertions where there were none.

---

## Closed

### F1 — P0 · the Hindi footnote named the opposite zodiac

The Rashi Gochar convention line — the one line a practitioner reads to decide whether to
trust the dates above it.

**Before**
```
EN  Sidereal (Lahiri) · times in Delhi time · ±1 day for slow planets
HI  सायन (लाहिरी) · समय Delhi समय अनुसार · धीमे ग्रहों हेतु ±1 दिन
```
*Sāyana* means **tropical** — the opposite of what Ganak computes, the opposite of the
architecture invariant in AGENTS.md, and the opposite of what Ganak's own planet-calendar
card (`निरयण (लाहिरी)`) and calculator page (`सायन राशि नहीं`) say about the same numbers.

**After** — `निरयण (लाहिरी) · समय …`

**Changed in `src/screens/DailyScreen.tsx`: that one label and nothing else.** The file is
held by Codex for time-rendering call sites; the lead authorised this single doctrinal word
and no more. The diff there is one line, `सायन` → `निरयण`.

Policed by `validation/transit-event-language.cjs` §7: no line whose English says "Sidereal"
may say `सायन` in Hindi. The one legitimate use — the calculator page's explicit *denial*,
"सायन राशि नहीं" — is allowed by name, because a line that mentions सायन **with** नहीं is
saying what the numbers are not.

### F2 — P0 · the antardasha list opened 469 days before the native was born

**Before** (Kolkata, 29 Feb 2024, 23:59)
```
birth         2024-02-29 18:29
current maha  Rahu 2024-02-29 18:29 -> 2032-12-05 10:48
antars count  6 (a full maha has 9)
    Mercury  2022-11-17 16:30 -> 2025-06-06 01:48   *** STARTS BEFORE BIRTH ***
```
Two claims five lines apart on one card: the mahadasha begins 29 Feb 2024, the first
antardasha inside it begins 17 Nov 2022. And the list was silently **incomplete** — the first
three Rahu sub-periods were gone with no marker.

**After**
```
antars 6 droppedBeforeBirth = 3
    Mercury  2024-02-29 18:29 -> 2025-06-06 01:48 (clipped from 2022-11-17 16:30)
    Ketu     2025-06-06 01:48 -> 2026-06-24 14:06
  clipped antar children: 4 first Mars 2024-02-29 18:29 last ends 2025-06-06 01:48
  all children >= birth? true
```

The *calculation* was always right: sub-periods of a balance mahadasha are proportioned over
the notional full span, which is the correct classical convention. The defect was in the
rendering. `clipPeriods` (new, in `dasha.ts`) removes the wholly-prenatal periods **and counts
them** (`antarsBeforeBirth`), clips the straddling one to the birth instant, and keeps its true
span in `fullStart`/`fullEnd`.

**The second half of this fix matters as much as the first.** `DashaTree.tsx:18` recursed
`vimSub(p.lord, p.start, p.end - p.start)`. Had the clip stopped at the antar row, drilling into
that clipped period would have re-proportioned its nine pratyantars over the *shortened* span —
a fresh, quieter wrong table where a loud one used to be. `vimSubOf(p)` always computes children
over the true parent span and then clips them the same way, and the tree calls it.

### F3 / F14 — P0 · one full moon, two dates depending on the script

**Before** (calendar search, Delhi, "today" = 18 Aug 2026)
```
purnima    2026-08-27(tithi:Purnima)   2026-09-26   2026-10-25
पूर्णिमा    2026-08-28(fast:purnima)    2026-09-26   2026-09-26
tritiya    5 results (tithis)          तृतीया  2 results (festivals)
saptami    5 results (tithis)          सप्तमी  2 results (festivals)
```
**After**
```
purnima    2026-08-28(tithi:Purnima)  2026-09-26  2026-10-26
पूर्णिमा    2026-08-28(tithi:Purnima)  2026-09-26  2026-10-26
amavasya   2026-09-11  अमावस्या 2026-09-11
  all 7 tithi pairs agree across scripts
engine exact instants:  Purnima 2026-08-28 09:48 IST · Amavasya 2026-09-11 08:57 IST
```

Two independent causes, both in `search-upcoming.ts`:

- the tithi matchers were Latin-only, so a Devanagari query never entered the branch and fell
  through to the festival matcher — "सप्तमी" answered with Durga Puja Saptami and Ratha
  Saptami instead of the next Saptami tithis. They now read `TITHI_HI`, the app's single
  source of truth for Devanagari tithi names.
- the branch picked the day on which the tithi was current at local **noon**. Purnima runs
  27 Aug 09:10 → 28 Aug 09:50 IST, so noon on the 27th sat inside it and the search answered a
  day early.

**Doctrinal note — which rule Ganak follows.** The branch now applies the **udaya (sunrise)
rule**: a civil day belongs to the tithi prevailing at its sunrise. This is not a new
invention and not a choice this pass made — it is the rule `festivals.ts` already applies to
purnima and amavasya (`FAST_KALA_RULES`, `kala: "udaya"`), it is the majority reading in the
Hindu calendar tradition, and it is what the Devanagari path was already producing. A tithi
that never prevails at any sunrise is **kshaya** — it has no calendar day and is not listed,
exactly as `festivals.ts` treats it. Verified against Ganak's own sunrise table: 28 Aug 05:57
IST falls inside Purnima, 27 Aug 05:56 IST does not.

Also fixed while in there: `Number(null)` is `0`, not `NaN`, so a search with no place
selected was computing sunrise on the **equator at longitude 0**.

### F4 — P1 · 67 % of the supported birth range rendered nothing at all

**Before**
```
births sampled 351; 236 (67.2%) render NO current dasha / NO antars / NO strip
 1869: tableEnds 1975-08-13  current=UNDEFINED  antars=0
 1900: tableEnds 2012-12-18  current=UNDEFINED  antars=0
```
No current highlight, no "% elapsed" bar, no five-level strip, no antardasha tree — **and no
message.** AGENTS.md: *"Errors must surface visibly in the UI. Silent failure is
unacceptable."*

**After**
```
sampled 351; no current dasha: 124 (35.3%), of which future births: 124, unexplained: 0
 1869: rows 18 tableEnds 2095-08-13  current=Moon (cycle 1)  antars=9
 1900: rows 18 tableEnds 2132-12-19  current=Venus (cycle 1) antars=9
 2030: rows  9 current=UNDEFINED — birth-in-future
 2030 message EN: This birth date is in the future, so no Vimshottari period is
                  running yet. The table below starts at birth.
```

The table was one 120-year cycle from birth and then stopped; Vimshottari itself repeats. It
now repeats until it covers today (capped at four cycles). **Every already-born year of the
supported 1800–2150 range now renders a current period** — the silent-empty count for real
charts is zero. The 124 that remain are all charts cast for a birth date in the *future*,
where no period genuinely can be running; those carry an explicit bilingual `dashaStatus`.

Charts whose first cycle already reaches today — every birth from ~1910 on, i.e. nearly every
real chart — get exactly the nine rows they always had, with `cycle: 0` on all of them.

**Partial:** the engine no longer fails silently, but rendering `dashaStatus` is a one-line
change in `ChartScreen.tsx`, which is another lane's file. See Handoffs.

### F6 / F9 / F16 — P1/P2 · the Hindi transit row

**Before**
```
HI  17 अग॰ · 7:48 AM
    सूर्य प्रवेश सिंह · संक्रांति
    2d 22h
    Sankranti marks the Sun's entry into a new sign, shifting seasonal energies …
eventDetail -200d : {"timeStr":"Today","days":-200}
eventDetail  -30d : {"timeStr":"Today","days":-30}
```
**After**
```
EN Mercury enters Leo               3d 13h
HI बुध का सिंह में प्रवेश            3 दिन 13 घंटे
EN Sun enters Virgo · Sankranti     29d 2h
HI सूर्य का कन्या में प्रवेश · संक्रांति  29 दिन 2 घंटे
   hi gloss: संक्रांति सूर्य का नई राशि में प्रवेश है, जिससे ऋतु-ऊर्जा और प्रकृति की लय बदलती है।
   -200d -> en "6 months ago"  hi "6 माह पहले"
    -30d -> en "30 days ago"   hi "30 दिन पहले"
   Latin leak scan of Hindi transit output: none
```

- **F6** — `EVENT_DESC` (the *entire* explanation answer-before-data promises a Hindi reader),
  `timeStr` and `fmtDur` are all bilingual now, keyed like `LUNATION_GLOSS` which was already
  right. `ongoingLabel()` replaces the last hardcoded string.
- **F9** — `.replace(/ enters /, " प्रवेश ")` left English subject-verb-object order standing;
  "बुध प्रवेश सिंह" is not a Hindi sentence. Ingress headlines are now **composed** verb-final
  from the parsed planet and sign, both routed through the same term tables as everywhere
  else: "बुध का सिंह में प्रवेश".
- **F16** — `eventDetail` had no negative branch, so the `days > 0 ? … : hours > 0 ? … :
  "Today"` chain fell through and labelled *every* row "Today" on any past Panchang date, next
  to that row's own 2026 timestamp. Past events now say how long ago they were.

**Partial:** `eventDetail(ev, now, lang)` and `fmtDur(ms, lang)` default to English, and the two
call sites in `DailyScreen.tsx` do not yet pass `lang` — that file is Codex's and only the F1
label was authorised. Both languages are returned on the result object
(`descEn`/`descHi`/`timeStrEn`/`timeStrHi`) so the call-site change is one line each and needs no
further engine work. F16's other half — `DailyScreen.tsx:358` measuring the countdown from
`Date.now()` while the events were generated from the *selected* date — is also a call-site
change. See Handoffs.

### F7 — P1 · the marriage card printed a range that was not the period it named

**Before**
```
card row: 2042-03 – 2043-06  Jupiter/Venus dasha
TRUE    : 2040-10 – 2043-06   *** card start is 1.37y later ***
periodStart exposed? false
```
The card clamped the window to the marriageable-age floor while labelling the row with the
antardasha's name, and never said a clamp had happened — so the card said Mar 2042 and the
dasha tree on the same screen said Oct 2040 for one named period.

**After**
```
2042-03 – 2043-06  Jupiter/Venus   [period really 2040-10 – 2043-06, trimmed to age 18]
2043-06 – 2044-04  Jupiter/Sun
no window starts before birth? true
```

**Partial, deliberately.** Every window now carries `periodStart` / `periodEnd` /
`trimmedToAge` / `ageFloorYears` alongside the offered `start`, so the information is no
longer lost. I did **not** simply set `start` to the period's real start: that would have
removed the contradiction but silently changed what the card *offers*, putting a marriage
window at age 16 on a religious-content surface. That is a product call, not an engine one.
The card's one-line change to show the difference is a Handoff.

### F8 — P1 · chart and planet calendar disagreed about retrograde after every station

**Before**
```
station events in 2026: 12
total disagreeing hourly samples: 79
   Mercury 2026-02-26 06:48 -> 7 hours
   Jupiter 2026-03-11 03:29 -> 6 hours
   Saturn  2026-07-26 19:27 -> 7 hours
```
**After**
```
minute-aligned disagreeing samples: 0
```

Two speed estimators for one quantity. The chart used a **backward** 12 h difference — the mean
motion over the half-day *before* the moment — so its ℞ flag turned over about six hours late;
the planet calendar, the gochar timeline and the transit event line all used a **centred**
difference, which flips at the true station. A chart cast inside one of those windows printed
℞ next to a planet the app's own calendar called direct.

Fixed engine-side, as instructed, and fixed by *removing* the second definition rather than
matching it: `kundli.ts` now calls `planetSpeed` from `planet-calendar.ts` — the same function
`planetStatesAt` uses — so the two surfaces cannot drift apart again. `ChartScreen.tsx` needed
no change.

One behavioural nuance worth recording: `planetSpeed` reads the shared ephemeris rather than
the chart's selected ayanamsa. That is correct and intended — retrograde is the sign of a
*difference*, so the ayanamsa cancels out except for its own ~50″/year drift, which is
negligible against planetary motion and identical on both surfaces. It also means the ℞ flag
no longer depends on which ayanamsa the reader has chosen, which is right: apparent retrograde
motion is an observational fact, not a coordinate convention.

(The 12 residual samples in the raw sweep were a harness artefact: the chart carries
minute resolution and the station instants have seconds, so the two surfaces were being asked
about slightly different moments. Asked about the same truncated instant: zero.)

`src/engine/shadbala.ts`'s Cheshta Bala speed still uses the backward difference. That is a
different quantity on a different surface and moving it would shift every Shadbala score, so it
was left alone deliberately — noted here so the next pass does not read it as an oversight.

### F15 — P2 · nothing anywhere tested a Vimshottari period

Closed by `validation/vimshottari-dasha.cjs`. **1712 assertions:**

1. **Balance of dasha against five published Drik anchors** (New Delhi nakshatra-end instants
   for 1948-01-30, 1975-06-15, 1990-01-01, 2001-09-11, 2024-02-29, recorded by the bug bash so
   this gate does not re-fetch). For each: the nakshatra Ganak places the Moon in; the
   nakshatra-exit instant against Drik's published clock time within the 6-minute lunar
   tolerance `drik-reference-anchors.cjs` already declares; the star lord as the first
   mahadasha lord; the balance **re-derived from the classical rule** rather than mirrored from
   the engine; and the cusp handover two minutes either side — near-zero balance before, the
   next nakshatra's lord with a near-full balance after.
2. **Exact tiling, four levels deep, all nine lords** — 0 ms end error, 0 ms gap, every
   sub-period exactly `yrs/120` of its parent, 36 checks.
3. **No rendered period begins before birth**, at every level, including the children of a
   clipped period, plus `kept + dropped = 9`.
4. **A current period, an antardasha tree and a complete five-level chain** for every
   already-born year of the supported 1800–2150 range, and a bilingual reason wherever one
   genuinely cannot be shown.
5. Determinism across an ayanamsa switch, and a positive assertion that the ayanamsa selector
   *does* move the boundaries — which is why F10's footnote is still owed.

**Convention stated in the gate header, so it cannot be changed silently:** Vimshottari over a
365.25-day year, star lord from the Moon's nakshatra, balance `(1 − elapsed fraction) × years`,
sub-periods `yrs/120` of the parent, and sub-periods of a balance mahadasha proportioned over
the notional full span then clipped to birth for display. All majority classical readings; no
source disagreement was found that required a ruling.

**Fail-then-pass, run against `b9ceee5` in a detached worktree:**
```
pre-fix  RED  antardasha Mercury starts 2022-11-17 22:00 IST, before the birth
              2024-02-29 23:59 IST
pre-fix  RED  1800: no current dasha and no reason — this is the silent empty panel
              F4 reported                    (F2 block removed so the sweep ran)
post-fix PASS 1712 assertions · 227/227 already-born sample years render a current
              period · 124 future births, all with a bilingual reason
```

The two transit gates were extended and proved the same way:
```
pre-fix  RED §7  screens/DailyScreen.tsx:424 says "Sidereal" in English and "सायन"
                 (= tropical, the OPPOSITE zodiac) in Hindi
pre-fix  RED §8  EVENT_DESC["Sankranti"] must carry both languages
pre-fix  RED §9  Hindi is verb-final: "प्रवेश" must close the clause, got "शुक्र प्रवेश मकर"
pre-fix  RED §10 an event -200 days in the past must be flagged past
pre-fix  RED pc  birth chart and planet calendar disagree about retrograde at 67/876
                 sampled instants: Mercury 2026-02-26T07:48 chart=false calendar=true …
post-fix GREEN   all five
```

---

## Handoffs — not fixed, and why

Every one of these is a **render-side** change in a file this lane was explicitly told not to
touch. None is blocked on engine work; where data was needed, it is already exposed.

| # | Sev | What is still wrong | Where | What it needs |
|---|-----|---------------------|-------|----------------|
| F5 | P1 | Every date in the Vimshottari surface is hardcoded `en-IN`, in both languages | `src/components/format.ts:95` `fmtDateT`, called from `ChartScreen.tsx:1183,1184,1228`, `DashaTree.tsx:27`, `RectifyScreen.tsx`, `JyotishBnnScreen.tsx:163` | Give `fmtDateT` a `lang` parameter (or route it through the already-exported `fmtDateZone(ms, tz, lang, zone, withYear)`) and thread `lang` from the call sites. **I deliberately did not patch `DashaTree.tsx` alone**: a half-fix there would have left the maha table and the tree formatting dates two different ways, and would collide with whoever threads `format.ts`. It is one owner's change across five call sites. |
| F12 | P2 | Sub-period rows below pratyantar drop the **year**, so a sookshma list straddling 31 Dec reads as running backwards | `format.ts:98` with-time branch | Same edit as F5 — `fmtDateZone`'s `withYear` flag already exists. |
| F4b | P1 | `dashaStatus` is computed but nothing renders it | `ChartScreen.tsx:1193`, which gates the whole block on `{r.current && …}` | `{!r.current && r.dashaStatus && <p>{hi ? r.dashaStatus.hi : r.dashaStatus.en}</p>}`. Also worth showing `r.antarsBeforeBirth` ("3 sub-periods elapsed before birth") next to the antardasha heading, and labelling the repeat cycle in the maha table — a pre-1910 birth now correctly renders 18 rows, and every row carries `cycle` (0 or 1) so the second 120-year round can be headed as such. |
| F6b/F16b | P1 | The Hindi gloss and countdown exist but the call sites do not ask for them; and the countdown is measured from `Date.now()` while the events were generated from the selected date | `DailyScreen.tsx:358` `eventDetail(e2, Date.now())`, `:395` `fmtDur(...)` and the literal `"ongoing"` | Pass `lang` as the third argument, pass the same reference the events were generated from instead of `Date.now()`, and use `ongoingLabel(lang)`. Both languages are on the result object already if that is easier. |
| F7b | P1 | The card still prints the trimmed start without saying it was trimmed | `ChartScreen.tsx:1265` | The engine now hands the card `w.periodStart`, `w.periodEnd`, `w.trimmedToAge`, `w.ageFloorYears`. Render the real span with the pre-18 part marked, or add "trimmed to marriageable age" to the row. **This is a product call as much as a UI one** — see F7 above. |
| F10 | P2 | The dasha card states **no** calculation convention, while the periods move 18.5 days with the ayanamsa selector on the same screen | `ChartScreen.tsx` dasha card | One bilingual footnote naming the ayanamsa in force, mean Rahu/Ketu, and the 365.25-day Vimshottari year — the gochar panel and planet calendar both already do this. The new gate asserts the selector really does move the boundaries, so the footnote is owed. |
| F11 | P2 | Prana rows print to the minute on a figure carrying a multi-day uncertainty (a 2-minute lunar difference moves every boundary 3.6–8.2 days) | `ChartScreen.tsx` | Declare the tolerance or stop printing minutes. `drik-reference-anchors.cjs` already declares `LUNAR_TOL = 6` minutes; nothing propagates it. |
| F13 | P2 | The mahadasha note has nine per-lord English entries and **one generic Hindi sentence** for all nine | `ChartScreen.tsx:44-54` `DASHA_NOTE` | Nine Hindi entries of equal weight, sourced, with the caveat the marriage card carries three lines later. **This is a religious-accuracy item and a standing human gate** — it needs sourcing, not invention. |
| F17 | P2 | The Ruling Planets strip loses all graha colour coding in Hindi | `ChartScreen.tsx:781-787` passes an already-localised name into `PLANET_COLOR`, which is keyed by English | Pass the canonical English lord into `RPItem`/`Chip` and localise inside, next to the colour lookup. |

**Out-of-allowlist edit made, declared:** `src/components/DashaTree.tsx` — two lines
(`vimSub` → `vimSubOf` and its import). It is not in this lane's file list and not in its
do-not-touch list; no `ACTIVE`/`RESERVED` row covers it (its only row, `SPLIT-UI-CHART-03`, is
MERGED). Without it the F2 fix would have shipped a second, quieter wrong table one tap
deeper, so it was made rather than deferred. Flagging it explicitly for the integrator.

---

## Gates

`bash scripts/run-all-gates.sh` — summary pasted in the task-log row and the branch report.
`npm run build` clean. New gate `validation/vimshottari-dasha.cjs` should be added to
AGENTS.md's listed set by the integrator.

## What a practitioner used to be shown, and what they are shown now

- A Hindi reader was told the transit dates were **tropical** — the opposite of what Ganak
  computes. They are now told sidereal, in the same word the rest of the app uses.
- A young native's antardasha list opened over a year **before they were born** and quietly
  dropped three sub-periods. It now starts at birth and says how many periods elapsed first.
- Anyone born before about 1910 saw a bare nine-row table and then **nothing** — no current
  period, no progress, no drill-down, no explanation. They now see their real running period.
- Searching for a full moon gave one date typed in English and a different date typed in
  Hindi. It now gives one date, the correct one, in both.
- A chart cast in the hours after a planet turned back printed ℞ next to a planet the app's
  own calendar called direct. The two now cannot disagree.
- And a dasha date is, for the first time, something a gate can catch being wrong.
