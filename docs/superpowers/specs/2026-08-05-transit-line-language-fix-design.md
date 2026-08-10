# Spec A — Upcoming planetary events: one language per line

**Date:** 2026-08-05
**Status:** Draft for owner approval
**Backlog:** rider on `E-1.0` (`plans/backlog.md:1238`), split out to ship independently
**Size:** small — one engine function, one card, one gate

---

## Problem Statement

The **Upcoming planetary events** card on the Daily screen renders every planet name
in Devanagari regardless of the language toggle. An English-mode user reads
`शुक्र Venus enters Kanya` — Hindi script, English verb, romanised Sanskrit sign, in
one line. This is the first Jyotish surface a new visitor meets on the Daily screen,
and it reads as a rendering fault rather than a design choice.

The cause is a single construction repeated twice in
[`src/engine/panchang.ts:205`](../../../src/engine/panchang.ts) and
[`:212`](../../../src/engine/panchang.ts):

```js
label: `${PLANET_DEVA[p]} ${p} enters ${SIGNS[sg].split(" ")[0]}`
label: `${PLANET_DEVA[p]} ${p} turns ${v < 0 ? "retrograde ℞" : "direct"}`
```

`PLANET_DEVA` is the Hindi name table. It is concatenated unconditionally — nothing
consults `lang`. [`src/screens/DailyScreen.tsx:363`](../../../src/screens/DailyScreen.tsx)
then renders `e2.label` verbatim, so the screen has no opportunity to correct it.

This has been live since the card shipped. It was recorded on 2026-07-28 as a
sub-clause of a larger backlog item, reserved on 2026-07-29, and never implemented —
the reservation was retired stale on 2026-08-03 with zero commits.

**Deeper cause worth naming.** `src/i18n/panchang-terms.ts` opens by stating the
project's own rule:

> the engine deliberately speaks one language internally … Translating inside the
> engine would put presentation into the validated numerical layer, so the
> localisation lives here and is applied at the edge.

`upcomingEvents()` breaks that rule. It emits a finished bilingual display string
from inside the astronomy layer. Fixing the two lines cosmetically would leave the
violation in place; this spec fixes the boundary.

## The user and their journey

**Primary persona: P1 · Panchang householder / diaspora** — opens Ganak in English to
see what the sky is doing this week. Secondary: **P2 · Astrology enthusiast**, who
reads this card most often.

The journey, walked against the code as it stands today:

1. Opens `/` in English. **Works today.**
2. Scrolls past today's tithi to *Upcoming planetary events*. **Works today.**
3. Reads the next transit line. **BROKEN** — the row reads `शुक्र Venus enters Kanya`.
   Evidence: `src/engine/panchang.ts:205` concatenates `PLANET_DEVA[p]` into the label
   unconditionally; `src/screens/DailyScreen.tsx:363` renders `e2.label` verbatim, so
   the screen cannot correct it.
4. Switches to Hindi to see whether that reads better. **ALSO BROKEN** — the row becomes
   `शुक्र Venus प्रवेश कन्या`. Evidence: `src/engine/transit-copy.ts:46` returns early
   for English and never translates the planet name for Hindi.
5. Taps a row to expand the gloss. **Works today** — `eventDetail` keys off the label.

Steps 3 and 4 are the whole defect: the reader cannot get one clean language out of
this card in either mode.

## What already exists (reuse before building)

- **`src/i18n/panchang-terms.ts`** — the shared bilingual lookup, with `sign`,
  `nakshatra`, `tithi`, `paksha` and `month` tables and a documented rule that the
  engine speaks one canonical language and localisation happens at the edge. It is
  missing only a `planet` table.
- **`src/engine/transit-copy.ts`** — the edge layer already exists and is already
  wired into DailyScreen. It needs the planet case, not a redesign.
- **`eventDetail`** already produces the expandable gloss; nothing there changes.

Because both pieces exist, this is a small correction to one function, not new
infrastructure.

## Goals

1. Every line of the Upcoming planetary events card renders in exactly one script —
   the one the language toggle selects.
2. `upcomingEvents()` returns structured data, not display prose; language selection
   moves to the screen edge, matching the stated architecture.
3. A gate fails the build if Devanagari re-enters an engine-emitted label.
4. Zero change to any computed time, sign boundary or station instant.

## Non-Goals

- **Renaming signs to Western names** (Kanya → Virgo). That is Spec B. This spec
  keeps whatever sign vocabulary is current so the two can ship independently.
- **The repo-wide language leak sweep.** Spec B. This spec touches one card.
- **Translating `Sankranti`, `Purnima`, `Amavasya`.** These are event names, not
  planet names, and the project rule is to keep Sanskrit for proper event names.
  Flagged as an open question, not changed here.
- **Any change to the eclipse, Choghadiya or Muhurat surfaces.**

## User Stories

- As an English-mode reader, I want the upcoming-transits list in English, so the
  Daily screen does not look broken on the first Jyotish thing I see.
- As a Hindi-mode reader, I want the same list fully in Devanagari including the
  verb ("वक्री होता है", not "turns retrograde"), so my language is a real mode and
  not a partial veneer.
- As the next agent touching `panchang.ts`, I want a gate that catches a hardcoded
  Devanagari label, so this specific regression cannot return unnoticed.
- As the owner, I want the transit times to be provably identical before and after,
  so a label fix cannot silently move an astronomical event.

## Requirements

