#!/usr/bin/env node
'use strict';
// ============================================================================
// validation/prashna-high-latitude.cjs
//
// WHY THIS GATE EXISTS — a gate that compares a thing to itself proves nothing.
//
// The Prashna suite had nine green gates and still shipped a P0 for a year of
// latitudes. Above 60° the Placidus solver bails out to a "fallback", and the
// fallback replaced only cusps 11, 12, 2 and 3 with 30° steps while LEAVING
// cusp 10 as the real MC (and therefore cusp 4 as the real IC) inside an
// otherwise equal ring. Above ~60° those two real angles overtake their
// neighbours: the ring stops advancing monotonically, its twelve spans sum to
// 1080° instead of 360°, and the linear `inHouse` scan drops up to EIGHT of the
// nine grahas into a single house. At Tromsø 166 of the 249 numbers were
// affected; Helsinki, Anchorage, Reykjavik and Fairbanks likewise.
//
// Not one gate saw it, and the reason is structural rather than accidental:
//   * validation/prashna-parity.js compares src/screens/PrashnaScreen.tsx's
//     inlined engine against validation/prashna-calc.js. Both files carried the
//     SAME defective fallback, so parity was exact and told us nothing. Its case
//     list even names "Reykjavik, equal-house fallback" — it was exercising the
//     broken branch in both copies and calling the agreement a pass.
//   * validation/prashna-calc.js's own self-tests only assert Placidus at the
//     EQUATOR, where the fallback never runs.
//
// So this gate never compares one Ganak copy to another Ganak copy. Every
// assertion below is anchored to something outside the repository:
//
//   [1] EXTERNAL PUBLISHED CHARTS. Two independently published natal charts,
//       both cast for latitudes ABOVE 60°N — inside the exact band the defect
//       lived in. Their Ascendant and Midheaven are pinned here as literals,
//       with source, rating and retrieval date. BOTH engine copies are checked
//       against those literals separately; neither is ever checked against the
//       other.
//   [2] THE GEOMETRIC DEFINITION OF AN ASCENDANT, recomputed here from
//       published spherical astronomy by a different route than the engine uses
//       (IAU 1980 obliquity; equatorial conversion; horizon altitude). The
//       ascendant is BY DEFINITION the ecliptic degree whose altitude is zero on
//       the eastern horizon. If that holds at 69.65°N, the ascendant is right —
//       whatever formula produced it.
//   [3] RING INVARIANTS, which are arithmetic and need no source at all: a
//       house ring must advance monotonically once round the zodiac, its twelve
//       spans must sum to exactly 360°, and no house may be degenerate. This is
//       the single assertion that catches the whole class.
//
// EXTENDED 2026-08-19 (bug bash F17), when the same tautology was found to have
// been written INTO this file: the Björk anchor asserted the equal-house ring at
// 64°N, because both engine copies wrongly bailed out of Placidus at a flat
// |lat| > 60 that no source supports, while src/engine/houses.ts — the Jyotish
// chart screen's Placidus — used the real geometric test and gave the same place
// a different ring, up to 81° apart. Added since:
//
//   [1b] THE EQUAL BRANCH, above the polar circle where it actually belongs.
//   [2b] THE PUBLISHED DEFINITION OF PLACIDUS — each intermediate cusp must
//        trisect its own semi-diurnal or semi-nocturnal arc, recomputed here from
//        published spherical astronomy. This REPLACED a 120°-wide-house cap that
//        was a fair proxy while everything above 60° was equal-house and is false
//        for a genuine Placidus house near the pole. A cap admits any wrong cusp
//        under 120°; the trisection admits exactly one value.
//   [4]  THE TWO SURFACES, side by side. The one deliberate Ganak-to-Ganak
//        comparison in this file, because the defect IS a disagreement between
//        two Ganak surfaces — a consistency check, never a correctness anchor.
//
//   node validation/prashna-high-latitude.cjs
// ============================================================================

const path = require('path');
const { loadApp } = require(path.resolve(__dirname, '_load-app.cjs'));

const screen = loadApp('src/screens/PrashnaScreen.tsx');
const calc = require(path.resolve(__dirname, 'prashna-calc.js'));

let failures = 0, checks = 0;
const fail = (m) => { failures++; console.error('FAIL  ' + m); };
const ok = () => { checks++; };
const assert = (cond, msg) => cond ? ok() : fail(msg);

const norm360 = (d) => ((d % 360) + 360) % 360;
const D2R = Math.PI / 180, R2D = 180 / Math.PI;
const SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio',
               'Sagittarius','Capricorn','Aquarius','Pisces'];
const fmt = (d) => {
  const x = norm360(d), s = Math.floor(x / 30), r = x - s * 30;
  const m = Math.floor((r % 1) * 60), sec = Math.round(((r % 1) * 60 - m) * 60);
  return `${SIGNS[s]} ${Math.floor(r)}°${String(m).padStart(2, '0')}'${String(sec).padStart(2, '0')}"`;
};
const sep = (a, b) => { let d = Math.abs(norm360(a) - norm360(b)); if (d > 180) d = 360 - d; return d; };

