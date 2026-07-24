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
const SOLAR_NEW = ['thaipusam','panguniUthiram','vishu','onam','karthigaiDeepam','vaikasiVisakam','aadiPooram','arudraDarshan','ayyappaMandalaBegins','ayyappaMandalaPuja'];
const NEW = ['varalakshmi','mahalakshmiVrat','kaliJayanti','kalabhairavJayanti','skandaSashtiBegins','skandaSashtiSoorasamharam','skandaSashtiThirukalyanam', ...['chaitraNavratri','sharadNavratri','gudiPadwa','ugadi','vatSavitri','vatPurnima','anantChaturdashi','kartikaPurnima','tulasiVivah','pongal','pitruPakshaBegins','sarvaPitruAmavasya','lakshmiPanchami','buddhaPurnima','guptNavratriAshadha','rathYatra','hariyaliTeej','nagPanchami','hartalikaTeej','radhaAshtami','mahaAshtami','mahaNavami','sharadPurnima','ahoiAshtami','guptNavratriMagha','vasantPanchami','sheetlaAshtami','govatsaDwadashi','dhanteras','kaliChaudas','narakChaturdashi','govardhanPuja','bhaiDooj','chhathNahayKhay','chhathKharna','chhath','chhathUshaArghya'], ...SOLAR_NEW];
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
  vaikasiVisakam: '2026-05-30',
  aadiPooram: '2026-08-14',
  arudraDarshan: '2026-12-24',
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
  console.log('\n✓ 10/10 Tier-2 solar/nakshatra anchors match');
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
  govatsaDwadashi: '2026-11-05',
  dhanteras: '2026-11-06',
  kaliChaudas: '2026-11-07',
  narakChaturdashi: '2026-11-08',
  diwali: '2026-11-08',
  govardhanPuja: '2026-11-10',
  bhaiDooj: '2026-11-11',
  chhathNahayKhay: '2026-11-13',
  chhathKharna: '2026-11-14',
  chhath: '2026-11-15',
  chhathUshaArghya: '2026-11-16',
  guptNavratriAshadha: '2026-07-15',
  mahaShivaratri: '2026-02-15',
  chaitraNavratri: '2026-03-19',
  sharadNavratri: '2026-10-11',
  gudiPadwa: '2026-03-19',
  ugadi: '2026-03-19',
  vatSavitri: '2026-05-16',
  vatPurnima: '2026-06-29',
  anantChaturdashi: '2026-09-25',
  tulasiVivah: '2026-11-21',
  kartikaPurnima: '2026-11-24',
  pongal: '2026-01-14',
  pitruPakshaBegins: '2026-09-26',
  sarvaPitruAmavasya: '2026-10-10',
  varalakshmi: '2026-08-28',
  mahalakshmiVrat: '2026-10-02',
  kaliJayanti: '2026-10-03',
  kalabhairavJayanti: '2026-12-01',
  vaikasiVisakam: '2026-05-30',
  aadiPooram: '2026-08-14',
  arudraDarshan: '2026-12-24',
  skandaSashtiBegins: '2026-11-10',
  skandaSashtiSoorasamharam: '2026-11-15',
  skandaSashtiThirukalyanam: '2026-11-16',
  lalitaJayanti: '2026-02-01',
  taraJayanti: '2026-03-26',
  matangiJayanti: '2026-04-20',
  bagalamukhiJayanti: '2026-04-24',
  chhinnamastaJayanti: '2026-04-30',
  dhumavatiJayanti: '2026-06-22',
  bhuvaneshvariJayanti: '2026-09-23',
  kamalaJayanti: '2026-11-08',
  bhairaviJayanti: '2026-12-23',
  annapurnaJayanti: '2026-12-23',
  shakambhariNavratriBegins: '2025-12-27',
  shakambhariPurnima: '2026-01-03',
  lalitaPanchami: '2026-10-15',
  kaliPuja: '2026-11-08',
  sandhiPuja: '2026-10-19',
  chaitraGhatasthapana: '2026-03-19',
  sharadGhatasthapana: '2026-10-11',
  durgaPujaMahalaya: '2026-10-10',
  durgaPujaShashthi: '2026-10-16',
  durgaPujaSaptami: '2026-10-17',
  durgaPujaAshtami: '2026-10-19',
  durgaPujaNavami: '2026-10-20',
  durgaPujaDashami: '2026-10-20',
  rathaSaptami: '2026-01-25',
  gangaDussehra: '2026-05-25',
  sakatChauth: '2026-01-06',
  mauniAmavasya: '2026-01-18',
  gangaur: '2026-03-21',
  kajariTeej: '2026-08-31',
  rishiPanchami: '2026-09-15',
  vishwakarmaPuja: '2026-09-17',
  saraswatiAvahan: '2026-10-16',
  saraswatiPuja: '2026-10-17',
  kojagaraPuja: '2026-10-25',
  vivahPanchami: '2026-12-14',
  gitaJayanti: '2026-12-20',
  parashuramaJayanti: '2026-04-19',
  sitaNavami: '2026-04-25',
  narasimhaJayanti: '2026-04-30',
  naradaJayanti: '2026-05-02',
  shaniJayanti: '2026-05-16',
  balaramaJayanti: '2026-09-16',
  dattatreyaJayanti: '2026-12-23',
  swaminarayanJayanti: '2026-03-27',
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

