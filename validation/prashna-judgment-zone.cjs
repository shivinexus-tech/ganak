#!/usr/bin/env node
// ============================================================================
// validation/prashna-judgment-zone.cjs — the moment AND PLACE of judgement.
//
// Bug bash F4/F5/F6. KP horary is cast for the moment and place of judgement, and
// this screen offers exactly that override — but it read the typed `datetime-local`
// with `new Date(customWhen)`, which JavaScript parses in the RUNTIME's zone. A
// practitioner in London judging a question that arrived in Chennai typed 18:00
// meaning IST and got 18:00 BST. Measured at Chennai over the twelve topics, that
// changes the cuspal sub-lord for 12 of 12 and flips 7 of 12 verdicts.
//
// The resolver was fixed on 2026-08-19; the panel still had no field in which to
// NAME a zone, and its caption still told every reader the time was read in their
// device's zone. This gate covers both halves plus the two guards that landed with
// the resolver:
//
//   [1] a named zone is honoured, checked against Intl (the platform's own tz
//       database) rather than against a second copy of Ganak's resolver;
//   [2] an unrecognised name is REFUSED, never silently device-parsed;
//   [3] a wall clock inside the spring-forward gap does not exist and is refused
//       rather than moved an hour (F5) — the same standing this project's birth
//       input takes;
//   [4] the judgment year is held to the range over which the ephemeris has real
//       ΔT fits (F6), with the engine's hard-coded ΔT named as the reason;
//   [5] the override panel actually offers a timezone field, and its caption names
//       the zone the typed clock is read in instead of always claiming the device.
//
//   node validation/prashna-judgment-zone.cjs
// ============================================================================
'use strict';
const fs = require('fs');
const { freezeClock } = require('./_snapshot-env.cjs');
freezeClock();
const { loadApp } = require('./_load-app.cjs');

const scr = loadApp('src/screens/PrashnaScreen.tsx');
const { PR_cast, PR_judge, QUESTIONS } = scr;
const { YEAR_MIN, YEAR_MAX } = loadApp('src/components/birth-input.ts');

let pass = 0, fail = 0;
const failures = [];
const ok = (cond, msg) => { if (cond) pass += 1; else { fail += 1; failures.push(msg); } };

/* The screen exports the SHIPPING resolver, so this gate exercises the function
   `ask()` calls rather than a copy of it or a slice of its source. */
const { PR_resolveJudgmentMoment: resolve } = scr;
ok(typeof resolve === 'function',
  'PrashnaScreen no longer exports PR_resolveJudgmentMoment — the judgment moment is no ' +
  'longer resolved in a named zone, or the export was dropped');
/* Nothing to sweep without it. Stop with the verdict rather than a TypeError, so a
   red run reads as a finding about the product and not as a broken harness. */
if (typeof resolve !== 'function') {
  failures.forEach((f) => console.log(`FAIL  ${f}`));
  console.log(`\n✗ prashna-judgment-zone: ${pass} passed, ${fail} failed`);
  process.exit(1);
}

// -------------------------------------------------------- [1] a named zone is honoured
const ZONES = ['Asia/Kolkata', 'Europe/London', 'America/New_York', 'Australia/Sydney',
  'Asia/Kathmandu', 'Pacific/Chatham', 'America/St_Johns', 'Africa/Cairo', 'UTC'];
const CLOCKS = ['2026-01-15T09:00', '2026-06-21T18:30', '2026-08-18T18:00',
  '2026-11-02T01:30', '2026-12-31T23:45', '1975-07-04T07:15', '2149-03-03T12:00'];

/* Intl is the platform's IANA database — an independent authority, not a second
   copy of zoneOffset. Given an instant, it reports the wall clock in the zone; the
   resolver is correct when the instant it returns reads back as the clock typed. */
function wallClockIn(zone, ms) {
  const p = new Intl.DateTimeFormat('en-CA', {
    timeZone: zone, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false,
  }).formatToParts(new Date(ms)).reduce((a, x) => (a[x.type] = x.value, a), {});
  return `${p.year}-${p.month}-${p.day}T${p.hour === '24' ? '00' : p.hour}:${p.minute}`;
}

