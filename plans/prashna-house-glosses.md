# Prashna — question-specific house glosses (Q1c)

Source map for `HOUSE_MEANING_BY_Q` in `src/screens/PrashnaScreen.tsx`.
Shipped 2026-07-22. **Wording only — no calculation changed** (parity gate stayed
EXACT at 198/6 through the change, which proves it).

---

## The problem

A house does not mean one fixed thing. Its role depends on what was asked. The app
printed one generic label regardless, which produced sentences that are correct
astrology but read as a bug:

> your 6th house — **obstacles, illness & debt** — **a supportive signal**

A lay reader sees "illness" and "supportive" together and concludes the app is
broken. It isn't: for a job question the 6th house is **service and employment**,
which is genuinely supportive. The maths was right; the words were wrong.

---

## What was changed

Only houses whose generic label **actively contradicts** their role in that question.
Everything else still falls through to the generic `HOUSE_MEANING`. Keeping the
override surface small keeps the invention risk small.

| Question | House | Was (generic) | Now | Basis |
|---|---|---|---|---|
| Job / career | 6 | obstacles, illness & debt | **service & employment** | 6th = service/job, daily work; in KP horary the 2/6/10/11 group answers employment, with the 6th carrying "service" |
| New venture | 6 | obstacles, illness & debt | **service & competition** | Same 6th significations, plus competition — the venture rule set mirrors career (`favor:[2,6,10,11]`) |
| Money / gains | 6 | obstacles, illness & debt | **earnings from work** | 6th governs earnings from one's job or services provided to others |
| Dispute / court case | 6 | obstacles, illness & debt | **your side & victory over opponents** | 6th = enemies, litigation; legal outcome turns on which side has stronger 6th and 11th support |
| Travel / abroad | 12 | loss, expense & distance | **foreign lands & new surroundings** | 12th governs foreign settlement and life abroad, not only loss; for travel the 3/9/12 group is read, the 12th indicating new environments and foreign land |

Hindi equivalents ship alongside: सेवा और नौकरी · सेवा और प्रतिस्पर्धा · कार्य से आय ·
आपका पक्ष और विरोधी पर विजय · विदेश और नया परिवेश.

### Deliberately unchanged

**Health / recovery keeps the generic 6th-house gloss** ("obstacles, illness & debt"
/ "बाधा, रोग और ऋण"). For a health question the 6th genuinely is the house of
disease, and there it appears in the *deny* list. Verified in the browser that the
career wording does not leak into it.

---

## ⚠️ Deliberately incomplete — for KSK verification

Two gaps remain. Both are known, neither is a regression, and both should be closed
by `P0-PRASHNA-249-KSK-VERIFY` rather than by guesswork.

**1. The deny side has the mirror problem.** Observed live during this work, on a
travel question:

> It also touches your 11th house — **gains & fulfilment** — **which works against
> this matter.**

"Gains works against you" reads exactly as oddly as "illness supports you". The KP
logic is sound — the 11th is the 12th from the 12th, so it undercuts a journey — but
the wording needs the same question-specific treatment. The same applies to *career*
denying on the 9th ("fortune & grace… works against this matter"), where the 9th is
the 12th from the 10th.

This is a bigger job than the favor side because it rests on the "12th from" rule
rather than on plain significations, so it wants primary-text backing.

**2. Unsourced favor cells left generic.** `lost` has house 6 in its favor list and
I could not find a clean source for what the 6th means for a lost-object question, so
it still prints the generic label. Better a slightly odd sentence than an invented
signification in religious content.

---

## Verification performed

- **Litigation** (cusp 6, deterministic): lead line reads *"sub-lord of your 6th
  house, the house of your side & victory over opponents"* ✓
- **Travel** (cusp 12, deterministic): *"the house of foreign lands & new
  surroundings"* ✓
- **Career/6** (moment-dependent, so proved in Node): engine confirmed to produce a
  6-in-favor career judgement at 2026-07-21T00:14Z; table maps it to *"service &
  employment"* ✓
- **Health** (must NOT change): still *"बाधा, रोग और ऋण"*, no leakage ✓
- Gates: parse-check clean; **parity EXACT 198/6**; prashna-calc 24/24;
  muhurat-anchors; content-dates; build. 0 console errors, both languages.

## Sources

- KP career/employment house significations — kpastroapp.com house guide;
  rahasyavedicastrology.com KP job prediction; ivaindia.com KP career predictions
- 6th house in litigation and victory — kundlistar.com KP court case and legal
  victory
- 12th house, foreign travel and settlement — jagannathhora.com 12th cusp sub-lord;
  astroyantra.com foreign travel horary; astrochart.in KP house significations

Per the project's religious-accuracy rule these are secondary sources; the primary
-text pass is `P0-PRASHNA-249-KSK-VERIFY`.
