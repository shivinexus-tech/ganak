# Festival row #29 — bilingual devotional and semantic audit

Audit date: 2026-07-28
Source snapshot: `e054d7f`
Lane: bilingual/devotional audit; all source read-only
Verdict: **P0 FAIL — route coverage is much broader than substantive bilingual guide coverage.**

## Scope and method

I inspected the merged `VRAT_VIDHI`, the permanent route registry, major-festival,
Durga Puja, eclipse, enrichment and Navadurga content, then ran the relevant
read-only gates. This audit distinguishes:

- a route that opens from a route with a route-specific bilingual worship guide;
- a named route that merely shows metadata;
- a named variant that silently reuses a generic parent guide;
- structural completeness (fields exist) from semantic/devotional quality.

The current merged inventory has **57 guide keys**. The route registry has **77
non-Navadurga named routes with no `vidhiKey`**, plus **24 named Ekadashi routes**
and **7 weekday Pradosh routes** that reuse a generic guide. A green
`festival-page-coverage` result therefore cannot mean substantive content coverage.

## P0 — named routes with no dedicated bilingual guide

These routes can open but have no route-specific `VRAT_VIDHI`. Each needs an
answer-first EN/HI verdict, named meaning and narrative, household worship/food
boundary, timing implication, regional qualification, and completion guidance
where relevant.

### General, regional and multi-day festivals

- `pongal` — `/festival/pongal`
- `anantChaturdashi` — `/festival/anant-chaturdashi`
- `tulasiVivah` — `/festival/tulasi-vivah`
- `mahalakshmiVrat` — `/festival/mahalakshmi-vrat`
- `pitruPakshaBegins` — `/festival/pitru-paksha-begins`
- `sarvaPitruAmavasya` — `/festival/sarva-pitru-amavasya`
- `kaliJayanti` — `/festival/kali-jayanti`
- `kalabhairavJayanti` — `/festival/kalabhairav-jayanti`
- `vaikasiVisakam` — `/festival/vaikasi-visakam`
- `aadiPooram` — `/festival/aadi-pooram`
- `arudraDarshan` — `/festival/arudra-darshan`
- `govatsaDwadashi` — `/festival/govatsa-dwadashi`
- `kaliChaudas` — `/festival/kali-chaudas`
- `lakshmiPanchami` — `/festival/lakshmi-panchami`
- `hariyaliTeej` — `/festival/hariyali-teej`
- `nagPanchami` — `/festival/nag-panchami`
- `radhaAshtami` — `/festival/radha-ashtami`
- `mahaAshtami` — `/festival/maha-ashtami`
- `mahaNavami` — `/festival/maha-navami`
- `sharadPurnima` — `/festival/sharad-purnima`
- `vasantPanchami` — `/festival/vasant-panchami`
- `panguniUthiram` — `/festival/panguni-uthiram`
- `thaipusam` — `/festival/thaipusam`
- `onam` — `/festival/onam`
- `karthigaiDeepam` — `/festival/karthigai-deepam`
- `vishu` — `/festival/vishu`

### Shakta and Navratri named observances

- `lalitaJayanti`, `taraJayanti`, `matangiJayanti`, `bagalamukhiJayanti`,
  `chhinnamastaJayanti`, `dhumavatiJayanti`, `bhuvaneshvariJayanti`,
  `kamalaJayanti`, `bhairaviJayanti`, `annapurnaJayanti` — corresponding
  `/festival/<key-in-kebab-case>` routes
- `shakambhariNavratriBegins` — `/festival/shakambhari-navratri-begins`
- `shakambhariPurnima` — `/festival/shakambhari-purnima`
- `lalitaPanchami` — `/festival/lalita-panchami`
- `kaliPuja` — `/festival/kali-puja`
- `sandhiPuja` — `/festival/sandhi-puja`
- `chaitraGhatasthapana` — `/festival/chaitra-ghatasthapana`
- `sharadGhatasthapana` — `/festival/sharad-ghatasthapana`

