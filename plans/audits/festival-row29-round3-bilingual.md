# Festival row #29 — round 3 bilingual route audit

Date: 2026-07-28
Integrated main: `b835494`
Mode: independent read-only source review
Verdict: **P0 incomplete — route identity is now correct, but substantive bilingual content is absent or generic on 108 named routes.**

## Inventory result

- Permanent routes: **181**
- Merged devotional guide keys: **57**
- Named non-Navadurga routes with `vidhiKey: null`: **77**
- Named Ekadashi variants sharing generic `ekadashi`: **24**
- Weekday Pradosh variants sharing generic `pradosh`: **7**
- Navadurga day routes: **18**, using a deliberate parent/day composition

The canonical-name repair is valid: all 24 Ekadashi names now match their
month/paksha identities, and the former false Nrisimha mapping is gone. This does
not supply named content. A permanent title over generic parent prose is still a
semantic failure.

## P0-A — 77 metadata-only routes

Every key below needs a route-specific bilingual content record; metadata
`deity/gloss/rules` is not a worship guide.

### Regional calendars and annual sequences (26)

`pongal`, `anantChaturdashi`, `tulasiVivah`, `mahalakshmiVrat`,
`pitruPakshaBegins`, `sarvaPitruAmavasya`, `kaliJayanti`,
`kalabhairavJayanti`, `vaikasiVisakam`, `aadiPooram`, `arudraDarshan`,
`govatsaDwadashi`, `kaliChaudas`, `lakshmiPanchami`, `hariyaliTeej`,
`nagPanchami`, `radhaAshtami`, `mahaAshtami`, `mahaNavami`,
`sharadPurnima`, `vasantPanchami`, `panguniUthiram`, `thaipusam`, `onam`,
`karthigaiDeepam`, `vishu`.

Actionable rewrite classes:

- Pongal, Onam and Vishu need named regional/new-year/harvest identities, not a
  generic “festival meal” page.
- Tamil routes (`vaikasiVisakam`, `aadiPooram`, `arudraDarshan`,
  `panguniUthiram`, `thaipusam`, `karthigaiDeepam`) need Tamil deity names,
  temple/household boundaries and immediate English/Hindi glosses.
- `anantChaturdashi` must distinguish Anant vrata from Ganesh visarjan sharing
  the date.
- Pitru routes need ancestor-rite boundaries and must not turn priest-led
  shraddha/tarpana into improvised household instructions.
- `kaliChaudas`, `govatsaDwadashi`, `lakshmiPanchami` and `mahalakshmiVrat`
  must remain distinct from generic Diwali/Lakshmi copy.

### Shakta and Navratri routes (17)

`lalitaJayanti`, `taraJayanti`, `matangiJayanti`, `bagalamukhiJayanti`,
`chhinnamastaJayanti`, `dhumavatiJayanti`, `bhuvaneshvariJayanti`,
`kamalaJayanti`, `bhairaviJayanti`, `annapurnaJayanti`,
`shakambhariNavratriBegins`, `shakambhariPurnima`, `lalitaPanchami`,
`kaliPuja`, `sandhiPuja`, `chaitraGhatasthapana`,
`sharadGhatasthapana`.

Actionable rewrite rules:

- Do not create ten interchangeable “worship Devi” Jayanti pages. Each
  Mahavidya route needs its named identity and source-backed narrative.
- Keep household-safe prayer separate from initiated mantra, nyasa, homa or
  tantric procedures. “Ask a guru” is a boundary, not a substitute for the
  page's plain household answer.
- `kaliPuja` and `sandhiPuja` need Bengal-specific night/junction timing and
  narrative rather than appearing only inside Diwali/Durga Puja prose.
- Ghatasthapana routes need city-local installation timing and explicit
  Chaitra/Sharad context; they must not be metadata aliases of parent Navratri.

### Solar and river observances (13)

`rathaSaptami`, `gangaDussehra`, `meshaSankranti`,
`vrishabhaSankranti`, `mithunaSankranti`, `karkaSankranti`,
`simhaSankranti`, `kanyaSankranti`, `tulaSankranti`,
`vrishchikaSankranti`, `dhanuSankranti`, `kumbhaSankranti`,
`meenaSankranti`.

