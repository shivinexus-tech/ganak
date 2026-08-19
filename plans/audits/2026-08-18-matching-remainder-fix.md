# Matching + dosha bug bash — the remainder (F6, F11, F12, F17–F21, F23), and what is still open

- **Date:** 2026-08-18
- **Branch:** `claude/matching-audit-remainder` (worktree off `origin/main` `cc3113d`)
- **Source:** `plans/audits/2026-08-18-bugbash-matching-dosha.md` (23 findings)
- **Preceding lane:** `plans/audits/2026-08-18-matching-fix-notes.md` closed F1, F3, F4, F5, F10
- **Files changed:** `src/engine/matching.ts`, `src/engine/mangal-dosha.ts`,
  `src/screens/MatchingScreen.tsx`, `src/components/birth-input.ts`,
  `src/data/mangal-dosha-report.ts`, `validation/dashakoota.cjs`,
  `validation/doshas.cjs`, `validation/mangal-dosha.cjs`,
  `validation/snapshot-results.cjs`, `validation/snapshot-generate.cjs`,
  `validation/screen-snapshots.cjs`, `validation/snapshots/match-result.*.txt` (new).

## In plain words — what a couple used to be told, and what they are told now

| | Before | Now |
|---|---|---|
| **Timezone** | If the place a reader picked came back from the online city search without a timezone, Ganak quietly matched the couple **as if both were born in India** and said nothing. If the place carried no timezone field at all, it used *the reader's own phone's* timezone — so the same two people scored differently on different devices. | Ganak refuses, names whose birthplace it could not place, and asks for it to be picked again. An hour of error moves the Moon's pada, and the pada is what every star-based score on the page is counted from. |
| **Nadi / Bhakoot dosha** | "Present." Full stop — stated as a fact, with no hint that the same tradition Ganak is quoting also carries exceptions. **6,156** star/sign combinations were told they had Nadi dosha, and **24,786** Bhakoot dosha, while a published exception to that very rule was standing unmentioned. | The card still reports the rule as it applied — the points and the verdict do not move — but it now *names the exception* ("both Moons are in the same rashi but in different nakshatras") and says plainly that traditions differ on whether it cancels, and that the reading belongs with the full charts. |
| **Mangal dosha strength** | Jupiter was only counted as softening the dosha when it sat directly opposite Mars. Jupiter's other two classical aspects were missed, so on **5.5%** of the birth dates swept the dosha was reported *stronger* than Ganak's own stated method allows — on a page about marriage. | All three of Jupiter's full aspects count, in both places Ganak computes this (the calculator page and the matching screen), and the card's own wording was corrected to match. |
| **The South-Indian score table** | Ten rows of "Dina 3 / 3", "Stree Deergha 2 / 2" with a fixed sentence about what the kuta means — a Hindi reader got no reading at all, and nobody could check a score against the rule it came from. The table itself had no styling: ten Devanagari names crowded against their numbers on a phone. | Every row shows its actual reading in both languages — the star count, the pair of groups, the rule that fired ("star count 27 — not one of the Mahendra counts"). The table is now built like the Ashtakoota table above it. |
| **Which zodiac** | The page produced a verdict about a marriage and named **no convention at all**; worse, it passed no ayanamsa when casting, so both charts were built on whatever the chart screen's ayanamsa buttons had last left behind. | Lahiri and mean Rahu/Ketu are pinned in code and printed on the page and on the saved PDF, in both languages. |
| **The saved PDF** | In Hindi it read `वर (1990-04-12 · 09:30 · New Delhi, India)` — a computer-style date inside a Hindi document, and no record of the clock the charts were built on. | `वर (1 जून 1985 · 09:30 · New Delhi, India · UTC+05:30)`, plus the convention line. |
| **Sade Sati** | (Fixed earlier today in the report engine.) | The matching and dosha screens never had a second Sade Sati path to inherit — see F2 below. |

## Findings closed, with evidence

### F2 (P0) — verified: no second Sade Sati path exists
Checked, because the brief asked whether the matching and dosha screens had their own
copy. They do not:

```
src/screens/MatchingScreen.tsx         no Sade Sati reference
src/engine/matching.ts                 (only the new comment that cites the file)
src/engine/doshas.ts                   no Sade Sati reference
src/engine/mangal-dosha.ts             no Sade Sati reference
src/engine/marriage-timing.ts          no Sade Sati reference
src/screens/ChartScreen.tsx            no Sade Sati reference
--- the only consumer ---
src/engine/utility-calculators.ts:7:  import { sadeSatiReport } from "./sade-sati-report";
```
One path, already fixed, and its gate is green here:
```
Sade Sati report: PASS — 5 published Drik anchors (worst boundary off by 3.3h of 6h allowed),
84 reports × 237 cycles swept 1900–2100: length 6.36–8.94 yrs, tightest gap between cycles 20.9 yrs,
every cycle three phases in order with no gap or overlap
```

