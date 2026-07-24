// Answer-first life-interpretation copy for the Chart screen.
// Bilingual, sourced to Brihat Parashara Hora Shastra + Phaladeepika, written as
// ATTRIBUTION ("Classical texts associate…"), never as a second-person verdict.
// Index order matches NAKSHATRAS / SIGNS in src/engine/panchang.ts.
// Supersedes the old NAK_NOTE / SIGN_NOTE one-liners in ChartScreen.

type Bi = { en: string; hi: string };
type Status = "sourced" | "owner-verified";
export type NakTrait = { nature: Bi; strengths: Bi; source: string; status: Status };
export type SignTrait = { mind: Bi; relating: Bi; work: Bi; outward: Bi; source: string; status: Status };

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
];

// 12 entries, index 0 = Aries/Mesha … 11 = Pisces/Meena.
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
];
