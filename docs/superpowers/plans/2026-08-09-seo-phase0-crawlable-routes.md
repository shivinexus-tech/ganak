# SEO Phase 0 — Crawlable Routes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Ganak's 198 public routes independently discoverable and indexable by emitting a real `sitemap.xml`, a real `robots.txt`, canonical `301`s for the 10 legacy festival paths, and one static HTML file per route carrying its own `<title>`, description and self-consistent `canonical`.

**Architecture:** A post-build Node step walks the existing registries (`FESTIVAL_PAGE_ROUTES`, `UTILITY_CALCULATORS`) and reuses the existing `routeMetadata()` — which already computes correct per-route titles and descriptions and is merely called too late, in the browser instead of at build time. Nothing is hand-written and nothing is duplicated: the registries stay the single source of truth. React still hydrates over the emitted HTML, so app behaviour is unchanged once JS loads. This is Stage A (head-only): no React SSR, no engine in the build, and therefore **no default-place decision required**. Stage B (real body content + JSON-LD) is explicitly out of scope.

**Tech Stack:** Node 18+ ESM (`scripts/*.mjs`), esbuild via the existing `validation/_load-app.cjs` loader, Vite 6 build, Cloudflare Pages static hosting.

## Global Constraints

- Canonical origin is `https://ganakapp.com`, read from `canonicalOrigin()`. Never hard-code it in new files.
- **Never edit `src/metadata/route-metadata.ts` or `index.html`.** `CODEX-P0-ROWS-38-39` is `ACTIVE` on both. This plan only *reads* them. Verified: `canonicalOrigin()` already falls back to `DEFAULT_CANONICAL_ORIGIN` under Node, so no change is needed.
- Registries are the single source of truth. No hand-written route lists anywhere, including in gates.
- Every task ends with a passing gate, and each new gate must be **proven non-vacuous** by mutation: break the thing it guards, watch it fail with the expected message, restore, watch it pass. Paste both outputs.
- Never weaken an existing gate to make a new one pass. `validation/favicon.cjs` pins that `/favicon.ico … 301` precedes `/* /index.html 200`; that ordering must survive.
- Bilingual parity is not in scope here — Stage A emits the English head only. The Hindi URL structure is register row 64 and is unresolved; do not invent `/hi/` paths in this plan.
- Temp files go in `.scratch/` only, never `/tmp`.
- Run gates with `export PATH="/opt/homebrew/bin:$PATH"` prefixed.
- **Recorded deviation from register row 62:** the row names the gate `validation/prerender-seo.cjs`. It is `.mjs` here because it imports the ESM `scripts/seo-routes.mjs`, and sharing that module is what stops the gate and the emitter from drifting apart. `validation/backlog-sheet-sync.mjs` is the existing precedent for an `.mjs` gate. Consequence: the `for f in validation/*.cjs` sweep will **not** pick it up — it must be run explicitly, as Task 5 Step 3 does.

## Route inventory (verified 2026-08-09, not assumed)

| Group | Count | Source |
|---|---:|---|
| Festival guides | 181 | `FESTIVAL_PAGE_ROUTES` |
| Calculators | 14 | `UTILITY_CALCULATORS` |
| Fixed (`/`, `/calculators`, `/muhurat/medical`) | 3 | literal |
| **Total sitemap URLs** | **198** | |
| Legacy festival paths needing `301` | 10 | `FESTIVAL_LEGACY_PATH_REDIRECTS` |

**Known exclusion, flagged not hidden:** Prashna and Jyotish are query-parameter screens (`/?screen=prashna`, `/?screen=chart`), not paths — `kundli-app.tsx:99` reads `urlPrefGet("screen")`. `applyRouteMetadata()` canonicalises to `pathname`, so those URLs collapse to `/`. They are therefore **excluded from the sitemap** — listing them would submit URLs that declare themselves duplicates. Giving them real paths is a routing change that touches `kundli-app.tsx` and belongs with register row 64, not here.

## File Structure

