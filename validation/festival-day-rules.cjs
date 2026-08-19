#!/usr/bin/env node
// ============================================================================
// validation/festival-day-rules.cjs
//
// WHICH PART OF THE DAY DECIDES A FESTIVAL'S DATE.
//
// Ganak ran every Vaishakha observance on the sunrise (udaya) rule. Three of
// them do not use it, and the cost was concrete:
//
//  * Narasimha Jayanti and Chhinnamasta Jayanti (Vaishakha Shukla Chaturdashi)
//    are decided at SUNSET — Drik: "It is believed that Lord Narasimha was
//    appeared during sunset while Chaturdashi was prevailing." Under the
//    sunrise rule they were on the wrong day in 8 of the 12 years 2024-2035
//    and VANISHED ALTOGETHER from 2028 and 2029, where Chaturdashi begins
//    after one sunrise and ends before the next.
//  * Vat Savitri (Jyeshtha Amavasya) is decided at MIDDAY, which is why the
//    published reference splits it from Shani Jayanti when Amavasya ends early
//    in the morning: 2029 Vat Savitri 11 Jun, Shani Jayanti 12 Jun.
//
// This gate pins the published dates AND both non-trivial branches of the
// sunset rule, and re-derives the rule independently of the engine over
// 1900-2100 so the branch mix cannot drift silently.
//
// Full sourcing, every fetched page and the two recorded source disagreements:
//   plans/research/festival-day-rules.md
//
// PUBLISHED REFERENCES — all Drik Panchang, New Delhi (geoname-id=1261481),
// fetched 2026-08-18.
//  [N] /dashavatara/narasimha/narasimha-jayanti-date-time.html?year=YYYY
//  [C] /hindu-goddesses/parvati/mahavidya/chhinnamasta/jayanti/
//      goddess-chhinnamasta-jayanti-date.html?year=YYYY
//  [V] /festivals/savitri/vat-savitri-date-time.html?year=YYYY
//  [S] /festivals/shani-jayanti/shani-jayanti-date-time.html?year=YYYY
//  [E] Padmini/Parama Ekadashi — sourced in
//      plans/research/ekadashi-lunar-month-naming.md § 5 (Drik dated lists +
//      Wikipedia's Ekadashi table).
// ============================================================================
'use strict';

const assert = require('assert');
const { loadApp } = require('./_load-app.cjs');

const P = loadApp('src/engine/panchang.ts');
const app = loadApp();

const IST = 5.5;
const DAY = 86400000;
const DELHI = { zone: 'Asia/Kolkata', lat: 28.6139, lon: 77.2090 };
const iso = (ms) => new Date(ms + IST * 3600000).toISOString().slice(0, 10);
const rev = (x) => ((x % 360) + 360) % 360;
const tithiIndexAt = (ms) => Math.floor(rev(P.moonSidMs(ms) - P.sunSidMs(ms)) / 12);

// ---------------------------------------------------------------------------
// 1. Published dates, year by year. `null` means the reference was not fetched
//    for that year — the other festival still pins the date.
// ---------------------------------------------------------------------------
const CHATURDASHI_ANCHORS = [
  // year, Drik date, narasimha fetched [N], chhinnamasta fetched [C], what the sunrise rule used to give
  [1996, '1996-05-02', true, false, '1996-05-02'],  // sayahna fallback: no sunset day at all
  [2024, '2024-05-21', true, true, '2024-05-22'],
  [2025, '2025-05-11', true, true, '2025-05-11'],   // sunset on BOTH days -> the later one
  [2026, '2026-04-30', false, true, '2026-04-30'],
  [2027, '2027-05-18', true, false, '2027-05-19'],
  [2028, '2028-05-07', true, true, 'ABSENT'],       // kshaya Chaturdashi
  [2029, '2029-05-26', true, true, 'ABSENT'],       // kshaya Chaturdashi
  [2030, '2030-05-16', true, false, '2030-05-16'],
  [2031, '2031-05-05', true, false, '2031-05-06'],
  [2032, '2032-05-23', true, false, '2032-05-24'],
  [2033, '2033-05-12', true, false, '2033-05-13'],
  [2034, '2034-05-01', true, false, '2034-05-02'],
  [2035, '2035-05-20', true, true, '2035-05-21'],
];

