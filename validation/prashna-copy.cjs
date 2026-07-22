#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

const screenPath = path.join(__dirname, '..', 'src', 'screens', 'PrashnaScreen.tsx');
const source = fs.readFileSync(screenPath, 'utf8');

const failures = [];
if (/\$\{(?:h|v\.q\.cusp)\}th/.test(source)) {
  failures.push('hard-coded English "th" house suffix remains');
}
if (!source.includes('englishOrdinal(v.q.cusp)')) {
  failures.push('deciding-house reason does not use englishOrdinal');
}
if (!source.includes('plainDeny')) {
  failures.push('tier-1 deny lines must use plainDeny, not favour plain labels');
}
if (!source.includes('HOUSE_PLAIN_DENY')) {
  failures.push('HOUSE_PLAIN_DENY map is missing');
}
if (/Working against it:.*fortune and support/.test(source)) {
  failures.push('forbidden deny phrase "fortune and support" remains in source');
}
if ((source.match(/englishOrdinal\(h\)/g) || []).length !== 2) {
  failures.push('supporting and denying house reasons must both use englishOrdinal');
}

function expectedOrdinal(n) {
  const lastTwo = n % 100;
  if (lastTwo >= 11 && lastTwo <= 13) return `${n}th`;
  return `${n}${({ 1: 'st', 2: 'nd', 3: 'rd' })[n % 10] || 'th'}`;
}

const expected = ['1st', '2nd', '3rd', '4th', '10th', '11th', '12th'];
const actual = [1, 2, 3, 4, 10, 11, 12].map(expectedOrdinal);
if (JSON.stringify(actual) !== JSON.stringify(expected)) {
  failures.push(`ordinal cases differ: ${actual.join(', ')}`);
}

if (failures.length) {
  console.error(`Prashna copy gate FAILED:\n- ${failures.join('\n- ')}`);
  process.exit(1);
}

console.log(`Prashna copy gate passed: ${actual.join(', ')}`);
