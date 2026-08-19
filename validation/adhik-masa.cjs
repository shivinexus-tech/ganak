#!/usr/bin/env node
// ============================================================================
// validation/adhik-masa.cjs
//
// Adhika Masa is the intercalary "extra" lunar month: a new-moon-to-new-moon
// month inside which the Sun never enters a new sidereal rasi. It recurs roughly
// every 32.5 months, and the `adhik` flag shifts the month INDEX that the whole
// festival engine keys on — so one wrong month silently moves a whole year of
// festivals.
//
// THE DEFECT THIS GATE EXISTS TO STOP (found 2026-08-18).
// `ensureLmWindow` in src/engine/panchang.ts decided the question by reading the
// Sun's sign one hour INSIDE each end of the month —
//   sunSidMs(prevNM + 3600000) vs sunSidMs(nextNM - 3600000)
// which is blind to any sankranti inside those two one-hour slivers. Mesha
// Sankranti 2029 falls at 14 Apr 03:41 IST, 31 minutes after the new moon at
// 03:10 IST. The probe stepped over it, the lunation looked sankranti-free, and
// Ganak reported Adhika Chaitra followed immediately by Adhika Vaishakha — two
// intercalary months back to back, which is astronomically impossible. Over
// 1900-2100 the shortcut invented four impossible months (1907, 1926, 2029,
// 2045) and, in 2029, deleted the entire nija Chaitra: Gudi Padwa, Ugadi and
// Chaitra Navratri vanished from the calendar and Akshaya Tritiya, Buddha
// Purnima, Vat Savitri and Shani Jayanti all fired a lunar month early.
//
// The engine now reads the Sun's sign at the month's TRUE bounds, on the
// half-open interval [prevNM, nextNM). Full write-up, sourcing and the two
// remaining handoffs: plans/research/adhik-masa-detection.md
//
// PUBLISHED REFERENCES (all fetched 2026-08-18)
//  [P] prokerala.com/festivals/adhik-masam.html — Adhik Masam start dates:
//      2023-07-18, 2026-05-17, 2029-03-16, 2031-08-19.
//  [H] hindupad.com/adhik-maas-in-2012-2015-2018-2023-2026-next-adhika-masam/
//      — Adhik Maas years and the month each doubles: 2026 Jyeshtha,
//      2029 Chaitra, 2031 Bhadrapada (19 Aug - 16 Sep 2031), 2034 Ashadha.
//  [W] en.wikipedia.org/wiki/Adhika-masa — the rule ("When the Sun does not at
//      all transit into a new rashi ... in a lunar month, then that lunar month
//      will be named according to the first upcoming transit"), plus two hard
//      structural constraints used below: "No adhika-masa falls during the
//      months of Margashirsha to Magha", and an adhika Kartika is "extremely
//      rare" — in the 250-year span 1901-2150 CE it occurred once, in 1963 CE.
//  [D] drikpanchang.com Hindu calendar, New Delhi (geoname-id=1261481),
//      April/May/June 2029 — the festival dates asserted at the end.
// ============================================================================
'use strict';

const assert = require('assert');
const { loadApp } = require('./_load-app.cjs');

const P = loadApp('src/engine/panchang.ts');

const IST = 5.5;
const DAY = 86400000;
const iso = (ms) => new Date(ms + IST * 3600000).toISOString().slice(0, 10);
const isoMin = (ms) => new Date(ms + IST * 3600000).toISOString().slice(0, 16).replace('T', ' ');
const MONTHS = ['Chaitra', 'Vaishakha', 'Jyeshtha', 'Ashadha', 'Shravana', 'Bhadrapada',
  'Ashwina', 'Kartika', 'Margashirsha', 'Pausha', 'Magha', 'Phalguna'];
const RASHI = ['Mesha', 'Vrishabha', 'Mithuna', 'Karka', 'Simha', 'Kanya',
  'Tula', 'Vrishchika', 'Dhanu', 'Makara', 'Kumbha', 'Meena'];

