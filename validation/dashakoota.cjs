#!/usr/bin/env node
'use strict';
/* Dashakoota (South-Indian 10-kuta) gate. Verifies the 36-point structure, the
   Rajju and Vedha hard-block doshas, and a real-chart anchor. */
const assert = require('node:assert');
const { loadApp } = require('./_load-app.cjs');
const { dashakoota, computeMatch } = loadApp('src/engine/matching.ts');
const { computeKundli } = loadApp('src/engine/kundli.ts');

// ---- structure ----
const s = dashakoota({ nak: 0, rashi: 0 }, { nak: 5, rashi: 4 });
assert.strictEqual(s.kootas.length, 10, 'Dashakoota must have 10 kutas');
assert.strictEqual(s.kootas.reduce((a, k) => a + k.max, 0), 36, 'kuta maxima must sum to 36');
assert.deepStrictEqual(s.kootas.map((k) => k.max), [3, 4, 2, 2, 4, 7, 5, 2, 5, 2], 'point distribution drifted');
assert(s.kootas.every((k) => k.got >= 0 && k.got <= k.max), 'a kuta scored out of range');

// ---- Rajju hard-block: identical stars share a rajju → dosha, 0 points ----
const sameStar = dashakoota({ nak: 4, rashi: 2 }, { nak: 4, rashi: 8 });
assert.strictEqual(sameStar.rajjuDosha, true, 'identical stars must trigger Rajju dosha');
assert.strictEqual(sameStar.kootas.find((k) => k.name === 'Rajju').got, 0, 'Rajju dosha must score 0');
// Ashwini(0) and Ashlesha(8) are both Pada rajju → dosha even though different stars.
assert.strictEqual(dashakoota({ nak: 0, rashi: 0 }, { nak: 8, rashi: 3 }).rajjuDosha, true, 'same-group different stars still Rajju dosha');
// Ashwini(0,Pada) vs Bharani(1,Kati) → different rajju, full 5.
const diffRajju = dashakoota({ nak: 0, rashi: 0 }, { nak: 1, rashi: 1 });
assert.strictEqual(diffRajju.rajjuDosha, false, 'different rajju groups must not be a dosha');
assert.strictEqual(diffRajju.kootas.find((k) => k.name === 'Rajju').got, 5, 'clear Rajju must score 5');

// ---- Vedha hard-block: Ashwini(0) & Jyeshtha(17) are a vedha pair ----
const vedha = dashakoota({ nak: 0, rashi: 0 }, { nak: 17, rashi: 8 });
assert.strictEqual(vedha.vedhaDosha, true, 'Ashwini/Jyeshtha must be a Vedha pair');
assert.strictEqual(vedha.kootas.find((k) => k.name === 'Vedha').got, 0, 'Vedha dosha must score 0');
// Mrigashira(4) has no vedha partner.
assert.strictEqual(dashakoota({ nak: 4, rashi: 0 }, { nak: 0, rashi: 1 }).vedhaDosha, false, 'Mrigashira has no vedha');

// ---- verdict bands ----
assert.strictEqual(['poor', 'moderate', 'good', 'very-good', 'excellent'].includes(s.verdict), true, 'verdict band invalid');

// ---- real-chart anchor ----
const boy = { name: 'B', y: 1990, m: 1, day: 1, hh: 12, mi: 0, tz: 5.5, lat: 28.6, lon: 77.2, ayanamsa: 'lahiri' };
const girl = { name: 'G', y: 1992, m: 6, day: 15, hh: 9, mi: 30, tz: 5.5, lat: 19.07, lon: 72.87, ayanamsa: 'lahiri' };
const r = computeMatch(computeKundli, boy, girl);
assert.strictEqual(r.dasha.total, 24, 'Dashakoota anchor total');
assert.strictEqual(r.dasha.verdict, 'good', 'Dashakoota anchor verdict');

console.log('dashakoota.cjs OK — 36-pt structure, Rajju & Vedha hard-blocks, verdict bands, real-chart anchor (24/good)');
