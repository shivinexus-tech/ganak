# Hora Usefulness Overhaul — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Ganak's Hora section the one place every timing system is reconciled — every hora answer carries a verdict against Rahu/Gulika/Yamaganda and Choghadiya, all 24 horas are visible, and the section is measurable.

**Architecture:** Two new pure engine modules (`hora-verdict.ts`, `personal-hora.ts`) hold all judgement and are loadable by the existing `validation/_load-app.cjs` harness. One new presentation component (`TimingLanes.tsx`) renders four timing systems on a shared axis. `MuhuratHub.tsx` only consumes them. No engine that *computes* Choghadiya, Rahu Kaal, Gulika or Yamaganda is modified.

**Tech Stack:** React 18, TypeScript 5.7, Vite 6. No test framework — validation is `node validation/*.cjs` gates via esbuild bundling. No new dependencies.

**Spec:** `docs/superpowers/specs/2026-08-09-hora-usefulness-design.md`

## Global Constraints

- Shell commands must be prefixed with `export PATH="/opt/homebrew/bin:$PATH"` — Node/npm are not on the harness PATH.
- Temp files go in `.scratch/` only. Never `/tmp`. Never outside the repo.
- `src/styles/design-tokens.css` is the ONE token file. Do not create a second.
- Zero raw colour literals and zero raw px in `src/` — `validation/design-system-primitives.cjs` fails the build otherwise. Use tokens and `rem`.
- Auspicious/avoid states must carry **icon + text**, never colour alone — `validation/accessibility-comfort.cjs` enforces this.
- 44px minimum touch target on every interactive element.
- All new user-facing copy ships in English **and** Hindi in the same commit.
- Telemetry properties are restricted to `action`, `language`, `outcome`. Do not widen the allow-list. Never send question text, place, or birth data.
- All engine time values are epoch milliseconds. No `Date` objects across module boundaries.
- **Lane status (verified 2026-08-09):** `codex/jyotish-ux-remaining` and `codex/jyotish-critical-ux` are both ancestors of `origin/main` — `git merge-base --is-ancestor` confirms both. `src/screens/MuhuratHub.tsx` is therefore **free**. `plans/task-log.md` still shows both rows as `REVIEW — READY TO INTEGRATE`; correcting those rows is part of Task 10.
- Work from a worktree based on `origin/main`, not on `claude/brand-color-swap`. The untracked docs in the primary working tree collide with tracked files on main, so a worktree is the only clean base.
- Reserve a row in `plans/task-log.md` before the first code edit.

---

### Task 1: Hora telemetry events

**Files:**
- Modify: `src/telemetry/privacy-events.ts:4` (ALLOWED set) and the property map at `:26`
- Test: `validation/privacy-events.cjs` (existing gate, extended)

**Interfaces:**
- Consumes: nothing
- Produces: event names `hora_ask`, `hora_ask_outcome`, `hora_verdict_shown`, consumed by Tasks 8 and 9

- [ ] **Step 1: Read the current dictionary**

```bash
export PATH="/opt/homebrew/bin:$PATH"
sed -n '1,30p' src/telemetry/privacy-events.ts
```

Expected: an `ALLOWED` Set containing `page_view`, `muhurat_search`, `muhurat_share`, `muhurat_export`, `feedback_sent`, and a property map keyed by event name.

- [ ] **Step 2: Extend the existing gate to require the three new events**

Add to `validation/privacy-events.cjs`, before its exit line:

```js
for (const ev of ['hora_ask', 'hora_ask_outcome', 'hora_verdict_shown']) {
  if (!src.includes(`"${ev}"`)) fail(`hora telemetry: ${ev} missing from the fixed dictionary`);
}
if (/hora_(ask|verdict)[^\n]*question/.test(src)) fail('hora telemetry: question text must never be a property');
```

- [ ] **Step 3: Run the gate to verify it fails**

```bash
export PATH="/opt/homebrew/bin:$PATH"
node validation/privacy-events.cjs
```

Expected: FAIL, three lines naming the missing events, non-zero exit.

- [ ] **Step 4: Add the events**

In `src/telemetry/privacy-events.ts`, extend the ALLOWED set:

```ts
const ALLOWED = new Set(["page_view", "muhurat_search", "muhurat_share", "muhurat_export", "feedback_sent", "hora_ask", "hora_ask_outcome", "hora_verdict_shown"]);
```

And extend the property map beside the `muhurat_*` entries:

```ts
  hora_ask: ["action", "language"],
  hora_ask_outcome: ["outcome", "language"],
  hora_verdict_shown: ["outcome", "language"],
```

- [ ] **Step 5: Run the gate to verify it passes**

```bash
export PATH="/opt/homebrew/bin:$PATH"
node validation/privacy-events.cjs
```

Expected: PASS, zero failures, exit 0.

- [ ] **Step 6: Commit**

```bash
git add src/telemetry/privacy-events.ts validation/privacy-events.cjs
git commit -m "feat(hora): add three fixed telemetry events for the hora advisor"
```

---

### Task 2: Interval subtraction

**Files:**
- Create: `src/engine/hora-verdict.ts`
- Create: `validation/hora-adjudication.cjs`

**Interfaces:**
- Consumes: nothing
- Produces: `subtractWindows(base: Window, cuts: Window[]) => Window[]` and the `Window` type, used by Tasks 3, 4, 8, 9

- [ ] **Step 1: Write the failing gate**

Create `validation/hora-adjudication.cjs`:

```js
#!/usr/bin/env node
'use strict';
const { loadApp } = require('./_load-app.cjs');
const { subtractWindows } = loadApp('src/engine/hora-verdict.ts');
let failures = 0;
const fail = (m) => { failures++; console.error('FAIL ' + m); };
const W = (s, e) => ({ start: s, end: e });

// no cuts -> the base survives whole
let r = subtractWindows(W(0, 100), []);
if (r.length !== 1 || r[0].start !== 0 || r[0].end !== 100) fail('no cuts should return the base');

// cut fully covering the base -> nothing survives
r = subtractWindows(W(10, 20), [W(0, 100)]);
if (r.length !== 0) fail('a covering cut should leave nothing');

// cut in the middle -> two remainders
r = subtractWindows(W(0, 100), [W(40, 60)]);
if (r.length !== 2 || r[0].end !== 40 || r[1].start !== 60) fail('a middle cut should split into two');

// overlapping cuts merge
r = subtractWindows(W(0, 100), [W(20, 50), W(40, 70)]);
if (r.length !== 2 || r[0].end !== 20 || r[1].start !== 70) fail('overlapping cuts should merge');

// cuts outside the base are ignored
r = subtractWindows(W(0, 100), [W(200, 300)]);
if (r.length !== 1 || r[0].end !== 100) fail('cuts outside the base should be ignored');

// remainders are ordered and never negative
r = subtractWindows(W(0, 100), [W(70, 80), W(10, 20)]);
for (let i = 0; i < r.length; i++) {
  if (r[i].end <= r[i].start) fail('remainder ' + i + ' has non-positive length');
  if (i && r[i].start < r[i - 1].end) fail('remainders are not ordered');
}

if (failures) { console.error(`hora-adjudication: ${failures} failure(s)`); process.exit(1); }
console.log('hora-adjudication: PASS');
```

