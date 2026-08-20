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
/* Moonrise / moonset (UTC ms) for the local calendar day, or null if the Moon
   doesn't cross the horizon.

   PAIRING (C3-MOONSET-DRIK). Moonrise is the Moon's rise inside the local
   calendar day; moonset is the set that CLOSES that rise, which for most of the
   month falls after midnight on the NEXT civil date. Taking the first set
   inside the calendar day instead pairs the day with the PREVIOUS day's rise
   and so reports a whole lunar retardation (~45 min) early — that was the
   ~48-minute divergence from Drik on 2026-07-25 at New Delhi (01:33 reported,
   02:21 published). The ephemeris was never at fault: the set following that
   day's 16:15 rise already computed to 02:20.

   When the Moon does not rise at all on the day (roughly once a lunation) there
   is no rise to pair with, so fall back to the set inside the day rather than
   leaving the field blank — Drik shows the same. */
function moonEvents(y, m, day, tz, lat, lon, step = 300000) {
  const h0 = 0.125, DAY = 86400000;
  const start = Date.UTC(y, m - 1, day, 0, 0) - tz * 3600000, dayEnd = start + DAY;
  let rise = null, set = null, setInDay = null, prev = moonAltitude(start, lat, lon) - h0;
  // Ordinary closing sets live on the next day. At high latitude the Moon can
  // remain continuously above the horizon for many days, so keep following a
  // rise for up to half a lunation. Never fall back to a set that precedes it.
  const MAX_PAIR_SPAN = 16 * DAY;
  for (let t = step; t <= MAX_PAIR_SPAN; t += step) {
    const ms = start + t, cur = moonAltitude(ms, lat, lon) - h0;
    if (prev < 0 && cur >= 0) {
      if (rise === null && ms - step < dayEnd) rise = moonRefine(ms - step, ms, lat, lon, h0);
    } else if (prev >= 0 && cur < 0) {
      const cross = moonRefine(ms - step, ms, lat, lon, h0);
      if (rise !== null && cross > rise) { set = cross; break; }
      if (setInDay === null && cross < dayEnd) setInDay = cross;
    }
    prev = cur;
    if (ms >= dayEnd && rise === null) break; // no moonrise today — use only an in-day set
  }
  return { rise, set: rise !== null ? set : setInDay };
}

const RAHU_SEGMENT = { 0: 8, 1: 2, 2: 7, 3: 5, 4: 6, 5: 4, 6: 3 };
const YAMA_SEGMENT = { 0: 5, 1: 4, 2: 3, 3: 2, 4: 1, 5: 7, 6: 6 };
const GULIKA_SEGMENT = { 0: 7, 1: 6, 2: 5, 3: 4, 4: 3, 5: 2, 6: 1 };
const MONTHS_HINDU = ["Chaitra", "Vaishakha", "Jyeshtha", "Ashadha", "Shravana", "Bhadrapada", "Ashwina", "Kartika", "Margashirsha", "Pausha", "Magha", "Phalguna"];
/* The sixty-year (Jovian) cycle, index 0 = Prabhava. This is the Sanskrit
   romanisation. `TAMIL_YEARS_EN` in src/engine/calendar-conventions.ts is the
   SAME sixty names in the same order, spelled the Tamil way (Pramodoota,
   Durmukhi, Hevilambi, Nala …). That is a real regional difference, not a
   duplicate to be merged away — see plans/research/samvatsara-year-names.md § 5.
   validation/samvatsara-years.cjs asserts the two stay index-aligned. */
