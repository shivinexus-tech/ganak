#!/usr/bin/env node
// ============================================================================
// validation/samvatsara-years.cjs
//
// Ganak prints THREE era years with THREE DIFFERENT sixty-year-cycle
// (samvatsara) names on three adjacent rows of the same day's full panchang:
//
//     Shaka 1948 Parabhava · Vikram 2083 Siddharthi · Gujarati 2082 Pingala
//
// That looks like an off-by-one bug and is not. They are three separate
// reckonings that roll on three different days and, in the northern case,
// follow a different RULE. Two of the three were verified unchanged; the third
// was wrong and is fixed. Full write-up and sourcing:
//     plans/research/samvatsara-year-names.md
//
// THE DEFECT THIS GATE EXISTS TO STOP (found 2026-08-19).
// `samvatInfo` derived all three names by a FIXED arithmetic offset from the
// era year — `SAMVATSARA[(vikram + 9) % 60]` for the northern one. A fixed
// offset is right for the two luni-solar cycles and structurally impossible for
// the northern Barhaspatya cycle, whose year is ~361.03 days — about 4.23 days
// short of a solar year — so roughly every 85 solar years one samvatsara begins
// and ends inside a single solar year and is EXPUNGED (kshaya). Sewell &
// Dikshit record the northern count as 12 ahead of the southern in 1896; it is
// 13 today and 14 from 2028. Ganak's fixed +13 was therefore correct only for
// Vikram years 2000-2084 (Gregorian 1943-03 to 2028-03) and wrong on both
// sides: 107 of the 191 years 1900-2090 disagreed with the published series,
// including every year from 2028 onwards — under two years away when this was
// found. Vikram 2085 (2028-29) is exactly such an expunction: the cycle steps
// Raudra -> Dundubhi and Durmati never runs at all.
//
// PUBLISHED REFERENCES
//  [SD] R. Sewell & S. B. Dikshit, *The Indian Calendar* (London, 1896),
//       Arts. 53-62. Public domain; full text at
//       archive.org/stream/IndianCalendarSewelDikshit (fetched 2026-08-19).
//       Art. 54 — the Barhaspatya samvatsara is 361.026721 days by the
//         Surya-Siddhanta, "about 4.232 days less than a solar year", and "when
//         two Barhaspatya samvatsaras begin during one solar year the first is
//         said to be expunged"; "one expunction is due in every period of 85
//         solar years".
//       Art. 55 — "the samvatsara which is current at the beginning of a year is
//         in practice coupled with all the days of that year". This is why the
//         northern name is read at the year's MESHA SANKRANTI.
//       Art. 62 — the southern cycle stopped expunging from Saka 828 (A.D.
//         905-6) / Saka 831 (A.D. 908-9) and "became luni-solar from that year";
//         the rule is to "add 11 to the current Saka year, and divide by 60",
//         counting Prabhava as 1; and "At present the northern samvatsara has
//         advanced by 12 on the southern" (1896).
//  [W]  en.wikipedia.org/wiki/Samvatsara (fetched 2026-08-19) — same 361.026721
//       d figure, "about once every 85 solar years ... one of the named
//       samvatsara is expunged", and North India kept the expunction where the
//       south abandoned it.
//  [D]  drikpanchang.com day-panchang, New Delhi (geoname-id=1261481), fetched
//       2026-08-19. All three era rows plus the Barhaspatya boundary instants,
//       sampled 15 June of every year 1900-2090 (191 years) and daily across
//       each roll-over. Ganak's Shaka and Gujarati values already agreed with
//       every one of those 192 samples before this change.
//  [O]  outlookindia.com Ugadi 2026 brand-studio page and astrogle.com
//       "Parabhava Nama Samvatsara Ugadi Predictions 2026-27" (fetched
//       2026-08-19) — Ugadi 19 Mar 2026 opens Shalivahana Shaka 1948,
//       PARABHAVA samvatsara. Independent of Drik.
//  [G]  hinducalculator.com/gujarati-samvat/ (fetched 2026-08-19) — "Gujarati
//       Samvat 2082 (Pingala)" for August 2026. Independent of Drik.
//  [T]  timeanddate-style Tamil year lists; the Tamil spelling of the same sixty
//       names (Pramodoota, Durmukhi, Hevilambi, Nala) is a real regional
//       variant, NOT a duplicate of the Sanskrit list. See the note § 5.
//
// ANCHORS ARE DATED AND HARD-CODED. Nothing here is pinned to the live sky or
// re-fetched at run time.
// ============================================================================
'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { loadApp } = require('./_load-app.cjs');

