/* Hindi copy for the classical yogas panel (YOGAS-HINDI-PARITY, 2026-08-18).

   Why this file exists: `detectYogas` in src/engine/classical.ts composed every
   yoga's interpretation as an English sentence — often with a graha or a house
   number spliced into it — and `ChartScreen.tsx` replaced ALL of them with one
   generic Hindi sentence:

     "यह योग ग्रहों और भावों के एक विशेष संबंध से बनता है। इसका फल ग्रहबल, दशा और
      पूरी कुंडली के संदर्भ में देखें।"

   Measured before the fix: 79 distinct English interpretations are reachable from
   the engine, against exactly 1 in Hindi. Nothing leaked and no gate was red — a
   Hindi reader was simply handed a thinner product than an English reader.

   Every entry here is a TRANSLATION of the English Ganak already states in
   YOGA_EN (src/engine/classical.ts). Yoga significations carry religious weight,
   so nothing is invented to fill a hole: the two catalogues are keyed identically
   and validation/screen-snapshots.cjs § 5 fails the moment one carries a meaning
   the other does not.

   It lives in src/data (not src/engine) for the same reason bhrigu-copy-hi.ts
   does: validation/hindi-devotional-language.cjs scans src/data, src/screens and
   src/components — copy that no gate reads is copy that drifts.

   Graha names are NEVER written in Devanagari here. They come from
   src/i18n/panchang-terms.ts, the single shared vocabulary, so a yoga sentence can
   never spell a graha differently from the chart table two panels away. */

import { planetName } from "../i18n/panchang-terms";
import { houseOrdinalHi } from "./bhrigu-copy-hi";

/* The shared graha vocabulary, never a second spelling. */
const P = (name: string): string => planetName("hi", name);

/* The five Pancha Mahapurusha yogas. These are proper yoga names, transliterated —
   the same word in both scripts, exactly as SIGN_HI transliterates a rashi. */
const MAHAPURUSHA_TITLE_HI: Record<string, string> = {
  Ruchaka: "रुचक", Bhadra: "भद्र", Hamsa: "हंस", Malavya: "मालव्य", Sasa: "शश",
};

/* The three Vipareeta Raja yogas, named for the dusthana whose lord makes them. */
const VIPAREETA_TITLE_HI: Record<string, string> = {
  Harsha: "हर्ष", Sarala: "सरल", Vimala: "विमल",
};

export type YogaParams = {
  planet?: string;
  planetB?: string;
  title?: string;
  house?: number;
};

export type YogaCopy = {
  name: (p: YogaParams) => string;
  text: (p: YogaParams) => string;
};

