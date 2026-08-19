# Bug bash — matching + dosha suite (independent adversarial pass)

- **Date:** 2026-08-18
- **Agent:** independent adversarial test agent (Claude), branch `claude/bugbash-matching-dosha`, worktree based on `origin/main` 421e82d
- **Mandate:** backlog #65 states plainly that Ganak has ~85 gates proving calculation and structure, **none** proving rendered output, and that *"Dashakoota and the dosha pages sit at 'the gates pass and nobody looked'."* This pass looked.
- **Scope:** `src/engine/matching.ts`, `src/engine/doshas.ts`, `src/engine/mangal-dosha.ts`, `src/engine/sade-sati-report.ts`, `src/engine/marriage-timing.ts`, `src/screens/MatchingScreen.tsx`, the dosha/marriage/Dashakoota regions of `src/screens/ChartScreen.tsx`, `src/screens/UtilityCalculatorScreen.tsx`, and the gates `validation/dashakoota.cjs`, `validation/doshas.cjs`, `validation/mangal-dosha.cjs`.
- **Standing:** READ-ONLY on all product code. Nothing under `src/` or `validation/` was modified. This document is the only write. Probe scripts live in `.scratch/bugbash/` (gitignored).
- **Baseline:** all four existing gates were green before and after this pass —
  `dashakoota.cjs OK`, `doshas.cjs OK`, `Mangal Dosha report: PASS`, `screen-snapshots: 14 baselines match`.
  **Every finding below is invisible to all four.**

## Pass log

| # | Pass | What it probed | How |
|---|------|----------------|-----|
| 1 | Astrological correctness (~50 min) | Every koota table in `matching.ts` re-derived against the classical lists: Nadi (27), Gana (27), Yoni (27), Rajju (27 stars → 5 groups), Vedha (13 pairs), Varna (12), Vashya (12), Bhakoot 2/12-5/9-6/8 set, Parashari natural friendship, Mahendra & Stree Deergha count direction, Kala Sarpa's 12 named types, Mangal Dosha cancellation rules, Sade Sati phase geometry. Full 104,976-combination sweep of `gunaMilan` × `dashakoota`. | `.scratch/bugbash/sweep.cjs`, hand re-derivation |
| 2 | Boundary charts (~35 min) | Pre-1900 (1880), post-2050 (2075), year 1400, midnight, 23:59, southern hemisphere (Sydney), extreme latitude (Tromsø 69.65°), 89.9°, exact pole 90°, US DST spring-forward 02:30, negative timezone, identical birth data for both partners, cross-timezone couple, 201 Sade Sati check-dates 1900–2100. | `.scratch/bugbash/boundary.cjs`, `sadesati.cjs`, `real-repro.cjs` |
| 3 | Responsible copy (~30 min) | Every verdict string on the matching and dosha surfaces read for fatalism, missing caveats, unstated conventions, and EN↔HI equivalence of the *answer-before-data* plain verdict. | rendered output + source |
| 4 | Bilingual rendering (~45 min) | Real rendered text, both languages, of the **match result surface** (Ashtakoota table, Dashakoota table, all four dosha cards, print header), the **ChartScreen dosha panel + marriage timing + dasha table**, and the **Sade Sati calculator report**. Built on `validation/_snapshot-render.cjs` / `_load-app.cjs` / `_snapshot-env.cjs`. | `.scratch/bugbash/render-match.cjs`, `render-chart.cjs`, `render-calc.cjs` |
| 5 | Journey integrity (~25 min) | Mount/unmount lifetime of the matching form, URL round-trip, stale-result clearing, the unconfirmed/stale-place guard, timezone resolution failure, input range validation, error visibility. | source contract + component wiring |

### How the result surfaces were rendered

`renderToStaticMarkup` runs no handlers, so a screen snapshot only ever sees the empty
form — which is exactly why `validation/snapshots/matching.en.txt` is **11 lines long and
contains not one koota, dosha or score**. To see what a reader actually sees, the probe
intercepts the single `useState(null)` slot that holds `res` in `MatchMaker` (and the
`result`/`chartContext` slots in `ChartScreen`, the `result` slot in
`UtilityCalculatorScreen`), seeds it with a **real** `computeMatch` / `computeKundli` /
`sadeSati` output, and renders. Every "observed" block below is literal harness output.

---

## Findings

### F1 — P0 · Matching declares one partner Manglik when Ganak's own calculator says both are

**Reproduction**

