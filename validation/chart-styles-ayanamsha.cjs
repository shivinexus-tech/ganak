#!/usr/bin/env node
'use strict';
/* Chart-style + ayanamsha gate. Verifies the four ayanamshas resolve with the
   right offsets and actually shift a chart, and that the South-Indian sign→cell
   map is a valid, complete layout. */
const assert = require('node:assert');
const { loadApp, ROOT } = require('./_load-app.cjs');
const panchang = loadApp('src/engine/panchang.ts');
const { computeKundli } = loadApp('src/engine/kundli.ts');
const south = loadApp('src/components/SouthChart.tsx');
const east = loadApp('src/components/EastChart.tsx');

// ---- ayanamsha table ----
const A = panchang.AYANAMSA;
['lahiri', 'raman', 'kp', 'trueChitra'].forEach((k) => assert(A[k] && A[k].label, `ayanamsha ${k} missing/label`));
assert.strictEqual(A.lahiri.offset, 0, 'Lahiri must be the zero-point default');
assert(Math.abs(A.raman.offset - (-1.479)) < 0.01, 'Raman offset drifted (~-1.479°)');
assert(Math.abs(A.kp.offset - (-0.096667)) < 1e-6, 'KP offset drifted');
assert(Math.abs(A.trueChitra.offset) < 0.01, 'True Chitrapaksha must sit within ~arc-minutes of Lahiri');

// ---- ayanamshas actually move the chart ----
const birth = { y: 1990, m: 1, day: 1, hh: 12, mi: 0, tz: 5.5, lat: 28.61, lon: 77.21 };
const lah = computeKundli({ ...birth, ayanamsa: 'lahiri' });
const ram = computeKundli({ ...birth, ayanamsa: 'raman' });
const tc = computeKundli({ ...birth, ayanamsa: 'trueChitra' });
const sunLah = lah.rows.find((p) => p.name === 'Sun').lon;
const sunRam = ram.rows.find((p) => p.name === 'Sun').lon;
const sunTc = tc.rows.find((p) => p.name === 'Sun').lon;
// smaller ayanamsa (Raman) → larger sidereal longitude, by ~1.479°
const dRam = ((sunRam - sunLah + 540) % 360) - 180;
assert(Math.abs(dRam - 1.479) < 0.02, `Raman must shift the Sun ~+1.479° (got ${dRam.toFixed(3)})`);
const dTc = ((sunTc - sunLah + 540) % 360) - 180;
assert(Math.abs(dTc) < 0.01, `True Chitrapaksha must coincide with Lahiri (got ${dTc.toFixed(4)})`);

// ---- South-Indian layout ----
const cells = south.SOUTH_SIGN_CELL;
assert(Array.isArray(cells) && cells.length === 12, 'South layout must map all 12 signs');
assert(new Set(cells).size === 12, 'each sign must occupy a distinct cell');
const centre = new Set([5, 6, 9, 10]);
assert(cells.every((c) => c >= 0 && c <= 15 && !centre.has(c)), 'signs must sit in the outer ring, never the centre panel');
// canonical anchors: Aries top-row second cell (1), Pisces top-left (0)
assert.strictEqual(cells[0], 1, 'Aries must sit in the top row, second cell');
assert.strictEqual(cells[11], 0, 'Pisces must sit top-left');

