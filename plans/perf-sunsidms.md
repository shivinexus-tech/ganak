# Perf — sunSidMs / sunGeo VSOP evaluation (#57)

**Branch:** `perf/sunsidms-investigation` · **2026-07-24**
**Change:** `src/engine/ephemeris.ts` `sunGeo` — flat-array VSOP87 evaluation.
**Output change:** none. Bit-identical (parity gate stays EXACT).

## Why sunSidMs

`sunSidMs(ms)` is the most-used astronomical term in the app: festival and muhurat
scans call it (and `elongMs`, which contains it) thousands of times, and it drives
the ~1 s startup festival calendar. Measured baseline: **8.95 µs/call — 3× slower
than `moonSidMs`**. The cost is `sunGeo`, which evaluates six VSOP87 Earth series
(163 terms total) per call.

The slow part was the evaluation *pattern*, not the maths: `sunGeo` summed each
table with `tab.reduce((s,[a,b,c]) => s + a*Math.cos(b+c*tau), 0)` — a closure plus
per-term array destructuring over an array-of-arrays, 163 times per call.

## The change

The readable `[a,b,c]` source tables stay exactly as they were. At module load they
are flattened once into three `Float64Array`s each (coefficient, phase, frequency),
and `sunGeo` sums them with a tight indexed loop. Same terms, **same summation
order**, so the floating-point result is identical to the last bit.

## Measured (Delhi workload, this machine)

| | before | after | |
|---|---:|---:|---|
| `sunSidMs` | 8.95 µs | **2.20 µs** | **4.1× faster** |
| `elongMs` (moon−sun) | 11.73 µs | 5.38 µs | 2.2× faster |
| `scanPanchangCalendar` 400 days | 1038 ms | **447 ms** | **57% faster** |

`moonSidMs` unchanged (moon path untouched; run-to-run wobble is measurement noise).

## Correctness

- Flat vs original evaluation: **0 difference** across 600,000 evaluations.
- `prashna-parity` **EXACT** (198 values / 6 charts) — proves output unchanged vs the
  frozen baseline.
- `prashna-calc` 24/24, `muhurat-anchors`, `content-dates`, `sankranti-punya`,
  `vedic-season-clock`, `calendar-convention-invariance` all pass; production build
  passes.
- `validation/parse-check.js` gained `Float64Array` (and the other standard typed
  arrays) to its globals whitelist — the sanctioned parse-check exception for a
  genuine JS global.

## Scope note

Only the hot `sunGeo` path was changed. The planet path (`vsopSer`/`helioBody`) runs
far less often (once per body per chart, not in the scan loop) and already uses a
for-of loop; it was left untouched to keep the change tight and low-risk.

## Bug bash — 2026-07-24

**Self-review** (I am the author; a truly independent pass by another agent is still
the gold standard). For a pure numeric rewrite the decisive checks are objective and
cannot be fudged, which is what this round leans on.

1. **Exhaustive differential vs the pre-change baseline** — materialised `main`'s
   `sunGeo` and compared `sunPos(d)` new-vs-old over **2,448,039 evaluations** with
   `Object.is` (catches NaN and ±0), spanning the normal range at 6h steps, **~3000 BCE**,
   **~4700 CE**, sub-second fractions around the epoch, and the pathological set
   `{0, -0, NaN, +Inf, -Inf, 1e15, MAX_SAFE_INTEGER, MIN_VALUE}`. **0 mismatches** —
   bit-identical everywhere, well past the original 600k sample. Since `sunGeo` is the
   only changed code, bit-identical `sunPos` means every downstream value is unchanged
   by construction.
2. **Staleness hunt (the bug this class is prone to)** — the flat arrays are built once
   at module load from immutable constant tables and are ayanamsa-independent, so there
   is no per-call cache to go stale. Proven, not assumed: `setAyanMode` lahiri↔kp shifts
   `sunSidMs` by exactly 0.096667° (5′48″), lahiri round-trips `Object.is`-exact, kp
   repeats stable, moon path unaffected.
3. **Full gate suite + build** green on the branch (parity EXACT, calc 24/24, muhurat,
   content-dates, sankranti-punya, vedic-season-clock, build).
4. **Perf reproduces** — `sunPos` 8.60→1.86 µs (**4.6×**); flat-array build is part of a
   one-time module load, negligible.

**Not done, and why:** no browser smoke. The change is engine-only with a proof of
bit-identical output and no new import/component/hook, so the runtime-only bug class
(e.g. the bare-hook crash) cannot apply here — a page load would only re-confirm what
the differential and every gate already prove. `Float64Array` is universally supported
and whitelisted in parse-check. Happy to run one if desired.

**Result: no defects found.** The change is safe to merge.
