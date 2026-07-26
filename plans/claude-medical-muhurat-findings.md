# Findings — elective surgery / medical Muhurat (owner checkpoint)

**Task:** `CLAUDE-P0-MEDICAL-MUHURAT` · **Worker:** Claude Code · **Date:** 2026-07-24
**Status:** Research + specification complete. **No engine or UI code written.**
Brief: [`plans/claude-task-surgery-medical-muhurat.md`](claude-task-surgery-medical-muhurat.md)

This document exists so the owner can decide, before any implementation:
**build as specified, narrow further, or reject.** My recommendation is at the end:
**build — narrowed.**

---

## 1. Product boundary (unchanged, restated for sign-off)

This feature helps a user express a *cultural/religious timing preference* for care a
qualified clinician has **already judged appropriate and safe to schedule**. It is not
medical advice and must never compete with clinical urgency, hospital availability, the
treating team, or pre-operative rules.

### Safety wall — shown FIRST, before any astrological result

**English**
> **Read this first — this is not medical advice.**
> - Never delay urgent or emergency care for a muhurat.
> - Your doctor and hospital decide what is medically safe and when.
> - Ganak does **not** predict the success, complications, recovery, or survival of any
>   procedure.
> - Use this only to note a preferred time **when your medical team has clearly said the
>   timing is flexible.**

**हिन्दी**
> **पहले यह पढ़ें — यह चिकित्सा सलाह नहीं है।**
> - किसी भी मुहूर्त के लिए आपातकालीन या तत्काल उपचार में देरी कभी न करें।
> - क्या और कब चिकित्सकीय रूप से सुरक्षित है, यह आपके डॉक्टर और अस्पताल तय करते हैं।
> - गणक किसी प्रक्रिया की सफलता, जटिलता, स्वस्थ होने या जीवन-रक्षा का पूर्वानुमान **नहीं**
>   करता।
> - इसका उपयोग केवल तब करें जब आपकी चिकित्सा टीम ने स्पष्ट रूप से कहा हो कि समय **लचीला** है।

---

## 2. Sourced rule table with confidence

Confidence tiers: **T1** = classical muhurta text; **T2** = reputable modern standard
(B.V. Raman, *Muhurtha*); **T3** = modern practitioner custom / heterodox origin.

| # | Rule | Direction | Tier | Source / note |
|---|------|-----------|------|---------------|
| R1 | **Avoid the full-moon (Purnima) day** for cutting procedures | avoid | **T1/T2** | Moon rules fluids → hemorrhage/fluid-loss caution. The most consistently repeated rule; also the only one with a quasi-physiological rationale. |
| R2 | **Avoid Amavasya and eclipse days** | avoid | **T1/T2** | Standard across all muhurta for any deliberate act. |
| R3 | **Surgery is a *krura/tikshna* (sharp/cruel) act** — its electional logic is *partly inverted* from benefic ceremonies | framing | **T1/T2** | Raman & classical: for *Sastra/Agni cikitsa* (surgery/cautery), the **Rikta tithis (4, 9, 14)** and **sharp nakshatras** are *suitable*, not forbidden. **This is the single most important finding** — see §3. |
| R4 | **Tikshna ("sharp") nakshatras** — Ardra, Jyeshtha, Ashlesha, Mula — sanctioned for cutting/surgical acts | favor (for surgery) | **T1/T2** | These are elsewhere avoided for auspicious ceremonies; the surgery context flips them. |
| R5 | **Ashwini** (the Ashwini-Kumaras, divine physicians) favourable for *starting treatment / medicine*, healing | favor (for treatment) | **T2/T3** | Distinguishes "begin a treatment regimen" from "cut". |
| R6 | **Paksha**: waxing (Shukla) generally preferred for healing/growth; waning (Krishna) associated with removal/reduction | mixed / conflict | **T2/T3** | Sources conflict; the direction depends on procedure intent (heal vs remove) — which edges toward medical categorisation we must avoid. |
| R7 | **Vara**: Tuesday (Mars) / Saturday sanctioned for surgical/sharp acts | favor (for surgery) | **T2** | Contradicts general muhurta where Tue/Sat are malefic-leaning. Another krura-karma inversion. |
| R8 | **Rikta tithis (4, 9, 14)** acceptable *for surgery specifically* | favor (for surgery) | **T2** | Raman: normally inauspicious, but appropriate for cruel/sharp acts. |
| R9 | **Moon-in-sign vs body part** ("do not cut the body part ruled by the sign the Moon occupies", e.g. Moon in Taurus → avoid throat) | avoid | **T3** | **Well-attested but heterodox** — root is Hellenistic *melothesia* (zodiacal man), later absorbed into modern Vedic medical astrology; **not** in the classical muhurta texts. Also the rule most easily mistaken for medical guidance. |
| R10 | **Avoid the native's birth Moon-sign (Janma Rashi)** transit | avoid | **T2/T3** | Requires birth details. Optional; not needed for a general finder. |