- [ ] **Step 2: Run the gate to verify it fails**

```bash
export PATH="/opt/homebrew/bin:$PATH"
node validation/hora-adjudication.cjs
```

Expected: FAIL — the module does not exist, esbuild reports it cannot resolve `src/engine/hora-verdict.ts`.

- [ ] **Step 3: Write the minimal implementation**

Create `src/engine/hora-verdict.ts`:

```ts
// Hora adjudication — pure. Reconciles a candidate time window against the
// forbidden belts and Choghadiya. No React, no state, no I/O: the validation
// harness loads this module directly.

export type Window = { start: number; end: number };

/* Subtract a set of cuts from a base window. Returns ordered, non-overlapping
   remainders. Cuts may overlap each other and may fall outside the base. */
export function subtractWindows(base: Window, cuts: Window[]): Window[] {
  const inside = (cuts || [])
    .filter((c) => c && c.end > base.start && c.start < base.end)
    .map((c) => ({ start: Math.max(c.start, base.start), end: Math.min(c.end, base.end) }))
    .sort((a, b) => a.start - b.start);

  const merged: Window[] = [];
  for (const c of inside) {
    const last = merged[merged.length - 1];
    if (last && c.start <= last.end) last.end = Math.max(last.end, c.end);
    else merged.push({ start: c.start, end: c.end });
  }

  const out: Window[] = [];
  let cursor = base.start;
  for (const m of merged) {
    if (m.start > cursor) out.push({ start: cursor, end: m.start });
    cursor = Math.max(cursor, m.end);
  }
  if (cursor < base.end) out.push({ start: cursor, end: base.end });
  return out;
}
```

- [ ] **Step 4: Run the gate to verify it passes**

```bash
export PATH="/opt/homebrew/bin:$PATH"
node validation/hora-adjudication.cjs
```

Expected: `hora-adjudication: PASS`, exit 0.

- [ ] **Step 5: Mutation-test the gate**

Temporarily change `if (m.start > cursor)` to `if (m.start >= cursor)` and re-run.

```bash
export PATH="/opt/homebrew/bin:$PATH"
node validation/hora-adjudication.cjs
```

Expected: still PASS (this mutation is benign) — then change `cursor = Math.max(cursor, m.end)` to `cursor = m.end` and re-run. Expected: FAIL on overlapping cuts. Revert both mutations before continuing.

- [ ] **Step 6: Commit**

```bash
git add src/engine/hora-verdict.ts validation/hora-adjudication.cjs
git commit -m "feat(hora): add interval subtraction for window adjudication"
```

---

### Task 3: Grading and the adjudicate rule set

**Files:**
- Modify: `src/engine/hora-verdict.ts`
- Modify: `validation/hora-adjudication.cjs`

**Interfaces:**
- Consumes: `subtractWindows`, `Window` from Task 2
- Produces: `TimingContext`, `Verdict`, `BlockerKey`, `VerdictStatus` types and `dominantChoghadiya(win, ctx)`, `adjudicate(win, ctx)` — used by Tasks 4, 8, 9

- [ ] **Step 1: Write the failing gate additions**

Append to `validation/hora-adjudication.cjs`, before the exit block, and add `adjudicate, dominantChoghadiya` to the destructured `loadApp` call at the top:

```js
const CTX = (over) => Object.assign({
  rahu: null, gulika: null, yama: null, abhijit: null,
  chogha: [
    { key: 'amrit', nat: 'good',    start: 0,   end: 50 },
    { key: 'rog',   nat: 'bad',     start: 50,  end: 100 },
    { key: 'char',  nat: 'neutral', start: 100, end: 200 },
  ],
}, over || {});

// clean: nothing blocks it
let v = adjudicate(W(0, 40), CTX());
if (v.status !== 'clean') fail('unblocked window should be clean');
if (v.usable.length !== 1 || v.usable[0].end !== 40) fail('clean window should be fully usable');
if (v.gradeKey !== 'amrit' || v.grade !== 'good') fail('grade should come from the dominant choghadiya');

// blocked: fully inside rahu
v = adjudicate(W(10, 20), CTX({ rahu: W(0, 100) }));
if (v.status !== 'blocked') fail('window inside rahu should be blocked');
if (v.usable.length !== 0) fail('blocked window should have no usable time');
if (v.blockedBy.join() !== 'rahu') fail('blockedBy should name rahu');

// partial: straddles the start of rahu
v = adjudicate(W(0, 100), CTX({ rahu: W(60, 200) }));
if (v.status !== 'partial') fail('straddling window should be partial');
if (v.usable.length !== 1 || v.usable[0].end !== 60) fail('partial remainder should end at the rahu start');

// R2: remainders under 3 minutes are discarded
const MIN = 3 * 60000;
v = adjudicate(W(0, MIN - 60000), CTX({ rahu: W(MIN - 60000, 10 * MIN) }));
if (v.status !== 'blocked') fail('a sub-3-minute remainder should be discarded');
v = adjudicate(W(0, MIN + 60000), CTX({ rahu: W(MIN + 60000, 10 * MIN) }));
if (v.status !== 'clean') fail('a 4-minute window should survive');

// multiple belts are all named
v = adjudicate(W(0, 100), CTX({ rahu: W(0, 30), gulika: W(30, 60), yama: W(60, 100) }));
if (v.blockedBy.join() !== 'rahu,gulika,yama') fail('all overlapping belts should be named in order');

// R5: abhijit boosts but never unblocks
v = adjudicate(W(10, 20), CTX({ rahu: W(0, 100), abhijit: W(0, 100) }));
if (v.status !== 'blocked') fail('abhijit must not clear a block');
if (v.abhijitBoost !== true) fail('abhijit overlap should still set the boost flag');

// R6: ties resolve to the earlier segment
const tie = dominantChoghadiya(W(25, 75), CTX());
if (!tie || tie.key !== 'amrit') fail('an exact overlap tie should resolve to the earlier segment');
```

- [ ] **Step 2: Run the gate to verify it fails**

```bash
export PATH="/opt/homebrew/bin:$PATH"
node validation/hora-adjudication.cjs
```

Expected: FAIL — `adjudicate is not a function`.

- [ ] **Step 3: Write the implementation**

Append to `src/engine/hora-verdict.ts`:

