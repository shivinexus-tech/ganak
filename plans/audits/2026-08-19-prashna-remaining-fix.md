# Prashna / KP horary — second fix pass (the findings the first lane left open)

- **Date:** 2026-08-19
- **Agent:** fix agent (Claude), branch `claude/prashna-remaining`,
  worktree `.scratch/worktrees/prashna-rest`, base `origin/main` `b9ceee5`.
- **Input:** `plans/audits/2026-08-18-bugbash-prashna-kp.md` (17 findings) and
  `plans/audits/2026-08-18-prashna-fix-notes.md` (the first lane, which ran out of
  capacity after the P0).
- **Owned files:** `src/screens/PrashnaScreen.tsx` (outside the parity-frozen
  markers), `src/engine/kp-horary.ts`, `src/engine/houses.ts`,
  `src/engine/special-points.ts`, the Prashna gates,
  `validation/screen-snapshots.cjs` + `validation/snapshots/**` for Prashna
  baselines, the Prashna sourcing docs, and this note.
- **Method:** every defect reproduced and its wrong output printed *before* any
  edit; every fix gated by a sweep, not a spot check; every new assertion carries a
  fail-then-pass proof (red against the pre-fix tree, green after), both pasted.

---

## What was actually already closed

The handoff said "roughly eleven findings remain". Reading the code rather than the
list, the first lane had in fact closed more than its note recorded — it wrote up
only F3 before it stopped. Re-verified here against the shipping code, not assumed
(`.scratch/prashna-rest/verify-closed.cjs`, literal output):

```
F1   CLOSED       NumberSetBox rows: 'Judged on' | 'Counted in favour' | 'Counted against'
F2   CLOSED       HOUSE_PLAIN_DENY covers 12/12 houses; phrases reused from the FAVOUR table: 0
F3   CLOSED       above 60 deg: worst |span sum - 360| = 0.00e+0, most planets in one house = 4
F6   CLOSED       PR_resolveJudgmentMoment holds the judgment year to YEAR_MIN..YEAR_MAX
F8   CLOSED       switchMode refuses the toggle while a reading is locked
F10  CLOSED       ask() sets locked for BOTH branches; sessionLocked is not mode-scoped
F11  CLOSED       share card paints the verdict badge; the house-system line is bilingual
F14  CLOSED       number-mode provenance names what is KSK and what is Ganak
F15  CLOSED       PR_toAsciiDigits folds six numeral systems before validation
F16  CLOSED       ask() ends with setShowFull(chartFirst || showExpert)
```

F11 was checked by painting the card through a shimmed canvas, because a claim
about a PNG is not evidence until something reads the PNG:

```
--- share card, en ---            --- share card, hi ---
  Prashna chart                     प्रश्न कुण्डली
  Health · KP number method · #11   स्वास्थ्य · कृष्णमूर्ति पद्धति अंक 11
  Mixed                             मिश्रित
  Mixed — some support, …           मिश्रित — कुछ पक्ष अनुकूल, कुछ नहीं; …
  Houses: Equal houses — high-…     भाव: समान भाव — उच्च अक्षांश विकल्प
```

F15 was checked behaviourally rather than by grep:

```
"१३९"  -> "139" (valid digits)      "१३९ " -> "139" (valid digits)
"١٣٩"  -> "139" (valid digits)      "1.5"  -> "1.5" (rejected as non-numeric)
"0139" -> "139" (valid digits)      "-5"   -> "-5"  (rejected as non-numeric)
```

**Two of the "closed" ones were not.** F5 had a guard that could not fail, and F4
had a resolver with no field to feed it. Both are dealt with below. That is the
pattern worth naming: a fix is not closed because a fix was written, and this pass
found two of them by building the gate first and letting it argue.

---

## F12 — P1 · one vara per chart (Gulika stopped using tomorrow's weekday)

### What was wrong

Gulika/Mandi is a **vara** construction: the day (sunrise→sunset) and the night
(sunset→sunrise) are each divided into eight parts, the parts are ruled in weekday
order from the lord of the vara, and Gulika is the ascendant at the start of
Saturn's part. **A vara begins at sunrise** — that is what makes it a vara and not a
calendar date.

`src/engine/special-points.ts` read the civil weekday
(`new Date(birthMs + tz*3600000).getUTCDay()`), while `src/engine/kundli.ts` applied
the sunrise correction for the very same chart's Ruling Planets. Every birth between
midnight and sunrise therefore ran Gulika on tomorrow's weekday and Ruling Planets
on today's, **and the Jyotish page printed both**.

