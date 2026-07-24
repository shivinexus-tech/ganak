// Milestone-specific guides for annual Skanda Sashti (3 routes) and Ayyappa Mandala (2 routes).
// Sources: plans/research/vrat-skanda-shashti.md, plans/research/vrat-ayyappa-mandala.md,
// Drik Panchang festival dates, Sabarimala official pilgrimage guidance (2026-07-22 review).

const p = (en, hi) => ({ en, hi });
const list = (items) => items.map(([en, hi]) => p(en, hi));
const guide = (x) => ({
  verdict: p(...x.verdict),
  meaning: p(...x.meaning),
  vidhi: list(x.vidhi),
  diet: p(...x.diet),
  sankalpa: p(...x.sankalpa),
  puja: p(...x.puja),
  stories: list(x.stories),
  regional: list(x.regional),
  paran: p(...x.paran),
  udyapan: p(...x.udyapan),
  ...(x.safety ? { safety: p(...x.safety) } : {}),
});

const skandaCommon = {
  stories: [
    ["Murugan receives the Vel from Devi and leads the devas against Surapadman.", "देवी से वेल प्राप्त कर मुरुगन देवताओं का नेतृत्व कर सुरपद्म के विरुद्ध युद्ध करते हैं।"],
    ["Kanda Sashti Kavacham is widely recited for protection and courage during the six days.", "छह दिनों में सुरक्षा और साहस के लिए कन्द षष्ठी कवचम् का व्यापक पाठ होता है।"],
  ],
  regional: [
    ["Tamil Nadu temples, especially Tiruchendur, enact Soorasamharam with great devotion.", "तमिलनाडु के मंदिर, विशेषकर तिरुचेंदूर, सूरसम्हारम् को अत्यंत श्रद्धा से मनाते हैं।"],
    ["Diaspora Murugan temples follow the same six-day rhythm with local timing announcements.", "प्रवासी मुरुगन मंदिर वही छह-दिवसीय क्रम स्थानीय समय-घोषणा के साथ रखते हैं।"],
  ],
  udyapan: ["Complete the six-day vow under family or temple guidance; no universal household udyapan is established.", "छह-दिवसीय व्रत परिवार या मंदिर के मार्गदर्शन में पूर्ण करें; सार्वभौमिक घरेलू उद्यापन स्थापित नहीं।"],
};