```ts
export type BlockerKey = "rahu" | "gulika" | "yama";
export type VerdictStatus = "clean" | "partial" | "blocked";
export type ChoghaSeg = { key: string; nat: "good" | "neutral" | "bad"; start: number; end: number };

export type TimingContext = {
  rahu: Window | null;
  gulika: Window | null;
  yama: Window | null;
  abhijit: Window | null;
  chogha: ChoghaSeg[];
};

export type Verdict = {
  status: VerdictStatus;
  usable: Window[];
  blockedBy: BlockerKey[];
  grade: "good" | "neutral" | "bad";
  gradeKey: string | null;
  abhijitBoost: boolean;
};

/* R2: a usable remainder shorter than this is noise, not advice. */
export const MIN_USABLE_MS = 3 * 60000;

const BELTS: BlockerKey[] = ["rahu", "gulika", "yama"];
const overlapMs = (a: Window, b: Window) => Math.max(0, Math.min(a.end, b.end) - Math.max(a.start, b.start));

/* R4/R6: the choghadiya segment covering the greatest share of the window.
   Ties resolve to the earlier segment, which makes the output deterministic. */
export function dominantChoghadiya(win: Window, ctx: TimingContext): { key: string; nat: "good" | "neutral" | "bad" } | null {
  let best: ChoghaSeg | null = null, bestOv = 0;
  for (const seg of (ctx.chogha || [])) {
    const ov = overlapMs(win, seg);
    if (ov > bestOv) { best = seg; bestOv = ov; }
  }
  return best ? { key: best.key, nat: best.nat } : null;
}

/* R1–R6. See docs/superpowers/specs/2026-08-09-hora-usefulness-design.md §4.2. */
export function adjudicate(win: Window, ctx: TimingContext): Verdict {
  const blockedBy: BlockerKey[] = [];
  const cuts: Window[] = [];
  for (const key of BELTS) {
    const belt = ctx[key];
    if (belt && overlapMs(win, belt) > 0) { blockedBy.push(key); cuts.push(belt); }
  }

  const usable = subtractWindows(win, cuts).filter((w) => w.end - w.start >= MIN_USABLE_MS);
  const total = usable.reduce((s, w) => s + (w.end - w.start), 0);
  const status: VerdictStatus = total <= 0 ? "blocked" : total >= win.end - win.start ? "clean" : "partial";

  const dom = dominantChoghadiya(win, ctx);
  return {
    status,
    usable,
    blockedBy,
    grade: dom ? dom.nat : "neutral",
    gradeKey: dom ? dom.key : null,
    abhijitBoost: !!(ctx.abhijit && overlapMs(win, ctx.abhijit) > 0),
  };
}
```

- [ ] **Step 4: Run the gate to verify it passes**

```bash
export PATH="/opt/homebrew/bin:$PATH"
node validation/hora-adjudication.cjs
```

Expected: `hora-adjudication: PASS`, exit 0.

- [ ] **Step 5: Mutation-test R5 and R2**

Change `abhijitBoost` to also force `status = "clean"` when true, re-run — expected FAIL on "abhijit must not clear a block". Revert. Then set `MIN_USABLE_MS = 0`, re-run — expected FAIL on the sub-3-minute assertion. Revert.

- [ ] **Step 6: Commit**

```bash
git add src/engine/hora-verdict.ts validation/hora-adjudication.cjs
git commit -m "feat(hora): adjudicate windows against the forbidden belts and choghadiya"
```

---

### Task 4: Next clean window

**Files:**
- Modify: `src/engine/hora-verdict.ts`
- Modify: `validation/hora-adjudication.cjs`

**Interfaces:**
- Consumes: `adjudicate`, `Verdict`, `Window`, `TimingContext` from Task 3
- Produces: `nextCleanWindow(windows, ctx, afterMs) => { window: Window; verdict: Verdict } | null` — used by Task 8 so an "avoid" answer never dead-ends

- [ ] **Step 1: Write the failing gate additions**

Append to `validation/hora-adjudication.cjs` (and add `nextCleanWindow` to the destructured import):

```js
const WINS = [W(0, 100), W(100, 200), W(200, 300)];

// skips a blocked window and returns the next with usable time
let n = nextCleanWindow(WINS, CTX({ rahu: W(0, 100) }), 0);
if (!n || n.window.start !== 100) fail('nextCleanWindow should skip a fully blocked window');

// never returns a window that ended before afterMs
n = nextCleanWindow(WINS, CTX(), 250);
if (!n || n.window.start !== 200) fail('nextCleanWindow should return the window containing afterMs');
n = nextCleanWindow(WINS, CTX(), 400);
if (n !== null) fail('nextCleanWindow should return null when nothing remains');

// a partial window counts, and reports its usable remainder
n = nextCleanWindow([W(0, 10 * 60000)], CTX({ rahu: W(5 * 60000, 60 * 60000) }), 0);
if (!n || n.verdict.status !== 'partial') fail('a partial window should be offered');
if (!n.verdict.usable.length || n.verdict.usable[0].end !== 5 * 60000) fail('partial remainder should be reported');
```

- [ ] **Step 2: Run the gate to verify it fails**

```bash
export PATH="/opt/homebrew/bin:$PATH"
node validation/hora-adjudication.cjs
```

Expected: FAIL — `nextCleanWindow is not a function`.

- [ ] **Step 3: Write the implementation**

Append to `src/engine/hora-verdict.ts`:

```ts
/* The first window at or after `afterMs` that still has usable time in it.
   Returns null when the day has nothing left — the caller then offers tomorrow. */
export function nextCleanWindow(
  windows: Window[], ctx: TimingContext, afterMs: number
): { window: Window; verdict: Verdict } | null {
  const ordered = [...(windows || [])].sort((a, b) => a.start - b.start);
  for (const win of ordered) {
    if (win.end <= afterMs) continue;
    const verdict = adjudicate(win, ctx);
    if (verdict.status === "blocked") continue;
    const stillAhead = verdict.usable.filter((w) => w.end > afterMs);
    if (!stillAhead.length) continue;
    return { window: win, verdict: { ...verdict, usable: stillAhead } };
  }
  return null;
}
```

- [ ] **Step 4: Run the gate to verify it passes**

```bash
export PATH="/opt/homebrew/bin:$PATH"
node validation/hora-adjudication.cjs
```

Expected: `hora-adjudication: PASS`, exit 0.

- [ ] **Step 5: Commit**

```bash
git add src/engine/hora-verdict.ts validation/hora-adjudication.cjs
git commit -m "feat(hora): offer the next clean window instead of a dead end"
```

---

### Task 5A: Expose the real next sunrise

> Found while planning: `src/engine/today-panchang.ts:96` already computes
> `choghaNight` as `choghaSlots(dow, ev.set, ev.rise + 86400000, false)`. The
> **shipped night Choghadiya has been drifting against a fake sunrise all along** —
> several minutes most of the year, worst near the solstices. This is wider than
> Hora, and one fix at the source serves both.

**Files:**
- Modify: `src/engine/today-panchang.ts` (the `sunEvents` call, the `choghaNight` line at `:96`, and the returned object at `:91`)
- Modify: `validation/hora-adjudication.cjs`

**Interfaces:**
- Consumes: `sunEvents` from `src/engine/panchang.ts`
- Produces: `nextRise` on the object returned by `computeTodayPanchang` — consumed by Tasks 5, 8, 9

