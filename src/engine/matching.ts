/* Ashtakoota Guna Milan (Kundali matching) — pure extraction (SPLIT-UI-MATCH-01).
   Tables and scoring unchanged. computeMatch needs a kundli builder injected
   until computeKundli itself is extracted (avoids circular imports with the shell). */

import { SIGN_LORD } from "./panchang";
import { papasamyam } from "./doshas";
import { planetName, signName } from "../i18n/panchang-terms";

/* The calculation convention this whole screen rests on. Matching produces a
   verdict about a marriage and used to name no convention at all — the closing
   caveat said only "the same validated ephemeris as the rest of the app", which
   stopped being a stable claim once the chart screen let a reader pick Raman
   (bug bash 2026-08-18, F17). computeMatch now pins Lahiri explicitly instead of
   inheriting a module default, and the screen prints this line in both languages,
   the way /calculator/sade-sati already does. */
const MATCH_CONVENTION = {
  ayanamsa: "lahiri",
  en: "Both charts are cast with Ganak's Lahiri ayanamsa and mean Rahu/Ketu, whatever ayanamsa is selected elsewhere in the app.",
  hi: "दोनों कुंडलियाँ गणक के लाहिरी अयनांश तथा मध्यम राहु/केतु से बनाई जाती हैं — ऐप में अन्यत्र चुना गया अयनांश यहाँ लागू नहीं होता।",
};

const NF = {
  Sun: { F: ["Moon", "Mars", "Jupiter"], E: ["Venus", "Saturn"] },
  Moon: { F: ["Sun", "Mercury"], E: [] },
  Mars: { F: ["Sun", "Moon", "Jupiter"], E: ["Mercury"] },
  Mercury: { F: ["Sun", "Venus"], E: ["Moon"] },
  Jupiter: { F: ["Sun", "Moon", "Mars"], E: ["Mercury", "Venus"] },
  Venus: { F: ["Mercury", "Saturn"], E: ["Sun", "Moon"] },
  Saturn: { F: ["Mercury", "Venus"], E: ["Sun", "Moon", "Mars"] },
};

/* ---------------- Ashtakoota Guna Milan (Kundali matching) ----------------
   8 kootas, 36 points. Nakshatra/rashi-indexed tables validated standalone:
   Gana & Nadi distributions 9/9/9; Yoni matrix symmetric with same=4 and the
   7 sworn-enemy pairs=0 (universal); Bhakoot/Nadi dosha logic exact. */
const NAK_YONI = [0,1,2,3,3,4,5,2,5,6,6,7,8,9,8,9,10,10,4,11,12,11,13,0,13,7,1];
const NAK_GANA = [0,1,2,1,0,1,0,0,2,2,1,1,0,2,0,2,0,2,2,1,1,0,2,2,1,1,0];
const NAK_NADI = [0,1,2,2,1,0,0,1,2,2,1,0,0,1,2,2,1,0,0,1,2,2,1,0,0,1,2];
const SIGN_VARNA = [3,2,1,4,3,2,1,4,3,2,1,4];
const SIGN_VASHYA = [0,0,1,2,3,1,1,4,1,2,1,2];
const YONI_NAMES = ["Horse","Elephant","Sheep","Serpent","Dog","Cat","Rat","Cow","Buffalo","Tiger","Deer","Monkey","Mongoose","Lion"];
const GANA_NAMES = ["Deva","Manushya","Rakshasa"];
const NADI_NAMES = ["Aadi","Madhya","Antya"];
const VARNA_NAMES = ["", "Shudra", "Vaishya", "Kshatriya", "Brahmin"];
const VASHYA_NAMES = ["Quadruped","Human","Waterborne","Wild","Insect"];
/* Devanagari for the koota CATEGORIES (yoni animal, gana, nadi, varna, vashya).
   These are koota class names, not rashi/nakshatra/graha names — those stay in
   src/i18n/panchang-terms.ts and are read from there via planetName() below.
   Written out because the Hindi "Detail" column used to be one filler sentence
   repeated eight times, so a Hindi reader was shown no diagnosis at all (F10). */
