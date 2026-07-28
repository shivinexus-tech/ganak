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

const SKANDA_BEGIN_STORIES = [
  [
    `The vow begins — Before the battle is remembered, the annual Kanda Sashti story begins with the devas seeking refuge from Surapadman and the forces that have disturbed the worlds. Shiva's fiery power becomes six sparks. Agni and Vayu carry them to the Saravana reeds, where the six children are tended by the Krittika mothers. When Parvati embraces them, they appear as one radiant child with six faces: Shanmukha, also loved as Skanda, Kartikeya and Murugan.

The six faces are remembered as complete awareness turned in every direction. Murugan is not sent out through anger alone. He is prepared through wisdom, discipline and his mother's grace. Devi places the Vel, the shining spear, in his hand. The weapon signifies clear knowledge that can pierce confusion and pride. Murugan accepts leadership of the devas, yet the first day is still a day of preparation rather than the victory itself.

A household beginning the six-day vrata therefore lights the lamp, remembers Devi giving the Vel and makes a steady promise for the days ahead. The devotee does not rush to the final scene. Prayer, restraint and repeated remembrance accompany Murugan step by step. This is why the opening route should be heard as the commencement of a sacred discipline, while Soorasamharam remains the distinct culmination on day six.`,
    `व्रत का आरम्भ — वार्षिक कन्द षष्ठी की कथा युद्ध से पहले उस समय आरम्भ होती है जब सुरपद्म और उसकी शक्तियों से लोकों में विघ्न बढ़ता है और देवता शरण माँगते हैं। शिव का तेज छह स्फुलिंगों के रूप में प्रकट होता है। अग्नि और वायु उन्हें सरवण के सरकण्डों तक ले जाते हैं, जहाँ कृत्तिका माताएँ छह बालकों का पालन करती हैं। पार्वती उन्हें एक साथ आलिंगन करती हैं तो वे छह मुखों वाले एक तेजस्वी बालक बनते हैं—षण्मुख, जिन्हें स्कन्द, कार्तिकेय और मुरुगन नामों से भी प्रेमपूर्वक पुकारा जाता है।

छह मुख चारों दिशाओं में जाग्रत पूर्ण चेतना का स्मरण कराते हैं। मुरुगन केवल क्रोध से युद्ध के लिए नहीं भेजे जाते; वे ज्ञान, अनुशासन और माता की कृपा से तैयार होते हैं। देवी उनके हाथ में प्रकाशमान वेल देती हैं। यह आयुध स्पष्ट ज्ञान का प्रतीक है, जो भ्रम और अहंकार को भेदता है। मुरुगन देवताओं का नेतृत्व स्वीकार करते हैं, पर प्रथम दिन विजय का नहीं, तैयारी का दिन है।

इसीलिए छह-दिवसीय व्रत आरम्भ करने वाला परिवार दीप जलाकर देवी द्वारा वेल दिए जाने का स्मरण करता है और आने वाले दिनों के लिए स्थिर संकल्प लेता है। भक्त अंतिम प्रसंग पर शीघ्र नहीं पहुँचता; प्रार्थना, संयम और नित्य स्मरण के साथ मुरुगन के मार्ग पर क्रमशः चलता है। आरम्भ-पृष्ठ इस पवित्र अनुशासन की शुरुआत है, जबकि सूरसम्हारम् छठे दिन का अलग चरम प्रसंग है।`,
  ],
  [
    `The first day's discipline — Tamil devotional memory treats the six days as a journey, not as six unrelated fasts. At the beginning, the devotee cleans the worship place, places a Murugan image or Vel with the lamp and chooses a fasting rule that can be kept honestly. Some families take fruit or milk, some one simple meal and some a stricter fast. The religious value lies in keeping the received rule with steadiness, not in competing over severity.

Kanda Sashti Kavacham and other familiar Murugan hymns are often recited during the sequence. The Kavacham is a Tamil prayer of refuge that names Murugan and the Vel as protection for the devotee's whole life. It is not the battle enactment itself, nor is one text compulsory in every home. Families may instead repeat Murugan's names, sing a hymn known to them or listen to the temple's recitation.

On day one, these practices gather attention around the vow: begin calmly, keep the chosen food discipline and return to prayer each day. Tiruchendur and other temples publish their own services across the six days, while homes follow a simpler rhythm. This narrative belongs specifically to the beginning because it explains how the vrata is undertaken; completion, fast-breaking and the divine wedding belong to later named days.`,
    `प्रथम दिन का अनुशासन — तमिल भक्ति-परम्परा छह दिनों को एक यात्रा मानती है, छह असम्बद्ध उपवास नहीं। आरम्भ में भक्त पूजा-स्थान स्वच्छ करता है, दीप के साथ मुरुगन की प्रतिमा या वेल रखता है और ऐसा आहार-नियम चुनता है जिसे श्रद्धा और सत्यनिष्ठा से निभा सके। कुछ परिवार फल या दूध लेते हैं, कुछ एक सरल भोजन और कुछ अधिक कठोर उपवास रखते हैं। धार्मिक महत्त्व कठोरता की होड़ में नहीं, प्राप्त नियम को स्थिरता से निभाने में है।

कन्द षष्ठी कवचम् और अन्य परिचित मुरुगन स्तोत्र इस क्रम में प्रायः पढ़े जाते हैं। कवचम् तमिल शरण-प्रार्थना है, जिसमें मुरुगन और वेल को भक्त के सम्पूर्ण जीवन की रक्षा के रूप में स्मरण किया जाता है। यह स्वयं युद्ध-नाट्य नहीं है और प्रत्येक घर में यही एक पाठ अनिवार्य भी नहीं। परिवार मुरुगन के नाम दोहरा सकते हैं, परिचित स्तोत्र गा सकते हैं या मंदिर का पाठ सुन सकते हैं।

प्रथम दिन ये साधनाएँ संकल्प पर ध्यान एकत्र करती हैं—शान्ति से आरम्भ करें, चुना हुआ आहार-नियम रखें और प्रतिदिन प्रार्थना में लौटें। तिरुचेंदूर तथा अन्य मंदिर छह दिनों की अपनी सेवाएँ घोषित करते हैं, जबकि घर सरल क्रम रखते हैं। यह कथा विशेषतः आरम्भ की है, क्योंकि यह बताती है कि व्रत कैसे ग्रहण किया जाता है; पारण, विजय और दिव्य विवाह बाद के नामित दिनों से जुड़े हैं।`,
  ],
];