Reproduced (`.scratch/prashna-rest/f12-repro.cjs`), literal output, **before**:

```
Delhi 2026-08-18 03:00 IST (the audit case)
  sunrise                 : 05:52 local
  civil weekday           : Tuesday  (lord Mars)
  Hindu vara (sunrise)    : Monday  (lord Moon)
  Ruling-planet day lord  : Moon
  Gulika / Mandi SHIPPED  : Aquarius 1°30′       <-- built from Tuesday
```

and **after**:

```
  Gulika / Mandi SHIPPED  : Aquarius 29°36′      <-- built from Monday, the vara
```

Also moved: Chennai 2026-01-01 01:15 (Libra 10°02′ → Scorpio 2°13′) and London
1990-04-12 02:30 (Sagittarius 12°32′ → Capricorn 5°22′).

### Which of the two was wrong, and why

The **civil weekday** was. Two independent reasons, neither of them a preference:

1. **Classical.** The eight parts are counted within the vara's own day and night,
   from the vara lord. The Vedic day begins at sunrise, so a 03:00 birth belongs to
   the previous weekday's vara.
2. **The code already agreed with (1) and then contradicted itself.** For a
   pre-sunrise birth the night branch already picks the **previous evening's**
   sunset as the night start — i.e. it already treats the night as the previous
   vara's night. The weekday it counted the parts *from* was the only thing left
   uncorrected.

No doctrinal disagreement to record: this is the majority reading and the code's own
other half.

### The fix

One line in `src/engine/special-points.ts`, identical to the correction
`src/engine/kundli.ts` already applies:

```js
let dow = new Date(birthMs + tz * 3600000).getUTCDay();
if (birthMs < rise) dow = (dow + 6) % 7;   // before sunrise the previous vara still runs
```

`kundli.ts` is owned by another lane, so nothing was changed there; the fix sits
entirely inside the file that had the defect.

### The gate — `validation/vara-consistency.cjs`

**It never asks the engine which weekday it used.** It rebuilds the Gulika instant
from the classical rule for **both** candidate weekdays, takes the ascendant at
each, and asks which of the two the shipped value actually equals. On a pre-sunrise
birth the two candidates are a whole eighth of the night apart, so the
discrimination is real; the gate asserts that too, so it cannot pass vacuously.

Fail-then-pass:

```
red  (pre-fix)  FAIL Chennai 2026-01-15 00:15: shipped Gulika Libra 24°17′ is not the
                     vara-reckoned value Scorpio 15°52′ (off 21.5784°); the
                     civil-weekday value is Libra 24°17′ (off 0.0000°)
                … and 704 more
                ✗ vara-consistency: 3361 passed, 729 failed

green (fixed)   charts swept            1680
                pre-sunrise charts      728   (of which discriminating: 728)
                worst |shipped − vara|  0.00e+0°
                ✓ vara-consistency: 4090 passed, 0 failed
```

---

## F9 — P1 · Ganak now computes the rule it was claiming

### What was wrong

`plans/prashna-249-ksk-verify.md` rule 4 was headed *"Engine rule (what Ganak will
do)"* and marked ✅ **Tier 1 — page-pinned**. The word "ruling" appeared **nowhere**
in `src/screens/PrashnaScreen.tsx`. The one rule Krishnamurti ties explicitly to
*"the moment of judgement"* was the one rule the horary screen never computed — on a
page that asks working astrologers whether its cuspal sub-lords and significators
are correct, and an astrologer answering that question looks for the Ruling Planets
first, because in KP they are the filter applied to exactly the two tables printed
there.

```
"ruling" in PrashnaScreen.tsx: 4 line(s)
  10: import { computeRulingPlanets, WEEKDAY_LORDS } from "../engine/dasha";
  975: /* Ruling Planets for the moment of judgement (bug bash F9) — …
  1110: ruling: PR_judgmentVara(ms, castZone, castLat, castLon) });
  1115: ruling: PR_judgmentVara(ms, castZone, castLat, castLon) });
```

The first lane had laid the groundwork — a sunrise-reckoned `PR_judgmentVara`, and
the import — and stopped before the set was computed or anything reached the screen.
`computeRulingPlanets` was imported and never called.

**The claim was not left standing.** It is now true.