const ROOT = path.resolve(__dirname, '..');
const P = loadApp('src/engine/panchang.ts');
const { computeTodayPanchang } = loadApp('src/engine/today-panchang.ts');

let failures = 0;
const check = (label, actual, expected) => {
  if (actual === expected) return;
  failures++;
  console.error(`  FAIL ${label}\n       expected: ${expected}\n       actual:   ${actual}`);
};

// Local-noon anchor, the instant the day panchang is built around.
const noon = (iso, tzHours) => {
  const [y, m, d] = iso.split('-').map(Number);
  return Date.UTC(y, m - 1, d, 12, 0) - tzHours * 3600000;
};
const samvat = (iso, tzHours = 5.5) => {
  const y = Number(iso.slice(0, 4));
  return P.samvatInfo(noon(iso, tzHours), y);
};

// ---------------------------------------------------------------------------
// 1. THE DAY THAT RAISED THE QUESTION — three names, all three correct. [D][O][G]
// ---------------------------------------------------------------------------
console.log('1. 2026-08-18 New Delhi — the three-name day');
{
  const s = samvat('2026-08-18');
  check('shaka', s.shaka, '1948 Parabhava');     // [D][O]
  check('vikram', s.vikram, '2083 Siddharthi');  // [D]
  check('guj', s.guj, '2082 Pingala');           // [D][G]
}

// ---------------------------------------------------------------------------
// 2. ROLL-OVERS — each system turns on its OWN day. One matching date proves
//    nothing about an offset, so every boundary is checked on both sides. [D]
// ---------------------------------------------------------------------------
console.log('2. roll-overs, both sides');
const ROLLS = [
  // Chaitra Shukla 1 — Shaka and Vikram turn together. Ugadi 2026 = 19 Mar. [D][O]
  ['2026-03-18', { shaka: '1947 Vishvavasu', vikram: '2082 Kalayukti', guj: '2082 Pingala' }],
  ['2026-03-19', { shaka: '1948 Parabhava', vikram: '2083 Siddharthi', guj: '2082 Pingala' }],
  ['2025-03-29', { shaka: '1946 Krodhi', vikram: '2081 Pingala', guj: '2081 Anala' }],
  ['2025-03-30', { shaka: '1947 Vishvavasu', vikram: '2082 Kalayukti', guj: '2081 Anala' }],
  // Kartika Shukla 1 (Bestu Varas) — ONLY the Gujarati year turns. [D][G]
  ['2026-11-09', { shaka: '1948 Parabhava', vikram: '2083 Siddharthi', guj: '2082 Pingala' }],
  ['2026-11-10', { shaka: '1948 Parabhava', vikram: '2083 Siddharthi', guj: '2083 Kalayukti' }],
  ['2025-10-21', { shaka: '1947 Vishvavasu', vikram: '2082 Kalayukti', guj: '2081 Anala' }],
  ['2025-10-22', { shaka: '1947 Vishvavasu', vikram: '2082 Kalayukti', guj: '2082 Pingala' }],
  // Mesha sankranti (~14 Apr) turns NOTHING here. The northern name is READ at
  // this instant but the Vikram number and name both changed a month earlier.
  ['2026-04-13', { shaka: '1948 Parabhava', vikram: '2083 Siddharthi', guj: '2082 Pingala' }],
  ['2026-04-15', { shaka: '1948 Parabhava', vikram: '2083 Siddharthi', guj: '2082 Pingala' }],
  // Gregorian new year turns nothing either — the Jan-to-Chaitra window is the
  // one where samvatInfo has to look back to the PREVIOUS Mesha sankranti.
  ['2025-12-31', { shaka: '1947 Vishvavasu', vikram: '2082 Kalayukti', guj: '2082 Pingala' }],
  ['2026-01-01', { shaka: '1947 Vishvavasu', vikram: '2082 Kalayukti', guj: '2082 Pingala' }],
  ['2026-02-14', { shaka: '1947 Vishvavasu', vikram: '2082 Kalayukti', guj: '2082 Pingala' }],
];
for (const [iso, want] of ROLLS) {
  const s = samvat(iso);
  check(`${iso} shaka`, s.shaka, want.shaka);
  check(`${iso} vikram`, s.vikram, want.vikram);
  check(`${iso} guj`, s.guj, want.guj);
}

