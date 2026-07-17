#!/usr/bin/env node
// ============================================================================
// validation/muhurat-anchors.cjs — validates MUHURTA_RULES against Drik
// Panchang's published 2026 shubh-dates lists for New Delhi (fetched 2026-07-16).
//
//   node validation/muhurat-anchors.cjs
//
// Transpiles src/kundli-app.tsx to CommonJS, requires it with muhurat internals
// exported, scans with muhuratScanRange, and reports per category:
//   recall    — % of Drik-listed dates our shuddhi accepts (target ≥ 80%)
//   precision — % of our accepted dates Drik also lists (informational; Drik
//               additionally does intraday window + yoga/karana shuddhi, so
//               our day-level check is expected to be a superset)
// Recall misses are printed with our blockers so every gap is explainable
// (most arise when the qualifying nakshatra starts after sunrise).
// ============================================================================
'use strict';
const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const ROOT = path.resolve(__dirname, '..');
const src = fs.readFileSync(path.join(ROOT, 'src/kundli-app.tsx'), 'utf8');
const out = ts.transpileModule(src, {
  compilerOptions: { jsx: ts.JsxEmit.React, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
}).outputText;
const tmp = path.join(__dirname, '.app-transpiled.tmp.cjs');
fs.writeFileSync(tmp, out + '\nmodule.exports.__muh = { muhuratScanRange, muhuratForDate, muhuratShuddhi, MUHURTA_RULES };\n');
let app;
try { app = require(tmp).__muh; } finally { fs.unlinkSync(tmp); }

const DELHI = { label: 'New Delhi', lat: 28.6139, lon: 77.209, zone: 'Asia/Kolkata' };
const D = (m, d) => `2026-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

// Drik Panchang 2026 New Delhi anchors (drikpanchang.com shubh-dates, fetched 2026-07-16)
const ANCHORS = {
  vehicle: { from: { y: 2026, m: 7, d: 1 }, to: { y: 2026, m: 12, d: 31 }, dates: [
    [7,2],[7,3],[7,5],[7,8],[7,12],[7,19],[7,24],[7,29],[7,30],
    [8,7],[8,9],[8,10],[8,16],[8,17],[8,20],[8,26],[8,27],[8,28],[8,31],
    [9,4],[9,6],[9,7],[9,13],[9,14],[9,16],[9,17],[9,24],
    [10,21],[10,22],[10,25],[10,28],[10,30],
    [11,1],[11,6],[11,25],[11,26],[11,29],
    [12,3],[12,4],[12,6],[12,13],[12,14],[12,23],[12,30],[12,31]].map(([m,d]) => D(m,d)) },
  property: { from: { y: 2026, m: 7, d: 1 }, to: { y: 2026, m: 12, d: 31 }, dates: [
    [7,16],[7,17],[7,23],[7,24],
    [8,13],[8,14],[8,20],[8,21],[8,28],
    [9,4],[9,10],[9,11],[9,17],[9,18],[9,25],
    [10,1],[10,2],[10,8],[10,16],[10,22],[10,23],[10,29],[10,30],
    [11,12],[11,13],[11,19],[11,20],[11,26],[11,27],
    [12,10],[12,11],[12,17],[12,18],[12,24],[12,25]].map(([m,d]) => D(m,d)) },
  wedding: { from: { y: 2026, m: 1, d: 1 }, to: { y: 2026, m: 12, d: 31 }, dates: [
    [2,5],[2,6],[2,8],[2,10],[2,12],[2,14],[2,19],[2,20],[2,21],[2,24],[2,25],[2,26],
    [3,2],[3,3],[3,4],[3,7],[3,8],[3,9],[3,11],[3,12],
    [4,15],[4,20],[4,21],[4,25],[4,26],[4,27],[4,28],[4,29],
    [5,1],[5,3],[5,5],[5,6],[5,7],[5,8],[5,13],[5,14],
    [6,21],[6,22],[6,23],[6,24],[6,25],[6,26],[6,27],[6,29],
    [7,1],[7,6],[7,7],[7,11],
    [11,21],[11,24],[11,25],[11,26],
    [12,2],[12,3],[12,4],[12,5],[12,6],[12,11],[12,12]].map(([m,d]) => D(m,d)) },
};

let hardFail = false;
for (const [cat, a] of Object.entries(ANCHORS)) {
  const days = app.muhuratScanRange(DELHI, 'lahiri', a.from, a.to, cat);
  const oursValid = new Set(days.filter(x => x.valid).map(x => D(x.m, x.day)));
  const drik = new Set(a.dates);
  const hits = a.dates.filter(d => oursValid.has(d));
  const misses = a.dates.filter(d => !oursValid.has(d));
  const extras = [...oursValid].filter(d => !drik.has(d));
  const recall = (100 * hits.length / a.dates.length);
  const precision = oursValid.size ? (100 * hits.length / oursValid.size) : 0;
  console.log(`\n=== ${cat} ===  Drik ${a.dates.length} | ours ${oursValid.size} | recall ${recall.toFixed(0)}% | precision ${precision.toFixed(0)}%`);
  if (misses.length) {
    console.log(`  recall misses (${misses.length}):`);
    const byDate = new Map(days.map(x => [D(x.m, x.day), x]));
    for (const d of misses) {
      const row = byDate.get(d);
      const why = row ? (row.blockers || []).map(b => b.en).join(', ') || '(scored only)' : 'not scanned';
      console.log(`    ${d}: ${why}${row ? `  [nak=${row.nakName} tithi=${row.tithiNum}${row.krishna ? 'K' : 'S'} dow=${row.dow}]` : ''}`);
    }
  }
  if (extras.length) console.log(`  extras vs Drik (${extras.length}): ${extras.slice(0, 12).join(', ')}${extras.length > 12 ? ' …' : ''}`);
  if (recall < 80) { hardFail = true; console.log(`  ✗ recall below 80%`); }
}
console.log(hardFail ? '\n✗ muhurat-anchors FAILED' : '\n✓ muhurat-anchors PASSED (recall ≥ 80% on all categories)');
process.exit(hardFail ? 1 : 0);
