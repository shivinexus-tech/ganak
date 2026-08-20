import { panchangTerm, panchangTermAt, signName, SIGN_ORDER, NAKSHATRA_ORDER } from "../i18n/panchang-terms";
import React, { useState, useEffect, useRef } from "react";
import { T } from "../components/ui-style-contract";
import { fmtDeg } from "../components/format";
import { kpNumberToLagna, kpNumberInfo, KP_NUMBER_MIN, KP_NUMBER_MAX } from "../engine/kp-horary";
import { useDepth } from "../accessibility/ComfortProvider";
import { Card, DataRow } from "../components/ui-primitives";
import FeedbackCard from "../components/FeedbackCard";
import { zoneOffset, sunEvents } from "../engine/panchang";
import { computeRulingPlanets, WEEKDAY_LORDS } from "../engine/dasha";
import { YEAR_MIN, YEAR_MAX } from "../components/birth-input";

// ------------------------------------------------- PRASHNA TOKENS (app palette)
const TOKENS = {
  bg: "var(--bg-active)", card: "var(--surface-active)", ink: "var(--ink)", muted: "var(--muted)",
  line: "var(--line)", gold: "var(--accent)", goldSoft: "var(--accent-soft)",
  sindoor: "var(--bad)", sindoorSoft: "var(--bad-surface)", amber: "var(--accent-strong)", amberSoft: "var(--accent-soft)",
  ctrlH: T.ctrlH, radius: T.rMd,
  devanagari: "Eczar, 'Noto Serif Devanagari', serif",
};

// ============================== ENGINE (validated) ==========================
const PR_D2R = Math.PI / 180, R2D = 180 / Math.PI;
const norm360 = d => ((d % 360) + 360) % 360;
const sinD = d => Math.sin(d * PR_D2R), cosD = d => Math.cos(d * PR_D2R), tanD = d => Math.tan(d * PR_D2R);
const PR_DELTA_T = 72;

function PR_time(ms) {
  const dt = new Date(ms);
  let y = dt.getUTCFullYear(), mo = dt.getUTCMonth() + 1;
  const day = dt.getUTCDate(),
    hUT = dt.getUTCHours() + dt.getUTCMinutes() / 60 + dt.getUTCSeconds() / 3600;
  if (mo <= 2) { y -= 1; mo += 12; }
  const A = Math.floor(y / 100), B = 2 - A + Math.floor(A / 4);
  const jdUT = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (mo + 1)) + day + B - 1524.5 + hUT / 24;
  const jdTT = jdUT + PR_DELTA_T / 86400;
  return { jdUT, jdTT, T: (jdTT - 2451545) / 36525, Tut: (jdUT - 2451545) / 36525 };
}
function PR_nutation(T) {
  const Om = 125.04452 - 1934.136261 * T, Ls = 280.4665 + 36000.7698 * T;
  return (-17.2 * sinD(Om) - 1.32 * sinD(2 * Ls)) / 3600;
}
const PR_obliquity = T => 23.43929111 - 0.0130041667 * T - 1.638e-7 * T * T;
function PR_sun(T) {
  const L0 = norm360(280.46646 + 36000.76983 * T + 0.0003032 * T * T);
  const M = norm360(357.52911 + 35999.05029 * T - 0.0001537 * T * T);
  const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * sinD(M)
    + (0.019993 - 0.000101 * T) * sinD(2 * M) + 0.000289 * sinD(3 * M);
  return norm360(L0 + C - 0.00569 - 0.00478 * sinD(125.04 - 1934.136 * T));
}
const PR_MOON_TERMS = [
[0,0,1,0,6288774],[2,0,-1,0,1274027],[2,0,0,0,658314],[0,0,2,0,213618],
[0,1,0,0,-185116],[0,0,0,2,-114332],[2,0,-2,0,58793],[2,-1,-1,0,57066],
[2,0,1,0,53322],[2,-1,0,0,45758],[0,1,-1,0,-40923],[1,0,0,0,-34720],
[0,1,1,0,-30383],[2,0,0,-2,15327],[0,0,1,2,-12528],[0,0,1,-2,10980],
[4,0,-1,0,10675],[0,0,3,0,10034],[4,0,-2,0,8548],[2,1,-1,0,-7888],
[2,1,0,0,-6766],[1,0,-1,0,-5163],[1,1,0,0,4987],[2,-1,1,0,4036],
[2,0,2,0,3994],[4,0,0,0,3861],[2,0,-3,0,3665],[0,1,-2,0,-2689],
[2,0,-1,2,-2602],[2,-1,-2,0,2390],[1,0,1,0,-2348],[2,-2,0,0,2236],
[0,1,2,0,-2120],[0,2,0,0,-2069],[2,-2,-1,0,2048],[2,0,1,-2,-1773],
[2,0,0,2,-1595],[4,-1,-1,0,1215],[0,0,2,2,-1110],[3,0,-1,0,-892],
[2,1,1,0,-810],[4,-1,-2,0,759],[0,2,-1,0,-713],[2,2,-1,0,-700],
[2,1,-2,0,691],[2,-1,0,-2,596],[4,0,1,0,549],[0,0,4,0,537],
[4,-1,0,0,520],[1,0,-2,0,-487],[2,1,0,-2,-399],[0,0,2,-2,-381],
[1,1,1,0,351],[3,0,-2,0,-340],[4,0,-3,0,330],[2,-1,2,0,327],
[0,2,1,0,-323],[1,1,-1,0,299],[2,0,3,0,294]];
function PR_moon(T) {
  const Lp = norm360(218.3164477 + 481267.88123421 * T - 0.0015786 * T * T + T*T*T/538841 - T*T*T*T/65194000);
  const D  = norm360(297.8501921 + 445267.1114034 * T - 0.0018819 * T * T + T*T*T/545868 - T*T*T*T/113065000);
  const M  = norm360(357.5291092 + 35999.0502909 * T - 0.0001536 * T * T + T*T*T/24490000);
  const Mp = norm360(134.9633964 + 477198.8675055 * T + 0.0087414 * T * T + T*T*T/69699 - T*T*T*T/14712000);
  const F  = norm360(93.2720950 + 483202.0175233 * T - 0.0036539 * T * T - T*T*T/3526000 + T*T*T*T/863310000);
  const E = 1 - 0.002516 * T - 0.0000074 * T * T;
  let sum = 0;
  for (const [d, m, mp, f, c] of PR_MOON_TERMS) {
    let coef = c;
    if (m === 1 || m === -1) coef *= E; else if (m === 2 || m === -2) coef *= E * E;
    sum += coef * sinD(d * D + m * M + mp * Mp + f * F);
  }
  sum += 3958 * sinD(119.75 + 131.849 * T) + 1962 * sinD(Lp - F) + 318 * sinD(53.09 + 479264.29 * T);
  return norm360(Lp + sum / 1e6 + PR_nutation(T));
}
const PR_KEP = {
  Ma:[1.52371034,0.00001847,0.09339410,0.00007882,1.84969142,-0.00813131,-4.55343205,19140.30268499,-23.94362959,0.44441088,49.55953891,-0.29257343],
  Me:[0.38709927,0.00000037,0.20563593,0.00001906,7.00497902,-0.00594749,252.25032350,149472.67411175,77.45779628,0.16047689,48.33076593,-0.12534081],
  Ju:[5.20288700,-0.00011607,0.04838624,-0.00013253,1.30439695,-0.00183714,34.39644051,3034.74612775,14.72847983,0.21252668,100.47390909,0.20469106],
  Ve:[0.72333566,0.00000390,0.00677672,-0.00004107,3.39467605,-0.00078890,181.97909950,58517.81538729,131.60246718,0.00268329,76.67984255,-0.27769418],
  Sa:[9.53667594,-0.00125060,0.05386179,-0.00050991,2.48599187,0.00193609,49.95424423,1222.49362201,92.59887831,-0.41897216,113.66242448,-0.28867794],
  Ea:[1.00000261,0.00000562,0.01671123,-0.00004392,-0.00001531,-0.01294668,100.46457166,35999.37244981,102.93768193,0.32327364,0.0,0.0]
};
function PR_helio(key, T) {
  const p = PR_KEP[key];
  const a = p[0]+p[1]*T, e = p[2]+p[3]*T, I = p[4]+p[5]*T;
  const L = p[6]+p[7]*T, w = p[8]+p[9]*T, O = p[10]+p[11]*T, om = w - O;
  let M = norm360(L - w); if (M > 180) M -= 360;
  let Er = M * PR_D2R;
  for (let i = 0; i < 12; i++) Er = Er - (Er - e * Math.sin(Er) - M * PR_D2R) / (1 - e * Math.cos(Er));
  const xo = a * (Math.cos(Er) - e), yo = a * Math.sqrt(1 - e * e) * Math.sin(Er);
  const cw = cosD(om), sw = sinD(om), cO = cosD(O), sO = sinD(O), ci = cosD(I), si = sinD(I);
  return { x:(cw*cO - sw*sO*ci)*xo + (-sw*cO - cw*sO*ci)*yo,
           y:(cw*sO + sw*cO*ci)*xo + (-sw*sO + cw*cO*ci)*yo,
           z:(sw*si)*xo + (cw*si)*yo };
}
function PR_planet(key, T) {
  const ea = PR_helio('Ea', T);
  let pl = PR_helio(key, T);
  let dx = pl.x-ea.x, dy = pl.y-ea.y, dz = pl.z-ea.z;
  const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
  pl = PR_helio(key, T - dist * 0.0057755183 / 36525);
  dx = pl.x-ea.x; dy = pl.y-ea.y;
  return norm360(Math.atan2(dy, dx) * R2D + 1.396971 * T + 0.0003086 * T * T + PR_nutation(T));
}
const PR_meanRahu = T => norm360(125.0445479 - 1934.1362891*T + 0.0020754*T*T + T*T*T/467441 - T*T*T*T/60616000);
const PR_ayanamsa = T => 23.85236 + 1.3960 * T + 0.000139 * T * T;
const PR_toSid = (trop, T) => norm360(trop - PR_ayanamsa(T));
const PR_gmst = (jdUT, Tut) => norm360(280.46061837 + 360.98564736629 * (jdUT - 2451545)
  + 0.000387933 * Tut * Tut - Tut * Tut * Tut / 38710000);
/* Right ascension of an ecliptic degree on the ecliptic itself (latitude 0):
   tan(RA) = cos(eps) * tan(lambda). Used only by the polar quadrant correction
   below. */
const PR_raOfEcl = (lam, eps) => norm360(Math.atan2(cosD(eps) * sinD(lam), cosD(lam)) * R2D);
function PR_ascMc(jdUT, Tut, lat, lonE) {
  const eps = PR_obliquity(Tut), ramc = norm360(PR_gmst(jdUT, Tut) + lonE);
  let asc = norm360(Math.atan2(cosD(ramc), -(sinD(ramc) * cosD(eps) + tanD(lat) * sinD(eps))) * R2D);
  const mc = norm360(Math.atan2(sinD(ramc), cosD(ramc) * cosD(eps)) * R2D);
  /* POLAR QUADRANT CORRECTION (2026-08-18). The standard ascendant formula
     returns ONE of the two antipodal points where the ecliptic cuts the horizon.
     Below the polar circle that is always the eastern one. Above it -- Murmansk
     68.96, Tromso 69.65, and everything nearer the pole -- the arctangent lands
     in the other quadrant for part of the day and the function returns the
     DESCENDANT instead: at Tromso on 2026-08-18 it did so at 18:00Z and 20:00Z,
     handing back Scorpio 22 deg 57 min as the rising degree when that degree was
     setting. The whole chart is then rotated by six houses.
     Diurnal motion is uniform, so the fix is the definition itself: everything
     on the eastern half of the horizon is rising and everything on the western
     half is setting. Take the hour angle of the computed point; if it is west of
     the meridian, the formula returned the descendant, so take its opposite.
     Below the polar circle sin(H) is never positive here, so this is a no-op for
     every latitude Ganak's earlier gates covered. Proven at 528 sampled
     latitude/hour pairs by validation/prashna-high-latitude.cjs, which tests
     "rising" against published spherical astronomy rather than against a second
     copy of this code. */
  if (sinD(norm360(ramc - PR_raOfEcl(asc, eps))) > 0) asc = norm360(asc + 180);
  return { asc, mc, ramc, eps };
}
const PR_eclFromRA = (ra, eps) => norm360(Math.atan2(sinD(ra), cosD(ra) * cosD(eps)) * R2D);
/* WHERE PLACIDUS ENDS (2026-08-19, bug bash F17). Placidus is undefined exactly
   where a cusp-defining ecliptic point is CIRCUMPOLAR -- |tan(lat) * tan(dec)| >= 1,
   the test inside solve() below. Because an ecliptic point's declination never
   exceeds the obliquity, that condition first bites at the polar circle (~66.56 deg),
   not at a round number. This function used to bail one step earlier, on a flat
   |lat| > 60 with nothing behind the 60. src/engine/houses.ts -- the Placidus the
   Jyotish chart screen draws -- has always used the geometric test, so between 60 deg
   and the polar circle one place at one moment got real Placidus cusps on the Jyotish
   screen and equal-house cusps here: at Reykjavik 64.15N on 2026-06-21 the twelve
   cusps stood 6.6-15.9 deg apart at 12:00Z and as much as 81.3 deg apart at other
   hours, and Helsinki, Whitehorse, Anchorage, Yellowknife, Trondheim and Fairbanks
   were the same story. KP is a Placidus system -- "for the
   other cusps take only the LATITUDE, prepared per the PLACIDUS system" (KP Reader VI,
   Section IV, page-pinned in plans/prashna-249-ksk-verify.md) -- so wherever Placidus
   exists KP horary uses it, and the flat 60 was denying it to places that have it.
   Above the polar circle Placidus genuinely does not exist and PR_ring falls back to
   equal house (rule 9, a Ganak product decision, not KSK).
   The identical change is in validation/prashna-calc.js placidusCuspsTropical --
   changing only one of the two would leave prashna-parity.js green while the two
   engines disagreed. Anchored to published charts and to the published Placidus
   definition, never to the sibling copy, by validation/prashna-high-latitude.cjs. */
function PR_placidus(ramc, eps, lat) {
  const solve = (offsetFn, start) => {
    let ra = norm360(ramc + start);
    for (let i = 0; i < 24; i++) {
      const dec = Math.asin(sinD(eps) * sinD(PR_eclFromRA(ra, eps))) * R2D;
      const x = tanD(lat) * tanD(dec);
      if (Math.abs(x) >= 1) return null;
      ra = norm360(ramc + offsetFn(Math.asin(x) * R2D));
    }
    return PR_eclFromRA(ra, eps);
  };
  const c11 = solve(ad => (90 + ad) / 3, 30), c12 = solve(ad => 2 * (90 + ad) / 3, 60);
  const c2 = solve(ad => 180 - 2 * (90 - ad) / 3, 120), c3 = solve(ad => 180 - (90 - ad) / 3, 150);
  return [c11, c12, c2, c3].some(v => v === null) ? null : { c11, c12, c2, c3 };
}
/* Build the twelve tropical cusps from the ascendant, the MC and the Placidus
   quadrant solution (or null where Placidus is undefined).

   HIGH-LATITUDE CONVENTION (implemented 2026-08-18, P0 fix): where Placidus is
   undefined the fallback is the EQUAL HOUSE system reckoned from the ascendant --
   cusp h = ascendant + 30*(h-1) for ALL twelve houses, the MC included. In equal
   house the MC is NOT the tenth cusp; it is a separate sensitive point that may
   fall in the 9th, 10th or 11th. That is the defining property of the system and
   it is why the tenth cusp must not be pinned to the real MC here.

   WHY: the previous code replaced only cusps 11, 12, 2 and 3 with 30-degree steps
   and LEFT cusp 10 as the real MC (and so cusp 4 as the real IC) inside an
   otherwise equal ring. Below ~60 deg latitude MC is approximately asc+270 so
   nothing showed; above it the two real angles overtook their neighbours, the
   ring stopped advancing monotonically, the twelve spans summed to 1080 deg
   instead of 360 deg, and the linear `inHouse` scan dropped up to eight of the
   nine grahas into a single house. At Tromso 166 of the 249 numbers were
   affected. The screen's own disclosure already said "equal houses" in both
   languages; the code simply did not build equal houses. This makes the two
   agree.

   WHY EQUAL HOUSE AND NOT SOMETHING ELSE: Krishnamurti's KP is a Placidus system
   and the KP Readers record no polar convention at all, so nothing here can be
   attributed to KSK. Equal house is the minimal, fully defined ring that (a)
   exists at every latitude where an ascendant exists, (b) keeps the ascendant --
   the one angle KP horary is actually judged from -- exact, and (c) is what the
   shipped user-facing disclosure already names. It is recorded as a Ganak
   product decision, NOT doctrine: plans/prashna-249-ksk-verify.md rule 9.

   INVARIANTS, asserted externally by validation/prashna-high-latitude.cjs:
   monotonic once round the zodiac, twelve spans summing to exactly 360 deg, no
   degenerate or oversized house. */
function PR_ring(asc, mc, p) {
  const trop = new Array(13).fill(0);
  if (!p) {
    for (let h = 1; h <= 12; h++) trop[h] = norm360(asc + 30 * (h - 1));
    return trop;
  }
  trop[1] = asc; trop[10] = mc;
  trop[11] = p.c11; trop[12] = p.c12; trop[2] = p.c2; trop[3] = p.c3;
  for (const h of [4, 5, 6, 7, 8, 9]) trop[h] = norm360(trop[((h + 5) % 12) + 1] + 180);
  return trop;
}
const GRAHA = ['Ke','Ve','Su','Mo','Ma','Ra','Ju','Sa','Me'];
const DASHA_YRS = { Ke:7, Ve:20, Su:6, Mo:10, Ma:7, Ra:18, Ju:16, Sa:19, Me:17 };
const NAK_EN = ['Ashwini','Bharani','Krittika','Rohini','Mrigashira','Ardra','Punarvasu','Pushya','Ashlesha','Magha','Purva Phalguni','Uttara Phalguni','Hasta','Chitra','Swati','Vishakha','Anuradha','Jyeshtha','Mula','Purva Ashadha','Uttara Ashadha','Shravana','Dhanishta','Shatabhisha','Purva Bhadrapada','Uttara Bhadrapada','Revati'];
const PR_SIGN_LORD = ['Ma','Ve','Me','Mo','Su','Me','Ve','Ma','Ju','Sa','Sa','Ju'];
const GRAHA_EN = { Su:'Sun', Mo:'Moon', Ma:'Mars', Me:'Mercury', Ju:'Jupiter', Ve:'Venus', Sa:'Saturn', Ra:'Rahu', Ke:'Ketu' };
function PR_buildSubTable() {
  const rows = []; let cur = 0;
  for (let n = 0; n < 27; n++) {
    const startIdx = n % 9;
    for (let s = 0; s < 9; s++) {
      const sub = GRAHA[(startIdx + s) % 9];
      let span = DASHA_YRS[sub] * 400;
      while (span > 0) {
        const edge = (Math.floor(cur / 108000) + 1) * 108000;
        const take = Math.min(span, edge - cur);
        rows.push({ from: cur, to: cur + take, star: GRAHA[n % 9], sub });
        cur += take; span -= take;
      }
    }
  }
  return rows;
}
const PR_SUBS = PR_buildSubTable();
/* Boundary tolerance, in arcseconds. The 249 number method pins the ascendant
   EXACTLY at a sub-segment start; the tropical round-trip in PR_castNumber lands
   up to 8.5e-14 deg (3.1e-10 arcsec) below it, and a zero-tolerance half-open
   test then returns the PREVIOUS sub. 1e-6 arcsec is ~3000x the worst observed
   error and ~2.4e9x smaller than the shortest real sub (Sun, 2400 arcsec), so it
   can only ever resolve float noise -- never a genuine position. */
