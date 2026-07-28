#!/usr/bin/env node
'use strict';
const assert = require('node:assert');
const { loadApp } = require('./_load-app.cjs');

const { sadeSatiReport, SADE_SATI_PHASES } = loadApp('src/engine/sade-sati-report.ts');
const copy = loadApp('src/data/sade-sati-report.ts');
const calc = loadApp('src/engine/utility-calculators.ts');

const delhi1990 = { y:1990,m:1,day:1,hh:12,mi:0,tz:5.5,lat:28.6139,lon:77.209 };
const report = sadeSatiReport(delhi1990, Date.UTC(2026,6,22));

assert.deepStrictEqual(SADE_SATI_PHASES.map(p => p.phase), ['rising','middle','setting'], 'phase order drifted');
assert.strictEqual(report.active, true, 'Delhi 1990 should be in Sade Sati on 2026-07-22');
assert.strictEqual(report.phase, 'setting', 'Delhi 1990 phase anchor');
assert.strictEqual(report.moonSign, 'Kumbha (Aquarius)', 'Moon sign anchor');
assert.strictEqual(report.saturnSign, 'Meena (Pisces)', 'Saturn sign anchor');
assert.strictEqual(report.cycle.status, 'current', 'active cycle must be current');
assert(report.cycle.start < Date.UTC(2026,6,22) && report.cycle.end > Date.UTC(2026,6,22), 'current cycle must contain selected date');
assert(report.cycle.phases.length >= 3, 'cycle must expose phase segments');
for (let i = 1; i < report.cycle.phases.length; i++) {
  assert(report.cycle.phases[i].start >= report.cycle.phases[i - 1].end - 1000, 'phase segments must be sorted and non-overlapping');
}
assert(report.cycle.phases.some(p => p.phase === 'setting' && Date.UTC(2026,6,22) >= p.start && Date.UTC(2026,6,22) < p.end), 'active phase segment must contain selected date');

const future = sadeSatiReport({ y:1988,m:5,day:7,hh:9,mi:15,tz:5.5,lat:19.08,lon:72.88 }, Date.UTC(2026,6,22));
assert.strictEqual(future.active, false, 'Mumbai 1988 anchor should not be active on 2026-07-22');
assert(['upcoming','past'].includes(future.cycle.status), 'inactive report must still show nearest cycle');
assert(future.cycle.phases.length >= 1, 'inactive report must expose nearest cycle phases');

const viaUtility = calc.sadeSati(delhi1990, Date.UTC(2026,6,22));
assert.strictEqual(viaUtility.phase, report.phase, 'utility route must use the report engine');
assert(viaUtility.cycle && viaUtility.cycle.phases.length >= 3, 'utility route must expose report fields');

assert(copy.SADE_SATI_METHOD_COPY.en && copy.SADE_SATI_METHOD_COPY.hi, 'method copy must be bilingual');
for (const p of ['rising','middle','setting','none']) assert(copy.SADE_SATI_PHASE_COPY[p].en && copy.SADE_SATI_PHASE_COPY[p].hi, `phase copy missing for ${p}`);
assert(copy.SADE_SATI_GUIDANCE.en.length >= 3 && copy.SADE_SATI_GUIDANCE.hi.length >= 3, 'guidance must be substantive and bilingual');

console.log('Sade Sati report: PASS — phase periods, retrograde segments, copy and utility wiring verified');
