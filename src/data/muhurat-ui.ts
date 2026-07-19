/* Muhurat / Daily UI catalogs (SPLIT-UI-03g-data). */

const MUH_CATS = [
  { key: "wedding", hi: "विवाह", en: "Wedding" },
  { key: "housewarming", hi: "गृह प्रवेश", en: "Housewarming" },
  { key: "vehicle", hi: "वाहन", en: "Vehicle" },
  { key: "property", hi: "सम्पत्ति", en: "Property" },
  { key: "mundan", hi: "मुंडन", en: "Mundan" },
  { key: "naming", hi: "नामकरण", en: "Naming" },
  { key: "venture", hi: "व्यापार", en: "Business" },
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

export { MUH_CATS, EVENTS, PANCHAKA_NAME, PANCHAKA_SHORT, PANCHAKA_GLOSS };
