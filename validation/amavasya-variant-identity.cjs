#!/usr/bin/env node
'use strict';
const assert = require('assert');
const { loadApp } = require('./_load-app.cjs');
const engine = loadApp('src/engine/festivals.ts');
const meta = loadApp('src/data/festival-meta.ts');
const pages = loadApp('src/data/festival-pages.ts');

const at = Date.UTC(2026, 7, 12, 6, 30);
const hariyali = engine.observancesFor(true, 15, 'Shravan', 3, at, 'canonical')[0];
assert.strictEqual(hariyali.key, 'amavasya_hariyali');
assert.strictEqual(meta.OBS_NAME[hariyali.key].en, 'Hariyali Amavasya (Shravana Amavasya)');
assert.strictEqual(meta.OBS_NAME[hariyali.key].hi, 'हरियाली अमावस्या (श्रावण अमावस्या)');
assert.strictEqual(pages.festivalPathForKey('fast', hariyali.key), '/festival/amavasya');

const north = engine.observancesFor(true, 15, 'Shravan', 3, at, 'north-purnimanta')[0];
assert.strictEqual(north.key, 'amavasya_hariyali');
const tamil = engine.observancesFor(true, 15, 'Shravan', 3, at, 'tamil-solar')[0];
assert.strictEqual(tamil.key, 'amavasya_aadi');
const bengali = engine.observancesFor(true, 15, 'Shravan', 3, at, 'bengali-solar')[0];
assert.strictEqual(bengali.key, 'amavasya');
const ordinary = engine.observancesFor(true, 15, 'Bhadrapad', 3, at, 'canonical')[0];
assert.strictEqual(ordinary.key, 'amavasya');

const delhi = { label: 'New Delhi', lat: 28.6139, lon: 77.209, zone: 'Asia/Kolkata' };
const losAngeles = { label: 'Los Angeles', lat: 34.0522, lon: -118.2437, zone: 'America/Los_Angeles' };
for (const [place, tz] of [[delhi,5.5],[losAngeles,-7]]) {
  for (const [mode, expected] of [['canonical','amavasya_hariyali'],['north-purnimanta','amavasya_hariyali'],['tamil-solar','amavasya_aadi'],['bengali-solar','amavasya']]) {
    const scan = engine.scanPanchangCalendar(Date.UTC(2026, 7, 12), tz, 2, 2, place, mode);
    assert(scan.fasts.some(x => x.key === expected), `${place.label} ${mode} scanner must emit ${expected}`);
  }
}
const daily = require('fs').readFileSync('src/screens/DailyScreen.tsx','utf8');
const calendarPage = require('fs').readFileSync('src/screens/CalendarPage.tsx','utf8');
assert(daily.includes('calendarMode={calendarMode}'), 'Daily must pass the selected convention to child calendar surfaces');
assert(calendarPage.includes('place, calendarMode)'), 'full-year calendar scanner must use the selected convention');
console.log('AMAVASYA VARIANT IDENTITY PASSED (Hariyali/default+North, Aadi/Tamil, neutral Bengali)');
