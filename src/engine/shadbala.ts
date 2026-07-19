/* Shadbala (six-fold strength) — pure extraction (SPLIT-UI-JYOTISH-01c).
   Shell may still hold a copy until wired. */

import { rev, sd, D2R } from "./ephemeris";
import { OWN_SIGNS, SEVEN } from "./classical";
import { SIGN_LORD } from "./panchang";
import { vargaSign } from "./varga";

/* ---------------- Shadbala: six-fold planetary strength ---------------- */
const MT_SIGN = { Sun: 4, Moon: 1, Mars: 0, Mercury: 5, Jupiter: 8, Venus: 6, Saturn: 10 };
const EXALT_DEG = { Sun: 10, Moon: 33, Mars: 298, Mercury: 165, Jupiter: 95, Venus: 357, Saturn: 200 };
const DEBIL_DEG = {}; SEVEN.forEach((p) => (DEBIL_DEG[p] = rev(EXALT_DEG[p] + 180)));
const NAISARGIKA = { Sun: 60, Moon: 51.43, Mars: 17.14, Mercury: 25.71, Jupiter: 34.29, Venus: 42.86, Saturn: 8.57 };
const REQUIRED_RUPA = { Sun: 5, Moon: 6, Mars: 5, Mercury: 7, Jupiter: 6.5, Venus: 5.5, Saturn: 5 };
const DIG_OFFSET = { Sun: 270, Mars: 270, Moon: 90, Venus: 90, Jupiter: 0, Mercury: 0, Saturn: 180 };
const NF = {
  Sun: { F: ["Moon", "Mars", "Jupiter"], E: ["Venus", "Saturn"] },
  Moon: { F: ["Sun", "Mercury"], E: [] },
  Mars: { F: ["Sun", "Moon", "Jupiter"], E: ["Mercury"] },
  Mercury: { F: ["Sun", "Venus"], E: ["Moon"] },
  Jupiter: { F: ["Sun", "Moon", "Mars"], E: ["Mercury", "Venus"] },
  Venus: { F: ["Mercury", "Saturn"], E: ["Sun", "Moon"] },
  Saturn: { F: ["Mercury", "Venus"], E: ["Sun", "Moon", "Mars"] },
};
const VARGA7 = ["D1", "D2", "D3", "D7", "D9", "D12", "D30"];
const CHESHTA_SPD = { Mars: [0.79, -0.40], Mercury: [2.20, -1.40], Jupiter: [0.24, -0.14], Venus: [1.26, -0.63], Saturn: [0.13, -0.08] };
const BALA_PARTS = [
  { k: "sthana", label: "Sthana", note: "positional", color: "#A86A12" },
  { k: "dig", label: "Dig", note: "directional", color: "#C2451E" },
  { k: "kala", label: "Kala", note: "temporal", color: "#2C7D4F" },
  { k: "cheshta", label: "Cheshta", note: "motional", color: "#46588F" },
  { k: "naisargika", label: "Naisargika", note: "natural", color: "#9A7000" },
  { k: "drik", label: "Drik", note: "aspectual", color: "#6E5C82" },
];

function naturalRel(A, B) {
  if (NF[A].F.includes(B)) return "F";
  if (NF[A].E.includes(B)) return "E";
  return "N";
}
function compoundVal(A, B, signOf) {
  const nf = naturalRel(A, B);
  const hb = ((signOf[B] - signOf[A] + 12) % 12) + 1;
  const tf = [2, 3, 4, 10, 11, 12].includes(hb) ? "F" : "E";
  return { FF: 22.5, FE: 7.5, NF: 15, NE: 3.75, EF: 7.5, EE: 1.875 }[nf + tf];
}

