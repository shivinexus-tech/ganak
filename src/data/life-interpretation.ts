// Answer-first life-interpretation copy for the Chart screen.
// Bilingual, sourced to Brihat Parashara Hora Shastra + Phaladeepika, written as
// ATTRIBUTION ("Classical texts associate…"), never as a second-person verdict.
// Index order matches NAKSHATRAS / SIGNS in src/engine/panchang.ts.
// Supersedes the old NAK_NOTE / SIGN_NOTE one-liners in ChartScreen.
// Copy revised 2026-07-24 (owner review, round 3): traits enriched from free written
// sources (.scratch/traits.md), plain active English, natural Hindi, guarded words.

type Bi = { en: string; hi: string };
type Status = "sourced" | "owner-verified";
export type NakTrait = { nature: Bi; strengths: Bi; source: string; status: Status };
export type SignTrait = { mind: Bi; relating: Bi; work: Bi; outward: Bi; source: string; status: Status };

// `source` is a shared-corpus attribution to these two canonical texts, not a
// per-claim page citation; `status: "sourced"` means "grounded in the classical
// texts", upgraded to "owner-verified" per entry after the owner review
// (plans/kundli-interpretation-review.md). Both are what the spec §4 intends.
const SRC = "Brihat Parashara Hora Shastra; Phaladeepika";

