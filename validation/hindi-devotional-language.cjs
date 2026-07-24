#!/usr/bin/env node
'use strict';

const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const SCAN_ROOTS = ['src/data', 'src/screens', 'src/components'];

/** Patterns that must not appear in user-facing Hindi devotional copy. */
const BLOCKED = [
  { re: /\bनंगी\b/u, why: 'sounds vulgar for persons/surfaces — use शिला पर, कठोर शैल पर, or वन-भूमि पर' },
  { re: /\bनंगा\b/u, why: 'avoid undressing vocabulary — rephrase (e.g. बिना वस्त्र, केवल तपस्वी वेश)' },
  { re: /\bनंगे?\s+पाँव\b/u, why: 'prefer बिना जूते के or जूते-रहित पाद' },
  { re: /\bतुच्छ\b/u, why: 'disrespectful for offerings — use साधारण, विनम्र, or सामान्य' },
  { re: /\bघृणा\b/u, why: 'harsh in devotional voice — use विकर्षण, अरुचि, or दूर हो गए' },
  { re: /\b(मादरचोद|बहनचोद|भोसड़ी|भोसडा|गांडू|लौड़ा|लौड़े|चूत|चुत|रंडी|वेश्या|हरामी|हरामखोर)\b/iu, why: 'profanity' },
  { re: /\bकुतिया\b/u, why: 'slur — never use' },
  { re: /\bसूअर\b/u, why: 'insulting animal metaphor — avoid in devotional copy' },
];

/** Narrow allowlist: physical dirt, not persons. */
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

function scanFile(file) {
  const rel = path.relative(ROOT, file);
  const text = fs.readFileSync(file, 'utf8');
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

const files = SCAN_ROOTS.flatMap((d) => walk(path.join(ROOT, d)));
const problems = files.flatMap(scanFile);

assert.deepStrictEqual(
  problems,
  [],
  `Hindi devotional language problems (${problems.length}):\n${
    problems.map((p) => `- ${p.rel}: "${p.match}" — ${p.why}\n  …${p.snippet}…`).join('\n')
  }`,
);

console.log(`HINDI DEVOTIONAL LANGUAGE PASSED (${files.length} files scanned)`);