const PR_SUB_EPS = 1e-6;
function PR_subOf(sid) {
  const s = norm360(sid) * 3600;
  for (const r of PR_SUBS) if (s >= r.from - PR_SUB_EPS && s < r.to - PR_SUB_EPS) return r;
  return PR_SUBS[PR_SUBS.length - 1];
}
/* Same boundary problem PR_SUB_EPS solves for the sub: the 249 method pins the
   ascendant exactly on a nakshatra/pada boundary for some numbers, and norm360
   alone lands ~6.6e-11 arcsec BELOW the exact value, so a zero-tolerance floor
   returns the PREVIOUS nakshatra. Working in integer arcsec with the same
   tolerance keeps the nakshatra, the pada and the sub-lord on one story --
   before this, the chart showed a nakshatra whose lord contradicted the star
   lord printed beside it. */
const PR_NAK_ARCSEC = 48000;   // 13°20'
const PR_PADA_ARCSEC = 12000;  // 3°20'
const PR_nakOf = sid => {
  const s = norm360(sid) * 3600 + PR_SUB_EPS;
  const idx = Math.floor(s / PR_NAK_ARCSEC) % 27;
  return { idx, pada: Math.floor((s % PR_NAK_ARCSEC) / PR_PADA_ARCSEC) + 1, en: NAK_EN[idx] };
};
function PR_sidAll(ms) {
  const { jdUT, T, Tut } = PR_time(ms);
  const trop = { Su: PR_sun(T), Mo: PR_moon(T), Ma: PR_planet('Ma',T), Me: PR_planet('Me',T),
    Ju: PR_planet('Ju',T), Ve: PR_planet('Ve',T), Sa: PR_planet('Sa',T), Ra: PR_meanRahu(T) };
  trop.Ke = norm360(trop.Ra + 180);
  const sid = {}; for (const k in trop) sid[k] = PR_toSid(trop[k], T);
  return { sid, jdUT, T, Tut };
}
function PR_speed(key, ms) {
  const a = PR_sidAll(ms - 43200000).sid[key], b = PR_sidAll(ms + 43200000).sid[key];
  let d = b - a; if (d > 180) d -= 360; if (d < -180) d += 360;
  return d;
}
function PR_cast(ms, lat, lonE) {
  const { sid, jdUT, T, Tut } = PR_sidAll(ms);
  const { asc, mc, ramc, eps } = PR_ascMc(jdUT, Tut, lat, lonE);
  const p = PR_placidus(ramc, eps, lat);
  const trop = PR_ring(asc, mc, p);
  const cusps = trop.map((v, i) => i === 0 ? 0 : PR_toSid(v, T));
  const inHouse = lon => {
    for (let h = 1; h <= 12; h++) {
      const a = cusps[h], b = cusps[h === 12 ? 1 : h + 1];
      if (a <= b ? (lon >= a && lon < b) : (lon >= a || lon < b)) return h;
    }
    return 1;
  };
  const planets = ['Su','Mo','Ma','Me','Ju','Ve','Sa','Ra','Ke'].map(k => {
    const lon = sid[k], sl = PR_subOf(lon);
    const retro = (k==='Ra'||k==='Ke') ? true : (k==='Su'||k==='Mo') ? false : PR_speed(k, ms) < 0;
    return { key:k, lon, sign: Math.floor(lon/30), deg: lon % 30,
      nak: PR_nakOf(lon), star: sl.star, sub: sl.sub, retro, house: inHouse(lon) };
  });
  const lagna = { lon: cusps[1], sign: Math.floor(cusps[1]/30), deg: cusps[1] % 30,
    nak: PR_nakOf(cusps[1]), star: PR_subOf(cusps[1]).star, sub: PR_subOf(cusps[1]).sub };
  return { ms, lagna, planets, cusps, system: p ? 'placidus' : 'equal' };
}
const QUESTIONS = [
  { key:'marriage',  cusp:7,  favor:[2,7,11],    deny:[1,6,10], hi:'विवाह',      subHi:'सम्बन्ध और जीवनसाथी',          en:'Marriage',    subEn:'Relationships and commitment' },
  { key:'career',    cusp:10, favor:[2,6,10,11], deny:[5,9,12], hi:'करियर',      subHi:'नौकरी, पदोन्नति या काम',       en:'Career',      subEn:'Job, promotion or work' },
  { key:'money',     cusp:11, favor:[2,6,11],    deny:[5,8,12], hi:'धन',         subHi:'आय, बचत या लाभ',               en:'Money',       subEn:'Income, savings or gains' },
  { key:'health',    cusp:6,  favor:[1,5,11],    deny:[6,8,12], hi:'स्वास्थ्य',   subHi:'रोगमुक्ति और सेहत',             en:'Health',      subEn:'Recovery and wellbeing' },
  { key:'travel',    cusp:12, favor:[3,9,12],    deny:[2,4,11], hi:'यात्रा',      subHi:'सफ़र या विदेश जाना',           en:'Travel',      subEn:'Journeys or going abroad' },
  { key:'education', cusp:4,  favor:[4,9,11],    deny:[3,8,12], hi:'शिक्षा',      subHi:'पढ़ाई, परीक्षा या प्रवेश',       en:'Education',   subEn:'Study, exams or admission' },
  { key:'property',  cusp:4,  favor:[2,4,11],    deny:[3,8,12], hi:'सम्पत्ति',    subHi:'घर, भूमि या वाहन',              en:'Property',    subEn:'Home, land or vehicle' },
  { key:'children',  cusp:5,  favor:[2,5,11],    deny:[1,4,10], hi:'सन्तान',      subHi:'गर्भधारण या सन्तान के विषय',    en:'Children',    subEn:'Conception or child matters' },
  { key:'litigation',cusp:6,  favor:[6,11],      deny:[7,8,12], hi:'विवाद',       subHi:'मुक़दमा या आपसी टकराव',          en:'Disputes',    subEn:'Court cases or conflicts' },
  { key:'lost',      cusp:2,  favor:[2,6,11],    deny:[3,8,12], hi:'खोई वस्तु',   subHi:'गुम वस्तु की खोज',              en:'Lost item',   subEn:'Finding something missing' },
  { key:'venture',   cusp:10, favor:[2,6,10,11], deny:[5,8,12], hi:'नया कार्य',   subHi:'व्यवसाय या नई परियोजना',         en:'New venture', subEn:'Business or a new project' },
  { key:'general',   cusp:1,  favor:[1,10,11],   deny:[6,8,12], hi:'अन्य प्रश्न', subHi:'ऊपर न दिया गया विषय',            en:'Other question', subEn:'Anything not listed above' }
];
const HOUSE_MEANING = { 1:'you yourself', 2:'wealth & family', 3:'courage & effort',
  4:'home & comfort', 5:'children & creativity', 6:'obstacles, illness & debt',
  7:'partnership & the other party', 8:'obstruction & delay', 9:'fortune & grace',
  10:'career & standing', 11:'gains & fulfilment', 12:'loss, expense & distance' };
function PR_significations(chart, key) {
  const P = chart.planets.find(x => x.key === key);
  const starP = chart.planets.find(x => x.key === P.star) || P;
  const owned = g => {
    const hs = [];
    for (let h = 1; h <= 12; h++)
      if (PR_SIGN_LORD[Math.floor(chart.cusps[h] / 30)] === g) hs.push(h);
    return hs;
  };
  return { primary: [...new Set([starP.house, ...owned(starP.key)])],
           secondary: [...new Set([P.house, ...owned(P.key)])] };
}
function PR_judge(chart, q) {
  const cuspSub = PR_subOf(chart.cusps[q.cusp]).sub;
  const sig = PR_significations(chart, cuspSub);
  let score = 0; const hits = { favor: [], deny: [] };
  for (const h of sig.primary) {
    if (q.favor.includes(h)) { score += 2; hits.favor.push(h); }
    if (q.deny.includes(h)) { score -= 2; hits.deny.push(h); }
  }
  for (const h of sig.secondary) {
    if (q.favor.includes(h) && !hits.favor.includes(h)) { score += 1; hits.favor.push(h); }
    if (q.deny.includes(h) && !hits.deny.includes(h)) { score -= 1; hits.deny.push(h); }
  }
  const subPlanet = chart.planets.find(p => p.key === cuspSub);
  const retroDrag = subPlanet.retro && cuspSub !== 'Ra' && cuspSub !== 'Ke';
  if (retroDrag) score -= 1;
  const moonSig = PR_significations(chart, 'Mo');
  const moonLinked = [...moonSig.primary, ...moonSig.secondary]
    .some(h => h === q.cusp || q.favor.includes(h));
  const verdict = score >= 2 ? 'favourable' : score <= -2 ? 'unfavourable' : 'mixed';
  return { q, cuspSub, subPlanet, score, hits, moonLinked, retroDrag, verdict };
}
// ============================ END ENGINE ====================================

/* Display-only name tables. These live BELOW the frozen marker on purpose: the parity
   gate evaluates the region above as plain, self-contained JS, so it can carry neither
   an import nor a TypeScript annotation. Everything the reader actually sees resolves
   through the one shared lookup. NAK_EN stays inlined above because the engine itself
   uses it; validation/language-leak-scan.cjs asserts that copy still matches. */
const RASHI_EN = SIGN_ORDER.map((_, i) => signName("en", i));
const RASHI_HI = SIGN_ORDER.map((_, i) => panchangTermAt("hi", "sign", i));
const GRAHA_HI: Record<string, string> = Object.fromEntries(
  Object.entries(GRAHA_EN).map(([abbr, full]) => [abbr, panchangTerm("hi", "planet", full)]));

// ===================== KP HORARY NUMBER METHOD (1–249) ======================
// Sits BELOW the parity-frozen engine on purpose: it reuses the exact same
// Placidus + ephemeris the time mode uses, so the sky is identical and only the
// houses are framed by the number. Pure number→lagna map is src/engine/
// kp-horary.ts; sourcing + disclaimer live in plans/prashna-249-ksk-verify.md.

/* Invert the ascendant equation: find the RAMC (local sidereal time angle) that
   makes the ascendant fall at targetAscTrop (tropical°) at latitude `lat`.

   The ascendant is a monotonic-but-CIRCULAR function of RAMC: it increases
   through one full turn as RAMC sweeps 0→360°, wrapping 360°→0° exactly once.
   A naive `lo=0,hi=360` bisection on `norm360(asc(mid)-target)<180` straddles
   that wrap — on its first step it can discard the half that holds the true
   root, then collapse to a wrong RAMC (usually ≈0). That was F14: cusp 1 stayed
   correct (pinned directly), but the MC and cusps 2–12 were built from the wrong
   RAMC, diverging up to ~76.7° vs Swiss Ephemeris for a latitude-dependent band.

   Wrap-safe fix: coarse-scan RAMC for the small, wrap-free cell whose FORWARD
   ascendant-arc contains the target, then bisect inside that cell where the
   ascendant is continuous and strictly monotonic — no wrap can be straddled.
   Deterministic and fast (a few hundred cheap evals). Verified against Swiss
   Ephemeris (swe_houses_armc, Placidus) to 0.0000″ across 1–249 × 3 latitudes. */
function PR_ramcForAsc(targetAscTrop, eps, lat) {
  const ascOf = ramc => norm360(Math.atan2(cosD(ramc), -(sinD(ramc) * cosD(eps) + tanD(lat) * sinD(eps))) * R2D);
  const target = norm360(targetAscTrop);
  const STEP = 0.5;                       // 720 samples: keeps each cell's asc-span « 180°
  let r0 = 0, a0 = ascOf(0);
  for (let k = 1; k <= 720; k++) {
    const r1 = k * STEP, a1 = ascOf(r1 % 360);
    const span = norm360(a1 - a0);        // forward asc-increase across this cell
    const off = norm360(target - a0);     // forward distance from a0 to the target
    if (span > 1e-9 && off <= span) {     // target lies inside this wrap-free cell
      let lo = r0, hi = r1;
      for (let i = 0; i < 60; i++) {
        const mid = (lo + hi) / 2;
        if (norm360(ascOf(mid) - a0) >= off) hi = mid; else lo = mid;
      }
      return norm360((lo + hi) / 2);
    }
    r0 = r1; a0 = a1;
  }
  // Geometric edge (e.g. near-circumpolar latitude where the ascendant is not
  // cleanly monotonic across a coarse cell) — never return a silently-wrong
  // angle: fall back to a full-resolution nearest-RAMC search. Deterministic.
  let best = 0, bestD = Infinity;
  for (let a = 0; a < 360; a += 0.01) {
    let d = Math.abs(norm360(ascOf(a) - target)); if (d > 180) d = 360 - d;
    if (d < bestD) { bestD = d; best = a; }
  }
  return best;
}

/* KP-New ayanamsa (Prof. K. Balachandran, KP & Astrology Year Book 2003) — the
   modern KP standard, owner-chosen 2026-07-24 for this mode (an ayanamsa fork
   from Ganak's Lahiri default). Formula: 22°22′15.7″ at 1 Jan 1900 + Newcomb
   precession (50.2388475″/yr, +0.000111″/yr² adjustment). Verified: this returns
   23°46′05″ for 1 Feb 2000 vs the published 23°46′04″. T = frozen engine's TT
   Julian centuries from J2000, so Ty = years since 1900 = 100 + 100·T. */
function PR_kpNewAyan(T) {
  const Ty = 100 + 100 * T;
  return 22 + 1335.7 / 3600 + (Ty * 50.2388475 + Ty * Ty * 0.000111) / 3600;
}

/* Cast a KP horary NUMBER chart on the KP-New ayanamsa: real planets for the
   moment/place of judgment, houses framed by the number's ascendant. Same output
   shape as PR_cast so PR_judge and the chart UI work unchanged. The number's
   nirayana ascendant is ayanamsa-independent (fixed by the 249 table), so only
   the tropical↔sidereal conversions and the planet shift use KP-New. Returns
   null for a number outside 1–249 (KP_NUMBER_MIN..KP_NUMBER_MAX). */
function PR_castNumber(ms, lat, lonE, number) {
  const ascSid = kpNumberToLagna(number);
  if (ascSid === null) return null;
  const { sid, T, Tut } = PR_sidAll(ms);            // real sky (Lahiri sidereal)
  const eps = PR_obliquity(Tut);
  const ayan = PR_kpNewAyan(T);                     // KP-New for this mode
  const delta = PR_ayanamsa(T) - ayan;             // Lahiri → KP-New shift for planets
  const ascTrop = norm360(ascSid + ayan);          // number ascendant, tropical (KP-New)
  const ramc = PR_ramcForAsc(ascTrop, eps, lat);
  const mc = norm360(Math.atan2(sinD(ramc), cosD(ramc) * cosD(eps)) * R2D);
  const p = PR_placidus(ramc, eps, lat);
  /* Same ring builder as the time mode, so the high-latitude equal-house
     convention documented on PR_ring cannot drift between the two modes. */
  const trop = PR_ring(ascTrop, mc, p);
  const cusps = trop.map((v, i) => i === 0 ? 0 : norm360(v - ayan)); // KP-New sidereal cusps
  /* The number DEFINES the nirayana ascendant. Converting it to tropical for the
     RAMC inversion and back is a lossy round-trip (up to 8.5e-14 deg), and the
     result is pinned at a sub boundary where that error is decisive. Take cusp 1
     from the table, not from the round-trip. Cusps 2-12 legitimately come from
     Placidus and are generic reals, so they keep the computed values. */
  cusps[1] = ascSid;
  const inHouse = lon => {
    for (let h = 1; h <= 12; h++) {
      const a = cusps[h], b = cusps[h === 12 ? 1 : h + 1];
      if (a <= b ? (lon >= a && lon < b) : (lon >= a || lon < b)) return h;
    }
    return 1;
  };
  const planets = ['Su', 'Mo', 'Ma', 'Me', 'Ju', 'Ve', 'Sa', 'Ra', 'Ke'].map(k => {
    const lon = norm360(sid[k] + delta), sl = PR_subOf(lon); // real sky in KP-New sidereal
    const retro = (k === 'Ra' || k === 'Ke') ? true : (k === 'Su' || k === 'Mo') ? false : PR_speed(k, ms) < 0;
    return { key: k, lon, sign: Math.floor(lon / 30), deg: lon % 30,
      nak: PR_nakOf(lon), star: sl.star, sub: sl.sub, retro, house: inHouse(lon) };
  });
  const lagna = { lon: cusps[1], sign: Math.floor(cusps[1] / 30), deg: cusps[1] % 30,
    nak: PR_nakOf(cusps[1]), star: PR_subOf(cusps[1]).star, sub: PR_subOf(cusps[1]).sub };
  return { ms, number, ayanamsa: 'kp-new', lagna, planets, cusps, system: p ? 'placidus' : 'equal' };
}

/* ---- Practitioner derivations. Pure, below the frozen engine, reusing the
   same PR_subOf / PR_SIGN_LORD the verdict uses -- so the table an astrologer
   audits is literally the data the judgment ran on, not a parallel model. ---- */

const PR_GRAHA_ORDER = ['Su','Mo','Ma','Me','Ju','Ve','Sa','Ra','Ke'];