// 27 entries, index 0 = Ashwini … 26 = Revati.
export const NAKSHATRA_TRAITS: NakTrait[] = [
  { // 0 Ashwini
    nature: {
      en: "Classical texts tie Ashwini to the Ashwini Kumaras, the divine healers, and call it a swift, pioneering star. Those born under it are said to be quick to begin, confident and helpful, with an instinct to fix and heal — and an honest, straightforward streak that steers clear of drama.",
      hi: "शास्त्र अश्विनी को देव-वैद्य अश्विनी कुमारों से जोड़ते हैं और इसे एक तेज़, अग्रणी नक्षत्र कहते हैं। इसमें जन्मे लोग जल्दी शुरुआत करने वाले, आत्मविश्वासी और मददगार बताए गए हैं, जिनमें ठीक करने और चंगा करने की सहज लगन होती है — और एक सीधी, बेबाक फ़ितरत जो बनावट से दूर रहती है।",
    },
    strengths: {
      en: "Classical texts associate Ashwini with initiative and natural leadership, a healing touch, and a readiness to jump in and help — starting fast and coming to the rescue.",
      hi: "शास्त्र अश्विनी को पहल और सहज नेतृत्व, उपचार की समझ, और आगे बढ़कर मदद करने की तत्परता से जोड़ते हैं — जल्दी शुरुआत और तुरन्त सहायता।",
    },
    source: SRC, status: "sourced",
  },
  { // 1 Bharani
    nature: {
      en: "Classical texts place Bharani under Yama, keeper of limits and passage, ruled by Venus, and call it a star of strong creative force held under control. Those born under it are said to be strong-willed and enduring, feeling things at a volume that would floor most people yet carrying the weight without showing it.",
      hi: "शास्त्र भरणी को मर्यादा और संक्रमण के स्वामी यम के अधीन, शुक्र से शासित रखते हैं और इसे संयम में बँधी प्रबल रचना-शक्ति का नक्षत्र कहते हैं। इसमें जन्मे लोग दृढ़ इरादे वाले और सहनशील होते हैं, जो भावनाओं को इतनी गहराई से महसूस करते हैं कि औरों की हिम्मत जवाब दे जाए, फिर भी वह बोझ बिना जताए उठाए रखते हैं।",
    },
    strengths: {
      en: "Classical texts associate Bharani with fiery willpower and persistence, creative strength, a clear sense of right and wrong, and the loyalty to make others feel secure.",
      hi: "शास्त्र भरणी को प्रचण्ड इच्छाशक्ति और लगन, रचना-शक्ति, सही-ग़लत की साफ़ समझ, और अपनों को सुरक्षित महसूस कराने वाली वफ़ादारी से जोड़ते हैं।",
    },
    source: SRC, status: "sourced",
  },
  { // 2 Krittika
    nature: {
      en: "Classical texts tie Krittika to Agni, the sacred fire, and to the mothers who raised Kartikeya, and call it a sharp, refining star ruled by the Sun. Those born under it are said to have a keen, cutting intelligence that sees through pretence, paired with real warmth and the drive to perfect whatever they touch.",
      hi: "शास्त्र कृत्तिका को पवित्र अग्नि और कार्तिकेय का पालन करने वाली माताओं से जोड़ते हैं और इसे सूर्य से शासित एक तीखा, निखारने वाला नक्षत्र कहते हैं। इसमें जन्मे लोग पैनी, चीर देने वाली बुद्धि वाले होते हैं जो दिखावे के आर-पार देख लेती है, साथ ही उनमें सच्ची गर्मजोशी और हर चीज़ को बेहतरीन बनाने की लगन होती है।",
    },
    strengths: {
      en: "Classical texts associate Krittika with sharp judgement, a perfectionist eye that spots every flaw, protective courage, and a moral backbone that will speak hard truths.",
      hi: "शास्त्र कृत्तिका को पैनी समझ, हर कमी पकड़ लेने वाली सूक्ष्म दृष्टि, रक्षक साहस, और कड़वे सच कह देने वाली नैतिक दृढ़ता से जोड़ते हैं।",
    },
    source: SRC, status: "sourced",
  },
  { // 3 Rohini
    nature: {
      en: "Classical texts place Rohini under Prajapati the creator, ruled by the Moon, and call it the Moon's favourite star — one of growth, beauty and plenty. Those born under it are said to have a calm, magnetic charm and an unusually steady emotional core, drawn to comfort, art and anything that flourishes.",
      hi: "शास्त्र रोहिणी को सृष्टिकर्ता प्रजापति के अधीन, चन्द्र से शासित रखते हैं और इसे चन्द्र का सबसे प्रिय नक्षत्र कहते हैं — विकास, सुन्दरता और उपज का। इसमें जन्मे लोग शान्त, चुम्बकीय आकर्षण और असाधारण रूप से स्थिर भीतरी मन वाले होते हैं, जो आराम, कला और हर फलती-फूलती चीज़ की ओर खिंचते हैं।",
    },
    strengths: {
      en: "Classical texts associate Rohini with charisma, artistic gifts, a truthful and forgiving nature, and a sharp yet balanced mind that rarely holds a grudge.",
      hi: "शास्त्र रोहिणी को आकर्षण, कलात्मक प्रतिभा, सच्चे और क्षमाशील स्वभाव, और एक पैनी पर सन्तुलित बुद्धि से जोड़ते हैं जो शायद ही कोई बैर पालती है।",
    },
    source: SRC, status: "sourced",
  },
  { // 4 Mrigashira
    nature: {
      en: "Classical texts tie Mrigashira to Soma and to the sign of a deer's head, ruled by Mars, and call it a gentle, searching star. Those born under it are said to be curious, alert and soft-spoken seekers — gentle and charming on the surface, yet able to turn firm when something they believe in is at stake.",
      hi: "शास्त्र मृगशिरा को सोम और मृग-मस्तक के चिह्न से जोड़ते हैं और इसे मंगल से शासित एक कोमल, खोजी नक्षत्र कहते हैं। इसमें जन्मे लोग जिज्ञासु, सतर्क और नरम बोलने वाले खोजी होते हैं — ऊपर से कोमल और आकर्षक, फिर भी जब अपने किसी सिद्धान्त की बात आए तो अड़ जाने वाले।",
    },
    strengths: {
      en: "Classical texts associate Mrigashira with quick learning, a gift for language and communication, and a perceptive gentleness that puts others at ease.",
      hi: "शास्त्र मृगशिरा को तेज़ी से सीखने, भाषा और संवाद की प्रतिभा, और दूसरों को सहज कर देने वाली सूक्ष्म कोमलता से जोड़ते हैं।",
    },
    source: SRC, status: "sourced",
  },
  { // 5 Ardra
    nature: {
      en: "Classical texts place Ardra under Rudra, the storm that clears the air, ruled by Rahu, and call it a star of depth and change. Those born under it are said to feel intensely and think with a sharp, penetrating mind — hard to read from outside, drawn to science and getting to the bottom of things, and able to remake themselves completely after each upheaval.",
      hi: "शास्त्र आर्द्रा को हवा साफ़ करने वाले तूफ़ान रुद्र के अधीन, राहु से शासित रखते हैं और इसे गहराई और बदलाव का नक्षत्र कहते हैं। इसमें जन्मे लोग गहराई से महसूस करते और पैनी, भेदक बुद्धि से सोचते हैं — बाहर से समझना मुश्किल, विज्ञान और तह तक पहुँचने की ओर झुके, और हर उथल-पुथल के बाद ख़ुद को पूरी तरह नए सिरे से गढ़ लेने वाले।",
    },
    strengths: {
      en: "Classical texts associate Ardra with a sharp, analytical mind, a leaning toward science and problem-solving, the courage to face upheaval, and the rare power to rebuild from the ground up.",
      hi: "शास्त्र आर्द्रा को पैनी, विश्लेषण करती बुद्धि, विज्ञान और समस्या सुलझाने की ओर झुकाव, उथल-पुथल का सामना करने के साहस, और शून्य से फिर खड़े होने की दुर्लभ ताक़त से जोड़ते हैं।",
    },
    source: SRC, status: "sourced",
  },
  { // 6 Punarvasu
    nature: {
      en: "Classical texts tie Punarvasu to Aditi, mother of the gods, ruled by Jupiter, and call it the star of return — of light coming back after dark. Those born under it are said to be optimistic, wise and adaptable, staying diplomatic and open-hearted, and able to begin again after any setback.",
      hi: "शास्त्र पुनर्वसु को देवमाता अदिति से जोड़ते हैं और इसे बृहस्पति से शासित, लौटने का नक्षत्र कहते हैं — अँधेरे के बाद रौशनी की वापसी। इसमें जन्मे लोग आशावादी, समझदार और लचीले होते हैं, जो कूटनीतिक और खुले दिल के रहते हैं, और किसी भी झटके के बाद फिर से शुरुआत कर लेते हैं।",
    },
    strengths: {
      en: "Classical texts associate Punarvasu with resilience and a strong memory, a gift for teaching and counselling, and the grace to bounce back from any failure without bitterness.",
      hi: "शास्त्र पुनर्वसु को सहनशीलता और अच्छी याददाश्त, पढ़ाने और परामर्श देने की क्षमता, और किसी भी असफलता से बिना कड़वाहट उबर आने की सहजता से जोड़ते हैं।",
    },
    source: SRC, status: "sourced",
  },
  { // 7 Pushya
    nature: {
      en: "Classical texts call Pushya the most nourishing of stars, tied to Brihaspati and ruled by Saturn — the one that feeds and sustains. Those born under it are said to be the emotional anchor of any family or team: caring and dependable, with a warmth that Saturn keeps wise, disciplined and steady.",
      hi: "शास्त्र पुष्य को सबसे पोषक नक्षत्र कहते हैं, जो बृहस्पति से जुड़ा और शनि से शासित है — जो पालता और सँभालता है। इसमें जन्मे लोग किसी भी परिवार या टोली के भावनात्मक आधार होते हैं: ख़याल रखने वाले और भरोसेमन्द, जिनकी गर्मजोशी को शनि समझदार, अनुशासित और स्थिर रखता है।",
    },
    strengths: {
      en: "Classical texts associate Pushya with caregiving through crisis, emotional wisdom in hard moments, a quiet spiritual steadiness, and an organised, focused mind.",
      hi: "शास्त्र पुष्य को संकट में देखभाल, कठिन घड़ी में भावनात्मक समझ, एक शान्त आध्यात्मिक स्थिरता, और व्यवस्थित, एकाग्र मन से जोड़ते हैं।",
    },
    source: SRC, status: "sourced",
  },
  { // 8 Ashlesha
    nature: {
      en: "Classical texts place Ashlesha under the Nagas, the serpent deities, ruled by Mercury, and call it a star of sharp insight and quiet mystery. Those born under it are said to feel deeply but hold it hidden, reading others closely from behind a guarded, hard-to-know exterior.",
      hi: "शास्त्र आश्लेषा को सर्प-देवता नागों के अधीन, बुध से शासित रखते हैं और इसे पैनी समझ और शान्त रहस्य का नक्षत्र कहते हैं। इसमें जन्मे लोग गहराई से महसूस करते हैं पर उसे छिपाए रखते हैं, एक सतर्क, मुश्किल से समझ आने वाले आवरण के पीछे से दूसरों को बारीक़ी से पढ़ते हुए।",
    },
    strengths: {
      en: "Classical texts associate Ashlesha with piercing insight and intuition, a gift for reading what lies beneath the surface, healing and counselling ability, and shrewd resourcefulness.",
      hi: "शास्त्र आश्लेषा को भेदक अन्तर्दृष्टि और सहज-बोध, सतह के नीचे छिपे को पढ़ने की क्षमता, उपचार व परामर्श की योग्यता, और चतुर सूझ-बूझ से जोड़ते हैं।",
    },
    source: SRC, status: "sourced",
  },
  { // 9 Magha
    nature: {
      en: "Classical texts tie Magha to the Pitris, the honoured ancestors, ruled by Ketu, with the throne as its sign, and call it a dignified, royal star. Those born under it are said to carry a natural, commanding presence and deep pride in their roots, with an instinctive feel for power, tradition and legacy.",
      hi: "शास्त्र मघा को पूज्य पूर्वजों पितरों से जोड़ते हैं और इसे केतु से शासित, सिंहासन जिसका चिह्न है — एक गरिमामय, राजसी नक्षत्र कहते हैं। इसमें जन्मे लोग एक सहज, रौबदार उपस्थिति और अपनी जड़ों पर गहरे गर्व के साथ आते हैं, जिनमें सत्ता, परम्परा और विरासत की सहज समझ होती है।",
    },
    strengths: {
      en: "Classical texts associate Magha with natural leadership, a strong sense of duty, generosity that provides security and status, and a drive to leave a lasting mark.",
      hi: "शास्त्र मघा को सहज नेतृत्व, प्रबल कर्तव्य-भाव, सुरक्षा और मान देने वाली उदारता, और कोई स्थायी छाप छोड़ने की लगन से जोड़ते हैं।",
    },
    source: SRC, status: "sourced",
  },
  { // 10 Purva Phalguni
    nature: {
      en: "Classical texts place Purva Phalguni under Bhaga, giver of delight and good fortune, ruled by Venus, and call it a star of pleasure, art and warmth. Those born under it are said to have a youthful zest for life and an easy, magnetic charm — friendly, affectionate, and quick to make any room feel warmer.",
      hi: "शास्त्र पूर्वाफाल्गुनी को आनन्द और सौभाग्य के दाता भग के अधीन, शुक्र से शासित रखते हैं और इसे सुख, कला और गर्मजोशी का नक्षत्र कहते हैं। इसमें जन्मे लोग जीवन के प्रति एक जवाँ उमंग और सहज, चुम्बकीय आकर्षण वाले होते हैं — मिलनसार, स्नेही, और किसी भी महफ़िल को पल भर में गर्म कर देने वाले।",
    },
    strengths: {
      en: "Classical texts associate Purva Phalguni with creative and artistic talent — design, music, dance — generosity, and a warmth that treats bringing joy almost as a discipline.",
      hi: "शास्त्र पूर्वाफाल्गुनी को रचनात्मक और कलात्मक प्रतिभा — डिज़ाइन, संगीत, नृत्य — उदारता, और उस गर्मजोशी से जोड़ते हैं जो ख़ुशी बाँटने को लगभग एक साधना मान लेती है।",
    },
    source: SRC, status: "sourced",
  },
  { // 11 Uttara Phalguni
    nature: {
      en: "Classical texts tie Uttara Phalguni to Aryaman, keeper of friendship and honoured promises, ruled by the Sun, and call it a star of steady support. Those born under it are said to be dependable and fair, well-liked and generous, with a deep need to be useful and to keep every commitment they make.",
      hi: "शास्त्र उत्तराफाल्गुनी को मित्रता और वचन के रक्षक अर्यमा से जोड़ते हैं और इसे सूर्य से शासित, स्थिर सहारे का नक्षत्र कहते हैं। इसमें जन्मे लोग भरोसेमन्द और निष्पक्ष, सबके प्रिय और उदार होते हैं, जिनमें काम आने और अपना हर वचन निभाने की गहरी चाह होती है।",
    },
    strengths: {
      en: "Classical texts associate Uttara Phalguni with loyalty and fairness, a talent for building lasting, dependable structures, and hard-working ambition guided by wisdom rather than impulse.",
      hi: "शास्त्र उत्तराफाल्गुनी को वफ़ादारी और निष्पक्षता, टिकाऊ, भरोसेमन्द व्यवस्था बनाने की क्षमता, और आवेग नहीं बल्कि समझदारी से चलने वाली मेहनती महत्वाकांक्षा से जोड़ते हैं।",
    },
    source: SRC, status: "sourced",
  },
  { // 12 Hasta
    nature: {
      en: "Classical texts place Hasta under Savitar, the inspiring Sun, ruled by the Moon, with the open hand as its sign, and call it a star of skill and craft. Those born under it are said to be gifted with their hands and quick of mind — resourceful and self-controlled, able to catch an idea and shape it into something real.",
      hi: "शास्त्र हस्त को प्रेरक सूर्य सवितृ के अधीन, चन्द्र से शासित रखते हैं और इसे खुला हाथ जिसका चिह्न है — कौशल और कारीगरी का नक्षत्र कहते हैं। इसमें जन्मे लोग हाथ के हुनर और तेज़ दिमाग़ वाले होते हैं — साधन-सम्पन्न और आत्म-संयमी, जो किसी विचार को पकड़कर उसे असली रूप दे देते हैं।",
    },
    strengths: {
      en: "Classical texts associate Hasta with exceptional hand skill and fine detail, quick-thinking problem-solving, and a rare blend of emotional sensitivity with analytical precision.",
      hi: "शास्त्र हस्त को असाधारण हस्त-कौशल और बारीक़ी, तेज़ सोच वाली समस्या-समाधान क्षमता, और भावनात्मक संवेदनशीलता व विश्लेषणात्मक सटीकता के दुर्लभ मेल से जोड़ते हैं।",
    },
    source: SRC, status: "sourced",
  },
  { // 13 Chitra
    nature: {
      en: "Classical texts tie Chitra to Tvashtar, the heavenly maker, ruled by Mars, with a bright jewel as its sign, and call it a star of design and shine. Those born under it are said to be artistic and striking, with a sharp eye for form and beauty, and a Mars-given courage that isn't afraid to take a risk.",
      hi: "शास्त्र चित्रा को दिव्य शिल्पी त्वष्टा से जोड़ते हैं और इसे मंगल से शासित, चमकता रत्न जिसका चिह्न है — रचना और चमक का नक्षत्र कहते हैं। इसमें जन्मे लोग कलात्मक और प्रभावशाली होते हैं, जिनकी रूप और सुन्दरता पर पैनी नज़र होती है, और मंगल से मिला वह साहस जो जोखिम उठाने से नहीं डरता।",
    },
    strengths: {
      en: "Classical texts associate Chitra with a powerful creative vision, real talent in design and the arts, and the drive to break down what's stale and rebuild it better.",
      hi: "शास्त्र चित्रा को प्रबल रचनात्मक दृष्टि, डिज़ाइन और कलाओं में सच्ची प्रतिभा, और जो जीर्ण है उसे तोड़कर बेहतर बनाने की लगन से जोड़ते हैं।",
    },
    source: SRC, status: "sourced",
  },
  { // 14 Swati
    nature: {
      en: "Classical texts place Swati under Vayu, the wind, ruled by Rahu, with a young shoot swaying freely as its sign, and call it a star of independence — its very name means 'self-going'. Those born under it are said to be free-spirited, refined and idealistic, holding their own direction and disliking being controlled or rushed.",
      hi: "शास्त्र स्वाति को वायु के अधीन, राहु से शासित रखते हैं और इसे स्वतन्त्र रूप से झूमता कोमल अंकुर जिसका चिह्न है — स्वतन्त्रता का नक्षत्र कहते हैं, जिसका नाम ही 'स्वयं-गामी' है। इसमें जन्मे लोग स्वच्छन्द, परिष्कृत और आदर्शवादी होते हैं, जो अपनी दिशा ख़ुद तय करते हैं और नियन्त्रण या जल्दबाज़ी नापसन्द करते हैं।",
    },
    strengths: {
      en: "Classical texts associate Swati with diplomacy and mediation, a head for business and trade, wind-like adaptability, and the self-sufficiency to make one's own way.",
      hi: "शास्त्र स्वाति को कूटनीति और मध्यस्थता, व्यापार की सूझ, हवा-सी अनुकूलनशीलता, और अपना रास्ता ख़ुद बनाने की आत्मनिर्भरता से जोड़ते हैं।",
    },
    source: SRC, status: "sourced",
  },
  { // 15 Vishakha
    nature: {
      en: "Classical texts tie Vishakha to Indra and Agni, ruled by Jupiter, with a victory gateway as its sign, and call it a star of firm purpose. Those born under it are said to be ambitious and sharp, quick to size up a situation, and willing to work long and patiently toward a single chosen goal.",
      hi: "शास्त्र विशाखा को इन्द्र और अग्नि से जोड़ते हैं और इसे बृहस्पति से शासित, विजय-द्वार जिसका चिह्न है — पक्के इरादे का नक्षत्र कहते हैं। इसमें जन्मे लोग महत्वाकांक्षी और तेज़ होते हैं, किसी भी हालात को झट से भाँप लेने वाले, और एक चुने हुए लक्ष्य के लिए लम्बे समय तक धीरज से मेहनत करने को तैयार।",
    },
    strengths: {
      en: "Classical texts associate Vishakha with goal-locked determination and patience, leadership and influence, and a knack for finding one purpose early and pursuing it relentlessly.",
      hi: "शास्त्र विशाखा को लक्ष्य पर टिके दृढ़ निश्चय और धीरज, नेतृत्व और प्रभाव, और जल्दी ही एक उद्देश्य चुनकर उसके पीछे अनथक लगे रहने की क्षमता से जोड़ते हैं।",
    },
    source: SRC, status: "sourced",
  },
  { // 16 Anuradha
    nature: {
      en: "Classical texts place Anuradha under Mitra, the god of friendship, ruled by Saturn, and call it a star of devotion and fellowship. Those born under it are said to be loyal and disciplined of heart — reserved at first, then warm — able to build community and deep friendships even far from home.",
      hi: "शास्त्र अनुराधा को मित्रता के देवता मित्र के अधीन, शनि से शासित रखते हैं और इसे भक्ति और साथ-निभाव का नक्षत्र कहते हैं। इसमें जन्मे लोग वफ़ादार और अनुशासित दिल वाले होते हैं — पहले संयमित, फिर गर्मजोश — जो घर से दूर रहकर भी समुदाय और गहरी दोस्तियाँ बना लेते हैं।",
    },
    strengths: {
      en: "Classical texts associate Anuradha with organisational brilliance, a rare gift for friendship and community, patience and cooperation, and the ability to make something beautiful out of hardship.",
      hi: "शास्त्र अनुराधा को संगठन-कुशलता, मित्रता और समुदाय बनाने की दुर्लभ क्षमता, धीरज और सहयोग, और कठिनाई से कुछ सुन्दर रच लेने की योग्यता से जोड़ते हैं।",
    },
    source: SRC, status: "sourced",
  },
  { // 17 Jyeshtha
    nature: {
      en: "Classical texts tie Jyeshtha to Indra, king of the gods, ruled by Mercury, and call it the eldest star, marked by seniority and responsibility. Those born under it are said to be protective and intense, carrying the elder's load, with a blend of real strength and hidden sensitivity.",
      hi: "शास्त्र ज्येष्ठा को देवराज इन्द्र से जोड़ते हैं और इसे बुध से शासित, सबसे बड़ा नक्षत्र कहते हैं — जिस पर बड़प्पन और ज़िम्मेदारी का भाव है। इसमें जन्मे लोग रक्षक और गहरे होते हैं, जो बड़े होने का बोझ उठाते हैं, और जिनमें सच्ची मज़बूती व छिपी हुई संवेदनशीलता दोनों होती हैं।",
    },
    strengths: {
      en: "Classical texts associate Jyeshtha with protective leadership and sharp decisions, resourcefulness under pressure, and the power to rise and triumph over adversity.",
      hi: "शास्त्र ज्येष्ठा को रक्षक नेतृत्व और पैने निर्णय, दबाव में सूझ-बूझ, और विपत्ति पर उठकर विजय पाने की शक्ति से जोड़ते हैं।",
    },
    source: SRC, status: "sourced",
  },
  { // 18 Mula
    nature: {
      en: "Classical texts place Mula under Nirriti, the power that clears the old away, ruled by Ketu, with a bundle of roots as its sign, and call it a star of getting to the root of things. Those born under it are said to have a restless honesty that tears down comfortable illusions to find what is genuinely real.",
      hi: "शास्त्र मूल को पुराने को हटाने वाली शक्ति निरृति के अधीन, केतु से शासित रखते हैं और इसे जड़ों का गुच्छा जिसका चिह्न है — जड़ तक पहुँचने का नक्षत्र कहते हैं। इसमें जन्मे लोगों में एक बेचैन सच्चाई होती है जो आरामदेह भ्रमों को ढहाकर वह खोज निकालती है जो सचमुच असली है।",
    },
    strengths: {
      en: "Classical texts associate Mula with deep investigation and root-cause healing — an affinity for medicine, herbs and research — and the nerve to rebuild foundations from scratch.",
      hi: "शास्त्र मूल को गहरी छानबीन और जड़-कारण तक जाकर उपचार — चिकित्सा, जड़ी-बूटी और शोध में रुचि — और आधार को शून्य से फिर खड़ा करने के साहस से जोड़ते हैं।",
    },
    source: SRC, status: "sourced",
  },
  { // 19 Purva Ashadha
    nature: {
      en: "Classical texts tie Purva Ashadha to Apas, the first waters, ruled by Venus, and call it a star named for early victory. Those born under it are said to have an almost invincible optimism and unshakeable conviction, winning people over by charm rather than force.",
      hi: "शास्त्र पूर्वाषाढ़ा को आदि जल आप् से जोड़ते हैं और इसे शुक्र से शासित, जल्दी मिलने वाली जीत का नक्षत्र कहते हैं। इसमें जन्मे लोगों में लगभग अजेय आशावाद और अडिग विश्वास होता है, जो लोगों को ज़ोर से नहीं, अपने आकर्षण से अपना बना लेते हैं।",
    },
    strengths: {
      en: "Classical texts associate Purva Ashadha with persuasive speech that can sway a crowd, emotional resilience that rarely accepts defeat, and a mix of charm and determination.",
      hi: "शास्त्र पूर्वाषाढ़ा को भीड़ को मोड़ देने वाली प्रभावशाली वाणी, हार शायद ही मानने वाली सहनशीलता, और आकर्षण व दृढ़ता के मेल से जोड़ते हैं।",
    },
    source: SRC, status: "sourced",
  },
  { // 20 Uttara Ashadha
    nature: {
      en: "Classical texts place Uttara Ashadha under the Vishvadevas, the universal gods, ruled by the Sun, and call it a star of lasting victory won honestly. Those born under it are said to be stable and principled — modest and soft-spoken in daily life, yet unbending in the face of adversity.",
      hi: "शास्त्र उत्तराषाढ़ा को सार्वभौमिक देवों विश्वेदेवा के अधीन, सूर्य से शासित रखते हैं और इसे ईमानदारी से मिली टिकाऊ जीत का नक्षत्र कहते हैं। इसमें जन्मे लोग स्थिर और उसूलों वाले होते हैं — रोज़मर्रा में विनम्र और नरम बोलने वाले, फिर भी विपत्ति के सामने अडिग।",
    },
    strengths: {
      en: "Classical texts associate Uttara Ashadha with disciplined persistence that quietly ends in authority, principled willpower, and a steady optimism that carries it through hard times.",
      hi: "शास्त्र उत्तराषाढ़ा को अनुशासित लगन से जोड़ते हैं जो चुपचाप अधिकार तक पहुँचाती है, उसूलों वाली इच्छाशक्ति, और मुश्किल दौर से पार ले जाने वाला स्थिर आशावाद।",
    },
    source: SRC, status: "sourced",
  },
  { // 21 Shravana
    nature: {
      en: "Classical texts tie Shravana to Vishnu, ruled by the Moon, with the ear as its sign, and call it the listening star. Those born under it are said to be calm, empathetic listeners who take in more than they say, learning by hearing and seeing the world from everyone's point of view.",
      hi: "शास्त्र श्रवण को विष्णु से जोड़ते हैं और इसे चन्द्र से शासित, कान जिसका चिह्न है — सुनने का नक्षत्र कहते हैं। इसमें जन्मे लोग शान्त, सहानुभूति भरे श्रोता होते हैं जो कहने से ज़्यादा ग्रहण करते हैं, सुनकर सीखते हैं और दुनिया को हर किसी की नज़र से देख पाते हैं।",
    },
    strengths: {
      en: "Classical texts associate Shravana with absorbing knowledge through listening, deep empathy and connection, clear speech, and a cool, rational mind — a natural for teaching and counselling.",
      hi: "शास्त्र श्रवण को सुनकर ज्ञान ग्रहण करने, गहरी सहानुभूति और जुड़ाव, साफ़ बोली, और एक शान्त, विवेकी बुद्धि से जोड़ते हैं — पढ़ाने और परामर्श के लिए सहज उपयुक्त।",
    },
    source: SRC, status: "sourced",
  },
  { // 22 Dhanishta
    nature: {
      en: "Classical texts place Dhanishta under the Vasus, gods of plenty, ruled by Mars, with a drum as its sign, and call it a star of rhythm and flow. Those born under it are said to be musical and self-directed, keeping their own beat — confident, adaptable, and tied in the texts to wealth and generosity.",
      hi: "शास्त्र धनिष्ठा को समृद्धि के देवों वसुओं के अधीन, मंगल से शासित रखते हैं और इसे ढोल जिसका चिह्न है — लय और बहाव का नक्षत्र कहते हैं। इसमें जन्मे लोग संगीतमय और अपने मन के होते हैं, अपनी ही ताल पर चलने वाले — आत्मविश्वासी, लचीले, और शास्त्रों में समृद्धि व उदारता से जुड़े।",
    },
    strengths: {
      en: "Classical texts associate Dhanishta with genuine musical and performing talent, a knack for building wealth through many channels, generosity, and a bold, dependable nature.",
      hi: "शास्त्र धनिष्ठा को सच्ची संगीत व प्रस्तुति प्रतिभा, अनेक राहों से समृद्धि जुटाने की सूझ, उदारता, और एक निर्भीक, भरोसेमन्द स्वभाव से जोड़ते हैं।",
    },
    source: SRC, status: "sourced",
  },
  { // 23 Shatabhisha
    nature: {
      en: "Classical texts tie Shatabhisha to Varuna, lord of the cosmic waters, ruled by Rahu, and call it 'the hundred healers' — a vast, mysterious star. Those born under it are said to be intelligent, intuitive and quietly independent, watching from the background and unafraid to break the pattern.",
      hi: "शास्त्र शतभिषा को ब्रह्माण्डीय जल के स्वामी वरुण से जोड़ते हैं और इसे राहु से शासित, 'सौ वैद्य' कहते हैं — एक विशाल, रहस्यमय नक्षत्र। इसमें जन्मे लोग बुद्धिमान, सहज-बोधी और चुपचाप स्वतन्त्र होते हैं, पर्दे के पीछे से देखते हुए और लीक तोड़ने से न घबराते हुए।",
    },
    strengths: {
      en: "Classical texts associate Shatabhisha with a healer's gift and unconventional insight, pattern-breaking ideas that help at scale, composure in sudden crisis, and a knack for rising again after a fall.",
      hi: "शास्त्र शतभिषा को उपचारक की देन और अनोखी अन्तर्दृष्टि, बड़े स्तर पर काम आने वाले लीक-तोड़ विचार, अचानक संकट में धैर्य, और गिरने के बाद फिर उठ खड़े होने की क्षमता से जोड़ते हैं।",
    },
    source: SRC, status: "sourced",
  },
  { // 24 Purva Bhadrapada
    nature: {
      en: "Classical texts place Purva Bhadrapada under Aja Ekapada, a fiery ascetic form, ruled by Jupiter, and call it a star of intensity and high ideals. Those born under it are said to be visionaries who channel intense passion into change — peace-loving yet quick to flare, with a strong inner fire under a calm surface.",
      hi: "शास्त्र पूर्वाभाद्रपद को तेजस्वी तपस्वी रूप अज एकपाद के अधीन, बृहस्पति से शासित रखते हैं और इसे तीव्रता और ऊँचे आदर्शों का नक्षत्र कहते हैं। इसमें जन्मे लोग दूरदर्शी होते हैं जो प्रचण्ड जोश को बदलाव में ढालते हैं — शान्तिप्रिय पर जल्दी भड़कने वाले, शान्त सतह के नीचे एक तेज़ भीतरी आग लिए।",
    },
    strengths: {
      en: "Classical texts associate Purva Bhadrapada with visionary, pathbreaking drive, powerful oratory that rallies people to a cause, spiritual intensity, and deep bonds forged through shared challenge.",
      hi: "शास्त्र पूर्वाभाद्रपद को दूरदर्शी, नई राह खोलने वाली लगन, लोगों को किसी उद्देश्य के लिए जोड़ने वाली प्रभावशाली वाणी, आध्यात्मिक तीव्रता, और साझा चुनौतियों से बने गहरे रिश्तों से जोड़ते हैं।",
    },
    source: SRC, status: "sourced",
  },
  { // 25 Uttara Bhadrapada
    nature: {
      en: "Classical texts tie Uttara Bhadrapada to Ahir Budhnya, the serpent of the deep, ruled by Saturn, and call it a star of calm wisdom. Those born under it are said to be deep, compassionate and graceful, emotionally steady, imaginative, and slow to hold any grudge.",
      hi: "शास्त्र उत्तराभाद्रपद को गहराइयों के सर्प अहिर्बुध्न्य से जोड़ते हैं और इसे शनि से शासित, शान्त समझ का नक्षत्र कहते हैं। इसमें जन्मे लोग गहरे, करुण और शालीन होते हैं, भावनात्मक रूप से स्थिर, कल्पनाशील, और बैर पालने में धीमे।",
    },
    strengths: {
      en: "Classical texts associate Uttara Bhadrapada with inner peace and enduring wisdom, patient hard work, grace under hardship, and a spiritual depth that flows into art, music or writing.",
      hi: "शास्त्र उत्तराभाद्रपद को भीतरी शान्ति और चिरस्थायी समझ, धैर्यपूर्ण मेहनत, कठिनाई में शालीनता, और कला, संगीत या लेखन में बहने वाली आध्यात्मिक गहराई से जोड़ते हैं।",
    },
    source: SRC, status: "sourced",
  },
  { // 26 Revati
    nature: {
      en: "Classical texts place Revati under Pushan, guardian of travellers and herds, ruled by Mercury, with a fish as its sign, and call it a gentle, nourishing star of safe passage. Those born under it are said to be kind, cheerful and deeply empathetic, taking life seriously and drawn to support anyone in need.",
      hi: "शास्त्र रेवती को यात्रियों और पशुओं के रक्षक पूषन के अधीन, बुध से शासित रखते हैं और इसे मछली जिसका चिह्न है — सुरक्षित सफ़र का कोमल, पोषक नक्षत्र कहते हैं। इसमें जन्मे लोग दयालु, प्रफुल्ल और गहरी सहानुभूति वाले होते हैं, जो जीवन को गम्भीरता से लेते हैं और किसी भी ज़रूरतमन्द का सहारा बनने की ओर झुकते हैं।",
    },
    strengths: {
      en: "Classical texts associate Revati with selfless care and emotional support, kind and careful speech, quick intelligence, and a gentle, wise leadership that often flourishes far from home.",
      hi: "शास्त्र रेवती को निःस्वार्थ देखभाल और भावनात्मक सहारे, दयालु व सोची-समझी बोली, तेज़ बुद्धि, और एक कोमल, समझदार नेतृत्व से जोड़ते हैं जो अक्सर घर से दूर फलता-फूलता है।",
    },
    source: SRC, status: "sourced",
  },
];

