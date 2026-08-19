#!/usr/bin/env node
'use strict';

const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { loadApp, ROOT } = require('./_load-app.cjs');
const { validateRaster } = require('./_festival-raster-validator.cjs');

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
const assetProblems = [];
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
  const raster = path.join(ROOT, `public/festival-images/raster/${key}.webp`);
  if (!fs.existsSync(raster)) {
    assetProblems.push(`missing hero public/festival-images/raster/${key}.webp`);
  } else {
    try {
      const checked = validateRaster(fs.readFileSync(raster));
      for (const problem of checked.problems) assetProblems.push(`${key}: ${problem}`);
    } catch (error) {
      assetProblems.push(`${key}: invalid or undecodable WebP — ${error.message}`);
    }
  }
  console.log(`PASS  ${key} page and guide at ${entry.path}`);
}

assert(routeModule.findLocalFestivalOccurrence, 'FestivalGuideScreen must export findLocalFestivalOccurrence');

const fromMs = Date.UTC(2026, 0, 1) - IST * 3600000;
const cal = app.scanPanchangCalendar(fromMs, IST, 400, 400, DELHI);
const grahan = cal.festivals.filter((f) => GRAHAN_KEYS.includes(f.key));
assert(grahan.length >= 4, `expected at least 4 grahan in 2026 window, got ${grahan.length}`);
console.log(`PASS  ${grahan.length} grahan events in 2026 scan window`);

const febSolar = grahan.find((g) => g.key === 'suryaGrahan' && fmt(g.ms).startsWith('2026-02'));
assert(febSolar && febSolar.eclipseMs, 'Feb 2026 solar grahan must carry eclipseMs');

