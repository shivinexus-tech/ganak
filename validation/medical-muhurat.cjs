#!/usr/bin/env node
'use strict';

/* Gate for the elective / clinician-approved-procedure ("medical") Muhurat v1.
   Deliberately DEDICATED — it does not touch the benefic muhurat.ts rules.
   v1 is the conservative Option-C screen (owner 2026-07-25): the only timing
   factors it ACTS on are the universally-agreed avoidances —
     - Purnima (full moon)  — classical fluid-loss / hemorrhage caution
     - Amavasya (new moon)
   Excluding both syzygies also covers every eclipse day (solar eclipses fall on
   Amavasya, lunar on Purnima), so no separate eclipse coupling is needed.
   The krura-karma "sharp nakshatra / Rikta tithi" doctrine is surfaced only as an
   honest read-only tradition note (copy), never as a prescribed date — so this gate
   asserts the engine never recommends by those inverted factors. */

const { loadApp } = require('./_load-app.cjs');
const { medicalMuhuratScan, medicalMuhuratClean, natalMoonSign } = loadApp('src/engine/medical-muhurat.ts');
const {
  MEDICAL_SAFETY, MEDICAL_TRADITION_NOTE, MEDICAL_INTRO, MEDICAL_NATAL_HINT,
  MEDICAL_JANMA, MEDICAL_NATAL_UNCONFIRMED, MEDICAL_NO_SOLAR_DATA,
} = loadApp('src/data/medical-muhurat-ui.ts');
const fs = require('fs');

const DELHI = { label: 'New Delhi', lat: 28.6139, lon: 77.2090, zone: 'Asia/Kolkata' };
const LONDON = { label: 'London', lat: 51.5074, lon: -0.1278, zone: 'Europe/London' };
const NEW_YORK = { label: 'New York', lat: 40.7128, lon: -74.0060, zone: 'America/New_York' };
const SYDNEY = { label: 'Sydney', lat: -33.8688, lon: 151.2093, zone: 'Australia/Sydney' };
const TROMSO = { label: 'Tromsø', lat: 69.6492, lon: 18.9553, zone: 'Europe/Oslo' };
let failures = 0;
const fail = (m) => { failures++; console.error('FAIL ' + m); };
const pad = (n) => String(n).padStart(2, '0');
const ymd = (y, m, d) => ({ y, m, d });
const key = (r) => `${r.y}-${pad(r.m)}-${pad(r.day)}`;
const localMinutes = (ms, tz) => {
  const d = new Date(ms + tz * 3600000);
  return d.getUTCHours() * 60 + d.getUTCMinutes();
};
const nearMinutes = (actual, expected, tolerance, message) => {
  if (Math.abs(actual - expected) > tolerance) fail(`${message}: expected ${expected}±${tolerance} minutes, got ${actual}`);
};

const scan = medicalMuhuratScan(DELHI, 'lahiri', ymd(2026, 1, 16), ymd(2026, 3, 5));
const byDate = Object.fromEntries(scan.map((r) => [key(r), r]));

// --- Independent Drik Panchang New Delhi 2026 anchors (captured 2026-07-25) ---
// Purnima: 2026-02-01, 2026-03-03 · Amavasya: 2026-01-18, 2026-02-17.
// ±1-day tolerance: "which civil day owns a tithi" varies by up to a day between
// the sunrise convention and Drik's festival-dating; the engine flags the day the
// syzygy actually occurs, which must land within one day of Drik's listed date.
const near = (dateStr, reason) => {
  const t = Date.parse(dateStr + 'T00:00:00Z');
  const cand = [t - 864e5, t, t + 864e5].map((ms) => {
    const d = new Date(ms); return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
  });
  const hit = cand.some((ds) => byDate[ds] && byDate[ds].clean === false && byDate[ds].reason === reason);
  if (!hit) fail(`${reason} not flagged within ±1 day of ${dateStr}`);
};
near('2026-02-01', 'purnima');
near('2026-03-03', 'purnima');
near('2026-01-18', 'amavasya');
near('2026-02-17', 'amavasya');