// 12 entries, index 0 = Aries/Mesha … 11 = Pisces/Meena.
// mind/relating/work are read at the Moon sign; outward at the Lagna sign — so a
// sign as the Moon and the same sign rising get DIFFERENT copy.
export const SIGN_TRAITS: SignTrait[] = [
  { // 0 Aries / Mesha
    mind: {
      en: "Your Moon in Mesha gives a quick, bold emotional nature with a strong sense of self. You feel things instantly and act on them just as fast — decisive, direct, happier taking action than sitting with a mood. At your best this is courage, honesty and a spark that gets things moving; the harder edge is impatience, a short fuse, and reacting before you've thought it through. Your growth is learning to pause in the gap between feeling and doing.",
      hi: "मेष में आपका चन्द्र एक तेज़, निडर भावुक स्वभाव देता है, जिसमें अपने अस्तित्व की मज़बूत पहचान होती है। आप भावनाओं को तुरन्त महसूस करते और उतनी ही तेज़ी से उन पर काम करते हैं — निर्णायक, सीधे, और किसी भाव में उलझे रहने से ज़्यादा कुछ कर गुज़रने में ख़ुश। अच्छे रूप में यह साहस, ईमानदारी और वह चिंगारी है जो चीज़ों को हरकत में लाती है; कठिन पहलू है बेसब्री, जल्दी भड़क उठना, और सोचने से पहले प्रतिक्रिया देना। आपका विकास है — महसूस करने और करने के बीच के पल में ठहरना सीखना।",
    },
    relating: {
      en: "In relationships classical texts associate Mesha with warmth and plain speaking — loyal and protective, quick to flare and quick to forgive, and happiest with a partner who matches its energy.",
      hi: "रिश्तों में शास्त्र मेष को गर्मजोशी और साफ़ बात से जोड़ते हैं — वफ़ादार और रक्षक, जो जल्दी भड़कता और जल्दी माफ़ भी कर देता है, और ऐसे साथी में सबसे ख़ुश जो उसकी ऊर्जा से मेल खाए।",
    },
    work: {
      en: "Classical texts associate Mesha with action, leadership and initiative — fast-paced, competitive fields like enterprise, sport or anything that rewards being first to move.",
      hi: "शास्त्र मेष को कर्म, नेतृत्व और पहल से जोड़ते हैं — उद्यम, खेल या ऐसे तेज़-रफ़्तार, प्रतिस्पर्धी क्षेत्र जहाँ सबसे पहले क़दम बढ़ाने का इनाम मिले।",
    },
    outward: {
      en: "With Mesha rising, classical texts describe the first impression as direct and energetic — people usually meet a confident, straightforward presence.",
      hi: "मेष लग्न होने पर शास्त्र पहली छाप को सीधा और ऊर्जावान बताते हैं — लोग अक्सर एक आत्मविश्वासी, बेबाक शख़्सियत से मिलते हैं।",
    },
    source: SRC, status: "sourced",
  },
  { // 1 Taurus / Vrishabha
    mind: {
      en: "Your Moon in Vrishabha — its sign of exaltation — gives the steadiest emotional nature of the zodiac. You feel calmly and slowly, staying grounded when others panic, and sit with a feeling until it settles rather than reacting on the spot; comfort, beauty and security soothe you. At your best this is patience, loyalty and a reassuring calm; the harder edge is stubbornness and resisting change even when it would help. Your growth is learning to loosen your grip on what's comfortable but no longer right.",
      hi: "वृषभ में आपका चन्द्र — जहाँ वह उच्च का होता है — राशिचक्र का सबसे स्थिर भावुक स्वभाव देता है। आप शान्ति और धीरे से महसूस करते हैं, जब और लोग घबरा जाएँ तब भी टिके रहते हैं, और किसी भाव पर तुरन्त प्रतिक्रिया देने के बजाय उसे बैठने तक थामे रखते हैं; आराम, सुन्दरता और सुरक्षा आपको सुकून देते हैं। अच्छे रूप में यह धीरज, वफ़ादारी और एक भरोसा दिलाती शान्ति है; कठिन पहलू है ज़िद और बदलाव से इनकार, तब भी जब वह फ़ायदेमन्द हो। आपका विकास है — जो आरामदेह है पर अब सही नहीं, उस पर पकड़ ढीली करना सीखना।",
    },
    relating: {
      en: "In relationships classical texts associate Vrishabha with loyalty, warmth and constancy — slow to give trust and unshakeable once it's given, showing love through steadiness, touch and shared comfort.",
      hi: "रिश्तों में शास्त्र वृषभ को वफ़ादारी, गर्मजोशी और टिकाऊपन से जोड़ते हैं — भरोसा देने में धीमा, पर एक बार दे दे तो अटल, जो प्रेम को स्थिरता, स्पर्श और साझा सुख से जताता है।",
    },
    work: {
      en: "Classical texts associate Vrishabha with patient, hands-on, value-building work — finance, land, food, and the arts and crafts that reward a steady hand.",
      hi: "शास्त्र वृषभ को धीरज वाले, हाथों से किए जाने वाले और टिकाऊ मूल्य बनाने वाले काम से जोड़ते हैं — वित्त, ज़मीन, खान-पान, और वे कला-कारीगरी जो ठहरे हुए हाथ को क़द्र दें।",
    },
    outward: {
      en: "With Vrishabha rising, classical texts describe the first impression as calm and grounded — people usually meet a steady, reassuring presence.",
      hi: "वृषभ लग्न होने पर शास्त्र पहली छाप को शान्त और टिका हुआ बताते हैं — लोग अक्सर एक स्थिर, भरोसा दिलाती शख़्सियत से मिलते हैं।",
    },
    source: SRC, status: "sourced",
  },
  { // 2 Gemini / Mithuna
    mind: {
      en: "Your Moon in Mithuna gives a quick, restless, curious emotional nature that lives through the mind. You process feelings by talking and thinking them through, need constant mental stimulation, and can hold two opposite moods at once. At your best this is wit, adaptability and an easy way with words; the harder edge is scattered attention, overthinking, and skating over feelings instead of sitting with them. Your growth is letting yourself actually feel a thing before you explain it away.",
      hi: "मिथुन में आपका चन्द्र एक तेज़, बेचैन और जिज्ञासु भावुक स्वभाव देता है जो दिमाग़ के ज़रिए जीता है। आप भावनाओं को बोलकर और सोच-सोचकर समझते हैं, लगातार मानसिक हलचल चाहते हैं, और एक ही पल में दो उलट मूड थामे रह सकते हैं। अच्छे रूप में यह हाज़िरजवाबी, ढल जाने की क्षमता और शब्दों पर पकड़ है; कठिन पहलू है बिखरा ध्यान, ज़रूरत से ज़्यादा सोचना, और भावों में उतरने के बजाय उन्हें टाल देना। आपका विकास है — किसी भाव को समझा-बुझाकर टालने से पहले उसे सचमुच महसूस होने देना।",
    },
    relating: {
      en: "In relationships classical texts associate Mithuna with playfulness and good conversation — it needs a partner who keeps the mind engaged, warming most through words and shared curiosity.",
      hi: "रिश्तों में शास्त्र मिथुन को हँसी-मज़ाक और अच्छी बातचीत से जोड़ते हैं — इसे ऐसा साथी चाहिए जो दिमाग़ को व्यस्त रखे, और यह शब्दों व साझा जिज्ञासा से सबसे ज़्यादा क़रीब आता है।",
    },
    work: {
      en: "Classical texts associate Mithuna with communication, writing, teaching and trade — any work that runs on ideas, quick exchange and juggling more than one thing at once.",
      hi: "शास्त्र मिथुन को बातचीत, लेखन, पढ़ाने और व्यापार से जोड़ते हैं — हर वह काम जो विचारों, तेज़ आदान-प्रदान और एक साथ कई चीज़ें सँभालने पर चलता हो।",
    },
    outward: {
      en: "With Mithuna rising, classical texts describe the first impression as witty and youthful — people usually meet a talkative, lively presence full of curiosity.",
      hi: "मिथुन लग्न होने पर शास्त्र पहली छाप को हाज़िरजवाब और जवाँ बताते हैं — लोग अक्सर एक बातूनी, ज़िंदादिल और जिज्ञासा से भरी शख़्सियत से मिलते हैं।",
    },
    source: SRC, status: "sourced",
  },
  { // 3 Cancer / Karka
    mind: {
      en: "Your Moon sits in Karka — its own sign, where it's strongest and most at home. This is an emotional nature that lives through feeling. Emotions run deep and close to the surface at once: you sense the mood of a room before anyone speaks, remember both a kindness and a slight for years, and often feel other people's pain almost as your own. Home, family and familiar places are where you go to feel safe. At your best this is rare emotional intelligence and a warmth that makes people feel genuinely held; the harder edge is moodiness, retreating into your shell when hurt, and holding on to old wounds longer than they serve you. Your growth is learning to give yourself the same care you give everyone else.",
      hi: "कर्क में आपका चन्द्र है — अपनी ही राशि में, जहाँ वह सबसे मज़बूत और सबसे घर जैसा होता है। यह एक ऐसा भावुक स्वभाव है जो भाव से जीता है। भावनाएँ गहरी भी हैं और सतह के क़रीब भी: किसी के बोलने से पहले आप कमरे का मिज़ाज भाँप लेते हैं, किसी की भलाई और किसी की चोट — दोनों को बरसों याद रखते हैं, और अक्सर दूसरों का दर्द अपना-सा महसूस करते हैं। घर, परिवार और जाने-पहचाने ठिकाने वहाँ हैं जहाँ आप सुरक्षित महसूस करने जाते हैं। अच्छे रूप में यह दुर्लभ भावनात्मक समझ और वह गर्मजोशी है जो लोगों को सचमुच सँभाला हुआ महसूस कराती है; कठिन पहलू है भावों में बहना, चोट लगने पर अपने खोल में सिमट जाना, और पुराने ज़ख़्मों को ज़रूरत से ज़्यादा थामे रखना। आपका विकास है — जो देखभाल आप सबको देते हैं, वही ख़ुद को भी देना सीखना।",
    },
    relating: {
      en: "In relationships classical texts associate Karka with nurturing and protectiveness — it bonds deeply and loyally, senses a loved one's needs before they're named, and feels betrayal or neglect for a long time.",
      hi: "रिश्तों में शास्त्र कर्क को पालन-पोषण और रक्षा-भाव से जोड़ते हैं — यह गहराई और वफ़ादारी से जुड़ता है, अपनों की ज़रूरत उनके कहने से पहले भाँप लेता है, और उपेक्षा या विश्वासघात को लम्बे समय तक महसूस करता है।",
    },
    work: {
      en: "Classical texts associate Karka with caregiving, hospitality, food and history — any work that shelters, feeds or keeps people and things safe.",
      hi: "शास्त्र कर्क को देखभाल, मेहमाननवाज़ी, खान-पान और इतिहास से जोड़ते हैं — हर वह काम जो लोगों और चीज़ों को आसरा दे, खिलाए या सँभालकर रखे।",
    },
    outward: {
      en: "With Karka rising, classical texts describe the first impression as gentle and caring — people usually meet a warm, protective presence tuned to feeling.",
      hi: "कर्क लग्न होने पर शास्त्र पहली छाप को कोमल और स्नेही बताते हैं — लोग अक्सर एक गर्मजोश, रक्षक और भावनाओं को समझने वाली शख़्सियत से मिलते हैं।",
    },
    source: SRC, status: "sourced",
  },
  { // 4 Leo / Simha
    mind: {
      en: "Your Moon in Simha gives a warm, proud and generous emotional nature with a quiet inner royalty. You feel everything on a grand scale, love wholeheartedly, and have a deep need to be seen and appreciated by the people who matter to you. At your best this is warmth, loyalty, courage and a generosity that lights up a room; the harder edge is pride, a bruised ego when you're overlooked, and a hunger for validation. Your growth is learning that your worth doesn't depend on the applause.",
      hi: "सिंह में आपका चन्द्र एक गर्मजोश, स्वाभिमानी और उदार भावुक स्वभाव देता है, जिसमें एक शान्त भीतरी राजसीपन होता है। आप हर चीज़ को बड़े पैमाने पर महसूस करते हैं, पूरे दिल से प्रेम करते हैं, और अपनों की नज़र में दिखने व सराहे जाने की गहरी चाह रखते हैं। अच्छे रूप में यह गर्मजोशी, वफ़ादारी, साहस और वह उदारता है जो महफ़िल रौशन कर दे; कठिन पहलू है अभिमान, नज़रअन्दाज़ होने पर आहत अहं, और पुष्टि की भूख। आपका विकास है — यह समझना कि आपकी क़ीमत तालियों पर टिकी नहीं है।",
    },
    relating: {
      en: "In relationships classical texts associate Simha with loyalty and big-hearted warmth — it loves grandly and protectively, gives generously, and blossoms where affection and respect are openly returned.",
      hi: "रिश्तों में शास्त्र सिंह को वफ़ादारी और बड़े दिल की गर्मजोशी से जोड़ते हैं — यह दिल खोलकर और रक्षा-भाव से प्रेम करता है, उदारता से देता है, और जहाँ स्नेह व आदर खुलकर लौटें वहाँ खिलता है।",
    },
    work: {
      en: "Classical texts associate Simha with leadership from the front, performance and creative authority — any work with visibility, dignity and room to inspire.",
      hi: "शास्त्र सिंह को आगे रहकर नेतृत्व, मंच और रचनात्मक कमान से जोड़ते हैं — हर वह काम जिसमें पहचान, मान और प्रेरित करने की गुंजाइश हो।",
    },
    outward: {
      en: "With Simha rising, classical texts describe the first impression as dignified and bright — people usually meet a confident, generous and commanding presence.",
      hi: "सिंह लग्न होने पर शास्त्र पहली छाप को गरिमामय और तेजस्वी बताते हैं — लोग अक्सर एक आत्मविश्वासी, उदार और रौबदार शख़्सियत से मिलते हैं।",
    },
    source: SRC, status: "sourced",
  },
  { // 5 Virgo / Kanya
    mind: {
      en: "Your Moon in Kanya gives a thoughtful, analytical emotional nature that even reasons its way through feelings. You show love by being useful, notice every detail, and quietly work to make things — and people — better. At your best this is care, precision, humility and genuine helpfulness; the harder edge is self-criticism, worry, and holding yourself (and others) to an impossible standard. Your growth is learning that you are already enough, before anything is fixed or perfected.",
      hi: "कन्या में आपका चन्द्र एक विचारशील, विश्लेषण करने वाला भावुक स्वभाव देता है जो भावनाओं तक को तर्क से समझता है। आप काम आकर प्रेम जताते हैं, हर बारीक़ी पकड़ते हैं, और चुपचाप चीज़ों — और लोगों — को बेहतर बनाने में लगे रहते हैं। अच्छे रूप में यह देखभाल, सटीकता, विनम्रता और सच्ची मददगारी है; कठिन पहलू है ख़ुद पर सख़्ती, चिन्ता, और ख़ुद को (व औरों को) एक नामुमकिन कसौटी पर कसना। आपका विकास है — यह समझना कि कुछ भी ठीक या पूर्ण होने से पहले ही आप काफ़ी हैं।",
    },
    relating: {
      en: "In relationships classical texts associate Kanya with care shown through service — modest and reliable, it expresses affection in practical, helpful acts rather than grand words, and prefers things simple over dramatic.",
      hi: "रिश्तों में शास्त्र कन्या को सेवा से जताई गई देखभाल से जोड़ते हैं — विनम्र और भरोसेमन्द, जो प्रेम को बड़ी-बड़ी बातों से नहीं बल्कि छोटे-छोटे मददगार कामों से जताता है, और नाटकीयता से ज़्यादा सादगी पसन्द करता है।",
    },
    work: {
      en: "Classical texts associate Kanya with analysis, healing, craft, editing and service — any work that rewards precision, skill and a careful eye.",
      hi: "शास्त्र कन्या को विश्लेषण, उपचार, कारीगरी, सम्पादन और सेवा से जोड़ते हैं — हर वह काम जो सटीकता, हुनर और बारीक़ नज़र को क़द्र दे।",
    },
    outward: {
      en: "With Kanya rising, classical texts describe the first impression as modest and precise — people usually meet an observant, capable and unassuming presence.",
      hi: "कन्या लग्न होने पर शास्त्र पहली छाप को विनम्र और सटीक बताते हैं — लोग अक्सर एक गौर करने वाली, सक्षम और सादगी भरी शख़्सियत से मिलते हैं।",
    },
    source: SRC, status: "sourced",
  },
  { // 6 Libra / Tula
    mind: {
      en: "Your Moon in Tula gives a harmony-seeking, relational emotional nature — you feel most settled when the people around you are at peace and things feel fair. You read both sides of everything, dislike conflict, and are happiest in good company. At your best this is grace, fairness, warmth and a gift for bringing people together; the harder edge is indecision, people-pleasing, and losing your own preference in the effort to keep the peace. Your growth is learning that your own voice belongs in the balance too.",
      hi: "तुला में आपका चन्द्र एक सामंजस्य चाहने वाला, रिश्तों से जुड़ा भावुक स्वभाव देता है — आप तब सबसे सहज होते हैं जब आस-पास के लोग शान्त हों और चीज़ें निष्पक्ष लगें। आप हर बात के दोनों पक्ष देखते हैं, झगड़ा नापसन्द करते हैं, और अच्छे साथ में सबसे ख़ुश रहते हैं। अच्छे रूप में यह शालीनता, निष्पक्षता, गर्मजोशी और लोगों को जोड़ने की क्षमता है; कठिन पहलू है दुविधा, सबको ख़ुश रखने की कोशिश, और शान्ति बनाए रखने में अपनी पसन्द खो देना। आपका विकास है — यह समझना कि इस सन्तुलन में आपकी अपनी आवाज़ की भी जगह है।",
    },
    relating: {
      en: "In relationships classical texts associate Tula with grace and partnership — it seeks companionship and a fair give-and-take, is romantic and considerate, and finds real peace when the people around it are in accord.",
      hi: "रिश्तों में शास्त्र तुला को शालीनता और साझेदारी से जोड़ते हैं — यह साथ और निष्पक्ष लेन-देन चाहता है, रोमानी और ख़याल रखने वाला है, और तब सच्चा सुकून पाता है जब आस-पास के लोग आपस में मेल में हों।",
    },
    work: {
      en: "Classical texts associate Tula with diplomacy, art, design, law and mediation — any work that weighs both sides and brings people to agreement.",
      hi: "शास्त्र तुला को कूटनीति, कला, डिज़ाइन, क़ानून और मध्यस्थता से जोड़ते हैं — हर वह काम जो दोनों पक्षों को तौले और लोगों को सहमति तक लाए।",
    },
    outward: {
      en: "With Tula rising, classical texts describe the first impression as gracious and pleasant — people usually meet a poised, agreeable and even-handed presence.",
      hi: "तुला लग्न होने पर शास्त्र पहली छाप को शालीन और सुखद बताते हैं — लोग अक्सर एक संयत, सौम्य और निष्पक्ष शख़्सियत से मिलते हैं।",
    },
    source: SRC, status: "sourced",
  },
  { // 7 Scorpio / Vrishchika
    mind: {
      en: "Your Moon in Vrishchika — a placement the classical texts call debilitated, though it carries extraordinary depth — gives an intense, all-or-nothing emotional nature. You feel far more deeply than you let on, keep your inner world fiercely private, and are tempered and toughened by whatever you go through. At your best this is emotional courage, fierce loyalty and a power to turn pain into strength; the harder edge is secrecy, brooding, jealousy and slowness to forgive. Your growth is learning to trust a few people with what you keep hidden.",
      hi: "वृश्चिक में आपका चन्द्र — जिसे शास्त्र नीच का कहते हैं, फिर भी जो असाधारण गहराई रखता है — एक तीव्र, पूरा-या-कुछ नहीं वाला भावुक स्वभाव देता है। आप जितना दिखाते हैं उससे कहीं गहराई से महसूस करते हैं, अपनी भीतरी दुनिया को कड़ाई से निजी रखते हैं, और जो कुछ झेलते हैं उससे तपकर और मज़बूत होते हैं। अच्छे रूप में यह भावनात्मक साहस, प्रबल वफ़ादारी और दर्द को ताक़त में बदल देने की शक्ति है; कठिन पहलू है गोपनीयता, मन ही मन घुलना, ईर्ष्या, और देर से माफ़ करना। आपका विकास है — जो छिपाए रखते हैं, उसे कुछ भरोसेमन्द लोगों के साथ बाँटना सीखना।",
    },
    relating: {
      en: "In relationships classical texts associate Vrishchika with intensity and fierce loyalty — private and all-or-nothing, it forms deep, protective bonds only where trust has been truly earned.",
      hi: "रिश्तों में शास्त्र वृश्चिक को गहनता और गहरी वफ़ादारी से जोड़ते हैं — निजी और पूरा-या-कुछ नहीं, यह वहीं गहरे, रक्षक रिश्ते बनाता है जहाँ भरोसा सचमुच कमाया गया हो।",
    },
    work: {
      en: "Classical texts associate Vrishchika with research, investigation, psychology, healing and depth — any work that uncovers what is hidden and transforms it.",
      hi: "शास्त्र वृश्चिक को खोज, छानबीन, मनोविज्ञान, उपचार और गहराई से जोड़ते हैं — हर वह काम जो छिपे हुए को सामने लाए और उसे बदल दे।",
    },
    outward: {
      en: "With Vrishchika rising, classical texts describe the first impression as magnetic and reserved — people usually meet an intense, searching presence that opens up slowly.",
      hi: "वृश्चिक लग्न होने पर शास्त्र पहली छाप को आकर्षक और संयमित बताते हैं — लोग अक्सर एक गहरी, गहराई से देखने वाली शख़्सियत से मिलते हैं जो धीरे-धीरे खुलती है।",
    },
    source: SRC, status: "sourced",
  },
  { // 8 Sagittarius / Dhanu
    mind: {
      en: "Your Moon in Dhanu gives an optimistic, adventurous, freedom-loving emotional nature. You feel most alive reaching toward meaning, truth or a far horizon, need room to roam, and meet life with humour and an open heart. At your best this is warmth, honesty, faith and a spirit that lifts everyone around you; the harder edge is restlessness, bluntness, and running from a feeling rather than settling into it. Your growth is learning that some things are found by staying, not only by seeking.",
      hi: "धनु में आपका चन्द्र एक आशावादी, साहसी और आज़ादी पसन्द भावुक स्वभाव देता है। आप अर्थ, सच या किसी दूर की मंज़िल की ओर बढ़ने में सबसे ज़िंदा महसूस करते हैं, घूमने-फिरने की जगह चाहते हैं, और जीवन से हास-परिहास और खुले दिल से मिलते हैं। अच्छे रूप में यह गर्मजोशी, ईमानदारी, आस्था और वह जज़्बा है जो आस-पास सबका हौसला बढ़ाए; कठिन पहलू है बेचैनी, बेबाकी, और किसी भाव में ठहरने के बजाय उससे भाग जाना। आपका विकास है — यह समझना कि कुछ चीज़ें ढूँढने से नहीं, ठहरने से मिलती हैं।",
    },
    relating: {
      en: "In relationships classical texts associate Dhanu with honesty and good cheer — warm but emotionally independent, disliking clinginess, respecting a partner's freedom and valuing shared ideals and adventures.",
      hi: "रिश्तों में शास्त्र धनु को ईमानदारी और ख़ुशमिज़ाजी से जोड़ते हैं — गर्मजोश पर भावनात्मक रूप से स्वतन्त्र, चिपकूपन नापसन्द करने वाला, साथी की आज़ादी का आदर करने वाला और साझा आदर्शों व सफ़र को अहमियत देने वाला।",
    },
    work: {
      en: "Classical texts associate Dhanu with teaching, philosophy, law, travel and guidance — any work with freedom of thought and movement that explores meaning and widens the view.",
      hi: "शास्त्र धनु को पढ़ाने, दर्शन, क़ानून, यात्रा और मार्गदर्शन से जोड़ते हैं — हर वह काम जिसमें सोच और चलने-फिरने की आज़ादी हो, जो अर्थ खोजे और नज़रिए को चौड़ा करे।",
    },
    outward: {
      en: "With Dhanu rising, classical texts describe the first impression as open and optimistic — people usually meet a frank, upbeat and adventurous presence.",
      hi: "धनु लग्न होने पर शास्त्र पहली छाप को खुला और आशावादी बताते हैं — लोग अक्सर एक बेबाक, उत्साही और साहसी शख़्सियत से मिलते हैं।",
    },
    source: SRC, status: "sourced",
  },
  { // 9 Capricorn / Makara
    mind: {
      en: "Your Moon in Makara gives a serious, disciplined, reserved emotional nature. You keep feelings under wraps, put duty and long-term goals first, and carry a maturity beyond your years — often built over an early sense of having to be strong. At your best this is steadiness, responsibility, patience and a loyalty proven through action; the harder edge is emotional guardedness, coldness under stress, and being harder on yourself than on anyone else. Your growth is learning to let people in and to rest without guilt.",
      hi: "मकर में आपका चन्द्र एक गम्भीर, अनुशासित और संयमित भावुक स्वभाव देता है। आप भावनाओं को ढके रखते हैं, कर्तव्य और दूरगामी लक्ष्यों को पहले रखते हैं, और उम्र से पहले की परिपक्वता रखते हैं — जो अक्सर इस शुरुआती एहसास पर बनी होती है कि मज़बूत रहना ही पड़ेगा। अच्छे रूप में यह स्थिरता, ज़िम्मेदारी, धीरज और कर्मों से साबित वफ़ादारी है; कठिन पहलू है भावनात्मक सतर्कता, दबाव में ठंडापन, और ख़ुद पर सबसे ज़्यादा सख़्ती। आपका विकास है — लोगों को भीतर आने देना और बिना अपराध-बोध के सुस्ताना सीखना।",
    },
    relating: {
      en: "In relationships classical texts associate Makara with commitment and reliability — cautious to open up, yet serious, loyal and long-lasting, showing love through actions and a steady, dependable presence.",
      hi: "रिश्तों में शास्त्र मकर को प्रतिबद्धता और भरोसेमन्दी से जोड़ते हैं — खुलने में सतर्क, फिर भी गम्भीर, वफ़ादार और लम्बा साथ निभाने वाला, जो प्रेम को कर्मों और एक स्थिर, भरोसेमन्द साथ से जताता है।",
    },
    work: {
      en: "Classical texts associate Makara with administration, structure and long-term building — finance, law and organisation, any work that rewards patience, discipline and a steady climb.",
      hi: "शास्त्र मकर को प्रबन्धन, ढाँचे और लम्बी अवधि के निर्माण से जोड़ते हैं — वित्त, क़ानून और संगठन, हर वह काम जो धीरज, अनुशासन और धीमी पर पक्की चढ़ाई को क़द्र दे।",
    },
    outward: {
      en: "With Makara rising, classical texts describe the first impression as composed and serious — people usually meet a capable, self-contained and steady presence.",
      hi: "मकर लग्न होने पर शास्त्र पहली छाप को संयत और गम्भीर बताते हैं — लोग अक्सर एक सक्षम, आत्म-संयमित और स्थिर शख़्सियत से मिलते हैं।",
    },
    source: SRC, status: "sourced",
  },
  { // 10 Aquarius / Kumbha
    mind: {
      en: "Your Moon in Kumbha gives an independent, original emotional nature that leads with the head over the heart. You process feelings at a thoughtful distance, care deeply about fairness and the wider group, and need plenty of personal freedom. At your best this is a calm, humane, open-minded steadiness and loyalty to your ideals; the harder edge is emotional detachment, aloofness, and intellectualising feelings instead of living them. Your growth is learning to be as present with one person's heart as you are with humanity's.",
      hi: "कुम्भ में आपका चन्द्र एक स्वतन्त्र, मौलिक भावुक स्वभाव देता है जो दिल से ज़्यादा दिमाग़ से चलता है। आप भावनाओं को एक विचारशील दूरी से समझते हैं, निष्पक्षता और बड़े समूह की गहरी परवाह करते हैं, और ख़ूब निजी आज़ादी चाहते हैं। अच्छे रूप में यह एक शान्त, इंसानियत भरी, खुले विचारों वाली स्थिरता और अपने आदर्शों के प्रति निष्ठा है; कठिन पहलू है भावनात्मक अलगाव, अलिप्तता, और भावों को जीने के बजाय उन्हें बुद्धि से तौलना। आपका विकास है — जितना आप पूरी मानवता से जुड़ते हैं, उतना ही किसी एक के दिल के साथ मौजूद रहना सीखना।",
    },
    relating: {
      en: "In relationships classical texts associate Kumbha with friendship and equality — drawn to free-spirited, independent minds and treating a partner as a friend, it needs room to breathe and can seem cool even when it cares deeply.",
      hi: "रिश्तों में शास्त्र कुम्भ को दोस्ती और बराबरी से जोड़ते हैं — स्वच्छन्द, स्वतन्त्र सोच वाले लोगों की ओर खिंचता और साथी को दोस्त मानता है, इसे खुलकर साँस लेने की जगह चाहिए और यह गहरे लगाव के बावजूद कभी अलिप्त-सा लग सकता है।",
    },
    work: {
      en: "Classical texts associate Kumbha with reform, science, technology and community — any work that carries a new idea forward or serves the collective good.",
      hi: "शास्त्र कुम्भ को सुधार, विज्ञान, तकनीक और समुदाय से जोड़ते हैं — हर वह काम जो किसी नए विचार को आगे ले जाए या सबकी भलाई के काम आए।",
    },
    outward: {
      en: "With Kumbha rising, classical texts describe the first impression as original and cool-headed — people usually meet a thoughtful, unconventional and friendly presence.",
      hi: "कुम्भ लग्न होने पर शास्त्र पहली छाप को मौलिक और ठंडे दिमाग़ वाला बताते हैं — लोग अक्सर एक विचारशील, लीक से हटकर और दोस्ताना शख़्सियत से मिलते हैं।",
    },
    source: SRC, status: "sourced",
  },
  { // 11 Pisces / Meena
    mind: {
      en: "Your Moon in Meena gives a compassionate, dreamy, deeply intuitive emotional nature. So open that you soak up the feelings of everyone around you, you're easily moved by beauty and suffering alike, and you sense what goes unsaid. At your best this is empathy, imagination, gentleness and a soulful, selfless love; the harder edge is over-absorbing others' pain, escapism, and losing your own edges. Your growth is learning where you end and everyone else begins.",
      hi: "मीन में आपका चन्द्र एक करुण, स्वप्निल और गहरे सहज-बोध वाला भावुक स्वभाव देता है। इतने खुले कि आस-पास सबके भाव सोख लेते हैं, सुन्दरता और पीड़ा — दोनों से सहज ही द्रवित हो जाते हैं, और अनकही बातों को भाँप लेते हैं। अच्छे रूप में यह सहानुभूति, कल्पना, कोमलता और एक आत्मीय, निःस्वार्थ प्रेम है; कठिन पहलू है दूसरों का दर्द ज़रूरत से ज़्यादा अपना लेना, हक़ीक़त से भागना, और अपनी सीमाएँ खो देना। आपका विकास है — यह जानना कि आप कहाँ ख़त्म होते हैं और बाक़ी सब कहाँ से शुरू।",
    },
    relating: {
      en: "In relationships classical texts associate Meena with tenderness and selfless love — empathetic and forgiving, it takes in others' feelings and gives of itself readily, seeking a soulful, emotionally deep connection.",
      hi: "रिश्तों में शास्त्र मीन को कोमलता और निःस्वार्थ प्रेम से जोड़ते हैं — सहानुभूति वाला और क्षमाशील, यह दूसरों के भाव अपना लेता और सहज ही ख़ुद को न्योछावर कर देता है, एक आत्मीय, भावनात्मक रूप से गहरे जुड़ाव की तलाश में।",
    },
    work: {
      en: "Classical texts associate Meena with art, healing, spirituality and service — music, poetry and film, or psychology and social work: any work led by imagination, compassion and a feel for the unseen.",
      hi: "शास्त्र मीन को कला, उपचार, अध्यात्म और सेवा से जोड़ते हैं — संगीत, कविता और सिनेमा, या मनोविज्ञान और समाज-सेवा: हर वह काम जो कल्पना, करुणा और अनदेखे की समझ से चले।",
    },
    outward: {
      en: "With Meena rising, classical texts describe the first impression as gentle and dreamy — people usually meet a kind, receptive presence with a soft, open manner.",
      hi: "मीन लग्न होने पर शास्त्र पहली छाप को कोमल और स्वप्निल बताते हैं — लोग अक्सर एक दयालु, ग्रहणशील और नरम, खुले अन्दाज़ वाली शख़्सियत से मिलते हैं।",
    },
    source: SRC, status: "sourced",
  },
];

