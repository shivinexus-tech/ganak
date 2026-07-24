# Codex — bug bash brief: Approved utility-calculator catalogue

**Task ID:** `CODEX-BUGBASH-UTILITY-CALCULATORS` · **Owner-assigned 2026-07-24**
**Timebox:** 60 focused minutes. **Target:** https://ganak.pages.dev/calculators
**Code:** `src/data/utility-calculators.ts` · `src/engine/utility-calculators.ts` ·
`src/screens/UtilityCalculatorScreen.tsx` · `validation/utility-calculators.cjs`
**Verify dev on port 5199** (`kundli-verify`), never 5173 — that port has repeatedly
served another agent's stale worktree.

---

## Why this one needs an hour

Twelve separate journeys, each with its own maths, its own copy, and its own
permanent public URL. The register already marks this row **100% / Done**, so this
pass is not "does it work" — it is **"is it good enough to be permanent."** These
routes are meant to be shareable and indexed; a wrong answer here is a wrong answer
with a URL attached to it.

**Your job is to break it, not to confirm it.** If you find nothing, the report must
list what you attacked, or it is not evidence.

**Do not fix what you find** unless it is trivial and certain. Log it. The owner
decides what blocks closure.

---

## The 12 calculators

`rashi` · `sun-sign` · `lagna` · `nakshatra` · `baby-name` · `mangal-dosha` ·
`kala-sarpa` · `sade-sati` · `shraddha-tithi` · `pancha-pakshi` (Vedic group)
`western-natal` · `western-relationship` (Western group)

Routes: `/calculators` (catalogue) and `/calculator/<slug>`.

---

## Timebox — 60 minutes

### 0–5 min · Inventory sweep
Load all 12 routes plus `/calculators`. Every one must render its own content and set
its own `<title>` and canonical. Note anything that white-screens, 404s, or shows
another calculator's heading. **Deep routes confirmed working on production
2026-07-24** (`/calculator/rashi` returns "Moon sign (Rashi) | Ganak"), so a 404 here
is a regression, not a known gap.

### 5–20 min · Correctness (heaviest — do not skip) 🔴

**The single highest-risk defect is Vedic/Western cross-contamination.** The
acceptance criterion says the two must stay clearly separated. They use different
zodiacs — sidereal (Lahiri) vs tropical — about 24° apart, which is nearly a whole
sign. **If a Vedic and a Western answer ever agree for the same birth, the ayanamsa
has stopped being applied.**

Anchor, computed from the shipped engine 2026-07-24 — **Delhi, 1 Jan 1990, 12:00,
+5:30, 28.6139N 77.209E**:

| | Sun | Moon | Ascendant |
|---|---|---|---|
| **Vedic** (sidereal) | Dhanu (Sagittarius) | Kumbha (Aquarius) | Meena (Pisces) |
| **Western** (tropical) | Capricorn | Pisces | Aries |

All three differ by one sign. Nakshatra Dhanishta-4, naming syllable "Ge".

Enter that birth in `rashi`, `sun-sign`, `lagna`, `nakshatra`, `baby-name` and
`western-natal` and confirm the UI agrees with the table. Then try **two or three
more births of your own** and confirm the Vedic/Western gap holds every time.

Also check: does any Western page mention Lahiri, nakshatra, rashi or dosha? Does any
Vedic page show tropical signs? Either is a leak.

### 20–30 min · Input abuse 🔴
For at least four calculators:
- Submit with **nothing filled in**. Then with date but no time; time but no place.
- **00:00 and 23:59** — a birth just after midnight in a place whose offset flips the
  civil date. Does the answer match the intended local date?
- **Pre-1970 and pre-1947 births** (1935, 1947) — historical timezone territory.
- **Far-future and far-past** dates; 29 Feb on a leap year and a non-leap year.
- **Southern hemisphere and high latitude** — Sydney, Reykjavik, Tromsø. Lagna is the
  one that breaks at extreme latitudes.
- Paste **garbage into the place box**; pick a place then clear it.