Groom `1985-01-05 09:30`, New Delhi (28.61, 77.21, IST).
Bride `1991-07-15 14:15`, Mumbai (19.08, 72.88, IST).

**Observed** — matching screen, English:

```
⚠ Manglik (Mangal) dosha
The groom is Manglik (Mars falls in house 1, 2, 4, 7, 8 or 12 from the Lagna) while the
other is not. Traditionally flagged for marriage; an astrologer can advise on remedies
and the Moon/Venus-based checks.
```

Hindi: `वर मांगलिक है और दूसरा व्यक्ति नहीं।` — same verdict, red ⚠ card.

Same two birth records through Ganak's **own** `/calculator/mangal-dosha`:

```
BOY : present=true strength=moderate rawCount=2   Lagna h2 counted · Moon h10 · Venus h1 counted
GIRL: present=true strength=moderate rawCount=2   Lagna h11 · Moon h1 counted · Venus h1 counted
```

The engine already computed the bride's Moon-based Manglik status and put it in the
result object — `manglik = {boy:true, girl:false, boyMoon:false, girlMoon:true, cancelled:false}`
— and the screen throws `girlMoon` away.

**Expected** — the bride *is* Manglik under the three-reference rule Ganak publishes and
gates (`validation/mangal-dosha.cjs` asserts "must check Lagna, Moon and Venus separately").
Under the standard mutual-cancellation rule the card should be green; at minimum the two
screens must not contradict each other. The card's own last clause ("an astrologer can
advise on … the Moon/Venus-based checks") is Ganak admitting it did not do them.

**Cause** — `src/engine/matching.ts:123-124`

```js
const manglik = { boy:boy.manglikLagna, girl:girl.manglikLagna, boyMoon:boy.manglikMoon, girlMoon:girl.manglikMoon,
  cancelled: boy.manglikLagna===girl.manglikLagna };
```
consumed at `src/screens/MatchingScreen.tsx:91,141-143`. `manglikMoon` is computed at
`matching.ts:121` and rendered nowhere. Venus is never used as a reference in matching at all.

**Suggested fix** — call `mangalDoshaReport` (or share its three-reference core) for both
charts, and base `cancelled` on the same reference set both screens use. Add a gate that
asserts the matching Manglik verdict equals the calculator's verdict for a fixture couple.

**Second instance of the same defect** — identical birth data for both partners
(`1990-06-15 08:30` Delhi, twice) yields
`{boy:false, girl:false, boyMoon:true, girlMoon:true, cancelled:true}` → the card renders
**green ✓ "Clear — neither partner is Manglik from the Lagna"** while both are Manglik from the Moon.

---

### F2 — P0 · Sade Sati reports impossible cycles: as short as 44 days

**Reproduction** — birth `1990-06-15 09:30` Delhi; Sade Sati calculator; check date `2044-01-01`.

**Observed** — literal rendered text of `/calculator/sade-sati`, English:

```
Sade Sati period
Not active on the selected date. The report still shows the nearest Sade Sati cycle …
Shown cycle: Mar 6, 2049 – Jul 9, 2049
· status: upcoming
Phases and transit segments
Rising    Mar 6, 2049 – Jul 9, 2049 · Saturn: Capricorn
```

Hindi renders the same 4-month cycle (`दिखाया गया चक्र: 6 मार्च 2049 – 9 जुल॰ 2049`).

Scanning check-dates 1900–2100 for the same chart:

```
105 / 201 check-dates produce a "cycle" shorter than 6.5 years
  asOf 1911-01-01 -> "upcoming" cycle 1931-04-11 .. 1931-05-25 = 0.12 yrs (44 days), 1 phase
  asOf 1910-01-01 -> "current"  cycle 1909-09-01 .. 1910-03-18 = 0.54 yrs,          1 phase
  asOf 1990-04-01 -> "current"  cycle 1990-03-20 .. 1990-06-20 = 0.25 yrs,          1 phase
```

Even the correct-length cycle is mis-segmented — check date 2026-08-18 gives **five**
phases in the order rising → middle → **rising** → middle → setting.

**Expected** — a Sade Sati is ~7.5 years and has exactly three phases. The page's own
Method copy says "Saturn transits the sign before the natal Moon, the Moon sign itself, or
the sign after it" — a 44-day answer cannot satisfy that.

**Cause** — `src/engine/sade-sati-report.ts`. `relationIntervals` (lines 32-53) splits an
interval every time Saturn retrogrades back out of the entry sign, and the only guard is
`out.filter((r) => r.end - r.start > 7 * DAY)` at **line 52** — seven days, where the
smallest legitimate cycle is ~2,700. `currentOrNext` (lines 69-72) then picks whichever
fragment comes first. The `phaseRanges` loop (lines 77-86) inherits the same fragmentation.

