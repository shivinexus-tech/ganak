import React, { useState, useMemo, useEffect } from "react";
import { T } from "./components/tokens";
import { fmtDeg, fmtTimeD, fmtTime } from "./components/format";
import PrashnaScreen from "./screens/PrashnaScreen";
import { VRAT_VIDHI, VRAT_VIDHI_LABELS, VRAT_VIDHI_SAFETY } from "./data/vrat-vidhis";
import { CHOG_NAME, OBS_NAME, FEST_NAME, OBS_META, FEST_META } from "./data/festival-meta";
import { searchOffline, searchOnline } from "./data/places";
import PlaceInput from "./components/PlaceInput";
import MatchMaker from "./screens/MatchingScreen";
import DiamondChart from "./components/DiamondChart";

/* ============================================================
   JANMA — Vedic Kundli
   Built-in low-precision ephemeris (Schlyter formulas, ±0.5°),
   Lahiri ayanamsa, whole-sign houses, Vimshottari dasha.
   ============================================================ */

import {
  D2R, rev, sd, cdg, tdg, atan2d, ascendantAt,
  moonGeo, jdeFromD, sunPos, moonLon, planetGeoLon, tropicalLongitudes,
} from "./engine/ephemeris";

import {
  SIGNS, NAKSHATRAS, YOGAS, TITHIS, KARANAS_MOV, karanaName, PLANET_DEVA,
  sunEvents, moonEvents, RAHU_SEGMENT, YAMA_SEGMENT, GULIKA_SEGMENT,
  setAyanMode, ayanAt, sunSidMs, moonSidMs, elongMs, lunYogaMs, planetSidMs,
  jdOf, AYANAMSA, SIGN_LORD, VIM_LORDS,
  solveCross, lunarMonthInfo, samvatInfo, upcomingEvents, choghaSlots,
  amantaMonthIdx, pitruPakshaDay, zoneOffset,
} from "./engine/panchang";

import {
  dayHoras, horaWindowsForPlanet, HORA_GLYPH, HORA_COLOR, HORA_NAME, HORA_NATURE,
  analyzeHora, horaResultText,
} from "./engine/hora";

import { tr, trN, obsLabel } from "./i18n";

import { computeLagnaPanchaka } from "./engine/panchaka";

import {
  ayyappaMandalaFor, EKADASHI_NAMES, PRADOSH_NAMES_BY_DAY, observancesFor,
  FESTIVALS, FAST_KALA_RULES, scanPanchangCalendar, obsKind,
} from "./engine/festivals";

import {
  NAK_HI, muhuratForDate, vaishnavaEkadashi, vratDetail,
  vaishnavaEkadashiDay, MUHURTA_RULES, muhuratShuddhi, muhuratScanRange,
} from "./engine/muhurat";

/* ---------------- static data ---------------- */
const SIGN_SHORT = ["Ar", "Ta", "Ge", "Cn", "Le", "Vi", "Li", "Sc", "Sg", "Cp", "Aq", "Pi"];

const NAK_NOTE = ["Swift, pioneering, healing instincts; restless until in motion.", "Intense, creative, carries burdens with discipline and will.", "Sharp, purifying, cuts through illusion; natural critic and cook.", "Magnetic, fertile, drawn to beauty, comfort and growth.", "Curious seeker, gentle wanderer, always tracing a scent.", "Stormy depth; transformation through upheaval and inquiry.", "Renewal and return; optimistic, philosophical, expansive.", "Nourishing, dutiful, deeply caring; the nurturer's star.", "Penetrating insight, hypnotic charm, guards its inner world.", "Regal, ancestral pride, seeks honor and a throne of its own.", "Pleasure-loving, artistic, generous in love and leisure.", "Steady patron, kind contracts, friendship as dharma.", "Skilled hands, wit, craft; mastery through dexterity.", "Brilliant architect of beauty; dazzling, design-minded.", "Independent as wind; flexible, restless, self-made.", "Goal-locked ambition; triumph after sustained effort.", "Devoted friend, disciplined heart, success in foreign lands.", "Eldest's burden; protective, intense, occult-leaning.", "Root-cutter; radical truth-seeking, destroys to rebuild.", "Invincible declarations; early victories, proud spirit.", "Later victory; enduring, ethical, universally respected.", "The listener; learned, fame through knowledge and word.", "Wealthy rhythm; music, abundance, marches to its own drum.", "Hundred healers; secretive, mystical, vast like the void.", "Fierce ascetic fire; intensity hidden under calm.", "Deep wisdom of the serpent; compassion, slow sure progress.", "The nourishing fish; gentle completion, protector of travelers."];

const SIGN_NOTE = ["fiery initiative, courage, a head-first approach to life", "steadfast patience, sensuality, devotion to comfort and worth", "quicksilver intellect, duality, endless curiosity", "tidal emotion, deep memory, fierce protectiveness of home", "solar dignity, generosity, a need to shine and lead", "discerning precision, service, the healer-analyst's eye", "harmonizing grace, diplomacy, life measured in relationships", "penetrating intensity, secrecy, the power to transform", "dharmic optimism, far horizons, the philosopher-archer", "mountain ambition, discipline, slow unstoppable ascent", "humanitarian vision, detachment, the reformer's mind", "boundless compassion, imagination, dissolving of edges"];

const DASHA_SEQ = [["Ketu", 7], ["Venus", 20], ["Sun", 6], ["Moon", 10], ["Mars", 7], ["Rahu", 18], ["Jupiter", 16], ["Saturn", 19], ["Mercury", 17]];

const DASHA_NOTE = {
  Ketu: "detachment, spiritual turning points, sudden severances that liberate",
  Venus: "love, art, comfort and wealth; relationships take center stage",
  Sun: "authority, recognition, father-figures; the self is forged in light",
  Moon: "emotional tides, home, mother, public connection and care",
  Mars: "drive, courage, property, conflict that builds strength",
  Rahu: "worldly hunger, foreign influence, dizzying rise and obsession",
  Jupiter: "wisdom, children, fortune, teachers; expansion and grace",
  Saturn: "discipline, karma's audit, slow rewards through endurance",
  Mercury: "intellect, commerce, communication; the mind quickens",
};

const PLANET_GLYPH = { Sun: "Su", Moon: "Mo", Mars: "Ma", Mercury: "Me", Jupiter: "Ju", Venus: "Ve", Saturn: "Sa", Rahu: "Ra", Ketu: "Ke" };
const PLANET_COLOR = { Sun: "#C05A0C", Moon: "#4E6E96", Mars: "#BB3A2A", Mercury: "#2C7D4F", Jupiter: "#9A7000", Venus: "#B3537F", Saturn: "#46588F", Rahu: "#6E5C82", Ketu: "#8A5A36" };


/* ---------------- shodasavarga: the 16 divisional charts ---------------- */
const VARGAS = [
  { k: "D1", name: "Rasi", theme: "body, self & life as a whole" },
  { k: "D2", name: "Hora", theme: "wealth & sustenance" },
  { k: "D3", name: "Drekkana", theme: "siblings, courage & effort" },
  { k: "D4", name: "Chaturthamsa", theme: "property, home & fortune" },
  { k: "D5", name: "Panchamsa", theme: "power, authority & fame" },
  { k: "D6", name: "Shashthamsa", theme: "health & disease" },
  { k: "D7", name: "Saptamsa", theme: "children & creative legacy" },
  { k: "D8", name: "Ashtamsa", theme: "longevity & sudden events" },
  { k: "D9", name: "Navamsa", theme: "marriage, dharma & inner strength" },
  { k: "D10", name: "Dasamsa", theme: "career & public standing" },
  { k: "D11", name: "Rudramsa", theme: "strife, destruction & hard-won gains" },
  { k: "D12", name: "Dwadasamsa", theme: "parents & lineage" },
  { k: "D16", name: "Shodasamsa", theme: "vehicles, comforts & happiness" },
  { k: "D20", name: "Vimsamsa", theme: "spiritual practice & devotion" },
  { k: "D24", name: "Siddhamsa", theme: "education & learning" },
  { k: "D27", name: "Bhamsa", theme: "strengths & weaknesses" },
  { k: "D30", name: "Trimsamsa", theme: "adversity & hidden trials" },
  { k: "D40", name: "Khavedamsa", theme: "auspicious & inauspicious habits" },
  { k: "D45", name: "Akshavedamsa", theme: "character & conduct" },
  { k: "D60", name: "Shashtiamsa", theme: "past karma & the soul's record" },
];

/* Reference charts: same D1/D9 positions, seen from a different lagna */
const SPECIAL_CHARTS = [
  { k: "MOON", name: "Chandra Kundli", theme: "the mind's vantage — houses counted from the Moon" },
  { k: "SUN", name: "Surya Kundli", theme: "the soul's vantage — houses counted from the Sun" },
  { k: "KARAK", name: "Karakamsa", theme: "Jaimini swamsa — the navamsa seen from the Atmakaraka" },
];

/* Parashara's division rules. L = sidereal longitude 0–360, returns sign index 0–11. */
function vargaSign(L, k) {
  const sign = Math.floor(L / 30);
  const deg = L - sign * 30;
  const odd = sign % 2 === 0;        // Aries, Gemini… are odd signs
  const mode = sign % 3;             // 0 movable, 1 fixed, 2 dual
  switch (k) {
    case "D1": return sign;
    case "D2": { const first = deg < 15; return (odd ? first : !first) ? 4 : 3; } // Sun's hora (Leo) / Moon's hora (Cancer)
    case "D3": return (sign + Math.floor(deg / 10) * 4) % 12;                      // 1st, 5th, 9th from the sign
    case "D4": return (sign + Math.floor(deg / 7.5) * 3) % 12;                     // 1st, 4th, 7th, 10th
    case "D5": { const seq = odd ? [0, 10, 8, 2, 6] : [6, 2, 8, 10, 0]; return seq[Math.floor(deg / 6)]; } // Mars, Saturn, Jupiter, Mercury, Venus lords
    case "D6": return Math.floor(L / 5) % 12;                                      // continuous from Aries
    case "D7": return (sign + (odd ? 0 : 6) + Math.floor(deg / (30 / 7))) % 12;    // odd from itself, even from 7th
    case "D8": return ([0, 8, 4][mode] + Math.floor(deg / 3.75)) % 12;             // movable→Aries, fixed→Sag, dual→Leo
    case "D9": return Math.floor(L / (10 / 3)) % 12;                               // continuous from Aries
    case "D10": return (sign + (odd ? 0 : 8) + Math.floor(deg / 3)) % 12;          // odd from itself, even from 9th
    case "D11": return (sign + 11 + Math.floor(deg / (30 / 11))) % 12;             // counted from the 12th sign therefrom
    case "D12": return (sign + Math.floor(deg / 2.5)) % 12;                        // from the sign itself
    case "D16": return ([0, 4, 8][mode] + Math.floor(deg / 1.875)) % 12;           // movable→Aries, fixed→Leo, dual→Sag
    case "D20": return ([0, 8, 4][mode] + Math.floor(deg / 1.5)) % 12;             // movable→Aries, fixed→Sag, dual→Leo
    case "D24": return ((odd ? 4 : 3) + Math.floor(deg / 1.25)) % 12;              // odd→Leo, even→Cancer
    case "D27": return Math.floor(L / (30 / 27)) % 12;                             // fiery→Aries, earthy→Cancer… (continuous)
    case "D30":                                                                    // unequal trimsamsa
      if (odd) return deg < 5 ? 0 : deg < 10 ? 10 : deg < 18 ? 8 : deg < 25 ? 2 : 6;
      return deg < 5 ? 1 : deg < 12 ? 5 : deg < 20 ? 11 : deg < 25 ? 9 : 7;
    case "D40": return ((odd ? 0 : 6) + Math.floor(deg / 0.75)) % 12;              // odd→Aries, even→Libra
    case "D45": return ([0, 4, 8][mode] + Math.floor(deg / (2 / 3))) % 12;         // movable→Aries, fixed→Leo, dual→Sag
    case "D60": return (sign + Math.floor(deg * 2)) % 12;                          // from the sign itself
    default: return sign;
  }
}


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
/* ---------------- birth-time rectification: structural sweep + dasha anchors ----------------
   Reuses ascendantAt / vargaSign / subLordChain for the four time-sensitive markers, and
   rebuilds the Vimshottari Maha timeline per candidate time (the balance shifts ~2 days per
   birth-minute, so event-dasha boundaries move). An instrument, not an auto-verdict. */
function rectAtMin(y, m, day, tz, lat, lon, ayanamsa, totalMin) {
  setAyanMode(ayanamsa);
  const utcMs = Date.UTC(y, m - 1, day) + totalMin * 60000 - tz * 3600000;
  const jd = utcMs / 86400000 + 2440587.5;
  const ascSid = ascendantAt(jd, lat, lon, ayanAt(jd));
  const sign = Math.floor(ascSid / 30), NK = 360 / 27;
  return {
    totalMin, utcMs, ascSid, sign, deg: ascSid - sign * 30,
    nak: Math.floor(ascSid / NK), pada: Math.floor((ascSid % NK) / (NK / 4)) + 1,
    d9: vargaSign(ascSid, "D9"), d60: vargaSign(ascSid, "D60"),
    subLord: subLordChain(ascSid).subLord,
  };
}
function rectSweep(y, m, day, tz, lat, lon, ayanamsa, centerMin, halfWinMin, stepMin) {
  const steps = [], n = Math.round((2 * halfWinMin) / stepMin);
  for (let i = 0; i <= n; i++) { const off = -halfWinMin + i * stepMin; steps.push({ off, ...rectAtMin(y, m, day, tz, lat, lon, ayanamsa, centerMin + off) }); }
  for (let i = 1; i < steps.length; i++) {
    const a = steps[i], b = steps[i - 1];
    a.chSign = a.sign !== b.sign; a.chD9 = a.d9 !== b.d9; a.chD60 = a.d60 !== b.d60;
    a.chSub = a.subLord !== b.subLord; a.chPada = a.pada !== b.pada || a.nak !== b.nak;
  }
  return steps;
}
function mahaTimelineAt(y, m, day, tz, totalMin, ayanamsa) {
  setAyanMode(ayanamsa);
  const utcMs = Date.UTC(y, m - 1, day) + totalMin * 60000 - tz * 3600000;
  const jd = utcMs / 86400000 + 2440587.5, dd = jd - 2451543.5;
  const moonSid = rev(tropicalLongitudes(dd).Moon - ayanAt(jd));
  const NK = 360 / 27, YEAR = 365.25 * 86400000;
  const nakIdx = Math.floor(moonSid / NK), frac = (moonSid % NK) / NK, startSeq = nakIdx % 9;
  const tl = []; let cursor = utcMs;
  for (let i = 0; i < 9; i++) {
    const [lord, yrs] = DASHA_SEQ[(startSeq + i) % 9];
    const span = (i === 0 ? (1 - frac) * yrs : yrs) * YEAR;
    tl.push({ lord, yrs, start: cursor, end: cursor + span }); cursor += span;
  }
  return { tl, birthMs: utcMs, moonSid };
}
function runDashaAt(tl, eventMs) {
  const YEAR = 365.25 * 86400000;
  const maha = tl.find((p) => eventMs >= p.start && eventMs < p.end);
  if (!maha) return null;
  const fullStart = maha.end - maha.yrs * YEAR;
  const antar = vimSub(maha.lord, fullStart, maha.yrs * YEAR).find((a) => eventMs >= a.start && eventMs < a.end);
  return { maha: maha.lord, antar: antar ? antar.lord : null };
}

function computeTodayPanchang(place, ayanamsa = "lahiri", atMs) {
  setAyanMode(ayanamsa);
  const now = atMs != null ? atMs : Date.now();
  const probe = new Date(now);
  const tz = zoneOffset(place.zone, probe.getUTCFullYear(), probe.getUTCMonth() + 1, probe.getUTCDate()) ?? 5.5;
  const local = new Date(now + tz * 3600000);
  const y = local.getUTCFullYear(), m = local.getUTCMonth() + 1, day = local.getUTCDate();
  const dow = local.getUTCDay();

  const ev = sunEvents(y, m, day, tz, place.lat, place.lon);
  const moonEv = moonEvents(y, m, day, tz, place.lat, place.lon);
  const anchor = ev.rise !== null ? ev.rise : Date.UTC(y, m - 1, day, 6) - tz * 3600000; // panchang day begins at sunrise
  const dayEnd = anchor + 24.2 * 3600000;

  const sun = sunSidMs(anchor), moon = moonSidMs(anchor);
  const elong = rev(moon - sun);

  // tithi (+ next if it changes within the panchang day)
  const tithiName = (n) => (n % 15 === 14 ? (n < 15 ? "Purnima" : "Amavasya") : TITHIS[n % 15]);
  const tn = Math.floor(elong / 12);
  const tEnd = solveCross(elongMs, anchor, ((tn + 1) * 12) % 360, 3);
  const tithis = [{ name: tithiName(tn), end: tEnd }];
  if (tEnd < dayEnd) tithis.push({ name: tithiName((tn + 1) % 30), end: solveCross(elongMs, tEnd + 60000, ((tn + 2) * 12) % 360, 3) });

  // nakshatra
  const NW = 360 / 27;
  const nIdx = Math.floor(moon / NW);
  const nEnd = solveCross(moonSidMs, anchor, ((nIdx + 1) * NW) % 360, 3);
  const naks = [{ name: NAKSHATRAS[nIdx], end: nEnd }];
  if (nEnd < dayEnd) naks.push({ name: NAKSHATRAS[(nIdx + 1) % 27], end: solveCross(moonSidMs, nEnd + 60000, ((nIdx + 2) * NW) % 360, 3) });

  // yoga
  const yIdx = Math.floor(rev(sun + moon) / NW);
  const yEnd = solveCross(lunYogaMs, anchor, ((yIdx + 1) * NW) % 360, 3);
  const yogasP = [{ name: YOGAS[yIdx], end: yEnd }];
  if (yEnd < dayEnd) yogasP.push({ name: YOGAS[(yIdx + 1) % 27], end: solveCross(lunYogaMs, yEnd + 60000, ((yIdx + 2) * NW) % 360, 3) });

  // karanas (two per day)
  const kn = Math.floor(elong / 6);
  const kEnd1 = solveCross(elongMs, anchor, ((kn + 1) * 6) % 360, 2);
  const kEnd2 = solveCross(elongMs, kEnd1 + 60000, ((kn + 2) * 6) % 360, 2);
  const karanaAt = (k) => { const kk = ((k % 60) + 60) % 60; return kk === 0 ? "Kimstughna" : kk >= 57 ? ["Shakuni", "Chatushpada", "Naga"][kk - 57] : KARANAS_MOV[(kk - 1) % 7]; };
  const karanas = [{ name: karanaAt(kn), end: kEnd1 }, { name: karanaAt(kn + 1), end: kEnd2 }];

  // moonsign / sunsign
  const msIdx = Math.floor(moon / 30);
  const msEnd = solveCross(moonSidMs, anchor, ((msIdx + 1) * 30) % 360, 4);
  const paksha = tn < 15 ? "Shukla" : "Krishna";

  // months, samvats, pravishte
  const months = lunarMonthInfo(anchor, paksha === "Krishna");
  const samvat = samvatInfo(anchor, y);
  const lastSank = solveCross(sunSidMs, anchor - 33 * 86400000, Math.floor(sun / 30) * 30, 35);
  const dloc = (ms) => { const t = new Date(ms + tz * 3600000); return Date.UTC(t.getUTCFullYear(), t.getUTCMonth(), t.getUTCDate()); };
  const pravishte = Math.floor((dloc(anchor) - dloc(lastSank)) / 86400000) + 1;

  let rahu = null, abhijit = null, gulika = null, yama = null;
  if (ev.rise !== null) {
    const dayLen = ev.set - ev.rise;
    const eighth = (seg) => ({ start: ev.rise + ((seg - 1) / 8) * dayLen, end: ev.rise + (seg / 8) * dayLen });
    rahu = eighth(RAHU_SEGMENT[dow]);
    gulika = eighth(GULIKA_SEGMENT[dow]);
    yama = eighth(YAMA_SEGMENT[dow]);
    abhijit = dow === 3 ? null : { start: ev.transit - dayLen / 30, end: ev.transit + dayLen / 30 };
  }

  return {
    tz, anchor,
    dateLabel: local.toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric", timeZone: "UTC" }),
    vara: ["Ravivara", "Somavara", "Mangalavara", "Budhavara", "Guruvara", "Shukravara", "Shanivara"][dow],
    tithis, naks, yogasP, karanas, paksha: paksha + " Paksha",
    elong, tithiNum: tn, krishna: tn >= 15,
    months, samvat, pravishte,
    moonSign: SIGNS[msIdx].split(" ")[0], moonSignEnd: msEnd < dayEnd ? msEnd : null,
    sunSign: SIGNS[Math.floor(sun / 30)].split(" ")[0],
    rise: ev.rise, set: ev.set, moonrise: moonEv.rise, moonset: moonEv.set, rahu, abhijit, gulika, yama,
    dow,
    pitruPaksha: (ev.rise !== null && ev.set !== null) ? pitruPakshaDay(ev.rise, ev.set) : null,
    ayyappaMandala: ayyappaMandalaFor(anchor, tz),
    choghaDay: ev.rise !== null ? choghaSlots(dow, ev.rise, ev.set, true) : null,
    choghaNight: ev.rise !== null ? choghaSlots(dow, ev.set, ev.rise + 86400000, false) : null,
    events: upcomingEvents(now),
  };
}

/* ===== Udaya Lagna schedule + Panchaka Rahita Muhurta (Drik-parity) =====
   Panchaka = (tithi[1-30] + vaara[Sun=1..Sat=7] + nakshatra[1-27] + lagna[Aries=1..Pisces=12]) mod 9.
   rem 1 Mrityu · 2 Agni · 4 Raja · 6 Chora · 8 Roga (dosha) · 0/3/5/7 Shubha (Rahita). */
const PANCHAKA_NAME = { shubha: { en: "Panchaka Rahita", hi: "पञ्चक रहित" }, mrityu: { en: "Mrityu Panchaka", hi: "मृत्यु पञ्चक" }, agni: { en: "Agni Panchaka", hi: "अग्नि पञ्चक" }, raja: { en: "Raja Panchaka", hi: "राज पञ्चक" }, chora: { en: "Chora Panchaka", hi: "चोर पञ्चक" }, roga: { en: "Roga Panchaka", hi: "रोग पञ्चक" } };
const PANCHAKA_SHORT = { shubha: { en: "Shubha", hi: "शुभ" }, mrityu: { en: "Mrityu", hi: "मृत्यु" }, agni: { en: "Agni", hi: "अग्नि" }, raja: { en: "Raja", hi: "राज" }, chora: { en: "Chora", hi: "चोर" }, roga: { en: "Roga", hi: "रोग" } };
const PANCHAKA_GLOSS = { shubha: { en: "auspicious — free of blemish", hi: "शुभ — दोषरहित" }, mrityu: { en: "avoid — risk to life", hi: "टालें — प्राण जोखिम" }, agni: { en: "avoid — fire risk", hi: "टालें — अग्नि भय" }, raja: { en: "caution — authority/government", hi: "सावधानी — सत्ता" }, chora: { en: "avoid — theft risk", hi: "टालें — चोरी भय" }, roga: { en: "avoid — illness risk", hi: "टालें — रोग भय" } };
/* ---------------- chart computation ---------------- */
/* ascendant (sidereal) at an arbitrary instant — used for Gulika/Mandi and special lagnas */
/* Placidus house cusps (tropical, equinox of date) via iterative semi-arc trisection.
   Validated: cusps satisfy the geometric definition exactly (MD/semi-arc = 1/3, 2/3).
   Returns ok:false in polar regions where Placidus is undefined (circumpolar). */
