# Panchang utilities — inventory and specification

**Backlog:** #71 — Panchang utilities hub (brainstorm/spec) · owner request 2026-08-13
**Status:** research + spec for the owner to decide from. **No code is proposed for
implementation here and nothing under `src/` or `validation/` was touched.**
**Author:** Claude, 2026-08-18 · branch `claude/spec-panchang-utilities-71`
**Related open rows:** #58 (direct date entry), #59 (global search), #70 (calendar
types and regional Panchang names), EPIC-IA (navigation, parked).

---

## In one paragraph, for a non-technical reader

Ganak already **calculates** almost every Panchang utility a competitor advertises —
Rahu Kalam, Choghadiya, Hora, Chandrabalam, Tarabalam, Varjyam, Amrit Kalam, Gowri /
Nalla Neram, Dur Muhurta, Bhadra, the eight auspicious yogas, the season clock, the
Muhurat finder and 181 festival pages. What Ganak does **not** have is a way for a
person to *ask for one of them by name*. Almost all of them are stacked inside a single
long "Daily" page, so they exist as **things that render** but not as **things that can
be found, linked to, or shared**. Concretely: today there is no address in Ganak that
means "Rahu Kalam for Pune tomorrow" or "Choghadiya for this Sunday" — you have to open
the home page, set the city, set the date, and scroll. That is the whole problem behind
row #71, and it means the majority of the work is **not new astronomy** — it is giving
existing answers their own addresses, names and plain-language verdicts. Out of the
**35 utilities inventoried below, 30 already compute correctly** and need only a name
and an address (15 of those become the proposed pages); the remaining **5 need a new
rule — two of them small, three larger**. The one substantial exception is the three
regional tools the owner asked about: **Chandrabalam already exists and only needs a
front door; Vinchudo does not exist and needs a small new rule (I verified its exact
convention against Ganak's own ephemeris — see §7); a standalone Nakshatra finder
half-exists (birth nakshatra yes, "which nakshatra is running on this date" no).**

---

## 1. Primary persona and the journey

**Primary persona: P1 · Panchang householder / diaspora** (`plans/ganak-personas.md`).
They want today's tithi, Rahu Kaal, a fasting date; they check quickly and often; they
do not think of this as "doing Jyotish". The elder-friendly constraint — few clear
destinations, one job per screen, answer first — is **P1's own constraint**, so it
applies here legitimately rather than being borrowed.

**Secondary persona, clearly marked: P3 · Priest / purohit.** P3 is why every utility
must state its convention and print/share cleanly. P3 does **not** get to set the
default complexity of a utility page; P1 does.

**Explicitly not the driver here:** P2's "recognition" constraint (tool names must be
*visible*, not merely reachable) is real and is quoted in §6, but it belongs to the
Jyotish calculator catalogue, not to the Panchang side. Where I lean on it I say so.

### 1.1 The journey, written before any design

1. A person wants one specific Panchang fact — "when is Rahu Kalam", "is today
   Chandrabalam good for me", "when is the next Ekadashi".
2. They look for that thing **by its name**.
3. They open it.
4. They see a plain-language answer first, then the timing detail.
5. Their city, date and language are already right — they do not re-enter them.
6. They send the link to a family member, or come back to it tomorrow.

### 1.2 Walking that journey against the real code

| Step | Status today | Evidence |
|---|---|---|
| 1 | **Works** — the maths exists for nearly everything (§3). | `src/engine/today-panchang.ts`, `src/engine/daily-windows.ts` |
| 2 | **Broken** — there is no place in Ganak that lists Panchang utilities by name. The only catalogue, `/calculators`, holds 14 **birth-chart** calculators and zero Panchang tools. | `src/data/utility-calculators.ts` (all 14 entries are `group: "vedic"` birth-chart or `group: "western"`) |
| 3 | **Broken** — no utility below has its own address. Everything lands on `/?screen=daily` and must be scrolled to. Only three path-routes exist in the whole app. | `validation/route-reachability.cjs` output: `/calculators`, `/festival/…`, `/muhurat/medical` — that is the complete list |
| 4 | **Partly works** — Hora has a real answer line before its dial; most other windows are tables only. | answer line at `src/screens/MuhuratHub.tsx:1208` onwards; contrast with the plain rows in `src/components/DailyWindowsCard.tsx` |
| 5 | **Broken at one specific seam** — the two in-app entries to `/calculators` drop the selected city. `src/screens/ChartScreen.tsx:437` emits `` `/calculators?lang=${lang}` `` and `src/components/JyotishPanelNav.tsx:132` emits `` href.startsWith("/") ? `${href}?lang=${lang}` : href ``. Neither carries `city/lat/lon/zone`, so the user silently lands back on the New Delhi default. Once *inside* the calculators, `utilityHref` in `src/screens/UtilityCalculatorScreen.tsx:38-46` does preserve the city correctly — so this is an entry-door bug, not a systemic one. |
| 6 | **Broken for the two highest-traffic lookups** — the festival/vrat **search** view and the **year calendar** are local component state with no URL at all (`const [calView, setCalView] = useState(null)`, `src/screens/DailyScreen.tsx:87`, opened by `onCal({type:"search"…})` / `onCal({type:"year"})` at `src/screens/MuhuratHub.tsx:844-847`). They cannot be linked, shared, bookmarked, or restored, and the browser Back button does not return to them. |

