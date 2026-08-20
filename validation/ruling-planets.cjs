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

/* The heading marker used to pin the literal string "Support ranking · how often each
   planet appears" — which is the Prashna bug bash's F13 defect, not a feature: this
   list is ordered by WEIGHT and never was ordered by how often a graha appears. A gate
   that pins wrong copy makes the wrong copy the thing you have to keep. Pin the two
   invariants instead: the explanatory UI is present, and the discredited explanation
   has not come back. */
['Read first · ruling-planet summary','Support ranking','RP_SOURCE_LABELS','priority signal, not a promise','पहले पढ़ें · शासक ग्रह का सार','समर्थन क्रम'].forEach(marker => {
  assert(chartSource.includes(marker), `ChartScreen missing RP UI marker: ${marker}`);
});
/* The three shapes the discredited explanation actually took, not the words it used.
   The corrected copy has to be able to NAME the count in order to disown it — "not by
   how many times a graha appears", "इस गिनती से नहीं कि ग्रह कितनी बार आया" — the same
   allowance transit-event-language.cjs § 7 makes for a line that says सायन *with* नहीं.
   So these match the AFFIRMATIVE claim: a heading promising a frequency ordering, the
   English sentence interpolating `.count`, and the Hindi "appeared in N witnesses". */
[/how often each planet appears/, /appears through \{[^}]*\.count/, /संकेतों में आया/].forEach(bad => {
  assert(!bad.test(chartSource),
    `ChartScreen explains the Ruling Planets ranking by source COUNT again (${bad}) — it is ranked by weight. See Prashna bug bash 2026-08-18 F13.`);
});

console.log('Ruling Planets: PASS — source witnesses, ranking metadata and UI explanation markers verified');
