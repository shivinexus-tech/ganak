#!/usr/bin/env node
'use strict';
/* Chart-style + ayanamsha gate. Verifies the four ayanamshas resolve with the
   right offsets and actually shift a chart, and that the South-Indian sign→cell
   map is a valid, complete layout. */
const assert = require('node:assert');
const { loadApp } = require('./_load-app.cjs');
const panchang = loadApp('src/engine/panchang.ts');
const { computeKundli } = loadApp('src/engine/kundli.ts');
const south = loadApp('src/components/SouthChart.tsx');
const east = loadApp('src/components/EastChart.tsx');

// ---- ayanamsha table ----
const A = panchang.AYANAMSA;
['lahiri', 'raman', 'kp', 'trueChitra'].forEach((k) => assert(A[k] && A[k].label, `ayanamsha ${k} missing/label`));
assert.strictEqual(A.lahiri.offset, 0, 'Lahiri must be the zero-point default');
assert(Math.abs(A.raman.offset - (-1.479)) < 0.01, 'Raman offset drifted (~-1.479°)');
assert(Math.abs(A.kp.offset - (-0.096667)) < 1e-6, 'KP offset drifted');
assert(Math.abs(A.trueChitra.offset) < 0.01, 'True Chitrapaksha must sit within ~arc-minutes of Lahiri');

// ---- ayanamshas actually move the chart ----
const birth = { y: 1990, m: 1, day: 1, hh: 12, mi: 0, tz: 5.5, lat: 28.61, lon: 77.21 };
const lah = computeKundli({ ...birth, ayanamsa: 'lahiri' });
const ram = computeKundli({ ...birth, ayanamsa: 'raman' });
const tc = computeKundli({ ...birth, ayanamsa: 'trueChitra' });
const sunLah = lah.rows.find((p) => p.name === 'Sun').lon;
const sunRam = ram.rows.find((p) => p.name === 'Sun').lon;
const sunTc = tc.rows.find((p) => p.name === 'Sun').lon;
// smaller ayanamsa (Raman) → larger sidereal longitude, by ~1.479°
const dRam = ((sunRam - sunLah + 540) % 360) - 180;
assert(Math.abs(dRam - 1.479) < 0.02, `Raman must shift the Sun ~+1.479° (got ${dRam.toFixed(3)})`);
const dTc = ((sunTc - sunLah + 540) % 360) - 180;
assert(Math.abs(dTc) < 0.01, `True Chitrapaksha must coincide with Lahiri (got ${dTc.toFixed(4)})`);

// ---- South-Indian layout ----
const cells = south.SOUTH_SIGN_CELL;
assert(Array.isArray(cells) && cells.length === 12, 'South layout must map all 12 signs');
assert(new Set(cells).size === 12, 'each sign must occupy a distinct cell');
const centre = new Set([5, 6, 9, 10]);
assert(cells.every((c) => c >= 0 && c <= 15 && !centre.has(c)), 'signs must sit in the outer ring, never the centre panel');
// canonical anchors: Aries top-row second cell (1), Pisces top-left (0)
assert.strictEqual(cells[0], 1, 'Aries must sit in the top row, second cell');
assert.strictEqual(cells[11], 0, 'Pisces must sit top-left');

// ---- East-Indian (Bengali) layout ----
const es = east.EAST_SIGNS;
assert(Array.isArray(es) && es.length === 12, 'East layout must define all 12 signs');
assert(es.every((c) => Array.isArray(c.poly) && c.poly.length >= 3 && Array.isArray(c.c)), 'each East sign needs a polygon and a centroid');
// Aries (0) sits top-centre: centroid x≈200 and high on the board (small y).
assert(Math.abs(es[0].c[0] - 200) < 20 && es[0].c[1] < 130, 'Aries must sit at the top-centre');
// Libra (6) is opposite Aries at the bottom-centre.
assert(Math.abs(es[6].c[0] - 200) < 20 && es[6].c[1] > 270, 'Libra must sit at the bottom-centre (opposite Aries)');
// Anti-clockwise: Cancer (3, 90° ccw from Aries) is on the LEFT; Capricorn (9) on the RIGHT.
assert(es[3].c[0] < 130, 'Cancer must be on the left (anti-clockwise)');
assert(es[9].c[0] > 270, 'Capricorn must be on the right');
// all centroids distinct
assert(new Set(es.map((c) => c.c.join(','))).size === 12, 'each East sign needs a distinct centroid');

console.log('chart-styles-ayanamsha.cjs OK — 4 ayanamshas (Raman shift verified) + South & East layouts');
