// Reusable and festival-specific aarti texts. Defined once, referenced by guides.
// Devanagari orthography follows plans/festival-aarti-standard.md §1. Sources: §6.
//
// Layout (owner-approved 2026-07-28): the full `refrain` shows once at the top in the
// accent colour; each stanza (ink) is followed by the short `cue` (accent) that marks
// the return to the refrain — the refrain is NOT repeated in full between verses.

type Bi = { en: string; hi: string };
export type Aarti = {
  title: Bi;
  intro: Bi;
  refrain: string;    // full refrain, shown once at top (accent colour)
  cue: string;        // short refrain cue after each stanza (accent colour), e.g. "जय गणेश …"
  stanzas: string[];  // verse stanzas (ink); each may be multi-line (\n-separated)
};

export const GANESH_AARTI: Aarti = {
  title: { en: "Ganesh Aarti — Jai Ganesh Deva", hi: "श्री गणेश जी की आरती — जय गणेश देवा" },
  intro: {
    en: "Sung first, to invoke Ganesha before the main worship.",
    hi: "मुख्य पूजा से पूर्व गणेश-आवाहन हेतु सबसे पहले गाई जाती है।",
  },
  refrain: "जय गणेश जय गणेश जय गणेश देवा।\nमाता जाकी पार्वती पिता महादेवा॥",
  cue: "जय गणेश …",
  stanzas: [
    "एकदन्त दयावन्त चार भुजाधारी।\nमाथे पर तिलक सोहे मूसे की सवारी॥",
    "पान चढ़े फूल चढ़े और चढ़े मेवा।\nलड्डुअन का भोग लगे सन्त करें सेवा॥",
    "अँधे को आँख देत कोढ़िन को काया।\nबाँझन को पुत्र देत निर्धन को माया॥",
    "दीनन की लाज राखो शम्भु सुतवारी।\nकामना को पूर्ण करो जग बलिहारी॥",
    "'सूर' श्याम शरण आए सफल कीजे सेवा।\nमाता जाकी पार्वती पिता महादेवा॥",
  ],
};

export const LAKSHMI_AARTI: Aarti = {
  title: { en: "Lakshmi Aarti — Om Jai Lakshmi Mata", hi: "श्री लक्ष्मी जी की आरती — ॐ जय लक्ष्मी माता" },
  intro: {
    en: "The Goddess Lakshmi's own aarti, at the heart of the Diwali puja.",
    hi: "दीपावली पूजा के केन्द्र में देवी लक्ष्मी की आरती।",
  },
  refrain: "ॐ जय लक्ष्मी माता, मैया जय लक्ष्मी माता।\nतुमको निशिदिन सेवत, हरि विष्णु विधाता॥",
  cue: "ॐ जय लक्ष्मी माता …",
  stanzas: [
    "उमा रमा ब्रह्माणी, तुम ही जग-माता।\nसूर्य-चन्द्रमा ध्यावत, नारद ऋषि गाता॥",
    "दुर्गा रूप निरंजनी, सुख सम्पत्ति दाता।\nजो कोई तुमको ध्यावत, ऋद्धि-सिद्धि धन पाता॥",
    "तुम पाताल-निवासिनि, तुम ही शुभदाता।\nकर्म-प्रभाव-प्रकाशिनी, भवनिधि की त्राता॥",
    "जिस घर में तुम रहतीं, सब सद्गुण आता।\nसब सम्भव हो जाता, मन नहीं घबराता॥",
    "तुम बिन यज्ञ न होते, वस्त्र न कोई पाता।\nखान-पान का वैभव, सब तुमसे आता॥",
    "शुभ-गुण मन्दिर सुन्दर, क्षीरोदधि-जाता।\nरत्न चतुर्दश तुम बिन, कोई नहीं पाता॥",
    "महालक्ष्मीजी की आरती, जो कोई जन गाता।\nउर आनन्द समाता, पाप उतर जाता॥",
  ],
};

export const OM_JAI_JAGDISH_HARE: Aarti = {
  title: { en: "Om Jai Jagdish Hare", hi: "ॐ जय जगदीश हरे" },
  intro: {
    en: "The universal Vishnu aarti that closes the worship.",
    hi: "पूजा का समापन करने वाली विष्णु की सर्वमान्य आरती।",
  },
  refrain: "ॐ जय जगदीश हरे, स्वामी जय जगदीश हरे।\nभक्त जनों के संकट, क्षण में दूर करे॥",
  cue: "ॐ जय जगदीश हरे …",
  stanzas: [
    "जो ध्यावे फल पावे, दुःख विनसे मन का।\nस्वामी दुःख विनसे मन का।\nसुख सम्पत्ति घर आवे, कष्ट मिटे तन का॥",
    "मात-पिता तुम मेरे, शरण गहूँ मैं किसकी।\nस्वामी शरण गहूँ मैं किसकी।\nतुम बिन और न दूजा, आस करूँ जिसकी॥",
    "तुम पूरण परमात्मा, तुम अन्तर्यामी।\nस्वामी तुम अन्तर्यामी।\nपारब्रह्म परमेश्वर, तुम सबके स्वामी॥",
    "तुम करुणा के सागर, तुम पालन-कर्ता।\nस्वामी तुम पालन-कर्ता।\nमैं मूरख खल कामी, कृपा करो भर्ता॥",
    "तुम हो एक अगोचर, सबके प्राणपति।\nस्वामी सबके प्राणपति।\nकिस विधि मिलूँ दयामय, तुमको मैं कुमति॥",
    "दीनबन्धु दुखहर्ता, तुम ठाकुर मेरे।\nस्वामी तुम ठाकुर मेरे।\nअपने हाथ उठाओ, द्वार पड़ा तेरे॥",
    "विषय-विकार मिटाओ, पाप हरो देवा।\nस्वामी पाप हरो देवा।\nश्रद्धा-भक्ति बढ़ाओ, सन्तन की सेवा॥",
    "श्री जगदीशजी की आरती, जो कोई नर गावे।\nस्वामी जो कोई नर गावे।\nकहत शिवानन्द स्वामी, सुख सम्पत्ति पावे॥",
  ],
};
