const shailaputriImage = "/navadurga/shailaputri.webp";
const brahmachariniImage = "/navadurga/brahmacharini.webp";
const chandraghantaImage = "/navadurga/chandraghanta.webp";
const kushmandaImage = "/navadurga/kushmanda.webp";
const skandamataImage = "/navadurga/skandamata.webp";
const katyayaniImage = "/navadurga/katyayani.webp";
const kalaratriImage = "/navadurga/kalaratri.webp";
const mahagauriImage = "/navadurga/mahagauri.webp";
const siddhidatriImage = "/navadurga/siddhidatri.webp";

const SAPTASHATI_PLAN = Object.freeze([
  { day: 1, chapters: "1", focus: { en: "Madhu and Kaitabha — the opening charita", hi: "मधु-कैटभ — प्रथम चरित" } },
  { day: 2, chapters: "2–4", focus: { en: "Mahishasura and the gods' praise", hi: "महिषासुर-वध और देवताओं की स्तुति" } },
  { day: 3, chapters: "5–6", focus: { en: "Devi's manifestation and Dhumralochana", hi: "देवी का प्राकट्य और धूम्रलोचन" } },
  { day: 4, chapters: "7", focus: { en: "Chanda and Munda", hi: "चण्ड और मुण्ड" } },
  { day: 5, chapters: "8", focus: { en: "Raktabija", hi: "रक्तबीज" } },
  { day: 6, chapters: "9–10", focus: { en: "Nishumbha and Shumbha", hi: "निशुम्भ और शुम्भ" } },
  { day: 7, chapters: "11", focus: { en: "Narayani Stuti", hi: "नारायणी स्तुति" } },
  { day: 8, chapters: "12", focus: { en: "Devi's assurance and phalashruti", hi: "देवी का आश्वासन और फलश्रुति" } },
  { day: 9, chapters: "13", focus: { en: "Grace for Suratha and Samadhi", hi: "सुरथ और समाधि पर देवी-कृपा" } },
]);

