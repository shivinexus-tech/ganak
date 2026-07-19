// Bilingual strings and translation helpers — extracted from kundli-app.tsx
// (SPLIT-UI-03b). Pure move: same dictionary, same lookup and fallback order.
// Shared by every screen; integration-owned. Add strings here, don't fork.

import { OBS_NAME } from "./data/festival-meta";
import { EKADASHI_NAMES, PRADOSH_NAMES_BY_DAY } from "./engine/festivals";

/* ---------------- bilingual strings (English / हिन्दी) ---------------- */
const L = {
  // chrome
  langToggle: { en: "हिन्दी", hi: "English" },
  navPanchang: { en: "Panchang", hi: "पंचांग" },
  navMuhurat: { en: "Muhurat", hi: "मुहूर्त" },
  castChart: { en: "Cast the chart", hi: "कुंडली बनाएँ" },
  // hub
  hubTitle: { en: "Panchang & Muhurat", hi: "पंचांग और मुहूर्त" },
  glance: { en: "Today at a glance", hi: "आज एक नज़र में" },
  choghaTitle: { en: "Choghadiya", hi: "चौघड़िया" },
  dayChogha: { en: "Day", hi: "दिन" },
  nightChogha: { en: "Night", hi: "रात" },
  finderTitle: { en: "Muhurat finder", hi: "मुहूर्त खोजें" },
  finderHint: { en: "Pick what you're planning — these are today's suitable and best-avoided windows.", hi: "आप क्या करना चाहते हैं चुनें — ये आज के उपयुक्त और बचने योग्य समय हैं।" },
  goodWindows: { en: "Good windows today", hi: "आज के शुभ समय" },
  avoidWindows: { en: "Best avoided today", hi: "आज बचने योग्य समय" },
  calTitle: { en: "Upcoming fasts & festivals", hi: "आगामी व्रत और त्योहार" },
  moreLabel: { en: "View the full year", hi: "पूरे वर्ष की सूची देखें" },
  searchPlaceholder: { en: "Find a fast, festival, or tithi…", hi: "व्रत, त्योहार या तिथि खोजें…" },
  searchBtn: { en: "Search", hi: "खोजें" },
  backLabel: { en: "Back", hi: "वापस" },
  searchTitle: { en: "Search fasts & festivals", hi: "व्रत व त्योहार खोजें" },
  searchHint: { en: "Try: Ashtami, Ekadashi, Purnima, Amavasya, Diwali", hi: "जैसे: अष्टमी, एकादशी, पूर्णिमा, अमावस्या, दिवाली" },
  noResults: { en: "No matches — try a tithi or festival name.", hi: "कोई परिणाम नहीं — कोई तिथि या त्योहार नाम आज़माएँ।" },
  fastingTab: { en: "Fasting days", hi: "व्रत के दिन" },
  festivalTab: { en: "Festivals", hi: "त्योहार" },
  abhijitL: { en: "Abhijit Muhurat", hi: "अभिजित मुहूर्त" },
  rahuL: { en: "Rahu Kalam", hi: "राहु काल" },
  gulikaL: { en: "Gulika Kalam", hi: "गुलिक काल" },
  yamaL: { en: "Yamaganda", hi: "यमगण्ड" },
  tithiL: { en: "Tithi", hi: "तिथि" },
  nakL: { en: "Nakshatra", hi: "नक्षत्र" },
  varaL: { en: "Weekday", hi: "वार" },
  sunriseL: { en: "Sunrise", hi: "सूर्योदय" },
  sunsetL: { en: "Sunset", hi: "सूर्यास्त" },
  auspiciousNow: { en: "Auspicious now", hi: "अभी शुभ" },
  cautionNow: { en: "Inauspicious now", hi: "अभी अशुभ" },
  neutralNow: { en: "Neutral now", hi: "अभी सामान्य" },
  noneToday: { en: "None upcoming in range", hi: "सीमा में कोई आगामी नहीं" },
  regionalNote: { en: "Festival dates computed from tithi & lunar month; regional calendars may differ by a day.", hi: "त्योहार की तिथियाँ तिथि व चंद्र मास से गणना — क्षेत्रीय पंचांग में एक दिन का अंतर संभव।" },
  natGood: { en: "good", hi: "शुभ" }, natBad: { en: "avoid", hi: "अशुभ" }, natNeutral: { en: "travel", hi: "सम" },
};

const tr = (lang, k) => (L[k] && (L[lang === "hi" ? "hi" : "en"] === undefined ? L[k].en : (L[k][lang] || L[k].en))) || (L[k] ? L[k].en : k);
const trN = (lang, dict, key) => (dict[key] ? (dict[key][lang] || dict[key].en) : key);

const obsLabel = (lang, obs) => {
  // Handle pradosh_N keys directly
  if (obs.key && obs.key.startsWith("pradosh_")) {
    const dayNum = parseInt(obs.key.split("_")[1]);
    return PRADOSH_NAMES_BY_DAY[dayNum] ? (PRADOSH_NAMES_BY_DAY[dayNum][lang] || PRADOSH_NAMES_BY_DAY[dayNum].en) : obs.key;
  }
  // Handle ekadashi variants
  if (obs.baseKey === "ekadashi" && obs.isVariant && EKADASHI_NAMES[obs.key]) return EKADASHI_NAMES[obs.key][lang] || EKADASHI_NAMES[obs.key].en;
  if (obs.baseKey === "pradosh" && obs.isVariant) {
    const dayNum = parseInt(obs.key.split("_")[1]);
    return PRADOSH_NAMES_BY_DAY[dayNum] ? (PRADOSH_NAMES_BY_DAY[dayNum][lang] || PRADOSH_NAMES_BY_DAY[dayNum].en) : obs.key;
  }
  // Fallback for generic keys
  return trN(lang, OBS_NAME, obs.baseKey || obs.key);
};

export { L, tr, trN, obsLabel };