### What Ganak now does, and which reading it follows

Computed for the judgment moment, rendered directly under the significator grid,
through the app's **one** Ruling-Planet implementation (`computeRulingPlanets`,
`src/engine/dasha.ts`, read-only in this lane) fed **this chart's own** sidereal
longitudes — so a number-mode reading uses its KP-New lagna and Moon rather than a
Lahiri copy of them.

The sources genuinely disagree on the size of the set, so the choice is stated
rather than assumed, on the screen and in the citation index:

- **Ganak follows the five-fold Reader VI definition** — the lords of the **day**,
  the **Moon's sign and star**, and the **lagna's sign and star**. Section V *"Ruling
  planets"*, scan **p.175** / printed folio **p.167**: *"the lords of the day, Moon
  sign, star and lagna at the moment of judgement"*; the five-planet derivation is
  worked at scan **p.146**. This is also the set the **owner approved for this
  screen on 2026-07-24** (§ "Collapsible full working", item 3).
- **Much modern KP practice adds the sub-lords of the lagna and the Moon.** That
  refinement is later than the passage above and is not in it. Ganak **prints those
  two, labelled as the modern extension, and does not count them**; the panel says so
  in both languages.
- **What the set is used for.** Rule 4's second half — *"common planets between RPs
  and significators survive"* — is applied as a **confirmation**: the judged cusp's
  significators are split into those that are also Ruling Planets and those that are
  not. It does **not** touch the verdict. The yes/no stays the cuspal sub-lord's, and
  the gate asserts the scoring never acquires an RP term. Reading the intersection
  as a scoring input would be inventing a weight the Readers do not give.
- **The vara is sunrise-reckoned at the judging place.** Where the sun neither rises
  nor sets, the panel says the vara came from the calendar day instead of pretending.

Rendered (literal harness output, English then Hindi):

```
Ruling Planets
Day lord (vara)          Mars
Moon sign lord           Venus
Moon star lord           Rahu
Ascendant sign lord      Venus
Ascendant star lord      Jupiter
Ruling Planets: Mars · Jupiter · Venus · Rahu — for Tuesday.
Venus appears more than once above — in KP a repeated ruling planet is read as the
stronger witness.
Significators of the 7th cusp that are also Ruling Planets: Mars · Rahu. Without
ruling support: none.
Ruling Planets = the lords of the day, the Moon's sign and star, and the ascendant's
sign and star, at the moment of judgement (Krishnamurti, KP Reader VI, Section V). In
KP the significator that is also a Ruling Planet is the one expected to fructify —
this confirms the answer, it does not change it; the yes/no stays with the cusp
sub-lord. Much modern KP practice also adds the sub-lords of the ascendant and the
Moon (Jupiter); Ganak shows them and does not count them.
```

```
शासक ग्रह: मंगल · गुरु · शुक्र · राहु — मंगलवार के लिए।
7वें भाव के कारकों में से शासक ग्रह भी हैं: मंगल · राहु। बिना शासक-समर्थन के: कोई नहीं।
```

**The panel ranks nothing.** That is deliberate: F13 reports that the Jyotish
screen's RP summary explains its winner by a number it did not rank on. This panel
prints one number — a repetition count — and count is the only thing it claims.

### A second defect, found by the gate

Wiring the shared engine in surfaced a disagreement the audit did not have. The 249
table pins the ascendant **exactly** on a sub boundary by construction: number 158 is
Scorpio 16°40′00″, i.e. 680/3 degrees. In IEEE doubles 680/3 rounds a third of a
quadrillionth of a degree **below** the ideal boundary, so a bare
`Math.floor(lon / (360/27))` returns the previous nakshatra:

```
number 158
ascSid                   226.666666666667
kpNumberInfo sub         Mercury | star Mercury
screen PR_subOf (lagna)  Me      | star Me
dasha subLordChain       Jupiter | star Saturn      <-- one segment low
nudged +1e-9             Mercury
```

Left alone, the Ruling-Planet panel would have printed *"ascendant sub-lord Jupiter,
star Saturn"* three inches under an answer card reading *"Ascendant sub-lord Mercury
· Jyeshtha"* — the F12 failure mode (two reckonings of one thing on one page) reborn
in a new panel. The frozen engine already closes this class with `PR_SUB_EPS` and
`PR_NAK_ARCSEC`; `src/engine/dasha.ts` does not, and belongs to another lane. So the
longitudes handed to the shared engine are nudged **one micro-arcsecond** into the
segment — the degree equivalent of `PR_SUB_EPS`, eleven orders of magnitude smaller
than the narrowest KP sub, and a no-op anywhere except exactly on a boundary. The
gate asserts the agreement, so if `dasha.ts` is ever fixed at source nothing here
breaks and the nudge simply stops mattering.