const NAVADURGA_FORMS = Object.freeze([
  {
    day: 1, slug: "shailaputri", sourceSlug: "shailputri", image: shailaputriImage,
    name: { en: "Maa Shailaputri", hi: "माँ शैलपुत्री" },
    mantra: "ॐ देवी शैलपुत्र्यै नमः॥",
    identity: {
      en: "The daughter of the mountain and the first Navadurga, Shailaputri begins the nine-day journey with steadiness and a grounded resolve.",
      hi: "पर्वतराज की पुत्री और प्रथम नवदुर्गा शैलपुत्री नौ-दिवसीय उपासना को स्थिरता और दृढ़ संकल्प से आरम्भ कराती हैं।",
    },
    iconography: {
      en: "Two-armed, carrying a trident and lotus, with a crescent in her crown and a white bull as her mount.",
      hi: "दो भुजाएँ—त्रिशूल और कमल; मुकुट में अर्धचन्द्र और वाहन श्वेत वृषभ।",
    },
    alt: {
      en: "Original devotional illustration of Maa Shailaputri with two arms, trident, lotus, crescent and white bull",
      hi: "दो भुजाओं, त्रिशूल, कमल, अर्धचन्द्र और श्वेत वृषभ सहित माँ शैलपुत्री का मौलिक भक्तिपूर्ण चित्र",
    },
    focus: {
      en: "Offer a flower and begin the season's sankalpa. Ask for the steadiness to keep only the worship and fasting discipline you can complete with sincerity.",
      hi: "पुष्प अर्पित कर नवरात्रि का संकल्प लें। उतना ही पूजन और व्रत-नियम चुनें जिसे श्रद्धा और स्थिरता से पूरा कर सकें।",
    },
  },
  {
    day: 2, slug: "brahmacharini", image: brahmachariniImage,
    name: { en: "Maa Brahmacharini", hi: "माँ ब्रह्मचारिणी" },
    mantra: "ॐ देवी ब्रह्मचारिण्यै नमः॥",
    identity: {
      en: "Brahmacharini is Parvati in disciplined tapas. Her day centres patience, study and devotion that continues without display.",
      hi: "ब्रह्मचारिणी तप में स्थित पार्वती का रूप हैं। उनका दिन धैर्य, अध्ययन और बिना प्रदर्शन की निरन्तर भक्ति पर केन्द्रित है।",
    },
    iconography: {
      en: "Barefoot and two-armed, walking with a japa mala in her right hand and a kamandalu in her left.",
      hi: "नंगे पाँव, दो भुजाएँ—दाहिने हाथ में जपमाला और बाएँ में कमण्डलु।",
    },
    alt: {
      en: "Original devotional illustration of barefoot Maa Brahmacharini holding a japa mala and kamandalu",
      hi: "जपमाला और कमण्डलु धारण किए नंगे पाँव माँ ब्रह्मचारिणी का मौलिक भक्तिपूर्ण चित्र",
    },
    focus: {
      en: "Keep today's offering simple—water, fruit or a family customary sweet—and give a few quiet minutes to japa, study or listening without rushing.",
      hi: "आज जल, फल या कुलानुसार सरल मिठाई अर्पित करें और बिना जल्दबाज़ी कुछ शांत समय जप, अध्ययन या श्रवण को दें।",
    },
  },
  {
    day: 3, slug: "chandraghanta", image: chandraghantaImage,
    name: { en: "Maa Chandraghanta", hi: "माँ चन्द्रघण्टा" },
    mantra: "ॐ देवी चन्द्रघण्टायै नमः॥",
    identity: {
      en: "Chandraghanta joins serenity with readiness to protect. Her bell-shaped crescent remembers courage that remains guided by compassion.",
      hi: "चन्द्रघण्टा शान्ति और रक्षा-तत्परता का संयुक्त रूप हैं। उनका घण्टाकार अर्धचन्द्र करुणा से निर्देशित साहस का स्मरण कराता है।",
    },
    iconography: {
      en: "Ten-armed on a tigress, with a bell-like crescent; her hands bear protective weapons, lotus, mala, kamandalu and blessing gestures.",
      hi: "व्याघ्री पर आरूढ़ दस भुजाएँ और घण्टाकार अर्धचन्द्र; आयुधों के साथ कमल, माला, कमण्डलु तथा वर-अभय मुद्राएँ।",
    },
    alt: {
      en: "Original devotional illustration of ten-armed Maa Chandraghanta on a tigress with crescent, weapons and blessing gestures",
      hi: "व्याघ्री पर आरूढ़, अर्धचन्द्र, आयुध और वर-अभय मुद्राओं सहित दस-भुजा माँ चन्द्रघण्टा का मौलिक चित्र",
    },
    focus: {
      en: "Offer a fragrant flower or simple sweet. Pray for the courage to respond firmly to harm while keeping speech and action measured.",
      hi: "सुगन्धित पुष्प या सरल मिष्ठान अर्पित करें। हानि के सामने दृढ़ रहने, पर वाणी और कर्म को संयमित रखने का साहस माँगें।",
    },
  },
  {
    day: 4, slug: "kushmanda", image: kushmandaImage,
    name: { en: "Maa Kushmanda", hi: "माँ कूष्माण्डा" },
    mantra: "ॐ देवी कूष्माण्डायै नमः॥",
    identity: {
      en: "Kushmanda is remembered as radiant creative energy—the light through which an ordered world becomes visible.",
      hi: "कूष्माण्डा दीप्त सृजन-शक्ति के रूप में स्मरण की जाती हैं—वह प्रकाश जिसमें सुव्यवस्थित जगत दिखाई देता है।",
    },
    iconography: {
      en: "Eight-armed on a lioness, holding kamandalu, bow, arrow, lotus, nectar pot, japa mala, mace and chakra.",
      hi: "सिंहिनी पर आरूढ़ अष्टभुजा—कमण्डलु, धनुष, बाण, कमल, अमृत-कलश, जपमाला, गदा और चक्र।",
    },
    alt: {
      en: "Original devotional illustration of eight-armed Maa Kushmanda on a lioness with her traditional vessels, weapons, lotus and mala",
      hi: "सिंहिनी पर पारम्परिक पात्र, आयुध, कमल और माला सहित अष्टभुजा माँ कूष्माण्डा का मौलिक चित्र",
    },
    focus: {
      en: "Offer fruit or the sweet your household normally uses. Dedicate one practical act today to creating order, nourishment or light for another person.",
      hi: "फल या घर में प्रचलित मिष्ठान अर्पित करें। आज किसी अन्य के लिए व्यवस्था, पोषण या प्रकाश बढ़ाने वाला एक व्यावहारिक कार्य करें।",
    },
  },
  {
    day: 5, slug: "skandamata", image: skandamataImage,
    name: { en: "Maa Skandamata", hi: "माँ स्कन्दमाता" },
    mantra: "ॐ देवी स्कन्दमात्रे नमः॥",
    identity: {
      en: "Skandamata is Devi as the mother of Skanda. Her image holds courage and tender care together, without treating either as weakness.",
      hi: "स्कन्दमाता देवी का स्कन्द की माता रूप हैं। उनका स्वरूप साहस और कोमल देखभाल को साथ रखता है—किसी को दुर्बलता नहीं मानता।",
    },
    iconography: {
      en: "Four-armed, seated on a lotus with a lion, holding infant Skanda, two lotuses and an abhaya gesture.",
      hi: "सिंह सहित कमलासन पर चतुर्भुजा—गोद में बाल स्कन्द, दो कमल और अभय मुद्रा।",
    },
    alt: {
      en: "Original devotional illustration of four-armed Maa Skandamata with infant Skanda, two lotuses and a lion",
      hi: "बाल स्कन्द, दो कमल और सिंह सहित चतुर्भुजा माँ स्कन्दमाता का मौलिक भक्तिपूर्ण चित्र",
    },
    focus: {
      en: "Offer fruit or milk-based prasad where suitable for your household. Include a prayer for those you care for and one concrete act of patient support.",
      hi: "घर में उपयुक्त हो तो फल या दुग्ध-भोग अर्पित करें। जिनकी देखभाल करते हैं उनके लिए प्रार्थना और धैर्यपूर्ण सहायता का एक ठोस कार्य जोड़ें।",
    },
  },
  {
    day: 6, slug: "katyayani", image: katyayaniImage,
    name: { en: "Maa Katyayani", hi: "माँ कात्यायनी" },
    mantra: "ॐ देवी कात्यायन्यै नमः॥",
    identity: {
      en: "Katyayani is the warrior form invoked against Mahishasura. Her day is for disciplined strength used in service of dharma, not uncontrolled anger.",
      hi: "कात्यायनी महिषासुर-विरोधी योद्धा रूप हैं। उनका दिन धर्म के लिए प्रयुक्त अनुशासित शक्ति का है, अनियन्त्रित क्रोध का नहीं।",
    },
    iconography: {
      en: "Four-armed on a lion, carrying sword and lotus while her other hands give abhaya and varada blessings.",
      hi: "सिंह पर आरूढ़ चतुर्भुजा—खड्ग और कमल, तथा अभय और वरद मुद्राएँ।",
    },
    alt: {
      en: "Original devotional illustration of four-armed Maa Katyayani on a lion with sword, lotus, abhaya and varada gestures",
      hi: "सिंह पर खड्ग, कमल, अभय और वरद मुद्राओं सहित चतुर्भुजा माँ कात्यायनी का मौलिक चित्र",
    },
    focus: {
      en: "Offer a red flower or simple sweet. Name one boundary or duty that needs courageous, fair action and pray to carry it out without cruelty.",
      hi: "लाल पुष्प या सरल मिष्ठान अर्पित करें। किसी ऐसी मर्यादा या कर्तव्य को पहचानें जिसमें साहसी, न्यायपूर्ण कर्म चाहिए और क्रूरता बिना उसे निभाने की प्रार्थना करें।",
    },
  },
  {
    day: 7, slug: "kalaratri", image: kalaratriImage,
    name: { en: "Maa Kalaratri", hi: "माँ कालरात्रि" },
    mantra: "ॐ देवी कालरात्र्यै नमः॥",
    identity: {
      en: "Kalaratri is Devi's fierce protective presence. Her abhaya and varada hands make the answer clear: the frightening form protects rather than glorifies fear.",
      hi: "कालरात्रि देवी की उग्र रक्षक उपस्थिति हैं। उनकी अभय और वरद मुद्राएँ स्पष्ट करती हैं—यह भीषण रूप भय का महिमामण्डन नहीं, रक्षा करता है।",
    },
    iconography: {
      en: "Dark-complexioned and four-armed on a donkey, with unbound hair, sword, iron hook, abhaya and varada gestures.",
      hi: "गहरे वर्ण, मुक्त केश और गर्दभ-वाहिनी चतुर्भुजा—खड्ग, लौह-अंकुश, अभय और वरद मुद्राएँ।",
    },
    alt: {
      en: "Original devotional illustration of dark-complexioned four-armed Maa Kalaratri on a donkey with sword, iron hook and blessing gestures",
      hi: "गर्दभ पर खड्ग, लौह-अंकुश और वर-अभय मुद्राओं सहित गहरे वर्ण की चतुर्भुजा माँ कालरात्रि का मौलिक चित्र",
    },
    focus: {
      en: "A lamp, flower and simple jaggery or fruit offering are sufficient. Keep this household worship calm; do not improvise fierce mantra, fire or tantric rites from the internet.",
      hi: "दीप, पुष्प और सरल गुड़ या फल का भोग पर्याप्त है। गृह-पूजा शांत रखें; इंटरनेट देखकर उग्र मन्त्र, अग्नि या तान्त्रिक विधि स्वयं न गढ़ें।",
    },
  },
  {
    day: 8, slug: "mahagauri", image: mahagauriImage,
    name: { en: "Maa Mahagauri", hi: "माँ महागौरी" },
    mantra: "ॐ देवी महागौर्यै नमः॥",
    identity: {
      en: "Mahagauri expresses clarity, peace and renewal after sustained tapas. Her radiant white iconography is a traditional sign of purity and tranquillity.",
      hi: "महागौरी दीर्घ तप के बाद निर्मलता, शान्ति और नवीनीकरण का स्वरूप हैं। उनका उज्ज्वल श्वेत रूप परम्परा में पवित्रता और प्रशान्ति का चिह्न है।",
    },
    iconography: {
      en: "White-clad and four-armed on a white bull, holding trident and damaru with abhaya and varada gestures.",
      hi: "श्वेत-वस्त्र और श्वेत वृषभ पर चतुर्भुजा—त्रिशूल, डमरू, अभय और वरद मुद्राएँ।",
    },
    alt: {
      en: "Original devotional illustration of white-clad four-armed Maa Mahagauri on a white bull with trident, damaru and blessing gestures",
      hi: "श्वेत वृषभ पर त्रिशूल, डमरू और वर-अभय मुद्राओं सहित श्वेत-वस्त्र चतुर्भुजा माँ महागौरी का मौलिक चित्र",
    },
    focus: {
      en: "Offer a white flower, coconut or family customary prasad. Ask forgiveness where needed and choose one simple act that restores cleanliness or trust.",
      hi: "श्वेत पुष्प, नारियल या कुलानुसार भोग अर्पित करें। जहाँ आवश्यक हो क्षमा माँगें और स्वच्छता या विश्वास लौटाने वाला एक सरल कार्य चुनें।",
    },
  },
  {
    day: 9, slug: "siddhidatri", image: siddhidatriImage,
    name: { en: "Maa Siddhidatri", hi: "माँ सिद्धिदात्री" },
    mantra: "ॐ देवी सिद्धिदात्र्यै नमः॥",
    identity: {
      en: "Siddhidatri completes the Navadurga sequence as the giver of fulfilment and spiritual capability. The household emphasis is gratitude and right use of whatever ability has grown.",
      hi: "सिद्धिदात्री सिद्धि और आध्यात्मिक सामर्थ्य देने वाले रूप में नवदुर्गा क्रम पूर्ण करती हैं। गृह-उपासना में मुख्य भाव कृतज्ञता और प्राप्त क्षमता का सदुपयोग है।",
    },
    iconography: {
      en: "Four-armed on a lotus, with lion association, carrying gada, chakra, lotus and conch.",
      hi: "सिंह-संबंध सहित कमलासन पर चतुर्भुजा—गदा, चक्र, कमल और शंख।",
    },
    alt: {
      en: "Original devotional illustration of four-armed Maa Siddhidatri on a lotus with lion, gada, chakra, lotus and conch",
      hi: "सिंह सहित कमल पर गदा, चक्र, कमल और शंख धारण किए चतुर्भुजा माँ सिद्धिदात्री का मौलिक चित्र",
    },
    focus: {
      en: "Offer flowers and the closing prasad chosen by your household. Give thanks for the nine days and resolve to use learning, strength and skill for service rather than pride.",
      hi: "पुष्प और घर में चुना समापन-भोग अर्पित करें। नौ दिनों के लिए कृतज्ञता व्यक्त कर ज्ञान, शक्ति और कौशल को अहंकार नहीं, सेवा में लगाने का संकल्प लें।",
    },
  },
]);

