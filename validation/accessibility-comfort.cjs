#!/usr/bin/env node
"use strict";

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

function includesAll(source, values, label) {
  values.forEach((value) => expect(source.includes(value), `${label}: missing ${value}`));
}

function luminance(hex) {
  const channels = [1, 3, 5].map((index) => parseInt(hex.slice(index, index + 2), 16) / 255)
    .map((value) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrast(foreground, background) {
  const a = luminance(foreground), b = luminance(background);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

function sourceFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(full);
    return /\.(?:js|jsx|ts|tsx)$/.test(entry.name) ? [full] : [];
  });
}

function allFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? allFiles(full) : [full];
  });
}

const css = read("src/styles/design-tokens.css");
includesAll(css, [
  "ONE authoritative token file", "BRAND COLOR VALUES START", "BRAND COLOR VALUES END",
  "--scale:", "--density:", "font-size: var(--scale)",
  "--bg:", "--surface:", "--ink:", "--accent:", "--gold:", "--good:", "--bad:", "--line:",
  'data-comfort-preset="simple-large"', 'data-comfort-preset="balanced"', 'data-comfort-preset="detailed"',
  "prefers-color-scheme: dark", "prefers-reduced-motion: reduce", "prefers-contrast: more",
  'data-color-mode="dark"', 'data-warmth="soft"', 'data-depth="guided"', 'data-depth="expert"',
], "token architecture");
expect(!/\b\d+(?:\.\d+)?px\b/.test(css), "token architecture must use rem rather than px");
includesAll(css, ["outline: 0.1875rem solid var(--focus)", ".comfort-range", ".comfort-choice"], "focus and touch targets");

const tokenFiles = allFiles(path.join(root, "src"))
  .map((file) => path.relative(root, file).split(path.sep).join("/"))
  .filter((file) => /token/i.test(path.basename(file)));
expect(
  JSON.stringify(tokenFiles) === JSON.stringify(["src/styles/design-tokens.css"]),
  `single-token-file contract violated: ${tokenFiles.join(", ")}`,
);

const brandBlockMatch = css.match(/BRAND COLOR VALUES START[\s\S]*?BRAND COLOR VALUES END/);
expect(Boolean(brandBlockMatch), "brand colour values block must have explicit boundaries");
const brandBlock = brandBlockMatch ? brandBlockMatch[0] : "";
const expectedBrandSlots = [
  "theme-bg-light", "theme-surface-light", "theme-ink-light", "theme-muted-light",
  "theme-accent-light", "theme-gold-light", "theme-good-light", "theme-bad-light", "theme-line-light",
  "theme-bg-dark", "theme-surface-dark", "theme-ink-dark", "theme-muted-dark",
  "theme-accent-dark", "theme-gold-dark", "theme-good-dark", "theme-bad-dark", "theme-line-dark",
];
const actualBrandSlots = [...brandBlock.matchAll(/--([a-z0-9-]+):/g)].map((match) => match[1]);
expect(JSON.stringify(actualBrandSlots) === JSON.stringify(expectedBrandSlots), "brand track must use the existing colour slots without adding or renaming them");
expect(!/--theme-[a-z0-9-]+:/.test(css.replace(brandBlock, "")), "brand colour declarations must stay inside the values-only block");