**The one-line diagnosis:** steps 1 and 4 are largely healthy. Steps **2, 3 and 6** —
naming, addressing and sharing — are where every gap sits. This is the same class of
defect `validation/route-reachability.cjs` was written for, one level up: not "the page
has no inbound link" but "the answer has no page".

### 1.3 Success, measured in user steps

| Journey | Today | Target |
|---|---|---|
| "Rahu Kalam for my city tomorrow" | open home → set city → open date popup → type date → scroll past ~8 sections | 1 tap from wherever the name appears, then read; 0 forms |
| "Is Chandrabalam good for me today" | scroll to the Daily-windows card → pick birth sign from a dropdown → read a coloured line | name it, open it, pick the sign once and have it remembered |
| "Send my sister the Ekadashi list" | **impossible** — the search view has no URL | copy the address bar |
| "Choghadiya for Sunday" | home → date popup → scroll | 1 tap |

No target above is expressed as a gate metric. "Reachable" is not a user outcome.

---

## 2. What already exists that serves this journey — the reuse base

Before designing anything, this is what is already built and working, so that no
proposal below invents a second copy of it:

- **`src/engine/today-panchang.ts`** (`computeTodayPanchang`) — one call returns tithi,
  nakshatra, yoga, karana (each with the *next* one and its end time), paksha, moonsign,
  sunsign, lunar month, samvat, pravishte, sunrise/sunset/next sunrise, moonrise/moonset,
  **Rahu / Gulika / Yamaganda / Abhijit**, day and night **Choghadiya**, Pitru Paksha day
  and the whole daily-windows bundle. Any Panchang utility page is a *projection* of this
  one object; none of them needs a new engine call.
- **`src/engine/daily-windows.ts`** (`computeDailyWindows`) — Bhadra/Vishti, Dur Muhurta,
  Varjyam, Amrit Kalam, Brahma, Nishita, Godhuli, Pradosha, Disha Shool, **Chandrabalam**
  (`chandraBala`, line 176), **Tarabalam** (`taraBala`, line 185), Anandadi yoga,
  Gowri / Nalla Neram day and night, and the eight special yogas with real interval
  boundaries plus a 60-day calendar (`scanSpecialYogaCalendar`).
- **`src/engine/hora.ts` / `personal-hora.ts`** — day and night horas anchored to the true
  following sunrise, planet glyphs, bilingual names and natures, plus the
  ascendant-trikona personal filter.
- **`src/engine/hora-verdict.ts`** — `adjudicate()` already turns a window plus its
  blockers into a `clean | partial | blocked` verdict with a usable-remainder rule
  (`MIN_USABLE_MS`). **This is the answer-before-data machinery, already built**, and it is
  the natural engine for a plain-language verdict on *any* utility window, not just hora.
- **`src/engine/muhurat.ts`, `personal-muhurat.ts`, `medical-muhurat.ts`** — the activity
  finders. `?muhurat=` already deep-links a category (`src/screens/MuhuratHub.tsx:115,140`).
- **`src/engine/search-upcoming.ts`** (`searchUpcoming`) — name/tithi lookup in English,
  Hindi and Devanagari, with Ekadashi and Pradosh variant handling.
- **`src/data/festival-pages.ts`** — 181 permanent festival routes, proven by
  `validation/festival-page-coverage.cjs` (179 openable labels, 162 required covered).
- **`src/components/url-prefs.ts`** — the sanctioned way to keep state in the URL
  (`lang`, `screen`, `city/lat/lon/zone`, `date`, `cal`, `hol`, `muhurat`, `maction`).
  **Every requirement in §5 is satisfiable with this file as-is.**
- **`src/components/Breadcrumbs.tsx`** — already carries city and language forward
  (`calculatorContextQuery`), and is the existing pattern for a standalone page's way home.
- **`src/screens/UtilityCalculatorScreen.tsx`** — the working shape of a
  catalogue + permanent-URL-per-tool page, with canonical tags, bilingual metadata and a
  graceful not-found state. A Panchang catalogue should copy this, not reinvent it.

**Settled boundary that must not be reopened:** `EXCLUDED_CALCULATOR_FAMILIES` in
`src/data/utility-calculators.ts` permanently excludes numerology, birthstone, Chinese
zodiac, western transit/progression, vastu, feng shui, gemstone and rudraksha. Nothing in
this spec proposes any of them.

---

## 3. The inventory

Three buckets, exactly one per row.

- **A — already exists.** The maths is built and shipping. The **Findable?** column is the
  honest half: *does a person who wants this by name have any way to ask for it?*
- **B — a link to an existing journey.** No new engine. Only an address and a framing.
- **C — needs a new engine.** Named rule, named difficulty.

### 3.1 Bucket A — already exists in Ganak (30 rows)

