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

if (failures) {
  console.error(`\nprashna-249-input FAILED: ${failures}`);
  process.exit(1);
}
console.log('\nPRASHNA 249 INPUT REGRESSION PASSED');
