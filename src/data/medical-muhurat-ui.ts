/* Copy + labels for the elective / clinician-approved-procedure ("medical")
   Muhurat screen. Bilingual (EN/HI). See plans/claude-medical-muhurat-findings.md.

   Hard rule: nothing here may predict, score, rank, guarantee, or claim to improve
   a medical outcome. The safety wall renders BEFORE any astrological result and the
   confirmation checkbox gates the finder.

   Every export is a { en, hi } bilingual pair (or a map of them). Written untyped to
   match the sibling data modules and keep the parse-check orphan linter clean. */

/* Shown first, before any input or result. The four required statements from the
   brief: never delay urgent care; the clinician/hospital decide; Ganak predicts no
   outcome; use only when the team says the timing is genuinely flexible. */
export const MEDICAL_SAFETY = {
  en:
    "Read this first — this is not medical advice. Never delay urgent or emergency " +
    "care for a muhurat. Your doctor and hospital decide what is medically safe and " +
    "when. Ganak does not predict the success, complications, recovery, or survival " +
    "of any procedure. Use this only to note a preferred time when your medical team " +
    "has clearly said the timing is flexible.",
  hi:
    "पहले यह पढ़ें — यह चिकित्सा सलाह नहीं है। किसी भी मुहूर्त के लिए आपातकालीन या तत्काल " +
    "उपचार में देरी कभी न करें। क्या और कब चिकित्सकीय रूप से सुरक्षित है, यह आपके डॉक्टर और " +
    "अस्पताल तय करते हैं। गणक किसी प्रक्रिया की सफलता, जटिलता, स्वस्थ होने या जीवन-रक्षा का " +
    "पूर्वानुमान नहीं करता। इसका उपयोग केवल तब करें जब आपकी चिकित्सा टीम ने स्पष्ट रूप से कहा " +
    "हो कि समय लचीला है।",
};

/* One-line framing of what the tool is (and is not). */
export const MEDICAL_INTRO = {
  en:
    "A cultural timing preference only, for a planned procedure your care team has " +
    "already approved. It simply avoids the full-moon and new-moon days and suggests " +
    "the neutral Abhijit Muhurta on the remaining days.",
  hi:
    "यह केवल एक सांस्कृतिक समय-वरीयता है, उस नियोजित प्रक्रिया के लिए जिसे आपकी चिकित्सा टीम " +
    "पहले ही स्वीकृत कर चुकी है। यह पूर्णिमा व अमावस्या के दिनों से बचती है और शेष दिनों में " +
    "तटस्थ अभिजित मुहूर्त सुझाती है।",
};

/* Required checkbox — the finder does not run until this is ticked. */
export const MEDICAL_CONFIRM = {
  en: "My medical team has told me the timing for this planned procedure is flexible.",
  hi: "मेरी चिकित्सा टीम ने मुझे बताया है कि इस नियोजित प्रक्रिया का समय लचीला है।",
};

/* Collapsible, honest read-only note. Explains the classical krura-karma doctrine —
   why a returned day might look "red" elsewhere in Ganak — WITHOUT prescribing an
   ominous date. Deliberately makes no recommendation and no outcome claim. */
export const MEDICAL_TRADITION_NOTE = {
  en:
    "How tradition views surgical timing: classical texts treat surgery as a " +
    "'sharp' act (krura karma), for which they consider the sharp nakshatras " +
    "(Ardra, Jyeshtha, Ashlesha, Mula) and the Rikta tithis (4th, 9th, 14th) " +
    "suitable — the reverse of a wedding or housewarming. That is why a day this " +
    "screen leaves available may be marked inauspicious on Ganak's general muhurat " +
    "finder. Ganak does not prescribe a surgical time on those factors; it only " +
    "avoids the full and new moon. Follow your care team's schedule.",
  hi:
    "परंपरा शल्य-समय को कैसे देखती है: शास्त्र शल्यक्रिया को एक 'तीक्ष्ण' कर्म (क्रूर कर्म) " +
    "मानते हैं, जिसके लिए वे तीक्ष्ण नक्षत्रों (आर्द्रा, ज्येष्ठा, आश्लेषा, मूल) और रिक्ता " +
    "तिथियों (चतुर्थी, नवमी, चतुर्दशी) को उपयुक्त मानते हैं — विवाह या गृहप्रवेश के ठीक विपरीत। " +
    "इसीलिए जिस दिन को यह स्क्रीन उपलब्ध छोड़ती है, वह गणक के सामान्य मुहूर्त-खोजक पर अशुभ अंकित " +
    "हो सकता है। गणक इन कारकों पर कोई शल्य-समय निर्धारित नहीं करता; यह केवल पूर्णिमा व अमावस्या " +
    "से बचता है। अपनी चिकित्सा टीम के कार्यक्रम का पालन करें।",
};