const SKANDA_SOORA_STORIES = [
  [
    `Surapadman's last stand — By the sixth day, Murugan's campaign has reached its decisive encounter with Surapadman. Tamil tellings remember the asura using many forms and stratagems rather than yielding. At last he becomes a vast mango tree, hoping to escape recognition. Murugan's Vel divides the tree. From its two parts emerge the peacock and the rooster.

The ending is not remembered only as destruction. Murugan receives the peacock as his vehicle and the rooster as the emblem on his banner. The defeated force is transformed and given a place in divine service. That turn gives Soorasamharam its devotional depth: sharp discernment confronts arrogance, yet grace can redirect what has opposed dharma instead of leaving only hatred behind.

At Tiruchendur and many Murugan temples, the encounter is enacted publicly with successive scenes, processions and the appearance of the Vel. A household unable to attend may keep the lamp, hear the story and pray during the announced evening worship. This is the day-six narrative specifically; it must not be copied onto the first day's taking of the vow or the next day's Thirukalyanam celebration.`,
    `सुरपद्म का अंतिम सामना — छठे दिन तक मुरुगन का अभियान सुरपद्म के साथ निर्णायक युद्ध तक पहुँचता है। तमिल कथाओं में असुर समर्पण करने के स्थान पर अनेक रूप और उपाय अपनाता है। अन्त में वह पहचान से बचने के लिए एक विशाल आम-वृक्ष बन जाता है। मुरुगन की वेल उस वृक्ष को दो भागों में विभाजित करती है। उन दो भागों से मयूर और मुर्गा प्रकट होते हैं।

यह अन्त केवल विनाश की कथा नहीं है। मुरुगन मयूर को अपना वाहन और मुर्गे को अपनी ध्वजा का चिह्न स्वीकार करते हैं। पराजित शक्ति रूपान्तरित होकर दिव्य सेवा में स्थान पाती है। यही मोड़ सूरसम्हारम् को गहरा भक्तिपूर्ण अर्थ देता है—तीक्ष्ण विवेक अहंकार का सामना करता है, फिर भी कृपा धर्म का विरोध करने वाली शक्ति को नई दिशा दे सकती है; केवल द्वेष शेष रखना आवश्यक नहीं।

तिरुचेंदूर और अनेक मुरुगन मंदिरों में यह सामना क्रमिक दृश्यों, शोभायात्राओं और वेल के प्राकट्य के साथ सार्वजनिक रूप से प्रस्तुत होता है। जो परिवार वहाँ न जा सके वह दीप रखकर कथा सुने और घोषित संध्या-पूजा के समय प्रार्थना करे। यह विशेषतः छठे दिन की कथा है; इसे प्रथम दिन के व्रत-संकल्प या अगले दिन के तिरुकल्याणम् उत्सव पर ज्यों का त्यों नहीं रखा जाना चाहिए।`,
  ],
  [
    `Victory with restraint — The six-day fast gathers its intensity around Murugan's victory, but the observance is not permission to celebrate violence. The Vel is praised as wisdom and divine resolve. Devotees ask for the courage to recognize the Surapadman-like pride, fear or confusion within themselves and for the discipline to act without cruelty.

Temple Soorasamharam is a liturgical drama under the temple's own priests, musicians and organisers. The sacred sequence, its images and its timing belong to that institution. Home worship is more modest: lamp, flowers, Murugan's names, a familiar hymn and attentive hearing of the story. A family should not improvise weapons, fire or a battle performance as though those were required household rites.

After the enactment, some traditions complete the strict fast that evening, while others continue until the following morning. The chosen temple or family rule controls the parana. The transformation of Surapadman prepares the mood for reconciliation and grace; the next named milestone is Thirukalyanam. Keeping that sequence visible protects the meaning of each page and lets a devotee know exactly what today's observance asks.`,
    `संयम सहित विजय — छह-दिवसीय व्रत की तीव्रता मुरुगन की विजय के आसपास एकत्र होती है, पर यह पर्व हिंसा का उत्सव मनाने की अनुमति नहीं देता। वेल की स्तुति ज्ञान और दैवी दृढ़ता के रूप में होती है। भक्त अपने भीतर सुरपद्म जैसे अहंकार, भय या भ्रम को पहचानने का साहस और क्रूरता के बिना धर्मपूर्ण कर्म करने का अनुशासन माँगते हैं।

मंदिर का सूरसम्हारम् उसके पुरोहितों, संगीतकारों और आयोजकों के मार्गदर्शन में होने वाला धार्मिक नाट्य है। पवित्र क्रम, प्रतिमाएँ और समय उसी मंदिर की व्यवस्था के अनुसार चलते हैं। घर की पूजा अधिक सरल है—दीप, फूल, मुरुगन-नाम, परिचित स्तोत्र और एकाग्र होकर कथा-श्रवण। परिवार को अस्त्र, अग्नि या युद्ध-नाट्य की नकल इस प्रकार नहीं करनी चाहिए मानो वह अनिवार्य गृह-विधि हो।

नाट्य के बाद कुछ परम्पराएँ उसी संध्या कठोर उपवास पूरा करती हैं, जबकि कुछ अगली प्रातः तक जारी रखती हैं। चुना हुआ मंदिर या पारिवारिक नियम पारण तय करता है। सुरपद्म का रूपान्तरण मेल और कृपा का भाव तैयार करता है; अगला नामित चरण तिरुकल्याणम् है। इस क्रम को स्पष्ट रखने से प्रत्येक पृष्ठ का अर्थ सुरक्षित रहता है और भक्त जान पाता है कि आज का अनुष्ठान वास्तव में क्या माँगता है।`,
  ],
];

