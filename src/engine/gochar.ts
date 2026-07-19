/* Gochar (transit) timeline helpers — pure extraction (SPLIT-UI-JYOTISH-01a follow-up). */

import { rev } from "./ephemeris";
import { jdOf, ayanAt, planetSidMs } from "./panchang";

/* ---- Gochar (transit) timeline for a planet: its sign-change sequence with durations & retro stations ---- */
const PLANET_PERIOD_DAYS = { Sun: 400, Moon: 35, Mars: 760, Mercury: 400, Jupiter: 430, Venus: 400, Saturn: 1200, Rahu: 560, Ketu: 560 };

function planetGochar(planet, fromMs, spanDays) {
  if (planet === "Rahu" || planet === "Ketu") {
    // nodes move retrograde; compute from Rahu mean longitude
    const f = (ms) => { const JD = jdOf(ms); const lon = rev(125.1228 - 0.0529538083 * (JD - 2451543.5) - ayanAt(JD)); return planet === "Ketu" ? rev(lon + 180) : lon; };
    return signSeq(f, fromMs, spanDays, true);
  }
  const f = (ms) => planetSidMs(planet, ms);
  return signSeq(f, fromMs, spanDays, false);
}

function signSeq(f, fromMs, spanDays, retroMotion) {
  const seq = [];
  const startSign = Math.floor(f(fromMs) / 30);
  seq.push({ sign: startSign, enter: null });
  let prevSign = startSign;
  const speed = (ms) => (((f(ms + 43200000) - f(ms - 43200000) + 540) % 360) - 180);
  let pv = speed(fromMs);
  const stations = [];
  const step = 0.5; // half-day resolution
  for (let dd = step; dd <= spanDays; dd += step) {
    const t = fromMs + dd * 86400000;
    const sg = Math.floor(f(t) / 30);
    if (sg !== prevSign) {
      let lo = t - step * 86400000, hi = t;
      for (let k = 0; k < 22; k++) { const mid = (lo + hi) / 2; if (Math.floor(f(mid) / 30) === prevSign) lo = mid; else hi = mid; }
      seq.push({ sign: sg, enter: hi });
      prevSign = sg;
    }
    if (!retroMotion) {
      const v = speed(t);
      if (v * pv < 0) {
        let lo = t - step * 86400000, hi = t;
        for (let k = 0; k < 22; k++) { const mid = (lo + hi) / 2; if (speed(mid) * pv > 0) lo = mid; else hi = mid; }
        stations.push({ t: hi, retro: v < 0 });
      }
      pv = v;
    }
  }
  // attach the exit time of each sign = enter of next
  for (let i = 0; i < seq.length; i++) seq[i].exit = i + 1 < seq.length ? seq[i + 1].enter : null;
  return { seq, stations };
}


export { planetGochar, signSeq, PLANET_PERIOD_DAYS };
