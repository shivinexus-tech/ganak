# Hora Usefulness Overhaul — Design

**Date:** 2026-08-09 · **Author:** Claude Code · **For:** Ganak owner
**Decision this informs:** how the Hora section stops duplicating the Muhurat
finder and becomes the one place every timing system is reconciled.

> Shelf life: the competitive facts behind this design are dated 2026-08-09 and
> live in this conversation plus `plans/2026-08-01-competitive-cosmic-insights.md`.
> The engineering decisions below do not expire.

---

## Persona and journey

*Added 2026-08-10 during final whole-branch review, to close `validation/spec-journey.cjs`
(a gate that landed after this design was written — see `plans/ganak-personas.md`). Written
from what this branch actually built, not restated from the goals above.*

*Persona assignment corrected by the owner on 2026-08-10. It first read P1-primary; that was
the analyst's call, not the owner's, and it was wrong. Recorded here rather than quietly
overwritten, because D1's justification rested on it — see the note below the journeys.*

**Primary persona: P5 · Working astrologer.** Hora is a timing instrument whose output has to
survive being shown to a client. P5 values *speed and correctness, not hand-holding*, and this
branch's entire premise — that a section which recommends a time the same screen forbids is
disqualifying — is a P5 standard, not a householder one. A householder tolerates a vague
answer; a practitioner cannot defend one. Per AGENTS.md, P5 is also the bankable payer.

**Also primary: P2 · Astrology enthusiast**, the growth persona. P2 knows the *names* —
"hora", "Rahu Kaal", "Choghadiya" — and recognition is their trigger. They will read a dense,
honest result and do not need elder-friendly simplification. The verdict badges, the belt
names and the four-lane strip are all built for someone who recognises the vocabulary.

**Secondary: P1 · Panchang householder / diaspora.** Served by the *default* being a single
adjudicated answer with the jargon available but not forced. P1 is the reach surface, not the
design target — the section is not scoped down to P1's needs.

**Consequence of this correction, flagged not buried.** D1 (hard block by default, practitioner
toggle off) was originally justified *by* P1 primacy. That justification no longer holds and is
replaced by this one: the adjudicated answer is the correct default even for P5, because it is
the answer a practitioner would stand behind — the toggle exists to inspect the raw data, not
because the default is a simplification. What this correction does newly imply, and what is
**not** built: for a P5 who works chart after chart, the toggle should persist across sessions
rather than resetting to off every time. That is a real gap, recorded here and in
`plans/backlog.md`, not silently absorbed.

### Journey 1 — P2 asks "hora for travel"

1. Opens the Muhurat/Hora screen (`src/screens/MuhuratHub.tsx`); sunrise/sunset are already
   loaded from `computeTodayPanchang`.
2. Taps the "Hora for travel" example chip; `askHora` fires (`MuhuratHub.tsx`, the `askHora`
   function).
3. `analyzeHora` (`src/engine/hora.ts`) resolves the intent and the favourable planets.
4. Each candidate hora window is adjudicated against Rahu, Gulika, Yamaganda and Choghadiya
   via `adjudicate()` (`src/engine/hora-verdict.ts`) — clean, partial or blocked, not a bare
   planet name.
5. The result renders with a status badge (`Badge`, tone good/warn/bad) and, when partial,
   the trimmed usable range.

### Journey 2 — P5 turns on the practitioner toggle

1. Same screen; the toggle is off by default, so blocked hora windows stay hidden and only
   the next clean window is offered.
2. P5 switches it on.
3. Previously hidden blocked windows render greyed, each naming the specific blocking belt
   (Rahu Kaal / Gulika / Yamaganda) rather than a generic "blocked".

### Journey 3 — opening the app after sunset

1. User opens the app after local sunset.
2. `horaAutoPeriod` in `MuhuratHub.tsx` detects `nowMs` falls outside `[rise, set]` and
   defaults the dial to night.
3. `nightHoras` (`src/engine/hora.ts`) supplies all 12 night windows, tiled from sunset to
   the real following sunrise (`todayP.nextRise`), not the old `rise + 86400000` estimate.
