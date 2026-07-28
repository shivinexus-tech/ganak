# Festival row #29 — raster hero and gate audit

Date: 2026-07-28
Lane: C, read-only source audit
Task: `CODEX-P0-FESTIVAL-QUALITY-29-2026-07-28`

## Verdict

The route registry is broad and its route-coverage gate passes, but the raster hero
programme is only at its first batch. The live component deliberately hides a hero
when its WebP is absent. Only **3 of 57 worship-guide keys** have a raster file:
`diwali`, `ganeshChaturthi`, and `sankashti`. Moreover,
`ganeshChaturthi.webp` and `sankashti.webp` are byte-for-byte identical, so only
**2 distinct raster compositions** exist.

The route inventory contains **181 unique direct routes**:

- 163 unique festival/observance routes represented by 166 entries (four Chhath
  labels intentionally share `/festival/chhath`);
- 18 Navadurga day routes with a separate, owned square-art pipeline;
- only the Diwali, Ganesh Chaturthi and Sankashti guide routes currently request a
  present raster hero;
- 77 overview-only entries have no `vidhiKey`, so they cannot request a raster hero
  even if a matching registry/file were added.

Three current gates fail on the checked tree. Two are obsolete SVG gates rather
than useful raster checks. The third correctly exposes weak/new guide content but
also has a stale hard-coded inventory.

## Runtime contract and observed files

`FestivalGuideScreen.tsx` renders `FestivalRasterHero` only when
`guide.vidhiKey` exists. `FestivalRasterHero.tsx` always requests
`/festival-images/raster/<vidhiKey>.webp`; on load error it returns `null`. There is
deliberately no SVG or generic fallback.

| Key | Dimensions | SHA-256 | Finding |
|---|---:|---|---|
| `diwali` | 1280×480 | `fd7219081f4f260fe01b0f717a27dedd046f3c93672f7be93ebb2676ca5659fb` | Distinct raster |
| `ganeshChaturthi` | 1280×480 | `af00b58067efc3c6b9c1aa658440278831a4dd4dc190b7fe86f8a629b7228385` | Same bytes as Sankashti |
| `sankashti` | 1280×480 | `af00b58067efc3c6b9c1aa658440278831a4dd4dc190b7fe86f8a629b7228385` | Relevance defect: duplicated Ganesh Chaturthi art |

There are zero top-level `public/festival-images/*.svg` files. Any gate requiring
them is testing a deleted implementation, not the UI users receive.

## Exhaustive route-to-guide-hero inventory

The table groups every non-Navadurga route entry by the hero key actually passed to
the component. “None” means the live UI hides the banner. Repeated Chhath paths are
four named day labels sharing one route, not four direct routes.

