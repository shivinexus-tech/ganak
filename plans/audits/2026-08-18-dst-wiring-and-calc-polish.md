# Fix — wiring the daylight-saving fix through to the screen, plus the remaining calculator defects

**Agent:** Claude Code (fix lane). **Branch** `claude/wire-dst-and-calc-polish`,
worktree `.scratch/worktrees/wire-dst`, base `origin/main` `19c806e`.
**Closes:** the **STILL OPEN** section of
`plans/audits/2026-08-18-dst-zone-offset-fix.md` (the call sites for **F1**), and
findings **F9**, **F11**, **F12**, **F13** plus the `तिथि` label and the stale Sade
Sati retrograde footnote from
`plans/audits/2026-08-18-bugbash-utility-calculators.md`.

**Files changed:** `src/screens/UtilityCalculatorScreen.tsx`,
`src/screens/MatchingScreen.tsx`, `src/screens/ChartScreen.tsx`,
`src/screens/RectifyScreen.tsx`, `src/engine/medical-muhurat.ts`,
**`src/engine/personal-muhurat.ts`** (see "Outside the assigned file list" below),
`src/components/AppErrorBoundary.tsx`, `validation/zone-offset-dst.cjs`,
`validation/screen-snapshots.cjs`, `validation/utility-calculators.cjs`,
26 files under `validation/snapshots/`. **`src/engine/panchang.ts` was not
touched** — the engine fix was already done and proven; this lane only wires it.

---

## 1. The daylight-saving fix now reaches the reader

Yesterday's engine fix made `zoneOffset` resolve the offset **at the wall clock it
is given**. Every caller, however, still passed only the birth *date*, so the
screen kept printing the old, wrong answer. This lane hands the birth clock through.

### Before → after, at the screen

Rendered by pressing Calculate on the real `UtilityCalculatorScreen`
(`renderToStaticMarkup`, the same harness `validation/screen-snapshots.cjs` uses),
not by calling the engine.

```
### New York 2024-03-10 00:30 — spring forward at 02:00, so 00:30 is still EST (−5)
  /calculator/baby-name
-   ANSWER FIRST  Suggested starting sound: Se
-   Calculated for: New York, United States · UTC−04:00
+   ANSWER FIRST  Suggested starting sound: So
+   Calculated for: New York, United States · UTC−05:00
  /calculator/nakshatra
-   ANSWER FIRST  Your birth nakshatra is Purva Bhadrapada, pada 1.
+   ANSWER FIRST  Your birth nakshatra is Purva Bhadrapada, pada 2.

### New York 1961-10-29 00:30 — clocks went back at 02:00, so 00:30 is still EDT (−4)
  /calculator/lagna
-   ANSWER FIRST  Your ascendant is Leo.
-   Calculated for: New York, United States · UTC−05:00
+   ANSWER FIRST  Your ascendant is Cancer.
+   Calculated for: New York, United States · UTC−04:00
```

### The audience this app is built for did not move

The same eight-case rendered run, diffed before against after. **Exactly three
lines changed — all three are the New York DST-transition births above.** Every
control is byte-identical:

| Control | Answer, before and after |
|---|---|
| New Delhi 1990-01-01 12:00 · lagna | `Your ascendant is Pisces.` · UTC+05:30 |
| New Delhi 1990-01-01 12:00 · nakshatra | `Dhanishta, pada 4.` · UTC+05:30 |
| New Delhi 2024-03-10 00:30 · baby-name | `Suggested starting sound: Soo` · UTC+05:30 |
| Tokyo 2024-03-10 00:30 · lagna | `Your ascendant is Scorpio.` · UTC+09:00 |
| New York 1990-06-21 09:15 · lagna (mid-summer, no transition) | `Your ascendant is Cancer.` · UTC−04:00 |

Backed by a sweep rather than five spot checks: **3,636 births across all 116
Indian cities in the gazetteer, 1930–2030, at 00:30/01:30/02:30/03:30/12:00/23:30
— 0 answers move** when the clock is wired through
(`validation/zone-offset-dst.cjs`). That is the invariant that matters: wiring the
clock through can only change an answer where the day-level and clock-level
offsets differ, and for an Indian birth they never do.

### The call sites — and the one the audit's table missed

