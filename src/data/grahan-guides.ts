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
    verdict: ["A solar grahan is in the sky today. If it is visible at your city, Sutak applies from twelve hours before the eclipse until it ends — avoid new puja, cooking and eating during Sutak unless your lineage permits exceptions for children, the ill or essential medicine.", "आज सूर्य ग्रहण है। यदि आपके शहर में दिखाई दे तो ग्रहण से बारह घंटे पहले से समाप्ति तक सूतक लगता है — सूतक में नया पूजन, खाना बनाना और भोजन त्यागें, जब तक परंपरा बच्चों, रोगियों या आवश्यक दवा के लिए अपवाद न दे।"],
    meaning: ["Surya grahan occurs when the Moon covers the Sun at syzygy near Rahu or Ketu. Households pause auspicious beginnings and turn to mantra, charity and inner prayer until Moksha (the eclipse release).", "सूर्य ग्रहण तब होता है जब अमावस्या पर चंद्रमा सूर्य को ढकता है और राहु/केतु के निकट होता है। घर शुभ आरम्भ रोककर मंत्र, दान और भजन करते हैं जब तक मोक्ष (ग्रहण समाप्ति) न हो।"],
    vidhi: [["Check whether the eclipse is visible at your selected city — Ganak shows this plainly.", "देखें कि ग्रहण आपके चुने शहर में दिखाई देता है या नहीं — गणक इसे स्पष्ट बताता है।"], ["When visible, observe Sutak from the stated start until Moksha.", "दृश्य होने पर बताए समय से मोक्ष तक सूतक मानें।"], ["Chant your ishta mantra or Gayatri; avoid starting new vrata or temple ceremonies.", "अपने इष्ट मंत्र या गायत्री का जप करें; नया व्रत या मंदिर संस्कार आरम्भ न करें।"], ["After Moksha, bathe, clean the kitchen if your custom requires, and resume normal worship.", "मोक्ष के बाद स्नान करें, आवश्यकता हो तो रसोई शुद्ध करें और सामान्य पूजा पुनः आरम्भ करें।"]],
    diet: ["No cooked food during Sutak for most North Indian households; keep only what was prepared before Sutak began. Fruit or medicine when needed are commonly allowed with lineage guidance.", "अधिकांश उत्तर भारतीय घरों में सूतक में पकाया भोजन नहीं; केवल सूतक से पहले बना भोजन रखें। आवश्यकता पर फल या दवा परंपरा से अनुमत।"],
    sankalpa: ["“During this solar grahan I seek Surya's grace and turn inward until the shadow passes.”", "“इस सूर्य ग्रहण में मैं सूर्य की कृपा चाहता/चाहती हूँ और छाया गुजरने तक अंतर्मुख रहूँगा/रहूँगी।”"],
    puja: ["Temple abhishekam and new sankalpa are postponed. Home japa at the altar is appropriate.", "मंदिर अभिषेक और नया संकल्प स्थगित। घर की वेदी पर जप उचित।"],
    stories: [["The churning of the ocean and Mohini's nectar teach that light returns after every eclipse.", "समुद्र मंथन और मोहिनी का अमृत सिखाता है कि हर ग्रहण के बाद प्रकाश लौटता है।"]],
    regional: [["South Indian households may follow local temple announcements for abhishekam timing.", "दक्षिण भारतीय घर स्थानीय मंदिर की घोषणा मान सकते हैं।"], ["If the eclipse is not visible at your place, many traditions relax Sutak — Ganak states visibility clearly.", "यदि ग्रहण आपके स्थान पर दिखाई न दे तो अनेक परंपराएँ सूतक में ढील देती हैं — गणक दृश्यता स्पष्ट बताता है।"]],
    paran: ["Resume eating and cooking after Moksha and bath according to family rule.", "मोक्ष और स्नान के बाद परिवार नियम से भोजन और पाक पुनः आरम्भ करें।"],
    udyapan: ["No separate udyapan — return to the daily calendar after Moksha.", "अलग उद्यापन नहीं — मोक्ष के बाद दैनिक पंचांग पर लौटें।"],
    safety: ["Do not look at the Sun without certified eclipse glasses or projection methods.", "प्रमाणित ग्रहण चश्मे या प्रक्षेपण विधि के बिना सूर्य न देखें।"],
  }),
  chandraGrahan: guide({
    verdict: ["A lunar grahan is tonight. If visible at your city, Sutak usually begins nine hours before the eclipse and ends at Moksha — avoid eating and starting new sacred work during Sutak unless your lineage allows exceptions.", "आज रात्रि चंद्र ग्रहण है। यदि आपके शहर में दिखे तो सूतक प्रायः नौ घंटे पहले से मोक्ष तक रहता है — सूतक में भोजन और नया पवित्र कार्य त्यागें, जब तक परंपरा अपवाद न दे।"],
    meaning: ["Chandra grahan is Earth's shadow on the full Moon when syzygy falls near the nodes. Devotees chant, meditate and offer silent prayer until the Moon is released.", "चंद्र ग्रहण पूर्णिमा पर पृथ्वी की छाया है जब संयोग नोड के निकट हो। भक्त जप, ध्यान और प्रार्थना करते हैं जब तक चंद्रमा मुक्त न हो।"],
    vidhi: [["Confirm local visibility on this page for your city.", "अपने शहर के लिए स्थानीय दृश्यता इस पृष्ठ पर देखें।"], ["Observe the stated Sutak window when the eclipse is visible.", "दृश्य होने पर बताया सूतक-समय मानें।"], ["Chant Chandra or Devi mantras; postpone new initiations.", "चंद्र या देवी मंत्र जपें; नई दीक्षा स्थगित रखें।"], ["After Moksha, bathe and offer simple arghya or prasad if your custom includes it.", "मोक्ष के बाद स्नान करें और परंपरा हो तो सरल अर्घ्य या प्रसाद दें।"]],
    diet: ["Avoid meals during Sutak when the grahan is visible; food prepared earlier may be kept per household rule.", "दृश्य ग्रहण में सूतक के दौरान भोजन त्यागें; पहले का भोजन परंपरानुसार रखा जा सकता है।"],
    sankalpa: ["“May Chandra's cool light return; I keep vigil with mantra until Moksha.”", "“चंद्र की शीतल किरण लौटे; मोक्ष तक मंत्र के साथ जागरूक रहूँगा/रहूँगी।”"],
    puja: ["Home altar japa is favoured; large public yajna may be rescheduled by the temple.", "घर की वेदी पर जप प्रधान; बड़े यज्ञ मंदिर द्वारा पुनर्निर्धारित हो सकते हैं।"],
    stories: [["The Moon's renewal after Rahu's grasp reminds devotees that no shadow is permanent.", "राहु की पकड़ के बाद चंद्र का नवीनीकरण भक्तों को सिखाता है कि कोई छाया स्थायी नहीं।"]],
    regional: [["Bengal and Tamil households may follow regional Chandipath or temple schedules.", "बंगाल और तमिल घर क्षेत्रीय चंडीपाठ या मंदिर समय मान सकते हैं।"], ["When the Moon sets before maximum eclipse, visibility may be partial — follow the page verdict.", "यदि चंद्रमा अधिकतम ग्रहण से पहले अस्त हो तो दृश्यता आंशिक हो सकती है — पृष्ठ का निर्णय मानें।"]],
    paran: ["Eat after Moksha and bath when Sutak ends for your lineage.", "आपकी परंपरा में सूतक समाप्त होने पर मोक्ष और स्नान के बाद भोजन करें।"],
    udyapan: ["Return to normal lunar observances after Moksha.", "मोक्ष के बाद सामान्य चंद्र-अनुष्ठान पर लौटें।"],
  }),
};