const NAK_LABEL = { en: "Nature & temperament", hi: "स्वभाव" };
const STR_LABEL = { en: "Strengths & talents", hi: "सामर्थ्य" };
const MIND_LABEL = { en: "Mind & emotions", hi: "मन व भाव" };
const REL_LABEL = { en: "How you relate", hi: "सम्बन्ध" };
const WORK_LABEL = { en: "Work leanings", hi: "कार्य व वृत्ति" };
const OUT_LABEL = { en: "How others see you", hi: "बाह्य छवि" };

export function buildLifeReading({ nak, moonSign, ascSign }: { nak: number; moonSign: number; ascSign: number }) {
  const n = NAKSHATRA_TRAITS[nak];
  const s = SIGN_TRAITS[moonSign];
  const a = SIGN_TRAITS[ascSign];
  if (!n || !s || !a) return [];
  return [
    { areaKey: "nature", label: NAK_LABEL, text: n.nature, source: n.source, status: n.status },
    { areaKey: "mind", label: MIND_LABEL, text: s.mind, source: s.source, status: s.status },
    { areaKey: "strengths", label: STR_LABEL, text: n.strengths, source: n.source, status: n.status },
    { areaKey: "relating", label: REL_LABEL, text: s.relating, source: s.source, status: s.status },
    { areaKey: "work", label: WORK_LABEL, text: s.work, source: s.source, status: s.status },
    { areaKey: "outward", label: OUT_LABEL, text: a.outward, source: a.source, status: a.status },
  ];
}
