/* Muhurat / Daily UI catalogs (SPLIT-UI-03g-data). */

const MUH_CATS = [
  { key: "wedding", hi: "विवाह", en: "Wedding" },
  { key: "engagement", hi: "सगाई", en: "Engagement" },
  { key: "housewarming", hi: "गृह प्रवेश", en: "Housewarming" },
  { key: "bhoomi", hi: "भूमि पूजन", en: "Bhoomi Puja" },
  { key: "construction", hi: "निर्माण आरम्भ", en: "Construction" },
  { key: "business", hi: "व्यापार आरम्भ", en: "Business" },
  { key: "travel", hi: "यात्रा", en: "Travel" },
  { key: "document", hi: "दस्तावेज़", en: "Documents" },
  { key: "vehicle", hi: "वाहन", en: "Vehicle" },
  { key: "property", hi: "सम्पत्ति", en: "Property" },
  { key: "mundan", hi: "मुंडन", en: "Mundan" },
  { key: "naming", hi: "नामकरण", en: "Naming" },
  { key: "annaprashana", hi: "अन्नप्राशन", en: "Annaprashana" },
  { key: "vidyarambha", hi: "विद्यारम्भ", en: "Vidyarambha" },
  { key: "upanayana", hi: "उपनयन", en: "Upanayana" },
];
const PANCHAKA_NAME = { shubha: { en: "Panchaka Rahita", hi: "पञ्चक रहित" }, mrityu: { en: "Mrityu Panchaka", hi: "मृत्यु पञ्चक" }, agni: { en: "Agni Panchaka", hi: "अग्नि पञ्चक" }, raja: { en: "Raja Panchaka", hi: "राज पञ्चक" }, chora: { en: "Chora Panchaka", hi: "चोर पञ्चक" }, roga: { en: "Roga Panchaka", hi: "रोग पञ्चक" } };
const PANCHAKA_SHORT = { shubha: { en: "Shubha", hi: "शुभ" }, mrityu: { en: "Mrityu", hi: "मृत्यु" }, agni: { en: "Agni", hi: "अग्नि" }, raja: { en: "Raja", hi: "राज" }, chora: { en: "Chora", hi: "चोर" }, roga: { en: "Roga", hi: "रोग" } };
const PANCHAKA_GLOSS = { shubha: { en: "auspicious — free of blemish", hi: "शुभ — दोषरहित" }, mrityu: { en: "avoid — risk to life", hi: "टालें — प्राण जोखिम" }, agni: { en: "avoid — fire risk", hi: "टालें — अग्नि भय" }, raja: { en: "caution — authority/government", hi: "सावधानी — सत्ता" }, chora: { en: "avoid — theft risk", hi: "टालें — चोरी भय" }, roga: { en: "avoid — illness risk", hi: "टालें — रोग भय" } };

const EVENTS = [
  { key: "purchase", en: "New purchase", hi: "नई खरीद", good: ["labh", "amrit", "shubh"] },
  { key: "venture", en: "New venture / business", hi: "नया व्यवसाय", good: ["labh", "amrit", "shubh"] },
  { key: "puja", en: "Puja / ritual", hi: "पूजा / अनुष्ठान", good: ["amrit", "shubh", "labh"] },
  { key: "travel", en: "Travel", hi: "यात्रा", good: ["char", "labh", "amrit", "shubh"] },
  { key: "housewarming", en: "Housewarming", hi: "गृह प्रवेश", good: ["amrit", "shubh", "labh"] },
  { key: "wedding", en: "Wedding-related", hi: "विवाह संबंधी", good: ["amrit", "shubh", "labh"] },
];

