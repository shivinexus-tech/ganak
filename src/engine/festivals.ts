import { rev, sd } from "./ephemeris";
import {
  amantaMonthIdx, elongMs, moonEvents, moonSidMs, pitruPakshaDay, planetSidMs, solveCross,
  sunEvents, sunSidMs, zoneOffset, karanaName,
} from "./panchang";

/* Twelve solar sankrantis — Sun enters each sidereal sign (Lahiri). Makar (270°)
   also surfaces pongal alongside makarSankranti. */
const SANKRANTI_FESTIVALS = [
  { key: "meshaSankranti", deg: 0 },
  { key: "vrishabhaSankranti", deg: 30 },
  { key: "mithunaSankranti", deg: 60 },
  { key: "karkaSankranti", deg: 90 },
  { key: "simhaSankranti", deg: 120 },
  { key: "kanyaSankranti", deg: 150 },
  { key: "tulaSankranti", deg: 180 },
  { key: "vrishchikaSankranti", deg: 210 },
  { key: "makarSankranti", deg: 270 },
  { key: "dhanuSankranti", deg: 240 },
  { key: "kumbhaSankranti", deg: 300 },
  { key: "meenaSankranti", deg: 330 },
];
const ECLIPSE_NODE_ORB = 18; // degrees — syzygy within orb of mean Rahu/Ketu axis

/* Tamil/Malayalam solar-calendar observances.
   Festival days are sunrise-to-sunrise days. Because this scanner intentionally
   has no latitude, 06:00 local is the stable sunrise boundary; the named
   nakshatra occurrence is assigned to the sunrise on which it prevails. If an
   unusually short occurrence falls wholly between two sunrise boundaries, the
   day containing the greatest overlap is the documented fallback.
   Solar-month checks use Lahiri sidereal signs (Tamil/Malayalam month mapping).
   Vishukkani uses the first dawn after Mesha Sankranti. Vrischikam day 1 uses
   the Malayalam month rule: a Sankranti up to the end of Madhyahna (approximated
   as 3/5 of a 06:00–18:00 day = 13:12 local) belongs to that civil day; a later
   Sankranti is observed the following day. */
const SOLAR_NAK_FESTIVALS = [
  { key: "panguniUthiram", sunSign: 11, nak: 11 }, // Meena · Uttara Phalguni
  { key: "thaipusam", sunSign: 9, nak: 7 },       // Makara · Pushya
  { key: "onam", sunSign: 4, nak: 21 },           // Simha/Chingam · Shravana
  { key: "karthigaiDeepam", sunSign: 7, nak: 2 }, // Vrischika/Karthigai · Krittika
  { key: "vaikasiVisakam", sunSign: 1, nak: 15 }, // Vrishabha/Vaikasi · Vishakha
  { key: "aadiPooram", sunSign: 3, nak: 10, pick: "last" }, // Karka/Aadi · Purva Phalguni — last in solar month
  { key: "arudraDarshan", sunSign: 8, nak: 5, pick: "december" }, // Dhanu/Margazhi · Ardra — winter Thiruvathirai
];
function localNoon(ms, tz) {
  const d = new Date(ms + tz * 3600000);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 12) - tz * 3600000;
}
function localPanchangDayStart(ms, tz) {
  const shifted = ms + tz * 3600000 - 6 * 3600000;
  const d = new Date(shifted);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 6) - tz * 3600000;
}
function malayalamSankrantiDay(ingressMs, tz) {
  const d = new Date(ingressMs + tz * 3600000);
  const localHour = d.getUTCHours() + d.getUTCMinutes() / 60 + d.getUTCSeconds() / 3600;
  const noon = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 12) - tz * 3600000;
  return noon + (localHour > 13.2 ? 86400000 : 0);
}
function firstSunriseDayAfter(ingressMs, tz) {
  const rise = localPanchangDayStart(ingressMs, tz);
  return rise + (ingressMs > rise ? 86400000 : 0) + 6 * 3600000;
}
function solarNakshatraFestivalDays(fromMs, tz, days) {
  const DAY = 86400000, firstNoon = localNoon(fromMs, tz), limit = firstNoon + days * DAY, buckets = new Map();
  for (const rule of SOLAR_NAK_FESTIVALS) {
    const startDeg = rule.nak * (360 / 27), endDeg = ((rule.nak + 1) % 27) * (360 / 27);
    let nakStart = solveCross(moonSidMs, firstNoon - 3 * DAY, startDeg, days + 6);
    while (nakStart && nakStart < limit + DAY) {
      const nakEnd = solveCross(moonSidMs, nakStart + 60000, endDeg, 3);
      if (!nakEnd) break;
      let bucket = localPanchangDayStart(nakStart, tz), best = bucket, bestOverlap = -1, sunriseHit = null;
      while (bucket < nakEnd) {
        const overlap = Math.max(0, Math.min(nakEnd, bucket + DAY) - Math.max(nakStart, bucket));
        if (overlap > bestOverlap) { bestOverlap = overlap; best = bucket; }
        if (bucket >= nakStart && bucket < nakEnd && sunriseHit === null) sunriseHit = bucket;
        bucket += DAY;
      }
      if (sunriseHit !== null) best = sunriseHit;
      const festivalNoon = best + 6 * 3600000;
      if (festivalNoon >= firstNoon && festivalNoon < limit && Math.floor(sunSidMs(best) / 30) === rule.sunSign) {
        if (!buckets.has(rule.key)) buckets.set(rule.key, []);
        buckets.get(rule.key).push({ key: rule.key, ms: festivalNoon, nakStart, nakEnd, civilMonth: new Date(festivalNoon + tz * 3600000).getUTCMonth() });
      }
      nakStart = solveCross(moonSidMs, nakEnd + 60000, startDeg, 32);
    }
  }
  const out = [];
  for (const rule of SOLAR_NAK_FESTIVALS) {
    const all = buckets.get(rule.key) || [];
    if (!all.length) continue;
    if (rule.pick === "december") {
      const dec = all.filter((x) => x.civilMonth === 11);
      if (dec.length) out.push(dec[dec.length - 1]);
      else out.push(all[all.length - 1]);
    } else if (rule.pick === "last") {
      out.push(all[all.length - 1]);
    } else {
      out.push(all[0]);
    }
  }
  return out;
}
/* Varalakshmi Vratam — last Friday of Shravan Shukla paksha on or before Purnima.
   Matches Drik Delhi 2026 (Aug 28): when Purnima itself falls on Friday, that day
   is the observance. Sourced: content-tier1.md; benchmark drikpanchang.com Delhi. */
