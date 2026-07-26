/* Dosha analyses — Kala Sarpa (12 named types), Pitra Dosha (transparent
   convention) and Papa Dosha / Papasamyam (papa-point count). Pure: every
   function operates on a computed chart's `rows` (name, sign, lon, house) plus
   `ascSign`; no ephemeris/ayanamsa state is touched here.

   Design rule for this file: NO fatalistic output. These are traditional
   interpretive patterns, shown transparently with the exact rule that fired.
   Verdict framing ("indications present", "load index"), caveats and remedy
   tone live in the UI, never as a certainty of harm. See backlog P0-JYOTISH. */

import { rev } from "./ephemeris";
import { SIGN_LORD } from "./panchang";

type Row = { name: string; sign: number; lon: number; house: number };

const CLASSICAL = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"];
/* Natural malefics used for the papa (malefic) count. Waning Moon / afflicted
   Mercury are intentionally excluded to keep the convention transparent. */
const PAPA_MALEFICS = ["Sun", "Mars", "Saturn", "Rahu", "Ketu"];
/* Classical affliction houses — the same 1,2,4,7,8,12 set Ganak already uses for
   Mangal Dosha, generalised to every natural malefic. One documented house table
   across the app, not a second competing one. */
const PAPA_HOUSES = [1, 2, 4, 7, 8, 12];

const houseFrom = (sign: number, refSign: number) => ((sign - refSign + 12) % 12) + 1;
const byName = (rows: Row[], name: string) => rows.find((p) => p.name === name)!;

/* ------------------------------------------------------------------ Kala Sarpa
   The twelve named yogas by the house Rahu occupies (Ketu is always the 7th
   from Rahu). Meanings describe the life-axis emphasis, never a prediction of
   harm. */
const KS_TYPES = [
  { key: "anant", en: "Anant", hi: "अनन्त", areaEn: "self, vitality and partnerships", areaHi: "स्वयं, जीवनी-शक्ति और साझेदारी" },
  { key: "kulika", en: "Kulika", hi: "कुलिक", areaEn: "wealth, speech and family", areaHi: "धन, वाणी और कुटुम्ब" },
  { key: "vasuki", en: "Vasuki", hi: "वासुकि", areaEn: "courage, effort and siblings", areaHi: "साहस, पुरुषार्थ और भाई-बहन" },
  { key: "shankhapala", en: "Shankhapala", hi: "शंखपाल", areaEn: "home, mother and inner peace", areaHi: "घर, माता और मन की शान्ति" },
  { key: "padma", en: "Padma", hi: "पद्म", areaEn: "learning, children and creativity", areaHi: "विद्या, संतान और सृजन" },
  { key: "mahapadma", en: "Mahapadma", hi: "महापद्म", areaEn: "service, health and effort", areaHi: "सेवा, स्वास्थ्य और परिश्रम" },
  { key: "takshaka", en: "Takshaka", hi: "तक्षक", areaEn: "partnership and relationships", areaHi: "साझेदारी और सम्बन्ध" },
  { key: "karkotaka", en: "Karkotaka", hi: "कर्कोटक", areaEn: "change, depth and longevity", areaHi: "परिवर्तन, गहराई और आयु" },
  { key: "shankhachuda", en: "Shankhachuda", hi: "शंखचूड़", areaEn: "fortune, dharma and father", areaHi: "भाग्य, धर्म और पिता" },
  { key: "ghataka", en: "Ghataka", hi: "घातक", areaEn: "career, standing and action", areaHi: "कर्म, प्रतिष्ठा और कार्य" },
  { key: "vishadhara", en: "Vishadhara", hi: "विषधर", areaEn: "gains, friendships and aims", areaHi: "लाभ, मित्रता और आकांक्षा" },
  { key: "sheshanaga", en: "Sheshanaga", hi: "शेषनाग", areaEn: "release, expenses and the unseen", areaHi: "मोक्ष, व्यय और अप्रकट" },
];

/* Enclosure test: all seven classical planets strictly inside ONE Rahu–Ketu
   semicircle. `enclosed` is the larger of the two arc counts (0–7). */
export function kalaSarpaFromRows(rows: Row[], ascSign: number) {
  const rahu = byName(rows, "Rahu");
  const ketu = byName(rows, "Ketu");
  const classical = rows.filter((p) => CLASSICAL.includes(p.name));
  const fwd = classical.filter((p) => { const a = rev(p.lon - rahu.lon); return a > 1e-4 && a < 180 - 1e-4; });
  const bwd = classical.filter((p) => { const a = rev(rahu.lon - p.lon); return a > 1e-4 && a < 180 - 1e-4; });
  const majority = fwd.length >= bwd.length ? fwd : bwd;
  const enclosed = majority.length;
  const full = fwd.length === 7 || bwd.length === 7;
  // Partial pattern: six enclosed, one planet on/just outside the axis. Shown as
  // "partial", never as the full yoga.
  const partial = !full && enclosed === 6;
  const outside = classical.filter((p) => !majority.includes(p)).map((p) => p.name);
  const rahuHouse = houseFrom(rahu.sign, ascSign);
  const ketuHouse = houseFrom(ketu.sign, ascSign);
  const type = KS_TYPES[rahuHouse - 1];
  // Udit (ascending): the enclosing arc runs zodiacally Rahu → Ketu, i.e. the
  // planets sit ahead of Rahu. Anudit otherwise. Secondary descriptor only.
  const direction = fwd.length >= bwd.length ? "udit" : "anudit";
  return {
    present: full, full, partial, enclosed, outside,
    rahuHouse, ketuHouse, direction,
    typeKey: type.key, typeEn: type.en, typeHi: type.hi, areaEn: type.areaEn, areaHi: type.areaHi,
    boundary: "Nodes are excluded; all seven classical planets must lie strictly within one Rahu–Ketu semicircle. The named type follows the house Rahu occupies.",
  };
}

