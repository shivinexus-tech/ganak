/* Classical analysis (Ashtakavarga, Arudhas, Yogas) — pure extraction (SPLIT-UI-JYOTISH-01b).
   Calc only; UI still renders from shell until wired. */

import { SIGN_LORD } from "./panchang";

/* ---------------- classical analysis: lords, ashtakavarga, yogas, arudhas ---------------- */
const OWN_SIGNS = { Sun: [4], Moon: [3], Mars: [0, 7], Mercury: [2, 5], Jupiter: [8, 11], Venus: [1, 6], Saturn: [9, 10] };
const EXALT = { Sun: 0, Moon: 1, Mars: 9, Mercury: 5, Jupiter: 3, Venus: 11, Saturn: 6 };
const DEBIL = { Sun: 6, Moon: 7, Mars: 3, Mercury: 11, Jupiter: 9, Venus: 5, Saturn: 0 };
const SEVEN = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"];

/* BPHS benefic-point tables: houses (from each contributor) where a bindu is given */
const BAV_TABLES = {
  Sun:     { Sun: [1,2,4,7,8,9,10,11], Moon: [3,6,10,11], Mars: [1,2,4,7,8,9,10,11], Mercury: [3,5,6,9,10,11,12], Jupiter: [5,6,9,11], Venus: [6,7,12], Saturn: [1,2,4,7,8,9,10,11], Lagna: [3,4,6,10,11,12] },
  Moon:    { Sun: [3,6,7,8,10,11], Moon: [1,3,6,7,10,11], Mars: [2,3,5,6,9,10,11], Mercury: [1,3,4,5,7,8,10,11], Jupiter: [1,4,7,8,10,11,12], Venus: [3,4,5,7,9,10,11], Saturn: [3,5,6,11], Lagna: [3,6,10,11] },
  Mars:    { Sun: [3,5,6,10,11], Moon: [3,6,11], Mars: [1,2,4,7,8,10,11], Mercury: [3,5,6,11], Jupiter: [6,10,11,12], Venus: [6,8,11,12], Saturn: [1,4,7,8,9,10,11], Lagna: [1,3,6,10,11] },
  Mercury: { Sun: [5,6,9,11,12], Moon: [2,4,6,8,10,11], Mars: [1,2,4,7,8,9,10,11], Mercury: [1,3,5,6,9,10,11,12], Jupiter: [6,8,11,12], Venus: [1,2,3,4,5,8,9,11], Saturn: [1,2,4,7,8,9,10,11], Lagna: [1,2,4,6,8,10,11] },
  Jupiter: { Sun: [1,2,3,4,7,8,9,10,11], Moon: [2,5,7,9,11], Mars: [1,2,4,7,8,10,11], Mercury: [1,2,4,5,6,9,10,11], Jupiter: [1,2,3,4,7,8,10,11], Venus: [2,5,6,9,10,11], Saturn: [3,5,6,12], Lagna: [1,2,4,5,6,7,9,10,11] },
  Venus:   { Sun: [8,11,12], Moon: [1,2,3,4,5,8,9,11,12], Mars: [3,5,6,9,11,12], Mercury: [3,5,6,9,11], Jupiter: [5,8,9,10,11], Venus: [1,2,3,4,5,8,9,10,11], Saturn: [3,4,5,8,9,10,11], Lagna: [1,2,3,4,5,8,9,11] },
  Saturn:  { Sun: [1,2,4,7,8,10,11], Moon: [3,6,11], Mars: [3,5,6,10,11,12], Mercury: [6,8,9,10,11,12], Jupiter: [5,6,11,12], Venus: [6,11,12], Saturn: [3,5,6,11], Lagna: [1,3,4,6,10,11] },
};

function computeAshtakavarga(signOf, ascSign) {
  const bav = {};
  for (const planet of SEVEN) {
    const arr = Array(12).fill(0);
    for (const [contrib, houses] of Object.entries(BAV_TABLES[planet])) {
      const from = contrib === "Lagna" ? ascSign : signOf[contrib];
      for (const h of houses) arr[(from + h - 1) % 12]++;
    }
    bav[planet] = arr;
  }
  const sav = Array(12).fill(0);
  for (const p of SEVEN) for (let i = 0; i < 12; i++) sav[i] += bav[p][i];
  return { bav, sav };
}