// ---- East-Indian (Bengali) layout ----
const es = east.EAST_SIGNS;
assert(Array.isArray(es) && es.length === 12, 'East layout must define all 12 signs');
assert(es.every((c) => Array.isArray(c.poly) && c.poly.length >= 3 && Array.isArray(c.c)), 'each East sign needs a polygon and a centroid');
// Aries (0) sits top-centre: centroid x≈200 and high on the board (small y).
assert(Math.abs(es[0].c[0] - 200) < 20 && es[0].c[1] < 130, 'Aries must sit at the top-centre');
// Libra (6) is opposite Aries at the bottom-centre.
assert(Math.abs(es[6].c[0] - 200) < 20 && es[6].c[1] > 270, 'Libra must sit at the bottom-centre (opposite Aries)');
// Anti-clockwise: Cancer (3, 90° ccw from Aries) is on the LEFT; Capricorn (9) on the RIGHT.
assert(es[3].c[0] < 130, 'Cancer must be on the left (anti-clockwise)');
assert(es[9].c[0] > 270, 'Capricorn must be on the right');
// all centroids distinct
assert(new Set(es.map((c) => c.c.join(','))).size === 12, 'each East sign needs a distinct centroid');

// ============================================================================
// ---- F8: a non-default ayanamsha must not leak into anybody else's Panchang ----
//
// `loadApp()` bundles each entry point SEPARATELY, so every module got its own
// private copy of the engine's ayanamsha state and this gate could not observe a
// leak even in principle. The real Vite bundle shares ONE module graph. These
// assertions build that shared graph, so a global that one caster sets and never
// restores is visible here the way it is visible to a user.
//
// The bug (bug-bash 2026-08-18, finding F8): casting a chart on Raman moved the
// free Panchang — a surface that never offered an ayanamsha choice — by 1.479°,
// enough to push a tithi, nakshatra or muhurat across a boundary for an
// unrelated reader in the same session.
// See plans/audits/2026-08-18-ayanamsa-leak-fix.md.
// ============================================================================
const fs = require('node:fs');
const path = require('node:path');

function loadSharedEngine() {
  let esbuild;
  try { esbuild = require('esbuild'); }
  catch { console.error('validation: esbuild not found. Run `npm install` first.'); process.exit(1); }
  const tmp = path.join(__dirname, `.ayan-shared-${process.pid}-${Math.random().toString(36).slice(2)}.tmp.cjs`);
  try {
    esbuild.buildSync({
      stdin: {
        contents: `
          export * as P from "./src/engine/panchang";
          export * as K from "./src/engine/kundli";
          export * as M from "./src/engine/muhurat";
          export * as TP from "./src/engine/today-panchang";
          export * as PK from "./src/engine/panchaka";
          export * as LP from "./src/engine/lakshmi-puja";
          export * as VS from "./src/engine/vedic-season-clock";
          export * as MM from "./src/engine/medical-muhurat";
          export * as PM from "./src/engine/personal-muhurat";
          export * as DA from "./src/engine/dasha";
          export * as MD from "./src/engine/mangal-dosha";
        `,
        resolveDir: ROOT,
        loader: 'ts',
      },
      outfile: tmp, bundle: true, format: 'cjs', platform: 'node', target: 'node18',
      jsx: 'transform', logLevel: 'silent',
      external: ['react', 'react-dom', 'react/jsx-runtime'],
    });
    return require(tmp);
  } finally {
    try { fs.unlinkSync(tmp); } catch (e) { /* already gone */ }
  }
}

const DELHI = { label: 'New Delhi', lat: 28.6139, lon: 77.2090, zone: 'Asia/Kolkata' };
const KOCHI = { label: 'Kochi', lat: 9.9312, lon: 76.2673, zone: 'Asia/Kolkata' };
const AT = Date.UTC(2026, 7, 18, 6, 30);   // pinned — never Date.now(), or the gate drifts
const BIRTH = { y: 1990, m: 1, day: 1, hh: 12, mi: 0, tz: 5.5, lat: 28.61, lon: 77.21 };

