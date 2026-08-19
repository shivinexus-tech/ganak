#!/usr/bin/env node
'use strict';
// ============================================================================
// validation/gochar-transits.cjs
//
// src/engine/gochar.ts had no validation evidence. It builds the transit
// timeline the Gochar panel, the Daily transit line, the BNN screen and the
// Bhrigu engine all read, so an error there is repeated on four surfaces.
//
// The engine scans in half-day steps and bisects for the crossing. That design
// has one specific failure mode — a crossing falling entirely between two
// samples — and it would not look like an error, only like a planet that
// teleported. So the sharpest checks here are the ones a missed crossing
// breaks:
//
//   1. consecutive signs in a timeline are ADJACENT. A planet may only move to
//      the next sign, or back to the previous one when retrograde. A two-sign
//      jump means a crossing was missed.
//   2. the Sun and the Moon never station. Geocentric longitude for both is
//      always direct, so any retrograde station is a false positive.
//   3. Rahu and Ketu only ever move backwards through the signs.
//   4. Ketu is always exactly six signs from Rahu.
//   5. stations alternate retrograde/direct — two retrogrades in a row means a
//      station was invented or one was lost.
//   6. entry times are ordered, finite and inside the requested span; each
//      sign's exit is the next sign's entry.
// ============================================================================
const { loadApp } = require('./_load-app.cjs');
const { planetGochar, PLANET_PERIOD_DAYS } = loadApp('src/engine/gochar.ts');

let failures = 0;
const fail = (m) => { failures++; console.error('FAIL ' + m); };
const pass = (m) => console.log('  ok  ' + m);

const SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
const FROM = Date.UTC(2026, 0, 1, 0, 0);
const day = (ms) => new Date(ms).toISOString().slice(0, 10);
const forward = (a, b) => (b - a + 12) % 12 === 1;
const backward = (a, b) => (a - b + 12) % 12 === 1;

const PLANETS = Object.keys(PLANET_PERIOD_DAYS);
const results = {};

for (const p of PLANETS) {
  const span = PLANET_PERIOD_DAYS[p];
  let r;
  try { r = planetGochar(p, FROM, span); }
  catch (e) { fail(`${p}: planetGochar threw — ${String(e.message).split('\n')[0]}`); continue; }
  results[p] = r;
  const { seq, stations } = r;

  if (!Array.isArray(seq) || !seq.length) { fail(`${p}: empty transit timeline over ${span} days`); continue; }

  // --- 6. entry ordering and span containment -----------------------------
  if (seq[0].enter !== null) fail(`${p}: the first sign should have no entry time (the timeline starts mid-sign), got ${seq[0].enter}`);
  const end = FROM + span * 86400000;
  let prevEnter = FROM;
  for (let i = 1; i < seq.length; i++) {
    const e = seq[i].enter;
    if (!Number.isFinite(e)) { fail(`${p}: entry ${i} into ${SIGNS[seq[i].sign]} has no time`); continue; }
    if (e < FROM || e > end) fail(`${p}: entry into ${SIGNS[seq[i].sign]} at ${day(e)} lies outside the requested ${span}-day span`);
    if (e <= prevEnter) fail(`${p}: entry into ${SIGNS[seq[i].sign]} at ${day(e)} is not after the previous entry`);
    prevEnter = e;
  }
  for (let i = 0; i < seq.length; i++) {
    const want = i + 1 < seq.length ? seq[i + 1].enter : null;
    if (seq[i].exit !== want) fail(`${p}: the exit from ${SIGNS[seq[i].sign]} is not the entry into the next sign`);
  }

  // --- 1. adjacency: the check a missed crossing fails ---------------------
  for (let i = 1; i < seq.length; i++) {
    const a = seq[i - 1].sign, b = seq[i].sign;
    if (!forward(a, b) && !backward(a, b)) {
      fail(`${p}: jumps ${SIGNS[a]} → ${SIGNS[b]} at ${day(seq[i].enter)} — signs must be adjacent, so a crossing was missed by the half-day scan`);
      break;
    }
    if (seq[i].sign === a) fail(`${p}: records an entry into ${SIGNS[a]} while already in it`);
  }

  // --- 5. stations alternate ----------------------------------------------
  for (let i = 1; i < stations.length; i++) {
    if (stations[i].retro === stations[i - 1].retro) {
      fail(`${p}: two ${stations[i].retro ? 'retrograde' : 'direct'} stations in a row at ${day(stations[i - 1].t)} and ${day(stations[i].t)} — stations must alternate`);
      break;
    }
  }
  for (let i = 1; i < stations.length; i++) {
    if (stations[i].t <= stations[i - 1].t) { fail(`${p}: stations are not in time order`); break; }
  }
}