| # | Utility | Where it is computed | Where it renders | Findable as a utility? |
|---|---|---|---|---|
| A1 | Panchang for any date (typed date + month/year jump) | `DailyScreen.tsx:30` `isValidISODate`, `:184` `jumpMonth` | Daily calendar popup, `:226-272` | **Partly.** Shareable via `?date=`, but buried in a popup and not named. Backlog #58 still shows this unchecked — that row is **stale**; `validation/panchang-date-picker.cjs` proves typed entry, year 100–9999 jump, month jump, visible invalid-date errors and Back/Forward all ship. |
| A2 | Tithi (current + next, with end time) | `today-panchang.ts:57-63` | Daily | No name, no address |
| A3 | Nakshatra of the day (current + next) | `today-panchang.ts:64-70` | Daily | No |
| A4 | Yoga of the day | `today-panchang.ts:71-76` | Daily | No |
| A5 | Karana (both halves) | `today-panchang.ts:77-84` | Daily | No |
| A6 | Rahu Kalam | `today-panchang.ts:96-105`, `RAHU_SEGMENT` in `panchang.ts` | Daily / MuhuratHub avoid-list | **No** — the single most-searched Panchang term in India has no page |
| A7 | Yamaganda | same block, `YAMA_SEGMENT` | same | No |
| A8 | Gulika Kalam | same block, `GULIKA_SEGMENT` | same | No |
| A9 | Abhijit Muhurat | `today-panchang.ts:103` | MuhuratHub good-windows | No |
| A10 | Choghadiya, day and night | `choghaSlots` (`panchang.ts`), called `today-panchang.ts:122-123` | MuhuratHub | No |
| A11 | Hora / planetary hours | `engine/hora.ts` | `MuhuratHub.tsx:1208`, **with a plain-language answer line first** | No — but it is the best-built one |
| A12 | Personal hora (ascendant trikona) | `engine/personal-hora.ts` | inside the hora section | No |
| A13 | **Chandrabalam** | `daily-windows.ts:176` `chandraBala` | `DailyWindowsCard.tsx:75-84`, with a birth-sign `<select>` | **No.** It renders; it cannot be found. Also a **hard filter** in `personal-muhurat.ts:83` |
| A14 | **Tarabalam** | `daily-windows.ts:185` `taraBala` | `DailyWindowsCard.tsx:78-84` | No; also a hard filter, `personal-muhurat.ts:79` |
| A15 | Disha Shool / Vara Shula | `daily-windows.ts:170` `DISHA` | DailyWindowsCard | No |
| A16 | Gowri Panchangam / Nalla Neram | `daily-windows.ts:135` `gowriWindows` | DailyWindowsCard | No |
| A17 | Anandadi Yoga (28-mansion, Abhijit inserted) | `daily-windows.ts:126` | DailyWindowsCard | No |
| A18 | Varjyam | `daily-windows.ts:36-52`, `VARJYA_GHATI` | DailyWindowsCard | No |
| A19 | Amrit Kalam | same, `AMRIT_SHIFT_GHATI` | DailyWindowsCard | No |
| A20 | Dur Muhurta (day + Tuesday night) | `daily-windows.ts:56-66` | DailyWindowsCard | No |
| A21 | Bhadra / Vishti | `daily-windows.ts:72-85` | DailyWindowsCard | No |
| A22 | Brahma / Nishita / Godhuli / Pradosha | `daily-windows.ts:214-230` | DailyWindowsCard | No |
| A23 | Eight special yogas + 60-day calendar | `daily-windows.ts:145`, `:243` | `DailyWindowsCard.tsx:28` (collapsed) | No |
| A24 | Ritu / season + Vedic ghati clock | `engine/vedic-season-clock.ts` | `MuhuratHub.tsx:1203` `SeasonClockCard` | No |
| A25 | Muhurat finder (activity → ranked dates) | `engine/muhurat.ts` | `MuhuratHub.tsx:850` | **Partly** — `?muhurat=` deep-links a category, but there is no page listing what the finder can do |
| A26 | Personal muhurat (birth-chart filtered) | `engine/personal-muhurat.ts` | `MuhuratHub.tsx:924`, a `<details>` | No. Its old route was **deliberately deleted** by the owner 2026-08-02 (`validation/personal-muhurat.cjs:145`) — do not propose bringing it back without saying so |
| A27 | Medical Muhurat | `engine/medical-muhurat.ts` | `/muhurat/medical` | **Yes** — real route, footer link, breadcrumb |
| A28 | Festival / vrat lookup by name (EN/HI/Devanagari) | `engine/search-upcoming.ts` | `CalendarPage.tsx:35` | **No URL at all** — local state only |
| A29 | Year festival calendar | `scanPanchangCalendar` | `CalendarPage.tsx:25-33` | **No URL at all** |
| A30 | 181 festival / vrat pages | `src/data/festival-pages.ts` | `/festival/…` | **Yes** |

Plus, already addressable and already Panchang-adjacent, in the **birth-chart**
catalogue rather than a Panchang one: `/calculator/shraddha-tithi`,
`/calculator/nakshatra`, `/calculator/baby-name`, `/calculator/pancha-pakshi`,
`/calculator/rashi`, `/calculator/sun-sign`, `/calculator/lagna`,
`/calculator/sade-sati`. These are counted as findable and are **not** re-listed above.

**Honest summary of bucket A: 30 utilities compute correctly. Three are findable
(A27, A30 and the eight birth calculators). Two are half-findable (A1, A25). Twenty-five
are invisible.**

### 3.2 Bucket B — a link to an existing journey (no new engine)

Each of these is *only* an address plus a name plus an answer sentence. The numbers in
brackets are the bucket-A rows they project.

