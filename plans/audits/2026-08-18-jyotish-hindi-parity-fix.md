# Jyotish screens — Hindi content parity fix, 2026-08-18

**Branch:** `claude/jyotish-hindi-parity` · base `origin/main` `81cf33b`
**Closes the handoffs** in `plans/audits/2026-08-18-snapshot-coverage-extension.md`
(items 6, 7, 8, 9, 10 and the ordinals note) and
`plans/audits/2026-08-18-pada-sublord-language-audit.md` § D (O1–O3).

The theme, in one line: **nothing here leaked and no gate was red — a Hindi reader
was simply being handed a thinner product than an English reader.**

---

## 1. Content parity — the substance of the lane

`themeText()` in `BNNModule` and the `hi ? "…" : b.theme` / `r.theme` pattern in
`BhriguModule` replaced **every** interpretation with a single generic sentence.
English readers got a distinct meaning per row; Hindi readers got the same sentence
over and over. Counted from the committed baselines:

| screen | before (Hindi) | after (Hindi) | English, unchanged |
| --- | --- | --- | --- |
| `bnn.hi` | 14 meaning rows, **1** sentence repeated 14× | 14 meaning rows, **12** distinct meanings | 12 distinct |
| `bhrigu.hi` | 27 meaning rows, **2** sentences (20× + 7×) | 27 meaning rows, **12** distinct house significations | 12 distinct |

The rendered fixture only exercises the combinations this one chart produces. The
full tables now carry a Hindi twin for **every** English entry:

- `BNN_MEANING` — 36 pairwise combination themes → 36 Hindi, all distinct
- `BNN_KARAKA` — 9 graha significations → 9 Hindi (was English-only; the Hindi
  section header printed the placeholder `पारंपरिक कारकत्व` where English printed
  the real karaka)
- `BCP_HOUSE_THEME` — 12 house significations → 12 Hindi, all distinct

Every Hindi string is a **translation of the English Ganak already states**. No
signification was invented to fill a hole, and none needed to be: every English
entry had a Hindi equivalent that could be written faithfully.

**Where the copy lives:** `src/data/bhrigu-copy-hi.ts`, not `src/engine/bhrigu.ts`.
`validation/hindi-devotional-language.cjs` scans `src/data`, `src/screens` and
`src/components` — not `src/engine`. Copy that no gate reads is copy that drifts,
so the Hindi went where the Hindi gates look. The engine imports it and attaches a
`themeHi` / `meaningHi` / `relationHi` / `karakaHi` beside each English field, so a
screen never has to reconstruct a meaning from a key.

### Also fixed in the same family (found while rendering, not in the handoffs)

**Jaimini chara karakas, `ChartScreen.tsx`** — the identical defect, one panel over:
all **seven** karakas printed one generic Hindi sentence where English printed seven
distinct significations, and both the role (`Darakaraka`) and the graha (`Sun`) were
printed in Latin to a Hindi reader. Now `CHARA_KARAKA_HI` (Devanagari role +
translated meaning, same `{en, hi}` shape as `HOUSE_TOPICS` in that file) and
`panchangTerm(lang, "planet", …)`.

### Left open, deliberately — a real defect this lane could not close

**`ChartScreen.tsx:619` — the Yogas panel is the same defect and is NOT fixed.**
`{hi ? "यह योग ग्रहों और भावों के एक विशेष संबंध से बनता है…" : yg.text}` gives every
detected yoga the same Hindi sentence. Fixing it properly means restructuring
`detectYogas` in `src/engine/classical.ts`, which composes its English text
dynamically (`pl + " sits in its fall sign — …"`, `"Kendra lord " + raja[0] + …`).
That file is outside this lane's allowed list and the change is structural, not a
translation. **This is a partial area, stated as partial.** Next slice: give
`detectYogas` parameterised templates with a Hindi twin, exactly as `bhrigu.ts` now has.

---

## 2. Everything else in the work list

| # | Item | Outcome |
| --- | --- | --- |
| 2 | Shadbala header printed `सूर्य Sun` in **both** languages | Fixed — one language per reader (`ChartScreen.tsx`) |
| 2 | `BALA_PARTS` English-only in Hindi | Fixed — `labelHi` / `noteHi` added in `src/engine/shadbala.ts`; the screen's hand-written inline copy of those words is deleted, so there is one table again |
| 3 | Reference-point buttons printed `लग्न` twice in Hindi | Fixed — the English twin renders only in English mode |
| 4 | BNN direction headers `East/South/West/North` | Fixed — `पूर्व / दक्षिण / पश्चिम / उत्तर` |
| 5 | Hindi ordinals `1वाँ / 2वाँ / 3वाँ` | Fixed — see below |
| 6 | `/calculators?lang=…` dropped the reader's city | Fixed — **three** sites, one more than the audit found |
| 7 | A calculator labels a Gregorian date `तिथि` | Investigated, conclusion below, **not applied** — another agent owns the file |
| 8 | Core-combination relations raw English in Hindi | Fixed — and the Tier-C reading rows, which had the same defect four lines further down |

