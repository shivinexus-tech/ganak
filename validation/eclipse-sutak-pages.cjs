#!/usr/bin/env node
'use strict';

const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { loadApp, ROOT } = require('./_load-app.cjs');

const content = loadApp('src/data/vrat-vidhis.ts');
const pages = loadApp('src/data/festival-pages.ts');
const routeModule = loadApp('src/screens/FestivalGuideScreen.tsx');
const { eclipseDetail } = loadApp('src/engine/eclipse.ts');
const app = loadApp();

const GRAHAN_KEYS = ['suryaGrahan', 'chandraGrahan'];
const IST = 5.5;
const DELHI = { zone: 'Asia/Kolkata', lat: 28.6139, lon: 77.2090, label: 'Delhi' };
const CAPE_TOWN = { zone: 'Africa/Johannesburg', lat: -33.9249, lon: 18.4241, label: 'Cape Town' };
const LONDON = { zone: 'Europe/London', lat: 51.5072, lon: -0.1276, label: 'London' };
const fmt = (ms) => new Date(ms + IST * 3600000).toISOString().slice(0, 10);
const minutes = (ms) => Math.round(ms / 60000);
const withinMinutes = (actual, expected, tolerance, label) => {
  const diff = Math.abs(minutes(actual - expected));
  assert(diff <= tolerance, `${label}: got ${new Date(actual + IST * 3600000).toISOString()} diff ${diff}m > ${tolerance}m`);
};

const routeByKey = new Map(pages.FESTIVAL_PAGE_ENTRIES.map((entry) => [entry.key, entry]));
const requiredObjectFields = ['verdict', 'meaning', 'diet', 'sankalpa', 'puja', 'paran', 'udyapan'];
const requiredListFields = ['vidhi', 'stories', 'regional'];

for (const key of GRAHAN_KEYS) {
  const entry = routeByKey.get(key);
  assert(entry && entry.path, `${key} must have a festival route`);
  assert.strictEqual(entry.vidhiKey, key, `${key} must open its grahan guide`);
  const guide = content.VRAT_VIDHI[key];
  assert(guide, `${key} substantive guide is missing`);
  for (const field of requiredObjectFields) {
    assert(guide[field]?.en && guide[field]?.hi, `${key}.${field} must be bilingual`);
  }
  for (const field of requiredListFields) {
    assert(Array.isArray(guide[field]) && guide[field].length >= 1, `${key}.${field} must be populated`);
    assert(guide[field].every((item) => item.en && item.hi), `${key}.${field} must be bilingual`);
  }
  const routeGuide = routeModule.festivalGuideFromPath(entry.path);
  assert(routeGuide && routeGuide.vidhiKey === key, `${entry.path} must resolve to ${key}`);
  const svg = path.join(ROOT, `public/festival-images/${key}.svg`);
  assert(fs.existsSync(svg), `missing hero ${key}.svg`);
  const body = fs.readFileSync(svg, 'utf8');
  assert(body.includes('data-subject'), `${key}.svg must declare data-subject`);
  console.log(`PASS  ${key} page, guide and hero at ${entry.path}`);
}

assert(routeModule.findLocalFestivalOccurrence, 'FestivalGuideScreen must export findLocalFestivalOccurrence');

const fromMs = Date.UTC(2026, 0, 1) - IST * 3600000;
const cal = app.scanPanchangCalendar(fromMs, IST, 400, 400, DELHI);
const grahan = cal.festivals.filter((f) => GRAHAN_KEYS.includes(f.key));
assert(grahan.length >= 4, `expected at least 4 grahan in 2026 window, got ${grahan.length}`);
console.log(`PASS  ${grahan.length} grahan events in 2026 scan window`);

const febSolar = grahan.find((g) => g.key === 'suryaGrahan' && fmt(g.ms).startsWith('2026-02'));
assert(febSolar && febSolar.eclipseMs, 'Feb 2026 solar grahan must carry eclipseMs');
const solarDetail = eclipseDetail(DELHI, febSolar.eclipseMs, 'suryaGrahan');
assert.strictEqual(solarDetail.visible, false, 'Feb 2026 solar grahan is not visible in Delhi');
assert.strictEqual(solarDetail.sutakHours, 12);
assert.strictEqual(solarDetail.sutakStart, null, 'non-visible solar grahan should not show Sutak start');
assert.strictEqual(solarDetail.moksha, null, 'non-visible solar grahan should not show Moksha');
console.log('PASS  Feb 2026 solar not visible in Delhi; no Sutak shown');

