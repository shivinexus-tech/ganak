#!/usr/bin/env node
'use strict';

const assert = require('node:assert');
const fs = require('node:fs');
const { loadApp } = require('./_load-app.cjs');
const clock = loadApp('src/engine/vedic-season-clock.ts');

const DELHI = { zone: 'Asia/Kolkata', lat: 28.6139, lon: 77.2090 };
const IST = 5.5;
const minute = (ms) => new Date(ms + IST * 3600000).toISOString().slice(11, 16);
const degNear = (label, got, expected, toleranceDeg = 0.2) => {
  const diff = Math.min(Math.abs(got - expected), 360 - Math.abs(got - expected));
  if (diff > toleranceDeg) throw new Error(`${label}: ${got.toFixed(3)}° differs from ${expected}° by ${diff.toFixed(3)}°`);
  console.log(`PASS  ${label}: ${got.toFixed(3)}° (within ${toleranceDeg}°)`);
};

// Ritu mapping from sidereal Sun longitude
assert.strictEqual(clock.computeVedicSeasonClock(DELHI, 'lahiri', Date.UTC(2026, 3, 15, 6) - IST * 3600000).ritu.key, 'vasanta', 'Mesha Sun should be Vasanta');
assert.strictEqual(clock.computeVedicSeasonClock(DELHI, 'lahiri', Date.UTC(2026, 7, 20, 6) - IST * 3600000).ritu.key, 'varsha', 'Simha Sun should be Varsha');
assert.strictEqual(clock.computeVedicSeasonClock(DELHI, 'lahiri', Date.UTC(2026, 0, 15, 6) - IST * 3600000).ritu.key, 'hemant', 'Makar Sun should be Hemant');

// Ghati at sunrise should be near zero
const summerDay = clock.computeVedicSeasonClock(DELHI, 'lahiri', Date.UTC(2026, 6, 21, 6) - IST * 3600000);
assert(summerDay.ghati, 'ghati clock must exist for Delhi summer day');
const atSunrise = clock.computeVedicSeasonClock(DELHI, 'lahiri', summerDay.ghati.sunrise + 60000);
assert(atSunrise.ghati.ghati <= 1 && atSunrise.ghati.pal <= 5, `ghati near sunrise should be ~0, got ${atSunrise.ghati.ghati}-${atSunrise.ghati.pal}`);

// Midday should be roughly half the ghatis
const midday = summerDay.ghati.sunrise + (summerDay.ghati.nextSunrise - summerDay.ghati.sunrise) / 2;
const mid = clock.computeVedicSeasonClock(DELHI, 'lahiri', midday);
assert(mid.ghati.ghati >= 25 && mid.ghati.ghati <= 35, `midday ghati should be ~30, got ${mid.ghati.ghati}`);

// Vernal equinox 2026 anchor (tropical 0° crossing)
const equinox2026 = Date.UTC(2026, 2, 20, 14, 45);
const nearEquinox = clock.computeVedicSeasonClock(DELHI, 'lahiri', equinox2026);
assert.strictEqual(nearEquinox.tropicalNext.key, 'summerSolstice', 'after March equinox the next tropical point should be summer solstice');
degNear('2026 vernal equinox crossing', clock.tropicalSunMs(equinox2026), 0, 0.5);

// Summer solstice 2026 anchor (tropical 90°)
const solstice2026 = Date.UTC(2026, 5, 21, 2, 24);
degNear('2026 summer solstice crossing', clock.tropicalSunMs(solstice2026), 90, 0.5);

// Timezone rollover: ghati uses local sunrise pair
const nyc = { zone: 'America/New_York', lat: 40.7128, lon: -74.0060 };
const nycData = clock.computeVedicSeasonClock(nyc, 'lahiri', Date.UTC(2026, 6, 21, 10));
assert(nycData.ghati && nycData.ghati.nextSunrise > nycData.ghati.sunrise, 'NYC ghati span must be positive');

// Ritu boundary must lie in the future
const ritu = clock.computeVedicSeasonClock(DELHI, 'lahiri', Date.UTC(2026, 6, 21, 6) - IST * 3600000).ritu;
assert(ritu.nextMs > Date.UTC(2026, 6, 21, 6) - IST * 3600000, 'next ritu boundary must be after probe time');
assert(ritu.startMs < Date.UTC(2026, 6, 21, 6) - IST * 3600000, 'current ritu start must be before probe time');

// UI copy must distinguish selected-place sunrise/Ghati values from global events.
const cardSource = fs.readFileSync('src/components/SeasonClockCard.tsx', 'utf8');
assert(cardSource.includes('Ghati clock for ${placeLabel}'), 'Ghati copy must name the selected place');
assert(cardSource.includes('Ritu is a global astronomical calculation'), 'Ritu copy must identify the calculation as global');
assert(cardSource.includes('Next global astronomical point'), 'equinox/solstice heading must identify the event as global');
assert(cardSource.includes('one instant worldwide'), 'global event copy must explain that location changes only the displayed local date');
assert(cardSource.includes('घटी-घड़ी'), 'location explanation must remain bilingual');

console.log('VEDIC SEASON CLOCK REGRESSION PASSED');
