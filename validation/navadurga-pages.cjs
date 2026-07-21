#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { loadApp, ROOT } = require('./_load-app.cjs');

const data = loadApp('src/data/navadurga-pages.ts');
const pages = loadApp('src/data/festival-pages.ts');
const navratri = loadApp('src/engine/navratri.ts');
const festivals = loadApp('src/engine/festivals.ts');

const {
  NAVADURGA_FORMS, NAVADURGA_PAGE_ENTRIES, NAVRATRI_SEASONS, SAPTASHATI_PLAN,
} = data;
const { FESTIVAL_PAGE_ROUTES } = pages;

assert.equal(NAVADURGA_FORMS.length, 9, 'the canonical Navadurga list must contain nine forms');
assert.equal(NAVADURGA_PAGE_ENTRIES.length, 18, 'nine Chaitra + nine Sharad pages are required');
assert.equal(SAPTASHATI_PLAN.length, 9, 'the Saptashati plan must cover all nine days');
assert.deepEqual(
  SAPTASHATI_PLAN.map((item) => item.chapters),
  ['1', '2–4', '5–6', '7', '8', '9–10', '11', '12', '13'],
  'the reviewed documented nine-day chapter arrangement must remain complete',
);

const expectedNames = [
  'Maa Shailaputri', 'Maa Brahmacharini', 'Maa Chandraghanta',
  'Maa Kushmanda', 'Maa Skandamata', 'Maa Katyayani', 'Maa Kalaratri',
  'Maa Mahagauri', 'Maa Siddhidatri',
];
assert.deepEqual(NAVADURGA_FORMS.map((form) => form.name.en), expectedNames, 'Navadurga order must not drift');

for (const form of NAVADURGA_FORMS) {
  for (const field of ['name', 'identity', 'iconography', 'alt', 'focus']) {
    assert(form[field] && form[field].en && form[field].hi, `${form.slug}.${field} must be bilingual`);
  }
  assert(form.mantra.includes('देवी'), `${form.slug} must retain its public name-mantra`);
  assert(form.image.startsWith('/navadurga/') && form.image.endsWith('.webp'), `${form.slug} must use a project-owned WebP`);
  assert(fs.existsSync(path.join(ROOT, 'public', form.image)), `${form.slug} image must exist in public assets`);
  const userCopy = `${form.identity.en} ${form.identity.hi} ${form.focus.en} ${form.focus.hi}`;
  assert(!/Ganak must|as calculated|TODO|placeholder/i.test(userCopy), `${form.slug} contains internal/product copy`);
}

for (const [seasonKey, season] of Object.entries(NAVRATRI_SEASONS)) {
  const entries = NAVADURGA_PAGE_ENTRIES.filter((entry) => entry.seasonKey === seasonKey);
  assert.equal(entries.length, 9, `${seasonKey} must have nine pages`);
  assert.deepEqual(entries.map((entry) => entry.day), [1,2,3,4,5,6,7,8,9], `${seasonKey} day order must be complete`);
  for (const entry of entries) {
    assert.equal(entry.parentKey, season.parentKey, `${entry.path} must keep its season parent`);
    assert.equal(FESTIVAL_PAGE_ROUTES[entry.path] && FESTIVAL_PAGE_ROUTES[entry.path].key, entry.key, `${entry.path} must be in the shared route registry`);
    assert(entry.title.en.includes(season.name.en) && entry.title.hi.includes(season.name.hi), `${entry.path} title must be season-specific`);
  }
}

assert.equal(
  NAVADURGA_PAGE_ENTRIES.some((entry) => /gupt/i.test(entry.path) || /gupt/i.test(entry.parentKey)),
  false,
  'Gupt Navratris must not inherit the public Navadurga day-page structure',
);

const delhi = { label: 'New Delhi, India', lat: 28.61, lon: 77.21, zone: 'Asia/Kolkata' };
const cal = festivals.scanPanchangCalendar(Date.UTC(2026, 0, 1), 5.5, 400, 400, delhi);
function festivalMs(key) {
  const hit = cal.festivals.find((item) => item.key === key);
  assert(hit, `${key} 2026 anchor must exist`);
  return hit.ms;
}
function iso(civil) {
  return `${civil.y}-${String(civil.m).padStart(2, '0')}-${String(civil.day).padStart(2, '0')}`;
}
function dayDates(startMs, day) {
  return navratri.navadurgaDatesFor(delhi, startMs, day).dates.map(iso);
}

const chaitraStart = festivalMs('chaitraNavratri');
const sharadStart = festivalMs('sharadNavratri');
assert.deepEqual(
  Array.from({ length: 9 }, (_, i) => dayDates(chaitraStart, i + 1)),
  [
    ['2026-03-19'], ['2026-03-20'], ['2026-03-21'], ['2026-03-22'], ['2026-03-23'],
    ['2026-03-24'], ['2026-03-25'], ['2026-03-26'], ['2026-03-27'],
  ],
  '2026 Chaitra Navadurga dates must match the reviewed Delhi calendar',
);
assert.deepEqual(
  Array.from({ length: 9 }, (_, i) => dayDates(sharadStart, i + 1)),
  [
    ['2026-10-11'], ['2026-10-12'], ['2026-10-13'], ['2026-10-14'], ['2026-10-15'],
    ['2026-10-16'], ['2026-10-17', '2026-10-18'], ['2026-10-19'], ['2026-10-20'],
  ],
  '2026 Sharad must retain the reviewed repeated-Saptami Delhi calendar',
);

const missingRoute = NAVADURGA_PAGE_ENTRIES.find((entry) => !FESTIVAL_PAGE_ROUTES[entry.path]);
assert.equal(missingRoute, undefined, 'coverage guard: every Navadurga entry needs a route');
const simulated = NAVADURGA_PAGE_ENTRIES.concat({ path: '/festival/chaitra-navratri/day-10-guard' });
assert(
  simulated.some((entry) => !FESTIVAL_PAGE_ROUTES[entry.path]),
  'coverage guard must prove that an unregistered day page would fail',
);

console.log('PASS  9 canonical Navadurga forms have bilingual identity, iconography, puja focus and owned artwork');
console.log('PASS  18 season-specific Chaitra/Sharad routes are registered; Gupt Navratris remain excluded');
console.log('PASS  complete 1; 2–4; 5–6; 7; 8; 9–10; 11; 12; 13 Saptashati plan is present');
console.log('PASS  2026 Delhi Chaitra dates match 19–27 March');
console.log('PASS  2026 Delhi Sharad preserves repeated Saptami (Kalaratri 17–18 October)');
console.log('PASS  coverage guard rejects a missing Navadurga route');
console.log('\nNAVADURGA PAGE REGRESSION PASSED');
