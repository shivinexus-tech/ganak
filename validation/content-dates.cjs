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
fs.writeFileSync(tmp, out + '\nmodule.exports.__t = { scanPanchangCalendar, FEST_NAME };\n');
let app; try { app = require(tmp).__t; } finally { fs.unlinkSync(tmp); }

// scan Jan 1 2026 → ~14 months, IST
const IST = 5.5;
const from = Date.UTC(2026, 0, 1) - IST * 3600000;
const cal = app.scanPanchangCalendar(from, IST, 430);
const fmt = (ms) => new Date(ms + IST * 3600000).toISOString().slice(0, 10);
const NEW = ['lakshmiPanchami','buddhaPurnima','guptNavratriAshadha','rathYatra','hariyaliTeej','nagPanchami','hartalikaTeej','radhaAshtami','mahaAshtami','mahaNavami','sharadPurnima','ahoiAshtami','guptNavratriMagha','vasantPanchami','sheetlaAshtami'];
const KNOWN = {
  vasantPanchami: '2026-01-23', mahaShivaratri: '2026-02-15', sheetlaAshtami: '~8 days after Holi (Mar 2026)',
  buddhaPurnima: '2026-05-01', rathYatra: '2026-06-16', hariyaliTeej: '2026-08-15', nagPanchami: '2026-08-17',
  radhaAshtami: '2026-08-29', sharadPurnima: '2026-10-25', ahoiAshtami: '2026-11-02', vasantPanchami2: 'Magha Shukla 5',
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