/* Ganak's Prashna chart reports SIDEREAL cusps on the Lahiri ayanamsa; the
   published charts below are TROPICAL. Convert Ganak's number to the published
   frame using the ayanamsa the frozen engine itself applies, restated here so
   this gate never imports an internal. (This is a frame conversion, not the
   quantity under test — the quantity under test is the ascendant.) */
const lahiriAyanamsa = (ms) => {
  const T = (ms / 86400000 + 2440587.5 + 72 / 86400 - 2451545) / 36525;
  return 23.85236 + 1.3960 * T + 0.000139 * T * T;
};
const tropCusps = (sidCusps, ms) => {
  const a = lahiriAyanamsa(ms), out = new Array(13).fill(0);
  for (let h = 1; h <= 12; h++) out[h] = norm360(sidCusps[h] + a);
  return out;
};

/* ---------------------------------------------------------------------------
   [2] THE GEOMETRIC DEFINITION — an independent route to the same quantity.

   Published spherical astronomy, not the engine's algebra:
     obliquity     IAU 1980 / Astronomical Almanac:
                     ε = 23°26'21.448" − 46.8150"T − 0.00059"T² + 0.001813"T³
                   (the engine uses a different, truncated expression; the two
                   agree to well under an arcsecond, which the tolerance absorbs)
     ecliptic→equatorial   tan α = cos ε tan λ ,  sin δ = sin ε sin λ   (β = 0)
     horizon altitude      sin h = sin φ sin δ + cos φ cos δ cos H
   The ascendant is BY DEFINITION the ecliptic degree with h = 0 that is rising,
   i.e. east of the meridian (H between −180° and 0°).

   The local sidereal time is taken as the right ascension of the Midheaven, which
   is what "Midheaven" means — the culminating point. The MC is recovered without
   asking the engine for it: the MC depends only on the instant and the longitude,
   never on the latitude, so casting the SAME instant and longitude at the equator
   (where Placidus is always defined and cusp 10 is therefore the true MC) yields
   it. That keeps this check available at latitudes where the ring is equal-house
   and cusp 10 is deliberately NOT the MC.
--------------------------------------------------------------------------- */
const obliquityIAU1980 = (ms) => {
  const T = (ms / 86400000 + 2440587.5 + 72 / 86400 - 2451545) / 36525;
  return (23 * 3600 + 26 * 60 + 21.448 - 46.8150 * T - 0.00059 * T * T + 0.001813 * T * T * T) / 3600;
};
const toEquatorial = (lambda, eps) => ({
  ra: norm360(Math.atan2(Math.cos(eps * D2R) * Math.sin(lambda * D2R), Math.cos(lambda * D2R)) * R2D),
  dec: Math.asin(Math.sin(eps * D2R) * Math.sin(lambda * D2R)) * R2D,
});
const altitudeOf = (lambda, eps, lst, phi) => {
  const { ra, dec } = toEquatorial(lambda, eps);
  const H = norm360(lst - ra);
  return {
    alt: Math.asin(Math.sin(phi * D2R) * Math.sin(dec * D2R)
      + Math.cos(phi * D2R) * Math.cos(dec * D2R) * Math.cos(H * D2R)) * R2D,
    rising: Math.sin(H * D2R) < 0,   // east of the meridian
  };
};

// ---------------------------------------------------------------------------
// [1] EXTERNAL PUBLISHED CHARTS — dated, attributed, outside this repository.
//
// Both are ABOVE 60°N, i.e. both land in the fallback branch this gate exists to
// protect. Their Ascendant and Midheaven are recorded exactly as published.
//
// Declared tolerance: 4 arcminutes on the Ascendant and on the Midheaven.
// Measured agreement today is 0.1'/0.3' (Björk, Rodden AA) and 1.5'/2.3'
// (Sibelius, Rodden B — a biography-sourced time reduced from local mean time,
// so a few seconds of clock ambiguity is expected). The published figures are
// themselves printed only to the arcminute. 4' is therefore under twice the
// worst residual, and it is three orders of magnitude smaller than the
// tens-of-degrees error the F3 class produces — that class cannot hide in it.
//
// The birthplace coordinates are the Astrodienst atlas values, which is the
// atlas the published charts were cast with. Getting this wrong is not free:
// Reykjavík is 21°51′W in that atlas, and using the 21°57′W variant instead
// moved the ascendant 3.4' and the midheaven 6.2'.
// ---------------------------------------------------------------------------
const ANCHOR_TOL_DEG = 4 / 60;

const PUBLISHED = [
  {
    label: 'Björk — Reykjavík, 64°09′N (Astrotheme, Rodden AA, retrieved 2026-08-18)',
    source: 'https://www.astrotheme.com/astrology/Björk',
    born: '1965-11-21 08:10 Iceland standard time (UTC−1; Iceland kept UTC−1 in ' +
          'winter until 1968), Reykjavík 64°09′N 21°51′W',
    utcMs: Date.UTC(1965, 10, 21, 9, 10),
    lat: 64.15, lon: -21.85,
    ascTrop: 7 * 30 + 18 + 19 / 60,   // 18°19′ Scorpio
    mcTrop: 5 * 30 + 25 + 26 / 60,    // 25°26′ Virgo
    ascPrinted: "18°19′ Scorpio", mcPrinted: "25°26′ Virgo",
  },
  {
    label: 'Jean Sibelius — Hämeenlinna, 60°59′N (Astrotheme, Rodden B, retrieved 2026-08-18)',
    source: 'https://www.astrotheme.com/astrology/Jean_Sibelius',
    born: '1865-12-08 00:30 local mean time of the birthplace (Finland kept LMT ' +
          'until 1878), Tavastehus/Hämeenlinna 60°59′N 24°28′E',
    utcMs: Date.UTC(1865, 11, 8, 0, 30) - (24.4667 / 15) * 3600000,
    lat: 60.9833, lon: 24.4667,
    ascTrop: 5 * 30 + 26 + 26 / 60,   // 26°26′ Virgo
    mcTrop: 2 * 30 + 24 + 39 / 60,    // 24°39′ Gemini
    ascPrinted: "26°26′ Virgo", mcPrinted: "24°39′ Gemini",
  },
];

