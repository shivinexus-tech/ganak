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
//       spans must sum to exactly 360°, and no house may be degenerate or
//       oversized. This is the single assertion that catches the whole class.
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

    // Both anchors sit above the Placidus cutoff, so both must be in the
    // equal-house branch — this is the branch under test.
    assert(c.system === 'equal',
      `${A.label} / ${E.name}: expected the high-latitude fallback ('equal'), got '${c.system}'`);

    /* The convention Ganak implements, asserted against the external MC rather
       than merely described in a comment: in EQUAL HOUSE the tenth cusp is the
       ascendant + 270°, NOT the Midheaven. The real MC is a free point that
       lands in the 9th, 10th or 11th house. Both published charts confirm it. */
    for (let h = 1; h <= 12; h++) {
      const want = norm360(trop[1] + 30 * (h - 1));
      assert(sep(trop[h], want) < 1e-9,
        `${A.label} / ${E.name}: equal-house cusp ${h} is ${fmt(trop[h])}, expected ascendant+${30 * (h - 1)}° = ${fmt(want)}`);
    }
    const mcHouse = (() => {
      for (let h = 1; h <= 12; h++) {
        const a = trop[h], b = trop[h === 12 ? 1 : h + 1];
        if (a <= b ? (mc >= a && mc < b) : (mc >= a || mc < b)) return h;
      }
      return null;
    })();
    console.log(`      published MC falls in equal-house ${mcHouse} (equal house puts the MC in the 9th–11th; it is never the 10th cusp)`);
    assert(mcHouse >= 9 && mcHouse <= 11,
      `${A.label} / ${E.name}: the published MC ${A.mcPrinted} falls in equal house ${mcHouse}; the Equal House system places it in the 9th, 10th or 11th`);
    assert(sep(mc, trop[10]) > 1e-6,
      `${A.label} / ${E.name}: cusp 10 equals the real MC — that is the defect this gate exists to catch, an equal ring with a real angle pinned into it`);
  }
  console.log('');
}

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
const LON = 18.9560;
const HOURS = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22];
const NUMBERS = [1, 42, 97, 139, 200, 249];
const ALT_TOL_DEG = 0.02;   // 72 arcsec — covers the obliquity-expression and
                            // nutation differences between the two routes

let ringsChecked = 0, geomChecked = 0, worstAlt = 0, worstSum = 0;

const checkRing = (label, cusps, system) => {
  ringsChecked++;
  const spans = [];
  for (let h = 1; h <= 12; h++) spans.push(norm360(cusps[h === 12 ? 1 : h + 1] - cusps[h]));
  const sum = spans.reduce((a, b) => a + b, 0);
  worstSum = Math.max(worstSum, Math.abs(sum - 360));
  assert(Math.abs(sum - 360) < 1e-9,
    `${label}: the twelve house spans sum to ${sum.toFixed(2)}°, not 360° — the ring wraps ${(sum / 360).toFixed(2)} times`);
  const bad = spans.findIndex((s) => !(s > 1e-9 && s < 120));
  assert(bad === -1,
    `${label}: house ${bad + 1} spans ${bad === -1 ? '' : spans[bad].toFixed(2)}° — a house must be non-degenerate and under 120° (cusps ${cusps.slice(1, 13).map((v) => v.toFixed(2)).join(' ')})`);
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

console.log('=== [3] Ring invariants and [2] the geometric definition, swept ===\n');
for (const E of ENGINES) {
  for (const [place, lat] of LATS) {
    for (const h of HOURS) {
      const ms = Date.UTC(2026, 7, 18, h, 0);
      const c = E.cast(ms, lat, LON);
      const label = `${E.name} | ${place} (${lat}°) ${String(h).padStart(2, '0')}:00Z time mode`;
      checkRing(label, c.cusps, c.system);
      if (Math.abs(lat) < 89) checkGeometry(label, c.cusps, ms, lat, LON, E);
      const worst = Math.max(...Object.values(
        c.planets.reduce((acc, p) => { acc[p.house] = (acc[p.house] || 0) + 1; return acc; }, {})));
      assert(worst <= 6,
        `${label}: ${worst} of the 9 grahas are read into one house — the ring has collapsed`);
    }
  }
}

// Number mode carries its own copy of the ring; sweep it too.
for (const [place, lat] of LATS) {
  for (const n of NUMBERS) {
    const ms = Date.UTC(2026, 7, 18, 12, 0);
    const c = screen.PR_castNumber(ms, lat, LON, n);
    checkRing(`PR_castNumber | ${place} (${lat}°) number ${n}`, c.cusps, c.system);
    const worst = Math.max(...Object.values(
      c.planets.reduce((acc, p) => { acc[p.house] = (acc[p.house] || 0) + 1; return acc; }, {})));
    assert(worst <= 6,
      `PR_castNumber | ${place} (${lat}°) number ${n}: ${worst} of the 9 grahas are read into one house — the ring has collapsed`);
  }
}

// The full 249 at the three latitudes the audit named, both modes.
for (const lat of [60.01, 64.15, 69.65]) {
  for (let n = 1; n <= 249; n++) {
    const c = screen.PR_castNumber(Date.UTC(2026, 7, 18, 12, 0), lat, LON, n);
    checkRing(`PR_castNumber | ${lat}° number ${n}`, c.cusps, c.system);
  }
}

// ---------------------------------------------------------------------------
// [4] ONE ASCENDANT FORMULA IN THIS FILE — a structural check, not a numeric one
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
  console.log(`\n  [4] ascendant arctangent written out in PrashnaScreen.tsx: ${hits.length} time(s) (must be exactly 1)`);
}

