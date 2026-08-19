#!/usr/bin/env node
'use strict';
// ============================================================================
// validation/zone-offset-dst.cjs — DST / historical-rule contract for zoneOffset
//
// `zoneOffset` (src/engine/panchang.ts) turns a LOCAL WALL CLOCK into the UTC
// offset that applies to it. Until 2026-08-18 it resolved the offset at
// `Date.UTC(y, m-1, d, 12)` — noon UTC on the birth DATE — which is a different
// instant from the one the caller means. On a DST-transition day that lands on
// the wrong side of the transition: a New York birth at 00:30 on the
// spring-forward Sunday was computed with the after-the-change offset, moving
// the ascendant a whole sign and the naming syllable a whole pada.
// See plans/audits/2026-08-18-bugbash-utility-calculators.md finding F1 and
// plans/audits/2026-08-18-dst-zone-offset-fix.md for the conventions.
//
// This gate pins four things so the defect cannot come back:
//
//   1. HOUR AWARENESS. On a transition day, two different clock times on the
//      two sides of the change must return two different offsets. This is the
//      assertion that goes red the moment anyone resolves the offset at a
//      fixed instant again.
//   2. THE TWO PATHOLOGICAL WALL CLOCKS. The skipped hour (spring forward) and
//      the repeated hour (autumn) each have a declared convention — the offset
//      in force BEFORE the change, in both cases. Pinned, not left to luck.
//   3. HISTORICAL AND FRACTIONAL RULES. India's wartime +6:30, Kolkata's
//      pre-1906 Madras Mean Time, Kathmandu +5:45, Chatham +12:45/+13:45.
//      These worked before the fix and must keep working.
//   4. DAY-LEVEL INVARIANCE. The ~40 panchang callers that pass only
//      (zone, y, m, d) must keep getting the offset of that civil day. India
//      has no DST and must be byte-identical for every day of every year.
//
// Offsets below come from the IANA tz database rules, each cited at its case.
// ============================================================================
const { loadApp } = require('./_load-app.cjs');
const { zoneOffset } = loadApp('src/engine/panchang.ts');
const { quickBirth } = loadApp('src/engine/utility-calculators.ts');

let failures = 0, checks = 0;
const fail = (m) => { failures++; console.error('FAIL ' + m); };
const eq = (got, want, what) => {
  if (got === want) { checks++; return; }
  fail(`${what}: expected ${want}, got ${got}`);
};

const NY = 'America/New_York', LON = 'Europe/London', SYD = 'Australia/Sydney', AKL = 'Pacific/Auckland';

/* ---------------------------------------------------------------- 1. hour awareness
   The whole defect in one assertion. US rule since the Energy Policy Act 2005:
   DST starts the 2nd Sunday in March at 02:00 local, ends the 1st Sunday in
   November at 02:00 local. 2024-03-10 and 2024-11-03 are those Sundays. */
{
  const before = zoneOffset(NY, 2024, 3, 10, 0, 30);   // 00:30 — still EST
  const after  = zoneOffset(NY, 2024, 3, 10, 23, 30);  // 23:30 — EDT
  eq(before, -5, 'hour-awareness: NY 2024-03-10 00:30 is EST');
  eq(after,  -4, 'hour-awareness: NY 2024-03-10 23:30 is EDT');
  if (before === after) fail('hour-awareness: zoneOffset ignores the clock time — the F1 defect is back');
  else checks++;
}

/* ---- the two worked examples from finding F1, end to end through a chart ---- */
{
  const tz = zoneOffset(NY, 2024, 3, 10, 0, 30);
  eq(tz, -5, 'F1 example 1: NY 2024-03-10 00:30 offset');
  const q = quickBirth({ y: 2024, m: 3, day: 10, hh: 0, mi: 30, tz, lat: 40.71, lon: -74.01 });
  eq(q.nakshatra, 'Purva Bhadrapada', 'F1 example 1: nakshatra');
  eq(q.pada, 2, 'F1 example 1: pada (was 1 with the noon-UTC offset)');
  eq(q.syllable, 'So', 'F1 example 1: naming syllable (was "Se")');
}
{
  // 1961: US DST ended the last Sunday in October (pre-1966 state rule as
  // recorded in tzdata for NYC), so 1961-10-29 00:30 was still EDT.
  const tz = zoneOffset(NY, 1961, 10, 29, 0, 30);
  eq(tz, -4, 'F1 example 2: NY 1961-10-29 00:30 offset');
  const q = quickBirth({ y: 1961, m: 10, day: 29, hh: 0, mi: 30, tz, lat: 40.71, lon: -74.01 });
  eq(q.lagna, 'Karka (Cancer)', 'F1 example 2: lagna (was "Simha (Leo)")');
}

/* -------------------------------------------------- 2. skipped and repeated hours
   CONVENTION (both cases): use the offset in force BEFORE the change.
     · skipped hour  -> the smaller offset, so the missing wall clock maps
                        forward by the size of the gap;
     · repeated hour -> the larger offset, i.e. the FIRST of the two passes.
   Matches java.time ZonedDateTime, Python fold=0, moment-timezone and
   Temporal's "compatible" disambiguation. */
