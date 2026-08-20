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

/* B10 — pada + lord label helpers. Same contract as the name tables above: one
   spelling, index/string accessors agree, bad input degrades instead of throwing. */
const { padaLabel, padaText, planetName, planetShort, PADA_LABEL, PLANET_SHORT_EN } = terms;
assert.strictEqual(padaLabel('hi'), PADA_LABEL.hi, 'Hindi pada label drifted');
assert.strictEqual(padaLabel('en'), PADA_LABEL.en, 'English pada label drifted');
[1, 2, 3, 4].forEach((n) => {
  assert.strictEqual(padaText('hi', n), `${PADA_LABEL.hi} ${n}`, `Hindi pada ${n} drifted`);
  assert.strictEqual(padaText('en', n), `${PADA_LABEL.en} ${n}`, `English pada ${n} drifted`);
});
[0, 5, 'x', null, undefined, 2.5].forEach((bad) =>
  assert.strictEqual(padaText('hi', bad), '', `a nakshatra has four padas — ${String(bad)} must render ""`));
Object.entries(PLANET_HI).forEach(([en, hi]) => {
  assert.strictEqual(planetName('hi', en), hi, `lord ${en} must localise through the graha table`);
  assert.strictEqual(planetName('en', en), en, `lord ${en} must pass through in English`);
  assert.strictEqual(planetShort('hi', en), hi, `Devanagari graha names are already short — ${en} must not be clipped`);
  assert(PLANET_SHORT_EN[en], `no compact English label for lord ${en}`);
});
/* The compact English labels must stay distinguishable — the whole point of having
   a table instead of .slice(0, 3) is that a collision would be silent. */
assert.strictEqual(new Set(Object.values(PLANET_SHORT_EN)).size, 9, 'two grahas share one compact label');
assert.strictEqual(planetName('hi', ''), '', 'empty lord must render ""');
assert.strictEqual(planetShort('en', 'Nibiru'), 'Nib', 'unknown lord must degrade, not throw');

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

/* --------- 1d. no hand-rolled bilingual pair, and no unbranched English JSX text */
/* Two more mechanisms, both found 2026-08-10 after the owner asked for every
   remaining one:
     - a Devanagari heading with its English translation in the next span, printed
       together with no language branch. This is SectionHeader's old behaviour
       rebuilt by hand, so the header gate could never see it. MuhuratHub had four.
     - a bare English word in JSX text with no branch at all, so Hindi readers get
       English ("upto", "Graha"). */
