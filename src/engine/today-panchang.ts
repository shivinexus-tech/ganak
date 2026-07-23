/* Today's panchang assembly (SPLIT-UI-03d-engine). Wire deferred — still copied in shell. */

import {
  setAyanMode, sunEvents, moonEvents, elongMs, lunYogaMs, moonSidMs, sunSidMs,
  SIGNS, NAKSHATRAS, TITHIS, YOGAS, RAHU_SEGMENT, YAMA_SEGMENT, GULIKA_SEGMENT,
  upcomingEvents, choghaSlots, lunarMonthInfo, samvatInfo, zoneOffset, solveCross,
  KARANAS_MOV, pitruPakshaDay,
} from "./panchang";
import { rev } from "./ephemeris";
import { ayyappaMandalaFor } from "./festivals";
import { computeDailyWindows } from "./daily-windows";

function computeTodayPanchang(place, ayanamsa = "lahiri", atMs) {
  setAyanMode(ayanamsa);
  const now = atMs != null ? atMs : Date.now();
  const probe = new Date(now);
  const tz = zoneOffset(place.zone, probe.getUTCFullYear(), probe.getUTCMonth() + 1, probe.getUTCDate()) ?? 5.5;
  const local = new Date(now + tz * 3600000);
  const y = local.getUTCFullYear(), m = local.getUTCMonth() + 1, day = local.getUTCDate();
  const dow = local.getUTCDay();

  const ev = sunEvents(y, m, day, tz, place.lat, place.lon);
  const moonEv = moonEvents(y, m, day, tz, place.lat, place.lon);
  const anchor = ev.rise !== null ? ev.rise : Date.UTC(y, m - 1, day, 6) - tz * 3600000; // panchang day begins at sunrise
  const dayEnd = anchor + 24.2 * 3600000;

  const sun = sunSidMs(anchor), moon = moonSidMs(anchor);
  const elong = rev(moon - sun);

  // tithi (+ next if it changes within the panchang day)
  const tithiName = (n) => (n % 15 === 14 ? (n < 15 ? "Purnima" : "Amavasya") : TITHIS[n % 15]);
  const tn = Math.floor(elong / 12);
  const tEnd = solveCross(elongMs, anchor, ((tn + 1) * 12) % 360, 3);
  const tithis = [{ name: tithiName(tn), end: tEnd }];
  if (tEnd < dayEnd) tithis.push({ name: tithiName((tn + 1) % 30), end: solveCross(elongMs, tEnd + 60000, ((tn + 2) * 12) % 360, 3) });

  // nakshatra
  const NW = 360 / 27;
  const nIdx = Math.floor(moon / NW);
  const nEnd = solveCross(moonSidMs, anchor, ((nIdx + 1) * NW) % 360, 3);
  const naks = [{ name: NAKSHATRAS[nIdx], end: nEnd }];
  if (nEnd < dayEnd) naks.push({ name: NAKSHATRAS[(nIdx + 1) % 27], end: solveCross(moonSidMs, nEnd + 60000, ((nIdx + 2) * NW) % 360, 3) });

  // yoga
  const yIdx = Math.floor(rev(sun + moon) / NW);
  const yEnd = solveCross(lunYogaMs, anchor, ((yIdx + 1) * NW) % 360, 3);
  const yogasP = [{ name: YOGAS[yIdx], end: yEnd }];
  if (yEnd < dayEnd) yogasP.push({ name: YOGAS[(yIdx + 1) % 27], end: solveCross(lunYogaMs, yEnd + 60000, ((yIdx + 2) * NW) % 360, 3) });

  // karanas (two per day)
  const kn = Math.floor(elong / 6);
  const kEnd1 = solveCross(elongMs, anchor, ((kn + 1) * 6) % 360, 2);
  const kEnd2 = solveCross(elongMs, kEnd1 + 60000, ((kn + 2) * 6) % 360, 2);
  const karanaAt = (k) => { const kk = ((k % 60) + 60) % 60; return kk === 0 ? "Kimstughna" : kk >= 57 ? ["Shakuni", "Chatushpada", "Naga"][kk - 57] : KARANAS_MOV[(kk - 1) % 7]; };
  const karanas = [{ name: karanaAt(kn), end: kEnd1 }, { name: karanaAt(kn + 1), end: kEnd2 }];

  // moonsign / sunsign
  const msIdx = Math.floor(moon / 30);
  const msEnd = solveCross(moonSidMs, anchor, ((msIdx + 1) * 30) % 360, 4);
  const paksha = tn < 15 ? "Shukla" : "Krishna";

  // months, samvats, pravishte
  const months = lunarMonthInfo(anchor, paksha === "Krishna");
  const samvat = samvatInfo(anchor, y);
  const lastSank = solveCross(sunSidMs, anchor - 33 * 86400000, Math.floor(sun / 30) * 30, 35);
  const dloc = (ms) => { const t = new Date(ms + tz * 3600000); return Date.UTC(t.getUTCFullYear(), t.getUTCMonth(), t.getUTCDate()); };
  const pravishte = Math.floor((dloc(anchor) - dloc(lastSank)) / 86400000) + 1;

  let rahu = null, abhijit = null, gulika = null, yama = null;
  if (ev.rise !== null) {
    const dayLen = ev.set - ev.rise;
    const eighth = (seg) => ({ start: ev.rise + ((seg - 1) / 8) * dayLen, end: ev.rise + (seg / 8) * dayLen });
    rahu = eighth(RAHU_SEGMENT[dow]);
    gulika = eighth(GULIKA_SEGMENT[dow]);
    yama = eighth(YAMA_SEGMENT[dow]);
    abhijit = dow === 3 ? null : { start: ev.transit - dayLen / 30, end: ev.transit + dayLen / 30 };
  }

  const dailyWindows = computeDailyWindows(place, anchor);
  return {
    tz, anchor,
    dateLabel: local.toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric", timeZone: "UTC" }),
    vara: ["Ravivara", "Somavara", "Mangalavara", "Budhavara", "Guruvara", "Shukravara", "Shanivara"][dow],
    tithis, naks, yogasP, karanas, paksha: paksha + " Paksha",
    // `tithiNum` is the zero-based 0..29 astronomy index. UI and observance
    // rules must use the human-facing 1..15 day within the current paksha.
    elong, tithiNum: tn, tithiDay: (tn % 15) + 1, krishna: tn >= 15,
    months, samvat, pravishte,
    moonSign: SIGNS[msIdx].split(" ")[0], moonSignEnd: msEnd < dayEnd ? msEnd : null,
    sunSign: SIGNS[Math.floor(sun / 30)].split(" ")[0],
    rise: ev.rise, set: ev.set, moonrise: moonEv.rise, moonset: moonEv.set, rahu, abhijit, gulika, yama,
    dow,
    pitruPaksha: (ev.rise !== null && ev.set !== null) ? pitruPakshaDay(ev.rise, ev.set) : null,
    ayyappaMandala: ayyappaMandalaFor(anchor, tz),
    choghaDay: ev.rise !== null ? choghaSlots(dow, ev.rise, ev.set, true) : null,
    choghaNight: ev.rise !== null ? choghaSlots(dow, ev.set, ev.rise + 86400000, false) : null,
    events: upcomingEvents(now),
    dailyWindows,
  };
}

export { computeTodayPanchang };
