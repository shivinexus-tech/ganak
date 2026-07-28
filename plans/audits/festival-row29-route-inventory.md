# Row #29 — route, profile, timing and hero inventory

Audit lane: A (read-only source audit)
Date: 2026-07-28
Scope: every published festival, vrat/fast, recurring observance, named variant,
and Navadurga route registered by `FESTIVAL_PAGE_ROUTES`.

## Verdict

The registry has **181 valid direct routes**, but route existence is substantially
ahead of route quality:

| Metric | Count |
|---|---:|
| Direct routes | 181 |
| Substantive guide routes | 104 |
| Metadata-only routes | **77** |
| Routes without a subject hero mapping | **76** |
| Routes whose metadata declares no timing mode | **96** |
| Actual raster files | **3** (`diwali`, `ganeshChaturthi`, `sankashti`) |

This is a P0 content/identity defect, not a routing outage. Current gates prove
that a URL resolves and that selected reviewed pages have fields; they do not prove
that every named route has distinct, correct, useful content, correct named-variant
identity, relevant timing, or a raster hero.

## Machine-actionable defect codes

| Code | Severity | Required correction |
|---|---|---|
| `ID-EK-01` | P0 | Replace the incorrect 24-name Ekadashi month/paksha map in both metadata and engine; independently anchor all 24 variants and route slugs. |
| `ID-PR-01` | P0 | Make emitted weekday-Pradosh keys and route keys identical (`pradosh_0` versus `pradosh_Sunday`, etc.); test all seven weekdays from scan result to route. |
| `CONTENT-00` | P0 | Metadata-only page: add distinct bilingual answer-first guide, meaning, household vidhi, food/fast boundary, paran/completion, regional boundary, and safety where applicable. |
| `VARIANT-00` | P0 | Named route merely reuses a generic guide; add variant-specific EN/HI verdict, identity, story/rule boundary, and timing explanation without duplicating the generic page. |
| `TIME-00` | P0 | `timing:null` on a tithi/kala-sensitive route; assign and implement the correct local timing mode, or explicitly explain why no clock window applies. |
| `TIME-ALIAS` | P0 | Route is aliased to a family timing profile that cannot prove the named variant/date identity. |
| `HERO-00` | P0 | No hero-art registry entry. Add subject-specific registry data and raster asset. |
| `HERO-SVG` | P1 | Registry template exists but no route-specific raster exists; complete the raster batch and gate subject/file relevance. |
| `ALIAS-00` | P1 | Several named milestones share one URL. Keep only if the page visibly represents every milestone and deep-link intent; otherwise create stable milestone routes. |

## P0 identity defects

1. **The Ekadashi name table is factually confused.** Examples that cannot be
   accepted as named Ekadashi routes:
   `Vaisakha_Krishna_11 → Nrisimha Jayanti` (not an Ekadashi name);
   `Jyeshtha_Shukla_11 → Apara` (Apara is normally Krishna-paksha);
   `Shravan_Shukla_11 → Varuthini` (Varuthini is normally Chaitra Krishna);
   `Ashwin_Shukla_11 → Indira` (Indira is normally Krishna-paksha);
   `Magh_Shukla_11 → Safala`; `Ashwin_Krishna_11 → Vijaya`;
   `Kartik_Krishna_11 → Prabodhini`; and
   `Phalgun_Krishna_11 → Phalaharini`. The same table is duplicated in
   `src/engine/festivals.ts` and `src/data/festival-meta.ts`, so both calculation
   labels and routes preserve the defect. `ID-EK-01` applies to all 24 rows below.
2. **Weekday Pradosh identity cannot round-trip.** The engine emits
   `pradosh_0`…`pradosh_6`; the page registry contains
   `pradosh_Sunday`…`pradosh_Saturday`. Existing deeplink tests construct and
   resolve the latter directly, so they do not exercise a live scan result.
   `ID-PR-01` applies to all seven weekday routes below.
3. **Chhath aliases four labels to one route.** This may be a valid multi-day
   presentation, but direct intent for Nahay Khay, Kharna, Sandhya Arghya and
   Usha Arghya/Paran cannot be represented in the URL. Mark `ALIAS-00` until
   anchors or milestone routes are verified.

## Route inventory