### F6 (P1) — a birth timezone that cannot be resolved is now a refusal
Reproduced first. `zoneOffset` returns `null` for an unknown or empty zone, and the
screen's `?? 5.5` turned that into Indian Standard Time:

```
"null"               -> null   ?? 5.5 => 5.5
""                   -> null   ?? 5.5 => 5.5
"Mars/Olympus"       -> null   ?? 5.5 => 5.5
"undefined"          -> -7     ?? 5.5 => -7      <-- the HOST machine's zone, not IST
```
The last row is the one the audit did not have: `Intl.DateTimeFormat` treats
`timeZone: undefined` as "not supplied" and answers with the *reader's own* zone, so a
place object with no `zone` key made the same couple score differently per device.
Both are reachable: `src/data/places.ts:40` maps an online geocoder result with no
timezone to `zone: null`.

Fixed by `resolveBirthZone` / `zoneMessage` in `src/components/birth-input.ts` — the
module that already owns the date and time guards for all four birth screens — wired
into `MatchingScreen.run()`. The message names *whose* place failed, matching the
pattern the date and time messages already use.

### F11 (P1) — the classical exceptions are named, not applied
`gunaMilan` now returns `nadiExceptions` and `bhakootExceptions`: same Moon rashi but
different nakshatras, or the same nakshatra in different rashis (Nadi); one and the same
sign lord, or two mutually friendly lords — which is the same condition as "Graha Maitri
is full", so it is listed once, not twice (Bhakoot).

**Deliberately a disclosure, not a ruling.** Points, dosha flags and the headline band are
byte-identical to before, and the gate asserts that. This follows the precedent
`/calculator/mangal-dosha` already set, where mitigations soften how a dosha is *read*
and never erase that it is present. Whether a cancelled dosha should stop capping the
verdict band is an **owner question** (below) — not something this branch decided.

Swept scale:
```
Nadi dosha combos 34992, with a classical exception standing 6156
Bhakoot dosha combos 52488, with a classical exception standing 24786
```

### F12 (P1) — already closed by the birth-input lane; verified, not assumed
The audit's year-1400 case is refused on the matching screen today:
```
1400-03-05   REFUSED: The groom's date of birth is in 1400. Ganak calculates planetary positions for 1800–2150…
1799-12-31   REFUSED
1880-01-01   accepted
2075-01-01   accepted
2151-01-01   REFUSED
supported range 1800 - 2150
```
1880 and 2075 are inside the ΔT range the ephemeris really fits, so they are answered.
Nothing further was done here; `validation/birth-input-validation.cjs` owns it.

### F17 (P2) + the F8 leak's landing on matching — the convention is pinned and printed
`computeMatch` passed birth details with **no `ayanamsa` key**, so both charts inherited
whatever `AYAN_MODE` the chart screen's ayanamsa chips had last written into
`src/engine/panchang.ts`. It now pins Lahiri explicitly, the way `mangal-dosha.ts` and
`sade-sati-report.ts` already do, and the result carries a bilingual convention line that
the screen and the printed report both render. Gated behaviourally, not by grep: a spy
`computeKundli` asserts `['lahiri','lahiri']`.

*(The module-global mutable `AYAN_MODE` itself — audit F8 — belongs to the engine lane
that is fixing `panchang.ts`; this change makes matching immune to it either way.)*

### F18, F20, F23 (P2) — the Dashakoota table
- **F18:** the table now sets `borderCollapse`, per-cell padding and `minWidth` inside its
  overflow container, exactly like the Ashtakoota table sixty lines above. Source-read,
  not measured — `renderToStaticMarkup` produces no layout box.
- **F23:** the engine's per-kuta `note` was computed and discarded; the screen printed a
  separate English-only meaning map instead. Each row now shows the meaning *and* the
  engine's own reading, in the reader's language.
- **F20:** the point granularity itself (Stree Deergha graded 0/1/2 in some published
  tables, Dina in more than two steps) is **genuine source variation and was NOT changed**
  — see the owner questions. What changed is that the rule and the count it was scored
  from are now on the row (`star count 27 — above 13, so full marks`), so a practitioner
  can check the score instead of trusting it. `dashakoota().counts` exposes the three raw
  counts, and the gate asserts every row's stated rule agrees with its own points.