| File | Responsibility |
|---|---|
| `scripts/seo-routes.mjs` (create) | Single source of route truth: returns every public route with its resolved title, description and canonical path. Imported by both the emitter and the gate so they can never disagree. |
| `scripts/build-seo.mjs` (create) | Post-build emitter: writes `dist/sitemap.xml`, `dist/robots.txt`, `dist/_redirects` and one `dist/<path>/index.html` per route. |
| `validation/prerender-seo.mjs` (create) | Permanent gate over the emitted `dist/`. |
| `vite.config.ts` (modify) | Registers the emitter as a `closeBundle` plugin, so it fires for any Vite build. `package.json` is deliberately **not** modified — see Task 5. |
| `public/robots.txt` | **Not used** — `robots.txt` is emitted by the script so its `Sitemap:` line stays consistent with the emitted origin. |

---

### Task 1: Route inventory module

**Files:**
- Create: `scripts/seo-routes.mjs`
- Test: `validation/prerender-seo.mjs` (created here, extended in later tasks)

**Interfaces:**
- Consumes: `validation/_load-app.cjs` → `loadApp(entry)`; `src/data/festival-pages.ts` → `FESTIVAL_PAGE_ROUTES`, `FESTIVAL_LEGACY_PATH_REDIRECTS`; `src/data/utility-calculators.ts` → `UTILITY_CALCULATORS`; `src/metadata/route-metadata.ts` → `routeMetadata`, `canonicalOrigin`.
- Produces: `publicRoutes()` → `Array<{ path: string, title: string, description: string, canonicalPath: string }>`; `legacyRedirects()` → `Array<{ from: string, to: string }>`; `origin()` → `string`. Later tasks import exactly these three names.

- [x] **Step 1: Write the failing gate**

Create `validation/prerender-seo.mjs`:

```js
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
```

- [x] **Step 2: Run it to confirm it fails**

```bash
export PATH="/opt/homebrew/bin:$PATH"; node validation/prerender-seo.mjs
```

Expected: `ERR_MODULE_NOT_FOUND` for `../scripts/seo-routes.mjs`.

- [x] **Step 3: Write the module**

Create `scripts/seo-routes.mjs`:

```js
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const { loadApp } = require(path.join(ROOT, "validation", "_load-app.cjs"));

const festivals = loadApp("src/data/festival-pages.ts");
const calculators = loadApp("src/data/utility-calculators.ts");
const metadata = loadApp("src/metadata/route-metadata.ts");

/* Fixed path routes. Prashna and Jyotish are deliberately absent: they are
   query-parameter screens (`/?screen=prashna`), and applyRouteMetadata()
   canonicalises to pathname, so they would collapse to "/" if listed. */
const FIXED = [
  { path: "/", args: { mode: "daily" } },
  { path: "/calculators", args: { mode: "daily", utility: { kind: "catalogue" } } },
  { path: "/muhurat/medical", args: { mode: "daily", medical: { kind: "medical" } } },
];

export function origin() {
  return metadata.canonicalOrigin();
}

export function publicRoutes() {
  const out = [];
  const push = (routePath, args) => {
    const meta = metadata.routeMetadata({ lang: "en", ...args });
    out.push({
      path: routePath,
      title: meta.title,
      description: meta.description,
      canonicalPath: meta.canonicalPath || routePath,
    });
  };

  for (const { path: routePath, args } of FIXED) push(routePath, args);

  for (const [routePath, entry] of Object.entries(festivals.FESTIVAL_PAGE_ROUTES)) {
    push(routePath, { mode: "daily", festival: entry });
  }

  for (const calculator of calculators.UTILITY_CALCULATORS) {
    push(`/calculator/${calculator.slug}`, {
      mode: "daily",
      utility: { kind: "calculator", calculator },
    });
  }

  return out;
}

export function legacyRedirects() {
  return Object.entries(festivals.FESTIVAL_LEGACY_PATH_REDIRECTS)
    .map(([from, to]) => ({ from, to }));
}
```

- [x] **Step 4: Run the gate to confirm it passes**

```bash
export PATH="/opt/homebrew/bin:$PATH"; node validation/prerender-seo.mjs
```

Expected: `prerender-seo gate: PASS — 198 routes, 10 legacy redirects, all titles unique.`