const jsxLeaks = [];
for (const file of files) {
  const rel = path.relative(root, file).split(path.sep).join('/');
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  lines.forEach((line, i) => {
    const st = line.trim();
    if (st.startsWith('//') || st.startsWith('*')) return;
    const branched = /\bhi\s*\?|lang\s*===|!hi\s*&&|hi\s*&&/.test(line);

    // adjacent Devanagari span + English span, neither behind a branch
    const next = lines[i + 1] || '';
    if (!branched && !/\bhi\s*\?|lang\s*===/.test(next)
        && /<span[^>]*>[^<]*[ऀ-ॿ][^<]*<\/span>/.test(line)
        && /<span[^>]*>\s*[A-Za-z][A-Za-z ,'’\-/&]{2,}\s*<\/span>/.test(next)) {
      jsxLeaks.push(`${rel}:${i + 1} — Devanagari heading with an English twin on the next line (show one language)`);
    }

    /* English in a user-facing PROP never reaches JSX text, so the check above
       cannot see it — a Hindi screen-reader user was hearing "reset". */
    if (!branched) {
      for (const m of line.matchAll(/\b(aria-label|title|placeholder|alt)=["']([^"']{3,60})["']/g)) {
        const val = m[2].trim();
        if (!/[A-Za-z]{3}/.test(val) || ENGLISH_OK.has(val)) continue;
        if (/^(https?|\/|#)/.test(val)) continue;
        jsxLeaks.push(`${rel}:${i + 1} — English in ${m[1]} with no language branch: "${val.slice(0, 40)}"`);
      }
    }

    // unbranched English JSX text
    if (!branched) {
      for (const m of line.matchAll(/>([A-Za-z][A-Za-z ,'’\-/&]{2,60})</g)) {
        const t = m[1].trim();
        if (t.length < 3 || /^(https?|www)/.test(t)) continue;
        if (ENGLISH_OK.has(t)) continue;
        jsxLeaks.push(`${rel}:${i + 1} — English JSX text with no language branch: "${t.slice(0, 40)}"`);
      }
    }
  });
}
assert.strictEqual(jsxLeaks.length, 0,
  `Text that ignores the language toggle:\n  ${jsxLeaks.join('\n  ')}\n` +
  'Branch on lang, or add a genuinely language-neutral token to ENGLISH_OK.');

/* ------------------------------------- 1e. pada labels come from ONE place only */
/* B10, 2026-08-18. The 27 nakshatra names were centralised in E-1.0; their four
   PADAS were not, and nobody had ever looked. Three sites, two Hindi words:
   "पाद" on the chart's birth summary and in the rectifier, "चरण" in the quick
   calculators — the same reader's own birth pada, spelled two ways on two
   screens, which is precisely the defect E-1.0 exists to prevent. The label now
   lives in padaLabel/padaText and nowhere else. */
/* "पाद" also names the FEET group of the Rajju koota in marriage matching — a body
   part, not a nakshatra quarter. Same word, different quantity, so it is exempted by
   the name of its own table rather than by a blanket rule that could widen silently. */
const PADA_HOMONYM = /RAJJU_NAMES_HI/;
const PADA_WORD_EN = /^(pada|padas)$/i;
const PADA_WORD_HI = /^(पाद|चरण)$/;
const padaLabels = [];
for (const file of files) {
  const rel = path.relative(root, file).split(path.sep).join('/');
  if (rel.startsWith(I18N_DIR)) continue;
  fs.readFileSync(file, 'utf8').split('\n').forEach((line, i) => {
    const st = line.trim();
    if (st.startsWith('//') || st.startsWith('*') || PADA_HOMONYM.test(line)) return;
    const literals = [];
    for (const m of line.matchAll(STRING_LITERAL)) literals.push((m[1] ?? m[2] ?? m[3] ?? '').trim());
    // "पाद" standing alone is only ever the quarter. "चरण" also means a phase
    // (Sade Sati) or a step, so it only counts when the line is about padas.
    const aboutPada = /\bpada\b/i.test(line) || literals.some((l) => PADA_WORD_EN.test(l));
    const hits = literals.filter((l) => l === 'पाद' || (aboutPada && (PADA_WORD_HI.test(l) || PADA_WORD_EN.test(l))));
    if (hits.length) padaLabels.push(`${rel}:${i + 1} — pada label written by hand: ${[...new Set(hits)].join(', ')}`);
  });
}
assert.strictEqual(padaLabels.length, 0,
  `A second spelling of the pada label:\n  ${padaLabels.join('\n  ')}\n` +
  'Call padaText(lang, n) — or padaLabel(lang) for the bare word — from src/i18n/panchang-terms.ts.');

/* --------------- 1f. a lord value must never be rendered as the engine spells it */
/* Same shape as 1b, for the OTHER family nobody audited: KP star lords, sub-lords,
   sub-sub lords, sign lords and dasha lords. The engine returns them in English
   ("Venus"), so `{p.kp.subLord}` printed "Venus" into a Hindi screen — three KP
   tables, the ruling-planet strip, the whole Vimshottari tree and the rectifier
   sweep, on 2026-08-18. A snapshot could not see it: every one of those surfaces
   exists only after the reader casts a chart. So it is caught here, by shape:
   a lord-valued expression may not be interpolated raw — wrap it in planetName
   (or planetShort for a narrow column). */
const LORD_PATH = String.raw`[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*\.(?:[A-Za-z]*[Ll]ord|subSub|cuspSub|star|sub)`;
const RAW_LORD = new RegExp(String.raw`[{](?:\s*)(` + LORD_PATH + String.raw`)\s*[}]|\$\{\s*(` + LORD_PATH + String.raw`)\s*\}`);
/* A bare `{lord}` / `{pl}` in JSX TEXT is the same defect one destructuring away.
   Anchored to text position on purpose: `pl={pl}` and `key={pl}` pass the value on
   to something that localises it, and flagging those would teach agents to silence
   the gate rather than to fix the leak. */
const BARE_LORD = /(?:^\s*|>)\{\s*(lord|pl|planet)\s*\}(?:\s*$|<)/;
/* The dotted rule above was NOT anchored the same way, and that inconsistency is
   what produced bug-bash F17. `<RPItem pl={RP.ascSignLord} />` hands the canonical
   English lord to a component that localises it AND uses it to look the graha
   colour up in PLANET_COLOR, which is keyed in English — exactly the shape the
   BARE_LORD comment above blesses. Flagged as a leak, it was "fixed" the only way
   that silences the gate: `pl={planetName(lang, RP.ascSignLord)}`. The words stayed
   right, PLANET_COLOR["राहु"] became undefined, and the Ruling Planets strip lost
   all its graha colour in Hindi and in Hindi only, for months.

   So a lord-valued expression in an ATTRIBUTE is passing the value on and is not a
   leak; in JSX text or a template literal it reaches the reader and still is.
   The half this gives up — a prop handed to a component that does NOT localise — is
   picked up by rendered output instead, which is stronger: screen-snapshots.cjs
   § 6n asserts that the whole rendered Hindi chart screen contains no Latin graha,
   rashi or nakshatra name. That check found two further raw sites the same day
   (`· {item.pl}` on the Yogi/Avayogi tiles and `{p.name}` on the bhava-chalit shift
   line) that this source scan had never matched at all. */
const ATTR_POSITION = new RegExp(String.raw`[A-Za-z_$][\w$]*\s*=\s*\{\s*` + LORD_PATH + String.raw`\s*\}`);
const HAND_SHORT = new RegExp(String.raw`(?:` + LORD_PATH + String.raw`|\bpl)\.slice\(`);
const rawLords = [];
for (const file of files) {
  const rel = path.relative(root, file).split(path.sep).join('/');
  if (!/^src\/(screens|components)\//.test(rel)) continue;
  fs.readFileSync(file, 'utf8').split('\n').forEach((line, i) => {
    const st = line.trim();
    if (st.startsWith('//') || st.startsWith('*')) return;
    /* A line that already branches on language AND localises one side is showing the
       reader's own script on the Hindi side; the raw value on the English side is the
       engine's English, which is what an English reader should get. (Prashna prints the
       KP two-letter abbreviations Me/Ju in English and the Devanagari names in Hindi.)
       Both halves of the condition are required, so an unbranched raw lord is still caught. */
    const localisedBranch = /\bhi\s*\?/.test(line)
      && /(GRAHA_HI|panchangTerm|panchangTermAt|planetName|planetShort)\s*[([]/.test(line);
    if (localisedBranch) return;
    /* Strip attribute positions before testing: `pl={RP.dayLord}` passes the lord on,
       `{RP.dayLord}` in text renders it. See ATTR_POSITION above. */
    const rendered = line.replace(new RegExp(ATTR_POSITION.source, 'g'), '');
    const m = RAW_LORD.exec(rendered) || BARE_LORD.exec(rendered);
    if (m) rawLords.push(`${rel}:${i + 1} — lord rendered unlocalised: {${(m[1] || m[2] || m[0]).trim()}}`);
    else if (HAND_SHORT.test(line)) rawLords.push(`${rel}:${i + 1} — lord name clipped by hand: ${st.slice(0, 90)}`);
  });
}
assert.strictEqual(rawLords.length, 0,
  `A KP/dasha lord reaches the screen in the engine's own language:\n  ${rawLords.join('\n  ')}\n` +
  'Wrap it: planetName(lang, x.subLord) — or planetShort(lang, x.subLord) in a narrow column.');

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
  `12 rashi (+12 English aliases) · 27 nakshatra · 9 grahas · 4 padas · 9 lord labels · ` +
  `index and string accessors agree`);
