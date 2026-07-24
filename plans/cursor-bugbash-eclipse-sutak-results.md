# Eclipse + Sutak bug bash results

**Tester:** Claude (Opus 4.8), Claude Code — driven through the in-app browser
**Date/time:** 2026-07-24
**Build/URL tested:** https://ganak.pages.dev (live, auto-deploy from `main`)
**Browsers/devices:** In-app Chromium browser pane. Desktop 1280×720 and mobile 375×812.
**Time spent:** ~50 minutes

## Fix status (2026-07-24, Claude Code)

All six findings resolved except F5, which is deferred to its rightful owner:

| # | Sev | Status | Fix |
|---|-----|--------|-----|
| F1 | P2 | ✅ Fixed | `FestivalGuideScreen.tsx` — "Eclipse contacts" line now gated on `grahan.visible`; non-visible cities show only the verdict + Maximum eclipse (matches Cape Town). Verified Delhi hides / Reykjavik keeps. |
| F2 | P2 | ✅ Fixed | `eclipse.ts` — `moksha = visibility.end` (was `contacts.end`); clamps to local moonset/sunset for grast-asta. Backward-compatible (Cape Town solar & Delhi lunar unchanged). New gate assertion for London Aug-2026 grast-asta. |
| F3 | P3 | ✅ Fixed | `MuhuratHub.tsx` — grahan rows are re-included after the 10-item cap so a date-shift can't drop them. Verified Chandra Grahan reappears in Honolulu. |
| F4 | P3 | ✅ Fixed | `format.ts` `fmtTimeD` gains optional `lang` (Hindi → 24h + hi-IN months); threaded through the hub's expanded festival-detail rows. Verified hub Hindi grahan row now "16:47–18:47 · सूतक 04:47 · मोक्ष 18:47". |
| F5 | P3 | ⏭️ Deferred | Hero title clip lives in the **ACTIVE** `CURSOR-P0-FESTIVAL-HERO-ART-01` lane (untracked WIP). Handed off to that lane rather than edited, per the one-writer rule. |
| F6 | P3 | ✅ Fixed | `url-prefs.ts` new `urlPrefsSet` (replaceState) + `kundli-app.tsx` `setPanchPlace` uses it; city changes no longer grow history. Verified `history.length` stable, URL still carries city for reload. |

Gates: parse-check clean on all 6 edited files; production build passes; focused eclipse-logic probe passes (F2 grast-asta + backward-compat). The full `eclipse-sutak-pages.cjs` gate is currently red only on a **pre-existing** hero-SVG existence check (`public/festival-images/*.svg` are untracked WIP from the hero-art lane), unrelated to these fixes.

---

## Verdict (original bug bash)
**Pass with issues** — core astronomy and Sutak/Moksha logic is correct and robust
across cities, languages, and the moonrise/moonset edge cases. No P0/P1 defects.
Six lower-severity issues (2× P2, 4× P3), mostly display/consistency, listed below.

> **Note on live dates:** the brief's anchors (Feb 2026 solar, Mar 2026 lunar) are now
> in the past. The live pages pick the next upcoming grahan from "today", so I tested:
> - **Solar:** 12 Aug 2026 total (path over Arctic/Greenland/Iceland/Spain — *not* India, *not* South Africa)
> - **Lunar:** 28 Aug 2026 partial (visible Americas/Europe/Africa; *not* India)
>
> I substituted in-path cities (Reykjavik for visible solar; Honolulu/London for lunar
> rise/set overlap) to exercise the same code paths the brief intended.

## Attack coverage

- **Non-visible solar:** New Delhi + Cape Town, 12 Aug 2026, EN + HI. Both correctly
  "not visible", no-Sutak note present, no Sutak time.
- **Visible solar:** Reykjavik (in totality path), 12 Aug 2026, EN + HI via MuhuratHub.
  Visible verdict + contacts + local window + Sutak (start−12h) + Moksha (contact end).
- **Lunar moonrise overlap:** Honolulu (moonrise clip), London (moonset clip),
  Los Angeles (borderline), Reykjavik (whole window), 28 Aug 2026, EN + HI.
- **Hindi:** Both pages, visible + non-visible cases; devotional prose + all timing labels.
- **MuhuratHub:** Festivals tab, Surya + Chandra rows, non-visible (Delhi) + visible
  (Reykjavik), EN + HI, incl. nested VratVidhiCard.
