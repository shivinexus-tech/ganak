# Festival & vrat voice research — how Hindi sites actually write

**Owner spot-check feedback 2026-07-24:** Many Hindi strings do not make sense; some English is also absurd (e.g. Karva Chauth sankalpa: *“May care flow both ways”*). Gates catch crude words, not wrong tone or meaning.

**Agent rule:** Before rewriting any festival/vrat guide, read this file. Hindi must sound like **Dainik Bhaskar / Navbharat Times / household puja articles**, not like a translated wellness essay.

## Sources (read for tone, not copy-paste)

| Source | Use for |
|--------|---------|
| [Drik Panchang](https://www.drikpanchang.com) | Dates, muhurat, standard vidhi order |
| [Dainik Bhaskar — Dharm](https://www.bhaskar.com/jeevan-mantra/dharm) | Natural Hindi headline + katha framing |
| Navbharat Times / Live Hindustan astro sections | Step-by-step पूजा विधि, संकल्प मंत्र |
| DharmGhar, temple sites | Ordered puja steps, mantra text |

Cite URL + second source in task evidence when you change copy. Do not invent rituals.

## What went wrong in Ganak

1. **English drafted as moral essay** — “ethical partnership”, “May care flow both ways”, “gratitude replace haste”, “used responsibly”.
2. **Hindi calqued from that English** — grammatically OK but nobody says this at a thali.
3. **Sankalpa treated as affirmation** — real guides use **संकल्प मंत्र** or short **व्रत संकल्प** (“मैं … व्रत रखूँगी/रखूँगा”), not therapy language.
4. **Product meta in stories** — “Ganak labels this…” belongs in source notes, not user-facing katha.

## Voice rules (English **and** Hindi)

### Write like this

- Short sentences. Verb-first steps. Named materials.
- Purpose in **traditional words**: सौभाग्य, दीर्घायु, कुटुम्ब कल्याण, सन्तान, धन-धान्य, विवेक.
- Sankalpa: either **traditional mantra + one-line plain gloss**, or **one plain sentence** a woman would say at the thali.
- Verdict: what the vrat **is** and **when it ends** — not a lecture on choice.

### Never write like this

| Avoid (English) | Why | Prefer |
|-----------------|-----|--------|
| May care flow both ways | Not Hindu ritual speech | For husband’s long life and wellbeing (पति की दीर्घायु और सौभाग्य के लिए) |
| ethical partnership | Corporate | धर्ममय दाम्पत्य / सुखी दाम्पत्य |
| mutual wellbeing | Vague therapy | परस्पर मंगल / कुटुम्ब कल्याण |
| used responsibly | Essay | धन का सदुपयोग (only if needed) |
| gratitude replace haste | Poetic nonsense | कृतज्ञता से पूजा करें |
| many families / some communities | Essay (policy already bans) | Name the region or give direct step |
| Ganak labels / Ganak keeps | Product meta | Remove from user text |

## Four high-traffic pages — reference voice

### Karva Chauth

**Voice:** Lead with what the festival **is**, not “North Indian women's fast”. Example: *Karva Chauth is a festival where women fast for their husband's wellbeing.* Put Punjab/Haryana/Delhi detail in **regional** or kathas, not the verdict.

**How Bhaskar / NBT frame it:** पति के सौभाग्य और लंबी उम्र के लिए निर्जला व्रत; शाम को चौथ माता पूजा और कथा; चन्द्र दर्शन 후 अर्घ्य, पति से जल पीकर पारण.

**Traditional sankalpa mantra** (widely printed; gloss required in UI):

> मम सुखसौभाग्य पुत्रपौत्रादि सुस्थिर श्री प्राप्तये करक चतुर्थी व्रतमहं करिष्ये।

**Plain Hindi sankalpa (Ganak household path):**

> “मैं पति की दीर्घायु, सौभाग्य और कुटुम्ब कल्याण के लिए करवा चतुर्थी का व्रत रखती/रखता हूँ।”

**Replace current absurd pair:** EN “May care flow both ways” / HI “देखभाल दोनों ओर से हो” — **delete**.

### Hartalika Teej

**Natural framing:** निर्जला व्रत; प्रातः हरतालिका मुहूर्त में शिव-पार्वती पूजा; पार्वती के तप का स्मरण; कथा; अगली सुबह पारण.

**Sankalpa tone:** उमा-महेश्वर की पूजा + दृढ़ भक्ति + सुखी दाम्पत्य — **not** “righteous married life” essay; Hindi: **धर्ममय दाम्पत्य** or **सुखी गृहस्थ जीवन**.

### Chhath

**Natural framing:** चार दिन का सूर्य-अनुष्ठान — नहाय-खाय, खरना, सन्ध्या अर्घ्य, उषा अर्घ्य; छठी मैया और सूर्य देव.

**Sankalpa tone:** व्रत की शुद्धि और पारिवारिक कल्याण — **not** environmental lecture in sankalpa; keep “स्वच्छ घाट” in **vidhi/safety**, not main vow.

**Plain Hindi sankalpa example:**

> “मैं छठी मैया और सूर्य देव की कृपा से चार दिन का यह व्रत श्रद्धापूर्वक पूरा करूँगी/करूँगा।”

### Diwali

**Natural framing:** घर की सफाई, दीप, लक्ष्मी-गणेश पूजा, प्रसाद, परिवार के साथ उत्सव.

**Sankalpa tone:** समृद्धि और शांति का आशीर्वाद — **not** “honest prosperity” / “used responsibly”.

**Plain Hindi sankalpa example:**

> “इस दीपावली पर मैं घर में दीप जलाकर लक्ष्मी-पूजन करूँगा/करूँगी; धन, धान्य और सुख-शांति की कृपा मिले।”

## Agent workflow (updated)

1. Read this file + `plans/hindi-worship-glossary.md` + `plans/religious-content-policy.md`.
2. Fix **English** first until it sounds like a puja article, not an essay.
3. Rewrite **Hindi** from meaning (skill) — not from English word order.
4. Run gates: `hindi-devotional-language.cjs`, `hindi-worship-glossary.cjs`, `devotional-voice-english.cjs`.
5. Owner spot-check: “does this make sense?” not only “is it crude?”

## Rewrite backlog (phased)

| Phase | Scope | Status |
|-------|-------|--------|
| P0 | karva-chauth, hartalika-teej, chhath, diwali — verdict, sankalpa, vidhi one-liners | **OPEN** — owner flagged 2026-07-24 |
| P1 | Remaining 46 guides — sankalpa + verdict pass | OPEN |
| P2 | Regional kathas — remove product meta; tighten Hindi where calqued | OPEN |

Track in `plans/task-log.md` when a slice starts. One writer per file batch.
