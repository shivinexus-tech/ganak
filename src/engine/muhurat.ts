import { rev } from "./ephemeris";
import {
  NAKSHATRAS, KARANAS_MOV, sunEvents, moonEvents,
  RAHU_SEGMENT, YAMA_SEGMENT, GULIKA_SEGMENT, setAyanMode,
  sunSidMs, moonSidMs, elongMs, planetSidMs, solveCross,
  lunarMonthInfo, choghaSlots, pitruPakshaDay, zoneOffset,
} from "./panchang";
import { ayyappaMandalaFor } from "./festivals";

const NAK_HI = ['अश्विनी','भरणी','कृत्तिका','रोहिणी','मृगशिरा','आर्द्रा','पुनर्वसु','पुष्य','आश्लेषा','मघा','पूर्वाफाल्गुनी','उत्तराफाल्गुनी','हस्त','चित्रा','स्वाति','विशाखा','अनुराधा','ज्येष्ठा','मूल','पूर्वाषाढ़ा','उत्तराषाढ़ा','श्रवण','धनिष्ठा','शतभिषा','पूर्वाभाद्रपदा','उत्तराभाद्रपदा','रेवती'];

/* ---------------- muhurat search over a date range (deterministic) ----------------
   Coarse pass scores every day by tithi + nakshatra (cheap, longitude only); the top
   candidates get a fine pass (sunrise, choghadiya, inauspicious windows, Abhijit). The
   AI only parses the request into {event, range}; all timing math is computed here. */
const NAK_GOOD = {
  purchase:     [0, 3, 4, 7, 12, 13, 14, 16, 21, 22, 23, 26],
  venture:      [0, 3, 7, 12, 13, 14, 16, 21, 22, 26],
  puja:         [3, 6, 7, 11, 12, 16, 20, 21, 25, 26],
  travel:       [0, 4, 6, 7, 12, 16, 21, 22, 26],
  housewarming: [3, 4, 11, 12, 13, 16, 20, 21, 22, 23, 25, 26],
  wedding:      [3, 4, 9, 11, 12, 14, 16, 18, 20, 25, 26],
  general:      [0, 3, 4, 7, 12, 13, 14, 16, 21, 22, 23, 26],
};
const RIKTA_T = new Set([4, 9, 14]);
function tithiScore(tNum, krishna) {
  if (krishna && tNum === 15) return -3;          // Amavasya
  if (RIKTA_T.has(tNum)) return -2;               // Rikta tithis
  if ([5, 10, 15].includes(tNum)) return 1;       // Purna
  if ([2, 3, 7, 11, 13].includes(tNum)) return 1; // Bhadra/Jaya-leaning
  return 0;
}
function dayMuhurat(y, m, day, place, tz, eventKey, goodChogha) {
  const ev = sunEvents(y, m, day, tz, place.lat, place.lon);
  if (ev.rise === null || ev.set === null) return null;
  const dow = new Date(Date.UTC(y, m - 1, day)).getUTCDay();
  const rise = ev.rise, set = ev.set, dayLen = set - rise;
  const sun = sunSidMs(rise), moon = moonSidMs(rise), elong = rev(moon - sun);
  const tn = Math.floor(elong / 12), krishna = tn >= 15, tNum = (tn % 15) + 1;
  const nakIdx = Math.floor(moon / (360 / 27));
  const eighth = (seg) => ({ start: rise + ((seg - 1) / 8) * dayLen, end: rise + (seg / 8) * dayLen });
  const inausp = [eighth(RAHU_SEGMENT[dow]), eighth(YAMA_SEGMENT[dow]), eighth(GULIKA_SEGMENT[dow])];
  const abhijit = dow === 3 ? null : { start: ev.transit - dayLen / 30, end: ev.transit + dayLen / 30 };
  const overlaps = (a, b) => a.start < b.end && b.start < a.end;
  const good = choghaSlots(dow, rise, set, true).filter((c) => goodChogha.includes(c.key) && !inausp.some((w) => overlaps(c, w)));
  const windows = good.map((c) => ({ key: c.key, start: c.start, end: c.end }));
  if (abhijit && !inausp.some((w) => overlaps(abhijit, w))) windows.unshift({ key: "abhijit", start: abhijit.start, end: abhijit.end });
  const ts = tithiScore(tNum, krishna);
  const ns = (NAK_GOOD[eventKey] || NAK_GOOD.general).includes(nakIdx) ? 2 : 0;
  const score = ts + ns + Math.min(windows.length, 3) * 0.6;
  return { ms: rise, rise, set, tNum, krishna, nakIdx, windows, score, tithiOk: ts >= 0, nakOk: ns > 0 };
}
function findMuhurat(startMs, endMs, place, tz, eventKey, goodChogha) {
  const DAY = 86400000;
  let nDays = Math.max(1, Math.min(Math.round((endMs - startMs) / DAY) + 1, 366));
  const ld = (k) => { const d = new Date(startMs + k * DAY + tz * 3600000); return { y: d.getUTCFullYear(), m: d.getUTCMonth() + 1, day: d.getUTCDate(), ms: Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 12) - tz * 3600000 }; };
  const coarse = [];
  for (let k = 0; k < nDays; k++) {
    const D = ld(k), moon = moonSidMs(D.ms), elong = rev(moon - sunSidMs(D.ms));
    const tn = Math.floor(elong / 12), krishna = tn >= 15, tNum = (tn % 15) + 1, nakIdx = Math.floor(moon / (360 / 27));
    coarse.push({ ...D, cs: tithiScore(tNum, krishna) + ((NAK_GOOD[eventKey] || NAK_GOOD.general).includes(nakIdx) ? 2 : 0) });
  }
  coarse.sort((a, b) => b.cs - a.cs);
  const fine = [];
  for (const c of coarse.slice(0, Math.min(18, coarse.length))) {
    const dm = dayMuhurat(c.y, c.m, c.day, place, tz, eventKey, goodChogha);
    if (dm && dm.windows.length) fine.push(dm);
  }
  fine.sort((a, b) => b.score - a.score || a.ms - b.ms);
  return fine.slice(0, 6);
}

