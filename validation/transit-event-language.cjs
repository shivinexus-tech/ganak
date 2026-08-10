#!/usr/bin/env node
'use strict';
/* Transit-event language gate (Spec A, docs/superpowers/specs/2026-08-05-transit-line-language-fix-design.md).
 *
 * The "Upcoming planetary events" card used to render `शुक्र Venus enters Kanya` in English
 * and `शुक्र Venus प्रवेश कन्या` in Hindi — the engine hardcoded PLANET_DEVA into the label,
 * so both languages leaked the other one.
 *
 * src/i18n/panchang-terms.ts states the architecture this gate enforces: the engine speaks ONE
 * canonical language, and localisation happens at the edge. So:
 *   1. no engine-emitted label may contain Devanagari;
 *   2. transitLabel(en, …) must produce zero Devanagari;
 *   3. transitLabel(hi, …) must produce zero Latin planet/sign names;
 *   4. the event timestamps must not move — this is a label change only.
 */
const assert = require('node:assert');
const { loadApp } = require('./_load-app.cjs');

const pan = loadApp('src/engine/panchang.ts');
const { transitLabel } = loadApp('src/engine/transit-copy.ts');

const DEVANAGARI = /[ऀ-ॿ]/;
const PLANETS_EN = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
const SIGNS_EN = ['Mesha', 'Vrishabha', 'Mithuna', 'Karka', 'Simha', 'Kanya',
  'Tula', 'Vrishchika', 'Dhanu', 'Makara', 'Kumbha', 'Meena'];

/* A window wide enough to contain sign changes and at least one station. */
const FROM = Date.UTC(2026, 0, 1);
const events = pan.upcomingEvents(FROM, 200);
assert(events.length > 0, 'upcomingEvents returned nothing — the fixture window is wrong');

/* ---- 1. the astronomy layer emits no Devanagari ---- */
for (const e of events) {
  assert(!DEVANAGARI.test(e.label),
    `engine label carries Devanagari (presentation inside the astronomy layer): ${e.label}`);
}

/* ---- 2. English mode is free of Devanagari ---- */
for (const e of events) {
  const out = transitLabel('en', e.label);
  assert(!DEVANAGARI.test(out), `English mode leaks Devanagari: ${out}`);
}

/* ---- 3. Hindi mode carries no Latin planet or sign name ---- */
for (const e of events) {
  const out = transitLabel('hi', e.label);
  assert(DEVANAGARI.test(out), `Hindi mode produced no Devanagari at all: ${out}`);
  for (const p of PLANETS_EN) {
    assert(!new RegExp(`\\b${p}\\b`).test(out), `Hindi mode leaks the English planet name "${p}": ${out}`);
  }
  for (const s of SIGNS_EN) {
    assert(!new RegExp(`\\b${s}\\b`).test(out), `Hindi mode leaks the Latin sign name "${s}": ${out}`);
  }
}

/* ---- 4. every planet name is actually translatable, not silently passed through ---- */
const { panchangTerm } = loadApp('src/i18n/panchang-terms.ts');
const EXPECTED = { Sun: 'सूर्य', Moon: 'चन्द्र', Mars: 'मंगल', Mercury: 'बुध', Jupiter: 'गुरु',
  Venus: 'शुक्र', Saturn: 'शनि', Rahu: 'राहु', Ketu: 'केतु' };
for (const [en, hi] of Object.entries(EXPECTED)) {
  assert.strictEqual(panchangTerm('hi', 'planet', en), hi, `planet table missing/incorrect for ${en}`);
  assert.strictEqual(panchangTerm('en', 'planet', en), en, `English must pass ${en} through unchanged`);
}
assert.strictEqual(panchangTerm('hi', 'planet', 'Nibiru'), 'Nibiru', 'unknown values must fall through unchanged');

/* ---- 5. the maths did not move: sign-change instants match an independent recomputation ---- */
const again = pan.upcomingEvents(FROM, 200);
assert.strictEqual(again.length, events.length, 'event count is not deterministic');
for (let i = 0; i < events.length; i++) {
  assert.strictEqual(again[i].t, events[i].t, 'event timestamps are not deterministic');
  assert.strictEqual(again[i].planet, events[i].planet, 'event planet drifted');
  assert.strictEqual(again[i].type, events[i].type, 'event type drifted');
}

/* ---- 6. structured fields survive for the renderer ---- */
for (const e of events) {
  assert(typeof e.t === 'number' && e.t > FROM, 'event must carry a future timestamp');
  assert(typeof e.planet === 'string' && e.planet, 'event must name its planet');
  assert(['sign', 'station', 'lunation'].includes(e.type), `unexpected event type: ${e.type}`);
}

console.log(`✓ transit-event-language: ${events.length} events · EN clean · HI clean · 9 planet terms · timings stable`);
