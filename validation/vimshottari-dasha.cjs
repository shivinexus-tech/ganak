#!/usr/bin/env node
// ============================================================================
// validation/vimshottari-dasha.cjs
//
// WHY THIS EXISTS
// A dasha table is the practitioner's answer to *when*. Unlike a chart it has no
// visual tell: a wrong table looks exactly as plausible as a right one. The
// 2026-08-18 bug bash found that across 106 files in validation/ NOTHING asserted
// a mahadasha date, an antardasha span, a balance of dasha, or the tiling of one
// level into its parent — `ruling-planets.cjs` loads dasha.ts only for the KP
// Ruling-Planets strip and `snapshot-results.cjs` mirrors the nine dasha LORD
// NAMES with no dates. That is why five separate defects (F2, F4, F5, F10, F12)
// were all shippable at once.
//
// WHAT IT PINS
//   1. Balance of dasha against five PUBLISHED anchors — Drik Panchang's own
//      nakshatra-end instants for New Delhi, which are the direct input to the
//      balance. Pinning them pins every boundary in the table.
//   2. Exact tiling, four levels deep, all nine lords: no gap, no overlap, the
//      last sub-period ending exactly with its parent.
//   3. No rendered period may begin before the native was born (F2).
//   4. A current period, an antardasha tree and a five-level chain for births
//      across the whole SUPPORTED 1800-2150 range — or, where that is genuinely
//      impossible, an explicit bilingual reason instead of an empty panel (F4).
//
// Convention Ganak follows, stated so it is not silently changed: Vimshottari
// over a 365.25-day year, star lord from the Moon's nakshatra, balance
// (1 - elapsed fraction of the nakshatra) x the lord's years, sub-periods
// proportioned yrs/120 over the parent's span, and the sub-periods of a BALANCE
// mahadasha proportioned over its NOTIONAL FULL span (then clipped to birth for
// display). All are the majority classical reading.
// ============================================================================
'use strict';
const assert = require('node:assert');
const { loadApp } = require('./_load-app.cjs');

const { computeKundli } = loadApp('src/engine/kundli.ts');
const { DASHA_SEQ, VIM_LORDS, nakLordOf, vimSub, vimSubOf, clipPeriods } = loadApp('src/engine/dasha.ts');
const { moonSidMs, NAKSHATRAS } = loadApp('src/engine/panchang.ts');

const YEAR = 365.25 * 86400000;
const NK = 360 / 27;
const MIN = 60000;
const DELHI = { tz: 5.5, lat: 28.6139, lon: 77.209 };
const ist = (ms) => new Date(ms + 5.5 * 3600000).toISOString().replace('T', ' ').slice(0, 16);
const day = (ms) => new Date(ms).toISOString().slice(0, 10);
let checks = 0;
const ok = (cond, msg) => { assert(cond, msg); checks++; };

// ---------------------------------------------------------------------------
// 1. Balance of dasha vs five PUBLISHED anchors
//
// Source: Drik Panchang, New Delhi (geoname-id 1273294), fetched 2026-08-18 and
// recorded in plans/audits/2026-08-18-bugbash-dasha-transit.md so this gate does
// not re-fetch. `endIST` is the published "nakshatra upto" clock time; `tolMin`
// is the tolerance already declared for the Moon in drik-reference-anchors.cjs.
// ---------------------------------------------------------------------------
const LUNAR_TOL_MIN = 6;
const ANCHORS = [
  { date: [1948, 1, 30], nak: 'Uttara Phalguni', next: 'Hasta', endIST: '09:14', lord: 'Sun' },
  { date: [1975, 6, 15], nak: 'Magha', next: 'Purva Phalguni', endIST: '14:11', lord: 'Ketu' },
  { date: [1990, 1, 1], nak: 'Dhanishta', next: 'Shatabhisha', endIST: '12:22', lord: 'Mars' },
  { date: [2001, 9, 11], nak: 'Mrigashira', next: 'Ardra', endIST: '22:38', lord: 'Mars' },
  { date: [2024, 2, 29], nak: 'Chitra', next: 'Swati', endIST: '10:22', lord: 'Mars' },
];

/* The instant the Moon leaves the nakshatra it occupies at `ms`, by bisection on
   the same ephemeris the chart uses. */
function nakExit(ms) {
  const idxAt = (t) => Math.floor(moonSidMs(t) / NK);
  const start = idxAt(ms);
  let lo = ms, hi = ms + 3 * 86400000;
  while (idxAt(hi) === start) hi += 86400000;
  for (let k = 0; k < 60; k++) { const mid = (lo + hi) / 2; if (idxAt(mid) === start) lo = mid; else hi = mid; }
  return hi;
}