/* All twelve cuspal sub-lords. KP judges a question through the sub-lord of the
   relevant cusp; a practitioner needs the whole set to audit the verdict. */
function PR_cuspalTable(chart) {
  const rows = [];
  for (let h = 1; h <= 12; h++) {
    const lon = chart.cusps[h];
    const sl = PR_subOf(lon);
    rows.push({ house: h, lon, sign: Math.floor(lon / 30), deg: lon % 30,
      nak: PR_nakOf(lon), star: sl.star, sub: sl.sub });
  }
  return rows;
}

/* The standard KP four-fold significator grid for each house:
     A  planets in the star of an occupant of the house
     B  occupants of the house
     C  planets in the star of the house's owner
     D  the owner (lord of the sign the cusp falls in)
   Rahu/Ketu are listed on their own star-lord footing like any other graha; the
   agency-by-conjunction refinement is deliberately NOT applied here, because the
   verdict engine does not apply it either and the grid must mirror the engine. */
function PR_significatorGrid(chart) {
  const rows = [];
  for (let h = 1; h <= 12; h++) {
    const B = chart.planets.filter(p => p.house === h).map(p => p.key);
    const D = [PR_SIGN_LORD[Math.floor(chart.cusps[h] / 30)]];
    const A = chart.planets.filter(p => B.includes(p.star)).map(p => p.key);
    const C = chart.planets.filter(p => D.includes(p.star)).map(p => p.key);
    const all = PR_GRAHA_ORDER.filter(k =>
      A.includes(k) || B.includes(k) || C.includes(k) || D.includes(k));
    rows.push({ house: h, A, B, C, D, all });
  }
  return rows;
}

/* Self-contained share card. Canvas rather than DOM-to-image so it needs no
   external library and no CSP-relevant network fetch; 1080x1350 (4:5) is the
   aspect chat clients preview without cropping the disclosures. */
function PR_shareCardCanvas(result, hi) {
  const W = 1080, H = 1350, PAD = 64;
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const g = cv.getContext('2d');
  const font = (px, weight) => `${weight || 400} ${px}px -apple-system, "Segoe UI", "Noto Serif Devanagari", "Eczar", sans-serif`;

  /* The card is a standalone PNG that travels into chat apps, so it always paints the
     LIGHT brand palette whatever colour mode the sender is in. A canvas cannot resolve
     CSS variables, so read the fixed `*-light` token values from the one token source
     instead of restating brand hexes here -- a brand edit then reaches this card too. */
  const root = getComputedStyle(document.documentElement);
  const brand = name => root.getPropertyValue(name).trim();
  const PAPER = brand('--theme-bg-light'), INK = brand('--theme-ink-light');
  const GOLD = brand('--theme-gold-light'), MUTED = brand('--theme-muted-light');
  const LINE = brand('--theme-line-light'), FLAG = brand('--theme-bad-light');

  g.fillStyle = PAPER; g.fillRect(0, 0, W, H);
  g.fillStyle = GOLD; g.fillRect(0, 0, W, 10);

  let y = PAD + 40;
  g.fillStyle = INK; g.font = font(52, 700);
  g.fillText(hi ? 'प्रश्न कुण्डली' : 'Prashna chart', PAD, y);

  y += 46; g.font = font(26); g.fillStyle = MUTED;
  const q = hi ? result.verdict.q.hi : result.verdict.q.en;
  const modeTxt = result.mode === 'number'
    ? (hi ? `कृष्णमूर्ति पद्धति अंक ${result.number}` : `KP number method · #${result.number}`)
    : (hi ? 'समय आधारित होरारी' : 'Time-based horary');
  g.fillText(`${q} · ${modeTxt}`, PAD, y);

  y += 56; g.strokeStyle = LINE; g.lineWidth = 2;
  g.beginPath(); g.moveTo(PAD, y); g.lineTo(W - PAD, y); g.stroke();

  /* THE VERDICT (bug bash F11). The card used to paint the question, the lagna,
     the judged cuspal sub-lord, all twelve cuspal sub-lords and the disclosures --
     and never the answer. A recipient got the evidence with the answer removed,
     from a button that sits under a verdict, in an app whose first principle is
     answer-before-data. It leads here, exactly as it leads on screen. */
  const isNumCard = result.mode === 'number';
  const vstyle = isNumCard ? NUM_VERDICT[result.verdict.verdict] : VERDICT_STYLE[result.verdict.verdict];
  y += 54; g.fillStyle = FLAG; g.font = font(44, 700);
  g.fillText(isNumCard ? (hi ? vstyle.badge.hi : vstyle.badge.en) : (hi ? vstyle.hi : vstyle.en), PAD, y);
  if (isNumCard) { y += 38; g.fillStyle = INK; g.font = font(25); g.fillText(hi ? vstyle.hi : vstyle.en, PAD, y); }

  // Lagna + the deciding cuspal sub-lord -- the two numbers an astrologer reads first.
  y += 52; g.fillStyle = INK; g.font = font(30, 600);
  const L = result.chart.lagna;
  /* Number mode pins the lagna at an exact table degree; fmtDeg's rounding shows
     31/249 of them one arcminute low, so the card must format it exactly the way
     the in-app Lagna chip does or the two disagree on the same number. */
  const lagnaDeg = result.mode === 'number' ? PR_fmtNumberDeg(L.deg) : fmtDeg(L.deg);
  g.fillText(`${hi ? 'लग्न' : 'Lagna'}: ${(hi ? RASHI_HI : RASHI_EN)[L.sign]} ${lagnaDeg}  ·  ${(hi ? panchangTermAt("hi", "nakshatra", L.nak.idx) : L.nak.en)}-${L.nak.pada}`, PAD, y);
  y += 42; g.fillStyle = FLAG;
  const cuspOrd = hi ? `${result.verdict.q.cusp}वें भाव उप-स्वामी`
                     : `${englishOrdinal(result.verdict.q.cusp)} cusp sub-lord`;
  g.fillText(`${cuspOrd}: ${(hi ? GRAHA_HI : GRAHA_EN)[result.verdict.cuspSub]}`, PAD, y);

  // Twelve cuspal sub-lords, two columns of six.
  y += 58; g.fillStyle = MUTED; g.font = font(22, 600);
  g.fillText(hi ? 'बारहों भावों के उप-स्वामी' : 'CUSPAL SUB-LORDS', PAD, y);
  y += 12;
  const rows = PR_cuspalTable(result.chart);
  g.font = font(24); const colW = (W - PAD * 2) / 2, rowH = 42;
  rows.forEach((r, i) => {
    const col = i < 6 ? 0 : 1, row = i % 6;
    const x = PAD + col * colW, ry = y + 38 + row * rowH;
    g.fillStyle = r.house === result.verdict.q.cusp ? FLAG : INK;
    g.font = font(24, r.house === result.verdict.q.cusp ? 700 : 400);
    g.fillText(`${String(r.house).padStart(2, ' ')}  ${(hi ? RASHI_HI : RASHI_EN)[r.sign]} — ${(hi ? GRAHA_HI : GRAHA_EN)[r.sub]}`, x, ry);
  });
  y += 38 + rowH * 6;

  // Disclosures -- the transparency astrologers actually check.
  y += 28; g.strokeStyle = LINE;
  g.beginPath(); g.moveTo(PAD, y); g.lineTo(W - PAD, y); g.stroke();
  y += 36; g.font = font(21); g.fillStyle = MUTED;
  const lines = [
    `${hi ? 'समय' : 'Cast'}: ${result.askedAt.toLocaleString(hi ? 'hi-IN' : undefined)}`,
    `${hi ? 'स्थान' : 'Place'}: ${result.placeLabel}`,
    /* In number mode the lagna comes from the table, not the sky, so only the
       latitude reaches the chart -- say so next to the place we printed. */
    ...(result.mode === 'number'
      ? [hi ? 'भाव अक्षांश से बनते हैं; देशान्तर से नहीं'
            : 'latitude shapes the cusps; longitude does not']
      : []),
    `${hi ? 'अयनांश' : 'Ayanamsa'}: ${result.mode === 'number' ? 'KP-New' : 'Lahiri'} · ${hi ? 'मध्यम राहु/केतु' : 'mean Rahu/Ketu'}`,
    /* The house-system line used to be hard-coded English in BOTH branches, so a
       Hindi card carried the whole sentence "Equal (high-latitude fallback)" —
       strictly less localised than the screen it exports, which already glosses
       the same fact as समान भाव — उच्च अक्षांश विकल्प (bug bash F11). */
    `${hi ? 'भाव' : 'Houses'}: ${result.chart.system === 'placidus'
      ? (hi ? 'प्लेसिडस' : 'Placidus')
      : (hi ? 'समान भाव — उच्च अक्षांश विकल्प' : 'Equal houses — high-latitude fallback')}`,
    `${hi ? 'सन्दर्भ' : 'Source'}: K.S. Krishnamurti, KP Reader VI`,
  ];
  lines.forEach((t, i) => g.fillText(t, PAD, y + i * 32));

  g.font = font(26, 700); g.fillStyle = GOLD;
  g.fillText('Ganak · ganak.pages.dev', PAD, H - PAD);
  return cv;
}

// ------------------------------------------------------------ UI PIECES
function PrashnaSecHead({ hiMode }) {
  return (
    <div style={{ marginBottom: "0.625rem" }}>
      <div style={{ fontFamily: hiMode ? TOKENS.devanagari : 'inherit',
        fontSize: hiMode ? 20 : 11, letterSpacing: hiMode ? undefined : '0.14em',
        textTransform: hiMode ? undefined : 'uppercase', color: hiMode ? TOKENS.ink : TOKENS.muted,
        lineHeight: 1.2 }}>
        {hiMode ? 'प्रश्न कुण्डली' : 'Prashna'}
      </div>
    </div>
  );
}
function Gloss({ children }) {
  return <div style={{ fontSize: "var(--font-small)", color: TOKENS.muted, fontStyle: 'italic', lineHeight: 1.45 }}>{children}</div>;
}

const VERDICT_STYLE = {
  favourable:   { hi: 'अनुकूल',            en: 'Favourable',      color: TOKENS.gold,    soft: TOKENS.goldSoft },
  unfavourable: { hi: 'प्रतिकूल',           en: 'Not favourable',  color: TOKENS.sindoor, soft: TOKENS.sindoorSoft },
  mixed:        { hi: 'मिश्रित — प्रतीक्षा', en: 'Mixed — wait', color: TOKENS.amber,   soft: TOKENS.amberSoft },
};

/* Number-method verdict voice — owner-approved 2026-07-24 (plans/prashna-249-
   ksk-verify.md): warm and respectful, never over-promising an outcome. Badges
   "Favourable / Not yet / Mixed" are gentler than the time mode's labels. */
const NUM_VERDICT = {
  favourable:   { hi: 'हाँ — ग्रह-योग आपके अनुकूल है।',                en: 'Favourable — the chart stands behind what you asked.',   badge: { hi: 'अनुकूल', en: 'Favourable' }, color: TOKENS.gold,    soft: TOKENS.goldSoft },
  unfavourable: { hi: 'अभी अनुकूल नहीं — थोड़ा ठहरें।',                 en: 'Not the right moment — better to hold than to force it.', badge: { hi: 'अभी नहीं', en: 'Not yet' },  color: TOKENS.sindoor, soft: TOKENS.sindoorSoft },
  mixed:        { hi: 'मिश्रित — कुछ पक्ष अनुकूल, कुछ नहीं; धैर्य रखें।', en: 'Mixed — some support, some resistance; give it time.',   badge: { hi: 'मिश्रित', en: 'Mixed' },     color: TOKENS.amber,   soft: TOKENS.amberSoft },
};


const HOUSE_MEANING_HI = { 1:'आप स्वयं', 2:'धन और परिवार', 3:'साहस और प्रयास',
  4:'घर और सुख', 5:'संतान और सृजन', 6:'बाधा, रोग और ऋण',
  7:'साझेदारी और दूसरा पक्ष', 8:'रुकावट और विलम्ब', 9:'भाग्य और कृपा',
  10:'करियर और प्रतिष्ठा', 11:'लाभ और सिद्धि', 12:'हानि, व्यय और दूरी' };

/* Question-specific house glosses (Q1c).
   A house does not mean one fixed thing — its role depends on what was asked. The
   6th is "obstacles, illness & debt" for a health question, but for a job question
   it is service and employment, which is why it counts as a SUPPORTIVE signal there.
   Printing the generic label alongside "a supportive signal" reads as a bug to a lay
   user, even though the astrology is right.
   Only houses whose generic label actively contradicts their role here are listed;
   everything else falls through to HOUSE_MEANING. Sourced, not invented — see
   plans/prashna-house-glosses.md. Incomplete by design: the deny-side glosses and a
   few unsourced cells are deliberately left generic pending KSK verification. */
const HOUSE_MEANING_BY_Q = {
  career:     { 6:  { en: 'service & employment',               hi: 'सेवा और नौकरी' } },
  venture:    { 6:  { en: 'service & competition',              hi: 'सेवा और प्रतिस्पर्धा' } },
  money:      { 6:  { en: 'earnings from work',                 hi: 'कार्य से आय' } },
  litigation: { 6:  { en: 'your side & victory over opponents', hi: 'आपका पक्ष और विरोधी पर विजय' } },
  travel:     { 12: { en: 'foreign lands & new surroundings',   hi: 'विदेश और नया परिवेश' },
                4:  { en: 'home ties & staying put',            hi: 'घर का बंधन और यहीं रुकना' } },
};

/* Plain-language life areas, for the answer a normal user reads (owner review
   2026-07-22: "leave the house related details for astrologers ... give explanation
   in simpler language"). House numbers and significations are astrologer vocabulary —
   they now live only in the expanded chart. These phrases say the same thing as the
   house, in words someone can act on, and slot into "In your favour: ___". */
const HOUSE_PLAIN = { 1:'your own position', 2:'money and family', 3:'your own effort',
  4:'home and stability', 5:'children and creative work', 6:'work and daily duties',
  7:'the other person', 8:'delays and setbacks', 9:'fortune and support',
  10:'work and standing', 11:'hopes and gains', 12:'distance and expense' };
const HOUSE_PLAIN_HI = { 1:'आपकी अपनी स्थिति', 2:'धन और परिवार', 3:'आपका अपना प्रयास',
  4:'घर और स्थिरता', 5:'संतान और सृजन', 6:'कार्य और दिनचर्या',
  7:'दूसरा पक्ष', 8:'देरी और रुकावट', 9:'भाग्य और सहयोग',
  10:'कार्य और प्रतिष्ठा', 11:'आशाएँ और लाभ', 12:'दूरी और व्यय' };
/* Question-specific favour glosses — same corrections as HOUSE_MEANING_BY_Q. */
const HOUSE_PLAIN_BY_Q = {
  career:     { 6:  { en: 'your job and service',      hi: 'आपकी नौकरी और सेवा' } },
  venture:    { 6:  { en: 'your work and competition', hi: 'आपका काम और प्रतिस्पर्धा' } },
  money:      { 6:  { en: 'earnings from work',        hi: 'कार्य से आय' } },
  litigation: { 6:  { en: 'your side of the case',     hi: 'आपका पक्ष' } },
  travel:     { 12: { en: 'going abroad',              hi: 'विदेश जाना' },
                4:  { en: 'home ties',                 hi: 'घर का बंधन' } },
};

/* Deny-side plain phrases. Favour labels like "fortune and support" read as bugs when
   they appear under "Working against it" — mirror tier-2's "for this question … counts
   against" framing, but without house numbers. Generic entries cover any question; BY_Q
   entries match sourced travel/4 and career/9 overrides in plans/prashna-house-glosses.md. */
/* COMPLETED 2026-08-18 (bug bash F2). Six of the twelve houses were missing, and
   `plainDeny` fell through to the FAVOUR vocabulary for them — so tier 1 and
   tier 2 printed two different meanings for the same house in the same reading.
   A health question denied on the 6th told the reader that "work and daily
   duties" stood between them and recovery, three lines above the technical layer
   saying the 6th is the house of illness. Sweeping all 249 numbers × 12 topics
   showed the gaps were reachable on 4, 5, 6, 7, 8 and 12.

   NOTHING NEW IS CLAIMED HERE. Each added line takes the house's OWN plain-language
   area, already shipped in HOUSE_PLAIN, and states it in the tier-2 framing the
   deny side already uses ("for this question, this counts against") — exactly as
   the six original entries do. No house is given a signification it did not have.
   Question-specific overrides below are limited to the two the source map already
   carries. See plans/prashna-house-glosses.md. */
const HOUSE_PLAIN_DENY = {
  1:  { en: 'your own position is not strong enough', hi: 'आपकी अपनी स्थिति पर्याप्त मज़बूत नहीं' },
  2:  { en: 'family and savings are not helping',     hi: 'परिवार और बचत सहायक नहीं' },
  3:  { en: 'effort alone may not be enough',         hi: 'केवल प्रयास पर्याप्त नहीं' },
  4:  { en: 'home and settled life pull the other way', hi: 'घर और स्थिरता दूसरी ओर खींचते हैं' },
  5:  { en: 'children and creative work are not supporting this', hi: 'संतान और सृजन इसमें साथ नहीं दे रहे' },
  6:  { en: 'obstacles and daily demands stand in the way', hi: 'बाधाएँ और रोज़ की माँगें आड़े आ रही हैं' },
  7:  { en: 'the other person is not going along with it', hi: 'दूसरा पक्ष इसमें साथ नहीं दे रहा' },
  8:  { en: 'delays and setbacks weigh on it',        hi: 'देरी और रुकावटें इस पर भारी हैं' },
  9:  { en: 'fortune is not helping here',            hi: 'भाग्य यहाँ सहायक नहीं' },
  10: { en: 'career standing is a hurdle',            hi: 'करियर की प्रतिष्ठा बाधा बन रही है' },
  11: { en: 'hopes and gains are blocked',            hi: 'आशाएँ और लाभ रुकावट में हैं' },
  12: { en: 'distance and expense work against it',   hi: 'दूरी और व्यय इसके विरुद्ध जाते हैं' },
};
const HOUSE_PLAIN_DENY_BY_Q = {
  travel: {
    2:  { en: 'family ties and savings hold you back', hi: 'परिवार का बंधन और बचत पीछे खींचती है' },
    4:  { en: 'home ties keep you here',               hi: 'घर का बंधन यहीं रोकता है' },
    11: { en: 'hopes and plans for the move stall',    hi: 'यात्रा की आशाएँ और योजना अटकी हैं' },
  },
  career: {
    9:  { en: 'luck is not behind this career step',   hi: 'भाग्य इस करियर कदम के पीछे नहीं' },
  },
  /* Sourced in plans/prashna-house-glosses.md: for a HEALTH question the 6th is
     genuinely the house of disease (the doc says so explicitly and keeps the
     generic gloss for exactly that reason), and for a DISPUTE the 7th is the
     opposing party — the same "other party" the generic label already names,
     read for a court case. */
  health: {
    6:  { en: 'the illness itself still has the upper hand', hi: 'रोग स्वयं अभी भारी पड़ रहा है' },
  },
  litigation: {
    7:  { en: 'the opposing side has the stronger hand', hi: 'विरोधी पक्ष अभी अधिक मज़बूत है' },
  },
};