// Vat Savitri [V] vs Shani Jayanti [S]: the same Amavasya, two different rules.
const AMAVASYA_ANCHORS = [
  // year, Drik Vat Savitri, Drik Shani Jayanti (null = not fetched), sunrise-rule date
  [1969, '1969-05-15', null, null],
  [1994, '1994-06-08', null, null],
  [1995, '1995-05-28', null, null],
  [1997, '1997-06-04', null, null],
  [2024, '2024-06-06', '2024-06-06', '2024-06-06'],
  [2025, '2025-05-26', '2025-05-27', '2025-05-27'],
  [2026, '2026-05-16', '2026-05-16', '2026-05-16'],
  [2028, '2028-05-24', null, '2028-05-24'],
  [2029, '2029-06-11', '2029-06-12', '2029-06-12'],
  [2030, '2030-05-31', '2030-06-01', '2030-06-01'],
  [2031, '2031-05-20', '2031-05-21', '2031-05-21'],
  [2034, '2034-05-17', '2034-05-18', '2034-05-18'],
];

// ---------------------------------------------------------------------------
// 2. Run the engine once per anchored year and collect what it emits.
// ---------------------------------------------------------------------------
const years = [...new Set([
  ...CHATURDASHI_ANCHORS.map((r) => r[0]),
  ...AMAVASYA_ANCHORS.map((r) => r[0]),
])].sort();

const emitted = new Map(); // year -> Map(key -> iso date)
for (const y of years) {
  const cal = app.scanPanchangCalendar(Date.UTC(y, 0, 1) - IST * 3600000, IST, 366, 40, DELHI);
  const m = new Map();
  for (const f of cal.festivals) if (!m.has(f.key)) m.set(f.key, iso(f.ms));
  emitted.set(y, m);
}
const got = (y, key) => emitted.get(y).get(key) || 'ABSENT';

const wrong = [];
for (const [y, want, fetchedN, fetchedC, before] of CHATURDASHI_ANCHORS) {
  for (const [key, fetched, tag] of [['narasimhaJayanti', fetchedN, 'N'], ['chhinnamastaJayanti', fetchedC, 'C']]) {
    const have = got(y, key);
    if (have !== want) {
      wrong.push(`[${fetched ? tag : tag + '*'}] ${key} ${y}: Ganak ${have}, published ${want} (sunrise rule gave ${before})`);
    }
  }
}
for (const [y, wantVat, wantShani] of AMAVASYA_ANCHORS) {
  if (got(y, 'vatSavitri') !== wantVat) wrong.push(`[V] vatSavitri ${y}: Ganak ${got(y, 'vatSavitri')}, Drik ${wantVat}`);
  if (wantShani && got(y, 'shaniJayanti') !== wantShani) {
    wrong.push(`[S] shaniJayanti ${y}: Ganak ${got(y, 'shaniJayanti')}, Drik ${wantShani}`);
  }
}
assert.deepStrictEqual(wrong, [], 'published festival dates no longer match:\n  ' + wrong.join('\n  '));

// Vat Savitri and Shani Jayanti must be ABLE to separate — if they are ever
// equal in all anchored years again, the split rule has been undone.
const splitYears = AMAVASYA_ANCHORS.filter(([y]) => got(y, 'vatSavitri') !== got(y, 'shaniJayanti')).map(([y]) => y);
assert.deepStrictEqual(splitYears, [1969, 1994, 1995, 1997, 2025, 2029, 2030, 2031, 2034],
  'Vat Savitri must separate from Shani Jayanti exactly in the early-ending-Amavasya years');

