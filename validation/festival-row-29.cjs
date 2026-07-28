#!/usr/bin/env node
'use strict';

/* P0 row #29 closure gate: every devotional guide key has profile, hero image,
   and required timing kinds are implemented in engine + guide screen. */

const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { loadApp } = require('./_load-app.cjs');
const { validateRaster, assertDecodable, duplicateProblems, runMutationFixtures } = require('./_festival-raster-validator.cjs');

const root = path.resolve(__dirname, '..');
const { VRAT_VIDHI } = loadApp('src/data/vrat-vidhis.ts');
const { FEST_META, OBS_META } = loadApp('src/data/festival-meta.ts');
const { FESTIVAL_PAGE_ROUTES } = loadApp('src/data/festival-pages.ts');

const EXPECTED_KEYS = Object.keys(VRAT_VIDHI).sort();
const PROFILE_DIR = path.join(root, 'plans/festival-profiles');
const IMAGE_DIR = path.join(root, 'public/festival-images/raster');
const { FESTIVAL_HERO_ART } = loadApp('src/data/festival-hero-art.ts');

const slugFromKey = (key) => String(key)
  .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
  .replace(/_/g, '-')
  .replace(/[^A-Za-z0-9-]+/g, '-')
  .replace(/-{2,}/g, '-')
  .replace(/^-|-$/g, '')
  .toLowerCase();

const REQUIRED_PROFILE_SECTIONS = [
  '## Must-show on page',
  '## Timing kind',
  '## Sources',
];

const TIMING_ENGINE_FILES = {
  'lakshmi-puja': 'src/engine/lakshmi-puja.ts',
  'chhath-sequence': 'src/engine/chhath.ts',
  navratri: 'src/engine/navratri.ts',
};

const SUPPORTED_VRAT_DETAIL = new Set([
  'parana', 'moonrise', 'stars', 'sunset', 'sunrise', 'morning', 'midnight',
  'madhyahna', 'aparahna', 'lakshmi-puja', 'grahan',
]);

const problems = [];
const rasterRecords = [];
const decodeChecks = [];

function metaTiming(key) {
  if (FEST_META[key]?.timing) return FEST_META[key].timing;
  if (OBS_META[key]?.timing) return OBS_META[key].timing;
  if (key === 'makarSankranti') return 'sankranti';
  return null;
}

for (const key of EXPECTED_KEYS) {
  const slug = slugFromKey(key);
  const profilePath = path.join(PROFILE_DIR, `${slug}.md`);
  if (!fs.existsSync(profilePath)) {
    problems.push(`missing profile: plans/festival-profiles/${slug}.md`);
  } else {
    const profile = fs.readFileSync(profilePath, 'utf8');
    for (const section of REQUIRED_PROFILE_SECTIONS) {
      if (!profile.includes(section)) problems.push(`${slug}.md missing ${section}`);
    }
  }

  const art = FESTIVAL_HERO_ART[key];
  if (!art) problems.push(`missing hero registry entry: ${key}`);
  else if (!art.alt?.en?.trim() || !art.alt?.hi?.trim()) problems.push(`hero registry alt must be bilingual: ${key}`);
  const heroPath = path.join(IMAGE_DIR, `${key}.webp`);
  if (!fs.existsSync(heroPath)) {
    problems.push(`missing hero: public/festival-images/raster/${key}.webp`);
  } else {
    try {
      const buffer = fs.readFileSync(heroPath);
      const checked = validateRaster(buffer);
      for (const issue of checked.problems) problems.push(`invalid hero ${key}: ${issue}`);
      rasterRecords.push({ key, sha256: checked.info.sha256 });
      decodeChecks.push(assertDecodable(buffer).catch((error) => {
        problems.push(`invalid hero ${key}: ${error.message}`);
      }));
    } catch (error) {
      problems.push(`invalid hero ${key}: ${error.message}`);
    }
  }

  const timing = metaTiming(key);
  if (timing === 'chhath-sequence' && key !== 'chhath') continue;
  if (!timing || timing === 'none') continue;

  if (TIMING_ENGINE_FILES[timing]) {
    const engineFile = path.join(root, TIMING_ENGINE_FILES[timing]);
    if (!fs.existsSync(engineFile)) problems.push(`timing ${timing} for ${key} needs ${TIMING_ENGINE_FILES[timing]}`);
  } else if (timing === 'sankranti') {
    const festivals = fs.readFileSync(path.join(root, 'src/engine/festivals.ts'), 'utf8');
    if (!festivals.includes('sankrantiPunyaKala')) problems.push('sankranti punya kala helper missing');
  } else if (!SUPPORTED_VRAT_DETAIL.has(timing)) {
    problems.push(`unsupported timing kind "${timing}" on ${key}`);
  }
}

const routeEntries = Object.entries(FESTIVAL_PAGE_ROUTES);
if (routeEntries.length < 181) problems.push(`festival route inventory shrank: expected at least 181, got ${routeEntries.length}`);
for (const [routePath, entry] of routeEntries) {
  if (entry.form?.image) {
    const ownedImage = path.join(root, 'public', entry.form.image.replace(/^\/+/, ''));
    if (!fs.existsSync(ownedImage)) problems.push(`${routePath}: missing owned route hero ${entry.form.image}`);
    continue;
  }
  if (!entry.vidhiKey) {
    problems.push(`${routePath}: no hero disposition (needs vidhiKey parent hero or owned form image)`);
    continue;
  }
  if (!VRAT_VIDHI[entry.vidhiKey]) problems.push(`${routePath}: parent hero key ${entry.vidhiKey} has no worship guide`);
  if (!FESTIVAL_HERO_ART[entry.vidhiKey]) problems.push(`${routePath}: parent hero key ${entry.vidhiKey} has no art registry entry`);
}

async function finish() {
  await Promise.all(decodeChecks);
  problems.push(...duplicateProblems(rasterRecords, new Set()));
  try { await runMutationFixtures(); } catch (error) { problems.push(`raster validator mutation fixtures: ${error.message}`); }

  const guideScreen = fs.readFileSync(path.join(root, 'src/screens/FestivalGuideScreen.tsx'), 'utf8');
  const heroComponent = fs.readFileSync(path.join(root, 'src/components/FestivalRasterHero.tsx'), 'utf8');
  if (!guideScreen.includes('FestivalRasterHero')) problems.push('FestivalGuideScreen must render FestivalRasterHero');
  if (!guideScreen.includes('chhathTimings')) problems.push('FestivalGuideScreen must wire chhathTimings');
  if (!guideScreen.includes('d.nishita')) problems.push('FestivalGuideScreen must render nishita timing');
  if (!heroComponent.includes('/festival-images/raster/${imageKey}.webp')) problems.push('FestivalRasterHero must use key-specific raster WebP paths');
  if (!heroComponent.includes('onError={() => setFailed(true)}')) problems.push('FestivalRasterHero must handle load failure');

  const muhuratHub = fs.readFileSync(path.join(root, 'src/screens/MuhuratHub.tsx'), 'utf8');
  if (!muhuratHub.includes('chhathTimings')) problems.push('MuhuratHub must wire chhathTimings for expand rows');

  if (problems.length) {
    console.error('festival-row-29.cjs FAIL');
    for (const problem of problems) console.error(' -', problem);
    process.exit(1);
  }
  console.log(`festival-row-29.cjs PASS — ${EXPECTED_KEYS.length} guide keys, ${routeEntries.length} routes, profiles, heroes, timing wiring`);
}

finish().catch((error) => {
  console.error(`festival-row-29.cjs crashed: ${error.stack || error.message}`);
  process.exit(1);
});
