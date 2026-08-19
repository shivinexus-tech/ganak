#!/usr/bin/env node
'use strict';
const assert = require('node:assert');
const { loadApp } = require('./_load-app.cjs');

const { sadeSatiReport, SADE_SATI_PHASES } = loadApp('src/engine/sade-sati-report.ts');
const copy = loadApp('src/data/sade-sati-report.ts');
const calc = loadApp('src/engine/utility-calculators.ts');

const HOUR = 3600000;
const DAY = 24 * HOUR;
const YEAR = 365.25 * DAY;
const IST = 5.5 * HOUR;
const ist = (y, m, d, hh, mi) => Date.UTC(y, m - 1, d, hh, mi) - IST;   // an IST wall-clock moment
const iso = (ms) => new Date(ms + IST).toISOString().replace('T', ' ').slice(0, 16) + ' IST';
const yrs = (ms) => ms / YEAR;

// ---------------------------------------------------------------------------
// PLAUSIBLE CYCLE LENGTH — why these two numbers
//
// Sade Sati is Saturn crossing 90° of the zodiac. Saturn's orbit is 29.457
// years and eccentric (e = 0.0565), so a quarter-orbit takes 6.64 years at the
// fast (perihelion) end and 8.14 years at the slow (aphelion) end. The dates we
// publish are geocentric, and Earth's own orbit swings Saturn's apparent
// longitude by up to ±6° — worth about half a year of Saturn's motion — so a
// single boundary crossing can fall up to ~0.5 years either side of that.
// 6.0 and 9.5 years bracket every real passage with room to spare; the observed
// spread over 1,608 reports spanning 1900–2100 is 6.36 to 8.93 years.
//
// This is a physical bound, NOT a filter. Nothing in the engine clips a cycle
// to fit it: if a cycle ever lands outside this range the engine is wrong.
// (Before 2026-08-18 it produced cycles of 44 DAYS — 0.12 years — because a
// retrograde wobble out of the entry sign closed the interval and started a
// new one. See plans/audits/2026-08-18-bugbash-matching-dosha.md, finding F2.)
// ---------------------------------------------------------------------------
const MIN_CYCLE_YEARS = 6.0;
const MAX_CYCLE_YEARS = 9.5;
// Two Sade Satis for one chart are one Saturn orbit apart, minus the passage
// itself: 29.46 - 8.93 = 20.5 years at the very tightest.
const MIN_GAP_YEARS = 15;

assert.deepStrictEqual(SADE_SATI_PHASES.map(p => p.phase), ['rising','middle','setting'], 'phase order drifted');

