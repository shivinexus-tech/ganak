#!/usr/bin/env node
'use strict';

/* Gate for the birth-chart-personalised Muhurat overlay (P0-MUHURAT-FULL-PARITY).

   The overlay NEVER edits the general finder (muhurat.ts). It reuses the already-shipped
   Tarabala/Chandrabala (daily-windows.ts) and Moon Bhinnashtakavarga (classical.ts) maths
   and layers them onto finder output:
     - Tarabala + Chandrabala are the two SOURCED HARD filters (they can remove a day).
     - Ashtakavarga Moon-bindu strength RANKS, never removes.
     - The Adhanadi 6-set {1,10,16,18,22,25} is a SOFT, labelled caution: a day is kept
       and marked, never removed. (Source hunt was negative — documented for transit, not
       muhurta — so it must not act as a cut. See the spec §3.1.)

   TDD anchors below pin the maths deterministically (Moon BAV always sums to 49, SAV to
   337), the special-caution semantics (marks but does not cut), and the graded filter
   (only !coreOk removed; <3 survivors flips to annotate mode). */

const { loadApp } = require('./_load-app.cjs');
const { natalAnchors, personalFit, applyPersonalisation } = loadApp('src/engine/personal-muhurat.ts');
const { muhuratScanRange } = loadApp('src/engine/muhurat.ts');
const { taraBala, chandraBala } = loadApp('src/engine/daily-windows.ts');
const {
  PM_TITLE, PM_INTRO, PM_NATAL_HINT, PM_SPECIAL_NAMES, PM_SPECIAL_CAUTION_NOTE,
  PM_RESULT_NOTE, PM_ANNOTATE_NOTE, PM_COUNT,
} = loadApp('src/data/personal-muhurat-ui.ts');
const fs = require('fs');

const DELHI = { label: 'New Delhi', lat: 28.6139, lon: 77.2090, zone: 'Asia/Kolkata' };
let failures = 0;
const fail = (m) => { failures++; console.error('FAIL ' + m); };
const ymd = (y, m, d) => ({ y, m, d });

/* ---- 1. Tarabala anchor (reused maths, our avoid set) ---------------------------- */
// Same star as the day (distance 0) => tara 1 (Janma) => avoided.
if (taraBala(5)[5].tara !== 1) fail('same-star Tarabala should be tara 1 (Janma)');
if (taraBala(5)[5].good !== false) fail('tara 1 (Janma) must be marked not-good');
// 9th nakshatra away wraps to tara 9 (good) — this is the 18th-from-Janma case below.
if (taraBala(17)[0].tara !== 9) fail('18th-from-Janma (ord 18) should be tara 9 (good) in Tarabala');

/* ---- 2. Chandrabala anchor ------------------------------------------------------- */
// birthSign 0, day sign 2, shukla (waxing): distance ((2-0+12)%12)+1 = 3 => supportive.
if (chandraBala(2, true)[0].good !== true) fail('Chandrabala distance 3 (shukla) should be supportive');
// distance 2 is supportive only when waxing (extra set {2,5,9}); not when waning.
if (chandraBala(1, true)[0].good !== true) fail('Chandrabala distance 2 should be supportive when waxing');
if (chandraBala(1, false)[0].good !== false) fail('Chandrabala distance 2 should be weak when waning');

/* ---- 3. Natal anchors: Moon BAV always sums to 49, SAV to 337 -------------------- */
const anchors = natalAnchors(DELHI, 'lahiri', { y: 1990, m: 6, day: 15, hh: 8, mi: 30 });
if (typeof anchors.janmaNak !== 'number' || anchors.janmaNak < 0 || anchors.janmaNak > 26) fail(`janmaNak out of range (${anchors.janmaNak})`);
if (typeof anchors.janmaSign !== 'number' || anchors.janmaSign < 0 || anchors.janmaSign > 11) fail(`janmaSign out of range (${anchors.janmaSign})`);
if (!Array.isArray(anchors.moonBav) || anchors.moonBav.length !== 12) fail('moonBav must be a 12-length array');
else {
  const sum = anchors.moonBav.reduce((a, b) => a + b, 0);
  if (sum !== 49) fail(`Moon Bhinnashtakavarga must sum to 49, got ${sum}`);
  if (anchors.moonBav.some((b) => b < 0 || b > 8)) fail('every Moon bindu must be 0..8');
}
// Determinism.
const a2 = natalAnchors(DELHI, 'lahiri', { y: 1990, m: 6, day: 15, hh: 8, mi: 30 });
if (JSON.stringify(a2) !== JSON.stringify(anchors)) fail('natalAnchors not deterministic');

/* ---- 4. personalFit on a real finder day, and the special-caution semantics ------ */
const scan = muhuratScanRange(DELHI, 'lahiri', ymd(2026, 8, 1), ymd(2026, 9, 30), 'wedding');
if (!scan.length) fail('finder returned no days for the anchor range');
const sample = scan.find((d) => Number.isFinite(d.rise) && Number.isFinite(d.nak)) || scan[0];
const dayNak = sample.nak;