function placidusCusps(RAMC, eps, phi) {
  const mc = atan2d(sd(RAMC), cdg(RAMC) * cdg(eps));
  const asc = atan2d(cdg(RAMC), -(sd(RAMC) * cdg(eps) + tdg(phi) * sd(eps)));
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


const INDU_KALA = { Sun: 30, Moon: 16, Mars: 6, Mercury: 8, Jupiter: 10, Venus: 12, Saturn: 1 };
const nakLordOf = (L) => VIM_LORDS[Math.floor(L / (360 / 27)) % 9];

/* KP sub-lord chain (249 scheme): nakshatra subdivided into 9 Vimshottari-proportioned
   subs in dasha order from the star lord; recursed once for the sub-sub (sookshma) lord. */
const VIM_YEARS = Object.fromEntries(DASHA_SEQ);
function subLordChain(lon) {
  lon = rev(lon);
  const NK = 360 / 27;
  const nakIdx = Math.floor(lon / NK);
  const starLord = VIM_LORDS[nakIdx % 9];
  const intoNak = lon - nakIdx * NK;
  const si = VIM_LORDS.indexOf(starLord);
  let acc = 0, subLord = starLord, subStart = 0, subSpan = NK;
  for (let k = 0; k < 9; k++) {
    const pl = VIM_LORDS[(si + k) % 9];
    const span = (VIM_YEARS[pl] / 120) * NK;
    if (intoNak < acc + span - 1e-9 || k === 8) { subLord = pl; subStart = acc; subSpan = span; break; }
    acc += span;
  }
  const intoSub = intoNak - subStart;
  const sj = VIM_LORDS.indexOf(subLord);
  let acc2 = 0, subSub = subLord;
  for (let k = 0; k < 9; k++) {
    const pl = VIM_LORDS[(sj + k) % 9];
    const span = (VIM_YEARS[pl] / 120) * subSpan;
    if (intoSub < acc2 + span - 1e-9 || k === 8) { subSub = pl; break; }
    acc2 += span;
  }
  return { starLord, subLord, subSub };
}

/* KP significators (4-step hierarchy) + Ruling Planets.
   A house's significators, strongest first: (A) planets in the star of its occupants,
   (B) its occupants, (C) planets in the star of its owner, (D) its owner. */
const KP_PLANETS = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"];
function computeKPSignificators(rows, kpCusps) {
  const star = {};
  rows.forEach((p) => (star[p.name] = p.kp.starLord));
  const occupants = {}; for (let h = 1; h <= 12; h++) occupants[h] = [];
  rows.forEach((p) => occupants[p.kpHouse].push(p.name));
  const owner = {};
  for (let h = 1; h <= 12; h++) owner[h] = kpCusps[h] == null ? null : SIGN_LORD[Math.floor(kpCusps[h] / 30)];
  const sig = {};
  const housesByPlanet = {}; KP_PLANETS.forEach((p) => (housesByPlanet[p] = new Set()));
  for (let h = 1; h <= 12; h++) {
    const occ = occupants[h], own = owner[h];
    const A = rows.filter((p) => occ.includes(star[p.name])).map((p) => p.name);
    const B = occ.slice();
    const C = own ? rows.filter((p) => star[p.name] === own).map((p) => p.name) : [];
    const D = own ? [own] : [];
    sig[h] = { A, B, C, D };
    [...A, ...B, ...C, ...D].forEach((pl) => housesByPlanet[pl] && housesByPlanet[pl].add(h));
  }
  const housesOf = {}; KP_PLANETS.forEach((p) => (housesOf[p] = [...housesByPlanet[p]].sort((a, b) => a - b)));
  // consolidated, strength-ordered, de-duplicated significators per house
  const ordered = {};
  for (let h = 1; h <= 12; h++) {
    const seen = new Set(); ordered[h] = [];
    [...sig[h].A, ...sig[h].B, ...sig[h].C, ...sig[h].D].forEach((pl) => { if (!seen.has(pl)) { seen.add(pl); ordered[h].push(pl); } });
  }
  return { sig, occupants, owner, housesOf, ordered };
}
const WEEKDAY_LORDS = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"];
function computeRulingPlanets(ascSid, moonSid, dayLord) {
  return {
    ascSignLord: SIGN_LORD[Math.floor(ascSid / 30)],
    ascStarLord: nakLordOf(ascSid),
    ascSubLord: subLordChain(ascSid).subLord,
    moonSignLord: SIGN_LORD[Math.floor(moonSid / 30)],
    moonStarLord: nakLordOf(moonSid),
    moonSubLord: subLordChain(moonSid).subLord,
    dayLord,
  };
}

/* special lagnas, sensitive points & upagrahas */
function computeSpecialPoints(ctx) {
  const { asc, sun, moon, rahu, ascSign, birthMs, tz, lat, lon, ayan, rise, set, JD } = ctx;
  const moonSign = Math.floor(moon / 30);
  const isDay = rise != null && birthMs >= rise && birthMs < set;
  const ghatis = rise != null ? (birthMs - rise) / (24 * 60000) : 0; // 1 ghati = 24 min
  const sunriseSunLon = rise != null ? sunSidMs(rise) : sun;

  const bhava = rev(sunriseSunLon + (ghatis / 5) * 30);
  const hora = rev(sunriseSunLon + (ghatis / 2.5) * 30);
  const ghati = rev(sunriseSunLon + ghatis * 30);
  const fracNak = (moon % (360 / 27)) / (360 / 27);
  const sree = rev(asc + fracNak * 360);

  const diff = rev(rahu - moon);
  const bhrigu = diff > 180 ? rev(moon - (360 - diff) / 2) : rev(moon + diff / 2);
  const yogiPt = rev(sun + moon + 93.3333);
  const avayogiPt = rev(yogiPt + 186.6667);
  const fortuna = rev(asc + moon - sun);

  const l9L = SIGN_LORD[(ascSign + 8) % 12], l9M = SIGN_LORD[(moonSign + 8) % 12];
  let isum = (INDU_KALA[l9L] + INDU_KALA[l9M]) % 12; if (isum === 0) isum = 12;
  const induSign = (moonSign + isum - 1) % 12;

  const dhuma = rev(sun + 133.3333), vyati = rev(360 - dhuma), pari = rev(vyati + 180),
        indra = rev(360 - pari), upaketu = rev(indra + 16.6667);

  // Gulika: ascendant at the start of Saturn's eighth of the day (or night)
  let gulika = null;
  if (rise != null) {
    const dayLen = set - rise, nightLen = 24 * 3600000 - dayLen;
    const dow = new Date(birthMs + tz * 3600000).getUTCDay(); // 0=Sun
    let gMs;
    if (isDay) {
      const i = ((6 - dow) % 7 + 7) % 7;       // Saturn's part index 0..6 within the day
      gMs = rise + (i / 8) * dayLen;
    } else {
      const nightStartLord = (dow + 4) % 7;     // night begins with lord of 5th weekday
      const i = ((6 - nightStartLord) % 7 + 7) % 7;
      const nightStart = birthMs >= set ? set : set - 24 * 3600000;
      gMs = nightStart + (i / 8) * nightLen;
    }
    gulika = ascendantAt(gMs / 86400000 + 2440587.5, lat, lon, ayan);
  }

  return {
    lagnas: [
      { k: "Bhava Lagna", v: bhava, note: "body & vitality through the day" },
      { k: "Hora Lagna", v: hora, note: "wealth & resources" },
      { k: "Ghati Lagna", v: ghati, note: "power, status & authority" },
      { k: "Sree Lagna", v: sree, note: "prosperity & Lakshmi's grace" },
    ],
    points: [
      { k: "Bhrigu Bindu", v: bhrigu, note: "the destiny point — karmic focus" },
      { k: "Yogi Point", v: yogiPt, pl: nakLordOf(yogiPt), note: "the benefic Yogi & its planet" },
      { k: "Avayogi Point", v: avayogiPt, pl: nakLordOf(avayogiPt), note: "the testing Avayogi & its planet" },
      { k: "Fortuna", v: fortuna, note: "Pars Fortunae — fortune & flow" },
    ],
    induSign,
    upagrahas: [
      ...(gulika != null ? [{ k: "Gulika / Mandi", v: gulika, note: "Saturn's shadow — sensitive, malefic" }] : []),
      { k: "Dhuma", v: dhuma, note: "smoke — obstacles" },
      { k: "Vyatipata", v: vyati, note: "calamity point" },
      { k: "Parivesha", v: pari, note: "halo — intensity" },
      { k: "Indrachapa", v: indra, note: "rainbow — fortune" },
      { k: "Upaketu", v: upaketu, note: "comet — sudden change" },
    ],
  };
}

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

// Generalized Vimshottari subdivision: any period (its lord, start ms, duration
// ms) -> its 9 sub-periods, each span = subLordYears/120 * duration. The same
// proportional recursion drives antar -> pratyantar -> sookshma -> prana.
function vimSub(startLord, startMs, durMs) {
  const seqStart = DASHA_SEQ.findIndex(([l]) => l === startLord);
  const out = [];
  let c = startMs;
  for (let i = 0; i < 9; i++) {
    const [lord, yrs] = DASHA_SEQ[(seqStart + i) % 9];
    const span = (yrs / 120) * durMs;
    out.push({ lord, start: c, end: c + span });
    c += span;
  }
  return out;
}

/* ---------------- Bhrigu Nandi Nadi (BNN) — Tier A: pure calculation ----------------
   Lagna-less (read from any reference planet, default Jupiter male / Venus female),
   directional grouping (sign%4, ordered by within-sign degree — lower degree initiates),
   the 2/12/7/3-11/5-9 combination axes with 4/6/8/10 as "hidden", plus parivartana,
   Rahu-Ketu split, and retro-shadow. All logic validated standalone (incl. directional
   ordering against a published BNN example). Interpretation stays a labeled surfacer,
   never an oracle. */
const BNN_PLANETS = ["Sun","Moon","Mars","Mercury","Jupiter","Venus","Saturn","Rahu","Ketu"];
const BNN_DIR = ["East","South","West","North"];
const BNN_KARAKA = {
  Sun:"soul, father, authority", Moon:"mind, mother, emotions", Mars:"energy, courage, siblings, land",
  Mercury:"intellect, education, business, speech", Jupiter:"jeeva / self, wisdom, children, fortune",
  Venus:"spouse, comforts, vehicles, arts", Saturn:"karma, profession, discipline, longevity",
  Rahu:"foreign, unconventional, obsession", Ketu:"spirituality, separation, moksha",
};
const BNN_CORE = [["Jupiter","Sun"],["Saturn","Moon"],["Venus","Rahu"],["Mars","Ketu"],["Mercury","Saturn"],["Mercury","Moon"],["Venus","Moon"]];
const BNN_COMBO_HOUSES = { 1:"conjunct", 2:"2nd · future", 12:"12th · past", 7:"7th · opposition", 3:"3rd", 11:"11th", 5:"5th · trine", 9:"9th · trine" };
const _bnnLon = (p) => p.sign * 30 + p.deg;
const _bnnHouse = (refSign, sign) => ((sign - refSign + 12) % 12) + 1;
function bnnDirectional(rows) {
  const dirs = [[], [], [], []];
  for (const name of BNN_PLANETS) { const r = rows.find((x) => x.name === name); if (!r) continue;
    dirs[r.sign % 4].push({ name, sign: r.sign, deg: r.deg, retro: !!r.retro }); }
  dirs.forEach((d) => d.sort((a, b) => a.deg - b.deg));
  return BNN_DIR.map((label, i) => ({ direction: label, planets: dirs[i] }));
}
function bnnRelations(rows, refName) {
  const ref = rows.find((p) => p.name === refName); if (!ref) return null;
  const buckets = { conjunct: [], h2: [], h12: [], h7: [], h3: [], h11: [], h5: [], h9: [], hidden: [] };
  const map = { 1:"conjunct", 2:"h2", 12:"h12", 7:"h7", 3:"h3", 11:"h11", 5:"h5", 9:"h9" };
  for (const name of BNN_PLANETS) { if (name === refName) continue; const r = rows.find((x) => x.name === name); if (!r) continue;
    const h = _bnnHouse(ref.sign, r.sign); if (map[h]) buckets[map[h]].push(name); else buckets.hidden.push(name); }
  return { ref: refName, refSign: ref.sign, buckets };
}
function bnnComboBetween(rows, a, b) {
  const A = rows.find((x) => x.name === a), B = rows.find((x) => x.name === b); if (!A || !B) return null;
  return BNN_COMBO_HOUSES[_bnnHouse(A.sign, B.sign)] || null;
}
function bnnCoreCombos(rows) {
  return BNN_CORE.map(([a, b]) => { const rel = bnnComboBetween(rows, a, b);
    return { pair: [a, b], active: !!rel, relation: rel || "hidden — not in combination", meaning: bnnMeaning(a, b) }; });
}
function bnnParivartana(rows) {
  const out = [];
  for (let i = 0; i < BNN_PLANETS.length; i++) for (let j = i + 1; j < BNN_PLANETS.length; j++) {
    const a = rows.find((x) => x.name === BNN_PLANETS[i]), b = rows.find((x) => x.name === BNN_PLANETS[j]); if (!a || !b) continue;
    if (SIGN_LORD[a.sign] === b.name && SIGN_LORD[b.sign] === a.name) out.push([a.name, b.name]);
  }
  return out;
}
function bnnRahuKetuSplit(rows) {
  const rahu = rows.find((x) => x.name === "Rahu"); if (!rahu) return null;
  const rl = _bnnLon(rahu), sideA = [], sideB = [];
  for (const name of BNN_PLANETS) { if (name === "Rahu" || name === "Ketu") continue; const r = rows.find((x) => x.name === name); if (!r) continue;
    (((_bnnLon(r) - rl + 360) % 360) < 180 ? sideA : sideB).push(name); }
  return { rahuSide: sideA, ketuSide: sideB };
}
function bnnRetroShadow(rows) {
  return rows.filter((r) => BNN_PLANETS.includes(r.name) && r.retro && r.name !== "Rahu" && r.name !== "Ketu").map((r) => ({ name: r.name, sign: r.sign, shadowSign: (r.sign + 11) % 12 }));
}
/* ---- BNN Tier B: sourced combination meanings (themes, not predictions) ----
   Karakatwa blends drawn from BNN tradition, kept at the level of THEMES and
   framed as "the tradition reads this as", never as confident life-events. Keys
   are alphabetically-sorted planet pairs. */
const BNN_MEANING = {
  "Jupiter|Ketu": "wisdom turned inward — detachment, moksha, spiritual depth over worldly fortune",
  "Jupiter|Mars": "principled drive — righteous action, conviction, energy guided by ethics",
  "Jupiter|Mercury": "knowledge and intellect — teaching, counsel, articulate wisdom",
  "Jupiter|Moon": "expansive mind — emotional wisdom and contentment (Gajakesari theme)",
  "Jupiter|Rahu": "unorthodox belief — foreign or unconventional wisdom, hunger for meaning",
  "Jupiter|Saturn": "free-will meets fate — patient growth, ethics tempered by discipline and time",
  "Jupiter|Sun": "wisdom and soul — dharma, principled authority, guiding purpose",
  "Jupiter|Venus": "wisdom and pleasure — refined values, the teacher-and-enjoyment tension",
  "Ketu|Mars": "sharp, separative force — focused energy, the spiritual warrior",
  "Ketu|Mercury": "intuitive, non-linear intellect — detached or cryptic communication",
  "Ketu|Moon": "detached mind — emotional inwardness, spiritual sensitivity",
  "Ketu|Rahu": "the karmic axis — past and future pulling apart, separation and longing",
  "Ketu|Saturn": "karmic detachment — discipline turned ascetic, renunciation",
  "Ketu|Sun": "detached authority — the inward or distant father, soul seeking release",
  "Ketu|Venus": "detached love — spiritual aesthetics, distance in relationships",
  "Mars|Mercury": "sharp intellect — technical or argumentative skill, a quick pointed mind",
  "Mars|Moon": "passionate mind — emotional drive, courage, restlessness",
  "Mars|Rahu": "amplified drive — unconventional or technical force, foreign ventures",
  "Mars|Saturn": "disciplined or blocked energy — hard effort, endurance, persistence",
  "Mars|Sun": "willful energy — leadership, assertion, the drive of authority",
  "Mars|Venus": "passion and relationship — drive in love, creative and physical energy",
  "Mercury|Moon": "the thinking mind — communication, adaptability, learning and exchange",
  "Mercury|Rahu": "clever, unconventional intellect — foreign trade, technology, ingenuity",
  "Mercury|Saturn": "structured mind — methodical work, slow mastery, disciplined skill",
  "Mercury|Sun": "intellect and authority — education, articulate leadership (Budha-Aditya theme)",
  "Mercury|Venus": "refined intellect — arts and commerce, pleasant persuasive speech",
  "Moon|Rahu": "unsettled mind — vivid imagination, foreign emotions, restlessness",
  "Moon|Saturn": "weighted mind — emotional discipline, maturity earned through difficulty",
  "Moon|Sun": "mind and soul — the inner and outer self, the parental pair",
  "Moon|Venus": "feeling and beauty — emotional warmth, comfort, relational sweetness",
  "Rahu|Saturn": "unconventional karma — foreign or systemic work, structural ambition and struggle",
  "Rahu|Sun": "amplified authority — ego and ambition, foreign or unconventional standing",
  "Rahu|Venus": "unconventional desire — foreign or cross-cultural relationships, glamour, material pull",
  "Saturn|Sun": "authority and karma — duty, the demanding father or state, discipline of self",
  "Saturn|Venus": "duty in love — patience or delay in relationships, values shaped by responsibility",
  "Sun|Venus": "authority and refinement — creative or relational expression of the self",
};
function bnnMeaning(a, b) { return BNN_MEANING[[a, b].sort().join("|")] || "the blended significations of the two karakas"; }

// Tier B/C reading data: the self-karaka's active combinations, themed (ref-dependent).
function bnnReading(rows, ref) {
  const rel = bnnRelations(rows, ref); if (!rel) return null;
  const order = [["conjunct", "conjunct"], ["h5", "5th · trine"], ["h9", "9th · trine"], ["h2", "2nd · ahead"], ["h12", "12th · behind"], ["h7", "7th · opposition"], ["h3", "3rd"], ["h11", "11th"]];
  const active = [];
  for (const [key, label] of order) for (const name of rel.buckets[key])
    active.push({ planet: name, relation: label, karaka: BNN_KARAKA[name], theme: bnnMeaning(ref, name) });
  const obstructed = rel.buckets.hidden.map((name) => ({ planet: name, karaka: BNN_KARAKA[name] }));
  return { self: ref, selfKaraka: BNN_KARAKA[ref], active, obstructed };
}
// BNN timing: real Jupiter transit (R.G. Rao's gochar method). As transit-Jupiter
// passes each sign, it activates natal planets it conjuncts (or trines / opposes);
// that combination's significations fructify during the period. Uses the same
// ephemeris + ingress solver as the gochar timeline — not a symbolic shortcut.
function bnnTiming(rows, fromMs, spanDays) {
  const jup = rows.find((p) => p.name === "Jupiter"); if (!jup) return null;
  const { seq } = planetGochar("Jupiter", fromMs, spanDays);
  const natal = {};
  for (const name of BNN_PLANETS) { const r = rows.find((x) => x.name === name); if (r) natal[name] = r.sign; }
  return seq.map((s) => {
    const activated = [];
    for (const name of BNN_PLANETS) {
      if (name === "Jupiter" || natal[name] === undefined) continue;
      const h = ((natal[name] - s.sign + 12) % 12) + 1;
      let rel = null;
      if (h === 1) rel = "conjunct"; else if (h === 5 || h === 9) rel = "trine"; else if (h === 7) rel = "opposition";
      if (rel) activated.push({ planet: name, relation: rel, theme: bnnMeaning("Jupiter", name) });
    }
    return { sign: s.sign, enter: s.enter, exit: s.exit, activated };
  });
}
function computeBNN(rows) {
  return { directional: bnnDirectional(rows), coreCombos: bnnCoreCombos(rows),
    parivartana: bnnParivartana(rows), rahuKetu: bnnRahuKetuSplit(rows), retroShadow: bnnRetroShadow(rows) };
}

/* ---------------- Bhrigu Chakra Paddhati (BCP) + Bhrigu Saral Paddhati (BSP) ----------------
   BCP: one house per year from the Ascendant in repeating 12-year cycles, with a Cycle Lord
   (Chakra Swami) per cycle. Base validated against 7 published Saptarishis worked examples.
   BSP: a documented subset of the "planet implements the Nth house from itself at age Y" rules
   (Saptarishis / Abhishekha lineage) — calculation surfaced with significations, not verdicts;
   longevity/death rules deliberately omitted. Plus Jupiter's symbolic 1-sign/year progression. */
const BCP_CYCLE_LORDS = ["Moon","Mercury","Venus","Sun","Mars","Jupiter","Saturn","Rahu","Ketu"];
const BCP_HOUSE_THEME = {
  1:"self, body, vitality, new beginnings", 2:"wealth, family, speech, food", 3:"courage, siblings, effort, communication",
  4:"home, mother, comfort, property, schooling", 5:"children, intellect, romance, creativity", 6:"obstacles, debt, disease, service, rivals",
  7:"marriage, partnership, business, others", 8:"upheaval, transformation, inheritance, the hidden", 9:"fortune, dharma, father, guru, travel",
  10:"career, status, karma, authority", 11:"gains, income, networks, fulfilment of desires", 12:"loss, expense, foreign lands, retreat, spirituality",
};
const BSP_RULES = [
  { planet:"Saturn", from:4, age:null, note:"Saturn's karmic house — a lifelong area of lessons and ups-and-downs" },
  { planet:"Mars",   from:10, age:27, note:"Mars implements the 10th house from itself" },
  { planet:"Rahu",   from:6,  age:38, note:"Rahu implements the 6th house from itself" },
  { planet:"Ketu",   from:12, age:24, note:"Ketu implements the 12th house from itself" },
  { planet:"Jupiter",from:5,  age:32, note:"Jupiter implements its 5th-aspect house (an 'unlocking')" },
  { planet:"Jupiter",from:9,  age:40, note:"Jupiter implements its 9th-aspect house" },
  { planet:"Saturn", from:3,  age:20, note:"Saturn implements its 3rd-aspect house" },
];
const _bcpHouse = (refSign, sign) => ((sign - refSign + 12) % 12) + 1;
function bcpForAge(ascSign, rows, age) {
  const houseNum = ((age - 1) % 12) + 1;
  const cycleLord = BCP_CYCLE_LORDS[Math.min(Math.floor((age - 1) / 12), 8)];
  const sign = (ascSign + houseNum - 1) % 12;
  const occupants = rows.filter((p) => BNN_PLANETS.includes(p.name) && p.sign === sign).map((p) => p.name);
  const lord = SIGN_LORD[sign];
  const lordRow = rows.find((p) => p.name === lord);
  const lordHouse = lordRow ? _bcpHouse(ascSign, lordRow.sign) : null;
  return { age, houseNum, cycleLord, sign, occupants, lord, lordHouse, theme: BCP_HOUSE_THEME[houseNum] };
}
function bcpTimeline(ascSign, rows, fromAge, toAge) {
  const out = [];
  for (let a = Math.max(1, fromAge); a <= toAge; a++) out.push(bcpForAge(ascSign, rows, a));
  return out;
}
function bspRules(ascSign, rows) {
  return BSP_RULES.map((r) => {
    const pr = rows.find((p) => p.name === r.planet); if (!pr) return null;
    const targetSign = (pr.sign + r.from - 1) % 12;
    const houseFromLagna = _bcpHouse(ascSign, targetSign);
    const occupants = rows.filter((p) => BNN_PLANETS.includes(p.name) && p.sign === targetSign).map((p) => p.name);
    return { ...r, planetSign: pr.sign, targetSign, houseFromLagna, occupants, theme: BCP_HOUSE_THEME[houseFromLagna] };
  }).filter(Boolean);
}
function jupiterProgression(rows, fromAge, toAge) {
  const jup = rows.find((p) => p.name === "Jupiter"); if (!jup) return null;
  const natalSign = jup.sign, out = [];
  for (let a = Math.max(0, fromAge); a <= toAge; a++) {
    const progSign = (natalSign + a) % 12, activated = [];
    for (const name of BNN_PLANETS) {
      if (name === "Jupiter") continue;
      const r = rows.find((x) => x.name === name); if (!r) continue;
      const h = _bcpHouse(progSign, r.sign);
      let rel = null; if (h === 1) rel = "conjunct"; else if (h === 5 || h === 9) rel = "trine"; else if (h === 7) rel = "opposition";
      if (rel) activated.push({ planet: name, relation: rel, theme: bnnMeaning("Jupiter", name) });
    }
    out.push({ age: a, progSign, activated });
  }
  return { natalSign, timeline: out };
}

function computeKundli({ y, m, day, hh, mi, tz, lat, lon, ayanamsa = "lahiri" }) {
  setAyanMode(ayanamsa);
  const utcMs = Date.UTC(y, m - 1, day, hh, mi) - tz * 3600000;
  const JD = utcMs / 86400000 + 2440587.5;
  const d = JD - 2451543.5; // Schlyter epoch
  const ayan = ayanAt(JD);

  const trop = tropicalLongitudes(d);
  const tropPrev = tropicalLongitudes(d - 0.5);

  const bodies = {};
  Object.keys(trop).forEach((k) => {
    bodies[k] = { trop: trop[k], sid: rev(trop[k] - ayan) };
  });
  bodies.Ketu = { trop: rev(trop.Rahu + 180), sid: rev(trop.Rahu + 180 - ayan) };

  // retrograde
  ["Mars", "Mercury", "Jupiter", "Venus", "Saturn"].forEach((k) => {
    const diff = ((trop[k] - tropPrev[k] + 540) % 360) - 180;
    bodies[k].retro = diff < 0;
  });
  bodies.Rahu.retro = true;
  bodies.Ketu.retro = true;

  // ascendant
  const gmst = rev(280.46061837 + 360.98564736629 * (JD - 2451545.0));
  const ramc = rev(gmst + lon);
  const eps = 23.4393 - 3.563e-7 * d;
  const ascTrop = atan2d(cdg(ramc), -(sd(ramc) * cdg(eps) + tdg(lat) * sd(eps)));
  const ascSid = rev(ascTrop - ayan);
  const ascSign = Math.floor(ascSid / 30);

  // decorate bodies
  const order = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"];
  const rows = order.map((k) => {
    const L = bodies[k].sid;
    const sign = Math.floor(L / 30);
    const nakIdx = Math.floor(L / (360 / 27));
    return {
      name: k,
      lon: L,
      sign,
      deg: L - sign * 30,
      nak: nakIdx,
      pada: Math.floor((L % (360 / 27)) / (360 / 108)) + 1,
      house: ((sign - ascSign + 12) % 12) + 1,
      retro: !!bodies[k].retro,
      kp: subLordChain(L),
    };
  });

  // panchang
  const elong = rev(bodies.Moon.sid - bodies.Sun.sid);
  const tithiNum = Math.floor(elong / 12); // 0..29
  const paksha = tithiNum < 15 ? "Shukla" : "Krishna";
  const tithiName = tithiNum % 15 === 14 ? (tithiNum < 15 ? "Purnima" : "Amavasya") : TITHIS[tithiNum % 15];
  const yogaIdx = Math.floor(rev(bodies.Sun.sid + bodies.Moon.sid) / (360 / 27));
  const weekday = ["Ravivara (Sun)", "Somavara (Mon)", "Mangalavara (Tue)", "Budhavara (Wed)", "Guruvara (Thu)", "Shukravara (Fri)", "Shanivara (Sat)"][new Date(utcMs + tz * 3600000).getUTCDay()];

  // Vimshottari dasha
  const moonL = bodies.Moon.sid;
  const nakIdx = Math.floor(moonL / (360 / 27));
  const frac = (moonL % (360 / 27)) / (360 / 27);
  const startSeq = nakIdx % 9;
  const birthMs = utcMs;
  const YEAR = 365.25 * 86400000;
  const dashas = [];
  let cursor = birthMs;
  for (let i = 0; i < 9; i++) {
    const [lord, yrs] = DASHA_SEQ[(startSeq + i) % 9];
    const span = (i === 0 ? (1 - frac) * yrs : yrs) * YEAR;
    dashas.push({ lord, yrs, start: cursor, end: cursor + span, balance: i === 0 ? (1 - frac) * yrs : yrs });
    cursor += span;
  }
  const now = Date.now();
  const current = dashas.find((dsh) => now >= dsh.start && now < dsh.end);
  let antars = [], curAntar = null, pratyantars = [], curPratya = null,
      sookshmas = [], curSookshma = null, pranas = [], curPrana = null;
  if (current) {
    // antardashas run the full lord-cycle proportionally across the FULL maha
    // period; for a partial first dasha we back-compute the notional full start.
    const fullStart = current.end - current.yrs * YEAR;
    antars = vimSub(current.lord, fullStart, current.yrs * YEAR).filter((a) => a.end > birthMs);
    curAntar = antars.find((a) => now >= a.start && now < a.end);
    if (curAntar) {
      pratyantars = vimSub(curAntar.lord, curAntar.start, curAntar.end - curAntar.start);
      curPratya = pratyantars.find((p) => now >= p.start && now < p.end);
      if (curPratya) {
        sookshmas = vimSub(curPratya.lord, curPratya.start, curPratya.end - curPratya.start);
        curSookshma = sookshmas.find((s) => now >= s.start && now < s.end);
        if (curSookshma) {
          pranas = vimSub(curSookshma.lord, curSookshma.start, curSookshma.end - curSookshma.start);
          curPrana = pranas.find((p) => now >= p.start && now < p.end);
        }
      }
    }
  }

  const signOf = {};
  rows.forEach((p) => (signOf[p.name] = p.sign));
  const av = computeAshtakavarga(signOf, ascSign);

  // Shadbala — needs sunrise/sunset for the birth date + planet speeds + tropical longitudes
  const epsB = 23.4393 - 3.563e-7 * d;
  const speedsB = {};
  ["Mars", "Mercury", "Jupiter", "Venus", "Saturn"].forEach((p) => {
    speedsB[p] = ((((trop[p] - tropPrev[p]) + 540) % 360) - 180) / 0.5;
  });
  const evB = sunEvents(y, m, day, tz, lat, lon);
  const shadbala = computeShadbala({
    rows, ascSign, ascLong: ascSid,
    sunLon: bodies.Sun.sid, moonLon: bodies.Moon.sid,
    tropLon: trop, eps: epsB, speeds: speedsB,
    birthMs: utcMs, tz, lon, rise: evB.rise, set: evB.set,
  });
  const special = computeSpecialPoints({
    asc: ascSid, sun: bodies.Sun.sid, moon: bodies.Moon.sid, rahu: bodies.Rahu.sid,
    ascSign, birthMs: utcMs, tz, lat, lon, ayan, rise: evB.rise, set: evB.set, JD,
  });
  const ramcK = rev(rev(280.46061837 + 360.98564736629 * (JD - 2451545.0)) + lon);
  const mcSid = rev(atan2d(sd(ramcK), cdg(ramcK) * cdg(23.4393 - 3.563e-7 * d)) - ayan);
  const planetLonsK = {};
  ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"].forEach((p) => (planetLonsK[p] = bodies[p].sid));
  const bhava = computeBhavaChalit(ascSid, mcSid, planetLonsK, ascSign, shadbala);

  // KP: Placidus cusps (sidereal), cuspal sub-lords, and planet placements by Placidus house
  const epsObl = 23.4393 - 3.563e-7 * d;
  const placRes = placidusCusps(ramcK, epsObl, lat);
  const kpCusps = placRes.cusps.map((c) => (c == null ? null : rev(c - ayan)));
  let kpHouseSystem = "Placidus";
  if (!placRes.ok) {
    kpHouseSystem = "Porphyry (Placidus undefined at this latitude)";
    const a1 = rev(ascSid - mcSid), a2 = rev(rev(mcSid + 180) - ascSid);
    kpCusps[10] = mcSid; kpCusps[1] = ascSid; kpCusps[4] = rev(mcSid + 180); kpCusps[7] = rev(ascSid + 180);
    kpCusps[11] = rev(mcSid + a1 / 3); kpCusps[12] = rev(mcSid + 2 * a1 / 3);
    kpCusps[2] = rev(ascSid + a2 / 3); kpCusps[3] = rev(ascSid + 2 * a2 / 3);
    kpCusps[5] = rev(kpCusps[11] + 180); kpCusps[6] = rev(kpCusps[12] + 180);
    kpCusps[8] = rev(kpCusps[2] + 180); kpCusps[9] = rev(kpCusps[3] + 180);
  }
  const cuspSubLords = kpCusps.map((c) => (c == null ? null : subLordChain(c)));
  const kpHouseOf = (L) => {
    for (let i = 1; i <= 12; i++) {
      const lo = kpCusps[i], hi = kpCusps[(i % 12) + 1];
      if (rev(L - lo) < rev(hi - lo)) return i;
    }
    return 1;
  };
  rows.forEach((p) => (p.kpHouse = kpHouseOf(p.lon)));
  const kpData = { cusps: kpCusps, cuspSubLords, houseSystem: kpHouseSystem };

  // KP significators + Ruling Planets (weekday lord by Hindu sunrise reckoning)
  let dowB = new Date(utcMs + tz * 3600000).getUTCDay();
  if (evB.rise != null && utcMs < evB.rise) dowB = (dowB + 6) % 7;
  const kpSig = computeKPSignificators(rows, kpCusps);
  const rulingPlanets = computeRulingPlanets(ascSid, bodies.Moon.sid, WEEKDAY_LORDS[dowB]);
  const yogas = detectYogas(rows, ascSign);
  const arudhas = computeArudhas(ascSign, signOf);

  // Jaimini chara karakas: the seven planets ranked by advancement within their sign
  const KARAKA_ROLES = [
    ["Atmakaraka", "the soul, life's central thread"],
    ["Amatyakaraka", "career & counsel"],
    ["Bhratrikaraka", "siblings & guru"],
    ["Matrikaraka", "mother & nurture"],
    ["Putrakaraka", "children & students"],
    ["Gnatikaraka", "kin, rivals & obstacles"],
    ["Darakaraka", "spouse & partnership"],
  ];
  const karakas = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"]
    .map((n) => rows.find((p) => p.name === n))
    .sort((a, b) => b.deg - a.deg)
    .map((p, i) => ({ role: KARAKA_ROLES[i][0], meaning: KARAKA_ROLES[i][1], planet: p.name, deg: p.deg, sign: p.sign }));

  return {
    JD, ayan, ascSid, ascSign,
    ascDeg: ascSid - ascSign * 30,
    ascNak: Math.floor(ascSid / (360 / 27)),
    rows, karakas, ak: karakas[0].planet, av, yogas, arudhas, shadbala, special, bhava, kpData, kpSig, rulingPlanets,
    panchang: { weekday, tithiName, paksha, tithiNum, yoga: YOGAS[yogaIdx], nak: NAKSHATRAS[nakIdx], karana: karanaName(elong) },
    tz,
    birthMs: utcMs,
    dashas, current, antars,
    curAntar, pratyantars, curPratya, sookshmas, curSookshma, pranas, curPrana,
    bnn: computeBNN(rows),
    moon: rows.find((r) => r.name === "Moon"),
    sun: rows.find((r) => r.name === "Sun"),
  };
}

/* ---------------- formatting ---------------- */
const fmtDate = (ms) => new Date(ms).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });
// Birth-local formatter (offset in hours). withTime drops the year and adds a
// clock — used for Sookshma/Prana, whose spans are hours-to-days.
const fmtDateT = (ms, tz = 0, withTime = false) => {
  const d = new Date(ms + tz * 3600000);
  if (!withTime) return d.toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" });
  const date = d.toLocaleDateString("en-IN", { month: "short", day: "numeric", timeZone: "UTC" });
  let h = d.getUTCHours(); const mi = d.getUTCMinutes();
  const ap = h >= 12 ? "PM" : "AM"; h = h % 12 || 12;
  return `${date}, ${h}:${String(mi).padStart(2, "0")} ${ap}`;
};

/* ---- Gochar (transit) timeline for a planet: its sign-change sequence with durations & retro stations ---- */
const PLANET_PERIOD_DAYS = { Sun: 400, Moon: 35, Mars: 760, Mercury: 400, Jupiter: 430, Venus: 400, Saturn: 1200, Rahu: 560, Ketu: 560 };

function planetGochar(planet, fromMs, spanDays) {
  if (planet === "Rahu" || planet === "Ketu") {
    // nodes move retrograde; compute from Rahu mean longitude
    const f = (ms) => { const JD = jdOf(ms); const lon = rev(125.1228 - 0.0529538083 * (JD - 2451543.5) - ayanAt(JD)); return planet === "Ketu" ? rev(lon + 180) : lon; };
    return signSeq(f, fromMs, spanDays, true);
  }
  const f = (ms) => planetSidMs(planet, ms);
  return signSeq(f, fromMs, spanDays, false);
}

function signSeq(f, fromMs, spanDays, retroMotion) {
  const seq = [];
  const startSign = Math.floor(f(fromMs) / 30);
  seq.push({ sign: startSign, enter: null });
  let prevSign = startSign;
  const speed = (ms) => (((f(ms + 43200000) - f(ms - 43200000) + 540) % 360) - 180);
  let pv = speed(fromMs);
  const stations = [];
  const step = 0.5; // half-day resolution
  for (let dd = step; dd <= spanDays; dd += step) {
    const t = fromMs + dd * 86400000;
    const sg = Math.floor(f(t) / 30);
    if (sg !== prevSign) {
      let lo = t - step * 86400000, hi = t;
      for (let k = 0; k < 22; k++) { const mid = (lo + hi) / 2; if (Math.floor(f(mid) / 30) === prevSign) lo = mid; else hi = mid; }
      seq.push({ sign: sg, enter: hi });
      prevSign = sg;
    }
    if (!retroMotion) {
      const v = speed(t);
      if (v * pv < 0) {
        let lo = t - step * 86400000, hi = t;
        for (let k = 0; k < 22; k++) { const mid = (lo + hi) / 2; if (speed(mid) * pv > 0) lo = mid; else hi = mid; }
        stations.push({ t: hi, retro: v < 0 });
      }
      pv = v;
    }
  }
  // attach the exit time of each sign = enter of next
  for (let i = 0; i < seq.length; i++) seq[i].exit = i + 1 < seq.length ? seq[i + 1].enter : null;
  return { seq, stations };
}

function fmtDur(ms) {
  const days = Math.round(ms / 86400000);
  if (days < 31) return days + (days === 1 ? " day" : " days");
  const months = Math.floor(days / 30.44);
  const remD = Math.round(days - months * 30.44);
  const years = Math.floor(months / 12);
  const remM = months % 12;
  const parts = [];
  if (years) parts.push(years + "y");
  if (remM) parts.push(remM + "m");
  if (!years && remD) parts.push(remD + "d");
  return parts.join(" ") || days + " days";
}

/* event detail enrichment */
const EVENT_DESC = {
  "Surya enters": "Sankranti marks the Sun's entry into a new sign, shifting seasonal energies and the rhythm of nature.",
  "Purnima": "Full moon — a peak of lunar power, heightened intuition and emotional intensity.",
  "Amavasya": "New moon — a reset point, ideal for new beginnings and introspection.",
  "enters": "A planet changing signs shifts its character and influence across domains of life.",
  "retrograde": "A planet appears to move backward, triggering introspection, review, and the ripening of past karma.",
  "direct": "A planet resumes forward motion, completing its review cycle and moving intention into action.",
};

function eventDetail(ev, now) {
  const until = ev.t - now;
  const days = Math.floor(until / 86400000);
  const hours = Math.floor((until % 86400000) / 3600000);
  let desc = "";
  for (const key of Object.keys(EVENT_DESC)) {
    if (ev.label.includes(key)) { desc = EVENT_DESC[key]; break; }
  }
  const timeStr = days > 0 ? `${days}d ${hours}h` : hours > 0 ? `${hours}h` : "Today";
  return { desc, timeStr, days, hours };
}