| Hero key | Entry count | Route(s) | Raster now | Registry subject/template |
|---|---:|---|---|---|
| `ahoiAshtami` | 1 | `/festival/ahoi-ashtami` | None | `mother-stars` / `mother-stars` |
| `akshaya` | 1 | `/festival/akshaya` | None | `vishnu` / `vishnu` |
| `amavasya` | 1 | `/festival/amavasya` | None | `pitru` / `pitru` |
| `ayyappaMandalaBegins` | 1 | `/festival/ayyappa-mandala-begins` | None | `ayyappa` / `ayyappa` |
| `ayyappaMandalaPuja` | 1 | `/festival/ayyappa-mandala-puja` | None | `ayyappa` / `ayyappa` |
| `bhaiDooj` | 1 | `/festival/bhai-dooj` | None | `sibling-tilak` / `lakshmi` |
| `buddhaPurnima` | 1 | `/festival/buddha-purnima` | None | `buddha` / `buddha` |
| `chaitraNavratri` | 1 | `/festival/chaitra-navratri` | None | `durga` / `durga` |
| `chandraGrahan` | 1 | `/festival/chandra-grahan` | None | `lunar-eclipse` / `grahan-lunar` |
| `chhath` | 4 | `/festival/chhath` (Nahay Khay, Kharna, Sandhya Arghya, Usha Arghya labels) | None | `surya-arghya` / `chhath` |
| `dhanteras` | 1 | `/festival/dhanteras` | None | `lakshmi-dhanvantari` / `lakshmi` |
| `diwali` | 1 | `/festival/diwali` | **Raster** | `lakshmi` / `lakshmi` |
| `durgaPujaAshtami` | 1 | `/festival/durga-puja-ashtami` | None | `durga` / `durga` |
| `durgaPujaDashami` | 1 | `/festival/durga-puja-dashami` | None | `durga-visarjan` / `durga` |
| `durgaPujaMahalaya` | 1 | `/festival/durga-puja-mahalaya` | None | `durga-pitru` / `pitru` |
| `durgaPujaNavami` | 1 | `/festival/durga-puja-navami` | None | `durga` / `durga` |
| `durgaPujaSaptami` | 1 | `/festival/durga-puja-saptami` | None | `durga` / `durga` |
| `durgaPujaShashthi` | 1 | `/festival/durga-puja-shashthi` | None | `durga` / `durga` |
| `dussehra` | 1 | `/festival/dussehra` | None | `rama-ravana` / `rama` |
| `ekadashi` | 25 | `/festival/ekadashi`, `/festival/kamada-ekadashi`, `/festival/mohini-ekadashi`, `/festival/apara-ekadashi`, `/festival/devshayani-ekadashi`, `/festival/varuthini-ekadashi`, `/festival/padma-ekadashi`, `/festival/indira-ekadashi`, `/festival/dev-uthani-ekadashi`, `/festival/mokshada-ekadashi`, `/festival/putrada-ekadashi-paush-shukla`, `/festival/safala-ekadashi-magh-shukla`, `/festival/amalaki-ekadashi`, `/festival/pap-mochini-ekadashi`, `/festival/nrisimha-jayanti`, `/festival/nirjala-ekadashi`, `/festival/yogini-ekadashi`, `/festival/putrada-ekadashi-shravan-krishna`, `/festival/aja-ekadashi`, `/festival/vijaya-ekadashi`, `/festival/prabodhini-ekadashi`, `/festival/utpanna-ekadashi`, `/festival/safala-ekadashi-paush-krishna`, `/festival/shatila-ekadashi`, `/festival/phalaharini-ekadashi` | None | `vishnu` / `vishnu` |
| `ganeshChaturthi` | 1 | `/festival/ganesh-chaturthi` | **Raster** | `ganesha` / `ganesha` |
| `govardhanPuja` | 1 | `/festival/govardhan-puja` | None | `krishna-govardhan` / `krishna` |
| `gudiPadwa` | 1 | `/festival/gudi-padwa` | None | `gudi` / `gudi` |
| `guptNavratriAshadha` | 1 | `/festival/gupt-navratri-ashadha` | None | `durga` / `durga` |
| `guptNavratriMagha` | 1 | `/festival/gupt-navratri-magha` | None | `durga` / `durga` |
| `guruPurnima` | 1 | `/festival/guru-purnima` | None | `guru` / `guru` |
| `hanumanJ` | 1 | `/festival/hanuman-j` | None | `hanuman` / `hanuman` |
| `hartalikaTeej` | 1 | `/festival/hartalika-teej` | None | `shiva-parvati` / `shiva-parvati` |
| `holika` | 1 | `/festival/holika` | None | `holika-fire` / `holi` |
| `janmashtami` | 1 | `/festival/janmashtami` | None | `krishna` / `krishna` |
| `kartikaPurnima` | 1 | `/festival/kartika-purnima` | None | `diya-river` / `diya-river` |
| `karvaChauth` | 1 | `/festival/karva-chauth` | None | `moon-karva` / `moon-karva` |
| `mahaShivaratri` | 1 | `/festival/maha-shivaratri` | None | `shiva` / `shiva` |
| `makarSankranti` | 1 | `/festival/makar-sankranti` | None | `surya` / `surya` |
| `masikDurgashtami` | 1 | `/festival/masik-durgashtami` | None | `durga` / `durga` |
| `masikShivaratri` | 1 | `/festival/masik-shivaratri` | None | `shiva` / `shiva` |
| `narakChaturdashi` | 1 | `/festival/narak-chaturdashi` | None | `diya` / `lakshmi` |
| `pradosh` | 8 | `/festival/pradosh`, `/festival/ravi-pradosh`, `/festival/som-pradosh`, `/festival/bhaum-pradosh`, `/festival/budh-pradosh`, `/festival/guru-pradosh`, `/festival/shukra-pradosh`, `/festival/shani-pradosh` | None | `shiva` / `shiva` |
| `purnima` | 1 | `/festival/purnima` | None | `moon` / `moon` |
| `rakshaBandhan` | 1 | `/festival/raksha-bandhan` | None | `rakhi` / `rakhi` |
| `ramNavami` | 1 | `/festival/ram-navami` | None | `rama` / `rama` |
| `rangwaliHoli` | 1 | `/festival/rangwali-holi` | None | `holi-colors` / `holi` |
| `rathYatra` | 1 | `/festival/rath-yatra` | None | `jagannath` / `jagannath` |
| `sankashti` | 1 | `/festival/sankashti` | **Raster, duplicate** | `ganesha` / `ganesha` |
| `sharadNavratri` | 1 | `/festival/sharad-navratri` | None | `durga` / `durga` |
| `sheetlaAshtami` | 1 | `/festival/sheetla-ashtami` | None | `sheetla` / `sheetla` |
| `skandaSashtiBegins` | 1 | `/festival/skanda-sashti-begins` | None | `murugan` / `murugan` |
| `skandaSashtiSoorasamharam` | 1 | `/festival/skanda-sashti-soorasamharam` | None | `murugan` / `murugan` |
| `skandaSashtiThirukalyanam` | 1 | `/festival/skanda-sashti-thirukalyanam` | None | `murugan` / `murugan` |
| `skandaShashti` | 1 | `/festival/skanda-shashti` | None | `murugan` / `murugan` |
| `suryaGrahan` | 1 | `/festival/surya-grahan` | None | `solar-eclipse` / `grahan-solar` |
| `ugadi` | 1 | `/festival/ugadi` | None | `ugadi` / `gudi` |
| `varalakshmi` | 1 | `/festival/varalakshmi` | None | `lakshmi` / `lakshmi` |
| `vatPurnima` | 1 | `/festival/vat-purnima` | None | `banyan` / `savitri` |
| `vatSavitri` | 1 | `/festival/vat-savitri` | None | `banyan` / `savitri` |