Do not turn the ten Mahavidya routes into interchangeable “Devi worship” copy.
Each needs its named theological/narrative identity and a clear boundary that
initiated/tantric procedures are not a generic household checklist. Kali Puja and
Sandhi Puja also need their own Bengal-specific timing and worship context rather
than being described only inside another festival's story.

### Solar, ancestral, women’s-vrat and household routes

- `rathaSaptami` — `/festival/ratha-saptami`
- `gangaDussehra` — `/festival/ganga-dussehra`
- `meshaSankranti`, `vrishabhaSankranti`, `mithunaSankranti`,
  `karkaSankranti`, `simhaSankranti`, `kanyaSankranti`, `tulaSankranti`,
  `vrishchikaSankranti`, `dhanuSankranti`, `kumbhaSankranti`,
  `meenaSankranti` — corresponding Sankranti routes
- `sakatChauth` — `/festival/sakat-chauth`
- `mauniAmavasya` — `/festival/mauni-amavasya`
- `gangaur` — `/festival/gangaur`
- `kajariTeej` — `/festival/kajari-teej`
- `rishiPanchami` — `/festival/rishi-panchami`
- `vishwakarmaPuja` — `/festival/vishwakarma-puja`
- `saraswatiAvahan` — `/festival/saraswati-avahan`
- `saraswatiPuja` — `/festival/saraswati-puja`
- `kojagaraPuja` — `/festival/kojagara-puja`

The eleven Sankranti pages may share safe structural components, but their
named solar ingress, regional observances and seasonal meaning must remain
distinct. They must not inherit Makar Sankranti's Uttarayana/harvest claims.

### Named Jayanti and recurring routes

- `vivahPanchami` — `/festival/vivah-panchami`
- `gitaJayanti` — `/festival/gita-jayanti`
- `parashuramaJayanti` — `/festival/parashurama-jayanti`
- `sitaNavami` — `/festival/sita-navami`
- `narasimhaJayanti` — `/festival/narasimha-jayanti`
- `naradaJayanti` — `/festival/narada-jayanti`
- `shaniJayanti` — `/festival/shani-jayanti`
- `balaramaJayanti` — `/festival/balarama-jayanti`
- `dattatreyaJayanti` — `/festival/dattatreya-jayanti`
- `swaminarayanJayanti` — `/festival/swaminarayan-jayanti`
- `vinayakaChaturthi` — `/festival/vinayaka-chaturthi`
- `kalashtami` — `/festival/kalashtami`

These are not acceptable as metadata-only pages. In particular, Narasimha
Jayanti must have the Narasimha–Prahlada narrative and its own timing/worship
identity; it must never be inferred from an Ekadashi suffix or generic fast.

## P0 — named variants currently reuse generic content

### Twenty-four named Ekadashi routes

All of the following resolve to `vidhiKey: ekadashi` and therefore show one generic
meaning and the same regional kathas instead of the named vrata-katha:

`kamada-ekadashi`, `mohini-ekadashi`, `apara-ekadashi`,
`devshayani-ekadashi`, `varuthini-ekadashi`, `padma-ekadashi`,
`indira-ekadashi`, `dev-uthani-ekadashi`, `mokshada-ekadashi`,
`putrada-ekadashi-paush-shukla`, `safala-ekadashi-magh-shukla`,
`amalaki-ekadashi`, `pap-mochini-ekadashi`, `nrisimha-jayanti`,
`nirjala-ekadashi`, `yogini-ekadashi`,
`putrada-ekadashi-shravan-krishna`, `aja-ekadashi`, `vijaya-ekadashi`,
`prabodhini-ekadashi`, `utpanna-ekadashi`,
`safala-ekadashi-paush-krishna`, `shatila-ekadashi`,
`phalaharini-ekadashi`.