### The gate — `validation/prashna-ruling-planets.cjs`

Six things, none of them "the function exists":

1. the citation index's claim and the screen agree — computed **and rendered**,
   asserted against the rendered text in both languages;
2. exactly the sourced five are counted, in the sourced order, and the two sub-lords
   are shown but **not** counted — both halves, so neither the doctrine nor the
   disclosure can drift silently;
3. **one reckoning per page** — the shared engine's lords equal the lords the
   screen's own frozen `PR_subOf`/`PR_SIGN_LORD` print in the graha table beside them;
4. the vara is sunrise-reckoned, checked against `sunEvents` at the judging place;
5. the intersection **partitions** the judged cusp's significators exactly —
   confirmed ∪ unconfirmed = the grid's A∪B∪C∪D, nothing invented, nothing dropped;
6. the verdict is untouched — `PR_judge` returns no ruling key and a full built
   reading scores identically to `PR_judge` alone.

Fail-then-pass:

```
red  (pre-fix)  FAIL PrashnaScreen no longer computes Ruling Planets, while the
                     citation index still lists rule 4 as an implemented engine rule
                FAIL the Ruling Planets are computed but never rendered — the claim is
                     only true if a reader can see them
                FAIL PrashnaScreen exports no Ruling-Planet rule — nothing to sweep.
                ✗ prashna-ruling-planets: 2 passed, 3 failed

green (fixed)   charts swept                 400   (5 places x 5 days x 8 hours x 2 modes)
                pre-sunrise judgments        45
                polar (no sunrise) judgments 24
                cusps with RP-confirmed sigs 3801
                cusps with unconfirmed sigs  3677
                ✓ prashna-ruling-planets: 25437 passed, 0 failed
```

---

## F4 (remaining half) and F5 (**not** closed by the first lane)

### F5 — the DST guard could not fail

The first lane's F5 fix round-tripped the resolved instant through **`zoneOffset`
itself**:

```js
const back = new Date(ms + off * 3600000);   // off is what produced ms
```

which agrees with the offset that produced it *by construction*. It could never
disagree, so the guard was decorative. Measured against the platform's own IANA
database (`.scratch/prashna-rest/f5.cjs`), **before**:

```
Europe/London     2026-03-29 1:30   zoneOffset=0   -> instant reads back as 02:30
America/New_York  2026-03-08 2:30   zoneOffset=-5  -> instant reads back as 03:30
Australia/Sydney  2026-10-04 2:30   zoneOffset=10  -> instant reads back as 03:30
Europe/London     2026-03-29 0:30   zoneOffset=0   -> instant reads back as 00:30   (real clock)
```

01:30 does not exist that morning in London. The guard said it did, the verdict card
printed the shifted time, and the share PNG carried it. **This is the same shape as
the parity tautology the high-latitude lane found: a check comparing a thing with
itself.**

Fixed by round-tripping through `Intl.DateTimeFormat` — the same tz database the
rest of the app resolves zones with, and an authority independent of Ganak. An hour
a calendar **skips** now reads back as a different clock and is refused; an hour a
calendar **repeats** (autumn fall-back) reads back as the same clock and is accepted,
which is right: ambiguous is not impossible.

### F4 — the override had a resolver and no field

`PR_resolveJudgmentMoment` could resolve a typed clock against a named zone, and
there was **no field in which to name one**. Unless the app happened to hand the
screen a zone — it does not, see the handoff below — the override was still
structurally unable to do the thing it is named for, and its caption still told every
reader the time was read in their device's zone.

The cost, measured over the twelve topics at Chennai
(`.scratch/prashna-rest/f4-repro.cjs`):

```
topic         intended 18:00 IST      device-zone 18:00 BST
marriage      Rahu/mixed              Mercury/unfavourable
money         Saturn/favourable       Sun/unfavourable
health        Mercury/unfavourable    Venus/mixed
lost          Moon/mixed              Rahu/unfavourable
general       Rahu/favourable         Venus/mixed
…
cusp sub-lord changes: 12/12   verdict flips: 7/12
```