### The 77 overview-only entries (no hero key and no raster request)

`pongal`, `anant-chaturdashi`, `tulasi-vivah`, `mahalakshmi-vrat`,
`pitru-paksha-begins`, `sarva-pitru-amavasya`, `kali-jayanti`,
`kalabhairav-jayanti`, `vaikasi-visakam`, `aadi-pooram`, `arudra-darshan`,
`govatsa-dwadashi`, `kali-chaudas`, `lakshmi-panchami`, `hariyali-teej`,
`nag-panchami`, `radha-ashtami`, `maha-ashtami`, `maha-navami`,
`sharad-purnima`, `vasant-panchami`, `panguni-uthiram`, `thaipusam`, `onam`,
`karthigai-deepam`, `vishu`, `lalita-jayanti`, `tara-jayanti`,
`matangi-jayanti`, `bagalamukhi-jayanti`, `chhinnamasta-jayanti`,
`dhumavati-jayanti`, `bhuvaneshvari-jayanti`, `kamala-jayanti`,
`bhairavi-jayanti`, `annapurna-jayanti`, `shakambhari-navratri-begins`,
`shakambhari-purnima`, `lalita-panchami`, `kali-puja`, `sandhi-puja`,
`chaitra-ghatasthapana`, `sharad-ghatasthapana`, `ratha-saptami`,
`ganga-dussehra`, `mesha-sankranti`, `vrishabha-sankranti`,
`mithuna-sankranti`, `karka-sankranti`, `simha-sankranti`,
`kanya-sankranti`, `tula-sankranti`, `vrishchika-sankranti`,
`dhanu-sankranti`, `kumbha-sankranti`, `meena-sankranti`, `sakat-chauth`,
`mauni-amavasya`, `gangaur`, `kajari-teej`, `rishi-panchami`,
`vishwakarma-puja`, `saraswati-avahan`, `saraswati-puja`, `kojagara-puja`,
`vivah-panchami`, `gita-jayanti`, `parashurama-jayanti`, `sita-navami`,
`narasimha-jayanti`, `narada-jayanti`, `shani-jayanti`, `balarama-jayanti`,
`dattatreya-jayanti`, `swaminarayan-jayanti`, `vinayaka-chaturthi`,
`kalashtami`.

Each name above is the suffix of `/festival/<name>`. This is a product-scope
decision for the integrator: either overview routes are explicitly outside the
raster programme and the gate records that exclusion, or each receives a hero key.
Silently omitting all 77 cannot satisfy an “every festival/observance” hero claim.

### Separate Navadurga artwork routes

These 18 routes render `guide.form.image` (owned 900×900 WebP), not
`FestivalRasterHero`:

- `/festival/chaitra-navratri/day-{1..9}-<form>`
- `/festival/sharad-navratri/day-{1..9}-<form>`

The forms, in day order, are `shailaputri`, `brahmacharini`, `chandraghanta`,
`kushmanda`, `skandamata`, `katyayani`, `kalaratri`, `mahagauri`,
`siddhidatri`. Their existing dedicated gate passes.

## Reuse and relevance risks

Registry templates are planning metadata only; the raster component does not use
`template` or `subject` to select or verify a file. Reuse is extensive:

- `durga`: 10 keys; `murugan`: 5; `lakshmi`: 5; `shiva`: 3;
- `ayyappa`: 3; `ganesha`, `holi`, `rama`, `pitru`, `surya`, `savitri`,
  `vishnu`, `gudi`, and `krishna`: 2 each.

Shared visual language is reasonable, but named milestones need distinct
composition evidence. Highest-risk batches are:

1. Durga Puja Mahalaya (ancestor invocation), Shashthi, Saptami, Sandhi-bearing
   Ashtami, Navami, and Dashami visarjan; these must not become one generic Durga.
2. Monthly Skanda Shashti versus the annual six-day beginning, Soorasamharam
   victory, and Thirukalyanam marriage.
3. Ayyappa Mandala opening versus closing puja.
4. Maha Shivaratri versus monthly Shivaratri versus weekday Pradosh variants.
5. Akshaya Tritiya versus 25 named Ekadashis; a generic Vishnu image is not enough
   evidence of named-variant relevance.
6. Vat Savitri (Amavasya) versus Vat Purnima (Purnima).
7. Eclipse pair and four Chhath milestones.

`FESTIVAL_HERO_ART` also has three non-route/base registry keys:
`kandaSashtiAnnual`, `ayyappaMandala`, and `pongal`; `pongal` is a live route but
currently has no `vidhiKey`, while the two base guides are not direct page hero
keys. The registry therefore cannot be treated as route coverage.

## Remaining raster batches

Minimum guide-key completion is **54 files** (57 keys minus the 3 present), plus
replacement of the duplicate Sankashti/Ganesh pair. A defensible batching order:

1. Safety/timing distinctness: `suryaGrahan`, `chandraGrahan`, `chhath`,
   `karvaChauth`, `makarSankranti`, `mahaShivaratri`.
2. Durga/Navratri family: 10 distinct guide keys.
3. Skanda/Ayyappa milestones: 7 route-used keys.
4. Diwali cluster: `dhanteras`, `narakChaturdashi`, `govardhanPuja`, `bhaiDooj`,
   `varalakshmi`.
5. Major reviewed pages not covered above.
6. Recurring families and remaining long tail.
7. If row #29 truly means every named route, assign keys and art scope for the 77
   overview routes and decide whether 25 Ekadashi and 8 Pradosh named variants
   require variant-specific art rather than one family asset.

## Current gate results (exact run, 2026-07-28)

| Gate | Result |
|---|---|
| `festival-row-29.cjs` | **FAIL (exit 1):** uncaught `ENOENT` reading deleted `src/components/FestivalHeroImage.tsx` |
| `festival-hero-relevance.cjs` | **FAIL (exit 1):** first assertion, missing `public/festival-images/ahoiAshtami.svg` |
| `devotional-guide-quality.cjs` | **FAIL (exit 1):** 55 problems; stale expected inventory 50 vs 57; short/non-paragraph stories in Ayyappa and Skanda milestones and eclipses; eclipse story-list gaps; unapproved generic safety notes |
| `eclipse-sutak-pages.cjs` | **FAIL (exit 1):** missing legacy `suryaGrahan.svg` |
| `hindi-devotional-language.cjs` | PASS: 60 source files; 57 merged guides |
| `hindi-worship-glossary.cjs` | PASS: 7 core terms; 6 UI labels |
| `devotional-voice-english.cjs` | PASS: 9 patterns |
| `festival-deeplinks.cjs` | PASS |
| `festival-page-coverage.cjs` | PASS: 166 labels, 162 required, 4 shared, 181 unique routes, 18 Navadurga routes |
| `major-festival-pages.cjs` | PASS: 29 reviewed pages |
| `durga-puja-pages.cjs` | PASS: 6 pages |
| `navratri-timings.cjs` | PASS: 4 anchors plus route wiring |
| `navadurga-pages.cjs` | PASS: 18 routes/art and 2026 dates |
| `sankranti-punya.cjs` | PASS |
| `content-dates.cjs` | PASS: 10 Tier-2, 93 festival day-part, 12 Sankranti, 4 eclipse, Ayyappa and multi-year Skanda/Ayyappa anchors |
| `lakshmi-puja-timings.cjs` | PASS: Delhi and Mumbai 2026 |
| `skanda-ayyappa-pages.cjs` | PASS: 5 pages and 2025–2027 dates |

