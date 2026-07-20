#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const { loadApp } = require('./_load-app.cjs');

const { pageHeroCopy } = loadApp('src/kundli-app.tsx');

assert.equal(typeof pageHeroCopy, 'function', 'shell must export its route-aware hero-copy function');

const cases = [
  {
    label: 'full-guide festival English',
    copy: pageHeroCopy('en', 'daily', { key: 'skandaShashti', vidhiKey: 'skandaShashti' }),
    includes: ['FASTING & WORSHIP', 'Festival date', 'local timing'],
    excludes: ['JYOTISH', 'birth chart'],
  },
  {
    label: 'full-guide festival Hindi',
    copy: pageHeroCopy('hi', 'daily', { key: 'skandaShashti', vidhiKey: 'skandaShashti' }),
    includes: ['व्रत एवं पूजा', 'पर्व-तिथि', 'स्थानीय समय'],
    excludes: ['ज्योतिष', 'जन्म कुंडली'],
  },
  {
    label: 'overview-only festival',
    copy: pageHeroCopy('en', 'daily', { key: 'makarSankranti', vidhiKey: null }),
    includes: ['FESTIVAL & OBSERVANCE', 'Festival date', 'verified calendar overview'],
    excludes: ['JYOTISH', 'birth chart', 'FASTING & WORSHIP'],
  },
  {
    label: 'Daily Panchang',
    copy: pageHeroCopy('en', 'daily', null),
    includes: ['PANCHANG', 'Tithi', 'fasts and festivals'],
    excludes: ['JYOTISH', 'birth chart'],
  },
  {
    label: 'Prashna',
    copy: pageHeroCopy('en', 'prashna', null),
    includes: ['PRASHNA', 'Question moment', 'selected place'],
    excludes: ['JYOTISH', 'birth chart'],
  },
  {
    label: 'Jyotish chart',
    copy: pageHeroCopy('en', 'chart', null),
    includes: ['JYOTISH', 'Vedic birth chart', 'Lahiri ayanamsa'],
    excludes: ['FASTING & WORSHIP', 'PANCHANG', 'PRASHNA'],
  },
];

for (const testCase of cases) {
  const rendered = `${testCase.copy.eyebrow} ${testCase.copy.detail}`;
  for (const expected of testCase.includes) {
    assert(rendered.includes(expected), `${testCase.label} header must include “${expected}”`);
  }
  for (const forbidden of testCase.excludes) {
    assert(!rendered.includes(forbidden), `${testCase.label} header must not include “${forbidden}”`);
  }
  console.log(`PASS  ${testCase.label} receives its own page identity`);
}

console.log('\nPAGE-CONTEXT HEADER REGRESSION PASSED');