// --- Structural invariants (must hold for every day) ---
for (const r of scan) {
  if (r.clean) {
    if (r.tithiNum === 15) fail(`${key(r)}: a "clean" day is tithi 15 (syzygy must be excluded)`);
    if (r.reason !== null) fail(`${key(r)}: clean day carries reason ${r.reason}`);
    if (!(r.rahu && r.rahu.start < r.rahu.end)) fail(`${key(r)}: clean day missing a valid Rahu Kaal window`);
    if (r.dow !== 3) { // Abhijit is void on Wednesday by classical rule
      if (!(r.abhijit && r.abhijit.start < r.abhijit.end)) fail(`${key(r)}: clean non-Wed day missing Abhijit`);
      if (r.abhijit && !(r.rise <= r.abhijit.start && r.abhijit.end <= r.set)) fail(`${key(r)}: Abhijit falls outside daylight`);
    }
  } else {
    if (!['purnima', 'amavasya'].includes(r.reason)) fail(`${key(r)}: excluded with unexpected reason ${r.reason}`);
    // the only exclusions v1 makes are the two syzygies — both are tithi 15
    if (r.tithiNum !== 15) fail(`${key(r)}: excluded (${r.reason}) but not tithi 15 — v1 must not exclude on any other factor`);
    if (r.reason === 'purnima' && r.krishna) fail(`${key(r)}: purnima flagged on krishna paksha`);
    if (r.reason === 'amavasya' && !r.krishna) fail(`${key(r)}: amavasya flagged on shukla paksha`);
  }
}
if (!scan.some((r) => r.reason === 'purnima')) fail('no Purnima excluded across a ~7-week range');
if (!scan.some((r) => r.reason === 'amavasya')) fail('no Amavasya excluded across a ~7-week range');

// --- medicalMuhuratClean filters to clean days only ---
const clean = medicalMuhuratClean(DELHI, 'lahiri', ymd(2026, 2, 9), ymd(2026, 2, 15));
if (clean.length === 0) fail('no clean days found in a full-moon-free week');
if (clean.some((r) => !r.clean)) fail('medicalMuhuratClean returned a non-clean day');

// --- Determinism ---
const a = JSON.stringify(medicalMuhuratScan(DELHI, 'lahiri', ymd(2026, 2, 9), ymd(2026, 2, 15)));
const b = JSON.stringify(medicalMuhuratScan(DELHI, 'lahiri', ymd(2026, 2, 9), ymd(2026, 2, 15)));
if (a !== b) fail('scan is not deterministic for identical inputs');

// --- Independent adversarial coverage: DST, polar days and range boundaries -------
// Drik Panchang London, 2026-03-29 (DST starts that day): sunrise 06:43,
// Abhijit 12:40–13:31. The engine may differ by one minute due to rounding.
const londonDst = medicalMuhuratScan(LONDON, 'lahiri', ymd(2026, 3, 29), ymd(2026, 3, 29))[0];
if (!londonDst) fail('London DST-transition day returned no result');
else {
  if (londonDst.tz !== 1) fail(`London 2026-03-29 expected DST offset +1, got ${londonDst.tz}`);
  nearMinutes(localMinutes(londonDst.rise, londonDst.tz), 6 * 60 + 43, 2, 'London DST sunrise');
  nearMinutes(localMinutes(londonDst.abhijit.start, londonDst.tz), 12 * 60 + 40, 2, 'London DST Abhijit start');
  nearMinutes(localMinutes(londonDst.abhijit.end, londonDst.tz), 13 * 60 + 31, 2, 'London DST Abhijit end');
}
const nyWinter = medicalMuhuratScan(NEW_YORK, 'lahiri', ymd(2026, 12, 21), ymd(2026, 12, 21))[0];
if (!nyWinter || nyWinter.tz !== -5) fail(`New York winter offset expected -5, got ${nyWinter?.tz}`);
const sydneySummer = medicalMuhuratScan(SYDNEY, 'lahiri', ymd(2026, 12, 21), ymd(2026, 12, 21))[0];
if (!sydneySummer || sydneySummer.tz !== 11) fail(`Sydney summer offset expected +11, got ${sydneySummer?.tz}`);
if (medicalMuhuratScan(TROMSO, 'lahiri', ymd(2026, 6, 21), ymd(2026, 6, 21)).length !== 0) {
  fail('Tromsø midnight-sun day should be skipped because there is no sunrise/sunset pair');
}
if (medicalMuhuratScan(LONDON, 'lahiri', ymd(2026, 12, 31), ymd(2026, 12, 31)).length !== 1) fail('from==to must return one day');
if (medicalMuhuratScan(LONDON, 'lahiri', ymd(2027, 1, 2), ymd(2026, 12, 31)).length !== 0) fail('from>to must return no days');
const yearBoundary = medicalMuhuratScan(LONDON, 'lahiri', ymd(2026, 12, 30), ymd(2027, 1, 2));
if (yearBoundary.length !== 4 || key(yearBoundary[0]) !== '2026-12-30' || key(yearBoundary[3]) !== '2027-01-02') {
  fail('year-boundary scan must preserve all four civil dates');
}