const YONI_NAMES_HI = ["अश्व","गज","मेष","सर्प","श्वान","मार्जार",
  "मूषक","गौ","महिष","व्याघ्र","मृग","वानर","नकुल","सिंह"];
const GANA_NAMES_HI = ["देव","मनुष्य","राक्षस"];
const NADI_NAMES_HI = ["आदि","मध्य","अन्त्य"];
const VARNA_NAMES_HI = ["","शूद्र","वैश्य","क्षत्रिय","ब्राह्मण"];
const VASHYA_NAMES_HI = ["चतुष्पद","द्विपद","जलचर","वनचर","कीट"];
const pairEn = (a: string, b: string) => a + " / " + b;
const pairHi = (a: string, b: string) => a + " / " + b;
const lordHi = (lord: string) => planetName("hi", lord);
const _MORTAL=[[7,9],[1,13],[0,8],[4,10],[3,12],[11,2],[5,6]];
const _YFRI=[[8,7],[8,1],[8,2],[5,10],[5,11],[5,12],[7,10],[7,2],[1,11],[1,2],[1,3],[0,3]];
const _YENE=[[8,13],[8,3],[5,3],[5,9],[5,13],[7,0],[7,13],[7,3],[4,13],[4,12],[4,6],[4,2],[4,9],[1,9],[10,0],[10,13],[10,9]];
const YONI_MATRIX = (() => { const M=Array.from({length:14},()=>Array(14).fill(2)); for(let i=0;i<14;i++)M[i][i]=4;
  for(const[a,b]of _YFRI){M[a][b]=3;M[b][a]=3;} for(const[a,b]of _YENE){M[a][b]=1;M[b][a]=1;} for(const[a,b]of _MORTAL){M[a][b]=0;M[b][a]=0;} return M; })();
const GANA_MATRIX = [[6,6,1],[5,6,0],[1,0,6]];
const VASHYA_MATRIX = [[2,1,1,0,1],[0.5,2,0.5,0.5,1],[1,1,2,1,1],[1,0,1,2,0],[1,1,1,1,2]];
const MANGLIK_HOUSES = [1,2,4,7,8,12];
function _gmRel(a,b){ if(a===b)return"F"; if(NF[a].F.includes(b))return"F"; if(NF[a].E.includes(b))return"E"; return"N"; }
function _maitri(bl,gl){ if(bl===gl)return 5; const r1=_gmRel(bl,gl),r2=_gmRel(gl,bl);
  if(r1==="F"&&r2==="F")return 5; if((r1==="F"&&r2==="N")||(r1==="N"&&r2==="F"))return 4; if(r1==="N"&&r2==="N")return 3;
  if((r1==="F"&&r2==="E")||(r1==="E"&&r2==="F"))return 1; if((r1==="N"&&r2==="E")||(r1==="E"&&r2==="N"))return 0.5; return 0; }
