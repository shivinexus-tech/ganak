# Calendar types and regional Panchang names — specification

**Backlog:** #70 (E. Repo debt) · **Owner request:** 2026-08-13 · **Written:** 2026-08-18
**Status:** specification only. **No product code is proposed here and none was written.**
**Branch:** `claude/spec-calendar-types-70` (docs only)

---

## 1. In one paragraph

Ganak already computes almost every calendar a reader could ask for — it just doesn't
*say* so. Under the covers the app works out the Hindu lunar month two different ways,
the sun's solar month, the Tamil and Bengali solar calendars complete with their own
month names, and three era years (Shaka, Vikram, Gujarati). What a reader can actually
choose from is five options in one dropdown, and the era years — including Vikram Samvat,
the one the owner went looking for and could not find — are printed only inside a
detail table that starts collapsed, on a different part of the screen. So the honest
picture is: **eight of the fourteen calendars on the shortlist are already correct
arithmetic that nobody has been given the names or the labels for; four need one new
rule or one new era count; and only two (Nepali Patro and the Gaudiya/ISKCON calendar)
need real new engine work.** The two decisions the owner needs to make are (a) whether a
reader *picks* their calendar from a menu at all, or whether Ganak infers it once from
the city they already typed and keeps the menu as a rarely-touched override, and (b)
whether the choice is remembered on the device between visits. Everything else in this
document follows from those two answers. One warning that is not optional: the word
"Vikram/Bikram Samvat" names **two different calendars** that both run about 57 years
ahead of the Gregorian year, and Ganak must never print the number without the calendar
name beside it in both English and Hindi.

**Jargon glossed on first use.** *Reckoning* = the rule that decides when a month or a
year begins. *Amanta* = a lunar month that ends at the new moon. *Purnimanta* = a lunar
month that ends at the full moon. *Sankranti / ingress* = the moment the Sun enters a
new zodiac sign; solar calendars start their months from it. *Sidereal (nirayana)* =
measured against the fixed stars, which is what Ganak uses everywhere (Lahiri).
*Tropical (sayana)* = measured against the equinox. *Era / Samvat* = the running year
count (Vikram 2083, Shaka 1948). *Samvatsara* = the name of the year in a repeating
60-name cycle (Parabhava, Siddharthi…).

---

## 2. Who this is for, and what they are trying to do

**Primary persona: P1 · Panchang householder / diaspora** (`plans/ganak-personas.md`).
Wants today's date and festival in *their family's* calendar, checks quickly, often
daily, knows the observance and not the astronomy, Hindi-first as often as English.
The elder-friendly constraint applies: one job per screen, answer first, no jargon
before the answer.

**Secondary, clearly marked: P5 · Working astrologer.** Needs Shaka *and* Vikram *and*
the samvatsara name visible and correct at a glance, because a client asks "which samvat
is running?" and a wrong or unlabelled answer is a credibility loss. P5's constraint is
speed and correctness, not simplification — so the full era set must stay reachable
without being forced onto P1.

### 2.1 The journey

1. Reader opens Ganak and sets their city.
2. Reader reads today's date **in their own calendar** on the Daily/Panchang answer.
3. Reader looks for the year — "which Samvat is running?"
4. If the default is not their calendar, reader switches to theirs.
5. Reader changes the date or the city and expects their calendar to stay chosen.
6. Reader comes back tomorrow and expects not to choose again.
7. Reader switches the language toggle to Hindi and expects everything to follow.

### 2.2 The journey walked against the code

| # | Step | Verdict | Evidence |
|---|---|---|---|
| 1 | Set city | **Works today** | `src/screens/DailyScreen.tsx` renders `PlaceInput`; city is written to the URL and restored on reload/Back (`src/kundli-app.tsx`, `placeFromUrl` + `popstate`, asserted by `validation/regional-calendar-modes.cjs`) |
| 2 | Read today's date in my calendar | **Partly broken** | Only five conventions exist (`src/engine/calendar-conventions.ts:29-35`). A Gujarati, Marathi, Telugu, Kannada, Malayalam, Odia, Assamese or Nepali reader is shown the pan-Indian default with **no indication that their calendar is even a concept in this app**. The calendar line itself renders at `T.fMicro` — the smallest type token in the app — inside the control row (`src/screens/DailyScreen.tsx:336-338`), i.e. the *answer* is set smaller than the *control*, which inverts answer-before-data |
| 3 | Find the Samvat year | **Broken — this is the origin of backlog #70** | `samvatInfo()` computes all three era years (`src/engine/panchang.ts:190-203`) and `computeTodayPanchang` exposes them as `P.samvat` (`src/engine/today-panchang.ts:91,115`). They are rendered in exactly **one** place: three rows of the "Full panchang" table at `src/screens/MuhuratHub.tsx:673-675`, inside a block gated by `showPanch`, which is initialised **`false`** at `src/screens/MuhuratHub.tsx:111` and opened by a "View full panchang ▾" button at `src/screens/MuhuratHub.tsx:640`. Nothing on the Daily answer, nothing on any other screen — `grep -rn "samvat" src` returns no other UI hit |
| 4 | Switch to my calendar | **Works, for four of fourteen** | `<select>` at `src/screens/DailyScreen.tsx:332-333`, labelled "YOUR FAMILY CALENDAR" / "आपके परिवार का कैलेंडर"; rendered only when a `place` is set |
| 5 | Change date/city, keep my calendar | **Works inside Daily only** | `chooseCalendarMode` pushes `cal` to the URL (`src/screens/DailyScreen.tsx:55`) and a `popstate` handler restores it (`src/screens/DailyScreen.tsx:74-80`). But `calendarMode` is local `useState` in `DailyScreen` and is passed as a prop to only two children — `CalendarPage` (`:146`) and `MuhuratHub` (`:345`). Every other screen (Festival guide, Prashna, Kundli, Muhurat finder routes) renders month names with the default and never learns the choice |
| 6 | Come back tomorrow | **Missing entirely** | The calendar choice is never persisted. `grep -rn "approvedStorage" src` returns only `ChartVault.tsx`, `AccessibilityRoot.tsx` (`homePlace`) and `ComfortProvider.tsx`. `src/components/url-prefs.ts` is explicitly described in its own header as the "replacement for banned browser storage" — so the choice lives in the query string and dies with the tab |
| 7 | Switch to Hindi | **Works** | `calendarLabel(..., lang)` (`src/engine/calendar-conventions.ts:123-165`) and `panchangTerm` (`src/i18n/panchang-terms.ts:119-138`) carry every label in both languages; native script is shown alongside for the two regional modes (`:150`) |

