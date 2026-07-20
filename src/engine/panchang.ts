import {
  D2R, rev, sd, cdg, atan2d, moonGeo, jdeFromD, sunPos, moonLon, planetGeoLon,
} from "./ephemeris";

const SIGNS = ["Mesha (Aries)", "Vrishabha (Taurus)", "Mithuna (Gemini)", "Karka (Cancer)", "Simha (Leo)", "Kanya (Virgo)", "Tula (Libra)", "Vrishchika (Scorpio)", "Dhanu (Sagittarius)", "Makara (Capricorn)", "Kumbha (Aquarius)", "Meena (Pisces)"];

const NAKSHATRAS = ["Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha", "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"];


const YOGAS = ["Vishkambha", "Priti", "Ayushman", "Saubhagya", "Shobhana", "Atiganda", "Sukarma", "Dhriti", "Shula", "Ganda", "Vriddhi", "Dhruva", "Vyaghata", "Harshana", "Vajra", "Siddhi", "Vyatipata", "Variyana", "Parigha", "Shiva", "Siddha", "Sadhya", "Shubha", "Shukla", "Brahma", "Indra", "Vaidhriti"];

const TITHIS = ["Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami", "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi"];

const KARANAS_MOV = ["Bava", "Balava", "Kaulava", "Taitila", "Gara", "Vanija", "Vishti"];
function karanaName(elong) {
  const k = Math.floor(((elong % 360) + 360) % 360 / 6);
  if (k === 0) return "Kimstughna";
  if (k >= 57) return ["Shakuni", "Chatushpada", "Naga"][k - 57];
  return KARANAS_MOV[(k - 1) % 7];
}


const PLANET_DEVA = { Sun: "सूर्य", Moon: "चन्द्र", Mars: "मंगल", Mercury: "बुध", Jupiter: "गुरु", Venus: "शुक्र", Saturn: "शनि", Rahu: "राहु", Ketu: "केतु" };

/* ---------------- solar events & detailed (Drik-style) panchang ---------------- */
function sunEvents(y, m, day, tz, lat, lon) {
  let ms = Date.UTC(y, m - 1, day, 12, 0) - tz * 3600000;
  for (let i = 0; i < 3; i++) {
    const JD = ms / 86400000 + 2440587.5;
    const d = JD - 2451543.5;
    const sn = sunPos(d);
    const eps = 23.4393 - 3.563e-7 * d;
    const RA = atan2d(cdg(eps) * sd(sn.lon), cdg(sn.lon));
    const gmst = rev(280.46061837 + 360.98564736629 * (JD - 2451545));
    let H = rev(gmst + lon - RA);
    if (H > 180) H -= 360;
    ms -= (H / 360.9856) * 86400000;
  }
  const JD = ms / 86400000 + 2440587.5;
  const d = JD - 2451543.5;
  const sn = sunPos(d);
  const eps = 23.4393 - 3.563e-7 * d;
  const dec = Math.asin(sd(eps) * sd(sn.lon)) / D2R;
  const cosH0 = (sd(-0.833) - sd(lat) * sd(dec)) / (cdg(lat) * cdg(dec));
  if (cosH0 < -1 || cosH0 > 1) return { transit: ms, rise: null, set: null };
  const H0 = Math.acos(cosH0) / D2R;
  return { transit: ms, rise: ms - (H0 / 15) * 3600000, set: ms + (H0 / 15) * 3600000 };
}