4. The dial and the lane strip (`TimingLanes.tsx`) show the night hora currently running,
   graded the same way as day horas.

### Journey walked against the code

Before this branch (confirmed by reading the pre-branch `MuhuratHub.tsx` and `hora.ts`, and
by `plans/task-log.md`'s own record of the defect): step 4 of Journey 1 was broken — the Hora
advisor named a planet and a time window with no reference to Rahu Kaal, Gulika or Yamaganda,
so it could and did recommend a window the same screen marked forbidden elsewhere. Step 3 of
Journey 3 was also broken: night horas existed only inside a search result, not on the dial,
and where they existed they were tiled against `rise + 86400000` rather than a real sunrise.

Today, verified by `node validation/hora-adjudication.cjs` and its M1 real-panchang loop
(370 real days × 2 cities): every hora window offered anywhere in `MuhuratHub.tsx` — dial,
lane strip, Ask-box answer — is adjudicated through `adjudicate()` before it is shown, and no
`usable` span it grades ever intersects Rahu Kaal, Gulika or Yamaganda. Journey 1 step 4 and
Journey 3 step 3 both work today; that is what this branch changes.

One step is honestly still missing, not something this design pretends is fixed: a
multi-planet answer (e.g. "Venus & Jupiter hora are favourable for marriage") still times
only the first named planet — confirmed live in `MuhuratHub.tsx` (`const tp = hr.planets[0]`)
— so the journey is incomplete for that phrasing. Tracked as an open finding, not silently
dropped.

### What already exists

This design adds two new pure engine modules and one new component, but most of the journey
already exists and is reused rather than rebuilt:

- The Panchang engine (`src/engine/panchang.ts`) already computes Rahu Kaal, Gulika,
  Yamaganda and Abhijit; this design only reads them (§4, "read-only" arrow).
- `dayHoras` / `analyzeHora` / the Ask box already exist in `src/engine/hora.ts` and
  `MuhuratHub.tsx`; this design adjudicates their output instead of replacing the flow.
- The `Badge` component and its good/warn/bad tones already exist in `ui-primitives.tsx` and
  are reused verbatim for verdicts.
- `CHOG_NAME`'s bilingual Choghadiya names already exist and are already gated; no new
  grading vocabulary is invented (D5).
- The manual ascendant selector already exists and already fed `horaPersonalAusp`; the
  personal lane reuses that existing selector's output rather than waiting on saved charts
  (D8).

### Success measured in user steps

Steps today for a householder to discover a recommended hora is actually unusable: open Hora
(1) → read the planet name (2) → scroll to find the Rahu Kaal / Gulika / Yamaganda card
elsewhere on the screen (3) → mentally compare the two time ranges (4) → still risk acting on
a window the app itself forbade. Steps target: open Hora → read a verdict that already
carries clear / partly-blocked / blocked (2 steps) — fewer steps, and the manual comparison
in steps 3–4 disappears rather than merely getting faster. Zero new forms are added to reach
this: G8's ascendant input reuses the existing manual selector.

---

## 1. Problem

Ganak's Hora section and its Muhurat finder answer the same question — "when
today should I do this" — from two rulebooks that never speak to each other.

Three defects follow from that:

1. **Contradiction.** The Hora advisor can recommend a window that the same
   screen, twelve hundred pixels higher, marks as Rahu Kaal. For the paying
   segment — practising astrologers — a self-contradicting tool is
   disqualifying, not merely untidy.
2. **Half a system.** The dial draws 12 of the day's 24 horas. Night horas exist
   only inside a search result.
3. **No verdict.** Horas are never graded. The user gets a fact ("Mercury hora")
   where they asked for a decision ("yes, now").

A fourth defect is invisible: the drag readout on the hora dial already computes
a Choghadiya + Rahu Kaal verdict and renders it inside the hora chart, unlabelled.
The merge is half-built. This design finishes it deliberately.

## 2. Competitive basis

Of 14 products verified feature-by-feature on 2026-08-09:

| Finding | Count |
|---|---|
| Compute hora identically from local sunrise/sunset | 14 / 14 |
| Grade horas auspicious/inauspicious | 7 / 14 |
| Put multiple timing systems on one shared time axis | 1 / 14 (align27) |
| Produce a single merged verdict across systems | **0 / 14** |
| Accept a free-text activity question | **0 / 14** (Ganak alone) |

The maths is a commodity. The open positions are **adjudication** (nobody) and
**one shared axis** (align27 alone, and they visualise the conflict rather than
resolving it). This design takes both.

## 3. Goals and non-goals

**Goals**

- G1. Every hora answer carries a verdict against Rahu, Gulika, Yamaganda and
  Choghadiya, and states the usable remainder.
- G2. All 24 horas are visible; day and night.
- G3. Horas are graded in Ganak's own vocabulary (Amrit / Labh / Shubh …).
- G4. Hora, Choghadiya and the forbidden belts share one time axis.
- G5. The Ask box never dead-ends: an unsuitable answer still returns the next
  clean window.
- G6. Confidence is shown when the match was ambiguous.
- G7. The section is measurable.
- G8. A user who supplies an ascendant sees which horas are personally theirs.

**Non-goals (explicitly out of scope)**

- Mobile app, widgets, lock-screen or push notifications. Web-only stands.
- Additional languages beyond the existing EN/HI. Tracked separately.
- Monetisation, accounts, or saved-chart integration. G8 uses the existing
  manual ascendant selector; a saved chart can feed it later without redesign.
- Panchapakshi or any new timing system.
- Any change to how Choghadiya, Rahu Kaal, Gulika or Yamaganda are *computed*.
  This design only consumes them.

## 4. Architecture

```
                    ┌──────────────────────────────┐
                    │  src/engine/panchang.ts       │  (unchanged)
                    │  choghaDay/choghaNight, rahu, │
                    │  gulika, yama, abhijit, rise, │
                    │  set, dow                     │
                    └───────────────┬───────────────┘
                                    │ read-only
        ┌───────────────────────────┼───────────────────────────┐
        │                           │                           │
┌───────▼────────┐        ┌─────────▼──────────┐      ┌─────────▼─────────┐
│ engine/hora.ts │        │ engine/            │      │ engine/           │
│ (existing)     │───────▶│ hora-verdict.ts    │◀─────│ personal-hora.ts  │
│ dayHoras()     │ windows│ NEW — pure         │ asc  │ NEW — pure        │
│ horaWindows-   │        │ adjudication       │      │ trikona lords     │
│ ForPlanet()    │        └─────────┬──────────┘      └─────────┬─────────┘
│ analyzeHora()  │                  │ Verdict                   │
└───────┬────────┘                  │                           │
        │                           │                           │
        └───────────────┬───────────┴───────────────────────────┘
                        │
            ┌───────────▼────────────┐      ┌────────────────────────┐
            │ components/            │      │ screens/MuhuratHub.tsx │
            │ TimingLanes.tsx  NEW   │◀─────│ (presentation only)    │
            │ shared-axis lane strip │      └────────────────────────┘
            └────────────────────────┘
```

**Principle: all judgement lives in pure engine modules.** `hora-verdict.ts` and
`personal-hora.ts` import no React, hold no state, and are directly loadable by
the `validation/_load-app.cjs` harness. The screen renders verdicts; it never
computes them. This is what makes the rules testable and, for a practitioner,
auditable.

### 4.1 New module: `src/engine/hora-verdict.ts`

Types (exact, referenced by every downstream task):

```ts
export type Window = { start: number; end: number };

export type BlockerKey = "rahu" | "gulika" | "yama";

export type VerdictStatus = "clean" | "partial" | "blocked";

export type TimingContext = {
  rahu: Window | null;
  gulika: Window | null;
  yama: Window | null;
  abhijit: Window | null;
  chogha: Array<{ key: string; nat: "good" | "neutral" | "bad"; start: number; end: number }>;
};

export type Verdict = {
  status: VerdictStatus;
  usable: Window[];
  blockedBy: BlockerKey[];
  grade: "good" | "neutral" | "bad";
  gradeKey: string | null;   // choghadiya key, e.g. "amrit"
  abhijitBoost: boolean;
};
```

Functions:

| Function | Signature | Responsibility |
|---|---|---|
| `subtractWindows` | `(base: Window, cuts: Window[]) => Window[]` | Interval subtraction; returns ordered, non-overlapping remainders |
| `dominantChoghadiya` | `(win: Window, ctx: TimingContext) => { key: string; nat: "good"\|"neutral"\|"bad" } \| null` | The Choghadiya segment covering the most of `win` |
| `adjudicate` | `(win: Window, ctx: TimingContext) => Verdict` | The rule set below |
| `nextCleanWindow` | `(windows: Window[], ctx: TimingContext, afterMs: number) => { window: Window; verdict: Verdict } \| null` | First window at/after `afterMs` whose verdict has usable time |

### 4.2 The rule set

Stated explicitly because a practitioner must be able to check it.

| # | Rule | Rationale |
|---|---|---|
| R1 | Any overlap with Rahu, Gulika or Yamaganda is subtracted from the window | Classical precedence: these belts void an otherwise good period |
| R2 | Remainders shorter than **3 minutes** are discarded — but only remainders a cut actually created; a window no belt overlaps passes through whole regardless of its own length | A two-minute sliver left over after subtracting a belt is noise, not advice; a short window nothing touches is simply a short window, not noise |
| R3 | `usable` empty → `blocked`; `usable` shorter than the window → `partial`; otherwise `clean` | |
| R4 | `grade`/`gradeKey` come from the Choghadiya segment covering the greatest share of the **usable** spans (overlap summed across all of them), not of the whole window. When `usable` is empty (fully blocked), grade over the whole window instead | Ganak already classifies Choghadiya as good/neutral/bad in `panchang.ts`. Grading a segment that lies entirely inside a blocked hole is misleading — it recommends time the user cannot act in. A fully blocked window has no usable time to grade, so it falls back to reporting what its quality would have been |
| R5 | `abhijitBoost` is `true` only when Abhijit overlaps at least one of the **usable** spans, not the whole window. When `usable` is empty (fully blocked), fall back to whole-window overlap instead. Abhijit sets this boost flag but **does not** clear a block | Abhijit lying entirely inside a blocked hole would boost a recommendation the user cannot act in — same failure mode R4 fixes for grading. A fully blocked window has no usable time to check against, so it falls back to reporting whether it would have been boosted. Abhijit is auspicious, not a universal solvent; a Wednesday Abhijit is itself avoided. Recorded as a deliberate conservative choice — see §8 D2 |
| R6 | Ties in R4 resolve to the earlier segment | Deterministic output; gates depend on it |
| R7 | Adjudication is time-zone agnostic — all inputs are epoch ms | Matches every existing engine module |

*R2's scope (cut-created remainders only, not short windows in general) was ambiguous in the
original draft of this row and was resolved during implementation; `validation/hora-adjudication.cjs`
pins both directions — a 90-second remainder left by a cut is discarded, and a 120-second
window nothing touches is not — corrected here at final review.*

**Presentation rule (not engine):** by default, blocked windows are hidden and the
next clean window is offered instead. A practitioner toggle reveals blocked
windows, greyed, with the blocking reason named. Default off.

### 4.3 New module: `src/engine/personal-hora.ts`

Absorbs and extends the existing `horaPersonalAusp` from `hora.ts`.

```ts
export function trikonaLords(ascIdx: number): string[];
export function personalHoraWindows(
  ascIdx: number, weekday: number, rise: number, set: number, nextRise: number
): Array<{ planet: string; start: number; end: number; period: "day" | "night" }>;
```

`horaPersonalAusp` is re-exported from `hora.ts` for one release so nothing breaks,
then removed.

### 4.4 New component: `src/components/TimingLanes.tsx`

A linear, horizontally-scrolling lane strip sharing one time domain, rendered
below the existing arc. The arc keeps its job — showing *now* — and the strip
takes the job the arc cannot do: showing four systems at once.

| Lane | Content | Source |
|---|---|---|
| 1 · Hora | 12 segments, planet colour, glyph at current | `dayHoras` / night equivalent |
| 2 · Choghadiya | segments tinted by `nat`, labelled with `CHOG_NAME` | `todayP.choghaDay` / `choghaNight` |
| 3 · Blocked | Rahu / Gulika / Yamaganda blocks; Abhijit as a gold notch | `todayP.rahu` etc. |
| 4 · Yours | trikona-lord horas only, shown when an ascendant is set | `trikonaLords(horaAsc)`, filtering the already-computed hora list (lane 1) by ruler — **not** `personalHoraWindows` |

Props:

```ts
type TimingLanesProps = {
  domain: { start: number; end: number };      // rise→set or set→nextRise
  period: "day" | "night";
  horas: Array<{ ruler: string; start: number; end: number }>;
  chogha: Array<{ key: string; nat: string; start: number; end: number }>;
  blockers: Array<{ key: BlockerKey; window: Window }>;
  abhijit: Window | null;
  personal: string[] | null;                    // planet names, or null to hide lane 4
  nowMs: number | null;
  lang: "en" | "hi";
  onSelect: (win: Window) => void;
};
```

*Corrected at final review: `personalHoraWindows` (§4.3) exists, is correct, and is exercised
by `validation/hora-adjudication.cjs`, but it has **zero production callers** — `MuhuratHub.tsx`
imports `trikonaLords` directly and filters the hora list it already computed for lane 1
(`personal.includes(h.ruler)` in `TimingLanes.tsx`) rather than requesting a second computed
list from `personalHoraWindows`. Both approaches yield the same set of windows; the UI took
the cheaper path of filtering data it already had.*

### 4.5 Day/night toggle

One control above the arc and strip, switching the domain between
`rise → set` and `set → nextRise`. It defaults to whichever contains "now" on
today's date, and to day for any other date.

## 5. Design system

No new token file. `src/styles/design-tokens.css` remains the single source, per
the locked architecture in `plans/task-log.md`.

| Element | Token / primitive | Note |
|---|---|---|
| Lane fills — hora | `HORA_COLOR` (existing, already `color-mix` against `--ink`) | unchanged |
| Lane fills — choghadiya | `--good`, `--muted`, `--bad` at reduced opacity | reuses semantic tokens |
| Blocked blocks | `--bad` with a diagonal hatch | hatch carries the meaning for colour-blind users |
| Abhijit notch | `--gold` | existing |
| Verdict badge | `Badge` from `ui-primitives.tsx`, tones `good` / `warn` / `bad` | **icon + text**, never colour alone — required by `accessibility-comfort.cjs` |
| Lane label typography | `T.label` / `--font-label` | existing scale |
| Lane height | `1.25rem` day lanes, `0.75rem` personal lane | rem by convention — **not** gate-enforced for `height`/`width`/`marginBottom`; see the known weakness below |
| Touch targets | 44px floor on every lane segment and the toggle | existing shared control floor |

*Corrected at final review: `design-system-primitives.cjs`'s raw-px regex only matches
`padding`, `margin`, `gap`, `borderRadius` and `minHeight` — it does not match `height`,
`width` or `marginBottom`. A reviewer set `LANE_H = "20px"` in `TimingLanes.tsx` and every
gate, including this one, stayed green. Raw hex colour literals genuinely **are** caught (a
separate regex scans for `#[0-9A-Fa-f]{3,8}`), so the colour half of this row's original claim
holds; the px half did not. Not closed on this branch — the fix belongs in
`design-system-primitives.cjs` itself, and widening its regex risks new false positives across
every other screen it already scans.*

**Verdict vocabulary (bilingual, final):**

| status | EN | HI |
|---|---|---|
| `clean` | "Clear" | "स्पष्ट" |
| `partial` | "Partly blocked" | "आंशिक रूप से बाधित" |
| `blocked` | "Blocked" | "बाधित" |

**Grading vocabulary:** reuse `CHOG_NAME` verbatim — Amrit, Labh, Shubh, Char,
Udveg, Kaal, Rog. No new names are invented; these are already bilingual, already
gated, and already what the rest of the app says.

## 6. Telemetry

`src/telemetry/privacy-events.ts` exposes a fixed dictionary and stays disabled
without `VITE_ANALYTICS_ENDPOINT`. Three events are added inside that discipline,
reusing the existing property names only (`action`, `language`, `outcome`):

| Event | Properties | Fires when |
|---|---|---|
| `hora_ask` | `action` (typed \| button \| example \| retry), `language` | user submits the Ask box — typed = Enter key, button = the Ask button, example = an example chip, retry = a chip offered on the clarify branch |
| `hora_ask_outcome` | `outcome` (answer \| clarify \| timing \| explain \| unknown \| empty), `language` | analyzer (`analyzeHora`) returns — mirrors its `status` field exactly |
| `hora_verdict_shown` | `outcome` (clean \| partial \| blocked), `language` | a verdict renders |

No question text, no place, no birth data — the property allow-list makes that
structurally impossible, and this design does not widen it.

*Corrected at final review: the original draft under-specified both value sets. `action` is
whatever string the four call sites in `MuhuratHub.tsx` pass, not a curated `typed |
example-chip` pair. `hora_ask_outcome`'s `outcome` is `analyzeHora`'s `status` field verbatim
(`src/engine/hora.ts`), which includes `explain` and `empty` alongside the four originally
listed. `hora_verdict_shown`'s `outcome` (`clean | partial | blocked`, `adjudicate`'s
`status`) was already correct. None of this is a privacy issue — `privacyEvent` enforces its
`area/action/language/outcome` property allow-list at send time regardless of what value is
passed — the value *sets* documented here were simply wrong.*