function _taraFav(f,t){ const c=((t-f+27)%27)+1; return (c%9)%2===0; }
function gunaMilan(boy, girl) {
  const vB = SIGN_VARNA[boy.rashi], vG = SIGN_VARNA[girl.rashi];
  const wB = SIGN_VASHYA[boy.rashi], wG = SIGN_VASHYA[girl.rashi];
  const yB = NAK_YONI[boy.nak], yG = NAK_YONI[girl.nak];
  const gB = NAK_GANA[boy.nak], gG = NAK_GANA[girl.nak];
  const nB = NAK_NADI[boy.nak], nG = NAK_NADI[girl.nak];
  const lB = SIGN_LORD[boy.rashi], lG = SIGN_LORD[girl.rashi];
  const k = [
    { name:"Varna", got: vB>=vG?1:0, max:1,
      note: pairEn(VARNA_NAMES[vB], VARNA_NAMES[vG]),
      noteHi: pairHi(VARNA_NAMES_HI[vB], VARNA_NAMES_HI[vG]) },
    { name:"Vashya", got: wB===wG?2:VASHYA_MATRIX[wB][wG], max:2,
      note: pairEn(VASHYA_NAMES[wB], VASHYA_NAMES[wG]),
      noteHi: pairHi(VASHYA_NAMES_HI[wB], VASHYA_NAMES_HI[wG]) },
    { name:"Tara", got: (_taraFav(boy.nak,girl.nak)?1.5:0)+(_taraFav(girl.nak,boy.nak)?1.5:0), max:3,
      note:"birth-star harmony", noteHi:"जन्म नक्षत्रों की परस्पर अनुकूलता" },
    { name:"Yoni", got: YONI_MATRIX[yB][yG], max:4,
      note: pairEn(YONI_NAMES[yB], YONI_NAMES[yG]),
      noteHi: pairHi(YONI_NAMES_HI[yB], YONI_NAMES_HI[yG]) },
    { name:"Graha Maitri", got: _maitri(lB,lG), max:5,
      note: pairEn(lB, lG), noteHi: pairHi(lordHi(lB), lordHi(lG)) },
    { name:"Gana", got: GANA_MATRIX[gB][gG], max:6,
      note: pairEn(GANA_NAMES[gB], GANA_NAMES[gG]),
      noteHi: pairHi(GANA_NAMES_HI[gB], GANA_NAMES_HI[gG]) },
    { name:"Bhakoot", got: [2,5,6,8,9,12].includes(((girl.rashi-boy.rashi+12)%12)+1)?0:7, max:7,
      note:"emotional & prosperity axis", noteHi:"भावनात्मक व समृद्धि का अक्ष" },
    { name:"Nadi", got: nB===nG?0:8, max:8,
      note: pairEn(NADI_NAMES[nB], NADI_NAMES[nG]),
      noteHi: pairHi(NADI_NAMES_HI[nB], NADI_NAMES_HI[nG]) },
  ];
  const total = k.reduce((s,x)=>s+x.got,0);
  const nadiDosha = k[7].got === 0, bhakootDosha = k[6].got === 0;
  return { kootas:k, total, max:36, nadiDosha, bhakootDosha,
    nadiExceptions: nadiExceptionsFor(boy, girl, nadiDosha),
    bhakootExceptions: bhakootExceptionsFor(lB, lG, bhakootDosha) };
}

/* ---------------- classical exceptions to Nadi and Bhakoot (bug bash F11) ----------------
   REPORTED, NEVER APPLIED. Ganak scored both doshas as a bare binary and the card
   stated the result as fact, with no mention anywhere in the file that the classical
   exceptions exist — the word "cancel" appeared once in the whole engine, on the
   Manglik line. A reader was told "Present" about their own marriage without being
   told that the tradition being quoted also carries the exception that may apply to
   them.

   This follows the precedent Ganak already set on /calculator/mangal-dosha, where
   `mitigations` soften how a dosha is READ and never erase that it is present:
   the exception is named, the reader is told traditions differ on whether it
   cancels, and the points, the verdict band and the dosha flags are untouched.
   Whether a cancelled dosha should stop capping the headline band is a religious
   -accuracy call for the owner, recorded in
   plans/audits/2026-08-18-matching-remainder-fix.md — not a ruling this file invents. */
const NADI_EXCEPTION_COPY = {
  sameRashiDifferentStar: {
    en: "both Moons are in the same rashi but in different nakshatras",
    hi: "दोनों की चन्द्र राशि एक है पर जन्म नक्षत्र अलग-अलग हैं",
  },
  sameStarDifferentRashi: {
    en: "both share the nakshatra but their Moon rashis differ",
    hi: "दोनों का जन्म नक्षत्र एक है पर चन्द्र राशियाँ अलग हैं",
  },
};
const BHAKOOT_EXCEPTION_COPY = {
  sameLord: {
    en: "one and the same planet rules both Moon signs",
    hi: "दोनों चन्द्र राशियों का स्वामी एक ही ग्रह है",
  },
  friendlyLords: {
    en: "the two sign lords are mutual friends, so Graha Maitri stands at its full 5",
    hi: "दोनों राशि-स्वामी परस्पर मित्र हैं, इसलिए ग्रह मैत्री पूरे 5 अंक पर है",
  },
};
function nadiExceptionsFor(boy: any, girl: any, dosha: boolean) {
  if (!dosha) return [];
  const keys: string[] = [];
  if (boy.rashi === girl.rashi && boy.nak !== girl.nak) keys.push("sameRashiDifferentStar");
  if (boy.nak === girl.nak && boy.rashi !== girl.rashi) keys.push("sameStarDifferentRashi");
  return keys.map((key) => ({ key, en: NADI_EXCEPTION_COPY[key].en, hi: NADI_EXCEPTION_COPY[key].hi }));
}
function bhakootExceptionsFor(lB: string, lG: string, dosha: boolean) {
  if (!dosha) return [];
  const keys: string[] = [];
  /* Same lord and mutual friendship are the two published exceptions. "Graha Maitri
     is full" is not a third: _maitri returns 5 for exactly these two cases, so
     listing it separately would print the same fact twice. */
  if (lB === lG) keys.push("sameLord");
  else if (_gmRel(lB, lG) === "F" && _gmRel(lG, lB) === "F") keys.push("friendlyLords");
  return keys.map((key) => ({ key, en: BHAKOOT_EXCEPTION_COPY[key].en, hi: BHAKOOT_EXCEPTION_COPY[key].hi }));
}