// ---------------------------------------------------------------------------
// PUBLISHED-REFERENCE ANCHORS — Drik Panchang per-city eclipse pages, read
// 2026-08-18, each fetch verified to be the eclipse asked for. Sourced in
// plans/research/eclipse-panchaka-reference-check.md.
//
// THESE REPLACED SELF-REFERENTIAL ASSERTIONS, AND THAT IS THE POINT. The gate
// used to assert `sutakStart === visibility.start - 9h` — it re-stated the
// engine's own arithmetic instead of a published time, so it went green while
// Sutak was up to 39 minutes wrong against Drik. Every timing assertion below
// compares against a value Drik publishes. Do not replace one with a
// recomputation of Ganak's own output.
//
// Tolerances: +/-3 min for everything the engine decides on its own; +/-6 min
// where the value is a lunar rise/set clamp, which inherits the declared +/-6
// min lunar tolerance from the shared ephemeris (backlog C3, C3-MOONSET-DRIK).
// The looser figure is the DECLARED engine tolerance, not a weakened assertion.
// ---------------------------------------------------------------------------
const CITY = {
  Delhi: DELHI,
  Chennai: { zone: 'Asia/Kolkata', lat: 13.0827, lon: 80.2707 },
  Kolkata: { zone: 'Asia/Kolkata', lat: 22.5726, lon: 88.3639 },
  London: LONDON,
  NewYork: { zone: 'America/New_York', lat: 40.7128, lon: -74.0060 },
  Sydney: { zone: 'Australia/Sydney', lat: -33.8688, lon: 151.2093 },
  Tokyo: { zone: 'Asia/Tokyo', lat: 35.6895, lon: 139.6917 },
  Madrid: { zone: 'Europe/Madrid', lat: 40.4168, lon: -3.7038 },
  Johannesburg: { zone: 'Africa/Johannesburg', lat: -26.2041, lon: 28.0473 },
  Reykjavik: { zone: 'Atlantic/Reykjavik', lat: 64.1466, lon: -21.9426 },
  BuenosAires: { zone: 'America/Argentina/Buenos_Aires', lat: -34.6037, lon: -58.3816 },
};
// Geocentric syzygy of each eclipse (UTC ms) — the engine's entry point.
const SYZYGY = {
  L20250314: [Date.UTC(2025, 2, 14, 6, 54, 29, 880), 'chandraGrahan'],
  S20250329: [Date.UTC(2025, 2, 29, 10, 57, 58, 99), 'suryaGrahan'],
  L20250907: [Date.UTC(2025, 8, 7, 18, 8, 49, 175), 'chandraGrahan'],
  S20250921: [Date.UTC(2025, 8, 21, 19, 54, 4, 356), 'suryaGrahan'],
  S20260217: [Date.UTC(2026, 1, 17, 12, 1, 21, 579), 'suryaGrahan'],
  L20260303: [Date.UTC(2026, 2, 3, 11, 38, 6, 922), 'chandraGrahan'],
  S20260812: [Date.UTC(2026, 7, 12, 17, 36, 45, 996), 'suryaGrahan'],
  L20260828: [Date.UTC(2026, 7, 28, 4, 18, 54, 855), 'chandraGrahan'],
  S20270206: [Date.UTC(2027, 1, 6, 15, 56, 25, 884), 'suryaGrahan'],
  L20270220: [Date.UTC(2027, 1, 20, 23, 23, 49, 398), 'chandraGrahan'],
};
// [eclipse, city, localStart, sutakBegins, kidsSutakBegins, moksha, maximum] as
// Drik prints them, in that city's local clock. `null` = Drik prints no value.
const DRIK = [
  ['L20250907', 'Delhi',        '09-07 21:58', '09-07 12:19', '09-07 18:36', '09-08 01:26', '09-07 23:42'],
  ['L20250907', 'London',       '09-07 19:36', '09-07 09:40', '09-07 16:15', '09-07 20:56', '09-07 19:12'],
  ['L20260303', 'Delhi',        '03-03 18:26', '03-03 09:39', '03-03 15:28', '03-03 18:46', '03-03 17:04'],
  ['L20260303', 'Chennai',      '03-03 18:21', '03-03 09:22', '03-03 15:19', '03-03 18:46', '03-03 17:04'],
  ['L20260303', 'Kolkata',      '03-03 17:43', '03-03 08:52', '03-03 14:45', '03-03 18:46', '03-03 17:04'],
  ['L20260303', 'Tokyo',        '03-03 18:51', '03-03 09:01', '03-03 14:46', '03-03 22:16', '03-03 20:34'],
  ['L20260303', 'Sydney',       '03-03 20:51', '03-03 09:56', '03-03 16:18', '03-04 00:16', '03-03 22:34'],
  ['L20260303', 'NewYork',      '03-03 04:51', '03-02 17:49', '03-03 00:08', '03-03 06:24', '03-03 06:34'],
  ['L20260828', 'London',       '08-28 03:34', '08-27 16:30', '08-27 22:30', '08-28 06:10', '08-28 05:13'],
  ['L20260828', 'NewYork',      '08-27 22:34', '08-27 12:57', '08-27 19:36', '08-28 01:51', '08-28 00:13'],
  ['L20250314', 'NewYork',      '03-14 01:11', '03-13 16:03', '03-13 22:03', '03-14 04:47', '03-14 02:59'],
  ['S20250329', 'London',       '03-29 10:07', '03-28 21:16', '03-29 05:42', '03-29 12:00', '03-29 11:03'],
  ['S20250921', 'Sydney',       '09-22 05:45', '09-21 17:51', '09-22 02:46', '09-22 05:50', null],
  ['S20260217', 'Johannesburg', '02-17 14:26', '02-17 00:22', '02-17 09:08', '02-17 15:53', '02-17 15:11'],
  ['S20260812', 'Madrid',       '08-12 19:36', '08-12 04:51', '08-12 14:20', '08-12 21:16', '08-12 20:32'],
  ['S20260812', 'Reykjavik',    '08-12 16:47', '08-12 01:33', '08-12 09:20', '08-12 18:47', '08-12 17:48'],
  ['S20270206', 'BuenosAires',  '02-06 10:45', '02-05 22:32', '02-06 06:19', '02-06 14:15', '02-06 12:31'],
  ['S20270206', 'Johannesburg', '02-06 18:36', '02-06 03:04', '02-06 12:22', '02-06 18:57', null],
];
// Drik prints "Sutak Begins - Not Applicable" for these: the eclipse is not
// visible from the city (and 20 Feb 2027 is penumbral-only, which Drik states
// carries no ritual significance at all).
const DRIK_NOT_APPLICABLE = [
  ['S20260812', 'Delhi'], ['L20260828', 'Delhi'], ['L20270220', 'Delhi'],
  ['S20260217', 'Delhi'], ['L20250907', 'NewYork'],
];

const localClock = (ms, tz) => new Date(ms + tz * 3600000).toISOString().replace('T', ' ').slice(5, 16);
const clockToMinutes = (s) => {
  const [d, t] = s.split(' ');
  const [mo, da] = d.split('-').map(Number);
  const [h, mi] = t.split(':').map(Number);
  return ((mo * 31 + da) * 24 + h) * 60 + mi;
};
const matchesDrik = (actual, tz, published, tolerance, label) => {
  assert(actual != null, `${label}: Ganak produced no value; Drik publishes ${published}`);
  const drift = clockToMinutes(localClock(actual, tz)) - clockToMinutes(published);
  assert(Math.abs(drift) <= tolerance,
    `${label}: Ganak ${localClock(actual, tz)} vs Drik ${published} — off by ${drift}m (tolerance ${tolerance}m)`);
};

