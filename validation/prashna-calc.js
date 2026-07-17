// ============================================================================
// prashna-calc.js — Standalone Prashna (horary) engine for Janma Kundli
// Validated in Node against Drik Panchang anchors for 2026-07-10 (New Delhi).
//
// Provides: sidereal positions (Su Mo Ma Me Ju Ve Sa Ra Ke), Lahiri ayanamsa,
// ascendant + MC, Placidus cusps, KP 249 sub-lord table, nakshatra/pada,
// retrograde flags, and a KP-style verdict engine per question category.
//
// Accuracy notes (documented, not silent):
//   Sun/Moon: arcsecond–arcminute class (Meeus truncated series)
//   Me/Ve/Ma: ~1–3 arcmin (Kepler elements, light-time corrected)
//   Ju/Sa:    up to ~10 arcmin (unperturbed Kepler; fine for sign/nakshatra,
//             rare sub-lord boundary flips possible — flagged for beta QA)
//   Rahu/Ketu: mean node (Drik default) to <1 arcmin; true node optional
// No external deps. No network. Runs identically in browser after splice.
// ============================================================================

'use strict';
const D2R = Math.PI / 180, R2D = 180 / Math.PI;
const norm360 = d => ((d % 360) + 360) % 360;
const sinD = d => Math.sin(d * D2R), cosD = d => Math.cos(d * D2R), tanD = d => Math.tan(d * D2R);

// ---------------------------------------------------------------- [1] TIME
const DELTA_T_SEC = 72; // ~2026; fine at our tolerance
function toJD_UT(y, mo, d, hUT) {
  if (mo <= 2) { y -= 1; mo += 12; }
  const A = Math.floor(y / 100), B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (mo + 1)) + d + B - 1524.5 + hUT / 24;
}
// ms since epoch (UTC) -> {jdUT, jdTT, T (TT centuries), Tut}
function timeFromMs(ms) {
  const dt = new Date(ms);
  const jdUT = toJD_UT(dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate(),
    dt.getUTCHours() + dt.getUTCMinutes() / 60 + dt.getUTCSeconds() / 3600 + dt.getUTCMilliseconds() / 3.6e6);
  const jdTT = jdUT + DELTA_T_SEC / 86400;
  return { jdUT, jdTT, T: (jdTT - 2451545.0) / 36525, Tut: (jdUT - 2451545.0) / 36525 };
}

// -------------------------------------------------- [2] NUTATION / OBLIQUITY
function nutationLon(T) { // Δψ in degrees (two main terms)
  const Om = 125.04452 - 1934.136261 * T;
  const Ls = 280.4665 + 36000.7698 * T;
  return (-17.20 * sinD(Om) - 1.32 * sinD(2 * Ls)) / 3600;
}
function meanObliquity(T) { return 23.43929111 - 0.0130041667 * T - 1.638e-7 * T * T; }

// ----------------------------------------------------------- [3] SUN (Meeus 25)
function sunTropical(T) { // apparent geocentric longitude, deg
  const L0 = norm360(280.46646 + 36000.76983 * T + 0.0003032 * T * T);
  const M = norm360(357.52911 + 35999.05029 * T - 0.0001537 * T * T);
  const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * sinD(M)
          + (0.019993 - 0.000101 * T) * sinD(2 * M) + 0.000289 * sinD(3 * M);
  const Om = 125.04 - 1934.136 * T;
  return norm360(L0 + C - 0.00569 - 0.00478 * sinD(Om)); // aberration + nutation
}

