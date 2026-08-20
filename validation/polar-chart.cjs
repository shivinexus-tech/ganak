#!/usr/bin/env node
'use strict';
// ============================================================================
// validation/polar-chart.cjs
//
// WHY THIS GATE EXISTS
//
// src/engine/kundli.ts computed the birth-chart ascendant with the bare textbook
// arctangent. That formula returns ONE of the two antipodal points where the
// ecliptic cuts the horizon. Below the polar circle it is always the eastern,
// RISING one. Above it the arctangent lands in the other quadrant for part of
// the day and hands back the DESCENDANT as the rising degree — 46 of 192 sampled
// polar hours at Tromso, Murmansk, Utqiagvik and Longyearbyen. The whole chart
// is then rotated by six houses: the lagna is the 7th, every graha sits six
// houses from where it belongs, and every dosha, yoga and dasha significator
// read off those houses is read from the wrong end of the chart.
//
// The horary screen received the correction on 2026-08-18. The chart engine did
// not, so Ganak's two surfaces disagreed by exactly 180 degrees at polar
// latitudes for a day. See plans/audits/2026-08-19-polar-quadrant-fix.md.
//
// HOW THIS GATE IS ANCHORED — never to Ganak
//
// AGENTS.md: "A gate must never compare Ganak to a copy of Ganak." Three defects
// survived for months inside gates that did. So:
//
//   [1] THE US NAVAL OBSERVATORY. Sunrise, upper transit and sunset for five
//       real polar places, taken from the USNO Astronomical Applications
//       Department's published API, pinned here as literals with coordinates,
//       date and retrieval date. At a published SUNRISE the Sun is on the
//       EASTERN horizon, so the rising degree is on the Sun's side of the
//       meridian; at a published SUNSET it is on the opposite side. That is a
//       SIGN test against an external authority's clock — no tolerance, nothing
//       of Ganak's in it, and it is exactly what the defect got backwards.
//
//       Note: Drik Panchang, Ganak's usual benchmark, cannot serve here. Asked
//       for a high-latitude day it answers "High Latitudes are not entertained.
//       Aborting...!" (retrieved 2026-08-19). Nor is there a Rodden-rated natal
//       chart for a birth above the polar circle to pin: the charts the horary
//       lane used — Bjork at Reykjavik 64.15N, Sibelius at Hameenlinna 60.98N —
//       are both BELOW the polar circle and never enter this branch. The USNO
//       almanac is the published polar source that does exist, and the Sun at
//       its own published rising is a stronger discriminator than a natal
//       ascendant anyway: it separates the two answers by 180 degrees.
//
//   [2] THE PUBLISHED DEFINITION of a rising degree, recomputed here from
//       published spherical astronomy by a different route than the engine
//       uses (IAU 1980 obliquity; Meeus, Astronomical Algorithms 2nd ed.,
//       ch. 12 sidereal time, ch. 13 coordinate transformation, ch. 25 solar
//       position). The ascendant is BY DEFINITION the ecliptic degree whose
//       altitude is zero and whose altitude is INCREASING. Tested numerically
//       with a centred finite difference — not by re-asking the engine.
//
//   [3] THE NO-OP INVARIANT. The correction must not disturb any ordinary
//       latitude. `risingDegree` is compared against the plain textbook
//       arctangent over a dense grid below the polar circle; they must agree
//       exactly. This is the guard that makes the fix safe for every Indian
//       birth and every ordinary birth in the app.
//
//   [4] THE TWO SURFACES, side by side. The one deliberate Ganak-to-Ganak
//       comparison in this file, because the defect IS a disagreement between
//       two Ganak surfaces. It is a CONSISTENCY check and never a reason to
//       believe either surface is right.
//
//   node validation/polar-chart.cjs
// ============================================================================

const path = require('path');
const { loadApp } = require(path.resolve(__dirname, '_load-app.cjs'));

