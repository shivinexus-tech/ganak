#!/usr/bin/env node
'use strict';
/* Print / Save-as-PDF gate — verifies the print stylesheet and the report hooks
   are wired so the browser's Save-as-PDF produces a clean Kundli/Match report. */
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

const shell = read('src/kundli-app.tsx');
const chart = read('src/screens/ChartScreen.tsx');
const match = read('src/screens/MatchingScreen.tsx');

// print stylesheet present with the core rules
assert(/@media print/.test(shell), 'a @media print stylesheet is required');
assert(/\.print-only\s*\{\s*display:\s*none/.test(shell), 'print-only elements must be hidden on screen');
assert(/\.print-only\s*\{\s*display:\s*block\s*!important/.test(shell), 'print-only elements must show in print');
assert(/nav[^}]*input[^}]*\.no-print[^}]*display:\s*none\s*!important/.test(shell) || /\.no-print\s*\{\s*display:\s*none/.test(shell) || /input,[^\n]*\.no-print[^\n]*display:\s*none/.test(shell), 'interactive chrome (.no-print/inputs/nav) must be hidden in print');
assert(/button\s*\{\s*display:\s*none\s*!important/.test(shell), 'buttons must be hidden in the printed output');
assert(/details\s*\{\s*display:\s*block\s*!important/.test(shell), 'collapsed details must expand in print');

// Both reports have a Save-as-PDF trigger and a print-only header.
for (const [name, src] of [['Kundli', chart], ['Match', match]]) {
  assert(/window\.print\(\)/.test(src), `${name} report needs a window.print() trigger`);
  assert(/className="no-print"/.test(src), `${name} Save-as-PDF button must be marked no-print`);
  assert(/className="print-only"/.test(src), `${name} report needs a print-only header`);
  assert(/Save as PDF/.test(src) && /पीडीएफ़ सहेजें/.test(src), `${name} PDF button must be bilingual`);
}

console.log('print-reports.cjs OK — print stylesheet + Kundli & Match Save-as-PDF hooks wired');
