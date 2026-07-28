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
    assert(typeof a.refrain === 'string' && a.refrain.trim(), `${key}[${i}]: refrain required`);
    assert(typeof a.cue === 'string' && a.cue.trim(), `${key}[${i}]: cue required`);
    assert(Array.isArray(a.stanzas) && a.stanzas.length > 0, `${key}[${i}]: stanzas must be a non-empty array`);

    // All sung text = refrain + cue + every stanza. Validate as a whole.
    const parts = [a.refrain, a.cue, ...a.stanzas];
    const allText = parts.join('\n');
    assert(DEVANAGARI.test(allText), `${key}[${i}]: text must contain Devanagari`);
    assert(!/ओम्/.test(allText), `${key}[${i}]: use ॐ, not ओम्`);
    assert(!LATIN.test(allText), `${key}[${i}]: aarti text must be Devanagari only (no Latin)`);

    // Refrain (opening) is the first-line anchor; total sung lines are substantial.
    assert(firstLine(a.refrain).includes(anchors[i]), `${key}[${i}]: refrain must start with "${anchors[i]}"`);
    assert(nonEmptyLines(allText).length >= 4, `${key}[${i}]: aarti must have >= 4 lines`);
    // The cue is a short refrain marker, not a full stanza.
    assert(nonEmptyLines(a.cue).length === 1, `${key}[${i}]: cue must be a single short line`);
  });
}

console.log(`festival-aarti: OK (${COVERED.length} guide(s), ${COVERED.reduce((n, k) => n + VRAT_VIDHI[k].aartis.length, 0)} aartis)`);