**Suggested fix** — merge adjacent intervals separated by less than a Saturn retrograde
loop (~150 days) before filtering, then reject anything under ~6 years as a cycle. Add a
gate asserting `6.5 < cycleYears < 8.5` and `phases.length === 3` across a sweep of check
dates. The page's existing retrograde caveat explains split *segments*; it does not
license a 44-day *cycle*.

---

### F3 — P0 · The two headline verdicts on the same screen contradict each other

**Reproduction** — the F1 couple (groom 1985-01-05 09:30 Delhi, bride 1991-07-15 14:15 Mumbai).

**Observed** — one scroll, English:

```
Ashtakoota Guna Milan
16.5 / 36
Not recommended
…
Total  27 / 36 · Very good      ← Dashakoota, ~15 lines below
```

Hindi: `सावधानी आवश्यक` above `बहुत अच्छा`.

A full sweep of all 104,976 nakshatra/rashi combinations finds **1,393** where the two
headline bands sit at opposite extremes (Ashtakoota "Not recommended" with Dashakoota
"Very good"/"Excellent", or the reverse).

**Expected** — answer-before-data means *one* plain verdict. Two contradictory verdicts,
both styled as the answer, both colour-coded (`C.sindoor` red vs `var(--good)` green),
leave the reader with no answer at all. Either reconcile them into a single verdict that
names the system disagreement, or demote one to a labelled secondary reading.

**Cause** — `src/screens/MatchingScreen.tsx:75` (Ashtakoota bands) and
`src/engine/matching.ts:113` (Dashakoota bands) are independent, and neither knows about the other.

**Also, separately: the English verdict is harsher than the Hindi one.** `t < 18` renders
**"Not recommended"** in English — an imperative instruction about a marriage — but
**"सावधानी आवश्यक"** ("caution needed") in Hindi. The plain verdict is not equivalent
across languages, and the English one is the fatalistic reading the engine header of
`doshas.ts` explicitly forbids ("Design rule for this file: NO fatalistic output").

---

### F4 — P0 · The headline says "Very good match" while the card below says the weightiest dosha is present

**Reproduction** — groom `1985-01-01 09:30` Delhi, bride `1985-07-11 14:15` Mumbai.

**Observed**

```
Ashtakoota Guna Milan   25 / 36   Very good match
…
⚠ Nadi dosha
Present — both share the same nadi. The weightiest koota (8 points lost); tradition
advises caution …
```
Dashakoota for the same couple: `24/36 Good match`, `rajjuDosha = true (Pada (feet))`.

Sweep counts:
- **569** combinations score ≥25 ("Very good match") **with Nadi dosha present**; the maximum is 27/36.
- **4,187** combinations score ≥25 with **Bhakoot dosha** present.
- **42** combinations reach the Dashakoota "excellent" band **with Rajju dosha present** — while the paragraph directly beneath calls Rajju *"a serious factor for marital stability"*.

**Expected** — a hard-block dosha must be reflected in the headline, or the headline must
say it is a points score that deliberately excludes the blocks. Right now the reader's
eye lands on a green "Very good match" and the contradiction is 40 lines lower.

**Cause** — `src/screens/MatchingScreen.tsx:75` and `src/engine/matching.ts:113` band on
`total` alone; `nadiDosha`, `bhakootDosha`, `rajjuDosha`, `vedhaDosha` are all available
on the same object and consulted only for the cards.

---

### F5 — P0 · Matching computes with the old city while the field shows the new one

**Reproduction (from the component contract — see caveat)** — on the matching screen,
type "Chennai" over the default "New Delhi, India" without clicking a suggestion, then
press **Match the kundalis**.

**Observed / expected** — `bPlace` is still `{label:"New Delhi", lat:28.61, lon:77.21}`,
so the whole match is computed for Delhi; the print/PDF header will also say
"New Delhi, India" while the on-screen field says "Chennai". No warning, no blocked button.

`src/components/PlaceInput.tsx` was built for exactly this: its header comment says
strict mode exists *"for callers that must not calculate with a stale place (the utility
calculators)"* and the parent is told on every change whether the visible text still
matches the selected place. **`MatchingScreen.tsx:35` does not pass `onConfirmed`.**
`UtilityCalculatorScreen.tsx:29`, `MedicalMuhuratScreen.tsx:128,144` and
`MuhuratHub.tsx:940` all do. Worse, `PlaceInput` only clears `open` inside `pick()`
(line 55), so after the first keystroke the resync effect at lines 21-24 never runs and
the typed text stays visible indefinitely.

