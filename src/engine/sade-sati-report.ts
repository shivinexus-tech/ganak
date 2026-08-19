import { planetSidMs, SIGNS } from "./panchang";
import { computeKundli } from "./kundli";

const DAY = 86400000;
const YEAR = 365.25 * DAY;

// Sampling step for Saturn's track. Saturn never moves more than ~0.14° a day,
// so a daily sample can never skip a sign boundary or alias a wrap-around.
const STEP = DAY;
// Half-window scanned around the selected date. One Saturn orbit is ~29.46
// years, so ±45 years always contains at least two COMPLETE passages through
// the three-sign block — enough for "previous", "current" and "next".
const WINDOW = 45 * YEAR;

const PHASES = [
  { phase: "rising", relation: 11 },
  { phase: "middle", relation: 0 },
  { phase: "setting", relation: 1 },
];

function saturnLon(ms) {
  return planetSidMs("Saturn", ms);
}

function saturnSignAt(ms) {
  return Math.floor(saturnLon(ms) / 30);
}

function relationAt(ms, moonSign) {
  return (saturnSignAt(ms) - moonSign + 12) % 12;
}

function phaseForRelation(relation) {
  return relation === 11 ? "rising" : relation === 0 ? "middle" : relation === 1 ? "setting" : "none";
}

function wrap180(deg) {
  return ((deg + 540) % 360) - 180;
}

// ---------------------------------------------------------------------------
// Saturn's UNWRAPPED longitude track.
//
// WHY THIS EXISTS (the Sade Sati fragmentation bug, fixed 2026-08-18):
// Sade Sati is ONE passage of Saturn through the three signs around the natal
// Moon — roughly seven and a half years. The old code found it by asking, day
// by day, "is Saturn inside the block right now?" and closing an interval every
// time the answer went false. Saturn retrogrades ~7° twice inside every passage,
// so it repeatedly steps back out of the block it just entered — and each of
// those wobbles closed a fake "cycle". The result was cycles as short as 44 days
// and phase sequences like rising → middle → rising → middle → setting.
//
// The fix is to stop treating the block as an on/off flag and track Saturn's
// longitude as a continuous, un-wrapped quantity instead. On that track the
// passage is defined by two unambiguous events: the FIRST time Saturn reaches
// the start of the 12th sign, and the LAST time it leaves the end of the 2nd.
// Every retrograde re-entry lies strictly between those two events, so it is
// merged into the same passage by construction — no minimum-duration filter,
// no gap threshold, nothing to tune.
// ---------------------------------------------------------------------------
function saturnTrack(from, to) {
  const times = [];
  const lons = [];
  const un = [];
  let prevLon = saturnLon(from);
  let acc = prevLon;
  times.push(from); lons.push(prevLon); un.push(acc);
  for (let ms = from + STEP; ms <= to; ms += STEP) {
    const lon = saturnLon(ms);
    acc += wrap180(lon - prevLon);
    prevLon = lon;
    times.push(ms); lons.push(lon); un.push(acc);
  }
  return { times, lons, un };
}

// Refine the moment the unwrapped track crosses `level`, knowing it happens
// between sample i and i+1. Within one day the track cannot wrap, so the
// anchor sample gives an unambiguous unwrapped value at any instant between.
function crossingTime(track, i, level) {
  let a = track.times[i];
  let b = track.times[i + 1];
  const anchorLon = track.lons[i];
  const anchorU = track.un[i];
  for (let k = 0; k < 40; k++) {
    const mid = (a + b) / 2;
    const u = anchorU + wrap180(saturnLon(mid) - anchorLon);
    if (u < level) a = mid; else b = mid;
  }
  return b;
}

// First time Saturn reaches `level` inside the window (null if it was already
// past it when the window opened — that passage is only partly in view).
function firstCrossing(track, level) {
  const u = track.un;
  if (u[0] >= level) return null;
  for (let i = 1; i < u.length; i++) if (u[i] >= level) return crossingTime(track, i - 1, level);
  return null;
}

