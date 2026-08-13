#!/usr/bin/env node
'use strict';

const assert = require('node:assert');
const fs = require('node:fs');
const { loadApp } = require('./_load-app.cjs');
const engine = loadApp('src/engine/festivals.ts');

const DELHI = { label: 'New Delhi', lat: 28.6139, lon: 77.2090, zone: 'Asia/Kolkata' };
const IST = 5.5;
const selectedDay = Date.UTC(2026, 7, 12, 6, 30);
const scan = engine.scanPanchangCalendar(Date.UTC(2026, 7, 11, 18, 30), IST, 3, 20, DELHI, 'north-purnimanta');
const observances = engine.observancesFor(true, 15, 'Shravan', 3, selectedDay, 'north-purnimanta');
const events = engine.eventsForDay(observances, scan.festivals, selectedDay, IST);

assert(events.some((event) => event.kind === 'fast' && event.key === 'amavasya_hariyali'),
  '12 Aug Delhi must retain Hariyali Amavasya in the combined day result');
assert(events.some((event) => event.kind === 'festival' && event.key === 'suryaGrahan'),
  '12 Aug Delhi must surface the calculated solar eclipse in the combined day result');
assert.strictEqual(new Set(events.map((event) => `${event.kind}:${event.key}`)).size, events.length,
  'combined day result must remove exact duplicates');

const duplicateProof = engine.eventsForDay(
  [observances[0], observances[0]],
  [scan.festivals.find((event) => event.key === 'suryaGrahan'), scan.festivals.find((event) => event.key === 'suryaGrahan')],
  selectedDay,
  IST,
);
assert.strictEqual(duplicateProof.length, 2, 'dedupe must keep one fast and one festival');

const nextDay = engine.eventsForDay([], scan.festivals, selectedDay + 86400000, IST);
assert(!nextDay.some((event) => event.key === 'suryaGrahan'), 'an event must not leak into the next civil day');

const ui = fs.readFileSync('src/screens/MuhuratHub.tsx', 'utf8');
assert(ui.includes('eventsForDay(obs, cal.festivals, dayStart, tz)'), 'Today card must consume the combined day result');
assert(!ui.includes('const fastObs = obs.find'), 'Today card must not collapse the day to one observance');
assert(ui.includes('dayEvents.map((event)'), 'Today card must render every combined day event');
assert(ui.includes('Check local visibility and Sutak'), 'eclipse chip must explain the location-specific next step');

console.log('DAY EVENT COMPLETENESS PASSED (Hariyali Amavasya + Surya Grahan together, deduped, civil-day bounded)');