export const SEQUENCE_GUIDES = {
  skandaSashtiBegins: guide({
    verdict: ["Day 1 opens the annual Kanda Sashti — begin the six-day Murugan vrata today. This is not the monthly one-day Skanda Shashti; keep the fasting discipline your family or temple follows through day six.", "दिन 1 वार्षिक कन्द षष्ठी आरम्भ करता है — आज से छह-दिवसीय मुरुगन व्रत शुरू करें। यह मासिक एक-दिवसीय स्कन्द षष्ठी नहीं है; छठे दिन तक परिवार या मंदिर का उपवास-नियम निभाएँ।"],
    meaning: ["Aippasi Shukla Pratipada after Diwali marks the first day of the Tamil six-day fast. Households clean the altar, light the lamp and state the vow that culminates on Soorasamharam.", "दीपावली के बाद ऐप्पसी शुक्ल प्रतिपदा तमिल छह-दिवसीय व्रत का प्रथम दिन है। घर वेदी स्वच्छ करें, दीप जलाएँ और सूरसम्हारम् पर पूर्ण होने वाला संकल्प करें।"],
    vidhi: [["Bathe and prepare Murugan or Vel worship at home.", "स्नान करके घर में मुरुगन या वेल की पूजा-व्यवस्था करें।"], ["Light the lamp and state the six-day sankalpa.", "दीप जलाकर छह-दिवसीय संकल्प करें।"], ["Begin today's fast — fruit, milk, one meal or complete fast per your tradition.", "आज का उपवास आरम्भ करें — फल, दूध, एक बार भोजन या पूर्ण उपवास, परंपरा के अनुसार।"], ["Recite or listen to Kanda Sashti Kavacham or familiar Murugan hymns.", "कन्द षष्ठी कवचम् या परिचित मुरुगन स्तोत्र सुनें या पढ़ें।"]],
    diet: ["Day 1 commonly allows fruit, milk or one simple meal at night in many Tamil families; others keep a stricter fast from the outset. Follow your Guru, temple or family rule.", "दिन 1 में अनेक तमिल परिवारों में फल, दूध या रात्रि में एक सरल भोजन प्रचलित है; कुछ प्रारंभ से कठोर उपवास रखते हैं। गुरु, मंदिर या परिवार का नियम मानें।"],
    sankalpa: ["“For this annual Kanda Sashti I worship Shri Murugan and begin the six-day vrata today, seeking courage and divine grace.”", "“इस वार्षिक कन्द षष्ठी पर मैं श्री मुरुगन की पूजा करते हुए आज से छह-दिवसीय व्रत आरम्भ करता/करती हूँ, साहस और दैवीय कृपा की कामना करता/करती हूँ।”"],
    puja: ["Lamp, Vel or Murugan image, flowers or fruit, familiar prayer or Kavacham. Temple homam and abhishekam are optional temple-led observances.", "दीप, वेल या मुरुगन-प्रतिमा, फूल या फल, परिचित प्रार्थना या कवचम्। मंदिर होम और अभिषेक वैकल्पिक मंदिर-अनुष्ठान हैं।"],
    paran: ["The six-day fast continues; do not break the vow on day 1 unless your tradition specifies otherwise.", "छह-दिवसीय व्रत जारी रहे; दिन 1 पर व्रत न तोड़ें जब तक परंपरा अन्यथा न कहे।"],
    ...skandaCommon,
  }),
  skandaSashtiSoorasamharam: guide({
    verdict: ["Day 6 is Soorasamharam — the climax when Murugan defeats Surapadman. Keep today's fast with special devotion; temple enactments have their own published schedule.", "दिन 6 सूरसम्हारम् है — जब मुरुगन सुरपद्म पर विजय पाते हैं। आज विशेष श्रद्धा से व्रत रखें; मंदिर नाट्य की अपनी घोषित समय-सारिणी होती है।"],
    meaning: ["Shukla Shashti during Aippasi is the heart of the annual vow. Tiruchendur and many Murugan temples stage the battle narrative; households pray at the lamp and Vel even when they cannot attend.", "ऐप्पसी में शुक्ल षष्ठी वार्षिक व्रत का हृदय है। तिरुचेंदूर और अनेक मुरुगन मंदिर युद्ध-कथा प्रस्तुत करते हैं; घर भी दीप और वेल के सामने प्रार्थना करते हैं।"],
    vidhi: [["Maintain the strictest fast your tradition allows on day 6.", "दिन 6 पर परंपरा जितना कठोर उपवास अनुमति दे रखें।"], ["Attend temple Soorasamharam if possible; otherwise pray at home through the evening.", "सम्भव हो तो मंदिर सूरसम्हारम् में सम्मिलित हों; अन्यथा संध्या तक घर पर प्रार्थना करें।"], ["Offer flowers, lamp and familiar Murugan prayer.", "फूल, दीप और परिचित मुरुगन-प्रार्थना अर्पित करें।"], ["Stay mindful in crowds if visiting a major temple; follow marshals and keep children safe.", "बड़े मंदिर जाएँ तो भीड़ में सावधान रहें; मार्शल का पालन करें और बच्चों की सुरक्षा रखें।"]],
    diet: ["Many Tamil families keep a complete fast on day 6, allowing only milk or fruit where their practice permits. Follow the rule received from your temple.", "अनेक तमिल परिवार दिन 6 पूर्ण उपवास रखते हैं; जहाँ अनुमति हो वहाँ केवल दूध या फल। मंदिर से मिला नियम मानें।"],
    sankalpa: ["“On Soorasamharam day I worship Murugan who destroys evil and protects dharma.”", "“सूरसम्हारम् के दिन मैं बुराई का संहार और धर्म की रक्षा करने वाले मुरुगन की पूजा करता/करती हूँ।”"],
    puja: ["Evening worship centred on Murugan's victory; temple abhishekam and procession are led by priests. Home devotees offer lamp, flowers and Kavacham.", "मुरुगन की विजय केंद्रित संध्या-पूजा; मंदिर में अभिषेक और शोभा पुरोहितों द्वारा। घर में दीप, फूल और कवचम्।"],
    paran: ["Some families break the six-day fast after Soorasamharam worship; others wait until the morning of day 7. Follow your family or temple.", "कुछ परिवार सूरसम्हारम् पूजा के बाद छह-दिवसीय व्रत खोलते हैं; कुछ दिन 7 की प्रातः प्रतीक्षा करते हैं। परिवार या मंदिर मानें।"],
    ...skandaCommon,
    safety: ["Major temple Soorasamharam gatherings can be crowded. Keep children close, follow marshals and avoid pushing in queues.", "बड़े मंदिरों में सूरसम्हारम् भीड़भाड़ वाला हो सकता है। बच्चों को पास रखें, मार्शल का पालन करें और कतार में धक्का न दें।"],
  }),
  skandaSashtiThirukalyanam: guide({
    verdict: ["Day 7 is Thirukalyanam — the divine marriage of Murugan and Deivanai. Celebrate with joy; this is a separate festival milestone from yesterday's Soorasamharam.", "दिन 7 तिरुकल्याणम् है — मुरुगन और देवयानी का दिव्य विवाह। आनंद से मनाएँ; यह कल के सूरसम्हारम् से अलग उत्सव-चरण है।"],
    meaning: ["The morning after Soorasamharam, many Tamil traditions honour Murugan's marriage. Families who completed the fast may take food after morning worship; temple weddings are joyous public celebrations.", "सूरसम्हारम् के बाद की प्रातः अनेक तमिल परंपराएँ मुरुगन के विवाह का सम्मान करती हैं। व्रत पूर्ण करने वाले परिवार प्रातः पूजा के बाद भोजन ले सकते हैं; मंदिर विवाह सार्वजनिक उत्सव है।"],
    vidhi: [["Offer morning worship to Murugan and Deivanai.", "प्रातः मुरुगन और देवयानी की पूजा करें।"], ["If your vow ends today, complete it with prasad after morning puja.", "यदि आज व्रत समाप्त हो तो प्रातः पूजा के बाद प्रसाद से पूर्ण करें।"], ["Share sweets or the family's festive meal with relatives.", "मिठाई या उत्सवी भोजन सम्बन्धियों में बाँटें।"], ["Visit the temple for Thirukalyanam darshan where held.", "जहाँ हो वहाँ तिरुकल्याणम् दर्शन हेतु मंदिर जाएँ।"]],
    diet: ["Breaking the six-day fast with a vegetarian meal after morning worship is common on day 7. Follow your temple announcement.", "दिन 7 प्रातः पूजा के बाद शाकाहारी भोजन से छह-दिवसीय व्रत खोलना प्रचलित है। मंदिर की घोषणा मानें।"],
    sankalpa: ["“With gratitude for Murugan's victory, I rejoice in the divine marriage and complete my vow as my tradition teaches.”", "“मुरुगन की विजय के प्रति कृतज्ञता से दिव्य विवाह में प्रसन्न होकर अपनी परंपरा के अनुसार व्रत पूर्ण करता/करती हूँ।”"],
    puja: ["Morning lamp, flowers, wedding-themed Murugan prayer; temple kalyanam rituals are priest-led.", "प्रातः दीप, फूल, विवाह-भाव की मुरुगन-प्रार्थना; मंदिर कल्याण विधि पुरोहित-निर्देशित।"],
    paran: ["Complete the six-day fast after morning worship and prasad according to family or temple practice.", "पारिवारिक या मंदिर-विधि के अनुसार प्रातः पूजा और प्रसाद के बाद छह-दिवसीय व्रत पूर्ण करें।"],
    ...skandaCommon,
  }),
  ayyappaMandalaBegins: guide({
    verdict: ["Today opens the public Mandala season on the Vrischika Sankranti calendar. Wearing the mala and beginning your personal 41-day vow is a separate step — do it when you are ready, with Guru Swami or temple guidance.", "आज वृश्चिक संक्रांति पंचांग पर सार्वजनिक मंडल-काल आरम्भ होता है। माला धारण और व्यक्तिगत 41-दिवसीय व्रत का आरम्भ अलग कदम है — जब तैयार हों, गुरु स्वामी या मंदिर के मार्गदर्शन में करें।"],
    meaning: ["Millions observe an inclusive 41-day discipline before Sabarimala pilgrimage. The calendar day when the season opens is not the same as the day you personally receive mala — both are sacred, but only the latter starts your vow.", "लाखों भक्त सबरीमला यात्रा से पहले 41-दिवसीय अनुशासन रखते हैं। जब सार्वजनिक काल खुलता है वह दिन व्यक्तिगत माला-दीक्षा का दिन नहीं — दोनों पवित्र हैं, पर व्रत केवल दीक्षा से आरम्भ होता है।"],
    vidhi: [["Learn the discipline from Guru Swami or your Ayyappa temple group.", "गुरु स्वामी या अय्यप्पा मंदिर-समूह से अनुशासन सीखें।"], ["When ready, receive mala after prayer in temple or home shrine as your tradition permits.", "तैयार होने पर प्रार्थना के बाद मंदिर या घर-मंदिर में परंपरानुसार माला धारण करें।"], ["Begin celibacy, vegetarian food and daily Ayyappa worship for your 41 days.", "अपने 41 दिनों के लिए ब्रह्मचर्य, शाकाहार और नित्य अय्यप्पा-पूजन आरम्भ करें।"], ["Wear black or simple clothing if that is your group's rule.", "यदि समूह का नियम हो तो काले या सादे वस्त्र पहनें।"]],
    diet: ["Vegetarian food, sobriety and simple living are the core. Meal times and ingredient rules vary by Guru Swami — follow yours, not a generic list.", "शाकाहार, नशामुक्ति और सादगी मूल हैं। भोजन-समय और सामग्री-नियम गुरु स्वामी के अनुसार भिन्न — सामान्य सूची नहीं, अपना नियम मानें।"],
    sankalpa: ["“With Lord Ayyappa as refuge I begin this Mandala vrata when I knowingly wear the mala, following my Guru Swami's discipline.”", "“भगवान अय्यप्पा की शरण में सचेत माला धारण पर मैं गुरु स्वामी के अनुशासन में यह मंडल व्रत आरम्भ करता/करती हूँ।”"],
    puja: ["Morning and evening Ayyappa prayer or bhajan taught by your group. Irumudi preparation comes later under Guru guidance.", "समूह द्वारा सिखाई प्रातः-सायं अय्यप्पा प्रार्थना या भजन। इरुमुडी की तैयारी बाद में गुरु-मार्गदर्शन में।"],
    stories: [["Ayyappa unites Shaiva and Vaishnava devotees on the pilgrimage to Sabarimala.", "सबरीमला यात्रा में अय्यप्पा शैव और वैष्णव भक्तों को जोड़ते हैं।"], ["The 41 days teach restraint, equality and single-minded devotion.", "41 दिन संयम, समानता और एकाग्र भक्ति सिखाते हैं।"]],
    regional: [["Kerala and Tamil Nadu temple groups begin Mandala with formal mala darshan.", "केरल और तमिलनाडु के मंदिर-समूह औपचारिक माला-दर्शन से मंडल आरम्भ करते हैं।"], ["Diaspora temples mirror the season with local Guru Swami-led initiations.", "प्रवासी मंदिर स्थानीय गुरु स्वामी के नेतृत्व में दीक्षा के साथ काल का अनुसरण करते हैं।"]],
    paran: ["The personal vow continues through the 41 days; today is only the season's opening on the public calendar.", "व्यक्तिगत व्रत 41 दिन चलता है; आज केवल सार्वजनिक पंचांग पर काल का आरम्भ है।"],
    udyapan: ["Personal completion follows pilgrimage and Guru Swami practice, not this calendar day alone.", "व्यक्तिगत समापन यात्रा और गुरु स्वामी-विधि से होता है, केवल इस पंचांग-दिन से नहीं।"],
    safety: ["Do not stop prescribed medicine for the vrata. Seek medical advice before fasting if you have a health condition.", "व्रत के कारण निर्धारित दवा बंद न करें। स्वास्थ्य-स्थिति में उपवास से पहले चिकित्सकीय सलाह लें।"],
  }),
  ayyappaMandalaPuja: guide({
    verdict: ["Day 41 is Mandala Pooja — the public closing of the temple Mandala season. Your personal mala and vow end only after your pilgrimage and Guru Swami's guidance, not automatically today.", "दिन 41 मंडल पूजा है — मंदिर-मंडल-काल का सार्वजनिक समापन। आपकी व्यक्तिगत माला और व्रत केवल यात्रा और गुरु स्वामी के मार्गदर्शन से समाप्त होते हैं, आज अपने-आप नहीं।"],
    meaning: ["Temples across Kerala and the diaspora celebrate Mandala Pooja with special worship. Pilgrims who reach Sabarimala around this time join Neyyabhishekam and Padi Pooja; home devotees offer prayer on this sacred closing day.", "केरल और प्रवास में मंदिर मंडल पूजा विशेष पूजा से मनाते हैं। इस समय सबरीमला पहुँचे यात्री नेय्यभिषेकम् और पड़ी पूजा में सम्मिलित होते हैं; घर के भक्त इस पवित्र समापन-दिन प्रार्थना करते हैं।"],
    vidhi: [["Offer special Ayyappa worship at home or temple.", "घर या मंदिर में विशेष अय्यप्पा-पूजन करें।"], ["If you are on pilgrimage, follow temple schedule for Mandala Pooja.", "यात्रा पर हों तो मंडल पूजा की मंदिर-समय-सारिणी मानें।"], ["Do not remove mala unless your Guru Swami directs after completed pilgrimage.", "यात्रा पूर्ण होने पर गुरु स्वामी निर्देश दें तभी माला उतारें।"], ["Share prasad and gratitude with your Ayyappa group.", "अय्यप्पा-समूह के साथ प्रसाद और कृतज्ञता बाँटें।"]],
    diet: ["Continue the vrata discipline until your personal completion rite. Mandala Pooja day does not by itself end every devotee's fast.", "व्यक्तिगत समापन-विधि तक व्रत-अनुशासन जारी रखें। मंडल पूजा-दिवस स्वयं हर भक्त का उपवास समाप्त नहीं करता।"],
    sankalpa: ["“On Mandala Pooja day I worship Lord Ayyappa with gratitude for the season's discipline and pray for a safe pilgrimage if I am undertaking one.”", "“मंडल पूजा के दिन मैं इस काल के अनुशासन के प्रति कृतज्ञता से भगवान अय्यप्पा की पूजा करता/करती हूँ और यदि यात्रा कर रहा/रही हूँ तो सुरक्षित यात्रा की प्रार्थना करता/करती हूँ।”"],
    puja: ["Neyyabhishekam, Padi Pooja and Kettunirakkal are temple pilgrimage observances. Home worship: lamp, familiar Ayyappa names and bhajan.", "नेय्यभिषेकम्, पड़ी पूजा और केट्टुनिरक्कल मंदिर-यात्रा के अनुष्ठान हैं। गृह-पूजा: दीप, परिचित अय्यप्पा-नाम और भजन।"],
    stories: [["Mandala Pooja marks the culmination of millions praying together across the season.", "मंडल पूजा पूरे काल लाखों की संयुक्त प्रार्थना का चरम है।"], ["The 18 sacred steps remain the goal of the completed pilgrimage.", "पवित्र 18 सीढ़ियाँ पूर्ण यात्रा का लक्ष्य हैं।"]],
    regional: [["Sabarimala receives the largest gathering; book travel and follow official temple advisories.", "सबरीमला पर सबसे बड़ा समागम; यात्रा की व्यवस्था करें और मंदिर की आधिकारिक सूचनाएँ मानें।"], ["Local Ayyappa temples hold Mandala Pooja for devotees who cannot travel.", "स्थानीय अय्यप्पा मंदिर यात्रा न कर सकने वाले भक्तों के लिए मंडल पूजा कराते हैं।"]],
    paran: ["Remove mala and break the vow only per Guru Swami after your pilgrimage — not automatically on this public date.", "माला उतारें और व्रत खोलें केवल यात्रा के बाद गुरु स्वामी के अनुसार — इस सार्वजनिक तिथि पर अपने-आप नहीं।"],
    udyapan: ["Accepted completion depends on pilgrimage and tradition; illness may require restarting under Guru guidance.", "मान्य समापन यात्रा और परंपरा पर निर्भर; बीमारी में गुरु-मार्गदर्शन में पुनः आरम्भ हो सकता है।"],
    safety: ["Prepare physically for Sabarimala climbs, carry medicines, rest when needed and use medical centres on the hill. Do not stop prescribed medicine for the vrata.", "सबरीमला चढ़ाई के लिए शारीरिक तैयारी करें, दवाएँ साथ रखें, आवश्यकता पर विश्राम करें और पहाड़ी चिकित्सा-केंद्र का उपयोग करें। व्रत के कारण निर्धारित दवा बंद न करें।"],
  }),
};
