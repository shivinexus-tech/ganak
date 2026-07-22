# Cursor task — close Bengal Durga Puja, Skanda Sashti and Ayyappa sequences

**Priority:** P0 before go-live  
**Owner decision:** 2026-07-22
**Agent:** Cursor
**Work order:** finish Bengal's remaining timing/release evidence first, then
Skanda/Ayyappa.

Read `AGENTS.md`, `.cursorrules`, `plans/task-log.md` and
`plans/module-ownership-map.md`, `plans/religious-content-policy.md` and
`plans/festival-devotional-guide-audit.md` before editing. Preserve unrelated
user/agent work and stage only the explicit files for each commit. Never describe a
local-only or unverified change as production-complete.

## Current truth

- Cursor's earlier date-engine work is already merged:
  - Bengal sequence anchors: Mahalaya, Shashthi, Saptami, Ashtami, Bengal Navami
    and Dashami.
  - Annual Skanda sequence anchors: day 1, Soorasamharam day 6 and
    Thirukalyanam day 7.
  - Ayyappa anchors: Mandala begins and public Mandala Pooja/day 41.
- Six Bengal guide objects, route wiring and `validation/durga-puja-pages.cjs` were
  committed in `853026c` and pushed with this brief. The focused Durga,
  route-coverage and deeplink gates pass. The backlog's 40% value is stale, but the
  item is not 100% until local Sandhi/date evidence, browser checks and production
  verification below are complete.
- Skanda's three routes currently share `kandaSashtiAnnual`; Ayyappa's two routes
  share `ayyappaMandala`. Shared overview copy is useful, but it does not satisfy
  the owner's requirement for milestone-specific guidance.

## Scope A — finish Bengal Durga Puja ×6

### Required pages

1. `/festival/durga-puja-mahalaya`
2. `/festival/durga-puja-shashthi`
3. `/festival/durga-puja-saptami`
4. `/festival/durga-puja-ashtami`
5. `/festival/durga-puja-navami`
6. `/festival/durga-puja-dashami`

Each page must remain distinct from the generic Sharad Navratri/Navadurga pages.
Each must render only the selected language and contain an answer-first verdict,
meaning, household/visitor guidance, food or fasting boundary, worship boundary,
stories, Bengal/regional distinctions, completion guidance and—only when a
specific material risk exists—a brief separate safety note.

Apply the owner's 2026-07-22 devotional-guide correction throughout: remove
research commentary, generic warnings, authority/committee language and negative
“do not / not interchangeable / no universal” framing. Lead with sacred meaning and
a complete positive household worship path. Safety is optional and appears only for
a specific material risk.

### Timing requirements

- Show the selected city's local civil date and relevant tithi/day identity.
- Ashtami must calculate and display the local Sandhi Puja interval: the last
  24 minutes of Ashtami plus the first 24 minutes of Navami. Do not hard-code a
  Kolkata time or present a national average.
- Mahalaya must remain tied to Mahalaya/Sarva Pitru Amavasya and clearly separate
  ancestor observance from the later public Puja days.
- Navami must use the documented Bengal selection rule rather than silently
  reusing a generic Udaya Navami label.
- Shashthi/Saptami/Dashami must show the local selected date. Where a temple or
  committee event has no universal clock, say so plainly instead of inventing one.

### Bengal evidence required

- Keep at least the existing six 2026 date anchors and add boundary assertions for
  local Sandhi start/end.
- Add at least Kolkata plus one Indian non-Kolkata city and one diaspora-city
  comparison for local date/timing behavior.
- Record the published sources and retrieval date in a source note. Do not claim
  native-human certification unless it actually occurred.
- Prove the six routes use six separate substantive guide keys.

## Scope B — finish Skanda Sashti ×3 and Ayyappa ×2

Create milestone-specific guide keys; do not route all pages to one shared guide.
Shared fact blocks may be extracted and reused internally, but each route needs its
own verdict, meaning and day-appropriate steps.

### Skanda pages

1. `/festival/skanda-sashti-begins`
   - Day 1: beginning the six-day vow, safe fasting choices, daily practice and
     distinction from monthly one-day Skanda Shashti.
2. `/festival/skanda-sashti-soorasamharam`
   - Day 6: culmination, temple enactment versus household worship, fasting
     continuation/completion boundary and crowd safety.
3. `/festival/skanda-sashti-thirukalyanam`
   - Day 7: divine marriage celebration, separate identity from Soorasamharam,
     and accurately qualified family/temple completion practice.

The page must show the selected city's local date, sequence day and span. If an
enactment or temple ceremony has no universal time, display that fact and direct the
user to the chosen temple schedule; never fabricate an exact muhurta.

