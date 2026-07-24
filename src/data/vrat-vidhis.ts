// Vrat vidhi content — extracted from kundli-app.tsx (EPIC-SPLIT).
// Pure data, no app logic: content agents can edit this file without touching the app.

import { MAJOR_FESTIVAL_GUIDES, MAJOR_FESTIVAL_SUPPLEMENTS } from "./major-festival-guides";
import { DURGA_PUJA_GUIDES } from "./durga-puja-guides";
import { VRAT_GUIDE_ENRICHMENTS } from "./vrat-guide-enrichments";
import { REGIONAL_KATHAS } from "./regional-kathas";

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
  materials: { en: "Keep ready", hi: "सामग्री तैयार रखें" },
  panchopachara: { en: "Recommended household puja — Panchopachara", hi: "घर के लिए अनुशंसित पूजा — पंचोपचार" },
  shodashopachara: { en: "Expanded puja — Shodashopachara (16 offerings)", hi: "विस्तृत पूजा — षोडशोपचार (16 उपचार)" },
  afterPuja: { en: "Complete the worship", hi: "पूजा पूर्ण करें" },
  paran: { en: "Paran", hi: "पारण" },
  udyapan: { en: "Udyapan", hi: "उद्यापन" },
  safety: { en: "Health note", hi: "स्वास्थ्य टिप्पणी" },
  meaning: { en: "Why this day matters", hi: "इस दिन का महत्त्व" },
  stories: { en: "Regional kathas to read or hear", hi: "पढ़ने या सुनने योग्य क्षेत्रीय कथाएँ" },
  regional: { en: "Regional traditions", hi: "क्षेत्रीय परम्पराएँ" },
};
export const VRAT_VIDHI_SAFETY = {
  en: "This health note does not change the religious rule described below. Some vrats are traditionally nirjala (without food or water). Children, older people, anyone who is pregnant or breastfeeding, unwell, taking medicines, or living with diabetes, kidney disease or an eating disorder should seek medical advice and guidance from their family or religious tradition before observing a strict fast. Seek help if you become faint, confused, severely weak, cannot keep fluids down, or have unsafe blood-sugar symptoms. Never stop or retime prescribed medicine without medical advice.",
  hi: "यह स्वास्थ्य टिप्पणी नीचे लिखे धार्मिक नियम को नहीं बदलती। कुछ व्रत परम्परागत रूप से निर्जला (बिना अन्न-जल) रखे जाते हैं। बच्चे, वृद्ध, गर्भवती या स्तनपान कराने वाली महिलाएँ, अस्वस्थ व्यक्ति, दवा लेने वाले, मधुमेह, गुर्दे की बीमारी या ईटिंग-डिसऑर्डर वाले लोग कठोर व्रत से पहले चिकित्सकीय सलाह और अपनी कुल या धार्मिक परम्परा का मार्गदर्शन लें। चक्कर, भ्रम, अत्यधिक कमजोरी, पानी न रुकना या असुरक्षित रक्त-शर्करा लक्षण हों तो सहायता लें। चिकित्सकीय सलाह के बिना दवा बन्द न करें और न उसका समय बदलें।",
};

