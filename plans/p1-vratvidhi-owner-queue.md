# P1 vrat-vidhi owner queue

**Status:** FIVE NEW GUIDE FAMILIES OWNER APPROVED; LOCAL INTEGRATION GREEN — 2026-07-20
**Scope:** the 16 previously shipped full bilingual guides plus the five newly
approved guide families. Vat Savitri and Vat Purnima use separate data objects so
their regional date verdicts cannot be silently blended.
**Owner sign-off means:** approve the clarity and tone shown to Ganak users. Source
verification is the research team's responsibility; the owner is not being asked
to validate ritual facts from memory.

## What is already proven

- All 16 objects contain a bilingual verdict, vidhi, diet guidance, simple
  sankalpa, puja, paran and udyapan section.
- The shared medical-safety warning appears before strict-fast instructions.
- Live production smoke on `ganak.pages.dev`: Pradosh, Purnima, Sankashti,
  Masik Shivaratri and Amavasya expanded successfully in both English and Hindi.
  All seven sections rendered; Sankashti showed the calculated local moonrise and
  Pradosh showed the local evening time. No browser console errors occurred.
- Ekadashi was additionally checked in English: its local Dwadashi paran and
  Dwadashi-end time rendered above the guide.
- Local final smoke after owner approval: Sharad Navratri rendered as its own
  guide in English and Hindi; Chhath day 2 opened the shared four-day guide in
  Hindi; its expanded steps and the separate health note rendered correctly.
- Hartalika's corrected summary and details had already passed the English
  browser smoke with no console errors.

## Sign-off table

Use the last column for one of: **Approve**, **Change wording**, or **Hold**.

| Observance | Wired | Research disposition | What still needs care | Owner sign-off |
|---|---:|---|---|---|
| Ekadashi | Yes | Strong: Drik timing/paran + ISKCON calendar | Keep Smarta/Vaishnava date and paran together; never silently mix them | |
| Pradosh | Yes | Strong core: Drik + Sri Maha Vallabha Ganapati temple | Diet forms vary; current text correctly labels them as household choices | |
| Sankashti Chaturthi | Yes | Strong core: Drik + Sri Maha Vallabha Ganapati temple | Moonrise is location-specific; cloudy-night fallback must remain plain | |
| Purnima / Satyanarayan | Yes | Strong core: Drik + Karya Siddhi Hanuman and Sri Somesvara temples | Distinguish the Satyanarayan-puja day from a generic sunrise-based Purnima fast | |
| Amavasya | Yes | Conservative and safe, but only one strong ritual source family | Do not imply one compulsory fast or universal DIY tarpan method | |
| Masik Shivaratri | Yes | Core date/Nishita supported; detailed monthly paran remains weak | Keep the next-morning rule labelled as household practice; never copy Maha Shivaratri's Chaturdashi-end rule automatically | |
| Maha Shivaratri | Yes | Strong: Drik vrat/paran + independent fasting guidance | The calculated next-morning window must remain the answer before the detailed ritual | |
| Chaitra Navratri | Yes | Strong core: Drik Chaitra calendar, Ghatasthapana and Nirnaya-Sindhu paran rule | Separate guide: nine-day Devi worship, Rama Navami and Chaitra paran | **Approve — 2026-07-20** |
| Sharad Navratri | Yes | Strong core: Drik Shardiya calendar, Durga Ashtami/Navami and Vijayadashami sequence | Separate guide: regional Durga Puja, Kanya Puja and Ayudha/Saraswati variants remain labelled | **Approve — 2026-07-20** |
| Karva Chauth | Yes | Strong Drik core; the earlier Government of India secondary URL currently returns an empty page | Replace the secondary cultural source; retain regional Sargi and household differences | |
| Ahoi Ashtami | Yes | Strong Drik support for stars vs moon; no independent ritual authority yet | Family must choose stars or moon; Ganak must not choose silently | |
| Hartalika Teej | Yes | Strong date/morning-puja rule; traditional fast is nirjala | State nirjala faithfully; keep medical guidance in a separate health note that does not redefine the vrat | **Approve — 2026-07-20** |
| Sheetla Ashtami / Basoda | Yes | Strong Drik custom + government food-safety sources | Regional date/food practice varies; safety always overrides the custom | |
| Ganesh Chaturthi | Yes | Strong Madhyahna/puja support; paran is not universal | Main-puja completion vs moonrise must stay a family choice | |
| Krishna Janmashtami | Yes | Strong: Drik Dharma-shastra alternatives + ISKCON manual | Current user copy is plain: choose one tradition, then use that tradition's date and paran | |
| Chhath (four-day sequence) | Yes | Strong core: Drik + Bihar Tourism | Family kitchen details remain regional; see the day-key wiring gap below | |