/* Moon altitude (deg) at UTC ms for observer lat/lon (deg) — uses Moon's true ecliptic latitude */
function moonAltitude(ms, latDeg, lonDeg) {
  const JD = ms / 86400000 + 2440587.5, d = JD - 2451543.5;
  const mg = moonGeo(jdeFromD(d));
  const eps = (23.4393 - 3.563e-7 * d) * D2R, lam = mg.lon * D2R, bet = mg.lat * D2R;
  const dec = Math.asin(Math.sin(bet) * Math.cos(eps) + Math.cos(bet) * Math.sin(eps) * Math.sin(lam));
  const ra = Math.atan2(Math.sin(lam) * Math.cos(eps) - Math.tan(bet) * Math.sin(eps), Math.cos(lam));
  const gmst = rev(280.46061837 + 360.98564736629 * (JD - 2451545)) * D2R;
  const H = gmst + lonDeg * D2R - ra, lat = latDeg * D2R;
  return Math.asin(Math.sin(lat) * Math.sin(dec) + Math.cos(lat) * Math.cos(dec) * Math.cos(H)) / D2R;
}
function moonRefine(a, b, lat, lon, h0) {
  for (let i = 0; i < 25; i++) { const mid = (a + b) / 2, fa = moonAltitude(a, lat, lon) - h0, fm = moonAltitude(mid, lat, lon) - h0; if ((fa < 0) === (fm < 0)) a = mid; else b = mid; }
  return (a + b) / 2;
}
/* Moonrise / moonset (UTC ms) for the local calendar day, or null if the Moon doesn't cross the horizon */
function moonEvents(y, m, day, tz, lat, lon, step = 300000) {
  const h0 = 0.125, DAY = 86400000;
  const start = Date.UTC(y, m - 1, day, 0, 0) - tz * 3600000;
  let rise = null, set = null, prev = moonAltitude(start, lat, lon) - h0;
  for (let t = step; t <= DAY; t += step) {
    const ms = start + t, cur = moonAltitude(ms, lat, lon) - h0;
    if (prev < 0 && cur >= 0 && rise === null) rise = moonRefine(ms - step, ms, lat, lon, h0);
    if (prev >= 0 && cur < 0 && set === null) set = moonRefine(ms - step, ms, lat, lon, h0);
    prev = cur;
    if (rise !== null && set !== null) break;
  }
  return { rise, set };
}

const RAHU_SEGMENT = { 0: 8, 1: 2, 2: 7, 3: 5, 4: 6, 5: 4, 6: 3 };
const YAMA_SEGMENT = { 0: 5, 1: 4, 2: 3, 3: 2, 4: 1, 5: 7, 6: 6 };
const GULIKA_SEGMENT = { 0: 7, 1: 6, 2: 5, 3: 4, 4: 3, 5: 2, 6: 1 };
const MONTHS_HINDU = ["Chaitra", "Vaishakha", "Jyeshtha", "Ashadha", "Shravana", "Bhadrapada", "Ashwina", "Kartika", "Margashirsha", "Pausha", "Magha", "Phalguna"];
const SAMVATSARA = ["Prabhava", "Vibhava", "Shukla", "Pramoda", "Prajapati", "Angirasa", "Shrimukha", "Bhava", "Yuva", "Dhata", "Ishvara", "Bahudhanya", "Pramathi", "Vikrama", "Vrisha", "Chitrabhanu", "Svabhanu", "Tarana", "Parthiva", "Vyaya", "Sarvajit", "Sarvadhari", "Virodhi", "Vikriti", "Khara", "Nandana", "Vijaya", "Jaya", "Manmatha", "Durmukha", "Hemalamba", "Vilambi", "Vikari", "Sharvari", "Plava", "Shubhakrit", "Shobhakrit", "Krodhi", "Vishvavasu", "Parabhava", "Plavanga", "Kilaka", "Saumya", "Sadharana", "Virodhikrit", "Paridhavi", "Pramadi", "Ananda", "Rakshasa", "Anala", "Pingala", "Kalayukti", "Siddharthi", "Raudra", "Durmati", "Dundubhi", "Rudhirodgari", "Raktakshi", "Krodhana", "Akshaya"];

