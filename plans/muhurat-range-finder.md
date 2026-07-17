# Muhurat Date-Range Finder — Pass 1: Research + Architecture Findings

Status: FINDINGS FOR REVIEW — no code written. (2026-07-16)

## 1. What the app already has (~60% of the feature)

| Piece | State |
|---|---|
| `muhuratForDate(place, ayanamsa, y, m, d)` | Done. Full per-day factors: tithi, nakshatra, karana, lunar month/adhik, choghadiya day+night, abhijit, rahu/gulika/yamaganda. |
| `dayScore(info, category)` | Done. Category-aware scoring: tithi (purnima/amavasya/rikta), nakshatra (auspicious/avoid, Pushya wedding exception), weekday favorability per category, Guru/Ravi-Pushya yoga, Bhadra (Vishti) karana, good-choghadiya count. |
| Categories | 7 exist: purchase, venture, puja, travel, housewarming, wedding, general. |
| `muhuratShuddhi(info, category)` | Hard validity filter exists **but only `housewarming` has rules** (forbidden months/Chaturmas, weekday, tithi, nakshatra sets). |
| `muhuratScan(place, ayanamsa, y, month, category, day)` | Done for year / single-month / single-day scopes. Sorts by score. **No arbitrary from→to range.** |
| UI (`MuhuratHub` finder section) | Free-text query → parse → top-8 ranked days with quality chips + factors; top day gets lagna-based Panchaka Rahita windows + Abhijit. |
| `computeLagnaPanchaka` | Done — intraday shubh/dosha windows for any day. |

## 2. Broken/limited pieces discovered

- **AI query parse is dead code on the web.** `parseMuhuratQuery` fetches `api.anthropic.com` with no API key — worked only inside the Claude artifact sandbox. In a browser it always falls back to `regexParseQuery` (English keywords only, no Hindi). A backend proxy is a separate roadmap item; v1 should not depend on it.
- **`window.storage`** (tradition preference) is likewise a sandbox API — silently non-persistent on web. Unrelated to this feature; noted for later.
- Scope input is *only* free text. No structured date-range or activity picker — weak on phones, invisible in Hindi.

## 3. Competitive check (2026-07-16)

- **Drik Panchang** (leader): static chronological month-by-month lists per activity (weekday+nakshatra+tithi shuddhi), each date with a time window. No ranking, no custom range, no search. [Vehicle dates page](https://www.drikpanchang.com/shubh-dates/vehicle-buying-auspicious-dates-with-muhurat.html)
- **PoojaKaro Muhurat Finder**: dropdown event + single date → one recommendation. Not a range search.
- **mPanchang/AstroSage/Prokerala**: static yearly articles/tables.
- Newer small apps ("My Muhurat", Play Store tools) offer day-ratings but not ranked range search with time windows.

**Gap confirmed, slightly narrowed since the roadmap doc:** nobody mainstream does *activity + arbitrary date range → ranked best days with concrete time windows and a plain-language verdict*. That remains the wedge.

## 4. Recommended v1 approach

**UI (answer-before-data, phone-first):**
1. Activity chips (reuse the 7 categories; bilingual labels) + From/To date pickers (default: today → +60 days) + place from existing panchang state.
2. Keep the free-text box as secondary input (regex parse); hide the "AI parse" path until a backend proxy exists.
3. Output: **verdict card first** — "Best day: Thu 12 Nov · Uttara Phalguni · window 11:59 AM–12:54 PM" with plain-language why — then the ranked list (quality chips as today), then collapsible per-day detail (Panchaka windows, choghadiya, blockers).

**Engine (small, surgical):**
4. Extend `muhuratScan` to accept an explicit day-range (from/to ms or y-m-d pair), reusing `muhuratForDate` + `dayScore` + `muhuratShuddhi` unchanged. Month/year scopes become special cases.
5. Compute Panchaka/Abhijit windows for the top N (3) days, not just #1.

**Content (the real work): authentic shuddhi rules per category**
6. Add `MUHURTA_RULES` for: wedding, vehicle purchase, property registration, mundan, naming (namkaran), business opening. Sources: classical shuddhi sets as published by Drik (weekday/nakshatra/tithi/month per activity).
7. **Validate like Prashna was validated:** standalone Node script generates our valid-day list for 2026 Delhi per category and diffs against Drik's published 2026 dates as anchors. Ship only when the overlap is explainable.

**Out of scope for v1 (documented, not faked):** Chandra-bala/Tara-bala (needs user's moon sign — v2 with saved chart), Lagna-shuddhi per activity beyond existing Panchaka, AI parsing via backend.

## 5. Decisions needed before Pass 2 (UI)

1. Category list for v1 rules: the 6 above OK? Any to add/drop?
2. Default range 60 days — or 90?
3. Free-text box: keep visible or chips-only for v1?