/* Everything the free Panchang shows a reader, read through the shared graph. */
function panchangReading(E) {
  const grid = [];
  for (let k = 0; k < 24; k++) {
    const ms = AT + k * 3600000 * 37;   // 37h stride — walks tithi/nakshatra boundaries
    grid.push([
      E.P.ayanAt(E.P.jdOf(ms)), E.P.sunSidMs(ms), E.P.moonSidMs(ms),
      E.P.elongMs(ms), E.P.lunYogaMs(ms),
      E.P.planetSidMs('Saturn', ms), E.P.planetSidMs('Rahu', ms),
    ]);
  }
  return JSON.stringify({
    grid,
    today: E.TP.computeTodayPanchang(DELHI, 'lahiri', AT),
    todayKochi: E.TP.computeTodayPanchang(KOCHI, 'lahiri', AT + 86400000),
    muhurat: E.M.muhuratForDate(DELHI, 'lahiri', 2026, 8, 18),
    dayMuhurat: E.M.dayMuhurat(2026, 8, 18, DELHI, 5.5, 'general', ['amrit', 'shubh', 'labh']),
    panchaka: E.PK.computeLagnaPanchaka(DELHI, 'lahiri', AT),
    season: E.VS.computeVedicSeasonClock(DELHI, 'lahiri', AT),
    medical: E.MM.medicalMuhuratDay(DELHI, 'lahiri', 2026, 8, 18, null),
  });
}

/* Every way a reader can pick a non-default ayanamsha, or a screen can pass one. */
const CASTERS = {
  computeKundli: (E, a) => E.K.computeKundli({ ...BIRTH, ayanamsa: a }),
  muhuratForDate: (E, a) => E.M.muhuratForDate(DELHI, a, 2026, 8, 18),
  muhuratScanRange: (E, a) => E.M.muhuratScanRange(DELHI, a, { y: 2026, m: 8, d: 1 }, { y: 2026, m: 8, d: 20 }, 'wedding'),
  vaishnavaEkadashi: (E, a) => E.M.vaishnavaEkadashi(DELHI, a, AT),
  vaishnavaEkadashiDay: (E, a) => E.M.vaishnavaEkadashiDay(DELHI, a, AT),
  vratDetail: (E, a) => E.M.vratDetail(DELHI, a, AT, 'parana'),
  dayMuhuratWithMode: (E, a) => E.M.dayMuhurat(2026, 8, 18, DELHI, 5.5, 'general', ['amrit', 'shubh', 'labh'], a),
  findMuhuratWithMode: (E, a) => E.M.findMuhurat(AT, AT + 30 * 86400000, DELHI, 5.5, 'wedding', ['amrit', 'shubh', 'labh'], a),
  computeLagnaPanchaka: (E, a) => E.PK.computeLagnaPanchaka(DELHI, a, AT),
  computeVedicSeasonClock: (E, a) => E.VS.computeVedicSeasonClock(DELHI, a, AT),
  medicalMuhuratDay: (E, a) => E.MM.medicalMuhuratDay(DELHI, a, 2026, 8, 18, null),
  natalMoonSign: (E, a) => E.MM.natalMoonSign(DELHI, a, { y: 1990, m: 1, day: 1, hh: 12, mi: 0 }),
  natalAnchors: (E, a) => E.PM.natalAnchors(DELHI, a, { y: 1990, m: 1, day: 1, hh: 12, mi: 0 }),
  rectAtMin: (E, a) => E.DA.rectAtMin(1990, 1, 1, 5.5, 28.61, 77.21, a, 720),
  mahaTimelineAt: (E, a) => E.DA.mahaTimelineAt(1990, 1, 1, 5.5, 720, a),
  mangalDoshaReport: (E) => E.MD.mangalDoshaReport(BIRTH),
};

// A pristine session: this graph never casts anything on a non-default ayanamsha.
// Read twice, in two independent graphs, so a flaky harness cannot masquerade as a leak.
const PRISTINE = panchangReading(loadSharedEngine());
assert.strictEqual(panchangReading(loadSharedEngine()), PRISTINE,
  'two untouched module graphs disagree — the harness itself is unstable, fix that before trusting the leak check');