// ===========================================================================
// 1. PUBLISHED ANCHORS
//
// Every boundary below is a Saturn sign-ingress moment published by Drik
// Panchang's Shani Gochar (Saturn Transit) tables for New Delhi, IST:
//   https://www.drikpanchang.com/planet/transit/shani-transit-date-time.html?year=YYYY
// read on 2026-08-18. They are fixed historical/ephemeris dates, never "today's
// sky", so this section can never drift into testing the engine against itself.
//
// A Sade Sati passage runs from Saturn's FIRST entry into the 12th sign from
// the natal Moon to its FINAL departure from the 2nd — the convention published
// Sade Sati tables use, and the reason a retrograde re-entry belongs to the
// passage it interrupts rather than starting a new one. The ↺ notes below mark
// exactly those re-entries; three of these five anchors would be impossible to
// satisfy if the engine treated a wobble as a new cycle.
// ===========================================================================
const ANCHORS = [
  {
    label: 'Dhanu Moon — Sade Sati 2 Nov 2014 → 17 Jan 2023',
    birth: { y:1990, m:1, day:24, hh:12, mi:0, tz:5.5, lat:28.6139, lon:77.209 },
    moonSign: 'Dhanu (Sagittarius)',
    asOf: Date.UTC(2019, 0, 1, 12),
    // Vrishchika 2014-11-02 22:01 · Dhanu 2017-01-26 21:34, ↺ Vrishchika
    // 2017-06-21 01:35, Dhanu 2017-10-26 18:12 · Makara 2020-01-24 12:10 ·
    // Kumbha 2022-04-29 12:17, ↺ Makara 2022-07-12 10:27, Kumbha 2023-01-17 20:02
    bounds: [ist(2014,11,2,22,1), ist(2017,10,26,18,12), ist(2020,1,24,12,10), ist(2023,1,17,20,2)],
  },
  {
    label: 'Makara Moon — Sade Sati 26 Jan 2017 → 29 Mar 2025 (retrograde re-entry inside the OPENING phase)',
    birth: { y:1990, m:1, day:26, hh:12, mi:0, tz:5.5, lat:28.6139, lon:77.209 },
    moonSign: 'Makara (Capricorn)',
    asOf: Date.UTC(2021, 0, 1, 12),
    // Starts at Saturn's FIRST Dhanu ingress 2017-01-26, not the 2017-10-26
    // re-entry: the June–October 2017 dip back to Vrishchika is inside the cycle.
    bounds: [ist(2017,1,26,21,34), ist(2020,1,24,12,10), ist(2023,1,17,20,2), ist(2025,3,29,23,1)],
  },
  {
    label: 'Kumbha Moon — Sade Sati 24 Jan 2020 → 23 Feb 2028',
    birth: { y:1990, m:1, day:1, hh:12, mi:0, tz:5.5, lat:28.6139, lon:77.209 },
    moonSign: 'Kumbha (Aquarius)',
    asOf: Date.UTC(2026, 6, 22),
    // Ends at Saturn's FINAL Mesha ingress 2028-02-23 20:00, after Mesha
    // 2027-06-03 06:23 and the ↺ Meena 2027-10-20 06:05 return.
    bounds: [ist(2020,1,24,12,10), ist(2023,1,17,20,2), ist(2025,3,29,23,1), ist(2028,2,23,20,0)],
  },
  {
    label: 'Dhanu Moon — Sade Sati 1 Jan 1926 → 7 Dec 1934 (longest observed, wobbles at BOTH ends)',
    birth: { y:1990, m:1, day:24, hh:12, mi:0, tz:5.5, lat:28.6139, lon:77.209 },
    moonSign: 'Dhanu (Sagittarius)',
    asOf: Date.UTC(1930, 5, 1, 12),
    // Vrishchika 1926-01-01 11:54, ↺ Tula 1926-05-13 20:16, Vrishchika
    // 1926-09-30 05:02 · Dhanu 1928-12-25 02:19 · Makara 1931-04-12 08:30,
    // ↺ Dhanu 1931-05-25 10:18, Makara 1931-12-24 21:58 · Kumbha 1934-03-15
    // 23:33, ↺ Makara 1934-09-13 23:51, Kumbha 1934-12-07 15:55
    bounds: [ist(1926,1,1,11,54), ist(1928,12,25,2,19), ist(1931,12,24,21,58), ist(1934,12,7,15,55)],
  },
  {
    label: 'Mithuna Moon — Sade Sati 28 Apr 1971 → 7 Sep 1977 (shortest observed, clean crossings)',
    birth: { y:2001, m:9, day:11, hh:18, mi:20, tz:5.5, lat:13.08, lon:80.27 },
    moonSign: 'Mithuna (Gemini)',
    asOf: Date.UTC(1974, 0, 1, 12),
    // Vrishabha 1971-04-28 11:06 · Mithuna 1973-06-10 19:40 ·
    // Karka 1975-07-23 17:01 · Simha 1977-09-07 12:12 — no re-entries at all.
    bounds: [ist(1971,4,28,11,6), ist(1973,6,10,19,40), ist(1975,7,23,17,1), ist(1977,9,7,12,12)],
  },
];

