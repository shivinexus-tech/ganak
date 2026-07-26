/* -------------------------------------------------------------------------
   Elective / clinician-approved-procedure ("medical") Muhurat — v1 engine.

   DEDICATED and deliberately conservative (owner decision 2026-07-25, Option C).
   This is NOT the benefic muhurat.ts finder and must never be merged into it:
   surgery is classically a *krura/tikshna* act whose electional logic partly
   INVERTS the benefic rules, so reusing those gates would be wrong.

   v1 acts on ONLY the two universally-agreed avoidances:
     - Purnima (full moon)  — classical fluid-loss / hemorrhage caution
     - Amavasya (new moon)
   Excluding both syzygies also covers every eclipse day (a solar eclipse can
   only fall on Amavasya, a lunar eclipse only on Purnima), so no separate
   eclipse detection is required.

   It does NOT act on the inverted krura-karma factors (sharp nakshatras, Rikta
   tithis, Mars/Saturn days). Those are surfaced read-only in the UI tradition
   note, never as a prescribed date next to a real operation.

   Nothing here predicts, scores, or ranks a medical outcome. It only marks which
   days a user's already-clinician-approved, flexible procedure would sit on an
   ordinarily-inauspicious full/new-moon day, and offers the neutral Abhijit
   Muhurta as a suggested time on clean days.

   Written untyped to match the sibling engines (muhurat.ts, eclipse.ts). Shapes:
     MedDay  = { y, m, day, tz, dow, rise, set, transit, tithiNum, krishna,
                 paksha:'shukla'|'krishna', nakIdx, nakName, purnima, amavasya,
                 clean, reason:'purnima'|'amavasya'|null,
                 abhijit:{start,end}|null, rahu:{start,end} }
   ------------------------------------------------------------------------- */

import { rev } from "./ephemeris";
import {
  NAKSHATRAS, setAyanMode, zoneOffset, sunEvents,
  sunSidMs, moonSidMs, RAHU_SEGMENT,
} from "./panchang";

const _NAKW = 360 / 27;

/* A day carries a syzygy if the exact full/new moon occurs at any point across the
   Hindu day (sunrise → next sunrise). Sampling every 3h mirrors the panchang engine
   and matches the civil day a full/new moon is popularly attributed to (within ±1 day
   of the published festival date, which is all the sunrise-vs-festival convention
   allows). Returns "purnima", "amavasya", or null. */
function syzygyOnDay(rise) {
  for (let k = 0; k <= 8; k++) {
    const t = rise + k * 10800000; // +3h steps across 24h
    const tn = Math.floor(rev(moonSidMs(t) - sunSidMs(t)) / 12); // 0..29
    if (tn === 14) return "purnima";  // Shukla Purnima (tithi 15, bright)
    if (tn === 29) return "amavasya"; // Krishna Amavasya (tithi 15, dark)
  }
  return null;
}

/* R10 (optional): the user's natal Moon sign (Janma Rashi), 0..11. Computed from birth
   date/time and the place's timezone. Moon sign is a whole-sign property, so topocentric
   parallax is immaterial — only the birth instant matters. Returns 0..11. */
function natalMoonSign(place, ayanamsa, birth) {
  setAyanMode(ayanamsa || "lahiri");
  const tz = zoneOffset(place.zone, birth.y, birth.m, birth.day) ?? 5.5;
  const ms = Date.UTC(birth.y, birth.m - 1, birth.day, birth.hh || 0, birth.mi || 0) - tz * 3600000;
  return Math.floor(moonSidMs(ms) / 30);
}

/* natalSign is optional (null/undefined = the v1 no-birth-chart behaviour). When a valid
   rashi 0..11 is supplied, days whose sunrise Moon sits in that same sign are flagged
   janmaRashi — a traditional personal caution. It is an overlay: it never changes the
   syzygy `clean`/`reason` fields, so the general finder is unchanged. */
function medicalMuhuratDay(place, ayanamsa, y, m, day, natalSign) {
  setAyanMode(ayanamsa || "lahiri");
  const tz = zoneOffset(place.zone, y, m, day) ?? 5.5;
  const ev = sunEvents(y, m, day, tz, place.lat, place.lon);
  if (ev.rise === null || ev.set === null) return null;

  const dow = new Date(ev.rise + tz * 3600000).getUTCDay();
  const dayLen = ev.set - ev.rise;
  const eighth = (seg) => ({
    start: ev.rise + ((seg - 1) / 8) * dayLen,
    end: ev.rise + (seg / 8) * dayLen,
  });

  const moonLon = moonSidMs(ev.rise);
  const sunriseElong = rev(moonLon - sunSidMs(ev.rise));
  const nakIdx = Math.floor(moonLon / _NAKW);
  const moonSign = Math.floor(moonLon / 30);
  const janmaRashi = natalSign != null && natalSign >= 0 && natalSign <= 11 && moonSign === natalSign;

  const reason = syzygyOnDay(ev.rise);
  const clean = reason === null;

  // On a clean day, report the sunrise tithi; on an excluded day, report the
  // syzygy tithi (15) — the day is excluded precisely because it holds it.
  let tithiNum, krishna, paksha;
  if (clean) {
    const tn = Math.floor(sunriseElong / 12);
    tithiNum = (tn % 15) + 1;
    krishna = tn >= 15;
    paksha = krishna ? "krishna" : "shukla";
  } else {
    tithiNum = 15;
    krishna = reason === "amavasya";
    paksha = krishna ? "krishna" : "shukla";
  }

  return {
    y, m, day, tz, dow,
    rise: ev.rise, set: ev.set, transit: ev.transit,
    tithiNum, krishna, paksha,
    nakIdx, nakName: NAKSHATRAS[nakIdx],
    moonSign, janmaRashi,
    purnima: reason === "purnima",
    amavasya: reason === "amavasya",
    clean, reason,
    abhijit: dow === 3 ? null : { start: ev.transit - dayLen / 30, end: ev.transit + dayLen / 30 },
    rahu: eighth(RAHU_SEGMENT[dow]),
  };
}

function medicalMuhuratScan(place, ayanamsa, fromYmd, toYmd, natalSign) {
  const out = [];
  let cur = Date.UTC(fromYmd.y, fromYmd.m - 1, fromYmd.d);
  const end = Date.UTC(toYmd.y, toYmd.m - 1, toYmd.d);
  for (let i = 0; cur <= end && i < 400; i++, cur += 86400000) {
    const dt = new Date(cur);
    const info = medicalMuhuratDay(place, ayanamsa, dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate(), natalSign);
    if (info) out.push(info);
  }
  return out;
}

// "Available" means clean of the syzygy avoidances AND, when a natal sign is active,
// not a Janma Rashi day.
function medicalMuhuratClean(place, ayanamsa, fromYmd, toYmd, natalSign) {
  return medicalMuhuratScan(place, ayanamsa, fromYmd, toYmd, natalSign).filter((r) => r.clean && !r.janmaRashi);
}

export { natalMoonSign, medicalMuhuratDay, medicalMuhuratScan, medicalMuhuratClean };
