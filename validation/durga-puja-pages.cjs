#!/usr/bin/env node
'use strict';

const assert = require('node:assert');
const { loadApp } = require('./_load-app.cjs');
const pages = loadApp('src/data/festival-pages.ts');
const content = loadApp('src/data/vrat-vidhis.ts');

const DURGA_KEYS = [
  'durgaPujaMahalaya', 'durgaPujaShashthi', 'durgaPujaSaptami',
  'durgaPujaAshtami', 'durgaPujaNavami', 'durgaPujaDashami',
];
const requiredObjectFields = ['verdict', 'meaning', 'diet', 'sankalpa', 'puja', 'paran', 'udyapan'];
const requiredListFields = ['vidhi', 'stories', 'regional'];
const routeByKey = new Map(pages.FESTIVAL_PAGE_ENTRIES.map((entry) => [entry.key, entry]));

for (const key of DURGA_KEYS) {
  const entry = routeByKey.get(key);
  assert(entry && entry.path && entry.status === 'required', `${key} must have a permanent dedicated route`);
  assert.strictEqual(entry.vidhiKey, key, `${key} must open its own substantive guide`);
  const guide = content.VRAT_VIDHI[key];
  assert(guide, `${key} substantive guide is missing`);
  for (const field of requiredObjectFields) {
    assert(guide[field]?.en && guide[field]?.hi, `${key}.${field} must be bilingual`);
  }
  for (const field of requiredListFields) {
    assert(Array.isArray(guide[field]) && guide[field].length >= 2, `${key}.${field} must contain at least two items`);
    assert(guide[field].every((item) => item.en && item.hi), `${key}.${field} must be bilingual`);
  }
  assert(!guide.safety, `${key} must not inherit a generic safety panel`);
  assert(/Bengal|बंगाल|pandal|पंडाल/i.test(guide.meaning.en + guide.meaning.hi), `${key} must stay distinct from Sharad Navratri pages`);
  console.log(`PASS  ${key} is a substantive bilingual page at ${entry.path}`);
}

const ashtami = content.VRAT_VIDHI.durgaPujaAshtami;
assert(/Sandhi/i.test(ashtami.verdict.en), 'Ashtami must mention Sandhi puja');
assert(/visarjan|विसर्जन/i.test(content.VRAT_VIDHI.durgaPujaDashami.verdict.en + content.VRAT_VIDHI.durgaPujaDashami.verdict.hi), 'Dashami must mention visarjan');
console.log('DURGA PUJA PAGE REGRESSION PASSED (6 Bengal calendar pages)');
