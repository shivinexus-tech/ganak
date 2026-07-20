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
  en: "Devotion is not measured by dehydration. Nirjala (no food or water) is a strict traditional option, not the usual choice. Children, older people, anyone who is pregnant or breastfeeding, unwell, taking medicines, or living with diabetes, kidney disease or an eating disorder should use a modified observance and seek medical advice where relevant. Break the fast and seek help if you become faint, confused, severely weak, cannot keep fluids down, or have unsafe blood-sugar symptoms. Never stop or retime prescribed medicine without medical advice.",
  hi: "भक्ति का माप निर्जलीकरण नहीं है। निर्जला (बिना अन्न-जल) व्रत एक कठोर पारम्परिक विकल्प है, सामान्य विकल्प नहीं। बच्चे, वृद्ध, गर्भवती या स्तनपान कराने वाली महिलाएँ, अस्वस्थ व्यक्ति, दवा लेने वाले, मधुमेह, गुर्दे की बीमारी या ईटिंग-डिसऑर्डर वाले लोग संशोधित व्रत रखें और आवश्यकता अनुसार चिकित्सकीय सलाह लें। चक्कर, भ्रम, अत्यधिक कमजोरी, पानी न रुकना या असुरक्षित रक्त-शर्करा लक्षण हों तो व्रत तोड़ें और सहायता लें। चिकित्सकीय सलाह के बिना दवा बन्द न करें और न उसका समय बदलें।",
};
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
  navratri: {
    verdict: {
      en: "Begin with Ghatasthapana in the local Pratipada morning time shown above and honour Shakti for nine days. Chaitra commonly reaches Rama Navami; Sharad commonly reaches Durga Ashtami or Navami and Vijayadashami.",
      hi: "ऊपर दिखाए स्थानीय प्रतिपदा-प्रातः घटस्थापना समय में आरम्भ करें और नौ दिन शक्ति-पूजन करें। चैत्र में राम नवमी, शारदीय में दुर्गाष्टमी या नवमी और विजयादशमी प्रमुख हैं।",
    },
    vidhi: [
      { en: "Before starting, choose all nine days, the first and last days, or a family-approved shorter pattern. You do not need to promise nine full fasts unless that is your chosen sankalpa.", hi: "आरम्भ से पहले नौ दिन, प्रथम-अन्तिम दिन या कुल-मान्य छोटा क्रम चुनें। नौ पूर्ण उपवास का संकल्प तभी लें जब आपने वही रूप चुना हो।" },
      { en: "Install the kalasha only in the displayed Ghatasthapana window and only if someone can care for the shrine safely. A simple image-and-lamp practice is valid.", hi: "कलश केवल दिखाए घटस्थापना समय में और तभी स्थापित करें जब सुरक्षित देखभाल हो; चित्र और दीप की सरल पूजा भी मान्य।" },
      { en: "Each day worship the displayed Navadurga form, offer suitable prasad, chant or read a familiar Devi text. Keep diet and conduct satvik.", hi: "प्रतिदिन दिखाए नवदुर्गा रूप की पूजा, उचित प्रसाद, परिचित देवी-पाठ/जप; आहार-आचरण सात्त्विक रखें।" },
      { en: "Perform Kanya Puja only if customary, with consent, dignity, equal welcome and no pressure on children. Conclude according to the selected Ashtami/Navami/Dashami tradition.", hi: "कन्या-पूजन कुल में हो तो सहमति, सम्मान, समान स्वागत और बच्चों पर बिना दबाव; चुनी अष्टमी/नवमी/दशमी परम्परा अनुसार समापन।" },
    ],
    diet: {
      en: "Common phalahar foods include fruit, dairy, nuts, potato, sweet potato, sabudana, singhara, kuttu, rajgira and samak where the family accepts them. Avoid meat, alcohol, grains/pulses, onion and garlic in the standard North-Indian vrat form. Regional Shakta offerings and non-fasting Durga Puja customs can differ and must not be overwritten.",
      hi: "फल, दुग्ध, मेवे, आलू, शकरकंद, साबूदाना, सिंघाड़ा, कुट्टू, राजगीरा, सामक कुलानुसार। उत्तर भारतीय सामान्य व्रत में मांस, मद्य, अन्न-दाल, प्याज-लहसुन छोड़ते हैं। क्षेत्रीय शाक्त भोग और बिना-व्रत दुर्गापूजा परम्पराएँ अलग हो सकती हैं; उन्हें न बदलें।",
    },
    sankalpa: {
      en: "“For this chosen Navratri period I honour the Divine Mother. May strength become compassion, clarity and protection—not pride or harm.”",
      hi: "“इस चुनी नवरात्रि अवधि में मैं जगन्माता का पूजन करता/करती हूँ। शक्ति करुणा, विवेक और रक्षा बने—अहंकार या हानि नहीं।”",
    },
    puja: {
      en: "Lamp; Ganesha; kalasha/Devi image; daily Devi name; water, flower, kumkum where customary, fruit/sweet; reading/japa; aarti. Do not prescribe tantric mantra, nyasa, bali or homa as a beginner DIY practice.",
      hi: "दीप, गणेश, कलश/देवी-चित्र, दैनिक देवी-नाम, जल, फूल, परम्परानुसार कुमकुम, फल/मिष्ठान्न, पाठ/जप, आरती। तांत्रिक मन्त्र, न्यास, बलि या होम को नए व्यक्ति की स्वयं-विधि न बनाएँ।",
    },
    paran: {
      en: "Valid customs differ. Formal nine-day paran is after Navami ends; many North-Indian households break after Ashtami or Navami Kanya Puja. Follow the local time for your chosen custom, and break gently rather than with a large fried meal.",
      hi: "मान्य मत अलग हैं। औपचारिक नौ-दिवसीय पारण नवमी समाप्ति के बाद होता है; कई उत्तर भारतीय घर अष्टमी या नवमी कन्या-पूजन के बाद खोलते हैं। अपनी चुनी परम्परा का स्थानीय समय मानें और भारी तले भोजन के बजाय धीरे व्रत खोलें।",
    },
    udyapan: {
      en: "The concluding Kanya Puja/homa/kalasha visarjana varies by the original sankalpa. A simple observer completes prayer, distributes prasad and respectfully concludes the kalasha; elaborate homa requires guidance.",
      hi: "कन्या-पूजन, होम, कलश-विसर्जन मूल संकल्प अनुसार बदलते हैं। सरल साधक प्रार्थना, प्रसाद और आदरपूर्वक कलश-समापन करे; विस्तृत होम मार्गदर्शन में।",
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
      en: "Worship Shiva and Parvati in the early-morning Hartalika time shown above; some regions use Pradosh if morning puja is impossible. Nirjala is a widely practised but optional strict form.",
      hi: "ऊपर दिखाए प्रातः हरतालिका समय में शिव-पार्वती पूजा करें; कुछ क्षेत्रों में प्रातः सम्भव न हो तो प्रदोष विकल्प है। निर्जला प्रचलित लेकिन वैकल्पिक कठोर रूप है।",
    },
    vidhi: [
      { en: "Bathe, dress cleanly and take sankalpa; make or place simple clay/sand Shiva-Parvati forms; worship Ganesha first, then Uma-Maheshwara; hear the Hartalika katha; where customary continue bhajan/vigil and conclude next morning.", hi: "स्नान, स्वच्छ वस्त्र, संकल्प; मिट्टी/बालू के सरल शिव-पार्वती रूप; पहले गणेश, फिर उमा-महेश्वर पूजा; हरतालिका कथा; परम्परानुसार भजन/जागरण और अगली सुबह समापन।" },
    ],
    diet: {
      en: "Nirjala (without water) is a regional strict practice, not a universal requirement. If your health needs it, a water or phalahar form chosen in advance is an accepted modified observance.",
      hi: "निर्जला (बिना जल) क्षेत्रीय कठोर परम्परा है, सार्वभौमिक अनिवार्यता नहीं। स्वास्थ्य की आवश्यकता हो तो पहले से चुना गया जल या फलाहार रूप मान्य संशोधित व्रत है।",
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
  // Sourced Chhath card; wired to the main (day 3) calendar key. The calendar
  // separately surfaces all four sequence days so this card is not read as a
  // one-day fast. Sources: plans/vrat-vidhis.md and phase1-content-diwali-chhath.md.
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
};
