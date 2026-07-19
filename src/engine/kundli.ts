/* Birth-chart computation (SPLIT-UI-CHART-02). Modules-only copy; shell still has its own until wired. */

import {
  rev, sd, cdg, tdg, atan2d, tropicalLongitudes, ascendantAt, moonLon,
} from "./ephemeris";
import {
  setAyanMode, ayanAt, SIGN_LORD, NAKSHATRAS, SIGNS,
  TITHIS, YOGAS, karanaName, sunEvents,
} from "./panchang";
import { placidusCusps } from "./houses";
import { vargaSign } from "./varga";
import { computeAshtakavarga, computeArudhas, detectYogas, SEVEN } from "./classical";
import { computeShadbala } from "./shadbala";
import {
  DASHA_SEQ, VIM_LORDS, subLordChain, vimSub,
  computeKPSignificators, computeRulingPlanets, WEEKDAY_LORDS,
} from "./dasha";
import { computeSpecialPoints } from "./special-points";
import { computeBhavaChalit } from "./bhava";
import { computeBNN } from "./bhrigu";

function computeKundli({ y, m, day, hh, mi, tz, lat, lon, ayanamsa = "lahiri" }) {
  setAyanMode(ayanamsa);
  const utcMs = Date.UTC(y, m - 1, day, hh, mi) - tz * 3600000;
  const JD = utcMs / 86400000 + 2440587.5;
  const d = JD - 2451543.5; // Schlyter epoch
  const ayan = ayanAt(JD);

  const trop = tropicalLongitudes(d);
  const tropPrev = tropicalLongitudes(d - 0.5);

  const bodies = {};
  Object.keys(trop).forEach((k) => {
    bodies[k] = { trop: trop[k], sid: rev(trop[k] - ayan) };
  });
  bodies.Ketu = { trop: rev(trop.Rahu + 180), sid: rev(trop.Rahu + 180 - ayan) };

  // retrograde
  ["Mars", "Mercury", "Jupiter", "Venus", "Saturn"].forEach((k) => {
    const diff = ((trop[k] - tropPrev[k] + 540) % 360) - 180;
    bodies[k].retro = diff < 0;
  });
  bodies.Rahu.retro = true;
  bodies.Ketu.retro = true;

  // ascendant
  const gmst = rev(280.46061837 + 360.98564736629 * (JD - 2451545.0));
  const ramc = rev(gmst + lon);
  const eps = 23.4393 - 3.563e-7 * d;
  const ascTrop = atan2d(cdg(ramc), -(sd(ramc) * cdg(eps) + tdg(lat) * sd(eps)));
  const ascSid = rev(ascTrop - ayan);
  const ascSign = Math.floor(ascSid / 30);

  // decorate bodies
  const order = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"];
  const rows = order.map((k) => {
    const L = bodies[k].sid;
    const sign = Math.floor(L / 30);
    const nakIdx = Math.floor(L / (360 / 27));
    return {
      name: k,
      lon: L,
      sign,
      deg: L - sign * 30,
      nak: nakIdx,
      pada: Math.floor((L % (360 / 27)) / (360 / 108)) + 1,
      house: ((sign - ascSign + 12) % 12) + 1,
      retro: !!bodies[k].retro,
      kp: subLordChain(L),
    };
  });

  // panchang
  const elong = rev(bodies.Moon.sid - bodies.Sun.sid);
  const tithiNum = Math.floor(elong / 12); // 0..29
  const paksha = tithiNum < 15 ? "Shukla" : "Krishna";
  const tithiName = tithiNum % 15 === 14 ? (tithiNum < 15 ? "Purnima" : "Amavasya") : TITHIS[tithiNum % 15];
  const yogaIdx = Math.floor(rev(bodies.Sun.sid + bodies.Moon.sid) / (360 / 27));
  const weekday = ["Ravivara (Sun)", "Somavara (Mon)", "Mangalavara (Tue)", "Budhavara (Wed)", "Guruvara (Thu)", "Shukravara (Fri)", "Shanivara (Sat)"][new Date(utcMs + tz * 3600000).getUTCDay()];

  // Vimshottari dasha
  const moonL = bodies.Moon.sid;
  const nakIdx = Math.floor(moonL / (360 / 27));
  const frac = (moonL % (360 / 27)) / (360 / 27);
  const startSeq = nakIdx % 9;
  const birthMs = utcMs;
  const YEAR = 365.25 * 86400000;
  const dashas = [];
  let cursor = birthMs;
  for (let i = 0; i < 9; i++) {
    const [lord, yrs] = DASHA_SEQ[(startSeq + i) % 9];
    const span = (i === 0 ? (1 - frac) * yrs : yrs) * YEAR;
    dashas.push({ lord, yrs, start: cursor, end: cursor + span, balance: i === 0 ? (1 - frac) * yrs : yrs });
    cursor += span;
  }
  const now = Date.now();
  const current = dashas.find((dsh) => now >= dsh.start && now < dsh.end);
  let antars = [], curAntar = null, pratyantars = [], curPratya = null,
      sookshmas = [], curSookshma = null, pranas = [], curPrana = null;
  if (current) {
    // antardashas run the full lord-cycle proportionally across the FULL maha
    // period; for a partial first dasha we back-compute the notional full start.
    const fullStart = current.end - current.yrs * YEAR;
    antars = vimSub(current.lord, fullStart, current.yrs * YEAR).filter((a) => a.end > birthMs);
    curAntar = antars.find((a) => now >= a.start && now < a.end);
    if (curAntar) {
      pratyantars = vimSub(curAntar.lord, curAntar.start, curAntar.end - curAntar.start);
      curPratya = pratyantars.find((p) => now >= p.start && now < p.end);
      if (curPratya) {
        sookshmas = vimSub(curPratya.lord, curPratya.start, curPratya.end - curPratya.start);
        curSookshma = sookshmas.find((s) => now >= s.start && now < s.end);
        if (curSookshma) {
          pranas = vimSub(curSookshma.lord, curSookshma.start, curSookshma.end - curSookshma.start);
          curPrana = pranas.find((p) => now >= p.start && now < p.end);
        }
      }
    }
  }

  const signOf = {};
  rows.forEach((p) => (signOf[p.name] = p.sign));
  const av = computeAshtakavarga(signOf, ascSign);

  // Shadbala — needs sunrise/sunset for the birth date + planet speeds + tropical longitudes
  const epsB = 23.4393 - 3.563e-7 * d;
  const speedsB = {};
  ["Mars", "Mercury", "Jupiter", "Venus", "Saturn"].forEach((p) => {
    speedsB[p] = ((((trop[p] - tropPrev[p]) + 540) % 360) - 180) / 0.5;
  });
  const evB = sunEvents(y, m, day, tz, lat, lon);
  const shadbala = computeShadbala({
    rows, ascSign, ascLong: ascSid,
    sunLon: bodies.Sun.sid, moonLon: bodies.Moon.sid,
    tropLon: trop, eps: epsB, speeds: speedsB,
    birthMs: utcMs, tz, lon, rise: evB.rise, set: evB.set,
  });
  const special = computeSpecialPoints({
    asc: ascSid, sun: bodies.Sun.sid, moon: bodies.Moon.sid, rahu: bodies.Rahu.sid,
    ascSign, birthMs: utcMs, tz, lat, lon, ayan, rise: evB.rise, set: evB.set, JD,
  });
  const ramcK = rev(rev(280.46061837 + 360.98564736629 * (JD - 2451545.0)) + lon);
  const mcSid = rev(atan2d(sd(ramcK), cdg(ramcK) * cdg(23.4393 - 3.563e-7 * d)) - ayan);
  const planetLonsK = {};
  ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"].forEach((p) => (planetLonsK[p] = bodies[p].sid));
  const bhava = computeBhavaChalit(ascSid, mcSid, planetLonsK, ascSign, shadbala);

  // KP: Placidus cusps (sidereal), cuspal sub-lords, and planet placements by Placidus house
  const epsObl = 23.4393 - 3.563e-7 * d;
  const placRes = placidusCusps(ramcK, epsObl, lat);
  const kpCusps = placRes.cusps.map((c) => (c == null ? null : rev(c - ayan)));
  let kpHouseSystem = "Placidus";
  if (!placRes.ok) {
    kpHouseSystem = "Porphyry (Placidus undefined at this latitude)";
    const a1 = rev(ascSid - mcSid), a2 = rev(rev(mcSid + 180) - ascSid);
    kpCusps[10] = mcSid; kpCusps[1] = ascSid; kpCusps[4] = rev(mcSid + 180); kpCusps[7] = rev(ascSid + 180);
    kpCusps[11] = rev(mcSid + a1 / 3); kpCusps[12] = rev(mcSid + 2 * a1 / 3);
    kpCusps[2] = rev(ascSid + a2 / 3); kpCusps[3] = rev(ascSid + 2 * a2 / 3);
    kpCusps[5] = rev(kpCusps[11] + 180); kpCusps[6] = rev(kpCusps[12] + 180);
    kpCusps[8] = rev(kpCusps[2] + 180); kpCusps[9] = rev(kpCusps[3] + 180);
  }
  const cuspSubLords = kpCusps.map((c) => (c == null ? null : subLordChain(c)));
  const kpHouseOf = (L) => {
    for (let i = 1; i <= 12; i++) {
      const lo = kpCusps[i], hi = kpCusps[(i % 12) + 1];
      if (rev(L - lo) < rev(hi - lo)) return i;
    }
    return 1;
  };
  rows.forEach((p) => (p.kpHouse = kpHouseOf(p.lon)));
  const kpData = { cusps: kpCusps, cuspSubLords, houseSystem: kpHouseSystem };

  // KP significators + Ruling Planets (weekday lord by Hindu sunrise reckoning)
  let dowB = new Date(utcMs + tz * 3600000).getUTCDay();
  if (evB.rise != null && utcMs < evB.rise) dowB = (dowB + 6) % 7;
  const kpSig = computeKPSignificators(rows, kpCusps);
  const rulingPlanets = computeRulingPlanets(ascSid, bodies.Moon.sid, WEEKDAY_LORDS[dowB]);
  const yogas = detectYogas(rows, ascSign);
  const arudhas = computeArudhas(ascSign, signOf);

  // Jaimini chara karakas: the seven planets ranked by advancement within their sign
  const KARAKA_ROLES = [
    ["Atmakaraka", "the soul, life's central thread"],
    ["Amatyakaraka", "career & counsel"],
    ["Bhratrikaraka", "siblings & guru"],
    ["Matrikaraka", "mother & nurture"],
    ["Putrakaraka", "children & students"],
    ["Gnatikaraka", "kin, rivals & obstacles"],
    ["Darakaraka", "spouse & partnership"],
  ];
  const karakas = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"]
    .map((n) => rows.find((p) => p.name === n))
    .sort((a, b) => b.deg - a.deg)
    .map((p, i) => ({ role: KARAKA_ROLES[i][0], meaning: KARAKA_ROLES[i][1], planet: p.name, deg: p.deg, sign: p.sign }));

  return {
    JD, ayan, ascSid, ascSign,
    ascDeg: ascSid - ascSign * 30,
    ascNak: Math.floor(ascSid / (360 / 27)),
    rows, karakas, ak: karakas[0].planet, av, yogas, arudhas, shadbala, special, bhava, kpData, kpSig, rulingPlanets,
    panchang: { weekday, tithiName, paksha, tithiNum, yoga: YOGAS[yogaIdx], nak: NAKSHATRAS[nakIdx], karana: karanaName(elong) },
    tz,
    birthMs: utcMs,
    dashas, current, antars,
    curAntar, pratyantars, curPratya, sookshmas, curSookshma, pranas, curPrana,
    bnn: computeBNN(rows),
    moon: rows.find((r) => r.name === "Moon"),
    sun: rows.find((r) => r.name === "Sun"),
  };
}

export { computeKundli };
