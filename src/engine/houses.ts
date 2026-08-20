/* Placidus house cusps (SPLIT-UI-CHART-01b). Shell may still hold a copy until wired. */

import { rev, sd, cdg, tdg, atan2d, D2R } from "./ephemeris";

/* Right ascension of an ecliptic degree (ecliptic latitude zero):
   tan(RA) = cos(eps) * tan(lambda). Used only by the polar quadrant correction. */
const raOfEcl = (lam, eps) => atan2d(cdg(eps) * sd(lam), cdg(lam));

/* THE rising degree — ONE definition for the whole birth-chart engine.
   =====================================================================
   The textbook ascendant arctangent returns ONE of the two antipodal points
   where the ecliptic cuts the horizon. Below the polar circle that is always
   the eastern, RISING one. Above it — Murmansk 68.96, Tromso 69.65, Utqiagvik
   71.29, Longyearbyen 78.22 — the arctangent lands in the other quadrant for
   part of the day and hands back the DESCENDANT as the rising degree, which
   rotates the entire chart by six houses: lagna becomes the 7th, every graha's
   house is wrong by six, and every house-based reading built on it is read
   from the wrong end.

   POLAR QUADRANT CORRECTION (2026-08-19, defect found by the horary lane on
   2026-08-18; see plans/audits/2026-08-19-polar-quadrant-fix.md). Diurnal
   motion is uniform, so the fix is the definition itself. Differentiating the
   published altitude relation
       sin(alt) = sin(phi)sin(dec) + cos(phi)cos(dec)cos(H)
   with respect to the hour angle H, which increases uniformly with time, gives
       d(sin alt)/dH = -cos(phi)cos(dec)sin(H),
   so a point is rising exactly while sin(H) < 0 — that is, while it is EAST of
   the meridian. The two ecliptic/horizon intersections are antipodal, so their
   hour angles differ by exactly 180 degrees and precisely one of them is east.
   Take the hour angle of the computed point; if it is west of the meridian the
   formula returned the descendant, so take its opposite.

   Below the polar circle sin(H) is never positive here, so this is a strict
   no-op for every latitude Ganak's other gates cover — measured over 387,720
   latitude/RAMC/obliquity samples: 32,284 corrected, none of them at
   |latitude| <= 66.5607, the lowest touched being 67.00.

   This is the same correction src/screens/PrashnaScreen.tsx (PR_ascMc) applies
   to the horary ring. The two surfaces used to disagree by 180 degrees at polar
   latitudes; validation/polar-chart.cjs holds them together and anchors both to
   published spherical astronomy rather than to each other. */
function risingDegree(RAMC, eps, phi) {
  const asc = atan2d(cdg(RAMC), -(sd(RAMC) * cdg(eps) + tdg(phi) * sd(eps)));
  return sd(rev(RAMC - raOfEcl(asc, eps))) > 0 ? rev(asc + 180) : asc;
}

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
  const ok = [c11, c12, c2, c3].every((c) => c != null);
  const c = new Array(13).fill(null);
  c[10] = mc; c[1] = asc; c[4] = rev(mc + 180); c[7] = rev(asc + 180);
  if (ok) {
    c[11] = c11; c[12] = c12; c[2] = c2; c[3] = c3;
    c[5] = rev(c11 + 180); c[6] = rev(c12 + 180); c[8] = rev(c2 + 180); c[9] = rev(c3 + 180);
  }
  return { cusps: c, ok };
}

export { placidusCusps, risingDegree, raOfEcl };
