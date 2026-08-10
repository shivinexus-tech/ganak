// Hora adjudication — pure. Reconciles a candidate time window against the
// forbidden belts and Choghadiya. No React, no state, no I/O: the validation
// harness loads this module directly.

export type Window = { start: number; end: number };

/* Subtract a set of cuts from a base window. Returns ordered, non-overlapping
   remainders. Cuts may overlap each other and may fall outside the base. */
export function subtractWindows(base: Window, cuts: Window[]): Window[] {
  const inside = (cuts || [])
    .filter((c) => c && c.end > base.start && c.start < base.end)
    .map((c) => ({ start: Math.max(c.start, base.start), end: Math.min(c.end, base.end) }))
    .sort((a, b) => a.start - b.start);

  const merged: Window[] = [];
  for (const c of inside) {
    const last = merged[merged.length - 1];
    if (last && c.start <= last.end) last.end = Math.max(last.end, c.end);
    else merged.push({ start: c.start, end: c.end });
  }

  const out: Window[] = [];
  let cursor = base.start;
  for (const m of merged) {
    if (m.start > cursor) out.push({ start: cursor, end: m.start });
    cursor = Math.max(cursor, m.end);
  }
  if (cursor < base.end) out.push({ start: cursor, end: base.end });
  return out;
}

export type BlockerKey = "rahu" | "gulika" | "yama";
export type VerdictStatus = "clean" | "partial" | "blocked";
export type ChoghaSeg = { key: string; nat: "good" | "neutral" | "bad"; start: number; end: number };

export type TimingContext = {
  rahu: Window | null;
  gulika: Window | null;
  yama: Window | null;
  abhijit: Window | null;
  chogha: ChoghaSeg[];
};

export type Verdict = {
  status: VerdictStatus;
  usable: Window[];
  blockedBy: BlockerKey[];
  grade: "good" | "neutral" | "bad";
  gradeKey: string | null;
  abhijitBoost: boolean;
};

/* R2: a usable remainder shorter than this is noise, not advice. */
export const MIN_USABLE_MS = 3 * 60000;

const BELTS: BlockerKey[] = ["rahu", "gulika", "yama"];
const overlapMs = (a: Window, b: Window) => Math.max(0, Math.min(a.end, b.end) - Math.max(a.start, b.start));

/* R4/R6: the choghadiya segment covering the greatest share of the window.
   Ties resolve to the earlier segment, which makes the output deterministic. */
export function dominantChoghadiya(win: Window, ctx: TimingContext): { key: string; nat: "good" | "neutral" | "bad" } | null {
  let best: ChoghaSeg | null = null, bestOv = 0;
  for (const seg of (ctx.chogha || [])) {
    const ov = overlapMs(win, seg);
    if (ov > bestOv) { best = seg; bestOv = ov; }
  }
  return best ? { key: best.key, nat: best.nat } : null;
}

/* R1–R6. See docs/superpowers/specs/2026-08-09-hora-usefulness-design.md §4.2. */
export function adjudicate(win: Window, ctx: TimingContext): Verdict {
  const blockedBy: BlockerKey[] = [];
  const cuts: Window[] = [];
  for (const key of BELTS) {
    const belt = ctx[key];
    if (belt && overlapMs(win, belt) > 0) { blockedBy.push(key); cuts.push(belt); }
  }

  const remainders = subtractWindows(win, cuts);
  const usable = remainders;
  const significantRemainders = remainders.filter((w) => w.end - w.start >= MIN_USABLE_MS);
  const significantTotal = significantRemainders.reduce((s, w) => s + (w.end - w.start), 0);

  const anyBeltsInContext = ctx.rahu || ctx.gulika || ctx.yama;

  let status: VerdictStatus;
  if (blockedBy.length === 0) {
    if (anyBeltsInContext) {
      status = win.end - win.start >= MIN_USABLE_MS ? "clean" : "blocked";
    } else {
      status = "clean";
    }
  } else if (remainders.length === 0) {
    status = "blocked";
  } else if (significantTotal <= 0) {
    status = "partial";
  } else if (significantTotal >= win.end - win.start) {
    status = "clean";
  } else {
    status = "partial";
  }

  const dom = dominantChoghadiya(win, ctx);
  return {
    status,
    usable,
    blockedBy,
    grade: dom ? dom.nat : "neutral",
    gradeKey: dom ? dom.key : null,
    abhijitBoost: !!(ctx.abhijit && overlapMs(win, ctx.abhijit) > 0),
  };
}