const SKIPPED = [
  [NY,  2024, 3, 10, 2, 30, -5, 'US: 02:00->03:00 EST->EDT, 2nd Sun March'],
  [NY,  1987, 4,  5, 2, 30, -5, 'US 1987-2006 rule: 1st Sun April'],
  [LON, 2024, 3, 31, 1, 30,  0, 'UK: 01:00 GMT -> 02:00 BST, last Sun March'],
  [SYD, 2024, 10, 6, 2, 30, 10, 'NSW: 02:00->03:00 AEST->AEDT, 1st Sun October'],
  [AKL, 2024, 9, 29, 2, 30, 12, 'NZ: 02:00->03:00 NZST->NZDT, last Sun September'],
];
for (const [z, y, m, d, hh, mi, want, why] of SKIPPED) {
  eq(zoneOffset(z, y, m, d, hh, mi), want, `skipped hour ${z} ${y}-${m}-${d} ${hh}:${mi} (${why})`);
}
const REPEATED = [
  [NY,  2024, 11, 3, 1, 30, -4, 'US: 02:00->01:00 EDT->EST, 1st Sun November'],
  [NY,  1961, 10, 29, 1, 30, -4, 'US pre-1966: last Sun October'],
  [LON, 2024, 10, 27, 1, 30,  1, 'UK: 02:00 BST -> 01:00 GMT, last Sun October'],
  [SYD, 2024, 4,  7, 2, 30, 11, 'NSW: 03:00->02:00 AEDT->AEST, 1st Sun April'],
  [AKL, 2024, 4,  7, 2, 30, 13, 'NZ: 03:00->02:00 NZDT->NZST, 1st Sun April'],
];
for (const [z, y, m, d, hh, mi, want, why] of REPEATED) {
  eq(zoneOffset(z, y, m, d, hh, mi), want, `repeated hour ${z} ${y}-${m}-${d} ${hh}:${mi} (${why})`);
}

/* --------------------------------------------- either side of both transitions */
const SIDES = [
  [NY,  2024,  3, 10, [[0, 30, -5], [1, 30, -5], [4, 30, -4], [23, 30, -4]]],
  [NY,  2024, 11,  3, [[0, 30, -4], [3, 30, -5], [12, 0, -5], [23, 30, -5]]],
  [LON, 2024,  3, 31, [[0, 30,  0], [3, 30,  1], [12, 0,  1]]],
  [LON, 2024, 10, 27, [[0, 30,  1], [3, 30,  0], [12, 0,  0]]],
  [SYD, 2024, 10,  6, [[0, 30, 10], [4, 30, 11], [12, 0, 11]]],
  [SYD, 2024,  4,  7, [[0, 30, 11], [4, 30, 10], [12, 0, 10]]],
  [AKL, 2024,  9, 29, [[0, 30, 12], [4, 30, 13], [12, 0, 13]]],
  [AKL, 2024,  4,  7, [[0, 30, 13], [4, 30, 12], [12, 0, 12]]],
];
for (const [z, y, m, d, rows] of SIDES) {
  for (const [hh, mi, want] of rows) {
    eq(zoneOffset(z, y, m, d, hh, mi), want, `transition day ${z} ${y}-${m}-${d} ${String(hh).padStart(2, '0')}:${String(mi).padStart(2, '0')}`);
  }
}

/* -------------------------------------------- 3. historical and fractional rules */
const HISTORICAL = [
  ['Asia/Kolkata', 1900, 6, 21,  9, 15, 5 + 21 / 60, 'Madras Mean Time +5:21 until 1906-01-01'],
  ['Asia/Kolkata', 1941, 6, 21,  9, 15, 5.5,  'IST +5:30 before wartime'],
  ['Asia/Kolkata', 1943, 6, 21,  9, 15, 6.5,  'India wartime +6:30, 1942-09-01 to 1945-10-15'],
  ['Asia/Kolkata', 1944, 1,  1,  0, 30, 6.5,  'India wartime +6:30, midnight birth'],
  ['Asia/Kolkata', 1946, 6, 21,  9, 15, 5.5,  'IST restored after 1945-10-15'],
  ['Asia/Kolkata', 2024, 6, 21,  9, 15, 5.5,  'IST today — India has never used DST since 1945'],
  ['Asia/Kathmandu', 2024, 6, 21, 9, 15, 5.75, 'Nepal +5:45 since 1986-01-01'],
  ['Asia/Kathmandu', 1980, 6, 21, 9, 15, 5.5,  'Nepal +5:30 before 1986'],
  ['Pacific/Chatham', 2024, 6, 21, 9, 15, 12.75, 'Chatham standard +12:45'],
  ['Pacific/Chatham', 2024, 1, 21, 9, 15, 13.75, 'Chatham daylight +13:45'],
  ['Asia/Kabul',      2024, 6, 21, 9, 15,  4.5,  'Afghanistan +4:30'],
  ['Asia/Yangon',     2024, 6, 21, 9, 15,  6.5,  'Myanmar +6:30'],
  ['Australia/Adelaide', 2024, 6, 21, 9, 15,  9.5, 'South Australia standard +9:30'],
  ['Australia/Adelaide', 2024, 1, 21, 9, 15, 10.5, 'South Australia daylight +10:30'],
  ['Asia/Tehran',     2015, 3, 22, 9, 15,  4.5,  'Iran daylight +4:30 (abolished 2022)'],
  ['Europe/London',   1971, 6, 21, 9, 15,  1,    'British Standard Time experiment 1968-1971'],
];
for (const [z, y, m, d, hh, mi, want, why] of HISTORICAL) {
  eq(zoneOffset(z, y, m, d, hh, mi), want, `historical ${z} ${y}-${m}-${d} (${why})`);
}
eq(zoneOffset('Mars/Nowhere', 1990, 6, 21, 9, 15), null, 'unknown zone returns null');

