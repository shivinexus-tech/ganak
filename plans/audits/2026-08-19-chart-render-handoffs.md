# Fix pass — the chart screen's render-side handoffs

- **Date:** 2026-08-19
- **Agent:** Claude Code (fix agent, lead-dispatched)
- **Branch / worktree:** `claude/chart-render-handoffs` · `.scratch/worktrees/chart-handoffs`,
  based on `origin/main` `f8c0273`
- **Input:** the nine named handoffs in `plans/audits/2026-08-19-dasha-transit-fix.md`
  (F5, F10, F11, F12, F13, F17 and the render halves of F4, F6, F7, F16), plus **F13
  from `plans/audits/2026-08-18-bugbash-prashna-kp.md`** — a wording defect on this
  screen that the Prashna lane could not touch because the file was not theirs.
- **Every "before" block below is literal pre-fix output** from `.scratch/handoffs/repro.cjs`
  (gitignored, inside the worktree), which renders the **real `ChartScreen`** with a real
  `computeKundli` result. Every "after" block is literal post-fix output of the same script.
  Nothing here is paraphrased.

## Pre-flight

`plans/task-log.md` has no `ACTIVE` or `RESERVED` row covering `src/screens/ChartScreen.tsx`
or `src/components/DashaTree.tsx`. The most recent row that owned them,
`CLAUDE-CHARTSCREEN-MATCHING-REMAINDER-2026-08-19`, is **MERGED**. Status for this lane is
therefore **Unassigned**, worked under the lead's explicit dispatch; this lane was told not to
edit `plans/task-log.md`, so the integrator owns adding the row.

## What this pass was really about

Not "nine small copy fixes". Every one of these had already been *found*, *diagnosed* and
*written down* — with file, line and the exact change — and every one of them survived a full
green gate run anyway. They survived because the thing that was supposed to catch them, the
committed `chart.en` / `chart.hi` baselines, is a **composed mirror**: `snapshot-results.cjs`
re-assembles a handful of values out of `computeKundli` with the display helpers and compares
that to a text file. A mirror can only ever show the lines somebody remembered to mirror, and
nobody had mirrored a dasha date, an ayanamsa footnote, a marriage row or a graha colour.

Proof, not assertion: **the `chart.*` baselines did not move by a single byte during this
change.** `screen-snapshots` still reports `60 baselines match` before and after. Ten
reader-visible defects were fixed underneath a green mirror.

So the deliverable here is the same shape as the dasha lane's: fix the list, and close the
hole. The gate section added yesterday — § 6, which renders the real `ChartScreen` — is
extended by eight new sections (§ 6g–6n) that assert on what a reader actually sees, with no
baseline, so they cannot be re-blessed by regenerating a file.

---

## Closed

### F5 + F12 — P1/P2 · every date on the Vimshottari surface was English-only, and the deep rows had no year

**Before** (Mumbai, 15 Jun 1990 08:30, Hindi)
```
स्वामी आरम्भ अंत वर्ष
राहु   15 Jun 1990  23 Dec 1994  4.5
गुरु   23 Dec 1994  23 Dec 2010  16.0
शनि · वर्तमान 23 Dec 2010 23 Dec 2029 19.0
वर्तमान प्राण: शनि · 12 Aug, 3:26 PM – 16 Aug, 6:20 PM
```
Two defects in one helper, `fmtDateT(ms, tz, withTime)`:

- its locale was **hardcoded `en-IN` in both languages**, so a Hindi reader's own dasha table
  printed `15 Jun 1990` — a few inches above a marriage card on the same screen printing
  `जून 2026`, because that one already asked for the reader's locale;
- its with-time branch **dropped the year**, so the prana row read `12 Aug, 3:26 PM –
  16 Aug, 6:20 PM`. A sookshma or prana list straddling 31 December reads as running backwards.