The DST audit listed eight sites. I walked every `zoneOffset` caller in `src/`
myself rather than trusting the list, and there are **nine**, in six files:

| File | What it computes | Now passes |
|---|---|---|
| `src/screens/UtilityCalculatorScreen.tsx` `resolveZone` | all 14 public calculators | `hh, mi` |
| `src/screens/MatchingScreen.tsx` ×2 | the two charts Dashakoota scores | `bhh/bmi`, `ghh/gmi` |
| `src/screens/ChartScreen.tsx` ×4 | form offset, saved chart, cast chart, ayanamsa recompute | via a new `tzAtBirth` helper |
| `src/screens/RectifyScreen.tsx` | birth-time rectification | `hhB, miB` (the parse moved above the offset) |
| `src/engine/medical-muhurat.ts` `natalMoonSign` | natal Moon sign for the medical finder | `birth.hh, birth.mi` |
| **`src/engine/personal-muhurat.ts` `natalAnchors`** | **janma nakshatra, janma rashi, Moon bhinnashtakavarga** | `birth.hh, birth.mi` |

`personal-muhurat.ts:44` is **not in the audit's table** and was not in this lane's
assigned file list. It is the same defect in the same shape: it takes a birth with
`hh`/`mi` in scope and resolved the offset from the date alone, so on a
transition-day birth the janma nakshatra could be the neighbouring one — which
re-cuts every Tara Bala row the personal muhurat finder returns.

**Every other caller was checked one at a time and is genuinely day-scoped**, and
all of them stay on the four-argument form. Passing a clock time to any of them
would be a new bug, because a panchang day is not a birth instant:
`today-panchang.ts` (4 calls), `festivals.ts` (7), `muhurat.ts` (4),
`daily-windows.ts`, `panchaka.ts`, `lakshmi-puja.ts`, `eclipse.ts`, `chhath.ts`,
`vedic-season-clock.ts`, `calendar-conventions.ts` (2),
`regional-calendar-shadow-check.ts` (2), `skanda-ayyappa.ts` (2), `navratri.ts`
(3), `medical-muhurat.ts` (the finder day), `DailyScreen.tsx` (3),
`CalendarPage.tsx`, `FestivalGuideScreen.tsx` — 35 calls in 16 files. Each one
resolves a **civil day** (a probe date, a sunrise day, an ingress day), not a
recorded clock time. Two files (`MuhuratHub.tsx`, `MedicalMuhuratScreen.tsx`)
import `zoneOffset` and never call it; both are owned by other lanes, so the dead
imports are recorded below rather than removed.

---

## 2. The Sade Sati footnote that described a bug that no longer exists

Under the phase list, the page said *"When Saturn retrogrades, a phase can return
in separate segments; Ganak shows those segments separately."* That was true of the
defect fixed earlier the same day. It is now false — retrograde re-entries are
merged into one passage. Replaced with the merged-passage wording
`src/data/sade-sati-report.ts` already uses in the method copy, in both languages:

```
Saturn turns retrograde inside every Sade Sati and briefly steps back into the sign
it just left; Ganak counts those returns as part of the same passage, so each phase
is shown as one continuous span.

हर साढ़ेसाती में शनि वक्री होकर थोड़े समय के लिए पिछली राशि में लौट आता है; गणक इन
वापसियों को उसी एक गोचर का भाग मानता है, इसलिए हर चरण एक सतत अवधि के रूप में दिखाया
जाता है।
```

---

## 3. The remaining calculator defects

### The date field labelled `तिथि`

`तिथि` means the **lunar day** everywhere else in Ganak; the field holds an ordinary
calendar date. `MatchingScreen`, `MedicalMuhuratScreen` and `ChartScreen` already
say `जन्म तिथि`. The calculator form now matches, in both languages, with the time
field brought along so the pair reads as one thing:

* `तिथि` → `जन्म तिथि` · `Date` → `Date of birth`
* `समय` → `जन्म समय` · `Time` → `Time of birth`

The Shraddha calculator's overrides (`निधन की तिथि` / `Date of passing`) are
unchanged. This is the whole of the snapshot re-baseline: 14 calculators × 2
languages × 2 labels, plus one Hindi line in §3 below. Every changed line was read.