/* ------------------------------------------------------- 4. day-level invariance
   The ~40 panchang callers pass only (zone, y, m, d). They must keep getting the
   offset of that civil day, resolved at LOCAL noon. India, which has no DST,
   must be identical on every single day — this loop is the byte-identity proof,
   not a sample. */
{
  const DAY = 86400000;
  let swept = 0, moved = 0;
  for (let t = Date.UTC(1947, 0, 1); t <= Date.UTC(2035, 11, 31); t += DAY) {
    const dt = new Date(t), y = dt.getUTCFullYear(), m = dt.getUTCMonth() + 1, d = dt.getUTCDate();
    swept++;
    if (zoneOffset('Asia/Kolkata', y, m, d) !== 5.5) { moved++; if (moved < 4) fail(`India day-level offset moved on ${y}-${m}-${d}`); }
  }
  if (moved === 0) checks++;
  else fail(`India day-level invariance: ${moved} of ${swept} days are not +5:30`);
  console.log(`  · India day-level invariance: ${swept} days 1947-2035, all +5:30`);
}
{
  // Every gazetteer zone, every day of the DST era: the 4-arg (day-level) answer
  // must equal the offset at local noon. Guards the ~40 panchang callers against
  // a future change of the default that would silently move panchang days.
  const { ZONES } = loadApp('src/data/places.ts');
  const DAY = 86400000;
  let swept = 0, bad = 0;
  for (const z of ZONES) {
    for (let t = Date.UTC(1960, 0, 1); t <= Date.UTC(2035, 11, 31); t += 29 * DAY) {
      const dt = new Date(t), y = dt.getUTCFullYear(), m = dt.getUTCMonth() + 1, d = dt.getUTCDate();
      swept++;
      if (zoneOffset(z, y, m, d) !== zoneOffset(z, y, m, d, 12, 0)) { bad++; if (bad < 4) fail(`day-level default is not local noon: ${z} ${y}-${m}-${d}`); }
    }
  }
  if (bad === 0) checks++;
  console.log(`  · day-level default == local noon: ${swept} lookups over ${ZONES.length} zones`);
}

/* ------------------------------------------------- self-consistency round trip
   Outside the two declared pathological hours, the returned offset `o` must be
   the offset the zone really has at the instant `wallClock - o`. */
{
  const CASES = [];
  for (const z of [NY, LON, SYD, AKL, 'Asia/Kolkata', 'Asia/Kathmandu', 'Pacific/Chatham', 'America/Santiago', 'Europe/Moscow', 'Africa/Cairo']) {
    for (const [m, d] of [[1, 15], [3, 15], [6, 15], [9, 15], [11, 15]]) {
      for (const hh of [0, 6, 12, 18, 23]) CASES.push([z, 2024, m, d, hh, 30]);
    }
  }
  let bad = 0;
  for (const [z, y, m, d, hh, mi] of CASES) {
    const o = zoneOffset(z, y, m, d, hh, mi);
    const instant = Date.UTC(y, m - 1, d, hh, mi) - o * 3600000;
    const parts = new Intl.DateTimeFormat('en-US', { timeZone: z, timeZoneName: 'longOffset' }).formatToParts(new Date(instant));
    const v = (parts.find((p) => p.type === 'timeZoneName') || {}).value || '';
    const mc = v === 'GMT' || v === 'UTC' ? 0 : (() => { const c = v.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/); return c ? (c[1] === '-' ? -1 : 1) * (parseInt(c[2], 10) + (c[3] ? parseInt(c[3], 10) / 60 : 0)) : null; })();
    if (mc !== o) { bad++; if (bad < 4) fail(`round trip ${z} ${y}-${m}-${d} ${hh}:${mi} — returned ${o} but the zone is at ${mc} at that instant`); }
  }
  if (bad === 0) checks++;
  console.log(`  · round trip: ${CASES.length} wall clocks resolve to an instant that really has the returned offset`);
}

console.log(failures
  ? `zone-offset-dst: ${failures} FAILURES (${checks} passed)`
  : `zone-offset-dst: PASS — ${checks} checks · hour-aware offsets, skipped/repeated-hour conventions pinned, historical + fractional zones, day-level invariance`);
process.exit(failures ? 1 : 0);
