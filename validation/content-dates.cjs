#!/usr/bin/env node
// Prints computed 2026 dates for the new Tier-1 festivals so placements can be
// verified against known/Drik dates before shipping. Not a pass/fail gate —
// a human (owner) reads the output and confirms each date is right.
'use strict';
const fs = require('fs');
const path = require('path');
const ts = require('typescript');
const src = fs.readFileSync(path.join(__dirname, '..', 'src/kundli-app.tsx'), 'utf8');
const out = ts.transpileModule(src, { compilerOptions: { jsx: ts.JsxEmit.React, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true } }).outputText;
const tmp = path.join(__dirname, '.content-dates.tmp.cjs');
fs.writeFileSync(tmp, out + '\nmodule.exports.__t = { scanPanchangCalendar, FEST_NAME, ayyappaMandalaFor };\n');
let app; try { app = require(tmp).__t; } finally { fs.unlinkSync(tmp); }

// scan Jan 1 2026 → ~14 months, IST
const IST = 5.5;
const from = Date.UTC(2026, 0, 1) - IST * 3600000;
const cal = app.scanPanchangCalendar(from, IST, 430);
const fmt = (ms) => new Date(ms + IST * 3600000).toISOString().slice(0, 10);
const SOLAR_NEW = ['thaipusam','panguniUthiram','vishu','onam','karthigaiDeepam','ayyappaMandalaBegins','ayyappaMandalaPuja'];
const NEW = ['lakshmiPanchami','buddhaPurnima','guptNavratriAshadha','rathYatra','hariyaliTeej','nagPanchami','hartalikaTeej','radhaAshtami','mahaAshtami','mahaNavami','sharadPurnima','ahoiAshtami','guptNavratriMagha','vasantPanchami','sheetlaAshtami', ...SOLAR_NEW];
const KNOWN = {
  vasantPanchami: '2026-01-23', mahaShivaratri: '2026-02-15', sheetlaAshtami: '~8 days after Holi (Mar 2026)',
  buddhaPurnima: '2026-05-01', rathYatra: '2026-07-15', hariyaliTeej: '2026-08-15', nagPanchami: '2026-08-17',
  hartalikaTeej: '2026-09-14 (Drik Pratahkala rule; app currently one day early)', radhaAshtami: '2026-09-19', sharadPurnima: '2026-10-25', ahoiAshtami: '2026-11-02', vasantPanchami2: 'Magha Shukla 5',
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
