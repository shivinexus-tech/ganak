#!/usr/bin/env node
'use strict';

const assert = require('node:assert');
const { loadApp } = require('./_load-app.cjs');
const { VRAT_VIDHI } = loadApp('src/data/vrat-vidhis.ts');

const EXPECTED_KEYS = [
  'ahoiAshtami', 'akshaya', 'amavasya', 'ayyappaMandala', 'bhaiDooj',
  'buddhaPurnima', 'chaitraNavratri', 'chhath', 'dhanteras', 'diwali',
  'durgaPujaAshtami', 'durgaPujaDashami', 'durgaPujaMahalaya',
  'durgaPujaNavami', 'durgaPujaSaptami', 'durgaPujaShashthi', 'dussehra',
  'ekadashi', 'ganeshChaturthi', 'govardhanPuja', 'gudiPadwa',
  'guptNavratriAshadha', 'guptNavratriMagha', 'guruPurnima', 'hanumanJ',
  'hartalikaTeej', 'holika', 'janmashtami', 'kandaSashtiAnnual',
  'kartikaPurnima', 'karvaChauth', 'mahaShivaratri', 'makarSankranti',
  'masikDurgashtami', 'masikShivaratri', 'narakChaturdashi', 'pradosh',
  'purnima', 'rakshaBandhan', 'ramNavami', 'rangwaliHoli', 'rathYatra',
  'sankashti', 'sharadNavratri', 'sheetlaAshtami', 'skandaShashti',
  'ugadi', 'varalakshmi', 'vatPurnima', 'vatSavitri',
].sort();

const SAFETY_KEYS = new Set([
  'ahoiAshtami', 'ayyappaMandala', 'chaitraNavratri', 'chhath', 'diwali',
  'durgaPujaDashami', 'dussehra', 'hartalikaTeej', 'holika', 'janmashtami',
  'karvaChauth', 'mahaShivaratri', 'makarSankranti', 'rangwaliHoli', 'sharadNavratri', 'ganeshChaturthi',
  'sheetlaAshtami',
]);

const BANNED = [
  /not interchangeable/i,
  /do not invent/i,
  /not a substitute for (?:temple )?authority/i,
  /ask the committee/i,
  /rather than assuming/i,
  /safely accessible/i,
  /this note does not/i,
  /one documented/i,
  /not a public photo opportunity/i,
  /do not (?:copy|improvise|assume)/i,
  /न गढ़ें/,
];

const REQUIRED_OBJECTS = ['verdict', 'meaning', 'diet', 'sankalpa', 'puja', 'paran', 'udyapan'];
const REQUIRED_LISTS = { vidhi: 2, stories: 2, regional: 2 };
const MIN_KATHA_WORDS = 140;
const MIN_KATHA_PARAS = 3;
const problems = [];

function parseKathaBody(text) {
  const sep = ' — ';
  const i = String(text || '').indexOf(sep);
  return i < 0 ? String(text || '') : text.slice(i + sep.length).trim();
}

const keys = Object.keys(VRAT_VIDHI).sort();
if (JSON.stringify(keys) !== JSON.stringify(EXPECTED_KEYS)) {
  problems.push(`guide inventory changed: expected ${EXPECTED_KEYS.length}, got ${keys.length}`);
}

const pairText = (value) => `${value?.en || ''}\n${value?.hi || ''}`;
const fingerprints = new Map();

for (const key of keys) {
  const guide = VRAT_VIDHI[key];
  for (const field of REQUIRED_OBJECTS) {
    if (!guide[field]?.en || !guide[field]?.hi) problems.push(`${key}.${field} must be complete in English and Hindi`);
  }
  for (const [field, minimum] of Object.entries(REQUIRED_LISTS)) {
    if (!Array.isArray(guide[field]) || guide[field].length < minimum) {
      problems.push(`${key}.${field} must contain at least ${minimum} bilingual items`);
      continue;
    }
    if (guide[field].some((item) => !item?.en || !item?.hi)) problems.push(`${key}.${field} has a non-bilingual item`);
  }

  if (Array.isArray(guide.stories)) {
    guide.stories.forEach((story, idx) => {
      for (const lang of ['en', 'hi']) {
        const body = parseKathaBody(story[lang]);
        const paras = body.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
        const words = body.split(/\s+/).filter(Boolean).length;
        if (words < MIN_KATHA_WORDS) {
          problems.push(`${key}.stories[${idx}].${lang} is too short (${words} words; need ${MIN_KATHA_WORDS}+)`);
        }
        if (paras.length < MIN_KATHA_PARAS) {
          problems.push(`${key}.stories[${idx}].${lang} needs ${MIN_KATHA_PARAS}+ paragraphs`);
        }
      }
    });
  }

  const publicText = JSON.stringify(guide);
  for (const pattern of BANNED) {
    if (pattern.test(publicText)) problems.push(`${key} contains defensive/research wording: ${pattern}`);
  }

  if (guide.safety && !SAFETY_KEYS.has(key)) problems.push(`${key} has a generic safety note without an approved guide-specific risk`);
  if (guide.safety && (!guide.safety.en || !guide.safety.hi)) problems.push(`${key}.safety must be bilingual`);

  for (const field of ['verdict', 'meaning', 'diet']) {
    if (!guide[field]) continue;
    const fingerprint = pairText(guide[field]).toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
    const prior = fingerprints.get(`${field}:${fingerprint}`);
    if (prior) problems.push(`${key}.${field} duplicates ${prior}.${field}`);
    else fingerprints.set(`${field}:${fingerprint}`, key);
  }
}

assert.deepStrictEqual(problems, [], `Devotional guide quality problems (${problems.length}):\n- ${problems.join('\n- ')}`);
console.log(`DEVOTIONAL GUIDE QUALITY PASSED (${keys.length} distinct bilingual worship guides; optional risk-specific safety only)`);
