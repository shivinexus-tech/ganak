#!/usr/bin/env node
// ============================================================================
// validation/prashna-249-chart.cjs — KP horary NUMBER-mode chart derivation.
//
// The number method keeps the real sky (planets for the actual moment/place)
// but frames the houses from the number's ascendant. This gate proves:
//   1. the ascendant IS exactly the number's degree (inversion round-trip),
//   2. the planets are the real-sky planets (identical to the time chart),
//   3. the number personalises the frame (different numbers → different cusps
//      and can change the verdict),
//   4. the cusp set is valid, and the number chart judges without error.
// PR_castNumber lives BELOW the parity-frozen engine markers, so it reuses the
// same Placidus/ephemeris the time mode uses while parity stays byte-exact.
// ============================================================================
'use strict';
const { loadApp } = require('./_load-app.cjs');

const scr = loadApp('src/screens/PrashnaScreen.tsx');
const eng = loadApp('src/engine/kp-horary.ts');
const { PR_cast, PR_castNumber, PR_judge, QUESTIONS, PR_kpNewAyan } = scr;
const { kpNumberToLagna } = eng;

let pass = 0, fail = 0;
const ok = (c, m) => { c ? pass++ : fail++; console.log(`${c ? 'PASS' : 'FAIL'}  ${m}`); };

const IST = (y, mo, d, h, mi) => Date.UTC(y, mo - 1, d, h, mi) - 330 * 60000;
const DELHI = { lat: 28.6139, lon: 77.2090 };
const ms = IST(2026, 7, 24, 15, 30);

// 0. KP-New ayanamsa constant matches the published value --------------------
console.log('--- KP-New ayanamsa constant (Balachandran 2003) ---');
{
  const T = 31 / 36525; // 1 Feb 2000 12:00 TT ≈ JD 2451576.0
  const val = PR_kpNewAyan(T);
  const published = 23 + 46 / 60 + 4 / 3600; // 23°46'04"
  ok(Math.abs(val - published) < 0.002, `KP-New = ${val.toFixed(5)}° at 1 Feb 2000 vs published 23°46'04" (${(Math.abs(val - published) * 3600).toFixed(1)}" off)`);
}

// 1. ascendant round-trip: cusps[1] must equal the number's sidereal lagna ----
console.log('--- ascendant = number degree (round-trip) ---');
for (const n of [1, 45, 108, 200, 249]) {
  const chart = PR_castNumber(ms, DELHI.lat, DELHI.lon, n);
  const want = kpNumberToLagna(n);
  let d = Math.abs(chart.cusps[1] - want); if (d > 180) d = 360 - d;
  ok(d < 1e-6, `#${n}: cusp 1 = ${chart.cusps[1].toFixed(4)}° vs number ${want.toFixed(4)}°  (Δ ${d.toExponential(1)}°)`);
}

// 2. planets are the REAL sky in KP-New sidereal: a UNIFORM shift from the
//    Lahiri time chart (same tropical sky, only the ayanamsa differs) --------
console.log('--- planets = real sky, uniformly shifted Lahiri→KP-New ---');
{
  const timeChart = PR_cast(ms, DELHI.lat, DELHI.lon);           // Lahiri
  const numChart = PR_castNumber(ms, DELHI.lat, DELHI.lon, 108); // KP-New
  const signed = (a, b) => { let d = a - b; if (d > 180) d -= 360; if (d < -180) d += 360; return d; };
  const deltas = [];
  for (let k = 0; k < 9; k++) deltas.push(signed(numChart.planets[k].lon, timeChart.planets[k].lon));
  const d0 = deltas[0];
  ok(deltas.every(d => Math.abs(d - d0) < 1e-9), `every planet shifted by the SAME amount (real sky preserved; ${(d0 * 60).toFixed(2)}′)`);
  ok(Math.abs(d0) > 0.02 && Math.abs(d0) < 0.20, `shift is the KP-New offset (not zero, not Lahiri): ${(d0 * 60).toFixed(2)}′`);
}

// 3. personalisation: different numbers → different frames / verdicts ---------
console.log('--- number personalises the houses ---');
{
  const q = QUESTIONS.find(x => x.key === 'marriage');
  const cA = PR_castNumber(ms, DELHI.lat, DELHI.lon, 108);
  const cB = PR_castNumber(ms, DELHI.lat, DELHI.lon, 45);
  const cuspMoved = Math.abs(cA.cusps[q.cusp] - cB.cusps[q.cusp]) > 1e-6;
  ok(cuspMoved, `two numbers give a different ${q.cusp}th cusp (${cA.cusps[q.cusp].toFixed(2)}° vs ${cB.cusps[q.cusp].toFixed(2)}°)`);

  // across many numbers the marriage verdict is not a constant (frame matters)
  const verdicts = new Set();
  for (let n = 1; n <= 249; n += 7) verdicts.add(PR_judge(PR_castNumber(ms, DELHI.lat, DELHI.lon, n), q).verdict);
  ok(verdicts.size >= 2, `marriage verdict varies with the number across the range (${[...verdicts].join(', ')})`);
}

// 4. cusp set valid + judges without error for every number & question -------
console.log('--- cusp validity + judgment robustness ---');
{
  let allValid = true, allJudged = true;
  for (const n of [1, 23, 60, 108, 150, 200, 249]) {
    const c = PR_castNumber(ms, DELHI.lat, DELHI.lon, n);
    for (let h = 1; h <= 12; h++) if (!(c.cusps[h] >= 0 && c.cusps[h] < 360)) allValid = false;
    for (const q of QUESTIONS) {
      const v = PR_judge(c, q);
      if (!['favourable', 'unfavourable', 'mixed'].includes(v.verdict)) allJudged = false;
    }
  }
  ok(allValid, 'all 12 cusps are finite and in [0°,360°) for sampled numbers');
  ok(allJudged, 'every question judges to a valid verdict on a number chart');
}

// 5. invalid number → null (no chart) ----------------------------------------
console.log('--- guard ---');
ok(PR_castNumber(ms, DELHI.lat, DELHI.lon, 0) === null && PR_castNumber(ms, DELHI.lat, DELHI.lon, 250) === null
   && PR_castNumber(ms, DELHI.lat, DELHI.lon, 1.5) === null,
   'invalid numbers (0, 250, 1.5) → null, no chart cast');

// 6. high-latitude equal-house fallback (same as time mode) ------------------
console.log('--- high-latitude fallback ---');
{
  const c = PR_castNumber(ms, 64.1466, -21.9426, 108); // Reykjavik
  ok(c.system === 'equal', `Reykjavik number chart falls back to equal houses (got ${c.system})`);
}

console.log(`\n${fail === 0 ? 'ALL TESTS PASSED' : 'FAILURES PRESENT'}  (${pass} pass / ${fail} fail)`);
process.exit(fail === 0 ? 0 : 1);