// ---------------------------------------------------------------------------
// 3. The sunset rule, re-derived independently of festivals.ts over 1900-2100,
//    so the branch mix is a measured fact and not a claim.
// ---------------------------------------------------------------------------
const CHATURDASHI = 13; // Shukla 14
const branch = { one: 0, two: [], none: [] };
for (let y = 1900; y <= 2100; y += 1) {
  const atSunset = [];
  for (let k = 0; k < 130; k += 1) {
    const c = new Date(Date.UTC(y, 2, 1 + k));
    const yy = c.getUTCFullYear(), mm = c.getUTCMonth() + 1, dd = c.getUTCDate();
    const tz = P.zoneOffset(DELHI.zone, yy, mm, dd) ?? IST;
    // Cheap filter first: skip the day outright unless it can carry Chaturdashi
    // at sunset. Only then pay for sunrise/sunset and the lunar-month solve.
    const noon = Date.UTC(yy, mm - 1, dd, 12) - tz * 3600000;
    const near = (tithiIndexAt(noon) - CHATURDASHI + 30) % 30;
    if (near > 1 && near < 29) continue;
    const ev = P.sunEvents(yy, mm, dd, tz, DELHI.lat, DELHI.lon);
    if (ev.rise == null || ev.set == null) continue;
    if (tithiIndexAt(ev.set) !== CHATURDASHI) continue;
    const mi = P.amantaMonthIdx(ev.rise);
    if (mi.idx !== 1 || mi.adhik) continue;          // nija Vaishakha only
    atSunset.push(iso(ev.rise));
  }
  if (atSunset.length === 1) branch.one += 1;
  else if (atSunset.length > 1) branch.two.push(`${y}:${atSunset.join(',')}`);
  else branch.none.push(y);
}
assert.strictEqual(branch.one + branch.two.length + branch.none.length, 201, 'one Chaturdashi per year, 1900-2100');
assert.strictEqual(branch.one, 191, 'exactly 191 years have a single sunset-prevailing Chaturdashi');
assert.deepStrictEqual(branch.two.map((s) => Number(s.slice(0, 4))), [1900, 1901, 1956, 1962, 1963, 2025, 2088],
  'the "sunset on both days" branch must fire in exactly these seven years');
assert.deepStrictEqual(branch.none, [1996, 2073, 2082],
  'the Sayahna fallback branch must fire in exactly these three years');
// Each rare branch is anchored to a published date, so neither is untested:
assert.ok(CHATURDASHI_ANCHORS.some(([y]) => y === 2025), 'the two-sunset branch must keep its published anchor');
assert.ok(CHATURDASHI_ANCHORS.some(([y]) => y === 1996), 'the Sayahna-fallback branch must keep its published anchor');

// ---------------------------------------------------------------------------
// 4. Scope guard. The generalisation is narrow ON PURPOSE: different
//    observances legitimately use different day rules. Only these two moved to
//    the sunset rule, and only Vat Savitri moved to midday. If a later change
//    blanket-applies one rule to everything, this fails.
// ---------------------------------------------------------------------------
const engine = loadApp('src/engine/festivals.ts');
const byKey = new Map(engine.FESTIVALS.map((f) => [f.key, f]));
assert.deepStrictEqual(
  engine.FESTIVALS.filter((f) => f.policy === 'sunsetVyapini').map((f) => f.key).sort(),
  ['chhinnamastaJayanti', 'narasimhaJayanti'],
  'only Narasimha and Chhinnamasta Jayanti use the sunset rule',
);
assert.strictEqual(byKey.get('vatSavitri').kala, 'aparahnaBegins', 'Vat Savitri is decided at the Aparahna junction');
assert.strictEqual(byKey.get('vatSavitri').selection, 'first', 'when both days pervade Aparahna, Vat Savitri takes the earlier');
assert.strictEqual(byKey.get('shaniJayanti').kala, 'udaya', 'Shani Jayanti stays on the sunrise rule');
assert.strictEqual(byKey.get('buddhaPurnima').kala, 'udaya', 'Buddha Purnima is an unchanged sunrise control');
assert.strictEqual(byKey.get('sitaNavami').kala, 'udaya', 'Sita Navami is an unchanged sunrise control');
assert.strictEqual(byKey.get('ramNavami').kala, 'madhyahna', 'Ram Navami keeps its own midday rule');
assert.strictEqual(byKey.get('vatPurnima').kala, 'udaya', 'Vat Purnima (the Purnima form) is untouched');

