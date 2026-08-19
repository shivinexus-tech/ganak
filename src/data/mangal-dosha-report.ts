export const MANGAL_HOUSE_MEANINGS = {
  1: {
    en: "Self, temperament and how forcefully one enters relationship life.",
    hi: "स्वभाव, व्यक्तित्व और संबंधों में ऊर्जा कैसे प्रवेश करती है।",
  },
  2: {
    en: "Family speech, household values and the stability of the shared home.",
    hi: "परिवारिक वाणी, गृह-मूल्य और साझा घर की स्थिरता।",
  },
  4: {
    en: "Domestic peace, property, emotional security and home comfort.",
    hi: "गृह-शांति, संपत्ति, भावनात्मक सुरक्षा और घर का सुख।",
  },
  7: {
    en: "Marriage/partnership dynamics, direct confrontation and mutual adjustment.",
    hi: "विवाह/साझेदारी की गतिशीलता, सीधा टकराव और परस्पर समायोजन।",
  },
  8: {
    en: "Shared vulnerability, intimacy, sudden change and in-law dynamics.",
    hi: "साझी संवेदनशीलता, अंतरंगता, अचानक बदलाव और ससुराल पक्ष।",
  },
  12: {
    en: "Private life, sleep, expenses, distance and the couple's inner space.",
    hi: "निजी जीवन, नींद, खर्च, दूरी और दम्पत्ति का अंतरंग क्षेत्र।",
  },
};

export const MANGAL_METHOD_COPY = {
  en: "Ganak checks Mars separately from Lagna, Moon and Venus in the commonly used Manglik houses 1, 2, 4, 7, 8 and 12. Mitigations are shown as context because cancellation rules vary by tradition; Ganak does not silently erase a result.",
  hi: "गणक लग्न, चन्द्र और शुक्र से मंगल को अलग-अलग देखता है और सामान्य मांगलिक भाव 1, 2, 4, 7, 8, 12 लेता है। शमन को संदर्भ की तरह दिखाया जाता है क्योंकि निरस्तीकरण के नियम परम्परा अनुसार बदलते हैं; गणक परिणाम को चुपचाप मिटाता नहीं।",
};

export const MANGAL_GUIDANCE = {
  en: [
    "Read all three references: Lagna shows the visible behaviour pattern, Moon shows emotional response, Venus shows relationship comfort.",
    "A mitigation means “handle with context,” not “ignore the placement.”",
    "For marriage matching, Mangal is only one part; Papasamyam, overall koota matching and the full charts matter too.",
  ],
  hi: [
    "तीनों सन्दर्भ पढ़ें: लग्न बाहरी व्यवहार, चन्द्र भावनात्मक प्रतिक्रिया, और शुक्र संबंध-सुख दिखाता है।",
    "शमन का अर्थ है “संदर्भ सहित पढ़ें”, “स्थान को अनदेखा करें” नहीं।",
    "विवाह मिलान में मंगल केवल एक भाग है; पापसाम्य, कूट मिलान और पूरी कुंडली भी देखी जाती है।",
  ],
};

export const MANGAL_MITIGATION_COPY = {
  ownOrExalted: {
    en: "Mars is in own/exalted dignity, so many traditions reduce the severity.",
    hi: "मंगल स्व/उच्च राशि में है, इसलिए कई परम्पराएँ तीव्रता कम मानती हैं।",
  },
  jupiterSupport: {
    /* Jupiter's full aspects are the 5th, 7th and 9th from itself — the same set
       Ganak's own bhava.ts scores. This card used to say "full 7th aspect", and the
       engine tested only the 7th, so two of Jupiter's three aspects were invisible
       and the dosha read stronger than the stated method warranted, on a page about
       someone's marriage (bug bash 2026-08-18, F19). */
    en: "Jupiter supports Mars by conjunction, or by its full 5th, 7th or 9th aspect.",
    hi: "गुरु मंगल को युति से, अथवा अपनी पूर्ण पंचम, सप्तम या नवम दृष्टि से समर्थन देता है।",
  },
  traditionSpecific: {
    en: "A house-sign exception is noted in some traditions; treat it as context, not universal cancellation.",
    hi: "कुछ परम्पराओं में भाव-राशि आधारित अपवाद माना जाता है; इसे संदर्भ समझें, सार्वभौमिक निरस्तीकरण नहीं।",
  },
};
