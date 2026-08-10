#!/usr/bin/env node
'use strict';
/* Screen snapshot gate (VERIFY-SNAPSHOTS, backlog #65).
   Spec: docs/superpowers/specs/2026-08-10-screen-snapshot-verification-design.md

   The other gates prove the maths and the structure. None of them proved what a
   reader SEES, which is how three language defects reached main in August 2026:
   the Devanagari gochar leak, SecHead pinned to lang="hi", and four raw
   NAKSHATRAS[...] sites that printed "Shatabhisha" in Hindi. The last survived a
   16-table migration AND its own purpose-built gate, because those sites consulted
   no table for a table-scanning gate to find.

   An intentional copy change is EXPECTED to fail this. Re-baseline with
     node validation/snapshot-generate.cjs --write
   and commit the diff — that diff is the review artifact.

   SCOPE: rendered TEXT only. renderToStaticMarkup produces no layout box, so
   overflow, contrast and touch targets at 375px still need a human at 375px. */

const fs = require('fs');
const path = require('path');
const { generate, OUT_DIR, SCREENS, LANGS } = require('./snapshot-generate.cjs');
const { loadApp } = require('./_load-app.cjs');

const fresh = generate({ write: false });
let failures = 0;

function diffLines(expected, actual) {
  const e = expected.split('\n'), a = actual.split('\n');
  const out = [];
  for (let i = 0; i < Math.max(e.length, a.length) && out.length < 40; i++) {
    if (e[i] !== a[i]) {
      if (e[i] !== undefined) out.push(`    -${i + 1}: ${e[i]}`);
      if (a[i] !== undefined) out.push(`    +${i + 1}: ${a[i]}`);
    }
  }
  return out;
}

/* ------------------------------------------------ 1. nothing changed unexpectedly */
for (const [key, actual] of fresh) {
  const file = path.join(OUT_DIR, `${key}.txt`);
  if (!fs.existsSync(file)) {
    console.error(`FAIL ${key}: no committed baseline. Run: node validation/snapshot-generate.cjs --write`);
    failures++;
    continue;
  }
  const expected = fs.readFileSync(file, 'utf8').replace(/\n$/, '');
  if (expected !== actual) {
    console.error(`FAIL ${key}: rendered text changed`);
    diffLines(expected, actual).forEach((l) => console.error(l));
    failures++;
  }
}

/* ------------------------------------------- 2. one language per screen, as rendered */
/* language-leak-scan owns the SOURCE half of this (no duplicate name tables). This is
   the RENDERED half it cannot see: the four raw NAKSHATRAS[...] sites contained no
   table at all, so only rendered output could ever have caught them. */
const DEVANAGARI = /[ऀ-ॿ]/;
const ALLOWED_IN_EN = ['गणक', 'ॐ', 'हिन्दी', 'भाषा'];
const terms = loadApp('src/i18n/panchang-terms.ts');
const LATIN_TERMS = [
  ...Object.keys(terms.SIGN_HI), ...Object.keys(terms.NAKSHATRA_HI), ...Object.keys(terms.PLANET_HI),
].filter((t) => !['Sun', 'Moon'].includes(t)); // also plain English words; covered by the sign/nakshatra checks

/* E-1.0 (owner, 2026-07-28; "plain Virgo" confirmed 2026-08-05): English mode names the
   12 rashi in English. The Devanagari check above cannot see this half — "Kanya (Virgo)"
   and "(Karka)" are pure Latin script, so they sailed past every gate and shipped in the
   Muhurat ascendant picker, the full-panchang Moon/Sun sign rows and the season clock.
   Sanskrit survives in EXACTLY one place: a proper event name such as "Kanya Sankranti",
   which festival-meta.ts owns — so those are subtracted from the text, not exempted by
   pattern, and a bare "Kanya" anywhere else is a failure. */
const fest = loadApp('src/data/festival-meta.ts');
const EVENT_NAMES_EN = [...Object.values(fest.FEST_NAME || {}), ...Object.values(fest.OBS_NAME || {})]
  .map((v) => (v && typeof v === 'object' ? v.en : v))
  .filter((s) => typeof s === 'string' && s)
  .sort((a, b) => b.length - a.length);

for (const [key, text] of fresh) {
  if (key.endsWith('.en')) {
    const stripped = ALLOWED_IN_EN.reduce((s, w) => s.split(w).join(''), text);
    const noEvents = EVENT_NAMES_EN.reduce((s, name) => s.split(name).join(''), text);
    const sanskritSigns = terms.SIGN_ORDER.filter((s) => new RegExp(`\\b${s}\\b`).test(noEvents));
    if (sanskritSigns.length) {
      const bad = noEvents.split('\n')
        .filter((l) => sanskritSigns.some((s) => new RegExp(`\\b${s}\\b`).test(l))).slice(0, 5);
      console.error(`FAIL ${key}: Sanskrit rashi names in English output: ${sanskritSigns.join(', ')}`);
      bad.forEach((l) => console.error(`    ${l}`));
      console.error('    English mode shows the English sign name (E-1.0). Use signLabel(lang, …) / signName(lang, i).');
      failures++;
    }
    if (DEVANAGARI.test(stripped)) {
      const bad = stripped.split('\n').filter((l) => DEVANAGARI.test(l)).slice(0, 5);
      console.error(`FAIL ${key}: Devanagari in English output:`);
      bad.forEach((l) => console.error(`    ${l}`));
      failures++;
    }
  }
  if (key.endsWith('.hi')) {
    const leaked = LATIN_TERMS.filter((t) =>
      new RegExp(`\\b${t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`).test(text));
    if (leaked.length) {
      console.error(`FAIL ${key}: Latin term names in Hindi output: ${leaked.slice(0, 8).join(', ')}`);
      failures++;
    }
  }
}

if (failures) {
  console.error(`\n✗ screen-snapshots FAILED (${failures})`);
  console.error('If the change was intentional: node validation/snapshot-generate.cjs --write, then commit the diff.');
  process.exit(1);
}

const covered = SCREENS.filter((s) => !s.skip).length;
const skipped = SCREENS.filter((s) => s.skip);
console.log(`✓ screen-snapshots: ${fresh.size} baselines match · ${covered} screens × ${LANGS.length} languages + chart/transit results`);
if (skipped.length) console.log(`  not covered (${skipped.length}): ${skipped.map((s) => s.key).join(', ')} — inner modules needing parent-computed data`);
console.log('  scope: rendered TEXT only — layout, overflow and contrast still need a human at 375px.');
