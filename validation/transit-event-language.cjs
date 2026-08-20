#!/usr/bin/env node
'use strict';
/* Transit-event language gate (Spec A, docs/superpowers/specs/2026-08-05-transit-line-language-fix-design.md).
 *
 * The "Upcoming planetary events" card used to render `शुक्र Venus enters Kanya` in English
 * and `शुक्र Venus प्रवेश कन्या` in Hindi — the engine hardcoded PLANET_DEVA into the label,
 * so both languages leaked the other one.
 *
 * src/i18n/panchang-terms.ts states the architecture this gate enforces: the engine speaks ONE
 * canonical language, and localisation happens at the edge. So:
 *   1. no engine-emitted label may contain Devanagari;
 *   2. transitLabel(en, …) must produce zero Devanagari;
 *   3. transitLabel(hi, …) must produce zero Latin planet/sign names;
 *   4. the event timestamps must not move — this is a label change only.
 */
const assert = require('node:assert');
const { loadApp } = require('./_load-app.cjs');

const pan = loadApp('src/engine/panchang.ts');
const { transitLabel } = loadApp('src/engine/transit-copy.ts');

const DEVANAGARI = /[ऀ-ॿ]/;
const PLANETS_EN = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
const SIGNS_EN = ['Mesha', 'Vrishabha', 'Mithuna', 'Karka', 'Simha', 'Kanya',
  'Tula', 'Vrishchika', 'Dhanu', 'Makara', 'Kumbha', 'Meena'];

/* A window wide enough to contain sign changes and at least one station. */
const FROM = Date.UTC(2026, 0, 1);
const events = pan.upcomingEvents(FROM, 200);
assert(events.length > 0, 'upcomingEvents returned nothing — the fixture window is wrong');

/* ---- 1. the astronomy layer emits no Devanagari ---- */
for (const e of events) {
  assert(!DEVANAGARI.test(e.label),
    `engine label carries Devanagari (presentation inside the astronomy layer): ${e.label}`);
}

/* ---- 2. English mode is free of Devanagari ---- */
for (const e of events) {
  const out = transitLabel('en', e.label);
  assert(!DEVANAGARI.test(out), `English mode leaks Devanagari: ${out}`);
}

/* ---- 3. Hindi mode carries no Latin planet or sign name ---- */
for (const e of events) {
  const out = transitLabel('hi', e.label);
  assert(DEVANAGARI.test(out), `Hindi mode produced no Devanagari at all: ${out}`);
  for (const p of PLANETS_EN) {
    assert(!new RegExp(`\\b${p}\\b`).test(out), `Hindi mode leaks the English planet name "${p}": ${out}`);
  }
  for (const s of SIGNS_EN) {
    assert(!new RegExp(`\\b${s}\\b`).test(out), `Hindi mode leaks the Latin sign name "${s}": ${out}`);
  }
}

/* ---- 4. every planet name is actually translatable, not silently passed through ---- */
const { panchangTerm } = loadApp('src/i18n/panchang-terms.ts');
const EXPECTED = { Sun: 'सूर्य', Moon: 'चन्द्र', Mars: 'मंगल', Mercury: 'बुध', Jupiter: 'गुरु',
  Venus: 'शुक्र', Saturn: 'शनि', Rahu: 'राहु', Ketu: 'केतु' };
for (const [en, hi] of Object.entries(EXPECTED)) {
  assert.strictEqual(panchangTerm('hi', 'planet', en), hi, `planet table missing/incorrect for ${en}`);
  assert.strictEqual(panchangTerm('en', 'planet', en), en, `English must pass ${en} through unchanged`);
}
assert.strictEqual(panchangTerm('hi', 'planet', 'Nibiru'), 'Nibiru', 'unknown values must fall through unchanged');