function varalakshmiDay(fromMs, tz, days, place) {
  const DAY = 86400000;
  const start = new Date(fromMs + tz * 3600000);
  const sy = start.getUTCFullYear(), sm = start.getUTCMonth(), sd = start.getUTCDate();
  let purnimaUtc = null;
  const fridays = [];
  for (let k = 0; k < days; k++) {
    const civil = new Date(Date.UTC(sy, sm, sd + k));
    const y = civil.getUTCFullYear(), m = civil.getUTCMonth() + 1, day = civil.getUTCDate();
    const parts = scanDayParts(y, m, day, tz, place);
    if (amantaMonthIdx(parts.rise).idx !== 4) continue; // amanta Shravan
    const shuklaPurnima = targetTithiIndex(false, 15);
    if (tithiKalaOverlap(parts, "udaya", shuklaPurnima)) {
      purnimaUtc = Date.UTC(y, m - 1, day);
    }
    if (civil.getUTCDay() === 5 && tithiIndexAt(parts.rise) < 15) {
      fridays.push({ y, m, day, ms: parts.noon, utc: Date.UTC(y, m - 1, day) });
    }
  }
  if (purnimaUtc == null || !fridays.length) return null;
  const eligible = fridays.filter((f) => f.utc <= purnimaUtc);
  return eligible.length ? eligible[eligible.length - 1] : null;
}
/* Mahalakshmi Vrat culmination — 15th day of the vrat (inclusive) from Bhadrapada
   Shukla Ashtami. Drik lists the end date by span, not a standalone tithi match. */
function mahalakshmiVratDay(fromMs, tz, days, place) {
  const DAY = 86400000;
  const start = new Date(fromMs + tz * 3600000);
  const sy = start.getUTCFullYear(), sm = start.getUTCMonth(), sd = start.getUTCDate();
  for (let k = 0; k < days; k++) {
    const civil = new Date(Date.UTC(sy, sm, sd + k));
    const y = civil.getUTCFullYear(), m = civil.getUTCMonth() + 1, day = civil.getUTCDate();
    const parts = scanDayParts(y, m, day, tz, place);
    if (amantaMonthIdx(parts.rise).idx !== 5) continue;
    const shukla8 = targetTithiIndex(false, 8);
    if (!tithiKalaOverlap(parts, "udaya", shukla8)) continue;
    const endMs = parts.noon + 13 * DAY;
    const end = new Date(endMs + tz * 3600000);
    return { y: end.getUTCFullYear(), m: end.getUTCMonth() + 1, day: end.getUTCDate(), ms: endMs };
  }
  return null;
}
/* Annual Skanda Sashti (Kanda Sashti) — Shukla Shashti while Sun is in Tula (Aippasi).
   Six-day fast Nov 10–15 2026 Delhi; Soorasamharam on day 6, Thirukalyanam next sunrise.
   Sourced: Drik/Tiruchendur calendar; Hindu Blog 2026 span. Distinct from monthly skandaShashti fast. */
function skandaSashtiAnchor(fromMs, tz, days, place) {
  const start = new Date(fromMs + tz * 3600000);
  const sy = start.getUTCFullYear(), sm = start.getUTCMonth(), sd = start.getUTCDate();
  for (let k = 0; k < days; k++) {
    const civil = new Date(Date.UTC(sy, sm, sd + k));
    const y = civil.getUTCFullYear(), m = civil.getUTCMonth() + 1, day = civil.getUTCDate();
    const parts = scanDayParts(y, m, day, tz, place);
    if (Math.floor(sunSidMs(parts.rise) / 30) !== 6) continue;
    const shukla6 = targetTithiIndex(false, 6);
    if (!tithiKalaOverlap(parts, "udaya", shukla6)) continue;
    return { y, m, day, ms: parts.noon };
  }
  return null;
}
/* Grahan — syzygy (new/full moon) within ~18° of the mean Rahu/Ketu axis.
   Civil day uses the sunrise boundary containing maximum eclipse. Sourced: Drik
   2026 Delhi list (Feb 17 solar, Mar 3 lunar, Aug 12 solar, Aug 28 lunar). */
function grahanDays(fromMs, tz, days) {
  const DAY = 86400000, limit = fromMs + days * DAY, out = [];
  let t = fromMs;
  while (t < limit) {
    const nm = solveCross(elongMs, t, 0, 35);
    const fm = solveCross(elongMs, t, 180, 35);
    for (const [ms, key, bodyFn] of [
      [nm, "suryaGrahan", sunSidMs],
      [fm, "chandraGrahan", moonSidMs],
    ]) {
      if (!ms || ms < fromMs || ms >= limit) continue;
      const rahu = planetSidMs("Rahu", ms);
      const ketu = rev(rahu + 180);
      const body = bodyFn(ms);
      const dist = Math.min(
        Math.min(rev(body - rahu), rev(rahu - body)),
        Math.min(rev(body - ketu), rev(ketu - body)),
      );
      if (dist > ECLIPSE_NODE_ORB) continue;
      const civil = localPanchangDayStart(ms, tz);
      const noon = civil + 6 * 3600000;
      if (!out.some((x) => x.key === key && Math.abs(x.ms - noon) < DAY)) {
        out.push({ key, ms: noon, eclipseMs: ms, decidingKala: "syzygy-near-node" });
      }
    }
    const next = Math.min(nm || Infinity, fm || Infinity);
    t = Number.isFinite(next) ? next + DAY : t + DAY;
  }
  return out;
}
function ayyappaMandalaFor(ms, tz) {
  const DAY = 86400000, civilNoon = localNoon(ms, tz), d = new Date(civilNoon + tz * 3600000), gy = d.getUTCFullYear();
  for (const year of [gy, gy - 1]) {
    const ingress = solveCross(sunSidMs, Date.UTC(year, 9, 20), 210, 45);
    if (!ingress) continue;
    const start = malayalamSankrantiDay(ingress, tz), end = start + 40 * DAY;
    const day = Math.round((civilNoon - start) / DAY) + 1;
    if (day >= 1 && day <= 41) return { day, start, end, ingress };
  }
  return null;
}
// tithi-based observances (fasting days) — accurate, month-independent

