export const UTILITY_CALCULATORS = [
  { slug: "rashi", group: "vedic", en: "Moon sign (Rashi)", hi: "चन्द्र राशि", blurbEn: "Your sidereal Moon sign and emotional orientation.", blurbHi: "आपकी चन्द्र राशि और मन की सहज प्रवृत्ति।" },
  { slug: "sun-sign", group: "vedic", en: "Vedic Sun sign", hi: "वैदिक सूर्य राशि", blurbEn: "Your sidereal Sun sign using Lahiri ayanamsa.", blurbHi: "लाहिरी अयनांश से आपकी वैदिक सूर्य राशि।" },
  { slug: "lagna", group: "vedic", en: "Ascendant (Lagna)", hi: "लग्न", blurbEn: "The sign rising at your birth place and time.", blurbHi: "जन्म-स्थान और समय पर उदित राशि।" },
  { slug: "nakshatra", group: "vedic", en: "Birth Nakshatra", hi: "जन्म नक्षत्र", blurbEn: "Your Moon's nakshatra, pada and naming sounds.", blurbHi: "चन्द्र का नक्षत्र, चरण और नामाक्षर।" },
  { slug: "baby-name", group: "vedic", en: "Baby-name initials", hi: "शिशु नामाक्षर", blurbEn: "Traditional starting sounds from birth nakshatra and pada.", blurbHi: "जन्म नक्षत्र और चरण से पारम्परिक नामाक्षर।" },
  { slug: "mangal-dosha", group: "vedic", en: "Mangal Dosha", hi: "मंगल दोष", blurbEn: "Three-reference analysis from Lagna, Moon and Venus.", blurbHi: "लग्न, चन्द्र और शुक्र से त्रि-सन्दर्भ विश्लेषण।" },
  { slug: "kala-sarpa", group: "vedic", en: "Kala Sarpa pattern", hi: "काल सर्प योग", blurbEn: "A transparent node-axis geometry check with caveats.", blurbHi: "राहु-केतु अक्ष की स्पष्ट ज्यामितीय जाँच।" },
  { slug: "sade-sati", group: "vedic", en: "Sade Sati", hi: "साढ़ेसाती", blurbEn: "Checks Saturn against your natal Moon sign for a chosen date.", blurbHi: "चुनी तिथि पर जन्म चन्द्र राशि से शनि की स्थिति।" },
  { slug: "shraddha-tithi", group: "vedic", en: "Shraddha Tithi", hi: "श्राद्ध तिथि", blurbEn: "Records the lunar tithi and paksha at the time of death.", blurbHi: "देहावसान समय की तिथि और पक्ष।" },
  { slug: "pancha-pakshi", group: "vedic", en: "Pancha Pakshi", hi: "पञ्च पक्षी", blurbEn: "Birth bird from nakshatra and lunar fortnight.", blurbHi: "नक्षत्र और पक्ष से जन्म-पक्षी।" },
  { slug: "western-natal", group: "western", en: "Western natal chart", hi: "पाश्चात्य जन्म-कुंडली", blurbEn: "Tropical Big Three and major aspects—separate from Vedic settings.", blurbHi: "सायन बिग थ्री और प्रमुख दृष्टियाँ—वैदिक पद्धति से अलग।" },
  { slug: "western-relationship", group: "western", en: "Western relationship", hi: "पाश्चात्य सम्बन्ध", blurbEn: "Synastry contacts and a midpoint composite for two people.", blurbHi: "दो व्यक्तियों के सिनैस्ट्री सम्बन्ध और मध्य-बिन्दु कम्पोज़िट।" },
] as const;

export const NAMING_SYLLABLES = [
  ["Chu","Che","Cho","La"],["Li","Lu","Le","Lo"],["A","I","U","E"],["O","Va","Vi","Vu"],
  ["Ve","Vo","Ka","Ki"],["Ku","Gha","Na","Chha"],["Ke","Ko","Ha","Hi"],["Hu","He","Ho","Da"],
  ["Di","Du","De","Do"],["Ma","Mi","Mu","Me"],["Mo","Ta","Ti","Tu"],["Te","To","Pa","Pi"],
  ["Pu","Sha","Na","Tha"],["Pe","Po","Ra","Ri"],["Ru","Re","Ro","Ta"],["Ti","Tu","Te","To"],
  ["Na","Ni","Nu","Ne"],["No","Ya","Yi","Yu"],["Ye","Yo","Bha","Bhi"],["Bhu","Dha","Pha","Dha"],
  ["Bhe","Bho","Ja","Ji"],["Ju","Je","Jo","Gha"],["Ga","Gi","Gu","Ge"],["Go","Sa","Si","Su"],
  ["Se","So","Da","Di"],["Du","Tha","Jha","Na"],["De","Do","Cha","Chi"],
] as const;

export const EXCLUDED_CALCULATOR_FAMILIES = [
  "numerology", "birthstone", "chinese-zodiac", "western-transit", "western-progression",
  "vastu", "feng-shui", "gemstone", "rudraksha",
] as const;

export function utilityFromPath(pathname: string) {
  if (pathname === "/calculators" || pathname === "/calculators/") return { kind: "catalogue" as const };
  const match = pathname.match(/^\/calculator\/([a-z-]+)\/?$/);
  const calculator = match && UTILITY_CALCULATORS.find((item) => item.slug === match[1]);
  if (calculator) return { kind: "calculator" as const, calculator };
  // Any other path inside the /calculator(s) namespace is an unknown or unsupported
  // calculator: an excluded family (numerology, gemstone…), a typo (rashii), wrong
  // case (RASHI), a stray /calculators/foo, or bare /calculator/. Return a not-found
  // route so the screen shows a graceful state — never let Daily render silently
  // under an invalid calculator URL. Paths outside this namespace still return null.
  if (/^\/calculators?(\/|$)/.test(pathname)) return { kind: "notfound" as const, requested: pathname };
  return null;
}