// ---------------------------------------------------------- [4] MOON (Meeus 47)
// terms: [D, M, Mp, F, coeff(1e-6 deg)]
const MOON_LON_TERMS = [
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
[0,2,1,0,-323],[1,1,-1,0,299],[2,0,3,0,294]
];
function moonTropical(T) { // apparent geocentric longitude, deg
  const Lp = norm360(218.3164477 + 481267.88123421 * T - 0.0015786 * T * T + T*T*T/538841 - T*T*T*T/65194000);
  const D  = norm360(297.8501921 + 445267.1114034 * T - 0.0018819 * T * T + T*T*T/545868 - T*T*T*T/113065000);
  const M  = norm360(357.5291092 + 35999.0502909 * T - 0.0001536 * T * T + T*T*T/24490000);
  const Mp = norm360(134.9633964 + 477198.8675055 * T + 0.0087414 * T * T + T*T*T/69699 - T*T*T*T/14712000);
  const F  = norm360(93.2720950 + 483202.0175233 * T - 0.0036539 * T * T - T*T*T/3526000 + T*T*T*T/863310000);
  const E = 1 - 0.002516 * T - 0.0000074 * T * T;
  let sum = 0;
  for (const [d, m, mp, f, c] of MOON_LON_TERMS) {
    let coef = c;
    if (m === 1 || m === -1) coef *= E; else if (m === 2 || m === -2) coef *= E * E;
    sum += coef * sinD(d * D + m * M + mp * Mp + f * F);
  }
  const A1 = 119.75 + 131.849 * T, A2 = 53.09 + 479264.290 * T;
  sum += 3958 * sinD(A1) + 1962 * sinD(Lp - F) + 318 * sinD(A2);
  return norm360(Lp + sum / 1e6 + nutationLon(T));
}

// --------------------------------------- [5] PLANETS (JPL Kepler, 1800–2050)
// [a, aDot, e, eDot, I, IDot, L, LDot, w(=varpi), wDot, O, ODot] per Julian cy
const KEP = {
  Mercury:[0.38709927,0.00000037,0.20563593,0.00001906,7.00497902,-0.00594749,252.25032350,149472.67411175,77.45779628,0.16047689,48.33076593,-0.12534081],
  Venus:  [0.72333566,0.00000390,0.00677672,-0.00004107,3.39467605,-0.00078890,181.97909950,58517.81538729,131.60246718,0.00268329,76.67984255,-0.27769418],
  Earth:  [1.00000261,0.00000562,0.01671123,-0.00004392,-0.00001531,-0.01294668,100.46457166,35999.37244981,102.93768193,0.32327364,0.0,0.0],
  Mars:   [1.52371034,0.00001847,0.09339410,0.00007882,1.84969142,-0.00813131,-4.55343205,19140.30268499,-23.94362959,0.44441088,49.55953891,-0.29257343],
  Jupiter:[5.20288700,-0.00011607,0.04838624,-0.00013253,1.30439695,-0.00183714,34.39644051,3034.74612775,14.72847983,0.21252668,100.47390909,0.20469106],
  Saturn: [9.53667594,-0.00125060,0.05386179,-0.00050991,2.48599187,0.00193609,49.95424423,1222.49362201,92.59887831,-0.41897216,113.66242448,-0.28867794]
};
function helioXYZ(name, T) { // heliocentric ecliptic J2000, AU
  const p = KEP[name];
  const a = p[0]+p[1]*T, e = p[2]+p[3]*T, I = p[4]+p[5]*T;
  const L = p[6]+p[7]*T, w = p[8]+p[9]*T, O = p[10]+p[11]*T;
  const om = w - O;                       // argument of perihelion
  let M = norm360(L - w); if (M > 180) M -= 360;
  let Erad = M * D2R;                     // Kepler solve (Newton)
  for (let i = 0; i < 12; i++) Erad = Erad - (Erad - e * Math.sin(Erad) - M * D2R) / (1 - e * Math.cos(Erad));
  const xo = a * (Math.cos(Erad) - e), yo = a * Math.sqrt(1 - e * e) * Math.sin(Erad);
  const cw = cosD(om), sw = sinD(om), cO = cosD(O), sO = sinD(O), ci = cosD(I), si = sinD(I);
  return {
    x: (cw*cO - sw*sO*ci)*xo + (-sw*cO - cw*sO*ci)*yo,
    y: (cw*sO + sw*cO*ci)*xo + (-sw*sO + cw*cO*ci)*yo,
    z: (sw*si)*xo + (cw*si)*yo
  };
}
function planetTropical(name, T) { // apparent-of-date geocentric longitude, deg
  const earth = helioXYZ('Earth', T);
  let pl = helioXYZ(name, T);
  let dx = pl.x-earth.x, dy = pl.y-earth.y, dz = pl.z-earth.z;
  const dist = Math.sqrt(dx*dx+dy*dy+dz*dz);
  const tau = dist * 0.0057755183 / 36525;        // light-time (centuries)
  pl = helioXYZ(name, T - tau);                    // one retardation pass
  dx = pl.x-earth.x; dy = pl.y-earth.y;
  const lamJ2000 = norm360(Math.atan2(dy, dx) * R2D);
  const prec = 1.396971 * T + 0.0003086 * T * T;   // general precession in lon
  return norm360(lamJ2000 + prec + nutationLon(T));
}

