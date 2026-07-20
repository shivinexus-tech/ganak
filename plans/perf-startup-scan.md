# Startup panchang scan — measured cost and cheap wins

Chip F, 2026-07-19. **Findings only — no behaviour change shipped.** Every number
below was measured, not estimated. Nothing here should be applied without owner OK,
because each option trades correctness surface for speed.

---

## The headline

`MuhuratHub` runs a **400-day panchang scan synchronously inside a `useMemo`**, on
the Daily screen — which is the default screen:

```js
// src/screens/MuhuratHub.tsx:84
const cal = useMemo(() => scanPanchangCalendar(todayP.anchor, tz, 400, 46, place), …);
```

**That scan takes 16.6 seconds in the browser** and blocks the main thread while it
runs. It returns 16 fasts and 46 festivals — the `46` is an item cap, so we scan
400 days to fill a list the Daily screen only ever shows about ten rows of.

This is the "why does it feel slow?" answer.

## Measured — browser (Chrome, dev build, Delhi)

| Scan window | Wall time | ms/day |
|---|---|---|
| 42 days (shell's own scan, `kundli-app.tsx:259`) | 1,999 ms | 47.6 |
| 120 days | 5,886 ms | 49.0 |
| 240 days | 9,593 ms | 40.0 |
| **400 days (MuhuratHub startup)** | **16,550 ms** | 41.4 |
| 366 days (CalendarPage, behind "View the full year") | ~15 s | — |

Cost is roughly linear at **~40–48 ms per scanned day**. There is no cliff to
exploit; the only lever is scanning fewer days, or not scanning on the critical path.

## Measured — primitives (node, per call)

| Function | Cost | Note |
|---|---|---|
| `lunarMonthInfo` | **7.97 ms** | dominant; the answer is identical for ~30 consecutive days |
| `solveCross` | 1.08 ms | iterative root-find, called many times per day |
| `sunSidMs` | 0.478 ms | **7.7× `moonSidMs`** — inverted from expectation, worth a look |
| `sunEvents` | 0.290 ms | computed twice per day (see below) |
| `elongMs` | 0.162 ms | |
| `moonSidMs` | 0.062 ms | |

Also: `computeTodayPanchang` costs **467 ms** per call on its own.

---

## Cheap wins, cheapest first

**1. Don't scan 400 days on first paint.** (biggest win, lowest risk)
The Daily screen's fasts/festivals list shows roughly two months. The full year is
already a separate screen with its own 366-day scan behind an explicit click. Cutting
MuhuratHub's window to ~90 days would take startup from ~16.6 s to ~4 s.
*Risk:* the "COMING UP" strip could miss a distant festival. Needs a look at what the
list actually renders before changing the number — that's why this is a proposal.

**2. Move the scan off the critical path.** (biggest *perceived* win)
Paint the Daily screen first, then run the scan in a `useEffect` and fill the list
when it lands — the skeleton and "पंचांग देखा जा रहा है…" message already exist. Better
still, chunk it with yields (or a Web Worker) so the tab stays responsive; today the
whole page is frozen for the duration, which is why clicks are swallowed.
*Risk:* low, but it is a real UI-behaviour change and needs the loading states checked.

**3. Memoize `lunarMonthInfo`.** At 7.97 ms and constant across ~30 consecutive days,
caching by lunar-month boundary should remove most of its cost from a multi-month scan.
*Risk:* low — pure function of time; needs a correct cache key (adhik months!).

**4. Reuse `sunEvents` between adjacent days.** `festivals.ts:208` computes both today's
and tomorrow's sun events per day, so every day's `evN` is recomputed as the next day's
`ev`. A one-entry rolling cache halves those calls.
*Risk:* low.

**5. Investigate `sunSidMs`.** Being 7.7× the cost of `moonSidMs` is backwards — the
solar position is the simpler calculation. Likely doing more work than it needs
(repeated nutation/ayanamsa evaluation). Worth a read before optimising anything else,
since it is called throughout.

---

## What I would not do

- Don't cache scan results to browser storage — the storage ban is a deliberate
  project rule, and stale panchang data is worse than slow panchang data.
- Don't reduce `solveCross` iteration counts to buy speed. That directly trades
  date accuracy, and this is religious content where being a day off is the one
  failure users will actually notice.

## Suggested order

(2) then (1) — together they take the perceived startup from ~16.6 s of frozen tab to
an immediate paint with a short fill-in. (3), (4) and (5) are real but secondary once
the scan is off the critical path.

---

## Shipped — `CURSOR-MUHURAT-PERF` (2026-07-19)

| Proposal | Status |
|---|---|
| (2) Off critical path | **Shipped** — `useEffect` + `setTimeout(0)`; Fasts & festivals card shows “Checking the panchang…” until fill |
| (1) Shorter window | **Shipped** — **400 → 90 days** (cap still 46; UI still `.slice(0, 10)`) |
| (3) Memoize `lunarMonthInfo` | **Shipped as `CURSOR-LUNAR-CACHE`** — see below |
| (4) Reuse `sunEvents` | **Shipped as `CURSOR-SUNEVENTS-01`** — rolling one-entry cache in `festivals.ts` |
| (5) Investigate `sunSidMs` | Still open |

Expected: first paint immediate; background scan ~90/400 × 16.6 s ≈ **~3.7 s** wall (non-blocking).

**Measured after ship (Node, Delhi, same loader as gates):** 90-day scan **2.8 s**
(17 fasts / 10 festivals); 400-day still **16.4 s** for comparison. UI no longer
blocks on it.

### `CURSOR-LUNAR-CACHE` (2026-07-19)

Chip F named `lunarMonthInfo`, but that function **already** had a lunation-window
cache. The festival calendar calls **`amantaMonthIdx`**, which duplicated the same
new-moon + sankranti work **uncached** (~41 ms/day).

Fix: shared `ensureLmWindow(nowMs)` used by both (cache key = ayanamsa +
`[prevNM, nextNM)` — adhik months included via `sStart === sEnd`).

| Metric | Before | After |
|---|---|---|
| `amantaMonthIdx` × 90 sequential days | ~41 ms/day | **~4 ms/day** |
| `scanPanchangCalendar` 90d | ~4.8 s | **~0.7 s** |
| `scanPanchangCalendar` 400d | ~16 s | **~1.1 s** |

### `CURSOR-SUNEVENTS-01` (2026-07-19)

`scanDayParts` called `sunEvents` for today **and** tomorrow every day. In a
sequential `scanPanchangCalendar` loop, tomorrow’s result is today’s on the next
iteration — so half the rise/set solves were redundant.

Fix: one-entry rolling cache keyed by `(y,m,day,tz,lat,lon)` in `festivals.ts`.

| Metric (Delhi, after lunar cache) | After sunEvents reuse |
|---|---|
| `scanPanchangCalendar` 90d | **~0.43 s** |
| `scanPanchangCalendar` 400d | **~1.7 s** |

(400d wall is noisy vs the prior ~1.1 s note — same order; 90d improved.) Content
anchors 27/27 unchanged — pure reuse, no date-rule change.
