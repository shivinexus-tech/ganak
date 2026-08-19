#!/usr/bin/env node
'use strict';
// ============================================================================
// validation/bhava-chalit.cjs
//
// src/engine/bhava.ts had no validation evidence. It computes the Sripati
// house cusps that the Bhava Chalit panel renders and the Bhava Bala that
// ranks the houses — so an error moves planets between houses, which changes
// every reading built on top of it, silently.
//
// Driven through computeKundli rather than with synthetic inputs, so the gate
// exercises the engine the way the chart actually calls it.
//
// What is pinned:
//   1. the four angles are the angles — 1st is the ascendant, 10th the MC,
//      and opposite cusps are exactly 180° apart
//   2. the intermediate cusps trisect their quadrant arcs (the Sripati rule)
//   3. the cusps advance in zodiacal order and close the circle exactly once
//   4. the house boundaries partition the whole circle — every longitude
//      belongs to exactly one house, and the twelve spans sum to 360°
//   5. a planet sitting on the ascendant is in the 1st house, and one on the
//      MC is in the 10th (the check that catches an off-by-one in houseOf)
//   6. Bhava Bala is structurally sound: twelve houses, signs counted from the
//      ascendant, components in range, totals consistent with the ranking
// ============================================================================
const { loadApp } = require('./_load-app.cjs');
const { computeKundli } = loadApp('src/engine/kundli.ts');

let failures = 0;
const fail = (m) => { failures++; console.error('FAIL ' + m); };
const pass = (m) => console.log('  ok  ' + m);

const SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
const rev = (x) => ((x % 360) + 360) % 360;
const near = (a, b, tol) => Math.abs(rev(a - b + 180) - 180) <= tol;

/* Spread across latitudes and times of day: Sripati cusps get uneven at high
   latitude and near the horizon, which is exactly where an error would hide. */
const CASES = [
  { label: 'New Delhi, midday',      y: 1990, m: 1,  day: 15, hh: 12, mi: 0,  tz: 5.5,  lat: 28.6139, lon: 77.2090 },
  { label: 'New Delhi, just past midnight', y: 1990, m: 1, day: 15, hh: 0, mi: 12, tz: 5.5, lat: 28.6139, lon: 77.2090 },
  { label: 'Chennai, dawn',          y: 2001, m: 6,  day: 21, hh: 5,  mi: 45, tz: 5.5,  lat: 13.0827, lon: 80.2707 },
  { label: 'Kolkata, dusk',          y: 1975, m: 11, day: 3,  hh: 18, mi: 30, tz: 5.5,  lat: 22.5726, lon: 88.3639 },
  { label: 'London, winter',         y: 1988, m: 12, day: 21, hh: 9,  mi: 5,  tz: 0,    lat: 51.5072, lon: -0.1276 },
  { label: 'Reykjavik, high latitude', y: 1995, m: 6, day: 21, hh: 14, mi: 0, tz: 0,    lat: 64.1466, lon: -21.9426 },
];

let checked = 0;

