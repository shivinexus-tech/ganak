#!/usr/bin/env node
'use strict';

// Drik Panchang Lakshmi Puja anchors (fetched 2026-07-24):
// https://www.drikpanchang.com/festivals/lakshmipuja/festivals-lakshmipuja-timings.html

const assert = require('assert');
const { loadApp } = require('./_load-app.cjs');
const { lakshmiPujaTimings } = loadApp('src/engine/lakshmi-puja.ts');

const MINUTE = 60000;
const withinMinutes = (actual, expected, tolerance = 2) =>
  Number.isFinite(actual) && Math.abs(actual - expected) <= tolerance * MINUTE;
const localMs = (y, m, d, hh, mm, tzHours) =>
  Date.UTC(y, m - 1, d, hh, mm) - tzHours * 3600000;

const anchors = [
  {
    label: 'Diwali Lakshmi Puja · New Delhi 2026',
    place: { label: 'New Delhi', zone: 'Asia/Kolkata', lat: 28.6139, lon: 77.209 },
    day: localMs(2026, 11, 8, 12, 0, 5.5),
    pradosh: [localMs(2026, 11, 8, 17, 31, 5.5), localMs(2026, 11, 8, 20, 9, 5.5)],
    primary: [localMs(2026, 11, 8, 17, 55, 5.5), localMs(2026, 11, 8, 19, 51, 5.5)],
    amavasyaStart: localMs(2026, 11, 8, 11, 27, 5.5),
  },
  {
    label: 'Diwali Lakshmi Puja · Mumbai 2026',
    place: { label: 'Mumbai', zone: 'Asia/Kolkata', lat: 19.076, lon: 72.8777 },
    day: localMs(2026, 11, 8, 12, 0, 5.5),
    pradosh: [localMs(2026, 11, 8, 18, 2, 5.5), localMs(2026, 11, 8, 20, 34, 5.5)],
    primary: [localMs(2026, 11, 8, 18, 27, 5.5), localMs(2026, 11, 8, 20, 27, 5.5)],
  },
];

for (const anchor of anchors) {
  const out = lakshmiPujaTimings(anchor.place, 'lahiri', anchor.day);
  assert(out.primary, `${anchor.label}: primary muhurat required`);
  assert(withinMinutes(out.pradosh.start, anchor.pradosh[0]), `${anchor.label}: pradosh start`);
  assert(withinMinutes(out.pradosh.end, anchor.pradosh[1]), `${anchor.label}: pradosh end`);
  assert(withinMinutes(out.primary.start, anchor.primary[0]), `${anchor.label}: primary start`);
  assert(withinMinutes(out.primary.end, anchor.primary[1]), `${anchor.label}: primary end`);
  if (anchor.amavasyaStart) {
    assert(withinMinutes(out.amavasya.start, anchor.amavasyaStart), `${anchor.label}: amavasya start`);
  }
  console.log(`✓ ${anchor.label}`);
}

console.log('✓ lakshmi-puja-timings PASSED');