**Honest read:** R1–R4 and R2 are defensible and stable. R6–R8 **conflict across
lineages** and depend on procedure intent. R9–R10 are optional and lower-confidence.
There is **no single universal "surgery score"** in the sources — matching the brief's
explicit warning.

---

## 3. The krura-karma inversion (why we cannot reuse existing Muhurat gates)

Ganak's current Muhurat engine (`src/engine/muhurat.ts`) screens **for benefic acts**:
clean tithis, benefic nakshatras, no Rikta, no malefic weekdays. Surgery classically
wants the **opposite factors** (sharp nakshatras, Rikta tithis, Mars/Saturn days).

Consequences:
- **A dedicated engine/module + route is mandatory** (already required by the brief).
  Do not extend the benefic finder.
- **UX hazard:** showing a day the rest of the app flags red ("Rikta tithi", "Jyeshtha —
  a sharp nakshatra") as *"good for surgery"* is confusing and unsettling. This is a real
  design tension, escalated as an unresolved choice in §6.

---

## 4. Proposed inputs — are birth details necessary?

**No, not for v1.** A defensible general finder needs only:
- **Date range** (the window the clinical team said is flexible).
- **Place** (for the local panchanga — tithi/nakshatra/paksha/sunrise).
- **A required confirmation checkbox:** *"My medical team has told me the timing for this
  planned procedure is flexible."* The finder does not run until this is ticked.

Birth details (for R10, natal Moon-sign avoidance) are **optional and deferred** — a
clearly-labelled later add-on, never silently mixed in (consistent with the backlog's
"never silently mix natal filtering" rule).

No procedure-type dropdown in v1 (a menu of "tonsillectomy / abdominal / dental…" pulls
us straight into medical categorisation and the R9 body-part rule). Keep it a single
**general planned-procedure** screen.

---

## 5. Sample outputs (EN/HI)

### 5a. Safe result — windows found
**EN**
> For **12–18 Aug 2026, Delhi**, these times avoid the full-moon day and fall on
> traditionally suitable panchanga for a planned procedure:
> • Sat 15 Aug, 09:12–10:40 · • Tue 18 Aug, 08:05–09:30
> *A cultural timing preference only. Confirm any date with your treating team — they
> have the final say.*

**हिन्दी**
> **12–18 अगस्त 2026, दिल्ली** के लिए ये समय पूर्णिमा से बचते हैं और नियोजित प्रक्रिया हेतु
> परंपरागत रूप से उपयुक्त पंचांग पर पड़ते हैं:
> • शनि 15 अग॰, 09:12–10:40 · • मंगल 18 अग॰, 08:05–09:30
> *केवल एक सांस्कृतिक समय-वरीयता। कोई भी तिथि अपनी चिकित्सा टीम से पुष्टि करें — अंतिम
> निर्णय उन्हीं का है।*

### 5b. No clean window
**EN** > No traditionally preferred window falls in this range — most likely a full
moon or an eclipse. This never means "don't have the procedure." Follow your medical
team's schedule.
**हिन्दी** > इस अवधि में कोई परंपरागत रूप से पसंदीदा समय नहीं मिला — संभवतः पूर्णिमा या ग्रहण।
इसका अर्थ कभी यह नहीं कि "प्रक्रिया न कराएँ।" अपनी चिकित्सा टीम के कार्यक्रम का पालन करें।

### 5c. Refusal — urgent / symptom-driven
**EN** > If this is an emergency, or your symptoms are new, severe, or getting worse,
contact your doctor or emergency services now — do not wait for a muhurat. Ganak can't
choose a time for urgent care.
**हिन्दी** > यदि यह आपात स्थिति है, या आपके लक्षण नए, गंभीर या बढ़ते हुए हैं, तो अभी अपने डॉक्टर
या आपातकालीन सेवा से संपर्क करें — मुहूर्त की प्रतीक्षा न करें। गणक तत्काल उपचार के लिए समय नहीं
चुन सकता।

---

## 6. Unresolved method choices (need owner decision)

1. **Krura-karma authenticity vs. UX comfort (biggest one).** — **OWNER DECISION
   2026-07-25: Option C.** Show the **calm conservative result** (avoid full moon /
   Amavasya / eclipse; B1-style, neutral on the inverted factors) as the headline answer,
   **plus a collapsible "How tradition views surgical timing" note** that honestly
   explains the krura-karma doctrine (sharp nakshatras + Rikta tithis are traditionally
   *suitable* for cutting) **without prescribing an ominous specific date**. Preserves
   authenticity, keeps the register safe near a real operation, and pre-explains why a
   returned day might read "red" on the general finder. Build v1 authorised on this basis.
2. **Body-part Moon rule (R9): include as labelled "traditional caution", or omit?**
   My lean: **omit for v1** (heterodox origin + highest misread risk).
3. **Waxing/waning (R6) and procedure intent (heal vs remove).** Honouring it needs a
   procedure-type input, which we're deliberately avoiding. My lean: **do not ask; omit.**
4. **Natal Moon-sign (R10).** — **OWNER DECISION 2026-07-25: add it now.** Built as an
   **optional, opt-in** overlay: a collapsible "Personalise (optional)" section takes
   birth date/time/place, computes the Janma Rashi, and sets aside days when the transit
   Moon returns to that sign — clearly separate, never silently mixed into the general
   finder, birth details never stored. R9 (body-part Moon rule) remains omitted.

---

## 7. Validation-anchor plan

- New gate `validation/medical-muhurat.cjs` (mirrors existing `deep-muhurats.cjs` style).
- Pin **independent panchanga anchors** (not medical claims): e.g. for a fixed city+date,
  assert the engine flags Purnima/Amavasya/eclipse days as excluded, and that a chosen
  window's tithi/nakshatra/paksha match Drik Panchang for that day.
- **Prove-the-guard**: perturb one rule constant → anchors fail → restore.
- Assert the **safety wall renders before any result** and the **confirmation checkbox
  gates execution** (DOM-level).
- Assert refusal copy exists in both languages; no browser storage; URL prefs only.
- Run every canonical gate + production build + EN/HI phone smoke before handoff.

---

## 8. Recommendation

**BUILD — narrowed.** The sourcing is strong enough for a defensible, honest feature and
explicitly *not* strong enough for any procedure-specific or outcome logic.

Ship v1 as:
- one **general planned-procedure** timing screen, panchanga-only, **no birth chart**;
- **safety wall first + mandatory "timing is flexible" checkbox** gating the finder;
- **conservative rule set** (R1/R2 avoidances + Ashwini healing note); the krura-karma
  inversion and R9 body-part rule **held for owner decision** per §6;
- dedicated engine/route; no reuse of benefic gates; no score/badge/guarantee.

**Do not build** procedure-specific medical categories, outcome scoring, medication/
fasting/anaesthesia timing, or anything that reads as clinical clearance.

**Stop here for owner review — no implementation is authorised until you pick §6.1/§6.2.**

### Sources
- B.V. Raman, *Muhurtha (Electional Astrology)* — modern standard reference.
- *Muhurta Chintamani* (Daivagna Rama), *Kalaprakashika*, *Brihat Samhita* (Varahamihira) — classical.
- "Astrology and Surgery," wisdomlib.org — melothesia / body-part rule (T3).
- Practitioner corroboration (Radhikesh; astro blogs) for R4–R9 — T3, used only where classical/Raman agree.
