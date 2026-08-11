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

/* Behavioural checks on the REAL samePlace, not its source text.
 *
 * The grep checks above assert that `!samePlace(...)` gates the prompt; they say nothing
 * about how samePlace decides, so the 2026-08-10 P1 passed this gate untouched: exact
 * label+lat+lon+zone equality meant a device-location user opening a Ganak link for their
 * OWN city got a blocking dialog whose two buttons read identically. These run the shipped
 * function so that regression cannot come back green. */
const { loadApp } = require("./_load-app.cjs");
const { samePlace } = loadApp("src/accessibility/AccessibilityRoot.tsx");

const MUM_SAVED = { label: "Mumbai, India", lat: 19.076, lon: 72.8777, zone: "Asia/Kolkata" };   // device location
const MUM_LINK = { label: "Mumbai, India", lat: 19.08, lon: 72.88, zone: "Asia/Kolkata" };       // Ganak share link
const MUM_ONLINE = { label: "Mumbai, Maharashtra, India", lat: 19.076, lon: 72.877, zone: "Asia/Kolkata" };
const THANE = { label: "Thane, India", lat: 19.22, lon: 72.98, zone: "Asia/Kolkata" };
const PUNE = { label: "Pune, India", lat: 18.52, lon: 73.86, zone: "Asia/Kolkata" };
const LONDON = { label: "London, UK", lat: 51.51, lon: -0.13, zone: "Europe/London" };

const behaviour = [
  [samePlace(MUM_SAVED, MUM_LINK), "device-location coordinates and a Ganak share link for the same city do not prompt"],
  [samePlace(MUM_SAVED, MUM_ONLINE), "offline and online geocoder labels for the same city do not prompt"],
  [samePlace(MUM_LINK, MUM_LINK), "an identical place never prompts"],
  [!samePlace(MUM_LINK, THANE), "a genuinely different nearby city (Mumbai/Thane, 18km) still prompts"],
  [!samePlace(MUM_LINK, PUNE), "a different city in the same timezone still prompts"],
  [!samePlace(MUM_LINK, LONDON), "a different city in another timezone still prompts"],
  [!samePlace(MUM_LINK, { ...MUM_LINK, zone: "Europe/London" }), "same coordinates in a different timezone still prompts"],
  [!samePlace(null, MUM_LINK) && !samePlace(MUM_LINK, null) && !samePlace(null, null), "a missing place is never 'the same'"],
];
checks.push(...behaviour);

const failures = checks.filter(([ok]) => !ok).map(([, label]) => label);
if (failures.length) {
  failures.forEach((label) => console.error(`FAIL: ${label}`));
  process.exit(1);
}
console.log(`link-city-choice: PASS (${checks.length} checks)`);