/* What the deciding planet brings to the matter, in plain words (owner review
   2026-07-22: "give a gist of the primary impact of the planet for the question
   asked"). These are the planets' standard natures — Saturn delays and rewards
   patience, Jupiter expands, Rahu brings sudden turns, Ketu detaches — phrased as
   an effect on the outcome rather than as a list of significations. Consistent with
   HORA_NATURE already shipping in the hora advisor. */
const PLANET_EFFECT = {
  /* No em-dashes inside these: the sentence frame already uses one, and two in a row
     read badly ("Rahu is the deciding influence here — it brings ... — the path ..."). */
  Su: { en: 'it brings authority and visibility, and matters here tend to move through whoever is in charge',
        hi: 'यह अधिकार और प्रत्यक्षता लाता है, और कार्य प्रायः बड़ों या अधिकारियों के माध्यम से बनता है' },
  Mo: { en: 'it brings movement and change, so things shift rather than stay settled',
        hi: 'यह गति और परिवर्तन लाता है, इसलिए स्थिति स्थिर रहने के बजाय बदलती है' },
  Ma: { en: 'it brings drive and urgency, and sometimes friction with others',
        hi: 'यह ऊर्जा और शीघ्रता लाता है, कभी-कभी दूसरों से टकराव भी' },
  Me: { en: 'it works through talking, paperwork and negotiation, which is quick but changeable',
        hi: 'यह बातचीत, कागज़ी कार्य और मोल-भाव से चलता है, जो शीघ्र पर परिवर्तनशील है' },
  Ju: { en: 'it tends to expand things and favours growth',
        hi: 'यह विस्तार देता है और वृद्धि के अनुकूल है' },
  Ve: { en: 'it brings ease, comfort and goodwill from others',
        hi: 'यह सहजता, सुख और दूसरों का सद्भाव लाता है' },
  Sa: { en: 'it works slowly, rewarding patience and steady effort rather than haste',
        hi: 'यह धीरे चलता है, और शीघ्रता के बजाय धैर्य तथा निरंतर प्रयास का फल देता है' },
  Ra: { en: 'it brings sudden or unconventional turns, so the path may not be the expected one',
        hi: 'यह आकस्मिक या अप्रचलित मोड़ लाता है, इसलिए मार्ग अपेक्षित न भी हो' },
  Ke: { en: 'it leans towards detachment and letting go rather than holding on',
        hi: 'यह पकड़ने के बजाय विरक्ति और छोड़ने की ओर झुकाता है' },
};

/* Tier 1: the answer, in everyday words. No house numbers, no sub-lords — that is
   what the expanded chart is for. The deciding planet IS named, because the owner
   asked for its gist, and a planet name is common vocabulary in a way that "the
   sub-lord of your 7th house" is not. */
function buildPlain(v, lang) {
  const hi = lang === 'hi';
  const byQFav = HOUSE_PLAIN_BY_Q[v.q.key] || {};
  const byQDeny = HOUSE_PLAIN_DENY_BY_Q[v.q.key] || {};
  const P = hi ? HOUSE_PLAIN_HI : HOUSE_PLAIN;
  const plainFav = (h) => (byQFav[h] ? (hi ? byQFav[h].hi : byQFav[h].en) : P[h]);
  const plainDeny = (h) => {
    if (byQDeny[h]) return hi ? byQDeny[h].hi : byQDeny[h].en;
    const d = HOUSE_PLAIN_DENY[h];
    if (d) return hi ? d.hi : d.en;
    /* HOUSE_PLAIN_DENY covers all twelve houses, so this is unreachable today.
       It must never again fall through to the FAVOUR phrase (bug bash F2): that
       printed "fortune and support" under "Working against it". If a house ever
       goes missing, wrap the neutral area in the deny framing instead of stating
       its opposite. */
    return hi ? `${P[h]} इसमें साथ नहीं दे रहा` : `${P[h]} is not supporting this`;
  };
  const uniq = (hs, plain) => [...new Set(hs.map(plain))];
  /* Separator is " · ", not "and": the phrases contain "and" themselves, so joining
     with a word produced "your own position and work and standing". The middot is
     already this app's list separator (hero, footer, tithi lines) and stays readable
     at a glance, which matters for the elder-friendly goal. */
  const join = (a) => a.join(' · ');
  const fav = uniq(v.hits.favor, plainFav), den = uniq(v.hits.deny, plainDeny);
  const lines = [];
  const eff = PLANET_EFFECT[v.cuspSub];
  if (eff) lines.push({ tone: 'lead',
    text: hi ? `यहाँ निर्णायक प्रभाव ${GRAHA_HI[v.cuspSub]} का है — ${eff.hi}।`
             : `${GRAHA_EN[v.cuspSub]} is the deciding influence here — ${eff.en}.` });
  if (fav.length) lines.push({ tone: 'good',
    text: hi ? `आपके पक्ष में: ${join(fav)}।` : `In your favour: ${join(fav)}.` });
  if (den.length) lines.push({ tone: 'bad',
    text: hi ? `विरुद्ध जाता है: ${join(den)}।` : `Working against it: ${join(den)}.` });
  if (!fav.length && !den.length) lines.push({ tone: 'neutral',
    text: hi ? 'इस समय कोई पक्ष स्पष्ट रूप से भारी नहीं दिखता।'
             : 'Nothing points strongly either way right now.' });
  if (v.retroDrag) lines.push({ tone: 'bad',
    text: hi ? 'देरी, दोहराव या दूसरे प्रयास की संभावना रखें।'
             : 'Expect delay, or having to try a second time.' });
  /* The Moon stands for the mind in this reading. Linked to the matter, the question
     is genuinely felt and the matter is live; unlinked, it is not yet ripe. The old
     wording ("the answer applies to now") tried to say that and meant nothing to a
     reader — owner review 2026-07-22. */
  lines.push({ tone: v.moonLinked ? 'good' : 'neutral',
    text: v.moonLinked
      ? (hi ? 'यह विषय सचमुच आपके मन पर है — संकेत है कि मामला अभी सक्रिय है।'
            : 'This is genuinely weighing on your mind — a sign the matter is live right now.')
      : (hi ? 'यह अभी आपके मन पर भारी नहीं है — मामला अभी कुछ दूर हो सकता है।'
            : "This isn't pressing on your mind yet — the matter may still be some way off.") });
  return lines;
}

function englishOrdinal(n) {
  const lastTwo = n % 100;
  if (lastTwo >= 11 && lastTwo <= 13) return `${n}th`;
  const suffix = { 1: 'st', 2: 'nd', 3: 'rd' }[n % 10] || 'th';
  return `${n}${suffix}`;
}

function buildReasons(v, lang) {
  const hi = lang === 'hi';
  const HM = hi ? HOUSE_MEANING_HI : HOUSE_MEANING;
  // Question-specific gloss where one exists, generic otherwise.
  const byQ = HOUSE_MEANING_BY_Q[v.q.key] || {};
  const gloss = (h) => (byQ[h] ? (hi ? byQ[h].hi : byQ[h].en) : HM[h]);
  const lines = [];
  lines.push({ tone: 'lead',
    text: hi
      ? `यहाँ निर्णायक मत ${GRAHA_HI[v.cuspSub]} का है — यह आपके ${v.q.cusp}वें भाव (${gloss(v.q.cusp)}) का उप-स्वामी है।`
      : `${GRAHA_EN[v.cuspSub]} holds the deciding vote here — it is the sub-lord of your ${englishOrdinal(v.q.cusp)} house, the house of ${gloss(v.q.cusp)}.` });
  for (const h of v.hits.favor)
    lines.push({ tone: 'good', text: hi
      ? `यह आपके ${h}वें भाव — ${gloss(h)} — से जुड़ता है, जो एक अनुकूल संकेत है।`
      : `It connects to your ${englishOrdinal(h)} house — ${gloss(h)} — a supportive signal.` });
  /* Deny lines lead with "for this question" on purpose. Written the other way round
     ("your 11th house — gains & fulfilment — which works against this matter") the
     reader takes the gloss as the REASON it counts against, and "gains works against
     you" reads as a bug — the mirror of the illness/supportive problem fixed in Q1c.
     A denying house is not bad in itself; it opposes THIS matter, because in KP the
     12th house from any house negates that house's event. Framing first, house
     second, removes the false implication without inventing a new signification. */
  for (const h of v.hits.deny)
    lines.push({ tone: 'bad', text: hi
      ? `इस प्रश्न में आपके ${h}वें भाव — ${gloss(h)} — का प्रभाव विपरीत जाता है।`
      : `For this question, your ${englishOrdinal(h)} house — ${gloss(h)} — counts against the outcome.` });
  if (v.retroDrag)
    lines.push({ tone: 'bad', text: hi
      ? `${GRAHA_HI[v.cuspSub]} वक्री है — आकाश में पीछे की ओर चलता प्रतीत होता है। विलम्ब, दोहराव या दूसरे प्रयास की संभावना रखें।`
      : `${GRAHA_EN[v.cuspSub]} is retrograde — moving backward in the sky. Expect delay, rework, or a second attempt.` });
  lines.push({ tone: v.moonLinked ? 'good' : 'neutral',
    text: v.moonLinked
      ? (hi ? 'चन्द्रमा — इस कुण्डली में आपका मन — इस विषय को छूता है। प्रश्न पका हुआ है; उत्तर अभी लागू होता है।'
            : 'The Moon — your mind in this chart — touches the matter. The question is ripe; the answer applies now.')
      : (hi ? 'चन्द्रमा अभी इस विषय को नहीं छूता — परिणाम आने में समय लग सकता है।'
            : 'The Moon does not yet touch this matter — events may take time to come to a head.') });
  return lines;
}

/* Devanagari and Arabic-Indic digits are digits (bug bash F15). JavaScript's `\d`
   matches ASCII 0-9 only and `Number('१३९')` is NaN, so a Hindi reader typing
   १३९ -- a number that IS 139 and IS in range -- was told "the tradition only
   takes a number from 1 to 249". The message described the wrong problem, in a
   Hindi-first app where the number is the entire input. Fold the numeral systems
   to ASCII before anything is validated. Only whole runs of one system fold;
   mixed or decorated input still falls through as invalid, which is the point of
   the punctuation rule below. */
const PR_DIGIT_BASES = [0x0966 /* Devanagari ० */, 0x0660 /* Arabic-Indic ٠ */,
                        0x06F0 /* Extended Arabic-Indic ۰ */, 0x0AE6 /* Gujarati ૦ */,
                        0x09E6 /* Bengali ০ */, 0x0C66 /* Telugu ౦ */, 0x0BE6 /* Tamil ௦ */];
function PR_toAsciiDigits(s) {
  let out = '';
  for (const ch of String(s)) {
    const cp = ch.codePointAt(0);
    const base = PR_DIGIT_BASES.find(b => cp >= b && cp <= b + 9);
    out += base === undefined ? ch : String(cp - base);
  }
  return out;
}
// F8: preserve invalid punctuation so it remains visibly invalid. Removing "." or
// "-" would silently turn 1.5→15 or -5→5 and cast a different number's chart.
function PR_normalizeNumberInput(raw) {
  const trimmed = PR_toAsciiDigits(String(raw).trim());
  if (trimmed === '') return '';
  if (!/^\d+$/.test(trimmed)) return trimmed;
  const normalized = trimmed.replace(/^0+(?=\d)/, '');
  if (normalized.length > 3) return trimmed;
  return normalized;
}

// F11: KP number starts are exact to an arcsecond, but a binary float can land a
// hair below an exact minute (15°39′59.999…). Stabilize number-mode display at the
// arcsecond before deriving degrees/minutes; time-mode formatting stays unchanged.
function PR_fmtNumberDeg(deg) {
  const arcSec = Math.round(deg * 3600);
  const wholeDeg = Math.floor(arcSec / 3600);
  const minute = Math.floor((arcSec - wholeDeg * 3600) / 60);
  return `${wholeDeg}°${String(minute).padStart(2, '0')}′`;
}

/* IANA timezone identifiers are FORMAT TOKENS, not words. `Asia/Kolkata` has to be
   typed exactly and has no Devanagari form — the same category as UTC, YYYY and MM,
   which validation/language-leak-scan.cjs already exempts. They are named here and
   interpolated so the Hindi sentences below stay Hindi rather than carrying an
   English word inside them; the reader sees the identical text either way. */
const PR_TZ_EG = 'Asia/Kolkata';
const PR_TZ_EG2 = 'Europe/London';

/* ---- The moment of judgement, resolved in the judging place's own zone ----

   Bug bash F4. KP horary is cast for the moment AND PLACE of judgement, and this
   screen offers exactly that override — but it read the typed `datetime-local`
   with `new Date(customWhen)`, which JavaScript parses in the RUNTIME's zone. A
   practitioner in London judging a question that arrived in Chennai typed 18:00
   meaning IST and got 18:00 BST: the cuspal sub-lord changed for 11 of the 12
   topics and five verdicts flipped. There was no field with which to express the
   judging place's local time, so the override was structurally unable to do the
   thing it is named for.

   `zone` is an IANA name and reaches this screen as a prop. `zoneOffset` resolves
   it for the typed wall clock (not for noon), which is what handles DST, historic
   offsets and half-hour zones correctly.

   Returns { ms, problem }. `problem` is a bilingual message, never null-and-wrong:

   F5 — a wall clock that DOES NOT EXIST (the spring-forward gap) used to be
        accepted and silently moved an hour, with the shifted time then printed
        back on the verdict card and carried into the share PNG. The birth path
        got a shared guard on 2026-08-18 that refuses such a date rather than
        moving it ("Ganak will not move it to the next day for you"); the Prashna
        judgment field never reached that helper. Detected by round-tripping the
        resolved instant back to a wall clock and comparing it with what was typed.
   F6 — the field had no `min`, no `max` and no range check at all, while the
        engine's ΔT is a hard-coded 72 seconds, correct only around the present
        decade. Year 9999 answered with full confidence. Same 1800–2150 range and
        the same vocabulary as the four screens fixed on 2026-08-18. */
function PR_resolveJudgmentMoment(raw, zone, hi) {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(String(raw || '').trim());
  if (!m) return { ms: NaN, problem: hi
    ? 'निर्णय का समय पूरा भरें — वर्ष, मास, दिन और समय।'
    : 'Enter the judgment moment in full — year, month, day and time.' };
  const [y, mo, d, hh, mi] = m.slice(1).map(Number);
  if (y < YEAR_MIN || y > YEAR_MAX) return { ms: NaN, problem: hi
    ? `निर्णय का समय ${y} में है। गणक ग्रह-स्थिति ${YEAR_MIN}–${YEAR_MAX} के लिए निकालता है; इससे बाहर उत्तर भरोसेमंद नहीं होगा, इसलिए गणना नहीं की गई।`
    : `The judgment moment is in ${y}. Ganak calculates planetary positions for ${YEAR_MIN}–${YEAR_MAX}; outside that range the answer would not be trustworthy, so nothing was calculated.` };
  const named = typeof zone === 'string' && zone.trim() !== '';
  const off = named ? zoneOffset(zone, y, mo, d, hh, mi) : null;
  /* A zone the app CANNOT resolve is refused, never quietly read on the device's
     clock. Silently falling back is F4 itself, one layer down: the Cast button is
     already disabled for an unrecognised name, but a resolver that answers anyway
     is a trap waiting for the next caller. No zone at all still falls back to the
     device — that is the shipped default and the caption says so. */
  if (named && off == null) return { ms: NaN, problem: hi
    ? `“${zone}” कोई पहचाना हुआ समयक्षेत्र नहीं है, इसलिए निर्णय का समय पढ़ा नहीं जा सका। ${PR_TZ_EG} जैसा नाम दें, या समयक्षेत्र खाली छोड़ दें।`
    : `“${zone}” is not a timezone Ganak recognises, so the judgment moment could not be read. Use a name like ${PR_TZ_EG}, or leave the timezone blank.` };
  const ms = off == null ? new Date(raw).getTime()
                         : Date.UTC(y, mo - 1, d, hh, mi) - off * 3600000;
  if (!Number.isFinite(ms)) return { ms: NaN, problem: hi
    ? 'निर्णय का समय समझ नहीं आया — कृपया पुनः चुनें।'
    : "Couldn't read that judgment time — please pick it again." };
  if (off != null) {
    /* Bug bash F5, properly this time. The first fix round-tripped the resolved
       instant through `zoneOffset` ITSELF — `new Date(ms + off * 3600000)` — which
       agrees with the offset that produced it by construction, so it could never
       disagree. Europe/London 2026-03-29 01:30 sailed through: `zoneOffset` returns
       the pre-transition offset 0, the round trip reads 01:30 back, and the guard
       said the clock existed. It does not: that instant is 02:30 BST, an hour later
       than what was typed, and the shifted time was then printed on the verdict card
       and baked into the share PNG. That is the same shape as the parity tautology
       the high-latitude lane found — a check comparing a thing with itself.
       So round-trip through the PLATFORM's IANA database instead, the same
       `Intl.DateTimeFormat` the rest of the app resolves zones with. An hour that a
       calendar skips reads back as a different clock and is refused; an hour a
       calendar REPEATS (autumn fall-back) reads back as the same clock and is
       accepted, which is right — it is ambiguous, not impossible. */
    const clock = `${String(hh).padStart(2, '0')}:${String(mi).padStart(2, '0')}`;
    let back = null;
    try {
      const p = new Intl.DateTimeFormat('en-CA', { timeZone: zone, year: 'numeric',
        month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false })
        .formatToParts(new Date(ms)).reduce((a, x) => (a[x.type] = x.value, a), {});
      back = `${p.year}-${p.month}-${p.day}T${p.hour === '24' ? '00' : p.hour}:${p.minute}`;
    } catch (e) { back = null; }   // no tz database for this name — handled below
    if (back === null) return { ms: NaN, problem: hi
      ? `“${zone}” कोई पहचाना हुआ समयक्षेत्र नहीं है, इसलिए निर्णय का समय पढ़ा नहीं जा सका। ${PR_TZ_EG} जैसा नाम दें, या समयक्षेत्र खाली छोड़ दें।`
      : `“${zone}” is not a timezone Ganak recognises, so the judgment moment could not be read. Use a name like ${PR_TZ_EG}, or leave the timezone blank.` };
    const typed = `${String(y).padStart(4, '0')}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}T${clock}`;
    if (back !== typed) return { ms: NaN, problem: hi
      ? `${zone} में उस दिन ${clock} का समय होता ही नहीं — घड़ियाँ आगे बढ़ा दी गई थीं। गणक इसे स्वयं आगे नहीं खिसकाएगा; कृपया निर्णय का समय ठीक करें।`
      : `${clock} did not exist that day in ${zone} — the clocks went forward. Ganak will not move it forward for you; please correct the judgment moment.` };
  }
  return { ms, problem: null };
}

