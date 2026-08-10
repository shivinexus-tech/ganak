// Personal hora — which planetary hours belong to this chart. Pure.
// Today the ascendant arrives from a manual selector; a saved chart can feed the
// same functions later with no change to this module.

import { SIGN_LORD } from "./panchang";
import { horaWindowsForPlanet } from "./hora";

/* Lords of the trikona houses (1, 5, 9) counted from the ascendant.
   These are the classically auspicious rulers for the native. One planet can
   rule two of the three trikona signs, so the result is de-duplicated and can
   legitimately contain fewer than three planets. */
export function trikonaLords(ascIdx: number): string[] {
  return [...new Set([0, 4, 8].map((offset) => SIGN_LORD[(ascIdx + offset) % 12]))];
}

/* Every hora today ruled by one of this chart's trikona lords, in time order.
   nextRise must be the real following sunrise (see horaWindowsForPlanet's
   comment on its own default) — it is forwarded here, not defaulted. */
export function personalHoraWindows(
  ascIdx: number, weekday: number, rise: number, set: number, nextRise: number
): Array<{ planet: string; start: number; end: number; period: "day" | "night" }> {
  const out: Array<{ planet: string; start: number; end: number; period: "day" | "night" }> = [];
  for (const planet of trikonaLords(ascIdx))
    for (const w of horaWindowsForPlanet(planet, weekday, rise, set, nextRise))
      out.push({ planet, start: w.start, end: w.end, period: w.period });
  out.sort((a, b) => a.start - b.start);
  return out;
}