### F9 — inputs are checked per field, and a birth date is never silently corrected

Three separate problems, all closed:

* **29 February in a non-leap year** was accepted and became 1 March. Ganak was
  quietly changing someone's birth date and then answering with confidence.
* **No year range guard at all** — year 1 or 9999 returned a confident chart from an
  ephemeris whose ΔT polynomials only run 1800–2150 (`src/engine/ephemeris.ts`).
* **One message for four fields** — *"Could not calculate. Check the date, time and
  place."* never said which field, and never mentioned the Sade Sati check date.

Each field is now validated on its own and named in its own message:

```
The date of birth: February 1990 has 28 days, so 29 February 1990 is not a real
date. Ganak will not move it to the next day for you — please correct the date of
birth.

फ़रवरी 1990 में 28 दिन होते हैं, इसलिए 29 फ़रवरी 1990 कोई वास्तविक तिथि नहीं है। गणक
इसे स्वयं अगले दिन नहीं बदलेगा — कृपया जन्म तिथि ठीक करें।

The date of birth is in 999. Ganak calculates planetary positions for 1800–2150;
outside that range the answer would not be trustworthy, so nothing was calculated.

The time of birth reads 24:00. A day ends at 23:59 — midnight is 00:00 of the next
day.

जन्म समय 24:00 है। दिन 23:59 पर समाप्त होता है — मध्यरात्रि अगले दिन की 00:00 है।
```

The second person's date and time (`western-relationship`) and the Sade Sati check
date get their own field names. The catch-all now says what it actually means —
the inputs were valid but the computation did not finish — instead of blaming the
reader's typing.

**Judgement call, recorded for the owner:** the year range **1800–2150** is not a
round number chosen for looks. It is the span over which `src/engine/ephemeris.ts`
has real ΔT polynomial fits; outside it the code falls back to a crude parabola.
Widening or narrowing it is a product call, not a code call.

### F12 — Hindi micro-copy

* `आपका जन्म नक्षत्र धनिष्ठा, चरण 4.` → `… चरण 4 है।` (verb + danda, like every
  other Hindi answer on the page).
* `आपका जन्म-पक्षी: गिद्ध.` → `आपका जन्म-पक्षी गिद्ध है।`
* The synastry line now reads as a sentence: `सबसे प्रमुख सिनैस्ट्री सम्बन्ध … हैं।`
* **Ordinals.** `राहु 1वें भाव में` / `केतु 7वें` → `राहु प्रथम भाव में` /
  `केतु सप्तम भाव में`. `1वें` is a digit with a Hindi suffix glued on, not a Hindi
  ordinal. Hindi jyotish names a भाव प्रथम / द्वितीय / तृतीय — which is exactly what
  `src/data/dosha-explainers.ts` already prints **further down the same page**. The
  page was speaking two dialects of its own subject.
* Same reason: the Sade Sati method line `शनि की 12वीं … राशि` → `… बारहवीं … राशि`.
  (That one line is the only other snapshot change.)

### F13 — "n/7 planets are enclosed" could never read below 4/7

Not an arithmetic bug. `kalaSarpaFromRows` sets `enclosed = max(fwd, bwd)`, and the
Rahu–Ketu axis cuts the chart in half, so the larger half always holds at least
four of the seven. **4/7 is the floor, not partial progress** — and a reader who
saw "4/7 enclosed" heard "more than halfway to the yoga". The engine is right; the
sentence was wrong. The scale is deliberate, so the copy now says something true:

```
No complete Kala Sarpa pattern: the largest group on one side of the Rahu–Ketu axis
is 4 of the seven; a full pattern needs all seven.

पूर्ण काल सर्प रचना नहीं मिली: राहु–केतु अक्ष के एक ओर सबसे बड़ा समूह सात में से 4
ग्रहों का है; पूर्ण रचना के लिए सातों चाहिए।
```

and the derivation paragraph states the floor out loud:

```
The axis cuts the chart in half, so every planet falls on one side or the other; the
larger side holds 6 of the seven — which is why this count never drops below 4, and
only 7 is a full pattern. Saturn falls on the other side.
```

`src/engine/doshas.ts` was **not** changed: the number is correct, and
`ChartScreen`'s own summary already said "on one side".

