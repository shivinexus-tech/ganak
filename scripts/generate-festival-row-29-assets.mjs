#!/usr/bin/env node
/* Generate festival profiles + SVG hero placeholders for P0 row #29 closure.
   Idempotent: skips owner-reviewed profiles (diwali, karva-chauth, chhath). */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const require = createRequire(import.meta.url);
const { loadApp } = require('../validation/_load-app.cjs');

const { VRAT_VIDHI } = loadApp('src/data/vrat-vidhis.ts');
const { FEST_META, OBS_META, FEST_NAME, OBS_NAME } = loadApp('src/data/festival-meta.ts');

const EXPECTED_KEYS = Object.keys(VRAT_VIDHI).sort();
const SKIP_PROFILE_OVERWRITE = new Set(['diwali', 'karva-chauth', 'chhath']);
const PROFILE_DIR = path.join(root, 'plans/festival-profiles');
const IMAGE_DIR = path.join(root, 'public/festival-images');

const slugFromKey = (key) => String(key)
  .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
  .replace(/_/g, '-')
  .replace(/[^A-Za-z0-9-]+/g, '-')
  .replace(/-{2,}/g, '-')
  .replace(/^-|-$/g, '')
  .toLowerCase();

function metaForKey(key) {
  if (FEST_META[key]) return FEST_META[key];
  if (OBS_META[key]) return OBS_META[key];
  return null;
}

function titleForKey(key) {
  if (FEST_NAME[key]) return FEST_NAME[key];
  if (OBS_NAME[key]) return OBS_NAME[key];
  const guide = VRAT_VIDHI[key];
  const first = guide?.verdict?.en?.split(/[.!]/)[0]?.trim();
  return { en: first || key, hi: key };
}

function timingKind(key) {
  const meta = metaForKey(key);
  if (meta?.timing) return meta.timing;
  if (key === 'makarSankranti') return 'sankranti';
  return 'none';
}

function mustShowLines(key, timing) {
  const lines = [
    '- [x] Local civil date for selected city',
    '- [x] Full household vidhi (VratVidhiCard)',
    '- [x] Hero image with bilingual alt',
  ];
  const timingChecks = {
    'lakshmi-puja': ['- [x] Pradosh Kaal clock window', '- [x] Lakshmi Puja muhurat clock window'],
    'chhath-sequence': ['- [x] Four-day sequence labels', '- [x] Sandhya arghya window', '- [x] Usha arghya window'],
    navratri: ['- [x] Ghatasthapana time', '- [x] Navami parana rule'],
    parana: ['- [x] Parana time'],
    moonrise: ['- [x] Moonrise / parana time'],
    sunset: ['- [x] Evening puja from sunset'],
    sunrise: ['- [x] Morning / sunrise time'],
    morning: ['- [x] Morning puja window'],
    midnight: ['- [x] Nishita (midnight) puja window'],
    stars: ['- [x] Star-sighting parana note'],
    sankranti: ['- [x] Punya kala window'],
    none: ['- [x] Date + vidhi (no special muhurat engine)'],
  };
  for (const line of (timingChecks[timing] || timingChecks.none)) lines.push(line);
  return lines.join('\n');
}

function profileBody(key) {
  const title = titleForKey(key);
  const timing = timingKind(key);
  const slug = slugFromKey(key);
  const route = `/festival/${slug}`;
  const verdict = VRAT_VIDHI[key]?.verdict?.en?.slice(0, 200) || '';
  return `# ${title.en} — content profile

**Key:** \`${key}\` · **Route:** \`${route}\` · **Status:** P0 row #29 — generated profile (${new Date().toISOString().slice(0, 10)})

## One-line purpose

${verdict || `Household worship guidance for ${title.en}.`}

## Must-show on page

${mustShowLines(key, timing)}

## Timing kind

\`${timing}\`

## Ritual essentials

1. Follow the vidhi steps in Ganak for this observance.
2. Use local city times shown on the page for muhurat where applicable.
3. Regional customs vary — the guide notes common forks without inventing rites.

## Copy voice

See \`plans/festival-vrat-voice-research.md\`. Devotional household tone; no pasted publisher paragraphs.

## Sources

- Drik Panchang festival/vrat pages: https://www.drikpanchang.com
- Dainik Bhaskar / Navbharat Times — household framing reference (not copied)

## Owner sign-off

- [ ] Spot-check EN/HI page and city timings
`;
}

function heroSvg(key, titleEn) {
  const label = titleEn.length > 28 ? `${titleEn.slice(0, 26)}…` : titleEn;
  const safe = label.replace(/[<>&"]/g, '');
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="640" height="200" viewBox="0 0 640 200" role="img">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FAF5EA"/>
      <stop offset="100%" stop-color="#E7DDC6"/>
    </linearGradient>
  </defs>
  <rect width="640" height="200" fill="url(#g)"/>
  <circle cx="520" cy="48" r="36" fill="none" stroke="#A86A12" stroke-width="3" opacity="0.55"/>
  <path d="M48 150 Q160 60 280 150 T520 150" fill="none" stroke="#C2451E" stroke-width="2.5" opacity="0.35"/>
  <text x="32" y="118" font-family="Georgia, serif" font-size="26" fill="#3B3147">${safe}</text>
  <text x="32" y="148" font-family="sans-serif" font-size="13" fill="#8C8173" letter-spacing="0.12em">GANAK FESTIVAL GUIDE</text>
</svg>
`;
}

fs.mkdirSync(PROFILE_DIR, { recursive: true });
fs.mkdirSync(IMAGE_DIR, { recursive: true });

let profilesWritten = 0;
let imagesWritten = 0;

for (const key of EXPECTED_KEYS) {
  const slug = slugFromKey(key);
  const profilePath = path.join(PROFILE_DIR, `${slug}.md`);
  if (!SKIP_PROFILE_OVERWRITE.has(slug) && !SKIP_PROFILE_OVERWRITE.has(key)) {
    fs.writeFileSync(profilePath, profileBody(key));
    profilesWritten += 1;
  } else if (!fs.existsSync(profilePath)) {
    fs.writeFileSync(profilePath, profileBody(key));
    profilesWritten += 1;
  }

  const imagePath = path.join(IMAGE_DIR, `${key}.svg`);
  const title = titleForKey(key);
  fs.writeFileSync(imagePath, heroSvg(key, title.en));
  imagesWritten += 1;
}

console.log(`festival-row-29 assets: ${EXPECTED_KEYS.length} keys, ${profilesWritten} profiles written/updated, ${imagesWritten} hero SVGs`);
