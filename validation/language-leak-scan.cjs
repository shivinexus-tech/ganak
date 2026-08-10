#!/usr/bin/env node
'use strict';
/* E-1.0 / I18N-DEVANAGARI-TERMS — the "zero leaks" oracle promised on 2026-07-29 and
 * never built. Spec: docs/superpowers/specs/2026-08-05-language-parity-e1.0-design.md
 *
 * The defect this exists to stop: every screen kept its own private Hindi table for the
 * 12 rashi, 27 nakshatra and 9 grahas. Sixteen such tables were counted on 2026-08-09,
 * and they had already drifted — "Purva Phalguni" was spelled three different ways and
 * Aquarius two. One reader, two screens, two spellings of their own birth star.
 *
 * The rule: src/i18n/panchang-terms.ts is the ONLY place a rashi, nakshatra or graha
 * name may be written in Devanagari. Everywhere else asks that module.
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert');

const root = process.cwd();
const I18N_DIR = 'src/i18n/';
const terms = require('./_load-app.cjs').loadApp('src/i18n/panchang-terms.ts');

/* ---------------------------------------------------- 0. the source of truth is sane */
const { SIGN_HI, NAKSHATRA_HI, PLANET_HI, SIGN_ORDER, NAKSHATRA_ORDER, SIGN_EN_WESTERN,
  panchangTerm, panchangTermAt, signName, signLabel } = terms;

assert.strictEqual(SIGN_ORDER.length, 12, 'there are 12 rashi');
assert.strictEqual(NAKSHATRA_ORDER.length, 27, 'there are 27 nakshatra');
assert.strictEqual(SIGN_EN_WESTERN.length, 12, 'there are 12 English sign names');
assert.strictEqual(Object.keys(PLANET_HI).length, 9, 'there are 9 grahas');
SIGN_ORDER.forEach((s) => assert(SIGN_HI[s], `sign table missing ${s}`));
NAKSHATRA_ORDER.forEach((n) => assert(NAKSHATRA_HI[n], `nakshatra table missing ${n}`));
SIGN_EN_WESTERN.forEach((w, i) => assert.strictEqual(SIGN_HI[w], SIGN_HI[SIGN_ORDER[i]],
  `Western alias ${w} must resolve to the same Devanagari as ${SIGN_ORDER[i]}`));

/* index + string accessors agree */
SIGN_ORDER.forEach((s, i) => {
  assert.strictEqual(panchangTermAt('hi', 'sign', i), SIGN_HI[s], `sign index ${i} drifted`);
  assert.strictEqual(signName('en', i), SIGN_EN_WESTERN[i], `English sign ${i} drifted`);
  assert.strictEqual(signLabel('en', s), SIGN_EN_WESTERN[i], `signLabel(en, ${s}) drifted`);
  assert.strictEqual(signLabel('hi', s), SIGN_HI[s], `signLabel(hi, ${s}) drifted`);
  assert.strictEqual(signLabel('en', `${s} (${SIGN_EN_WESTERN[i]})`), SIGN_EN_WESTERN[i],
    'signLabel must accept the engine display form');
});
NAKSHATRA_ORDER.forEach((n, i) =>
  assert.strictEqual(panchangTermAt('hi', 'nakshatra', i), NAKSHATRA_HI[n], `nakshatra index ${i} drifted`));

/* out-of-range and unknown input must degrade, never throw */
assert.strictEqual(panchangTermAt('hi', 'sign', 99), '', 'out-of-range index must return ""');
assert.strictEqual(panchangTermAt('hi', 'sign', undefined), '', 'undefined index must return ""');
assert.strictEqual(panchangTerm('hi', 'planet', 'Nibiru'), 'Nibiru', 'unknown value must pass through');
assert.strictEqual(panchangTerm('en', 'sign', 'Kanya'), 'Kanya', 'English must not translate');

/* ------------------------------------------- 1. nobody else writes these names in Devanagari */
const files = (function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) return walk(full);
    return /\.(tsx?|jsx?)$/.test(e.name) ? [full] : [];
  });
})(path.join(root, 'src'));

/* Every Devanagari string the shared module owns. A copy of any of these outside
   src/i18n/ is, by definition, a second source of truth. */
const OWNED = new Map();
for (const [en, hi] of Object.entries(SIGN_HI)) OWNED.set(hi, `rashi ${en}`);
for (const [en, hi] of Object.entries(NAKSHATRA_HI)) OWNED.set(hi, `nakshatra ${en}`);
for (const [en, hi] of Object.entries(PLANET_HI)) OWNED.set(hi, `graha ${en}`);

/* Devanagari appears legitimately all over the app, in two ways this gate must NOT flag:
 *   - prose — "शनि की दशा में…"
 *   - proper festival names — "मकर संक्रांति", where a rashi name is part of a longer
 *     event name the project deliberately keeps in Sanskrit.
 * A lookup table is different: the name stands alone as a complete string literal
 * ("अश्विनी", not "…अश्विनी नक्षत्र में…"). So count only whole-literal matches, and
 * require several on one line — which is what an array or object of names looks like
 * and what a sentence never is.
 */
const TABLE_DENSITY = 4;
const STRING_LITERAL = /"([^"\\]*)"|'([^'\\]*)'|`([^`\\$]*)`/g;

const duplicates = [];
for (const file of files) {
  const rel = path.relative(root, file).split(path.sep).join('/');
  if (rel.startsWith(I18N_DIR)) continue;
  fs.readFileSync(file, 'utf8').split('\n').forEach((line, i) => {
    if (line.trim().startsWith('//') || line.trim().startsWith('*')) return;
    const hits = [];
    for (const m of line.matchAll(STRING_LITERAL)) {
      const literal = (m[1] ?? m[2] ?? m[3] ?? '').trim();
      if (OWNED.has(literal)) hits.push(`${literal} (${OWNED.get(literal)})`);
    }
    if (hits.length >= TABLE_DENSITY) {
      duplicates.push(`${rel}:${i + 1} — ${hits.length} name literals on one line: ${hits.slice(0, 3).join(', ')}…`);
    }
  });
}