**After**
```
स्वामी आरम्भ अंत वर्ष
राहु   15 जून 1990   23 दिस॰ 1994  4.5
गुरु   23 दिस॰ 1994  23 दिस॰ 2010  16.0
शनि · वर्तमान 23 दिस॰ 2010 23 दिस॰ 2029 19.0
वर्तमान प्राण: शनि · 12 अग॰ 2026, 3:26 PM – 16 अग॰ 2026, 6:20 PM
अंतर्दशा  शनि 23 दिस॰ 2010 – 26 दिस॰ 2013 · बुध 26 दिस॰ 2013 – 4 सित॰ 2016
```

**How, and what was deliberately not done.** `src/components/format.ts` is not this lane's
file, so `fmtDateT` did not get the `lang` parameter the handoff's first option describes.
Its second option was taken instead: `fmtDateZone(ms, tz, lang, zone, withYear)` is already
exported, already language-aware, already carries the `withYear` flag, and is already what
`DailyScreen` and `MatchingScreen` use. Two helpers, `dashaDate` and `dashaMoment`, live in
`src/components/DashaTree.tsx` and are imported by `ChartScreen` — one direction only, because
`ChartScreen` imports `DashaTree` and the reverse would be a cycle. **The maha table and the
tree therefore cannot format the same fact two different ways, which is exactly why the dasha
lane refused to patch `DashaTree` on its own.**

The year now prints at every level, not only where it changed. A dasha spans years by its
nature and there is no "today" for its dates to be read relative to, so the year is never the
redundant noise it would be on a panchang clock.

**Declared behaviour change, English.** Routing through `fmtDateZone` moves English from
`15 Jun 1990` (`en-IN`) to `Jun 15, 1990` (`en-US`). That is not cosmetic drift: the marriage
card immediately below on the same screen, `MatchingScreen` and `DailyScreen` all already print
`en-US`, so the screen previously carried **two English date styles**. It now carries one.
Flagging it rather than burying it — if the owner wants `en-IN` app-wide, that is a
`format.ts` decision affecting five screens, not a dasha one.

The Hindi clock stays `3:26 PM` in Latin. That is the owner-approved shared 12-hour Panchang
convention (`panchangTime`), not a leak.

### F4b — P1 · a chart with nothing running rendered a bare table and no explanation

**Before** (a chart cast for a 2075 birth — the input range accepts 1800–2150)
```
Vimshottari dasha · maha to prana
LordFromToYears
RahuJun 15, 2075Mar 28, 20815.8
… nine rows …
MarsMar 29, 2176Mar 30, 21837.0
Marriage — supportive timing          <- the very next thing on the screen
```
No current highlight, no "% elapsed" bar, no five-level strip, no antardasha tree — the whole
drill-down is gated on `r.current`, so it all disappeared at once, **in silence**. AGENTS.md:
*"Errors must surface visibly in the UI. Silent failure is unacceptable."* The engine had
already worked out the reason and worded it in both languages; nothing rendered it.

**After**
```
MarsMar 29, 2176Mar 30, 21837.0
This birth date is in the future, so no Vimshottari period is running yet.
The table below starts at birth.

यह जन्म-तिथि भविष्य में है, इसलिए अभी कोई विंशोत्तरी दशा नहीं चल रही।
नीचे की तालिका जन्म से आरम्भ होती है।
```

Two more pieces of the same handoff:

- **repeat cycles are labelled.** A birth before roughly 1910 outruns one 120-year Vimshottari
  round, so the engine repeats it. Nine more lords in the same order with no marker is a table
  a practitioner cannot read. Rows now carry `· cycle 2` / `· चक्र 2` from the engine's own
  `cycle` field. An 1869 birth renders 18 rows and the second nine now say so.
- **the sub-periods that elapsed before birth are counted on screen.** `"Antardashas — tap any
  period to drill down · 3 sub-periods elapsed before birth"`. The engine clips them and counts
  them; printing six rows where the reader expects nine, with no marker, was the visible half
  of bug-bash F2.

### F10 + F11 — P2 · the card whose dates move with the ayanamsa chip named no convention, and printed prana to the minute

