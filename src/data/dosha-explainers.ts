/* Educational content for the dosha calculator pages (P0-CALCULATOR-DEPTH).
   The people who use a calculator are curious non-experts, not astrologers who
   read a chart themselves — so each page must teach: what the concept is, what a
   result means in balanced terms, common myths vs reality, and a grounded
   perspective. Deliberately non-fatalistic; no fear-based or universal claims.
   The dynamic "how your result was derived" section is composed in the screen
   from the live result; this file holds the stable bilingual prose. */

export type DoshaExplainer = {
  whatEn: string; whatHi: string;
  meaningEn: string; meaningHi: string;
  myths: { mythEn: string; realityEn: string; mythHi: string; realityHi: string }[];
  perspectiveEn: string; perspectiveHi: string;
};

/* The twelve named Kala Sarpa types, ordered by the house Rahu occupies (1..12).
   Keys are kept identical to the engine's KS_TYPES so a gate can prove they never
   drift. Descriptions read the life-axis of each type — not a prediction of harm. */
export const KALA_SARPA_TYPES = [
  { key: "anant", house: 1, en: "Anant", hi: "अनन्त",
    descEn: "Rahu in the 1st, Ketu in the 7th. The axis runs through identity and one-to-one bonds — a strong drive to define oneself, with lessons that often arrive through partnership.",
    descHi: "राहु प्रथम में, केतु सप्तम में। अक्ष पहचान और साझेदारी से होकर जाता है — स्वयं को गढ़ने की प्रबल इच्छा, और अक्सर संबंधों से मिलने वाले पाठ।" },
  { key: "kulika", house: 2, en: "Kulika", hi: "कुलिक",
    descEn: "Rahu in the 2nd. Emphasis on earned wealth, speech and family ties; savings that rise and dip but steady with disciplined habits.",
    descHi: "राहु द्वितीय में। अर्जित धन, वाणी और कुटुम्ब पर बल; बचत में उतार-चढ़ाव जो अनुशासित आदतों से स्थिर होता है।" },
  { key: "vasuki", house: 3, en: "Vasuki", hi: "वासुकि",
    descEn: "Rahu in the 3rd. Courage, communication and initiative; success comes through persistent self-effort, siblings and short journeys.",
    descHi: "राहु तृतीय में। साहस, संवाद और पहल; सफलता निरंतर पुरुषार्थ, भाई-बहन और लघु यात्राओं से।" },
  { key: "shankhapala", house: 4, en: "Shankhapala", hi: "शंखपाल",
    descEn: "Rahu in the 4th. Home, mother, land and inner peace; a search for a settled base that rewards patience.",
    descHi: "राहु चतुर्थ में। घर, माता, भूमि और मन की शान्ति; स्थिर आधार की खोज जो धैर्य से फल देती है।" },
  { key: "padma", house: 5, en: "Padma", hi: "पद्म",
    descEn: "Rahu in the 5th. Education, children, romance and creative risk; early brilliance that matures with focus.",
    descHi: "राहु पञ्चम में। विद्या, संतान, प्रेम और सृजनात्मक जोखिम; आरम्भिक प्रतिभा जो एकाग्रता से परिपक्व होती है।" },
  { key: "mahapadma", house: 6, en: "Mahapadma", hi: "महापद्म",
    descEn: "Rahu in the 6th. Service, health and competition; a fighter's placement where obstacles become the training ground.",
    descHi: "राहु षष्ठ में। सेवा, स्वास्थ्य और प्रतिस्पर्धा; संघर्षशील स्थिति जहाँ बाधाएँ ही अभ्यास-भूमि बन जाती हैं।" },
  { key: "takshaka", house: 7, en: "Takshaka", hi: "तक्षक",
    descEn: "Rahu in the 7th. Marriage, partnership and public dealings; relationships are the central theme and the chief teacher.",
    descHi: "राहु सप्तम में। विवाह, साझेदारी और सार्वजनिक व्यवहार; संबंध ही मुख्य विषय और प्रमुख शिक्षक हैं।" },
  { key: "karkotaka", house: 8, en: "Karkotaka", hi: "कर्कोटक",
    descEn: "Rahu in the 8th. Transformation, shared resources and the hidden or occult; sudden turns that deepen resilience.",
    descHi: "राहु अष्टम में। परिवर्तन, साझा संसाधन और गूढ़/गुप्त; अचानक मोड़ जो सहनशीलता को गहरा करते हैं।" },
  { key: "shankhachuda", house: 9, en: "Shankhachuda", hi: "शंखचूड़",
    descEn: "Rahu in the 9th. Fortune, beliefs, higher learning and father; a seeker's path that sometimes questions inherited faith.",
    descHi: "राहु नवम में। भाग्य, विश्वास, उच्च शिक्षा और पिता; साधक का मार्ग जो कभी-कभी परम्परागत आस्था पर प्रश्न करता है।" },
  { key: "ghataka", house: 10, en: "Ghataka", hi: "घातक",
    descEn: "Rahu in the 10th. Career, reputation and authority; ambition that rises through effort and occasional reinvention.",
    descHi: "राहु दशम में। कर्म, प्रतिष्ठा और अधिकार; महत्वाकांक्षा जो प्रयास और यदा-कदा पुनर्निर्माण से बढ़ती है।" },
  { key: "vishadhara", house: 11, en: "Vishadhara", hi: "विषधर",
    descEn: "Rahu in the 11th. Gains, networks and aspirations; large goals and wide circles, with income that grows in waves.",
    descHi: "राहु एकादश में। लाभ, संपर्क और आकांक्षाएँ; बड़े लक्ष्य और विस्तृत मंडल, आय जो लहरों में बढ़ती है।" },
  { key: "sheshanaga", house: 12, en: "Sheshanaga", hi: "शेषनाग",
    descEn: "Rahu in the 12th. Foreign lands, spirituality, expenses and letting go; an inward, liberation-leaning placement.",
    descHi: "राहु द्वादश में। विदेश, आध्यात्म, व्यय और त्याग; अंतर्मुखी, मोक्ष की ओर झुकी स्थिति।" },
];