const NAVRATRI_SEASONS = Object.freeze({
  chaitra: {
    parentKey: "chaitraNavratri", parentSlug: "chaitra-navratri",
    name: { en: "Chaitra Navratri", hi: "चैत्र नवरात्रि" },
    context: {
      en: "This is the spring Navratri sequence. On Navami, households that observe Rama Navami may include Shri Rama's birth worship without replacing Siddhidatri Puja.",
      hi: "यह वसन्तकालीन नवरात्रि क्रम है। नवमी पर राम नवमी मानने वाले घर सिद्धिदात्री पूजन को हटाए बिना श्रीराम जन्म-पूजन जोड़ सकते हैं।",
    },
  },
  sharad: {
    parentKey: "sharadNavratri", parentSlug: "sharad-navratri",
    name: { en: "Sharad Navratri", hi: "शारदीय नवरात्रि" },
    context: {
      en: "This is the autumn Navratri sequence. Ashtami, Navami and Vijayadashami customs vary by region; Ganak keeps Navadurga household worship separate from Bengal's Durga Puja sequence.",
      hi: "यह शरदकालीन नवरात्रि क्रम है। अष्टमी, नवमी और विजयादशमी की रीति क्षेत्रानुसार बदलती है; गणक नवदुर्गा गृह-पूजन को बंगाल दुर्गापूजा क्रम से अलग रखता है।",
    },
  },
});

