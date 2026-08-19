# Yogas panel — Hindi content parity, 2026-08-18

**Branch:** `claude/yogas-hindi-parity` · base `origin/main` `cc3113d`
**Closes** the one item today's `claude/jyotish-hindi-parity` lane stated as partial:
`plans/audits/2026-08-18-jyotish-hindi-parity-fix.md` § 1, *"Left open, deliberately —
a real defect this lane could not close"*, and § 5, *"The Yogas panel is still one
generic sentence in Hindi."*

Same theme as that lane, one panel over: **nothing leaked, no gate was red, and a Hindi
reader was still being handed a thinner product than an English reader.**

---

## 1. What the reader saw — measured, before and after

`ChartScreen.tsx:651` read:

```jsx
{hi ? "यह योग ग्रहों और भावों के एक विशेष संबंध से बनता है। इसका फल ग्रहबल, दशा और
       पूरी कुंडली के संदर्भ में देखें।" : yg.text}
```

Every yoga in the chart — Gaja Kesari, Kala Sarpa, a debilitated graha, a Raja Yoga —
carried that identical sentence. It is fluent, respectful Hindi and it says nothing
about the yoga it sits under. The English reader got a distinct interpretation each
time. The yoga **name** was worse: it rendered unbranched, so a Hindi reader read
`Yogakaraka Mars` and `Sasa Mahapurusha` in Latin script.

Counted by running the real `detectYogas` over 400,000 synthetic charts (deterministic
PRNG, `.scratch/measure-yogas.cjs`) plus the pinned snapshot fixture:

| | distinct English interpretations | distinct Hindi interpretations |
| --- | --- | --- |
| whole engine (33 yoga families reachable) | **79** | **1** |
| the pinned fixture chart (Mumbai, 1990-06-15 08:30) | **6** | **1** |

After:

| | distinct English interpretations | distinct Hindi interpretations |
| --- | --- | --- |
| whole engine | **79** | **79** |
| the pinned fixture chart | **6** | **6** |
| the catalogue, exercised exhaustively by the gate | **110** | **110** |

(The gate's 110 is larger than 79 because it instantiates every template over every
parameter set the detection rules *can* hand it, including combinations no random
sweep happened to land on. 79 is what the engine actually produced in the sweep.)

**English did not move.** Proved rather than asserted: the old inline `detectYogas` was
loaded from `git show HEAD:` alongside the new one and both were run over the same
400,000 charts —

```
old English (kind,name,text) triples: 79
new English (kind,name,text) triples: 79
lost: 0   added: 0
```

## 2. The restructure — why a lookup bolted on top would not have done

The English text was **composed at the detection site**:

```js
add("Raja Yoga", "good", "Kendra lord " + raja[0] + " conjunct trikona lord " + raja[1] + " — power and fortune combine.");
add(pl + " debilitated", "hard", pl + " sits in its fall sign — its significations ask for conscious cultivation.");
```

There was no key to look a translation up by, and the graha and house number were
already baked into an English sentence by the time anything downstream saw it. So the
yoga engine now emits a **key plus its parameters**, and each yoga's copy is a
parameterised template that exists in both languages:

- `src/engine/classical.ts` — `YOGA_EN`, 25 templates, `{ name(params), text(params) }`.
  Every English string is byte-identical to the inline sentence it replaces.
- `src/data/yoga-copy-hi.ts` (new) — `YOGA_HI`, the same 25 keys, the same shape.
- `makeYoga(key, kind, params)` builds one yoga carrying `name`, `text`, `nameHi`,
  `textHi`, plus its `key` and `params`. The screen only chooses which language to
  print; it can no longer *have* a language for which there is nothing to print.

This is the pattern today's Bhrigu/BNN lane established (`themeHi` / `meaningHi` beside
the English, Hindi copy in `src/data` where the Hindi gates look) — one approach in the
app, not two. Hindi copy lives in `src/data` for the same stated reason: only
`src/data`, `src/screens` and `src/components` are scanned by
`validation/hindi-devotional-language.cjs`, and copy no gate reads is copy that drifts.

**Graha names in the Hindi copy come from `planetName("hi", …)`** — the single shared
vocabulary in `src/i18n/panchang-terms.ts` — never a hand-written Devanagari spelling.
House ordinals reuse `houseOrdinalHi()` from `src/data/bhrigu-copy-hi.ts`, so the yogas
panel says षष्ठ / दशम / द्वादश exactly as the Bhrigu panel does. The gate below fails on
any Latin character inside Hindi yoga copy, which is what holds that line.

## 3. Translated, never invented

All 25 yogas carry real Hindi. **None is flagged, because none needed to be:** every
yoga already had a specific English interpretation in the engine, so every Hindi line is
a rendering of something Ganak already says. Nothing was composed to fill a hole.