// ---------------------------------------------------------------------------
// 3. THE TWO EXPUNCTIONS IN LIVING MEMORY AND IN RANGE. [SD Art. 54][D]
//    A fixed offset cannot produce these; this is the block that fails against
//    the old `SAMVATSARA[(vikram + 9) % 60]`.
// ---------------------------------------------------------------------------
console.log('3. expunctions — Manmatha (Vikram 2000) and Durmati (Vikram 2085)');
const EXPUNCTIONS = [
  // Vikram 1999 -> 2000: the cycle steps Jaya -> Durmukha; Manmatha is expunged.
  ['1942-06-15', '1999 Jaya'],
  ['1943-06-15', '2000 Durmukha'],
  ['1944-06-15', '2001 Hemalamba'],
  // Vikram 2084 -> 2085: Raudra -> Dundubhi; Durmati is expunged.
  ['2027-06-15', '2084 Raudra'],
  ['2028-06-15', '2085 Dundubhi'],
  ['2029-06-15', '2086 Rudhirodgari'],
  // ...and immediately after the 2028 Chaitra roll, not only in mid-year.
  ['2028-03-27', '2085 Dundubhi'],
];
for (const [iso, want] of EXPUNCTIONS) check(`${iso} vikram`, samvat(iso).vikram, want);

// A name normally returns as a Vikram year every 60 years. An expunction bends
// that: the skipped name waits 119 years instead of 60, and every name after it
// in the cycle comes back 59 years later instead of 60. Those two gaps are the
// sharpest fingerprint of the expunctions there is, and a fixed offset produces
// a flat 60 everywhere.
{
  const yearsCarrying = (name) => {
    const out = [];
    for (let y = 1900; y <= 2100; y++) if (samvat(`${y}-06-15`).vikram.split(' ')[1] === name) out.push(y);
    return out.join(',');
  };
  // Manmatha's 1943 slot is expunged: 1943 -> next run 2002, then a normal 60.
  check('Manmatha as a Vikram year', yearsCarrying('Manmatha'), '2002,2061');
  // Durmati runs 1909, then 59 years later (the 1943 expunction shortened the
  // interval), and its 2028 slot is itself expunged: 1968 -> 2087, a gap of 119.
  check('Durmati as a Vikram year', yearsCarrying('Durmati'), '1909,1968,2087');
}

// ---------------------------------------------------------------------------
// 4. THE NORTHERN COUNT'S LEAD OVER THE SOUTHERN: 12, then 13, then 14. [SD 62][D]
//    Sewell & Dikshit measured 12 in 1896. Ganak must reproduce the same
//    step function, which is the whole reason a fixed offset is wrong.
// ---------------------------------------------------------------------------
console.log('4. northern lead over southern — 12 / 13 / 14');
const NAMES = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'src/engine/panchang.ts'), 'utf8')
    .match(/const SAMVATSARA = (\[[\s\S]*?\]);/)[1]
);
const idxOf = (field) => NAMES.indexOf(field.split(' ')[1]);
const lead = (iso) => { const s = samvat(iso); return ((idxOf(s.vikram) - idxOf(s.shaka)) % 60 + 60) % 60; };
check('1900 lead', lead('1900-06-15'), 12);
check('1942 lead (last year of the 12 era)', lead('1942-06-15'), 12);
check('1943 lead (first year of the 13 era)', lead('1943-06-15'), 13);
check('2026 lead', lead('2026-06-15'), 13);
check('2027 lead (last year of the 13 era)', lead('2027-06-15'), 13);
check('2028 lead (first year of the 14 era)', lead('2028-06-15'), 14);
check('2090 lead', lead('2090-06-15'), 14);
// and nothing else moves in between — exactly two steps over 191 years.
{
  let steps = 0, prev = lead('1900-06-15');
  for (let y = 1901; y <= 2090; y++) { const l = lead(`${y}-06-15`); if (l !== prev) steps++; prev = l; }
  check('exactly two expunctions 1900-2090', steps, 2);
}

