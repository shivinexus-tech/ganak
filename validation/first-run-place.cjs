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
  // A deliberate language choice must be remembered like a deliberate city choice. The URL
  // alone let a bare ganakapp.com visit drop Hindi back to English every time, so a
  // Hindi-first reader re-picked Hindi on every visit (bug bash 2026-08-10, P2-3).
  [/const chooseLang = \([\s\S]{0,200}?updatePreferences\(\{ language:/.test(shell),
    "the header language control persists the choice through approved preferences"],
];

/* Behavioural checks on the REAL nearestCity.
 *
 * It used to return the closest gazetteer city at ANY distance, carrying that city's
 * timezone, so "use my device location" in Honolulu answered "San Francisco, USA" on
 * America/Los_Angeles — every panchang timing three hours out, stated with no warning
 * (bug bash 2026-08-10, P2-2). Panchang is timezone-derived, so a confidently wrong zone is
 * worse than no answer; beyond the cap the dialog shows bilingual guidance instead. */
const { loadApp } = require("./_load-app.cjs");
const { nearestCity, distanceKm, NEAREST_CITY_MAX_KM } = loadApp("src/data/places.ts");

const zoneOffset = (zone) => new Intl.DateTimeFormat("en", { timeZone: zone, timeZoneName: "longOffset" })
  .formatToParts(new Date("2026-08-11T12:00:00Z")).find((part) => part.type === "timeZoneName").value;

// Every one of these was a WRONG timezone before the cap; all sit 614km+ from any known city.
const tooFar = [
  ["Honolulu", 21.31, -157.86], ["Novosibirsk", 55.03, 82.92], ["Reykjavik", 64.15, -21.94],
  ["Anchorage", 61.22, -149.9], ["Tashkent", 41.3, 69.24], ["Almaty", 43.24, 76.89], ["Male", 4.18, 73.51],
];
// Real visitors who must keep working, with the timezone their device would report.
const covered = [
  ["Mumbai", 19.076, 72.8777, "Asia/Kolkata"], ["Bhiwandi", 19.3, 73.06, "Asia/Kolkata"],
  ["rural Bihar", 25.9, 84.9, "Asia/Kolkata"], ["Milton Keynes", 52.04, -0.76, "Europe/London"],
  ["Fresno", 36.74, -119.79, "America/Los_Angeles"], ["Suva", -18.0, 178.4, "Pacific/Fiji"],
];

const behaviour = [
  [typeof NEAREST_CITY_MAX_KM === "number" && NEAREST_CITY_MAX_KM > 0 && NEAREST_CITY_MAX_KM < 614,
    "device-location match is distance-capped below the closest known wrong-timezone match (614km)"],
  [tooFar.every(([, lat, lon]) => nearestCity(lat, lon) === null),
    "a location with no city within the cap returns null instead of a distant wrong city"],
  [covered.every(([, lat, lon]) => !!nearestCity(lat, lon)),
    "visitors near a known city still resolve"],
  [covered.every(([, lat, lon, zone]) => zoneOffset(nearestCity(lat, lon).zone) === zoneOffset(zone)),
    "every resolved visitor gets their true UTC offset"],
  [covered.every(([, lat, lon]) => { const p = nearestCity(lat, lon); return p.lat === lat && p.lon === lon; }),
    "the visitor's own coordinates are preserved, not snapped to the city centre"],
  [nearestCity(NaN, 10) === null && nearestCity(10, 999) === null && nearestCity(null, null) === null,
    "invalid coordinates return null"],
  [distanceKm(19.076, 72.8777, 19.08, 72.88) < 1 && Math.round(distanceKm(51.51, -0.13, 48.86, 2.35)) === 343,
    "distanceKm returns real kilometres (London-Paris 343km, Mumbai GPS vs share link under 1km)"],
];
checks.push(...behaviour);

const failures = checks.filter(([ok]) => !ok).map(([, label]) => label);
if (failures.length) {
  failures.forEach((label) => console.error(`FAIL: ${label}`));
  process.exit(1);
}
console.log(`first-run-place: PASS (${checks.length} checks)`);
