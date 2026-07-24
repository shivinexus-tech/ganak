#!/usr/bin/env node
// Guards src/data/life-interpretation.ts: completeness, a safety register, and
// buildLifeReading behaviour. Includes non-vacuous self-tests so the safety guard
// is proven to actually bite (AGENTS.md: prove guards non-vacuously).
'use strict';
const { loadApp } = require('./_load-app.cjs');
const { NAKSHATRA_TRAITS, SIGN_TRAITS, buildLifeReading } = loadApp('src/data/life-interpretation.ts');

const LANGS = ['en', 'hi'];
const fails = [];
const bi = (where, o) => {
  if (!o || typeof o !== 'object') return fails.push(`${where}: missing`);
  for (const l of LANGS) if (!o[l] || !String(o[l]).trim()) fails.push(`${where}.${l}: empty`);
};

// 1. Completeness / structure
if (!Array.isArray(NAKSHATRA_TRAITS) || NAKSHATRA_TRAITS.length !== 27)
  fails.push(`NAKSHATRA_TRAITS must have 27 entries, has ${NAKSHATRA_TRAITS && NAKSHATRA_TRAITS.length}`);
if (!Array.isArray(SIGN_TRAITS) || SIGN_TRAITS.length !== 12)
  fails.push(`SIGN_TRAITS must have 12 entries, has ${SIGN_TRAITS && SIGN_TRAITS.length}`);
(NAKSHATRA_TRAITS || []).forEach((e, i) => {
  bi(`nak[${i}].nature`, e.nature); bi(`nak[${i}].strengths`, e.strengths);
  if (!e.source || !e.source.trim()) fails.push(`nak[${i}].source: empty`);
  if (e.status !== 'sourced' && e.status !== 'owner-verified') fails.push(`nak[${i}].status invalid`);
});
(SIGN_TRAITS || []).forEach((e, i) => {
  for (const f of ['mind', 'relating', 'work', 'outward']) bi(`sign[${i}].${f}`, e[f]);
  if (!e.source || !e.source.trim()) fails.push(`sign[${i}].source: empty`);
  if (e.status !== 'sourced' && e.status !== 'owner-verified') fails.push(`sign[${i}].status invalid`);
});

// 2. Safety register — targets CLAIMS about the person, not archetypal vocabulary.
// Mythic "healer/healing" (Ashwini) and "abundance/wealth" (Dhanishta) as symbolism
// are allowed; predictive / guaranteed / afflictive constructions are not.
const BANNED = [
  { name: 'health/medical', re: /\b(diabet|cancer|tumou?r|asthma|arthrit|infertil|miscarriage|depress(?:ion|ive)|schizophreni|chronic (?:illness|disease)|diagnos|you will (?:fall ill|get sick)|prone to (?:illness|disease))/i },
  { name: 'death/lifespan', re: /\b(death|dying|premature (?:death|end)|life ?span|longevity|short[- ](?:lived|life)|early demise|how long (?:you|they) (?:will )?live)\b/i },
  { name: 'guaranteed money', re: /\b(guarantee\w*|assured (?:wealth|riches)|will (?:surely|certainly|definitely) (?:be|become) (?:rich|wealthy)|you will (?:be|become) (?:rich|wealthy)|destined to (?:be|become) (?:rich|wealthy))\b/i },
  { name: 'marriage prediction', re: /\b(will (?:marry|divorce)|marriage (?:will|is destined|is delayed|is denied)|denied marriage|delayed marriage|two marriages|widow(?:hood)?|your spouse will)\b/i },
  { name: 'fear/pressure', re: /\b(unless you (?:perform|do|wear|remedy)|beware|doomed|cursed?|calamity will|misfortune will)\b/i },
  { name: 'body-shaming', re: /\b(ugly|unattractive|obese|overweight|too (?:fat|thin)|blemished skin|dark[- ]skinned as (?:inferior|unlucky)|fair[- ]skinned as (?:superior|better))\b/i },
];
// Devanagari equivalents — the copy is bilingual, so a harmful claim written only
// in Hindi must fail too. `\b` is ASCII-only, so these are phrase-anchored instead,
// and deliberately avoid words the tradition uses innocently: कर्क (Cancer the
// *sign*), धनु/धनिष्ठा (contain धन), समृद्धि (archetypal abundance) are NOT banned —
// only predictive/afflictive constructions are.
const BANNED_HI = [
  { name: 'health/medical (hi)', re: /(मधुमेह|कैंसर|कर्क\s*रोग|रोगग्रस्त|बीमार\s*पड़(?:ेंगे|ेगा|ेगी)|रोगी\s*(?:होंगे|रहेंगे))/ },
  { name: 'death/lifespan (hi)', re: /(मृत्यु|मौत|अकाल\s*मृत्यु|अल्पायु|दीर्घायु|आयुष्य)/ },
  { name: 'guaranteed money (hi)', re: /(निश्चित\s*रूप\s*से\s*धन|अवश्य\s*(?:धनी|धनवान)|धन(?:वान|ी)\s*(?:होंगे|बनेंगे)|धन\s*की\s*गारंटी)/ },
  { name: 'marriage prediction (hi)', re: /(विवाह\s*(?:होगा|होगी|में\s*बाधा)|शादी\s*होगी|तलाक|विधवा)/ },
  { name: 'fear/pressure (hi)', re: /(शापित|अभिशप्त|अनिष्ट\s*होगा|दुर्भाग्य\s*(?:होगा|आएगा))/ },
  { name: 'body-shaming (hi)', re: /(कुरूप|बदसूरत|भद्दा|मोटापा|मोटा\s|मोटी\s)/ },
];
const ALL_BANNED = BANNED.concat(BANNED_HI);
const scan = (where, o) => { if (!o) return; for (const l of LANGS) { const s = String(o[l] || ''); for (const b of ALL_BANNED) if (b.re.test(s)) fails.push(`${where}.${l}: ${b.name} — "${s.slice(0, 60)}"`); } };
(NAKSHATRA_TRAITS || []).forEach((e, i) => { scan(`nak[${i}].nature`, e.nature); scan(`nak[${i}].strengths`, e.strengths); });
(SIGN_TRAITS || []).forEach((e, i) => { for (const f of ['mind', 'relating', 'work', 'outward']) scan(`sign[${i}].${f}`, e[f]); });

