# Content Tier 1 — verification sheet (owner to confirm before wiring)

**Workflow:** Claude drafts placement + text below → **owner verifies/corrects each
row** → Claude wires the confirmed rows into `observancesFor()` (monthly) or the
`FESTIVALS` array (annual) + adds names/meta → runs gates → next batch.

**Nothing here is shipped until you confirm it.** Religious content — I've drafted
my best-known placement, but I am not the authority. Correct anything.

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
| Rohini Vrat (Jain) | nakshatra-based | — | yes | *(Tier 2 — nakshatra, not tithi; flag if wanted)* | 🟡 | |

## Batch 1B — Named annual observances you called out
Add to `FESTIVALS` array. **Amanta months.**

| Observance | Amanta month · Paksha · Tithi | Deity | Fast? | Gloss (draft) | Conf. |
|---|---|---|---|---|---|
| Radha Ashtami | Bhadrapad · Shukla · 8 | Radha | yes | Radha's appearance day | 🟢 |
| Sharad Purnima (Kojagari) | Ashwin · Shukla · 15 | Lakshmi | — | Kojagari Lakshmi puja; amrit-moon night | 🟢 |
| Maha Ashtami (Durga Ashtami) | Ashwin · Shukla · 8 | Durga | yes | Navratri's 8th — Durga Ashtami | 🟢 |
| Maha Navami | Ashwin · Shukla · 9 | Durga | yes | Navratri's 9th | 🟢 |
| Sheetla Ashtami (Basoda) | Chaitra · Krishna · 8 **(K — check amanta)** | Sheetla | yes | Cold-food day after Holi | 🟡 |
| Ahoi Ashtami | Kartik · Krishna · 8 **(K — check amanta)** | Ahoi Mata | yes | Mothers' fast for children | 🟡 |
| Gupt Navratri (Magha) | Magh · Shukla · 1 | Shakti (tantric) | — | Winter "hidden" Navratri | 🟢 |
| Gupt Navratri (Ashadha) | Ashadha · Shukla · 1 | Shakti (tantric) | — | Monsoon "hidden" Navratri | 🟢 |
| Rath Yatra | Ashadha · Shukla · 2 | Jagannath | — | Puri chariot festival | 🟢 |
| Nag Panchami | Shravan · Shukla · 5 | Nagas | — | Serpent worship | 🟡 (region: some Krishna 5) |
| Hariyali Teej | Shravan · Shukla · 3 | Parvati | yes | Monsoon Teej for Parvati | 🟢 |
| Hartalika Teej | Bhadrapad · Shukla · 3 | Parvati | yes | Nirjala Teej for marital blessing | 🟢 |
| Mahalakshmi Vrat | starts Bhadrapad · Shukla · 8 | Mahalakshmi | yes | 16-day Lakshmi vrat *(span — may be Tier 2)* | 🟡 |

## Questions on scope for this first batch
- **Mahalakshmi Vrat** is a 16-day span (Bhadrapad Shukla 8 → Ashwin Krishna 8).
  Show as a single start-date entry now, or model the full span (Tier 2)?
- **Nag Panchami** — Shukla or Krishna 5 depends on region. Which for Ganak?
- Any of your **core-audience** observances (you mentioned Shakta) missing from
  this first batch that you want prioritized in?

---

*Once you mark this batch, I wire the 🟢/confirmed rows in, gate-check, and bring
the next batch (more Shakta + regional + South-Indian). Vrat vidhis (C2) come as a
follow-on pass per observance once placements are locked.*
