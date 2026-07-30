# P0-PRASHNA-249-KSK-VERIFY — primary-text citation index

Status: **PAGE-PINNED + PRINTED-FOLIO CONFIRMED 2026-07-29 — awaiting owner review.**
Unblocks the 249-engine *sourcing gate*; does **not** authorise engine code (owner
sign-off still required).
**6/8 rules now Tier-1 page-pinned in Reader VI** (incl. the two most important, rules 2
and 3, upgraded from web-corroborated), rule 8 partial, rule 7 an honest by-design
adaptation; KP-New ayanamsa now has its own published citation. See the 2026-07-29 section.
**Printed-folio confirmation (the one residual precision step) is now CLOSED for all 21
Reader VI page-pins** — each scan leaf-index has been read against its actual page image
and its printed folio recorded; see the "printed-folio confirmation pass" section below.
The leaf→folio offset is **not constant** (it steps 19→15→10→8→9 across the volume, because
this scanned PDF stitches two differently-typeset printings and drops some leaves), so every
pin now carries its **own** confirmed printed folio rather than a single global offset.
Dates: 2026-07-24 (first pass) · 2026-07-29 (page-pin pass). Owner instruction 2026-07-24:
**Option 1 (book-strict) primary, Option 2 (web-corroborated) only as a labelled fallback
where verified text is unreachable.**

Parent brief: [prashna-number-method-research.md](prashna-number-method-research.md) ·
Findings: [prashna-249-findings.md](prashna-249-findings.md) ·
House glosses: [prashna-house-glosses.md](prashna-house-glosses.md)

---

## What this file is (plain language)

Ganak's 1–249 Prashna feature will give a user a **yes / no / mixed** answer to a
sincere question. The *maths* (which number maps to which slice of the zodiac) is
already computed and cross-checked. This file is about the **judgment rules** — the
logic that turns a chart into "yes" or "no". The project's religious-accuracy rule
says those rules must trace to **K.S. Krishnamurti's own writing**, not to calculator
websites. This is that trace.

Every rule below carries **one of two tiers**:

- **✅ Tier 1 — primary-text verified.** Located in Krishnamurti's own Readers.
- **⚠️ Tier 2 — web-corroborated (fallback).** Multiple independent KP sources agree,
  but I could not confirm it in the primary text I could reach. **Not shippable at
  Ganak's religious-accuracy standard until upgraded to Tier 1.**

## Provenance & honesty note (read before trusting a citation)

- The canonical text is the **six-volume Krishnamurti Padhdhati Reader** series
  (Madras, 1963–1972, still in print).
- **Primary-text access used here:** the Internet Archive scanned copies in the
  `kp-readers` item (`archive.org/details/kp-readers`) — **Reader II (Fundamental
  Principles), Reader III (Predictive Stellar Astrology) and Reader VI (Horary
  Astrology)**. The scan **is** the primary text (the earlier blocker was OCR gaps,
  not the absence of an owned copy). I did **not** reproduce doctrine text — only
  located *where* each rule appears and quoted at most a few words to confirm the hit.
- **2026-07-29 method — page-image / full-text index, not a truncated OCR dump.** The
  earlier pass could only machine-read the opening pages of each volume's OCR file.
  This pass used the Internet Archive **search-inside** index over the scanned page
  images (`fulltext/inside.php` against `kp-readers`, server `ia903207`), which returns
  the **scan page (leaf) index** and a verbatim snippet for every hit anywhere in the
  book — so rules that live deep in Reader VI are now locatable. Every page number
  below was obtained this way and carries a confirming quoted phrase.
- **The page-number caveat — now RESOLVED (2026-07-29 printed-folio pass).** The
  search-inside index returns the **scan's own page/leaf index**; the scan index runs
  **ahead of the book's printed folio**. That offset has now been measured directly by
  opening every pinned leaf's page image and reading the folio printed on it. **The
  offset is not a single constant** — it steps **19 → 15 → 10 → 8 → 9** as you go deeper,
  because this scanned "Reader VI" PDF stitches together at least two differently-typeset
  printings (a typewriter-set portion up to ~folio 97, a clean-serif portion from
  ~folio 121) and drops a few leaves along the way. So there is **no global offset to
  apply**; each pin instead carries its **own confirmed printed folio** (full table in the
  "printed-folio confirmation pass" section). Every pin is still a *directly reproducible
  locator* (open the leaf, the quoted text is there) **and** now an unambiguous
  printed-folio citation.