/* ---------------- muhurat scoring for any date (panchang screening) ---------------- */
const _NAKW = 360 / 27;
const RIKTA_TITHI = new Set([4, 9, 14]);                          // Chaturthi, Navami, Chaturdashi
const AUSP_NAK = new Set([0, 3, 4, 6, 11, 12, 13, 14, 16, 20, 21, 22, 23, 25, 26]);
const INAUSP_NAK = new Set([1, 5, 8, 17, 18, 24]);                // broadly avoided for new/auspicious work
const WEEKDAY_FAV = {
  general:  { 0: 0, 1: 1, 2: -1, 3: 1, 4: 1, 5: 1, 6: -1 },
  purchase: { 0: 1, 1: 1, 2: -1, 3: 0, 4: 2, 5: 1, 6: -1 },
  wedding:  { 0: 0, 1: 1, 2: -1, 3: 1, 4: 2, 5: 1, 6: -1 },
  travel:   { 0: 0, 1: 1, 2: -1, 3: 1, 4: 1, 5: 1, 6: -1 },
  puja:     { 0: 1, 1: 1, 2: 0, 3: 1, 4: 2, 5: 1, 6: 0 },
  housewarming: { 0: 0, 1: 1, 2: -1, 3: 1, 4: 1, 5: 1, 6: -1 },
  venture:  { 0: 1, 1: 1, 2: -1, 3: 1, 4: 1, 5: 1, 6: -1 },
  vehicle:  { 0: 1, 1: 1, 2: -1, 3: 1, 4: 2, 5: 1, 6: -1 },
  property: { 0: 0, 1: 1, 2: -1, 3: 1, 4: 2, 5: 2, 6: -1 },
  mundan:   { 0: 0, 1: 1, 2: -1, 3: 1, 4: 1, 5: 1, 6: -1 },
  naming:   { 0: 1, 1: 1, 2: -1, 3: 1, 4: 2, 5: 1, 6: -1 },
};
const WN_SHORT = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const WN_HI = ["रविवार", "सोमवार", "मंगलवार", "बुधवार", "गुरुवार", "शुक्रवार", "शनिवार"];
function muhuratForDate(place, ayanamsa, y, m, day) {
  setAyanMode(ayanamsa || "lahiri");
  const tz = zoneOffset(place.zone, y, m, day) ?? 5.5;
  const ev = sunEvents(y, m, day, tz, place.lat, place.lon);
  if (ev.rise === null || ev.set === null) return null;
  const dow = new Date(ev.rise + tz * 3600000).getUTCDay();
  const sun = sunSidMs(ev.rise), moon = moonSidMs(ev.rise), elong = rev(moon - sun);
  const tn = Math.floor(elong / 12), nak = Math.floor(moon / _NAKW), kn = Math.floor(elong / 6);
  const karanaAt = (k) => { const kk = ((k % 60) + 60) % 60; return kk === 0 ? "Kimstughna" : kk >= 57 ? ["Shakuni", "Chatushpada", "Naga"][kk - 57] : KARANAS_MOV[(kk - 1) % 7]; };
  const dayLen = ev.set - ev.rise;
  const eighth = (seg) => ({ start: ev.rise + ((seg - 1) / 8) * dayLen, end: ev.rise + (seg / 8) * dayLen });
  const lmi = lunarMonthInfo(ev.rise, tn >= 15);
  const sunSign = Math.floor(sun / 30);
  const tithiNum0 = (tn % 15) + 1, krishna0 = tn >= 15, lm = lmi.idx;
  const devshayana = (lm === 3 && (krishna0 || tithiNum0 >= 11)) || (lm >= 4 && lm <= 6) || (lm === 7 && !krishna0 && tithiNum0 < 11);
  const sep = (a, b) => Math.abs(((a - b + 540) % 360) - 180);
  const venusAsta = sep(planetSidMs("Venus", ev.rise), sun) < 7;
  const guruAsta = sep(planetSidMs("Jupiter", ev.rise), sun) < 11;
  // panchang sampled every 3h across the civil day — a date qualifies for an
  // activity if some window has both nakshatra and tithi clean, not just sunrise
  const samples = [];
  for (let k = 0; k <= 8; k++) {
    const t = ev.rise + k * 10800000;
    const mo = moonSidMs(t), el = rev(mo - sunSidMs(t)), stn = Math.floor(el / 12);
    samples.push({ nak: Math.floor(mo / _NAKW), tn: stn, tithiNum: (stn % 15) + 1 });
  }
  return {
    samples,
    y, m, day, tz, rise: ev.rise, set: ev.set, dow,
    tn, tithiNum: tithiNum0, krishna: krishna0, nak, nakName: NAKSHATRAS[nak], karana: karanaAt(kn),
    lmonth: lm, lmonthName: lmi.amanta, adhik: lmi.adhik,
    sunSign, devshayana, venusAsta, guruAsta,
    pitruPaksha: pitruPakshaDay(ev.rise, ev.set),
    ayyappaMandala: ayyappaMandalaFor(ev.rise, tz),
    choghaDay: choghaSlots(dow, ev.rise, ev.set, true),
    choghaNight: choghaSlots(dow, ev.set, ev.rise + 86400000, false),
    abhijit: dow === 3 ? null : { start: ev.transit - dayLen / 30, end: ev.transit + dayLen / 30 },
    rahu: eighth(RAHU_SEGMENT[dow]), gulika: eighth(GULIKA_SEGMENT[dow]), yama: eighth(YAMA_SEGMENT[dow]),
  };
}
function dayScore(info, category) {
  const f = []; let s = 0;
  const nakHi = NAK_HI[info.nak] || info.nakName;
  // tithi
  if (info.tithiNum === 15 && !info.krishna) { s += 2; f.push({ en: "Purnima", hi: "पूर्णिमा", g: true }); }
  else if (info.tn === 29) { s -= 3; f.push({ en: "Amavasya", hi: "अमावस्या", g: false }); }
  else if (RIKTA_TITHI.has(info.tithiNum)) { s -= 2; f.push({ en: "Rikta tithi", hi: "रिक्ता तिथि", g: false }); }
  else { s += 1; }
  // nakshatra
  if (info.nak === 7) {
    if (category === "wedding") { f.push({ en: "Pushya (not used for weddings)", hi: "पुष्य (विवाह हेतु वर्जित)", g: false }); }
    else { s += 3; f.push({ en: "Pushya nakshatra", hi: "पुष्य नक्षत्र", g: true }); }
  } else if (AUSP_NAK.has(info.nak)) { s += 2; f.push({ en: info.nakName + " nakshatra", hi: nakHi + " नक्षत्र", g: true }); }
  else if (INAUSP_NAK.has(info.nak)) { s -= 2; f.push({ en: info.nakName + " (avoid)", hi: nakHi + " (टालें)", g: false }); }
  // weekday
  const wd = (WEEKDAY_FAV[category] || WEEKDAY_FAV.general)[info.dow] ?? 0;
  s += wd;
  if (wd > 0) f.push({ en: WN_SHORT[info.dow], hi: WN_HI[info.dow], g: true }); else if (wd < 0) f.push({ en: WN_SHORT[info.dow] + " (weak)", hi: WN_HI[info.dow] + " (कमज़ोर)", g: false });
  // Guru/Ravi-Pushya yoga
  if (info.nak === 7 && category !== "wedding") {
    if (info.dow === 4) { s += 2; f.push({ en: "Guru-Pushya yoga", hi: "गुरु-पुष्य योग", g: true }); }
    else if (info.dow === 0) { s += 1; f.push({ en: "Ravi-Pushya yoga", hi: "रवि-पुष्य योग", g: true }); }
  }
  // Bhadra (Vishti) karana
  if (info.karana === "Vishti") { s -= 2; f.push({ en: "Bhadra (Vishti) karana", hi: "भद्रा (विष्टि करण)", g: false }); }
  // intra-day flexibility
  const good = info.choghaDay.filter((c) => c.nat === "good").length;
  if (good >= 3) { s += 1; f.push({ en: good + " good day choghadiya", hi: good + " शुभ दिन चौघड़िया", g: true }); }
  return { score: s, factors: f };
}
/* Vaishnava (ISKCON/Gaudiya) Ekadashi: Dashami must end before Arunodaya (96 min pre-sunrise,
   Hari Bhakti Vilasa 12.316); else fast shifts to next day. If Ekadashi holds at two successive
   sunrises, the second day is taken. (Nakshatra-based Mahadvadashis not modelled.) */
