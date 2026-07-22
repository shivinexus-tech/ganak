import React, { useState } from "react";
import { T } from "../components/tokens";
import { fmtDeg } from "../components/format";
import { NAK_HI } from "../engine/muhurat";

// ------------------------------------------------- PRASHNA TOKENS (app palette)
const TOKENS = {
  bg: "#FAF5EA", card: "#FFFFFF", ink: "#3B3147", muted: "#8C8173",
  line: "#E7DDC6", gold: "#A86A12", goldSoft: "#FBF1DA",
  sindoor: "#C2451E", sindoorSoft: "#FBE7E1", amber: "#B26A00", amberSoft: "#FDF3E0",
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
function PR_ascMc(jdUT, Tut, lat, lonE) {
  const eps = PR_obliquity(Tut), ramc = norm360(PR_gmst(jdUT, Tut) + lonE);
  return {
    asc: norm360(Math.atan2(cosD(ramc), -(sinD(ramc) * cosD(eps) + tanD(lat) * sinD(eps))) * R2D),
    mc: norm360(Math.atan2(sinD(ramc), cosD(ramc) * cosD(eps)) * R2D),
    ramc, eps
  };
}
const PR_eclFromRA = (ra, eps) => norm360(Math.atan2(sinD(ra), cosD(ra) * cosD(eps)) * R2D);
function PR_placidus(ramc, eps, lat) {
  if (Math.abs(lat) > 60) return null;
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
const GRAHA = ['Ke','Ve','Su','Mo','Ma','Ra','Ju','Sa','Me'];
const DASHA_YRS = { Ke:7, Ve:20, Su:6, Mo:10, Ma:7, Ra:18, Ju:16, Sa:19, Me:17 };
const NAK_EN = ['Ashwini','Bharani','Krittika','Rohini','Mrigashira','Ardra','Punarvasu','Pushya','Ashlesha','Magha','Purva Phalguni','Uttara Phalguni','Hasta','Chitra','Swati','Vishakha','Anuradha','Jyeshtha','Mula','Purva Ashadha','Uttara Ashadha','Shravana','Dhanishtha','Shatabhisha','Purva Bhadrapada','Uttara Bhadrapada','Revati'];
const RASHI_EN = ['Mesha','Vrishabha','Mithuna','Karka','Simha','Kanya','Tula','Vrishchika','Dhanu','Makara','Kumbha','Meena'];
const RASHI_HI = ['मेष','वृषभ','मिथुन','कर्क','सिंह','कन्या','तुला','वृश्चिक','धनु','मकर','कुम्भ','मीन'];
const PR_SIGN_LORD = ['Ma','Ve','Me','Mo','Su','Me','Ve','Ma','Ju','Sa','Sa','Ju'];
const GRAHA_EN = { Su:'Sun', Mo:'Moon', Ma:'Mars', Me:'Mercury', Ju:'Jupiter', Ve:'Venus', Sa:'Saturn', Ra:'Rahu', Ke:'Ketu' };
const GRAHA_HI = { Su:'सूर्य', Mo:'चन्द्र', Ma:'मंगल', Me:'बुध', Ju:'गुरु', Ve:'शुक्र', Sa:'शनि', Ra:'राहु', Ke:'केतु' };
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
function PR_subOf(sid) {
  const s = norm360(sid) * 3600;
  for (const r of PR_SUBS) if (s >= r.from && s < r.to) return r;
  return PR_SUBS[PR_SUBS.length - 1];
}
const PR_nakOf = sid => {
  const idx = Math.floor(norm360(sid) / (360/27)) % 27;
  return { idx, pada: Math.floor((norm360(sid) % (360/27)) / (360/108)) + 1, en: NAK_EN[idx] };
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
  const trop = new Array(13).fill(0);
  trop[1] = asc; trop[10] = mc;
  if (p) { trop[11]=p.c11; trop[12]=p.c12; trop[2]=p.c2; trop[3]=p.c3; }
  else for (const [h, off] of [[11,300],[12,330],[2,30],[3,60]]) trop[h] = norm360(asc + off);
  for (const h of [4,5,6,7,8,9]) trop[h] = norm360(trop[((h + 5) % 12) + 1] + 180);
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
  { key:'marriage',  cusp:7,  favor:[2,7,11],    deny:[1,6,10], hi:'विवाह / सम्बन्ध',      en:'Marriage / relationship' },
  { key:'career',    cusp:10, favor:[2,6,10,11], deny:[5,9,12], hi:'नौकरी / करियर',       en:'Job / career' },
  { key:'money',     cusp:11, favor:[2,6,11],    deny:[5,8,12], hi:'धन / लाभ',            en:'Money / gains' },
  { key:'health',    cusp:6,  favor:[1,5,11],    deny:[6,8,12], hi:'स्वास्थ्य / रोगमुक्ति', en:'Health / recovery' },
  { key:'travel',    cusp:12, favor:[3,9,12],    deny:[2,4,11], hi:'यात्रा / विदेश',       en:'Travel / abroad' },
  { key:'education', cusp:4,  favor:[4,9,11],    deny:[3,8,12], hi:'शिक्षा / परीक्षा',     en:'Education / exams' },
  { key:'property',  cusp:4,  favor:[2,4,11],    deny:[3,8,12], hi:'सम्पत्ति / वाहन',      en:'Property / vehicle' },
  { key:'children',  cusp:5,  favor:[2,5,11],    deny:[1,4,10], hi:'सन्तान',              en:'Children' },
  { key:'litigation',cusp:6,  favor:[6,11],      deny:[7,8,12], hi:'मुक़दमा / विवाद',      en:'Dispute / court case' },
  { key:'lost',      cusp:2,  favor:[2,6,11],    deny:[3,8,12], hi:'खोई वस्तु',           en:'Lost object' },
  { key:'venture',   cusp:10, favor:[2,6,10,11], deny:[5,8,12], hi:'नया कार्य / व्यवसाय',  en:'New venture' },
  { key:'general',   cusp:1,  favor:[1,10,11],   deny:[6,8,12], hi:'सामान्य प्रश्न',       en:'General question' }
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

// ------------------------------------------------------------ UI PIECES
function PrashnaSecHead({ hi, en }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontFamily: TOKENS.devanagari, fontSize: 20, color: TOKENS.ink, lineHeight: 1.2 }}>{hi}</div>
      <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: TOKENS.muted }}>{en}</div>
    </div>
  );
}
function Gloss({ children }) {
  return <div style={{ fontSize: 13, color: TOKENS.muted, fontStyle: 'italic', lineHeight: 1.45 }}>{children}</div>;
}