### F11 — the error boundary never let go of a crash

`AppErrorBoundary` cleared `error` only from the Try again button. This app
navigates with `pushState` + `popstate`, so after one crash **every later route
still rendered "Something went wrong"**, and because the crashed screen's effects
never ran again, `document.title`, `<link rel=canonical>` and the meta description
stayed frozen on the page that crashed. The bug bash observed nine consecutive
navigations in that state, all titled "Baby-name initials | Ganak".

* The boundary now subscribes to `popstate` in `componentDidMount` and clears the
  error on a route change (removed again in `componentWillUnmount`). A route change
  is a new render tree, so it is exactly the moment to try again.
* The crash screen has a link back into the app (`/?lang=…`, bilingual). Without it
  a reader was stuck: Try again re-renders the same broken route, Reload reloads it,
  and Back only redrew the crash screen.

---

## Gates

```
91 passed, 0 failed.
```

`npm run build` clean — 198 route HTML files, sitemap 198 URLs.

### What is new, and the fail-then-pass proof for each

**`validation/zone-offset-dst.cjs` — §5, the call sites (17 new checks).**
5a is a static inventory: the number of clock-passing and date-only `zoneOffset`
calls is pinned **per file**, so both a dropped `hh, mi` and a new unreviewed call
site fail. 5b drives the two natal-anchor engines directly, because a static check
cannot see a caller that passes the *wrong* hour. Plus the 3,636-birth India
invariance sweep above.

With the clock arguments removed from all six files:

```
FAIL call-site wiring: src/engine/medical-muhurat.ts passes the birth clock at 0 call(s), expected 1
FAIL call-site wiring: src/engine/medical-muhurat.ts has 2 date-only zoneOffset call(s), expected 1
FAIL call-site wiring: src/engine/personal-muhurat.ts passes the birth clock at 0 call(s), expected 1
FAIL call-site wiring: src/screens/ChartScreen.tsx passes the birth clock at 0 call(s), expected 1
FAIL call-site wiring: src/screens/MatchingScreen.tsx passes the birth clock at 0 call(s), expected 2
FAIL call-site wiring: src/screens/RectifyScreen.tsx passes the birth clock at 0 call(s), expected 1
FAIL call-site wiring: src/screens/UtilityCalculatorScreen.tsx passes the birth clock at 0 call(s), expected 1
FAIL medical natalMoonSign: NY 1976-10-31 01:30 is EDT −4 (day-level −5 gives sign 10): expected 9, got 10
FAIL personal natalAnchors: NY 1962-04-29 00:30 is EST −5 (day-level −4 gives nakshatra 22): expected 23, got 22
zone-offset-dst: 11 FAILURES (71 passed)
```

Restored:

```
  · call sites: 6 birth-instant files pass the clock; 35 day-scoped calls in 16 files stay on the 4-argument form
  · India invariance: 3636 births across 116 Indian cities / 1 zone(s), 1930-2030 — 0 answers move when the birth clock is wired through
zone-offset-dst: PASS — 82 checks
```

Note what did **not** go red in that run: the India assertions. The wiring is
invisible to an Indian birth whether it is there or not, which is the proof rather
than a claim.

**`validation/screen-snapshots.cjs` §3f — the rendered half.**
Sections 1–2 render every screen in its *initial* state, so no baseline can ever see
a calculator's answer. §3f types a transition-day birth into the form, presses
Calculate, and reads the answer line. With the wiring removed:

```
FAIL nakshatra.en (DST day): NY 2024-03-10 00:30 is EST −5 (DST starts at 02:00).
     The screen printed: ANSWER FIRSTYour birth nakshatra is Purva Bhadrapada, pada 1.
FAIL baby-name.en (DST day): the naming syllable follows the pada.
     The screen printed: ANSWER FIRSTSuggested starting sound: Se
FAIL lagna.en (DST day): NY 1961-10-29 00:30 is EDT −4 (DST ends at 02:00).
     The screen printed: ANSWER FIRSTYour ascendant is Leo.
+ three offset-line failures
```

**`validation/screen-snapshots.cjs` §3g/§3h — the copy and the input guards.**
With the copy and guards reverted to this morning's:

```
FAIL kala-sarpa.hi: digit-plus-suffix house ordinal instead of a Hindi ordinal:
    तक्षक · राहु 7वें, केतु 1वें भाव · उदित (आरोही) · 6/7 ग्रह घिरे · बाहर: शनि
FAIL kala-sarpa.en: the count is described as "enclosed", which cannot fall below 4 of 7
FAIL pancha-pakshi.hi: the answer sentence does not end in a danda: आपका जन्म-पक्षी: गिद्ध.
FAIL sade-sati.en/hi: the phase list still tells the reader Ganak splits a phase into separate retrograde segments
FAIL rashi.en (29 Feb in a non-leap year): Ganak answered instead of saying what was wrong
FAIL rashi.en (a year outside the ephemeris): the message must match /1800–2150/
FAIL rashi.en (an impossible clock): the message must match /time of birth/, /23:59/
✗ screen-snapshots FAILED (16)
```

**`validation/utility-calculators.cjs` — the error boundary + the labels.**
The boundary is a class with lifecycle, so it is driven directly rather than through
`renderToStaticMarkup`, which runs no lifecycle at all. With the boundary as it
stood this morning:

```
AssertionError: the error boundary must subscribe to route changes — it has no
componentDidMount at all, so a crash is permanent for the session
```

and with only the link removed:

```
AssertionError: the crash screen must link back into the app (en)
```

### Snapshot baselines

`node validation/snapshot-generate.cjs --write` moved 26 files / 57 lines. Every
changed line was read: 56 of them are the two field labels on 14 calculators × 2
languages, and one is the Sade Sati method line's `12वीं` → `बारहवीं`. Nothing else
moved — the footnote, the Kala Sarpa copy and the Hindi answer sentences all render
only *after* Calculate, which is why they never had a baseline and why §3g exists.

---

## Outside the assigned file list

**`src/engine/personal-muhurat.ts`** was edited although it was not in this lane's
enumerated file list. It was also in no other lane's reservation in
`plans/task-log.md`, and it is the ninth instance of the exact defect this lane was
sent to fix — the audit's table simply missed it. Flagging it and leaving diaspora
readers with a wrong janma nakshatra seemed worse than the one-line change. The
integrator should be aware of it when merging.

---

## Still open — recorded, not fixed

1. **F3, the `?? 5.5` fallback at ~40 other call sites.** The calculator screen
   treats an unresolvable zone as a hard, visible failure (fixed earlier today).
   Every other caller still silently falls back to Indian Standard Time with no
   message. `zoneOffset` returning `null` is right; what the reader is told is a
   product decision. Unchanged by this lane, as the DST audit asked.
2. **Digit-plus-suffix ordinals in other lanes' files.** The gate added here covers
   the calculator screen only. Still outstanding elsewhere: `src/data/muhurat-ui.ts`
   (`10वें`, `11वें`, `12वें`), `src/data/sade-sati-report.ts` (`12वीं`),
   `src/data/bhrigu-copy-hi.ts` and `src/screens/JyotishBnnScreen.tsx` (`1वाँ`),
   `src/data/festival-meta.ts` (`41वाँ`). All are reserved by other agents today.
3. **Dead `zoneOffset` imports** in `src/screens/MuhuratHub.tsx` and
   `src/screens/MedicalMuhuratScreen.tsx` — imported, never called. Both files are
   on this lane's do-not-touch list.
4. **F9 was applied to the calculators only.** `ChartScreen`, `MatchingScreen` and
   `RectifyScreen` still use their own broader "enter a complete date and time"
   messages and have no leap-day or year-range guard. Same defect class, different
   screens; worth a follow-up slice.
5. **No browser or phone-width pass, and no live-production check.** Everything here
   is headless rendered text. Overflow, contrast and touch targets at 375px, and
   `ganak.pages.dev`, still need a human — the same caveat AGENTS.md puts on
   `screen-snapshots.cjs`.
6. **Sheet closeout not done.** `plans/task-log.md`, `plans/backlog.md`,
   `plans/backlog-acceptance-register.md` and `plans/backlog-sheet-sync.json` are
   explicitly outside this lane's file list, so the register row and the sync JSON
   were not touched. The integrator needs to close them out.