- **Navigation/state:** rapid double city-change (stale-timing race), browser-back,
  reload persistence, 375px phone width, horizontal-overflow check, in-place language switch.

## Findings

### F1 — Non-visible solar eclipse still prints "Eclipse contacts" at night
Severity: **P2**
Route: `/festival/surya-grahan`
City/language: New Delhi (vs Cape Town), EN + HI
Steps: Open surya-grahan with New Delhi selected (12 Aug 2026).
Expected: For a city that cannot see the eclipse (Sun below horizon), no observable
contact times, or the times clearly marked as not-for-your-city.
Actual: Verdict is correctly "not visible / no Sutak", **but** the page still shows
`Eclipse contacts: 10:32 pm – 11:51 pm` — a topocentric contact window computed while
the Sun is below the local horizon (≈23:06 IST, night). Cape Town, *also* not visible,
shows **no** contacts line at all. So two "not visible" cities render differently, and
Delhi shows eclipse times a user physically cannot observe, directly under "not visible".
Evidence: Delhi EN "Maximum eclipse: 11:06 pm / Eclipse contacts: 10:32 pm – 11:51 pm";
Cape Town EN "Maximum eclipse: 07:36 pm" (no contacts line); Hindi mirrors it
("ग्रहण स्पर्श: 22:32 – 23:51").
Suggested fix: when `visible === false`, suppress the contacts row (or relabel it as a
geocentric/reference time), so non-visible cities read consistently.

### F2 — Moksha shown after local moonset for grast-asta (moon sets mid-eclipse)
Severity: **P2**
Route: `/festival/chandra-grahan`
City/language: London, UK, EN + HI (28 Aug 2026)
Steps: Select London; eclipse is visible but the Moon sets before the umbral phase ends.
Expected: For grast-asta, many household traditions take **moonset** as the effective
Moksha/end for that place; at minimum the "eclipse ends" time shouldn't fall after the
Moon has set locally.
Actual: `Visible locally: 03:27 am – 06:15 am` (clipped at moonset ✓) but
`Moksha (eclipse ends): 06:58 am` — 43 min after local moonset. Sutak nominally runs to
Moksha (6:58) though the Moon is already gone at 6:15.
Evidence: London EN block above; HI identical ("स्थानीय दृश्य अवधि … 06:15 … मोक्ष … 06:58").
Note: The brief explicitly specified "Moksha = contact end," so this may be intended —
flagging for owner confirmation. The same concern is symmetric for a solar eclipse still
in progress at local sunset. `moksha = contacts.end` in `eclipse.ts:195` uses the global
contact end, not the local visible end.

### F3 — Grahan drops off the capped MuhuratHub festival list in far-west timezones
Severity: **P3**
Route: `/?screen=muhurat` → Festivals tab
City/language: Honolulu, EN
Steps: Set city to Honolulu; open Festivals list.
Expected: Chandra Grahan (28 Aug) remains reachable in the hub list.
Actual: Local-time date shift (−1 day at UTC−10) reshuffles the ~10-item upcoming list;
"Chandra Grahan (lunar eclipse)" — present for Delhi — is pushed off the end and no longer
appears (list ends at Raksha Bandhan, 27 Aug). The dedicated `/festival/chandra-grahan`
page still works, so it's a discoverability gap, not a data loss.
Evidence: Delhi Festivals list ends "…Chandra Grahan (lunar eclipse) Fri, 28 Aug"; Honolulu
list ends "…Raksha Bandhan Thu, 27 Aug" with no grahan row.

### F4 — Hindi time format differs between festival page and MuhuratHub row
Severity: **P3**
Route: `/festival/*?lang=hi` vs `/?screen=muhurat&lang=hi`
City/language: any, HI
Expected: One time format for the same data in the same language.
Actual: Festival page (HI) uses 24-hour ("अधिकतम ग्रहण: 23:06", "05:18"); the MuhuratHub
Hindi expanded row uses 12-hour English AM/PM ("दृश्य अवधि: 4:47 PM–6:47 PM", "मोक्ष 6:47 PM").
Evidence: captures from both surfaces, Reykjavik/Delhi.