Now: the panel takes an IANA name, shows a visible reason when it does not recognise
one, names that field as the blocking reason on the disabled Cast button, and the
caption says which zone the typed clock is read on:

```
  Leave the time blank to use this moment. The time you type is read on Asia/Kolkata clocks.
  “Mars/Olympus” is not a timezone Ganak recognises. Use a name like Asia/Kolkata or
  Europe/London, or leave it blank.
```

Also hardened: the resolver itself refuses a zone string it cannot resolve rather
than quietly reading it on the device clock behind the disabled button.

### The gate — `validation/prashna-judgment-zone.cjs`

Checked against **Intl**, not against a second copy of Ganak's resolver. Five legs:
a named zone is honoured (63 zone/clock pairs, half-hour and 45-minute zones
included); an unrecognised name is refused; the spring-forward gap is refused **and
the hour either side is accepted**, so the leg cannot pass by refusing everything;
the year range holds; and the panel renders the field and tells the truth in both
languages.

```
red  (pre-fix)  FAIL Europe/London 2026-03-29T01:30 is inside the spring-forward gap
                     and must be refused, not moved an hour; got {"ms":1774747800000,"problem":null}
                FAIL the override panel has no timezone input — without one the override
                     still cannot express the judging place's local time
                FAIL en: the caption still claims the device's timezone while a real
                     zone is in force
                ✗ prashna-judgment-zone: 79 passed, 20 failed

green (fixed)   zone/clock pairs resolved   63
                differing from device parse 52
                ✓ prashna-judgment-zone: 99 passed, 0 failed
```

---

## The rendered Prashna baseline — the hole all seventeen findings lived in

`validation/snapshots/prashna.en.txt` was **37 lines** ending at `Ask now`, with no
occurrence of "favourable", "lagna", "cusp" or "sub-lord" anywhere in it:
`renderToStaticMarkup` presses no buttons, so the only Prashna surface any baseline
had ever seen was the **empty form**. Every one of the seventeen findings lived on
the surface it could not look at, and all seventeen passed all nine Prashna gates.

`validation/_prashna-seed.cjs` + `prashna-result.{en,hi}` close it: **403 lines each**,
three cast readings, composed by PrashnaScreen's own `PR_buildResult` (the function
`ask()` calls) and rendered through the shipping JSX — so the baseline records what
the app builds rather than a hand-assembled object that could drift away from it.

The three readings are chosen to pin **both lanes'** fixes:

| reading | what it holds in place |
|---|---|
| number **139** / marriage, New Delhi | the KSK worked anchor — line 53 of the baseline is `Libra 20°00′` (Reader VI scan p.269) |
| time mode / **health**, New Delhi | the default mode, and the topic whose deny side is the 6th house, where F1 and F2 both landed |
| time mode / career, **Tromsø 69.65°N** | the F3 band — the baseline now records the planets in houses 1, 4, 6, 8, 10 and 12 under "equal houses — high-latitude fallback", not eight of nine in house 4 |

Both languages have identical line counts, so the **positional en/hi content-parity
check** in `screen-snapshots.cjs` § 4 now covers the entire answer surface.

Fail-then-pass, re-breaking F1's answer-card row on purpose:

```
red    FAIL prashna-result.en: rendered text changed
         -55: Judged on                          +55: Houses judged
         -56: house 7                            +56: 2 · 7 · 11
         -57: the yes/no is taken from this …    +57: Rahu is the deciding influence …
         -58: Counted in favour
         -60: Counted against

green  ✓ screen-snapshots: 60 baselines match · 27 screens × 2 languages +
         chart/transit/match/prashna results
```

---

## Not fixed — handed off, with the exact change

These are **not** deferrals of judgement. Each is a file this lane was explicitly
forbidden to write, and in one case a region the brief froze.

### F7 (P1) — the reading, and the one-question lock, die with the mount

`src/kundli-app.tsx:267-269` renders the screen behind `mode === "prashna" &&`, so
tapping **Daily** or **Jyotish** unmounts `PrashnaScreen` and every piece of its
state. Tapping back gives a blank form, and the same number can be cast again against
a different sky — which defeats the Tier-1 one-question rule the screen states out
loud. Verified still open:

```
F7  OPEN  src/kundli-app.tsx renders PrashnaScreen behind `mode === "prashna" &&`;
          nothing about a reading is in the URL or in approved storage
```

