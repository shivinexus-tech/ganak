#!/usr/bin/env node
"use strict";

/*
 * Backlog #46 — permanent gate for the design-system pass.
 *
 * Guards four things that are cheap to regress by hand-writing "just one" inline style:
 *   A. every screen renders from the ONE semantic token source — no raw colour literals,
 *      no px type sizes that ignore --scale;
 *   B. the four universal primitives exist, carry no values of their own, ship both density
 *      variants, and are actually adopted on the launch screens;
 *   C. Guided ↔ Expert is materially consumed on all five launch journeys and every depth
 *      of the ladder is defined;
 *   D. Muhurat has contextual read-aloud on the shared speech system.
 */

const fs = require("fs");
const path = require("path");

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const failures = [];
let checks = 0;

function expect(condition, message) {
  checks += 1;
  if (!condition) failures.push(message);
}

function sourceFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(full);
    return /\.(?:js|jsx|ts|tsx)$/.test(entry.name) ? [full] : [];
  });
}

/* ---------------------------------------------- A. single token source in the screens */

// A raw hex is only allowed as the input to an identity color-mix (planet/hora hues, which
// must keep their recognisable colour while adapting to the current ink) — never on its own.
const IDENTITY_MIX = /color-mix\(in srgb, #[0-9A-Fa-f]{3,8}, var\(--ink\) \d+%\)/g;

for (const file of sourceFiles(path.join(root, "src"))) {
  const relative = path.relative(root, file).split(path.sep).join("/");
  const source = read(relative)
    .replace(IDENTITY_MIX, "")
    // the print stylesheet must force white paper regardless of the colour mode
    .replace(/html, body \{ background: #fff !important; \}/, "");
  const hexes = source.match(/#[0-9A-Fa-f]{3,8}\b/g) || [];
  expect(hexes.length === 0, `raw colour literal in ${relative}: ${hexes.slice(0, 3).join(", ")}`);
}

// Type must be expressed in the semantic roles so --scale reaches it. React serialises a
// bare number as px, which is exactly the bypass this check exists to stop.
const TYPE_SCREENS = [
  "src/kundli-app.tsx", "src/screens/DailyScreen.tsx", "src/screens/MuhuratHub.tsx",
  "src/screens/FestivalGuideScreen.tsx", "src/screens/CalendarPage.tsx",
  "src/screens/PrashnaScreen.tsx", "src/screens/ChartScreen.tsx",
  "src/screens/PersonalizeScreen.tsx",
];
// SVG/canvas drawing lives in viewBox user units where a rem is meaningless, so a line that
// is drawing rather than laying out is exempt — the geometry is mathematically required.
const DRAWING_LINE = /<svg|<text|<tspan|<line\b|<g\s|<path|<circle|<rect|<polyline|<polygon|viewBox/;
for (const file of TYPE_SCREENS) {
  const layoutLines = read(file).split("\n").filter((line) => !DRAWING_LINE.test(line));
  const bare = layoutLines.join("\n").match(/fontSize:\s*\d/g) || [];
  expect(bare.length === 0, `${file} sets ${bare.length} px font size(s) that ignore --scale`);
  const pxLengths = layoutLines.join("\n").match(/(?:padding|margin|gap|borderRadius|minHeight):\s*"?\d+(?:\.\d+)?px/g) || [];
  expect(pxLengths.length === 0, `${file} sets ${pxLengths.length} px length(s) that ignore --density`);
}

/* ------------------------------------------------------------- B. universal primitives */

const primitives = read("src/components/ui-primitives.tsx");
["export function Card", "export function SectionHeader", "export function Badge", "export function DataRow"]
  .forEach((symbol) => expect(primitives.includes(symbol), `ui-primitives must export ${symbol.split(" ").pop()}`));
expect(/comfortable:/.test(primitives) && /compact:/.test(primitives), "primitives must ship comfortable and compact density variants");
["good", "bad", "accent", "sunken", "raised"].forEach((tone) =>
  expect(primitives.includes(`case "${tone}"`) || primitives.includes(`${tone}:`), `primitives must define the ${tone} tone`));
expect(/BADGE_GLYPH/.test(primitives) && /good: "✓", bad: "⚠"/.test(primitives), "Badge must pair every tone with a glyph so meaning is never colour-only");
const badgeBody = (primitives.split("export function Badge")[1] || "").split("/* ---")[0];
expect(!/aria-hidden/.test(badgeBody), "the Badge glyph must stay part of the accessible name");
expect(/minHeight: "var\(--control-height\)"/.test(primitives), "interactive DataRow must meet the shared touch target");
expect(/className="comfort-focus"/.test(primitives), "interactive primitives must carry the shared focus ring");
expect(
  !/(?:#[0-9A-Fa-f]{3,8}|\brgba?\(|:\s*\d+(?:\.\d+)?px)/.test(primitives),
  "ui-primitives must not define colour or size values of its own — the token file owns them",
);

const ADOPTERS = {
  "src/screens/MuhuratHub.tsx": ["Badge", "Card", "DataRow", "SectionHeader"],
  "src/screens/DailyScreen.tsx": ["Card", "SectionHeader"],
};
for (const [file, symbols] of Object.entries(ADOPTERS)) {
  const source = read(file);
  expect(source.includes('from "../components/ui-primitives"'), `${file} must import the shared primitives`);
  symbols.forEach((symbol) => expect(new RegExp(`<${symbol}[\\s/>]`).test(source), `${file} must render <${symbol}>`));
}
expect(!read("src/screens/MuhuratHub.tsx").includes("const Row = ({ label, children, color })"), "the per-screen Row fork must stay replaced by DataRow");

/* ------------------------------------------------------------------ C. Guided ↔ Expert */

const css = read("src/styles/design-tokens.css");
['data-depth="guided"', 'data-depth="balanced"', 'data-depth="expert"'].forEach((step) =>
  expect(css.includes(step), `the guidance ladder must define ${step}`));
expect(
  /html\[data-depth="balanced"\] \.expert-only/.test(css) && /html\[data-depth="balanced"\] \.guided-only/.test(css),
  "the default balanced depth must not render guided and expert copy at the same time",
);
expect(/html\[data-depth="guided"\] \.technical-only/.test(css), "guided depth must hide technical-only blocks");

const provider = read("src/accessibility/ComfortProvider.tsx");
["export function useDepth", "showTechnical", "showPlainHelp", "showExpert"].forEach((symbol) =>
  expect(provider.includes(symbol), `ComfortProvider must expose ${symbol}`));

const DEPTH_JOURNEYS = [
  ["src/screens/DailyScreen.tsx", "Today"],
  ["src/screens/MuhuratHub.tsx", "Muhurat"],
  ["src/screens/FestivalGuideScreen.tsx", "Festivals"],
  ["src/screens/PrashnaScreen.tsx", "Ask/Prashna"],
  ["src/screens/ChartScreen.tsx", "Jyotish"],
];
for (const [file, journey] of DEPTH_JOURNEYS) {
  const source = read(file);
  expect(source.includes("useDepth()"), `${journey} (${file}) must consume the guidance depth`);
  expect(
    /showPlainHelp|showExpert|showTechnical|technical-only/.test(source),
    `${journey} (${file}) must actually change with the guidance depth`,
  );
}

// Guided may simplify, but it must never remove a warning, a date, an action or a control.
const muhurat = read("src/screens/MuhuratHub.tsx");
expect(!/showExpert && [\s\S]{0,400}avoidW\.map/.test(muhurat), "avoid windows must render at every guidance depth");
expect(!/technical-only[\s\S]{0,200}avoidW/.test(muhurat), "avoid windows must never sit inside a depth-hidden block");

const nav = read("src/components/JyotishPanelNav.tsx");
expect(nav.includes("TECHNICAL_ANCHORS"), "the Jyotish nav must not offer anchors whose panel guided depth hides");

/* ----------------------------------------------------------------- D. Muhurat Listen */

expect(muhurat.includes('import ReadAloudButton from "../accessibility/ReadAloudButton"'), "Muhurat must use the shared read-aloud control");
expect((muhurat.match(/<ReadAloudButton/g) || []).length >= 2, "Muhurat needs Listen on both the day summary and the finder verdict");
expect(muhurat.includes("function muhuratSpeech") || muhurat.includes("muhuratSpeech("), "Muhurat speech text must be built from the verdict, times and warnings");
expect(/🔊 सुनें/.test(muhurat) && /🔊 Listen/.test(muhurat), "Muhurat Listen must be bilingual");
expect(/avoid: /.test(muhurat), "Muhurat speech must include the avoid warnings");

const speech = read("src/accessibility/ReadAloudButton.tsx");
expect(speech.includes("loadVoices"), "read-aloud must wait for the platform voice list before speaking");
expect(speech.includes("watchdogRef"), "read-aloud must surface a visible error when speech never starts");
expect(/}, \[lang, content\]\);/.test(speech), "changing language or content must stop the previous reading");
expect(speech.includes("ganak:tts-start") && speech.includes("activeSpeechId"), "only one speech session may run at a time");

const telemetry = read("src/telemetry/privacy-events.ts");
expect(!/text|speech|utterance/i.test(telemetry.replace(/\/\*[\s\S]*?\*\//g, "")), "spoken text must never reach the analytics seam");

if (failures.length) {
  console.error(`✗ design-system-primitives FAILED (${failures.length}/${checks})`);
  failures.forEach((failure) => console.error(`  - ${failure}`));
  process.exit(1);
}

console.log(`✓ design-system-primitives PASS (${checks} checks; single token source in every screen, four universal primitives adopted, guidance ladder consumed on all five launch journeys, Muhurat Listen on the shared speech system)`);
