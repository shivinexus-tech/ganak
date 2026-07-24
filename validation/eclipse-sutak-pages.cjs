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
const fmt = (ms) => new Date(ms + IST * 3600000).toISOString().slice(0, 10);

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
assert(solarDetail.visible, 'Feb 2026 solar grahan visible in Delhi');
assert.strictEqual(solarDetail.sutakHours, 12);
console.log('PASS  Feb 2026 solar visible Delhi, 12h Sutak');

const marLunar = grahan.find((g) => g.key === 'chandraGrahan' && fmt(g.ms).startsWith('2026-03'));
assert(marLunar && marLunar.eclipseMs, 'Mar 2026 lunar grahan must carry eclipseMs');
const lunarDetail = eclipseDetail(DELHI, marLunar.eclipseMs, 'chandraGrahan');
assert.strictEqual(lunarDetail.visible, false, 'Mar 2026 lunar max is before moonrise in Delhi');
assert.strictEqual(lunarDetail.sutakHours, 9);
console.log('PASS  Mar 2026 lunar not visible at max in Delhi (moonrise after peak), 9h Sutak rule');

const occ = routeModule.findLocalFestivalOccurrence(
  routeByKey.get('suryaGrahan'),
  DELHI,
  febSolar.ms,
);
assert(occ.hit && occ.detail && occ.detail.grahan, 'findLocalFestivalOccurrence must return grahan detail');
assert(typeof occ.detail.grahan.visible === 'boolean', 'grahan detail must include visibility');
console.log('PASS  FestivalGuideScreen grahan wiring');

console.log('\nECLIPSE SUTAK PAGES PASSED');