### P0 — Must have

**A1. `upcomingEvents()` emits structured events, not prose.**
Each event carries the fields a renderer needs. Existing fields `t`, `planet`, `type`
are retained; `label` is removed from the sign and station events and replaced by:

| field | sign event | station event |
|---|---|---|
| `type` | `"sign"` | `"station"` |
| `planet` | `"Venus"` | `"Venus"` |
| `signIndex` | `0–11` | — |
| `direction` | — | `"retrograde"` \| `"direct"` |

*Acceptance:*
- Given `upcomingEvents()` is called, when any returned event is inspected, then it
  contains no Devanagari character and no English sentence fragment.
- Given the same date and place, when events are computed before and after this
  change, then every `t` value is bit-identical to the previous implementation.

**A2. The Daily card composes the label in the active language.**
`DailyScreen` builds the display string from the structured event, using
`panchangTerm(lang, "sign", …)` for the sign and a new planet lookup (see A3).
Verbs (`enters`, `turns retrograde`, `turns direct` / `प्रवेश`, `वक्री`, `मार्गी`)
come from the screen's bilingual copy, not the engine.

*Acceptance:*
- Given `lang === "en"`, when the card renders, then no line contains a Devanagari
  codepoint.
- Given `lang === "hi"`, when the card renders, then the planet name, the sign name
  **and the verb** are all Devanagari.
- Given the language toggle is switched with the card open, then every line switches
  script together — no line lags or stays mixed.

**A3. A planet name lookup lives beside the other term tables.**
`src/i18n/panchang-terms.ts` gains a `planet` table (the nine grahas) exposed through
the existing `panchangTerm(lang, kind, value)` signature. `PLANET_DEVA` in
`panchang.ts` is not deleted in this spec — Chart and Matching still import it — but
the engine stops using it to build labels.

*Acceptance:*
- `panchangTerm("hi", "planet", "Venus")` returns `"शुक्र"`.
- `panchangTerm("en", "planet", "Venus")` returns `"Venus"`.
- An unrecognised value falls through unchanged, matching the module's existing
  contract.

**A4. Gate: `validation/transit-event-language.cjs`.**
Written before the fix, red first. Asserts:
1. No event object returned by `upcomingEvents()` contains a Devanagari codepoint
   (`/[ऀ-ॿ]/`).
2. Rendering in `en` produces zero Devanagari; rendering in `hi` produces Devanagari
   for planet, sign and verb.
3. A pinned anchor: for a fixed date and place, the event timestamps match a recorded
   baseline captured from the current implementation, proving the maths is untouched.

*Acceptance:* the gate fails against `main` today and passes after the change.

### P1 — Should have

**A5.** The Sun's Sankranti line (`panchang.ts:189`) currently reads
`Surya enters Kanya · Sankranti` — romanised Sanskrit for the planet in English mode,
where every other line says `Sun`. Normalise to `Sun` in English, `सूर्य` in Hindi,
keeping `Sankranti` / `संक्रांति` as the event name in both.

### P2 — Future

**A6.** `Purnima — full moon` and `Amavasya` (`panchang.ts:190–191`) hardcode an
English gloss. They belong to the same class of engine-emitted prose but are proper
event names; fold into Spec B's sweep rather than here.

## Success Metrics

This is a correctness fix on a pre-revenue surface; user telemetry is not the right
instrument. Verification is mechanical and visual:

**In user steps** — the measure that matters, taken on the journey above:

| Journey step | Today | Target |
|---|---|---|
| Steps that render a mixed-script line (EN) | 1 of 5 | **0 of 5** |
| Steps that render a mixed-script line (HI) | 1 of 5 | **0 of 5** |
| Taps needed to reach one clean language | impossible — no tap fixes it | **zero typing, zero extra taps** |

**Leading (same day):**
- `validation/transit-event-language.cjs` red → green.
- Devanagari codepoints in English-mode Daily card: **0** (currently ~7 per screen —
  one per visible event).
- Event timestamp diff vs. baseline: **0 ms** across a 75-day window.

**Lagging (next bug bash):**
- The Daily card produces no language finding in the next two-agent bug bash.
- No regression row referencing `transit-event-language` in `plans/task-log.md`.

## Open Questions

- **(owner)** In Hindi mode, should the retrograde marker stay as the symbol `℞`, or
  become `वक्री`? The symbol is script-neutral and compact; the word is clearer to a
  household reader. *Non-blocking — I will ship `वक्री` with `℞` retained in English
  unless told otherwise.*
- **(owner)** Should `Sankranti` remain Sanskrit in English mode? The project rule
  says yes for festival names. *Non-blocking — keeping it Sanskrit.*
- **(engineering)** `PLANET_DEVA` is exported from `panchang.ts` and used by
  ChartScreen and PlanetCalendarCard. Migrating those to `panchangTerm` is Spec B's
  job; this spec leaves the export in place. Confirm no one objects to the temporary
  duplication.

## Timeline Considerations

No hard deadline. No dependencies — this can ship before, after or alongside Spec B,
because it deliberately does not touch sign vocabulary.

Suggested sequence: **A first.** It is small, it proves the structured-event pattern
that Spec B then applies everywhere, and it removes a visible defect today.

**Reservation discipline:** this work takes its own branch and its own worktree. Per
Spec C, and per `AGENTS.md:38`, it must not be recorded against an existing worktree
belonging to another task — that is precisely how the original attempt died.
