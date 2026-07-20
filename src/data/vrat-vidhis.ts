// Vrat vidhi content — extracted from kundli-app.tsx (EPIC-SPLIT).
// Pure data, no app logic: content agents can edit this file without touching the app.

/* Vrat vidhi content — sourced from plans/vrat-vidhis.md. User-facing copy only;
   implementation and editorial instructions stay in plans, never in this object. */
export const VRAT_VIDHI_LABELS = {
  hideHowTo: { en: "Hide observance steps", hi: "विधि छिपाएँ" },
  showHowTo: { en: "Observance steps", hi: "व्रत की विधि" },
  vidhi: { en: "Vidhi", hi: "विधि" },
  diet: { en: "Diet rules", hi: "आहार नियम" },
  avoid: { en: "Avoid", hi: "वर्जित" },
  lighter: { en: "Lighter options", hi: "हल्के विकल्प" },
  sankalpa: { en: "Sankalpa", hi: "संकल्प" },
  puja: { en: "Puja steps", hi: "पूजा" },
  paran: { en: "Paran", hi: "पारण" },
  udyapan: { en: "Udyapan", hi: "उद्यापन" },
  safety: { en: "Health note", hi: "स्वास्थ्य टिप्पणी" },
};
export const VRAT_VIDHI_SAFETY = {
  en: "This health note does not change the religious rule described below. Some vrats are traditionally nirjala (without food or water). Children, older people, anyone who is pregnant or breastfeeding, unwell, taking medicines, or living with diabetes, kidney disease or an eating disorder should seek medical advice and guidance from their family or religious tradition before observing a strict fast. Seek help if you become faint, confused, severely weak, cannot keep fluids down, or have unsafe blood-sugar symptoms. Never stop or retime prescribed medicine without medical advice.",
  hi: "यह स्वास्थ्य टिप्पणी नीचे लिखे धार्मिक नियम को नहीं बदलती। कुछ व्रत परम्परागत रूप से निर्जला (बिना अन्न-जल) रखे जाते हैं। बच्चे, वृद्ध, गर्भवती या स्तनपान कराने वाली महिलाएँ, अस्वस्थ व्यक्ति, दवा लेने वाले, मधुमेह, गुर्दे की बीमारी या ईटिंग-डिसऑर्डर वाले लोग कठोर व्रत से पहले चिकित्सकीय सलाह और अपनी कुल या धार्मिक परम्परा का मार्गदर्शन लें। चक्कर, भ्रम, अत्यधिक कमजोरी, पानी न रुकना या असुरक्षित रक्त-शर्करा लक्षण हों तो सहायता लें। चिकित्सकीय सलाह के बिना दवा बन्द न करें और न उसका समय बदलें।",
};

const VAT_SAVITRI_COMMON = Object.freeze({
  vidhi: [
    { en: "Bathe and prepare the offerings used in your family.", hi: "स्नान करके परिवार में प्रचलित पूजन-सामग्री तैयार करें।" },
    { en: "At a banyan tree, offer water and flowers and worship Savitri–Satyavan according to family custom.", hi: "वट-वृक्ष के पास जल और फूल अर्पित करके पारिवारिक रीति से सावित्री–सत्यवान का पूजन करें।" },
    { en: "Tie the sacred thread while making the customary pradakshina. Use your family's count rather than assuming one fixed number.", hi: "प्रदक्षिणा करते हुए पवित्र धागा बाँधें। कोई एक संख्या मानने के बजाय अपने परिवार में प्रचलित संख्या रखें।" },
    { en: "Read or hear the Savitri–Satyavan katha and pray for your husband's well-being and longevity and for dharma in married life.", hi: "सावित्री–सत्यवान की कथा पढ़ें या सुनें और पति के स्वास्थ्य, दीर्घायु तथा धर्ममय दाम्पत्य की प्रार्थना करें।" },
    { en: "If no suitable banyan is accessible, join a temple observance or ask your family priest or temple for its accepted practice; do not cut a living branch.", hi: "यदि वट-वृक्ष उपलब्ध न हो तो मंदिर के सामूहिक पूजन में सम्मिलित हों या परिवार-पुरोहित/मंदिर से मान्य विधि पूछें; जीवित शाखा न काटें।" },
  ],
  diet: {
    en: "The traditional observance includes a strict fast. Follow the exact food and water rule of your family or temple; the Amavasya and Purnima traditions do not share one universal menu.",
    hi: "पारंपरिक अनुष्ठान में कठोर उपवास शामिल है। भोजन और जल का ठीक वही नियम रखें जो आपके परिवार या मंदिर में मान्य है; अमावस्या और पूर्णिमा परंपराओं का एक सार्वभौमिक आहार-नियम नहीं है।",
  },
  sankalpa: {
    en: "“I remember Savitri's steadfast dharma and observe my family's vrata for my husband's well-being, longevity and a righteous married life.” This is a plain-language intention, not a prescribed Sanskrit mantra.",
    hi: "“मैं सावित्री के अडिग धर्म को स्मरण करते हुए अपने पति के स्वास्थ्य, दीर्घायु और धर्ममय दाम्पत्य के लिए अपने परिवार में प्रचलित व्रत रखती हूँ।” यह सरल भाव-संकल्प है, निर्धारित संस्कृत मंत्र नहीं।",
  },
  puja: {
    en: "Offer water and flowers at the banyan, worship Savitri–Satyavan, tie the thread with pradakshina, hear the katha and complete the family's customary prayer. A full shodashopachara puja may be done with a priest or established family procedure.",
    hi: "वट-वृक्ष को जल-फूल अर्पित करें, सावित्री–सत्यवान का पूजन करें, प्रदक्षिणा के साथ धागा बाँधें, कथा सुनें और पारिवारिक प्रार्थना पूरी करें। पूर्ण षोडशोपचार पूजा पुरोहित या स्थापित कुल-विधि से की जा सकती है।",
  },
  paran: {
    en: "Complete the fast according to the selected family or temple tradition. No single paran clock is established for both the Amavasya and Purnima forms.",
    hi: "चुनी हुई पारिवारिक या मंदिर परंपरा के अनुसार व्रत पूरा करें। अमावस्या और पूर्णिमा—दोनों रूपों के लिए एक ही पारण-समय स्थापित नहीं है।",
  },
  udyapan: {
    en: "No single universal udyapan is established. Complete a counted or specially undertaken vow with the family priest, guru or temple that gave its rules.",
    hi: "एक सार्वभौमिक उद्यापन स्थापित नहीं है। निश्चित संख्या या विशेष संकल्प का व्रत उसी परिवार-पुरोहित, गुरु या मंदिर के मार्गदर्शन में पूरा करें जहाँ से उसके नियम मिले हैं।",
  },
});