/* Ruling Planets for the moment of judgement (bug bash F9) — the weekday lord is
   reckoned from SUNRISE, not from midnight, because that is what a vara is. Where
   the sun neither rises nor sets (polar day or polar night, which this screen can
   now reach honestly) `sunEvents` returns null and the civil weekday stands; the
   UI says so rather than pretending. */
function PR_judgmentVara(ms, zone, lat, lon) {
  const off = (zone && zoneOffset(zone, new Date(ms).getUTCFullYear(),
    new Date(ms).getUTCMonth() + 1, new Date(ms).getUTCDate())) ?? (-new Date(ms).getTimezoneOffset() / 60);
  const local = new Date(ms + off * 3600000);
  let dow = local.getUTCDay();
  let sunriseKnown = false;
  try {
    const ev = sunEvents(local.getUTCFullYear(), local.getUTCMonth() + 1, local.getUTCDate(), off, lat, lon);
    if (ev && ev.rise != null) {
      sunriseKnown = true;
      if (ms < ev.rise) dow = (dow + 6) % 7;   // before sunrise the previous vara still runs
    }
  } catch (e) { /* no sunrise available — civil weekday stands, and we say so */ }
  return { dayLord: WEEKDAY_LORDS[dow], dow, sunriseKnown };
}

const PR_ABBR_OF = Object.fromEntries(Object.entries(GRAHA_EN).map(([k, full]) => [full, k]));
const PR_VARA_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const PR_VARA_HI = ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'];

/* ------------------------------- RULING PLANETS (bug bash F9) ---------------

   THE DEFECT. `plans/prashna-249-ksk-verify.md` rule 4 was listed as a shipped,
   Tier-1 page-pinned ENGINE RULE — and the word "ruling" appeared nowhere in this
   screen. The one rule Krishnamurti ties explicitly to *"the moment of judgement"*
   was the one rule the horary screen never computed, on a page that asks working
   astrologers whether its reading is correct. An astrologer answering that
   question looks for the Ruling Planets first, because in KP they are the filter
   applied to exactly the two tables printed above.

   WHICH READING GANAK FOLLOWS, AND WHY. Sources genuinely differ on the size of
   the set, so the choice is stated rather than assumed:

     · **Ganak follows the five-fold Reader VI definition** — the lords of the
       DAY, the MOON's sign and star, and the LAGNA's sign and star. Reader VI
       Section V "Ruling planets", scan p.175 / printed folio p.167: *"the lords
       of the day, Moon sign, star and lagna at the moment of judgement"*; the
       five-planet derivation is worked at scan p.146. This is also the set the
       owner approved for this screen on 2026-07-24 (`prashna-249-ksk-verify.md`
       § "Collapsible full working", item 3: *"the RP set (day lord; asc. sign &
       star lord; Moon sign & star lord), shown as an independent confirmation"*).
     · **Much modern KP practice adds the SUB-lords of the lagna and the Moon.**
       That refinement is later than the passage above and is not in it. Ganak
       prints those two so a practitioner can see them, labelled as the modern
       extension, and does NOT count them in the ruling set. The disagreement is
       recorded in the citation index rather than silently resolved.

   Nothing here is a second implementation. `computeRulingPlanets` in
   src/engine/dasha.ts is the app's one Ruling-Planet rule (the Jyotish birth
   chart uses the same call), and it is fed this chart's OWN sidereal longitudes,
   so a number-mode reading gets its KP-New lagna and Moon rather than a Lahiri
   copy of them. validation/prashna-ruling-planets.cjs asserts that the lords it
   returns are the same lords PR_subOf/PR_SIGN_LORD print in the graha table on
   the same page — the F12 failure mode (two reckonings of one thing on one
   screen) applied to this panel. */
/* One micro-arcsecond, the degree equivalent of the frozen engine's PR_SUB_EPS.

   The 249 method pins the ascendant EXACTLY on a nakshatra/sub boundary by
   construction — number 158 is Scorpio 16°40′00″, which is 680/3 degrees, the
   first instant of Jyeshtha. In IEEE doubles 680/3 rounds a third of a
   quadrillionth of a degree BELOW the ideal boundary, so a bare
   `Math.floor(lon / (360/27))` returns the PREVIOUS nakshatra. That is the same
   rounding class PR_SUB_EPS and PR_NAK_ARCSEC exist to close inside the frozen
   engine, and every other consumer on this page — the number table, the Lagna
   chip, the graha row, the cuspal table — resolves such a boundary FORWARD.
   src/engine/dasha.ts (owned by another lane, read-only here) does not, so
   without this nudge the Ruling-Planet panel would print "ascendant sub-lord
   Jupiter, star Saturn" three inches under an answer card reading "Ascendant
   sub-lord Mercury · Jyeshtha", on 249-table numbers that land on a boundary.
   Nudging into the segment is a no-op everywhere else: a micro-arcsecond is
   eleven orders of magnitude smaller than the narrowest KP sub. */
const PR_BOUNDARY_NUDGE = 1e-6 / 3600;
function PR_rulingPlanets(chart, vara) {
  const moon = chart.planets.find(p => p.key === 'Mo');
  const rp = computeRulingPlanets(chart.cusps[1] + PR_BOUNDARY_NUDGE,
    moon.lon + PR_BOUNDARY_NUDGE, vara.dayLord);
  const ab = full => PR_ABBR_OF[full];
  /* Order follows the citation: day, Moon sign, Moon star, lagna sign, lagna star. */
  const members = [
    { key: 'dayLord',      planet: ab(rp.dayLord) },
    { key: 'moonSignLord', planet: ab(rp.moonSignLord) },
    { key: 'moonStarLord', planet: ab(rp.moonStarLord) },
    { key: 'ascSignLord',  planet: ab(rp.ascSignLord) },
    { key: 'ascStarLord',  planet: ab(rp.ascStarLord) },
  ];
  const count = {};
  members.forEach(m => { count[m.planet] = (count[m.planet] || 0) + 1; });
  const set = PR_GRAHA_ORDER.filter(k => count[k]);
  return {
    members, count, set,
    /* Shown, not counted — see the doctrine note above. De-duplicated, because the
       two sub-lords are frequently the same planet and "(Jupiter · Jupiter)" reads
       as a rendering bug rather than as a fact about the chart. */
    modern: PR_GRAHA_ORDER.filter(k => k === ab(rp.ascSubLord) || k === ab(rp.moonSubLord)),
    vara,
  };
}

/* Rule 4's second half — *"common planets between RPs and significators survive"*.
   The significators of the judged cusp are the grid's A∪B∪C∪D for that house, which
   is provably the same set the verdict scored (bug bash "clean" item 3). Splitting
   them by RP membership is the filter itself, so a practitioner can see which
   significator KP expects to fructify rather than being handed two tables and left
   to intersect them by eye. This CONFIRMS or QUALIFIES the verdict; it never
   overrides it — the verdict is the cuspal sub-lord's, and saying otherwise would
   be inventing a scoring rule KSK does not give. */
function PR_rpConfirmation(chart, cusp, rpSet) {
  const row = PR_significatorGrid(chart).find(r => r.house === cusp);
  const sig = row ? row.all : [];
  return { sig, confirmed: sig.filter(k => rpSet.includes(k)),
           unconfirmed: sig.filter(k => !rpSet.includes(k)) };
}

/* ONE composition of a cast reading, used by `ask()` and by the rendered-result
   baseline (validation/snapshot-results.cjs) alike. The Prashna result surface had
   never been in a snapshot — validation/snapshots/prashna.en.txt ends at "Ask now",
   because renderToStaticMarkup presses no buttons — so every defect the 2026-08-18
   bug bash found on the answer card was invisible to the gates. Seeding the baseline
   through THIS function rather than through a hand-built object is what makes the
   baseline a record of what a reader sees: if the composition changes, the baseline
   changes with it instead of quietly describing something the app no longer builds. */
function PR_buildResult({ ms, lat, lon, zone, placeLabel, mode, number, q }) {
  const chart = mode === 'number' ? PR_castNumber(ms, lat, lon, number) : PR_cast(ms, lat, lon);
  const verdict = PR_judge(chart, q);
  const vara = PR_judgmentVara(ms, zone, lat, lon);
  const ruling = PR_rulingPlanets(chart, vara);
  return {
    chart, verdict, askedAt: new Date(ms), mode, placeLabel, zone,
    ...(mode === 'number' ? { number, info: kpNumberInfo(number) } : {}),
    ruling, rpConfirm: PR_rpConfirmation(chart, verdict.q.cusp, ruling.set),
  };
}