| # | Proposed utility | Projects | Why it deserves its own address |
|---|---|---|---|
| B1 | Rahu Kalam (and Yamaganda / Gulika alongside it) | A6–A8 | The highest-intent Panchang query there is; today it has no page |
| B2 | Choghadiya | A10 | Second-highest; a whole competitor sub-site exists for it |
| B3 | Hora | A11–A12 | Already has the best answer line in the app; only lacks a door |
| B4 | Abhijit and the avoid-windows (Dur Muhurta, Varjyam, Bhadra) | A9, A18–A21 | One "good and bad times today" page, not five |
| B5 | Chandrabalam | A13 | See §7 — a front door, plus remembering the birth sign |
| B6 | Tarabalam | A14 | Same, with the birth nakshatra |
| B7 | Amrit Kalam | A19 | Frequently asked by name in the South |
| B8 | Gowri Panchangam / Nalla Neram | A16 | Named regional tool; already visibly marked Tamil |
| B9 | Panchang for a date ("check any date") | A1 | Turns a buried popup into a named tool |
| B10 | Sunrise, sunset, moonrise, moonset | A2 block + `moonEvents` | Trivially available; commonly searched |
| B11 | Festival / vrat finder | A28 | **Fixes a real defect** — this cannot be shared today |
| B12 | Year calendar | A29 | Same defect |
| B13 | Auspicious yogas calendar (Sarvartha Siddhi, Guru/Ravi Pushya …) | A23 | The 60-day scan is built and collapsed out of sight |
| B14 | Vedic clock / ghati + Ritu | A24 | Distinctive; Ganak is ahead here |
| B15 | Muhurat finder landing (what can I time?) | A25 | The finder exists; nothing says it exists |

### 3.3 Bucket C — needs a new engine

| # | Utility | What it needs | Difficulty | Notes |
|---|---|---|---|---|
| C1 | **Vinchudo** | One sign-crossing solve: the Moon's transit of sidereal Vrishchika, 210°–240° Lahiri. `solveCross(moonSidMs, …, 210)` / `…, 240)` are already the exact primitives used by `nakshatraSpanAt` in `daily-windows.ts:24-28`. | **Small** — a few lines plus a display window | Convention verified in §7. ~12–13 windows a year, ~2½ days each |
| C2 | **Nakshatra Panchak** (Dhanishtha 3rd pada → Revati) | A five-nakshatra window solve, same primitive as C1 | **Small** | **Genuinely missing.** `src/engine/panchaka.ts` is *Lagna* Panchaka (`mrityu / agni / raja / chora / roga`, `PANCHAKA_TYPE` line 8) — a muhurat lagna dosha, **not** the nakshatra Panchak a North Indian household means. Do not let the shared word hide the gap |
| C3 | **Nakshatra finder — "which nakshatra is running", and the year's dates for one nakshatra** | Day-of nakshatra already exists (A3). The *yearly per-nakshatra date list* needs a scan like `scanSpecialYogaCalendar` | **Medium** | See §7.3: half of this is A3, half is new |
| C4 | Per-tithi yearly date lists (all 30, not just Ekadashi/Pradosh/Purnima/Amavasya) | Generalise the tithi branch of `searchUpcoming` from the current partial target set | **Medium** | Only worth doing if the utilities hub ships |
| C5 | Hindu ↔ Gregorian date converter (both directions) | Reverse lookup on tithi + month + samvat | **Medium–large** | Interacts with row #70 (amanta/purnimanta, regional bases). **Do not start before #70 is decided** — the answer changes per calendar type |

