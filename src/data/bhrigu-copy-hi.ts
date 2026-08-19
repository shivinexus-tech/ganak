/* Hindi copy for the BNN / Bhrigu screens (JYOTISH-HINDI-PARITY, 2026-08-18).

   Why this file exists: `src/engine/bhrigu.ts` carried the significations in
   English only, and both UI modules replaced EVERY Hindi meaning with a single
   generic sentence — one sentence 7× in the BNN snapshot and ~19× in the Bhrigu
   one, where an English reader got a distinct interpretation each time. That is
   not a translation leak, it is a Hindi reader being given a thinner product.

   Every entry here is a translation of the English Ganak already states — nothing
   is newly invented. Astrological significations carry religious weight, so a
   meaning with no English original does not get a Hindi one either; the key-parity
   assertion in validation/screen-snapshots.cjs proves the two tables stay aligned.

   It lives in src/data (not src/engine) because that is where the Hindi copy gates
   look — validation/hindi-devotional-language.cjs scans src/data, src/screens and
   src/components, and copy that no gate reads is copy that drifts. */

/* Traditional karakatwa of each graha — the Hindi twin of BNN_KARAKA.
   The screens print the first comma-separated term as a compact tag, so the
   leading term must be the headline signification in both languages. */
const BNN_KARAKA_HI: Record<string, string> = {
  Sun: "आत्मा, पिता, अधिकार",
  Moon: "मन, माता, भावनाएँ",
  Mars: "ऊर्जा, साहस, भाई-बहन, भूमि",
  Mercury: "बुद्धि, शिक्षा, व्यापार, वाणी",
  Jupiter: "जीव / स्वयं, ज्ञान, संतान, भाग्य",
  Venus: "जीवनसाथी, सुख-सुविधा, वाहन, कला",
  Saturn: "कर्म, आजीविका, अनुशासन, आयु",
  Rahu: "विदेश, अपरंपरागत, आसक्ति",
  Ketu: "अध्यात्म, वियोग, मोक्ष",
};

/* The 36 pairwise combination themes — the Hindi twin of BNN_MEANING.
   Keys are the same alphabetically-sorted planet pairs the engine uses. */
