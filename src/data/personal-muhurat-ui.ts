import { SIGN_ORDER, signName } from "../i18n/panchang-terms";
/* Copy + labels for the birth-chart-personalised Muhurat screen (/muhurat/personal).
   Bilingual (EN/HI). See docs/superpowers/specs/2026-07-25-personal-muhurat-design.md.

   Honesty rules baked in:
   - Personalisation is opt-in; the finder result is unchanged until birth details are given.
   - The Adhanadi special-nakshatra caution is labelled "a personal tradition, not a
     classical muhurta rule" — it marks a day, it never removes one.
   - No outcome is guaranteed; birth details are never stored (project no-storage ban).

   Written untyped to match the sibling data modules and keep parse-check's orphan
   linter clean. Every export is a { en, hi } pair, a list of them, or a small helper. */

export const PM_TITLE = {
  en: "Personalised Muhurat",
  hi: "वैयक्तिक मुहूर्त",
};

export const PM_INTRO = {
  en:
    "Find auspicious days for your chosen activity, then personalise them with your birth " +
    "star. This keeps only the days that also suit your Janma Nakshatra and Janma Rashi, " +
    "and ranks them by strength. Personalisation is optional — without birth details you " +
    "get the ordinary finder.",
  hi:
    "अपने चुने कार्य के लिए शुभ दिन खोजें, फिर उन्हें अपने जन्म-नक्षत्र से वैयक्तिक बनाएँ। यह केवल " +
    "वे दिन रखता है जो आपके जन्म नक्षत्र और जन्म राशि के भी अनुकूल हों, और उन्हें बल के अनुसार क्रम " +
    "देता है। वैयक्तिकरण वैकल्पिक है — जन्म-विवरण के बिना सामान्य खोजक ही मिलता है।",
};

/* Opt-in natal section. */
export const PM_NATAL_SECTION = {
  en: "Personalise with your birth star (optional)",
  hi: "अपने जन्म-नक्षत्र से वैयक्तिक करें (वैकल्पिक)",
};

export const PM_NATAL_HINT = {
  en:
    "Optional. Add your birth date, time and place to keep only the days that suit your " +
    "birth star (Tarabala) and birth Moon-sign (Chandrabala), ranked by Ashtakavarga " +
    "strength. Your birth details are used only for this calculation and are never stored.",
  hi:
    "वैकल्पिक। अपनी जन्म तिथि, समय और स्थान जोड़ें ताकि केवल वे दिन रखे जाएँ जो आपके जन्म-नक्षत्र " +
    "(तारा बल) और जन्म चन्द्र-राशि (चन्द्र बल) के अनुकूल हों, अष्टकवर्ग बल से क्रमित। आपके जन्म-विवरण " +
    "केवल इसी गणना के लिए उपयोग होते हैं और कभी संग्रहीत नहीं किए जाते।",
};

/* Shown when a birth date is entered but the birth city has not been picked. */
export const PM_NATAL_UNCONFIRMED = {
  en: "Pick your birth city from the suggestions to personalise.",
  hi: "वैयक्तिक करने के लिए सुझावों में से अपना जन्म-शहर चुनें।",
};

export const PM_BIRTH_LABELS = {
  date: { en: "Birth date", hi: "जन्म तिथि" },
  time: { en: "Birth time", hi: "जन्म समय" },
  place: { en: "Birth place", hi: "जन्म स्थान" },
  activity: { en: "Activity", hi: "कार्य" },
  from: { en: "From", hi: "आरंभ तिथि" },
  to: { en: "To", hi: "अंतिम तिथि" },
  place2: { en: "Place", hi: "स्थान" },
};

/* Count line — a function so the numbers are inlined, not string-glued in the screen. */
export function PM_COUNT(kept: number, total: number) {
  const aside = total - kept;
  return {
    en: `${kept} of ${total} days suit your birth star · ${aside} set aside · tap to view`,
    hi: `${total} में से ${kept} दिन आपके जन्म-नक्षत्र के अनुकूल · ${aside} टाले गए · देखने हेतु टैप करें`,
  };
}

/* Per-day fit badge fragments. */
export const PM_BADGE = {
  taraGood: { en: "Birth star: supportive", hi: "जन्म नक्षत्र: अनुकूल" },
  taraBad: { en: "Birth star: better avoided", hi: "जन्म नक्षत्र: टालना बेहतर" },
  chandraGood: { en: "Moon-sign: supportive", hi: "चन्द्र राशि: अनुकूल" },
  chandraBad: { en: "Moon-sign: weak", hi: "चन्द्र राशि: कमज़ोर" },
  strength: { en: "Strength", hi: "बल" },
  available: { en: "Suits you", hi: "आपके अनुकूल" },
  setAside: { en: "Set aside", hi: "टाला गया" },
};