const SKANDA_WEDDING_STORIES = [
  [
    `After victory, a wedding — Thirukalyanam changes the emotional register of the annual sequence. The day after Soorasamharam, many Tamil temples celebrate Murugan's divine marriage with Deivanai, daughter of Indra. The battle field gives way to a decorated marriage hall, auspicious music, garlands and the shared joy of devotees.

Deivanai is remembered as having been raised in the celestial household and offered in marriage after Murugan restores the devas. Their union signifies the settling of order after conflict and the joining of valour with gracious responsibility. It is not another scene of Surapadman's defeat. The ritual directs the community from struggle toward relationship, abundance and thankful celebration.

Temple priests conduct the kalyanam according to their established liturgy. Households may offer a morning lamp, flowers and sweets, hear the marriage story and take prasad after completing the vrata as their tradition directs. This named day needs its own narrative because a devotee opening the page should encounter Deivanai and the wedding immediately, not a copied account of the battle or a generic six-day summary.`,
    `विजय के बाद विवाह — तिरुकल्याणम् वार्षिक क्रम का भाव बदल देता है। सूरसम्हारम् के अगले दिन अनेक तमिल मंदिर मुरुगन और इन्द्र की पुत्री देवयानी के दिव्य विवाह का उत्सव मनाते हैं। युद्धभूमि का स्थान सुसज्जित विवाह-मण्डप, मंगल-संगीत, मालाएँ और भक्तों का साझा आनन्द ले लेते हैं।

देवयानी का पालन दिव्य लोक में हुआ माना जाता है और मुरुगन द्वारा देवताओं की व्यवस्था पुनः स्थापित करने के बाद उनका विवाह होता है। यह मिलन संघर्ष के बाद व्यवस्था के स्थिर होने और वीरता के साथ करुणामयी उत्तरदायित्व के जुड़ने का संकेत है। यह सुरपद्म की पराजय का दूसरा दृश्य नहीं। अनुष्ठान समुदाय को संघर्ष से सम्बन्ध, समृद्धि और कृतज्ञ उत्सव की ओर ले जाता है।

मंदिर के पुरोहित स्थापित विधि से कल्याणम् सम्पन्न करते हैं। घर में प्रातः दीप, फूल और मिठाई अर्पित की जा सकती है, विवाह-कथा सुनी जा सकती है और अपनी परम्परा के अनुसार व्रत पूरा करके प्रसाद लिया जा सकता है। इस नामित दिन की अपनी कथा आवश्यक है, ताकि पृष्ठ खोलने वाला भक्त तुरन्त देवयानी और विवाह से मिले, युद्ध की नकल या सामान्य छह-दिवसीय सारांश से नहीं।`,
  ],
  [
    `The community rejoices — In major Murugan temples, Thirukalyanam may be celebrated as a full public wedding. Deities are adorned as bridegroom and bride, the marriage formula is recited, garlands are exchanged and devotees receive the blessed sight as a sign of auspicious completion. Local schedules differ, so the temple announcement governs attendance and the moment of darshan.

For a family that has kept Kanda Sashti, the morning also carries practical relief. The strict portion of the vow has reached its accepted end. Food returns as prasad and a vegetarian festive meal, not merely as the abandonment of restraint. Gratitude to Murugan, Devi and the teachers or family members who supported the six days completes the household observance.

Tamil communities outside India often hold the wedding on a nearby evening or weekend so families can gather. That scheduling adaptation does not erase the sequence: Soorasamharam and Thirukalyanam remain distinct milestones. The essential guidance is to follow the local temple for ceremonial details, preserve the wedding's joyful identity and use the household path when a public celebration is unavailable.`,
    `समुदाय का आनन्द — प्रमुख मुरुगन मंदिरों में तिरुकल्याणम् पूर्ण सार्वजनिक विवाह की तरह मनाया जा सकता है। देवप्रतिमाओं को वर और वधू के रूप में सजाया जाता है, विवाह-वचन पढ़े जाते हैं, मालाओं का आदान-प्रदान होता है और भक्त इस मंगल दर्शन को क्रम की शुभ पूर्णता मानकर ग्रहण करते हैं। स्थानीय समय अलग होते हैं, इसलिए उपस्थिति और दर्शन का समय मंदिर की घोषणा से लें।

कन्द षष्ठी रखने वाले परिवार के लिए यह प्रातः व्यावहारिक विश्राम भी लाती है। संकल्प का कठोर भाग मान्य समापन तक पहुँच चुका है। भोजन केवल संयम छोड़ देना नहीं, बल्कि प्रसाद और शाकाहारी उत्सवी आहार के रूप में लौटता है। मुरुगन, देवी और छह दिनों में सहयोग देने वाले गुरु या परिवार के प्रति कृतज्ञता गृह-अनुष्ठान को पूरा करती है।

भारत से बाहर तमिल समुदाय कभी परिवारों को एकत्र करने के लिए विवाह को निकट की संध्या या सप्ताहान्त में रखते हैं। समय का यह अनुकूलन क्रम को मिटाता नहीं; सूरसम्हारम् और तिरुकल्याणम् अलग चरण बने रहते हैं। मुख्य मार्गदर्शन है कि समारोह की विस्तृत विधि स्थानीय मंदिर से लें, विवाह का आनन्दपूर्ण स्वर सुरक्षित रखें और सार्वजनिक आयोजन उपलब्ध न हो तो सरल गृह-पूजा करें।`,
  ],
];