const Y0 = 1900, Y1 = 2100;

// ---------------------------------------------------------------------------
// 1. Enumerate every lunar month in the range, straight out of the engine.
// ---------------------------------------------------------------------------
const months = [];
{
  const stop = Date.UTC(Y1 + 1, 0, 1);
  // A synodic month is 29.3-29.8 days, so the next new moon is always found by
  // starting 25 days out — that keeps the hourly walk short.
  let prevNM = P.solveCross(P.elongMs, Date.UTC(Y0, 0, 1), 0, 34);
  while (prevNM !== null && prevNM < stop) {
    const nextNM = P.solveCross(P.elongMs, prevNM + 25 * DAY, 0, 10);
    assert.ok(nextNM !== null, `no closing new moon after ${isoMin(prevNM)}`);
    // Query in the middle of the month so the engine resolves this window and
    // not a neighbour's.
    const info = P.lunarMonthInfo((prevNM + nextNM) / 2, false);
    months.push({ prevNM, nextNM, adhik: info.adhik, idx: info.idx, label: info.amanta });
    prevNM = nextNM;
  }
}
assert.ok(months.length > 2400, `expected ~2488 lunar months in ${Y0}-${Y1}, got ${months.length}`);

// ---------------------------------------------------------------------------
// 2. Independently re-derive the sankranti instants and check the engine agrees.
//
// This is the check the fixed engine is claimed to implement, done the long way:
// solve for the actual instant the Sun enters each of the next two rasis and ask
// whether it lies in the half-open interval [prevNM, nextNM). Doing it by the
// instant rather than by a sampled offset is the whole point of the fix, so the
// gate must not re-use the engine's shortcut to confirm the engine's shortcut.
//
// BOUNDARY CONVENTION, asserted here and stated in panchang.ts:
//   - a sankranti at exactly prevNM belongs to the month that OPENS there;
//   - a sankranti in the final minutes before nextNM still belongs to THIS month.
// ---------------------------------------------------------------------------
for (const m of months) {
  const rStart = Math.floor(P.sunSidMs(m.prevNM) / 30);
  const inside = [];
  // A sidereal solar month is at most ~31.5 days, so the next ingress is always
  // within 33 days of any instant; stop looking once one lands outside.
  for (let k = 1; k <= 2; k++) {
    const sign = (rStart + k) % 12;
    const at = P.solveCross(P.sunSidMs, m.prevNM, sign * 30, 33);
    if (at === null || at < m.prevNM || at >= m.nextNM) break;
    inside.push({ at, sign });
  }
  m.sankrantis = inside;
  assert.strictEqual(m.adhik, inside.length === 0,
    `${iso(m.prevNM)}..${iso(m.nextNM)}: engine says adhik=${m.adhik} but ${inside.length} sankranti(s) fall inside`);
  if (inside.length >= 1) {
    // A named (nija) month is named for the rasi the Sun enters during it.
    assert.strictEqual(m.idx, inside[inside.length - 1].sign,
      `${iso(m.prevNM)}: named ${MONTHS[m.idx]} but the last sankranti inside is ${RASHI[inside[inside.length - 1].sign]}`);
  } else {
    // [W]: an adhika month takes the name of the FIRST UPCOMING transit.
    assert.strictEqual(m.idx, (rStart + 1) % 12,
      `${iso(m.prevNM)}: adhika named ${MONTHS[m.idx]}, expected the first upcoming transit ${RASHI[(rStart + 1) % 12]}`);
  }
}

// ---------------------------------------------------------------------------
// 3. The two real boundary cases in the range — the ones a sampled offset misses.
// ---------------------------------------------------------------------------
const findMonth = (isoDate) => months.find((m) => iso(m.prevNM) <= isoDate && isoDate < iso(m.nextNM));

