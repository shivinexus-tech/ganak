#!/usr/bin/env node
'use strict';
// ============================================================================
// validation/drik-reference-anchors.cjs
//
// Pins the two reference-source divergences found in the 2026-08-12 Drik
// cross-check, so neither can silently come back:
//
//   C3-MOONSET-DRIK   moonset must be the set that CLOSES the day's moonrise,
//                     not the first set inside the civil day. Reporting the
//                     in-day set pairs the day with the PREVIOUS day's rise and
//                     lands a whole lunar retardation (~43 min) early.
//
//   C3-GODHULI-DRIK   Godhuli Muhurta BEGINS at sunset and runs for half a
//                     night muhurta. The old rule centred a half-muhurta on
//                     sunset and so opened ~14 min early.
//
// DECLARED TOLERANCES. Ganak's Moon uses a truncated series, so lunar events
// carry a small systematic bias against Drik: measured 3-5 minutes across these
// four anchors, in the SAME direction for rise and set (moonrise early, moonset
// late — the Moon sits fractionally high, not mis-paired). Solar events agree to
// the displayed minute. Godhuli is derived from sunset, so it inherits the solar
// tolerance. These are the tolerances Ganak declares for the respective family:
const SOLAR_TOL = 2;   // minutes — sunrise, sunset, and anything derived from them
const LUNAR_TOL = 6;   // minutes — moonrise, moonset
//
// The tolerance checks alone would let a rule drift back inside the band, so the
// RULE itself is asserted exactly (to the millisecond) and the pairing invariant
// is swept across a year and four cities.
// ============================================================================
const { loadApp } = require('./_load-app.cjs');
const { computeTodayPanchang } = loadApp('src/engine/today-panchang.ts');

let failures = 0, checks = 0;
const fail = (m) => { failures++; console.error('FAIL ' + m); };
const ok = () => { checks++; };

const DELHI = { lat: 28.6139, lon: 77.2090, zone: 'Asia/Kolkata' };
const MUMBAI = { lat: 19.0760, lon: 72.8777, zone: 'Asia/Kolkata' };
const CHENNAI = { lat: 13.0827, lon: 80.2707, zone: 'Asia/Kolkata' };
const KOLKATA = { lat: 22.5726, lon: 88.3639, zone: 'Asia/Kolkata' };

const panchangFor = (place, y, m, d) =>
  computeTodayPanchang(place, 'lahiri', Date.UTC(y, m - 1, d, 12) - 5.5 * 3600000);

// Local wall-clock minutes past midnight, plus the local civil date.
const localMin = (ms, tz) => { const t = new Date(ms + tz * 3600000); return t.getUTCHours() * 60 + t.getUTCMinutes(); };
const localDate = (ms, tz) => new Date(ms + tz * 3600000).toISOString().slice(0, 10);
const hm = (ms, tz) => ms == null ? '—' : new Date(ms + tz * 3600000).toISOString().slice(0, 16).replace('T', ' ');
const near = (label, ms, tz, want, tol) => {
  if (ms == null) return fail(`${label}: no value (expected ${want})`);
  const got = localMin(ms, tz);
  const delta = Math.abs(got - want);
  if (delta > tol) fail(`${label}: ${hm(ms, tz)} is ${delta} min from the published ${Math.floor(want / 60)}:${String(want % 60).padStart(2, '0')} (tolerance ${tol})`);
  else ok();
};
const at = (h, mi) => h * 60 + mi;

// ---------------------------------------------------------------------------
// Published Drik Panchang anchors (read 2026-08-14). Four anchors across three
// cities and two seasons, so the Godhuli rule cannot be an overfit to one night:
// the window's own length varies from 20 to 27 minutes across them.
// ---------------------------------------------------------------------------
const ANCHORS = [
  { label: 'New Delhi 2026-07-25', place: DELHI, y: 2026, m: 7, d: 25,
    sunset: at(19, 17), godhuli: [at(19, 17), at(19, 37)],
    moonrise: at(16, 20), moonset: at(2, 16), moonsetDate: '2026-07-26' },
  { label: 'New Delhi 2026-11-15', place: DELHI, y: 2026, m: 11, d: 15,
    sunset: at(17, 27), godhuli: [at(17, 27), at(17, 54)],
    moonrise: at(11, 45), moonset: at(22, 14), moonsetDate: '2026-11-15' },
  { label: 'Mumbai 2026-07-25', place: MUMBAI, y: 2026, m: 7, d: 25,
    sunset: at(19, 17), godhuli: [at(19, 17), at(19, 39)],
    moonrise: at(16, 12), moonset: at(3, 1), moonsetDate: '2026-07-26' },
  { label: 'Chennai 2026-07-25', place: CHENNAI, y: 2026, m: 7, d: 25,
    sunset: at(18, 38), godhuli: [at(18, 38), at(19, 1)],
    moonrise: at(15, 27), moonset: at(2, 45), moonsetDate: '2026-07-26' },
];

