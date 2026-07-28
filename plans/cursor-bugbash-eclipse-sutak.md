# Cursor — bug bash brief: Eclipse visibility + Sutak

**Task ID:** `CURSOR-BUGBASH-ECLIPSE-SUTAK-15` · **Owner-assigned 2026-07-24**
**Timebox:** 45 focused minutes minimum.
**Target:** `https://ganak.pages.dev/festival/surya-grahan` and
`https://ganak.pages.dev/festival/chandra-grahan`
**Code:** `src/engine/eclipse.ts`, `src/screens/FestivalGuideScreen.tsx`,
`src/screens/MuhuratHub.tsx`, `src/data/grahan-guides.ts`,
`validation/eclipse-sutak-pages.cjs`

---

## Your job is to break it, not confirm it

This row is marked **100% / Done** because the engine, pages, MuhuratHub card,
backlog rows and gates now pass. That does **not** count as a bug bash.

Attack the places where eclipse logic usually lies:

- a global eclipse exists, but it is **not visible** in the selected city
- an eclipse is visible only after **moonrise** or before **moonset**
- Sutak should not appear for non-visible cities
- Hindi and English must say the same thing without awkward or disrespectful wording
- phone layout must stay readable when several times appear together

If you find nothing, the report must list exactly what you attacked.

---

## What changed recently

1. `src/engine/eclipse.ts` now computes:
   - topocentric solar contact windows by selected city
   - lunar umbral contact windows
   - local visible overlap with sunrise/sunset or moonrise/moonset
   - Sutak start: 12h before local solar visibility, 9h before local lunar visibility
   - Moksha from calculated contact end
2. Festival pages now show:
   - visible / not visible verdict
   - maximum eclipse
   - contact start/end
   - local visible window
   - Sutak start and Moksha when applicable
   - no-Sutak note when not visible
3. MuhuratHub Fasts & Festivals rows now expand grahan entries with the same
   city-aware verdict and timing summary.
4. `validation/eclipse-sutak-pages.cjs` covers:
   - Delhi Feb 2026 solar: not visible, no Sutak
   - Cape Town Feb 2026 solar: visible with contact-based Sutak/Moksha
   - Delhi Mar 2026 lunar: visible after moonrise with 9h Sutak/Moksha

---

## High-value attack vectors

### 1. Non-visible solar grahan must not show Sutak 🔴

Route: `/festival/surya-grahan?lang=en`

Use **New Delhi, India**. The page should say the upcoming solar grahan is **not
visible** and should explicitly say Sutak is normally not observed for that city.

Fail if:

- it shows a Sutak start time for Delhi
- the no-Sutak note is missing
- the page says "visible" just because the Sun is above the horizon
- Hindi says something materially different from English

### 2. Visible solar grahan outside India 🔴

Same route, change city to **Cape Town, South Africa**.

Expected behavior:

- page says visible at your city
- contact start/end appear
- local visible window appears
- Sutak and Moksha appear

Fail if:

- city search changes the city but timings remain Delhi-like
- contacts appear but Sutak/Moksha are blank
- the visible window is outside local daylight
- phone layout wraps times into unreadable fragments

### 3. Lunar grahan with moonrise overlap 🔴

Route: `/festival/chandra-grahan?lang=en`

The automated anchor is Delhi, March 2026: global eclipse begins before moonrise,
but Delhi sees only the final visible portion. Since the live page picks the next
upcoming grahan from today, verify this behavior through city changes and the page
wording:

- no visible window should start before local moonrise
- Moksha should be the contact end, not a fixed `+2h`
- Sutak should be 9h before local visible start when visible

Fail if:

- maximum eclipse is treated as the visibility test
- local visible window starts while the Moon is below the horizon
- no-Sutak appears for a city that clearly has a visible lunar window

### 4. Hindi devotional language and clarity 🔴

Routes:

- `/festival/surya-grahan?lang=hi`
- `/festival/chandra-grahan?lang=hi`

Check for:

- "दृश्य नहीं" / "सूतक लागू नहीं माना जाता" reads natural and respectful
- "मोक्ष", "सूतक", "ग्रहण स्पर्श" are used consistently
- no vulgar, dismissive or fear-heavy phrasing
- no English leaks except the selected city label if the place provider returns English

### 5. MuhuratHub expanded rows 🔴

Route: `/?screen=muhurat&lang=en`, then switch to the **Festival** tab.

Find a grahan row in the upcoming list. Expand it.

Expected behavior:

- visible/not-visible verdict appears in the expanded row
- if visible: visible window + Sutak + Moksha appear
- if not visible: no Sutak time appears
- the full `VratVidhiCard` still renders below without replacing the timing summary

Repeat in Hindi.

### 6. State and navigation

Check:

- reload on `/festival/surya-grahan?lang=hi`
- switch language after changing city
- browser back from grahan page to Daily
- change city twice quickly; stale timing must not remain
- narrow phone width around 360–390px

---

## Required report format

Create a report in `plans/cursor-bugbash-eclipse-sutak-results.md`:

```md
# Eclipse + Sutak bug bash results

**Tester:** <agent/name>
**Date/time:**
**Build/URL tested:**
**Browsers/devices:**
**Time spent:**

## Verdict
<Pass / Pass with issues / Blocked>

## Attack coverage
- Non-visible solar:
- Visible solar:
- Lunar moonrise overlap:
- Hindi:
- MuhuratHub:
- Navigation/state:

## Findings
### F1 — <title>
Severity: P0/P1/P2/P3
Route:
City/language:
Steps:
Expected:
Actual:
Evidence:

## No-find evidence
List the exact routes, cities and language/device combinations tested.
```

Do not mark this bug bash complete with "looks good" alone.
