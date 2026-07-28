#!/usr/bin/env node
'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { loadApp, ROOT } = require('./_load-app.cjs');

const meta = loadApp('src/data/festival-meta.ts');
const pages = loadApp('src/data/festival-pages.ts');
const screen = loadApp('src/screens/FestivalGuideScreen.tsx');

// Independent route contract fixture. Do not derive this from application data.
const CONTRACTS = Object.freeze({
  ramNavami: 'madhyahna',
  hanumanJ: 'sunrise',
  sitaNavami: 'sunrise',
  narasimhaJayanti: 'sunrise',
  guruPurnima: 'sunrise',
  hartalikaTeej: 'sunrise',
  anantChaturdashi: 'aparahna',
  mahaAshtami: 'sunrise',
  mahaNavami: 'aparahna',
  dussehra: 'aparahna',
  sharadPurnima: 'midnight',
  bhaiDooj: 'aparahna',
  tulasiVivah: 'aparahna',
  gitaJayanti: 'sunrise',
  pitruPakshaBegins: 'aparahna-shraddha',
  sarvaPitruAmavasya: 'aparahna-shraddha',
});

assert.strictEqual(Object.keys(CONTRACTS).length, 16);
for (const [key, timing] of Object.entries(CONTRACTS)) {
  assert.strictEqual(meta.FEST_META[key]?.timing, timing, `${key} timing contract`);
  assert.strictEqual(meta.FEST_META[key]?.timingStatus, 'implemented', `${key} status`);
  const entry = pages.FESTIVAL_PAGE_ENTRIES.find((item) => item.key === key);
  const resolved = entry?.path && screen.festivalGuideFromPath(entry.path);
  assert(resolved && resolved.key === key && resolved.path === entry.path, `${key} route`);
}
console.log('PASS  16 deciding-kala routes have explicit implemented timing contracts');

const syntheticDay = { info: { rise: 1000, set: 6000 } };
assert.deepStrictEqual(screen.dayKalaWindow(syntheticDay, 'madhyahna'), { start: 3000, end: 4000 });
assert.deepStrictEqual(screen.dayKalaWindow(syntheticDay, 'aparahna'), { start: 4000, end: 5000 });
assert.deepStrictEqual(screen.dayKalaWindow(syntheticDay, 'aparahna-shraddha'), { start: 4000, end: 5000 });
assert.strictEqual(screen.dayKalaWindow(syntheticDay, 'sunrise'), null);
assert.strictEqual(screen.dayKalaWindow({ info: { rise: null, set: 6000 } }, 'aparahna'), null);
console.log('PASS  Madhyahna and Aparahna use stable fifths of the local sunrise-to-sunset day');

for (const table of [meta.FEST_META, meta.OBS_META]) {
  for (const [key, item] of Object.entries(table)) {
    assert(
      item.timingStatus === 'implemented' || item.timingStatus === 'date-only-pending-review',
      `${key} must classify timing completeness`,
    );
    if (item.timing == null) {
      assert.strictEqual(item.timingStatus, 'date-only-pending-review', `${key} null timing`);
    }
  }
}
console.log('PASS  remaining null timing values are explicitly pending review, not silently complete');

const source = fs.readFileSync(path.join(ROOT, 'src/screens/FestivalGuideScreen.tsx'), 'utf8');
for (const token of [
  'Madhyahna period:', 'मध्याह्न काल:',
  'Aparahna period:', 'अपराह्न काल:',
  'Shraddha Aparahna period:', 'श्राद्ध अपराह्न काल:',
]) {
  assert(source.includes(token), `screen must render bilingual timing label: ${token}`);
}
assert(source.includes('dayKala || d.parana'), 'day-kala window must participate in visible timing output');
console.log('PASS  guide screen renders bilingual Madhyahna, Aparahna and Shraddha-Aparahna answers');

console.log('\nFESTIVAL ROUTE TIMING CONTRACTS PASSED');