/* The recognised forms of Pitra Dosha — the chart signatures Ganak checks. Keys
   match the engine's PITRA_CHECKS so the “which form is yours” highlight stays true. */
export const PITRA_FORMS = [
  { key: "sun-nodes", en: "Sun with the lunar nodes", hi: "सूर्य के साथ राहु/केतु",
    descEn: "The Sun — significator of the father — sits with Rahu or Ketu. The most-cited signature of paternal-line karma.",
    descHi: "सूर्य — पिता का कारक — राहु या केतु के साथ। पितृ-वंश कर्म का सर्वाधिक उद्धृत लक्षण।" },
  { key: "sun-saturn", en: "Sun with Saturn", hi: "सूर्य के साथ शनि",
    descEn: "The Sun joined by Saturn, planet of duty and karmic weight — read as responsibility carried down the paternal line.",
    descHi: "सूर्य के साथ शनि — कर्तव्य और कार्मिक भार का ग्रह; इसे पितृ-वंश से आया उत्तरदायित्व माना जाता है।" },
  { key: "nodes-9th", en: "Nodes in the 9th house", hi: "नवम भाव में राहु/केतु",
    descEn: "Rahu or Ketu occupies the 9th — the very house of father, dharma and ancestors — placing the theme at its source.",
    descHi: "राहु या केतु नवम में — पिता, धर्म और पूर्वजों का ही भाव — विषय को उसके मूल पर रखता है।" },
  { key: "ninth-lord", en: "An afflicted 9th lord", hi: "पीड़ित नवमेश",
    descEn: "The ruler of the 9th house sits with Rahu, Ketu or Saturn — the ancestral house's lord under strain.",
    descHi: "नवम भाव का स्वामी राहु, केतु या शनि के साथ — पूर्वज-भाव का स्वामी दबाव में।" },
  { key: "sun-9th-afflicted", en: "An afflicted Sun in the 9th", hi: "नवम में पीड़ित सूर्य",
    descEn: "The father-significator sitting in the father-house, joined by a malefic — the theme doubled at its own seat.",
    descHi: "पिता-कारक पिता-भाव में, पापग्रह के साथ — विषय अपने ही स्थान पर द्विगुणित।" },
];

