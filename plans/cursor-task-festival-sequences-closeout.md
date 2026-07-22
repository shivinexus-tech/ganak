# Cursor task — close Bengal Durga Puja, Skanda Sashti and Ayyappa sequences

**Priority:** P0 before go-live  
**Assigned agent:** Cursor  
**Owner decision:** all named sequence pages are required before launch; none may be
deferred or represented by a generic shared page.  
**Important current state:** Cursor already has uncommitted Bengal Durga Puja and
Ritu-clock changes in the shared worktree. Preserve them. Do not start by restoring,
resetting, rebasing or overwriting files.

## Pre-flight and ownership

1. Read `AGENTS.md`, `plans/task-log.md`, `plans/module-ownership-map.md` and this
   brief completely.
2. Inspect `git status` and `git diff` before editing. The task-log currently says
   the Bengal slice is merged, but its guide and validation files are actually
   uncommitted. Correct that record only after the commit really exists.
3. Reserve this assignment in `plans/task-log.md` before further coding. If the
   current Cursor session already owns the uncommitted files, update its own row to
   `ACTIVE`; do not create a duplicate writer.
4. Do not touch Codex's active calendar-mode work or Claude's medical-Muhurat work.
5. Complete and commit the existing Ritu-clock slice separately before mixing it
   with these festival changes. This task's festival commit must remain reviewable.

## Allowed festival files

- `src/data/durga-puja-guides.ts`
- `src/data/festival-pages.ts`
- `src/data/vrat-vidhis.ts`
- `src/data/festival-meta.ts` only for the named sequence labels
- `src/engine/festivals.ts` only when a proven date/timing defect requires it
- `src/screens/FestivalGuideScreen.tsx` only for sequence-specific presentation
- `src/screens/MuhuratHub.tsx` only for the named sequence wiring
- new sequence data/components under `src/data/` or `src/components/`
- `validation/durga-puja-pages.cjs`
- `validation/festival-page-coverage.cjs`
- `validation/festival-deeplinks.cjs`
- new dedicated Skanda/Ayyappa sequence gate
- relevant canonical gate lists in `AGENTS.md` and `.cursorrules`
- `plans/backlog.md`, `plans/backlog-acceptance-register.md`, and Cursor's own row
  in `plans/task-log.md`

If another active agent owns one of these files, stop and resolve ownership before
editing it. One writer per file remains mandatory.

## Slice A — finish Bengal Durga Puja ×6

Keep six separate permanent bilingual pages:

1. Mahalaya
2. Shashthi
3. Saptami
4. Maha Ashtami
5. Maha Navami
6. Vijaya Dashami

Each page must have its own answer-first verdict, meaning, household/public-pandal
guidance, fasting or food boundary, worship steps, regional distinction, safety and
completion guidance. Do not merge these pages with generic Sharad Navratri or the
18 Navadurga day pages.

### Calculation and timing requirements

- Mahalaya: correct local Mahalaya Amavasya identity and Pitru Paksha relationship.
- Shashthi: local Shashthi identity and Bodhan/Kalparambha context; do not invent a
  universal priestly clock when only a local pandal schedule is authoritative.
- Saptami: local Saptami date and Nabapatrika/Kolabou context.
- Ashtami: calculate and display the local Sandhi Puja interval as the last 24
  minutes of Ashtami plus the first 24 minutes of Navami. It must not be presented
  as a generic evening aarti.
- Navami: use the documented Bengal day-selection convention and show the local
  tithi context clearly when it differs from another regional calendar.
- Dashami: correct Vijaya Dashami date and local visarjan context without pretending
  that a municipality's procession schedule is astronomically calculated.
- Preserve city, civil date, timezone, language and route through reload and
  Back/Forward navigation.

### Bengal evidence

- Keep the six-page exact-set regression gate.
- Add dated Kolkata anchors for every page and at least one second published source
  for date/timing corroboration.
- Add at least one non-Kolkata or diaspora location check to prove that timings are
  local and no Kolkata clock is hard-coded.
- Store source URL/title, convention, location and retrieval date in a source note
  or fixture file.
- Explain genuine source/convention differences instead of forcing false agreement.

## Slice B — make Skanda Sashti pages genuinely day-specific

Keep these three permanent routes, but stop mapping all three to one undifferentiated
`kandaSashtiAnnual` experience:

1. **Kanda Sashti begins — day 1:** sankalpa, six-day discipline, daily household
   worship and what starts today.
2. **Soorasamharam — day 6:** culmination identity, local temple/event timing where
   a published schedule exists, fasting completion boundary and clear separation
   from a compulsory household dramatic reenactment.
3. **Thirukalyanam — day 7:** distinct following-day celebration, meaning, suitable
   household worship and food/fasting transition.

Retain the existing monthly one-day `skandaShashti` page separately. The monthly
vrata must never acquire the annual six-day copy.

### Skanda evidence

- Verify all three 2026 dates against two published Tamil/temple calendars.
- Include Chennai plus one additional supported city/date calculation check.
- Add a regression assertion that the three pages have different verdicts and
  day-specific steps, not merely different titles pointing to the same guide.
- Verify Tamil terms against two published references; Hindi and English remain the
  current interface languages.

## Slice C — make Ayyappa pages genuinely milestone-specific

Keep these two permanent routes, but stop mapping both to one undifferentiated
`ayyappaMandala` experience:

1. **Mandala Vratham begins:** public season start, distinction between the public
   calendar and a devotee's personal mala-started 41-day vow, preparation and safe
   first-day guidance.
2. **Mandala Pooja:** public 41-day endpoint, local date, worship context and the
   explicit warning that personal mala removal/pilgrimage completion is not
   automatically triggered by the public calendar date.

Keep the existing inclusive day counter and URL-safe Daily progress display.

### Ayyappa evidence

- Verify season start, inclusive day 41 and Mandala Pooja using two independent
  published Kerala/Sabarimala references.
- Add boundary anchors for day 1, day 2, day 40, day 41 and outside the span.
- Add a regression assertion that the start and Pooja routes have different
  verdicts and steps.
- Preserve the current medical, pilgrimage, crowd and Guru Swami safety boundaries.

## Required UX

- Answer before technical data.
- English and Hindi must follow the language toggle everywhere; do not render both
  languages together.
- Every page must visibly identify the selected sequence day and its position in
  the sequence.
- Display the selected city's calculated date/timing or clearly say when a time is
  determined by the local temple/pandal rather than Ganak.
- No silent fallback, generic placeholder or internal research/developer wording.
- Phone-first layout with no horizontal overflow at 390 × 844.
- Existing inline festival-card behaviour and permanent links must both continue to
  work.

## Dedicated acceptance gate

Create a Skanda/Ayyappa sequence gate that proves:

- exact required routes: three Skanda and two Ayyappa;
- all five pages are bilingual and substantive;
- each milestone has a distinct guide identity, verdict and steps;
- monthly Skanda remains separate from annual Kanda Sashti;
- all published date/boundary anchors pass;
- Ayyappa day counter is inclusive and stable;
- no route is deferred or mapped to a thin generic placeholder;
- a deliberate missing route or duplicated guide identity makes the gate fail.

Do not weaken existing gates to accommodate the implementation.

## Mandatory completion checks

Run and record all canonical gates from `AGENTS.md`, plus:

```bash
node validation/durga-puja-pages.cjs
node validation/content-dates.cjs
node validation/festival-deeplinks.cjs
node validation/festival-page-coverage.cjs
node validation/navadurga-pages.cjs
node validation/<new-skanda-ayyappa-sequence-gate>.cjs
npm run build
```

Browser-test all eleven pages/milestones represented by this assignment: six
Bengal, three Skanda and two Ayyappa. Test English and Hindi on desktop, and at
least one page from each family at 390 × 844. Verify direct URL, reload,
Back/Forward, language preservation, selected-city timing, no overflow and zero
browser errors.

## Definition of done

This assignment is complete only when:

- all six Bengal pages and all five Skanda/Ayyappa milestone pages satisfy the
  requirements above;
- every required validation and production build passes;
- browser/phone evidence is recorded;
- the changes are committed and pushed to `main` under the standing git policy;
- Cloudflare production deployment succeeds;
- all eleven live routes are smoke-tested on `ganak.pages.dev`;
- backlog rows 13 and 14 and the live Google Sheet are updated to 100% with commit,
  gate, browser and production evidence;
- Cursor changes its task-log row to `MERGED` only after the commit is present on
  `origin/main`.

If any requirement remains incomplete, leave the task `ACTIVE` and record the
exact remaining work. Do not mark it merged based only on local passing gates.