// ---------------------------------------------------------------------------
// 5. The Vat Savitri formulation, measured rather than assumed. Two readings of
//    "Amavasya in the middle of the day" fit the eight modern anchors equally:
//      A  greatest share of Madhyahna (the middle fifth of the daytime);
//      B  running at the INSTANT Aparahna begins (3/5 of the daytime), earlier
//         day when both — what the engine implements.
//    They are not equivalent: they disagree in 10 of the 201 years 1900-2100.
//    Four of those ten are published, and all four go to B — which is why B is
//    what ships. This block pins the disagreement set so the exposure is a
//    measured number and a later change cannot quietly re-open the question.
// ---------------------------------------------------------------------------
const AMAVASYA = 29;
const formulationDiffs = [];
for (let y = 1900; y <= 2100; y += 1) {
  const days = [];
  for (let k = 0; k < 160; k += 1) {
    const c = new Date(Date.UTC(y, 3, 1 + k));
    const yy = c.getUTCFullYear(), mm = c.getUTCMonth() + 1, dd = c.getUTCDate();
    const tz = P.zoneOffset(DELHI.zone, yy, mm, dd) ?? IST;
    const noon = Date.UTC(yy, mm - 1, dd, 12) - tz * 3600000;
    const near = (tithiIndexAt(noon) - AMAVASYA + 30) % 30;
    if (near > 1 && near < 28) continue;
    const ev = P.sunEvents(yy, mm, dd, tz, DELHI.lat, DELHI.lon);
    if (ev.rise == null || ev.set == null) continue;
    const t = tithiIndexAt(ev.rise + 1000);
    if (t !== 28 && t !== AMAVASYA) continue;
    const mi = P.amantaMonthIdx(ev.rise);
    if (mi.idx !== 1 || mi.adhik) continue;
    const len = ev.set - ev.rise;
    const junction = ev.rise + 3 * len / 5;
    let overlap = 0;
    for (let s2 = ev.rise + 2 * len / 5; s2 < junction; s2 += 60000) {
      if (tithiIndexAt(s2) === AMAVASYA) overlap += 60000;
    }
    days.push({ date: iso(ev.rise), overlap, pervadesAparahna: tithiIndexAt(junction + 1000) === AMAVASYA });
  }
  const a = days.filter((d) => d.overlap > 0).sort((x, z) => z.overlap - x.overlap || x.date.localeCompare(z.date))[0];
  const b = days.filter((d) => d.pervadesAparahna)[0];
  if (a && b && a.date !== b.date) formulationDiffs.push(`${y}: A=${a.date} B=${b.date}`);
}
assert.deepStrictEqual(
  formulationDiffs.map((d) => Number(d.slice(0, 4))),
  [1932, 1933, 1944, 1969, 1994, 1995, 1997, 2057, 2084, 2090],
  'the Madhyahna-share and Aparahna-junction readings of Vat Savitri disagree in a different set of years now:\n  '
  + formulationDiffs.join('\n  '),
);
for (const y of [1969, 1994, 1995, 1997]) {
  assert.ok(AMAVASYA_ANCHORS.some((r) => r[0] === y),
    `${y} distinguishes the two Vat Savitri readings and must keep its published anchor`);
}

// ---------------------------------------------------------------------------
// 6. Padmini and Parama Ekadashi — the two Adhika Masa fasts, named at last [E].
// ---------------------------------------------------------------------------
const ADHIK_EKADASHI = [
  // year, key, published date, name, Ganak's date if it is NOT the published one
  // (the one ±1 case is the pre-existing Ekadashi tithi-boundary drift that
  // validation/ekadashi-lunar-naming.cjs pins at 19 of 297 fasts — a separate
  // item, not caused or fixed here).
  [2026, 'Adhik_Shukla_11', '2026-05-27', 'Padmini Ekadashi', '2026-05-26'],
  [2026, 'Adhik_Krishna_11', '2026-06-11', 'Parama Ekadashi', null],
  [2029, 'Adhik_Shukla_11', '2029-03-26', 'Padmini Ekadashi', null],
  [2029, 'Adhik_Krishna_11', '2029-04-09', 'Parama Ekadashi', null],
  [2031, 'Adhik_Shukla_11', '2031-08-28', 'Padmini Ekadashi', null],
  [2031, 'Adhik_Krishna_11', '2031-09-12', 'Parama Ekadashi', null],
  [2034, 'Adhik_Shukla_11', '2034-06-27', 'Padmini Ekadashi', null],
  [2034, 'Adhik_Krishna_11', '2034-07-12', 'Parama Ekadashi', null],
];
const meta = loadApp('src/data/festival-meta.ts');
const pages = loadApp('src/data/festival-pages.ts');
const routeContent = loadApp('src/data/festival-route-content.ts');
const i18n = loadApp('src/i18n.ts');