for (const a of ANCHORS) {
  const P = panchangFor(a.place, a.y, a.m, a.d);
  const tz = P.tz, g = P.dailyWindows && P.dailyWindows.godhuli;
  near(`${a.label} sunset`, P.set, tz, a.sunset, SOLAR_TOL);
  near(`${a.label} moonrise`, P.moonrise, tz, a.moonrise, LUNAR_TOL);
  near(`${a.label} moonset`, P.moonset, tz, a.moonset, LUNAR_TOL);

  // The whole point of C3-MOONSET-DRIK: the closing set usually lands on the
  // NEXT civil date, and the value must actually be that instant.
  if (P.moonset == null) fail(`${a.label}: no moonset`);
  else if (localDate(P.moonset, tz) !== a.moonsetDate) fail(`${a.label} moonset falls on ${localDate(P.moonset, tz)}, published ${a.moonsetDate} — the day is paired with the wrong moonrise`);
  else ok();

  if (!g) { fail(`${a.label}: no Godhuli window`); continue; }
  near(`${a.label} Godhuli start`, g.start, tz, a.godhuli[0], SOLAR_TOL);
  near(`${a.label} Godhuli end`, g.end, tz, a.godhuli[1], SOLAR_TOL);

  // The declared rule, asserted exactly — a tolerance band alone would let the
  // old sunset-centred rule creep back on a long summer night.
  if (g.start !== P.set) fail(`${a.label}: Godhuli starts ${hm(g.start, tz)}, must begin exactly at sunset ${hm(P.set, tz)}`);
  else ok();
  const halfNightMuhurta = (P.dailyWindows.end - P.set) / 30;
  if (Math.abs((g.end - g.start) - halfNightMuhurta) > 1000) fail(`${a.label}: Godhuli runs ${((g.end - g.start) / 60000).toFixed(2)} min, the declared half night-muhurta is ${(halfNightMuhurta / 60000).toFixed(2)} min`);
  else ok();
}

// ---------------------------------------------------------------------------
// Pairing invariant. Whenever a day has a moonrise, its moonset must be the set
// that closes THAT rise: strictly after it, and within one Moon-above-horizon
// span. The pre-fix engine violated this on roughly every day of the month.
// ---------------------------------------------------------------------------
const DAY = 86400000;
let sweptDays = 0, crossings = 0;
for (const [name, place] of [['Delhi', DELHI], ['Mumbai', MUMBAI], ['Chennai', CHENNAI], ['Kolkata', KOLKATA]]) {
  for (let i = 0; i < 90; i++) {
    const base = Date.UTC(2026, 0, 1, 12) - 5.5 * 3600000 + i * 4 * DAY;
    const t = new Date(base + 5.5 * 3600000);
    const P = computeTodayPanchang(place, 'lahiri', base);
    sweptDays++;
    if (P.moonrise == null || P.moonset == null) continue; // no rise or no set that day
    if (P.moonset <= P.moonrise) {
      fail(`${name} ${t.toISOString().slice(0, 10)}: moonset ${hm(P.moonset, P.tz)} precedes moonrise ${hm(P.moonrise, P.tz)} — paired with the previous day's rise`);
    } else if (P.moonset - P.moonrise > 16 * 3600000) {
      fail(`${name} ${t.toISOString().slice(0, 10)}: Moon above the horizon ${(((P.moonset - P.moonrise) / 3600000)).toFixed(1)} h — the set does not close this rise`);
    } else ok();
    if (localDate(P.moonset, P.tz) !== localDate(P.moonrise, P.tz)) crossings++;
  }
}
// Non-vacuity: if the sweep found no after-midnight moonset at all, the invariant
// above would be trivially satisfiable by the very bug it exists to catch.
if (crossings < sweptDays / 4) fail(`only ${crossings} of ${sweptDays} swept days put moonset after midnight — the sweep is not exercising the cross-midnight case`);
else ok();

console.log(failures
  ? `drik-reference-anchors: ${failures} FAILURES (${checks} checks passed, ${sweptDays} days swept, ${crossings} cross-midnight moonsets)`
  : `drik-reference-anchors: PASS — ${checks} checks, 4 published anchors, ${sweptDays} days swept across 4 cities, ${crossings} cross-midnight moonsets`);
process.exit(failures ? 1 : 0);