const SAMSKARA_GUIDANCE = {
  wedding: {
    en: "Marriage Muhurat screens for Vivah nakshatra, clean tithi, Devshayana/Kharmas/Tara Asta blocks and Panchaka-Rahita time windows. Final family matching remains separate.",
    hi: "विवाह मुहूर्त विवाह नक्षत्र, शुद्ध तिथि, देवशयन/खरमास/तारा-अस्त निषेध और पञ्चक-रहित समय देखता है। अंतिम कुल/कुण्डली मिलान अलग है।",
  },
  engagement: {
    en: "Engagement/Ring ceremony uses a Vivah-like but separate screen: clean tithi and marriage nakshatra, with Sunday/Tuesday and Tara Asta periods avoided.",
    hi: "सगाई/अंगूठी रस्म विवाह-जैसी पर अलग छँटाई रखती है: शुद्ध तिथि और विवाह नक्षत्र, रविवार/मंगलवार व तारा-अस्त काल वर्जित।",
  },
  housewarming: {
    en: "Griha Pravesh is stricter than a generic auspicious day: allowed lunar months, clean tithi, house-entry nakshatra and Panchaka-Rahita windows are all checked.",
    hi: "गृह प्रवेश सामान्य शुभ दिन से सख्त है: अनुमत चान्द्र मास, शुद्ध तिथि, गृह-प्रवेश नक्षत्र और पञ्चक-रहित समय सब देखे जाते हैं।",
  },
  bhoomi: {
    en: "Bhoomi Puja/Shilanyas prefers stable construction nakshatras and a clean work-start tithi. Use the site/registrar city for the selected place.",
    hi: "भूमि पूजन/शिलान्यास में स्थिर निर्माण नक्षत्र और शुद्ध कार्यारम्भ तिथि प्रधान हैं। चुना शहर वही रखें जहाँ पूजा/आरम्भ होना है।",
  },
  construction: {
    en: "Construction start is distinct from Bhoomi Puja: it keeps the construction nakshatra set but uses a stricter work-start filter and avoids Tuesday/Saturday.",
    hi: "निर्माण आरम्भ भूमि पूजन से अलग है: निर्माण नक्षत्र वही हैं, पर कार्यारम्भ छँटाई सख्त है और मंगलवार/शनिवार टाले जाते हैं।",
  },
  business: {
    en: "Business opening uses prosperous nakshatras, growth tithis and Labh/Amrit/Shubh windows. Festival bookkeeping such as Diwali remains a separate observance.",
    hi: "व्यापार आरम्भ में लाभदायक नक्षत्र, वृद्धि तिथि और लाभ/अमृत/शुभ समय चुने जाते हैं। दीपावली बही-खाता अलग पर्व परम्परा है।",
  },
  travel: {
    en: "Travel uses movable/supportive nakshatras and Char-first Choghadiya windows, while avoiding Rahu, Gulika and Yamaganda for the departure.",
    hi: "यात्रा में चल/सहायक नक्षत्र और चर-प्रधान चौघड़िया समय लिए जाते हैं, तथा प्रस्थान में राहु, गुलिक और यमगण्ड टाले जाते हैं।",
  },
  document: {
    en: "Document signing/registration is not a generic purchase Muhurat: it favors Mercury/Jupiter days and clean Labh/Amrit/Shubh windows for paperwork.",
    hi: "दस्तावेज़ हस्ताक्षर/पंजीकरण सामान्य खरीद मुहूर्त नहीं है: इसमें कागज़ी कार्य हेतु बुध/गुरु प्रधान दिन और लाभ/अमृत/शुभ समय चुने जाते हैं।",
  },
  mundan: {
    en: "First tonsure. Ganak screens the civil date by lunar month, tithi, nakshatra and weekday; the child's age, family deity observance and whether the mother is pregnant remain family/acharya decisions.",
    hi: "प्रथम केश-उत्सर्जन। गणक चान्द्र मास, तिथि, नक्षत्र और वार से दिन छाँटता है; शिशु की आयु, कुलदेवता की परम्परा और माता की गर्भावस्था जैसे निर्णय परिवार/आचार्य के हैं।",
  },
  naming: {
    en: "Namakaran. The date finder is separate from the birth-nakshatra syllable used to choose a name. Many families perform it on the 10th, 11th or 12th day; local custom takes priority after health needs.",
    hi: "नामकरण। दिन का मुहूर्त जन्म-नक्षत्र से मिलने वाले नामाक्षर से अलग है। अनेक परिवार 10वें, 11वें या 12वें दिन करते हैं; स्वास्थ्य के बाद स्थानीय कुलाचार को प्राथमिकता दें।",
  },
  annaprashana: {
    en: "First solid food. The finder screens Panchang quality only; the child's readiness and food safety come first. The customary month differs by family, region and sometimes the child's sex.",
    hi: "प्रथम अन्न। खोज केवल पंचांग-शुद्धि करती है; शिशु की तैयारी और भोजन-सुरक्षा पहले हैं। प्रचलित मास परिवार, क्षेत्र और कभी-कभी शिशु के लिंग के अनुसार बदलता है।",
  },
  vidyarambha: {
    en: "First formal learning or writing. Vijayadashami-based Vidyarambham in Kerala and parts of South India is a distinct observance and can override the generic weekday screen.",
    hi: "औपचारिक अक्षरारम्भ। केरल और दक्षिण भारत के कुछ भागों में विजयादशमी-आधारित विद्यारम्भम् अलग परम्परा है और सामान्य वार-छँटाई से ऊपर मानी जा सकती है।",
  },
  upanayana: {
    en: "Sacred-thread initiation. Ganak supplies a general Panchang shortlist, not a final rite date. Vedic shakha, age, family lineage, Guru and regional ritual calendar require an acharya's confirmation.",
    hi: "यज्ञोपवीत संस्कार। गणक सामान्य पंचांग-आधारित संक्षिप्त सूची देता है, अंतिम संस्कार-दिन नहीं। वेद-शाखा, आयु, गोत्र-कुलाचार, गुरु और क्षेत्रीय अनुष्ठान-पद्धति की पुष्टि आचार्य करें।",
  },
};