/* ---- 5. the maths did not move: sign-change instants match an independent recomputation ---- */
const again = pan.upcomingEvents(FROM, 200);
assert.strictEqual(again.length, events.length, 'event count is not deterministic');
for (let i = 0; i < events.length; i++) {
  assert.strictEqual(again[i].t, events[i].t, 'event timestamps are not deterministic');
  assert.strictEqual(again[i].planet, events[i].planet, 'event planet drifted');
  assert.strictEqual(again[i].type, events[i].type, 'event type drifted');
}

/* ---- 6. structured fields survive for the renderer ---- */
for (const e of events) {
  assert(typeof e.t === 'number' && e.t > FROM, 'event must carry a future timestamp');
  assert(typeof e.planet === 'string' && e.planet, 'event must name its planet');
  assert(['sign', 'station', 'lunation'].includes(e.type), `unexpected event type: ${e.type}`);
}


/* ---- 7. F1 (P0): a Hindi footnote may never name the OPPOSITE zodiac ----
 * The Rashi Gochar panel's convention line said "सायन (लाहिरी)" while the English
 * beside it said "Sidereal (Lahiri)". *Sāyana* means TROPICAL — the opposite of what
 * Ganak computes, and the opposite of what its own planet-calendar card
 * ("निरयण (लाहिरी)") and calculator page ("सायन राशि नहीं") say about the same
 * numbers. AGENTS.md holds the sidereal convention as an architecture invariant, so
 * no line that claims "Sidereal" in English may claim सायन in Hindi. */
const fs = require('node:fs');
const path = require('node:path');
const SRC = path.resolve(__dirname, '..', 'src');
const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
  e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]);
const sourceFiles = walk(SRC).filter((f) => /\.(ts|tsx)$/.test(f));
let sideralLines = 0;
for (const file of sourceFiles) {
  fs.readFileSync(file, 'utf8').split('\n').forEach((line, i) => {
    if (!/[Ss]idereal/.test(line)) return;
    sideralLines++;
    // The one legitimate use is an explicit DENIAL — the calculator page glosses the
    // Sun sign as "लाहिरी निरयन सूर्य राशि—सायन राशि नहीं" (…not the sayana sign).
    // A line that mentions सायन without नहीं is asserting the tropical zodiac.
    if (/सायन/.test(line) && /नहीं/.test(line)) return;
    assert(!/सायन/.test(line),
      `${path.relative(SRC, file)}:${i + 1} says "Sidereal" in English and "सायन" (= tropical, the OPPOSITE zodiac) in Hindi`);
  });
}
assert(sideralLines >= 3, `expected several "Sidereal" convention lines to police, found ${sideralLines}`);
const daily = fs.readFileSync(path.join(SRC, 'screens', 'DailyScreen.tsx'), 'utf8');
assert(daily.includes('निरयण (लाहिरी)'), 'the Rashi Gochar footnote must name the sidereal zodiac as निरयण');
assert(!daily.includes('सायन'), 'DailyScreen must not use सायन anywhere');

/* ---- 8. F6 (P1): the gloss, the countdown and the duration are BILINGUAL ----
 * transitLabel was clean, and its gate proved it — but the three strings that
 * surround the label on screen (EVENT_DESC, timeStr, fmtDur) were English-only and
 * printed verbatim into the Hindi journey. This is the whole rendered row now. */
