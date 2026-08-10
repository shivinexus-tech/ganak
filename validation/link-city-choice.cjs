#!/usr/bin/env node
const fs = require("fs");

const root = fs.readFileSync("src/accessibility/AccessibilityRoot.tsx", "utf8");
const dialog = fs.readFileSync("src/components/LinkCityChoiceDialog.tsx", "utf8");

const checks = [
  [root.includes("!samePlace(linkedPlace, preferences.homePlace)"), "prompt only when linked and remembered places differ"],
  [root.includes("acceptedLinkSignature !== linkedSignature"), "a new linked city prompts once per linked view"],
  [root.includes("needsLinkCityChoice && linkedPlace && preferences.homePlace"), "conflict dialog is wired with both places"],
  [root.includes("!needsFirstPlace && !needsLinkCityChoice"), "city-dependent children do not mount before the choice"],
  [root.includes("setAcceptedLinkSignature(linkedSignature)") && !root.match(/useLinkedPlace[\s\S]{0,350}updatePreferences/), "viewing the linked city does not change remembered preferences"],
  [root.includes("useRememberedPlace") && root.includes("replaceQuery({ city: saved.label"), "saved-city choice updates only the current URL place"],
  [dialog.includes("Your remembered preference will not be changed automatically"), "dialog plainly explains remembered-city behavior"],
  [dialog.includes("View ${linkedPlace.label} for this link") && dialog.includes("Use my remembered city: ${savedPlace.label}"), "both city choices are explicit"],
  [dialog.includes("सामान्य शहर खोज") && dialog.includes("किस शहर का पंचांग देखें?"), "Hindi decision and remembered-city explanation are present"],
];

const failures = checks.filter(([ok]) => !ok).map(([, label]) => label);
if (failures.length) {
  failures.forEach((label) => console.error(`FAIL: ${label}`));
  process.exit(1);
}
console.log(`link-city-choice: PASS (${checks.length} checks)`);