**Before** — the dasha card ended after the antardasha tree. No footnote of any kind, on the
one surface whose boundaries shift by **18.5 days** when the reader taps a different ayanamsa
chip a screen above, and which prints prana boundaries **to the minute**.

**After** — one bilingual footnote, closing both handoffs, because they are one fact:
```
Convention — Vimshottari over a 365.25-day year; the first lord comes from the Moon's
nakshatra at birth and its balance from how much of that nakshatra had already passed;
every sub-period is its own lord's years ÷ 120 of the period above it. Positions use the
ayanamsa selected above (Lahiri (Chitrapaksha)) with mean Rahu/Ketu. Every boundary here
is fixed by the Moon's longitude at the birth instant, so switching ayanamsa — or a birth
time uncertain by one minute — moves these dates by days. Read the clock on the deeper
levels as a place in the sequence, not as an appointment.
```
and the Hindi twin, which names the same ayanamsa label the dosha panel above it already
prints. On a Raman chart the footnote says `Raman (B.V. Raman)`.

**The one-minute claim is measured, not asserted.** `validation/vimshottari-dasha.cjs` § 7
perturbs the birth time by one minute across 39 sampled births and reports the shift:

```
birth-time sensitivity: 1 minute moves the first mahadasha boundary by 1.5-5.3 days
                        across 39 sampled births
```

A sentence like that in a footnote is exactly the kind of thing a later agent trims as
flannel. It is now a gated number instead. The handoff suggested propagating
`drik-reference-anchors.cjs`'s `LUNAR_TOL = 6`; that constant is declared for **moonrise and
moonset**, not for the Moon's longitude, so borrowing it would have put a number on a
religious surface that does not mean what it appears to mean. Measuring the real quantity was
cheaper and true.

### F7b — P1 · the marriage row printed a start that was not the start of the period it named

**Before** (Mumbai, 15 Jun 2011 — a chart young enough for the age floor to bite)
```
Jun 2029 – Oct 2029
Ketu / Saturn dasha
```
The row is *labelled* with an antardasha, but the dates beside it were the part of that
antardasha left after the marriageable-age floor was applied. So this card said Jun 2029 while
the dasha tree on the same screen said Aug 2028 for one named period, and nothing said a trim
had happened.

**After**
```
Jun 2029 – Oct 2029
Ketu / Saturn dasha — the antardasha itself begins Aug 2028; the part before age 18
                     is not offered here.

जून 2029 – अक्टू॰ 2029
केतु / शनि दशा — यह अंतरदशा वस्तुतः अग॰ 2028 से चलती है; 18 वर्ष की आयु से पहले
                का भाग यहाँ नहीं दिया गया।
```

**The product half of this was deliberately not taken.** The offered window is still the
trimmed one. Setting `start` back to the period's real start would remove the contradiction by
putting a marriage window at age 17 on a religious-content surface — the dasha lane said that
is a product call, and it still is. What changed is that the row admits the difference and
names the real span, out of `w.periodStart` / `w.trimmedToAge` / `w.ageFloorYears`, which the
engine already hands it.

### F17 — P2 · the Ruling Planets strip lost all graha colour, in Hindi and only in Hindi

**Before** (colours pulled out of the rendered HTML for the strip region)
```
en  #4E6E96 #9A7000 #6E5C82 #46588F #6E5C82 #B3537F #B3537F   (7 lords, 7 colours)
hi  (none)                                                     (0)
```
`PLANET_COLOR` is keyed in English. The seven call sites passed `planetName(lang, …)` in, so
in Hindi every lookup was `PLANET_COLOR["राहु"]` — `undefined` — and the colour coding that is
the entire point of the strip vanished. The significator chips two cards below already did it
the right way round, which is why only this one strip was affected.