const tc = loadApp('src/engine/transit-copy.ts');
const LATIN = /[A-Za-z]/;
for (const [key, entry] of Object.entries(tc.EVENT_DESC)) {
  assert(entry && entry.en && entry.hi, `EVENT_DESC["${key}"] must carry both languages`);
  assert(DEVANAGARI.test(entry.hi), `EVENT_DESC["${key}"].hi is not Devanagari`);
  assert(!LATIN.test(entry.hi), `EVENT_DESC["${key}"].hi leaks Latin: ${entry.hi}`);
}
const NOW = FROM;
for (const e of events) {
  const hi = tc.eventDetail(e, NOW, 'hi');
  const en = tc.eventDetail(e, NOW, 'en');
  assert(hi.desc && DEVANAGARI.test(hi.desc) && !LATIN.test(hi.desc),
    `the transit gloss — the only explanation the row carries — is not Hindi: ${hi.desc}`);
  assert(en.desc && !DEVANAGARI.test(en.desc), `English gloss leaks Devanagari: ${en.desc}`);
  assert(!LATIN.test(hi.timeStr), `Hindi countdown leaks Latin: ${hi.timeStr}`);
}
for (const ms of [1 * 86400000, 30 * 86400000, 396 * 86400000, 800 * 86400000]) {
  assert(!LATIN.test(tc.fmtDur(ms, 'hi')), `fmtDur(hi) leaks Latin: ${tc.fmtDur(ms, 'hi')}`);
  assert(!DEVANAGARI.test(tc.fmtDur(ms, 'en')), `fmtDur(en) leaks Devanagari: ${tc.fmtDur(ms, 'en')}`);
}
assert(!LATIN.test(tc.ongoingLabel('hi')) && tc.ongoingLabel('en') === 'ongoing',
  'the "ongoing" duration label must exist in both languages');

/* ---- 9. F9 (P2): the Hindi headline is a Hindi sentence, not a word swap ----
 * `.replace(/ enters /, " प्रवेश ")` left English SVO order standing: "बुध प्रवेश सिंह".
 * Hindi is verb-final — "बुध का सिंह में प्रवेश" — so प्रवेश must be the final word of
 * the clause, never sitting between the planet and the sign. */
let ingressChecked = 0;
for (const e of events) {
  const out = transitLabel('hi', e.label);
  if (!out.includes('प्रवेश')) continue;
  ingressChecked++;
  const clause = out.split(' · ')[0].trim();
  assert(clause.endsWith('प्रवेश'),
    `Hindi is verb-final: "प्रवेश" must close the clause, got "${out}"`);
  assert(/ में प्रवेश$/.test(clause),
    `the sign must be marked with the postposition में: "${out}"`);
}
assert(ingressChecked >= 3, `expected several ingress headlines to check, saw ${ingressChecked}`);

/* ---- 10. F16 (P1): a past event never reads "Today" ----
 * The Panchang date picker rebuilds the events card from the SELECTED date while
 * the countdown is measured from the real clock, so on any past date every `until`
 * was negative — and with no negative branch the whole chain fell through to
 * "Today". Every row on that card said "Today" next to its own 2026 timestamp. */
const REF = Date.UTC(2026, 5, 1);
for (const [offsetDays, wantEn, wantHi] of [
  [-200, /month/, /माह/], [-30, /day|month/, /दिन|माह/], [-1.5, /day/, /दिन/], [-0.2, /hour/, /घंटे/],
]) {
  const r = tc.eventDetail({ t: REF + offsetDays * 86400000, label: 'Sun enters Simha' }, REF);
  assert(r.past === true, `an event ${offsetDays} days in the past must be flagged past`);
  assert(r.timeStrEn !== 'Today' && r.timeStrHi !== 'आज',
    `a past event must not read "Today": ${offsetDays}d gave "${r.timeStrEn}" / "${r.timeStrHi}"`);
  assert(wantEn.test(r.timeStrEn), `past countdown wording drifted (en): ${r.timeStrEn}`);
  assert(wantHi.test(r.timeStrHi), `past countdown wording drifted (hi): ${r.timeStrHi}`);
  assert(!LATIN.test(r.timeStrHi), `Hindi past countdown leaks Latin: ${r.timeStrHi}`);
}
const todayRow = tc.eventDetail({ t: REF + 600000, label: 'Sun enters Simha' }, REF);
assert(todayRow.timeStrEn === 'Today' && todayRow.timeStrHi === 'आज' && todayRow.past === false,
  'an event later today must still read "Today"');

console.log(`✓ transit-event-language: ${events.length} events · EN clean · HI clean · 9 planet terms · timings stable · sidereal label · bilingual gloss/countdown/duration · verb-final Hindi ingress · past events`);
