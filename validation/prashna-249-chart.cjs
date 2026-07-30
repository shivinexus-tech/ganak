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
const norm360 = d => ((d % 360) + 360) % 360;

const IST = (y, mo, d, h, mi) => Date.UTC(y, mo - 1, d, h, mi) - 330 * 60000;
const DELHI = { lat: 28.6139, lon: 77.2090 };
const ms = IST(2026, 7, 24, 15, 30);
// Meeus JD(UT) for the fixed instant above — used to reconstruct the KP-New
// ayanamsa at that moment so sidereal cusps can be compared against the
// TROPICAL external reference (Swiss Ephemeris) below. Standard formula.
function jdUTof(msv) {
  const dt = new Date(msv);
  let y = dt.getUTCFullYear(), mo = dt.getUTCMonth() + 1;
  const day = dt.getUTCDate();
  const hUT = dt.getUTCHours() + dt.getUTCMinutes() / 60 + dt.getUTCSeconds() / 3600;
  if (mo <= 2) { y -= 1; mo += 12; }
  const A = Math.floor(y / 100), B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (mo + 1)) + day + B - 1524.5 + hUT / 24;
}

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

// 1b. EXTERNAL cusp cross-check vs Swiss Ephemeris ---------------------------
// The task "KP-New cusp numeric cross-check" required validating Ganak's 12
// Placidus house cusps against an INDEPENDENT reference. Reference chosen:
// Swiss Ephemeris (npm `sweph`) `swe_houses_armc(ARMC, lat, eps, 'P')`, the
// house engine behind Astrodienst (astro.com) and most professional KP/Vedic
// software. It returns TROPICAL Placidus cusps as a pure function of (ARMC,
// latitude, obliquity) — no time, ephemeris or ayanamsa — isolating exactly the
// Placidus semi-arc math. Since Ganak computes cusps on the tropical sky then
// shifts by the ayanamsa, the check is:  Ganak sidereal cusp + KP-New ayanamsa
// == reference tropical cusp.  Full method + evidence:
// plans/prashna-249-bugbash.md § "External KP-New cusp cross-check (2026-07-29)".
//
// The pinned numbers below are the Swiss Ephemeris tropical Placidus cusps for
// the fixed instant `ms` above; each matched Ganak to 0.0000" when the number's
// ascendant→RAMC inversion converges.
//
// ⚠️ STOP — VERIFICATION FOUND A BUG, NOT A CLEAN PASS. The full 1..249 sweep at
// three latitudes (New Delhi/London/Sydney) showed 72 of 747 charts disagree
// with Swiss Ephemeris by up to ~76°, in contiguous, latitude-dependent number
// bands (Delhi #39–53, London #29–65, Sydney #37–56). Root cause: PR_ramcForAsc
// (PrashnaScreen.tsx, in the number-method region BELOW the frozen parity
// markers) is a wrap-around-unsafe bisection that mis-converges for numbers
// whose tropical ascendant places the true RAMC in its blind half — it returns
// the wrong RAMC, so cusps 2–12 (MC, intermediates and their opposites) are
// built from that wrong RAMC and are INCONSISTENT with the correctly-pinned
// ascendant. This corrupts the sub-lord-based verdict for affected numbers on
// every question whose cusp ≠ 1/7. These anchors therefore cover only the
// convergent numbers; the item is NOT closed as "verified correct". See the
// bugbash note. Do NOT add anchors for the buggy bands until PR_ramcForAsc is
// fixed (robust root-find), then re-run this cross-check across the full range.
console.log('--- external Placidus cusp anchors (Swiss Ephemeris, KP-New tropical) ---');
{
  const T = (jdUTof(ms) + 72 / 86400 - 2451545) / 36525; // TT centuries (ΔT=72s)
  const ayan = PR_kpNewAyan(T);
  // Swiss Ephemeris tropical Placidus cusps 1..12 (independent reference).
  const ANCHORS = [
    { n: 108, lat: 28.6139, lon: 77.2090, trop: [177.137692, 205.028817, 235.455321, 267.019947, 298.546689, 328.991444, 357.137692, 25.028817, 55.455321, 87.019947, 118.546689, 148.991444] },
    { n: 200, lat: 28.6139, lon: 77.2090, trop: [311.915469, 352.385789, 28.097112, 56.416353, 80.463206, 104.106895, 131.915469, 172.385789, 208.097112, 236.416353, 260.463206, 284.106895] },
    { n: 108, lat: 51.5074, lon: -0.1278, trop: [177.137692, 200.671162, 230.418472, 266.275855, 302.529857, 332.918061, 357.137692, 20.671162, 50.418472, 86.275855, 122.529857, 152.918061] },
  ];
  const TOL = 0.02; // degrees (~72"); measured worst Δ on these anchors = 0.0000"
  for (const A of ANCHORS) {
    const c = PR_castNumber(ms, A.lat, A.lon, A.n);
    let maxd = 0;
    for (let h = 1; h <= 12; h++) {
      let g = norm360(c.cusps[h] + ayan);          // Ganak sidereal → tropical
      let dd = Math.abs(g - A.trop[h - 1]); if (dd > 180) dd = 360 - dd;
      if (dd > maxd) maxd = dd;
    }
    ok(maxd < TOL, `#${A.n} @lat ${A.lat}: 12 cusps match Swiss Ephemeris KP-New Placidus (max Δ ${(maxd * 3600).toFixed(2)}″)`);
  }
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