function vaishnavaEkadashi(place, ayanamsa, ms) {
  setAyanMode(ayanamsa);
  const probe = new Date(ms);
  const tz = zoneOffset(place.zone, probe.getUTCFullYear(), probe.getUTCMonth() + 1, probe.getUTCDate()) ?? 5.5;
  const local = new Date(ms + tz * 3600000);
  const y = local.getUTCFullYear(), m = local.getUTCMonth() + 1, day = local.getUTCDate();
  const ev = sunEvents(y, m, day, tz, place.lat, place.lon);
  const evN = sunEvents(y, m, day + 1, tz, place.lat, place.lon);
  if (ev.rise == null || evN.rise == null) return { fastMs: ms, shifted: false, reason: null };
  const tIdx = (t) => Math.floor(rev(elongMs(t)) / 12);
  const aru = ev.rise - 96 * 60000;
  const viddha = tIdx(aru) === 9 || tIdx(aru) === 24;                 // Dashami touches Arunodaya
  const twoRise = tIdx(evN.rise) === 10 || tIdx(evN.rise) === 25;      // Ekadashi at both sunrises
  const shifted = viddha || twoRise;
  const fastMs = shifted ? ms + 86400000 : ms;
  let parana = null;
  try {
    const fl = new Date(fastMs + tz * 3600000);
    const evP = sunEvents(fl.getUTCFullYear(), fl.getUTCMonth() + 1, fl.getUTCDate() + 1, tz, place.lat, place.lon);
    if (evP.rise != null) {
      if (!shifted) {
        const krishna = tIdx(ms) >= 15, startDeg = krishna ? 312 : 132;
        const t1 = solveCross(elongMs, ms - 86400000, startDeg, 4);
        const t2 = t1 ? solveCross(elongMs, t1 + 3600000, (startDeg + 12) % 360, 3) : null;
        parana = t1 && t2 ? { start: Math.max(evP.rise, t1 + 0.25 * (t2 - t1)) } : { start: evP.rise };
      } else parana = { start: evP.rise };
    }
  } catch (e) {}
  return { fastMs, shifted, reason: viddha ? "viddha" : twoRise ? "twoRise" : null, parana };
}
/* per-vrat computed detail: lunar identity + fast-breaking time (parana / moonrise / sunset) */
function vratDetail(place, ayanamsa, ms, timing) {
  setAyanMode(ayanamsa);
  const probe = new Date(ms);
  const tz = zoneOffset(place.zone, probe.getUTCFullYear(), probe.getUTCMonth() + 1, probe.getUTCDate()) ?? 5.5;
  const local = new Date(ms + tz * 3600000);
  const y = local.getUTCFullYear(), m = local.getUTCMonth() + 1, day = local.getUTCDate();
  const info = muhuratForDate(place, ayanamsa, y, m, day);
  const out = { info, tz };
  if (!info) return out;
  try {
    if (timing === "parana") {
      const startDeg = info.krishna ? 312 : 132;
      const t1 = solveCross(elongMs, ms - 86400000, startDeg, 4);
      const t2 = t1 ? solveCross(elongMs, t1 + 3600000, (startDeg + 12) % 360, 3) : null;
      const evN = sunEvents(y, m, day + 1, tz, place.lat, place.lon);
      if (t1 && t2 && evN.rise != null) {
        const hvEnd = t1 + 0.25 * (t2 - t1);
        out.parana = { start: Math.max(evN.rise, hvEnd), dwadashiEnd: t2, afterHV: hvEnd > evN.rise };
      }
      try { out.vaishnava = vaishnavaEkadashi(place, ayanamsa, ms); } catch (e) {}
    } else if (timing === "moonrise") {
      const me = moonEvents(y, m, day, tz, place.lat, place.lon);
      out.moonrise = me.rise != null ? me.rise : (moonEvents(y, m, day + 1, tz, place.lat, place.lon).rise);
    } else if (timing === "stars") {
      out.stars = true;
    } else if (timing === "sunset") {
      out.sunset = info.set;
    }
  } catch (e) {}
  return out;
}
/* Vaishnava (ISKCON / Hari Bhakti Vilasa 12.316) Ekadashi day: the tithi must be pure at
   arunodaya (96 min before sunrise). Dashami touching arunodaya (viddha) shifts the fast one
   day; Ekadashi pure at two consecutive arunodayas is observed on the second day. */