const VERDICT_STYLE = {
  favourable:   { hi: 'अनुकूल',            en: 'Favourable',      color: TOKENS.gold,    soft: TOKENS.goldSoft },
  unfavourable: { hi: 'प्रतिकूल',           en: 'Not favourable',  color: TOKENS.sindoor, soft: TOKENS.sindoorSoft },
  mixed:        { hi: 'मिश्रित — प्रतीक्षा', en: 'Mixed — wait', color: TOKENS.amber,   soft: TOKENS.amberSoft },
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
const HOUSE_PLAIN_DENY = {
  1:  { en: 'your own position is not strong enough', hi: 'आपकी अपनी स्थिति पर्याप्त मज़बूत नहीं' },
  2:  { en: 'family and savings are not helping',     hi: 'परिवार और बचत सहायक नहीं' },
  3:  { en: 'effort alone may not be enough',         hi: 'केवल प्रयास पर्याप्त नहीं' },
  9:  { en: 'fortune is not helping here',            hi: 'भाग्य यहाँ सहायक नहीं' },
  10: { en: 'career standing is a hurdle',            hi: 'करियर की प्रतिष्ठा बाधा बन रही है' },
  11: { en: 'hopes and gains are blocked',            hi: 'आशाएँ और लाभ रुकावट में हैं' },
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
    return P[h];
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

// ------------------------------------------------------------ MAIN SCREEN
function PrashnaScreen({ lat = 28.6139, lon = 77.209, placeLabel = 'New Delhi', lang = 'en' }) {
  const hi = lang === 'hi';
  const [selected, setSelected] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [showFull, setShowFull] = useState(false);

  const ask = () => {
    setError(null);
    try {
      const q = QUESTIONS.find(x => x.key === selected) || QUESTIONS[QUESTIONS.length - 1];
      const ms = Date.now();
      const chart = PR_cast(ms, lat, lon);
      setResult({ chart, verdict: PR_judge(chart, q), askedAt: new Date(ms) });
      setShowFull(false);
    } catch (e) {
      if (typeof console !== "undefined") console.error("prashna cast failed:", e);
      setError(hi ? "गणना नहीं हो सकी — कृपया पुनः प्रयास करें।" : "Couldn't complete the calculation — please try again.");
    }
  };

  const v = result && result.verdict;
  const vs = v && VERDICT_STYLE[v.verdict];

  return (
    <div style={{ background: TOKENS.bg, minHeight: '100%', padding: 16, color: TOKENS.ink,
      fontFamily: "-apple-system, 'Segoe UI', sans-serif" }}>
      <PrashnaSecHead hi="प्रश्न कुण्डली" en="Prashna · ask the moment" />
      <Gloss>
        {hi
          ? 'अभी प्रश्न पूछें — इसी क्षण का आकाश उत्तर देता है। यह प्रश्न कुण्डली (होरारी ज्योतिष) है: जन्म विवरण की आवश्यकता नहीं, केवल पूछने का क्षण और स्थान।'
          : 'Ask a question now — the sky at this very moment answers it. This is Prashna (horary astrology): no birth details needed, only the moment and place of asking.'}
      </Gloss>

      {/* Question chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, margin: '14px 0' }}>
        {QUESTIONS.map(q => {
          const on = selected === q.key;
          return (
            <button key={q.key} onClick={() => { setSelected(q.key); setResult(null); setError(null); }}
              style={{ height: TOKENS.ctrlH, borderRadius: TOKENS.radius, padding: '0 14px',
                border: `1.5px solid ${on ? TOKENS.gold : TOKENS.line}`,
                background: on ? TOKENS.goldSoft : TOKENS.card,
                color: TOKENS.ink, fontSize: 14, cursor: 'pointer' }}>
              {hi
                ? <span style={{ fontFamily: TOKENS.devanagari }}>{q.hi}</span>
                : <span>{q.en}</span>}
            </button>
          );
        })}
      </div>

      <button onClick={ask} disabled={!selected}
        style={{ height: TOKENS.ctrlH, borderRadius: TOKENS.radius, width: '100%',
          border: 'none', background: selected ? TOKENS.ink : TOKENS.line,
          color: selected ? TOKENS.bg : TOKENS.muted, fontSize: 15, fontWeight: 600,
          cursor: selected ? 'pointer' : 'default' }}>
        {hi ? 'अभी पूछें' : 'Ask now'}
      </button>

      {error && (
        <div style={{ marginTop: 14, padding: 12, borderRadius: TOKENS.radius,
          background: TOKENS.sindoorSoft, border: `1.5px solid ${TOKENS.sindoor}`,
          color: TOKENS.sindoor, fontSize: 14 }}>{error}</div>
      )}

      {result && !error && (
        <div style={{ marginTop: 16 }}>
          {/* Verdict card — answer before data */}
          <div style={{ background: TOKENS.card, borderRadius: TOKENS.radius,
            border: `1.5px solid ${vs.color}`, overflow: 'hidden' }}>
            <div style={{ background: vs.soft, padding: '14px 16px' }}>
              <div style={{ fontFamily: hi ? TOKENS.devanagari : 'inherit', fontSize: 28, color: vs.color, lineHeight: 1.1 }}>{hi ? vs.hi : vs.en}</div>
              <div style={{ fontSize: 13, color: TOKENS.muted, marginTop: 6 }}>
                {hi ? v.q.hi : v.q.en}
              </div>
            </div>
            <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {buildPlain(v, lang).map((r, i) => (
                <div key={i} style={{ fontSize: 14, lineHeight: 1.5,
                  color: r.tone === 'good' ? TOKENS.ink : r.tone === 'bad' ? TOKENS.sindoor : TOKENS.ink,
                  fontWeight: r.tone === 'lead' ? 600 : 400 }}>
                  {r.text}
                </div>
              ))}
              <Gloss>
                {hi
                  ? `${result.askedAt.toLocaleString('hi-IN')} को ${placeLabel} से पूछा गया। प्रश्न का निर्णय उसी क्षण और स्थान के लिए होता है, जब और जहाँ से आप पूछते हैं।`
                  : `Cast for ${result.askedAt.toLocaleString()} at ${placeLabel}. Prashna is judged for the moment you ask, at the place you ask from.`}
              </Gloss>
            </div>
          </div>

          {/* Collapsible full chart — the Lagna/Nakshatra/Sub-lord chips live INSIDE
              this, not above it. They are expert evidence ("Krittika-3" is not
              actionable for a lay user), so they belong with the chart on tier 2
              rather than between the verdict and the way out. Owner-approved
              2026-07-22 (Q1a). */}
          <button onClick={() => setShowFull(s => !s)}
            style={{ marginTop: 12, height: TOKENS.ctrlH, borderRadius: TOKENS.radius, width: '100%',
              border: `1.5px solid ${TOKENS.line}`, background: TOKENS.card, color: TOKENS.ink,
              fontSize: 14, cursor: 'pointer' }}>
            {showFull ? (hi ? 'विवरण छिपाएँ' : 'Hide details') : (hi ? 'विस्तृत प्रश्न कुण्डली' : 'Full Prashna chart')}
          </button>

          {showFull && (
            <div style={{ marginTop: 10, background: TOKENS.card, borderRadius: TOKENS.radius,
              border: `1.5px solid ${TOKENS.line}`, padding: 12 }}>
              {/* Astrologer's reasoning: house numbers, significations, sub-lord.
                  Tier 2 by design — tier 1 says the same thing in plain words. */}
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase',
                  color: TOKENS.muted, marginBottom: 6 }}>
                  {hi ? 'निर्णय कैसे हुआ' : 'How this was judged'}
                </div>
                {buildReasons(v, lang).map((r, i) => (
                  <div key={i} style={{ fontSize: 13, lineHeight: 1.5, marginBottom: 4,
                    color: r.tone === 'bad' ? TOKENS.sindoor : TOKENS.ink,
                    fontWeight: r.tone === 'lead' ? 600 : 400 }}>
                    {r.text}
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                <PrashnaChip label={hi ? 'लग्न' : 'Lagna'} value={`${hi ? RASHI_HI[result.chart.lagna.sign] : RASHI_EN[result.chart.lagna.sign]} ${fmtDeg(result.chart.lagna.deg)}`}
                  gloss={hi ? 'इस क्षण पूर्व में उदित राशि' : 'the sign rising in the east at this moment'} />
                <PrashnaChip label={hi ? 'नक्षत्र' : 'Nakshatra'} value={`${hi ? NAK_HI[result.chart.lagna.nak.idx] : result.chart.lagna.nak.en}-${result.chart.lagna.nak.pada}`}
                  gloss={hi ? 'उदित अंश जिस चन्द्र-नक्षत्र में पड़ता है' : 'the lunar mansion the rising degree falls in'} />
                <PrashnaChip label={hi ? 'उप-स्वामी' : 'Sub-lord'} value={hi ? GRAHA_HI[v.cuspSub] : GRAHA_EN[v.cuspSub]}
                  gloss={hi ? 'निर्णायक मत देने वाला सूक्ष्म स्वामी' : 'the fine-grained ruler that casts the deciding vote'} />
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ color: TOKENS.muted, textAlign: 'left' }}>
                    <th style={{ padding: '4px 2px' }}>{hi ? 'ग्रह' : 'Graha'}</th><th>{hi ? 'राशि' : 'Rashi'}</th>
                    <th>{hi ? 'नक्षत्र' : 'Nakshatra'}</th><th>{hi ? 'तारा/उप' : 'Star/Sub'}</th><th>{hi ? 'भाव' : 'House'}</th>
                  </tr>
                </thead>
                <tbody>
                  {result.chart.planets.map(p => (
                    <tr key={p.key} style={{ borderTop: `1px solid ${TOKENS.line}` }}>
                      <td style={{ padding: '5px 2px' }}>
                        {hi
                          ? <span style={{ fontFamily: TOKENS.devanagari }}>{GRAHA_HI[p.key]}</span>
                          : <span>{GRAHA_EN[p.key]}</span>}
                        {p.retro && p.key !== 'Ra' && p.key !== 'Ke' &&
                          <span style={{ color: TOKENS.sindoor, fontSize: 11 }}> Rx</span>}
                      </td>
                      <td>{hi ? RASHI_HI[p.sign] : RASHI_EN[p.sign]} {fmtDeg(p.deg)}</td>
                      <td>{hi ? NAK_HI[p.nak.idx] : p.nak.en}-{p.nak.pada}</td>
                      <td>{p.star}/{p.sub}</td>
                      <td>{p.house}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ marginTop: 8, fontSize: 11.5, color: TOKENS.muted }}>
                {hi ? "Rx = वक्री, आकाश में पीछे चलता प्रतीत होता है" : "Rx = retrograde, appears to move backward in the sky"}
              </div>
              <div style={{ marginTop: 8 }}>
                <Gloss>
                  {hi
                    ? `तारा/उप = नक्षत्र स्वामी / KP उप-स्वामी — प्रश्न इसी दो-स्तरीय स्वामित्व को पढ़ता है। भाव = ग्रह का भाव (${result.chart.system === 'placidus' ? 'प्लेसिडस भाव — KP मानक' : 'समान भाव — उच्च अक्षांश विकल्प'})। स्थितियाँ: लाहिरी अयनांश, मध्यम राहु/केतु — द्रिक पंचांग की मानक परिपाटी।`
                    : `Star/Sub = nakshatra lord / KP sub-lord — the two-level rulership Prashna reads. House = the house the planet occupies (${result.chart.system === 'placidus' ? 'Placidus cusps, the KP standard' : 'equal houses — high-latitude fallback'}). Positions: Lahiri ayanamsa, mean Rahu/Ketu — the same conventions as Drik Panchang defaults.`}
                </Gloss>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PrashnaChip({ label, value, gloss }) {
  return (
    <div style={{ background: TOKENS.card, border: `1.5px solid ${TOKENS.line}`,
      borderRadius: TOKENS.radius, padding: '8px 12px', minWidth: 120 }}>
      <div style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: TOKENS.muted }}>{label}</div>
      <div style={{ fontSize: 15, marginTop: 2 }}>{value}</div>
      <div style={{ fontSize: 11, color: TOKENS.muted, fontStyle: 'italic', marginTop: 2 }}>{gloss}</div>
    </div>
  );
}

export default PrashnaScreen;