Nothing may produce `NaN`, `undefined`, `Invalid Date`, a blank result card, or a
silent wrong answer. An error is fine **if it says what to do next**.

### 30–40 min · The four odd-shaped ones 🔴
These have input shapes the other eight don't, so they get their own slot:

1. **`western-relationship`** — needs **two** people. Try: only person A filled; both
   identical (same birth twice); A and B swapped (is synastry symmetric where it
   should be?); two people 60 years apart.
2. **`sade-sati`** — takes a **second date** (the date being checked). Try a date
   before the birth date. Try one 100 years out. Confirm the phase
   (rising/middle/setting/not active) changes sensibly as you step the date across a
   known Saturn sign change.
3. **`shraddha-tithi`** — takes a **death date**. This is bereavement content: check
   the copy is respectful, and try a **future** death date (should it be accepted at
   all?). Confirm tithi + paksha + amanta month agree with the Daily screen for that
   same date and place.
4. **`baby-name`** — the naming syllables come from a 27×4 table in
   `src/data/utility-calculators.ts` (`NAMING_SYLLABLES`). **Spot-check at least six
   nakshatra/pada combinations against a published source.** Two rows look worth a
   hard look: `["Bhu","Dha","Pha","Dha"]` repeats "Dha", and
   `["Ru","Re","Ro","Ta"]` / `["Ti","Tu","Te","To"]` sit adjacent with overlapping
   sounds. Either may be correct — verify, don't assume. Per the project rule, a
   sourced correction beats a plausible-looking guess.

### 40–48 min · Routes, SEO, state
- `/calculator/numerology`, `/calculator/gemstone`, `/calculator/vastu` — the
  **excluded families** (`EXCLUDED_CALCULATOR_FAMILIES`). These must stay absent, and
  must fail gracefully, not white-screen.
- `/calculator/rashii`, `/calculator/`, `/calculator/RASHI` (case), trailing slash.
- **Canonical + meta description**: each page must carry its *own*, not the previous
  page's. Navigate A → B via in-app links and re-check `<link rel=canonical>` — stale
  head tags after client-side navigation are a classic SPA bug and directly damage the
  SEO value these permanent routes exist for.
- Back/forward button after computing. Reload mid-result. `?lang=hi` deep link.

### 48–55 min · Phone + Hindi
- **320px and 390px.** Any horizontal overflow is a bug. Two-person forms and wide
  result tables are the likely offenders.
- Switch to **हिन्दी on every one of the 12**. Look for: English leaking into Hindi,
  untranslated result labels, Devanagari falling back to a non-Eczar font, and text
  overflowing its container in the longer Hindi strings.
- Confirm the language toggle works **after** a result is on screen, not just before.

### 55–60 min · Write up
Add a `CODEX-BUGBASH-UTILITY-CALCULATORS` row to `plans/task-log.md`: minutes spent,
vectors attacked, every finding with steps + expected + actual, and a screenshot or
exact text for anything visual.

---

## What counts as a finding

Wrong numbers, obviously. But also: a sentence a normal person would misread, an
error message that doesn't say what to do, a Hindi page with English in it, a result
that looks confident when the inputs were incomplete, and any place the Vedic and
Western worlds touch.

Copy problems count. This project has shipped three of them to production that every
gate passed — the badge printing both languages at once, "2th house", "the answer
applies to now". **Gates prove the maths; only a person reading it proves the words.**

---

## If you do change anything

All must pass: `node validation/utility-calculators.cjs`, `parse-check` on each file
touched, `prashna-parity` (must stay **EXACT**), `prashna-calc` 24/24,
`muhurat-anchors`, `content-dates`, `calendar-convention-invariance`,
`regional-calendar-modes`, and `npm run build`.

If you strengthen `validation/utility-calculators.cjs` — and the anchor table above is
a good candidate to lock in permanently — **prove the new assertion is non-vacuous**
by breaking the value on purpose, watching it fail, then restoring.

**Commit only the files you touched.** The tree usually holds other agents' work;
`git add -A` has broken `main` here before.
