#!/usr/bin/env node
'use strict';

/* Festival aarti gate: every COVERED guide has a well-formed aartis array —
   Devanagari, multi-line, correct orthography, expected first-line anchors.
   Standard: plans/festival-aarti-standard.md §5. COVERED grows per content batch. */

const assert = require('node:assert');
const { loadApp } = require('./_load-app.cjs');
const { VRAT_VIDHI } = loadApp('src/data/vrat-vidhis.ts');

const COVERED = [
  'diwali', 'dhanteras', 'ganeshChaturthi', 'janmashtami', 'govardhanPuja',
  'ramNavami', 'hanumanJ', 'chaitraNavratri', 'sharadNavratri', 'mahaShivaratri',
  'masikShivaratri', 'pradosh', 'karvaChauth', 'ahoiAshtami', 'hartalikaTeej', 'purnima',
];

const ANCHORS = {
  diwali: ['जय गणेश', 'ॐ जय लक्ष्मी माता', 'ॐ जय जगदीश हरे'],
  dhanteras: ['जय गणेश', 'ॐ जय लक्ष्मी माता', 'ॐ जय जगदीश हरे'],
  ganeshChaturthi: ['जय गणेश'],
  janmashtami: ['जय गणेश', 'आरती कुंजबिहारी की', 'ॐ जय जगदीश हरे'],
  govardhanPuja: ['जय गणेश', 'श्री गोवर्धन महाराज', 'ॐ जय जगदीश हरे'],
  ramNavami: ['जय गणेश', 'आरती श्री रामायणजी की', 'ॐ जय जगदीश हरे'],
  hanumanJ: ['आरती कीजै हनुमान लला की', 'आरती श्री रामायणजी की'],
  chaitraNavratri: ['जय गणेश', 'जय अम्बे गौरी', 'अम्बे तू है जगदम्बे काली', 'ॐ जय शिव ओंकारा'],
  sharadNavratri: ['जय गणेश', 'जय अम्बे गौरी', 'अम्बे तू है जगदम्बे काली', 'ॐ जय शिव ओंकारा'],
  mahaShivaratri: ['जय गणेश', 'ॐ जय शिव ओंकारा'],
  masikShivaratri: ['जय गणेश', 'ॐ जय शिव ओंकारा'],
  pradosh: ['जय गणेश', 'ॐ जय शिव ओंकारा'],
  karvaChauth: ['जय गणेश', 'ॐ जय करवा मैया', 'ॐ जय शिव ओंकारा'],
  ahoiAshtami: ['जय गणेश', 'जय अहोई माता', 'ॐ जय शिव ओंकारा'],
  hartalikaTeej: ['जय गणेश', 'ॐ जय शिव ओंकारा', 'जय पार्वती माता'],
  purnima: ['जय गणेश', 'जय लक्ष्मीरमणा', 'ॐ जय जगदीश हरे'],
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

/* ------------------------------------------------------------------------
   Standalone deity aartis (P2-FESTIVAL-AARTI-BREADTH, Tier 1).

   The checks above reach an aarti only through a festival guide, so a deity
   aarti that belongs to a weekday vrat or a pilgrimage rather than to one
   festival — Shani, Santoshi, Khatu Shyam — would be entered and validated by
   nothing at all. These are keyed by the exported constant instead, and hold
   the same contract: bilingual title and intro, refrain + cue + stanzas,
   Devanagari only, and the refrain opening pinned so a text cannot be quietly
   swapped for a different aarti.

   The anchor is the identity of the aarti. It is the one thing that must not
   drift: everything else about a devotional text can be re-sourced, but if the
   opening changes, it is a different hymn.
   ------------------------------------------------------------------------ */
const AARTI_TEXTS = loadApp('src/data/aarti-texts.ts');

const DEITY_AARTIS = {
  SHANI_AARTI: 'जय जय श्री शनिदेव भक्तन हितकारी',
  SANTOSHI_AARTI: 'जय सन्तोषी माता',
  SARASWATI_AARTI: 'जय सरस्वती माता',
  SURYA_AARTI: 'जय कश्यप-नन्दन',
  KHATU_SHYAM_AARTI: 'ॐ जय श्री श्याम हरे',
  VAISHNO_AARTI: 'जय वैष्णवी माता',
  GANGA_AARTI: 'ॐ जय गंगे माता',
};

for (const [name, anchor] of Object.entries(DEITY_AARTIS)) {
  const a = AARTI_TEXTS[name];
  assert(a, `deity aarti ${name} is not exported from src/data/aarti-texts.ts`);
  assert(a.title && a.title.en && a.title.hi, `${name}: title {en,hi} required`);
  assert(a.intro && a.intro.en && a.intro.hi, `${name}: intro {en,hi} required`);
  assert(typeof a.refrain === 'string' && a.refrain.trim(), `${name}: refrain required`);
  assert(typeof a.cue === 'string' && a.cue.trim(), `${name}: cue required`);
  assert(Array.isArray(a.stanzas) && a.stanzas.length >= 3, `${name}: needs at least 3 stanzas, has ${(a.stanzas || []).length}`);

  const allText = [a.refrain, a.cue, ...a.stanzas].join('\n');
  assert(DEVANAGARI.test(allText), `${name}: text must contain Devanagari`);
  assert(!LATIN.test(allText), `${name}: aarti text must be Devanagari only (no Latin)`);
  assert(!/ओम्/.test(allText), `${name}: use ॐ, not ओम्`);
  assert(firstLine(a.refrain).includes(anchor), `${name}: refrain must open with "${anchor}" — a different opening means a different aarti`);
  assert(nonEmptyLines(a.cue).length === 1, `${name}: cue must be a single short line`);
  assert(a.cue.length < a.refrain.length, `${name}: the cue must be shorter than the refrain it stands in for`);

  // The refrain is shown once at the top and marked afterwards by the cue, so it
  // must not also be repeated as a stanza (plans/festival-aarti-standard.md §2).
  const refrainFirst = firstLine(a.refrain);
  for (const [i, s] of a.stanzas.entries()) {
    assert(firstLine(s) !== refrainFirst, `${name}: stanza ${i + 1} repeats the refrain — the cue already marks the return`);
  }

  // Every stanza is a sung couplet or longer, and ends a full stanza with ॥.
  for (const [i, s] of a.stanzas.entries()) {
    assert(nonEmptyLines(s).length >= 2, `${name}: stanza ${i + 1} is a single line — aarti stanzas are couplets or longer`);
    assert(/॥\s*$/.test(s.trim()), `${name}: stanza ${i + 1} must end with a double danda ॥`);
  }
  assert(/॥\s*$/.test(a.refrain.trim()), `${name}: the refrain must end with a double danda ॥`);
}

const deityCount = Object.keys(DEITY_AARTIS).length;
const deityStanzas = Object.keys(DEITY_AARTIS).reduce((n, k) => n + AARTI_TEXTS[k].stanzas.length, 0);

console.log(`festival-aarti: OK (${COVERED.length} guide(s), ${COVERED.reduce((n, k) => n + VRAT_VIDHI[k].aartis.length, 0)} aartis; plus ${deityCount} standalone deity aartis, ${deityStanzas} stanzas)`);