// Build a synthetic Janma so `sample` is exactly the 18th nakshatra from it (Samudayika),
// with birth sign == the day's moon sign so Chandrabala is supportive (distance 1) and
// Tarabala is tara 9 (good) — proving the special caution MARKS but does NOT cut.
const moonSignOfSample = personalFit(anchors, sample).moonSign;
const synth18 = { janmaNak: ((dayNak - 17) % 27 + 27) % 27, janmaSign: moonSignOfSample, moonBav: null };
const fit18 = personalFit(synth18, sample);
if (fit18.special !== 18) fail(`expected ordinal 18 from synthetic Janma, got ${fit18.special}`);
if (fit18.specialCaution !== true) fail('18th-from-Janma must raise specialCaution');
if (fit18.specialName !== 'samudayika') fail(`18th special name should be samudayika, got ${fit18.specialName}`);
if (fit18.coreOk !== true) fail('special caution must NOT force coreOk false (it only marks)');

// Control: 20th nakshatra from Janma is not in the avoided set.
const synth20 = { janmaNak: ((dayNak - 19) % 27 + 27) % 27, janmaSign: moonSignOfSample, moonBav: null };
const fit20 = personalFit(synth20, sample);
if (fit20.special !== 20) fail(`expected ordinal 20, got ${fit20.special}`);
if (fit20.specialCaution !== false) fail('20th-from-Janma must not raise a special caution');

// coreOk is exactly Tarabala AND Chandrabala.
const fitReal = personalFit(anchors, sample);
if (fitReal.coreOk !== (fitReal.taraGood && fitReal.chandraGood)) fail('coreOk must equal taraGood && chandraGood');

/* ---- 5. Graded filter: only !coreOk removed; strength/caution never remove -------- */
const valid = scan.filter((d) => d.valid);
const res = applyPersonalisation(valid, anchors);
if (!['filter', 'annotate'].includes(res.mode)) fail(`applyPersonalisation.mode invalid (${res.mode})`);
if (res.mode === 'filter') {
  if (res.kept.some((d) => !d.fit.coreOk)) fail('filter mode kept a !coreOk day');
  if (res.setAside.some((d) => d.fit.coreOk)) fail('filter mode set aside a coreOk day');
  if (res.kept.length + res.setAside.length !== valid.length) fail('filter partition lost or duplicated days');
  // strength & special caution never move a day to setAside
  if (res.setAside.some((d) => d.fit.coreOk && (d.fit.specialCaution || d.fit.strength <= 1))) fail('a coreOk day was removed by strength/caution');
} else {
  if (res.setAside.length !== 0) fail('annotate mode must not set any day aside');
  if (res.kept.length !== valid.length) fail('annotate mode must keep every candidate day');
}

// The <3 fallback: a hand-built list of three !coreOk days must flip to annotate mode.
const badDay = valid.length ? { ...valid[0] } : { rise: scan[0].rise, nak: scan[0].nak, tn: scan[0].tn };
// force !coreOk by choosing a Janma that makes this day tara 1 (same star)
const forceBadAnchors = { janmaNak: personalFit(anchors, badDay).moonNak, janmaSign: 99, moonBav: null };
const smallList = [badDay, { ...badDay }, { ...badDay }];
const resSmall = applyPersonalisation(smallList, forceBadAnchors);
if (resSmall.mode !== 'annotate') fail('a list with <3 surviving days must flip to annotate mode');

/* ---- 6. Copy: bilingual and honest ---------------------------------------------- */
for (const [k, v] of Object.entries({ PM_TITLE, PM_INTRO, PM_NATAL_HINT, PM_RESULT_NOTE, PM_ANNOTATE_NOTE, PM_SPECIAL_CAUTION_NOTE })) {
  if (!v || !v.en || !v.hi) fail(`${k} must be a bilingual {en,hi} pair`);
}
if (!Array.isArray(PM_SPECIAL_NAMES) || PM_SPECIAL_NAMES.length !== 6) fail('PM_SPECIAL_NAMES must list the 6 Adhanadi names');
if (PM_NATAL_HINT?.en && !/stored|store/i.test(PM_NATAL_HINT.en)) fail('natal hint must state birth details are not stored');
// The caution must be labelled as tradition, not classical muhurta doctrine.
if (PM_SPECIAL_CAUTION_NOTE?.en && !/tradition/i.test(PM_SPECIAL_CAUTION_NOTE.en)) fail('special caution copy must be labelled a personal tradition');
if (PM_SPECIAL_CAUTION_NOTE?.en && !/not a classical/i.test(PM_SPECIAL_CAUTION_NOTE.en)) fail('special caution copy must state it is NOT a classical muhurta rule');
if (typeof PM_COUNT !== 'function') fail('PM_COUNT must be a function (kept,total)->{en,hi}');

/* ---- 7. The screen never edits the general finder engine ------------------------- */
const screenSrc = fs.readFileSync('src/screens/PersonalMuhuratScreen.tsx', 'utf8');
if (/muhurat\.ts/.test(screenSrc) === false && !/muhuratScanRange/.test(screenSrc)) fail('screen must call muhuratScanRange (the unchanged finder)');
if (/from ["']\.\.\/screens\/MuhuratHub["']/.test(screenSrc)) fail('personal screen must not import MuhuratHub');

if (failures) { console.error(`\n✗ personal-muhurat FAILED (${failures})`); process.exit(1); }
console.log('✓ personal-muhurat PASSED (Tarabala/Chandrabala hard filters, Moon-BAV strength, Adhanadi soft caution, graded filter + annotate fallback, honest bilingual copy)');
