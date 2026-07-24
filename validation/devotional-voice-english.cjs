#!/usr/bin/env node
'use strict';

/**
 * Blocks essay / therapy / product-meta English in merged worship guides.
 * Complements hindi-devotional-language.cjs (Hindi tone) — does not check sense fully.
 */

const assert = require('node:assert');
const { loadApp } = require('./_load-app.cjs');

const BANNED = [
  { re: /may care flow both ways/i, why: 'therapy-speak in sankalpa — see plans/festival-vrat-voice-research.md' },
  { re: /ethical partnership/i, why: 'corporate English — use traditional marital wording' },
  { re: /mutual wellbeing/i, why: 'vague therapy — use सौभाग्य / कुटुम्ब कल्याण' },
  { re: /used responsibly/i, why: 'essay moralising in sankalpa' },
  { re: /gratitude replace haste/i, why: 'nonsense poetic English' },
  { re: /victory mean kindness/i, why: 'essay moralising' },
  { re: /\bGanak labels\b/i, why: 'product meta in user-facing copy' },
  { re: /\bGanak keeps\b/i, why: 'product meta in user-facing copy' },
  { re: /\bGanak's Hindu\b/i, why: 'product meta in user-facing copy' },
];

const { VRAT_VIDHI } = loadApp('src/data/vrat-vidhis.ts');
const merged = JSON.stringify(VRAT_VIDHI);
const problems = [];

for (const { re, why } of BANNED) {
  if (re.test(merged)) problems.push(why);
}

assert.deepStrictEqual(problems, [], `Devotional voice (English) problems (${problems.length}):\n- ${problems.join('\n- ')}`);
console.log(`DEVOTIONAL VOICE ENGLISH PASSED (${BANNED.length} patterns checked)`);