`plans/backlog.md` TEST-STD-CALCULATORS names "the unconfirmed/blank/stale-place guard"
as mandatory for matching. It is absent.

**Caveat on evidence** — this is proved from the component contract and the two call
sites, not from an executed interaction: `renderToStaticMarkup` runs no effects or
handlers and no browser pass was performed (see *Not covered*).

**Suggested fix** — pass `onConfirmed` for both people and block `run()` with a visible
message, exactly as `UtilityCalculatorScreen` does.

---

### F6 — P1 · Unknown timezone silently becomes IST

**Reproduction** — a partner whose picked place has a `zone` that `zoneOffset` cannot resolve.

**Observed** — `src/screens/MatchingScreen.tsx:66-67`

```js
const btz = zoneOffset(bPlace.zone, by, bm, bd) ?? 5.5;
const gtz = zoneOffset(gPlace.zone, gy, gm, gd) ?? 5.5;
```

The chart is then computed as if the person were born in India. Nothing surfaces.

**Expected** — AGENTS.md: *"Errors must surface visibly in the UI. Silent failure is
unacceptable."* A failed zone lookup on a birth chart is a wrong-answer condition, not a default.

**Suggested fix** — surface a blocking message naming the place whose timezone could not
be resolved, and offer a manual UTC-offset override (ChartScreen already has `tzOverride`).

**Related, same line:** `zoneOffset` is resolved at *date* granularity, so a birth inside
a DST transition hour cannot be resolved correctly, and a non-existent local time
(e.g. 1990-04-01 02:30 US Eastern) is accepted without comment.

---

### F7 — P1 · The dosha panel silently follows the user's ayanamsa; the pages it links to force Lahiri

**Reproduction** — cast `1970-07-10 06:00` Delhi on the Chart screen, read the Dosha
analysis panel, then press the Raman ayanamsa chip directly above it.

**Observed**

```
ayanamsa=lahiri : Kala Sarpa = Shankhachuda · Pitra 1 indication · Papa 7/15 high
ayanamsa=raman  : Kala Sarpa = Karkotaka    · Pitra 0 indications · Papa 9/15 high
```

The panel prints **no convention label at all**, and its "Full page →" links go to
`/calculator/kala-sarpa`, `/calculator/pitra-dosha`, `/calculator/papa-dosha`, which route
through `mangalDoshaReport` / `sadeSatiReport`-style code that **hard-forces**
`ayanamsa: "lahiri"` (`src/engine/mangal-dosha.ts:25`, `src/engine/sade-sati-report.ts:64`).
So the panel and the page it links to give a different Kala Sarpa *name* and a different
Pitra Dosha *count* for the same birth.

