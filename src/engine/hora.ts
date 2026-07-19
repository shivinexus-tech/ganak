// Hora (planetary hours) engine — extracted from kundli-app.tsx (SPLIT-UI-03a).
// Pure move: Chaldean order, day/night hora windows, and the client-side hora
// advisor. No formula, keyword or scoring change. Owned by the Hora/Gochar lane.

import { SIGN_LORD } from "./panchang";

/* ---- planetary hours (hora): day divided sunrise->sunset, Chaldean order from the weekday lord ---- */
export const HORA_ORDER = ["Sun", "Venus", "Mercury", "Moon", "Saturn", "Jupiter", "Mars"];
export const DAY_LORD = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"];
export function dayHoras(weekday, rise, set) {
  const startIdx = HORA_ORDER.indexOf(DAY_LORD[weekday % 7]);
  const dur = (set - rise) / 12, out = [];
  for (let i = 0; i < 12; i++) out.push({ ruler: HORA_ORDER[(startIdx + i) % 7], start: rise + i * dur, end: rise + (i + 1) * dur });
  return out;
}
/* all hora windows (day + night) ruled by a given planet today */
export function horaWindowsForPlanet(planet, weekday, rise, set) {
  const startIdx = HORA_ORDER.indexOf(DAY_LORD[weekday % 7]);
  const dayDur = (set - rise) / 12, nextRise = rise + 86400000, nightDur = (nextRise - set) / 12, out = [];
  for (let i = 0; i < 12; i++) if (HORA_ORDER[(startIdx + i) % 7] === planet) out.push({ start: rise + i * dayDur, end: rise + (i + 1) * dayDur, period: "day" });
  for (let i = 0; i < 12; i++) if (HORA_ORDER[(startIdx + 12 + i) % 7] === planet) out.push({ start: set + i * nightDur, end: set + (i + 1) * nightDur, period: "night" });
  out.sort((a, b) => a.start - b.start);
  return out;
}
export const HORA_GLYPH = { Sun: "\u2609", Moon: "\u263D", Mars: "\u2642", Mercury: "\u263F", Jupiter: "\u2643", Venus: "\u2640", Saturn: "\u2644" };
export const HORA_COLOR = { Sun: "#C2451E", Moon: "#5B7FB0", Mars: "#B23B2E", Mercury: "#2E8B6F", Jupiter: "#A86A12", Venus: "#9A5BA3", Saturn: "#5A6470" };
export const HORA_NAME = { Sun: { en: "Sun", hi: "\u0938\u0942\u0930\u094D\u092F" }, Moon: { en: "Moon", hi: "\u091A\u0902\u0926\u094D\u0930" }, Mars: { en: "Mars", hi: "\u092E\u0902\u0917\u0932" }, Mercury: { en: "Mercury", hi: "\u092C\u0941\u0927" }, Jupiter: { en: "Jupiter", hi: "\u0917\u0941\u0930\u0941" }, Venus: { en: "Venus", hi: "\u0936\u0941\u0915\u094D\u0930" }, Saturn: { en: "Saturn", hi: "\u0936\u0928\u093F" } };
export const HORA_NATURE = { Sun: { en: "authority, health, government", hi: "\u0905\u0927\u093F\u0915\u093E\u0930, \u0938\u094D\u0935\u093E\u0938\u094D\u0925\u094D\u092F" }, Moon: { en: "travel, home, public dealings", hi: "\u092F\u093E\u0924\u094D\u0930\u093E, \u0917\u0943\u0939, \u091C\u0928\u0938\u0902\u092A\u0930\u094D\u0915" }, Mars: { en: "energy, property, contests", hi: "\u090A\u0930\u094D\u091C\u093E, \u0938\u0902\u092A\u0924\u094D\u0924\u093F" }, Mercury: { en: "study, trade, communication", hi: "\u0905\u0927\u094D\u092F\u092F\u0928, \u0935\u094D\u092F\u093E\u092A\u093E\u0930" }, Jupiter: { en: "learning, finance, auspicious acts", hi: "\u0936\u093F\u0915\u094D\u0937\u093E, \u0927\u0928, \u0936\u0941\u092D \u0915\u093E\u0930\u094D\u092F" }, Venus: { en: "arts, relationships, purchases", hi: "\u0915\u0932\u093E, \u0938\u0902\u092C\u0902\u0927, \u0916\u0930\u0940\u0926" }, Saturn: { en: "labour, real estate, patience", hi: "\u0936\u094D\u0930\u092E, \u092D\u0942\u092E\u093F, \u0927\u0948\u0930\u094D\u092F" } };


