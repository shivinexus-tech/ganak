#!/usr/bin/env node
'use strict';
/* Dosha engine gate — Kala Sarpa (12 named types + geometry), Pitra Dosha
   (transparent checks) and Papa Dosha / Papasamyam (papa-point count).
   Pins absolute anchors and proves the geometry guard is non-vacuous. */
const assert = require('node:assert');
const { loadApp } = require('./_load-app.cjs');
const doshas = loadApp('src/engine/doshas.ts');
const calc = loadApp('src/engine/utility-calculators.ts');
const { computeKundli } = loadApp('src/engine/kundli.ts');
const explain = loadApp('src/data/dosha-explainers.ts');

// ---- content taxonomy must stay aligned with the engine (or "yours" mis-highlights) ----
assert.deepStrictEqual(explain.KALA_SARPA_TYPES.map(t => t.key), doshas.KS_TYPES.map(t => t.key), 'Kala Sarpa type content drifted from engine KS_TYPES');
assert(explain.KALA_SARPA_TYPES.every((t, i) => t.house === i + 1 && t.descEn && t.descHi), 'each Kala Sarpa type needs its Rahu house and a bilingual description');
assert.deepStrictEqual(explain.PITRA_FORMS.map(f => f.key), doshas.PITRA_CHECKS.map(c => c.key), 'Pitra form content drifted from engine PITRA_CHECKS');
assert(explain.PITRA_FORMS.every(f => f.descEn && f.descHi), 'each Pitra form needs a bilingual description');
['kala-sarpa', 'pitra-dosha', 'papa-dosha'].forEach(s => assert(explain.DOSHA_REMEDIES[s] && explain.DOSHA_REMEDIES[s].length && explain.DOSHA_REMEDIES[s].every(r => r.en && r.hi), `remedies missing/incomplete for ${s}`));
assert(explain.PAPA_HOUSE_MEANINGS.length === 6 && explain.PAPA_HOUSE_MEANINGS.every(m => m.en && m.hi), 'papa house meanings must cover all 6 sensitive houses bilingually');
assert(explain.PITRA_CAUSES.length >= 3 && explain.PITRA_CAUSES.every(c => c.en && c.hi), 'Pitra causes must be bilingual');

// ---- structure ----
assert.strictEqual(doshas.KS_TYPES.length, 12, 'Kala Sarpa must define all 12 named types');
assert(doshas.KS_TYPES.every(t => t.en && t.hi && t.areaEn && t.areaHi), 'each Kala Sarpa type must be bilingual');
assert.deepStrictEqual(doshas.KS_TYPES.map(t => t.key),
  ['anant','kulika','vasuki','shankhapala','padma','mahapadma','takshaka','karkotaka','shankhachuda','ghataka','vishadhara','sheshanaga'],
  'Kala Sarpa type order (by Rahu house 1..12) drifted');
assert.strictEqual(doshas.PITRA_CHECKS.length, 5, 'Pitra Dosha must expose its 5 transparent checks');
assert(doshas.PITRA_CHECKS.every(c => c.en && c.hi), 'Pitra checks must be bilingual');
assert.deepStrictEqual(doshas.PAPA_MALEFICS, ['Sun','Mars','Saturn','Rahu','Ketu'], 'papa malefic set drifted');
assert.deepStrictEqual(doshas.PAPA_HOUSES, [1,2,4,7,8,12], 'papa house set drifted');

// ---- Kala Sarpa geometry, synthetic (prove the guard) ----
const mkRow = (name, lon) => ({ name, lon, sign: Math.floor(lon / 30) });
const enclosedRows = (ascSign) => [
  mkRow('Rahu', 0), mkRow('Ketu', 180),
  mkRow('Sun', 20), mkRow('Moon', 40), mkRow('Mars', 60), mkRow('Mercury', 80),
  mkRow('Jupiter', 100), mkRow('Venus', 120), mkRow('Saturn', 140),
];
let ks = doshas.kalaSarpaFromRows(enclosedRows(0), 0);
assert.strictEqual(ks.full, true, 'seven planets inside one node semicircle must be a full Kala Sarpa');
assert.strictEqual(ks.enclosed, 7, 'full pattern must enclose all 7');
assert.strictEqual(ks.present, true, 'present must track full');
assert.strictEqual(ks.rahuHouse, 1, 'Rahu in the 1st with Lagna sign 0');
assert.strictEqual(ks.typeKey, 'anant', 'Rahu in the 1st is the Anant type');
// Named type follows Rahu's house — shift the ascendant so Rahu falls in the 7th.
assert.strictEqual(doshas.kalaSarpaFromRows(enclosedRows(6), 6).typeKey, 'takshaka', 'Rahu in the 7th is Takshaka');