// A 40-day window around each published date, not a whole year: the Ekadashi
// scan is the most expensive part of the engine and the naming sweep over all
// 297 fasts already lives in validation/ekadashi-lunar-naming.cjs.
const fastsAround = (dateIso) => {
  const from = Date.parse(dateIso + 'T00:00Z') - 20 * DAY - IST * 3600000;
  return app.scanPanchangCalendar(from, IST, 40, 40, DELHI).fasts;
};
const fastWindows = new Map();
for (const [, , want] of ADHIK_EKADASHI) if (!fastWindows.has(want)) fastWindows.set(want, fastsAround(want));
const namingProblems = [];
for (const [y, key, want, en, knownDrift] of ADHIK_EKADASHI) {
  const hit = fastWindows.get(want).find((f) => f.key === key);
  if (!hit) namingProblems.push(`${en} ${y}: not emitted at all`);
  else if (iso(hit.ms) !== (knownDrift || want)) {
    namingProblems.push(`${en} ${y}: Ganak ${iso(hit.ms)}, published ${want}${knownDrift ? ` (pinned drift ${knownDrift})` : ''}`);
  }
  if (meta.OBS_NAME[key]?.en !== en) namingProblems.push(`${key}: label is ${meta.OBS_NAME[key]?.en}, expected ${en}`);
}
// The pinned drift may shrink but never spread.
assert.strictEqual(ADHIK_EKADASHI.filter((r) => r[4]).length, 1,
  'exactly one Adhika Masa Ekadashi is a day off the published date (2026 Padmini) — if that changes, say which way');
assert.deepStrictEqual(namingProblems, [], 'Adhika Masa Ekadashi naming:\n  ' + namingProblems.join('\n  '));

// No leap-month Ekadashi may fall back to the plain unnamed label any more.
for (const [want, fasts] of fastWindows) {
  const unnamed = fasts.filter((f) => f.key === 'ekadashi');
  assert.deepStrictEqual(unnamed.map((f) => iso(f.ms)), [],
    `unnamed Ekadashi(s) near ${want}: ${unnamed.map((f) => iso(f.ms)).join(', ')}`);
}

// Padmini and Parama must be real, reachable, bilingual guide pages like every
// other named Ekadashi — festival-page-coverage requires a route for a name.
for (const key of ['Adhik_Shukla_11', 'Adhik_Krishna_11']) {
  const entry = pages.FESTIVAL_PAGE_ENTRIES.find((e) => e.key === key);
  assert.ok(entry && entry.status === 'required' && entry.path, `${key} must have a dedicated page`);
  assert.ok(pages.FESTIVAL_PAGE_ROUTES[entry.path], `${key} route ${entry.path} must be registered`);
  assert.strictEqual(entry.metaKey, 'ekadashi', `${key} must reuse the Ekadashi guide template`);
  const overlay = routeContent.festivalRouteContentFor(key);
  assert.ok(overlay, `${key} must have route-specific bilingual content`);
  for (const field of ['identity', 'meaning', 'practice', 'completion', 'timingNote', 'sourceBoundary']) {
    assert.ok(overlay[field]?.en && overlay[field]?.hi, `${key}.${field} must be bilingual`);
  }
  assert.notStrictEqual(overlay.identity.en, routeContent.festivalRouteContentFor('Chaitra_Shukla_11').identity.en,
    `${key} must not reuse another Ekadashi's text`);
  assert.strictEqual(i18n.obsLabel('en', { key }), meta.OBS_NAME[key].en, `${key} English label must render`);
  assert.strictEqual(i18n.obsLabel('hi', { key }), meta.OBS_NAME[key].hi, `${key} Hindi label must render`);
}
assert.strictEqual(pages.FESTIVAL_PAGE_ENTRIES.find((e) => e.key === 'Adhik_Shukla_11').path, '/festival/padmini-ekadashi');
assert.strictEqual(pages.FESTIVAL_PAGE_ENTRIES.find((e) => e.key === 'Adhik_Krishna_11').path, '/festival/parama-ekadashi');

// ---------------------------------------------------------------------------
console.log(`✓ festival-day-rules: ${CHATURDASHI_ANCHORS.length} published Chaturdashi dates (Narasimha + Chhinnamasta), ${AMAVASYA_ANCHORS.length} published Amavasya dates`);
console.log(`  sunset rule swept 1900-2100: ${branch.one} single-sunset years, ${branch.two.length} two-sunset years (${branch.two.join(' ')}), ${branch.none.length} Sayahna-fallback years (${branch.none.join(' ')})`);
console.log(`  Vat Savitri splits from Shani Jayanti in ${splitYears.join(', ')} and matches it elsewhere`);
console.log(`  Vat Savitri: Aparahna-junction reading kept; it differs from the Madhyahna-share reading in ${formulationDiffs.length} years 1900-2100, and all 4 published ones (1969, 1994, 1995, 1997) confirm it`);
console.log(`  Padmini and Parama Ekadashi named and routed (${ADHIK_EKADASHI.length} published dates across 2026/2029/2031/2034); no unnamed Ekadashi left`);
console.log('\nFESTIVAL DAY RULES PASSED');