const { computeKundli } = loadApp('src/engine/kundli.ts');
const { risingDegree } = loadApp('src/engine/houses.ts');
const prashna = loadApp('src/screens/PrashnaScreen.tsx');   // READ ONLY — another lane owns this file

let failures = 0, checks = 0;
const fail = (m) => { failures++; console.error('FAIL  ' + m); };
const ok = () => { checks++; };
const assert = (cond, msg) => (cond ? ok() : fail(msg));

// ---------------------------------------------------------------------------
// Independent spherical astronomy. Nothing below is imported from src/.
// ---------------------------------------------------------------------------
const D2R = Math.PI / 180, R2D = 180 / Math.PI;
const rev = (x) => ((x % 360) + 360) % 360;
const sd = (x) => Math.sin(x * D2R);
const cd = (x) => Math.cos(x * D2R);
const td = (x) => Math.tan(x * D2R);
const atan2d = (y, x) => rev(Math.atan2(y, x) * R2D);
const sep = (a, b) => { let d = Math.abs(rev(a) - rev(b)); return d > 180 ? 360 - d : d; };

const SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra',
  'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
const fmt = (x) => {
  const L = rev(x), s = Math.floor(L / 30), r = L - s * 30;
  const m = Math.floor((r % 1) * 60);
  return `${SIGNS[s]} ${Math.floor(r)}°${String(m).padStart(2, '0')}'`;
};

const jdOf = (ms) => ms / 86400000 + 2440587.5;
const jcOf = (ms) => (jdOf(ms) + 72 / 86400 - 2451545) / 36525;   // +DeltaT 2026 ~ 72s

// Obliquity — IAU 1980 / Astronomical Almanac. (The engine uses a different,
// truncated expression; the two agree to well under an arcsecond.)
const obliquity = (ms) => {
  const T = jcOf(ms);
  return (23 * 3600 + 26 * 60 + 21.448 - 46.8150 * T - 0.00059 * T * T + 0.001813 * T ** 3) / 3600;
};
// Greenwich mean sidereal time — Meeus 12.4 (the full expression, not truncated).
const gmst = (ms) => {
  const JD = jdOf(ms), T = (JD - 2451545) / 36525;
  return rev(280.46061837 + 360.98564736629 * (JD - 2451545)
    + 0.000387933 * T * T - T ** 3 / 38710000);
};
const lstOf = (ms, lonE) => rev(gmst(ms) + lonE);

// Apparent solar longitude — Meeus ch. 25, low accuracy (~0.01 degrees).
const sunLongitude = (ms) => {
  const T = jcOf(ms);
  const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
  const M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
  const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * sd(M)
    + (0.019993 - 0.000101 * T) * sd(2 * M) + 0.000289 * sd(3 * M);
  const Om = 125.04 - 1934.136 * T;
  return rev(L0 + C - 0.00569 - 0.00478 * sd(Om));
};

// Ecliptic (latitude zero) -> equatorial; then horizon altitude.
const raOf = (lam, eps) => atan2d(cd(eps) * sd(lam), cd(lam));
const decOf = (lam, eps) => Math.asin(sd(eps) * sd(lam)) * R2D;
const hourAngle = (lam, eps, lst) => rev(lst - raOf(lam, eps));
const altOf = (lam, eps, phi, lst) => {
  const dec = decOf(lam, eps), H = rev(lst - raOf(lam, eps));
  return Math.asin(sd(phi) * sd(dec) + cd(phi) * cd(dec) * cd(H)) * R2D;
};
// The plain textbook arctangent, with NO quadrant correction — the "before" formula.
const ascTextbook = (ramc, eps, phi) =>
  atan2d(cd(ramc), -(sd(ramc) * cd(eps) + td(phi) * sd(eps)));

// The engine's tropical rising degree for a moment/place.
function engineAscTrop(y, m, day, hh, mi, lat, lon) {
  const k = computeKundli({ y, m, day, hh, mi, tz: 0, lat, lon });
  return { trop: rev(k.ascSid + k.ayan), k };
}