const SAMVATSARA = ["Prabhava", "Vibhava", "Shukla", "Pramoda", "Prajapati", "Angirasa", "Shrimukha", "Bhava", "Yuva", "Dhata", "Ishvara", "Bahudhanya", "Pramathi", "Vikrama", "Vrisha", "Chitrabhanu", "Svabhanu", "Tarana", "Parthiva", "Vyaya", "Sarvajit", "Sarvadhari", "Virodhi", "Vikriti", "Khara", "Nandana", "Vijaya", "Jaya", "Manmatha", "Durmukha", "Hemalamba", "Vilambi", "Vikari", "Sharvari", "Plava", "Shubhakrit", "Shobhakrit", "Krodhi", "Vishvavasu", "Parabhava", "Plavanga", "Kilaka", "Saumya", "Sadharana", "Virodhikrit", "Paridhavi", "Pramadi", "Ananda", "Rakshasa", "Anala", "Pingala", "Kalayukti", "Siddharthi", "Raudra", "Durmati", "Dundubhi", "Rudhirodgari", "Raktakshi", "Krodhana", "Akshaya"];

const jdOf = (ms) => ms / 86400000 + 2440587.5;
const AYANAMSA = {
  lahiri: { label: "Lahiri (Chitrapaksha)", offset: 0 },
  raman: { label: "Raman (B.V. Raman)", offset: -1.479 }, // Raman ≈ Lahiri − 1°28'; visibly different
  kp: { label: "KP (Krishnamurti)", offset: -0.096667 }, // KP Old = Lahiri − 5'48"
  trueChitra: { label: "True Chitrapaksha", offset: -0.0003 }, // Spica fixed at 180°; coincides with Lahiri to the arc-second
};
/* AGENTS.md invariant: Lahiri is THE convention. A caller that wants anything
   else must say so ON THE CALL — the mode is a parameter, never a handshake.
   `AYAN_MODE` used to be a module-global that `computeKundli` wrote and never
   restored, so one reader casting a Raman chart silently shifted the free
   Panchang by 1.479° for everyone else in the session (bug-bash F8,
   2026-08-18). Every caster now threads its own mode; the ambient survives only
   as the Lahiri default for readers that pass nothing. */
const AYAN_DEFAULT = "lahiri";
let AYAN_MODE = AYAN_DEFAULT;
function ayanOffset(mode) {
  const key = mode || AYAN_MODE;
  const entry = AYANAMSA[key];
  if (!entry) throw new Error(`unknown ayanamsa: ${key}`);
  return entry.offset;
}
const ayanAt = (JD, mode?) => 23.853 + 0.0139651 * ((JD - 2451545.0) / 365.25) + ayanOffset(mode);
const sunSidMs = (ms, mode?) => { const JD = jdOf(ms); return rev(sunPos(JD - 2451543.5).lon - ayanAt(JD, mode)); };
const moonSidMs = (ms, mode?) => { const JD = jdOf(ms); return rev(moonLon(JD - 2451543.5) - ayanAt(JD, mode)); };
const elongMs = (ms, mode?) => rev(moonSidMs(ms, mode) - sunSidMs(ms, mode));
const lunYogaMs = (ms, mode?) => rev(moonSidMs(ms, mode) + sunSidMs(ms, mode));
const planetSidMs = (name, ms, mode?) => {
  const JD = jdOf(ms), d = JD - 2451543.5, ay = ayanAt(JD, mode);
  if (name === "Sun") return rev(sunPos(d).lon - ay);
  if (name === "Moon") return rev(moonLon(d) - ay);
  if (name === "Rahu") return rev(125.1228 - 0.0529538083 * d - ay);
  if (name === "Ketu") return rev(125.1228 - 0.0529538083 * d - ay + 180);
  return rev(planetGeoLon(name, d) - ay);
};
/* The supported way to work in a non-default ayanamsa: bind the accessors once
   and pass the bound set down. Nothing global moves, so a chart cast on Raman
   cannot reach anybody else's Panchang, and callbacks (solveCross et al.) can be
   handed `S.moonSidMs` directly. */