Required rewrite pattern: retain a reviewed common Ekadashi procedure component,
but add per-route EN/HI `variantMeaning`, named katha, distinguishing food rule
(especially Nirjala/Shatila/Amalaki), seasonal/ritual consequence
(Devshayani/Prabodhini), and any tradition-sensitive parana note. Two Putrada and
two Safala-labelled routes must explicitly explain their month/paksha distinction.
The route labelled `/festival/nrisimha-jayanti` is especially severe: the registry
currently presents it as an Ekadashi variant despite the title claiming a Jayanti.

### Seven weekday Pradosh routes

`ravi-pradosh`, `som-pradosh`, `bhaum-pradosh`, `budh-pradosh`,
`guru-pradosh`, `shukra-pradosh`, `shani-pradosh` all reuse `pradosh`.

Required rewrite pattern: common Shiva/Pradosha timing and safe household puja may
be shared, but every page must say plainly what the weekday name means and separate
established local practice from internet-style promised-result claims. Do not claim
that a weekday variant universally guarantees health, marriage, debt relief,
children, victory or wealth.

### Navadurga day routes

The 18 Chaitra/Sharad day routes deliberately use the parent Navratri guide plus
`NAVADURGA_PAGE_ENTRIES`. Their day modules contain distinct deity material and
currently pass the Navadurga structural gate. A semantic gate must nevertheless
assert that the selected day's name, dhyana/meaning, offering and narrative appear
before generic parent content and that Chaitra/Sharad contextual copy does not
cross-leak.

## P0 — existing guides failing substantive quality

The current `devotional-guide-quality.cjs` failure identifies these exact keys:

- `skandaSashtiBegins`, `skandaSashtiSoorasamharam`,
  `skandaSashtiThirukalyanam`: both stories are only 12–16 words per language
  and are copied across all three routes. The route-specific beginning, battle
  culmination and Thirukalyanam narratives are absent. Shared regional copy is
  also copied. Rewrite each as a distinct stage of the six/seven-day observance.
- `ayyappaMandalaBegins`, `ayyappaMandalaPuja`: stories are only 8–12 words
  and fail the three-paragraph narrative requirement. The begin route needs
  mala/vrata commencement identity; the Puja route needs Mandala-season
  culmination identity, without implying every personal 41-day vrata ends on the
  public calendar date.
- `suryaGrahan`, `chandraGrahan`: only one 13–17-word story each and no second
  narrative. Eclipse safety is legitimate, but astronomy, devotional custom and
  pregnancy/food folklore must be clearly separated; never present customary
  restrictions as medical facts.
- Inventory regression: gate expects 50 keys but merged content has 57.
- Safety allowlist regression: Ayyappa beginning/Puja and solar eclipse are
  rejected as “generic safety” even where some risk is genuinely route-specific.
  Replace copied boilerplate with route-specific risk, then make the allowlist
  explicit and reviewed.

## P1 — weak, generic, copied or misplaced prose

1. **Product-meta inside devotion.** Rewrite product-centred prose into direct
   user guidance:
   - `hanumanJ.meaning`: “Ganak's Chaitra Purnima page…”
   - `buddhaPurnima.verdict`: “Ganak does not turn…”
   - `ekadashi.regional[0]`: “Ganak shows…”
   - `suryaGrahan/chandraGrahan.vidhi` and `.regional`: “Ganak shows/states…”
   - Diwali regional kathas: “Ganak's Kali Puja guide…” and “Ganak lists…”
   These are navigation/editorial notes, not katha or devotional meaning.

2. **Copied completion text.** Seventeen major guides from `holika` through
   `kartikaPurnima` receive exactly the same bilingual `commonCompletion`
   udyapan paragraph. All six Durga Puja day guides receive the same completion
   paragraph. Shared wording is acceptable only where the ritual fact is truly
   identical; currently it reads like template fill and erases whether the page is
   a festival, fast, public procession, new year or Buddhist observance.

