# Festival row #29 — round 2 adversarial bilingual audit

Date: 2026-07-28
Main snapshot: `1fd42fc`
Source: read-only
Verdict: **Round-2 slice PASS for the seven rewritten guides; overall row #29 remains P0 FAIL.**

## What passed

The three Skanda milestones, two Ayyappa milestones and two eclipse guides now
have genuinely distinct route-specific EN/HI narratives:

| Guide key | Story evidence |
|---|---|
| `skandaSashtiBegins` | 216/214 EN words; 230/220 HI words; three paragraphs each |
| `skandaSashtiSoorasamharam` | 183/180 EN; 206/197 HI; three paragraphs each |
| `skandaSashtiThirukalyanam` | 173/178 EN; 184/195 HI; three paragraphs each |
| `ayyappaMandalaBegins` | 203/187 EN; 199/214 HI; three paragraphs each |
| `ayyappaMandalaPuja` | 184/192 EN; 189/197 HI; three paragraphs each |
| `suryaGrahan` | 192/194 EN; 212/216 HI; three paragraphs each |
| `chandraGrahan` | 184/196 EN; 204/208 HI; three paragraphs each |

All seven are free of `Ganak/गणक` product-meta. The Skanda pages now distinguish
vow commencement, Surapadman/Vel culmination and Deivanai's wedding. Ayyappa
distinguishes the public Mandala calendar from a consciously begun personal
vratham. Eclipse content distinguishes sacred Rahu narrative, astronomical
geometry, religious custom, medical accommodation and solar eye safety.

The strengthened gate is non-vacuous: it validates 57 dynamically discovered
guides, keeps the 140-word/three-paragraph minimum, checks duplicate narratives,
requires named EN/HI semantic anchors for these seven routes, and executes bad
in-memory fixtures for short, copied, identity-free and product-meta content.

## Focused gate evidence

```text
DEVOTIONAL GUIDE QUALITY PASSED
  (57 dynamically discovered bilingual guides;
   7 named-route semantic profiles; failure fixtures proven)
DEVOTIONAL VOICE ENGLISH PASSED (9 patterns checked)
HINDI DEVOTIONAL LANGUAGE PASSED
  (58 source files; 57 merged guides checked)
HINDI WORSHIP GLOSSARY PASSED
  (7 core terms; 6 UI labels)
SKANDA + AYYAPPA SEQUENCE PAGE REGRESSION PASSED
  (5 milestone pages; all 2025, 2026 and 2027 Delhi dates passed)
```

## Remaining P0 route/content gaps

Current counts are unchanged at the content layer:

- **57** merged guide keys.
- **77** named non-Navadurga routes still have `vidhiKey: null`.
- **24** named Ekadashi routes plus the generic `/festival/ekadashi` reuse one
  `ekadashi` guide.
- **7** weekday Pradosh routes plus generic `/festival/pradosh` reuse one
  `pradosh` guide.

The 77 metadata-only keys are:

`pongal`, `anantChaturdashi`, `tulasiVivah`, `mahalakshmiVrat`,
`pitruPakshaBegins`, `sarvaPitruAmavasya`, `kaliJayanti`,
`kalabhairavJayanti`, `vaikasiVisakam`, `aadiPooram`, `arudraDarshan`,
`govatsaDwadashi`, `kaliChaudas`, `lakshmiPanchami`, `hariyaliTeej`,
`nagPanchami`, `radhaAshtami`, `mahaAshtami`, `mahaNavami`,
`sharadPurnima`, `vasantPanchami`, `panguniUthiram`, `thaipusam`, `onam`,
`karthigaiDeepam`, `vishu`, `lalitaJayanti`, `taraJayanti`,
`matangiJayanti`, `bagalamukhiJayanti`, `chhinnamastaJayanti`,
`dhumavatiJayanti`, `bhuvaneshvariJayanti`, `kamalaJayanti`,
`bhairaviJayanti`, `annapurnaJayanti`, `shakambhariNavratriBegins`,
`shakambhariPurnima`, `lalitaPanchami`, `kaliPuja`, `sandhiPuja`,
`chaitraGhatasthapana`, `sharadGhatasthapana`, `rathaSaptami`,
`gangaDussehra`, `meshaSankranti`, `vrishabhaSankranti`,
`mithunaSankranti`, `karkaSankranti`, `simhaSankranti`,
`kanyaSankranti`, `tulaSankranti`, `vrishchikaSankranti`,
`dhanuSankranti`, `kumbhaSankranti`, `meenaSankranti`, `sakatChauth`,
`mauniAmavasya`, `gangaur`, `kajariTeej`, `rishiPanchami`,
`vishwakarmaPuja`, `saraswatiAvahan`, `saraswatiPuja`, `kojagaraPuja`,
`vivahPanchami`, `gitaJayanti`, `parashuramaJayanti`, `sitaNavami`,
`narasimhaJayanti`, `naradaJayanti`, `shaniJayanti`, `balaramaJayanti`,
`dattatreyaJayanti`, `swaminarayanJayanti`, `vinayakaChaturthi`,
`kalashtami`.