// ------------------------------------------------------------ [6] LUNAR NODES
function meanRahuTropical(T) {
  return norm360(125.0445479 - 1934.1362891*T + 0.0020754*T*T + T*T*T/467441 - T*T*T*T/60616000);
}
function trueRahuTropical(T) { // Meeus corrections to mean node
  const D  = norm360(297.8501921 + 445267.1114034*T), M = norm360(357.5291092 + 35999.0502909*T);
  const Mp = norm360(134.9633964 + 477198.8675055*T), F = norm360(93.2720950 + 483202.0175233*T);
  return norm360(meanRahuTropical(T)
    - 1.4979 * sinD(2*(D-F)) - 0.1500 * sinD(M) - 0.1226 * sinD(2*D)
    + 0.1176 * sinD(2*F) - 0.0801 * sinD(2*(Mp-F)));
}

// -------------------------------------------------------- [7] LAHIRI AYANAMSA
// Base tuned so 2026-07 value = 24°13.3' (cross-implied by Drik sid vs trop).
function ayanamsaLahiri(T) { return 23.85236 + 1.3960 * T + 0.000139 * T * T; }
const toSidereal = (trop, T) => norm360(trop - ayanamsaLahiri(T));

// ------------------------------------------ [8] SIDEREAL TIME / ASC / MC
function gmstDeg(jdUT, Tut) {
  return norm360(280.46061837 + 360.98564736629 * (jdUT - 2451545.0)
    + 0.000387933 * Tut * Tut - Tut * Tut * Tut / 38710000);
}
function ascMcTropical(jdUT, Tut, latDeg, lonEastDeg) {
  const eps = meanObliquity(Tut);
  const ramc = norm360(gmstDeg(jdUT, Tut) + lonEastDeg);
  const mc = norm360(Math.atan2(sinD(ramc), cosD(ramc) * cosD(eps)) * R2D);
  const asc = norm360(Math.atan2(cosD(ramc), -(sinD(ramc) * cosD(eps) + tanD(latDeg) * sinD(eps))) * R2D);
  return { asc, mc, ramc, eps };
}

// --------------------------------------------------- [9] PLACIDUS CUSPS
function eclFromRA(raDeg, eps) { return norm360(Math.atan2(sinD(raDeg), cosD(raDeg) * cosD(eps)) * R2D); }
function placidusCuspsTropical(ramc, eps, latDeg) {
  // iterated semi-arc trisection; falls back to equal-house beyond |lat| 60
  if (Math.abs(latDeg) > 60) return null;
  function solve(offsetFn, start) {
    let ra = norm360(ramc + start);
    for (let i = 0; i < 24; i++) {
      const lam = eclFromRA(ra, eps);
      const dec = Math.asin(sinD(eps) * sinD(lam)) * R2D;
      const x = tanD(latDeg) * tanD(dec);
      if (Math.abs(x) >= 1) return null;               // circumpolar — bail
      const ad = Math.asin(x) * R2D;
      ra = norm360(ramc + offsetFn(ad));
    }
    return eclFromRA(ra, eps);
  }
  const c11 = solve(ad => (90 + ad) / 3, 30);
  const c12 = solve(ad => 2 * (90 + ad) / 3, 60);
  const c2  = solve(ad => 180 - 2 * (90 - ad) / 3, 120);
  const c3  = solve(ad => 180 - (90 - ad) / 3, 150);
  if ([c11, c12, c2, c3].some(v => v === null)) return null;
  return { c11, c12, c2, c3 };
}
function houseCusps(jdUT, Tut, latDeg, lonEastDeg, T) { // sidereal, 1-indexed [1..12]
  const { asc, mc, ramc, eps } = ascMcTropical(jdUT, Tut, latDeg, lonEastDeg);
  const p = placidusCuspsTropical(ramc, eps, latDeg);
  const trop = new Array(13).fill(0);
  trop[1] = asc; trop[10] = mc;
  if (p) { trop[11]=p.c11; trop[12]=p.c12; trop[2]=p.c2; trop[3]=p.c3; }
  else for (const [h, off] of [[11,300],[12,330],[2,30],[3,60]]) trop[h] = norm360(asc + off); // equal fallback
  for (const h of [4,5,6,7,8,9]) trop[h] = norm360(trop[((h+5)%12)+1] + 180); // 4..9 opposite 10..3
  const sys = p ? 'placidus' : 'equal';
  return { cusps: trop.map((v,i)=> i===0?0:toSidereal(v,T)), system: sys, ascTrop: asc };
}

