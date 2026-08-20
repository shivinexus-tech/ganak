#!/usr/bin/env node
// ============================================================================
// validation/vara-consistency.cjs — ONE VARA PER CHART.
//
// Bug bash F12 (plans/audits/2026-08-18-bugbash-prashna-kp.md). Gulika/Mandi is a
// weekday construction: the day (sunrise→sunset) and the night (sunset→sunrise)
// are each divided into eight parts, the parts are ruled in weekday order from
// the lord of the VARA, and Gulika is the ascendant at the start of Saturn's
// part. A vara begins at SUNRISE — that is what makes it a vara and not a
// calendar date.
//
// src/engine/special-points.ts read the CIVIL weekday instead
// (`new Date(birthMs + tz*3600000).getUTCDay()`), while src/engine/kundli.ts
// applied the sunrise correction for the very same chart's Ruling Planets. Every
// birth between midnight and sunrise therefore ran Gulika on tomorrow's weekday
// and Ruling Planets on today's, and the Jyotish page printed both. Delhi
// 2026-08-18 03:00 IST: Ruling Planets Monday/Moon, Gulika Tuesday/Mars, and
// Gulika landed at Aquarius 1°30′ instead of Aquarius 29°36′.
//
// WHY THIS GATE IS NOT A TAUTOLOGY. It never asks the engine which weekday it
// used. It rebuilds the Gulika INSTANT from the classical rule for BOTH candidate
// weekdays — the civil one and the sunrise-reckoned one — takes the ascendant at
// each, and asks which of the two the shipped value actually equals. That is an
// external question with a yes/no answer, and on a pre-sunrise birth the two
// candidates are far apart (a whole eighth of the night), so the discrimination
// is real rather than nominal. It then asserts the answer is the vara, and that
// the same vara is the one the chart's own Ruling Planets were built from.
//
//   node validation/vara-consistency.cjs
// ============================================================================
'use strict';
const { loadApp } = require('./_load-app.cjs');

const { computeKundli } = loadApp('src/engine/kundli.ts');
const { sunEvents } = loadApp('src/engine/panchang.ts');
const { ascendantAt } = loadApp('src/engine/ephemeris.ts');

const WEEKDAY = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const LORDS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
const SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio',
  'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
const fmt = (v) => {
  const s = Math.floor(v / 30), d = v % 30, deg = Math.floor(d);
  return `${SIGNS[s]} ${deg}°${String(Math.round((d - deg) * 60)).padStart(2, '0')}′`;
};
const angDiff = (a, b) => { const d = Math.abs(((a - b) % 360 + 540) % 360 - 180); return d; };

let pass = 0, fail = 0;
const failures = [];
const ok = (cond, msg) => {
  if (cond) { pass += 1; } else { fail += 1; failures.push(msg); }
};

/* The classical construction, written out here from the rule rather than imported:
   Saturn's eighth of the day counts from the vara lord; the night's eight parts
   begin with the lord of the FIFTH weekday from the vara (the standard night-lord
   rule), and a pre-sunrise birth belongs to the PREVIOUS evening's night. */
function gulikaInstant(dow, birthMs, rise, set) {
  const dayLen = set - rise, nightLen = 24 * 3600000 - dayLen;
  const isDay = birthMs >= rise && birthMs < set;
  if (isDay) {
    const i = ((6 - dow) % 7 + 7) % 7;
    return rise + (i / 8) * dayLen;
  }
  const nightStartLord = (dow + 4) % 7;
  const i = ((6 - nightStartLord) % 7 + 7) % 7;
  const nightStart = birthMs >= set ? set : set - 24 * 3600000;
  return nightStart + (i / 8) * nightLen;
}

/* ---------------------------------------------------------------- the sweep
   Seven consecutive days (so every weekday is the vara at least once) x a clock
   grid that straddles sunrise and sunset x five places from the tropics to a
   high northern latitude, in both hemispheres. */
const PLACES = [
  { label: 'New Delhi', lat: 28.6139, lon: 77.2090, tz: 5.5 },
  { label: 'Chennai', lat: 13.0827, lon: 80.2707, tz: 5.5 },
  { label: 'London', lat: 51.5074, lon: -0.1278, tz: 0 },
  { label: 'Sydney', lat: -33.8688, lon: 151.2093, tz: 10 },
  { label: 'Reykjavik', lat: 64.1466, lon: -21.9426, tz: 0 },
];
const CLOCKS = [[0, 15], [2, 30], [3, 0], [4, 45], [5, 30], [6, 30], [9, 0],
  [12, 0], [17, 0], [19, 30], [22, 0], [23, 45]];
const MONTHS = [[2026, 1], [2026, 4], [2026, 8], [2026, 11]];

let charts = 0, preSunrise = 0, discriminating = 0, worstAgreement = 0;
const examples = [];

