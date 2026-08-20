/* Marriage timing — traditionally supportive Vimshottari windows, computed from a
   chart's own dasha timeline. This is an interpretive, heavily-qualified view: it
   flags periods classically associated with marriage, NOT a prediction of when a
   marriage will occur. The UI carries the caveats. Pure: reads the chart object.

   Activators (classical marriage significators): Venus (kalatra karaka, the wife
   significator) and Jupiter (the husband significator), the lord of the 7th house
   (marriage/partner), and any planet occupying the 7th. A dasha period run by any
   of these — at maha or antar level — is a supportive window. */

import { vimSub, clipPeriods } from "./dasha";
import { SIGN_LORD } from "./panchang";

const YEAR = 365.25 * 86400000;

/* The two edges of the search. They are EXPORTED because the screen prints them, not
   because anything else computes with them: before 2026-08-19 an empty list rendered
   as "No clearly supportive window found in the next twenty years", which reads as a
   finding about the marriage when it is a statement about the range Ganak looked in.
   A 2075 birth returns zero windows for the arithmetic reason that the horizon (twenty
   years from today) falls before the chart's first dasha even begins. The floor was
   never stated anywhere at all.

   Deliberately constants the UI renders rather than extra fields on the result object:
   an unrendered computed field is the F23 defect the 2026-08-18 lane removed, and this
   must not reintroduce it. */
export const MARRIAGE_AGE_FLOOR_YEARS = 18;
export const MARRIAGE_HORIZON_YEARS = 20;

export function marriageWindows(chart: any, nowMs: number = Date.now()) {
  const asc = chart.ascSign;
  const seventhLord = SIGN_LORD[(asc + 6) % 12];
  const occ7 = chart.rows.filter((p: any) => p.house === 7 && !["Rahu", "Ketu"].includes(p.name)).map((p: any) => p.name);
  const activators = new Set<string>(["Venus", "Jupiter", seventhLord, ...occ7]);

  const birthMs = chart.birthMs;
  const fromMs = birthMs + MARRIAGE_AGE_FLOOR_YEARS * YEAR;   // marriageable age floor
  const horizonMs = nowMs + MARRIAGE_HORIZON_YEARS * YEAR;    // don't project absurdly far

  const windows: any[] = [];
  for (const maha of chart.dashas) {
    if (maha.end < fromMs || maha.start > horizonMs) continue;
    // antars across this maha's notional full span (matches the chart's convention)
    const fullStart = maha.end - maha.yrs * YEAR;
    const antars = clipPeriods(vimSub(maha.lord, fullStart, maha.yrs * YEAR), birthMs);
    for (const a of antars) {
      if (a.end < fromMs || a.start > horizonMs) continue;
      const mAct = activators.has(maha.lord), aAct = activators.has(a.lord);
      if (!mAct && !aAct) continue;
      const lords = [maha.lord, a.lord].filter((l, i, arr) => activators.has(l) && arr.indexOf(l) === i);
      /* The window is trimmed to the marriageable-age floor, but the row is labelled
         with the antardasha's name — so the card used to print "Mar 2042 – Jun 2043
         Jupiter/Venus dasha" while the dasha tree on the same screen showed that
         antardasha beginning Oct 2040. One page, two start dates for one period
         (bug-bash 2026-08-18 F7). Both are now carried explicitly: `periodStart` /
         `periodEnd` are the antardasha's real span, `start` is the window actually
         being offered, and `trimmedToAge` says the two differ and why, so the card
         can show the difference instead of quietly overwriting it. */
      const periodStart = a.fullStart != null ? a.fullStart : a.start;
      const start = Math.max(a.start, fromMs);
      windows.push({
        start, end: a.end, periodStart, periodEnd: a.end,
        trimmedToAge: start > periodStart, ageFloorYears: 18,
        maha: maha.lord, antar: a.lord, lords,
      });
    }
  }
  // keep windows that are still current or upcoming, earliest first, capped.
  const upcoming = windows.filter((w) => w.end > nowMs).sort((a, b) => a.start - b.start).slice(0, 6);
  return { seventhLord, occ7, activators: [...activators], windows: upcoming };
}