export const VRAT_VIDHI = {
  ekadashi: {
    verdict: {
      en: "Keep the Vishnu fast from local sunrise on Ekadashi until the Dwadashi paran time shown for your location. Avoid all grains and cereals even if you choose a lighter fast.",
      hi: "स्थानीय सूर्योदय से एकादशी व्रत रखें और अपने स्थान के लिए दिखाए द्वादशी पारण समय में खोलें। हल्का व्रत रखने पर भी सभी अनाज और धान्य छोड़ें।",
    },
    vidhi: [
      { en: "On Dashami, eat one simple satvik meal; avoid a late grain-heavy dinner.", hi: "दशमी को एक सरल सात्त्विक भोजन लें; देर रात भारी अन्न-भोजन न करें।" },
      { en: "At Ekadashi sunrise, state the chosen fasting level and intention. Spend the day in Vishnu/Krishna/Rama remembrance, japa, reading and service.", hi: "एकादशी सूर्योदय पर व्रत का स्तर और भाव-संकल्प बोलें। दिन विष्णु/कृष्ण/राम स्मरण, जप, पाठ और सेवा में बिताएँ।" },
      { en: "Worship Vishnu simply; offer Tulsi only where the household normally does so. Rest rather than treating a strict fast as an endurance test.", hi: "विष्णु की सरल पूजा करें; कुल-परम्परा हो तभी तुलसी चढ़ाएँ। कठोर व्रत को सहनशक्ति की परीक्षा न बनाएँ, आवश्यकता पर विश्राम करें।" },
      { en: "On Dwadashi, complete morning worship and break only inside the paran window shown for your location.", hi: "द्वादशी को प्रातः पूजा के बाद अपने स्थान के लिए दिखाए पारण समय में ही खोलें।" },
    ],
    dietAvoid: {
      en: "all rice, wheat, millet, corn, barley, pulses and foods made from grains; ordinary table salt if the family uses only sendha namak for vrat.",
      hi: "सभी चावल, गेहूँ, बाजरा, मक्का, जौ, दालें और अन्न-निर्मित पदार्थ; कुल-नियम हो तो साधारण नमक।",
    },
    dietLighter: {
      en: "water; fruit and milk; or one phalahar meal such as potato/sweet potato, fruit, dairy, nuts and family-approved vrat foods. Sabudana, samak and other pseudo-grains vary by lineage.",
      hi: "जल; फल-दूध; या आलू/शकरकंद, फल, दुग्ध, मेवे और कुल में मान्य व्रत-आहार। साबूदाना, सामक आदि पर मत अलग हैं।",
    },
    sankalpa: {
      en: "“Today I observe Ekadashi in remembrance of Shri Vishnu. May I keep it with steadiness, compassion and purity, within my health.”",
      hi: "“आज मैं श्रीविष्णु के स्मरण में एकादशी व्रत रखता/रखती हूँ। स्वास्थ्य की मर्यादा में इसे स्थिरता, करुणा और शुद्ध भाव से पूरा करूँ।”",
    },
    puja: {
      en: "Bathe; light a lamp; remember Ganesha; worship Vishnu/Krishna/Rama with water, flowers, Tulsi where customary and grain-free naivedya; chant a familiar Vishnu name or read/listen to the named Ekadashi katha; aarti.",
      hi: "स्नान, दीप, गणेश स्मरण; विष्णु/कृष्ण/राम को जल, फूल, परम्परानुसार तुलसी और अन्न-रहित भोग; परिचित विष्णु-नाम या उस एकादशी की कथा; आरती।",
    },
    paran: {
      en: "Use the Dwadashi window shown above. Do not break during Harivasara (the protected first quarter of Dwadashi). Begin gently with water and prasad, then a satvik meal; do not postpone beyond Dwadashi unless your tradition requires it. Smarta and Vaishnava dates can differ, so use the date and paran for your chosen tradition.",
      hi: "ऊपर दिखाया द्वादशी पारण समय मानें। हरिवासर (द्वादशी का निषिद्ध आरम्भिक भाग) में न खोलें। जल-प्रसाद से धीरे खोलकर सात्त्विक भोजन लें। आपकी परम्परा में आवश्यक न हो तो द्वादशी के बाद तक पारण न टालें। चुनी हुई स्मार्त या वैष्णव परम्परा का दिन और पारण ही मानें।",
    },
    udyapan: {
      en: "Not needed after an occasional fast. To conclude a long vowed series, arrange Vishnu-Lakshmi puja, havan and feeding or charity under a learned priest, according to your means.",
      hi: "कभी-कभार व्रत के बाद उद्यापन नहीं। दीर्घ संकल्पित श्रृंखला पूरी करने पर विद्वान पुरोहित के निर्देशन में विष्णु-लक्ष्मी पूजा, हवन और सामर्थ्य अनुसार भोजन/दान करें।",
    },
  },
  pradosh: {
    verdict: {
      en: "This twice-monthly Shiva observance falls when Trayodashi overlaps the local evening Pradosh period. Worship Shiva and Nandi in the time shown above.",
      hi: "यह मास में दो बार होने वाला शिव-व्रत उस दिन पड़ता है जब त्रयोदशी स्थानीय सायंकालीन प्रदोष से मिलती है। ऊपर दिखाए समय में शिव और नन्दी की पूजा करें।",
    },
    vidhi: [
      { en: "Bathe in the morning and choose full fast, phalahar or one satvik meal.", hi: "प्रातः स्नान कर पूर्ण उपवास, फलाहार या एक सात्त्विक भोजन चुनें।" },
      { en: "Keep the day quiet; repeat a familiar Shiva name. Bathe or wash before the evening puja.", hi: "दिन संयम से बिताएँ, परिचित शिव-नाम जपें; सायं पूजा से पहले स्नान या शुद्धि करें।" },
      { en: "During the Pradosh time shown above, worship Shiva and Nandi; at a temple, join abhisheka, archana and aarti.", hi: "ऊपर दिखाए प्रदोष समय में शिव-नन्दी पूजन करें; मंदिर में अभिषेक, अर्चना और आरती में सम्मिलित हो सकते हैं।" },
    ],
    diet: {
      en: "No single pan-Indian menu is established. Common household forms are water/fruit/milk through the day, or one salt-free/satvik meal. Follow the chosen family form.",
      hi: "पूरे भारत में एक ही आहार-विधि नहीं। सामान्य विकल्प दिन भर जल/फल/दूध या एक नमक-रहित/सात्त्विक भोजन हैं; कुल-परम्परा मानें।",
    },
    sankalpa: {
      en: "“I observe Pradosh in remembrance of Shiva and Parvati. May this evening bring steadiness, forgiveness and wise action.”",
      hi: "“मैं शिव-पार्वती के स्मरण में प्रदोष व्रत रखता/रखती हूँ। यह संध्या मुझे स्थिरता, क्षमा और विवेकपूर्ण कर्म दे।”",
    },
    puja: {
      en: "Lamp; Ganesha remembrance; Shiva-linga abhisheka with clean water (milk only if it can be used without waste); sandal/paste, flowers and bilva where available; Nandi namaskar; Shiva-Parvati prayer; aarti.",
      hi: "दीप, गणेश स्मरण, शिवलिंग का स्वच्छ जल से अभिषेक (दूध केवल बिना अपव्यय), चन्दन, फूल, उपलब्ध हो तो बिल्व; नन्दी प्रणाम; शिव-पार्वती प्रार्थना; आरती।",
    },
    paran: {
      en: "Break after the Pradosh puja with water/prasad and a light satvik meal. If it follows Ekadashi, the sourced strict convention permits symbolic Ekadashi paran with water before continuing Pradosh; health takes priority.",
      hi: "प्रदोष पूजा के बाद जल/प्रसाद और हल्के सात्त्विक भोजन से खोलें। एकादशी के अगले दिन हो तो कठोर परम्परा में जल से प्रतीकात्मक एकादशी पारण कर प्रदोष जारी रखा जाता है; स्वास्थ्य प्रधान है।",
    },
    udyapan: {
      en: "No universal requirement for ordinary monthly observance. A numbered vow should be concluded according to the original sankalpa with Shiva puja and charity under family guidance.",
      hi: "सामान्य मासिक व्रत में सार्वभौमिक उद्यापन नहीं। गिनती का संकल्प हो तो उसी संकल्प के अनुसार शिव-पूजा और दान से कुल-मार्गदर्शन में पूर्ण करें।",
    },
  },
  sankashti: {
    verdict: {
      en: "Ganesha fast from local sunrise until moonrise, on the day Chaturthi prevails at that location's moonrise.",
      hi: "स्थानीय सूर्योदय से चन्द्रोदय तक गणेश-व्रत, उस दिन जब आपके स्थान पर चन्द्रोदय के समय चतुर्थी हो।",
    },
    vidhi: [
      { en: "Bathe and take sankalpa after sunrise; keep a strict or phalahar fast; worship Ganesha in the evening; hear the month's Sankashti katha if your tradition uses it; after the local moonrise shown above, sight the moon if visible, offer water, pray, then break.", hi: "स्नान कर सूर्योदय बाद संकल्प लें; कठोर या फलाहार व्रत रखें; शाम को गणेश-पूजा और परम्परानुसार मास की कथा; ऊपर दिखाए स्थानीय चन्द्रोदय के बाद चन्द्र-दर्शन हो सके तो जल-अर्घ्य देकर प्रार्थना करें और व्रत खोलें।" },
    ],
    diet: {
      en: "Fruit, roots and vegetable foods are the sourced lighter form; common foods include sabudana, potato and peanuts. Avoid ordinary grains/pulses and follow family salt rules.",
      hi: "फल, कन्द और वनस्पति-आहार स्रोतों में हल्का विकल्प; साबूदाना, आलू और मूँगफली प्रचलित। सामान्य अन्न-दाल और कुलानुसार नमक छोड़ें।",
    },
    sankalpa: {
      en: "“I observe Sankashti in remembrance of Shri Ganesha. May obstacles be met with patience, clarity and right effort.”",
      hi: "“मैं श्रीगणेश के स्मरण में संकष्टी व्रत रखता/रखती हूँ। विघ्नों का सामना धैर्य, स्पष्टता और सही प्रयत्न से करूँ।”",
    },
    puja: {
      en: "Lamp; Ganesha meditation; water/abhisheka where suitable; red or available flowers, durva where customary, fruit or modak as naivedya; Ganesha name, katha and aarti; moon arghya after moonrise.",
      hi: "दीप, गणेश ध्यान, उपयुक्त हो तो जल-अभिषेक, लाल/उपलब्ध फूल, परम्परानुसार दूर्वा, फल या मोदक भोग, नाम-जप, कथा और आरती; चन्द्रोदय के बाद चन्द्र-अर्घ्य।",
    },
    paran: {
      en: "Break after the local moonrise and moon prayer. If clouds hide the moon, use the moonrise time shown above and your family rule rather than waiting indefinitely.",
      hi: "स्थानीय चन्द्रोदय और चन्द्र-प्रार्थना के बाद व्रत खोलें। बादल हों तो अनन्त प्रतीक्षा के बजाय ऊपर दिखाया चन्द्रोदय समय और कुल-नियम मानें।",
    },
    udyapan: {
      en: "No universal monthly requirement. Conclude a vowed series with Ganesha puja, prasad/feeding and charity as directed by the family priest.",
      hi: "सामान्य मासिक व्रत में उद्यापन नहीं; संकल्पित श्रृंखला गणेश-पूजा, प्रसाद/भोजन और दान से कुल-पुरोहित के अनुसार पूर्ण करें।",
    },
  },
  purnima: {
    verdict: {
      en: "Satyanarayan puja may be done on many auspicious days; Purnima is especially common. Evening puja is practical because the fast can end with Panchamrit and prasad.",
      hi: "सत्यनारायण पूजा कई शुभ दिनों में हो सकती है; पूर्णिमा विशेष प्रचलित है। सायं पूजा के बाद पंचामृत-प्रसाद से व्रत खोलना सुविधाजनक है।",
    },
    vidhi: [
      { en: "Bathe and choose the fasting level; prepare shrine and prasad; in the Purnima puja period worship Ganesha and Satyanarayan, listen to all chapters of the katha without treating it as background audio, perform aarti, share prasad.", hi: "स्नान कर व्रत-स्तर चुनें; पूजा-स्थान और प्रसाद तैयार करें; पूर्णिमा पूजा-समय में गणेश व सत्यनारायण पूजन, कथा के सभी अध्याय ध्यान से सुनें, आरती और प्रसाद-वितरण करें।" },
    ],
    diet: {
      en: "The fasting level varies: fruit/milk or a simple one-meal fast are common household forms. Do not label the wheat panjiri prasad “grain-free”; it is eaten only after paran.",
      hi: "फल-दूध या एक सरल भोजन प्रचलित रूप हैं। गेहूँ की पंजीरी को “अन्न-रहित” न कहें; वह पारण के बाद प्रसाद रूप में ली जाती है।",
    },
    sankalpa: {
      en: "“I worship Shri Satyanarayan, the form of truth, with my family. May we live truthfully, share what we receive and remember our promises.”",
      hi: "“मैं परिवार सहित सत्य-स्वरूप श्रीसत्यनारायण की पूजा करता/करती हूँ। हम सत्य से जीएँ, प्राप्त वस्तु बाँटें और अपने वचन याद रखें।”",
    },
    puja: {
      en: "Ganesha and kalasha remembrance; Satyanarayan/Vishnu image or the family's established Saligrama (do not tell a novice to acquire one casually); water/Panchamrit as customary, clothes/thread, sandal, flowers, Tulsi, fruit, banana and panjiri; katha; aarti.",
      hi: "गणेश व कलश स्मरण; सत्यनारायण/विष्णु चित्र या कुल में स्थापित शालिग्राम (नए व्यक्ति को सहज खरीदने की सलाह नहीं); परम्परानुसार जल/पंचामृत, वस्त्र/सूत्र, चन्दन, फूल, तुलसी, फल, केला, पंजीरी; कथा; आरती।",
    },
    paran: {
      en: "After the puja and aarti, first receive Panchamrit, then prasad and a light meal. Satyanarayan's evening puja date can differ from the sunrise-based Purnima fasting date, so check whether you are following the puja or fasting observance.",
      hi: "पूजा-आरती के बाद पहले पंचामृत, फिर प्रसाद और हल्का भोजन। सायं सत्यनारायण पूजा-दिन सूर्योदय-आधारित पूर्णिमा व्रत से अलग हो सकता है, इसलिए देखें कि आप पूजा-दिन मान रहे हैं या व्रत-दिन।",
    },
    udyapan: {
      en: "A single puja needs no separate udyapan. If a fixed series was vowed, complete the promised count with puja, katha, prasad, feeding/charity under the same family procedure.",
      hi: "एक पूजा के बाद अलग उद्यापन नहीं। निश्चित संख्या का संकल्प हो तो अन्तिम पूजा, कथा, प्रसाद और भोजन/दान से उसी कुल-विधि में पूर्ण करें।",
    },
  },
  amavasya: {
    verdict: {
      en: "Amavasya is widely used for remembrance of ancestors, prayer, charity and quiet discipline, but there is no one compulsory monthly fast or one universal home tarpan method for every Hindu.",
      hi: "अमावस्या पितृ-स्मरण, प्रार्थना, दान और संयम का व्यापक दिन है, पर हर हिन्दू के लिए एक अनिवार्य मासिक उपवास या एक ही सार्वभौमिक गृह-तर्पण विधि नहीं है।",
    },
    vidhi: [
      { en: "Bathe; remember ancestors by name with gratitude; offer a lamp/prayer to the household deity; give food or useful charity; if the family has an inherited shraddha/tarpan practice, perform it at its prescribed time with an elder or priest.", hi: "स्नान; पितरों का नाम लेकर कृतज्ञ स्मरण; गृह-देवता को दीप और प्रार्थना; अन्न या उपयोगी वस्तु का दान; कुल में श्राद्ध/तर्पण विधि हो तो उसके समय पर बड़े या पुरोहित के मार्गदर्शन में करें।" },
    ],
    diet: {
      en: "Choose regular satvik food, one meal, phalahar or a full fast according to the named Amavasya and your family tradition. Diwali, Somavati, Mauni and Sarva-Pitru Amavasya each have their own rules; do not apply them to every Amavasya.",
      hi: "वैकल्पिक—उस विशिष्ट अमावस्या और कुल के अनुसार सात्त्विक भोजन, एक समय, फलाहार या उपवास। दीपावली, सोमवती, मौनी या सर्वपितृ नियम हर अमावस्या पर न लगाएँ।",
    },
    sankalpa: {
      en: "“On this Amavasya I remember my ancestors with gratitude, pray for peace, and offer an act of charity within my means.”",
      hi: "“इस अमावस्या पर मैं पितरों का कृतज्ञ स्मरण, शान्ति की प्रार्थना और सामर्थ्य अनुसार दान करूँ।”",
    },
    puja: {
      en: "Simple deity worship and ancestor remembrance are safe universal options. Do not publish gotra-specific sesame-water mantras as a universal do-it-yourself ritual; eligibility and procedure vary.",
      hi: "सरल देव-पूजा और पितृ-स्मरण सार्वभौमिक सुरक्षित विकल्प हैं। गोत्र-विशिष्ट तिल-जल मन्त्र को सबके लिए स्वयं करने योग्य विधि न बताएँ; अधिकार और प्रक्रिया बदलती है।",
    },
    paran: {
      en: "If fasting, break according to the named vow or family rule; otherwise after the day's prayer/charity with a light satvik meal.",
      hi: "व्रत हो तो नामित व्रत या कुल-नियम के अनुसार; अन्यथा दिन की पूजा/दान के बाद हल्के सात्त्विक भोजन से।",
    },
    udyapan: {
      en: "None for ordinary monthly remembrance.",
      hi: "सामान्य मासिक स्मरण के लिए नहीं।",
    },
  },
  masikShivaratri: {
    verdict: {
      en: "This monthly Shiva observance falls on Krishna Chaturdashi. Perform the main Shiva puja in the local Nishita (midnight) time shown above.",
      hi: "यह कृष्ण चतुर्दशी का मासिक शिव-व्रत है। ऊपर दिखाए स्थानीय निषीथ (मध्यरात्रि) समय में मुख्य शिव-पूजा करें।",
    },
    vidhi: [
      { en: "Keep the chosen fast during the day; bathe again in the evening; worship Shiva once at Nishita; keep a quiet vigil as health and duties allow; conclude the next morning.", hi: "दिन चुना हुआ व्रत रखें; सायं पुनः स्नान; निषीथ में एक बार शिव-पूजा; स्वास्थ्य और कर्तव्य अनुसार जागरण; अगली सुबह पूर्ण करें।" },
    ],
    diet: {
      en: "Phalahar (fruit, milk, roots and family-approved vrat food) is a practical choice. Water-only or nirjala fasting is optional and can be unsafe; avoid grains and pulses if following the standard vrat form.",
      hi: "फल, दूध, कन्द और कुल-मान्य व्रत-आहार व्यावहारिक विकल्प हैं। जल-मात्र या निर्जला व्रत वैकल्पिक है और असुरक्षित हो सकता है; मानक व्रत में अन्न-दाल छोड़ें।",
    },
    sankalpa: {
      en: "“I observe Masik Shivaratri in remembrance of Shiva. May I release harmful habits and act with stillness and courage.”",
      hi: "“मैं शिव-स्मरण में मासिक शिवरात्रि रखता/रखती हूँ। हानिकारक आदतें छोड़कर शान्ति और साहस से कर्म करूँ।”",
    },
    puja: {
      en: "Water abhisheka, sandal/vibhuti according to tradition, flowers and bilva, familiar Shiva mantra/name, aarti. One sincere puja is sufficient for the simple path.",
      hi: "जल-अभिषेक, परम्परानुसार चन्दन/विभूति, फूल-बिल्व, परिचित शिव-मन्त्र या नाम, आरती। सरल गृह-विधि में एक भावपूर्ण पूजा पर्याप्त।",
    },
    paran: {
      en: "Break after the next sunrise and morning bath or puja. Monthly paran practice varies by family; do not automatically use Maha Shivaratri's Chaturdashi-end rule.",
      hi: "अगली सुबह सूर्योदय और स्नान या पूजा के बाद व्रत खोलें। मासिक पारण नियम कुलानुसार बदलता है; महाशिवरात्रि का चतुर्दशी-अन्त नियम स्वतः न अपनाएँ।",
    },
    udyapan: {
      en: "Those who begin a one-year series from Maha Shivaratri should conclude the year with Shiva puja, feeding/charity and priest/family guidance.",
      hi: "महाशिवरात्रि से एक-वर्षीय श्रृंखला लेने वाले अन्त में शिव-पूजा, भोजन/दान और कुल-पुरोहित मार्गदर्शन से पूर्ण करें।",
    },
  },
  mahaShivaratri: {
    verdict: {
      en: "Eat once on Trayodashi, fast on Shivaratri, worship Shiva at night (once at Nishita or in four prahars), and break next morning inside the displayed paran window.",
      hi: "त्रयोदशी को एक बार भोजन, शिवरात्रि को व्रत, रात में शिव-पूजा (निषीथ में एक बार या चार प्रहर), और अगली सुबह दिखाए पारण समय में खोलें।",
    },
    vidhi: [
      { en: "One simple meal the day before; morning sankalpa; phalahar or chosen stricter fast; second bath in evening; temple/home Shiva puja; night vigil with japa, bhajan or quiet reading; morning bath, prayer and paran.", hi: "पूर्व दिन एक सरल भोजन; प्रातः संकल्प; फलाहार या चुना कठोर स्तर; सायं स्नान; मंदिर/घर शिव-पूजा; जप, भजन या पाठ से रात्रि-जागरण; सुबह स्नान, प्रार्थना और पारण।" },
    ],
    diet: {
      en: "A sourced moderate form permits fruit and milk by day, then fasting at night. Common vrat foods avoid pulses, rice, wheat and ordinary salt; use sendha salt where customary.",
      hi: "स्रोतों में मध्यम रूप दिन में फल-दूध और रात में उपवास है। सामान्य व्रत-आहार में दाल, चावल, गेहूँ, साधारण नमक छोड़कर परम्परानुसार सेंधा नमक लिया जाता है।",
    },
    sankalpa: {
      en: "“I observe Maha Shivaratri in remembrance of Shiva. May I remain awake to truth, master harmful impulses and complete this vow safely.”",
      hi: "“मैं शिव-स्मरण में महाशिवरात्रि व्रत रखता/रखती हूँ। सत्य के प्रति जाग्रत रहूँ, हानिकारक प्रवृत्तियों पर संयम रखूँ और यह व्रत सुरक्षित पूरा करूँ।”",
    },
    puja: {
      en: "Simple: one Nishita puja. Extended: four night prahars. In each, offer water abhisheka, then sandal/vibhuti, flowers/bilva, japa and aarti. Do not pour large quantities of milk that will be wasted.",
      hi: "सरल—निषीथ में एक पूजा; विस्तृत—रात के चार प्रहर। हर बार जल-अभिषेक, चन्दन/विभूति, फूल/बिल्व, जप और आरती। व्यर्थ होने वाला बहुत दूध न चढ़ाएँ।",
    },
    paran: {
      en: "The common rule is to break after the next sunrise and bath, before Chaturdashi ends, within the local window shown above. Another accepted opinion waits until Chaturdashi has ended; follow your family's chosen tradition rather than combining the two.",
      hi: "सामान्य नियम में अगली सुबह सूर्योदय-स्नान के बाद, चतुर्दशी समाप्ति से पहले, ऊपर दिखाए स्थानीय समय में पारण करें। एक अन्य मान्य मत चतुर्दशी समाप्ति के बाद का है; दोनों को मिलाने के बजाय अपनी कुल-परम्परा मानें।",
    },
    udyapan: {
      en: "A single annual observance needs none. A special multi-year vow should be concluded with priest-guided Shiva puja/homa and charity according to its original sankalpa.",
      hi: "वार्षिक एक व्रत में नहीं; विशेष बहुवर्षीय संकल्प का उद्यापन मूल संकल्प अनुसार पुरोहित-निर्देशित शिव-पूजा/होम और दान से।",
    },
  },
  chaitraNavratri: {
    verdict: {
      en: "Chaitra Navratri begins with Ghatasthapana in the local Chaitra Shukla Pratipada morning time shown above. Worship Navadurga through the nine days; Rama Navami is the principal concluding festival on Navami.",
      hi: "चैत्र नवरात्रि ऊपर दिखाए स्थानीय चैत्र शुक्ल प्रतिपदा के प्रातः घटस्थापना से आरम्भ होती है। नौ दिनों तक नवदुर्गा पूजन करें; नवमी पर राम नवमी इसका प्रमुख समापन पर्व है।",
    },
    vidhi: [
      { en: "On Pratipada, bathe, take the nine-day sankalpa and perform Ghatasthapana in the time shown. If your family does not establish a kalasha, begin the established household Devi worship.", hi: "प्रतिपदा को स्नान, नौ-दिवसीय संकल्प और दिखाए समय में घटस्थापना करें। कुल में कलश-स्थापना न हो तो स्थापित गृह-परम्परा से देवी-पूजन आरम्भ करें।" },
      { en: "Worship the day's Navadurga form, offer the customary prasad, and continue the family's Devi path, recitation or japa each day.", hi: "प्रतिदिन उस दिन की नवदुर्गा का पूजन, कुलानुसार भोग और देवी-पाठ या जप करें।" },
      { en: "Observe Ashtami and Navami rites according to family practice. On Rama Navami, include Shri Rama's birth worship where this is customary.", hi: "अष्टमी और नवमी की विधि कुल-परम्परा अनुसार करें। राम नवमी पर परम्परानुसार श्रीराम जन्म-पूजन सम्मिलित करें।" },
    ],
    diet: {
      en: "Follow the fasting level taken in the sankalpa. Common North-Indian phalahar includes fruit, dairy, nuts, potato, sweet potato, sabudana, singhara, kuttu, rajgira and samak where accepted; grains, pulses, onion, garlic, meat and alcohol are avoided in that form. Family and regional Shakta rules may differ.",
      hi: "संकल्प में लिया व्रत-स्तर मानें। सामान्य उत्तर भारतीय फलाहार में कुलानुसार फल, दुग्ध, मेवे, आलू, शकरकंद, साबूदाना, सिंघाड़ा, कुट्टू, राजगीरा और सामक; इस रूप में अन्न-दाल, प्याज, लहसुन, मांस और मद्य वर्जित हैं। कुल और क्षेत्रीय शाक्त नियम भिन्न हो सकते हैं।",
    },
    sankalpa: {
      en: "“From Chaitra Shukla Pratipada through Navami, I worship Navadurga according to my family tradition and will complete this Navratri sankalpa with steadiness.”",
      hi: "“चैत्र शुक्ल प्रतिपदा से नवमी तक मैं कुल-परम्परा अनुसार नवदुर्गा पूजन और यह नवरात्रि संकल्प स्थिरता से पूर्ण करूँगा/करूँगी।”",
    },
    puja: {
      en: "Ganesha remembrance; kalasha or established Devi image; lamp, water, flowers, kumkum and customary naivedya; the day's Navadurga name; family Devi path or japa; aarti. Lineage-specific mantra, nyasa, homa or other advanced rites follow that lineage's teacher.",
      hi: "गणेश स्मरण; कलश या स्थापित देवी-चित्र; दीप, जल, फूल, कुमकुम और कुलानुसार नैवेद्य; उस दिन की नवदुर्गा; कुल का देवी-पाठ या जप; आरती। परम्परा-विशेष मन्त्र, न्यास, होम या अन्य उन्नत विधि उसी परम्परा के गुरु से लें।",
    },
    paran: {
      en: "For the complete nine-day Chaitra fast, paran is after Navami Tithi ends and Dashami prevails; use the local time shown by the Panchang. A family sankalpa limited to selected days follows that sankalpa's own completion rite.",
      hi: "पूर्ण नौ-दिवसीय चैत्र व्रत का पारण नवमी तिथि समाप्त होकर दशमी लगने के बाद, पंचांग के स्थानीय समय में करें। केवल चुने दिनों का कुल-संकल्प हो तो उसी संकल्प की समापन-विधि मानें।",
    },
    udyapan: {
      en: "Complete the kalasha, Kanya Puja, Rama Navami worship, havan, feeding or charity exactly as undertaken in the original sankalpa and family tradition. A formal vowed series should conclude under the family's priest or lineage guidance.",
      hi: "कलश-समापन, कन्या-पूजन, राम नवमी पूजा, हवन, भोजन या दान मूल संकल्प और कुल-परम्परा अनुसार करें। औपचारिक संकल्पित श्रृंखला कुल-पुरोहित या परम्परा-मार्गदर्शन में पूर्ण करें।",
    },
  },
  sharadNavratri: {
    verdict: {
      en: "Sharad Navratri begins with Ghatasthapana in the local Ashwin Shukla Pratipada morning time shown above. Worship Navadurga through the nine nights, with Durga Ashtami, Maha Navami and Vijayadashami as the principal concluding observances.",
      hi: "शारदीय नवरात्रि ऊपर दिखाए स्थानीय आश्विन शुक्ल प्रतिपदा के प्रातः घटस्थापना से आरम्भ होती है। नौ रात नवदुर्गा पूजन करें; दुर्गाष्टमी, महानवमी और विजयादशमी इसके प्रमुख समापन पर्व हैं।",
    },
    vidhi: [
      { en: "On Pratipada, bathe, take the Navratri sankalpa and perform Ghatasthapana in the displayed time according to family practice.", hi: "प्रतिपदा को स्नान, नवरात्रि संकल्प और दिखाए समय में कुल-परम्परा अनुसार घटस्थापना करें।" },
      { en: "Worship the day's Navadurga form and continue the family's Devi path, japa, bhajan, garba or temple observance through the nine nights.", hi: "नौ रात उस दिन की नवदुर्गा का पूजन और कुलानुसार देवी-पाठ, जप, भजन, गरबा या मंदिर-अनुष्ठान करें।" },
      { en: "Observe Durga Ashtami and the Ashtami-Navami Sandhi, Maha Navami, Kanya Puja, Ayudha/Saraswati Puja or Durga Puja according to the selected regional and family tradition.", hi: "दुर्गाष्टमी और अष्टमी-नवमी संधि, महानवमी, कन्या-पूजन, आयुध/सरस्वती पूजा या दुर्गापूजा चुनी क्षेत्रीय और कुल-परम्परा अनुसार करें।" },
      { en: "Conclude with Navratri paran and the family's Vijayadashami or Durga Visarjan observance; these may fall at different local times.", hi: "नवरात्रि पारण और कुल की विजयादशमी या दुर्गा-विसर्जन विधि से समापन करें; इनके स्थानीय समय अलग हो सकते हैं।" },
    ],
    diet: {
      en: "Follow the fasting level taken in the sankalpa. Common North-Indian phalahar avoids grains, pulses, onion, garlic, meat and alcohol and uses family-approved fruit, dairy, roots and vrat foods. Regional Shakta offerings and non-fasting Durga Puja traditions remain distinct and should be followed as practised.",
      hi: "संकल्प में लिया व्रत-स्तर मानें। सामान्य उत्तर भारतीय फलाहार में अन्न-दाल, प्याज, लहसुन, मांस और मद्य वर्जित तथा कुल-मान्य फल, दुग्ध, कन्द और व्रत-आहार लिए जाते हैं। क्षेत्रीय शाक्त भोग और बिना-व्रत दुर्गापूजा परम्पराएँ अपनी विधि अनुसार अलग रहेंगी।",
    },
    sankalpa: {
      en: "“Through Sharad Navratri I worship Navadurga according to my family tradition. May the Divine Mother's strength protect dharma and guide my conduct.”",
      hi: "“शारदीय नवरात्रि में मैं कुल-परम्परा अनुसार नवदुर्गा पूजन करता/करती हूँ। जगन्माता की शक्ति धर्म की रक्षा करे और मेरे आचरण का मार्गदर्शन करे।”",
    },
    puja: {
      en: "Ganesha remembrance; kalasha or established Devi image; lamp, water, flowers, kumkum and customary naivedya; daily Navadurga worship; family recitation or japa; aarti. Bengal Durga Puja, South-Indian Saraswati/Ayudha Puja and lineage-specific Shakta rites should retain their own procedures.",
      hi: "गणेश स्मरण; कलश या स्थापित देवी-चित्र; दीप, जल, फूल, कुमकुम और कुलानुसार नैवेद्य; दैनिक नवदुर्गा पूजन; कुल का पाठ या जप; आरती। बंगाल दुर्गापूजा, दक्षिण भारतीय सरस्वती/आयुध पूजा और परम्परा-विशेष शाक्त विधियाँ अपने नियमों से होंगी।",
    },
    paran: {
      en: "For a complete nine-night fast, follow the local Navratri paran after the required Navami observance and Tithi rule shown by the Panchang. Families concluding after Ashtami or Navami Kanya Puja should follow that declared sankalpa; Vijayadashami and Durga Visarjan remain separate concluding observances.",
      hi: "पूर्ण नौ-रात्रि व्रत में आवश्यक नवमी पूजा और पंचांग में दिखाए तिथि-नियम के बाद स्थानीय नवरात्रि पारण करें। अष्टमी या नवमी कन्या-पूजन बाद समापन का संकल्प हो तो वही मानें; विजयादशमी और दुर्गा-विसर्जन अलग समापन पर्व हैं।",
    },
    udyapan: {
      en: "Complete Kanya Puja, Navami Homa, kalasha conclusion, feeding, charity or Durga Visarjan according to the original sankalpa and selected tradition. Formal homa and lineage rites follow the family's priest or teacher.",
      hi: "कन्या-पूजन, नवमी होम, कलश-समापन, भोजन, दान या दुर्गा-विसर्जन मूल संकल्प और चुनी परम्परा अनुसार करें। औपचारिक होम और परम्परा-विशेष विधि कुल-पुरोहित या गुरु के मार्गदर्शन में करें।",
    },
  },
  karvaChauth: {
    verdict: {
      en: "A North- and West-Indian marital-wellbeing fast traditionally kept from sunrise until the local moon is seen and offered water. Nirjala is the strict form, not the only safe devotional choice.",
      hi: "उत्तर और पश्चिम भारत का दाम्पत्य-मंगल व्रत, परम्परागत रूप से सूर्योदय से स्थानीय चन्द्र-दर्शन और अर्घ्य तक। निर्जला कठोर रूप है, भक्ति का एकमात्र सुरक्षित रूप नहीं।",
    },
    vidhi: [
      { en: "Where customary, eat Sargi before sunrise; after bathing, state the chosen fast; prepare karva, lamp and puja plate; gather in the evening for Gauri/Parvati and Shiva-family worship and katha; at actual local moonrise, sight the moon directly or through the family-used sieve/cloth, offer water, pray for mutual wellbeing, then break.", hi: "परम्परा हो तो सूर्योदय से पहले सरगी लें; स्नान बाद चुना व्रत बोलें; करवा, दीप, थाली तैयार करें; शाम गौरी/पार्वती व शिव-परिवार पूजन और कथा; वास्तविक स्थानीय चन्द्रोदय पर कुलानुसार सीधे या छलनी/वस्त्र से चन्द्र-दर्शन, जल-अर्घ्य, परस्पर मंगल की प्रार्थना और पारण।" },
    ],
    diet: {
      en: "Strict form is no food/water after sunrise. A health-modified form may use water, fruit or a simple satvik meal by prior sankalpa. Sargi is a Punjabi and some North-Indian family custom, not a universal prerequisite.",
      hi: "कठोर रूप में सूर्योदय बाद अन्न-जल नहीं। स्वास्थ्य अनुसार पहले संकल्प लेकर जल, फल या सरल सात्त्विक भोजन लिया जा सकता है। सरगी पंजाबी/कुछ उत्तर भारतीय कुल-परम्परा है, सर्वत्र अनिवार्य नहीं।",
    },
    sankalpa: {
      en: "“I observe Karva Chauth for love, mutual wellbeing and the long, ethical partnership of our family. May care flow both ways.”",
      hi: "“मैं प्रेम, परस्पर मंगल और हमारे परिवार के दीर्घ, धर्मपूर्ण साथ के लिए करवा चौथ रखती/रखता हूँ। देखभाल दोनों ओर से हो।”",
    },
    puja: {
      en: "Ganesha remembrance; Shiva, Parvati/Gauri, Kartikeya and Ganesha; karva with water, lamp, roli/rice, flowers, fruit/sweet; family katha and thali-rotation where customary; moon arghya.",
      hi: "गणेश स्मरण; शिव, पार्वती/गौरी, कार्तिकेय, गणेश; जल-भरा करवा, दीप, रोली/अक्षत, फूल, फल/मिष्ठान्न; कुलानुसार कथा और थाली फेरना; चन्द्र-अर्घ्य।",
    },
    paran: {
      en: "Break after local moonrise, moon sighting or prayer, and arghya. If clouds hide the moon, use the verified moonrise shown above and your family practice; do not wait in a way that endangers health. Begin with water, then prasad or light food.",
      hi: "स्थानीय चन्द्रोदय, चन्द्र-दर्शन या प्रार्थना और अर्घ्य के बाद व्रत खोलें। बादल हों तो ऊपर दिखाया सत्यापित चन्द्रोदय और कुल-नियम मानें; स्वास्थ्य संकट तक प्रतीक्षा न करें। पहले जल, फिर प्रसाद या हल्का भोजन लें।",
    },
    udyapan: {
      en: "There is no single pan-Indian year count. If you made a numbered vow, conclude it with guidance from a family elder or priest rather than assuming that 11 or 13 years applies to everyone.",
      hi: "पूरे भारत में एक ही वर्ष-संख्या नहीं है। गिनती का संकल्प हो तो कुल की बड़ी महिला या पुरोहित के मार्गदर्शन में पूर्ण करें; 11 या 13 वर्ष का नियम सब पर लागू न मानें।",
    },
  },
  ahoiAshtami: {
    verdict: {
      en: "A North-Indian fast for the wellbeing of all children, from dawn until stars are visible; some families wait for moonrise.",
      hi: "सभी बच्चों के मंगल के लिए उत्तर भारतीय व्रत, प्रातः से तारों के दर्शन तक; कुछ कुल चन्द्रोदय तक रखते हैं।",
    },
    vidhi: [
      { en: "Bathe and state whether family paran is by stars or moon; draw/place an Ahoi Mata image and, where customary, Sei/Syau; prepare a water pot; in the evening worship, hear the katha and perform aarti; offer arghya to stars or moon, then break.", hi: "स्नान कर संकल्प में स्पष्ट करें कि कुल में पारण तारे या चन्द्र से; अहोई माता का चित्र और परम्परानुसार सेई/स्याऊ रखें; जल-कलश; शाम पूजा, कथा, आरती; तारों या चन्द्र को अर्घ्य देकर खोलें।" },
    ],
    diet: {
      en: "The traditional strict form is often nirjala. Choose a health-modified level before the fast if needed. The prayer is for the wellbeing of all children, not only sons.",
      hi: "कठोर पारम्परिक रूप प्रायः निर्जला है। आवश्यकता हो तो व्रत से पहले स्वास्थ्य-संशोधित स्तर चुनें। प्रार्थना सभी बच्चों के कल्याण के लिए है, केवल पुत्रों के लिए नहीं।",
    },
    sankalpa: {
      en: "“I observe Ahoi Ashtami with gratitude and prayer for the health, safety and good character of all children in my care.”",
      hi: "“मैं अपनी देखभाल में सभी बच्चों के स्वास्थ्य, सुरक्षा और सद्गुण के लिए कृतज्ञता से अहोई अष्टमी रखती/रखता हूँ।”",
    },
    puja: {
      en: "Ahoi image; water kalasha/karva; roli, rice, milk, halwa and seven grass shoots for Sei where customary; katha; aarti; star/moon arghya. Silver Syau pendant is an optional community custom, not a requirement.",
      hi: "अहोई चित्र, जल-कलश/करवा, रोली, अक्षत, दूध, हलवा और परम्परानुसार सेई के लिए सात तिनके; कथा, आरती, तारा/चन्द्र अर्घ्य। चाँदी का स्याऊ सामुदायिक विकल्प है, अनिवार्य नहीं।",
    },
    paran: {
      en: "Most families break after the stars appear at twilight; some wait until moonrise. Follow your family rule, keeping in mind that moonrise can be much later.",
      hi: "अधिकांश परिवार संध्या में तारे दिखने के बाद व्रत खोलते हैं; कुछ चन्द्रोदय तक प्रतीक्षा करते हैं। अपना कुल-नियम मानें, क्योंकि चन्द्रोदय काफी देर से हो सकता है।",
    },
    udyapan: {
      en: "No universal requirement. Conclude only a specifically numbered family vow under that family's procedure.",
      hi: "सार्वभौमिक नहीं; केवल गिनती वाला कुल-संकल्प उसी कुल-विधि में पूर्ण करें।",
    },
  },
  hartalikaTeej: {
    verdict: {
      en: "Hartalika Teej is traditionally observed as a nirjala fast, with Shiva-Parvati worship in the early-morning Hartalika time shown above. Follow the puja and completion rule of your family tradition.",
      hi: "हरतालिका तीज परम्परागत रूप से निर्जला व्रत है। ऊपर दिखाए प्रातः हरतालिका समय में शिव-पार्वती पूजा करें और कुल-परम्परा की पूजा व समापन-विधि मानें।",
    },
    vidhi: [
      { en: "Bathe, dress cleanly and take sankalpa; make or place simple clay/sand Shiva-Parvati forms; worship Ganesha first, then Uma-Maheshwara; hear the Hartalika katha; where customary continue bhajan/vigil and conclude next morning.", hi: "स्नान, स्वच्छ वस्त्र, संकल्प; मिट्टी/बालू के सरल शिव-पार्वती रूप; पहले गणेश, फिर उमा-महेश्वर पूजा; हरतालिका कथा; परम्परानुसार भजन/जागरण और अगली सुबह समापन।" },
    ],
    diet: {
      en: "The traditional Hartalika fast is nirjala—without food or water. Observe the exact dietary and purity rules followed by your family tradition; the separate health note above does not redefine this religious rule.",
      hi: "परम्परागत हरतालिका व्रत निर्जला—बिना अन्न और जल—होता है। अपनी कुल-परम्परा के आहार और शुद्धि नियम मानें; ऊपर की अलग स्वास्थ्य टिप्पणी इस धार्मिक नियम को नहीं बदलती।",
    },
    sankalpa: {
      en: "“I honour Parvati's resolve and Shiva-Parvati's partnership. May my relationships have consent, loyalty, courage and mutual respect.”",
      hi: "“मैं पार्वती के संकल्प और शिव-पार्वती के साथ का सम्मान करती/करता हूँ। मेरे सम्बन्ध सहमति, निष्ठा, साहस और परस्पर आदर पर टिकें।”",
    },
    puja: {
      en: "Ganesha; Shiva-Parvati; water, sandal, turmeric/kumkum according to custom, flowers, bilva to Shiva, fruit/sweet; the 16-step (shodashopachara) worship only if you know it; katha and aarti.",
      hi: "गणेश; शिव-पार्वती; जल, कुलानुसार चन्दन, हल्दी/कुमकुम, फूल, शिव को बिल्व, फल/मिष्ठान्न; षोडशोपचार केवल जानकार के लिए; कथा और आरती।",
    },
    paran: {
      en: "Common regional practice concludes the next morning after bathing and final prayer or prasad. Exact food and whether a vigil is required vary, so follow your family practice rather than the date alone.",
      hi: "सामान्य क्षेत्रीय परम्परा में अगली सुबह स्नान और अन्तिम पूजा या प्रसाद के बाद व्रत खुलता है। भोजन और जागरण के नियम बदलते हैं, इसलिए केवल तिथि नहीं, अपनी कुल-परम्परा मानें।",
    },
    udyapan: {
      en: "There is no reliable universal year count. If you made a numbered vow, conclude it with guidance from your family priest or the Vratraj tradition you followed.",
      hi: "कोई विश्वसनीय सार्वभौमिक वर्ष-संख्या नहीं है। गिनती वाला संकल्प लिया हो तो अपनी अपनाई व्रतराज परम्परा या कुल-पुरोहित के मार्गदर्शन में पूर्ण करें।",
    },
  },
  sheetlaAshtami: {
    verdict: {
      en: "Prepare the traditional offering the previous day, cool and refrigerate it safely, then offer/eat it cold on Sheetala Ashtami. “Cold food” must never mean perishable food left at room temperature overnight.",
      hi: "पारम्परिक भोग पिछले दिन बनाएँ, सुरक्षित ठंडा कर फ्रिज में रखें, फिर शीतला अष्टमी पर ठंडा भोग/प्रसाद लें। “ठंडा भोजन” का अर्थ रातभर कमरे में पड़ा नाशवान भोजन नहीं।",
    },
    vidhi: [
      { en: "On Saptami, cook the family dishes and store them safely; on Ashtami, do not light the stove where that is the family custom; bathe, worship Sheetala Mata in the daytime, offer the safely stored food and receive it as prasad.", hi: "सप्तमी को कुल के व्यंजन बनाकर सुरक्षित रखें; कुल-परम्परा हो तो अष्टमी चूल्हा न जलाएँ; स्नान कर दिन में शीतला माता की पूजा करें, सुरक्षित रखा भोग चढ़ाकर प्रसाद लें।" },
    ],
    diet: {
      en: "Regional offerings include puri/pua, curd dishes, rice, jaggery, buttermilk, bajra roti/khichdi or kheer. Follow food-safety rules: refrigerate perishables within two hours (one hour in heat above 32°C); cooked rice should be cooled especially quickly; discard unsafe food.",
      hi: "क्षेत्रानुसार पूरी/पूआ, दही-व्यंजन, चावल, गुड़, छाछ, बाजरा रोटी/खिचड़ी या खीर। नाशवान भोजन दो घंटे में फ्रिज (32°C से अधिक गर्मी में एक घंटे); पका चावल विशेष शीघ्र ठंडा; असुरक्षित भोजन त्यागें।",
    },
    sankalpa: {
      en: "“I worship Sheetala Mata with cleanliness, care and prayer for family and community health. I will preserve the custom without risking food-borne illness.”",
      hi: "“मैं स्वच्छता, देखभाल और परिवार-समाज के स्वास्थ्य की प्रार्थना से शीतला माता पूजती/पूजता हूँ। परम्परा निभाऊँगी/निभाऊँगा, भोजन-जनित रोग का जोखिम नहीं।”",
    },
    puja: {
      en: "Sheetala image/temple; cool water, flowers, roli, lamp if safely used, and the family's previous-day food; prayer/aarti. Do not claim worship prevents or cures smallpox, measles or other infection; vaccination and medical care remain essential.",
      hi: "शीतला चित्र/मंदिर; शीतल जल, फूल, रोली, सुरक्षित दीप, पिछले दिन का कुल-भोग; प्रार्थना/आरती। पूजा को चेचक, खसरा या संक्रमण की रोकथाम/इलाज न बताएँ; टीका और चिकित्सा आवश्यक।",
    },
    paran: {
      en: "This is more a food custom and puja than a universally defined nirjala fast. Where fasting is observed, break after Sheetala puja with safely stored prasad according to family custom.",
      hi: "यह सार्वभौमिक निर्जला से अधिक भोजन-परम्परा और पूजा है। व्रत हो तो पूजा बाद सुरक्षित प्रसाद से कुलानुसार खोलें।",
    },
    udyapan: {
      en: "None for annual household observance.",
      hi: "वार्षिक गृह-पूजा में नहीं।",
    },
  },
  ganeshChaturthi: {
    verdict: {
      en: "Worship Ganesha in the local Madhyahna (midday) time shown above. Home installation is optional; an already worshipped household murti is not treated as a new temporary idol and is not immersed.",
      hi: "ऊपर दिखाए स्थानीय मध्याह्न समय में गणेश-पूजा करें। घर में नई स्थापना वैकल्पिक है; नित्य-पूजित गृह-मूर्ति को नई अस्थायी प्रतिमा मानकर विसर्जित नहीं किया जाता।",
    },
    vidhi: [
      { en: "Bathe, take sankalpa and chosen fast; light lamp; for a new clay murti perform invocation only if the family knows the installation/visarjana sequence; otherwise worship the existing image; perform Madhyahna puja, aarti and share prasad.", hi: "स्नान, संकल्प और चुना व्रत; दीप; नई मिट्टी प्रतिमा हो तो स्थापना-विसर्जन क्रम जानने पर ही आवाहन, अन्यथा स्थापित चित्र/मूर्ति पूजा; मध्याह्न पूजा, आरती, प्रसाद।" },
    ],
    diet: {
      en: "Detailed menus vary. Choose phalahar or one satvik meal; nirjala is not required for every Ganesh Chaturthi observer. Modak is naivedya or prasad, not automatically fasting food.",
      hi: "आहार-विधि बदलती है। फलाहार या एक सात्त्विक भोजन चुनें; हर गणेश चतुर्थी व्रती के लिए निर्जला आवश्यक नहीं। मोदक भोग या प्रसाद है, स्वतः व्रत-आहार नहीं।",
    },
    sankalpa: {
      en: "“I worship Shri Ganesha, seeking clear understanding, humility and perseverance before beginning important work.”",
      hi: "“मैं श्रीगणेश की पूजा करता/करती हूँ और महत्त्वपूर्ण कार्य से पहले स्पष्ट बुद्धि, विनम्रता और धैर्य माँगता/माँगती हूँ।”",
    },
    puja: {
      en: "Ganesha meditation; water/ritual welcome as appropriate; sandal, flowers, durva, fruit and modak; familiar Ganesha names; aarti. Full 16-step puja is optional, not necessary for a clear beginner path.",
      hi: "गणेश ध्यान; उपयुक्त जल/स्वागत; चन्दन, फूल, दूर्वा, फल, मोदक; परिचित गणेश-नाम; आरती। षोडशोपचार वैकल्पिक।",
    },
    paran: {
      en: "There is no single universal paran time. Most observers break after the day's main puja according to family practice; if your tradition waits until moonrise or another rite, follow that rule.",
      hi: "एक सार्वभौमिक पारण समय नहीं है। अधिकांश लोग मुख्य पूजा के बाद कुलानुसार व्रत खोलते हैं; आपकी परम्परा चन्द्रोदय या किसी अन्य कर्म तक प्रतीक्षा करती हो तो वही नियम मानें।",
    },
    udyapan: {
      en: "Not applicable to a single annual fast. Temporary-idol visarjana is a festival conclusion, not vrat udyapan.",
      hi: "एक वार्षिक व्रत में नहीं। अस्थायी प्रतिमा विसर्जन उत्सव-समापन है, व्रत-उद्यापन नहीं।",
    },
  },
  janmashtami: {
    verdict: {
      en: "Fast during the day and worship Bal Krishna in the local Nishita (midnight) time. Smarta and ISKCON/Vaishnava dates and paran can differ, so follow one tradition consistently.",
      hi: "दिन में व्रत रखें और स्थानीय निषीथ (मध्यरात्रि) में बालकृष्ण की पूजा करें। स्मार्त और इस्कॉन/वैष्णव तिथि व पारण अलग हो सकते हैं, इसलिए एक ही परम्परा लगातार मानें।",
    },
    vidhi: [
      { en: "Choose your tradition and fasting level first; bathe and take sankalpa; spend the day in Krishna remembrance; prepare the cradle or image and milk-based or fruit offerings; at Nishita worship Bal Krishna, celebrate the birth and perform aarti; break the fast according to the same tradition.", hi: "पहले अपनी परम्परा और व्रत-स्तर चुनें; स्नान-संकल्प करें; दिन कृष्ण-स्मरण में बिताएँ; झूला या चित्र और दुग्ध या फल भोग तैयार करें; निषीथ में बालकृष्ण पूजा, जन्म-उत्सव और आरती करें; उसी परम्परा के अनुसार पारण करें।" },
    ],
    diet: {
      en: "Full fast or non-grain phalahar is common. ISKCON Bangalore's manual breaks at midnight with non-grain fruit/root/milk prasad; grain may remain restricted until the next prescribed paran in stricter Vaishnava practice.",
      hi: "पूर्ण उपवास या अन्न-रहित फलाहार प्रचलित। इस्कॉन बेंगलुरु मार्गदर्शिका में मध्यरात्रि अन्न-रहित फल/कन्द/दूध प्रसाद; कठोर वैष्णव मत में धान्य अगले निर्धारित पारण तक वर्जित हो सकता है।",
    },
    sankalpa: {
      en: "“I observe Janmashtami in remembrance of Shri Krishna's birth. May joy, courage, loving service and dharma guide my choices.”",
      hi: "“मैं श्रीकृष्ण जन्म-स्मरण में जन्माष्टमी रखता/रखती हूँ। आनन्द, साहस, प्रेमपूर्ण सेवा और धर्म मेरे निर्णयों का मार्गदर्शन करें।”",
    },
    puja: {
      en: "Bal Krishna image; meditation; ritual bath only if the murti is suitable; clothes/ornament, sandal, flowers, Tulsi, butter/mishri, fruit and milk-sweet; Krishna names/bhajan; birth aarti. Nanda, Yashoda, Balarama and Subhadra may be remembered where customary.",
      hi: "बालकृष्ण चित्र/मूर्ति; ध्यान; केवल उपयुक्त मूर्ति का स्नान; वस्त्र, चन्दन, फूल, तुलसी, माखन-मिश्री, फल, दुग्ध-मिष्ठान्न; नाम/भजन; जन्म-आरती। परम्परानुसार नन्द, यशोदा, बलराम, सुभद्रा स्मरण।",
    },
    paran: {
      en: "When to break the fast depends on your tradition. Smarta observers wait until the required Ashtami (eighth lunar day) and Rohini (Krishna's birth star) conditions are complete. Some families wait until the next morning's worship. In common ISKCON practice, non-grain prasad may be taken after the midnight celebration, while grains remain restricted until the temple or Panchang paran time. Use the same tradition for both the Janmashtami date and paran.",
      hi: "व्रत कब खोलना है, यह आपकी परम्परा पर निर्भर है। स्मार्त परम्परा में अष्टमी तिथि (आठवाँ चन्द्र दिवस) और रोहिणी नक्षत्र (कृष्ण का जन्म नक्षत्र) के आवश्यक नियम पूरे होने के बाद पारण होता है। कुछ परिवार अगली सुबह की पूजा तक प्रतीक्षा करते हैं। सामान्य इस्कॉन परम्परा में मध्यरात्रि उत्सव के बाद अन्न-रहित प्रसाद लिया जा सकता है, पर धान्य मंदिर या पंचांग के पारण समय तक वर्जित रहता है। जन्माष्टमी की तिथि और पारण के लिए एक ही परम्परा मानें।",
    },
    udyapan: {
      en: "None for the annual fast.",
      hi: "वार्षिक व्रत में नहीं।",
    },
  },
  // Sourced Chhath card; MuhuratHub connects all four calendar days to this
  // single four-day sequence. Sources: plans/vrat-vidhis.md and
  // phase1-content-diwali-chhath.md.
  chhath: {
    verdict: {
      en: "Chhath is one connected four-day Surya observance: Nahay Khay, Kharna, evening arghya, then dawn arghya and paran. The Shashthi sunset is one stage, not the whole fast.",
      hi: "छठ एक जुड़ा चार-दिवसीय सूर्य-अनुष्ठान है—नहाय-खाय, खरना, सन्ध्या अर्घ्य, फिर उषा अर्घ्य और पारण। षष्ठी का सूर्यास्त एक चरण है, पूरा व्रत नहीं।",
    },
    vidhi: [
      { en: "Day 1 — Nahay Khay: Bathe; clean the kitchen and preparation area; the vratin takes one carefully prepared satvik meal. River bathing is optional and only at a legally accessible, safe location.", hi: "दिन 1 — नहाय-खाय: स्नान, रसोई और तैयारी-स्थान की शुद्धि; व्रती एक सावधानी से बना सात्त्विक भोजन। नदी-स्नान वैकल्पिक, केवल कानूनी और सुरक्षित स्थान पर।" },
      { en: "Day 2 — Kharna: Fast from sunrise without water in the strict tradition; after sunset worship and offer kheer/fruit, then receive prasad. The approximately 36-hour main fast begins after Kharna prasad.", hi: "दिन 2 — खरना: कठोर परम्परा में सूर्योदय से निर्जला; सूर्यास्त बाद पूजा, खीर/फल भोग और प्रसाद; खरना प्रसाद बाद लगभग 36 घंटे का मुख्य व्रत आरम्भ।" },
      { en: "Day 3 — Sandhya Arghya: Continue the fast; prepare baskets/prasad according to family purity rules; at a safe water edge or clean home alternative, offer arghya to the setting Sun.", hi: "दिन 3 — सन्ध्या अर्घ्य: व्रत जारी; कुल-शुद्धि नियम अनुसार दउरा/प्रसाद; सुरक्षित जल-किनारे या स्वच्छ गृह-विकल्प पर अस्त सूर्य को अर्घ्य।" },
      { en: "Day 4 — Usha Arghya and paran: Before local sunrise assemble safely; offer arghya to the rising Sun; pray, receive prasad and break the fast.", hi: "दिन 4 — उषा अर्घ्य और पारण: स्थानीय सूर्योदय से पहले सुरक्षित एकत्र हों; उदय सूर्य को अर्घ्य; प्रार्थना, प्रसाद और पारण।" },
    ],
    diet: {
      en: "This is among the strictest observances, so read the health note above and choose a supported or modified form if needed. Family rules often exclude onion, garlic, ordinary salt and processed or contaminated foods, but exact ingredients and kitchen purity are lineage-specific.",
      hi: "यह अत्यन्त कठोर व्रतों में है, इसलिए ऊपर की स्वास्थ्य टिप्पणी पढ़ें और आवश्यकता हो तो सहायक या संशोधित रूप चुनें। प्याज, लहसुन, साधारण नमक और प्रसंस्कृत या मिश्रित भोजन प्रायः छोड़े जाते हैं, पर सामग्री और रसोई-शुद्धि कुलानुसार बदलती है।",
    },
    sankalpa: {
      en: "“Across these four days I honour Surya and Chhathi Maiya with gratitude for life, health and family. May I complete only the level safe for my body and keep every riverbank and public place clean.”",
      hi: "“इन चार दिनों में मैं जीवन, स्वास्थ्य और परिवार के लिए सूर्य और छठी मैया का कृतज्ञ पूजन करती/करता हूँ। शरीर के लिए सुरक्षित स्तर ही पूरा करूँ और हर घाट व सार्वजनिक स्थान स्वच्छ रखूँ।”",
    },
    puja: {
      en: "Use arghya water, seasonal fruit, sugarcane and family-prepared prasad such as thekua or kheer according to tradition; use lamps only where fire rules and crowd safety allow. Never enter deep, polluted or restricted water.",
      hi: "अर्घ्य-जल, मौसमी फल, गन्ना और कुलानुसार ठेकुआ या खीर प्रसाद रखें; दीप केवल अग्नि और भीड़-सुरक्षा के अनुसार जलाएँ। गहरे, प्रदूषित या निषिद्ध जल में न जाएँ।",
    },
    paran: {
      en: "Only after Usha Arghya on day 4, with prasad and fluid first. Kharna on day 2 is an intermediate ritual meal, not the final paran.",
      hi: "दिन 4 उषा अर्घ्य बाद, पहले प्रसाद और तरल। दिन 2 खरना मध्य अनुष्ठान-भोजन है, अन्तिम पारण नहीं।",
    },
    udyapan: {
      en: "Chhath's fourth-day Usha Arghya concludes that year's observance; a separate universal udyapan is not established. A lifelong/numbered family vow ends only through that lineage's guidance.",
      hi: "चौथे दिन उषा अर्घ्य उस वर्ष का समापन; अलग सार्वभौमिक उद्यापन स्थापित नहीं। आजीवन/गिनती कुल-संकल्प उसी कुल-विधि से पूर्ण।",
    },
  },
  skandaShashti: {
    verdict: {
      en: "This is the monthly Shukla Shashti vrata—a one-day observance for Shri Murugan. Keep today's fast and worship rule as followed by your family or temple. The annual six-day Kanda Sashti appears separately on its own festival dates.",
      hi: "यह मासिक शुक्ल षष्ठी व्रत है—श्री मुरुगन का एक-दिवसीय अनुष्ठान। आज अपने परिवार या मंदिर में प्रचलित उपवास और पूजा-नियम रखें। वार्षिक छह-दिवसीय कन्द षष्ठी अपनी पर्व-तिथियों पर अलग दिखाई जाती है।",
    },
    vidhi: [
      { en: "Bathe, clean the worship place and light a lamp before Murugan or the Vel.", hi: "स्नान करके पूजा-स्थान स्वच्छ करें और मुरुगन या वेल के सामने दीप जलाएँ।" },
      { en: "Offer flowers or fruit and state your intention to keep today's one-day Skanda Shashti vrata.", hi: "फूल या फल अर्पित करें और आज का एक-दिवसीय स्कन्द षष्ठी व्रत रखने का संकल्प करें।" },
      { en: "Pray, visit a Murugan temple if possible, and recite or listen to a familiar text such as Kanda Sashti Kavacham.", hi: "प्रार्थना करें, सम्भव हो तो मुरुगन मंदिर जाएँ और कन्द षष्ठी कवचम् जैसे परिचित पाठ का पाठ या श्रवण करें।" },
      { en: "Perform aarti and complete the one-day observance according to your family or temple practice.", hi: "आरती करें और पारिवारिक या मंदिर-परंपरा के अनुसार एक-दिवसीय अनुष्ठान पूरा करें।" },
    ],
    diet: {
      en: "Common fasting practices include a complete fast, fruit or milk, simple unsalted food, or one meal. Follow the one-day rule received from your family or temple.",
      hi: "प्रचलित उपवास-विधियों में पूर्ण उपवास, फल या दूध, सादा नमक-रहित भोजन अथवा एक बार भोजन शामिल हैं। परिवार या मंदिर से मिला एक-दिवसीय नियम मानें।",
    },
    sankalpa: {
      en: "“For this Skanda Shashti, I worship Shri Murugan and follow the one-day fasting practice of my family or temple, seeking courage, discipline and divine grace.” This is a plain-language intention, not a prescribed Sanskrit mantra.",
      hi: "“इस स्कन्द षष्ठी पर मैं श्री मुरुगन की पूजा करता/करती हूँ और साहस, अनुशासन तथा ईश-कृपा के लिए अपने परिवार या मंदिर में प्रचलित व्रत-नियम अपनाता/अपनाती हूँ।” यह सरल भाव-संकल्प है, निर्धारित संस्कृत मंत्र नहीं।",
    },
    puja: {
      en: "Lamp; Murugan or Vel worship; flowers or fruit; familiar Murugan names, hymn or Kanda Sashti Kavacham; temple darshan where possible; aarti. Temple homam, abhishekam, kavadi and Soorasamharam enactment are temple-led observances, not a compulsory household checklist.",
      hi: "दीप; मुरुगन या वेल पूजन; फूल या फल; परिचित मुरुगन-नाम, स्तोत्र या कन्द षष्ठी कवचम्; सम्भव हो तो मंदिर-दर्शन; आरती। मंदिर का होम, अभिषेक, कावड़ी और सूरसम्हारम् नाट्य घर की अनिवार्य सूची नहीं हैं।",
    },
    paran: {
      en: "Complete today's one-day vrata after the principal Murugan worship according to family or temple tradition; no universal monthly clock is established.",
      hi: "आज का एक-दिवसीय व्रत मुख्य मुरुगन पूजा के बाद पारिवारिक या मंदिर-परंपरा से पूरा करें; मासिक व्रत के लिए एक सार्वभौमिक समय स्थापित नहीं है।",
    },
    udyapan: {
      en: "No universal household udyapan is established. A counted or specially undertaken monthly vow should be completed under family, Guru or temple guidance.",
      hi: "एक सार्वभौमिक घरेलू उद्यापन स्थापित नहीं है। गिनती या विशेष संकल्प का मासिक व्रत परिवार, गुरु या मंदिर के मार्गदर्शन में पूरा करें।",
    },
  },
  kandaSashtiAnnual: {
    verdict: {
      en: "This page belongs to the annual Kanda Sashti (கந்த சஷ்டி), Shri Murugan's six-day Tamil observance. The vow begins on day one, culminates with Soorasamharam on day six, and is followed by Thirukalyanam on day seven.",
      hi: "यह वार्षिक कन्द षष्ठी (கந்த சஷ்டி) है—श्री मुरुगन का छह-दिवसीय तमिल अनुष्ठान। व्रत पहले दिन आरम्भ होता है, छठे दिन सूरसम्हारम् पर चरम होता है और सातवें दिन तिरुकल्याणम् मनाया जाता है।",
    },
    vidhi: [
      { en: "Begin the six-day vow on day one and keep the fasting discipline followed by your family or temple through day six.", hi: "पहले दिन छह-दिवसीय व्रत आरम्भ करें और छठे दिन तक परिवार या मंदिर में प्रचलित उपवास-नियम निभाएँ।" },
      { en: "Bathe, clean the worship place and light a lamp before Murugan or the Vel each day.", hi: "प्रतिदिन स्नान करके पूजा-स्थान स्वच्छ करें और मुरुगन या वेल के सामने दीप जलाएँ।" },
      { en: "Offer flowers or fruit, pray, visit a Murugan temple if possible, and recite or listen to a familiar text such as Kanda Sashti Kavacham.", hi: "फूल या फल अर्पित करें, प्रार्थना करें, सम्भव हो तो मुरुगन मंदिर जाएँ और कन्द षष्ठी कवचम् जैसे परिचित पाठ का पाठ या श्रवण करें।" },
      { en: "Observe Soorasamharam on day six. Treat the following day's Thirukalyanam as a separate festival milestone.", hi: "छठे दिन सूरसम्हारम् मनाएँ। अगले दिन के तिरुकल्याणम् को अलग उत्सव मानें।" },
    ],
    diet: {
      en: "Common six-day fasting practices include a complete fast, fruit or milk, simple unsalted food, or one meal. Some Tamil families eat once at night on days 1–5, keep a complete fast on day 6—with milk or fruit where their practice permits it—and eat on the morning of day 7. Follow your family's or temple's rule.",
      hi: "छह-दिवसीय व्रत की प्रचलित विधियों में पूर्ण उपवास, फल या दूध, सादा नमक-रहित भोजन अथवा एक बार भोजन शामिल हैं। कुछ तमिल परिवार दिन 1–5 रात्रि में एक बार भोजन करते हैं, दिन 6 पूर्ण उपवास रखते हैं—अपनी परंपरा में अनुमति हो तो दूध या फल लेते हैं—और दिन 7 प्रातः भोजन करते हैं। अपने परिवार या मंदिर का नियम मानें।",
    },
    sankalpa: {
      en: "“For this annual Kanda Sashti, I worship Shri Murugan and undertake the six-day vrata followed in my family or temple, seeking courage, discipline and divine grace.” This is a plain-language intention, not a prescribed Sanskrit mantra.",
      hi: "“इस वार्षिक कन्द षष्ठी पर मैं श्री मुरुगन की पूजा करता/करती हूँ और साहस, अनुशासन तथा ईश-कृपा के लिए अपने परिवार या मंदिर में प्रचलित छह-दिवसीय व्रत रखता/रखती हूँ।” यह सरल भाव-संकल्प है, निर्धारित संस्कृत मंत्र नहीं।",
    },
    puja: {
      en: "Daily lamp; Murugan or Vel worship; flowers or fruit; familiar Murugan names, hymn or Kanda Sashti Kavacham; temple darshan where possible; aarti. Temple homam, abhishekam, kavadi and Soorasamharam enactment are temple-led observances, not a compulsory household checklist.",
      hi: "प्रतिदिन दीप; मुरुगन या वेल पूजन; फूल या फल; परिचित मुरुगन-नाम, स्तोत्र या कन्द षष्ठी कवचम्; सम्भव हो तो मंदिर-दर्शन; आरती। मंदिर का होम, अभिषेक, कावड़ी और सूरसम्हारम् नाट्य घर की अनिवार्य सूची नहीं हैं।",
    },
    paran: {
      en: "Some Tamil families complete the six-day vow with food on the morning of day 7. Follow that timing only when it matches your family or temple; otherwise use the completion rule taught by your tradition.",
      hi: "कुछ तमिल परिवार छह-दिवसीय व्रत को दिन 7 प्रातः भोजन से पूरा करते हैं। यह समय तभी अपनाएँ जब आपके परिवार या मंदिर की परंपरा इससे मेल खाती हो; अन्यथा अपनी परंपरा से मिला समापन-नियम रखें।",
    },
    udyapan: {
      en: "No universal household udyapan is established. Complete the six-day or any specially undertaken vow under family, Guru or temple guidance.",
      hi: "एक सार्वभौमिक घरेलू उद्यापन स्थापित नहीं है। छह-दिवसीय या विशेष संकल्प का व्रत परिवार, गुरु या मंदिर के मार्गदर्शन में पूरा करें।",
    },
  },
  masikDurgashtami: {
    verdict: {
      en: "This is Maa Durga's monthly Shukla Ashtami vrata. Keep the day-long fast and worship rule followed by your family or temple. Simple household prayer is appropriate; formal Chandi or tantric rites require qualified guidance.",
      hi: "यह माँ दुर्गा का मासिक शुक्ल अष्टमी व्रत है। अपने परिवार या मंदिर में प्रचलित दिनभर के उपवास और पूजा-नियम का पालन करें। सरल घरेलू प्रार्थना उपयुक्त है; विधिवत चण्डी या तांत्रिक अनुष्ठान योग्य मार्गदर्शन में ही करें।",
    },
    vidhi: [
      { en: "Bathe and clean the household shrine.", hi: "स्नान करके घर का पूजा-स्थान स्वच्छ करें।" },
      { en: "Light a lamp before Maa Durga and offer water, flowers and fruit or the family's usual satvik bhog.", hi: "माँ दुर्गा के सामने दीप जलाएँ और जल, फूल तथा फल या परिवार में प्रचलित सात्त्विक भोग अर्पित करें।" },
      { en: "State the intention for the day's vrata.", hi: "आज के व्रत का अपना संकल्प स्पष्ट करें।" },
      { en: "Recite or listen to a Durga prayer already known in your family, or pray in your own words.", hi: "परिवार में परिचित दुर्गा-प्रार्थना का पाठ या श्रवण करें, अथवा अपने शब्दों में प्रार्थना करें।" },
      { en: "Perform evening aarti or visit a Devi temple according to your practice.", hi: "अपनी परंपरा के अनुसार सायंकाल आरती करें या देवी मंदिर जाएँ।" },
    ],
    diet: {
      en: "The traditional observance is a day-long fast. Follow the exact food and water rule received from your family, Guru or temple; a strict inherited rule is not replaced by a generic menu.",
      hi: "पारंपरिक अनुष्ठान दिनभर का व्रत है। भोजन और जल का वही नियम रखें जो आपके परिवार, गुरु या मंदिर से मिला है; कठोर पारिवारिक नियम को सामान्य सूची से नहीं बदला जाता।",
    },
    sankalpa: {
      en: "“On this Masik Durgashtami, I worship Maa Durga and observe the vrata followed in my family, praying for strength, protection and right conduct.” This is a plain-language intention, not a prescribed Sanskrit mantra.",
      hi: "“इस मासिक दुर्गाष्टमी पर मैं माँ दुर्गा की पूजा करता/करती हूँ और शक्ति, रक्षा तथा सदाचार के लिए अपने परिवार में प्रचलित व्रत रखता/रखती हूँ।” यह सरल भाव-संकल्प है, निर्धारित संस्कृत मंत्र नहीं।",
    },
    puja: {
      en: "Lamp; water, flowers and satvik bhog; a familiar Durga prayer; evening aarti or Devi-temple visit. Homa, bali, nyasa, mudra, initiated mantra, yantra installation and advanced tantric sadhana are Guru- or temple-led, not do-it-yourself instructions.",
      hi: "दीप; जल, फूल और सात्त्विक भोग; परिचित दुर्गा-प्रार्थना; सायं आरती या देवी-मंदिर दर्शन। होम, बलि, न्यास, मुद्रा, दीक्षित मंत्र, यंत्र-स्थापना और उन्नत तांत्रिक साधना गुरु या मंदिर के मार्गदर्शन में होती हैं, स्वयं करने की विधियाँ नहीं।",
    },
    paran: {
      en: "Complete after the day's Durga worship according to family or temple tradition. A single universal paran clock is not established for this monthly vrata.",
      hi: "दिन की दुर्गा-पूजा के बाद परिवार या मंदिर की परंपरा के अनुसार व्रत पूरा करें। इस मासिक व्रत के लिए एक सार्वभौमिक पारण-समय स्थापित नहीं है।",
    },
    udyapan: {
      en: "No universal monthly udyapan is established. For a counted or specially undertaken vow, ask the family priest, Guru or temple that gave the observance.",
      hi: "एक सार्वभौमिक मासिक उद्यापन स्थापित नहीं है। निश्चित संख्या या विशेष संकल्प के व्रत के लिए उसी परिवार-पुरोहित, गुरु या मंदिर से विधि लें जहाँ से व्रत मिला है।",
    },
  },
  vatSavitri: {
    ...VAT_SAVITRI_COMMON,
    verdict: {
      en: "This is the North Indian/Purnimanta form on Jyeshtha Amavasya. Keep your family's fast, worship Savitri–Satyavan and the banyan tree, tie the sacred thread with pradakshina, and hear the katha. Vat Purnima is the corresponding western/southern regional date.",
      hi: "यह ज्येष्ठ अमावस्या का उत्तर भारतीय/पूर्णिमान्त रूप है। पारिवारिक व्रत रखें, सावित्री–सत्यवान और वट-वृक्ष की पूजा करें, प्रदक्षिणा के साथ धागा बाँधें और कथा सुनें। पश्चिम/दक्षिण भारत में इसी व्रत की क्षेत्रीय तिथि वट पूर्णिमा है।",
    },
  },
  vatPurnima: {
    ...VAT_SAVITRI_COMMON,
    verdict: {
      en: "This is the Amanta form on Jyeshtha Purnima, followed especially in Maharashtra, Gujarat and parts of southern India. Keep your family's fast, worship Savitri–Satyavan and the banyan tree, tie the sacred thread with pradakshina, and hear the katha. North Indian families commonly use Vat Savitri on Amavasya instead.",
      hi: "यह ज्येष्ठ पूर्णिमा का अमान्त रूप है, जो विशेषतः महाराष्ट्र, गुजरात और दक्षिण भारत के कुछ भागों में प्रचलित है। पारिवारिक व्रत रखें, सावित्री–सत्यवान और वट-वृक्ष की पूजा करें, प्रदक्षिणा के साथ धागा बाँधें और कथा सुनें। उत्तर भारतीय परिवार सामान्यतः अमावस्या की वट सावित्री मानते हैं।",
    },
  },
  varalakshmi: {
    verdict: {
      en: "Worship Shri Varalakshmi for the family's well-being and auspiciousness. Keep your family's morning fast, perform the kalasha puja in a suitable local worship window, hear the vrata story, wear the blessed thread according to family custom, and complete with prasada after the puja.",
      hi: "परिवार के कल्याण और मंगल के लिए श्री वरलक्ष्मी की पूजा करें। परिवार में प्रचलित प्रातःकालीन उपवास रखें, स्थानीय शुभ समय में कलश-पूजा करें, व्रत-कथा सुनें, पारिवारिक रीति से पूजित धागा धारण करें और पूजा के बाद प्रसाद लेकर व्रत पूरा करें।",
    },
    vidhi: [
      { en: "Clean the worship place and draw the family's kolam or rangoli where practiced.", hi: "पूजा-स्थान स्वच्छ करें और परंपरा हो तो कोलम् या रंगोली बनाएँ।" },
      { en: "Prepare the kalasha, Lakshmi decoration, sacred thread and naivedya according to regional and family custom.", hi: "क्षेत्रीय और पारिवारिक रीति से कलश, लक्ष्मी-श्रृंगार, पवित्र धागा और नैवेद्य तैयार करें।" },
      { en: "Bathe, light the lamp and state the vrata intention; invoke Varalakshmi in the prepared kalasha according to family practice.", hi: "स्नान करके दीप जलाएँ, व्रत-संकल्प करें और पारिवारिक विधि से तैयार कलश में वरलक्ष्मी का आवाहन करें।" },
      { en: "Offer water, flowers and naivedya; recite familiar Lakshmi names, stotra or prayer; read or hear the Varalakshmi/Charumathi katha.", hi: "जल, फूल और नैवेद्य अर्पित करें; परिचित लक्ष्मी-नाम, स्तोत्र या प्रार्थना करें; वरलक्ष्मी/चारुमती कथा पढ़ें या सुनें।" },
      { en: "Perform aarti, offer the sacred thread, then wear it and exchange tambulam or gifts where this belongs to family custom.", hi: "आरती करें, पवित्र धागा देवी को अर्पित करके धारण करें और परंपरा हो तो ताम्बूल या उपहार दें।" },
    ],
    diet: {
      en: "Keep the fast from morning according to your family's food and water rule. Kalasha contents, naivedya and fasting level vary by region and family.",
      hi: "प्रातः से परिवार के भोजन और जल संबंधी नियम के अनुसार व्रत रखें। कलश-सामग्री, नैवेद्य और उपवास का स्तर क्षेत्र और परिवार के अनुसार बदलता है।",
    },
    sankalpa: {
      en: "“On this Varalakshmi Vratam, I worship Shri Mahalakshmi and undertake my family's vrata for auspiciousness, right prosperity and the well-being of the whole family.” This is a plain-language intention, not a prescribed Sanskrit mantra.",
      hi: "“इस वरलक्ष्मी व्रतम् पर मैं श्री महालक्ष्मी की पूजा करता/करती हूँ और परिवार के मंगल, धर्मसम्मत समृद्धि तथा सभी सदस्यों के कल्याण के लिए अपने परिवार में प्रचलित व्रत रखता/रखती हूँ।” यह सरल भाव-संकल्प है, निर्धारित संस्कृत मंत्र नहीं।",
    },
    puja: {
      en: "Simple path: lamp, prepared kalasha, water, flowers, family naivedya, familiar Lakshmi prayer, vrata katha, aarti and sacred thread. If the kalasha invocation or full 16/32-upachara procedure is unfamiliar, join a temple or ask a priest or family elder rather than guessing mantras.",
      hi: "सरल विधि: दीप, तैयार कलश, जल, फूल, पारिवारिक नैवेद्य, परिचित लक्ष्मी-प्रार्थना, व्रत-कथा, आरती और पवित्र धागा। कलश-आवाहन या पूर्ण 16/32-उपचार विधि ज्ञात न हो तो मंत्र का अनुमान लगाने के बजाय मंदिर, पुरोहित या परिवार के बड़े से मार्गदर्शन लें।",
    },
    paran: {
      en: "Complete with prasada after the Varalakshmi puja unless your sampradaya gives a stricter completion rule.",
      hi: "वरलक्ष्मी पूजा के बाद प्रसाद लेकर व्रत पूरा करें, जब तक आपके सम्प्रदाय में इससे कठोर समापन-नियम न हो।",
    },
    udyapan: {
      en: "No universal udyapan is established. A counted or specially undertaken annual vow should be completed under the family, priest or sampradaya that gave its rules.",
      hi: "एक सार्वभौमिक उद्यापन स्थापित नहीं है। निश्चित संख्या या विशेष संकल्प के वार्षिक व्रत को उसी परिवार, पुरोहित या सम्प्रदाय के मार्गदर्शन में पूरा करें जहाँ से उसके नियम मिले हैं।",
    },
  },
  ayyappaMandala: {
    verdict: {
      en: "The public Mandala season and a devotee's personal 41-day vow are not automatically the same. A personal vrata begins when the mala is knowingly worn; follow the Sabarimala discipline and complete the pilgrimage under Guru Swami or temple guidance.",
      hi: "सार्वजनिक मंडल-काल और भक्त का व्यक्तिगत 41-दिवसीय व्रत अपने-आप एक नहीं हैं। व्यक्तिगत व्रत सचेत रूप से माला धारण करने पर आरम्भ होता है; सबरीमला अनुशासन रखें और गुरु स्वामी या मंदिर के मार्गदर्शन में यात्रा पूरी करें।",
    },
    vidhi: [
      { en: "Receive and wear the Ayyappa mala after prayer, normally from a temple priest or Guru Swami; official guidance also permits wearing it in the home prayer place.", hi: "प्रार्थना के बाद अय्यप्पा माला धारण करें—सामान्यतः मंदिर के पुरोहित या गुरु स्वामी से; आधिकारिक मार्गदर्शन घर के पूजा-स्थान में माला धारण करने की अनुमति भी देता है।" },
      { en: "For 41 days, worship Ayyappa regularly, maintain celibacy, eat vegetarian food, and avoid alcohol, smoking and worldly indulgence.", hi: "41 दिनों तक नियमित अय्यप्पा-पूजन, ब्रह्मचर्य और शाकाहारी आहार रखें तथा मदिरा, धूम्रपान और सांसारिक विलास से दूर रहें।" },
      { en: "Black is the recommended clothing colour in the Sabarimala tradition. The official discipline also avoids cutting hair, shaving and trimming nails during the vrata.", hi: "सबरीमला परंपरा में काला वस्त्र अनुशंसित है। आधिकारिक अनुशासन में व्रत के दौरान बाल कटवाना, दाढ़ी बनाना और नाखून काटना भी वर्जित है।" },
      { en: "Pray morning and evening using the Ayyappa prayer, name or bhajan taught by the family or temple group; do not assume a compulsory count.", hi: "प्रातः और सायं परिवार या मंदिर-समूह से मिला अय्यप्पा नाम, प्रार्थना या भजन करें; कोई अनिवार्य संख्या न मानें।" },
      { en: "Prepare the pilgrimage, Kettunirakkal and Irumudi with the Guru Swami or temple group. Irumudi is not an improvised do-it-yourself packing ritual.", hi: "यात्रा, केट्टुनिरक्कल और इरुमुडी की तैयारी गुरु स्वामी या मंदिर-समूह के साथ करें। इरुमुडी अनुमान से स्वयं करने की पैकिंग-विधि नहीं है।" },
    ],
    diet: {
      en: "The official core is vegetarian food, sobriety and simple living. Meal times, onion/garlic rules and other ingredient restrictions vary; follow the Guru Swami, temple or family group rather than assuming a universal menu.",
      hi: "आधिकारिक मूल नियम शाकाहारी भोजन, नशामुक्ति और सरल जीवन है। भोजन-समय, प्याज-लहसुन और अन्य सामग्री के नियम भिन्न होते हैं; सार्वभौमिक सूची मानने के बजाय गुरु स्वामी, मंदिर या परिवार-समूह का नियम रखें।",
    },
    sankalpa: {
      en: "“With Lord Ayyappa as my refuge, I begin this 41-day Mandala Vratham and will follow the discipline taught by my Guru Swami or temple with prayer, restraint and sincerity.” This does not replace the initiation or prayer used by your tradition.",
      hi: "“भगवान अय्यप्पा की शरण लेकर मैं यह 41-दिवसीय मंडल व्रतम् आरम्भ करता/करती हूँ और प्रार्थना, संयम तथा श्रद्धा से गुरु स्वामी या मंदिर द्वारा सिखाए नियमों का पालन करूँगा/करूँगी।” यह आपकी परंपरा की दीक्षा या प्रार्थना का स्थान नहीं लेता।",
    },
    puja: {
      en: "Regular home or temple Ayyappa worship and familiar prayer or bhajan. Prepare Irumudi only under Guru Swami guidance; it is required for ascending the sacred 18 steps. Neyyabhishekam, Padi Pooja, Kettunirakkal and Aazhi Pooja are temple or pilgrimage observances.",
      hi: "नियमित घर या मंदिर में अय्यप्पा-पूजन और परिचित प्रार्थना या भजन। इरुमुडी केवल गुरु स्वामी के मार्गदर्शन में तैयार करें; पवित्र 18 सीढ़ियाँ चढ़ने के लिए यह आवश्यक है। नेय्यभिषेकम्, पड़ी पूजा, केट्टुनिरक्कल और आज़ि पूजा मंदिर या यात्रा के अनुष्ठान हैं।",
    },
    paran: {
      en: "Mandala Pooja closes the public 41-day temple season. A pilgrim's mala is removed after completing the pilgrimage according to Guru Swami or temple practice—not automatically on the public day 41. Without a Sabarimala trip, ask an Ayyappa temple or Guru Swami for the accepted completion.",
      hi: "मंडल पूजा सार्वजनिक 41-दिवसीय मंदिर-काल का समापन है। यात्री की माला गुरु स्वामी या मंदिर की विधि से यात्रा पूरी होने के बाद उतारी जाती है—सार्वजनिक दिन 41 पर अपने-आप नहीं। सबरीमला यात्रा न हो तो मान्य समापन के लिए अय्यप्पा मंदिर या गुरु स्वामी से पूछें।",
    },
    udyapan: {
      en: "The accepted completion depends on the undertaken pilgrimage and Guru Swami or temple tradition. If illness or a serious event interrupts the vrata, seek that guidance and make the restart decision yourself; the calendar does not reset a personal vow.",
      hi: "मान्य समापन आपकी यात्रा और गुरु स्वामी या मंदिर की परंपरा पर निर्भर है। बीमारी या गंभीर घटना से व्रत बाधित हो तो मार्गदर्शन लें और पुनः आरम्भ का निर्णय स्वयं करें; कैलेंडर व्यक्तिगत व्रत को रीसेट नहीं करता।",
    },
    safety: {
      en: "This health guidance does not change the religious discipline. Do not stop prescribed medicine for the vrata. Prepare physically for the climb, carry required medicines and medical information, ascend at a safe pace, rest when needed and use the medical centres if unwell. Seek medical advice before fasting or a strenuous pilgrimage when you have a health condition.",
      hi: "यह स्वास्थ्य-सूचना धार्मिक अनुशासन को नहीं बदलती। व्रत के कारण निर्धारित दवा बंद न करें। चढ़ाई के लिए शरीर को तैयार करें, आवश्यक दवा और चिकित्सकीय जानकारी साथ रखें, सुरक्षित गति से चढ़ें, आवश्यकता पर विश्राम करें और अस्वस्थ होने पर चिकित्सा-केंद्र की सहायता लें। स्वास्थ्य-स्थिति में उपवास या कठिन यात्रा से पहले चिकित्सकीय सलाह लें।",
    },
  },
};