/* ------------------------------------------------------ OPEN: bug bash F17
   The ring is sound in both modes. What is still true above 60° is that Ganak
   frames it two different ways on two screens, and this is where a reader of this
   gate should learn that, because this is the file about that band.

   Jyotish (src/engine/houses.ts placidusCusps, via src/engine/kundli.ts) bails out
   on the GEOMETRIC degeneracy test — a cusp-defining ecliptic point being
   circumpolar, effectively ~66.56° — and falls back to Porphyry. Prashna's inlined
   PR_placidus bails on a flat |lat| > 60 and falls back to equal house. Between the
   two cutoffs the same place gets real Placidus KP cusps on one screen and equal
   cusps on the other, under two different system names, and a KP practitioner
   comparing them finds them ~19–35° apart.

   Reported, not asserted: PR_placidus is INSIDE the parity-frozen engine markers,
   so the fix is not a change any lane may make unilaterally. The exact change is
   written out in plans/audits/2026-08-19-prashna-remaining-fix.md § F17 — including
   that the identical edit must land in validation/prashna-calc.js in the same
   commit, and that the Reykjavík anchor above should then be re-pinned to
   "published MC == cusp 10" rather than to the equal-house relation. */
{
  const src = require('fs').readFileSync('src/screens/PrashnaScreen.tsx', 'utf8');
  const flat = /if \(Math\.abs\(lat\) > 60\) return null/.test(src);
  console.log(flat
    ? '\n  OPEN (bug bash F17) — PR_placidus cuts at a flat |lat| > 60 while\n' +
      '  src/engine/houses.ts cuts at the geometric circumpolar test (~66.56°). Helsinki,\n' +
      '  Anchorage, Whitehorse, Yellowknife, Trondheim, Reykjavik and Fairbanks therefore\n' +
      '  get Placidus cusps on the Jyotish screen and equal cusps on Prashna, ~19-35 deg apart.\n' +
      '  Inside the parity-frozen markers; see plans/audits/2026-08-19-prashna-remaining-fix.md.\n'
    : '\n  bug bash F17: the two Placidus cutoffs now agree ✓\n');
}

console.log(`rings checked          ${ringsChecked}`);
console.log(`geometric asc checks   ${geomChecked}   worst |altitude| ${worstAlt.toFixed(5)}° (tolerance ${ALT_TOL_DEG}°)`);
console.log(`worst |span sum−360|   ${worstSum.toExponential(2)}°`);
console.log(`\n${failures === 0 ? '✓' : '✗'} prashna-high-latitude: ${checks} passed, ${failures} failed`);
process.exit(failures === 0 ? 0 : 1);