Actionable rewrite rules:

- The eleven ingress pages may share a safe Surya/arghya component, but must
  state the exact rashi ingress and named regional observances.
- Never inherit Makar Sankranti's Uttarayana or harvest claims into every
  Sankranti.
- Every ingress page needs its displayed local punya/maha-punya boundary
  explained before generic solar devotion.
- Ganga Dussehra requires water-safety and pollution boundaries without
  universalizing river immersion as compulsory.

### Household vrats and named worship (10)

`sakatChauth`, `mauniAmavasya`, `gangaur`, `kajariTeej`,
`rishiPanchami`, `vishwakarmaPuja`, `saraswatiAvahan`,
`saraswatiPuja`, `kojagaraPuja`, `vinayakaChaturthi`.

Actionable rewrite rules:

- Separate Sakat Chauth from monthly Sankashti and Vinayaka Chaturthi from
  Ganesh Chaturthi.
- Gangaur and Kajari Teej need regional women's-vrat voice that does not
  promise marriage/long life or exclude unmarried/widowed readers by assertion.
- Rishi Panchami needs respectful menstrual-custom context without presenting
  impurity claims as medical facts.
- Saraswati Avahan and Saraswati Puja need sequence-aware completion and the
  Ayudha Puja regional boundary.
- Kojagara needs full-moon/night timing and Lakshmi context, not a generic
  Purnima guide.

### Named Jayantis and teaching routes (11)

`vivahPanchami`, `gitaJayanti`, `parashuramaJayanti`, `sitaNavami`,
`narasimhaJayanti`, `naradaJayanti`, `shaniJayanti`, `balaramaJayanti`,
`dattatreyaJayanti`, `swaminarayanJayanti`, `kalashtami`.

Actionable rewrite rules:

- Each route requires the named birth/teaching narrative; “honour deity X”
  plus generic lamp/fruit copy is insufficient.
- `gitaJayanti` must centre the Gita teaching and recitation, not a birth
  template.
- `vivahPanchami` must centre Rama-Sita marriage without promising marriage
  outcomes.
- `swaminarayanJayanti` must use its community's voice and date relationship
  to Ram Navami without merging their worship.
- `kalashtami` must distinguish monthly Bhairava worship from
  Kalabhairav Jayanti.

## P0-B — 24 named Ekadashi variants

All currently resolve to one generic guide:

`kamada-ekadashi`, `mohini-ekadashi`, `nirjala-ekadashi`,
`devshayani-ekadashi`, `shravana-putrada-ekadashi`,
`parivartini-ekadashi`, `papankusha-ekadashi`,
`devutthana-ekadashi`, `mokshada-ekadashi`,
`pausha-putrada-ekadashi`, `jaya-ekadashi`, `amalaki-ekadashi`,
`papmochani-ekadashi`, `varuthini-ekadashi`, `apara-ekadashi`,
`yogini-ekadashi`, `kamika-ekadashi`, `aja-ekadashi`,
`indira-ekadashi`, `rama-ekadashi`, `utpanna-ekadashi`,
`safala-ekadashi`, `shattila-ekadashi`, `vijaya-ekadashi`.

Minimum per-variant overlay:

1. exact EN/HI name and month/paksha;
2. 60–100 word EN and HI answer-first named meaning;
3. substantial named vrata-katha in both languages, labelled by source/tradition;
4. distinguishing offering or food boundary where established;
5. named seasonal consequence without guaranteed-result claims
   (`Devshayani`, `Devutthana`, `Parivartini`);
6. local parana still inherited from the engine, with tradition selection visible.

Special cases:

- `nirjala` must foreground the traditional waterless rule and medical
  accommodation; generic fruit-fast text is materially wrong.
- `shattila` needs the sesame identity.
- `amalaki` needs amla worship/context.
- Pausha/Shravana Putrada require month distinction and must not promise a child.
- Devshayani/Devutthana need Chaturmas sequence identity.
- Generic parent stories may supplement but cannot replace the named katha.

## P0-C — seven weekday Pradosh variants

`ravi-pradosh`, `som-pradosh`, `bhaum-pradosh`, `budh-pradosh`,
`guru-pradosh`, `shukra-pradosh`, `shani-pradosh`.