`src/kundli-app.tsx` is integration-owned, is on this lane's do-not-touch list, and is
reserved by `CODEX-P0-ROWS-38-39-2026-07-28`.

**The two candidate fixes are not equivalent, and the difference is a product call
the owner should take, not an agent:**

- *Keep the screen mounted and hidden* — smallest change, one line in the shell, and
  the reading survives a tab tap. It does **not** survive a reload or a Back.
- *Persist the reading through `src/storage/approved-storage.ts`* — survives a
  reload, and puts **what the querent asked about** (health, litigation, marriage…)
  into on-device storage. AGENTS.md allows `preferences` only for "non-sensitive
  comfort, language, place and follow choices" and bans ad-hoc keys, so this needs an
  explicit decision, not an agent's assumption.

A URL round-trip of the cast reading (number, topic, judgment instant, place) is the
third option and is the only one that gives a shareable link; it has the same
disclosure question attached, in a stronger form, because a URL travels.

### F13 (P2) — the Jyotish ruling-planet summary explains its winner by a number it did not rank on

`computeRulingPlanets` ranks by **weight**; `src/screens/ChartScreen.tsx` explains the
winner by **count**. Verified still open, with the shipping sentence:

```
F13  OPEN  src/screens/ChartScreen.tsx: appears through {topRp.count} source{…}. In KP,
           repeate… — ranked by weight, explained by count
```

`src/screens/ChartScreen.tsx` and `validation/ruling-planets.cjs` are both owned by
`CLAUDE-FIX-DASHA-TRANSIT-2026-08-18`, together with `src/engine/dasha.ts`. That lane
is the right owner: the fix is either to state the weighting in the sentence or to
rank by count, and both touch files this lane must not write.

The new Prashna panel does **not** repeat the defect — it ranks nothing and the one
number it prints is a repetition count, which is the only thing it claims.

### F17 (P2) — two Placidus implementations, two cutoffs, two fallbacks

Reproduced (`.scratch/prashna-rest/f17-repro.cjs`), literal output:

```
lat     place          Jyotish house system                       Prashna  worst cusp gap
59.91   Oslo           Placidus                                   placidus  0.00 deg
60      exactly 60     Placidus                                   placidus  0.00 deg
60.17   Helsinki       Placidus                                   equal    28.69 deg   <-- DISAGREE
60.72   Whitehorse     Placidus                                   equal    28.22 deg   <-- DISAGREE
61.22   Anchorage      Placidus                                   equal    32.31 deg   <-- DISAGREE
62.45   Yellowknife    Placidus                                   equal    23.97 deg   <-- DISAGREE
63.43   Trondheim      Placidus                                   equal    27.41 deg   <-- DISAGREE
64.15   Reykjavik      Placidus                                   equal    19.08 deg   <-- DISAGREE
64.84   Fairbanks      Placidus                                   equal    35.28 deg   <-- DISAGREE
66.56   polar circle   Placidus                                   equal    32.89 deg   <-- DISAGREE
68.97   Murmansk       Porphyry (Placidus undefined …)            equal    30.62 deg
69.65   Tromso         Porphyry (Placidus undefined …)            equal    25.22 deg
```

A KP practitioner comparing the two Ganak screens for Reykjavík finds cusps 19°
apart, under two different system names.

**This lane stopped on it.** The cutoff lives at
`src/screens/PrashnaScreen.tsx` `PR_placidus` — `if (Math.abs(lat) > 60) return null` —
which is **inside the parity-frozen markers** (the region runs from
`// ===== ENGINE (validated) =====` to `// ===== END ENGINE =====`, and `PR_placidus`
sits within it). The brief authorises no edits there.

**The exact change, for whoever takes it:**

1. In `PR_placidus`, replace the flat latitude cutoff with the same **geometric**
   degeneracy test `src/engine/houses.ts` already uses — bail only when a
   cusp-defining ecliptic point is circumpolar (`|tan φ · tan δ| ≥ 1`), which is the
   actual definition of "Placidus is undefined here" and lands near 66.56°, not 60°.
   That alone closes eight of the ten disagreeing rows above and gives Helsinki,
   Anchorage, Whitehorse, Yellowknife, Trondheim, Reykjavík and Fairbanks the same
   real Placidus KP cusps on both screens.
