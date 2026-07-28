#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { loadApp } = require('./_load-app.cjs');
const { validateRaster, assertDecodable, duplicateProblems, runMutationFixtures } = require('./_festival-raster-validator.cjs');

const root = path.resolve(__dirname, '..');
const { VRAT_VIDHI } = loadApp('src/data/vrat-vidhis.ts');
const { FESTIVAL_HERO_ART } = loadApp('src/data/festival-hero-art.ts');
const imageDir = path.join(root, 'public/festival-images/raster');

const keys = Object.keys(VRAT_VIDHI).sort();
const problems = [];
const records = [];
const decodeChecks = [];
// Shared art is never implicit. Add a sorted "keyA|keyB" only after devotional
// relevance review records why the exact same composition is correct for both.
const SHARED_RASTER_ALLOWLIST = new Set();

for (const key of keys) {
  const art = FESTIVAL_HERO_ART[key];
  if (!art) {
    problems.push(`${key}: missing festival-hero-art registry entry`);
    continue;
  }
  if (!art.subject || !art.template) problems.push(`${key}: registry needs subject and template`);
  if (!art.alt?.en?.trim() || !art.alt?.hi?.trim()) problems.push(`${key}: registry needs non-blank English and Hindi alt text`);
  const file = path.join(imageDir, `${key}.webp`);
  if (!fs.existsSync(file)) {
    problems.push(`${key}: missing public/festival-images/raster/${key}.webp`);
    continue;
  }
  try {
    const buffer = fs.readFileSync(file);
    const { info, problems: rasterProblems } = validateRaster(buffer);
    for (const problem of rasterProblems) problems.push(`${key}: ${problem}`);
    records.push({ key, sha256: info.sha256 });
    decodeChecks.push(assertDecodable(buffer).catch((error) => {
      problems.push(`${key}: invalid or undecodable WebP — ${error.message}`);
    }));
    console.log(`PASS  ${key} → ${art.subject} (${info.width}×${info.height}, ${info.bytes} bytes)`);
  } catch (error) {
    problems.push(`${key}: invalid or undecodable WebP — ${error.message}`);
  }
}

async function finish() {
  await Promise.all(decodeChecks);
  problems.push(...duplicateProblems(records, SHARED_RASTER_ALLOWLIST));

  const component = fs.readFileSync(path.join(root, 'src/components/FestivalRasterHero.tsx'), 'utf8');
  const screen = fs.readFileSync(path.join(root, 'src/screens/FestivalGuideScreen.tsx'), 'utf8');
  if (!component.includes('/festival-images/raster/${imageKey}.webp')) problems.push('FestivalRasterHero must request the key-specific raster WebP');
  if (!component.includes('onError={() => setFailed(true)}')) problems.push('FestivalRasterHero must handle an image load failure');
  if (!component.includes('heroArtForKey(imageKey)')) problems.push('FestivalRasterHero must use registry alt text');
  if (!screen.includes('<FestivalRasterHero imageKey={guide.vidhiKey}')) problems.push('FestivalGuideScreen must render FestivalRasterHero for guide keys');

  try { await runMutationFixtures(); } catch (error) { problems.push(`validator mutation fixtures: ${error.message}`); }

  if (problems.length) {
    console.error(`\nFESTIVAL HERO RELEVANCE FAILED (${problems.length} problems; ${records.length}/${keys.length} rasters present)`);
    for (const problem of problems) console.error(' -', problem);
    process.exit(1);
  }
  console.log(`\nFESTIVAL HERO RELEVANCE PASSED (${keys.length} guides; mutation fixtures rejected)`);
}

finish().catch((error) => {
  console.error(`festival-hero-relevance.cjs crashed: ${error.stack || error.message}`);
  process.exit(1);
});