const jdOf = (ms) => ms / 86400000 + 2440587.5;
const AYANAMSA = {
  lahiri: { label: "Lahiri (Chitrapaksha)", offset: 0 },
  kp: { label: "KP (Krishnamurti)", offset: -0.096667 }, // KP Old = Lahiri − 5'48"
};
let AYAN_MODE = "lahiri";
const ayanAt = (JD) => 23.853 + 0.0139651 * ((JD - 2451545.0) / 365.25) + AYANAMSA[AYAN_MODE].offset;
const sunSidMs = (ms) => { const JD = jdOf(ms); return rev(sunPos(JD - 2451543.5).lon - ayanAt(JD)); };
const moonSidMs = (ms) => { const JD = jdOf(ms); return rev(moonLon(JD - 2451543.5) - ayanAt(JD)); };
const elongMs = (ms) => rev(moonSidMs(ms) - sunSidMs(ms));
const lunYogaMs = (ms) => rev(moonSidMs(ms) + sunSidMs(ms));
const planetSidMs = (name, ms) => {
  const JD = jdOf(ms), d = JD - 2451543.5, ay = ayanAt(JD);
  if (name === "Sun") return rev(sunPos(d).lon - ay);
  if (name === "Moon") return rev(moonLon(d) - ay);
  if (name === "Rahu") return rev(125.1228 - 0.0529538083 * d - ay);
  if (name === "Ketu") return rev(125.1228 - 0.0529538083 * d - ay + 180);
  return rev(planetGeoLon(name, d) - ay);
};

/* first time after startMs that fn (slowly increasing mod 360) crosses targetDeg */
function solveCross(fn, startMs, targetDeg, maxDays) {
  const step = 3600000;
  let t = startMs;
  let prevRem = rev(targetDeg - fn(t));
  for (let i = 0; i < maxDays * 24; i++) {
    const t1 = t + step;
    const rem = rev(targetDeg - fn(t1));
    if (rem > prevRem + 180) {
      let lo = t, hi = t1;
      for (let k = 0; k < 26; k++) {
        const mid = (lo + hi) / 2;
        if (rev(targetDeg - fn(mid)) > 180) hi = mid; else lo = mid;
      }
      return (lo + hi) / 2;
    }
    prevRem = rem;
    t = t1;
  }
  return null;
}

function lastNewMoonBefore(t) {
  let start = t - 32 * 86400000, last = null;
  for (let g = 0; g < 3; g++) {
    const c = solveCross(elongMs, start, 0, 34);
    if (!c || c >= t) break;
    last = c;
    start = c + 86400000;
  }
  return last;
}

/* amanta lunar month bounding nowMs; Adhik when no sankranti falls inside it.
   The new-moon window search is expensive, so the last window is cached — day-by-day
   scans (muhurat finder, festival calendar) hit the same lunation ~29 days in a row.
   Cache is keyed on the window AND the active ayanamsa (sun-sign edges shift with
   AYAN_MODE; the new-moon instants themselves cancel it out).
   Both `lunarMonthInfo` and `amantaMonthIdx` share this cache — festivals.ts calls
   amantaMonthIdx once per scanned day, which used to recompute the window every time. */
let _lmCache = null;
function ensureLmWindow(nowMs) {
  if (!_lmCache || _lmCache.ayan !== AYAN_MODE || nowMs < _lmCache.prevNM || nowMs >= _lmCache.nextNM) {
    const prevNM = lastNewMoonBefore(nowMs);
    const nextNM = solveCross(elongMs, prevNM + 86400000, 0, 34);
    const sStart = Math.floor(sunSidMs(prevNM + 3600000) / 30);
    const sEnd = Math.floor(sunSidMs(nextNM - 3600000) / 30);
    _lmCache = { ayan: AYAN_MODE, prevNM, nextNM, sStart, sEnd };
  }
  return _lmCache;
}
function lunarMonthInfo(nowMs, isKrishna) {
  const w = ensureLmWindow(nowMs);
  const adhik = w.sStart === w.sEnd;
  const nameIdx = adhik ? (w.sStart + 1) % 12 : w.sEnd;
  const amanta = MONTHS_HINDU[nameIdx] + (adhik ? " (Adhik)" : "");
  const purnimanta = isKrishna && !adhik ? MONTHS_HINDU[(nameIdx + 1) % 12] : amanta;
  return { amanta, purnimanta, idx: nameIdx, adhik };
}

