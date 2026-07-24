# Answer-first Kundli life interpretation — design

**Status:** design approved — ready for implementation plan
**Author:** Claude, 2026-07-23
**Branch:** `claude/kundli-life-interpretation` (off `main` @ `a3d1100`)
**Backlog:** Phase 2 chart reveal; the deferred "Classic life-areas" mode is logged in `plans/backlog.md`.

---

## 1. Goal

Give the birth chart an **answer-first** summary: a plain-language reading at the
*top* of the Chart screen, before any technical detail — matching the app's
standing "answer-before-data" principle (AGENTS.md). A householder or diaspora
user should learn something true and warm about themselves in seconds, without
reading a chart.

## 2. Scope

**In (v1, free):**
- One summary card, rendered first in the Chart view.
- **Six life areas**, each 3–4 lines: Nature & temperament · Mind & emotions ·
  Strengths & talents · How you relate to others · Work leanings · How others see
  you.
- Bilingual (en/hi), following the app-wide language toggle.
- Content sourced to classical texts and written as attribution, not verdict.

**Out (v1):**
- Expandable "tap for a fuller paragraph" depth — **deferred to backlog** (owner,
  2026-07-23). The card shows the 3–4 lines inline, nothing to expand.
- "Classic life-areas" (career/wealth/marriage/health/fortune) — **deferred to
  backlog**; needs house-lord / D-9 engine logic and an owner risk decision.
- Conversational / AI narrative reading — reserved for the paid tier (Phase 4).
- Any engine change. The reading uses only values the engine already computes.

## 3. What drives the reading

The engine already produces, per chart (`ChartScreen` `r` object):
`r.moon.nak` (0–26 Janma Nakshatra), `r.moon.sign` (0–11 Moon sign / Janma Rashi),
`r.moon.pada`, `r.ascSign` (0–11 Lagna sign). No new astronomy is needed.

| Card area | Driven by | Table |
|---|---|---|
| Nature & temperament | Janma Nakshatra (27) | `NAKSHATRA_TRAITS[nak].nature` |
| Strengths & talents | Janma Nakshatra (27) | `NAKSHATRA_TRAITS[nak].strengths` |
| Mind & emotions | Moon sign (12) | `SIGN_TRAITS[moon.sign].mind` |
| How you relate | Moon sign (12) | `SIGN_TRAITS[moon.sign].relating` |
| Work leanings | Moon sign (12) | `SIGN_TRAITS[moon.sign].work` |
| How others see you | Lagna sign (12) | `SIGN_TRAITS[ascSign].outward` |

These six are exactly what classical texts describe per nakshatra/sign/lagna, which
is why the reading can be honest. Career *timing*, wealth *amounts*, marriage
*prediction* and health are **not** derivable from these points alone and are
deliberately absent.

**Moon vs Lagna are distinct content.** `SIGN_TRAITS` is one 12-entry table keyed
by sign index, but a sign as the **Moon** (inner: mind/relating/work) and the same
sign as the **Lagna** (outer: how one is met and perceived) get *different* copy —
`outward` is authored separately and read at `ascSign`, while `mind`/`relating`/
`work` are read at `moon.sign`. So Aries-rising and Aries-Moon never show the same
line. This restores the Lagna "outer temperament" dimension the old reading
carried (`SIGN_NOTE[r.ascSign]`), now written properly.

## 4. Content model

New data module **`src/data/life-interpretation.ts`**:

```ts
type Bilingual = { en: string; hi: string };
type Sourced<T> = T & { source: string; status: "sourced" | "owner-verified" };

// 27 entries, indexed by Janma Nakshatra
NAKSHATRA_TRAITS: Sourced<{ nature: Bilingual; strengths: Bilingual }>[]
// 12 entries, indexed by sign; mind/relating/work read at moon.sign, outward at ascSign
SIGN_TRAITS: Sourced<{ mind: Bilingual; relating: Bilingual; work: Bilingual; outward: Bilingual }>[]

buildLifeReading({ nak, moonSign, ascSign }): { areaKey; label: Bilingual; text: Bilingual; source; status }[]
```

- **Voice (B):** every string is attribution — "Classical texts associate
  Rohini with charm and an eye for beauty", never "You are charming."
- **Sourcing (A):** `source` cites a classical text. Corpus (owner-confirmed
  2026-07-23): *Brihat Parashara Hora Shastra* and *Phaladeepika*; where they
  diverge, the entry says so or stays at the shared level.
- **Status (D):** every entry starts `"sourced"`; owner review flips high-risk
  ones to `"owner-verified"`. The field is internal (not shown to users) and lets
  us track review progress in the data itself.

**Volume:** 27×2 + 12×4 = **102 fields** × 2 languages = 204 strings, 39 citations.