const styleContract = read("src/components/ui-style-contract.ts");
includesAll(styleContract, ["single authoritative file", 's1: "var(--space-1)"', 'const R = T'], "component style projection");
expect(!/(?:#[0-9A-Fa-f]{3,8}|\brgba?\(|\b\d+(?:\.\d+)?(?:px|rem|em)\b)/.test(styleContract), "component style projection must not define token values");
expect(!allFiles(path.join(root, "src")).some((file) => /\.(?:ts|tsx)$/.test(file) && fs.readFileSync(file, "utf8").includes("components/tokens")), "legacy token-module imports must be removed");

function tokenHex(name) {
  const match = css.match(new RegExp(`--${name}:\\s*(#[0-9A-Fa-f]{6})\\s*;`));
  expect(Boolean(match), `theme token --${name} must be a six-digit hex value for contrast validation`);
  return match ? match[1] : "#000000";
}

const colorPairs = [
  [tokenHex("theme-ink-light"), tokenHex("theme-bg-light"), "light ink"],
  [tokenHex("theme-muted-light"), tokenHex("theme-bg-light"), "light muted"],
  [tokenHex("theme-accent-light"), tokenHex("theme-bg-light"), "light accent"],
  [tokenHex("theme-good-light"), tokenHex("theme-surface-light"), "light good"],
  [tokenHex("theme-bad-light"), tokenHex("theme-surface-light"), "light bad"],
  [tokenHex("theme-ink-dark"), tokenHex("theme-bg-dark"), "dark ink"],
  [tokenHex("theme-muted-dark"), tokenHex("theme-bg-dark"), "dark muted"],
  [tokenHex("theme-accent-dark"), tokenHex("theme-bg-dark"), "dark accent"],
  [tokenHex("theme-good-dark"), tokenHex("theme-surface-dark"), "dark good"],
  [tokenHex("theme-bad-dark"), tokenHex("theme-surface-dark"), "dark bad"],
];
colorPairs.forEach(([foreground, background, label]) => {
  const ratio = contrast(foreground, background);
  expect(ratio >= 4.5, `${label} contrast ${ratio.toFixed(2)}:1 is below WCAG AA`);
});

const adapter = read("src/storage/approved-storage.ts");
includesAll(adapter, [
  '"preferences" | "savedCharts"',
  'preferences: store<Record<string, unknown>>("preferences")',
  'savedCharts: store<unknown[]>("savedCharts")',
  'hasOwnProperty.call(parsed.stores, "preferences")',
  'hasOwnProperty.call(parsed.stores, "savedCharts")',
  "analyticsConsentGranted",
], "approved adapter");
expect((adapter.match(/ganak:approved-storage:v1/g) || []).length === 1, "approved adapter must use one auditable root key");
for (const file of sourceFiles(path.join(root, "src"))) {
  const relative = path.relative(root, file);
  if (relative === path.normalize("src/storage/approved-storage.ts")) continue;
  const source = fs.readFileSync(file, "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/.*$/gm, "");
  expect(!/\b(localStorage|sessionStorage)\b/.test(source), `direct browser storage in ${relative}`);
}

const provider = read("src/accessibility/ComfortProvider.tsx");
includesAll(provider, [
  'preset: "balanced"', "scalePercent: 106.25", "densityRem: 0.0625",
  '"simple-large"', "112.5", 'dataset.comfortPreset', 'style.setProperty("--scale"', 'style.setProperty("--density"',
  "firstRunComplete", "privacy", "sensitiveSync", "speechRate", "clearPreferences",
], "comfort provider");

const rootSource = read("src/accessibility/AccessibilityRoot.tsx");
includesAll(rootSource, ["PersonalizeScreen", "FirstRunComfortOffer", 'screen === "personalize"', "preferences.homePlace", "preferences.language", "history.pushState", "ganakPersonalize", "onClearPreferences", "lang: null", "city: null", 'display: personalizeRoute ? "none" : "block"'], "accessibility root");
const main = read("src/main.tsx");
includesAll(main, ['import "./styles/design-tokens.css"', "<ComfortProvider>", "<AccessibilityRoot>"], "entry wiring");

const personalize = read("src/screens/PersonalizeScreen.tsx");
includesAll(personalize, [
  "Appearance & comfort", "What you follow", "Place & language", "Sound", "Privacy & data",
  "रूप और आराम", "आप क्या मानते हैं", "स्थान और भाषा", "ध्वनि", "गोपनीयता और डेटा",
  "Simple & Large", "Balanced", "Detailed", "Set it up for a parent", "माता-पिता के लिए सेट करें",
  "✓", "Auspicious", "⚠", "Avoid", "never synced or analyzed without separate explicit consent",
  "aria-label={label}", "aria-valuetext={output}", "useModalFocus",
  "Followed festivals", "Unfollow", "onClearPreferences",
], "Personalize hub");
expect(!/Traditional\s*[↔-]|Modern\s*[↔-]/i.test(personalize), "held Traditional/Modern aesthetic slider must not ship");

const firstRun = read("src/accessibility/FirstRunComfortOffer.tsx");
includesAll(firstRun, ["How would you like Ganak to look?", "गणक आपको कैसा दिखे?", "Simple & Large", "Balanced", "Not now", "useModalFocus", "data-modal-autofocus"], "first-run offer");

const modalFocus = read("src/accessibility/useModalFocus.ts");
includesAll(modalFocus, ['event.key === "Escape"', 'event.key !== "Tab"', "previous?.focus()", "data-modal-autofocus"], "modal focus management");

const speech = read("src/accessibility/ReadAloudButton.tsx");
includesAll(speech, ["speechSynthesis", "SpeechSynthesisUtterance", '"hi-IN"', "🔊 सुनें", "🔊 Listen", "Read-aloud is unavailable", "ganak:tts-start", "ganak:tts-stop-all", "activeSpeechId"], "read aloud");

const telemetry = read("src/telemetry/privacy-events.ts");
includesAll(telemetry, ["analyticsConsentGranted()", "VITE_ANALYTICS_ENDPOINT"], "analytics consent gate");
const placeInput = read("src/components/PlaceInput.tsx");
includesAll(placeInput, ['background: C.panel || "var(--surface-sunken)"', 'background: C.panel || "var(--surface-active)"'], "semantic place input");
expect(/function tokenHex\(name\)/.test(fs.readFileSync(__filename, "utf8")), "contrast gate must parse actual theme token values");

const daily = read("src/screens/DailyScreen.tsx");
includesAll(daily, ["ReadAloudButton", "आज का पंचांग सुनें", "Listen to today's Panchang", "अभिजित मुहूर्त", "राहु काल"], "Today listen discovery");
const festival = read("src/screens/FestivalGuideScreen.tsx");
includesAll(festival, ["ReadAloudButton", "toggleFollow", 'isFollowed ? "★" : "☆"', "अनुसरण करें", "Follow"], "festival discovery");
const vidhi = read("src/components/VratVidhiCard.tsx");
includesAll(vidhi, ["ReadAloudButton", "विधि सुनें", "Listen to the steps"], "vidhi listen discovery");

if (failures.length) {
  console.error(`✗ accessibility-comfort FAILED (${failures.length}/${checks})`);
  failures.forEach((failure) => console.error(`  - ${failure}`));
  process.exit(1);
}

console.log(`✓ accessibility-comfort PASS (${checks} checks; WCAG-AA light/dark contrast, storage boundary, presets, bilingual hub, discovery and TTS wiring)`);
