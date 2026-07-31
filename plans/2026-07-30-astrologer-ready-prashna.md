# Astrologer-Ready Prashna Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Prashna surface safe to hand to KP moderators — fix the sub-lord correctness defect, stop the two "Sub-lord" readouts contradicting each other, and add the practitioner affordances (full cuspal sub-lords, significator grid, place/time control, shareable card).

**Architecture:** Three layers, touched in this order. (1) The *engine* fix is a boundary-tolerance change to `PR_subOf` inside the parity-frozen region, mirrored byte-for-byte in the reference engine `validation/prashna-calc.js` — the parity gate is the safety net that proves the mirror. (2) The *labelling* fix renames two chips and moves the "deciding vote" gloss onto the one quantity that actually decides. (3) The *practitioner* layer is additive: new below-the-frozen-region pure functions (`PR_cuspalTable`, `PR_significatorGrid`) plus new presentational components, gated behind a Chart-first / Answer-first toggle so the devotee voice is preserved for lay users and demoted for astrologers.

**Tech Stack:** React (no framework router — screen is a prop-driven component), TypeScript-in-JSX (`src/screens/PrashnaScreen.tsx`), esbuild-backed CommonJS validation harnesses (`validation/*.cjs`), no test framework — gates are standalone Node scripts that print `PASS`/`FAIL` and exit non-zero.

---

## Findings: what actually diverges (read this before Task 1)

The review reported "the 249-table sub-lord (Saturn) vs the KP-New-ayanamsa live-computed sub-lord (Rahu) diverge." That hypothesis is **wrong**, and the truth is both simpler and worse. There are **two independent defects**.

### Defect A — label collision (the reported symptom). Not a math error.

Three distinct quantities exist; two are rendered, both under the word "Sub-lord":

| | Quantity | Source | Rendered where |
|---|---|---|---|
| **A** | 249-table sub-lord **of the ascendant** | `kpNumberInfo(n).subLord`, [src/engine/kp-horary.ts:80](src/engine/kp-horary.ts:80) | Answer card, [PrashnaScreen.tsx:982](src/screens/PrashnaScreen.tsx:982) — glossed *"the planet that gives the final yes or no"* |
| **B** | live-computed sub-lord **of cusp 1** | `PR_subOf(chart.cusps[1])` | **rendered nowhere** |
| **C** | live-computed sub-lord **of the question's cusp** (7th for marriage) | `PR_judge().cuspSub`, [PrashnaScreen.tsx:243](src/screens/PrashnaScreen.tsx:243) | Full-chart chip, [PrashnaScreen.tsx:893](src/screens/PrashnaScreen.tsx:893) — glossed *"the fine-grained ruler that casts the deciding vote"* |

For #108 / marriage: **A = Saturn**, **C = Rahu**. Both values are *correct for what they are*. The chip sits in a row beside the Lagna and Nakshatra chips — which genuinely are lagna properties — so it reads as the lagna's sub-lord when it is in fact the 7th cusp's. The judgment prose at [PrashnaScreen.tsx:569](src/screens/PrashnaScreen.tsx:569) correctly names Rahu as the 7th-house sub-lord, so prose and chip agree; the answer card is the odd one out only because it shows a *different quantity* under the same word.

Measured over all 249 numbers × 12 topics (`.scratch/sublord-divergence-probe.cjs`):

```
card and chip show the SAME planet: 522/2988 (17.5%)
card and chip CONTRADICT:           2466/2988 (82.5%)
```

This is endemic, not a rare drift. **No ayanamsa is involved. Nothing needs a KP ruling to fix this** — both numbers stay, they just stop sharing a name.

### Defect B — a genuine correctness bug, invisible in the UI, that Defect A was hiding.

`PR_subOf` ([PrashnaScreen.tsx:163](src/screens/PrashnaScreen.tsx:163)) resolves a sub with a strict half-open comparison in integer arcseconds:

```js
for (const r of PR_SUBS) if (s >= r.from && s < r.to) return r;
```

In number mode the ascendant is pinned *exactly* at a sub-segment **start** boundary — that is the whole point of the 249 method. But `PR_castNumber` reaches that degree through a sidereal→tropical→RAMC-inversion→tropical→sidereal round-trip, and lands **below** the boundary by up to `8.5e-14°`. With zero tolerance, the lagna falls into the **previous** sub.

Measured (`.scratch/sublord-boundary-impact.cjs`, `.scratch/sublord-epsilon-sizing.cjs`):

```
numbers where table sub-lord != live cusp-1 sub-lord:  96 / 249
max |cusps[1] - table| (5 places x 3 times x 249 nums): 3.070e-10 arcsec (8.527e-14 deg)

impact on the "general" topic (judged on cusp 1):
  wrong deciding sub-lord: 42 / 249
  VERDICT actually flips:  23 / 249
    #19:  sub Ke->Su   verdict mixed       -> favourable
    #111: sub Ke->Ve   verdict favourable  -> unfavourable
    #138: sub Ma->Mo   verdict unfavourable-> favourable
    #225: sub Me->Ke   verdict favourable  -> unfavourable
```

**23 of 249 numbers give the user the wrong answer** on the "Other question" topic today. This survived every prior bug-bash precisely because quantity **B is rendered nowhere** — the UI never showed the value that was wrong. It bites only cusp 1 in number mode: every other cusp is a generic real number that never lands within `1e-13°` of a boundary, and time mode never pins the ascendant at all. That is why Task 1's fix is confined and why the parity gate stays green.

Epsilon sizing: the smallest real sub is the Sun's, `6 yrs × 400 = 2400 arcsec`. A tolerance of `1e-6` arcsec is ~3,000× larger than the worst observed error and ~2.4e9× smaller than the smallest sub — decisive and astronomically meaningless.

### The one thing that IS a KP domain call

Which quantity earns the words *"the deciding vote"*. Standard KP horary doctrine: the **cuspal sub-lord of the house judged** (quantity C) decides fructification; the **ascendant sub-lord** (A) speaks to the querent's genuineness and whether the question matures at all. Task 2 implements that reading. It is well-established doctrine rather than a coin-flip, so it does not block — but **flag it for owner/moderator ratification before the surface ships to the group**, because it changes which planet the app calls decisive.

---

## Global Constraints

- **Parity-frozen region.** `src/screens/PrashnaScreen.tsx` lines between `// ============================== ENGINE (validated) ==========================` and `// ============================ END ENGINE ====================================` are guarded by `validation/prashna-parity.js`, which compares that region's behaviour against `validation/prashna-calc.js`. Any edit inside it **must** be mirrored in `validation/prashna-calc.js` in the same commit. Only Task 1 touches it. Every other task adds code **below** `END ENGINE`.
- **Gates after every structural edit**, output pasted into the task-log row (AGENTS.md line 40):
  ```bash
  node validation/parse-check.js src/kundli-app.tsx
  ```
  ```bash
  node validation/prashna-parity.js src/screens/PrashnaScreen.tsx
  ```
  ```bash
  node validation/prashna-calc.js
  ```
  ```bash
  node validation/prashna-249.cjs
  ```
  ```bash
  node validation/prashna-249-chart.cjs
  ```
  ```bash
  node validation/prashna-copy.cjs
  ```
  ```bash
  node validation/hindi-devotional-language.cjs
  ```
- **Never weaken a gate to pass it** (AGENTS.md line 61). If a gate fails, fix the cause.
- **Node/npm are at `/opt/homebrew/bin`** and not on the harness PATH. Prefix every shell command: `export PATH="/opt/homebrew/bin:$PATH" && …`
- **Temp files go in `.scratch/` only.** Never `/tmp`, never outside the repo.
- **Bilingual or nothing.** Every user-facing string ships with both `hi` and `en`. Hindi copy must pass `validation/hindi-devotional-language.cjs` and `validation/hindi-worship-glossary.cjs`.
- **Design tokens only.** Use `TOKENS.*` (`bg`, `card`, `ink`, `muted`, `line`, `gold`, `goldSoft`, `sindoor`, `sindoorSoft`, `radius`, `ctrlH`, `devanagari`). No raw hex.
- **Planet keys are the 2-letter form** `Su Mo Ma Me Ju Ve Sa Ra Ke` everywhere in engine code. `kpNumberInfo` returns **full names** (`"Saturn"`) — convert at the boundary, never mix.
- **Phone-first.** Minimum viewport 320px. Anything wider than that scrolls inside its own `overflow-x: auto` container, never widening the page.
- **Coordination.** `src/screens/PrashnaScreen.tsx` is the exclusive file of several task-log rows. Before the first edit, add an `ACTIVE` row to `plans/task-log.md` naming this plan, the branch, and the exclusive file set. Check no other row holds `src/screens/PrashnaScreen.tsx` as `ACTIVE`/`RESERVED` first — at time of writing, `CLAUDE-EN-SIGN-NAMES-E1.0` is `ACTIVE` on it for `RASHI_EN` only; keep clear of `RASHI_EN`.