const BNN_MEANING_HI: Record<string, string> = {
  "Jupiter|Ketu": "ज्ञान का अंतर्मुख होना — वैराग्य, मोक्ष, सांसारिक भाग्य से अधिक आध्यात्मिक गहराई",
  "Jupiter|Mars": "सिद्धांतयुक्त पराक्रम — धर्मयुक्त कर्म, दृढ़ निश्चय, नीति से संचालित ऊर्जा",
  "Jupiter|Mercury": "ज्ञान और बुद्धि — अध्यापन, परामर्श, वाणी में उतरी विद्वत्ता",
  "Jupiter|Moon": "विस्तृत मन — भावनात्मक परिपक्वता और संतोष (गजकेसरी का भाव)",
  "Jupiter|Rahu": "अपरंपरागत आस्था — विदेशी या लीक से हटकर ज्ञान, अर्थ की तीव्र भूख",
  "Jupiter|Saturn": "स्वतंत्र इच्छा और नियति का मिलन — धैर्यपूर्ण विकास, अनुशासन और समय से तपी नीति",
  "Jupiter|Sun": "ज्ञान और आत्मा — धर्म, सिद्धांतयुक्त अधिकार, मार्गदर्शक उद्देश्य",
  "Jupiter|Venus": "ज्ञान और भोग — परिष्कृत मूल्य, गुरु और सुख के बीच का खिंचाव",
  "Ketu|Mars": "तीक्ष्ण, वियोगकारी शक्ति — केंद्रित ऊर्जा, आध्यात्मिक योद्धा",
  "Ketu|Mercury": "अंतर्ज्ञानी, अ-रैखिक बुद्धि — निर्लिप्त या गूढ़ अभिव्यक्ति",
  "Ketu|Moon": "निर्लिप्त मन — भावनाओं का अंतर्मुख होना, आध्यात्मिक संवेदनशीलता",
  "Ketu|Rahu": "कर्म-अक्ष — भूत और भविष्य का विपरीत खिंचाव, वियोग और लालसा",
  "Ketu|Saturn": "कर्म से विरक्ति — अनुशासन का तप में बदलना, संन्यास",
  "Ketu|Sun": "निर्लिप्त अधिकार — अंतर्मुख या दूर रहा पिता, मुक्ति खोजती आत्मा",
  "Ketu|Venus": "निर्लिप्त प्रेम — आध्यात्मिक सौंदर्यबोध, संबंधों में दूरी",
  "Mars|Mercury": "तीक्ष्ण बुद्धि — तकनीकी या तर्क-कौशल, तेज़ और पैना मन",
  "Mars|Moon": "आवेगपूर्ण मन — भावनात्मक वेग, साहस, बेचैनी",
  "Mars|Rahu": "प्रबल हुआ वेग — अपरंपरागत या तकनीकी बल, विदेश से जुड़े उपक्रम",
  "Mars|Saturn": "अनुशासित या अवरुद्ध ऊर्जा — कठिन परिश्रम, सहनशीलता, अध्यवसाय",
  "Mars|Sun": "संकल्पयुक्त ऊर्जा — नेतृत्व, दृढ़ता, अधिकार का वेग",
  "Mars|Venus": "आवेग और संबंध — प्रेम में उत्साह, सृजनात्मक और दैहिक ऊर्जा",
  "Mercury|Moon": "विचारशील मन — संवाद, अनुकूलनशीलता, सीखना और आदान-प्रदान",
  "Mercury|Rahu": "चतुर, अपरंपरागत बुद्धि — विदेशी व्यापार, तकनीक, आविष्कारशीलता",
  "Mercury|Saturn": "संरचित मन — क्रमबद्ध कार्य, धीमी किन्तु पक्की निपुणता, अनुशासित कौशल",
  "Mercury|Sun": "बुद्धि और अधिकार — शिक्षा, वाक्पटु नेतृत्व (बुध-आदित्य का भाव)",
  "Mercury|Venus": "परिष्कृत बुद्धि — कला और वाणिज्य, मधुर और प्रभावशाली वाणी",
  "Moon|Rahu": "अस्थिर मन — प्रबल कल्पना, अपरिचित या विदेशी भाव, बेचैनी",
  "Moon|Saturn": "भारी मन — भावनात्मक अनुशासन, कठिनाई से अर्जित परिपक्वता",
  "Moon|Sun": "मन और आत्मा — भीतरी और बाहरी स्वयं, माता-पिता का युग्म",
  "Moon|Venus": "भाव और सौंदर्य — भावनात्मक ऊष्मा, सुख, संबंधों की मिठास",
  "Rahu|Saturn": "अपरंपरागत कर्म — विदेशी या व्यवस्थागत कार्य, संरचनात्मक महत्वाकांक्षा और संघर्ष",
  "Rahu|Sun": "प्रबल हुआ अधिकार — अहं और महत्वाकांक्षा, विदेशी या अपरंपरागत प्रतिष्ठा",
  "Rahu|Venus": "अपरंपरागत कामना — विदेशी या भिन्न-संस्कृति के संबंध, चकाचौंध, भौतिक आकर्षण",
  "Saturn|Sun": "अधिकार और कर्म — कर्तव्य, कठोर पिता या शासन, स्वयं पर अनुशासन",
  "Saturn|Venus": "प्रेम में कर्तव्य — संबंधों में धैर्य या विलंब, उत्तरदायित्व से गढ़े मूल्य",
  "Sun|Venus": "अधिकार और परिष्कार — स्वयं की सृजनात्मक या सांबंधिक अभिव्यक्ति",
};

/* Used when a pair has no documented theme — the Hindi twin of the English
   "the blended significations of the two karakas". */
const BNN_MEANING_FALLBACK_HI = "दोनों कारकों के कारकत्वों का मिश्रित फल";