- [ ] **Step 1: Write the failing gate additions**

Append to `validation/hora-adjudication.cjs` (add `loadApp('src/engine/today-panchang.ts')` for `computeTodayPanchang` at the top):

```js
const DELHI = { lat: 28.6139, lon: 77.2090, zone: 'Asia/Kolkata', label: 'Delhi' };
const tp = computeTodayPanchang(DELHI, 'lahiri', Date.UTC(2026, 11, 21, 6, 30)); // solstice: worst drift
if (tp.nextRise == null) fail('computeTodayPanchang should expose nextRise');
if (Math.abs(tp.nextRise - (tp.rise + 86400000)) < 1000)
  fail('nextRise looks like rise+24h — it must be the real following sunrise');
if (!(tp.nextRise > tp.set)) fail('nextRise must fall after sunset');
// night choghadiya must end at the real sunrise, not the approximation
const lastNight = tp.choghaNight[tp.choghaNight.length - 1];
if (Math.abs(lastNight.end - tp.nextRise) > 1) fail('night choghadiya must end at the real next sunrise');
```

- [ ] **Step 2: Run the gate to verify it fails**

```bash
export PATH="/opt/homebrew/bin:$PATH"
node validation/hora-adjudication.cjs
```

Expected: FAIL on "should expose nextRise".

- [ ] **Step 3: Compute and expose it**

In `src/engine/today-panchang.ts`, beside the existing `ev` derivation, add:

```js
  /* The FOLLOWING day's sunrise. Everything that spans the night — night horas,
     night choghadiya — must measure against this, not rise+24h, which drifts by
     minutes and is worst near the solstices. */
  const evNext = sunEvents(anchor + 86400000, place.lat, place.lon);
  const nextRise = evNext.rise !== null ? evNext.rise : (ev.rise !== null ? ev.rise + 86400000 : null);
```

Change the `choghaNight` line at `:96` to consume it:

```js
    choghaNight: ev.rise !== null ? choghaSlots(dow, ev.set, nextRise, false) : null,
```

And add `nextRise` to the returned object beside `rise` and `set` at `:91`:

```js
    rise: ev.rise, set: ev.set, nextRise, moonrise: moonEv.rise, moonset: moonEv.set, rahu, abhijit, gulika, yama,
```

- [ ] **Step 4: Run the gate and the neighbouring gates to verify nothing regressed**

```bash
export PATH="/opt/homebrew/bin:$PATH"
node validation/hora-adjudication.cjs && node validation/daily-windows.cjs && node validation/deep-muhurats.cjs && node validation/parse-check.cjs
```

Expected: all PASS. `daily-windows` and `deep-muhurats` both consume panchang output — if either fails, the night Choghadiya boundaries they assert were pinned to the old approximation and the pin is what must change, not the fix. Record which assertion moved and by how many minutes.

- [ ] **Step 5: Commit**

```bash
git add src/engine/today-panchang.ts validation/hora-adjudication.cjs
git commit -m "fix(panchang): measure the night against the real next sunrise"
```

---

### Task 5: Correct night hora boundaries

**Files:**
- Modify: `src/engine/hora.ts:17-24` (`horaWindowsForPlanet`)
- Modify: `validation/hora-adjudication.cjs`

**Interfaces:**
- Consumes: `nextRise` from Task 5A
- Produces: `horaWindowsForPlanet(planet, weekday, rise, set, nextRise?)` and `nightHoras(weekday, set, nextRise?)`. The fifth parameter is **optional and defaulted**, so this task ships independently of Tasks 8–9 without leaving `NaN` windows behind. Callers that pass the real `nextRise` get correct night boundaries; callers that do not get the old approximation until they are updated.

- [ ] **Step 1: Write the failing gate additions**

Append to `validation/hora-adjudication.cjs` (add a second `loadApp` line at the top for `src/engine/hora.ts` exporting `dayHoras, horaWindowsForPlanet`):

```js
const RISE = Date.UTC(2026, 7, 9, 0, 30), SET = RISE + 13 * 3600000, NEXT = RISE + 24.4 * 3600000;

// day + night horas must tile sunrise -> next sunrise with no gap and no overlap
const all = [];
for (const p of ['Sun', 'Venus', 'Mercury', 'Moon', 'Saturn', 'Jupiter', 'Mars'])
  all.push(...horaWindowsForPlanet(p, 0, RISE, SET, NEXT));
all.sort((a, b) => a.start - b.start);
if (all.length !== 24) fail('a full day should produce exactly 24 horas, got ' + all.length);
if (Math.abs(all[0].start - RISE) > 1) fail('the first hora should start at sunrise');
if (Math.abs(all[all.length - 1].end - NEXT) > 1) fail('the last hora should end at the NEXT sunrise, not rise+24h');
for (let i = 1; i < all.length; i++)
  if (Math.abs(all[i].start - all[i - 1].end) > 1) fail('hora ' + i + ' does not abut its predecessor');
```

- [ ] **Step 2: Run the gate to verify it fails**

```bash
export PATH="/opt/homebrew/bin:$PATH"
node validation/hora-adjudication.cjs
```

Expected: FAIL on "the last hora should end at the NEXT sunrise" — the current code hardcodes `rise + 86400000`.

- [ ] **Step 3: Write the implementation**

In `src/engine/hora.ts`, replace `horaWindowsForPlanet`:

```ts
/* all hora windows (day + night) ruled by a given planet today.
   nextRise is the FOLLOWING day's sunrise, from computeTodayPanchang. It is
   defaulted so existing callers keep working, but the default is the very drift
   this fix removes — pass the real value. */
export function horaWindowsForPlanet(planet, weekday, rise, set, nextRise = rise + 86400000) {
  const startIdx = HORA_ORDER.indexOf(DAY_LORD[weekday % 7]);
  const dayDur = (set - rise) / 12, nightDur = (nextRise - set) / 12, out = [];
  for (let i = 0; i < 12; i++) if (HORA_ORDER[(startIdx + i) % 7] === planet) out.push({ start: rise + i * dayDur, end: rise + (i + 1) * dayDur, period: "day" });
  for (let i = 0; i < 12; i++) if (HORA_ORDER[(startIdx + 12 + i) % 7] === planet) out.push({ start: set + i * nightDur, end: set + (i + 1) * nightDur, period: "night" });
  out.sort((a, b) => a.start - b.start);
  return out;
}

/* the twelve night horas, sunset -> next sunrise, in order */
export function nightHoras(weekday, set, nextRise = set + 86400000) {
  const startIdx = HORA_ORDER.indexOf(DAY_LORD[weekday % 7]);
  const dur = (nextRise - set) / 12, out = [];
  for (let i = 0; i < 12; i++) out.push({ ruler: HORA_ORDER[(startIdx + 12 + i) % 7], start: set + i * dur, end: set + (i + 1) * dur });
  return out;
}
```

- [ ] **Step 4: Run the gate to verify it passes**

```bash
export PATH="/opt/homebrew/bin:$PATH"
node validation/hora-adjudication.cjs
```

