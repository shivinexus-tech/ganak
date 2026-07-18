# Content Tier 2 — computed observances + Shakta/tantric gap research

Same workflow as Tier 1: **drafts pending owner verification.** These need *computation*
(nakshatra-in-solar-month, aparahna-tithi, or multi-day spans), not just a data row —
so they're a bigger build than Tier 1. Nothing ships unconfirmed.

Confidence: 🟢 high · 🟡 check · 🔴 genuinely unsure / varies by lineage — supply if you know.

**SCOPE reminder: Hindu only** (Buddha Purnima excepted, per owner).

---

## 2A — Pitru Paksha / Shraddha ✅ COMPUTATION BUILT 2026-07-18
`pitruPakshaDay(rise, set)` — detects the amanta Bhadrapada Purnima→Mahalaya
fortnight using **aparahna-kaal tithi** (midpoint of the 4th of 5 daytime parts).
Verified vs Drik: 2026 period Sep 26 (Bhadrapada Purnima / Purnima Shraddha) →
Oct 10 (Sarva Pitru / Mahalaya Amavasya). Special days detected: purnimaShraddha,
avidhavaNavami, ghataChaturdashi, mahalaya. **Wired as a universal Muhurat-finder
prohibition** (blocks ALL activity categories — verified: 15/15 fortnight days
blocked). All gates green.
Daily-screen surfacing DONE 2026-07-18: Pitru Paksha banner in the "today"
summary card (bilingual, names the special day + shraddha tithi + the "auspicious
work avoided" prohibition). Verified via computeTodayPanchang data-path (Node):
Sep 26 Purnima Shraddha, Oct 4 Avidhava Navami, Oct 10 Mahalaya, null outside.
(Live screenshot blocked by preview date-picker not accepting programmatic input —
a test-tooling limit, not a code issue; gates green, no console errors.)
Remaining (follow-ups, not blocking): (a) Bharani/Magha nakshatra-shraddha special
days; (b) show Pitru Paksha in the "coming up" festival list; (c) decide 16-day
(Purnima-incl.) vs 15-day (Pratipada-start) display label.
Original scope notes:

| Item | Placement | Notes | Conf |
|---|---|---|---|
| Pitru Paksha (whole period) | Bhadrapad Purnima → Ashwin (Mahalaya) Amavasya | mark the span | 🟢 |
| Sarva Pitru / Mahalaya Amavasya | Ashwin Amavasya | the most important shraddha day | 🟢 |
| Bharani Shraddha | tithi when Bharani nakshatra falls in the paksha | special | 🟡 |
| Avidhava Navami (Matru Navami) | Krishna Navami | shraddha for departed married women | 🟡 |
| Ghata/Ghayla Chaturdashi | Krishna Chaturdashi | for those who died by accident/weapon | 🟡 |
| **Prohibitions** | whole Pitru Paksha | no weddings/griha pravesh/new purchases — **should feed the Muhurat finder as a blocker**, like Chaturmas/Kharmas already do | 🟢 |

## 2B — Ayyappa Mandala Vratham ✅ CORE SPAN BUILT 2026-07-18
| Item | Placement | Notes | Conf |
|---|---|---|---|
| Mandala Vratham (41-day) | begins Vrischikam day 1; 41 inclusive days | ✅ start + Mandala Pooja listed; Daily card shows day X of 41 with plain guidance | 🟢 verified |
| Makaravilakku / Makara Jyoti | Makar Sankranti (Sun→Capricorn) | still generic Makar Sankranti in Ganak; Ayyappa-specific naming/detail remains | 🟢 |

2026 IST anchors: **17 Nov → 27 Dec (41 inclusive days)**, matching Drik and
Sabarimala's published 41-day observance. Detailed mala/vratham vidhi remains in
the separate sourced-vidhi track; the UI directs devotees to Guru Swami/temple
tradition instead of pretending one short rule is universal.

## 2C — Tamil Shaiva / Murugan (nakshatra-in-solar-month; CORE ENGINE BUILT 2026-07-18)
These fire on a **nakshatra within a solar month** — new computation vs the lunar-tithi
festivals. High value for South-Indian users; near-zero coverage today.

| Festival | Rule | Deity | Conf |
|---|---|---|---|
| Karthigai Deepam | Krittika nakshatra in Karthigai (Sun in Vrischika) | ✅ built + bilingual detail | 🟢 verified |
| Thaipusam | Pushya nakshatra in Thai (Sun in Makara) | ✅ built + bilingual detail | 🟢 verified |
| Panguni Uthiram | Uttara Phalguni nak. in Panguni (Sun in Meena) | ✅ built + bilingual detail | 🟢 verified |
| Arudra Darshan (Thiruvathirai) | Ardra nakshatra in Margazhi (Sun in Dhanu) | Nataraja/Shiva | 🟢 |
| Vaikasi Visakam | Vishakha nak. in Vaikasi (Sun in Vrishabha) | Murugan | 🟡 |
| Aadi Pooram | Purva Phalguni nak. in Aadi (Sun in Karka) | Andal/Shakta | 🟡 |
| Skanda Shashti (annual, 6-day) | Aippasi Shukla 1–6 (Soorasamharam on 6) | Murugan | 🟡 |

## 2D — Solar / regional (NOT covered)
| Festival | Rule | Notes | Conf |
|---|---|---|---|
| Chhath (Kartik) | Kartik Shukla Shashti (4-day: Nahay-Khay→Kharna→Sandhya Arghya→Usha Arghya) | Surya; sunrise/sunset arghya timing = the detail | 🟢 |
| Chaiti Chhath | Chaitra Shukla Shashti | smaller spring Chhath | 🟡 |
| Ratha Saptami | Magha Shukla Saptami | Surya | 🟢 |
| Vasant Panchami | Magha Shukla Panchami | **Saraswati — currently MISSING from app entirely, notable gap** | 🟢 |
| Ganga Dussehra | Jyeshtha Shukla Dashami | Ganga | 🟡 |
| Pongal / Makar Sankranti (Tamil) | Thai / Makara Sankranti (solar) | harvest | 🟢 |
| Onam (Thiruvonam) | Shravana nakshatra in Chingam (Sun in Simha) | ✅ built; principal Thiruvonam day | 🟢 verified |
| Vishu | first Vishukkani dawn after Mesha Sankranti | ✅ built; kept distinct from the Sankranti civil date | 🟢 verified |
| Ugadi / Gudi Padwa | Chaitra Shukla 1 | Deccan/Maharashtra new year (lunar — could be Tier 1) | 🟢 |

## 2E — Shakta / Tantric — "what else is missing" (your research ask)
The app has only generic Navratri + Dussehra + monthly Durgashtami/Kalashtami. Big Shakta
gaps below. **⚠️ Dus Mahavidya jayanti dates genuinely vary by lineage/source — all
marked 🔴; please supply the tradition Ganak should follow before I wire any of them.**

**Higher-confidence Shakta — VERIFIED ONLINE 2026-07-18 (Drik + multiple sources), ready to wire:**
| Observance | Placement | Notes | Conf |
|---|---|---|---|
| Shakambhari Navratri / Purnima | Pausha Shukla 8 (Banada Ashtami) → Pausha Purnima | a whole 8-day Shakta Navratri, widely omitted | 🟢 verified |
| Lalita Panchami (Upang Lalita) | Ashwin Shukla 5 (5th day of Sharad Navratri) | Lalita Tripurasundari | 🟢 verified |
| Kalabhairava Jayanti | Margashirsha Krishna 8 (= the Margashirsha Kalashtami; 2026 Dec 1) | Bhairava (Shaiva-tantric) | 🟢 verified |
| Annapurna Jayanti | Margashirsha Purnima (2026 Dec 4) | Annapurna | 🟢 verified |
| Kali Puja / Shyama Puja | Ashwin (amanta) Amavasya = Diwali night, Nishita-time (2026 Nov 8) | Bengali Shakta, DISTINCT from Lakshmi Puja — same night, different rite | 🟢 verified |
| Durga Ashtami + **Sandhi Puja** | Ashwin Shukla 8→9 juncture | needs sandhikaal (last 24m Ashtami + first 24m Navami) compute — peak Shakta moment | 🟢 (needs compute) |
| Ghatasthapana (Kalash Sthapana) | Navratri Pratipada (both Chaitra & Sharad) | ritual start of Navratri | 🟢 |
| Bengali Durga Puja day-sequence | Mahalaya→Shashthi→Saptami→Ashtami→Navami→Dashami | app has none of the named days | 🟡 |

**Dus Mahavidya Jayantis — RESOLVED 2026-07-18.** Drik publishes a canonical
"Dasha Mahavidya Jayanti" list, so these are NOT lineage-blocked after all — I use
**Drik as the documented default** (note in UI that some tantric lineages differ).
Verified placements (Drik, New Delhi):
| Goddess | Month · Paksha · Tithi | 2026 |
|---|---|---|
| Lalita / Shodashi | Magha · Shukla · Purnima | Feb 1 |
| Tara | Chaitra · Shukla · 9 | Mar 26 |
| Matangi | Vaishakha · Shukla · 3 | Apr 20 |
| Bagalamukhi | Vaishakha · Shukla · 8 | Apr 24 |
| Chhinnamasta | Vaishakha · Shukla · 14 | Apr 30 |
| Dhumavati | Jyeshtha · Shukla · 8 | Jun 22 |
| Kali (Jayanti — NOT Kali Puja) | Bhadrapada · Krishna · 8 | Sep 4 |
| Bhuvaneshvari | Bhadrapada · Shukla · 12 | Sep 23 |
| Kamala | Kartika · Krishna · Amavasya | Nov 8 |
| Bhairavi | Margashirsha · Shukla · Purnima | Dec 23 |
All Shukla ones safe to place; the two Krishna ones (Kali, Kamala) get date-verified
via the harness like the Tier-1 Krishna festivals. **Kali Jayanti ≠ Kali Puja** — Drik
puts Jayanti on Bhadrapada Krishna 8, Puja on Diwali. Wire as separate observances.

---

## Build-order note
2A (Pitru Paksha) is built. The reusable solar-month/nakshatra engine and its first
five festivals plus the Ayyappa span are now built and protected by seven exact 2026
anchors in `validation/content-dates.cjs`. Next Tamil uses of the engine are Arudra
Darshan, Vaikasi Visakam and Aadi Pooram; annual Skanda Shashti needs a six-day span.
