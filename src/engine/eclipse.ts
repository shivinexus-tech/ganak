/* Eclipse visibility and Sutak windows for grahan festival pages.
   Convention: 12h Sutak before solar grahan, 9h before lunar grahan (Drik household rule).
   Solar visibility is topocentric: the Moon must actually cover the Sun at the
   selected place, not merely be near syzygy geocentrically. */

import { sunEvents, moonEvents, zoneOffset } from "./panchang";
import { D2R, rev, sunPos, moonGeo, jdeFromD } from "./ephemeris";

const HOUR = 3600000;
const DAY = 86400000;
const R2D = 1 / D2R;
const EARTH_RADIUS_KM = 6378.137;
const MOON_RADIUS_KM = 1737.4;
const AU_KM = 149597870.7;
const SOLAR_SEARCH_HOURS = 7;
const LUNAR_SEARCH_HOURS = 6;
const CONTACT_STEP_MS = 5 * 60000;

function requirePlace(place) {
  if (!place || !place.zone || !Number.isFinite(place.lat) || !Number.isFinite(place.lon)) {
    throw new Error("place-required");
  }
}

function civilParts(ms, tz) {
  const d = new Date(ms + tz * HOUR);
  return { y: d.getUTCFullYear(), m: d.getUTCMonth() + 1, day: d.getUTCDate(), tz };
}

function unitFromEcliptic(lonDeg, latDeg, ms) {
  const JD = ms / DAY + 2440587.5;
  const d = JD - 2451543.5;
  const eps = (23.4393 - 3.563e-7 * d) * D2R;
  const lon = lonDeg * D2R;
  const lat = latDeg * D2R;
  const x = Math.cos(lat) * Math.cos(lon);
  const yEcl = Math.cos(lat) * Math.sin(lon);
  const zEcl = Math.sin(lat);
  return {
    x,
    y: yEcl * Math.cos(eps) - zEcl * Math.sin(eps),
    z: yEcl * Math.sin(eps) + zEcl * Math.cos(eps),
  };
}

function normalize(v) {
  const r = Math.hypot(v.x, v.y, v.z);
  return { x: v.x / r, y: v.y / r, z: v.z / r };
}

function angularSep(a, b) {
  const dot = Math.max(-1, Math.min(1, a.x * b.x + a.y * b.y + a.z * b.z));
  return Math.acos(dot) * R2D;
}

function observerVector(ms, place) {
  const JD = ms / DAY + 2440587.5;
  const gmst = rev(280.46061837 + 360.98564736629 * (JD - 2451545)) * D2R;
  const theta = gmst + place.lon * D2R;
  const lat = place.lat * D2R;
  return {
    x: Math.cos(lat) * Math.cos(theta),
    y: Math.cos(lat) * Math.sin(theta),
    z: Math.sin(lat),
  };
}

function solarContactMetric(ms, place) {
  const JD = ms / DAY + 2440587.5;
  const d = JD - 2451543.5;
  const sun = sunPos(d);
  const moon = moonGeo(jdeFromD(d));
  const obs = observerVector(ms, place);
  const sunUnit = unitFromEcliptic(sun.lon, 0, ms);
  const moonUnit = unitFromEcliptic(moon.lon, moon.lat, ms);
  const sunDistEarthRadii = (AU_KM * sun.r) / EARTH_RADIUS_KM;
  const moonDistEarthRadii = moon.dist / EARTH_RADIUS_KM;
  const sunTopo = normalize({
    x: sunUnit.x * sunDistEarthRadii - obs.x,
    y: sunUnit.y * sunDistEarthRadii - obs.y,
    z: sunUnit.z * sunDistEarthRadii - obs.z,
  });
  const moonTopo = normalize({
    x: moonUnit.x * moonDistEarthRadii - obs.x,
    y: moonUnit.y * moonDistEarthRadii - obs.y,
    z: moonUnit.z * moonDistEarthRadii - obs.z,
  });
  const sep = angularSep(sunTopo, moonTopo);
  const sunRadius = (959.63 / 3600) / sun.r;
  const moonRadius = Math.asin(MOON_RADIUS_KM / moon.dist) * R2D;
  return sep - (sunRadius + moonRadius);
}

function lunarUmbralMetric(ms) {
  const JD = ms / DAY + 2440587.5;
  const d = JD - 2451543.5;
  const sun = sunPos(d);
  const moon = moonGeo(jdeFromD(d));
  const moonUnit = unitFromEcliptic(moon.lon, moon.lat, ms);
  const antiSun = unitFromEcliptic(rev(sun.lon + 180), 0, ms);
  const sep = angularSep(moonUnit, antiSun);
  const moonRadius = Math.asin(MOON_RADIUS_KM / moon.dist) * R2D;
  // Approximate umbral radius at the Moon. This is deliberately umbral, not
  // penumbral, because Hindu Sutak/Moksha follows the visible shadow phase.
  const umbraRadius = 0.73;
  return sep - (umbraRadius + moonRadius);
}