Expected: `hora-adjudication: PASS`, exit 0.

- [ ] **Step 5: Confirm no other caller breaks**

```bash
export PATH="/opt/homebrew/bin:$PATH"
grep -rn "horaWindowsForPlanet" src/
```

Expected: only `src/engine/hora.ts`, `src/engine/personal-hora.ts` and `src/screens/MuhuratHub.tsx`. Because the fifth parameter is defaulted, every existing call keeps working unchanged — this task is independently shippable. Task 8 upgrades the MuhuratHub call sites to pass the real `nextRise`.

- [ ] **Step 6: Commit**

```bash
git add src/engine/hora.ts validation/hora-adjudication.cjs
git commit -m "fix(hora): compute night horas from the real next sunrise"
```

---

### Task 6: Personal hora module

**Files:**
- Create: `src/engine/personal-hora.ts`
- Modify: `src/engine/hora.ts:170` (re-export `horaPersonalAusp` from the new module)
- Modify: `validation/hora-adjudication.cjs`

**Interfaces:**
- Consumes: `SIGN_LORD` from `src/engine/panchang.ts`; `HORA_ORDER`, `DAY_LORD` from `src/engine/hora.ts`
- Produces: `trikonaLords(ascIdx) => string[]` and `personalHoraWindows(ascIdx, weekday, rise, set, nextRise) => Array<{planet, start, end, period}>` — used by Tasks 7 and 9

- [ ] **Step 1: Write the failing gate additions**

Append to `validation/hora-adjudication.cjs` (add a `loadApp('src/engine/personal-hora.ts')` line at the top):

```js
// Aries ascendant (idx 0): lords of signs 1, 5, 9 = Mars, Sun, Jupiter
const aries = trikonaLords(0);
if (aries.join() !== 'Mars,Sun,Jupiter') fail('Aries trikona lords wrong: ' + aries.join());

// Sagittarius ascendant (idx 8): signs 9, 1, 5 = Jupiter, Mars, Sun
if (trikonaLords(8).slice().sort().join() !== 'Jupiter,Mars,Sun') fail('Sagittarius trikona lords wrong');

// duplicates are collapsed (Aries: 1st and 8th both Mars in some schemes)
for (let i = 0; i < 12; i++) {
  const l = trikonaLords(i);
  if (new Set(l).size !== l.length) fail('trikona lords should be unique for asc ' + i);
  if (!l.length || l.length > 3) fail('trikona lords should number 1-3 for asc ' + i);
}

// personal windows are a subset of that planet's windows and carry the planet name
const pw = personalHoraWindows(0, 0, RISE, SET, NEXT);
if (!pw.length) fail('personal hora windows should not be empty');
for (const w of pw) {
  if (!aries.includes(w.planet)) fail('personal window names a non-trikona planet: ' + w.planet);
  if (w.end <= w.start) fail('personal window has non-positive length');
  if (w.period !== 'day' && w.period !== 'night') fail('personal window missing period');
}
```

- [ ] **Step 2: Run the gate to verify it fails**

```bash
export PATH="/opt/homebrew/bin:$PATH"
node validation/hora-adjudication.cjs
```

Expected: FAIL — cannot resolve `src/engine/personal-hora.ts`.

- [ ] **Step 3: Write the implementation**

Create `src/engine/personal-hora.ts`:

```ts
// Personal hora — which planetary hours belong to this chart. Pure.
// Today the ascendant arrives from a manual selector; a saved chart can feed the
// same functions later with no change to this module.

import { SIGN_LORD } from "./panchang";
import { horaWindowsForPlanet } from "./hora";

/* Lords of the trikona houses (1, 5, 9) counted from the ascendant.
   These are the classically auspicious rulers for the native. */
export function trikonaLords(ascIdx: number): string[] {
  return [...new Set([0, 4, 8].map((offset) => SIGN_LORD[(ascIdx + offset) % 12]))];
}

/* Every hora today ruled by one of this chart's trikona lords, in time order. */
export function personalHoraWindows(
  ascIdx: number, weekday: number, rise: number, set: number, nextRise: number
): Array<{ planet: string; start: number; end: number; period: "day" | "night" }> {
  const out: Array<{ planet: string; start: number; end: number; period: "day" | "night" }> = [];
  for (const planet of trikonaLords(ascIdx))
    for (const w of horaWindowsForPlanet(planet, weekday, rise, set, nextRise))
      out.push({ planet, start: w.start, end: w.end, period: w.period });
  out.sort((a, b) => a.start - b.start);
  return out;
}
```

In `src/engine/hora.ts`, replace the body of `horaPersonalAusp` with a re-export so nothing else breaks this release:

```ts
/* personally-auspicious planets = lords of trikona houses (1,5,9) from ascendant.
   Moved to personal-hora.ts; this alias is kept for one release. */
export { trikonaLords as horaPersonalAusp } from "./personal-hora";
```

Then delete the now-unused `SIGN_LORD` import from `hora.ts` if no other line uses it:

```bash
export PATH="/opt/homebrew/bin:$PATH"
grep -n "SIGN_LORD" src/engine/hora.ts
```

- [ ] **Step 4: Run the gate to verify it passes**

```bash
export PATH="/opt/homebrew/bin:$PATH"
node validation/hora-adjudication.cjs && node validation/parse-check.cjs
```

Expected: `hora-adjudication: PASS` and a clean parse.

- [ ] **Step 5: Commit**

```bash
git add src/engine/personal-hora.ts src/engine/hora.ts validation/hora-adjudication.cjs
git commit -m "feat(hora): extract the personal trikona-lord hora layer"
```

---

### Task 7: TimingLanes component

**Files:**
- Create: `src/components/TimingLanes.tsx`
- Test: manual browser verification (step 5) plus `validation/design-system-primitives.cjs` and `validation/accessibility-comfort.cjs`

**Interfaces:**
- Consumes: `Window`, `BlockerKey` from Task 2/3; `CHOG_NAME` from `src/engine/panchang.ts`; `HORA_COLOR`, `HORA_GLYPH`, `HORA_NAME` from `src/engine/hora.ts`
- Produces: default export `TimingLanes` with the props in the spec §4.4 — used by Task 9

- [ ] **Step 1: Create the component**

Create `src/components/TimingLanes.tsx`:

```tsx
// Four timing systems on one shared axis. This is the piece that stops Hora
// reading as a second Muhurat finder: instead of a rival answer, it is the one
// place hora, choghadiya and the forbidden belts are seen against each other.

import React from "react";
import { HORA_COLOR, HORA_GLYPH, HORA_NAME } from "../engine/hora";
import { CHOG_NAME } from "../engine/panchang";

const LANE_H = 1.25, PERSONAL_H = 0.75; // rem

export default function TimingLanes({ domain, period, horas, chogha, blockers, abhijit, personal, nowMs, lang, onSelect }) {
  const span = domain.end - domain.start;
  if (!(span > 0)) return null;
  const pct = (ms) => ((ms - domain.start) / span) * 100;
  const clampW = (w) => ({ left: Math.max(0, pct(w.start)), width: Math.min(100, pct(w.end)) - Math.max(0, pct(w.start)) });
  const L = lang === "hi" ? "hi" : "en";
  const tr = (en, hi) => (L === "hi" ? hi : en);

  const lane = (label, children, height) => (
    <div style={{ marginBottom: "0.375rem" }}>
      <div style={{ fontSize: "var(--font-label)", color: "var(--muted)", marginBottom: "0.125rem" }}>{label}</div>
      <div style={{ position: "relative", height: height + "rem", borderRadius: "var(--radius-sm)", background: "var(--surface-sunken)", overflow: "hidden" }}>
        {children}
      </div>
    </div>
  );

  return (
    <div role="group" aria-label={tr("Timing systems for this period", "इस अवधि की समय प्रणालियाँ")} style={{ marginTop: "0.75rem" }}>
      {lane(tr("Hora", "होरा"), horas.map((h, i) => {
        const g = clampW(h);
        return (
          <button key={i} type="button" onClick={() => onSelect({ start: h.start, end: h.end })}
            aria-label={`${HORA_NAME[h.ruler][L]} ${tr("hora", "होरा")}`}
            style={{ position: "absolute", left: g.left + "%", width: g.width + "%", top: 0, bottom: 0, minHeight: "2.75rem", border: "none", padding: 0, cursor: "pointer", background: HORA_COLOR[h.ruler], opacity: 0.55 }}>
            <span aria-hidden="true" style={{ fontSize: "var(--font-label)", color: "var(--on-accent)" }}>{HORA_GLYPH[h.ruler]}</span>
          </button>
        );
      }), LANE_H)}

      {lane(tr("Choghadiya", "चौघड़िया"), chogha.map((c, i) => {
        const g = clampW(c);
        const tone = c.nat === "good" ? "var(--good)" : c.nat === "bad" ? "var(--bad)" : "var(--muted)";
        return <div key={i} title={CHOG_NAME[c.key][L]} style={{ position: "absolute", left: g.left + "%", width: g.width + "%", top: 0, bottom: 0, background: tone, opacity: 0.32 }} />;
      }), LANE_H)}

      {lane(tr("Blocked", "बाधित"), (
        <>
          {blockers.map((b, i) => {
            const g = clampW(b.window);
            return <div key={i} role="img" aria-label={tr("blocked", "बाधित") + ": " + b.key}
              style={{ position: "absolute", left: g.left + "%", width: g.width + "%", top: 0, bottom: 0, background: "repeating-linear-gradient(45deg, var(--bad) 0, var(--bad) 0.25rem, transparent 0.25rem, transparent 0.5rem)" }} />;
          })}
          {abhijit ? (() => { const g = clampW(abhijit); return <div aria-label={tr("Abhijit", "अभिजित")} style={{ position: "absolute", left: g.left + "%", width: Math.max(g.width, 0.5) + "%", top: 0, bottom: 0, background: "var(--gold)" }} />; })() : null}
        </>
      ), LANE_H)}

      {personal && personal.length ? lane(tr("Yours", "आपके"), horas.filter((h) => personal.includes(h.ruler)).map((h, i) => {
        const g = clampW(h);
        return <div key={i} style={{ position: "absolute", left: g.left + "%", width: g.width + "%", top: 0, bottom: 0, background: "var(--gold)", opacity: 0.5 }} />;
      }), PERSONAL_H) : null}

      {nowMs != null && nowMs >= domain.start && nowMs <= domain.end && (
        <div aria-hidden="true" style={{ position: "relative", height: 0 }}>
          <div style={{ position: "absolute", left: pct(nowMs) + "%", top: "-6rem", bottom: 0, width: "0.125rem", background: "var(--accent)" }} />
        </div>
      )}

      <div style={{ fontSize: "var(--font-label)", color: "var(--muted)", marginTop: "0.25rem" }}>
        {period === "day" ? tr("Sunrise to sunset", "सूर्योदय से सूर्यास्त") : tr("Sunset to sunrise", "सूर्यास्त से सूर्योदय")}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify it parses and the token gates pass**

```bash
export PATH="/opt/homebrew/bin:$PATH"
node validation/parse-check.cjs && node validation/design-system-primitives.cjs && node validation/accessibility-comfort.cjs
```

Expected: all three PASS. If `design-system-primitives` fails, the cause is a raw px or hex value — replace it with a token or rem.

- [ ] **Step 3: Commit**

```bash
git add src/components/TimingLanes.tsx
git commit -m "feat(hora): add the shared-axis timing lane strip"
```

---

### Task 8: Verdicts in the Ask box

> Lane verified free on 2026-08-09: both claiming codex branches are ancestors of `origin/main`. Re-confirm with `git merge-base --is-ancestor origin/codex/jyotish-ux-remaining origin/main` before starting, in case a new reservation has been filed.

**Files:**
- Modify: `src/screens/MuhuratHub.tsx:1106-1190` (the `horaResult` render block) and `:17` (imports)

**Interfaces:**
- Consumes: `adjudicate`, `nextCleanWindow`, `TimingContext` (Tasks 3–4); `horaWindowsForPlanet` five-arg form (Task 5); the three telemetry events (Task 1)
- Produces: nothing consumed downstream

- [ ] **Step 1: Build the timing context once, beside the other derived values**

Add near the existing `goodSlots` derivation around `:207`:

```tsx
const horaCtx = {
  rahu: todayP.rahu || null,
  gulika: todayP.gulika || null,
  yama: todayP.yama || null,
  abhijit: todayP.abhijit || null,
  chogha: [...(todayP.choghaDay || []), ...(todayP.choghaNight || [])],
};
const nextRise = todayP.nextRise;
```

`todayP.nextRise` is guaranteed by Task 5A. Do **not** reintroduce a `rise + 86400000` fallback here — that is the exact drift Tasks 5A and 5 removed. If it reads `undefined`, Task 5A has not landed; stop and complete it first.

- [ ] **Step 2: Replace every `horaWindowsForPlanet` call with the five-argument form**

Three call sites: `:1110`, `:1175`, and any added since. Each becomes:

```tsx
const wins = horaWindowsForPlanet(p, todayP.dow, todayP.rise, todayP.set, nextRise);
```

- [ ] **Step 3: Render a verdict beside every window**

Inside the `status === "timing"` block, replace the window row with:

```tsx
{wins.map((w, i) => {
  const v = adjudicate({ start: w.start, end: w.end }, horaCtx);
  if (v.status === "blocked" && !showBlockedHoras) return null;
  const isNow = isToday && Date.now() >= w.start && Date.now() < w.end;
  return (
    <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontVariantNumeric: "tabular-nums", opacity: v.status === "blocked" ? 0.5 : 1 }}>
      <span style={{ fontSize: T.fSmall, color: C.ivory, fontWeight: isNow ? 700 : 400 }}>{fmtT(w.start)} – {fmtT(w.end)}</span>
      <span style={{ fontSize: T.fMicro, color: C.muted }}>{w.period === "day" ? (lang === "hi" ? "दिन" : "day") : (lang === "hi" ? "रात" : "night")}</span>
      <Badge tone={v.status === "clean" ? "good" : v.status === "partial" ? "warn" : "bad"}>
        {v.status === "clean" ? (lang === "hi" ? "✓ स्पष्ट" : "✓ Clear")
          : v.status === "partial" ? (lang === "hi" ? "◐ आंशिक रूप से बाधित" : "◐ Partly blocked")
          : (lang === "hi" ? "✗ बाधित" : "✗ Blocked")}
      </Badge>
      {v.status === "partial" && v.usable[0] && (
        <span style={{ fontSize: T.fMicro, color: C.gold }}>{lang === "hi" ? "प्रयोग करें " : "use "}{fmtT(v.usable[0].start)}–{fmtT(v.usable[0].end)}</span>
      )}
      {v.blockedBy.length > 0 && (
        <span style={{ fontSize: T.fMicro, color: C.sindoor }}>{v.blockedBy.map((k) => tr(lang, k + "L")).join(", ")}</span>
      )}
      {isNow && <span style={{ fontSize: T.fMicro, color: HORA_COLOR[p], fontWeight: 700 }}>● {lang === "hi" ? "अभी" : "now"}</span>}
    </div>
  );
})}
```

- [ ] **Step 4: Never dead-end an "avoid" answer**

In the `status === "answer"` branch, when `horaResult.intent === "avoid"` or every window is blocked, append:

```tsx
{(() => {
  const alt = nextCleanWindow(
    horaWindowsForPlanet(hr.planets[0], todayP.dow, todayP.rise, todayP.set, nextRise).map((w) => ({ start: w.start, end: w.end })),
    horaCtx, isToday ? Date.now() : todayP.rise
  );
  return (
    <div style={{ fontSize: T.fMicro, color: C.gold, marginTop: "0.5rem" }}>
      {alt
        ? (lang === "hi" ? `अगला स्पष्ट समय: ${fmtT(alt.verdict.usable[0].start)}–${fmtT(alt.verdict.usable[0].end)}` : `Next clear window: ${fmtT(alt.verdict.usable[0].start)}–${fmtT(alt.verdict.usable[0].end)}`)
        : (lang === "hi" ? "आज और कोई स्पष्ट समय नहीं — कल देखें।" : "No clear window left today — check tomorrow.")}
    </div>
  );
})()}
```

- [ ] **Step 5: Show the confidence that is already computed**

In the same branch, after the answer sentence:

```tsx
{horaResult.conf === "medium" && (
  <div style={{ fontSize: T.fMicro, color: C.muted, marginTop: "0.25rem", fontStyle: "italic" }}>
    {lang === "hi" ? "सर्वोत्तम अनुमान — आपके प्रश्न से एक से अधिक कार्य मेल खाए।" : "Best guess — your question matched more than one activity."}
  </div>
)}
```

- [ ] **Step 6: Add the practitioner toggle and the three telemetry calls**

State beside the other hora state at `:88`:

```tsx
const [showBlockedHoras, setShowBlockedHoras] = useState(false);
```

Control below the answer block, meeting the 44px floor:

```tsx
<label style={{ display: "flex", alignItems: "center", gap: "0.5rem", minHeight: "2.75rem", fontSize: T.fMicro, color: C.muted, cursor: "pointer" }}>
  <input type="checkbox" checked={showBlockedHoras} onChange={(e) => setShowBlockedHoras(e.target.checked)} />
  {lang === "hi" ? "बाधित होरा भी दिखाएँ (ज्योतिषी दृश्य)" : "Show blocked horas too (practitioner view)"}