### Ayyappa pages

1. `/festival/ayyappa-mandala-begins`
   - Public Mandala season day 1; explicitly distinguish it from the day a person
     chooses to wear mala and begin a personal vow.
2. `/festival/ayyappa-mandala-puja`
   - Public day 41/Mandala Pooja; explicitly state that a personal vow, mala removal
     or pilgrimage does not automatically conclude on this date.

Both pages must show the local public-season date and complete 41-day span. Keep the
existing medicine, fasting, strenuous-climb and Guru Swami/temple safety boundaries.
Do not give DIY Irumudi or priest-only instructions.

### Sequence evidence required

- Permanent exact-set gate for all five route → milestone-specific guide mappings.
- Keep 2026 anchors:
  - Skanda: 10 Nov, 15 Nov and 16 Nov 2026 under the current validated convention.
  - Ayyappa: 17 Nov and 27 Dec 2026 under the current validated convention.
- Add previous-year and following-year sequence/boundary anchors so the gate is not
  a single-year lookup table.
- Prove Skanda days are ordered 1 → 6 → 7 and Ayyappa is 41 inclusive civil days.
- Prove monthly Skanda Shashti still uses its one-day guide and can never resolve to
  the annual six-day sequence.
- Verify English/Hindi terminology against the recorded published references.

## Allowed implementation files

Cursor is the only writer for these files until handoff:

- `src/data/durga-puja-guides.ts`
- a new sequence data module under `src/data/` for milestone-specific
  Skanda/Ayyappa guides
- `src/data/festival-pages.ts`
- `src/data/vrat-vidhis.ts`
- `src/data/festival-meta.ts` only where milestone copy/timing metadata requires it
- `src/screens/FestivalGuideScreen.tsx` only for a reusable local timing/sequence
  presentation needed by these pages
- `src/engine/festivals.ts` only if a failing multi-year anchor proves an engine
  defect; do not redesign the festival engine
- `validation/durga-puja-pages.cjs`
- a new `validation/skanda-ayyappa-pages.cjs`
- `validation/festival-deeplinks.cjs`
- `validation/festival-page-coverage.cjs`
- `validation/content-dates.cjs` for the new multi-year anchors
- `plans/festival-page-link-inventory.md`
- `plans/backlog.md`, `plans/backlog-acceptance-register.md` and Cursor's own row in
  `plans/task-log.md` only after all evidence exists

Do not touch calendar-mode work, Samskara/Panchang modules, shared design tokens,
navigation, medical Muhurat work, `.worktrees/`, `validation/.fest-test.ts`, or the
recovery vault.

## Mandatory gates

Run after the implementation is structurally complete and paste the full passing
output into Cursor's task-log row:

```bash
node validation/parse-check.js src/kundli-app.tsx
node validation/prashna-parity.js src/screens/PrashnaScreen.tsx
node validation/prashna-calc.js
node validation/muhurat-anchors.cjs
node validation/panchaka-windows.cjs
node validation/festival-deeplinks.cjs
node validation/festival-page-coverage.cjs
node validation/page-context-header.cjs
node validation/content-dates.cjs
node validation/durga-puja-pages.cjs
node validation/skanda-ayyappa-pages.cjs
npm run build
```

Do not weaken an existing gate or convert a genuine required page back into a
deferred/excluded label.

## Browser and production matrix

Before closure:

- Open all 11 routes in English and Hindi.
- Verify correct route title, selected date/place, local timing or an honest
  no-universal-clock message, milestone-specific verdict and substantive guide.
- Test language switch, city switch, reload and Back/Forward without losing route.
- Test representative Bengal, Skanda and Ayyappa pages at 390×844 and desktop.
- Require zero horizontal overflow and zero console errors.
- Commit Scope A and Scope B separately with intentional file lists; push `main`
  under the standing policy.
- Wait for Cloudflare production, then verify representative pages from all three
  families on `https://ganak.pages.dev` in both languages and at phone width.
- Update the Google backlog Sheet and local backlog only after production evidence.

## Definition of done

### Bengal Durga Puja

100% only when six separate bilingual substantive pages, local timing/date rules,
dedicated gates, full canonical gates, browser matrix, commit/push, production and
backlog/Sheet evidence all pass. Commit `853026c` establishes the page/content base;
it does not by itself close the remaining timing and release evidence.

### Skanda Sashti + Ayyappa

100% only when all five routes resolve to milestone-specific guidance, the sequence
and multi-year anchors pass, monthly Skanda remains separate, browser/phone checks
pass, and the result is committed, pushed and verified in production.
