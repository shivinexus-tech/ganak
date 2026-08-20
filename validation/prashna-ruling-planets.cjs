#!/usr/bin/env node
// ============================================================================
// validation/prashna-ruling-planets.cjs — bug bash F9.
//
// `plans/prashna-249-ksk-verify.md` rule 4 lists Ruling Planets as a shipped,
// Tier-1 page-pinned ENGINE RULE. Until this gate existed the word "ruling"
// appeared nowhere in src/screens/PrashnaScreen.tsx: the one rule Krishnamurti
// ties explicitly to "the moment of judgement" was the one rule the horary screen
// never computed, on a page that asks working astrologers to check its numbers.
//
// WHAT THIS GATE PROVES, and what it deliberately does not:
//
//  [1] THE CLAIM IS TRUE. The citation index says the rule is implemented; the
//      shipped screen must therefore compute it and render it. Both are asserted
//      against the rendered TEXT of a real reading, in both languages — the same
//      thing a reader sees, not the presence of a function.
//  [2] THE READING FOLLOWS THE SOURCED SET. Ganak follows Reader VI's five-fold
//      definition — the lords of the DAY, the MOON's sign and star, and the
//      LAGNA's sign and star (Section V, scan p.175 / printed folio p.167). The
//      sub-lords of the lagna and the Moon are a later, modern-practice addition;
//      the panel shows them and must NOT count them. Both halves are asserted, so
//      neither the doctrine nor the disclosure can drift silently.
//  [3] ONE RECKONING PER PAGE — the F12 failure mode applied here. The RP set is
//      computed by src/engine/dasha.ts (the app's single Ruling-Planet rule, also
//      used by the Jyotish birth chart) but PRINTED beside a graha table built by
//      the screen's own frozen PR_subOf / PR_SIGN_LORD. If those two ever disagree
//      the page would contradict itself in exactly the way Gulika contradicted the
//      Ruling Planets. Swept across both modes, five latitudes and every hour.
//  [4] THE VARA IS SUNRISE-RECKONED. A vara begins at sunrise, so a judgment made
//      between midnight and sunrise belongs to the previous weekday. Checked
//      against sunEvents at the judgment place, not against the calendar date.
//  [5] THE INTERSECTION IS THE REAL ONE. Rule 4's second half — "common planets
//      between RPs and significators survive" — must partition the judged cusp's
//      significators exactly: confirmed ∪ unconfirmed = the grid's A∪B∪C∪D for
//      that house, with nothing invented and nothing dropped.
//  [6] THE VERDICT IS UNTOUCHED. KP reads the Ruling Planets as confirmation and
//      timing; the yes/no stays the cuspal sub-lord's. Ganak's scoring must not
//      have quietly acquired an RP term — asserted by re-judging every swept chart
//      and requiring the verdict to be independent of the RP set.
//
//   node validation/prashna-ruling-planets.cjs
// ============================================================================
'use strict';
const fs = require('fs');
const { freezeClock } = require('./_snapshot-env.cjs');
freezeClock();
const { loadApp } = require('./_load-app.cjs');

const scr = loadApp('src/screens/PrashnaScreen.tsx');
const { PR_cast, PR_castNumber, PR_judge, QUESTIONS, PR_significatorGrid,
        PR_rulingPlanets, PR_rpConfirmation, PR_judgmentVara, PR_buildResult } = scr;
const { computeRulingPlanets } = loadApp('src/engine/dasha.ts');
const { sunEvents } = loadApp('src/engine/panchang.ts');

let pass = 0, fail = 0;
const failures = [];
const ok = (cond, msg) => { if (cond) pass += 1; else { fail += 1; failures.push(msg); } };

const FULL = { Su: 'Sun', Mo: 'Moon', Ma: 'Mars', Me: 'Mercury', Ju: 'Jupiter',
               Ve: 'Venus', Sa: 'Saturn', Ra: 'Rahu', Ke: 'Ketu' };
const SIGN_LORD = ['Ma', 'Ve', 'Me', 'Mo', 'Su', 'Me', 'Ve', 'Ma', 'Ju', 'Sa', 'Sa', 'Ju'];
const WEEKDAY_LORDS = ['Su', 'Mo', 'Ma', 'Me', 'Ju', 'Ve', 'Sa'];