{
  // 2029: Mesha Sankranti 31 minutes AFTER the new moon. It opens the month, so
  // that month is NIJA Chaitra — not a second Adhika Masa.
  const m = findMonth('2029-04-20');
  assert.strictEqual(m.adhik, false, '2029 Chaitra: sankranti 31 min after the new moon must count as inside');
  assert.strictEqual(MONTHS[m.idx], 'Chaitra');
  assert.strictEqual(m.sankrantis.length, 1);
  const gapMin = (m.sankrantis[0].at - m.prevNM) / 60000;
  assert.ok(gapMin > 0 && gapMin < 60,
    `2029 Mesha Sankranti should sit inside the first hour of the month, got ${gapMin.toFixed(1)} min`);
}
{
  // 1963: Dhanu Sankranti 48 minutes BEFORE the closing new moon. It still
  // belongs to this month.
  const m = findMonth('1963-12-01');
  const last = m.sankrantis[m.sankrantis.length - 1];
  const gapMin = (m.nextNM - last.at) / 60000;
  assert.ok(gapMin > 0 && gapMin < 60,
    `1963 Dhanu Sankranti should sit inside the last hour of the month, got ${gapMin.toFixed(1)} min`);
  assert.strictEqual(RASHI[last.sign], 'Dhanu');
}

// ---------------------------------------------------------------------------
// 4. Structure of the whole 1900-2100 run.
// ---------------------------------------------------------------------------
const adhikas = months.map((m, i) => ({ ...m, i })).filter((m) => m.adhik);
const kshayas = months.filter((m) => m.sankrantis.length === 2);

// (a) NEVER two in a row. This is the impossible thing the old code produced.
for (let k = 1; k < months.length; k++) {
  assert.ok(!(months[k].adhik && months[k - 1].adhik),
    `two Adhika Masas back to back: ${iso(months[k - 1].prevNM)} and ${iso(months[k].prevNM)}`);
}

// (b) Rate. 2488 months / 76 adhikas = one every 32.7 — the published ~32.5 [W].
assert.strictEqual(adhikas.length, 76,
  `expected 76 Adhika Masas in ${Y0}-${Y1}, got ${adhikas.length}`);
const meanGap = months.length / adhikas.length;
assert.ok(meanGap > 31.5 && meanGap < 33.5, `mean spacing ${meanGap.toFixed(2)} months is off the published ~32.5`);

// (c) Spacing. Every gap sits in 27-36 lunar months EXCEPT across a Kshaya Masa,
//     where a second Adhika Masa follows within the same year. That happens
//     exactly twice in the range and only where a Kshaya Masa sits between the
//     two — asserted, not waved through.
const gaps = [];
for (let k = 1; k < adhikas.length; k++) gaps.push(adhikas[k].i - adhikas[k - 1].i);
const shortGaps = [];
gaps.forEach((g, k) => {
  if (g >= 27 && g <= 36) return;
  const between = months.slice(adhikas[k].i + 1, adhikas[k + 1].i);
  assert.ok(between.some((m) => m.sankrantis.length === 2),
    `Adhika Masas ${iso(adhikas[k].prevNM)} and ${iso(adhikas[k + 1].prevNM)} are only ${g} months apart with no Kshaya Masa between them`);
  shortGaps.push(`${iso(adhikas[k].prevNM)}→${iso(adhikas[k + 1].prevNM)} (${g}, Kshaya year)`);
});
assert.strictEqual(shortGaps.length, 2, `expected exactly 2 Kshaya-Masa short gaps, got ${shortGaps.length}`);

// (d) Kshaya Masa — a month holding TWO sankrantis. Rare (once in 19-141 years);
//     exactly two fall in this range and both sit where the literature puts them.
//     Ganak has NO compound month name for a Kshaya Masa; the month takes the
//     later name and the earlier one drops out of that year. Known gap, pinned so
//     it cannot grow silently — see the research note § 6.
assert.deepStrictEqual(kshayas.map((m) => iso(m.prevNM)), ['1963-11-16', '1983-01-14'],
  'the set of Kshaya Masas in 1900-2100 changed');