// -------------------------------------------- [10] KP 249 SUB-LORD TABLE
const GRAHA = ['Ke','Ve','Su','Mo','Ma','Ra','Ju','Sa','Me'];
const DASHA_YRS = { Ke:7, Ve:20, Su:6, Mo:10, Ma:7, Ra:18, Ju:16, Sa:19, Me:17 };
const NAK_EN = ['Ashwini','Bharani','Krittika','Rohini','Mrigashira','Ardra','Punarvasu','Pushya','Ashlesha','Magha','Purva Phalguni','Uttara Phalguni','Hasta','Chitra','Swati','Vishakha','Anuradha','Jyeshtha','Mula','Purva Ashadha','Uttara Ashadha','Shravana','Dhanishtha','Shatabhisha','Purva Bhadrapada','Uttara Bhadrapada','Revati'];
const NAK_HI = ['अश्विनी','भरणी','कृत्तिका','रोहिणी','मृगशिरा','आर्द्रा','पुनर्वसु','पुष्य','आश्लेषा','मघा','पूर्वाफाल्गुनी','उत्तराफाल्गुनी','हस्त','चित्रा','स्वाति','विशाखा','अनुराधा','ज्येष्ठा','मूल','पूर्वाषाढ़ा','उत्तराषाढ़ा','श्रवण','धनिष्ठा','शतभिषा','पूर्वाभाद्रपदा','उत्तराभाद्रपदा','रेवती'];
const RASHI_EN = ['Mesha','Vrishabha','Mithuna','Karka','Simha','Kanya','Tula','Vrishchika','Dhanu','Makara','Kumbha','Meena'];
const RASHI_HI = ['मेष','वृषभ','मिथुन','कर्क','सिंह','कन्या','तुला','वृश्चिक','धनु','मकर','कुम्भ','मीन'];
const SIGN_LORD = ['Ma','Ve','Me','Mo','Su','Me','Ve','Ma','Ju','Sa','Sa','Ju'];
const GRAHA_EN = { Su:'Sun', Mo:'Moon', Ma:'Mars', Me:'Mercury', Ju:'Jupiter', Ve:'Venus', Sa:'Saturn', Ra:'Rahu', Ke:'Ketu' };
const GRAHA_HI = { Su:'सूर्य', Mo:'चन्द्र', Ma:'मंगल', Me:'बुध', Ju:'गुरु', Ve:'शुक्र', Sa:'शनि', Ra:'राहु', Ke:'केतु' };