**After**
```
en  #4E6E96 #9A7000 #6E5C82 #46588F #6E5C82 #B3537F #B3537F
hi  #4E6E96 #9A7000 #6E5C82 #46588F #6E5C82 #B3537F #B3537F   (identical)
```
`RPItem` is given the canonical English lord and localises inside itself, next to the colour
lookup. **Rendered text cannot see this defect at all** — the words were already correct —
so § 6k asserts on the HTML.

### Prashna F13 — P2 · the summary explained the winner by a number it did not rank on

**Before**
```
The strongest Ruling Planet at this birth moment is Rahu — it appears through 2 sources.
In KP, repeated ruling planets are read as higher-priority witnesses for timing and
judgement; treat this as a priority signal, not a promise.

Support ranking · how often each planet appears
  #1 Rahu   Asc sub-lord · Moon star lord
  #2 Venus  Asc star lord · Moon sub-lord
```
`computeRulingPlanets` ranks by **weight** (sign lord 3, star and sub lord 2, day lord 1); the
sentence, and the heading under it, explained the order by **count**. Those are different
orderings, and the chip row directly beneath showed the difference. `validation/vimshottari-dasha.cjs`
§ 8 now measures how often: **5 of 552 sampled charts rank a graha above one that appears more
often.** Ganak's weighting is defensible — it simply was not what the screen said.

**After**
```
The strongest Ruling Planet at this birth moment is Rahu, with a combined weight of 4
(Asc sub-lord 2 + Moon star lord 2). Ganak ranks by that weight, not by how many times a
graha appears: a sign lord counts most, a star or sub-lord less, the day lord least — so a
graha named more often in the list below can still rank lower. Treat this as a priority
signal, not a promise.

Support ranking · by weight, strongest first
  #1 Rahu   weight 4 · Asc sub-lord · Moon star lord
  #2 Venus  weight 3 · Asc star lord · Moon sub-lord

इस जन्म-क्षण में सबसे समर्थ शासक ग्रह राहु है — कुल भार 4 (लग्न उप-स्वामी 2 + चन्द्र नक्षत्र
स्वामी 2)। गणक क्रम इसी भार से बनाता है, इस गिनती से नहीं कि ग्रह कितनी बार आया …
```

The weights in the sentence are **read back off the engine's own `sources` array**, never
retyped, so the prose cannot drift from the arithmetic that produced the ranking. The prose
*claims* about the ordering ("sign lord counts most … day lord least") are pinned by § 8, which
fails if the engine's weights are reordered. The English branch also stopped interpolating the
raw lord and now goes through `planetName` like every other graha on the screen.

### Found while fixing F17 — the gate that forbade the leak is what caused it

Fixing F17 turned `validation/language-leak-scan.cjs` § 1f **red**, and the reason turned out
to be the most useful finding of the pass.

```
AssertionError: A KP/dasha lord reaches the screen in the engine's own language:
  src/screens/ChartScreen.tsx:836 — lord rendered unlocalised: {RP.ascSignLord}
  … all seven Ruling Planets call sites …
Wrap it: planetName(lang, x.subLord)
```

`<RPItem pl={RP.ascSignLord} />` is not a leak. `RPItem` localises the value *and* uses the
English key to look the graha colour up in `PLANET_COLOR`. The scan's own comment, eight lines
above the rule that fired, already blesses exactly this shape:

> *"Anchored to text position on purpose: `pl={pl}` and `key={pl}` pass the value on to
> something that localises it, and flagging those would teach agents to silence the gate rather
> than to fix the leak."*

That anchoring was applied to the bare-identifier rule and **never to the dotted-path rule
beside it.** So the gate flagged the prop, and whoever met it did the one thing that silences
the gate: `pl={planetName(lang, RP.ascSignLord)}`. The words stayed right, `PLANET_COLOR["राहु"]`
became `undefined`, and the strip lost its colour in Hindi for months. **The gate wrote the
bug, exactly as its own comment predicted it would.**

`RAW_LORD` now ignores attribute position, matching `BARE_LORD`. Mutation-proved still strict:

```
MUTANT  {planetName(lang, sl.starLord)} -> {sl.starLord}   (JSX text position)
  AssertionError: src/screens/ChartScreen.tsx:770 — lord rendered unlocalised: {sl.starLord}
```

**The half that is given up — a prop handed to a component that does *not* localise — is
re-established on rendered output, which is stronger.** § 6n asserts that the whole rendered
Hindi `ChartScreen`, on all four panels, carries no Latin graha, rashi or nakshatra name. It
found two raw sites within a minute of being written, **neither of which the source scan had
ever matched at all**, because neither `item.pl` nor `p.name` is a lord-shaped path:

```
Before (Hindi kundli)
  Yogi Point       कर्क 20°02′  H1  · Mercury
  Avayogi Point    मकर 26°42′   H7  · Mars
  राशि कुंडली से भाव बदला: Moon H8→H9 , Mars H9→H10 , Jupiter H12→H1 , Venus H10→H11

After
  Yogi Point       कर्क 20°02′  H1  · बुध
  Avayogi Point    मकर 26°42′   H7  · मंगल
  राशि कुंडली से भाव बदला: चन्द्र H8→H9 , मंगल H9→H10 , गुरु H12→H1 , शुक्र H10→H11
```
Both were fixed. Fail-then-pass: reverting just those two lines turns § 6n red on `kundli`,
`dashas`, `matching` and `vault` with the exact strings above.

The general lesson, worth more than the two lines: **a source-shape gate cannot tell "reaches
the reader" from "is passed to something that handles it", and when it guesses wrong it does
not merely annoy — it dictates a fix. Pair every source-shape rule with a rendered-output
assertion, and let the rendered one carry the guarantee.**

---

## NOT closed — needs sourcing, not drafting

### F13 (dasha) — P2 · nine English mahadasha significations, one generic Hindi sentence for all nine

**Current, unchanged**
```
EN  The native runs Saturn mahadasha — a period classically associated with
    discipline, karma's audit, slow rewards through endurance.
    (…and eight more, one per lord, all different — DASHA_NOTE, ChartScreen.tsx:44-54)

HI  अभी शनि महादशा चल रही है—यह अवधि उस ग्रह के कारकत्व, स्थिति और स्वामित्व वाले
    भावों को प्रमुख बनाती है।
    (…the SAME sentence for all nine lords)
```
A Hindi reader is given a thinner product on a religious surface — the identical defect the
BNN/Bhrigu lane fixed on 2026-08-18.

**Why this lane did not close it.** Religious accuracy is a standing human gate on this
project, and this lane's brief was explicit: if closing it means composing devotional or
doctrinal content rather than rendering something Ganak already computes and states, leave it
flagged. Writing nine Hindi sentences about what a mahadasha *does to a life* is composing
doctrinal content, even when it starts from an English original.

**What a source would need to supply**, so the next pass does not re-derive this:

1. **Nine Hindi entries of equal weight**, one per Vimshottari lord (Ketu, Venus, Sun, Moon,
   Mars, Rahu, Jupiter, Saturn, Mercury), each naming that graha's dasha-phala the way the
   English entry does — not general karakatwa, which is a different claim.
2. **A named, dated, attributed source** for the significations, English side included. The
   English `DASHA_NOTE` entries are themselves unattributed; sourcing the Hindi without
   sourcing the English would leave the two halves resting on different ground.
3. **The caveat the marriage card already carries three lines later** — "this is not a
   prediction … consult a qualified jyotishi" — repeated on the dasha sentence, in both
   languages.

**Two ready-made routes for whoever holds the gate:**

- **Follow the 2026-08-18 precedent.** `src/data/bhrigu-copy-hi.ts` exists for exactly this
  defect and states its own rule in its header: *"Every entry here is a translation of the
  English Ganak already states — nothing is newly invented."* It lives in `src/data` because
  that is where `validation/hindi-devotional-language.cjs` looks, and its key parity is gated.
  A `DASHA_NOTE_HI` beside it, with the same key-parity assertion, is a two-file change once
  the copy is approved.