Notation: `route → key [source; guide; timing; hero; defects]`.
`guide=family(X)` means the named route renders X's generic content.

### Recurring fasts and named variants (41 routes)

- `/festival/ekadashi → ekadashi [observance; substantive; parana; vishnu; HERO-SVG]`
- Ekadashi variants, all `[observance; family(ekadashi); parana; vishnu; ID-EK-01,VARIANT-00,HERO-SVG]`:
  `/festival/kamada-ekadashi → Chaitra_Shukla_11`;
  `/festival/mohini-ekadashi → Vaisakha_Shukla_11`;
  `/festival/apara-ekadashi → Jyeshtha_Shukla_11`;
  `/festival/devshayani-ekadashi → Ashadha_Shukla_11`;
  `/festival/varuthini-ekadashi → Shravan_Shukla_11`;
  `/festival/padma-ekadashi → Bhadrapad_Shukla_11`;
  `/festival/indira-ekadashi → Ashwin_Shukla_11`;
  `/festival/dev-uthani-ekadashi → Kartik_Shukla_11`;
  `/festival/mokshada-ekadashi → Margshirsh_Shukla_11`;
  `/festival/putrada-ekadashi-paush-shukla → Paush_Shukla_11`;
  `/festival/safala-ekadashi-magh-shukla → Magh_Shukla_11`;
  `/festival/amalaki-ekadashi → Phalgun_Shukla_11`;
  `/festival/pap-mochini-ekadashi → Chaitra_Krishna_11`;
  `/festival/nrisimha-jayanti → Vaisakha_Krishna_11`;
  `/festival/nirjala-ekadashi → Jyeshtha_Krishna_11`;
  `/festival/yogini-ekadashi → Ashadha_Krishna_11`;
  `/festival/putrada-ekadashi-shravan-krishna → Shravan_Krishna_11`;
  `/festival/aja-ekadashi → Bhadrapad_Krishna_11`;
  `/festival/vijaya-ekadashi → Ashwin_Krishna_11`;
  `/festival/prabodhini-ekadashi → Kartik_Krishna_11`;
  `/festival/utpanna-ekadashi → Margshirsh_Krishna_11`;
  `/festival/safala-ekadashi-paush-krishna → Paush_Krishna_11`;
  `/festival/shatila-ekadashi → Magh_Krishna_11`;
  `/festival/phalaharini-ekadashi → Phalgun_Krishna_11`.
- `/festival/pradosh → pradosh [observance; substantive; sunset; shiva; HERO-SVG]`
- Weekday variants, all `[observance; family(pradosh); sunset; shiva; ID-PR-01,VARIANT-00,HERO-SVG]`:
  `/festival/ravi-pradosh → pradosh_Sunday`;
  `/festival/som-pradosh → pradosh_Monday`;
  `/festival/bhaum-pradosh → pradosh_Tuesday`;
  `/festival/budh-pradosh → pradosh_Wednesday`;
  `/festival/guru-pradosh → pradosh_Thursday`;
  `/festival/shukra-pradosh → pradosh_Friday`;
  `/festival/shani-pradosh → pradosh_Saturday`.
- `/festival/sankashti → sankashti [observance; substantive; moonrise; ganesha; raster complete]`
- `/festival/vinayaka-chaturthi → vinayakaChaturthi [observance; metadata; none; none; CONTENT-00,TIME-00,HERO-00]`
- `/festival/skanda-shashti → skandaShashti [observance; substantive; none; murugan; TIME-00,HERO-SVG]`
- `/festival/masik-durgashtami → masikDurgashtami [observance; substantive; none; durga; TIME-00,HERO-SVG]`
- `/festival/kalashtami → kalashtami [observance; metadata; sunset; none; CONTENT-00,HERO-00]`
- `/festival/masik-shivaratri → masikShivaratri [observance; substantive; sunset; shiva; HERO-SVG]`
- `/festival/purnima → purnima [observance; substantive; none; moon; TIME-00,HERO-SVG]`
- `/festival/amavasya → amavasya [observance; substantive; none; pitru; TIME-00,HERO-SVG]`

### Metadata-only festival routes (75 routes)

Every route in this section has `CONTENT-00`. Unless a timing value is stated,
it also has `TIME-00`; every row has `HERO-00`.

