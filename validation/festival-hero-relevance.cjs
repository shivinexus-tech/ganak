#!/usr/bin/env node
'use strict';

const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { loadApp } = require('./_load-app.cjs');

const root = path.resolve(__dirname, '..');
const { VRAT_VIDHI } = loadApp('src/data/vrat-vidhis.ts');
const { FESTIVAL_HERO_ART } = loadApp('src/data/festival-hero-art.ts');
const imageDir = path.join(root, 'public/festival-images');

const keys = Object.keys(VRAT_VIDHI).sort();
let failures = 0;

for (const key of keys) {
  const art = FESTIVAL_HERO_ART[key];
  assert(art, `${key} must have a festival-hero-art registry entry`);
  const file = path.join(imageDir, `${key}.svg`);
  assert(fs.existsSync(file), `${key} must have public/festival-images/${key}.svg`);
  const svg = fs.readFileSync(file, 'utf8');
  assert(svg.includes(`data-subject="${art.subject}"`), `${key}.svg must declare data-subject="${art.subject}"`);
  assert(svg.includes('aria-label'), `${key}.svg must include aria-label`);
  assert(!/GANAK FESTIVAL GUIDE/i.test(svg), `${key}.svg must not use the old placeholder label`);
  assert(svg.includes('viewBox="0 0 640 240"') || svg.includes('height="240"'), `${key}.svg must use the 640×240 hero format`);
  if (key === 'diwali') {
    assert(/lakshmi/i.test(svg) || art.subject === 'lakshmi', 'Diwali hero must depict Lakshmi puja');
    assert(svg.includes('lotus') || svg.includes('Lotus') || svg.includes('कमल'), 'Diwali hero must include lotus imagery');
  }
  console.log(`PASS  ${key} → ${art.subject} (${art.template})`);
}

const diwali = fs.readFileSync(path.join(imageDir, 'diwali.svg'), 'utf8');
assert(diwali.includes('data-subject="lakshmi"'), 'hand-crafted diwali.svg must be Lakshmi-themed');

if (failures) process.exit(1);
console.log(`\nFESTIVAL HERO RELEVANCE PASSED (${keys.length} guides)`);
