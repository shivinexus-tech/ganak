#!/usr/bin/env node
'use strict';

const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { loadApp } = require('./_load-app.cjs');

const GLOSSARY_PATH = path.join(__dirname, '../plans/hindi-worship-glossary.md');

const LABEL_CANONICAL = {
  sankalpa: 'संकल्प',
  puja: 'पूजा',
  paran: 'पारण',
  udyapan: 'उद्यापन',
  vidhi: 'विधि',
  stories: 'पढ़ने या सुनने योग्य क्षेत्रीय कथाएँ',
};

const CORE_TERMS = [
  'संकल्प',
  'नैवेद्य',
  'पारण',
  'निर्जला',
  'प्रसाद',
  'उद्यापन',
  'कुल-परम्परा',
];

const BANNED_VARIANTS = [
  { re: /\bपारणा\b/u, why: 'use पारण (glossary)' },
  { re: /\bसंकल्पना\b/u, why: 'use संकल्प for vow/intention in guides' },
];

const problems = [];

assert(fs.existsSync(GLOSSARY_PATH), 'plans/hindi-worship-glossary.md must exist');

const glossary = fs.readFileSync(GLOSSARY_PATH, 'utf8');
for (const term of CORE_TERMS) {
  if (!glossary.includes(term)) problems.push(`glossary missing core term: ${term}`);
}

const { VRAT_VIDHI_LABELS, VRAT_VIDHI } = loadApp('src/data/vrat-vidhis.ts');

for (const [key, expected] of Object.entries(LABEL_CANONICAL)) {
  const actual = VRAT_VIDHI_LABELS[key]?.hi;
  if (actual !== expected) {
    problems.push(`VRAT_VIDHI_LABELS.${key}.hi is "${actual}" — expected glossary "${expected}"`);
  }
}

const mergedHi = JSON.stringify(VRAT_VIDHI);
for (const term of CORE_TERMS) {
  if (!mergedHi.includes(term)) problems.push(`merged VRAT_VIDHI missing core term: ${term}`);
}

for (const { re, why } of BANNED_VARIANTS) {
  if (re.test(mergedHi)) problems.push(`merged VRAT_VIDHI: ${why}`);
}

assert.deepStrictEqual(problems, [], `Hindi worship glossary problems (${problems.length}):\n- ${problems.join('\n- ')}`);
console.log(`HINDI WORSHIP GLOSSARY PASSED (${CORE_TERMS.length} core terms; ${Object.keys(LABEL_CANONICAL).length} UI labels)`);
