/*
 * Hindi vocabulary for the values the astronomy engine returns.
 *
 * The engine deliberately speaks one language internally — every tithi, paksha, lunar month,
 * rashi and nakshatra comes back as its canonical English/IAST-ish name, and the calculations
 * key off those strings. Translating inside the engine would put presentation into the
 * validated numerical layer, so the localisation lives here and is applied at the edge.
 *
 * These are transliterations of Sanskrit terms, not translations: सिंह is the same word as
 * Simha. Anything unknown falls through to the original string rather than disappearing.
 */

const TITHI_HI: Record<string, string> = {
  Pratipada: "प्रतिपदा", Dwitiya: "द्वितीया", Tritiya: "तृतीया", Chaturthi: "चतुर्थी",
  Panchami: "पञ्चमी", Shashthi: "षष्ठी", Saptami: "सप्तमी", Ashtami: "अष्टमी",
  Navami: "नवमी", Dashami: "दशमी", Ekadashi: "एकादशी", Dwadashi: "द्वादशी",
  Trayodashi: "त्रयोदशी", Chaturdashi: "चतुर्दशी", Purnima: "पूर्णिमा", Amavasya: "अमावस्या",
};

const PAKSHA_HI: Record<string, string> = {
  "Shukla Paksha": "शुक्ल पक्ष", "Krishna Paksha": "कृष्ण पक्ष",
  Shukla: "शुक्ल", Krishna: "कृष्ण",
};

const MONTH_HI: Record<string, string> = {
  Chaitra: "चैत्र", Vaishakha: "वैशाख", Vaisakha: "वैशाख", Jyeshtha: "ज्येष्ठ",
  Ashadha: "आषाढ़", Shravana: "श्रावण", Shravan: "श्रावण", Bhadrapada: "भाद्रपद",
  Bhadrapad: "भाद्रपद", Ashwina: "आश्विन", Ashwin: "आश्विन", Kartika: "कार्तिक",
  Kartik: "कार्तिक", Margashirsha: "मार्गशीर्ष", Margshirsh: "मार्गशीर्ष",
  Pausha: "पौष", Paush: "पौष", Magha: "माघ", Magh: "माघ", Phalguna: "फाल्गुन", Phalgun: "फाल्गुन",
};

const SIGN_HI: Record<string, string> = {
  Mesha: "मेष", Vrishabha: "वृषभ", Mithuna: "मिथुन", Karka: "कर्क", Simha: "सिंह",
  Kanya: "कन्या", Tula: "तुला", Vrishchika: "वृश्चिक", Dhanu: "धनु", Makara: "मकर",
  Kumbha: "कुंभ", Meena: "मीन",
};

const NAKSHATRA_HI: Record<string, string> = {
  Ashwini: "अश्विनी", Bharani: "भरणी", Krittika: "कृत्तिका", Rohini: "रोहिणी",
  Mrigashira: "मृगशिरा", Ardra: "आर्द्रा", Punarvasu: "पुनर्वसु", Pushya: "पुष्य",
  Ashlesha: "आश्लेषा", Magha: "मघा", "Purva Phalguni": "पूर्वा फाल्गुनी",
  "Uttara Phalguni": "उत्तरा फाल्गुनी", Hasta: "हस्त", Chitra: "चित्रा", Swati: "स्वाति",
  Vishakha: "विशाखा", Anuradha: "अनुराधा", Jyeshtha: "ज्येष्ठा", Mula: "मूल",
  "Purva Ashadha": "पूर्वाषाढ़ा", "Uttara Ashadha": "उत्तराषाढ़ा", Shravana: "श्रवण",
  Dhanishta: "धनिष्ठा", Shatabhisha: "शतभिषा", "Purva Bhadrapada": "पूर्वा भाद्रपदा",
  "Uttara Bhadrapada": "उत्तरा भाद्रपदा", Revati: "रेवती", Abhijit: "अभिजित",
};

const PLANET_HI: Record<string, string> = {
  Sun: "सूर्य", Moon: "चन्द्र", Mars: "मंगल", Mercury: "बुध", Jupiter: "गुरु",
  Venus: "शुक्र", Saturn: "शनि", Rahu: "राहु", Ketu: "केतु",
};

/* Canonical order. Several callers hold an INDEX (0-11 rashi, 0-26 nakshatra) rather
   than a name — before this module they each kept a private parallel array, which is
   how three spellings of "Purva Phalguni" and two of "Kumbha" got into the app. Index
   callers now resolve through here. */
const SIGN_ORDER = ["Mesha", "Vrishabha", "Mithuna", "Karka", "Simha", "Kanya",
  "Tula", "Vrishchika", "Dhanu", "Makara", "Kumbha", "Meena"] as const;

const NAKSHATRA_ORDER = ["Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
  "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
  "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha", "Mula",
  "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha",
  "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"] as const;

/* English (Western) names for the 12 sidereal rashi. These are LABELS for the sidereal
   signs — the mathematics stays Lahiri sidereal throughout. Kept here so that the
   Sanskrit name, the Devanagari and the English name can never drift apart. */
const SIGN_EN_WESTERN = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"] as const;

/* The sign table answers to the Sanskrit name AND the Western name, so a caller that
   already holds "Aries" does not need its own map. */
SIGN_EN_WESTERN.forEach((west, i) => { SIGN_HI[west] = SIGN_HI[SIGN_ORDER[i]]; });

/* Weekdays. In Hindi these are graha names with -वार, so private copies of them kept
   tripping over the graha table. Four files each had their own; they live here now. */
