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

/* Sum total overlap between a window and a list of spans. Returns milliseconds
   of cumulative overlap; a span can overlap win at multiple points, and each
   overlap accumulates. Used by dominantChoghadiyaOverSpans (sum per Choghadiya
   segment) and overlapsAnySpan (sum across all usable spans). */
function sumOverlap(win: Window, spans: Window[]): number {
  let total = 0;
  for (const span of spans) total += overlapMs(span, win);
  return total;
}

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

/* R4/R6, summed across multiple spans: the choghadiya segment covering the
   greatest combined share of `spans` (the usable remainders), not of any
   single window. A segment touching two separate remainders accumulates both.
   Ties resolve to the earlier segment (same strict-`>` rule as
   dominantChoghadiya, applied to array order). Does not replace
   dominantChoghadiya's single-Window signature — that function is unchanged
   and still used directly by the gate and by the empty-usable fallback. */
function dominantChoghadiyaOverSpans(spans: Window[], ctx: TimingContext): { key: string; nat: "good" | "neutral" | "bad" } | null {
  let best: ChoghaSeg | null = null, bestOv = 0;
  for (const seg of (ctx.chogha || [])) {
    const ov = sumOverlap(seg, spans);
    if (ov > bestOv) { best = seg; bestOv = ov; }
  }
  return best ? { key: best.key, nat: best.nat } : null;
}

/* R5, mirroring R4/R6's dominantChoghadiyaOverSpans: true when `win` overlaps
   at least one of `spans` (the usable remainders), not any single span alone.
   Summing overlap across spans and checking for a positive total is
   equivalent to "overlaps at least one," since overlapMs never returns a
   negative value. */
function overlapsAnySpan(win: Window | null, spans: Window[]): boolean {
  if (!win) return false;
  return sumOverlap(win, spans) > 0;
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
  /* R2: the MIN_USABLE_MS filter applies only to remainders produced by a cut.
     A window no belt touches (cuts.length === 0) passes through whole, however
     short — R2 suppresses slivers left behind by subtraction, not short windows
     in general. subtractWindows(win, []) always returns exactly [win], so the
     "whole window" case falls out of the same expression. */
  const usable = cuts.length === 0
    ? remainders
    : remainders.filter((w) => w.end - w.start >= MIN_USABLE_MS);

  /* R3: status derives from usable vs. the window alone. */
  const usableTotal = usable.reduce((s, w) => s + (w.end - w.start), 0);
  const windowTotal = win.end - win.start;
  let status: VerdictStatus;
  if (usable.length === 0) {
    status = "blocked";
  } else if (usableTotal < windowTotal) {
    status = "partial";
  } else {
    status = "clean";
  }

  /* R4 (corrected): grade what the user can actually act in. When usable is
     non-empty, sum overlap across the usable spans rather than grading the
     raw window — otherwise a belt that carves a hole out of the window's
     middle can leave the dominant segment sitting entirely inside the
     blocked hole, describing time the user cannot use. When usable is empty
     (fully blocked), fall back to grading the whole window: a blocked window
     should still report what its quality would have been, and there is no
     usable time left to measure against. */
  const dom = usable.length > 0
    ? dominantChoghadiyaOverSpans(usable, ctx)
    : dominantChoghadiya(win, ctx);

  /* R5 (corrected): boost only what the user can actually act in. When
     usable is non-empty, check ctx.abhijit against the usable spans rather
     than the raw window — otherwise Abhijit can sit entirely inside a belt's
     blocked hole and still claim to boost a recommendation the user cannot
     use. When usable is empty (fully blocked), fall back to whole-window
     overlap: a blocked window should still report whether it would have been
     boosted, and there is no usable time left to measure against. */
  const abhijitBoost = usable.length > 0
    ? overlapsAnySpan(ctx.abhijit, usable)
    : !!(ctx.abhijit && overlapMs(win, ctx.abhijit) > 0);

  return {
    status,
    usable,
    blockedBy,
    grade: dom ? dom.nat : "neutral",
    gradeKey: dom ? dom.key : null,
    abhijitBoost,
  };
}

/* The first window at or after `afterMs` that still has usable time in it.
   Returns null when the day has nothing left — the caller then offers tomorrow.

   Adjudication runs on the OFFERED range (the window clipped to afterMs), not
   the raw window, and every field of the returned verdict — status, usable,
   blockedBy, grade, abhijitBoost — derives from that single adjudicate() call.
   That makes it structurally impossible for a field to describe a belt or
   Choghadiya span that falls entirely in the already-elapsed part of the
   window: nothing outside the offered range ever reaches adjudicate(). Additionally,
   adjudicate scopes both grade/gradeKey and abhijitBoost to the usable spans,
   not the raw window, ensuring recommendations describe time the user can act in. */
export function nextCleanWindow(
  windows: Window[], ctx: TimingContext, afterMs: number
): { window: Window; verdict: Verdict } | null {
  const ordered = [...(windows || [])].sort((a, b) => a.start - b.start);
  for (const win of ordered) {
    const offeredRange: Window = { start: Math.max(win.start, afterMs), end: win.end };
    if (offeredRange.end <= offeredRange.start) continue;
    const verdict = adjudicate(offeredRange, ctx);
    if (verdict.status === "blocked") continue;
    const usableTotal = verdict.usable.reduce((s, w) => s + (w.end - w.start), 0);
    if (usableTotal < MIN_USABLE_MS) continue;
    return { window: win, verdict };
  }
  return null;
}