export const DOSHA_EXPLAINERS: Record<string, DoshaExplainer> = {
  "kala-sarpa": {
    whatEn:
      "Kala Sarpa (“time-serpent”) forms when all seven classical planets — Sun through Saturn — fall on one side of the Rahu–Ketu axis, the two points where the Moon's path crosses the Sun's. Rahu becomes the serpent's head and Ketu its tail, and the planets sit ‘inside’ that arc. The pattern is sorted into twelve named types by the house Rahu occupies. Honestly stated: it is a chart geometry popularised in modern astrology rather than a rule from the classical Parashari texts, and traditions differ on how much weight it deserves.",
    whatHi:
      "काल सर्प (‘समय-सर्प’) योग तब बनता है जब सातों शास्त्रीय ग्रह — सूर्य से शनि तक — राहु–केतु अक्ष के एक ही ओर आ जाएँ। राहु सर्प का मुख और केतु पूँछ माना जाता है, और ग्रह उस अर्धवृत्त के ‘भीतर’ रहते हैं। राहु जिस भाव में हो, उसके अनुसार इसके बारह नामित प्रकार होते हैं। ईमानदारी से: यह आधुनिक ज्योतिष में प्रचलित एक ज्यामितीय रचना है, शास्त्रीय पराशर ग्रंथों का नियम नहीं, और परम्पराएँ इसके महत्त्व पर भिन्न हैं।",
    meaningEn:
      "Traditionally it is read as a life where results come after resistance — delays, then sudden breakthroughs — with strong karmic and inner themes tied to the house Rahu sits in. The balanced view matters most: countless accomplished people have this pattern. It does not doom marriage, wealth or health, and ‘partial’ arrangements (six of seven enclosed) are gentler still.",
    meaningHi:
      "परम्परा में इसे ऐसे जीवन के रूप में देखा जाता है जहाँ फल संघर्ष के बाद मिलते हैं — विलम्ब, फिर अचानक सफलता — और राहु के भाव से जुड़े गहरे कार्मिक व आंतरिक विषय रहते हैं। संतुलित दृष्टि सबसे ज़रूरी है: अनेक सफल व्यक्तियों में यह रचना होती है। यह विवाह, धन या स्वास्थ्य को अभिशप्त नहीं करती, और ‘आंशिक’ रचना (सात में से छह घिरे) और भी हल्की होती है।",
    myths: [
      { mythEn: "Kala Sarpa guarantees a life of suffering or failure.", realityEn: "It is one pattern among hundreds; outcomes depend on the whole chart, running dashas and your own effort.",
        mythHi: "काल सर्प निश्चित रूप से कष्ट या असफलता देता है।", realityHi: "यह सैकड़ों में से एक रचना है; फल पूरी कुंडली, चल रही दशाओं और आपके प्रयास पर निर्भर करते हैं।" },
      { mythEn: "Everyone with it must do an expensive puja to be safe.", realityEn: "Remedies are optional and devotional — not a toll you must pay to avoid harm.",
        mythHi: "इससे युक्त हर व्यक्ति को सुरक्षा हेतु महँगी पूजा करनी ही चाहिए।", realityHi: "उपाय वैकल्पिक और भक्ति-भाव के हैं — अनिष्ट टालने का शुल्क नहीं।" },
      { mythEn: "It is an ancient, universally-accepted Vedic dosha.", realityEn: "It is a relatively modern classification; many classical astrologers do not treat it as a dosha at all.",
        mythHi: "यह प्राचीन, सर्वमान्य वैदिक दोष है।", realityHi: "यह अपेक्षाकृत आधुनिक वर्गीकरण है; अनेक शास्त्रीय ज्योतिषी इसे दोष मानते ही नहीं।" },
    ],
    perspectiveEn:
      "If the pattern is present, read it through the strengths of the enclosed planets and the house Rahu occupies — the ‘type’ simply names the life-area it emphasises. Treat it as a theme to work with, not a sentence. For anything that worries you, a qualified astrologer reading the full chart will tell you far more than the label alone.",
    perspectiveHi:
      "यदि रचना बने, तो इसे घिरे ग्रहों की शक्ति और राहु के भाव से पढ़ें — ‘प्रकार’ केवल उस जीवन-क्षेत्र को बताता है जिस पर बल है। इसे दण्ड नहीं, एक विषय मानें जिस पर काम किया जा सके। किसी भी चिंता के लिए पूरी कुंडली देखकर योग्य ज्योतिषी लेबल से कहीं अधिक बता सकते हैं।",
  },
  "pitra-dosha": {
    whatEn:
      "‘Pitru’ means the ancestors and the paternal line. Pitra Dosha is a traditional reading that points to unfinished duties of remembrance toward one's forebears, seen through afflictions to the Sun — the significator of the father — and the 9th house of father, dharma and lineage. At its heart it is about honouring ancestors through shraddha and tarpan, not a curse laid upon you.",
    whatHi:
      "‘पितृ’ का अर्थ है पूर्वज और पितृ-वंश। पितृ दोष एक पारम्परिक व्याख्या है जो पूर्वजों के प्रति स्मरण के अधूरे कर्तव्यों की ओर संकेत करती है — इसे सूर्य (पिता का कारक) और नवम भाव (पिता, धर्म, वंश) की पीड़ा से देखा जाता है। मूल रूप से यह श्राद्ध और तर्पण द्वारा पूर्वजों के सम्मान की बात है, कोई अभिशाप नहीं।",
    meaningEn:
      "Where indicated, tradition connects it with themes around the father, lineage or a felt pull toward ancestral remembrance. It is best understood as an invitation to gratitude and duty — remembering those who came before — rather than a verdict of misfortune. Ganak shows exactly which transparent checks fired in your chart, so nothing is hidden behind the label.",
    meaningHi:
      "जहाँ संकेत हो, वहाँ परम्परा इसे पिता, वंश या पूर्वज-स्मरण की ओर सहज झुकाव से जोड़ती है। इसे अनिष्ट का निर्णय नहीं, बल्कि कृतज्ञता और कर्तव्य का निमंत्रण समझना उचित है — उन्हें स्मरण करना जो पहले हुए। गणक स्पष्ट रूप से दिखाता है कि आपकी कुंडली में कौन-से नियम लागू हुए, ताकि लेबल के पीछे कुछ छिपा न रहे।",
    myths: [
      { mythEn: "Pitra Dosha means your ancestors are angry and cursing you.", realityEn: "It is a symbolic reminder to honour your lineage; framing it as an active curse is fear-based, not devotional.",
        mythHi: "पितृ दोष का अर्थ है पूर्वज क्रुद्ध होकर श्राप दे रहे हैं।", realityHi: "यह वंश के सम्मान का प्रतीकात्मक स्मरण है; इसे सक्रिय श्राप बताना भय-आधारित है, भक्ति नहीं।" },
      { mythEn: "Only costly rituals can remove it.", realityEn: "Sincere shraddha, tarpan and living ethically are the traditional core; elaborate paid rituals are optional additions.",
        mythHi: "इसे केवल महँगे अनुष्ठान ही दूर कर सकते हैं।", realityHi: "सच्चा श्राद्ध, तर्पण और नैतिक जीवन ही पारम्परिक आधार हैं; विस्तृत सशुल्क अनुष्ठान वैकल्पिक हैं।" },
      { mythEn: "There is one fixed rule everyone agrees on.", realityEn: "Conventions vary widely between astrologers; this page shows the specific same-sign checks it uses and applies no special aspects.",
        mythHi: "एक निश्चित नियम है जिस पर सब सहमत हैं।", realityHi: "ज्योतिषियों में नियम बहुत भिन्न हैं; यह पृष्ठ अपने सम-राशि नियम दिखाता है और कोई विशेष दृष्टि नहीं लगाता।" },
    ],
    perspectiveEn:
      "If indications appear, the gentle traditional response is remembrance: shraddha during Pitru Paksha, tarpan, and charity or feeding offered in your ancestors' name. Take it as a prompt to honour your lineage. For personal guidance, ask a knowledgeable family elder or priest rather than reacting to the label alone.",
    perspectiveHi:
      "यदि संकेत मिलें, तो सौम्य पारम्परिक प्रतिक्रिया है स्मरण: पितृ पक्ष में श्राद्ध, तर्पण, और पूर्वजों के नाम पर दान या अन्नदान। इसे अपने वंश के सम्मान की प्रेरणा मानें। व्यक्तिगत मार्गदर्शन हेतु केवल लेबल पर प्रतिक्रिया न देकर किसी जानकार परिवार-वृद्ध या पुरोहित से पूछें।",
  },
  "papa-dosha": {
    whatEn:
      "‘Papa’ means a natural malefic. Papa Dosha measures the ‘malefic load’ of a chart: each malefic — Sun, Mars, Saturn, Rahu, Ketu — sitting in a sensitive house (1, 2, 4, 7, 8 or 12) counted from the Lagna, the Moon and Venus scores one papa point. Its main traditional use is Papasamyam in marriage matching, where the two partners' loads are compared for balance. Mangal (Manglik) dosha is just the Mars-only slice of this same idea.",
    whatHi:
      "‘पाप’ का अर्थ है स्वाभाविक पापग्रह। पाप दोष कुंडली के ‘पापग्रह-भार’ को मापता है: हर पापग्रह — सूर्य, मंगल, शनि, राहु, केतु — यदि लग्न, चन्द्र और शुक्र से गिने गए संवेदनशील भाव (1, 2, 4, 7, 8 या 12) में हो तो एक पाप-अंक। इसका मुख्य पारम्परिक उपयोग विवाह-मिलान में पापसाम्य है, जहाँ दोनों के भार की तुलना संतुलन हेतु की जाती है। मंगल (मांगलिक) दोष इसी विचार का केवल मंगल-वाला अंश है।",
    meaningEn:
      "A higher count simply means more malefic emphasis on the areas those houses govern — the self, family and speech, home, partnership, longevity and expenses. On its own it is not a verdict. In matching, what tradition looks for is not a low number but balance: two comparable loads are considered harmonious, while a large gap is flagged for a closer look.",
    meaningHi:
      "अधिक अंक का अर्थ केवल इतना है कि उन भावों के क्षेत्रों पर पापग्रहों का अधिक बल है — स्वयं, कुटुम्ब व वाणी, घर, साझेदारी, आयु और व्यय। अकेले में यह कोई निर्णय नहीं। मिलान में परम्परा कम अंक नहीं, संतुलन देखती है: दो तुलनीय भार अनुकूल माने जाते हैं, जबकि बड़ा अंतर गहराई से देखने का संकेत है।",
    myths: [
      { mythEn: "A high papa count means a bad marriage or a hard life.", realityEn: "It is a comparative index. Balance between partners and the strength of the whole chart matter far more than the raw number.",
        mythHi: "अधिक पाप-अंक का अर्थ बुरा विवाह या कठिन जीवन है।", realityHi: "यह तुलनात्मक सूचकांक है। दोनों के बीच संतुलन और पूरी कुंडली की शक्ति अंक से कहीं अधिक महत्त्वपूर्ण हैं।" },
      { mythEn: "A high-papa person cannot be matched.", realityEn: "Papasamyam is precisely about finding a partner with a comparable load; astrologers then weigh many other factors.",
        mythHi: "अधिक-पाप व्यक्ति का मिलान नहीं हो सकता।", realityHi: "पापसाम्य का उद्देश्य ही तुलनीय भार वाला साथी खोजना है; फिर ज्योतिषी अनेक अन्य कारक तौलते हैं।" },
      { mythEn: "Only Mangal (Manglik) dosha matters for marriage.", realityEn: "Mangal is Mars-specific; papa counting generalises the same logic to every natural malefic.",
        mythHi: "विवाह के लिए केवल मंगल (मांगलिक) दोष ही मायने रखता है।", realityHi: "मंगल केवल मंगल-विशिष्ट है; पाप-गणना उसी तर्क को हर स्वाभाविक पापग्रह तक विस्तृत करती है।" },
    ],
    perspectiveEn:
      "Read papa load as one lens among several — alongside Guna Milan, the 7th house and its lord, Venus and Jupiter, and the running dashas. It is a starting point for conversation, never a stand-alone yes or no. A qualified astrologer comparing two full charts will give a far more meaningful answer than the count alone.",
    perspectiveHi:
      "पापग्रह-भार को कई में से एक दृष्टि मानें — गुण मिलान, सप्तम भाव व उसके स्वामी, शुक्र व गुरु, और चल रही दशाओं के साथ। यह बातचीत का आरम्भ है, अकेला हाँ या ना कभी नहीं। दो पूरी कुंडलियों की तुलना करते योग्य ज्योतिषी अंक से कहीं अधिक सार्थक उत्तर देंगे।",
  },
};

