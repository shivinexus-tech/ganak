/* Bhava Chalit (Sripati) + Bhava Bala (SPLIT-UI-JYOTISH-01f). */

import { rev } from "./ephemeris";
import { SIGN_LORD } from "./panchang";
import { SEVEN } from "./classical";

/* ---------------- Bhava Chalit (Sripati cusps) + Bhava Bala ---------------- */
// sign classes for Bhava Dig Bala (simplified): strong house per class
const SIGN_CLASS_HOUSE = { 0: 10, 1: 10, 4: 10, 8: 1, 9: 4, 2: 1, 5: 1, 6: 1, 10: 1, 3: 4, 11: 4, 7: 7 };

function computeBhavaChalit(ascSid, mcSid, planetLons, ascSign, shadbala) {
  const M = new Array(12);
  M[0] = ascSid; M[9] = mcSid; M[3] = rev(mcSid + 180); M[6] = rev(ascSid + 180);
  const arc10 = rev(ascSid - mcSid);
  M[10] = rev(mcSid + arc10 / 3); M[11] = rev(mcSid + 2 * arc10 / 3);
  const arc14 = rev(M[3] - ascSid);
  M[1] = rev(ascSid + arc14 / 3); M[2] = rev(ascSid + 2 * arc14 / 3);
  M[4] = rev(M[10] + 180); M[5] = rev(M[11] + 180); M[7] = rev(M[1] + 180); M[8] = rev(M[2] + 180);
  const S = new Array(12);
  for (let i = 0; i < 12; i++) S[i] = rev(M[i] + rev(M[(i + 1) % 12] - M[i]) / 2);
  const houseOf = (P) => {
    for (let i = 0; i < 12; i++) { const lo = S[(i - 1 + 12) % 12]; if (rev(P - lo) < rev(S[i] - lo)) return i + 1; }
    return 1;
  };
  const chalit = {};
  Object.keys(planetLons).forEach((k) => (chalit[k] = houseOf(planetLons[k])));

  // Bhava Bala per house (Rupas): lord's Shadbala + dig + net drishti
  const signOfPlanet = {};
  SEVEN.forEach((p) => (signOfPlanet[p] = Math.floor(planetLons[p] / 30)));
  const bhavaBala = [];
  for (let i = 0; i < 12; i++) {
    const sign = (ascSign + i) % 12;
    const lord = SIGN_LORD[sign];
    const adhipati = shadbala.perPlanet[lord].totalR;
    // dig: closeness of this bhava to its sign-class strong house
    const strongH = SIGN_CLASS_HOUSE[sign];
    let circ = Math.abs((i + 1) - strongH); if (circ > 6) circ = 12 - circ;
    const dig = (6 - circ) / 6; // 0..1 Rupa
    // drishti onto the bhava sign from the 7 grahas
    let drishtiV = 0;
    for (const Q of SEVEN) {
      const hp = ((sign - signOfPlanet[Q] + 12) % 12) + 1;
      let frac = 0;
      if (hp === 7) frac = 60;
      else if (hp === 3 || hp === 10) frac = Q === "Saturn" ? 60 : 15;
      else if (hp === 5 || hp === 9) frac = Q === "Jupiter" ? 60 : 30;
      else if (hp === 4 || hp === 8) frac = Q === "Mars" ? 60 : 45;
      if (!frac) continue;
      const qB = ["Jupiter", "Venus", "Mercury"].includes(Q);
      drishtiV += frac * (qB ? 1 : -1);
    }
    const drishti = drishtiV / 4 / 60;
    bhavaBala.push({ house: i + 1, sign, lord, adhipati, dig, drishti, total: adhipati + dig + drishti });
  }
  const ranked = bhavaBala.slice().sort((a, b) => b.total - a.total);
  return { madhyas: M, sandhis: S, chalit, bhavaBala, strongest: ranked[0].house, weakest: ranked[11].house };
}


export { computeBhavaChalit, SIGN_CLASS_HOUSE };
