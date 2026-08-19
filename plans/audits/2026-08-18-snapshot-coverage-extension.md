# Screen-snapshot coverage extension — 2026-08-18

Backlog **#65 (VERIFY-SNAPSHOTS)**, branch `claude/snapshot-coverage-0818`.
Extends `validation/screen-snapshots.cjs` from 7 surfaces to 27, and records every
defect the new baselines exposed.

Gate after the extension:

```
✓ screen-snapshots: 56 baselines match · 27 screens × 2 languages + chart/transit results
  initial state only (20): prashna, chart, matching, calendar-search, rectify, bnn, utility-*
    — the answer appears after Calculate / Cast; static render cannot press a button.
  scope: rendered TEXT only — layout, overflow and contrast still need a human at 375px.
```

## 1. What is now covered

New baselines, both languages (`validation/snapshots/`):

| key | screen | state proved |
| --- | --- | --- |
| `calendar-year` | `CalendarPage.tsx` | full 2026 fast/festival calendar, 12 months |
| `calendar-search` | `CalendarPage.tsx` | search results for the pinned query `ekadashi` |
| `rectify` | `RectifyScreen.tsx` (`RectifyModule`) | sweep table, D-9/D-60/KP markers, starting mahadasha |
| `bnn` | `JyotishBnnScreen.tsx` (`BNNModule`) | directional chart, combination buckets, Jupiter timing, Tier-C reading |
| `bhrigu` | `JyotishBnnScreen.tsx` (`BhriguModule`) | Bhrigu Chakra, BSP rules, Jupiter progression |
| `utility-catalogue` | `UtilityCalculatorScreen.tsx` | calculator catalogue |
| `utility-notfound` | `UtilityCalculatorScreen.tsx` | unknown-calculator state |
| `utility-<slug>` ×14 | `UtilityCalculatorScreen.tsx` | each calculator's form, method-and-limits copy and long-form explainer |

**The old skip note was two-thirds wrong.** It said calendar / rectify / bnn were
"inner modules needing parent-computed data", so rendering them would mean
fabricating that data. In fact `CalendarPage` scans the year itself and
`RectifyModule` runs its own sweep, both inside `useMemo` — and `useMemo` *does*
run under `renderToStaticMarkup`. Only BNN/Bhrigu really are parent-fed, and the
parent feeds them `computeKundli(...)`, so the honest fix is to run the real engine
at the pinned fixture (the same composition `snapshot-results.cjs` already uses),
not to invent a result. Calculator routes come from the app's own
`utilityFromPath()`, never from hand-built route objects.

Determinism discipline is unchanged: frozen clock (2026-08-10T06:00Z), pinned
Mumbai place and 1990-07-15 08:30 birth fixture, no golden file pinned to the real
sky. Re-running next month yields the same bytes.

The gate now also prints, on a green run, which screens are covered in their
**initial state only** — a pass must never be read as "this screen is fully proven".

## 2. Defects the new baselines exposed

### Fixed here (the gate refused the baselines otherwise)

1. **`src/screens/JyotishBnnScreen.tsx` — every graha name printed in Latin in
   Hindi mode.** ~20 render sites across both modules: the reference picker, the
   directional chart, the combination buckets, the seven core combinations,
   Parivartana, the Rahu–Ketu split, the retrograde shadow, the Jupiter-transit
   chips, the Tier-C reading, and Bhrigu's cycle lord, occupants, BSP rows and
   progression chips. A Hindi reader saw `Venus`, `Saturn`, `Ketu`. Now routed
   through `panchangTerm(lang, "planet", …)`; colour maps and component state still
   key off the English engine name.
2. **`src/screens/RectifyScreen.tsx` — same class.** KP ascendant sub-lord,
   starting mahadasha, the sweep table's 3-letter `Ven`/`Ket` abbreviations, the
   event-anchor house lord and the running mahadasha–antardasha pair. Hindi has no
   3-letter abbreviation, so the sweep column shows the full name there — column
   width is layout, not text. The hard-coded `⟵ sign` marker in the same table was
   also untranslated; now `⟵ राशि` in Hindi.

Both are exactly the failure #65 was opened for: no table for a table-scanning gate
to find, caught only by rendering the screen.

### Recorded, NOT blessed — handoff (no gate can see these today)

3. **`src/engine/festivals.ts:576` — Ekadashi names ride on the *Gregorian* month.**
   `const month = monthNames[(m - 1 + 9) % 12]` derives a fast's lunar month from the
   civil month, so the name drifts apart from the real lunar month. Visible in
   `validation/snapshots/calendar-search.{en,hi}.txt` (both languages):
   `Apara Ekadashi` appears **twice** — 2027-06-01 and 2027-06-30, both keyed
   `Jyeshtha_Krishna_11`; **Yogini Ekadashi is missing from all of 2027**; Kamika is
   printed on 2027-08-28 (really Bhadrapada Krishna = Aja) and Aja on 2027-09-26
   (really Ashwina Krishna = Indira). 2026 happens to line up, which is why nothing
   caught it. The wrong names stay in the baseline deliberately: a baseline records
   what a reader sees, and the fix will show up as the diff.
4. **`src/screens/CalendarPage.tsx:19,21` — English month abbreviations in Hindi.**
   `fmtFull` always uses the Latin `MOs` array, so the Hindi calendar reads
   `गुरु, 1 Jan 2026`. 256 occurrences in `calendar-year.hi.txt`. The month *headers*
   on the same page are localised (`MO`), so one page mixes both.
   Not fixed here only because it is the local half of a systemic problem — see 5.