/* Traditional causes attributed to Pitra Dosha — stated as belief/tradition, not
   as blame or fact. Balanced framing: a call to remembrance, not a curse. */
export const PITRA_CAUSES = [
  { en: "Last rites or annual shraddha for a departed elder left unperformed or incomplete.", hi: "किसी दिवंगत बुज़ुर्ग के अंतिम संस्कार या वार्षिक श्राद्ध का न होना या अधूरा रहना।" },
  { en: "Unfulfilled wishes or unsettled debts believed to be carried by the forebears.", hi: "पूर्वजों की अधूरी इच्छाएँ या अनसुलझे ऋण जो उनके साथ माने जाते हैं।" },
  { en: "Disrespect toward parents, elders or the family's ancestral duties.", hi: "माता-पिता, बुज़ुर्गों या परिवार के पितृ-कर्तव्यों के प्रति अनादर।" },
  { en: "Actions in earlier generations felt to affect the lineage's dharma.", hi: "पूर्व पीढ़ियों के कर्म जिन्हें वंश के धर्म पर प्रभाव डालने वाला माना जाता है।" },
];

/* Optional, devotional remedies per dosha. NOT a fee to avoid harm — the honest
   framing the backlog requires. */
export const DOSHA_REMEDIES: Record<string, { en: string; hi: string }[]> = {
  "kala-sarpa": [
    { en: "Devotion to Lord Shiva — the Mahamrityunjaya mantra and offering water on Mondays.", hi: "भगवान शिव की आराधना — महामृत्युंजय मंत्र और सोमवार को जलार्पण।" },
    { en: "Observing Nag Panchami and honouring the serpent deities.", hi: "नाग पंचमी का पालन और नाग देवताओं का सम्मान।" },
    { en: "Steady, ethical effort in the life-area the Rahu house marks — the pattern rewards patience over panic.", hi: "राहु के भाव वाले जीवन-क्षेत्र में स्थिर, नैतिक प्रयास — यह रचना घबराहट नहीं, धैर्य को फल देती है।" },
  ],
  "pitra-dosha": [
    { en: "Shraddha and tarpan during Pitru Paksha, remembering ancestors by name.", hi: "पितृ पक्ष में श्राद्ध और तर्पण, पूर्वजों को नाम से स्मरण करना।" },
    { en: "Offering food or water, and charity, in the ancestors' name — feeding the needy, cows, crows or brahmins.", hi: "पूर्वजों के नाम पर अन्न-जल और दान — ज़रूरतमंदों, गाय, कौओं या ब्राह्मणों को भोजन।" },
    { en: "Caring for living elders and living ethically — held as the truest remedy of all.", hi: "जीवित बुज़ुर्गों की सेवा और नैतिक जीवन — इसे ही सबसे सच्चा उपाय माना गया है।" },
    { en: "Pind daan at a sacred site such as Gaya, for families who wish to.", hi: "जो चाहें उनके लिए गया जैसे तीर्थ पर पिंडदान।" },
  ],
  "papa-dosha": [
    { en: "Because papa load is comparative, the ‘remedy’ is a balanced match and the whole chart — not a ritual for the number itself.", hi: "चूँकि पापग्रह-भार तुलनात्मक है, ‘उपाय’ संतुलित मिलान और पूरी कुंडली है — अंक के लिए कोई अनुष्ठान नहीं।" },
    { en: "Strengthening the benefics (Jupiter, Venus) and the 7th house through the chart's own indications, guided by an astrologer.", hi: "कुंडली के अपने संकेतों के अनुसार शुभ ग्रहों (गुरु, शुक्र) और सप्तम भाव को बल देना, ज्योतिषी के मार्गदर्शन में।" },
  ],
};

/* What each sensitive papa house governs — so the count is meaningful, not opaque. */
export const PAPA_HOUSE_MEANINGS = [
  { house: 1, en: "the self, body and overall temperament", hi: "स्वयं, शरीर और समग्र स्वभाव" },
  { house: 2, en: "family, wealth and speech", hi: "कुटुम्ब, धन और वाणी" },
  { house: 4, en: "home, mother and inner comfort", hi: "घर, माता और भीतरी सुख" },
  { house: 7, en: "marriage and partnership", hi: "विवाह और साझेदारी" },
  { house: 8, en: "longevity, upheaval and the spouse's wellbeing", hi: "आयु, उथल-पुथल और जीवनसाथी का कल्याण" },
  { house: 12, en: "losses, expenses and the marriage bed", hi: "हानि, व्यय और शय्या-सुख" },
];
