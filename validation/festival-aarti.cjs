#!/usr/bin/env node
'use strict';

/* Festival aarti gate: every COVERED guide has a well-formed aartis array —
   Devanagari, multi-line, correct orthography, expected first-line anchors.
   Standard: plans/festival-aarti-standard.md §5. COVERED grows per content batch. */

const assert = require('node:assert');
const { loadApp } = require('./_load-app.cjs');
const { VRAT_VIDHI } = loadApp('src/data/vrat-vidhis.ts');

const COVERED = ['diwali'];

const ANCHORS = {
  diwali: ['जय गणेश', 'ॐ जय लक्ष्मी माता', 'ॐ जय जगदीश हरे'],
};

const DEVANAGARI = /[ऀ-ॿ]/;
const LATIN = /[A-Za-z]/;
const nonEmptyLines = (v) => String(v).split('\n').map((s) => s.trim()).filter(Boolean);
const firstLine = (v) => nonEmptyLines(v)[0] || '';

for (const key of COVERED) {
  const guide = VRAT_VIDHI[key];
  assert(guide, `missing guide: ${key}`);
  const list = guide.aartis;
  assert(Array.isArray(list) && list.length > 0, `${key}: aartis must be a non-empty array`);
  const anchors = ANCHORS[key];
  assert(anchors && anchors.length === list.length, `${key}: ANCHORS length must match aartis length`);

  list.forEach((a, i) => {
    assert(a.title && a.title.en && a.title.hi, `${key}[${i}]: title {en,hi} required`);
    assert(a.intro && a.intro.en && a.intro.hi, `${key}[${i}]: intro {en,hi} required`);
    assert(typeof a.verses === 'string' && a.verses.trim(), `${key}[${i}]: verses required`);
    assert(DEVANAGARI.test(a.verses), `${key}[${i}]: verses must contain Devanagari`);
    assert(nonEmptyLines(a.verses).length >= 4, `${key}[${i}]: verses must have >= 4 lines`);
    assert(!/ओम्/.test(a.verses), `${key}[${i}]: use ॐ, not ओम्`);
    assert(!LATIN.test(a.verses), `${key}[${i}]: verses must be Devanagari only (no Latin)`);
    assert(firstLine(a.verses).includes(anchors[i]), `${key}[${i}]: first line must start with "${anchors[i]}"`);
  });
}

console.log(`festival-aarti: OK (${COVERED.length} guide(s), ${COVERED.reduce((n, k) => n + VRAT_VIDHI[k].aartis.length, 0)} aartis)`);
