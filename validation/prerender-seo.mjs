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

const redirects = fs.readFileSync(distPath("_redirects"), "utf8");
const catchAllAt = redirects.indexOf("/* /index.html 200");
assert.ok(catchAllAt !== -1, "dist/_redirects lost the SPA catch-all");

const faviconAt = redirects.indexOf("/favicon.ico /favicon.svg 301");
assert.ok(faviconAt !== -1 && faviconAt < catchAllAt,
  "favicon rule must still precede the catch-all (validation/favicon.cjs invariant)");

for (const { from, to } of legacyRedirects()) {
  const rule = `${from} ${to} 301`;
  const at = redirects.indexOf(rule);
  assert.ok(at !== -1, `missing legacy 301: ${rule}`);
  assert.ok(at < catchAllAt, `legacy 301 must precede the catch-all: ${rule}`);
}

console.log(`prerender-seo gate: ${legacyRedirects().length} legacy 301s ordered ahead of the SPA catch-all.`);

const seenTitles = new Map();
for (const route of routes) {
  const rel = route.path === "/" ? "index.html" : `${route.path.replace(/^\//, "")}/index.html`;
  const html = fs.readFileSync(distPath(rel), "utf8");

  const title = html.match(/<title>([\s\S]*?)<\/title>/)?.[1];
  assert.equal(title, route.title, `wrong <title> for ${route.path}`);

  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  assert.equal(canonical, origin() + route.canonicalPath, `wrong canonical for ${route.path}`);

  const ogUrl = html.match(/<meta property="og:url" content="([^"]+)"/)?.[1];
  assert.equal(ogUrl, canonical, `og:url must match canonical for ${route.path}`);

  assert.ok(html.includes('<div id="root"></div>'), `hydration root missing for ${route.path}`);
  assert.ok(/<script type="module"[^>]+src="\/assets\//.test(html), `asset script missing for ${route.path}`);

  if (route.canonicalPath === route.path) {
    assert.ok(!seenTitles.has(title), `duplicate title: ${route.path} and ${seenTitles.get(title)}`);
    seenTitles.set(title, route.path);
  }
}

console.log(`prerender-seo gate: ${routes.length} route HTML files, each with a unique title and self-consistent canonical.`);
