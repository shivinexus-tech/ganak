# Navadurga day pages + Durga Saptashati — source map

Status: implementation source record for `P0-NAVRATRI-18-SAPTASHATI`.
Scope: Chaitra and Sharad Navratri only. Magha and Ashadha Gupt Navratris are
explicitly excluded.

## Product decision

- Ship eighteen stable pages: one page for each of the nine Navadurga forms under
  Chaitra Navratri and another nine under Sharad Navratri.
- The same nine iconographically checked Goddess portraits may be reused between
  the two seasons; each page's words, date context and adjacent-day navigation are
  season-specific.
- A Navadurga form is attached to its Shukla tithi at local sunrise. A repeated
  tithi may therefore produce a two-date observance, while a skipped tithi may have
  no independent sunrise date. Ganak must explain that result instead of silently
  moving the Goddess to a different day.
- The household Saptashati option is scripture reading/listening from a trusted
  edition or translation. It does not instruct users to insert bija mantras,
  perform nyasa or conduct homa. Mantra-form/initiated parayana remains explicitly
  teacher- or lineage-led.

## Core textual and institutional sources

1. **Devi Kavacha, verses 3–5** — source of the ordered nine names: Shailaputri,
   Brahmacharini, Chandraghanta, Kushmanda, Skandamata, Katyayani, Kalaratri,
   Mahagauri and Siddhidatri.
   - Sanskrit Documents PDF:
     https://sanskritdocuments.org/doc_devii/durgAkavach-kn.pdf
2. **Incredible India, Ministry of Tourism — Navratri** — confirms that the nine
   days honour these nine named forms and records the pan-Indian seasonal context.
   - https://www.incredibleindia.gov.in/en/festivals-and-events/navratri
3. **Drik Panchang Navadurga pages** — day order, dhyana/prarthana and the visible
   iconographic attributes used for the commissioned Ganak artwork. Ganak does not
   copy Drik's copyrighted images.
   - https://www.drikpanchang.com/hindu-goddesses/parvati/durga/navdurga.html
   - Individual pages follow `navdurga-<name>.html` for all nine forms.
4. **Art of Living — Durga Saptashati: A Glorious Song to the Divine Mother** —
   records a complete nine-day, thirteen-chapter household reading arrangement:
   1; 2–4; 5–6; 7; 8; 9–10; 11; 12; 13.
   - https://www.artofliving.org/in-en/navratri/durga-saptashati-a-glorious-song-to-the-divine-mother
5. **Sri RajaRajeshwari Peetham — Sri Devi Mahatmyam** — confirms the text's three
   charitas (1; 2–4; 5–13), states that ritual/mantra sequences vary by Guru
   parampara, and documents the initiated interpretation of full Chandi parayana.
   This is the source for Ganak's clear boundary between accessible household
   reading/listening and initiated ritual recitation.
   - https://srirajarajeswaripeetham.org/sri-devi-mahatmyam/
6. **2026 date anchors**
   - Chaitra, Delhi: 19–27 March 2026, one civil sunrise-date per form.
     Secondary cross-check: Shri Ram Temple Kamarpal calendar and Drik Chaitra
     calendar.
   - Sharad, Delhi: Shailaputri 11 October; Brahmacharini 12; Chandraghanta 13;
     Kushmanda 14; Skandamata 15; Katyayani 16; Kalaratri 17–18 (Saptami repeats);
     Mahagauri 19; Siddhidatri 20. AstroSage's Delhi calendar is retained as the
     explicit repeated-tithi anchor; Ganak's existing `mahaAshtami` and
     `mahaNavami` anchors also place the relevant tithis on 19 October.
   - https://panchang.astrosage.com/festival/navratri/sharad-navratri?language=en

## Iconography specification used for original artwork

| Day | Form | Distinguishing attributes |
|---:|---|---|
| 1 | Shailaputri | Two arms; trident and lotus; crescent; white bull |
| 2 | Brahmacharini | Barefoot ascetic; two arms; japa mala and kamandalu |
| 3 | Chandraghanta | Tigress; bell-shaped half-moon; ten arms; trident, mace, sword, kamandalu, lotus, arrow, bow, mala, abhaya and varada |
| 4 | Kushmanda | Lioness; eight arms; kamandalu, bow, arrow, lotus, nectar pot, mala, mace and chakra |
| 5 | Skandamata | Lion and lotus seat; four arms; infant Skanda, two lotuses and abhaya |
| 6 | Katyayani | Lion; four arms; sword, lotus, abhaya and varada |
| 7 | Kalaratri | Dark complexion; unbound hair; donkey; four arms; sword, iron hook, abhaya and varada |
| 8 | Mahagauri | White garments; bull; four arms; trident, damaru, abhaya and varada |
| 9 | Siddhidatri | Lotus seat with lion association; four arms; gada, chakra, lotus and conch |

The portraits are devotional illustrations, not copies of a temple murti. Accessible
alt text must name the form and describe the same distinguishing attributes.

## Household worship boundary

Each page uses one repeatable panchopachara-scale sequence: prepare a clean place;
light a safe lamp; remember Ganesha and the family deity; offer water, fragrance,
flower, incense/lamp and simple naivedya to the day's Devi; recite the public name
mantra or prarthana; read/listen to the assigned Saptashati chapter(s); perform
aarti and distribute prasad. Existing family practice takes precedence.

The pages do **not** publish secret/initiated mantra, nyasa, mudra, homa or claims of
guaranteed worldly results. This boundary is respect for different traditions, not
a dismissal of those traditions.

## Nine-day reading plan shown on both day-1 pages

| Navratri day | Durga Saptashati chapters | Plain-language focus |
|---:|---|---|
| 1 | 1 | Madhu and Kaitabha; the opening charita |
| 2 | 2–4 | Mahishasura narrative and the gods' praise |
| 3 | 5–6 | Devi's manifestation and Dhumralochana |
| 4 | 7 | Chanda and Munda |
| 5 | 8 | Raktabija |
| 6 | 9–10 | Nishumbha and Shumbha |
| 7 | 11 | Narayani Stuti |
| 8 | 12 | Devi's assurance and phalashruti |
| 9 | 13 | Suratha and Samadhi receive Devi's grace |

This is labelled **one documented nine-day arrangement**, not the only valid
parayana order. The day-1 page directs users to retain the order printed in their
trusted edition or supplied by their teacher when it differs.
