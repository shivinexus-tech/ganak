# Claude task — elective surgery / medical Muhurat

**Task ID:** `CLAUDE-P0-MEDICAL-MUHURAT`  
**Priority:** P0 before go-live, owner instruction 2026-07-21  
**Worker:** Claude Code, in an isolated branch/worktree  
**First pass:** research and product specification only. Do not edit engine or UI
until the owner reviews the findings and explicitly approves the method.

## Product boundary

This feature may help a user express a religious or cultural timing preference for
care that a qualified clinician has already judged medically appropriate and safe to
schedule. It is not medical advice and must never compete with clinical urgency,
hospital availability, the treating team's recommendation or pre-operative rules.

The first visible statement, before any astrological result, must say in both Hindi
and English:

- urgent or emergency care must never be delayed for a Muhurat;
- the treating clinician and hospital choose what is medically safe;
- Ganak does not predict surgical success, complications, recovery or survival;
- a user may discuss a preferred time only when the clinical team says timing is
  genuinely flexible.

## Research questions

1. Identify primary/classical and reputable modern sources, if any, for the exact
   electional rules being proposed. Separate textual rules from later custom.
2. Determine whether one defensible general elective-procedure method exists or
   whether dental, diagnostic, fertility, delivery and operative contexts must remain
   separate. Do not invent one universal score.
3. Document every factor: tithi, vara, nakshatra, yoga, karana, lagna, Moon, malefic
   periods, Panchaka and any natal-chart dependency. State conflicts and regional or
   lineage differences.
4. Produce worked examples and independent published anchors where available.
5. Define what Ganak must refuse: emergencies, urgent symptoms, clinician-directed
   immediate procedures, medication timing, fasting instructions, diagnosis,
   anaesthesia advice, treatment selection and outcome prediction.
6. Propose answer-before-data English/Hindi copy, failure states and a route that
   cannot be mistaken for medical clearance.

## Required owner checkpoint

Deliver a short findings document containing:

- sourced rule table and confidence for every rule;
- proposed inputs and whether birth details are truly necessary;
- sample safe output and refusal output in Hindi and English;
- unresolved method choices;
- validation-anchor plan;
- explicit recommendation to build, narrow further, or reject the feature if the
  evidence is too weak.

Stop there for owner review. No implementation is authorized by this brief alone.

## Implementation constraints after approval

- Use a dedicated engine/module and route; do not weaken existing Muhurat gates.
- No medical-outcome score, “safe surgery” badge, guarantee or fear-based language.
- No notification that tells a user to postpone clinician-recommended care.
- Visible UI errors; no browser storage; URL preferences only where appropriate.
- Phone-first, bilingual, accessible and answer-before-data.
- Add independent regression anchors and run every canonical validation gate, build
  and browser/phone smoke test before handoff.
