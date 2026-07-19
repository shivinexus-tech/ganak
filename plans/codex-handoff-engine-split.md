# Codex handoff — EPIC-SPLIT astronomy engine extraction

Date: 2026-07-19

Status: **ready for review; not committed**

## Outcome

The astronomy/date-selection code was moved out of `src/kundli-app.tsx` into four
focused modules under `src/engine/`. This was a pure move: no formula, coefficient,
rule, date-selection policy, public validation export, or user-visible behaviour was
intentionally changed.

`src/kundli-app.tsx` is now 5,386 lines, down from 6,589 lines at task start.

At completion of this engine task, the validated Prashna block remained in
`src/kundli-app.tsx`. A later owner-approved UI-split task moved the complete block
and screen to `src/screens/PrashnaScreen.tsx`; both byte-exact markers remain
unchanged and the parity gate now targets that screen file.

## Files created

### `src/engine/ephemeris.ts`

Moved:

- degree/trigonometry helpers
- Delta-T and nutation
- Meeus Moon series and Moon position
- VSOP87 Sun/Earth series and Sun position
- VSOP87 planetary series and apparent geocentric longitude
- tropical longitude aggregation

### `src/engine/panchang.ts`

Moved:

- shared sign, nakshatra, yoga, tithi and karana names
- sunrise/sunset and moonrise/moonset calculations
- Lahiri/KP ayanamsa state and sidereal longitude helpers
- crossing solver, lunar month and samvatsara calculations
- upcoming astronomical events
- choghadiya
- amanta month and Pitru Paksha day calculation
- timezone offset resolution

Minimal module plumbing added:

- `setAyanMode(ayanamsa)` preserves the original single mutable ayanamsa mode after
  the binding moved into this module. All former direct assignments now call this
  setter; the value and calculation order are unchanged.

### `src/engine/festivals.ts`

Moved:

- Tamil/Malayalam solar-nakshatra festival engine
- Vishu and Malayalam Sankranti day assignment
- Ayyappa Mandala 41-day calculation
- Ekadashi and weekday-specific Pradosh variants
- recurring observances and major festival definitions
- day-part/kala interval and tithi-overlap logic
- `scanPanchangCalendar`
- `obsKind` observance classifier

`obsKind` lives here, rather than in muhurat, to keep the dependency direction
one-way and avoid a festivals↔muhurat circular import.

### `src/engine/muhurat.ts`

Moved:

- legacy date-range muhurat helpers
- per-date panchang screening
- bilingual nakshatra names used by scoring
- day scoring
- Vaishnava Ekadashi day/parana helpers
- vrat timing details
- activity-specific shuddhi rules
- `muhuratForDate`, `muhuratShuddhi` and `muhuratScanRange`

## App entry compatibility

The bottom of `src/kundli-app.tsx` still exports every name required by the validation
harnesses:

- `scanPanchangCalendar`
- `FEST_NAME`
- `ayyappaMandalaFor`
- `muhuratScanRange`
- `muhuratForDate`
- `muhuratShuddhi`
- `MUHURTA_RULES`

`validation/_load-app.cjs` continues to bundle the app entry and resolve the new
imports automatically.

## Small-slice validation record

Each extraction was completed and returned to green before the next began.

| Slice | Parse app/module | Prashna parity | Prashna calc | Muhurat anchors | Content dates | Build |
|---|---|---|---|---|---|---|
| Ephemeris | clean | EXACT, 0 mismatches | 24/24 | passed | 7/7 + 17/17 + Ayyappa | passed |
| Panchang | clean | EXACT, 0 mismatches | 24/24 | passed | 7/7 + 17/17 + Ayyappa | passed |
| Festivals | clean | EXACT, 0 mismatches | 24/24 | passed | 7/7 + 17/17 + Ayyappa | passed |
| Muhurat | clean | EXACT, 0 mismatches | 24/24 | passed | 7/7 + 17/17 + Ayyappa | passed |

During the panchang slice, the first structural run correctly found two missing app
imports (`jdOf` and `AYANAMSA`). They were exported/imported, then the complete suite
was rerun green before festival work began. No numerical mismatch occurred.

## Proof that the parity gate still fires

After **each of the four extraction slices**, I temporarily changed the validated
Prashna constant `PR_DELTA_T` from `72` to `73` and ran:

```text
node validation/prashna-parity.js src/kundli-app.tsx
✗ parity FAILED: 198 values across 6 charts | worst numeric diff 1.74e-4° | 0 mismatch(es)
exit 1
```

I then restored `PR_DELTA_T` to `72` immediately and reran the gate:

```text
✓ parity EXACT: 198 values across 6 charts | worst numeric diff 5.68e-14° | 0 mismatch(es)
```

This fail/restore/pass cycle was demonstrated four times. The final source contains
the original value `72`.

## Final gate evidence

```text
✓ parse-check clean: src/kundli-app.tsx
✓ parse-check clean: src/engine/ephemeris.ts
✓ parse-check clean: src/engine/panchang.ts
✓ parse-check clean: src/engine/festivals.ts
✓ parse-check clean: src/engine/muhurat.ts
✓ parity EXACT: 198 values across 6 charts | worst numeric diff 5.68e-14° | 0 mismatch(es)
ALL TESTS PASSED  (24 pass / 0 fail)
✓ muhurat-anchors PASSED (recall ≥ 80% on all categories)
✓ 7/7 Tier-2 solar/nakshatra anchors match
✓ 17/17 festival day-part anchors match
✓ Ayyappa day counter and boundary checks match
✓ 32 modules transformed
✓ built in 763ms
```

The existing Vite warning about a JavaScript chunk over 500 kB remains a warning,
not a build failure.

## Browser smoke test

The local production-equivalent Vite preview loaded the Ganak Daily screen at
`http://127.0.0.1:5173/`. Panchang, fasts/festivals, muhurat finder, hora and upcoming
planetary events rendered. Browser error log: `[]`.

## Review scope and worktree note

Review these files:

- `src/kundli-app.tsx`
- `src/engine/ephemeris.ts`
- `src/engine/panchang.ts`
- `src/engine/festivals.ts`
- `src/engine/muhurat.ts`
- `plans/codex-handoff-engine-split.md`

No commit was made. `.claude/settings.json` also became modified during the task by
another process/session; it is unrelated to this engine split and was not edited or
reverted as part of this work.