/* ---------------- Dashakoota (South-Indian, 10 kutas, 36 points) ----------------
   Reuses the Ashtakoota tables where the koota is shared (Gana, Yoni, Rasi/Bhakoot,
   Rasyadhipati/Graha-Maitri, Vashya) and adds the five South-Indian-specific ones
   (Dina, Mahendra, Stree Deergha, Rajju, Vedha). Point maxima per the standard
   36-point distribution. Rajju and Vedha are the critical "hard-block" doshas. */
// Rajju: 27 stars zig-zag through 5 body-part groups in a 9-star cycle.
const RAJJU_CYCLE = [0, 1, 2, 3, 4, 3, 2, 1, 0]; // Pada,Kati,Nabhi,Kantha,Siro,(desc)
const RAJJU_NAMES = ["Pada (feet)", "Kati (waist)", "Nabhi (navel)", "Kantha (neck)", "Siro (head)"];
const RAJJU_NAMES_HI = ["पाद", "कटि", "नाभि", "कण्ठ", "शिरो"];
const rajjuOf = (nak: number) => RAJJU_CYCLE[nak % 9];
// Vedha (obstruction) star pairs, 0-indexed; Mrigashira (4) has no vedha partner.
const VEDHA_PAIRS = [[0, 17], [1, 16], [2, 15], [3, 14], [5, 21], [6, 20], [7, 19], [8, 18], [9, 26], [10, 25], [11, 24], [12, 23], [13, 22]];
const isVedha = (a: number, b: number) => VEDHA_PAIRS.some(([x, y]) => (a === x && b === y) || (a === y && b === x));
// Gana compatibility scaled to a 4-point maximum (from the Ashtakoota 6-point matrix).
const GANA_D = [[4, 4, 1], [3, 4, 0], [1, 0, 4]];
const countStar = (from: number, to: number) => ((to - from + 27) % 27) + 1; // 1..27

/* Every Dashakoota row carries the ACTUAL reading — the star count, the pair of
   groups, the rule that fired — in both languages, exactly as the Ashtakoota table
   does. It used to carry a generic sentence about what the kuta means, computed
   notes that no surface ever rendered, and a separate English-only meaning map in
   the screen (bug bash F23, and F10's Hindi half repeated here). A practitioner
   reading "Dina 3 / 3" could not see the count it came from; now the count is on
   the row, so the score can be checked against the rule instead of trusted. */