function vaishnavaEkadashiDay(place, ayanamsa, ms) {
  setAyanMode(ayanamsa);
  const probe = new Date(ms);
  const tz = zoneOffset(place.zone, probe.getUTCFullYear(), probe.getUTCMonth() + 1, probe.getUTCDate()) ?? 5.5;
  const local = new Date(ms + tz * 3600000);
  const y = local.getUTCFullYear(), m = local.getUTCMonth() + 1, day = local.getUTCDate();
  const ekAt = (dOff) => {
    const ev = sunEvents(y, m, day + dOff, tz, place.lat, place.lon);
    if (ev.rise == null) return null;
    const e = rev(elongMs(ev.rise - 5760000));
    return (e >= 120 && e < 132) || (e >= 300 && e < 312);
  };
  const e0 = ekAt(0);
  if (e0 === null) return { ms, shifted: false };
  if (!e0) return { ms: ms + 86400000, shifted: true, reason: "viddha" };
  if (ekAt(1)) return { ms: ms + 86400000, shifted: true, reason: "spans" };
  return { ms, shifted: false };
}
/* Muhurta Shuddhi — hard constraints per event type (month/tithi/nakshatra/weekday).
   Griha Pravesh: months Vaishakha/Jyeshtha/Kartika/Margashirsha/Magha/Phalguna; forbidden Chaturmas
   (Ashadha–Ashwina), Pausha, Adhik; Shukla-type tithis 2,3,5,7,10,11,12,13; auspicious nakshatras only;
   Tuesday avoided. (Venus/Jupiter combustion "Asta" not yet checked.) */
