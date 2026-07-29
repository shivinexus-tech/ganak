#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const indexHtml = fs.readFileSync(path.join(root, "index.html"), "utf8");
const redirects = fs.readFileSync(path.join(root, "public", "_redirects"), "utf8");
const faviconPath = path.join(root, "public", "favicon.svg");

const checks = [
  {
    name: "owned SVG favicon exists",
    pass: fs.existsSync(faviconPath),
  },
  {
    name: "document explicitly selects the SVG favicon",
    pass: /<link\s+rel=["']icon["']\s+type=["']image\/svg\+xml["']\s+href=["']\/favicon\.svg["']\s*\/?>/.test(indexHtml),
  },
  {
    name: "legacy /favicon.ico resolves to the image before the SPA fallback",
    pass: redirects.indexOf("/favicon.ico /favicon.svg 301") !== -1
      && redirects.indexOf("/favicon.ico /favicon.svg 301") < redirects.indexOf("/* /index.html 200"),
  },
];

if (fs.existsSync(faviconPath)) {
  const svg = fs.readFileSync(faviconPath, "utf8");
  checks.push(
    {
      name: "favicon is a self-contained SVG image",
      pass: /^\s*<svg\b[\s\S]*<\/svg>\s*$/.test(svg)
        && !/<script\b/i.test(svg)
        && !/\b(?:href|src)=["']https?:/i.test(svg),
    },
    {
      name: "favicon declares a square viewBox and accessible label",
      pass: /\bviewBox=["']0 0 64 64["']/.test(svg)
        && /\brole=["']img["']/.test(svg)
        && /<title>Ganak<\/title>/.test(svg),
    },
  );
}

const failed = checks.filter((check) => !check.pass);
for (const check of checks) {
  console.log(`${check.pass ? "PASS" : "FAIL"}: ${check.name}`);
}

if (failed.length) {
  console.error(`\nFavicon validation failed: ${failed.length}/${checks.length} checks.`);
  process.exit(1);
}

console.log(`\nFavicon validation PASS: ${checks.length}/${checks.length}`);