- **Or reuse what is already sourced.** `BNN_KARAKA_HI` in that same file already gives each
  graha's karakatwa in Hindi (`Saturn: कर्म, आजीविका, अनुशासन, आयु`), already shipped and
  already gated. It is *not* the same claim as the English `DASHA_NOTE` — karakatwa is what a
  graha signifies, dasha-phala is what its period brings — so using it would need a decision
  that English and Hindi may say adjacent rather than identical things on this card. That is a
  content call, which is why this lane did not make it.

**What was done instead:** `screen-snapshots.cjs` § 6m guards the *English* side against
quietly decaying to match the Hindi one — all nine lords must have an entry, and no two may
share a signification. It cannot make the Hindi side whole; it can stop the gap being closed
from the wrong end.

---

## Out of this lane's file scope — restated so the next lane does not re-diagnose them

These were named in the dasha lane's handoff table and live in files this lane was explicitly
told not to touch. Each is repeated here with its exact change.

| # | Sev | What is still wrong | Where | Exact change |
|---|-----|---------------------|-------|--------------|
| F5 (rest) | P2 | `fmtDateT` still has no `lang` parameter, so the two remaining callers still print `en-IN` in both languages | `src/components/format.ts:95`; callers `src/screens/RectifyScreen.tsx`, `src/screens/JyotishBnnScreen.tsx:163` | Either give `fmtDateT` a `lang` parameter and thread it from both call sites, or switch both to `fmtDateZone(ms, tz, lang, undefined, withYear)` as `ChartScreen`/`DashaTree` now do. The Vimshottari surface is consistent; the rectifier sweep and the BNN ingress column are not. |
| F6b | P1 | The Hindi gloss and Hindi countdown exist on the result object and the call sites do not ask for them | `src/screens/DailyScreen.tsx:358` `eventDetail(e2, Date.now())`, `:395` `fmtDur(...)`, and the literal `"ongoing"` | Pass `lang` as the third argument to `eventDetail` and second to `fmtDur`, and replace the literal with `ongoingLabel(lang)`. Both languages are already on the result object (`descEn`/`descHi`/`timeStrEn`/`timeStrHi`) if that is easier. |
| F16b | P1 | The countdown is measured from `Date.now()` while the events were generated from the **selected** date, so a Panchang date in the past counts down from today | `src/screens/DailyScreen.tsx:358` | Pass the same reference instant the events were generated from instead of `Date.now()`. |
| F7 (product half) | P1 | Whether a marriage window may be *offered* from before age 18 is still an open product call | `src/engine/marriage-timing.ts` + `ChartScreen.tsx` | The row now names the real span, so nothing on screen contradicts anything. Changing what is **offered** is the owner's call, not an agent's. |

---

## Judgement calls made, recorded rather than parked

1. **English dates moved from `en-IN` to `en-US`** on the dasha table and prana row (F5 above).
   Taken deliberately, to end the two-styles-on-one-screen split; reversible in one helper.
2. **The dasha dates stay anchored to the fixed birth-moment UTC offset**, not to the place's
   IANA zone. `fmtDateZone` accepts a zone and this lane passed `undefined`, keeping the
   pre-existing behaviour: a dasha table spans a century, and re-reading each boundary in the
   DST rule current *at that boundary* would silently re-date rows for reasons that have
   nothing to do with the chart. Flagged, not hidden.
3. **F7b renders the trim, it does not remove it** (F7b above).
4. **F11's tolerance is measured, not borrowed** from `LUNAR_TOL` (F10+F11 above).
5. **No new computed-but-unrendered fields.** Everything added to the screen renders; nothing
   was added to an engine. The two Prashna-F13 locals (`rpWeightOf`, `rpSourceText`) exist
   only to feed the sentence they are declared next to.

---

## Gates

`bash scripts/run-all-gates.sh` — summary pasted in the branch report and the task-log row.
`npm run build` clean.