**Expected** — AGENTS.md: *"Astronomy conventions: Lahiri ayanamsa, mean Rahu/Ketu … Never
silently switch; it changes every chart in the app."* Either pin the dosha panel to Lahiri
like the calculators, or state the active ayanamsa inside the panel and carry it through
the link. The Sade Sati page does this correctly ("Dates are calculated with Ganak's
Lahiri/mean-node panchang engine") — the dosha panel does not.

**Cause** — `src/screens/ChartScreen.tsx:1065-1067` feeds the user-selected chart `r`
straight into `kalaSarpaFromRows` / `pitraDoshaFromRows` / `papaCount`.

---

### F8 — P1 · Choosing a non-default ayanamsa contaminates the shared panchang engine

**Reproduction** (one shared module graph, as in the real Vite bundle):

```
baseline (Lahiri)                        Moon sidereal now = 190.0699
after casting a chart on RAMAN           Moon sidereal now = 191.5489   ← panchang engine now on Raman
after opening the Mangal-Dosha calculator Moon sidereal now = 190.0699  ← silently forced back
```

**Expected** — no cross-screen contamination. A 1.48° shift is enough to move a tithi,
nakshatra or muhurat boundary in the *free Panchang*, which never offered an ayanamsa choice.

**Cause** — `src/engine/panchang.ts:115-116`: `AYAN_MODE` is module-global mutable state;
`setAyanMode` (line 300) is called by `computeKundli` (`src/engine/kundli.ts:23`) and never
restored. Any consumer that calls `planetSidMs` / `moonSidMs` / `sunSidMs` without first
re-setting the mode inherits whatever the last caster left behind.

**Suggested fix** — thread the ayanamsa through as a parameter, or save/restore around
every `setAyanMode`. Add an invariance gate: compute a panchang value, cast a Raman chart,
recompute, assert equality.

---

### F9 — P1 · Switching panels destroys both people's birth data and the match

**Reproduction** — fill in both people, press Match, then tap **Vault** (or Kundli, or KP)
in the Jyotish panel nav, then come back to Matching.

**Observed / expected** — `src/screens/ChartScreen.tsx:450`:

```jsx
{activePanel === "matching" && <><Eyebrow … /><MatchMaker … /></>}
```

`MatchMaker` is conditionally **mounted**, so leaving the panel unmounts it and discards
all ten `useState` slots — both names, both dates, both times, both places and the computed
result. Returning shows the hard-coded defaults (New Delhi 1990-04-12 / Mumbai 1992-11-20).
`activePanel` itself is `useState("kundli")` (line 124) with no URL backing, and
`MatchingScreen` writes nothing to the URL, so reload / Back / Forward / sharing a link all
lose everything too.

AGENTS.md standing UX principle: *"no state resets without a user action."* Navigating to
the Vault is not a request to discard two birth records.

**Suggested fix** — hide rather than unmount (the sibling nav already uses `child.hidden`
at line 145), and put `activePanel` plus the two birth records in the URL the way
`chartStyle` already is (`urlPrefGet`/`urlPrefSet`, lines 120-121).

---

### F10 — P1 · In Hindi, the Ashtakoota "Detail" column is the same filler sentence eight times

**Reproduction** — any match, `lang="hi"`.

**Observed** — literal rendered text:

| English | Hindi |
|---|---|
| Varna · **Shudra / Kshatriya** · 0/1 | वर्ण · **चंद्र राशि और जन्म नक्षत्र पर आधारित संगति** · 0/1 |
| Yoni · **Lion / Dog** · 1/4 | योनि · **चंद्र राशि और जन्म नक्षत्र पर आधारित संगति** · 1/4 |
| Graha Maitri · **Saturn / Jupiter** · 3/5 | ग्रह मैत्री · **चंद्र राशि और जन्म नक्षत्र पर आधारित संगति** · 3/5 |
| Gana · **Rakshasa / Rakshasa** · 6/6 | गण · **चंद्र राशि और जन्म नक्षत्र पर आधारित संगति** · 6/6 |
| Nadi · **Madhya / Aadi** · 8/8 | नाड़ी · **चंद्र राशि और जन्म नक्षत्र पर आधारित संगति** · 8/8 |

All eight Hindi rows are byte-identical. Every piece of diagnostic content — the couple's
varna, yoni, gana, nadi and sign lords — is unavailable to a Hindi reader, under a column
header that says `विवरण` ("detail").

**Expected** — the same information, in Devanagari.

**Cause** — `src/screens/MatchingScreen.tsx:123`
`{hi ? "चंद्र राशि और जन्म नक्षत्र पर आधारित संगति" : k.note}`.
The engine's `note` strings are English-only (`YONI_NAMES`, `GANA_NAMES`, `NADI_NAMES`,
`VARNA_NAMES`, `VASHYA_NAMES`, `SIGN_LORD` in `matching.ts:27-31`), so the screen blanks
them rather than translating them. This is the `I18N-DEVANAGARI-TERMS` backlog item
landing on the paid Jyotish surface.

---

### F11 — P1 · Nadi and Bhakoot are declared present with none of their classical cancellations

**Reproduction** — any couple whose Moon signs are 2/12 apart under one sign lord.

**Observed** — `src/engine/matching.ts:61-64` scores Bhakoot and Nadi as a bare binary,
and `MatchingScreen.tsx:138-140` states the result as fact:

> "Present — the Moon signs form a 2/12, 5/9 or 6/8 axis, said to bear on emotional harmony, health and prosperity."

There is **no cancellation logic anywhere in the file** (grep for `cancel` returns only the
Manglik line). The classical exceptions that every published treatment carries — Bhakoot
cancelled when the two rashi lords are identical or mutual friends, or when Graha Maitri is
full; Nadi cancelled when the couple share a rashi but not a nakshatra, or a nakshatra but
not a rashi — are neither applied nor mentioned.

**Expected** — either apply the exceptions, or state in the card that Ganak reports the raw
rule and that classical cancellations exist. Ganak's own `doshas.ts` header sets this
standard ("shown transparently with the exact rule that fired"); the matching cards do not
meet it.