function sidereal(mode?) {
  const m = mode || AYAN_DEFAULT;
  ayanOffset(m); // fail loudly, at the boundary, on an unknown mode
  return {
    mode: m,
    ayanAt: (JD) => ayanAt(JD, m),
    sunSidMs: (ms) => sunSidMs(ms, m),
    moonSidMs: (ms) => moonSidMs(ms, m),
    elongMs: (ms) => elongMs(ms, m),
    lunYogaMs: (ms) => lunYogaMs(ms, m),
    planetSidMs: (name, ms) => planetSidMs(name, ms, m),
  };
}

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
   amantaMonthIdx once per scanned day, which used to recompute the window every time.

   ADHIKA MASA — SAMPLE THE MONTH'S REAL BOUNDS, NOT A GUESSED OFFSET (2026-08-18).
   The month runs new moon → new moon and is Adhika when NO solar sankranti (entry
   into the next sidereal rasi) falls inside it. This used to be decided by reading
   the Sun's sign one hour INSIDE each end — `sunSidMs(prevNM + 3600000)` and
   `sunSidMs(nextNM - 3600000)` — which blinds the test to any ingress in those two
   one-hour slivers. Mesha Sankranti 2029 lands at 14 Apr 03:41 IST, 31 minutes after
   the new moon at 03:10 IST: the probe skipped past it, the lunation looked
   sankranti-free, and the engine reported Adhika Chaitra immediately followed by
   Adhika Vaishakha — two intercalary months back to back, which cannot happen. Over
   1900-2100 the shortcut invented four impossible months (1907, 1926, 2029, 2045)
   and, because `adhik` shifts the month index, moved every festival keyed to a lunar
   month in those years. Published references put exactly one Adhika Masa in 2029,
   starting 16 March (prokerala.com/festivals/adhik-masam.html, fetched 2026-08-18).

   BOUNDARY CONVENTION — the month owns [prevNM, nextNM), half-open:
   - A sankranti at exactly the new-moon instant belongs to the month that OPENS
     there, not the one that closes. So `sStart` is read AT `prevNM`, after any
     ingress at that instant, which puts it inside this month.
   - A sankranti in the final minutes before the next new moon still belongs to THIS
     month. So `sEnd` is read at `nextNM - 1` ms, the last instant this month owns.
     (Real case: Dhanu Sankranti 1963-12-16 06:47 IST, 48 minutes before the new moon
     at 07:35 — the old probe missed it, the new bound catches it.)
   The Sun never retrogrades, so `sStart !== sEnd` is exactly "at least one sankranti
   instant lies in [prevNM, nextNM)"; validation/adhik-masa.cjs re-derives the actual
   ingress instants independently and asserts the two agree.

   NOT HANDLED — Kshaya Masa. A lunar month can rarely contain TWO sankrantis
   (`sEnd - sStart === 2`), which decays a month name out of the calendar; it happens
   only around Kartika/Margashirsha/Pausha and only twice in 1900-2100 (Nov 1963,
   Jan 1983). Ganak has no compound "Margashirsha-Pausha" name for it; the month
   takes `sEnd`, so the earlier name is the one that drops out. Left as-is
   deliberately — see plans/research/adhik-masa-detection.md § 6. */
