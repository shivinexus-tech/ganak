export const DEFAULT_CANONICAL_ORIGIN = "https://ganakapp.com";

const ROUTES = {
  daily: {
    en: ["Ganak Panchang — Today’s Tithi, Festivals and Muhurat", "Local Panchang, fasting days, festivals and auspicious timings with clear explanations."],
    hi: ["गणक पंचांग — आज की तिथि, पर्व और मुहूर्त", "स्थानीय पंचांग, व्रत, पर्व और शुभ समय—सरल व्याख्या सहित।"],
  },
  prashna: {
    en: ["Ganak Prashna — Vedic Horary Guidance", "Ask a question for the present moment and see a qualified answer before the technical chart."],
    hi: ["गणक प्रश्न — वैदिक प्रश्न मार्गदर्शन", "वर्तमान क्षण पर प्रश्न पूछें; तकनीकी कुंडली से पहले सरल, सीमित उत्तर देखें।"],
  },
  chart: {
    en: ["Ganak Jyotish — Vedic Birth Chart", "Cast a Lahiri Vedic birth chart with plain-language findings before technical detail."],
    hi: ["गणक ज्योतिष — वैदिक जन्म कुंडली", "लाहिरी वैदिक जन्म कुंडली बनाएँ; तकनीकी विवरण से पहले सरल निष्कर्ष पढ़ें।"],
  },
};

export function canonicalOrigin() {
  const configured = String(import.meta.env?.VITE_CANONICAL_ORIGIN || "").trim().replace(/\/+$/, "");
  try {
    return configured ? new URL(configured).origin : DEFAULT_CANONICAL_ORIGIN;
  } catch (e) {
    return DEFAULT_CANONICAL_ORIGIN;
  }
}

export function routeMetadata({ lang, mode, festival, utility, medical, muhurat }) {
  const l = lang === "hi" ? "hi" : "en";
  if (festival) {
    const label = festival.label?.[l] || festival.title?.[l] || festival.key;
    return {
      title: `${label} — ${l === "hi" ? "तिथि, समय और पूजा मार्गदर्शन" : "Date, Timing and Worship Guide"} | Ganak`,
      description: l === "hi" ? `${label} की स्थानीय तिथि, समय, व्रत और पूजा मार्गदर्शन।` : `Local date, timing, fasting and worship guidance for ${label}.`,
    };
  }
  if (utility) {
    if (utility.kind === "calculator" && utility.calculator) {
      const item = utility.calculator;
      const label = l === "hi" ? item.hi : item.en;
      const description = l === "hi" ? item.blurbHi : item.blurbEn;
      return { title: `${label} | Ganak`, description };
    }
    if (utility.kind === "notfound") {
      return {
        title: l === "hi" ? "कैलकुलेटर नहीं मिला | गणक" : "Calculator not found | Ganak",
        description: l === "hi" ? "यह कैलकुलेटर उपलब्ध नहीं है; गणक के समर्थित ज्योतिष कैलकुलेटर देखें।" : "This calculator is unavailable; browse Ganak’s supported astrology calculators.",
        canonicalPath: "/calculators",
      };
    }
    return {
      title: l === "hi" ? "ज्योतिष कैलकुलेटर | गणक" : "Astrology Calculators | Ganak",
      description: l === "hi" ? "स्पष्ट उत्तर और पारदर्शी गणना-विधि वाले वैदिक और पाश्चात्य ज्योतिष कैलकुलेटर।" : "Vedic and Western astrology calculators with plain-language answers and transparent methods.",
    };
  }
  if (medical) return { title: l === "hi" ? "चिकित्सा मुहूर्त सुरक्षा मार्गदर्शन | गणक" : "Medical Muhurat Safety Guidance | Ganak", description: l === "hi" ? "अत्यावश्यक चिकित्सा में विलम्ब न करें; केवल लचीली, चिकित्सक-अनुमोदित तारीख़ों हेतु सीमित मार्गदर्शन।" : "Never delay urgent care; limited guidance only for flexible dates approved by a clinician." };
  if (muhurat) {
    return { title: l === "hi" ? "शुभ मुहूर्त खोजें | गणक" : "Find a Shubh Muhurat | Ganak", description: l === "hi" ? "चुने कार्य, स्थान और अवधि के लिए शुभ दिन व स्पष्ट कारण।" : "Ranked auspicious dates and clear reasons for your activity, place and date range." };
  }
  const [title, description] = ROUTES[mode]?.[l] || ROUTES.daily[l];
  return { title, description };
}

export function applyRouteMetadata(meta) {
  if (typeof document === "undefined") return;
  document.documentElement.lang = meta.lang || "en";
  document.title = meta.title;
  const set = (selector, attr, value) => {
    let node = document.head.querySelector(selector);
    if (!node) {
      node = document.createElement(selector.startsWith("link") ? "link" : "meta");
      if (selector.includes("description")) node.setAttribute("name", "description");
      if (selector.includes("canonical")) node.setAttribute("rel", "canonical");
      if (selector.includes("og:title")) node.setAttribute("property", "og:title");
      if (selector.includes("og:description")) node.setAttribute("property", "og:description");
      if (selector.includes("og:url")) node.setAttribute("property", "og:url");
      document.head.appendChild(node);
    }
    node.setAttribute(attr, value);
  };
  const canonical = canonicalOrigin() + (meta.canonicalPath || meta.path || "/");
  set('meta[name="description"]', "content", meta.description);
  set('link[rel="canonical"]', "href", canonical);
  set('meta[property="og:title"]', "content", meta.title);
  set('meta[property="og:description"]', "content", meta.description);
  set('meta[property="og:url"]', "content", canonical);
}