console.log('=== [1] US Naval Observatory — published sunrise / transit / sunset ===');
console.log('    Astronomical Applications Dept., https://aa.usno.navy.mil/api/rstt/oneday');
console.log('    retrieved 2026-08-19, times in UT, coordinates as supplied to the API.\n');

// ---------------------------------------------------------------------------
// [1] USNO ANCHORS — dated, attributed, entirely outside this repository.
// ---------------------------------------------------------------------------
const USNO = [
  { place: 'Tromso, Norway',           lat: 69.6496, lon: 18.9560,   date: [2026, 9, 15], rise: '03:57', transit: '10:39', set: '17:20' },
  { place: 'Tromso, Norway',           lat: 69.6496, lon: 18.9560,   date: [2026, 3, 20], rise: '04:44', transit: '10:52', set: '17:02' },
  { place: 'Murmansk, Russia',         lat: 68.9585, lon: 33.0827,   date: [2026, 9, 15], rise: '03:02', transit: '09:43', set: '16:22' },
  { place: 'Utqiagvik, Alaska',        lat: 71.2906, lon: -156.7887, date: [2026, 9, 15], rise: '15:38', transit: '22:22', set: '05:09' },
  { place: 'Longyearbyen, Svalbard',   lat: 78.2232, lon: 15.6267,   date: [2026, 9, 15], rise: '03:37', transit: '10:53', set: '18:04' },
  { place: 'McMurdo Station, Antarctica', lat: -77.8419, lon: 166.6863, date: [2026, 9, 15], rise: '19:25', transit: '00:49', set: '06:08' },
];

/* USNO defines rise/set as the moment the Sun's UPPER LIMB meets the horizon
   under standard refraction, i.e. the Sun's CENTRE is 0.8333 degrees below the
   geometric horizon (34' refraction + 16' semi-diameter). */
const USNO_CENTRE_ALT = -0.8333;
/* USNO publishes to the whole minute. At these latitudes the Sun's altitude
   changes by at most ~0.09 deg/min, so +/-30 s of rounding is +/-0.045 deg;
   the low-accuracy solar longitude adds ~0.01 deg. 0.15 deg is a safe bound and
   is two orders of magnitude smaller than the effect under test (180 deg). */
const USNO_ALT_TOL = 0.15;
/* The MC sweeps a full 360 degrees per sidereal day, i.e. ~15'/minute of clock,
   so USNO's whole-minute rounding of the transit time alone allows +/-7.5'.
   Measured worst today is 6.77', consistent with exactly that. 15' is twice the
   rounding bound and still 700x smaller than a six-house rotation. */
const USNO_MC_TOL = 0.25;

let worstRiseAlt = 0, worstTransitH = 0, worstMcSep = 0;