/* Why a day was set aside (hard filters only). */
export const PM_SET_ASIDE_REASON = {
  tara: { en: "Your birth star is weak on this day (Tarabala).", hi: "इस दिन आपका जन्म-नक्षत्र कमज़ोर है (तारा बल)।" },
  chandra: { en: "The Moon-sign is unfavourable from your birth sign (Chandrabala).", hi: "आपकी जन्म राशि से चन्द्र राशि प्रतिकूल है (चन्द्र बल)।" },
};

/* The six Adhanadi special-nakshatra names, keyed by the engine's SPECIAL_ORD key. */
export const PM_SPECIAL_NAMES = [
  { key: "janma", ord: 1, en: "Janma", hi: "जन्म" },
  { key: "karma", ord: 10, en: "Karma", hi: "कर्म" },
  { key: "sanghatika", ord: 16, en: "Sanghatika", hi: "संघातिक" },
  { key: "samudayika", ord: 18, en: "Samudayika", hi: "समुदायिक" },
  { key: "vainasika", ord: 22, en: "Vainasika", hi: "वैनाशिक" },
  { key: "manasa", ord: 25, en: "Manasa", hi: "मानस" },
];

/* The honest, labelled caution shown on a kept day that falls on a special nakshatra. */
export const PM_SPECIAL_CAUTION_NOTE = {
  en:
    "This is a personal tradition, not a classical muhurta rule — some families set this " +
    "nakshatra aside as a personal caution. The day is still offered.",
  hi:
    "यह एक वैयक्तिक परम्परा है, कोई शास्त्रीय मुहूर्त-नियम नहीं — कुछ परिवार इस नक्षत्र को वैयक्तिक " +
    "सावधानी के रूप में टालते हैं। दिन फिर भी प्रस्तुत है।",
};

export function PM_SPECIAL_CHIP(name: { en: string; hi: string }, ord: number) {
  return {
    en: `${ord}th from your birth star — ${name.en}`,
    hi: `जन्म-नक्षत्र से ${ord}वाँ — ${name.hi}`,
  };
}

/* Annotate-mode note (too few days survived the hard cut). */
export const PM_ANNOTATE_NOTE = {
  en: "Few days suit your birth star in this range — showing all of them, marked, so you are not left without options. Try a wider range for a cleaner match.",
  hi: "इस अवधि में कुछ ही दिन आपके जन्म-नक्षत्र के अनुकूल हैं — सभी को अंकित करके दिखाया गया है ताकि आप विकल्पहीन न रहें। बेहतर मेल के लिए बड़ी अवधि आज़माएँ।",
};

/* Honest closing note. */
export const PM_RESULT_NOTE = {
  en: "A traditional personal-timing guide, not a guarantee of outcome. The general finder's own tithi, nakshatra and clean-window checks still apply to every day shown.",
  hi: "एक परंपरागत वैयक्तिक समय-मार्गदर्शन, किसी परिणाम की गारंटी नहीं। दिखाए गए हर दिन पर सामान्य खोजक की तिथि, नक्षत्र और शुद्ध-समय जाँच यथावत लागू है।",
};

export const PM_NO_BIRTH_PROMPT = {
  en: "Add your birth date, time and place above to personalise these days to your chart.",
  hi: "इन दिनों को अपनी कुण्डली के अनुसार वैयक्तिक करने हेतु ऊपर अपनी जन्म तिथि, समय और स्थान जोड़ें।",
};

export const PM_NONE = {
  en: "No auspicious days for this activity fall in the chosen range. Try a wider range.",
  hi: "चुनी अवधि में इस कार्य के लिए कोई शुभ दिन नहीं मिला। बड़ी अवधि आज़माएँ।",
};

export const PM_NO_SOLAR = {
  en: "No days could be calculated for this place and range (no local sunrise/sunset — a high-latitude limitation).",
  hi: "इस स्थान और अवधि के लिए दिन नहीं निकाले जा सके (स्थानीय सूर्योदय/सूर्यास्त नहीं — उच्च अक्षांश सीमा)।",
};

export const PM_YOUR_STAR = {
  en: "Your birth star / Moon-sign",
  hi: "आपका जन्म नक्षत्र / चन्द्र राशि",
};

/* Rashi (Moon sign) names, index 0..11 (Aries → Pisces). */
export const PM_RASHIS = SIGN_ORDER.map((_, i) => ({ en: signName("en", i), hi: signName("hi", i) }));

/* Nakshatra Devanagari, keyed by English name (matches the finder's nakName). */