for (const [y, m] of MONTHS) {
  for (let day = 15; day <= 21; day += 1) {
    for (const pl of PLACES) {
      for (const [hh, mi] of CLOCKS) {
        const ev = sunEvents(y, m, day, pl.tz, pl.lat, pl.lon);
        if (ev.rise == null || ev.set == null) continue;   // polar day/night: no Gulika is built
        const r = computeKundli({ y, m, day, hh, mi, tz: pl.tz, lat: pl.lat, lon: pl.lon, ayanamsa: 'lahiri' });
        const gul = r.special.upagrahas.find((u) => u.k === 'Gulika / Mandi');
        if (!gul) continue;
        charts += 1;

        const utcMs = r.birthMs;
        const civil = new Date(utcMs + pl.tz * 3600000).getUTCDay();
        const vara = utcMs < ev.rise ? (civil + 6) % 7 : civil;
        const isPre = vara !== civil;
        if (isPre) preSunrise += 1;

        const ascOf = (dow) => ascendantAt(
          gulikaInstant(dow, utcMs, ev.rise, ev.set) / 86400000 + 2440587.5, pl.lat, pl.lon, r.ayan);
        const byVara = ascOf(vara), byCivil = ascOf(civil);
        const dVara = angDiff(gul.v, byVara), dCivil = angDiff(gul.v, byCivil);
        worstAgreement = Math.max(worstAgreement, dVara);

        const where = `${pl.label} ${y}-${String(m).padStart(2, '0')}-${day} ${String(hh).padStart(2, '0')}:${String(mi).padStart(2, '0')}`;

        // [1] The shipped Gulika is the one built from the VARA.
        ok(dVara < 1e-6,
          `${where}: shipped Gulika ${fmt(gul.v)} is not the vara-reckoned value ${fmt(byVara)} ` +
          `(off ${dVara.toFixed(4)}°); the civil-weekday value is ${fmt(byCivil)} (off ${dCivil.toFixed(4)}°)`);

        // [2] The chart's OWN Ruling Planets were built from that same vara.
        ok(r.rulingPlanets.dayLord === LORDS[vara],
          `${where}: Ruling-planet day lord is ${r.rulingPlanets.dayLord}, the vara is ${WEEKDAY[vara]} (${LORDS[vara]})`);

        /* [3] Not a vacuous test. On a pre-sunrise birth the two candidates must
           actually differ, or [1] would pass no matter which weekday was used. */
        if (isPre) {
          const sep = angDiff(byVara, byCivil);
          if (sep > 1) discriminating += 1;
          ok(sep > 1,
            `${where}: the civil and vara Gulika candidates are only ${sep.toFixed(4)}° apart, ` +
            `so this pre-sunrise case cannot tell them apart`);
          if (examples.length < 5) examples.push(
            `  ${where.padEnd(34)} civil ${WEEKDAY[civil].padEnd(9)} -> ${fmt(byCivil).padEnd(20)} | ` +
            `vara ${WEEKDAY[vara].padEnd(9)} -> ${fmt(byVara).padEnd(20)} | shipped ${fmt(gul.v)}`);
        }
      }
    }
  }
}

/* ------------------------------------------------ the audit's own worked case */
{
  const c = { y: 2026, m: 8, day: 18, hh: 3, mi: 0, tz: 5.5, lat: 28.6139, lon: 77.2090 };
  const r = computeKundli({ ...c, ayanamsa: 'lahiri' });
  const gul = r.special.upagrahas.find((u) => u.k === 'Gulika / Mandi');
  const sign = Math.floor(gul.v / 30), deg = gul.v % 30;
  console.log(`\nAudit case — New Delhi 2026-08-18 03:00 IST (sunrise 05:52, so the vara is still Monday)`);
  console.log(`  Ruling-planet day lord : ${r.rulingPlanets.dayLord}`);
  console.log(`  Gulika / Mandi         : ${fmt(gul.v)}`);
  ok(r.rulingPlanets.dayLord === 'Moon', `audit case: day lord is ${r.rulingPlanets.dayLord}, expected Moon`);
  ok(SIGNS[sign] === 'Aquarius' && Math.abs(deg - 29.6) < 0.15,
    `audit case: Gulika is ${fmt(gul.v)}; the Monday (vara) reckoning gives Aquarius 29°36′ and the ` +
    `Tuesday (civil) reckoning gives Aquarius 1°30′`);
}

console.log('\nDiscriminating pre-sunrise examples (the two candidate weekdays give different points):');
examples.forEach((e) => console.log(e));
console.log(`\ncharts swept            ${charts}`);
console.log(`pre-sunrise charts      ${preSunrise}   (of which discriminating: ${discriminating})`);
console.log(`worst |shipped − vara|  ${worstAgreement.toExponential(2)}°`);

if (charts < 500) { fail += 1; failures.push(`sweep collapsed to ${charts} charts — the gate is not exercising anything`); }
if (preSunrise < 100) { fail += 1; failures.push(`only ${preSunrise} pre-sunrise charts — the defect band is barely covered`); }

if (fail) {
  console.log('');
  failures.slice(0, 25).forEach((f) => console.log(`FAIL  ${f}`));
  if (failures.length > 25) console.log(`… and ${failures.length - 25} more`);
}
console.log(`\n${fail ? '✗' : '✓'} vara-consistency: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
