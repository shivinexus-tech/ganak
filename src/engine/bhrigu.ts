/* Bhrigu systems (BNN + BCP/BSP + Jupiter progression) — pure extraction (SPLIT-UI-JYOTISH-01a).
   Calculation only; UI modules (BNNModule / BhriguModule) still in the shell until wired. */

import { SIGN_LORD } from "./panchang";
import { planetGochar } from "./gochar";

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


export {
  computeBNN,
  bnnRelations,
  bnnDirectional,
  bnnReading,
  bnnTiming,
  bcpForAge,
  bcpTimeline,
  bspRules,
  jupiterProgression,
  BNN_PLANETS,
  BNN_KARAKA,
  BCP_CYCLE_LORDS,
  BCP_HOUSE_THEME,
};
