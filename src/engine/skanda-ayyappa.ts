/* Multi-day Skanda Sashti and Ayyappa Mandala sequence helpers for festival guide pages. */

import { scanPanchangCalendar } from "./festivals";
import { zoneOffset } from "./panchang";

const SKANDA_KEYS = Object.freeze([
  "skandaSashtiBegins",
  "skandaSashtiSoorasamharam",
  "skandaSashtiThirukalyanam",
]);

const SKANDA_LABELS = Object.freeze({
  skandaSashtiBegins: { en: "Day 1 — vow begins", hi: "दिन 1 — व्रत आरंभ" },
  skandaSashtiSoorasamharam: { en: "Day 6 — Soorasamharam", hi: "दिन 6 — सूरसम्हारम्" },
  skandaSashtiThirukalyanam: { en: "Day 7 — Thirukalyanam", hi: "दिन 7 — तिरुकल्याणम्" },
});

const AYYAPPA_KEYS = Object.freeze(["ayyappaMandalaBegins", "ayyappaMandalaPuja"]);

const AYYAPPA_LABELS = Object.freeze({
  ayyappaMandalaBegins: { en: "Day 1 — Mandala season opens", hi: "दिन 1 — मंडल-काल आरंभ" },
  ayyappaMandalaPuja: { en: "Day 41 — Mandala Pooja", hi: "दिन 41 — मंडल पूजा" },
});

function requirePlace(place) {
  if (!place || !place.zone || !Number.isFinite(place.lat) || !Number.isFinite(place.lon)) {
    throw new Error("place-required");
  }
}

function skandaSashtiSequence(place, referenceMs) {
  requirePlace(place);
  const probe = new Date(referenceMs);
  const tz = zoneOffset(place.zone, probe.getUTCFullYear(), probe.getUTCMonth() + 1, probe.getUTCDate()) ?? 5.5;
  const cal = scanPanchangCalendar(referenceMs - 20 * 86400000, tz, 50, 50, place);
  const days = SKANDA_KEYS.map((key) => {
    const f = cal.festivals.find((item) => item.key === key);
    if (!f) return null;
    return {
      key,
      label: SKANDA_LABELS[key],
      ms: f.ms,
      y: f.y,
      m: f.m,
      day: f.day,
      sequenceDay: f.sequenceDay,
    };
  }).filter(Boolean);
  if (!days.length) throw new Error("skanda-sequence-not-found");
  return { tz, days };
}

function ayyappaMandalaSequence(place, referenceMs) {
  requirePlace(place);
  const probe = new Date(referenceMs);
  const tz = zoneOffset(place.zone, probe.getUTCFullYear(), probe.getUTCMonth() + 1, probe.getUTCDate()) ?? 5.5;
  const cal = scanPanchangCalendar(referenceMs - 20 * 86400000, tz, 70, 70, place);
  const milestones = AYYAPPA_KEYS.map((key) => {
    const f = cal.festivals.find((item) => item.key === key);
    if (!f) return null;
    return {
      key,
      label: AYYAPPA_LABELS[key],
      ms: f.ms,
      y: f.y,
      m: f.m,
      day: f.day,
      spanStart: f.spanStart,
      spanEnd: f.spanEnd,
    };
  }).filter(Boolean);
  if (!milestones.length) throw new Error("ayyappa-sequence-not-found");
  const begin = milestones.find((m) => m.key === "ayyappaMandalaBegins");
  const end = milestones.find((m) => m.key === "ayyappaMandalaPuja");
  const spanDays = begin?.spanEnd && begin?.ms
    ? Math.round((begin.spanEnd - begin.ms) / 86400000) + 1
    : (end?.spanStart && end?.ms ? Math.round((end.ms - end.spanStart) / 86400000) + 1 : 41);
  return { tz, milestones, spanDays };
}

export {
  skandaSashtiSequence,
  ayyappaMandalaSequence,
  SKANDA_KEYS,
  AYYAPPA_KEYS,
  SKANDA_LABELS,
  AYYAPPA_LABELS,
};