### F19 (P2, but it moved real answers) — Jupiter's drishti and the exception table
Jupiter casts a **full** aspect on the 5th, 7th and 9th from itself — Ganak's own
`src/engine/bhava.ts` scores exactly that (`frac 60` at `hp` 5, 7 and 9). `mangal-dosha.ts`
credited the 7th alone, in **both** copies of the convention. Measured over 1,464 charts
across Delhi and New York, 1950–2010:

```
charts 1464 · strength changed on 80 (5.5%)
   1950-08-15 @ 28.61,77.21  was "moderate" -> now "limited"
   1950-09-15 @ 28.61,77.21  was "moderate" -> now "limited"
   1951-08-15 @ 28.61,77.21  was "moderate" -> now "limited"
```
The mitigation card in `src/data/mangal-dosha-report.ts` said "conjunction or full 7th
aspect" and was corrected in both languages. The exception table gained its missing
1st-house row (Mars in its own signs in the Lagna); outcome-neutral, because
own/exalted already catches those signs — but a table published on the page as the
method must be the method.

### F21 (P2) — the printed report header
The date now reads in the reader's language and the header carries the UTC offset each
chart was cast on, plus the convention line. **The place LABEL is still English** — the
gazetteer has no Devanagari city names. That is a data gap, recorded below, not something
to invent per city.

### F16 (P2) — the two languages made equal
- The Hindi Nadi card gained the point cost ("8 अंक चले जाते हैं") and the mitigation
  clause the English one has always carried.
- The Hindi closing paragraph was **three sentences shorter** than the English: it carried
  neither "treat this as a starting point, not a verdict" nor the source-variation note.
  Both added.
- The Hindi one-sided-Manglik card gained the "same Lagna/Moon/Venus check the calculator
  uses" clause.

### The match RESULT surface now has a committed baseline
`validation/snapshots/match-result.en.txt` / `.hi.txt` — the first baseline anywhere that
holds the scores, the doshas, the verdict and the printed header. The existing
`matching.*.txt` baselines are eleven lines of empty form, which is why every one of the
23 findings passed them. The single `useState(null)` slot that holds the result is seeded
with a **real** `computeMatch` output and the shipping component is rendered; the form's
own date/time slots are seeded to the same couple so the printed header in the baseline
belongs to the scores underneath it. Interception matches on the *initial value*, not on
call order, so it survives the component gaining or reordering state.

## Gates

```
dashakoota.cjs OK — 36-pt structure, Rajju & Vedha hard-blocks, real-chart anchor (24/good);
swept 104,976 combinations: one verdict per input, 0 favourable-with-dosha, 8/8 distinct Hindi
koota details, stale-place guard wired; 6,156 Nadi and 24,786 Bhakoot combinations now name the
classical exception they used to hide, 10/10 Dashakoota rows bilingual and agreeing with their own
score, Lahiri pinned on both charts, birth zone refuses instead of defaulting to IST

Mangal Dosha report: PASS — three references, mitigations, copy and utility wiring verified;
Jupiter's drishti swept over 144 Mars/Jupiter geometries (support at 1, 5, 7, 9 only), exception
table complete for all 6 Manglik houses, and identical to matching's copy

doshas.cjs OK — Kala Sarpa (12 types + geometry), Pitra Dosha, Papa Dosha & Papasamyam;
Manglik matching↔calculator agreement swept over 96 charts and 48 couples (36 of them Manglik
from the Moon/Venus but not the Lagna)

✓ screen-snapshots: 58 baselines match · 27 screens × 2 languages + chart/transit/match results
```

### Fail-then-pass — every new assertion goes red against the pre-fix behaviour
Run with `.scratch/repro/failproof.py` (gitignored): each fix is reverted in place, the
gate is run, the file restored.

```
RED   F6  silent IST fallback
        the matching screen still falls back to Indian Standard Time when a timezone cannot be resolved
RED   F11 Nadi/Bhakoot exceptions never surfaced
        no combination in the sweep carried an exception — the F11 assertions above would prove nothing
RED   F17 matching inherited whatever ayanamsa was left behind
        computeMatch must pin the ayanamsa on BOTH charts instead of inheriting module-global state
RED   F18 bare Dashakoota table
        a score table has no borderCollapse: <table>
RED   F20/F23 Dashakoota rows had no reading and no Hindi
        a Dashakoota kuta has no Hindi reading
RED   F21 ISO date in the printed Hindi report
        the printed header still puts a raw ISO date in front of a Hindi reader
RED   F19 Jupiter usage reverted, constant left intact (behavioural sweep)
        Jupiter's support was credited at the wrong distances in 24 of 144 geometries
RED   F19 Jupiter aspects drift between the two engines
        matching and the calculator grade the strength differently: 1953-12-4 13:31 @40.71,-74.01
RED   F19 Jupiter's 5th and 9th aspects missed
        Jupiter's three full aspects are the 5th, 7th and 9th
RED   F19 exception table had no 1st-house row
        the exception table has no 1st-house row

--- restored; now the same gates on the fixed code ---
GREEN validation/dashakoota.cjs
GREEN validation/mangal-dosha.cjs
GREEN validation/doshas.cjs
```

