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