// ---------------------------------------------------------------------------
// 5. THE SOUTHERN AND GUJARATI CYCLES DO NOT EXPUNGE. [SD Art. 62][D][O][G]
//    Their names advance by exactly one per era year, forever. Published
//    Ugadi-year anchors spot-check the absolute phase.
// ---------------------------------------------------------------------------
console.log('5. southern + Gujarati cycles are pure luni-solar counts');
const SHAKA_ANCHORS = [
  ['2024-06-15', '1946 Krodhi'],        // Ugadi 9 Apr 2024 [D]
  ['2025-06-15', '1947 Vishvavasu'],    // Ugadi 30 Mar 2025 [D]
  ['2026-06-15', '1948 Parabhava'],     // Ugadi 19 Mar 2026 [D][O]
  ['1900-06-15', '1822 Sharvari'],      // [D]
  ['1950-06-15', '1872 Vikriti'],       // [D]
  ['2000-06-15', '1922 Vikrama'],       // [D]
  ['2050-06-15', '1972 Pramoda'],       // [D]
  ['2100-06-15', '2022 Raudra'],        // [D]
];
for (const [iso, want] of SHAKA_ANCHORS) check(`${iso} shaka`, samvat(iso).shaka, want);
const GUJ_ANCHORS = [
  ['2025-06-15', '2081 Anala'],         // [D]
  ['2026-06-15', '2082 Pingala'],       // [D][G]
  ['2027-06-15', '2083 Kalayukti'],     // [D]
  ['1900-06-15', '1956 Virodhikrit'],   // [D]
  ['1950-06-15', '2006 Plava'],         // [D]
  ['2000-06-15', '2056 Khara'],         // [D]
  ['2050-06-15', '2106 Vrisha'],        // [D]
  ['2100-06-15', '2156 Prajapati'],     // [D]
];
for (const [iso, want] of GUJ_ANCHORS) check(`${iso} guj`, samvat(iso).guj, want);
// step-of-one over the whole range, both cycles
for (const key of ['shaka', 'guj']) {
  let bad = 0, prev = samvat(`1900-06-15`)[key];
  for (let y = 1901; y <= 2100; y++) {
    const cur = samvat(`${y}-06-15`)[key];
    const dy = Number(cur.split(' ')[0]) - Number(prev.split(' ')[0]);
    const di = ((NAMES.indexOf(cur.split(' ')[1]) - NAMES.indexOf(prev.split(' ')[1])) % 60 + 60) % 60;
    if (dy !== 1 || di !== 1) bad++;
    prev = cur;
  }
  check(`${key} advances one year + one name every year 1900-2100`, bad, 0);
}

// ---------------------------------------------------------------------------
// 6. THE GUJARATI YEAR IS ONE BEHIND VIKRAM FOR ~5 MONTHS EVERY YEAR. [D][G]
//    This is the second thing that reads like a bug and is not.
// ---------------------------------------------------------------------------
console.log('6. Gujarati number trails Vikram between Chaitra and Diwali');
for (const iso of ['2026-04-01', '2026-06-15', '2026-08-18', '2026-10-01']) {
  const s = samvat(iso);
  check(`${iso} guj is one behind vikram`,
    Number(s.vikram.split(' ')[0]) - Number(s.guj.split(' ')[0]), 1);
}
for (const iso of ['2026-11-15', '2026-12-31', '2027-01-20', '2027-03-01']) {
  const s = samvat(iso);
  check(`${iso} guj has caught up with vikram`,
    Number(s.vikram.split(' ')[0]) - Number(s.guj.split(' ')[0]), 0);
}