## Sources checked during this pass

These supplement the full source list already kept in `plans/vrat-vidhis.md`.

- [Sri Maha Vallabha Ganapati temple — Pradosham](https://nyganeshtemple.org/pradosham/)
  confirms Trayodashi Pradosha, Shiva/Nandi worship and breaking after the puja.
- [Sri Maha Vallabha Ganapati temple — Sankata Hara Chaturthi](https://nyganeshtemple.org/shc/)
  confirms the monthly Krishna-Chaturthi Ganesha observance and temple ritual.
- [Karya Siddhi Hanuman Temple — Purnima Satyanarayan Puja](https://www.dyccanada.org/event/guru-purnima/)
  and [Sri Somesvara Temple](https://srisomesvara.org/s/satyanarayanavratha-puja/)
  independently support the Purnima/Satyanarayan association.
- [Maharashtra Tourism — Ghatasthapana](https://maharashtratourism.gov.in/festivals/ghatasthapana/)
  independently supports Pratipada morning Ghatasthapana and regional Navratri forms.
- [Bihar Tourism — Chhath](https://tourism.bihar.gov.in/en/experiences/festivals-and-fairs/festivals/chhath-puja)
  confirms the four-day sequence, Kharna, sunset arghya, sunrise arghya and final paran.
- Drik's live pages were rechecked for Ahoi's stars/moon variants, Hartalika's
  Pratahkala puja, Maha Shivaratri's sunrise-to-Chaturdashi-end paran, and
  Janmashtami's Dharma-shastra vs modern paran distinction.

## Integration corrections completed

These were corrected after owner direction on 2026-07-20.

1. **Chhath:** all four calendar days now open the same connected four-day guide.
2. **Navratri:** Chaitra and Sharad now open separate detailed guides.
3. **Hartalika:** the guide now states the traditional nirjala rule directly. The
   separate health note is informational and does not change the vrat.

**Owner approval:** the shared health note and the three changed guides above were
approved for launch on 2026-07-20. Chhath wording was unchanged; only its four
calendar-day connections were corrected.

## Five approved guide families being integrated

| Guide | Connection | Owner sign-off |
|---|---|---|
| Skanda Shashti / annual Kanda Sashti sequence | Monthly Skanda Shashti plus annual days 1, 6 and 7 | **Approve — 2026-07-20** |
| Masik Durgashtami | Monthly Durgashtami card and page | **Approve — 2026-07-20** |
| Vat Savitri + Vat Purnima | Separate regional verdicts with shared household practice | **Approve — 2026-07-20** |
| Varalakshmi Vratam | Location-aware calendar date and full guide | **Approve — 2026-07-20** |
| Ayyappa Mandala Vratham | Public Mandala milestones plus personal-vow guidance | **Approve — 2026-07-20** |

The five families are represented by six guide objects because Vat Savitri and
Vat Purnima must remain distinct. All 10 relevant permanent routes passed English
and Hindi browser smoke with the place selector and full seven-section guide;
phone layout and existing Daily-card expansion also passed with no browser errors.
Production links will be added here only after the Cloudflare deployment passes.

### P1 — next expansion after the credible launch baseline

- Vinayaka Chaturthi monthly guide, distinct from annual idol installation.
- Anant Chaturdashi vrat and Anant-sutra guidance.
- Tulasi Vivah household puja guide.
- Mahalakshmi Vrat culmination-day guide, with the 16-day form clearly labelled
  as a regional/community variant.
- Sharad Purnima/Kojagari guide.
- Gupt Navratri safe public-devotion guide; advanced tantric practice must route
  to a qualified lineage teacher, not appear as DIY steps.

## Owner review status

The owner approved the wording changed by this correction task: separate Chaitra
and Sharad Navratri guides, the Hartalika nirjala wording, and the shared health
note. No further owner decision is required to merge this correction. Blank rows
remain available for a later whole-library copy review; they do not reopen this
approved correction.

No further wording decision is required for the five guide families above unless
the production website review reveals a change the owner wants.
