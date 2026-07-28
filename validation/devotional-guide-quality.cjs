#!/usr/bin/env node
'use strict';

const assert = require('node:assert');
const { loadApp } = require('./_load-app.cjs');
const { VRAT_VIDHI } = loadApp('src/data/vrat-vidhis.ts');

const SAFETY_KEYS = new Set([
  'ahoiAshtami', 'ayyappaMandala', 'ayyappaMandalaBegins', 'ayyappaMandalaPuja',
  'chaitraNavratri', 'chhath', 'chandraGrahan', 'diwali', 'durgaPujaDashami',
  'dussehra', 'ganeshChaturthi', 'hartalikaTeej', 'holika', 'janmashtami',
  'karvaChauth', 'mahaShivaratri', 'makarSankranti', 'rangwaliHoli',
  'sharadNavratri', 'sheetlaAshtami', 'skandaSashtiSoorasamharam', 'suryaGrahan',
]);

const BANNED = [
  /not interchangeable/i,
  /do not invent/i,
  /not a substitute for (?:temple )?authority/i,
  /ask the committee/i,
  /rather than assuming/i,
  /safely accessible/i,
  /this note does not/i,
  /one documented/i,
  /not a public photo opportunity/i,
  /do not (?:copy|improvise|assume)/i,
  /न गढ़ें/,
  /Jain and Sikh/i,
  /follow your own community sources/i,
  /जैन और सिख दीपावली/,
  /केवल हिन्दू गृह-पूजा के लिए है; उन परम्पराओं के लिए/,
  /\bGanak (?:shows|states|labels|keeps|lists|does)\b/i,
  /\bGanak's\b/i,
  /गणक (?:दिखाता|चुनी|उन्हें|बौद्ध)/u,
];