/* ekadashi variants by lunar month */
const EKADASHI_NAMES = {
  "Chaitra_Shukla_11": { en: "Kamada Ekadashi", hi: "कामदा एकादशी" },
  "Vaisakha_Shukla_11": { en: "Mohini Ekadashi", hi: "मोहिनी एकादशी" },
  "Jyeshtha_Shukla_11": { en: "Apara Ekadashi", hi: "अपरा एकादशी" },
  "Ashadha_Shukla_11": { en: "Yogini Ekadashi", hi: "योगिनी एकादशी" },
  "Shravan_Shukla_11": { en: "Varuthini Ekadashi", hi: "वरूथिनी एकादशी" },
  "Bhadrapad_Shukla_11": { en: "Padma Ekadashi", hi: "पद्मा एकादशी" },
  "Ashwin_Shukla_11": { en: "Indira Ekadashi", hi: "इंदिरा एकादशी" },
  "Kartik_Shukla_11": { en: "Dev Uthani Ekadashi", hi: "देव उठनी एकादशी" },
  "Margshirsh_Shukla_11": { en: "Utpanna Ekadashi", hi: "उत्पन्ना एकादशी" },
  "Paush_Shukla_11": { en: "Mokshada Ekadashi", hi: "मोक्षदा एकादशी" },
  "Magh_Shukla_11": { en: "Safala Ekadashi", hi: "सफला एकादशी" },
  "Phalgun_Shukla_11": { en: "Amalaki Ekadashi", hi: "आमलकी एकादशी" },
  "Chaitra_Krishna_11": { en: "Pap Mochini Ekadashi", hi: "पाप मोचिनी एकादशी" },
  "Vaisakha_Krishna_11": { en: "Nrisimha Jayanti", hi: "नृसिंह जयंती" },
  "Jyeshtha_Krishna_11": { en: "Nirjala Ekadashi", hi: "निर्जला एकादशी" },
  "Ashadha_Krishna_11": { en: "Hari Bodhini Ekadashi", hi: "हरि बोधिनी एकादशी" },
  "Shravan_Krishna_11": { en: "Putrada Ekadashi", hi: "पुत्रदा एकादशी" },
  "Bhadrapad_Krishna_11": { en: "Aja Ekadashi", hi: "अजा एकादशी" },
  "Ashwin_Krishna_11": { en: "Vijaya Ekadashi", hi: "विजया एकादशी" },
  "Kartik_Krishna_11": { en: "Prabodhini Ekadashi", hi: "प्रबोधिनी एकादशी" },
  "Margshirsh_Krishna_11": { en: "Gita Jayanti", hi: "गीता जयंती" },
  "Paush_Krishna_11": { en: "Putrada Ekadashi", hi: "पुत्रदा एकादशी" },
  "Magh_Krishna_11": { en: "Shatila Ekadashi", hi: "शतिला एकादशी" },
  "Phalgun_Krishna_11": { en: "Phalaharini Ekadashi", hi: "फलहारिणी एकादशी" }
};
const PRADOSH_NAMES_BY_DAY = {
  0: { en: "Ravi Pradosh", hi: "रवि प्रदोष" },
  1: { en: "Som Pradosh", hi: "सोम प्रदोष" },
  2: { en: "Bhaum Pradosh", hi: "भौम प्रदोष" },
  3: { en: "Budh Pradosh", hi: "बुध प्रदोष" },
  4: { en: "Guru Pradosh", hi: "गुरु प्रदोष" },
  5: { en: "Shukra Pradosh", hi: "शुक्र प्रदोष" },
  6: { en: "Shani Pradosh", hi: "शनि प्रदोष" }
};