Passing here means the assertions currently implemented passed; it does not cure
the scope gaps below.

## Gate weaknesses and required non-vacuous checks

### Hero gate

Replace SVG assumptions with a manifest-driven raster gate that:

1. derives the route inventory from `FESTIVAL_PAGE_ROUTES`, not just
   `Object.keys(VRAT_VIDHI)`;
2. requires an explicit disposition for every route: raster guide hero, owned
   Navadurga art, approved shared-family asset, or documented temporary exclusion;
3. checks RIFF/WebP signature, exact 1280×480 dimensions, non-trivial byte size,
   decodability, and registry bilingual alt text;
4. hashes pixels/files and rejects duplicates unless an explicit approved
   shared-art allowlist names both routes and the devotional reason;
5. rejects `ganeshChaturthi === sankashti` as a permanent fixture;
6. verifies component wiring uses `FestivalRasterHero`, `.webp`, and `onError`
   visible/intentional behavior; it must not read a deleted component;
7. validates a reviewed subject manifest for named milestones. A string embedded in
   an unused SVG is not relevance proof.

Failure fixtures must be executed by the gate itself against pure validator
functions: missing file, 1×1 WebP, wrong aspect ratio, corrupt WebP, blank alt,
same hash for two unapproved keys, unknown route key, unaccounted overview route,
and the real Ganesh/Sankashti duplicate pair.

### Semantic/devotional gates

Current strengths: bilingual field presence, minimum story size, exact normalized
duplicates for three fields, a small banned-language list, and glossary spelling.
They do not test answer-before-data quality, Hindi meaning parity, named-variant
distinctness, copied paragraphs below exact-field level, ritual ordering,
contradictions, or whether prose actually identifies deity/tithi/fast/paran.

Required fixtures/checks:

- synthetic guide with 140 repeated words and three empty paragraphs must fail;
- 90%-similar paragraphs across two keys must fail (token shingles, not only exact
  whole-field equality);
- English says “nirjala” while Hindi says fruit/water allowed must fail via
  structured fasting-mode fields;
- a `verdict` that does not name the observance and give the plain-language action
  before technical detail must fail;
- monthly/annual, Amavasya/Purnima, opening/culmination and eclipse-type paired
  variants must have required contrast tokens in both languages;
- each puja/vidhi step needs a stable action/sequence shape; prose length alone
  cannot prove a usable ritual;
- ban product/research voice using fixture strings and assert each fixture is
  rejected, preventing an accidentally empty scan from passing;
- dynamically derive the expected guide inventory so a new key cannot make the
  quality gate stale, while separately pinning required product routes.

### Timing gates

`festival-row-29.cjs` checks mostly that a file or source substring exists. It does
not call every timing kind, prove the route renders it, or test location/date
variation. It also omits `grahan` from its supported set. `timing: null` is not a
proof that no key timing is needed.

Required fixtures/checks:

- table-drive every route's declared timing contract and fail unknown kinds,
  including an explicit tested `grahan` contract;
- invoke the actual resolver with Delhi plus at least one non-IST and one
  high-latitude place; assert finite, ordered, local-time-labelled windows;
- mutation fixtures: end before start, same-minute non-zero ritual window,
  missing coordinates, invalid timezone, no event in scan range, DST boundary,
  and a route whose metadata declares timing but screen detail is absent;
- paired route anchors for all named variants whose deciding rule differs;
- assert display semantics (`parana`, moonrise, sunrise, sunset, Nishita,
  Ghatasthapana, eclipse/sutak, Sankranti punya) rather than source-code
  substrings;
- require at least two independent published anchors per timing family where
  available and record tolerance/source provenance.

## Closure condition for this lane

This audit is evidence, not a quality round and not implementation completion.
Row #29 cannot be called hero-complete until the chosen route scope is explicit,
the missing batches are present, the duplicate raster is replaced, and a raster
gate proves coverage, validity, uniqueness and reviewed relevance on the same tree
that passes the devotional and timing gates.
