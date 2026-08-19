/* Eclipse visibility and Sutak windows for grahan festival pages.

   DECLARED CONVENTION — Drik Panchang, cross-checked against 17 published anchors
   on 2026-08-18; see plans/research/eclipse-panchaka-reference-check.md.

   1. Sutak is observed ONLY when the eclipse is visible from the selected place.
      Drik: "Sutak is observed only when Eclipse is visible at the place under
      discussion." A penumbral-only lunar eclipse produces no umbral contact here,
      so it correctly yields no visibility and no Sutak.
   2. Sutak is counted in PRAHARS, not clock hours. Drik's prose says "12 hours
      before Solar Eclipse and 9 hours before Lunar Eclipse", but its published
      times are prahar boundaries: 4 prahar for solar, 3 for lunar, measured back
      from the prahar boundary at or before the LOCAL eclipse start. A prahar is a
      quarter of the local daytime, or a quarter of the local night. Flat hours
      diverge from Drik by up to 39 minutes (Delhi, 7 Sep 2025 lunar: Drik 12:19,
      flat arithmetic 12:57). Nominal hours are still reported as sutakHours.
   3. Children, the old and the sick observe ONE prahar. Drik: "For children, sick
      and old people food limitation is restricted to only single Prahar or 3 hours."
   4. Both windows end at the local Moksha — the end of the LOCALLY VISIBLE eclipse,
      clamped at moonset/sunset for a grast-asta eclipse.

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

/* Umbral radius at the Moon's distance, in degrees.

   Chauvenet/Danjon: rho = 1.02 * (pi_moon + pi_sun - s_sun), the 1.02 being
   Danjon's 2% enlargement for the Earth's atmosphere. Standard form, as given in
   Meeus, Astronomical Algorithms ch. 54, and the basis of the NASA/Espenak canon.

   This replaced a hard-coded 0.73 deg (2026-08-18). The true radius runs roughly
   0.64-0.74 deg with the Moon's distance, so a constant is right only near mean
   distance and fails worst on shallow eclipses, where the Moon crosses the shadow
   edge at a grazing angle. Measured against Drik's published umbral contacts on
   four eclipses of magnitude 0.92-1.36: fixed 0.73 gave a mean error of 6 minutes
   and ran 14 Mar 2025 twenty-three minutes long; this formula gives 1.25 minutes
   mean, 2 minutes worst. */
const SUN_PARALLAX_DEG = 8.794 / 3600;
const SUN_SEMIDIAMETER_DEG = 959.63 / 3600;
const DANJON_ENLARGEMENT = 1.02;