// (e) [W] "No adhika-masa falls during the months of Margashirsha to Magha."
for (const m of adhikas) {
  assert.ok(![8, 9, 10].includes(m.idx),
    `Adhika ${MONTHS[m.idx]} at ${iso(m.prevNM)} — no adhika-masa can fall in Margashirsha..Magha`);
}

// (f) [W] Adhika Kartika is extremely rare: once in 1901-2150, in 1963.
const kartikas = adhikas.filter((m) => m.idx === 7).map((m) => iso(m.prevNM));
assert.deepStrictEqual(kartikas, ['1963-10-17'],
  `expected exactly one Adhika Kartika (1963) in ${Y0}-${Y1}, got ${JSON.stringify(kartikas)}`);

// ---------------------------------------------------------------------------
// 5. Pin the Adhika Masa years and month names to the published references.
//    [start civil date, month name doubled, source tag]
//    The engine reports the new-moon INSTANT; the published start is the first
//    tithi day, so it is the new-moon day or the day after.
// ---------------------------------------------------------------------------
const PUBLISHED = [
  ['2012-08-18', 'Bhadrapada', 'H'],
  ['2015-06-17', 'Ashadha', 'H'],
  ['2018-05-16', 'Jyeshtha', 'H'],
  ['2020-09-18', 'Ashwina', 'H'],
  ['2023-07-18', 'Shravana', 'P/H'],
  ['2026-05-17', 'Jyeshtha', 'P/H'],
  ['2029-03-16', 'Chaitra', 'P/H'],
  ['2031-08-19', 'Bhadrapada', 'P/H'],
  ['2034-06-17', 'Ashadha', 'H'],
];
for (const [start, name, src] of PUBLISHED) {
  const hits = adhikas.filter((m) => {
    const delta = Date.parse(start + 'T00:00Z') - Date.parse(iso(m.prevNM) + 'T00:00Z');
    return delta === 0 || delta === DAY;
  });
  assert.strictEqual(hits.length, 1,
    `[${src}] Adhika Masa published to start ${start}: engine has ${hits.length} candidate months`);
  assert.strictEqual(MONTHS[hits[0].idx], name,
    `[${src}] Adhika Masa starting ${start} should double ${name}, engine says ${MONTHS[hits[0].idx]}`);
  // exactly one Adhika Masa in that published year, no more
  const year = start.slice(0, 4);
  const inYear = adhikas.filter((m) => iso(m.prevNM).slice(0, 4) === year);
  assert.strictEqual(inYear.length, 1,
    `[${src}] ${year} should hold exactly one Adhika Masa, engine has ${inYear.length}: ${inYear.map((m) => m.label).join(', ')}`);
}

// ---------------------------------------------------------------------------
// 6. The downstream damage, pinned. Every 2029 date below is Drik Panchang's
//    published date for New Delhi [D]. Before the fix Ganak had no nija Chaitra
//    at all, so the first three did not exist and the rest fired a month early.
// ---------------------------------------------------------------------------
const app = loadApp();
const DELHI = { zone: 'Asia/Kolkata', lat: 28.6139, lon: 77.2090 };
const cal2029 = app.scanPanchangCalendar(Date.UTC(2029, 0, 1) - IST * 3600000, IST, 366, 366, DELHI);
const fired = new Map();
for (const f of cal2029.festivals) if (!fired.has(f.key)) fired.set(f.key, iso(f.ms));