let resolved = 0, differsFromDevice = 0;
for (const zone of ZONES) {
  for (const clock of CLOCKS) {
    const r = resolve(clock, zone, false);
    if (r.problem) {
      // legitimate only for a clock that does not exist in that zone
      ok(/did not exist/.test(r.problem),
        `${zone} ${clock}: refused with "${r.problem}" — that clock is a real one`);
      continue;
    }
    resolved += 1;
    ok(wallClockIn(zone, r.ms) === clock,
      `${zone} ${clock}: resolved to an instant that reads back as ${wallClockIn(zone, r.ms)} in ${zone}`);
    if (r.ms !== new Date(clock).getTime()) differsFromDevice += 1;
  }
}
ok(differsFromDevice > 20,
  `only ${differsFromDevice} of ${resolved} resolutions differ from a bare new Date(clock) — ` +
  'the zone is not actually being applied');

// ------------------------------------------------- [2] an unknown zone is refused
for (const bad of ['Mars/Olympus', 'IST', 'GMT+5:30', 'Asia/Kolkatta', 'not a zone']) {
  const r = resolve('2026-08-18T18:00', bad, false);
  const devicey = r.ms === new Date('2026-08-18T18:00').getTime();
  ok(!(devicey && !r.problem),
    `zone "${bad}" was silently read in the device's timezone instead of being refused — that is F4 itself`);
}

// -------------------------------------------- [3] a clock that does not exist (F5)
const GAPS = [
  ['Europe/London', '2026-03-29T01:30'],
  ['America/New_York', '2026-03-08T02:30'],
  ['Australia/Sydney', '2026-10-04T02:30'],
];
for (const [zone, clock] of GAPS) {
  const r = resolve(clock, zone, false);
  ok(Number.isNaN(r.ms) && r.problem && /did not exist/.test(r.problem),
    `${zone} ${clock} is inside the spring-forward gap and must be refused, not moved an hour; got ${JSON.stringify(r)}`);
  const rhi = resolve(clock, zone, true);
  ok(rhi.problem && /घड़ियाँ आगे बढ़ा दी गई थीं/.test(rhi.problem),
    `${zone} ${clock}: the Hindi refusal does not explain that the clocks went forward`);
}
/* And the hour either side of the gap is a real clock, so it must NOT be refused —
   otherwise [3] would pass by refusing everything. */
for (const [zone, clock] of [['Europe/London', '2026-03-29T00:30'], ['Europe/London', '2026-03-29T02:30']]) {
  ok(!resolve(clock, zone, false).problem, `${zone} ${clock} is a real clock and must be accepted`);
}

// ----------------------------------------------------------- [4] the year range (F6)
for (const y of [1, 1200, 1799, YEAR_MIN - 1, YEAR_MAX + 1, 3000, 9999]) {
  const r = resolve(`${String(y).padStart(4, '0')}-06-15T12:00`, 'Asia/Kolkata', false);
  ok(Number.isNaN(r.ms) && r.problem && r.problem.includes(String(YEAR_MIN)),
    `year ${y} is outside ${YEAR_MIN}–${YEAR_MAX} and must be refused with the range named; got ${JSON.stringify(r.problem)}`);
}
for (const y of [YEAR_MIN, 2026, YEAR_MAX]) {
  ok(!resolve(`${y}-06-15T12:00`, 'Asia/Kolkata', false).problem,
    `year ${y} is inside ${YEAR_MIN}–${YEAR_MAX} and must be accepted`);
}