assert.strictEqual(duplicates.length, 0,
  `A second source of truth for rashi/nakshatra/graha names:\n  ${duplicates.join('\n  ')}\n` +
  'Delete the table and call panchangTerm / panchangTermAt / signName / signLabel instead.');

/* ------------------------- 1b. engine name arrays must never reach JSX unlocalised */
/* The defect this catches: a screen interpolating the engine's canonical English
   array straight into the markup — `{NAKSHATRAS[i]}` — so Hindi mode prints
   "Shatabhisha". Four such sites survived the whole 16-table migration on
   2026-08-09 precisely because they consulted NO table, leaving check 1 nothing to
   find. A rendered-text snapshot cannot see it either when the surface only appears
   after a cast. So it is caught here, at the source, by shape. */
const RAW_IN_JSX = /[{$]\{?\s*(NAKSHATRAS|SIGNS)\s*\[/;
const rawRenders = [];
for (const file of files) {
  const rel = path.relative(root, file).split(path.sep).join('/');
  if (!/^src\/(screens|components)\//.test(rel)) continue;
  fs.readFileSync(file, 'utf8').split('\n').forEach((line, i) => {
    if (line.trim().startsWith('//') || line.trim().startsWith('*')) return;
    if (!RAW_IN_JSX.test(line)) return;
    // Localised forms wrap the array access, e.g. panchangTerm(lang,"nakshatra",NAKSHATRAS[i])
    if (/(panchangTerm|panchangTermAt|signLabel|signName|signShort)\s*\(/.test(line)) return;
    rawRenders.push(`${rel}:${i + 1} → ${line.trim().slice(0, 110)}`);
  });
}
assert.strictEqual(rawRenders.length, 0,
  `An engine name array is rendered without localisation:\n  ${rawRenders.join('\n  ')}\n` +
  'Wrap it: panchangTerm(lang, "nakshatra", NAKSHATRAS[i]) or signLabel(lang, SIGNS[i]).');

/* ----------------------- 1c. a Hindi string must not carry an English word inside it */
/* Owner, 2026-08-10: "i dont want a single hindi word on english and vice versa."
   The screen-snapshot gate catches the RENDERED form, but only for screens it can
   render — it does not cover the shell chrome, which is where the Personalize
   control lived: Hindi mode read "Personalize · अपना बनाएँ", English first, on every
   single screen. This catches the shape at source, wherever it is written.

   Allowed: proper nouns, initialisms and format tokens that have no Hindi form. */
const ENGLISH_OK = new Set(['Ganak', 'KP', 'PDF', 'SAV', 'ISKCON', 'Smarta', 'AM', 'PM',
  'UTC', 'IST', 'YYYY', 'MM', 'DD', 'BNN', 'Rahu', 'Ketu', 'Om']);
const HI_BRANCH = /(?:lang\s*===\s*["']hi["']|(?<![A-Za-z_$])hi)\s*\?\s*["']([^"']{2,160})["']/g;
const englishInHindi = [];
for (const file of files) {
  const rel = path.relative(root, file).split(path.sep).join('/');
  fs.readFileSync(file, 'utf8').split('\n').forEach((line, i) => {
    if (line.trim().startsWith('//') || line.trim().startsWith('*')) return;
    for (const m of line.matchAll(HI_BRANCH)) {
      const text = m[1];
      if (!/[ऀ-ॿ]/.test(text)) continue; // not actually the Hindi branch
      const words = (text.match(/[A-Za-z]{3,}/g) || []).filter((w) => !ENGLISH_OK.has(w));
      if (words.length) {
        englishInHindi.push(`${rel}:${i + 1} — English inside Hindi copy: ${words.join(', ')}\n      ${text.slice(0, 90)}`);
      }
    }
  });
}
assert.strictEqual(englishInHindi.length, 0,
  `Hindi copy containing English words:\n  ${englishInHindi.join('\n  ')}\n` +
  'Write the Hindi string in Hindi. If the word is a proper noun or a format token with no\n' +
  'Hindi form, add it to ENGLISH_OK in this gate with that reason.');

/* ------------------------------- 2. the one unavoidable copy is pinned, not trusted */
/* PrashnaScreen's engine is validated by prashna-parity, which evaluates the region
   between its ENGINE markers as plain, self-contained JS — it can carry neither an
   import nor a TypeScript annotation. NAK_EN is used by that engine, so it must stay
   inlined. A copy that cannot be deleted must at least be proven equal. */
const prashna = fs.readFileSync(path.join(root, 'src/screens/PrashnaScreen.tsx'), 'utf8');
const m = prashna.match(/const NAK_EN = \[([^\]]*)\];/);
assert(m, 'PrashnaScreen must still inline NAK_EN for its parity-frozen engine');
const inlined = m[1].split(',').map((x) => x.trim().replace(/^['"]|['"]$/g, ''));
assert.deepStrictEqual(inlined, [...NAKSHATRA_ORDER],
  'PrashnaScreen\'s inlined NAK_EN has drifted from the shared NAKSHATRA_ORDER.\n' +
  'It cannot import (parity evaluates that region as standalone JS), so it must match by value.');

console.log(`✓ language-leak-scan: ${files.length} files · 1 source of truth · ` +
  `12 rashi (+12 English aliases) · 27 nakshatra · 9 grahas · index and string accessors agree`);