/* ---------------- main app ---------------- */
// Recursive Vimshottari drill-down: antar -> pratyantar -> sookshma -> prana.
// Each row past level 0 is expandable; children are derived on demand via vimSub.
const DASHA_LEVELS = ["Antardasha", "Pratyantardasha", "Sookshma", "Prana"];
function DashaTree({ periods, level, now, openD, toggle, C, tz }) {
  return (
    <div style={{ marginLeft: level ? 11 : 0, borderLeft: level ? `1px solid ${C.line}` : "none", paddingLeft: level ? 11 : 0 }}>
      {level > 0 && <div style={{ fontSize: 9, letterSpacing: ".12em", textTransform: "uppercase", color: C.muted, margin: "4px 0 2px 2px" }}>{DASHA_LEVELS[level]}</div>}
      {periods.map((p) => {
        const live = now >= p.start && now < p.end;
        const key = level + ":" + p.start;
        const open = openD.has(key);
        const canDrill = level < 3;
        const kids = open && canDrill ? vimSub(p.lord, p.start, p.end - p.start) : null;
        return (
          <div key={p.start}>
            <div
              onClick={canDrill ? () => toggle(key) : undefined}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 8px", cursor: canDrill ? "pointer" : "default", borderRadius: 7, background: live ? "rgba(168,106,18,.09)" : "transparent" }}
            >
              <span style={{ color: C.muted, fontSize: 10, width: 9, flexShrink: 0 }}>{canDrill ? (open ? "▾" : "▸") : ""}</span>
              <span style={{ color: live ? C.gold : C.ivory, fontWeight: live ? 600 : 400, fontSize: 13.5, minWidth: 62 }}>{p.lord}</span>
              <span style={{ color: C.muted, fontSize: 12, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>{fmtDateT(p.start, tz, level >= 2)} – {fmtDateT(p.end, tz, level >= 2)}</span>
              {live && <span style={{ color: C.gold, fontSize: 9.5, letterSpacing: ".14em", textTransform: "uppercase" }}>now</span>}
            </div>
            {kids && <DashaTree periods={kids} level={level + 1} now={now} openD={openD} toggle={toggle} C={C} tz={tz} />}
          </div>
        );
      })}
    </div>
  );
}

function BNNModule({ bnn, rows, tz, C, card }) {
  const [sex, setSex] = useState("male");
  const [ref, setRef] = useState("Jupiter");
  const setSexAnd = (sx) => { setSex(sx); setRef(sx === "male" ? "Jupiter" : "Venus"); };
  const fmtD = (deg) => `${Math.floor(deg)}°${String(Math.floor((deg % 1) * 60)).padStart(2, "0")}′`;
  const rel = bnnRelations(rows, ref);
  const reading = bnnReading(rows, ref);
  const dirColor = { East: "#A86A12", South: "#C2451E", West: "#1F7A4D", North: "#3B5BA8" };
  const YEAR_MS = 365.25 * 86400000;
  const nowMs = Date.now();
  const timing = useMemo(() => bnnTiming(rows, nowMs - 1.5 * YEAR_MS, 14 * 365), [rows]);
  const satNow = useMemo(() => { try { return planetGochar("Saturn", Date.now(), 2).seq[0].sign; } catch (e) { return null; } }, []);

  const lab = { display: "block", ...T.label, color: C.muted, marginBottom: 6 };
  const tag = (name, extra) => (
    <span key={name} style={{ display: "inline-flex", alignItems: "baseline", gap: 5, fontSize: 13.5 }}>
      <span style={{ fontFamily: "Eczar, serif", color: C.ivory }}>{name}</span>
      {extra && <span style={{ fontSize: 11, color: C.muted }}>{extra}</span>}
    </span>
  );

  const RELS = [
    ["conjunct", "Conjunct", "same sign — strongest blend"],
    ["h2", "2nd · future", "kartari (ahead)"],
    ["h12", "12th · past", "kartari (behind)"],
    ["h7", "7th · opposition", "direct opposition"],
    ["h5", "5th · trine", "functional conjunction"],
    ["h9", "9th · trine", "functional conjunction"],
    ["h3", "3rd", "secondary"],
    ["h11", "11th", "secondary"],
    ["hidden", "Hidden · 4/6/8/10", "afflicts / denies the karaka"],
  ];

  return (
    <div>
      {/* controls */}
      <div style={{ ...card, padding: 16, display: "flex", flexWrap: "wrap", gap: 16, alignItems: "flex-end" }}>
        <div>
          <label style={lab}>Chart of</label>
          <div style={{ display: "flex", gap: 6 }}>
            {[["male", "वर · Male"], ["female", "कन्या · Female"]].map(([k, t]) => (
              <button key={k} onClick={() => setSexAnd(k)} style={{ padding: "8px 14px", borderRadius: 8, fontFamily: "Eczar, serif", fontSize: 13.5, cursor: "pointer", border: `1px solid ${sex === k ? C.gold : C.line}`, background: sex === k ? "rgba(168,106,18,.1)" : "transparent", color: sex === k ? C.gold : C.muted }}>{t}</button>
            ))}
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 160 }}>
          <label style={lab}>Read from (lagna)</label>
          <select value={ref} onChange={(e) => setRef(e.target.value)} style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: `1px solid ${C.line}`, background: "#FFFDF7", color: C.ivory, fontFamily: "Spectral, serif", fontSize: 14.5 }}>
            {BNN_PLANETS.map((p) => <option key={p} value={p}>{p}{p === "Jupiter" ? " — jeeva / self (male)" : p === "Venus" ? " — spouse / self (female)" : ""}</option>)}
          </select>
        </div>
      </div>

      {/* directional chart */}
      <div style={{ ...T.label, color: C.muted, margin: "18px 0 8px" }}>Directional chart · planets ordered by degree (lower initiates)</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10 }}>
        {bnn.directional.map((d) => (
          <div key={d.direction} style={{ ...card, padding: "12px 14px", borderTop: `3px solid ${dirColor[d.direction]}` }}>
            <div style={{ fontFamily: "Eczar, serif", fontSize: 14, color: dirColor[d.direction], marginBottom: 8 }}>{d.direction}</div>
            {d.planets.length === 0 ? <div style={{ fontSize: 12.5, color: C.muted, fontStyle: "italic" }}>—</div> :
              d.planets.map((p) => (
                <div key={p.name} style={{ display: "flex", justifyContent: "space-between", gap: 8, fontSize: 13, padding: "2px 0" }}>
                  <span style={{ fontFamily: "Eczar, serif", color: C.ivory }}>{p.name}{p.retro ? <span style={{ color: C.sindoor, fontSize: 11 }}> ℞</span> : ""}</span>
                  <span style={{ color: C.muted, fontSize: 12, fontVariantNumeric: "tabular-nums" }}>{SIGN_SHORT[p.sign]} {fmtD(p.deg)}</span>
                </div>
              ))}
          </div>
        ))}
      </div>

      {/* relation grid from reference */}
      <div style={{ ...T.label, color: C.muted, margin: `${T.s5}px 0 ${T.s2}px` }}>
        Combinations with {ref} <span style={{ textTransform: "none", letterSpacing: 0 }}>— {BNN_KARAKA[ref]}</span>
      </div>
      <div style={{ ...card, padding: "6px 4px" }}>
        {RELS.map(([key, title, sub], i) => {
          const names = rel.buckets[key];
          const isHidden = key === "hidden";
          const strong = key === "conjunct" || key === "h5" || key === "h9";
          return (
            <div key={key} style={{ display: "grid", gridTemplateColumns: "128px 1fr", gap: 10, padding: "9px 12px", borderTop: i ? "1px solid #EBDFC6" : "none", alignItems: "start" }}>
              <div>
                <div style={{ fontFamily: "Eczar, serif", fontSize: 13, color: isHidden ? C.sindoor : strong ? "#1F7A4D" : C.gold }}>{title}</div>
                <div style={{ fontSize: 10.5, color: C.muted }}>{sub}</div>
              </div>
              <div style={{ paddingTop: 1 }}>
                {names.length === 0 ? <span style={{ fontSize: 13, color: C.line }}>—</span> :
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 14px" }}>
                    {names.map((n) => tag(n, BNN_KARAKA[n].split(",")[0]))}
                  </div>}
              </div>
            </div>
          );
        })}
      </div>

      {/* core combinations */}
      <div style={{ ...T.label, color: C.muted, margin: `${T.s5}px 0 ${T.s2}px` }}>Seven core combinations</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 8 }}>
        {bnn.coreCombos.map((c) => (
          <div key={c.pair.join()} style={{ ...card, padding: "11px 13px", borderLeft: `3px solid ${c.active ? "#1F7A4D" : C.line}`, opacity: c.active ? 1 : 0.6 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
              <span style={{ fontFamily: "Eczar, serif", fontSize: 14, color: c.active ? C.ivory : C.muted }}>{c.pair[0]} + {c.pair[1]}</span>
              <span style={{ fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: c.active ? "#1F7A4D" : C.muted }}>{c.active ? "active" : "—"}</span>
            </div>
            <div style={{ fontSize: 11.5, color: C.muted, marginTop: 3 }}>{c.relation}</div>
            <div style={{ fontSize: 12, color: c.active ? C.ivory : C.muted, marginTop: 5, lineHeight: 1.4, fontStyle: c.active ? "normal" : "italic" }}>{c.meaning}</div>
          </div>
        ))}
      </div>

      {/* modulators */}
      {(bnn.parivartana.length > 0 || (bnn.rahuKetu && (bnn.rahuKetu.rahuSide.length || bnn.rahuKetu.ketuSide.length)) || bnn.retroShadow.length > 0) && (
        <div style={{ ...card, padding: "13px 15px", marginTop: 16, fontSize: 12.5, color: C.muted, lineHeight: 1.6 }}>
          {bnn.parivartana.length > 0 && <div><span style={{ color: C.gold, fontFamily: "Eczar, serif" }}>Parivartana</span> (exchange — read each as in its own sign): {bnn.parivartana.map((p) => p.join(" ⇄ ")).join("; ")}</div>}
          {bnn.rahuKetu && <div style={{ marginTop: bnn.parivartana.length ? 6 : 0 }}><span style={{ color: C.gold, fontFamily: "Eczar, serif" }}>Rahu–Ketu split</span> (separated planets act apart): Rahu side — {bnn.rahuKetu.rahuSide.join(", ") || "—"} · Ketu side — {bnn.rahuKetu.ketuSide.join(", ") || "—"}</div>}
          {bnn.retroShadow.length > 0 && <div style={{ marginTop: 6 }}><span style={{ color: C.gold, fontFamily: "Eczar, serif" }}>Retrograde shadow</span> (also reads from the 12th sign): {bnn.retroShadow.map((r) => `${r.name} → ${SIGN_SHORT[r.shadowSign]}`).join(", ")}</div>}
        </div>
      )}

      {/* Jupiter transit timing */}
      <div style={{ ...T.label, color: C.muted, margin: `${T.s5}px 0 ${T.s2}px` }}>Jupiter transit · timing</div>
      <div style={{ fontSize: 12, color: C.muted, marginBottom: 8, lineHeight: 1.5 }}>
        Real Jupiter transit — as it enters each sign it activates the natal planets it conjuncts, trines or opposes, bringing that combination into season.{satNow != null && <> Saturn, the fate-clock, currently transits <span style={{ color: C.gold }}>{SIGN_SHORT[satNow]}</span>.</>}
      </div>
      <div style={{ ...card, padding: "4px 4px", maxHeight: 430, overflowY: "auto" }}>
        {timing.map((p, i) => {
          const isNow = p.enter != null && p.exit != null && nowMs >= p.enter && nowMs < p.exit;
          const quiet = p.activated.length === 0;
          return (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "94px 1fr", gap: 10, padding: "8px 12px", borderTop: i ? "1px solid #EBDFC6" : "none", background: isNow ? "rgba(168,106,18,.09)" : "transparent", alignItems: "start" }}>
              <div>
                <div style={{ fontFamily: "Eczar, serif", fontSize: 14, color: isNow ? C.gold : C.ivory }}>{SIGN_SHORT[p.sign]}{isNow && <span style={{ fontSize: 9, letterSpacing: ".12em" }}> NOW</span>}</div>
                <div style={{ fontSize: 10.5, color: C.muted, fontVariantNumeric: "tabular-nums" }}>{p.enter ? fmtDateT(p.enter, tz, false) : "…"}</div>
              </div>
              <div style={{ paddingTop: 1 }}>
                {quiet ? <span style={{ fontSize: 12.5, color: C.line }}>— quiet (no natal contact)</span> :
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 6px" }}>
                    {p.activated.map((a) => {
                      const c = a.relation === "conjunct" ? { bg: "rgba(31,122,77,.14)", fg: "#1F7A4D", b: "#1F7A4D" } : a.relation === "trine" ? { bg: "transparent", fg: C.gold, b: C.line } : { bg: "transparent", fg: C.muted, b: C.line };
                      return <span key={a.planet} title={a.theme} style={{ fontSize: 12, padding: "2px 8px", borderRadius: 11, border: `1px solid ${c.b}`, background: c.bg, color: c.fg }}>{a.planet} <span style={{ fontSize: 10, opacity: 0.8 }}>{a.relation}</span></span>;
                    })}
                  </div>}
                {isNow && !quiet && (
                  <div style={{ marginTop: 6, fontSize: 11.5, color: C.muted, lineHeight: 1.45 }}>
                    {p.activated.filter((a) => a.relation === "conjunct" || a.relation === "trine").slice(0, 2).map((a) => <div key={a.planet}>Jupiter + {a.planet}: {a.theme}</div>)}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Tier C — hedged traditional reading (themes, not prediction) */}
      <div style={{ ...T.label, color: C.muted, margin: `${T.s5}px 0 ${T.s2}px` }}>How the tradition reads this · {ref}</div>
      <div style={{ ...card, padding: "16px 18px", borderTop: `3px solid ${C.gold}` }}>
        <div style={{ fontSize: 13, color: C.ivory, lineHeight: 1.6 }}>
          With <span style={{ fontFamily: "Eczar, serif", color: C.gold }}>{reading.self}</span> as the reference ({reading.selfKaraka}), BNN tradition reads its active combinations as these themes:
        </div>
        {reading.active.length === 0 ? (
          <div style={{ fontSize: 12.5, color: C.muted, marginTop: 10, fontStyle: "italic" }}>No planets stand in combination with {reading.self} — the tradition would read it as largely on its own, taking the quality of its sign.</div>
        ) : (
          <ul style={{ margin: "10px 0 0", padding: 0, listStyle: "none" }}>
            {reading.active.map((a) => (
              <li key={a.planet} style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 10, padding: "6px 0", borderTop: "1px solid #EBDFC6", alignItems: "baseline" }}>
                <span style={{ fontFamily: "Eczar, serif", fontSize: 13, color: C.gold, whiteSpace: "nowrap" }}>+ {a.planet} <span style={{ fontSize: 10.5, color: C.muted }}>{a.relation}</span></span>
                <span style={{ fontSize: 12.5, color: C.muted, lineHeight: 1.45 }}>{a.theme}</span>
              </li>
            ))}
          </ul>
        )}
        {reading.obstructed.length > 0 && (
          <div style={{ fontSize: 12, color: C.muted, marginTop: 12, lineHeight: 1.45 }}>
            <span style={{ color: C.sindoor }}>Read as obstructed</span> (in the hidden 4/6/8/10 houses): {reading.obstructed.map((o) => o.planet).join(", ")} — the tradition treats these significations as held back or turned inward.
          </div>
        )}
        <div style={{ fontSize: 11.5, color: C.muted, marginTop: 14, paddingTop: 12, borderTop: `1px dashed ${C.line}`, lineHeight: 1.55, fontStyle: "italic" }}>
          These are interpretive themes from the BNN tradition, not predictions about you. A real reading is the whole <em>chain</em> weighed together — by each planet's strength, the surrounding combinations, and Jupiter/Saturn timing — and is the judgment of a practitioner. This view deliberately stops at themes: it makes no claim about specific events, health, or timing, and isn't a substitute for a qualified astrologer.
        </div>
      </div>

      <p style={{ color: C.muted, fontSize: 12, marginTop: 16, lineHeight: 1.55 }}>
        This surfaces the BNN geometry — directional grouping, the combinations with your chosen karaka, and the modulators acting on them — plus each planet's traditional signification. It deliberately stops short of a verdict: BNN reads the <em>chain</em> of combinations, with intensity set by exaltation, debilitation, retrogression and exchange, and the same combination means different things in different chains. Treat this as the structured input a Nadi reading is built from, not the reading itself.
      </p>
    </div>
  );
}

function BhriguModule({ rows, ascSign, birthMs, tz, C, card }) {
  const YEAR_MS = 365.25 * 86400000;
  const currentAge = Math.max(0, Math.floor((Date.now() - birthMs) / YEAR_MS));
  const birthYear = new Date(birthMs + tz * 3600000).getFullYear();
  const bcp = useMemo(() => bcpTimeline(ascSign, rows, Math.max(1, currentAge - 3), currentAge + 16), [rows, ascSign, currentAge]);
  const bsp = useMemo(() => bspRules(ascSign, rows), [rows, ascSign]);
  const prog = useMemo(() => jupiterProgression(rows, Math.max(0, currentAge - 2), currentAge + 12), [rows, currentAge]);
  const ord = (n) => n + (["th", "st", "nd", "rd"][(n % 100 >> 3 ^ 1) && n % 10] || "th");
  const lordColor = { Sun: "#C2451E", Moon: "#5B7Fb0", Mars: "#B23B2E", Mercury: "#1F7A4D", Jupiter: "#A86A12", Venus: "#9A5BA3", Saturn: "#52606D", Rahu: "#6B4E8A", Ketu: "#7A6A52" };
  const sub = { fontSize: 12, color: C.muted, marginBottom: 8, lineHeight: 1.5 };

  return (
    <div>
      {/* BCP house progression */}
      <div style={{ ...T.label, color: C.muted, margin: "4px 0 8px" }}>Bhrigu Chakra · one house per year</div>
      <div style={sub}>From the Ascendant, year 1 is the 1st house, year 2 the 2nd, and so on — the chakra rotating every 12 years. Each 12-year cycle carries a Cycle Lord (Chakra Swami) that colours it.</div>
      <div style={{ ...card, padding: "4px 4px", maxHeight: 360, overflowY: "auto" }}>
        {bcp.map((b, i) => {
          const isNow = b.age === currentAge;
          return (
            <div key={b.age} style={{ display: "grid", gridTemplateColumns: "74px 86px 1fr", gap: 8, padding: "7px 12px", borderTop: i ? "1px solid #EBDFC6" : "none", background: isNow ? "rgba(168,106,18,.09)" : "transparent", alignItems: "baseline" }}>
              <div>
                <div style={{ fontFamily: "Eczar, serif", fontSize: 13.5, color: isNow ? C.gold : C.ivory }}>age {b.age}{isNow && <span style={{ fontSize: 9, letterSpacing: ".1em" }}> NOW</span>}</div>
                <div style={{ fontSize: 10, color: C.muted }}>~{birthYear + b.age}</div>
              </div>
              <div>
                <div style={{ fontSize: 13, color: C.ivory }}>{ord(b.houseNum)} · {SIGN_SHORT[b.sign]}</div>
                <div style={{ fontSize: 9.5, letterSpacing: ".06em", color: lordColor[b.cycleLord] || C.muted }}>{b.cycleLord} cycle</div>
              </div>
              <div style={{ fontSize: 11.5, color: C.muted, lineHeight: 1.4 }}>
                {b.theme}
                {b.occupants.length > 0 && <span style={{ color: C.gold }}> · {b.occupants.join(", ")} here</span>}
              </div>
            </div>
          );
        })}
      </div>

      {/* BSP implements-rules */}
      <div style={{ ...T.label, color: C.muted, margin: `${T.s5}px 0 ${T.s2}px` }}>Bhrigu Saral · implements-rules <span style={{ textTransform: "none", letterSpacing: 0, fontSize: 10.5 }}>(documented subset)</span></div>
      <div style={sub}>Each rule fixes a year when a planet "implements" a particular house counted from itself. Shown as the house it lands on in this chart, with significations — a structural map, not an event forecast.</div>
      <div style={{ ...card, padding: "4px 4px" }}>
        {bsp.map((r, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "118px 1fr", gap: 10, padding: "9px 12px", borderTop: i ? "1px solid #EBDFC6" : "none", alignItems: "baseline" }}>
            <div>
              <div style={{ fontFamily: "Eczar, serif", fontSize: 13, color: lordColor[r.planet] || C.ivory }}>{r.planet}</div>
              <div style={{ fontSize: 10.5, color: C.muted }}>{r.age ? `age ${r.age}` : "lifelong"} · {ord(r.from)} from self</div>
            </div>
            <div style={{ fontSize: 11.5, color: C.muted, lineHeight: 1.45 }}>
              lands on <span style={{ color: C.ivory }}>{SIGN_SHORT[r.targetSign]}</span> ({ord(r.houseFromLagna)} house) — {r.theme}
              {r.occupants.length > 0 && <span style={{ color: C.gold }}> · with {r.occupants.join(", ")}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Jupiter symbolic progression */}
      <div style={{ ...T.label, color: C.muted, margin: `${T.s5}px 0 ${T.s2}px` }}>Jupiter progression · 1 sign / year</div>
      <div style={sub}>The symbolic counterpart to the real-transit timing in the BNN section: natal Jupiter advanced one sign per year of age. The two methods diverge — that divergence is itself a thing practitioners weigh.</div>
      <div style={{ ...card, padding: "4px 4px", maxHeight: 320, overflowY: "auto" }}>
        {prog.timeline.map((p, i) => {
          const isNow = p.age === currentAge;
          const quiet = p.activated.length === 0;
          return (
            <div key={p.age} style={{ display: "grid", gridTemplateColumns: "90px 60px 1fr", gap: 8, padding: "7px 12px", borderTop: i ? "1px solid #EBDFC6" : "none", background: isNow ? "rgba(168,106,18,.09)" : "transparent", alignItems: "baseline" }}>
              <div style={{ fontFamily: "Eczar, serif", fontSize: 13, color: isNow ? C.gold : C.ivory }}>age {p.age}{isNow && <span style={{ fontSize: 9 }}> NOW</span>}</div>
              <div style={{ fontSize: 12.5, color: C.ivory }}>{SIGN_SHORT[p.progSign]}</div>
              <div style={{ paddingTop: 1 }}>
                {quiet ? <span style={{ fontSize: 12, color: C.line }}>— quiet</span> :
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "3px 6px" }}>
                    {p.activated.map((a) => {
                      const c = a.relation === "conjunct" ? "#1F7A4D" : a.relation === "trine" ? C.gold : C.muted;
                      return <span key={a.planet} title={a.theme} style={{ fontSize: 11.5, padding: "1px 7px", borderRadius: 10, border: `1px solid ${C.line}`, color: c }}>{a.planet} <span style={{ fontSize: 9.5, opacity: 0.8 }}>{a.relation}</span></span>;
                    })}
                  </div>}
              </div>
            </div>
          );
        })}
      </div>

      <p style={{ color: C.muted, fontSize: 12, marginTop: 16, lineHeight: 1.55 }}>
        These are progression mechanics — which house or sign a method points to in a given year — surfaced with the standard significations of those houses. They are a structured map of <em>when</em> the tradition would have you look, not a forecast of what will happen. The BSP set is a widely-documented subset, not the complete proprietary system, and the longevity rules are deliberately excluded. Read alongside a practitioner, not in place of one.
      </p>
    </div>
  );
}

function ChartVault({ snapshot, result, onLoad, C, card, lang = "en" }) {
  const store = (typeof window !== "undefined" && window.storage) ? window.storage : null;
  const [saved, setSaved] = useState([]);
  const [msg, setMsg] = useState("");
  const [imp, setImp] = useState("");
  const [confirmId, setConfirmId] = useState(null);
  const ready = !!(result && snapshot && snapshot.form && snapshot.place);
  const t = (en, hi) => (lang === "hi" ? hi : en);

  const refresh = async () => {
    if (!store) return;
    try {
      const res = await store.list("chart:");
      const keys = (res && res.keys) || [];
      const items = [];
      for (const k of keys) { try { const r = await store.get(k); if (r && r.value) items.push(JSON.parse(r.value)); } catch (e) {} }
      items.sort((a, b) => (b.savedAt || 0) - (a.savedAt || 0));
      setSaved(items);
    } catch (e) {}
  };
  useEffect(() => { refresh(); }, []);
  const flash = (m) => { setMsg(m); setTimeout(() => setMsg(""), 2600); };

  const saveCurrent = async () => {
    if (!store) { flash("Saving isn't available in this preview — export or share still work."); return; }
    if (!ready) { flash(t("Cast a chart first.", "पहले कुंडली बनाएँ।")); return; }
    const id = "chart:" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const name = (snapshot.form.name || "").trim() || snapshot.place.label || "Unnamed";
    const obj = { id, name, savedAt: Date.now(), form: snapshot.form, place: snapshot.place, tzOverride: snapshot.tzOverride, ayanamsa: snapshot.ayanamsa, summary: `${snapshot.form.date} ${snapshot.form.time} · ${snapshot.place.label}` };
    try { await store.set(id, JSON.stringify(obj)); flash("Saved “" + name + "”."); await refresh(); } catch (e) { flash("Save failed."); }
  };
  const remove = async (id) => { if (!store) return; try { await store.delete(id); await refresh(); flash(lang === "hi" ? "हटा दिया गया।" : "Removed."); setConfirmId(null); } catch (e) {} };
  const askRemove = (id) => {
    if (confirmId === id) { remove(id); return; }
    setConfirmId(id);
    setTimeout(() => setConfirmId((cur) => (cur === id ? null : cur)), 4000);
  };

  const copy = async (text, okMsg) => {
    try { await navigator.clipboard.writeText(text); flash(okMsg); } catch (e) { setImp(text); flash("Copy unavailable — text placed below to copy manually."); }
  };

  const exportJSON = () => {
    if (!ready) { flash(t("Cast a chart first.", "पहले कुंडली बनाएँ।")); return; }
    const data = {
      app: "Ganak", exportedAt: new Date().toISOString(),
      birth: { name: snapshot.form.name, date: snapshot.form.date, time: snapshot.form.time, place: snapshot.place.label, lat: snapshot.place.lat, lon: snapshot.place.lon, tz: result.tz, ayanamsa: snapshot.ayanamsa },
      ascendant: { sign: SIGN_SHORT[result.ascSign], degree: result.ascDeg },
      planets: result.rows.map((p) => ({ name: p.name, sign: SIGN_SHORT[p.sign], degree: p.deg, retro: !!p.retro })),
      currentDasha: result.current ? result.current.lord : null,
    };
    const text = JSON.stringify(data, null, 2);
    const fname = (snapshot.form.name || "kundli").replace(/[^\w-]+/g, "_") + "-kundli.json";
    let downloaded = false;
    try {
      const blob = new Blob([text], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = fname; document.body.appendChild(a); a.click();
      document.body.removeChild(a); URL.revokeObjectURL(url); downloaded = true;
    } catch (e) {}
    copy(text, downloaded ? t("Exported — downloaded and copied to clipboard.", "निर्यात हुआ — डाउनलोड और क्लिपबोर्ड पर कॉपी हुआ।") : t("Copied chart JSON to clipboard.", "कुंडली JSON क्लिपबोर्ड पर कॉपी हुआ।"));
  };

  const shareCode = () => {
    if (!ready) { flash(t("Cast a chart first.", "पहले कुंडली बनाएँ।")); return; }
    try {
      const code = btoa(encodeURIComponent(JSON.stringify({ form: snapshot.form, place: snapshot.place, tzOverride: snapshot.tzOverride, ayanamsa: snapshot.ayanamsa })));
      copy(code, t("Share code copied — paste into another session's Import box.", "साझा कोड कॉपी हुआ — दूसरे सत्र के इम्पोर्ट बॉक्स में पेस्ट करें।"));
    } catch (e) { flash(t("Couldn't build a share code — cast a chart first and try again.", "साझा कोड नहीं बना — पहले कुंडली बनाएँ और पुनः प्रयास करें।")); }
  };

  const importChart = () => {
    const code = imp.trim(); if (!code) { flash(t("Paste a share code first.", "पहले एक साझा कोड पेस्ट करें।")); return; }
    try {
      const obj = JSON.parse(decodeURIComponent(atob(code)));
      if (!obj.form || !obj.place) throw new Error("bad");
      onLoad(obj); setImp(""); flash(t("Chart loaded.", "कुंडली लोड हुई।"));
    } catch (e) { flash(t("That share code doesn't look right — check that you copied the whole thing and try again.", "यह साझा कोड सही नहीं लगता — देखें कि आपने पूरा कोड कॉपी किया है और पुनः प्रयास करें।")); }
  };

  const btn = (label, fn, on = true) => (
    <button onClick={fn} style={{ padding: "7px 13px", borderRadius: 7, fontFamily: "Eczar, serif", fontSize: 13, cursor: "pointer", border: `1px solid ${on ? C.gold : C.line}`, background: on ? "rgba(168,106,18,.08)" : "transparent", color: on ? C.gold : C.muted, opacity: on ? 1 : 0.55 }}>{label}</button>
  );

  return (
    <div style={{ ...card, padding: 16, marginTop: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <span style={{ fontFamily: "Eczar, serif", fontSize: 15, color: C.ivory }}>{t("Saved charts", "सहेजी हुई कुंडलियाँ")}</span>
        <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
          {btn(t("Save current", "वर्तमान सहेजें"), saveCurrent, ready)}
          {btn(t("Export JSON", "JSON निर्यात"), exportJSON, ready)}
          {btn(t("Share code", "साझा कोड"), shareCode, ready)}
        </div>
      </div>

      {saved.length > 0 ? (
        <div style={{ marginTop: 12, display: "grid", gap: 6, maxHeight: 220, overflowY: "auto" }}>
          {saved.map((c) => (
            <div key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, padding: "8px 11px", border: `1px solid ${C.line}`, borderRadius: 8 }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontFamily: "Eczar, serif", fontSize: 13.5, color: C.ivory, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.name}</div>
                <div style={{ fontSize: 11, color: C.muted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.summary}</div>
              </div>
              <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                <button onClick={() => onLoad(c)} style={{ padding: "5px 11px", borderRadius: 6, fontSize: 12.5, fontFamily: "Eczar, serif", cursor: "pointer", border: `1px solid ${C.gold}`, background: "transparent", color: C.gold }}>{t("Load", "लोड")}</button>
                <button onClick={() => askRemove(c.id)} aria-label={confirmId === c.id ? (lang === "hi" ? "पक्का हटाएँ" : "Confirm delete") : (lang === "hi" ? "हटाएँ" : "Delete")} style={{ padding: "5px 9px", borderRadius: 6, fontSize: confirmId === c.id ? 12 : 13, cursor: "pointer", border: `1px solid ${confirmId === c.id ? C.sindoor : C.line}`, background: confirmId === c.id ? "rgba(194,69,30,.08)" : "transparent", color: confirmId === c.id ? C.sindoor : C.muted, fontWeight: confirmId === c.id ? 600 : 400, whiteSpace: "nowrap" }}>{confirmId === c.id ? (lang === "hi" ? "हटाएँ?" : "Delete?") : "✕"}</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ marginTop: 10, fontSize: 12, color: C.muted, fontStyle: "italic" }}>
          {store ? t("No saved charts yet — cast one and press Save current.", "अभी कोई सहेजी कुंडली नहीं — एक बनाएँ और \"वर्तमान सहेजें\" दबाएँ।") : t("Saving isn't available in this preview. Export and Share still work here.", "इस प्रीव्यू में सहेजना उपलब्ध नहीं। निर्यात और साझा फिर भी काम करते हैं।")}
        </div>
      )}

      <div style={{ marginTop: 12, display: "flex", gap: 7, alignItems: "stretch", flexWrap: "wrap" }}>
        <input value={imp} onChange={(e) => setImp(e.target.value)} placeholder={t("Paste a share code to import…", "इम्पोर्ट हेतु साझा कोड पेस्ट करें…")} style={{ flex: 1, minWidth: 180, padding: "8px 11px", borderRadius: 7, border: `1px solid ${C.line}`, background: "#FFFDF7", color: C.ivory, fontFamily: "Spectral, serif", fontSize: 13.5 }} />
        {btn(t("Import", "इम्पोर्ट"), importChart, true)}
      </div>
      {msg && <div style={{ marginTop: 10, fontSize: 12.5, color: C.gold }}>{msg}</div>}
    </div>
  );
}



/* upcoming-occurrence search: tithi name, ekadashi/pradosh variants, festival, or fast */
function searchUpcoming(query, fromMs, tz, maxN = 24, place = null) {
  const q = (query || "").trim().toLowerCase();
  const qraw = (query || "").trim();
  if (!q) return [];
  
  const DAY = 86400000;
  const noon = (k) => { const d = new Date(fromMs + k * DAY + tz * 3600000); return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 12) - tz * 3600000; };
  
  // Check if query matches an ekadashi variant name
  let ekVariantMatch = null;
  for (const [key, names] of Object.entries(EKADASHI_NAMES)) {
    if (names.en.toLowerCase().includes(q) || names.hi.includes(qraw)) {
      ekVariantMatch = key;
      break;
    }
  }
  
  // Check if query matches a pradosh variant
  let pradoshDayMatch = null;
  for (const [dayNum, names] of Object.entries(PRADOSH_NAMES_BY_DAY)) {
    if (names.en.toLowerCase().includes(q) || names.hi.includes(qraw)) {
      pradoshDayMatch = parseInt(dayNum);
      break;
    }
  }
  
  // If ekadashi variant or pradosh variant matched, use scanPanchangCalendar which has lunar context
  if (ekVariantMatch || pradoshDayMatch !== null) {
    const r = scanPanchangCalendar(fromMs, tz, 430, 430, place);
    const out = [];
    for (const fast of r.fasts) {
      if (ekVariantMatch && fast.key === ekVariantMatch) {
        const label = EKADASHI_NAMES[ekVariantMatch].en;
        out.push({ ms: fast.ms, kind: "fast", key: fast.key, label });
      } else if (pradoshDayMatch !== null && fast.key === `pradosh_${pradoshDayMatch}`) {
        const label = PRADOSH_NAMES_BY_DAY[pradoshDayMatch].en;
        out.push({ ms: fast.ms, kind: "fast", key: fast.key, label });
      }
    }
    out.sort((a, b) => a.ms - b.ms);
    return out.slice(0, maxN);
  }
  
  // Generic tithi search
  const lowerT = TITHIS.map((t) => t.toLowerCase());
  const tIdx = lowerT.findIndex((t) => t === q || t.startsWith(q) || q.startsWith(t));
  const isPurnima = q === "purnima" || "purnima".startsWith(q) || q.includes("poornima");
  const isAmavasya = q === "amavasya" || "amavasya".startsWith(q) || q.includes("amavas");
  const out = [];
  
  let targets = [];
  if (tIdx >= 0 && tIdx <= 13) targets = [tIdx, tIdx + 15];
  else if (isPurnima) targets = [14];
  else if (isAmavasya) targets = [29];
  
  if (targets.length) {
    const nameOf = (tg) => tg === 14 ? "Purnima" : tg === 29 ? "Amavasya" : TITHIS[tg % 15];
    let prevTn = null;
    for (let k = 0; k < 430 && out.length < maxN + 2; k++) {
      const ms = noon(k), tn = Math.floor(rev(moonSidMs(ms) - sunSidMs(ms)) / 12);
      for (const tg of targets) {
        let hit = tn === tg;
        if (!hit && prevTn !== null) { const diff = (tn - prevTn + 30) % 30; for (let st = 1; st < diff; st++) if ((prevTn + st) % 30 === tg) hit = true; }
        if (hit && !out.find((o) => o._tg === tg && ms - o.ms < 20 * DAY)) out.push({ ms, kind: "tithi", label: nameOf(tg), paksha: (tg === 14 || tg === 29) ? null : (tg >= 15 ? "Krishna" : "Shukla"), _tg: tg });
      }
      prevTn = tn;
    }
    out.sort((a, b) => a.ms - b.ms);
    return out.slice(0, maxN).map((o) => ({ ms: o.ms, kind: o.kind, label: o.label, paksha: o.paksha }));
  }
  
  // Festival/fast name search (generic fasts without variants)
  const matchN = (dict, key) => { const e = dict[key]; return !!e && (key.toLowerCase().includes(q) || (e.en && e.en.toLowerCase().includes(q)) || (e.hi && e.hi.includes(qraw))); };
  const r = scanPanchangCalendar(fromMs, tz, 430, 430, place);
  for (const f of r.festivals) if (matchN(FEST_NAME, f.key)) out.push({ ms: f.ms, kind: "festival", key: f.key });
  for (const f of r.fasts) {
    // Skip if it's a variant (has underscore) - variants are handled above
    if (!f.key.includes("_") && matchN(OBS_NAME, f.key)) out.push({ ms: f.ms, kind: "fast", key: f.key });
  }
  out.sort((a, b) => a.ms - b.ms);
  return out.slice(0, maxN);
}

const EVENTS = [
  { key: "purchase", en: "New purchase", hi: "नई खरीद", good: ["labh", "amrit", "shubh"] },
  { key: "venture", en: "New venture / business", hi: "नया व्यवसाय", good: ["labh", "amrit", "shubh"] },
  { key: "puja", en: "Puja / ritual", hi: "पूजा / अनुष्ठान", good: ["amrit", "shubh", "labh"] },
  { key: "travel", en: "Travel", hi: "यात्रा", good: ["char", "labh", "amrit", "shubh"] },
  { key: "housewarming", en: "Housewarming", hi: "गृह प्रवेश", good: ["amrit", "shubh", "labh"] },
  { key: "wedding", en: "Wedding-related", hi: "विवाह संबंधी", good: ["amrit", "shubh", "labh"] },
];


/* Free-text muhurat search was removed in v1 (chips + date range instead) — the
   AI-parse path needed an API key the web build can't hold. It returns via the
   backend proxy: see plans/backlog.md item 4. */

function VratVidhiCard({ data, lang, C }) {
  const [open, setOpen] = useState(false);
  if (!data) return null;
  const L = lang === "hi" ? "hi" : "en";
  const lbl = (k) => VRAT_VIDHI_LABELS[k][L];
  const txt = (obj) => (obj && (obj[L] || obj.en)) || "";
  const section = (title, body) => (
    <div style={{ marginTop: 8 }}>
      <div style={{ ...T.label, color: C.gold, marginBottom: 3 }}>{title}</div>
      <div style={{ fontSize: T.fSmall, color: C.ivory, lineHeight: 1.55 }}>{body}</div>
    </div>
  );
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      style={{ marginTop: 8, width: "100%", boxSizing: "border-box", border: `1px solid ${C.line}`, borderRadius: T.rMd, background: "#FFFDF7", overflow: "hidden" }}
    >
      <div style={{ padding: "9px 11px", fontSize: T.fSmall, color: C.ivory, lineHeight: 1.5, fontWeight: 600 }}>
        {txt(data.verdict)}
      </div>
      <button
        type="button"
        aria-expanded={open}
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        style={{ width: "100%", minHeight: T.ctrlH, boxSizing: "border-box", padding: "0 11px", border: "none", borderTop: `1px solid ${C.line}`, background: open ? "rgba(168,106,18,.06)" : "transparent", color: C.gold, cursor: "pointer", fontFamily: T.serif, fontSize: T.fSmall, fontWeight: 500, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, textAlign: "left" }}
      >
        <span>{open ? lbl("hideHowTo") : lbl("showHowTo")}</span>
        <span aria-hidden="true" style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .15s", flexShrink: 0 }}>▾</span>
      </button>
      {open && (
        <div style={{ padding: "10px 11px 12px", borderTop: `1px solid ${C.line}`, display: "flex", flexDirection: "column", gap: 2 }}>
          <div style={{ padding: "7px 9px", borderRadius: T.rSm, background: "rgba(194,69,30,.06)", border: "1px solid rgba(194,69,30,.18)" }}>
            <div style={{ ...T.label, color: C.sindoor, marginBottom: 3 }}>{lbl("safety")}</div>
            <div style={{ fontSize: T.fMicro, color: C.muted, lineHeight: 1.5 }}>{txt(VRAT_VIDHI_SAFETY)}</div>
          </div>
          {section(lbl("vidhi"), (
            <ol style={{ margin: 0, paddingLeft: 18 }}>
              {(data.vidhi || []).map((step, i) => (
                <li key={i} style={{ marginBottom: 4 }}>{txt(step)}</li>
              ))}
            </ol>
          ))}
          {section(lbl("diet"), (
            data.dietAvoid || data.dietLighter ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {data.dietAvoid && <div><span style={{ color: C.sindoor, fontWeight: 600 }}>{lbl("avoid")}: </span>{txt(data.dietAvoid)}</div>}
                {data.dietLighter && <div><span style={{ color: "#1F7A4D", fontWeight: 600 }}>{lbl("lighter")}: </span>{txt(data.dietLighter)}</div>}
              </div>
            ) : txt(data.diet)
          ))}
          {section(lbl("sankalpa"), <span style={{ fontStyle: "italic" }}>{txt(data.sankalpa)}</span>)}
          {section(lbl("puja"), txt(data.puja))}
          {section(lbl("paran"), txt(data.paran))}
          {section(lbl("udyapan"), txt(data.udyapan))}
        </div>
      )}
    </div>
  );
}

