# Content Tier 1 — verification sheet

## ✅ WIRED 2026-07-18 (locked by owner). 18 observances added.
Monthly: Vinayaka Chaturthi, Skanda Shashti, Masik Durgashtami. Annual: Lakshmi
Panchami, Buddha Purnima, Gupt Navratri (Ashadha + Magha), Rath Yatra, Hariyali
Teej, Nag Panchami, Hartalika Teej, Radha Ashtami, Maha Ashtami, Maha Navami,
Sharad Purnima, Ahoi Ashtami, Vasant Panchami, Sheetla Ashtami.
Dates verified via `validation/content-dates.cjs` against 2026 + 2027; 7 anchors
matched known dates; Krishna-paksha month-matching confirmed. Gates all green.
**Deferred (need more work, not shipped):** Mahalakshmi Vrat (span + culmination —
Tier 2 span logic); Varalakshmi Vratam (Friday-before-Purnima computed rule).
**KNOWN EDGE:** in Adhik-Maas years (2026 is one), Ashadha Gupt Navratri doesn't
fire — the app's leap-month festival handling needs an adhik-aware pass, and
adhik-year observance rules are tradition-dependent (owner call). Fires correctly
in normal years (verified 2027). Tracked for Tier 2.

---

# (original verification sheet below)

**Workflow:** Claude drafts placement + text below → **owner verifies/corrects each
row** → Claude wires the confirmed rows into `observancesFor()` (monthly) or the
`FESTIVALS` array (annual) + adds names/meta → runs gates → next batch.

**Nothing here is shipped until you confirm it.** Religious content — I've drafted
my best-known placement, but I am not the authority. Correct anything.

