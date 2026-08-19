#!/usr/bin/env node
'use strict';
// ============================================================================
// validation/calculator-depth.cjs  —  P0-CALCULATOR-DEPTH
//
// Owner feedback, 2026-07-25: the calculator pages are "very surface level" —
// an answer line and a method note, but they "don't render or explain anything
// to an enthusiast". The people who use a calculator are curious non-experts,
// not astrologers who read a chart themselves.
//
// The depth block in UtilityCalculatorScreen is keyed by slug and returns null
// when a calculator has no entry, so a page silently stays shallow. Nothing
// caught that. This gate makes the absence loud:
//
//   1. every non-excluded calculator has an explainer entry
//   2. each entry teaches all four things the owner asked for — what it is,
//      what it means, myths vs reality, and when to consult someone
//   3. both languages are present, real, and not each other's copy
//   4. the tone rule holds: no fatalistic or absolute claims
// ============================================================================
const fs = require('fs');
const path = require('path');
const { loadApp, ROOT } = require('./_load-app.cjs');

const utils = loadApp('src/data/utility-calculators.ts');
const dosha = loadApp('src/data/dosha-explainers.ts');
// loadApp exits the process on a missing entry point, so check before asking.
// Absence is a legitimate state here — it just means no calculator outside the
// dosha set has been given teaching content yet, which the entry check reports.
const EXTRA_PATH = 'src/data/calculator-explainers.ts';
const extra = fs.existsSync(path.join(ROOT, EXTRA_PATH))
  ? (loadApp(EXTRA_PATH).CALCULATOR_EXPLAINERS || {})
  : {};

// Held by CLAUDE-MATCHING-AUDIT-REMAINDER-2026-08-18; that lane owns their copy.
const DEFERRED = new Set(['mangal-dosha', 'sade-sati']);

let failures = 0;
const fail = (m) => { failures++; console.error('FAIL ' + m); };
const pass = (m) => console.log('  ok  ' + m);

const DEVANAGARI = /[ऀ-ॿ]/;
const LATIN_WORD = /[A-Za-z]{4,}/;

/* Words that turn guidance into a verdict. The owner's standing rule for this
   content is balanced and non-fatalistic: a chart names a theme to work with,
   never a sentence. Proper nouns and hedged uses are excluded by requiring the
   fatalistic sense — "will always", "guaranteed", "doomed", "must do a puja". */
const FATALISTIC = [
  /\bdoomed\b/i, /\bguarantee[sd]?\b/i, /\bwill always\b/i, /\bnever able to\b/i,
  /\bcursed\b/i, /\bmust perform\b/i, /\bonly way to avoid\b/i,
];

const all = (utils.UTILITY_CALCULATORS || []).map((c) => c.slug);
if (!all.length) fail('no calculators found in src/data/utility-calculators.ts');

const explainers = { ...(dosha.DOSHA_EXPLAINERS || {}), ...extra };
const required = all.filter((s) => !DEFERRED.has(s));

const missing = required.filter((s) => !explainers[s]);
if (missing.length) {
  fail(`${missing.length} of ${required.length} calculators have no teaching content and render only an answer + method note: ${missing.join(', ')}`);
} else {
  pass(`all ${required.length} in-scope calculators have teaching content (${DEFERRED.size} deferred to the matching lane)`);
}

for (const slug of required) {
  const ex = explainers[slug];
  if (!ex) continue;

  // 2. Every section the owner asked for is present and substantial.
  for (const [field, min] of [['whatEn', 220], ['whatHi', 180], ['meaningEn', 180], ['meaningHi', 150],
                              ['perspectiveEn', 150], ['perspectiveHi', 120]]) {
    const v = String(ex[field] || '');
    if (!v) { fail(`${slug}: ${field} is missing`); continue; }
    if (v.length < min) fail(`${slug}: ${field} is ${v.length} chars — too thin to teach anything (min ${min})`);
  }

  if (!Array.isArray(ex.myths) || ex.myths.length < 2) {
    fail(`${slug}: needs at least 2 myth/reality pairs, has ${(ex.myths || []).length}`);
  } else {
    for (const [i, m] of ex.myths.entries()) {
      for (const f of ['mythEn', 'realityEn', 'mythHi', 'realityHi']) {
        if (!String(m[f] || '').trim()) fail(`${slug}: myth ${i + 1} is missing ${f}`);
      }
      if (m.mythEn && m.realityEn && m.mythEn === m.realityEn) fail(`${slug}: myth ${i + 1} states the same thing as its reality`);
    }
  }

  // 3. Both languages real, and not one pasted into the other.
  for (const f of ['whatHi', 'meaningHi', 'perspectiveHi']) {
    const v = String(ex[f] || '');
    if (v && !DEVANAGARI.test(v)) fail(`${slug}: ${f} contains no Devanagari — it is not actually Hindi`);
    if (v && LATIN_WORD.test(v.replace(/\b(Lahiri|Ganak|Parashari|Vedic)\b/g, ''))) {
      const leak = v.replace(/\b(Lahiri|Ganak|Parashari|Vedic)\b/g, '').match(LATIN_WORD);
      fail(`${slug}: ${f} leaks untranslated English ("${leak[0]}")`);
    }
  }
  for (const [en, hi] of [['whatEn', 'whatHi'], ['meaningEn', 'meaningHi'], ['perspectiveEn', 'perspectiveHi']]) {
    if (ex[en] && ex[en] === ex[hi]) fail(`${slug}: ${hi} is a copy of ${en}`);
  }

  // 4. Tone.
  for (const f of ['whatEn', 'meaningEn', 'perspectiveEn']) {
    for (const re of FATALISTIC) {
      const hit = String(ex[f] || '').match(re);
      if (hit) fail(`${slug}: ${f} makes a fatalistic claim ("${hit[0]}") — this content must stay balanced`);
    }
  }
}

if (!failures) pass('every entry teaches what/meaning/myths/perspective, in both languages, in a balanced tone');

console.log(failures === 0
  ? '\nPASS calculator-depth'
  : `\nFAIL calculator-depth (${failures} failure${failures === 1 ? '' : 's'})`);
process.exit(failures === 0 ? 0 : 1);