let anchorChecks = 0;
for (const [eclipse, cityName, dStart, dSutak, dKids, dMoksha, dMax] of DRIK) {
  const [ms, key] = SYZYGY[eclipse];
  const detail = eclipseDetail(CITY[cityName], ms, key);
  const label = `${eclipse}@${cityName}`;
  const tz = detail.tz;
  assert(detail.visible, `${label}: Drik publishes local timings, so it must be visible`);
  assert(detail.contacts && detail.visibility, `${label}: must carry contacts and local visibility`);
  // A lunar rise/set clamp inherits the declared +/-6 min lunar tolerance.
  const lunar = key === 'chandraGrahan';
  const startClamped = detail.visibility.start > detail.contacts.start;
  const endClamped = detail.visibility.end < detail.contacts.end;
  matchesDrik(detail.visibility.start, tz, dStart, lunar && startClamped ? 6 : 3, `${label} local start`);
  matchesDrik(detail.moksha, tz, dMoksha, lunar && endClamped ? 6 : 3, `${label} Moksha`);
  matchesDrik(detail.sutakStart, tz, dSutak, 3, `${label} Sutak begins`);
  matchesDrik(detail.sutakKidsStart, tz, dKids, 3, `${label} Sutak (kids/old/sick) begins`);
  assert.strictEqual(detail.sutakEnd, detail.moksha, `${label}: Sutak must end at Moksha`);
  assert.strictEqual(detail.sutakKidsEnd, detail.moksha, `${label}: kids Sutak must end at Moksha`);
  assert.strictEqual(detail.sutakBasis, 'prahar', `${label}: Sutak must be computed on prahar boundaries`);
  assert.strictEqual(detail.sutakPrahar, lunar ? 3 : 4, `${label}: prahar count`);
  assert.strictEqual(detail.sutakKidsPrahar, 1, `${label}: kids Sutak is one prahar`);
  assert.strictEqual(detail.sutakHours, lunar ? 9 : 12, `${label}: nominal hours still reported`);
  if (dMax) matchesDrik(detail.contacts.maximum, tz, dMax, 3, `${label} maximum eclipse`);
  anchorChecks += 1;
}
console.log(`PASS  ${anchorChecks} Drik city-anchors: local start, Sutak, kids Sutak, Moksha, maximum`);

// DECLARED CONVENTION, PINNED: no Sutak at all where the eclipse is not visible
// locally. Drik: "Sutak is observed only when Eclipse is visible at the place
// under discussion." Other traditions differ; Ganak follows Drik and says so.
for (const [eclipse, cityName] of DRIK_NOT_APPLICABLE) {
  const [ms, key] = SYZYGY[eclipse];
  const detail = eclipseDetail(CITY[cityName], ms, key);
  const label = `${eclipse}@${cityName}`;
  assert.strictEqual(detail.visible, false, `${label}: Drik says not visible here`);
  assert.strictEqual(detail.sutakStart, null, `${label}: Drik prints "Sutak Begins - Not Applicable"`);
  assert.strictEqual(detail.sutakKidsStart, null, `${label}: kids Sutak also Not Applicable`);
  assert.strictEqual(detail.moksha, null, `${label}: no local Moksha`);
}
console.log(`PASS  ${DRIK_NOT_APPLICABLE.length} not-visible anchors show no Sutak (declared Drik convention)`);

// The convention must reach the reader, in both languages, in the engine's own
// note — a rule the app follows silently is a rule the app cannot be trusted on.
for (const key of GRAHAN_KEYS) {
  const sample = eclipseDetail(DELHI, SYZYGY[key === 'suryaGrahan' ? 'S20260217' : 'L20250907'][0], key);
  for (const lang of ['en', 'hi']) {
    const note = sample.conventionNote[lang];
    assert(note && note.length > 40, `${key}.conventionNote.${lang} must state the convention`);
  }
  assert(/prahar/i.test(sample.conventionNote.en), `${key}: English note must name the prahar rule`);
  assert(/प्रहर/.test(sample.conventionNote.hi), `${key}: Hindi note must name the prahar rule`);
  assert(/children|elderly|unwell/i.test(sample.conventionNote.en), `${key}: English note must cover kids/old/sick`);
  assert(/not visible/i.test(sample.conventionNote.en), `${key}: English note must state the visibility rule`);
}
console.log('PASS  grahan convention note states the prahar rule, the kids window and the visibility rule, in EN and HI');

