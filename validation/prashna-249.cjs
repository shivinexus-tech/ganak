#!/usr/bin/env node
// ============================================================================
// validation/prashna-249.cjs — KP horary number method (1–249) gate.
//
// Proves the app engine's kpNumberToLagna(n) reproduces the canonical 1–249
// sub table: 27 nakshatras × 9 Vimshottari-proportioned subs, split where a
// sub straddles a rashi boundary → exactly 249 numbers. The number fixes the
// Prashna lagna at the START degree of its segment.
//
// NON-VACUOUS BY CONSTRUCTION: the anchor rows below are absolute values
// transcribed from the published/computed canonical table
// (plans/prashna-249-table.md), NOT recomputed from the engine's own
// constants. So if VIM_YEARS ever drifts, the anchors stop matching.
// Prove-the-guard (manual, done once): change Saturn's Vimshottari years
// 19→18 in src/engine/dasha.ts and this gate fails with many mismatches.
// ============================================================================
'use strict';
const { loadApp } = require('./_load-app.cjs');

const app = loadApp('src/engine/kp-horary.ts');
const { kpNumberToLagna, kpNumberInfo } = app;

let pass = 0, fail = 0;
const ok = (cond, msg) => { cond ? pass++ : fail++; console.log(`${cond ? 'PASS' : 'FAIL'}  ${msg}`); };

// ---- absolute anchors: [number, expectedAbsArcsec, starLord, subLord] -------
// arcsec = signIndex*108000 + inSignArcsec ; sign codes AR..PI = 0..11.
const F = { KE:'Ketu', VE:'Venus', SU:'Sun', MO:'Moon', MA:'Mars', RA:'Rahu', JU:'Jupiter', SA:'Saturn', ME:'Mercury' };
const ANCHORS = [
  [1,        0, 'KE','KE'],   // AR 0°00'00"  — sequence start
  [2,     2800, 'KE','VE'],   // AR 0°46'40"
  [3,    10800, 'KE','SU'],   // AR 3°00'00"
  [10,   48000, 'VE','VE'],   // AR 13°20'00"
  [22,  105200, 'SU','RA'],   // AR 29°13'20" — split (first half)
  [23,  108000, 'SU','RA'],   // TA 0°00'00"  — split (second half), same star/sub
  [33,  164400, 'MO','SA'],   // TA 15°40'00" — structural twin
  [45,  233600, 'MA','SU'],   // GE 4°53'20"  — unfavourable worked example
  [63,  324000, 'JU','MO'],   // CA 0°00'00"  — split
  [106, 540000, 'SU','RA'],   // VI 0°00'00"  — split
  [108, 550800, 'SU','SA'],   // VI 3°00'00"  — favourable worked example
  [116, 596400, 'MO','SA'],   // VI 15°40'00" — the PDF-typo row (true 15°40'00")
  [124, 640400, 'MA','SA'],   // VI 27°53'20"
  [125, 648000, 'MA','ME'],   // LI 0°00'00"
  [146, 756000, 'JU','MO'],   // SC 0°00'00"  — split
  [189, 972000, 'SU','RA'],   // CP 0°00'00"  — split
  [199, 1028400,'MO','SA'],   // CP 15°40'00" — structural twin
  [200, 1036000,'MO','ME'],   // CP 17°46'40" — mixed worked example
  [229, 1188000,'JU','MO'],   // PI 0°00'00"  — split
  [249, 1288400,'ME','SA'],   // PI 27°53'20" — sequence end
];

console.log('--- absolute anchors (engine vs canonical table) ---');
for (const [n, absArcsec, star, sub] of ANCHORS) {
  const lon = kpNumberToLagna(n);
  const got = Math.round(lon * 3600);
  const info = kpNumberInfo(n);
  const good = got === absArcsec && info.starLord === F[star] && info.subLord === F[sub];
  ok(good, `#${n} → ${(absArcsec/3600).toFixed(4)}° ${F[star]}/${F[sub]}` +
    (good ? '' : `  (got ${(got/3600).toFixed(4)}° ${info.starLord}/${info.subLord})`));
}

// ---- structural twins at 15°40'00" (repeat every 83 numbers / 120°) --------
console.log('--- structural twins ---');
{
  const twins = [33, 116, 199].map(n => Math.round((kpNumberToLagna(n) % 30) * 3600));
  ok(twins.every(a => a === 56400), `33/116/199 all start at 15°40'00" in-sign  (got ${twins.map(a=>(a/3600).toFixed(4)).join(', ')})`);
}

// ---- the 6 sign-boundary split pairs share star & sub -----------------------
console.log('--- split pairs share star/sub ---');
for (const [a, b] of [[22,23],[62,63],[105,106],[145,146],[188,189],[228,229]]) {
  const ia = kpNumberInfo(a), ib = kpNumberInfo(b);
  const good = ia.starLord === ib.starLord && ia.subLord === ib.subLord &&
    Math.round((kpNumberToLagna(b) % 30) * 3600) === 0 && ib.sign === ia.sign + 1;
  ok(good, `#${a}/#${b} split: same ${ia.starLord}/${ia.subLord}, #${b} at sign start`);
}

// ---- exactly 12 sign-starts (one per rashi) --------------------------------
console.log('--- structure: sign starts, count, monotonic ---');
{
  const starts = [];
  for (let n = 1; n <= 249; n++) if (Math.round((kpNumberToLagna(n) % 30) * 3600) === 0) starts.push(n);
  const expected = [1,23,42,63,84,106,125,146,167,189,208,229];
  ok(JSON.stringify(starts) === JSON.stringify(expected), `12 sign-starts at ${expected.join(',')}  (got ${starts.join(',')})`);
}

// ---- all 249 valid, in [0,360), sign monotonic, longitude increasing/sign --
{
  let allFinite = true, signMonotonic = true, inSignIncreasing = true;
  let prevSign = -1, prevLon = -1;
  for (let n = 1; n <= 249; n++) {
    const lon = kpNumberToLagna(n), info = kpNumberInfo(n);
    if (!(Number.isFinite(lon) && lon >= 0 && lon < 360)) allFinite = false;
    if (info.sign < prevSign) signMonotonic = false;
    if (info.sign === prevSign && lon <= prevLon) inSignIncreasing = false;
    prevSign = info.sign; prevLon = lon;
  }
  ok(allFinite, 'all 249 numbers map to a finite lagna in [0°,360°)');
  ok(signMonotonic, 'sign index is monotonic non-decreasing across 1→249');
  ok(inSignIncreasing, 'longitude strictly increases within each sign');
}

// ---- range guard: only integers 1–249 are valid ----------------------------
console.log('--- range guard ---');
{
  const bad = [0, 250, -1, 1.5, NaN, '5', null, undefined];
  const rejected = bad.every(v => kpNumberToLagna(v) === null);
  ok(rejected, 'rejects 0, 250, -1, 1.5, NaN, "5", null, undefined → null');
  ok(kpNumberToLagna(1) === 0, 'number 1 → exactly 0° (start of Aries)');
}

console.log(`\n${fail === 0 ? 'ALL TESTS PASSED' : 'FAILURES PRESENT'}  (${pass} pass / ${fail} fail)`);
process.exit(fail === 0 ? 0 : 1);