---

## File Structure

| File | Responsibility | Task |
|---|---|---|
| `src/screens/PrashnaScreen.tsx` (frozen region) | `PR_subOf` boundary tolerance — the only frozen-region edit in this plan | 1 |
| `validation/prashna-calc.js` | reference engine; `subLordOf` mirrors the above | 1 |
| `validation/prashna-sublord-boundary.cjs` (new) | gate: table sub-lord == live cusp-1 sub-lord for all 249 | 1 |
| `src/screens/PrashnaScreen.tsx` (below frozen) | `PR_castNumber` exact cusp-1; labels; `PR_cuspalTable`; `PR_significatorGrid`; view toggle; place/time control; share card | 1–6 |
| `validation/prashna-sublord-labels.cjs` (new) | gate: no two readouts share a sub-lord label/gloss | 2 |
| `validation/prashna-practitioner.cjs` (new) | gate: cuspal table + significator grid correctness | 5 |

---

### Task 1: Fix the sub-lord boundary defect (Defect B)

The one hard correctness blocker. Nothing else in this plan ships before it is green.

**Files:**
- Modify: `src/screens/PrashnaScreen.tsx:163-167` (inside frozen region — mirror required)
- Modify: `validation/prashna-calc.js:229-233` (the mirror)
- Modify: `src/screens/PrashnaScreen.tsx:350` (below frozen region)
- Create: `validation/prashna-sublord-boundary.cjs`

**Interfaces:**
- Consumes: `PR_castNumber(ms, lat, lonE, number)`, `PR_judge(chart, q)`, `QUESTIONS` from `src/screens/PrashnaScreen.tsx`; `kpNumberInfo(n)` from `src/engine/kp-horary.ts`.
- Produces: `PR_subOf` becomes boundary-tolerant for all callers. `chart.cusps[1]` in number mode becomes exactly `kpNumberToLagna(number)`. No signature changes — later tasks rely on `PR_judge(chart, q).cuspSub` now being correct for `q.cusp === 1`.

- [ ] **Step 1: Write the failing gate**

Create `validation/prashna-sublord-boundary.cjs`:

```js
#!/usr/bin/env node
// ============================================================================
// validation/prashna-sublord-boundary.cjs
//
// The 249 method pins the ascendant EXACTLY at a sub-segment start boundary.
// PR_castNumber reaches that degree through a tropical round-trip that lands up
// to 8.5e-14 deg BELOW it. PR_subOf's half-open (s >= from && s < to) test has
// zero tolerance, so the lagna fell into the PREVIOUS sub for 96/249 numbers --
// flipping the verdict for 23/249 on the cusp-1 ("general") topic.
//
// This gate asserts the live-computed cusp-1 sub-lord equals the 249 table's
// ascendant sub-lord for every number, at every latitude band we support.
// ============================================================================
'use strict';
const { loadApp } = require('./_load-app.cjs');

const scr = loadApp('src/screens/PrashnaScreen.tsx');
const eng = loadApp('src/engine/kp-horary.ts');
const { PR_castNumber, PR_judge, QUESTIONS } = scr;
const { kpNumberInfo, kpNumberToLagna } = eng;

const FULL2KEY = { Sun:'Su', Moon:'Mo', Mars:'Ma', Mercury:'Me', Jupiter:'Ju',
  Venus:'Ve', Saturn:'Sa', Rahu:'Ra', Ketu:'Ke' };

let pass = 0, fail = 0;
const ok = (c, m) => { c ? pass++ : fail++; if (!c) console.log(`FAIL  ${m}`); };

const IST = (y, mo, d, h, mi) => Date.UTC(y, mo - 1, d, h, mi) - 330 * 60000;
const PLACES = [
  ['New Delhi', 28.6139, 77.2090], ['Kolkata', 22.5726, 88.3639],
  ['Chennai', 13.0827, 80.2707],   ['London', 51.5074, -0.1278],
  ['Reykjavik', 64.1466, -21.9426],
];
const TIMES = [IST(2026,7,24,15,30), IST(2026,1,3,6,5), IST(2026,11,19,23,50)];
const general = QUESTIONS.find(q => q.key === 'general'); // judged on cusp 1

console.log('--- live cusp-1 sub-lord == 249 table ascendant sub-lord ---');
for (const [name, lat, lon] of PLACES) {
  for (const ms of TIMES) {
    for (let n = 1; n <= 249; n++) {
      const chart = PR_castNumber(ms, lat, lon, n);
      const want = FULL2KEY[kpNumberInfo(n).subLord];
      const got = PR_judge(chart, general).cuspSub;
      ok(got === want, `${name} #${n}: live cusp-1 sub ${got} != table ${want}`);
    }
  }
}

console.log('--- cusp 1 is EXACTLY the number degree (no round-trip loss) ---');
for (const [name, lat, lon] of PLACES) {
  for (const ms of TIMES) {
    for (let n = 1; n <= 249; n++) {
      const chart = PR_castNumber(ms, lat, lon, n);
      ok(chart.cusps[1] === kpNumberToLagna(n),
        `${name} #${n}: cusps[1] ${chart.cusps[1]} !== table ${kpNumberToLagna(n)}`);
    }
  }
}

