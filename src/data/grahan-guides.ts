// Bilingual household guides for solar and lunar grahan pages.
// Sources: Drik Panchang grahan/sutak pages; plans/research (2026-07-24).

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

export const GRAHAN_GUIDES = {
  suryaGrahan: guide({
    verdict: ["On the day of this solar grahan, if it is visible at your city Sutak applies from twelve hours before the eclipse until it ends — avoid new puja, cooking and eating during Sutak unless your lineage permits exceptions for children, the ill or essential medicine.", "इस सूर्य ग्रहण के दिन, यदि आपके शहर में दिखाई दे तो ग्रहण से बारह घंटे पहले से समाप्ति तक सूतक लगता है — सूतक में नया पूजन, खाना बनाना और भोजन त्यागें, जब तक परंपरा बच्चों, रोगियों या आवश्यक दवा के लिए अपवाद न दे।"],
    meaning: ["Surya grahan occurs when the Moon covers the Sun at syzygy near Rahu or Ketu. Households pause auspicious beginnings and turn to mantra, charity and inner prayer until Moksha (the eclipse release).", "सूर्य ग्रहण तब होता है जब अमावस्या पर चंद्रमा सूर्य को ढकता है और राहु/केतु के निकट होता है। घर शुभ आरम्भ रोककर मंत्र, दान और भजन करते हैं जब तक मोक्ष (ग्रहण समाप्ति) न हो।"],
    vidhi: [["First read the local visibility verdict and the displayed contact, maximum and Moksha times for your city.", "पहले अपने शहर की स्थानीय दृश्यता और दिखाए गए स्पर्श, मध्य तथा मोक्ष समय पढ़ें।"], ["When visible, observe Sutak from the stated start until Moksha.", "दृश्य होने पर बताए समय से मोक्ष तक सूतक मानें।"], ["Chant your ishta mantra or Gayatri; avoid starting new vrata or temple ceremonies.", "अपने इष्ट मंत्र या गायत्री का जप करें; नया व्रत या मंदिर संस्कार आरम्भ न करें।"], ["After Moksha, bathe, clean the kitchen if your custom requires, and resume normal worship.", "मोक्ष के बाद स्नान करें, आवश्यकता हो तो रसोई शुद्ध करें और सामान्य पूजा पुनः आरम्भ करें।"]],
    diet: ["No cooked food during Sutak for most North Indian households; keep only what was prepared before Sutak began. Fruit or medicine when needed are commonly allowed with lineage guidance.", "अधिकांश उत्तर भारतीय घरों में सूतक में पकाया भोजन नहीं; केवल सूतक से पहले बना भोजन रखें। आवश्यकता पर फल या दवा परंपरा से अनुमत।"],
    sankalpa: ["“During this solar grahan I seek Surya's grace and turn inward until the shadow passes.”", "“इस सूर्य ग्रहण में मैं सूर्य की कृपा चाहता/चाहती हूँ और छाया गुजरने तक अंतर्मुख रहूँगा/रहूँगी।”"],
    puja: ["Temple abhishekam and new sankalpa are postponed. Home japa at the altar is appropriate.", "मंदिर अभिषेक और नया संकल्प स्थगित। घर की वेदी पर जप उचित।"],
    stories: [
      [
        `Rahu, the nectar and the Sun — In the Puranic account of the ocean's churning, devas and asuras labour together for amrita, the nectar of immortality. When Mohini distributes it, the asura Svarbhanu enters the line in disguise and sits between Surya and Chandra. The Sun and Moon recognize him and alert Vishnu. The discus separates his head before the nectar has passed through his whole body.

Because the nectar has touched him, the head continues as Rahu and the body as Ketu. The story says Rahu pursues the Sun and Moon, and an eclipse is remembered as his temporary grasp. Yet the luminary becomes visible again. The account gives devotees a language for vigilance, mantra and the return of light; it is a sacred narrative, not the physical astronomy calculation.

Astronomically, a solar eclipse occurs at new Moon when the Moon passes between Earth and the Sun close enough to a lunar node for its shadow to cross Earth. The node names Rahu and Ketu connect the calculated geometry with the devotional story without requiring anyone to confuse the two explanations. Local visibility determines whether a household applies its Sutak practice.`,
        `राहु, अमृत और सूर्य — पुराणों की समुद्र-मंथन कथा में देव और असुर अमरता के अमृत के लिए साथ परिश्रम करते हैं। मोहिनी जब अमृत बाँटती हैं, तब स्वरभानु नामक असुर वेश बदलकर पंक्ति में प्रवेश करता है और सूर्य तथा चन्द्र के बीच बैठ जाता है। सूर्य और चन्द्र उसे पहचानकर विष्णु को संकेत देते हैं। अमृत उसके पूरे शरीर में उतरने से पहले चक्र उसके सिर और धड़ को अलग कर देता है।

अमृत का स्पर्श हो जाने के कारण सिर राहु और धड़ केतु के रूप में बने रहते हैं। कथा कहती है कि राहु सूर्य और चन्द्र का पीछा करता है और ग्रहण उसकी क्षणिक पकड़ के रूप में स्मरण होता है। फिर भी ज्योति दोबारा दिखाई देती है। यह आख्यान भक्तों को जागरण, मंत्र-जप और प्रकाश की वापसी की भाषा देता है; यह पवित्र कथा है, भौतिक खगोल-गणना नहीं।

खगोल की दृष्टि से सूर्य ग्रहण अमावस्या पर तब होता है जब चन्द्रमा पृथ्वी और सूर्य के बीच, चन्द्र-पात के पर्याप्त निकट से गुजरता है और उसकी छाया पृथ्वी पर पड़ती है। राहु और केतु के नाम गणितीय ज्यामिति को भक्तिपरक कथा से जोड़ते हैं, दोनों व्याख्याओं को एक मानने की आवश्यकता नहीं। स्थानीय दृश्यता से तय होता है कि परिवार अपनी सूतक-परम्परा लागू करता है या नहीं।`,
      ],
      [
        `Prayer while daylight changes — A visible solar eclipse makes familiar daylight alter in a short and unmistakable way. Hindu households that observe Sutak pause cooking, meals and auspicious beginnings for the locally applicable interval. The pause is used for japa, quiet recitation, remembrance of Surya and inward prayer. Children, people who are ill and anyone needing medicine follow the compassionate exceptions taught in their family or lineage.

At Moksha, the solar disc is free of the Moon's cover. Families may bathe, clean the worship or cooking area as customary, offer water or prayer to Surya and prepare fresh food. These actions mark ritual resumption; they are not claims that eclipse light has medically contaminated a person or meal.

Eye safety is a separate physical rule. Looking directly at the uneclipsed or partly eclipsed Sun can injure the retina without immediate pain. Devotional confidence, ordinary sunglasses, exposed film and reflected water do not make direct viewing safe. Use certified eclipse viewers or an indirect projection method and supervise children. Pregnancy customs, food restrictions and Sutak belong to religious tradition; eye protection rests on the physical danger of concentrated sunlight and applies to every viewer.`,
        `बदलते दिन के प्रकाश में प्रार्थना — दिखाई देने वाले सूर्य ग्रहण में परिचित दिन का उजाला थोड़े समय में स्पष्ट रूप से बदलता है। सूतक मानने वाले हिन्दू घर स्थानीय रूप से लागू अवधि में पाक, भोजन और शुभ आरम्भ रोकते हैं। इस विराम का उपयोग जप, शान्त पाठ, सूर्य-स्मरण और अन्तर्मुख प्रार्थना के लिए होता है। बच्चे, रोगी और आवश्यक दवा लेने वाले व्यक्ति अपने परिवार या परम्परा में बताए करुणामय अपवाद मानते हैं।

मोक्ष पर सूर्य का मण्डल चन्द्रमा के आवरण से मुक्त हो जाता है। परिवार परम्परानुसार स्नान, पूजा या पाक-स्थान की सफाई, सूर्य को जल या प्रार्थना और ताजा भोजन की तैयारी कर सकते हैं। ये कर्म धार्मिक दिनचर्या फिर आरम्भ होने का चिह्न हैं; वे यह चिकित्सकीय दावा नहीं कि ग्रहण का प्रकाश व्यक्ति या भोजन को दूषित करता है।

नेत्र-सुरक्षा अलग भौतिक नियम है। खुले या आंशिक रूप से ढके सूर्य को सीधे देखने से बिना तत्काल पीड़ा के दृष्टिपटल को चोट लग सकती है। भक्ति, साधारण धूप-चश्मा, खुली फिल्म या जल में प्रतिबिम्ब सीधे दर्शन को सुरक्षित नहीं बनाते। प्रमाणित ग्रहण-दर्शक या अप्रत्यक्ष प्रक्षेपण विधि अपनाएँ और बच्चों की निगरानी करें। गर्भावस्था की रीतियाँ, आहार-वर्जन और सूतक धार्मिक परम्परा के विषय हैं; नेत्र-सुरक्षा तीव्र सूर्य-प्रकाश के भौतिक खतरे पर आधारित है और प्रत्येक दर्शक पर लागू होती है।`,
      ],
    ],
    regional: [["South Indian households may follow local temple announcements for abhishekam timing.", "दक्षिण भारतीय घर स्थानीय मंदिर की घोषणा मान सकते हैं।"], ["Where the eclipse is not visible, many traditions do not apply the same Sutak rule; use the local visibility verdict and the practice received in your household.", "जहाँ ग्रहण दिखाई न दे वहाँ अनेक परम्पराएँ वही सूतक-नियम लागू नहीं करतीं; स्थानीय दृश्यता और अपने घर में प्राप्त रीति मानें।"]],
    paran: ["Resume eating and cooking after Moksha and bath according to family rule.", "मोक्ष और स्नान के बाद परिवार नियम से भोजन और पाक पुनः आरम्भ करें।"],
    udyapan: ["No separate udyapan — return to the daily calendar after Moksha.", "अलग उद्यापन नहीं — मोक्ष के बाद दैनिक पंचांग पर लौटें।"],
    safety: ["Do not look at the Sun without certified eclipse glasses or projection methods.", "प्रमाणित ग्रहण चश्मे या प्रक्षेपण विधि के बिना सूर्य न देखें।"],
  }),
  chandraGrahan: guide({
    verdict: ["On the night of this lunar grahan, if it is visible at your city Sutak usually begins nine hours before the eclipse and ends at Moksha — avoid eating and starting new sacred work during Sutak unless your lineage allows exceptions.", "इस चंद्र ग्रहण की रात्रि, यदि आपके शहर में दिखे तो सूतक प्रायः नौ घंटे पहले से मोक्ष तक रहता है — सूतक में भोजन और नया पवित्र कार्य त्यागें, जब तक परंपरा अपवाद न दे।"],
    meaning: ["Chandra grahan is Earth's shadow on the full Moon when syzygy falls near the nodes. Devotees chant, meditate and offer silent prayer until the Moon is released.", "चंद्र ग्रहण पूर्णिमा पर पृथ्वी की छाया है जब संयोग नोड के निकट हो। भक्त जप, ध्यान और प्रार्थना करते हैं जब तक चंद्रमा मुक्त न हो।"],
    vidhi: [["Confirm local visibility on this page for your city.", "अपने शहर के लिए स्थानीय दृश्यता इस पृष्ठ पर देखें।"], ["Observe the stated Sutak window when the eclipse is visible.", "दृश्य होने पर बताया सूतक-समय मानें।"], ["Chant Chandra or Devi mantras; postpone new initiations.", "चंद्र या देवी मंत्र जपें; नई दीक्षा स्थगित रखें।"], ["After Moksha, bathe and offer simple arghya or prasad if your custom includes it.", "मोक्ष के बाद स्नान करें और परंपरा हो तो सरल अर्घ्य या प्रसाद दें।"]],
    diet: ["Avoid meals during Sutak when the grahan is visible; food prepared earlier may be kept per household rule.", "दृश्य ग्रहण में सूतक के दौरान भोजन त्यागें; पहले का भोजन परंपरानुसार रखा जा सकता है।"],
    sankalpa: ["“May Chandra's cool light return; I keep vigil with mantra until Moksha.”", "“चंद्र की शीतल किरण लौटे; मोक्ष तक मंत्र के साथ जागरूक रहूँगा/रहूँगी।”"],
    puja: ["Home altar japa is favoured; large public yajna may be rescheduled by the temple.", "घर की वेदी पर जप प्रधान; बड़े यज्ञ मंदिर द्वारा पुनर्निर्धारित हो सकते हैं।"],
    stories: [
      [
        `Rahu's grasp and Chandra's return — The same ocean-churning narrative that explains Rahu's pursuit of Surya also names Chandra as the one who recognizes Svarbhanu in the line for nectar. After Vishnu's discus separates the disguised asura, Rahu remembers both luminaries and periodically reaches toward them. In a lunar grahan, devotees describe the darkened Moon as passing through Rahu's grasp.

The story does not end with permanent loss. Chandra emerges and the full disc returns, so the vigil holds together shadow and renewal. Devotees repeat Chandra, Shiva, Devi or an ishta mantra according to their tradition, using the unusual night for concentrated remembrance rather than fear.

Astronomically, the event occurs at full Moon when Earth lies between Sun and Moon and the Moon moves through Earth's shadow near a lunar node. The reddish colour of a total eclipse comes from sunlight filtered and bent through Earth's atmosphere, not from injury to the Moon. The devotional node names and the geometry can be stated side by side: one carries sacred memory and ritual meaning, while the other explains the visible shadow and local contact times.`,
        `राहु की पकड़ और चन्द्र की वापसी — राहु द्वारा सूर्य का पीछा करने वाली समुद्र-मंथन कथा चन्द्र को भी अमृत की पंक्ति में बैठे स्वरभानु को पहचानने वाला बताती है। विष्णु का चक्र वेशधारी असुर को अलग करता है, उसके बाद राहु दोनों ज्योतियों को याद रखता है और समय-समय पर उनकी ओर बढ़ता है। चन्द्र ग्रहण में भक्त अन्धकारमय चन्द्रमा को राहु की पकड़ से गुजरता हुआ कहते हैं।

कथा स्थायी हानि पर समाप्त नहीं होती। चन्द्र बाहर आते हैं और पूर्ण मण्डल फिर दिखाई देता है, इसलिए रात्रि-जागरण छाया और नवीकरण दोनों को साथ रखता है। भक्त अपनी परम्परा के अनुसार चन्द्र, शिव, देवी या इष्ट-मंत्र का जप करते हैं और इस असाधारण रात को भय के स्थान पर एकाग्र स्मरण में लगाते हैं।

खगोल की दृष्टि से यह घटना पूर्णिमा पर होती है, जब पृथ्वी सूर्य और चन्द्रमा के बीच होती है और चन्द्रमा किसी चन्द्र-पात के निकट पृथ्वी की छाया से गुजरता है। पूर्ण ग्रहण का लाल रंग पृथ्वी के वायुमण्डल से छनकर मुड़े सूर्य-प्रकाश से आता है, चन्द्रमा की चोट से नहीं। भक्तिपरक पात-नाम और ज्यामिति साथ कही जा सकती हैं—एक पवित्र स्मृति और धार्मिक अर्थ देता है, दूसरा दिखाई देने वाली छाया तथा स्थानीय स्पर्श-समय समझाता है।`,
      ],
      [
        `A night vigil with a local ending — When a lunar eclipse is visible, the Moon can be watched safely with ordinary eyes, unlike the Sun. Families that observe Sutak use the stated local interval for japa and quiet worship and postpone meals or new auspicious ceremonies according to lineage. A Moon that rises after the eclipse has begun or sets before it ends may make only part of the event visible, so a city-specific verdict matters.

At Moksha, devotees may bathe and offer a simple arghya, prayer or charity before eating. Bengal households may include Chandipath, while Tamil and other temple communities announce their own abhishekam and reopening schedules. These are regional forms around the same visible event, not one compulsory pan-Indian liturgy.

Claims concerning pregnancy, knives, sleep or food are customary household rules, not established medical effects of moonlight or Earth's shadow. A guide should name them as tradition where relevant and must not frighten a pregnant reader with a prediction of harm. Needed meals, hydration and prescribed medicines remain health decisions. The religious practice can be kept with family guidance and compassionate accommodation, then completed when the locally displayed Moksha has actually occurred.`,
        `स्थानीय समापन वाला रात्रि-जागरण — चन्द्र ग्रहण दिखाई दे तो सूर्य के विपरीत चन्द्रमा को सामान्य आँखों से सुरक्षित देखा जा सकता है। सूतक मानने वाले परिवार अपनी परम्परा के अनुसार स्थानीय अवधि को जप और शान्त पूजा में लगाते हैं तथा भोजन या नए शुभ संस्कार स्थगित रखते हैं। ग्रहण आरम्भ होने के बाद उगता या समाप्ति से पहले अस्त होता चन्द्र केवल घटना का कुछ भाग दिखा सकता है, इसलिए शहर-विशेष का निर्णय महत्त्वपूर्ण है।

मोक्ष पर भक्त स्नान करके भोजन से पहले सरल अर्घ्य, प्रार्थना या दान कर सकते हैं। बंगाल के घर चंडीपाठ रख सकते हैं, जबकि तमिल और अन्य मंदिर-समुदाय अपने अभिषेक और पुनः खुलने का समय घोषित करते हैं। ये एक ही दृश्य घटना के क्षेत्रीय रूप हैं, कोई एक अनिवार्य अखिल-भारतीय विधि नहीं।

गर्भावस्था, चाकू, निद्रा या भोजन से जुड़े कथन पारिवारिक रीति हैं, चन्द्र-प्रकाश या पृथ्वी की छाया के स्थापित चिकित्सकीय प्रभाव नहीं। मार्गदर्शिका उन्हें जहाँ आवश्यक हो परम्परा कहे और गर्भवती पाठक को हानि की भविष्यवाणी से न डराए। आवश्यक भोजन, जल और निर्धारित दवा स्वास्थ्य के निर्णय बने रहते हैं। धार्मिक अभ्यास पारिवारिक मार्गदर्शन और करुणामय सुविधा के साथ रखा जा सकता है, फिर स्थानीय रूप से दिखाया मोक्ष वास्तव में होने पर पूरा किया जा सकता है।`,
      ],
    ],
    regional: [["Bengal and Tamil households may follow regional Chandipath or temple schedules.", "बंगाल और तमिल घर क्षेत्रीय चंडीपाठ या मंदिर समय मान सकते हैं।"], ["When the Moon sets before maximum eclipse, visibility may be partial; use the local contact times rather than a national schedule.", "यदि चन्द्रमा ग्रहण-मध्य से पहले अस्त हो तो दृश्यता आंशिक हो सकती है; राष्ट्रीय समय के स्थान पर स्थानीय स्पर्श-समय मानें।"]],
    paran: ["Eat after Moksha and bath when Sutak ends for your lineage.", "आपकी परंपरा में सूतक समाप्त होने पर मोक्ष और स्नान के बाद भोजन करें।"],
    udyapan: ["Return to normal lunar observances after Moksha.", "मोक्ष के बाद सामान्य चंद्र-अनुष्ठान पर लौटें।"],
  }),
};