/* ===== HORA ADVISOR ENGINE ===== */
/* Comprehensive activity database with synonyms and hora suitability */
/* ===== HORA ADVISOR (client-side, confidence-scored, no API) ===== */
/* word/phrase matcher: full-word for short tokens, prefix for longer, substring for Hindi */
export const horaHasTerm = (q, kw) => {
  const k = (kw || "").replace(/_/g, " ").toLowerCase();
  if (!k) return false;
  if (/[^\x00-\x7f]/.test(k)) return q.includes(k);
  const re = k.length <= 4 ? new RegExp("\\b" + k + "\\b") : new RegExp("\\b" + k);
  return re.test(q);
};

/* direct activity -> planet(s) (the confident keyword map) */
export const HORA_ACTIVITY_MAP = [
  { kw: ["business", "commerce", "trade", "trading", "startup", "enterprise", "shop", "dealership", "व्यापार", "व्यवसाय", "दुकान"], planets: ["Mercury", "Jupiter"], act: { en: "business", hi: "व्यापार" } },
  { kw: ["study", "studies", "studying", "exam", "exams", "learning", "education", "student", "course", "tuition", "अध्ययन", "पढ़ाई", "परीक्षा"], planets: ["Mercury", "Jupiter"], act: { en: "study", hi: "अध्ययन" } },
  { kw: ["communication", "writing", "email", "letter", "speech", "negotiation", "संवाद", "लेखन"], planets: ["Mercury"], act: { en: "communication", hi: "संवाद" } },
  { kw: ["interview", "साक्षात्कार"], planets: ["Mercury", "Sun"], act: { en: "an interview", hi: "साक्षात्कार" } },
  { kw: ["career", "job", "jobs", "profession", "occupation", "employment", "promotion", "appraisal", "करियर", "नौकरी", "पेशा"], planets: ["Sun", "Saturn", "Mercury"], act: { en: "career", hi: "करियर" } },
  { kw: ["work", "labour", "labor", "service", "duty", "काम", "श्रम", "सेवा"], planets: ["Saturn", "Sun"], act: { en: "work", hi: "कार्य" } },
  { kw: ["accounts", "accounting", "audit", "tax", "bookkeeping", "लेखा"], planets: ["Mercury"], act: { en: "accounts", hi: "लेखा" } },
  { kw: ["marriage", "wedding", "weddings", "engagement", "betrothal", "matrimony", "विवाह", "शादी"], planets: ["Venus", "Jupiter"], act: { en: "marriage", hi: "विवाह" } },
  { kw: ["romance", "love", "dating", "proposal", "relationship", "courtship", "प्रेम", "प्यार"], planets: ["Venus"], act: { en: "romance", hi: "प्रेम" } },
  { kw: ["art", "music", "dance", "painting", "singing", "creative", "design", "drawing", "कला", "संगीत", "नृत्य"], planets: ["Venus"], act: { en: "creative work", hi: "कला कार्य" } },
  { kw: ["beauty", "cosmetics", "salon", "grooming", "fashion", "makeup", "सौंदर्य"], planets: ["Venus"], act: { en: "beauty & grooming", hi: "सौंदर्य" } },
  { kw: ["property", "land", "plot", "realestate", "real estate", "संपत्ति", "भूमि", "जमीन"], planets: ["Mars", "Saturn"], act: { en: "property", hi: "संपत्ति" } },
  { kw: ["construction", "building", "foundation", "renovation", "repair", "निर्माण", "मकान"], planets: ["Mars", "Saturn"], act: { en: "construction", hi: "निर्माण" } },
  { kw: ["farming", "agriculture", "sowing", "planting", "harvest", "cultivation", "कृषि", "खेती"], planets: ["Saturn", "Moon"], act: { en: "agriculture", hi: "कृषि" } },
  { kw: ["travel", "journey", "trip", "yatra", "voyage", "tour", "यात्रा", "सफर"], planets: ["Moon"], act: { en: "travel", hi: "यात्रा" } },
  { kw: ["relocation", "moving", "shifting", "migrate", "स्थानांतरण"], planets: ["Moon", "Mars"], act: { en: "relocation", hi: "स्थानांतरण" } },
  { kw: ["health", "healing", "recovery", "wellness", "wellbeing", "cure", "स्वास्थ्य", "सेहत"], planets: ["Sun", "Moon"], act: { en: "health", hi: "स्वास्थ्य" } },
  { kw: ["medicine", "treatment", "therapy", "medication", "उपचार", "इलाज", "दवा"], planets: ["Sun"], act: { en: "medical treatment", hi: "उपचार" } },
  { kw: ["surgery", "operation", "शल्य", "ऑपरेशन"], planets: ["Mars"], act: { en: "surgery", hi: "शल्यक्रिया" } },
  { kw: ["government", "official", "administration", "bureaucracy", "सरकारी"], planets: ["Sun"], act: { en: "government work", hi: "सरकारी कार्य" } },
  { kw: ["politics", "election", "promotion", "leadership", "राजनीति", "पदोन्नति"], planets: ["Sun", "Jupiter"], act: { en: "authority & power", hi: "सत्ता" } },
  { kw: ["wealth", "finance", "investment", "savings", "prosperity", "धन", "निवेश"], planets: ["Jupiter"], act: { en: "wealth & finance", hi: "धन" } },
  { kw: ["worship", "puja", "pooja", "prayer", "spiritual", "temple", "mantra", "havan", "yajna", "religious", "पूजा", "धार्मिक", "हवन"], planets: ["Jupiter"], act: { en: "worship", hi: "पूजा" } },
  { kw: ["sports", "competition", "match", "race", "tournament", "contest", "खेल", "प्रतियोगिता"], planets: ["Mars", "Sun"], act: { en: "sports", hi: "खेल" } },
  { kw: ["exercise", "gym", "workout", "fitness", "व्यायाम", "कसरत"], planets: ["Mars", "Sun"], act: { en: "exercise", hi: "व्यायाम" } },
  { kw: ["legal", "court", "lawsuit", "justice", "litigation", "कानूनी", "अदालत"], planets: ["Jupiter", "Sun"], act: { en: "legal matters", hi: "कानूनी कार्य" } },
  { kw: ["vehicle", "car", "cars", "bike", "scooter", "motorcycle", "वाहन", "गाड़ी"], planets: ["Venus"], act: { en: "a vehicle", hi: "वाहन" } },
  { kw: ["jewelry", "jewellery", "gold", "silver", "ornament", "jewel", "आभूषण", "सोना", "गहने"], planets: ["Venus", "Jupiter"], act: { en: "jewelry", hi: "आभूषण" } },
  { kw: ["electronics", "gadget", "phone", "laptop", "computer", "mobile", "इलेक्ट्रॉनिक"], planets: ["Mercury"], act: { en: "electronics", hi: "इलेक्ट्रॉनिक्स" } },
  { kw: ["loan", "borrow", "debt", "mortgage", "ऋण", "कर्ज"], planets: ["Mercury"], act: { en: "a loan", hi: "ऋण" } },
];

