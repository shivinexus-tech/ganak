import { planetSidMs, SIGNS } from "./panchang";
import { computeKundli } from "./kundli";

const DAY = 86400000;
const YEAR = 365.25 * DAY;

const PHASES = [
  { phase: "rising", relation: 11 },
  { phase: "middle", relation: 0 },
  { phase: "setting", relation: 1 },
];

function saturnSignAt(ms) {
  return Math.floor(planetSidMs("Saturn", ms) / 30);
}

function relationAt(ms, moonSign) {
  return (saturnSignAt(ms) - moonSign + 12) % 12;
}

function refineBoundary(lo, hi, moonSign, target, wantInside) {
  let a = lo, b = hi;
  for (let i = 0; i < 42; i++) {
    const mid = (a + b) / 2;
    const inside = target.has(relationAt(mid, moonSign));
    if (inside === wantInside) b = mid;
    else a = mid;
  }
  return b;
}

function relationIntervals(moonSign, targetRelations, from, to) {
  const target = new Set(targetRelations);
  const out = [];
  let prevMs = from;
  let prevInside = target.has(relationAt(prevMs, moonSign));
  let open = prevInside ? from : null;
  for (let ms = from + DAY; ms <= to; ms += DAY) {
    const inside = target.has(relationAt(ms, moonSign));
    if (inside !== prevInside) {
      const boundary = refineBoundary(prevMs, ms, moonSign, target, inside);
      if (inside) open = boundary;
      else if (open != null) {
        out.push({ start: open, end: boundary });
        open = null;
      }
    }
    prevMs = ms;
    prevInside = inside;
  }
  if (open != null) out.push({ start: open, end: to });
  return out.filter((r) => r.end - r.start > 7 * DAY);
}

function phaseForRelation(relation) {
  return relation === 11 ? "rising" : relation === 0 ? "middle" : relation === 1 ? "setting" : "none";
}

function overlap(a, b) {
  return Math.max(0, Math.min(a.end, b.end) - Math.max(a.start, b.start));
}

export function sadeSatiReport(input, asOfMs = Date.now()) {
  const birth = computeKundli({ ...input, ayanamsa: "lahiri" });
  const moonSign = birth.moon.sign;
  const from = asOfMs - 45 * YEAR;
  const to = asOfMs + 45 * YEAR;
  const activeCycles = relationIntervals(moonSign, [11, 0, 1], from, to);
  const currentOrNext =
    activeCycles.find((r) => asOfMs >= r.start && asOfMs < r.end) ||
    activeCycles.find((r) => r.start > asOfMs) ||
    activeCycles[activeCycles.length - 1];
  const rel = relationAt(asOfMs, moonSign);
  const phase = phaseForRelation(rel);
  const active = phase !== "none";
  const phaseRanges = [];
  for (const p of PHASES) {
    const ranges = relationIntervals(moonSign, [p.relation], currentOrNext.start - 30 * DAY, currentOrNext.end + 30 * DAY)
      .filter((r) => overlap(r, currentOrNext) > 0);
    for (const r of ranges) phaseRanges.push({
      phase: p.phase,
      start: Math.max(r.start, currentOrNext.start),
      end: Math.min(r.end, currentOrNext.end),
      saturnSign: SIGNS[(moonSign + p.relation) % 12],
    });
  }
  phaseRanges.sort((a, b) => a.start - b.start);
  return {
    active,
    phase,
    moonSign: SIGNS[moonSign],
    moonSignIndex: moonSign,
    saturnSign: SIGNS[saturnSignAt(asOfMs)],
    saturnSignIndex: saturnSignAt(asOfMs),
    relation: rel,
    asOfMs,
    cycle: {
      start: currentOrNext.start,
      end: currentOrNext.end,
      status: active ? "current" : currentOrNext.start > asOfMs ? "upcoming" : "past",
      phases: phaseRanges,
    },
    previousCycle: activeCycles.filter((r) => r.end <= asOfMs).at(-1) || null,
    nextCycle: activeCycles.find((r) => r.start > asOfMs) || null,
    methodKey: "saturn-12-1-2-from-moon",
  };
}

const SADE_SATI_PHASES = PHASES;
export { SADE_SATI_PHASES };
