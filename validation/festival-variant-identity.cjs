#!/usr/bin/env node
'use strict';

const assert = require('assert');
const { loadApp } = require('./_load-app.cjs');

const engine = loadApp('src/engine/festivals.ts');
const meta = loadApp('src/data/festival-meta.ts');
const pages = loadApp('src/data/festival-pages.ts');
const screen = loadApp('src/screens/FestivalGuideScreen.tsx');

// Independent fixture: deliberately not imported from either app table.
const EKADASHI_FIXTURE = Object.freeze({
  Chaitra_Shukla_11: 'Kamada Ekadashi',
  Vaisakha_Shukla_11: 'Mohini Ekadashi',
  Jyeshtha_Shukla_11: 'Nirjala Ekadashi',
  Ashadha_Shukla_11: 'Devshayani Ekadashi',
  Shravan_Shukla_11: 'Shravana Putrada Ekadashi',
  Bhadrapad_Shukla_11: 'Parivartini Ekadashi',
  Ashwin_Shukla_11: 'Papankusha Ekadashi',
  Kartik_Shukla_11: 'Devutthana Ekadashi',
  Margshirsh_Shukla_11: 'Mokshada Ekadashi',
  Paush_Shukla_11: 'Pausha Putrada Ekadashi',
  Magh_Shukla_11: 'Jaya Ekadashi',
  Phalgun_Shukla_11: 'Amalaki Ekadashi',
  Chaitra_Krishna_11: 'Papmochani Ekadashi',
  Vaisakha_Krishna_11: 'Varuthini Ekadashi',
  Jyeshtha_Krishna_11: 'Apara Ekadashi',
  Ashadha_Krishna_11: 'Yogini Ekadashi',
  Shravan_Krishna_11: 'Kamika Ekadashi',
  Bhadrapad_Krishna_11: 'Aja Ekadashi',
  Ashwin_Krishna_11: 'Indira Ekadashi',
  Kartik_Krishna_11: 'Rama Ekadashi',
  Margshirsh_Krishna_11: 'Utpanna Ekadashi',
  Paush_Krishna_11: 'Safala Ekadashi',
  Magh_Krishna_11: 'Shattila Ekadashi',
  Phalgun_Krishna_11: 'Vijaya Ekadashi',
});

assert.strictEqual(Object.keys(EKADASHI_FIXTURE).length, 24);
for (const [key, expected] of Object.entries(EKADASHI_FIXTURE)) {
  assert.strictEqual(engine.EKADASHI_NAMES[key]?.en, expected, `engine identity ${key}`);
  assert.strictEqual(meta.OBS_NAME[key]?.en, expected, `route metadata identity ${key}`);
  const occurrence = engine.observancesFor(key.includes('_Krishna_'), 11, key.split('_')[0], 0)[0];
  assert.strictEqual(occurrence.key, key, `calculation must emit ${key}`);
  const entry = pages.FESTIVAL_PAGE_ENTRIES.find((item) => item.key === key);
  assert(entry && pages.FESTIVAL_PAGE_ROUTES[entry.path] === entry, `${key} must round-trip to a route`);
  assert.strictEqual(entry.title.en, expected, `${key} route title`);
}
assert(!Object.values(engine.EKADASHI_NAMES).some((name) => /Nrisimha|Narasimha|Jayanti/.test(name.en)));
assert(!pages.FESTIVAL_PAGE_ROUTES['/festival/nrisimha-jayanti'], 'bogus Nrisimha Ekadashi route must be gone');
console.log('PASS  independent fixture anchors all 24 Ekadashi month/paksha identities');

const PRADOSH_KEYS = Object.freeze([
  'pradosh_Sunday', 'pradosh_Monday', 'pradosh_Tuesday',
  'pradosh_Wednesday', 'pradosh_Thursday', 'pradosh_Friday',
  'pradosh_Saturday',
]);
for (let dow = 0; dow < 7; dow += 1) {
  const occurrence = engine.observancesFor(false, 13, 'Chaitra', dow)[0];
  assert.strictEqual(occurrence.key, PRADOSH_KEYS[dow], `weekday ${dow} emitted key`);
  const entry = pages.FESTIVAL_PAGE_ENTRIES.find((item) => item.key === occurrence.key);
  assert(entry && pages.FESTIVAL_PAGE_ROUTES[entry.path] === entry, `${occurrence.key} must round-trip`);
}
console.log('PASS  all seven computed weekday Pradosh keys round-trip to direct routes');

// Exercise the production scanner, not only the small rule helper.
const DELHI_TZ = 5.5;
// Two full civil years avoid mistaking an edge-of-window lunar occurrence for
// a missing variant while still exercising the real calendar scanner.
const scan = engine.scanPanchangCalendar(Date.UTC(2025, 0, 1), DELHI_TZ, 800, 800);
const scannedVariantKeys = new Set(scan.fasts.map((item) => item.key));
for (const key of Object.keys(EKADASHI_FIXTURE)) {
  assert(scannedVariantKeys.has(key), `2026-27 live scan must produce ${key}`);
}
for (const key of PRADOSH_KEYS) {
  assert(scannedVariantKeys.has(key), `2026-27 live scan must produce ${key}`);
}
console.log('PASS  800-day live scan produces every named Ekadashi and weekday Pradosh route key');

