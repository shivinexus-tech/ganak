#!/usr/bin/env node
'use strict';

const assert = require('node:assert');
const { loadApp } = require('./_load-app.cjs');

const { obsLabel } = loadApp('src/i18n.ts');
const { OBS_NAME } = loadApp('src/data/festival-meta.ts');
const { observancesFor } = loadApp('src/engine/festivals.ts');
const { searchUpcoming } = loadApp('src/engine/search-upcoming.ts');

const weekdays = [
  ['Sunday', 'Ravi Pradosh', 'रवि प्रदोष'],
  ['Monday', 'Som Pradosh', 'सोम प्रदोष'],
  ['Tuesday', 'Bhaum Pradosh', 'भौम प्रदोष'],
  ['Wednesday', 'Budh Pradosh', 'बुध प्रदोष'],
  ['Thursday', 'Guru Pradosh', 'गुरु प्रदोष'],
  ['Friday', 'Shukra Pradosh', 'शुक्र प्रदोष'],
  ['Saturday', 'Shani Pradosh', 'शनि प्रदोष'],
];

for (let dow = 0; dow < weekdays.length; dow += 1) {
  const [suffix, en, hi] = weekdays[dow];
  const key = `pradosh_${suffix}`;
  assert.deepStrictEqual(OBS_NAME[key], { en, hi }, `${key} metadata must remain bilingual`);
  assert.strictEqual(obsLabel('en', { key }), en, `${key} direct English label`);
  assert.strictEqual(obsLabel('hi', { key }), hi, `${key} direct Hindi label`);
  assert.strictEqual(obsLabel('en', { key, baseKey: 'pradosh', isVariant: true }), en, `${key} variant English label`);
  assert.strictEqual(obsLabel('hi', { key, baseKey: 'pradosh', isVariant: true }), hi, `${key} variant Hindi label`);

  const generated = observancesFor(false, 13, 1, dow)[0];
  assert.strictEqual(generated.key, key, `weekday ${dow} engine key`);
  assert.strictEqual(obsLabel('hi', generated), hi, `weekday ${dow} generated Hindi label`);
}

for (let dow = 0; dow < weekdays.length; dow += 1) {
  const [, en, hi] = weekdays[dow];
  assert.strictEqual(obsLabel('en', { key: `pradosh_${dow}` }), en, `legacy weekday ${dow} English`);
  assert.strictEqual(obsLabel('hi', { key: `pradosh_${dow}` }), hi, `legacy weekday ${dow} Hindi`);
}

for (const [key, names] of Object.entries(OBS_NAME)) {
  const en = obsLabel('en', { key });
  const hi = obsLabel('hi', { key });
  assert.ok(en && hi, `${key} must resolve in both languages`);
  assert.ok(!/^(?:pradosh_|[A-Za-z]+_(?:Shukla|Krishna)_11$)/.test(en), `${key} leaked as English internal key`);
  assert.ok(!/^(?:pradosh_|[A-Za-z]+_(?:Shukla|Krishna)_11$)/.test(hi), `${key} leaked as Hindi internal key`);
  assert.strictEqual(en, names.en, `${key} English label must use reviewed metadata`);
  assert.strictEqual(hi, names.hi, `${key} Hindi label must use reviewed metadata`);
}

for (const malformed of ['pradosh_7', 'pradosh_-1', 'pradosh_01', 'pradosh_1junk', 'pradosh_monday', 'pradosh_Funday', 'pradosh_Thursday_extra']) {
  assert.strictEqual(obsLabel('en', { key: malformed }), 'Pradosh Vrat', `${malformed} safe English fallback`);
  assert.strictEqual(obsLabel('hi', { key: malformed }), 'प्रदोष व्रत', `${malformed} safe Hindi fallback`);
}
assert.strictEqual(obsLabel('en', { key: 'Unknown_Shukla_11' }), 'Ekadashi');
assert.strictEqual(obsLabel('hi', { key: 'Unknown_Shukla_11' }), 'एकादशी');
assert.strictEqual(obsLabel('en', { key: 'unknownInternalKey' }), 'Observance');
assert.strictEqual(obsLabel('hi', {}), 'व्रत / पर्व');
assert.strictEqual(obsLabel('en', null), 'Observance');

const DELHI = { label: 'New Delhi', lat: 28.6139, lon: 77.209, zone: 'Asia/Kolkata' };
const FROM = Date.UTC(2026, 0, 1);
const genericPradosh = searchUpcoming('प्रदोष', FROM, 5.5, 24, DELHI);
assert.ok(genericPradosh.length > 1 && genericPradosh.every((x) => x.key.startsWith('pradosh_')), 'generic Hindi Pradosh search must return named occurrences');
const somPradosh = searchUpcoming('Som Pradosh', FROM, 5.5, 24, DELHI);
assert.ok(somPradosh.length > 0 && somPradosh.every((x) => x.key === 'pradosh_Monday'), 'Som Pradosh search must use modern Monday key');
const genericEkadashi = searchUpcoming('एकादशी', FROM, 5.5, 24, DELHI);
// Every result must be an Ekadashi identity. 2026 carries an Adhika Masa, whose
// two Ekadashis (Padmini and Parama) have no route/guide page yet, so the engine
// shows the plain `ekadashi` label rather than borrowing an ordinary month's name.
// The count below keeps that fallback from spreading: at most the Adhika pair may
// be unnamed. Naming itself is swept by validation/ekadashi-lunar-naming.cjs.
assert.ok(genericEkadashi.length > 1 && genericEkadashi.every((x) => /_11$/.test(x.key) || x.key === 'ekadashi'), 'generic Hindi Ekadashi search must return upcoming sequence');
assert.ok(genericEkadashi.filter((x) => /_11$/.test(x.key)).length >= genericEkadashi.length - 2, 'at most the Adhika Masa pair may fall back to the unnamed Ekadashi label');
const putrada = searchUpcoming('Putrada Ekadashi', FROM, 5.5, 24, DELHI);
assert.ok(new Set(putrada.map((x) => x.key)).size >= 2, 'unqualified Putrada search must include both canonical variants');

console.log(`FESTIVAL DISPLAY LABELS PASSED (${Object.keys(OBS_NAME).length} observances; 7 modern + 7 legacy Pradosh keys; safe mutations; EN/HI search paths)`);