// The two engine copies, checked separately against the SAME external literals.
const ENGINES = [
  { name: 'src/screens/PrashnaScreen.tsx  PR_cast',
    cast: (ms, lat, lon) => { const c = screen.PR_cast(ms, lat, lon); return { cusps: c.cusps, planets: c.planets, system: c.system }; } },
  { name: 'validation/prashna-calc.js     castChart',
    cast: (ms, lat, lon) => { const c = calc.castChart(ms, lat, lon); return { cusps: c.houses.cusps, planets: c.planets, system: c.houses.system }; } },
];

console.log('=== [1] External published charts above 60°N ===\n');
for (const A of PUBLISHED) {
  console.log(A.label);
  console.log(`   source : ${A.source}`);
  console.log(`   data   : ${A.born}`);
  console.log(`   printed: Asc ${A.ascPrinted}   MC ${A.mcPrinted}`);
  for (const E of ENGINES) {
    const c = E.cast(A.utcMs, A.lat, A.lon);
    const trop = tropCusps(c.cusps, A.utcMs);
    // The real MC: same instant, same longitude, cast at the equator.
    const eq = E.cast(A.utcMs, 0, A.lon);
    const mc = tropCusps(eq.cusps, A.utcMs)[10];

    const dAsc = sep(trop[1], A.ascTrop), dMc = sep(mc, A.mcTrop);
    console.log(`   ${E.name}`);
    console.log(`      Asc ${fmt(trop[1])}  (${(dAsc * 60).toFixed(1)}′ from published)`);
    console.log(`      MC  ${fmt(mc)}  (${(dMc * 60).toFixed(1)}′ from published)`);
    assert(dAsc <= ANCHOR_TOL_DEG,
      `${A.label} / ${E.name}: ascendant ${fmt(trop[1])} is ${(dAsc * 60).toFixed(1)}′ from the published ${A.ascPrinted} (tolerance ${(ANCHOR_TOL_DEG * 60).toFixed(0)}′)`);
    assert(dMc <= ANCHOR_TOL_DEG,
      `${A.label} / ${E.name}: midheaven ${fmt(mc)} is ${(dMc * 60).toFixed(1)}′ from the published ${A.mcPrinted} (tolerance ${(ANCHOR_TOL_DEG * 60).toFixed(0)}′)`);

    /* THE ANCHOR THAT REPLACED AN EQUAL-HOUSE ONE (2026-08-19, bug bash F17).
       Until today PR_placidus bailed out at a flat |lat| > 60 that no source
       anywhere supports, so both of these charts — 64.15°N and 60.98°N, both
       BELOW the polar circle where Placidus is perfectly well defined — came back
       as equal house, and this gate asserted the equal ring. Meanwhile
       src/engine/houses.ts, the Placidus behind the Jyotish chart screen, cut on
       the geometric circumpolar test and gave the same places real Placidus cusps:
       one app, one place, one moment, two rings up to 81° apart.

       Both engines now cut where Placidus actually stops existing, so both charts
       are Placidus — and the anchor gets STRONGER rather than weaker, because in
       Placidus the tenth cusp IS the Midheaven by definition. The published MC is
       therefore no longer merely "somewhere in the 9th to 11th": it must BE cusp
       10, to the arcminute, against the same published literal. Nothing here is
       compared to the sibling copy of the engine. */
    assert(c.system === 'placidus',
      `${A.label} / ${E.name}: expected Placidus (this chart is below the polar circle, where Placidus is defined), got '${c.system}'`);
    const dC10 = sep(trop[10], A.mcTrop), dC4 = sep(trop[4], A.mcTrop + 180);
    console.log(`      cusp 10 ${fmt(trop[10])}  (${(dC10 * 60).toFixed(1)}′ from the published MC — in Placidus the 10th cusp IS the MC)`);
    assert(dC10 <= ANCHOR_TOL_DEG,
      `${A.label} / ${E.name}: cusp 10 is ${fmt(trop[10])}, ${(dC10 * 60).toFixed(1)}′ from the published MC ${A.mcPrinted} — in the Placidus system the tenth cusp is the Midheaven`);
    assert(dC4 <= ANCHOR_TOL_DEG,
      `${A.label} / ${E.name}: cusp 4 is ${fmt(trop[4])}, ${(dC4 * 60).toFixed(1)}′ from the published MC + 180° — the fourth cusp is the IC`);
    assert(sep(trop[1], trop[7] + 180) < 1e-9,
      `${A.label} / ${E.name}: cusp 7 is not opposite the ascendant`);
    /* And it is NOT an equal ring — the state this gate used to assert here. If a
       future change quietly reinstates a flat cutoff, these two charts fall back to
       equal house and this line fails. */
    const equalish = sep(trop[10], trop[1] + 270) < 1e-9;
    assert(!equalish,
      `${A.label} / ${E.name}: cusp 10 is exactly ascendant + 270°, i.e. an equal ring — Placidus is defined at this latitude and must be used (bug bash F17)`);
  }
  console.log('');
}