for (const a of USNO) {
  const [y, m, day] = a.date;
  const mk = (hhmm) => {
    const [hh, mi] = hhmm.split(':').map(Number);
    return { hh, mi, ms: Date.UTC(y, m - 1, day, hh, mi) };
  };
  console.log(`  ${a.place}  ${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}  ` +
    `${a.lat.toFixed(4)}, ${a.lon.toFixed(4)}`);

  for (const [phen, hhmm] of [['Rise', a.rise], ['Set', a.set]]) {
    const t = mk(hhmm);
    const eps = obliquity(t.ms), lst = lstOf(t.ms, a.lon);
    const sun = sunLongitude(t.ms);

    // (i) Cross-validate this file's own spherical astronomy against USNO.
    const sunAlt = altOf(sun, eps, a.lat, lst);
    worstRiseAlt = Math.max(worstRiseAlt, Math.abs(sunAlt - USNO_CENTRE_ALT));
    assert(Math.abs(sunAlt - USNO_CENTRE_ALT) < USNO_ALT_TOL,
      `${a.place} ${phen} ${hhmm}UT: this gate puts the Sun's centre at ${sunAlt.toFixed(4)}°, ` +
      `USNO's definition requires ${USNO_CENTRE_ALT}°`);

    // (ii) THE DEFECT ASSERTION. A sign test, no tolerance.
    //      At a published SUNRISE the Sun is east of the meridian and so is the
    //      rising degree: same side. At a published SUNSET the Sun is west and
    //      the rising degree is east: opposite sides.
    const { trop: asc } = engineAscTrop(y, m, day, t.hh, t.mi, a.lat, a.lon);
    const sunEast = sd(hourAngle(sun, eps, lst)) < 0;
    const ascEast = sd(hourAngle(asc, eps, lst)) < 0;
    const sameSide = sunEast === ascEast;
    const want = phen === 'Rise';
    assert(sameSide === want,
      `${a.place} ${phen} ${hhmm}UT: the Sun is ${sunEast ? 'EAST (rising)' : 'WEST (setting)'} ` +
      `of the meridian and the chart's lagna ${fmt(asc)} is ${ascEast ? 'EAST' : 'WEST'} — ` +
      `at a published ${phen.toLowerCase()} they must be on ${want ? 'the SAME' : 'OPPOSITE'} side(s). ` +
      `The engine returned the ${ascEast ? 'ascendant' : 'DESCENDANT'}.`);
    console.log(`     ${phen.padEnd(5)} ${hhmm}UT  Sun ${fmt(sun)} ${sunEast ? 'east' : 'west'}  |  ` +
      `lagna ${fmt(asc)} ${ascEast ? 'east' : 'west'}  |  ` +
      `Sun centre alt ${sunAlt.toFixed(4)}° (USNO ${USNO_CENTRE_ALT}°)  ${sameSide === want ? 'ok' : 'MISMATCH'}`);
  }

  // (iii) Upper transit anchors the MIDHEAVEN: the culminating point IS the MC.
  const t = mk(a.transit);
  const eps = obliquity(t.ms), lst = lstOf(t.ms, a.lon);
  const sun = sunLongitude(t.ms);
  const H = hourAngle(sun, eps, lst);
  const dH = Math.min(H, 360 - H);
  worstTransitH = Math.max(worstTransitH, dH);
  assert(dH < 0.5, `${a.place} transit ${a.transit}UT: the Sun should be on the meridian, hour angle ${H.toFixed(4)}°`);

  const k = computeKundli({ y, m, day, hh: t.hh, mi: t.mi, tz: 0, lat: a.lat, lon: a.lon });
  const mcTrop = rev(k.kpData.cusps[10] + k.ayan);
  // Above the polar circle the KP ring falls back to Porphyry, whose cusp 10 is
  // still the real MC, so this holds in both branches.
  const mcS = sep(mcTrop, sun);
  worstMcSep = Math.max(worstMcSep, mcS);
  assert(mcS < USNO_MC_TOL,
    `${a.place} transit ${a.transit}UT: USNO says the Sun ${fmt(sun)} culminates, ` +
    `but the chart's MC is ${fmt(mcTrop)} — ${mcS.toFixed(4)}° away`);
  console.log(`     Transit ${a.transit}UT  Sun ${fmt(sun)} culminating  |  chart MC ${fmt(mcTrop)}  ` +
    `(${(mcS * 60).toFixed(1)}' apart, tol ${(USNO_MC_TOL * 60).toFixed(0)}')`);
  console.log('');
}
console.log(`  worst |Sun centre altitude - USNO definition|   ${worstRiseAlt.toFixed(5)}°  (tolerance ${USNO_ALT_TOL})`);
console.log(`  worst |Sun hour angle| at published transit    ${worstTransitH.toFixed(5)}°  (tolerance 0.5)`);
console.log(`  worst chart-MC vs culminating Sun              ${(worstMcSep * 60).toFixed(2)}'  (tolerance ${(USNO_MC_TOL * 60).toFixed(0)}')`);

