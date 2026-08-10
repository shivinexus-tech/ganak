# Screen snapshot verification — design

**Date:** 2026-08-10
**Status:** Draft for owner approval
**Backlog:** #62 (new) · tag `VERIFY-SNAPSHOTS`
**Prior art:** none — see *Investigation* below

---

## Investigation: was this proposed before?

Asked before designing, because the expensive failure in this repo has been rebuilding
something that already existed. Searched `plans/`, `docs/`, the Sheet sync and the full
git history on 2026-08-10.

**No snapshot, golden-file or visual-regression system was ever proposed.** What the
search did find, and what it changes:

| Finding | Evidence | Consequence for this design |
|---|---|---|
| `playwright` appeared once as an **accidental, unused package entry** and was deliberately removed | `plans/cursor-open-reassignment-audit.md:43`, commit `9150a58` (2026-07-28) | Not a rejected proposal — it was never a proposal. But it does mean a browser-driver dependency was consciously taken *out*, so re-adding one needs a reason. This design needs none. |
| Smoke suites **exist and are alive** — but they cover the API proxy, not the UI | `server/smoke.js`, `server/api-smoke.mjs`, `scripts/dev-api-production-smoke.mjs`; scripts `smoke`, `smoke:api`, `smoke:production` in `server/package.json` | Nothing to reuse for screens, but it confirms the house style: plain node scripts, no framework. |
| A **deliberate decision against golden files** for astronomy | `validation/prashna-practitioner.cjs` header: proves derivations against the chart they come from, *"not against a golden file, so it stays true as the sky moves"* | **The binding constraint.** A snapshot that bakes in today's sky rots within a day. This design pins the clock instead of pinning sky values. |
| The verification standard that exists is entirely human | `TEST-STD-CALCULATORS` (`plans/backlog.md:232`) — 4–5 iterative test→fix rounds; plus the two-agent 30-minute bug-bash rule | This spec does **not** replace either. It removes the mechanical half so human rounds are spent on judgement. |

## Problem Statement

Ganak has 85 validation gates. They prove the **maths** and the **structure**. Nothing
proves **what a human sees on a screen**.

Every language defect this month escaped every gate and was caught only by a person
looking: the Devanagari leak on the English gochar line; `SecHead` pinned to `lang="hi"`
so three headings stayed Hindi in English mode; `NAKSHATRAS[...]` rendered raw in four
places so Hindi mode showed `Shatabhisha`. That last one survived a 16-table migration
*and* its own purpose-built gate, because those four sites never consulted a table at
all — there was nothing for a table-scanning gate to find.

The owner cannot personally open every screen in two languages after every change, and
there are no practising astrologers using the app yet. So today the honest status of
most screens is *"the gates pass and nobody has looked"* — which is how Dashakoota and
the dosha pages currently stand.

## The user and their journey

**Primary persona: P5 · Working astrologer.** Secondary: **P4 · Serious Jyotish
learner**. The immediate reader of the artifact is the owner, but the people who pay
for an undetected regression are P5 and P4.

The journey, walked against the repo as it stands today:

1. An agent changes something shared — a name table, a header primitive, a token.
   **Works today.**
2. The gates run. 85 of them pass. **Works today, and is the trap** — passing gates are
   read as "nothing broke", which they do not mean.
3. Someone decides which screens to open by hand. **BROKEN** — there is no list of what
   this change could have touched. Evidence: `SectionHeader` is used by six screens;
   nothing said so at review time.
4. They open two or three screens, in one language. **BROKEN** — the leak that shipped
   was on the screens nobody picked, in the language nobody switched to.
5. The change ships. **BROKEN** — `main` has twice carried a defect that a two-minute
   look would have caught, and once carried a red gate.
6. Weeks later a practitioner notices, or nobody does. **The failure mode is silence.**

## What already exists (reuse before building)

This design adds **no dependency**. Everything it needs is in the repo:

- **`validation/_load-app.cjs`** already bundles `.tsx` with its imports into CommonJS
  via esbuild and returns real exports. Every gate uses it. It can load a screen.