## 7. Validation

New gate `validation/hora-adjudication.cjs`, following the existing
`daily-windows.cjs` pattern (`loadApp`, counted failures, non-zero exit).

It must assert, and must be **mutation-tested** — deleting each rule has to make
the gate fail:

1. `windowOverlapsDomain` — the predicate `TimingLanes.tsx` actually renders through — over
   370 consecutive real days for Delhi and Chennai: every belt/Abhijit window that survives
   the filter genuinely overlaps its domain, and day-only belts (Rahu, Gulika, Yamaganda) and
   Abhijit never survive the *night* domain's filter. *(Added at final review as the "M1
   real-panchang loop", after the review found belts leaking into the night lane strip; the
   370-day/two-city real-data assertion promised by this item did not exist before that.)*
2. A window fully inside Rahu Kaal → `blocked`, `usable` empty.
3. A window straddling the start of Rahu Kaal → `partial`, exactly one remainder,
   remainder ends at Rahu start.
4. A window untouched by any belt → `clean`, `usable` equals the window.
5. A 2-minute remainder is discarded (R2); a 4-minute remainder survives.
6. `gradeKey` matches the Choghadiya segment with the largest overlap; the tie
   case resolves earlier (R6).
7. Abhijit overlapping a blocked window leaves `status: "blocked"` (R5).
8. `nextCleanWindow` clips the *offered* `.verdict.usable[0].start` to `afterMs`, but
   `.window` itself keeps the original hora's real boundaries and can start before `afterMs`.
   *(Corrected at final review: the earlier claim that `.window` never starts before `afterMs`
   was false — the gate itself asserts `n.window.start === 300000` with `afterMs = 350000`. A
   caller rendering `.window.start` as "the time to leave" would print an elapsed time;
   `.verdict.usable[0].start` is the field that is actually clipped.)*