**Explicitly out of scope, already decided elsewhere:** printable/PDF calendar, Google
Calendar export, reminders and push (an existing open sub-row of
`P0-PANCHANG-CALENDAR-PARITY`), and the global site search (#59). A utilities hub should
*feed* #59, not duplicate it.

---

## 4. The cut line — before go-live versus later

The rule I applied, stated so the owner can overrule it deliberately: **before go-live
means (a) the maths already exists, (b) the utility is something a person asks for by
name, and (c) shipping it is naming and addressing work, not new astronomy.** Anything
needing a new rule, or any judgement the owner has not yet made, goes after.

### Before go-live

| Row | Reason |
|---|---|
| B1 Rahu Kalam | Highest-intent Panchang term in India; the answer exists and has nowhere to live |
| B2 Choghadiya | Same, second; a competitor runs an entire site on this one utility |
| B3 Hora | Already answer-first (`MuhuratHub.tsx:1208`); cheapest good page in the app |
| B4 Good and avoid windows today | Collapses five invisible utilities into one page P1 can actually use |
| B9 Panchang for a date | #58 is effectively built (`validation/panchang-date-picker.cjs`) and unnamed; naming it closes a stale backlog row |
| B11 Festival / vrat finder | **Defect, not a feature.** No URL today, so it cannot be shared or restored |
| B12 Year calendar | Same defect, same fix |
| B5 Chandrabalam | Owner asked for it; it already computes and is already a hard filter in personal muhurat |
| **The city bug at `ChartScreen.tsx:437` and `JyotishPanelNav.tsx:132`** | Any utilities hub inherits this entry door. Fixing it is two lines and it violates the owner's own hard requirement (§5.1) |

### Later

| Row | Reason for waiting |
|---|---|
| B6 Tarabalam | Needs the *birth nakshatra*, which most P1 users do not know offhand — worth doing only once a remembered-birth-detail decision exists (§8, D4) |
| B7 Amrit Kalam, B8 Gowri / Nalla Neram | Strong regional pull, but the regional-language journeys are a separate post-launch item (`plans/panchang-muhurat-source-matrix.md` § release boundary). Shipping a Tamil-named tool in EN/HI only is half a promise |
| B10 Sunrise/sunset/moonrise/moonset | Genuinely trivial; low differentiation. Do it when the hub template already exists |
| B13 Auspicious yogas calendar | Best value *after* the calendar has a URL (B12), so a yoga date can be linked |
| B14 Vedic clock / Ritu | Distinctive but exploratory, not high-intent |
| B15 Muhurat finder landing | Overlaps EPIC-IA's "gut MuhuratHub" work; doing it twice is waste |
| C1 Vinchudo | Small, and the convention is now settled (§7.1) — but it is a **regional caution window**, and shipping a "do not do this now" verdict is a religious-content call the owner should make deliberately (§8, D5) |
| C2 Nakshatra Panchak | Same class of judgement as C1, plus a naming risk against the existing Lagna Panchaka |
| C3 Nakshatra finder, C4 tithi lists | Only earn their keep once a hub exists to hold them |
| C5 Hindu ↔ Gregorian converter | **Blocked on row #70.** The right answer depends on which calendar types Ganak commits to |

**One-sentence cut line:** ship the utilities that already compute and are asked for by
name — Rahu Kalam, Choghadiya, Hora, the good/avoid windows, Panchang-by-date, the
festival finder and year calendar with real URLs, and Chandrabalam — plus the two-line
city fix; defer everything that needs a new rule, a birth detail, a regional-language
journey, or an owner call.

---

## 5. The two hard requirements the owner attached

### 5.1 Every utility preserves the selected city, date and language across navigation

The mechanism already exists and needs no new invention: `src/components/url-prefs.ts`
keeps `lang`, `city/lat/lon/zone` and `date` in the query string;
`src/kundli-app.tsx:107-135` reads them on mount and re-reads them on `popstate`; and
`AccessibilityRoot.tsx` plus `LinkCityChoiceDialog.tsx` already handle the awkward case
where a shared link's city differs from the reader's remembered city — with behaviour
pinned by `validation/link-city-choice.cjs`, including the real `samePlace` function so a
device-located user opening a link for their *own* city is not prompted.

Concretely, per recommendation:

- **Every bucket-B page carries `?city=&lat=&lon=&zone=&date=&lang=` in every internal
  link it emits.** `utilityHref` in `UtilityCalculatorScreen.tsx:38-46` is the existing,
  working implementation of exactly this — reuse it, do not write a second one.
- **B11 and B12 stop being local state.** `calView` (`DailyScreen.tsx:87`) becomes a URL
  value the same way `?muhurat=` already works (`MuhuratHub.tsx:115,140-141`, including
  its `popstate` restore). This is what makes them shareable *and* what makes Back work.
- **The known violation is fixed first.** `ChartScreen.tsx:437` and
  `JyotishPanelNav.tsx:132` must emit the full context query, not `?lang=` alone.
- **`date` is honoured by every utility that has a date.** Today `?date=` is read only by
  `DailyScreen.tsx:65-71`; `UtilityCalculatorScreen` keeps its own `asOf` defaulting to
  today and ignores the URL. A Panchang utility must not repeat that.
- **A permanent gate should hold this**, in the same spirit as
  `validation/route-reachability.cjs`: every internal link to a utility route carries the
  city/date/language triple, or the build fails. Naming it here as a requirement; writing
  it is implementation work, not this spec.

### 5.2 None of this clutters the Daily answer card

Three commitments, in order of how load-bearing they are:

1. **Nothing is added to Daily.** Every recommendation above is a *page*, not a new
   section. The Daily screen is already the ~14-module scroll named as HIGH severity in
   `plans/ux-ia-audit.md` § "The spine problem"; adding a utilities strip to it would be
   the exact mistake that audit describes.
2. **The utilities get one entry point, not fifteen.** Whatever form the owner chooses in
   §8/D1, the Daily page gains **at most one link**, and it replaces scrolling rather than
   adding to it.
3. **This is a net reduction, not an addition.** Once B1–B4 have their own pages, the
   corresponding blocks inside `MuhuratHub` and `DailyWindowsCard` become candidates for
   *removal* from Daily — which is EPIC-IA's already-approved "gut the overloaded
   MuhuratHub (it does ~10 jobs)". A utilities hub is the destination that work has been
   waiting for. **Sequencing note for the owner: build the pages first, remove from Daily
   second, and never in the same change** — that keeps every step reversible.

---

## 6. Bilingual behaviour (en / hi)

Ganak's standing principle is **answer before data**: a plain-language verdict first, the
technical detail after, in both languages, with every jargon term glossed on first use.

Applied to utilities, the shape of every page is the same three lines:

| Line | English | Hindi | Source |
|---|---|---|---|
| **Verdict** | "Avoid important starts between 1:30 and 3:00 PM today." | "आज दोपहर 1:30 से 3:00 के बीच महत्वपूर्ण कार्य टालें।" | new copy, one sentence |
| **Name + gloss** | "Rahu Kalam — the inauspicious eighth of the daytime that falls on this weekday." | "राहु काल — दिन के आठ भागों में से इस वार का अशुभ भाग।" | new copy |
| **Detail** | the window, its convention, the city and date it was computed for | same | existing engine values |

Rules that follow from what is already in the repo, not from taste:

- **One source of truth for term names.** All rashi, nakshatra and graha names come from
  `src/i18n/panchang-terms.ts`. `validation/language-leak-scan.cjs` fails a raw
  `SIGNS[…]` / `NAKSHATRAS[…]` in JSX, and `validation/screen-snapshots.cjs` fails
  Devanagari appearing in English mode or Latin term names in Hindi mode. A new utility
  page inherits both gates automatically — which is exactly why it must not carry its own
  local name map, the mistake row `I18N-DEVANAGARI-TERMS` documents.
- **English mode uses the Western sign names** (Kanya → Virgo) while the calculation stays
  sidereal Lahiri — settled as E-1.0 and shipped 2026-08-11. `chandraBala` already reads
  `SIGN_EN_WESTERN` (`daily-windows.ts:176`), so B5 is compliant for free.
- **Hindi clocks are 12-hour with AM/PM**, via `panchangTime` in
  `src/components/format.ts`; pinned by `validation/hindi-panchang-clock.cjs`.
- **Any window that ends after midnight prints its date**, via the shared `format.ts`
  contract; pinned by `validation/cross-midnight-date.cjs`. Every utility in §3 can
  produce such a window, so none may format its own times.
- **Regional names are never invented or loosely translated.** Vinchudo stays *Vinchudo*
  (વીંછુડો / विंचुडो); Nalla Neram stays Tamil and visibly marked as such, as it already is.
  Where a tool has no accepted Hindi name, it keeps its own name with a Hindi gloss
  underneath — it does not get a coined one.
- **Utility page titles and descriptions are bilingual and per-route**, the way
  `src/metadata/route-metadata.ts` already does it for calculators and festivals
  (pinned by `validation/route-metadata.cjs`).
- **Devotional-language gates apply**: `hindi-devotional-language.cjs`,
  `hindi-worship-glossary.cjs`, `devotional-voice-english.cjs`.

**Where P2's constraint does apply:** the persona file says tool names must be *visible*,
not merely reachable — "a generic 'Tools' label does not fire recognition". That reasoning
transfers to Panchang utilities intact, because the trigger is identical: a person who
knows the phrase "Rahu Kalam" will not find it behind a label reading "More".

---

## 7. The three regional tools the owner named

### 7.1 Vinchudo — **needs a new engine, and I verified which convention**

**Recommendation: adopt the sign-based convention. Vinchudo is the Moon's transit of
sidereal Vrishchika (Scorpio), 210°–240° Lahiri — it begins when the Moon enters Scorpio
and ends when it enters Sagittarius.**

The owner is right that more than one version circulates, so here is the evidence rather
than an assertion:

- Two independent published sources state the sign rule. Drik Panchang publishes Vinchudo
  as a Gujarati-panchang utility with start/end timings
  ([drikpanchang.com/gujarati/panchang/muhurat/vinchudo-date-time.html](https://www.drikpanchang.com/gujarati/panchang/muhurat/vinchudo-date-time.html))
  but **states no rule on the page**. Shubh Panchang states it explicitly: it "begins when
  the Moon enters Scorpio zodiac (Vrishchik Rashi) in the sidereal system", starting at
  210° and ending at the Sagittarius ingress
  ([shubhpanchang.com/panchang/vinchhudo](https://shubhpanchang.com/panchang/vinchhudo)).
- **I confirmed it against Ganak's own ephemeris**, rather than trusting either page. I
  ran Drik's published 2026 Washington DC start/end instants through `moonSidMs` from
  `src/engine/panchang.ts` via `validation/_load-app.cjs`:

  | Drik's published boundary | Ganak's sidereal Moon longitude |
  |---|---|
  | 13 Jan 2026 06:51 (begins) | **210.002°** — exact Scorpio ingress |
  | 15 Jan 2026 19:17 (ends) | **239.998°** — exact Sagittarius ingress |
  | 09 Feb 2026 14:41 (begins) | **210.002°** |
  | 12 Feb 2026 03:12 (ends) | **240.000°** |

  Four boundaries, four exact sign ingresses, to the arc-second. This is not a nakshatra
  rule and not a pada rule. (Probe script deleted; it was a throwaway in `.scratch/`.)

- **The competing version, stated honestly.** A nakshatra-based "Vinchu" is reported in
  Jain and Marathi almanac practice, listed alongside Panchak and Pushya — i.e. the
  Dhanishtha-onwards "scorpion's tail" grouping. I could **not** verify it: the primary
  page I found (`jainpanchang.org`) failed to fetch (expired certificate), and no
  secondary source stated its exact nakshatra range. **I am not proposing to ship it.**
  If the owner wants that version too, it needs a named printed panchang as its source,
  not a web page — and the two would have to be labelled as separate traditions, never
  merged into one window.
- **Why it is cheap once decided:** `solveCross(moonSidMs, …)` already solves Moon
  longitude crossings for nakshatra spans at `daily-windows.ts:24-28`. Vinchudo is the
  same call at 210° and 240°.
- **Naming:** Vinchudo (Gujarati વીંછુડો, "little scorpion"). The tool keeps that name in
  both languages with a gloss; it is not translated to "scorpion period".

### 7.2 Chandrabalam — **already exists; needs a front door, not an engine**

`chandraBala` at `src/engine/daily-windows.ts:176` returns, for the day, all twelve birth
signs with a good/not-good flag and the Moon's distance from each. It uses the standard
rule — houses 1, 3, 6, 7, 10, 11 from the birth sign are strong, with 2, 5, 9 added in the
waxing fortnight and 4, 8, 12 in the waning. It renders at
`src/components/DailyWindowsCard.tsx:75-84` with a birth-sign dropdown, and it is a
**hard filter** in the personal Muhurat engine (`personal-muhurat.ts:83`).

So the work is entirely: give it a name, an address, a one-sentence verdict
("Chandrabalam is favourable for you today" / "आज आपके लिए चन्द्र बल अनुकूल है"), and stop
asking for the birth sign on every visit. It is the cheapest of the three by a wide
margin and the only one of the three I recommend before go-live.

**Source convention:** already registered in `plans/panchang-muhurat-source-matrix.md`
as "Nine-Tara and Moon-house convention", with exhaustive 370-day coverage as its
permanent evidence. No new sourcing needed.

### 7.3 Standalone Nakshatra finder — **half exists; be precise about which half**

Two different things share the name, and the project should not let them blur:

| What a user means | Status |
|---|---|
| "What is **my** birth nakshatra, pada and naming syllable?" | **Already exists and is findable** — `/calculator/nakshatra` and `/calculator/baby-name`, engine `quickBirth` in `src/engine/utility-calculators.ts:14`, with the 108 Drik-verified EN/HI pada syllable pairs in `src/data/utility-calculators.ts` |
| "Which nakshatra is running **on this date**, and when does it change?" | **Computes but is not findable** — `today-panchang.ts:64-70` returns the current nakshatra, the next one, and both end times; it renders inside Daily with no name and no address |
| "Give me every date in 2026 when **Rohini** falls" | **Does not exist.** Needs a per-nakshatra yearly scan, on the pattern of `scanSpecialYogaCalendar` (`daily-windows.ts:243`) |

**Recommendation:** treat the second row as a bucket-B page (free — it is A3 with a name)
and the third as bucket C, deferred. Do **not** build a fourth nakshatra surface: the
birth-nakshatra tool already exists and duplicating it would repeat the
"duplicated features, two homes" finding in `plans/ux-ia-audit.md` § issue 2.

---

## 8. Open decisions — for the owner, not for an agent

I have deliberately **not** decided these. Each is a product, naming, placement or
monetisation call.

**D1 — Do users pick utilities from a menu at all?**
This is the unresolved question underneath everything above, and it is why this spec
describes *pages and addresses* rather than a navigation design. The alternatives are all
live: a catalogue page like `/calculators`; a search box that routes by name (row #59,
EPIC-IA, already scoped as "before go-live"); links placed contextually next to the
relevant answer on Daily; or entry only from search engines and shared links, with no
in-app menu at all. **Everything in §4 works under any of these** — a utility needs a name
and an address either way. But the owner must pick before anyone designs the front door.
Related and unresolved: EPIC-IA is PARKED, and the navigation spec of 2026-08-03 settled
that there is **no room for a fourth top-level tab** (measured: 45 px of headroom, every
candidate label wider). So a "Panchang utilities" tab is already ruled out by measurement.

**D2 — Where do Panchang utilities live relative to the existing calculators?**
`/calculators` today means *birth-chart* calculators and sits under Jyotish. Panchang
utilities belong to the free Panchang side and to a different persona. One catalogue with
two clearly-separated groups, or two catalogues? Naming follows from that answer, and
naming is the owner's call.

**D3 — What do these pages get called, in both languages?**
"Utilities", "Tools", "Panchang tools", "पंचांग उपकरण", or no collective noun at all with
the individual names doing the work. P2's persona note argues against a generic label,
but the collective noun is still a brand decision.

**D4 — May Ganak remember a birth sign / birth nakshatra for the Panchang side?**
Chandrabalam and Tarabalam are far better if the user does not re-pick every visit.
`approved-storage.ts`'s `preferences` store is local-first and explicitly allows
non-sensitive comfort data, so it is technically available — but "which rashi are you"
sits closer to religious-preference data than "which font size", and AGENTS.md forbids
that syncing or entering analytics without granular consent. **Owner call, and it gates
B6 entirely.**

**D5 — Does Ganak ship "avoid" verdicts for regional caution windows?**
Vinchudo and nakshatra Panchak both say *do not do this now*. Ganak already ships avoid
windows (Rahu Kalam, Bhadra, Dur Muhurta), so this is not new in kind — but Vinchudo is
regionally specific and Panchak has real household weight. This is a religious-accuracy
and tone call under the standing human-gate, not a build decision.

**D6 — Anything touching monetisation.**
Current owner intent (`plans/ganak-personas.md` § "Current product intent") is everything
free this phase. Panchang is free forever and never carries ads by owner rule. **I have
assumed no utility here is ever gated, and I flag that assumption rather than treating it
as settled** — a utilities hub is exactly the kind of surface a later paywall discussion
reaches for.

**D7 — Does the stale backlog row #58 get closed?**
Direct date entry is built and gated (`validation/panchang-date-picker.cjs`), but the
backlog row is still unchecked. Somebody should decide whether "built but unnamed" counts
as done. My reading is that it does not — which is precisely the distinction row #71
exists to fix — but the closure call is the owner's.

---

## 9. Source convention per utility

Ganak's standing rule is that no rule ships without a stated, sourced convention.
`plans/panchang-muhurat-source-matrix.md` is the existing register and **already covers
most of this inventory**. Where it does, a utility page should cite it rather than restate
it. Gaps below are named honestly.

| Utility | Convention | Where it is sourced | Disagreement to disclose |
|---|---|---|---|
| Rahu / Yamaganda / Gulika (B1) | Weekday eighth-part segment tables, `RAHU_SEGMENT` / `YAMA_SEGMENT` / `GULIKA_SEGMENT` | Daily-Panchang weekday convention; day divided sunrise→sunset into eight | **Yes.** Gulika/Mandi has more than one tradition (day-eighth vs. a Saturn-son planetary position). Ganak uses the day-eighth; say so |
| Abhijit (B4) | Midday ± 1/30 of daylight, none on Wednesday (`today-panchang.ts:103`) | Standard daily-kala convention | The Wednesday exclusion is not universal — state it |
| Choghadiya (B2) | Weekday-sequenced eighths of day and of night, night measured to the **true following sunrise** | `choghaSlots`, `panchang.ts` | None material |
| Hora (B3) | Chaldean order from the weekday lord, unequal day/night hours to true next sunrise | `hora.ts:12-14` | None material |
| Varjyam / Amrit Kalam (B4, B7) | Nakshatra Tyajya ghati offsets scaled to the *measured* nakshatra length, four-ghati window | Source matrix row "Varjyam / Amrit Kalam"; Anand 19 Jul 2026 anchor | Tyajya tables vary by regional panchang — the matrix names the one Ganak follows |
| Dur Muhurta (B4) | 15 equal day/night muhurtas, weekday slot table, incl. Tuesday night | Source matrix row "Dur Muhurta"; Delhi 19 Jul 2026 minute anchor | None material |
| Bhadra / Vishti (B4) | Karana boundary; Vishti alone is labelled Bhadra | Source matrix row "Bhadra / Vishti" | Some traditions split Bhadra by which loka it occupies — Ganak does not; disclose |
| Godhuli / Brahma / Nishita / Pradosha (later) | Godhuli **begins at sunset** and runs half a night muhurta (C3-GODHULI-DRIK), verified to the minute on four anchors | Source matrix; `validation/drik-reference-anchors.cjs` | The "centred on sunset" variant is common and **wrong per Ganak's declared convention** — the matrix records why |
| **Chandrabalam (B5)** | Nine-Tara / Moon-house convention; 1,3,6,7,10,11 always, plus 2,5,9 waxing / 4,8,12 waning | Source matrix row "Chandra/Tara Bala"; 370-day coverage | The waxing/waning extension is not universal — disclose it on the page |
| Tarabalam (B6) | Nine-Tara cycle; taras 1,3,5,7 avoided | Same row | Some lineages treat tara 5 differently |
| Gowri / Nalla Neram (B8) | Drik's seven published weekday day/night Gowri tables, 8 + 8 divisions | Source matrix row "Nalla Neram / Gowri" | Tamil-specific; must stay visibly marked Tamil |
| Anandadi (later) | 28-mansion mapping with Abhijit inserted between Uttara Ashadha and Shravana | Source matrix; 19 Jul 2026 Mitra anchor | The 27 vs 28 mansion choice is the disagreement; Ganak states 28 |
| Special yogas (B13) | Nakshatra/weekday/tithi combination tables; interval engine splits at real boundaries | Source matrix row "Special yogas" | None material |
| Sunrise / sunset / moonrise / moonset (B10) | Solar ±2 min, **lunar ±6 min declared tolerance**; moonset is the set that *closes* the day's rise | Source matrix rows | The moonrise/moonset **pairing** rule differs between publishers — Ganak's is declared |
| Panchang-by-date (B9) | Sunrise-to-sunrise panchang day | `today-panchang.ts` `panchangDayParts` | Interacts with open row #67 (day boundary before sunrise) |
| Festivals / vrats (B11, B12) | Per-festival deciding kala, amanta/purnimanta aware | `plans/drik-gap-analysis.md`; `festival-*` gates | Regional variants already handled per festival |
| **Vinchudo (C1)** | **Moon in sidereal Vrishchika, 210°–240° Lahiri** | §7.1 — two published sources plus a four-boundary ephemeris verification | **Yes, and it is the important one.** A nakshatra-based variant is reported in Jain/Marathi practice and is **unverified**; §7.1 says why it is not being shipped |
| **Nakshatra Panchak (C2)** | Moon in the last five nakshatras (Dhanishtha 3rd pada → Revati) | **Not yet sourced.** Needs a named printed panchang before any build | Also: the start point (Dhanishtha 3rd pada vs. the whole nakshatra) genuinely varies. Do not build until this is pinned |
| Nakshatra finder (C3) | 27 equal 13°20′ divisions of the sidereal Moon path | `today-panchang.ts:64-70` | The 28-mansion Abhijit variant exists and is used *only* for Anandadi — do not mix the two |

Standing across all rows: **Lahiri ayanamsa, mean Rahu/Ketu**, sunrise-to-sunrise day,
local city timings — never silently changed (AGENTS.md § Astronomy conventions).

---

## 10. What this document does not do

- It proposes no navigation design, because D1 is unresolved.
- It writes no code and edits no gate.
- It does not close backlog rows #58, #71 or any other. The lead agent owns
  `plans/task-log.md`, `plans/backlog.md`, the acceptance register and the sheet sync.
- It does not decide the three-way overlap between #71 (utilities), #59 (global search)
  and EPIC-IA (navigation). It flags that all three want the same front door, and that
  building any two of them separately will produce the duplicate-surfaces defect the UX
  audit already recorded.