If the title-uniqueness assertion fails, **do not relax it** — it means two registry entries resolve to the same label, which is exactly the duplicate-content defect this work exists to remove. Record the colliding paths and stop; that is a content fix for the festival registry owner.

- [x] **Step 5: Prove the gate is non-vacuous**

Temporarily change `assert.equal(routes.length, 198, …)` to `199`, run, confirm it fails with `expected 198 public routes, got 198`, then restore and confirm PASS. Paste both outputs.

- [x] **Step 6: Commit**

```bash
git add scripts/seo-routes.mjs validation/prerender-seo.mjs
git commit -m "feat(seo): route inventory from the existing registries

198 public routes (181 festivals + 14 calculators + 3 fixed) resolved
through the existing routeMetadata(), which already computes correct
per-route titles and is merely called too late in the browser.

Prashna and Jyotish are excluded: they are query-parameter screens and
applyRouteMetadata() canonicalises to pathname, so listing them would
submit URLs that declare themselves duplicates of /.

Gate proven non-vacuous by expecting 199 routes."
```

---

### Task 2: Emit sitemap.xml and robots.txt

**Files:**
- Create: `scripts/build-seo.mjs`
- Modify: `validation/prerender-seo.mjs` (append sitemap assertions)

**Interfaces:**
- Consumes: `publicRoutes()`, `origin()` from Task 1.
- Produces: `dist/sitemap.xml`, `dist/robots.txt`. Task 3 extends the same `build-seo.mjs` entry point; Task 4 adds HTML emission to it.

- [x] **Step 1: Add the failing assertions**

Append to `validation/prerender-seo.mjs`:

```js
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
```

- [x] **Step 2: Run to confirm it fails**

```bash
export PATH="/opt/homebrew/bin:$PATH"; node validation/prerender-seo.mjs
```

Expected: `ENOENT … dist/sitemap.xml`.

- [x] **Step 3: Write the emitter**

Create `scripts/build-seo.mjs`:

```js
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
```

- [x] **Step 4: Build and run the gate**

```bash
export PATH="/opt/homebrew/bin:$PATH"; npm run build && node scripts/build-seo.mjs && node validation/prerender-seo.mjs
```

Expected: `build-seo: sitemap 198 URLs, robots.txt written.` then both gate PASS lines.

- [x] **Step 5: Prove non-vacuous**

Delete one `<url>` line from `dist/sitemap.xml` by hand, rerun the gate, confirm it fails naming that exact path, then re-run `node scripts/build-seo.mjs` and confirm PASS. Paste both outputs.

- [x] **Step 6: Commit**

```bash
git add scripts/build-seo.mjs validation/prerender-seo.mjs
git commit -m "feat(seo): emit a real sitemap.xml and robots.txt

Generated from the registries, so the sitemap cannot drift from the app.
Legacy festival paths are asserted absent — they get 301s in the next
task rather than sitemap entries."
```

---

### Task 3: Canonical 301s for the 10 legacy festival paths

**Files:**
- Modify: `scripts/build-seo.mjs` (add `emitRedirects`)
- Modify: `validation/prerender-seo.mjs` (append redirect assertions)
- Read only: `public/_redirects`

**Interfaces:**
- Consumes: `legacyRedirects()` from Task 1.
- Produces: `dist/_redirects` containing the 10 `301`s **above** the inherited base rules.

Ordering is load-bearing. `_redirects` is first-match-wins, so every specific rule must precede `/* /index.html 200`. `validation/favicon.cjs` already pins that invariant for the favicon rule and must keep passing.

- [x] **Step 1: Add the failing assertions**

Append to `validation/prerender-seo.mjs`:

```js
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
```

- [x] **Step 2: Run to confirm it fails**

```bash
export PATH="/opt/homebrew/bin:$PATH"; node validation/prerender-seo.mjs
```

Expected: `missing legacy 301: /festival/nrisimha-jayanti /festival/narasimha-jayanti 301`.

- [x] **Step 3: Implement**

Add to `scripts/build-seo.mjs`, above `main()`:

