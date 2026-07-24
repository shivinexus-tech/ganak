/* Eclipse visibility and Sutak windows for grahan festival pages.
   Convention: 12h Sutak before solar grahan, 9h before lunar grahan (Drik household rule).
   Visibility: luminary above local horizon at maximum eclipse. */

import { sunEvents, moonEvents, zoneOffset } from "./panchang";

const HOUR = 3600000;

function requirePlace(place) {
  if (!place || !place.zone || !Number.isFinite(place.lat) || !Number.isFinite(place.lon)) {
    throw new Error("place-required");
  }
}

function civilParts(ms, tz) {
  const d = new Date(ms + tz * HOUR);
  return { y: d.getUTCFullYear(), m: d.getUTCMonth() + 1, day: d.getUTCDate(), tz };
}

function luminaryUp(ms, place, kind, tz) {
  const { y, m, day, tz: offset } = civilParts(ms, tz);
  const events = kind === "solar"
    ? sunEvents(y, m, day, offset, place.lat, place.lon)
    : moonEvents(y, m, day, offset, place.lat, place.lon);
  const rise = events.rise ?? events.transit;
  const set = events.set ?? events.transit;
  if (rise == null || set == null) return false;
  return ms >= rise && ms <= set;
}

function eclipseDetail(place, eclipseMs, key) {
  requirePlace(place);
  const probe = new Date(eclipseMs);
  const tz = zoneOffset(place.zone, probe.getUTCFullYear(), probe.getUTCMonth() + 1, probe.getUTCDate()) ?? 5.5;
  const solar = key === "suryaGrahan";
  const visible = luminaryUp(eclipseMs, place, solar ? "solar" : "lunar", tz);
  const sutakHours = solar ? 12 : 9;
  const sutakStart = eclipseMs - sutakHours * HOUR;
  const moksha = eclipseMs + (solar ? 3 : 2) * HOUR;
  return {
    tz,
    key,
    eclipseMs,
    visible,
    sutakStart,
    moksha,
    sutakHours,
    conventionNote: solar
      ? { en: "Sutak begins 12 hours before the solar eclipse (Drik household convention).", hi: "सूतक सूर्य ग्रहण से 12 घंटे पहले आरम्भ होता है (दृक गृह परम्परा)।" }
      : { en: "Sutak begins 9 hours before the lunar eclipse (Drik household convention).", hi: "सूतक चंद्र ग्रहण से 9 घंटे पहले आरम्भ होता है (दृक गृह परम्परा)।" },
  };
}

export { eclipseDetail };
