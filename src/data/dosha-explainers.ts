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
