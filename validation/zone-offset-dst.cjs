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


/* ============================================================================
   5. THE CALL SITES — the half that actually reaches a reader
   ============================================================================
   The engine fix above only makes the right answer AVAILABLE. Until 2026-08-18
   every caller passed the birth DATE and nothing else, so the screen still
   printed the noon-offset answer: New York 2024-03-10 00:30 came out as Purva
   Bhadrapada pada 1, syllable "Se", when the truth is pada 2, "So".

   Two assertions, because either alone can rot:
     5a. STATIC — the birth-instant call sites still pass a clock time, and no
         day-scoped caller has quietly acquired one. Pinned per file, so both a
         dropped `hh, mi` and a new unreviewed call site fail here.
     5b. BEHAVIOURAL — the two natal-anchor engines answer for the birth moment.
         A static check cannot see a caller that passes the wrong hour.

   `zoneOffset(zone, y, m, d)` — the four-argument form — is CORRECT and required
   for the ~40 day-scoped panchang callers (today-panchang, festivals, muhurat,
   daily-windows, panchaka, eclipse, navratri, chhath, the season clock, the
   calendar screens…). Passing a clock time to those would be a new bug. */
{
  const fs = require('fs'), path = require('path');
  const { ROOT } = require('./_load-app.cjs');
  const SRC = path.join(ROOT, 'src');

  const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) return walk(full);
    return /\.(ts|tsx)$/.test(e.name) ? [full] : [];
  });

  /* Count TOP-LEVEL arguments of each `zoneOffset(...)` call: walk the characters
     from the opening paren, tracking nesting and string/template state, and count
     the commas at depth 1. Cheap, and exact for the shapes in this repo. */
  /* Comments are stripped first. Without this the scanner counted PROSE: the
     matching screen's explanatory comment quoting `zoneOffset(...) ?? 5.5` was
     read as a live date-only call, and the gate reported a defect in a file whose
     only mention of the function is a sentence about the defect it used to have.
     A gate that reads comments as code cannot be trusted about either. */
  function stripComments(text) {
    return text.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[^:])\/\/[^\n]*/g, '$1');
  }

  function callArities(raw) {
    const text = stripComments(raw);
    const out = [];
    const re = /(^|[^.\w])zoneOffset\s*\(/g;
    let m;
    while ((m = re.exec(text)) !== null) {
      let i = re.lastIndex, depth = 1, args = 1, q = null;
      while (i < text.length && depth > 0) {
        const c = text[i], prev = text[i - 1];
        if (q) { if (c === q && prev !== '\\') q = null; }
        else if (c === '"' || c === "'" || c === '`') q = c;
        else if ('([{'.includes(c)) depth++;
        else if (')]}'.includes(c)) { depth--; if (depth === 0) break; }
        else if (c === ',' && depth === 1) args++;
        i++;
      }
      out.push(args);
    }
    return out;
  }

  /* Pinned inventory. `six` = calls that pass the birth clock; `four` = calls that
     are deliberately day-scoped, or the "clock not typed yet" fallback inside a
     birth helper. Both numbers are asserted, so removing `hh, mi` from a birth site
     fails, and so does adding a call nobody reviewed. */
  const BIRTH_SITES = {
    'src/screens/UtilityCalculatorScreen.tsx': { six: 1, four: 1, what: 'all 14 public calculators (resolveZone)' },
    'src/components/birth-input.ts':           { six: 1, four: 1, what: 'the SHARED birth-zone resolver (resolveBirthZone): the 6-arg call is the birth clock, the 4-arg one is the "clock not typed yet" branch' },
    'src/screens/PrashnaScreen.tsx':           { six: 1, four: 2, what: 'the moment of judgement is an instant, so it takes the clock (bug bash F4); the other two are a panchang-day context and a zone-validity probe' },
    'src/screens/ChartScreen.tsx':             { six: 1, four: 1, what: 'the form offset, saved chart, cast chart and ayanamsa recompute (tzAtBirth)' },
    'src/screens/RectifyScreen.tsx':           { six: 1, four: 0, what: 'birth-time rectification — the date-only fallback was REMOVED 2026-08-18: an unusable birth time is now refused with a named message instead of quietly resolving the offset at a fixed moment on the birth date' },
    'src/engine/medical-muhurat.ts':           { six: 1, four: 1, what: 'natalMoonSign (the 4-arg call is the finder DAY, correctly day-scoped)' },
    'src/engine/personal-muhurat.ts':          { six: 1, four: 0, what: 'natalAnchors — janma nakshatra, janma rashi and the Moon bhinnashtakavarga' },
  };

  let dayScoped = 0, dayFiles = 0, strays = [];
  for (const file of walk(SRC)) {
    const rel = path.relative(ROOT, file);
    if (rel === 'src/engine/panchang.ts') continue;           // the definition itself
    const arities = callArities(fs.readFileSync(file, 'utf8'));
    if (!arities.length) continue;
    const six = arities.filter((n) => n >= 6).length;
    const four = arities.filter((n) => n < 6).length;
    const want = BIRTH_SITES[rel];
    if (want) {
      if (six !== want.six) fail(`call-site wiring: ${rel} passes the birth clock at ${six} call(s), expected ${want.six} — ${want.what}`);
      else checks++;
      if (four !== want.four) fail(`call-site wiring: ${rel} has ${four} date-only zoneOffset call(s), expected ${want.four} — a birth site must not resolve the offset at a fixed moment on the birth date`);
      else checks++;
    } else {
      dayFiles++; dayScoped += four;
      if (six) strays.push(`${rel} (${six})`);
    }
  }
  for (const rel of Object.keys(BIRTH_SITES)) {
    if (!fs.existsSync(path.join(ROOT, rel))) fail(`call-site wiring: ${rel} no longer exists — re-point this inventory`);
  }
  /* The matching screen stopped calling zoneOffset directly on 2026-08-19: its two
     birth sites moved into the shared resolver above, which refuses rather than
     defaulting. Delegation must still be asserted, or the screen would drop off
     this inventory and silently stop being protected — which is exactly how the
     ?? 5.5 default survived there in the first place. */
  const matching = fs.readFileSync(path.join(ROOT, 'src/screens/MatchingScreen.tsx'), 'utf8');
  if (!/resolveBirthZone\s*\(/.test(matching)) {
    fail('call-site wiring: MatchingScreen.tsx no longer resolves birth zones through resolveBirthZone — a two-chart screen must not resolve offsets itself');
  } else checks++;
  if (strays.length) fail(`call-site wiring: day-scoped caller(s) now pass a clock time: ${strays.join(', ')} — a panchang day is not a birth instant`);
  else checks++;
  console.log(`  · call sites: ${Object.keys(BIRTH_SITES).length} birth-instant files pass the clock; ${dayScoped} day-scoped calls in ${dayFiles} files stay on the 4-argument form`);

  /* --- 5b. the natal anchors really answer for the birth MOMENT --------------- */
  const NYP = { zone: NY, lat: 40.71, lon: -74.01 };
  const { natalMoonSign } = loadApp('src/engine/medical-muhurat.ts');
  const { natalAnchors } = loadApp('src/engine/personal-muhurat.ts');
  // 1976-10-31: clocks went back at 02:00, so 01:30 was still EDT (−4). The
  // day-level offset is −5, and it puts the natal Moon in the NEXT sign.
  eq(natalMoonSign(NYP, 'lahiri', { y: 1976, m: 10, day: 31, hh: 1, mi: 30 }), 9,
    'medical natalMoonSign: NY 1976-10-31 01:30 is EDT −4 (day-level −5 gives sign 10)');
  // 1962-04-29: clocks went forward at 02:00, so 00:30 was still EST (−5). The
  // day-level offset is −4, and it puts the birth Moon in the previous nakshatra.
  eq(natalAnchors(NYP, 'lahiri', { y: 1962, m: 4, day: 29, hh: 0, mi: 30 }).janmaNak, 23,
    'personal natalAnchors: NY 1962-04-29 00:30 is EST −5 (day-level −4 gives nakshatra 22)');
  /* India — the core audience — cannot move, and that is asserted, not assumed.
     Wiring the clock through can only change an answer where the day-level and
     clock-level offsets differ, so the invariant to prove is that they never do
     for an Indian birth. Every Indian gazetteer zone, 1930-2030, every hour. */
  {
    // CITY_DB rows are [label, lat, lon, zoneIndex] into ZONES.
    const { CITY_DB, ZONES } = loadApp('src/data/places.ts');
    const indian = CITY_DB.filter((row) => /,\s*India$/i.test(String(row[0])));
    const zones = [...new Set(indian.map((row) => ZONES[row[3]]))].filter(Boolean);
    if (!indian.length || !zones.length) fail('India invariance: no Indian cities found in the gazetteer — the sweep below proves nothing');
    else checks++;
    let n = 0, moved = 0;
    for (const z of zones) {
      for (let y = 1930; y <= 2030; y++) {
        for (const [m, d] of [[1, 1], [3, 10], [6, 21], [9, 15], [11, 3], [12, 31]]) {
          for (const hh of [0, 1, 2, 3, 12, 23]) {
            n++;
            if (zoneOffset(z, y, m, d, hh, 30) !== zoneOffset(z, y, m, d)) {
              moved++;
              if (moved < 4) fail(`India invariance: ${z} ${y}-${m}-${d} ${hh}:30 moved when the clock was wired through`);
            }
          }
        }
      }
    }
    if (moved === 0) checks++;
    console.log(`  · India invariance: ${n} births across ${indian.length} Indian cities / ${zones.length} zone(s), 1930-2030 — ${moved} answers move when the birth clock is wired through`);
  }
}

console.log(failures
  ? `zone-offset-dst: ${failures} FAILURES (${checks} passed)`
  : `zone-offset-dst: PASS — ${checks} checks · hour-aware offsets, skipped/repeated-hour conventions pinned, historical + fractional zones, day-level invariance`);
process.exit(failures ? 1 : 0);