/* clarification trees for ambiguous umbrella terms */
export const HORA_CLARIFY = [
  { id: "buying", triggers: ["buy", "buying", "purchase", "purchasing", "shopping", "खरीद"],
    q: { en: "What are you buying?", hi: "आप क्या खरीद रहे हैं?" },
    options: [
      { kw: ["property", "land", "house", "plot", "flat", "संपत्ति", "जमीन"], planets: ["Mars", "Saturn"], label: { en: "Property / land", hi: "संपत्ति / भूमि" }, act: { en: "buying property", hi: "संपत्ति खरीद" } },
      { kw: ["vehicle", "car", "bike", "scooter", "truck", "वाहन", "गाड़ी"], planets: ["Venus"], label: { en: "Vehicle", hi: "वाहन" }, act: { en: "buying a vehicle", hi: "वाहन खरीद" } },
      { kw: ["gold", "jewel", "jewelry", "jewellery", "ornament", "silver", "सोना", "आभूषण"], planets: ["Venus", "Jupiter"], label: { en: "Gold / jewelry", hi: "सोना / आभूषण" }, act: { en: "buying gold or jewelry", hi: "सोना/आभूषण खरीद" } },
      { kw: ["electronic", "gadget", "phone", "laptop", "computer"], planets: ["Mercury"], label: { en: "Electronics", hi: "इलेक्ट्रॉनिक्स" }, act: { en: "buying electronics", hi: "इलेक्ट्रॉनिक्स खरीद" } },
      { kw: ["clothes", "clothing", "dress", "apparel", "कपड़े"], planets: ["Venus"], label: { en: "Clothes", hi: "कपड़े" }, act: { en: "buying clothes", hi: "कपड़े खरीद" } },
    ] },
  { id: "starting", triggers: ["start", "starting", "begin", "launch", "commence", "open", "आरंभ", "शुरू"],
    q: { en: "What are you starting?", hi: "आप क्या शुरू कर रहे हैं?" },
    options: [
      { kw: ["business", "shop", "company", "venture", "व्यापार"], planets: ["Mercury", "Jupiter"], label: { en: "A business", hi: "व्यापार" }, act: { en: "starting a business", hi: "व्यापार आरंभ" } },
      { kw: ["job", "work", "employment", "नौकरी"], planets: ["Mercury", "Sun"], label: { en: "A new job", hi: "नई नौकरी" }, act: { en: "starting a job", hi: "नौकरी आरंभ" } },
      { kw: ["study", "studies", "course", "education", "अध्ययन"], planets: ["Mercury", "Jupiter"], label: { en: "Studies", hi: "अध्ययन" }, act: { en: "starting studies", hi: "अध्ययन आरंभ" } },
      { kw: ["journey", "travel", "trip", "यात्रा"], planets: ["Moon"], label: { en: "A journey", hi: "यात्रा" }, act: { en: "starting a journey", hi: "यात्रा आरंभ" } },
      { kw: ["construction", "building", "house", "निर्माण"], planets: ["Mars", "Saturn"], label: { en: "Construction", hi: "निर्माण" }, act: { en: "starting construction", hi: "निर्माण आरंभ" } },
    ] },
  { id: "money", triggers: ["money", "financial", "fund", "पैसा", "वित्तीय"],
    q: { en: "What kind of money matter?", hi: "किस प्रकार का धन कार्य?" },
    options: [
      { kw: ["invest", "investment", "निवेश"], planets: ["Jupiter"], label: { en: "Investment", hi: "निवेश" }, act: { en: "investment", hi: "निवेश" } },
      { kw: ["loan", "borrow", "debt", "ऋण"], planets: ["Mercury"], label: { en: "Taking a loan", hi: "ऋण लेना" }, act: { en: "a loan", hi: "ऋण" } },
      { kw: ["lend", "lending", "उधार"], planets: ["Jupiter"], label: { en: "Lending", hi: "उधार देना" }, act: { en: "lending", hi: "उधार" } },
      { kw: ["trading", "trade", "stock", "शेयर"], planets: ["Mercury"], label: { en: "Trading / stocks", hi: "व्यापार / शेयर" }, act: { en: "trading", hi: "ट्रेडिंग" } },
      { kw: ["account", "deposit", "savings", "खाता"], planets: ["Jupiter"], label: { en: "Opening an account", hi: "खाता खोलना" }, act: { en: "opening an account", hi: "खाता खोलना" } },
    ] },
  { id: "meeting", triggers: ["meeting", "appointment", "meet", "बैठक", "मुलाकात"],
    q: { en: "What kind of meeting?", hi: "किस प्रकार की बैठक?" },
    options: [
      { kw: ["business", "client", "deal", "व्यापार"], planets: ["Mercury"], label: { en: "Business", hi: "व्यापारिक" }, act: { en: "a business meeting", hi: "व्यापारिक बैठक" } },
      { kw: ["official", "government", "authority", "सरकारी"], planets: ["Sun"], label: { en: "Official", hi: "सरकारी" }, act: { en: "an official meeting", hi: "सरकारी बैठक" } },
      { kw: ["romantic", "date", "partner", "प्रेम"], planets: ["Venus"], label: { en: "Romantic", hi: "प्रेम" }, act: { en: "a romantic meeting", hi: "प्रेम मुलाकात" } },
      { kw: ["family", "relative", "परिवार"], planets: ["Moon", "Jupiter"], label: { en: "Family", hi: "पारिवारिक" }, act: { en: "a family gathering", hi: "पारिवारिक मिलन" } },
    ] },
  { id: "ceremony", triggers: ["ceremony", "function", "event", "celebration", "समारोह", "कार्यक्रम"],
    q: { en: "What kind of ceremony?", hi: "किस प्रकार का समारोह?" },
    options: [
      { kw: ["wedding", "marriage", "विवाह"], planets: ["Venus", "Jupiter"], label: { en: "Wedding", hi: "विवाह" }, act: { en: "a wedding", hi: "विवाह" } },
      { kw: ["housewarming", "grih", "गृह"], planets: ["Jupiter", "Venus"], label: { en: "Housewarming", hi: "गृह प्रवेश" }, act: { en: "housewarming", hi: "गृह प्रवेश" } },
      { kw: ["naming", "namkaran", "नामकरण"], planets: ["Mercury", "Jupiter"], label: { en: "Naming (Namkaran)", hi: "नामकरण" }, act: { en: "a naming ceremony", hi: "नामकरण" } },
      { kw: ["worship", "puja", "pooja", "havan", "पूजा"], planets: ["Jupiter"], label: { en: "Worship / Puja", hi: "पूजा" }, act: { en: "worship", hi: "पूजा" } },
    ] },
];

