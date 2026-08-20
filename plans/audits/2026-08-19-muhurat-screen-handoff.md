# Muhurat screen — handoff specification for the MuhuratHub redesign

- **Date:** 2026-08-19
- **Author:** Claude Code, branch `claude/muhurat-engine-fixes`, worktree `.scratch/worktrees/muhurat-fixes`, base `origin/main` `f8c0273`.
- **Source of the defects:** `plans/audits/2026-08-18-bugbash-muhurat-suite.md` (second independent adversarial pass on the Muhurat suite). **You do not need to read that audit to act on this document.** Every defect below is restated here in full: what is wrong, how to see it, where it lives, what to change, and the assertion that must hold afterwards.
- **Why a handoff and not a fix:** `src/screens/MuhuratHub.tsx` is owned by the redesign lane and was not edited by this branch. Everything that could be fixed underneath the screen has been, in the engine, so that it survives the rebuild. What is left is genuinely presentation, and is specified here.

---

## Part A — what the engine now guarantees (read this before rebuilding the screen)

These are new guarantees on `origin/main` as of this branch. The redesign can rely on them and must not re-implement them.

### A1. No offered window ever overlaps Rahu Kalam, Gulika Kalam, Yamaganda or Bhadra

`activityWindows()` and `muhuratScanRange()` in `src/engine/muhurat.ts` now subtract all four from every window they return, in **every** category — Choghadiya-based, Panchaka-Rahita and Samskara-lagna alike. Windows are clipped around the avoided interval, not dropped whole.

Consequence for the screen: **the sentence "These windows come from this activity's own filter; Rahu, Gulika and Yamaganda are excluded." is now true.** It was false for six categories before (see B1). If the redesign keeps a sentence like it, it may also say Bhadra is excluded. If the redesign drops the sentence, nothing breaks.

### A2. Every scan row carries the day's real Bhadra intervals

`row.bhadra` is an array of `{start, end}` covering the whole sunrise-to-sunrise day. Previously the finder sampled the karana once, at sunrise, so a Bhadra that opened later in the day was invisible. `row.factors` now names Bhadra on every day that carries one.

### A3. The scan reports what it silently dropped

`muhuratScanRange()` still returns an array of day rows — that contract is unchanged — but it now carries three non-enumerable diagnostic properties. They are what B2 and B3 need:

| Property | Meaning |
|---|---|
| `rows.requestedDays` | number of days in the range the user asked for |
| `rows.scannedDays` | number of days actually walked (capped at 400) |
| `rows.noSunriseDays` | number of days skipped because the place had no sunrise/sunset that day |

`rows.scannedDays < rows.requestedDays` means the range was truncated. `rows.noSunriseDays > 0` with `rows.length === 0` means the location, not the range, is the problem.

### A4. A ready-made helper for the "today" strip

`eventChoghadiyaVerdict(info, goodKeys)` is exported from `src/engine/muhurat.ts`. Given a `muhuratForDate` row and the list of Choghadiya keys an event chip counts as good, it returns `{ clean, blocked }`. `blocked` entries carry `blockedBy: ["rahu" | "gulika" | "yama" | "bhadra", ...]`. This exists so B2 is a one-line adoption.

---

## Part B — defects that must be fixed inside `src/screens/MuhuratHub.tsx`

Line numbers are as of `origin/main` `f8c0273`, before any redesign edits.

### B1 — P0 · The "today" strip offers, as good, the very intervals it lists as best avoided

**Defect in one sentence.** The Muhurat hub's today strip lists Choghadiya windows under "Good windows today" without testing them against the Rahu Kalam / Gulika Kalam / Yamaganda list it builds on the very next line and prints beside them under "Best avoided today", so the same interval appears in both columns, to the minute.

**Exact reproduction.** New Delhi, panchang day 2026-02-26, English, event chip *Wedding-related*. Rendered text of the strip:

```
Good windows today
Shubh        6:49 AM–8:15 AM
Labh        12:34 PM–2:00 PM
Amrit        2:00 PM–3:26 PM
Shubh        4:52 PM–6:18 PM
Amrit        6:18 PM–7:52 PM
Shubh        9:26 PM–10:59 PM
Abhijit Muhurat  12:11 PM–12:57 PM
Best avoided today
Rahu Kalam   2:00 PM–3:26 PM
Gulika Kalam 9:41 AM–11:07 AM
Yamaganda    6:49 AM–8:15 AM
```

`Amrit 2:00 PM–3:26 PM` **is** `Rahu Kalam 2:00 PM–3:26 PM`. `Shubh 6:49 AM–8:15 AM` **is** `Yamaganda 6:49 AM–8:15 AM`. Choghadiya and the three belts are carved from the same eighths of the day, so a bad eighth does not merely overlap a good Choghadiya — it is one, boundary for boundary. Over 20 days from 2026-02-01 in Delhi this happens on 23 of 137 offered windows for five of the six chips and 29 of 183 for *Travel*.

**It is also visible in a snapshot this repository already commits.** `validation/snapshots/daily.en.txt` lines 98-119 (Mumbai, 2026-08-14) contain, twelve lines apart:

```
Good windows today
Labh
7:55 AM–9:31 AM
...
Best avoided today
...
Gulika Kalam
7:55 AM–9:31 AM
```

So `validation/screen-snapshots.cjs` has been proving the contradiction green every run. **Fixing this will move `validation/snapshots/daily.en.txt` and `daily.hi.txt`** — re-baseline with `node validation/snapshot-generate.cjs --write` and commit the diff as the review artifact.

**File and line as of `origin/main` `f8c0273`.** `src/screens/MuhuratHub.tsx:458`:

```js
const goodSlots = allChogha.filter((c) => ev.good.includes(c.key) && c.end > nowMs).slice(0, 6);
const avoidSlots = [["rahu", todayP.rahu], ["gulika", todayP.gulika], ["yama", todayP.yama]].filter(([, w]) => w && w.end > nowMs);
```

**Change required.** Replace the `goodSlots` filter with the engine helper described in A4:

```js
const { clean, blocked } = eventChoghadiyaVerdict(todayP, ev.good);
const goodSlots = clean.filter((c) => c.end > nowMs).slice(0, 6);
```

A blocked window is information a practitioner wants, so prefer showing it greyed with the belt named — this is exactly what the hora dial already does with `showBlockedHoras`, and the screen already states that policy in its own copy at `MuhuratHub.tsx:100-104`: *"Default OFF — the default behaviour is a hard block: a favourable hora that falls inside Rahu Kaal/Gulika/Yamaganda is never offered as a clean recommendation."* Dropping them silently is acceptable; offering them as good is not.

**Assertion that must hold afterwards.** For every day of a full year and every event chip in `EVENTS`, no window rendered under "Good windows today" may overlap that day's `rahu`, `gulika`, `yama` or any interval in `bhadra`. A spot check will not do — the engine-side version of this defect survived nine gates because every one of them checked a handful of dates.

**Owner decision, not an engineer's.** Whether a blocked Choghadiya is hidden or shown greyed-with-reason. Both satisfy the assertion. Showing it matches the hora dial and serves the practitioner; hiding it is simpler for the householder.

---

### B2 — P1 · At a polar latitude the finder blames the wrong thing and gives advice that cannot work

**Defect in one sentence.** When a place has no sunrise, every day of the scan is skipped, the result list is empty, and the screen falls through to the generic "no auspicious muhurat" copy — which names Devshayana, Kharmas and combustion as the reason (none of which apply) and tells the reader to "try a wider range", which can never help because every day of the polar summer and every day of the polar night fail identically.

**Exact reproduction.** Wedding Muhurat, Tromsø (69.65 N, 18.96 E), 2026-06-01 → 2026-06-20. Rendered text:

```
--- en ---
Best days · Wedding · Jun 1, 2026 – Jun 20, 2026
No auspicious muhurat in this range.
When it's possible: Blocked during Devshayana (roughly mid-July to late November), Kharmas
(mid-December to mid-January, mid-March to mid-April) and while Venus or Jupiter is combust.
Try a wider range.

--- hi ---
शुभ दिन · विवाह · 1 जून 2026 – 20 जून 2026
इस अवधि में कोई शुभ मुहूर्त नहीं।
शुभ काल: देवशयन काल, खरमास तथा शुक्र/गुरु अस्त में विवाह वर्जित. बड़ी अवधि आज़माएँ।
```

June 1–20 is before Devshayani Ekadashi (≈25 July 2026), so none of the named blocks apply.

**File and line as of `origin/main` `f8c0273`.** `src/screens/MuhuratHub.tsx:1033-1039` — the `days.length === 0` branch has no case for "the scan produced no rows at all", only for "no row passed".

**Change required.** Branch on the diagnostics from A3 before the generic copy:

```js
const noRows = ans.days.length === 0 && ans.days.noSunriseDays > 0;
```

When `noRows` is true, say — in both languages, with equal weight — that the Muhurat day is measured from local sunrise to the next local sunrise, that this place has no sunrise on those dates, and that a nearby lower-latitude city must be used. Do **not** print the category's `monthsLabel`, and do **not** say "try a wider range".

**Assertion that must hold afterwards.** Rendering the finder for Tromsø 2026-06-01 → 2026-06-20 produces, in EN and HI, a string that names the sunrise/latitude cause and does **not** contain "wider range" / "बड़ी अवधि", and does not name Devshayana, Kharmas or combustion. `validation/medical-muhurat.cjs` already asserts the sibling engine skips those days; this is the screen half that was never done.

---

### B3 — P1 · A range longer than 400 days is silently truncated

**Defect in one sentence.** `muhuratScanRange` stops after 400 days, and the screen keeps printing the range the reader asked for over a list that stops early.

**Exact reproduction.** Vehicle Muhurat, New Delhi, 2026-01-01 → 2027-12-31: 730 days requested, 400 rows returned covering 2026-01-01 … 2027-02-04. 330 days are dropped with no flag on the result and no message on screen, under the header `Best days · Vehicle · Jan 1, 2026 – Dec 31, 2027`.

**File and line as of `origin/main` `f8c0273`.** The cap is `src/engine/muhurat.ts:435` (`i < 400`) and is deliberate — it is what keeps a two-year scan from freezing the main thread. Nothing in `MuhuratHub.tsx` validates or reports the span; the header is built at `MuhuratHub.tsx:1003`.

**Change required.** Using A3: when `ans.days.scannedDays < ans.days.requestedDays`, print, next to the range header and in both languages, that only the first `scannedDays` days of the requested range were searched, and give the actual last date searched. Alternatively cap the date inputs at 400 days with a visible message at entry. Either satisfies the assertion; silent truncation does not.

**Assertion that must hold afterwards.** For a requested range longer than 400 days, the rendered result contains the true searched end date, and the "no auspicious muhurat in this range" branch never advises a wider range when the range was truncated.

---

### B4 — P2 · A 7-minute window is offered in the same list, at the same weight, as a 140-minute one

**Defect in one sentence.** Offered windows carry no duration, so a sliver reads as an equal option.