9. Every one of the 24 real horas (day + night) on each of those 370×2 real days is
   adjudicated without throwing, and no `usable` span from any of them intersects Rahu Kaal,
   Gulika or Yamaganda. *(Same M1 loop as item 1 — real computed data, not a synthetic
   fixture on one sample day as originally described.)*
10. Day + night horas tile the full sunrise→next-sunrise span with no gap
    greater than 1ms and no overlap.

The existing gates that must stay green: `accessibility-comfort`,
`design-system-primitives`, `privacy-events`, `parse-check`, `daily-windows`,
plus the production build.

## 8. Decisions taken, and why

| # | Decision | Alternative rejected | Why |
|---|---|---|---|
| D1 | Rahu/Gulika/Yama hard-block by default, with a practitioner toggle to reveal | Show everything ranked; or block with no escape hatch | Householders need one answer; practitioners need the raw view. Owner was offered the fork on 2026-08-09 and did not pick, so the inclusive option was taken and flagged. **Owner may overrule.** |
| D2 | Abhijit boosts, never overrides | Abhijit cancels all doshas | The "cancels everything" reading is contested and Wednesday Abhijit is itself avoided. Conservative default; revisit with a sourced ruling |
| D3 | Linear lane strip below the arc, not lanes on the arc | Concentric rings on the semicircle | Rings on a 180° arc compress badly at 320px and cannot carry labels. The strip scrolls; the arc stays the hero |
| D4 | Verdict engine is a new module, not additions to `hora.ts` | Extend `hora.ts` | `hora.ts` is the Hora/Gochar lane's file and already 170 lines of unrelated concern. Adjudication is consumed by Muhurat too |
| D5 | Reuse `CHOG_NAME`, invent no new window names | Coin Ganak equivalents of Golden/Productive/Silence | Amrit/Labh/Shubh are better names, already bilingual, already gated, and authentic to the tradition |
| D6 | Night horas use the real next-day sunrise | Keep `rise + 86400000` | *Measured at final review, correcting the estimate below:* at Delhi the `rise + 86400000` approximation drifts **~1.2 minutes maximum, peaking near the equinox** — not "several minutes, worst near the solstices" as first assumed. The multi-minute figure only holds at high latitude (Tromsø ~23 min, Reykjavík ~3 min). Delhi's own drift is small, but a timing product should compute the real value rather than assume it is negligible everywhere |
| D7 | 3-minute minimum usable remainder | No minimum; or 5 minutes | Below ~3 minutes the advice is unusable in practice; 5 discards genuinely usable slivers |
| D8 | Personal lane from the existing manual ascendant selector | Wait for saved charts | Ships now, and `personalHoraWindows` takes `ascIdx` either way — a saved chart feeds the same function later with no redesign |

