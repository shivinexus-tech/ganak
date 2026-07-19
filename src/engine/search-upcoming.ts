/* Upcoming observances search (SPLIT-UI-03e-engine). Wire deferred. */

import { TITHIS, moonSidMs, sunSidMs } from "./panchang";
import { rev } from "./ephemeris";
import { EKADASHI_NAMES, PRADOSH_NAMES_BY_DAY, scanPanchangCalendar } from "./festivals";
import { FEST_NAME, OBS_NAME } from "../data/festival-meta";

function searchUpcoming(query, fromMs, tz, maxN = 24, place = null) {
  const q = (query || "").trim().toLowerCase();
  const qraw = (query || "").trim();
  if (!q) return [];
  
  const DAY = 86400000;
  const noon = (k) => { const d = new Date(fromMs + k * DAY + tz * 3600000); return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 12) - tz * 3600000; };
  
  // Check if query matches an ekadashi variant name
  let ekVariantMatch = null;
  for (const [key, names] of Object.entries(EKADASHI_NAMES)) {
    if (names.en.toLowerCase().includes(q) || names.hi.includes(qraw)) {
      ekVariantMatch = key;
      break;
    }
  }
  
  // Check if query matches a pradosh variant
  let pradoshDayMatch = null;
  for (const [dayNum, names] of Object.entries(PRADOSH_NAMES_BY_DAY)) {
    if (names.en.toLowerCase().includes(q) || names.hi.includes(qraw)) {
      pradoshDayMatch = parseInt(dayNum);
      break;
    }
  }
  
  // If ekadashi variant or pradosh variant matched, use scanPanchangCalendar which has lunar context
  if (ekVariantMatch || pradoshDayMatch !== null) {
    const r = scanPanchangCalendar(fromMs, tz, 430, 430, place);
    const out = [];
    for (const fast of r.fasts) {
      if (ekVariantMatch && fast.key === ekVariantMatch) {
        const label = EKADASHI_NAMES[ekVariantMatch].en;
        out.push({ ms: fast.ms, kind: "fast", key: fast.key, label });
      } else if (pradoshDayMatch !== null && fast.key === `pradosh_${pradoshDayMatch}`) {
        const label = PRADOSH_NAMES_BY_DAY[pradoshDayMatch].en;
        out.push({ ms: fast.ms, kind: "fast", key: fast.key, label });
      }
    }
    out.sort((a, b) => a.ms - b.ms);
    return out.slice(0, maxN);
  }
  
  // Generic tithi search
  const lowerT = TITHIS.map((t) => t.toLowerCase());
  const tIdx = lowerT.findIndex((t) => t === q || t.startsWith(q) || q.startsWith(t));
  const isPurnima = q === "purnima" || "purnima".startsWith(q) || q.includes("poornima");
  const isAmavasya = q === "amavasya" || "amavasya".startsWith(q) || q.includes("amavas");
  const out = [];
  
  let targets = [];
  if (tIdx >= 0 && tIdx <= 13) targets = [tIdx, tIdx + 15];
  else if (isPurnima) targets = [14];
  else if (isAmavasya) targets = [29];
  
  if (targets.length) {
    const nameOf = (tg) => tg === 14 ? "Purnima" : tg === 29 ? "Amavasya" : TITHIS[tg % 15];
    let prevTn = null;
    for (let k = 0; k < 430 && out.length < maxN + 2; k++) {
      const ms = noon(k), tn = Math.floor(rev(moonSidMs(ms) - sunSidMs(ms)) / 12);
      for (const tg of targets) {
        let hit = tn === tg;
        if (!hit && prevTn !== null) { const diff = (tn - prevTn + 30) % 30; for (let st = 1; st < diff; st++) if ((prevTn + st) % 30 === tg) hit = true; }
        if (hit && !out.find((o) => o._tg === tg && ms - o.ms < 20 * DAY)) out.push({ ms, kind: "tithi", label: nameOf(tg), paksha: (tg === 14 || tg === 29) ? null : (tg >= 15 ? "Krishna" : "Shukla"), _tg: tg });
      }
      prevTn = tn;
    }
    out.sort((a, b) => a.ms - b.ms);
    return out.slice(0, maxN).map((o) => ({ ms: o.ms, kind: o.kind, label: o.label, paksha: o.paksha }));
  }
  
  // Festival/fast name search (generic fasts without variants)
  const matchN = (dict, key) => { const e = dict[key]; return !!e && (key.toLowerCase().includes(q) || (e.en && e.en.toLowerCase().includes(q)) || (e.hi && e.hi.includes(qraw))); };
  const r = scanPanchangCalendar(fromMs, tz, 430, 430, place);
  for (const f of r.festivals) if (matchN(FEST_NAME, f.key)) out.push({ ms: f.ms, kind: "festival", key: f.key });
  for (const f of r.fasts) {
    // Skip if it's a variant (has underscore) - variants are handled above
    if (!f.key.includes("_") && matchN(OBS_NAME, f.key)) out.push({ ms: f.ms, kind: "fast", key: f.key });
  }
  out.sort((a, b) => a.ms - b.ms);
  return out.slice(0, maxN);
}

export { searchUpcoming };
