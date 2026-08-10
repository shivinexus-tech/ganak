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
