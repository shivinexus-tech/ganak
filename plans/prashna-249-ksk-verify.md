# P0-PRASHNA-249-KSK-VERIFY — primary-text citation index

Status: **PAGE-PINNED 2026-07-29 — awaiting owner review.** Unblocks the 249-engine
*sourcing gate*; does **not** authorise engine code (owner sign-off still required).
**6/8 rules now Tier-1 page-pinned in Reader VI** (incl. the two most important, rules 2
and 3, upgraded from web-corroborated), rule 8 partial, rule 7 an honest by-design
adaptation; KP-New ayanamsa now has its own published citation. See the 2026-07-29 section.
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
- **One honest caveat about the page numbers.** The index returns the **scan's own
  page/leaf index** (its CONTENTS heading sits at index 2). Because a few front-matter
  leaves precede the printed folio 1, the scan index runs somewhat **ahead of the
  book's printed folio**. So each pin is a *directly reproducible locator* — open that
  leaf in the archive.org reader and the quoted text is there — with the **printed-folio
  number as the one residual precision step** (the same "located in the text, printed
  page pending" standard the owner already accepted for rules 1/4/5/6 on 2026-07-24).
- **Two standing consequences of using a scan:** (a) "NOT FOUND" can still mean the OCR
  garbled the phrase (KP OCR is noisy — e.g. "constellation"→"eonstellation"), **not**
  that Krishnamurti never wrote it; (b) the printed-folio confirmation against a
  paginated copy remains the final tidy-up before the sourcing gate is closed 100%.

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

Page numbers are the **archive.org `kp-readers` scan-page index** (see the caveat in the
provenance note — reproducible locator; printed folio runs a little behind). Each carries
a short confirming quote (a few words, per the copyright rule — not a reproduction).

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

**Residual for a 100% book-strict close:** confirm the **printed folio** numbers against a
paginated copy (the pins above are the scan's reproducible page/leaf index — text is there,
folio number runs a little behind); and, if desired, hunt a verbatim rotational "12th-from"
sentence for rule 8. The engine may now be described as **primary-text sourced** for rules
1–6 (Reader VI, located + quoted); rules 7 (adaptation) and 8 (partial) stay disclosed.

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
located and quoted. Only the printed-folio precision step remains.

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