// ---------------------------------------------------------------------------
// 7. MORE THAN ONE CITY, END TO END. The era year is a property of the day,
//    not of the place, so every city on the same panchang day must agree — but
//    a city whose local day has not yet rolled over must NOT jump early.
// ---------------------------------------------------------------------------
console.log('7. several cities, through computeTodayPanchang');
const CITIES = [
  { name: 'New Delhi', lat: 28.6139, lon: 77.209, zone: 'Asia/Kolkata' },
  { name: 'Mumbai', lat: 19.076, lon: 72.8777, zone: 'Asia/Kolkata' },
  { name: 'Chennai', lat: 13.0827, lon: 80.2707, zone: 'Asia/Kolkata' },
  { name: 'Ahmedabad', lat: 23.0225, lon: 72.5714, zone: 'Asia/Kolkata' },
  { name: 'Kathmandu', lat: 27.7172, lon: 85.324, zone: 'Asia/Kathmandu' },
  { name: 'London', lat: 51.5074, lon: -0.1278, zone: 'Europe/London' },
];
for (const city of CITIES) {
  const tz = city.zone === 'Asia/Kathmandu' ? 5.75 : city.zone === 'Europe/London' ? 1 : 5.5;
  const p = computeTodayPanchang(city, 'lahiri', noon('2026-08-18', tz));
  check(`${city.name} shaka`, p.samvat.shaka, '1948 Parabhava');
  check(`${city.name} vikram`, p.samvat.vikram, '2083 Siddharthi');
  check(`${city.name} guj`, p.samvat.guj, '2082 Pingala');
}
// the 2028 expunction seen from four cities, on the Chaitra roll itself
for (const city of CITIES.slice(0, 4)) {
  const p = computeTodayPanchang(city, 'lahiri', noon('2028-06-15', 5.5));
  check(`${city.name} 2028 vikram`, p.samvat.vikram, '2085 Dundubhi');
}

// ---------------------------------------------------------------------------
// 8. THE TWO ROMANISATIONS. `SAMVATSARA` (Sanskrit) and `TAMIL_YEARS_EN` (Tamil)
//    are the SAME sixty names in the SAME order, spelled two ways. That is a
//    real regional difference and must not be "fixed" into one list — but the
//    two must never drift out of alignment either. [T], note § 5.
// ---------------------------------------------------------------------------
console.log('8. Sanskrit and Tamil name lists stay index-aligned');
const TAMIL = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'src/engine/calendar-conventions.ts'), 'utf8')
    .match(/const TAMIL_YEARS_EN = (\[[\s\S]*?\]);/)[1]
);
check('SAMVATSARA length', NAMES.length, 60);
check('TAMIL_YEARS_EN length', TAMIL.length, 60);
check('no duplicate Sanskrit names', new Set(NAMES).size, 60);
check('no duplicate Tamil names', new Set(TAMIL).size, 60);
// Exactly these six indices may differ, and only in these ways. A seventh
// divergence means someone edited one list without the other.
const EXPECTED_DIVERGENCE = {
  3: ['Pramoda', 'Pramodoota'],
  4: ['Prajapati', 'Prajotpatti'],
  29: ['Durmukha', 'Durmukhi'],
  30: ['Hemalamba', 'Hevilambi'],
  46: ['Pramadi', 'Pramadicha'],
  49: ['Anala', 'Nala'],
};
{
  const actual = {};
  NAMES.forEach((n, i) => { if (n !== TAMIL[i]) actual[i] = [n, TAMIL[i]]; });
  check('divergent indices', JSON.stringify(actual), JSON.stringify(EXPECTED_DIVERGENCE));
}

// ---------------------------------------------------------------------------
// 9. NO SILENT DRIFT IN THE JOVIAN CONSTANTS. The period and epoch were fitted
//    to 191 published boundary instants; a typo in either would move a
//    boundary. These two dates sit ~1.05 and ~1.19 days from a Jovian boundary
//    — the tightest margins anywhere in 1900-2100 — so they are the first
//    things a bad constant breaks.
// ---------------------------------------------------------------------------
console.log('9. tightest Jovian boundary margins');
check('1942 (boundary 1.04 d away)', samvat('1942-06-15').vikram, '1999 Jaya');
check('2028 (boundary 1.19 d away)', samvat('2028-06-15').vikram, '2085 Dundubhi');
check('1941', samvat('1941-06-15').vikram, '1998 Vijaya');
check('2029', samvat('2029-06-15').vikram, '2086 Rudhirodgari');

// ---------------------------------------------------------------------------
console.log('');
if (failures) {
  console.error(`samvatsara-years: ${failures} FAILURE(S)`);
  process.exit(1);
}
console.log('samvatsara-years: PASS — three era years, three cycles, all anchored to published sources');