// ---------------------------------------------------------------------------
// [1b] THE EQUAL-HOUSE BRANCH, above the polar circle where it actually belongs.
//
// No published chart is needed for this one and none is claimed: the assertions
// are the definition of the Equal House system (cusp h = ascendant + 30°(h−1))
// plus the externally recovered Midheaven, which in equal house is a free point
// and must NOT coincide with the tenth cusp. Ganak's high-latitude convention is
// a stated product decision, not doctrine — plans/prashna-249-ksk-verify.md
// rule 9 — and this block is what holds it to what it promises the reader.
// ---------------------------------------------------------------------------
const LON_POLAR = 18.9560;   // Tromsø's meridian; the sweep below reuses it
const LON_JYOTISH = -21.9426;  // Reykjavík's meridian, for the cross-surface section
console.log('=== [1b] The equal-house branch above the polar circle ===\n');
const POLAR = [['67 north', 67], ['Tromsø', 69.6496], ['85 north', 85],
               ['Tromsø latitude, south', -69.6496], ['85 south', -85]];
for (const E of ENGINES) {
  for (const [place, lat] of POLAR) {
    for (const h of [0, 5, 11, 17, 23]) {
      const ms = Date.UTC(2026, 7, 18, h, 0);
      const c = E.cast(ms, lat, LON_POLAR);
      const trop = tropCusps(c.cusps, ms);
      const mc = tropCusps(E.cast(ms, 0, LON_POLAR).cusps, ms)[10];
      const label = `${E.name} | ${place} (${lat}°) ${String(h).padStart(2, '0')}:00Z`;
      assert(c.system === 'equal',
        `${label}: above the polar circle Placidus does not exist, so the ring must be the declared equal-house fallback; got '${c.system}'`);
      for (let hh = 1; hh <= 12; hh++) {
        const want = norm360(trop[1] + 30 * (hh - 1));
        assert(sep(trop[hh], want) < 1e-9,
          `${label}: equal-house cusp ${hh} is ${fmt(trop[hh])}, expected ascendant+${30 * (hh - 1)}° = ${fmt(want)}`);
      }
      assert(sep(mc, trop[10]) > 1e-6,
        `${label}: cusp 10 equals the real MC — that is an equal ring with a real angle pinned into it, the F3 defect`);
    }
  }
}
console.log(`  equal ring verified at ${POLAR.length} polar latitudes × 5 hours × ${ENGINES.length} engines`);
console.log('  (above the polar circle the real MC roams: measured in equal houses 7 to 12,');
console.log('   never the 10th cusp — recorded in plans/audits/2026-08-19-prashna-house-system.md)\n');

// ---------------------------------------------------------------------------
// [3] RING INVARIANTS + [2] GEOMETRIC DEFINITION, swept.
// ---------------------------------------------------------------------------
const LATS = [
  ['equator', 0], ['New Delhi', 28.6139], ['London', 51.5074], ['Oslo', 59.9139],
  ['just under the cutoff', 59.99], ['exactly the cutoff', 60.0],
  ['just past the cutoff', 60.01], ['Helsinki', 60.1699], ['Whitehorse', 60.7212],
  ['Anchorage', 61.2181], ['Yellowknife', 62.4540], ['Trondheim', 63.4305],
  ['Reykjavik', 64.1466], ['Fairbanks', 64.8378], ['Arctic Circle', 66.5635],
  ['Murmansk', 68.9585], ['Tromsø', 69.6496], ['85 north', 85], ['89.9 north', 89.9],
  ['Ushuaia (south)', -54.8019], ['past the cutoff (south)', -60.01],
  ['Antarctic Circle', -66.5635], ['85 south', -85],
];
const LON = LON_POLAR;
const HOURS = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22];
const NUMBERS = [1, 42, 97, 139, 200, 249];
const ALT_TOL_DEG = 0.02;   // 72 arcsec — covers the obliquity-expression and
                            // nutation differences between the two routes

let ringsChecked = 0, geomChecked = 0, worstAlt = 0, worstSum = 0;
let placChecked = 0, worstPlac = 0;

/* Placidus houses are UNEQUAL by construction, and the nearer the pole the more
   unequal: at Fairbanks a house reaches 123°, at the polar circle itself 173°.
   This gate used to cap every span at 120°, which was a fair proxy while every
   chart above 60° was equal-house — but it is not a property of Placidus, and
   after the F17 fix (2026-08-19) it would have failed on rings that are correct.
   It has been REPLACED, not dropped, and replaced by something far stronger:
   checkPlacidus() below pins each intermediate cusp to the single value the
   published definition of the system allows, to under an arcminute. A 120° cap
   admits any wrong cusp under 120°; the trisection admits exactly one value. */