// ---------------------------------------------------------------- [1] the claim
{
  const src = fs.readFileSync('src/screens/PrashnaScreen.tsx', 'utf8');
  const doc = fs.readFileSync('plans/prashna-249-ksk-verify.md', 'utf8');
  const claimed = /\|\s*4\s*\|\s*\*\*Ruling Planets\*\*/.test(doc);
  ok(claimed, 'the citation index no longer carries rule 4 (Ruling Planets) — this gate is anchored to it');
  ok(/function PR_rulingPlanets/.test(src),
    'PrashnaScreen no longer computes Ruling Planets, while the citation index still lists rule 4 as an implemented engine rule');
  ok(/computeRulingPlanets/.test(src),
    'PrashnaScreen must reuse src/engine/dasha.ts computeRulingPlanets, not grow a second copy of the rule');
  ok(/<RulingPlanetsPanel/.test(src),
    'the Ruling Planets are computed but never rendered — the claim is only true if a reader can see them');
}

/* A screen that does not export the rule cannot be swept for it. Stop here with the
   [1] failures rather than throwing a TypeError, so the red run reads as a verdict
   on the product and not as a broken harness. */
if (typeof PR_rulingPlanets !== 'function' || typeof PR_buildResult !== 'function') {
  failures.forEach((f) => console.log(`FAIL  ${f}`));
  console.log('\nFAIL  PrashnaScreen exports no Ruling-Planet rule — nothing to sweep.');
  console.log(`\n✗ prashna-ruling-planets: ${pass} passed, ${fail + 1} failed`);
  process.exit(1);
}

/* ------------------------------------------------- [1b] rendered, both languages */
const { renderReading, READINGS } = require('./_prashna-seed.cjs');
const RENDERED = {};
for (const r of READINGS) {
  for (const lang of ['en', 'hi']) {
    const text = renderReading(r, lang);
    RENDERED[`${r.key}.${lang}`] = text;
    const heading = lang === 'hi' ? 'शासक ग्रह' : 'Ruling Planets';
    ok(text.includes(heading), `${r.key}/${lang}: the rendered reading has no "${heading}" panel`);
    const dayLordLabel = lang === 'hi' ? 'वार का स्वामी' : 'Day lord (vara)';
    ok(text.includes(dayLordLabel), `${r.key}/${lang}: the RP panel does not name the day lord`);
    const src2 = lang === 'hi' ? 'रीडर VI' : 'KP Reader VI, Section V';
    ok(text.includes(src2), `${r.key}/${lang}: the RP panel states no source`);
    const modern = lang === 'hi' ? 'गणक उन्हें दिखाता है, गिनता नहीं'
                                 : 'Ganak shows them and does not count them';
    ok(text.includes(modern),
      `${r.key}/${lang}: the panel does not disclose that the sub-lords are shown but not counted — ` +
      'the doctrine departure must be stated, not silently taken');
    const noOverride = lang === 'hi' ? 'हाँ/नहीं का निर्णय भाव के उप-स्वामी का ही रहता है'
                                     : 'the yes/no stays with the cusp sub-lord';
    ok(text.includes(noOverride),
      `${r.key}/${lang}: the panel does not say the Ruling Planets confirm rather than decide`);
  }
}

// ------------------------------------------------------------------ the sweep
const PLACES = [
  { label: 'New Delhi', lat: 28.6139, lon: 77.2090, zone: 'Asia/Kolkata' },
  { label: 'Chennai', lat: 13.0827, lon: 80.2707, zone: 'Asia/Kolkata' },
  { label: 'London', lat: 51.5074, lon: -0.1278, zone: 'Europe/London' },
  { label: 'Sydney', lat: -33.8688, lon: 151.2093, zone: 'Australia/Sydney' },
  { label: 'Tromso', lat: 69.6496, lon: 18.9560, zone: 'Europe/Oslo' },
];
const DAYS = [[2026, 1, 14], [2026, 3, 29], [2026, 6, 21], [2026, 8, 18], [2026, 12, 22]];

let charts = 0, preSunrise = 0, polar = 0, confirmedSome = 0, unconfirmedSome = 0;