// Guard flip: nudge one planet across the axis → no longer full, becomes partial.
const broken = enclosedRows(0).map(r => r.name === 'Saturn' ? mkRow('Saturn', 200) : r);
const ksBroken = doshas.kalaSarpaFromRows(broken, 0);
assert.strictEqual(ksBroken.full, false, 'a planet across the axis must break the full pattern (guard non-vacuous)');
assert.strictEqual(ksBroken.enclosed, 6, 'six remain enclosed');
assert.strictEqual(ksBroken.partial, true, 'six-enclosed is flagged partial, never full');

// ---- real-birth anchors ----
const delhi1990 = { y:1990,m:1,day:1,hh:12,mi:0,tz:5.5,lat:28.6139,lon:77.209 };
const chartDefault = { y:1995,m:8,day:15,hh:6,mi:30,tz:5.5,lat:28.61,lon:77.21 };

const ks90 = calc.kalaSarpa(delhi1990);
assert.strictEqual(ks90.enclosed, 5, 'Delhi 1990 Kala Sarpa enclosed anchor');
assert.strictEqual(ks90.rahuHouse, 11, 'Delhi 1990 Rahu house anchor');
assert.strictEqual(ks90.typeKey, 'vishadhara', 'Delhi 1990 Kala Sarpa type anchor');
assert.strictEqual(ks90.full, false, 'Delhi 1990 is not a full Kala Sarpa');

const pit90 = calc.pitraDosha(delhi1990);
assert.strictEqual(pit90.count, 1, 'Delhi 1990 Pitra count anchor');
assert.strictEqual(pit90.grade, 'single', 'Delhi 1990 Pitra grade anchor');
assert.strictEqual(pit90.checks.find(c => c.key === 'sun-saturn').fired, true, 'Delhi 1990 fires Sun–Saturn');
assert.strictEqual(pit90.ninthLord, 'Mars', 'Delhi 1990 9th-lord anchor');

const pitCd = calc.pitraDosha(chartDefault);
assert.strictEqual(pitCd.checks.find(c => c.key === 'nodes-9th').fired, true, 'chart-default fires nodes-in-9th');
assert.strictEqual(pitCd.count, 1, 'chart-default Pitra count anchor');

const papa90 = calc.papaDosha(delhi1990);
assert.strictEqual(papa90.total, 5, 'Delhi 1990 papa total anchor');
assert.strictEqual(papa90.grade, 'moderate', 'Delhi 1990 papa grade anchor');
assert.strictEqual(papa90.byRef.length, 3, 'papa count uses Lagna, Moon and Venus');
assert.deepStrictEqual(papa90.byRef.map(r => r.ref), ['lagna','moon','venus'], 'papa reference order');

const papaCd = calc.papaDosha(chartDefault);
assert.strictEqual(papaCd.total, 10, 'chart-default papa total anchor');
assert.strictEqual(papaCd.grade, 'high', 'chart-default papa grade anchor');

// ---- Papasamyam (two-chart comparison) ----
const cA = computeKundli(chartDefault), cB = computeKundli(delhi1990);
const ps = doshas.papasamyam(cA, cB);
assert.strictEqual(ps.boy.total, 10, 'Papasamyam boy total = chart-default papa');
assert.strictEqual(ps.girl.total, 5, 'Papasamyam girl total = Delhi-1990 papa');
assert.strictEqual(ps.diff, 5, 'Papasamyam diff anchor');
assert.strictEqual(ps.balanced, false, 'a 5-point gap is not balanced');
assert.strictEqual(ps.heavier, 'boy', 'the heavier papa load is correctly attributed');
// symmetric balance check: a chart against itself is perfectly balanced.
const psSelf = doshas.papasamyam(cA, cA);
assert.strictEqual(psSelf.diff, 0, 'identical charts have zero papa gap');
assert.strictEqual(psSelf.balanced, true, 'identical charts are balanced');