New assertions, all in files this lane owns:

**`validation/screen-snapshots.cjs` § 6g–6n** — extends yesterday's real-`ChartScreen` section
rather than the composed mirror, and carries **no baseline**, so these are invariants that
cannot be re-blessed by regenerating a file.

- **6g** F5/F12 — no date line on the Hindi dasha card may use an English month; the prana row
  must carry a four-digit year at both ends, in both languages.
- **6h** F4b — a chart with no running period must print the reason and must not print a
  running one; a repeat 120-year round must be labelled (checked against an 1869 birth, and the
  gate fails loudly if that fixture ever stops producing a repeat cycle).
- **6i** F10/F11 — the card must name the ayanamsa it was cast on (checked on Lahiri *and*
  Raman, both languages), the 365.25-day year, and the one-minute caveat.
- **6j** F7b — a window trimmed to the age floor must admit the trim (checked against a 2011
  birth, and the gate fails loudly if that fixture stops producing a trimmed window).
- **6k** F17 — the graha colours in the Ruling Planets strip must be byte-identical between
  English and Hindi. Asserted on the HTML, because rendered text cannot see a colour.
- **6l** Prashna F13 — the summary must not explain the winner by source count, must state the
  weight that ranked it, and the ranking card must not be headed by an ordering it does not use.
- **6m** F13 (dasha) — the English `DASHA_NOTE` must keep all nine lords with nine distinct
  significations.
- **6n** the rendered half of `language-leak-scan` § 1f — no Latin graha, rashi or nakshatra
  name anywhere on the Hindi chart screen, on any of the four panels.

**`validation/language-leak-scan.cjs` § 1f** — `RAW_LORD` no longer fires in attribute
position, which is the rule `BARE_LORD` beside it already stated. See the F17 section above:
that inconsistency is what caused F17, and § 6n carries the guarantee instead.

**`validation/vimshottari-dasha.cjs` § 7–8** — § 7 measures the one-minute birth-time
sensitivity the new footnote claims; § 8 pins the ruling-planet weight ordering the new
sentence describes, and proves the count ordering really does differ on real charts.

### Fail-then-pass

Pre-fix source, current gates (`git checkout -- src/`, gates unchanged):
```
FAIL chart.hi: the dasha card prints 18 date line(s) in an English locale:
    राहु15 Jun 199023 Dec 19944.5
FAIL chart.en: a prana row must carry the year at both ends …
    Current prana: Saturn · 12 Aug, 3:26 PM – 16 Aug, 6:20 PM
FAIL chart.en: the dasha card renders a bare table and no explanation when no period is running.
FAIL chart.hi: the dasha card renders a bare table and no explanation when no period is running.
FAIL chart.en: rows from the second 120-year round are indistinguishable from the first.
FAIL chart.en: on a Lahiri (Chitrapaksha) chart the dasha card never names the ayanamsa …
FAIL chart.en: the dasha card must state the Vimshottari year length it uses.
FAIL chart.en: the card prints prana boundaries to the minute and must say what that precision is worth.
FAIL chart.hi: on a Raman (B.V. Raman) chart the dasha card never names the ayanamsa …
FAIL chart.en: a window trimmed to the age floor … never admits the trim.
FAIL chart.hi: a window trimmed to the age floor … never admits the trim.
FAIL chart.hi: the Ruling Planets strip loses its graha colour coding in Hindi (en 7 colours, hi 0).
FAIL chart.en: the summary still explains the winner by how many sources it appears in …
    The strongest Ruling Planet at this birth moment is Rahu — it appears through 2 sources. …
FAIL chart.hi: the summary still explains the winner by how many sources it appears in …
    इस जन्म-क्षण में सबसे समर्थ शासक ग्रह राहु है — यह 2 संकेतों में आया है। …
FAIL chart.en: the summary must state the weight (4) that actually put Rahu first.
FAIL chart.en: the ranking card is headed by an ordering it does not use.
   (27 assertions red in total across both languages)
```
Post-fix, same gates:
```
✓ cast chart rendered for real: 15 panel visibility checks across 5 panels (nothing unmounts)
  · ?panel= restores the open panel · birth panchang, Papa references, dosha ayanamsa and the
  marriage search range all read in both languages
✓ Vimshottari surface: dates localised and year-stamped at every level · no running period is
  explained, not left blank · repeat cycles labelled · ayanamsa, 365.25-day year and the
  one-minute caveat stated · trimmed marriage windows admit the trim · graha colours survive
  Hindi · ruling-planet summary explains the ranking it actually uses
```

