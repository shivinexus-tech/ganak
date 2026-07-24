#!/usr/bin/env node
'use strict';

const assert = require('node:assert');
const fs = require('node:fs');
const path = require('path');
const { loadApp } = require('./_load-app.cjs');

const ROOT = path.join(__dirname, '..');
const SCAN_ROOTS = ['src/data', 'src/screens', 'src/components'];

/** Patterns that must not appear in user-facing Hindi devotional copy. */
const BLOCKED = [
  { re: /\bनंगी\b/u, why: 'sounds vulgar for persons/surfaces — use शिला पर or वन-भूमि पर' },
  { re: /\bनंगा\b/u, why: 'avoid undressing vocabulary — rephrase devotionally' },
  { re: /\bनंगे?\s+पाँव\b/u, why: 'prefer बिना जूते के or जूते-रहित पाद' },
  { re: /\bतुच्छ\b/u, why: 'disrespectful for offerings — use साधारण or विनम्र' },
  { re: /\bघृणा\b/u, why: 'harsh in devotional voice — use विकर्षण or अरुचि' },
  { re: /\bअपमान\b/u, why: 'can wound readers — use अपकार, दुर्व्यवहार, or दण्ड' },
  { re: /\bसे हल्का\b/u, why: 'dismisses an observance — use की अपेक्षा संक्षिप्त/सरल' },
  { re: /\bव्रत हल्का करते\b/u, why: 'use व्रत समाप्त करते or व्रत खोलते' },
  { re: /\bमार बैठे\b/u, why: 'crude idiom — use प्रहार कर दिया or आघात किया' },
  { re: /\b(मादरचोद|बहनचोद|भोसड़ी|भोसडा|गांडू|लौड़ा|लौड़े|चूत|चुत|रंडी|वेश्या|हरामी|हरामखोर)\b/iu, why: 'profanity' },
  { re: /\bकुतिया\b/u, why: 'slur — never use' },
  { re: /\bसूअर\b/u, why: 'insulting animal metaphor — avoid in devotional copy' },
  { re: /\b(बेकार|निकम्मा|शर्मनाक)\b/u, why: 'disrespectful tone for religious copy' },
];

/** Snippet-level allowlist for legitimate uses near a match. */
const ALLOW = [
  /अंधेरे,\s*गंदे\s+या\s+सोए/u,
  /गंदे\s+घर/u,
  /गंदगी/u,
];

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const st = fs.statSync(full);
    if (st.isDirectory()) walk(full, out);
    else if (/\.(ts|tsx)$/.test(name)) out.push(full);
  }
  return out;
}

function scanText(text, rel) {
  if (!/[\u0900-\u097F]/.test(text)) return [];
  const hits = [];
  for (const { re, why } of BLOCKED) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(text)) !== null) {
      const snippet = text.slice(Math.max(0, m.index - 24), m.index + m[0].length + 24).replace(/\s+/g, ' ');
      if (ALLOW.some((a) => a.test(snippet))) continue;
      hits.push({ rel, match: m[0], why, snippet });
    }
  }
  return hits;
}

function scanFile(file) {
  const rel = path.relative(ROOT, file);
  return scanText(fs.readFileSync(file, 'utf8'), rel);
}

function collectHiStrings(obj, pathParts, out) {
  if (!obj || typeof obj !== 'object') return;
  if (Array.isArray(obj)) {
    obj.forEach((item, i) => collectHiStrings(item, [...pathParts, `[${i}]`], out));
    return;
  }
  if (typeof obj.hi === 'string') {
    out.push({ path: pathParts.join(''), hi: obj.hi });
    return;
  }
  for (const key of Object.keys(obj)) {
    if (key !== 'hi') collectHiStrings(obj[key], [...pathParts, pathParts.length ? `.${key}` : key], out);
  }
}

const files = SCAN_ROOTS.flatMap((d) => walk(path.join(ROOT, d)));
const fileProblems = files.flatMap(scanFile);

const { VRAT_VIDHI } = loadApp('src/data/vrat-vidhis.ts');
const mergedProblems = [];
for (const [key, guide] of Object.entries(VRAT_VIDHI)) {
  const strings = [];
  collectHiStrings(guide, [key], strings);
  for (const { path: guidePath, hi } of strings) {
    for (const hit of scanText(hi, `VRAT_VIDHI.${guidePath}`)) mergedProblems.push(hit);
  }
}

const problems = [...fileProblems, ...mergedProblems];

assert.deepStrictEqual(
  problems,
  [],
  `Hindi devotional language problems (${problems.length}):\n${
    problems.map((p) => `- ${p.rel}: "${p.match}" — ${p.why}\n  …${p.snippet}…`).join('\n')
  }`,
);

console.log(
  `HINDI DEVOTIONAL LANGUAGE PASSED (${files.length} source files; ${Object.keys(VRAT_VIDHI).length} merged guides checked)`,
);