/* ============================================================================
   Manglik consistency — matching vs Ganak's own Mangal Dosha calculator.
   Bug bash 2026-08-18 F1: the matching card said "The groom is Manglik … while the
   other is not" for a couple whose two charts BOTH come back present=true from
   /calculator/mangal-dosha. Matching read the Lagna only; the calculator reads the
   Lagna, the Moon AND Venus, which is the convention Ganak publishes and which
   validation/mangal-dosha.cjs already asserts. Two surfaces, one birth record, two
   opposite answers. This sweeps real charts so the two can never drift again.
   ========================================================================== */
const { manglikProfile, computeMatch } = loadApp('src/engine/matching.ts');
const { mangalDoshaReport } = loadApp('src/engine/mangal-dosha.ts');

const MANGLIK_PLACES = [
  { lat: 28.61, lon: 77.21, tz: 5.5 },   // Delhi
  { lat: 19.08, lon: 72.88, tz: 5.5 },   // Mumbai
  { lat: 13.08, lon: 80.27, tz: 5.5 },   // Chennai
  { lat: 51.51, lon: -0.13, tz: 0 },     // London
  { lat: -33.87, lon: 151.21, tz: 10 },  // Sydney
  { lat: 40.71, lon: -74.01, tz: -5 },   // New York
];
const manglikCharts = [];
for (let i = 0; i < 96; i += 1) {
  const p = MANGLIK_PLACES[i % MANGLIK_PLACES.length];
  manglikCharts.push({
    y: 1948 + ((i * 7) % 78), m: 1 + (i % 12), day: 1 + ((i * 5) % 28),
    hh: (i * 11) % 24, mi: (i * 17) % 60, tz: p.tz, lat: p.lat, lon: p.lon,
  });
}

let checked = 0, presentCount = 0, lagnaOnlyWouldHaveMissed = 0, lagnaOnlyWouldHaveInvented = 0;
for (const birth of manglikCharts) {
  const fromMatching = manglikProfile(computeKundli(birth));
  const fromCalculator = mangalDoshaReport(birth);
  const where = `${birth.y}-${birth.m}-${birth.day} ${birth.hh}:${birth.mi} @${birth.lat},${birth.lon}`;
  assert.strictEqual(fromMatching.present, fromCalculator.present,
    `matching and /calculator/mangal-dosha disagree on WHETHER this chart is Manglik: ${where}`);
  assert.strictEqual(fromMatching.rawCount, fromCalculator.rawCount,
    `matching and the calculator count a different number of Manglik references: ${where}`);
  assert.strictEqual(fromMatching.strength, fromCalculator.strength,
    `matching and the calculator grade the strength differently: ${where}`);
  assert.deepStrictEqual(fromMatching.refs.map((r) => [r.key, r.house, r.counted]),
    fromCalculator.refs.map((r) => [r.key, r.house, r.counted]),
    `matching and the calculator place Mars in different houses: ${where}`);
  assert.deepStrictEqual(fromMatching.refs.map((r) => r.key), ['lagna', 'moon', 'venus'],
    'matching must check the Lagna, the Moon and Venus — separately, in that order');
  checked += 1;
  if (fromMatching.present) presentCount += 1;
  const lagnaOnly = fromMatching.refs[0].counted;
  if (fromMatching.present && !lagnaOnly) lagnaOnlyWouldHaveMissed += 1;
  if (!fromMatching.present && lagnaOnly) lagnaOnlyWouldHaveInvented += 1;
}
assert.strictEqual(checked, manglikCharts.length, 'the Manglik sweep did not run');
assert(presentCount > 0 && presentCount < checked, 'the Manglik sweep must contain both Manglik and non-Manglik charts');
/* Non-vacuous: the sweep must actually contain the charts the old Lagna-only rule got
   wrong. If this ever drops to zero the assertions above stop proving anything. */
assert(lagnaOnlyWouldHaveMissed > 0,
  'the sweep contains no chart that is Manglik from the Moon or Venus but not the Lagna — the very case F1 was about');