// Drik publishes to the minute; Ganak's own panchang engine is a compact model,
// and across these 20 boundaries it lands within about three hours. Six hours
// keeps the published DATE exact while allowing that known model spread.
const ANCHOR_TOL = 6 * HOUR;
let worstAnchor = 0;
for (const a of ANCHORS) {
  const r = sadeSatiReport(a.birth, a.asOf);
  assert.strictEqual(r.moonSign, a.moonSign, `${a.label}: natal Moon sign drifted`);
  assert.strictEqual(r.cycle.status, 'current', `${a.label}: check date must sit inside this cycle`);
  assert.strictEqual(r.active, true, `${a.label}: check date must read as active`);
  const got = [r.cycle.start, ...r.cycle.phases.map(p => p.end)];
  const names = ['cycle start', 'end of opening phase', 'end of middle phase', 'cycle end'];
  for (let i = 0; i < 4; i++) {
    const off = Math.abs(got[i] - a.bounds[i]);
    worstAnchor = Math.max(worstAnchor, off);
    assert(off <= ANCHOR_TOL,
      `${a.label}: ${names[i]} is ${iso(got[i])}, published ${iso(a.bounds[i])} (off by ${(off/HOUR).toFixed(1)}h)`);
  }
  assert.deepStrictEqual(r.cycle.phases.map(p => p.phase), ['rising','middle','setting'], `${a.label}: phase sequence`);
}

// ===========================================================================
// 2. INVARIANT SWEEP — the shape a Sade Sati cycle must always have
//
// This is the guard against the F2 class of bug returning. It asserts nothing
// about WHICH cycle is right (section 1 does that); it asserts that whatever
// the engine returns is a Sade-Sati-shaped object: one passage of plausible
// length, exactly three phases in order that tile it exactly, and successive
// passages that neither overlap nor sit implausibly close together.
// ===========================================================================
const SWEEP_BIRTHS = [
  ['audit chart, Delhi 1990-06-15 09:30', { y:1990,m:6,day:15,hh:9,mi:30,tz:5.5,lat:28.6139,lon:77.209 }],
  ['Delhi 1990-01-01 12:00',              { y:1990,m:1,day:1,hh:12,mi:0,tz:5.5,lat:28.6139,lon:77.209 }],
  ['Mumbai 1988-05-07 09:15',             { y:1988,m:5,day:7,hh:9,mi:15,tz:5.5,lat:19.08,lon:72.88 }],
  ['Sydney 1975-11-30 23:59',             { y:1975,m:11,day:30,hh:23,mi:59,tz:11,lat:-33.87,lon:151.21 }],
  ['New York 1962-03-03 00:05',           { y:1962,m:3,day:3,hh:0,mi:5,tz:-5,lat:40.71,lon:-74.01 }],
  ['Tromso 1948-07-21 04:40',             { y:1948,m:7,day:21,hh:4,mi:40,tz:1,lat:69.65,lon:18.96 }],
  ['Chennai 2001-09-11 18:20',            { y:2001,m:9,day:11,hh:18,mi:20,tz:5.5,lat:13.08,lon:80.27 }],
];
const SWEEP_YEARS = [1900, 1911, 1931, 1955, 1974, 1990, 2005, 2026, 2044, 2061, 2085, 2100];

