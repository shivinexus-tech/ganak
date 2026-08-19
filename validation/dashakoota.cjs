#!/usr/bin/env node
'use strict';
/* Dashakoota (South-Indian 10-kuta) gate. Verifies the 36-point structure, the
   Rajju and Vedha hard-block doshas, and a real-chart anchor. */
const assert = require('node:assert');
const { loadApp } = require('./_load-app.cjs');
const { dashakoota, gunaMilan, computeMatch, matchVerdict, VERDICT_COPY, VERDICT_ORDER, BLOCK_COPY } = loadApp('src/engine/matching.ts');
const fs = require('node:fs');
const path = require('node:path');
const matchScreen = fs.readFileSync(path.join(__dirname, '..', 'src/screens/MatchingScreen.tsx'), 'utf8');
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


/* ============================================================================
   Bug bash 2026-08-18 (plans/audits/2026-08-18-bugbash-matching-dosha.md).
   Everything below sweeps rather than anchors: F3, F4 and F10 were each true of
   hundreds or thousands of nakshatra/rashi combinations while every single-example
   gate stayed green. A sweep is the only thing that holds them down.
   ========================================================================== */

// ---------------------------------------------------------------- F3: ONE verdict
// The screen used to band the Ashtakoota total itself AND print the Dashakoota band
// as a second headline, so one scroll could read "16.5/36 Not recommended" above
// "27/36 Very good". The verdict is now computed once, in the engine.

assert.deepStrictEqual([...VERDICT_ORDER].slice().sort(), Object.keys(VERDICT_COPY).sort(),
  'every verdict band needs copy, and every piece of copy needs a band');
assert.strictEqual(VERDICT_ORDER.length, 4, 'the verdict ladder is four bands, worst to best');

const DEVANAGARI = /[ऀ-ॿ]/;
for (const [band, copy] of Object.entries(VERDICT_COPY)) {
  assert(copy.en && copy.hi && copy.tone, `band ${band} needs an English label, a Hindi label and a tone`);
  assert(DEVANAGARI.test(copy.hi), `the Hindi label for ${band} must be Devanagari`);
  assert(!/[A-Za-z]{3,}/.test(copy.hi), `no English word inside the Hindi label for ${band}`);
  assert(!DEVANAGARI.test(copy.en), `no Devanagari inside the English label for ${band}`);
}
assert.strictEqual(new Set(Object.values(VERDICT_COPY).map((c) => c.en)).size, VERDICT_ORDER.length,
  'two bands share one English label — a reader cannot tell them apart');
assert.strictEqual(new Set(Object.values(VERDICT_COPY).map((c) => c.hi)).size, VERDICT_ORDER.length,
  'two bands share one Hindi label');

/* F3, second half: the English verdict was an instruction ("Not recommended") where the
   Hindi only asked for care ("सावधानी आवश्यक"). Same verdict, two different severities,
   and the English one is the fatalistic output the header of doshas.ts forbids and
   plans/religious-content-policy.md rules out. Neither language may carry a refusal. */
const FATALISTIC_EN = [/not recommended/i, /incompatible/i, /do not marry/i, /should not marry/i,
  /unsuitable/i, /rejected?/i, /doomed/i, /never marry/i];
const FATALISTIC_HI = [/निषिद्ध/, /अस्वीकार/, /अनुपयुक्त/, /विवाह न/, /असंभव/];
for (const [band, copy] of Object.entries(VERDICT_COPY)) {
  for (const rx of FATALISTIC_EN) assert(!rx.test(copy.en), `English band ${band} tells the couple what to do: "${copy.en}"`);
  for (const rx of FATALISTIC_HI) assert(!rx.test(copy.hi), `Hindi band ${band} tells the couple what to do: "${copy.hi}"`);
}
for (const [key, copy] of Object.entries(BLOCK_COPY)) {
  assert(copy.en && copy.hi, `dosha ${key} named in the verdict needs both languages`);
  assert(DEVANAGARI.test(copy.hi) && !/[A-Za-z]{3,}/.test(copy.hi), `dosha ${key} Hindi label must be Devanagari only`);
}