Yoga *names* are transliterated, not translated — गजकेसरी, शश महापुरुष, केमद्रुम,
काल सर्प — which is the same treatment `SIGN_HI` gives a rashi name. The two
name-parts that are English words rather than Sanskrit, `"Neecha Bhanga · Sun"` and
`"Sun debilitated"`, become नीचभंग · सूर्य and सूर्य नीच: the shastra terms the English
is itself naming.

### One honest limitation in the English, recorded not silently translated

Three yogas describe a node as *"a node"* rather than naming Rahu or Ketu, even though
the engine knows which one it found — `Guru Chandala`, `Angarak`, `Grahan` (and `Grahan`
says *"a luminary"* without saying which). The Hindi mirrors that imprecision faithfully
(`राहु या केतु से युति`) rather than quietly resolving it, because resolving it would be
writing a signification the English never made. **If that should be sharpened, it is an
English copy change first and a Hindi one second** — a follow-up, not part of a
translation lane.

## 4. The gate — and a hole in § 4 that this lane found and closed

The yogas panel had **no baseline anywhere**. `chart.en.txt` / `chart.hi.txt` are the
post-cast mirror in `snapshot-results.cjs`, and the yogas were simply not in it, which
is exactly why the defect survived months of green runs.

**(a) The panel is now in the mirror.** `snapshot-results.cjs` prints each detected
yoga as ChartScreen prints it, in the reader's own language.

**(b) § 4's positional check had a real hole, measured not guessed.** The first version
of the mirror wrote `name — text` on one line. With the generic sentence reinstated,
§ 4 **passed** — because the differing yoga name at the front of each line made every
line unique, so it never saw six identical Hindi meanings. Name and text are now on
separate lines, and § 4 catches it. Any future surface added to a baseline as
`label — value` on one line has the same blind spot; that is worth knowing.

**(c) New § 5 — the yoga catalogue, exhaustively** (`validation/screen-snapshots.cjs`).
The rendered check only ever sees the six yogas this one fixture produces, so a missing
Hindi meaning could sit for years in a yoga no baseline lands on. § 5 instantiates all
25 templates over all 110 parameter sets the detection rules can produce and asserts:

- `YOGA_EN` and `YOGA_HI` carry exactly the same keys — both directions, so a Hindi
  meaning with no English original fails too;
- every key has a parameter set (a yoga cannot go unchecked by omission);
- every Hindi string is non-empty and Devanagari, with **no Latin script at all**;
- **two different English interpretations may never map to one Hindi interpretation** —
  the collapse check, which is what a generic sentence is.

### Fail-then-pass proof

Regression 1 — the pre-fix generic sentence put back in `YOGA_HI`:

```
FAIL chart.hi: rendered text changed
FAIL chart: 6 distinct English meanings collapse to one Hindi sentence
    hi: यह योग ग्रहों और भावों के एक विशेष संबंध से बनता है। इसका फल ग्रहबल, दशा और पूरी कुंडली के संदर्भ मे
    en: Saturn in its own or exaltation sign in a kendra — one of the five marks of an exceptional person.
    en: Lord of the 6th placed in a dusthana — gains rising out of adversity.
    en: Mars lords both a kendra and a trikona — a single planet able to confer rank.
    Hindi readers must get one meaning per row, not a generic sentence repeated.
FAIL yoga text: 110 distinct English yoga texts collapse to one Hindi text
    hi: यह योग ग्रहों और भावों के एक विशेष संबंध से बनता है। इसका फल ग्रहबल, दशा और पूरी कुंडली के संदर्भ में देखें।
    en: Jupiter in a kendra from the Moon — dignity, wisdom and a reputation that endures.
    en: Sun and Mercury together — sharp intellect and administrative skill.
    en: Moon with Mars — earning power, drive and resourcefulness.
    A Hindi reader must get one meaning per yoga, not a generic sentence repeated.

✗ screen-snapshots FAILED (3)
```

Regression 2 — one yoga's Hindi deleted, and one graha spelled by hand in Latin:

```
FAIL YOGA_HI: 1 yoga(s) English-only: saraswati
    Add the Hindi translation in src/data/yoga-copy-hi.ts — translate what Ganak already says, do not invent a signification.
FAIL yoga copy: Latin script inside Hindi yoga copy: angarak text: "Mars की राहु या केतु से युति — विस्फोटक ऊर्जा, जिसे अनुशासित मार्ग चाहिए।"
    Graha names come from planetName(lang, …) in src/i18n/panchang-terms.ts, never a hand-written spelling.

✗ screen-snapshots FAILED (2)
```

Both reverted, unchanged files, same command:

```
✓ screen-snapshots: 56 baselines match · 27 screens × 2 languages + chart/transit results
✓ calculator cross-seeding: 728 mismatched-result renders identical to no result (0 crashes, 0 foreign answers) · 28 own-result renders still answer
✓ yoga content parity: 25 yoga templates × 110 parameter sets · 110 distinct English interpretations → 110 distinct Hindi (no collapse)
```

## 5. Baselines

`node validation/snapshot-generate.cjs --write` moved two files, `chart.en.txt` and
`chart.hi.txt`, **26 added lines in total and every one was read**. No existing line
changed in either file; the yogas block is purely new. The English lines are word for
word what the English screen was already printing; each Hindi line is the translation of
the English line above it.

```
+--- classical yogas ---
+yoga: Sasa Mahapurusha (good)
+Saturn in its own or exaltation sign in a kendra — one of the five marks of an exceptional person.
+yoga: Harsha Vipareeta Raja (good)
+Lord of the 6th placed in a dusthana — gains rising out of adversity.
…
+--- classical yogas ---
+yoga: शश महापुरुष (good)
+शनि अपनी ही राशि या उच्च राशि में, केंद्र में — पंच महापुरुष लक्षणों में से एक।
+yoga: हर्ष विपरीत राजयोग (good)
+षष्ठ भाव का स्वामी दुःस्थान में — प्रतिकूलता में से उठता लाभ।
…
```

## 6. What the reader actually sees, from the real screen

The baseline mirror renders engine values. The one-line JSX change is in `ChartScreen`
itself, so it was proved separately by driving the **real** `ChartScreen` with a real
`computeKundli` result seeded into its state — the technique the B10 audit used, since
`renderToStaticMarkup` cannot press Cast. Both languages, same fixture chart:

```
######## ChartScreen, lang=en ########      ######## ChartScreen, lang=hi ########
Yogas detected · 6                          योग
Sasa Mahapurusha                            शश महापुरुष
auspicious                                  शुभ
Saturn in its own or exaltation sign        शनि अपनी ही राशि या उच्च राशि में, केंद्र में —
 in a kendra — one of the five marks         पंच महापुरुष लक्षणों में से एक।
 of an exceptional person.
Harsha Vipareeta Raja                       हर्ष विपरीत राजयोग
auspicious                                  शुभ
Lord of the 6th placed in a dusthana —      षष्ठ भाव का स्वामी दुःस्थान में —
 gains rising out of adversity.              प्रतिकूलता में से उठता लाभ।
Yogakaraka Mars                             योगकारक मंगल
Durudhara                                   दुरुधरा
Vasi                                        वासि
Amala                                       अमल
```

Six yogas, six different meanings, in the reader's own script — where a Hindi reader
previously got `Sasa Mahapurusha` in Latin followed by the same sentence six times.

## 7. Files

Changed: `src/engine/classical.ts`, `src/screens/ChartScreen.tsx`,
`validation/screen-snapshots.cjs`, `validation/snapshot-results.cjs`,
`validation/snapshots/chart.{en,hi}.txt`. New: `src/data/yoga-copy-hi.ts`.

**`src/engine/kundli.ts` was NOT touched** — the lead corrected the brief mid-lane
because a concurrent lane owns it for the `AYAN_MODE` fix. No change was needed there:
the whole yoga engine is in `classical.ts`, and `kundli.ts` only calls
`detectYogas(rows, ascSign)` and stores the array. The yoga objects gained fields
(`key`, `params`, `nameHi`, `textHi`); nothing `kundli.ts` reads was removed or renamed.
**No handoff is outstanding.**

`validation/snapshot-results.cjs` was outside the lane's listed files and is edited here
deliberately: it is the half of the snapshot gate that renders post-cast surfaces, and
without it the yogas panel cannot appear in any baseline at all, which was the whole
defect. No open reservation covers it — the lane that owned it (`CLAUDE-SNAPSHOT-COVERAGE-0818`)
is merged.

## 8. Honest limits

- **Rendered text only.** Several Hindi yoga sentences are longer than their English
  twins. Nobody has looked at the yoga cards at 375 px in Hindi; wrapping and card
  height still need a human or a browser pass. The panel is a
  `minmax(240px, 1fr)` auto-fit grid, so the risk is card height, not overflow.
- **Six of 33 yoga families are covered by a rendered baseline** — the ones the pinned
  fixture produces. The other 27 are covered by § 5's exhaustive catalogue check, which
  proves content parity but not layout.
- **The panel heading was already clean** — checked, not assumed: `Eyebrow` prints
  `Yogas detected · 6` in English and the bare `योग` in Hindi, one language per reader.
  Nothing to fix there.
- **The "a node" / "a luminary" imprecision in three English yoga texts** — see § 3.
  Recorded, not silently improved.