function dashakoota(boy: any, girl: any) {
  const cDina = countStar(girl.nak, boy.nak);
  const dinaFav = _taraFav(girl.nak, boy.nak);
  const cMah = countStar(girl.nak, boy.nak);
  const cStree = countStar(girl.nak, boy.nak);
  const rB = rajjuOf(boy.nak), rG = rajjuOf(girl.nak);
  const vedha = isVedha(boy.nak, girl.nak);
  const bhakootBad = [2, 5, 6, 8, 9, 12].includes(((girl.rashi - boy.rashi + 12) % 12) + 1);
  const gB = NAK_GANA[boy.nak], gG = NAK_GANA[girl.nak];
  const yB = NAK_YONI[boy.nak], yG = NAK_YONI[girl.nak];
  const lB = SIGN_LORD[boy.rashi], lG = SIGN_LORD[girl.rashi];
  const wB = SIGN_VASHYA[boy.rashi], wG = SIGN_VASHYA[girl.rashi];
  const mahFav = [4, 7, 10, 13, 16, 19, 22, 25].includes(cMah);
  const cnt = (n: number) => `${n}`;
  const k = [
    { name: "Dina", got: dinaFav ? 3 : 0, max: 3,
      note: `star count ${cnt(cDina)} from the bride's star — remainder ${cDina % 9} of 9, ${dinaFav ? "even, so favourable" : "odd, so not favourable"}`,
      noteHi: `कन्या के नक्षत्र से गणना ${cnt(cDina)} — नौ का शेष ${cDina % 9}, ${dinaFav ? "सम होने से अनुकूल" : "विषम होने से अनुकूल नहीं"}` },
    { name: "Gana", got: GANA_D[gB][gG], max: 4,
      note: pairEn(GANA_NAMES[gB], GANA_NAMES[gG]),
      noteHi: pairHi(GANA_NAMES_HI[gB], GANA_NAMES_HI[gG]) },
    { name: "Mahendra", got: mahFav ? 2 : 0, max: 2,
      note: `star count ${cnt(cMah)} — ${mahFav ? "a Mahendra count (4, 7, 10, 13, 16, 19, 22, 25)" : "not one of the Mahendra counts (4, 7, 10, 13, 16, 19, 22, 25)"}`,
      noteHi: `नक्षत्र गणना ${cnt(cMah)} — ${mahFav ? "महेन्द्र गणना (4, 7, 10, 13, 16, 19, 22, 25) में है" : "महेन्द्र गणना (4, 7, 10, 13, 16, 19, 22, 25) में नहीं है"}` },
    { name: "Stree Deergha", got: cStree > 13 ? 2 : 0, max: 2,
      note: `star count ${cnt(cStree)} — ${cStree > 13 ? "above 13, so full marks" : "13 or below, so no marks under the rule Ganak applies"}`,
      noteHi: `नक्षत्र गणना ${cnt(cStree)} — ${cStree > 13 ? "13 से अधिक, इसलिए पूरे अंक" : "13 या उससे कम, इसलिए गणक के लागू नियम से अंक नहीं"}` },
    { name: "Yoni", got: YONI_MATRIX[yB][yG], max: 4,
      note: pairEn(YONI_NAMES[yB], YONI_NAMES[yG]),
      noteHi: pairHi(YONI_NAMES_HI[yB], YONI_NAMES_HI[yG]) },
    { name: "Rasi", got: bhakootBad ? 0 : 7, max: 7,
      note: `${pairEn(signName("en", boy.rashi), signName("en", girl.rashi))} — ${bhakootBad ? "a 2/12, 5/9 or 6/8 axis" : "not a 2/12, 5/9 or 6/8 axis"}`,
      noteHi: `${pairHi(signName("hi", boy.rashi), signName("hi", girl.rashi))} — ${bhakootBad ? "2/12, 5/9 या 6/8 अक्ष" : "2/12, 5/9 या 6/8 अक्ष नहीं"}` },
    { name: "Rasyadhipati", got: _maitri(lB, lG), max: 5,
      note: pairEn(lB, lG), noteHi: pairHi(lordHi(lB), lordHi(lG)) },
    { name: "Vashya", got: wB === wG ? 2 : VASHYA_MATRIX[wB][wG], max: 2,
      note: pairEn(VASHYA_NAMES[wB], VASHYA_NAMES[wG]),
      noteHi: pairHi(VASHYA_NAMES_HI[wB], VASHYA_NAMES_HI[wG]) },
    { name: "Rajju", got: rB === rG ? 0 : 5, max: 5,
      note: rB === rG ? `both in the ${RAJJU_NAMES[rB]} rajju` : pairEn(RAJJU_NAMES[rB], RAJJU_NAMES[rG]),
      noteHi: rB === rG ? `दोनों ${RAJJU_NAMES_HI[rB]} रज्जु में` : pairHi(RAJJU_NAMES_HI[rB], RAJJU_NAMES_HI[rG]) },
    { name: "Vedha", got: vedha ? 0 : 2, max: 2,
      note: vedha ? "the two birth stars are a vedha (obstruction) pair" : "the two birth stars are not a vedha pair",
      noteHi: vedha ? "दोनों जन्म नक्षत्र परस्पर वेध करते हैं" : "दोनों जन्म नक्षत्रों में वेध नहीं है" },
  ];
  const total = k.reduce((s, x) => s + x.got, 0);
  /* The Dashakoota system's OWN band. Deliberately not rendered: the screen shows a
     single verdict computed from both systems together (matchVerdict below), and
     printing this one beside it is the F3 defect. Kept as engine output because the
     gate pins it and a caller may legitimately want the per-system reading. */
  const verdict = total < 18 ? "poor" : total <= 22 ? "moderate" : total <= 25 ? "good" : total <= 28 ? "very-good" : "excellent";
  return {
    kootas: k, total, max: 36, verdict,
    rajjuDosha: rB === rG, rajjuGroup: rB === rG ? RAJJU_NAMES[rB] : null, rajjuGroupHi: rB === rG ? RAJJU_NAMES_HI[rB] : null,
    vedhaDosha: vedha,
    /* The raw counts the three count-based kutas were scored from, so a gate — and
       a practitioner — can check the score against the rule rather than trust it.
       The tier granularity itself (Stree Deergha is graded 0/1/2 in some published
       tables, Dina in more than two steps) is a source-variation question recorded
       for the owner, not changed here. */
    counts: { dina: cDina, mahendra: cMah, streeDeergha: cStree },
  };
}