const capeSolar = eclipseDetail(CAPE_TOWN, febSolar.eclipseMs, 'suryaGrahan');
assert(capeSolar.visible, 'Feb 2026 solar grahan should be visible in Cape Town');
assert(capeSolar.contacts && capeSolar.contacts.start < capeSolar.contacts.end, 'visible solar grahan must have contacts');
assert(capeSolar.visibility && capeSolar.visibility.start < capeSolar.visibility.end, 'visible solar grahan must have local visibility window');
assert.strictEqual(capeSolar.sutakStart, capeSolar.visibility.start - 12 * 3600000);
assert.strictEqual(capeSolar.moksha, capeSolar.contacts.end);
console.log('PASS  Feb 2026 solar visible in Cape Town with contact-based Sutak/Moksha');

const marLunar = grahan.find((g) => g.key === 'chandraGrahan' && fmt(g.ms).startsWith('2026-03'));
assert(marLunar && marLunar.eclipseMs, 'Mar 2026 lunar grahan must carry eclipseMs');
const lunarDetail = eclipseDetail(DELHI, marLunar.eclipseMs, 'chandraGrahan');
assert.strictEqual(lunarDetail.visible, true, 'Mar 2026 lunar grahan should be visible after moonrise in Delhi');
assert.strictEqual(lunarDetail.sutakHours, 9);
assert(lunarDetail.contacts && lunarDetail.visibility, 'visible lunar grahan must include contacts and visibility');
withinMinutes(lunarDetail.contacts.start, Date.UTC(2026, 2, 3, 9, 51), 12, 'Mar lunar first umbral contact');
withinMinutes(lunarDetail.contacts.end, Date.UTC(2026, 2, 3, 13, 16), 12, 'Mar lunar Moksha');
withinMinutes(lunarDetail.visibility.start, Date.UTC(2026, 2, 3, 12, 52), 12, 'Mar lunar Delhi moonrise visibility start');
assert.strictEqual(lunarDetail.sutakStart, lunarDetail.visibility.start - 9 * 3600000);
assert.strictEqual(lunarDetail.moksha, lunarDetail.visibility.end);
console.log('PASS  Mar 2026 lunar visible at Delhi after moonrise; visible-window Sutak/Moksha');

// Grast-asta (Moon sets mid-eclipse): Moksha must clamp to local moonset, not the
// global umbral contact end. Aug 28 2026 lunar sets before totality ends over London.
const augLunar = grahan.find((g) => g.key === 'chandraGrahan' && fmt(g.ms).startsWith('2026-08'));
assert(augLunar && augLunar.eclipseMs, 'Aug 2026 lunar grahan must carry eclipseMs');
const londonLunar = eclipseDetail(LONDON, augLunar.eclipseMs, 'chandraGrahan');
assert.strictEqual(londonLunar.visible, true, 'Aug 2026 lunar should be visible in London');
assert(londonLunar.contacts && londonLunar.visibility, 'visible lunar grahan must include contacts and visibility');
assert(londonLunar.visibility.end < londonLunar.contacts.end, 'London Moon sets before umbral contact end (grast-asta)');
assert.strictEqual(londonLunar.moksha, londonLunar.visibility.end, 'Moksha must clamp to local moonset, not the global contact end');
assert(londonLunar.moksha < londonLunar.contacts.end, 'clamped Moksha is earlier than the global contact end');
console.log('PASS  Aug 2026 lunar grast-asta at London; Moksha clamped to moonset');

const occ = routeModule.findLocalFestivalOccurrence(
  routeByKey.get('suryaGrahan'),
  DELHI,
  febSolar.ms,
);
assert(occ.hit && occ.detail && occ.detail.grahan, 'findLocalFestivalOccurrence must return grahan detail');
assert(typeof occ.detail.grahan.visible === 'boolean', 'grahan detail must include visibility');
console.log('PASS  FestivalGuideScreen grahan wiring');

console.log('\nECLIPSE SUTAK PAGES PASSED');