function buildSubTable() { // exact integer arcseconds; split at sign edges
  const rows = []; let cursor = 0; // arcsec
  for (let n = 0; n < 27; n++) {
    const star = GRAHA[n % 9];
    const startIdx = GRAHA.indexOf(star);
    for (let s = 0; s < 9; s++) {
      const sub = GRAHA[(startIdx + s) % 9];
      let span = DASHA_YRS[sub] * 400;              // yrs/120 * 48000"
      while (span > 0) {
        const signEdge = (Math.floor(cursor / 108000) + 1) * 108000; // 30° = 108000"
        const take = Math.min(span, signEdge - cursor);
        rows.push({ from: cursor, to: cursor + take, star, sub, nak: n });
        cursor += take; span -= take;
      }
    }
  }
  return rows;
}
const SUB_TABLE = buildSubTable();
function subLordOf(sidLonDeg) {
  const s = ((sidLonDeg % 360) + 360) % 360 * 3600;
  for (const r of SUB_TABLE) if (s >= r.from && s < r.to) return r;
  return SUB_TABLE[SUB_TABLE.length - 1];
}
function nakOf(sidLonDeg) {
  const idx = Math.floor(norm360(sidLonDeg) / (360/27)) % 27;
  const pada = Math.floor((norm360(sidLonDeg) % (360/27)) / (360/108)) + 1;
  return { idx, pada, en: NAK_EN[idx], hi: NAK_HI[idx], lord: GRAHA[idx % 9] };
}

// --------------------------------------------------- [11] CHART ASSEMBLY
function sidPositions(ms) {
  const { jdUT, jdTT, T, Tut } = timeFromMs(ms);
  const trop = {
    Su: sunTropical(T), Mo: moonTropical(T),
    Ma: planetTropical('Mars', T), Me: planetTropical('Mercury', T),
    Ju: planetTropical('Jupiter', T), Ve: planetTropical('Venus', T),
    Sa: planetTropical('Saturn', T), Ra: meanRahuTropical(T)
  };
  trop.Ke = norm360(trop.Ra + 180);
  const sid = {}; for (const k in trop) sid[k] = toSidereal(trop[k], T);
  return { sid, trop, jdUT, jdTT, T, Tut };
}
function speedDegPerDay(key, ms) {
  const h = 43200000; // ±12h
  const a = sidPositions(ms - h).sid[key], b = sidPositions(ms + h).sid[key];
  let d = b - a; if (d > 180) d -= 360; if (d < -180) d += 360;
  return d;
}
function castChart(ms, latDeg, lonEastDeg) {
  const { sid, T, jdUT, Tut } = sidPositions(ms);
  const houses = houseCusps(jdUT, Tut, latDeg, lonEastDeg, T);
  const ascSid = houses.cusps[1];
  const planets = ['Su','Mo','Ma','Me','Ju','Ve','Sa','Ra','Ke'].map(k => {
    const lon = sid[k], sl = subLordOf(lon), nk = nakOf(lon);
    const retro = (k==='Ra'||k==='Ke') ? true : (k==='Su'||k==='Mo') ? false : speedDegPerDay(k, ms) < 0;
    return { key:k, en:GRAHA_EN[k], hi:GRAHA_HI[k], lon,
      sign: Math.floor(lon/30), deg: lon % 30, nak: nk, star: sl.star, sub: sl.sub, retro };
  });
  const lagna = { lon: ascSid, sign: Math.floor(ascSid/30), deg: ascSid % 30,
    nak: nakOf(ascSid), star: subLordOf(ascSid).star, sub: subLordOf(ascSid).sub };
  // house occupancy from cusps
  const inHouse = lon => {
    for (let h = 1; h <= 12; h++) {
      const a = houses.cusps[h], b = houses.cusps[h === 12 ? 1 : h + 1];
      if (a <= b ? (lon >= a && lon < b) : (lon >= a || lon < b)) return h;
    }
    return 1;
  };
  planets.forEach(p => p.house = inHouse(p.lon));
  return { ms, lat: latDeg, lon: lonEastDeg, lagna, planets, houses };
}

