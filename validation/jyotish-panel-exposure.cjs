#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const shell = fs.readFileSync(path.join(root, "src/kundli-app.tsx"), "utf8");
const screen = fs.readFileSync(path.join(root, "src/screens/ChartScreen.tsx"), "utf8");
const nav = fs.readFileSync(path.join(root, "src/components/JyotishPanelNav.tsx"), "utf8");
const localizedFiles = {
  chart: fs.readFileSync(path.join(root, "src/screens/ChartScreen.tsx"), "utf8"),
  matching: fs.readFileSync(path.join(root, "src/screens/MatchingScreen.tsx"), "utf8"),
  rectify: fs.readFileSync(path.join(root, "src/screens/RectifyScreen.tsx"), "utf8"),
  bnn: fs.readFileSync(path.join(root, "src/screens/JyotishBnnScreen.tsx"), "utf8"),
  dasha: fs.readFileSync(path.join(root, "src/components/DashaTree.tsx"), "utf8"),
};

function assert(ok, message) {
  if (!ok) throw new Error(`Jyotish exposure gate failed: ${message}`);
}

assert(shell.includes('v === "prashna" || v === "daily" || v === "chart"'), "direct ?screen=chart URLs must survive reload");
assert(shell.includes('["chart", lang === "hi" ? "ज्योतिष" : "Jyotish"]'), "Jyotish must be visible in the primary navigation in both languages");
assert(shell.includes('mode === "chart"'), "the shell must render ChartScreen");
assert(screen.includes("<JyotishPanelNav lang={lang} C={C} />"), "ChartScreen must use the grouped Jyotish navigation");
assert(screen.includes('lang === "hi" ? deva : en'), "section headings must follow the selected language instead of rendering both");

const groups = ["kundli", "dashas", "matching", "tools", "vault"];
for (const group of groups) {
  assert(nav.includes(`key: "${group}"`), `missing ${group} navigation group`);
}

const anchors = [
  "summary", "chart", "planets", "yogas", "karakas", "special", "chalit", "av",
  "arudha", "reading", "dasha", "bnn", "bhrigu", "match", "kp", "ksig",
  "shadbala", "rectify", "vault",
];
for (const id of anchors) {
  assert(nav.includes(`"#${id}"`), `navigation omits #${id}`);
  assert(screen.includes(`id="${id}"`), `ChartScreen has no #${id} destination`);
}

assert(nav.includes("minHeight: T.ctrlH"), "navigation controls must use the 42px design-system control token");
assert(nav.includes("borderRadius: T.rMd"), "navigation controls must use the shared medium-radius token");
assert(!nav.includes("localStorage") && !nav.includes("sessionStorage"), "browser storage is forbidden");

const hindiInventory = {
  chart: ["भावों की गणना यहाँ से", "हर नक्षत्र", "भाव-संधि उप-स्वामी", "अभी चल रहा क्रम", "आत्मचिंतन"],
  matching: ["कुंडलियों का मिलान करें", "अष्टकूट गुण मिलान", "मांगलिक दोष", "दोनों व्यक्तियों"],
  rectify: ["जन्म समय को आगे-पीछे", "जीवन-घटना आधार", "समय परीक्षण", "कई स्वतंत्र घटनाओं"],
  bnn: ["दिशा समूह", "गुरु गोचर", "परंपरा इसे कैसे पढ़ती है", "भृगु चक्र", "गुरु प्रगति"],
  dasha: ["अभी", "अंतर", "प्रत्यंतर", "सूक्ष्म", "प्राण"],
};

function auditHindi(files) {
  const failures = [];
  for (const [name, markers] of Object.entries(hindiInventory)) {
    const source = files[name] || "";
    if (!/lang\s*===\s*"hi"|const hi\s*=\s*lang\s*===\s*"hi"/.test(source)) {
      failures.push(`${name} has no Hindi language branch`);
    }
    for (const marker of markers) {
      if (!source.includes(marker)) failures.push(`${name} is missing Hindi copy marker “${marker}”`);
    }
  }
  const langWiring = [
    '<MatchMaker C={C} card={card} computeKundli={computeKundli} lang={lang} />',
    '<RectifyModule form={chartContext?.form || form} place={chartContext?.place || place} ayanamsa={chartContext?.ayanamsa || ayanamsa} C={C} card={card} lang={lang} />',
    '<BNNModule bnn={r.bnn} rows={r.rows} tz={r.tz} C={C} card={card} lang={lang} />',
    '<BhriguModule rows={r.rows} ascSign={r.ascSign} birthMs={r.birthMs} tz={r.tz} C={C} card={card} lang={lang} />',
    'tz={r.tz} lang={lang}',
  ];
  for (const wire of langWiring) {
    if (!files.chart.includes(wire)) failures.push(`ChartScreen does not pass language through: ${wire}`);
  }
  if (!files.chart.includes("setChartContext({ form: { ...form }, place: { ...effPlace }, ayanamsa })")) {
    failures.push("editable date/location fields are not isolated from the last-cast chart context");
  }
  return failures;
}

const realFailures = auditHindi(localizedFiles);
assert(realFailures.length === 0, realFailures.join("; "));

// Prove this is a regression detector, not a presence-only smoke check: remove a
// required translation in memory and require the same audit to reject the mutation.
const mutated = { ...localizedFiles, matching: localizedFiles.matching.replace("अष्टकूट गुण मिलान", "__ENGLISH_ONLY__") };
assert(auditHindi(mutated).some((x) => x.includes("अष्टकूट गुण मिलान")), "Hindi leakage audit did not detect an injected missing translation");

const hindiMarkerCount = Object.values(hindiInventory).flat().length;
console.log(`Jyotish panel exposure: PASS — ${groups.length} bilingual groups, ${anchors.length} destinations, and ${hindiMarkerCount} required Hindi copy markers are wired; mutation test rejected English leakage.`);
