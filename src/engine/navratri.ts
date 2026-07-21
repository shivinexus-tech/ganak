/* City-specific Navratri timing rules.
   - Ghatasthapana: the first third of the local daylight period while Shukla
     Pratipada prevails; Abhijit is the published fallback/additional window.
     A dual-sign lagna overlap is returned as a preferred sub-window when present.
   - Full-fast parana: Dashami after Navami ends. If Navami ends before sunrise,
     use sunrise; if it ends during daylight, use the tithi end; if it ends after
     sunset, use the following sunrise.

   Benchmark/rule sources are recorded in validation/navratri-timings.cjs and the
   Gupt Navratri research docs. Astronomy remains Lahiri, matching Ganak defaults. */

import { ascendantAt, rev } from "./ephemeris";
import {
  ayanAt, elongMs, jdOf, setAyanMode, solveCross, sunEvents, zoneOffset,
} from "./panchang";

const DAY = 86400000;
const MINUTE = 60000;
const DUAL_SIGNS = new Set([2, 5, 8, 11]); // Mithuna, Kanya, Dhanu, Meena

function requirePlace(place) {
  if (!place || !place.zone || !Number.isFinite(place.lat) || !Number.isFinite(place.lon)) {
    throw new Error("place-required");
  }
}

function localDateAt(ms, zone) {
  let probe = new Date(ms);
  let tz = zoneOffset(zone, probe.getUTCFullYear(), probe.getUTCMonth() + 1, probe.getUTCDate()) ?? 0;
  for (let i = 0; i < 2; i++) {
    probe = new Date(ms + tz * 3600000);
    const y = probe.getUTCFullYear(), m = probe.getUTCMonth() + 1, day = probe.getUTCDate();
    const corrected = zoneOffset(zone, y, m, day);
    if (corrected == null || corrected === tz) return { y, m, day, tz };
    tz = corrected;
  }
  probe = new Date(ms + tz * 3600000);
  return { y: probe.getUTCFullYear(), m: probe.getUTCMonth() + 1, day: probe.getUTCDate(), tz };
}

function shiftCivilDate({ y, m, day }, amount) {
  const d = new Date(Date.UTC(y, m - 1, day + amount));
  return { y: d.getUTCFullYear(), m: d.getUTCMonth() + 1, day: d.getUTCDate() };
}

function solarDay(place, civil) {
  const tz = zoneOffset(place.zone, civil.y, civil.m, civil.day) ?? 0;
  const events = sunEvents(civil.y, civil.m, civil.day, tz, place.lat, place.lon);
  return { ...civil, tz, ...events };
}

function shuklaPratipadaBounds(referenceMs) {
  const start = solveCross(elongMs, referenceMs - 3 * DAY, 0, 5);
  const end = start == null ? null : solveCross(elongMs, start + MINUTE, 12, 2);
  if (start == null || end == null || !(start < end)) throw new Error("pratipada-not-found");
  return { start, end };
}

function intersectWindow(window, lower, upper) {
  const start = Math.max(window.start, lower);
  const end = Math.min(window.end, upper);
  return end > start ? { start, end } : null;
}

function dualSignWindows(place, start, end) {
  if (!(end > start)) return [];
  const signAt = (ms) => {
    const jd = jdOf(ms);
    return Math.floor(rev(ascendantAt(jd, place.lat, place.lon, ayanAt(jd))) / 30);
  };
  const out = [];
  let segmentStart = start, sign = signAt(start);
  for (let t = Math.min(start + MINUTE, end); t <= end; t = Math.min(t + MINUTE, end)) {
    const nextSign = signAt(t);
    if (nextSign !== sign) {
      let lo = Math.max(start, t - MINUTE), hi = t;
      for (let i = 0; i < 18; i++) {
        const mid = (lo + hi) / 2;
        if (signAt(mid) === sign) lo = mid; else hi = mid;
      }
      if (DUAL_SIGNS.has(sign) && hi > segmentStart) out.push({ start: segmentStart, end: hi, sign });
      segmentStart = hi;
      sign = nextSign;
    }
    if (t === end) break;
  }
  if (DUAL_SIGNS.has(sign) && end > segmentStart) out.push({ start: segmentStart, end, sign });
  return out.filter((window) => window.end - window.start >= MINUTE);
}

