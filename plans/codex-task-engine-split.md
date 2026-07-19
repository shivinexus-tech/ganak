# Codex task — EPIC-SPLIT: extract the astronomy engine to `src/engine/`

Read `.cursorrules` and `AGENTS.md` first. **This is the highest-risk task in the
project.** Read the whole brief before writing code.

## Coordination
- **You are the SOLE writer on `src/` for this task.** Claude is off `src/`
  entirely; Cursor is on research docs only. Nobody else will touch it.
- **Do NOT commit.** Leave changes for Claude to review + gate + commit.
- If you must stop midway, stop at a point where **all gates are green**.

## Context — what's already done
EPIC-SPLIT has begun. Already extracted (follow the same pattern):
- `src/data/vrat-vidhis.ts` — vidhi content
- `src/data/festival-meta.ts` — CHOG_NAME, OBS_NAME, FEST_NAME, OBS_META, FEST_META

`src/kundli-app.tsx` is now ~6,589 lines. Your job is the astronomy engine.

## The task
Extract the ephemeris/panchang/muhurat/prashna math into `src/engine/` modules —
suggested split (adjust if the dependency graph disagrees):
- `src/engine/ephemeris.ts` — VSOP87/Meeus sun & moon, nutation, obliquity, ayanamsa,
  julian-day helpers, `sunSidMs`/`moonSidMs`/`planetSidMs`, `sunEvents`, `solveCross`
- `src/engine/panchang.ts` — tithi/nakshatra/yoga/karana, `lunarMonthInfo`,
  `amantaMonthIdx`, `pitruPakshaDay`, choghadiya, hora
- `src/engine/festivals.ts` — `FESTIVALS`, `EKADASHI_NAMES`, `PRADOSH_NAMES_BY_DAY`,
  `observancesFor`, `scanPanchangCalendar`, day-part/kala logic, solar-nakshatra
  festival engine, `ayyappaMandalaFor`
- `src/engine/muhurat.ts` — `MUHURTA_RULES`, `muhuratForDate`, `muhuratShuddhi`,
  `muhuratScanRange`, `dayScore`
- Prashna/KP engine may stay put or become `src/engine/prashna.ts` — **but see the
  parity-marker warning below.**

**This is a PURE MOVE. Do not "improve" any math, rename anything, or change any
behaviour.** Every number must come out byte-identical. Refactoring and moving at
the same time is how silent astronomy bugs get shipped.

## ⚠️ The failure mode that actually bit us today — read this
A refactor can leave a validation gate **passing while it tests nothing.**

Real example from this project, hours ago: `parse-check.js` located its vrat-copy
guard by requiring two sentinels that lived in the same file. A split moved them
into different files — the guard then silently skipped and still printed
"✓ clean". It hid two real content bugs until the scoping was repaired.

**So: after every extraction, do not accept a green tick as proof.** For each gate,
confirm it still *fires* — temporarily inject a violation, watch it FAIL, revert it.
A gate that cannot fail is worse than no gate.

### Specific harness dependencies you must not break
1. **`validation/prashna-parity.js` locates the Prashna engine by two byte-exact
   marker comments** (`// ===== ENGINE (validated) =====` … `// ===== END ENGINE =====`)
   and slices the source between them. If you move that engine: keep both markers
   **byte-for-byte** and point the gate at the new file (it takes a path argument).
   This gate is the ONLY thing proving the astronomy didn't drift — treat it as sacred.
2. **`validation/_load-app.cjs`** bundles the entry with esbuild, so imports resolve
   automatically. But the gates read named exports from the entry — the export block
   at the bottom of `kundli-app.tsx` must keep exporting: `scanPanchangCalendar`,
   `FEST_NAME`, `ayyappaMandalaFor`, `muhuratScanRange`, `muhuratForDate`,
   `muhuratShuddhi`, `MUHURTA_RULES`. Re-export them from the app entry after moving.
3. **`parse-check.js` takes one file** — run it on **every** new module you create,
   not just the app file.

## Required method — small slices
Do NOT move everything then test. For **each** module:
1. Move one cohesive group.
2. Run all five gates + `npm run build`.
3. Prove at least the parity gate still fires (break something trivially, see it
   fail, revert).
4. Only then move the next group.

If parity ever reports anything other than **EXACT / 0 mismatches**, STOP and
report the numeric difference. Do not work around it.

## Gates
```
export PATH="/opt/homebrew/bin:$PATH"
node validation/parse-check.js src/kundli-app.tsx      # and EVERY new module
node validation/prashna-parity.js src/kundli-app.tsx   # or the new engine path
node validation/prashna-calc.js
node validation/muhurat-anchors.cjs
node validation/content-dates.cjs
npm run build
```

## Definition of done
Engine in `src/engine/` modules; app file materially smaller; **parity EXACT with 0
mismatches**; 24/24; muhurat anchors pass; 17/17 day-part + 7/7 solar + Ayyappa;
parse-check clean on every file; production build passes; you have *demonstrated*
(not assumed) that the parity gate still fires; nothing committed.

Write a handoff at `plans/codex-handoff-engine-split.md` listing every file created,
what moved where, the gate output, and your proof that the gates still fire.
