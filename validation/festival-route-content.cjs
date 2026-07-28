#!/usr/bin/env node
'use strict';

const assert = require('node:assert');
const { loadApp } = require('./_load-app.cjs');

const { FESTIVAL_PAGE_ROUTES } = loadApp('src/data/festival-pages.ts');
const { VRAT_VIDHI } = loadApp('src/data/vrat-vidhis.ts');
const { FESTIVAL_ROUTE_CONTENT } = loadApp('src/data/festival-route-content.ts');

const nullGuideKeys = Object.entries(FESTIVAL_PAGE_ROUTES)
  .filter(([path, entry]) => !entry.vidhiKey && !path.includes('/day-'))
  .map(([, entry]) => entry.key);
const ekadashiKeys = Object.values(FESTIVAL_PAGE_ROUTES)
  .filter((entry) => entry.vidhiKey === 'ekadashi' && entry.key !== 'ekadashi')
  .map((entry) => entry.key);
const pradoshKeys = Object.values(FESTIVAL_PAGE_ROUTES)
  .filter((entry) => entry.vidhiKey === 'pradosh' && entry.key !== 'pradosh')
  .map((entry) => entry.key);
const expectedKeys = [...nullGuideKeys, ...ekadashiKeys, ...pradoshKeys].sort();
const REQUIRED_PAIRS = ['identity', 'meaning', 'practice', 'completion', 'timingNote', 'sourceBoundary'];
const PRODUCT_META = /\bGanak\b|गणक/u;
const ENGLISH_IN_HINDI = /\b(?:the|this|festival|worship|fast|puja|complete|temple|day|guide|timing|local)\b/i;
const GENERIC = /^(?:observe|honour|worship|complete) (?:this|the) (?:festival|observance|fast|day)\b/i;

function normalized(text) {
  return String(text || '').toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
}

function validate(content) {
  const problems = [];
  const actualKeys = Object.keys(content).sort();
  if (JSON.stringify(actualKeys) !== JSON.stringify(expectedKeys)) {
    const missing = expectedKeys.filter((key) => !actualKeys.includes(key));
    const extra = actualKeys.filter((key) => !expectedKeys.includes(key));
    if (missing.length) problems.push(`missing route content: ${missing.join(', ')}`);
    if (extra.length) problems.push(`unexpected route content: ${extra.join(', ')}`);
  }

  const identities = new Map();
  for (const key of actualKeys) {
    const item = content[key];
    if (item.key !== key) problems.push(`${key}.key must equal registry key`);
    if (!['full', 'named-variant'].includes(item.kind)) problems.push(`${key}.kind is unsupported`);
    if (!VRAT_VIDHI[item.heroKey]) problems.push(`${key}.heroKey ${item.heroKey} is not an existing devotional/hero family`);

    for (const field of REQUIRED_PAIRS) {
      for (const lang of ['en', 'hi']) {
        const text = item[field]?.[lang];
        const minimum = field === 'identity' ? 3 : 12;
        if (!text || text.trim().length < minimum) problems.push(`${key}.${field}.${lang} is missing or too short`);
        if (PRODUCT_META.test(text || '')) problems.push(`${key}.${field}.${lang} contains product-meta`);
        if (lang === 'hi') {
          if (!/[\u0900-\u097F]/u.test(text || '')) problems.push(`${key}.${field}.hi lacks Devanagari`);
          if (ENGLISH_IN_HINDI.test(text || '')) problems.push(`${key}.${field}.hi leaks English prose`);
        }
      }
    }

    for (const field of ['meaning', 'practice']) {
      if (GENERIC.test(item[field]?.en || '')) problems.push(`${key}.${field}.en is generic`);
    }

    const identity = normalized(`${item.identity?.en}\n${item.identity?.hi}`);
    const prior = identities.get(identity);
    if (prior) problems.push(`${key}.identity duplicates ${prior}.identity`);
    else identities.set(identity, key);

    if (item.kind === 'named-variant') {
      const all = normalized(`${item.identity.en} ${item.meaning.en} ${item.identity.hi} ${item.meaning.hi}`);
      const enAnchor = normalized(item.identity.en).split(' ')[0];
      const hiAnchor = normalized(item.identity.hi).split(' ')[0];
      if (!all.includes(enAnchor) || !all.includes(hiAnchor)) problems.push(`${key} misses named-variant semantic anchors`);
    }
  }
  return problems;
}

assert.strictEqual(nullGuideKeys.length, 77, 'expected the audited 77 null-guide routes');
assert.strictEqual(ekadashiKeys.length, 24, 'expected 24 named Ekadashi variants');
assert.strictEqual(pradoshKeys.length, 7, 'expected 7 named Pradosh variants');
assert.strictEqual(expectedKeys.length, 108, 'expected 108 semantic route gaps');

const problems = validate(FESTIVAL_ROUTE_CONTENT);
assert.deepStrictEqual(problems, [], `Festival route content problems (${problems.length}):\n- ${problems.join('\n- ')}`);

const fixture = structuredClone(FESTIVAL_ROUTE_CONTENT);
delete fixture.pongal;
fixture.tulasiVivah.meaning.en = 'Observe this festival with devotion.';
fixture.kaliPuja.practice.en = 'Ganak shows this puja timing.';
fixture.kaliPuja.practice.hi = 'Follow the local temple timing.';
fixture.onam.identity = structuredClone(fixture.vishu.identity);
const fixtureProblems = validate(fixture);
assert(fixtureProblems.some((p) => p.includes('missing route content:') && p.includes('pongal')), 'fixture must reject missing coverage');
assert(fixtureProblems.some((p) => p.includes('tulasiVivah.meaning.en is generic')), 'fixture must reject generic meaning');
assert(fixtureProblems.some((p) => p.includes('kaliPuja.practice.en contains product-meta')), 'fixture must reject product-meta');
assert(fixtureProblems.some((p) => p.includes('kaliPuja.practice.hi lacks Devanagari') || p.includes('leaks English prose')), 'fixture must reject English Hindi');
assert(fixtureProblems.some((p) => p.includes('identity duplicates') && (p.includes('onam') || p.includes('vishu'))), 'fixture must reject duplicate identity');

console.log(`FESTIVAL ROUTE CONTENT PASSED (${nullGuideKeys.length} full routes + ${ekadashiKeys.length} Ekadashi + ${pradoshKeys.length} Pradosh; ${Object.keys(VRAT_VIDHI).length} hero families; failure fixtures proven)`);