function observancesFor(krishna, tithiNum, month = null, dow = null) {
  const out = [];
  if (tithiNum === 11) {
    const pk = krishna ? "Krishna" : "Shukla";
    const key = month ? `${month}_${pk}_11` : null;
    const variant = key && EKADASHI_NAMES[key] ? key : null;
    out.push({ key: variant || "ekadashi", fasting: true, isVariant: !!variant, baseKey: "ekadashi" });
  }
  if (tithiNum === 13) {
    const variant = dow != null ? PRADOSH_NAMES_BY_DAY[dow % 7] : null;
    const variantKey = variant ? `pradosh_${dow % 7}` : "pradosh";
    out.push({ key: variantKey, fasting: true, isVariant: !!variant, baseKey: "pradosh" });
  }
  if (tithiNum === 4 && krishna) out.push({ key: "sankashti", fasting: true });
  if (tithiNum === 4 && !krishna) out.push({ key: "vinayakaChaturthi", fasting: true });
  if (tithiNum === 6 && !krishna) out.push({ key: "skandaShashti", fasting: true });
  if (tithiNum === 8 && !krishna) out.push({ key: "masikDurgashtami", fasting: true });
  if (tithiNum === 8 && krishna) out.push({ key: "kalashtami", fasting: false });
  if (tithiNum === 14 && krishna) out.push({ key: "masikShivaratri", fasting: true });
  if (tithiNum === 15 && !krishna) out.push({ key: "purnima", fasting: true });
  if (tithiNum === 15 && krishna) out.push({ key: "amavasya", fasting: true });
  return out;
}
// major festivals by amanta month index (into MONTHS_HINDU) + paksha + tithi
const FESTIVALS = [
  { key: "chaitraNavratri", month: 0, krishna: false, tithi: 1, kala: "pratahkala", selection: "first", policy: "chaitraPratipada" },
  { key: "gudiPadwa", month: 0, krishna: false, tithi: 1, kala: "pratahkala", selection: "first", policy: "chaitraPratipada" },
  { key: "ugadi", month: 0, krishna: false, tithi: 1, kala: "pratahkala", selection: "first", policy: "chaitraPratipada" },
  { key: "lakshmiPanchami", month: 0, krishna: false, tithi: 5, kala: "udaya" },
  { key: "ramNavami", month: 0, krishna: false, tithi: 9, kala: "madhyahna" },
  { key: "swaminarayanJayanti", month: 0, krishna: false, tithi: 9, kala: "udaya" },
  { key: "taraJayanti", month: 0, krishna: false, tithi: 9, kala: "madhyahna" },
  { key: "gangaur", month: 0, krishna: false, tithi: 3, kala: "udaya" },
  { key: "hanumanJ", month: 0, krishna: false, tithi: 15, kala: "udaya" },
  { key: "akshaya", month: 1, krishna: false, tithi: 3, kala: "purvahna", selection: "first" },
  { key: "parashuramaJayanti", month: 1, krishna: false, tithi: 3, kala: "purvahna", selection: "first" },
  { key: "matangiJayanti", month: 1, krishna: false, tithi: 3, kala: "udaya" },
  { key: "sitaNavami", month: 1, krishna: false, tithi: 9, kala: "udaya" },
  { key: "naradaJayanti", month: 1, krishna: true, tithi: 1, kala: "udaya" },
  { key: "bagalamukhiJayanti", month: 1, krishna: false, tithi: 8, kala: "udaya" },
  { key: "chhinnamastaJayanti", month: 1, krishna: false, tithi: 14, kala: "udaya" },
  { key: "narasimhaJayanti", month: 1, krishna: false, tithi: 14, kala: "udaya" },
  { key: "buddhaPurnima", month: 1, krishna: false, tithi: 15, kala: "udaya" },
  { key: "vatSavitri", month: 1, krishna: true, tithi: 15, kala: "udaya" },
  { key: "shaniJayanti", month: 1, krishna: true, tithi: 15, kala: "udaya" },
  { key: "vatPurnima", month: 2, krishna: false, tithi: 15, kala: "udaya", skipAdhik: true },
  { key: "dhumavatiJayanti", month: 2, krishna: false, tithi: 8, kala: "udaya", skipAdhik: true },
  { key: "gangaDussehra", month: 2, krishna: false, tithi: 10, kala: "udaya" },
  { key: "guptNavratriAshadha", month: 3, krishna: false, tithi: 1, kala: "pratahkala", selection: "first" },
  { key: "rathYatra", month: 3, krishna: false, tithi: 2, kala: "udaya" },
  { key: "guruPurnima", month: 3, krishna: false, tithi: 15, kala: "udaya" },
  { key: "hariyaliTeej", month: 4, krishna: false, tithi: 3, kala: "udaya" },
  { key: "nagPanchami", month: 4, krishna: false, tithi: 5, kala: "udaya" },
  { key: "janmashtami", month: 4, krishna: true, tithi: 8, kala: "nishita" },
  { key: "rakshaBandhan", month: 4, krishna: false, tithi: 15, policy: "raksha" },
  { key: "hartalikaTeej", month: 5, krishna: false, tithi: 3, kala: "udaya" },
  { key: "kajariTeej", month: 4, krishna: true, tithi: 3, kala: "udaya" },
  { key: "rishiPanchami", month: 5, krishna: false, tithi: 5, kala: "purvahna" },
  { key: "balaramaJayanti", month: 5, krishna: false, tithi: 6, kala: "madhyahna" },
  { key: "kaliJayanti", month: 5, krishna: true, tithi: 8, kala: "nishita" },
  { key: "bhuvaneshvariJayanti", month: 5, krishna: false, tithi: 12, kala: "udaya" },
  { key: "ganeshChaturthi", month: 5, krishna: false, tithi: 4, kala: "madhyahna" },
  { key: "radhaAshtami", month: 5, krishna: false, tithi: 8, kala: "madhyahna" },
  { key: "anantChaturdashi", month: 5, krishna: false, tithi: 14, kala: "aparahna" },
  { key: "sharadNavratri", month: 6, krishna: false, tithi: 1, kala: "pratahkala", selection: "first" },
  { key: "durgaPujaShashthi", month: 6, krishna: false, tithi: 6, kala: "udaya" },
  { key: "durgaPujaSaptami", month: 6, krishna: false, tithi: 7, kala: "udaya" },
  { key: "durgaPujaAshtami", month: 6, krishna: false, tithi: 8, kala: "udaya" },
  { key: "lalitaPanchami", month: 6, krishna: false, tithi: 5, kala: "udaya" },
  { key: "mahaAshtami", month: 6, krishna: false, tithi: 8, kala: "udaya" },
  { key: "mahaNavami", month: 6, krishna: false, tithi: 9, kala: "aparahna" },
  { key: "durgaPujaNavami", month: 6, krishna: false, tithi: 9, kala: "udaya" },
  { key: "dussehra", month: 6, krishna: false, tithi: 10, kala: "aparahna" },
  { key: "sharadPurnima", month: 6, krishna: false, tithi: 15, kala: "nishita" },
  { key: "ahoiAshtami", month: 6, krishna: true, tithi: 8, kala: "pradosha" },
  { key: "karvaChauth", month: 6, krishna: true, tithi: 4, kala: "moonrise" },
  { key: "govatsaDwadashi", month: 6, krishna: true, tithi: 12, kala: "pradosha" },
  { key: "dhanteras", month: 6, krishna: true, tithi: 13, kala: "pradosha" },
  { key: "kaliChaudas", month: 6, krishna: true, tithi: 14, kala: "nishita" },
  { key: "narakChaturdashi", month: 6, krishna: true, tithi: 14, kala: "arunodaya" },
  { key: "diwali", month: 6, krishna: true, tithi: 15, kala: "pradosha" },
  { key: "kaliPuja", month: 6, krishna: true, tithi: 15, kala: "nishita" },
  { key: "govardhanPuja", month: 7, krishna: false, tithi: 1, kala: "pratahkala" },
  { key: "bhaiDooj", month: 7, krishna: false, tithi: 2, kala: "aparahna" },
  { key: "tulasiVivah", month: 7, krishna: false, tithi: 12, kala: "aparahna" },
  { key: "kartikaPurnima", month: 7, krishna: false, tithi: 15, kala: "udaya" },
  { key: "chhath", month: 7, krishna: false, tithi: 6, kala: "sunset" },
  { key: "kalabhairavJayanti", month: 7, krishna: true, tithi: 8, kala: "udaya" },
  { key: "shakambhariPurnima", month: 9, krishna: false, tithi: 15, kala: "pratahkala" },
  { key: "guptNavratriMagha", month: 10, krishna: false, tithi: 1, kala: "pratahkala", selection: "first" },
  { key: "sakatChauth", month: 9, krishna: true, tithi: 4, kala: "moonrise" },
  { key: "mauniAmavasya", month: 9, krishna: true, tithi: 15, kala: "udaya" },
  { key: "rathaSaptami", month: 10, krishna: false, tithi: 7, kala: "udaya" },
  { key: "vasantPanchami", month: 10, krishna: false, tithi: 5, kala: "purvahna" },
  { key: "lalitaJayanti", month: 10, krishna: false, tithi: 15, kala: "udaya" },
  { key: "mahaShivaratri", month: 10, krishna: true, tithi: 14, kala: "nishita" },
  { key: "vivahPanchami", month: 8, krishna: false, tithi: 5, kala: "udaya" },
  { key: "gitaJayanti", month: 8, krishna: false, tithi: 11, kala: "udaya" },
  { key: "bhairaviJayanti", month: 8, krishna: false, tithi: 15, kala: "madhyahna" },
  { key: "annapurnaJayanti", month: 8, krishna: false, tithi: 15, kala: "madhyahna" },
  { key: "dattatreyaJayanti", month: 8, krishna: false, tithi: 15, kala: "madhyahna" },
  { key: "sheetlaAshtami", month: 11, krishna: true, tithi: 8, kala: "udaya" },
  { key: "holika", month: 11, krishna: false, tithi: 15, policy: "holika" },
];
/* Festival kala are true local intervals derived from sunrise/sunset. The fallback
   path (no coordinates) retains 06:00/18:00 boundaries for validation/import use,
   but every UI caller passes the selected place. Daytime is split into five equal
   parts; Nishita is the central 1/15 of the local night. */