/* light intent detection (best/avoid/good beat explain) */
export const horaIntent = (q) => {
  if (/\b(best|most auspicious|ideal|most suitable)\b/.test(q) || q.includes("सर्वोत्तम") || q.includes("सबसे अच्छ")) return "best";
  if (/\b(avoid|bad|inauspicious|unfavou?rable|not good)\b/.test(q) || q.includes("बचें") || q.includes("अशुभ")) return "avoid";
  if (/\b(good|suitable|favou?rable|auspicious|right time|can i|should i)\b/.test(q) || q.includes("शुभ") || q.includes("उपयुक्त")) return "good";
  if (/\b(what|why|explain|meaning|significance)\b/.test(q) || q.includes("क्या") || q.includes("क्यों")) return "explain";
  return "general";
};

export const HORA_PLANET_KEYS = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"];
export const horaDetectPlanet = (q) => {
  for (const p of HORA_PLANET_KEYS) { if (horaHasTerm(q, p.toLowerCase()) || q.includes(HORA_NAME[p].hi)) return p; }
  return null;
};

/* main analyzer: returns {status, ...} */
export const analyzeHora = (question) => {
  const q = (question || "").toLowerCase().trim();
  if (!q) return { status: "empty" };
  const intent = horaIntent(q);
  // ambiguous umbrella -> resolve via sub-keyword or clarify
  for (const tree of HORA_CLARIFY) {
    if (tree.triggers.some((t) => horaHasTerm(q, t))) {
      for (const opt of tree.options) if (opt.kw.some((k) => horaHasTerm(q, k))) return { status: "answer", intent, planets: opt.planets, act: opt.act, conf: "high" };
      return { status: "clarify", intent, tree };
    }
  }
  // direct activity map
  const matches = HORA_ACTIVITY_MAP.filter((e) => e.kw.some((k) => horaHasTerm(q, k)));
  if (matches.length) {
    const planets = [...new Set(matches.flatMap((m) => m.planets))];
    const withTiming = /\b(today|now|tonight|time|when|currently)\b/.test(q) || q.includes("आज") || q.includes("कब") || q.includes("समय") || q.includes("बजे");
    return { status: "answer", intent, planets, act: matches[0].act, conf: matches.length === 1 ? "high" : "medium", withTiming };
  }
  // a planet is named -> default to TIMING (when is it today); explain only if explicitly asked
  const p = horaDetectPlanet(q);
  if (p) {
    const wantsExplain = /\b(what|why|explain|meaning|significance|represent|about|signif)\b/.test(q) || q.includes("क्या") || q.includes("क्यों") || q.includes("मतलब");
    const wantsTiming = /\b(today|when|time|now|tonight|currently)\b/.test(q) || q.includes("कब") || q.includes("समय") || q.includes("आज") || q.includes("बजे");
    if (wantsExplain && !wantsTiming) return { status: "explain", planet: p };
    return { status: "timing", planet: p };
  }
  return { status: "unknown" };
};

