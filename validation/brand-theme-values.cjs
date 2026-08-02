const assert = require("assert");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const css = fs.readFileSync(path.join(ROOT, "src/styles/design-tokens.css"), "utf8");
const html = fs.readFileSync(path.join(ROOT, "plans/design-previews/ganak-sacred-alive-today.html"), "utf8");
const blockMatch = css.match(/\/\* BRAND COLOR VALUES START[^]*?BRAND COLOR VALUES END[^]*?\*\//);
assert(blockMatch, "marked brand colour block must exist");
const block = blockMatch[0];

const expected = {
  "theme-bg-light": "#FFF8ED",
  "theme-surface-light": "#FFFCF7",
  "theme-ink-light": "#34263A",
  "theme-muted-light": "#6D5962",
  "theme-accent-light": "#8E2F49",
  "theme-gold-light": "#78500F",
  "theme-good-light": "#356448",
  "theme-bad-light": "#A33E32",
  "theme-line-light": "#A98C72",
  "theme-bg-dark": "#211620",
  "theme-surface-dark": "#30212E",
  "theme-ink-dark": "#FFF7EA",
  "theme-muted-dark": "#D4C2C5",
  "theme-accent-dark": "#FF9DB0",
  "theme-gold-dark": "#F0C36C",
  "theme-good-dark": "#9AD8AE",
  "theme-bad-dark": "#FFAD9B",
  "theme-line-dark": "#897080",
};

const declarations = [...block.matchAll(/--([a-z0-9-]+):\s*(#[0-9A-F]{6});/g)];
assert.equal(declarations.length, 18, "brand block must retain exactly 18 colour values");
assert.deepEqual(declarations.map((m) => m[1]).sort(), Object.keys(expected).sort(), "brand slots must not be renamed or added");
for (const [name, value] of Object.entries(expected)) {
  assert(block.includes(`--${name}: ${value};`), `--${name} must use the approved Sacred Bouquet value`);
}

function luminance(hex) {
  const rgb = hex.slice(1).match(/../g).map((part) => parseInt(part, 16) / 255);
  const linear = rgb.map((part) => part <= 0.04045 ? part / 12.92 : ((part + 0.055) / 1.055) ** 2.4);
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}
function contrast(foreground, background) {
  const a = luminance(foreground);
  const b = luminance(background);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}
const textPairs = [
  ["ink-light", "bg-light"], ["muted-light", "bg-light"],
  ["accent-light", "bg-light"], ["gold-light", "bg-light"],
  ["good-light", "surface-light"], ["bad-light", "surface-light"],
  ["ink-dark", "bg-dark"], ["muted-dark", "bg-dark"],
  ["accent-dark", "bg-dark"], ["gold-dark", "bg-dark"],
  ["good-dark", "surface-dark"], ["bad-dark", "surface-dark"],
];
for (const [fg, bg] of textPairs) {
  const ratio = contrast(expected[`theme-${fg}`], expected[`theme-${bg}`]);
  assert(ratio >= 4.5, `${fg}/${bg} contrast ${ratio.toFixed(2)} must clear WCAG AA`);
}
for (const mode of ["light", "dark"]) {
  const ratio = contrast(expected[`theme-line-${mode}`], expected[`theme-surface-${mode}`]);
  assert(ratio >= 3, `${mode} structural line contrast ${ratio.toFixed(2)} must clear 3:1`);
}

for (const required of [
  "New Delhi · Sat 25 Jul 2026", "Devshayani Ekadashi", "देवशयनी एकादशी",
  "Vishnu begins his cosmic sleep", "Abhijit Muhurat", "Rahu Kalam",
  "Today", "Festivals", "Muhurat", "Ask", "Jyotish",
  "ganak-devshayani-vishnu-hero.webp", "ganak-ordinary-tithi-hero.webp",
]) assert(html.includes(required), `approval mockup must include ${required}`);

for (const file of ["ganak-devshayani-vishnu-hero.webp", "ganak-ordinary-tithi-hero.webp"]) {
  const stat = fs.statSync(path.join(ROOT, "plans/design-previews", file));
  assert(stat.size > 300000, `${file} must be real high-resolution art, not a placeholder`);
}

console.log("✓ brand-theme-values PASS — 18 value-only slots, WCAG-AA text, 3:1 lines, locked Today content and real hero art verified");
