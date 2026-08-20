/* Placidus house cusps (SPLIT-UI-CHART-01b). Shell may still hold a copy until wired. */

/* `risingDegree` — THE rising degree, and the polar quadrant correction that
   makes it the rising degree rather than the descendant — is defined ONCE, in
   ephemeris.ts, alongside the primitives it is built from. It used to live
   here, which left `ephemeris.ascendantAt` (Gulika/Mandi, the KP rectification
   markers, Panchaka, Navratri, the Muhurat hub) on an uncorrected copy of the
   same arctangent: for one day the chart's lagna and `ascendantAt` disagreed by
   180 degrees in 87 of 384 sampled polar hours. It is re-exported below so this
   module's existing importers keep working; the derivation and the no-op proof
   are on the definition in ephemeris.ts. */
import { rev, sd, cdg, tdg, atan2d, D2R, risingDegree } from "./ephemeris";

/* Placidus house cusps (tropical, equinox of date) via iterative semi-arc trisection.
   Validated: cusps satisfy the geometric definition exactly (MD/semi-arc = 1/3, 2/3).
   Returns ok:false in polar regions where Placidus is undefined (circumpolar). */
function placidusCusps(RAMC, eps, phi) {
  const mc = atan2d(sd(RAMC), cdg(RAMC) * cdg(eps));
  const asc = risingDegree(RAMC, eps, phi);
  function solve(targetFromAD, guess) {
    let lam = guess;
    for (let i = 0; i < 200; i++) {
      const dec = Math.asin(sd(eps) * sd(lam)) / D2R;
      const adArg = tdg(phi) * tdg(dec);
      if (Math.abs(adArg) >= 1) return null;
      const AD = Math.asin(adArg) / D2R;
      const targetRA = targetFromAD(AD);
      const newLam = atan2d(sd(targetRA), cdg(targetRA) * cdg(eps));
      const resid = Math.abs(((newLam - lam + 540) % 360) - 180);
      lam = newLam;
      if (resid < 1e-10) break;
    }
    return lam;
  }
  const c11 = solve((AD) => RAMC + (90 + AD) / 3, rev(RAMC + 30));
  const c12 = solve((AD) => RAMC + 2 * (90 + AD) / 3, rev(RAMC + 60));
  const c2 = solve((AD) => RAMC + 180 - 2 * (90 - AD) / 3, rev(RAMC + 120));
  const c3 = solve((AD) => RAMC + 180 - (90 - AD) / 3, rev(RAMC + 150));
  /* The duplicate-table scan pairs this with src/screens/PrashnaScreen.tsx:175.
     Both are a null-check over four LOCAL VARIABLES that happen to be named
     c11/c12/c2/c3 — there is no shared data here at all, and nothing to merge.
     A detector artefact, verified 2026-08-19 (dedupe lane). */
  const ok = [c11, c12, c2, c3].every((c) => c != null);
  const c = new Array(13).fill(null);
  c[10] = mc; c[1] = asc; c[4] = rev(mc + 180); c[7] = rev(asc + 180);
  if (ok) {
    c[11] = c11; c[12] = c12; c[2] = c2; c[3] = c3;
    c[5] = rev(c11 + 180); c[6] = rev(c12 + 180); c[8] = rev(c2 + 180); c[9] = rev(c3 + 180);
  }
  return { cusps: c, ok };
}

export { placidusCusps, risingDegree };