5. **`src/components/format.ts` (`fmtDateT`) — same defect, product-wide.** Jupiter
   transit dates in `bnn.hi.txt` render `14 May 2025`, `18 Oct 2025`, … in Hindi
   mode. File is owned by another agent this session; 4 and 5 should be fixed
   together as one Hindi-date pass.
6. **`src/screens/JyotishBnnScreen.tsx:74` — `East / South / West / North`
   untranslated** in the Hindi directional chart.
7. **`src/engine/bhrigu.ts` `BNN_KARAKA` — significations are English-only**
   (`soul`, `spirituality`, `intellect`, `mind`, `spouse`, `energy`, `karma`,
   `foreign`) and render raw under Hindi planet names. The Hindi section header
   also shows the placeholder `पारंपरिक कारकत्व` where English shows the real karaka.
8. **`src/screens/JyotishBnnScreen.tsx:121` — core-combination relations raw
   English in Hindi** (`conjunct`, `2nd · future`, `5th · trine`,
   `hidden — not in combination`, `11th`) — while the file *defines* a `relationHi`
   map at line 28 that is applied only to the Jupiter-transit chips. The defect and
   its fix sit ten lines apart.
9. **Content parity: Hindi loses the meanings entirely.** `themeText()`
   (`JyotishBnnScreen.tsx:29`) and the `hi ? "…" : b.theme` / `r.theme` pattern in
   `BhriguModule` swap **every** per-combination and per-house meaning for one
   generic sentence. English gets `fortune, dharma, father, guru, travel`; Hindi gets
   the identical sentence 7× in `bnn.hi.txt` and ~19× in `bhrigu.hi.txt`. This is not
   a leak, it is missing content, and only a rendered snapshot makes it obvious.
10. **Hindi ordinals are not Hindi.** `ord()` in `BhriguModule` yields `1वाँ`,
    `2वाँ`, `3वाँ`. Should be पहला / दूसरा / तीसरा (or प्रथम / द्वितीय / तृतीय).
11. **`CalendarPage` year page says "Upcoming" but lists the whole year.** At the
    frozen date of 10 August the page is titled `Upcoming fasts & festivals · 2026` /
    `आगामी व्रत और त्योहार` and opens with January. Either the copy or the range is wrong.
12. **Low confidence, for the Hindi reviewer:** the calculators label the Gregorian
    birth-date field `तिथि`, which everywhere else in Ganak means the lunar day.
    `जन्म दिनांक` may be the safer label. (`श्राद्ध तिथि`'s `निधन की तिथि` is arguably fine.)

Nothing else surfaced: no `[object Object]`, no raw keys, no `undefined`/`NaN`, no
empty sections, no Devanagari in any English baseline, and no Sanskrit rashi name
in English output (E-1.0 holds on every new screen).

## 3. Still uncovered, and why

- **`FestivalGuideScreen.tsx` and `MuhuratHub.tsx`** — the only remaining screens
  with no rendered proof. Deliberately left out: both are under active edit by other
  agents right now, and committing baselines for a file mid-flight hands that agent a
  red gate. Next slice; nothing structural blocks them.
- **Everything behind a button.** `renderToStaticMarkup` runs no effects and no
  handlers, so the 14 calculators' answers (Calculate), Matching's Dashakoota, the
  Rectify event anchors and the BNN reference switch are covered in their initial
  state only. Closing that needs either a DOM test renderer (jsdom / `react-dom/client`
  — a new dependency, so an owner call) or more engine+display compositions in the
  style of `snapshot-results.cjs`, which prove the values but not the screen's own JSX.
- **Anything that is not text.** Layout, overflow, contrast and touch targets at
  375px still need a human. `PlaceInput`'s selected city lives in an input `value`
  attribute, so a text snapshot cannot see it either.

## 4. Proof the gate bites

Perturbed one rendered string — the Back control in `CalendarPage.tsx`, `‹` → `«`:

```
FAIL calendar-year.en: rendered text changed
    -1: ‹ Back
    +1: « Back
FAIL calendar-year.hi: rendered text changed
    -1: ‹ वापस
    +1: « वापस
FAIL calendar-search.en: rendered text changed
    -1: ‹ Back
    +1: « Back
FAIL calendar-search.hi: rendered text changed
    -1: ‹ वापस
    +1: « वापस

✗ screen-snapshots FAILED (4)
exit=1
```

Reverted, unchanged file, same command:

```
✓ screen-snapshots: 56 baselines match · 27 screens × 2 languages + chart/transit results
exit=0
```

An earlier attempt perturbed a string that no baseline reaches (the "no page for this
entry yet" fallback) and the gate stayed green — correctly, and a reminder that
coverage is per rendered branch, not per file.

## 5. Other gates run on this branch

```
✓ parse-check clean: src/kundli-app.tsx
✓ language-leak-scan: 124 files · 1 source of truth · 12 rashi (+12 English aliases) · 27 nakshatra · 9 grahas
✓ design-system-primitives PASS (211 checks)
✓ header-language-purity: 124 source files · 0 reversed-language headings
HINDI DEVOTIONAL LANGUAGE PASSED (69 source files; 57 merged guides checked)
```

The 14 pre-existing baselines are byte-identical after these changes, so no
already-covered screen moved.
