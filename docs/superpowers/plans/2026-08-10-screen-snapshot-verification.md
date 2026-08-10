# Screen Snapshot Verification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every screen's rendered text, in both languages, reviewable as a committed baseline so a shared change is verified by reading a diff instead of opening the app.

**Architecture:** Two tiers, no new dependencies. Tier A renders each screen's initial state with `react-dom/server`'s `renderToStaticMarkup` (React is already a runtime dependency) and strips markup to visible text. Tier B, for surfaces that only populate after user interaction, composes the real engine with the real display helpers at pinned inputs. Both run under a frozen clock so output is byte-identical on re-run. A gate diffs fresh output against committed baselines.

**Tech Stack:** Node CJS gates, `validation/_load-app.cjs` (esbuild TSX bundler, already present), `react-dom/server`, `node:assert`. **No new packages.**

## Global Constraints

- **Zero new dependencies.** `react`, `react-dom`, `typescript`, `vite`, `sharp` only. A browser driver was deliberately removed from this repo (`plans/cursor-open-reassignment-audit.md:43`); do not reintroduce one.
- **No golden files for sky-derived values against real time.** Freeze the clock instead. Rule source: `validation/prashna-practitioner.cjs` header.
- **Gate style:** plain `.cjs` in `validation/`, run as `node validation/<name>.cjs`, exit non-zero on failure, print a single `✓ <name>: …` line on success.
- **Node/npm are at `/opt/homebrew/bin`** — prefix commands with `export PATH="/opt/homebrew/bin:$PATH"`.
- **Never write outside the repo.** Temp files go in `.scratch/`.
- **Fixed fixture** (already the de facto fixture across this repo's evidence): Mumbai, lat `19.076`, lon `72.8777`, tz `5.5`, birth `1990-06-15 08:30`, ayanamsa `lahiri`.
- **Frozen clock:** `2026-08-10T06:00:00Z` (`Date.UTC(2026, 7, 10, 6, 0, 0)` = `1786680000000`).
- **Honest scope:** this proves text, never layout. Every success message must say so.

---

### Task 1: Deterministic snapshot environment

**Files:**
- Create: `validation/_snapshot-env.cjs`
- Test: `validation/screen-snapshots.cjs` (created in Task 4; for now test inline per steps below)

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `FIXED_NOW: number` — `1786680000000`
  - `FIXTURE: { lat: number, lon: number, tz: number, zone: string, y, m, day, hh, mi, ayanamsa }`
  - `freezeClock(): void` — must be called BEFORE any `loadApp()` in the process
  - `PLACE: { name, lat, lon, zone }` — the prop shape screens expect

- [ ] **Step 1: Write the failing test**

Create `.scratch/t1.cjs`:

```js
const { freezeClock, FIXED_NOW, FIXTURE, PLACE } = require('../validation/_snapshot-env.cjs');
const assert = require('node:assert');
freezeClock();
assert.strictEqual(Date.now(), FIXED_NOW, 'Date.now must be frozen');
assert.strictEqual(new Date().getTime(), FIXED_NOW, 'new Date() must be frozen');
assert.strictEqual(FIXTURE.lat, 19.076);
assert.strictEqual(PLACE.zone, 'Asia/Kolkata');
console.log('t1 ok');
```

- [ ] **Step 2: Run it to make sure it fails**

```bash
export PATH="/opt/homebrew/bin:$PATH" && node .scratch/t1.cjs
```

Expected: FAIL — `Cannot find module '../validation/_snapshot-env.cjs'`

- [ ] **Step 3: Implement the minimal code**

Create `validation/_snapshot-env.cjs`:

```js
'use strict';
/* Deterministic inputs for screen snapshots.
   The project forbids golden files pinned to the real sky (see
   validation/prashna-practitioner.cjs). Freezing the CLOCK instead keeps the
   sky reproducible: the instant is a declared input, not a captured result.
   freezeClock() must run BEFORE any module is loaded, because modules capture
   Date at import time. */

const FIXED_NOW = 1786680000000; // 2026-08-10T06:00:00Z

const FIXTURE = {
  lat: 19.076, lon: 72.8777, tz: 5.5, zone: 'Asia/Kolkata',
  y: 1990, m: 6, day: 15, hh: 8, mi: 30, ayanamsa: 'lahiri',
};

const PLACE = { name: 'Mumbai, India', lat: FIXTURE.lat, lon: FIXTURE.lon, zone: FIXTURE.zone };

let frozen = false;
function freezeClock() {
  if (frozen) return;
  frozen = true;
  const RealDate = Date;
  class FrozenDate extends RealDate {
    constructor(...args) {
      if (args.length === 0) super(FIXED_NOW);
      else super(...args);
    }
    static now() { return FIXED_NOW; }
  }
  global.Date = FrozenDate;
  process.env.TZ = 'UTC';
}

module.exports = { FIXED_NOW, FIXTURE, PLACE, freezeClock };
```

- [ ] **Step 4: Run the test and make sure it passes**

```bash
export PATH="/opt/homebrew/bin:$PATH" && node .scratch/t1.cjs
```

Expected: `t1 ok`

- [ ] **Step 5: Commit**

```bash
rm -f .scratch/t1.cjs
git add validation/_snapshot-env.cjs
git commit -m "feat(verify): deterministic snapshot environment with a frozen clock"
```

---

### Task 2: Render one screen to text

**Files:**
- Create: `validation/_snapshot-render.cjs`

**Interfaces:**
- Consumes: `loadApp` from `validation/_load-app.cjs`; `PLACE` from Task 1.
- Produces:
  - `renderScreenText(entry: string, props: object): string` — bundles the module, renders its default export, returns visible text
  - `toText(html: string): string` — strips tags, decodes basic entities, collapses whitespace, one logical line per block

- [ ] **Step 1: Write the failing test**

Create `.scratch/t2.cjs`:

```js
const { freezeClock } = require('../validation/_snapshot-env.cjs');
freezeClock();
const { toText, renderScreenText } = require('../validation/_snapshot-render.cjs');
const assert = require('node:assert');

assert.strictEqual(toText('<p>Hello  <b>world</b></p>'), 'Hello world');
assert.strictEqual(toText('<div>a</div><div>b</div>'), 'a\nb');
assert.strictEqual(toText('<p>&amp;&nbsp;x</p>'), '& x');

const text = renderScreenText('src/screens/PersonalizeScreen.tsx', { lang: 'en' });
assert(typeof text === 'string' && text.length > 0, 'must render some text');
console.log('t2 ok');
```

- [ ] **Step 2: Run it to make sure it fails**

```bash
export PATH="/opt/homebrew/bin:$PATH" && node .scratch/t2.cjs
```

Expected: FAIL — `Cannot find module '../validation/_snapshot-render.cjs'`

- [ ] **Step 3: Implement the minimal code**

Create `validation/_snapshot-render.cjs`:

```js
'use strict';
/* Render a screen to the text a reader would see.
   renderToStaticMarkup runs NO effects and produces NO layout — so this proves
   copy, labels and language, never overflow or contrast. Say so wherever the
   output is reported. */

const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { loadApp } = require('./_load-app.cjs');

const BLOCK = /<\/(p|div|li|tr|h[1-6]|section|article|header|footer|table|thead|tbody|button|label)\s*>/gi;

function toText(html) {
  return String(html)
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, '')
    .replace(BLOCK, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(Number(d)))
    .split('\n')
    .map((line) => line.replace(/[ \t ]+/g, ' ').trim())
    .filter(Boolean)
    .join('\n');
}

function renderScreenText(entry, props) {
  const mod = loadApp(entry);
  const Screen = mod.default || mod[Object.keys(mod)[0]];
  if (typeof Screen !== 'function') throw new Error(`no component exported from ${entry}`);
  return toText(renderToStaticMarkup(React.createElement(Screen, props)));
}

module.exports = { toText, renderScreenText };
```

- [ ] **Step 4: Run the test and make sure it passes**

```bash
export PATH="/opt/homebrew/bin:$PATH" && node .scratch/t2.cjs
```

Expected: `t2 ok`

If a screen throws because a prop is missing, add that prop to the call in the test — do NOT add a try/catch that swallows it. A screen that cannot render without a prop must have that prop declared in Task 3's screen table.

- [ ] **Step 5: Commit**

```bash
rm -f .scratch/t2.cjs
git add validation/_snapshot-render.cjs
git commit -m "feat(verify): render a screen to visible text with no new dependencies"
```

---

### Task 3: Screen table and baseline generator

**Files:**
- Create: `validation/snapshot-generate.cjs`
- Create: `validation/snapshots/` (directory, populated by the generator)

**Interfaces:**
- Consumes: `freezeClock`, `PLACE`, `FIXTURE` (Task 1); `renderScreenText` (Task 2).
- Produces:
  - `SCREENS: Array<{ key: string, entry: string, props: (lang) => object, skip?: string }>`
  - `generate({ write: boolean }): Map<string, string>` — key `"<screenKey>.<lang>"` → text
  - Files `validation/snapshots/<screenKey>.<lang>.txt`

- [ ] **Step 1: Write the failing test**

Create `.scratch/t3.cjs`:

```js
const assert = require('node:assert');
const { SCREENS, generate } = require('../validation/snapshot-generate.cjs');

assert(SCREENS.length >= 8, 'must cover at least 8 screens');
const a = generate({ write: false });
const b = generate({ write: false });
assert.deepStrictEqual([...a.keys()].sort(), [...b.keys()].sort(), 'keys must be stable');
for (const k of a.keys()) assert.strictEqual(a.get(k), b.get(k), `output for ${k} must be deterministic`);
assert(a.has('personalize.en') && a.has('personalize.hi'), 'both languages required');
console.log('t3 ok, screens:', a.size);
```

- [ ] **Step 2: Run it to make sure it fails**

```bash
export PATH="/opt/homebrew/bin:$PATH" && node .scratch/t3.cjs
```

Expected: FAIL — `Cannot find module '../validation/snapshot-generate.cjs'`

- [ ] **Step 3: Implement the minimal code**

Create `validation/snapshot-generate.cjs`:

```js
#!/usr/bin/env node
'use strict';
/* Regenerate the committed screen baselines.
     node validation/snapshot-generate.cjs          # print a summary
     node validation/snapshot-generate.cjs --write  # rewrite validation/snapshots/
   Never auto-writes: a baseline must change only because a human meant it to. */

const fs = require('fs');
const path = require('path');
const { freezeClock, PLACE } = require('./_snapshot-env.cjs');
freezeClock(); // MUST precede any loadApp

const { renderScreenText } = require('./_snapshot-render.cjs');
const { ROOT } = require('./_load-app.cjs');

const OUT_DIR = path.join(ROOT, 'validation', 'snapshots');
const C = {
  bg: '#000', card: '#111', ink: '#fff', ivory: '#fff', gold: '#c9a227',
  muted: '#888', line: '#333', sindoor: '#c1440e',
};
const card = {};
const noop = () => {};

/* Screens rendered in their INITIAL state. Anything that only appears after a
   user action is covered by Task 5's result snapshots instead — listed here
   with `skip` so the coverage claim stays honest. */
const SCREENS = [
  { key: 'daily',       entry: 'src/screens/DailyScreen.tsx',       props: (lang) => ({ C, card, lang, place: PLACE, onPlace: noop }) },
  { key: 'personalize', entry: 'src/screens/PersonalizeScreen.tsx', props: (lang) => ({ C, lang, place: PLACE, onPlace: noop, onLanguage: noop, onClearPreferences: noop, onBack: noop }) },
  { key: 'chart',       entry: 'src/screens/ChartScreen.tsx',       props: (lang) => ({ C, card, lang }), skip: 'chart body needs a cast — covered by chart result snapshot' },
  { key: 'prashna',     entry: 'src/screens/PrashnaScreen.tsx',     props: (lang) => ({ C, card, lang, place: PLACE, onPlace: noop }) },
  { key: 'matching',    entry: 'src/screens/MatchingScreen.tsx',    props: (lang) => ({ C, card, lang, place: PLACE, onPlace: noop }) },
  { key: 'medical',     entry: 'src/screens/MedicalMuhuratScreen.tsx', props: (lang) => ({ C, card, lang, place: PLACE, onPlace: noop }) },
  { key: 'calendar',    entry: 'src/screens/CalendarPage.tsx',      props: (lang) => ({ C, card, lang, place: PLACE, onPlace: noop }) },
  { key: 'rectify',     entry: 'src/screens/RectifyScreen.tsx',     props: (lang) => ({ C, card, lang }) },
  { key: 'bnn',         entry: 'src/screens/JyotishBnnScreen.tsx',  props: (lang) => ({ C, card, lang }) },
];

const LANGS = ['en', 'hi'];

function generate({ write }) {
  const out = new Map();
  for (const s of SCREENS) {
    for (const lang of LANGS) {
      let text;
      try {
        text = renderScreenText(s.entry, s.props(lang));
      } catch (e) {
        text = `RENDER ERROR: ${e.message}`;
      }
      const key = `${s.key}.${lang}`;
      out.set(key, text);
      if (write) {
        fs.mkdirSync(OUT_DIR, { recursive: true });
        fs.writeFileSync(path.join(OUT_DIR, `${key}.txt`), text + '\n', 'utf8');
      }
    }
  }
  return out;
}

if (require.main === module) {
  const write = process.argv.includes('--write');
  const map = generate({ write });
  const errors = [...map.entries()].filter(([, v]) => v.startsWith('RENDER ERROR'));
  for (const [k, v] of errors) console.error(`  ${k}: ${v.split('\n')[0]}`);
  console.log(`${write ? 'wrote' : 'generated'} ${map.size} snapshots across ${SCREENS.length} screens · ${errors.length} render error(s)`);
  console.log('NOTE: text only — this proves copy and language, never layout or overflow.');
  if (errors.length) process.exit(1);
}

module.exports = { SCREENS, LANGS, generate, OUT_DIR };
```

- [ ] **Step 4: Run the test and make sure it passes**

```bash
export PATH="/opt/homebrew/bin:$PATH" && node .scratch/t3.cjs
```

Expected: `t3 ok, screens: 18`

If any screen reports `RENDER ERROR`, fix its props in `SCREENS` — do not delete the screen from the table. If a screen genuinely cannot render headlessly, keep it in the table and give it a `skip` string explaining why.

- [ ] **Step 5: Write the baselines and commit**

```bash
export PATH="/opt/homebrew/bin:$PATH" && node validation/snapshot-generate.cjs --write
rm -f .scratch/t3.cjs
git add validation/snapshot-generate.cjs validation/snapshots
git commit -m "feat(verify): screen table and committed text baselines for both languages"
```

---

### Task 4: The gate — prove it bites before trusting it

**Files:**
- Create: `validation/screen-snapshots.cjs`

**Interfaces:**
- Consumes: `generate`, `OUT_DIR` (Task 3).
- Produces: a gate. Exit 0 when fresh output matches the committed baselines; exit 1 with a unified diff otherwise.

- [ ] **Step 1: Write the gate**

Create `validation/screen-snapshots.cjs`:

```js
#!/usr/bin/env node
'use strict';
/* Screen snapshot gate (VERIFY-SNAPSHOTS).
   Spec: docs/superpowers/specs/2026-08-10-screen-snapshot-verification-design.md

   85 gates prove the maths and the structure. None of them proved what a reader
   SEES, which is how three language defects reached main in one month. This
   diffs the rendered text of every screen, in both languages, against a
   committed baseline.

   Intentional copy changes are EXPECTED to fail this. Re-baseline with:
     node validation/snapshot-generate.cjs --write
   and commit the diff — that diff is the review artifact. */

const fs = require('fs');
const path = require('path');
const { generate, OUT_DIR, SCREENS, LANGS } = require('./snapshot-generate.cjs');

const fresh = generate({ write: false });
let failures = 0;

function diff(expected, actual) {
  const e = expected.split('\n'), a = actual.split('\n');
  const lines = [];
  for (let i = 0; i < Math.max(e.length, a.length); i++) {
    if (e[i] !== a[i]) {
      if (e[i] !== undefined) lines.push(`    -${i + 1}: ${e[i]}`);
      if (a[i] !== undefined) lines.push(`    +${i + 1}: ${a[i]}`);
    }
  }
  return lines.slice(0, 40);
}

for (const [key, actual] of fresh) {
  const file = path.join(OUT_DIR, `${key}.txt`);
  if (!fs.existsSync(file)) {
    console.error(`FAIL ${key}: no committed baseline. Run: node validation/snapshot-generate.cjs --write`);
    failures++;
    continue;
  }
  const expected = fs.readFileSync(file, 'utf8').replace(/\n$/, '');
  if (expected !== actual) {
    console.error(`FAIL ${key}: rendered text changed`);
    diff(expected, actual).forEach((l) => console.error(l));
    failures++;
  }
}

if (failures) {
  console.error(`\n✗ screen-snapshots FAILED (${failures})`);
  console.error('If the change was intentional: node validation/snapshot-generate.cjs --write, then commit the diff.');
  process.exit(1);
}

console.log(`✓ screen-snapshots: ${fresh.size} baselines across ${SCREENS.length} screens × ${LANGS.length} languages match`);
console.log('  scope: rendered TEXT only — layout, overflow and contrast still need a human at 375px.');
```

- [ ] **Step 2: Run it and make sure it passes on unchanged code**

```bash
export PATH="/opt/homebrew/bin:$PATH" && node validation/screen-snapshots.cjs
```

Expected: `✓ screen-snapshots: 18 baselines …`

- [ ] **Step 3: Prove the guard bites — reintroduce a real bug**

This repo's rule is that a gate which has never gone red has not been tested. Use the actual defect from 2026-08-09:

```bash
cd /Users/shivie/ClaudeProjects/Kundli
sed -i '' 's|panchangTerm(lang, "nakshatra", NAKSHATRAS\[r.moon.nak\])|NAKSHATRAS[r.moon.nak]|' src/screens/ChartScreen.tsx
export PATH="/opt/homebrew/bin:$PATH" && node validation/screen-snapshots.cjs
```

Expected: FAIL. **If it passes, the Tier A snapshot does not reach that string** — that is the known `renderToStaticMarkup` limit for post-cast content, and it means this assertion belongs to the chart result snapshot in Task 5 instead. Record which it was in the commit message; do not weaken the gate to make it green.

- [ ] **Step 4: Restore and re-verify**

```bash
git checkout src/screens/ChartScreen.tsx
export PATH="/opt/homebrew/bin:$PATH" && node validation/screen-snapshots.cjs
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add validation/screen-snapshots.cjs
git commit -m "feat(verify): screen snapshot gate, proven red on a real regression"
```

---

### Task 5: Result snapshots for post-interaction surfaces

**Files:**
- Create: `validation/snapshot-results.cjs`
- Modify: `validation/screen-snapshots.cjs` (fold result keys into the same comparison)

**Interfaces:**
- Consumes: `freezeClock`, `FIXTURE` (Task 1).
- Produces: `generateResults(): Map<string, string>` with keys `chart.en`, `chart.hi`, `calculators.en`, `calculators.hi`; files written to the same `validation/snapshots/` directory by `snapshot-generate.cjs --write`.

- [ ] **Step 1: Write the failing test**

Create `.scratch/t5.cjs`:

```js
const assert = require('node:assert');
const { generateResults } = require('../validation/snapshot-results.cjs');
const m = generateResults();
assert(m.has('chart.en') && m.has('chart.hi'), 'chart results in both languages');
assert(/Cancer/.test(m.get('chart.en')), 'EN chart must name the Lagna in English');
assert(/कर्क/.test(m.get('chart.hi')), 'HI chart must name the Lagna in Devanagari');
assert(!/[ऀ-ॿ]/.test(m.get('chart.en')), 'EN chart must contain no Devanagari');
assert(!/\b(Shatabhisha|Saturn|Aquarius)\b/.test(m.get('chart.hi')), 'HI chart must contain no Latin term names');
console.log('t5 ok');
```

- [ ] **Step 2: Run it to make sure it fails**

```bash
export PATH="/opt/homebrew/bin:$PATH" && node .scratch/t5.cjs
```

Expected: FAIL — `Cannot find module '../validation/snapshot-results.cjs'`

- [ ] **Step 3: Implement the minimal code**

Create `validation/snapshot-results.cjs`:

```js
'use strict';
/* Surfaces that only exist AFTER the reader acts (cast a chart, press Calculate).
   renderToStaticMarkup runs no effects and no handlers, so Tier A sees only the
   empty form. Here we compose the REAL engine with the REAL display helpers at
   pinned inputs — the technique that caught the Shatabhisha leak by hand. */

const { freezeClock, FIXTURE } = require('./_snapshot-env.cjs');
freezeClock();

const { loadApp } = require('./_load-app.cjs');
const { computeKundli } = loadApp('src/engine/kundli.ts');
const { SIGNS, NAKSHATRAS } = loadApp('src/engine/panchang.ts');
const terms = loadApp('src/i18n/panchang-terms.ts');
const { signLabel, panchangTerm, signShort } = terms;

function chartText(lang) {
  const r = computeKundli({
    y: FIXTURE.y, m: FIXTURE.m, day: FIXTURE.day, hh: FIXTURE.hh, mi: FIXTURE.mi,
    tz: FIXTURE.tz, lat: FIXTURE.lat, lon: FIXTURE.lon, ayanamsa: FIXTURE.ayanamsa,
  });
  const lines = [
    `Lagna: ${signLabel(lang, SIGNS[r.ascSign])}`,
    `Moon sign: ${signLabel(lang, SIGNS[r.moon.sign])}`,
    `Sun sign: ${signLabel(lang, SIGNS[r.sun.sign])}`,
    `Janma Nakshatra: ${panchangTerm(lang, 'nakshatra', NAKSHATRAS[r.moon.nak])} pada ${r.moon.pada}`,
    `Rashi columns: ${[...Array(12)].map((_, i) => signShort(lang, i)).join(' ')}`,
  ];
  for (const p of r.rows) {
    lines.push(`${panchangTerm(lang, 'planet', p.name)} — ${signLabel(lang, SIGNS[p.sign])} · ${panchangTerm(lang, 'nakshatra', NAKSHATRAS[p.nak])}`);
  }
  return lines.join('\n');
}

function generateResults() {
  const out = new Map();
  for (const lang of ['en', 'hi']) out.set(`chart.${lang}`, chartText(lang));
  return out;
}

module.exports = { generateResults, chartText };
```

- [ ] **Step 4: Run the test and make sure it passes**

```bash
export PATH="/opt/homebrew/bin:$PATH" && node .scratch/t5.cjs
```

Expected: `t5 ok`

- [ ] **Step 5: Fold results into the generator and the gate**

In `validation/snapshot-generate.cjs`, inside `generate()`, after the screen loop and before `return out;`:

```js
  const { generateResults } = require('./snapshot-results.cjs');
  for (const [key, text] of generateResults()) {
    out.set(key, text);
    if (write) {
      fs.mkdirSync(OUT_DIR, { recursive: true });
      fs.writeFileSync(path.join(OUT_DIR, `${key}.txt`), text + '\n', 'utf8');
    }
  }
```

- [ ] **Step 6: Re-baseline, verify, commit**

```bash
export PATH="/opt/homebrew/bin:$PATH" && node validation/snapshot-generate.cjs --write
export PATH="/opt/homebrew/bin:$PATH" && node validation/screen-snapshots.cjs
rm -f .scratch/t5.cjs
git add validation/snapshot-results.cjs validation/snapshot-generate.cjs validation/snapshots
git commit -m "feat(verify): result snapshots for chart surfaces in both languages"
```

---

### Task 6: Language purity over rendered output (S6)

**Files:**
- Modify: `validation/screen-snapshots.cjs`

**Interfaces:**
- Consumes: `fresh` map already built in the gate.
- Produces: two additional assertions per baseline.

- [ ] **Step 1: Add the assertions**

In `validation/screen-snapshots.cjs`, after the baseline comparison loop and before the `if (failures)` block:

```js
/* language-leak-scan owns the SOURCE half of this (no duplicate tables). This is
   the RENDERED half it cannot see: the four raw NAKSHATRAS[...] sites contained
   no table at all, so only rendered output could catch them. */
const DEVANAGARI = /[ऀ-ॿ]/;
const ALLOWED_IN_EN = ['गणक', 'ॐ', 'हिन्दी'];
const terms = require('./_load-app.cjs').loadApp('src/i18n/panchang-terms.ts');
const LATIN_TERMS = [
  ...Object.keys(terms.SIGN_HI), ...Object.keys(terms.NAKSHATRA_HI), ...Object.keys(terms.PLANET_HI),
];

for (const [key, text] of fresh) {
  const stripped = ALLOWED_IN_EN.reduce((s, w) => s.split(w).join(''), text);
  if (key.endsWith('.en') && DEVANAGARI.test(stripped)) {
    const bad = stripped.split('\n').filter((l) => DEVANAGARI.test(l)).slice(0, 5);
    console.error(`FAIL ${key}: Devanagari in English output:\n${bad.map((l) => '    ' + l).join('\n')}`);
    failures++;
  }
  if (key.endsWith('.hi')) {
    const leaked = LATIN_TERMS.filter((t) => new RegExp(`\\b${t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`).test(text));
    if (leaked.length) {
      console.error(`FAIL ${key}: Latin term names in Hindi output: ${leaked.slice(0, 6).join(', ')}`);
      failures++;
    }
  }
}
```

- [ ] **Step 2: Run the gate**

```bash
export PATH="/opt/homebrew/bin:$PATH" && node validation/screen-snapshots.cjs
```

Expected: PASS. If it fails, it has found a **real** leak — fix the screen, not the assertion.

- [ ] **Step 3: Prove it bites**

```bash
cd /Users/shivie/ClaudeProjects/Kundli
sed -i '' 's|panchangTerm(lang, "nakshatra", NAKSHATRAS\[r.moon.nak\])|NAKSHATRAS[r.moon.nak]|' src/screens/ChartScreen.tsx
export PATH="/opt/homebrew/bin:$PATH" && node validation/screen-snapshots.cjs   # expect FAIL naming the Latin term
git checkout src/screens/ChartScreen.tsx
export PATH="/opt/homebrew/bin:$PATH" && node validation/screen-snapshots.cjs   # expect PASS
```

- [ ] **Step 4: Commit**

```bash
git add validation/screen-snapshots.cjs
git commit -m "feat(verify): assert language purity over rendered output, not just source"
```

---

### Task 7: Wire into the suite, CI and the docs (S5, S7)

**Files:**
- Modify: `.github/workflows/` Tier A workflow (the file that runs the canonical suite)
- Modify: `AGENTS.md`
- Modify: `plans/backlog.md` (tick #62's first checkbox)

- [ ] **Step 1: Confirm the gate is picked up by the suite runner**

```bash
export PATH="/opt/homebrew/bin:$PATH" && for g in validation/*.cjs; do node "$g" >/dev/null 2>&1 || echo "FAIL $g"; done
```

Expected: no `FAIL` lines other than argument-taking helpers (`parse-check.js`, `prashna-parity.js` are `.js`, not `.cjs`, so they are not in this loop).

- [ ] **Step 2: Add the honest-scope note to AGENTS.md**

Under the validation/gates section, add:

```markdown
- **`validation/screen-snapshots.cjs` proves rendered TEXT, not layout.** A green
  run means no screen's copy or language changed unexpectedly. It does NOT mean
  anyone looked at the layout: overflow, contrast and touch targets at 375px still
  need a human or a browser pass. Intentional copy changes are expected to fail it —
  re-baseline with `node validation/snapshot-generate.cjs --write` and commit the
  diff, which is the review artifact.
```

- [ ] **Step 3: Add the gate to the Tier A cron workflow**

In the workflow's gate step list, add `node validation/screen-snapshots.cjs`.

- [ ] **Step 4: Verify the whole suite is green**

```bash
export PATH="/opt/homebrew/bin:$PATH" && npm run build && node validation/screen-snapshots.cjs && node validation/language-leak-scan.cjs
```

Expected: build succeeds; both gates print their `✓` lines.

- [ ] **Step 5: Commit**

```bash
git add AGENTS.md .github/workflows plans/backlog.md
git commit -m "docs(verify): document snapshot scope honestly and run it in Tier A CI"
```

---

## Self-Review

**Spec coverage:**

| Spec req | Task |
|---|---|
| S1 deterministic harness | Task 1 |
| S2 Tier A route snapshots | Tasks 2–3 |
| S3 Tier B result snapshots | Task 5 |
| S4 gate, proven red | Task 4 |
| S5 honest scope statement | Task 4 (success line) + Task 7 (AGENTS.md) |
| S6 language purity over rendered output | Task 6 |
| S7 Tier A CI cron | Task 7 |
| S8 verification ledger | P2 — deliberately not planned |
| S9 screenshot diffing | P2 — deliberately not planned |

**Placeholder scan:** no TBDs; every code step carries complete code; every command carries its expected output.

**Type consistency:** `freezeClock()`, `FIXTURE`, `PLACE`, `FIXED_NOW` (Task 1) are used with those exact names in Tasks 3 and 5. `renderScreenText(entry, props)` and `toText(html)` (Task 2) are used with those signatures in Task 3. `generate({ write })`, `OUT_DIR`, `SCREENS`, `LANGS` (Task 3) are consumed with those names in Tasks 4 and 5. `generateResults()` (Task 5) is consumed in Task 5 Step 5.

**Known risk, stated rather than hidden:** Task 4 Step 3 may reveal that Tier A cannot see post-cast chart text. That is the documented `renderToStaticMarkup` limitation, not a plan failure — the assertion then belongs to Task 5/6, and the plan says so explicitly instead of quietly relaxing the gate.