// ---------------------------------------------------------------------------
// [2] THE PUBLISHED DEFINITION, swept across the whole polar band.
// ---------------------------------------------------------------------------
console.log('\n=== [2] The published definition of a rising degree, swept ===');
console.log('    altitude 0, and altitude INCREASING (centred finite difference, +/-1 s)\n');

const SWEEP_DATES = [[2026, 3, 20], [2026, 6, 21], [2026, 9, 23], [2026, 12, 21]];
const SWEEP_LONS = [18.956, -156.7887];
const ALT_TOL = 0.02;
const ONE_SEC_LST = 360 / 86164.0905;      // degrees of LST in one second of clock
const GRAZE = 1e-6;                        // below this the point is stationary on the horizon

let sweepN = 0, sweepGrazing = 0, worstSweepAlt = 0, sweepNotEast = 0;
for (let lat = 64; lat <= 89; lat += 1) {
  for (const signLat of [1, -1]) {
    const phi = signLat * lat;
    for (const lon of SWEEP_LONS) {
      for (const [y, m, day] of SWEEP_DATES) {
        for (let hh = 0; hh < 24; hh++) {
          const { trop: asc } = engineAscTrop(y, m, day, hh, 0, phi, lon);
          const ms = Date.UTC(y, m - 1, day, hh, 0);
          const eps = obliquity(ms), lst = lstOf(ms, lon);
          sweepN++;

          const alt = altOf(asc, eps, phi, lst);
          worstSweepAlt = Math.max(worstSweepAlt, Math.abs(alt));
          assert(Math.abs(alt) < ALT_TOL,
            `lat ${phi} lon ${lon} ${y}-${m}-${day} ${hh}:00Z — lagna ${fmt(asc)} is not on the horizon (altitude ${alt.toFixed(5)}°)`);

          const rate = altOf(asc, eps, phi, rev(lst + ONE_SEC_LST))
            - altOf(asc, eps, phi, rev(lst - ONE_SEC_LST));
          if (Math.abs(rate) <= GRAZE) {
            // A genuine grazing moment: the ecliptic is tangent to the horizon and
            // "rising" has no answer. Counted and reported, never asserted away.
            sweepGrazing++;
          } else {
            assert(rate > 0,
              `lat ${phi} lon ${lon} ${y}-${m}-${day} ${hh}:00Z — lagna ${fmt(asc)} is on the horizon but SETTING ` +
              `(altitude falling ${rate.toExponential(2)}°/2s): that is the DESCENDANT, the chart is rotated six houses`);
          }
          if (!(sd(hourAngle(asc, eps, lst)) < 0)) sweepNotEast++;
        }
      }
    }
  }
}
console.log(`  polar charts swept (|lat| 64..89, both hemispheres, 24 h, 4 dates, 2 longitudes)  ${sweepN}`);
console.log(`  worst |altitude| of the rising degree      ${worstSweepAlt.toExponential(3)}°  (tolerance ${ALT_TOL})`);
console.log(`  charts where it was on the horizon but SETTING (the defect)   ${failures ? 'see FAIL lines' : 0}`);
console.log(`  grazing moments, where "rising" is undefined                  ${sweepGrazing}`);
console.log(`  charts whose rising degree was not east of the meridian       ${sweepNotEast}`);

// ---------------------------------------------------------------------------
// [3] THE NO-OP INVARIANT — ordinary latitudes must not move.
// ---------------------------------------------------------------------------
console.log('\n=== [3] The correction is a strict no-op below the polar circle ===');
let gridN = 0, gridMoved = 0, lowestMoved = Infinity, worstBelow = 0;
for (const eps of [23.43, 23.4393, 23.44]) {
  const circle = 90 - eps;
  for (let phi = -89.5; phi <= 89.5; phi += 0.5) {
    for (let ramc = 0; ramc < 360; ramc += 1) {
      const corrected = risingDegree(ramc, eps, phi);
      const textbook = ascTextbook(ramc, eps, phi);
      gridN++;
      const moved = sep(corrected, textbook) > 1e-9;
      if (moved) {
        gridMoved++;
        lowestMoved = Math.min(lowestMoved, Math.abs(phi));
        if (Math.abs(phi) <= circle) worstBelow = Math.max(worstBelow, Math.abs(phi));
      }
    }
  }
}
assert(worstBelow === 0,
  `the correction moved the ascendant at |latitude| ${worstBelow} — at or below the polar circle, ` +
  `where it must be a no-op. Every ordinary birth in the app is at risk.`);
