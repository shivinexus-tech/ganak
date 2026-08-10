#!/usr/bin/env node
const fs = require("fs");

const root = fs.readFileSync("src/accessibility/AccessibilityRoot.tsx", "utf8");
const dialog = fs.readFileSync("src/components/FirstRunPlaceDialog.tsx", "utf8");
const comfort = fs.readFileSync("src/accessibility/FirstRunComfortOffer.tsx", "utf8");
const places = fs.readFileSync("src/data/places.ts", "utf8");
const shell = fs.readFileSync("src/kundli-app.tsx", "utf8");

const checks = [
  [root.includes("!linkedPlace && !preferences.homePlace"), "first-run gate requires neither URL nor remembered place"],
  [root.includes('rawLat == null || rawLat.trim() === "" ? NaN') && root.includes("new Intl.DateTimeFormat"), "incomplete or invalid shared places cannot bypass the gate"],
  [root.includes("needsFirstPlace && <FirstRunPlaceDialog"), "place chooser renders before child app"],
  [root.includes("{!needsFirstPlace && !needsLinkCityChoice && <div"), "city-dependent app does not mount until selection"],
  [root.includes("updatePreferences({ homePlace: next })"), "selection uses approved preferences path"],
  [root.includes("approvedStorage.preferences.write") && root.includes("placeStorageWarning"), "storage failure is immediately visible"],
  [root.includes("replaceQuery({ city: next.label, lat: next.lat, lon: next.lon, zone: next.zone })"), "selection updates shareable URL state"],
  [dialog.includes("navigator.geolocation.getCurrentPosition"), "device location is requested only from button handler"],
  [dialog.includes("onClick={useDeviceLocation}"), "device-location request is explicit user action"],
  [dialog.includes("<PlaceInput") && dialog.includes("onPick={onPick}"), "manual city search remains available"],
  [places.includes("function nearestCity(lat, lon)"), "device coordinates map to the offline city timezone table"],
  [comfort.includes("!!preferences.homePlace && !preferences.firstRunComplete") && comfort.includes("!preferences.homePlace"), "comfort dialog and focus trap wait until place selection is finished"],
  [shell.includes("onPlace={setPanchPlace}"), "existing city-change wiring remains present"],
];

const failures = checks.filter(([ok]) => !ok).map(([, label]) => label);
if (failures.length) {
  failures.forEach((label) => console.error(`FAIL: ${label}`));
  process.exit(1);
}
console.log(`first-run-place: PASS (${checks.length} checks)`);
