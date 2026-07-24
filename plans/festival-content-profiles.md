# Festival content profiles — research → UI → copy

**Owner direction 2026-07-24.** Worship pages must show what households actually need first (often **muhurat**), then vidhi — not essay copy alone.

## Why Diwali felt useless

Research existed (`plans/diwali-guide-research.md`) but the **page did not wire timings**:

- `FEST_META.diwali.timing` is **`null`** — so `FestivalGuideScreen` never calls `vratDetail` for sunset/pradosh.
- User only sees the civil date + “तिथि तय होने का आधार: प्रदोष काल”, not **Lakshmi Puja muhurat**.
- Bhaskar/TOI/Hindustan always lead with: **Pradosh Kaal**, **Lakshmi Puja muhurat** (Vrishabha/sthir lagna window), sometimes Amavasya tithi span — **city-specific**.

**Fix is two-part:** (1) festival **profile** says what to show; (2) **engine + UI** render it (like Navratri ghatasthapana or Karva moonrise).

---

## Better idea than “scrape 5 sites × 50 festivals” into prose

Do **not** paste site text into the app.

**What “don’t paste” means:** Profiles and sources are for **understanding** — deity, muhurat type, ritual order, popular names. Agents **rewrite** household guidance in Ganak’s voice (see `plans/festival-vrat-voice-research.md`). Never copy Bhaskar/Drik paragraphs into `vrat-vidhis.ts` or kathas; that risks copyright issues, wrong city times, and essay tone.

Use a **three-layer model**:

| Layer | File / code | Purpose |
|-------|-------------|---------|
| **Profile** | `plans/festival-profiles/<key>.md` | What this festival *is*, what UI **must** show, timing kind, sources cited |
| **Engine** | `src/engine/` | Computed muhurat (Drik-aligned); profile references timing kind |
| **Copy** | `src/data/vrat-vidhis.ts` etc. | Household vidhi in devotional voice; written **after** reading profile |

Agents read the **profile** before editing copy or UI. Gates check profile requirements where possible.

---

## Five reference sites (Hindi household voice + essentials)

Use for **understanding and checklist**, not copy-paste:

| Site | Best for |
|------|----------|
| [Drik Panchang](https://www.drikpanchang.com) | **Muhurat math**, tithi, Pradosh/Nishita — canonical benchmark for Ganak engine |
| [Dainik Bhaskar — Jeevan Mantra / Dharm](https://www.bhaskar.com/jeevan-mantra/dharm) | Natural Hindi framing, katha, what families expect on the page |
| [Navbharat Times / TOI Religion](https://navbharatimes.indiatimes.com) | Step-by-step पूजा विधि, city muhurat articles |
| [Live Hindustan — Astro](https://www.livehindustan.com/astrology) | Lakshmi/Chhath/Karva muhurat headlines |
| [ABP Live — Dharm](https://www.abplive.com/lifestyle/religion) | City-wise shubh muhurat tables |

**Rule:** Profile cites **Drik + one Hindi publisher** minimum per festival. Engine timings match Drik; copy tone matches Bhaskar-style guides (`plans/festival-vrat-voice-research.md`).

---

## Profile template (one file per festival/vrat)

Each `plans/festival-profiles/<key>.md` contains:

1. **One-line purpose** — what the user came for (e.g. “When to do Lakshmi-Ganesha puja tonight”).
2. **Must-show on page (UI contract)** — checkboxes; empty = page incomplete:
   - **Hero image** — respectful deity/festival art (`public/festival-images/<key>.webp`; bilingual alt in profile)
   - Local civil date
   - Primary muhurat window(s) with clock times
   - Paran / moonrise / sunrise if applicable
   - Tithi note if multi-day (Chhath, Navratri)
3. **Timing kind** — maps to engine/UI:

   | Kind | Example festivals | What to display |
   |------|-------------------|-----------------|
   | `lakshmi-puja` | diwali | Pradosh kaal + Lakshmi puja muhurat (sthir lagna ∩ pradosh) |
   | `sunset` | dhanteras, pradosh, mahaShivaratri | Evening puja from sunset |
   | `moonrise` | karvaChauth | Moonrise + parana |
   | `sunrise` | narakChaturdashi | Abhyanga snan window |
   | `navratri` | chaitra/sharad Navratri | Ghatasthapana + parana |
   | `chhath-sequence` | chhath | 4-day labels + sandhya/usha arghya times |
   | `sankranti` | makarSankranti | Punya kala |
   | `none` | rakshaBandhan | Date + vidhi only |

4. **Ritual essentials** — 5–8 bullets (materials, deity, order, paran rule) from sources.
5. **Regional forks** — Kali Puja vs Lakshmi, etc. (separate routes if needed).
6. **Copy voice notes** — link `festival-vrat-voice-research.md` section.
7. **Sources** — URLs + date accessed.
8. **Owner sign-off** — blank until reviewed.

---

## Rollout phases

| Phase | Festivals | Work |
|-------|-----------|------|
| **P0** | diwali, karvaChauth, chhath, hartalikaTeej | Profiles + **fix missing muhurat UI** (Diwali first) |
| **P1** | Dhanteras, Navratri, Janmashtami, Maha Shivaratri, Ekadashi | Profiles + timing kinds already partial |
| **P2** | Remaining ~40 guides | Profile per key; Hindi **tone** pass (not katha shortening) |
| **P3** | All festival/vrat pages | Hero images per profile (`public/festival-images/`) |

Track in `plans/task-log.md`. One agent owns `festival-profiles/` + engine timing; another owns `vrat-vidhis` copy — no overlap.

---

## Agent workflow

1. Read `plans/festival-profiles/<key>.md` (create from template if missing).
2. Read cited Drik + Bhaskar (or equivalent) for that festival only.
3. If **Must-show** timing is missing in UI → engine/UI task **before** more prose.
4. Rewrite copy from profile essentials + voice research.
5. Run gates; owner spot-checks high-traffic pages.

---

## Related docs

- `plans/festival-profiles/` — per-festival profiles (start with `diwali.md`)
- `plans/festival-vrat-voice-research.md` — Hindi/English tone
- `plans/diwali-guide-research.md` — earlier Diwali sources (merge into profile)
- `plans/hindi-release-checklist.md` — owner spot-check URLs