/* The twelve house significations used by Bhrigu Chakra and Bhrigu Saral —
   the Hindi twin of BCP_HOUSE_THEME. */
const BCP_HOUSE_THEME_HI: Record<number, string> = {
  1: "स्वयं, शरीर, जीवन-शक्ति, नए आरंभ",
  2: "धन, कुटुंब, वाणी, भोजन",
  3: "साहस, भाई-बहन, परिश्रम, संवाद",
  4: "घर, माता, सुख, संपत्ति, प्रारंभिक शिक्षा",
  5: "संतान, बुद्धि, प्रणय, सृजनशीलता",
  6: "बाधा, ऋण, रोग, सेवा, प्रतिद्वंद्वी",
  7: "विवाह, साझेदारी, व्यापार, अन्य जन",
  8: "उथल-पुथल, रूपांतरण, उत्तराधिकार, गुप्त बातें",
  9: "भाग्य, धर्म, पिता, गुरु, यात्रा",
  10: "आजीविका, प्रतिष्ठा, कर्म, अधिकार",
  11: "लाभ, आय, संबंध-जाल, इच्छाओं की पूर्ति",
  12: "हानि, व्यय, विदेश, एकांत, अध्यात्म",
};

/* Combination-axis labels. The engine names an axis in English ("5th · trine");
   these are the Hindi forms, and they deliberately match the Sanskrit ordinal
   series the BNN relation grid already prints (द्वितीय / पंचम / नवम / एकादश). */
const BNN_RELATION_HI: Record<string, string> = {
  conjunct: "युति",
  "2nd · future": "द्वितीय · भविष्य",
  "2nd · ahead": "द्वितीय · आगे",
  "12th · past": "द्वादश · अतीत",
  "12th · behind": "द्वादश · पीछे",
  "7th · opposition": "सप्तम · विरोध",
  "5th · trine": "पंचम · त्रिकोण",
  "9th · trine": "नवम · त्रिकोण",
  "3rd": "तृतीय",
  "11th": "एकादश",
  "hidden — not in combination": "गुप्त — किसी संबंध में नहीं",
  trine: "त्रिकोण",
  opposition: "विरोध",
  active: "सक्रिय",
};

/* The four directional groups of the BNN chart. */
const BNN_DIRECTION_HI: Record<string, string> = {
  East: "पूर्व",
  South: "दक्षिण",
  West: "पश्चिम",
  North: "उत्तर",
};

/* House / counted-position ordinals for the Bhrigu screens.
   Hindi does not form ordinals by suffixing a digit: "1वाँ" is not a word anyone
   writes, and the colloquial series (पहला, दूसरा, तीसरा) is not the register used
   for a भाव. Jyotish Hindi — and the BNN relation grid ten lines away on the same
   screen — names houses with the Sanskrit ordinals, so those are used here and the
   two panels now read alike. */
const HOUSE_ORDINAL_HI = ["प्रथम", "द्वितीय", "तृतीय", "चतुर्थ", "पंचम", "षष्ठ",
  "सप्तम", "अष्टम", "नवम", "दशम", "एकादश", "द्वादश"];

function houseOrdinalHi(n: number): string {
  return HOUSE_ORDINAL_HI[n - 1] || String(n);
}

function bnnMeaningHi(a: string, b: string): string {
  return BNN_MEANING_HI[[a, b].sort().join("|")] || BNN_MEANING_FALLBACK_HI;
}

function bnnRelationHi(relation: string): string {
  return BNN_RELATION_HI[relation] || relation;
}

export {
  BNN_KARAKA_HI,
  BNN_MEANING_HI,
  BNN_MEANING_FALLBACK_HI,
  BCP_HOUSE_THEME_HI,
  BNN_RELATION_HI,
  BNN_DIRECTION_HI,
  HOUSE_ORDINAL_HI,
  houseOrdinalHi,
  bnnMeaningHi,
  bnnRelationHi,
};