const SANKRANTI_EXPECTED = {
  meshaSankranti: '2026-04-14',
  vrishabhaSankranti: '2026-05-15',
  mithunaSankranti: '2026-06-15',
  karkaSankranti: '2026-07-16',
  simhaSankranti: '2026-08-17',
  kanyaSankranti: '2026-09-17',
  tulaSankranti: '2026-10-17',
  vrishchikaSankranti: '2026-11-16',
  makarSankranti: '2026-01-14',
  dhanuSankranti: '2026-12-16',
  kumbhaSankranti: '2026-02-13',
  meenaSankranti: '2026-03-15',
};
console.log('\nMonthly sankranti anchors (New Delhi 2026):');
let sankFailures = 0;
for (const [key, exp] of Object.entries(SANKRANTI_EXPECTED)) {
  const hit = cal.festivals.find((f) => f.key === key);
  const got = hit ? fmt(hit.ms) : 'DID NOT FIRE';
  const ok = got === exp;
  console.log(`  ${ok ? '✓' : '✗'} ${key}: ${got} (expected ${exp})`);
  if (!ok) sankFailures++;
}
if (sankFailures) { console.error(`\n✗ ${sankFailures} sankranti anchor(s) failed`); process.exitCode = 1; }
else console.log(`✓ ${Object.keys(SANKRANTI_EXPECTED).length}/${Object.keys(SANKRANTI_EXPECTED).length} sankranti anchors match`);

const ECLIPSE_EXPECTED = ['2026-02-17', '2026-03-03', '2026-08-12', '2026-08-28'];
console.log('\nGrahan anchors (New Delhi 2026):');
const grahanDates = cal.festivals
  .filter((f) => f.key === 'suryaGrahan' || f.key === 'chandraGrahan')
  .map((f) => fmt(f.ms))
  .filter((d) => d.startsWith('2026-'));
let eclipseFailures = 0;
for (const exp of ECLIPSE_EXPECTED) {
  const ok = grahanDates.includes(exp);
  console.log(`  ${ok ? '✓' : '✗'} ${exp} ${ok ? 'present' : 'MISSING'}`);
  if (!ok) eclipseFailures++;
}
if (eclipseFailures) { console.error(`\n✗ ${eclipseFailures} grahan anchor(s) failed`); process.exitCode = 1; }
else console.log(`✓ ${ECLIPSE_EXPECTED.length}/${ECLIPSE_EXPECTED.length} 2026 grahan dates present`);

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

const sequenceYears = [
  [2025, {
    skandaSashtiBegins: '2025-10-22',
    skandaSashtiSoorasamharam: '2025-10-27',
    skandaSashtiThirukalyanam: '2025-10-28',
    ayyappaMandalaBegins: '2025-11-17',
    ayyappaMandalaPuja: '2025-12-27',
  }],
  [2027, {
    skandaSashtiBegins: '2027-10-30',
    skandaSashtiSoorasamharam: '2027-11-04',
    skandaSashtiThirukalyanam: '2027-11-05',
    ayyappaMandalaBegins: '2027-11-17',
    ayyappaMandalaPuja: '2027-12-27',
  }],
];
console.log('\nSkanda + Ayyappa multi-year anchors (New Delhi):');
let sequenceFailures = 0;
for (const [year, expected] of sequenceYears) {
  const from = Date.UTC(year, 0, 1) - IST * 3600000;
  const yearCal = app.scanPanchangCalendar(from, IST, 430, 46, DELHI);
  for (const [key, exp] of Object.entries(expected)) {
    const hit = yearCal.festivals.find((f) => f.key === key);
    const got = hit ? fmt(hit.ms) : 'DID NOT FIRE';
    const ok = got === exp;
    console.log(`  ${ok ? '✓' : '✗'} ${key} ${year}: ${got} (expected ${exp})`);
    if (!ok) sequenceFailures++;
  }
}
if (sequenceFailures) {
  console.error(`\n✗ ${sequenceFailures} Skanda/Ayyappa multi-year anchor(s) failed`);
  process.exitCode = 1;
} else {
  console.log('✓ Skanda + Ayyappa multi-year anchors match');
}