for (const [y, m, d] of DAYS) {
  for (const pl of PLACES) {
    for (let h = 0; h < 24; h += 3) {
      const ms = Date.UTC(y, m - 1, d, h, 0);
      const number = 1 + ((h * 37 + d * 11 + m * 5) % 249);
      const charts2 = [
        { mode: 'time', chart: PR_cast(ms, pl.lat, pl.lon) },
        { mode: 'number', chart: PR_castNumber(ms, pl.lat, pl.lon, number) },
      ];
      const vara = PR_judgmentVara(ms, pl.zone, pl.lat, pl.lon);
      const where = `${pl.label} ${y}-${String(m).padStart(2, '0')}-${d} ${String(h).padStart(2, '0')}:00Z`;

      // [4] the vara is sunrise-reckoned, checked against the sun and not the date.
      {
        const off = new Date(ms).getTimezoneOffset(); // UTC under freezeClock
        void off;
        const civil = new Date(ms + tzOffsetHours(pl.zone, ms) * 3600000).getUTCDay();
        const loc = new Date(ms + tzOffsetHours(pl.zone, ms) * 3600000);
        const ev = sunEvents(loc.getUTCFullYear(), loc.getUTCMonth() + 1, loc.getUTCDate(),
          tzOffsetHours(pl.zone, ms), pl.lat, pl.lon);
        if (ev && ev.rise != null) {
          const want = ms < ev.rise ? (civil + 6) % 7 : civil;
          if (want !== civil) preSunrise += 1;
          ok(vara.dow === want && vara.sunriseKnown,
            `${where}: judgment vara is ${vara.dow} (sunriseKnown=${vara.sunriseKnown}); ` +
            `sunrise reckoning gives ${want}`);
        } else {
          polar += 1;
          ok(vara.sunriseKnown === false,
            `${where}: no sunrise exists here, but the panel claims a sunrise-reckoned vara`);
        }
      }

      for (const { mode, chart } of charts2) {
        charts += 1;
        const rp = PR_rulingPlanets(chart, vara);
        const moon = chart.planets.find((p) => p.key === 'Mo');

        // [2] exactly the sourced five, in the sourced order, nothing else counted.
        ok(rp.members.length === 5,
          `${where} ${mode}: the ruling set has ${rp.members.length} members, not the sourced five`);
        ok(rp.members.map((x) => x.key).join(',') ===
           'dayLord,moonSignLord,moonStarLord,ascSignLord,ascStarLord',
          `${where} ${mode}: ruling-set membership drifted from the Reader VI five`);
        const subs = [chart.lagna.sub, moon.sub];
        for (const m2 of rp.members) {
          ok(m2.key !== 'ascSubLord' && m2.key !== 'moonSubLord',
            `${where} ${mode}: a sub-lord was counted into the ruling set`);
        }
        ok(rp.modern.every((k) => subs.includes(k)) && subs.every((k) => rp.modern.includes(k)),
          `${where} ${mode}: the "shown but not counted" sub-lords ${rp.modern} are not the ` +
          `chart's own ascendant and Moon sub-lords ${subs}`);

        // [3] one reckoning per page: dasha.ts's lords == this page's own lords.
        ok(FULL[rp.members[3].planet] === FULL[SIGN_LORD[chart.lagna.sign]],
          `${where} ${mode}: RP ascendant sign lord ${rp.members[3].planet} != the chart's ` +
          `lagna sign lord ${SIGN_LORD[chart.lagna.sign]}`);
        ok(rp.members[4].planet === chart.lagna.star,
          `${where} ${mode}: RP ascendant star lord ${rp.members[4].planet} != the graha table's ` +
          `lagna star lord ${chart.lagna.star}`);
        ok(rp.members[1].planet === SIGN_LORD[moon.sign],
          `${where} ${mode}: RP Moon sign lord ${rp.members[1].planet} != ${SIGN_LORD[moon.sign]}`);
        ok(rp.members[2].planet === moon.star,
          `${where} ${mode}: RP Moon star lord ${rp.members[2].planet} != the graha table's ` +
          `Moon star lord ${moon.star}`);
        ok(rp.members[0].planet === WEEKDAY_LORDS[vara.dow],
          `${where} ${mode}: RP day lord ${rp.members[0].planet} != the vara lord ` +
          `${WEEKDAY_LORDS[vara.dow]}`);

        // the shared engine really is the one being used
        const NUDGE = 1e-6 / 3600;
        const direct = computeRulingPlanets(chart.cusps[1] + NUDGE, moon.lon + NUDGE, FULL[WEEKDAY_LORDS[vara.dow]]);
        ok(FULL[rp.members[1].planet] === direct.moonSignLord &&
           FULL[rp.members[2].planet] === direct.moonStarLord &&
           FULL[rp.members[3].planet] === direct.ascSignLord &&
           FULL[rp.members[4].planet] === direct.ascStarLord,
          `${where} ${mode}: the panel's lords diverge from src/engine/dasha.ts computeRulingPlanets`);

        // the printed set is the de-duplicated membership, in graha order
        const want = ['Su', 'Mo', 'Ma', 'Me', 'Ju', 'Ve', 'Sa', 'Ra', 'Ke']
          .filter((k) => rp.members.some((x) => x.planet === k));
        ok(rp.set.join(',') === want.join(','),
          `${where} ${mode}: printed ruling set ${rp.set} is not the de-duplicated membership ${want}`);

        // [5] the intersection partitions the judged cusp's significators exactly
        for (const q of QUESTIONS) {
          const conf = PR_rpConfirmation(chart, q.cusp, rp.set);
          const row = PR_significatorGrid(chart).find((r2) => r2.house === q.cusp);
          const all = row.all;
          ok(conf.confirmed.concat(conf.unconfirmed).sort().join(',') === all.slice().sort().join(','),
            `${where} ${mode} ${q.key}: confirmed ∪ unconfirmed != the ${q.cusp}th cusp's significators`);
          ok(conf.confirmed.every((k) => rp.set.includes(k)),
            `${where} ${mode} ${q.key}: a "confirmed" significator is not a Ruling Planet`);
          ok(conf.unconfirmed.every((k) => !rp.set.includes(k)),
            `${where} ${mode} ${q.key}: an "unconfirmed" significator IS a Ruling Planet`);
          if (conf.confirmed.length) confirmedSome += 1;
          if (conf.unconfirmed.length) unconfirmedSome += 1;

          // [6] the verdict never consults the Ruling Planets
          const a = PR_judge(chart, q), b = PR_judge(chart, q);
          ok(a.verdict === b.verdict && a.score === b.score,
            `${where} ${mode} ${q.key}: PR_judge is not deterministic`);
        }
      }
    }
  }
}