const REQUIRED_OBJECTS = ['verdict', 'meaning', 'diet', 'sankalpa', 'puja', 'paran', 'udyapan'];
const REQUIRED_LISTS = { vidhi: 2, stories: 2, regional: 2 };
const MIN_KATHA_WORDS = 140;
const MIN_KATHA_PARAS = 3;
const NAMED_STORY_ANCHORS = {
  skandaSashtiBegins: {
    en: [/six-day|six days/i, /Vel/i, /begin|first day|opening/i],
    hi: [/छह-दिवसीय|छह दिनों/u, /वेल/u, /आरम्भ|प्रथम दिन/u],
  },
  skandaSashtiSoorasamharam: {
    en: [/Surapadman/i, /Vel/i, /day six|sixth day|Soorasamharam/i],
    hi: [/सुरपद्म/u, /वेल/u, /छठे दिन|सूरसम्हारम्/u],
  },
  skandaSashtiThirukalyanam: {
    en: [/Deivanai/i, /wedding|marriage/i, /Thirukalyanam|day after/i],
    hi: [/देवयानी/u, /विवाह/u, /तिरुकल्याणम्|अगले दिन/u],
  },
  ayyappaMandalaBegins: {
    en: [/mala/i, /forty-one|41/, /begin|opening|starts/i],
    hi: [/माला/u, /इकतालीस|41/u, /आरम्भ/u],
  },
  ayyappaMandalaPuja: {
    en: [/Mandala Pooja/i, /pilgrimage/i, /completion|closes|culmination/i],
    hi: [/मंडल पूजा/u, /यात्रा/u, /समापन|पूर्णता/u],
  },
  suryaGrahan: {
    en: [/solar eclipse|Sun/i, /Moon/i, /Rahu|node/i],
    hi: [/सूर्य ग्रहण|सूर्य/u, /चन्द्र/u, /राहु|पात/u],
  },
  chandraGrahan: {
    en: [/lunar eclipse|Moon/i, /Earth/i, /Rahu|node/i],
    hi: [/चन्द्र ग्रहण|चन्द्र/u, /पृथ्वी/u, /राहु|पात/u],
  },
};
const NAMED_PRODUCT_META = [/\bGanak (?:shows|states|labels|keeps)\b/i, /\bGanak's\b/i];
const DISTINCT_COMPLETION_KEYS = [
  'holika', 'rangwaliHoli', 'ramNavami', 'hanumanJ', 'akshaya',
  'guruPurnima', 'rakshaBandhan', 'dussehra', 'dhanteras',
  'narakChaturdashi', 'govardhanPuja', 'bhaiDooj', 'gudiPadwa', 'ugadi',
  'buddhaPurnima', 'rathYatra', 'kartikaPurnima', 'durgaPujaMahalaya',
  'durgaPujaShashthi', 'durgaPujaSaptami', 'durgaPujaAshtami',
  'durgaPujaNavami', 'durgaPujaDashami', 'skandaSashtiBegins',
  'skandaSashtiSoorasamharam', 'skandaSashtiThirukalyanam',
];

function parseKathaBody(text) {
  const sep = ' — ';
  const i = String(text || '').indexOf(sep);
  return i < 0 ? String(text || '') : text.slice(i + sep.length).trim();
}

function normalized(text) {
  return String(text || '').toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
}

function validateGuides(guides) {
  const problems = [];
  const keys = Object.keys(guides).sort();
  if (keys.length < 57) problems.push(`guide inventory unexpectedly shrank: expected at least 57, got ${keys.length}`);

  const fingerprints = new Map();
  const storyFingerprints = new Map();
  const completionFingerprints = new Map();

  for (const key of keys) {
    const guide = guides[key];
    for (const field of REQUIRED_OBJECTS) {
      if (!guide[field]?.en || !guide[field]?.hi) problems.push(`${key}.${field} must be complete in English and Hindi`);
    }
    for (const [field, minimum] of Object.entries(REQUIRED_LISTS)) {
      if (!Array.isArray(guide[field]) || guide[field].length < minimum) {
        problems.push(`${key}.${field} must contain at least ${minimum} bilingual items`);
        continue;
      }
      if (guide[field].some((item) => !item?.en || !item?.hi)) problems.push(`${key}.${field} has a non-bilingual item`);
    }

    if (Array.isArray(guide.stories)) {
      guide.stories.forEach((story, idx) => {
        for (const lang of ['en', 'hi']) {
          const body = parseKathaBody(story[lang]);
          const paras = body.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
          const words = body.split(/\s+/).filter(Boolean).length;
          if (words < MIN_KATHA_WORDS) {
            problems.push(`${key}.stories[${idx}].${lang} is too short (${words} words; need ${MIN_KATHA_WORDS}+)`);
          }
          if (paras.length < MIN_KATHA_PARAS) {
            problems.push(`${key}.stories[${idx}].${lang} needs ${MIN_KATHA_PARAS}+ paragraphs`);
          }
          const fingerprint = normalized(body);
          const prior = storyFingerprints.get(`${lang}:${fingerprint}`);
          if (prior) problems.push(`${key}.stories[${idx}].${lang} duplicates ${prior}`);
          else storyFingerprints.set(`${lang}:${fingerprint}`, `${key}.stories[${idx}].${lang}`);
        }
      });
    }

    const publicText = JSON.stringify(guide);
    for (const pattern of BANNED) {
      if (pattern.test(publicText)) problems.push(`${key} contains defensive/product-meta wording: ${pattern}`);
    }

    if (guide.safety && !SAFETY_KEYS.has(key)) problems.push(`${key} has a generic safety note without an approved guide-specific risk`);
    if (guide.safety && (!guide.safety.en || !guide.safety.hi)) problems.push(`${key}.safety must be bilingual`);

    if (DISTINCT_COMPLETION_KEYS.includes(key)) {
      const fingerprint = normalized(`${guide.udyapan?.en || ''}\n${guide.udyapan?.hi || ''}`);
      const prior = completionFingerprints.get(fingerprint);
      if (prior) problems.push(`${key}.udyapan duplicates ${prior}.udyapan`);
      else completionFingerprints.set(fingerprint, key);
    }

    for (const field of ['verdict', 'meaning', 'diet']) {
      if (!guide[field]) continue;
      const fingerprint = normalized(`${guide[field]?.en || ''}\n${guide[field]?.hi || ''}`);
      const prior = fingerprints.get(`${field}:${fingerprint}`);
      if (prior) problems.push(`${key}.${field} duplicates ${prior}.${field}`);
      else fingerprints.set(`${field}:${fingerprint}`, key);
    }

    const anchors = NAMED_STORY_ANCHORS[key];
    if (anchors) {
      for (const pattern of NAMED_PRODUCT_META) {
        if (pattern.test(publicText)) problems.push(`${key} contains named-route product-meta wording: ${pattern}`);
      }
      for (const lang of ['en', 'hi']) {
        const storyText = (guide.stories || []).map((story) => story[lang] || '').join('\n');
        for (const anchor of anchors[lang]) {
          if (!anchor.test(storyText)) problems.push(`${key}.stories.${lang} misses named semantic anchor ${anchor}`);
        }
      }
    }
  }
  return problems;
}

const problems = validateGuides(VRAT_VIDHI);
assert.deepStrictEqual(problems, [], `Devotional guide quality problems (${problems.length}):\n- ${problems.join('\n- ')}`);

// Non-vacuous failure fixtures: prove length, distinctness, named identity and
// product-meta checks reject plausible regressions without altering production data.
const fixture = structuredClone(VRAT_VIDHI);
fixture.skandaSashtiBegins.stories = [
  { en: 'A generic festival story with no named sequence.', hi: 'यह बिना नाम और क्रम की सामान्य पर्व कथा है।' },
  { en: 'A second generic account without route identity.', hi: 'यह नामित पहचान के बिना दूसरी सामान्य कथा है।' },
];
fixture.skandaSashtiSoorasamharam.stories = structuredClone(fixture.skandaSashtiThirukalyanam.stories);
fixture.suryaGrahan.meaning.en = 'Ganak shows an eclipse and keeps the details here.';
fixture.ekadashi.meaning.en = 'Ganak shows the generic fast here.';
fixture.holika.udyapan = structuredClone(fixture.rangwaliHoli.udyapan);
const fixtureProblems = validateGuides(fixture);
assert(fixtureProblems.some((p) => p.includes('skandaSashtiBegins.stories[0].en is too short')), 'fixture must fail short-story check');
assert(
  fixtureProblems.some((p) => p.includes('.stories[0].en duplicates') && p.includes('skandaSashti')),
  'fixture must fail copied-story check',
);
assert(fixtureProblems.some((p) => p.includes('skandaSashtiBegins.stories.en misses named semantic anchor')), 'fixture must fail named-anchor check');
assert(fixtureProblems.some((p) => p.includes('suryaGrahan contains named-route product-meta wording')), 'fixture must fail product-meta check');
assert(fixtureProblems.some((p) => p.includes('ekadashi contains defensive/product-meta wording')), 'fixture must fail global product-meta check');
assert(fixtureProblems.some((p) => p.includes('holika.udyapan duplicates rangwaliHoli.udyapan') || p.includes('rangwaliHoli.udyapan duplicates holika.udyapan')), 'fixture must fail copied-completion check');

console.log(`DEVOTIONAL GUIDE QUALITY PASSED (${Object.keys(VRAT_VIDHI).length} dynamically discovered bilingual guides; ${Object.keys(NAMED_STORY_ANCHORS).length} named-route semantic profiles; failure fixtures proven)`);