- `none timing`: `/festival/pongal→pongal`,
  `/festival/anant-chaturdashi→anantChaturdashi`,
  `/festival/tulasi-vivah→tulasiVivah`,
  `/festival/mahalakshmi-vrat→mahalakshmiVrat`,
  `/festival/pitru-paksha-begins→pitruPakshaBegins`,
  `/festival/sarva-pitru-amavasya→sarvaPitruAmavasya`,
  `/festival/vaikasi-visakam→vaikasiVisakam`,
  `/festival/aadi-pooram→aadiPooram`,
  `/festival/arudra-darshan→arudraDarshan`,
  `/festival/lakshmi-panchami→lakshmiPanchami`,
  `/festival/hariyali-teej→hariyaliTeej`,
  `/festival/nag-panchami→nagPanchami`,
  `/festival/radha-ashtami→radhaAshtami`,
  `/festival/maha-ashtami→mahaAshtami`,
  `/festival/maha-navami→mahaNavami`,
  `/festival/sharad-purnima→sharadPurnima`,
  `/festival/vasant-panchami→vasantPanchami`,
  `/festival/panguni-uthiram→panguniUthiram`,
  `/festival/thaipusam→thaipusam`,
  `/festival/onam→onam`,
  `/festival/vishu→vishu`,
  `/festival/lalita-jayanti→lalitaJayanti`,
  `/festival/tara-jayanti→taraJayanti`,
  `/festival/matangi-jayanti→matangiJayanti`,
  `/festival/bagalamukhi-jayanti→bagalamukhiJayanti`,
  `/festival/chhinnamasta-jayanti→chhinnamastaJayanti`,
  `/festival/dhumavati-jayanti→dhumavatiJayanti`,
  `/festival/bhuvaneshvari-jayanti→bhuvaneshvariJayanti`,
  `/festival/bhairavi-jayanti→bhairaviJayanti`,
  `/festival/annapurna-jayanti→annapurnaJayanti`,
  `/festival/shakambhari-navratri-begins→shakambhariNavratriBegins`,
  `/festival/shakambhari-purnima→shakambhariPurnima`,
  `/festival/lalita-panchami→lalitaPanchami`,
  `/festival/durga-puja-mahalaya→durgaPujaMahalaya` is excluded here (substantive),
  `/festival/ratha-saptami→rathaSaptami`,
  `/festival/ganga-dussehra→gangaDussehra`,
  `/festival/mesha-sankranti→meshaSankranti`,
  `/festival/vrishabha-sankranti→vrishabhaSankranti`,
  `/festival/mithuna-sankranti→mithunaSankranti`,
  `/festival/karka-sankranti→karkaSankranti`,
  `/festival/simha-sankranti→simhaSankranti`,
  `/festival/kanya-sankranti→kanyaSankranti`,
  `/festival/tula-sankranti→tulaSankranti`,
  `/festival/vrishchika-sankranti→vrishchikaSankranti`,
  `/festival/dhanu-sankranti→dhanuSankranti`,
  `/festival/kumbha-sankranti→kumbhaSankranti`,
  `/festival/meena-sankranti→meenaSankranti`,
  `/festival/mauni-amavasya→mauniAmavasya`,
  `/festival/gangaur→gangaur`,
  `/festival/kajari-teej→kajariTeej`,
  `/festival/rishi-panchami→rishiPanchami`,
  `/festival/vishwakarma-puja→vishwakarmaPuja`,
  `/festival/saraswati-avahan→saraswatiAvahan`,
  `/festival/saraswati-puja→saraswatiPuja`,
  `/festival/vivah-panchami→vivahPanchami`,
  `/festival/gita-jayanti→gitaJayanti`,
  `/festival/parashurama-jayanti→parashuramaJayanti`,
  `/festival/sita-navami→sitaNavami`,
  `/festival/narasimha-jayanti→narasimhaJayanti`,
  `/festival/narada-jayanti→naradaJayanti`,
  `/festival/shani-jayanti→shaniJayanti`,
  `/festival/balarama-jayanti→balaramaJayanti`,
  `/festival/dattatreya-jayanti→dattatreyaJayanti`,
  `/festival/swaminarayan-jayanti→swaminarayanJayanti`.