const checkRing = (label, cusps, system) => {
  ringsChecked++;
  const spans = [];
  for (let h = 1; h <= 12; h++) spans.push(norm360(cusps[h === 12 ? 1 : h + 1] - cusps[h]));
  const sum = spans.reduce((a, b) => a + b, 0);
  worstSum = Math.max(worstSum, Math.abs(sum - 360));
  assert(Math.abs(sum - 360) < 1e-9,
    `${label}: the twelve house spans sum to ${sum.toFixed(2)}°, not 360° — the ring wraps ${(sum / 360).toFixed(2)} times`);
  const bad = spans.findIndex((s) => !(s > 1e-9 && s < 360));
  assert(bad === -1,
    `${label}: house ${bad + 1} spans ${bad === -1 ? '' : spans[bad].toFixed(2)}° — a house must be non-degenerate and must not swallow the ring (cusps ${cusps.slice(1, 13).map((v) => v.toFixed(2)).join(' ')})`);
  if (system === 'equal') {
    const worst = Math.max(...spans.map((s) => Math.abs(s - 30)));
    assert(worst < 1e-9,
      `${label}: the chart says 'equal houses' but its widest span is off 30° by ${worst.toFixed(4)}° — the disclosure and the arithmetic disagree`);
  }
};

const lstAt = (ms, lon, engine) =>
  toEquatorial(tropCusps(engine.cast(ms, 0, lon).cusps, ms)[10], obliquityIAU1980(ms)).ra;

const checkGeometry = (label, cusps, ms, lat, lon, engine) => {
  const eps = obliquityIAU1980(ms);
  const trop = tropCusps(cusps, ms);
  const { alt, rising } = altitudeOf(trop[1], eps, lstAt(ms, lon, engine), lat);
  geomChecked++;
  worstAlt = Math.max(worstAlt, Math.abs(alt));
  // (a) an ascendant is on the horizon
  assert(Math.abs(alt) < ALT_TOL_DEG,
    `${label}: the reported ascendant ${fmt(trop[1])} sits ${alt.toFixed(4)}° from the horizon — an ascendant is by definition the ecliptic degree at altitude 0°`);
  /* (b) and it is the one that is RISING, not the one that is setting. The
     ecliptic cuts the horizon at two antipodal points; the eastern one rises and
     the western one sets, because diurnal motion is uniform. Tested two ways so
     neither can be a sign-convention artefact: the point must be east of the
     meridian, AND holding the ecliptic degree fixed while advancing the sky by
     one minute must RAISE it. Above the polar circle the textbook arctangent
     lands in the wrong quadrant for part of the day and returns the descendant. */
  const altLater = altitudeOf(trop[1], obliquityIAU1980(ms + 60000),
    lstAt(ms + 60000, lon, engine), lat).alt;
  assert(rising,
    `${label}: the reported ascendant ${fmt(trop[1])} is west of the meridian — that is the descendant, not the ascendant`);
  assert(altLater > alt,
    `${label}: the reported ascendant ${fmt(trop[1])} is SETTING (altitude ${alt.toFixed(4)}° → ${altLater.toFixed(4)}° one minute later) — an ascendant rises`);
};

/* ---------------------------------------------------------------------------
   [2b] THE PUBLISHED DEFINITION OF PLACIDUS — the anchor that replaced the 120°
   cap, and the reason the F17 fix can be trusted at latitudes no published chart
   in this file covers.

   Placidus divides TIME, not space. Every ecliptic point takes a semi-diurnal arc
   SD = 90° + AD to travel from the eastern horizon to the meridian, and a
   semi-nocturnal arc SN = 90° − AD to travel from the meridian to the western
   horizon, where AD is its ascensional difference, sin AD = tan φ · tan δ
   (standard spherical astronomy; the same published relations the Astronomical
   Almanac gives for rising and setting). The intermediate cusps are the points
   that trisect those arcs:

       cusp 11 : one third of its own SD past the meridian   (RA = RAMC + SD/3)
       cusp 12 : two thirds of its own SD past the meridian  (RA = RAMC + 2·SD/3)
       cusp  2 : two thirds of its own SN short of the IC    (RA = RAMC + 180 − 2·SN/3)
       cusp  3 : one third of its own SN short of the IC     (RA = RAMC + 180 − SN/3)

   This routine takes the cusp longitude the engine RETURNED, converts it to RA
   and declination by the published formulas, computes that point's own semi-arc,
   and asks whether it stands where the definition says. It never looks at how the
   cusp was computed and never at the other engine copy, so two copies of one
   error cannot satisfy it. The RAMC is recovered independently, as the right
   ascension of the externally checked Midheaven.

   Measured worst residual across the whole sweep: printed at the end. Tolerance
   0.02°, the same 72″ the ascendant check uses, and for the same reason — the two
   routes use different obliquity expressions. The error class this replaces is
   tens of degrees wide.
--------------------------------------------------------------------------- */
/* The old sweep asserted "no more than 6 of the 9 grahas may read into one house",
   a proxy for the collapsed ring of F3. Under a genuine Placidus ring near the
   polar circle one house legitimately spans 170°, so seven grahas can honestly
   fall in it and the proxy would now fire on a correct chart. Replaced by the
   thing the proxy was standing in for: every graha must actually LIE inside the
   house the engine says it is in. That is what a house assignment means, it holds
   in every system, and no collapsed ring can satisfy it. The 6-graha proxy is kept
   for the equal ring, where a 30° house makes it meaningful. */