const GP_AUSP_NAK = new Set([3, 4, 7, 11, 12, 13, 14, 16, 20, 22, 23, 25, 26]);
const GP_GOOD_TITHI = new Set([2, 3, 5, 7, 10, 11, 12, 13]);
const CHATURMAS_MONTHS = new Set([3, 4, 5, 6]);
/* Shuddhi rule sets per activity. Nakshatra/tithi/weekday sets follow the classical
   muhurta canon as published by Drik Panchang's shubh-dates lists (2026 Delhi lists used
   as validation anchors — see validation/muhurat-anchors.cjs). Wedding additionally blocks
   Kharmas (Sun in Dhanu/Meena), Devshayana (Ashadha Shukla 11 → Kartika Shukla 11) and
   Shukra/Guru asta (combustion approximation: within 10°/11° of the Sun). */
const MUHURTA_RULES = {
  housewarming: { forbiddenMonths: new Set([3, 4, 5, 6, 9]), auspNak: GP_AUSP_NAK, goodTithi: GP_GOOD_TITHI, forbidWeekday: new Set([2]),
    monthsLabel: { en: "Magha, Phalguna, Vaishakha, Jyeshtha, Kartika, Margashirsha — never during Chaturmas (monsoon) or Pausha", hi: "माघ, फाल्गुन, वैशाख, ज्येष्ठ, कार्तिक, मार्गशीर्ष — चातुर्मास व पौष में कभी नहीं" } },
  wedding: { auspNak: new Set([3, 4, 9, 11, 12, 14, 16, 18, 20, 25, 26]), noAmavasya: true, kharmas: true, devshayana: true, asta: true,
    monthsLabel: { en: "Blocked during Devshayana (roughly mid-July to late November), Kharmas (mid-December to mid-January, mid-March to mid-April) and while Venus or Jupiter is combust", hi: "देवशयन काल, खरमास तथा शुक्र/गुरु अस्त में विवाह वर्जित" } },
  vehicle: { auspNak: new Set([0, 3, 4, 6, 7, 12, 13, 14, 16, 21, 22, 23, 26]), goodTithi: new Set([1, 2, 3, 5, 6, 7, 8, 10, 11, 12, 13, 15]), noAmavasya: true, forbidWeekday: new Set([2, 6]),
    monthsLabel: { en: "Any month — needs an auspicious nakshatra, a clean tithi, and not Tuesday or Saturday", hi: "कोई भी मास — शुभ नक्षत्र, शुद्ध तिथि; मंगलवार व शनिवार वर्जित" } },
  property: { auspNak: new Set([4, 6, 8, 9, 10, 15, 16, 18, 19, 24, 25, 26]), allowWeekday: new Set([4, 5]),
    monthsLabel: { en: "Any month — Thursdays and Fridays only, on the fixed set of registration nakshatras", hi: "कोई भी मास — केवल गुरुवार व शुक्रवार, निर्धारित नक्षत्रों में" } },
  mundan: { forbiddenMonths: new Set([4, 5, 6, 9]), auspNak: new Set([0, 4, 6, 7, 12, 13, 14, 17, 21, 22, 23, 26]), goodTithi: new Set([2, 3, 5, 7, 10, 11, 13]), allowWeekday: new Set([1, 3, 4, 5]),
    monthsLabel: { en: "Traditionally Chaitra to Ashadha and the winter months — not during Chaturmas or Pausha; Monday, Wednesday, Thursday, Friday", hi: "चैत्र से आषाढ़ व शीत मास — चातुर्मास व पौष वर्जित; सोम, बुध, गुरु, शुक्रवार" } },
  naming: { auspNak: new Set([0, 3, 4, 6, 7, 11, 12, 13, 14, 16, 20, 21, 22, 23, 25, 26]), goodTithi: new Set([1, 2, 3, 5, 6, 7, 10, 11, 12, 13, 15]), noAmavasya: true, forbidWeekday: new Set([2, 6]),
    monthsLabel: { en: "Any month — an auspicious nakshatra and clean tithi; Tuesday and Saturday avoided", hi: "कोई भी मास — शुभ नक्षत्र व शुद्ध तिथि; मंगल व शनि वर्जित" } },
  venture: { auspNak: new Set([0, 3, 4, 6, 7, 11, 12, 13, 14, 16, 20, 21, 22, 23, 25, 26]), goodTithi: new Set([1, 2, 3, 5, 7, 10, 11, 13, 15]), noAmavasya: true, forbidWeekday: new Set([2]),
    monthsLabel: { en: "Any month — an auspicious nakshatra and growing tithi; Tuesday avoided", hi: "कोई भी मास — शुभ नक्षत्र व वृद्धि तिथि; मंगलवार वर्जित" } },
};

