#!/usr/bin/env node
// Computes Tier-1 festival dates and fails when a sourced regression anchor
// moves. The longer listing remains useful for human review of new coverage.
'use strict';
// Loads the app via esbuild bundling so this gate keeps working once src/ is
// split into modules (see validation/_load-app.cjs).
const { loadApp } = require('./_load-app.cjs');
const app = loadApp();

// scan Jan 1 2026 → ~14 months, IST
const IST = 5.5;
const DELHI = { zone: 'Asia/Kolkata', lat: 28.6139, lon: 77.2090 };
const from = Date.UTC(2026, 0, 1) - IST * 3600000;
const cal = app.scanPanchangCalendar(from, IST, 430, 46, DELHI);
const fmt = (ms) => new Date(ms + IST * 3600000).toISOString().slice(0, 10);
const SOLAR_NEW = ['thaipusam','panguniUthiram','vishu','onam','karthigaiDeepam','ayyappaMandalaBegins','ayyappaMandalaPuja'];
const NEW = ['lakshmiPanchami','buddhaPurnima','guptNavratriAshadha','rathYatra','hariyaliTeej','nagPanchami','hartalikaTeej','radhaAshtami','mahaAshtami','mahaNavami','sharadPurnima','ahoiAshtami','guptNavratriMagha','vasantPanchami','sheetlaAshtami', ...SOLAR_NEW];
const KNOWN = {
  vasantPanchami: '2026-01-23', mahaShivaratri: '2026-02-15', sheetlaAshtami: '~8 days after Holi (Mar 2026)',
  buddhaPurnima: '2026-05-01', rathYatra: '2026-07-16', hariyaliTeej: '2026-08-15', nagPanchami: '2026-08-17',
  hartalikaTeej: '2026-09-14 (Udaya rule — FIXED)', radhaAshtami: '2026-09-19', sharadPurnima: '2026-10-25', ahoiAshtami: '2026-11-01', vasantPanchami2: 'Magha Shukla 5',
};
console.log('New Tier-1 festival dates computed for 2026 (verify against Drik):\n');
const seen = {};
for (const f of cal.festivals) {
  if (!NEW.includes(f.key)) continue;
  if (seen[f.key]) continue; seen[f.key] = 1;
  const nm = app.FEST_NAME[f.key] ? app.FEST_NAME[f.key].en : f.key;
  const known = KNOWN[f.key] ? '   (expected ~' + KNOWN[f.key] + ')' : '';
  console.log('  ' + fmt(f.ms) + '  ' + nm + known);
}
console.log('\nMissing (did not fire in scan window):');
for (const k of NEW) if (!seen[k]) console.log('  ✗ ' + k);

const SOLAR_EXPECTED = {
  thaipusam: '2026-02-01',
  panguniUthiram: '2026-04-01',
  vishu: '2026-04-15',
  onam: '2026-08-26',
  karthigaiDeepam: '2026-11-24',
  ayyappaMandalaBegins: '2026-11-17',
  ayyappaMandalaPuja: '2026-12-27',
};
console.log('\nTier-2 solar/nakshatra anchors (IST, Drik/Sabarimala 2026):');
let solarFailures = 0;
for (const key of SOLAR_NEW) {
  const hit = cal.festivals.find((f) => f.key === key);
  const got = hit ? fmt(hit.ms) : 'missing';
  const ok = got === SOLAR_EXPECTED[key];
  const ingressNote = hit && hit.ingress ? ` · ingress ${new Date(hit.ingress + IST * 3600000).toISOString().slice(0, 16).replace('T', ' ')} IST` : '';
  console.log(`  ${ok ? '✓' : '✗'} ${key}: ${got} (expected ${SOLAR_EXPECTED[key]})${ingressNote}`);
  if (!ok) solarFailures++;
}
if (solarFailures) {
  console.error(`\n✗ ${solarFailures} Tier-2 solar/nakshatra anchor(s) failed`);
  process.exitCode = 1;
} else {
  console.log('\n✓ 7/7 Tier-2 solar/nakshatra anchors match');
}

// Day-part anchors (hard pass/fail): boundary cases where a noon/sunrise-only
// scanner is wrong. Delhi coordinates are passed so kala use real rise/set/moonrise.
console.log('\nFestival day-part anchors (New Delhi 2026):');
const dpAnchors = {
  holika: '2026-03-03',
  rangwaliHoli: '2026-03-04',
  akshaya: '2026-04-19',
  rathYatra: '2026-07-16',
  rakshaBandhan: '2026-08-28',
  janmashtami: '2026-09-04',
  hartalikaTeej: '2026-09-14',
  radhaAshtami: '2026-09-19',
  mahaAshtami: '2026-10-19',
  mahaNavami: '2026-10-19',
  dussehra: '2026-10-20',
  sharadPurnima: '2026-10-25',
  karvaChauth: '2026-10-29',
  ahoiAshtami: '2026-11-01',
  diwali: '2026-11-08',
  guptNavratriAshadha: '2026-07-15',
  mahaShivaratri: '2026-02-15',
  // Chhath's four connected days. Day 3 (Sandhya Arghya) is the one resolved from
  // the panchang — Kartika Shukla Shashthi at sunset, which is the date Drik
  // publishes as "Chhath Puja". The other three are derived civil-day offsets, so
  // anchoring all four also guards the expansion against ever going non-contiguous.
  chhathNahayKhay: '2026-11-13',
  chhathKharna: '2026-11-14',
  chhathSandhyaArghya: '2026-11-15',
  chhathUshaArghya: '2026-11-16',
};
let dpFailures = 0;
for (const [key, exp] of Object.entries(dpAnchors)) {
  const hit = cal.festivals.find((f) => f.key === key);
  const got = hit ? fmt(hit.ms) : 'DID NOT FIRE';
  const ok = got === exp;
  console.log(`  ${ok ? '✓' : '✗'} ${key}: ${got} (expected ${exp})`);
  if (!ok) dpFailures++;
}
if (dpFailures) { console.error(`\n✗ ${dpFailures} day-part anchor(s) failed`); process.exitCode = 1; }
else console.log(`✓ ${Object.keys(dpAnchors).length}/${Object.keys(dpAnchors).length} festival day-part anchors match`);

const localAnchor = (y, m, d) => Date.UTC(y, m - 1, d, 12) - IST * 3600000;
const mandalaChecks = [
  ['2026-11-17', 1],
  ['2026-11-20', 4],
  ['2026-12-27', 41],
];
let mandalaFailures = 0;
for (const [iso, expectedDay] of mandalaChecks) {
  const [y, m, d] = iso.split('-').map(Number);
  const span = app.ayyappaMandalaFor(localAnchor(y, m, d), IST);
  const got = span ? span.day : null;
  const ok = got === expectedDay;
  console.log(`  ${ok ? '✓' : '✗'} Mandala ${iso}: day ${got} (expected ${expectedDay})`);
  if (!ok) mandalaFailures++;
}
const afterSpan = app.ayyappaMandalaFor(localAnchor(2026, 12, 28), IST);
if (afterSpan !== null) mandalaFailures++;
console.log(`  ${afterSpan === null ? '✓' : '✗'} Mandala 2026-12-28: outside span`);
if (mandalaFailures) process.exitCode = 1;
else console.log('✓ Ayyappa day counter and boundary checks match');