const checkPlacement = (label, chart) => {
  const c = chart.cusps;
  for (const p of chart.planets) {
    const h = p.house;
    const lo = c[h], hi = c[h === 12 ? 1 : h + 1];
    const inside = norm360(p.lon - lo) < norm360(hi - lo) || norm360(p.lon - lo) < 1e-9;
    assert(inside,
      `${label}: ${p.key || p.name} at ${fmt(p.lon)} is reported in house ${h}, which runs ${fmt(lo)} to ${fmt(hi)} — the graha is not inside its own house`);
  }
  if (chart.system === 'equal') {
    const worst = Math.max(...Object.values(
      chart.planets.reduce((acc, p) => { acc[p.house] = (acc[p.house] || 0) + 1; return acc; }, {})));
    assert(worst <= 6,
      `${label}: ${worst} of the 9 grahas are read into one 30° equal house — the ring has collapsed`);
  }
};

const PLAC_TOL_DEG = 0.02;
const signed180 = (x) => ((x % 360) + 540) % 360 - 180;
const checkPlacidus = (label, cusps, ms, lat, lon, engine) => {
  const eps = obliquityIAU1980(ms);
  const trop = tropCusps(cusps, ms);
  const ramc = lstAt(ms, lon, engine);
  const SPEC = [
    [11, 'diurnal', 1 / 3, (semi) => semi / 3],
    [12, 'diurnal', 2 / 3, (semi) => 2 * semi / 3],
    [2, 'nocturnal', 2 / 3, (semi) => 180 - 2 * semi / 3],
    [3, 'nocturnal', 1 / 3, (semi) => 180 - semi / 3],
  ];
  for (const [h, arc, frac, expected] of SPEC) {
    const { ra, dec } = toEquatorial(trop[h], eps);
    const adArg = Math.tan(lat * D2R) * Math.tan(dec * D2R);
    if (Math.abs(adArg) >= 1) continue;            // circumpolar: no such cusp
    const ad = Math.asin(adArg) * R2D;
    const semi = arc === 'diurnal' ? 90 + ad : 90 - ad;
    const resid = Math.abs(signed180(ra - ramc - expected(semi)));
    placChecked++;
    worstPlac = Math.max(worstPlac, resid);
    assert(resid < PLAC_TOL_DEG,
      `${label}: cusp ${h} ${fmt(trop[h])} is ${resid.toFixed(4)}° away from the point that trisects its own ${arc} arc ` +
      `(${frac === 1 / 3 ? 'one third' : 'two thirds'} of ${semi.toFixed(2)}°) — that is the definition of a Placidus cusp, and this chart does not meet it`);
  }
  // cusp 10 is the Midheaven and cusp 1 the ascendant, in this system by definition
  const mc = tropCusps(engine.cast(ms, 0, lon).cusps, ms)[10];
  assert(sep(trop[10], mc) < PLAC_TOL_DEG,
    `${label}: cusp 10 ${fmt(trop[10])} is not the Midheaven ${fmt(mc)} — in Placidus the tenth cusp is the MC`);
};

console.log('=== [3] Ring invariants and [2] the geometric definition, swept ===\n');
for (const E of ENGINES) {
  for (const [place, lat] of LATS) {
    for (const h of HOURS) {
      const ms = Date.UTC(2026, 7, 18, h, 0);
      const c = E.cast(ms, lat, LON);
      const label = `${E.name} | ${place} (${lat}°) ${String(h).padStart(2, '0')}:00Z time mode`;
      checkRing(label, c.cusps, c.system);
      if (Math.abs(lat) < 89) checkGeometry(label, c.cusps, ms, lat, LON, E);
      if (c.system === 'placidus') checkPlacidus(label, c.cusps, ms, lat, LON, E);
      checkPlacement(label, c);
    }
  }
}

// Number mode carries its own copy of the ring; sweep it too.
for (const [place, lat] of LATS) {
  for (const n of NUMBERS) {
    const ms = Date.UTC(2026, 7, 18, 12, 0);
    const c = screen.PR_castNumber(ms, lat, LON, n);
    checkRing(`PR_castNumber | ${place} (${lat}°) number ${n}`, c.cusps, c.system);
    checkPlacement(`PR_castNumber | ${place} (${lat}°) number ${n}`, c);
  }
}

// The full 249 at the three latitudes the audit named, both modes.
for (const lat of [60.01, 64.15, 69.65]) {
  for (let n = 1; n <= 249; n++) {
    const c = screen.PR_castNumber(Date.UTC(2026, 7, 18, 12, 0), lat, LON, n);
    checkRing(`PR_castNumber | ${lat}° number ${n}`, c.cusps, c.system);
  }
}

