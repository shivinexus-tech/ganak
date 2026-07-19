/* Vimshottari dasha sequence + sub-period helpers (SPLIT-UI-JYOTISH-01d).
   Includes KP sub-lord chain (same 9-fold proportions). Shell may still hold copies until wired. */

import { rev, tropicalLongitudes, ascendantAt } from "./ephemeris";
import { SIGN_LORD, ayanAt, setAyanMode } from "./panchang";
import { vargaSign } from "./varga";

const DASHA_SEQ = [["Ketu", 7], ["Venus", 20], ["Sun", 6], ["Moon", 10], ["Mars", 7], ["Rahu", 18], ["Jupiter", 16], ["Saturn", 19], ["Mercury", 17]];
const VIM_LORDS = DASHA_SEQ.map(([l]) => l);
const DASHA_LEVELS = ["Antardasha", "Pratyantardasha", "Sookshma", "Prana"];
const nakLordOf = (L) => VIM_LORDS[Math.floor(L / (360 / 27)) % 9];

/* KP sub-lord chain (249 scheme): nakshatra subdivided into 9 Vimshottari-proportioned
   subs in dasha order from the star lord; recursed once for the sub-sub (sookshma) lord. */
const VIM_YEARS = Object.fromEntries(DASHA_SEQ);
function subLordChain(lon) {
  lon = rev(lon);
  const NK = 360 / 27;
  const nakIdx = Math.floor(lon / NK);
  const starLord = VIM_LORDS[nakIdx % 9];
  const intoNak = lon - nakIdx * NK;
  const si = VIM_LORDS.indexOf(starLord);
  let acc = 0, subLord = starLord, subStart = 0, subSpan = NK;
  for (let k = 0; k < 9; k++) {
    const pl = VIM_LORDS[(si + k) % 9];
    const span = (VIM_YEARS[pl] / 120) * NK;
    if (intoNak < acc + span - 1e-9 || k === 8) { subLord = pl; subStart = acc; subSpan = span; break; }
    acc += span;
  }
  const intoSub = intoNak - subStart;
  const sj = VIM_LORDS.indexOf(subLord);
  let acc2 = 0, subSub = subLord;
  for (let k = 0; k < 9; k++) {
    const pl = VIM_LORDS[(sj + k) % 9];
    const span = (VIM_YEARS[pl] / 120) * subSpan;
    if (intoSub < acc2 + span - 1e-9 || k === 8) { subSub = pl; break; }
    acc2 += span;
  }
  return { starLord, subLord, subSub };
}

/* KP significators (4-step hierarchy) + Ruling Planets.
   A house's significators, strongest first: (A) planets in the star of its occupants,
   (B) its occupants, (C) planets in the star of its owner, (D) its owner. */
const KP_PLANETS = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"];
function computeKPSignificators(rows, kpCusps) {
  const star = {};
  rows.forEach((p) => (star[p.name] = p.kp.starLord));
  const occupants = {}; for (let h = 1; h <= 12; h++) occupants[h] = [];
  rows.forEach((p) => occupants[p.kpHouse].push(p.name));
  const owner = {};
  for (let h = 1; h <= 12; h++) owner[h] = kpCusps[h] == null ? null : SIGN_LORD[Math.floor(kpCusps[h] / 30)];
  const sig = {};
  const housesByPlanet = {}; KP_PLANETS.forEach((p) => (housesByPlanet[p] = new Set()));
  for (let h = 1; h <= 12; h++) {
    const occ = occupants[h], own = owner[h];
    const A = rows.filter((p) => occ.includes(star[p.name])).map((p) => p.name);
    const B = occ.slice();
    const C = own ? rows.filter((p) => star[p.name] === own).map((p) => p.name) : [];
    const D = own ? [own] : [];
    sig[h] = { A, B, C, D };
    [...A, ...B, ...C, ...D].forEach((pl) => housesByPlanet[pl] && housesByPlanet[pl].add(h));
  }
  const housesOf = {}; KP_PLANETS.forEach((p) => (housesOf[p] = [...housesByPlanet[p]].sort((a, b) => a - b)));
  // consolidated, strength-ordered, de-duplicated significators per house
  const ordered = {};
  for (let h = 1; h <= 12; h++) {
    const seen = new Set(); ordered[h] = [];
    [...sig[h].A, ...sig[h].B, ...sig[h].C, ...sig[h].D].forEach((pl) => { if (!seen.has(pl)) { seen.add(pl); ordered[h].push(pl); } });
  }
  return { sig, occupants, owner, housesOf, ordered };
}
const WEEKDAY_LORDS = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"];
function computeRulingPlanets(ascSid, moonSid, dayLord) {
  return {
    ascSignLord: SIGN_LORD[Math.floor(ascSid / 30)],
    ascStarLord: nakLordOf(ascSid),
    ascSubLord: subLordChain(ascSid).subLord,
    moonSignLord: SIGN_LORD[Math.floor(moonSid / 30)],
    moonStarLord: nakLordOf(moonSid),
    moonSubLord: subLordChain(moonSid).subLord,
    dayLord,
  };
}