**Suggested fix** — add the cancellations behind an explicit, sourced convention note, the
way `mangal-dosha.ts` already exposes `mitigations`.

---

### F12 — P1 · No date range guard: year 1400 produces a confident dosha verdict

**Reproduction** — enter `1400-03-05` (the `<input type="date">` accepts it).

**Observed**

```
year 1400: asc=0 moonNak=24 pada=3
           mangal present=true strength=moderate
           sadeSati active=true phase=setting cycle 2020-01-24 → 2027-06-02
```

The 1880 and 2075 cases likewise return charts, Mangal verdicts and Sade Sati cycles with
no caveat. The underlying Schlyter-series ephemeris in `src/engine/ephemeris.ts` is a
low-precision fit that is not accurate over these spans, and nothing tells the reader.

**Expected** — a visible range guard on both matching and the calculators, stating the
supported span, per the "no silent failure" rule.

---

### F13 — P2 · English mode prints raw internal keys on the Papa Dosha card

**Observed** — ChartScreen dosha panel, English: `lagna: 4 · moon: 3 · venus: 2`.
Hindi, correctly: `लग्न: 4 · चन्द्र: 3 · शुक्र: 2`.

**Cause** — `src/screens/ChartScreen.tsx:1085` — the Hindi branch maps the key, the English
branch emits `rr.ref` verbatim. English is the degraded language here.

---

### F14 — P2 · Hindi mode renders planet names and the weekday in English

**Observed** — ChartScreen, `lang="hi"`:

```
विंशोत्तरी दशा
स्वामी  आरम्भ        अंत          वर्ष
Rahu    15 Jun 1990  26 Mar 1994  3.8
Saturn · वर्तमान …
…
86% पूर्ण          अभी Saturn महादशा
…
पञ्चाङ्ग   वार   Shukravara (Fri)
```

Fifteen lines lower on the *same screen*, marriage timing correctly renders `शनि / राहु दशा`
and `नव॰ 2023 – सित॰ 2026`. So Saturn is "Saturn" in one block and "शनि" in the next.

**Cause** — `src/screens/ChartScreen.tsx:1131` and the dasha chips use `dsh.lord` /
`r.current.lord` raw, while the marriage block at line 1194ff uses
`panchangTerm("hi","planet", …)`. The weekday string is hard-coded English at
`src/engine/kundli.ts:79`. The dasha dates use the English-only `fmtDateT`, marriage timing
uses `toLocaleDateString("hi-IN")` — two date formats in one screen.

`validation/language-leak-scan.cjs` passes on all of this.

---

### F15 — P2 · Sade Sati status leaks an English word into Hindi

**Observed** — `/calculator/sade-sati`, `lang="hi"`: `· स्थिति: upcoming`.

**Cause** — `src/screens/UtilityCalculatorScreen.tsx:127` renders `q.cycle.status`
(`"current" | "upcoming" | "past"`) unmapped.

---

### F16 — P2 · Dosha copy is not equivalent across languages

- Ashtakoota `t < 18`: EN **"Not recommended"**, HI **"सावधानी आवश्यक"** ("caution needed") — see F3.
- Nadi dosha, present: EN carries *"The weightiest koota (8 points lost) … though strong overall charts and remedies are said to mitigate it."* The Hindi string carries neither the point cost nor the mitigation clause (`MatchingScreen.tsx:138`). Hindi readers get the warning without the mitigation.

---

### F17 — P2 · Matching states no calculation convention at all

`grep -c "Lahiri|lahiri|लाहिरी|mean node"` over `MatchingScreen.tsx` and `matching.ts`
returns **0**. The closing caveat says only *"use the same validated ephemeris as the rest
of the app."* The Sade Sati page names "Lahiri/mean-node" explicitly in both languages;
matching — which produces a marriage verdict — names nothing. Given F7/F8, "the same as
the rest of the app" is not a stable claim.

---

### F18 — P2 · The Dashakoota table has none of the Ashtakoota table's styling

`src/screens/MatchingScreen.tsx:173-174` opens a bare `<table>` with bare `<th>` and no cell
padding and no `minWidth`, while the Ashtakoota table 60 lines above sets
`borderCollapse`, per-cell padding, `minWidth: 22.5rem` and an `overflowX` container.
Ten rows of Devanagari kuta names will crowd at 375px. (Text-only harness — this is read
from source, not measured; see *Not covered*.)

---

### F19 — P2 · Mangal Dosha misses two of Jupiter's three aspects, and one exception row

