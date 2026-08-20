/* Educational content for the non-dosha calculator pages (P0-CALCULATOR-DEPTH).

   Same contract as src/data/dosha-explainers.ts and the same shape, kept in a
   separate file because the dosha copy is owned by a different lane. The screen
   reads both and this one fills the gaps.

   Who this is written for: a curious non-expert. An astrologer reads the chart
   themselves; the person using a calculator wants to understand what came back.
   So every entry teaches what the concept is, how to read the result in balanced
   terms, the myths that surround it, and when a real person is worth consulting.
   Deliberately non-fatalistic — a placement names a theme to work with, never a
   sentence. The "how your own result was derived" part is composed live in the
   screen from the actual placements; this file holds the stable bilingual prose.

   mangal-dosha and sade-sati are deliberately absent: their copy belongs to
   CLAUDE-MATCHING-AUDIT-REMAINDER-2026-08-18. */

import type { DoshaExplainer } from "./dosha-explainers";

export const CALCULATOR_EXPLAINERS: Record<string, DoshaExplainer> = {
  rashi: {
    whatEn:
      "Your Rashi is the zodiac sign the Moon occupied at the moment you were born, measured against the fixed stars rather than the seasons. This is the sidereal zodiac, and Ganak uses the Lahiri ayanamsa to locate it. In Indian astrology the Moon sign — not the Sun sign — is the one people mean when they ask “what is your sign”, because the Moon governs the mind, and it is the reference point for nakshatra, dasha periods and most matching systems.",
    whatHi:
      "आपकी राशि वह है जिसमें जन्म के क्षण चन्द्रमा स्थित था — ऋतुओं के नहीं, स्थिर नक्षत्रों के सापेक्ष मापी गई। यही निरयण (सायन-रहित) पद्धति है, और गणक इसके लिए लाहिरी अयनांश का प्रयोग करता है। भारतीय ज्योतिष में “आपकी राशि क्या है” पूछने पर सूर्य की नहीं, चन्द्र की राशि अभिप्रेत होती है, क्योंकि चन्द्रमा मन का कारक है और नक्षत्र, दशा तथा अधिकांश मिलान पद्धतियों का आधार भी वही है।",
    meaningEn:
      "The Moon sign describes emotional temperament — how you react before you have had time to think, what settles you, what unsettles you. It is the most personal layer of a chart and the fastest-moving of the three main markers: the Moon changes sign roughly every two and a half days. Read it as your instinctive weather, not as a fixed personality. A single sign never describes a whole person, and the rest of the chart routinely softens or sharpens it.",
    meaningHi:
      "चन्द्र राशि भावनात्मक स्वभाव बताती है — सोचने से पहले आपकी सहज प्रतिक्रिया क्या होती है, कौन-सी बात स्थिर करती है और कौन-सी विचलित। यह कुंडली की सबसे व्यक्तिगत परत है और तीनों मुख्य संकेतकों में सबसे तेज़ चलने वाली: चन्द्रमा लगभग ढाई दिन में राशि बदल देता है। इसे स्थिर व्यक्तित्व नहीं, अपने सहज मनोभाव का मौसम मानें। कोई एक राशि पूरे व्यक्ति को नहीं बताती, और शेष कुंडली प्रायः उसे नरम या तीव्र करती रहती है।",
    myths: [
      {
        mythEn: "My Rashi is wrong — it does not match the sign I have always been told.",
        realityEn: "Two different things are being compared. Most popular horoscopes use the tropical Sun sign; this is the sidereal Moon sign. They disagree by design, and neither is a mistake.",
        mythHi: "मेरी राशि ग़लत है — यह उस राशि से मेल नहीं खाती जो मुझे सदा बताई गई।",
        realityHi: "दो भिन्न वस्तुओं की तुलना हो रही है। प्रचलित राशिफल प्रायः सायन सूर्य राशि पर आधारित होते हैं; यह निरयण चन्द्र राशि है। इनका भिन्न होना स्वाभाविक है, कोई त्रुटि नहीं।",
      },
      {
        mythEn: "Some Moon signs are lucky and others are unlucky.",
        realityEn: "No sign is better or worse. Each names a temperament with its own strengths and its own friction, and what a chart actually does with it depends on placements, aspects and the periods running at the time.",
        mythHi: "कुछ चन्द्र राशियाँ शुभ होती हैं और कुछ अशुभ।",
        realityHi: "कोई राशि श्रेष्ठ या हीन नहीं होती। प्रत्येक एक स्वभाव बताती है जिसकी अपनी शक्ति और अपनी कठिनाई है; वास्तविक फल ग्रह-स्थिति, दृष्टि और उस समय चल रही दशा पर निर्भर करता है।",
      },
      {
        mythEn: "If I do not know my exact birth time, the Moon sign is unreliable.",
        realityEn: "The Moon sign is the most forgiving of the three markers. It only shifts if you were born close to a sign change, so an approximate time is usually enough — unlike the ascendant, which needs real precision.",
        mythHi: "यदि जन्म का सटीक समय ज्ञात न हो तो चन्द्र राशि अविश्वसनीय है।",
        realityHi: "तीनों संकेतकों में चन्द्र राशि सबसे सहनशील है। यह तभी बदलती है जब जन्म राशि-संक्रमण के निकट हुआ हो, अतः अनुमानित समय भी प्रायः पर्याप्त है — लग्न की भाँति इसमें अत्यधिक सूक्ष्मता आवश्यक नहीं।",
      },
    ],
    perspectiveEn:
      "Use the Moon sign as a starting point rather than a conclusion. If it describes you well, it is telling you something real about how you process feeling; if it does not, the chart has other factors doing more of the work, and that is common. For questions that actually matter to you — timing, relationships, a decision you are weighing — a qualified astrologer reading the whole chart will say far more than one sign ever can.",
    perspectiveHi:
      "चन्द्र राशि को निष्कर्ष नहीं, आरम्भ-बिन्दु मानें। यदि यह आप पर ठीक बैठती है तो यह आपके भाव-संसार के विषय में कुछ सच बता रही है; यदि नहीं, तो कुंडली के अन्य कारक अधिक प्रभावी हैं — ऐसा प्रायः होता है। जो प्रश्न वास्तव में महत्त्वपूर्ण हैं — समय, सम्बन्ध, कोई निर्णय — उनके लिए पूरी कुंडली देखकर योग्य ज्योतिषी एक राशि से कहीं अधिक बता सकते हैं।",
  },

  "sun-sign": {
    whatEn:
      "This is the sign the Sun occupied at your birth, measured sidereally — against the fixed stars — using the Lahiri ayanamsa. It is not the sign printed in newspaper horoscopes. Those use the tropical zodiac, which is anchored to the equinox rather than to the stars, and the two have drifted roughly twenty-four degrees apart over the centuries. That drift is why your Vedic Sun sign is usually the one before your familiar Western sign.",
    whatHi:
      "यह वह राशि है जिसमें जन्म के समय सूर्य स्थित था — स्थिर नक्षत्रों के सापेक्ष, लाहिरी अयनांश से मापी गई। यह समाचार-पत्रों के राशिफल वाली राशि नहीं है। वे सायन पद्धति पर आधारित हैं, जो नक्षत्रों के नहीं बल्कि विषुव के सापेक्ष स्थिर है, और शताब्दियों में दोनों में लगभग चौबीस अंश का अन्तर आ चुका है। इसी अन्तर के कारण आपकी वैदिक सूर्य राशि प्रायः परिचित पाश्चात्य राशि से एक पूर्ववर्ती होती है।",
    meaningEn:
      "In Indian astrology the Sun stands for the self that acts in the world — vitality, authority, the father, and the sense of purpose a person carries. It is read as one of three anchors alongside the Moon sign and the ascendant, and it is given less weight here than in Western practice, where the Sun sign carries almost the whole popular reading. Treat it as one thread among several rather than as a summary of who you are.",
    meaningHi:
      "भारतीय ज्योतिष में सूर्य उस स्व का प्रतीक है जो संसार में कार्य करता है — ओज, अधिकार, पिता, और व्यक्ति का उद्देश्य-बोध। इसे चन्द्र राशि और लग्न के साथ तीन आधारों में से एक माना जाता है, और यहाँ इसे पाश्चात्य पद्धति की तुलना में कम भार दिया जाता है, जहाँ लोकप्रिय राशिफल लगभग पूर्णतः सूर्य राशि पर टिका है। इसे अपने परिचय का सार नहीं, अनेक सूत्रों में से एक मानें।",
    myths: [
      {
        mythEn: "The calculator has changed my sign, so it must be broken.",
        realityEn: "Nothing changed. You are seeing the sidereal position for the first time; the familiar one is tropical. Both are computed correctly from the same moment of birth using two different reference frames.",
        mythHi: "इस गणक ने मेरी राशि बदल दी, अतः इसमें त्रुटि है।",
        realityHi: "कुछ नहीं बदला। आप पहली बार निरयण स्थिति देख रहे हैं; परिचित राशि सायन है। दोनों एक ही जन्म-क्षण से, दो भिन्न सन्दर्भ-ढाँचों में, शुद्ध रूप से निकाली जाती हैं।",
      },
      {
        mythEn: "One of the two zodiacs must be the true one.",
        realityEn: "They answer different questions — one tracks the seasons, the other the stars — and each is internally consistent. Astrologers in both traditions read accurately within their own frame; mixing the two is what produces confusion.",
        mythHi: "दोनों में से कोई एक पद्धति ही सत्य होगी।",
        realityHi: "वे भिन्न प्रश्नों का उत्तर देती हैं — एक ऋतुओं का अनुसरण करती है, दूसरी नक्षत्रों का — और प्रत्येक अपने भीतर संगत है। दोनों परम्पराओं के ज्योतिषी अपने-अपने ढाँचे में शुद्ध पढ़ते हैं; भ्रम दोनों को मिलाने से उत्पन्न होता है।",
      },
    ],
    perspectiveEn:
      "If your Vedic Sun sign feels less familiar than the one you grew up with, that is expected and not a sign of error. Read it for what the Sun signifies here — direction, confidence, how you carry responsibility — and hold it alongside the Moon sign and ascendant rather than in place of them. If the difference between the two systems interests you, that curiosity is worth taking to someone who works in both.",
    perspectiveHi:
      "यदि आपकी वैदिक सूर्य राशि परिचित राशि से भिन्न लगे तो यह अपेक्षित है, त्रुटि का संकेत नहीं। इसे उसी अर्थ में पढ़ें जो यहाँ सूर्य का है — दिशा, आत्मविश्वास, उत्तरदायित्व वहन करने की शैली — और इसे चन्द्र राशि तथा लग्न के स्थान पर नहीं, उनके साथ रखें। यदि दोनों पद्धतियों का अन्तर रुचिकर लगे, तो यह जिज्ञासा किसी ऐसे व्यक्ति तक ले जाना उचित है जो दोनों में कार्य करते हों।",
  },

  lagna: {
    whatEn:
      "The Lagna, or ascendant, is the zodiac sign that was rising on the eastern horizon at your exact place and minute of birth. Because the earth turns, it moves through all twelve signs in a single day, changing roughly every two hours. That makes it the most time-sensitive figure in the whole chart, and the reason astrologers insist on an accurate birth time: it fixes the first house, and every other house is counted from there.",
    whatHi:
      "लग्न वह राशि है जो आपके जन्म के ठीक स्थान और मिनट पर पूर्वी क्षितिज पर उदय हो रही थी। पृथ्वी के घूर्णन के कारण यह एक ही दिन में बारहों राशियों से गुज़र जाती है और लगभग प्रति दो घंटे में बदलती है। इसी से यह पूरी कुंडली का सर्वाधिक समय-संवेदी अंग बनता है, और यही कारण है कि ज्योतिषी शुद्ध जन्म-समय पर बल देते हैं: लग्न प्रथम भाव को निश्चित करता है, और शेष सभी भाव वहीं से गिने जाते हैं।",
    meaningEn:
      "Where the Moon sign describes the inner weather, the ascendant describes the frame — physical constitution, outward manner, the impression you make before you speak, and the lens through which the rest of the chart is interpreted. Two people born on the same day with different ascendants get substantially different readings from the same planetary positions, because the houses land differently. It is the single most useful thing to get right.",
    meaningHi:
      "जहाँ चन्द्र राशि भीतर का मौसम बताती है, वहीं लग्न ढाँचा बताता है — शरीर-प्रकृति, बाह्य व्यवहार, बोलने से पहले पड़ने वाला प्रभाव, और वह दृष्टि जिससे शेष कुंडली पढ़ी जाती है। एक ही दिन जन्मे दो व्यक्तियों के लग्न भिन्न हों तो समान ग्रह-स्थितियों से भी पर्याप्त भिन्न फल निकलते हैं, क्योंकि भाव अलग बैठते हैं। शुद्ध रूप से जानने योग्य यह सबसे उपयोगी तत्त्व है।",
    myths: [
      {
        mythEn: "A rough birth time is good enough for the ascendant.",
        realityEn: "It often is not. The rising sign changes about every two hours, so an error of an hour or two can move it entirely and shift every house with it. If your recorded time is uncertain, treat the ascendant as provisional and say so.",
        mythHi: "लग्न के लिए अनुमानित जन्म-समय पर्याप्त है।",
        realityHi: "प्रायः पर्याप्त नहीं होता। लग्न लगभग प्रति दो घंटे बदलता है, अतः एक-दो घंटे की भूल उसे पूर्णतः बदल सकती है और उसके साथ सभी भाव खिसक जाते हैं। यदि अभिलिखित समय अनिश्चित हो तो लग्न को अस्थायी मानें और यह स्पष्ट कहें।",
      },
      {
        mythEn: "The ascendant sign alone tells you what you look like.",
        realityEn: "It contributes, but any planet sitting in or aspecting the first house changes the picture, and so does its ruling planet's placement. Appearance is read from a combination, not from the rising sign on its own.",
        mythHi: "केवल लग्न राशि से रूप-रंग जाना जा सकता है।",
        realityHi: "उसका योगदान होता है, किन्तु प्रथम भाव में स्थित या उस पर दृष्टि डालने वाला कोई भी ग्रह चित्र बदल देता है, और लग्नेश की स्थिति भी। रूप का विचार अकेली लग्न राशि से नहीं, अनेक कारकों के संयोग से किया जाता है।",
      },
    ],
    perspectiveEn:
      "If your birth time came from memory rather than a record, it is worth finding the certificate or hospital note before leaning on any reading built on the ascendant. Where no reliable time exists, astrologers work from the Moon sign instead and say plainly that the houses are uncertain — an honest limitation, and a better basis than a confident chart built on a guess.",
    perspectiveHi:
      "यदि जन्म-समय अभिलेख से नहीं, स्मृति से लिया गया है तो लग्न पर आधारित किसी भी विवेचन से पहले प्रमाण-पत्र या चिकित्सालय की पर्ची खोज लेना उचित है। जहाँ विश्वसनीय समय उपलब्ध न हो, वहाँ ज्योतिषी चन्द्र राशि से कार्य करते हैं और स्पष्ट कहते हैं कि भाव अनिश्चित हैं — यह ईमानदार सीमा है, और अनुमान पर खड़ी आत्मविश्वासी कुंडली से कहीं उत्तम आधार।",
  },

  nakshatra: {
    whatEn:
      "A nakshatra is one of twenty-seven segments the ecliptic is divided into, each spanning thirteen degrees and twenty minutes and named after the star group that marks it. Your birth nakshatra is the one the Moon occupied when you were born, and each is further divided into four quarters called padas. This lunar division is older in Indian practice than the twelve-sign zodiac, and a great deal is built on it — naming, matching and the whole dasha timing system.",
    whatHi:
      "नक्षत्र क्रान्तिवृत्त के सत्ताईस विभागों में से एक है; प्रत्येक तेरह अंश बीस कला का होता है और उसे चिह्नित करने वाले तारा-समूह के नाम पर रखा गया है। आपका जन्म नक्षत्र वह है जिसमें जन्म के समय चन्द्रमा था, और प्रत्येक नक्षत्र आगे चार चरणों (पाद) में विभक्त होता है। भारतीय परम्परा में यह चान्द्र विभाजन बारह राशियों से भी प्राचीन है, और इसी पर नामकरण, मिलान तथा सम्पूर्ण दशा-पद्धति आधारित है।",
    meaningEn:
      "The nakshatra is a finer reading of the Moon than the sign is — the sign gives a broad temperament, the nakshatra gives its particular flavour, and the pada narrows it further. It also carries the practical machinery of the chart: your starting dasha period is determined by which nakshatra the Moon was in and how far through it the Moon had travelled, which is why the exact degree matters more here than it does for the sign alone.",
    meaningHi:
      "नक्षत्र चन्द्रमा का राशि की अपेक्षा सूक्ष्म पाठ है — राशि व्यापक स्वभाव देती है, नक्षत्र उसका विशिष्ट रंग, और पाद उसे और सीमित करता है। कुंडली की व्यावहारिक रचना भी इसी पर टिकी है: आपकी आरम्भिक दशा इसी से निश्चित होती है कि चन्द्रमा किस नक्षत्र में और उसमें कितना आगे बढ़ चुका था — इसीलिए यहाँ सटीक अंश का महत्त्व केवल राशि की तुलना में कहीं अधिक है।",
    myths: [
      {
        mythEn: "Certain nakshatras are inauspicious to be born in.",
        realityEn: "Some carry traditional cautions about specific timings, and a few have observances attached to them, but none marks a person as unfortunate. The classical texts describe temperament and suitable activity, not a verdict on a life.",
        mythHi: "कुछ नक्षत्रों में जन्म लेना अशुभ होता है।",
        realityHi: "कुछ के साथ विशिष्ट समयों की परम्परागत सावधानियाँ जुड़ी हैं और कुछ के लिए विधान भी हैं, किन्तु कोई भी व्यक्ति को अभागा नहीं ठहराता। शास्त्र स्वभाव और उपयुक्त कर्म बताते हैं, जीवन पर निर्णय नहीं।",
      },
      {
        mythEn: "Matching nakshatras is enough to decide a marriage.",
        realityEn: "Nakshatra matching is one input among many. Traditional practice weighs the whole chart of both people, and most astrologers would not settle a marriage on the star count alone.",
        mythHi: "विवाह का निर्णय केवल नक्षत्र मिलान से हो सकता है।",
        realityHi: "नक्षत्र मिलान अनेक आधारों में से एक है। परम्परा दोनों की पूरी कुंडली पर विचार करती है, और अधिकांश ज्योतिषी केवल गुण-संख्या पर विवाह निश्चित नहीं करते।",
      },
    ],
    perspectiveEn:
      "The nakshatra is the most rewarding part of a chart to read about, because each one has a story, a ruling planet and a symbol behind it, and that context explains far more than a label. If you take one thing further, take this: read what your nakshatra traditionally signifies, and notice which parts fit and which do not. Where it bears on a real decision, a qualified astrologer will read it alongside the pada and the dasha.",
    perspectiveHi:
      "कुंडली में नक्षत्र ही पढ़ने में सबसे फलदायी अंग है, क्योंकि प्रत्येक के पीछे एक कथा, एक स्वामी ग्रह और एक प्रतीक है, और यही सन्दर्भ किसी नाम से कहीं अधिक बताता है। यदि एक ही विषय आगे बढ़ाना हो तो यही लें: अपने नक्षत्र का परम्परागत अर्थ पढ़ें और देखें कि क्या मेल खाता है और क्या नहीं। जहाँ किसी वास्तविक निर्णय से सम्बन्ध हो, वहाँ योग्य ज्योतिषी इसे पाद और दशा के साथ पढ़ेंगे।",
  },

  "baby-name": {
    whatEn:
      "Traditional Indian naming takes its first syllable from the quarter, or pada, of the nakshatra the Moon occupied at birth. Each of the twenty-seven nakshatras has four padas, giving one hundred and eight syllables in all, and the child's formal name is chosen to begin with the sound assigned to their own pada. The custom links the name to the Moon's exact position rather than to the day or the sign alone.",
    whatHi:
      "परम्परागत भारतीय नामकरण में पहला अक्षर उस नक्षत्र-चरण (पाद) से लिया जाता है जिसमें जन्म के समय चन्द्रमा था। सत्ताईस नक्षत्रों में से प्रत्येक के चार पाद होते हैं, अर्थात् कुल एक सौ आठ अक्षर, और बालक का औपचारिक नाम उसी के पाद को नियत अक्षर से आरम्भ किया जाता है। यह प्रथा नाम को दिन या राशि से नहीं, चन्द्रमा की सूक्ष्म स्थिति से जोड़ती है।",
    meaningEn:
      "The intent behind the custom is resonance rather than restriction: the sound is meant to sit well with the child's own lunar placement, and the naming ceremony is the occasion for it. In practice many families use the traditional syllable for the formal or ceremonial name and a freely chosen name at home, and both are considered entirely proper. The syllable is a guide offered by the tradition, not a requirement placed on the parents.",
    meaningHi:
      "इस प्रथा का आशय बन्धन नहीं, अनुरूपता है: ध्वनि ऐसी हो जो बालक की अपनी चान्द्र स्थिति से मेल खाए, और नामकरण संस्कार इसी का अवसर है। व्यवहार में अनेक परिवार परम्परागत अक्षर से औपचारिक या संस्कार-नाम रखते हैं और घर में स्वेच्छा से चुना नाम चलाते हैं; दोनों पूर्णतः उचित माने जाते हैं। यह अक्षर परम्परा का दिया मार्गदर्शन है, माता-पिता पर लगाया नियम नहीं।",
    myths: [
      {
        mythEn: "A name that does not start with the prescribed syllable will harm the child.",
        realityEn: "It will not. The syllable is a traditional convention for auspicious resonance, and countless people carry names chosen outside it. Families routinely keep a ceremonial name from the tradition and a everyday name of their own choosing.",
        mythHi: "निर्धारित अक्षर से आरम्भ न होने वाला नाम बालक के लिए हानिकर होता है।",
        realityHi: "ऐसा नहीं है। यह अक्षर शुभ अनुरूपता की परम्परागत रीति है, और असंख्य व्यक्तियों के नाम इससे भिन्न हैं। परिवार प्रायः परम्परा से संस्कार-नाम और अपनी रुचि से व्यवहार-नाम, दोनों रखते हैं।",
      },
      {
        mythEn: "Every source gives the same syllable, so a difference means an error.",
        realityEn: "Transliteration varies between regions and publications, and the same sound is written several ways. If two reliable sources differ in spelling but agree on the sound, they are not in conflict.",
        mythHi: "सभी स्रोत एक ही अक्षर देते हैं, अतः भिन्नता का अर्थ त्रुटि है।",
        realityHi: "लिप्यन्तरण क्षेत्र और प्रकाशन के अनुसार बदलता है, और एक ही ध्वनि कई प्रकार से लिखी जाती है। यदि दो विश्वसनीय स्रोत वर्तनी में भिन्न हों पर ध्वनि पर एकमत हों, तो उनमें विरोध नहीं है।",
      },
    ],
    perspectiveEn:
      "Treat the suggested sounds as a shortlist offered by the tradition, then choose a name you and your family will be glad to say for a lifetime. If the ceremonial name matters to your household, the family priest will confirm the syllable against your own reckoning, since regional conventions differ slightly on where a pada is taken to begin.",
    perspectiveHi:
      "सुझाई गई ध्वनियों को परम्परा की ओर से दी गई एक सूची मानें, और फिर वह नाम चुनें जिसे आप और आपका परिवार जीवन भर प्रसन्नता से पुकार सकें। यदि आपके घर में संस्कार-नाम का महत्त्व हो तो कुलपुरोहित आपकी अपनी गणना के अनुसार अक्षर की पुष्टि कर देंगे, क्योंकि पाद के आरम्भ को लेकर क्षेत्रीय रीतियों में थोड़ा अन्तर रहता है।",
  },

  "shraddha-tithi": {
    whatEn:
      "Shraddha, the annual remembrance of a parent or ancestor, is observed on the lunar day — the tithi — on which the death occurred, not on its date in the civil calendar. This calculator records that tithi together with its paksha, the bright or dark fortnight it falls in. Because the lunar and civil calendars run at different lengths, the observance moves through the civil year and rarely falls on the same date twice.",
    whatHi:
      "श्राद्ध, अर्थात् माता-पिता या पूर्वज का वार्षिक स्मरण, उसी तिथि को किया जाता है जिस तिथि को देहावसान हुआ था — प्रचलित कैलेण्डर की तारीख़ को नहीं। यह गणक उसी तिथि को उसके पक्ष सहित अंकित करता है, अर्थात् शुक्ल या कृष्ण। चान्द्र और सौर गणनाओं की लम्बाई भिन्न होने से यह अनुष्ठान प्रचलित वर्ष में आगे-पीछे खिसकता रहता है और प्रायः एक ही तारीख़ पर दुबारा नहीं पड़ता।",
    meaningEn:
      "Knowing the tithi is what lets a family observe the rite on the correct day each year, and it is also what identifies the day during Pitru Paksha, the fortnight set aside for ancestral remembrance, when many households perform the annual shraddha together. Recording it once, accurately, saves the family from recalculating from memory later — which is the usual reason the day gets lost across generations.",
    meaningHi:
      "तिथि का ज्ञान ही परिवार को प्रतिवर्ष शुद्ध दिन पर अनुष्ठान करने देता है, और पितृ पक्ष — पूर्वजों के स्मरण हेतु नियत पक्ष — में भी वही दिन पहचानता है, जब अनेक परिवार वार्षिक श्राद्ध एक साथ करते हैं। इसे एक बार शुद्ध रूप से अंकित कर लेने पर परिवार को बाद में स्मृति के सहारे पुनर्गणना नहीं करनी पड़ती — पीढ़ियों में दिन प्रायः इसी कारण विस्मृत हो जाता है।",
    myths: [
      {
        mythEn: "The observance should be kept on the anniversary date in the civil calendar.",
        realityEn: "Tradition follows the lunar day, so the civil date will not usually match. Families who mark the civil anniversary as well are welcome to, but the rite itself is timed by the tithi.",
        mythHi: "यह अनुष्ठान प्रचलित कैलेण्डर की वर्षगाँठ की तारीख़ पर करना चाहिए।",
        realityHi: "परम्परा चान्द्र तिथि का अनुसरण करती है, अतः तारीख़ प्रायः मेल नहीं खाती। जो परिवार तारीख़ भी स्मरण रखना चाहें रख सकते हैं, किन्तु अनुष्ठान का काल तिथि से ही निश्चित होता है।",
      },
      {
        mythEn: "If the exact time of death is unknown, the tithi cannot be established.",
        realityEn: "An approximate time is usually workable, because a tithi lasts most of a day. It only becomes genuinely uncertain when the passing was close to a tithi change, and in that case the family priest decides by the customary rule.",
        mythHi: "यदि देहावसान का सटीक समय ज्ञात न हो तो तिथि निश्चित नहीं की जा सकती।",
        realityHi: "अनुमानित समय भी प्रायः पर्याप्त होता है, क्योंकि तिथि लगभग पूरे दिन रहती है। संशय तभी वास्तविक होता है जब देहावसान तिथि-परिवर्तन के निकट हुआ हो; ऐसी स्थिति में कुलपुरोहित प्रचलित नियम से निर्णय करते हैं।",
      },
    ],
    perspectiveEn:
      "Write the tithi and paksha down where the family will find them, alongside the civil date. Where the passing fell near a tithi change, or where your family follows a regional rule about which day is taken when a tithi spans two sunrises, the family priest is the right person to settle it — this is one of the places where local custom properly outweighs a general calculation.",
    perspectiveHi:
      "तिथि और पक्ष को तारीख़ के साथ वहाँ लिख रखें जहाँ परिवार को सहज मिल जाए। जहाँ देहावसान तिथि-परिवर्तन के निकट हुआ हो, अथवा जहाँ आपके कुल में यह नियम हो कि दो सूर्योदय तक फैली तिथि में कौन-सा दिन लिया जाए, वहाँ निर्णय कुलपुरोहित का है — यह उन विषयों में है जहाँ स्थानीय परम्परा सामान्य गणना से ऊपर मानी जाती है।",
    },

  "pancha-pakshi": {
    whatEn:
      "Pancha Pakshi is a timing system from the Tamil tradition in which a person is assigned one of five birds — vulture, owl, crow, cock or peacock — from their birth nakshatra and the fortnight they were born in. Each bird is held to pass through five states of activity across the day and night, and the system reads those states to judge which stretches of a day suit which kind of work.",
    whatHi:
      "पञ्च पक्षी तमिल परम्परा की एक काल-गणना पद्धति है जिसमें व्यक्ति को उसके जन्म नक्षत्र और जन्म के पक्ष से पाँच पक्षियों में से एक दिया जाता है — गिद्ध, उल्लू, कौआ, मुर्गा अथवा मोर। माना जाता है कि प्रत्येक पक्षी दिन-रात में पाँच अवस्थाओं से गुज़रता है, और यह पद्धति उन्हीं अवस्थाओं से यह विचार करती है कि दिन का कौन-सा भाग किस प्रकार के कार्य के अनुकूल है।",
    meaningEn:
      "Read it as a scheduling aid rather than a forecast: the states suggest when effort is likely to flow and when it may meet friction, and practitioners use it to place demanding work, conversations or travel. It is worth being clear about its standing — this is a regional system with its own literature, distinct from the mainstream Parashari framework that governs the rest of a birth chart, and the two are not read against each other.",
    meaningHi:
      "इसे भविष्यवाणी नहीं, दिनचर्या नियोजित करने का साधन मानें: अवस्थाएँ यह संकेत देती हैं कि प्रयास कब सहज बहेगा और कब अवरोध मिल सकता है, और अभ्यासी इसी से कठिन कार्य, वार्तालाप अथवा यात्रा का समय नियत करते हैं। इसकी स्थिति स्पष्ट रहनी चाहिए — यह अपने पृथक् साहित्य वाली क्षेत्रीय पद्धति है, जो शेष जन्म-कुंडली को नियन्त्रित करने वाले मुख्यधारा के पराशर ढाँचे से भिन्न है, और दोनों एक-दूसरे के सापेक्ष नहीं पढ़ी जातीं।",
    myths: [
      {
        mythEn: "A weak state in the cycle means the hours are unsafe.",
        realityEn: "The system describes relative ease, not danger. A less favourable stretch is a suggestion to place routine work there rather than a warning to stop, and nothing in the tradition asks anyone to sit idle.",
        mythHi: "चक्र में क्षीण अवस्था का अर्थ है कि वे घंटे असुरक्षित हैं।",
        realityHi: "यह पद्धति सापेक्ष सुगमता बताती है, संकट नहीं। कम अनुकूल काल में सामान्य कार्य रखने का सुझाव है, रुक जाने की चेतावनी नहीं; परम्परा में कहीं निष्क्रिय बैठने को नहीं कहा गया।",
      },
      {
        mythEn: "Pancha Pakshi should agree with the muhurat from the birth chart.",
        realityEn: "The two come from separate systems with separate rules, so they will sometimes point different ways. Most practitioners pick one framework for a given decision instead of trying to satisfy both.",
        mythHi: "पञ्च पक्षी का फल जन्म-कुंडली के मुहूर्त से मेल खाना चाहिए।",
        realityHi: "दोनों भिन्न नियमों वाली पृथक् पद्धतियाँ हैं, अतः कभी-कभी उनका संकेत भिन्न होगा। अधिकांश अभ्यासी किसी एक निर्णय के लिए एक ही ढाँचा चुनते हैं, दोनों को साधने का प्रयास नहीं करते।",
      },
    ],
    perspectiveEn:
      "If the system interests you, use it the way its own practitioners do — to arrange a day, over a period long enough to notice whether it matches your experience. Because conventions differ between regional lineages on how the states are counted, someone trained in the Tamil tradition is the right person to ask before you rely on it for anything consequential.",
    perspectiveHi:
      "यदि यह पद्धति रुचिकर लगे तो उसी प्रकार प्रयोग करें जैसे इसके अभ्यासी करते हैं — दिन नियोजित करने हेतु, और इतने काल तक कि आप स्वयं देख सकें कि यह आपके अनुभव से मेल खाती है या नहीं। अवस्थाओं की गणना को लेकर क्षेत्रीय परम्पराओं में भेद है, अतः किसी महत्त्वपूर्ण विषय में इस पर निर्भर होने से पूर्व तमिल परम्परा में प्रशिक्षित व्यक्ति से पूछना उचित है।",
  },

  "western-natal": {
    whatEn:
      "This reads your chart in the tropical zodiac used in Western astrology, which measures from the equinox rather than from the fixed stars. It reports the Sun, Moon and rising sign — the “big three” — along with the major angular relationships between planets. It sits deliberately apart from the rest of Ganak, which is sidereal: the same birth moment, read in a different reference frame and a different interpretive tradition.",
    whatHi:
      "यह आपकी कुंडली को पाश्चात्य ज्योतिष की सायन पद्धति में पढ़ता है, जो स्थिर नक्षत्रों से नहीं, विषुव से मापती है। इसमें सूर्य, चन्द्र और लग्न — तीन प्रमुख — तथा ग्रहों के बीच के मुख्य कोणीय सम्बन्ध बताए जाते हैं। यह गणक के शेष भाग से जानबूझकर पृथक् रखा गया है, जो निरयण है: वही जन्म-क्षण, किन्तु भिन्न सन्दर्भ-ढाँचे और भिन्न व्याख्या-परम्परा में पढ़ा गया।",
    meaningEn:
      "Western practice weighs the Sun sign heavily, treats the Moon as the emotional life and the ascendant as the outward manner, and reads the aspects between planets as the main engine of interpretation. If you have followed Western astrology before, this will look familiar in a way the sidereal pages do not. Treat it as a second lens on the same birth rather than as a check on the Vedic result.",
    meaningHi:
      "पाश्चात्य परम्परा सूर्य राशि को अधिक भार देती है, चन्द्रमा को भाव-जगत् और लग्न को बाह्य व्यवहार मानती है, तथा ग्रहों के परस्पर कोणों को व्याख्या का मुख्य आधार बनाती है। यदि आपने पहले पाश्चात्य ज्योतिष देखा हो तो यह परिचित लगेगा, जबकि निरयण पृष्ठ नहीं। इसे वैदिक फल की जाँच नहीं, उसी जन्म पर दूसरी दृष्टि मानें।",
    myths: [
      {
        mythEn: "If the Western and Vedic readings disagree, one of them is wrong.",
        realityEn: "They are different systems with different zodiacs, house methods and interpretive rules, so disagreement is normal. Each is coherent within itself, and neither is a test of the other.",
        mythHi: "यदि पाश्चात्य और वैदिक फल भिन्न हों तो उनमें से एक ग़लत है।",
        realityHi: "ये भिन्न राशि-चक्र, भिन्न भाव-पद्धति और भिन्न व्याख्या-नियमों वाली अलग प्रणालियाँ हैं, अतः भिन्नता स्वाभाविक है। प्रत्येक अपने भीतर संगत है, और कोई दूसरे की कसौटी नहीं।",
      },
      {
        mythEn: "You can improve accuracy by blending the two systems.",
        realityEn: "Mixing frames tends to produce contradictions rather than precision, because each rule assumes the zodiac it was written for. Practitioners who work in both keep them separate and say which one they are using.",
        mythHi: "दोनों पद्धतियों को मिलाकर शुद्धता बढ़ाई जा सकती है।",
        realityHi: "ढाँचों को मिलाने से सूक्ष्मता नहीं, विरोधाभास उत्पन्न होते हैं, क्योंकि प्रत्येक नियम उसी राशि-चक्र को मानकर लिखा गया है जिसके लिए वह बना। दोनों में कार्य करने वाले उन्हें पृथक् रखते हैं और बताते हैं कि वे किसका प्रयोग कर रहे हैं।",
      },
    ],
    perspectiveEn:
      "Use this page if Western astrology is the language you already read in, and use the sidereal pages if you want the tradition the rest of Ganak is built on. Keeping them apart is the honest approach, and it is why they are presented separately here. If you want a considered reading in either tradition, that is work for a practitioner trained in that specific system.",
    perspectiveHi:
      "यदि पाश्चात्य ज्योतिष ही वह भाषा है जिसमें आप पहले से पढ़ते हैं तो यह पृष्ठ प्रयोग करें, और यदि उस परम्परा को चाहते हैं जिस पर गणक का शेष भाग खड़ा है तो निरयण पृष्ठ। दोनों को पृथक् रखना ही ईमानदार मार्ग है, और इसीलिए यहाँ वे अलग-अलग प्रस्तुत हैं। किसी भी परम्परा में विचारपूर्ण विवेचन चाहिए तो वह उसी पद्धति में प्रशिक्षित अभ्यासी का कार्य है।",
  },

  "western-relationship": {
    whatEn:
      "This compares two birth charts in the Western tradition using two standard techniques. Synastry looks at the angles formed between one person's planets and the other's, which is read as the texture of the contact between them. The composite takes the midpoints between the two charts to describe the relationship as a thing in its own right, separate from either person.",
    whatHi:
      "यह दो जन्म-कुंडलियों की तुलना पाश्चात्य परम्परा की दो प्रचलित विधियों से करता है। संयुति-विचार में एक व्यक्ति के ग्रहों और दूसरे के ग्रहों के बीच बनने वाले कोण देखे जाते हैं, जिन्हें दोनों के सम्बन्ध की बनावट माना जाता है। मध्यबिन्दु-विधि दोनों कुंडलियों के मध्यबिन्दु लेकर सम्बन्ध को स्वयं एक स्वतन्त्र इकाई के रूप में वर्णित करती है, किसी एक व्यक्ति से अलग।",
    meaningEn:
      "Read the result as a description of dynamics, not a score. Contacts that traditional texts call difficult often mark the places where two people affect each other most, and long partnerships very commonly contain them. What such a reading can usefully show is where ease is likely and where attention will be needed — which is a conversation starter, not a conclusion about whether two people belong together.",
    meaningHi:
      "फल को अंक नहीं, गतिशीलता का वर्णन मानें। जिन सम्बन्धों को परम्परागत ग्रन्थ कठिन कहते हैं, वे प्रायः वही स्थान होते हैं जहाँ दो व्यक्ति एक-दूसरे को सर्वाधिक प्रभावित करते हैं, और दीर्घ सम्बन्धों में वे बहुधा उपस्थित रहते हैं। ऐसा विवेचन इतना बता सकता है कि सहजता कहाँ सम्भव है और ध्यान कहाँ अपेक्षित — यह संवाद का आरम्भ है, दो व्यक्तियों के साथ होने पर निर्णय नहीं।",
    myths: [
      {
        mythEn: "A difficult synastry means the relationship should not go ahead.",
        realityEn: "Charts describe tendencies, not outcomes. People with challenging contacts build lasting partnerships all the time, and what actually decides it is how two people treat each other.",
        mythHi: "कठिन संयुति का अर्थ है कि सम्बन्ध आगे नहीं बढ़ाना चाहिए।",
        realityHi: "कुंडली प्रवृत्ति बताती है, परिणाम नहीं। कठिन सम्बन्ध-योग वाले व्यक्ति सदा ही दीर्घ साहचर्य बनाते रहे हैं, और वास्तविक निर्णायक यह है कि दोनों एक-दूसरे के साथ कैसा व्यवहार करते हैं।",
      },
      {
        mythEn: "This can be used in place of the Vedic matching used for marriage.",
        realityEn: "They are separate traditions answering the question differently, and the Vedic matching in Ganak is the one built for that purpose. Reading both is fine; substituting one for the other is not what either was designed for.",
        mythHi: "विवाह हेतु प्रयुक्त वैदिक मिलान के स्थान पर इसका उपयोग किया जा सकता है।",
        realityHi: "ये पृथक् परम्पराएँ हैं जो प्रश्न का उत्तर भिन्न रीति से देती हैं, और गणक में उपलब्ध वैदिक मिलान उसी प्रयोजन के लिए बना है। दोनों पढ़ना उचित है; एक को दूसरे का स्थानापन्न बनाना किसी की भी रचना का उद्देश्य नहीं।",
      },
    ],
    perspectiveEn:
      "Both people should consent to having their chart read — a relationship reading involves someone else's birth data, and that is theirs to share. Beyond that, take anything here as a prompt for reflection rather than a decision. For a question that genuinely matters to a partnership, an experienced practitioner reading both charts in full is worth far more than a summary.",
    perspectiveHi:
      "दोनों व्यक्तियों की सहमति से ही कुंडली देखी जानी चाहिए — सम्बन्ध-विचार में दूसरे के जन्म-विवरण सम्मिलित होते हैं, और उन्हें साझा करने का अधिकार उन्हीं का है। इसके अतिरिक्त, यहाँ जो मिले उसे निर्णय नहीं, चिन्तन का सूत्र मानें। जो प्रश्न सम्बन्ध के लिए वास्तव में महत्त्वपूर्ण हो, उसमें दोनों कुंडलियाँ पूर्णतः देखकर अनुभवी अभ्यासी का कहा सारांश से कहीं अधिक मूल्यवान है।",
  },
};