### 2.3 What already exists that serves this journey

Reuse before building. All of this is shipped on `origin/main` today:

- **Amanta and Purnimanta lunar months, with Adhik-maasa detection** — `lunarMonthInfo()`,
  `src/engine/panchang.ts:181-188`.
- **Sidereal solar month and the day-within-it** — `sunSidMs()` and `pravishte`
  (`src/engine/today-panchang.ts:92-94`). `pravishte` is exactly the "days into the
  solar month" count that Nepali Bikram Sambat and Punjabi Bikrami readers look for;
  it is already computed and already surfaced (`src/screens/MuhuratHub.tsx:672`).
- **Solar-ingress solving with per-region civil-day rules** — `ingressForSign()` and
  `regionalMonthStart()`, `src/engine/calendar-conventions.ts:57-79`. Adding a region
  whose only difference is *which civil day the month starts on* is a few lines here,
  not an engine.
- **A Kerala afternoon (aparahna) sankranti rule already in production** —
  `malayalamSankrantiDay()`, `src/engine/festivals.ts:60-65`, used today for Onam and
  the Mandala season. The rule the Malayalam calendar needs is already written and
  already gated.
- **Three era years and the 60-name samvatsara cycle** — `samvatInfo()` and
  `SAMVATSARA`, `src/engine/panchang.ts:106,190-203`.
- **A retired-id alias map so old shared links never break** — `CONVENTION_ALIASES`,
  `src/engine/calendar-conventions.ts:26`.
- **Independent per-mode runtime kill switches with a visible, bilingual fallback
  message** — `conventionIsEnabled`/`resolveConvention` (`:115,171-177`), the edge endpoint
  `functions/api/regional-calendar-flags.ts`, and the recovery banner at
  `src/screens/DailyScreen.tsx:342`. Any new calendar can ship dark and be turned on
  without a deploy.
- **A production shadow comparator and telemetry for regional dates** —
  `src/engine/regional-calendar-shadow-check.ts`, `src/monitoring/regional-calendar-shadow.ts`.
- **A frozen evidence fixture and a written source register** —
  `src/data/regional-calendar-evidence.ts` and `plans/regional-calendar-source-register.md`
  (two independent published sources per claim). This is the template every new calendar
  must fill before it ships.
- **Two gates that already hold the line** — `validation/calendar-convention-invariance.cjs`
  (no mode may mutate the canonical Panchang; no two modes may render an identical label;
  retired ids resolve silently) and `validation/regional-calendar-modes.cjs`
  (730 published anchor-city daily labels, a full-year multi-city differential model,
  25 observances, 24 native terms).

### 2.4 Success, in user steps

- A Gujarati reader today needs **infinite steps** — the journey cannot be completed at
  any cost, because the calendar does not exist in the product. Target: **0 taps**
  (inferred from city) or **1 tap** (picker), and **0 taps on every later visit**.
- Finding Vikram Samvat today: **1 scroll + 1 tap + 1 scroll** into a collapsed table on
  a different part of the screen, and only if the reader guesses that "View full
  panchang" contains it. Target: **0 taps** — visible on the Daily answer line.
- Keeping a chosen calendar across a city change today: works on Daily, **lost** on
  every other screen. Target: 0 taps to re-choose, anywhere in the app.

---

## 3. What Ganak computes today, precisely

Behaviour, not intent. Every row is `origin/main` at commit `8f23851`.

### 3.1 The five reckonings that exist and are switchable

| id | Shown as (EN / HI) | Reckoning actually computed | Enabled |
|---|---|---|---|
| `canonical` | "South & West Indian lunar (default)" / "दक्षिण व पश्चिम भारतीय चंद्र (मानक)" | Amanta lunar month + paksha + tithi. During the Krishna fortnight it prints **both** month names, e.g. `Ashadha (Amanta) / Shravana (Purnimanta)` | yes |
| `gregorian` | "Regular January–December" / "सामान्य जनवरी–दिसंबर" | Civil date via `toLocaleDateString` | yes |
| `north-purnimanta` | "North Indian lunar (Sawan etc.)" / "उत्तर भारतीय चंद्र (सावन आदि)" | Purnimanta month naming over the same lunar astronomy | yes |
| `tamil-solar` | "Tamil calendar" / "तमिल कैलेंडर" / தமிழ் நாட்காட்டி | Lahiri sidereal ingress + **Thirukanitha Tamil sunset rule**; Tamil month names; 60-name cycle year | yes |
| `bengali-solar` | "Bengali calendar" / "बंगाली कैलेंडर" / বাংলা পঞ্জিকা | Lahiri sidereal ingress + **Vishuddha Siddhanta next-sunrise rule**; Bengali month names; **Bangabda** year (`cycleYear - 593`) | yes |

Source: `src/engine/calendar-conventions.ts:29-35, 57-116`. A sixth id, `amanta`, was
merged into `canonical` on 2026-07-22 because it rendered a byte-identical label; it
still resolves **silently** so old links keep working (`:26`, and the gate at
`validation/calendar-convention-invariance.cjs` forbids it reappearing as a switch).

### 3.2 Which regional month-name sets are real, and which are absent

| Month-name set | Native script | Hindi | English | Where |
|---|---|---|---|---|
| Tamil (12) | ✅ `TAMIL_NATIVE` | ✅ `TAMIL_HI` | ✅ `TAMIL_EN` | `src/engine/calendar-conventions.ts:38-40` |
| Bengali (12) | ✅ `BENGALI_NATIVE` | ✅ `BENGALI_HI` | ✅ `BENGALI_EN` | `:41-43` |
| Sanskrit/Hindu (12) | ✅ Devanagari | ✅ `MONTH_HI` | ✅ `MONTHS_HINDU` | `src/engine/panchang.ts:105`, `src/i18n/panchang-terms.ts:25-31` |
| 60-name samvatsara cycle | ✗ | ✗ | ✅ `SAMVATSARA` (EN only) | `src/engine/panchang.ts:106`. A second, slightly different spelling list `TAMIL_YEARS_EN` exists at `src/engine/calendar-conventions.ts:45` — **two lists for one cycle** |
| Malayalam (12) | in flight, not on main | in flight | in flight | branch `claude/malayalam-kollavarsham` only — see §3.5 |
| **Gujarati, Marathi, Telugu, Kannada, Odia, Assamese, Nepali, Gaudiya** | **absent** | **absent** | **absent** | zero hits for these terms in `src/` |

