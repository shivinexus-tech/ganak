#!/usr/bin/env node
'use strict';

const assert = require('node:assert');
const { loadApp } = require('./_load-app.cjs');
const pages = loadApp('src/data/festival-pages.ts');
const content = loadApp('src/data/vrat-vidhis.ts');
const routeModule = loadApp('src/screens/FestivalGuideScreen.tsx');
const app = loadApp();

const SKANDA_KEYS = [
  'skandaSashtiBegins',
  'skandaSashtiSoorasamharam',
  'skandaSashtiThirukalyanam',
];
const AYYAPPA_KEYS = ['ayyappaMandalaBegins', 'ayyappaMandalaPuja'];
const SEQUENCE_KEYS = [...SKANDA_KEYS, ...AYYAPPA_KEYS];
const requiredObjectFields = ['verdict', 'meaning', 'diet', 'sankalpa', 'puja', 'paran', 'udyapan'];
const requiredListFields = ['vidhi', 'stories', 'regional'];
const routeByKey = new Map(pages.FESTIVAL_PAGE_ENTRIES.map((entry) => [entry.key, entry]));
const IST = 5.5;
const DELHI = { zone: 'Asia/Kolkata', lat: 28.6139, lon: 77.2090 };
const fmt = (ms) => new Date(ms + IST * 3600000).toISOString().slice(0, 10);

const expected2026 = {
  skandaSashtiBegins: '2026-11-10',
  skandaSashtiSoorasamharam: '2026-11-15',
  skandaSashtiThirukalyanam: '2026-11-16',
  ayyappaMandalaBegins: '2026-11-17',
  ayyappaMandalaPuja: '2026-12-27',
};
const expected2025 = {
  skandaSashtiBegins: '2025-10-22',
  skandaSashtiSoorasamharam: '2025-10-27',
  skandaSashtiThirukalyanam: '2025-10-28',
  ayyappaMandalaBegins: '2025-11-17',
  ayyappaMandalaPuja: '2025-12-27',
};
const expected2027 = {
  skandaSashtiBegins: '2027-10-30',
  skandaSashtiSoorasamharam: '2027-11-04',
  skandaSashtiThirukalyanam: '2027-11-05',
  ayyappaMandalaBegins: '2027-11-17',
  ayyappaMandalaPuja: '2027-12-27',
};

function calendarForYear(year) {
  const from = Date.UTC(year, 0, 1) - IST * 3600000;
  return app.scanPanchangCalendar(from, IST, 430, 46, DELHI);
}

for (const key of SEQUENCE_KEYS) {
  const entry = routeByKey.get(key);
  assert(entry && entry.path && entry.status === 'required', `${key} must have a permanent dedicated route`);
  assert.strictEqual(entry.vidhiKey, key, `${key} must open its own milestone guide`);
  const guide = content.VRAT_VIDHI[key];
  assert(guide, `${key} substantive guide is missing`);
  for (const field of requiredObjectFields) {
    assert(guide[field]?.en && guide[field]?.hi, `${key}.${field} must be bilingual`);
  }
  for (const field of requiredListFields) {
    assert(Array.isArray(guide[field]) && guide[field].length >= 2, `${key}.${field} must contain at least two items`);
    assert(guide[field].every((item) => item.en && item.hi), `${key}.${field} must be bilingual`);
  }
  const routeGuide = routeModule.festivalGuideFromPath(entry.path);
  assert(routeGuide && routeGuide.vidhiKey === key, `${entry.path} must resolve to ${key}`);
  console.log(`PASS  ${key} is a substantive bilingual page at ${entry.path}`);
}

const monthlySkanda = content.VRAT_VIDHI.skandaShashti;
const annualOverview = content.VRAT_VIDHI.kandaSashtiAnnual;
assert(monthlySkanda.verdict.en.includes('one-day'), 'monthly Skanda must remain a one-day guide');
assert(annualOverview.verdict.en.includes('six-day'), 'annual overview must remain separate from milestone pages');
for (const key of SEQUENCE_KEYS) {
  assert.notStrictEqual(monthlySkanda, content.VRAT_VIDHI[key], 'monthly Skanda must not alias a sequence page');
}