const today = loadApp('src/engine/today-panchang.ts');
for (const fixture of [
  { label: 'Delhi', tz: 5.5, date: [2026, 8, 9], place: { label: 'Delhi', lat: 28.6139, lon: 77.2090, zone: 'Asia/Kolkata' } },
  { label: 'Los Angeles', tz: -7, date: [2026, 8, 8], place: { label: 'Los Angeles', lat: 34.0522, lon: -118.2437, zone: 'America/Los_Angeles' } },
]) {
  const [y, m, d] = fixture.date;
  const atMs = Date.UTC(y, m - 1, d, 12) - fixture.tz * 3600000;
  const panchang = today.computeTodayPanchang(fixture.place, 'lahiri', atMs);
  assert.strictEqual(panchang.tithiDay, 11, `${fixture.label} anchor must be Ekadashi`);
  assert.strictEqual(panchang.krishna, true, `${fixture.label} anchor must be Krishna Paksha`);
  assert.strictEqual(panchang.months.amanta, 'Ashadha', `${fixture.label} Amanta fixture`);
  assert.strictEqual(panchang.months.purnimanta, 'Shravana', `${fixture.label} Purnimanta fixture`);
  const identityMonth = engine.ekadashiIdentityMonth(panchang.months, panchang.krishna);
  const occurrence = engine.observancesFor(panchang.krishna, panchang.tithiDay, identityMonth, panchang.dow, panchang.anchor)[0];
  assert.strictEqual(occurrence.key, 'Shravan_Krishna_11', `${fixture.label} selected-day identity must be Kamika`);
  const scanFrom = Date.UTC(y, m - 1, d, 0) - fixture.tz * 3600000;
  const scanned = engine.scanPanchangCalendar(scanFrom, fixture.tz, 2, 2, fixture.place).fasts;
  assert(scanned.some((item) => item.key === 'Shravan_Krishna_11'), `${fixture.label} scanner must agree on Kamika`);
}
console.log('PASS  Delhi and Los Angeles selected-day surfaces agree with scanner on Kamika Ekadashi');

for (const fixture of [
  { date: [2026, 5, 27], paksha: 'Shukla' },
  { date: [2026, 6, 11], paksha: 'Krishna' },
]) {
  const [y, m, d] = fixture.date;
  const atMs = Date.UTC(y, m - 1, d, 6, 30);
  const panchang = today.computeTodayPanchang({ label: 'Delhi', lat: 28.6139, lon: 77.2090, zone: 'Asia/Kolkata' }, 'lahiri', atMs);
  assert(/\(Adhik\)/.test(panchang.months.amanta), `${fixture.paksha} fixture must remain Adhik`);
  /* Inverted 2026-08-19. This used to assert `null` — the Adhika Masa Ekadashis were
     deliberately left generic rather than borrowing a neighbouring month's name. They
     are now sourced and named (Padmini in Shukla, Parama in Krishna), pinned to 8
     published dates across 2026, 2029, 2031 and 2034, so the assertion is flipped to
     hold the identity rather than deleted. See plans/research/ekadashi-lunar-month-naming.md. */
  const identityMonth = engine.ekadashiIdentityMonth(panchang.months, panchang.krishna);
  assert.ok(identityMonth, `${fixture.paksha} Adhik Ekadashi must now carry its sourced identity (Padmini/Parama)`);
  const occurrence = engine.observancesFor(panchang.krishna, 11, identityMonth, panchang.dow, panchang.anchor)[0];
  /* The intent of this assertion is unchanged — an Adhika Masa Ekadashi must never
     borrow a neighbouring ordinary month's name. What satisfies it has changed: it
     used to be the generic `ekadashi` key, and is now the leap-month's own key. Both
     halves are asserted so the check is stricter than it was, not merely re-pointed. */
  assert.match(occurrence.key, /^Adhik_(Shukla|Krishna)_11$/, `${fixture.paksha} Adhik must carry its own leap-month key, got ${occurrence.key}`);
  assert.ok(!/^(Chaitra|Vaishakha|Jyeshtha|Ashadha|Shravana|Bhadrapada|Ashwina|Kartika|Margashirsha|Pausha|Magha|Phalguna)_/.test(occurrence.key),
    `${fixture.paksha} Adhik must not inherit an ordinary-month name, got ${occurrence.key}`);
}
console.log('PASS  Adhik Shukla/Krishna Ekadashis carry their own sourced leap-month identity (Padmini/Parama) and never an ordinary month name');

for (const [oldPath, canonicalPath] of Object.entries(pages.FESTIVAL_LEGACY_PATH_REDIRECTS)) {
  assert(!pages.FESTIVAL_PAGE_ROUTES[oldPath], `${oldPath} must not remain a second live identity`);
  assert(pages.FESTIVAL_PAGE_ROUTES[canonicalPath], `${oldPath} redirect target must resolve`);
  assert.strictEqual(
    screen.festivalGuideFromPath(oldPath),
    screen.festivalGuideFromPath(canonicalPath),
    `${oldPath} must resolve the canonical route object`,
  );
}
assert.strictEqual(
  pages.FESTIVAL_LEGACY_PATH_REDIRECTS['/festival/nrisimha-jayanti'],
  '/festival/narasimha-jayanti',
);
console.log('PASS  incorrect historical slugs resolve canonical content without duplicate route ownership');

console.log('\nFESTIVAL VARIANT IDENTITY PASSED');
