# Codex handoff — user-facing vrat copy cleanup

**Status:** implemented and verified; uncommitted for Claude Code review  
**Date:** 2026-07-19  
**Owner request:** remove developer/research instructions that were being displayed to users, beginning with the Janmashtami Paran text

## Outcome

The Janmashtami guidance no longer displays text such as:

- “Ganak must show three labels”
- “as calculated”
- “Safe app copy”
- “Sources reviewed”
- “do not ship”

The fix was expanded across the entire displayed vrat-guidance dataset because the same research-to-UI leak existed in several observances.

## Root cause

`plans/vrat-vidhis.md` correctly contains research findings **and** implementation instructions. Parts of that document were copied verbatim into `VRAT_VIDHI` in `src/kundli-app.tsx`.

`VratVidhiCard` renders each field directly:

```jsx
{section(lbl("paran"), txt(data.paran))}
```

There was no separation or validation between internal notes and user-facing copy, so phrases addressed to the developer appeared inside the product.

## Files intentionally changed by Codex

### `src/kundli-app.tsx`

- Rewrote the Janmashtami verdict, steps and Paran guidance in direct user language.
- Replaced every similar internal/product instruction found inside `VRAT_VIDHI_SAFETY` and `VRAT_VIDHI`.
- Cleaned affected copy for Ekadashi, Pradosh, Sankashti, Satyanarayan, Amavasya, Masik Shivaratri, Maha Shivaratri, Navratri, Karva Chauth, Ahoi Ashtami, Hartalika Teej, Sheetla Ashtami, Ganesh Chaturthi, Janmashtami and Chhath.
- Preserved the underlying religious distinctions, family-practice qualifications and health warnings.
- Added a source comment stating that the object may contain only user-facing copy; editorial instructions stay in `plans/`.

The new English Janmashtami Paran guidance is:

> When to break the fast depends on your tradition. Smarta observers wait until the required Ashtami (eighth lunar day) and Rohini (Krishna's birth star) conditions are complete. Some families wait until the next morning's worship. In common ISKCON practice, non-grain prasad may be taken after the midnight celebration, while grains remain restricted until the temple or Panchang paran time. Use the same tradition for both the Janmashtami date and paran.

The equivalent Hindi guidance is present and was visually verified.

### `validation/parse-check.js`

Added a regression check limited to the displayed vrat-copy block. The gate now fails if that block contains internal/product phrases including:

- `Ganak`
- `the app` / `app's`
- `Safe app copy`
- `Sources reviewed`
- `do not ship`
- `as calculated`
- `गणक` / `ऐप`

The check immediately found two additional leaks during implementation, proving it is exercising the intended failure mode.

### `plans/codex-handoff-vrat-copy-fix.md`

This handoff document.

## What was not changed

- Festival dates, astronomy, tithi rules and calculation engines
- `plans/vrat-vidhis.md`; it remains the internal research source and may retain implementation notes
- The Janmashtami tradition/date calculator
- The server/backend
- Any Git history; nothing was committed

## Known follow-up gap

This pass removes misleading internal wording; it does **not** create a complete tradition-specific Janmashtami Paran calculator.

The present UI has one Janmashtami event and no Janmashtami-specific Smarta/ISKCON selector inside `VratVidhiCard`. The revised copy therefore explains the valid traditions without pretending an exact time has been calculated.

A later research/build task should:

1. calculate or source the exact local Paran result per supported tradition;
2. connect that result to the selected Janmashtami tradition;
3. show one primary action and exact time for that user;
4. keep other traditions under optional detail rather than presenting a blended answer.

Do not reintroduce “as calculated” until a real calculated date/time is rendered beside it.

## Validation evidence

```text
✓ parse-check clean
  syntax, no duplicates, no orphans, no browser storage,
  no internal vrat notes

✓ Prashna parity EXACT
  198 values across 6 charts · 0 mismatches

✓ Prashna calculation
  24 pass / 0 fail

✓ Muhurat anchors passed
  recall ≥ 80% for all categories

✓ Content dates
  7/7 Tier-2 solar/nakshatra anchors
  17/17 festival day-part anchors
  Ayyappa day counter and boundaries matched

✓ Production build completed
  Vite built successfully
```

The existing Vite warning about a JavaScript chunk larger than 500 kB remains; it is unrelated to this copy fix.

## Browser smoke test

Tested locally at the New Delhi default location:

- Opened **Festivals → Janmashtami → Observance steps**.
- English Paran showed the revised direct guidance.
- Loaded `?lang=hi`, reopened **जन्माष्टमी → व्रत की विधि**, and verified the Hindi Paran.
- Confirmed the old English and Hindi leak phrases were absent.
- Browser console contained no errors.

## Concurrent repository changes — do not mix automatically

The worktree was clean when Codex began. During this task, another active session created or changed these validation-loader files:

- `.claude/settings.json`
- `validation/content-dates.cjs`
- `validation/muhurat-anchors.cjs`
- `validation/_load-app.cjs`

Codex did not create or edit those changes. They appear to be a separate validation-loader refactor for future source-module splitting. Review and commit them separately or coordinate with their owning session.

## Claude Code review checklist

1. Review only the intended Codex diff first:

   ```bash
   git diff -- src/kundli-app.tsx validation/parse-check.js
   ```

2. Confirm the new guard is appropriately scoped to `VRAT_VIDHI_SAFETY` through the end of `VRAT_VIDHI`.
3. Confirm no religious rule was materially changed; the edits should alter voice and clarity only.
4. Keep the concurrent loader changes out of this commit unless separately reviewed.
5. Re-run all five project gates and `npm run build` after resolving concurrent work.
6. Commit only after owner approval.

## Suggested commit message

```text
fix: keep internal notes out of user-facing vrat guidance
```
