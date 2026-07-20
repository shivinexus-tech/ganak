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

**2. Coverage is the problem, not correctness.** Ganak fires **37** festivals in 2026;
Drik lists roughly **100** observances. The gap is concentrated in mainstream,
heavily-observed festivals — several would be conspicuous at launch.

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

### Other P1 misses
| Missing | Drik 2026 | Why it matters |
|---|---|---|
| **Chhath Puja** | Nov 15 | Tens of millions (Bihar/UP/Jharkhand). **Vidhi content already written — just no calendar entry.** Cheapest P1 win. |
| **Chaitra Navratri** | Mar 19 | We list Sharad Navratri but not Chaitra — half the Navratris missing |
| **Gudi Padwa / Ugadi** | Mar 19 | Maharashtra + Deccan new year |
| **Vat Savitri Vrat** | May 16 | Major married-women's vrat |
| **Vat Purnima Vrat** | Jun 29 | Western-India variant of the above |
| **Kartika Purnima** | Nov 24 | Dev Deepawali / Guru Nanak Jayanti |
| **Tulasi Vivah** | Nov 21 | Major Vaishnava |
| **Pongal** | Jan 14 | Major Tamil (we fire Makar Sankranti that day but not Pongal) |
| **Anant Chaturdashi / Ganesh Visarjan** | Sep 25 | Closes the Ganesh festival |
| **Pitru Paksha in the festival list** | Sep 27 → Oct 10 | Engine computes it and shows a banner, but "Pitrupaksha Begins" and "Sarva Pitru Amavasya" never appear as list entries |

---

## P2 — significant, add after P1

Ratha Saptami (Jan 25) · Sakat Chauth (Jan 6, currently only a generic Sankashti) ·
Mauni Amavasya (Jan 18, generic amavasya) · Gauri/Gangaur (Mar 21) · Ganga Dussehra
(May 25) · **Varalakshmi Vrat (Aug 28)** — already researched, needs the "Friday before
Shravana Purnima" rule · Kajari Teej (Aug 31) · Rishi Panchami (Sep 15) · Vishwakarma
Puja (Sep 17) · Saraswati Avahan/Puja (Oct 16–17) · Kojagara Puja (Oct 25, same day as
our Sharad Purnima) · **Kalabhairav Jayanti (Dec 1)** — already researched ·
Vivah Panchami (Dec 14) · Gita Jayanti (Dec 20).

**Jayantis:** Parashurama (Apr 19), Sita Navami (Apr 25), Narasimha (Apr 30), Narada
(May 2), Shani (May 16), Balarama (Sep 16), Dattatreya (Dec 23), Swaminarayan (Mar 27).

**Eclipses — a category we have nothing for:** Drik lists Surya Grahan (Feb 17,
Aug 12) and Chandra Grahan (Mar 3, Aug 28). Eclipses carry real observance rules
(sutak, what to avoid) and a panchang without them looks incomplete.

**Sankrantis:** we fire only Makar. Drik names all twelve monthly sankrantis. Mesha
Sankranti (Apr 14, solar new year) is the notable one.

---

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
3. **Chaitra Navratri + Gudi Padwa/Ugadi** — `CODEX-P1-CONTENT-02` slice A
4. **Vat Savitri, Kartika Purnima, Tulasi Vivah, Pongal, Anant Chaturdashi** — slice A
5. **Surface Pitru Paksha in the list** — slice B
6. **Varalakshmi + Mahalakshmi culmination** — slice C
7. Then P2 + Tamil/Shakta slice D; eclipses as their own feature

Each needs: sourced date rule + deciding day-part (per `festival-daypart-audit.md`),
bilingual name/gloss in `src/data/festival-meta.ts`, and a 2026 regression anchor in
`validation/content-dates.cjs`.

## Confidence
🟢 for the date-match finding (computed directly from Ganak and compared to Drik's
published calendar) and for the presence/absence of each festival listed above.
🟡 on exact P1/P2 ranking — that's a product judgement about *your* audience, and the
owner should overrule it freely (e.g. if the diaspora persona makes Pongal or
Varalakshmi higher priority than I've placed them).