// --------------------------------------- [5] the panel offers the field and tells the truth
{
  const React = require('react');
  const { renderToStaticMarkup } = require('react-dom/server');
  const { READINGS } = require('./_prashna-seed.cjs');
  const seed = require('./_prashna-seed.cjs');
  const base = READINGS.find((r) => r.key === 'time');

  for (const lang of ['en', 'hi']) {
    const named = seed.renderReading({ ...base, override: { zone: 'Asia/Kolkata', when: '' } }, lang);
    ok(named.includes(lang === 'hi' ? 'Asia/Kolkata की घड़ी के अनुसार' : 'read on Asia/Kolkata clocks'),
      `${lang}: with a zone named, the caption does not say which zone the typed clock is read in`);
    ok(!named.includes(lang === 'hi' ? 'आपके उपकरण के समयक्षेत्र में पढ़ा जाता है'
                                     : 'read in your device’s timezone'),
      `${lang}: the caption still claims the device's timezone while a real zone is in force`);

    const bad = seed.renderReading({ ...base, unlocked: true, override: { zone: 'Mars/Olympus', when: '' } }, lang);
    ok(bad.includes(lang === 'hi' ? 'कोई पहचाना हुआ समयक्षेत्र नहीं है' : 'is not a timezone Ganak recognises'),
      `${lang}: an unrecognised timezone is accepted by the panel without a visible reason`);
    ok(bad.includes(lang === 'hi' ? 'समयक्षेत्र पहचाना नहीं गया' : 'That timezone is not recognised'),
      `${lang}: the disabled Cast button does not name the timezone as the thing that is wrong`);
  }

  /* The field itself is an <input>; its label is an attribute, so it cannot show up
     in the text a reader-facing snapshot extracts. Check the markup. */
  const src = fs.readFileSync('src/screens/PrashnaScreen.tsx', 'utf8');
  ok(/aria-label=\{hi \? 'निर्णय स्थान का समयक्षेत्र' : 'Judgment place timezone'\}/.test(src),
    'the override panel has no timezone input — without one the override still cannot ' +
    'express the judging place\'s local time');
  ok(/value=\{customZone\}/.test(src) && /setCustomZone\(e\.target\.value\)/.test(src),
    'the timezone input is not wired to the customZone state the resolver reads');
}

/* ----------------------------------------------------- what is still open, on purpose
   The screen accepts a `zone` prop and honours it. src/kundli-app.tsx does not pass
   one — `panchEff` carries { label, lat, lon, zone } and the Prashna mount is
   destructured down to lat/lon/label. That file is integration-owned and reserved by
   another lane, so this gate REPORTS the gap instead of failing on it. */
{
  const shell = fs.readFileSync('src/kundli-app.tsx', 'utf8');
  const wired = /<PrashnaScreen[^>]*zone=/.test(shell);
  console.log(wired
    ? '\n  shell wiring: src/kundli-app.tsx passes the place zone to PrashnaScreen ✓'
    : '\n  OPEN HANDOFF — src/kundli-app.tsx does not pass `zone` to PrashnaScreen, so a\n' +
      '  reader who never opens the override panel still has the typed judgment moment read\n' +
      '  in the device zone. One line, in a file reserved by another lane:\n' +
      '      <PrashnaScreen lat={panchEff?.lat} lon={panchEff?.lon} zone={panchEff?.zone}\n' +
      '                     placeLabel={panchEff?.label} lang={lang} />');
}

// ------------------------------------------- the cost, printed so it stays concrete
{
  const CHENNAI = { lat: 13.0827, lon: 80.2707 };
  const intended = Date.UTC(2026, 7, 18, 12, 30);   // 18:00 IST
  const device = Date.UTC(2026, 7, 18, 17, 0);      // 18:00 BST
  let subChanged = 0, flipped = 0;
  for (const q of QUESTIONS) {
    const a = PR_judge(PR_cast(intended, CHENNAI.lat, CHENNAI.lon), q);
    const b = PR_judge(PR_cast(device, CHENNAI.lat, CHENNAI.lon), q);
    if (a.cuspSub !== b.cuspSub) subChanged += 1;
    if (a.verdict !== b.verdict) flipped += 1;
  }
  console.log(`  cost of getting the zone wrong (London judging for Chennai, 18:00):`);
  console.log(`    cusp sub-lord changes ${subChanged}/${QUESTIONS.length} · verdict flips ${flipped}/${QUESTIONS.length}`);
  ok(subChanged >= 10, 'the zone no longer moves the reading — this gate would be proving nothing');
}

console.log(`\n  zone/clock pairs resolved   ${resolved}`);
console.log(`  differing from device parse ${differsFromDevice}`);

if (fail) {
  console.log('');
  failures.slice(0, 25).forEach((f) => console.log(`FAIL  ${f}`));
  if (failures.length > 25) console.log(`… and ${failures.length - 25} more`);
}
console.log(`\n${fail ? '✗' : '✓'} prashna-judgment-zone: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