```js
export function emitRedirects() {
  const base = fs.readFileSync(path.join(ROOT, "public", "_redirects"), "utf8").trimEnd();
  const legacy = legacyRedirects().map(({ from, to }) => `${from} ${to} 301`);
  writeFile("_redirects", [
    "# Canonical redirects for historical festival slugs.",
    "# Generated by scripts/build-seo.mjs from FESTIVAL_LEGACY_PATH_REDIRECTS — do not hand-edit.",
    ...legacy,
    "",
    "# Base rules, inherited verbatim from public/_redirects.",
    base,
    "",
  ].join("\n"));
  return legacy.length;
}
```

and call it inside `main()`, after `emitRobots()`:

```js
  const redirectCount = emitRedirects();
  console.log(`build-seo: ${redirectCount} legacy 301s written ahead of the base rules.`);
```

- [x] **Step 4: Rebuild and verify**

```bash
export PATH="/opt/homebrew/bin:$PATH"; npm run build && node scripts/build-seo.mjs && node validation/prerender-seo.mjs && node validation/favicon.cjs
```

Expected: all PASS, including the pre-existing favicon gate.

- [x] **Step 5: Prove non-vacuous**

Reorder `emitRedirects` so the legacy rules are appended *after* `base` instead of before, rebuild, confirm the gate fails with `legacy 301 must precede the catch-all`, restore, confirm PASS. Paste both outputs.

- [x] **Step 6: Commit**

```bash
git add scripts/build-seo.mjs validation/prerender-seo.mjs
git commit -m "feat(seo): 301 the 10 legacy festival paths to their canonical slugs

festival-pages.ts:30 already said the deploy adapter should issue these;
no rule existed, so both paths served identical self-canonicalising
content. Generated from the registry and ordered ahead of the SPA
catch-all; the favicon ordering invariant still passes."
```

---

### Task 4: Per-route static HTML head

**Files:**
- Modify: `scripts/build-seo.mjs` (add `emitRouteHtml`)
- Modify: `validation/prerender-seo.mjs` (append HTML assertions)
- Read only: `dist/index.html` (the built shell — used as the template)

**Interfaces:**
- Consumes: `publicRoutes()`, `origin()`.
- Produces: `dist/<path>/index.html` for every route except `/`, whose file already exists and is rewritten in place.

The template is the **built** `dist/index.html`, not the source `index.html`, because the built one carries the hashed asset tags. We rewrite its head tags rather than regenerating the document, so any future head change by the `CODEX-P0-ROWS-38-39` lane flows through automatically.

- [x] **Step 1: Add the failing assertions**

Append to `validation/prerender-seo.mjs`:

```js
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
```

- [x] **Step 2: Run to confirm it fails**

```bash
export PATH="/opt/homebrew/bin:$PATH"; node validation/prerender-seo.mjs
```

Expected: `ENOENT … dist/calculators/index.html`.

- [x] **Step 3: Implement**

Add to `scripts/build-seo.mjs`:

```js
function replaceOrAppendHead(html, pattern, replacement) {
  return pattern.test(html)
    ? html.replace(pattern, replacement)
    : html.replace("</head>", `    ${replacement}\n  </head>`);
}

export function emitRouteHtml(routes) {
  const template = fs.readFileSync(path.join(DIST, "index.html"), "utf8");
  let written = 0;

  for (const route of routes) {
    const canonical = origin() + route.canonicalPath;
    let html = template;

    html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(route.title)}</title>`);
    html = replaceOrAppendHead(html, /<meta name="description" content="[^"]*"\s*\/?>/,
      `<meta name="description" content="${escapeHtml(route.description)}" />`);
    html = replaceOrAppendHead(html, /<link rel="canonical" href="[^"]*"\s*\/?>/,
      `<link rel="canonical" href="${escapeHtml(canonical)}" />`);
    html = replaceOrAppendHead(html, /<meta property="og:title" content="[^"]*"\s*\/?>/,
      `<meta property="og:title" content="${escapeHtml(route.title)}" />`);
    html = replaceOrAppendHead(html, /<meta property="og:description" content="[^"]*"\s*\/?>/,
      `<meta property="og:description" content="${escapeHtml(route.description)}" />`);
    html = replaceOrAppendHead(html, /<meta property="og:url" content="[^"]*"\s*\/?>/,
      `<meta property="og:url" content="${escapeHtml(canonical)}" />`);

    const relative = route.path === "/" ? "index.html" : `${route.path.replace(/^\//, "")}/index.html`;
    writeFile(relative, html);
    written += 1;
  }

  return written;
}
```

and the escaper, above it:

```js
function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
```

Call it in `main()` after `emitRedirects()`:

```js
  const htmlCount = emitRouteHtml(routes);
  console.log(`build-seo: ${htmlCount} route HTML files written.`);
