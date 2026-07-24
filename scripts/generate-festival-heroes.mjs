#!/usr/bin/env node
/* Generate subject-aware festival hero SVGs from FESTIVAL_HERO_ART registry. */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { renderHero, TEMPLATES } from './festival-hero-templates.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const require = createRequire(import.meta.url);
const { loadApp } = require('../validation/_load-app.cjs');

const { VRAT_VIDHI } = loadApp('src/data/vrat-vidhis.ts');
const { FESTIVAL_HERO_ART } = loadApp('src/data/festival-hero-art.ts');
const { FEST_NAME, OBS_NAME } = loadApp('src/data/festival-meta.ts');

const SKIP_KEYS = new Set(['diwali']);
const IMAGE_DIR = path.join(root, 'public/festival-images');

function titleForKey(key) {
  if (FEST_NAME[key]) return FEST_NAME[key];
  if (OBS_NAME[key]) return OBS_NAME[key];
  const guide = VRAT_VIDHI[key];
  const first = guide?.verdict?.en?.split(/[.!]/)[0]?.trim();
  return { en: first || key, hi: key };
}

function collectKeys() {
  const keys = new Set(Object.keys(VRAT_VIDHI));
  for (const key of Object.keys(FESTIVAL_HERO_ART)) keys.add(key);
  return [...keys].sort();
}

fs.mkdirSync(IMAGE_DIR, { recursive: true });

let written = 0;
let skipped = 0;
const problems = [];

for (const key of collectKeys()) {
  if (SKIP_KEYS.has(key)) {
    skipped += 1;
    continue;
  }

  const art = FESTIVAL_HERO_ART[key];
  if (!art) {
    problems.push(`${key}: missing FESTIVAL_HERO_ART entry`);
    continue;
  }
  if (!TEMPLATES[art.template]) {
    problems.push(`${key}: unknown template "${art.template}"`);
    continue;
  }

  const title = titleForKey(key);
  const svg = renderHero(art.template, {
    subject: art.subject,
    ariaLabel: art.alt?.en || title.en,
    titleEn: title.en,
    titleHi: title.hi,
  });

  if (!svg.includes(`data-subject="${art.subject}"`)) {
    problems.push(`${key}: generated SVG missing data-subject="${art.subject}"`);
    continue;
  }
  if (!svg.includes('aria-label=')) {
    problems.push(`${key}: generated SVG missing aria-label`);
    continue;
  }

  fs.writeFileSync(path.join(IMAGE_DIR, `${key}.svg`), svg);
  written += 1;
}

if (problems.length) {
  console.error('festival-hero generation failed:');
  for (const p of problems) console.error(`  ✗ ${p}`);
  process.exit(1);
}

console.log(`festival-heroes: ${written} SVGs written, ${skipped} skipped (hand-crafted: ${[...SKIP_KEYS].join(', ')})`);
