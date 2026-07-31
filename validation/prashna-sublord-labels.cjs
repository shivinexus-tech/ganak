#!/usr/bin/env node
// ============================================================================
// validation/prashna-sublord-labels.cjs
//
// Two DIFFERENT quantities were both rendered as "Sub-lord", both glossed as
// the deciding one: the 249-table ASCENDANT sub-lord (answer card) and the
// live QUESTION-CUSP sub-lord (full-chart chip). They contradict each other in
// 82.5% of number x topic combinations. This gate is a source guard: each
// readout must name its own cusp, and only ONE may claim the deciding vote.
// ============================================================================
'use strict';
const fs = require('fs');
const path = require('path');

const SRC = path.resolve(__dirname, '..', 'src', 'screens', 'PrashnaScreen.tsx');
const src = fs.readFileSync(SRC, 'utf8');

let pass = 0, fail = 0;
const ok = (c, m) => { c ? pass++ : fail++; console.log(`${c ? 'PASS' : 'FAIL'}  ${m}`); };

// 1. No bare "Sub-lord" / "उप-स्वामी" label survives -- every one is qualified.
const bareEn = /label=\{[^}]*['"`]Sub[- ]?lord['"`]/;
ok(!bareEn.test(src), 'no readout is labelled a bare "Sub-lord"');
const bareHi = /(['"`])उप-स्वामी\1/;
ok(!bareHi.test(src), 'no readout is labelled a bare "उप-स्वामी"');

// 2. The ascendant sub-lord names the ascendant.
ok(/Ascendant sub-lord|लग्न उप-स्वामी/.test(src),
  'the 249-table sub-lord is labelled as the ASCENDANT sub-lord');

// 3. No function that derives the ASCENDANT sub-lord may also claim the
//    deciding vote. Block-scoped, not line-scoped, on purpose: the original bug
//    read `const sub = ... info.subLord` and then claimed "the final yes or no"
//    several lines later inside a JSX prop, so no single line carried both. A
//    same-line test passes against the very bug this gate exists to catch.
const DECIDING = /deciding vote|final yes or no|निर्णायक मत|अंतिम निर्णय/;
const ASC_SOURCE = /info\.subLord|info\.starLord|lagna\.sub\b|lagna\.star\b/;
const blocks = src.split(/^(?=function\s+\w+)/m);
const misattached = blocks
  .filter(b => ASC_SOURCE.test(b) && DECIDING.test(b))
  .map(b => (b.match(/^function\s+(\w+)/) || [null, '<module scope>'])[1]);
ok(misattached.length === 0,
  `no ascendant-sub-lord block claims the deciding vote (offenders: ${misattached.join(', ') || 'none'})`);

// 4. The ascendant sub-lord must NOT claim it -- KP gives the deciding vote to
//    the cuspal sub-lord of the house judged.
const cardBox = src.slice(src.indexOf('function NumberSetBox'));
ok(!/final yes or no|अंतिम निर्णय \(हाँ या नहीं\)/.test(cardBox),
  'the ascendant sub-lord no longer claims the final yes/no');

console.log(`\n${fail === 0 ? '✓' : '✗'} sublord-labels: ${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