const skandaCommon = {
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
    stories: SKANDA_BEGIN_STORIES,
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
    stories: SKANDA_SOORA_STORIES,
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
    stories: SKANDA_WEDDING_STORIES,
    ...skandaCommon,
  }),
  ayyappaMandalaBegins: guide({
    verdict: ["Today opens the public Mandala season on the Vrischika Sankranti calendar. Wearing the mala and beginning your personal 41-day vow is a separate step — do it when you are ready, with Guru Swami or temple guidance.", "आज वृश्चिक संक्रांति पंचांग पर सार्वजनिक मंडल-काल आरम्भ होता है। माला धारण और व्यक्तिगत 41-दिवसीय व्रत का आरम्भ अलग कदम है — जब तैयार हों, गुरु स्वामी या मंदिर के मार्गदर्शन में करें।"],
    meaning: ["Millions observe an inclusive 41-day discipline before Sabarimala pilgrimage. The calendar day when the season opens is not the same as the day you personally receive mala — both are sacred, but only the latter starts your vow.", "लाखों भक्त सबरीमला यात्रा से पहले 41-दिवसीय अनुशासन रखते हैं। जब सार्वजनिक काल खुलता है वह दिन व्यक्तिगत माला-दीक्षा का दिन नहीं — दोनों पवित्र हैं, पर व्रत केवल दीक्षा से आरम्भ होता है।"],
    vidhi: [["Learn the discipline from Guru Swami or your Ayyappa temple group.", "गुरु स्वामी या अय्यप्पा मंदिर-समूह से अनुशासन सीखें।"], ["When ready, receive mala after prayer in temple or home shrine as your tradition permits.", "तैयार होने पर प्रार्थना के बाद मंदिर या घर-मंदिर में परंपरानुसार माला धारण करें।"], ["Begin celibacy, vegetarian food and daily Ayyappa worship for your 41 days.", "अपने 41 दिनों के लिए ब्रह्मचर्य, शाकाहार और नित्य अय्यप्पा-पूजन आरम्भ करें।"], ["Wear black or simple clothing if that is your group's rule.", "यदि समूह का नियम हो तो काले या सादे वस्त्र पहनें।"]],
    diet: ["Vegetarian food, sobriety and simple living are the core. Meal times and ingredient rules vary by Guru Swami — follow yours, not a generic list.", "शाकाहार, नशामुक्ति और सादगी मूल हैं। भोजन-समय और सामग्री-नियम गुरु स्वामी के अनुसार भिन्न — सामान्य सूची नहीं, अपना नियम मानें।"],
    sankalpa: ["“With Lord Ayyappa as refuge I begin this Mandala vrata when I knowingly wear the mala, following my Guru Swami's discipline.”", "“भगवान अय्यप्पा की शरण में सचेत माला धारण पर मैं गुरु स्वामी के अनुशासन में यह मंडल व्रत आरम्भ करता/करती हूँ।”"],
    puja: ["Morning and evening Ayyappa prayer or bhajan taught by your group. Irumudi preparation comes later under Guru guidance.", "समूह द्वारा सिखाई प्रातः-सायं अय्यप्पा प्रार्थना या भजन। इरुमुडी की तैयारी बाद में गुरु-मार्गदर्शन में।"],
    stories: [
      [
        `The season opens, the personal vow is chosen — When the Malayalam month of Vrischikam begins, Sabarimala enters its public Mandala season. Temples light the season's first lamps, groups begin their preparations and the road toward Lord Ayyappa's hill shrine becomes present in the minds of devotees. This calendar opening belongs to the whole temple season; merely seeing the date does not place a mala on an individual devotee.

The personal vratham begins through an intentional act. After prayer, a devotee receives or wears the Ayyappa mala, commonly with a temple priest or experienced Guru Swami, and accepts the discipline that will shape the next forty-one days. Official Sabarimala guidance also recognizes wearing the mala in the home prayer place. What matters is that the beginning is conscious and that the devotee knows whose guidance will be followed.

From that moment, regular Ayyappa worship, vegetarian food, celibacy, sobriety and simple conduct turn ordinary days into pilgrimage preparation. The opening route must preserve these two clocks: the public season begins on its published day, while a person's count begins with the chosen mala and sankalpa. Keeping them distinct prevents a calendar from starting, ending or resetting a sacred personal promise without the devotee's action.`,
        `ऋतु का आरम्भ और व्यक्तिगत संकल्प — मलयालम मास वृश्चिकम् आरम्भ होते ही सबरीमला का सार्वजनिक मंडल-काल खुलता है। मंदिर ऋतु के प्रथम दीप जलाते हैं, समूह अपनी तैयारी आरम्भ करते हैं और भगवान अय्यप्पा के पर्वतीय धाम की यात्रा भक्तों के मन में निकट हो जाती है। यह पंचांग-आरम्भ सम्पूर्ण मंदिर-काल का है; केवल तिथि देखने से किसी व्यक्ति के गले में माला नहीं पड़ती।

व्यक्तिगत व्रतम् एक सचेत कर्म से आरम्भ होता है। प्रार्थना के बाद भक्त अय्यप्पा माला ग्रहण या धारण करता है—सामान्यतः मंदिर के पुरोहित या अनुभवी गुरु स्वामी के साथ—और अगले इकतालीस दिनों का अनुशासन स्वीकार करता है। आधिकारिक सबरीमला मार्गदर्शन घर के पूजा-स्थान में माला धारण करने को भी मान्यता देता है। मुख्य बात यह है कि आरम्भ जान-बूझकर हो और भक्त को स्पष्ट हो कि वह किसका मार्गदर्शन मानेगा।

उस क्षण से नियमित अय्यप्पा-पूजन, शाकाहार, ब्रह्मचर्य, नशामुक्ति और सरल आचरण सामान्य दिनों को यात्रा की तैयारी बनाते हैं। आरम्भ-पृष्ठ को दोनों समय-क्रम अलग रखने चाहिए—सार्वजनिक ऋतु घोषित दिन से आरम्भ होती है, जबकि व्यक्ति की गिनती चुनी हुई माला और संकल्प से। यह भेद पंचांग को भक्त की सहमति के बिना पवित्र व्यक्तिगत प्रतिज्ञा शुरू, समाप्त या रीसेट करने से रोकता है।`,
      ],
      [
        `Hariharaputra and the path to Sabarimala — Ayyappa is praised as Hariharaputra, the son who joins the grace associated with Hari and Hara. Devotional accounts connect him with the protection of dharma and with the forest shrine at Sabarimala. The pilgrimage does not approach him through status or display. Devotees address one another as Swami and undertake a common discipline intended to soften ordinary distinctions.

The forty-one days train body, speech and attention before the climb. Black or simple clothing, restraint from indulgence, regular prayer and the group's repeated refuge in Ayyappa make the journey begin long before the hill. Additional meal schedules or ingredient rules vary by Guru Swami and temple group; they should not be turned into one invented universal list.

Irumudi and the sacred eighteen steps belong later in the pilgrimage sequence. The two-compartment offering is prepared through Kettunirakkal under Guru Swami guidance, not as an improvised home packing exercise. Only pilgrims carrying it use the sacred steps according to the Sabarimala practice. The beginning story therefore calls a devotee into disciplined refuge while directing pilgrimage-only rites to the experienced community that carries them.`,
        `हरिहरपुत्र और सबरीमला का मार्ग — अय्यप्पा की स्तुति हरिहरपुत्र के रूप में होती है, जिनमें हरि और हर से जुड़ी कृपा का संगम माना जाता है। भक्तिपरक आख्यान उन्हें धर्म की रक्षा और सबरीमला के वन-धाम से जोड़ते हैं। यात्रा उनके पास पद या प्रदर्शन के आधार पर नहीं पहुँचती। भक्त एक-दूसरे को स्वामी कहकर सम्बोधित करते हैं और ऐसा साझा अनुशासन ग्रहण करते हैं जिसका उद्देश्य सामान्य भेदों को कोमल करना है।

इकतालीस दिन चढ़ाई से पहले शरीर, वाणी और ध्यान को साधते हैं। काले या सादे वस्त्र, विलास से संयम, नियमित प्रार्थना और समूह द्वारा बार-बार अय्यप्पा की शरण लेना पर्वत से बहुत पहले यात्रा आरम्भ कर देता है। भोजन-समय या सामग्री के अतिरिक्त नियम गुरु स्वामी और मंदिर-समूह के अनुसार बदलते हैं; उन्हें एक गढ़ी हुई सार्वभौमिक सूची नहीं बनाना चाहिए।

इरुमुडी और पवित्र अठारह सीढ़ियाँ यात्रा के बाद के क्रम से जुड़ी हैं। दो भागों वाला यह अर्पण गुरु स्वामी के मार्गदर्शन में केट्टुनिरक्कल द्वारा तैयार होता है, घर में अनुमान से पैक करने का अभ्यास नहीं। सबरीमला परम्परा में इरुमुडी धारण करने वाले यात्री ही पवित्र सीढ़ियों का उपयोग करते हैं। इसलिए आरम्भ की कथा भक्त को अनुशासित शरण में बुलाती है और यात्रा-विशेष विधियों को उस अनुभवी समुदाय के पास रखती है जो उनका वहन करता है।`,
      ],
    ],
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
    stories: [
      [
        `The public season reaches Mandala Pooja — After forty-one days in the temple calendar, the Mandala season reaches its solemn celebration. At Sabarimala and Ayyappa temples elsewhere, special worship gathers the prayers, restraint and pilgrimage preparation offered across the season. Devotees who cannot travel may still mark the day with a lamp, Ayyappa's names, bhajan and gratitude in a local temple or at home.

For pilgrims at Sabarimala, named observances such as Neyyabhishekam and Padi Pooja belong to the temple and pilgrimage order. Priests, the temple calendar and the pilgrim's Guru Swami govern those rites. A home page should explain their place without turning them into a compulsory do-it-yourself checklist.

Mandala Pooja closes the public forty-one-day span, but that fact does not automatically finish every person's vratham. The official pilgrimage guidance connects mala removal with completion of the pilgrimage. Someone who began later, will travel later or undertook the discipline without a Sabarimala journey needs the accepted direction of the Guru Swami or Ayyappa temple. The named Puja route must make this distinction its central answer rather than silently declaring every personal vow complete.`,
        `सार्वजनिक ऋतु मंडल पूजा तक पहुँचती है — मंदिर-पंचांग के इकतालीस दिनों के बाद मंडल-काल अपने गम्भीर उत्सव तक पहुँचता है। सबरीमला और अन्य अय्यप्पा मंदिरों में विशेष पूजा पूरे काल की प्रार्थना, संयम और यात्रा-तैयारी को एकत्र करती है। जो भक्त यात्रा नहीं कर सकते वे भी स्थानीय मंदिर या घर में दीप, अय्यप्पा-नाम, भजन और कृतज्ञता के साथ इस दिन को स्मरण कर सकते हैं।

सबरीमला पहुँचे यात्रियों के लिए नेय्यभिषेकम् और पड़ी पूजा जैसे नामित अनुष्ठान मंदिर और यात्रा-क्रम के अंग हैं। पुरोहित, मंदिर-पंचांग और यात्री के गुरु स्वामी उन विधियों का संचालन करते हैं। गृह-पृष्ठ को उनका स्थान समझाना चाहिए, उन्हें अनिवार्य स्वयं-करें सूची नहीं बनाना चाहिए।

मंडल पूजा सार्वजनिक इकतालीस-दिवसीय अवधि को समाप्त करती है, पर इससे प्रत्येक व्यक्ति का व्रतम् अपने-आप पूरा नहीं हो जाता। आधिकारिक यात्रा-मार्गदर्शन माला उतारने को यात्रा की पूर्णता से जोड़ता है। जिसने बाद में आरम्भ किया, बाद में यात्रा करेगा या सबरीमला गए बिना अनुशासन लिया है, उसे गुरु स्वामी या अय्यप्पा मंदिर से मान्य दिशा चाहिए। पूजा के नामित पृष्ठ का मुख्य उत्तर यही भेद होना चाहिए, न कि प्रत्येक व्यक्तिगत व्रत को चुपचाप पूर्ण घोषित करना।`,
      ],
      [
        `Completion remains an act of guidance and gratitude — A pilgrim's return from Sabarimala is not simply the end of a diet. The mala, daily prayer and disciplined conduct have held the journey together. When the pilgrimage is complete, the devotee follows the Guru Swami or temple practice for prayer, mala removal and return to ordinary routines. Food is received with gratitude, and the lessons of restraint are not discarded with the outward sign.

The sacred eighteen steps express this completed approach to refuge. Irumudi-bearing pilgrims ascend them within the established temple order; the steps are not a general sightseeing goal or an achievement detached from the vow. Their meaning belongs to the prepared pilgrimage and its devotional humility.

Illness or another serious interruption also requires care. The calendar cannot pronounce spiritual failure or automatically restart a count. The devotee should protect health, continue prescribed medicine and ask the guiding temple or Guru Swami how the undertaken vow is to be completed or begun again. In this way Mandala Pooja remains a joyful public culmination while personal completion stays truthful to the actual journey, the received discipline and the devotee's conscious choice.`,
        `समापन मार्गदर्शन और कृतज्ञता का कर्म है — सबरीमला से यात्री की वापसी केवल आहार-नियम का अन्त नहीं। माला, नित्य प्रार्थना और संयमित आचरण ने यात्रा को एक सूत्र में रखा है। यात्रा पूर्ण होने पर भक्त प्रार्थना, माला उतारने और सामान्य दिनचर्या में लौटने के लिए गुरु स्वामी या मंदिर की विधि मानता है। भोजन कृतज्ञता से ग्रहण होता है और बाहरी चिह्न हटने के साथ संयम की सीख त्यागी नहीं जाती।

पवित्र अठारह सीढ़ियाँ शरण की ओर इस पूर्ण तैयारी को व्यक्त करती हैं। इरुमुडी धारण करने वाले यात्री स्थापित मंदिर-क्रम में उन्हें चढ़ते हैं; वे व्रत से अलग कोई सामान्य पर्यटन-लक्ष्य या उपलब्धि नहीं। उनका अर्थ तैयार यात्रा और उसकी भक्तिपूर्ण विनम्रता में है।

बीमारी या किसी गम्भीर बाधा में भी सावधानी आवश्यक है। पंचांग आध्यात्मिक असफलता घोषित नहीं कर सकता और गिनती अपने-आप पुनः आरम्भ नहीं कर सकता। भक्त स्वास्थ्य की रक्षा करे, निर्धारित दवा जारी रखे और लिए हुए व्रत को पूरा या फिर आरम्भ करने की विधि मार्गदर्शक मंदिर या गुरु स्वामी से पूछे। इस प्रकार मंडल पूजा आनन्दपूर्ण सार्वजनिक पूर्णता बनी रहती है, जबकि व्यक्तिगत समापन वास्तविक यात्रा, प्राप्त अनुशासन और भक्त की सचेत इच्छा के प्रति सत्य रहता है।`,
      ],
    ],
    regional: [["Sabarimala receives the largest gathering; book travel and follow official temple advisories.", "सबरीमला पर सबसे बड़ा समागम; यात्रा की व्यवस्था करें और मंदिर की आधिकारिक सूचनाएँ मानें।"], ["Local Ayyappa temples hold Mandala Pooja for devotees who cannot travel.", "स्थानीय अय्यप्पा मंदिर यात्रा न कर सकने वाले भक्तों के लिए मंडल पूजा कराते हैं।"]],
    paran: ["Remove mala and break the vow only per Guru Swami after your pilgrimage — not automatically on this public date.", "माला उतारें और व्रत खोलें केवल यात्रा के बाद गुरु स्वामी के अनुसार — इस सार्वजनिक तिथि पर अपने-आप नहीं।"],
    udyapan: ["Accepted completion depends on pilgrimage and tradition; illness may require restarting under Guru guidance.", "मान्य समापन यात्रा और परंपरा पर निर्भर; बीमारी में गुरु-मार्गदर्शन में पुनः आरम्भ हो सकता है।"],
    safety: ["Prepare physically for Sabarimala climbs, carry medicines, rest when needed and use medical centres on the hill. Do not stop prescribed medicine for the vrata.", "सबरीमला चढ़ाई के लिए शारीरिक तैयारी करें, दवाएँ साथ रखें, आवश्यकता पर विश्राम करें और पहाड़ी चिकित्सा-केंद्र का उपयोग करें। व्रत के कारण निर्धारित दवा बंद न करें।"],
  }),
};