// --- 2. the luminaries never station ---------------------------------------
for (const p of ['Sun', 'Moon']) {
  const st = results[p] && results[p].stations;
  if (!st) continue;
  if (st.length) fail(`${p}: reports ${st.length} retrograde station(s), first at ${day(st[0].t)} — geocentric ${p === 'Sun' ? 'solar' : 'lunar'} longitude is always direct`);
  else pass(`${p} reports no retrograde stations, as it must`);
}

// --- 3. the nodes only move backwards --------------------------------------
for (const p of ['Rahu', 'Ketu']) {
  const seq = results[p] && results[p].seq;
  if (!seq || seq.length < 2) { fail(`${p}: too few sign changes over ${PLANET_PERIOD_DAYS[p]} days to judge direction`); continue; }
  let wrong = 0;
  for (let i = 1; i < seq.length; i++) if (!backward(seq[i - 1].sign, seq[i].sign)) wrong++;
  if (wrong) fail(`${p}: ${wrong} of ${seq.length - 1} sign changes move forward — the nodes are always retrograde`);
  else pass(`${p} moves backwards through all ${seq.length - 1} sign changes`);
}

// --- 4. Ketu is always opposite Rahu ---------------------------------------
{
  const R = results.Rahu && results.Rahu.seq, K = results.Ketu && results.Ketu.seq;
  if (!R || !K) fail('cannot compare the nodes');
  else {
    const signAt = (seq, t) => { let s = seq[0].sign; for (const e of seq) if (e.enter !== null && e.enter <= t) s = e.sign; return s; };
    let bad = 0;
    for (let d = 0; d <= PLANET_PERIOD_DAYS.Rahu; d += 7) {
      const t = FROM + d * 86400000;
      if ((signAt(R, t) + 6) % 12 !== signAt(K, t)) bad++;
    }
    if (bad) fail(`Ketu is not six signs from Rahu on ${bad} of the sampled weeks`);
    else pass('Ketu stays exactly six signs from Rahu across the whole span');
  }
}

// --- expected motion rates, as a coarse sanity bound ------------------------
//
// The bound must be on SIGN CHANGES, not net progress, and the two differ.
// A retrograde loop that straddles a cusp crosses it three times for one sign
// of net motion — Jupiter does exactly that here, entering Cancer in June 2026,
// Leo in October, then retrograding back into Cancer in January 2027 after its
// December station. An upper bound set from mean motion alone would call that
// correct behaviour a defect. The lower bound is the one that catches a stalled
// scan; the upper bound is loosened to allow one retrograde re-crossing per
// cusp for the planets that station.
{
  const EXPECT = {
    Sun:     [12, 14],  // 400d ÷ 30.4d per sign; never retrogrades
    Moon:    [15, 16],  // 35d ÷ 2.28d per sign (sidereal month ÷ 12); never retrogrades
    Jupiter: [1, 4],    // 430d ÷ ~361d per sign, plus retrograde re-crossings
    Saturn:  [1, 4],    // 1200d ÷ ~898d per sign, plus retrograde re-crossings
  };
  let rateFail = 0;
  for (const [p, [lo, hi]] of Object.entries(EXPECT)) {
    const n = results[p] ? results[p].seq.length - 1 : 0;
    if (n < lo || n > hi) { fail(`${p}: ${n} sign changes in ${PLANET_PERIOD_DAYS[p]} days, expected between ${lo} and ${hi}`); rateFail++; }
  }
  if (!rateFail) pass('the Sun, Moon, Jupiter and Saturn change sign at rates consistent with their mean motion and retrogression');
}

if (!failures) pass(`${PLANETS.length} planets: adjacency, entry ordering and station alternation all hold`);

// --- non-vacuity ------------------------------------------------------------
{
  // A timeline that skips a sign must be rejected by the adjacency rule.
  const skipped = [{ sign: 0 }, { sign: 2 }];
  const ok = forward(skipped[0].sign, skipped[1].sign) || backward(skipped[0].sign, skipped[1].sign);
  if (ok) fail('the adjacency check is vacuous: Aries → Gemini was accepted as an adjacent step');
  else pass('the adjacency check rejects a skipped sign');
}

console.log(failures === 0
  ? '\nPASS gochar-transits'
  : `\nFAIL gochar-transits (${failures} failure${failures === 1 ? '' : 's'})`);
process.exit(failures === 0 ? 0 : 1);