3. **Copied pair content.**
   - `vatSavitri` and `vatPurnima` copy almost all vidhi, sankalpa, puja, parana
     and udyapan. Retain common Savitri–Satyavan narrative but make the
     Amavasya/Purnima calendrical and regional distinction visible throughout.
   - `guptNavratriMagha` and `guptNavratriAshadha` copy the complete guide.
     Add season/month identity and explicitly explain why both remain private
     Gupt Navratri while avoiding invented esoteric instruction.
   - `skandaShashti` and orphan `kandaSashtiAnnual` share generic temple language;
     clarify monthly versus annual six-day observance and route the intended key.
   - orphan `ayyappaMandala` overlaps two routed Ayyappa keys; consolidate without
     leaving unreachable canonical content.

4. **Essay/regulatory voice ahead of worship.** `rangwaliHoli`, `rakshaBandhan`,
   `bhaiDooj`, `gudiPadwa`, `ugadi`, `buddhaPurnima`, `rathYatra`,
   `kartikaPurnima` and several Diwali-family guides repeatedly lead with
   “universal”, “optional”, “must/never”, consent, allergy or product-boundary
   language. Safety/boundary notes are useful, but the answer-first verdict should
   first answer what the devotee does today; move secondary caveats to a labelled
   boundary/safety block and retain warm devotional voice.

5. **Thin Durga Puja narratives.** The six `durgaPuja*` guides pass the old
   regression gate but contain only one-sentence story bullets. Examples:
   Shashthi “Bodhan remembers inviting…”, Saptami “Nabapatrika links…”, Ashtami
   “Sandhi puja marks…”. They need readable named narrative, not merely labels,
   and Bengali terms need immediate plain-language glosses.

6. **English defects.**
   - `ayyappaMandala.diet`: “follow the Guru Swami, temple or family group
     according to the Guru Swami, temple or family group” is an obvious duplicated
     clause.
   - `kartikaPurnima.diet`: “may include keep a Purnima fast” is ungrammatical.
   - `durgaPujaDashami.stories[1]`: “Bijoya embraces reconcile neighbours” is
     ungrammatical.
   - Repeated “This is a plain-language intention, not a prescribed Sanskrit
     mantra” across many sankalpas is product/editorial copy; show it once as a UI
     label or short gloss rather than inside every prayer.

## P1 — Hindi quality

- `sheetlaAshtami.diet` leaks Latin `C`; write `विटामिन सी`.
- Current Latin-script scan otherwise found no Roman English tokens inside merged
  Hindi guide values, but this is too weak a quality test: Devanagari text can
  still be translation-like or grammatically poor.
- Several Hindi passages mirror English legal/editorial constructions:
  `सार्वभौमिक ... स्थापित नहीं`, `यह सरल भाव-संकल्प है, निर्धारित संस्कृत मंत्र
  नहीं`, and repeated `गणक ... दिखाता है`. Prefer natural household Hindi:
  directly state the local/family rule, then label variation briefly.
- Use consistent forms pinned by the glossary: `पारण`, `नैवेद्य`, `संकल्प`,
  `उद्यापन`, `कुल-परम्परा`. Add transliterated regional terms only with an
  immediate Hindi gloss (for example, बोधन—देवी का औपचारिक आवाहन).
- Avoid literal institutional Hindi such as `आधिकारिक मूल नियम` when the source
  is a temple discipline; name the authority/tradition in source notes and use
  devotional prose in the user-facing guide.

## Unsafe or universalized claims to source/rewrite carefully

- Eclipse food, Sutak, pregnancy and bathing directions: label religious custom,
  visibility dependence and medical non-evidence separately.
- Ayyappa clothing, hair/nail, celibacy, Irumudi and 18-step rules: attribute to
  Sabarimala/Guru Swami tradition; do not universalize to every Ayyappa devotee.
- Vat Savitri/Vat Purnima: do not imply only married women may participate or
  guarantee a husband's longevity.
