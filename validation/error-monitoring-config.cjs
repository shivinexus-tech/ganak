#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const sourcePath = path.join(root, "src/monitoring/error-reporter.ts");
const source = fs.readFileSync(sourcePath, "utf8");
const failures = [];

if (!source.includes("import.meta.env.VITE_SENTRY_DSN")) {
  failures.push("reporter must read VITE_SENTRY_DSN through a direct import.meta.env reference");
}
if (/Function\s*\([^)]*import\.meta\.env/.test(source) || source.includes('Function("return import.meta.env")')) {
  failures.push("reporter must not hide import.meta.env inside Function(); Vite cannot inline it");
}

const expectedDsn = process.env.EXPECT_SENTRY_DSN || "";
if (expectedDsn) {
  let parsed;
  try { parsed = new URL(expectedDsn); }
  catch { failures.push("EXPECT_SENTRY_DSN is not a valid URL"); }

  const distDir = path.join(root, "dist/assets");
  const bundles = fs.existsSync(distDir)
    ? fs.readdirSync(distDir).filter((name) => /^index-.*\.js$/.test(name))
    : [];
  if (!bundles.length) failures.push("no built index bundle found in dist/assets");
  if (parsed && bundles.length) {
    const bundleText = bundles.map((name) => fs.readFileSync(path.join(distDir, name), "utf8")).join("\n");
    const projectId = parsed.pathname.replace(/^\//, "").split("/")[0];
    if (!bundleText.includes(parsed.host) || !bundleText.includes(parsed.username) || !bundleText.includes(projectId)) {
      failures.push("built bundle does not contain the expected DSN components");
    }
  }
}

if (failures.length) {
  console.error("\nERROR MONITORING CONFIG FAILED");
  failures.forEach((failure) => console.error("  - " + failure));
  process.exit(1);
}

console.log(expectedDsn
  ? "ERROR MONITORING CONFIG PASSED (source + built DSN injection)"
  : "ERROR MONITORING CONFIG PASSED (source wiring)");