Minimum overlay:

1. weekday name and plain gloss in EN/HI;
2. one route-specific paragraph explaining the naming;
3. common Shiva/Parvati Pradosha narrative and local twilight timing may be
   inherited;
4. any weekday-associated intention must be labelled as regional/popular
   tradition;
5. prohibit universal promises of health, marriage, children, debt removal,
   victory or wealth.

## P1 — existing guide quality still needing editorial rounds

### Thin story fields masked by later overlays

The merged 57-guide gate verifies long regional kathas, but several source
modules still contain one-line placeholder stories. Durga Puja source examples
include “Bodhan remembers inviting…”, “Nabapatrika links…” and “Sandhi puja
marks…”. If merge order changes, thin content can reappear. Move substantive
stories into the canonical guide source or gate the final provenance explicitly.

### Parent-guide mismatch

- Chaitra/Sharad Navadurga day routes deliberately combine parent and day data.
  The gate must prove the selected day's deity, narrative and offering render
  before parent details in both languages.
- Orphan guide keys such as `kandaSashtiAnnual` and `ayyappaMandala` need an
  explicit canonical/shared status rather than silently existing without their
  own route.

### Hindi quality beyond banned words

- Repeated constructions such as `एक सार्वभौमिक ... स्थापित नहीं है` and
  `यह सरल भाव-संकल्प है, निर्धारित संस्कृत मंत्र नहीं` read like translated
  editorial policy. Put common disclaimers in one UI gloss; let each prayer and
  completion instruction speak naturally.
- Regional terms need immediate Hindi and English glosses on first use:
  Bodhan, Nabapatrika, Kolabou, Irumudi, Kettunirakkal, Nishita and related terms.
- A Devanagari-only scan is not a natural-Hindi test. Require a human
  adversarial sample from every content family.

## Minimum semantic gate contract

The gate source of truth must be `FESTIVAL_PAGE_ROUTES`, not
`Object.keys(VRAT_VIDHI)`.

### Every required route

```text
routeKey
path
sourceKind
contentKind: full | named-variant | composed-day | shared-sequence
canonicalGuideKey
title.en / title.hi
answer.en / answer.hi
namedMeaning.en / namedMeaning.hi
timingKind
timingGloss.en / timingGloss.hi
regionalBoundary.en / regionalBoundary.hi
sourceProfile
```

### Full guide additionally

```text
householdSteps: at least 2 bilingual steps
foodFastBoundary.en / .hi
namedNarratives: at least 2 bilingual items,
  each 140+ words and 3+ paragraphs unless a reviewed genre exception exists
completion.en / .hi
safety.en / .hi only for an enumerated route-specific risk
```

### Named variant additionally

```text
variantKey
parentGuideKey
variantMeaning.en / .hi
variantNarrative.en / .hi
variantDistinction.en / .hi
```

The normalized route title or approved identity anchors must occur in
`variantMeaning` and `variantNarrative`; parent-only content fails.

### Composed day additionally

```text
sequenceKey
dayNumber
dayDeity.en / .hi
dayMeaning.en / .hi
dayNarrative.en / .hi
renderOrder: day-before-parent
```

### Required negative fixtures

1. a route with `vidhiKey: null`;
2. a named Ekadashi resolving only to `ekadashi`;
3. a weekday Pradosh resolving only to `pradosh`;
4. a composed Navadurga day rendering parent meaning first;
5. copied narrative/completion across unrelated keys;
6. product-meta inside any devotional field;
7. missing Hindi or English variant field;
8. a variant title changed without its semantic anchors;
9. an unsupported universal promise;
10. safety text attached without an approved risk category.

## Closure sequence recommended

1. Make the route-derived semantic gate fail on all 108 current gaps.
2. Implement Ekadashi and Pradosh variant overlays first because their common
   parent structures already exist.
3. Add full guides in coherent source families: regional/Tamil; Shakta;
   solar/Sankranti; household vrats; Jayantis.
4. Run bilingual human review after each family, not after all 77 are drafted.
5. Do not claim an iterative round from route-count or field-presence alone;
   record sampled routes, language, findings, fixes and rerun evidence.