/* ---------------- Manglik / Mangal Dosha, three references ----------------
   Ganak's own /calculator/mangal-dosha checks Mars against the Lagna, the Moon
   AND Venus (src/engine/mangal-dosha.ts, methodKey
   "mars-1-2-4-7-8-12-from-lagna-moon-venus"), and validation/mangal-dosha.cjs
   asserts that all three are checked separately. Matching used to look at the
   Lagna alone, so the two screens gave a couple opposite answers about the same
   birth record (bug bash 2026-08-18, F1). The convention below is a copy of the
   calculator's, not a new one — validation/doshas.cjs now sweeps real charts and
   fails if the two ever disagree again.

   The two tables below mirror mangal-dosha.ts exactly, including the 1st-house
   exception row and Jupiter's three FULL aspects (5th, 7th and 9th), both restored
   on 2026-08-18 (bug bash F19). validation/mangal-dosha.cjs compares the two copies
   directly, and validation/doshas.cjs sweeps real charts for the same agreement, so
   they cannot drift apart again. */
const MANGAL_TRADITION_EXCEPTIONS = { 1: [0, 7], 2: [2, 5], 4: [0, 7], 7: [3, 9], 8: [8, 11], 12: [1, 6] };
const MANGAL_JUPITER_FULL_ASPECTS = [5, 7, 9];
const MANGLIK_REF_LABELS = {
  lagna: { en: "Lagna", hi: "लग्न" },
  moon: { en: "Moon", hi: planetName("hi", "Moon") },
  venus: { en: "Venus", hi: planetName("hi", "Venus") },
};
const houseFrom = (sign: number, refSign: number) => ((sign - refSign + 12) % 12) + 1;

