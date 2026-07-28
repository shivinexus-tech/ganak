#!/usr/bin/env node
'use strict';
const assert = require('node:assert');
const fs = require('node:fs');
const { loadApp } = require('./_load-app.cjs');

const { computeKundli } = loadApp('src/engine/kundli.ts');
const dasha = loadApp('src/engine/dasha.ts');
const chartSource = fs.readFileSync('src/screens/ChartScreen.tsx','utf8');

const chart = computeKundli({ y:1990,m:1,day:1,hh:12,mi:0,tz:5.5,lat:28.6139,lon:77.209, ayanamsa:'lahiri' });
const rp = chart.rulingPlanets;
assert.strictEqual(rp.sources.length, 7, 'Ruling Planets must expose all seven source witnesses');
assert.deepStrictEqual(rp.sources.map(s => s.key), ['ascSignLord','ascStarLord','ascSubLord','moonSignLord','moonStarLord','moonSubLord','dayLord'], 'RP source order drifted');
assert(rp.ranked.length >= 1, 'RP ranking missing');
assert.strictEqual(rp.ranked[0].planet, 'Saturn', 'Delhi 1990 top RP anchor');
assert.strictEqual(rp.ranked[0].weight, 5, 'Delhi 1990 top RP weight anchor');
assert.deepStrictEqual(rp.ranked[0].sources, ['ascStarLord','moonSignLord'], 'top RP source explanation anchor');
for (let i = 1; i < rp.ranked.length; i++) assert(rp.ranked[i - 1].weight >= rp.ranked[i].weight, 'RP ranking must be weight-sorted');

const direct = dasha.computeRulingPlanets(chart.ascSid, chart.moon.lon, 'Moon');
assert(direct.sources && direct.ranked, 'direct computeRulingPlanets export must carry source/ranking metadata');

['Read first · ruling-planet summary','Support ranking · how often each planet appears','RP_SOURCE_LABELS','priority signal, not a promise','पहले पढ़ें · शासक ग्रह का सार','समर्थन क्रम'].forEach(marker => {
  assert(chartSource.includes(marker), `ChartScreen missing RP UI marker: ${marker}`);
});

console.log('Ruling Planets: PASS — source witnesses, ranking metadata and UI explanation markers verified');
