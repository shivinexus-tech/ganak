/* Marriage timing — traditionally supportive Vimshottari windows, computed from a
   chart's own dasha timeline. This is an interpretive, heavily-qualified view: it
   flags periods classically associated with marriage, NOT a prediction of when a
   marriage will occur. The UI carries the caveats. Pure: reads the chart object.

   Activators (classical marriage significators): Venus (kalatra karaka, the wife
   significator) and Jupiter (the husband significator), the lord of the 7th house
   (marriage/partner), and any planet occupying the 7th. A dasha period run by any
   of these — at maha or antar level — is a supportive window. */

import { vimSub } from "./dasha";
import { SIGN_LORD } from "./panchang";

const YEAR = 365.25 * 86400000;

export function marriageWindows(chart: any, nowMs: number = Date.now()) {
  const asc = chart.ascSign;
  const seventhLord = SIGN_LORD[(asc + 6) % 12];
  const occ7 = chart.rows.filter((p: any) => p.house === 7 && !["Rahu", "Ketu"].includes(p.name)).map((p: any) => p.name);
  const activators = new Set<string>(["Venus", "Jupiter", seventhLord, ...occ7]);

  const birthMs = chart.birthMs;
  const fromMs = birthMs + 18 * YEAR;        // marriageable age floor
  const horizonMs = nowMs + 20 * YEAR;       // don't project absurdly far

  const windows: any[] = [];
  for (const maha of chart.dashas) {
    if (maha.end < fromMs || maha.start > horizonMs) continue;
    // antars across this maha's notional full span (matches the chart's convention)
    const fullStart = maha.end - maha.yrs * YEAR;
    const antars = vimSub(maha.lord, fullStart, maha.yrs * YEAR).filter((a: any) => a.end > birthMs);
    for (const a of antars) {
      if (a.end < fromMs || a.start > horizonMs) continue;
      const mAct = activators.has(maha.lord), aAct = activators.has(a.lord);
      if (!mAct && !aAct) continue;
      const lords = [maha.lord, a.lord].filter((l, i, arr) => activators.has(l) && arr.indexOf(l) === i);
      windows.push({ start: Math.max(a.start, fromMs), end: a.end, maha: maha.lord, antar: a.lord, lords });
    }
  }
  // keep windows that are still current or upcoming, earliest first, capped.
  const upcoming = windows.filter((w) => w.end > nowMs).sort((a, b) => a.start - b.start).slice(0, 6);
  return { seventhLord, occ7, activators: [...activators], windows: upcoming };
}