const MUHURAT_GUIDANCE = SAMSKARA_GUIDANCE;

const PURCHASE_ACTIONS = {
  property: {
    label: { en: "Property step", hi: "सम्पत्ति का चरण" },
    options: [
      { value: "purchase", en: "Purchase decision / booking", hi: "खरीद निर्णय / बुकिंग", note: { en: "Uses the property rule set; legal and financial due diligence remains separate.", hi: "सम्पत्ति नियम लागू होते हैं; कानूनी और वित्तीय जाँच अलग आवश्यक है।" } },
      { value: "deed", en: "Sale deed signing", hi: "विक्रय-पत्र हस्ताक्षर", note: { en: "Use the registrar’s city. Complete title, lender and lawyer checks before choosing a ritual time.", hi: "रजिस्ट्रार का शहर चुनें। मुहूर्त से पहले स्वामित्व, ऋणदाता और वकील की जाँच पूरी करें।" } },
      { value: "registration", en: "Registration", hi: "पंजीकरण", note: { en: "The displayed clean window is for the signing/registration act, not a promise about investment returns.", hi: "दिखाया समय हस्ताक्षर/पंजीकरण के लिए है—निवेश लाभ का वादा नहीं।" } },
    ],
  },
  vehicle: {
    label: { en: "Vehicle step", hi: "वाहन का चरण" },
    options: [
      { value: "purchase", en: "Purchase / payment", hi: "खरीद / भुगतान", note: { en: "Complete price, finance, insurance and safety checks independently.", hi: "मूल्य, ऋण, बीमा और सुरक्षा जाँच अलग से पूरी करें।" } },
      { value: "delivery", en: "Delivery / first drive", hi: "डिलीवरी / प्रथम यात्रा", note: { en: "Use the delivery city. The clean window is for handover or first departure; road safety always comes first.", hi: "डिलीवरी का शहर चुनें। समय हस्तांतरण या प्रथम प्रस्थान हेतु है; सड़क सुरक्षा हमेशा पहले है।" } },
    ],
  },
};

// Ceremony-specific context is kept separate from the general date range. It
// explains the customary fit without silently pretending to perform a full
// natal-chart election; the engine's Panchang and lagna exclusions remain the
// same auditable rules shown with every result.
const SAMSKARA_INPUTS = {
  mundan: {
    secondary:"familyStage",
    secondaryLabel:{ en:"Family's chosen stage", hi:"परिवार द्वारा चुनी अवस्था" },
    options:[
      { value:"first", en:"First or third year", hi:"पहला या तीसरा वर्ष" },
      { value:"later", en:"Later family-tradition year", hi:"कुलाचार के अनुसार बाद का वर्ष" },
    ],
  },
  naming: {
    secondary:"birthNakshatra",
    secondaryLabel:{ en:"Birth nakshatra", hi:"जन्म नक्षत्र" },
    options:null,
  },
  annaprashana: {
    secondary:"childConvention",
    secondaryLabel:{ en:"Customary month convention", hi:"प्रचलित मास-परम्परा" },
    options:[
      { value:"boy", en:"Boy / even-month custom", hi:"बालक / सम-मास परम्परा" },
      { value:"girl", en:"Girl / odd-month custom", hi:"बालिका / विषम-मास परम्परा" },
      { value:"family", en:"Family or regional custom", hi:"कुल या क्षेत्रीय परम्परा" },
    ],
  },
  vidyarambha: {
    secondary:"learningTradition",
    secondaryLabel:{ en:"Learning tradition", hi:"अक्षरारम्भ परम्परा" },
    options:[
      { value:"general", en:"General Panchang election", hi:"सामान्य पंचांग मुहूर्त" },
      { value:"vijayadashami", en:"Vijayadashami Vidyarambham", hi:"विजयादशमी विद्यारम्भम्" },
    ],
  },
  upanayana: {
    secondary:"vedicTradition",
    secondaryLabel:{ en:"Vedic/family tradition", hi:"वेद-शाखा / कुलाचार" },
    options:[
      { value:"acharya", en:"Confirm with family acharya", hi:"कुलाचार्य से पुष्टि करनी है" },
      { value:"known", en:"Tradition already known", hi:"परम्परा पहले से निश्चित" },
    ],
  },
};

export { MUH_CATS, EVENTS, MUHURAT_GUIDANCE, SAMSKARA_GUIDANCE, SAMSKARA_INPUTS, PURCHASE_ACTIONS, PANCHAKA_NAME, PANCHAKA_SHORT, PANCHAKA_GLOSS };