```

- [x] **Step 4: Rebuild and verify**

```bash
export PATH="/opt/homebrew/bin:$PATH"; npm run build && node scripts/build-seo.mjs && node validation/prerender-seo.mjs
```

Expected: `build-seo: 198 route HTML files written.` and every gate line PASS.

- [x] **Step 5: Verify the actual served bytes, not just the gate**

```bash
grep -o '<title>[^<]*</title>' dist/festival/diwali/index.html
```

Expected: `<title>Diwali — Date, Timing and Worship Guide | Ganak</title>`

```bash
grep -o 'rel="canonical" href="[^"]*"' dist/calculator/rashi/index.html
```

Expected: `rel="canonical" href="https://ganakapp.com/calculator/rashi"`

- [x] **Step 6: Prove non-vacuous**

Change one route's title emission to a constant string, rebuild, confirm the gate fails with `wrong <title> for …`, restore, confirm PASS. Paste both outputs.

**Corrected during execution:** this step originally predicted a `duplicate title:` failure. That message is unreachable — the per-route equality assertion fires before the duplicate check, and Task 1's inventory-level uniqueness assertion blocks the only path that could reach it. The `duplicate title:` line in the gate is therefore dead code. It is harmless and stays as defence-in-depth, but the real guard against title collapse is the Task 1 assertion at `validation/prerender-seo.mjs:25`.

- [x] **Step 7: Commit**

```bash
git add scripts/build-seo.mjs validation/prerender-seo.mjs
git commit -m "feat(seo): emit per-route HTML so each page carries its own head

Every route previously served one identical shell declaring
canonical=https://ganakapp.com/, so all 198 told crawlers they were the
homepage. The head tags are rewritten on the built shell rather than
regenerated, so future head changes flow through automatically.

Head-only by design: no React SSR and no engine in the build, so this
needs no default-place decision."
```

---

### Task 5: Wire into the build and verify in production

**Files:**
- Modify: `vite.config.ts`
- Modify: `plans/task-log.md` (own row)

**Why a Vite plugin and not a `package.json` script:** the Cloudflare Pages build
command lives in the dashboard, not in this repo. If it is set to `vite build` rather
than `npm run build`, a `package.json`-only hook would silently never run — the site
would deploy exactly as it does today while every local gate stayed green. Hooking
`closeBundle` makes the step fire for *any* invocation of Vite's build, so the
dashboard setting cannot void the work. This removes what would otherwise be an
unverifiable owner gate.

- [x] **Step 1: Wire the build**

Replace `vite.config.ts` with:

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/* Emit sitemap.xml, robots.txt, the canonical 301s and one HTML file per route
   after the bundle is written. This runs inside Vite's own build rather than as
   an `npm run build` step so it cannot be bypassed by the Cloudflare Pages build
   command, which is configured in the dashboard and not in this repo. */
function seoEmitter() {
  return {
    name: "ganak-seo-emitter",
    apply: "build" as const,
    closeBundle: async () => {
      const { emitAll } = await import("./scripts/build-seo.mjs");
      emitAll();
    },
  };
}

export default defineConfig({
  plugins: [react(), seoEmitter()],
  server: {
    port: 5173,
  },
});
```

- [x] **Step 2: Make the emitter importable**

`scripts/build-seo.mjs` currently calls `main()` at module load, which would fire on
import. Change the bottom of the file from:

```js
main();
```

to:

```js
export function emitAll() {
  main();
}

/* Still runnable standalone: `node scripts/build-seo.mjs` */
if (process.argv[1] && process.argv[1].endsWith("build-seo.mjs")) main();
```

- [x] **Step 3: Verify a clean build produces everything in ONE command**

```bash
export PATH="/opt/homebrew/bin:$PATH"; rm -rf dist && npx vite build && node validation/prerender-seo.mjs
```

Expected: `build-seo:` lines appear during the Vite build itself — note this uses bare
`vite build`, proving the hook does not depend on `npm run build`. Gate passes.

Then confirm the npm path works too:

```bash
export PATH="/opt/homebrew/bin:$PATH"; rm -rf dist && npm run build && node validation/prerender-seo.mjs
```

Expected: identical output. `dist/` is regenerated from scratch each time — Vite
empties it, and `closeBundle` runs after that, so ordering is guaranteed.

- [x] **Step 4: Run the full canonical gate suite**

```bash
export PATH="/opt/homebrew/bin:$PATH"; for f in validation/*.cjs; do node "$f" >/dev/null 2>&1 || echo "FAIL: $f"; done; echo "cjs sweep done"
```

Expected: `cjs sweep done` with no FAIL lines. Then:

```bash
export PATH="/opt/homebrew/bin:$PATH"; node validation/route-metadata.cjs && node validation/favicon.cjs && node validation/canonical-deployment.cjs && node validation/backlog-sheet-sync.mjs
```

Expected: all PASS.

- [x] **Step 5: Commit**

```bash
git add vite.config.ts scripts/build-seo.mjs
git commit -m "build(seo): emit SEO artifacts from inside the Vite build

Hooked as a closeBundle plugin rather than an npm script so the step
cannot be bypassed by the Cloudflare Pages build command, which lives
in the dashboard and is not verifiable from this repo. Verified under
bare \`vite build\` as well as \`npm run build\`."
```

- [ ] **Step 6: Post-deploy production verification**

After merge and deploy, confirm the served bytes — the SPA catch-all previously returned homepage HTML with `200` for these paths, so a `200` alone proves nothing. Check the content type and body:

```bash
curl -sS https://ganakapp.com/robots.txt | head -5
```

Expected: `User-agent: *` — **not** `<!doctype html>`.

```bash
curl -sS https://ganakapp.com/sitemap.xml | head -3
```

Expected: `<?xml version="1.0" encoding="UTF-8"?>`.

```bash
curl -sS https://ganakapp.com/festival/diwali | grep -o '<link rel="canonical" href="[^"]*"'
```

Expected: `<link rel="canonical" href="https://ganakapp.com/festival/diwali"` — the homepage value here means static assets are losing to the `/*` rule, and the fix is to add explicit passthrough rules above the catch-all in `emitRedirects`.

```bash
curl -sSI https://ganakapp.com/festival/nrisimha-jayanti | grep -i "^HTTP/\|^location:"
```

Expected: `301` and `location: /festival/narasimha-jayanti`.

- [ ] **Step 7: Record and hand off**

Update `plans/task-log.md` with the gate output and the production `curl` results, then move register row 62 off 0% and note that row 26's sitemap/robots/301 scope is delivered.

**Then, and only then**, register row 63 (Search Console) becomes actionable — that is the owner's step, and row 64 (Hindi URLs) should be answered before the sitemap is submitted.

---

## Out of scope, deliberately

| Item | Why | Where it lives |
|---|---|---|
| Real body content in the HTML (full SSG) | Forces a default-place decision — timings are place-dependent | Register row 62, Stage B |
| `og:image` share cards | Needs a Pages Function to render images; independent of this | Register row 26, second half |
| `schema.org` `Event` JSON-LD | Only pays off once bodies are prerendered | Register row 62, Stage B |
| Hindi URLs and `hreflang` | Unresolved owner decision; inventing `/hi/` here would prejudge it | Register row 64 |
| Prashna / Jyotish crawlable paths | Routing change in `kundli-app.tsx`, collides with other lanes | New — needs a register row |
| Google Search Console submission | Owner credentials and DNS; agents must not touch either | Register row 63 |