Canonical Ekadashi labels were corrected in `16f0ef4`, including removing the
earlier false Nrisimha mapping. That structural repair is good, but all 24 named
routes still lack their named katha, distinguishing meaning and route-specific
food/timing note. The same semantic gap remains for Ravi, Som, Bhaum, Budh, Guru,
Shukra and Shani Pradosh.

## Remaining P1 bilingual/content defects

### Product-meta still embedded in devotional copy

- `ekadashi.regional[0]`: “Ganak shows the selected tradition” /
  “गणक चुनी परम्परा दिखाता है”.
- `hanumanJ.meaning`: “Ganak's Chaitra Purnima page…” and Hindi equivalent.
- `buddhaPurnima.verdict`: “Ganak does not turn…”; the boundary is important,
  but should be stated in Buddhist/community terms rather than product voice.
- Diwali regional kathas contain “Ganak's Kali Puja guide”, “Ganak lists…” and
  “use Ganak's city times”. Navigation belongs in a separate link/callout, not
  inside a katha.

The strengthened product-meta rule currently applies only to the seven named
semantic profiles, so these older problems pass.

### Copied/template completion copy

- Identical `udyapan` text remains across **17** major guides:
  `holika`, `rangwaliHoli`, `ramNavami`, `hanumanJ`, `akshaya`,
  `guruPurnima`, `rakshaBandhan`, `dussehra`, `dhanteras`,
  `narakChaturdashi`, `govardhanPuja`, `bhaiDooj`, `gudiPadwa`, `ugadi`,
  `buddhaPurnima`, `rathYatra`, `kartikaPurnima`.
- Identical `udyapan` remains across all **6** Durga Puja day guides.
- Identical completion remains across the **3** Skanda sequence pages. Their
  narratives are now distinct, but completion should say whether the vow
  continues, may end after Soorasamharam, or completes after Thirukalyanam.

The current duplicate check covers `verdict`, `meaning`, `diet` and stories, not
`sankalpa`, `puja`, `paran` or `udyapan`.

### Translation-like Hindi and editorial disclaimers

Repeated phrases remain:

- `यह सरल भाव-संकल्प है, निर्धारित संस्कृत मंत्र नहीं` in Makar Sankranti,
  Savitri, monthly/annual Skanda, Masik Durgashtami and Varalakshmi copy.
- `एक सार्वभौमिक ... स्थापित नहीं है` across several parana/udyapan fields.
- `ayyappaMandala.diet`: `आधिकारिक मूल नियम` reads institutionally rather than
  naturally devotional.

Keep the qualification, but place the recurring “plain-language intention” note
once in the UI label. Rewrite completion directly: say what the household does,
then briefly state whose rule controls variations.

## Gate gaps exposed in round 2

1. Dynamic discovery is only `Object.keys(VRAT_VIDHI)` with a floor of 57. It
   does not derive expected content from `FESTIVAL_PAGE_ROUTES`; therefore 77
   metadata-only pages remain invisible.
2. Only seven routes have named semantic profiles. Adding or renaming a named
   festival/Ekadashi/Pradosh route does not require named story anchors.
3. Product-meta rejection is scoped to those seven, not every devotional field.
4. Duplicate detection omits `sankalpa`, `puja`, `paran` and `udyapan`.
5. The Hindi gate blocks a short vocabulary list but does not test naturalness,
   copied translation templates or route identity.
6. There is no fixture proving a route with `vidhiKey: null` or a named variant
   resolving only to a generic parent must fail.

## Round-2 disposition

Credit this as a successful adversarial verification of the seven-guide rewrite
and the first strengthened semantic fixture set. Do **not** count it as row #29
quality closure. The next implementation round should make the route registry the
source of truth, fail metadata-only named routes, add named Ekadashi/Pradosh
overlays, and broaden product-meta/duplicate checks before rewriting further
long-tail groups.