Mutation proof for the two new dasha-gate sections (mutations applied to the engine, measured,
then reverted — `git status src/engine/` clean afterwards):
```
MUTANT  day lord weight 1 -> 9
  AssertionError: the screen says the day lord counts least — the engine must agree
MUTANT  balance quantised to 1/400 of a nakshatra
  AssertionError: 1948-01-30: balance of dasha — expected first maha to end 1948-11-17,
                  got 1948-11-15         (caught by the published Drik anchor first — the
                                          right ordering, so § 7 could not be isolated by
                                          an engine mutation)
MUTANT  § 7's own perturbation removed (mi + 1 -> mi)
  AssertionError: one minute of birth time must move a mahadasha boundary by more than a
                  day for the card's caveat to be true; smallest observed shift was 0.00 days
```
The last one is the honest proof that § 7 is not vacuously true.

### What did NOT move

```
✓ screen-snapshots: 60 baselines match
```
Identical before and after. Ten reader-visible defects were fixed and the committed
`chart.*` baselines did not change by one byte — **do not use them to prove anything about
what a reader sees.** No baseline was regenerated in this pass.

---

## What a reader used to see on the chart screen, and what they see now

- A **Hindi** reader's own dasha table printed its dates in English — `15 Jun 1990` — while the
  marriage card a few inches below printed `जून 2026`. One screen, two languages of date. It
  now reads `15 जून 1990` throughout.
- The deepest rows printed **no year**, so a sub-period list crossing New Year looked as though
  it ran backwards. Every row now carries its year.
- A chart cast for a **future birth date** showed nine rows and then simply stopped — no
  current period, no progress bar, no drill-down, **and no message**. It now says, in the
  reader's own language, that the birth is in the future and the table starts at birth.
- Someone born **before about 1910** got eighteen rows in which the second nine looked exactly
  like the first, with nothing saying the 120-year wheel had come round again. The second round
  now says so.
- The antardasha list quietly showed six periods where the tradition has nine. It now says how
  many elapsed before the native was born.
- The one card whose dates **move by days when you tap a different ayanamsa** said nothing at
  all about which ayanamsa, which year length, or which convention it used — and printed times
  to the minute on top of that. It now states all of it, and says plainly that a minute of
  birth-time uncertainty moves those dates by days.
- The **marriage** card printed a start date that was not the start of the period it named, and
  disagreed with the dasha tree on the same screen about one named period. The row now names
  the period's real start and says why the offered window begins later.
- In **Hindi**, the Ruling Planets strip lost every graha colour — the colour coding is what the
  strip is for. It is now identical in both languages.
- The ruling-planet summary told the reader that a graha ranked first because it *appeared
  more often*, directly above a list showing a different graha appearing more often. It now
  explains the ranking Ganak actually uses.
- On a **Hindi** kundli, the Yogi and Avayogi tiles named their graha in English — `· Mercury`,
  `· Mars` — and the line saying which planets change house between the rasi and bhava-chalit
  charts named all of them in English. Both now read in Devanagari. Neither was on the handoff
  list; a new check on the rendered screen found them.
- **Still owed:** the nine per-graha Hindi mahadasha meanings. A Hindi reader still gets one
  generic sentence where an English reader gets nine distinct ones. That is a sourcing decision
  and a human gate, not something this pass would invent.
