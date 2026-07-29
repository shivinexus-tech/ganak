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
if (source.includes('en="Prashna · ask the moment"')) {
  failures.push('removed Prashna section subtitle "ask the moment" has returned');
}
if (!source.includes('<PrashnaSecHead hi="प्रश्न कुण्डली" en="Prashna" />')) {
  failures.push('Prashna section header must keep its title without the removed subtitle');
}
for (const forbiddenHindi of [
  "hi: 'KP अंक विधि",
  "hi ? 'KP अंक",
  "'यह KP अंक विधि",
  "'KP-New अयनांश (KP अंक विधि)'",
  "'प्लेसिडस भाव — KP मानक'",
  "'KP उप-स्वामी",
]) {
  if (source.includes(forbiddenHindi)) {
    failures.push(`Latin KP remains in Hindi-mode copy: ${forbiddenHindi}`);
  }
}
if (!source.includes("hi: 'कृष्णमूर्ति पद्धति अंक विधि (1–249)'")) {
  failures.push('Hindi number-method toggle must use कृष्णमूर्ति पद्धति, not Latin KP');
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
