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
const bareEn = /label=\{[^}]*['"`]Sub[- ]?lord['"`]/g;
ok(!bareEn.test(src), 'no readout is labelled a bare "Sub-lord"');
const bareHi = /['"`]उप-स्वामी['"`]\s*\}/g;
ok(!bareHi.test(src), 'no readout is labelled a bare "उप-स्वामी"');

// 2. The ascendant sub-lord names the ascendant.
ok(/Ascendant sub-lord|लग्न उप-स्वामी/.test(src),
  'the 249-table sub-lord is labelled as the ASCENDANT sub-lord');

// 3. A deciding-vote claim must never attach to the ASCENDANT sub-lord. That is
//    the regression this gate exists to catch: the answer card once claimed the
//    "final yes or no" for the 249-table ascendant sub-lord while the chip
//    claimed the "deciding vote" for the question-cusp sub-lord, and the two
//    contradicted in 82.5% of number x topic combinations.
//    Deliberately NOT a proximity check against cuspSub: JSX splits an element
//    across sibling prop lines, so line distance proves nothing. Assertion 4
//    (the phrase never appears inside NumberSetBox) is the companion safeguard.
const DECIDING = /deciding vote|final yes or no|निर्णायक मत|अंतिम निर्णय/;
const ASC_SOURCE = /info\.subLord|info\.starLord|lagna\.sub|lagna\.star/;
const misattached = src.split('\n')
  .map((line, i) => ({ line, n: i + 1 }))
  .filter(({ line }) => DECIDING.test(line) && ASC_SOURCE.test(line));
ok(misattached.length === 0,
  `no deciding-vote claim attaches to the ascendant sub-lord (offenders: ${misattached.map(s => s.n).join(', ') || 'none'})`);

// 4. The ascendant sub-lord must NOT claim it -- KP gives the deciding vote to
//    the cuspal sub-lord of the house judged.
const cardBox = src.slice(src.indexOf('function NumberSetBox'));
ok(!/final yes or no|अंतिम निर्णय \(हाँ या नहीं\)/.test(cardBox),
  'the ascendant sub-lord no longer claims the final yes/no');

console.log(`\n${fail === 0 ? '✓' : '✗'} sublord-labels: ${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
