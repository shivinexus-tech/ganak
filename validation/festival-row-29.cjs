#!/usr/bin/env node
'use strict';

/* P0 row #29 closure gate: every devotional guide key has profile, hero image,
   and required timing kinds are implemented in engine + guide screen. */

const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { loadApp } = require('./_load-app.cjs');

const root = path.resolve(__dirname, '..');
const { VRAT_VIDHI } = loadApp('src/data/vrat-vidhis.ts');
const { FEST_META, OBS_META } = loadApp('src/data/festival-meta.ts');

const EXPECTED_KEYS = Object.keys(VRAT_VIDHI).sort();
const PROFILE_DIR = path.join(root, 'plans/festival-profiles');
const IMAGE_DIR = path.join(root, 'public/festival-images');

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
  'parana', 'moonrise', 'stars', 'sunset', 'sunrise', 'morning', 'midnight', 'lakshmi-puja',
]);

const problems = [];

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
    continue;
  }
  const profile = fs.readFileSync(profilePath, 'utf8');
  for (const section of REQUIRED_PROFILE_SECTIONS) {
    if (!profile.includes(section)) problems.push(`${slug}.md missing ${section}`);
  }

  const heroPath = path.join(IMAGE_DIR, `${key}.svg`);
  if (!fs.existsSync(heroPath)) problems.push(`missing hero: public/festival-images/${key}.svg`);

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

const guideScreen = fs.readFileSync(path.join(root, 'src/screens/FestivalGuideScreen.tsx'), 'utf8');
const heroComponent = fs.readFileSync(path.join(root, 'src/components/FestivalHeroImage.tsx'), 'utf8');
if (!guideScreen.includes('FestivalHeroImage')) problems.push('FestivalGuideScreen must render FestivalHeroImage');
if (!guideScreen.includes('chhathTimings')) problems.push('FestivalGuideScreen must wire chhathTimings');
if (!guideScreen.includes('d.nishita')) problems.push('FestivalGuideScreen must render nishita timing');
if (!heroComponent.includes('/festival-images/')) problems.push('FestivalHeroImage must use /festival-images/');

const muhuratHub = fs.readFileSync(path.join(root, 'src/screens/MuhuratHub.tsx'), 'utf8');
if (!muhuratHub.includes('chhathTimings')) problems.push('MuhuratHub must wire chhathTimings for expand rows');

if (problems.length) {
  console.error('festival-row-29.cjs FAIL');
  for (const p of problems) console.error(' -', p);
  process.exit(1);
}

console.log(`festival-row-29.cjs PASS — ${EXPECTED_KEYS.length} guide keys, profiles, heroes, timing wiring`);
