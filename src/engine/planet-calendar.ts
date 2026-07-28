/* Planetary calendar — retrograde/direct stations and combustion (astangata /
   udaya-asta) windows for the five star planets over a date range. Pure: reads
   only the shared ephemeris (planetSidMs, sunSidMs); no state mutated. */

import { planetSidMs, sunSidMs } from "./panchang";
import { rev } from "./ephemeris";

const STAR_PLANETS = ["Mars", "Mercury", "Jupiter", "Venus", "Saturn"];
/* Traditional combustion (asta) orbs in degrees from the Sun. Single conservative
   values (some texts use tighter orbs for retrograde Mercury/Venus). */
const COMBUST_ORB: Record<string, number> = { Mars: 17, Mercury: 14, Jupiter: 11, Venus: 10, Saturn: 15 };

const DAY = 86400000;
/* shortest angular separation of a planet from the Sun, 0..180° */
const sunSep = (name: string, ms: number) => { const d = rev(planetSidMs(name, ms) - sunSidMs(ms)); return d > 180 ? 360 - d : d; };
const planetSpeed = (name: string, ms: number) => (((planetSidMs(name, ms + DAY / 2) - planetSidMs(name, ms - DAY / 2) + 540) % 360) - 180);

/* Retrograde/direct station events: each moment a star planet reverses motion. */
export function retrogradeEvents(fromMs: number, toMs: number) {
  const out: { planet: string; t: number; retro: boolean }[] = [];
  const step = 0.5 * DAY;
  for (const pl of STAR_PLANETS) {
    let pv = planetSpeed(pl, fromMs);
    for (let t = fromMs + step; t <= toMs; t += step) {
      const v = planetSpeed(pl, t);
      if (v * pv < 0) {
        let lo = t - step, hi = t;
        for (let k = 0; k < 24; k++) { const mid = (lo + hi) / 2; if (planetSpeed(pl, mid) * pv > 0) lo = mid; else hi = mid; }
        out.push({ planet: pl, t: hi, retro: v < 0 });
      }
      if (v !== 0) pv = v;
    }
  }
  return out.sort((a, b) => a.t - b.t);
}

/* Combustion (asta = set into the Sun's rays, udaya = rise out of them). `set:true`
   is the moment the planet becomes combust; `set:false` is when it emerges. */
export function combustionEvents(fromMs: number, toMs: number) {
  const out: { planet: string; t: number; set: boolean; orb: number }[] = [];
  const step = 0.5 * DAY;
  for (const pl of STAR_PLANETS) {
    const orb = COMBUST_ORB[pl];
    let prev = sunSep(pl, fromMs) < orb;
    for (let t = fromMs + step; t <= toMs; t += step) {
      const cur = sunSep(pl, t) < orb;
      if (cur !== prev) {
        let lo = t - step, hi = t;
        for (let k = 0; k < 24; k++) { const mid = (lo + hi) / 2; if ((sunSep(pl, mid) < orb) === prev) lo = mid; else hi = mid; }
        out.push({ planet: pl, t: hi, set: cur, orb });
        prev = cur;
      }
    }
  }
  return out.sort((a, b) => a.t - b.t);
}

/* Which star planets are combust / retrograde right at `atMs` (for an at-a-glance
   "now" line). */
export function planetStatesAt(atMs: number) {
  return STAR_PLANETS.map((pl) => ({
    planet: pl,
    retro: planetSpeed(pl, atMs) < 0,
    combust: sunSep(pl, atMs) < COMBUST_ORB[pl],
    sep: sunSep(pl, atMs),
  }));
}

export { STAR_PLANETS, COMBUST_ORB };
