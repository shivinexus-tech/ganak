#!/usr/bin/env node
'use strict';

const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { loadApp, ROOT } = require('./_load-app.cjs');
const { computeTodayPanchang } = loadApp('src/engine/today-panchang.ts');
const { observancesFor } = loadApp('src/engine/festivals.ts');

const DELHI = { label: 'New Delhi, India', lat: 28.6139, lon: 77.2090, zone: 'Asia/Kolkata' };
const atDelhiNoon = (day) => Date.UTC(2026, 6, day, 6, 30);

const ashtami = computeTodayPanchang(DELHI, 'lahiri', atDelhiNoon(21));
assert.strictEqual(ashtami.tithis[0].name, 'Ashtami');
assert.strictEqual(ashtami.tithiNum, 7, 'astronomy index remains zero-based');
assert.strictEqual(ashtami.tithiDay, 8, 'Ashtami must expose human tithi day 8');
assert(observancesFor(ashtami.krishna, ashtami.tithiDay).some((item) => item.key === 'masikDurgashtami'),
  'Shukla Ashtami must show Masik Durgashtami');

for (const day of [22, 23]) {
  const navami = computeTodayPanchang(DELHI, 'lahiri', atDelhiNoon(day));
  assert.strictEqual(navami.tithis[0].name, 'Navami');
  assert.strictEqual(navami.tithiNum, 8, 'astronomy index remains zero-based');
  assert.strictEqual(navami.tithiDay, 9, 'Navami must expose human tithi day 9');
  assert(!observancesFor(navami.krishna, navami.tithiDay).some((item) => item.key === 'masikDurgashtami'),
    'Navami must never show Masik Durgashtami');
}

const hub = fs.readFileSync(path.join(ROOT, 'src/screens/MuhuratHub.tsx'), 'utf8');
assert.strictEqual((hub.match(/observancesFor\([^\n]*\.tithiDay/g) || []).length, 2,
  'both Daily summary and Hora must use the human tithi day');
assert(!/observancesFor\([^\n]*\.tithiNum/.test(hub),
  'Daily observance lookups must not receive the zero-based astronomy index');
assert(hub.includes('"lunar day " + p.tithiDay'), 'visible lunar-day ordinal must be human-facing');

console.log('DAILY OBSERVANCE REGRESSION PASSED (Shukla Ashtami shows Durgashtami; Navami does not; ordinal is 1-based)');