function refineCross(metricFn, a, b) {
  let lo = a;
  let hi = b;
  const fa0 = metricFn(lo);
  for (let i = 0; i < 34; i++) {
    const mid = (lo + hi) / 2;
    const fm = metricFn(mid);
    if ((fa0 <= 0) === (fm <= 0)) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

function contactWindow(eclipseMs, metricFn, spanHours) {
  const start = eclipseMs - spanHours * HOUR;
  const end = eclipseMs + spanHours * HOUR;
  let prevT = start;
  let prev = metricFn(prevT);
  let first = prev <= 0 ? start : null;
  let last = null;
  for (let t = start + CONTACT_STEP_MS; t <= end; t += CONTACT_STEP_MS) {
    const cur = metricFn(t);
    if (prev > 0 && cur <= 0 && first == null) first = refineCross(metricFn, prevT, t);
    if (prev <= 0 && cur > 0) last = refineCross(metricFn, prevT, t);
    prev = cur;
    prevT = t;
  }
  if (first != null && last == null && prev <= 0) last = end;
  if (first == null || last == null || last <= first) return null;
  return { start: first, maximum: eclipseMs, end: last };
}

function luminaryIntervals(kind, place, tz, startMs, endMs) {
  const intervals = [];
  const firstDay = Math.floor((startMs + tz * HOUR) / DAY) - 1;
  const lastDay = Math.floor((endMs + tz * HOUR) / DAY) + 1;
  for (let dayNo = firstDay; dayNo <= lastDay; dayNo++) {
    const localStart = dayNo * DAY - tz * HOUR;
    const dt = new Date(localStart + 12 * HOUR);
    const y = dt.getUTCFullYear();
    const m = dt.getUTCMonth() + 1;
    const day = dt.getUTCDate();
    const events = kind === "solar"
      ? sunEvents(y, m, day, tz, place.lat, place.lon)
      : moonEvents(y, m, day, tz, place.lat, place.lon);
    const rise = events.rise;
    const set = events.set;
    if (rise == null || set == null) continue;
    if (rise <= set) {
      intervals.push({ start: rise, end: set });
    } else {
      intervals.push({ start: localStart, end: set });
      intervals.push({ start: rise, end: localStart + DAY });
    }
  }
  return intervals
    .map((w) => ({ start: Math.max(w.start, startMs), end: Math.min(w.end, endMs) }))
    .filter((w) => w.end > w.start)
    .sort((a, b) => a.start - b.start);
}

function visibleOverlap(contact, intervals) {
  for (const w of intervals) {
    const start = Math.max(contact.start, w.start);
    const end = Math.min(contact.end, w.end);
    if (end > start) return { start, end };
  }
  return null;
}

function eclipseDetail(place, eclipseMs, key) {
  requirePlace(place);
  const probe = new Date(eclipseMs);
  const tz = zoneOffset(place.zone, probe.getUTCFullYear(), probe.getUTCMonth() + 1, probe.getUTCDate()) ?? 5.5;
  const solar = key === "suryaGrahan";
  const contacts = solar
    ? contactWindow(eclipseMs, (ms) => solarContactMetric(ms, place), SOLAR_SEARCH_HOURS)
    : contactWindow(eclipseMs, lunarUmbralMetric, LUNAR_SEARCH_HOURS);
  const searchStart = contacts ? contacts.start : eclipseMs - (solar ? SOLAR_SEARCH_HOURS : LUNAR_SEARCH_HOURS) * HOUR;
  const searchEnd = contacts ? contacts.end : eclipseMs + (solar ? SOLAR_SEARCH_HOURS : LUNAR_SEARCH_HOURS) * HOUR;
  const visibility = contacts
    ? visibleOverlap(contacts, luminaryIntervals(solar ? "solar" : "lunar", place, tz, searchStart, searchEnd))
    : null;
  const visible = Boolean(visibility);
  const sutakHours = solar ? 12 : 9;
  const sutakStart = visible ? visibility.start - sutakHours * HOUR : null;
  const moksha = visible && contacts ? contacts.end : null;
  return {
    tz,
    key,
    eclipseMs,
    visible,
    contacts,
    visibility,
    sutakStart,
    moksha,
    sutakHours,
    conventionNote: solar
      ? { en: "Sutak begins 12 hours before the solar eclipse (Drik household convention).", hi: "सूतक सूर्य ग्रहण से 12 घंटे पहले आरम्भ होता है (दृक गृह परम्परा)।" }
      : { en: "Sutak begins 9 hours before the lunar eclipse (Drik household convention).", hi: "सूतक चंद्र ग्रहण से 9 घंटे पहले आरम्भ होता है (दृक गृह परम्परा)।" },
  };
}

export { eclipseDetail };
