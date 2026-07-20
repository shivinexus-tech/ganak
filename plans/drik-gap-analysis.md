# Drik coverage gap analysis — 2026, New Delhi

**By:** Claude, 2026-07-19 · **Method:** Ganak's real 2026 output (extracted by running
`scanPanchangCalendar` through `validation/_load-app.cjs`, not read off a doc) diffed
against [Drik Panchang's 2026 Hindu calendar for New Delhi](https://www.drikpanchang.com/calendars/hindu/hinducalendar.html?geoname-id=1273294&year=2026).

---

## Headline findings

**1. Accuracy is excellent — zero date disagreements.**
Every one of the **~30 festivals Ganak and Drik both list falls on the identical
date.** Holika Dahan, Holi, Sheetala Ashtami, Ram Navami (Smarta), Hanuman Jayanti,
Akshaya Tritiya, Buddha Purnima, Rath Yatra, Guru Purnima, Hariyali Teej, Nag
Panchami, Onam, Raksha Bandhan, Janmashtami, Hartalika Teej, Ganesh Chaturthi, Radha
Ashtami, Navratri, Durga Ashtami, Maha Navami, Dussehra, Sharad Purnima, Karwa
Chauth, Ahoi Ashtami, Diwali, Maha Shivaratri, Vasant Panchami, Makar Sankranti —
all match. **The day-part/kala work paid off; the engine is sound.**

**2. Coverage is the problem, not correctness.** Ganak fires **~107** named festivals in
2026 (up from ~68 after Slice C+D); Drik lists roughly **100** observances — coverage
now meets or exceeds Drik's headline count.

**3. Ganak is genuinely ahead of Drik's Delhi page in places** — Thaipusam, Panguni
Uthiram, Vishu, Karthigai Deepam, Ayyappa Mandala (start + Pooja), both Gupt
Navratris, Lakshmi Panchami. The "beat Drik" bet is already partly real.

---

## P1 — launch-blocking gaps (widely observed, currently missing)

### The Diwali cluster — the single biggest hole
Ganak has **only "Diwali" (Nov 8)**. The surrounding days are the most-observed week
of the North Indian year and are entirely absent:

| Missing | Drik 2026 | Note |
|---|---|---|
| **Dhanteras** | Nov 6 | Major — buying gold/utensils |
| **Govatsa Dwadashi** | Nov 5 | Cluster start |
| **Kali Chaudas** | Nov 7 | Shakta; we already researched Kali Puja |
| **Narak Chaturdashi (Chhoti Diwali)** | Nov 8 | Major |
| **Govardhan Puja / Annakut** | Nov 10 | Major |
| **Bhaiya Dooj** | Nov 11 | Major |

### Other P1 misses — **batch 2 MERGED 2026-07-20** (`CURSOR-P1-CONTENT-02`)
| Was missing | Drik 2026 | Status |
|---|---|---|
| **Chaitra Navratri** | Mar 19 | ✅ |
| **Gudi Padwa / Ugadi** | Mar 19 | ✅ |
| **Vat Savitri Vrat** | May 16 | ✅ (Vaisakha Amavasya — North / purnimanta Jyeshtha) |
| **Vat Purnima Vrat** | Jun 29 | ✅ (nija Jyeshtha Purnima; adhik skipped) |
| **Kartika Purnima** | Nov 24 | ✅ |
| **Tulasi Vivah** | Nov 21 | ✅ |
| **Pongal** | Jan 14 | ✅ (label alongside Makar Sankranti) |
| **Anant Chaturdashi / Ganesh Visarjan** | Sep 25 | ✅ |
| **Pitru Paksha list bookends** | Sep 26 → Oct 10 | ✅ Purnima Shraddha + Sarva Pitru Amavasya |

### Slice C+D MERGED 2026-07-20 (`CURSOR-P1-CONTENT-03`)

| Festival | 2026 Delhi | Notes |
|---|---|---|
| Varalakshmi | Aug 28 | Last Friday ≤ Shravan Purnima |
| Mahalakshmi vrat culmination | Oct 2 | 15th day from Bhadrapada Shukla 8 |
| Vaikasi Visakam | May 30 | Vishakha in Vaikasi |
| Aadi Pooram | Aug 14 | Purva Phalguni in Aadi (last in solar month) |
| Arudra Darshan | Dec 24 | Ardra in Margazhi (December pick) |
| Kali Jayanti | Oct 3 | Distinct from Kali Puja on Diwali |
| Kalabhairav Jayanti | Dec 1 | Kartik Krishna Ashtami (amanta) |
| Skanda Sashti span | Nov 10 / 15 / 16 | Begins, Soorasamharam, Thirukalyanam |

### Slice E+F MERGED 2026-07-20 (`CURSOR-P1-CONTENT-04`)

| Group | Keys added |
|---|---|
| Mahavidya jayantis (9 beyond Kali) | Lalita, Tara, Matangi, Bagalamukhi, Chhinnamasta, Dhumavati, Bhuvaneshvari, Kamala, Bhairavi |
| Shakta labels | Shakambhari Navratri span, Lalita Panchami, Kali Puja, Sandhi Puja, Ghatasthapana ×2, Annapurna |
| Bengali Durga Puja | Mahalaya → Shashthi → Saptami → Ashtami → Navami (Bengal) → Dashami |
| P2 regional | Ratha Saptami, Ganga Dussehra, 12 monthly sankrantis, 4 grahan (2026) |
| P2 regional + jayantis | Sakat Chauth, Mauni Amavasya, Gangaur, Kajari Teej, Rishi Panchami, Vishwakarma, Saraswati Avahan/Puja, Kojagara, Vivah Panchami, Gita Jayanti; 8 jayantis (Parashurama, Sita, Narasimha, Narada, Shani, Balarama, Dattatreya, Swaminarayan) |

## P2 — significant, add after P1 — ✅ MERGED (`CURSOR-P2-CONTENT-01`, 2026-07-20)

Previously listed (now shipped):
Mauni Amavasya (Jan 18, generic amavasya) · Gauri/Gangaur (Mar 21) · Ganga Dussehra
(May 25) · Kajari Teej (Aug 31) · Rishi Panchami (Sep 15) · Vishwakarma
Puja (Sep 17) · Saraswati Avahan/Puja (Oct 16–17) · Kojagara Puja (Oct 25, same day as
our Sharad Purnima) · Vivah Panchami (Dec 14) · Gita Jayanti (Dec 20).

**Jayantis:** Parashurama (Apr 19), Sita Navami (Apr 25), Narasimha (Apr 30), Narada
(May 2), Shani (May 16), Balarama (Sep 16), Dattatreya (Dec 23), Swaminarayan (Mar 27).

**Eclipses — dates only (sutak UI still open):** Drik lists Surya Grahan (Feb 17,
Aug 12) and Chandra Grahan (Mar 3, Aug 28). Eclipses carry real observance rules
(sutak, what to avoid) and a panchang without them looks incomplete.

**Sankrantis:** all twelve monthly sankrantis now fire (Makar also labels Pongal).

---

## Still open after P2

- **Eclipse sutak UI** — grahan dates fire; dedicated sutak guidance is not yet a feature.

## Fair-comparison notes (not gaps)

- **Ekadashis** — Drik names each one (Shattila, Jaya, Vijaya, Amalaki, Kamada,
  Varuthini, Mohini, Apara, Nirjala, Yogini, Devshayani, Kamika, Putrada, Aja,
  Parsva, Indira, Papankusha, Rama, Devutthana, Utpanna, Mokshada). Ganak covers
  these via the recurring Ekadashi with per-month naming — **already handled.**
- **Monthly Purnima/Amavasya** — Ganak has recurring entries; Drik names them per
  month. Mostly fine, except where a named one is a major festival in its own right
  (Kartika Purnima — listed as P1 above).

---

## Recommended order of work

**Updated 2026-07-20** — items 1–2 below are **MERGED** (Diwali cluster + Chhath).

1. ~~Diwali cluster~~ ✅ MERGED (`phase1-content-diwali-chhath.md`)
2. ~~Chhath four-day sequence~~ ✅ MERGED (reuses sourced vidhi)
3. ~~Chaitra Navratri + Gudi Padwa/Ugadi~~ ✅ MERGED (`CURSOR-P1-CONTENT-02`)
4. ~~Vat Savitri, Kartika Purnima, Tulasi Vivah, Pongal, Anant Chaturdashi~~ ✅ MERGED
5. ~~Surface Pitru Paksha in the list~~ ✅ MERGED
6. ~~Varalakshmi + Mahalakshmi culmination~~ ✅ MERGED (`CURSOR-P1-CONTENT-CPLUS`)
7. ~~Tamil solar-nak (Vaikasi, Aadi Pooram, Arudra) + Shakta Jayantis (Kali, Kalabhairav)~~ ✅ MERGED
8. ~~P2 regional + jayantis~~ ✅ MERGED (`CURSOR-P2-CONTENT-01`)
9. Annual Skanda Shashti 6-day span — ✅ MERGED; eclipses as dedicated sutak feature remains open

Each needs: sourced date rule + deciding day-part (per `festival-daypart-audit.md`),
bilingual name/gloss in `src/data/festival-meta.ts`, and a 2026 regression anchor in
`validation/content-dates.cjs`.

## Confidence
🟢 for the date-match finding (computed directly from Ganak and compared to Drik's
published calendar) and for the presence/absence of each festival listed above.
🟡 on exact P1/P2 ranking — that's a product judgement about *your* audience, and the
owner should overrule it freely (e.g. if the diaspora persona makes Pongal or
Varalakshmi higher priority than I've placed them).
