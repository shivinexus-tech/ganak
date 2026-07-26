#!/usr/bin/env node
'use strict';
/* Dosha engine gate — Kala Sarpa (12 named types + geometry), Pitra Dosha
   (transparent checks) and Papa Dosha / Papasamyam (papa-point count).
   Pins absolute anchors and proves the geometry guard is non-vacuous. */
const assert = require('node:assert');
const { loadApp } = require('./_load-app.cjs');
const doshas = loadApp('src/engine/doshas.ts');
const calc = loadApp('src/engine/utility-calculators.ts');
const { computeKundli } = loadApp('src/engine/kundli.ts');

// ---- structure ----
assert.strictEqual(doshas.KS_TYPES.length, 12, 'Kala Sarpa must define all 12 named types');
assert(doshas.KS_TYPES.every(t => t.en && t.hi && t.areaEn && t.areaHi), 'each Kala Sarpa type must be bilingual');
assert.deepStrictEqual(doshas.KS_TYPES.map(t => t.key),
  ['anant','kulika','vasuki','shankhapala','padma','mahapadma','takshaka','karkotaka','shankhachuda','ghataka','vishadhara','sheshanaga'],
  'Kala Sarpa type order (by Rahu house 1..12) drifted');
assert.strictEqual(doshas.PITRA_CHECKS.length, 5, 'Pitra Dosha must expose its 5 transparent checks');
assert(doshas.PITRA_CHECKS.every(c => c.en && c.hi), 'Pitra checks must be bilingual');
assert.deepStrictEqual(doshas.PAPA_MALEFICS, ['Sun','Mars','Saturn','Rahu','Ketu'], 'papa malefic set drifted');
assert.deepStrictEqual(doshas.PAPA_HOUSES, [1,2,4,7,8,12], 'papa house set drifted');

// ---- Kala Sarpa geometry, synthetic (prove the guard) ----
const mkRow = (name, lon) => ({ name, lon, sign: Math.floor(lon / 30) });
const enclosedRows = (ascSign) => [
  mkRow('Rahu', 0), mkRow('Ketu', 180),
  mkRow('Sun', 20), mkRow('Moon', 40), mkRow('Mars', 60), mkRow('Mercury', 80),
  mkRow('Jupiter', 100), mkRow('Venus', 120), mkRow('Saturn', 140),
];
let ks = doshas.kalaSarpaFromRows(enclosedRows(0), 0);
assert.strictEqual(ks.full, true, 'seven planets inside one node semicircle must be a full Kala Sarpa');
assert.strictEqual(ks.enclosed, 7, 'full pattern must enclose all 7');
assert.strictEqual(ks.present, true, 'present must track full');
assert.strictEqual(ks.rahuHouse, 1, 'Rahu in the 1st with Lagna sign 0');
assert.strictEqual(ks.typeKey, 'anant', 'Rahu in the 1st is the Anant type');
// Named type follows Rahu's house — shift the ascendant so Rahu falls in the 7th.
assert.strictEqual(doshas.kalaSarpaFromRows(enclosedRows(6), 6).typeKey, 'takshaka', 'Rahu in the 7th is Takshaka');

// Guard flip: nudge one planet across the axis → no longer full, becomes partial.
const broken = enclosedRows(0).map(r => r.name === 'Saturn' ? mkRow('Saturn', 200) : r);
const ksBroken = doshas.kalaSarpaFromRows(broken, 0);
assert.strictEqual(ksBroken.full, false, 'a planet across the axis must break the full pattern (guard non-vacuous)');
assert.strictEqual(ksBroken.enclosed, 6, 'six remain enclosed');
assert.strictEqual(ksBroken.partial, true, 'six-enclosed is flagged partial, never full');

// ---- real-birth anchors ----
const delhi1990 = { y:1990,m:1,day:1,hh:12,mi:0,tz:5.5,lat:28.6139,lon:77.209 };
const chartDefault = { y:1995,m:8,day:15,hh:6,mi:30,tz:5.5,lat:28.61,lon:77.21 };

const ks90 = calc.kalaSarpa(delhi1990);
assert.strictEqual(ks90.enclosed, 5, 'Delhi 1990 Kala Sarpa enclosed anchor');
assert.strictEqual(ks90.rahuHouse, 11, 'Delhi 1990 Rahu house anchor');
assert.strictEqual(ks90.typeKey, 'vishadhara', 'Delhi 1990 Kala Sarpa type anchor');
assert.strictEqual(ks90.full, false, 'Delhi 1990 is not a full Kala Sarpa');

const pit90 = calc.pitraDosha(delhi1990);
assert.strictEqual(pit90.count, 1, 'Delhi 1990 Pitra count anchor');
assert.strictEqual(pit90.grade, 'single', 'Delhi 1990 Pitra grade anchor');
assert.strictEqual(pit90.checks.find(c => c.key === 'sun-saturn').fired, true, 'Delhi 1990 fires Sun–Saturn');
assert.strictEqual(pit90.ninthLord, 'Mars', 'Delhi 1990 9th-lord anchor');

const pitCd = calc.pitraDosha(chartDefault);
assert.strictEqual(pitCd.checks.find(c => c.key === 'nodes-9th').fired, true, 'chart-default fires nodes-in-9th');
assert.strictEqual(pitCd.count, 1, 'chart-default Pitra count anchor');

const papa90 = calc.papaDosha(delhi1990);
assert.strictEqual(papa90.total, 5, 'Delhi 1990 papa total anchor');
assert.strictEqual(papa90.grade, 'moderate', 'Delhi 1990 papa grade anchor');
assert.strictEqual(papa90.byRef.length, 3, 'papa count uses Lagna, Moon and Venus');
assert.deepStrictEqual(papa90.byRef.map(r => r.ref), ['lagna','moon','venus'], 'papa reference order');

const papaCd = calc.papaDosha(chartDefault);
assert.strictEqual(papaCd.total, 10, 'chart-default papa total anchor');
assert.strictEqual(papaCd.grade, 'high', 'chart-default papa grade anchor');

// ---- Papasamyam (two-chart comparison) ----
const cA = computeKundli(chartDefault), cB = computeKundli(delhi1990);
const ps = doshas.papasamyam(cA, cB);
assert.strictEqual(ps.boy.total, 10, 'Papasamyam boy total = chart-default papa');
assert.strictEqual(ps.girl.total, 5, 'Papasamyam girl total = Delhi-1990 papa');
assert.strictEqual(ps.diff, 5, 'Papasamyam diff anchor');
assert.strictEqual(ps.balanced, false, 'a 5-point gap is not balanced');
assert.strictEqual(ps.heavier, 'boy', 'the heavier papa load is correctly attributed');
// symmetric balance check: a chart against itself is perfectly balanced.
const psSelf = doshas.papasamyam(cA, cA);
assert.strictEqual(psSelf.diff, 0, 'identical charts have zero papa gap');
assert.strictEqual(psSelf.balanced, true, 'identical charts are balanced');

console.log('doshas.cjs OK — Kala Sarpa (12 types + geometry), Pitra Dosha, Papa Dosha & Papasamyam');