// --- Safety copy: bilingual, and actually says the required things ---
if (!MEDICAL_SAFETY?.en || !MEDICAL_SAFETY?.hi) fail('missing bilingual safety wall');
if (!MEDICAL_TRADITION_NOTE?.en || !MEDICAL_TRADITION_NOTE?.hi) fail('missing bilingual tradition note');
if (!MEDICAL_INTRO?.en || !MEDICAL_INTRO?.hi) fail('missing bilingual intro');
if (MEDICAL_SAFETY?.en && !/not medical advice/i.test(MEDICAL_SAFETY.en)) fail('EN safety wall must say "not medical advice"');
if (MEDICAL_SAFETY?.en && !/emergency|urgent/i.test(MEDICAL_SAFETY.en)) fail('EN safety wall must address emergency/urgent care');
if (MEDICAL_SAFETY?.en && !/doctor|clinician|hospital|medical team/i.test(MEDICAL_SAFETY.en)) fail('EN safety wall must defer to the clinician/hospital');
if (MEDICAL_SAFETY?.hi && !/चिकित्सा सलाह नहीं/.test(MEDICAL_SAFETY.hi)) fail('HI safety wall must say यह चिकित्सा सलाह नहीं');
if (MEDICAL_SAFETY?.hi && !/आपात|तत्काल/.test(MEDICAL_SAFETY.hi)) fail('HI safety wall must address आपात/तत्काल care');
// The product must never claim to improve medical outcomes.
const outcomeClaim = /(improves?|increases?|better|guarantee\w*)\s+(surgical\s+)?(success|outcome|recovery|survival|safety)/i;
for (const [k, v] of Object.entries({ MEDICAL_INTRO, MEDICAL_TRADITION_NOTE })) {
  for (const lang of ['en', 'hi']) {
    if (v?.[lang] && outcomeClaim.test(v[lang])) fail(`${k}.${lang} makes a medical-outcome claim`);
  }
}

// --- R10: OPTIONAL natal (Janma Rashi) overlay ---------------------------------
// The no-natal path above must be untouched (v1 behaviour). Natal is opt-in only.
// Without a natal sign, no day is ever flagged janmaRashi.
for (const r of scan) {
  if (typeof r.moonSign !== 'number' || r.moonSign < 0 || r.moonSign > 11) fail(`${key(r)}: moonSign out of range (${r.moonSign})`);
  if (r.janmaRashi !== false) fail(`${key(r)}: janmaRashi must be false when no natal sign is supplied`);
}

// natalMoonSign returns a valid rashi 0..11 and is deterministic.
const birth = { y: 1990, m: 6, day: 15, hh: 8, mi: 30 };
const ns1 = natalMoonSign(DELHI, 'lahiri', birth);
const ns2 = natalMoonSign(DELHI, 'lahiri', birth);
if (typeof ns1 !== 'number' || ns1 < 0 || ns1 > 11) fail(`natalMoonSign out of range (${ns1})`);
if (ns1 !== ns2) fail('natalMoonSign not deterministic');

// Independent-ish anchor: at New Delhi sunrise on 2026-02-01 the Moon is in Pushya,
// which lies wholly within Cancer (rashi index 3). The engine's own moonSign for that
// day must therefore be Cancer, and a birth near that sunrise resolves to Cancer too.
const feb1 = medicalMuhuratScan(DELHI, 'lahiri', ymd(2026, 2, 1), ymd(2026, 2, 1))[0];
if (feb1.nakName !== 'Pushya') fail(`2026-02-01 expected Pushya nakshatra, got ${feb1.nakName}`);
if (feb1.moonSign !== 3) fail(`2026-02-01 expected Moon in Cancer (3), got ${feb1.moonSign}`);
if (natalMoonSign(DELHI, 'lahiri', { y: 2026, m: 2, day: 1, hh: 6, mi: 30 }) !== 3) fail('natal birth near 2026-02-01 sunrise should resolve to Cancer (3)');

