#!/usr/bin/env node
'use strict';

const assert = require('node:assert');
const { loadApp } = require('./_load-app.cjs');
const pages = loadApp('src/data/festival-pages.ts');
const content = loadApp('src/data/vrat-vidhis.ts');
const app = loadApp();

const DURGA_KEYS = [
  'durgaPujaMahalaya', 'durgaPujaShashthi', 'durgaPujaSaptami',
  'durgaPujaAshtami', 'durgaPujaNavami', 'durgaPujaDashami',
];
const requiredObjectFields = ['verdict', 'meaning', 'diet', 'sankalpa', 'puja', 'paran', 'udyapan'];
const requiredListFields = ['vidhi', 'stories', 'regional'];
const routeByKey = new Map(pages.FESTIVAL_PAGE_ENTRIES.map((entry) => [entry.key, entry]));
const IST = 5.5;
const DELHI = { zone: 'Asia/Kolkata', lat: 28.6139, lon: 77.2090 };
const from = Date.UTC(2026, 8, 20, 12) - IST * 3600000;
const calendar = app.scanPanchangCalendar(from, IST, 45, 46, DELHI);
const fmt = (ms) => new Date(ms + IST * 3600000).toISOString().slice(0, 10);
const expectedDates = {
  durgaPujaMahalaya: '2026-10-10', durgaPujaShashthi: '2026-10-16',
  durgaPujaSaptami: '2026-10-17', durgaPujaAshtami: '2026-10-19',
  durgaPujaNavami: '2026-10-20', durgaPujaDashami: '2026-10-20',
};

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
  assert(!/(?:do not|not a universal|police routes|restricted immersion|committee-led|photo opportunity)/i.test(JSON.stringify(guide)), `${key} must read as devotional guidance, not defensive event management`);
  assert(/Bengal|बंगाल|pandal|पंडाल/i.test(guide.meaning.en + guide.meaning.hi), `${key} must stay distinct from Sharad Navratri pages`);
  const hit = calendar.festivals.find((festival) => festival.key === key);
  assert(hit, `${key} must be produced by the local festival engine`);
  assert.strictEqual(fmt(hit.ms), expectedDates[key], `${key} Delhi 2026 date moved`);
  console.log(`PASS  ${key} is a substantive bilingual page at ${entry.path}`);
}

const ashtami = content.VRAT_VIDHI.durgaPujaAshtami;
assert(/Sandhi/i.test(ashtami.verdict.en), 'Ashtami must mention Sandhi puja');
assert(/visarjan|विसर्जन/i.test(content.VRAT_VIDHI.durgaPujaDashami.verdict.en + content.VRAT_VIDHI.durgaPujaDashami.verdict.hi), 'Dashami must mention visarjan');
console.log('DURGA PUJA PAGE REGRESSION PASSED (6 Bengal calendar pages)');