- **`react` and `react-dom` are already runtime dependencies**, so
  `react-dom/server`'s `renderToStaticMarkup` is available with nothing installed.
- **`validation/route-reachability.cjs`** already enumerates the app's routes — the
  route inventory this needs exists.
- **The gate harness convention** — plain `.cjs`, `node validation/x.cjs`, exit non-zero
  on failure — is established 85 times over.
- **`validation/language-leak-scan.cjs`** already owns the *source-level* half of this
  problem (no duplicate tables). This covers the *rendered* half it cannot see.

## Goals

1. A change's effect on every screen, in both languages, is visible as a **text diff**
   before it merges.
2. Reviewing that diff takes minutes and does not require opening the app.
3. The baseline is **deterministic** — re-running it unchanged produces a byte-identical
   result tomorrow, next month, and in a different timezone.
4. The system states plainly what it does **not** cover, so a green run is never
   mistaken for "someone looked at the layout".
5. Zero new dependencies; runs in the existing gate harness and the Tier A CI cron.

## Non-Goals

- **Replacing the human bug bash or `TEST-STD-CALCULATORS`.** Those catch judgement and
  interaction defects this cannot see. This makes their time count for more.
- **Layout, overflow, contrast or visual regression.** `renderToStaticMarkup` produces
  no layout box. Overflow at 375px stays a browser job. Claiming otherwise would be the
  exact "gates pass = verified" error this spec exists to fix.
- **Judging whether the astrology is correct.** Only practitioners can answer that. This
  proves output did not *change* unintentionally, never that it is *right*.
- **Screenshot/pixel diffing.** Higher cost, noisier, and needs a browser dependency
  that was deliberately removed.
- **Testing the API proxy.** Already covered by the existing smoke suites.

## Architecture

Two tiers, because screens fail in two different ways.

```
                    pinned clock + fixed inputs
                              │
          ┌───────────────────┴───────────────────┐
          ▼                                       ▼
  TIER A — route render                  TIER B — result render
  loadApp(screen.tsx)                    loadApp(engine.ts) + display helpers
  renderToStaticMarkup(<Screen lang/>)   compute with pinned birth data
          │                                       │
     strip tags → visible text              format via the REAL helpers
          │                                       │
          └───────────────────┬───────────────────┘
                              ▼
             validation/snapshots/<route>.<lang>.txt   (committed)
                              │
                              ▼
        validation/screen-snapshots.cjs  →  diff vs committed baseline
                              │
                   ┌──────────┴──────────┐
                   ▼                     ▼
            identical → pass      differs → FAIL, print the diff
                                  (human reads the diff, not the app)
```

**Tier A — route snapshots.** For each route in the inventory, render the screen's
initial state in `en` and `hi`, strip markup, normalise whitespace, write text. Catches
static copy, headings, labels, empty states, and anything derived from props via
`useMemo` — which includes the Daily transit card, where the original leak lived.

**Tier B — result snapshots.** For interactive surfaces (chart, matching, the twelve
calculators, Prashna, Muhurat), `renderToStaticMarkup` shows only the empty form,
because it runs no effects and no event handlers. So Tier B skips the component and
composes **the real engine with the real display helpers** at fixed inputs — the exact
technique that caught the `Shatabhisha` leak by hand. Output is a text block per
surface per language.

**Determinism.** The harness pins `Date.now()` to a fixed instant, uses one fixed place
(Mumbai), one fixed birth moment, and `lahiri`, before loading any module. This
satisfies the project's standing rule against golden files: nothing sky-derived is
frozen to *real* time — the clock is a declared input, so the sky is reproducible.

## Requirements

### P0 — Must have

**S1. Deterministic harness.** A shared `validation/_snapshot-env.cjs` that freezes the
clock and exposes the fixed inputs, required before any screen or engine module loads.

*Acceptance:* running the generator twice, an hour apart, in two timezones, produces
byte-identical files. Asserted by generating twice in-process under different `TZ`.

**S2. Tier A route snapshots**, `en` and `hi`, one file per route+language, committed
under `validation/snapshots/`.