for (const [year, expected] of [[2025, expected2025], [2026, expected2026], [2027, expected2027]]) {
  const cal = calendarForYear(year);
  for (const key of SEQUENCE_KEYS) {
    const hit = cal.festivals.find((festival) => festival.key === key);
    assert(hit, `${key} must fire in ${year}`);
    assert.strictEqual(fmt(hit.ms), expected[key], `${key} Delhi ${year} date moved`);
    console.log(`PASS  ${key} ${year} Delhi ${expected[key]}`);
  }
}

const cal2026 = calendarForYear(2026);
const skandaDates = SKANDA_KEYS.map((key) => cal2026.festivals.find((f) => f.key === key));
assert(skandaDates[0].sequenceDay === 1, 'Skanda begins must be day 1');
assert(skandaDates[1].sequenceDay === 6, 'Soorasamharam must be day 6');
assert(skandaDates[2].sequenceDay === 7, 'Thirukalyanam must be day 7');
assert(skandaDates[0].ms < skandaDates[1].ms && skandaDates[1].ms < skandaDates[2].ms, 'Skanda sequence must be ordered 1 → 6 → 7');

const begin = cal2026.festivals.find((f) => f.key === 'ayyappaMandalaBegins');
const end = cal2026.festivals.find((f) => f.key === 'ayyappaMandalaPuja');
const spanDays = Math.round((end.ms - begin.ms) / 86400000) + 1;
assert.strictEqual(spanDays, 41, 'Ayyappa Mandala must span 41 inclusive civil days');
assert(begin.spanEnd === end.ms, 'Ayyappa begin must expose the season end');
assert(end.spanStart === begin.ms, 'Ayyappa puja must expose the season start');

const skandaGuide = routeModule.festivalGuideFromPath('/festival/skanda-sashti-begins');
const skandaLocal = routeModule.findLocalFestivalOccurrence(skandaGuide, DELHI, Date.UTC(2026, 9, 1) - IST * 3600000);
assert(skandaLocal.detail?.skanda?.days?.length === 3, 'Skanda guide must expose the six-day sequence');
assert(skandaLocal.detail.skanda.days[0].key === 'skandaSashtiBegins', 'Skanda sequence must start on day 1');

const ayyappaGuide = routeModule.festivalGuideFromPath('/festival/ayyappa-mandala-begins');
const ayyappaLocal = routeModule.findLocalFestivalOccurrence(ayyappaGuide, DELHI, Date.UTC(2026, 9, 1) - IST * 3600000);
assert(ayyappaLocal.detail?.ayyappa?.milestones?.length === 2, 'Ayyappa guide must expose both milestones');
assert.strictEqual(ayyappaLocal.detail.ayyappa.spanDays, 41, 'Ayyappa guide must show a 41-day span');

assert(/one-day|एक-दिवसीय|monthly|मासिक/i.test(content.VRAT_VIDHI.skandaSashtiBegins.verdict.en + content.VRAT_VIDHI.skandaSashtiBegins.verdict.hi), 'Skanda begins must distinguish monthly vrata');
assert(/Mandala|मंडल/i.test(content.VRAT_VIDHI.ayyappaMandalaBegins.verdict.en), 'Ayyappa begins must name Mandala season');
assert(/personal|व्यक्तिगत|mala|माला/i.test(content.VRAT_VIDHI.ayyappaMandalaPuja.verdict.en + content.VRAT_VIDHI.ayyappaMandalaPuja.verdict.hi), 'Ayyappa puja must separate public close from personal vow');

console.log('SKANDA + AYYAPPA SEQUENCE PAGE REGRESSION PASSED (5 milestone pages)');