assert(gridMoved > 0, 'the correction moved nothing anywhere — it is not wired in');
assert(lowestMoved > 66.5, `the correction reached down to |latitude| ${lowestMoved}, below the polar circle`);
console.log(`  latitude/RAMC/obliquity samples                ${gridN}`);
console.log(`  samples the correction moves                   ${gridMoved}`);
console.log(`  ... at or below the polar circle               ${worstBelow === 0 ? 0 : worstBelow}  (must be 0)`);
console.log(`  lowest |latitude| the correction touches       ${lowestMoved.toFixed(2)}°  (polar circle 66.56°)`);

// ---------------------------------------------------------------------------
// [4] THE TWO SURFACES. Consistency only — never a correctness anchor.
// ---------------------------------------------------------------------------
console.log('\n=== [4] Chart engine and horary engine, same place, same moment ===');
console.log('    a CONSISTENCY check between two Ganak surfaces, never a reason to');
console.log('    believe either one. Correctness is [1] and [2].\n');
/* Both surfaces report SIDEREAL longitudes, but on their own ayanamsa
   expressions (the chart engine's `ayanAt`, the horary screen's `PR_ayanamsa`),
   neither of which this file may import. The tolerance below therefore has to
   absorb the difference between those two expressions — a few arcminutes at
   most. That is not a weakness here: the defect this section guards against is
   the two surfaces sitting 180° apart, four orders of magnitude larger. The
   measured worst is printed so any real drift shows up long before it fails.
   Measured today: 2.98". One arcminute leaves 20x headroom over the ayanamsa
   residue while still catching any drift worth the name. */
const CROSS_TOL = 1 / 60;
let crossN = 0, worstCross = 0, worstCrossWhere = '';
for (let lat = 64; lat <= 86; lat += 2) {
  for (const signLat of [1, -1]) {
    const phi = signLat * lat;
    for (const [y, m, day] of SWEEP_DATES) {
      for (let hh = 0; hh < 24; hh += 3) {
        const ms = Date.UTC(y, m - 1, day, hh, 0);
        const k = computeKundli({ y, m, day, hh, mi: 0, tz: 0, lat: phi, lon: 18.956 });
        const pr = prashna.PR_cast(ms, phi, 18.956);
        const s = sep(k.ascSid, pr.cusps[1]);
        crossN++;
        if (s > worstCross) { worstCross = s; worstCrossWhere = `lat ${phi} ${y}-${m}-${day} ${hh}:00Z`; }
        assert(s < CROSS_TOL,
          `lat ${phi} ${y}-${m}-${day} ${hh}:00Z — chart lagna ${fmt(k.ascSid)} but horary lagna ` +
          `${fmt(pr.cusps[1])}, ${s.toFixed(4)}° apart. The two surfaces have drifted.`);
      }
    }
  }
}
console.log(`  polar moments compared                        ${crossN}`);
console.log(`  worst disagreement                            ${(worstCross * 3600).toFixed(2)}"  (tolerance ${(CROSS_TOL * 3600).toFixed(0)}", set by the two ayanamsa expressions)`);
if (worstCrossWhere) console.log(`  worst at                                      ${worstCrossWhere}`);
console.log('  Before the correction the same sweep read 180.00° apart at many of these moments.');

// ---------------------------------------------------------------------------
console.log('');
if (failures) {
  console.error(`✗ polar-chart: ${checks} passed, ${failures} failed`);
  process.exit(1);
}
console.log(`✓ polar-chart: ${checks} passed, 0 failed`);
