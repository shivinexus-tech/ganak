// Answer-first life-interpretation copy for the Chart screen.
// Bilingual, sourced to Brihat Parashara Hora Shastra + Phaladeepika, written as
// ATTRIBUTION ("Classical texts associate…"), never as a second-person verdict.
// Index order matches NAKSHATRAS / SIGNS in src/engine/panchang.ts.
// Supersedes the old NAK_NOTE / SIGN_NOTE one-liners in ChartScreen.

type Bi = { en: string; hi: string };
type Status = "sourced" | "owner-verified";
export type NakTrait = { nature: Bi; strengths: Bi; source: string; status: Status };
export type SignTrait = { mind: Bi; relating: Bi; work: Bi; outward: Bi; source: string; status: Status };

// `source` is a shared-corpus attribution to these two canonical texts, not a
// per-claim page citation; `status: "sourced"` means "grounded in the tradition",
// upgraded to "owner-verified" per entry after the owner review
// (plans/kundli-interpretation-review.md). Both are what the spec §4 intends.
const SRC = "Brihat Parashara Hora Shastra; Phaladeepika";

// 27 entries, index 0 = Ashwini … 26 = Revati.
export const NAKSHATRA_TRAITS: NakTrait[] = [
  { // 0 Ashwini
    nature: {
      en: "Classical texts link Ashwini to the Ashwini Kumaras, the divine physicians — a swift, pioneering star. Those born under it are described as quick to begin, eager to help, and restless until in motion.",
      hi: "शास्त्र अश्विनी को अश्विनी कुमारों — देव-वैद्यों — से जोड़ते हैं; यह तीव्र, अग्रणी नक्षत्र है। इसमें जन्मे व्यक्ति शीघ्र आरम्भ करने वाले, सहायता को तत्पर और गति में रहने तक बेचैन कहे गए हैं।",
    },
    strengths: {
      en: "The tradition associates Ashwini with initiative, a healer's instinct, and a gift for fresh starts and swift rescue.",
      hi: "परम्परा अश्विनी को पहल-शक्ति, उपचार की सहज प्रवृत्ति और नए आरम्भ व त्वरित सहायता की क्षमता से जोड़ती है।",
    },
    source: SRC, status: "sourced",
  },
  { // 1 Bharani
    nature: {
      en: "Classical texts place Bharani under Yama, lord of restraint and passage, ruled by Venus — a star of intense creative force held in discipline. Those born under it are described as strong-willed, enduring, and able to carry heavy responsibility.",
      hi: "शास्त्र भरणी को यम — संयम व संक्रमण के स्वामी — के अधीन और शुक्र द्वारा शासित बताते हैं; यह अनुशासन में बँधी प्रबल सृजन-शक्ति का नक्षत्र है। इसमें जन्मे व्यक्ति दृढ़-इच्छाशक्ति, सहनशील और भारी उत्तरदायित्व वहन करने में सक्षम कहे गए हैं।",
    },
    strengths: {
      en: "The tradition associates Bharani with creative power, moral resolve, and the capacity to see difficult things through to completion.",
      hi: "परम्परा भरणी को सृजन-शक्ति, नैतिक संकल्प और कठिन कार्यों को पूर्ण करने की क्षमता से जोड़ती है।",
    },
    source: SRC, status: "sourced",
  },
  { // 2 Krittika
    nature: {
      en: "Classical texts link Krittika to Agni, the sacred fire, and to the mothers who nursed Kartikeya — a sharp, purifying star ruled by the Sun. Those born under it are described as clear-sighted and discerning, able to cut through what is false while still nourishing what is true.",
      hi: "शास्त्र कृत्तिका को अग्नि — पवित्र अग्नि — और कार्तिकेय का पालन करने वाली माताओं से जोड़ते हैं; सूर्य द्वारा शासित यह तीक्ष्ण, शोधक नक्षत्र है। इसमें जन्मे व्यक्ति स्पष्ट-दृष्टि वाले व विवेकी कहे गए हैं, जो असत्य को काटते हुए भी सत्य का पोषण करते हैं।",
    },
    strengths: {
      en: "The tradition associates Krittika with sharp discernment, the courage to refine and purify, and the will to protect and nourish what deserves to grow.",
      hi: "परम्परा कृत्तिका को तीक्ष्ण विवेक, परिष्कार व शुद्धि का साहस, और जो विकास योग्य है उसकी रक्षा व पोषण की इच्छाशक्ति से जोड़ती है।",
    },
    source: SRC, status: "sourced",
  },
  { // 3 Rohini
    nature: {
      en: "Classical texts place Rohini under Prajapati the creator, ruled by the Moon, and call it the Moon's most beloved star — one of growth, beauty and fertility. Those born under it are described as magnetic and creative, drawn to comfort, art and things that flourish.",
      hi: "शास्त्र रोहिणी को सृष्टिकर्ता प्रजापति के अधीन, चन्द्र द्वारा शासित रखते हैं और इसे चन्द्र का सर्वप्रिय नक्षत्र कहते हैं — विकास, सौन्दर्य व उर्वरता का नक्षत्र। इसमें जन्मे व्यक्ति आकर्षक व सृजनशील कहे गए हैं, जो सुख, कला व फलते-फूलते जीवन की ओर झुके रहते हैं।",
    },
    strengths: {
      en: "The tradition associates Rohini with creativity, an eye for beauty, and a gift for nurturing growth and bringing things to fruition.",
      hi: "परम्परा रोहिणी को सृजनशीलता, सौन्दर्य-दृष्टि, और विकास को पोषने व फल तक ले जाने की क्षमता से जोड़ती है।",
    },
    source: SRC, status: "sourced",
  },
  { // 4 Mrigashira
    nature: {
      en: "Classical texts link Mrigashira to Soma and the symbol of a deer's head, ruled by Mars — a gentle, searching star. Those born under it are described as curious, soft-spoken seekers, forever tracing a scent toward something just out of reach.",
      hi: "शास्त्र मृगशिरा को सोम और मृग-मस्तक के प्रतीक से जोड़ते हैं; मंगल द्वारा शासित यह कोमल, खोजी नक्षत्र है। इसमें जन्मे व्यक्ति जिज्ञासु, मृदुभाषी अन्वेषक कहे गए हैं, जो सदा किसी दूर की गंध का पीछा करते रहते हैं।",
    },
    strengths: {
      en: "The tradition associates Mrigashira with curiosity, gentle persistence, and a talent for research, exploration and following a question wherever it leads.",
      hi: "परम्परा मृगशिरा को जिज्ञासा, कोमल दृढ़ता, और अनुसन्धान, अन्वेषण व किसी प्रश्न का अन्त तक पीछा करने की क्षमता से जोड़ती है।",
    },
    source: SRC, status: "sourced",
  },
  { // 5 Ardra
    nature: {
      en: "Classical texts place Ardra under Rudra, the storm that clears the air, ruled by Rahu — a star of depth and renewal through change. Those born under it are described as emotionally deep and sharp-minded, capable of profound renewal after every storm.",
      hi: "शास्त्र आर्द्रा को रुद्र — वायु को स्वच्छ करने वाले तूफ़ान — के अधीन और राहु द्वारा शासित रखते हैं; यह गहराई और परिवर्तन से नवीनीकरण का नक्षत्र है। इसमें जन्मे व्यक्ति भावनात्मक रूप से गहरे व तीक्ष्ण-बुद्धि कहे गए हैं, जो हर तूफ़ान के बाद गहन नवीनीकरण में सक्षम होते हैं।",
    },
    strengths: {
      en: "The tradition associates Ardra with a penetrating mind, empathy born of experience, and the power to renew itself after upheaval.",
      hi: "परम्परा आर्द्रा को भेदक बुद्धि, अनुभव से जन्मी सहानुभूति, और उथल-पुथल के बाद स्वयं को नवीन करने की शक्ति से जोड़ती है।",
    },
    source: SRC, status: "sourced",
  },
  { // 6 Punarvasu
    nature: {
      en: "Classical texts link Punarvasu to Aditi, mother of the gods, ruled by Jupiter — the star of return and renewal, of light coming back after darkness. Those born under it are described as optimistic and philosophical, able to begin again with an open, expansive heart.",
      hi: "शास्त्र पुनर्वसु को देवमाता अदिति से जोड़ते हैं; बृहस्पति द्वारा शासित यह पुनरागमन व नवीनीकरण का नक्षत्र है — अन्धकार के बाद प्रकाश की वापसी। इसमें जन्मे व्यक्ति आशावादी व दार्शनिक कहे गए हैं, जो खुले, विस्तृत हृदय से पुनः आरम्भ कर पाते हैं।",
    },
    strengths: {
      en: "The tradition associates Punarvasu with resilience, wisdom, generosity, and a gift for starting fresh without bitterness.",
      hi: "परम्परा पुनर्वसु को लचीलापन, प्रज्ञा, उदारता, और बिना कटुता के नए सिरे से आरम्भ करने की क्षमता से जोड़ती है।",
    },
    source: SRC, status: "sourced",
  },
  { // 7 Pushya
    nature: {
      en: "Classical texts call Pushya the most nourishing of stars, linked to Brihaspati and ruled by Saturn — the nurturer that feeds and sustains. Those born under it are described as caring, dutiful and steady, offering shelter and support to those around them.",
      hi: "शास्त्र पुष्य को सर्वाधिक पोषक नक्षत्र कहते हैं, जो बृहस्पति से जुड़ा और शनि द्वारा शासित है — पालन-पोषण करने वाला, जो भरण व आधार देता है। इसमें जन्मे व्यक्ति सहृदय, कर्तव्यनिष्ठ व स्थिर कहे गए हैं, जो अपने आस-पास वालों को आश्रय व सहारा देते हैं।",
    },
    strengths: {
      en: "The tradition associates Pushya with devotion, reliability, a nurturing spirit, and a quiet spiritual steadiness.",
      hi: "परम्परा पुष्य को भक्ति, विश्वसनीयता, पोषक भाव, और एक शान्त आध्यात्मिक स्थिरता से जोड़ती है।",
    },
    source: SRC, status: "sourced",
  },
  { // 8 Ashlesha
    nature: {
      en: "Classical texts place Ashlesha under the Nagas, the serpent deities, ruled by Mercury — a star of penetrating insight and quiet magnetism. Those born under it are described as perceptive and charming, reading others closely while guarding their own inner world.",
      hi: "शास्त्र आश्लेषा को नाग — सर्प-देवताओं — के अधीन और बुध द्वारा शासित रखते हैं; यह भेदक अन्तर्दृष्टि व मौन आकर्षण का नक्षत्र है। इसमें जन्मे व्यक्ति सूक्ष्मदर्शी व आकर्षक कहे गए हैं, जो दूसरों को गहराई से पढ़ते हुए अपने भीतरी संसार की रक्षा करते हैं।",
    },
    strengths: {
      en: "The tradition associates Ashlesha with deep insight, persuasive presence, resourcefulness, and a protective instinct toward what it holds dear.",
      hi: "परम्परा आश्लेषा को गहन अन्तर्दृष्टि, प्रभावशाली उपस्थिति, साधन-सम्पन्नता, और अपने प्रियजनों के प्रति रक्षक प्रवृत्ति से जोड़ती है।",
    },
    source: SRC, status: "sourced",
  },
  { // 9 Magha
    nature: {
      en: "Classical texts link Magha to the Pitris, the honoured ancestors, ruled by Ketu, with the throne as its symbol — a regal, dignified star. Those born under it are described as proud in the noble sense, respectful of lineage, and seeking a place of honour of their own.",
      hi: "शास्त्र मघा को पितृ — पूज्य पूर्वजों — से जोड़ते हैं; केतु द्वारा शासित, सिंहासन जिसका प्रतीक है — यह राजसी, गरिमामय नक्षत्र है। इसमें जन्मे व्यक्ति श्रेष्ठ अर्थों में स्वाभिमानी, वंश-परम्परा के आदरकर्ता और अपने लिए सम्मान का स्थान चाहने वाले कहे गए हैं।",
    },
    strengths: {
      en: "The tradition associates Magha with natural leadership, dignity, generosity, and deep respect for tradition and those who came before.",
      hi: "परम्परा मघा को सहज नेतृत्व, गरिमा, उदारता, और परम्परा व पूर्वजों के प्रति गहरे आदर से जोड़ती है।",
    },
    source: SRC, status: "sourced",
  },
  { // 10 Purva Phalguni
    nature: {
      en: "Classical texts place Purva Phalguni under Bhaga, giver of delight and good fortune, ruled by Venus — a star of pleasure, art and warmth. Those born under it are described as generous and creative, able to enjoy life and to offer that same ease to others.",
      hi: "शास्त्र पूर्वाफाल्गुनी को भग — आनन्द व सौभाग्य के दाता — के अधीन और शुक्र द्वारा शासित रखते हैं; यह सुख, कला व ऊष्मा का नक्षत्र है। इसमें जन्मे व्यक्ति उदार व सृजनशील कहे गए हैं, जो जीवन का आनन्द लेकर वही सहजता दूसरों को भी देते हैं।",
    },
    strengths: {
      en: "The tradition associates Purva Phalguni with warmth, artistry, generosity, and a gift for creating joy and rest.",
      hi: "परम्परा पूर्वाफाल्गुनी को ऊष्मा, कलात्मकता, उदारता, और आनन्द व विश्राम रचने की क्षमता से जोड़ती है।",
    },
    source: SRC, status: "sourced",
  },
  { // 11 Uttara Phalguni
    nature: {
      en: "Classical texts link Uttara Phalguni to Aryaman, guardian of friendship and honoured promises, ruled by the Sun — a star of steady patronage. Those born under it are described as loyal, generous through their commitments, and reliable in keeping their word.",
      hi: "शास्त्र उत्तराफाल्गुनी को अर्यमा — मित्रता व वचन के संरक्षक — से जोड़ते हैं; सूर्य द्वारा शासित यह स्थिर संरक्षण का नक्षत्र है। इसमें जन्मे व्यक्ति निष्ठावान, अपने वचनों के माध्यम से उदार और वचन-पालन में विश्वसनीय कहे गए हैं।",
    },
    strengths: {
      en: "The tradition associates Uttara Phalguni with loyalty, steady generosity, helpfulness, and dependability in friendship and agreements.",
      hi: "परम्परा उत्तराफाल्गुनी को निष्ठा, स्थिर उदारता, सहायकता, और मित्रता व करार में विश्वसनीयता से जोड़ती है।",
    },
    source: SRC, status: "sourced",
  },
  { // 12 Hasta
    nature: {
      en: "Classical texts place Hasta under Savitar, the inspiring Sun, ruled by the Moon, with the open hand as its symbol — a star of skill and craft. Those born under it are described as dexterous and quick-witted, able to grasp an idea and shape it into something real.",
      hi: "शास्त्र हस्त को सवितृ — प्रेरक सूर्य — के अधीन और चन्द्र द्वारा शासित रखते हैं; खुला हाथ जिसका प्रतीक है — यह कौशल व शिल्प का नक्षत्र है। इसमें जन्मे व्यक्ति निपुण व कुशाग्र-बुद्धि कहे गए हैं, जो किसी विचार को पकड़कर उसे साकार रूप देते हैं।",
    },
    strengths: {
      en: "The tradition associates Hasta with manual skill, cleverness, craftsmanship, and a gift for turning intention into tangible work.",
      hi: "परम्परा हस्त को हस्त-कौशल, चतुराई, शिल्पकारिता, और संकल्प को ठोस कार्य में बदलने की क्षमता से जोड़ती है।",
    },
    source: SRC, status: "sourced",
  },
  { // 13 Chitra
    nature: {
      en: "Classical texts link Chitra to Tvashtar, the celestial architect, ruled by Mars, with a bright jewel as its symbol — a star of design and brilliance. Those born under it are described as artistic and charismatic, with a natural eye for form, beauty and striking creation.",
      hi: "शास्त्र चित्रा को त्वष्टा — दिव्य शिल्पी — से जोड़ते हैं; मंगल द्वारा शासित, उज्ज्वल मणि जिसका प्रतीक है — यह रचना-कौशल व तेज का नक्षत्र है। इसमें जन्मे व्यक्ति कलात्मक व तेजस्वी कहे गए हैं, जिनमें रूप, सौन्दर्य व प्रभावशाली सृजन की सहज दृष्टि होती है।",
    },
    strengths: {
      en: "The tradition associates Chitra with a designer's eye, craftsmanship, charisma, and a gift for creating beauty that stands out.",
      hi: "परम्परा चित्रा को रचनाकार की दृष्टि, शिल्प-कौशल, तेजस्विता, और विशिष्ट सौन्दर्य रचने की क्षमता से जोड़ती है।",
    },
    source: SRC, status: "sourced",
  },
  { // 14 Swati
    nature: {
      en: "Classical texts place Swati under Vayu, the wind, ruled by Rahu, with a young shoot swaying freely as its symbol — a star of independence. Those born under it are described as self-reliant and flexible, bending like a reed yet keeping their own direction.",
      hi: "शास्त्र स्वाति को वायु के अधीन और राहु द्वारा शासित रखते हैं; स्वतन्त्र रूप से झूमता कोमल अंकुर जिसका प्रतीक है — यह स्वतन्त्रता का नक्षत्र है। इसमें जन्मे व्यक्ति आत्मनिर्भर व लचीले कहे गए हैं, जो नरकट-सा झुकते हुए भी अपनी दिशा बनाए रखते हैं।",
    },
    strengths: {
      en: "The tradition associates Swati with independence, adaptability, diplomacy, and the resourcefulness to make one's own way.",
      hi: "परम्परा स्वाति को स्वतन्त्रता, अनुकूलनशीलता, कूटनीति, और अपना मार्ग स्वयं बनाने की सूझ-बूझ से जोड़ती है।",
    },
    source: SRC, status: "sourced",
  },
  { // 15 Vishakha
    nature: {
      en: "Classical texts link Vishakha to Indra and Agni, ruled by Jupiter, with a triumphal gateway as its symbol — a star of determined purpose. Those born under it are described as ambitious and focused, willing to work long and patiently toward a chosen goal.",
      hi: "शास्त्र विशाखा को इन्द्र व अग्नि से जोड़ते हैं; बृहस्पति द्वारा शासित, विजय-द्वार जिसका प्रतीक है — यह दृढ़ संकल्प का नक्षत्र है। इसमें जन्मे व्यक्ति महत्वाकांक्षी व एकाग्र कहे गए हैं, जो चुने हुए लक्ष्य की ओर दीर्घ व धैर्यपूर्वक परिश्रम करने को तत्पर रहते हैं।",
    },
    strengths: {
      en: "The tradition associates Vishakha with determination, focus, patience, and the capacity for sustained effort that ends in achievement.",
      hi: "परम्परा विशाखा को दृढ़ निश्चय, एकाग्रता, धैर्य, और सतत परिश्रम की उस क्षमता से जोड़ती है जो उपलब्धि में परिणत होती है।",
    },
    source: SRC, status: "sourced",
  },
  { // 16 Anuradha
    nature: {
      en: "Classical texts place Anuradha under Mitra, the god of friendship, ruled by Saturn — a star of devotion and fellowship. Those born under it are described as loyal and disciplined of heart, able to build warm bonds and to thrive even far from home.",
      hi: "शास्त्र अनुराधा को मित्र — मैत्री के देवता — के अधीन और शनि द्वारा शासित रखते हैं; यह भक्ति व सहचर्य का नक्षत्र है। इसमें जन्मे व्यक्ति निष्ठावान व अनुशासित-हृदय कहे गए हैं, जो ऊष्मापूर्ण सम्बन्ध बना पाते हैं और घर से दूर रहकर भी फलते-फूलते हैं।",
    },
    strengths: {
      en: "The tradition associates Anuradha with friendship, devotion, discipline, and a gift for cooperation that works well among many people.",
      hi: "परम्परा अनुराधा को मैत्री, भक्ति, अनुशासन, और अनेक लोगों के बीच सफल सहयोग की क्षमता से जोड़ती है।",
    },
    source: SRC, status: "sourced",
  },
  { // 17 Jyeshtha
    nature: {
      en: "Classical texts link Jyeshtha to Indra, king of the gods, ruled by Mercury — the eldest star, marked by seniority and responsibility. Those born under it are described as protective and intense, carrying the elder's burden and drawn to what lies beneath the surface.",
      hi: "शास्त्र ज्येष्ठा को देवराज इन्द्र से जोड़ते हैं; बुध द्वारा शासित यह ज्येष्ठ नक्षत्र है, जो वरिष्ठता व उत्तरदायित्व से चिह्नित है। इसमें जन्मे व्यक्ति रक्षक व गहन कहे गए हैं, जो बड़े का भार वहन करते हैं और सतह के नीचे छिपे को जानने की ओर झुके रहते हैं।",
    },
    strengths: {
      en: "The tradition associates Jyeshtha with protective leadership, courage, a strong sense of responsibility, and resourcefulness under pressure.",
      hi: "परम्परा ज्येष्ठा को रक्षक नेतृत्व, साहस, प्रबल उत्तरदायित्व-बोध, और दबाव में साधन-सम्पन्नता से जोड़ती है।",
    },
    source: SRC, status: "sourced",
  },
  { // 18 Mula
    nature: {
      en: "Classical texts place Mula under Nirriti, the power that clears away the old, ruled by Ketu, with a bundle of roots as its symbol — a star of getting to the root of things. Those born under it are described as truth-seeking and unafraid to dig deep, clearing what is worn out to make room for the new.",
      hi: "शास्त्र मूल को निरृति — जो पुराने को हटाती है, उस शक्ति — के अधीन और केतु द्वारा शासित रखते हैं; जड़ों का गुच्छा जिसका प्रतीक है — यह मूल तक पहुँचने का नक्षत्र है। इसमें जन्मे व्यक्ति सत्य-अन्वेषी और गहराई तक खोदने से न घबराने वाले कहे गए हैं, जो जीर्ण को हटाकर नए के लिए स्थान बनाते हैं।",
    },
    strengths: {
      en: "The tradition associates Mula with truth-seeking, philosophical depth, the courage to rebuild from the ground up, and a probing, investigative mind.",
      hi: "परम्परा मूल को सत्य-अन्वेषण, दार्शनिक गहराई, आधार से पुनर्निर्माण का साहस, और खोजपूर्ण, अन्वेषी बुद्धि से जोड़ती है।",
    },
    source: SRC, status: "sourced",
  },
  { // 19 Purva Ashadha
    nature: {
      en: "Classical texts link Purva Ashadha to Apas, the primal waters, ruled by Venus — 'the invincible star', named for early victory. Those born under it are described as confident and convinced, carrying an unshakeable belief that lifts the spirits of those around them.",
      hi: "शास्त्र पूर्वाषाढ़ा को आप् — आदि जल — से जोड़ते हैं; शुक्र द्वारा शासित यह 'अपराजित नक्षत्र' है, जो शीघ्र विजय के लिए जाना जाता है। इसमें जन्मे व्यक्ति आत्मविश्वासी व दृढ़-विश्वासी कहे गए हैं, जिनमें एक अडिग आस्था होती है जो आस-पास वालों का उत्साह बढ़ाती है।",
    },
    strengths: {
      en: "The tradition associates Purva Ashadha with conviction, persuasiveness, resilience, and a gift for inspiring confidence in others.",
      hi: "परम्परा पूर्वाषाढ़ा को दृढ़ विश्वास, प्रभावशीलता, लचीलापन, और दूसरों में आत्मविश्वास जगाने की क्षमता से जोड़ती है।",
    },
    source: SRC, status: "sourced",
  },
  { // 20 Uttara Ashadha
    nature: {
      en: "Classical texts place Uttara Ashadha under the Vishvadevas, the universal gods, ruled by the Sun — the star of lasting victory won through integrity. Those born under it are described as principled and enduring, earning wide respect for triumphs that hold because they were earned honestly.",
      hi: "शास्त्र उत्तराषाढ़ा को विश्वेदेवा — सार्वभौमिक देवों — के अधीन और सूर्य द्वारा शासित रखते हैं; यह सत्यनिष्ठा से अर्जित स्थायी विजय का नक्षत्र है। इसमें जन्मे व्यक्ति सिद्धान्तनिष्ठ व सहनशील कहे गए हैं, जो ऐसी विजयों के लिए व्यापक सम्मान पाते हैं जो ईमानदारी से अर्जित होने के कारण टिकती हैं।",
    },
    strengths: {
      en: "The tradition associates Uttara Ashadha with integrity, perseverance, principled resolve, and leadership that lasts.",
      hi: "परम्परा उत्तराषाढ़ा को सत्यनिष्ठा, दृढ़ता, सिद्धान्तनिष्ठ संकल्प, और टिकाऊ नेतृत्व से जोड़ती है।",
    },
    source: SRC, status: "sourced",
  },
  { // 21 Shravana
    nature: {
      en: "Classical texts link Shravana to Vishnu, ruled by the Moon, with the ear as its symbol — the listening star. Those born under it are described as attentive learners, gathering knowledge through careful listening and earning regard for what they come to understand and share.",
      hi: "शास्त्र श्रवण को विष्णु से जोड़ते हैं; चन्द्र द्वारा शासित, कान जिसका प्रतीक है — यह श्रवण का नक्षत्र है। इसमें जन्मे व्यक्ति ध्यानपूर्वक सुनने वाले शिक्षार्थी कहे गए हैं, जो सावधान श्रवण से ज्ञान संचित करते हैं और जो समझते व साझा करते हैं, उसके लिए आदर पाते हैं।",
    },
    strengths: {
      en: "The tradition associates Shravana with deep listening, learning, clear communication, and recognition earned through knowledge.",
      hi: "परम्परा श्रवण को गहन श्रवण, अध्ययन, स्पष्ट सम्प्रेषण, और ज्ञान से अर्जित पहचान से जोड़ती है।",
    },
    source: SRC, status: "sourced",
  },
  { // 22 Dhanishta
    nature: {
      en: "Classical texts place Dhanishta under the Vasus, gods of abundance, ruled by Mars, with a drum as its symbol — a star of rhythm and flow. Those born under it are described as musical and self-directed, keeping their own beat and associated in the tradition with abundance and generosity.",
      hi: "शास्त्र धनिष्ठा को वसु — समृद्धि के देवों — के अधीन और मंगल द्वारा शासित रखते हैं; ढोल जिसका प्रतीक है — यह लय व प्रवाह का नक्षत्र है। इसमें जन्मे व्यक्ति संगीतमय व स्वतन्त्र-चित्त कहे गए हैं, जो अपनी ही ताल पर चलते हैं और परम्परा में समृद्धि व उदारता से जुड़े हैं।",
    },
    strengths: {
      en: "The tradition associates Dhanishta with a sense of rhythm, musical and artistic talent, generosity, and the symbolism of abundance and flow.",
      hi: "परम्परा धनिष्ठा को लय-बोध, संगीत व कला की प्रतिभा, उदारता, और समृद्धि व प्रवाह के प्रतीकत्व से जोड़ती है।",
    },
    source: SRC, status: "sourced",
  },
  { // 23 Shatabhisha
    nature: {
      en: "Classical texts link Shatabhisha to Varuna, lord of the cosmic waters, ruled by Rahu, and call it 'the hundred healers' — a vast, mystical star. Those born under it are described as independent and private, drawn to hidden knowledge and to quiet forms of healing.",
      hi: "शास्त्र शतभिषा को वरुण — ब्रह्माण्डीय जल के स्वामी — से जोड़ते हैं; राहु द्वारा शासित, इसे 'सौ वैद्य' कहते हैं — यह विशाल, रहस्यमय नक्षत्र है। इसमें जन्मे व्यक्ति स्वतन्त्र व एकान्तप्रिय कहे गए हैं, जो गुप्त ज्ञान और उपचार के मौन रूपों की ओर झुके रहते हैं।",
    },
    strengths: {
      en: "The tradition associates Shatabhisha with a healer's insight, independence, research ability, and comfort with mystery and the unseen.",
      hi: "परम्परा शतभिषा को उपचारक की अन्तर्दृष्टि, स्वतन्त्रता, अनुसन्धान-क्षमता, और रहस्य व अदृश्य के प्रति सहजता से जोड़ती है।",
    },
    source: SRC, status: "sourced",
  },
  { // 24 Purva Bhadrapada
    nature: {
      en: "Classical texts place Purva Bhadrapada under Aja Ekapada, a fiery ascetic form, ruled by Jupiter — a star of intensity and idealism. Those born under it are described as deeply earnest and capable of great discipline, with a fierce inner fire held quietly beneath a calm surface.",
      hi: "शास्त्र पूर्वाभाद्रपद को अज एकपाद — एक तेजस्वी तपस्वी रूप — के अधीन और बृहस्पति द्वारा शासित रखते हैं; यह तीव्रता व आदर्शवाद का नक्षत्र है। इसमें जन्मे व्यक्ति गहन-निष्ठावान व महान अनुशासन में सक्षम कहे गए हैं, जिनकी प्रचण्ड भीतरी अग्नि शान्त सतह के नीचे मौन बनी रहती है।",
    },
    strengths: {
      en: "The tradition associates Purva Bhadrapada with intensity of purpose, idealism, spiritual discipline, and a capacity for wholehearted commitment.",
      hi: "परम्परा पूर्वाभाद्रपद को उद्देश्य की तीव्रता, आदर्शवाद, आध्यात्मिक अनुशासन, और पूर्ण-हृदय समर्पण की क्षमता से जोड़ती है।",
    },
    source: SRC, status: "sourced",
  },
  { // 25 Uttara Bhadrapada
    nature: {
      en: "Classical texts link Uttara Bhadrapada to Ahir Budhnya, the serpent of the depths, ruled by Saturn — a star of calm wisdom. Those born under it are described as deep and compassionate, steady in their progress and self-possessed even in turbulent waters.",
      hi: "शास्त्र उत्तराभाद्रपद को अहिर्बुध्न्य — गहराइयों के सर्प — से जोड़ते हैं; शनि द्वारा शासित यह शान्त प्रज्ञा का नक्षत्र है। इसमें जन्मे व्यक्ति गहन व करुणाशील कहे गए हैं, जो अपनी प्रगति में स्थिर और अशान्त जल में भी आत्म-संयत रहते हैं।",
    },
    strengths: {
      en: "The tradition associates Uttara Bhadrapada with wisdom, compassion, patience, self-control, and a steady, unshowy depth.",
      hi: "परम्परा उत्तराभाद्रपद को प्रज्ञा, करुणा, धैर्य, आत्म-संयम, और स्थिर, अनाडम्बर गहराई से जोड़ती है।",
    },
    source: SRC, status: "sourced",
  },
  { // 26 Revati
    nature: {
      en: "Classical texts place Revati under Pushan, protector of travellers and herds, ruled by Mercury, with a fish as its symbol — a gentle, nourishing star of safe passage. Those born under it are described as kind and caring, guiding others along their way and bringing things to a gentle completion.",
      hi: "शास्त्र रेवती को पूषन — यात्रियों व पशुओं के रक्षक — के अधीन और बुध द्वारा शासित रखते हैं; मछली जिसका प्रतीक है — यह सुरक्षित यात्रा का कोमल, पोषक नक्षत्र है। इसमें जन्मे व्यक्ति दयालु व सहृदय कहे गए हैं, जो दूसरों को उनके मार्ग पर ले चलते हैं और कार्यों को कोमल पूर्णता तक पहुँचाते हैं।",
    },
    strengths: {
      en: "The tradition associates Revati with kindness, a nurturing and protective spirit, guidance of others, and a gift for bringing journeys to a gentle close.",
      hi: "परम्परा रेवती को दयालुता, पोषक व रक्षक भाव, दूसरों का मार्गदर्शन, और यात्राओं को कोमल पूर्णता तक पहुँचाने की क्षमता से जोड़ती है।",
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
      en: "With the Moon in Mesha, classical texts describe a quick, courageous mind — decisive, direct, happiest when acting on an impulse rather than sitting with it.",
      hi: "मेष में चन्द्र होने पर शास्त्र तीव्र, साहसी मन का वर्णन करते हैं — निर्णायक, स्पष्ट, जो सोचने से अधिक तुरन्त कर्म में प्रसन्न रहता है।",
    },
    relating: {
      en: "In relationships the tradition associates Mesha with warmth and frankness — loyal and protective, quick to spark and quick to forgive.",
      hi: "सम्बन्धों में परम्परा मेष को ऊष्मा व स्पष्टवादिता से जोड़ती है — निष्ठावान व रक्षक, शीघ्र उत्तेजित और शीघ्र क्षमाशील।",
    },
    work: {
      en: "Classical texts lean Mesha toward pioneering, leading, and physically energetic work — starting ventures more than maintaining them.",
      hi: "शास्त्र मेष को अग्रणी, नेतृत्वकारी और शारीरिक रूप से ऊर्जावान कार्य की ओर झुकाते हैं — कार्य आरम्भ करने में, बनाए रखने से अधिक।",
    },
    outward: {
      en: "With Mesha rising, the tradition describes a direct, energetic first impression — others tend to meet a confident, forthright presence.",
      hi: "मेष लग्न होने पर परम्परा स्पष्ट, ऊर्जावान प्रथम-छवि का वर्णन करती है — लोग प्रायः एक आत्मविश्वासी, मुखर उपस्थिति से मिलते हैं।",
    },
    source: SRC, status: "sourced",
  },
  { // 1 Taurus / Vrishabha
    mind: {
      en: "With the Moon in Vrishabha — where classical texts call it exalted — the mind is described as steady, patient and sensuous, seeking comfort, beauty and what endures.",
      hi: "वृषभ में चन्द्र होने पर — जहाँ शास्त्र उसे उच्च का कहते हैं — मन स्थिर, धैर्यवान व रसिक बताया गया है, जो सुख, सौन्दर्य और स्थायित्व की खोज करता है।",
    },
    relating: {
      en: "In relationships the tradition associates Vrishabha with loyalty, warmth and constancy — slow to give trust, steadfast once it is given.",
      hi: "सम्बन्धों में परम्परा वृषभ को निष्ठा, ऊष्मा व स्थिरता से जोड़ती है — विश्वास देने में धीमा, एक बार दे देने पर अटल।",
    },
    work: {
      en: "Classical texts lean Vrishabha toward patient, tangible and value-building work — finance, land, food, art and craft.",
      hi: "शास्त्र वृषभ को धैर्यपूर्ण, ठोस और मूल्य-निर्माण वाले कार्य की ओर झुकाते हैं — वित्त, भूमि, भोजन, कला व शिल्प।",
    },
    outward: {
      en: "With Vrishabha rising, the tradition describes a calm, grounded first impression — others tend to meet a steady, reassuring presence.",
      hi: "वृषभ लग्न होने पर परम्परा शान्त, स्थिर प्रथम-छवि का वर्णन करती है — लोग प्रायः एक स्थिर, आश्वस्त करती उपस्थिति से मिलते हैं।",
    },
    source: SRC, status: "sourced",
  },
  { // 2 Gemini / Mithuna
    mind: {
      en: "With the Moon in Mithuna, classical texts describe a quick, versatile mind — curious, communicative and lively, happiest when it has many things to think about and talk over.",
      hi: "मिथुन में चन्द्र होने पर शास्त्र तीव्र, बहुमुखी मन का वर्णन करते हैं — जिज्ञासु, संवादप्रिय व चंचल, जो अनेक विषयों पर सोचने व बातचीत करने में सर्वाधिक प्रसन्न रहता है।",
    },
    relating: {
      en: "In relationships the tradition associates Mithuna with playfulness and good conversation — drawn to those who keep the mind engaged, warm through words and shared curiosity.",
      hi: "सम्बन्धों में परम्परा मिथुन को विनोदप्रियता व अच्छे संवाद से जोड़ती है — जो मन को व्यस्त रखने वालों की ओर आकर्षित होता है, शब्दों व साझा जिज्ञासा से ऊष्मा पाता है।",
    },
    work: {
      en: "Classical texts lean Mithuna toward communication, writing, teaching and trade — any work that turns on ideas and quick exchange.",
      hi: "शास्त्र मिथुन को सम्प्रेषण, लेखन, अध्यापन व व्यापार की ओर झुकाते हैं — हर वह कार्य जो विचारों व त्वरित आदान-प्रदान पर टिका हो।",
    },
    outward: {
      en: "With Mithuna rising, the tradition describes a witty, youthful first impression — others tend to meet a talkative, quicksilver presence full of curiosity.",
      hi: "मिथुन लग्न होने पर परम्परा विनोदी, युवा प्रथम-छवि का वर्णन करती है — लोग प्रायः एक वाचाल, चंचल व जिज्ञासा से भरी उपस्थिति से मिलते हैं।",
    },
    source: SRC, status: "sourced",
  },
  { // 3 Cancer / Karka
    mind: {
      en: "With the Moon in Karka — its own sign — classical texts describe a deeply feeling, receptive mind, rich in memory and tender toward home, family and the past.",
      hi: "कर्क में चन्द्र होने पर — अपनी ही राशि में — शास्त्र गहन-संवेदनशील, ग्रहणशील मन का वर्णन करते हैं, जो स्मृति से समृद्ध और घर, परिवार व अतीत के प्रति कोमल होता है।",
    },
    relating: {
      en: "In relationships the tradition associates Karka with nurturing and protectiveness — bonding deeply, valuing emotional safety, and caring for loved ones like family.",
      hi: "सम्बन्धों में परम्परा कर्क को पालन-पोषण व रक्षा-भाव से जोड़ती है — जो गहराई से जुड़ता है, भावनात्मक सुरक्षा को महत्व देता है, और प्रियजनों की परिवार-सी देखभाल करता है।",
    },
    work: {
      en: "Classical texts lean Karka toward caregiving, hospitality, food and history — any work that shelters, feeds or preserves.",
      hi: "शास्त्र कर्क को देखभाल, आतिथ्य, भोजन व इतिहास की ओर झुकाते हैं — हर वह कार्य जो आश्रय दे, पोषण करे या संजोए।",
    },
    outward: {
      en: "With Karka rising, the tradition describes a gentle, caring first impression — others tend to meet a warm, protective presence attuned to feeling.",
      hi: "कर्क लग्न होने पर परम्परा कोमल, स्नेहिल प्रथम-छवि का वर्णन करती है — लोग प्रायः एक ऊष्मापूर्ण, रक्षक व भाव के प्रति संवेदनशील उपस्थिति से मिलते हैं।",
    },
    source: SRC, status: "sourced",
  },
  { // 4 Leo / Simha
    mind: {
      en: "With the Moon in Simha, classical texts describe a warm, proud and generous mind — dignified and expressive, happiest when it can give freely and be genuinely appreciated.",
      hi: "सिंह में चन्द्र होने पर शास्त्र ऊष्मापूर्ण, स्वाभिमानी व उदार मन का वर्णन करते हैं — गरिमामय व अभिव्यंजक, जो खुलकर देने और सच्चे मन से सराहे जाने में सर्वाधिक प्रसन्न रहता है।",
    },
    relating: {
      en: "In relationships the tradition associates Simha with loyalty and grand-hearted warmth — loving generously and protectively, and flourishing where affection is openly returned.",
      hi: "सम्बन्धों में परम्परा सिंह को निष्ठा व विशाल-हृदय ऊष्मा से जोड़ती है — जो उदारता व रक्षा-भाव से प्रेम करता है, और जहाँ स्नेह खुलकर लौटाया जाता है वहाँ फलता-फूलता है।",
    },
    work: {
      en: "Classical texts lean Simha toward leadership, performance and creative authority — any work with visibility, dignity and room to inspire.",
      hi: "शास्त्र सिंह को नेतृत्व, प्रदर्शन व सृजनात्मक अधिकार की ओर झुकाते हैं — हर वह कार्य जिसमें दृश्यता, गरिमा और प्रेरित करने का अवकाश हो।",
    },
    outward: {
      en: "With Simha rising, the tradition describes a dignified, radiant first impression — others tend to meet a confident, generous and commanding presence.",
      hi: "सिंह लग्न होने पर परम्परा गरिमामय, तेजस्वी प्रथम-छवि का वर्णन करती है — लोग प्रायः एक आत्मविश्वासी, उदार व प्रभावशाली उपस्थिति से मिलते हैं।",
    },
    source: SRC, status: "sourced",
  },
  { // 5 Virgo / Kanya
    mind: {
      en: "With the Moon in Kanya, classical texts describe a discerning, analytical mind — precise and observant, attentive to detail and quietly intent on getting things right.",
      hi: "कन्या में चन्द्र होने पर शास्त्र विवेकी, विश्लेषणात्मक मन का वर्णन करते हैं — सूक्ष्म व सतर्क, विस्तार पर ध्यान देने वाला और चुपचाप कार्य को सही करने में लगा रहने वाला।",
    },
    relating: {
      en: "In relationships the tradition associates Kanya with care shown through service — modest and thoughtful, expressing affection in practical, helpful acts rather than display.",
      hi: "सम्बन्धों में परम्परा कन्या को सेवा के माध्यम से प्रकट स्नेह से जोड़ती है — विनम्र व विचारशील, जो प्रेम को दिखावे से नहीं, बल्कि व्यावहारिक, सहायक कर्मों में व्यक्त करता है।",
    },
    work: {
      en: "Classical texts lean Kanya toward analysis, healing, craft, editing and service — any work rewarding precision, skill and a careful eye.",
      hi: "शास्त्र कन्या को विश्लेषण, उपचार, शिल्प, सम्पादन व सेवा की ओर झुकाते हैं — हर वह कार्य जो सूक्ष्मता, कौशल व सावधान दृष्टि को पुरस्कृत करे।",
    },
    outward: {
      en: "With Kanya rising, the tradition describes a modest, precise first impression — others tend to meet an observant, capable and unassuming presence.",
      hi: "कन्या लग्न होने पर परम्परा विनम्र, सुनिश्चित प्रथम-छवि का वर्णन करती है — लोग प्रायः एक सतर्क, सक्षम व सरल उपस्थिति से मिलते हैं।",
    },
    source: SRC, status: "sourced",
  },
  { // 6 Libra / Tula
    mind: {
      en: "With the Moon in Tula, classical texts describe a balance-seeking, harmonious mind — sociable and fair-minded, at ease with beauty and uneasy with discord.",
      hi: "तुला में चन्द्र होने पर शास्त्र सन्तुलन-प्रिय, सामंजस्यपूर्ण मन का वर्णन करते हैं — मिलनसार व न्यायप्रिय, जो सौन्दर्य में सहज और कलह में असहज रहता है।",
    },
    relating: {
      en: "In relationships the tradition associates Tula with grace and partnership — diplomatic and considerate, thriving in companionship and drawn toward fairness and mutual regard.",
      hi: "सम्बन्धों में परम्परा तुला को शालीनता व साझेदारी से जोड़ती है — कूटनीतिक व विचारशील, जो सहचर्य में फलता-फूलता है और निष्पक्षता व परस्पर आदर की ओर झुकता है।",
    },
    work: {
      en: "Classical texts lean Tula toward diplomacy, art, design, law and mediation — any work that balances interests and brings people to agreement.",
      hi: "शास्त्र तुला को कूटनीति, कला, अभिकल्प, विधि व मध्यस्थता की ओर झुकाते हैं — हर वह कार्य जो हितों में सन्तुलन बनाए और लोगों को सहमति तक लाए।",
    },
    outward: {
      en: "With Tula rising, the tradition describes a gracious, pleasant first impression — others tend to meet a poised, agreeable and even-handed presence.",
      hi: "तुला लग्न होने पर परम्परा शालीन, सुखद प्रथम-छवि का वर्णन करती है — लोग प्रायः एक संयत, सौम्य व सन्तुलित उपस्थिति से मिलते हैं।",
    },
    source: SRC, status: "sourced",
  },
  { // 7 Scorpio / Vrishchika
    mind: {
      en: "With the Moon in Vrishchika — where classical texts call it debilitated — the mind is described as intense and deeply feeling, private and powerful, tempered and strengthened through what it endures.",
      hi: "वृश्चिक में चन्द्र होने पर — जहाँ शास्त्र उसे नीच का कहते हैं — मन तीव्र व गहन-संवेदनशील, गोपनशील व प्रबल बताया गया है, जो अपने सहे हुए अनुभवों से परिष्कृत व सुदृढ़ होता है।",
    },
    relating: {
      en: "In relationships the tradition associates Vrishchika with intensity and fierce loyalty — private and all-or-nothing, forming deep bonds where trust has been truly earned.",
      hi: "सम्बन्धों में परम्परा वृश्चिक को तीव्रता व प्रबल निष्ठा से जोड़ती है — गोपनशील व पूर्ण-समर्पित, जो वहीं गहरे सम्बन्ध बनाता है जहाँ विश्वास सचमुच अर्जित हुआ हो।",
    },
    work: {
      en: "Classical texts lean Vrishchika toward research, investigation, healing and depth — any work that uncovers what is hidden and transforms it.",
      hi: "शास्त्र वृश्चिक को अनुसन्धान, अन्वेषण, उपचार व गहराई की ओर झुकाते हैं — हर वह कार्य जो छिपे हुए को उजागर करे और उसका रूपान्तर करे।",
    },
    outward: {
      en: "With Vrishchika rising, the tradition describes a magnetic, reserved first impression — others tend to meet an intense, penetrating presence that reveals itself slowly.",
      hi: "वृश्चिक लग्न होने पर परम्परा आकर्षक, संयमित प्रथम-छवि का वर्णन करती है — लोग प्रायः एक तीव्र, भेदक उपस्थिति से मिलते हैं जो स्वयं को धीरे-धीरे प्रकट करती है।",
    },
    source: SRC, status: "sourced",
  },
  { // 8 Sagittarius / Dhanu
    mind: {
      en: "With the Moon in Dhanu, classical texts describe an optimistic, philosophical mind — freedom-loving and forward-looking, happiest when reaching toward meaning, truth or a far horizon.",
      hi: "धनु में चन्द्र होने पर शास्त्र आशावादी, दार्शनिक मन का वर्णन करते हैं — स्वतन्त्रता-प्रिय व दूरदर्शी, जो अर्थ, सत्य या किसी दूर क्षितिज की ओर बढ़ने में सर्वाधिक प्रसन्न रहता है।",
    },
    relating: {
      en: "In relationships the tradition associates Dhanu with honesty and good cheer — warm and forthright, respecting a partner's freedom and valuing shared ideals and adventures.",
      hi: "सम्बन्धों में परम्परा धनु को स्पष्टता व प्रफुल्लता से जोड़ती है — ऊष्मापूर्ण व निष्कपट, जो साथी की स्वतन्त्रता का आदर करता है और साझा आदर्शों व अभियानों को महत्व देता है।",
    },
    work: {
      en: "Classical texts lean Dhanu toward teaching, philosophy, law, travel and guidance — any work that explores meaning and widens the horizon.",
      hi: "शास्त्र धनु को अध्यापन, दर्शन, विधि, यात्रा व मार्गदर्शन की ओर झुकाते हैं — हर वह कार्य जो अर्थ का अन्वेषण करे और क्षितिज को विस्तृत करे।",
    },
    outward: {
      en: "With Dhanu rising, the tradition describes an open, optimistic first impression — others tend to meet a frank, buoyant and adventurous presence.",
      hi: "धनु लग्न होने पर परम्परा खुली, आशावादी प्रथम-छवि का वर्णन करती है — लोग प्रायः एक निष्कपट, उत्साही व साहसिक उपस्थिति से मिलते हैं।",
    },
    source: SRC, status: "sourced",
  },
  { // 9 Capricorn / Makara
    mind: {
      en: "With the Moon in Makara, classical texts describe a serious, disciplined mind — patient and reserved, focused on lasting goals and steadied by a strong sense of duty.",
      hi: "मकर में चन्द्र होने पर शास्त्र गम्भीर, अनुशासित मन का वर्णन करते हैं — धैर्यवान व संयमित, जो स्थायी लक्ष्यों पर केन्द्रित और प्रबल कर्तव्य-बोध से स्थिर रहता है।",
    },
    relating: {
      en: "In relationships the tradition associates Makara with commitment and reliability — cautious to open up, yet steadfast and devoted, showing love through a steady, dependable presence.",
      hi: "सम्बन्धों में परम्परा मकर को प्रतिबद्धता व विश्वसनीयता से जोड़ती है — खुलने में सतर्क, फिर भी अटल व समर्पित, जो प्रेम को स्थिर, भरोसेमन्द उपस्थिति से व्यक्त करता है।",
    },
    work: {
      en: "Classical texts lean Makara toward administration, structure and long-term building — any work that rewards patience, discipline and a steady ascent.",
      hi: "शास्त्र मकर को प्रशासन, संरचना व दीर्घकालिक निर्माण की ओर झुकाते हैं — हर वह कार्य जो धैर्य, अनुशासन व स्थिर उन्नति को पुरस्कृत करे।",
    },
    outward: {
      en: "With Makara rising, the tradition describes a composed, serious first impression — others tend to meet a capable, self-contained and steady presence.",
      hi: "मकर लग्न होने पर परम्परा संयत, गम्भीर प्रथम-छवि का वर्णन करती है — लोग प्रायः एक सक्षम, आत्म-संयत व स्थिर उपस्थिति से मिलते हैं।",
    },
    source: SRC, status: "sourced",
  },
  { // 10 Aquarius / Kumbha
    mind: {
      en: "With the Moon in Kumbha, classical texts describe an independent, humanitarian mind — inventive and broad-thinking, valuing freedom, ideas and the good of the wider group.",
      hi: "कुम्भ में चन्द्र होने पर शास्त्र स्वतन्त्र, मानवतावादी मन का वर्णन करते हैं — आविष्कारशील व व्यापक-चिन्तनशील, जो स्वतन्त्रता, विचारों व व्यापक समूह के हित को महत्व देता है।",
    },
    relating: {
      en: "In relationships the tradition associates Kumbha with friendship and equality — cordial and open-minded, valuing companions as friends and needing room to breathe.",
      hi: "सम्बन्धों में परम्परा कुम्भ को मैत्री व समानता से जोड़ती है — सौहार्दपूर्ण व उदार-मन, जो साथियों को मित्र मानता है और खुलकर साँस लेने का अवकाश चाहता है।",
    },
    work: {
      en: "Classical texts lean Kumbha toward reform, science, community and innovation — any work that serves the collective or advances a new idea.",
      hi: "शास्त्र कुम्भ को सुधार, विज्ञान, समुदाय व नवाचार की ओर झुकाते हैं — हर वह कार्य जो समष्टि की सेवा करे या किसी नए विचार को आगे बढ़ाए।",
    },
    outward: {
      en: "With Kumbha rising, the tradition describes an original, cool-headed first impression — others tend to meet a thoughtful, unconventional and friendly presence.",
      hi: "कुम्भ लग्न होने पर परम्परा मौलिक, शान्त-मस्तिष्क प्रथम-छवि का वर्णन करती है — लोग प्रायः एक विचारशील, अपरम्परागत व मैत्रीपूर्ण उपस्थिति से मिलते हैं।",
    },
    source: SRC, status: "sourced",
  },
  { // 11 Pisces / Meena
    mind: {
      en: "With the Moon in Meena, classical texts describe a compassionate, imaginative mind — intuitive and sensitive, easily moved by beauty and feeling, quietly attuned to unspoken currents.",
      hi: "मीन में चन्द्र होने पर शास्त्र करुणाशील, कल्पनाशील मन का वर्णन करते हैं — सहज-बोध वाला व संवेदनशील, जो सौन्दर्य व भाव से सहज ही द्रवित होता है और अनकहे प्रवाहों के प्रति चुपचाप संवेदनशील रहता है।",
    },
    relating: {
      en: "In relationships the tradition associates Meena with tenderness and selfless love — empathetic and forgiving, absorbing others' feelings and giving of itself readily.",
      hi: "सम्बन्धों में परम्परा मीन को कोमलता व निःस्वार्थ प्रेम से जोड़ती है — सहानुभूतिपूर्ण व क्षमाशील, जो दूसरों के भावों को आत्मसात करता है और सहज ही स्वयं को अर्पित कर देता है।",
    },
    work: {
      en: "Classical texts lean Meena toward art, healing, spirituality and service — any work that draws on imagination, compassion and a feeling for the unseen.",
      hi: "शास्त्र मीन को कला, उपचार, अध्यात्म व सेवा की ओर झुकाते हैं — हर वह कार्य जो कल्पना, करुणा व अदृश्य के प्रति संवेदना पर आधारित हो।",
    },
    outward: {
      en: "With Meena rising, the tradition describes a gentle, dreamy first impression — others tend to meet a kind, receptive presence with soft, unguarded edges.",
      hi: "मीन लग्न होने पर परम्परा कोमल, स्वप्निल प्रथम-छवि का वर्णन करती है — लोग प्रायः एक दयालु, ग्रहणशील व सौम्य, निष्कवच उपस्थिति से मिलते हैं।",
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