- `midnight`: `/festival/kali-jayanti→kaliJayanti`,
  `/festival/kalabhairav-jayanti→kalabhairavJayanti`,
  `/festival/kali-chaudas→kaliChaudas`,
  `/festival/kamala-jayanti→kamalaJayanti`,
  `/festival/kali-puja→kaliPuja`,
  `/festival/sandhi-puja→sandhiPuja`,
  `/festival/kojagara-puja→kojagaraPuja`.
- `sunset`: `/festival/govatsa-dwadashi→govatsaDwadashi`,
  `/festival/karthigai-deepam→karthigaiDeepam`.
- `sunrise`: `/festival/chaitra-ghatasthapana→chaitraGhatasthapana`,
  `/festival/sharad-ghatasthapana→sharadGhatasthapana`.
- `moonrise`: `/festival/sakat-chauth→sakatChauth`.

### Substantive festival routes (47 routes)

These routes have a bilingual structured guide. They still require route-level
semantic/devotional review; `HERO-SVG` applies unless marked raster complete.

- `none timing`: `makar-sankranti→makarSankranti(surya)`,
  `vat-savitri→vatSavitri(savitri)`, `vat-purnima→vatPurnima(savitri)`,
  `kartika-purnima→kartikaPurnima(diya-river)`,
  `skanda-sashti-begins→skandaSashtiBegins(murugan)`,
  `skanda-sashti-soorasamharam→skandaSashtiSoorasamharam(murugan)`,
  `skanda-sashti-thirukalyanam→skandaSashtiThirukalyanam(murugan)`,
  `rangwali-holi→rangwaliHoli(holi)`, `ram-navami→ramNavami(rama)`,
  `hanuman-j→hanumanJ(hanuman)`, `akshaya→akshaya(vishnu)`,
  `guru-purnima→guruPurnima(guru)`, `raksha-bandhan→rakshaBandhan(rakhi)`,
  `ganesh-chaturthi→ganeshChaturthi(ganesha,raster complete)`,
  `dussehra→dussehra(rama)`, `bhai-dooj→bhaiDooj(lakshmi)`,
  `buddha-purnima→buddhaPurnima(buddha)`, `rath-yatra→rathYatra(jagannath)`,
  `hartalika-teej→hartalikaTeej(shiva-parvati)`,
  `sheetla-ashtami→sheetlaAshtami(sheetla)`,
  `ayyappa-mandala-begins→ayyappaMandalaBegins(ayyappa)`,
  `ayyappa-mandala-puja→ayyappaMandalaPuja(ayyappa)`,
  `durga-puja-mahalaya→durgaPujaMahalaya(pitru)`,
  `durga-puja-shashthi→durgaPujaShashthi(durga)`,
  `durga-puja-saptami→durgaPujaSaptami(durga)`,
  `durga-puja-ashtami→durgaPujaAshtami(durga)`,
  `durga-puja-navami→durgaPujaNavami(durga)`,
  `durga-puja-dashami→durgaPujaDashami(durga)`.
  Apply `TIME-00` to each until its lack of a clock window is explicitly justified.
- `navratri`: `chaitra-navratri→chaitraNavratri(durga)`,
  `sharad-navratri→sharadNavratri(durga)`,
  `gupt-navratri-ashadha→guptNavratriAshadha(durga)`,
  `gupt-navratri-magha→guptNavratriMagha(durga)`.
- `sunrise`: `gudi-padwa→gudiPadwa(gudi)`, `ugadi→ugadi(gudi)`,
  `narak-chaturdashi→narakChaturdashi(lakshmi)`,
  `govardhan-puja→govardhanPuja(krishna)`.
- `morning`: `varalakshmi→varalakshmi(lakshmi)`.
- `sunset`: `maha-shivaratri→mahaShivaratri(shiva)`,
  `holika→holika(holi)`, `dhanteras→dhanteras(lakshmi)`.
- `midnight`: `janmashtami→janmashtami(krishna)`.
- `moonrise`: `karva-chauth→karvaChauth(moon-karva)`.
- `stars`: `ahoi-ashtami→ahoiAshtami(mother-stars)`.
- `lakshmi-puja`: `diwali→diwali(lakshmi,raster complete)`.
- `chhath-sequence`: `chhath→chhath(chhath)`; also represents
  `chhathNahayKhay`, `chhathKharna`, and `chhathUshaArghya` (`ALIAS-00`).