/* Arudha pada: as far from the lord as the lord is from its house;
   if it lands in the same house or the 7th, take the 10th therefrom. */
function computeArudhas(ascSign, signOf) {
  const out = [];
  for (let h = 1; h <= 12; h++) {
    const S = (ascSign + h - 1) % 12;
    const lord = SIGN_LORD[S];
    const P = signOf[lord];
    const n = (P - S + 12) % 12;
    let A = (P + n) % 12;
    const rel = (A - S + 12) % 12;
    if (rel === 0 || rel === 6) A = (A + 9) % 12;
    out.push({ h, sign: A, lord });
  }
  return out;
}

function detectYogas(rows, ascSign) {
  const sOf = {};
  rows.forEach((p) => (sOf[p.name] = p.sign));
  const hFrom = (s, ref) => ((s - ref + 12) % 12) + 1;
  const hL = (p) => hFrom(sOf[p], ascSign);
  const moon = sOf.Moon, sun = sOf.Sun;
  const KEN = [1, 4, 7, 10];
  const lordOfHouse = (h) => SIGN_LORD[(ascSign + h - 1) % 12];
  const Y = [];
  const add = (name, kind, text) => Y.push({ name, kind, text });

  if (KEN.includes(hFrom(sOf.Jupiter, moon))) add("Gaja Kesari", "good", "Jupiter in a kendra from the Moon — dignity, wisdom and a reputation that endures.");
  if (sOf.Mercury === sun) add("Budhaditya", "good", "Sun and Mercury together — sharp intellect and administrative skill.");
  if (sOf.Mars === moon) add("Chandra-Mangala", "good", "Moon with Mars — earning power, drive and resourcefulness.");

  const MAHA = { Mars: "Ruchaka", Mercury: "Bhadra", Jupiter: "Hamsa", Venus: "Malavya", Saturn: "Sasa" };
  for (const pl of Object.keys(MAHA)) {
    const sg = sOf[pl];
    if ((OWN_SIGNS[pl].includes(sg) || EXALT[pl] === sg) && KEN.includes(hL(pl)))
      add(MAHA[pl] + " Mahapurusha", "good", pl + " in its own or exaltation sign in a kendra — one of the five marks of an exceptional person.");
  }

  for (const pl of SEVEN) {
    if (DEBIL[pl] === sOf[pl]) {
      const disp = SIGN_LORD[sOf[pl]];
      if (KEN.includes(hL(disp)) || KEN.includes(hFrom(sOf[disp], moon)))
        add("Neecha Bhanga · " + pl, "good", "Debilitated " + pl + "'s fall is cancelled — early struggle transmutes into unusual strength.");
      else add(pl + " debilitated", "hard", pl + " sits in its fall sign — its significations ask for conscious cultivation.");
    }
  }

  const VIP = { 6: "Harsha", 8: "Sarala", 12: "Vimala" };
  for (const dHouse of [6, 8, 12]) {
    if ([6, 8, 12].includes(hL(lordOfHouse(dHouse))))
      add(VIP[dHouse] + " Vipareeta Raja", "good", "Lord of the " + dHouse + "th placed in a dusthana — gains rising out of adversity.");
  }

  for (const pl of SEVEN) {
    const lordsKen = [4, 7, 10].some((h) => lordOfHouse(h) === pl);
    const lordsTri = [5, 9].some((h) => lordOfHouse(h) === pl);
    if (lordsKen && lordsTri) add("Yogakaraka " + pl, "good", pl + " lords both a kendra and a trikona — a single planet able to confer rank.");
  }
  const kenLords = [...new Set(KEN.map(lordOfHouse))];
  const triLords = [...new Set([1, 5, 9].map(lordOfHouse))];
  let raja = null;
  for (const k of kenLords) for (const t of triLords)
    if (!raja && k !== t && sOf[k] === sOf[t]) raja = [k, t];
  if (raja) add("Raja Yoga", "good", "Kendra lord " + raja[0] + " conjunct trikona lord " + raja[1] + " — power and fortune combine.");

  const l2 = lordOfHouse(2), l11 = lordOfHouse(11);
  if (l2 !== l11 && (sOf[l2] === sOf[l11] || (SIGN_LORD[sOf[l2]] === l11 && SIGN_LORD[sOf[l11]] === l2)))
    add("Dhana Yoga", "good", "Lords of wealth (2nd) and gains (11th) join forces.");

  for (const p of SEVEN) for (const q of SEVEN)
    if (p < q && SIGN_LORD[sOf[p]] === q && SIGN_LORD[sOf[q]] === p)
      add("Parivartana · " + p + " ⇄ " + q, "good", p + " and " + q + " exchange signs — their houses lend each other strength.");

  const ben = ["Mercury", "Jupiter", "Venus"];
  if (ben.filter((b) => [6, 7, 8].includes(hFrom(sOf[b], moon))).length >= 2)
    add("Adhi Yoga", "good", "Benefics in the 6th, 7th or 8th from the Moon — leadership, comfort and trustworthy allies.");

  const five = ["Mars", "Mercury", "Jupiter", "Venus", "Saturn"];
  const in2 = five.some((p) => hFrom(sOf[p], moon) === 2);
  const in12 = five.some((p) => hFrom(sOf[p], moon) === 12);
  const withM = five.some((p) => sOf[p] === moon);
  if (in2 && in12) add("Durudhara", "good", "Planets flank the Moon on both sides — a supported, resourceful mind.");
  else if (in2) add("Sunapha", "good", "A planet in the 2nd from the Moon — self-earned status and means.");
  else if (in12) add("Anapha", "good", "A planet in the 12th from the Moon — a refined, self-possessed nature.");
  else if (!withM) add("Kemadruma", "hard", "No planets beside the Moon — emotional self-reliance becomes the life lesson; strong kendras can cancel this.");

  const s2 = five.some((p) => hFrom(sOf[p], sun) === 2);
  const s12 = five.some((p) => hFrom(sOf[p], sun) === 12);
  if (s2 && s12) add("Ubhayachari", "good", "Planets on both sides of the Sun — a balanced, widely liked personality.");
  else if (s2) add("Vesi", "good", "A planet in the 2nd from the Sun — a truthful, steady temperament.");
  else if (s12) add("Vasi", "good", "A planet in the 12th from the Sun — a skilful, charitable disposition.");

  if (ben.some((b) => hL(b) === 10 || hFrom(sOf[b], moon) === 10))
    add("Amala", "good", "A natural benefic in the 10th — a reputation that stays clean.");
  if (ben.every((b) => [1, 2, 4, 5, 7, 9, 10].includes(hL(b))))
    add("Saraswati", "good", "Jupiter, Venus and Mercury all well-placed — learning, eloquence and the arts.");

  const rahu = sOf.Rahu, ketu = (rahu + 6) % 12;
  const offs = SEVEN.map((p) => (sOf[p] - rahu + 12) % 12);
  if (offs.every((o) => o >= 1 && o <= 5) || offs.every((o) => o >= 7 && o <= 11))
    add("Kala Sarpa", "hard", "All seven planets hemmed within the Rahu–Ketu axis — a fated, intense arc with dramatic rises.");
  if (sOf.Jupiter === rahu || sOf.Jupiter === ketu) add("Guru Chandala", "hard", "Jupiter joined with a node — unconventional beliefs; wisdom must be tested before trusted.");
  if (sOf.Mars === rahu || sOf.Mars === ketu) add("Angarak", "hard", "Mars with a node — combustible energy that needs disciplined outlets.");
  if (sun === rahu || sun === ketu || moon === rahu || moon === ketu) add("Grahan", "hard", "A luminary with a node — eclipse-born sensitivity of mind or vitality.");

  return Y;
}


export {
  computeAshtakavarga,
  computeArudhas,
  detectYogas,
  OWN_SIGNS,
  EXALT,
  SEVEN,
};
