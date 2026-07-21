#!/usr/bin/env node
'use strict';

const assert = require('node:assert');
const { loadApp } = require('./_load-app.cjs');
const pages = loadApp('src/data/festival-pages.ts');
const content = loadApp('src/data/vrat-vidhis.ts');

const requiredObjectFields = ['verdict', 'meaning', 'diet', 'sankalpa', 'puja', 'paran', 'udyapan', 'safety'];
const requiredListFields = ['vidhi', 'stories', 'regional'];
const routeByKey = new Map(pages.FESTIVAL_PAGE_ENTRIES.map((entry) => [entry.key, entry]));

assert(pages.REVIEWED_MAJOR_FESTIVAL_KEYS.length > 0, 'reviewed-major registry must not be empty');
for (const key of pages.REVIEWED_MAJOR_FESTIVAL_KEYS) {
  const entry = routeByKey.get(key);
  assert(entry && entry.path && entry.status !== 'deferred', `${key} must have a permanent page`);
  assert.strictEqual(entry.vidhiKey, key, `${key} must open its own substantive guide`);
  const guide = content.VRAT_VIDHI[key];
  assert(guide, `${key} substantive guide is missing`);
  for (const field of requiredObjectFields) {
    assert(guide[field]?.en && guide[field]?.hi, `${key}.${field} must be bilingual`);
  }
  for (const field of requiredListFields) {
    assert(Array.isArray(guide[field]) && guide[field].length >= 3, `${key}.${field} must contain at least three items`);
    assert(guide[field].every((item) => item.en && item.hi), `${key}.${field} must be bilingual`);
  }
  console.log(`PASS  ${key} is a substantive bilingual page at ${entry.path}`);
}

const diwali = content.VRAT_VIDHI.diwali;
assert(!/must fast|fast is compulsory|उपवास अनिवार्य है/i.test(diwali.verdict.en + diwali.verdict.hi), 'Diwali must not impose a universal fast');
assert(/does not require/i.test(diwali.verdict.en) && /आवश्यक नहीं/.test(diwali.verdict.hi), 'Diwali must explicitly say that a compulsory fast is not required');
assert(diwali.regional.some((item) => /Kali Puja/.test(item.en)), 'Diwali must distinguish Kali Puja');
assert(diwali.regional.some((item) => /Tamil Deepavali/.test(item.en)), 'Diwali must distinguish Tamil Deepavali');
console.log(`MAJOR FESTIVAL PAGE REGRESSION PASSED (${pages.REVIEWED_MAJOR_FESTIVAL_KEYS.length} reviewed pages)`);
