/* Shodasha varga catalog + special chart themes (SPLIT-UI-CHART-01c). */

/* ---------------- shodasavarga: the 16 divisional charts ---------------- */
const VARGAS = [
  { k: "D1", name: "Rasi", theme: "body, self & life as a whole" },
  { k: "D2", name: "Hora", theme: "wealth & sustenance" },
  { k: "D3", name: "Drekkana", theme: "siblings, courage & effort" },
  { k: "D4", name: "Chaturthamsa", theme: "property, home & fortune" },
  { k: "D5", name: "Panchamsa", theme: "power, authority & fame" },
  { k: "D6", name: "Shashthamsa", theme: "health & disease" },
  { k: "D7", name: "Saptamsa", theme: "children & creative legacy" },
  { k: "D8", name: "Ashtamsa", theme: "longevity & sudden events" },
  { k: "D9", name: "Navamsa", theme: "marriage, dharma & inner strength" },
  { k: "D10", name: "Dasamsa", theme: "career & public standing" },
  { k: "D11", name: "Rudramsa", theme: "strife, destruction & hard-won gains" },
  { k: "D12", name: "Dwadasamsa", theme: "parents & lineage" },
  { k: "D16", name: "Shodasamsa", theme: "vehicles, comforts & happiness" },
  { k: "D20", name: "Vimsamsa", theme: "spiritual practice & devotion" },
  { k: "D24", name: "Siddhamsa", theme: "education & learning" },
  { k: "D27", name: "Bhamsa", theme: "strengths & weaknesses" },
  { k: "D30", name: "Trimsamsa", theme: "adversity & hidden trials" },
  { k: "D40", name: "Khavedamsa", theme: "auspicious & inauspicious habits" },
  { k: "D45", name: "Akshavedamsa", theme: "character & conduct" },
  { k: "D60", name: "Shashtiamsa", theme: "past karma & the soul's record" },
];

/* Reference charts: same D1/D9 positions, seen from a different lagna */
const SPECIAL_CHARTS = [
  { k: "MOON", name: "Chandra Kundli", theme: "the mind's vantage — houses counted from the Moon" },
  { k: "SUN", name: "Surya Kundli", theme: "the soul's vantage — houses counted from the Sun" },
  { k: "KARAK", name: "Karakamsa", theme: "Jaimini swamsa — the navamsa seen from the Atmakaraka" },
];

export { VARGAS, SPECIAL_CHARTS };