console.log(`\n${fail === 0 ? '✓' : '✗'} sublord-boundary: ${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
```

- [ ] **Step 2: Run the gate to verify it fails**

```bash
export PATH="/opt/homebrew/bin:$PATH" && node validation/prashna-sublord-boundary.cjs
```

Expected: FAIL, roughly 1440 failures across the two sections (96/249 × 15 place-time combos on the first, plus every case on the second because `cusps[1]` is currently the round-tripped value).

- [ ] **Step 3: Add boundary tolerance to `PR_subOf` (frozen region)**

In `src/screens/PrashnaScreen.tsx`, replace lines 162–167:

```js
const PR_SUBS = PR_buildSubTable();
/* Boundary tolerance, in arcseconds. The 249 number method pins the ascendant
   EXACTLY at a sub-segment start; the tropical round-trip in PR_castNumber lands
   up to 8.5e-14 deg (3.1e-10 arcsec) below it, and a zero-tolerance half-open
   test then returns the PREVIOUS sub. 1e-6 arcsec is ~3000x the worst observed
   error and ~2.4e9x smaller than the shortest real sub (Sun, 2400 arcsec), so it
   can only ever resolve float noise -- never a genuine position. */
const PR_SUB_EPS = 1e-6;
function PR_subOf(sid) {
  const s = norm360(sid) * 3600;
  for (const r of PR_SUBS) if (s >= r.from - PR_SUB_EPS && s < r.to - PR_SUB_EPS) return r;
  return PR_SUBS[PR_SUBS.length - 1];
}
```

- [ ] **Step 4: Mirror the change in the reference engine**

In `validation/prashna-calc.js`, replace lines 229–233:

```js
/* Mirror of PR_subOf in src/screens/PrashnaScreen.tsx -- see the note there.
   These two MUST stay behaviourally identical; validation/prashna-parity.js
   proves it. */
const SUB_EPS = 1e-6; // arcsec
function subLordOf(sidLonDeg) {
  const s = ((sidLonDeg % 360) + 360) % 360 * 3600;
  for (const r of SUB_TABLE) if (s >= r.from - SUB_EPS && s < r.to - SUB_EPS) return r;
  return SUB_TABLE[SUB_TABLE.length - 1];
}
```

- [ ] **Step 5: Pin cusp 1 to the exact table degree (below frozen region)**

In `src/screens/PrashnaScreen.tsx`, replace line 350:

```js
  const cusps = trop.map((v, i) => i === 0 ? 0 : norm360(v - ayan)); // KP-New sidereal cusps
  /* The number DEFINES the nirayana ascendant. Converting it to tropical for the
     RAMC inversion and back is a lossy round-trip (up to 8.5e-14 deg), and the
     result is pinned at a sub boundary where that error is decisive. Take cusp 1
     from the table, not from the round-trip. Cusps 2-12 legitimately come from
     Placidus and are generic reals, so they keep the computed values. */
  cusps[1] = ascSid;
```

- [ ] **Step 6: Run the new gate to verify it passes**

```bash
export PATH="/opt/homebrew/bin:$PATH" && node validation/prashna-sublord-boundary.cjs
```

Expected: `✓ sublord-boundary: 3735 passed, 0 failed`

- [ ] **Step 7: Prove the frozen region is still at parity**

```bash
export PATH="/opt/homebrew/bin:$PATH" && node validation/prashna-parity.js src/screens/PrashnaScreen.tsx
```

Expected: PASS. The tolerance can only change a result for a longitude within `1e-6` arcsec of a boundary, which none of the six parity cases is.

- [ ] **Step 8: Run the rest of the Prashna gates**

```bash
export PATH="/opt/homebrew/bin:$PATH" && node validation/prashna-calc.js && node validation/prashna-249.cjs && node validation/prashna-249-chart.cjs
```

Expected: all PASS. `prashna-249-chart.cjs` asserts `|cusps[1] - kpNumberToLagna(n)| < 1e-6`; it is now exactly 0.

- [ ] **Step 9: Commit**

```bash
git add src/screens/PrashnaScreen.tsx validation/prashna-calc.js validation/prashna-sublord-boundary.cjs
git commit -m "fix(prashna): cusp-1 sub-lord fell into the previous sub for 96/249 numbers

The 249 method pins the ascendant exactly at a sub-segment start. PR_castNumber
reached it via a tropical round-trip landing up to 8.5e-14 deg below, and
PR_subOf's zero-tolerance half-open test then returned the previous sub --
flipping the verdict for 23/249 numbers on the cusp-1 topic. Adds a 1e-6 arcsec
boundary tolerance (mirrored in the reference engine) and takes cusp 1 from the
table instead of the round-trip.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 2: Stop the two sub-lord readouts contradicting each other (Defect A)

**Files:**
- Modify: `src/screens/PrashnaScreen.tsx:893-894` (the chip), `:982-983` (the card row), `:968` (`NumberSetBox` signature)
- Create: `validation/prashna-sublord-labels.cjs`

**Interfaces:**
- Consumes: `v.cuspSub` and `v.q.cusp` from `PR_judge` (Task 1); `info.subLord` from `kpNumberInfo`.
- Produces: `NumberSetBox({ info, favor, hi, cuspLabel })` — gains a required `cuspLabel` prop (the ordinal of the judged house, e.g. `"7th"` / `"7वें"`) so the card can name which cusp the *other* sub-lord belongs to. `englishOrdinal(n)` already exists in the file and is reused.

- [ ] **Step 1: Write the failing gate**

Create `validation/prashna-sublord-labels.cjs`:

```js
#!/usr/bin/env node
// ============================================================================
// validation/prashna-sublord-labels.cjs
//
// Two DIFFERENT quantities were both rendered as "Sub-lord", both glossed as
// the deciding one: the 249-table ASCENDANT sub-lord (answer card) and the
// live QUESTION-CUSP sub-lord (full-chart chip). They contradict each other in
// 82.5% of number x topic combinations. This gate is a source guard: each
// readout must name its own cusp, and only ONE may claim the deciding vote.
// ============================================================================
'use strict';
const fs = require('fs');
const path = require('path');

const SRC = path.resolve(__dirname, '..', 'src', 'screens', 'PrashnaScreen.tsx');
const src = fs.readFileSync(SRC, 'utf8');

let pass = 0, fail = 0;
const ok = (c, m) => { c ? pass++ : fail++; console.log(`${c ? 'PASS' : 'FAIL'}  ${m}`); };

// 1. No bare "Sub-lord" / "उप-स्वामी" label survives -- every one is qualified.
const bareEn = /label=\{[^}]*['"`]Sub[- ]?lord['"`]/g;
ok(!bareEn.test(src), 'no readout is labelled a bare "Sub-lord"');
const bareHi = /['"`]उप-स्वामी['"`]\s*\}/g;
ok(!bareHi.test(src), 'no readout is labelled a bare "उप-स्वामी"');

// 2. The ascendant sub-lord names the ascendant.
ok(/Ascendant sub-lord|लग्न उप-स्वामी/.test(src),
  'the 249-table sub-lord is labelled as the ASCENDANT sub-lord');

// 3. Exactly one readout claims the deciding vote.
const deciding = src.match(/deciding vote|final yes or no|निर्णायक मत|अंतिम निर्णय/g) || [];
ok(deciding.length <= 2,
  `at most one deciding-vote claim per language (found ${deciding.length} across both)`);

// 4. The ascendant sub-lord must NOT claim it -- KP gives the deciding vote to
//    the cuspal sub-lord of the house judged.
const cardBox = src.slice(src.indexOf('function NumberSetBox'));
ok(!/final yes or no|अंतिम निर्णय \(हाँ या नहीं\)/.test(cardBox),
  'the ascendant sub-lord no longer claims the final yes/no');

console.log(`\n${fail === 0 ? '✓' : '✗'} sublord-labels: ${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
```

- [ ] **Step 2: Run the gate to verify it fails**

```bash
export PATH="/opt/homebrew/bin:$PATH" && node validation/prashna-sublord-labels.cjs
```

Expected: FAIL on assertions 1, 2 and 4.

- [ ] **Step 3: Relabel the full-chart chip**

In `src/screens/PrashnaScreen.tsx`, replace lines 893–894:

```jsx
                <PrashnaChip
                  label={hi ? `${v.q.cusp} भाव उप-स्वामी` : `${englishOrdinal(v.q.cusp)} cusp sub-lord`}
                  value={hi ? GRAHA_HI[v.cuspSub] : GRAHA_EN[v.cuspSub]}
                  gloss={hi
                    ? 'जिस भाव पर प्रश्न है उसका सूक्ष्म स्वामी — कृष्णमूर्ति पद्धति में यही निर्णायक मत देता है'
                    : 'sub-lord of the house your question is about — in KP this is what casts the deciding vote'} />
```

- [ ] **Step 4: Relabel the answer-card row and name the other sub-lord**

In `src/screens/PrashnaScreen.tsx`, replace the `NumberSetBox` signature at line 968 and the sub row at lines 982–983:

```jsx
function NumberSetBox({ info, favor, hi, cuspLabel }) {
```

```jsx
      <NumRow label={hi ? 'लग्न उप-स्वामी · Ascendant sub lord' : 'Ascendant sub-lord'} value={sub}
        gloss={hi
          ? `प्रश्न सच्चा है या नहीं, यह इससे देखा जाता है। हाँ/नहीं का निर्णय ${cuspLabel} भाव के उप-स्वामी से होता है।`
          : `shows whether the question is genuine and ripens at all — the yes/no itself is read from the ${cuspLabel} cusp sub-lord`} />
```

- [ ] **Step 5: Pass the new prop at the call site**

Find the single `<NumberSetBox` usage and add `cuspLabel`:

```bash
export PATH="/opt/homebrew/bin:$PATH" && grep -n "<NumberSetBox" src/screens/PrashnaScreen.tsx
```

Add the prop to that element:

```jsx
                  cuspLabel={hi ? String(v.q.cusp) : englishOrdinal(v.q.cusp)}
```

- [ ] **Step 6: Run the gate to verify it passes**

```bash
export PATH="/opt/homebrew/bin:$PATH" && node validation/prashna-sublord-labels.cjs
```

Expected: `✓ sublord-labels: 5 passed, 0 failed`

- [ ] **Step 7: Run the copy and language gates**

```bash
export PATH="/opt/homebrew/bin:$PATH" && node validation/prashna-copy.cjs && node validation/hindi-devotional-language.cjs && node validation/parse-check.js src/kundli-app.tsx
```

Expected: all PASS.

- [ ] **Step 8: Commit**

```bash
git add src/screens/PrashnaScreen.tsx validation/prashna-sublord-labels.cjs
git commit -m "fix(prashna): two different sub-lords no longer share one label

The answer card showed the 249-table ASCENDANT sub-lord and the full-chart chip
showed the QUESTION-CUSP sub-lord, both labelled 'Sub-lord' and both glossed as
the deciding one. They contradict in 82.5% of number x topic combinations. Each
now names its own cusp, and per KP doctrine only the cuspal sub-lord of the
house judged claims the deciding vote.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 3: Tell the user why Cast is disabled

**Files:**
- Modify: `src/screens/PrashnaScreen.tsx:797-804`

**Interfaces:**
- Consumes: `selected`, `canAsk`, `numOutOfRange`, `mode`, `numberIsValid` (all existing local state at [PrashnaScreen.tsx:689-694](src/screens/PrashnaScreen.tsx:689)).
- Produces: nothing consumed downstream. Purely presentational.

- [ ] **Step 1: Add the blocking-reason derivation**

In `src/screens/PrashnaScreen.tsx`, immediately after line 694 (`const canAsk = …`):

```js
  /* The Cast button was disabled with no explanation whenever no topic was
     chosen -- a valid number plus a dead button and no hint. Name the one thing
     that is missing, in priority order. */
  const blockReason = !selected
    ? (hi ? 'ऊपर से प्रश्न का विषय चुनें' : 'Choose what your question is about, above')
    : (mode === 'number' && numberInput === '')
      ? (hi ? `1 से ${KP_NUMBER_MAX} के बीच एक अंक दें` : `Enter a number from 1 to ${KP_NUMBER_MAX}`)
      : numOutOfRange
        ? (hi ? `अंक 1 से ${KP_NUMBER_MAX} के बीच होना चाहिए` : `The number must be between 1 and ${KP_NUMBER_MAX}`)
        : null;
```

- [ ] **Step 2: Surface it under the button**

Replace lines 796–804 (the `) : (` … `)}` Cast-button branch) with:

```jsx
      ) : (
        <>
          <button onClick={ask} disabled={!canAsk || numOutOfRange}
            aria-describedby={blockReason ? 'pr-cast-block' : undefined}
            style={{ height: TOKENS.ctrlH, borderRadius: TOKENS.radius, width: '100%',
              border: 'none', background: (canAsk && !numOutOfRange) ? TOKENS.ink : TOKENS.line,
              color: (canAsk && !numOutOfRange) ? TOKENS.bg : TOKENS.muted, fontSize: 15, fontWeight: 600,
              cursor: (canAsk && !numOutOfRange) ? 'pointer' : 'default' }}>
            {mode === 'number' ? (hi ? 'उत्तर देखें' : 'Cast the answer') : (hi ? 'अभी पूछें' : 'Ask now')}
          </button>
          {blockReason && (
            <div id="pr-cast-block" role="status" style={{ marginTop: 6, fontSize: 12.5,
              color: TOKENS.muted, textAlign: 'center',
              fontFamily: hi ? TOKENS.devanagari : 'inherit' }}>
              {blockReason}
            </div>
          )}
        </>
      )}
