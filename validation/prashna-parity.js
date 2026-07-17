#!/usr/bin/env node
// ============================================================================
// validation/prashna-parity.js — proves the Prashna engine INLINED in the app
// is behaviourally identical to the standalone engine validated against Drik.
//
//   node validation/prashna-parity.js kundli-app.jsx
//
// Works on any file that still contains the two engine markers. If the markers
// are gone (someone refactored the block away), this fails loudly rather than
// silently passing — a missing check is worse than a failing one.
// ============================================================================
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');

const BEGIN = '// ============================== ENGINE (validated) ==========================';
const END   = '// ============================ END ENGINE ====================================';

const target = process.argv[2];
if (!target || !fs.existsSync(target)) {
  console.error('usage: node validation/prashna-parity.js <file-with-inlined-engine.jsx>');
  process.exit(1);
}
const src = fs.readFileSync(target, 'utf8');
const i = src.indexOf(BEGIN), j = src.indexOf(END);
if (i === -1 || j === -1 || j < i) {
  console.error(`✗ parity FAILED: engine markers not found in ${target}.`);
  console.error('  The inlined Prashna engine must stay bracketed by:');
  console.error(`    ${BEGIN}`);
  console.error(`    ${END}`);
  process.exit(1);
}

const region = src.slice(i, j);
const tmp = path.join(os.tmpdir(), `prashna-inline-${process.pid}.js`);
fs.writeFileSync(tmp, region + '\nmodule.exports = { PR_cast, PR_judge, QUESTIONS };\n');

let inline, ref;
try {
  inline = require(tmp);
  ref = require(path.resolve(path.dirname(process.argv[1]), 'prashna-calc.js'));
} catch (e) {
  console.error(`✗ parity FAILED to load engines: ${e.message}`);
  fs.unlinkSync(tmp);
  process.exit(1);
}

const IST = (y, mo, d, h, mi) => Date.UTC(y, mo - 1, d, h, mi) - 330 * 60000;
const CASES = [
  { ms: IST(2026, 7, 10, 13, 15), lat: 28.6139, lon: 77.2090, label: 'Delhi, nakshatra boundary' },
  { ms: IST(2026, 7, 10, 5, 31),  lat: 28.6139, lon: 77.2090, label: 'Delhi, sunrise' },
  { ms: IST(2026, 1, 1, 9, 0),    lat: 13.0827, lon: 80.2707, label: 'Chennai, winter' },
  { ms: IST(2026, 7, 11, 22, 3),  lat: 19.0760, lon: 72.8777, label: 'Mumbai, night' },
  { ms: IST(2026, 3, 15, 12, 0),  lat: 51.5074, lon: -0.1278, label: 'London, diaspora' },
  { ms: IST(2026, 6, 21, 12, 0),  lat: 64.1466, lon: -21.9426, label: 'Reykjavik, equal-house fallback' },
];

let checked = 0, worst = 0, mismatches = 0;
for (const c of CASES) {
  const a = inline.PR_cast(c.ms, c.lat, c.lon);
  const b = ref.castChart(c.ms, c.lat, c.lon);
  for (let k = 0; k < 9; k++) {
    let d = Math.abs(a.planets[k].lon - b.planets[k].lon); if (d > 180) d = 360 - d;
    worst = Math.max(worst, d); checked++;
    if (a.planets[k].house !== b.planets[k].house || a.planets[k].sub !== b.planets[k].sub
        || a.planets[k].retro !== b.planets[k].retro) {
      mismatches++;
      console.error(`  MISMATCH ${c.label}: planet ${a.planets[k].key} house/sub/retro differs`);
    }
  }
  for (let h = 1; h <= 12; h++) {
    let d = Math.abs(a.cusps[h] - b.houses.cusps[h]); if (d > 180) d = 360 - d;
    worst = Math.max(worst, d); checked++;
  }
  if (a.system !== b.houses.system) {
    mismatches++;
    console.error(`  MISMATCH ${c.label}: house system ${a.system} vs ${b.houses.system}`);
  }
  for (const q of inline.QUESTIONS) {
    const va = inline.PR_judge(a, q), vb = ref.judge(b, q.key);
    checked++;
    if (va.verdict !== vb.verdict || va.score !== vb.score || va.cuspSub !== vb.cuspSub) {
      mismatches++;
      console.error(`  MISMATCH ${c.label}: '${q.key}' → ${va.verdict}/${va.score} vs ${vb.verdict}/${vb.score}`);
    }
  }
}
fs.unlinkSync(tmp);

const ok = worst < 1e-9 && mismatches === 0;
console.log(`${ok ? '✓' : '✗'} parity ${ok ? 'EXACT' : 'FAILED'}: ${checked} values across ${CASES.length} charts` +
  ` | worst numeric diff ${worst.toExponential(2)}° | ${mismatches} mismatch(es)`);
process.exit(ok ? 0 : 1);