</label>
```

Fire the events at the existing submit handlers — never send the question text:

```tsx
onClick={() => { track("hora_ask", { action: "typed", language: lang }); const r = analyzeHora(horaQuestion); track("hora_ask_outcome", { outcome: r.status, language: lang }); setHoraResult(r); }}
```

- [ ] **Step 7: Verify in the browser**

Start the dev server with the Browser pane and launch config `kundli-dev` (not a shell). Then at 375×812, EN and HI, light and dark:

1. Ask "best hora for business" — every window carries a status badge.
2. Ask "hora for travel" during Rahu Kaal — the blocked window is hidden and a next-clear-window line appears.
3. Tick the practitioner toggle — blocked windows appear greyed with the belt named.
4. Confirm zero horizontal overflow and zero console errors.

- [ ] **Step 8: Run the gates and commit**

```bash
export PATH="/opt/homebrew/bin:$PATH"
node validation/parse-check.cjs && node validation/accessibility-comfort.cjs && node validation/design-system-primitives.cjs && node validation/privacy-events.cjs && node validation/hora-adjudication.cjs
```

Expected: all PASS.

```bash
git add src/screens/MuhuratHub.tsx
git commit -m "feat(hora): adjudicate every hora answer against the forbidden belts"
```

---

### Task 9: Day/night toggle, lanes and grading on the dial

> Depends on Task 8 having landed the `horaCtx` and `nextRise` derivations in the same file.

**Files:**
- Modify: `src/screens/MuhuratHub.tsx:940-1077` (the hora dial block)

**Interfaces:**
- Consumes: `TimingLanes` (Task 7), `nightHoras` (Task 5), `trikonaLords` (Task 6), `adjudicate` (Task 3)
- Produces: nothing consumed downstream

- [ ] **Step 1: Add the period state and toggle**

Beside the other hora state:

```tsx
const [horaPeriod, setHoraPeriod] = useState(null); // null = auto
```

Above the dial:

```tsx
{(() => {
  const auto = isToday && nowMs != null && (nowMs < todayP.rise || nowMs > todayP.set) ? "night" : "day";
  const active = horaPeriod || auto;
  return (
    <div role="tablist" aria-label={lang === "hi" ? "दिन या रात" : "Day or night"} style={{ display: "flex", gap: "0.375rem", marginBottom: "0.5rem" }}>
      {["day", "night"].map((p) => (
        <button key={p} role="tab" aria-selected={active === p} onClick={() => setHoraPeriod(p)}
          style={{ minHeight: "2.75rem", padding: `0 ${T.s3}`, borderRadius: T.rPill, cursor: "pointer",
            border: `0.0625rem solid ${active === p ? C.gold : C.line}`,
            background: active === p ? "var(--accent-soft)" : "transparent",
            color: active === p ? C.gold : C.muted, fontSize: T.fMicro }}>
          {p === "day" ? (lang === "hi" ? "दिन" : "Day") : (lang === "hi" ? "रात" : "Night")}
        </button>
      ))}
    </div>
  );
})()}
```

- [ ] **Step 2: Feed the dial from the active period**

Replace `const horas = dayHoras(todayP.dow, rise, set);` with:

```tsx
const activePeriod = horaPeriod || (isToday && nowMs != null && (nowMs < rise || nowMs > set) ? "night" : "day");
const horas = activePeriod === "day" ? dayHoras(todayP.dow, rise, set) : nightHoras(todayP.dow, set, nextRise);
const domainStart = activePeriod === "day" ? rise : set;
const domainEnd = activePeriod === "day" ? set : nextRise;
```

Then replace every use of `rise`/`set` inside the arc geometry (`dayFrac`, `arcPt` callers, the sunrise/sunset end labels) with `domainStart`/`domainEnd` so the arc redraws for whichever period is active.

- [ ] **Step 3: Grade each hora segment on the dial**

Where each hora arc segment is drawn, add the Choghadiya grade as a thin under-stroke so the quality reads without colour alone:

```tsx
{(() => {
  const v = adjudicate({ start: h.start, end: h.end }, horaCtx);
  const tone = v.status === "blocked" ? "var(--bad)" : v.grade === "good" ? "var(--good)" : v.grade === "bad" ? "var(--bad)" : "var(--muted)";
  return <polyline points={arcPoly(i / 12, (i + 1) / 12, 8)} fill="none" stroke={tone} strokeWidth="1.5" strokeOpacity="0.8" transform="translate(0,7)" />;
})()}
```

And in the selected-hora readout, name the Choghadiya in Ganak's own vocabulary:

```tsx
{(() => {
  const v = adjudicate({ start: horas[showHora].start, end: horas[showHora].end }, horaCtx);
  return v.gradeKey ? <span style={{ fontSize: T.fMicro, color: C.muted }}> · {trN(lang, CHOG_NAME, v.gradeKey)}</span> : null;
})()}
```

- [ ] **Step 4: Mount the lane strip below the dial**

Immediately after the closing `</svg>`:

```tsx
<TimingLanes
  domain={{ start: domainStart, end: domainEnd }}
  period={activePeriod}
  horas={horas}
  chogha={activePeriod === "day" ? (todayP.choghaDay || []) : (todayP.choghaNight || [])}
  blockers={[["rahu", todayP.rahu], ["gulika", todayP.gulika], ["yama", todayP.yama]].filter(([, w]) => w).map(([key, w]) => ({ key, window: w }))}
  abhijit={todayP.abhijit || null}
  personal={horaAsc != null ? trikonaLords(horaAsc) : null}
  nowMs={isToday ? nowMs : null}
  lang={lang}
  onSelect={(w) => setHoraSel(horas.findIndex((h) => h.start === w.start))}