`src/engine/mangal-dosha.ts:37-38`

```js
const jupiterDistance = houseFrom(jupiter.sign, mars.sign);
if (counted && (jupiter.sign === mars.sign || jupiterDistance === 7)) mitigations.push("jupiterSupport");
```

Jupiter aspects the 5th, 7th and 9th from itself, so Jupiter aspects Mars when Jupiter is
in the **5th, 7th or 9th** from Mars. Only `7` is tested; the 5th and 9th aspects are
missed, so the mitigation is under-credited and `strength` is reported higher than the
stated method warrants — on a page about marriage.

Separately, `TRADITION_SPECIFIC_EXCEPTIONS` (lines 12-18) has entries for houses 2, 4, 7,
8 and 12 but **no entry for house 1** (Mars in Aries in the 1st), which every published
version of that list carries. It happens to be caught by the `ownOrExalted` branch, so the
outcome is unaffected — but the exception table does not match the method it claims.

---

### F20 — P2 · Dashakoota point granularity is coarser than the classical rule

- **Stree Deergha** (`matching.ts:95`) is `> 13 ? 2 : 0`. The common rule awards half marks
  when the count exceeds 9 and full marks above 13; the 1-point tier is missing.
- **Dina** (`matching.ts:93`) is all-or-nothing 3/0 for a koota that is usually graded.

Both under-score otherwise acceptable matches. (Direction of count was checked and is
correct — see *Clean*.)

---

### F21 — P2 · The print/PDF header is not localised

Hindi mode renders `वर (1990-04-12 · 09:30 · New Delhi, India)` — an ISO date and an
English place label inside a Hindi document (`MatchingScreen.tsx:102`).

---

### F22 — P2 · "No supportive window in the next twenty years" is a horizon artifact

For a 2075 birth, `marriageWindows` returns 0 windows because
`horizonMs = nowMs + 20*YEAR` (2046) precedes the first dasha, and ChartScreen renders
*"No clearly supportive window found in the next twenty years"* — presented as an
astrological finding rather than a range limit (`src/engine/marriage-timing.ts:24,41`).
The 18-year floor at line 23 is also hard-coded and unstated.

---

### F23 — P2 · Computed fields that no surface renders

- `dashakoota().kootas[].note` — including the Rajju group names — is computed
  (`matching.ts:93-102`) and replaced by a separate `KI` map in the UI.
- `manglik.boyMoon` / `manglik.girlMoon` — computed, never rendered (this is the mechanism of F1).
- `kalaSarpa().direction` (udit/anudit) is computed from `fwd.length >= bwd.length` even
  when the pattern is not full, where it carries no meaning; the calculator page prints it regardless.

---

## Probed and found CLEAN

Recorded so this pass's coverage claim is honest, and so the next agent does not redo it.

**Astrological tables — re-derived star by star, all correct:**
- `NAK_NADI` — all 27 stars map to the correct Aadi/Madhya/Antya group.
- `NAK_GANA` — all 27 match the classical Deva/Manushya/Rakshasa lists (9/9/9).
- `SIGN_VARNA` — all 12 correct (Cancer/Scorpio/Pisces Brahmin, etc.); the `boy >= girl` scoring rule is right.
- `SIGN_VASHYA` and `VASHYA_MATRIX` — match the widely published table including the asymmetric 0.5 entries.
- **Rajju** — `RAJJU_CYCLE[nak % 9]` reproduces the correct 5-group zig-zag for all 27 stars (Ashwini/Ashlesha/Magha/Jyeshtha/Moola/Revati → Pada, … Mrigashira/Chitra/Dhanishta → Siro). Verified individually.
- **Vedha** — all 13 pairs correct (Ashwini–Jyeshtha … Chitra–Dhanishta); Mrigashira correctly has no partner, and the gate proves it.
- **Bhakoot** — the `{2,5,6,8,9,12}` set is symmetric under reversal, so the dosha is direction-independent, as it must be.
- **Graha Maitri** — the `NF` natural-friendship table matches Parashari for all seven grahas; the 5/4/3/1/0.5/0 grading is standard.
- **Tara / Dina** — the even-remainder-of-9 convention is the one Drik-style implementations use; Ashtakoota correctly scores both directions at 1.5 each.
- **Mahendra and Stree Deergha count direction** — both count from the bride's star to the groom's, which matches Raman's statement of the rule. The two identical `countStar(girl.nak, boy.nak)` calls at `matching.ts:85-86` look like a copy-paste bug and are **not** one.
- **Kala Sarpa** — the 12 named types are correctly ordered by Rahu's house (Anant 1 … Sheshanaga 12); the enclosure test is strict, excludes the nodes, and the existing gate proves the guard is non-vacuous.
- **Mean nodes** — `ephemeris.ts:312` uses `125.1228 − 0.0529538083·d`, the **mean** lunar node, matching the AGENTS.md convention. No true-node path exists anywhere in this surface.
- **Dashakoota structure** — maxima sum to exactly 36; across all 104,976 combinations no kuta ever scored outside `[0, max]`.

