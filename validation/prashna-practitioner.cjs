#!/usr/bin/env node
// ============================================================================
// validation/prashna-practitioner.cjs
//
// A KP practitioner audits a verdict via all 12 cuspal sub-lords plus the
// significator grid. This gate proves both derivations against the chart they
// come from -- not against a golden file, so it stays true as the sky moves.
//
// The structural assertions below (row counts, ordering, canonical union
// order, D-arity, 9-graha coverage, and the B check against p.house) are
// genuine -- they do not restate the implementation. But an assertion of the
// form "A == chart.planets.filter(p => B.includes(p.star))" is tautological:
// it is the same expression the implementation uses, so it can never fail
// independently of the code under test. To catch a real regression in the
// A/C derivation, this gate ALSO pins one fixed chart's full grid for houses
// 7 and 11 to literal, hand-derived expected sets (see below).
// ============================================================================
'use strict';
const { loadApp } = require('./_load-app.cjs');

const scr = loadApp('src/screens/PrashnaScreen.tsx');
const { PR_cast, PR_castNumber, PR_cuspalTable, PR_significatorGrid } = scr;

let pass = 0, fail = 0;
const ok = (c, m) => { c ? pass++ : fail++; console.log(`${c ? 'PASS' : 'FAIL'}  ${m}`); };

const IST = (y, mo, d, h, mi) => Date.UTC(y, mo - 1, d, h, mi) - 330 * 60000;
const ms = IST(2026, 7, 24, 15, 30);
const CHARTS = [
  ['time/Delhi',   PR_cast(ms, 28.6139, 77.2090)],
  ['num108/Delhi', PR_castNumber(ms, 28.6139, 77.2090, 108)],
  ['num1/London',  PR_castNumber(ms, 51.5074, -0.1278, 1)],
  ['num249/Chennai', PR_castNumber(ms, 13.0827, 80.2707, 249)],
];
const ORDER = ['Su','Mo','Ma','Me','Ju','Ve','Sa','Ra','Ke'];

for (const [label, chart] of CHARTS) {
  console.log(`--- ${label} ---`);

  const cusp = PR_cuspalTable(chart);
  ok(cusp.length === 12, `${label}: cuspal table has 12 rows (got ${cusp.length})`);
  ok(cusp.every((r, i) => r.house === i + 1), `${label}: houses are 1..12 in order`);
  ok(cusp.every(r => r.lon === chart.cusps[r.house]),
    `${label}: every row's lon is the chart's own cusp longitude`);
  ok(cusp.every(r => r.sign === Math.floor(r.lon / 30) && Math.abs(r.deg - (r.lon % 30)) < 1e-9),
    `${label}: sign/deg are consistent with lon`);
  ok(cusp.every(r => ORDER.includes(r.star) && ORDER.includes(r.sub)),
    `${label}: every star/sub is a known graha key`);

  const grid = PR_significatorGrid(chart);
  ok(grid.length === 12, `${label}: significator grid has 12 rows (got ${grid.length})`);
  ok(grid.every((r, i) => r.house === i + 1), `${label}: grid houses are 1..12 in order`);

  // B must be exactly the planets whose house field equals that house.
  // (Genuine: p.house is engine output, independent of the grid's own logic.)
  ok(grid.every(r => {
    const want = chart.planets.filter(p => p.house === r.house).map(p => p.key).sort();
    return JSON.stringify(r.B.slice().sort()) === JSON.stringify(want);
  }), `${label}: group B == the actual occupants of each house`);

  ok(grid.every(r => r.D.length === 1 && ORDER.includes(r.D[0])),
    `${label}: group D is exactly one owning graha per house`);

  // `all` is the deduped union, in canonical order.
  ok(grid.every(r => {
    const want = ORDER.filter(k => r.A.includes(k) || r.B.includes(k) || r.C.includes(k) || r.D.includes(k));
    return JSON.stringify(r.all) === JSON.stringify(want);
  }), `${label}: 'all' is the deduped A∪B∪C∪D in canonical order`);

  // Every graha signifies at least one house -- an empty grid means a broken join.
  const covered = new Set(grid.flatMap(r => r.all));
  ok(covered.size === 9, `${label}: all 9 grahas appear somewhere in the grid (got ${covered.size})`);
}

// ============================================================================
// GOLDEN CASE -- pins the grid to hand-derived expectations, independent of
// the implementation's own A/C expressions.
//
// Chart: PR_castNumber(IST(2026,7,24,15,30), 28.6139, 77.2090, 108)
// ============================================================================
console.log('--- golden/num108/Delhi ---');
const golden = PR_castNumber(ms, 28.6139, 77.2090, 108);

console.log('planets:', golden.planets.map(p => `${p.key} star=${p.star} house=${p.house}`).join('  '));

// Print the 12 cusp sign-lords explicitly using the same PR_SIGN_LORD table
// the implementation uses for D, so we can hand-derive from printed data.
const PR_SIGN_LORD = ['Ma','Ve','Me','Mo','Su','Me','Ve','Ma','Ju','Sa','Sa','Ju'];
const cuspLords = [];
for (let h = 1; h <= 12; h++) cuspLords.push(PR_SIGN_LORD[Math.floor(golden.cusps[h] / 30)]);
console.log('cusp sign-lords by house:', cuspLords.map((k, i) => `h${i + 1}=${k}`).join(' '));

