# P0 task — festival interaction and dead-end bug bash

Status: READY — unassigned
Owner report: 2026-07-28
Scope: every user-visible festival, vrat, fast, recurring observance and named
variant entry point.

## Bug class to capture

An item looks tappable but does not visibly open, navigate or explain what
happened. This includes:

- a true no-op;
- content expanding below the viewport with no chevron, state change or scroll;
- a row changing background so subtly that it appears unchanged;
- a row expanding generic details when a dedicated route exists;
- mouse click working while keyboard activation or phone tap does not;
- navigation losing language, city, selected date, calendar mode or Back state;
- an internal key, blank panel or silent error appearing after interaction.

## Confirmed examples

1. **Fasts & Festivals list (`MuhuratHub`).** A tap changes local expansion
   state, but the row has no `aria-expanded`, chevron, explicit “View details”
   label, automatic reveal/scroll or route change. On a phone this looks like
   nothing happened. A permanent dedicated page already exists for the entry.
2. **Full-year calendar and festival search (`CalendarPage`).** Rows are static
   visual elements with no click, keyboard or route action. These are true
   navigation dead ends.

## Product interaction contract

Use one clear rule everywhere:

- Primary row tap/click opens the entry's canonical `/festival/...` page.
- If inline preview remains useful, expose it as a separate labelled chevron or
  “Quick details” control with `aria-expanded`.
- The visible row must not pretend to be interactive unless one of those actions
  is available.
- Opening and returning must preserve language, city, date, calendar mode and
  the previous scroll/list context.
- Errors must be visible in the UI; no silent no-op is acceptable.

## Work tasks

### 1. Build the interaction inventory

Create a generated matrix from live registries and list every entry surface:

- Daily “Today” and “Coming up” items;
- Fasts & Festivals fasting and festival tabs;
- Smarta and ISKCON variants;
- full-year calendar;
- festival/tithi search results;
- Hora observance note;
- related/sequence links on dedicated festival pages;
- all 181 permanent festival routes.

For each surface record: displayed key, canonical route, current action, expected
action, language, keyboard behavior and state-restoration requirements.

### 2. Fix true dead ends

- Wire every `CalendarPage` year/search festival and fast row to its canonical
  route.
- Add equivalent keyboard activation and visible focus.
- Do not route ordinary tithi-only search rows to an unrelated festival.
- Unknown/unmapped entries must show a visible bilingual error and fail a gate.

### 3. Make inline expansion unambiguous

- Decide whether the Fasts & Festivals row's primary action navigates or expands;
  do not attach two invisible actions to the same area.
- If expansion remains, add a visible bilingual affordance, `aria-expanded`,
  `aria-controls`, an open-state chevron and reveal the expanded panel within the
  phone viewport.
- Include a clear bilingual “Open full guide” link to the canonical page.
- Ensure a second activation collapses without resetting city/date/language.

### 4. Preserve navigation state

Test route open → Back for:

- `lang=hi` and `lang=en`;
- selected city;
- non-today date;
- Smarta/ISKCON selection;
- fasting/festival tab;
- calendar mode;
- full-year month/search query and prior scroll position.

No browser storage may be introduced.

### 5. Add permanent gates

Create a route-derived interaction gate that fails when:

- a visual festival/fast row has neither a canonical link nor an explicit
  expand control;
- a canonical route exists but the row cannot reach it;
- a button-like row lacks keyboard handling, focus or an accessible state/name;
- `aria-expanded` disagrees with the rendered panel;
- an internal key or empty fallback can render;
- any live registry key is missing from the interaction matrix.

Add failure fixtures for a static row, click-only row, invisible expansion,
missing route, lost Hindi query and stale Back-state restoration.

### 6. Run an independent bug bash

Minimum two agents, with application source read-only during the audit:

- EN and HI;
- 390×844 phone and 1280px desktop;
- mouse, touch-equivalent click, Enter and Space;
- every surface above;
- representative generic, named variant, metadata-overlay, full-guide,
  multi-day, Navadurga and eclipse entries;
- zero no-ops, raw keys, alerts, overflow or console errors.

Record each finding with route, viewport, language, exact action, expected result,
actual result, severity, screenshot/evidence and fix commit.

### 7. Release and production verification

- Run the full canonical gate suite and production build.
- Commit, rebase and push the exact green state.
- Repeat the EN/HI phone/desktop interaction matrix on `ganak.pages.dev`.
- Verify canonical destination, Back restoration, focus/scroll behavior and zero
  console warnings/errors.
- Update `plans/task-log.md`, the backlog acceptance register and Sheet sync.

## Done when

- Every festival/fast-looking row gives immediate visible feedback.
- Every canonical festival route is reachable from every surface that displays
  its entry.
- Calendar year and search contain no static festival/fast dead ends.
- Inline preview, when retained, is clearly separate from full-page navigation
  and is accessible.
- State restoration passes in EN/HI on phone and desktop.
- Two-agent adversarial audit, full gates and production verification are
  recorded and green.