/* Keyed identically to YOGA_EN in src/engine/classical.ts. */
const YOGA_HI: Record<string, YogaCopy> = {
  gajaKesari: {
    name: () => "गजकेसरी",
    text: () => `${P("Moon")} से केंद्र में ${P("Jupiter")} — प्रतिष्ठा, ज्ञान और टिकाऊ यश।`,
  },
  budhaditya: {
    name: () => `${P("Mercury")}-आदित्य`,
    text: () => `${P("Sun")} और ${P("Mercury")} एक साथ — तीक्ष्ण बुद्धि और प्रशासनिक कौशल।`,
  },
  chandraMangala: {
    name: () => `${P("Moon")}-${P("Mars")}`,
    text: () => `${P("Moon")} के साथ ${P("Mars")} — अर्जन-क्षमता, वेग और साधन जुटाने की कुशलता।`,
  },
  mahapurusha: {
    name: (p) => `${MAHAPURUSHA_TITLE_HI[p.title as string] || p.title} महापुरुष`,
    text: (p) => `${P(p.planet as string)} अपनी ही राशि या उच्च राशि में, केंद्र में — पंच महापुरुष लक्षणों में से एक।`,
  },
  neechaBhanga: {
    name: (p) => `नीचभंग · ${P(p.planet as string)}`,
    text: (p) => `नीच ${P(p.planet as string)} का नीचत्व भंग — आरंभिक संघर्ष असाधारण बल में बदल जाता है।`,
  },
  debilitated: {
    name: (p) => `${P(p.planet as string)} नीच`,
    text: (p) => `${P(p.planet as string)} अपनी नीच राशि में बैठा है — इसके कारकत्वों को सचेत प्रयास से साधना होगा।`,
  },
  vipareeta: {
    name: (p) => `${VIPAREETA_TITLE_HI[p.title as string] || p.title} विपरीत राजयोग`,
    text: (p) => `${houseOrdinalHi(p.house as number)} भाव का स्वामी दुःस्थान में — प्रतिकूलता में से उठता लाभ।`,
  },
  yogakaraka: {
    name: (p) => `योगकारक ${P(p.planet as string)}`,
    text: (p) => `${P(p.planet as string)} केंद्र और त्रिकोण, दोनों का स्वामी — अकेला ग्रह जो पद दिला सके।`,
  },
  rajaYoga: {
    name: () => "राजयोग",
    text: (p) => `केंद्रेश ${P(p.planet as string)} की त्रिकोणेश ${P(p.planetB as string)} से युति — सत्ता और भाग्य का मेल।`,
  },
  dhanaYoga: {
    name: () => "धन योग",
    text: () => `धन (${houseOrdinalHi(2)}) और लाभ (${houseOrdinalHi(11)}) भावों के स्वामी एक साथ आते हैं।`,
  },
  parivartana: {
    name: (p) => `परिवर्तन · ${P(p.planet as string)} ⇄ ${P(p.planetB as string)}`,
    text: (p) => `${P(p.planet as string)} और ${P(p.planetB as string)} की राशि-अदला-बदली — दोनों के भाव एक-दूसरे को बल देते हैं।`,
  },
  adhi: {
    name: () => "अधि योग",
    text: () => `${P("Moon")} से ${houseOrdinalHi(6)}, ${houseOrdinalHi(7)} या ${houseOrdinalHi(8)} भाव में शुभ ग्रह — नेतृत्व, सुख और भरोसेमंद सहयोगी।`,
  },
  durudhara: {
    name: () => "दुरुधरा",
    text: () => `${P("Moon")} के दोनों ओर ग्रह — सहारा पाया हुआ, साधन-सम्पन्न मन।`,
  },
  sunapha: {
    name: () => "सुनफा",
    text: () => `${P("Moon")} से ${houseOrdinalHi(2)} भाव में एक ग्रह — स्वयं अर्जित प्रतिष्ठा और साधन।`,
  },
  anapha: {
    name: () => "अनफा",
    text: () => `${P("Moon")} से ${houseOrdinalHi(12)} भाव में एक ग्रह — परिष्कृत, संयत स्वभाव।`,
  },
  kemadruma: {
    name: () => "केमद्रुम",
    text: () => `${P("Moon")} के साथ कोई ग्रह नहीं — भावनात्मक आत्मनिर्भरता ही जीवन का पाठ बन जाती है; बलवान केंद्र इसे भंग कर सकते हैं।`,
  },
  ubhayachari: {
    name: () => "उभयचरी",
    text: () => `${P("Sun")} के दोनों ओर ग्रह — संतुलित और व्यापक रूप से प्रिय व्यक्तित्व।`,
  },
  vesi: {
    name: () => "वेशि",
    text: () => `${P("Sun")} से ${houseOrdinalHi(2)} भाव में एक ग्रह — सत्यनिष्ठ, स्थिर स्वभाव।`,
  },
  vasi: {
    name: () => "वासि",
    text: () => `${P("Sun")} से ${houseOrdinalHi(12)} भाव में एक ग्रह — कुशल और दानशील प्रवृत्ति।`,
  },
  amala: {
    name: () => "अमल",
    text: () => `${houseOrdinalHi(10)} भाव में नैसर्गिक शुभ ग्रह — निष्कलंक बनी रहने वाली प्रतिष्ठा।`,
  },
  saraswati: {
    name: () => "सरस्वती",
    text: () => `${P("Jupiter")}, ${P("Venus")} और ${P("Mercury")} — तीनों उत्तम स्थानों में — विद्या, वाक्पटुता और कला।`,
  },
  kalaSarpa: {
    name: () => "काल सर्प",
    text: () => `सातों ग्रह ${P("Rahu")}–${P("Ketu")} अक्ष के भीतर घिरे — नियति से बँधा तीव्र जीवन-क्रम, नाटकीय उत्थान के साथ।`,
  },
  guruChandala: {
    name: () => `${P("Jupiter")} चांडाल`,
    text: () => `${P("Jupiter")} की ${P("Rahu")} या ${P("Ketu")} से युति — अपरंपरागत मान्यताएँ; ज्ञान को भरोसा करने से पहले परखना होगा।`,
  },
  angarak: {
    name: () => "अंगारक",
    text: () => `${P("Mars")} की ${P("Rahu")} या ${P("Ketu")} से युति — विस्फोटक ऊर्जा, जिसे अनुशासित मार्ग चाहिए।`,
  },
  grahan: {
    name: () => "ग्रहण",
    text: () => `${P("Sun")} या ${P("Moon")} की ${P("Rahu")} या ${P("Ketu")} से युति — ग्रहण-जनित मन या ओज की संवेदनशीलता।`,
  },
};

export { YOGA_HI, MAHAPURUSHA_TITLE_HI, VIPAREETA_TITLE_HI };
