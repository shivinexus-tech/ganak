// Lagna schedule + Panchaka windows -- extracted from kundli-app.tsx
// (SPLIT-UI-03c). Pure move: same remainder rule, same window stepping.
// Panchaka display labels stay with the UI.

import { rev, ascendantAt } from "./ephemeris";
import { setAyanMode, ayanAt, zoneOffset, sunEvents, jdOf, elongMs, moonSidMs } from "./panchang";

const PANCHAKA_TYPE = { 1: "mrityu", 2: "agni", 4: "raja", 6: "chora", 8: "roga" };
const panchakaRem = (t30, vaara, n27, lagna12) => (t30 + vaara + n27 + lagna12) % 9;
function computeLagnaPanchaka(place, ayanamsa = "lahiri", atMs) {
  setAyanMode(ayanamsa);
  const now = atMs != null ? atMs : Date.now();
  const probe = new Date(now);
  const tz = zoneOffset(place.zone, probe.getUTCFullYear(), probe.getUTCMonth() + 1, probe.getUTCDate()) ?? 5.5;
  const local = new Date(now + tz * 3600000);
  const y = local.getUTCFullYear(), m = local.getUTCMonth() + 1, day = local.getUTCDate();
  const vaara = local.getUTCDay() + 1;
  const ev = sunEvents(y, m, day, tz, place.lat, place.lon);
  const evN = sunEvents(y, m, day + 1, tz, place.lat, place.lon);
  const rise = ev.rise, nextRise = evN.rise;
  if (rise == null || nextRise == null) return { rise, nextRise, tz, lagnaSchedule: [], panchakaWindows: [] };
  const at = (ms) => {
    const jd = jdOf(ms);
    const sign = Math.floor(rev(ascendantAt(jd, place.lat, place.lon, ayanAt(jd))) / 30);
    const t30 = Math.floor(rev(elongMs(ms)) / 12) + 1;
    const n27 = Math.floor(rev(moonSidMs(ms)) / (360 / 27)) + 1;
    return { sign, rem: panchakaRem(t30, vaara, n27, sign + 1) };
  };
  const step = 60000, segs = [];
  let s0 = rise, cur = at(rise);
  for (let t = rise + step; t <= nextRise; t += step) {
    const nx = at(t);
    if (nx.sign !== cur.sign || nx.rem !== cur.rem) {
      let a = t - step, b = t;
      for (let i = 0; i < 16; i++) { const mid = (a + b) / 2, mm = at(mid); if (mm.sign === cur.sign && mm.rem === cur.rem) a = mid; else b = mid; }
      segs.push({ start: s0, end: b, sign: cur.sign, rem: cur.rem });
      s0 = b; cur = nx;
    }
  }
  segs.push({ start: s0, end: nextRise, sign: cur.sign, rem: cur.rem });
  const lagnaSchedule = [];
  for (const sg of segs) {
    const last = lagnaSchedule[lagnaSchedule.length - 1];
    if (last && last.sign === sg.sign) last.end = sg.end;
    else lagnaSchedule.push({ sign: sg.sign, start: sg.start, end: sg.end });
  }
  for (const w of lagnaSchedule) {
    const a = at((w.start + w.end) / 2);
    w.rem = a.rem; w.type = PANCHAKA_TYPE[a.rem] || "shubha"; w.shubha = !PANCHAKA_TYPE[a.rem];
  }
  const panchakaWindows = [];
  for (const sg of segs) {
    const type = PANCHAKA_TYPE[sg.rem] || "shubha";
    const last = panchakaWindows[panchakaWindows.length - 1];
    if (last && last.type === type) last.end = sg.end;
    else panchakaWindows.push({ start: sg.start, end: sg.end, type, shubha: !PANCHAKA_TYPE[sg.rem], rem: sg.rem });
  }
  return { rise, nextRise, tz, lagnaSchedule, panchakaWindows };
}

export { PANCHAKA_TYPE, panchakaRem, computeLagnaPanchaka };