function makeNavadurgaPageEntries() {
  return Object.entries(NAVRATRI_SEASONS).flatMap(([seasonKey, season]) => (
    NAVADURGA_FORMS.map((form) => Object.freeze({
      sourceKind: "navadurga",
      contentKind: "navadurga",
      key: `${season.parentKey}Day${form.day}`,
      metaKey: season.parentKey,
      parentKey: season.parentKey,
      seasonKey,
      day: form.day,
      form,
      title: {
        en: `${season.name.en} Day ${form.day} · ${form.name.en}`,
        hi: `${season.name.hi} दिवस ${form.day} · ${form.name.hi}`,
      },
      slug: `${season.parentSlug}/day-${form.day}-${form.slug}`,
      path: `/festival/${season.parentSlug}/day-${form.day}-${form.slug}`,
      status: "required",
      vidhiKey: season.parentKey,
    }))
  ));
}

const NAVADURGA_PAGE_ENTRIES = Object.freeze(makeNavadurgaPageEntries());

function navadurgaEntriesForSeason(parentKey) {
  return NAVADURGA_PAGE_ENTRIES.filter((entry) => entry.parentKey === parentKey);
}

export {
  SAPTASHATI_PLAN,
  NAVADURGA_FORMS,
  NAVRATRI_SEASONS,
  NAVADURGA_PAGE_ENTRIES,
  navadurgaEntriesForSeason,
};
