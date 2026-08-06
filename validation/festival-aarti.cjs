#!/usr/bin/env node
'use strict';

/* Festival aarti gate: every COVERED guide has a well-formed aartis array. Each aarti
   now carries a multi-language `langs` map (hi/mr/bn/gu/roman); each rendering is a
   {refrain, cue, stanzas} AartiScript validated by its own script range — Devanagari for
   hi/mr, Bengali for bn, Gujarati for gu — with no Latin and no cross-script leak. The hi
   rendering keeps the Phase-1 orthography + first-line anchor checks. Standard:
   plans/festival-aarti-standard.md §5; model: docs/superpowers/specs/2026-08-01-aarti-multilang-phase2-prd.md (R1–R4). */

const assert = require('node:assert');
const { loadApp } = require('./_load-app.cjs');
const { VRAT_VIDHI } = loadApp('src/data/vrat-vidhis.ts');

const COVERED = [
  'diwali', 'dhanteras', 'ganeshChaturthi', 'janmashtami', 'govardhanPuja',
  'ramNavami', 'hanumanJ', 'chaitraNavratri', 'sharadNavratri', 'mahaShivaratri',
  'masikShivaratri', 'pradosh', 'karvaChauth', 'ahoiAshtami', 'hartalikaTeej', 'purnima',
];

// Anchors are the Hindi refrain first line (catches a wrong/swapped aarti).
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

// Script ranges. Devanagari EXCLUDES the shared danda । (U+0964) and double danda ॥
// (U+0965), which are used across all Indic scripts and are allowed in every rendering.
const DEVANAGARI = /[ऀ-ॣ०-ॿ]/;
const BENGALI = /[ঀ-৿]/;
const GUJARATI = /[઀-૿]/;
const LATIN = /[A-Za-z]/;

// Per-language: the script that MUST appear, and the scripts that must NOT leak in.
const SCRIPT_RULE = {
  hi: { name: 'Devanagari', must: DEVANAGARI, forbid: { Bengali: BENGALI, Gujarati: GUJARATI } },
  mr: { name: 'Devanagari', must: DEVANAGARI, forbid: { Bengali: BENGALI, Gujarati: GUJARATI } },
  bn: { name: 'Bengali', must: BENGALI, forbid: { Devanagari: DEVANAGARI, Gujarati: GUJARATI } },
  gu: { name: 'Gujarati', must: GUJARATI, forbid: { Devanagari: DEVANAGARI, Bengali: BENGALI } },
};
const KNOWN_LANGS = new Set(['hi', 'mr', 'bn', 'gu', 'roman']);

const nonEmptyLines = (v) => String(v).split('\n').map((s) => s.trim()).filter(Boolean);
const firstLine = (v) => nonEmptyLines(v)[0] || '';

let scriptCount = 0;

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
    assert(typeof a.slug === 'string' && a.slug.trim(), `${key}[${i}]: slug required`);
    assert(a.langs && typeof a.langs === 'object', `${key}[${i}]: langs map required`);
    assert(a.primaryLang && a.langs[a.primaryLang], `${key}[${i}]: primaryLang must exist in langs`);

    const langKeys = Object.keys(a.langs);
    assert(langKeys.length > 0, `${key}[${i}]: at least one language required`);

    // The Hindi rendering carries the Phase-1 anchor for this guide slot.
    assert(a.langs.hi, `${key}[${i}]: langs.hi required (guide anchor + backward-safe)`);
    assert(firstLine(a.langs.hi.refrain).includes(anchors[i]), `${key}[${i}]: hi refrain must start with "${anchors[i]}"`);

    for (const lang of langKeys) {
      assert(KNOWN_LANGS.has(lang), `${key}[${i}]: unknown language "${lang}"`);
      if (lang === 'roman') continue; // Roman (P1) is Latin transliteration; skip script checks.
      const rule = SCRIPT_RULE[lang];
      assert(rule, `${key}[${i}].${lang}: no script rule defined`);
      const s = a.langs[lang];
      assert(typeof s.refrain === 'string' && s.refrain.trim(), `${key}[${i}].${lang}: refrain required`);
      assert(typeof s.cue === 'string' && s.cue.trim(), `${key}[${i}].${lang}: cue required`);
      assert(Array.isArray(s.stanzas) && s.stanzas.length > 0, `${key}[${i}].${lang}: stanzas must be a non-empty array`);

      const parts = [s.refrain, s.cue, ...s.stanzas];
      const allText = parts.join('\n');
      assert(rule.must.test(allText), `${key}[${i}].${lang}: text must contain ${rule.name} script`);
      assert(!LATIN.test(allText), `${key}[${i}].${lang}: aarti text must be ${rule.name} only (no Latin)`);
      for (const [otherName, otherRe] of Object.entries(rule.forbid)) {
        assert(!otherRe.test(allText), `${key}[${i}].${lang}: ${otherName} script leaked into ${lang} text`);
      }
      // Orthography: Devanagari renderings use ॐ, never ओम्.
      if (rule.must === DEVANAGARI) assert(!/ओम्/.test(allText), `${key}[${i}].${lang}: use ॐ, not ओम्`);

      assert(nonEmptyLines(allText).length >= 4, `${key}[${i}].${lang}: aarti must have >= 4 lines`);
      assert(nonEmptyLines(s.cue).length === 1, `${key}[${i}].${lang}: cue must be a single short line`);
      scriptCount += 1;
    }
  });
}

const totalAartis = COVERED.reduce((n, k) => n + VRAT_VIDHI[k].aartis.length, 0);
console.log(`festival-aarti: OK (${COVERED.length} guide(s), ${totalAartis} aarti slots, ${scriptCount} language renderings)`);