// --------------------------------------------------- [12] VERDICT ENGINE
// v1 = KP-style signification scoring (documented simplification of full KP;
// dasha-based timing is a roadmap item, not silently faked).
const QUESTIONS = {
  marriage:   { cusp:7,  favor:[2,7,11],   deny:[1,6,10],  hi:'विवाह / सम्बन्ध',   en:'Marriage / relationship' },
  career:     { cusp:10, favor:[2,6,10,11],deny:[5,9,12],  hi:'नौकरी / करियर',    en:'Job / career' },
  money:      { cusp:11, favor:[2,6,11],   deny:[5,8,12],  hi:'धन / लाभ',         en:'Money / gains' },
  health:     { cusp:6,  favor:[1,5,11],   deny:[6,8,12],  hi:'स्वास्थ्य / रोगमुक्ति', en:'Health / recovery' },
  travel:     { cusp:12, favor:[3,9,12],   deny:[2,4,11],  hi:'यात्रा / विदेश',    en:'Travel / abroad' },
  education:  { cusp:4,  favor:[4,9,11],   deny:[3,8,12],  hi:'शिक्षा / परीक्षा',  en:'Education / exams' },
  property:   { cusp:4,  favor:[2,4,11],   deny:[3,8,12],  hi:'सम्पत्ति / वाहन',   en:'Property / vehicle' },
  children:   { cusp:5,  favor:[2,5,11],   deny:[1,4,10],  hi:'सन्तान',           en:'Children' },
  litigation: { cusp:6,  favor:[6,11],     deny:[7,8,12],  hi:'मुक़दमा / विवाद',   en:'Dispute / court case' },
  lost:       { cusp:2,  favor:[2,6,11],   deny:[3,8,12],  hi:'खोई वस्तु',        en:'Lost object' },
  venture:    { cusp:10, favor:[2,6,10,11],deny:[5,8,12],  hi:'नया कार्य / व्यवसाय', en:'New venture' },
  general:    { cusp:1,  favor:[1,10,11],  deny:[6,8,12],  hi:'सामान्य प्रश्न',    en:'General question' }
};
function significations(chart, grahaKey) {
  const P = chart.planets.find(p => p.key === grahaKey);
  const starP = chart.planets.find(p => p.key === P.star) || P;
  const owned = g => SIGN_LORD.map((l, i) => l === g ? i : -1).filter(i => i >= 0)
    .map(signIdx => { // houses whose cusp sign matches
      const hs = [];
      for (let h = 1; h <= 12; h++) if (Math.floor(chart.houses.cusps[h] / 30) === signIdx) hs.push(h);
      return hs;
    }).flat();
  return {
    primary: [...new Set([starP.house, ...owned(starP.key)])],
    secondary: [...new Set([P.house, ...owned(P.key)])]
  };
}
function judge(chart, categoryKey) {
  const q = QUESTIONS[categoryKey] || QUESTIONS.general;
  const cuspLon = chart.houses.cusps[q.cusp];
  const cuspSub = subLordOf(cuspLon).sub;
  const sig = significations(chart, cuspSub);
  let score = 0; const hits = { favor: [], deny: [] };
  for (const h of sig.primary) { if (q.favor.includes(h)) { score += 2; hits.favor.push(h); } if (q.deny.includes(h)) { score -= 2; hits.deny.push(h); } }
  for (const h of sig.secondary) { if (q.favor.includes(h) && !hits.favor.includes(h)) { score += 1; hits.favor.push(h); } if (q.deny.includes(h) && !hits.deny.includes(h)) { score -= 1; hits.deny.push(h); } }
  const subPlanet = chart.planets.find(p => p.key === cuspSub);
  if (subPlanet.retro && subPlanet.key !== 'Ra' && subPlanet.key !== 'Ke') score -= 1;
  // Moon link: does the Moon's star/sub signify the matter? ("ripeness")
  const moonSig = significations(chart, 'Mo');
  const moonLinked = [...moonSig.primary, ...moonSig.secondary].some(h => h === q.cusp || q.favor.includes(h));
  const verdict = score >= 2 ? 'favourable' : score <= -2 ? 'unfavourable' : 'mixed';
  return { category: categoryKey, q, cuspSub, subPlanet, score, hits, moonLinked, verdict, sig };
}