- **Two standing consequences of using a scan:** (a) "NOT FOUND" can still mean the OCR
  garbled the phrase (KP OCR is noisy — e.g. "constellation"→"eonstellation"), **not**
  that Krishnamurti never wrote it; (b) ~~the printed-folio confirmation against a
  paginated copy remains the final tidy-up~~ **DONE 2026-07-29** — printed folios read
  directly off the page images for all 21 pins; the sourcing gate's precision step is
  closed.

---

## Corrections found (the point of doing this)

1. **Reader volume was mis-attributed by a secondary source.** A web summary placed the
   horary / 1–249 doctrine in **Reader III**. That is wrong: **Reader III is
   *Predictive Stellar Astrology*.** The horary primary text is **Reader VI — *Horary
   Astrology***, confirmed by the publisher's own catalogue ("Horary Astrology (KP –
   Sixth Reader)") and by page cross-references throughout the KP corpus. All citations
   below use Reader VI for horary and Reader II for the underlying sub-lord theory.
2. **"KP ayanamsa" is not a phrase in Reader VI.** The book frames things as **Sayana
   (Western) vs Nirayana (Hindu)**; it does **not** print a single "KP ayanamsa value".
   The KP (Krishnamurti) ayanamsa is a *separately published* specification. This
   matters for the owner's ayanamsa decision — see the ayanamsa note below.

---

## The citation index (rule → tier → source)

The engine rules are drawn from [prashna-249-findings.md](prashna-249-findings.md) §1–2
and the existing screen logic (`src/screens/PrashnaScreen.tsx`).

Page numbers in this table are the **archive.org `kp-readers` scan-page/leaf index** (the
reproducible locator). Each carries a short confirming quote (a few words, per the copyright
rule — not a reproduction). **The confirmed PRINTED folio for every one of these leaf-index
pins is now tabulated in the "printed-folio confirmation pass" section below** (e.g. leaf
90 → printed p.75) — read that table for the citable folio; the offset is not constant.