/* ---------------------------------------------------------------------------
   [4] THE TWO SURFACES, SIDE BY SIDE — bug bash F17, closed 2026-08-19.

   This is the ONE section in this file that compares Ganak to Ganak, and it is
   deliberate, because the defect it guards IS a disagreement between two Ganak
   surfaces. It is a consistency check and never a correctness anchor: sections
   [1], [1b], [2], [2b] and [3] are what make either ring believable, and every
   one of them is pinned to a published chart or a published definition.

   What went wrong: PrashnaScreen's PR_placidus bailed out at a flat |lat| > 60
   with nothing behind the 60, while src/engine/houses.ts — the Placidus the
   Jyotish chart screen draws — bailed on the geometric circumpolar test near
   66.56°. Between the two, one place at one moment had two different house rings
   in the same app, up to 81° apart at Reykjavík, under two different system
   names. KP is a Placidus system ("for the other cusps take only the LATITUDE,
   prepared per the PLACIDUS system", KP Reader VI Section IV, page-pinned in
   plans/prashna-249-ksk-verify.md), so the horary screen was the one in the
   wrong: it was refusing Placidus to seven northern cities that can have it.
--------------------------------------------------------------------------- */
const { computeKundli } = loadApp('src/engine/kundli.ts');
const CROSS_TOL_DEG = 1 / 60;      // one arcminute
const jyotish = (ms, lat, lon) => {
  const d = new Date(ms);
  const k = computeKundli({ y: d.getUTCFullYear(), m: d.getUTCMonth() + 1, day: d.getUTCDate(),
    hh: d.getUTCHours(), mi: d.getUTCMinutes(), tz: 0, lat, lon, ayanamsa: 'lahiri' });
  return { cusps: k.kpData.cusps, system: k.kpData.houseSystem, asc: k.ascSid };
};

console.log('\n=== [4] The horary screen and the chart screen, same place, same moment ===\n');
const CROSS_LATS = [51.5074, 59.99, 60.01, 60.1699, 60.7212, 61.2181, 62.4540, 63.4305,
                    64.1466, 64.8378, 66.0, 66.5, -60.01, -64.1466, -66.5];
let worstCross = 0, worstCrossAt = '';
for (const lat of CROSS_LATS) {
  for (const h of [0, 6, 12, 18]) {
    const ms = Date.UTC(2026, 5, 21, h, 0);
    const pr = screen.PR_cast(ms, lat, LON_JYOTISH);
    const jy = jyotish(ms, lat, LON_JYOTISH);
    const label = `cross-surface | ${lat}° ${String(h).padStart(2, '0')}:00Z`;
    assert(pr.system === 'placidus',
      `${label}: the horary screen reports '${pr.system}' below the polar circle, where Placidus exists and KP requires it (bug bash F17)`);
    assert(jy.system.startsWith('Placidus'),
      `${label}: the chart screen reports '${jy.system}' below the polar circle`);
    for (let i = 1; i <= 12; i++) {
      const d = sep(pr.cusps[i], jy.cusps[i]);
      if (d > worstCross) { worstCross = d; worstCrossAt = `${label} cusp ${i}`; }
      assert(d <= CROSS_TOL_DEG,
        `${label}: cusp ${i} is ${fmt(pr.cusps[i])} on the Prashna screen and ${fmt(jy.cusps[i])} on the Jyotish chart screen — ${(d * 60).toFixed(1)}′ apart. One app, one place, one moment, two answers (bug bash F17)`);
    }
  }
}
console.log(`  ${CROSS_LATS.length} latitudes × 4 hours: both surfaces Placidus, twelve cusps each`);
console.log(`  worst disagreement ${(worstCross * 3600).toFixed(3)}″ (tolerance ${(CROSS_TOL_DEG * 60).toFixed(0)}′), at ${worstCrossAt || 'nowhere'}`);
console.log('  Before the fix the same sweep read up to 81.34° apart at Reykjavík.\n');

/* Above the polar circle the two surfaces still differ, and this is recorded
   rather than asserted because it is a product decision that has not been taken:
   Prashna falls back to equal house (plans/prashna-249-ksk-verify.md rule 9),
   the Jyotish chart falls back to Porphyry (src/engine/kundli.ts). Neither is
   doctrine — the KP Readers record no polar convention at all — and both are
   named honestly on their own screen, but one app should pick one. Unifying them
   edits src/engine/kundli.ts and changes shipped Jyotish charts, so it is a
   different lane and a product call: plans/audits/2026-08-19-prashna-house-system.md. */
{
  const ms = Date.UTC(2026, 5, 21, 12, 0);
  const pr = screen.PR_cast(ms, 69.6496, LON_JYOTISH);
  const jy = jyotish(ms, 69.6496, LON_JYOTISH);
  console.log(`  above the polar circle the two surfaces still differ BY DESIGN:`);
  console.log(`    Prashna 69.65°N → ${pr.system} (equal house, rule 9)   Jyotish → ${jy.system}`);
  console.log('    recorded, not asserted — one convention would be better than two, and that is a product call\n');
}

