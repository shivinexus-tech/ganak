# Festival display-label fix and bug bash

Date: 2026-07-28
Task: `CODEX-BUGBASH-FESTIVAL-LABELS-2026-07-28`

## Outcome

The reported Hindi leak is fixed. Canonical keys such as
`pradosh_Thursday` now resolve through reviewed metadata before the legacy
numeric compatibility path, so users see `गुरु प्रदोष` / `Guru Pradosh`.

Two independent read-only audits expanded the scope and found three connected
search/fallback defects. All were fixed in the same slice:

- generic and named Pradosh search used retired numeric keys and returned no
  results;
- generic Ekadashi search collapsed to the first named Ekadashi, and shared
  names such as Putrada silently omitted the second canonical variant;
- malformed or unknown observance keys could leak, render blank or throw.

The Daily answer and Hora note also now pass the local Amanta month into the
observance engine, retaining the named Ekadashi identity instead of downgrading
it to a generic label.

## Automated evidence

- `festival-display-labels.cjs`: 41 registered observances; seven modern and
  seven legacy Pradosh inputs; 24 Ekadashis; generic/malformed fallbacks; EN/HI
  generic and named search paths.
- `festival-variant-identity.cjs`: 24 Ekadashi fixtures, seven weekday Pradosh
  routes and 800-day production-key scan pass.
- Hindi devotional, deep-link, page-coverage, parse and full canonical gates
  pass.
- Production build: 132 modules.

## Browser bug bash

- Hindi desktop annual calendar: all weekday names appeared as रवि/सोम/भौम/
  बुध/गुरु/शुक्र/शनि प्रदोष; zero raw `pradosh_*` strings.
- Hindi search: generic `प्रदोष` returned the upcoming weekday sequence;
  generic `एकादशी` returned the upcoming named sequence rather than one Kamada
  result.
- Hindi phone 390×844 `/festival/guru-pradosh`: correct title, answer-first
  content, zero alerts, zero overflow.
- Browser console: zero application warnings/errors.

Independent reports:

- `plans/audits/festival-display-labels-bugbash.md`
- `plans/audits/festival-display-label-fixtures.md`