// With a natal sign supplied, exactly the days whose sunrise Moon sits in that sign
// are flagged janmaRashi; all others are not. Syzygy exclusion is unaffected.
const natal = medicalMuhuratScan(DELHI, 'lahiri', ymd(2026, 2, 1), ymd(2026, 3, 5), 3); // Cancer
let janmaCount = 0;
for (const r of natal) {
  const expect = r.moonSign === 3;
  if (r.janmaRashi !== expect) fail(`${key(r)}: janmaRashi ${r.janmaRashi} but moonSign ${r.moonSign} vs natal 3`);
  if (r.janmaRashi) janmaCount++;
  if (r.reason !== null && !['purnima', 'amavasya'].includes(r.reason)) fail(`${key(r)}: natal overlay must not change the syzygy reason (${r.reason})`);
}
if (janmaCount === 0) fail('natal overlay flagged no Janma Rashi days across a ~5-week range');

// medicalMuhuratClean must drop Janma Rashi days when a natal sign is active.
const cleanNatal = medicalMuhuratClean(DELHI, 'lahiri', ymd(2026, 2, 1), ymd(2026, 3, 5), 3);
if (cleanNatal.some((r) => r.janmaRashi)) fail('medicalMuhuratClean returned a Janma Rashi day when natal is active');
if (cleanNatal.some((r) => !r.clean)) fail('medicalMuhuratClean returned a syzygy day');

// Natal copy: bilingual, and no medical-outcome claim.
if (!MEDICAL_NATAL_HINT?.en || !MEDICAL_NATAL_HINT?.hi) fail('missing bilingual natal hint');
if (!MEDICAL_JANMA?.en || !MEDICAL_JANMA?.hi) fail('missing bilingual Janma Rashi label');
if (!MEDICAL_NATAL_UNCONFIRMED?.en || !MEDICAL_NATAL_UNCONFIRMED?.hi) fail('missing bilingual natal-unconfirmed hint (F3)');
if (!MEDICAL_NO_SOLAR_DATA?.en || !MEDICAL_NO_SOLAR_DATA?.hi) fail('missing bilingual no-sunrise/no-sunset result copy');
if (MEDICAL_NATAL_HINT?.en && !/optional/i.test(MEDICAL_NATAL_HINT.en)) fail('natal hint must state it is optional');
if (MEDICAL_NATAL_HINT?.en && !/stored|store/i.test(MEDICAL_NATAL_HINT.en)) fail('natal hint must address that birth details are not stored');
for (const [k, v] of Object.entries({ MEDICAL_NATAL_HINT, MEDICAL_JANMA })) {
  for (const lang of ['en', 'hi']) {
    if (v?.[lang] && outcomeClaim.test(v[lang])) fail(`${k}.${lang} makes a medical-outcome claim`);
  }
}

// --- UI safety and bypass guards ---------------------------------------------------
const screenSource = fs.readFileSync('src/screens/MedicalMuhuratScreen.tsx', 'utf8');
const safetyRender = screenSource.indexOf('{bi(MEDICAL_SAFETY)}');
const introRender = screenSource.indexOf('{bi(MEDICAL_INTRO)}');
if (safetyRender < 0 || introRender < 0 || safetyRender > introRender) {
  fail('safety wall must render before the astrological intro');
}
if (!/birthDate\s*>\s*todayStr/.test(screenSource)) {
  fail('UI must reject a future birth date even when the input max is bypassed');
}
if (!/result\.length\s*===\s*0[\s\S]{0,300}MEDICAL_NO_SOLAR_DATA/.test(screenSource)) {
  fail('zero calculable solar days must use dedicated no-sunrise/no-sunset copy');
}

if (failures) { console.error(`\n✗ medical-muhurat FAILED (${failures})`); process.exit(1); }
console.log('✓ medical-muhurat PASSED (conservative syzygy-avoidance scan, Drik-anchored ±1d, bilingual safety copy, no outcome claims)');