### 3.3 The interpretation-layer promise, and the one place it is already broken

`src/engine/calendar-conventions.ts:1-2` states the layer "never feed[s] a value back
into astronomy or festival rules", and `validation/calendar-convention-invariance.cjs`
proves the canonical Panchang object is bit-for-bit unchanged across every mode. That
much is true.

But the chosen convention **does** already change an observance *name*:
`observancesFor(..., calendarConvention)` at `src/engine/festivals.ts:325,344-355`
branches on it — a Krishna-paksha Amavasya is named `amavasya_<tamil-month>`
(e.g. Aadi Amavasai) under `tamil-solar`, `amavasya_hariyali` under `canonical` or
`north-purnimanta` in Shravan, and plain `amavasya` otherwise. `scanPanchangCalendar`
threads the same argument (`src/engine/festivals.ts:566`).

**This matters for the spec:** the calendar switch is not purely cosmetic today, so
"adding a calendar" is not automatically zero-risk to festival naming. Any new mode must
decide, explicitly, whether it takes a branch here — and the default answer should be
"no branch unless a source demands one".

### 3.4 Where the era years are and are not

Computed: `samvatInfo(nowMs, gy)`, `src/engine/panchang.ts:190-203`.

- **Shaka** = `base − 78`, rolling at the Chaitra new moon before Mesha Sankranti.
- **Vikram** = `base + 57`, same Chaitradi roll — i.e. the **lunar, North-Indian**
  Vikram Samvat.
- **Gujarati** = `base + 57` or `+ 56`, rolling at the **Kartika** new moon before
  Vrishchika Sankranti — i.e. the Kartikadi (Diwali) Vikram Samvat.

Surfaced: three rows of the collapsed "Full panchang" table only
(`src/screens/MuhuratHub.tsx:673-675`). **Not** on the Daily answer, **not** in
`calendarLabel()`, **not** on any other screen.

Where a reader would expect them: on the Daily/Panchang answer line, next to the month
and tithi — which is where the benchmark puts them, and where the owner looked.

### 3.5 In-flight work on other branches — stated, not assumed

Two changes touch this area and **neither is on `origin/main`**. This spec describes
main; it does not assume either lands.

1. **`claude/malayalam-kollavarsham`** — adds a `malayalam-solar` mode: a
   `RegionalSolarId` union, a `malayalamSolar` runtime flag shipping **`false`**, the
   mode itself `enabled:false`, Malayalam month name sets, the Kerala aparahna rule and
   a Kollam-Era year (`start.y − 824/825`), plus `validation/malayalam-kollavarsham.cjs`.
   It is a **dark** mode by design. Its outcome is not assumed here; §5 classifies
   Malayalam on the astronomy that exists on main.