## NOT closed — and why, honestly

Five findings live in files this branch was told not to touch (another lane owns them).
Each was **re-checked against today's `main`** so the next agent does not re-diagnose:

| # | Finding | Status today | The change needed |
|---|---|---|---|
| **F7** (P1) | The chart screen's dosha panel silently follows the reader's ayanamsa while the pages it links to force Lahiri | **still live** — `ChartScreen.tsx:1115-1117` feeds the user-selected chart into `kalaSarpaFromRows`/`pitraDoshaFromRows`/`papaCount` | Pin the panel to Lahiri, or print the active ayanamsa inside the panel and carry it through the "Full page →" links. Entangled with the F8 engine fix now in flight — should land with it. |
| **F8** (P1) | Module-global `AYAN_MODE` leaks across screens | **not mine** — engine lane in `panchang.ts` | — (matching is now immune either way, see F17) |
| **F9** (P1) | Switching Jyotish panels unmounts the matching form and destroys both people's birth data and the match | **still live** — `ChartScreen.tsx:500` conditionally *mounts* `MatchMaker` | Hide rather than unmount (the sibling nav already uses `child.hidden`), and put `activePanel` in the URL the way `chartStyle` already is. |
| **F13** (P2) | English prints raw internal keys on the Papa Dosha card | **still live** — `ChartScreen.tsx:1135`, the Hindi branch maps `lagna/moon/venus`, the English branch emits `rr.ref` verbatim | Give English the same three labels. |
| **F14** (P2) | Hindi renders planet names and the weekday in English | **half fixed** — the dasha lords now go through `planetName(lang, …)`. Still live: the **birth-panchang** block, `ChartScreen.tsx:1276-1280`, prints `r.panchang.weekday / tithiName / paksha / nak / yoga / karana` raw, and those are English strings built in `src/engine/kundli.ts:79,200` | Route the five birth-panchang values through `src/i18n/panchang-terms.ts`; the weekday needs a table there. **No baseline covers this block** — the chart result baseline is a composed mirror, not a render of the screen. |
| **F15** (P2) | Sade Sati status leaked the English word "upcoming" into Hindi | **already fixed** — `UtilityCalculatorScreen.tsx:238` now maps through `CYCLE_STATUS` | — |
| **F22** (P2) | "No supportive window in the next twenty years" is a horizon artifact, and the 18-year floor is unstated | **still live** — the maths is `src/engine/marriage-timing.ts:23-24` (mine), but the sentence is `ChartScreen.tsx:1254` (not mine) | The honest fix is one sentence on the screen. I deliberately did **not** add `horizonMs`/`beyondHorizon` fields to the engine: an unrendered computed field is exactly the F23 defect I spent this branch removing. |

## Owner questions — recorded, not decided

These are religious-accuracy / product calls. Nothing here was chosen unilaterally.

1. **Should a classical exception stop the dosha capping the verdict band?** Today a Nadi
   or Bhakoot dosha caps the headline at "mixed" even when a published exception applies,
   and the card names the exception underneath. The cautious reading. The alternative —
   letting a cancelled dosha lift the cap — changes the headline for thousands of couples.
2. **Which Nadi and Bhakoot exceptions Ganak recognises.** Two are implemented for each,
   the ones the bug bash named and the most widely published. Longer lists exist
   (nakshatra-pada variants for Nadi; the 6/8 axis treated differently from 2/12 for
   Bhakoot). Adding or removing one is a sourcing decision.
3. **Dashakoota point granularity (F20).** Stree Deergha is scored 2/0 above/below a star
   count of 13; several published tables award half marks above 9. Dina is 3/0 where some
   tables grade it. Both under-score otherwise acceptable matches. **Unchanged** — the
   rule is now printed on the row so the reader can see which convention was applied, and
   moving it is a one-line change once the owner picks a source.
4. **Devanagari city names.** The printed report still shows "New Delhi, India" inside a
   Hindi document because the gazetteer has no Hindi labels. A Hindi name column for the
   shipped city list is a data task, not a code task.
5. **`UtilityCalculatorScreen` still carries its own copy of the birth-zone resolver.**
   The shared one now lives in `src/components/birth-input.ts`; adopting it there is a
   one-line follow-up in a file this branch may not edit.