function MuhuratHub({ todayP, place, lang, ayanamsa = "lahiri", isToday = true, onCal = () => {}, C, card }) {
  const tz = todayP.tz;
  const nowMs = isToday ? Date.now() : null;
  const lp = useMemo(() => { try { return computeLagnaPanchaka(place, ayanamsa, todayP.anchor); } catch (e) { return { lagnaSchedule: [], panchakaWindows: [], tz }; } }, [place, ayanamsa, todayP.anchor, tz]);
  const curLagnaW = isToday && nowMs != null ? (lp.lagnaSchedule || []).find((w) => nowMs >= w.start && nowMs < w.end) : null;
  const curPanchW = isToday && nowMs != null ? (lp.panchakaWindows || []).find((w) => nowMs >= w.start && nowMs < w.end) : null;
  const [evKey, setEvKey] = useState("purchase");
  const [tab, setTab] = useState("fasting");
  const [fq, setFq] = useState("");
  const [fexp, setFexp] = useState(null);
  const fexpDetail = useMemo(() => { if (!fexp) return null; try { return vratDetail(place, ayanamsa, fexp.ms, fexp.timing); } catch (e) { return null; } }, [fexp, place, ayanamsa]);
  const [horaQuestion, setHoraQuestion] = useState("");
  const [horaResult, setHoraResult] = useState(null);
  const [horaAsc, setHoraAsc] = useState(null);
  const [horaSel, setHoraSel] = useState(null);
  const [showPanch, setShowPanch] = useState(false);
  const [dragMs, setDragMs] = useState(null);  // dragged time on arc
  const isoAtOffset = (days) => new Date(Date.now() + tz * 3600000 + days * 86400000).toISOString().slice(0, 10);
  const [mfCat, setMfCat] = useState(null);
  const [mfFrom, setMfFrom] = useState(isoAtOffset(0));
  const [mfTo, setMfTo] = useState(isoAtOffset(90));
  const [mfPreset, setMfPreset] = useState("90");
  const [mfErr, setMfErr] = useState(null);
  const [mfBusy, setMfBusy] = useState(false);
  const [ans, setAns] = useState(null);
  const finderTopPanchaka = useMemo(() => { try { if (!ans || !ans.days) return null; const top = ans.days.filter((d) => d.valid)[0]; return top ? computeLagnaPanchaka(place, "lahiri", top.rise) : null; } catch (e) { return null; } }, [ans, place]);
  const mfYmd = (iso) => { const [y, m, d] = iso.split("-").map(Number); return { y, m, d }; };
  // Previous results stay on screen until the new ones replace them — the app
  // never blanks the user's answer without a finished user action.
  const findDays = (fromIso, toIso, catKey) => {
    const cat = catKey || mfCat;
    if (!cat || mfBusy) return;
    setMfErr(null);
    const from = mfYmd(fromIso || mfFrom), to = mfYmd(toIso || mfTo);
    if (Date.UTC(from.y, from.m - 1, from.d) > Date.UTC(to.y, to.m - 1, to.d)) {
      setMfErr(lang === "hi" ? "प्रारम्भ तिथि, अन्तिम तिथि के बाद है — कृपया सुधारें।" : "The start date is after the end date — please fix the range.");
      return;
    }
    setMfBusy(true);
    setTimeout(() => {
      try {
        const dd = muhuratScanRange(place, "lahiri", from, to, cat);
        setAns({ category: cat, days: dd, from: fromIso || mfFrom, to: toIso || mfTo });
      } catch (e) {
        if (typeof console !== "undefined") console.error("muhurat scan failed:", e);
        setMfErr(lang === "hi" ? "गणना नहीं हो सकी — कृपया छोटी अवधि आज़माएँ या पुनः प्रयास करें।" : "Couldn't complete the search — try a shorter date range or try again.");
      } finally {
        setMfBusy(false);
      }
    }, 30);
  };
  const cal = useMemo(() => { try { return scanPanchangCalendar(todayP.anchor, tz, 400, 46, place); } catch (e) { return { fasts: [], festivals: [] }; } }, [todayP.anchor, tz, place]);
  const [trad, setTrad] = useState("smarta");
  useEffect(() => { let alive = true; (async () => { try { const st = (typeof window !== "undefined" && window.storage) ? window.storage : null; if (st) { const r = await st.get("janma_trad"); if (alive && r && r.value) setTrad(r.value); } } catch (e) {} })(); return () => { alive = false; }; }, []);
  const chooseTrad = (v) => { setTrad(v); try { const st = (typeof window !== "undefined" && window.storage) ? window.storage : null; if (st) st.set("janma_trad", v); } catch (e) {} };
  const effFasts = useMemo(() => {
    if (trad !== "vaishnava") return cal.fasts;
    try {
      return cal.fasts.map((f) => {
        if (obsKind(f.key) !== "ekadashi") return f;
        const v = vaishnavaEkadashiDay(place, ayanamsa, f.ms);
        return { ...f, ms: v.ms, shifted: v.shifted, reason: v.reason };
      }).sort((a, b) => a.ms - b.ms);
    } catch (e) { return cal.fasts; }
  }, [cal, trad, place, ayanamsa]);
  const fmtT = (ms) => fmtTime(ms, tz);
  const fmtDay = (ms) => new Date(ms + tz * 3600000).toLocaleDateString(lang === "hi" ? "hi-IN" : "en-IN", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
  const natColor = (nat) => nat === "good" ? "#1F7A4D" : nat === "bad" ? C.sindoor : C.gold;
  const inWin = (w) => isToday && w && nowMs >= w.start && nowMs < w.end;

  // current choghadiya + auspicious/avoid state right now
  const allChogha = [...(todayP.choghaDay || []), ...(todayP.choghaNight || [])];
  const curChogha = allChogha.find((c) => inWin(c));
  const inAvoid = inWin(todayP.rahu) || inWin(todayP.yama) || inWin(todayP.gulika);
  const inAbhijit = inWin(todayP.abhijit);
  const nowState = inAbhijit ? "good" : inAvoid ? "bad" : curChogha ? curChogha.nat : "neutral";

  const ev = EVENTS.find((e) => e.key === evKey);
  const goodSlots = allChogha.filter((c) => ev.good.includes(c.key) && c.end > nowMs).slice(0, 6);
  const avoidSlots = [["rahu", todayP.rahu], ["gulika", todayP.gulika], ["yama", todayP.yama]].filter(([, w]) => w && w.end > nowMs);

  const Row = ({ label, children, color }) => (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "7px 2px", borderBottom: "1px solid #F1EADA", fontSize: 13.5, alignItems: "baseline" }}>
      <span style={{ ...T.label, color: C.muted }}>{label}</span>
      <span style={{ textAlign: "right", color: color || C.ivory, fontVariantNumeric: "tabular-nums" }}>{children}</span>
    </div>
  );
  const pill = (txt, color) => <span style={{ fontSize: 11, padding: "2px 9px", borderRadius: 11, background: color + "20", color, fontFamily: "Eczar, serif" }}>{txt}</span>;
  const SecHead = ({ deva, en, right }) => (
    <div style={{ display: "flex", alignItems: "baseline", gap: T.s3, margin: `${T.s6}px 0 ${T.s3}px`, borderBottom: `1px solid ${C.line}`, paddingBottom: T.s2 }}>
      <span style={{ fontFamily: T.serif, color: C.gold, fontSize: T.fTitle }}>{deva}</span>
      <span style={{ ...T.label, color: C.muted }}>{en}</span>
      {right ? <span style={{ marginLeft: "auto" }}>{right}</span> : null}
    </div>
  );

  return (
    <div>
      {/* ===== TODAY SUMMARY (primary, plain-language) ===== */}
      {(() => {
        const p = todayP, DAY = 86400000, dayStart = p.anchor;
        const L2 = lang === "hi" ? "hi" : "en";
        const obs = observancesFor(p.krishna, p.tithiNum, null, p.dow);
        const OBS_GLOSS = { ekadashi: { en: "Fasting day for Vishnu", hi: "विष्णु का व्रत" }, purnima: { en: "Full moon", hi: "पूर्ण चंद्र" }, amavasya: { en: "New moon", hi: "नवचंद्र" }, pradosh: { en: "Evening fast for Shiva", hi: "शिव संध्या व्रत" }, sankashti: { en: "Fast for Ganesha", hi: "गणेश व्रत" }, masikShivaratri: { en: "Monthly Shivaratri", hi: "मासिक शिवरात्रि" }, kalashtami: { en: "Kala Bhairava day", hi: "काल भैरव दिवस" } };
        const fastObs = obs.find((o) => o.fasting) || obs[0];
        const nkIdx = NAKSHATRAS.indexOf(p.naks[0].name), nkLord = nkIdx >= 0 ? VIM_LORDS[nkIdx % 9] : null;
        const nextFast = (effFasts || []).find((f) => f.ms >= dayStart);
        const nextFest = (cal.festivals || []).find((f) => f.ms >= dayStart);
        const away = (ms) => { const d = Math.round((ms - dayStart) / DAY); return d <= 0 ? (lang === "hi" ? "आज" : "today") : d === 1 ? (lang === "hi" ? "कल" : "tomorrow") : (lang === "hi" ? d + " दिन में" : "in " + d + " days"); };
        const goodW = [["abhijit", p.abhijit]].filter((x) => x[1]);
        const avoidW = [["rahu", p.rahu], ["gulika", p.gulika], ["yama", p.yama]].filter((x) => x[1]);
        const winName = { abhijit: { en: "Abhijit Muhurat", hi: "अभिजित मुहूर्त" }, rahu: { en: "Rahu Kalam", hi: "राहु काल" }, gulika: { en: "Gulika Kalam", hi: "गुलिक काल" }, yama: { en: "Yamaganda", hi: "यमगण्ड" } };
        const dObj = new Date(dayStart + tz * 3600000);
        return (
          <div className="rise" style={{ ...card, padding: 0, overflow: "hidden", marginBottom: T.s4 }}>
            <div style={{ background: "linear-gradient(135deg, #FCF4E0, #F5E8CD)", padding: T.s4 + "px " + T.s5 + "px " + T.s3 + "px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, flexWrap: "wrap" }}>
                <div>
                  <div style={{ ...T.label, color: C.muted }}>{lang === "hi" ? "आज" : "Today"}</div>
                  <div style={{ fontFamily: T.serif, fontSize: T.fDisplay, color: C.ivory, lineHeight: 1.1 }}>{dObj.toLocaleDateString(L2 === "hi" ? "hi-IN" : "en-IN", { weekday: "long", timeZone: "UTC" })}</div>
                  <div style={{ fontSize: T.fSmall, color: C.muted, marginTop: 2 }}>{dObj.toLocaleDateString(L2 === "hi" ? "hi-IN" : "en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })}{p.months ? " · " + p.months.amanta : ""}</div>
                </div>
                {isToday && <span style={{ fontSize: T.fSmall, padding: "5px 12px", borderRadius: T.rPill, background: natColor(nowState) + "1F", color: natColor(nowState), fontFamily: T.serif, fontWeight: 600, whiteSpace: "nowrap" }}>{nowState === "good" ? tr(lang, "auspiciousNow") : nowState === "bad" ? tr(lang, "cautionNow") : tr(lang, "neutralNow")}</span>}
              </div>
            </div>
            <div style={{ padding: T.s3 + "px " + T.s5 + "px", borderTop: "1px solid " + C.line }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 }}>
                <span style={{ fontFamily: T.serif, fontSize: T.fHeading, color: C.gold }}>{p.tithis[0].name}</span>
                <span style={{ fontSize: T.fMicro, color: C.muted, fontVariantNumeric: "tabular-nums" }}>{p.tithis[0].end ? (lang === "hi" ? "तक " : "till ") + fmtT(p.tithis[0].end) : ""}</span>
              </div>
              <div style={{ fontSize: T.fSmall, color: C.muted, marginTop: 2 }}>{p.paksha} · {lang === "hi" ? (p.krishna ? "कृष्ण (क्षीयमान)" : "शुक्ल (वर्धमान)") : (p.krishna ? "waning moon" : "waxing moon")} · {lang === "hi" ? "चंद्र दिवस " + p.tithiNum : "lunar day " + p.tithiNum}</div>
              {obs.length > 0 && <div style={{ marginTop: 8, display: "inline-flex", alignItems: "center", gap: 7, padding: "5px 11px", borderRadius: T.rMd, background: fastObs.fasting ? "rgba(194,69,30,.08)" : "rgba(168,106,18,.08)", border: "1px solid " + (fastObs.fasting ? C.sindoor : C.gold) + "33" }}>
                <span style={{ fontSize: T.fSmall, fontWeight: 600, color: fastObs.fasting ? C.sindoor : C.gold }}>{obsLabel(lang, fastObs)}</span>
                {OBS_GLOSS[fastObs.baseKey || fastObs.key] && <span style={{ fontSize: T.fMicro, color: C.muted }}>· {OBS_GLOSS[fastObs.baseKey || fastObs.key][L2]}</span>}
              </div>}
              {p.pitruPaksha && (() => {
                const pp = p.pitruPaksha;
                const SP = { mahalaya: { en: "Sarva Pitru Amavasya (Mahalaya)", hi: "सर्वपितृ अमावस्या (महालय)" }, purnimaShraddha: { en: "Purnima Shraddha — Pitru Paksha begins", hi: "पूर्णिमा श्राद्ध — पितृ पक्ष आरंभ" }, avidhavaNavami: { en: "Avidhava Navami", hi: "अविधवा नवमी" }, ghataChaturdashi: { en: "Ghata Chaturdashi", hi: "घट चतुर्दशी" } };
                const tithiName = pp.krishna ? (TITHIS[(pp.shraddhaTithi - 1) % 14] || "") : "Purnima";
                const label = pp.special ? SP[pp.special][L2] : (lang === "hi" ? tithiName + " श्राद्ध" : tithiName + " Shraddha");
                return (
                  <div style={{ marginTop: 8, padding: "7px 11px", borderRadius: T.rMd, background: "rgba(120,90,60,.07)", border: "1px solid " + C.line }}>
                    <div style={{ fontSize: T.fSmall, fontWeight: 600, color: C.ivory }}>{lang === "hi" ? "पितृ पक्ष · " : "Pitru Paksha · "}{label}</div>
                    <div style={{ fontSize: T.fMicro, color: C.muted, marginTop: 2 }}>{lang === "hi" ? "श्राद्ध व तर्पण का पक्ष — विवाह, गृह प्रवेश आदि शुभ कार्य वर्जित" : "Fortnight for shraddha & tarpan — weddings, housewarming & other auspicious work are avoided"}</div>
                  </div>
                );
              })()}
              {p.ayyappaMandala && (() => {
                const av = p.ayyappaMandala, finalDay = av.day === 41;
                return (
                  <div style={{ marginTop: 8, padding: "7px 11px", borderRadius: T.rMd, background: "rgba(194,69,30,.06)", border: "1px solid rgba(194,69,30,.2)" }}>
                    <div style={{ fontSize: T.fSmall, fontWeight: 600, color: C.ivory }}>
                      {lang === "hi" ? `अय्यप्पा मंडल व्रतम · 41 में से दिन ${av.day}` : `Ayyappa Mandala Vratham · day ${av.day} of 41`}
                      {finalDay ? (lang === "hi" ? " · मंडल पूजा" : " · Mandala Pooja") : ""}
                    </div>
                    <div style={{ fontSize: T.fMicro, color: C.muted, marginTop: 2 }}>
                      {lang === "hi" ? "सरल सात्त्विक जीवन, दैनिक प्रार्थना व संयम — विस्तृत नियम गुरु स्वामी या मंदिर परंपरा से लें" : "Simple sattvic living, daily prayer and restraint — follow a Guru Swami or temple tradition for the full discipline"}
                    </div>
                  </div>
                );
              })()}
            </div>
            <div style={{ padding: T.s3 + "px " + T.s5 + "px", borderTop: "1px solid " + C.line }}>
              <div style={{ ...T.label, color: C.muted, marginBottom: 7 }}>{lang === "hi" ? "आज के शुभ व अशुभ समय" : "Good & avoid times today"}</div>
              {goodW.map((x) => <div key={x[0]} style={{ display: "flex", alignItems: "center", gap: 8, padding: "3px 0", fontVariantNumeric: "tabular-nums" }}>
                <span style={{ color: "#1F7A4D", fontSize: T.fSmall, fontWeight: 700 }}>✓</span>
                <span style={{ flex: 1, fontSize: T.fSmall, color: C.ivory }}>{winName[x[0]][L2]}</span>
                <span style={{ fontSize: T.fSmall, color: C.muted }}>{fmtT(x[1].start)}–{fmtT(x[1].end)}</span>
              </div>)}
              {avoidW.map((x) => <div key={x[0]} style={{ display: "flex", alignItems: "center", gap: 8, padding: "3px 0", fontVariantNumeric: "tabular-nums" }}>
                <span style={{ color: C.sindoor, fontSize: T.fSmall, fontWeight: 700 }}>✗</span>
                <span style={{ flex: 1, fontSize: T.fSmall, color: C.ivory }}>{winName[x[0]][L2]}</span>
                <span style={{ fontSize: T.fSmall, color: C.muted }}>{fmtT(x[1].start)}–{fmtT(x[1].end)}</span>
              </div>)}
              {isToday && curChogha && <div style={{ fontSize: T.fMicro, color: C.muted, marginTop: 6 }}>{lang === "hi" ? "अभी चौघड़िया: " : "Now: "}<span style={{ color: natColor(curChogha.nat), fontWeight: 600 }}>{trN(lang, CHOG_NAME, curChogha.key)}</span></div>}
              {isToday && curLagnaW && <div style={{ fontSize: T.fMicro, color: C.muted, marginTop: 4 }}>{lang === "hi" ? "उदय लग्न: " : "Udaya Lagna: "}<span style={{ color: C.ivory }}>{SIGNS[curLagnaW.sign]}</span>{curPanchW && <> · {lang === "hi" ? "पञ्चक: " : "Panchaka: "}<span style={{ color: curPanchW.shubha ? "#1F7A4D" : C.sindoor, fontWeight: 600 }}>{trN(lang, PANCHAKA_NAME, curPanchW.type)}{curPanchW.shubha ? " ✓" : " ✗"}</span></>}</div>}
            </div>
            <div style={{ padding: T.s3 + "px " + T.s5 + "px", borderTop: "1px solid " + C.line, display: "flex", flexWrap: "wrap", gap: "6px " + T.s5 + "px" }}>
              <div style={{ flex: "1 1 130px" }}>
                <div style={{ fontSize: T.fMicro, color: C.muted }}>☀ {lang === "hi" ? "सूर्य" : "Sun"}</div>
                <div style={{ fontSize: T.fSmall, color: C.ivory, fontVariantNumeric: "tabular-nums" }}>{p.rise ? fmtT(p.rise) : "—"} → {p.set ? fmtT(p.set) : "—"}</div>
              </div>
              <div style={{ flex: "1 1 130px" }}>
                <div style={{ fontSize: T.fMicro, color: C.muted }}>☾ {lang === "hi" ? "चंद्र" : "Moon"}</div>
                <div style={{ fontSize: T.fSmall, color: C.ivory, fontVariantNumeric: "tabular-nums" }}>{p.moonrise ? fmtT(p.moonrise) : "—"} → {p.moonset ? fmtT(p.moonset) : "—"}</div>
              </div>
              <div style={{ flex: "1 1 100%" }}>
                <div style={{ fontSize: T.fMicro, color: C.muted }}>✦ {lang === "hi" ? "नक्षत्र" : "Nakshatra"}</div>
                <div style={{ fontSize: T.fSmall, color: C.ivory }}>{p.naks[0].name}{nkLord ? " · " + (lang === "hi" ? "स्वामी " : "ruler ") + trN(lang, HORA_NAME, nkLord) : ""}{p.naks[0].end ? " · " + (lang === "hi" ? "तक " : "till ") + fmtT(p.naks[0].end) : ""}</div>
              </div>
            </div>
            {(nextFast || nextFest) && <div style={{ padding: T.s3 + "px " + T.s5 + "px", borderTop: "1px solid " + C.line, background: "rgba(168,106,18,.04)" }}>
              <div style={{ ...T.label, color: C.muted, marginBottom: 6 }}>{lang === "hi" ? "आगामी" : "Coming up"}</div>
              {nextFast && <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "2px 0" }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: C.sindoor, flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: T.fSmall, color: C.ivory }}>{obsLabel(lang, { key: nextFast.key, baseKey: nextFast.key })}</span>
                <span style={{ fontSize: T.fMicro, color: C.gold, fontWeight: 600 }}>{away(nextFast.ms)}</span>
              </div>}
              {nextFest && <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "2px 0" }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: C.gold, flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: T.fSmall, color: C.ivory }}>{trN(lang, FEST_NAME, nextFest.key)}</span>
                <span style={{ fontSize: T.fMicro, color: C.gold, fontWeight: 600 }}>{away(nextFest.ms)}</span>
              </div>}
            </div>}
            <button type="button" onClick={() => setShowPanch((v) => !v)} style={{ width: "100%", padding: "11px", border: "none", borderTop: "1px solid " + C.line, background: "transparent", color: C.gold, cursor: "pointer", fontFamily: T.serif, fontSize: T.fSmall, fontWeight: 500 }}>
              {showPanch ? (lang === "hi" ? "पंचांग छिपाएँ ▴" : "Hide full panchang ▴") : (lang === "hi" ? "पूरा पंचांग देखें ▾" : "View full panchang ▾")}
            </button>
          </div>
        );
      })()}

      {showPanch && todayP && (() => {
        const P = todayP, ptz = P.tz, A = P.anchor;
        const upto = (name, end) => <>{name} <span style={{ color: C.muted }}>upto</span> <span style={{ color: C.gold }}>{fmtTimeD(end, ptz, A)}</span></>;
        const multi = (entries) => (
          <span style={{ display: "inline-flex", flexDirection: "column", gap: 3, alignItems: "flex-end" }}>
            {(Array.isArray(entries) ? entries : []).map((e3, k) => <span key={k}>{upto(e3.name, e3.end)}</span>)}
          </span>
        );
        const span2 = (w, color) => w ? <span style={{ color, fontVariantNumeric: "tabular-nums" }}>{fmtTime(w.start, ptz)} – {fmtTime(w.end, ptz)}</span> : "—";
        const rows = [];
        rows.push(["Sunrise", <span style={{ color: C.gold }}>{fmtTime(P.rise, ptz)}</span>]);
        rows.push(["Sunset", <span style={{ color: C.gold }}>{fmtTime(P.set, ptz)}</span>]);
        rows.push(["Moonrise", P.moonrise ? <span style={{ color: C.gold }}>{fmtTime(P.moonrise, ptz)}</span> : "—"]);
        rows.push(["Moonset", P.moonset ? <span style={{ color: C.gold }}>{fmtTime(P.moonset, ptz)}</span> : "—"]);
        rows.push(["Tithi", multi(P.tithis)]);
        rows.push(["Nakshatra", multi(P.naks)]);
        rows.push(["Yoga", multi(P.yogasP)]);
        rows.push([lang === "hi" ? "करण (तिथि का आधा भाग)" : "Karana (half of a tithi)", multi(P.karanas)]);
        rows.push(["Paksha", P.paksha]);
        rows.push(["Weekday", P.vara]);
        rows.push(["Amanta Month", P.months.amanta]);
        rows.push(["Purnimanta Month", P.months.purnimanta]);
        rows.push(["Moonsign", P.moonSignEnd ? upto(P.moonSign, P.moonSignEnd) : P.moonSign]);
        rows.push(["Sunsign", P.sunSign]);
        rows.push([lang === "hi" ? "प्रविष्टे (सौर मास में बीते दिन)" : "Pravishte (days into the solar month)", String(P.pravishte)]);
        rows.push([lang === "hi" ? "शक संवत् (राष्ट्रीय पंचांग वर्ष)" : "Shaka Samvat (national calendar year)", P.samvat.shaka]);
        rows.push([lang === "hi" ? "विक्रम संवत् (उत्तर भारतीय पंचांग वर्ष)" : "Vikram Samvat (north Indian calendar year)", P.samvat.vikram]);
        rows.push([lang === "hi" ? "गुजराती संवत् (गुजराती पंचांग वर्ष)" : "Gujarati Samvat (Gujarati calendar year)", P.samvat.guj]);
        rows.push(["Abhijit Muhurat", P.abhijit ? span2(P.abhijit, C.gold) : <span style={{ color: C.muted }}>None — avoided on Budhavara</span>]);
        rows.push(["Rahu Kalam", span2(P.rahu, C.sindoor)]);
        rows.push(["Gulikai Kalam", span2(P.gulika, C.sindoor)]);
        rows.push(["Yamaganda", span2(P.yama, C.sindoor)]);
        return (
          <>
          <div className="rise" style={{ ...card, padding: "18px 20px", marginBottom: T.s4 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: T.s3, marginBottom: 10, borderBottom: `1px solid ${C.line}`, paddingBottom: T.s3 }}>
              <span style={{ fontFamily: T.serif, color: C.gold, fontSize: T.fHeading }}>विस्तृत पञ्चाङ्ग</span>
              <span style={{ ...T.label, color: C.muted }}>Full panchang</span>
            </div>
            <div style={{ marginBottom: 14 }}>
              <span style={{ fontFamily: T.serif, fontSize: 16, color: C.gold }}>{P.dateLabel}</span>
              {place && place.label ? <span style={{ fontSize: 13, color: C.muted }}> · {place.label}</span> : null}
            </div>
            <div style={{ borderTop: `1px solid ${C.line}` }}>
              {rows.map(([k, v], idx) => (
                <div key={k + idx} style={{ display: "flex", justifyContent: "space-between", gap: 14, padding: "8px 2px", borderBottom: `1px solid #F1EADA`, fontSize: 14, alignItems: "baseline" }}>
                  <span style={{ color: C.muted, whiteSpace: "nowrap" }}>{k}</span>
                  <span style={{ textAlign: "right", overflowWrap: "anywhere" }}>{v}</span>
                </div>
              ))}
            </div>
            <p style={{ color: C.muted, fontSize: 11.5, margin: "12px 0 0" }}>Panchang day reckoned from local sunrise · times accurate to ±3 minutes</p>
          </div>

          <div className="rise" style={{ ...card, padding: "16px 20px", marginBottom: T.s4 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: T.s3, marginBottom: 8, borderBottom: `1px solid ${C.line}`, paddingBottom: T.s3 }}>
              <span style={{ fontFamily: T.serif, color: C.gold, fontSize: T.fHeading }}>चौघड़िया</span>
              <span style={{ ...T.label, color: C.muted }}>Choghadiya</span>
            </div>
            <div style={{ fontSize: T.fMicro, color: C.muted, marginBottom: 8 }}>{lang === "hi" ? "घंटे-दर-घंटे शुभ/अशुभ समय" : "Hour-by-hour good & avoid times"}</div>
            {[["dayChogha", todayP.choghaDay], ["nightChogha", todayP.choghaNight]].map(([lbl, slots]) => slots && (
              <div key={lbl} style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 12, color: C.muted, marginBottom: 5 }}>{tr(lang, lbl)}</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(108px, 1fr))", gap: 6 }}>
                  {slots.map((c, i) => {
                    const live = inWin(c);
                    return (
                      <div key={i} style={{ ...card, borderRadius: T.rSm, padding: "8px 10px", borderLeft: `3px solid ${natColor(c.nat)}`, background: live ? natColor(c.nat) + "12" : undefined }}>
                        <div style={{ fontFamily: "Eczar, serif", fontSize: 13.5, color: natColor(c.nat) }}>{trN(lang, CHOG_NAME, c.key)}{live && " ●"}</div>
                        <div style={{ fontSize: 10.5, color: C.muted, fontVariantNumeric: "tabular-nums" }}>{fmtT(c.start)}–{fmtT(c.end)}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <div className="rise" style={{ ...card, padding: "16px 20px", marginBottom: T.s4 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: T.s3, marginBottom: 6, borderBottom: `1px solid ${C.line}`, paddingBottom: T.s3 }}>
              <span style={{ fontFamily: T.serif, color: C.gold, fontSize: T.fHeading }}>उदय लग्न</span>
              <span style={{ ...T.label, color: C.muted }}>Udaya Lagna</span>
            </div>
            <div style={{ fontSize: T.fMicro, color: C.muted, marginBottom: 8 }}>{lang === "hi" ? "सूर्योदय से अगले सूर्योदय तक प्रत्येक राशि का उदयकाल" : "Each rising sign, sunrise to next sunrise"}</div>
            {(lp.lagnaSchedule || []).map((w, i) => {
              const live = isToday && nowMs != null && nowMs >= w.start && nowMs < w.end;
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 2px", borderBottom: "1px solid #F1EADA", flexWrap: "wrap", background: live ? "rgba(168,106,18,.06)" : undefined }}>
                  <span style={{ flex: "1 1 auto", fontFamily: T.serif, fontSize: 14.5, color: C.ivory }}>{SIGNS[w.sign]}{live ? " ●" : ""}</span>
                  <span style={{ fontSize: T.fSmall, color: C.muted, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>{fmtTime(w.start, lp.tz)} – {fmtTime(w.end, lp.tz)}</span>
                  <span style={{ flex: "0 0 66px", textAlign: "right", fontSize: T.fMicro, fontWeight: 600, color: w.shubha ? "#1F7A4D" : C.sindoor }}>{trN(lang, PANCHAKA_SHORT, w.type)}</span>
                </div>
              );
            })}
          </div>

          <div className="rise" style={{ ...card, padding: "16px 20px", marginBottom: T.s4 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: T.s3, marginBottom: 6, borderBottom: `1px solid ${C.line}`, paddingBottom: T.s3 }}>
              <span style={{ fontFamily: T.serif, color: C.gold, fontSize: T.fHeading }}>पञ्चक रहित मुहूर्त</span>
              <span style={{ ...T.label, color: C.muted }}>Panchaka Rahita</span>
            </div>
            <div style={{ fontSize: T.fMicro, color: C.muted, marginBottom: 8 }}>{lang === "hi" ? "शुभ (दोषरहित) व पञ्चक-दोष काल" : "Auspicious (blemish-free) vs Panchaka-dosha windows"}</div>
            {(lp.panchakaWindows || []).map((w, i) => {
              const live = isToday && nowMs != null && nowMs >= w.start && nowMs < w.end;
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 9, padding: "8px 2px", borderBottom: "1px solid #F1EADA", background: live ? "rgba(168,106,18,.06)" : undefined }}>
                  <span style={{ flexShrink: 0, width: 7, height: 7, borderRadius: "50%", background: w.shubha ? "#1F7A4D" : C.sindoor }} />
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: T.fSmall, color: w.shubha ? "#1F7A4D" : C.sindoor, fontWeight: 600 }}>{trN(lang, PANCHAKA_NAME, w.type)}</span>
                    {live && <span style={{ fontSize: T.fMicro, color: C.gold }}> ● {lang === "hi" ? "अभी" : "now"}</span>}
                    <span style={{ display: "block", fontSize: T.fMicro, color: C.muted }}>{trN(lang, PANCHAKA_GLOSS, w.type)}</span>
                  </span>
                  <span style={{ fontSize: T.fSmall, color: C.muted, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>{fmtTime(w.start, lp.tz)} – {fmtTime(w.end, lp.tz)}</span>
                </div>
              );
            })}
            <p style={{ color: C.muted, fontSize: T.fMicro, margin: "10px 0 0", lineHeight: 1.5, fontStyle: "italic" }}>{lang === "hi" ? "विवाह, गृहप्रवेश आदि हेतु शुभ (पञ्चक रहित) काल चुनें।" : "For marriage, housewarming etc., choose Shubha (Rahita) windows."}</p>
          </div>
          </>
        );
      })()}

      {/* festivals & fasting */}
      <SecHead deva="व्रत एवं पर्व" en="Fasts & festivals" right={tab === "fasting" ? (
        <span style={{ display: "inline-flex", gap: 4 }}>
          {[["smarta", lang === "hi" ? "स्मार्त" : "Smarta"], ["vaishnava", "ISKCON"]].map(([v, l]) => (
            <button key={v} onClick={() => { chooseTrad(v); setFexp(null); }} style={{ fontSize: T.fMicro, padding: "3px 9px", borderRadius: T.rPill, border: `1px solid ${trad === v ? C.gold : C.line}`, background: trad === v ? "rgba(168,106,18,.1)" : "transparent", color: trad === v ? C.gold : C.muted, cursor: "pointer" }}>{l}</button>
          ))}
        </span>
      ) : null} />
      <div style={{ ...card, padding: 0, overflow: "hidden" }}>
        <div style={{ display: "flex", gap: 6, padding: "10px 12px 6px" }}>
          {[["fasting", "fastingTab"], ["festival", "festivalTab"]].map(([k, lbl]) => (
            <button key={k} onClick={() => { setTab(k); setFexp(null); }} style={{ padding: "6px 14px", borderRadius: T.rPill, fontFamily: "Eczar, serif", fontSize: 13, cursor: "pointer", border: `1px solid ${tab === k ? C.gold : "transparent"}`, background: tab === k ? "rgba(168,106,18,.1)" : "transparent", color: tab === k ? C.gold : C.muted }}>{tr(lang, lbl)}</button>
          ))}
        </div>
        {tab === "fasting" && trad === "vaishnava" && (
          <div style={{ fontSize: 11.5, color: C.muted, padding: "0 12px 8px", fontStyle: "italic", lineHeight: 1.45 }}>
            {lang === "hi" ? "ISKCON (वैष्णव) तिथियों में कुछ एकादशी व्रत एक दिन बाद पड़ सकते हैं।" : "ISKCON (Vaishnava) dates may fall a day later for some Ekadashi fasts."}
          </div>
        )}
        {(() => {
          const items = (tab === "fasting" ? effFasts : cal.festivals).slice(0, 10);
          if (!items.length) return <div style={{ padding: "12px", fontSize: 12.5, color: C.muted, fontStyle: "italic" }}>{tr(lang, "noneToday")}</div>;
          const LL = lang === "hi" ? "hi" : "en";
          const DAY = 86400000;
          const away = (ms) => { const dd = Math.round((ms - todayP.anchor) / DAY); return dd <= 0 ? (lang === "hi" ? "आज" : "today") : (lang === "hi" ? dd + " दिन" : dd + "d"); };
          const monthLbl = (ms) => new Date(ms + tz * 3600000).toLocaleDateString(lang === "hi" ? "hi-IN" : "en-IN", { month: "long", timeZone: "UTC" });
          let lastMonth = null;
          return items.map((it) => {
            const kind = tab === "fasting" ? obsKind(it.key) : it.key;
            const meta = tab === "fasting" ? OBS_META[kind] : FEST_META[it.key];
            const name = tab === "fasting" ? obsLabel(lang, { key: it.key, baseKey: kind, isVariant: it.key !== kind }) : trN(lang, FEST_NAME, it.key);
            const mLbl = monthLbl(it.ms);
            const header = mLbl !== lastMonth ? <div style={{ ...T.label, color: C.muted, padding: "12px 12px 2px" }}>{mLbl}</div> : null;
            lastMonth = mLbl;
            const id = tab + ":" + it.key + ":" + it.ms;
            const open = fexp && fexp.id === id;
            return (
              <div key={id}>
                {header}
                <div style={{ borderTop: "1px solid #F3ECDC", background: open ? "rgba(168,106,18,.05)" : undefined }}>
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => setFexp(open ? null : { id, ms: it.ms, timing: meta ? meta.timing : null, shifted: it.shifted, reason: it.reason })}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setFexp(open ? null : { id, ms: it.ms, timing: meta ? meta.timing : null, shifted: it.shifted, reason: it.reason }); } }}
                    style={{ cursor: "pointer", padding: "10px 12px", display: "flex", justifyContent: "space-between", gap: 10, alignItems: "baseline" }}
                  >
                    <span style={{ fontSize: 14, color: C.ivory, flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</span>
                    <span style={{ flexShrink: 0, fontSize: 12.5, color: C.muted, fontVariantNumeric: "tabular-nums" }}><span style={{ color: C.gold }}>{fmtDay(it.ms)}</span> · {away(it.ms)}</span>
                  </div>
                  {open && (() => {
                    const d = fexpDetail;
                    return (
                      <div style={{ padding: "0 12px 10px", marginTop: -2, paddingTop: 8, borderTop: "1px dashed #EBDFC6", display: "flex", flexDirection: "column", gap: 5, alignItems: "flex-start" }}>
                        {meta && meta.gloss && <div style={{ fontSize: T.fSmall, color: C.ivory }}>{meta.gloss[LL]}{meta.deity && <span style={{ color: C.muted }}> · {meta.deity[LL]}</span>}</div>}
                        {d && d.info && <div style={{ fontSize: T.fMicro, color: C.muted }}>{d.info.lmonthName} · {d.info.krishna ? (lang === "hi" ? "कृष्ण पक्ष" : "Krishna Paksha") : (lang === "hi" ? "शुक्ल पक्ष" : "Shukla Paksha")} · {(lang === "hi" ? (NAK_HI[d.info.nak] || d.info.nakName) : d.info.nakName)}</div>}
                        {d && (d.parana || d.moonrise != null || d.sunset != null || d.stars) && (
                          <div style={{ fontSize: T.fSmall, color: "#1F7A4D", fontWeight: 600, background: "rgba(31,122,77,.07)", border: "1px solid rgba(31,122,77,.22)", borderRadius: T.rSm, padding: "5px 10px", fontVariantNumeric: "tabular-nums" }}>
                            {d.parana ? <>{lang === "hi" ? "पारण: " : "Parana: "}{fmtTimeD(d.parana.start, d.tz, it.ms)}{lang === "hi" ? " से" : " onwards"}{d.parana.dwadashiEnd > d.parana.start && <span style={{ color: C.muted, fontWeight: 400 }}> · {lang === "hi" ? "द्वादशी समाप्त " : "Dwadashi ends "}{fmtTimeD(d.parana.dwadashiEnd, d.tz, it.ms)}</span>}</>
                              : d.moonrise != null ? <>{lang === "hi" ? "चंद्रोदय पर व्रत खोलें: " : "Break fast after moonrise: "}{fmtTimeD(d.moonrise, d.tz, it.ms)}</>
                              : d.stars ? <>{lang === "hi" ? "तारे दिखाई देने के बाद व्रत खोलें" : "Break the fast after the stars are visible"}</>
                              : <>{lang === "hi" ? "संध्या पूजा सूर्यास्त से: " : "Evening puja from sunset: "}{fmtTimeD(d.sunset, d.tz, it.ms)}</>}
                          </div>
                        )}
                        {fexp && fexp.shifted && <div style={{ color: C.gold, fontSize: T.fMicro }}>{fexp.reason === "spans" ? (lang === "hi" ? "वैष्णव तिथि — दो अरुणोदय पर एकादशी; दूसरे दिन व्रत" : "Vaishnava date — Ekadashi at two dawns; observed on the second") : (lang === "hi" ? "वैष्णव तिथि — अरुणोदय पर दशमी होने से व्रत एक दिन आगे" : "Vaishnava date — Dashami touched arunodaya (dawn), so the fast shifts one day")}</div>}
                        {meta && meta.rules && <div style={{ color: C.muted, fontSize: T.fMicro, fontStyle: "italic" }}>{meta.rules[LL]}</div>}
                        {VRAT_VIDHI[kind] && <VratVidhiCard data={VRAT_VIDHI[kind]} lang={lang} C={C} />}
                      </div>
                    );
                  })()}
                </div>
              </div>
            );
          });
        })()}
        <div style={{ borderTop: `1px solid ${C.line}`, padding: "10px 12px", display: "flex", gap: 8 }}>
          <input value={fq} onChange={(e) => setFq(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && fq.trim()) onCal({ type: "search", q: fq.trim() }); }} placeholder={tr(lang, "searchPlaceholder")} style={{ flex: 1, minWidth: 0, height: T.ctrlH, boxSizing: "border-box", padding: "0 12px", borderRadius: T.rMd, border: `1px solid ${C.line}`, background: "#FFFDF7", color: C.ivory, fontFamily: T.body, fontSize: 13.5 }} />
          <button onClick={() => fq.trim() && onCal({ type: "search", q: fq.trim() })} style={{ height: T.ctrlH, boxSizing: "border-box", padding: "0 16px", borderRadius: T.rMd, fontFamily: T.serif, fontSize: 13.5, cursor: "pointer", border: `1px solid ${C.gold}`, background: "rgba(168,106,18,.08)", color: C.gold, flexShrink: 0 }}>{tr(lang, "searchBtn")}</button>
        </div>
        <button onClick={() => onCal({ type: "year" })} style={{ width: "100%", padding: "9px", border: "none", background: "transparent", color: C.gold, cursor: "pointer", fontFamily: T.serif, fontSize: T.fSmall, letterSpacing: ".02em" }}>{tr(lang, "moreLabel")} ›</button>
      </div>
      {/* muhurat finder */}
      <SecHead deva="मुहूर्त खोज" en="Muhurat finder" />
      <div style={{ ...card, padding: T.s4 }}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12.5, color: C.muted, marginBottom: 8, fontStyle: "italic" }}>
            {lang === "hi" ? "क्या करने जा रहे हैं और कब तक — चुनें, सर्वोत्तम दिन क्रमानुसार मिलेंगे।" : "Pick what you're planning and when — get the best days, ranked."}
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
            {MUH_CATS.map((c) => { const on = mfCat === c.key; return (
              <button key={c.key} onClick={() => { setMfCat(c.key); setMfErr(null); if (ans) findDays(null, null, c.key); }}
                style={{ height: T.ctrlH, boxSizing: "border-box", padding: "0 13px", borderRadius: T.rMd, cursor: "pointer", fontFamily: T.body, fontSize: 13,
                  border: `1.5px solid ${on ? C.gold : C.line}`, background: on ? "rgba(168,106,18,.1)" : "#FFFDF7", color: on ? C.gold : C.ivory }}>
                {lang === "hi" ? c.hi : c.en}
              </button>
            ); })}
          </div>
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 8 }}>
            <label style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1, minWidth: 140, ...T.label, color: C.muted }}>
              {lang === "hi" ? "से" : "From"}
              <input type="date" value={mfFrom} onChange={(e) => { setMfFrom(e.target.value); setMfPreset(null); }}
                style={{ height: T.ctrlH, boxSizing: "border-box", padding: "0 10px", borderRadius: T.rMd, border: `1px solid ${C.line}`, background: "#FFFDF7", color: C.ivory, fontFamily: T.body, fontSize: 13.5, letterSpacing: "normal", textTransform: "none" }} />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1, minWidth: 140, ...T.label, color: C.muted }}>
              {lang === "hi" ? "तक" : "To"}
              <input type="date" value={mfTo} onChange={(e) => { setMfTo(e.target.value); setMfPreset(null); }}
                style={{ height: T.ctrlH, boxSizing: "border-box", padding: "0 10px", borderRadius: T.rMd, border: `1px solid ${C.line}`, background: "#FFFDF7", color: C.ivory, fontFamily: T.body, fontSize: 13.5, letterSpacing: "normal", textTransform: "none" }} />
            </label>
          </div>
          <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
            {[["90", lang === "hi" ? "90 दिन" : "90 days", () => [isoAtOffset(0), isoAtOffset(90)]],
              ["year", lang === "hi" ? "इस वर्ष" : "This year", () => [isoAtOffset(0), new Date(Date.now() + tz * 3600000).getUTCFullYear() + "-12-31"]]].map(([pk, label, mk]) => {
              const on = mfPreset === pk;
              return (
                <button key={pk} onClick={() => { const [f, t] = mk(); setMfFrom(f); setMfTo(t); setMfPreset(pk); if (mfCat) findDays(f, t); }}
                  style={{ padding: "4px 12px", borderRadius: T.rPill, border: `1.5px solid ${on ? C.gold : C.line}`, background: on ? "rgba(168,106,18,.1)" : "transparent", color: on ? C.gold : C.muted, fontSize: 11.5, cursor: "pointer", fontFamily: T.body }}>
                  {label}
                </button>
              );
            })}
          </div>
          <button onClick={() => findDays()} disabled={!mfCat || mfBusy}
            style={{ width: "100%", height: T.ctrlH, boxSizing: "border-box", borderRadius: T.rMd, fontFamily: T.serif, fontSize: 14, cursor: mfCat && !mfBusy ? "pointer" : "default", border: "none", background: mfCat && !mfBusy ? "linear-gradient(180deg, #E08A22, #C9711A)" : C.line, color: mfCat && !mfBusy ? "#FFF8E9" : C.muted, fontWeight: 600 }}>
            {mfBusy ? (lang === "hi" ? "पंचांग देखा जा रहा है…" : "Checking the panchang…")
              : !mfCat ? (lang === "hi" ? "पहले ऊपर कार्य चुनें" : "First pick an activity above")
              : (lang === "hi" ? "शुभ दिन खोजें" : "Find good days")}
          </button>
          {mfErr && (
            <div style={{ marginTop: 10, padding: "10px 12px", borderRadius: T.rMd, background: "rgba(194,69,30,.08)", border: `1.5px solid ${C.sindoor}`, color: C.sindoor, fontSize: 13 }}>{mfErr}</div>
          )}
          {ans && !mfBusy && (ans.from !== mfFrom || ans.to !== mfTo || ans.category !== mfCat) && (
            <div style={{ marginTop: 10, padding: "9px 12px", borderRadius: T.rMd, background: "#FDF3E0", border: `1px solid #E0B25E`, color: "#8A5A00", fontSize: 12.5, lineHeight: 1.45 }}>
              {lang === "hi" ? "चुनाव बदल गया है — नए परिणामों हेतु \"शुभ दिन खोजें\" दबाएँ। नीचे पिछले परिणाम दिख रहे हैं।" : "Your selection changed — press \"Find good days\" to update. The results below are from your previous search."}
            </div>
          )}
          {ans && (() => {
            const catInfo = MUH_CATS.find((c) => c.key === ans.category) || { hi: "", en: "" };
            const allValid = ans.days.filter((d) => d.valid);
            const days = allValid.slice(0, 8);
            const qual = (sc) => sc >= 5 ? { t: lang === "hi" ? "अति शुभ" : "Highly auspicious", c: "#1F7A4D" } : sc >= 3 ? { t: lang === "hi" ? "शुभ" : "Auspicious", c: C.gold } : sc >= 1 ? { t: lang === "hi" ? "सामान्य" : "Workable", c: "#9A7B2E" } : { t: lang === "hi" ? "टालें" : "Better avoided", c: C.sindoor };
            const dl = (r) => new Date(r.rise + r.tz * 3600000).toLocaleDateString(lang === "hi" ? "hi-IN" : "en-US", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
            const dlFull = (r) => new Date(r.rise + r.tz * 3600000).toLocaleDateString(lang === "hi" ? "hi-IN" : "en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
            const fmtIso = (iso) => new Date(iso + "T00:00:00Z").toLocaleDateString(lang === "hi" ? "hi-IN" : "en-US", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
            const top = days[0];
            // tally the reasons the excluded days were skipped, most-common first
            const blockerTally = (() => {
              const m = new Map();
              for (const d of ans.days) { if (d.valid) continue; for (const b of (d.blockers || [])) { if (!m.has(b.en)) m.set(b.en, { en: b.en, hi: b.hi, n: 0 }); m.get(b.en).n++; } }
              return [...m.values()].sort((a, b) => b.n - a.n).slice(0, 4);
            })();
            const whyList = blockerTally.map((b) => (lang === "hi" ? b.hi : b.en) + " (" + b.n + ")").join(lang === "hi" ? ", " : ", ");
            return (
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${C.line}` }}>
                <div style={{ fontFamily: "Eczar, serif", fontSize: 15.5, color: C.ivory }}>
                  {(lang === "hi" ? "शुभ दिन · " : "Best days · ")}{lang === "hi" ? catInfo.hi : catInfo.en} <span style={{ color: C.muted, fontSize: 13 }}>· {fmtIso(ans.from || mfFrom)} – {fmtIso(ans.to || mfTo)}</span>
                </div>
                {days.length === 0 ? (
                  <div style={{ fontSize: 12.5, color: C.muted, marginTop: 10, lineHeight: 1.6 }}>
                    <span style={{ color: C.sindoor, fontWeight: 600 }}>{lang === "hi" ? "इस अवधि में कोई शुभ मुहूर्त नहीं।" : "No auspicious muhurat in this range."}</span>
                    {whyList && <><br />{(lang === "hi" ? "अधिकांश दिन इन कारणों से टले: " : "Most days were skipped because of: ") + whyList + "."}</>}
                    <br />{(lang === "hi" ? "शुभ काल: " : "When it's possible: ") + MUHURTA_RULES[ans.category].monthsLabel[lang === "hi" ? "hi" : "en"] + ". " + (lang === "hi" ? "बड़ी अवधि आज़माएँ।" : "Try a wider range.")}
                  </div>
                ) : (
                  <>
                    {top && (
                      <div style={{ marginTop: 12, ...card, borderRadius: T.rSm, padding: "12px 14px", background: "#FBF5E7", border: `1.5px solid ${C.gold}` }}>
                        <div style={{ ...T.label, color: C.gold, marginBottom: 3 }}>{lang === "hi" ? "सर्वोत्तम दिन" : "Best day"}</div>
                        <div style={{ fontFamily: "Eczar, serif", fontSize: 19, color: C.ivory, lineHeight: 1.25 }}>{dlFull(top)}</div>
                        <div style={{ fontSize: 12, color: C.muted, margin: "3px 0 8px" }}>
                          {(lang === "hi" ? (NAK_HI[top.nak] || top.nakName) : top.nakName)} · {(lang === "hi" ? "तिथि " : "tithi ") + top.tithiNum}
                          <span style={{ marginLeft: 8, fontSize: 11, padding: "1px 9px", borderRadius: 10, background: qual(top.score).c + "20", color: qual(top.score).c }}>{qual(top.score).t}</span>
                        </div>
                        <div style={{ fontSize: 12.5, color: C.ivory, marginBottom: 10, lineHeight: 1.5 }}>{(lang === "hi" ? "क्यों यह दिन: " : "Why this day: ") + (top.factors.filter((f) => f.g).map((f) => lang === "hi" ? f.hi : f.en).join(lang === "hi" ? ", " : ", ") || "—")}</div>
                        {finderTopPanchaka && (finderTopPanchaka.panchakaWindows || []).length ? (() => {
                          const ptz = finderTopPanchaka.tz;
                          const shubha = finderTopPanchaka.panchakaWindows.filter((w) => w.shubha);
                          const dosha = finderTopPanchaka.panchakaWindows.filter((w) => !w.shubha);
                          return (
                            <>
                              <div style={{ ...T.label, color: "#1F7A4D", marginBottom: 5 }}>{lang === "hi" ? "पञ्चक रहित (शुभ) · लग्न आधारित" : "Panchaka Rahita (Shubha) · lagna-based"}</div>
                              {shubha.length ? (
                                <div style={{ display: "flex", flexDirection: "column", gap: 3, marginBottom: 8 }}>
                                  {shubha.slice(0, 6).map((w, i) => (
                                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, fontVariantNumeric: "tabular-nums" }}>
                                      <span style={{ color: "#1F7A4D", fontWeight: 700 }}>✓</span>
                                      <span style={{ color: C.ivory }}>{fmtTime(w.start, ptz)} – {fmtTime(w.end, ptz)}</span>
                                    </div>
                                  ))}
                                </div>
                              ) : <div style={{ fontSize: 12, color: C.muted, fontStyle: "italic", marginBottom: 8 }}>{lang === "hi" ? "इस दिन कोई पूर्ण पञ्चक-रहित काल नहीं — अभिजित देखें" : "No fully-clear window this day — use Abhijit below"}</div>}
                              {top.abhijit && <div style={{ fontSize: 12, color: C.gold, fontVariantNumeric: "tabular-nums", marginBottom: 8 }}>{tr(lang, "abhijitL")}: {fmtTime(top.abhijit.start, top.tz)} – {fmtTime(top.abhijit.end, top.tz)}</div>}
                              {dosha.length > 0 && (<>
                                <div style={{ ...T.label, color: C.sindoor, marginBottom: 4 }}>{lang === "hi" ? "पञ्चक दोष · टालें" : "Panchaka dosha · avoid"}</div>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "3px 10px", marginBottom: 5 }}>
                                  {dosha.slice(0, 8).map((w, i) => <span key={i} style={{ fontSize: 11.5, color: C.sindoor, fontVariantNumeric: "tabular-nums" }}>{trN(lang, PANCHAKA_SHORT, w.type)} {fmtTime(w.start, ptz)}–{fmtTime(w.end, ptz)}</span>)}
                                </div>
                              </>)}
                              <div style={{ fontSize: 11.5, color: C.sindoor, fontVariantNumeric: "tabular-nums" }}>{tr(lang, "rahuL")} {fmtTime(top.rahu.start, top.tz)}–{fmtTime(top.rahu.end, top.tz)}</div>
                            </>
                          );
                        })() : (
                          <>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 10px" }}>
                              {top.choghaDay.filter((c) => c.nat === "good").map((c, i) => <span key={i} style={{ fontSize: 12, color: "#1F7A4D", fontVariantNumeric: "tabular-nums" }}>{trN(lang, CHOG_NAME, c.key)} {fmtTime(c.start, top.tz)}–{fmtTime(c.end, top.tz)}</span>)}
                              {top.abhijit && <span style={{ fontSize: 12, color: C.gold, fontVariantNumeric: "tabular-nums" }}>{tr(lang, "abhijitL")} {fmtTime(top.abhijit.start, top.tz)}–{fmtTime(top.abhijit.end, top.tz)}</span>}
                            </div>
                            <div style={{ fontSize: 11.5, color: C.sindoor, marginTop: 6, fontVariantNumeric: "tabular-nums" }}>{tr(lang, "avoidWindows")}: {tr(lang, "rahuL")} {fmtTime(top.rahu.start, top.tz)}–{fmtTime(top.rahu.end, top.tz)}</div>
                          </>
                        )}
                      </div>
                    )}
                    {days.length > 1 && (
                      <div style={{ marginTop: 12 }}>
                        <div style={{ ...T.label, color: C.muted, marginBottom: 6 }}>{(lang === "hi" ? "अन्य शुभ दिन" : "Other good days") + (allValid.length > 1 ? " · " + (allValid.length - 1) : "")}</div>
                        {days.slice(1).map((r, i) => { const Q = qual(r.score); return (
                          <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 10, padding: "7px 0", borderBottom: "1px solid #F1EADA", alignItems: "baseline" }}>
                            <span style={{ minWidth: 92, fontFamily: "Eczar, serif", fontSize: 13.5, color: C.ivory }}>{dl(r)}</span>
                            <span style={{ fontSize: 11, padding: "1px 9px", borderRadius: 10, background: Q.c + "20", color: Q.c, whiteSpace: "nowrap" }}>{Q.t}</span>
                            <span style={{ flex: 1, textAlign: "right", fontSize: 11.5, color: C.muted, lineHeight: 1.4 }}>{r.factors.filter((f) => f.g).map((f) => lang === "hi" ? f.hi : f.en).join(" · ") || "—"}</span>
                          </div>
                        ); })}
                      </div>
                    )}
                    <div style={{ fontSize: 11, color: C.muted, marginTop: 8, fontStyle: "italic" }}>{lang === "hi" ? "केवल मास, तिथि, नक्षत्र व वार शुद्धि पर खरे दिन दिखाए गए हैं।" : "Only dates passing month, tithi, nakshatra & weekday shuddhi are shown."}</div>
                    {whyList && (
                      <div style={{ marginTop: 12, padding: "10px 12px", borderRadius: T.rMd, background: "#FBF5E7", border: `1px solid ${C.line}` }}>
                        <div style={{ ...T.label, color: C.muted, marginBottom: 4 }}>{lang === "hi" ? "अन्य दिन क्यों शामिल नहीं" : "Why other days weren't included"}</div>
                        <div style={{ fontSize: 12, color: C.ivory, lineHeight: 1.5 }}>{whyList}</div>
                      </div>
                    )}
                  </>
                )}
                <div style={{ fontSize: 11, color: C.muted, marginTop: 12, lineHeight: 1.5, fontStyle: "italic" }}>
                  {lang === "hi" ? "दिन तिथि, नक्षत्र, वार व करण से चुने जाते हैं; समय-काल पञ्चक रहित (लग्न आधारित) से निकाले जाते हैं। विवाह जैसे बड़े कार्यों हेतु वर-वधू की कुंडली मिलान भी किसी आचार्य से कराएँ।" : "Days are screened by tithi, nakshatra, weekday and karana; the time windows use Panchaka Rahita (lagna-based). For weddings and other major events, also match the charts with a practitioner."}
                </div>
              </div>
            );
          })()}
        </div>
        <div style={{ ...T.label, color: C.muted, textAlign: "center", margin: "2px 0 14px" }}>{lang === "hi" ? "— या आज का समय देखें —" : "— or check a time today —"}</div>
        <div style={{ fontSize: 12.5, color: C.muted, marginBottom: 10, lineHeight: 1.5 }}>{tr(lang, "finderHint")}</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
          {EVENTS.map((e) => (
            <button key={e.key} onClick={() => setEvKey(e.key)} style={{ padding: "7px 12px", borderRadius: 8, fontFamily: "Eczar, serif", fontSize: 13, cursor: "pointer", border: `1px solid ${evKey === e.key ? C.gold : C.line}`, background: evKey === e.key ? "rgba(168,106,18,.1)" : "transparent", color: evKey === e.key ? C.gold : C.muted }}>{lang === "hi" ? e.hi : e.en}</button>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
          <div>
            <div style={{ ...T.label, color: "#1F7A4D", marginBottom: 6 }}>{tr(lang, "goodWindows")}</div>
            {goodSlots.length === 0 ? <div style={{ fontSize: 12.5, color: C.muted, fontStyle: "italic" }}>{lang === "hi" ? "आज इसके लिए और कोई शुभ समय नहीं — कल देखें।" : "No more good windows for this today — check tomorrow."}</div> :
              goodSlots.map((c, i) => (
                <div key={i} style={{ fontSize: 13, padding: "4px 0", display: "flex", justifyContent: "space-between", gap: 8 }}>
                  <span style={{ color: C.ivory }}>{trN(lang, CHOG_NAME, c.key)}</span>
                  <span style={{ color: C.muted, fontVariantNumeric: "tabular-nums" }}>{fmtT(c.start)}–{fmtT(c.end)}</span>
                </div>
              ))}
            {todayP.abhijit && todayP.abhijit.end > nowMs && (
              <div style={{ fontSize: 13, padding: "4px 0", display: "flex", justifyContent: "space-between", gap: 8 }}>
                <span style={{ color: C.gold }}>{tr(lang, "abhijitL")}</span>
                <span style={{ color: C.muted, fontVariantNumeric: "tabular-nums" }}>{fmtT(todayP.abhijit.start)}–{fmtT(todayP.abhijit.end)}</span>
              </div>
            )}
          </div>
          <div>
            <div style={{ ...T.label, color: C.sindoor, marginBottom: 6 }}>{tr(lang, "avoidWindows")}</div>
            {avoidSlots.map(([k, w], i) => (
              <div key={i} style={{ fontSize: 13, padding: "4px 0", display: "flex", justifyContent: "space-between", gap: 8 }}>
                <span style={{ color: C.ivory }}>{tr(lang, k + "L")}</span>
                <span style={{ color: C.muted, fontVariantNumeric: "tabular-nums" }}>{fmtT(w.start)}–{fmtT(w.end)}</span>
              </div>
            ))}
          </div>
        </div>
        {evKey === "wedding" && <div style={{ fontSize: 11.5, color: C.muted, marginTop: 12, fontStyle: "italic", lineHeight: 1.5 }}>{lang === "hi" ? "विवाह का पूर्ण मुहूर्त तिथि, नक्षत्र व लग्न पर निर्भर — यह केवल दिन के शुभ समय दिखाता है।" : "A full wedding muhurat depends on tithi, nakshatra and lagna — this shows favourable times within the day only."}</div>}
      </div>

      {/* hora timeline (secondary) */}
      <SecHead deva="होरा" en="Planetary hours" />
      {/* today — hero */}
      {(() => {
        const rise = todayP.rise, set = todayP.set;
        const obs = observancesFor(todayP.krishna, todayP.tithiNum, null, todayP.dow);
        const note = obs.length
          ? (lang === "hi" ? "आज " : "Today is ") + obsLabel(lang, obs[0]) + (obs[0].fasting ? (lang === "hi" ? " — व्रत का दिन" : " — a fasting day") : "")
          : todayP.naks[0].name + (lang === "hi" ? " नक्षत्र · " : " nakshatra · ") + todayP.tithis[0].name;
        const E = todayP.elong != null ? todayP.elong : (todayP.tithiNum || 0) * 12;
        const k = (1 - Math.cos(E * Math.PI / 180)) / 2, waxing = E < 180, mR = 22, rx = (mR * Math.abs(2 * k - 1)).toFixed(1);
        const moonLit = waxing
          ? "M 0 " + (-mR) + " A " + mR + " " + mR + " 0 0 1 0 " + mR + " A " + rx + " " + mR + " 0 0 " + (k < 0.5 ? 1 : 0) + " 0 " + (-mR) + " Z"
          : "M 0 " + (-mR) + " A " + mR + " " + mR + " 0 0 0 0 " + mR + " A " + rx + " " + mR + " 0 0 " + (k < 0.5 ? 0 : 1) + " 0 " + (-mR) + " Z";
        const phNames = lang === "hi"
          ? ["अमावस्या", "वर्धमान चंद्र", "अष्टमी", "वर्धमान", "पूर्णिमा", "क्षीयमान", "अष्टमी", "क्षीयमान चंद्र"]
          : ["New moon", "Waxing crescent", "First quarter", "Waxing gibbous", "Full moon", "Waning gibbous", "Last quarter", "Waning crescent"];
        const phIdx = (E < 11.25 || E >= 348.75) ? 0 : E < 78.75 ? 1 : E < 101.25 ? 2 : E < 168.75 ? 3 : E < 191.25 ? 4 : E < 258.75 ? 5 : E < 281.25 ? 6 : 7;
        const head = (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontFamily: "Eczar, serif", fontSize: 22, color: C.ivory, lineHeight: 1.12 }}>{todayP.dateLabel}</div>
              <div style={{ fontSize: 12.5, color: C.muted, marginTop: 2 }}>{todayP.tithis[0].name} · {todayP.paksha}</div>
            </div>
            {isToday ? pill(nowState === "good" ? tr(lang, "auspiciousNow") : nowState === "bad" ? tr(lang, "cautionNow") : tr(lang, "neutralNow"), natColor(nowState)) : null}
          </div>
        );
        const moonRow = (
          <div style={{ padding: "12px 20px 15px", display: "flex", gap: 15, alignItems: "center" }}>
            <svg viewBox="-26 -26 52 52" width="46" height="46" style={{ flexShrink: 0 }}>
              <circle cx="0" cy="0" r={mR} fill="#3A3550" />
              <path d={moonLit} fill="#F3E7C8" />
              <circle cx="0" cy="0" r={mR} fill="none" stroke="#D8C9A6" strokeWidth="0.75" />
            </svg>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 14, color: C.ivory, lineHeight: 1.35 }}>{note}</div>
              <div style={{ fontSize: 11.5, color: C.muted, marginTop: 2 }}>{phNames[phIdx]}{todayP.abhijit ? " · " + tr(lang, "abhijitL") + " " + fmtT(todayP.abhijit.start) + "–" + fmtT(todayP.abhijit.end) : ""}</div>
            </div>
          </div>
        );
        if (rise == null || set == null) {
          return (<div className="rise" style={{ ...card, borderRadius: T.rLg, padding: 0, overflow: "hidden", borderTop: `3px solid ${natColor(nowState)}` }}>
            <div style={{ background: "linear-gradient(135deg, #FCF4E0, #F5E8CD)", padding: "16px 20px" }}>{head}</div>{moonRow}</div>);
        }
        const dayFrac = (ms) => set > rise ? Math.max(0, Math.min(1, (ms - rise) / (set - rise))) : 0;
        const AW = 320, AH = 240, cx = AW / 2, cy = AH - 60, R = 132;
        const arcPt = (f) => { const a = Math.PI - f * Math.PI; return [cx + R * Math.cos(a), cy - R * Math.sin(a)]; };
        const arcPoly = (f0, f1, n) => { const p = []; for (let i = 0; i <= n; i++) { const xy = arcPt(f0 + (f1 - f0) * i / n); p.push(xy[0].toFixed(1) + "," + xy[1].toFixed(1)); } return p.join(" "); };
        const seg = (w) => (w && w.end > rise && w.start < set) ? [dayFrac(w.start), dayFrac(w.end)] : null;
        const segPoly = (sv, color, w) => sv ? <polyline points={arcPoly(sv[0], sv[1], 16)} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" /> : null;
        const showNow = isToday && nowMs != null;
        const isDay = showNow && nowMs >= rise && nowMs <= set;
        const sunXY = isDay ? arcPt(dayFrac(nowMs)) : [0, 0];
        const radPt = (f, r) => { const a = Math.PI - f * Math.PI; return [cx + r * Math.cos(a), cy - r * Math.sin(a)]; };
        const horas = dayHoras(todayP.dow, rise, set);
        const horaDur = (set - rise) / 12;
        const curHoraIdx = isDay ? Math.min(11, Math.max(0, Math.floor((nowMs - rise) / horaDur))) : null;
        const showHora = horaSel != null ? horaSel : curHoraIdx;
        
        // Arc dragging: convert SVG mouse position to time
        const handleArcDrag = (evt) => {
          const svg = evt.currentTarget;
          const rect = svg.getBoundingClientRect();
          const x = evt.clientX - rect.left, y = evt.clientY - rect.top;
          // Convert to SVG coords (accounting for viewBox)
          const svgX = x * (AW / rect.width), svgY = y * (AH / rect.height);
          // Compute angle: atan2(cy - y, x - cx), then map to [0, 1] fraction
          const dx = svgX - cx, dy = cy - svgY;
          const angle = Math.atan2(dy, dx) / Math.PI; // [-1, 1]
          const frac = Math.max(0, Math.min(1, 1 - angle)); // map to [0,1] = sunrise → sunset
          const ms = rise + frac * (set - rise);
          setDragMs(ms);
        };
        const handleArcLeave = () => setDragMs(null);
        
        // Compute auspiciousness and details at dragged time
        const dragInfo = dragMs && dragMs >= rise && dragMs <= set ? (() => {
          const chog = todayP.choghaDay ? todayP.choghaDay.find(c => dragMs >= c.start && dragMs < c.end) : null;
          const inRahu = todayP.rahu && dragMs >= todayP.rahu.start && dragMs < todayP.rahu.end;
          const inAbhijit = todayP.abhijit && dragMs >= todayP.abhijit.start && dragMs < todayP.abhijit.end;
          const isDangerous = inRahu || (chog && chog.nat === "rik");
          const isGood = inAbhijit || (chog && chog.nat === "shubh");
          return { time: dragMs, chog, inRahu, inAbhijit, isDangerous, isGood };
        })() : null;
        
return (

          <div className="rise" style={{ ...card, borderRadius: T.rLg, padding: 0, overflow: "hidden", borderTop: `3px solid ${natColor(nowState)}` }}>
            <div style={{ background: "linear-gradient(135deg, #FCF4E0, #F5E8CD)", padding: "16px 20px 4px" }}>
              {head}
              <svg viewBox={"0 0 " + AW + " " + AH} style={{ width: "100%", maxWidth: 380, display: "block", margin: "2px auto 0", cursor: "crosshair" }} onMouseMove={handleArcDrag} onMouseLeave={handleArcLeave} onTouchMove={handleArcDrag} onTouchEnd={handleArcLeave}>
                <line x1="8" y1={cy} x2={AW - 8} y2={cy} stroke="#E3D4B0" strokeWidth="1" />
                {horas.map((h, i) => { const cur = curHoraIdx === i, sel = horaSel === i; return (
                  <g key={i}>
                    <polyline points={arcPoly(i / 12, (i + 1) / 12, 8)} fill="none" stroke={HORA_COLOR[h.ruler]} strokeWidth={cur || sel ? 5.5 : 3} strokeOpacity={cur ? 1 : sel ? 0.85 : 0.36} strokeLinecap="butt" />
                    <polyline points={arcPoly(i / 12, (i + 1) / 12, 8)} fill="none" stroke="transparent" strokeWidth="18" style={{ cursor: "pointer" }} onClick={() => setHoraSel(i)} />
                  </g>); })}
                {Array.from({ length: 13 }, (_, i) => { 
                  const a = radPt(i / 12, R - 5), b = radPt(i / 12, R + 4); 
                  const timeLabel = (() => { const tm = rise + i * (set - rise) / 12; const h = Math.floor(tm / 3600000) % 24, m = Math.floor((tm % 3600000) / 60000); return (h < 10 ? "0" : "") + h + (m > 0 ? ":" + (m < 10 ? "0" : "") + m : ""); })();
                  const labelPt = radPt(i / 12, R + 16);
                  return <g key={i}><line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#E3D4B0" strokeWidth="1" /><text x={labelPt[0]} y={labelPt[1]} textAnchor="middle" style={{ fontSize: 9.5, fill: C.muted, fontVariantNumeric: "tabular-nums" }}>{timeLabel}</text></g>; 
                })}
                {showHora != null && (() => { const g = radPt((showHora + 0.5) / 12, R - 16); return <text x={g[0]} y={g[1] + 4} textAnchor="middle" style={{ fontSize: 13, fontWeight: 700, fill: HORA_COLOR[horas[showHora].ruler] }}>{HORA_GLYPH[horas[showHora].ruler]}</text>; })()}
                {dragMs ? (() => { 
                  const dxy = arcPt(dayFrac(dragMs)); 
                  const chog = todayP.choghaDay ? todayP.choghaDay.find(c => dragMs >= c.start && dragMs < c.end) : null;
                  const inRahu = todayP.rahu && dragMs >= todayP.rahu.start && dragMs < todayP.rahu.end;
                  const inAbhijit = todayP.abhijit && dragMs >= todayP.abhijit.start && dragMs < todayP.abhijit.end;
                  const isDangerous = inRahu || (chog && chog.nat === "rik");
                  const isGood = inAbhijit || (chog && chog.nat === "shubh");
                  return <circle cx={dxy[0]} cy={dxy[1]} r="7" fill="none" stroke={isGood ? C.gold : isDangerous ? C.sindoor : C.muted} strokeWidth="2.5" opacity="0.7" />; 
                })() : null}
                {isDay
                  ? <g><circle cx={sunXY[0]} cy={sunXY[1]} r="11" fill={C.gold} opacity="0.22" style={{ animation: "softpulse 3s ease-in-out infinite" }} /><circle cx={sunXY[0]} cy={sunXY[1]} r="5" fill="#E89A2B" stroke="#FFF6E6" strokeWidth="1.5" /></g>
                  : (showNow ? <text x={cx} y={cy - 10} textAnchor="middle" style={{ fontSize: 12, fill: C.muted }}>{lang === "hi" ? "रात्रि" : "night"}</text> : null)}
                <text x="10" y={cy - 6} style={{ fontSize: 10.5, fill: C.muted }}>↑ {fmtT(rise)}</text>
                <text x={AW - 10} y={cy - 6} textAnchor="end" style={{ fontSize: 10.5, fill: C.muted }}>{fmtT(set)} ↓</text>
              </svg>
              {dragInfo ? (
                <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "6px 2px 2px", flexWrap: "wrap", justifyContent: "center", fontVariantNumeric: "tabular-nums" }}>
                  <span style={{ fontFamily: T.serif, fontSize: T.fSmall, color: dragInfo.isGood ? C.gold : dragInfo.isDangerous ? C.sindoor : C.muted }}>{dragInfo.isGood ? "✓ Auspicious" : dragInfo.isDangerous ? "✗ Inauspicious" : "○ Neutral"}</span>
                  <span style={{ fontSize: T.fMicro, color: C.muted }}>{fmtT(dragInfo.time)}</span>
                  {dragInfo.chog && <span style={{ fontSize: T.fMicro, color: C.muted }}>· {trN(lang, CHOG_NAME, dragInfo.chog.key)}</span>}
                  {dragInfo.inRahu && <span style={{ fontSize: T.fMicro, color: C.sindoor }}>· Rahu Kalam</span>}
                </div>
              ) : showHora != null && (
                <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "6px 2px 2px", flexWrap: "wrap", justifyContent: "center", fontVariantNumeric: "tabular-nums" }}>
                  <span style={{ fontFamily: T.serif, fontSize: T.fSmall, color: HORA_COLOR[horas[showHora].ruler] }}>{HORA_GLYPH[horas[showHora].ruler]} {trN(lang, HORA_NAME, horas[showHora].ruler)} {lang === "hi" ? "होरा" : "hora"}</span>
                  <span style={{ fontSize: T.fMicro, color: C.muted }}>{fmtT(horas[showHora].start)}–{fmtT(horas[showHora].end)} · {trN(lang, HORA_NATURE, horas[showHora].ruler)}</span>
                  {horaSel != null && <button onClick={() => setHoraSel(null)} style={{ border: "none", background: "transparent", color: C.gold, cursor: "pointer", fontSize: T.fMicro, padding: "0 2px" }} aria-label="reset">✕</button>}
                </div>
              )}
            </div>
            {moonRow}
          </div>
        );
      })()}

      {/* hora advisor */}
      <div style={{ ...card, padding: "12px 14px", marginTop: 12 }}>
        <div style={{ ...T.label, color: C.muted, marginBottom: 4 }}>{lang === "hi" ? "होरा सलाह" : "Hora Advice"}</div>
        <div style={{ fontSize: T.fMicro, color: C.muted, marginBottom: 8 }}>{lang === "hi" ? "किसी कार्य के लिए शुभ होरा पूछें" : "Ask which hora suits an activity"}</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input
            value={horaQuestion}
            onChange={(e) => setHoraQuestion(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") setHoraResult(analyzeHora(horaQuestion)); }}
            placeholder={lang === "hi" ? "जैसे: व्यापार के लिए कौन सी होरा?" : "e.g. best hora for business?"}
            style={{ flex: "1 1 180px", minWidth: 150, height: T.ctrlH, boxSizing: "border-box", padding: "0 12px", borderRadius: T.rMd, border: `1px solid ${C.line}`, background: C.panel, color: C.ivory, fontFamily: T.body, fontSize: 13.5 }}
          />
          <button type="button" onClick={() => setHoraResult(analyzeHora(horaQuestion))} style={{ height: T.ctrlH, boxSizing: "border-box", padding: "0 18px", borderRadius: T.rMd, border: "none", background: "linear-gradient(180deg, #E08A22, #C9711A)", color: "#FFF8E9", cursor: "pointer", fontFamily: T.serif, fontSize: 13.5, fontWeight: 600 }}>
            {lang === "hi" ? "पूछें" : "Ask"}
          </button>
        </div>

        {!horaResult && (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
            {[{ en: "Best hora for business", hi: "व्यापार के लिए होरा" }, { en: "Hora for travel", hi: "यात्रा के लिए होरा" }, { en: "Good time to study", hi: "अध्ययन का समय" }, { en: "Buying gold", hi: "सोना खरीदना" }, { en: "Marriage hora", hi: "विवाह होरा" }].map((ex, i) => (
              <button key={i} type="button" onClick={() => { setHoraQuestion(ex.en); setHoraResult(analyzeHora(ex.en)); }} style={{ fontSize: T.fMicro, padding: "5px 10px", borderRadius: T.rPill, border: `1px solid ${C.line}`, background: C.panel, color: C.muted, cursor: "pointer" }}>
                {ex[lang === "hi" ? "hi" : "en"]}
              </button>
            ))}
          </div>
        )}

        {horaResult && (() => {
          const LL = lang === "hi" ? "hi" : "en";
          if (horaResult.status === "timing") {
            const p = horaResult.planet;
            const wins = (todayP.rise != null && todayP.set != null) ? horaWindowsForPlanet(p, todayP.dow, todayP.rise, todayP.set) : [];
            return (
              <div style={{ marginTop: 10, padding: "10px 12px", background: "rgba(168,106,18,.06)", borderRadius: T.rMd, borderLeft: `3px solid ${HORA_COLOR[p]}` }}>
                <div style={{ fontSize: T.fBody, color: HORA_COLOR[p], fontWeight: 600, marginBottom: 7 }}>{HORA_GLYPH[p]} {HORA_NAME[p][LL]} {lang === "hi" ? "होरा — आज" : "hora — today"}</div>
                {wins.length === 0 ? (
                  <div style={{ fontSize: T.fSmall, color: C.muted }}>{lang === "hi" ? "आज का समय उपलब्ध नहीं।" : "Times unavailable for today."}</div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    {wins.map((w, i) => {
                      const isNow = isToday && Date.now() >= w.start && Date.now() < w.end;
                      return (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontVariantNumeric: "tabular-nums" }}>
                          <span style={{ fontSize: T.fSmall, color: C.ivory, fontWeight: isNow ? 700 : 400 }}>{fmtT(w.start)} – {fmtT(w.end)}</span>
                          <span style={{ fontSize: T.fMicro, color: C.muted }}>{w.period === "day" ? (lang === "hi" ? "दिन" : "day") : (lang === "hi" ? "रात" : "night")}</span>
                          {isNow && <span style={{ fontSize: T.fMicro, color: HORA_COLOR[p], fontWeight: 700 }}>● {lang === "hi" ? "अभी" : "now"}</span>}
                        </div>
                      );
                    })}
                  </div>
                )}
                <div style={{ fontSize: T.fMicro, color: C.muted, marginTop: 7 }}>{lang === "hi" ? "उपयुक्त: " : "Good for: "}{HORA_NATURE[p][LL]}</div>
              </div>
            );
          }
          if (horaResult.status === "clarify") {
            const tree = horaResult.tree;
            return (
              <div style={{ marginTop: 10, padding: "10px 12px", background: "rgba(168,106,18,.06)", borderRadius: T.rMd, borderLeft: `3px solid ${C.gold}` }}>
                <div style={{ fontSize: T.fSmall, color: C.ivory, marginBottom: 8 }}>{tree.q[LL]}</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {tree.options.map((opt, i) => (
                    <button key={i} type="button" onClick={() => setHoraResult({ status: "answer", intent: horaResult.intent || "general", planets: opt.planets, act: opt.act })} style={{ fontSize: T.fMicro, padding: "6px 11px", borderRadius: T.rPill, border: `1px solid ${C.gold}`, background: C.panel, color: C.gold, cursor: "pointer", fontWeight: 500 }}>
                      {opt.label[LL]}
                    </button>
                  ))}
                </div>
              </div>
            );
          }
          if (horaResult.status === "unknown" || horaResult.status === "empty") {
            return (
              <div style={{ marginTop: 10, padding: "10px 12px", background: "rgba(140,129,118,.08)", borderRadius: T.rMd }}>
                <div style={{ fontSize: T.fSmall, color: C.muted, marginBottom: 8 }}>{lang === "hi" ? "इनमें से आज़माएँ:" : "Try one of these:"}</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {[{ en: "business", hi: "व्यापार" }, { en: "travel", hi: "यात्रा" }, { en: "marriage", hi: "विवाह" }, { en: "study", hi: "अध्ययन" }, { en: "property", hi: "संपत्ति" }, { en: "health", hi: "स्वास्थ्य" }, { en: "worship", hi: "पूजा" }].map((ex, i) => (
                    <button key={i} type="button" onClick={() => { setHoraQuestion(ex.en); setHoraResult(analyzeHora(ex.en)); }} style={{ fontSize: T.fMicro, padding: "5px 10px", borderRadius: T.rPill, border: `1px solid ${C.line}`, background: C.panel, color: C.muted, cursor: "pointer" }}>{ex[LL]}</button>
                  ))}
                </div>
              </div>
            );
          }
          const hr = horaResultText(horaResult, horaAsc);
          if (!hr) return null;
          return (
            <div style={{ marginTop: 10, padding: "10px 12px", background: "rgba(168,106,18,.06)", borderRadius: T.rMd, borderLeft: `3px solid ${C.gold}` }}>
              <div style={{ fontSize: T.fBody, color: C.ivory, marginBottom: hr.planets.length ? 8 : 0 }}>{hr.text[LL]}</div>
              {hr.planets.length > 0 && (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {hr.planets.map((p) => (
                    <span key={p} style={{ fontSize: T.fMicro, padding: "4px 9px", borderRadius: T.rSm, background: C.panel, color: HORA_COLOR[p], border: `1px solid ${HORA_COLOR[p]}`, fontWeight: 600 }}>{HORA_GLYPH[p]} {HORA_NAME[p][LL]}</span>
                  ))}
                </div>
              )}
              {horaResult.withTiming && horaResult.intent !== "avoid" && todayP.rise != null && todayP.set != null && (() => {
                const tp = hr.planets[0];
                const wins = horaWindowsForPlanet(tp, todayP.dow, todayP.rise, todayP.set);
                if (!wins.length) return null;
                return (
                  <div style={{ marginTop: 8, fontSize: T.fMicro, color: C.muted, lineHeight: 1.6 }}>
                    <span style={{ color: HORA_COLOR[tp], fontWeight: 600 }}>{HORA_GLYPH[tp]} {HORA_NAME[tp][LL]} {lang === "hi" ? "होरा आज" : "hora today"}: </span>
                    {wins.map((w, i) => {
                      const isNow = isToday && Date.now() >= w.start && Date.now() < w.end;
                      return <span key={i} style={{ fontVariantNumeric: "tabular-nums", fontWeight: isNow ? 700 : 400, color: isNow ? HORA_COLOR[tp] : C.ivory }}>{fmtT(w.start)}–{fmtT(w.end)}{isNow ? " ●" : ""}{i < wins.length - 1 ? " · " : ""}</span>;
                    })}
                  </div>
                );
              })()}
              {hr.note && <div style={{ fontSize: T.fMicro, color: C.gold, marginTop: 8, lineHeight: 1.5 }}>★ {hr.note[LL]}</div>}
            </div>
          );
        })()}

        <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${C.line}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: T.fMicro, color: C.muted }}>{lang === "hi" ? "व्यक्तिगत सलाह — अपना लग्न:" : "Personalize — your ascendant:"}</span>
            <select value={horaAsc == null ? "" : horaAsc} onChange={(e) => setHoraAsc(e.target.value === "" ? null : parseInt(e.target.value))} style={{ fontSize: T.fMicro, padding: "5px 8px", borderRadius: T.rSm, border: `1px solid ${C.line}`, background: C.panel, color: C.ivory, fontFamily: T.body, maxWidth: 180 }}>
              <option value="">{lang === "hi" ? "— चुनें —" : "— none —"}</option>
              {SIGNS.map((sg, i) => <option key={i} value={i}>{sg}</option>)}
            </select>
          </div>
          <div style={{ fontSize: T.fMicro, color: C.muted, marginTop: 5, fontStyle: "italic" }}>{lang === "hi" ? "लग्न नहीं पता? 'कुंडली' टैब में कुंडली बनाएँ।" : "Don't know it? Cast your chart in the Chart tab."}</div>
        </div>
      </div>

    </div>
  );
}

function RectifyModule({ form, place, ayanamsa, C, card }) {
  const [y, m, day] = (form.date || "1995-08-15").split("-").map(Number);
  const tz = (zoneOffset(place.zone, y, m, day)) ?? 5.5;
  const [hhB, miB] = (form.time || "06:30").split(":").map(Number);
  const centerMin = hhB * 60 + miB;
  const aya = ayanamsa || "lahiri";
  const [halfWin, setHalfWin] = useState(30);
  const [stepMin, setStepMin] = useState(4);
  const [sel, setSel] = useState(centerMin);
  const [events, setEvents] = useState([]);
  const [evDate, setEvDate] = useState("");
  const [evHouse, setEvHouse] = useState(7);
  useEffect(() => { setSel(centerMin); }, [centerMin]);

  const lo = centerMin - halfWin, hi = centerMin + halfWin;
  const selC = Math.max(lo, Math.min(hi, sel));
  const sweep = useMemo(() => rectSweep(y, m, day, tz, place.lat, place.lon, aya, centerMin, halfWin, stepMin), [y, m, day, tz, place.lat, place.lon, aya, centerMin, halfWin, stepMin]);
  const mk = useMemo(() => rectAtMin(y, m, day, tz, place.lat, place.lon, aya, selC), [y, m, day, tz, place.lat, place.lon, aya, selC]);
  const dash = useMemo(() => mahaTimelineAt(y, m, day, tz, selC, aya), [y, m, day, tz, selC, aya]);

  const YEAR = 365.25 * 86400000;
  const fmtMin = (t) => { const hh = Math.floor(t / 60), mm = Math.floor(t % 60), ss = Math.round((t - hh * 60 - mm) * 60); return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}:${String(Math.min(59, ss)).padStart(2, "0")}`; };
  const dms = (deg) => { const d0 = Math.floor(deg), m0 = Math.round((deg - d0) * 60); return `${d0}°${String(m0).padStart(2, "0")}'`; };
  const lordColor = { Sun: "#C2451E", Moon: "#5B7Fb0", Mars: "#B23B2E", Mercury: "#1F7A4D", Jupiter: "#A86A12", Venus: "#9A5BA3", Saturn: "#52606D", Rahu: "#6B4E8A", Ketu: "#7A6A52" };
  const HOUSES = [[7, "Marriage"], [5, "Childbirth"], [10, "New job / career"], [4, "Property / home"], [12, "Foreign move"], [9, "Higher education / father"], [2, "Wealth / family event"], [6, "Illness / surgery"], [8, "Bereavement / upheaval"]];
  const startMaha = dash.tl[0];
  const startBal = (startMaha.end - dash.birthMs) / YEAR;

  const addEvent = () => { if (!evDate) return; setEvents([...events, { id: Date.now(), date: evDate, house: evHouse }].sort((a, b) => a.date.localeCompare(b.date))); setEvDate(""); };
  const evRun = (e) => { const [ey, em, ed] = e.date.split("-").map(Number); const ms = Date.UTC(ey, em - 1, ed) - tz * 3600000; return runDashaAt(dash.tl, ms); };
  const houseLord = (h) => SIGN_LORD[(mk.sign + h - 1) % 12];

  const Marker = ({ label, children, color }) => (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "8px 2px", borderBottom: "1px solid #F1EADA", fontSize: 14, alignItems: "baseline" }}>
      <span style={{ ...T.label, color: C.muted }}>{label}</span>
      <span style={{ textAlign: "right", color: color || C.ivory }}>{children}</span>
    </div>
  );

  return (
    <div>
      <p style={{ color: C.muted, fontSize: 12.5, lineHeight: 1.55, margin: "0 0 14px" }}>
        Move the birth time and watch what's sensitive to it. The lagna shifts ~1° every 4 minutes; the navamsa (D-9) and shashtiamsa (D-60) ascendants and the KP sub-lord move faster — these are what a rectifier narrows by. Add known life events below to see which candidate time lands them on a fitting dasha. This is an instrument for your judgement, not an automatic answer.
      </p>

      {/* controls */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 14 }}>
        <div>
          <div style={{ ...T.label, color: C.muted, marginBottom: 5 }}>Window</div>
          <div style={{ display: "flex", gap: 5 }}>{[15, 30, 60].map((w) => <button key={w} onClick={() => setHalfWin(w)} style={{ padding: "5px 12px", borderRadius: 7, fontFamily: "Eczar, serif", fontSize: 13, cursor: "pointer", border: `1px solid ${halfWin === w ? C.gold : C.line}`, background: halfWin === w ? "rgba(168,106,18,.1)" : "transparent", color: halfWin === w ? C.gold : C.muted }}>±{w}m</button>)}</div>
        </div>
        <div>
          <div style={{ ...T.label, color: C.muted, marginBottom: 5 }}>Step</div>
          <div style={{ display: "flex", gap: 5 }}>{[1, 2, 4].map((st) => <button key={st} onClick={() => setStepMin(st)} style={{ padding: "5px 12px", borderRadius: 7, fontFamily: "Eczar, serif", fontSize: 13, cursor: "pointer", border: `1px solid ${stepMin === st ? C.gold : C.line}`, background: stepMin === st ? "rgba(168,106,18,.1)" : "transparent", color: stepMin === st ? C.gold : C.muted }}>{st}m</button>)}</div>
        </div>
      </div>

      {/* slider + selected markers */}
      <div style={{ ...card, padding: "16px 18px", borderTop: `3px solid ${C.gold}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
          <span style={{ fontFamily: "Eczar, serif", fontSize: 26, color: C.gold, fontVariantNumeric: "tabular-nums" }}>{fmtMin(selC)}</span>
          <span style={{ fontSize: 12, color: C.muted }}>candidate birth time {Math.abs(selC - centerMin) < 0.1 ? "(as entered)" : (selC > centerMin ? "+" : "−") + fmtMin(Math.abs(selC - centerMin)).slice(3) + " min"}</span>
        </div>
        <input type="range" min={lo} max={hi} step={0.25} value={selC} onChange={(e) => setSel(+e.target.value)} style={{ width: "100%", accentColor: C.gold, marginBottom: 14 }} />
        <Marker label="Lagna" color={C.ivory}>{SIGN_SHORT[mk.sign]} {dms(mk.deg)} · {NAKSHATRAS[mk.nak]} pada {mk.pada}</Marker>
        <Marker label="Navamsa D-9 lagna" color={C.gold}>{SIGN_SHORT[mk.d9]}</Marker>
        <Marker label="Shashtiamsa D-60 lagna" color={C.gold}>{SIGN_SHORT[mk.d60]}</Marker>
        <Marker label="KP ascendant sub-lord" color={lordColor[mk.subLord]}>{mk.subLord}</Marker>
        <Marker label="Starting mahadasha" color={lordColor[startMaha.lord]}>{startMaha.lord} · {startBal.toFixed(2)} yrs balance</Marker>
      </div>

      {/* sweep table */}
      <div style={{ ...T.label, color: C.muted, margin: `${T.s5}px 0 ${T.s2}px` }}>Sweep · transitions highlighted</div>
      <div style={{ ...card, padding: "4px 4px", maxHeight: 360, overflowY: "auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "62px 1fr 46px 46px 64px", gap: 6, padding: "7px 12px", ...T.label, color: C.muted, position: "sticky", top: 0, background: "#FBF5E7" }}>
          <span>Time</span><span>Lagna</span><span>D9</span><span>D60</span><span>Sub</span>
        </div>
        {sweep.map((r, i) => {
          const isSel = Math.abs(r.totalMin - selC) <= stepMin / 2;
          const ch = (on, val, key) => <span style={{ color: on ? C.gold : C.muted, fontWeight: on ? 600 : 400 }}>{val}{on && key !== "lagna" ? " ←" : ""}</span>;
          return (
            <div key={i} onClick={() => setSel(r.totalMin)} style={{ display: "grid", gridTemplateColumns: "62px 1fr 46px 46px 64px", gap: 6, padding: "6px 12px", borderTop: i ? "1px solid #EFE6D2" : "none", fontSize: 12.5, cursor: "pointer", background: isSel ? "rgba(168,106,18,.1)" : r.chSign ? "rgba(194,69,30,.06)" : "transparent", alignItems: "baseline", fontVariantNumeric: "tabular-nums" }}>
              <span style={{ color: isSel ? C.gold : C.ivory }}>{fmtMin(r.totalMin).slice(0, 5)}</span>
              <span style={{ color: r.chSign ? C.sindoor : C.ivory, fontWeight: r.chSign ? 600 : 400 }}>{SIGN_SHORT[r.sign]} {dms(r.deg)}{r.chSign ? " ⟵ sign" : ""}</span>
              {ch(r.chD9, SIGN_SHORT[r.d9])}{ch(r.chD60, SIGN_SHORT[r.d60])}{ch(r.chSub, r.subLord.slice(0, 3))}
            </div>
          );
        })}
      </div>

      {/* event anchors */}
      <div style={{ ...T.label, color: C.muted, margin: `${T.s5}px 0 ${T.s2}px` }}>Event anchors · dasha fit</div>
      <div style={{ ...card, padding: T.s4 }}>
        <div style={{ fontSize: 12, color: C.muted, marginBottom: 12, lineHeight: 1.5 }}>Add dated life events. For the candidate time above, each shows the running mahadasha–antardasha; a ✓ marks where that lord also rules the event's house. The fit that holds across all events points to the time.</div>
        <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 14, alignItems: "center" }}>
          <input type="date" value={evDate} onChange={(e) => setEvDate(e.target.value)} style={{ padding: "8px 10px", borderRadius: 7, border: `1px solid ${C.line}`, background: "#FFFDF7", color: C.ivory, fontFamily: "Spectral, serif", fontSize: 13.5 }} />
          <select value={evHouse} onChange={(e) => setEvHouse(+e.target.value)} style={{ padding: "8px 10px", borderRadius: 7, border: `1px solid ${C.line}`, background: "#FFFDF7", color: C.ivory, fontFamily: "Spectral, serif", fontSize: 13.5 }}>
            {HOUSES.map(([h, lbl]) => <option key={h} value={h}>{lbl} ({h}H)</option>)}
          </select>
          <button onClick={addEvent} style={{ padding: "8px 16px", borderRadius: 7, fontFamily: "Eczar, serif", fontSize: 13.5, cursor: "pointer", border: `1px solid ${C.gold}`, background: "rgba(168,106,18,.08)", color: C.gold }}>Add</button>
        </div>
        {events.length === 0 ? <div style={{ fontSize: 12.5, color: C.muted, fontStyle: "italic" }}>No events yet — marriage, a child's birth, or a career change are the usual anchors.</div> : (
          <div style={{ display: "grid", gap: 6 }}>
            {events.map((e) => {
              const rd = evRun(e), hl = houseLord(e.house);
              const hit = rd && (rd.maha === hl || rd.antar === hl);
              const lbl = (HOUSES.find(([h]) => h === e.house) || [e.house, "House " + e.house])[1];
              return (
                <div key={e.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, padding: "8px 11px", border: `1px solid ${C.line}`, borderRadius: 8 }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontFamily: "Eczar, serif", fontSize: 13.5, color: C.ivory }}>{lbl} <span style={{ color: C.muted, fontSize: 12 }}>· {e.house}H (lord {hl})</span></div>
                    <div style={{ fontSize: 11.5, color: C.muted }}>{e.date}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                    {rd ? <span style={{ fontSize: 13, color: C.ivory }}><span style={{ color: lordColor[rd.maha] }}>{rd.maha}</span>–<span style={{ color: lordColor[rd.antar] }}>{rd.antar}</span></span> : <span style={{ color: C.muted, fontSize: 12 }}>—</span>}
                    {hit && <span style={{ fontSize: 13, color: "#1F7A4D" }} title="dasha lord rules the event house">✓</span>}
                    <button onClick={() => setEvents(events.filter((x) => x.id !== e.id))} style={{ padding: "3px 8px", borderRadius: 6, fontSize: 12, cursor: "pointer", border: `1px solid ${C.line}`, background: "transparent", color: C.muted }}>✕</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <p style={{ color: C.muted, fontSize: 11.5, marginTop: 14, lineHeight: 1.55, fontStyle: "italic" }}>
        Rectification is judgement, not arithmetic — these markers and dasha fits narrow the field; they don't certify a time to the second. The ✓ checks only whether a running dasha lord rules the event house; a full rectification also weighs antardasha lords' placements, transits over the natal lagna, and the navamsa. Treat this as a workbench, and confirm against several independent events before trusting a time.
      </p>
    </div>
  );
}

function CalendarPage({ view, place, lang, onBack, C, card }) {
  const now = new Date();
  const tz = (zoneOffset(place.zone, now.getUTCFullYear(), now.getUTCMonth() + 1, now.getUTCDate())) ?? 5.5;
  const [q, setQ] = useState(view.type === "search" ? (view.q || "") : "");
  const MO = lang === "hi" ? ["जनवरी", "फ़रवरी", "मार्च", "अप्रैल", "मई", "जून", "जुलाई", "अगस्त", "सितंबर", "अक्तूबर", "नवंबर", "दिसंबर"] : ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const MOs = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const WD = lang === "hi" ? ["रवि", "सोम", "मंगल", "बुध", "गुरु", "शुक्र", "शनि"] : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const fmtFull = (ms) => { const d = new Date(ms + tz * 3600000); return `${WD[d.getUTCDay()]}, ${d.getUTCDate()} ${MOs[d.getUTCMonth()]} ${d.getUTCFullYear()}`; };

  const yearData = useMemo(() => {
    if (view.type !== "year") return null;
    const year = now.getUTCFullYear();
    const from = Date.UTC(year, 0, 1, 6) - tz * 3600000;
    const r = scanPanchangCalendar(from, tz, 366, 366, place);
    const all = [...r.festivals.map((f) => ({ ms: f.ms, kind: "festival", key: f.key })), ...r.fasts.map((f) => ({ ms: f.ms, kind: "fast", key: f.key }))]
      .filter((x) => new Date(x.ms + tz * 3600000).getUTCFullYear() === year).sort((a, b) => a.ms - b.ms);
    const byMonth = Array.from({ length: 12 }, () => []);
    for (const it of all) byMonth[new Date(it.ms + tz * 3600000).getUTCMonth()].push(it);
    return { year, byMonth };
  }, [view.type, tz, place]);

  const results = useMemo(() => view.type === "search" ? searchUpcoming(q, Date.now(), tz, 30, place) : null, [view.type, q, tz, place]);

  const labelOf = (it) => it.kind === "tithi"
    ? ((it.paksha ? (lang === "hi" ? (it.paksha === "Krishna" ? "कृष्ण " : "शुक्ल ") : it.paksha + " ") : "") + it.label)
    : (it.kind === "fast" ? obsLabel(lang, {key: it.key}) : trN(lang, FEST_NAME, it.key));

  const Row = ({ it, first }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 2px", borderTop: first ? "none" : `1px solid ${C.line}` }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: it.kind === "festival" ? C.gold : C.sindoor, flexShrink: 0 }} />
      <span style={{ flex: 1, fontFamily: T.serif, fontSize: T.fBody, color: C.ivory }}>{labelOf(it)}</span>
      <span style={{ fontSize: T.fSmall, color: C.gold, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>{fmtFull(it.ms)}</span>
    </div>
  );

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 60, background: C.bg, overflowY: "auto" }}>
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "0 18px 60px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, position: "sticky", top: 0, background: C.bg, padding: "14px 0 12px", zIndex: 2, borderBottom: `1px solid ${C.line}`, marginBottom: 18 }}>
          <button onClick={onBack} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "9px 15px", borderRadius: T.rMd, border: `1px solid ${C.line}`, background: C.panel, color: C.ivory, cursor: "pointer", fontFamily: T.serif, fontSize: T.fSmall }}>‹ {tr(lang, "backLabel")}</button>
          <span style={{ fontFamily: T.serif, fontSize: T.fHeading, color: C.gold }}>{view.type === "year" ? `${tr(lang, "calTitle")}${yearData ? " · " + yearData.year : ""}` : tr(lang, "searchTitle")}</span>
        </div>

        {view.type === "search" && (
          <div style={{ marginBottom: 20 }}>
            <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder={tr(lang, "searchPlaceholder")} style={{ width: "100%", boxSizing: "border-box", padding: "12px 15px", borderRadius: T.rMd, border: `1px solid ${C.line}`, background: C.panel, color: C.ivory, fontFamily: T.body, fontSize: T.fBody }} />
            <div style={{ fontSize: T.fMicro, color: C.muted, marginTop: 7 }}>{tr(lang, "searchHint")}</div>
          </div>
        )}

        {view.type === "year" && yearData && yearData.byMonth.map((items, mi) => items.length === 0 ? null : (
          <div key={mi} style={{ marginBottom: 16 }}>
            <div style={{ ...T.label, color: C.muted, marginBottom: 5 }}>{MO[mi]}</div>
            <div style={{ ...card, padding: "4px 14px" }}>{items.map((it, i) => <Row key={i} it={it} first={i === 0} />)}</div>
          </div>
        ))}
        {view.type === "year" && yearData && <div style={{ fontSize: T.fMicro, color: C.muted, fontStyle: "italic", padding: "2px 2px 14px", lineHeight: 1.5 }}>{tr(lang, "regionalNote")}</div>}

        {view.type === "search" && (results == null || results.length === 0
          ? <div style={{ color: C.muted, fontStyle: "italic", fontSize: T.fBody, padding: "16px 2px" }}>{q.trim() ? tr(lang, "noResults") : tr(lang, "searchHint")}</div>
          : <div style={{ ...card, padding: "4px 14px" }}>{results.map((it, i) => <Row key={i} it={it} first={i === 0} />)}</div>
        )}
      </div>
    </div>
  );
}

export default function KundliApp() {
  const C = {
    bg: "#FAF5EA", panel: "#FFFFFF", line: "#E7DDC6",
    gold: "#A86A12", sindoor: "#C2451E", ivory: "#3B3147", muted: "#8C8173",
  };
  const card = {
    background: "linear-gradient(180deg, #FFFFFF 0%, #FFFCF3 100%)",
    border: `1px solid ${C.line}`,
    borderRadius: T.rLg,
    boxShadow: T.e2,
  };

  const [form, setForm] = useState({ name: "", date: "1995-08-15", time: "06:30" });
  const [place, setPlace] = useState({ label: "New Delhi, India", lat: 28.61, lon: 77.21, zone: "Asia/Kolkata" });
  const [query, setQuery] = useState("New Delhi, India");
  const [sugs, setSugs] = useState([]);
  const [searching, setSearching] = useState(false);
  const [tzOverride, setTzOverride] = useState("");
  const [result, setResult] = useState(null);
  const [varga, setVarga] = useState("D1");
  const [refPt, setRefPt] = useState("lagna");
  const [ayanamsa, setAyanamsa] = useState("lahiri");
  const [err, setErr] = useState("");

  // Vimshottari drill-down: which sub-periods are expanded (keys "level:startMs").
  // Auto-opens the running antar/pratyantar/sookshma chain on each new cast.
  const [openD, setOpenD] = useState(() => new Set());
  const detectLang = () => { try { const ls = (navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || "en"]).map((x) => String(x || "").toLowerCase()); return ls.some((l) => l.startsWith("hi")) ? "hi" : "en"; } catch (e) { return "en"; } };
  // Language and screen survive a reload via the URL (?lang=hi&screen=prashna) —
  // browser storage is banned in this project, but the address bar is not storage.
  const [lang, setLang] = useState(() => { const v = urlPrefGet("lang"); return v === "hi" || v === "en" ? v : detectLang(); });
  const chooseLang = (v) => { setLang(v); urlPrefSet("lang", v); };
  const [mode, setMode] = useState(() => { const v = urlPrefGet("screen"); return v === "chart" || v === "prashna" || v === "daily" ? v : "daily"; });
  const chooseMode = (v) => { setMode(v); urlPrefSet("screen", v); };
  const toggleD = (k) => setOpenD((prev) => { const n = new Set(prev); n.has(k) ? n.delete(k) : n.add(k); return n; });
  useEffect(() => {
    if (!result || !result.curAntar) { setOpenD(new Set()); return; }
    const keys = new Set(["0:" + result.curAntar.start]);
    if (result.curPratya) keys.add("1:" + result.curPratya.start);
    if (result.curSookshma) keys.add("2:" + result.curSookshma.start);
    setOpenD(keys);
  }, [result]);
  const debounceRef = React.useRef(null);
  const seqRef = React.useRef(0);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const onQuery = (q) => {
    setQuery(q);
    setPlace(null);
    setTzOverride("");
    const offline = searchOffline(q);
    setSugs(offline);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (q.trim().length < 2) return;
    const mySeq = ++seqRef.current;
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const online = await searchOnline(q);
        if (mySeq !== seqRef.current) return; // a newer query superseded this one
        const seen = new Set(offline.map((o) => o.label.toLowerCase()));
        const merged = offline.concat(online.filter((o) => !seen.has(o.label.toLowerCase()))).slice(0, 8);
        setSugs(merged);
      } catch {
        /* offline results already shown */
      } finally {
        if (mySeq === seqRef.current) setSearching(false);
      }
    }, 350);
  };

  const choosePlace = (p) => {
    setPlace(p);
    setQuery(p.label);
    setSugs([]);
    setTzOverride("");
  };

  // resolve the UTC offset automatically from the place's timezone on the birth date
  const [yy, mm2, dd2] = (form.date || "").split("-").map(Number);
  const autoTz = place && place.zone && yy ? zoneOffset(place.zone, yy, mm2, dd2) : null;

  const loadChart = (c) => {
    if (!c || !c.form || !c.place) return;
    setForm(c.form); setPlace(c.place); setQuery(c.place.label);
    setTzOverride(c.tzOverride != null ? c.tzOverride : ""); setAyanamsa(c.ayanamsa || "lahiri");
    setErr("");
    try {
      const [y, m, day] = (c.form.date || "").split("-").map(Number);
      const [hh, mi] = (c.form.time || "").split(":").map(Number);
      const tz = c.tzOverride !== "" && c.tzOverride != null ? parseFloat(c.tzOverride) : zoneOffset(c.place.zone, y, m, day);
      setResult(computeKundli({ y, m, day, hh, mi, tz, lat: c.place.lat, lon: c.place.lon, ayanamsa: c.ayanamsa || "lahiri" }));
      setTimeout(() => { const el = document.getElementById("summary"); if (el) el.scrollIntoView({ behavior: "smooth" }); }, 150);
    } catch (e) { setErr(lang === "hi" ? "यह सहेजी हुई कुंडली नहीं खुल सकी — शायद यह ख़राब है। कोई और सहेजी कुंडली आज़माएँ या विवरण फिर से भरें।" : "This saved chart couldn't be loaded — it may be corrupted. Try another saved chart, or re-enter the details."); }
  };

  const generate = () => {
    setErr("");
    const [y, m, day] = (form.date || "").split("-").map(Number);
    const [hh, mi] = (form.time || "").split(":").map(Number);
    if (!y || isNaN(hh)) { setErr(lang === "hi" ? "जन्म की पूरी तारीख़ और समय भरें।" : "Enter a complete date and time of birth."); return; }
    // Use the picked place if present; otherwise, if the typed text resolves to
    // exactly one known place, adopt it and cast in the same click (no second press).
    let effPlace = place;
    if (!effPlace) {
      const offline = searchOffline(query);
      if (offline.length === 1) { effPlace = offline[0]; choosePlace(offline[0]); }
      else { setErr(lang === "hi" ? "जन्म स्थान लिखना शुरू करें और सुझावों में से चुनें।" : "Start typing the birth place and pick it from the suggestions."); return; }
    }
    const tz = tzOverride !== "" ? parseFloat(tzOverride) : zoneOffset(effPlace.zone, y, m, day);
    if (tz === null || isNaN(tz)) { setErr(lang === "hi" ? "इस स्थान का समय-क्षेत्र नहीं मिला — कृपया नीचे UTC ऑफ़सेट स्वयं भरें।" : "Couldn't resolve the timezone for this place — enter the UTC offset manually below."); return; }
    setResult(computeKundli({ y, m, day, hh, mi, tz, lat: effPlace.lat, lon: effPlace.lon, ayanamsa }));
    setTimeout(() => { const el = document.getElementById("summary"); if (el) el.scrollIntoView({ behavior: "smooth" }); }, 150);
  };

  const inputStyle = {
    width: "100%", boxSizing: "border-box", background: "#FFFDF7",
    border: `1px solid ${C.line}`, borderRadius: 6, color: C.ivory,
    padding: "10px 12px", fontSize: 15, fontFamily: "Spectral, serif", outline: "none",
  };
  const labelStyle = { ...T.label, color: C.muted, display: "block", marginBottom: 6 };

  const Eyebrow = ({ deva, en, id }) => (
    <div id={id} style={{ display: "flex", alignItems: "baseline", gap: T.s3, margin: `${T.s8}px 0 ${T.s4}px`, borderBottom: `1px solid ${C.line}`, paddingBottom: T.s3, scrollMarginTop: 64 }}>
      <span style={{ fontFamily: T.serif, color: C.gold, fontSize: T.fHeading }}>{deva}</span>
      <span style={{ ...T.label, color: C.muted }}>{en}</span>
    </div>
  );

  const [panchPlace, setPanchPlace] = useState(null); // panchang city, independent of birth place
  const [panchDate, setPanchDate] = useState(() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; });
  const [calOpen, setCalOpen] = useState(false);
  const [calYM, setCalYM] = useState(null);
  const [calView, setCalView] = useState(null);
  const [expandedEvent, setExpandedEvent] = useState(null); // which upcoming event card is open
  const panchEff = panchPlace || place;
  const [, setClockTick] = useState(0);
  useEffect(() => { const id = setInterval(() => setClockTick((t) => t + 1), 60000); return () => clearInterval(id); }, []);
  const todayISO = (() => {
    const nowU = new Date();
    let off = null;
    try { off = panchEff ? zoneOffset(panchEff.zone, nowU.getUTCFullYear(), nowU.getUTCMonth() + 1, nowU.getUTCDate()) : null; } catch (e) { off = null; }
    const d = off == null ? new Date(Date.now() - nowU.getTimezoneOffset() * 60000) : new Date(Date.now() + off * 3600000);
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
  })();
  const prevTodayRef = React.useRef(todayISO);
  useEffect(() => {
    if (prevTodayRef.current !== todayISO) {
      if (panchDate === prevTodayRef.current) setPanchDate(todayISO);
      prevTodayRef.current = todayISO;
    }
  }, [todayISO, panchDate]);
  const isPanchToday = panchDate === todayISO;
  const todayP = useMemo(() => {
    try {
      if (!panchEff) return null;
      if (isPanchToday) return computeTodayPanchang(panchEff, ayanamsa);
      const [py, pm, pd] = panchDate.split("-").map(Number);
      const ptz = (zoneOffset(panchEff.zone, py, pm, pd)) ?? 5.5;
      return computeTodayPanchang(panchEff, ayanamsa, Date.UTC(py, pm - 1, pd, 12) - ptz * 3600000);
    } catch { return null; }
  }, [panchEff, ayanamsa, panchDate, isPanchToday]);
  const calMarks = useMemo(() => {
    if (!calYM || !panchEff) return { fest: new Set(), fast: new Set() };
    try {
      const [cy, cm] = calYM.split("-").map(Number);
      const ctz = (zoneOffset(panchEff.zone, cy, cm, 1)) ?? 5.5;
      const first = new Date(Date.UTC(cy, cm - 1, 1));
      const gs = new Date(Date.UTC(cy, cm - 1, 1 - first.getUTCDay()));
      const fromMs = Date.UTC(gs.getUTCFullYear(), gs.getUTCMonth(), gs.getUTCDate(), 12) - ctz * 3600000;
      const r = scanPanchangCalendar(fromMs, ctz, 42, 46, panchEff);
      const toISO = (ms) => { const d = new Date(ms + ctz * 3600000); return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`; };
      return { fest: new Set(r.festivals.map((f) => toISO(f.ms))), fast: new Set(r.fasts.map((f) => toISO(f.ms))) };
    } catch (e) { return { fest: new Set(), fast: new Set() }; }
  }, [calYM, panchEff, ayanamsa]);

  const r = result;
  const curVarga = VARGAS.find((v) => v.k === varga) || VARGAS[0];
  const REFS = [
    { k: "lagna", deva: "लग्न", en: "Lagna" },
    { k: "surya", deva: "सूर्य", en: "Surya" },
    { k: "chandra", deva: "चन्द्र", en: "Chandra" },
    { k: "karakamsa", deva: "कारकांश", en: "Karakamsa" },
  ];
  const akRow = r ? r.rows.find((p) => p.name === r.ak) : null;
  const vAscSign = !r ? 0
    : refPt === "karakamsa" ? vargaSign(akRow.lon, "D9")              // Karakamsa = Atmakaraka's navamsa sign
    : refPt === "surya" ? vargaSign(r.sun.lon, varga)
    : refPt === "chandra" ? vargaSign(r.moon.lon, varga)
    : vargaSign(r.ascSid, varga);
  const refNote = !r ? "" :
    refPt === "surya" ? "houses counted from the Sun — Surya kundli" :
    refPt === "chandra" ? "houses counted from the Moon — Chandra kundli" :
    refPt === "karakamsa" ? `houses counted from ${r.ak}'s navamsa sign — Karakamsa` : "";
  const vPlanets = r
    ? r.rows.map((p) => {
        const vs = vargaSign(p.lon, varga);
        return { label: PLANET_GLYPH[p.name], house: ((vs - vAscSign + 12) % 12) + 1, retro: p.retro, deg: p.deg };
      })
    : [];

  return (
    <div style={{ minHeight: "100vh", background: `radial-gradient(1100px 700px at 85% -8%, rgba(200,122,28,.08), transparent 60%), radial-gradient(900px 700px at -12% 35%, rgba(106,90,200,.05), transparent 55%), ${C.bg}`, color: C.ivory, fontFamily: "Spectral, Georgia, serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Eczar:wght@500;600;700&family=Spectral:ital,wght@0,300;0,400;0,600;1,400&display=swap');
        html { scroll-behavior: smooth; }
        *, *::before, *::after { box-sizing: border-box; min-width: 0; }
        img, svg { max-width: 100%; height: auto; }
        button { font: inherit; }
        .hscroll { scrollbar-width: none; -ms-overflow-style: none; }
        .hscroll::-webkit-scrollbar { display: none; }
        .drawline { stroke-dasharray: 1700; stroke-dashoffset: 1700; animation: draw 1.5s cubic-bezier(.4,0,.2,1) forwards; }
        @keyframes draw { to { stroke-dashoffset: 0; } }
        @keyframes riseIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
        @keyframes softpulse { 0%, 100% { opacity: .35; } 50% { opacity: .8; } }
        .rise { animation: riseIn .55s cubic-bezier(.2,.7,.3,1) both; }
        .rise2 { animation: riseIn .55s cubic-bezier(.2,.7,.3,1) .08s both; }
        @media (prefers-reduced-motion: reduce) {
          .drawline { animation: none; stroke-dashoffset: 0; }
          .rise, .rise2 { animation: none; }
          * { transition: none !important; }
        }
        input, select, button { transition: border-color .15s ease, box-shadow .15s ease, background .15s ease, transform .1s ease, color .15s ease; }
        input:focus, select:focus, button:focus-visible { border-color: #A86A12 !important; box-shadow: 0 0 0 3px rgba(168,106,18,.22); outline: none; }
        .castBtn:hover { filter: brightness(1.07); box-shadow: 0 8px 24px rgba(168,106,18,.32); }
        .castBtn:active { transform: translateY(1px); }
        .chip:hover { border-color: #A86A1266 !important; color: #A86A12 !important; }
        .sug:hover { background: rgba(168,106,18,.10) !important; }
        table { border-collapse: collapse; width: 100%; }
        td, th { padding: 10px 8px; border-bottom: 1px solid #EBE2CE; text-align: left; font-size: 14px; }
        tbody tr:last-child td { border-bottom: none; }
        tbody tr:hover td { background: rgba(168,106,18,.05); }
        th { font-size: 10.5px; letter-spacing: .16em; text-transform: uppercase; color: #8C8173; font-weight: 400; }
      `}</style>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "40px 20px 80px" }}>
        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 8, marginBottom: -18 }}>
          <span style={{ fontSize: T.fMicro, color: C.muted, letterSpacing: ".08em" }}>भाषा · Language</span>
          <span style={{ display: "inline-flex", border: `1px solid ${C.line}`, borderRadius: T.rPill, overflow: "hidden", background: C.panel }}>
            {[["hi", "हिन्दी"], ["en", "English"]].map(([v, l]) => (
              <button key={v} onClick={() => chooseLang(v)} aria-label={v === "hi" ? "हिन्दी चुनें" : "Switch to English"} style={{ padding: "5px 13px", border: "none", cursor: "pointer", fontFamily: "Eczar, serif", fontSize: 12.5, background: lang === v ? "rgba(168,106,18,.12)" : "transparent", color: lang === v ? C.gold : C.muted, fontWeight: lang === v ? 600 : 400 }}>{l}</button>
            ))}
          </span>
        </div>
        {/* hero */}
        <header className="rise" style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ fontFamily: "Eczar, serif", color: C.gold, fontSize: 15, letterSpacing: "0.34em" }}>ज्योतिष</div>
          <h1 style={{ fontFamily: "Eczar, serif", fontWeight: 700, fontSize: 46, margin: "8px 0 6px", lineHeight: 1.08 }}>
            <span style={{ color: C.gold }}>Ganak</span>
          </h1>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, margin: "10px 0 12px" }}>
            <span style={{ height: 1, width: 64, background: `linear-gradient(90deg, transparent, ${C.gold}99)` }} />
            <span style={{ color: C.gold, fontSize: 13 }}>ॐ</span>
            <span style={{ height: 1, width: 64, background: `linear-gradient(270deg, transparent, ${C.gold}99)` }} />
          </div>
          <p style={{ color: C.muted, fontSize: 14.5, margin: 0, letterSpacing: ".02em" }}>
            {lang === "hi" ? "वैदिक जन्म कुंडली · लाहिरी अयनांश · पूर्ण-राशि भाव · विंशोत्तरी दशा" : "Vedic birth chart · Lahiri ayanamsa · whole-sign houses · Vimshottari dasha"}
          </p>
        </header>

        <div style={{ display: "flex", justifyContent: "center", marginBottom: T.s5 }}>
          <div style={{ display: "inline-flex", background: "#F1E9D5", borderRadius: T.rMd, padding: 3, border: `1px solid ${C.line}` }}>
            {[["daily", lang === "hi" ? "आज · पंचांग" : "Daily"], ["chart", lang === "hi" ? "कुंडली" : "Chart"], ["prashna", lang === "hi" ? "प्रश्न" : "Prashna"]].map(([mk, label]) => (
              <button key={mk} onClick={() => chooseMode(mk)} style={{ padding: "9px 26px", borderRadius: T.rSm, fontFamily: T.serif, fontSize: T.fBody, cursor: "pointer", border: "none", background: mode === mk ? C.panel : "transparent", color: mode === mk ? C.gold : C.muted, fontWeight: mode === mk ? 600 : 400, boxShadow: mode === mk ? T.e1 : "none", transition: "all .15s" }}>{label}</button>
            ))}
          </div>
        </div>

        {calView && <CalendarPage view={calView} place={panchEff} lang={lang} onBack={() => setCalView(null)} C={C} card={card} />}

        {mode === "prashna" && (
          <PrashnaScreen lat={panchEff?.lat} lon={panchEff?.lon} placeLabel={panchEff?.label} lang={lang} />
        )}

        {mode === "chart" && r && (
          <nav className="rise hscroll" style={{ position: "sticky", top: 8, zIndex: 30, display: "flex", gap: 6, overflowX: "auto", padding: "8px 10px", margin: "0 -4px 4px", background: "rgba(250,245,234,.92)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", border: `1px solid ${C.line}`, borderRadius: 12, boxShadow: "0 4px 14px rgba(110,82,24,.08)" }}>
            {[["#chart", "Kundli"], ["#yogas", "Yogas"], ["#planets", "Grahas"], ["#kp", "KP sub-lords"], ["#ksig", "KP significators"], ["#match", "Matching"], ["#karakas", "Karakas"], ["#shadbala", "Shadbala"], ["#special", "Special"], ["#chalit", "Bhava Chalit"], ["#av", "Ashtakavarga"], ["#arudha", "Arudha"], ["#rectify", "Rectify"], ["#bnn", "BNN"], ["#bhrigu", "Bhrigu"], ["#dasha", "Dasha"], ["#reading", "Reading"]].map(([href, label]) => (
              <a key={href} href={href} className="chip" style={{ whiteSpace: "nowrap", textDecoration: "none", fontSize: 12.5, padding: "6px 12px", borderRadius: 8, border: `1px solid ${C.line}`, color: C.muted, background: "#FBF5E7", fontFamily: "Spectral, serif" }}>{label}</a>
            ))}
          </nav>
        )}

        {mode === "daily" && !todayP && (
          <div className="rise" style={{ marginBottom: 20 }}>
            <div style={{ ...card, padding: "18px 20px", borderColor: "#E0B25E" }}>
              <div style={{ fontFamily: "Eczar, serif", fontSize: 17, color: C.ivory, marginBottom: 6 }}>
                {lang === "hi" ? "इस स्थान या तारीख़ के लिए आज का पंचांग नहीं बन सका।" : "We couldn't work out the panchang for this place or date."}
              </div>
              <div style={{ fontSize: 13.5, color: C.muted, marginBottom: 14, lineHeight: 1.55 }}>
                {lang === "hi" ? "कृपया दूसरी तारीख़ चुनें, या नीचे कोई और शहर खोजें।" : "Try picking a different date, or search for another city below."}
              </div>
              <div style={{ maxWidth: 320 }}><PlaceInput value={panchEff} onPick={setPanchPlace} C={C} lang={lang} /></div>
            </div>
          </div>
        )}

        {mode === "daily" && todayP && (
          <>
            <div className="rise" style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginBottom: 20 }}>
              <div style={{ flex: "1 1 200px", minWidth: 180 }}><PlaceInput value={panchEff} onPick={setPanchPlace} C={C} lang={lang} /></div>
              {(() => {
                const [py, pm, pd] = panchDate.split("-").map(Number);
                const baseUTC = Date.UTC(py, pm - 1, pd);
                const WD = lang === "hi" ? ["रवि", "सोम", "मंगल", "बुध", "गुरु", "शुक्र", "शनि"] : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
                const WD1 = lang === "hi" ? ["र", "सो", "मं", "बु", "गु", "शु", "श"] : ["S", "M", "T", "W", "T", "F", "S"];
                const MO = lang === "hi" ? ["जन", "फ़र", "मार्च", "अप्रैल", "मई", "जून", "जुल", "अग", "सित", "अक्तू", "नव", "दिस"] : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                const MOL = lang === "hi" ? ["जनवरी", "फ़रवरी", "मार्च", "अप्रैल", "मई", "जून", "जुलाई", "अगस्त", "सितंबर", "अक्तूबर", "नवंबर", "दिसंबर"] : ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                const wd = new Date(baseUTC).getUTCDay();
                const dateLabel = `${WD[wd]}, ${pd} ${MO[pm - 1]} ${py}`;
                const iso = (y, m, d) => `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
                const step = (delta) => { const dt = new Date(baseUTC); dt.setUTCDate(dt.getUTCDate() + delta); setPanchDate(iso(dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate())); };
                const shiftMonth = (delta) => { const [cy, cm] = calYM.split("-").map(Number); const dt = new Date(Date.UTC(cy, cm - 1 + delta, 1)); setCalYM(`${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, "0")}`); };
                const openCal = () => { setCalYM(panchDate.slice(0, 7)); setCalOpen(true); };
                const arrowBtn = { padding: "0 14px", height: "100%", cursor: "pointer", border: "none", background: "transparent", color: C.gold, fontSize: 20, lineHeight: 1, fontFamily: "Eczar, serif" };
                let grid = null, hdr = "";
                if (calOpen && calYM) {
                  const [cy, cm] = calYM.split("-").map(Number);
                  hdr = `${MOL[cm - 1]} ${cy}`;
                  const startDow = new Date(Date.UTC(cy, cm - 1, 1)).getUTCDay();
                  grid = [];
                  for (let i = 0; i < 42; i++) { const dt = new Date(Date.UTC(cy, cm - 1, 1 - startDow + i)); grid.push({ y: dt.getUTCFullYear(), m: dt.getUTCMonth() + 1, d: dt.getUTCDate(), inMonth: dt.getUTCMonth() + 1 === cm }); }
                }
                return (
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    <div style={{ position: "relative" }}>
                      <div style={{ display: "inline-flex", alignItems: "stretch", height: T.ctrlH, boxSizing: "border-box", border: `1px solid ${C.line}`, borderRadius: T.rMd, background: C.panel, overflow: "hidden", boxShadow: "0 1px 2px rgba(60,40,10,.05)" }}>
                        <button onClick={() => step(-1)} style={arrowBtn} aria-label={lang === "hi" ? "पिछला दिन" : "Previous day"}>‹</button>
                        <button onClick={openCal} aria-label={lang === "hi" ? "तारीख़ चुनें" : "Choose date"} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "0 14px", borderLeft: `1px solid ${C.line}`, borderRight: `1px solid ${C.line}`, background: calOpen ? "rgba(168,106,18,.08)" : "transparent", borderTop: "none", borderBottom: "none", cursor: "pointer", height: "100%" }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0 }}><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="16" y1="2" x2="16" y2="6" /></svg>
                          <span style={{ fontFamily: "Eczar, serif", fontSize: 15, color: C.ivory, whiteSpace: "nowrap" }}>{dateLabel}</span>
                          <span style={{ color: C.gold, fontSize: 11, transform: calOpen ? "rotate(180deg)" : "none", transition: "transform .15s" }}>▾</span>
                        </button>
                        <button onClick={() => step(1)} style={arrowBtn} aria-label={lang === "hi" ? "अगला दिन" : "Next day"}>›</button>
                      </div>
                      {calOpen && grid && (
                        <>
                          <div onClick={() => setCalOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 40 }} />
                          <div style={{ position: "absolute", top: "calc(100% + 8px)", left: 0, zIndex: 41, background: C.panel, border: `1px solid ${C.line}`, borderRadius: 14, boxShadow: "0 14px 36px rgba(60,40,10,.17)", padding: 14, width: 318 }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                              <button onClick={() => shiftMonth(-1)} style={{ ...arrowBtn, padding: "4px 12px", fontSize: 18 }} aria-label="Previous month">‹</button>
                              <span style={{ fontFamily: "Eczar, serif", fontSize: 16, color: C.ivory }}>{hdr}</span>
                              <button onClick={() => shiftMonth(1)} style={{ ...arrowBtn, padding: "4px 12px", fontSize: 18 }} aria-label="Next month">›</button>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, marginBottom: 3 }}>
                              {WD1.map((w, i) => <div key={i} style={{ textAlign: "center", fontSize: 10.5, color: C.muted, fontWeight: 600, padding: "3px 0" }}>{w}</div>)}
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
                              {grid.map((c, i) => {
                                const cIso = iso(c.y, c.m, c.d);
                                const isT = cIso === todayISO, isSel = cIso === panchDate;
                                const hasFest = calMarks.fest.has(cIso), hasFast = calMarks.fast.has(cIso);
                                return (
                                  <button key={i} onClick={() => { setPanchDate(cIso); setCalOpen(false); }} style={{ position: "relative", aspectRatio: "1", display: "flex", alignItems: "center", justifyContent: "center", border: isT && !isSel ? `1.5px solid ${C.gold}` : "1.5px solid transparent", borderRadius: T.rSm, cursor: "pointer", background: isSel ? C.gold : "transparent", color: isSel ? "#FFF8EC" : c.inMonth ? C.ivory : "#C9BFA8", fontFamily: "Eczar, serif", fontSize: 14.5, padding: 0 }}>
                                    {c.d}
                                    {(hasFest || hasFast) && <span style={{ position: "absolute", bottom: 3, display: "flex", gap: 2 }}>
                                      {hasFest && <span style={{ width: 4, height: 4, borderRadius: "50%", background: isSel ? "#FFF8EC" : C.gold }} />}
                                      {hasFast && <span style={{ width: 4, height: 4, borderRadius: "50%", background: isSel ? "#FFF8EC" : C.sindoor }} />}
                                    </span>}
                                  </button>
                                );
                              })}
                            </div>
                            <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 10, fontSize: 10.5, color: C.muted }}>
                              <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><span style={{ width: 6, height: 6, borderRadius: "50%", background: C.gold }} /> {lang === "hi" ? "पर्व" : "Festival"}</span>
                              <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><span style={{ width: 6, height: 6, borderRadius: "50%", background: C.sindoor }} /> {lang === "hi" ? "व्रत" : "Fast"}</span>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                    {!isPanchToday && <button onClick={() => setPanchDate(todayISO)} style={{ height: T.ctrlH, boxSizing: "border-box", padding: "0 16px", borderRadius: T.rMd, fontFamily: T.serif, fontSize: 13.5, cursor: "pointer", border: `1px solid ${C.gold}`, background: "rgba(168,106,18,.08)", color: C.gold }}>{lang === "hi" ? "आज" : "Today"}</button>}
                  </div>
                );
              })()}
            </div>
            {panchEff && <div style={{ fontSize: T.fMicro, color: C.muted, margin: "-12px 0 16px", fontStyle: "italic" }}>{lang === "hi" ? `सभी समय ${panchEff.label} के अनुसार` : `All times shown for ${panchEff.label}`}</div>}
            <MuhuratHub todayP={todayP} place={panchEff} lang={lang} ayanamsa={ayanamsa} isToday={isPanchToday} onCal={setCalView} C={C} card={card} />

            <div className="rise2" style={{ ...card, padding: "16px 20px", marginTop: 12 }}>
              <div style={{ ...T.label, color: C.muted, marginBottom: 4 }}>
                {lang === "hi" ? "आगामी ग्रह गोचर" : "Upcoming planetary events"}
              </div>
              <div style={{ fontSize: 11.5, color: C.muted, fontStyle: "italic", marginBottom: 10, lineHeight: 1.45 }}>
                {lang === "hi" ? "आने वाले दिनों में ग्रह किस राशि में प्रवेश करते हैं या वक्री/मार्गी होते हैं" : "when each planet changes sign, or turns retrograde or direct, in the days ahead"}
              </div>
              {todayP.events.map((e2) => {
                const ed = eventDetail(e2, Date.now());
                const isExp = expandedEvent === (e2.t + e2.label);
                return (
                  <div key={e2.t + e2.label} style={{ borderBottom: `1px solid #F1EADA`, padding: "10px 2px" }}>
                    <button
                      onClick={() => setExpandedEvent(isExp ? null : (e2.t + e2.label))}
                      style={{ width: "100%", textAlign: "left", background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}
                    >
                      <span style={{ fontSize: 13.5, display: "flex", gap: 14, alignItems: "baseline", flex: 1 }}>
                        <span style={{ color: C.gold, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap", minWidth: 92, fontSize: 12.5 }}>
                          {new Date(e2.t + todayP.tz * 3600000).toLocaleDateString(lang === "hi" ? "hi-IN" : "en-US", { month: "short", day: "numeric", timeZone: "UTC" })} · {fmtTime(e2.t, todayP.tz)}
                        </span>
                        <span style={{ color: e2.label.includes("℞") ? C.sindoor : C.ivory, flex: 1, overflow: "hidden", textOverflow: "ellipsis" }}>{e2.label}</span>
                      </span>
                      <span style={{ color: C.muted, fontSize: 11, whiteSpace: "nowrap", fontWeight: 500 }}>{ed.timeStr}</span>
                      <span style={{ color: C.muted, fontSize: 13, transform: isExp ? "rotate(180deg)" : "none", transition: "transform .2s" }}>▼</span>
                    </button>
                    {isExp && (() => {
                      const pl = e2.planet || "Sun";
                      const span = PLANET_PERIOD_DAYS[pl] || 400;
                      const g = planetGochar(pl, Date.now() - 60 * 86400000, span + 120);
                      const nowMs = Date.now();
                      const curIdx = g.seq.reduce((acc, x, i) => (x.enter === null || x.enter <= nowMs ? i : acc), 0);
                      return (
                        <div style={{ marginTop: 10, paddingTop: 12, borderTop: `1px solid #EEDCC4`, fontSize: 13, color: C.ivory, lineHeight: 1.55 }}>
                          <div style={{ fontSize: 12.5, color: C.muted, fontStyle: "italic", marginBottom: 12 }}>{ed.desc}</div>
                          <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: ".1em", color: C.gold, marginBottom: 2, fontWeight: 600 }}>
                            {PLANET_DEVA[pl]} {pl} {lang === "hi" ? "राशि गोचर" : "Rashi Gochar"}
                          </div>
                          <div style={{ fontSize: 11, color: C.muted, fontStyle: "italic", marginBottom: 10 }}>
                            {lang === "hi" ? "यह ग्रह अभी किस राशि से गुज़र रहा है" : "which zodiac sign this planet is currently moving through"}
                          </div>
                          <div style={{ position: "relative", paddingLeft: 4 }}>
                            {g.seq.map((x, i) => {
                              const isCur = i === curIdx;
                              const dur = x.enter && x.exit ? fmtDur(x.exit - x.enter) : x.enter && !x.exit ? "ongoing" : null;
                              const stationsInSign = g.stations.filter((st) => (x.enter ? st.t >= x.enter : true) && (x.exit ? st.t < x.exit : true));
                              return (
                                <div key={i} style={{ display: "flex", gap: 12, paddingBottom: 14 }}>
                                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                                    <span style={{ width: 11, height: 11, borderRadius: 6, background: isCur ? C.gold : "#D8C9A8", boxShadow: isCur ? `0 0 8px ${C.gold}88` : "none", zIndex: 1 }} />
                                    {i < g.seq.length - 1 && <span style={{ width: 2, flex: 1, background: "#E4D7BD", marginTop: 2 }} />}
                                  </div>
                                  <div style={{ paddingBottom: 2, flex: 1 }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "baseline", flexWrap: "wrap" }}>
                                      <span style={{ fontFamily: "Eczar, serif", fontSize: 15, color: isCur ? C.gold : C.ivory, fontWeight: isCur ? 700 : 500 }}>
                                        {SIGNS[x.sign].split(" ")[0]}
                                      </span>
                                      {dur && <span style={{ fontSize: 11, color: C.muted }}>{dur}</span>}
                                    </div>
                                    <div style={{ fontSize: 11.5, color: C.muted, marginTop: 2, fontVariantNumeric: "tabular-nums" }}>
                                      {x.enter ? new Date(x.enter + todayP.tz * 3600000).toLocaleDateString(lang === "hi" ? "hi-IN" : "en-US", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }) + " · " + fmtTime(x.enter, todayP.tz) : (lang === "hi" ? "पहले से गोचर में" : "transiting since before")}
                                      {isCur && <span style={{ color: C.gold, fontWeight: 600 }}>{lang === "hi" ? " · अभी यहाँ" : " · now here"}</span>}
                                    </div>
                                    {stationsInSign.map((st, si) => (
                                      <div key={si} style={{ fontSize: 11, color: C.sindoor, marginTop: 3 }}>
                                        ↺ {lang === "hi" ? (st.retro ? "वक्री होता है" : "मार्गी होता है") : ("turns " + (st.retro ? "retrograde" : "direct"))} — {new Date(st.t + todayP.tz * 3600000).toLocaleDateString(lang === "hi" ? "hi-IN" : "en-US", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          <div style={{ fontSize: 10.5, color: C.muted, marginTop: 4, fontStyle: "italic" }}>{lang === "hi" ? "सायन (लाहिरी) · समय " : "Sidereal (Lahiri) · times in "}{(panchEff && panchEff.label) || (lang === "hi" ? "स्थानीय" : "local")}{lang === "hi" ? " समय अनुसार · धीमे ग्रहों हेतु ±1 दिन" : " time · ±1 day for slow planets"}</div>
                        </div>
                      );
                    })()}
                  </div>
                );
              })}
            </div>

          </>
        )}

        {mode === "chart" && (
          <>
        {/* birth details */}
        <section className="rise2" style={{ ...card, padding: 24 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 14 }}>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>{lang === "hi" ? "नाम" : "Name"}</label>
              <input style={inputStyle} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder={lang === "hi" ? "जैसे: प्रिया शर्मा" : "e.g. Priya Sharma"} />
            </div>
            <div>
              <label style={labelStyle}>{lang === "hi" ? "जन्म तिथि" : "Date of birth"}</label>
              <input type="date" style={inputStyle} value={form.date} onChange={(e) => set("date", e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>{lang === "hi" ? "जन्म समय" : "Time of birth"}</label>
              <input type="time" style={inputStyle} value={form.time} onChange={(e) => set("time", e.target.value)} />
            </div>
            <div style={{ gridColumn: "1 / -1", position: "relative" }}>
              <label style={labelStyle}>{lang === "hi" ? "जन्म स्थान" : "Place of birth"}</label>
              <input
                style={inputStyle}
                value={query}
                onChange={(e) => onQuery(e.target.value)}
                placeholder={lang === "hi" ? "शहर या गाँव का नाम लिखना शुरू करें…" : "Start typing a city or village name…"}
                autoComplete="off"
              />
              {sugs.length > 0 && !place && (
                <div style={{ position: "absolute", left: 0, right: 0, top: "100%", zIndex: 10, background: "#FFFFFF", border: `1px solid ${C.gold}`, borderRadius: 8, marginTop: 4, overflow: "hidden", boxShadow: "0 12px 30px rgba(95,70,20,.18)" }}>
                  {sugs.map((p) => (
                    <button
                      key={p.label + p.lat}
                      onClick={() => choosePlace(p)}
                      className="sug"
                      style={{ display: "block", width: "100%", textAlign: "left", padding: "10px 14px", background: "transparent", border: "none", borderBottom: `1px solid ${C.line}`, color: C.ivory, fontFamily: "Spectral, serif", fontSize: 14.5, cursor: "pointer" }}
                    >
                      {p.label}
                      <span style={{ color: C.muted, fontSize: 12, marginLeft: 8 }}>
                        {Math.abs(p.lat).toFixed(2)}°{p.lat >= 0 ? "N" : "S"}, {Math.abs(p.lon).toFixed(2)}°{p.lon >= 0 ? "E" : "W"}
                      </span>
                    </button>
                  ))}
                  {searching && <div style={{ padding: "8px 14px", color: C.muted, fontSize: 12 }}>{lang === "hi" ? "और स्थान खोजे जा रहे हैं…" : "Searching more places…"}</div>}
                </div>
              )}
              {place && (
                <p style={{ color: C.muted, fontSize: 12.5, margin: "8px 0 0" }}>
                  <span style={{ color: C.gold }}>✓</span>{" "}
                  {Math.abs(place.lat).toFixed(2)}°{place.lat >= 0 ? "N" : "S"}, {Math.abs(place.lon).toFixed(2)}°{place.lon >= 0 ? "E" : "W"}
                  {place.zone && <> · {place.zone}</>}
                  {autoTz !== null && <> · UTC{autoTz >= 0 ? "+" : ""}{autoTz}{lang === "hi" ? " (जन्म तिथि पर)" : " on the birth date"}{tzOverride !== "" && (lang === "hi" ? " (बदला गया)" : " (overridden)")}</>}
                </p>
              )}
            </div>
            <div>
              <label style={labelStyle}>{lang === "hi" ? "UTC ऑफ़सेट (स्वतः)" : "UTC offset (auto)"}</label>
              <input
                type="number" step="0.25" style={inputStyle}
                value={tzOverride !== "" ? tzOverride : autoTz ?? ""}
                onChange={(e) => setTzOverride(e.target.value)}
                placeholder={lang === "hi" ? "जैसे: +5.5" : "e.g. +5.5"}
              />
            </div>
          </div>
          {err && <p style={{ color: C.sindoor, fontSize: 14, margin: "12px 0 0" }}><span aria-hidden="true">⚠ </span>{err}</p>}
          <div style={{ marginTop: 16 }}>
            <label style={labelStyle}>{lang === "hi" ? "अयनांश" : "Ayanamsa"}</label>
            <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
              {Object.entries(AYANAMSA).map(([k, v]) => (
                <button key={k} onClick={() => setAyanamsa(k)}
                  style={{ flex: 1, padding: "9px 10px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600,
                    border: ayanamsa === k ? "1.5px solid #A86A12" : "1px solid #D9CCAE",
                    background: ayanamsa === k ? "rgba(168,106,18,.10)" : "#FBF6EC",
                    color: ayanamsa === k ? C.gold : C.muted }}>
                  {v.label}
                </button>
              ))}
            </div>
            <p style={{ color: C.muted, fontSize: 11.5, margin: "6px 0 0", lineHeight: 1.5 }}>
              {lang === "hi"
                ? "लाहिरी सरकारी/वैदिक मानक है। KP (कृष्णमूर्ति) हर स्थिति को लगभग 5′48″ पहले खिसकाता है — कृष्णमूर्ति पद्धति के उप-स्वामी कार्य हेतु आवश्यक।"
                : "Lahiri is the government/Vedic standard. KP (Krishnamurti) shifts every position ~5′48″ earlier — required for Krishnamurti Paddhati sub-lord work."}
            </p>
          </div>
          <button
            onClick={generate}
            className="castBtn" style={{ marginTop: 18, width: "100%", padding: "14px 0", background: `linear-gradient(180deg, #E08A22, #C9711A 55%, #B0610F)`, color: "#FFF8E9", border: "1px solid #D98E33", borderRadius: 9, fontFamily: "Eczar, serif", fontWeight: 700, fontSize: 17, letterSpacing: "0.07em", cursor: "pointer", boxShadow: "0 6px 18px rgba(168,106,18,.25)" }}
          >
            {lang === "hi" ? "कुंडली बनाएँ" : "Cast the chart"}
          </button>
          <p style={{ color: C.muted, fontSize: 12, margin: "10px 0 0", lineHeight: 1.5 }}>
            {lang === "hi"
              ? "UTC ऑफ़सेट जन्म स्थान और तिथि से स्वतः निकाला जाता है, ऐतिहासिक डेलाइट सेविंग सहित। सूर्य और चन्द्र आर्क-सेकंड परिशुद्धता वाले एफ़ेमेरिस (Meeus/VSOP) से, और पाँच तारा-ग्रह VSOP87 से (प्रकाश-काल, वार्षिक विपथन व नमन सहित) — लगभग आर्क-सेकंड तक सटीक स्थितियाँ।"
              : "The UTC offset is resolved automatically from the birth place and date, including historical daylight saving. Sun and Moon use an arc-second ephemeris (Meeus/VSOP), and the five star-planets use VSOP87 with light-time, annual aberration, and nutation — apparent positions accurate to about an arc-second, validated against Meeus's worked example (Venus) to 0.8″."}
          </p>
        </section>

        <ChartVault snapshot={{ form, place, tzOverride, ayanamsa }} result={result} onLoad={loadChart} C={C} card={card} lang={lang} />

        {/* kundali matching */}
        <Eyebrow id="match" deva="कुण्डली मिलान" en="Kundali matching · Guna Milan" />
        <MatchMaker C={C} card={card} computeKundli={computeKundli} />
          </>
        )}

        {mode === "chart" && r && (
          <>
            {/* identity strip */}
            <Eyebrow id="summary" deva="जन्म विवरण" en="Birth summary" />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
              {[
                ["Lagna (Ascendant)", `${SIGNS[r.ascSign].split(" ")[0]} ${fmtDeg(r.ascDeg)}`],
                ["Rashi (Moon sign)", SIGNS[r.moon.sign].split(" ")[0]],
                ["Janma Nakshatra", `${NAKSHATRAS[r.moon.nak]} · pada ${r.moon.pada}`],
                ["Surya (Sun sign)", SIGNS[r.sun.sign].split(" ")[0]],
              ].map(([k, v]) => (
                <div key={k} style={{ ...card, padding: "14px 16px" }}>
                  <div style={{ ...T.label, color: C.muted, marginBottom: 6 }}>{k}</div>
                  <div style={{ fontFamily: "Eczar, serif", fontSize: 17, color: C.gold, overflowWrap: "anywhere" }}>{v}</div>
                </div>
              ))}
            </div>

            {/* chart */}
            <Eyebrow id="chart" deva="षोडशवर्ग" en={`${curVarga.k} · ${curVarga.name}`} />
            <div className="rise" style={{ ...card, padding: "20px 14px 18px" }}>
              {/* reference lagna: contained segmented control, wraps 4→2×2 on narrow screens */}
              <div style={{ margin: "0 4px 12px" }}>
                <div style={{ ...T.label, color: C.muted, marginBottom: 7, textAlign: "center" }}>Houses counted from</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 4, background: "#F4ECD9", border: `1px solid ${C.line}`, borderRadius: 12, padding: 4 }}>
                  {REFS.map((rf) => (
                    <button key={rf.k} onClick={() => setRefPt(rf.k)}
                      style={{ padding: "8px 4px", borderRadius: 9, cursor: "pointer", fontFamily: "Spectral, serif", fontSize: 12.5, lineHeight: 1.25, border: rf.k === refPt ? `1px solid ${C.gold}55` : "1px solid transparent", background: rf.k === refPt ? "#FFFFFF" : "transparent", color: rf.k === refPt ? C.gold : C.muted, boxShadow: rf.k === refPt ? "0 2px 8px rgba(110,82,24,.12)" : "none", fontWeight: rf.k === refPt ? 600 : 400 }}>
                      <span style={{ fontFamily: "Eczar, serif", display: "block", fontSize: 13 }}>{rf.deva}</span>
                      {rf.en}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ fontSize: 11.5, color: C.muted, textAlign: "center", margin: "0 4px 8px", fontStyle: "italic", lineHeight: 1.4 }}>
                {lang === "hi" ? "षोडशवर्ग हर एक जीवन-क्षेत्र को विस्तार से दिखाते हैं — विवरण हेतु किसी भी वर्ग को दबाएँ।" : "Divisional charts each zoom into one area of life — tap any chart to see its focus."}
              </div>
              {/* varga strip: single horizontally-scrollable row, never overflows the card */}
              <div className="hscroll" style={{ display: "flex", gap: 6, overflowX: "auto", padding: "2px 4px 8px", margin: "0 0 4px", WebkitOverflowScrolling: "touch" }}>
                {VARGAS.map((v) => (
                  <button key={v.k} className="chip" title={`${v.name} — ${v.theme}`}
                    onClick={(e) => { setVarga(v.k); try { e.currentTarget.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" }); } catch {} }}
                    style={{ flexShrink: 0, padding: "7px 14px", borderRadius: 18, cursor: "pointer", fontFamily: "Spectral, serif", fontSize: 13, letterSpacing: ".03em", border: `1px solid ${v.k === varga ? C.gold : C.line}`, background: v.k === varga ? "rgba(168,106,18,.12)" : "#FFFFFF", color: v.k === varga ? C.gold : C.muted, fontWeight: v.k === varga ? 600 : 400 }}>
                    {v.k}
                  </button>
                ))}
              </div>
              <p style={{ textAlign: "center", color: C.gold, fontSize: 13, margin: "8px 0 2px", fontFamily: "Eczar, serif", letterSpacing: ".04em" }}>
                {curVarga.name} — {curVarga.theme}
              </p>
              {refNote && <p style={{ textAlign: "center", color: C.muted, fontSize: 12, margin: "2px 0 10px" }}>{refNote}</p>}
              {!refNote && <div style={{ height: 10 }} />}
              <DiamondChart
                key={varga + refPt}
                title={form.name ? `${form.name} · ${(place && place.label) || ""}` : (place && place.label) || "Birth chart"}
                ascSign={vAscSign}
                houseOfPlanet={vPlanets}
                showDeg={varga === "D1"}
                lagnaLabel={refPt === "lagna" ? "LAGNA" : refPt === "surya" ? "SURYA" : refPt === "chandra" ? "CHANDRA" : "KARAKAMSA"}
                gold={C.gold} ivory={C.ivory} muted={C.muted} sindoor={C.sindoor}
              />
              <p style={{ textAlign: "center", color: C.muted, fontSize: 12, margin: "8px 0 0" }}>
                Numbers mark the rashi in each house · <span style={{ color: C.sindoor }}>℞</span> retrograde
                {varga === "D2" && " · the Hora chart uses only Cancer (Moon) and Leo (Sun)"}
              </p>
            </div>

            {/* yogas */}
            <Eyebrow id="yogas" deva="योग" en={`Yogas detected · ${r.yogas.length}`} />
            {r.yogas.length === 0 ? (
              <p style={{ color: C.muted, fontSize: 14 }}>{lang === "hi" ? "इस कुंडली में कोई प्रमुख शास्त्रीय योग नहीं मिला।" : "No major classical yogas were found in this chart."}</p>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
                {r.yogas.map((yg) => (
                  <div key={yg.name} className="rise" style={{ ...card, padding: "14px 16px", borderLeft: `3px solid ${yg.kind === "good" ? C.gold : C.sindoor}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                      <span style={{ fontFamily: "Eczar, serif", fontSize: 15.5, color: yg.kind === "good" ? C.gold : C.sindoor }}>{yg.name}</span>
                      <span style={{ fontSize: 9.5, letterSpacing: ".12em", textTransform: "uppercase", color: C.muted, whiteSpace: "nowrap" }}>{yg.kind === "good" ? "auspicious" : "challenging"}</span>
                    </div>
                    <div style={{ fontSize: 13.5, lineHeight: 1.55 }}>{yg.text}</div>
                  </div>
                ))}
              </div>
            )}

            {/* planetary table */}
            <Eyebrow id="planets" deva="ग्रह स्थिति" en="Planetary positions (sidereal)" />
            <div className="rise" style={{ ...card, padding: "14px 16px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10, marginBottom: 12 }}>
                {[
                  { n: "Lagna", deva: "La", sign: r.ascSign, deg: r.ascDeg, nak: r.ascNak, house: 1 },
                  ...r.rows.map(p => ({ n: p.name, deva: PLANET_GLYPH[p.name], sign: p.sign, deg: p.deg, nak: p.nak, house: p.house, retro: p.retro, color: PLANET_COLOR[p.name] }))
                ].map((p, i) => (
                  <div key={p.n} style={{ background: "#FBF5E7", border: `1px solid ${C.line}`, borderRadius: 10, padding: "10px 12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}>
                      <span style={{ width: 7, height: 7, borderRadius: 3, background: p.color || C.gold, flexShrink: 0 }} />
                      <span style={{ fontSize: 13, fontWeight: 600, color: C.ivory, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {p.n}{p.retro && <span style={{ color: C.sindoor, marginLeft: 2 }}>℞</span>}
                      </span>
                    </div>
                    <div style={{ fontSize: 11.5, color: C.muted, lineHeight: 1.4 }}>
                      <div><span style={{ fontWeight: 600, color: C.ivory }}>{SIGNS[p.sign].split(" ")[0]}</span> {fmtDeg(p.deg)}</div>
                      <div style={{ fontSize: 10.5, marginTop: 3 }}>{NAKSHATRAS[p.nak].split(" ")[0]}</div>
                      <div style={{ fontSize: 10.5, marginTop: 2, color: C.gold }}>H{p.house}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ textAlign: "center", color: C.muted, fontSize: 11, paddingTop: 10, borderTop: `1px solid ${C.line}` }}>
                Ayanamsa (Lahiri): <span style={{ color: C.ivory, fontVariantNumeric: "tabular-nums" }}>{fmtDeg(r.ayan)}</span> · Retrograde ℞ shown in <span style={{ color: C.sindoor }}>vermillion</span>
              </div>
            </div>

            {/* KP sub-lords */}
            <Eyebrow id="kp" deva="के॰पी॰ उपस्वामी" en="KP sub-lords (Krishnamurti Paddhati)" />
            <div className="rise" style={{ ...card, padding: "8px 4px", overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 360 }}>
                <thead>
                  <tr style={{ color: C.muted, textAlign: "left", fontSize: 11, letterSpacing: ".05em", textTransform: "uppercase" }}>
                    <th style={{ padding: "6px 10px" }}>Graha</th>
                    <th style={{ padding: "6px 10px" }}>Sign</th>
                    <th style={{ padding: "6px 10px" }}>Nakshatra</th>
                    <th style={{ padding: "6px 10px" }}>Star lord</th>
                    <th style={{ padding: "6px 10px" }}>Sub lord</th>
                    <th style={{ padding: "6px 10px" }}>Sub-sub</th>
                  </tr>
                </thead>
                <tbody>
                  {r.rows.map((p) => (
                    <tr key={p.name} style={{ borderTop: "1px solid #EBDFC6" }}>
                      <td style={{ padding: "7px 10px", whiteSpace: "nowrap" }}>
                        <span style={{ color: PLANET_COLOR[p.name], fontWeight: 600 }}>{PLANET_GLYPH[p.name]}</span> {p.name}{p.retro ? <span style={{ color: C.sindoor }}> ℞</span> : ""}
                      </td>
                      <td style={{ padding: "7px 10px", color: C.muted, whiteSpace: "nowrap" }}>{SIGN_SHORT[p.sign]} {fmtDeg(p.deg)}</td>
                      <td style={{ padding: "7px 10px", color: C.muted, fontSize: 12 }}>{NAKSHATRAS[p.nak]}</td>
                      <td style={{ padding: "7px 10px", color: PLANET_COLOR[p.kp.starLord] }}>{p.kp.starLord}</td>
                      <td style={{ padding: "7px 10px", color: PLANET_COLOR[p.kp.subLord], fontWeight: 700 }}>{p.kp.subLord}</td>
                      <td style={{ padding: "7px 10px", color: PLANET_COLOR[p.kp.subSub] }}>{p.kp.subSub}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p style={{ color: C.muted, fontSize: 11.5, margin: "10px 0 0", lineHeight: 1.5 }}>
              Each nakshatra (13°20′) is split into nine Vimshottari-proportioned <em>subs</em>, starting from the star lord — the 249-division scheme. The <span style={{ color: C.gold }}>sub lord</span> is the deciding factor in KP. {ayanamsa === "lahiri" ? "You're on Lahiri ayanamsa; switch to KP (Krishnamurti) above for the canonical KP sub-lords." : "Computed on the KP (Krishnamurti) ayanamsa."}
            </p>

            <div style={{ ...T.label, color: C.muted, margin: "18px 0 8px" }}>
              Cuspal sub-lords · {r.kpData.houseSystem} houses
            </div>
            <div className="rise" style={{ ...card, padding: "8px 4px", overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 360 }}>
                <thead>
                  <tr style={{ color: C.muted, textAlign: "left", fontSize: 11, letterSpacing: ".05em", textTransform: "uppercase" }}>
                    <th style={{ padding: "6px 10px" }}>Bhava</th>
                    <th style={{ padding: "6px 10px" }}>Cusp</th>
                    <th style={{ padding: "6px 10px" }}>Nakshatra</th>
                    <th style={{ padding: "6px 10px" }}>Star</th>
                    <th style={{ padding: "6px 10px" }}>Sub</th>
                    <th style={{ padding: "6px 10px" }}>Sub-sub</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => {
                    const L = r.kpData.cusps[h], sl = r.kpData.cuspSubLords[h];
                    if (L == null || !sl) return null;
                    const nakIdx = Math.floor(L / (360 / 27));
                    const angular = h === 1 || h === 4 || h === 7 || h === 10;
                    return (
                      <tr key={h} style={{ borderTop: "1px solid #EBDFC6", background: angular ? "rgba(168,106,18,.04)" : "transparent" }}>
                        <td style={{ padding: "7px 10px", fontFamily: "Eczar, serif", color: angular ? C.gold : C.ivory, whiteSpace: "nowrap" }}>{h}{h === 1 ? " (Asc)" : h === 10 ? " (MC)" : ""}</td>
                        <td style={{ padding: "7px 10px", color: C.muted, whiteSpace: "nowrap" }}>{SIGN_SHORT[Math.floor(L / 30)]} {fmtDeg(L % 30)}</td>
                        <td style={{ padding: "7px 10px", color: C.muted, fontSize: 12 }}>{NAKSHATRAS[nakIdx]}</td>
                        <td style={{ padding: "7px 10px", color: PLANET_COLOR[sl.starLord] }}>{sl.starLord}</td>
                        <td style={{ padding: "7px 10px", color: PLANET_COLOR[sl.subLord], fontWeight: 700 }}>{sl.subLord}</td>
                        <td style={{ padding: "7px 10px", color: PLANET_COLOR[sl.subSub] }}>{sl.subSub}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p style={{ color: C.muted, fontSize: 11.5, margin: "10px 0 0", lineHeight: 1.5 }}>
              Cusps use {r.kpData.houseSystem === "Placidus" ? "the Placidus system (semi-arcs trisected in time) — the KP standard" : "a Porphyry fallback because Placidus is undefined at this latitude"}. The <span style={{ color: C.gold }}>cuspal sub-lord</span> is the cornerstone of KP analysis — it signifies whether the matters of that house will fructify. {ayanamsa === "lahiri" ? "Switch to KP ayanamsa above for canonical KP cusps." : ""}
            </p>

            {/* KP significators */}
            <Eyebrow id="ksig" deva="के॰पी॰ सूचक" en="KP significators & ruling planets" />
            {(() => {
              const RP = r.rulingPlanets;
              const Chip = ({ pl, dim }) => (
                <span style={{ display: "inline-block", padding: "2px 7px", borderRadius: 6, fontSize: 12, fontWeight: 600, margin: "2px 3px 2px 0",
                  color: dim ? C.muted : "#FFF8E9", background: dim ? "transparent" : PLANET_COLOR[pl], border: dim ? `1px solid ${PLANET_COLOR[pl]}` : "none" }}>
                  {pl}
                </span>
              );
              const RPItem = ({ label, pl }) => (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, marginRight: 12, marginBottom: 4 }}>
                  <span style={{ fontSize: 10.5, color: C.muted, textTransform: "uppercase", letterSpacing: ".04em" }}>{label}</span>
                  <span style={{ color: PLANET_COLOR[pl], fontWeight: 700, fontSize: 13 }}>{pl}</span>
                </span>
              );
              return (
                <div>
                  <div className="rise" style={{ ...card, padding: "14px 16px", borderLeft: "3px solid #A86A12", marginBottom: 14 }}>
                    <div style={{ ...T.label, color: C.gold, marginBottom: 8 }}>Ruling Planets · birth moment</div>
                    <div style={{ display: "flex", flexWrap: "wrap", rowGap: 4 }}>
                      <RPItem label="Asc lord" pl={RP.ascSignLord} />
                      <RPItem label="Asc star" pl={RP.ascStarLord} />
                      <RPItem label="Asc sub" pl={RP.ascSubLord} />
                      <RPItem label="Moon lord" pl={RP.moonSignLord} />
                      <RPItem label="Moon star" pl={RP.moonStarLord} />
                      <RPItem label="Moon sub" pl={RP.moonSubLord} />
                      <RPItem label="Day lord" pl={RP.dayLord} />
                    </div>
                  </div>

                  <div style={{ ...T.label, color: C.muted, margin: "4px 0 8px" }}>
                    House significators (strongest first)
                  </div>
                  <div className="rise" style={{ ...card, padding: "8px 4px", overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 380 }}>
                      <thead>
                        <tr style={{ color: C.muted, textAlign: "left", fontSize: 11, letterSpacing: ".05em", textTransform: "uppercase" }}>
                          <th style={{ padding: "6px 10px" }}>Bhava</th>
                          <th style={{ padding: "6px 10px" }}>Occupants</th>
                          <th style={{ padding: "6px 10px" }}>Owner</th>
                          <th style={{ padding: "6px 10px" }}>Significators</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                          <tr key={h} style={{ borderTop: "1px solid #EBDFC6", verticalAlign: "top" }}>
                            <td style={{ padding: "8px 10px", fontFamily: "Eczar, serif", color: C.ivory }}>{h}</td>
                            <td style={{ padding: "8px 10px", whiteSpace: "nowrap" }}>{r.kpSig.occupants[h].length ? r.kpSig.occupants[h].map((pl) => <Chip key={pl} pl={pl} />) : <span style={{ color: C.muted, fontSize: 12 }}>—</span>}</td>
                            <td style={{ padding: "8px 10px" }}>{r.kpSig.owner[h] ? <Chip pl={r.kpSig.owner[h]} dim /> : "—"}</td>
                            <td style={{ padding: "8px 10px" }}>{r.kpSig.ordered[h].map((pl) => <Chip key={pl} pl={pl} />)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 6, fontStyle: "italic" }}>{lang === "hi" ? "— का अर्थ है कोई नहीं" : "— means none"}</div>

                  <div style={{ ...T.label, color: C.muted, margin: "18px 0 8px" }}>
                    Houses signified by each planet
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 8 }}>
                    {KP_PLANETS.map((pl) => (
                      <div key={pl} className="rise" style={{ ...card, padding: "9px 12px", display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ color: PLANET_COLOR[pl], fontWeight: 700, fontSize: 13, minWidth: 52 }}>{PLANET_GLYPH[pl]} {pl.slice(0, 3)}</span>
                        <span style={{ color: C.ivory, fontSize: 13, fontVariantNumeric: "tabular-nums" }}>{r.kpSig.housesOf[pl].length ? r.kpSig.housesOf[pl].join(", ") : "—"}</span>
                      </div>
                    ))}
                  </div>
                  <p style={{ color: C.muted, fontSize: 11.5, margin: "12px 0 0", lineHeight: 1.5 }}>
                    A planet promises the matters of every house it signifies; during its dasha/bhukti — especially when it is also a Ruling Planet — those houses fructify. Rahu and Ketu also act as agents of their star and sign lords (apply that nuance when judging the nodes). {ayanamsa === "lahiri" ? "Switch to KP ayanamsa above for canonical KP significators." : "Computed on the KP ayanamsa."}
                  </p>
                </div>
              );
            })()}

            {/* jaimini karakas */}
            <Eyebrow id="karakas" deva="चर कारक" en="Jaimini chara karakas" />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
              {r.karakas.map((kk, i) => (
                <div key={kk.role} style={{ ...card, padding: "13px 15px", border: `1px solid ${i === 0 ? C.gold : C.line}`, boxShadow: i === 0 ? `0 0 22px rgba(168,106,18,.14), ${card.boxShadow}` : card.boxShadow }}>
                  <div style={{ ...T.label, color: i === 0 ? C.gold : C.muted, marginBottom: 6 }}>{kk.role}</div>
                  <div style={{ fontSize: 15.5, display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 4, background: PLANET_COLOR[kk.planet], boxShadow: `0 0 6px ${PLANET_COLOR[kk.planet]}55`, flexShrink: 0 }} />
                    {kk.planet}
                    <span style={{ color: C.muted, fontSize: 12.5, fontVariantNumeric: "tabular-nums" }}>{fmtDeg(kk.deg)} {SIGNS[kk.sign].split(" ")[0]}</span>
                  </div>
                  <div style={{ color: C.muted, fontSize: 12, marginTop: 5 }}>{kk.meaning}</div>
                </div>
              ))}
            </div>

            {/* shadbala */}
            <Eyebrow id="shadbala" deva="षड्बल" en="Shadbala · six-fold strength" />
            <div style={{ ...card, padding: "12px 16px", marginBottom: 12, background: "#FBF5E7" }}>
              <p style={{ margin: 0, fontSize: 13.5, color: C.ivory, lineHeight: 1.55 }}>
                {lang === "hi"
                  ? <>षड्बल मापता है कि हर ग्रह अपने फल देने में कितना बलवान है। यहाँ सबसे बलवान <strong style={{ color: C.gold }}>{PLANET_DEVA[r.shadbala.ranked[0]]}</strong> है — इसके कारकत्व अपेक्षाकृत सहजता से फलित होते हैं; सबसे निर्बल <strong style={{ color: C.sindoor }}>{PLANET_DEVA[r.shadbala.ranked[6]]}</strong> है — इसके कारकत्व अधिक प्रयास माँग सकते हैं।</>
                  : <>Shadbala measures how much strength each planet has to deliver its results. Here <strong style={{ color: C.gold }}>{r.shadbala.ranked[0]}</strong> is strongest — its matters tend to come with more ease; <strong style={{ color: C.sindoor }}>{r.shadbala.ranked[6]}</strong> is weakest — its matters may take more effort.</>}
              </p>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 12 }}>
              {BALA_PARTS.map((b) => (
                <span key={b.k} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11.5, color: C.muted }}>
                  <span style={{ width: 10, height: 10, borderRadius: 3, background: b.color }} />
                  {b.label} <span style={{ opacity: 0.7 }}>({b.note})</span>
                </span>
              ))}
            </div>
            {(() => {
              const maxR = Math.max(...SEVEN.map((p) => r.shadbala.perPlanet[p].totalR));
              return (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 12 }}>
                  {r.shadbala.ranked.map((p, rank) => {
                    const x = r.shadbala.perPlanet[p];
                    const strong = x.ratio >= 1;
                    return (
                      <div key={p} className="rise" style={{ ...card, padding: "14px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                          <span style={{ width: 9, height: 9, borderRadius: 5, background: PLANET_COLOR[p], flexShrink: 0 }} />
                          <span style={{ fontFamily: "Eczar, serif", fontSize: 16, color: C.ivory }}>{PLANET_DEVA[p]} <span style={{ fontFamily: "Spectral, serif", fontSize: 14 }}>{p}</span></span>
                          <span style={{ marginLeft: "auto", fontSize: 11, color: C.muted }}>#{rank + 1}</span>
                          <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase", padding: "3px 8px", borderRadius: 10, color: strong ? "#3F7E2E" : C.sindoor, background: strong ? "rgba(63,126,46,.1)" : "rgba(194,69,30,.08)" }}>{strong ? "strong" : "weak"}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 10 }}>
                          <span style={{ fontFamily: "Eczar, serif", fontSize: 26, color: C.gold, lineHeight: 1 }}>{x.totalR.toFixed(2)}</span>
                          <span style={{ fontSize: 11.5, color: C.muted }}>Rupas · needs {x.required} · {(x.ratio * 100).toFixed(0)}%</span>
                        </div>
                        <div style={{ display: "flex", height: 10, borderRadius: 5, overflow: "hidden", background: "#F1E9D5", marginBottom: 8 }}>
                          {BALA_PARTS.map((b) => {
                            const w = Math.max(0, x[b.k]) / 60 / maxR * 100;
                            return w > 0 ? <span key={b.k} title={`${b.label}: ${(x[b.k] / 60).toFixed(2)}`} style={{ width: `${w}%`, background: b.color }} /> : null;
                          })}
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "3px 10px", fontSize: 11 }}>
                          {BALA_PARTS.map((b) => (
                            <span key={b.k} style={{ color: C.muted, display: "flex", justifyContent: "space-between" }}>
                              <span style={{ color: b.color }}>{b.label}</span>
                              <span style={{ fontVariantNumeric: "tabular-nums", color: x[b.k] < 0 ? C.sindoor : C.ivory }}>{(x[b.k] / 60).toFixed(2)}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
            <p style={{ color: C.muted, fontSize: 11.5, margin: "12px 0 0", lineHeight: 1.5 }}>
              Strength in Rupas (1 Rupa = 60 Virupas). A planet clearing its required minimum is well-placed to deliver its significations. Strongest: <span style={{ color: C.gold }}>{r.shadbala.ranked[0]}</span> · weakest: <span style={{ color: C.sindoor }}>{r.shadbala.ranked[6]}</span>. Cheshta and some Kala sub-balas are modelled and may differ slightly from other software.
            </p>

            {/* special lagnas & points */}
            <Eyebrow id="special" deva="विशेष लग्न व बिन्दु" en="Special lagnas & sensitive points" />
            {(() => {
              const SP = r.special;
              const hOf = (L) => ((Math.floor(L / 30) - r.ascSign + 12) % 12) + 1;
              const Tile = ({ item, accent }) => (
                <div style={{ ...card, padding: "12px 14px", borderLeft: `3px solid ${accent}` }}>
                  <div style={{ ...T.label, color: C.muted, marginBottom: 5 }}>{item.k}</div>
                  <div style={{ fontFamily: "Eczar, serif", fontSize: 15.5, color: C.ivory, display: "flex", alignItems: "baseline", gap: 7, flexWrap: "wrap" }}>
                    {SIGNS[Math.floor(item.v / 30)].split(" ")[0]} <span style={{ fontSize: 12.5, color: C.muted, fontVariantNumeric: "tabular-nums" }}>{fmtDeg(item.v % 30)}</span>
                    <span style={{ fontSize: 11, color: C.gold }}>H{hOf(item.v)}</span>
                    {item.pl && <span style={{ fontSize: 12, color: PLANET_COLOR[item.pl] }}>· {item.pl}</span>}
                  </div>
                  <div style={{ color: C.muted, fontSize: 11.5, marginTop: 4 }}>{item.note}</div>
                </div>
              );
              const Group = ({ title, items, accent }) => (
                <>
                  <div style={{ ...T.label, color: accent, margin: "16px 0 8px", fontWeight: 600 }}>{title}</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 10 }}>
                    {items.map((it) => <Tile key={it.k} item={it} accent={accent} />)}
                  </div>
                </>
              );
              return (
                <div>
                  <Group title="Special Lagnas" items={SP.lagnas} accent={C.gold} />
                  <Group title="Sensitive Points" items={SP.points} accent="#6E5C82" />
                  <div style={{ ...card, padding: "12px 14px", marginTop: 10, borderLeft: `3px solid #2C7D4F`, display: "inline-block" }}>
                    <span style={{ ...T.label, color: C.muted, marginRight: 8 }}>Indu Lagna (wealth)</span>
                    <span style={{ fontFamily: "Eczar, serif", fontSize: 15.5, color: "#2C7D4F" }}>{SIGNS[SP.induSign].split(" ")[0]}</span>
                  </div>
                  <Group title="Upagrahas · shadow sub-planets" items={SP.upagrahas} accent="#C2451E" />
                  <p style={{ color: C.muted, fontSize: 11.5, margin: "12px 0 0", lineHeight: 1.5 }}>
                    Bhava / Hora / Ghati lagnas advance from sunrise (1 sign per 5 / 2.5 / 1 ghatis). Gulika is the lagna rising during Saturn's eighth of the day. Some points (Sree Lagna especially) follow formulas that vary slightly between traditions.
                  </p>
                </div>
              );
            })()}

            {/* bhava chalit + bhava bala */}
            <Eyebrow id="chalit" deva="भाव चलित" en="Bhava Chalit & Bhava Bala" />
            <div className="rise" style={{ ...card, padding: "20px 14px 12px" }}>
              <DiamondChart
                title="Bhava Chalit — planets by true house cusp"
                ascSign={r.ascSign}
                houseOfPlanet={r.rows.map((p) => ({ label: PLANET_GLYPH[p.name], house: r.bhava.chalit[p.name], retro: p.retro }))}
                gold={C.gold} ivory={C.ivory} muted={C.muted} sindoor={C.sindoor}
              />
              {(() => {
                const shifts = r.rows.filter((p) => p.house !== r.bhava.chalit[p.name]);
                return shifts.length ? (
                  <p style={{ textAlign: "center", color: C.muted, fontSize: 12, margin: "4px 0 0", lineHeight: 1.6 }}>
                    Shifted from the rasi chart:{" "}
                    {shifts.map((p, i) => (
                      <span key={p.name}>
                        {i > 0 && ", "}
                        <span style={{ color: C.ivory }}>{p.name}</span> <span style={{ color: C.sindoor }}>H{p.house}→H{r.bhava.chalit[p.name]}</span>
                      </span>
                    ))}
                  </p>
                ) : (
                  <p style={{ textAlign: "center", color: C.muted, fontSize: 12, margin: "4px 0 0" }}>No planets shift house — cusps align closely with the signs.</p>
                );
              })()}
            </div>

            <div style={{ ...T.label, color: C.muted, margin: "18px 0 10px" }}>
              Bhava Bala · house strength (Rupas)
            </div>
            {(() => {
              const maxB = Math.max(...r.bhava.bhavaBala.map((b) => b.total));
              return (
                <div style={{ display: "grid", gap: 8 }}>
                  {r.bhava.bhavaBala.map((b) => {
                    const strong = b.house === r.bhava.strongest, weak = b.house === r.bhava.weakest;
                    return (
                      <div key={b.house} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ width: 30, fontFamily: "Eczar, serif", fontSize: 14, color: strong ? C.gold : weak ? C.sindoor : C.ivory, flexShrink: 0 }}>H{b.house}</span>
                        <span style={{ width: 54, fontSize: 11, color: C.muted, flexShrink: 0 }}>{SIGN_SHORT[b.sign]} · <span style={{ color: PLANET_COLOR[b.lord] }}>{PLANET_GLYPH[b.lord]}</span></span>
                        <div style={{ flex: 1, height: 14, background: "#F1E9D5", borderRadius: 7, overflow: "hidden" }}>
                          <div style={{ width: `${Math.max(4, b.total / maxB * 100)}%`, height: "100%", background: strong ? `linear-gradient(90deg, #E0A43B, #A86A12)` : weak ? "#C2451E" : "#B89A55", borderRadius: 7 }} />
                        </div>
                        <span style={{ width: 38, textAlign: "right", fontSize: 12.5, fontVariantNumeric: "tabular-nums", color: strong ? C.gold : C.ivory, flexShrink: 0 }}>{b.total.toFixed(1)}</span>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
            <p style={{ color: C.muted, fontSize: 11.5, margin: "12px 0 0", lineHeight: 1.5 }}>
              Cusps use the Sripati method (Lagna and Midheaven as 1st & 10th bhava-madhya, intermediate cusps trisected). Bhava Bala is led by each house lord's Shadbala, adjusted for the bhava's directional fitness and the aspects it receives. Strongest house: <span style={{ color: C.gold }}>H{r.bhava.strongest}</span> · weakest: <span style={{ color: C.sindoor }}>H{r.bhava.weakest}</span>.
            </p>

            {/* ashtakavarga */}
            <Eyebrow id="av" deva="अष्टकवर्ग" en="Ashtakavarga" />
            <div className="rise" style={{ ...card, padding: "20px 14px 16px" }}>
              <DiamondChart
                title="Sarvashtakavarga · bindus by house"
                ascSign={r.ascSign}
                houseOfPlanet={Array.from({ length: 12 }, (_, h) => {
                  const v = r.av.sav[(r.ascSign + h) % 12];
                  return { label: String(v), house: h + 1, color: v >= 30 ? "#3F7E2E" : v <= 24 ? "#B25425" : C.ivory };
                })}
                gold={C.gold} ivory={C.ivory} muted={C.muted} sindoor={C.sindoor}
              />
              <p style={{ textAlign: "center", color: C.muted, fontSize: 12, margin: "8px 0 0" }}>
                <span style={{ color: "#3F7E2E" }}>30+</span> strong · 25–29 average · <span style={{ color: "#B25425" }}>≤24</span> needs support · 337 total — transits through high-bindu houses tend to give better results
              </p>
            </div>
            <div className="rise2" style={{ ...card, padding: "8px 18px 12px", overflowX: "auto", marginTop: 12 }}>
              <table style={{ minWidth: 560 }}>
                <thead>
                  <tr><th>Graha</th>{SIGN_SHORT.map((sn) => <th key={sn} style={{ textAlign: "center" }}>{sn}</th>)}<th style={{ textAlign: "center" }}>Σ</th></tr>
                </thead>
                <tbody>
                  {["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"].map((p) => (
                    <tr key={p}>
                      <td style={{ whiteSpace: "nowrap" }}>
                        <span style={{ display: "inline-block", width: 7, height: 7, borderRadius: 4, background: PLANET_COLOR[p], marginRight: 8 }} />{PLANET_GLYPH[p]}
                      </td>
                      {r.av.bav[p].map((v, i) => (
                        <td key={i} style={{ textAlign: "center", fontVariantNumeric: "tabular-nums", color: i === r.rows.find((q) => q.name === p).sign ? C.gold : C.ivory, fontWeight: i === r.rows.find((q) => q.name === p).sign ? 600 : 400 }}>{v}</td>
                      ))}
                      <td style={{ textAlign: "center", color: C.muted }}>{r.av.bav[p].reduce((x, y) => x + y, 0)}</td>
                    </tr>
                  ))}
                  <tr>
                    <td style={{ color: C.gold, fontWeight: 600 }}>SAV</td>
                    {r.av.sav.map((v, i) => <td key={i} style={{ textAlign: "center", color: C.gold, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{v}</td>)}
                    <td style={{ textAlign: "center", color: C.gold, fontWeight: 600 }}>337</td>
                  </tr>
                </tbody>
              </table>
              <p style={{ color: C.muted, fontSize: 12, margin: "10px 0 4px" }}>Gold cell marks each graha's own sign. Bhinnashtakavarga rows show every planet's bindus per sign.</p>
            </div>

            {/* arudha padas */}
            <Eyebrow id="arudha" deva="आरूढ पद" en="Arudha padas" />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
              {r.arudhas.map((a, i) => {
                const ARUDHA_MEAN = ["perceived image & status", "wealth & speech", "siblings & courage", "home & comforts", "children & creativity", "service & conflicts", "partnerships", "longevity & change", "dharma & fortune", "career & status", "gains & networks", "marriage & spouse"];
                const special = a.h === 1 ? "AL" : a.h === 12 ? "UL" : a.h === 7 ? "A7" : null;
                const hot = a.h === 1 || a.h === 12;
                return (
                  <div key={a.h} className="rise" style={{ ...card, padding: "12px 14px", border: `1px solid ${hot ? C.gold : C.line}` }}>
                    <div style={{ ...T.label, color: hot ? C.gold : C.muted, marginBottom: 5 }}>
                      {a.h === 1 ? "Arudha Lagna" : a.h === 12 ? "Upapada" : `A${a.h}`}{special && a.h !== 1 && a.h !== 12 ? "" : ""}
                    </div>
                    <div style={{ fontFamily: "Eczar, serif", fontSize: 16, color: hot ? C.gold : C.ivory }}>{SIGNS[a.sign].split(" ")[0]}</div>
                    <div style={{ color: C.muted, fontSize: 11.5, marginTop: 4 }}>{ARUDHA_MEAN[i]}</div>
                  </div>
                );
              })}
            </div>

            {/* dasha */}
            <Eyebrow id="rectify" deva="जन्म समय शोधन" en="Birth-time rectification" />
            <RectifyModule form={form} place={place} ayanamsa={ayanamsa} C={C} card={card} />

            <Eyebrow id="bnn" deva="भृगु नन्दी नाडी" en="Bhrigu Nandi Nadi · lagneless" />
            <BNNModule bnn={r.bnn} rows={r.rows} tz={r.tz} C={C} card={card} />

            <Eyebrow id="bhrigu" deva="भृगु चक्र · सरल पद्धति" en="Bhrigu Chakra & Saral Paddhati" />
            <BhriguModule rows={r.rows} ascSign={r.ascSign} birthMs={r.birthMs} tz={r.tz} C={C} card={card} />

            <Eyebrow id="dasha" deva="विंशोत्तरी दशा" en="Vimshottari dasha · maha to prana" />
            <div className="rise" style={{ ...card, padding: "8px 18px 16px", overflowX: "auto" }}>
              <table>
                <thead><tr><th>Lord</th><th>From</th><th>To</th><th>Years</th></tr></thead>
                <tbody>
                  {r.dashas.map((dsh) => {
                    const isNow = r.current && dsh.lord === r.current.lord && dsh.start === r.current.start;
                    return (
                      <tr key={dsh.start} style={isNow ? { background: "rgba(168,106,18,.08)" } : null}>
                        <td style={{ color: isNow ? C.gold : C.ivory, fontWeight: isNow ? 600 : 400 }}>
                          {dsh.lord}{isNow && " · current"}
                        </td>
                        <td>{fmtDateT(dsh.start, r.tz, false)}</td>
                        <td>{fmtDateT(dsh.end, r.tz, false)}</td>
                        <td style={{ fontVariantNumeric: "tabular-nums" }}>{dsh.balance.toFixed(1)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {r.current && (
                <>
                  {(() => {
                    const pct = Math.min(100, Math.max(0, ((Date.now() - r.current.start) / (r.current.end - r.current.start)) * 100));
                    return (
                      <div style={{ margin: "16px 2px 4px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, color: C.muted, letterSpacing: ".14em", textTransform: "uppercase", marginBottom: 7 }}>
                          <span>{r.current.lord} mahadasha</span>
                          <span style={{ color: C.gold }}>{pct.toFixed(0)}% elapsed</span>
                        </div>
                        <div style={{ height: 6, background: "#F1E9D5", borderRadius: 3, overflow: "hidden", border: `1px solid ${C.line}` }}>
                          <div style={{ width: `${pct}%`, height: "100%", background: `linear-gradient(90deg, ${C.gold}, #7E520C)`, borderRadius: 3 }} />
                        </div>
                      </div>
                    );
                  })()}
                  <p style={{ fontSize: 14, lineHeight: 1.6, color: C.ivory, margin: "16px 0 10px" }}>
                    The native runs <span style={{ color: C.gold }}>{r.current.lord} mahadasha</span> — a period
                    classically associated with {DASHA_NOTE[r.current.lord]}.
                  </p>
                  {r.curAntar && (
                    <div style={{ margin: "18px 0 6px", padding: "13px 14px", borderRadius: 10, background: "rgba(168,106,18,.05)", border: `1px solid ${C.line}` }}>
                      <div style={{ ...T.label, color: C.muted, marginBottom: 9 }}>Running now · all five levels</div>
                      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "4px 6px" }}>
                        {[["Maha", r.current.lord], ["Antar", r.curAntar.lord], ["Pratyantar", r.curPratya && r.curPratya.lord], ["Sookshma", r.curSookshma && r.curSookshma.lord], ["Prana", r.curPrana && r.curPrana.lord]].map(([lvl, lord], i) =>
                          lord ? (
                            <React.Fragment key={lvl}>
                              {i > 0 && <span style={{ color: C.line, fontSize: 13 }}>›</span>}
                              <span style={{ display: "inline-flex", flexDirection: "column", lineHeight: 1.25 }}>
                                <span style={{ fontSize: 9, letterSpacing: ".1em", textTransform: "uppercase", color: C.muted }}>{lvl}</span>
                                <span style={{ fontFamily: "Eczar, serif", fontSize: 15, color: C.gold }}>{lord}</span>
                              </span>
                            </React.Fragment>
                          ) : null
                        )}
                      </div>
                      {r.curPrana && (
                        <div style={{ fontSize: 11.5, color: C.muted, marginTop: 9 }}>
                          Current prana: {r.curPrana.lord} · {fmtDateT(r.curPrana.start, r.tz, true)} – {fmtDateT(r.curPrana.end, r.tz, true)}
                        </div>
                      )}
                    </div>
                  )}
                  <div style={{ ...T.label, color: C.muted, margin: "16px 0 4px" }}>
                    Antardashas within {r.current.lord} — tap any period to drill down
                  </div>
                  <DashaTree periods={r.antars} level={0} now={Date.now()} openD={openD} toggle={toggleD} C={C} tz={r.tz} />
                </>
              )}
            </div>

            {/* panchang */}
            <Eyebrow deva="पञ्चाङ्ग" en="Birth panchang" />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
              {[
                ["Vara", r.panchang.weekday],
                ["Tithi", `${r.panchang.paksha} ${r.panchang.tithiName}`],
                ["Nakshatra", r.panchang.nak],
                ["Yoga", r.panchang.yoga],
                ["Karana", r.panchang.karana],
              ].map(([k, v]) => (
                <div key={k} style={{ ...card, padding: "14px 16px" }}>
                  <div style={{ ...T.label, color: C.muted, marginBottom: 6 }}>{k}</div>
                  <div style={{ fontSize: 15 }}>{v}</div>
                </div>
              ))}
            </div>

            {/* reading */}
            <Eyebrow id="reading" deva="फलादेश" en="A short reading" />
            <div className="rise" style={{ ...card, padding: "22px 24px", fontSize: 15.5, lineHeight: 1.75 }}>
              <p style={{ margin: "0 0 14px" }}>
                <span style={{ color: C.gold, fontFamily: "Eczar, serif" }}>Lagna · </span>
                With <strong>{SIGNS[r.ascSign]}</strong> rising, the outer temperament carries {SIGN_NOTE[r.ascSign]}.
              </p>
              <p style={{ margin: "0 0 14px" }}>
                <span style={{ color: C.gold, fontFamily: "Eczar, serif" }}>Chandra · </span>
                The Moon in <strong>{SIGNS[r.moon.sign]}</strong>, under <strong>{NAKSHATRAS[r.moon.nak]}</strong> nakshatra
                (pada {r.moon.pada}), shapes the inner life: {NAK_NOTE[r.moon.nak]}
              </p>
              <p style={{ margin: 0, color: C.muted, fontSize: 13 }}>
                Offered in the spirit of the tradition, for reflection and curiosity — not as a substitute for your own judgment or a qualified jyotishi's reading.
              </p>
            </div>
          </>
        )}

        <footer style={{ textAlign: "center", color: C.muted, fontSize: 12, marginTop: 56, letterSpacing: ".06em" }}>
          ॐ · computed locally in your browser · nothing is stored or sent anywhere
        </footer>
      </div>
    </div>
  );
}

/* Named exports for the validation harnesses (validation/_load-app.cjs bundles this
   module and reads them). Kept as one explicit list so the gates never depend on
   flat-file scope — which is what lets src/ be split into modules safely. */
export {
  scanPanchangCalendar,
  FEST_NAME,
  ayyappaMandalaFor,
  muhuratScanRange,
  muhuratForDate,
  muhuratShuddhi,
  MUHURTA_RULES,
};