let _lmCache = null;
function ensureLmWindow(nowMs) {
  if (!_lmCache || _lmCache.ayan !== AYAN_MODE || nowMs < _lmCache.prevNM || nowMs >= _lmCache.nextNM) {
    const prevNM = lastNewMoonBefore(nowMs);
    const nextNM = solveCross(elongMs, prevNM + 86400000, 0, 34);
    const sStart = Math.floor(sunSidMs(prevNM) / 30);
    const sEnd = Math.floor(sunSidMs(nextNM - 1) / 30);
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

/* BARHASPATYA (JOVIAN) SAMVATSARA — the northern reckoning, which EXPUNGES.
   A Jovian year is ~361.03 days, about 4.23 days SHORT of a solar year, so the
   cycle creeps forward and roughly every 85 solar years one samvatsara begins
   and ends inside a single solar year and is expunged (kshaya) — Sewell &
   Dikshit, *The Indian Calendar* (1896), Arts. 54-55. That is why the northern
   name cannot be a fixed offset from the year number: Art. 62 records the
   northern count as 12 ahead of the southern in 1896, and it is 13 today and 14
   from 2028. Full sourcing: plans/research/samvatsara-year-names.md.

   Constants: period and epoch are a least-squares fit to the 191 published
   Barhaspatya boundary instants Drik Panchang prints for New Delhi over
   1900-2090 (fetched 2026-08-19; residuals under 1.5 h, no missing or extra
   boundary). Epoch = the start of #47 Pramadi, 1900-10-08 12:36 IST, expressed
   in UT to match `jdOf`. The Surya-Siddhanta's own 361.026721 d differs by
   0.0056 d/yr and places the expunctions ten years earlier; see the note § 3.4.
   Reproduced exactly, 1900-2100, by validation/samvatsara-years.cjs. */
const JOVIAN_YEAR_DAYS = 361.032279;
const JOVIAN_EPOCH_JD = 2415300.813243;
const JOVIAN_EPOCH_IDX = 46;
const jovianSamvatsara = (ms) =>
  (((JOVIAN_EPOCH_IDX + Math.floor((jdOf(ms) - JOVIAN_EPOCH_JD) / JOVIAN_YEAR_DAYS)) % 60) + 60) % 60;

/* Three era years, three DIFFERENT sixty-cycle names on the same day — verified
   correct, not a bug. They are three separate reckonings that roll on three
   different days and, in the northern case, follow a different rule entirely:

   - Shaka: southern LUNI-SOLAR cycle, no expunction since Saka 828/831 (~906-909
     CE). Sewell & Dikshit Art. 62 gives the rule as "add 11 to the current Saka
     year, and divide by 60" counting Prabhava as 1; `shaka` here is the expired
     year panchangs print, so the 0-based index is (shaka + 11) % 60. Rolls at
     Chaitra Shukla 1.
   - Vikram: northern BARHASPATYA cycle. Art. 55 — the samvatsara current at the
     start of the solar year is coupled with all its days — so it is read at that
     year's Mesha sankranti, NOT at Chaitra and NOT "now".
   - Gujarati: Kartikadi (Bestu Varas) era with its own non-expunging cyclic
     count, (guj + 8) % 60. Rolls at Kartika Shukla 1, so for ~5 months a year
     its number is one BEHIND Vikram's. Verified against Drik Panchang 1900-2100
     and hinducalculator.com; the derivation of the +8 is not independently
     sourced — note § 4, confidence MEDIUM. */
function samvatInfo(nowMs, gy) {
  const mesha = solveCross(sunSidMs, Date.UTC(gy, 2, 18), 0, 45);
  const chaitraNY = lastNewMoonBefore(mesha);
  const started = nowMs >= chaitraNY;
  const base = started ? gy : gy - 1;
  const shaka = base - 78, vikram = base + 57;
  /* Jan 1 to Chaitra we are still inside the PREVIOUS Vikram year, whose solar
     year opened at the previous Mesha sankranti. */
  const vikramMesha = started ? mesha : solveCross(sunSidMs, Date.UTC(gy - 1, 2, 18), 0, 45);
  const vrish = solveCross(sunSidMs, Date.UTC(gy, 9, 18), 210, 45);
  const gujNY = lastNewMoonBefore(vrish);
  const guj = nowMs >= gujNY ? gy + 57 : gy + 56;
  return {
    shaka: `${shaka} ${SAMVATSARA[(shaka + 11) % 60]}`,
    vikram: `${vikram} ${SAMVATSARA[jovianSamvatsara(vikramMesha)]}`,
    guj: `${guj} ${SAMVATSARA[(guj + 8) % 60]}`,
  };
}

/* upcoming sankranti, lunations, planetary sign changes and stations */
function upcomingEvents(fromMs, days = 75) {
  const ev = [];
  const ss = sunSidMs(fromMs);
  const nextSign = (Math.floor(ss / 30) + 1) % 12;
  const tS = solveCross(sunSidMs, fromMs, (nextSign * 30) % 360, 40);
  if (tS) ev.push({ t: tS, label: `Sun enters ${SIGNS[nextSign].split(" ")[0]} · Sankranti`, planet: "Sun", type: "sign" });
  const tP = solveCross(elongMs, fromMs, 180, 32);
  if (tP) ev.push({ t: tP, label: "Purnima", planet: "Moon", type: "lunation" });
  const tA = solveCross(elongMs, fromMs, 0, 32);
  if (tA) ev.push({ t: tA, label: "Amavasya", planet: "Moon", type: "lunation" });
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
        ev.push({ t: hi, label: `${p} enters ${SIGNS[sg].split(" ")[0]}`, planet: p, type: "sign" });
        prevSign = sg;
      }
      const v = speed(t);
      if (v * pv < 0) {
        let lo = t - 86400000, hi = t;
        for (let k = 0; k < 18; k++) { const mid = (lo + hi) / 2; if (speed(mid) * pv > 0) lo = mid; else hi = mid; }
        ev.push({ t: hi, label: `${p} turns ${v < 0 ? "retrograde ℞" : "direct"}`, planet: p, type: "station" });
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


/* ---- timezone offset resolution -------------------------------------------
   `zoneOffset` answers "what UTC offset, in hours, does this IANA zone have?"
   for a moment expressed as a LOCAL WALL CLOCK (y, m, d, hh, mi).

   It used to resolve the offset at `Date.UTC(y, m-1, d, 12)` — noon UTC on the
   given date — which is a different instant from the one the caller means. On a
   DST-transition day that lands on the wrong side of the transition, so a birth
   at 00:30 on a spring-forward morning was computed with the after-the-change
   offset. Measured over 110,684 births in 7 DST cities, 1960-2026, that put 275
   births an hour out and printed a different ascendant for 131 of them
   (`plans/audits/2026-08-18-bugbash-utility-calculators.md`, finding F1).
   Noon UTC also lands on the WRONG LOCAL DATE for far-eastern zones — for
   Pacific/Auckland (+13) it is 01:00 the next local day — so a whole Auckland or
   Sydney day could take the neighbouring day's offset.

   A wall clock is genuinely circular: converting it to an instant needs the
   offset, and the offset is defined on instants. So we generate the candidate
   offsets in force around the target and keep the ones that are self-consistent:
   an offset `o` is valid for wall clock W iff the zone really is at `o` at the
   instant `W - o`.

   Two wall clocks are pathological, and this code picks a side deliberately:

   * SKIPPED HOUR (spring forward) — e.g. America/New_York 2024-03-10 02:30,
     a wall clock that never existed. No candidate is self-consistent.
     CONVENTION: use the offset in force BEFORE the change (the smaller one).
     That maps the missing time forward by the size of the gap (02:30 becomes
     the real instant 07:30 UTC = 03:30 EDT). This is what java.time
     `ZonedDateTime`, moment-timezone and Temporal ("compatible" disambiguation)
     all do, and it is the only choice that keeps later wall clocks mapping to
     later instants. A birth certificate showing a skipped time is a recording
     error; shifting forward keeps the record and the chart in the same order.

   * REPEATED HOUR (autumn fall back) — e.g. America/New_York 2024-11-03 01:30,
     a wall clock that happens twice. Two candidates are self-consistent.
     CONVENTION: use the offset in force BEFORE the change (the larger one),
     i.e. the FIRST of the two passes. Same default as java.time, Python's
     `fold=0`, moment-timezone and Temporal "compatible". It is also the
     likelier reading of a birth record: the clocks had not been turned back
     yet when the time was written down. The second pass is unreachable through
     this function; a caller that needs it must pass the UTC instant instead.

   Callers that pass only (zone, y, m, d) get the offset at LOCAL NOON on that
   date — the representative offset of that civil day, which is what the
   panchang day engines want. Callers that know a clock time (births) should
   pass `hh, mi` so the birth instant, not midday, decides.                    */

const ZONE_FMT = new Map();
function zoneFmt(zone) {
  let f = ZONE_FMT.get(zone);
  if (f === undefined) {
    try { f = new Intl.DateTimeFormat("en-US", { timeZone: zone, timeZoneName: "longOffset" }); }
    catch { f = null; }
    ZONE_FMT.set(zone, f);
  }
  return f;
}

/* UTC offset (hours) of an IANA zone at a real UTC instant. null = unknown zone. */
function zoneOffsetAt(zone, utcMs) {
  const f = zoneFmt(zone);
  if (!f) return null;
  try {
    const parts = f.formatToParts(new Date(utcMs));
    const v = (parts.find((p) => p.type === "timeZoneName") || {}).value || "";
    if (v === "GMT" || v === "UTC") return 0;
    const mch = v.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/);
    if (!mch) return null;
    return (mch[1] === "-" ? -1 : 1) * (parseInt(mch[2], 10) + (mch[3] ? parseInt(mch[3], 10) / 60 : 0));
  } catch {
    return null;
  }
}

/* UTC offset (hours) of an IANA zone at a local wall clock — handles historical
   DST, half-hour and quarter-hour zones. See the conventions note above. */
function zoneOffset(zone, y, m, d, hh = 12, mi = 0) {
  const H = 3600000;
  const naive = Date.UTC(y, m - 1, d, hh, mi);   // the wall clock read as if it were UTC
  const seed = zoneOffsetAt(zone, naive);
  if (seed == null) return null;
  /* The true instant is within 14h of `naive` (no zone is further from UTC than
     that), so probing +/-18h brackets any transition that can affect it, and no
     zone has ever changed offset twice inside 36 hours. */
  const cands = [];
  for (const probe of [seed, zoneOffsetAt(zone, naive - 18 * H), zoneOffsetAt(zone, naive + 18 * H)]) {
    if (probe != null && !cands.includes(probe)) cands.push(probe);
  }
  const valid = cands.filter((o) => zoneOffsetAt(zone, naive - o * H) === o);
  if (valid.length === 1) return valid[0];
  if (valid.length > 1) return Math.max(...valid);   // repeated hour -> first pass (see above)
  return Math.min(...cands);                          // skipped hour -> pre-change offset (see above)
}

/* LEGACY ambient setter. Kept only for `today-panchang.ts`, the last module that
   still sets the mode and then reads bare accessors. Everything else threads the
   mode explicitly via `sidereal(mode)` or the trailing `mode` argument — see the
   AYANAMSA block above and plans/audits/2026-08-18-ayanamsa-leak-fix.md.
   DO NOT add new call sites: validation/chart-styles-ayanamsha.cjs fails the
   build if one appears. */
function setAyanMode(ayanamsa) {
  ayanOffset(ayanamsa || AYAN_DEFAULT); // reject an unknown mode at the setter, not 40 frames later
  AYAN_MODE = ayanamsa || AYAN_DEFAULT;
}

// Vimshottari dasha lord sequence -- moved from the shell (SPLIT-UI-03d).
const VIM_LORDS = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"];

// Sign lords (zodiac rulers) — shared by chart, hora and muhurat code.
const SIGN_LORD = ["Mars", "Venus", "Mercury", "Moon", "Sun", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Saturn", "Jupiter"];

export {
  SIGN_LORD, VIM_LORDS,
  SIGNS, NAKSHATRAS, YOGAS, TITHIS, KARANAS_MOV, karanaName,
  sunEvents, moonEvents, RAHU_SEGMENT, YAMA_SEGMENT, GULIKA_SEGMENT,
  setAyanMode, sidereal, ayanAt, sunSidMs, moonSidMs, elongMs, lunYogaMs, planetSidMs,
  jdOf, AYANAMSA, AYAN_DEFAULT,
  solveCross, lunarMonthInfo, samvatInfo, upcomingEvents, choghaSlots,
  amantaMonthIdx, pitruPakshaDay, zoneOffset,
};
