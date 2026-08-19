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

/* ------------------------------------------------- 3. content parity, not just language */
/* The defect this exists for (JYOTISH-HINDI-PARITY, 2026-08-18): the BNN and Bhrigu
   screens printed ONE generic Hindi sentence in place of EVERY meaning — the same
   sentence 7× in bnn.hi and 19× in bhrigu.hi — while an English reader got a
   distinct interpretation each time. Every existing gate was green: nothing leaked,
   no language mixed, the copy was fluent Hindi. It was simply a thinner product,
   and only a human reading two baselines side by side could see it.

   So compare the two baselines POSITIONALLY. Both languages render the same JSX, so
   an en/hi pair with the same line count is aligned line for line: if English says
   two different things at lines i and j, Hindi saying the identical thing at both is
   a meaning that was collapsed, not translated.

   Only lines long enough to be a phrase count (a repeated one-word label such as
   "secondary" is legitimately the same word twice). The floor is 12 characters; at
   the time of writing this check finds nothing even at 8, so the margin is generous
   rather than tuned to hide something. */
const PHRASE_MIN = 12;
const parityKeys = [...new Set([...fresh.keys()]
  .filter((k) => k.endsWith('.en')).map((k) => k.slice(0, -3)))]
  .filter((k) => fresh.has(`${k}.hi`));

for (const key of parityKeys) {
  const en = fresh.get(`${key}.en`).split('\n');
  const hi = fresh.get(`${key}.hi`).split('\n');
  if (en.length !== hi.length) continue; // structures diverge; positions mean nothing
  const byHindi = new Map();
  en.forEach((line, i) => {
    if (line.length < PHRASE_MIN || !line.includes(' ')) return;
    if (!byHindi.has(hi[i])) byHindi.set(hi[i], new Set());
    byHindi.get(hi[i]).add(line);
  });
  for (const [hiLine, englishVariants] of byHindi) {
    if (englishVariants.size < 2) continue;
    console.error(`FAIL ${key}: ${englishVariants.size} distinct English meanings collapse to one Hindi sentence`);
    console.error(`    hi: ${hiLine.slice(0, 100)}`);
    [...englishVariants].slice(0, 3).forEach((v) => console.error(`    en: ${v.slice(0, 100)}`));
    console.error('    Hindi readers must get one meaning per row, not a generic sentence repeated.');
    failures++;
  }
}

/* --------------------------- 4. every English signification has a Hindi twin */
/* The rendered check above only sees the rows this fixture happens to produce. This
   half is exhaustive: a signification table and its Hindi twin must carry exactly the
   same keys, so adding an English meaning without a Hindi one fails at once instead
   of waiting for a chart that lands on it. Astrological significations carry religious
   weight — the twin must be a TRANSLATION of the English Ganak already states, never a
   meaning invented to fill a hole. */
const bhriguEn = loadApp('src/engine/bhrigu.ts');
const bhriguHi = loadApp('src/data/bhrigu-copy-hi.ts');
const TWINS = [
  ['BNN_KARAKA', bhriguEn.BNN_KARAKA, bhriguHi.BNN_KARAKA_HI],
  ['BNN_MEANING', bhriguEn.BNN_MEANING, bhriguHi.BNN_MEANING_HI],
  ['BCP_HOUSE_THEME', bhriguEn.BCP_HOUSE_THEME, bhriguHi.BCP_HOUSE_THEME_HI],
];
for (const [name, english, hindi] of TWINS) {
  const missing = Object.keys(english).filter((k) => !hindi[k]);
  const extra = Object.keys(hindi).filter((k) => !english[k]);
  if (missing.length) {
    console.error(`FAIL ${name}: ${missing.length} signification(s) English-only: ${missing.slice(0, 6).join(', ')}`);
    console.error('    Add the Hindi translation in src/data/bhrigu-copy-hi.ts — do not invent a meaning.');
    failures++;
  }
  if (extra.length) {
    console.error(`FAIL ${name}: Hindi key(s) with no English original: ${extra.slice(0, 6).join(', ')}`);
    failures++;
  }
}
/* Shadbala's six sub-strengths carry their own Hindi label; the table used to be
   English-only and the Hindi chart printed "Sthana Dig Kala Cheshta Naisargika Drik". */
const { BALA_PARTS } = loadApp('src/engine/shadbala.ts');
const balaGaps = BALA_PARTS.filter((b) => !b.labelHi || !b.noteHi).map((b) => b.k);
if (balaGaps.length) {
  console.error(`FAIL BALA_PARTS: no Hindi label for ${balaGaps.join(', ')}`);
  failures++;
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
/* A green run must never be read as "this screen is fully proven". Screens whose
   answer only appears after the reader acts are covered in their INITIAL state
   only, and the gate says so out loud rather than leaving it implied. */
const partial = SCREENS.filter((s) => !s.skip && s.note);
if (partial.length) {
  console.log(`  initial state only (${partial.length}): ${[...new Set(partial.map((s) => s.key.replace(/^utility-.*/, 'utility-*')))].join(', ')}`);
  console.log('    — the answer appears after Calculate / Cast; static render cannot press a button.');
}
console.log('  scope: rendered TEXT only — layout, overflow and contrast still need a human at 375px.');