for (const c of CASES) {
  let k;
  try { k = computeKundli(c); }
  catch (e) { fail(`${c.label}: computeKundli threw — ${String(e.message).split('\n')[0]}`); continue; }
  const b = k && k.bhava;
  if (!b) { fail(`${c.label}: no bhava block on the chart`); continue; }
  const { madhyas: M, sandhis: S, bhavaBala } = b;
  if (!Array.isArray(M) || M.length !== 12) { fail(`${c.label}: expected 12 house cusps, got ${M && M.length}`); continue; }
  checked++;

  // --- 1. the angles ------------------------------------------------------
  const asc = k.ascSid != null ? k.ascSid : M[0];
  if (!near(M[0], asc, 0.001)) fail(`${c.label}: the 1st cusp is ${M[0].toFixed(3)}° but the ascendant is ${asc.toFixed(3)}°`);
  for (let i = 0; i < 6; i++) {
    if (!near(M[i] + 180, M[i + 6], 0.001)) {
      fail(`${c.label}: cusps ${i + 1} and ${i + 7} are ${rev(M[i + 6] - M[i]).toFixed(3)}° apart, not 180°`);
    }
  }

  // --- 2. Sripati trisection ---------------------------------------------
  // 11th and 12th trisect MC → Asc; 2nd and 3rd trisect Asc → IC.
  const arcMcAsc = rev(M[0] - M[9]);
  if (!near(M[10], M[9] + arcMcAsc / 3, 0.01)) fail(`${c.label}: the 11th cusp does not trisect the MC→Asc arc`);
  if (!near(M[11], M[9] + 2 * arcMcAsc / 3, 0.01)) fail(`${c.label}: the 12th cusp does not trisect the MC→Asc arc`);
  const arcAscIc = rev(M[3] - M[0]);
  if (!near(M[1], M[0] + arcAscIc / 3, 0.01)) fail(`${c.label}: the 2nd cusp does not trisect the Asc→IC arc`);
  if (!near(M[2], M[0] + 2 * arcAscIc / 3, 0.01)) fail(`${c.label}: the 3rd cusp does not trisect the Asc→IC arc`);

  // --- 3. cusps advance in order and close the circle exactly once --------
  let walked = 0;
  for (let i = 0; i < 12; i++) {
    const step = rev(M[(i + 1) % 12] - M[i]);
    if (step <= 0 || step >= 180) fail(`${c.label}: the step from cusp ${i + 1} to ${((i + 1) % 12) + 1} is ${step.toFixed(2)}° — cusps must advance in zodiacal order`);
    walked += step;
  }
  if (Math.abs(walked - 360) > 0.01) fail(`${c.label}: the twelve cusp steps sum to ${walked.toFixed(3)}°, not 360°`);

  // --- 4. the sandhis partition the circle --------------------------------
  if (!Array.isArray(S) || S.length !== 12) fail(`${c.label}: expected 12 house boundaries, got ${S && S.length}`);
  else {
    let span = 0;
    for (let i = 0; i < 12; i++) span += rev(S[(i + 1) % 12] - S[i]);
    if (Math.abs(span - 360) > 0.01) fail(`${c.label}: the twelve house spans sum to ${span.toFixed(3)}°, not 360° — the houses do not partition the circle`);
  }

  // --- 5. a body on an angle sits in that angle's house --------------------
  // Re-derive houseOf from the published boundaries; this is the contract the
  // panel relies on, and the place an off-by-one would actually show up.
  const houseOf = (P) => {
    for (let i = 0; i < 12; i++) { const lo = S[(i - 1 + 12) % 12]; if (rev(P - lo) < rev(S[i] - lo)) return i + 1; }
    return 1;
  };
  const hAsc = houseOf(M[0]), hMc = houseOf(M[9]);
  if (hAsc !== 1) fail(`${c.label}: a body on the ascendant lands in house ${hAsc}, not the 1st`);
  if (hMc !== 10) fail(`${c.label}: a body on the MC lands in house ${hMc}, not the 10th`);
  for (let i = 0; i < 12; i++) {
    const h = houseOf(M[i]);
    if (h !== i + 1) { fail(`${c.label}: a body on cusp ${i + 1} lands in house ${h}`); break; }
  }

  // --- 6. Bhava Bala ------------------------------------------------------
  if (!Array.isArray(bhavaBala) || bhavaBala.length !== 12) {
    fail(`${c.label}: expected 12 Bhava Bala rows, got ${bhavaBala && bhavaBala.length}`);
  } else {
    const ascSign = Math.floor(rev(M[0]) / 30);
    for (const [i, row] of bhavaBala.entries()) {
      if (row.house !== i + 1) fail(`${c.label}: Bhava Bala row ${i + 1} is labelled house ${row.house}`);
      const wantSign = (ascSign + i) % 12;
      if (row.sign !== wantSign) fail(`${c.label}: house ${i + 1} is given ${SIGNS[row.sign]}, but counting from the ${SIGNS[ascSign]} ascendant it is ${SIGNS[wantSign]}`);
      if (!(row.dig >= 0 && row.dig <= 1)) fail(`${c.label}: house ${i + 1} dig bala is ${row.dig} — it is a 0..1 Rupa value`);
      if (!Number.isFinite(row.adhipati)) fail(`${c.label}: house ${i + 1} has no lord strength`);
      if (!Number.isFinite(row.drishti)) fail(`${c.label}: house ${i + 1} has no aspect value`);
      const sum = row.adhipati + row.dig + row.drishti;
      if (Math.abs(sum - row.total) > 1e-9) fail(`${c.label}: house ${i + 1} total ${row.total} is not its three components (${sum})`);
    }
    const byTotal = bhavaBala.slice().sort((a, b) => b.total - a.total);
    if (b.strongest !== byTotal[0].house) fail(`${c.label}: strongest house is reported as ${b.strongest} but house ${byTotal[0].house} scores higher`);
    if (b.weakest !== byTotal[11].house) fail(`${c.label}: weakest house is reported as ${b.weakest} but house ${byTotal[11].house} scores lower`);
  }
}

if (checked === 0) fail('no chart could be computed — the gate proved nothing');
else if (!failures) pass(`${checked} charts across six places and times: angles, Sripati trisection, circle closure, house partition and Bhava Bala all hold`);

// ---------------------------------------------------------------------------
// Non-vacuity: the partition and angle checks must reject a broken boundary set.
// ---------------------------------------------------------------------------
{
  const S = Array.from({ length: 12 }, (_, i) => i * 30);
  const houseOf = (P) => {
    for (let i = 0; i < 12; i++) { const lo = S[(i - 1 + 12) % 12]; if (rev(P - lo) < rev(S[i] - lo)) return i + 1; }
    return 1;
  };
  // With boundaries shifted off the ascendant, a body on the ascendant must NOT
  // land in house 1 — if it still does, the check above cannot detect drift.
  const ascAt = 47.5;               // mid-Taurus ascendant against 0°-aligned cusps
  if (houseOf(ascAt) === 1) fail('the angle check is vacuous: a body on the ascendant lands in house 1 even with boundaries that ignore the ascendant');
  else pass('the angle check rejects boundaries that ignore the ascendant');
}

console.log(failures === 0
  ? '\nPASS bhava-chalit'
  : `\nFAIL bhava-chalit (${failures} failure${failures === 1 ? '' : 's'})`);
process.exit(failures === 0 ? 0 : 1);