const NON_DEFAULT = ['raman', 'kp', 'trueChitra'];
for (const aya of NON_DEFAULT) {
  for (const [name, cast] of Object.entries(CASTERS)) {
    const E = loadSharedEngine();
    cast(E, aya);
    const after = panchangReading(E);
    if (after !== PRISTINE) {
      const ms = AT;
      throw new assert.AssertionError({
        message: `AYANAMSHA LEAK: ${name}(${aya}) changed what the Panchang answers for everybody else. `
          + `Moon sidereal went ${JSON.parse(PRISTINE).grid[0][2].toFixed(4)} -> ${JSON.parse(after).grid[0][2].toFixed(4)} at ${new Date(ms).toISOString()}. `
          + `The ayanamsha must be a parameter (see sidereal(mode) in src/engine/panchang.ts), never a module global. `
          + `See plans/audits/2026-08-18-ayanamsa-leak-fix.md.`,
      });
    }
  }
}

// Casting on every non-default mode in one session, back to back, must also leave
// the Panchang untouched — the real app is a long-lived tab, not one call.
{
  const E = loadSharedEngine();
  for (const aya of NON_DEFAULT) for (const cast of Object.values(CASTERS)) cast(E, aya);
  assert.strictEqual(panchangReading(E), PRISTINE,
    'AYANAMSHA LEAK: a session that exercised every caster on every non-default ayanamsha changed the Panchang');
}

// A non-default ayanamsha must still WORK — the fix is containment, not removal.
{
  const E = loadSharedEngine();
  const lahMoon = E.P.moonSidMs(AT);
  const ramMoon = E.P.moonSidMs(AT, 'raman');
  const dRam = ((ramMoon - lahMoon + 540) % 360) - 180;
  assert(Math.abs(dRam - 1.479) < 0.02, `moonSidMs(ms,'raman') must shift ~+1.479° (got ${dRam.toFixed(4)})`);
  const S = E.P.sidereal('raman');
  assert.strictEqual(S.moonSidMs(AT), ramMoon, 'sidereal("raman") must agree with the trailing-mode form');
  assert.strictEqual(E.P.sidereal().mode, 'lahiri', 'sidereal() with no mode must be Lahiri, the project default');
  assert.throws(() => E.P.sidereal('sidereal-vibes'), /unknown ayanamsa/, 'an unknown ayanamsha must fail loudly at the boundary');
  assert.strictEqual(E.P.moonSidMs(AT), lahMoon, 'reading a non-default mode must not disturb the default');
}

// ---- structural guard: no new ambient writers ----
// setAyanMode is the trap that caused F8. Only today-panchang.ts still calls it
// (that module sets the mode and immediately reads bare accessors; converting it
// belongs to whoever owns that file). Every other engine threads the mode.
{
  const engineDir = path.join(ROOT, 'src', 'engine');
  const offenders = [];
  for (const f of fs.readdirSync(engineDir)) {
    if (!/\.(ts|tsx|js|jsx)$/.test(f) || f === 'panchang.ts') continue;
    const src = fs.readFileSync(path.join(engineDir, f), 'utf8');
    const calls = (src.match(/(?<!function\s)\bsetAyanMode\s*\(/g) || []).length;
    if (calls) offenders.push(`${f} (${calls})`);
  }
  assert.deepStrictEqual(offenders, ['today-panchang.ts (1)'],
    `setAyanMode writes a module global that nothing restores — that is exactly bug F8. `
    + `Thread the mode instead: sidereal(mode) or the trailing mode argument. Offenders: ${offenders.join(', ')}`);
  const shell = fs.readFileSync(path.join(ROOT, 'src', 'kundli-app.tsx'), 'utf8');
  assert(!/\bsetAyanMode\s*\(/.test(shell), 'the shell must never set the ayanamsha globally');
}

console.log('chart-styles-ayanamsha.cjs OK — 4 ayanamshas (Raman shift verified) + South & East layouts'
  + ` + no ayanamsha leak (${NON_DEFAULT.length} modes x ${Object.keys(CASTERS).length} casters, shared module graph)`);