// ------------------------------------------------------------ MAIN SCREEN
function PrashnaScreen({ lat = 28.6139, lon = 77.209, zone = null, placeLabel = 'New Delhi', lang = 'en' }) {
  // Guidance depth: Expert opens the astrologer-facing chart straight away, Guided adds a
  // plain-language orientation line. The verdict and every warning are identical at all
  // three depths — only how much supporting calculation is on screen changes.
  const { showPlainHelp, showExpert } = useDepth();
  const hi = lang === 'hi';
  const [mode, setMode] = useState('time'); // 'time' | 'number'
  const [selected, setSelected] = useState(null);
  const [numberInput, setNumberInput] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [showFull, setShowFull] = useState(showExpert);
  /* Chart-first is the astrologer's reading order: the chart and the cuspal
     tables lead, and the plain-language verdict collapses to a secondary line.
     Answer-first stays the default -- the lay devotee flow is unchanged. */
  const [chartFirst, setChartFirst] = useState(false);
  // F1/F4/F5: a cast number session is LOCKED independently of `result`, so nothing that
  // merely clears the result (chip change, mode toggle) can silently re-enable a recast.
  const [locked, setLocked] = useState(false);
  /* KP horary is cast for the moment and place of JUDGMENT. A moderator may be
     judging from a different city than the app's inherited place, or judging a
     question that arrived at a specific earlier moment. Default stays "here,
     now" so the lay flow is untouched; the override is opt-in. */
  const [useCustom, setUseCustom] = useState(false);
  const [customLat, setCustomLat] = useState(String(lat));
  const [customLon, setCustomLon] = useState(String(lon));
  const [customPlace, setCustomPlace] = useState(placeLabel);
  const [customWhen, setCustomWhen] = useState(''); // datetime-local, '' = now
  /* F4: the override set latitude, longitude and a name but no ZONE, so a typed
     judgment moment was read in the device's timezone. The app already knows the
     place's zone and round-trips it through the URL; it now reaches this screen
     as a prop, and a practitioner naming free coordinates can type one here. */
  const [customZone, setCustomZone] = useState(zone || '');

  /* `Number('')` and `Number('   ')` are 0, which is finite -- so a cleared
     coordinate field silently read as latitude 0 and passed the range check.
     Reject blank input before coercing so an empty field is invalid, not zero. */
  const numOr = (s, fallback) => {
    if (typeof s !== 'string' || s.trim() === '') return fallback;
    const n = Number(s);
    return Number.isFinite(n) ? n : fallback;
  };
  const castLat = useCustom ? numOr(customLat, lat) : lat;
  const castLon = useCustom ? numOr(customLon, lon) : lon;
  const castPlaceLabel = useCustom ? (customPlace.trim() || placeLabel) : placeLabel;
  const castZone = (useCustom ? (customZone.trim() || zone) : zone) || null;
  /* An unknown IANA name must not silently fall back to the device — that is the
     exact failure F4 reports. Say the zone is not recognised and refuse to cast. */
  const zoneValid = !castZone || zoneOffset(castZone, 2026, 1, 1) != null;
  const latValid = !useCustom || (numOr(customLat, NaN) >= -90 && numOr(customLat, NaN) <= 90);
  const lonValid = !useCustom || (numOr(customLon, NaN) >= -180 && numOr(customLon, NaN) <= 180);
  const placeValid = latValid && lonValid && zoneValid;
  // F9: the "New question" button appears in the exact tap target the "Cast" button
  // just vacated, so a phone double-tap on Cast would land its 2nd tap on New question
  // and wipe the just-cast answer. Record when the cast locked, and ignore a reset that
  // fires within a double-tap window of it (a deliberate later tap is unaffected).
  const lockedAtRef = useRef(0);
  const DOUBLE_TAP_MS = 600;

  const clearResult = () => { setResult(null); setError(null); };
  /* Bug bash F8. `switchMode` deliberately preserved a locked result, but the
     result block is gated on `result.mode === mode` and nothing stopped a
     TIME-mode cast from overwriting the locked NUMBER-mode result. The sequence
     cast 139 → "Ask from this moment" → "Ask now" → back to number mode left the
     screen locked, showing the read-only number and a "New question" button, with
     NO reading on it at all — and the number-mode answer unrecoverable.
     The method is part of the question, so while a reading is locked the toggle
     is refused outright rather than half-preserved. The state that produced the
     empty locked screen is now unreachable. */
  const switchMode = (m) => { if (m !== mode && !locked) { setMode(m); clearResult(); } };
  // Once a reading is cast, only "New question" reopens it.
  // Double-tap guard: swallow a reset landing within the double-tap window of the cast.
  const newQuestion = () => {
    if (Date.now() - lockedAtRef.current < DOUBLE_TAP_MS) return;
    setLocked(false); setNumberInput(''); setResult(null); setError(null);
  };
  // A cast answer is judged for one place — a place change clears it and reopens the
  // session (a new place is a genuinely changed circumstance).
  useEffect(() => { setResult(null); setError(null); setLocked(false); },
    [castLat, castLon, castPlaceLabel, castZone]);

  const ask = () => {
    setError(null);
    try {
      const q = QUESTIONS.find(x => x.key === selected) || QUESTIONS[QUESTIONS.length - 1];
      let ms = Date.now();
      if (useCustom && customWhen) {
        const r = PR_resolveJudgmentMoment(customWhen, castZone, hi);
        if (r.problem) { setError(r.problem); return; }
        ms = r.ms;
      }
      if (!Number.isFinite(ms)) {
        setError(hi ? 'निर्णय का समय समझ नहीं आया — कृपया पुनः चुनें।'
                    : "Couldn't read that judgment time — please pick it again.");
        return;
      }
      if (mode === 'number') {
        if (!/^\d+$/.test(numberInput)) {
          setError(hi
            ? `कृपया ${KP_NUMBER_MIN} से ${KP_NUMBER_MAX} के बीच एक पूर्ण अंक दें — परम्परा यही निर्धारित करती है।`
            : `Please enter a whole number between ${KP_NUMBER_MIN} and ${KP_NUMBER_MAX} — that is what the tradition prescribes.`);
          return;
        }
        const n = Number(numberInput);
        if (!Number.isInteger(n) || n < KP_NUMBER_MIN || n > KP_NUMBER_MAX) {
          setError(hi
            ? `कृपया ${KP_NUMBER_MIN} से ${KP_NUMBER_MAX} के बीच एक पूर्ण अंक दें — परम्परा यही निर्धारित करती है।`
            : `Please enter a whole number between ${KP_NUMBER_MIN} and ${KP_NUMBER_MAX} — that is what the tradition prescribes.`);
          return;
        }
        setResult(PR_buildResult({ ms, lat: castLat, lon: castLon, zone: castZone,
          placeLabel: castPlaceLabel, mode: 'number', number: n, q }));
      } else {
        setResult(PR_buildResult({ ms, lat: castLat, lon: castLon, zone: castZone,
          placeLabel: castPlaceLabel, mode: 'time', q }));
      }
      /* Bug bash F10. The lock used to guard the NUMBER mode only. Time mode --
         the default, the mode a first-time visitor lands in -- had none: "Ask
         now" stayed live and recast on a fresh Date.now(). A sweep over 600
         consecutive seconds at Delhi produced TWELVE distinct twelve-topic
         readings, so a querent who disliked "Not the right moment" needed only to
         wait two minutes and tap again. That is the same sincerity rule the number
         mode enforces out loud, unguarded in the mode most people use. One
         question at a time now means one question at a time in both methods. */
      setLocked(true);
      lockedAtRef.current = Date.now(); // start the double-tap guard window
      /* Bug bash F16. This was `setShowFull(chartFirst)`, and `chartFirst`
         defaults to false — so at Expert depth the chart opened on an EMPTY
         screen (useState(showExpert)) and closed the moment there was something
         to look at, forcing the practitioner to reopen "Full Prashna chart" after
         every single cast. */
      setShowFull(chartFirst || showExpert);
    } catch (e) {
      if (typeof console !== "undefined") console.error("prashna cast failed:", e);
      setError(hi ? "गणना नहीं हो सकी — कृपया पुनः प्रयास करें।" : "Couldn't complete the calculation — please try again.");
    }
  };

  const v = result && result.verdict;
  const isNum = result && result.mode === 'number';
  const vs = v && (isNum ? NUM_VERDICT[v.verdict] : VERDICT_STYLE[v.verdict]);
  /* `sessionLocked` is the whole reading — one question at a time, in BOTH
     methods (F10). `numberLocked` is only the read-only styling of the number
     field, which exists in one of them. */
  const sessionLocked = locked;
  const numberLocked = mode === 'number' && locked;
  const nTyped = numberInput === '' ? null : Number(numberInput);
  const numberIsValid = /^\d+$/.test(numberInput) && Number.isInteger(nTyped) &&
    nTyped >= KP_NUMBER_MIN && nTyped <= KP_NUMBER_MAX;
  /* F2/F8: live hint for every invalid value. The `mode === 'number'` guard is
     enforced here rather than at the call sites because the button's `disabled`
     expression consumes this flag OUTSIDE the number-mode JSX block -- without it,
     a leftover number left the time-mode button dead with no visible field to fix. */
  const numOutOfRange = mode === 'number' && numberInput !== '' && !numberIsValid;
  const canAsk = selected && placeValid && (mode === 'time' || numberIsValid);

  /* The Cast button was disabled with no explanation whenever no topic was
     chosen -- a valid number plus a dead button and no hint. Name the one thing
     that is missing, in priority order. The out-of-range case is deliberately
     absent: the inline warning under the number input already owns that message,
     and showing it twice in two wordings is worse than showing it once. */
  const blockReason = !selected
    ? (hi ? 'ऊपर से प्रश्न का विषय चुनें' : 'Choose what your question is about, above')
    /* Name the ONE thing that is missing. Folding an unrecognised timezone into the
       latitude/longitude message would point the reader at two fields that are fine
       and away from the one that is not. */
    : !zoneValid
      ? (hi ? `समयक्षेत्र पहचाना नहीं गया — ${PR_TZ_EG} जैसा नाम दें, या खाली छोड़ें`
            : `That timezone is not recognised — use a name like ${PR_TZ_EG}, or leave it blank`)
    : !placeValid
      ? (hi ? 'अक्षांश −90 से 90, देशान्तर −180 से 180 के बीच होना चाहिए'
            : 'Latitude must be −90 to 90 and longitude −180 to 180')
    : (mode === 'number' && numberInput === '')
      ? (hi ? `1 से ${KP_NUMBER_MAX} के बीच एक अंक दें` : `Enter a number from 1 to ${KP_NUMBER_MAX}`)
      : null;

  /* One copy of the verdict card, placed by `chartFirst`: leading for the lay
     devotee flow, tucked behind a disclosure for the astrologer flow. */
  const verdictCard = !v ? null : (
    <div style={{ background: TOKENS.card, borderRadius: TOKENS.radius,
      border: `0.0938rem solid ${vs.color}`, overflow: 'hidden' }}>
      <div style={{ background: vs.soft, padding: '14px 16px' }}>
        {isNum ? (
          <>
            <span style={{ display: 'inline-block', background: vs.color, color: TOKENS.card,
              fontSize: "var(--font-label)", fontWeight: 600, padding: '2px 10px', borderRadius: "1.25rem", marginBottom: "0.5rem" }}>
              {hi ? vs.badge.hi : vs.badge.en}
            </span>
            <div style={{ fontFamily: hi ? TOKENS.devanagari : 'inherit', fontSize: "var(--font-heading)", fontWeight: 600, color: TOKENS.ink, lineHeight: 1.3 }}>{hi ? vs.hi : vs.en}</div>
          </>
        ) : (
          <div style={{ fontFamily: hi ? TOKENS.devanagari : 'inherit', fontSize: "var(--font-display)", color: vs.color, lineHeight: 1.1 }}>{hi ? vs.hi : vs.en}</div>
        )}
        <div style={{ fontSize: "var(--font-small)", color: TOKENS.muted, marginTop: "0.375rem" }}>
          {hi ? v.q.hi : v.q.en}{isNum ? ` · ${hi ? 'अंक' : 'number'} ${result.number}` : ''}
        </div>
      </div>
      {isNum && <NumberSetBox info={result.info} favor={v.q.favor} deny={v.q.deny} cusp={v.q.cusp} hi={hi}
        cuspLabel={hi ? `${v.q.cusp}वें` : englishOrdinal(v.q.cusp)}
        cuspIsAscendant={v.q.cusp === 1} />}
      <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: "0.5rem" }}>
        {buildPlain(v, lang).map((r, i) => (
          <div key={i} style={{ fontSize: "var(--font-body)", lineHeight: 1.5,
            color: r.tone === 'good' ? TOKENS.ink : r.tone === 'bad' ? TOKENS.sindoor : TOKENS.ink,
            fontWeight: r.tone === 'lead' ? 600 : 400 }}>
            {r.text}
          </div>
        ))}
        <Gloss>
          {hi
            ? `${result.askedAt.toLocaleString('hi-IN')} को ${result.placeLabel} से पूछा गया। प्रश्न का निर्णय उसी क्षण और स्थान के लिए होता है, जब और जहाँ से आप पूछते हैं।`
            : `Cast for ${result.askedAt.toLocaleString()} at ${result.placeLabel}. Prashna is judged for the moment you ask, at the place you ask from.`}
        </Gloss>
        {/* The line above names a place; in number mode only its latitude reaches
            the chart, so the caveat must sit with it in the DEFAULT flow -- not
            nested in an override panel most users never open. */}
        {isNum && (
          <div style={{ fontSize: "var(--font-micro)", color: TOKENS.muted, fontStyle: 'italic' }}>
            {hi ? 'अंक विधि में आपका अंक ही लग्न तय करता है, इसलिए भावों का विभाजन केवल अक्षांश से बनता है — देशान्तर इस कुण्डली को नहीं बदलता।'
                : 'In the number method your number fixes the ascendant, so only latitude shapes the house cusps — longitude does not change this chart.'}
          </div>
        )}
        {isNum && (
          <div style={{ marginTop: "0.25rem", padding: '9px 11px', background: TOKENS.amberSoft,
            borderRadius: TOKENS.radius, border: `0.0625rem solid ${TOKENS.line}`, fontSize: "var(--font-label)", color: TOKENS.muted, lineHeight: 1.5 }}>
            {/* Bug bash F14. This line used to attribute THE WHOLE judgment to
                KSK. The citation index does not support that: the scoring
                weights (±2 primary, ±1 secondary, −1 retrograde, the ≥2/≤−2
                thresholds) and the twelve favour/deny house sets in QUESTIONS
                are Ganak's and appear in no citation row; rule 7 (whose place
                and time) is marked "by design, NOT KSK"; rule 8 (the rotational
                12th-from negation every "counts against" line rests on) is
                marked PARTIAL. The significator legend already sets the right
                precedent by disclosing its own departure in plain words. So does
                this now. See plans/prashna-249-ksk-verify.md. */}
            {hi
              ? 'यह कृष्णमूर्ति पद्धति अंक विधि है, इसके नए अयनांश पर — गणक की सामान्य लाहिरी परिपाटी से भिन्न। 1–249 का अंक→लग्न मानचित्र और उप-स्वामी से निर्णय की विधि के॰ एस॰ कृष्णमूर्ति के के॰पी॰ रीडर्स (मुख्यतः रीडर VI, होरारी ज्योतिष) से हैं। किस भाव को पक्ष/विपक्ष में गिना जाए और उन्हें कितना भार मिले — यह गणक का अपना निर्णय है, कृष्णमूर्ति का उद्धरण नहीं।'
              : 'This is the KP number method on the KP-New ayanamsa — distinct from Ganak’s usual Lahiri convention. The 1–249 number→ascendant map and the practice of judging through the cusp sub-lord come from K.S. Krishnamurti’s KP Readers (principally Reader VI, Horary Astrology). Which houses count for and against each question, and how heavily each is weighed, are Ganak’s own — not a quotation from Krishnamurti.'}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div style={{ background: TOKENS.bg, minHeight: '100%', padding: "1rem", color: TOKENS.ink,
      fontFamily: "var(--font-body-family)" }}>
      <PrashnaSecHead hiMode={hi} />

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
        <button onClick={() => { const next = !chartFirst; setChartFirst(next); setShowFull(next); }}
          aria-pressed={chartFirst}
          style={{ minHeight: 32, padding: '4px 10px', borderRadius: TOKENS.radius,
            border: `1.5px solid ${chartFirst ? TOKENS.gold : TOKENS.line}`,
            background: chartFirst ? TOKENS.goldSoft : TOKENS.card, color: TOKENS.ink,
            fontSize: "var(--font-micro)", cursor: 'pointer', fontFamily: hi ? TOKENS.devanagari : 'inherit' }}>
          {chartFirst ? (hi ? 'सामान्य दृश्य' : 'Plain view')
                      : (hi ? 'ज्योतिषी दृश्य' : 'Astrologer view')}
        </button>
      </div>

      {/* Method toggle — two named methods, never mixed (owner-approved).
          Follows the language switch (single language), each with a short description. */}
      <div style={{ display: 'flex', gap: "0.5rem", marginBottom: "0.75rem" }}>
        {[
          { key: 'time',
            hi: 'इस क्षण से पूछें',       en: 'Ask from this moment',
            descHi: 'पारम्परिक होरारी — पूछने के ठीक क्षण और स्थान से, कोई अंक नहीं।',
            descEn: 'Classic horary — casts for the exact moment & place you ask, no number.' },
          { key: 'number',
            hi: 'कृष्णमूर्ति पद्धति अंक विधि (1–249)', en: 'KP number method (1–249)',
            descHi: 'आप 1–249 के बीच एक अंक चुनते हैं, जो कुण्डली का लग्न तय करता है।',
            descEn: 'You choose a number from 1 to 249, which sets the chart’s ascendant.' },
        ].map(m => {
          const on = mode === m.key;
          return (
            /* F8: while a reading is locked the method cannot change. Disabled
               visibly and told why, rather than half-changing into a locked
               screen with no reading on it. */
            <button key={m.key} onClick={() => switchMode(m.key)}
              disabled={sessionLocked && !on} aria-disabled={sessionLocked && !on}
              style={{ flex: 1, minHeight: TOKENS.ctrlH, padding: '8px 10px', borderRadius: TOKENS.radius, textAlign: 'left',
                border: `0.0938rem solid ${on ? TOKENS.gold : TOKENS.line}`,
                background: on ? TOKENS.goldSoft : TOKENS.card,
                color: (sessionLocked && !on) ? TOKENS.muted : TOKENS.ink,
                cursor: (sessionLocked && !on) ? 'default' : 'pointer', lineHeight: 1.3 }}>
              <div style={{ fontFamily: hi ? TOKENS.devanagari : 'inherit', fontSize: "var(--font-body)", fontWeight: 600 }}>{hi ? m.hi : m.en}</div>
              <div style={{ fontSize: "var(--font-label)", color: TOKENS.muted, marginTop: "0.1875rem", lineHeight: 1.35 }}>{hi ? m.descHi : m.descEn}</div>
            </button>
          );
        })}
      </div>
      {sessionLocked && (
        <div role="status" style={{ marginTop: "-0.5rem", marginBottom: "0.75rem",
          fontSize: "var(--font-label)", color: TOKENS.muted,
          fontFamily: hi ? TOKENS.devanagari : 'inherit' }}>
          {hi ? 'यह प्रश्न पूछा जा चुका है — विधि बदलने के लिए नीचे "नया प्रश्न" दबाएँ।'
              : 'This question has been asked — tap “New question” below to change the method.'}
        </div>
      )}

      <Gloss>
        {mode === 'number'
          ? (hi
            ? 'एक सच्चे प्रश्न पर ध्यान रखें और 1 से 249 के बीच जो पहला अंक मन में आए वही दें। वही अंक इस क्षण की कुण्डली का लग्न तय करता है — आकाश वास्तविक रहता है, केवल भाव आपके अंक से बनते हैं।'
            : 'Hold one sincere question and give the first number between 1 and 249 that comes to you. That number fixes the ascendant of this moment’s chart — the sky stays real, only the houses are framed by your number.')
          : (hi
            ? 'अभी प्रश्न पूछें — इसी क्षण का आकाश उत्तर देता है। यह प्रश्न कुण्डली (होरारी ज्योतिष) है: जन्म विवरण की आवश्यकता नहीं, केवल पूछने का क्षण और स्थान।'
            : 'Ask a question now — the sky at this very moment answers it. This is Prashna (horary astrology): no birth details needed, only the moment and place of asking.')}
      </Gloss>

      {/* Moment & place of judgment. Collapsed by default -- the lay flow reads
          "here, now" and never opens this. KP practitioners need it because the
          horary chart belongs to the judgment, not to the app's inherited city. */}
      {/* F1/F4/F5: a cast number session is locked until "New question". These
          inputs are guarded like the question chips so editing the judgment
          moment or place cannot wipe a locked result while leaving it locked. */}
      <div style={{ border: `1.5px solid ${TOKENS.line}`, borderRadius: TOKENS.radius,
        background: TOKENS.card, padding: '8px 10px', marginBottom: 4 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
          <input type="checkbox" checked={useCustom}
            onChange={e => { if (sessionLocked) return; setUseCustom(e.target.checked); clearResult(); }} />
          <span style={{ fontSize: "var(--font-small)", fontFamily: hi ? TOKENS.devanagari : 'inherit' }}>
            {hi ? 'निर्णय का समय और स्थान स्वयं चुनें' : 'Set the judgment moment & place myself'}
          </span>
        </label>
        <div style={{ fontSize: "var(--font-micro)", color: TOKENS.muted, marginTop: 3,
          fontFamily: hi ? TOKENS.devanagari : 'inherit' }}>
          {useCustom
            ? (hi ? 'कुण्डली इसी क्षण और स्थान के लिए बनेगी।' : 'The chart will be cast for exactly this moment and place.')
            : (hi ? `अभी: ${placeLabel} · इसी क्षण` : `Now: ${placeLabel} · this moment`)}
        </div>
        {useCustom && (
          <div style={{ display: 'grid', gap: 6, marginTop: 8 }}>
            <input value={customPlace} onChange={e => { if (sessionLocked) return; setCustomPlace(e.target.value); clearResult(); }}
              aria-label={hi ? 'स्थान का नाम' : 'Place name'}
              placeholder={hi ? 'स्थान का नाम' : 'Place name'}
              style={{ height: TOKENS.ctrlH, borderRadius: TOKENS.radius, boxSizing: 'border-box',
                border: `1.5px solid ${TOKENS.line}`, background: TOKENS.bg, color: TOKENS.ink,
                fontSize: "var(--font-body)", padding: '0 10px' }} />
            <div style={{ display: 'flex', gap: 6 }}>
              <input inputMode="decimal" value={customLat}
                onChange={e => { if (sessionLocked) return; setCustomLat(e.target.value); clearResult(); }}
                aria-label={hi ? 'अक्षांश' : 'Latitude'} placeholder={hi ? 'अक्षांश' : 'Latitude'}
                style={{ flex: 1, minWidth: 0, height: TOKENS.ctrlH, borderRadius: TOKENS.radius,
                  boxSizing: 'border-box', background: TOKENS.bg, color: TOKENS.ink, fontSize: "var(--font-body)",
                  padding: '0 10px', border: `1.5px solid ${latValid ? TOKENS.line : TOKENS.sindoor}` }} />
              <input inputMode="decimal" value={customLon}
                onChange={e => { if (sessionLocked) return; setCustomLon(e.target.value); clearResult(); }}
                aria-label={hi ? 'देशान्तर' : 'Longitude'} placeholder={hi ? 'देशान्तर' : 'Longitude'}
                style={{ flex: 1, minWidth: 0, height: TOKENS.ctrlH, borderRadius: TOKENS.radius,
                  boxSizing: 'border-box', background: TOKENS.bg, color: TOKENS.ink, fontSize: "var(--font-body)",
                  padding: '0 10px', border: `1.5px solid ${lonValid ? TOKENS.line : TOKENS.sindoor}` }} />
            </div>
            {/* Also rendered with every number-mode result (see the result block).
                It belongs in BOTH places: there, because the default flow never
                opens this panel; here, because someone typing into the Longitude
                field above deserves to be told it will not move their chart
                before they spend time on it. */}
            {mode === 'number' && (
              <div style={{ fontSize: "var(--font-micro)", color: TOKENS.muted, fontStyle: 'italic' }}>
                {hi ? 'अंक विधि में आपका अंक ही लग्न तय करता है, इसलिए भावों का विभाजन केवल अक्षांश से बनता है — देशान्तर इस कुण्डली को नहीं बदलता।'
                    : 'In the number method your number fixes the ascendant, so only latitude shapes the house cusps — longitude does not change this chart.'}
              </div>
            )}
            <input type="datetime-local" value={customWhen}
              onChange={e => { if (sessionLocked) return; setCustomWhen(e.target.value); clearResult(); }}
              aria-label={hi ? 'निर्णय का समय' : 'Judgment time'}
              style={{ height: TOKENS.ctrlH, borderRadius: TOKENS.radius, boxSizing: 'border-box',
                border: `1.5px solid ${TOKENS.line}`, background: TOKENS.bg, color: TOKENS.ink,
                fontSize: "var(--font-body)", padding: '0 10px' }} />
            {/* Bug bash F4, remaining half. `PR_resolveJudgmentMoment` resolves the
                typed wall clock against a named zone — and until now there was no
                field in which to NAME one, so the override was still structurally
                unable to express the judging place's local time whenever the app had
                not handed the screen a zone. A practitioner in London judging a
                question that arrived in Chennai typed 18:00 meaning IST and got
                18:00 BST: measured over the twelve topics at Chennai, that changes
                the cuspal sub-lord for 12 of 12 and flips 7 of 12 verdicts.
                An unrecognised name is refused rather than silently falling back. */}
            <input value={customZone}
              onChange={e => { if (sessionLocked) return; setCustomZone(e.target.value); clearResult(); }}
              aria-label={hi ? 'निर्णय स्थान का समयक्षेत्र' : 'Judgment place timezone'}
              placeholder={hi ? `समयक्षेत्र, जैसे ${PR_TZ_EG}` : `Timezone, e.g. ${PR_TZ_EG}`}
              style={{ height: TOKENS.ctrlH, borderRadius: TOKENS.radius, boxSizing: 'border-box',
                background: TOKENS.bg, color: TOKENS.ink, fontSize: "var(--font-body)",
                padding: '0 10px', border: `1.5px solid ${zoneValid ? TOKENS.line : TOKENS.sindoor}` }} />
            {!zoneValid && (
              <div style={{ fontSize: "var(--font-micro)", color: TOKENS.sindoor }}>
                {hi ? `“${customZone.trim()}” कोई पहचाना हुआ समयक्षेत्र नहीं है। ${PR_TZ_EG} या ${PR_TZ_EG2} जैसा नाम दें, या खाली छोड़ दें।`
                    : `“${customZone.trim()}” is not a timezone Ganak recognises. Use a name like ${PR_TZ_EG} or ${PR_TZ_EG2}, or leave it blank.`}
              </div>
            )}
            <div style={{ fontSize: "var(--font-micro)", color: TOKENS.muted, fontStyle: 'italic' }}>
              {/* Say which zone the typed clock is actually read in. The caption used
                  to claim the device's zone unconditionally, which stopped being true
                  the moment the screen learned to honour a named one. */}
              {castZone && zoneValid
                ? (hi ? `समय खाली छोड़ें तो अभी का क्षण लिया जाएगा। लिखा हुआ समय ${castZone} की घड़ी के अनुसार पढ़ा जाता है।`
                      : `Leave the time blank to use this moment. The time you type is read on ${castZone} clocks.`)
                : (hi ? 'समय खाली छोड़ें तो अभी का क्षण लिया जाएगा। समयक्षेत्र बताए बिना समय आपके उपकरण के समयक्षेत्र में पढ़ा जाता है — किसी दूसरे नगर के लिए निर्णय कर रहे हों तो उसका समयक्षेत्र ऊपर लिखें।'
                      : 'Leave the time blank to use this moment. With no timezone named, the time is read in your device’s timezone — if you are judging for another city, name its timezone above.')}
            </div>
          </div>
        )}
      </div>

      {showPlainHelp && (
        <Card as="aside" density="compact" tone="raised" elevated={false} style={{ margin: '0 0 0.75rem' }}>
          {hi
            ? 'बस इतना करना है: नीचे से अपना प्रश्न चुनें और उत्तर पढ़ें। उत्तर सरल भाषा में सबसे ऊपर आता है — कुण्डली देखना आवश्यक नहीं है।'
            : 'All you need to do is choose your question below and read the answer. The answer comes first, in plain words — you do not have to read the chart.'}
        </Card>
      )}
      <DataRow density="compact" label={hi ? "चुनी हुई विधि" : "Selected method"} value={mode === "number" ? (hi ? "अंक 1–249" : "Number 1–249") : (hi ? "इस क्षण से" : "Current moment")} />

      {/* Question chips */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: "0.5rem", margin: '14px 0' }}>
        {QUESTIONS.map(q => {
          const on = selected === q.key;
          return (
            <button key={q.key} onClick={() => { if (sessionLocked) return; setSelected(q.key); clearResult(); }}
              style={{ minHeight: TOKENS.ctrlH, width: '100%', borderRadius: TOKENS.radius, padding: '6px 12px',
                border: `0.0938rem solid ${on ? TOKENS.gold : TOKENS.line}`,
                background: on ? TOKENS.goldSoft : TOKENS.card,
                color: TOKENS.ink, cursor: 'pointer', textAlign: 'left', lineHeight: 1.2 }}>
              <div style={{ fontFamily: hi ? TOKENS.devanagari : 'inherit', fontSize: "var(--font-body)", fontWeight: 600 }}>
                {hi ? q.hi : q.en}
              </div>
              <div style={{ fontFamily: hi ? TOKENS.devanagari : 'inherit',
                fontSize: "var(--font-micro)", color: TOKENS.muted, marginTop: "0.125rem" }}>
                {hi ? q.subHi : q.subEn}
              </div>
            </button>
          );
        })}
      </div>

      {/* Number entry — only in KP number mode */}
      {mode === 'number' && (
        <div style={{ marginBottom: "0.625rem" }}>
          <input inputMode="numeric" value={numberInput} readOnly={numberLocked}
            onChange={e => { setNumberInput(PR_normalizeNumberInput(e.target.value)); clearResult(); }}
            placeholder={hi ? '1 से 249 के बीच अंक' : 'a number from 1 to 249'}
            aria-label={hi ? 'कृष्णमूर्ति पद्धति अंक (1 से 249)' : 'KP number (1 to 249)'}
            style={{ height: TOKENS.ctrlH, borderRadius: TOKENS.radius, width: '100%', boxSizing: 'border-box',
              border: `0.0938rem solid ${numOutOfRange ? TOKENS.sindoor : TOKENS.line}`,
              background: numberLocked ? TOKENS.goldSoft : TOKENS.card, color: TOKENS.ink,
              fontSize: "var(--font-heading)", textAlign: 'center', letterSpacing: '0.05em' }} />
          {numOutOfRange && !numberLocked && (
            <div id="pr-num-range" style={{ marginTop: "0.25rem", fontSize: "var(--font-label)", color: TOKENS.sindoor }}>
              {hi ? `परम्परा 1 से ${KP_NUMBER_MAX} तक का अंक ही स्वीकारती है।` : `The tradition only takes a number from 1 to ${KP_NUMBER_MAX}.`}
            </div>
          )}
          {sessionLocked ? (
            <Gloss>
              {hi ? 'यही प्रश्न, यही अंक। नए उत्तर के लिए नीचे "नया प्रश्न" दबाएँ।'
                  : 'Same question, same number. Tap “New question” below to ask again.'}
            </Gloss>
          ) : (
            <Gloss>
              {hi ? 'यह शुभ-अंक नहीं है — पहला सच्चा अंक ही मान्य है, उसे बदलें नहीं। एक समय एक ही प्रश्न।'
                  : 'This is not a lucky number — the first sincere number is the one; don’t change it. One question at a time.'}
            </Gloss>
          )}
        </div>
      )}

      {sessionLocked ? (
        <>
          <button onClick={newQuestion}
            style={{ height: TOKENS.ctrlH, borderRadius: TOKENS.radius, width: '100%',
              border: `0.0938rem solid ${TOKENS.gold}`, background: TOKENS.card, color: TOKENS.ink,
              fontSize: "var(--font-body)", fontWeight: 600, cursor: 'pointer' }}>
            {hi ? 'नया प्रश्न' : 'New question'}
          </button>
          {/* Time mode had no lock at all and no copy about one (F10). Now it has
              both, in the same words the number method already used out loud. */}
          {mode === 'time' && (
            <Gloss>
              {hi ? 'यह उत्तर इसी क्षण के लिए है — एक समय एक ही प्रश्न। दूसरा उत्तर पाने के लिए "नया प्रश्न" दबाएँ।'
                  : 'This answer belongs to the moment you asked — one question at a time. Tap “New question” to ask a fresh one.'}
            </Gloss>
          )}
        </>
      ) : (
        <>
          <button onClick={ask} disabled={!canAsk || numOutOfRange}
            /* The button must always say WHY it is disabled. `blockReason` covers the
               missing-prerequisite cases; the out-of-range case is owned by the inline
               warning beside the number field, so point at that instead of repeating it. */
            aria-describedby={blockReason ? 'pr-cast-block' : numOutOfRange ? 'pr-num-range' : undefined}
            style={{ height: TOKENS.ctrlH, borderRadius: TOKENS.radius, width: '100%',
              border: 'none', background: (canAsk && !numOutOfRange) ? TOKENS.ink : TOKENS.line,
              color: (canAsk && !numOutOfRange) ? TOKENS.bg : TOKENS.muted, fontSize: "var(--font-body)", fontWeight: 600,
              cursor: (canAsk && !numOutOfRange) ? 'pointer' : 'default' }}>
            {mode === 'number' ? (hi ? 'उत्तर देखें' : 'Cast the answer') : (hi ? 'अभी पूछें' : 'Ask now')}
          </button>
          {blockReason && (
            <div id="pr-cast-block" role="status" style={{ marginTop: "0.375rem", fontSize: "var(--font-label)",
              color: TOKENS.muted, textAlign: 'center',
              fontFamily: hi ? TOKENS.devanagari : 'inherit' }}>
              {blockReason}
            </div>
          )}
        </>
      )}

      {error && (
        <div style={{ marginTop: "0.875rem", padding: "0.75rem", borderRadius: TOKENS.radius,
          background: TOKENS.sindoorSoft, border: `0.0938rem solid ${TOKENS.sindoor}`,
          color: TOKENS.sindoor, fontSize: "var(--font-body)" }}>{error}</div>
      )}

      {result && !error && result.mode === mode && (
        <div style={{ marginTop: "1rem" }}>
          {/* Verdict card — answer before data (or, in chart-first mode, tucked
              behind a disclosure so the chart and tables lead instead). */}
          {/* Demote the plain-language verdict only when the chart is actually
              leading. With the chart hidden there is nothing to lead with, so
              collapsing the verdict too would leave the screen showing neither
              an answer nor a chart. */}
          {chartFirst && showFull ? (
            <details style={{ border: `0.0938rem solid ${TOKENS.line}`,
              borderRadius: TOKENS.radius, background: TOKENS.card, padding: '8px 10px' }}>
              <summary style={{ cursor: 'pointer', fontSize: "var(--font-small)", color: TOKENS.muted,
                fontFamily: hi ? TOKENS.devanagari : 'inherit' }}>
                {hi ? 'सरल भाषा में उत्तर' : 'Plain-language reading'}
              </summary>
              <div style={{ marginTop: "0.625rem" }}>{verdictCard}</div>
            </details>
          ) : verdictCard}

          {/* Collapsible full chart — the Lagna/Nakshatra/Sub-lord chips live INSIDE
              this, not above it. They are expert evidence ("Krittika-3" is not
              actionable for a lay user), so they belong with the chart on tier 2
              rather than between the verdict and the way out. Owner-approved
              2026-07-22 (Q1a). */}
          <button onClick={() => setShowFull(s => !s)}
            style={{ marginTop: "0.75rem", height: TOKENS.ctrlH, borderRadius: TOKENS.radius, width: '100%',
              border: `0.0938rem solid ${TOKENS.line}`, background: TOKENS.card, color: TOKENS.ink,
              fontSize: "var(--font-body)", cursor: 'pointer' }}>
            {showFull ? (hi ? 'विवरण छिपाएँ' : 'Hide details') : (hi ? 'विस्तृत प्रश्न कुण्डली' : 'Full Prashna chart')}
          </button>

          {/* Shareable card: what a moderator drops into the group. Self-contained
              PNG so it needs no chart-reading UI to travel -- the disclosures an
              astrologer checks (ayanamsa, node type, house system, cast moment
              and place) travel with the image itself. */}
          <button onClick={async () => {
            try {
              const cv = PR_shareCardCanvas(result, hi);
              const blob = await new Promise(res => cv.toBlob(res, 'image/png'));
              const file = new File([blob], 'ganak-prashna.png', { type: 'image/png' });
              if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({ files: [file] });
              } else {
                // Desktop and older browsers: download instead of share.
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url; a.download = 'ganak-prashna.png'; a.click();
                URL.revokeObjectURL(url);
              }
            } catch (e) {
              if (typeof console !== 'undefined') console.error('share card failed:', e);
            }
          }}
            style={{ marginTop: 8, height: TOKENS.ctrlH, borderRadius: TOKENS.radius, width: '100%',
              border: `1.5px solid ${TOKENS.gold}`, background: TOKENS.card, color: TOKENS.ink,
              fontSize: "var(--font-body)", cursor: 'pointer', fontFamily: hi ? TOKENS.devanagari : 'inherit' }}>
            {hi ? 'कुण्डली कार्ड साझा करें' : 'Share chart card'}
          </button>

          {showFull && (
            <div style={{ marginTop: "0.625rem", background: TOKENS.card, borderRadius: TOKENS.radius,
              border: `0.0938rem solid ${TOKENS.line}`, padding: "0.75rem" }}>
              {/* Astrologer's reasoning: house numbers, significations, sub-lord.
                  Tier 2 by design — tier 1 says the same thing in plain words. */}
              <div style={{ marginBottom: "0.75rem" }}>
                <div style={{ fontSize: "var(--font-label)", letterSpacing: '0.12em', textTransform: 'uppercase',
                  color: TOKENS.muted, marginBottom: "0.375rem" }}>
                  {hi ? 'निर्णय कैसे हुआ' : 'How this was judged'}
                </div>
                {buildReasons(v, lang).map((r, i) => (
                  <div key={i} style={{ fontSize: "var(--font-small)", lineHeight: 1.5, marginBottom: "0.25rem",
                    color: r.tone === 'bad' ? TOKENS.sindoor : TOKENS.ink,
                    fontWeight: r.tone === 'lead' ? 600 : 400 }}>
                    {r.text}
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: "0.5rem", marginBottom: "0.75rem", flexWrap: 'wrap' }}>
                <PrashnaChip label={hi ? 'लग्न' : 'Lagna'} value={`${hi ? RASHI_HI[result.chart.lagna.sign] : RASHI_EN[result.chart.lagna.sign]} ${isNum ? PR_fmtNumberDeg(result.chart.lagna.deg) : fmtDeg(result.chart.lagna.deg)}`}
                  gloss={hi ? 'इस क्षण पूर्व में उदित राशि' : 'the sign rising in the east at this moment'} />
                <PrashnaChip label={hi ? 'नक्षत्र' : 'Nakshatra'} value={`${hi ? panchangTermAt("hi", "nakshatra", result.chart.lagna.nak.idx) : result.chart.lagna.nak.en}-${result.chart.lagna.nak.pada}`}
                  gloss={hi ? 'उदित अंश जिस चन्द्र-नक्षत्र में पड़ता है' : 'the lunar mansion the rising degree falls in'} />
                <PrashnaChip
                  label={hi ? `${v.q.cusp}वें भाव उप-स्वामी` : `${englishOrdinal(v.q.cusp)} cusp sub-lord`}
                  value={hi ? GRAHA_HI[v.cuspSub] : GRAHA_EN[v.cuspSub]}
                  gloss={hi
                    ? 'जिस भाव पर प्रश्न है उसका सूक्ष्म स्वामी — कृष्णमूर्ति पद्धति में यही निर्णायक मत देता है'
                    : 'sub-lord of the house your question is about — in KP this is what casts the deciding vote'} />
              </div>
              {/* F10: the 5-column chart is intrinsically wider than a 320px phone, so it
                  scrolls inside its own container instead of pushing the whole page wide. */}
              <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <table style={{ width: '100%', minWidth: "18.75rem", borderCollapse: 'collapse', fontSize: "var(--font-small)" }}>
                <thead>
                  <tr style={{ color: TOKENS.muted, textAlign: 'left' }}>
                    <th style={{ padding: '4px 2px' }}>{hi ? 'ग्रह' : 'Graha'}</th><th>{hi ? 'राशि' : 'Rashi'}</th>
                    <th>{hi ? 'नक्षत्र' : 'Nakshatra'}</th><th>{hi ? 'तारा/उप' : 'Star/Sub'}</th><th>{hi ? 'भाव' : 'House'}</th>
                  </tr>
                </thead>
                <tbody>
                  {result.chart.planets.map(p => (
                    <tr key={p.key} style={{ borderTop: `0.0625rem solid ${TOKENS.line}` }}>
                      <td style={{ padding: '5px 2px' }}>
                        {hi
                          ? <span style={{ fontFamily: TOKENS.devanagari }}>{GRAHA_HI[p.key]}</span>
                          : <span>{GRAHA_EN[p.key]}</span>}
                        {p.retro && p.key !== 'Ra' && p.key !== 'Ke' &&
                          <span style={{ color: TOKENS.sindoor, fontSize: "var(--font-label)" }}> Rx</span>}
                      </td>
                      <td>{hi ? RASHI_HI[p.sign] : RASHI_EN[p.sign]} {fmtDeg(p.deg)}</td>
                      <td>{hi ? panchangTermAt("hi", "nakshatra", p.nak.idx) : p.nak.en}-{p.nak.pada}</td>
                      {/* KP writes star/sub as two-letter abbreviations; in Devanagari the
                          graha names are already short, so Hindi gets the name itself
                          rather than a transliterated stub (B10, 2026-08-18). */}
                      <td>{hi ? `${GRAHA_HI[p.star]}/${GRAHA_HI[p.sub]}` : `${p.star}/${p.sub}`}</td>
                      <td>{p.house}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
              <div style={{ marginTop: "0.5rem", fontSize: "var(--font-label)", color: TOKENS.muted }}>
                {hi ? "Rx = वक्री, आकाश में पीछे चलता प्रतीत होता है" : "Rx = retrograde, appears to move backward in the sky"}
              </div>
              <div style={{ marginTop: "0.5rem" }}>
                <Gloss>
                  {hi
                    ? `तारा/उप = नक्षत्र स्वामी / कृष्णमूर्ति पद्धति का उप-स्वामी — प्रश्न इसी दो-स्तरीय स्वामित्व को पढ़ता है। भाव = ग्रह का भाव (${result.chart.system === 'placidus' ? 'प्लेसिडस भाव — कृष्णमूर्ति पद्धति का मानक' : 'समान भाव — ध्रुव वृत्त के ऊपर प्लेसिडस सम्भव नहीं; ज्योतिष कुंडली वहाँ पोर्फ़री लेती है'})। स्थितियाँ: ${isNum ? 'कृष्णमूर्ति पद्धति का नया अयनांश (अंक विधि)' : 'लाहिरी अयनांश — द्रिक पंचांग की मानक परिपाटी'}, मध्यम राहु/केतु।`
                    : `Star/Sub = nakshatra lord / KP sub-lord — the two-level rulership Prashna reads. House = the house the planet occupies (${result.chart.system === 'placidus' ? 'Placidus cusps, the KP standard' : 'equal houses — above the polar circle Placidus does not exist; the Jyotish chart screen falls back to Porphyry there'}). Positions: ${isNum ? 'KP-New ayanamsa (KP number method)' : 'Lahiri ayanamsa — the same conventions as Drik Panchang defaults'}, mean Rahu/Ketu.`}
                </Gloss>
              </div>
              <CuspalTable chart={result.chart} hi={hi} judgedCusp={v.q.cusp} mode={result.mode} />
              <SignificatorGrid chart={result.chart} hi={hi} />
              {/* F9: the rule KSK ties to "the moment of judgement", finally on the
                  page — and placed directly under the significator grid it filters. */}
              <RulingPlanetsPanel ruling={result.ruling} confirm={result.rpConfirm}
                cusp={v.q.cusp} hi={hi} />

              {/* Practitioner review request. This view shipped WITHOUT a practising
                  astrologer having checked the cuspal sub-lords or the significator grid —
                  the owner shipped deliberately to gather that review from real users. Saying
                  so on the page is the honest form of that decision, and it is the only way
                  the correctness question actually gets answered.

                  Placed here, directly under the two tables in question, and opened by
                  default: an astrologer will not think to open a collapsed "Send feedback"
                  link at the foot of the page to report that our maths is wrong. Ask, and
                  they answer. Reuses the site-wide feedback path — same endpoint, same
                  honeypot, same no-PII rule — so it adds no new way for data to leave. */}
              <div style={{ marginTop: T.s4 }}>
                <FeedbackCard
                  lang={hi ? 'hi' : 'en'}
                  C={{ gold: TOKENS.gold, muted: TOKENS.muted, line: TOKENS.line, ivory: TOKENS.ink, sindoor: TOKENS.sindoor }}
                  card={{ background: TOKENS.card, border: `0.0938rem solid ${TOKENS.gold}`, borderRadius: TOKENS.radius }}
                  defaultOpen
                  label={hi ? '⚖️ ज्योतिषियों से — क्या यह गणना सही है?' : '⚖️ Astrologers — is this reading correct?'}
                  prompt={hi
                    ? 'यह अभ्यासी-दृष्टि नई है और अभी किसी ज्योतिषी द्वारा जाँची नहीं गई। यदि आप के॰पी॰ पद्धति जानते हैं: क्या ऊपर के भाव उप-स्वामी और भाव-कारक सही हैं? जो ग़लत लगे, कृपया भाव-संख्या सहित बताएँ — हम उसी आधार पर सुधार करेंगे।'
                    : 'This practitioner view is new and has not yet been checked by a working astrologer. If you read KP: are the cuspal sub-lords and significators above correct? Name the house number and what you expected — that is what we will correct against.'}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* Both tables are intrinsically wider than a 320px phone, so each scrolls inside
   its own container rather than widening the page (same rule as the graha table). */
const PR_SCROLLER = { overflowX: 'auto', WebkitOverflowScrolling: 'touch' };
const PR_TH = { padding: '4px 6px', textAlign: 'left', whiteSpace: 'nowrap' };
const PR_TD = { padding: '5px 6px', whiteSpace: 'nowrap' };

function CuspalTable({ chart, hi, judgedCusp, mode }) {
  const rows = PR_cuspalTable(chart);
  /* Cusp 1 is special in number mode: it is not a computed real, it IS the 249
     table's exact degree, and fmtDeg's rounding shows 31/249 of those one
     arcminute low. Row 1 therefore formats like the Lagna chip; cusps 2-12 are
     ordinary reals where fmtDeg is the right renderer. */
  const degOf = r => (mode === 'number' && r.house === 1)
    ? PR_fmtNumberDeg(r.deg) : fmtDeg(r.deg);
  return (
    <div style={{ marginTop: 14 }}>
      <div style={{ fontSize: "var(--font-label)", letterSpacing: '0.12em', textTransform: 'uppercase',
        color: TOKENS.muted, marginBottom: 6 }}>
        {hi ? 'बारहों भावों के उप-स्वामी' : 'All twelve cuspal sub-lords'}
      </div>
      <div style={PR_SCROLLER}>
        <table style={{ width: '100%', minWidth: 320, borderCollapse: 'collapse', fontSize: "var(--font-micro)" }}>
          <thead>
            <tr style={{ color: TOKENS.muted }}>
              <th style={PR_TH}>{hi ? 'भाव' : 'Cusp'}</th>
              <th style={PR_TH}>{hi ? 'राशि' : 'Sign'}</th>
              <th style={PR_TH}>{hi ? 'नक्षत्र' : 'Nakshatra'}</th>
              <th style={PR_TH}>{hi ? 'तारा' : 'Star'}</th>
              <th style={PR_TH}>{hi ? 'उप' : 'Sub'}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => {
              const on = r.house === judgedCusp;
              return (
                <tr key={r.house} style={{ borderTop: `1px solid ${TOKENS.line}`,
                  background: on ? TOKENS.goldSoft : 'transparent' }}>
                  <td style={{ ...PR_TD, fontWeight: on ? 700 : 400 }}>{r.house}</td>
                  <td style={PR_TD}>{(hi ? RASHI_HI : RASHI_EN)[r.sign]} {degOf(r)}</td>
                  <td style={PR_TD}>{(hi ? panchangTermAt("hi", "nakshatra", r.nak.idx) : r.nak.en)}-{r.nak.pada}</td>
                  <td style={PR_TD}>{(hi ? GRAHA_HI : GRAHA_EN)[r.star]}</td>
                  <td style={{ ...PR_TD, fontWeight: on ? 700 : 400 }}>
                    {(hi ? GRAHA_HI : GRAHA_EN)[r.sub]}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <Gloss>
        {hi ? `हाइलाइट की गई पंक्ति वह भाव है जिस पर यह प्रश्न विचारा गया (${judgedCusp})। उसी का उप-स्वामी निर्णय देता है।`
            : `The highlighted row is the cusp this question was judged on (${judgedCusp}). Its sub-lord is what decides.`}
      </Gloss>
    </div>
  );
}

/* Ruling Planets — bug bash F9. The doctrine choice, its source and the departure
   from modern practice are argued at PR_rulingPlanets; this component only prints
   them. Every claim on screen is one the panel can back: the five members and where
   each comes from, the set, the honest note when a repetition happens, and the
   intersection with the judged cusp's significators. Deliberately NOT claimed: any
   change to the verdict. In KP the Ruling Planets confirm and time a significator;
   the yes/no stays the cuspal sub-lord's, and Ganak's scoring does not consult them.
   Saying otherwise would be inventing a rule the Readers do not give. */
const RP_LABELS = {
  dayLord:      { en: 'Day lord (vara)',      hi: 'वार का स्वामी' },
  moonSignLord: { en: 'Moon sign lord',       hi: 'चन्द्र राशि का स्वामी' },
  moonStarLord: { en: 'Moon star lord',       hi: 'चन्द्र नक्षत्र का स्वामी' },
  ascSignLord:  { en: 'Ascendant sign lord',  hi: 'लग्न राशि का स्वामी' },
  ascStarLord:  { en: 'Ascendant star lord',  hi: 'लग्न नक्षत्र का स्वामी' },
  ascSubLord:   { en: 'Ascendant sub-lord',   hi: 'लग्न का उप-स्वामी' },
  moonSubLord:  { en: 'Moon sub-lord',        hi: 'चन्द्र का उप-स्वामी' },
};
function RulingPlanetsPanel({ ruling, confirm, cusp, hi }) {
  if (!ruling) return null;
  const nm = k => (hi ? GRAHA_HI : GRAHA_EN)[k];
  const list = ks => (ks.length ? ks.map(nm).join(' · ') : (hi ? 'कोई नहीं' : 'none'));
  const repeated = ruling.set.filter(k => ruling.count[k] > 1);
  const cuspOrd = hi ? `${cusp}वें` : englishOrdinal(cusp);
  return (
    <div style={{ marginTop: 14 }}>
      <div style={{ fontSize: "var(--font-label)", letterSpacing: '0.12em', textTransform: 'uppercase',
        color: TOKENS.muted, marginBottom: 6 }}>
        {hi ? 'शासक ग्रह' : 'Ruling Planets'}
      </div>
      <div style={PR_SCROLLER}>
        <table style={{ width: '100%', minWidth: "17.5rem", borderCollapse: 'collapse', fontSize: "var(--font-micro)" }}>
          <tbody>
            {ruling.members.map(m => (
              <tr key={m.key} style={{ borderTop: `0.0625rem solid ${TOKENS.line}` }}>
                <td style={{ ...PR_TD, color: TOKENS.muted }}>{hi ? RP_LABELS[m.key].hi : RP_LABELS[m.key].en}</td>
                <td style={{ ...PR_TD, fontWeight: 600 }}>{nm(m.planet)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: "0.5rem", fontSize: "var(--font-small)", lineHeight: 1.5 }}>
        {hi ? `शासक ग्रह: ${list(ruling.set)} — ${PR_VARA_HI[ruling.vara.dow]} के लिए।`
            : `Ruling Planets: ${list(ruling.set)} — for ${PR_VARA_EN[ruling.vara.dow]}.`}
      </div>
      {repeated.length > 0 && (
        <div style={{ fontSize: "var(--font-small)", lineHeight: 1.5, marginTop: "0.125rem" }}>
          {/* Count, and only count. The Jyotish screen's RP summary explains its
              winner by a number it did not rank on (bug bash F13); this panel
              ranks nothing, so the one number it prints is the one it means. */}
          {hi ? `${list(repeated)} ${repeated.length > 1 ? 'इनमें एक से अधिक बार आते हैं' : 'इनमें एक से अधिक बार आता है'} — के॰पी॰ में दोहराया गया शासक ग्रह अधिक प्रबल साक्षी माना जाता है।`
              : `${list(repeated)} ${repeated.length > 1 ? 'each appear' : 'appears'} more than once above — in KP a repeated ruling planet is read as the stronger witness.`}
        </div>
      )}
      <div style={{ marginTop: "0.375rem", fontSize: "var(--font-small)", lineHeight: 1.5 }}>
        {hi ? `${cuspOrd} भाव के कारकों में से शासक ग्रह भी हैं: ${list(confirm.confirmed)}। बिना शासक-समर्थन के: ${list(confirm.unconfirmed)}।`
            : `Significators of the ${cuspOrd} cusp that are also Ruling Planets: ${list(confirm.confirmed)}. Without ruling support: ${list(confirm.unconfirmed)}.`}
      </div>
      <Gloss>
        {hi ? `शासक ग्रह = निर्णय के क्षण के वार, चन्द्र-राशि, चन्द्र-नक्षत्र, लग्न-राशि और लग्न-नक्षत्र के स्वामी (कृष्णमूर्ति, रीडर VI, खण्ड V)। के॰पी॰ में जो कारक शासक ग्रहों में भी आता है, वही फल देता हुआ माना जाता है — यह उत्तर की पुष्टि करता है, उसे बदलता नहीं; हाँ/नहीं का निर्णय भाव के उप-स्वामी का ही रहता है। आधुनिक के॰पी॰ अभ्यास प्रायः लग्न और चन्द्र के उप-स्वामी (${list(ruling.modern)}) भी जोड़ता है; गणक उन्हें दिखाता है, गिनता नहीं।`
            : `Ruling Planets = the lords of the day, the Moon's sign and star, and the ascendant's sign and star, at the moment of judgement (Krishnamurti, KP Reader VI, Section V). In KP the significator that is also a Ruling Planet is the one expected to fructify — this confirms the answer, it does not change it; the yes/no stays with the cusp sub-lord. Much modern KP practice also adds the sub-lords of the ascendant and the Moon (${list(ruling.modern)}); Ganak shows them and does not count them.`}
      </Gloss>
      {!ruling.vara.sunriseKnown && (
        <Gloss>
          {hi ? 'इस स्थान पर उस दिन सूर्योदय नहीं मिला (ध्रुवीय दिन या रात), इसलिए वार कैलेंडर के दिन से लिया गया है — सूर्योदय से नहीं।'
              : 'No sunrise was found for this place that day (polar day or polar night), so the vara is taken from the calendar day rather than from sunrise.'}
        </Gloss>
      )}
    </div>
  );
}

function SignificatorGrid({ chart, hi }) {
  const rows = PR_significatorGrid(chart);
  const nm = k => (hi ? GRAHA_HI : GRAHA_EN)[k];
  const cell = list => list.length ? list.map(nm).join(', ') : '—';
  return (
    <div style={{ marginTop: 14 }}>
      <div style={{ fontSize: "var(--font-label)", letterSpacing: '0.12em', textTransform: 'uppercase',
        color: TOKENS.muted, marginBottom: 6 }}>
        {hi ? 'भाव-कारक सारणी' : 'Significators'}
      </div>
      <div style={PR_SCROLLER}>
        <table style={{ width: '100%', minWidth: 340, borderCollapse: 'collapse', fontSize: "var(--font-micro)" }}>
          <thead>
            <tr style={{ color: TOKENS.muted }}>
              <th style={PR_TH}>{hi ? 'भाव' : 'H'}</th>
              <th style={PR_TH}>A</th><th style={PR_TH}>B</th>
              <th style={PR_TH}>C</th><th style={PR_TH}>D</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.house} style={{ borderTop: `1px solid ${TOKENS.line}` }}>
                <td style={{ ...PR_TD, fontWeight: 600 }}>{r.house}</td>
                <td style={PR_TD}>{cell(r.A)}</td>
                <td style={PR_TD}>{cell(r.B)}</td>
                <td style={PR_TD}>{cell(r.C)}</td>
                <td style={PR_TD}>{cell(r.D)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Gloss>
        {/* The engine scores A and C alike (±2) and B and D alike (±1). The legend
            used to claim the classical A > B > C > D ranking, which would send a
            moderator hand-scoring the verdict to a different number than the app. */}
        {hi ? 'A = भाव में स्थित ग्रह के नक्षत्र में बैठे ग्रह · B = भाव में स्थित ग्रह · C = भावेश के नक्षत्र में बैठे ग्रह · D = भावेश। गणक का निर्णय A और C को B तथा D से अधिक भार देता है, न कि परम्परागत A > B > C > D क्रम से — सारणी समूह दिखाती है, क्रम नहीं।'
            : "A = planets in the star of an occupant · B = occupants · C = planets in the star of the house owner · D = the owner. Ganak's verdict weights A and C above B and D, rather than the classical A > B > C > D — the grid shows the groups, not a ranking."}
      </Gloss>
    </div>
  );
}

function PrashnaChip({ label, value, gloss }) {
  return (
    <div style={{ background: TOKENS.card, border: `0.0938rem solid ${TOKENS.line}`,
      borderRadius: TOKENS.radius, padding: '8px 12px', minWidth: "7.5rem" }}>
      <div style={{ fontSize: "var(--font-label)", letterSpacing: '0.1em', textTransform: 'uppercase', color: TOKENS.muted }}>{label}</div>
      <div style={{ fontSize: "var(--font-body)", marginTop: "0.125rem" }}>{value}</div>
      <div style={{ fontSize: "var(--font-label)", color: TOKENS.muted, fontStyle: 'italic', marginTop: "0.125rem" }}>{gloss}</div>
    </div>
  );
}

function NumRow({ label, value, gloss }) {
  return (
    <div style={{ padding: '3px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: "0.625rem" }}>
        <span style={{ fontSize: "var(--font-small)", color: TOKENS.muted }}>{label}</span>
        <span style={{ fontSize: "var(--font-small)", textAlign: 'right' }}>{value}</span>
      </div>
      {gloss && <div style={{ fontSize: "var(--font-label)", color: TOKENS.muted, fontStyle: 'italic' }}>{gloss}</div>}
    </div>
  );
}

/* "What your number set" — the owner-approved answer-card detail box. Every
   jargon term carries a plain-language gloss (plans/prashna-249-ksk-verify.md). */
function NumberSetBox({ info, favor, deny, cusp, hi, cuspLabel, cuspIsAscendant }) {
  const signName = hi ? RASHI_HI[info.sign] : RASHI_EN[info.sign];
  const nak = hi ? panchangTermAt("hi", "nakshatra", info.nakshatra) : NAK_EN[info.nakshatra];
  const star = hi ? panchangTerm("hi", "planet", info.starLord) : info.starLord;
  const sub = hi ? panchangTerm("hi", "planet", info.subLord) : info.subLord;
  return (
    <div style={{ margin: '0 16px', padding: '10px 12px', background: TOKENS.bg,
      borderRadius: TOKENS.radius, border: `0.0625rem solid ${TOKENS.line}` }}>
      <div style={{ fontSize: "var(--font-label)", letterSpacing: '0.1em', textTransform: 'uppercase', color: TOKENS.muted, marginBottom: "0.25rem" }}>
        {hi ? 'आपके अंक ने क्या तय किया' : 'What your number set'}
      </div>
      <NumRow label={hi ? 'राशि' : 'Sign'} value={signName} />
      <NumRow label={hi ? 'नक्षत्र' : 'Star'} value={`${nak} · ${star}`}
        gloss={hi ? 'जिस नक्षत्र में अंक गिरा' : 'the star your number fell into'} />
      {/* On the "Other question" topic the judged cusp IS cusp 1, so pointing the
          reader at "the 1st cusp sub-lord" sends them to this very planet and reads
          as a contradiction against the chip beside it. Say they are the same. */}
      <NumRow label={hi ? 'लग्न उप-स्वामी' : 'Ascendant sub-lord'} value={sub}
        gloss={cuspIsAscendant
          ? (hi
            ? 'आपका प्रश्न लग्न पर ही विचारा गया है, इसलिए हाँ/नहीं का निर्णय भी यही ग्रह देता है'
            : 'your question is judged on the ascendant itself, so this same planet also carries the yes/no')
          : (hi
            ? `प्रश्न सच्चा है या नहीं, यह इससे देखा जाता है। हाँ/नहीं का निर्णय ${cuspLabel} भाव के उप-स्वामी से होता है।`
            : `shows whether the question is genuine and ripens at all — the yes/no itself is read from the ${cuspLabel} cusp sub-lord`)} />
      <NumRow label={hi ? 'लग्न' : 'Ascendant'} value={`${signName} ${PR_fmtNumberDeg(info.signDeg)}`}
        gloss={hi ? 'जहाँ अंक ने कुण्डली स्थिर की' : 'where the number fixed your chart'} />
      {/* Bug bash F1. This box used to print ONE row, "Houses judged", carrying
          `q.favor` alone — so a Health question showed "1 · 5 · 11" two lines
          under "the yes/no itself is read from the 6th cusp sub-lord" and three
          lines above "your 6th house counts against the outcome". A practitioner
          auditing the card read that as: houses 6 and 12 were not judged. They
          were: PR_judge scores q.favor AND q.deny, and for four topics the judged
          cusp itself is not in q.favor at all. Show all three scoring inputs,
          each on its own labelled row, so the card agrees with its own reasoning. */}
      <div style={{ borderTop: `0.0625rem solid ${TOKENS.line}`, marginTop: "0.25rem", paddingTop: "0.1875rem" }}>
        <NumRow label={hi ? 'निर्णय जिस भाव पर' : 'Judged on'} value={hi ? `${cusp}वाँ भाव` : `house ${cusp}`}
          gloss={hi ? 'इसी भाव के उप-स्वामी से हाँ/नहीं तय होता है' : 'the yes/no is taken from this house’s sub-lord'} />
        <NumRow label={hi ? 'पक्ष में गिने भाव' : 'Counted in favour'} value={favor.join(' · ')} />
        <NumRow label={hi ? 'विरुद्ध गिने भाव' : 'Counted against'} value={deny.length ? deny.join(' · ') : (hi ? 'कोई नहीं' : 'none')} />
      </div>
    </div>
  );
}

export default PrashnaScreen;
// Named exports for the validation gates (parity + number-mode chart). The
// parity gate slices only the marked engine region, so these do not affect it.
export { PR_cast, PR_castNumber, PR_judge, QUESTIONS, PR_kpNewAyan, PR_cuspalTable, PR_significatorGrid,
  PR_buildResult, PR_rulingPlanets, PR_rpConfirmation, PR_judgmentVara, PR_resolveJudgmentMoment };
