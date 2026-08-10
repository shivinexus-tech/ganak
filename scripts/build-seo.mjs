import fs from "node:fs";
import path from "node:path";
import { publicRoutes, legacyRedirects, origin, ROOT } from "./seo-routes.mjs";

const DIST = path.join(ROOT, "dist");

function writeFile(relative, contents) {
  const target = path.join(DIST, relative);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, contents, "utf8");
}

function xmlEscape(value) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function emitSitemap(routes) {
  const seen = new Set();
  const locs = [];
  for (const route of routes) {
    if (seen.has(route.canonicalPath)) continue;
    seen.add(route.canonicalPath);
    locs.push(`  <url><loc>${xmlEscape(origin() + route.canonicalPath)}</loc></url>`);
  }
  writeFile("sitemap.xml", [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...locs,
    "</urlset>",
    "",
  ].join("\n"));
  return locs.length;
}

export function emitRobots() {
  writeFile("robots.txt", [
    "User-agent: *",
    "Allow: /",
    "",
    `Sitemap: ${origin()}/sitemap.xml`,
    "",
  ].join("\n"));
}

function main() {
  if (!fs.existsSync(DIST)) {
    console.error("build-seo: dist/ not found — run `vite build` first.");
    process.exit(1);
  }
  const routes = publicRoutes();
  const count = emitSitemap(routes);
  emitRobots();
  console.log(`build-seo: sitemap ${count} URLs, robots.txt written.`);
}

main();