/* Why a specific day is set aside — keyed by exclusion reason. */
export const MEDICAL_EXCLUSION = {
  purnima: {
    en: "Full moon (Purnima) — traditionally avoided for procedures.",
    hi: "पूर्णिमा — प्रक्रियाओं के लिए परंपरागत रूप से टाली जाती है।",
  },
  amavasya: {
    en: "New moon (Amavasya) — traditionally avoided for procedures.",
    hi: "अमावस्या — प्रक्रियाओं के लिए परंपरागत रूप से टाली जाती है।",
  },
};

/* Field/window labels. */
export const MEDICAL_LABELS = {
  abhijit: { en: "Abhijit Muhurta (a neutral, widely-auspicious midday window)", hi: "अभिजित मुहूर्त (एक तटस्थ, सर्वशुभ मध्याह्न काल)" },
  rahu: { en: "Rahu Kaal — a period customarily avoided", hi: "राहु काल — परंपरागत रूप से टाला जाने वाला समय" },
  available: { en: "Available", hi: "उपलब्ध" },
  setAside: { en: "Set aside", hi: "टाला गया" },
  noAbhijitWed: { en: "No Abhijit today (void on Wednesday); pick a time with your team.", hi: "आज अभिजित नहीं (बुधवार को शून्य); अपनी टीम के साथ समय चुनें।" },
};

/* Result framings. */
export const MEDICAL_RESULT_NOTE = {
  en: "A cultural timing preference only. Confirm any date with your treating team — they have the final say.",
  hi: "केवल एक सांस्कृतिक समय-वरीयता। कोई भी तिथि अपनी चिकित्सा टीम से पुष्टि करें — अंतिम निर्णय उन्हीं का है।",
};

export const MEDICAL_NO_WINDOW = {
  en: "No traditionally preferred day falls in this range — most likely a full or new moon spans it. This never means 'do not have the procedure.' Follow your medical team's schedule.",
  hi: "इस अवधि में कोई परंपरागत रूप से पसंदीदा दिन नहीं मिला — संभवतः पूर्णिमा या अमावस्या इसमें आ रही है। इसका अर्थ कभी यह नहीं कि 'प्रक्रिया न कराएँ।' अपनी चिकित्सा टीम के कार्यक्रम का पालन करें।",
};

/* Shown near any symptom/urgency wording — a plain redirect to real care. */
export const MEDICAL_REFUSAL = {
  en: "If this is an emergency, or your symptoms are new, severe, or getting worse, contact your doctor or emergency services now — do not wait for a muhurat. Ganak cannot choose a time for urgent care.",
  hi: "यदि यह आपात स्थिति है, या आपके लक्षण नए, गंभीर या बढ़ते हुए हैं, तो अभी अपने डॉक्टर या आपातकालीन सेवा से संपर्क करें — मुहूर्त की प्रतीक्षा न करें। गणक तत्काल उपचार के लिए समय नहीं चुन सकता।",
};

export const MEDICAL_TITLE = {
  en: "Timing for a planned procedure",
  hi: "नियोजित प्रक्रिया का समय",
};

/* R10 (optional): natal Janma Rashi personalisation. Opt-in, clearly separate, never
   silently mixed into the general finder. Birth details are used only for this
   calculation and are never stored (no browser storage anywhere in the app). */
export const MEDICAL_NATAL_SECTION = {
  en: "Personalise (optional)",
  hi: "वैयक्तिकरण (वैकल्पिक)",
};

export const MEDICAL_NATAL_HINT = {
  en:
    "Optional. Add your birth date, time and place to also set aside days when the Moon " +
    "returns to your birth sign (Janma Rashi) — a traditional personal caution. Your " +
    "birth details are used only for this calculation and are never stored.",
  hi:
    "वैकल्पिक। अपनी जन्म तिथि, समय और स्थान जोड़ें ताकि उन दिनों को भी टाला जा सके जब चन्द्र " +
    "आपकी जन्म राशि (जन्म राशि) में लौटता है — एक परंपरागत वैयक्तिक सावधानी। आपके जन्म-विवरण " +
    "केवल इसी गणना के लिए उपयोग होते हैं और कभी संग्रहीत नहीं किए जाते।",
};

export const MEDICAL_JANMA = {
  en: "Moon in your birth sign (Janma Rashi) — traditionally set aside.",
  hi: "चन्द्र आपकी जन्म राशि में — परंपरागत रूप से टाला गया।",
};

export const MEDICAL_BIRTHSIGN = {
  en: "Your birth Moon sign",
  hi: "आपकी जन्म चन्द्र राशि",
};

/* Rashi (Moon sign) names, index 0..11 (Aries → Pisces). */
export const MEDICAL_RASHIS = [
  { en: "Aries", hi: "मेष" }, { en: "Taurus", hi: "वृषभ" }, { en: "Gemini", hi: "मिथुन" },
  { en: "Cancer", hi: "कर्क" }, { en: "Leo", hi: "सिंह" }, { en: "Virgo", hi: "कन्या" },
  { en: "Libra", hi: "तुला" }, { en: "Scorpio", hi: "वृश्चिक" }, { en: "Sagittarius", hi: "धनु" },
  { en: "Capricorn", hi: "मकर" }, { en: "Aquarius", hi: "कुम्भ" }, { en: "Pisces", hi: "मीन" },
];