function muhuratShuddhi(info, category) {
  const rule = MUHURTA_RULES[category];
  if (!rule) return { valid: true, blockers: [] };
  const b = [];
  // Pitru Paksha (Shraddha fortnight) blocks ALL auspicious activities, every category.
  if (info.pitruPaksha) b.push({ en: "Pitru Paksha (Shraddha fortnight — no auspicious work)", hi: "पितृ पक्ष (श्राद्ध पक्ष — शुभ कार्य वर्जित)" });
  if (info.adhik) b.push({ en: "Adhik (leap) month", hi: "अधिक मास" });
  else if (rule.forbiddenMonths && rule.forbiddenMonths.has(info.lmonth)) b.push(CHATURMAS_MONTHS.has(info.lmonth) ? { en: "Chaturmas (" + info.lmonthName + ")", hi: "चातुर्मास (" + info.lmonthName + ")" } : { en: info.lmonthName + " (avoided)", hi: info.lmonthName + " (वर्जित)" });
  if (rule.forbidWeekday && rule.forbidWeekday.has(info.dow)) b.push({ en: WN_SHORT[info.dow] + " (avoided)", hi: WN_SHORT[info.dow] + " (वर्जित)" });
  if (rule.allowWeekday && !rule.allowWeekday.has(info.dow)) b.push({ en: WN_SHORT[info.dow] + " (not used)", hi: WN_SHORT[info.dow] + " (अनुपयुक्त)" });
  const smp = info.samples || [{ nak: info.nak, tn: info.tn, tithiNum: info.tithiNum }];
  const nakOK = (s) => !rule.auspNak || rule.auspNak.has(s.nak);
  const tithiOK = (s) => (!rule.goodTithi || rule.goodTithi.has(s.tithiNum)) && !(rule.noAmavasya && s.tn === 29);
  if (!smp.some((s) => nakOK(s) && tithiOK(s))) {
    if (!smp.some(nakOK)) b.push({ en: info.nakName + " nakshatra (not used)", hi: info.nakName + " नक्षत्र (अनुपयुक्त)" });
    else if (!smp.some(tithiOK)) b.push({ en: "unsuitable tithi", hi: "अनुपयुक्त तिथि" });
    else b.push({ en: "no clean nakshatra-tithi window", hi: "नक्षत्र-तिथि का शुद्ध योग नहीं" });
  }
  if (rule.kharmas && (info.sunSign === 8 || info.sunSign === 11)) b.push({ en: "Kharmas — Sun in " + (info.sunSign === 8 ? "Dhanu" : "Meena"), hi: "खरमास" });
  if (rule.devshayana && info.devshayana) b.push({ en: "Devshayana (Vishnu resting period)", hi: "देवशयन काल" });
  if (rule.asta && info.venusAsta) b.push({ en: "Shukra asta (Venus combust)", hi: "शुक्र अस्त" });
  if (rule.asta && info.guruAsta) b.push({ en: "Guru asta (Jupiter combust)", hi: "गुरु अस्त" });
  return { valid: b.length === 0, blockers: b };
}
/* scan an arbitrary from→to day range (inclusive), capped at 400 days */
function muhuratScanRange(place, ayanamsa, fromYmd, toYmd, category) {
  const out = [];
  let cur = Date.UTC(fromYmd.y, fromYmd.m - 1, fromYmd.d);
  const end = Date.UTC(toYmd.y, toYmd.m - 1, toYmd.d);
  for (let i = 0; cur <= end && i < 400; i++, cur += 86400000) {
    const dt = new Date(cur);
    const info = muhuratForDate(place, ayanamsa, dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate());
    if (!info) continue;
    const sc = dayScore(info, category);
    const sh = muhuratShuddhi(info, category);
    out.push({ ...info, ...sc, valid: sh.valid, blockers: sh.blockers });
  }
  out.sort((a, b) => b.score - a.score || a.rise - b.rise);
  return out;
}

export {
  NAK_HI, NAK_GOOD, tithiScore, dayMuhurat, findMuhurat,
  muhuratForDate, dayScore, vaishnavaEkadashi, vratDetail,
  vaishnavaEkadashiDay, MUHURTA_RULES, muhuratShuddhi, muhuratScanRange,
};