const cast = (dt) => computeKundli({
  y: dt.getUTCFullYear(), m: dt.getUTCMonth() + 1, day: dt.getUTCDate(),
  hh: dt.getUTCHours(), mi: dt.getUTCMinutes(), ...DELHI, ayanamsa: 'lahiri',
});

for (const a of ANCHORS) {
  const [y, m, d] = a.date;
  const [eh, em] = a.endIST.split(':').map(Number);
  const published = Date.UTC(y, m - 1, d, eh, em) - 5.5 * 3600000;
  // Cast three hours BEFORE the published nakshatra end, so the birth is
  // unambiguously inside the anchor nakshatra.
  const chart = cast(new Date(published - 3 * 3600000 + 5.5 * 3600000));
  const moon = chart.moon.lon;

  // (a) the nakshatra Ganak places the Moon in at the anchor moment
  ok(NAKSHATRAS[Math.floor(moon / NK)] === a.nak,
    `${day(chart.birthMs)}: Moon should be in ${a.nak}, got ${NAKSHATRAS[Math.floor(moon / NK)]}`);

  // (b) the nakshatra-exit instant against Drik's published clock time
  const exit = nakExit(chart.birthMs);
  const deltaMin = Math.abs(exit - published) / MIN;
  ok(deltaMin <= LUNAR_TOL_MIN,
    `${day(chart.birthMs)}: ${a.nak} ends ${ist(exit)} IST, Drik publishes ${a.endIST} — ${deltaMin.toFixed(1)} min apart, tolerance ${LUNAR_TOL_MIN}`);

  // (c) the star lord IS the first mahadasha lord — the whole table hangs off this
  ok(nakLordOf(moon) === a.lord && chart.dashas[0].lord === a.lord,
    `${day(chart.birthMs)}: first mahadasha should be ${a.lord}, got ${chart.dashas[0].lord}`);

  // (d) the balance, re-derived here from the classical rule rather than mirrored
  const frac = (moon % NK) / NK;
  const yrs = Object.fromEntries(DASHA_SEQ)[a.lord];
  const expectedEnd = chart.birthMs + (1 - frac) * yrs * YEAR;
  ok(Math.abs(chart.dashas[0].end - expectedEnd) < 1000,
    `${day(chart.birthMs)}: balance of dasha — expected first maha to end ${day(expectedEnd)}, got ${day(chart.dashas[0].end)}`);
  ok(Math.abs(chart.dashas[0].balance - (1 - frac) * yrs) < 1e-9,
    `${day(chart.birthMs)}: printed balance ${chart.dashas[0].balance} != (1-frac)*yrs`);

  // (e) the handover is exact at the published boundary: one minute before the
  //     exit the star lord still rules; at the exit the NEXT nakshatra's lord does.
  const cb = cast(new Date(exit - 2 * MIN + 5.5 * 3600000));
  const ca = cast(new Date(exit + 2 * MIN + 5.5 * 3600000));
  ok(cb.dashas[0].lord === a.lord, `${day(chart.birthMs)}: 2 min before the ${a.nak} cusp the first maha should still be ${a.lord}`);
  ok(ca.dashas[0].lord === VIM_LORDS[(VIM_LORDS.indexOf(a.lord) + 1) % 9],
    `${day(chart.birthMs)}: 2 min after the cusp the first maha should hand over to the ${a.next} lord`);
  // and the handover is clean: near-zero balance before, near-full after
  ok(cb.dashas[0].balance < 0.05, `${day(chart.birthMs)}: balance just before the cusp should be ~0, got ${cb.dashas[0].balance}`);
  ok(ca.dashas[0].balance > Object.fromEntries(DASHA_SEQ)[ca.dashas[0].lord] - 0.05,
    `${day(chart.birthMs)}: balance just after the cusp should be ~full`);
}

// ---------------------------------------------------------------------------
// 2. The nine mahadashas, and the 120-year cycle
// ---------------------------------------------------------------------------
ok(DASHA_SEQ.length === 9 && DASHA_SEQ.reduce((s, [, y]) => s + y, 0) === 120,
  'Vimshottari must be nine lords totalling 120 years');