function ghatasthapanaFor(place, referenceMs, tithi) {
  const local = localDateAt(referenceMs, place.zone);
  const day = solarDay(place, local);
  if (day.rise == null || day.set == null || day.transit == null) throw new Error("sun-events-unavailable");
  const dayLength = day.set - day.rise;
  const firstThird = { start: day.rise, end: day.rise + dayLength / 3 };
  const primary = intersectWindow(firstThird, tithi.start, tithi.end);
  const weekday = new Date(Date.UTC(day.y, day.m - 1, day.day)).getUTCDay();
  const abhijitRaw = weekday === 3
    ? null
    : { start: day.transit - dayLength / 30, end: day.transit + dayLength / 30 };
  const abhijit = abhijitRaw ? intersectWindow(abhijitRaw, tithi.start, tithi.end) : null;
  const preferred = primary ? dualSignWindows(place, primary.start, primary.end) : [];
  return {
    rise: day.rise,
    set: day.set,
    transit: day.transit,
    tithiStart: tithi.start,
    tithiEnd: tithi.end,
    primary,
    preferred,
    abhijit,
  };
}

function navratriParanaFor(place, tithi) {
  const navamiEnd = solveCross(elongMs, tithi.start + 7 * DAY, 108, 4);
  if (navamiEnd == null) throw new Error("navami-end-not-found");
  const local = localDateAt(navamiEnd, place.zone);
  const day = solarDay(place, local);
  if (day.rise == null || day.set == null) throw new Error("sun-events-unavailable");

  let start, basis, paranaDay = day;
  if (navamiEnd <= day.rise) {
    start = day.rise;
    basis = "sunrise";
  } else if (navamiEnd <= day.set) {
    start = navamiEnd;
    basis = "navami-end";
  } else {
    paranaDay = solarDay(place, shiftCivilDate(local, 1));
    if (paranaDay.rise == null) throw new Error("sun-events-unavailable");
    start = paranaDay.rise;
    basis = "next-sunrise";
  }
  return {
    start,
    basis,
    navamiEnd,
    y: paranaDay.y,
    m: paranaDay.m,
    day: paranaDay.day,
  };
}

function navratriTimings(place, navratriStartMs) {
  requirePlace(place);
  if (!Number.isFinite(navratriStartMs)) throw new Error("start-required");
  setAyanMode("lahiri");
  const local = localDateAt(navratriStartMs, place.zone);
  const tithi = shuklaPratipadaBounds(navratriStartMs);
  return {
    tz: local.tz,
    ghatasthapana: ghatasthapanaFor(place, navratriStartMs, tithi),
    parana: navratriParanaFor(place, tithi),
  };
}

/* The Navadurga form follows the Shukla tithi prevailing at local sunrise, not
   an unconditional start-date + N offset. A vriddhi tithi can therefore give one
   form two sunrise dates; a kshaya tithi can give it no standalone sunrise date.
   Day 1 is the selected Navratri opening civil day because the accepted
   Ghatasthapana rule can begin after sunrise when Pratipada starts later that day. */
function navadurgaDatesFor(place, navratriStartMs, formDay) {
  requirePlace(place);
  if (!Number.isFinite(navratriStartMs)) throw new Error("start-required");
  if (!Number.isInteger(formDay) || formDay < 1 || formDay > 9) throw new Error("form-day-required");
  setAyanMode("lahiri");
  const startCivil = localDateAt(navratriStartMs, place.zone);
  const dates = [];
  for (let offset = 0; offset < 12; offset++) {
    const civil = shiftCivilDate(startCivil, offset);
    const solar = solarDay(place, civil);
    if (solar.rise == null) continue;
    const tithiIndex = Math.floor(elongMs(solar.rise) / 12);
    const shuklaTithi = tithiIndex < 15 ? tithiIndex + 1 : null;
    if ((formDay === 1 && offset === 0) || (formDay > 1 && shuklaTithi === formDay)) {
      dates.push({ y: solar.y, m: solar.m, day: solar.day, tz: solar.tz, rise: solar.rise, tithi: shuklaTithi });
    }
  }
  return {
    formDay,
    targetTithi: formDay,
    status: dates.length === 0 ? "skipped" : (dates.length > 1 ? "repeated" : "single"),
    dates,
  };
}

export { navratriTimings, navadurgaDatesFor, ghatasthapanaFor, navratriParanaFor };
