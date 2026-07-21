// Lagna schedule + Panchaka windows -- extracted from kundli-app.tsx
// (SPLIT-UI-03c). Pure move: same remainder rule, same window stepping.
// Panchaka display labels stay with the UI.

import { rev, ascendantAt } from "./ephemeris";
import { setAyanMode, ayanAt, zoneOffset, sunEvents, jdOf, elongMs, moonSidMs } from "./panchang";

const PANCHAKA_TYPE = { 1: "mrityu", 2: "agni", 4: "raja", 6: "chora", 8: "roga" };
const panchakaRem = (t30, vaara, n27, lagna12) => (t30 + vaara + n27 + lagna12) % 9;

// The tithi, nakshatra and lagna boundaries move independently, so two of them
// can land seconds apart and leave a sliver of a segment. The UI renders windows
// at minute precision, so anything under a minute prints with an identical start
// and end -- "अग्नि 9:31 PM–9:31 PM" (New Delhi, 30 Jul 2026: tithi rolled 16->17
// at 21:31:08, lagna 10->11 at 21:31:44). A sliver is also unusable as a muhurat
// even when it does straddle a minute mark.
//
// So snap the near-coincident boundaries together instead of reporting the
// sliver: its span is handed to the preceding segment (a leading sliver goes to
// the following one), which moves a boundary by under a minute and keeps the day
// tiled sunrise to sunrise with no gap. Applied to the segments rather than to
// the finished lists so the lagna schedule and the panchaka windows -- and hence
// both the Daily panchaka list and the finder's top-day panchaka -- are clean.
const MIN_WINDOW_MS = 60000;
function mergeShortSegs(segs) {
  const out = [];
  for (const sg of segs) {
    const prev = out[out.length - 1];
    if (prev && sg.end - sg.start < MIN_WINDOW_MS) prev.end = sg.end;
    else out.push({ ...sg });
  }
  if (out.length > 1 && out[0].end - out[0].start < MIN_WINDOW_MS) { out[1].start = out[0].start; out.shift(); }
  return out;
}
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
  const kept = mergeShortSegs(segs);
  const lagnaSchedule = [];
  for (const sg of kept) {
    const last = lagnaSchedule[lagnaSchedule.length - 1];
    if (last && last.sign === sg.sign) last.end = sg.end;
    else lagnaSchedule.push({ sign: sg.sign, start: sg.start, end: sg.end });
  }
  for (const w of lagnaSchedule) {
    const a = at((w.start + w.end) / 2);
    w.rem = a.rem; w.type = PANCHAKA_TYPE[a.rem] || "shubha"; w.shubha = !PANCHAKA_TYPE[a.rem];
  }
  const panchakaWindows = [];
  for (const sg of kept) {
    const type = PANCHAKA_TYPE[sg.rem] || "shubha";
    const last = panchakaWindows[panchakaWindows.length - 1];
    if (last && last.type === type) last.end = sg.end;
    else panchakaWindows.push({ start: sg.start, end: sg.end, type, shubha: !PANCHAKA_TYPE[sg.rem], rem: sg.rem });
  }
  return { rise, nextRise, tz, lagnaSchedule, panchakaWindows };
}

export { PANCHAKA_TYPE, panchakaRem, computeLagnaPanchaka };