**Behaviour:**
- **Stale-result clearing works.** `MatchingScreen.tsx:56` drops `res` on any change to either person, so the print header can never pair new births with old scores. The earlier Codex F2 fix holds.
- **Blank-input guard works** — a missing date or time on either person produces a visible bilingual message (`MatchingScreen.tsx:64`).
- **No crashes at any boundary tested** — pole (90°), 89.9°, Tromsø 69.65°, southern hemisphere, negative timezones, midnight, 23:59, 1400/1880/2075 all return results; `placidusCusps` correctly degrades to the labelled Porphyry fallback above ~66°.
- **Cross-timezone couples compute correctly** (Delhi × London produced a coherent result).
- **Papasamyam framing is responsible** — presented as a balance with an explicit tolerance and "one traditional lens among many, not a verdict", in both languages.
- **The Sade Sati, Kala Sarpa, Pitra and Papa calculator pages carry their conventions and caveats**, are non-fatalistic, and state their limitations (`sade-sati` even names "Lahiri/mean-node" in both languages). The `doshas.ts` no-fatalism design rule is honoured in the engine copy.
- **The Mangal Dosha calculator page** correctly exposes all three references, per-reference houses, mitigations and an adjusted score, bilingually.

---

## What this pass could NOT cover — stated explicitly

1. **No browser or dev-server pass.** Every "observed" block is `react-dom/server` text.
   Nothing here proves layout, overflow, contrast, focus order, touch-target size, scroll
   behaviour, the actual `window.print()` output, or anything at 375px. F18 in particular is
   a source reading, not a measurement.
2. **No effects or event handlers ran.** F5 (stale place) and F9 (unmount on panel switch)
   are proved from the component contract and call sites, not from a live interaction. They
   should be confirmed with a click-through before being closed.
3. **No live production check.** Nothing was verified on ganak.pages.dev; all runs are local
   against this worktree at 421e82d.
4. **No third-party ephemeris cross-check.** Astrological correctness was verified against
   classical *rule tables* re-derived by hand, not against independently computed charts from
   Swiss Ephemeris, Drik Panchang or JPL. **This pass therefore makes no claim that Ganak's
   planetary positions match Drik** — only that the koota logic applied to those positions is
   right. `validation/drik-reference-anchors.cjs` exists for the positional half and was not
   re-run here. A future pass should pin two or three dated celebrity charts to an external
   reference.
5. **Genuine source variation is not adjudicated.** Varna, Vashya, Gana and Yoni point tables
   differ between traditions; the screen says so. I verified them against the most widely
   published versions only, and did not attempt to settle which tradition Ganak should follow —
   that is a religious-accuracy human gate.
6. **Not audited:** `western-relationship` synastry, `pancha-pakshi`, `shraddha-tithi`,
   `baby-name`, the `RectifyModule` / `BNNModule` / `BhriguModule` sections of ChartScreen,
   the online place-search network path, ChartVault save/load of a match, rapid repeated
   input changes, and concurrent-tab behaviour.
7. **No fixes and no new gates were written.** This is an independent finder's pass; an
   independent pass loses its value if the finder also fixes. The obvious next step —
   extending `validation/snapshot-results.cjs` to cover the match *result* surface using the
   `useState(null)` seeding technique in `.scratch/bugbash/render-match.cjs` — is left to the
   implementing agent.

---

## Summary

| Severity | Count | Findings |
|---|---|---|
| **P0** — wrong answer / harmful copy / data loss | 5 | F1, F2, F3, F4, F5 |
| **P1** — broken journey | 7 | F6, F7, F8, F9, F10, F11, F12 |
| **P2** — polish | 11 | F13 – F23 |
| **Total** | **23** | |

All 23 pass the four existing gates and the 14 committed screen snapshots. The snapshot
baseline for this screen (`validation/snapshots/matching.en.txt`) is eleven lines long and
contains no koota, no dosha and no score — which is precisely the gap backlog #65 describes.