const DRIK_2029 = {
  gudiPadwa: '2029-04-14',          // was: absent
  ugadi: '2029-04-14',              // was: absent
  chaitraNavratri: '2029-04-14',    // was: absent
  chaitraGhatasthapana: '2029-04-14', // was: absent
  akshaya: '2029-05-16',            // was: 2029-04-16
  parashuramaJayanti: '2029-05-16', // was: 2029-04-16
  sitaNavami: '2029-05-22',         // was: 2029-04-23
  buddhaPurnima: '2029-05-27',      // was: 2029-04-28
  naradaJayanti: '2029-05-28',      // was: 2029-04-29
  shaniJayanti: '2029-06-12',       // was: 2029-05-13
  gangaDussehra: '2029-06-21',      // unchanged control
  vatPurnima: '2029-06-26',         // unchanged control
};
const wrong = [];
for (const [key, want] of Object.entries(DRIK_2029)) {
  const got = fired.get(key) || 'ABSENT';
  if (got !== want) wrong.push(`${key}: Ganak ${got}, Drik ${want}`);
}
assert.deepStrictEqual(wrong, [], 'Drik-published 2029 festival dates no longer match:\n  ' + wrong.join('\n  '));

// ---------------------------------------------------------------------------
// 7. Two KNOWN residuals in 2029 that this fix did NOT cause and does NOT fix.
//    Pinned so they stay visible and can only shrink. Both are defects in
//    src/engine/festivals.ts (a different owner's file) — see the research note
//    § 7 for the handoff.
// ---------------------------------------------------------------------------
// (i) Vat Savitri — RESOLVED 2026-08-19, pin inverted rather than deleted.
//     This was pinned at Ganak's wrong 2029-06-12 with the instruction to delete
//     the pin once the split rule landed. The rule landed (see
//     plans/research/festival-day-rules.md): Drik separates Vat Savitri from
//     Shani Jayanti when Amavasya ends soon after sunrise, and Ganak now agrees
//     at 2029-06-11. Keeping the assertion, flipped to the published value, so
//     the fix is held rather than merely un-pinned.
assert.strictEqual(fired.get('vatSavitri'), '2029-06-11',
  'vatSavitri 2029 must stay on Drik\'s published date once the split rule landed');

// (ii) Narasimha Jayanti and Chhinnamasta Jayanti — RESOLVED 2026-08-19, pin
//      inverted rather than deleted. Vaishakha Shukla Chaturdashi is KSHAYA in
//      2029: it begins after the sunrise of 26 May and ends before the sunrise
//      of 27 May, so it never prevailed at a sunrise and the udaya rule emitted
//      nothing — both observances vanished from 2029 entirely, and from 2028
//      too, which is what proved the gap was pre-existing rather than caused by
//      the adhika fix. The kshaya-tithi rule has since landed (see
//      plans/research/festival-day-rules.md): an observance whose tithi never
//      touches a sunrise falls on the day it begins. Both now fire on Drik's
//      published 2029-05-26, and the assertion is kept, flipped, so the fix is
//      held rather than merely un-pinned.
for (const key of ['narasimhaJayanti', 'chhinnamastaJayanti']) {
  assert.strictEqual(fired.get(key), '2029-05-26',
    `${key} must stay on Drik's published 2029-05-26 now that the kshaya-tithi rule has landed`);
}

// ---------------------------------------------------------------------------
console.log(`✓ adhik-masa: ${months.length} lunar months swept ${Y0}-${Y1}`);
console.log(`  ${adhikas.length} Adhika Masas · 0 back to back · mean spacing ${meanGap.toFixed(2)} months (published ~32.5)`);
console.log(`  gaps ${Math.min(...gaps.filter((g) => g >= 27))}-${Math.max(...gaps)} months, plus 2 Kshaya-Masa short gaps: ${shortGaps.join(', ')}`);
console.log(`  ${PUBLISHED.length} Adhika Masa years pinned to published sources · ${Object.keys(DRIK_2029).length} Drik 2029 festival dates pinned`);
console.log('  both former residuals (Vat Savitri, kshaya-tithi Chaturdashi) are FIXED — their pins are inverted and now hold the published dates');