const FAST_KALA_RULES = [
  { baseKey: "ekadashi", tithi: 11, krishna: null, kala: "udaya" },
  { baseKey: "pradosh", tithi: 13, krishna: null, kala: "pradosha" },
  { baseKey: "sankashti", tithi: 4, krishna: true, kala: "moonrise" },
  { baseKey: "vinayakaChaturthi", tithi: 4, krishna: false, kala: "madhyahna" },
  { baseKey: "skandaShashti", tithi: 6, krishna: false, kala: "udaya" },
  { baseKey: "masikDurgashtami", tithi: 8, krishna: false, kala: "udaya" },
  { baseKey: "masikShivaratri", tithi: 14, krishna: true, kala: "nishita" },
  { baseKey: "purnima", tithi: 15, krishna: false, kala: "udaya" },
  { baseKey: "amavasya", tithi: 15, krishna: true, kala: "udaya" },
];
const tithiIndexAt = (ms) => Math.floor(rev(moonSidMs(ms) - sunSidMs(ms)) / 12);
const targetTithiIndex = (krishna, tithi) => (krishna ? 15 : 0) + tithi - 1;
/* Rolling one-entry cache for sequential scanDayParts calls: day k's "tomorrow"
   sunEvents is day k+1's "today", so a multi-day calendar scan halves the work
   (Chip F #4 / CURSOR-SUNEVENTS-01). Key includes lat/lon/tz so DST and place
   changes never reuse a wrong rise/set. */