**Owner review burden (C):** only the higher-risk fields need human eyes — the
sign-level `relating`, `work` and `outward` fields: **12 signs × 3 fields**. That
is a single sitting, not all 204 strings. `outward` is in the review set because
appearance/manner copy can stray into looks-based judgement (see the safety
register, §7.2). The 27 nakshatra `nature`/`strengths` and 12 sign `mind` fields
ride on sourcing + the safety gate. Hindi is authored **Hindi-first for the
high-risk fields**: when a line resists natural Hindi it is usually an
English-astrology framing, not a Hindu one — free cultural signal.

## 5. UI

New presentational component **`src/components/LifeInterpretationCard.tsx`**:
- Props: `{ reading, lang, C }` — `reading` is `buildLifeReading(...)` output. No
  chart logic in the component.
- Renders the app's summary-card pattern: bilingual section head (`फलादेश` /
  "YOUR READING"), then six labelled areas, each 3–4 lines.
- Closes with the existing humility note ("Offered in the spirit of the
  tradition… not a substitute for a qualified jyotishi's reading").
- Design tokens/colours from the shared system; theme- and language-aware.

## 6. Integration & no-orphans

In **`src/screens/ChartScreen.tsx`** (birth-chart page; no shell edit needed):
1. Render `<LifeInterpretationCard>` as the **first** section of the chart view.
2. **Remove** the now-superseded bottom "A short reading" section
   (`ChartScreen.tsx` ~883–898), the `#reading` nav-chip entry (~184), and the
   `NAK_NOTE` (line 22) and `SIGN_NOTE` (line 24) tables it used.
3. Grep `NAK_NOTE`, `SIGN_NOTE`, `#reading`, "A short reading" → **zero**
   orphaned references (project no-orphans rule; parse-check enforces).

The richer bilingual/sourced `NAKSHATRA_TRAITS.nature` supersedes the English-only
`NAK_NOTE`; `SIGN_TRAITS.outward` supersedes `SIGN_NOTE`'s Lagna usage (the old
reading only ever read `SIGN_NOTE` at `ascSign`).

## 7. Validation

New gate **`validation/life-interpretation-copy.cjs`** — two checks:

1. **Completeness (the "nothing missing" gate):** loads the data module; asserts
   all 27 nakshatra and 12 sign entries exist, every required field is present and
   non-empty in **both** languages, and every entry has a non-empty `source`.
   Fails the build on any gap. This is what makes "green tests" a real merge gate.
2. **Safety register (the "nothing indefensible" gate):** scans every string
   against banned-register patterns and fails the build on a match —
   - health/medical (disease, diagnosis, body-part affliction),
   - death / lifespan / longevity,
   - guaranteed wealth or financial outcomes,
   - marriage/divorce prediction, fatalistic relationship claims,
   - fear/pressure ("misfortune unless…", "must remedy or…"),
   - looks-based judgement / body-shaming (relevant to the `outward` field —
     no claims about skin, weight, beauty as worth).

   Patterns are maintained in the gate with rationale comments. This catches the
   dangerous *registers* automation can recognise; it cannot judge whether prose
   is *good* — that stays with owner review (C) and the beta cohort/feedback loop.

Plus: parse-check on the new files + `ChartScreen.tsx`; the full existing gate
suite and `npm run build` stay green.

**Browser smoke:** the Chart tab is hidden in production (mode accepts only
`daily`/`prashna`). To visually verify the card renders in both languages, the
route is temporarily re-enabled **locally, uncommitted**, a sample birth chart is
rendered, both languages screenshotted, then the local change reverted. Content
correctness is also checked deterministically via a node harness calling
`buildLifeReading` for representative nak/sign pairs.

## 8. Assurance model (A+B+C+D) — summary

- **A — Sourced:** every entry cites a classical text; the completeness gate
  enforces a citation exists. Owner checks entries against sources, not from memory.
- **B — Attribution:** copy attributes to the tradition; no second-person verdicts.
- **C — Triage + widen:** only the 12×3 high-risk sign fields (relating, work,
  outward) need owner eyes; the beta cohort + existing feedback button are the
  ongoing second reader.
- **D — Labelled + correctable:** internal `status` per entry; content is data, so
  a fix is a one-line edit, not a code change.

## 9. Rollout

- Ships behind the **hidden Chart tab** — nothing is user-visible until the Phase 2
  reveal. So green gates = safe to **merge**, without meaning user-facing.
- The owner reviews the high-risk fields **after merge, before the Phase 2 reveal**
  — the reveal, not this merge, is the go-live gate for this content.
- All content committed as `status: "sourced"`; flips to `"owner-verified"` as the
  owner clears them.

## 10. Owner decisions (all resolved 2026-07-23)

1. **Sources** — *Brihat Parashara Hora Shastra* + *Phaladeepika* (confirmed).
2. **Safety register (§7.2)** — confirmed as listed; all six categories retained,
   **health/medical included**.
3. **Lagna** — kept as the sixth area, "How others see you", driven by `ascSign`.
4. **Engine work** — none. The six areas read only `r.moon.nak`, `r.moon.sign` and
   `r.ascSign`, already computed and displayed by `ChartScreen`. No astronomy
   change, so the parity/calc/anchor gates are unaffected.