// ------------------------------------------------------------ [13] SELF-TESTS
const IST = (y,mo,d,h,mi) => Date.UTC(y, mo-1, d, h, mi) - 330*60000; // IST→UTC ms
const DELHI = { lat: 28.6139, lon: 77.2090 };
function dms(x){const d=Math.floor(x),m=Math.floor((x-d)*60),s=Math.round(((x-d)*60-m)*60);return `${d}°${String(m).padStart(2,'0')}'${String(s).padStart(2,'0')}"`;}
function runTests() {
  let pass = 0, fail = 0;
  const check = (name, got, want, tolDeg) => {
    let d = Math.abs(got - want); if (d > 180) d = 360 - d;
    const ok = d <= tolDeg;
    ok ? pass++ : fail++;
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}: got ${got.toFixed(4)}° want ${want.toFixed(4)}° (±${tolDeg}°) diff ${(d*60).toFixed(2)}'`);
  };
  // Drik anchors, New Delhi 2026-07-10 (exact-longitude timestamps)
  let t = timeFromMs(IST(2026,7,10,13,15));                 // Bharani ends
  check('Moon sid @13:15 IST = 26°40\'', toSidereal(moonTropical(t.T), t.T), 26.66667, 0.05);
  t = timeFromMs(IST(2026,7,10,18,44));                     // Moon → Vrishabha
  check('Moon sid @18:44 IST = 30°', toSidereal(moonTropical(t.T), t.T), 30.0, 0.05);
  t = timeFromMs(IST(2026,7,10,8,16));                      // Dashami ends: Mo−Su = 300°
  check('Tithi elong @08:16 IST = 300°', norm360(moonTropical(t.T) - sunTropical(t.T)), 300.0, 0.05);
  t = timeFromMs(IST(2026,7,11,5,22));                      // Ekadashi ends: 312°
  check('Tithi elong @05:22(+1) = 312°', norm360(moonTropical(t.T) - sunTropical(t.T)), 312.0, 0.05);
  t = timeFromMs(IST(2026,7,10,7,15));                      // Dhriti yoga ends: Su+Mo = 106°40'
  check('Yoga sum @07:15 IST = 106°40\'', norm360(toSidereal(sunTropical(t.T),t.T) + toSidereal(moonTropical(t.T),t.T)), 106.66667, 0.05);
  // ayanamsa (cross-implied Drik sid vs trop, slow-mover Saturn): 24°13.3' ±2'
  t = timeFromMs(IST(2026,7,10,12,0));
  check('Lahiri ayanamsa 2026-07-10', ayanamsaLahiri(t.T), 24.2217, 0.034);
  // slow/medium planets vs published sidereal (2026-07-11, timestamp slop covered by tol)
  t = timeFromMs(IST(2026,7,11,12,0));
  check('Saturn sid ≈ Meena 20°19\'', toSidereal(planetTropical('Saturn',t.T),t.T), 350.3117, 0.20);
  check('Jupiter sid ≈ Karka 8°08\'', toSidereal(planetTropical('Jupiter',t.T),t.T), 98.1356, 0.30);
  check('Mars sid ≈ Vrishabha 14°31\'', toSidereal(planetTropical('Mars',t.T),t.T), 44.5106, 0.60);
  check('Venus sid ≈ Simha 7°23\'', toSidereal(planetTropical('Venus',t.T),t.T), 127.3856, 0.80);
  check('Mercury sid ≈ Mithuna 27°41\'', toSidereal(planetTropical('Mercury',t.T),t.T), 87.6847, 1.00);
  check('Sun sid ≈ Mithuna 24°40\'', toSidereal(sunTropical(t.T),t.T), 84.6753, 0.60);
  check('Mean Rahu sid ≈ Kumbha 7°49\'', toSidereal(meanRahuTropical(t.T),t.T), 307.8181, 0.08);
  check('True Rahu sid ≈ Kumbha 6°22\'', toSidereal(trueRahuTropical(t.T),t.T), 306.3608, 0.15);
  // ascendant: at sunrise, Asc ≈ Sun tropical (±1.5°)
  t = timeFromMs(IST(2026,7,10,5,31));
  const am = ascMcTropical(t.jdUT, t.Tut, DELHI.lat, DELHI.lon);
  check('Asc @sunrise ≈ Sun', am.asc, sunTropical(t.T), 1.5);
  // ascendant structural: equator identities
  {
    const eps = 23.4393;
    const a0 = Math.atan2(cosD(0), -(sinD(0)*cosD(eps))) * R2D;                 // RAMC 0, lat 0 → 90
    const a180 = norm360(Math.atan2(cosD(180), -(sinD(180)*cosD(eps))) * R2D);  // → 270
    check('Asc identity RAMC=0 lat=0', norm360(a0), 90, 1e-6);
    check('Asc identity RAMC=180 lat=0', a180, 270, 1e-6);
  }
  // ascendant monotonic over 24h (no wraps/reversals)
  {
    let prev = null, mono = true;
    for (let m = 0; m <= 1440; m += 10) {
      const tt = timeFromMs(IST(2026,7,10,0,0) + m*60000);
      const a = ascMcTropical(tt.jdUT, tt.Tut, DELHI.lat, DELHI.lon).asc;
      if (prev !== null) { let d = a - prev; if (d < -180) d += 360; if (d <= 0) mono = false; }
      prev = a;
    }
    mono ? pass++ : fail++; console.log(`${mono?'PASS':'FAIL'}  Asc strictly increasing over 24h`);
  }
  // Placidus: equator degenerates to 30° steps
  {
    const p = placidusCuspsTropical(0, 23.4393, 0);
    check('Placidus c11 equator', p.c11, eclFromRA(30, 23.4393), 0.01);
    check('Placidus c2 equator', p.c2, eclFromRA(120, 23.4393), 0.01);
  }
  // sub-lord table structure
  {
    const n = SUB_TABLE.length;
    (n === 249 ? pass++ : fail++); console.log(`${n===249?'PASS':'FAIL'}  Sub table has 249 divisions (got ${n})`);
    const r1 = SUB_TABLE[0];
    const ok1 = r1.star==='Ke' && r1.sub==='Ke' && r1.to === 2800; // 0°46'40"
    (ok1?pass++:fail++); console.log(`${ok1?'PASS':'FAIL'}  #1 = Ashwini Ke–Ke ends 0°46'40"`);
    const last = SUB_TABLE[248];
    const ok2 = last.to === 360*3600 && last.star==='Me' && last.sub==='Sa';
    (ok2?pass++:fail++); console.log(`${ok2?'PASS':'FAIL'}  #249 = Revati Me–Sa ends 360°`);
  }
  // verdict engine determinism + structure
  {
    const chart = castChart(IST(2026,7,10,13,15), DELHI.lat, DELHI.lon);
    const v = judge(chart, 'marriage');
    const ok = ['favourable','unfavourable','mixed'].includes(v.verdict) && v.cuspSub && v.hits;
    (ok?pass++:fail++); console.log(`${ok?'PASS':'FAIL'}  Verdict engine returns structured result (${v.verdict}, sub=${v.cuspSub}, score=${v.score})`);
  }
  console.log(`\n${fail === 0 ? 'ALL TESTS PASSED' : 'FAILURES PRESENT'}  (${pass} pass / ${fail} fail)`);
  return fail === 0;
}