let _sunEvRoll = null;
function sunEventsRolling(y, m, day, tz, lat, lon) {
  const hit = _sunEvRoll
    && _sunEvRoll.y === y && _sunEvRoll.m === m && _sunEvRoll.day === day
    && _sunEvRoll.tz === tz && _sunEvRoll.lat === lat && _sunEvRoll.lon === lon;
  if (hit) return _sunEvRoll.ev;
  const ev = sunEvents(y, m, day, tz, lat, lon);
  _sunEvRoll = { y, m, day, tz, lat, lon, ev };
  return ev;
}
function scanDayParts(y, m, day, fallbackTz, place) {
  const zone = place && place.zone, lat = Number(place && place.lat), lon = Number(place && place.lon);
  const tz = (zone && zoneOffset(zone, y, m, day)) ?? fallbackTz;
  const nd = new Date(Date.UTC(y, m - 1, day + 1));
  const ny = nd.getUTCFullYear(), nm = nd.getUTCMonth() + 1, nda = nd.getUTCDate();
  const ntz = (zone && zoneOffset(zone, ny, nm, nda)) ?? fallbackTz;
  const noon = Date.UTC(y, m - 1, day, 12) - tz * 3600000;
  let rise = Date.UTC(y, m - 1, day, 6) - tz * 3600000;
  let set = Date.UTC(y, m - 1, day, 18) - tz * 3600000;
  let nextRise = Date.UTC(ny, nm - 1, nda, 6) - ntz * 3600000;
  const hasObserver = Number.isFinite(lat) && Number.isFinite(lon);
  if (hasObserver) {
    const ev = sunEventsRolling(y, m, day, tz, lat, lon);
    const evN = sunEventsRolling(ny, nm, nda, ntz, lat, lon);
    if (ev.rise != null && ev.set != null) { rise = ev.rise; set = ev.set; }
    if (evN.rise != null) nextRise = evN.rise;
  }
  const dayLen = set - rise, nightLen = nextRise - set, nightMid = set + nightLen / 2;
  return {
    y, m, day, tz, noon, rise, set, nextRise, moonrise: undefined, observer: hasObserver ? { lat, lon } : null,
    arunodaya: [rise - 96 * 60000, rise],
    udaya: [rise, rise + 60000],
    pratahkala: [rise, rise + dayLen / 5],
    purvahna: [rise, rise + 2 * dayLen / 5],
    madhyahna: [rise + 2 * dayLen / 5, rise + 3 * dayLen / 5],
    aparahna: [rise + 3 * dayLen / 5, rise + 4 * dayLen / 5],
    sunset: [set - 60000, set + 60000],
    pradosha: [set - dayLen / 10, set + nightLen / 10],
    nishita: [nightMid - nightLen / 30, nightMid + nightLen / 30],
  };
}
function kalaInterval(parts, kala) {
  if (kala === "moonrise") {
    if (parts.moonrise === undefined) {
      parts.moonrise = parts.observer
        ? moonEvents(parts.y, parts.m, parts.day, parts.tz, parts.observer.lat, parts.observer.lon, 1800000).rise
        : Date.UTC(parts.y, parts.m - 1, parts.day, 18) - parts.tz * 3600000;
    }
    return parts.moonrise == null ? null : [parts.moonrise, parts.moonrise + 60000];
  }
  return parts[kala || "udaya"] || parts.udaya;
}
function tithiKalaOverlap(parts, kala, target) {
  if (kala === "moonrise") {
    const noonIdx = tithiIndexAt(parts.noon), delta = (target - noonIdx + 30) % 30;
    if (delta !== 0 && delta !== 1 && delta !== 29) return 0; // avoid an expensive moonrise solve on unrelated tithis
  }
  const span = kalaInterval(parts, kala);
  if (!span || span[1] <= span[0]) return 0;
  const start = span[0] + 1000, end = span[1] - 1000;
  const atStart = tithiIndexAt(start) === target, atEnd = tithiIndexAt(end) === target;
  if (atStart && atEnd) return end - start;
  if (atStart) {
    const exit = solveCross(elongMs, start, ((target + 1) % 30) * 12, 2);
    return Math.max(0, Math.min(end, exit || end) - start);
  }
  if (atEnd) {
    const enter = solveCross(elongMs, start, target * 12, 2);
    return Math.max(0, end - Math.max(start, enter || end));
  }
  return 0;
}
function kalaIsBhadra(parts, kala) {
  const span = kalaInterval(parts, kala);
  if (!span) return true;
  return karanaName(elongMs((span[0] + span[1]) / 2)) === "Vishti";
}
function festivalMatch(f, parts) {
  if (f.skipAdhik && amantaMonthIdx(parts.rise).adhik) return null;
  const target = targetTithiIndex(f.krishna, f.tithi);
  if (f.policy === "chaitraPratipada") {
    const overlap = tithiKalaOverlap(parts, "pratahkala", target);
    if (!overlap) return null;
    const { idx, adhik } = amantaMonthIdx(parts.rise);
    if (adhik) return null;
    if (idx === 0) return { rank: 0, reason: "pratahkala", overlap };
    // Drik Ugadi rule: when Pratipada does not prevail at sunrise, use the day it begins in Pratahkala after Phalgun Amavasya.
    if (idx === 11 && tithiIndexAt(parts.rise) === targetTithiIndex(true, 15)) return { rank: 0, reason: "pratahkala-kshaya", overlap };
    return null;
  }
  if (f.policy === "raksha") {
    for (const [kala, rank] of [["aparahna", 0], ["pradosha", 1], ["udaya", 2]]) {
      const overlap = tithiKalaOverlap(parts, kala, target);
      if (overlap && !kalaIsBhadra(parts, kala)) return { rank, reason: kala, overlap };
    }
    return null;
  }
  if (f.policy === "holika") {
    const pradosha = tithiKalaOverlap(parts, "pradosha", target), udaya = tithiKalaOverlap(parts, "udaya", target);
    if (pradosha && !kalaIsBhadra(parts, "pradosha")) return { rank: 0, reason: "pradosha", overlap: pradosha };
    if (udaya && !kalaIsBhadra(parts, "udaya")) return { rank: 1, reason: "udaya-fallback", overlap: udaya };
    return null;
  }
  const kala = f.kala || "udaya", overlap = tithiKalaOverlap(parts, kala, target);
  return overlap ? { rank: 0, reason: kala, overlap } : null;
}
function scanPanchangCalendar(fromMs, tz, days = 400, fastDays = 46, place = null) {
  const DAY = 86400000, fasts = [], festivals = [], candidates = new Map();
  const start = new Date(fromMs + tz * 3600000);
  const sy = start.getUTCFullYear(), sm = start.getUTCMonth(), sd = start.getUTCDate();
  const monthNames = ["Chaitra", "Vaisakha", "Jyeshtha", "Ashadha", "Shravan", "Bhadrapad", "Ashwin", "Kartik", "Margshirsh", "Paush", "Magh", "Phalgun"];
  for (let k = 0; k < days; k++) {
    const civil = new Date(Date.UTC(sy, sm, sd + k));
    const y = civil.getUTCFullYear(), m = civil.getUTCMonth() + 1, day = civil.getUTCDate();
    const parts = scanDayParts(y, m, day, tz, place), dow = civil.getUTCDay();
    if (k < fastDays) {
      const month = monthNames[(m - 1 + 9) % 12]; // existing display-name mapping; date rules use lunar tithi below
      for (const rule of FAST_KALA_RULES) {
        for (const krishna of rule.krishna == null ? [false, true] : [rule.krishna]) {
          const target = targetTithiIndex(krishna, rule.tithi);
          if (!tithiKalaOverlap(parts, rule.kala, target)) continue;
          const obs = observancesFor(krishna, rule.tithi, month, dow).filter((o) => obsKind(o.key) === rule.baseKey);
          for (const o of obs) {
            if (!o.fasting) continue;
            const prev = [...fasts].reverse().find((x) => x.key === o.key);
            if (prev && parts.noon - prev.ms <= 1.5 * DAY) continue;
            fasts.push({ key: o.key, ms: parts.noon, decidingKala: rule.kala });
          }
        }
      }
    }
    const monthIdx = amantaMonthIdx(parts.rise).idx;
    for (const f of FESTIVALS) {
      if (f.policy !== "chaitraPratipada" && monthIdx !== f.month) continue;
      const match = festivalMatch(f, parts);
      if (!match) continue;
      if (!candidates.has(f.key)) candidates.set(f.key, []);
      candidates.get(f.key).push({ key: f.key, ms: parts.noon, y, m, day, decidingKala: match.reason, rank: match.rank, overlap: match.overlap, selection: f.selection });
    }
  }
  for (const f of FESTIVALS) {
    const all = (candidates.get(f.key) || []).sort((a, b) => a.ms - b.ms);
    if (!all.length) continue;
    const occurrence = all.filter((x) => x.ms - all[0].ms <= 2.5 * DAY);
    occurrence.sort((a, b) => a.rank - b.rank || (a.selection === "first" ? a.ms - b.ms : b.overlap - a.overlap || a.ms - b.ms));
    festivals.push(occurrence[0]);
  }
  const holika = festivals.find((f) => f.key === "holika");
  if (holika) {
    const nd = new Date(Date.UTC(holika.y, holika.m - 1, holika.day + 1));
    const ny = nd.getUTCFullYear(), nm = nd.getUTCMonth() + 1, nda = nd.getUTCDate();
    const ntz = (place && place.zone && zoneOffset(place.zone, ny, nm, nda)) ?? tz;
    festivals.push({ key: "rangwaliHoli", ms: Date.UTC(ny, nm - 1, nda, 12) - ntz * 3600000, decidingKala: "day-after-holika" });
  }
  // Chhath is one four-day observance. The Shashthi sunset is day 3, so surface
  // its two preparation days and the next-sunrise conclusion instead of making
  // the calendar look like a one-day fast.
  const chhath = festivals.find((f) => f.key === "chhath");
  if (chhath) {
    for (const [offset, key, sequenceDay] of [
      [-2, "chhathNahayKhay", 1],
      [-1, "chhathKharna", 2],
      [1, "chhathUshaArghya", 4],
    ]) {
      const d = new Date(Date.UTC(chhath.y, chhath.m - 1, chhath.day + offset));
      const y = d.getUTCFullYear(), m = d.getUTCMonth() + 1, day = d.getUTCDate();
      const dayTz = (place && place.zone && zoneOffset(place.zone, y, m, day)) ?? tz;
      festivals.push({
        key,
        ms: Date.UTC(y, m - 1, day, 12) - dayTz * 3600000,
        y, m, day, sequenceDay,
        decidingKala: offset === 1 ? "next-sunrise" : "sequence-from-shashthi",
      });
    }
  }
  for (const f of solarNakshatraFestivalDays(fromMs, tz, days)) festivals.push(f);
  const vara = varalakshmiDay(fromMs, tz, days, place);
  if (vara) festivals.push({ key: "varalakshmi", ms: vara.ms, y: vara.y, m: vara.m, day: vara.day, decidingKala: "last-shravana-shukla-friday" });
  const mlv = mahalakshmiVratDay(fromMs, tz, days, place);
  if (mlv) festivals.push({ key: "mahalakshmiVrat", ms: mlv.ms, y: mlv.y, m: mlv.m, day: mlv.day, decidingKala: "15th-day-from-bhadrapada-shukla-8" });
  const skanda = skandaSashtiAnchor(fromMs, tz, days, place);
  if (skanda) {
    festivals.push({ key: "skandaSashtiSoorasamharam", ...skanda, sequenceDay: 6, decidingKala: "aippasi-shukla-shashti" });
    for (const [offset, key, sequenceDay] of [
      [-5, "skandaSashtiBegins", 1],
      [1, "skandaSashtiThirukalyanam", 7],
    ]) {
      const d = new Date(Date.UTC(skanda.y, skanda.m - 1, skanda.day + offset));
      const y = d.getUTCFullYear(), m = d.getUTCMonth() + 1, day = d.getUTCDate();
      const dayTz = (place && place.zone && zoneOffset(place.zone, y, m, day)) ?? tz;
      festivals.push({
        key,
        ms: Date.UTC(y, m - 1, day, 12) - dayTz * 3600000,
        y, m, day, sequenceDay,
        decidingKala: offset === 1 ? "next-sunrise" : "sequence-from-shashti",
      });
    }
  }
  // Vishu (Mesha Sankranti under Kerala's day rule) and the two endpoints of
  // Ayyappa's inclusive 41-day Mandala Vratham.
  const firstNoon = localNoon(fromMs, tz), rangeEnd = firstNoon + days * DAY;
  const firstYear = new Date(firstNoon + tz * 3600000).getUTCFullYear();
  for (let gy = firstYear - 1; gy <= firstYear + 2; gy++) {
    try {
      const mesha = solveCross(sunSidMs, Date.UTC(gy, 2, 18), 0, 45);
      if (mesha) {
        // Vishukkani is viewed at the first dawn after Mesha Sankranti. This is
        // distinct from the civil date carrying the Sankranti itself (e.g. Drik:
        // ingress 14 Apr 2026 morning, Vishukkani 15 Apr).
        const vishu = firstSunriseDayAfter(mesha, tz);
        if (vishu >= firstNoon && vishu < rangeEnd) festivals.push({ key: "vishu", ms: vishu, ingress: mesha });
      }
      const vrischika = solveCross(sunSidMs, Date.UTC(gy, 9, 20), 210, 45);
      if (vrischika) {
        const start = malayalamSankrantiDay(vrischika, tz), end = start + 40 * DAY;
        if (start >= firstNoon && start < rangeEnd) festivals.push({ key: "ayyappaMandalaBegins", ms: start, spanEnd: end });
        if (end >= firstNoon && end < rangeEnd) festivals.push({ key: "ayyappaMandalaPuja", ms: end, spanStart: start });
      }
    } catch (e) {}
  }
  // Twelve monthly sankrantis (solar ingress) + pongal label on Makar.
  for (const s of SANKRANTI_FESTIVALS) {
    try {
      const ingress = solveCross(sunSidMs, fromMs, s.deg, days);
      if (ingress && ingress < fromMs + days * DAY) {
        festivals.push({ key: s.key, ms: ingress, decidingKala: "solar-ingress" });
        if (s.key === "makarSankranti") {
          festivals.push({ key: "pongal", ms: ingress, decidingKala: "same-as-makar-sankranti" });
        }
      }
    } catch (e) {}
  }
  for (const g of grahanDays(fromMs, tz, days)) festivals.push(g);
  const kanyaSk = festivals.find((f) => f.key === "kanyaSankranti");
  if (kanyaSk) festivals.push({ key: "vishwakarmaPuja", ms: kanyaSk.ms, decidingKala: "kanya-sankranti-vishwakarma" });
  // Pitru Paksha list bookends — engine already computes daily shraddha tithi;
  // surface the fortnight's opening Purnima Shraddha and closing Mahalaya.
  for (let k = 0; k < days; k++) {
    const civil = new Date(Date.UTC(sy, sm, sd + k));
    const y = civil.getUTCFullYear(), m = civil.getUTCMonth() + 1, day = civil.getUTCDate();
    const parts = scanDayParts(y, m, day, tz, place);
    const pp = pitruPakshaDay(parts.rise, parts.set);
    if (!pp || !pp.special) continue;
    if (pp.special === "purnimaShraddha") festivals.push({ key: "pitruPakshaBegins", ms: parts.noon, y, m, day, decidingKala: "aparahna-shraddha" });
    if (pp.special === "mahalaya") festivals.push({ key: "sarvaPitruAmavasya", ms: parts.noon, y, m, day, decidingKala: "aparahna-shraddha" });
  }
  // Ghatasthapana labels — same Pratipada mornings as Navratri begins.
  const chNav = festivals.find((f) => f.key === "chaitraNavratri");
  if (chNav) festivals.push({ key: "chaitraGhatasthapana", ms: chNav.ms, y: chNav.y, m: chNav.m, day: chNav.day, decidingKala: "ghatasthapana-pratipada" });
  const shNav = festivals.find((f) => f.key === "sharadNavratri");
  if (shNav) festivals.push({ key: "sharadGhatasthapana", ms: shNav.ms, y: shNav.y, m: shNav.m, day: shNav.day, decidingKala: "ghatasthapana-pratipada" });
  const ashtami = festivals.find((f) => f.key === "mahaAshtami");
  if (ashtami) festivals.push({ key: "sandhiPuja", ms: ashtami.ms, y: ashtami.y, m: ashtami.m, day: ashtami.day, decidingKala: "ashtami-navami-sandhi" });
  const mahalaya = festivals.find((f) => f.key === "sarvaPitruAmavasya");
  if (mahalaya) festivals.push({ key: "durgaPujaMahalaya", ms: mahalaya.ms, y: mahalaya.y, m: mahalaya.m, day: mahalaya.day, decidingKala: "mahalaya-amavasya" });
  const dashami = festivals.find((f) => f.key === "dussehra");
  if (dashami) festivals.push({ key: "durgaPujaDashami", ms: dashami.ms, y: dashami.y, m: dashami.m, day: dashami.day, decidingKala: "vijayadashami" });
  const kali = festivals.find((f) => f.key === "kaliPuja");
  if (kali) festivals.push({ key: "kamalaJayanti", ms: kali.ms, y: kali.y, m: kali.m, day: kali.day, decidingKala: "kartik-amavasya-purnimanta" });
  const sharadPurnima = festivals.find((f) => f.key === "sharadPurnima");
  if (sharadPurnima) festivals.push({ key: "kojagaraPuja", ms: sharadPurnima.ms, y: sharadPurnima.y, m: sharadPurnima.m, day: sharadPurnima.day, decidingKala: "kojagara-nishita-purnima" });
  const durgaShashthi = festivals.find((f) => f.key === "durgaPujaShashthi");
  if (durgaShashthi) festivals.push({ key: "saraswatiAvahan", ms: durgaShashthi.ms, y: durgaShashthi.y, m: durgaShashthi.m, day: durgaShashthi.day, decidingKala: "durga-shashthi-saraswati-avahan" });
  const durgaSaptami = festivals.find((f) => f.key === "durgaPujaSaptami");
  if (durgaSaptami) festivals.push({ key: "saraswatiPuja", ms: durgaSaptami.ms, y: durgaSaptami.y, m: durgaSaptami.m, day: durgaSaptami.day, decidingKala: "durga-saptami-saraswati-puja" });
  const shPurnima = festivals.find((f) => f.key === "shakambhariPurnima");
  if (shPurnima) {
    const d = new Date(Date.UTC(shPurnima.y, shPurnima.m - 1, shPurnima.day - 7));
    const y = d.getUTCFullYear(), m = d.getUTCMonth() + 1, day = d.getUTCDate();
    const dayTz = (place && place.zone && zoneOffset(place.zone, y, m, day)) ?? tz;
    festivals.push({
      key: "shakambhariNavratriBegins",
      ms: Date.UTC(y, m - 1, day, 12) - dayTz * 3600000,
      y, m, day, sequenceDay: 1,
      decidingKala: "paush-shukla-ashtami-span",
    });
  }
  festivals.sort((a, b) => a.ms - b.ms);
  return { fasts, festivals };
}


/* classify an observance key to its base kind */
const obsKind = (key) => (key === "ekadashi" || /_11$/.test(key)) ? "ekadashi" : (key || "").startsWith("pradosh") ? "pradosh" : key;

export {
  SOLAR_NAK_FESTIVALS, ayyappaMandalaFor, EKADASHI_NAMES,
  PRADOSH_NAMES_BY_DAY, observancesFor, FESTIVALS, FAST_KALA_RULES,
  scanPanchangCalendar, obsKind,
};
