#!/usr/bin/env node
'use strict';
const fs = require('fs');
const { loadApp } = require('./_load-app.cjs');
const { panchangDayISO, computeTodayPanchang } = loadApp('src/engine/today-panchang.ts');
const { sunEvents, zoneOffset } = loadApp('src/engine/panchang.ts');

let failures = 0, checks = 0;
const check = (condition, message) => { checks++; if (!condition) { failures++; console.error('FAIL ' + message); } };
const fixtures = [
  ['Delhi', { lat:28.6139, lon:77.2090, zone:'Asia/Kolkata' }, 2026, 8, 15, '2026-08-14', '2026-08-15'],
  ['New York DST', { lat:40.7128, lon:-74.0060, zone:'America/New_York' }, 2026, 3, 8, '2026-03-07', '2026-03-08'],
];
for (const [label, place, y, m, d, previousISO, currentISO] of fixtures) {
  const tz = zoneOffset(place.zone, y, m, d);
  const rise = sunEvents(y, m, d, tz, place.lat, place.lon).rise;
  check(Number.isFinite(rise), `${label}: fixture sunrise missing`);
  check(panchangDayISO(place, rise - 1) === previousISO, `${label}: instant before sunrise did not retain the previous Panchang day`);
  check(panchangDayISO(place, rise) === currentISO, `${label}: exact sunrise did not start the new Panchang day`);
  check(panchangDayISO(place, rise + 1) === currentISO, `${label}: instant after sunrise did not stay on the current day`);
  const P = computeTodayPanchang(place, 'lahiri', rise - 1);
  check(P.anchor < rise && P.nextRise === rise, `${label}: computed pre-dawn Panchang does not close at today's sunrise`);
}

// Explicit dates are evaluated at local noon by DailyScreen and therefore must
// remain the selected civil date rather than being silently rolled back.
{
  const place = fixtures[0][1], tz = 5.5;
  const noon = Date.UTC(2026, 7, 15, 12) - tz * 3600000;
  check(panchangDayISO(place, noon) === '2026-08-15', 'explicit local-noon date changed');
  check(new Date(computeTodayPanchang(place, 'lahiri', noon).anchor + tz * 3600000).getUTCDate() === 15, 'explicit date astronomy changed day');
}

// With no real sunrise, keep the civil date; never invent a polar boundary.
{
  const polar = { lat:78.2232, lon:15.6469, zone:'Arctic/Longyearbyen' };
  check(panchangDayISO(polar, Date.parse('2026-01-15T02:00:00Z')) === '2026-01-15', 'polar no-sunrise fallback did not retain civil date');
}

const daily = fs.readFileSync('src/screens/DailyScreen.tsx', 'utf8');
check(/if \(place\) return panchangDayISO\(place, Date\.now\(\)\)/.test(daily), 'DailyScreen does not use the shared sunrise-day selector');
check(/HolidayOverlayCard isoDate=\{panchDate\}/.test(daily), 'holiday overlay is not bound to the visible Panchang day');
check(/if \(isPanchToday\) return computeTodayPanchang/.test(daily), 'Today astronomy is not bound to the automatic sunrise-day path');

console.log(failures ? `panchang-day-boundary: ${failures} FAILURES (${checks - failures} passed)` : `panchang-day-boundary: PASS — ${checks} checks; pre-dawn rollback, sunrise turnover, DST, explicit dates and polar fallback pinned`);
process.exit(failures ? 1 : 0);
