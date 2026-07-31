#!/usr/bin/env node
const fs = require("fs");
const vm = require("vm");
const path = require("path");

const root = path.resolve(__dirname, "..");
const file = path.join(root, "src/screens/DailyScreen.tsx");
const source = fs.readFileSync(file, "utf8");
let passed = 0;

function check(condition, message) {
  if (!condition) throw new Error(`FAIL: ${message}`);
  passed += 1;
  console.log(`PASS: ${message}`);
}

const fnMatch = source.match(/export function isValidISODate\(value\) \{[\s\S]*?\n\}/);
check(Boolean(fnMatch), "strict date validator is exported");
const context = {};
vm.runInNewContext(`${fnMatch[0].replace("export ", "")}; this.validate = isValidISODate;`, context);
const validate = context.validate;

check(validate("2024-02-29") && validate("2026-10-20"), "real ISO dates are accepted");
check(!validate("2026-02-29") && !validate("2026-02-31") && !validate("2026-04-31"), "impossible calendar dates are rejected");
check(!validate("0001-01-01") && !validate("0099-12-31") && validate("0100-01-01") && validate("9999-12-31"), "supported year boundary is honest and Date.UTC-safe");
check(!validate("") && !validate("20-10-2026") && !validate("2026-1-02"), "blank and malformed dates are rejected");
check(source.includes('type="date"') && source.includes('id="panchang-direct-date"'), "direct typed/native date input is present");
check(source.includes('type="number"') && source.includes('min="100"') && source.includes('max="9999"'), "direct year jump supports years 100–9999");
check(source.includes("MOL.map((month, index)") && source.includes("jumpMonth"), "month selector and jump logic are present");
check(source.includes('role="alert"') && source.includes('aria-invalid={Boolean(dateError)}'), "invalid date errors are visible and accessible");
check(source.includes('window.addEventListener("popstate",restore)') && source.includes("setPanchDate(date)") && source.includes('urlPrefPush("date",value)'), "URL, Back and Forward date state stay wired");
check(!/else if \(date\) \{[^}]*setPanchDate\(todayISO\)/.test(source), "invalid URL input does not silently reset the selected date");
check(source.includes('else { setPanchDate(todayISO); setDateDraft(todayISO); setDateError(""); setCalOpen(false); }'), "Back to a URL without date restores the city-local Today");
check(source.includes("canPagePrevious") && source.includes("canPageNext") && source.includes("disabled={!canPagePrevious}") && source.includes("disabled={!canPageNext}"), "month paging is clamped at supported year boundaries");
check(source.includes('lang === "hi" ? "पिछला महीना" : "Previous month"') && source.includes('lang === "hi" ? "अगला महीना" : "Next month"'), "month paging labels follow the language toggle");
check(source.includes('lang === "hi" ? "सीधे तारीख़ लिखें" : "Enter a date directly"'), "direct entry follows the Hindi/English toggle");

console.log(`panchang-date-picker: ${passed}/${passed} checks passed`);