assert.deepStrictEqual(DASHA_SEQ.map(([l]) => l),
  ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'], 'dasha sequence drifted');
assert.deepStrictEqual(DASHA_SEQ.map(([, y]) => y), [7, 20, 6, 10, 7, 18, 16, 19, 17], 'dasha years drifted');
checks += 3;

{
  const c = computeKundli({ y: 1990, m: 1, day: 1, hh: 12, mi: 0, ...DELHI, ayanamsa: 'lahiri' });
  const first = c.dashas.slice(0, 9);
  const span = (first[8].end - c.birthMs) / YEAR;
  const frac = (c.moon.lon % NK) / NK;
  const yrs0 = Object.fromEntries(DASHA_SEQ)[first[0].lord];
  ok(Math.abs(span - (120 - frac * yrs0)) < 1e-6,
    `the first nine mahadashas must span 120 - frac*yrs0 years, got ${span}`);
  // the sequence rotates from the star lord and never repeats within a cycle
  const start = VIM_LORDS.indexOf(first[0].lord);
  first.forEach((d, i) => ok(d.lord === VIM_LORDS[(start + i) % 9], `mahadasha ${i} out of sequence`));
}

// ---------------------------------------------------------------------------
// 3. Exact tiling, four levels deep, for every one of the nine lords
// ---------------------------------------------------------------------------
{
  let worstEnd = 0, worstGap = 0, levels = 0;
  const walk = (lord, start, dur, depth) => {
    const subs = vimSub(lord, start, dur);
    ok(subs.length === 9, `${lord}: a period must divide into exactly 9 sub-periods`);
    ok(Math.abs(subs[0].start - start) < 1e-6, `${lord}: first sub-period must start with its parent`);
    worstEnd = Math.max(worstEnd, Math.abs(subs[8].end - (start + dur)));
    for (let i = 1; i < 9; i++) worstGap = Math.max(worstGap, Math.abs(subs[i].start - subs[i - 1].end));
    // proportion: every sub-period is exactly yrs/120 of the parent
    const yrsOf = Object.fromEntries(DASHA_SEQ);
    subs.forEach((s) => ok(Math.abs((s.end - s.start) - (yrsOf[s.lord] / 120) * dur) < 1e-6,
      `${lord} > ${s.lord}: sub-period span is not yrs/120 of the parent`));
    levels++;
    if (depth < 3) walk(subs[3].lord, subs[3].start, subs[3].end - subs[3].start, depth + 1);
  };
  for (const [lord, yrs] of DASHA_SEQ) walk(lord, Date.UTC(2000, 0, 1), yrs * YEAR, 0);
  ok(worstEnd === 0, `tiling: the last sub-period must end exactly with its parent — worst error ${worstEnd} ms`);
  ok(worstGap === 0, `tiling: no gap or overlap between sub-periods — worst ${worstGap} ms`);
  ok(levels === 36, `expected 9 lords x 4 levels = 36 tiling checks, ran ${levels}`);
}

// Half-open selection: every instant belongs to exactly one period at every level.
{
  const c = computeKundli({ y: 1990, m: 1, day: 1, hh: 12, mi: 0, ...DELHI, ayanamsa: 'lahiri' });
  for (const list of [c.dashas, c.antars, c.pratyantars, c.sookshmas, c.pranas]) {
    if (!list || !list.length) continue;
    for (let i = 1; i < list.length; i++) {
      ok(list[i].start === list[i - 1].end, 'periods at one level must tile with no gap and no overlap');
    }
  }
}

// ---------------------------------------------------------------------------
// 4. F2 — nothing rendered may begin before the native was born
// ---------------------------------------------------------------------------
{
  // Kolkata 29 Feb 2024 23:59: the chart whose Rahu antardasha list used to open
  // 469 days before the birth and silently delete its first three sub-periods.
  const c = computeKundli({ y: 2024, m: 2, day: 29, hh: 23, mi: 59, tz: 5.5, lat: 22.5726, lon: 88.3639, ayanamsa: 'lahiri' });
  ok(c.current && c.current.lord === 'Rahu', 'Kolkata 2024-02-29 anchor: current mahadasha should be Rahu');
  ok(c.antars.length > 0, 'a current mahadasha must render an antardasha list');
  c.antars.forEach((a) => ok(a.start >= c.birthMs,
    `antardasha ${a.lord} starts ${ist(a.start)} IST, before the birth ${ist(c.birthMs)} IST`));
  ok(c.antars[0].start === c.birthMs, 'the surviving first antardasha must be clipped to the birth instant, not left un-clipped');
  ok(c.antars[0].fullStart != null && c.antars[0].fullStart < c.birthMs,
    'a clipped antardasha must keep its true span so its children stay correctly proportioned');
  ok(c.antarsBeforeBirth === 3, `the periods dropped before birth must be counted, expected 3 got ${c.antarsBeforeBirth}`);
  // the clipped period's OWN children must be proportioned over the true span and
  // clipped in turn — this is what broke when the tree recursed on the clipped start
  const kids = vimSubOf(c.antars[0]);
  kids.forEach((k) => ok(k.start >= c.birthMs, `pratyantardasha ${k.lord} of a clipped antar starts before birth`));
  ok(Math.abs(kids[kids.length - 1].end - c.antars[0].end) < 1e-6,
    'the children of a clipped period must still end exactly with it');
  const fullKids = vimSub(c.antars[0].lord, c.antars[0].fullStart, c.antars[0].fullEnd - c.antars[0].fullStart);
  const survivor = fullKids.find((k) => k.end > c.birthMs);
  ok(kids[0].lord === survivor.lord,
    'the first surviving child of a clipped period must be the one that was actually running at birth, not a re-proportioned impostor');
  // every deeper level too
  [c.pratyantars, c.sookshmas, c.pranas].forEach((lvl, i) =>
    (lvl || []).forEach((p) => ok(p.start >= c.birthMs, `level ${i + 2} period ${p.lord} starts before birth`)));
  // clipPeriods is honest about what it dropped
  const raw = vimSub('Rahu', c.current.end - c.current.yrs * YEAR, c.current.yrs * YEAR);
  ok(clipPeriods(raw, c.birthMs).droppedBeforeBirth + clipPeriods(raw, c.birthMs).length === 9,
    'clipPeriods must account for all nine sub-periods: kept + dropped = 9');
}

// A birth on the exact instant a mahadasha would start still clips cleanly.
{
  const c = computeKundli({ y: 2010, m: 7, day: 4, hh: 0, mi: 0, ...DELHI, ayanamsa: 'lahiri' });
  (c.antars || []).forEach((a) => ok(a.start >= c.birthMs, 'no antardasha may predate birth (second chart)'));
}

// ---------------------------------------------------------------------------
// 5. F4 — a rendered current period across the whole SUPPORTED birth range
// ---------------------------------------------------------------------------
{
  const now = Date.now();
  let sampled = 0, born = 0, rendered = 0, silent = 0, future = 0;
  const silentYears = [];
  for (let y = 1800; y <= 2150; y += 1) {
    const c = computeKundli({ y, m: 6, day: 15, hh: 10, mi: 30, ...DELHI, ayanamsa: 'lahiri' });
    sampled++;
    const isBorn = c.birthMs <= now;
    if (isBorn) born++;
    if (c.current) {
      rendered++;
      ok(c.antars.length > 0, `${y}: a current mahadasha must carry an antardasha tree`);
      ok(!!c.curAntar && !!c.curPratya && !!c.curSookshma && !!c.curPrana,
        `${y}: the five-level Maha > Antar > Pratyantar > Sookshma > Prana chain must be complete`);
      ok(c.current.start <= now && now < c.current.end, `${y}: the "current" period must actually contain now`);
      ok(c.dashaStatus && c.dashaStatus.ok === true, `${y}: dashaStatus must report ok when a period is running`);
    } else {
      silent++;
      if (isBorn) silentYears.push(y);
      if (c.dashaStatus && c.dashaStatus.reason === 'birth-in-future') future++;
      // AGENTS.md: silent failure is unacceptable. If nothing can be shown, the
      // chart must carry a plain-language reason in BOTH languages.
      ok(c.dashaStatus && c.dashaStatus.ok === false && c.dashaStatus.reason,
        `${y}: no current dasha and no reason — this is the silent empty panel F4 reported`);
      ok(c.dashaStatus.en && c.dashaStatus.hi && /[ऀ-ॿ]/.test(c.dashaStatus.hi),
        `${y}: the reason must be written in both English and Hindi`);
    }
  }
  ok(silentYears.length === 0,
    `${silentYears.length} of ${born} already-born sample years render no current dasha: ${silentYears.slice(0, 8).join(', ')}…`);
  ok(silent === future,
    `every chart without a current period must be a future birth; ${silent - future} were not`);
  console.log(`  range sweep: ${sampled} birth years 1800-2150 · ${born} already born · ${rendered} render a current period · ${silent} future births, all with a bilingual reason`);
}

// ---------------------------------------------------------------------------
// 6. Determinism, and the ayanamsa the table depends on
// ---------------------------------------------------------------------------
{
  const args = { y: 1975, m: 6, day: 15, hh: 4, mi: 30, tz: 5.5, lat: 19.076, lon: 72.8777 };
  const a = computeKundli({ ...args, ayanamsa: 'lahiri' });
  computeKundli({ ...args, ayanamsa: 'kp' });          // a different ayanamsa in between
  const b = computeKundli({ ...args, ayanamsa: 'lahiri' });
  assert.deepStrictEqual(a.dashas.map((d) => [d.lord, d.start, d.end]), b.dashas.map((d) => [d.lord, d.start, d.end]),
    'the dasha table must be deterministic and unaffected by an ayanamsa cast in between');
  checks++;
  const kp = computeKundli({ ...args, ayanamsa: 'kp' });
  ok(Math.abs(kp.dashas[0].balance - a.dashas[0].balance) > 0.01,
    'the ayanamsa selector really does move the dasha boundaries — the card must say which one is in force');
}

console.log(`Vimshottari dasha: PASS — ${checks} assertions · 5 published Drik anchors (balance, cusp handover) · 36 four-level tiling checks · no period before birth · 351-year birth-range sweep`);