function samvatInfo(nowMs, gy) {
  const mesha = solveCross(sunSidMs, Date.UTC(gy, 2, 18), 0, 45);
  const chaitraNY = lastNewMoonBefore(mesha);
  const base = nowMs >= chaitraNY ? gy : gy - 1;
  const shaka = base - 78, vikram = base + 57;
  const vrish = solveCross(sunSidMs, Date.UTC(gy, 9, 18), 210, 45);
  const gujNY = lastNewMoonBefore(vrish);
  const guj = nowMs >= gujNY ? gy + 57 : gy + 56;
  return {
    shaka: `${shaka} ${SAMVATSARA[(shaka + 11) % 60]}`,
    vikram: `${vikram} ${SAMVATSARA[(vikram + 9) % 60]}`,
    guj: `${guj} ${SAMVATSARA[(guj + 8) % 60]}`,
  };
}

/* upcoming sankranti, lunations, planetary sign changes and stations */
function upcomingEvents(fromMs, days = 75) {
  const ev = [];
  const ss = sunSidMs(fromMs);
  const nextSign = (Math.floor(ss / 30) + 1) % 12;
  const tS = solveCross(sunSidMs, fromMs, (nextSign * 30) % 360, 40);
  if (tS) ev.push({ t: tS, label: `Surya enters ${SIGNS[nextSign].split(" ")[0]} · Sankranti`, planet: "Sun", type: "sign" });
  const tP = solveCross(elongMs, fromMs, 180, 32);
  if (tP) ev.push({ t: tP, label: "Purnima — full moon", planet: "Moon", type: "lunation" });
  const tA = solveCross(elongMs, fromMs, 0, 32);
  if (tA) ev.push({ t: tA, label: "Amavasya — new moon", planet: "Moon", type: "lunation" });
  for (const p of ["Mars", "Mercury", "Jupiter", "Venus", "Saturn"]) {
    const f = (ms) => planetSidMs(p, ms);
    let prevSign = Math.floor(f(fromMs) / 30);
    const speed = (ms) => ((f(ms + 43200000) - f(ms - 43200000) + 540) % 360) - 180;
    let pv = speed(fromMs);
    for (let dd = 1; dd <= days; dd++) {
      const t = fromMs + dd * 86400000;
      const sg = Math.floor(f(t) / 30);
      if (sg !== prevSign) {
        let lo = t - 86400000, hi = t;
        for (let k = 0; k < 18; k++) { const mid = (lo + hi) / 2; if (Math.floor(f(mid) / 30) === prevSign) lo = mid; else hi = mid; }
        ev.push({ t: hi, label: `${PLANET_DEVA[p]} ${p} enters ${SIGNS[sg].split(" ")[0]}`, planet: p, type: "sign" });
        prevSign = sg;
      }
      const v = speed(t);
      if (v * pv < 0) {
        let lo = t - 86400000, hi = t;
        for (let k = 0; k < 18; k++) { const mid = (lo + hi) / 2; if (speed(mid) * pv > 0) lo = mid; else hi = mid; }
        ev.push({ t: hi, label: `${PLANET_DEVA[p]} ${p} turns ${v < 0 ? "retrograde ℞" : "direct"}`, planet: p, type: "station" });
      }
      pv = v;
    }
  }
  return ev.filter((e) => e.t && e.t > fromMs).sort((a, b) => a.t - b.t).slice(0, 9);
}