function computeShadbala(ctx) {
  const { rows, ascSign, ascLong, sunLon, moonLon, tropLon, eps, speeds, birthMs, tz, lon, rise, set } = ctx;
  const signOf = {}, degOf = {}, houseOf = {}, lonOf = {};
  rows.forEach((p) => { signOf[p.name] = p.sign; degOf[p.name] = p.deg; houseOf[p.name] = p.house; lonOf[p.name] = p.lon; });

  const isDay = rise != null && birthMs >= rise && birthMs < set;
  const dayLen = rise != null ? set - rise : 12 * 3600000;
  const hoursLMT = (((birthMs / 3600000 + lon / 15) % 24) + 24) % 24;
  const distMid = Math.min(hoursLMT, 24 - hoursLMT);
  const dow = new Date(birthMs + tz * 3600000).getUTCDay();
  const E_elong = (() => { let e = Math.abs(moonLon - sunLon); return e > 180 ? 360 - e : e; })();

  const WEEKLORD = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"][dow];
  const CHALDEAN = ["Saturn", "Jupiter", "Mars", "Sun", "Venus", "Mercury", "Moon"];
  let horaLord = null;
  if (rise != null) {
    let hrs = Math.floor((birthMs - rise) / 3600000); hrs = ((hrs % 24) + 24) % 24;
    horaLord = CHALDEAN[(CHALDEAN.indexOf(WEEKLORD) + hrs) % 7];
  }
  let tribhagaLord = null;
  if (rise != null) {
    if (isDay) tribhagaLord = ["Mercury", "Sun", "Saturn"][Math.min(2, Math.floor((birthMs - rise) / (dayLen / 3)))];
    else {
      const nightLen = 24 * 3600000 - dayLen;
      const into = birthMs >= set ? birthMs - set : birthMs - (set - 24 * 3600000);
      tribhagaLord = ["Moon", "Venus", "Mars"][Math.max(0, Math.min(2, Math.floor(into / (nightLen / 3))))];
    }
  }

  const out = {};
  for (const P of SEVEN) {
    let arc = Math.abs(lonOf[P] - DEBIL_DEG[P]); if (arc > 180) arc = 360 - arc;
    const uchcha = arc / 3;
    let sapta = 0;
    for (const V of VARGA7) {
      const sg = vargaSign(lonOf[P], V);
      if (OWN_SIGNS[P].includes(sg)) sapta += sg === MT_SIGN[P] ? 45 : 30;
      else sapta += compoundVal(P, SIGN_LORD[sg], signOf);
    }
    const rasiSign = signOf[P], navSign = vargaSign(lonOf[P], "D9");
    const evenLoving = P === "Moon" || P === "Venus";
    const ojha = (evenLoving ? (rasiSign % 2 === 1 ? 15 : 0) : (rasiSign % 2 === 0 ? 15 : 0)) +
                 (evenLoving ? (navSign % 2 === 1 ? 15 : 0) : (navSign % 2 === 0 ? 15 : 0));
    const h = houseOf[P];
    const kendradi = [1, 4, 7, 10].includes(h) ? 60 : [2, 5, 8, 11].includes(h) ? 30 : 15;
    const drek = Math.floor(degOf[P] / 10);
    let drekBala = 0;
    if (["Sun", "Mars", "Jupiter"].includes(P) && drek === 0) drekBala = 15;
    else if (["Mercury", "Saturn"].includes(P) && drek === 1) drekBala = 15;
    else if (["Moon", "Venus"].includes(P) && drek === 2) drekBala = 15;
    const sthana = uchcha + sapta + ojha + kendradi + drekBala;

    const powerless = rev(ascLong + DIG_OFFSET[P] + 180);
    let darc = Math.abs(lonOf[P] - powerless); if (darc > 180) darc = 360 - darc;
    const dig = darc / 3;

    let natho;
    if (P === "Mercury") natho = 60;
    else if (["Moon", "Mars", "Saturn"].includes(P)) natho = (12 - distMid) / 12 * 60;
    else natho = distMid / 12 * 60;
    let paksha = ["Mercury", "Jupiter", "Venus", "Moon"].includes(P) ? E_elong / 3 : (180 - E_elong) / 3;
    if (P === "Moon") paksha *= 2;
    const tribhaga = (tribhagaLord === P ? 60 : 0) + (P === "Jupiter" ? 60 : 0);
    const vara = WEEKLORD === P ? 45 : 0;
    const hora = horaLord === P ? 60 : 0;
    const decl = Math.asin(sd(eps) * sd(tropLon[P])) / D2R;
    const kdir = ["Sun", "Mars", "Jupiter", "Venus", "Mercury"].includes(P) ? 1 : -1;
    let ayana = Math.max(0, Math.min(60, (24 + kdir * decl) / 48 * 60));
    if (P === "Sun") ayana *= 2;
    const kala = natho + paksha + tribhaga + vara + hora + ayana;

    let cheshta;
    if (P === "Sun") cheshta = ayana;
    else if (P === "Moon") cheshta = paksha;
    else { const [vmax, vretro] = CHESHTA_SPD[P]; cheshta = Math.max(0, Math.min(60, 60 * (vmax - speeds[P]) / (vmax - vretro))); }

    const naisargika = NAISARGIKA[P];

    let drikRaw = 0;
    for (const Q of SEVEN) {
      if (Q === P) continue;
      const hp = ((signOf[P] - signOf[Q] + 12) % 12) + 1;
      let frac = 0;
      if (hp === 7) frac = 60;
      else if (hp === 3 || hp === 10) frac = Q === "Saturn" ? 60 : 15;
      else if (hp === 5 || hp === 9) frac = Q === "Jupiter" ? 60 : 30;
      else if (hp === 4 || hp === 8) frac = Q === "Mars" ? 60 : 45;
      if (frac === 0) continue;
      let qB = ["Jupiter", "Venus", "Mercury"].includes(Q);
      if (Q === "Moon") { const e = (moonLon - sunLon + 360) % 360; qB = e > 0 && e < 180; }
      drikRaw += frac * (qB ? 1 : -1);
    }
    const drik = drikRaw / 4;

    const totalV = sthana + dig + kala + cheshta + naisargika + drik;
    out[P] = { sthana, dig, kala, cheshta, naisargika, drik, totalV, totalR: totalV / 60, required: REQUIRED_RUPA[P], ratio: totalV / 60 / REQUIRED_RUPA[P] };
  }
  const ranked = SEVEN.slice().sort((a, b) => out[b].totalR - out[a].totalR);
  return { perPlanet: out, ranked };
}

/* read/write small UI preferences in the query string (?lang=hi&screen=daily) —
   survives reloads without touching the banned browser storage APIs */
function urlPrefGet(k) { try { return new URLSearchParams(window.location.search).get(k); } catch (e) { return null; } }
function urlPrefSet(k, v) { try { const q = new URLSearchParams(window.location.search); q.set(k, v); window.history.replaceState(null, "", "?" + q.toString() + window.location.hash); } catch (e) {} }
const MUH_CATS = [
  { key: "wedding", hi: "विवाह", en: "Wedding" },
  { key: "housewarming", hi: "गृह प्रवेश", en: "Housewarming" },
  { key: "vehicle", hi: "वाहन", en: "Vehicle" },
  { key: "property", hi: "सम्पत्ति", en: "Property" },
  { key: "mundan", hi: "मुंडन", en: "Mundan" },
  { key: "naming", hi: "नामकरण", en: "Naming" },
  { key: "venture", hi: "व्यापार", en: "Business" },
];

export { computeShadbala, naturalRel, compoundVal, NF, BALA_PARTS, MT_SIGN };
