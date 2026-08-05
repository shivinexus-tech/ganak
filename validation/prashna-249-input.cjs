#!/usr/bin/env node
'use strict';

// UI guard for the KP 1–249 number field. The number defines the ascendant, so
// punctuation must never be stripped in a way that silently selects another number.

const fs = require('fs');
const source = fs.readFileSync('src/screens/PrashnaScreen.tsx', 'utf8');
let failures = 0;
const check = (condition, message) => {
  if (condition) console.log(`PASS  ${message}`);
  else { failures++; console.error(`FAIL  ${message}`); }
};

check(
  /function PR_normalizeNumberInput\(raw\)[\s\S]*?!\/\^\\d\+\$\/\.test\(trimmed\)[\s\S]*?return trimmed/.test(source),
  'decimal/sign-bearing input is preserved as invalid instead of having punctuation stripped'
);
check(
  !/replace\(\/\[\^0-9\]\/g,\s*['"]{2}\)/.test(source),
  'number input no longer deletes arbitrary non-digit characters'
);
check(
  /const numberIsValid = \/\^\\d\+\$\/\.test\(numberInput\)[\s\S]*?Number\.isInteger\(nTyped\)[\s\S]*?nTyped >= KP_NUMBER_MIN[\s\S]*?nTyped <= KP_NUMBER_MAX/.test(source),
  'Cast enablement requires a digits-only integer in the 1–249 range'
);
check(
  /if \(!\/\^\\d\+\$\/\.test\(numberInput\)\)/.test(source),
  'the cast path independently rejects non-digit strings'
);

// F12: a long digit string must not be shortened to a different valid KP number.
// Leading zeros are still intentionally normalized (`007` → `7`).
check(
  /const normalized = trimmed\.replace\(\/\^0\+\(\?=\\d\)\/,\s*''\)[\s\S]*?normalized\.length > 3[\s\S]*?return trimmed[\s\S]*?return normalized/.test(source) &&
    !/\.slice\(0,\s*3\)/.test(source),
  'F12: long digit strings remain visibly invalid instead of being truncated to another number'
);

// F11: canonical KP starts are exact to an arcsecond, but binary floats can sit just
// below an exact minute (15°39′59.999…). Number-mode display must stabilize at the
// arcsecond before deriving degrees/minutes.
const numberDegreeBody = source.match(/function PR_fmtNumberDeg\(deg\) \{([\s\S]*?)\n\}/);
let numberDegreeFormatter = null;
try {
  numberDegreeFormatter = numberDegreeBody && new Function('deg', numberDegreeBody[1]);
} catch {}
check(
  numberDegreeFormatter &&
    numberDegreeFormatter(15.666666666666664) === '15°40′' &&
    numberDegreeFormatter(27.888888888888886) === '27°53′',
  'F11: exact KP minute boundaries render consistently despite floating-point noise'
);
check(
  /PR_fmtNumberDeg\(info\.signDeg\)/.test(source) &&
    /isNum \? PR_fmtNumberDeg\(result\.chart\.lagna\.deg\) : fmtDeg\(result\.chart\.lagna\.deg\)/.test(source),
  'F11: number answer and expanded-chart Lagna use the stable KP degree formatter'
);

// F10: the 5-column full chart is wider than a 320px phone; it must scroll inside its
// own container rather than push the whole page into horizontal overflow.
// The min-width moved from a fixed 300px to the equivalent 18.75rem so the comfort scale
// reaches it (backlog #46); either unit satisfies the guard, the scroll container does not.
check(
  /overflowX: 'auto'[\s\S]{0,160}<table style=\{\{ width: '100%', minWidth: (?:300\b|"18\.75rem")/.test(source),
  'F10: the full-chart table is wrapped in a horizontal-scroll container'
);

if (failures) {
  console.error(`\nprashna-249-input FAILED: ${failures}`);
  process.exit(1);
}
console.log('\nPRASHNA 249 INPUT REGRESSION PASSED');