/* ---------------- Choghadiya + festival/fasting calendar (panchang extension) ---------------- */
const CHOG_TYPES = [
  { key:"udveg", nat:"bad",     lord:"Sun" },
  { key:"char",  nat:"neutral", lord:"Venus" },
  { key:"labh",  nat:"good",    lord:"Mercury" },
  { key:"amrit", nat:"good",    lord:"Moon" },
  { key:"kaal",  nat:"bad",     lord:"Saturn" },
  { key:"shubh", nat:"good",    lord:"Jupiter" },
  { key:"rog",   nat:"bad",     lord:"Mars" },
];
function choghaSlots(weekday, startMs, endMs, isDay) {
  const dayStart = (weekday * 3) % 7;
  const start = isDay ? dayStart : (dayStart + 5) % 7;
  const seg = (endMs - startMs) / 8, out = [];
  for (let i = 0; i < 8; i++) { const c = CHOG_TYPES[(start + i) % 7]; out.push({ ...c, start: startMs + i * seg, end: startMs + (i + 1) * seg }); }
  return out;
}
function amantaMonthIdx(ms) {
  const w = ensureLmWindow(ms);
  const adhik = w.sStart === w.sEnd;
  return { idx: adhik ? (w.sStart + 1) % 12 : w.sEnd, adhik };
}
/* Pitru Paksha (Shraddha Paksha): Bhadrapada Purnima → Mahalaya (Sarva Pitru)
   Amavasya — the amanta Bhadrapada (idx 5) Purnima + its Krishna fortnight.
   Shraddha is an aparahna rite (the 4th of five equal daytime parts), so the
   day's shraddha tithi is taken at aparahna, not at sunrise. Given a day's
   sunrise/sunset ms, returns { shraddhaTithi, krishna, special } or null.
   Verified vs Drik: 2026 period = 27 Sep → 10 Oct (validation/content-dates.cjs). */
function pitruPakshaDay(rise, set) {
  const apMid = rise + 0.7 * (set - rise);           // midpoint of the aparahna (4th) part
  if (amantaMonthIdx(apMid).idx !== 5) return null;  // amanta Bhadrapada only
  const tnA = Math.floor(rev(moonSidMs(apMid) - sunSidMs(apMid)) / 12);
  const shraddhaTithi = (tnA % 15) + 1, krishna = tnA >= 15;
  if (!krishna && shraddhaTithi !== 15) return null; // Bhadrapada Shukla before Purnima = not yet Pitru Paksha
  let special = null;
  if (krishna && shraddhaTithi === 15) special = "mahalaya";        // Sarva Pitru Amavasya (last day)
  else if (!krishna && shraddhaTithi === 15) special = "purnimaShraddha"; // first day
  else if (krishna && shraddhaTithi === 9) special = "avidhavaNavami";    // for departed married women
  else if (krishna && shraddhaTithi === 14) special = "ghataChaturdashi"; // for those who died unnaturally
  return { shraddhaTithi, krishna, special };
}


/* UTC offset (hours) of an IANA zone on the birth date — handles historical DST */
function zoneOffset(zone, y, m, d) {
  try {
    const dt = new Date(Date.UTC(y, m - 1, d, 12));
    const parts = new Intl.DateTimeFormat("en-US", { timeZone: zone, timeZoneName: "longOffset" }).formatToParts(dt);
    const v = (parts.find((p) => p.type === "timeZoneName") || {}).value || "";
    if (v === "GMT" || v === "UTC") return 0;
    const mch = v.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/);
    if (!mch) return null;
    return (mch[1] === "-" ? -1 : 1) * (parseInt(mch[2], 10) + (mch[3] ? parseInt(mch[3], 10) / 60 : 0));
  } catch {
    return null;
  }
}

function setAyanMode(ayanamsa) {
  AYAN_MODE = ayanamsa;
}

// Vimshottari dasha lord sequence -- moved from the shell (SPLIT-UI-03d).
const VIM_LORDS = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"];

// Sign lords (zodiac rulers) — shared by chart, hora and muhurat code.
const SIGN_LORD = ["Mars", "Venus", "Mercury", "Moon", "Sun", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Saturn", "Jupiter"];

export {
  SIGN_LORD, VIM_LORDS,
  SIGNS, NAKSHATRAS, YOGAS, TITHIS, KARANAS_MOV, karanaName, PLANET_DEVA,
  sunEvents, moonEvents, RAHU_SEGMENT, YAMA_SEGMENT, GULIKA_SEGMENT,
  setAyanMode, ayanAt, sunSidMs, moonSidMs, elongMs, lunYogaMs, planetSidMs,
  jdOf, AYANAMSA,
  solveCross, lunarMonthInfo, samvatInfo, upcomingEvents, choghaSlots,
  amantaMonthIdx, pitruPakshaDay, zoneOffset,
};
