/* City-specific Lakshmi Puja windows on Diwali Amavasya.
   Pradosh Kaal follows Drik Panchang: sunset through the first fifth of the night.
   The primary muhurat is Vrishabha (sthir) lagna intersecting Pradosh while Amavasya
   prevails — the usual North-Indian household rule. Benchmark: validation/lakshmi-puja-timings.cjs */

import { rev } from "./ephemeris";
import { computeLagnaPanchaka } from "./panchaka";
import { elongMs, setAyanMode, solveCross, sunEvents, zoneOffset } from "./panchang";

const VRISHABHA_SIGN = 1;
const MINUTE = 60000;

function requirePlace(place) {
  if (!place || !place.zone || !Number.isFinite(place.lat) || !Number.isFinite(place.lon)) {
    throw new Error("place-required");
  }
}

function intersectWindow(a, b) {
  const start = Math.max(a.start, b.start);
  const end = Math.min(a.end, b.end);
  return end > start ? { start, end } : null;
}

function amavasyaBounds(referenceMs) {
  const start = solveCross(elongMs, referenceMs - 2 * 86400000, 348, 5);
  if (start == null) return null;
  const end = solveCross(elongMs, start + MINUTE, 0, 3);
  if (end == null || !(end > start)) return null;
  return { start, end };
}

function tithiIsAmavasya(ms) {
  return Math.floor(rev(elongMs(ms)) / 12) === 29;
}

function lakshmiPujaTimings(place, ayanamsa = "lahiri", ms) {
  requirePlace(place);
  setAyanMode(ayanamsa);
  const probe = new Date(ms);
  const tz = zoneOffset(place.zone, probe.getUTCFullYear(), probe.getUTCMonth() + 1, probe.getUTCDate()) ?? 5.5;
  const local = new Date(ms + tz * 3600000);
  const y = local.getUTCFullYear(), m = local.getUTCMonth() + 1, day = local.getUTCDate();
  const ev = sunEvents(y, m, day, tz, place.lat, place.lon);
  const evN = sunEvents(y, m, day + 1, tz, place.lat, place.lon);
  if (ev.rise == null || ev.set == null || evN.rise == null) throw new Error("sun-events-unavailable");
  const nightLen = evN.rise - ev.set;
  const nightMid = ev.set + nightLen / 2;
  const pradosh = { start: ev.set, end: ev.set + nightLen / 5 };
  const nishita = { start: nightMid - nightLen / 30, end: nightMid + nightLen / 30 };
  const { lagnaSchedule } = computeLagnaPanchaka(place, ayanamsa, ev.rise);
  let vrishabha = null;
  let primary = null;
  for (const w of lagnaSchedule) {
    if (w.sign !== VRISHABHA_SIGN) continue;
    const inPradosh = intersectWindow(w, pradosh);
    if (!inPradosh || inPradosh.start < ev.set) continue;
    if (!vrishabha || w.start >= vrishabha.start) vrishabha = w;
    const mid = (inPradosh.start + inPradosh.end) / 2;
    if (!tithiIsAmavasya(mid)) continue;
    if (!primary || inPradosh.start > primary.start) primary = inPradosh;
  }
  return {
    tz,
    rise: ev.rise,
    set: ev.set,
    pradosh,
    vrishabha,
    primary,
    nishita,
    amavasya: amavasyaBounds(ms),
  };
}

export { lakshmiPujaTimings };
