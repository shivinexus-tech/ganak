#!/usr/bin/env node
'use strict';
const assert = require('node:assert');
const { loadApp } = require('./_load-app.cjs');

const engine = loadApp('src/engine/mangal-dosha.ts');
const copy = loadApp('src/data/mangal-dosha-report.ts');
const calc = loadApp('src/engine/utility-calculators.ts');

assert.deepStrictEqual(engine.MANGAL_DOSHA_HOUSES, [1,2,4,7,8,12], 'Manglik house set drifted');

const chartDefault = { y:1995,m:8,day:15,hh:6,mi:30,tz:5.5,lat:28.61,lon:77.21 };
const report = engine.mangalDoshaReport(chartDefault);
assert.strictEqual(report.present, true, 'chart default should have Mangal Dosha under the three-reference rule');
assert.strictEqual(report.rawCount, 2, 'chart default raw-count anchor');
assert.strictEqual(report.strength, 'moderate', 'chart default strength anchor');
assert.strictEqual(report.refs.length, 3, 'must check Lagna, Moon and Venus separately');
assert.deepStrictEqual(report.refs.map(r => r.key), ['lagna','moon','venus'], 'reference order drifted');
assert(report.refs.every(r => typeof r.house === 'number' && r.labelEn && r.labelHi), 'reference rows need house and bilingual labels');
assert(report.refs.some(r => r.counted && r.mitigations.includes('traditionSpecific')), 'tradition-specific mitigation must be exposed as context');

const delhi1990 = { y:1990,m:1,day:1,hh:12,mi:0,tz:5.5,lat:28.6139,lon:77.209 };
const clean = engine.mangalDoshaReport(delhi1990);
assert.strictEqual(clean.present, false, 'Delhi 1990 Mangal anchor should be clean under this rule');
assert.strictEqual(clean.rawCount, 0, 'clean chart raw-count anchor');
assert(clean.dignity && clean.dignity.includes('mitigation'), 'dignity note should remain context, not cancellation');

const strongMitigated = engine.mangalDoshaReport({ y:1988,m:5,day:7,hh:9,mi:15,tz:5.5,lat:19.08,lon:72.88 });
assert.strictEqual(strongMitigated.rawCount, 3, 'three-reference positive anchor');
assert(strongMitigated.refs.every(r => r.mitigations.includes('ownOrExalted')), 'own/exalted mitigation should be listed per positive reference');
assert.strictEqual(strongMitigated.strength, 'moderate', 'mitigation must reduce displayed strength without hiding the raw hits');

const viaUtility = calc.mangalDosha(chartDefault);
assert.strictEqual(viaUtility.rawCount, report.rawCount, 'utility route must use full Mangal report engine');
assert(viaUtility.refs.every(r => ['Lagna','Moon','Venus'].includes(r.key)), 'utility compatibility keys must remain readable by the UI');

for (const h of [1,2,4,7,8,12]) assert(copy.MANGAL_HOUSE_MEANINGS[h].en && copy.MANGAL_HOUSE_MEANINGS[h].hi, `house meaning missing for ${h}`);
assert(copy.MANGAL_METHOD_COPY.en && copy.MANGAL_METHOD_COPY.hi, 'method copy must be bilingual');
assert(Object.keys(copy.MANGAL_MITIGATION_COPY).length >= 3, 'mitigation copy must cover the exposed contexts');
assert(copy.MANGAL_GUIDANCE.en.length >= 3 && copy.MANGAL_GUIDANCE.hi.length >= 3, 'guidance must be substantive and bilingual');

console.log('Mangal Dosha report: PASS — three references, mitigations, copy and utility wiring verified');
