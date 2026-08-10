# Hora Usefulness Overhaul — Design

**Date:** 2026-08-09 · **Author:** Claude Code · **For:** Ganak owner
**Decision this informs:** how the Hora section stops duplicating the Muhurat
finder and becomes the one place every timing system is reconciled.

> Shelf life: the competitive facts behind this design are dated 2026-08-09 and
> live in this conversation plus `plans/2026-08-01-competitive-cosmic-insights.md`.
> The engineering decisions below do not expire.

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
| R2 | Remainders shorter than **3 minutes** are discarded | A two-minute "usable window" is noise, not advice |
| R3 | `usable` empty → `blocked`; `usable` shorter than the window → `partial`; otherwise `clean` | |
| R4 | `grade`/`gradeKey` come from the Choghadiya segment covering the greatest share of the **usable** spans (overlap summed across all of them), not of the whole window. When `usable` is empty (fully blocked), grade over the whole window instead | Ganak already classifies Choghadiya as good/neutral/bad in `panchang.ts`. Grading a segment that lies entirely inside a blocked hole is misleading — it recommends time the user cannot act in. A fully blocked window has no usable time to grade, so it falls back to reporting what its quality would have been |
| R5 | `abhijitBoost` is `true` only when Abhijit overlaps at least one of the **usable** spans, not the whole window. When `usable` is empty (fully blocked), fall back to whole-window overlap instead. Abhijit sets this boost flag but **does not** clear a block | Abhijit lying entirely inside a blocked hole would boost a recommendation the user cannot act in — same failure mode R4 fixes for grading. A fully blocked window has no usable time to check against, so it falls back to reporting whether it would have been boosted. Abhijit is auspicious, not a universal solvent; a Wednesday Abhijit is itself avoided. Recorded as a deliberate conservative choice — see §8 D2 |
| R6 | Ties in R4 resolve to the earlier segment | Deterministic output; gates depend on it |
| R7 | Adjudication is time-zone agnostic — all inputs are epoch ms | Matches every existing engine module |

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
| 4 · Yours | trikona-lord horas only, shown when an ascendant is set | `personalHoraWindows` |

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
| Lane height | `1.25rem` day lanes, `0.75rem` personal lane | rem only; `design-system-primitives.cjs` rejects raw px |
| Touch targets | 44px floor on every lane segment and the toggle | existing shared control floor |

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
| `hora_ask` | `action` (typed \| example-chip), `language` | user submits the Ask box |
| `hora_ask_outcome` | `outcome` (answer \| clarify \| timing \| unknown), `language` | analyzer returns |
| `hora_verdict_shown` | `outcome` (clean \| partial \| blocked), `language` | a verdict renders |

No question text, no place, no birth data — the property allow-list makes that
structurally impossible, and this design does not widen it.

## 7. Validation

New gate `validation/hora-adjudication.cjs`, following the existing
`daily-windows.cjs` pattern (`loadApp`, counted failures, non-zero exit).

It must assert, and must be **mutation-tested** — deleting each rule has to make
the gate fail:

1. `subtractWindows` over 370 consecutive days for Delhi and Chennai: remainders
   ordered, non-overlapping, inside the base, never negative-length.
2. A window fully inside Rahu Kaal → `blocked`, `usable` empty.
3. A window straddling the start of Rahu Kaal → `partial`, exactly one remainder,
   remainder ends at Rahu start.
4. A window untouched by any belt → `clean`, `usable` equals the window.
5. A 2-minute remainder is discarded (R2); a 4-minute remainder survives.
6. `gradeKey` matches the Choghadiya segment with the largest overlap; the tie
   case resolves earlier (R6).
7. Abhijit overlapping a blocked window leaves `status: "blocked"` (R5).
8. `nextCleanWindow` never returns a window starting before `afterMs`.
9. Every one of the 24 horas on a sample day is adjudicated without throwing.
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
| D6 | Night horas use the real next-day sunrise | Keep `rise + 86400000` | Current approximation drifts several minutes, worst near solstices. A timing product cannot ship a knowingly wrong clock |
| D7 | 3-minute minimum usable remainder | No minimum; or 5 minutes | Below ~3 minutes the advice is unusable in practice; 5 discards genuinely usable slivers |
| D8 | Personal lane from the existing manual ascendant selector | Wait for saved charts | Ships now, and `personalHoraWindows` takes `ascIdx` either way — a saved chart feeds the same function later with no redesign |

## 9. Risks

| Risk | Mitigation |
|---|---|
| `src/screens/MuhuratHub.tsx` is claimed by the unmerged REVIEW branch `codex/jyotish-ux-remaining` | No screen edits until it lands or the owner clears the lane. Engine modules and the new component are outside its file list and can proceed |
| The strip makes an already-long screen longer | Lanes collapse to a single summary row below 360px; the day/night toggle halves what is on screen at once |
| Hard-blocking annoys users who disagree with the rule | The practitioner toggle exists precisely for this, and the reason is always named |
| Adjudication changes what the Muhurat finder shows too | It does not — this release only *reads* muhurat data. Applying verdicts to the Muhurat finder is a separate, later decision |

## 10. Success criteria

1. No screen state exists in which Ganak recommends a window it elsewhere forbids.
2. All 24 horas reachable without typing a search.
3. Every hora answer shows a status and, when blocked, an alternative.
4. `validation/hora-adjudication.cjs` passes and fails under mutation.
5. Three hora events appear in the fixed telemetry dictionary.
6. Zero new colour literals, zero raw px, zero second token file.
