# Messaging & guidance audit — findings for sign-off

Backlog item 0.5. Audited all four screens (Daily, Chart, Prashna, Muhurat finder)
for: errors, empty states, loading states, jargon glosses, silent state changes,
placeholder quality, Hindi/English parity. No code changed yet — this is the
report to review before anything is touched.

Owner's standing principles this is measured against: plain-language messages
that help navigation; no state resets without a user action; user always knows
what the app is doing.

## Tier 1 — fix first (breaks the app or actively misleads)

1. **Daily screen can go completely blank with no way back.** If `computeTodayPanchang`
   throws (bad place/date edge case), the whole Daily tab renders nothing — no
   error, no place picker to retry, nothing. `src/kundli-app.tsx:5178,5300`
   → Show a card explaining what happened and keep the place/date picker visible
   so the user has a way out.

2. **Muhurat finder: header and results can visibly contradict each other.**
   Editing the From/To dates updates the *displayed* date range in the results
   header immediately, but the actual list of days underneath stays from the
   *old* search until "Find good days" is pressed again. `src/kundli-app.tsx:3917-3924,3959`
   → Either show a "results are for a different range — press Find to update"
   banner, or freeze the header to match what was actually searched.

3. **Chart screen is effectively English-only**, despite the rest of the app
   being bilingual. All labels, errors, empty states, and jargon glosses on
   this screen ignore the language toggle — only two headings are in Hindi.
   `src/kundli-app.tsx:5466+ throughout the Chart screen render`
   → Route Chart-screen copy through the same `lang`/`L` pattern the Daily
   screen already uses.

4. **Muhurat "why this day" reasons are English-only in Hindi mode** —
   confirmed as the exact scope of the item already flagged in the backlog.
   `dayScore`'s factor strings (`src/kundli-app.tsx:~1161-1188`) are hardcoded
   English (e.g. "Purnima", "Rikta tithi", "N good day choghadiya"); the
   nakshatra name shown on the best-day card is also always English
   (`src/kundli-app.tsx:3973,3874`).
   → Convert factor strings to `{en, hi}` pairs like `muhuratShuddhi`'s
   blockers already do; add a `NAK_HI`-style lookup for the nakshatra name
   (one already exists for Prashna, can be reused).

5. **Muhurat finder computes *why* other days were rejected, but never shows
   it.** `muhuratShuddhi` produces bilingual `blockers` for every excluded
   day (`src/kundli-app.tsx:1317-1337`), attached to every scanned day
   (`:1350`) — but nothing in the UI reads `blockers`. A user with few or no
   results has no way to see why (e.g. "most of this range is Chaturmas").
   → Surface it: either an expandable "why other days were skipped" list, or
   feed the season-wide reason into the existing empty-state message.

6. **Deleting a saved chart is instant and irreversible** — one tap, no
   confirmation, only a small toast afterward. `src/kundli-app.tsx:3116,3047`
   → Add a confirm step before delete. This is the one item that's a direct
   violation of "no resets without a user action" — the action itself is
   real, but there's no chance to back out of a mistap.

## Tier 2 — real gaps, worth fixing this pass

7. Raw JavaScript error text gets shown to users verbatim in a few places —
   Muhurat finder (`:3569`) and Prashna (`:4870`) both do
   `"Calculation failed — " + e.message`, which can surface things like
   `Cannot read properties of undefined`. → Replace with a plain retry
   message; log the real error to console only.

8. **Prashna: asking a new question doesn't clear the old answer.** Switching
   the question chip after already getting a verdict leaves the previous
   verdict on screen with no indication it's stale until "Ask now" is
   pressed again. `src/kundli-app.tsx:4888-5003` — same bug class as the
   Muhurat preset bug we already fixed once.

9. **Chart screen's two-step place confirmation is confusing.** When exactly
   one place matches, pressing "Cast the chart" silently fills the place
   field as a *side effect* of showing an error, and the user has to press
   Cast a second time. `src/kundli-app.tsx:5123` → Auto-confirm on typing
   when there's one match, with visible feedback right at the input.

10. **Shadbala and Special Lagnas sections are pure data, no verdict.** The
    single most jargon-dense part of the Chart screen shows only raw numbers
    (Rupas, percentages) with no "what this means for you" sentence —
    directly against the app's own answer-before-data principle.
    `src/kundli-app.tsx:5835-5925`

11. **"Rashi Gochar" (planet transits) section on Daily is unglossed and
    English-only**, including its dates, even in Hindi mode.
    `src/kundli-app.tsx:5384,5397,5414,5435,5440,5448`

12. **The full panchang table's technical terms have zero glosses** — Karana,
    Pravishte/Gate, the three Samvat systems (Shaka/Vikram/Gujarati) are
    shown with no explanation anywhere. `src/kundli-app.tsx:3726-3736`

13. Prashna's result table headers ("Graha", "Rashi", "H") stay English in
    Hindi mode, and "H"/"Star-Sub"/"Rx" are cryptic with their gloss hidden
    below an expand toggle instead of inline. `src/kundli-app.tsx:4968-4998`

14. The `PlaceInput` component reused in Kundli Matching has no "searching…"
    indicator, unlike its sibling on the Chart form — looks frozen while
    typing a bride/groom's city. `src/kundli-app.tsx:2521-2578` vs `:5501`

## Tier 3 — smaller polish

15. Switching fast-tradition (Smarta/ISKCON) can silently shift a displayed
    Ekadashi date by a day with no note at the toggle itself explaining why.
16. A few empty states render a bare "—" instead of a sentence (no more good
    muhurat windows today; empty KP significator cells).
    `src/kundli-app.tsx:4047,5791-5807`
17. Some placeholders use jargon or describe system behavior instead of
    giving a concrete example — "Name of the native", "resolved from place".
    `src/kundli-app.tsx:5467,5519`
18. Divisional-chart (D1–D60) codes rely on desktop-only hover tooltips,
    invisible on phones. `src/kundli-app.tsx:5596-5606`
19. "Upcoming planetary events" section header on Daily has no Hindi label
    at all (only sub-heading found this way in the Daily screen).

## What's already good (keep as the reference pattern)

- Muhurat finder's "no results" empty state: explains why, states the actual
  suitable window, invites a wider search — this is the template.
- Muhurat finder's Find button already relabels itself by state (pick an
  activity → checking → ready) — good self-explaining control.
- ChartVault's empty state ("No saved charts yet — cast one and press Save").
- Ashtakavarga's plain-language strength legend (30+ strong · 25–29 average…).
- Arudha padas already show a one-line plain meaning right on each tile.
- Prashna's opening explainer and category chips are clear and bilingual.

---

**Next step:** your call on scope. Options — (a) fix Tier 1 only this pass
(6 items, the ones that actively confuse or mislead), (b) Tier 1 + 2, or
(c) all three tiers in one go. Whichever you choose, I'll write the exact
replacement copy (both languages) for your sign-off before touching code, per
the backlog item's requirement.