// Lunar umbral CONTACTS against Drik. This is the assertion the previous fixed
// 0.73 deg umbral radius fails by up to 12 minutes.
const UMBRAL_CONTACTS = [
  ['L20250907', 'Delhi', '09-07 21:58', '09-08 01:26'],
  ['L20260303', 'Sydney', '03-03 20:51', '03-04 00:16'],
  ['L20260828', 'NewYork', '08-27 22:34', '08-28 01:51'],
  ['L20250314', 'NewYork', '03-14 01:11', '03-14 04:47'],
];
for (const [eclipse, cityName, first, last] of UMBRAL_CONTACTS) {
  const [ms, key] = SYZYGY[eclipse];
  const detail = eclipseDetail(CITY[cityName], ms, key);
  matchesDrik(detail.contacts.start, detail.tz, first, 3, `${eclipse}@${cityName} first umbral contact`);
  matchesDrik(detail.contacts.end, detail.tz, last, 3, `${eclipse}@${cityName} last umbral contact`);
}
console.log(`PASS  ${UMBRAL_CONTACTS.length} lunar umbral contact pairs within 3 min of Drik`);

// Grast-asta / grast-udaya structure, kept from the original gate.
const marLunar = grahan.find((g) => g.key === 'chandraGrahan' && fmt(g.ms).startsWith('2026-03'));
assert(marLunar && marLunar.eclipseMs, 'Mar 2026 lunar grahan must carry eclipseMs');
const delhiMar = eclipseDetail(DELHI, marLunar.eclipseMs, 'chandraGrahan');
assert(delhiMar.visibility.start > delhiMar.contacts.start,
  'Delhi 3 Mar 2026 is grast-udaya: the Moon rises already eclipsed');
assert.strictEqual(delhiMar.sutakEnd, delhiMar.visibility.end);
console.log('PASS  Mar 2026 grast-udaya at Delhi: Sutak anchored on the local visible start');

const augLunar = grahan.find((g) => g.key === 'chandraGrahan' && fmt(g.ms).startsWith('2026-08'));
assert(augLunar && augLunar.eclipseMs, 'Aug 2026 lunar grahan must carry eclipseMs');
const londonLunar = eclipseDetail(LONDON, augLunar.eclipseMs, 'chandraGrahan');
assert.strictEqual(londonLunar.visible, true, 'Aug 2026 lunar should be visible in London');
assert(londonLunar.visibility.end < londonLunar.contacts.end, 'London Moon sets before umbral contact end (grast-asta)');
assert.strictEqual(londonLunar.moksha, londonLunar.visibility.end, 'Moksha must clamp to local moonset, not the global contact end');
assert.strictEqual(londonLunar.sutakEnd, londonLunar.visibility.end, 'Sutak must end at the clamped Moksha');
console.log('PASS  Aug 2026 lunar grast-asta at London; Moksha and Sutak clamped to moonset');

const capeSolar = eclipseDetail(CAPE_TOWN, febSolar.eclipseMs, 'suryaGrahan');
assert(capeSolar.visible, 'Feb 2026 solar grahan should be visible in Cape Town');
assert(capeSolar.contacts && capeSolar.contacts.start < capeSolar.contacts.end, 'visible solar grahan must have contacts');
assert(capeSolar.contacts.maximum > capeSolar.contacts.start && capeSolar.contacts.maximum < capeSolar.contacts.end,
  'maximum eclipse must fall inside the contact window');
console.log('PASS  Feb 2026 solar visible in Cape Town with a bracketed local maximum');

const occ = routeModule.findLocalFestivalOccurrence(
  routeByKey.get('suryaGrahan'),
  DELHI,
  febSolar.ms,
);
assert(occ.hit && occ.detail && occ.detail.grahan, 'findLocalFestivalOccurrence must return grahan detail');
assert(typeof occ.detail.grahan.visible === 'boolean', 'grahan detail must include visibility');
console.log('PASS  FestivalGuideScreen grahan wiring');

if (assetProblems.length) {
  console.error(`\nECLIPSE SUTAK PAGES FAILED (${assetProblems.length} raster problems)`);
  for (const problem of assetProblems) console.error(' -', problem);
  process.exit(1);
}
console.log('\nECLIPSE SUTAK PAGES PASSED');
