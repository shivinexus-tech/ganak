# Aarti Phase-2 — Ranked Priority List (search-demand tiers)

**Owner scope 2026-08-01.** Backlog: `P2-FESTIVAL-AARTI-BREADTH`.
Standard/layout: `plans/festival-aarti-standard.md` (refrain-once + gold cue, deity-family
closer, Devanagari + English meaning, `{refrain, cue, stanzas}` shape).

**Principle:** add by **search demand, not completeness.** DrikPanchang carries ~81;
Ganak has 14. We are NOT trying to match 81 — we add the aartis people actually search
for, closing the gap toward ~35–40 where the demand concentrates (Goddesses, weekday
deities, modern-popular deities). "Reach all" audiences (diaspora + urban-India); learn
then pivot. **Audio deprioritised for now.**

Many Tier-1 entries are **deity aartis not tied to one festival** (Shani, Santoshi, Khatu Shyam…).
They belong on their own `/aarti/<slug>` page (see `P2-FESTIVAL-AARTI-FINDER`), optionally
surfaced by weekday, not forced onto a single festival guide.

Each aarti still cross-validated against 2–3 sources with per-aarti citations, gated by
`festival-aarti.cjs`, owner-skimmed. Closer follows the family rule; standalone deity
aartis may stand alone.

---

## Tier 1 — ✅ ENTERED 2026-08-20 (`CLAUDE-AARTI-TIER1-BREADTH-2026-08-20`)

All seven texts are in `src/data/aarti-texts.ts`, cross-validated with per-aarti citations in
`plans/festival-aarti-standard.md` §6, and covered by a new standalone-deity section in
`validation/festival-aarti.cjs` (7 aartis, 46 stanzas) that pins each refrain opening — the one
thing that must not drift, since a changed opening means a different hymn.

**Not yet done, and deliberately so:** these have no URLs of their own. They are deity aartis
rather than festival-specific ones, so their homes are the standalone routes in
`P2-FESTIVAL-AARTI-FINDER`, which is a separate unbuilt row. Until that lands they are entered
and validated but not yet reachable by a reader. Owner skim sign-off also still outstanding.

Original priority list below.

## Tier 1 — highest search · everyday/weekly · pan-India (do first)

| # | Aarti (first line) | Deity | Demand driver |
|---|--------------------|-------|---------------|
| 1 | *Jai Jai Shri Shanidev* — जय जय श्री शनिदेव | Shani | Saturday vrat; very high, year-round |
| 2 | *Jai Santoshi Mata* — जय संतोषी माता | Santoshi Mata | Friday vrat; classic mass following |
| 3 | *Jai Saraswati Mata* — जय सरस्वती माता | Saraswati | Basant Panchami; students, exams |
| 4 | *Aarti Shri Surya* — जय जय जय आदित्य | Surya | Sunday, Chhath, Ratha Saptami |
| 5 | *Shyam Baba aarti* — श्री श्याम आरती | Khatu Shyam | Fast-growing modern following (Sikar/North) |
| 6 | *Vaishno Devi / Sherawali aarti* | Vaishno Devi | Navratri + year-round pilgrimage search |
| 7 | *Aarti Ganga Maiya* — ॐ जय गंगे माता | Ganga | Ganga aarti (Haridwar/Varanasi); very high search |

## Tier 2 — ✅ ENTERED 2026-08-20 (six of seven; see the weekday note)

Vishwakarma, Tulsi, Kubera, Annapurna, Radha and Kali are in `src/data/aarti-texts.ts`,
cross-validated with citations in `plans/festival-aarti-standard.md` §6 and covered by the
standalone-deity section of `validation/festival-aarti.cjs` — now **13 deity aartis, 83 stanzas**.

**Row 13, the weekday (Mon–Sun) set, is deliberately NOT entered as new text.** It is a bundling
job, not a sourcing one: six of the seven weekday deities are already covered — Monday Shiva,
Tuesday Hanuman, Wednesday Ganesh, Friday Santoshi/Lakshmi, Saturday Shani, Sunday Surya — so the
work is a mapping that only becomes meaningful once `P2-FESTIVAL-AARTI-FINDER` gives these URLs.
The one genuine gap is **Thursday (Brihaspati)**, which the primary anchor does not carry; it needs
a different source and its own confidence call, so it is left open rather than filled from a weaker one.

**Confidence:** HIGH for five. **Tulsi is MED** — it is a genuinely multi-version aarti and the
second source arranges it differently; it is the one most worth an owner ear.

As with Tier 1, none of these has a URL of its own yet. Owner skim sign-off outstanding.

Original priority list below.

## Tier 2 — strong · festival/weekly · broad

| # | Aarti | Deity | Demand driver |
|---|-------|-------|---------------|
| 8 | *Aarti Shri Vishwakarma* | Vishwakarma | Vishwakarma Puja; workers/industry |
| 9 | *Tulsi Mata aarti* — जय जय तुलसी माता | Tulsi | Kartik, Tulsi Vivah; daily Tulsi puja |
| 10 | *Kubera aarti* | Kubera | Dhanteras/Diwali wealth worship |
| 11 | *Annapurna aarti* | Annapurna | Kitchen/food; Annakut, Margashirsha |
| 12 | *Radha aarti* | Radha | Paired with Krishna; Radhashtami, Barsana |
| 13 | *Weekday aartis (Mon–Sun set)* | Vaar devtas | Bundled "din ki aarti" search set |
| 14 | *Kali aarti* | Kali | Kali Puja / Diwali night (Bengal + north) |

## Tier 3 — regional / festival-specific · seasonal

| # | Aarti | Deity | Demand driver |
|---|-------|-------|---------------|
| 16 | *Chhathi Maiya aarti* (+ Surya) | Chhathi Maiya | Chhath — very high but seasonal, east/Bihar |
| 17 | *Jagannath aarti* | Jagannath | Rath Yatra; Odisha + ISKCON |
| 18 | *Murugan / Kartikeya aarti* | Kartikeya | Skanda Sashti; South + Maharashtra |
| 19 | *Ayyappa aarti / Harivarasanam* | Ayyappa | Mandala–Makaravilakku; South |
| 20 | *Vindhyavasini / Jwala / regional Devi* | Devi forms | Regional Shakti pilgrimage search |

---

## Sequencing note
1. **Ship Tier 1 first** — biggest search return, and it forces the standalone-page
   pattern (these aren't festival-bound), so it validates `P2-FESTIVAL-AARTI-FINDER`.
2. **Tier 2** rounds out weekly/festival coverage.
3. **Tier 3** is seasonal — schedule each ahead of its festival window.

Reassess after Tier 1 ships using real search/analytics: double down on what pulls
traffic, drop what doesn't (the "learn then pivot" rule). Do not pre-build all 20 blind.
