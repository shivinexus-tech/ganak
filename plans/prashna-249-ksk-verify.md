# P0-PRASHNA-249-KSK-VERIFY — primary-text citation index

Status: **DRAFT — awaiting owner review.** Unblocks the 249-engine *sourcing gate*;
does **not** authorise engine code (owner sign-off + KSK page-confirmation still required).
Date: 2026-07-24 · Owner instruction 2026-07-24: **Option 1 (book-strict) primary,
Option 2 (web-corroborated) only as a labelled fallback where verified text is unreachable.**

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
- **Primary-text access used here:** the Internet Archive full-text transcript of
  **Reader VI — *Horary Astrology*** (`archive.org/details/kp-readers`). This is an
  OCR scan, not a copy Ganak owns. I did **not** reproduce doctrine text — only
  located *where* each rule appears.
- **Two consequences of using a scan:** (a) "NOT FOUND in Reader VI" can mean the OCR
  missed it or it lives in another volume, **not** that Krishnamurti never wrote it;
  (b) exact **page numbers must be re-confirmed against a legitimately-owned copy**
  before the engine's sourcing gate is signed off. That final page-pinning is the one
  step I cannot complete from here.

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

| # | Engine rule (what Ganak will do) | Tier | Where it traces to |
|---|---|---|---|
| 1 | The number 1–249 **fixes the ascendant** at the start of its sign / star-lord / sub-lord segment | ✅ Tier 1 | **Reader VI**, traditional-horary section (Uthrakalamritha / Prasna Gyana slokas on deriving rasi–navamsa from a number). Confirm exact page in owned copy. |
| 2 | **Why 249** — 27 nakshatras × 9 subs = 243, six sign-boundary splits → 249; sub sizes proportional to Vimshottari dasa years | ⚠️ Tier 2 | Not surfaced in the Reader VI scan. The **sub-division-by-Vimshottari-proportion** rule is foundational **Reader II** (*Fundamental Principles*, sub theory). Ganak already **recomputes** the 249 table from first principles, so this is math-anchored regardless — but the doctrinal cite belongs to Reader II and needs page confirmation. |
| 3 | The **cuspal sub-lord is the final arbiter** of a house's matter (promise vs denial) | ⚠️ Tier 2 → really Reader II | The "sub-lord decides" thesis is the **central KP doctrine**, established in **Reader II** (*Fundamental Principles*), applied throughout Reader VI. Not stated as a single "final judge" sentence in the Reader VI scan. **Highest-priority page-pin** — it is the rule the whole yes/no verdict rests on. |
| 4 | **Ruling Planets** = day-lord, ascendant sign-lord & star-lord, Moon sign-lord & star-lord; common planets between RPs and significators survive | ✅ Tier 1 | **Reader VI**, "Ruling Planets" section (Section I / introduction). |
| 5 | **Significators & hierarchy** — planets in the star of occupants/owners of a house rank as its significators | ✅ Tier 1 | **Reader VI**, Prasna Gyana / Uthrakalamritha significator passages; underlying theory in **Reader III** (*Predictive Stellar Astrology*). |
| 6 | **Repeat / sincerity / one-question** — first sincere number stands; no test questions; successive queries handled | ✅ Tier 1 | **Reader VI**, Prasna Gyana slokas 3–4 (consultant sincerity; Moon/Sun/Jupiter for successive queries). |
| 7 | **Whose place/time** — the location where the question is judged (Ganak = self-service ⇒ user's confirmed place) | ⚠️ Tier 2 | Reader VI assumes the **astrologer's locality** implicitly; the self-service adaptation (querent = judge) is a **Ganak product decision**, not a KSK rule. Disclose as such — do not claim KSK backing for it. |
| 8 | **"12th-from" negation** — the 12th house from any house opposes that house's matter (deny-side glosses) | ⚠️ Tier 2 | Not located in the Reader VI scan. Standard KP, but must be pinned in **Reader II/III** before the deny-side house glosses in [prashna-house-glosses.md](prashna-house-glosses.md) claim primary backing. |

---

## Ayanamsa note (affects an owner decision already made)

The owner **decided KP ayanamsa (option C, 2026-07-22)** for the number mode. That
decision stands. Two honest caveats from the primary text:

- Reader VI does **not** name a numeric "KP ayanamsa"; it uses Sayana/Nirayana framing.
  The engine must therefore pin a **specific published KP ayanamsa** (KP-Old vs KP-New
  differ by minutes and can flip a planet's sub) and record which — that choice is an
  implementation constant to confirm, not something Reader VI dictates.
- This is the only rule where the owner's decision and the primary text need an
  explicit reconciliation line on-screen (Ganak already discloses ayanamsa bilingually).

---

## What is still needed for full Option-1 (book-strict) closure

1. **Page-pin the four ✅ Tier-1 rules** (1, 4, 5, 6) against a legitimately-owned copy
   of Reader VI — replace "confirm exact page" with real page numbers.
2. **Upgrade the four ⚠️ Tier-2 rules** to Tier 1:
   - Rules 2 & 3 → confirm in **Reader II** (*Fundamental Principles*).
   - Rule 8 → confirm the 12th-from rule in **Reader II/III**.
   - Rule 7 → **cannot** become Tier 1 (it is a Ganak self-service adaptation); keep it
     labelled as a product decision, not KSK doctrine.
3. **Pin the KP ayanamsa constant** (Old vs New) and its on-screen disclosure line.

Until steps 1–3 are done, the engine may be **prototyped and reviewed** but not shipped
to the public as "sourced," per the project's religious-accuracy rule.

---

## Sources consulted

- Reader VI full text — Internet Archive `kp-readers` collection
  (`J_KP reader_6_Horary Astrology`).
- Publisher listing confirming the volume title — Vedic Books, "Horary Astrology
  (KP – Sixth Reader)".
- Web-corroboration for Tier-2 rows (already logged in the findings/house-gloss files):
  kpastroapp.com, kpastrology.com 1–249 table, PanchangBodh, OnlineJyotish,
  JagannathHora, AstroSage/RoxyAPI.