let reports = 0, cyclesChecked = 0, shortest = Infinity, longest = 0, tightestGap = Infinity;
for (const [label, birth] of SWEEP_BIRTHS) {
  for (const y of SWEEP_YEARS) {
    const asOf = Date.UTC(y, 0, 1, 12);
    const where = `${label} · checked ${y}-01-01`;
    const r = sadeSatiReport(birth, asOf);
    reports++;

    // -- the shown cycle -----------------------------------------------------
    const dur = yrs(r.cycle.end - r.cycle.start);
    shortest = Math.min(shortest, dur);
    longest = Math.max(longest, dur);
    assert(dur >= MIN_CYCLE_YEARS,
      `${where}: cycle ${iso(r.cycle.start)} → ${iso(r.cycle.end)} lasts ${dur.toFixed(2)} years — no Sade Sati is shorter than ${MIN_CYCLE_YEARS}`);
    assert(dur <= MAX_CYCLE_YEARS,
      `${where}: cycle lasts ${dur.toFixed(2)} years — longer than any real passage`);

    // -- exactly three phases, in order, tiling the cycle with no gap/overlap --
    const ph = r.cycle.phases;
    assert.deepStrictEqual(ph.map(p => p.phase), ['rising','middle','setting'],
      `${where}: phase sequence is ${ph.map(p => p.phase).join(' → ')} — must be one rising, one middle, one setting`);
    assert.strictEqual(ph[0].start, r.cycle.start, `${where}: opening phase must start with the cycle`);
    assert.strictEqual(ph[2].end, r.cycle.end, `${where}: closing phase must end with the cycle`);
    for (let i = 0; i < 3; i++) assert(ph[i].end > ph[i].start, `${where}: ${ph[i].phase} phase has no duration`);
    for (let i = 1; i < 3; i++) assert.strictEqual(ph[i].start, ph[i-1].end,
      `${where}: gap or overlap between the ${ph[i-1].phase} and ${ph[i].phase} phases`);
    const signs = ph.map(p => p.saturnSign);
    assert.strictEqual(new Set(signs).size, 3, `${where}: the three phases must name three different signs`);

    // -- the headline agrees with the segments -------------------------------
    const inside = asOf >= r.cycle.start && asOf < r.cycle.end;
    assert.strictEqual(r.active, inside, `${where}: "active" disagrees with the cycle dates`);
    const hit = ph.filter(p => asOf >= p.start && asOf < p.end);
    if (inside) {
      assert.strictEqual(hit.length, 1, `${where}: the check date must fall in exactly one phase`);
      assert.strictEqual(r.phase, hit[0].phase, `${where}: named phase disagrees with the phase segment`);
      assert.strictEqual(r.cycle.status, 'current', `${where}: an active cycle must read as current`);
    } else {
      assert.strictEqual(r.phase, 'none', `${where}: an inactive report must name no phase`);
      assert.strictEqual(r.cycle.status, r.cycle.start > asOf ? 'upcoming' : 'past', `${where}: nearest-cycle status`);
    }

    // -- every cycle in the window, not just the shown one --------------------
    assert(r.allCycles.length >= 2, `${where}: a 90-year window must contain at least two complete cycles`);
    for (const c of r.allCycles) {
      cyclesChecked++;
      const d = yrs(c.end - c.start);
      shortest = Math.min(shortest, d);
      longest = Math.max(longest, d);
      assert(d >= MIN_CYCLE_YEARS && d <= MAX_CYCLE_YEARS,
        `${where}: cycle ${iso(c.start)} → ${iso(c.end)} lasts ${d.toFixed(2)} years`);
    }
    for (let i = 1; i < r.allCycles.length; i++) {
      const gap = yrs(r.allCycles[i].start - r.allCycles[i-1].end);
      tightestGap = Math.min(tightestGap, gap);
      assert(gap > 0, `${where}: cycles ${i-1} and ${i} overlap or run backwards`);
      assert(gap >= MIN_GAP_YEARS,
        `${where}: only ${gap.toFixed(2)} years between one cycle and the next — a fragmented cycle, not two Sade Satis`);
    }
    // previous/next must be drawn from the same list and sit on the right side
    if (r.previousCycle) assert(r.previousCycle.end <= asOf, `${where}: "previous" cycle has not ended`);
    if (r.nextCycle) assert(r.nextCycle.start > asOf, `${where}: "next" cycle has already started`);
  }
}

// ===========================================================================
// 3. THE AUDITED REPRODUCTION — bugbash 2026-08-18, finding F2
// Birth 1990-06-15 09:30 Delhi rendered "Shown cycle: Mar 6, 2049 – Jul 9, 2049"
// (44 days at its worst) with a rising→middle→rising→middle→setting sequence.
// ===========================================================================
const audit = { y:1990, m:6, day:15, hh:9, mi:30, tz:5.5, lat:28.6139, lon:77.209 };
const f2 = sadeSatiReport(audit, Date.parse('2044-01-01T12:00:00Z'));
assert.strictEqual(f2.cycle.status, 'upcoming', 'F2 repro: 2044 check date is between cycles');
assert(yrs(f2.cycle.end - f2.cycle.start) >= MIN_CYCLE_YEARS,
  `F2 repro: the 2049 cycle is back to ${yrs(f2.cycle.end - f2.cycle.start).toFixed(2)} years`);