```

- [ ] **Step 3: Verify in the browser**

Start the dev server via the Browser pane using launch config `kundli-dev` (never a raw shell), navigate to the Prashna screen, and confirm: with no topic selected the hint reads "Choose what your question is about, above"; selecting a topic in time mode clears it and enables the button; in number mode with a topic but no number it reads "Enter a number from 1 to 249".

- [ ] **Step 4: Run gates**

```bash
export PATH="/opt/homebrew/bin:$PATH" && node validation/parse-check.js src/kundli-app.tsx && node validation/prashna-copy.cjs && node validation/hindi-devotional-language.cjs
```

Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add src/screens/PrashnaScreen.tsx
git commit -m "fix(prashna): Cast button says why it is disabled

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 4: Expose place and time on the Prashna screen

KP horary is cast for the moment and place **of judgment**. A moderator judging from Kolkata, or judging a question received at a specific moment, currently has no control — the screen inherits `lat`/`lon`/`placeLabel` props and hardcodes `Date.now()` at [PrashnaScreen.tsx:656](src/screens/PrashnaScreen.tsx:656).

**Files:**
- Modify: `src/screens/PrashnaScreen.tsx:620-684` (state + `ask`), and insert the control block before the question chips at line 737

**Interfaces:**
- Consumes: props `lat`, `lon`, `placeLabel` (unchanged defaults).
- Produces: `castLat`, `castLon`, `castPlaceLabel`, `castMs` — the effective cast parameters. **Every later task reads the cast place/time from `result.chart` and `result.placeLabel`, never from the props.** `result` gains a `placeLabel: string` field.

- [ ] **Step 1: Add judgment-moment state**

In `src/screens/PrashnaScreen.tsx`, after line 630 (`const [locked, setLocked] = useState(false);`):

```js
  /* KP horary is cast for the moment and place of JUDGMENT. A moderator may be
     judging from a different city than the app's inherited place, or judging a
     question that arrived at a specific earlier moment. Default stays "here,
     now" so the lay flow is untouched; the override is opt-in. */
  const [useCustom, setUseCustom] = useState(false);
  const [customLat, setCustomLat] = useState(String(lat));
  const [customLon, setCustomLon] = useState(String(lon));
  const [customPlace, setCustomPlace] = useState(placeLabel);
  const [customWhen, setCustomWhen] = useState(''); // datetime-local, '' = now

  const numOr = (s, fallback) => {
    const n = Number(s);
    return Number.isFinite(n) ? n : fallback;
  };
  const castLat = useCustom ? numOr(customLat, lat) : lat;
  const castLon = useCustom ? numOr(customLon, lon) : lon;
  const castPlaceLabel = useCustom ? (customPlace.trim() || placeLabel) : placeLabel;
  const latValid = !useCustom || (numOr(customLat, NaN) >= -90 && numOr(customLat, NaN) <= 90);
  const lonValid = !useCustom || (numOr(customLon, NaN) >= -180 && numOr(customLon, NaN) <= 180);
  const placeValid = latValid && lonValid;
```

- [ ] **Step 2: Use the effective place/time in `ask`**

In `src/screens/PrashnaScreen.tsx`, replace line 656:

```js
      const ms = (useCustom && customWhen) ? new Date(customWhen).getTime() : Date.now();
      if (!Number.isFinite(ms)) {
        setError(hi ? 'निर्णय का समय समझ नहीं आया — कृपया पुनः चुनें।'
                    : "Couldn't read that judgment time — please pick it again.");
        return;
      }
```

Replace `lat, lon` with `castLat, castLon` at lines 671 and 676, and record the place on the result. Line 671–672 become:

```js
        const chart = PR_castNumber(ms, castLat, castLon, n);
        setResult({ chart, verdict: PR_judge(chart, q), askedAt: new Date(ms), mode: 'number',
          number: n, info: kpNumberInfo(n), placeLabel: castPlaceLabel });
```

Line 676–677 become:

```js
        const chart = PR_cast(ms, castLat, castLon);
        setResult({ chart, verdict: PR_judge(chart, q), askedAt: new Date(ms), mode: 'time',
          placeLabel: castPlaceLabel });
```

- [ ] **Step 3: Reset the cast when the effective place changes**

Replace line 650 so the existing F3 behaviour follows the *effective* place, not just the props:

```js
  useEffect(() => { setResult(null); setError(null); setLocked(false); },
    [castLat, castLon, castPlaceLabel]);
```

- [ ] **Step 4: Gate the Cast button on a valid place**

In the `canAsk` line (694), add the place validity:

```js
  const canAsk = selected && placeValid && (mode === 'time' || numberIsValid);
```

And extend `blockReason` from Task 3 — insert this branch immediately after the `!selected` branch:

```js
    : !placeValid
      ? (hi ? 'अक्षांश −90 से 90, देशान्तर −180 से 180 के बीच होना चाहिए'
            : 'Latitude must be −90 to 90 and longitude −180 to 180')