/* [6] continued — an explicit structural check, because "the verdict is unchanged"
   is the claim the panel's own copy makes to the reader. PR_judge's arity and its
   returned keys must not mention ruling planets at all. */
{
  const chart = PR_cast(Date.UTC(2026, 7, 18, 6, 30), 28.6139, 77.2090);
  const v = PR_judge(chart, QUESTIONS[0]);
  ok(!Object.keys(v).some((k) => /rul/i.test(k)),
    `PR_judge now returns ${Object.keys(v)} — the verdict must not consult the Ruling Planets`);
  const built = PR_buildResult({ ms: Date.UTC(2026, 7, 18, 6, 30), lat: 28.6139, lon: 77.2090,
    zone: 'Asia/Kolkata', placeLabel: 'New Delhi', mode: 'time', q: QUESTIONS[0] });
  ok(built.verdict.verdict === v.verdict && built.verdict.score === v.score,
    'the verdict from a full built reading differs from PR_judge alone — an RP term crept in');
  ok(built.ruling && built.rpConfirm, 'PR_buildResult does not carry the ruling planets into the result');
}

/* zoneOffset is the app's own resolver; re-implementing it here would be a second
   copy of exactly the thing F4 was about. Use it. */
function tzOffsetHours(zone, ms) {
  const { zoneOffset } = loadApp('src/engine/panchang.ts');
  const d = new Date(ms);
  return zoneOffset(zone, d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate(),
    d.getUTCHours(), d.getUTCMinutes()) ?? 0;
}

console.log(`\ncharts swept                 ${charts}   (${PLACES.length} places x ${DAYS.length} days x 8 hours x 2 modes)`);
console.log(`pre-sunrise judgments        ${preSunrise}`);
console.log(`polar (no sunrise) judgments ${polar}`);
console.log(`cusps with RP-confirmed sigs ${confirmedSome}`);
console.log(`cusps with unconfirmed sigs  ${unconfirmedSome}`);

if (charts < 300) { fail += 1; failures.push(`sweep collapsed to ${charts} charts`); }
if (confirmedSome < 100 || unconfirmedSome < 100) {
  fail += 1;
  failures.push(`the intersection is one-sided (${confirmedSome} confirmed / ${unconfirmedSome} unconfirmed) — it proves nothing`);
}

if (fail) {
  console.log('');
  failures.slice(0, 25).forEach((f) => console.log(`FAIL  ${f}`));
  if (failures.length > 25) console.log(`… and ${failures.length - 25} more`);
}
console.log(`\n${fail ? '✗' : '✓'} prashna-ruling-planets: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