const f2b = sadeSatiReport(audit, Date.parse('2026-08-18T12:00:00Z'));
assert.deepStrictEqual(f2b.cycle.phases.map(p => p.phase), ['rising','middle','setting'],
  'F2 repro: the five-phase rising→middle→rising→middle→setting sequence is back');

// ===========================================================================
// 4. EXISTING CONTRACT — anchors, utility wiring and copy (unchanged)
// ===========================================================================
const delhi1990 = { y:1990,m:1,day:1,hh:12,mi:0,tz:5.5,lat:28.6139,lon:77.209 };
const report = sadeSatiReport(delhi1990, Date.UTC(2026,6,22));
assert.strictEqual(report.active, true, 'Delhi 1990 should be in Sade Sati on 2026-07-22');
assert.strictEqual(report.phase, 'setting', 'Delhi 1990 phase anchor');
assert.strictEqual(report.moonSign, 'Kumbha (Aquarius)', 'Moon sign anchor');
assert.strictEqual(report.saturnSign, 'Meena (Pisces)', 'Saturn sign anchor');
assert.strictEqual(report.saturnInBlock, true, 'Saturn must literally be inside the three-sign block here');
assert.strictEqual(report.cycle.status, 'current', 'active cycle must be current');
assert(report.cycle.start < Date.UTC(2026,6,22) && report.cycle.end > Date.UTC(2026,6,22), 'current cycle must contain selected date');
assert.strictEqual(report.cycle.phases.length, 3, 'a cycle has exactly three phases');
assert(report.cycle.phases.some(p => p.phase === 'setting' && Date.UTC(2026,6,22) >= p.start && Date.UTC(2026,6,22) < p.end), 'active phase segment must contain selected date');

const future = sadeSatiReport({ y:1988,m:5,day:7,hh:9,mi:15,tz:5.5,lat:19.08,lon:72.88 }, Date.UTC(2026,6,22));
assert.strictEqual(future.active, false, 'Mumbai 1988 anchor should not be active on 2026-07-22');
assert(['upcoming','past'].includes(future.cycle.status), 'inactive report must still show nearest cycle');
assert.strictEqual(future.cycle.phases.length, 3, 'inactive report must still expose the nearest cycle in three phases');

const viaUtility = calc.sadeSati(delhi1990, Date.UTC(2026,6,22));
assert.strictEqual(viaUtility.phase, report.phase, 'utility route must use the report engine');
assert(viaUtility.cycle && viaUtility.cycle.phases.length === 3, 'utility route must expose report fields');

assert(copy.SADE_SATI_METHOD_COPY.en && copy.SADE_SATI_METHOD_COPY.hi, 'method copy must be bilingual');
for (const p of ['rising','middle','setting','none']) assert(copy.SADE_SATI_PHASE_COPY[p].en && copy.SADE_SATI_PHASE_COPY[p].hi, `phase copy missing for ${p}`);
// The engine merges retrograde re-entries into one passage; the page must say so.
assert(/retrograde/i.test(copy.SADE_SATI_METHOD_COPY.en), 'method copy must explain that retrograde returns stay inside the same cycle');
assert(copy.SADE_SATI_METHOD_COPY.hi.includes('वक्री'), 'Hindi method copy must explain the retrograde convention too');
assert(copy.SADE_SATI_GUIDANCE.en.length >= 3 && copy.SADE_SATI_GUIDANCE.hi.length >= 3, 'guidance must be substantive and bilingual');

console.log(`Sade Sati report: PASS — 5 published Drik anchors (worst boundary off by ${(worstAnchor/HOUR).toFixed(1)}h of ${(ANCHOR_TOL/HOUR)}h allowed), ` +
  `${reports} reports × ${cyclesChecked} cycles swept 1900–2100: length ${shortest.toFixed(2)}–${longest.toFixed(2)} yrs, ` +
  `tightest gap between cycles ${tightestGap.toFixed(1)} yrs, every cycle three phases in order with no gap or overlap`);