*Acceptance:*
- Every route in `route-reachability`'s inventory has both files, or is on an explicit,
  commented skip list. A silently missing route is a failure.
- A file contains visible text only — no tags, no class names, no inline styles.

**S3. Tier B result snapshots** for the interactive surfaces, both languages.

*Acceptance:* the chart snapshot contains the Lagna, Moon sign, Sun sign, Janma
Nakshatra and the planet table — the surfaces where this month's leaks actually were.

**S4. Gate `validation/screen-snapshots.cjs`.** Regenerates in memory, compares to the
committed baseline, and on mismatch prints a unified diff naming file and line.

*Acceptance:*
- Written first and **proven to bite**: reverting the `NAKSHATRAS[...]` fix must turn it
  red with `Shatabhisha` visible in the diff.
- A no-op change leaves it green.
- `--update` (or an explicit env flag) rewrites baselines; it must never update silently
  as a side effect of a normal run.

**S5. Honest scope statement** in the gate's own success line and in `AGENTS.md`: this
proves text, not layout. A green run does not mean a human looked.

### P1 — Should have

**S6. Language-purity assertions over the snapshots** — the English baseline contains no
Devanagari outside an explicit allow-list; the Hindi baseline contains no Latin
rashi/nakshatra/graha names. This is `language-leak-scan` applied to *rendered* output
rather than source, and closes the exact hole the four raw `NAKSHATRAS[...]` sites fell
through.

**S7. Tier A CI cron** runs the gate daily, so drift from a dependency or data change
surfaces without a code change.

### P2 — Future

**S8. A verification ledger** — route × language × last human look × who. The snapshots
say what *changed*; the ledger says what has never been *seen*. Cheap once the route
inventory is being walked anyway.

**S9. Screenshot diffing** for layout, only if overflow regressions prove frequent
enough to justify a browser dependency. Explicitly deferred.

## Success Metrics

**In user steps** — measured on the six-step journey above:

| Journey step | Today | Target |
|---|---|---|
| Steps where a regression can pass unseen | 4 of 6 | **1 of 6** (layout only) |
| Screens a human must open to review a shared change | ~40, so in practice 2–3 | **0 — read the diff** |
| Languages actually checked per change | 1 | **2, always** |
| Time to know what a token change did everywhere | unbounded | **one gate run** |

**Leading (at merge):**
- Routes with a committed baseline in both languages: **0 → 100%** of the inventory.
- Re-run determinism: **byte-identical**, asserted.
- Gate proven red on a reverted real bug: **required before merge**.

**Lagging (60–90 days):**
- Language/copy defects found by a human that the snapshots did not surface first:
  target **0**.
- Defects reaching `main`: this month **3** (gochar leak, `SecHead`, `NAKSHATRAS`) →
  target **0**.

## Open Questions

- **(owner)** Should the gate block a push, or warn? A snapshot diff is *expected* on
  any intentional copy change, so blocking means updating baselines in the same commit —
  which is good discipline but adds a step. *Non-blocking — I will ship it blocking with
  a documented `--update` flow, matching how every other gate here behaves.*
- **(owner)** Fixed birth data for Tier B: Mumbai 1990-06-15 08:30 is already the de
  facto fixture across this repo's evidence. Confirm, or nominate a chart you know well
  enough to eyeball. *Non-blocking — using the existing fixture.*
- **(engineering)** Screens requiring `useEffect` to populate will snapshot as their
  empty state in Tier A. That is correct and useful (empty states leak language too),
  but the skip list must say which screens those are so the coverage claim stays honest.

## Timeline Considerations

No external deadline. One dependency worth stating: this is **most valuable before** the
next large sweep, not after. Phase 1 of E-1.0 touched 16 tables across 12 files; a
baseline captured beforehand would have made that change reviewable in one diff instead
of by hand-testing calculators one at a time.

Suggested order: **S1 → S2 → S4 (red on the real bug) → S3 → S6**. S2 plus S4 is already
useful on its own; S3 can follow without rework.