### F5 — Grahan hero card title left-clipped at phone width
Severity: **P3**
Route: `/festival/chandra-grahan` (and surya)
City/language: any; 375px viewport
Expected: Hero title fully visible.
Actual: At 375×812 the hero art title "Chandra Grahan (lunar eclipse)" is clipped on the
left edge, rendering as "dra Grahan (lunar eclipse)". Decorative only; the data block below
is unaffected and fully readable.
Evidence: mobile screenshot at 375px.

### F6 — City changes push browser-history entries
Severity: **P3** (observation)
Route: any festival page
Steps: Change city N times, then press browser Back.
Expected: Back returns toward the Daily/Muhurat screen.
Actual: Each city selection pushes a history state (`?city=…&lat=…&lon=…&zone=…`), so Back
steps backward through previously selected cities before leaving the page. (Upside: this is
why reloading a city-carrying URL correctly preserves the city.) Consider `replaceState` for
city updates if Back-to-Daily is the intended behavior.

## What passed (confirmed correct)

- **Sutak suppression on non-visible cities** — Delhi solar (12 Aug) and Delhi lunar
  (28 Aug) both show "not visible" + explicit no-Sutak note + no Sutak time, EN and HI.
- **Visible solar** — Reykjavik 12 Aug: visible verdict, contacts 4:47–6:47 pm,
  local window, Sutak 4:47 am (= start − 12h), Moksha 6:47 pm (= contact end).
- **Moonrise overlap (the headline case)** — Honolulu 28 Aug: contacts 4:27–7:58 pm but
  **Visible locally starts 6:47 pm** (clipped to moonrise), Sutak 9:47 am (= visible
  start − 9h), Moksha 7:58 pm (contact end, not a fixed +2h). Visible window never starts
  before local moonrise; maximum eclipse is *not* used as the visibility test.
- **Moonset clipping** — London 28 Aug: visible window ends at moonset (6:15 am) < contact
  end (6:58 am). (See F2 re: Moksha vs moonset.)
- **Hindi devotional wording** — "आपके शहर में ग्रहण दिखाई नहीं देगा",
  "सामान्य गृह-परम्परा में सूतक लागू नहीं माना जाता", consistent मोक्ष / सूतक / ग्रहण स्पर्श /
  स्थानीय दृश्य अवधि; no fear-heavy or dismissive phrasing; gender-inclusive sankalpa
  ("चाहता/चाहती"). Only the city label leaks English (provider-supplied — allowed by brief).
- **MuhuratHub expanded rows** — verdict shows in both states; visible case adds
  Visible/Sutak/Moksha; non-visible case shows no Sutak time; full VratVidhiCard renders
  below the summary without replacing it. Verified EN and HI.
- **Stale-timing race** — rapid Delhi→Reykjavik selection settles on Reykjavik (visible);
  no stale Delhi "not visible" timing left behind. All ~8 sequential city changes updated
  cleanly.
- **Reload persistence** — reloading a URL carrying `?city&lat&lon&zone` restores the city
  and recomputes; bare festival URLs default to New Delhi (expected).
- **Phone width (375px)** — no horizontal page overflow (scrollWidth == clientWidth == 375);
  the long dated timing lines (e.g. "Eclipse contacts: 03:27 am, 28 Aug – 06:58 am, 28 Aug")
  wrap at spaces with labels intact — readable, not fragmented.

## No-find evidence (routes / cities / lang / device combos tested)

- `/festival/surya-grahan?lang=en` — New Delhi (not visible), Cape Town (not visible),
  Reykjavik (visible). Desktop.
- `/festival/surya-grahan?lang=hi` — New Delhi (not visible). Desktop.
- `/festival/chandra-grahan?lang=en` — New Delhi (not visible), London (moonset clip),
  Los Angeles (borderline), Honolulu (moonrise clip), Reykjavik (whole window). Desktop.
- `/festival/chandra-grahan?lang=hi` — New Delhi (not visible), London (visible). Desktop.
- `/festival/chandra-grahan?lang=en` — London. **Mobile 375×812** (overflow + wrap check).
- `/?screen=muhurat&lang=en` — Festivals tab, Surya row (Delhi not-visible; Reykjavik
  visible), Chandra row (Delhi). Desktop.
- `/?screen=muhurat&lang=hi` — Festivals tab, Surya row (Reykjavik visible). Desktop.
- Navigation: rapid double city-change; browser Back; reload with city params;
  in-place EN⇄HI toggle (city state preserved).