// Generalized Vimshottari subdivision: any period (its lord, start ms, duration
// ms) -> its 9 sub-periods, each span = subLordYears/120 * duration. The same
// proportional recursion drives antar -> pratyantar -> sookshma -> prana.
function vimSub(startLord, startMs, durMs) {
  const seqStart = DASHA_SEQ.findIndex(([l]) => l === startLord);
  const out = [];
  let c = startMs;
  for (let i = 0; i < 9; i++) {
    const [lord, yrs] = DASHA_SEQ[(seqStart + i) % 9];
    const span = (yrs / 120) * durMs;
    out.push({ lord, start: c, end: c + span });
    c += span;
  }
  return out;
}

/* ---------------- birth-time rectification: structural sweep + dasha anchors ----------------
   Reuses ascendantAt / vargaSign / subLordChain for the four time-sensitive markers, and
   rebuilds the Vimshottari Maha timeline per candidate time (the balance shifts ~2 days per
   birth-minute, so event-dasha boundaries move). An instrument, not an auto-verdict. */
function rectAtMin(y, m, day, tz, lat, lon, ayanamsa, totalMin) {
  setAyanMode(ayanamsa);
  const utcMs = Date.UTC(y, m - 1, day) + totalMin * 60000 - tz * 3600000;
  const jd = utcMs / 86400000 + 2440587.5;
  const ascSid = ascendantAt(jd, lat, lon, ayanAt(jd));
  const sign = Math.floor(ascSid / 30), NK = 360 / 27;
  return {
    totalMin, utcMs, ascSid, sign, deg: ascSid - sign * 30,
    nak: Math.floor(ascSid / NK), pada: Math.floor((ascSid % NK) / (NK / 4)) + 1,
    d9: vargaSign(ascSid, "D9"), d60: vargaSign(ascSid, "D60"),
    subLord: subLordChain(ascSid).subLord,
  };
}
function rectSweep(y, m, day, tz, lat, lon, ayanamsa, centerMin, halfWinMin, stepMin) {
  const steps = [], n = Math.round((2 * halfWinMin) / stepMin);
  for (let i = 0; i <= n; i++) { const off = -halfWinMin + i * stepMin; steps.push({ off, ...rectAtMin(y, m, day, tz, lat, lon, ayanamsa, centerMin + off) }); }
  for (let i = 1; i < steps.length; i++) {
    const a = steps[i], b = steps[i - 1];
    a.chSign = a.sign !== b.sign; a.chD9 = a.d9 !== b.d9; a.chD60 = a.d60 !== b.d60;
    a.chSub = a.subLord !== b.subLord; a.chPada = a.pada !== b.pada || a.nak !== b.nak;
  }
  return steps;
}
function mahaTimelineAt(y, m, day, tz, totalMin, ayanamsa) {
  setAyanMode(ayanamsa);
  const utcMs = Date.UTC(y, m - 1, day) + totalMin * 60000 - tz * 3600000;
  const jd = utcMs / 86400000 + 2440587.5, dd = jd - 2451543.5;
  const moonSid = rev(tropicalLongitudes(dd).Moon - ayanAt(jd));
  const NK = 360 / 27, YEAR = 365.25 * 86400000;
  const nakIdx = Math.floor(moonSid / NK), frac = (moonSid % NK) / NK, startSeq = nakIdx % 9;
  const tl = []; let cursor = utcMs;
  for (let i = 0; i < 9; i++) {
    const [lord, yrs] = DASHA_SEQ[(startSeq + i) % 9];
    const span = (i === 0 ? (1 - frac) * yrs : yrs) * YEAR;
    tl.push({ lord, yrs, start: cursor, end: cursor + span }); cursor += span;
  }
  return { tl, birthMs: utcMs, moonSid };
}
function runDashaAt(tl, eventMs) {
  const YEAR = 365.25 * 86400000;
  const maha = tl.find((p) => eventMs >= p.start && eventMs < p.end);
  if (!maha) return null;
  const fullStart = maha.end - maha.yrs * YEAR;
  const antar = vimSub(maha.lord, fullStart, maha.yrs * YEAR).find((a) => eventMs >= a.start && eventMs < a.end);
  return { maha: maha.lord, antar: antar ? antar.lord : null };
}


export {
  DASHA_SEQ, VIM_LORDS, VIM_YEARS, DASHA_LEVELS, KP_PLANETS, WEEKDAY_LORDS,
  nakLordOf, subLordChain, vimSub,
  computeKPSignificators, computeRulingPlanets,
  rectAtMin, rectSweep, mahaTimelineAt, runDashaAt,
};
