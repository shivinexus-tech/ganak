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
