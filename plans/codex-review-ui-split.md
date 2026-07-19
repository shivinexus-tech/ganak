# Review brief — SPLIT-UI-01 Prashna pure UI extraction

Date: 2026-07-19

Status: **ready for review; not committed**

Reviewer: Claude Code / integration owner

## Decision requested

Please confirm that this is a behaviour-preserving extraction and is safe to accept
as the first UI module in Ganak's parallel-agent architecture.

The intended result is simple: the Prashna screen now has its own source file, so a
Prashna agent can work independently without editing the large app shell. No text,
styling, state transition, calculation rule, astronomy convention or user-visible
behaviour was intentionally changed.

## What changed

### New UI module

- `src/screens/PrashnaScreen.tsx`
  - Contains the complete existing Prashna screen and `PrashnaChip` component.
  - Contains the complete validated Prashna calculation block.
  - Preserves both byte-exact engine markers used by the parity validator.
  - Imports only the shared design tokens, degree formatter and Hindi nakshatra
    names that the same code used before extraction.

### New shared modules

- `src/components/tokens.ts`
  - Exact move of the existing `T` design-token object.
- `src/components/format.ts`
  - Exact move of the existing `fmtDeg` helper.

These two very small moves prevent the extracted screen from importing private
details from the app shell. They introduce no new values or formatting rules.

### App shell

- `src/kundli-app.tsx`
  - Imports `T`, `fmtDeg` and `PrashnaScreen` from their new modules.
  - Removes the original duplicate definitions and in-file Prashna block.
  - Continues to pass the same `lat`, `lon`, `placeLabel` and `lang` props to
    `PrashnaScreen`.

The app shell is now 4,890 lines. The extracted Prashna screen is 487 lines.

### Validation and coordination

- `validation/prashna-parity.js`
  - Its documented target is now `src/screens/PrashnaScreen.tsx`.
  - Validation logic and tolerances were not changed.
- `AGENTS.md` and `.cursorrules`
  - Replace the obsolete whole-app single-writer rule with one writer per file or
    module, using separate branches/worktrees.
  - Point the required Prashna parity command at the extracted screen.
- `plans/backlog.md`
  - Adds the P0 parallel-agent/UI-split epic and ten target lanes.
- `plans/task-log.md`
  - Adds durable ownership, evidence and handoff tracking.
- `plans/parallel-agent-brief.md`
  - Marks the old single-file instructions as historical.

## Important dependency

This UI extraction sits on top of the still-uncommitted astronomy engine split in
`src/engine/`. Review or integrate `SPLIT-ENGINE-01` first, then this UI slice. Do
not review `src/kundli-app.tsx` as though the engine files do not exist: its current
diff contains both tasks.

The separate engine handoff is `plans/codex-handoff-engine-split.md`.

## Reviewer checklist

- [ ] Confirm `src/kundli-app.tsx` has one `PrashnaScreen` import and one render.
- [ ] Confirm the old in-file Prashna component and token/formatter definitions
      have no orphaned copies.
- [ ] Confirm the extracted screen receives the same four props as before.
- [ ] Confirm the validated engine markers remain present in
      `src/screens/PrashnaScreen.tsx`.
- [ ] Confirm `validation/prashna-parity.js` changed only its target documentation,
      not its comparison logic or tolerances.
- [ ] Confirm Hindi/English switching, question-chip selection and “Ask now” still
      behave as before.
- [ ] Confirm the architecture-rule changes match the owner's approved goal:
      separate module ownership, separate branches/worktrees, one integrator.
- [ ] Keep unrelated worktree changes out of this review/commit.

## Validation evidence

Final automated results:

```text
✓ parse-check clean: src/kundli-app.tsx
✓ parse-check clean: src/screens/PrashnaScreen.tsx
✓ parse-check clean: src/components/tokens.ts
✓ parse-check clean: src/components/format.ts
✓ parse-check clean: all four src/engine modules
✓ parity EXACT: 198 values across 6 charts | worst numeric diff 5.68e-14°
ALL TESTS PASSED  (24 pass / 0 fail)
✓ muhurat-anchors PASSED (recall ≥ 80% on all categories)
✓ 7/7 Tier-2 solar/nakshatra anchors match
✓ 17/17 festival day-part anchors match
✓ Ayyappa day counter and boundary checks match
✓ 35 modules transformed
✓ production build passed
```

The existing Vite warning about a JavaScript chunk over 500 kB remains a warning,
not a build failure and was not introduced as a functional regression.

## Proof the parity alarm still works

After moving the validated engine with the screen, `PR_DELTA_T` was temporarily
changed from `72` to `73`. The parity gate failed as required:

```text
✗ parity FAILED: 198 values across 6 charts | worst numeric diff 1.74e-4°
exit 1
```

The value was restored immediately to `72`, after which the gate returned to exact
parity. The temporary mutation is not present in the final source.

## Browser evidence

The Ganak Daily screen rendered normally after extraction. The Prashna tab opened,
showed the expected heading and “Ask now” control, and selecting “Marriage /
relationship” enabled the action. Browser error log: zero errors.

## Suggested review commands

```bash
node validation/parse-check.js src/kundli-app.tsx
node validation/parse-check.js src/screens/PrashnaScreen.tsx
node validation/prashna-parity.js src/screens/PrashnaScreen.tsx
node validation/prashna-calc.js
node validation/muhurat-anchors.cjs
node validation/content-dates.cjs
npm run build
```

## Worktree warning

No commit was made. The worktree also contains changes from Claude Code or other
sessions, including `.claude/settings.json`, `.gitignore` and `CLAUDE.md`. Those are
not part of SPLIT-UI-01 and must not be reverted or accidentally included solely
because they appear in `git status`.

## Acceptance outcome

If accepted, mark `SPLIT-ENGINE-01` and `SPLIT-UI-01` as integrated in
`plans/task-log.md`, commit them in dependency order, and reserve the next extraction
before editing. The recommended next slice is shared place search/display
primitives, followed by the Daily/Panchang screen shell.