const VAT_SAVITRI_COMMON = Object.freeze({
  vidhi: [
    { en: "Bathe and prepare the offerings used in your family.", hi: "स्नान करके परिवार में प्रचलित पूजन-सामग्री तैयार करें।" },
    { en: "At a banyan tree, offer water and flowers and worship Savitri–Satyavan according to family custom.", hi: "वट-वृक्ष के पास जल और फूल अर्पित करके पारिवारिक रीति से सावित्री–सत्यवान का पूजन करें।" },
    { en: "Tie the sacred thread while making the customary pradakshina. Use your family's count using the count taught in your family.", hi: "प्रदक्षिणा करते हुए पवित्र धागा बाँधें। कोई एक संख्या मानने के बजाय अपने परिवार में प्रचलित संख्या रखें।" },
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
  ...MAJOR_FESTIVAL_GUIDES,
  ...DURGA_PUJA_GUIDES,
  makarSankranti: {
    verdict: {
      en: "Makar Sankranti is the major solar festival when Surya enters Makara in the sidereal Hindu calendar. The shared household observance is Surya arghya, til and jaggery or the family's seasonal food, charity and gratitude; fasting rules differ by family and region.",
      hi: "मकर संक्रांति वह प्रमुख सौर पर्व है जब निरयण हिन्दू पंचांग में सूर्य मकर राशि में प्रवेश करते हैं। घर की सामान्य विधि सूर्य को अर्घ्य, तिल-गुड़ या पारिवारिक मौसमी भोजन, दान और कृतज्ञता है; उपवास के नियम परिवार और क्षेत्र के अनुसार बदलते हैं।",
    },
    meaning: {
      en: "Religiously, this date marks Surya's transition from Dhanu to Makara and is traditionally associated with Uttarayana. Astronomically, the Sun's apparent northward turn now occurs at the December winter solstice, roughly three weeks earlier; precession has separated the two dates. The traditional observance continues to follow the Makara ingress.",
      hi: "धार्मिक पंचांग में यह सूर्य के धनु से मकर राशि में प्रवेश का दिन है और परम्परा में उत्तरायण से जुड़ा है। खगोल-विज्ञान में सूर्य का प्रत्यक्ष उत्तर की ओर मुड़ना अब दिसंबर के शीत अयनांत पर, लगभग तीन सप्ताह पहले होता है; पृथ्वी की धुरी के अयनचलन से दोनों तिथियाँ अलग हो गई हैं। पारम्परिक पर्व मकर-संक्रमण की तिथि पर ही मनाया जाता है।",
    },
    vidhi: [
      { en: "Bathe and clean the worship place. If sacred bathing belongs to your tradition, use a safe, permitted riverbank or bathe at home with the same devotional intention.", hi: "स्नान करके पूजा-स्थान स्वच्छ करें। यदि तीर्थ-स्नान आपकी परम्परा में है तो सुरक्षित, अनुमत घाट का उपयोग करें; अन्यथा उसी श्रद्धा से घर पर स्नान करें।" },
      { en: "At sunrise, offer clean water as arghya to Surya and recite a familiar Surya name, prayer or Gayatri used by your family. Do not stare directly at the Sun.", hi: "सूर्योदय पर सूर्य को स्वच्छ जल से अर्घ्य दें और परिवार में प्रचलित सूर्य-नाम, प्रार्थना या गायत्री का पाठ करें। सूर्य को सीधे न देखें।" },
      { en: "Offer the food customary in your home. Til and jaggery may be offered as naivedya, eaten, shared with relatives and neighbours, or included in charity; North Indian homes may prepare khichdi.", hi: "घर में प्रचलित भोजन का भोग रखें। तिल-गुड़ नैवेद्य में चढ़ाएँ, स्वयं ग्रहण करें, सम्बन्धियों-पड़ोसियों में बाँटें या दान में दें; उत्तर भारतीय घरों में खिचड़ी भी बनाई जाती है।" },
      { en: "Give food, sesame, jaggery, warm clothing or another useful gift according to your means. Charity is a central Sankranti practice, not a competition in spending.", hi: "सामर्थ्य के अनुसार अन्न, तिल, गुड़, गर्म वस्त्र या कोई उपयोगी वस्तु दान करें। संक्रांति का दान दिखावा या खर्च की प्रतियोगिता नहीं है।" },
      { en: "Read one of the associated stories below, remember the farmers, animals and natural forces that sustain food, share the festive meal, and close with gratitude to Surya.", hi: "नीचे दी गई किसी सम्बद्ध कथा का पाठ करें, अन्न देने वाले किसान, पशु और प्रकृति को स्मरण करें, पर्व का भोजन बाँटें और सूर्य के प्रति कृतज्ञता से पूजा पूर्ण करें।" },
    ],
    diet: {
      en: "There is no single compulsory pan-Indian fast. The observance may include fast until Surya puja or take one simple meal; others celebrate without fasting. Til-gur, khichdi, dahi-chura, tilkut, Pongal and other foods belong to particular regions—follow your own family custom rather than treating every item as mandatory.",
      hi: "पूरे भारत के लिए एक अनिवार्य उपवास-नियम नहीं है। इस अनुष्ठान में सूर्य-पूजा तक व्रत या एक सरल भोजन रखते हैं, जबकि अन्य बिना उपवास पर्व मनाते हैं। तिल-गुड़, खिचड़ी, दही-चूड़ा, तिलकुट, पोंगल आदि क्षेत्र-विशेष के भोजन हैं—सबको अनिवार्य मानने के बजाय अपनी पारिवारिक रीति रखें।",
    },
    sankalpa: {
      en: "“At this Makara transition I honour Surya, give thanks for light, food and livelihood, and will share what I can with others.” This is a plain-language intention, not a prescribed Sanskrit mantra.",
      hi: "“इस मकर-संक्रमण पर मैं सूर्य का पूजन करता/करती हूँ, प्रकाश, अन्न और आजीविका के लिए कृतज्ञ हूँ और सामर्थ्य अनुसार दूसरों के साथ बाँटूँगा/बाँटूँगी।” यह सरल भाव-संकल्प है, निर्धारित संस्कृत मंत्र नहीं।",
    },
    puja: {
      en: "Simple household path: lamp; Surya image or open-sky remembrance; clean-water arghya; flowers where customary; til-gur, khichdi or the family's seasonal naivedya; familiar Surya prayer; charity; aarti. A priest-led Sankranti puja may be followed where that is the family practice.",
      hi: "सरल गृह-विधि: दीप; सूर्य-चित्र या खुले आकाश की ओर सूर्य-स्मरण; स्वच्छ जल का अर्घ्य; परम्परानुसार फूल; तिल-गुड़, खिचड़ी या पारिवारिक मौसमी नैवेद्य; परिचित सूर्य-प्रार्थना; दान; आरती। परिवार में रीति हो तो पुरोहित द्वारा संक्रांति-पूजा कराएँ।",
    },
    stories: [
      { en: "Popular Surya–Shani katha: because Makara is associated with Shani, Surya's entry is remembered as a visit to his son after a strained relationship—a lesson in reconciliation. Retellings vary, so this is a popular festival tradition rather than one universal origin account.", hi: "लोकप्रिय सूर्य–शनि कथा: मकर राशि शनि से सम्बद्ध होने के कारण सूर्य का प्रवेश अपने पुत्र से तनाव के बाद मिलने के रूप में याद किया जाता है—यह मेल-मिलाप का संदेश देता है। इसके रूप अलग-अलग हैं, इसलिए यह लोकप्रिय पर्व-कथा है, एकमात्र सार्वभौमिक उत्पत्ति-कथा नहीं।" },
      { en: "Bhishma and Uttarayana: the Mahabharata tradition remembers Bhishma waiting for the auspicious northern course before leaving his body. This explains Uttarayana's sacred importance; it does not make the modern January Sankranti the exact astronomical solstice.", hi: "भीष्म और उत्तरायण: महाभारत परम्परा में भीष्म पितामह देह-त्याग के लिए शुभ उत्तरायण की प्रतीक्षा करते हैं। यह उत्तरायण का धार्मिक महत्त्व समझाता है; इससे आज की जनवरी संक्रांति खगोलीय अयनांत की ठीक वही तिथि नहीं बनती।" },
      { en: "Bhagiratha and Gangasagar: the story of Bhagiratha bringing Ganga to liberate King Sagara's sons is especially remembered in the Gangasagar pilgrimage and Sankranti bathing tradition. This connection is strongest in that regional tirtha tradition.", hi: "भगीरथ और गंगासागर: राजा सगर के पुत्रों की मुक्ति के लिए भगीरथ द्वारा गंगा को पृथ्वी पर लाने की कथा गंगासागर तीर्थ और संक्रांति-स्नान में विशेष रूप से स्मरण की जाती है। यह सम्बन्ध उस क्षेत्रीय तीर्थ-परम्परा में सबसे प्रमुख है।" },
    ],
    regional: [
      { en: "North India: Surya arghya, sacred bathing, til-gur, charity and khichdi are prominent; Bihar also has dahi-chura and tilkut customs, while exact household menus vary.", hi: "उत्तर भारत: सूर्य-अर्घ्य, तीर्थ-स्नान, तिल-गुड़, दान और खिचड़ी प्रमुख हैं; बिहार में दही-चूड़ा और तिलकुट की परम्पराएँ भी हैं, पर घरों का भोजन अलग हो सकता है।" },
      { en: "Maharashtra: families commonly exchange til-gul with wishes for sweet speech; haldi-kumkum belongs to communities that observe it.", hi: "महाराष्ट्र: परिवार मीठा बोलने की शुभकामना के साथ तिलगुळ बाँटते हैं; हल्दी-कुमकुम उन समुदायों की परम्परा है जहाँ यह प्रचलित है।" },
      { en: "Gujarat and parts of Rajasthan: Uttarayan and kite flying are prominent. Use open spaces and bird-safe thread; sharp or metal-coated string can seriously injure people and animals.", hi: "गुजरात और राजस्थान के कुछ भाग: उत्तरायण और पतंगबाजी प्रमुख हैं। खुले स्थान और पक्षी-सुरक्षित डोर का उपयोग करें; धारदार या धातु-लेपित मांझा मनुष्यों और पशु-पक्षियों को गंभीर चोट पहुँचा सकता है।" },
      { en: "Tamil Nadu's Pongal, Assam's Magh/Bhogali Bihu, Punjab–Haryana's Maghi around Lohri, and the Andhra–Telangana Sankranti sequence have their own multi-day customs. They share the season but should be followed as distinct regional observances.", hi: "तमिलनाडु का पोंगल, असम का माघ/भोगाली बिहू, लोहड़ी के आसपास पंजाब–हरियाणा की माघी और आंध्र–तेलंगाना की बहुदिवसीय संक्रांति-परम्परा की अपनी विधियाँ हैं। ऋतु-सन्दर्भ साझा है, पर इन्हें अलग क्षेत्रीय पर्व के रूप में मानें।" },
    ],
    paran: {
      en: "If your family keeps a Sankranti fast, complete it after the prescribed Surya worship, charity or family rite. There is no single pan-Indian paran clock; follow the family or temple rule that defined the fast.",
      hi: "यदि परिवार में संक्रांति-व्रत रखा जाता है तो निर्धारित सूर्य-पूजा, दान या पारिवारिक कर्म के बाद उसे पूरा करें। पूरे भारत के लिए एक पारण-समय नहीं है; जिस परिवार या मंदिर की विधि से व्रत लिया है, उसी का नियम मानें।",
    },
    udyapan: {
      en: "No separate udyapan is required for the ordinary annual festival. A specially vowed or counted Sankranti observance should be completed according to the family, priest or temple that gave its rules.",
      hi: "सामान्य वार्षिक पर्व के लिए अलग उद्यापन आवश्यक नहीं है। विशेष संकल्प या निश्चित संख्या की संक्रांति उसी परिवार, पुरोहित या मंदिर की विधि से पूर्ण करें जहाँ से उसके नियम मिले हैं।",
    },
    safety: {
      en: "Never stare directly at the Sun while offering arghya. Use only safe, permitted bathing places; cold water, deep currents and crowds can be dangerous. If your family fasts, keep prescribed medicines and seek medical guidance for any health condition. Avoid sharp, glass-coated or metal kite string.",
      hi: "अर्घ्य देते समय सूर्य को सीधे न देखें। केवल सुरक्षित और अनुमत स्नान-स्थान चुनें; ठंडा पानी, तेज धारा और भीड़ खतरनाक हो सकते हैं। परिवार में उपवास हो तो निर्धारित दवाएँ जारी रखें और स्वास्थ्य-स्थिति में चिकित्सकीय सलाह लें। धारदार, काँच-लेपित या धातु वाले मांझे से बचें।",
    },
  },
  diwali: {
    verdict: {
      en: "On the main Diwali night, clean and light the home, then worship Lakshmi with your family during the local evening puja period. A simple household observance needs sincere prayer, a safe lamp, flowers or another respectful offering, family naivedya, gratitude and sharing—it does not require an expensive display or a compulsory fast.",
      hi: "मुख्य दीपावली-रात्रि पर घर स्वच्छ और प्रकाशित करके स्थानीय सायंकालीन पूजा-अवधि में परिवार सहित लक्ष्मी-पूजन करें। सरल गृह-विधि में श्रद्धापूर्ण प्रार्थना, सुरक्षित दीप, फूल या अन्य सम्मानपूर्ण अर्पण, पारिवारिक नैवेद्य, कृतज्ञता और बाँटना पर्याप्त है—महँगा प्रदर्शन या अनिवार्य उपवास आवश्यक नहीं है।",
    },
    meaning: {
      en: "Diwali is the festival of rows of lights, observed on the Amavasya night at the centre of a wider festival sequence. Lamps express light over darkness and knowledge over ignorance. In many North Indian homes the main worship honours Lakshmi, often with Ganesha, while other regions centre different deities and stories; those traditions are related and retain their own complete forms.",
      hi: "दीपावली दीपों की पंक्तियों का पर्व है, जो व्यापक पर्व-क्रम के मध्य अमावस्या-रात्रि पर मनाया जाता है। दीप अंधकार पर प्रकाश और अज्ञान पर ज्ञान का प्रतीक हैं। अनेक उत्तर भारतीय घरों में मुख्य पूजा लक्ष्मी की, प्रायः गणेश के साथ, होती है; अन्य क्षेत्रों में अलग देवता और कथाएँ केंद्र में रहती हैं—ये परम्पराएँ सम्बद्ध हैं पर एक-दूसरे का स्थान नहीं लेतीं।",
    },
    vidhi: [
      { en: "Clean the worship space and entrance before evening. Arrange only what your household can manage: a stable lamp, Lakshmi image or murti used by the family, flowers or leaves where customary, clean water, kumkum or sandal paste, and the family's sweets, fruit or meal as naivedya.", hi: "सायंकाल से पहले पूजा-स्थान और प्रवेश-द्वार स्वच्छ करें। घर जितना सहज कर सके उतना ही रखें: स्थिर दीप, परिवार में पूजित लक्ष्मी-चित्र या मूर्ति, परम्परानुसार फूल या पत्ते, स्वच्छ जल, कुमकुम या चन्दन तथा पारिवारिक मिठाई, फल या भोजन का नैवेद्य।" },
      { en: "Light diyas safely at the altar and suitable places in the home. Keep flame away from curtains, rangoli powder, children and animals; electric lights may be used where an open flame is unsafe.", hi: "पूजा-स्थान और घर के सुरक्षित स्थानों पर दीप जलाएँ। लौ को पर्दों, रंगोली के चूर्ण, बच्चों और पशुओं से दूर रखें; जहाँ खुली लौ सुरक्षित न हो वहाँ विद्युत-दीप उपयोग कर सकते हैं।" },
      { en: "Begin with a brief purification and a plain-language intention. Remember Ganesha first if that is your family custom, then invite Lakshmi respectfully and offer water, scent or kumkum, flowers, lamp and naivedya one by one.", hi: "संक्षिप्त शुद्धि और सरल भाव-संकल्प से आरम्भ करें। यदि परिवार की रीति हो तो पहले गणेश का स्मरण करें, फिर लक्ष्मी का आदरपूर्वक आवाहन करके क्रम से जल, सुगन्ध या कुमकुम, फूल, दीप और नैवेद्य अर्पित करें।" },
      { en: "Recite a familiar Lakshmi prayer, Shri Sukta, Lakshmi ashtottara, bhajan or simple names according to your capacity. A familiar prayer or name-recitation is a complete household offering; receive unfamiliar mantras through your tradition.", hi: "सामर्थ्य और परम्परा के अनुसार परिचित लक्ष्मी-प्रार्थना, श्रीसूक्त, लक्ष्मी अष्टोत्तर, भजन या सरल नाम-स्मरण करें। लम्बी संस्कृत-विधि वैकल्पिक है; अपरिचित मंत्र अपनी परम्परा से विधिपूर्वक प्राप्त करें।" },
      { en: "Offer aarti, bow, distribute prasad and share sweets or useful gifts without pressure to overspend. Leave a lamp only where it can be watched safely; otherwise extinguish it respectfully before sleeping.", hi: "आरती करके प्रणाम करें, प्रसाद बाँटें और बिना अधिक खर्च के दबाव के मिठाई या उपयोगी उपहार साझा करें। दीप केवल वहीं जलता छोड़ें जहाँ सुरक्षित निगरानी हो; अन्यथा सोने से पहले आदरपूर्वक बुझा दें।" },
    ],
    diet: {
      en: "If Lakshmi-puja fasting belongs to your household, keep its water, fruit, milk or meal discipline and complete it after the evening worship. Otherwise receive the family's festive vegetarian meal and prasad. Prepare the regional sweets and savouries loved in your home.",
      hi: "इस अनुष्ठान में लक्ष्मी-पूजन तक दिनभर व्रत रखते हैं, पर यह हर दीपावली-घर के लिए एक अनिवार्य नियम नहीं है। व्रत हो तो परिवार या मंदिर से मिली जल, फल, दूध या भोजन की रीति रखें और सायंकालीन पूजा के बाद खोलें। अन्यथा पारिवारिक उत्सवी शाकाहारी भोजन और प्रसाद लें। क्षेत्रीय मिठाइयाँ और नमकीन बहुत भिन्न होते हैं।",
    },
    sankalpa: {
      en: "“On this night of lights, I welcome wisdom, honest prosperity and generosity into this home. May what we receive be used responsibly and shared with others.” This is a plain-language intention, not a prescribed Sanskrit mantra.",
      hi: "“इस दीप-रात्रि पर मैं इस घर में विवेक, ईमानदार समृद्धि और उदारता का स्वागत करता/करती हूँ। हमें जो मिले उसका सदुपयोग हो और हम दूसरों के साथ बाँटें।” यह सरल भाव-संकल्प है, निर्धारित संस्कृत मंत्र नहीं।",
    },
    puja: {
      en: "Recommended household path: clean altar; safe lamp; Ganesha remembrance where customary; Lakshmi invitation; water, kumkum or sandal, flowers, lamp and naivedya; familiar prayer or Shri Sukta; aarti; prasad and charity. Elaborate Kalasha, new-murti Shodashopachara, account-book, Kubera or priest-led rites belong to households that already follow them and are not required for this simple path.",
      hi: "अनुशंसित गृह-विधि: स्वच्छ वेदी; सुरक्षित दीप; परम्परानुसार गणेश-स्मरण; लक्ष्मी-आवाहन; जल, कुमकुम या चन्दन, फूल, दीप और नैवेद्य; परिचित प्रार्थना या श्रीसूक्त; आरती; प्रसाद और दान। विस्तृत कलश, नई मूर्ति का षोडशोपचार, बही-खाता, कुबेर या पुरोहित-विधि उन्हीं घरों के लिए है जहाँ पहले से प्रचलित हो; सरल विधि में यह अनिवार्य नहीं।",
    },
    stories: [
      { en: "Rama's return: in a widely told North Indian association, lamps welcome Rama, Sita and Lakshmana back to Ayodhya after exile and Ravana's defeat. Ganak labels this as a major regional devotional memory, not the only Diwali story across India.", hi: "राम की वापसी: उत्तर भारत की व्यापक परम्परा में वनवास और रावण-वध के बाद राम, सीता और लक्ष्मण के अयोध्या लौटने पर दीपों से स्वागत स्मरण किया जाता है। गणक इसे प्रमुख क्षेत्रीय भक्ति-स्मृति कहता है, पूरे भारत की एकमात्र दीपावली-कथा नहीं।" },
      { en: "Lakshmi on Amavasya: the main North Indian household night welcomes Lakshmi as the giver of well-being and prosperity. The ethical emphasis is clean work, gratitude, generosity and responsible use of wealth—not gambling or guaranteed financial gain.", hi: "अमावस्या पर लक्ष्मी: उत्तर भारतीय गृह-परम्परा की मुख्य रात्रि में कल्याण और समृद्धि देने वाली लक्ष्मी का स्वागत होता है। इसका नैतिक भाव स्वच्छ कर्म, कृतज्ञता, उदारता और धन का जिम्मेदार उपयोग है—जुआ या निश्चित आर्थिक लाभ नहीं।" },
      { en: "Krishna and Narakasura belongs especially to Naraka Chaturdashi, the preceding dawn observance in many western and southern traditions. It explains Abhyanga Snan and Chhoti Diwali customs there; it should not be collapsed into the Lakshmi-puja night.", hi: "कृष्ण और नरकासुर की कथा विशेषतः नरक चतुर्दशी से जुड़ी है, जो अनेक पश्चिमी और दक्षिणी परम्पराओं में पूर्ववर्ती प्रातः का पर्व है। वहाँ यह अभ्यंग-स्नान और छोटी दीपावली की रीति समझाती है; इसे लक्ष्मी-पूजन की रात्रि में नहीं मिलाना चाहिए।" },
    ],
    regional: [
      { en: "North and much of western India: evening Lakshmi-Ganesha worship, lamps, rangoli, sweets and family gatherings are prominent. Business account-book or Kubera worship is community-specific, not a requirement for every home.", hi: "उत्तर और पश्चिम भारत के बड़े भाग में सायंकालीन लक्ष्मी-गणेश पूजा, दीप, रंगोली, मिठाई और परिवार-मिलन प्रमुख हैं। व्यापारिक बही-खाता या कुबेर-पूजा समुदाय-विशेष की रीति है, हर घर के लिए अनिवार्य नहीं।" },
      { en: "Bengal and parts of eastern India: Kali Puja or Shyama Puja is observed on the same Amavasya night with its own deity, timing and Shakta procedure. Ganak keeps that route and guidance distinct from the Lakshmi household path.", hi: "बंगाल और पूर्वी भारत के कुछ भागों में उसी अमावस्या-रात्रि पर काली पूजा या श्यामा पूजा अपनी देवी, समय और शाक्त-विधि के साथ होती है। गणक उसे लक्ष्मी की गृह-विधि से अलग मार्ग और मार्गदर्शन के रूप में रखता है।" },
      { en: "Maharashtra's sequence commonly includes Vasubaras, Dhantrayodashi, Naraka Chaturdashi, Lakshmi Pujan, Bali Pratipada/Padwa and Bhau Beej, with faral foods and early-morning customs. Follow each named day rather than treating the whole sequence as one ritual.", hi: "महाराष्ट्र के क्रम में प्रायः वसुबारस, धनत्रयोदशी, नरक चतुर्दशी, लक्ष्मी पूजन, बलि प्रतिपदा/पाडवा और भाऊबीज, फराळ तथा प्रातःकालीन रीतियाँ आती हैं। पूरे क्रम को एक ही अनुष्ठान मानने के बजाय प्रत्येक नामित दिन की विधि अलग रखें।" },
      { en: "Tamil Deepavali and several southern observances centre the Naraka Chaturdashi morning, oil bath, new clothes, food and family worship. The calendar relationship is close, but this is not simply the North Indian Lakshmi-puja night translated southward.", hi: "तमिल दीपावली और कई दक्षिण भारतीय परम्पराओं का केंद्र नरक चतुर्दशी की सुबह, तेल-स्नान, नए वस्त्र, भोजन और पारिवारिक पूजा है। पंचांग-सम्बन्ध निकट है, पर यह उत्तर भारतीय लक्ष्मी-पूजन रात्रि का केवल दक्षिणी रूप नहीं है।" },
      { en: "Jain and Sikh Diwali-period observances have their own histories and theology. Ganak's Hindu household guide does not speak for those traditions; users should follow their own community sources.", hi: "जैन और सिख दीपावली-कालीन पर्वों का अपना इतिहास और धर्म-दर्शन है। गणक की हिन्दू गृह-मार्गदर्शिका उन परम्पराओं का प्रतिनिधित्व नहीं करती; उपयोगकर्ता अपने समुदाय के स्रोत मानें।" },
    ],
    paran: {
      en: "If your family observes a fast, complete it after the local evening Lakshmi puja and prasad according to the rule with which the fast was undertaken. Complete paran according to the household tradition.",
      hi: "यदि परिवार में व्रत रखा जाता है तो जिस नियम से व्रत लिया है उसके अनुसार स्थानीय सायंकालीन लक्ष्मी-पूजन और प्रसाद के बाद पूरा करें। पारण अपने घर की परम्परा के अनुसार पूरा करें।",
    },
    udyapan: {
      en: "The ordinary annual festival needs no separate udyapan. A specially vowed Lakshmi observance, counted lamp practice or priest-given vrata should be concluded by the same family, temple or teacher whose rules began it.",
      hi: "सामान्य वार्षिक पर्व के लिए अलग उद्यापन आवश्यक नहीं है। विशेष संकल्पित लक्ष्मी-अनुष्ठान, निश्चित दीप-व्रत या पुरोहित से मिले व्रत का समापन उसी परिवार, मंदिर या गुरु की विधि से करें जहाँ से वह आरम्भ हुआ।",
    },
    safety: {
      en: "Keep every flame on a stable non-flammable surface and supervised; protect children, elders, animals and respiratory patients from smoke and loud noise. Prefer lamps, community celebration and low-pollution alternatives. Never mix fasting with missed medicines or ignore medical dietary needs.",
      hi: "प्रत्येक दीप स्थिर अग्निरोधी सतह पर और निगरानी में रखें; बच्चों, बुज़ुर्गों, पशुओं तथा श्वास-रोगियों को धुएँ और तेज़ शोर से बचाएँ। दीप, सामुदायिक उत्सव और कम-प्रदूषण विकल्प चुनें। व्रत के कारण दवा न छोड़ें और चिकित्सकीय आहार-आवश्यकता की उपेक्षा न करें।",
    },
  },
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
  guptNavratriMagha: {
    verdict: {
      en: "Magha Gupt Navratri begins on Magha Shukla Pratipada. For a complete nine-day vow, begin during the Ghatasthapana time shown for your city, continue the chosen fast and daily Devi worship through Navami, and perform parana in Dashami at the calculated time shown above.",
      hi: "माघ गुप्त नवरात्रि माघ शुक्ल प्रतिपदा से आरम्भ होती है। पूर्ण नौ-दिवसीय संकल्प में अपने शहर के लिए दिखाए घटस्थापना समय में आरम्भ करें, नवमी तक चुना हुआ व्रत और दैनिक देवी-पूजन जारी रखें, और ऊपर निकाले गए समय पर दशमी में पारण करें।",
    },
    meaning: {
      en: "This winter Navratri is commonly kept as a quieter, more personal period of Devi worship. The public household path below centres on sincere daily worship; any specialised mantra or rite personally received from a guru should be followed exactly as taught.",
      hi: "यह शीतकालीन नवरात्रि प्रायः देवी की शांत और निजी उपासना के रूप में रखी जाती है। नीचे दी गृह-विधि सरल दैनिक पूजन पर केन्द्रित है; गुरु से व्यक्तिगत रूप से मिला कोई विशेष मन्त्र या अनुष्ठान उसी सिखाई विधि से करें।",
    },
    vidhi: [
      { en: "Before Day 1, decide your exact sankalpa: a complete fast, one meal, phalahar, or daily worship without a food vow. Keep that same chosen rule through Navami.", hi: "पहले दिन से पूर्व अपना स्पष्ट संकल्प चुनें—पूर्ण उपवास, एक समय भोजन, फलाहार, या बिना आहार-व्रत के दैनिक पूजा। नवमी तक उसी चुने नियम का पालन करें।" },
      { en: "On Pratipada, bathe, wear clean clothes and prepare the worship place. Establish the kalasha during the city-specific Ghatasthapana window if kalasha installation is part of your family practice; otherwise begin before a clean Devi image with a lamp.", hi: "प्रतिपदा को स्नान, स्वच्छ वस्त्र और पूजा-स्थान की तैयारी करें। कुल में कलश-स्थापना हो तो अपने शहर के घटस्थापना समय में कलश स्थापित करें; अन्यथा स्वच्छ देवी-चित्र और दीप के सामने पूजा आरम्भ करें।" },
      { en: "State the nine-day sankalpa, then offer the simple household worship listed below. Read or recite the familiar Devi prayer, stotra or Durga Saptashati portion chosen in the sankalpa.", hi: "नौ-दिवसीय संकल्प बोलें, फिर नीचे दी सरल गृह-पूजा करें। संकल्प में चुनी परिचित देवी-प्रार्थना, स्तोत्र या दुर्गा सप्तशती के अंश का पाठ करें।" },
      { en: "Repeat the lamp, offerings and chosen reading each day through Navami. Observe Ashtami or Navami feeding, Kumari Puja or homa only where it is already part of your family or temple practice.", hi: "नवमी तक प्रतिदिन दीप, अर्पण और चुना पाठ दोहराएँ। अष्टमी या नवमी का भोजन, कुमारी-पूजन या होम वहीं करें जहाँ वह आपकी कुल या मंदिर परम्परा में पहले से हो।" },
      { en: "After Navami ends, complete the promised worship and reading, then perform Dashami parana at the city-specific time shown above.", hi: "नवमी समाप्त होने पर संकल्पित पूजा और पाठ पूर्ण करें, फिर ऊपर दिखाए अपने शहर के समय पर दशमी पारण करें।" },
    ],
    diet: {
      en: "Keep the food rule named in your sankalpa. A complete fast and phalahar are different vows: do not change one into the other silently. Where phalahar is chosen, use only the fruit, dairy, roots or vrat foods accepted in your home; avoid grains, pulses, onion, garlic, meat and alcohol in that form.",
      hi: "संकल्प में लिया आहार-नियम ही मानें। पूर्ण उपवास और फलाहार अलग व्रत हैं; एक को बिना बताए दूसरे में न बदलें। फलाहार लिया हो तो अपने घर में मान्य फल, दुग्ध, कन्द या व्रत-आहार लें; इस रूप में अन्न-दाल, प्याज, लहसुन, मांस और मद्य वर्जित रखें।",
    },
    sankalpa: {
      en: "“From Magha Shukla Pratipada through Navami, I undertake this Gupt Navratri worship of the Divine Mother. I will keep my chosen fasting rule and daily worship, and complete the vow in Dashami according to my family tradition.”",
      hi: "“माघ शुक्ल प्रतिपदा से नवमी तक मैं जगदम्बा की यह गुप्त नवरात्रि उपासना करता/करती हूँ। अपने चुने आहार-नियम और दैनिक पूजा का पालन कर दशमी में कुल-परम्परा अनुसार संकल्प पूर्ण करूँगा/करूँगी।”",
    },
    puja: {
      en: "Use this simple household sequence each day. If your family has an established, more detailed Devi-puja method, keep that method instead of combining procedures.",
      hi: "प्रतिदिन यह सरल गृह-विधि करें। परिवार में देवी-पूजन की स्थापित विस्तृत विधि हो तो विधियों को मिलाने के बजाय उसी का पालन करें।",
    },
    pujaMaterials: {
      en: "A clean Devi image or established kalasha, lamp and oil/ghee, incense if used at home, water, kumkum or sandal, flowers, fruit or family naivedya, aarti lamp, and the prayer or text chosen for daily recitation.",
      hi: "स्वच्छ देवी-चित्र या स्थापित कलश, दीप और तेल/घी, घर में प्रचलित हो तो धूप, जल, कुमकुम या चन्दन, फूल, फल या कुलानुसार नैवेद्य, आरती का दीप, और दैनिक पाठ के लिए चुनी प्रार्थना या ग्रन्थ।",
    },
    pujaPanchopachara: [
      { en: "Remember Ganesha, then meditate on and invite the Divine Mother to accept the worship.", hi: "गणेश-स्मरण करें, फिर जगदम्बा का ध्यान और आवाहन कर पूजा स्वीकार करने की प्रार्थना करें।" },
      { en: "Offer fragrance: sandal or kumkum according to your household custom.", hi: "गन्ध अर्पित करें—कुल-रीति अनुसार चन्दन या कुमकुम।" },
      { en: "Offer flowers with the Devi name or familiar prayer used in your home.", hi: "घर में प्रचलित देवी-नाम या परिचित प्रार्थना के साथ पुष्प अर्पित करें।" },
      { en: "Offer incense, then show the lit lamp.", hi: "धूप अर्पित करें, फिर प्रज्वलित दीप दिखाएँ।" },
      { en: "Offer fruit or the family's sattvic naivedya and water.", hi: "फल या कुलानुसार सात्त्विक नैवेद्य और जल अर्पित करें।" },
    ],
    pujaCompletion: {
      en: "Recite the chosen Devi prayer, stotra or Durga Saptashati portion; perform aarti, ask forgiveness for mistakes, bow, and distribute prasad. Continue the same promised practice each day.",
      hi: "चुनी देवी-प्रार्थना, स्तोत्र या दुर्गा सप्तशती के अंश का पाठ करें; आरती, भूलों के लिए क्षमा-प्रार्थना और प्रणाम कर प्रसाद बाँटें। प्रतिदिन उसी संकल्पित साधना को जारी रखें।",
    },
    paran: {
      en: "For the complete nine-day fast, keep the vow through Navami and perform parana in Dashami at the local date and time shown above. Complete the final Devi worship first, then begin with prasad and the food permitted by your sankalpa.",
      hi: "पूर्ण नौ-दिवसीय व्रत में नवमी तक संकल्प रखें और ऊपर दिखाए स्थानीय दिन व समय पर दशमी में पारण करें। पहले अंतिम देवी-पूजा पूर्ण करें, फिर प्रसाद और संकल्प में मान्य आहार से पारण करें।",
    },
    udyapan: {
      en: "For this annual nine-day observance, conclude the kalasha and final offerings according to family practice after the promised worship is complete. If you undertook a counted or repeated formal vow, conclude it by the same priest, teacher or family procedure under which it began.",
      hi: "इस वार्षिक नौ-दिवसीय पर्व में संकल्पित पूजा पूर्ण होने पर कुल-रीति से कलश और अंतिम अर्पण का समापन करें। गिनती वाला या बार-बार करने का औपचारिक संकल्प लिया हो तो जिस पुरोहित, गुरु या कुल-विधि से आरम्भ किया था उसी से उद्यापन करें।",
    },
  },
  guptNavratriAshadha: {
    verdict: {
      en: "Ashadha Gupt Navratri begins on Ashadha Shukla Pratipada. For a complete nine-day vow, begin during the Ghatasthapana time shown for your city, continue the chosen fast and daily Devi worship through Navami, and perform parana in Dashami at the calculated time shown above.",
      hi: "आषाढ़ गुप्त नवरात्रि आषाढ़ शुक्ल प्रतिपदा से आरम्भ होती है। पूर्ण नौ-दिवसीय संकल्प में अपने शहर के लिए दिखाए घटस्थापना समय में आरम्भ करें, नवमी तक चुना हुआ व्रत और दैनिक देवी-पूजन जारी रखें, और ऊपर निकाले गए समय पर दशमी में पारण करें।",
    },
    meaning: {
      en: "This monsoon Navratri is commonly kept as a quieter, more personal period of Devi worship. The public household path below centres on sincere daily worship; any specialised mantra or rite personally received from a guru should be followed exactly as taught.",
      hi: "यह वर्षाकालीन नवरात्रि प्रायः देवी की शांत और निजी उपासना के रूप में रखी जाती है। नीचे दी गृह-विधि सरल दैनिक पूजन पर केन्द्रित है; गुरु से व्यक्तिगत रूप से मिला कोई विशेष मन्त्र या अनुष्ठान उसी सिखाई विधि से करें।",
    },
    vidhi: [
      { en: "Before Day 1, decide your exact sankalpa: a complete fast, one meal, phalahar, or daily worship without a food vow. Keep that same chosen rule through Navami.", hi: "पहले दिन से पूर्व अपना स्पष्ट संकल्प चुनें—पूर्ण उपवास, एक समय भोजन, फलाहार, या बिना आहार-व्रत के दैनिक पूजा। नवमी तक उसी चुने नियम का पालन करें।" },
      { en: "On Pratipada, bathe, wear clean clothes and prepare a clean, dry worship place. Establish the kalasha during the city-specific Ghatasthapana window if this is part of your family practice; otherwise begin before a clean Devi image with a lamp.", hi: "प्रतिपदा को स्नान, स्वच्छ वस्त्र और साफ-सूखा पूजा-स्थान तैयार करें। कुल में कलश-स्थापना हो तो अपने शहर के घटस्थापना समय में कलश स्थापित करें; अन्यथा स्वच्छ देवी-चित्र और दीप के सामने पूजा आरम्भ करें।" },
      { en: "State the nine-day sankalpa, then offer the simple household worship listed below. Read or recite the familiar Devi prayer, stotra or Durga Saptashati portion chosen in the sankalpa.", hi: "नौ-दिवसीय संकल्प बोलें, फिर नीचे दी सरल गृह-पूजा करें। संकल्प में चुनी परिचित देवी-प्रार्थना, स्तोत्र या दुर्गा सप्तशती के अंश का पाठ करें।" },
      { en: "Repeat the lamp, offerings and chosen reading each day through Navami. Observe Ashtami or Navami feeding, Kumari Puja or homa only where it is already part of your family or temple practice.", hi: "नवमी तक प्रतिदिन दीप, अर्पण और चुना पाठ दोहराएँ। अष्टमी या नवमी का भोजन, कुमारी-पूजन या होम वहीं करें जहाँ वह आपकी कुल या मंदिर परम्परा में पहले से हो।" },
      { en: "After Navami ends, complete the promised worship and reading, then perform Dashami parana at the city-specific time shown above.", hi: "नवमी समाप्त होने पर संकल्पित पूजा और पाठ पूर्ण करें, फिर ऊपर दिखाए अपने शहर के समय पर दशमी पारण करें।" },
    ],
    diet: {
      en: "Keep the food rule named in your sankalpa. A complete fast and phalahar are different vows: do not change one into the other silently. Where phalahar is chosen, use only the fruit, dairy, roots or vrat foods accepted in your home; avoid grains, pulses, onion, garlic, meat and alcohol in that form.",
      hi: "संकल्प में लिया आहार-नियम ही मानें। पूर्ण उपवास और फलाहार अलग व्रत हैं; एक को बिना बताए दूसरे में न बदलें। फलाहार लिया हो तो अपने घर में मान्य फल, दुग्ध, कन्द या व्रत-आहार लें; इस रूप में अन्न-दाल, प्याज, लहसुन, मांस और मद्य वर्जित रखें।",
    },
    sankalpa: {
      en: "“From Ashadha Shukla Pratipada through Navami, I undertake this Gupt Navratri worship of the Divine Mother. I will keep my chosen fasting rule and daily worship, and complete the vow in Dashami according to my family tradition.”",
      hi: "“आषाढ़ शुक्ल प्रतिपदा से नवमी तक मैं जगदम्बा की यह गुप्त नवरात्रि उपासना करता/करती हूँ। अपने चुने आहार-नियम और दैनिक पूजा का पालन कर दशमी में कुल-परम्परा अनुसार संकल्प पूर्ण करूँगा/करूँगी।”",
    },
    puja: {
      en: "Use this simple household sequence each day. If your family has an established, more detailed Devi-puja method, keep that method instead of combining procedures.",
      hi: "प्रतिदिन यह सरल गृह-विधि करें। परिवार में देवी-पूजन की स्थापित विस्तृत विधि हो तो विधियों को मिलाने के बजाय उसी का पालन करें।",
    },
    pujaMaterials: {
      en: "A clean Devi image or established kalasha, lamp and oil/ghee, incense if used at home, water, kumkum or sandal, flowers, fruit or family naivedya, aarti lamp, and the prayer or text chosen for daily recitation.",
      hi: "स्वच्छ देवी-चित्र या स्थापित कलश, दीप और तेल/घी, घर में प्रचलित हो तो धूप, जल, कुमकुम या चन्दन, फूल, फल या कुलानुसार नैवेद्य, आरती का दीप, और दैनिक पाठ के लिए चुनी प्रार्थना या ग्रन्थ।",
    },
    pujaPanchopachara: [
      { en: "Remember Ganesha, then meditate on and invite the Divine Mother to accept the worship.", hi: "गणेश-स्मरण करें, फिर जगदम्बा का ध्यान और आवाहन कर पूजा स्वीकार करने की प्रार्थना करें।" },
      { en: "Offer fragrance: sandal or kumkum according to your household custom.", hi: "गन्ध अर्पित करें—कुल-रीति अनुसार चन्दन या कुमकुम।" },
      { en: "Offer flowers with the Devi name or familiar prayer used in your home.", hi: "घर में प्रचलित देवी-नाम या परिचित प्रार्थना के साथ पुष्प अर्पित करें।" },
      { en: "Offer incense, then show the lit lamp.", hi: "धूप अर्पित करें, फिर प्रज्वलित दीप दिखाएँ।" },
      { en: "Offer fruit or the family's sattvic naivedya and water.", hi: "फल या कुलानुसार सात्त्विक नैवेद्य और जल अर्पित करें।" },
    ],
    pujaCompletion: {
      en: "Recite the chosen Devi prayer, stotra or Durga Saptashati portion; perform aarti, ask forgiveness for mistakes, bow, and distribute prasad. Continue the same promised practice each day.",
      hi: "चुनी देवी-प्रार्थना, स्तोत्र या दुर्गा सप्तशती के अंश का पाठ करें; आरती, भूलों के लिए क्षमा-प्रार्थना और प्रणाम कर प्रसाद बाँटें। प्रतिदिन उसी संकल्पित साधना को जारी रखें।",
    },
    paran: {
      en: "For the complete nine-day fast, keep the vow through Navami and perform parana in Dashami at the local date and time shown above. Complete the final Devi worship first, then begin with prasad and the food permitted by your sankalpa.",
      hi: "पूर्ण नौ-दिवसीय व्रत में नवमी तक संकल्प रखें और ऊपर दिखाए स्थानीय दिन व समय पर दशमी में पारण करें। पहले अंतिम देवी-पूजा पूर्ण करें, फिर प्रसाद और संकल्प में मान्य आहार से पारण करें।",
    },
    udyapan: {
      en: "For this annual nine-day observance, conclude the kalasha and final offerings according to family practice after the promised worship is complete. If you undertook a counted or repeated formal vow, conclude it by the same priest, teacher or family procedure under which it began.",
      hi: "इस वार्षिक नौ-दिवसीय पर्व में संकल्पित पूजा पूर्ण होने पर कुल-रीति से कलश और अंतिम अर्पण का समापन करें। गिनती वाला या बार-बार करने का औपचारिक संकल्प लिया हो तो जिस पुरोहित, गुरु या कुल-विधि से आरम्भ किया था उसी से उद्यापन करें।",
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
      en: "There is no single pan-Indian year count. If you made a numbered vow, conclude it with guidance from a family elder or priest using the count received with your vow.",
      hi: "पूरे भारत में एक ही वर्ष-संख्या नहीं है। गिनती का संकल्प हो तो कुल की बड़ी महिला या पुरोहित के मार्गदर्शन में पूर्ण करें; 11 या 13 वर्ष का नियम सब पर लागू न मानें।",
    },
  },
  ahoiAshtami: {
    verdict: {
      en: "A North-Indian fast for the wellbeing of all children, kept from dawn until the stars are visible; households with a moonrise tradition complete it after Chandra darshan.",
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
      en: "The traditional Hartalika fast is nirjala—without food or water. Follow the dietary and purity rules of your family or temple tradition.",
      hi: "परम्परागत हरतालिका व्रत निर्जला—बिना अन्न और जल—होता है। अपनी कुल या मंदिर परम्परा के आहार और शुद्धि नियम मानें।",
    },
    sankalpa: {
      en: "“I observe Hartalika Teej, remembering Parvati's tapas and worshipping Uma-Maheshwara. May Shiva and Parvati bless my household with steadfast devotion and a righteous married life.”",
      hi: "“मैं पार्वती के तप का स्मरण करते हुए हरतालिका तीज का व्रत रखती/रखता हूँ और उमा-महेश्वर की पूजा करती/करता हूँ। शिव-पार्वती मेरे घर में दृढ़ भक्ति और धर्ममय दाम्पत्य का आशीर्वाद दें।”",
    },
    puja: {
      en: "Choose one complete path below. Panchopachara is the recommended household method: it is a full, orderly puja with five principal offerings. Use Shodashopachara when your family follows the expanded sixteen-offering method. The names of the offerings are given so you can follow the order; use your family's mantras, or make each offering with a simple respectful prayer.",
      hi: "नीचे दी गई दोनों विधियों में से एक पूर्ण विधि चुनें। घर में पंचोपचार अनुशंसित है—यह पाँच मुख्य उपचारों वाली सुव्यवस्थित पूर्ण पूजा है। यदि आपके परिवार में सोलह उपचारों की विस्तृत विधि है तो षोडशोपचार करें। क्रम समझने के लिए उपचारों के नाम दिए हैं; प्रत्येक उपचार में कुल-परम्परा का मंत्र बोलें, या सरल श्रद्धापूर्वक प्रार्थना करें।",
    },
    pujaMaterials: {
      en: "A clean chowki and cloth; clay or sand Shiva–Parvati forms (or the household images you normally worship); Ganesha image; two small bowls and a spoon for clean water; sandal paste; turmeric and kumkum for Parvati according to custom; flowers; bilva leaves for Shiva; incense; a safe lamp; fruit or a sweet for naivedya; and the Hartalika katha and aarti. For the expanded path, also keep a symbolic cloth/thread or ornaments, achamaniya water and betel leaf/nut if your family offers it.",
      hi: "स्वच्छ चौकी और वस्त्र; मिट्टी या बालू के शिव–पार्वती रूप (या घर में नित्य पूजित चित्र/मूर्ति); गणेश-चित्र; स्वच्छ जल के लिए दो छोटी कटोरियाँ और चम्मच; चन्दन; कुलानुसार पार्वती के लिए हल्दी-कुमकुम; फूल; शिव के लिए बिल्व-पत्र; धूप; सुरक्षित दीप; नैवेद्य के लिए फल या मिष्ठान्न; हरतालिका कथा और आरती। विस्तृत विधि के लिए कुलानुसार प्रतीकात्मक वस्त्र/सूत्र या आभूषण, आचमनीय जल और पान-सुपारी भी रखें।",
    },
    pujaPanchopachara: [
      { en: "Prepare the altar. Spread a clean cloth on the chowki, place Ganesha and the Shiva–Parvati forms, arrange the offerings, and light the lamp safely.", hi: "पूजा-स्थान तैयार करें। चौकी पर स्वच्छ वस्त्र बिछाकर गणेश और शिव–पार्वती के रूप स्थापित करें, सामग्री क्रम से रखें और सुरक्षित रूप से दीप जलाएँ।" },
      { en: "Settle and take sankalpa. Wash your hands, sit facing the altar, remember your family deity and state that you are performing Hartalika worship of Uma–Maheshwara.", hi: "शुद्ध होकर संकल्प लें। हाथ धोकर पूजा-स्थान के सामने बैठें, कुलदेवता का स्मरण करें और उमा–महेश्वर की हरतालिका पूजा करने का संकल्प बोलें।" },
      { en: "Worship Ganesha first. Offer a little sandal, a flower and naivedya, and pray for the puja to be completed without obstacle.", hi: "पहले गणेश-पूजा करें। थोड़ा चन्दन, फूल और नैवेद्य अर्पित करके पूजा निर्विघ्न पूर्ण होने की प्रार्थना करें।" },
      { en: "Invite and honour Uma–Maheshwara. Join your palms, meditate on Shiva and Parvati together, and respectfully invite their presence in the forms before you.", hi: "उमा–महेश्वर का ध्यान और आवाहन करें। हाथ जोड़कर शिव-पार्वती का साथ-साथ ध्यान करें और सामने स्थापित रूपों में उनकी उपस्थिति का आदरपूर्वक आवाहन करें।" },
      { en: "Gandha (fragrance): offer sandal paste to Shiva; offer sandal and, according to family custom, turmeric or kumkum to Parvati.", hi: "गन्ध: शिव को चन्दन अर्पित करें; पार्वती को चन्दन और कुल-परम्परानुसार हल्दी या कुमकुम अर्पित करें।" },
      { en: "Pushpa (flowers): offer flowers to Shiva and Parvati. Offer clean, unbroken bilva leaves specifically to Shiva; do not place bilva on Parvati unless that is your established family custom.", hi: "पुष्प: शिव और पार्वती को फूल अर्पित करें। स्वच्छ, अखण्ड बिल्व-पत्र विशेष रूप से शिव को चढ़ाएँ; कुल में स्पष्ट परम्परा न हो तो पार्वती को बिल्व न चढ़ाएँ।" },
      { en: "Dhupa (incense): circle the incense gently before Uma–Maheshwara and place it in a safe holder.", hi: "धूप: उमा–महेश्वर के सामने धूप को धीरे से घुमाकर सुरक्षित धूपदान में रखें।" },
      { en: "Dipa (lamp): show the lit lamp before the deities. Keep flame, clothing and clay or sand forms safely separated.", hi: "दीप: देवताओं के सामने जलता दीप दिखाएँ। अग्नि, वस्त्र और मिट्टी या बालू के रूपों के बीच सुरक्षित दूरी रखें।" },
      { en: "Naivedya (food offering): offer fruit or a sweet with drinking water. Pause briefly, then treat it as prasad; the person observing nirjala does not consume it until the family's completion time.", hi: "नैवेद्य: फल या मिष्ठान्न और पीने का जल अर्पित करें। थोड़ी देर बाद इसे प्रसाद मानें; निर्जला व्रती कुल-परम्परा के समापन-समय से पहले इसे ग्रहण न करे।" },
    ],
    pujaShodashopachara: [
      { en: "Dhyana — meditate on Shiva and Parvati together before the forms.", hi: "ध्यान — स्थापित रूपों के सामने शिव और पार्वती का साथ-साथ ध्यान करें।" },
      { en: "Sankalpa — state your name and intention to perform Hartalika worship of Uma–Maheshwara.", hi: "संकल्प — अपना नाम और उमा–महेश्वर की हरतालिका पूजा का उद्देश्य बोलें।" },
      { en: "Avahana — join your palms and respectfully invite Shiva and Parvati into the worship.", hi: "आवाहन — हाथ जोड़कर शिव और पार्वती का पूजा में आदरपूर्वक आवाहन करें।" },
      { en: "Asana — offer a flower as a symbolic seat.", hi: "आसन — प्रतीकात्मक आसन के रूप में फूल अर्पित करें।" },
      { en: "Padya — offer a spoonful of water at the base of the forms as water for the feet.", hi: "पाद्य — चरण धोने के भाव से रूपों के आधार के पास एक चम्मच जल अर्पित करें।" },
      { en: "Arghya — offer a little clean water as a respectful welcome.", hi: "अर्घ्य — सम्मानपूर्वक स्वागत के लिए थोड़ा स्वच्छ जल अर्पित करें।" },
      { en: "Achamaniya — place a small spoonful of clean water before the deities as water for sipping.", hi: "आचमनीय — मुख-शुद्धि के भाव से देवताओं के सामने एक चम्मच स्वच्छ जल रखें।" },
      { en: "Snana — offer a few drops of clean water for a symbolic bath. Pour water only if the clay or sand forms and altar can receive it safely.", hi: "स्नान — प्रतीकात्मक स्नान के लिए स्वच्छ जल की कुछ बूँदें अर्पित करें। जल तभी चढ़ाएँ जब मिट्टी/बालू के रूप और पूजा-स्थान सुरक्षित रूप से उसे सह सकें।" },
      { en: "Vastra — offer a small clean cloth or symbolic thread as clothing.", hi: "वस्त्र — वस्त्र के रूप में छोटा स्वच्छ कपड़ा या प्रतीकात्मक सूत्र अर्पित करें।" },
      { en: "Yajnopavita and alankara — offer sacred thread to Shiva and ornaments or saubhagya items to Parvati according to family custom.", hi: "यज्ञोपवीत और अलंकार — कुल-परम्परानुसार शिव को यज्ञोपवीत और पार्वती को आभूषण या सौभाग्य-सामग्री अर्पित करें।" },
      { en: "Gandha — offer sandal to Shiva; offer sandal and the customary turmeric or kumkum to Parvati.", hi: "गन्ध — शिव को चन्दन; पार्वती को चन्दन और कुलानुसार हल्दी या कुमकुम अर्पित करें।" },
      { en: "Pushpa — offer flowers to both and clean, unbroken bilva leaves to Shiva.", hi: "पुष्प — दोनों को फूल और शिव को स्वच्छ, अखण्ड बिल्व-पत्र अर्पित करें।" },
      { en: "Dhupa — offer incense and place it safely.", hi: "धूप — धूप दिखाकर सुरक्षित धूपदान में रखें।" },
      { en: "Dipa — show the lit lamp before Uma–Maheshwara.", hi: "दीप — उमा–महेश्वर के सामने जलता दीप दिखाएँ।" },
      { en: "Naivedya — offer fruit or a sweet and drinking water; receive it later as prasad under the fast's completion rule.", hi: "नैवेद्य — फल या मिष्ठान्न और पीने का जल अर्पित करें; व्रत-समापन के नियम पर इसे प्रसाद के रूप में ग्रहण करें।" },
      { en: "Tambula — offer betel leaf and nut where this is part of your family practice; otherwise offer a final flower with gratitude.", hi: "ताम्बूल — कुल-परम्परा में हो तो पान-सुपारी अर्पित करें; अन्यथा कृतज्ञता से अन्तिम फूल अर्पित करें।" },
    ],
    pujaCompletion: {
      en: "After either path, read or hear the Hartalika katha, pray to Shiva and Parvati, perform aarti, offer namaskara and ask forgiveness for mistakes. Continue bhajan or the night vigil where your family observes it. Keep the forms respectfully until the family's next-morning conclusion, then return plain clay or sand in an eco-safe way permitted where you live; do not put puja material into drains or public water.",
      hi: "किसी भी विधि के बाद हरतालिका कथा पढ़ें या सुनें, शिव-पार्वती से प्रार्थना करें, आरती और नमस्कार करके हुई भूलों के लिए क्षमा माँगें। कुल-परम्परा में हो तो भजन या रात्रि-जागरण करें। अगली सुबह की कुल-विधि तक रूपों को आदर से रखें; फिर स्थानीय नियमों के अनुसार सादी मिट्टी या बालू का पर्यावरण-सुरक्षित विसर्जन करें—पूजा-सामग्री नाली या सार्वजनिक जल में न डालें।",
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
      en: "When to break the fast depends on your tradition. Smarta observers wait until the required Ashtami (eighth lunar day) and Rohini (Krishna's birth star) conditions are complete. The observance may include wait until the next morning's worship. In common ISKCON practice, non-grain prasad may be taken after the midnight celebration, while grains remain restricted until the temple or Panchang paran time. Use the same tradition for both the Janmashtami date and paran.",
      hi: "व्रत कब खोलना है, यह आपकी परम्परा पर निर्भर है। स्मार्त परम्परा में अष्टमी तिथि (आठवाँ चन्द्र दिवस) और रोहिणी नक्षत्र (कृष्ण का जन्म नक्षत्र) के आवश्यक नियम पूरे होने के बाद पारण होता है। इस अनुष्ठान में अगली सुबह की पूजा तक प्रतीक्षा करते हैं। सामान्य इस्कॉन परम्परा में मध्यरात्रि उत्सव के बाद अन्न-रहित प्रसाद लिया जा सकता है, पर धान्य मंदिर या पंचांग के पारण समय तक वर्जित रहता है। जन्माष्टमी की तिथि और पारण के लिए एक ही परम्परा मानें।",
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
      en: "This is the monthly Shukla Shashti vrata—a one-day observance for Shri Murugan. Keep today's fast and worship rule as followed by your family or temple.",
      hi: "यह मासिक शुक्ल षष्ठी व्रत है—श्री मुरुगन का एक-दिवसीय अनुष्ठान। आज अपने परिवार या मंदिर में प्रचलित उपवास और पूजा-नियम रखें।",
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
      { en: "Pray morning and evening using the Ayyappa prayer, name or bhajan taught by the family or temple group; use the count taught by the family or temple group.", hi: "प्रातः और सायं परिवार या मंदिर-समूह से मिला अय्यप्पा नाम, प्रार्थना या भजन करें; कोई अनिवार्य संख्या न मानें।" },
      { en: "Prepare the pilgrimage, Kettunirakkal and Irumudi with the Guru Swami or temple group. Irumudi is prepared as a sacred group rite under that guidance.", hi: "यात्रा, केट्टुनिरक्कल और इरुमुडी की तैयारी गुरु स्वामी या मंदिर-समूह के साथ करें। इरुमुडी अनुमान से स्वयं करने की पैकिंग-विधि नहीं है।" },
    ],
    diet: {
      en: "The official core is vegetarian food, sobriety and simple living. Meal times, onion/garlic rules and other ingredient restrictions vary; follow the Guru Swami, temple or family group according to the Guru Swami, temple or family group.",
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

for (const [key, supplement] of Object.entries(MAJOR_FESTIVAL_SUPPLEMENTS)) {
  const existing = VRAT_VIDHI[key];
  if (!existing) continue;
  Object.assign(existing, {
    meaning: supplement.meaning,
    stories: supplement.stories,
    regional: supplement.regional,
    safety: supplement.safety,
    vidhi: [...existing.vidhi, ...supplement.extraVidhi],
  });
}

for (const [key, enrichment] of Object.entries(VRAT_GUIDE_ENRICHMENTS)) {
  const existing = VRAT_VIDHI[key];
  if (!existing) continue;
  const { extraVidhi = [], ...fields } = enrichment;
  Object.assign(existing, fields, { vidhi: [...existing.vidhi, ...extraVidhi] });
}

// Authoritative regional kathas — merged last so every guide gets detailed,
// geography-labelled narratives suitable for reading or hearing during worship.
for (const [key, stories] of Object.entries(REGIONAL_KATHAS)) {
  const existing = VRAT_VIDHI[key];
  if (!existing) continue;
  existing.stories = stories;
}
