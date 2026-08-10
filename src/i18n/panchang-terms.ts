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

const TABLES = { tithi: TITHI_HI, paksha: PAKSHA_HI, month: MONTH_HI, sign: SIGN_HI, nakshatra: NAKSHATRA_HI, planet: PLANET_HI };

export type PanchangTermKind = keyof typeof TABLES;

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

export { TITHI_HI, PAKSHA_HI, MONTH_HI, SIGN_HI, NAKSHATRA_HI, PLANET_HI };