/*
Printed data for this chart (num108/Delhi, IST 2026-07-24 15:30 at 28.6139N 77.2090E),
captured from the console.log calls above:

  planets (key star house):
    Su star=Sa house=11
    Mo star=Sa house=3
    Ma star=Ma house=9
    Me star=Ju house=10
    Ju star=Sa house=11
    Ve star=Ve house=12
    Sa star=Me house=7
    Ra star=Ra house=6
    Ke star=Ke house=12

  cusp sign-lords by house: h1=Me h2=Ve h3=Ma h4=Ju h5=Sa h6=Sa h7=Ju h8=Ma h9=Ve h10=Me h11=Mo h12=Su

KP four-fold significator definitions used for the hand-derivation:
  B(h) = occupants of house h = { p.key : p.house === h }
  D(h) = owner of house h = { sign-lord of cusp h }
  A(h) = planets in the star of an occupant = { p.key : p.star ∈ B(h) }
  C(h) = planets in the star of the owner    = { p.key : p.star ∈ D(h) }
  all(h) = A ∪ B ∪ C ∪ D, deduped, in Su Mo Ma Me Ju Ve Sa Ra Ke canonical order

--- Hand-derivation, house 7 ---
  D(7) = [cusp-7 sign-lord] = ['Ju']                          (printed: h7=Ju)
  B(7) = planets with house===7 -> scanning the list above, only Sa has house=7
       = ['Sa']
  A(7) = planets whose star is in B(7)={'Sa'} -> star==='Sa': Su, Mo, Ju all
       have star=Sa -> ['Su','Mo','Ju']  (canonical order: Su, Mo, Ju)
  C(7) = planets whose star is in D(7)={'Ju'} -> star==='Ju': Me has star=Ju
       -> ['Me']
  all(7) = A ∪ B ∪ C ∪ D = {Su,Mo,Ju} ∪ {Sa} ∪ {Me} ∪ {Ju}
         = {Su,Mo,Me,Ju,Sa} in canonical order -> ['Su','Mo','Me','Ju','Sa']

--- Hand-derivation, house 11 ---
  D(11) = [cusp-11 sign-lord] = ['Mo']                        (printed: h11=Mo)
  B(11) = planets with house===11 -> Su (house=11) and Ju (house=11)
        = ['Su','Ju']  (canonical order: Su, Ju)
  A(11) = planets whose star is in B(11)={'Su','Ju'} -> star==='Su' or 'Ju':
        no planet has star=Su; Me has star=Ju -> ['Me']
  C(11) = planets whose star is in D(11)={'Mo'} -> star==='Mo': none of the
        nine planets has star=Mo -> [] (empty)
  all(11) = A ∪ B ∪ C ∪ D = {Me} ∪ {Su,Ju} ∪ {} ∪ {Mo}
          = {Su,Mo,Me,Ju} in canonical order -> ['Su','Mo','Me','Ju']

These literal arrays are asserted below against the live PR_significatorGrid
output. If a literal disagrees with the implementation, that is either a real
bug in PR_significatorGrid or an error in this hand-working -- it must be
resolved (not silenced) before this ships.
*/

const EXPECTED = {
  7:  { A: ['Su','Mo','Ju'], B: ['Sa'],       C: ['Me'], D: ['Ju'], all: ['Su','Mo','Me','Ju','Sa'] },
  11: { A: ['Me'],           B: ['Su','Ju'],  C: [],     D: ['Mo'], all: ['Su','Mo','Me','Ju'] },
};

const gridGolden = PR_significatorGrid(golden);
for (const h of [7, 11]) {
  const row = gridGolden.find(r => r.house === h);
  const exp = EXPECTED[h];

  ok(JSON.stringify(row.A.slice().sort()) === JSON.stringify(exp.A.slice().sort()),
    `golden house ${h}: A matches hand-derivation ${JSON.stringify(exp.A)} (got ${JSON.stringify(row.A)})`);
  ok(JSON.stringify(row.B.slice().sort()) === JSON.stringify(exp.B.slice().sort()),
    `golden house ${h}: B matches hand-derivation ${JSON.stringify(exp.B)} (got ${JSON.stringify(row.B)})`);
  ok(JSON.stringify(row.C.slice().sort()) === JSON.stringify(exp.C.slice().sort()),
    `golden house ${h}: C matches hand-derivation ${JSON.stringify(exp.C)} (got ${JSON.stringify(row.C)})`);
  ok(JSON.stringify(row.D) === JSON.stringify(exp.D),
    `golden house ${h}: D matches hand-derivation ${JSON.stringify(exp.D)} (got ${JSON.stringify(row.D)})`);
  ok(JSON.stringify(row.all) === JSON.stringify(exp.all),
    `golden house ${h}: all matches hand-derivation ${JSON.stringify(exp.all)} (got ${JSON.stringify(row.all)})`);
}

console.log(`\n${fail === 0 ? '✓' : '✗'} practitioner: ${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