// ------------------------------------------- full 104,976-combination verdict sweep
const NO_MANGLIK = { oneSided: false };
const ONE_SIDED = { oneSided: true };
const bandIndex = (v) => VERDICT_ORDER.indexOf(v.key);

let combos = 0, highWithBlock = 0, unknownBand = 0;
const byInputs = new Map();   // (ashta,dasha,blocks) -> verdict key : proves ONE verdict per input
const byLowScore = new Map(); // min(ashta,dasha) -> band, over block-free combos
const seenBands = new Set();
let minDistinctHiNotes = 99, missingHiNotes = 0, latinInHiNotes = 0, hiEqualsEn = 0;

for (let bn = 0; bn < 27; bn += 1) for (let br = 0; br < 12; br += 1)
for (let gn = 0; gn < 27; gn += 1) for (let gr = 0; gr < 12; gr += 1) {
  const b = { nak: bn, rashi: br }, g = { nak: gn, rashi: gr };
  const gm = gunaMilan(b, g), dk = dashakoota(b, g);
  const v = matchVerdict(gm, dk, NO_MANGLIK);
  combos += 1;
  const idx = bandIndex(v);
  if (idx < 0) unknownBand += 1;
  seenBands.add(v.key);

  // F4 — a standing hard-block dosha can never sit under a favourable headline.
  if (v.blocks.length > 0 && idx > 1) highWithBlock += 1;

  // ONE verdict: the same scores + the same doshas must always give the same answer.
  const sig = `${gm.total}|${dk.total}|${v.blocks.map((x) => x.key).join(',')}`;
  if (byInputs.has(sig)) assert.strictEqual(byInputs.get(sig), v.key,
    `two combinations with identical scores and doshas produced different verdicts (${sig})`);
  else byInputs.set(sig, v.key);

  // The band must follow the LOWER of the two systems, never the flattering one.
  if (v.blocks.length === 0) {
    const low = Math.min(gm.total, dk.total);
    if (byLowScore.has(low)) assert.strictEqual(byLowScore.get(low), v.key,
      `two block-free combinations with the same lower score (${low}/36) got different verdicts`);
    else byLowScore.set(low, v.key);
  }

  // F10 — the Hindi "Detail" column, swept.
  const hiNotes = gm.kootas.map((k) => k.noteHi);
  minDistinctHiNotes = Math.min(minDistinctHiNotes, new Set(hiNotes).size);
  for (const k of gm.kootas) {
    if (!k.noteHi) missingHiNotes += 1;
    if (/[A-Za-z]/.test(k.noteHi || '')) latinInHiNotes += 1;
    if (k.noteHi === k.note) hiEqualsEn += 1;
  }
}

assert.strictEqual(combos, 104976, 'the sweep must cover every nakshatra/rashi combination');
assert.strictEqual(unknownBand, 0, 'a combination produced a verdict outside the four bands');
assert.strictEqual(highWithBlock, 0,
  `${highWithBlock} combinations read "favourable" or better while a Nadi/Bhakoot/Rajju/Vedha dosha was standing`);
assert(seenBands.size >= 3, 'the verdict ladder collapsed — a sweep of every combination must reach at least three bands');

// Non-vacuous: the sweep really does contain the shapes this gate is about.
let blockCombos = 0;
for (const sig of byInputs.keys()) if (sig.split('|')[2]) blockCombos += 1;
assert(blockCombos > 0, 'no combination in the sweep carried a dosha — the F4 assertion above proves nothing');

// The lower-of-the-two rule, stated once more as monotonicity: a better lower score
// can never yield a worse band.
const lows = [...byLowScore.keys()].sort((a, b) => a - b);
for (let i = 1; i < lows.length; i += 1) {
  const prev = VERDICT_ORDER.indexOf(byLowScore.get(lows[i - 1]));
  const here = VERDICT_ORDER.indexOf(byLowScore.get(lows[i]));
  assert(here >= prev, `verdict went DOWN as the lower score went up (${lows[i - 1]} → ${lows[i]})`);
}