```

- [ ] **Step 5: Add the control block**

In `src/screens/PrashnaScreen.tsx`, insert immediately before the `{/* Question chips */}` comment at line 737:

```jsx
      {/* Moment & place of judgment. Collapsed by default -- the lay flow reads
          "here, now" and never opens this. KP practitioners need it because the
          horary chart belongs to the judgment, not to the app's inherited city. */}
      <div style={{ border: `1.5px solid ${TOKENS.line}`, borderRadius: TOKENS.radius,
        background: TOKENS.card, padding: '8px 10px', marginBottom: 4 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
          <input type="checkbox" checked={useCustom}
            onChange={e => { setUseCustom(e.target.checked); clearResult(); }} />
          <span style={{ fontSize: 13, fontFamily: hi ? TOKENS.devanagari : 'inherit' }}>
            {hi ? 'निर्णय का समय और स्थान स्वयं चुनें' : 'Set the judgment moment & place myself'}
          </span>
        </label>
        <div style={{ fontSize: 11.5, color: TOKENS.muted, marginTop: 3,
          fontFamily: hi ? TOKENS.devanagari : 'inherit' }}>
          {useCustom
            ? (hi ? 'कुण्डली इसी क्षण और स्थान के लिए बनेगी।' : 'The chart will be cast for exactly this moment and place.')
            : (hi ? `अभी: ${placeLabel} · इसी क्षण` : `Now: ${placeLabel} · this moment`)}
        </div>
        {useCustom && (
          <div style={{ display: 'grid', gap: 6, marginTop: 8 }}>
            <input value={customPlace} onChange={e => { setCustomPlace(e.target.value); clearResult(); }}
              aria-label={hi ? 'स्थान का नाम' : 'Place name'}
              placeholder={hi ? 'स्थान का नाम' : 'Place name'}
              style={{ height: TOKENS.ctrlH, borderRadius: TOKENS.radius, boxSizing: 'border-box',
                border: `1.5px solid ${TOKENS.line}`, background: TOKENS.bg, color: TOKENS.ink,
                fontSize: 14, padding: '0 10px' }} />
            <div style={{ display: 'flex', gap: 6 }}>
              <input inputMode="decimal" value={customLat}
                onChange={e => { setCustomLat(e.target.value); clearResult(); }}
                aria-label={hi ? 'अक्षांश' : 'Latitude'} placeholder={hi ? 'अक्षांश' : 'Latitude'}
                style={{ flex: 1, minWidth: 0, height: TOKENS.ctrlH, borderRadius: TOKENS.radius,
                  boxSizing: 'border-box', background: TOKENS.bg, color: TOKENS.ink, fontSize: 14,
                  padding: '0 10px', border: `1.5px solid ${latValid ? TOKENS.line : TOKENS.sindoor}` }} />
              <input inputMode="decimal" value={customLon}
                onChange={e => { setCustomLon(e.target.value); clearResult(); }}
                aria-label={hi ? 'देशान्तर' : 'Longitude'} placeholder={hi ? 'देशान्तर' : 'Longitude'}
                style={{ flex: 1, minWidth: 0, height: TOKENS.ctrlH, borderRadius: TOKENS.radius,
                  boxSizing: 'border-box', background: TOKENS.bg, color: TOKENS.ink, fontSize: 14,
                  padding: '0 10px', border: `1.5px solid ${lonValid ? TOKENS.line : TOKENS.sindoor}` }} />
            </div>
            <input type="datetime-local" value={customWhen}
              onChange={e => { setCustomWhen(e.target.value); clearResult(); }}
              aria-label={hi ? 'निर्णय का समय' : 'Judgment time'}
              style={{ height: TOKENS.ctrlH, borderRadius: TOKENS.radius, boxSizing: 'border-box',
                border: `1.5px solid ${TOKENS.line}`, background: TOKENS.bg, color: TOKENS.ink,
                fontSize: 14, padding: '0 10px' }} />
            <div style={{ fontSize: 11, color: TOKENS.muted, fontStyle: 'italic' }}>
              {hi ? 'समय खाली छोड़ें तो अभी का क्षण लिया जाएगा। समय आपके उपकरण के समयक्षेत्र में पढ़ा जाता है।'
                  : 'Leave the time blank to use this moment. Time is read in your device’s timezone.'}
            </div>
          </div>
        )}
      </div>
```

- [ ] **Step 6: Make the disclosure line use the cast place**

Replace `placeLabel` with `result.placeLabel` at lines 844 and 845 so the "Cast for … at …" disclosure names the place actually judged rather than the inherited one.

- [ ] **Step 7: Verify in the browser**

Via the Browser pane (`kundli-dev`): tick the override, set Kolkata `22.5726 / 88.3639` and a past datetime, cast #108 on Marriage, and confirm the disclosure line reads that place and that exact time — not "New Delhi · now". Untick and confirm the lay flow is unchanged.

- [ ] **Step 8: Run gates**

```bash
export PATH="/opt/homebrew/bin:$PATH" && node validation/parse-check.js src/kundli-app.tsx && node validation/prashna-parity.js src/screens/PrashnaScreen.tsx && node validation/prashna-copy.cjs && node validation/hindi-devotional-language.cjs
```

Expected: all PASS.

- [ ] **Step 9: Commit**

```bash
git add src/screens/PrashnaScreen.tsx
git commit -m "feat(prashna): judgment moment and place are settable on the screen

KP horary is cast for the moment and place of judgment; the screen inherited the
app's city and hardcoded now. Adds an opt-in override that leaves the lay flow
at 'here, now'.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 5: Practitioner view — 12 cuspal sub-lords, significator grid, chart-first

A KP practitioner audits a verdict through **all twelve cuspal sub-lords** plus the **significator grid**, not through prose about houses 2·7·11. This task adds both, and a view toggle that demotes the devotee voice for that audience without removing it for the lay one.

**Files:**
- Modify: `src/screens/PrashnaScreen.tsx` — add `PR_cuspalTable` and `PR_significatorGrid` below `PR_castNumber` (after line 367); add `CuspalTable` and `SignificatorGrid` components; add the view toggle; extend the export list at line 996
- Create: `validation/prashna-practitioner.cjs`

**Interfaces:**
- Consumes: `chart` from `PR_cast` / `PR_castNumber` — specifically `chart.cusps[1..12]`, `chart.planets[]` with `{ key, star, house }`; module constants `PR_SIGN_LORD`, `PR_subOf`, `PR_nakOf`.
- Produces:
  - `PR_cuspalTable(chart) → Array<{ house: number, lon: number, sign: number, deg: number, nak: {idx,pada,en}, star: string, sub: string }>` — exactly 12 entries, `house` 1..12 in order.
  - `PR_significatorGrid(chart) → Array<{ house: number, A: string[], B: string[], C: string[], D: string[], all: string[] }>` — exactly 12 entries. `A` = planets in the star of an occupant of that house; `B` = occupants; `C` = planets in the star of the house's owner; `D` = the owner. `all` is A∪B∪C∪D, deduped, in `Su Mo Ma Me Ju Ve Sa Ra Ke` order.
  - Both are exported for the gate: `export { …, PR_cuspalTable, PR_significatorGrid }`.

- [ ] **Step 1: Write the failing gate**

Create `validation/prashna-practitioner.cjs`:

```js
#!/usr/bin/env node
// ============================================================================
// validation/prashna-practitioner.cjs
//
// A KP practitioner audits a verdict via all 12 cuspal sub-lords plus the
// significator grid. This gate proves both derivations against the chart they
// come from -- not against a golden file, so it stays true as the sky moves.
// ============================================================================
'use strict';
const { loadApp } = require('./_load-app.cjs');

const scr = loadApp('src/screens/PrashnaScreen.tsx');
const { PR_cast, PR_castNumber, PR_cuspalTable, PR_significatorGrid } = scr;

let pass = 0, fail = 0;
const ok = (c, m) => { c ? pass++ : fail++; console.log(`${c ? 'PASS' : 'FAIL'}  ${m}`); };

const IST = (y, mo, d, h, mi) => Date.UTC(y, mo - 1, d, h, mi) - 330 * 60000;
const ms = IST(2026, 7, 24, 15, 30);
const CHARTS = [
  ['time/Delhi',   PR_cast(ms, 28.6139, 77.2090)],
  ['num108/Delhi', PR_castNumber(ms, 28.6139, 77.2090, 108)],
  ['num1/London',  PR_castNumber(ms, 51.5074, -0.1278, 1)],
  ['num249/Chennai', PR_castNumber(ms, 13.0827, 80.2707, 249)],
];
const ORDER = ['Su','Mo','Ma','Me','Ju','Ve','Sa','Ra','Ke'];

for (const [label, chart] of CHARTS) {
  console.log(`--- ${label} ---`);

  const cusp = PR_cuspalTable(chart);
  ok(cusp.length === 12, `${label}: cuspal table has 12 rows (got ${cusp.length})`);
  ok(cusp.every((r, i) => r.house === i + 1), `${label}: houses are 1..12 in order`);
  ok(cusp.every(r => r.lon === chart.cusps[r.house]),
    `${label}: every row's lon is the chart's own cusp longitude`);
  ok(cusp.every(r => r.sign === Math.floor(r.lon / 30) && Math.abs(r.deg - (r.lon % 30)) < 1e-9),
    `${label}: sign/deg are consistent with lon`);
  ok(cusp.every(r => ORDER.includes(r.star) && ORDER.includes(r.sub)),
    `${label}: every star/sub is a known graha key`);

  const grid = PR_significatorGrid(chart);
  ok(grid.length === 12, `${label}: significator grid has 12 rows (got ${grid.length})`);
  ok(grid.every((r, i) => r.house === i + 1), `${label}: grid houses are 1..12 in order`);

  // B must be exactly the planets whose house field equals that house.
  ok(grid.every(r => {
    const want = chart.planets.filter(p => p.house === r.house).map(p => p.key).sort();
    return JSON.stringify(r.B.slice().sort()) === JSON.stringify(want);
  }), `${label}: group B == the actual occupants of each house`);

  // A must be exactly the planets whose star lord is an occupant.
  ok(grid.every(r => {
    const want = chart.planets.filter(p => r.B.includes(p.star)).map(p => p.key).sort();
    return JSON.stringify(r.A.slice().sort()) === JSON.stringify(want);
  }), `${label}: group A == planets in the star of an occupant`);

  // C must be exactly the planets whose star lord is the house owner.
  ok(grid.every(r => {
    const want = chart.planets.filter(p => r.D.includes(p.star)).map(p => p.key).sort();
    return JSON.stringify(r.C.slice().sort()) === JSON.stringify(want);
  }), `${label}: group C == planets in the star of the house owner`);

  ok(grid.every(r => r.D.length === 1 && ORDER.includes(r.D[0])),
    `${label}: group D is exactly one owning graha per house`);

  // `all` is the deduped union, in canonical order.
  ok(grid.every(r => {
    const want = ORDER.filter(k => r.A.includes(k) || r.B.includes(k) || r.C.includes(k) || r.D.includes(k));
    return JSON.stringify(r.all) === JSON.stringify(want);
  }), `${label}: 'all' is the deduped A∪B∪C∪D in canonical order`);

  // Every graha signifies at least one house -- an empty grid means a broken join.
  const covered = new Set(grid.flatMap(r => r.all));
  ok(covered.size === 9, `${label}: all 9 grahas appear somewhere in the grid (got ${covered.size})`);
}

console.log(`\n${fail === 0 ? '✓' : '✗'} practitioner: ${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
```

- [ ] **Step 2: Run the gate to verify it fails**

```bash
export PATH="/opt/homebrew/bin:$PATH" && node validation/prashna-practitioner.cjs
```

Expected: FAIL — `TypeError: PR_cuspalTable is not a function`.

- [ ] **Step 3: Implement the two derivations**

In `src/screens/PrashnaScreen.tsx`, insert after line 367 (immediately after `PR_castNumber`'s closing brace):

```js
/* ---- Practitioner derivations. Pure, below the frozen engine, reusing the
   same PR_subOf / PR_SIGN_LORD the verdict uses -- so the table an astrologer
   audits is literally the data the judgment ran on, not a parallel model. ---- */

const PR_GRAHA_ORDER = ['Su','Mo','Ma','Me','Ju','Ve','Sa','Ra','Ke'];

/* All twelve cuspal sub-lords. KP judges a question through the sub-lord of the
   relevant cusp; a practitioner needs the whole set to audit the verdict. */
function PR_cuspalTable(chart) {
  const rows = [];
  for (let h = 1; h <= 12; h++) {
    const lon = chart.cusps[h];
    const sl = PR_subOf(lon);
    rows.push({ house: h, lon, sign: Math.floor(lon / 30), deg: lon % 30,
      nak: PR_nakOf(lon), star: sl.star, sub: sl.sub });
  }
  return rows;
}

/* The standard KP four-fold significator grid for each house:
     A  planets in the star of an occupant of the house
     B  occupants of the house
     C  planets in the star of the house's owner
     D  the owner (lord of the sign the cusp falls in)
   Rahu/Ketu are listed on their own star-lord footing like any other graha; the
   agency-by-conjunction refinement is deliberately NOT applied here, because the
   verdict engine does not apply it either and the grid must mirror the engine. */
function PR_significatorGrid(chart) {
  const rows = [];
  for (let h = 1; h <= 12; h++) {
    const B = chart.planets.filter(p => p.house === h).map(p => p.key);
    const D = [PR_SIGN_LORD[Math.floor(chart.cusps[h] / 30)]];
    const A = chart.planets.filter(p => B.includes(p.star)).map(p => p.key);
    const C = chart.planets.filter(p => D.includes(p.star)).map(p => p.key);
    const all = PR_GRAHA_ORDER.filter(k =>
      A.includes(k) || B.includes(k) || C.includes(k) || D.includes(k));
    rows.push({ house: h, A, B, C, D, all });
  }
  return rows;
}
```

- [ ] **Step 4: Export them for the gate**

Replace line 996:

```js
export { PR_cast, PR_castNumber, PR_judge, QUESTIONS, PR_kpNewAyan, PR_cuspalTable, PR_significatorGrid };
```

- [ ] **Step 5: Run the gate to verify it passes**

```bash
export PATH="/opt/homebrew/bin:$PATH" && node validation/prashna-practitioner.cjs
```

Expected: `✓ practitioner: 48 passed, 0 failed`

- [ ] **Step 6: Commit the derivations before touching the UI**

```bash
git add src/screens/PrashnaScreen.tsx validation/prashna-practitioner.cjs
git commit -m "feat(prashna): cuspal sub-lord table and KP four-fold significator grid

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

- [ ] **Step 7: Add the two presentational components**

In `src/screens/PrashnaScreen.tsx`, insert immediately before `function PrashnaChip` (line 943):

```jsx
/* Both tables are intrinsically wider than a 320px phone, so each scrolls inside
   its own container rather than widening the page (same rule as the graha table). */
const PR_SCROLLER = { overflowX: 'auto', WebkitOverflowScrolling: 'touch' };
const PR_TH = { padding: '4px 6px', textAlign: 'left', whiteSpace: 'nowrap' };
const PR_TD = { padding: '5px 6px', whiteSpace: 'nowrap' };

function CuspalTable({ chart, hi, judgedCusp }) {
  const rows = PR_cuspalTable(chart);
  return (
    <div style={{ marginTop: 14 }}>
      <div style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase',
        color: TOKENS.muted, marginBottom: 6 }}>
        {hi ? 'बारहों भावों के उप-स्वामी' : 'All twelve cuspal sub-lords'}
      </div>
      <div style={PR_SCROLLER}>
        <table style={{ width: '100%', minWidth: 320, borderCollapse: 'collapse', fontSize: 12.5 }}>
          <thead>
            <tr style={{ color: TOKENS.muted }}>
              <th style={PR_TH}>{hi ? 'भाव' : 'Cusp'}</th>
              <th style={PR_TH}>{hi ? 'राशि' : 'Sign'}</th>
              <th style={PR_TH}>{hi ? 'नक्षत्र' : 'Nakshatra'}</th>
              <th style={PR_TH}>{hi ? 'तारा' : 'Star'}</th>
              <th style={PR_TH}>{hi ? 'उप' : 'Sub'}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => {
              const on = r.house === judgedCusp;
              return (
                <tr key={r.house} style={{ borderTop: `1px solid ${TOKENS.line}`,
                  background: on ? TOKENS.goldSoft : 'transparent' }}>
                  <td style={{ ...PR_TD, fontWeight: on ? 700 : 400 }}>{r.house}</td>
                  <td style={PR_TD}>{(hi ? RASHI_HI : RASHI_EN)[r.sign]} {fmtDeg(r.deg)}</td>
                  <td style={PR_TD}>{(hi ? NAK_HI[r.nak.idx] : r.nak.en)}-{r.nak.pada}</td>
                  <td style={PR_TD}>{(hi ? GRAHA_HI : GRAHA_EN)[r.star]}</td>
                  <td style={{ ...PR_TD, fontWeight: on ? 700 : 400 }}>
                    {(hi ? GRAHA_HI : GRAHA_EN)[r.sub]}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <Gloss>
        {hi ? `हाइलाइट की गई पंक्ति वह भाव है जिस पर यह प्रश्न विचारा गया (${judgedCusp})। उसी का उप-स्वामी निर्णय देता है।`
            : `The highlighted row is the cusp this question was judged on (${judgedCusp}). Its sub-lord is what decides.`}
      </Gloss>
    </div>
  );
}

function SignificatorGrid({ chart, hi }) {
  const rows = PR_significatorGrid(chart);
  const nm = k => (hi ? GRAHA_HI : GRAHA_EN)[k];
  const cell = list => list.length ? list.map(nm).join(', ') : '—';
  return (
    <div style={{ marginTop: 14 }}>
      <div style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase',
        color: TOKENS.muted, marginBottom: 6 }}>
        {hi ? 'भाव-कारक सारणी' : 'Significators'}
      </div>
      <div style={PR_SCROLLER}>
        <table style={{ width: '100%', minWidth: 340, borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ color: TOKENS.muted }}>
              <th style={PR_TH}>{hi ? 'भाव' : 'H'}</th>
              <th style={PR_TH}>A</th><th style={PR_TH}>B</th>
              <th style={PR_TH}>C</th><th style={PR_TH}>D</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.house} style={{ borderTop: `1px solid ${TOKENS.line}` }}>
                <td style={{ ...PR_TD, fontWeight: 600 }}>{r.house}</td>
                <td style={PR_TD}>{cell(r.A)}</td>
                <td style={PR_TD}>{cell(r.B)}</td>
                <td style={PR_TD}>{cell(r.C)}</td>
                <td style={PR_TD}>{cell(r.D)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Gloss>
        {hi ? 'A = भाव में स्थित ग्रह के नक्षत्र में बैठे ग्रह · B = भाव में स्थित ग्रह · C = भावेश के नक्षत्र में बैठे ग्रह · D = भावेश। कृष्णमूर्ति पद्धति का चतुर्विध क्रम, बलक्रम में।'
            : 'A = planets in the star of an occupant · B = occupants · C = planets in the star of the house owner · D = the owner. The KP four-fold order, strongest first.'}
      </Gloss>
    </div>
  );
}
```

- [ ] **Step 8: Add the view toggle**

In `src/screens/PrashnaScreen.tsx`, add beside the `showFull` state (line 627):

```js
  /* Chart-first is the astrologer's reading order: the chart and the cuspal
     tables lead, and the plain-language verdict collapses to a secondary line.
     Answer-first stays the default -- the lay devotee flow is unchanged. */
  const [chartFirst, setChartFirst] = useState(false);
```

Insert this control immediately after the `<PrashnaSecHead hiMode={hi} />` line (699):

```jsx
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
        <button onClick={() => { setChartFirst(f => !f); setShowFull(true); }}
          aria-pressed={chartFirst}
          style={{ minHeight: 32, padding: '4px 10px', borderRadius: TOKENS.radius,
            border: `1.5px solid ${chartFirst ? TOKENS.gold : TOKENS.line}`,
            background: chartFirst ? TOKENS.goldSoft : TOKENS.card, color: TOKENS.ink,
            fontSize: 12, cursor: 'pointer', fontFamily: hi ? TOKENS.devanagari : 'inherit' }}>
          {chartFirst ? (hi ? 'सामान्य दृश्य' : 'Plain view')
                      : (hi ? 'ज्योतिषी दृश्य' : 'Astrologer view')}
        </button>
      </div>
```

- [ ] **Step 9: Render the tables and demote the verdict prose in chart-first mode**

Inside the `{showFull && (…)}` block, immediately after the closing `</div>` of the graha-table `Gloss` wrapper (currently line 934), add:

```jsx
              <CuspalTable chart={result.chart} hi={hi} judgedCusp={v.q.cusp} />
              <SignificatorGrid chart={result.chart} hi={hi} />
```

Then make the tier-1 verdict prose secondary when `chartFirst` is on. The tier-1 verdict card is **exactly lines 815–856**: the element opening

```jsx
          <div style={{ background: TOKENS.card, borderRadius: TOKENS.radius,
            border: `1.5px solid ${vs.color}`, overflow: 'hidden' }}>
```

at line 815, closing with its matching `</div>` at line 856. It holds the verdict badge, the `buildPlain(v, lang)` prose, the cast-disclosure `Gloss`, and — in number mode — `NumberSetBox` and the KP-ayanamsa note.

Do **not** move or duplicate it; keep exactly one copy. Extract it into a local, declared immediately before the `return (` at line 696:

```jsx
  /* One copy of the verdict card, placed by `chartFirst`: leading for the lay
     devotee flow, tucked behind a disclosure for the astrologer flow. */
  const verdictCard = (
    /* lines 815-856 verbatim, unchanged */
  );
```

Then replace lines 815–856 in the JSX with:

```jsx
          {chartFirst ? (
            <details style={{ border: `1.5px solid ${TOKENS.line}`,
              borderRadius: TOKENS.radius, background: TOKENS.card, padding: '8px 10px' }}>
              <summary style={{ cursor: 'pointer', fontSize: 13, color: TOKENS.muted,
                fontFamily: hi ? TOKENS.devanagari : 'inherit' }}>
                {hi ? 'सरल भाषा में उत्तर' : 'Plain-language reading'}
              </summary>
              <div style={{ marginTop: 10 }}>{verdictCard}</div>
            </details>
          ) : verdictCard}
```

`verdictCard` dereferences `vs`, `v`, `result` and `isNum`, all of which are already computed at lines 686–688 and are non-null whenever this branch renders (the enclosing guard at line 812 is `result && !error && result.mode === mode`). Declaring it at line 696 is therefore safe — but it evaluates unconditionally, so guard it:

```jsx
  const verdictCard = !v ? null : (
```

The chart is already forced open in chart-first mode — the toggle in Step 8 calls `setShowFull(true)`.

- [ ] **Step 10: Verify in the browser**

Via the Browser pane (`kundli-dev`) at 320px width: cast #108 on Marriage, switch to Astrologer view, and confirm — the chart opens automatically; the 12-row cuspal table renders with row 7 highlighted; the significator grid shows four populated columns; the plain-language reading is collapsed behind a `<details>`; both tables scroll horizontally *inside their own containers* while the page body does not scroll sideways.

- [ ] **Step 11: Run gates**

```bash
export PATH="/opt/homebrew/bin:$PATH" && node validation/parse-check.js src/kundli-app.tsx && node validation/prashna-parity.js src/screens/PrashnaScreen.tsx && node validation/prashna-practitioner.cjs && node validation/prashna-copy.cjs && node validation/hindi-devotional-language.cjs && node validation/hindi-worship-glossary.cjs
```

Expected: all PASS.

- [ ] **Step 12: Commit**

```bash
git add src/screens/PrashnaScreen.tsx
git commit -m "feat(prashna): astrologer view with 12 cuspal sub-lords and significator grid

Chart-first reading order for practitioners; the devotee answer-first voice
stays the default and collapses to a secondary line rather than disappearing.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 6: Shareable chart card

A moderator dropping Ganak's working into the group is the distribution mechanism. The card must be self-contained, legible at phone-screenshot size, and carry the disclosures an astrologer checks (ayanamsa, node type, house system, cast moment and place).

**Files:**
- Modify: `src/screens/PrashnaScreen.tsx` — add `PR_shareCardCanvas` below `PR_significatorGrid`, and a Share button in the result block

**Interfaces:**
- Consumes: `result` (`{ chart, verdict, askedAt, mode, number, placeLabel }`), `PR_cuspalTable`.
- Produces: `PR_shareCardCanvas(result, hi) → HTMLCanvasElement` — 1080×1350 (4:5, the safest aspect for chat previews). No DOM dependency beyond `document.createElement('canvas')`.

- [ ] **Step 1: Implement the canvas renderer**

In `src/screens/PrashnaScreen.tsx`, insert after `PR_significatorGrid`:

```js
/* Self-contained share card. Canvas rather than DOM-to-image so it needs no
   external library and no CSP-relevant network fetch; 1080x1350 (4:5) is the
   aspect chat clients preview without cropping the disclosures. */
function PR_shareCardCanvas(result, hi) {
  const W = 1080, H = 1350, PAD = 64;
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const g = cv.getContext('2d');
  const font = (px, weight) => `${weight || 400} ${px}px -apple-system, "Segoe UI", sans-serif`;

  g.fillStyle = '#FBF7EF'; g.fillRect(0, 0, W, H);
  g.fillStyle = '#B8860B'; g.fillRect(0, 0, W, 10);

  let y = PAD + 40;
  g.fillStyle = '#2A2419'; g.font = font(52, 700);
  g.fillText(hi ? 'प्रश्न कुण्डली' : 'Prashna chart', PAD, y);

  y += 46; g.font = font(26); g.fillStyle = '#7A6E58';
  const q = hi ? result.verdict.q.hi : result.verdict.q.en;
  const modeTxt = result.mode === 'number'
    ? (hi ? `कृष्णमूर्ति पद्धति अंक ${result.number}` : `KP number method · #${result.number}`)
    : (hi ? 'समय आधारित होरारी' : 'Time-based horary');
  g.fillText(`${q} · ${modeTxt}`, PAD, y);

  y += 56; g.strokeStyle = '#E3DACA'; g.lineWidth = 2;
  g.beginPath(); g.moveTo(PAD, y); g.lineTo(W - PAD, y); g.stroke();

  // Lagna + the deciding cuspal sub-lord -- the two numbers an astrologer reads first.
  y += 54; g.fillStyle = '#2A2419'; g.font = font(30, 600);
  const L = result.chart.lagna;
  g.fillText(`${hi ? 'लग्न' : 'Lagna'}: ${(hi ? RASHI_HI : RASHI_EN)[L.sign]} ${fmtDeg(L.deg)}  ·  ${(hi ? NAK_HI[L.nak.idx] : L.nak.en)}-${L.nak.pada}`, PAD, y);
  y += 42; g.fillStyle = '#9B2C2C';
  g.fillText(`${result.verdict.q.cusp}${hi ? ' भाव उप-स्वामी' : ' cusp sub-lord'}: ${(hi ? GRAHA_HI : GRAHA_EN)[result.verdict.cuspSub]}`, PAD, y);

  // Twelve cuspal sub-lords, two columns of six.
  y += 58; g.fillStyle = '#7A6E58'; g.font = font(22, 600);
  g.fillText(hi ? 'बारहों भावों के उप-स्वामी' : 'CUSPAL SUB-LORDS', PAD, y);
  y += 12;
  const rows = PR_cuspalTable(result.chart);
  g.font = font(24); const colW = (W - PAD * 2) / 2, rowH = 42;
  rows.forEach((r, i) => {
    const col = i < 6 ? 0 : 1, row = i % 6;
    const x = PAD + col * colW, ry = y + 38 + row * rowH;
    g.fillStyle = r.house === result.verdict.q.cusp ? '#9B2C2C' : '#2A2419';
    g.font = font(24, r.house === result.verdict.q.cusp ? 700 : 400);
    g.fillText(`${String(r.house).padStart(2, ' ')}  ${(hi ? RASHI_HI : RASHI_EN)[r.sign]} — ${(hi ? GRAHA_HI : GRAHA_EN)[r.sub]}`, x, ry);
  });
  y += 38 + rowH * 6;

  // Disclosures -- the transparency astrologers actually check.
  y += 28; g.strokeStyle = '#E3DACA';
  g.beginPath(); g.moveTo(PAD, y); g.lineTo(W - PAD, y); g.stroke();
  y += 36; g.font = font(21); g.fillStyle = '#7A6E58';
  const lines = [
    `${hi ? 'समय' : 'Cast'}: ${result.askedAt.toLocaleString(hi ? 'hi-IN' : undefined)}`,
    `${hi ? 'स्थान' : 'Place'}: ${result.placeLabel}`,
    `${hi ? 'अयनांश' : 'Ayanamsa'}: ${result.mode === 'number' ? 'KP-New' : 'Lahiri'} · ${hi ? 'मध्यम राहु/केतु' : 'mean Rahu/Ketu'}`,
    `${hi ? 'भाव' : 'Houses'}: ${result.chart.system === 'placidus' ? 'Placidus' : 'Equal (high-latitude fallback)'}`,
    `${hi ? 'सन्दर्भ' : 'Source'}: K.S. Krishnamurti, KP Reader VI`,
  ];
  lines.forEach((t, i) => g.fillText(t, PAD, y + i * 32));

  g.font = font(26, 700); g.fillStyle = '#B8860B';
  g.fillText('Ganak · ganak.pages.dev', PAD, H - PAD);
  return cv;
}
```

- [ ] **Step 2: Add the Share button**

In `src/screens/PrashnaScreen.tsx`, add beside the "Full Prashna chart" button (after line 868):

```jsx
          <button onClick={async () => {
            try {
              const cv = PR_shareCardCanvas(result, hi);
              const blob = await new Promise(res => cv.toBlob(res, 'image/png'));
              const file = new File([blob], 'ganak-prashna.png', { type: 'image/png' });
              if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({ files: [file] });
              } else {
                // Desktop and older browsers: download instead of share.
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url; a.download = 'ganak-prashna.png'; a.click();
                URL.revokeObjectURL(url);
              }
            } catch (e) {
              if (typeof console !== 'undefined') console.error('share card failed:', e);
            }
          }}
            style={{ marginTop: 8, height: TOKENS.ctrlH, borderRadius: TOKENS.radius, width: '100%',
              border: `1.5px solid ${TOKENS.gold}`, background: TOKENS.card, color: TOKENS.ink,
              fontSize: 14, cursor: 'pointer', fontFamily: hi ? TOKENS.devanagari : 'inherit' }}>
            {hi ? 'कुण्डली कार्ड साझा करें' : 'Share chart card'}
          </button>
```

- [ ] **Step 3: Verify in the browser**

Via the Browser pane (`kundli-dev`): cast #108 on Marriage, tap **Share chart card**, and confirm a PNG downloads. Open it and check: the 7th row is highlighted in both the header line and the cuspal list; the four disclosure lines are present and correct; the Ganak wordmark is legible; nothing is clipped at the edges. Repeat in Hindi and confirm Devanagari renders rather than falling back to boxes — if it does fall back, add `TOKENS.devanagari`'s family to the canvas font stack and re-check.

- [ ] **Step 4: Run gates**

```bash
export PATH="/opt/homebrew/bin:$PATH" && node validation/parse-check.js src/kundli-app.tsx && node validation/prashna-parity.js src/screens/PrashnaScreen.tsx && node validation/prashna-copy.cjs && node validation/hindi-devotional-language.cjs
```

Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add src/screens/PrashnaScreen.tsx
git commit -m "feat(prashna): shareable chart card with full disclosures

Canvas-rendered 4:5 PNG carrying lagna, the deciding cuspal sub-lord, all twelve
cuspal sub-lords, and the ayanamsa/node/house-system/source disclosures, with
Ganak branding. Web Share where available, download fallback otherwise.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Ship gate

Before this surface goes to the moderators, all of these must be true:

```bash
export PATH="/opt/homebrew/bin:$PATH" && node validation/parse-check.js src/kundli-app.tsx && node validation/prashna-parity.js src/screens/PrashnaScreen.tsx && node validation/prashna-calc.js && node validation/prashna-249.cjs && node validation/prashna-249-chart.cjs && node validation/prashna-sublord-boundary.cjs && node validation/prashna-sublord-labels.cjs && node validation/prashna-practitioner.cjs && node validation/prashna-copy.cjs && node validation/hindi-devotional-language.cjs && node validation/hindi-worship-glossary.cjs
```

Plus one human gate that no script can cover: **owner or moderator ratification that the cuspal sub-lord of the judged house — not the ascendant sub-lord — is the one Ganak calls decisive.** Task 2 implements standard KP doctrine, but it changes which planet the app names as deciding, and that is the claim the audience will check first.

---

## Open items deliberately not in scope

- **Ruling planets.** A KP practitioner cross-checks a horary verdict against the ruling planets of the judgment moment. `computeRulingPlanets` exists in `src/engine/dasha.ts` and is reserved by `CODEX-P0-RULING-PLANETS-RULEMAP-36`. Wiring it into Prashna would collide with that row — coordinate before attempting it.
- **Four-fold significator refinements.** Rahu/Ketu agency by conjunction and dispositor, and the strength ordering within each group, are not applied. The grid deliberately mirrors what the verdict engine actually uses; refining the grid without refining the engine would make the audit trail lie.
- **Sub-sub (nakshatra→sub→sub-sub) resolution.** `subLordChain` in `src/engine/dasha.ts` computes it, but the Prashna verdict does not read it, so displaying it would imply a precision the judgment does not have.
