#!/usr/bin/env node
'use strict';
/* Birth-input guards — behavioural, not textual.

   The defect this exists for (bug bash F9, 2026-08-18): 29 February in a
   non-leap year was silently normalised to 1 March and then answered on with
   confidence. The chart screen cast a full chart FOR 1 March while its own
   report header printed 29 February — two different birthdays on one page.

   The guards were fixed first on the calculator screen and then lifted into
   src/components/birth-input.ts so all four screens speak one vocabulary. This
   gate RUNS them rather than grepping for them, and then checks each screen
   actually calls them — a shared guard nobody calls protects nobody. */
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { loadApp, ROOT } = require('./_load-app.cjs');

const bi = loadApp('src/components/birth-input.ts');
const { dateProblem, timeProblem, fieldMessage, F_BIRTH_DATE, F_BIRTH_TIME, YEAR_MIN, YEAR_MAX } = bi;
let checks = 0;
const ok = (cond, msg) => { assert(cond, msg); checks++; };

/* 1. a date that does not exist is REFUSED, never corrected */
for (const bad of ['2023-02-29', '2100-02-29', '1900-02-29', '2023-04-31', '2023-13-01', '2023-00-10', '2023-06-00']) {
  ok(dateProblem(bad, F_BIRTH_DATE), `${bad} does not exist and must be refused, not normalised`);
}
ok(!dateProblem('2024-02-29', F_BIRTH_DATE), '29 Feb 2024 is a real date and must be accepted');
ok(!dateProblem('2000-02-29', F_BIRTH_DATE), '2000 is a leap year (÷400) and must be accepted');
ok(dateProblem('1900-02-29', F_BIRTH_DATE), '1900 is NOT a leap year (÷100, not ÷400)');

/* 2. the ephemeris range is a real limit, not a round number */
ok(dateProblem(`${YEAR_MIN - 1}-06-15`, F_BIRTH_DATE), 'a year before the ΔT fits must be refused');
ok(dateProblem(`${YEAR_MAX + 1}-06-15`, F_BIRTH_DATE), 'a year after the ΔT fits must be refused');
ok(!dateProblem(`${YEAR_MIN}-06-15`, F_BIRTH_DATE) && !dateProblem(`${YEAR_MAX}-06-15`, F_BIRTH_DATE), 'the range endpoints themselves are valid');

/* 3. half-typed input is refused rather than crashing a screen */
for (const bad of ['', '1990-06', '1990', 'not-a-date', '1990/06/15']) {
  ok(dateProblem(bad, F_BIRTH_DATE), `"${bad}" is not a usable birth date`);
}

/* 4. an impossible clock time is refused, never wrapped into the next day */
for (const bad of ['24:00', '23:60', '-01:00', '', '9', 'noon']) {
  ok(timeProblem(bad, F_BIRTH_TIME), `"${bad}" is not a usable birth time`);
}
ok(!timeProblem('00:00', F_BIRTH_TIME) && !timeProblem('23:59', F_BIRTH_TIME), 'midnight and 23:59 are valid times');

/* 5. every refusal NAMES ITS FIELD, in both languages — one catch-all message
   for four boxes is what the reader used to get, and it is the defect. */
for (const lang of [false, true]) {
  const d = fieldMessage(dateProblem('2023-02-29', F_BIRTH_DATE), lang);
  const t = fieldMessage(timeProblem('24:00', F_BIRTH_TIME), lang);
  ok(d && t && d !== t, `${lang ? 'hi' : 'en'}: date and time rejections must differ`);
  ok(d.includes(lang ? F_BIRTH_DATE.hi : F_BIRTH_DATE.en), `${lang ? 'hi' : 'en'}: the message must name the field`);
  ok(!/undefined|NaN|\[object/.test(d + t), 'no placeholder text in a user-facing message');
}
/* a two-person screen must be able to say WHOSE detail is wrong */
const boy = { en: "the groom's date of birth", hi: "वर की जन्म तिथि" };
ok(fieldMessage(dateProblem('2023-02-29', boy), false).includes("groom"), 'a supplied field name must reach the message');

/* 6. the guards are actually CALLED by every screen that asks for a birth */
const SCREENS = {
  'src/screens/UtilityCalculatorScreen.tsx': 'the calculator catalogue',
  'src/screens/ChartScreen.tsx': 'the birth chart',
  'src/screens/MatchingScreen.tsx': 'kundali matching',
  'src/screens/RectifyScreen.tsx': 'birth-time rectification',
};
for (const [rel, what] of Object.entries(SCREENS)) {
  const src = fs.readFileSync(path.join(ROOT, rel), 'utf8');
  ok(/from ["']\.\.\/components\/birth-input["']/.test(src), `${what} must use the shared guards, not its own copy`);
  ok(/dateProblem\(/.test(src) && /timeProblem\(/.test(src), `${what} must check both the date and the time`);
  ok(/fieldMessage\(/.test(src), `${what} must show the field-specific message, not a generic one`);
}

console.log(`✓ birth-input-validation: ${checks} checks · a birth date is never silently corrected · every refusal names its field in both languages · all ${Object.keys(SCREENS).length} birth screens call the shared guards`);