// ------------------------------------------------------------------ CLI
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args[0] === 'chart') {
    const ms = Date.parse(args[1] || new Date().toISOString());
    const lat = parseFloat(args[2] ?? DELHI.lat), lon = parseFloat(args[3] ?? DELHI.lon);
    const cat = args[4] || 'general';
    const c = castChart(ms, lat, lon);
    console.log(`Lagna: ${RASHI_EN[c.lagna.sign]} ${dms(c.lagna.deg)}  nak ${c.lagna.nak.en}-${c.lagna.nak.pada}  star ${c.lagna.star} sub ${c.lagna.sub}  [${c.houses.system}]`);
    for (const p of c.planets)
      console.log(`${p.en.padEnd(8)} ${RASHI_EN[p.sign].padEnd(10)} ${dms(p.deg).padStart(10)}  ${p.nak.en.padEnd(16)}-${p.nak.pada}  star ${p.star} sub ${p.sub}  H${p.house}${p.retro?' Rx':''}`);
    const v = judge(c, cat);
    console.log(`\n[${v.q.en}] cusp ${v.q.cusp} sub-lord = ${GRAHA_EN[v.cuspSub]}  score ${v.score} → ${v.verdict.toUpperCase()}  moonLinked=${v.moonLinked}`);
  } else {
    process.exit(runTests() ? 0 : 1);
  }
}
module.exports = { castChart, judge, QUESTIONS, subLordOf, nakOf, ayanamsaLahiri, RASHI_EN, RASHI_HI, GRAHA_EN, GRAHA_HI };