function umbraRadiusDeg(moonDistKm, sunDistAu) {
  const moonParallax = Math.asin(EARTH_RADIUS_KM / moonDistKm) * R2D;
  const sunSemidiameter = SUN_SEMIDIAMETER_DEG / sunDistAu;
  return DANJON_ENLARGEMENT * (moonParallax + SUN_PARALLAX_DEG - sunSemidiameter);
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
  // Deliberately umbral, not penumbral: Hindu Sutak/Moksha follows the shadow
  // phase visible to the naked eye, and Drik states that a penumbral eclipse
  // carries no ritual significance.
  return sep - (umbraRadiusDeg(moon.dist, sun.r) + moonRadius);
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

/* Ascending prahar boundaries around a moment: for each civil day, the four day
   prahars split sunrise->sunset, then the four night prahars split sunset->next
   sunrise. Returns null where the Sun does not rise and set (polar latitudes), so
   the caller can fall back to nominal clock hours rather than invent a boundary. */
function praharBoundaries(place, tz, centerMs) {
  const first = Math.floor((centerMs + tz * HOUR) / DAY) - 3;
  const events = [];
  for (let i = 0; i <= 5; i++) {
    const localStart = (first + i) * DAY - tz * HOUR;
    const dt = new Date(localStart + 12 * HOUR);
    const ev = sunEvents(dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate(), tz, place.lat, place.lon);
    if (ev.rise == null || ev.set == null || !(ev.rise < ev.set)) return null;
    events.push(ev);
  }
  const out = [];
  for (let i = 0; i < events.length - 1; i++) {
    const { rise, set } = events[i];
    const nextRise = events[i + 1].rise;
    if (!(set < nextRise)) return null;
    const dayPrahar = (set - rise) / 4;
    const nightPrahar = (nextRise - set) / 4;
    for (let k = 0; k < 4; k++) out.push(rise + k * dayPrahar);
    for (let k = 0; k < 4; k++) out.push(set + k * nightPrahar);
  }
  out.push(events[events.length - 1].rise);
  return out;
}

/* Ganak's lunar horizon crossings carry a declared +/-6 min tolerance (backlog C3,
   C3-MOONSET-DRIK) inherited from the truncated lunar series in the shared
   ephemeris; measured against Drik they run 1-6 minutes early on rise. Ordinarily
   that is well inside the noise. It is NOT when the moment decides a prahar bucket:
   at a grast-udaya lunar eclipse the Moon is full, so moonrise sits within minutes
   of sunset BY CONSTRUCTION, and landing on the wrong side of the sunset boundary
   moves Sutak by a whole prahar — nearly three hours. So when the local eclipse
   start is a rise clamp, and only then, a boundary within the tolerance ahead of it
   is treated as already reached. Displayed rise and visibility times are untouched;
   this resolves the bucket only. */
const LUNAR_RISE_TOLERANCE_MS = 6 * 60000;

/* Sutak begins `prahars` prahar boundaries before the boundary at or immediately
   before the local eclipse start. Falls back to nominal clock hours only where the
   boundaries cannot be built. */
function sutakOnset(boundaries, localStart, prahars, nominalHours, riseClamped) {
  const fallback = localStart - nominalHours * HOUR;
  if (!boundaries) return { at: fallback, basis: "hours" };
  let idx = -1;
  for (let i = 0; i < boundaries.length; i++) {
    if (boundaries[i] <= localStart) idx = i;
    else break;
  }
  if (riseClamped && idx >= 0 && idx + 1 < boundaries.length
      && boundaries[idx + 1] - localStart <= LUNAR_RISE_TOLERANCE_MS) {
    idx += 1;
  }
  const target = idx - prahars;
  if (idx < 0 || target < 0) return { at: fallback, basis: "hours" };
  return { at: boundaries[target], basis: "prahar" };
}

/* Greatest eclipse for this place: the instant the contact metric is smallest.
   For a lunar eclipse the metric is geocentric, so this is the same instant
   everywhere; for a solar eclipse it is topocentric and genuinely local — which is
   why the geocentric syzygy is not the answer (it sat 70 minutes from Drik's
   published local maximum at Johannesburg on 17 Feb 2026). */
function metricMinimum(metricFn, from, to) {
  const step = 60000;
  let best = from;
  let bestVal = metricFn(from);
  for (let t = from + step; t <= to; t += step) {
    const v = metricFn(t);
    if (v < bestVal) { bestVal = v; best = t; }
  }
  let lo = Math.max(from, best - step);
  let hi = Math.min(to, best + step);
  for (let i = 0; i < 30 && hi > lo; i++) {
    const a = lo + (hi - lo) / 3;
    const b = hi - (hi - lo) / 3;
    if (metricFn(a) < metricFn(b)) hi = b; else lo = a;
  }
  return (lo + hi) / 2;
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
  const metricFn = solar ? (ms) => solarContactMetric(ms, place) : lunarUmbralMetric;
  if (contacts) contacts.maximum = metricMinimum(metricFn, contacts.start, contacts.end);
  const sutakHours = solar ? 12 : 9;
  const sutakPrahar = solar ? 4 : 3;
  const sutakKidsPrahar = 1;
  const sutakKidsHours = 3;
  // Sutak is anchored on the start of the eclipse AS SEEN HERE. For a grast-udaya
  // eclipse (already in progress when the Moon/Sun rises) that is the rise, not the
  // global first contact — Drik's Delhi anchor for 3 Mar 2026 confirms it.
  const boundaries = visible ? praharBoundaries(place, tz, visibility.start) : null;
  const riseClamped = Boolean(visible && contacts && visibility.start > contacts.start);
  const onset = visible ? sutakOnset(boundaries, visibility.start, sutakPrahar, sutakHours, riseClamped) : null;
  const kidsOnset = visible ? sutakOnset(boundaries, visibility.start, sutakKidsPrahar, sutakKidsHours, riseClamped) : null;
  const sutakStart = onset ? onset.at : null;
  const sutakKidsStart = kidsOnset ? kidsOnset.at : null;
  // Moksha for the place is the end of the locally *visible* eclipse. When the
  // luminary sets/rises mid-eclipse (grast-asta / grast-udaya) the visible end is
  // clamped at moonset/sunset, so Moksha must not fall after the Moon/Sun is gone.
  // For eclipses seen whole, visibility.end == contacts.end (unchanged behaviour).
  const moksha = visible ? visibility.end : null;
  return {
    tz,
    key,
    eclipseMs,
    visible,
    contacts,
    visibility,
    sutakStart,
    sutakEnd: moksha,
    sutakKidsStart,
    sutakKidsEnd: moksha,
    sutakBasis: onset ? onset.basis : null,
    moksha,
    sutakHours,
    sutakPrahar,
    sutakKidsHours,
    sutakKidsPrahar,
    conventionNote: solar
      ? {
        en: "Sutak begins 4 prahar (about 12 hours) before the solar eclipse begins here, counted in local prahars — a prahar is a quarter of the daytime or a quarter of the night — and ends at Moksha. For children, the elderly and the unwell it is 1 prahar (about 3 hours). Drik Panchang household convention; Sutak is not observed where the eclipse is not visible.",
        hi: "सूतक सूर्य ग्रहण के स्थानीय आरम्भ से 4 प्रहर (लगभग 12 घंटे) पूर्व लगता है — प्रहर दिनमान या रात्रिमान का चौथा भाग है — और मोक्ष पर समाप्त होता है। बालक, वृद्ध व रोगी के लिए 1 प्रहर (लगभग 3 घंटे)। दृक पंचांग गृह परम्परा; जहाँ ग्रहण दृश्य नहीं, वहाँ सूतक नहीं माना जाता।",
      }
      : {
        en: "Sutak begins 3 prahar (about 9 hours) before the lunar eclipse begins here, counted in local prahars — a prahar is a quarter of the daytime or a quarter of the night — and ends at Moksha. For children, the elderly and the unwell it is 1 prahar (about 3 hours). Drik Panchang household convention; Sutak is not observed where the eclipse is not visible.",
        hi: "सूतक चंद्र ग्रहण के स्थानीय आरम्भ से 3 प्रहर (लगभग 9 घंटे) पूर्व लगता है — प्रहर दिनमान या रात्रिमान का चौथा भाग है — और मोक्ष पर समाप्त होता है। बालक, वृद्ध व रोगी के लिए 1 प्रहर (लगभग 3 घंटे)। दृक पंचांग गृह परम्परा; जहाँ ग्रहण दृश्य नहीं, वहाँ सूतक नहीं माना जाता।",
      },
  };
}

export { eclipseDetail };
