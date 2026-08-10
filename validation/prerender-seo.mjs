#!/usr/bin/env node
import assert from "node:assert/strict";
import { publicRoutes, legacyRedirects, origin } from "../scripts/seo-routes.mjs";

const routes = publicRoutes();

assert.equal(routes.length, 198, `expected 198 public routes, got ${routes.length}`);
assert.equal(legacyRedirects().length, 10, "expected 10 legacy festival redirects");
assert.equal(origin(), "https://ganakapp.com", "canonical origin must resolve under Node");

for (const fixed of ["/", "/calculators", "/muhurat/medical"]) {
  assert.ok(routes.some((r) => r.path === fixed), `fixed route missing: ${fixed}`);
}

const paths = routes.map((r) => r.path);
assert.equal(new Set(paths).size, paths.length, "duplicate route path in the inventory");

for (const route of routes) {
  assert.ok(route.title && route.title.length > 5, `empty title: ${route.path}`);
  assert.ok(route.description && route.description.length > 10, `empty description: ${route.path}`);
  assert.ok(route.canonicalPath.startsWith("/"), `bad canonicalPath: ${route.path}`);
}

const titles = routes.map((r) => r.title);
assert.equal(new Set(titles).size, titles.length, "two routes share a title — canonical collapse risk");

console.log(`prerender-seo gate: PASS — ${routes.length} routes, ${legacyRedirects().length} legacy redirects, all titles unique.`);

import fs from "node:fs";

const DIST = new URL("../dist/", import.meta.url);
const distPath = (rel) => new URL(rel, DIST);

const sitemap = fs.readFileSync(distPath("sitemap.xml"), "utf8");
assert.ok(sitemap.startsWith("<?xml"), "sitemap must be XML, not the SPA shell");
assert.ok(sitemap.includes("<urlset"), "sitemap missing <urlset>");

for (const route of routes) {
  const loc = `<loc>${origin()}${route.canonicalPath}</loc>`;
  assert.ok(sitemap.includes(loc), `sitemap missing ${route.canonicalPath}`);
}

const locCount = (sitemap.match(/<loc>/g) || []).length;
assert.equal(locCount, new Set(routes.map((r) => r.canonicalPath)).size,
  "sitemap <loc> count must equal the unique canonical path count — no duplicates, no extras");

for (const { from } of legacyRedirects()) {
  assert.ok(!sitemap.includes(`<loc>${origin()}${from}</loc>`),
    `legacy path must never appear in the sitemap: ${from}`);
}

const robots = fs.readFileSync(distPath("robots.txt"), "utf8");
assert.ok(robots.startsWith("User-agent:"), "robots.txt must be robots syntax, not the SPA shell");
assert.ok(robots.includes(`Sitemap: ${origin()}/sitemap.xml`), "robots.txt must point at the sitemap");

console.log(`prerender-seo gate: sitemap ${locCount} URLs, robots.txt present.`);
