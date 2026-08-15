#!/usr/bin/env node
'use strict';
const fs = require('fs');
const { loadApp } = require('./_load-app.cjs');
const fmt = loadApp('src/components/format.ts');

let failures = 0, checks = 0;
const check = (condition, message) => { checks++; if (!condition) { failures++; console.error('FAIL ' + message); } };
const noonish = Date.parse('2026-08-15T12:34:00Z');

check(fmt.panchangTime(noonish, 5.5, 'en') === '6:04 PM', 'English canonical clock changed');
check(fmt.panchangTime(noonish, 5.5, 'hi') === '6:04 PM', 'Hindi clock is not canonical 12-hour AM/PM');
check(fmt.panchangTime(Date.parse('2026-07-15T12:00:00Z'), -5, 'hi', 'America/New_York') === '8:00 AM', 'Hindi clock is not IANA/DST aware');

const files = [
  'src/components/DailyWindowsCard.tsx', 'src/components/SeasonClockCard.tsx',
  'src/screens/FestivalGuideScreen.tsx', 'src/screens/MedicalMuhuratScreen.tsx',
];
for (const file of files) {
  const source = fs.readFileSync(file, 'utf8');
  check(source.includes('panchangTime'), `${file} bypasses the shared Panchang clock`);
  check(!/hour12\s*:|hourCycle\s*:/.test(source), `${file} independently chooses a 12/24-hour convention`);
}
const festival = fs.readFileSync('src/screens/FestivalGuideScreen.tsx', 'utf8');
check(!/formatLocalClock/.test(festival), 'festival/eclipse clock still has an independent renderer');

console.log(failures ? `hindi-panchang-clock: ${failures} FAILURES (${checks - failures} passed)` : `hindi-panchang-clock: PASS — ${checks} checks; Hindi 12-hour convention shared across Panchang/Muhurat/festival/eclipse surfaces`);
process.exit(failures ? 1 : 0);
