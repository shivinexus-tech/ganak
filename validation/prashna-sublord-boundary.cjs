#!/usr/bin/env node
// ============================================================================
// validation/prashna-sublord-boundary.cjs
//
// The 249 method pins the ascendant EXACTLY at a sub-segment start boundary.
// PR_castNumber reaches that degree through a tropical round-trip that lands
// up to 8.5e-14 deg BELOW it. PR_subOf's half-open (s >= from && s < to) test has
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