/>
```

Add the import at `:17`:

```tsx
import TimingLanes from "../components/TimingLanes";
```

- [ ] **Step 5: Fire the verdict telemetry event**

Where the selected-hora readout renders, once per selection change:

```tsx
useEffect(() => {
  if (showHora == null || !horas[showHora]) return;
  const v = adjudicate({ start: horas[showHora].start, end: horas[showHora].end }, horaCtx);
  track("hora_verdict_shown", { outcome: v.status, language: lang });
}, [showHora, activePeriod, lang]);
```

- [ ] **Step 6: Verify in the browser**

Browser pane, launch config `kundli-dev`, 375×812, EN and HI, light and dark:

1. The Day/Night toggle switches the arc, the times and all four lanes.
2. Night shows 12 horas ending at the next sunrise, not at rise+24h.
3. Rahu Kaal appears as a hatched block on the Blocked lane and lines up with the same times shown in the Muhurat finder above.
4. Setting an ascendant reveals the "Yours" lane; clearing it hides the lane.
5. Zero horizontal overflow at 320px and 375px; zero console errors.

- [ ] **Step 7: Run the full gate sweep and commit**

```bash
export PATH="/opt/homebrew/bin:$PATH"
node validation/parse-check.cjs && node validation/accessibility-comfort.cjs && node validation/design-system-primitives.cjs && node validation/hora-adjudication.cjs && node validation/daily-windows.cjs && npm run build
```

Expected: all PASS, build succeeds.

```bash
git add src/screens/MuhuratHub.tsx
git commit -m "feat(hora): day/night toggle, shared-axis lanes and choghadiya grading"
```

---

### Task 10: Close out

**Files:**
- Modify: `plans/task-log.md` (own row), `plans/backlog.md` (the Hora line at `:1063`)
- Modify: `AGENTS.md` if it lists the validation gates by name

- [ ] **Step 1: Confirm the whole gate suite is green**

```bash
export PATH="/opt/homebrew/bin:$PATH"
for f in validation/*.cjs; do node "$f" >/dev/null 2>&1 || echo "FAIL $f"; done; echo "sweep done"
```

Expected: `sweep done` with no FAIL lines.

- [ ] **Step 2: Verify the success criteria from the spec, one by one**

Walk §10 of `docs/superpowers/specs/2026-08-09-hora-usefulness-design.md` and record evidence for each of the six criteria in the task-log row. Do not mark anything done on the strength of code being written — each needs a run or a measurement.

- [ ] **Step 3: Update the task log with gate evidence and a handoff**

Add the exact gate output, the browser measurements from Tasks 8 and 9, and any decision you took that the spec did not cover.

- [ ] **Step 4: Commit**

```bash
git add plans/task-log.md plans/backlog.md
git commit -m "docs(hora): record the hora adjudication closeout"
```

---

## Self-review

**Spec coverage:** G1 → Tasks 3, 8. G2 → Tasks 5A, 5, 9. G3 → Tasks 3, 9. G4 → Tasks 7, 9. G5 → Tasks 4, 8. G6 → Task 8 step 5. G7 → Task 1. G8 → Tasks 6, 9. Rule set R1–R7 → Task 3. Telemetry §6 → Task 1. Validation §7 → Tasks 2–6. Design system §5 → Tasks 7, 9. Decision D6 → Task 5A. Every spec section maps to a task.

**Type consistency:** `Window`, `TimingContext`, `Verdict`, `BlockerKey` are defined once in Task 2/3 and referenced by exact name in Tasks 4, 7, 8, 9. `horaWindowsForPlanet` gains an optional fifth parameter in Task 5; `nextRise` originates in Task 5A and flows to Tasks 5, 8, 9 under that one name. `trikonaLords` is the canonical name; `horaPersonalAusp` survives only as a one-release alias.

**Ordering:** Task 5A must precede Tasks 5, 8 and 9 — it creates `nextRise`. Tasks 1, 2 and 7 are independent of everything and can run in parallel. Tasks 3 → 4 → 6 are a chain on the verdict engine. Tasks 8 → 9 are a chain on one screen file and must be sequential.

**Resolved hazard:** the fifth parameter is defaulted, so Task 5 no longer strands Task 8. Each task is independently shippable and independently revertible.

**Scope note:** Task 5A fixes a defect outside the original spec — shipped night Choghadiya measured against `rise + 86400000`. It is included because Tasks 5, 8 and 9 all depend on the correct value, and leaving two sunrise definitions in the codebase would guarantee the contradiction this whole plan exists to remove.