- Karva Chauth/Ahoi/Hartalika/Sheetla: health, pregnancy, dehydration and stored
  food safety must be visible without treating a medical accommodation as failed
  devotion.
- Mahavidya/Gupt Navratri/Kali rites: household-safe worship must be distinct
  from initiated mantra, homa or tantric practice.
- Buddha Purnima: preserve Buddhist voice and community authority; do not insert
  Hindu puja/udyapan structure merely to satisfy a shared schema.
- Historical/folk narratives (Raksha Bandhan royal legends, Holi variants,
  regional Diwali stories): label katha/folk tradition rather than settled
  history.

## Required rewrite and gate pattern

For every route, require a route-resolved content identity:

1. `answer`: what to do today, in the selected language;
2. `namedMeaning`: why this exact named observance/variant exists;
3. `namedNarrative`: at least one substantial EN/HI route-specific katha or
   historical/devotional account, labelled as scripture, tradition or folklore;
4. `householdPractice`: safe, complete steps with jargon glossed;
5. `foodFastBoundary`: explicit fast/no-fast and medical accommodation;
6. `timingBoundary`: which displayed local time controls the practice;
7. `regionalBoundary`: no pan-Indian universalization;
8. `completion`: parana/udyapan only when applicable—do not force irrelevant
   fields onto festivals or Buddhist observance;
9. `sourceProfile`: primary/temple/denominational source confidence for claims.

Strengthen gates to:

- derive expected guide identity from every route, not `Object.keys(VRAT_VIDHI)`;
- fail any required route with `vidhiKey: null`;
- require named Ekadashi/Pradosh/solar-ingress variant fields and prohibit a
  parent-only narrative;
- compare normalized sentence fingerprints across keys and allow shared
  components explicitly instead of silently;
- ban product-meta (“Ganak shows/labels/keeps”) inside meaning, sankalpa, puja and
  stories;
- flag English grammar regressions above and repeated editorial disclaimers;
- scan Hindi for Latin tokens with an allowlist, canonical glossary, product-meta,
  overused translation templates and mixed-language UI;
- require route-specific risk categories before `safety`;
- ensure the selected named route title and narrative render before shared parent
  details in both EN and HI.

## Gate evidence (read-only)

```text
HINDI DEVOTIONAL LANGUAGE PASSED (60 source files; 57 merged guides checked)
HINDI WORSHIP GLOSSARY PASSED (7 core terms; 6 UI labels)
DEVOTIONAL VOICE ENGLISH PASSED (9 patterns checked)
DEVOTIONAL GUIDE QUALITY FAILED (55 problems)
  - expected 50 guide keys, got 57
  - short/copied stories: 3 Skanda route keys, 2 Ayyappa route keys,
    suryaGrahan, chandraGrahan
  - missing second story: suryaGrahan, chandraGrahan
  - safety allowlist failures: two Ayyappa route keys, Soorasamharam,
    suryaGrahan
MAJOR FESTIVAL PAGE REGRESSION PASSED (29 reviewed pages)
DURGA PUJA PAGE REGRESSION PASSED (6 Bengal calendar pages)
```

Interpretation: the three green language gates are narrow banned-word/glossary
checks; they do not establish natural, route-specific or substantive bilingual
quality. The failed substantive gate is a real closure blocker. The two page
regression gates prove field presence for a small reviewed subset, not the full
route inventory or strong narrative quality.

## Recommended implementation order

1. Fix registry/content identity errors: `/nrisimha-jayanti`, orphan
   `kandaSashtiAnnual` and `ayyappaMandala`, and all 77 `vidhiKey: null` routes.
2. Repair the seven newly added guides currently breaking the substantive gate.
3. Add named Ekadashi and weekday Pradosh variant overlays.
4. Rewrite copied/template and product-meta prose; correct the exact EN/HI defects.
5. Upgrade semantic/devotional gates before claiming a test-fix round.
6. Have a second agent adversarially test named-route identity in both languages;
   a route/field-count pass must not count as a bilingual quality round.