- `grahan`: `surya-grahan→suryaGrahan(grahan-solar)`,
  `chandra-grahan→chandraGrahan(grahan-lunar)`.

### Navadurga day routes (18 routes)

All are `[navadurga; family(season Navratri); navratri; durga; VARIANT-00,HERO-SVG]`.
Their separate identity/iconography data exists, but the route-level guide is still
the parent Navratri vidhi; the strengthened gate must prove the day-specific
answer, deity, local date, puja focus, reading and hero alt actually render.

- Chaitra:
  `/festival/chaitra-navratri/day-1-shailaputri→chaitraNavratriDay1`;
  `day-2-brahmacharini→chaitraNavratriDay2`;
  `day-3-chandraghanta→chaitraNavratriDay3`;
  `day-4-kushmanda→chaitraNavratriDay4`;
  `day-5-skandamata→chaitraNavratriDay5`;
  `day-6-katyayani→chaitraNavratriDay6`;
  `day-7-kalaratri→chaitraNavratriDay7`;
  `day-8-mahagauri→chaitraNavratriDay8`;
  `day-9-siddhidatri→chaitraNavratriDay9`.
- Sharad:
  `/festival/sharad-navratri/day-1-shailaputri→sharadNavratriDay1`;
  `day-2-brahmacharini→sharadNavratriDay2`;
  `day-3-chandraghanta→sharadNavratriDay3`;
  `day-4-kushmanda→sharadNavratriDay4`;
  `day-5-skandamata→sharadNavratriDay5`;
  `day-6-katyayani→sharadNavratriDay6`;
  `day-7-kalaratri→sharadNavratriDay7`;
  `day-8-mahagauri→sharadNavratriDay8`;
  `day-9-siddhidatri→sharadNavratriDay9`.

## Gate gaps to close

1. Add a canonical identity fixture independent of app data for all 24 Ekadashis,
   all seven Pradoshs, major aliases, and regional named variants. A gate must not
   compare one duplicated bad table with another.
2. Add live scan → label → route → local occurrence round-trip tests. Current
   deeplink tests start at a hand-written URL, masking `ID-PR-01`.
3. Fail any published route that is metadata-only (`CONTENT-00`) or whose named
   route only presents generic-family content without a variant block.
4. Require route-appropriate timing semantics. `timing:null` cannot pass solely
   because a date exists. Sankrantis must expose ingress/Punya where applicable;
   birth festivals need their deciding kala; paran-bearing fasts need a local
   completion rule.
5. Require a raster file for every published route/family in the approved batch,
   plus subject/alt relevance. Counting registry templates is not raster coverage.
6. Validate English and Hindi separately for minimum substance, devotional voice,
   respectful terminology, no untranslated prose, and no copied contradictory
   instructions.
7. Add collision/alias tests that explicitly enumerate Chhath milestones,
   Putrada/Safala duplicates, Narasimha versus the erroneous Nrisimha route, Kali
   Jayanti/Kali Puja/Kali Chaudas, monthly/annual Skanda, and four Navratris.

## Read-only gate evidence

Executed on 2026-07-28:

```text
FESTIVAL PAGE COVERAGE PASSED
PASS  166 live openable labels inventoried
PASS  162 required labels covered
PASS  181 unique direct routes are valid
PASS  18 season-specific Navadurga routes are valid

FESTIVAL DEEPLINK REGRESSION PASSED
PASS  local Karva Chauth Delhi 2026-10-29 with moonrise
PASS  local Mokshada Ekadashi Delhi 2026-12-20 with paran

MAJOR FESTIVAL PAGE REGRESSION PASSED (29 reviewed pages)
DURGA PUJA PAGE REGRESSION PASSED (6 Bengal calendar pages)
NAVADURGA PAGE REGRESSION PASSED
NAVRATRI TIMING REGRESSION PASSED
SANKRANTI PUNYA KALA REGRESSION PASSED
```

Interpretation: the current gates are green while the P0 identity and completeness
defects above remain. They are regression checks for prior selected behavior, not
an acceptance suite for row #29.