/** Manglik status of ONE chart, on the same three references the calculator uses. */
function manglikProfile(c: any) {
  const mars = c.rows.find((p: any) => p.name === "Mars");
  const jupiter = c.rows.find((p: any) => p.name === "Jupiter");
  const venus = c.rows.find((p: any) => p.name === "Venus");
  const refs = [
    { key: "lagna", sign: c.ascSign },
    { key: "moon", sign: c.moon.sign },
    { key: "venus", sign: venus.sign },
  ].map((ref) => {
    const house = houseFrom(mars.sign, ref.sign);
    const counted = MANGLIK_HOUSES.includes(house);
    const mitigations: string[] = [];
    if (counted && [0, 7, 9].includes(mars.sign)) mitigations.push("ownOrExalted");
    if (counted && (jupiter.sign === mars.sign || MANGAL_JUPITER_FULL_ASPECTS.includes(houseFrom(jupiter.sign, mars.sign)))) mitigations.push("jupiterSupport");
    if (counted && MANGAL_TRADITION_EXCEPTIONS[house]?.includes(mars.sign)) mitigations.push("traditionSpecific");
    return { ...ref, labelEn: MANGLIK_REF_LABELS[ref.key].en, labelHi: MANGLIK_REF_LABELS[ref.key].hi, house, counted, mitigations };
  });
  const rawCount = refs.filter((r) => r.counted).length;
  const mitigationCount = refs.reduce((n, r) => n + (r.mitigations.length ? 1 : 0), 0);
  const adjustedScore = Math.max(0, rawCount - Math.min(rawCount, mitigationCount) * 0.5);
  return {
    present: rawCount > 0,
    strength: rawCount === 0 ? "none" : adjustedScore >= 2.5 ? "strong" : adjustedScore >= 1.5 ? "moderate" : "limited",
    refs, rawCount, mitigationCount, adjustedScore,
    counted: refs.filter((r) => r.counted).map((r) => r.key),
    marsHouseLagna: refs[0].house, marsHouseMoon: refs[1].house, marsHouseVenus: refs[2].house,
  };
}

/* ---------------- ONE verdict for the whole screen ----------------
   Before this, the screen banded the Ashtakoota total and the Dashakoota total
   independently and printed BOTH as the answer, colour-coded. 1,826 of the
   104,976 nakshatra/rashi combinations landed on opposite extremes, and 569 read
   "Very good match" with Nadi dosha standing (bug bash F3/F4). One computation
   now produces one verdict and every surface renders it; the per-system numbers
   stay on screen as SCORES, never as a second verdict.

   The reading is deliberately cautious and non-fatalistic (plans/religious-content-policy.md,
   and the "NO fatalistic output" rule in the header of doshas.ts):
     · the band follows the LOWER of the two systems — Ganak never presents the
       more flattering system as the answer;
     · any standing hard-block dosha caps the band at "mixed", so a block can
       never sit 40 lines under a green headline;
     · the lowest band asks for a detailed review. It does not tell anyone not to
       marry, and the English and Hindi labels carry the same meaning and the same
       weight — the old English "Not recommended" was harsher than its Hindi
       counterpart "सावधानी आवश्यक". */
const VERDICT_ORDER = ["review", "mixed", "favourable", "strong"] as const;
const VERDICT_COPY = {
  strong: { en: "Strong match", hi: "प्रबल मिलान", tone: "good" },
  favourable: { en: "Favourable match", hi: "अनुकूल मिलान", tone: "gold" },
  mixed: { en: "Mixed — worth a closer look", hi: "मिश्रित — विस्तृत परीक्षण उपयोगी", tone: "accent" },
  review: { en: "Needs a detailed review", hi: "विस्तृत परीक्षण आवश्यक", tone: "caution" },
};
const BLOCK_COPY = {
  nadi: { en: "Nadi dosha", hi: "नाड़ी दोष" },
  bhakoot: { en: "Bhakoot dosha", hi: "भकूट दोष" },
  rajju: { en: "Rajju dosha", hi: "रज्जु दोष" },
  vedha: { en: "Vedha dosha", hi: "वेध दोष" },
  manglik: { en: "one-sided Manglik", hi: "एकपक्षीय मांगलिक स्थिति" },
};
const scoreBand = (pct: number) => (pct >= 0.75 ? 3 : pct >= 0.6 ? 2 : pct >= 0.5 ? 1 : 0);