/* personally-auspicious planets = lords of trikona houses (1,5,9) from ascendant */
export const horaPersonalAusp = (ascIdx) => [...new Set([0, 4, 8].map((o) => SIGN_LORD[(ascIdx + o) % 12]))];

/* build the displayable answer text (bilingual) */
export const horaResultText = (res, ascIdx) => {
  if (!res) return null;
  if (res.status === "explain") {
    const p = res.planet;
    return { planets: [p], text: { en: `${p} hora favours ${HORA_NATURE[p].en}.`, hi: `${HORA_NAME[p].hi} होरा ${HORA_NATURE[p].hi} के लिए उपयुक्त है।` }, note: null };
  }
  if (res.status === "answer") {
    const { planets, act, intent } = res;
    const enN = planets.join(" & "), hiN = planets.map((p) => HORA_NAME[p].hi).join(" व ");
    let en, hi;
    if (intent === "avoid") {
      en = `For ${act.en}, ${enN} hora ${planets.length > 1 ? "are" : "is"} not ideal — choose another hora.`;
      hi = `${act.hi} के लिए ${hiN} होरा उपयुक्त नहीं — कोई अन्य होरा चुनें।`;
    } else if (intent === "best") {
      en = `Best hora for ${act.en}: ${planets[0]} — ${HORA_NATURE[planets[0]].en}.`;
      hi = `${act.hi} के लिए सर्वोत्तम होरा: ${HORA_NAME[planets[0]].hi} — ${HORA_NATURE[planets[0]].hi}।`;
    } else {
      en = `${enN} hora ${planets.length > 1 ? "are" : "is"} favourable for ${act.en}.`;
      hi = `${act.hi} के लिए ${hiN} होरा शुभ ${planets.length > 1 ? "हैं" : "है"}।`;
    }
    let note = null;
    if (ascIdx != null && ascIdx >= 0) {
      const mine = horaPersonalAusp(ascIdx), overlap = planets.filter((p) => mine.includes(p));
      if (overlap.length) note = { en: `${overlap.join(" & ")} also rule${overlap.length === 1 ? "s" : ""} auspicious (trikona) houses in your chart — extra favourable for you.`, hi: `${overlap.map((p) => HORA_NAME[p].hi).join(" व ")} आपकी कुंडली के त्रिकोण भावों के स्वामी भी हैं — आपके लिए विशेष शुभ।` };
      else note = { en: `Your personally-auspicious horas (trikona lords): ${mine.join(", ")}.`, hi: `आपके शुभ होरा (त्रिकोण स्वामी): ${mine.map((p) => HORA_NAME[p].hi).join(", ")}।` };
    }
    return { planets, text: { en, hi }, note };
  }
  return null;
};


