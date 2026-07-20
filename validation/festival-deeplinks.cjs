#!/usr/bin/env node
'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { loadApp, ROOT } = require('./_load-app.cjs');

const routeModule = loadApp('src/screens/FestivalGuideScreen.tsx');
const vidhiModule = loadApp('src/data/vrat-vidhis.ts');
const metaModule = loadApp('src/data/festival-meta.ts');
const expected = {
  '/festival/hartalika-teej': 'hartalikaTeej',
  '/festival/chaitra-navratri': 'chaitraNavratri',
  '/festival/sharad-navratri': 'sharadNavratri',
  '/festival/chhath': 'chhath',
};

for (const [urlPath, vidhiKey] of Object.entries(expected)) {
  const guide = routeModule.festivalGuideFromPath(urlPath);
  assert(guide, `${urlPath} must resolve to a guide`);
  assert.strictEqual(guide.vidhiKey, vidhiKey, `${urlPath} must use ${vidhiKey}`);
  assert(vidhiModule.VRAT_VIDHI[vidhiKey], `${vidhiKey} must exist in VRAT_VIDHI`);
  assert.strictEqual(routeModule.festivalGuideFromPath(`${urlPath}/`), guide, `${urlPath}/ must accept a trailing slash`);
  console.log(`PASS  ${urlPath} -> ${vidhiKey}`);
}

const samples = {
  '/festival/karva-chauth': { key: 'karvaChauth', vidhiKey: 'karvaChauth' },
  '/festival/makar-sankranti': { key: 'makarSankranti', vidhiKey: null },
  '/festival/mokshada-ekadashi': { key: 'Margshirsh_Shukla_11', vidhiKey: 'ekadashi' },
  '/festival/ravi-pradosh': { key: 'pradosh_Sunday', vidhiKey: 'pradosh' },
};
for (const [urlPath, want] of Object.entries(samples)) {
  const guide = routeModule.festivalGuideFromPath(urlPath);
  assert(guide, `${urlPath} must resolve to a guide/meta page`);
  assert.strictEqual(guide.key, want.key, `${urlPath} must resolve ${want.key}`);
  assert.strictEqual(guide.vidhiKey, want.vidhiKey, `${urlPath} vidhi mapping must be stable`);
  const sourceMeta = guide.sourceKind === 'festival'
    ? metaModule.FEST_META[guide.metaKey]
    : metaModule.OBS_META[guide.metaKey];
  assert(sourceMeta, `${urlPath} must have source metadata`);
  assert.strictEqual(routeModule.festivalGuideFromPath(`${urlPath}/`), guide, `${urlPath}/ must accept a trailing slash`);
  console.log(`PASS  ${urlPath} -> ${want.key}${want.vidhiKey ? ` (${want.vidhiKey} vidhi)` : ' (meta)'}`);
}

assert.strictEqual(routeModule.festivalGuideFromPath('/festival/not-a-guide'), null, 'unknown festival paths must not resolve');
assert.strictEqual(routeModule.festivalGuideFromPath('/festival/durga-puja-mahalaya'), null, 'deferred multi-day routes must not be invented');
assert.strictEqual(routeModule.festivalGuideFromPath('/'), null, 'the home page must not resolve as a festival guide');

const shell = fs.readFileSync(path.join(ROOT, 'src/kundli-app.tsx'), 'utf8');
const card = fs.readFileSync(path.join(ROOT, 'src/components/VratVidhiCard.tsx'), 'utf8');
assert(shell.includes('directFestivalGuide'), 'the shell must render direct festival guides');
assert(card.includes('initiallyOpen = false'), 'normal VratVidhiCard behaviour must remain closed by default');
assert(card.includes('useState(initiallyOpen)'), 'direct routes must be able to open the full guide immediately');

console.log('PASS  normal festival cards remain closed by default');
console.log('PASS  unknown paths leave the existing app route unchanged');
console.log('\nFESTIVAL DEEPLINK REGRESSION PASSED');
