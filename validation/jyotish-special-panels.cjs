#!/usr/bin/env node
'use strict';
const assert = require('node:assert');
const fs = require('node:fs');
const { loadApp } = require('./_load-app.cjs');

const { computeKundli } = loadApp('src/engine/kundli.ts');
const screen = fs.readFileSync('src/screens/ChartScreen.tsx','utf8');

const chart = computeKundli({ y:1995,m:8,day:15,hh:6,mi:30,tz:5.5,lat:28.61,lon:77.21, ayanamsa:'lahiri' });
assert.strictEqual(chart.arudhas.length, 12, 'Arudha engine must expose all 12 padas');
assert.strictEqual(chart.special.lagnas.length, 4, 'Special lagnas inventory drifted');
assert(chart.special.points.length >= 4, 'Sensitive point inventory too thin');
assert(chart.special.upagrahas.length >= 5, 'Upagraha inventory too thin');
assert(chart.bhava.bhavaBala.length === 12, 'Bhava Bala must cover all 12 houses');
assert(chart.bhava.strongest >= 1 && chart.bhava.strongest <= 12, 'strongest house invalid');
assert(chart.bhava.weakest >= 1 && chart.bhava.weakest <= 12, 'weakest house invalid');

[
  'HOUSE_TOPICS',
  'SPECIAL_POINT_COPY',
  'These do not replace the main Lagna',
  'सबसे मजबूत भाव',
  'Arudha padas show “how life appears to others,”',
  'आरूढ़ पद “लोगों को क्या दिखाई देता है”',
  'Use it as a vitality lens',
  'इसे मुख्य लग्न का विकल्प नहीं',
].forEach(marker => assert(screen.includes(marker), `Jyotish panel copy marker missing: ${marker}`));

console.log('Jyotish special panels: PASS — Arudha, Bhava Bala, special lagnas/upagrahas have answer-first UI markers and engine anchors');