/* Pair semantics. "Cancelled" is MUTUAL Manglik. Two people who are both clear are
   clear, not cancelled — the old code conflated the two and printed "Clear — neither
   partner is Manglik" for a couple who were in fact both Manglik from the Moon. */
let both = 0, neither = 0, oneSided = 0;
for (let i = 0; i + 1 < manglikCharts.length; i += 2) {
  const boy = manglikCharts[i], girl = manglikCharts[i + 1];
  const m = computeMatch(computeKundli, boy, girl).manglik;
  const rBoy = mangalDoshaReport(boy), rGirl = mangalDoshaReport(girl);
  assert.strictEqual(m.boy, rBoy.present, 'the match card and the calculator disagree about the groom');
  assert.strictEqual(m.girl, rGirl.present, 'the match card and the calculator disagree about the bride');
  assert.strictEqual(m.both, m.boy && m.girl, 'both-Manglik flag is wrong');
  assert.strictEqual(m.neither, !m.boy && !m.girl, 'neither-Manglik flag is wrong');
  assert.strictEqual(m.oneSided, m.boy !== m.girl, 'one-sided flag is wrong');
  assert.strictEqual(m.cancelled, m.boy && m.girl,
    'mutual cancellation must mean BOTH partners are Manglik — never "both are clear"');
  assert.strictEqual(m.clear, !m.boy && !m.girl, 'clear must mean neither partner is Manglik');
  assert(!(m.cancelled && m.clear), 'a couple cannot be both cancelled and clear');
  if (m.both) both += 1; else if (m.neither) neither += 1; else oneSided += 1;
}
assert(both > 0 && oneSided > 0, 'the pair sweep must contain both mutual and one-sided Manglik couples');

/* The audit's own fixture couple, pinned. Before the fix the card read
   "The groom is Manglik … while the other is not" while the calculator said both were. */
const F1_BOY = { y: 1985, m: 1, day: 5, hh: 9, mi: 30, tz: 5.5, lat: 28.61, lon: 77.21 };
const F1_GIRL = { y: 1991, m: 7, day: 15, hh: 14, mi: 15, tz: 5.5, lat: 19.08, lon: 72.88 };
const f1 = computeMatch(computeKundli, F1_BOY, F1_GIRL).manglik;
assert.strictEqual(f1.boy, true, 'F1 groom is Manglik (Lagna + Venus)');
assert.strictEqual(f1.girl, true, 'F1 bride is Manglik (Moon + Venus) — matching used to say she was not');
assert.strictEqual(f1.oneSided, false, 'F1 couple must no longer render the one-sided card');
assert.strictEqual(f1.cancelled, true, 'F1 couple are mutually Manglik');
assert.strictEqual(f1.boyProfile.rawCount, 2, 'F1 groom counts 2 of 3 references, as the calculator reports');
assert.strictEqual(f1.girlProfile.rawCount, 2, 'F1 bride counts 2 of 3 references, as the calculator reports');

/* Second instance from the audit: identical birth data for both partners. The card
   rendered green "Clear — neither partner is Manglik from the Lagna" while both were
   Manglik from the Moon. Identical charts must agree with the calculator too. */
const TWIN = { y: 1990, m: 6, day: 15, hh: 8, mi: 30, tz: 5.5, lat: 28.61, lon: 77.21 };
const twin = computeMatch(computeKundli, TWIN, TWIN).manglik;
const twinReport = mangalDoshaReport(TWIN);
assert.strictEqual(twin.boy, twinReport.present, 'identical charts must match the calculator');
assert.strictEqual(twin.girl, twinReport.present, 'identical charts must match the calculator');
assert.strictEqual(twin.clear, !twinReport.present,
  'a couple may only be told they are clear when the calculator agrees they are clear');

console.log(`doshas.cjs OK — Kala Sarpa (12 types + geometry), Pitra Dosha, Papa Dosha & Papasamyam; ` +
  `Manglik matching↔calculator agreement swept over ${checked} charts and ${checked / 2} couples ` +
  `(${lagnaOnlyWouldHaveMissed} of them Manglik from the Moon/Venus but not the Lagna)`);