// Last time Saturn leaves `level` behind for good inside the window. This is
// the crossing that absorbs retrograde re-entries: a dip back below the level
// simply means the final crossing is later.
function lastCrossing(track, level) {
  const u = track.un;
  if (u[u.length - 1] < level) return null;
  for (let i = u.length - 1; i > 0; i--) if (u[i - 1] < level) return crossingTime(track, i - 1, level);
  return null;
}

// Every complete passage of Saturn through the 90° block that starts at
// `blockStartDeg` (the 12th sign from the natal Moon).
function blockPassages(track, blockStartDeg) {
  const uFirst = track.un[0];
  const uLast = track.un[track.un.length - 1];
  const out = [];
  const kMin = Math.floor((uFirst - blockStartDeg) / 360) - 1;
  const kMax = Math.ceil((uLast - blockStartDeg) / 360) + 1;
  for (let k = kMin; k <= kMax; k++) {
    const entryLevel = blockStartDeg + 360 * k;
    const start = firstCrossing(track, entryLevel);
    if (start == null) continue;
    const marks = [];
    for (const off of [30, 60, 90]) marks.push(lastCrossing(track, entryLevel + off));
    if (marks.some((m) => m == null)) continue;   // passage runs past the window
    if (!(start < marks[0] && marks[0] < marks[1] && marks[1] < marks[2])) continue;
    out.push({ start, end: marks[2], bounds: [start, marks[0], marks[1], marks[2]] });
  }
  out.sort((a, b) => a.start - b.start);
  return out;
}

function phasesOf(passage, moonSign) {
  return PHASES.map((p, i) => ({
    phase: p.phase,
    start: passage.bounds[i],
    end: passage.bounds[i + 1],
    saturnSign: SIGNS[(moonSign + p.relation) % 12],
  }));
}

export function sadeSatiReport(input, asOfMs = Date.now()) {
  const birth = computeKundli({ ...input, ayanamsa: "lahiri" });
  const moonSign = birth.moon.sign;
  const track = saturnTrack(asOfMs - WINDOW, asOfMs + WINDOW);
  const cycles = blockPassages(track, ((moonSign + 11) % 12) * 30);

  const currentOrNext =
    cycles.find((r) => asOfMs >= r.start && asOfMs < r.end) ||
    cycles.find((r) => r.start > asOfMs) ||
    cycles[cycles.length - 1];
  const phaseRanges = phasesOf(currentOrNext, moonSign);

  // The passage is continuous, so "in Sade Sati" is decided by the passage,
  // not by where Saturn happens to sit during a retrograde wobble. The literal
  // sign relation is still reported separately as `relation` / `saturnInBlock`.
  const active = asOfMs >= currentOrNext.start && asOfMs < currentOrNext.end;
  const rel = relationAt(asOfMs, moonSign);
  const segment = phaseRanges.find((p) => asOfMs >= p.start && asOfMs < p.end);
  const phase = active && segment ? segment.phase : "none";

  return {
    active,
    phase,
    moonSign: SIGNS[moonSign],
    moonSignIndex: moonSign,
    saturnSign: SIGNS[saturnSignAt(asOfMs)],
    saturnSignIndex: saturnSignAt(asOfMs),
    relation: rel,
    relationPhase: phaseForRelation(rel),
    saturnInBlock: phaseForRelation(rel) !== "none",
    asOfMs,
    cycle: {
      start: currentOrNext.start,
      end: currentOrNext.end,
      status: active ? "current" : currentOrNext.start > asOfMs ? "upcoming" : "past",
      phases: phaseRanges,
    },
    previousCycle: cycles.filter((r) => r.end <= asOfMs).at(-1) || null,
    nextCycle: cycles.find((r) => r.start > asOfMs) || null,
    allCycles: cycles.map((r) => ({ start: r.start, end: r.end })),
    methodKey: "saturn-12-1-2-from-moon",
  };
}

const SADE_SATI_PHASES = PHASES;
export { SADE_SATI_PHASES };