// 3. buildLifeReading behaviour
const sample = buildLifeReading({ nak: 0, moonSign: 0, ascSign: 3 });
if (!Array.isArray(sample) || sample.length !== 6) fails.push(`buildLifeReading must return 6 areas, got ${sample && sample.length}`);
else {
  if (sample.map((a) => a.areaKey).join(',') !== 'nature,mind,strengths,relating,work,outward') fails.push('buildLifeReading area order wrong');
  if (SIGN_TRAITS[3] && sample[5].text.en !== SIGN_TRAITS[3].outward.en) fails.push('outward not read from ascSign');
  if (SIGN_TRAITS[0] && sample[1].text.en !== SIGN_TRAITS[0].mind.en) fails.push('mind not read from moonSign');
}
// out-of-range indices must return [] (not throw, not a partial reading)
const oob = buildLifeReading({ nak: 99, moonSign: 0, ascSign: 0 });
if (!Array.isArray(oob) || oob.length !== 0) fails.push(`buildLifeReading out-of-range must return [], got ${oob && oob.length}`);

// 4. Non-vacuous self-tests — in BOTH languages, both directions.
const mustMatch = [
  'you will suffer from diabetes', 'indicates a short life', 'you will surely become rich',
  'your marriage will fail', 'misfortune will follow unless you wear a gem', 'you are ugly and overweight',
  // Devanagari: the same harmful claims written only in Hindi must also be caught
  'आपको मधुमेह होगा', 'यह अल्पायु का योग है', 'आप अवश्य धनवान बनेंगे',
  'आपका विवाह होगा फिर तलाक', 'दुर्भाग्य आएगा', 'आप कुरूप और मोटा हैं',
];
const mustNot = [
  'healing instincts and a gift for fresh starts', 'the tradition links this star to abundance and music',
  'diplomatic, drawn to partnership and fairness',
  // Devanagari archetypal copy that must NOT be flagged: divine physicians, abundance, the Cancer *sign*
  'शास्त्र अश्विनी को अश्विनी कुमारों — देव-वैद्यों — से जोड़ते हैं',
  'परम्परा धनिष्ठा को समृद्धि व प्रवाह के प्रतीकत्व से जोड़ती है',
  'कर्क में चन्द्र होने पर गहन-संवेदनशील मन का वर्णन',
];
for (const s of mustMatch) if (!ALL_BANNED.some((b) => b.re.test(s))) fails.push(`SELFTEST: banned string slipped through: "${s}"`);
for (const s of mustNot) { const h = ALL_BANNED.find((b) => b.re.test(s)); if (h) fails.push(`SELFTEST: good string wrongly flagged (${h.name}): "${s}"`); }

if (fails.length) {
  console.error(`✗ life-interpretation-copy: ${fails.length} issue(s):`);
  for (const f of fails.slice(0, 40)) console.error('   ' + f);
  process.exit(1);
}
console.log('✓ life-interpretation-copy PASSED — 27 nakshatra + 12 sign entries complete & safe (en+hi register); buildLifeReading contract locked; guards non-vacuous both languages');
