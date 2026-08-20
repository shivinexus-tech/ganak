/* City-specific Lakshmi Puja windows on Diwali Amavasya.
   Pradosh Kaal and Nishita come from the SINGLE app-wide definitions in
   daily-windows.ts — this file used to carry its own copies. They were the
   correct ones; the Panchang card and the festival day-decider disagreed with
   them by about an hour at each end. Sourced in
   plans/research/pradosha-definition.md; the same functions now decide the
   observance day in festivals.ts, so the day and the window can no longer fork.
   The primary muhurat is Vrishabha (sthir) lagna intersecting Pradosh while Amavasya
   prevails — the usual North-Indian household rule. Benchmark: validation/lakshmi-puja-timings.cjs */

import { rev } from "./ephemeris";
import { computeLagnaPanchaka } from "./panchaka";
import { sidereal, solveCross, sunEvents, zoneOffset } from "./panchang";
import { pradoshaWindow, nishithaWindow } from "./daily-windows";

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

function amavasyaBounds(S, referenceMs) {
  const start = solveCross(S.elongMs, referenceMs - 2 * 86400000, 348, 5);
  if (start == null) return null;
  const end = solveCross(S.elongMs, start + MINUTE, 0, 3);
  if (end == null || !(end > start)) return null;
  return { start, end };
}

function tithiIsAmavasya(S, ms) {
  return Math.floor(rev(S.elongMs(ms)) / 12) === 29;
}

function lakshmiPujaTimings(place, ayanamsa = "lahiri", ms) {
  requirePlace(place);
  const S = sidereal(ayanamsa);   // bound to THIS call — never a shared global (F8)
  const probe = new Date(ms);
  const tz = zoneOffset(place.zone, probe.getUTCFullYear(), probe.getUTCMonth() + 1, probe.getUTCDate()) ?? 5.5;
  const local = new Date(ms + tz * 3600000);
  const y = local.getUTCFullYear(), m = local.getUTCMonth() + 1, day = local.getUTCDate();
  const ev = sunEvents(y, m, day, tz, place.lat, place.lon);
  const evN = sunEvents(y, m, day + 1, tz, place.lat, place.lon);
  if (ev.rise == null || ev.set == null || evN.rise == null) throw new Error("sun-events-unavailable");
  const pradosh = pradoshaWindow(ev.set, evN.rise);
  const nishita = nishithaWindow(ev.set, evN.rise);
  const { lagnaSchedule } = computeLagnaPanchaka(place, ayanamsa, ev.rise);
  let vrishabha = null;
  let primary = null;
  for (const w of lagnaSchedule) {
    if (w.sign !== VRISHABHA_SIGN) continue;
    const inPradosh = intersectWindow(w, pradosh);
    if (!inPradosh || inPradosh.start < ev.set) continue;
    if (!vrishabha || w.start >= vrishabha.start) vrishabha = w;
    const mid = (inPradosh.start + inPradosh.end) / 2;
    if (!tithiIsAmavasya(S, mid)) continue;
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
    amavasya: amavasyaBounds(S, ms),
  };
}

export { lakshmiPujaTimings };
