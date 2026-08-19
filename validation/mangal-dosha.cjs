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

/* ============================================================================
   Bug bash 2026-08-18, F19 — Jupiter's drishti, and the exception table's first row.
   Both were method-vs-code mismatches on a page about a marriage, and both were
   invisible to every assertion above: they move `strength`, never `present`.
   ========================================================================== */
const matching = loadApp('src/engine/matching.ts');

/* ONE convention, two implementations. matching.ts carries a copy of this engine's
   core (it cannot call mangalDoshaReport — that function casts its own chart), so the
   two tables are compared directly. If they ever drift, the matching screen and the
   calculator start giving one birth record two different readings again. */
assert.deepStrictEqual(matching.MANGAL_TRADITION_EXCEPTIONS, engine.TRADITION_SPECIFIC_EXCEPTIONS,
  'the tradition-specific exception table drifted between the calculator and matching');
assert.deepStrictEqual(matching.MANGAL_JUPITER_FULL_ASPECTS, engine.JUPITER_FULL_ASPECTS,
  "Jupiter's aspect set drifted between the calculator and matching");

/* Jupiter aspects the 5th, 7th and 9th from itself — Ganak's own bhava.ts scores
   exactly that (frac 60 at hp 5, 7 and 9). This file credited the 7th alone. */
assert.deepStrictEqual(engine.JUPITER_FULL_ASPECTS, [5, 7, 9],
  "Jupiter's three full aspects are the 5th, 7th and 9th");
assert.deepStrictEqual(report.jupiterAspects, engine.JUPITER_FULL_ASPECTS,
  'the report must publish the aspect set it applied');
assert(/5th, 7th or 9th/.test(copy.MANGAL_MITIGATION_COPY.jupiterSupport.en),
  'the mitigation card must state the aspects the engine actually tests');
assert(/पंचम, सप्तम या नवम/.test(copy.MANGAL_MITIGATION_COPY.jupiterSupport.hi),
  'the Hindi mitigation card must state the same aspects as the English one');

/* Swept, not anchored: every Mars sign x every Jupiter distance x every counted house.
   A synthetic chart is used because the question is pure geometry — which distances
   credit Jupiter's support — and manglikProfile reads an already-built chart. */
const mkChart = (marsSign, jupSign, ascSign, moonSign, venusSign) => ({
  ascSign, moon: { sign: moonSign },
  rows: [{ name: 'Mars', sign: marsSign }, { name: 'Jupiter', sign: jupSign }, { name: 'Venus', sign: venusSign }],
});
let jupChecked = 0, jupWrong = 0, supportedAt = new Set();
for (let marsSign = 0; marsSign < 12; marsSign += 1) {
  for (let dist = 1; dist <= 12; dist += 1) {
    const jupSign = (marsSign + dist - 1) % 12;
    // Put the Lagna where Mars lands in the 7th, a Manglik house, so the ref is counted.
    const ascSign = (marsSign + 6) % 12;
    const prof = matching.manglikProfile(mkChart(marsSign, jupSign, ascSign, ascSign, ascSign));
    const lagnaRef = prof.refs[0];
    assert.strictEqual(lagnaRef.counted, true, 'fixture must put Mars in a Manglik house');
    const supported = lagnaRef.mitigations.includes('jupiterSupport');
    const expected = dist === 1 || engine.JUPITER_FULL_ASPECTS.includes(dist); // 1 = conjunction
    jupChecked += 1;
    if (supported !== expected) jupWrong += 1;
    if (supported) supportedAt.add(dist);
  }
}
assert.strictEqual(jupWrong, 0, `Jupiter's support was credited at the wrong distances in ${jupWrong} of ${jupChecked} geometries`);
assert.deepStrictEqual([...supportedAt].sort((a, b) => a - b), [1, 5, 7, 9],
  'Jupiter must support Mars by conjunction and by its 5th, 7th and 9th aspects — nothing else');

/* The exception table's first row. Mars in its own sign in the Lagna is on every
   published version of this list and was missing here. The outcome does not move —
   own/exalted already catches those signs — but a table printed on the page as the
   method must be the method. */
assert(engine.TRADITION_SPECIFIC_EXCEPTIONS[1], 'the exception table has no 1st-house row');
assert.deepStrictEqual(engine.TRADITION_SPECIFIC_EXCEPTIONS[1], [0, 7],
  "the 1st-house exception is Mars in its own signs (Aries, Scorpio)");
for (const h of [1, 2, 4, 7, 8, 12]) {
  assert(Array.isArray(engine.TRADITION_SPECIFIC_EXCEPTIONS[h]),
    `every Manglik house needs an exception row, and ${h} has none`);
}
{
  const marsSign = 0; // Aries
  const prof = matching.manglikProfile(mkChart(marsSign, 3, 0, 0, 0)); // Lagna Aries -> Mars in house 1
  assert.strictEqual(prof.refs[0].house, 1, 'fixture must put Mars in the 1st');
  assert(prof.refs[0].mitigations.includes('traditionSpecific'),
    'Mars in Aries in the 1st must fire the tradition-specific exception');
}

console.log(`Mangal Dosha report: PASS — three references, mitigations, copy and utility wiring verified; ` +
  `Jupiter's drishti swept over ${jupChecked} Mars/Jupiter geometries (support at 1, 5, 7, 9 only), ` +
  `exception table complete for all 6 Manglik houses, and identical to matching's copy`);