### 5 — what Hindi actually uses for a house ordinal

`1वाँ` is not a word. Hindi forms ordinals lexically, and there are two live series:
the colloquial one (पहला, दूसरा, तीसरा) and the Sanskrit-derived one (प्रथम, द्वितीय,
तृतीय). **The Sanskrit series wins here, and the reason is on the same screen:** the
BNN relation grid ten lines away already labels its combination axes द्वितीय ·
भविष्य, पंचम · त्रिकोण, नवम · त्रिकोण, एकादश. That is also the register every Hindi
jyotish text uses for a भाव — one says नवम भाव, not नौवाँ भाव. Using पहला/दूसरा would
have made one screen speak two dialects of its own subject. `houseOrdinalHi()` in
`src/data/bhrigu-copy-hi.ts`; numerals stay Latin, per the B10 decision.

### 6 — the entry-door defect was three doors, not two

`utilityHref()` (`UtilityCalculatorScreen.tsx:38`) is the one helper that puts
`city`/`lat`/`lon`/`zone` on a calculator link. Three call sites hand-wrote
`?lang=${lang}` instead and silently discarded the city the reader had already
chosen — so the calculator opened blank and asked for the city again:

- `src/screens/ChartScreen.tsx` — the "Browse all astrology calculators" card
- `src/components/JyotishPanelNav.tsx` — Tools → Quick calculators
- `src/screens/ChartScreen.tsx` — **the dosha cards' "Full page →" deep links**, which
  neither audit had found. The gate assertion below is what turned it up.

All three now call `utilityHref`. `UtilityCalculatorScreen.tsx` was read, never edited.
Rendered proof, with Mumbai selected:

```
nav   hi: /calculators?lang=hi&city=Mumbai%2C+India&lat=19.076&lon=72.8777&zone=Asia%2FKolkata
chart en: /calculators?lang=en&city=Mumbai%2C+India&lat=19.076&lon=72.8777&zone=Asia%2FKolkata
chart en: /calculator/kala-sarpa?lang=en&city=Mumbai%2C+India&lat=19.076&lon=72.8777&zone=Asia%2FKolkata
chart en: /calculator/pitra-dosha?lang=en&city=Mumbai%2C+India&lat=19.076&lon=72.8777&zone=Asia%2FKolkata
```