// F10 sweep results.
assert.strictEqual(missingHiNotes, 0, 'a koota has no Hindi detail');
assert.strictEqual(latinInHiNotes, 0, 'a Hindi koota detail contains Latin letters');
assert.strictEqual(hiEqualsEn, 0, 'a Hindi koota detail is a copy of the English one');
assert.strictEqual(minDistinctHiNotes, 8,
  `the Hindi Detail column repeats itself — worst case only ${minDistinctHiNotes} of 8 rows differ ` +
  '(before 2026-08-18 all eight were one filler sentence, so a Hindi reader saw no varna, yoni, gana, nadi or sign lord at all)');

// ------------------------------------------------- one-sided Manglik is a block too
const clean = { nak: 0, rashi: 0 }, alsoClean = { nak: 1, rashi: 4 };
const gmClean = gunaMilan(clean, alsoClean), dkClean = dashakoota(clean, alsoClean);
const vClean = matchVerdict(gmClean, dkClean, NO_MANGLIK);
const vManglik = matchVerdict(gmClean, dkClean, ONE_SIDED);
assert(vManglik.blocks.some((b) => b.key === 'manglik'), 'a one-sided Manglik must be named in the verdict');
assert(bandIndex(vManglik) <= 1, 'a one-sided Manglik must cap the headline at "mixed"');
assert(bandIndex(vClean) >= bandIndex(vManglik), 'adding a dosha must never improve the verdict');

// --------------------------------------------- the F3 couple, end to end, both scores
const f3boy = { y: 1985, m: 1, day: 5, hh: 9, mi: 30, tz: 5.5, lat: 28.61, lon: 77.21 };
const f3girl = { y: 1991, m: 7, day: 15, hh: 14, mi: 15, tz: 5.5, lat: 19.08, lon: 72.88 };
const f3 = computeMatch(computeKundli, f3boy, f3girl);
assert(f3.verdict, 'computeMatch must return the single verdict the screen renders');
assert.strictEqual(f3.verdict.ashta, f3.total, 'the verdict must carry the real Ashtakoota score');
assert.strictEqual(f3.verdict.dasha, f3.dasha.total, 'the verdict must carry the real Dashakoota score');
assert.strictEqual(f3.verdict.systemsDiffer, true,
  'the 16.5 vs 27 couple is exactly the disagreement the screen must name, not hide');
assert.strictEqual(bandIndex(f3.verdict) <= 1, true, 'a couple this far apart cannot read as favourable');

// ------------------------------------- the rendered half: the screen has no second verdict
for (const banned of ['Not recommended', 'Very good match', 'Excellent match', 'Acceptable match',
  'स्वीकार्य मिलान', 'बहुत अच्छा मिलान', 'उत्कृष्ट मिलान']) {
  assert(!matchScreen.includes(banned),
    `MatchingScreen still bands a score into its own verdict ("${banned}") — there must be exactly one verdict, from the engine`);
}
assert(/res\.verdict/.test(matchScreen), 'MatchingScreen must render the engine verdict');
assert(/\{d\.total\} \/ 36\}?</.test(matchScreen) || /\{d\.total\} \/ 36</.test(matchScreen),
  'the Dashakoota total row must print a score, not a second verdict label');
assert(/hi \? k\.noteHi : k\.note/.test(matchScreen),
  'the Ashtakoota Detail column must render the Hindi detail in Hindi');
assert(!matchScreen.includes('चंद्र राशि और जन्म नक्षत्र पर आधारित संगति'),
  'the Hindi filler sentence that stood in for all eight koota details is back');

// ------------------------------------------------------------ F5: stale-place guard
assert((matchScreen.match(/onConfirmed=/g) || []).length >= 2,
  'both people on the matching screen must wire PlaceInput’s stale-place guard (onConfirmed), as every other calculator does');
assert(/bConfirmed/.test(matchScreen) && /gConfirmed/.test(matchScreen),
  'the matching screen must track whether each place is confirmed');
assert(/if \(!bConfirmed \|\| !gConfirmed\)/.test(matchScreen),
  'the Match button must refuse to compute with an unconfirmed place instead of silently using the old city');

console.log(`dashakoota.cjs OK — 36-pt structure, Rajju & Vedha hard-blocks, real-chart anchor (24/good); ` +
  `swept ${combos.toLocaleString('en-US')} combinations: one verdict per input, 0 favourable-with-dosha, ` +
  `8/8 distinct Hindi koota details, stale-place guard wired`);