/* ----------------------------------------------------------------- Pitra Dosha
   A transparent, documented convention. Each check is shown individually with
   the exact placement that fired; the result is graded as indications, never a
   certainty. Affliction model = conjunction (same rasi); Sun-with-a-node already
   covers both nodal directions (Sun opposite Rahu ≡ Sun with Ketu). We do not
   apply special graha drishti here — stated as a deliberate limitation. */
const PITRA_CHECKS = [
  { key: "sun-nodes", en: "Sun conjunct Rahu or Ketu", hi: "सूर्य के साथ राहु या केतु" },
  { key: "sun-saturn", en: "Sun conjunct Saturn", hi: "सूर्य के साथ शनि" },
  { key: "nodes-9th", en: "Rahu or Ketu in the 9th house (father / ancestors)", hi: "नवम भाव (पिता/पूर्वज) में राहु या केतु" },
  { key: "ninth-lord", en: "9th lord conjunct Rahu, Ketu or Saturn", hi: "नवमेश के साथ राहु, केतु या शनि" },
  { key: "sun-9th-afflicted", en: "Sun in the 9th, conjunct a malefic", hi: "नवम भाव में सूर्य, पापग्रह के साथ" },
];

export function pitraDoshaFromRows(rows: Row[], ascSign: number) {
  const sun = byName(rows, "Sun");
  const sat = byName(rows, "Saturn");
  const rahu = byName(rows, "Rahu");
  const ketu = byName(rows, "Ketu");
  const mars = byName(rows, "Mars");
  const sunHouse = houseFrom(sun.sign, ascSign);
  const ninthSign = (ascSign + 8) % 12;
  const ninthLord = SIGN_LORD[ninthSign];
  const ninthLordRow = byName(rows, ninthLord);
  const sameSign = (a: Row, b: Row) => a.sign === b.sign;

  const fired: Record<string, boolean> = {
    "sun-nodes": sameSign(sun, rahu) || sameSign(sun, ketu),
    "sun-saturn": sameSign(sun, sat),
    "nodes-9th": houseFrom(rahu.sign, ascSign) === 9 || houseFrom(ketu.sign, ascSign) === 9,
    "ninth-lord": [rahu, ketu, sat].some((m) => m.name !== ninthLord && sameSign(ninthLordRow, m)),
    "sun-9th-afflicted": sunHouse === 9 && [sat, rahu, ketu, mars].some((m) => sameSign(sun, m)),
  };

  const checks = PITRA_CHECKS.map((c) => ({ ...c, fired: !!fired[c.key] }));
  const count = checks.filter((c) => c.fired).length;
  const grade = count === 0 ? "none" : count === 1 ? "single" : "multiple";
  return {
    checks, count, grade, present: count >= 1,
    sunHouse, ninthLord,
    convention: "Transparent conjunction (same-sign) model from the Lagna: Sun with the nodes or Saturn, nodes in the 9th, an afflicted 9th lord, or an afflicted Sun in the 9th. Special graha drishti is not applied. Traditions differ; this is one documented lens, not a verdict.",
  };
}

/* ------------------------------------------------------------- Papa (malefic) count
   From three references — Lagna, Moon, Venus — each natural malefic sitting in a
   1/2/4/7/8/12 house scores one papa point. This is a comparative "load index"
   (its real use is Papasamyam below), not a standalone verdict of harm. */
function papaForRef(rows: Row[], refSign: number, refKey: string) {
  const hits = PAPA_MALEFICS
    .map((name) => ({ name, house: houseFrom(byName(rows, name).sign, refSign) }))
    .filter((h) => PAPA_HOUSES.includes(h.house));
  return { ref: refKey, points: hits.length, hits };
}

export function papaCountFromRows(rows: Row[], ascSign: number, moonSign: number, venusSign: number) {
  const byRef = [
    papaForRef(rows, ascSign, "lagna"),
    papaForRef(rows, moonSign, "moon"),
    papaForRef(rows, venusSign, "venus"),
  ];
  const total = byRef.reduce((s, r) => s + r.points, 0);
  // 5 malefics × 3 references = 15 max. Descriptive bands only.
  const grade = total <= 2 ? "low" : total <= 5 ? "moderate" : "high";
  return { byRef, total, grade, malefics: PAPA_MALEFICS, houses: PAPA_HOUSES };
}

/* Convenience: read Moon/Venus signs off a full chart, then count. */
export function papaCount(chart: any) {
  const moonSign = chart.moon ? chart.moon.sign : byName(chart.rows, "Moon").sign;
  const venusSign = byName(chart.rows, "Venus").sign;
  return papaCountFromRows(chart.rows, chart.ascSign, moonSign, venusSign);
}

/* --------------------------------------------------------------- Papasamyam
   Two-chart malefic-load comparison used in marriage matching. Presented as a
   balance, NEVER a pass/fail: a small difference is "balanced"; otherwise we say
   which chart carries the heavier papa load. Tolerance = 1 papa point. */
export function papasamyam(boyChart: any, girlChart: any) {
  const boy = papaCount(boyChart);
  const girl = papaCount(girlChart);
  const diff = boy.total - girl.total;
  const balanced = Math.abs(diff) <= 1;
  const heavier = balanced ? null : diff > 0 ? "boy" : "girl";
  return {
    boy, girl, diff, balanced, heavier, tolerance: 1,
    convention: "Papa (malefic) load counted identically for both charts from Lagna, Moon and Venus. Traditionally a match is considered balanced when the two loads are comparable; this is one lens among many, not a compatibility verdict.",
  };
}

export { KS_TYPES, PITRA_CHECKS, PAPA_MALEFICS, PAPA_HOUSES };
