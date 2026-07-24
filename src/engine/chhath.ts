/* Four-day Chhath sequence timings for the shared /festival/chhath page.
   Benchmark: Drik Chhath puja timings; validation in festival-row-29.cjs */

import { scanPanchangCalendar } from "./festivals";
import { sunEvents, zoneOffset } from "./panchang";

const CHHATH_KEYS = Object.freeze([
  "chhathNahayKhay",
  "chhathKharna",
  "chhath",
  "chhathUshaArghya",
]);

const DAY_LABELS = Object.freeze({
  chhathNahayKhay: { en: "Day 1 — Nahay Khay", hi: "दिन 1 — नहाय खाय" },
  chhathKharna: { en: "Day 2 — Kharna", hi: "दिन 2 — खरना" },
  chhath: { en: "Day 3 — Sandhya Arghya", hi: "दिन 3 — संध्या अर्घ्य" },
  chhathUshaArghya: { en: "Day 4 — Usha Arghya & parana", hi: "दिन 4 — उषा अर्घ्य व पारण" },
});

function requirePlace(place) {
  if (!place || !place.zone || !Number.isFinite(place.lat) || !Number.isFinite(place.lon)) {
    throw new Error("place-required");
  }
}

function chhathTimings(place, referenceMs) {
  requirePlace(place);
  const probe = new Date(referenceMs);
  const tz = zoneOffset(place.zone, probe.getUTCFullYear(), probe.getUTCMonth() + 1, probe.getUTCDate()) ?? 5.5;
  const cal = scanPanchangCalendar(referenceMs - 14 * 86400000, tz, 40, 40, place);
  const anchor = cal.festivals.find((f) => f.key === "chhath");
  if (!anchor) throw new Error("chhath-not-found");
  const byKey = new Map(cal.festivals.filter((f) => CHHATH_KEYS.includes(f.key)).map((f) => [f.key, f]));
  const days = CHHATH_KEYS.map((key) => {
    const f = byKey.get(key);
    if (!f) return null;
    const ev = sunEvents(f.y, f.m, f.day, tz, place.lat, place.lon);
    return {
      key,
      label: DAY_LABELS[key],
      ms: f.ms,
      y: f.y,
      m: f.m,
      day: f.day,
      rise: ev.rise,
      set: ev.set,
    };
  }).filter(Boolean);
  const sandhyaDay = days.find((d) => d.key === "chhath");
  const ushaDay = days.find((d) => d.key === "chhathUshaArghya");
  const sandhya = sandhyaDay?.set != null
    ? { start: sandhyaDay.set - 60000, end: sandhyaDay.set + 60000 }
    : null;
  const usha = ushaDay?.rise != null
    ? { start: ushaDay.rise, end: ushaDay.rise + 3600000 }
    : null;
  return { tz, days, sandhya, usha };
}

export { chhathTimings, CHHATH_KEYS, DAY_LABELS };