2. **`claude/hora-usefulness`** (the owner's own checkout, uncommitted) — prepends
   `Vikram Samvat <year> · ` to `calendarLabel()` for the two **lunar** modes only,
   year number without the samvatsara name, dated "owner, 2026-08-14". That is a direct
   partial answer to §4 below. This spec must not be read as proposing that change a
   second time; it proposes the **rules** that change should satisfy.

`src/engine/calendar-conventions.ts` is treated as read-only by this task. One writer
per file (AGENTS.md).

---

## 4. Reckoning versus language — the distinction everything else depends on

This is the crux, and it is repeatedly confused, including in Ganak's own dropdown.

> **A calendar is a *reckoning* plus a *vocabulary*.**
> The reckoning is arithmetic: when does the month start, when does the year roll, which
> era do you count from. The vocabulary is words: what the months are called, in which
> script, in which language.
>
> **Two calendars can share a reckoning entirely and still be different calendars to the
> people who use them** — because the names are the part they recognise. And two
> calendars can share a *name* and be different arithmetic. Both traps are live here.

Worked examples, from Ganak's own code:

- **Marathi, Telugu and Kannada calendars are, as reckonings, the calendar Ganak already
  ships as `canonical`.** Amanta lunar months, Chaitradi year start, Shaka era, the
  60-name samvatsara cycle. Ugadi, Yugadi and Gudi Padwa are the *same day* — Ganak
  already knows this: all three are one tithi rule, `chaitraPratipada`, at
  `src/engine/festivals.ts:360-362`. What a Telugu reader is missing is **twelve words
  and a year name**, not astronomy.
- **The `gregorian` option is a language change too, not only a reckoning change** — it
  is the civil calendar, and it is the one entry where "Regular January–December" is
  genuinely a different system.
- **The trap in the other direction:** "Shaka Samvat" in Ganak's own UI is labelled
  "(national calendar year)" at `src/screens/MuhuratHub.tsx:673`. That is **wrong as
  written**. Ganak computes the *traditional lunisolar* Shaka year. The **Indian
  National Calendar** (Rashtriya Panchang) is a different reckoning — tropical, fixed
  30/31-day months, Chaitra 1 on 22 March — that merely *counts the same era number*.
  The number agrees; the calendar does not. Fixing that label is a one-line copy change
  and is listed as a P0 in §9.

Consequence for scope: **the expensive part of this backlog item is not engineering, it
is sourcing names.** Eight of the fourteen candidates need no new astronomy at all.

---

## 5. Classification of every candidate

Cost bands: **S** = names + a label + a source-register row, no engine change.
**M** = S, plus one new month-start rule *or* one new era formula inside existing
machinery. **L** = new engine, or dependence on externally published data Ganak cannot
compute.

### Band 0 — Shipped and complete today (4)

| Calendar | Reckoning | Status |
|---|---|---|
| Hindu lunar, Amanta | Amanta, Lahiri sidereal | `canonical`, default, enabled |
| Hindu lunar, Purnimanta | Purnimanta naming | `north-purnimanta`, enabled |
| Tamil | Sidereal solar + Thirukanitha sunset rule | `tamil-solar`, enabled, gated, 365-day fixture |
| Bengali | Sidereal solar + Vishuddha Siddhanta sunrise rule, Bangabda | `bengali-solar`, enabled, gated, 365-day fixture |

*(Plus `gregorian`, shipped, outside the regional list.)*

### Band A — Already-correct reckoning; needs only names, an era label and a switch entry (4) · cost **S**

| Calendar | Reckoning Ganak already computes | What is actually missing | Risk |
|---|---|---|---|
| **Marathi** | `canonical` exactly — Amanta, Chaitradi, Shaka era | 12 Marathi month names (Devanagari; very close to, but must not be *assumed* identical to, `MONTH_HI`), Shaka year on the label, a switch entry | Low. Watch the duplicate-label gate at `validation/calendar-convention-invariance.cjs` — if Marathi renders the same string as `canonical`, the gate fails **by design**, and correctly: two switches producing one string are one switch. The differentiator must be the era + the month spellings, or Marathi should not be a separate switch |
| **Telugu** | `canonical` — Amanta, Chaitradi, Shaka, samvatsara (Ugadi) | 12 Telugu-script month names, samvatsara name surfaced, switch entry | Low |
| **Kannada** | `canonical` — same as Telugu (Yugadi) | 12 Kannada-script month names, samvatsara surfaced, switch entry | Low |
| **Gujarati** | Amanta months + **Kartikadi year roll**, and the year formula **already exists** (`samvatInfo`, `guj`, `src/engine/panchang.ts:196-198,201`) | 12 Gujarati-script month names, the `guj` era wired into the label, switch entry | Low–medium: Gujarat's *month names* are the standard Sanskrit set, but the **year number differs from North India's Vikram Samvat for roughly five months each year** (verified below). That must be visible, not silent |

**Verified, by running the engine** (`node` against `src/engine/today-panchang.ts`,
Delhi):

| Date | Shaka | Vikram | Gujarati |
|---|---|---|---|
| 2026-03-18 | 1947 Vishvavasu | 2082 Kalayukti | 2082 Pingala |
| 2026-03-20 | 1948 Parabhava | 2083 Siddharthi | 2082 Pingala |
| 2026-08-18 | 1948 Parabhava | 2083 Siddharthi | **2082** Pingala |
| 2027-01-05 | 1948 Parabhava | 2083 Siddharthi | 2083 Kalayukti |

The Vikram/Gujarati number split across 2026 is **correct behaviour** (Gujarat rolls at
Diwali) and is exactly why the era must never be printed as a bare number.

### Band B — Needs one new rule or one new era, inside machinery that already exists (4) · cost **M**

| Calendar | What is genuinely new | What is reused | Notes |
|---|---|---|---|
| **Malayalam (Kollavarsham)** | Kollam Era year; Kerala **aparahna** month-start rule as a *calendar* rule | The aparahna rule is already written and in production for festivals — `malayalamSankrantiDay()`, `src/engine/festivals.ts:60-65`; the ingress solver and `regionalMonthStart()` slot straight in | **In flight** on `claude/malayalam-kollavarsham`, shipping dark. Do not double-build |
| **Odia** | Solar month reckoning with Odia's own civil-day rule, plus the **Amli / Anka** era (the Anka regnal count skips certain numbers — this is a genuine arithmetic rule, not a name) | Ingress solver, `regionalMonthStart()` shape | **Rule and era formula are UNVERIFIED here.** I did not find a source in-repo and did not verify one. Do not implement from memory |
| **Assamese** | **Bhaskarabda** era; Assamese month names; the Assam civil-day rule | The Bengali solar path is structurally the same shape | **The civil-day rule is UNVERIFIED** — Assam is commonly described as following the same solar scheme as Bengal but is not guaranteed identical. Must be sourced before it is merged into `bengali-solar`'s rule |
| **Indian National Calendar (Rashtriya Panchang)** | A **tropical, arithmetic** calendar: Chaitra 1 = 22 March (21 in a Gregorian leap year), fixed 30/31-day months, Saka era | Nothing astronomical — it needs *no* ephemeris at all, only date arithmetic | Cheapest of the four to compute; **most expensive to explain**, because it shares the era number with the traditional Shaka year Ganak already prints under a label that currently misdescribes it (§4) |

### Band C — Full engine work, or externally published data Ganak cannot compute (2) · cost **L**

| Calendar | Why it is band C |
|---|---|
| **Nepali Bikram Sambat (Nepali Patro)** | Nepal's civil calendar month lengths are fixed by the **Nepal Panchanga Nirnayak Samiti**'s published almanac, not derived purely from computed sankranti moments. Getting it right means shipping and maintaining published year tables (Ganak has no equivalent dependency today), or accepting visible drift from every Nepali wall calendar. Ganak has **zero** Nepali code today — `grep -rni "nepali\|bikram" src` returns nothing. Also carries the worst name collision in this document (§6) |
| **Gaudiya / ISKCON Vaishnava calendar** | **Gaurabda** era, its own month names (the Vaishnava set, not the Sanskrit set), and — the real cost — its own Ekadashi and **Mahadvadashi** break-fast rules, which are the whole point of the calendar for its users. Partial credit: Ganak already has a Smarta/Vaishnava Ekadashi toggle at `src/screens/MuhuratHub.tsx:774-788` with a bilingual caveat at `:788`. That is an Ekadashi *variant* switch, **not** a calendar; treating it as one would ship a half-calendar under a name devotees will hold to a high standard |

### Counts

- **4 shipped and complete** (Amanta, Purnimanta, Tamil, Bengali)
- **4 need names and a label only** (Marathi, Telugu, Kannada, Gujarati) — **S**
- **4 need one new rule or era** (Malayalam *in flight*, Odia, Assamese, Indian National) — **M**
- **2 need real engine work** (Nepali, Gaudiya/ISKCON) — **L**

**14 candidates. Half the shortlist is words, not astronomy.**

---

## 6. Vikram Samvat and Shaka — the part that will actively mislead if shipped carelessly

### 6.1 Where the era years live today

Computed at `src/engine/panchang.ts:190-203`; exposed as `P.samvat` at
`src/engine/today-panchang.ts:91,115`; rendered at `src/screens/MuhuratHub.tsx:673-675`
inside a table that starts collapsed (`showPanch`, `:111`). Nowhere else. That is the
whole surface area, and it is why the owner could not find Vikram Samvat.

### 6.2 The name collision — mandatory reading

**"Vikram Samvat" and "Bikram Sambat" name two different calendars.** Both count from
the same epoch, both run about **57 years ahead** of the Gregorian year, both will read
"2083" during 2026. They are not the same calendar:

| | North-Indian **Vikram Samvat** | Nepali **Bikram Sambat** | Gujarati **Vikram Samvat** |
|---|---|---|---|
| Reckoning | **Lunar** (purnimanta months) | **Solar** (sidereal months) | **Lunar** (amanta months) |
| Year rolls at | Chaitra Shukla 1 (~mid/late March) | Baishakh 1 = Mesha Sankranti (~14 April) | Kartika Shukla 1 (day after Diwali, ~November) |
| In Ganak today | ✅ computed (`vikram`) | ❌ absent entirely | ✅ computed (`guj`) |

So on, say, 20 March 2026 the North-Indian year has rolled to 2083 while the Nepali year
is still 2082 for another three weeks and the Gujarati year is still 2082 for another
seven months. Ganak's own output confirms two of the three: on 2026-08-18 it prints
Vikram **2083** and Gujarati **2082** on adjacent rows, unexplained.

**Rule (non-negotiable if anything ships):** an era year is never printed as a bare
number. It is always `<calendar name> <number>`, in both languages, e.g.
`Vikram Samvat 2083 (North Indian, lunar)` / `विक्रम संवत् 2083 (उत्तर भारतीय, चंद्र)` and
`Bikram Sambat 2082 (Nepali, solar)` / `बिक्रम सम्बत् 2082 (नेपाली, सौर)`. A reader who
sees two different numbers both called "Vikram Samvat" with no qualifier will conclude
Ganak is broken — and will be right to.

### 6.3 A second, live inconsistency the owner should decide on

Ganak prints **three different samvatsara (60-cycle) names for the same day**:

> 2026-08-18, Delhi — Shaka 1948 **Parabhava** · Vikram 2083 **Siddharthi** ·
> Gujarati 2082 **Pingala**

This comes from three different offsets into one array —
`SAMVATSARA[(shaka+11)%60]`, `[(vikram+9)%60]`, `[(guj+8)%60]`,
`src/engine/panchang.ts:199-201`. Northern and southern reckonings of the 60-year cycle
**do** genuinely differ (the northern count is commonly described as running ahead of
the southern), so this may be intentional and correct.

**It is UNVERIFIED.** I found no source, comment or gate in the repo justifying the three
offsets, and I did not verify them against a published almanac. Three unexplained year
names in three adjacent rows is a correctness question a working astrologer (P5) will
notice immediately. **Action: verify against two independent sources and record the
result in `plans/regional-calendar-source-register.md` before any era text is promoted
out of the collapsed table.** If the divergence is correct, it needs a one-line gloss;
if it is an off-by-one, it is a real bug.

Related, smaller: the 60-name cycle is spelled two different ways in two arrays —
`SAMVATSARA` (`src/engine/panchang.ts:106`, e.g. "Pramoda", "Durmukha", "Hemalamba",
"Anala") and `TAMIL_YEARS_EN` (`src/engine/calendar-conventions.ts:45`, e.g.
"Pramodoota", "Durmukhi", "Hevilambi", "Nala"). Both are defensible romanisations; having
two is not. One source of truth, per the standing rule enforced by
`validation/language-leak-scan.cjs` for rashi/nakshatra/graha names.

### 6.4 Which calendars carry which era

| Calendar family | Era to print |
|---|---|
| Hindu lunar (Amanta/Purnimanta), Marathi, Telugu, Kannada | Vikram Samvat and/or Shaka Samvat + samvatsara |
| Gujarati | Vikram Samvat, **Kartikadi** — different number for ~5 months of the year |
| Tamil | 60-name cycle year (already shipped) |
| Bengali | Bangabda (already shipped) |
| Malayalam | Kollam Era (in flight) |
| Assamese | Bhaskarabda (not built) |
| Odia | Amli / Anka (not built, rule unverified) |
| Nepali | Bikram Sambat, **solar** (not built) |
| Gaudiya/ISKCON | Gaurabda (not built) |
| Indian National | Saka — **same number, different calendar** from traditional Shaka |

---

## 7. Default selection and persistence

### 7.1 What a first-time reader sees before choosing anything

Today: `canonical`, always, for everyone, worldwide
(`resolveConvention(null) → canonical`, `src/engine/calendar-conventions.ts:171-177`).

Recommended: the default is decided by §10's open decision. Under either option the
following hold:

- **A reader who has chosen nothing must never be shown a calendar without being able to
  tell why.** Owner's standing UX principle (AGENTS.md): "the user must always be able to
  tell what the app is doing." If Ganak infers Tamil from Chennai, it says so on the line
  it changed, with a one-tap change affordance — never a silent switch.
- **The safe fallback is `canonical`, unchanged**, for any city that does not map to a
  region and for any unknown or disabled id. That behaviour already exists and is gated
  (`resolveConvention`, `:171-177`; the bilingual recovery banner at
  `src/screens/DailyScreen.tsx:342`).
- **Nothing about the reader's *timings, festivals or observances* changes with the
  calendar.** The existing copy already promises this — "This only changes the date and
  month names; timings and observances for {city} stay the same"
  (`src/screens/DailyScreen.tsx:339`) — and `validation/calendar-convention-invariance.cjs`
  proves it. Keep the promise and keep the sentence. **Exception to name honestly:** the
  Amavasya *name* does vary by convention today (§3.3), so either that branch is removed
  or the sentence gains a clause.

### 7.2 Persistence — the storage rule is strict here

**AGENTS.md, verbatim:** application code "must never call `localStorage` /
`sessionStorage` directly. Persistence is allowed only through
`src/storage/approved-storage.ts` … and only in its named `preferences` and `savedCharts`
stores." `preferences` "may contain non-sensitive comfort, language, place and follow
choices; **religious preference data must never sync or enter analytics without explicit
granular consent.**" `validation/parse-check.js` enforces the storage ban.

A calendar choice is a **regional/religious preference**. Therefore:

1. It is stored in `approvedStorage.preferences` under a single key (e.g. `calendar`),
   **never** as an ad-hoc browser key, and never by touching `localStorage`. The adapter
   already wraps everything in one envelope (`ganak:approved-storage:v1`).
2. It is **local-only**. It must not sync and must not enter analytics. Ganak already
   gates analytics behind `analyticsConsentGranted()`
   (`src/storage/approved-storage.ts:97-102`); the calendar choice stays outside it
   regardless.
3. `src/components/url-prefs.ts` describes itself as the "replacement for banned browser
   storage". That framing is now out of date — the approved adapter *is* the sanctioned
   store. URL and storage are complements: **URL = shareable state, storage = the
   returning reader's default.**

**Precedence, in order (highest wins):**

```
1. ?cal= in the URL          (a shared or bookmarked link)
2. saved preference          (approvedStorage.preferences.calendar)
3. inferred from the city    (only if §10 Option 2 is chosen)
4. canonical                 (the safe default that already exists)
```

**A shared URL must not silently rewrite the saved default.** AGENTS.md states this
explicitly. So: opening a friend's `?cal=tamil-solar` link shows Tamil for that visit and
leaves the reader's own saved choice untouched; only an explicit interaction with the
picker writes to storage. If the reader wants the shared calendar kept, they choose it —
one tap, deliberate.

**Persistence across the three things that must not reset it** (owner's standing
principle: "no state resets without a user action"):

| Reader changes… | Calendar must… | Today |
|---|---|---|
| City | stay chosen — with one caveat: if the reader's calendar was *inferred* from the old city and they move to another region, Ganak may re-infer, **but only visibly** | stays, via URL, on Daily only |
| Date | stay chosen | stays, via URL, on Daily only |
| Language (hi/en) | stay chosen; only the words change | works |
| Screen (Festival guide, Muhurat, Kundli…) | stay chosen | **broken** — `calendarMode` is local to `DailyScreen` |
| New tab / next day | stay chosen | **broken** — nothing persisted |

The last two rows are the real work in this section, and neither needs new astronomy:
one is lifting `calendarMode` to app-level state, one is a `preferences` read/write.

---

## 8. Naming and source confidence, per calendar

**The backlog rule is absolute: no regional name may be invented or loosely
translated.** This section therefore reports what *is* sourced and marks the rest as a
blocker rather than filling it in from memory. An unsourced name in a spec becomes a
shipped name in code, and a wrong month name in someone's own script is the kind of error
that loses a reader permanently.

**Confidence key:** **A** = two independent sources already frozen in-repo.
**B** = one source verified for this document. **C** = pattern-derived from Ganak's own
shipped convention, not an external source. **✗** = not sourced — blocker.

| Calendar | Native script | English | Hindi | Month names | Conf. | Source |
|---|---|---|---|---|---|---|
| Hindu lunar (Amanta) | — (Sanskrit set) | South & West Indian lunar (default) | दक्षिण व पश्चिम भारतीय चंद्र (मानक) | ✅ shipped | **A** | `src/engine/panchang.ts:105`; `src/i18n/panchang-terms.ts:25-31`; frozen by `validation/calendar-convention-invariance.cjs` |
| Hindu lunar (Purnimanta) | — | North Indian lunar (Sawan etc.) | उत्तर भारतीय चंद्र (सावन आदि) | ✅ shipped | **A** | as above |
| Tamil | தமிழ் நாட்காட்டி · திருக்கணிதம் | Tamil calendar | तमिल कैलेंडर | ✅ 12 native + hi + en | **A** | `plans/regional-calendar-source-register.md` — Tamil Virtual Academy + Drik Panchang Tamil calendar; *The Indian Calendar* (Sewell & Dikshit) for the sunset rule |
| Bengali | বাংলা পঞ্জিকা · বিশুদ্ধ সিদ্ধান্ত | Bengali calendar | बंगाली कैलेंडर | ✅ 12 native + hi + en | **A** | same register — Prokerala Bisuddha Siddhanta + published WB Panjika; Sewell & Dikshit for the sunrise rule |
| Malayalam | മലയാളം കലണ്ടർ (in flight) | Malayalam Calendar | मलयालम कैलेंडर | in flight, **not on main** | **B** | Drik Panchang calendar index (fetched 2026-08-18, `/calendars/vedic-calendars.html`); branch `claude/malayalam-kollavarsham` |
| Marathi | ✗ | Marathi Calendar | मराठी कैलेंडर (C) | ✗ **blocker** | **B / ✗** | English name: Drik index. Month names: none |
| Gujarati | ✗ | Gujarati Calendar | गुजराती कैलेंडर (C) | ✗ **blocker** | **B / ✗** | English name: Drik index. Month names: none |
| Telugu | ✗ | Telugu Calendar | तेलुगु कैलेंडर (C) | ✗ **blocker** | **B / ✗** | English name: Drik index. Month names: none |
| Kannada | ✗ | Kannada Calendar | कन्नड़ कैलेंडर (C) | ✗ **blocker** | **B / ✗** | English name: Drik index. Month names: none |
| Odia | ✗ | Odia Calendar | ओड़िया कैलेंडर (C) | ✗ **blocker** | **B / ✗** | English name: Drik index. Rule + Anka era: **unverified** |
| Assamese | ✗ | Assamese Calendar / Assamese Panjika | असमिया कैलेंडर (C) | ✗ **blocker** | **B / ✗** | English name: Drik index. Rule + Bhaskarabda: **unverified** |
| Nepali | ✗ | Nepali Patro / Nepali Calendar | नेपाली पात्रो (C) | ✗ **blocker** | **B / ✗** | English name: Drik index. Month lengths need the Nepal Panchanga Nirnayak Samiti almanac |
| Gaudiya / ISKCON | ✗ | ISKCON Calendar / ISKCON Panchang | इस्कॉन कैलेंडर (C) | ✗ **blocker** | **B / ✗** | English name: Drik index. Vaishnava month set + Gaurabda + Mahadvadashi rules: none |
| Indian National | — | Indian Calendar (Rashtriya Panchang) | भारतीय राष्ट्रीय कैलेंडर (C) | Sanskrit set, tropical months | **B / ✗** | English name: Drik index. Month-length rule needs a Government of India / Rashtriya Panchang citation |

**Where sources or usage disagree — stated, not silently resolved:**

1. **Bengali has at least three legitimate published reckonings.** Ganak ships Vishuddha
   Siddhanta. Bangladesh's Bangla Academy fixed civil calendar and Drik's separately
   labelled "V Suryasiddhanta" Bengali view are different calendars that share the name
   "Bengali calendar" — the source register already refuses to merge them
   (`plans/regional-calendar-source-register.md` § Convention decisions). Any Assamese
   work must respect the same refusal.
2. **Tamil has Thirukanitha and Vakya Panchangam.** Ganak ships Thirukanitha and names it
   on screen (`src/screens/DailyScreen.tsx:340`). Vakya remains in genuine regional use.
   Not silently merged.
3. **Devanagari transliterations of non-Devanagari month names are an editorial act.**
   Ganak already ships `TAMIL_HI` and `BENGALI_HI`; those are sourced. A Telugu or
   Kannada `*_HI` set must be sourced the same way, or Hindi mode shows the native script
   with a Hindi *gloss* rather than a transliteration Ganak invented.
4. **The Hindi calendar names in column 4 marked (C)** follow the shipped pattern
   `<language in Hindi> + कैलेंडर` (`src/engine/calendar-conventions.ts:32-33`). That is
   an internal convention, **not an external source**, and is marked as such.
5. **Two romanisations of the 60-name cycle** ship today (§6.3). Pick one, cite it.

**Gate implication:** `validation/regional-calendar-modes.cjs` currently demands **two**
independent terminology sources per regional set
(`REGIONAL_TERMINOLOGY.<x>.sources.length < 2` → fail) and a 365-day published-anchor
series per mode. Every band-A calendar inherits that bar. That is the right bar and this
spec does not propose lowering it — it is the reason band A is "cheap engineering,
real research".

---

## 9. UX placement, URL/state, and EN/HI/native-name behaviour

### 9.1 Answer before data

Ganak's design principle (AGENTS.md) is that a plain-language verdict renders before the
technical chart. The calendar area currently does the reverse: the *control* is a
full-height `<select>` with a label, and the *answer* — the actual date in the reader's
calendar — is `T.fMicro` body text beside it (`src/screens/DailyScreen.tsx:330-338`).

**Proposed shape (both languages, structure not final copy):**

> **आज — श्रावण शुक्ल 6 · विक्रम संवत् 2083**
> *अमान्त चंद्र पंचांग · दिल्ली · [कैलेंडर बदलें]*

> **Today — Shravana Shukla 6 · Vikram Samvat 2083**
> *Amanta lunar reckoning · Delhi · [change calendar]*

Line 1 is the **answer**: month, paksha, lunar day, era — at heading weight. Line 2 is the
**data**: the reckoning's name, the technical rule (Thirukanitha, Vishuddha Siddhanta),
and the change affordance. Line 2's technical half already exists and is already correctly
tagged `className="technical-only"` so the comfort layer can hide it
(`src/screens/DailyScreen.tsx:340`). The existing reassurance sentence ("Not sure? Keep
the default…", `:339`) stays — it is doing real work for P1.

The dropdown drops out of the control row and becomes a link on line 2. That also solves
the scaling problem: five options fit a `<select>`; fourteen do not, and a flat
alphabetical list of fourteen calendars is a worse experience than the four we have.

### 9.2 URL and state

- **Keep the param name `cal`.** Shared links exist. New ids are **additive only**;
  nothing is renamed or removed. Retired ids resolve silently through
  `CONVENTION_ALIASES` (`src/engine/calendar-conventions.ts:26`) — the pattern is proven
  and gated.
- **Push vs replace:** `chooseCalendarMode` uses `urlPrefPush`
  (`src/screens/DailyScreen.tsx:55`), so Back steps through calendar choices. The
  equivalent question for the *city* is an explicitly deferred owner decision (backlog
  E-1.2, noted in `validation/regional-calendar-modes.cjs`). **These two should be
  decided together and answered the same way** — it is confusing if Back undoes a
  calendar change but not a city change. Flagged in §10 rather than decided here.
- **Lift the state.** `calendarMode` must move from `DailyScreen`-local `useState` to
  app-level state so every screen that renders a month name inherits it. Note the
  file-ownership rule: `src/kundli-app.tsx` is integration-owned and must be reserved in
  `plans/task-log.md` before editing (AGENTS.md).
- **Disabled modes already recover visibly and bilingually** (`:342`). Every new calendar
  ships behind its own flag and inherits this for free.

### 9.3 EN / HI / native-name behaviour

Three fields per calendar, all three required before it can ship
(`CalendarConvention` already has exactly this shape: `en`, `hi`, `native?`,
`src/engine/calendar-conventions.ts:9-19`):

| Reader's language | Calendar name shown | Month name shown |
|---|---|---|
| English | English name | English/romanised name, **plus native script**, in the pattern already shipped: `d.monthNative · monthEn day, year` (`:150`) |
| Hindi | Hindi name | Devanagari name **plus native script**, same pattern |
| Either, regional calendar | native script always present | native script always present |

Rules:

1. **The native script is never dropped**, in either language. It is the reader's own
   name for their own calendar; showing only a romanisation is the "loose translation"
   the backlog forbids.
2. **`native` becomes required, not optional, for any regional calendar.** Today it is
   `native?` and the two pan-Indian modes correctly have none.
3. **Never transliterate a month name into Devanagari without a source** (§8, point 3).
4. **The language toggle changes words only** — never the reckoning, never the era, never
   the numbers. This follows the existing invariant that the engine speaks one language
   internally and localises only at the presentation edge
   (`src/i18n/panchang-terms.ts:1-10`, enforced by `validation/language-leak-scan.cjs`).
5. **Every new user-facing string is bilingual on the same commit.** `hi`/`en` parity is
   already enforced by `validation/screen-snapshots.cjs` and
   `validation/hindi-devotional-language.cjs`.

### 9.4 One-line copy fix that should not wait for any of the above

`src/screens/MuhuratHub.tsx:673` labels the traditional lunisolar Shaka year as the
"national calendar year" / "राष्ट्रीय पंचांग वर्ष". It is not the Indian National Calendar
(§4). Correct it to "Shaka Samvat (traditional Hindu era year)" /
"शक संवत् (पारंपरिक हिंदू संवत्)" or equivalent. This is a factual error in shipped copy,
independent of every decision below.

---

## 10. Open decisions — for the owner, presented not resolved

### DECISION 1 (the one the backlog names) — does the reader *pick*, or does Ganak *infer*?

**Option A — Picker-led (today's shape, extended).**
The reader chooses from a menu. Ganak defaults everyone to the pan-Indian lunar calendar
until they do.

*Costs:* zero new data, zero inference risk, no wrong guesses. But it is **poor
discovery** — the menu is chrome, and a reader who does not know Ganak has a Gujarati
calendar will never look for one; the growth persona's trigger is **recognition**, and a
control labelled "YOUR FAMILY CALENDAR" only fires that recognition for someone already
scanning the controls. It also **scales badly**: five options is a dropdown, fourteen is a
wall, and the wall lands on P1 — the reader least willing to read a list.
*Implication for later pages:* the choice must still be lifted to app state and persisted,
or it is meaningless beyond the Daily screen. **Option A does not avoid §7's work.**

**Option B — Inferred from the city, picker demoted to an override.**
The city the reader already typed selects the calendar. Chennai → Tamil. Ahmedabad →
Gujarati. Kolkata → Bengali. Anything unmapped → the pan-Indian default. A visible line
says which calendar is showing and why, with a one-tap change.

*Costs:* a **new city→region→calendar mapping table** that must itself be sourced and
reviewed (a state-level mapping is defensible; a city-level one has real edge cases —
Hyderabad, Bengaluru and Mumbai all have large multi-regional populations). A **diaspora
gap**: a Tamil family in London gets the pan-Indian default — and the diaspora is
precisely P1's other half. And an **inference must never be silent**, per the owner's
standing UX principle, so it costs a visible line of copy on the answer card.
*Implication for later pages:* the region becomes an app-wide fact rather than a screen
preference, so **one** module owns the mapping and every page reads it — which is the
architecture the app needs anyway once fourteen calendars exist.
*Mitigation for the diaspora gap:* the override is remembered (§7), so the London Tamil
reader pays **one tap once**, not one tap per visit.

**Recommendation — awaiting the owner, not decided.**
**Option B, with a visible non-silent banner and a one-tap override, and the override
persisted to `approvedStorage.preferences`.** Reasoning: it costs the primary persona
**zero taps** in the common case, it makes the feature *discoverable* rather than merely
*reachable* (which is the exact failure `validation/spec-journey.cjs` was written to
prevent), and it is the only option that stays usable at fourteen calendars. The diaspora
gap is real but is closed by remembering the override rather than by interrogating every
reader. **If the owner prefers A, nothing else in this spec changes** except that §7's
precedence list loses rung 3 — the persistence, state-lifting, naming and era work is
identical either way, so **this decision does not block starting the band-A name
sourcing.**

### DECISION 2 — is the calendar choice remembered on the device between visits?

Recommended: **yes**, in `approvedStorage.preferences`, local-only, never synced, never in
analytics (§7.2). The owner should confirm, because a calendar choice is arguably
religious-preference data and AGENTS.md holds that class to a higher bar. The alternative
— URL-only, as today — means a returning reader re-chooses every single visit, which
fails the owner's own "no state resets without a user action" principle.

### DECISION 3 — how far does band A go, and in what order?

Marathi, Telugu, Kannada and Gujarati are all cost **S**. Adding all four takes the menu
from 5 to 9 and reaches, by rough population, the large majority of Indian-language
readers. The owner should say whether to do all four as one slice or start with the one
with the strongest evidence trail (**Gujarati** — its era formula is already written and
running).

### DECISION 4 — Back-button behaviour, for calendar *and* city together

Calendar changes currently push a history entry (`urlPrefPush`); the same question for
city is explicitly deferred (backlog E-1.2, recorded in
`validation/regional-calendar-modes.cjs`). These are one decision, not two: does Back undo
a *preference*, or does it leave the screen? Recommended: **preferences replace, navigation
pushes** — Back should leave the screen, not step backwards through settings. Flagged here
so it is answered once for both.

### DECISION 5 — verify or fix the three samvatsara offsets (§6.3)

Ganak prints Parabhava / Siddharthi / Pingala for one day. This is either a correct
regional divergence needing one line of explanation, or an off-by-one. It needs a sourcing
decision (a religious-accuracy human gate under AGENTS.md) before era text is promoted out
of the collapsed table.

---

## 11. What is unverified in this document

Stated plainly, because an unverified claim here is worse than an omission.

1. **The Odia month-start rule and the Amli/Anka era formula.** Not sourced, not verified.
   Classified from general description only.
2. **Whether the Assamese civil-day rule is identical to Bengal's.** Commonly described as
   the same solar scheme; not verified. Must not be merged into `bengali-solar`'s rule on
   an assumption.
3. **Whether Ganak's three samvatsara offsets are correct** (§6.3). The *outputs* are
   verified by running the engine; the *correctness* of the offsets is not.
4. **Nepal's published month lengths.** I have not confirmed how far a purely computed
   sidereal-sankranti Nepali calendar would diverge from the official almanac in any given
   year, only that the official calendar is almanac-fixed rather than computed. The band-C
   classification rests on that; the size of the divergence is unmeasured.
5. **Marathi, Gujarati, Telugu, Kannada, Odia, Assamese, Nepali and Gaudiya month names in
   native script.** Deliberately **not** written in this document. Filling them from
   memory is exactly what the backlog forbids; they belong in
   `plans/regional-calendar-source-register.md` with two sources each, and the existing
   gate already fails a set with fewer than two.
6. **Drik Panchang's calendar list** was read from
   `https://www.drikpanchang.com/calendars/vedic-calendars.html` and
   `/calendars/indian/indiancalendar.html` on 2026-08-18. Used only to establish *which
   calendar names a competitor offers* — not for any date, rule or month name. Competitor
   page text is treated as data, not as a source of astronomical truth.
7. **The two in-flight branches** (§3.5) were inspected but are **not** on `origin/main`.
   Nothing in this spec assumes either lands, and §5 classifies Malayalam on main's
   astronomy.

---

## 12. Suggested sequencing (for the backlog, not a commitment)

| Step | Work | Cost | Blocked on |
|---|---|---|---|
| 0 | Fix the "national calendar year" mislabel (§9.4) | minutes | nothing |
| 1 | Resolve DECISION 5 — verify the samvatsara offsets; unify the two 60-name arrays | research | owner sourcing gate |
| 2 | Put the era on the Daily answer with its calendar name attached, EN + HI (§6.2) | small | step 1; coordinate with `claude/hora-usefulness`, which has already started this |
| 3 | Lift `calendarMode` to app state; persist via `approvedStorage.preferences` (§7) | small–medium | DECISION 2; reserve `src/kundli-app.tsx` in `plans/task-log.md` |
| 4 | Source and land band-A names, one calendar per slice, two sources each (§8) | research-heavy, code-light | DECISION 3 |
| 5 | Rebuild the picker as an answer-line override (§9.1) | medium | DECISION 1 |
| 6 | Band B, one at a time, each dark-flagged with a 365-day fixture | medium each | per-calendar sourcing |
| 7 | Band C — only if the owner wants them; each is a project | large | owner prioritisation |

Steps 0–3 deliver the owner's original complaint (Vikram Samvat is findable) and are not
blocked by DECISION 1.