**SCOPE (owner, 2026-07-18): Hindu observances ONLY.** No Jain, Christian,
Islamic, or other-religion entries — target users are Hindu. **Exception (owner,
2026-07-18): Buddha Purnima IS included** (Buddha is a Dashavatar of Vishnu in
Hindu tradition; owner's explicit call). The general rule still excludes other
non-Hindu festivals.

## ⚠️ Two things I need you to check specifically

1. **Month reckoning = AMANTA.** The engine names months amanta (month ends at the
   *next* amavasya). For **Shukla-paksha** observances amanta = purnimanta, no issue.
   For **Krishna-paksha** ones the month label can differ from the North-Indian
   (purnimanta) name you may be used to — I've flagged every Krishna-paksha row with
   **(K — check amanta)**. Please confirm the month for those.
2. **Regional variant** — where an observance's date differs by region/tradition,
   tell me which one Ganak should show (or if we show multiple).

Confidence key: 🟢 high · 🟡 needs your check · 🔴 I'm unsure, please supply.

---

## Batch 1A — Complete the monthly recurring cycle
These fire *every month* (add to `observancesFor`). Gaps here show 12×/year.

| Observance | Paksha·Tithi | Deity | Fasting? | One-line gloss (draft) | Conf. | ✔ or fix |
|---|---|---|---|---|---|---|
| Vinayaka Chaturthi | Shukla 4 | Ganesha | yes | Monthly Ganesha vrat on the waxing 4th | 🟢 | |
| Skanda / Kanda Shashti | Shukla 6 | Kartikeya (Murugan) | yes | Monthly Murugan vrat on the waxing 6th | 🟢 | |
| Masik Durgashtami | Shukla 8 | Durga | yes | Monthly Durga vrat (distinct from Kalashtami) | 🟢 | |

## Batch 1B — Named annual observances you called out
Add to `FESTIVALS` array. **Amanta months.**

| Observance | Amanta month · Paksha · Tithi | Deity | Fast? | Gloss (draft) | Conf. |
|---|---|---|---|---|---|
| Radha Ashtami | Bhadrapad · Shukla · 8 | Radha | yes | Radha's appearance day | 🟢 |
| Sharad Purnima (Kojagari) | Ashwin · Shukla · 15 | Lakshmi | — | Kojagari Lakshmi puja; amrit-moon night | 🟢 |
| Maha Ashtami (Durga Ashtami) | Ashwin · Shukla · 8 | Durga | yes | Navratri's 8th — Durga Ashtami | 🟢 |
| Maha Navami | Ashwin · Shukla · 9 | Durga | yes | Navratri's 9th | 🟢 |
| Sheetla Ashtami (Basoda) | Krishna · 8 — 8 days after Holi (you confirmed K8) | Sheetla | yes | Cold-food day after Holi | 🟢 tithi confirmed; **amanta month set by code-match + date-verify, not hand-derived** |
| Ahoi Ashtami | Kartik · Krishna · 8 (you confirmed K8; 8 days before Diwali) | Ahoi Mata | yes | Mothers' fast for children | 🟢 tithi confirmed; month date-verified |
| Gupt Navratri (Magha) | Magh · Shukla · 1 | Shakti (tantric) | — | Winter "hidden" Navratri | 🟢 |
| Gupt Navratri (Ashadha) | Ashadha · Shukla · 1 | Shakti (tantric) | — | Monsoon "hidden" Navratri | 🟢 |
| Rath Yatra | Ashadha · Shukla · 2 | Jagannath | — | Puri chariot festival | 🟢 |
| Nag Panchami | Shravan · Shukla · 5 | Nagas | — | Serpent worship (North + most of India; Gujarat/Raj/Bihar use Krishna 5) | 🟢 verified |
| Buddha Purnima | Vaisakha · Shukla · 15 | Vishnu (Buddha avatar) | — | Full-moon of Vaishakh; owner-approved incl. | 🟢 |
| Lakshmi Panchami (Shri Vrat) | Chaitra · Shukla · 5 | Lakshmi | yes | Kalpadi tithi; Lakshmi worship | 🟢 verified |
| Hariyali Teej | Shravan · Shukla · 3 | Parvati | yes | Monsoon Teej for Parvati | 🟢 |
| Hartalika Teej | Bhadrapad · Shukla · 3 | Parvati | yes | Nirjala Teej for marital blessing | 🟢 |
| Mahalakshmi Vrat — **begins** | Bhadrapad · Shukla · 8 | Mahalakshmi | yes | Start of the 16-day vrat | 🟢 |
| Mahalakshmi Vrat — **Pujan/culmination** (the important standalone day) | 16th day = Krishna · 8 ("8th of Ashwin", purnimanta name) | Mahalakshmi | yes | Main Mahalakshmi pujan; many observe ONLY this day, not full 16 | 🟢 owner-flagged as key; month date-verified |
| **Varalakshmi Vratam** | **Friday before Shravan Purnima** (not a plain tithi) | Lakshmi | yes | S-Indian Lakshmi vrat; last Fri of Shravan Shukla | 🟢 verified — **needs computed rule, Tier 1.5** |

## Questions on scope for this first batch
- **Mahalakshmi Vrat** is a 16-day span (Bhadrapad Shukla 8 → Ashwin Krishna 8).
  Show as a single start-date entry now, or model the full span (Tier 2)?
- ~~Nag Panchami paksha~~ — RESOLVED: Shravan Shukla 5 (North + most), Gujarat/
  Raj/Bihar Krishna-5 variant noted. Verified vs sources 2026-07-18.
- **Varalakshmi Vratam** needs a small computed rule ("Friday before Shravan
  Purnima") — I'll add the logic when wiring, not just a data row. Confirm you
  want it in the launch batch.
- Any of your **core-audience** observances (you mentioned Shakta) missing from
  this first batch that you want prioritized in?

---

*Once you mark this batch, I wire the 🟢/confirmed rows in, gate-check, and bring
the next batch (more Shakta + regional + South-Indian). Vrat vidhis (C2) come as a
follow-on pass per observance once placements are locked.*
