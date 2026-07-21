#!/usr/bin/env node
'use strict';

// Permanent regression gate for city-specific Navratri Ghatasthapana and
// Dashami-parana calculations. Published Drik Panchang anchors deliberately use
// different cities and edge shapes: a normal first-third window, an Abhijit
// fallback display, Navami ending after sunrise, and Navami ending before sunrise.
// Anchors (accessed 2026-07-21):
// - https://www.drikpanchang.com/navratri/ashadha/ashadha-gupta-navratri-ghatasthapana.html?time-format=24hour&year=2026
// - https://www.drikpanchang.com/navratri/magha/magha-gupta-navratri-ghatasthapana.html?time-format=24hour&year=2026
// - https://www.drikpanchang.com/navratri/ashadha/ashadha-gupta-navratri-parana-time.html
// - https://www.drikpanchang.com/navratri/ashadha/ashadha-gupta-navratri-parana-time.html?lang=en

const assert = require('assert');
const fs = require('fs');
const { loadApp } = require('./_load-app.cjs');
const { navratriTimings } = loadApp('src/engine/navratri.ts');

const MINUTE = 60000;
const withinMinutes = (actual, expected, tolerance = 3) =>
  Number.isFinite(actual) && Math.abs(actual - expected) <= tolerance * MINUTE;
const localMs = (y, m, d, hh, mm, tzHours) =>
  Date.UTC(y, m - 1, d, hh, mm) - tzHours * 3600000;
const fmt = (ms, tzHours) => new Date(ms + tzHours * 3600000).toISOString().slice(0, 16).replace('T', ' ');

const anchors = [
  {
    label: 'Ashadha Ghatasthapana · Karnal 2026',
    place: { label: 'Karnal', zone: 'Asia/Kolkata', lat: 29.6857, lon: 76.9905 },
    start: localMs(2026, 7, 15, 12, 0, 5.5),
    primary: [localMs(2026, 7, 15, 5, 32, 5.5), localMs(2026, 7, 15, 10, 9, 5.5)],
  },
  {
    label: 'Magha Ghatasthapana · Natore 2026',
    place: { label: 'Natore', zone: 'Asia/Dhaka', lat: 24.4206, lon: 88.9939 },
    start: localMs(2026, 1, 19, 12, 0, 6),
    primary: [localMs(2026, 1, 19, 6, 50, 6), localMs(2026, 1, 19, 10, 26, 6)],
    abhijit: [localMs(2026, 1, 19, 11, 53, 6), localMs(2026, 1, 19, 12, 37, 6)],
  },
];

for (const anchor of anchors) {
  const result = navratriTimings(anchor.place, anchor.start);
  assert(result && result.ghatasthapana && result.ghatasthapana.primary, `${anchor.label}: primary window missing`);
  const primary = result.ghatasthapana.primary;
  assert(withinMinutes(primary.start, anchor.primary[0]), `${anchor.label}: start ${fmt(primary.start, result.tz)} not near published ${fmt(anchor.primary[0], result.tz)}`);
  assert(withinMinutes(primary.end, anchor.primary[1]), `${anchor.label}: end ${fmt(primary.end, result.tz)} not near published ${fmt(anchor.primary[1], result.tz)}`);
  assert(primary.start < primary.end, `${anchor.label}: non-positive primary window`);
  if (anchor.abhijit) {
    const abhijit = result.ghatasthapana.abhijit;
    assert(abhijit, `${anchor.label}: Abhijit window missing`);
    assert(withinMinutes(abhijit.start, anchor.abhijit[0]), `${anchor.label}: Abhijit start mismatch`);
    assert(withinMinutes(abhijit.end, anchor.abhijit[1]), `${anchor.label}: Abhijit end mismatch`);
  }
  console.log(`PASS  ${anchor.label}: ${fmt(primary.start, result.tz)}–${fmt(primary.end, result.tz)}`);
}

const paranaAnchors = [
  {
    label: 'Ashadha parana · Ichalkaranji 2026 (Navami ends after sunrise)',
    place: { label: 'Ichalkaranji', zone: 'Asia/Kolkata', lat: 16.6913, lon: 74.4605 },
    start: localMs(2026, 7, 15, 12, 0, 5.5),
    expected: localMs(2026, 7, 23, 7, 3, 5.5),
    basis: 'navami-end',
  },
  {
    label: 'Ashadha parana · Shkoder 2026 (Navami ends before sunrise)',
    place: { label: 'Shkoder', zone: 'Europe/Tirane', lat: 42.0693, lon: 19.5033 },
    start: localMs(2026, 7, 15, 12, 0, 2),
    expected: localMs(2026, 7, 23, 5, 26, 2),
    basis: 'sunrise',
  },
];

for (const anchor of paranaAnchors) {
  const result = navratriTimings(anchor.place, anchor.start);
  assert(result && result.parana, `${anchor.label}: parana missing`);
  assert(withinMinutes(result.parana.start, anchor.expected), `${anchor.label}: ${fmt(result.parana.start, result.tz)} not near published ${fmt(anchor.expected, result.tz)}`);
  assert.strictEqual(result.parana.basis, anchor.basis, `${anchor.label}: wrong rule branch`);
  assert(result.parana.start >= result.parana.navamiEnd, `${anchor.label}: parana precedes Navami end`);
  console.log(`PASS  ${anchor.label}: ${fmt(result.parana.start, result.tz)} (${result.parana.basis})`);
}

assert.throws(
  () => navratriTimings({ label: 'Missing coordinates', zone: 'Asia/Kolkata' }, Date.now()),
  /place-required/,
  'missing observer coordinates must fail clearly',
);

// Prove that the dedicated festival route actually calls the new engine rather
// than leaving a correct-but-unused helper behind.
const guideScreen = loadApp('src/screens/FestivalGuideScreen.tsx');
const delhi = { label: 'New Delhi', zone: 'Asia/Kolkata', lat: 28.6139, lon: 77.2090 };
const ashadhGuide = guideScreen.festivalGuideFromPath('/festival/gupt-navratri-ashadha');
const wired = guideScreen.findLocalFestivalOccurrence(ashadhGuide, delhi, Date.UTC(2026, 0, 1));
assert(wired.hit && wired.detail && wired.detail.navratri, 'Ashadha dedicated page must receive Navratri timing detail');
assert(wired.detail.navratri.ghatasthapana.primary, 'Ashadha dedicated page must receive Ghatasthapana');
assert(wired.detail.navratri.parana, 'Ashadha dedicated page must receive parana');
console.log('PASS  Dedicated Gupt Navratri page is wired to the timing engine');

const userCopy = fs.readFileSync('src/data/vrat-vidhis.ts', 'utf8');
for (const forbidden of ['Sadhana app', 'KBUF', 'Rajarshi Nandy', 'Gayatri Navratri']) {
  assert(!userCopy.includes(forbidden), `user-facing vrat copy must not contain research-source label: ${forbidden}`);
}

console.log('\nNAVRATRI TIMING REGRESSION PASSED');