**Exact reproduction.** Wedding Muhurat, New Delhi, best day 2026-04-20 (before this branch's engine fix): the sixth offered window was `4:08 AM–4:15 AM`, rendered with the same ✓, the same styling and the same weight as `11:23 AM–1:43 PM` above it.

**What the engine now does.** `activityWindows` drops any window shorter than **fifteen minutes** — under a third of a muhurta, and too short to begin the rite the window is offered for. That floor is a **stated product default, not a sourced rule**, and the owner may want it higher (a muhurta is 48 minutes; Ganak's own Abhijit and Do-Ghati windows are that length).

**Change required in the screen.** Print each window's duration alongside its span, so a 20-minute window and a two-hour window are visibly different, and order or emphasise by usable length rather than by list position alone.

**Assertion that must hold afterwards.** Every rendered window shows its length. No window under the engine floor can reach the screen (already guaranteed by A1/the floor).

---

### B5 — P1 · A Muhurat day that carries Ganda Moola says nothing about it, while the Panchang page on the same app says to avoid it

**Defect in one sentence.** The finder prints a Gandamoola nakshatra as the *reason* a day is good, and the Muhurat surfaces never mention Ganda Moola at all.

**Exact reproduction.** Property Muhurat, New Delhi, 2026-01-01 → 2026-06-30. 2026-01-16 is offered with score 6 = "Highly auspicious" and *"Why this day: Mula nakshatra, Friday, 3 good day choghadiya"*, while Ganak's own daily-windows card for 2026-01-16 reads "Ganda Moola". Before this branch, the word Ganda Moola appeared in exactly two files, both on the Panchang side.

**What the engine now does.** `dayScore` adds a bilingual caution factor — `Ganda Moola (Mula)` / `गण्ड मूल (मूल)` — with `g: false`, on every day whose sunrise nakshatra is one of Ashwini, Ashlesha, Magha, Jyeshtha, Mula or Revati. It carries **no score penalty**: the category's own published rule set legitimately admits these stars (see the note below), so this is a caution to state, not a veto to apply.

**Change required in the screen.** The caution currently lands only in the "Adverse factors" list behind the expert toggle. It must be visible without expanding anything on a day the finder is recommending — next to the verdict pill, at the same level as the "Why this day" line.

**Not a defect — do not "fix" it.** `MUHURTA_RULES.property.auspNak` admits Ashlesha, Mula and Purva Bhadrapada, and the 2026-08-18 audit called that unsourced. It is not. Drik Panchang's published 2026 New Delhi Property Purchase list offers 69 days, all of them Thursday or Friday, on exactly twelve nakshatras — Mula, Mrigashira, Purva Bhadrapada, Purva Ashadha, Punarvasu, Revati, Purva Phalguni, Anuradha, Vishakha, Magha, Ashlesha, Uttara Bhadrapada — which is Ganak's set and Ganak's weekday rule exactly. The set is now cited in the code and pinned by a gate.

**Owner decision, not an engineer's.** `PURCHASE_ACTIONS.property` offers "Sale deed signing" and "Registration" as steps and routes them through the `property` rules, while `MUHURTA_RULES.document` — whose own label reads "Document signing and registration" — uses a different, more conventional nakshatra list. Both are sourced; they are two published category tables answering the same question differently. Ask the same registration question two ways and Ganak answers with two rule sets. Deciding which one a reader gets, or whether the two surfaces should say they differ, is a product call.

---

### B6 — housekeeping · a second, unfiltered source of offered windows

`src/screens/MuhuratHub.tsx:1092-1117` renders Panchaka-Rahita "Shubha" windows with a green ✓ straight from `computeLagnaPanchaka` (`MuhuratHub.tsx:142`), bypassing the engine entirely and therefore bypassing every guarantee in A1. It is currently unreachable — it fires only when the best day has no `activityWindows`, and a day with no `activityWindows` is never `valid` — but it is one refactor away from re-introducing exactly the defect this branch fixed. Delete it, or route it through `activityWindows`. Never render an offered window from a source other than the engine.

While you are there: `MuhuratHub.tsx:14` imports `dayMuhurat` and `findMuhurat` and uses neither. They are the older AI-parse muhurat path, dead everywhere in `src/`, and they do not apply the guarantees in A1. Dropping the import is safe; the exports themselves must stay until this import goes, or the build breaks.

---

## Conventions this branch declared, and the sources behind them

Recorded here as well as in the code, because `plans/panchang-muhurat-source-matrix.md` is not this branch's to write and should gain matching rows.

| Convention | Ganak's rule | Published evidence, read 2026-08-19 |
|---|---|---|
| Rahu Kalam / Gulika Kalam / Yamaganda vs an offered window | **Subtracted from every offered window, every category.** Windows are clipped, not dropped. | Drik Panchang, [About Rahu Kaal](https://www.drikpanchang.com/panchang/rahu-kaal.html): the time under Rahu's influence "should be avoided to do any auspicious work"; "Auspicious activities like marriage rituals, engagement, Graha Pravesh, any purchase of stocks, shares, gold, home, car and starting new business or trade are avoided during this time"; "Rahu Kaal is considered only for undertaking any new work". Their Panchang cross-reference puts it plainly: "No new and auspicious work should be started during Rahu Kalam like marriage, housewarming etc." |
| — the disagreement, recorded | Ganak follows the stated rule anyway. | The same publisher's muhurat **generator** does not apply it. Of the 59 windows in Drik's 2026 New Delhi Vivah list, 34 (58%) contain one of the three belts — 6 Feb 2026 runs 07:06–23:37. The classical Vivah screen is panchanga-shuddhi plus lagna-shuddhi and does not include the kalavela day-divisions, and Rahu Kaal avoidance is emphasised most strongly in South India. Ganak's tie-breaker is its own consistency: the seven Choghadiya categories already excluded the belts, the hora dial hard-blocks them, and the card already printed the exclusion as a promise. |
| Bhadra (Vishti karana) vs an offered window | **Subtracted from every offered window, every category**, using the whole sunrise-to-sunrise interval list rather than the sunrise karana. | No disagreement between rule and generator here. Of the 21 days in Drik's 2026 New Delhi Vivah list that carry a Bhadra, not one published window enters it: 21 Feb Bhadra ends 13:01 and the window opens 13:00; 1 May ends 10:00, window 10:00; 29 Jun ends 16:17, window 16:16 — four minutes of rounding across the whole year. Three of those are now dated gate anchors. |
| Bhadra-vaas | **Not modelled.** Plain intervals, as Drik's Bhadra Vichar page lists them. | Adopting the residence refinement would make Ganak offer *more* windows and needs its own source and its own owner decision. |
| Ganda Moola on a Muhurat day | **Stated as a caution, never used as a veto, and never scored.** | The published category tables legitimately admit Gandamoola stars — Drik's 2026 New Delhi Property Purchase list offers Mula on 11 days, Ashlesha on 4, Purva Bhadrapada on 10, Revati on 7. Removing those days would silently overrule the source; saying nothing was the defect. |
| Minimum offered window | **15 minutes.** | A **product default, not a source.** Under a third of a muhurta. Owner may raise it. |
| Day-and-night Choghadiya for the finder | Both halves of the sunrise-to-sunrise day. | Drik publishes night windows for exactly the days whose daylight is covered by Bhadra — Vehicle Purchase, New Delhi, 13 Dec 2026, Bhadra to 16:48, Drik's window 16:47 to 07:06. |

---

## What was NOT changed, and why

- **`src/screens/MuhuratHub.tsx`** — owned by the redesign lane. Everything above is why this document exists.
- **The middling Chandra Bala positions 2, 5 and 9.** Counted as supportive only on a waxing day. Unsourced in this repo, left untouched deliberately, and already recorded as an open owner question by `CLAUDE-FIX-CHANDRA-BALA-2026-08-19`.
- **The Bhadra-vaas refinement** (Bhadra held harmless while it resides in heaven or the nether world, by the Moon's sign). Ganak lists plain Bhadra intervals exactly as Drik Panchang's Bhadra Vichar page does. Adopting vaas would need its own source and its own decision; it would make Ganak offer *more* windows, not fewer.
- **The 2026-08-18 audit's F9.** F4 refers to "see F9" and F7 to a "CLEAN" table; neither exists in the document. Two referenced pieces of evidence are missing from that audit and could not be recovered.