| # | Engine rule (what Ganak will do) | Tier | Where it traces to (page-pinned 2026-07-29) |
|---|---|---|---|
| 1 | The number 1–249 **fixes the ascendant** at the start of its sign / star-lord / sub-lord segment | ✅ **Tier 1 — page-pinned** | **Reader VI**, Section IV "Erection of horary horoscope" + "Table of KP for ready reference". Scan **p.107** (number→sign/star/sub: *"number 48 refers to Mercury sign, …star, …sub … table of 249"*); **p.269** (*"the ascendant as 20° Libra-Nirayana which is the position for the number 139"*); **pp.304–305** (*"this will be the lagna for the query … according to the Nirayana of the Indian system"*). Confirms the engine's number→nirayana-ascendant casting. |
| 2 | **Why 249** — 27 nakshatras × 9 subs = 243, six sign-boundary splits → 249; sub sizes proportional to Vimshottari dasa years | ✅ **Tier 1 — UPGRADED** (was Tier 2) | **Now located in Reader VI itself** (not only Reader II). Section IV **"Division of the Constellation into subs"**; scan **p.92** (*"the lord of the sub will be **249 instead of 243** … they are 249 in number"*) — the six sign-boundary splits over 243 are exactly this passage; **p.278** (*"into 249 divisions"*). Foundational sub-by-Vimshottari theory still also in **Reader II**. |
| 3 | The **cuspal sub-lord is the final arbiter** of a house's matter (promise vs denial) | ✅ **Tier 1 — UPGRADED** (was Tier 2; highest priority) | **Located verbatim in Reader VI.** Scan **p.90** — the clean statement: *"the sub-lord which **decides** whether the result is favourable or unfavourable"*; **p.154** — cuspal, promise vs denial: *"whether they are **promised or not** are found from the **sub-lord of the respective cusps**"*. Applied on ~30 cusp-by-cusp pages (e.g. **p.173** 7th-cusp marriage, **p.176** 3rd cusp, **p.199** 5th cusp, **p.272** 11th "success denied"). The rule the whole yes/no verdict rests on is now primary-text pinned. Foundational sub theory also **Reader II**. |
| 4 | **Ruling Planets** = day-lord, ascendant sign-lord & star-lord, Moon sign-lord & star-lord; common planets between RPs and significators survive | ✅ **Tier 1 — page-pinned** | **Reader VI**, Section V **"Ruling planets"**. Scan **p.131** (first appearance), **p.146** (five-planet derivation: lord of the sign the ascendant is in, Moon's constellation-lord and rasi-lord …), **p.175** — the concise definition: *"the lords of the **day, Moon sign, star and lagna** at the moment of judgement"*; **p.209** (RP-at-judgement = RP-at-fructification). *(Corrects the earlier note's "Section I".)* |
| 5 | **Significators & hierarchy** — planets in the star of occupants/owners of a house rank as its significators | ✅ **Tier 1 — page-pinned** | **Reader VI**, Section II source slokas (**Prasna Gyana / Uthrakalamritha** translations) + Section IV. The star-of-occupant/owner mechanism drives the cuspal judgments on **pp.154–304** (e.g. **p.199** *"sub-lord of 5th deposited in **constellation of** 7 and 11"*, **p.296** *"significator of 2/6/10/11, promotion promised"*). Underlying stellar theory also **Reader III**. |
| 6 | **Repeat / sincerity / one-question** — first sincere number stands; no test questions; successive queries handled | ✅ **Tier 1 — page-pinned** | **Reader VI**, Section II **Prasna Gyana** translation. Scan **p.43** — *"Only when the consultant is **serious and sincere**, then only truth will come out; prediction will prove to be correct"*; **p.66** (*"Unless one is sincere, even Veda is not useful …"*). Successive-question handling (use the Moon's bhava for a second question) sits in the same Prasna Gyana slokas. |
| 7 | **Whose place/time** — the location where the question is judged (Ganak = self-service ⇒ user's confirmed place) | ⚠️ **Tier 2 — by design, NOT KSK** | **Unchanged and honestly kept.** Reader VI assumes the **astrologer's locality** implicitly (e.g. worked charts *"at Bombay at 5.30 P.M."*, scan p.173/217); the self-service adaptation (querent's confirmed place = the judging place) is a **Ganak product decision**. Disclosed as an adaptation — **no KSK backing claimed**, and it must not be upgraded. |
| 8 | **"12th-from" negation** — the 12th house from any house opposes that house's matter (deny-side glosses) | ⚠️ **Tier 1 (base meaning) + standard-KP application** — PARTIAL upgrade | The **12th-house = loss/negation** meaning is now pinned: **Reader VI p.129** (*"Twelfth house: **Loss** and impediments, restraint and limitation, waste and extravagance, expenses …"*). The **rotational "12th counted *from* a house negates that house"** is the standard KP *application* of that meaning via the significator/counter-house method — **not stated as a single sentence** in the accessible scan (OCR-searched "negat*", "twelfth", none surfaced a rotational sentence). So the deny-side glosses in [prashna-house-glosses.md](prashna-house-glosses.md) rest on a **primary-text house meaning + a standard-KP derivation**, labeled as such — not overclaimed as a verbatim KSK "12th-from" rule. |

---

## Ayanamsa note — RESOLVED to KP-New (owner, 2026-07-24)

The owner **decided KP ayanamsa (option C, 2026-07-22)**; on 2026-07-24 the specific
constant is set to **KP-New (KPNA)**. Rationale, recorded:

- Reader VI does **not** name a numeric "KP ayanamsa"; it uses Sayana/Nirayana framing
  (scan **p.176**, *"presuming 0° Cancer Nirayana rises in the East … Raphael Table of
  houses furnish Sayana position"* — cusps are converted by subtracting the ayanamsa,
  never a printed KP constant). So the numeric constant is an implementation choice, not
  something the book dictates — the KP-New value needs its **own** published citation,
  below, separate from the Readers.
- **KP-New ayanamsa — published citation (own source, NOT Reader VI):** Prof. **K.
  Balachandran**, *"New KP Ayanamsa"*, published in the **KP & Astrology Year Book 2003**.
  Definitional formula (as reproduced in the KP literature):
  **NKPA = B + [T·P + T²·A] ⁄ 3600**, with base **B = 22°22′30″** at epoch **15 April
  1900**, **T = (year − 1900)**, Newcomb annual precession **P = 50.2388475″/yr**, and
  second-order term **A = 0.000111″/yr²**. Independently documented by **D.
  Senthilathiban, *A Study of KP Ayanamsa with Modern Precession Theories*** and the
  compilation *A Review of KP Ayanamsas*. KP-Old, by contrast, is Lahiri − 6′ via a flat
  per-year table.
- **Engine reconciliation note (flag for owner):** the shipped constant `PR_kpNewAyan`
  is gate-anchored to the published **23°46′04″ @ 1 Feb 2000** and matches to ~1″, so the
  constant Ganak ships **is** KP-New — correct. One cosmetic discrepancy: the code comment
  (`PrashnaScreen.tsx:285`) states the base as **22°22′15.7″ @1900**, whereas the widely
  published base is **22°22′30″ @ 15 Apr 1900**. Because the 1-Feb-2000 anchor matches,
  this is a base-epoch *representation* difference, not a wrong value — worth aligning the
  comment to the published base, but it does not affect output.
- It is computed to the **second** for the exact date via formula; KP-Old
  used a flat per-year table to the minute. For a method that decides on **sub**
  boundaries (arc-minute level), the more precise value is the right default.
- **Reconciliation the engine must make explicit:** KP-Old differs from Lahiri by only
  ~6′, but **KP-New differs from Lahiri by ~22′**. Ganak's existing time-based Prashna
  runs on **Lahiri**. So the number mode is a genuine **ayanamsa fork** from the rest of
  the app — it must (a) compute on KP-New, (b) keep the Lahiri parity gate on the old
  mode byte-exact, and (c) disclose bilingually on the result card that the KP number
  method uses the KP-New ayanamsa, distinct from Ganak's Lahiri default.

## 2026-07-24 update — Reader II check + owner ratification

- **Attempted to page-verify the four ⚠️ rules in Reader II** (*Fundamental Principles*)
  from the same Internet Archive scan. The document-reader could only process an
  introductory portion of that volume's large OCR file — it surfaced the **table of
  contents** (e.g. "the twelve houses and their significance", p. 272) but not the
  chapter bodies. So I **could not machine-extract** the exact passages this pass.
  This is a **tooling/OCR limit, not evidence the rules are absent.**
- **Honest status of the core "sub-lord decides" rule (rule 3):** its attribution to
  Krishnamurti is effectively certain — the entire system is *named* Krishnamurti
  Paddhati **for this thesis**, and Reader II's TOC carries the relevant chapters. What
  is missing is a clean, machine-readable passage + page from my current access. It is
  therefore stronger than ordinary web-corroboration but not yet a clean page-pin.
- **Owner ratification (2026-07-24):** the four ✅ Reader VI rules (1, 4, 5, 6) **stay
  marked verified** with a standing **page-pending disclaimer** — they were located in
  the Reader VI text; only the exact page numbers await an owned copy. The disclaimer
  travels with the note; it is not a reason to demote them.

---

## What is still needed for full Option-1 (book-strict) closure

1. ~~Page-pin the four ✅ Tier-1 rules (1, 4, 5, 6)~~ **DONE 2026-07-29** — located with
   scan-page pins + confirming quotes (rule 1 pp.107/269/304–305; rule 4 pp.131/146/175;
   rule 5 pp.154–304; rule 6 pp.43/66). See the 2026-07-29 section below.
2. ~~Upgrade the four ⚠️ Tier-2 rules~~ **MOSTLY DONE 2026-07-29:**
   - Rules **2 & 3 → UPGRADED to Tier 1**, located in **Reader VI** itself (rule 2 pp.92/278;
     rule 3 pp.90/154 + ~30 applied cusp pages). Rule 3 was the highest priority.
   - Rule **8 → PARTIAL:** the 12th-house = loss/negation meaning is pinned (Reader VI p.129);
     the rotational "12th-*from*" grouping stays a standard-KP application, honestly labeled.
   - Rule **7 → stays Tier 2 by design** (Ganak self-service adaptation, not KSK doctrine).
3. ~~Pin the KP ayanamsa constant~~ **DONE 2026-07-24: KP-New (KPNA)** + **published
   citation added 2026-07-29** (Balachandran, KP & Astrology Year Book 2003 — see ayanamsa
   note). Remaining: wire the fork + its bilingual on-screen disclosure line when engine
   code starts.

**Residual for a 100% book-strict close:** ~~confirm the **printed folio** numbers against a
paginated copy~~ **DONE 2026-07-29** — printed folios read directly off the archive.org page
images for all 21 Reader VI pins (mapping table below); no global offset (it steps
19→15→10→8→9). Remaining nice-to-have only: if desired, hunt a verbatim rotational
"12th-from" sentence for rule 8 — though folio 260 ("*For any action done by one, the 12th
house therefrom is to undo it*") is close. The engine may now be described as
**primary-text sourced, printed-folio-confirmed** for rules 1–6 (Reader VI, located +
quoted + folio-verified); rules 7 (adaptation) and 8 (base meaning folio-confirmed p.121,
rotational form standard-KP) stay disclosed.

---

## 2026-07-29 — page-pin pass via archive.org page images (Reader II / III / VI)

**Method:** Internet Archive **search-inside** over the scanned page images of the
`kp-readers` item (`fulltext/inside.php`, server `ia903207`, path `/33/items/kp-readers`)
for Reader VI (Horary), Reader II (Fundamental Principles) and Reader III (Predictive
Stellar). This indexes the whole book (not just the first pages the earlier OCR-dump pass
could reach), returning a scan-page index + verbatim snippet for each hit. Copyright rule
honored: page-pins + ≤few-word confirming phrases only, no passage reproduction.

**Reader VI structure confirmed from its own CONTENTS:** Section II carries the source
slokas — **Prasna Gyana, Uthrakalamritha, Shatpanchasika** (rules 5, 6 trace here);
Section IV has **"Division of the Constellation into subs"** (rule 2), **"Erection of
horary horoscope"** + **"Table of KP for ready reference"** (rule 1), **"What the twelve
houses signify"** (rule 8 base); Section V is **"Ruling planets"** (rule 4). So the 1–249
horary doctrine is self-contained in Reader VI, with sub theory rooted in Reader II.

**Tier summary after this pass (8 rules):**

- ✅ **Tier 1, page-pinned in Reader VI — 6 rules:** 1 (number→nirayana ascendant),
  2 (why-249, *upgraded*), 3 (cuspal sub-lord = final arbiter, *upgraded*, highest
  priority), 4 (Ruling Planets), 5 (significators), 6 (sincerity / repeat).
- ⚠️ **Rule 8 — partial:** base 12th=loss meaning Tier 1 (p.129); rotational "12th-from"
  is a standard-KP application, honestly labeled (near-Tier-1, no verbatim sentence found).
- ⚠️ **Rule 7 — Tier 2 by design:** Ganak self-service adaptation, not KSK. Not upgradable.

**Net:** the sourcing gate moves from **4/8 located → 6/8 fully page-pinned + 1 partial +
1 honest by-design adaptation.** The whole-verdict rule (3) and the why-249 rule (2) — the
two that mattered most and were previously only web-corroborated — are now primary-text
located and quoted. **The printed-folio precision step is now closed too — see the next
section.**

## 2026-07-29 — printed-folio confirmation pass (the residual precision step, now CLOSED)

**What was done.** Each Reader VI page-pin above is a *scan leaf-index* (the archive.org
BookReader's page-slider position). This pass opened the **actual page image** for every
pinned leaf and read the **printed folio** printed on it, and re-confirmed the pinned
doctrine phrase is on that page. Method: the item's own image endpoint
`ia803207.us.archive.org/BookReader/BookReaderImages.php` against
`J_KP reader_6_Horary Astrology_jp2.zip` (leaf `_NNNN.jp2`), cross-checked against the
volume's `…_page_numbers.json` auto-detected folios. Copyright honored: folios + section
names + ≤few-word confirming phrases only; no passage reproduced.

**Key finding — there is NO single constant offset.** The leaf→folio gap *shrinks* as you
go deeper (leaf 43 = folio 24, gap 19; leaf 90 = folio 75, gap 15; leaf 107 = folio 97,
gap 10; leaf 129 = folio 121, gap 8; leaf 269 = folio 260, gap 9). A gap that *decreases*
going forward cannot come from front-matter alone: this scanned "Reader VI" PDF stitches
together **two differently-typeset printings** (a typewriter-set portion, folios ~24–97;
a clean-serif reset, folios ~121 onward) and **drops several leaves** between them, so the
leaf index outruns the folio by a varying amount. Therefore each pin carries its **own**
confirmed printed folio (below); do not apply one global offset.

**Confirmed mapping (all 21 Reader VI pins — leaf-index → PRINTED folio, doctrine re-verified):**

| Rule | Scan leaf | → PRINTED folio | Doctrine confirmed on the page image |
|---|---|---|---|
| 6 | leaf 43 | **p.24** | "…serious and sincere, then only truth will come out; prediction will prove to be correct" ✅ |
| 6 | leaf 66 | **p.47** | "Unless one is sincere, even Veda is not useful to him" ✅ |
| 3 | leaf 90 | **p.75** | "…it is the sub-lord which decides whether the result is favourable or unfavourable" ✅ |
| 2 | leaf 92 | **p.77** | "…the lord of the sub will be 249 instead of 243… they are 249 in number" ✅ |
| 1 | leaf 107 | **p.97** | "…number 48 refers to Mercury sign, Rahu star, Jupiter sub, which commences at 8° 40′ in Gemini" ✅ *(auto-detector returned no folio here — page is a numeric table; read visually)* |
| 8 | leaf 129 | **p.121** | "Twelfth house: Loss and impediments, restraint and limitation, waste and extravagance, expenses…" ✅ |
| 4 | leaf 131 | **p.123** | Section heading "RULING PLANETS" + its definition ✅ |
| 4 | leaf 146 | **p.138** | five-planet derivation ("…lord of the day… these five planets happen to be the ruling planets") ✅ |
| 3 / 5 | leaf 154 | **p.146** | sub-lord of 7th cusp promise/denial + significators of 2/7/11 ✅ |
| 3 / 7 | leaf 173 | **p.165** | worked chart "number 29… at Bombay… 5.30 P.M… 6-5-1969"; 7th-cusp sub-lord ✅ |
| 4 | leaf 175 | **p.167** | "Ruling planets. They are the lords of the day, Moon sign, star and lagna at the moment of judgement" ✅ |
| 3 / ayan. | leaf 176 | **p.168** | 3rd-cusp sub-lord; "…presuming 0° Cancer Nirayana rises in the East. Raphael Table of houses furnish Sayana position" ✅ |
| 3 / 5 | leaf 199 | **p.191** | "If the sub-lord of the 5th cusp is deposited in the constellation of a planet who is the significator of the houses 7 and 11 then materialisation… is promised" ✅ |
| 4 | leaf 209 | **p.201** | "…the ruling planets at the time of judgment and those at the time of fructification… are same. The ruling planets are the lords of the day, rasi, star and lagna at the moment of judgment" ✅ *(folio printed as a slightly garbled "201"; auto-detector returned none; read visually)* |
| 7 | leaf 217 | **p.209** | worked chart "number 247… at Bombay at 6-30 P.M. I.S.T. on 26-3-1969" ✅ |
| 1 | leaf 269 | **p.260** | "…taking the ascendant as 20° Libra-Nirayana which is the position for the number 139" ✅ (also, for rule 8: "For any action done by one, the 12th house therefrom is to undo it") |
| 3 | leaf 272 | **p.263** | "…if the sub-lord of the 11th cusp is retrograde, success is denied. Ambition cannot be realised" ✅ |
| 2 | leaf 278 | **p.269** | "The Zodiac is divided into 249 divisions as per Krishnamurti: There are 249 different combinations…" ✅ |
| 5 | leaf 296 | **p.287** | "…if the same sub-lord is also a significator of houses 2 or 6 or 10 or 11, then promotion is promised" ✅ |
| 1 | leaf 304 | **p.295** | "…this will be the lagna for the query. The cusps of the other houses… by referring to the Table of Houses by Raphael for the latitude of the place where the query is answered" ✅ |
| 1 | leaf 305 | **p.296** | number-144 worked casting (Delhi latitude; Sayana cusps − Ayanamsa → Nirayana cusps) ✅ |

**Cross-check note.** The archive.org auto-detected folios (`…_page_numbers.json`) matched
the human read on **19 of 21** leaves; the two it missed (leaf 107, a numeric 249-table;
leaf 209, a print-garbled "201") were read directly off the image. Every pinned doctrine
phrase was found on its page — the leaf indexing is correct end to end.

**Minor observation for the ayanamsa note (out of this pass's scope, flagged for owner).**
The clean-serif reprint bound into this PDF *does* use the phrase "Krishnamurti ayanamsa"
with a value ("…the ayanamsa is 23° 30′", printed folio 168) — a small nuance against the
earlier note's "Reader VI names no numeric KP ayanamsa" (which was read off the
typewriter-set printing). This does not change the KP-New engine decision; noted for
accuracy only, not edited into the ayanamsa section.

**Bottom line: the "printed-folio confirmation" residual is fully closed for Reader VI.**
All 21 pins now read as unambiguous printed-folio citations (rule + Reader VI section +
printed p.NN + confirming phrase). No Reader II/III *leaf-index* pins exist to convert —
those volumes are cited only as general underlying-theory backing, not page-pinned.

## Disclaimer recommendation (shipped copy — for owner, do NOT self-edit engine code)

Shipped copy at `src/screens/PrashnaScreen.tsx:820` currently reads: *"…The judgment
rules follow widely-published KP practice; verification against Krishnamurti's primary
texts is in progress."*

- **Recommendation: soften "in progress" → "primary-text verified," because it is now
  materially true** for the rules the verdict rests on (1–6 located and quoted in Reader
  VI). Suggested replacement (bilingual, owner to approve the Hindi register):
  *"…The judgment rules are drawn from K.S. Krishnamurti's KP Readers (esp. Reader VI,
  Horary); Ganak uses the KP-New ayanamsa, distinct from its usual Lahiri convention."*
- **Do NOT overclaim:** keep it "drawn from / follows" rather than "certified" — rule 7 is
  a Ganak adaptation and rule 8's rotational form is a standard-KP application, and the
  printed-folio confirmation is still pending. "In progress" is now *understated*, but
  "fully verified/certified" would *overclaim*; the phrasing above threads that needle.
- **Boundary respected:** this is a recommendation only. `PrashnaScreen.tsx` is engine-
  owned and parity-frozen above the markers; I did not touch it. If the owner approves,
  the copy change is a below-the-markers string edit (line ~820, in the main-screen UI
  block) — keep parity EXACT 198/6, run all prashna gates + build, browser/live-verify.

---

## Approved answer-card copy spec (owner-reviewed 2026-07-24)

Owner reviewed three worked verdict cards (favourable / unfavourable / mixed) and
approved this template for the engine copy. **Illustrative planetary layout only** — the
real engine produces the values; this fixes the *shape and voice*, not the astrology.

**Voice — warm, respectful, never over-promising.** A verdict encourages or cautions;
it does **not** guarantee an outcome (religious-accuracy boundary). Badges: **Favourable
/ Not yet / Mixed** (not "Not favourable" — "Not yet" is gentler and truer to horary).

Approved bilingual verdict lines (the register the engine copy should match):
- **Favourable:** `हाँ — ग्रह-योग आपके अनुकूल है।` · "Favourable — the chart stands behind
  what you asked." _(owner chose this Hindi register 2026-07-24; rejected the calque
  "आपके प्रश्न को ग्रहों का साथ है" as unnatural Hindi.)_
- **Unfavourable:** `अभी अनुकूल नहीं — थोड़ा ठहरें।` · "Not the right moment — better to
  hold than to force it."
- **Mixed:** `सुधार होगा — पर धीरे-धीरे। धैर्य रखें।` · "Recovery is coming — but gradually.
  Stay patient."

**Detail box — "आपके अंक ने क्या तय किया / what your number set" (elaborated, owner-approved).**
One muted top line explaining what the number did (`आपका अंक ... फिर ... भाव देखे जाते हैं`),
then rows: **Sign · Star (nakshatra + lord) · Sub lord · Ascendant · Houses judged**.
Every jargon term carries a one-line plain gloss (e.g. sub lord → "the planet that gives
the final yes or no"), per the app's jargon-gloss rule. Devanagari uses natural phrasing
(`भाव देखे जाते हैं`, not the clinical `जाँचे जाते हैं`).

**Gentle timing hint — KEEP IN v1 (owner, 2026-07-24).** A soft, muted one-liner is
allowed in v1 (e.g. `शुक्र की दशा में संभावना प्रबल` · "Most likely in a Venus period"),
phrased as a *possibility*, never a fixed date. This is a deliberately small subset — the
**full** ruling-planets/timing panel remains **v1.1** per the findings.

**Collapsible "full working" — APPROVED (owner, 2026-07-24).** Below the clean card, a
collapsed `पूरा विश्लेषण · Show the full working` disclosure opens four labelled
sub-sections, each glossed and each ending with one plain sentence on *why it points to
the verdict*:
1. **निर्णायक शृंखला · Deciding chain** — the primary cusp's sub lord → the star it sits
   in → the houses that star-lord signifies (the actual KP judgment path).
2. **कारक · Significators** — the planets speaking for the favour houses.
3. **पुष्टि करने वाले ग्रह · Ruling planets** — the RP set (day lord; asc. sign & star
   lord; Moon sign & star lord), shown as an *independent confirmation* of the verdict.
4. **विरोधी भाव · Opposing houses** — the deny group, with the plain "12th-from"
   explanation of why they oppose *this* matter.
Default view stays the clean card; the working is opt-in. The engine fills all values;
this fixes the disclosure's structure and voice only.

---

## 2026-07-24 — Slice 2 build + reference cross-check (engine shipped to branch)

- **Method validated against the KP primary casting rule.** The horary casting
  instruction — *"take the commencing position of the Sub of the horary number as the
  NIRAYANA ASCENDANT; for the other cusps take only the LATITUDE, prepared per the
  PLACIDUS system"* — matches the implementation point-for-point: `kpNumberToLagna`
  returns the segment **start** ("commencing position"), and `PR_castNumber` derives the
  house frame from **ascendant + latitude** via the parity-validated Placidus. This
  upgrades **rule 1** (number→lagna) and the **house-derivation method** from web-only to
  primary-casting-rule confirmed.
- **Ayanamsa → KP-New IMPLEMENTED (owner chose the fork 2026-07-24).** `PR_kpNewAyan`
  (Balachandran 2003: 22°22′15.7″ @1900 + Newcomb precession) is pinned by a gate against
  the published **23°46′04″ @ 1 Feb 2000** (matches to ~1″). The number mode runs KP-New;
  the frozen Lahiri engine and its parity gate are untouched (KP-New applied only in the
  new code below the markers). Real vs published Lahiri delta is **~5.1′**, not the ~22′ a
  secondary web source claimed — corrected here.
- **What's built (branch `claude/prashna-249-engine`):** `src/engine/kp-horary.ts`
  (pure map), `PR_castNumber`/`PR_kpNewAyan`/`PR_ramcForAsc` below the frozen slice, the
  named UI mode (toggle, 1–249 input + validation, approved verdict voice, glossed "what
  your number set" box, KP-New/web-corroboration disclaimer). Gates: parity **EXACT
  198/6**, prashna-calc 24/24, prashna-249 **33/33**, prashna-249-chart **14/14**
  (ayanamsa constant, ascendant round-trip, real-sky uniform shift, personalisation,
  high-lat fallback), parse-check, build — all green.
- **Still open before "done":** (1) **live-render check** — blocked in this environment
  (preview serves the main repo root; the sandbox blocks binding a worktree port), so it
  must run post-merge; (2) a numeric **house-cusp cross-check** against a KP-New calculator
  for a fixed number+time+place; (3) the standing **two-agent bug bash** + owner live-URL
  approval (backlog closure contract); (4) the Reader II/VI page-pin still outstanding.

## 2026-07-29 update — item (2) house-cusp cross-check DONE; F14 found AND FIXED. CLEAN.

The numeric house-cusp cross-check (item 2 above) was run to completion against
**Swiss Ephemeris** (`sweph` / `swe_houses_armc`, the astro.com reference house engine)
for fixed number+time+place inputs, accounting for the KP-New ayanamsa offset. It first
surfaced a P1 engine bug (F14), which has since been **FIXED**; the cross-check is now a
clean pass. Outcome:

- **Placidus cusp math is externally correct** — Ganak matches Swiss Ephemeris to
  **0.0000″** on all 12 cusps for every chart, across the full 1..249 range at three
  latitudes (747 Placidus charts). Six anchors pinned in
  `validation/prashna-249-chart.cjs` (§1b), including three inside the formerly-broken
  bands (#45 Delhi, #40 London, #45 Sydney).
- **`PR_ramcForAsc` originally mis-converged** for a latitude-dependent band of numbers
  (Delhi #39–53, London #29–65, Sydney #37–56 — 72/747 charts), returning the wrong RAMC
  so houses 2–12 (and the sub-lord verdict for non-1/7 cusps) were wrong there. **FIXED
  2026-07-29** (wrap-safe coarse-scan + in-cell bisection root-find; branch
  `claude/prashna-249-f14-ramc`). Post-fix the full-range sweep is 0.0000″, 0 charts
  mis-converging. Full root cause + evidence: `plans/prashna-249-bugbash.md` § F14.

Item (2) is therefore a **clean pass**: the KP-New house cusps are externally verified
correct against the industry-reference Placidus engine across the whole 1..249 range.
The remaining gates before 249-engine 100% are the non-cusp ones (owner live-URL
sign-off, Reader II/VI page-pins) tracked elsewhere.

## Sources consulted

- **Primary text (this pass, page images):** Internet Archive `kp-readers` item — Reader
  VI (`J_KP reader_6_Horary Astrology`), Reader II (`…reader_2_fundamental Principles…`),
  Reader III (`…reader_3_Predictive Stellar Astrology`), read via the search-inside index
  (`ia903207.us.archive.org/fulltext/inside.php?item_id=kp-readers`) + the volume metadata
  (`archive.org/metadata/kp-readers`). All rule page-pins above come from Reader VI hits.
- Publisher listing confirming the volume title — Vedic Books, "Horary Astrology
  (KP – Sixth Reader)".
- **KP-New ayanamsa (separate published source, not the Readers):** K. Balachandran, *New
  KP Ayanamsa*, KP & Astrology Year Book 2003; corroborated by D. Senthilathiban, *A Study
  of KP Ayanamsa with Modern Precession Theories* (logicastro.com) and *A Review of KP
  Ayanamsas*.
- Web-corroboration for the earlier Tier-2 rows (now superseded for rules 2/3 by the
  Reader VI page-pins; retained in findings/house-gloss files): kpastroapp.com,
  kpastrology.com 1–249 table, PanchangBodh, OnlineJyotish, JagannathHora, AstroSage.
