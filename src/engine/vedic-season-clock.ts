/* Sidereal Ritu, tropical equinox/solstice crossings and sunrise-based Ghati clock. */

import { rev, sunPos } from "./ephemeris";
import {
  setAyanMode, sunSidMs, sunEvents, solveCross, zoneOffset, SIGNS,
} from "./panchang";

const RITU_DEFS = Object.freeze([
  { key: "vasanta", en: "Vasanta (Spring)", hi: "वसन्त (बसन्त)", signs: ["Mesha", "Vrishabha"], signHi: ["मेष", "वृषभ"] },
  { key: "grishma", en: "Grishma (Summer)", hi: "ग्रीष्म (गर्मी)", signs: ["Mithuna", "Karka"], signHi: ["मिथुन", "कर्क"] },
  { key: "varsha", en: "Varsha (Monsoon)", hi: "वर्षा (बारिश)", signs: ["Simha", "Kanya"], signHi: ["सिंह", "कन्या"] },
  { key: "sharad", en: "Sharad (Autumn)", hi: "शरद् (पतझड़)", signs: ["Tula", "Vrishchika"], signHi: ["तुला", "वृश्चिक"] },
  { key: "hemant", en: "Hemant (Pre-winter)", hi: "हेमन्त (शीत की पूर्वसंध्या)", signs: ["Dhanu", "Makar"], signHi: ["धनु", "मकर"] },
  { key: "shishir", en: "Shishir (Winter)", hi: "शिशिर (सर्दी)", signs: ["Kumbha", "Meena"], signHi: ["कुम्भ", "मीन"] },
]);

const TROPICAL_EVENTS = Object.freeze([
  { key: "vernalEquinox", deg: 0, en: "Vernal equinox", hi: "वसंत विषुव", glossEn: "day and night are nearly equal as the Sun crosses the celestial equator northward", glossHi: "सूर्य खगोलीय विषुवत रेखा पार करते हुए दिन-रात लगभग समान होते हैं" },
  { key: "summerSolstice", deg: 90, en: "Summer solstice", hi: "ग्रीष्म अयन", glossEn: "the Sun reaches its northernmost point — the astronomical start of Uttarayana in the tropical year", glossHi: "सूर्य अपने उत्तरीतम बिंदु पर — खगोलीय वर्ष में उत्तरायण का आरम्भ" },
  { key: "autumnEquinox", deg: 180, en: "Autumn equinox", hi: "शरद् विषुव", glossEn: "day and night are nearly equal as the Sun crosses southward", glossHi: "सूर्य दक्षिण की ओर जाते हुए दिन-रात लगभग समान होते हैं" },
  { key: "winterSolstice", deg: 270, en: "Winter solstice", hi: "शीत अयन", glossEn: "the Sun reaches its southernmost point — the astronomical start of Dakshinayana", glossHi: "सूर्य अपने दक्षिणतम बिंदु पर — खगोलीय दक्षिणायण का आरम्भ" },
]);

const tropicalSunMs = (ms) => {
  const d = ms / 86400000 + 2440587.5 - 2451543.5;
  return rev(sunPos(d).lon);
};

function localYmd(ms, tz) {
  const d = new Date(ms + tz * 3600000);
  return { y: d.getUTCFullYear(), m: d.getUTCMonth() + 1, day: d.getUTCDate() };
}

function sunrisePair(place, atMs, tz) {
  const { y, m, day } = localYmd(atMs, tz);
  const today = sunEvents(y, m, day, tz, place.lat, place.lon);
  if (today.rise == null) return null;
  const next = localYmd(atMs + 86400000, tz);
  const tomorrow = sunEvents(next.y, next.m, next.day, tz, place.lat, place.lon);
  if (tomorrow.rise == null) return null;
  let sunrise = today.rise;
  let nextSunrise = tomorrow.rise;
  if (atMs < today.rise) {
    const prev = localYmd(atMs - 86400000, tz);
    const yesterday = sunEvents(prev.y, prev.m, prev.day, tz, place.lat, place.lon);
    if (yesterday.rise == null) return null;
    sunrise = yesterday.rise;
    nextSunrise = today.rise;
  }
  return { sunrise, nextSunrise };
}

function ghatiFromSunrise(atMs, sunrise, nextSunrise) {
  const span = nextSunrise - sunrise;
  if (!(span > 0)) return null;
  const fraction = Math.max(0, Math.min(1, (atMs - sunrise) / span));
  const totalGhatis = fraction * 60;
  const ghati = Math.min(59, Math.floor(totalGhatis));
  const remG = totalGhatis - ghati;
  const pal = Math.min(59, Math.floor(remG * 60));
  const vipal = Math.min(59, Math.floor((remG * 60 - pal) * 60));
  return { ghati, pal, vipal, fraction, sunrise, nextSunrise };
}

function nextTropicalEvent(fromMs) {
  let best = null;
  for (const event of TROPICAL_EVENTS) {
    let ms = solveCross(tropicalSunMs, fromMs, event.deg, 400);
    if (ms <= fromMs + 60000) ms = solveCross(tropicalSunMs, ms + 86400000, event.deg, 400);
    if (!best || ms < best.ms) best = { event, ms };
  }
  return best;
}

function computeVedicSeasonClock(place, ayanamsa = "lahiri", atMs = null) {
  setAyanMode(ayanamsa);
  const now = atMs != null ? atMs : Date.now();
  const probe = new Date(now);
  const tz = zoneOffset(place.zone, probe.getUTCFullYear(), probe.getUTCMonth() + 1, probe.getUTCDate()) ?? 5.5;
  const sunSid = sunSidMs(now);
  const signIdx = Math.floor(sunSid / 30);
  const rituIdx = Math.floor(sunSid / 60) % 6;
  const ritu = RITU_DEFS[rituIdx];
  const nextBoundaryDeg = ((rituIdx + 1) * 60) % 360;
  const rituStart = solveCross(sunSidMs, now - 70 * 86400000, rituIdx * 60, 70);
  const rituNext = solveCross(sunSidMs, now, nextBoundaryDeg === 0 ? 360 : nextBoundaryDeg, 70);
  const nextRitu = RITU_DEFS[(rituIdx + 1) % 6];
  const sunPair = sunrisePair(place, now, tz);
  const ghati = sunPair ? ghatiFromSunrise(now, sunPair.sunrise, sunPair.nextSunrise) : null;
  const tropical = nextTropicalEvent(now);
  const sunSign = SIGNS[signIdx].split(" ")[0];
  return {
    tz,
    atMs: now,
    ritu: {
      ...ritu,
      sign: sunSign,
      signHi: ritu.signHi[signIdx % 2],
      startMs: rituStart,
      nextMs: rituNext,
      next: nextRitu,
    },
    ghati,
    tropicalNext: tropical ? { ...tropical.event, ms: tropical.ms } : null,
    tropicalNowDeg: tropicalSunMs(now),
    sunSidDeg: sunSid,
  };
}

export {
  RITU_DEFS, TROPICAL_EVENTS, computeVedicSeasonClock, tropicalSunMs, ghatiFromSunrise,
};
