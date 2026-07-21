# Magha and Ashadha Gupt Navratri — Deep Research Findings

> **2026-07-21 Codex takeover review:** Cursor's source collection is retained,
> but its later “integrated” guide proposal is **not approved for integration**.
> It silently blended a KBUF/Kamakhya anushthana with a Sadhana-app Navadurga
> program and redefined the latter's yagna as no-fire household worship. Ganak's
> religious-content policy requires those paths to remain explicitly labelled.
> The corrected copy candidates are in `vrat-gupt-navratri-magha.md` and
> `vrat-gupt-navratri-ashadha.md`.

**Status:** DRAFT — OWNER REVIEW REQUIRED

**Task:** `P0-GUPT-NAVRATRI-DEEP-RESEARCH`

**Research date:** 2026-07-21

**Scope:** Research and proposed safe public boundaries only. **No app code, no calendar changes, no wired vidhi.**

Owner-requested additional leads reviewed in this draft:
- [Rajarshi Nandy](https://www.youtube.com/channel/UChY48I4uKBGENQJbEeRt7QA) (YouTube + Kamakhya-upasaka materials)
- Tantra-focused online teaching (owner: “Tantra channel”) — mapped to **Tantra Talks** YouTube and the **Tantra Sadhana** app ecosystem
- **Om Swami** — [Sadhana app](https://sadhana.app/) (Nav Durga) and [Tantra Sadhana app](https://tantrasadhana.app/) (Dasha Mahavidya, Divyachar)

---

## Executive summary (plain language)

Gupt Navratri is real, calendar-backed, and **not** the same as Chaitra or Sharad Navratri. Ganak already lists both keys (`guptNavratriMagha`, `guptNavratriAshadha`) with thin metadata. This research confirms:

1. **Four Navratris** are widely attributed to **Mahakala Samhita** via [Drik’s Navratri overview](https://www.drikpanchang.com/navratri/info/navratri.html). Drik also records a **yuga-based emphasis** (Chaitra in Satya, Ashadha Gupt in Treta, Magha Gupt in Dvapara, Sharad in Kali). Ganak should cite Drik for dates and this framing, but must **not** treat Drik as sole authority for tantric procedure.
2. **Household-safe public content is possible** without inventing Mahavidya sequences: Ghatasthapana on Pratipada, simple Devi worship, lamp, a familiar public stotra or Durga Saptashati reading, the fasting rule actually taken in sankalpa, and charity. Particular mantras, Kumari puja, homa and secrecy rules must be labelled by family, temple or lineage instead of presented as universal.
3. **A stable universal nine-day Mahavidya order does not exist** in the sources reviewed. Drik’s own Ashadha Gupt calendar page lists **Navadurga** day names, not Mahavidyas. Popular articles and SEO guides invent day-by-day Mahavidya mappings. **Ganak must not publish one as universal.**
4. **Magha and Ashadha are separate observances** with different seasonal context and some lineage-specific names (e.g. Ashadha as **Gayatri Navratri** on Drik; **Varahi Navaratri** in at least one sadhaka lineage blog). Do not merge them into one guide.
5. **Advanced tantric content** (Mahavidya bija nyasa, nishitha bali, homa with tantric rites, purashcharana, Shav/Khanda-class sadhanas) is **initiation- or guru-dependent** in every credible source. Ganak may **mention** that sadhakas observe these privately under guidance; it must **not** publish step-by-step DIY instructions.
6. **Owner-named teachers split into two public paths:**
   - **Rajarshi Nandy** — Kamakhya-centred **10-day** Gupta Navaratri anushthana (not nine), with published document links; temple visit + kanya feeding on completion.
   - **Om Swami** — (a) **Sadhana app**: Nav Durga nine-day japa/yagna from Devi Bhagavatam, explicitly **no initiation required**; marketed for Chaitra and Magha Gupt Navratri; **Navadurga**, not Mahavidya. (b) **Tantra Sadhana app**: sequential **Dasha Mahavidya** Divyachar (inward worship), Secret Shrine during Navratris — a **different product and theology** from household Navadurga guides.

**Rejected recommendation (superseded 2026-07-21):** The Cursor draft interpreted an earlier discussion as permission to combine the KBUF completion pattern with the Sadhana-app Navadurga japa/yagna program. The source/policy audit found that this would silently blend distinct practices and misdescribe yagna. The corrected guides keep them separate:

- `plans/research/vrat-gupt-navratri-magha.md`
- `plans/research/vrat-gupt-navratri-ashadha.md`

Integration into `vrat-vidhis.ts` waits for owner approval of the corrected copy and for the exact local Ghatasthapana/parana timing gap to be fixed.

---

## 1. Textual basis — four Navratris

| Claim | Source | Type | Confidence | Notes |
|-------|--------|------|------------|-------|
| Hindu calendar has **four Navratris**: Sharad, Chaitra, Magha Gupta, Ashadha Gupta | [Drik — About Navratri](https://www.drikpanchang.com/navratri/info/navratri.html) | Panchang + cited samhita | High for Drik benchmark | Drik attributes list to **Mahakala Samhita** |
| Yuga emphasis: Satya→Chaitra; Treta→Ashadha Gupt; Dvapara→Magha Gupt; Kali→Sharad | Same Drik page | Secondary citation of samhita | Medium | Useful framing; verify against printed Mahakala Samhita khanda if owner wants primary-text sign-off |
| Mahakala Samhita survives in **fragmented khandas**, not one complete published volume | [Voice of Hinduism summary](https://www.voiceofhinduism.in/2021/01/mahakala-samhita-book-pdf.html) | Meta / library note | Medium | Supports caution: do not over-quote without khanda+verse |
| Gupt = “hidden/secret” because observance is private, not widely public | [AstroVed article](https://www.astroved.com/articles/meaning-and-importance-of-gupt-navratri); multiple festival articles | Living-tradition journalism | Medium | Corroborates product tone; not primary scripture |

**Ganak rule:** Cite Mahakala Samhita **via Drik’s attribution** until owner approves a specific khanda/verse from a printed Sanskrit edition (e.g. Ganganath Jha Campus publications mentioned in library catalogs).

---

## 2. Calendar evidence — Magha vs Ashadha (Delhi 2026 anchors)

Ganak engine keys already exist. Dates below match `plans/festival-daypart-audit.md` and Drik Ashadha calendar (fetched 2026-07-21).

### Magha Gupt Navratri 2026 (New Delhi)

| Item | Value |
|------|-------|
| Ganak key | `guptNavratriMagha` |
| Rule | Magha · Shukla · Pratipada · pratahkala |
| Ghatasthapana anchor | **19 Jan 2026** (audit) |
| Drik day structure | Nine Navratri nights; Ghatasthapana on Pratipada |
| Also called | Gupta / Gupt Navratri; Mahavidya-focused in popular Shakta discourse |

### Ashadha Gupt Navratri 2026 (New Delhi)

| Item | Value |
|------|-------|
| Ganak key | `guptNavratriAshadha` |
| Rule | Ashadha · Shukla · Pratipada · pratahkala |
| Ghatasthapana anchor | **15 Jul 2026** (audit; Pratipada) |
| Navami / Parana | **23 Jul 2026** (Drik calendar end) |
| Drik also calls it | **Gayatri Navratri** ([Ashadha Gupta page](https://www.drikpanchang.com/navratri/ashadha-gupta-navratri-dates.html)) |
| 2026 verification | Both Ganak's content anchor and Drik's New Delhi calendar return **15 Jul 2026**. The old `plans/content-tier1.md` Adhik-Maas warning is stale and should be removed in its next reserved planning edit. |

### Documented difference Magha vs Ashadha (beyond dates)

| Dimension | Magha | Ashadha |
|-----------|-------|---------|
| Season | Winter (Magha) | Monsoon (Ashadha) |
| Drik yuga emphasis | Dvapara yuga’s primary Navratri | Treta yuga’s primary Navratri |
| Popular names | Magha Gupta Navratri | Ashadha Gupta / Gayatri Navratri (Drik) |
| Regional lineage name | — | **Varahi Navaratri** — one sadhaka lineage presents Ashadha Gupt with Varahi as presiding goddess ([Sujata Nandy blog](https://www.sujatanandy.com/ashadha-gupt-navarathri/)) |
| Temple spotlight (journalism) | Ujjain Harsiddhi / Mahavidya discourse in [News18 2024 piece](https://www.news18.com/lifestyle/magha-gupta-navratri-2024-priest-explains-the-ideal-steps-to-worship-goddess-durga-8760674.html) | General Shakta/sadhaka observance; less single-temple dominance in sources reviewed |

**No source reviewed establishes a different tithi rule** between Magha and Ashadha — both are Shukla Pratipada starts. Difference is **season, yuga framing, and lineage emphasis**, not calendar math.

---

## 3. Practice claim ledger

| # | Claim | Source | Type | Confidence | Contradiction / caveat |
|---|-------|--------|------|------------|------------------------|
| 1 | Ghatasthapana on Pratipada begins Navratri | Drik Navratri pages; Katyayani Kalpa cited by Drik | Panchang + kalpa ref | High | Same rule as other Navratris |
| 2 | Nine nights; parana after Navami | Drik Ashadha 2026 calendar | Panchang | High | Rajarshi Nandy teaches **10-day** Kamakhya anushthana — label as **lineage variant** |
| 3 | Worship is often described as **private/secret** (gupt) | AstroVed; Times of India; Chamunda Swamiji site | Journalism + guru teaching | Medium | Keep a sadhaka's mantra/count private where that tradition requires it; do not invent a universal secrecy rule for every household prayer |
| 4 | Householders may do lamp, fast, Saptashati, simple Devi puja | Drik observance list; HinduTone; Boldsky | Panchang + journalism | Medium | Does not replace tantric path for initiated sadhakas |
| 5 | **Navarna** (Chandi) mantra is used in Shakta/Navratri practice | Drik Saptashati materials; living traditions | Panchang + secondary sources | Medium | Do not prescribe it as Ganak's universal beginner mantra; use a familiar family prayer or stotra unless a complete public method is sourced |
| 6 | **Ten Mahavidyas** worshipped in Gupt Navratri | News18/Ujjain priest; AstroVed; many SEO articles | Journalism + priest interview | Medium for “Shakta sadhaka practice”; **Low as universal household rule** | Drik Ashadha calendar uses **Navadurga** names, not Mahavidyas |
| 7 | Stable **day 1 = Kali, day 2 = Tara…** across nine days | hindutone.com; prashnakundli.com; Times Now Hindi | SEO / festival journalism | **Low — do not use in Ganak** | Ten deities, nine nights; orders vary; no primary text cited |
| 8 | Nishitha (midnight–3 AM) especially powerful for Mahavidya | Chamunda Swamiji article | Guru teaching | Medium for tantric sadhaka path | Not household default |
| 9 | Casual devotees should **not** do full Mahavidya ritual without guidance | The Daily Jagran 2026 article | Journalism quoting common priestly advice | Medium | Aligns with Ganak policy |
| 10 | Kumari puja on Ashtami/Navami completes fast | AstroVed; Drik general Navratri | Mixed | Medium | Regional |
| 11 | Akhand jyot during Gupt observance | AstroVed | Journalism | Low-medium | Not seen on Drik; treat as regional/family |
| 12 | Magha observance at **Harsiddhi**, Ujjain — Deepmala, Mahavidya focus | News18 2024 | Temple journalism | High for **that temple** | Not universal household law |

---

## 4. Mahavidya matrix (nine nights × ten goddesses)

**Finding: Ganak must not wire a single day-by-day Mahavidya table.**

| Source | What it assigns per day | Stable? | Ganak use |
|--------|-------------------------|---------|-----------|
| [Drik Ashadha 2026 calendar](https://www.drikpanchang.com/navratri/ashadha-gupta-navratri-dates.html) | Navadurga (Shailputri → Siddhidatri) | Yes **within Drik’s Navratri template** | Safe for **calendar labels only** — but **misleading** if page title promises Mahavidya guide |
| hindutone.com / prashnakundli.com | Kali on Pratipada; vague mid-week; no full 10 | No | **Reject** for product |
| Times Now Hindi / Boldsky | Lists ten Mahavidyas; day mapping partial or Navadurga parallel | No | Mention-only in research |
| Chamunda Swamiji | Ten Mahavidyas as **sadhana themes**, not a published 9-day calendar | N/A | Guru path; no DIY |
| Tantra Sadhana app | Sequential **multi-week** Mahavidya worlds (Kali → Kamalatmika), not 9-night festival table | App game design | Cite as **optional seeker tool**, not calendar truth |
| Rajarshi Nandy | Kamakhya-centric **10-day** program | Lineage-specific | Separate **Kamakhya-upasaka** variant callout |

**Structural problem:** Ten Mahavidyas, nine nights. Sources either (a) use Navadurga instead, (b) skip one goddess, (c) extend to ten days (Nandy), or (d) assign multiple goddesses to one night without agreement.

---

## 5. Living-tradition leads (owner-requested)

### 5.1 Rajarshi Nandy

| Item | Detail |
|------|--------|
| Channel | [Rajarshi Nandy — YouTube](https://www.youtube.com/channel/UChY48I4uKBGENQJbEeRt7QA) |
| Sample video | [Magha Gupt Navaratri 2026](https://www.youtube.com/watch?v=0bmFoTHurso) (~127k views, Jan 2026) |
| Lineage framing | **Maa Kamakhya** upasana; links to [kamakhyabhairavaupasaka.com Gupta Navaratri Sadhana](https://kamakhyabhairavaupasaka.com/gupta-navarathri-sadhana/) |
| Duration | **10 days** of mantra japa (not nine) |
| Published household steps (video summary) | Ghatasthapana; daily mantra from team-provided document; naivedyam; Kamakhya stotram; after 10 days visit Devi temple, offer flowers, complete malas, **feed a little girl**; optional homa for those equipped |
| Initiation | Presented as followable via published anushthana document — still **Kamakhya lineage**, not universal Smarta rule |
| Ganak stance | **Label:** “Kamakhya-upasaka tradition (Rajarshi Nandy)” — link out; do not silently merge with generic household page |

### 5.2 “Tantra channel” — mapped sources

Owner said “Tantra channel.” Closest matches in scope:

| Name | URL | Relevance |
|------|-----|-----------|
| **Tantra Talks** (YouTube) | e.g. [Chaitra Navratri / Das Mahavidya promo](https://www.youtube.com/watch?v=JFBvqaYEMMo) | Mahavidya/sadhana audience; points to **Tantra Sadhana App** |
| **Tantra Sadhana App** | [tantrasadhana.app](https://tantrasadhana.app/) | Om Swami / VSF; Dasha Mahavidya; Secret Shrine on Navratris |
| **Tantra Sadhana blog** | [Celebrating Tantra Sadhana App](https://tantrasadhana.app/blog/celebrating-tantra-sadhana-app-and-tantric-worship) | Divyachar = inward/manas puja; Navratri Secret Shrine with daily Dhyan Shlok |

**Note:** This ecosystem is **not** the same as Rajarshi Nandy’s Kamakhya path or Drik’s Navadurga calendar labels.

### 5.3 Om Swami — Sadhana app vs Tantra Sadhana app

| Product | Focus | Gupt Navratri relevance | Initiation stated? | Ganak safe reference |
|---------|-------|----------------------|--------------------|--------------------|
| [Sadhana app — Nav Durga](https://launch.sadhana.app/navdurga/) | **Navadurga** program; evening japa + next-morning yagna | App-led Navratri program | **No initiation required** according to its own page; age 12+; vegetarian; menstruating women included | Optional named app path only. Its related public explanation defines yagna as a **fire offering**; Ganak must not replace it with ordinary lamp worship. |
| [Tantra Sadhana app](https://tantrasadhana.app/) | **Dasha Mahavidya** sequential sadhana; Shav/homa-class rites in app store description | Secret Shrine events on Navratris | App claims guided Divyachar for uninitiated seekers; **conflicts with conservative priestly advice** | Mention only with label: **“Om Swami / VSF Tantra Sadhana app — Mahavidya Divyachar path”**; do not reproduce rites |
| os.me courses | Devi Bhagavatam, Sri Vidya notes, sadhana advice essays | Background theology | Paid courses; advanced | Not festival vidhi |

**Critical distinction for Ganak:** Om Swami’s **Nav Durga** path aligns with **Navadurga** (compatible with Drik’s Ashadha calendar naming). His **Tantra Sadhana** path is **Mahavidya** and **must not** be presented as what every Gupt Navratri observer does.

---

## 6. Safe public content classification

| Element | Magha | Ashadha | Classification | Notes |
|---------|-------|---------|----------------|-------|
| What Gupt Navratri is (private nine-night Shakti observance) | ✓ | ✓ | **Safe household** | Bilingual overview |
| Four Navratris + Mahakala Samhita via Drik | ✓ | ✓ | **Safe household** | Cite Drik |
| Yuga emphasis (Dvapara/Treta) | ✓ | ✓ | **Safe household** | Optional detail |
| Ghatasthapana on local Pratipada muhurat | ✓ | ✓ | **Safe household** | Use Ganak place timing |
| Navadurga daily names (Drik order) | ✓ | ✓ | **Mention only** | Risk confusion with Mahavidya marketing |
| Lamp, sattvic food, simple Devi image, aarti | ✓ | ✓ | **Safe household** | |
| Familiar family Devi mantra or public stotra | ✓ | ✓ | **Safe household** | Do not assign a new initiated mantra through generic app copy |
| Durga Saptashati or Devi stuti reading | ✓ | ✓ | **Safe household** | No invented per-day Saptashati split unless owner adopts Chaitra/Sharad plan separately |
| Kumari puja | ✓ | ✓ | **Safe household** | Label regional |
| Privacy/discretion | ✓ | ✓ | **Mention only** | Label as a common sadhaka/lineage norm, not a universal requirement for every household prayer |
| Gayatri Navratri name (Ashadha) | — | ✓ | **Mention only** | Drik only |
| Varahi Navaratri (Ashadha) | — | ✓ | **Mention only** | One lineage; [Sujata Nandy](https://www.sujatanandy.com/ashadha-gupt-navarathri/) |
| Ten Mahavidyas as **season theme** | ✓ | ✓ | **Mention only** | No day order |
| Day-by-day Mahavidya puja | ✓ | ✓ | **Do not publish as DIY** | |
| Nishitha, bali, tantric homa, nyasa | ✓ | ✓ | **Do not publish as DIY** | Guru/temple only |
| Rajarshi Nandy 10-day Kamakhya anushthana | Magha lead | Ashadha likely similar | **Mention + link** | Lineage-specific |
| Om Swami Nav Durga app | ✓ | ✓ | **Mention + link** | Optional tool |
| Om Swami Tantra Sadhana app | ✓ | ✓ | **Mention + link** | Optional seeker path; not default |
| Ujjain Harsiddhi temple observance | Magha | — | **Mention only** | Regional temple |

---

## 7. Proposed page structure (not wired)

### Separate URLs (recommended)

- `/festival/magha-gupt-navratri` — overview + safe household section
- `/festival/ashadha-gupt-navratri` — overview + safe household section

**Do not** reuse the 18-page Chaitra/Sharad Navadurga+Saptashati template (`P0-NAVRATRI-18-SAPTASHATI` explicitly excludes Gupt).

### Section outline (both pages)

1. **Plain answer** — one private nine-night Shakti observance; not the public Garba/Durga-Puja Navratri.
2. **Local date & Ghatasthapana** — the local date exists; exact Ghatasthapana and Dashami-parana times are an identified engineering gap and must be added before launch copy relies on them.
3. **Who observes it** — sadhakas, Shakta households, regional temples; many Hindus never encounter it.
4. **Safe household path** — ghatasthapana, lamp, simple Devi worship, the fasting rule actually taken in sankalpa, a familiar family prayer/stotra, Saptashati reading, charity, and correctly calculated parana.
5. **Mahavidya & tantric note** — season treasured for Mahavidya sadhana; **ten goddesses, nine nights; no universal day order**; advanced practice under guru.
6. **Regional / lineage variants** (page-specific):
   - Magha: Dvapara yuga framing; Ujjain Harsiddhi mention; Kamakhya 10-day (Nandy).
   - Ashadha: Treta yuga framing; Gayatri Navratri (Drik); Varahi Navaratri (one lineage).
7. **Optional seeker resources** — links only, no endorsement: Rajarshi Nandy materials, Sadhana app Nav Durga, Tantra Sadhana app — each labelled.
8. **Health note** — separate block for fasting (reuse Ganak vrat pattern).

---

## 8. Corrected bilingual copy candidates

The original shared block was withdrawn because it weakened the distinction
between a full fast and sattvic food, prescribed a mantra too broadly, and claimed
that a local Ghatasthapana window was already shown. Use the season-specific,
reviewed English/Hindi verdicts and complete household paths in:

- `plans/research/vrat-gupt-navratri-magha.md`
- `plans/research/vrat-gupt-navratri-ashadha.md`

---

## 9. Owner decisions required before integration

| # | Decision | Options |
|---|----------|---------|
| 1 | Shared page | Approve or revise the corrected household path in the two reviewed guide files. It keeps the traditional nine-day fast rule clear and does not invent tantric steps. |
| 2 | Labelled variants | Decide whether first release shows short, clearly separated notes for KBUF/Kamakhya, Sadhana-app Navdurga, Mahavidya, and Ashadha Varahi/Gayatri paths. |
| 3 | Navadurga names | Drik may be shown as **calendar context** only; do not turn Gupt Navratri into the separate Chaitra/Sharad 18-page plan. |
| 4 | Local timing | Exact city-specific Ghatasthapana and Dashami parana must be built before copy tells users to follow a time “shown above”. The current metadata has `timing: null`. |
| 5 | 2026 calendar note | There is no missing Ashadha 2026 occurrence: both the engine anchor and Drik return **15 July 2026**. Remove the stale Adhik-Maas warning in a separately reserved planning edit. |

---

## 10. Source bibliography

| ID | Source | Accessed |
|----|--------|----------|
| S1 | [Drik — About Navratri](https://www.drikpanchang.com/navratri/info/navratri.html) | 2026-07-21 |
| S2 | [Drik — Ashadha Gupta Navratri 2026 calendar](https://www.drikpanchang.com/navratri/ashadha-gupta-navratri-dates.html) | 2026-07-21 |
| S3 | [Drik — Magha Gupta Navratri dates](https://www.drikpanchang.com/navratri/magha-gupta-navratri-dates.html) | 2026-07-21 (sign-in wall on fetch; audit + S2 family used) |
| S4 | [AstroVed — Gupt Navratri](https://www.astroved.com/articles/meaning-and-importance-of-gupt-navratri) | 2026-07-21 |
| S5 | [News18 — Magha Gupta Navratri 2024 / Ujjain](https://www.news18.com/lifestyle/magha-gupta-navratri-2024-priest-explains-the-ideal-steps-to-worship-goddess-durga-8760674.html) | 2026-07-21 |
| S6 | [The Daily Jagran — Mahavidya rules 2026](https://www.thedailyjagran.com/spiritual/magha-gupt-navratri-2026-who-can-worship-the-mahavidya-forms-of-maa-durga-know-rules-and-significance-10293185) | 2026-07-21 |
| S7 | [Rajarshi Nandy — Magha Gupt Navaratri 2026 (YouTube)](https://www.youtube.com/watch?v=0bmFoTHurso) | 2026-07-21 |
| S8 | [Kamakhya Bhairava Upasaka — Gupta Navaratri Sadhana](https://kamakhyabhairavaupasaka.com/gupta-navarathri-sadhana/) | 2026-07-21 |
| S9 | [Om Swami — Nav Durga Sadhana (Sadhana app)](https://launch.sadhana.app/navdurga/) | 2026-07-21 |
| S10 | [Tantra Sadhana App — blog](https://tantrasadhana.app/blog/celebrating-tantra-sadhana-app-and-tantric-worship) | 2026-07-21 |
| S11 | [Sujata Nandy — Ashadha Gupt Navarathri / Varahi](https://www.sujatanandy.com/ashadha-gupt-navarathri/) | 2026-07-21 |
| S12 | [Chamunda Swamiji — Gupt Navratri & Mahavidya](https://www.chamundaswamiji.com/gupt-navratrisadhanadivinefemininesecrets/) | 2026-07-21 |
| S13 | Ganak `plans/festival-daypart-audit.md` | 2026-07-21 |
| S14 | Ganak `plans/religious-content-policy.md` | 2026-07-21 |

---

## 11. Wording deviations / research gaps

- **Mahakala Samhita** primary verses for Magha/Ashadha procedures not extracted — only Drik’s summary used.
- **Rajarshi Nandy** anushthana PDFs behind site links — not fully ingested; video + landing page only.
- **“Tantra channel”** not uniquely identified; documented Tantra Talks + Tantra Sadhana app. Owner may clarify if a different channel was meant.
- **Om Swami** Gupt-specific written teaching on os.me not found; app landing pages used.
- The Magha 2026 Drik calendar and parana rule were re-checked during the Codex takeover. The start remains **19 Jan 2026**; full fast parana is in Dashami after Navami ends.

---

**Next step after owner review:** Approve or edit the corrected copy, then open a
separate integration task. Before that page can claim to show the applicable
Ghatasthapana/parana time, add and validate those city-specific calculations. Keep
this task separate from `P0-NAVRATRI-18-SAPTASHATI`.