/** The single headline verdict. Reads the finished scores + doshas of one match. */
function matchVerdict(gm: any, dasha: any, manglik: any) {
  const bandA = scoreBand(gm.total / gm.max), bandD = scoreBand(dasha.total / dasha.max);
  const blocks: string[] = [];
  if (gm.nadiDosha) blocks.push("nadi");
  if (gm.bhakootDosha) blocks.push("bhakoot");
  if (dasha.rajjuDosha) blocks.push("rajju");
  if (dasha.vedhaDosha) blocks.push("vedha");
  if (manglik.oneSided) blocks.push("manglik");
  let idx = Math.min(bandA, bandD);
  if (blocks.length && idx > 1) idx = 1; // a standing block can never read "favourable" or better
  const key = VERDICT_ORDER[idx];
  return {
    key, tone: VERDICT_COPY[key].tone, labelEn: VERDICT_COPY[key].en, labelHi: VERDICT_COPY[key].hi,
    ashta: gm.total, ashtaMax: gm.max, dasha: dasha.total, dashaMax: dasha.max,
    cappedByDosha: blocks.length > 0 && Math.min(bandA, bandD) > 1,
    systemsDiffer: Math.abs(bandA - bandD) >= 2,
    blocks: blocks.map((b) => ({ key: b, en: BLOCK_COPY[b].en, hi: BLOCK_COPY[b].hi })),
  };
}

/** Build a match report using an injected kundli engine (usually shell computeKundli). */
export function computeMatch(computeKundli, boyDetails, girlDetails) {
  /* Ayanamsa is pinned here, not inherited. `AYAN_MODE` in panchang.ts is module-
     global mutable state that the chart screen's ayanamsa chips write to, and
     matching used to pass birth details with no `ayanamsa` key at all — so the
     couple's charts were cast on whatever convention the last caster happened to
     leave behind, while the screen claimed "the same validated ephemeris as the
     rest of the app" (bug bash F8/F17). Every calculator that answers about a
     dosha already pins Lahiri the same way (mangal-dosha.ts, sade-sati-report.ts).
     A caller may still override deliberately; what it can no longer do is drift. */
  const withConvention = (d: any) => ({ ayanamsa: MATCH_CONVENTION.ayanamsa, ...d });
  const cb = computeKundli(withConvention(boyDetails)), cg = computeKundli(withConvention(girlDetails));
  const ex = (c) => { const mars=c.rows.find(p=>p.name==="Mars"); const mp = manglikProfile(c);
    return { nak:c.moon.nak, rashi:c.moon.sign, lord:SIGN_LORD[c.moon.sign], marsSign:mars.sign,
      marsHouseLagna:mp.marsHouseLagna, marsHouseMoon:mp.marsHouseMoon, marsHouseVenus:mp.marsHouseVenus,
      manglikLagna:MANGLIK_HOUSES.includes(mp.marsHouseLagna), manglikMoon:MANGLIK_HOUSES.includes(mp.marsHouseMoon),
      manglik:mp }; };
  const boy=ex(cb), girl=ex(cg), gm=gunaMilan(boy,girl);
  const bothManglik = boy.manglik.present && girl.manglik.present;
  const manglik = {
    boy: boy.manglik.present, girl: girl.manglik.present,
    boyLagna: boy.manglikLagna, girlLagna: girl.manglikLagna,
    boyMoon: boy.manglikMoon, girlMoon: girl.manglikMoon,
    boyProfile: boy.manglik, girlProfile: girl.manglik,
    both: bothManglik, neither: !boy.manglik.present && !girl.manglik.present,
    oneSided: boy.manglik.present !== girl.manglik.present,
    /* Mutual Manglik is the classical cancellation. Two people who are BOTH free of
       the dosha are not "cancelled" — they are clear; the old code conflated the
       two and rendered the clear-copy for a couple who were both Manglik. */
    cancelled: bothManglik,
    clear: !boy.manglik.present && !girl.manglik.present,
  };
  const papa = papasamyam(cb, cg);
  const dasha = dashakoota(boy, girl);
  const verdict = matchVerdict(gm, dasha, manglik);
  return { boy, girl, ...gm, manglik, papa, dasha, verdict, convention: MATCH_CONVENTION, charts:{ boy:cb, girl:cg } };
}

export { gunaMilan, dashakoota, manglikProfile, matchVerdict, NF, MANGLIK_HOUSES, VERDICT_COPY, BLOCK_COPY, VERDICT_ORDER,
  MATCH_CONVENTION, NADI_EXCEPTION_COPY, BHAKOOT_EXCEPTION_COPY,
  MANGAL_TRADITION_EXCEPTIONS, MANGAL_JUPITER_FULL_ASPECTS };