const WEEKDAY_EN = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;
const WEEKDAY_SHORT_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
const WEEKDAY_HI = ["रविवार", "सोमवार", "मंगलवार", "बुधवार", "गुरुवार", "शुक्रवार", "शनिवार"] as const;
const WEEKDAY_SHORT_HI = ["रवि", "सोम", "मंगल", "बुध", "गुरु", "शुक्र", "शनि"] as const;

/** Weekday name for a JS day index (0 = Sunday). */
export function weekdayName(lang: string, index: unknown, short = false): string {
  const i = Number(index);
  if (!Number.isInteger(i) || i < 0 || i > 6) return "";
  if (lang === "hi") return short ? WEEKDAY_SHORT_HI[i] : WEEKDAY_HI[i];
  return short ? WEEKDAY_SHORT_EN[i] : WEEKDAY_EN[i];
}

/* Compact rashi labels for dense grids (Ashtakavarga). Devanagari is deliberately
   THREE aksharas, not two: at two, वृषभ and वृश्चिक both collapse to वृ and the reader
   cannot tell which column they are in. वृष / वृश्चि keeps them distinct. */
const SIGN_SHORT_HI = ["मेष", "वृष", "मिथ", "कर्क", "सिंह", "कन्या",
  "तुला", "वृश्चि", "धनु", "मकर", "कुंभ", "मीन"] as const;
const SIGN_SHORT_EN = ["Ar", "Ta", "Ge", "Cn", "Le", "Vi",
  "Li", "Sc", "Sg", "Cp", "Aq", "Pi"] as const;

/** Compact rashi label for a dense table column. */
export function signShort(lang: string, index: unknown): string {
  const i = Number(index);
  if (!Number.isInteger(i) || i < 0 || i > 11) return "";
  return lang === "hi" ? SIGN_SHORT_HI[i] : SIGN_SHORT_EN[i];
}

const ORDERS = { sign: SIGN_ORDER, nakshatra: NAKSHATRA_ORDER } as const;

const TABLES = { tithi: TITHI_HI, paksha: PAKSHA_HI, month: MONTH_HI, sign: SIGN_HI, nakshatra: NAKSHATRA_HI, planet: PLANET_HI };

export type PanchangTermKind = keyof typeof TABLES;
export type PanchangIndexKind = keyof typeof ORDERS;

/**
 * Localise one engine value. `sign` also accepts the engine's display form
 * "Simha (Leo)" and keeps only the Sanskrit name in Hindi.
 */
export function panchangTerm(lang: string, kind: PanchangTermKind, value: unknown): string {
  const text = String(value ?? "").trim();
  if (!text || lang !== "hi") return text;
  const table = TABLES[kind];
  if (table[text]) return table[text];
  const bare = text.replace(/\s*\(.*\)\s*$/, "").trim();
  if (table[bare]) return table[bare];
  // Compound values such as "Ashadha (Amanta) / Shravana (Purnimanta)" or
  // "Chaturthi · Krishna Paksha": localise each recognised token in place.
  let out = text;
  for (const [en, hi] of Object.entries(table)) {
    out = out.replace(new RegExp(`\\b${en.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "g"), hi);
  }
  return out;
}

/**
 * Localise a value held as a canonical index (0-11 rashi, 0-26 nakshatra).
 * Out-of-range indices return "" rather than throwing — a missing label must never
 * take a screen down.
 */
export function panchangTermAt(lang: string, kind: PanchangIndexKind, index: unknown): string {
  const i = Number(index);
  const order = ORDERS[kind];
  if (!Number.isInteger(i) || i < 0 || i >= order.length) return "";
  return panchangTerm(lang, kind, order[i]);
}

/**
 * The display name of a rashi in the reader's language.
 * Hindi gets Devanagari; English gets the English (Western) name for the SIDEREAL
 * sign — a label change only, decided by the owner on 2026-07-28 and confirmed
 * 2026-08-05 ("plain Virgo", no Sanskrit gloss). Calculation stays Lahiri sidereal,
 * so any screen showing these names must also state that the zodiac is sidereal.
 */
export function signName(lang: string, index: unknown): string {
  const i = Number(index);
  if (!Number.isInteger(i) || i < 0 || i > 11) return "";
  return lang === "hi" ? SIGN_HI[SIGN_ORDER[i]] : SIGN_EN_WESTERN[i];
}

/** Sign name from the engine's own string ("Kanya", "Kanya (Virgo)", "Aries"). */
export function signLabel(lang: string, value: unknown): string {
  const text = String(value ?? "").trim();
  if (!text) return "";
  const bare = text.replace(/\s*\(.*\)\s*$/, "").trim();
  let i = SIGN_ORDER.indexOf(bare as typeof SIGN_ORDER[number]);
  if (i < 0) i = SIGN_EN_WESTERN.indexOf(bare as typeof SIGN_EN_WESTERN[number]);
  if (i < 0) {
    // Unrecognised: fall through rather than blanking the screen.
    return lang === "hi" ? panchangTerm("hi", "sign", text) : text;
  }
  return signName(lang, i);
}

export { TITHI_HI, PAKSHA_HI, MONTH_HI, SIGN_HI, NAKSHATRA_HI, PLANET_HI,
  SIGN_ORDER, NAKSHATRA_ORDER, SIGN_EN_WESTERN,
  WEEKDAY_EN, WEEKDAY_SHORT_EN, WEEKDAY_HI, WEEKDAY_SHORT_HI,
  SIGN_SHORT_HI, SIGN_SHORT_EN };