2. **The parity mechanism compares the screen's copy against the engine**, so the
   identical change must land in `validation/prashna-calc.js` `houseCusps` in the
   same commit, or `prashna-parity.js` will fail — and, more importantly, a change in
   only one place would make parity green while the two engines disagreed.
3. **Re-anchor `validation/prashna-high-latitude.cjs` externally, not against the
   sibling copy.** Its Björk anchor (Reykjavík, 64.15°N) currently asserts the *equal*
   ring — `cusp 10 == asc + 270°` and "the published MC falls in equal house 11".
   Under the fix Reykjavík becomes Placidus, and the anchor gets **stronger**: assert
   the published MC **is** cusp 10, against the same published literal already in the
   file. Add fresh equal-branch latitudes above the polar circle (67, 69.65, 85) so
   the equal ring keeps its own coverage. Do not weaken the ring invariants.
4. **Above the polar circle the two screens still disagree by design** — Jyotish
   falls back to Porphyry (constructed in `src/engine/kundli.ts`), Prashna to equal
   house (citation index rule 9). Both are honestly named on their own screens and
   neither is wrong, but one convention would be better than two. Unifying them
   touches `src/engine/kundli.ts`, which is a different lane's file, and changes
   shipped Jyotish charts — a product call, and it needs its own external anchor.

### F4, last line — the shell drops the zone it already has

`src/kundli-app.tsx:268`:

```jsx
<PrashnaScreen lat={panchEff?.lat} lon={panchEff?.lon} placeLabel={panchEff?.label} lang={lang} />
```

`panchEff` is `{ label, lat, lon, zone }` and round-trips `zone` through the URL. The
screen now takes a `zone` prop and honours it; the shell is the only thing left. One
line:

```jsx
<PrashnaScreen lat={panchEff?.lat} lon={panchEff?.lon} zone={panchEff?.zone}
               placeLabel={panchEff?.label} lang={lang} />
```

Until that lands, a reader who never opens the override panel still has a typed
judgment moment read in the device's zone. `validation/prashna-judgment-zone.cjs`
prints this as an **OPEN HANDOFF** line on every run, and flips to a ✓ by itself the
moment the shell passes the prop — so it cannot be forgotten and does not redden the
board in the meantime.

---

## Where the seventeen stand

| # | Sev | State | By |
|---|---|---|---|
| F1 | P1 | closed | first lane (verified here) |
| F2 | P1 | closed | first lane (verified here) |
| F3 | **P0** | closed | first lane (re-verified here) |
| F4 | P1 | **closed in this screen**; one line open in the shell | first lane + this lane |
| F5 | P2 | **closed here** — the first fix could not fail | this lane |
| F6 | P2 | closed | first lane (verified here) |
| F7 | P1 | **handed off** — `src/kundli-app.tsx`, and a storage/privacy call | — |
| F8 | P1 | closed | first lane (verified here) |
| F9 | P1 | **closed here** | this lane |
| F10 | P1 | closed | first lane (verified here) |
| F11 | P2 | closed | first lane (verified here, through the canvas) |
| F12 | P1 | **closed here** | this lane |
| F13 | P2 | **handed off** — `src/screens/ChartScreen.tsx`, another lane's file | — |
| F14 | P2 | closed | first lane (verified here) |
| F15 | P2 | closed | first lane (verified here, behaviourally) |
| F16 | P2 | closed | first lane (verified here) |
| F17 | P2 | **stopped** — inside the parity-frozen markers; exact change written above | — |

Fourteen closed, three open: two in files this lane may not write, one inside the
frozen region.

## New gates

| gate | what it proves | why it is not a tautology |
|---|---|---|
| `validation/vara-consistency.cjs` | one vara per chart — Gulika and the Ruling Planets are reckoned the same way | rebuilds both candidate weekdays from the classical rule and asks which one the shipped value is; asserts the two candidates actually differ |
| `validation/prashna-ruling-planets.cjs` | the citation index's rule 4 is computed, rendered, sourced, and does not touch the verdict | checks the shared engine's lords against the screen's own frozen sub-lord tables, and the intersection against the significator grid |
| `validation/prashna-judgment-zone.cjs` | the judgment moment is resolved in the judging place's zone, and impossible clocks are refused | round-trips through `Intl`, the platform's IANA database, never through Ganak's own resolver |
| `validation/snapshots/prashna-result.{en,hi}` | what a reader actually sees after casting | composed by the shipping `PR_buildResult` and rendered through the shipping JSX |