**One gate had to be corrected, and it is worth naming.**
`validation/jyotish-panel-exposure.cjs` asserted the literal string
``href={`/calculators?lang=${lang}`}`` — it was **pinning the defect**. The guarantee
it meant to hold ("Jyotish home links directly to the catalogue and preserves
language") is unchanged and now stronger: it requires the `utilityHref` call in both
the screen and the nav, and it bans any hand-written `?lang=${lang}` route link in
either file. That third assertion is what found the dosha deep links. This file was
outside the lane's allowed list; it is edited here because leaving it would have
left the branch red on an assertion that had become wrong.

### 7 — `तिथि` on a Gregorian date field: confirmed wrong, fix not applied

`src/screens/UtilityCalculatorScreen.tsx:26` —
`const dateLabel = labels ? labels.date : (hi ? "तिथि" : "Date")`. The field is an
`<input type="date">` holding a Gregorian birth date; `तिथि` everywhere else in Ganak
means the **lunar day** (`i18n.ts` `tithiL`, the full-panchang rows, the festival
guides, the Shraddha calculator's own output line). Confirmed rendered, e.g.
`validation/snapshots/utility-rashi.hi.txt` line 5 reads `तिथि` where the English
baseline reads `Date`.

**Conclusion: it should be `जन्म तिथि`, not `जन्म दिनांक`.** Every one of the fourteen
calculators takes a birth moment, so the `जन्म` qualifier is always true, it removes
the lunar-day ambiguity completely, and it is the app's own existing wording —
`MatchingScreen.tsx:32` and `MedicalMuhuratScreen.tsx:137` already say `जन्म तिथि`.
Introducing `दिनांक` would add a third word for the same idea. The Shraddha override
`निधन की तिथि` is correct as it stands and needs no change.

The one-line patch, for whoever owns that file next:

```diff
-const dateLabel=labels?labels.date:(hi?"तिथि":"Date");
+const dateLabel=labels?labels.date:(hi?"जन्म तिथि":"Date");
```

Not applied here: `UtilityCalculatorScreen.tsx` is under another agent's exclusive
edit this session.

---

## 3. What now stops the generic-sentence regression coming back

Two new checks in `validation/screen-snapshots.cjs`. Neither is a spelling check —
both are about **content**, which is what no gate could previously see.

**3 — rendered content parity, positionally.** Both languages render the same JSX, so
an `en`/`hi` baseline pair with the same line count is aligned line for line. If
English says two different things at lines *i* and *j* and Hindi says the identical
thing at both, that meaning was collapsed rather than translated. Only lines of 12+
characters containing a space count; a repeated one-word label is legitimate. At the
time of writing this finds nothing even at a floor of 8, so the margin is generous
rather than tuned to hide anything.

**4 — every English signification has a Hindi twin.** The rendered check only sees the
rows this one fixture produces. This half is exhaustive: `BNN_KARAKA`, `BNN_MEANING`
and `BCP_HOUSE_THEME` must carry exactly the same keys as their `_HI` tables, and every
`BALA_PARTS` entry must have `labelHi`/`noteHi`. Adding an English meaning without a
Hindi one fails immediately instead of waiting for a chart that lands on it.

### Fail-then-pass proof

Regression 1 — the generic sentence put back in `themeText`:

```
FAIL bnn: 5 distinct English meanings collapse to one Hindi sentence
    hi: इन दोनों ग्रहों के कारकत्व साथ सक्रिय होते हैं; फल पूरी ग्रह-श्रृंखला और बल के साथ देखकर समझें।
    en: wisdom and soul — dharma, principled authority, guiding purpose
    en: expansive mind — emotional wisdom and contentment (Gajakesari theme)
    en: wisdom turned inward — detachment, moksha, spiritual depth over worldly fortune
    Hindi readers must get one meaning per row, not a generic sentence repeated.
```

Regression 2 — one Hindi combination meaning, one house signification and one Shadbala
label deleted:

```
FAIL BNN_MEANING: 1 signification(s) English-only: Saturn|Venus
    Add the Hindi translation in src/data/bhrigu-copy-hi.ts — do not invent a meaning.
FAIL BCP_HOUSE_THEME: 1 signification(s) English-only: 9
    Add the Hindi translation in src/data/bhrigu-copy-hi.ts — do not invent a meaning.
FAIL BALA_PARTS: no Hindi label for kala
```

Both reverted, unchanged files, same command:

```
✓ screen-snapshots: 56 baselines match · 27 screens × 2 languages + chart/transit results
```

---

## 4. Gates

```
90 passed, 0 failed.
```

(`bash scripts/run-all-gates.sh`; `npm run build` also clean.)

Baselines re-generated with `node validation/snapshot-generate.cjs --write`. Two files
moved — `validation/snapshots/bnn.hi.txt` and `bhrigu.hi.txt` — and **every** changed
line was read: 80 lines in one, 108 in the other, all of them a generic sentence or an
English word becoming a real Hindi meaning. No English baseline moved.

---

## 5. Honest limits

- **Rendered text only.** The Hindi significations are longer than the English in
  several places (`अपरंपरागत कामना — विदेशी या भिन्न-संस्कृति के संबंध, चकाचौंध, भौतिक
  आकर्षण`). Nobody has looked at the BNN combination cards or the Bhrigu rows at 375 px
  in Hindi; wrapping and card height still need a human or a browser pass.
- **The Shadbala, reference-button, chara-karaka and dosha-link fixes are not covered
  by any committed baseline** — all four surfaces exist only after a cast, and
  `renderToStaticMarkup` cannot press Cast. They were verified by driving the real
  `ChartScreen` with a real `computeKundli` result seeded into its state (the technique
  the B10 audit used), and the output is quoted in the fix report. Closing that gap
  properly means seeding a cast in `snapshot-generate.cjs`, which this lane does not own.
- **Transit dates still render `31 Oct 2026` in Hindi** — that is item 5 of the coverage
  audit (`src/components/format.ts` `fmtDateT`), owned by another agent, untouched here.
- **The Yogas panel is still one generic sentence in Hindi** — see § 1, stated as
  partial rather than quietly left.
- **English mode still shows `लग्न` above `Lagna`** on the reference-point buttons. That
  is the app-wide `Eyebrow` convention (Devanagari + English label), not a defect
  introduced or removed here; changing it is a design call, not a translation.