/* ------------------------------------------- OPEN HANDOFF: the Jyotish polar ascendant
   Found while closing F17 (2026-08-19). PrashnaScreen got a POLAR QUADRANT CORRECTION on
   2026-08-18: above the polar circle the textbook arctangent lands in the wrong quadrant
   for part of the day and returns the DESCENDANT as the rising degree. src/engine/kundli.ts
   never got that correction, so the Jyotish chart screen still does it — at Tromsø on
   2026-06-21 at 00:00Z and 22:00Z its lagna is exactly 180° from the rising degree, and the
   whole chart is rotated by six houses.

   This is not asserted as a failure because src/engine/kundli.ts belongs to another lane;
   it is printed on every run in the pattern validation/prashna-judgment-zone.cjs uses, and
   it flips to ✓ by itself the moment the correction lands there. The test below is the
   published definition of a rising degree, not a comparison with the Prashna copy. */
{
  const bad = [];
  for (const lat of [68.9585, 69.6496, 75, -69.6496]) {
    for (let h = 0; h < 24; h += 1) {
      const ms = Date.UTC(2026, 5, 21, h, 0);
      const jy = jyotish(ms, lat, LON_JYOTISH);
      const ascTrop = norm360(jy.asc + lahiriAyanamsa(ms));
      const { rising } = altitudeOf(ascTrop, obliquityIAU1980(ms), lstAt(ms, LON_JYOTISH, ENGINES[0]), lat);
      if (!rising) bad.push(`${lat}° ${String(h).padStart(2, '0')}:00Z`);
    }
  }
  console.log(bad.length
    ? '  OPEN HANDOFF — the Jyotish chart screen (src/engine/kundli.ts) has no polar quadrant\n' +
      `  correction, so its lagna is the DESCENDANT for ${bad.length} of the 96 polar hours sampled\n` +
      `  (e.g. ${bad.slice(0, 4).join(', ')}) — the whole chart rotated six houses.\n` +
      '  Exact change: plans/audits/2026-08-19-prashna-house-system.md. Not this lane\'s file.\n'
    : '  the Jyotish chart screen now applies the polar quadrant correction too ✓\n');
}

// ---------------------------------------------------------------------------
// [5] ONE ASCENDANT FORMULA IN THIS FILE — a structural check, not a numeric one
//
// WHY IT IS STRUCTURAL. PrashnaScreen.tsx used to hold the ascendant arctangent
// TWICE: once in PR_ascMc, which received the polar quadrant correction on
// 2026-08-18, and once inside PR_ramcForAsc's `ascOf`, which did not. The polar
// lane predicted that the second copy would make the KP number chart settle on a
// moment where the number's degree is the DESCENDANT, giving the wrong MC and
// the wrong ring.
//
// That prediction was MEASURED on 2026-08-19 (dedupe lane) and did not hold. The
// two variants pick the same RAMC at every latitude below the polar circle, and
// differ in only 10 of 15,235 solvable polar cases — every one a grazing moment
// with the target within 0.5 deg of the meridian, where no ecliptic degree is
// cleanly rising and neither answer is better. Applying the correction changed
// PR_cast and all 249 PR_castNumber charts by nothing at all, at four polar
// cities included.
//
// So there is no numeric assertion that can tell the corrected code from the
// uncorrected code: a check that passes either way would be worse than none,
// because it would look like protection. What IS true, and what actually
// mattered, is that one formula lived in two places and a correction reached one
// and missed the other. That is the property asserted here, at the source level,
// where it does discriminate.
//
// The regex is SELF-CHECKING: zero matches fails just as loudly as two. A
// pattern that silently stops matching is how this class of check goes blind.
// ---------------------------------------------------------------------------
{
  const src = require('fs').readFileSync('src/screens/PrashnaScreen.tsx', 'utf8');
  // The ascendant arctangent: atan2(cos(RAMC), -(sin(RAMC)cos(eps) + tan(lat)sin(eps)))
  const ASC_ARCTAN = /Math\.atan2\(\s*cosD\([A-Za-z_$][\w$]*\)\s*,\s*-\(\s*sinD\([A-Za-z_$][\w$]*\)\s*\*\s*cosD\([A-Za-z_$][\w$]*\)/g;
  const hits = src.match(ASC_ARCTAN) || [];
  assert(hits.length > 0,
    'prashna one-ascendant-formula: the ascendant arctangent pattern matched NOTHING in ' +
    'src/screens/PrashnaScreen.tsx. The formula was renamed or rewritten and this check has gone ' +
    'blind — re-derive the pattern rather than deleting the assertion.');
  assert(hits.length <= 1,
    `prashna one-ascendant-formula: the ascendant arctangent is written out ${hits.length} times in ` +
    'src/screens/PrashnaScreen.tsx. It must appear exactly once, in PR_risingDegree, so that a ' +
    'correction cannot reach one copy and miss the other — which is exactly what happened between ' +
    '2026-08-18 (PR_ascMc corrected) and 2026-08-19 (PR_ramcForAsc still bare).');
  console.log(`\n  [5] ascendant arctangent written out in PrashnaScreen.tsx: ${hits.length} time(s) (must be exactly 1)`);
}

console.log(`rings checked          ${ringsChecked}`);
console.log(`geometric asc checks   ${geomChecked}   worst |altitude| ${worstAlt.toFixed(5)}° (tolerance ${ALT_TOL_DEG}°)`);
console.log(`Placidus definition    ${placChecked}   worst residual  ${worstPlac.toFixed(5)}° (tolerance ${PLAC_TOL_DEG}°)`);
console.log(`worst |span sum−360|   ${worstSum.toExponential(2)}°`);
console.log(`\n${failures === 0 ? '✓' : '✗'} prashna-high-latitude: ${checks} passed, ${failures} failed`);
process.exit(failures === 0 ? 0 : 1);