## 9. Risks

| Risk | Mitigation |
|---|---|
| `src/screens/MuhuratHub.tsx` is claimed by the unmerged REVIEW branch `codex/jyotish-ux-remaining` | No screen edits until it lands or the owner clears the lane. Engine modules and the new component are outside its file list and can proceed |
| The strip makes an already-long screen longer | *Corrected at final review — the strip does not collapse.* It scrolls horizontally rather than shrinking to a summary row: Task 7 established that a fixed-rem-width scrollable track beats shrinking touch targets below the 2.75rem floor to fit 100% of a narrow viewport (see the layout note atop `TimingLanes.tsx`). The day/night toggle halves what is on screen at once |
| Hard-blocking annoys users who disagree with the rule | The practitioner toggle exists precisely for this, and the reason is always named |
| Adjudication changes what the Muhurat finder shows too | It does not — this release only *reads* muhurat data. Applying verdicts to the Muhurat finder is a separate, later decision |

## 10. Success criteria

1. No screen state exists in which Ganak recommends a window it elsewhere forbids.
2. All 24 horas reachable without typing a search.
3. Every hora answer shows a status and, when blocked, an alternative.
4. `validation/hora-adjudication.cjs` passes and fails under mutation.
5. Three hora events appear in the fixed telemetry dictionary.
6. Zero new colour literals, zero raw px, zero second token file.
