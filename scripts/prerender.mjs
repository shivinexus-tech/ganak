#!/usr/bin/env node
/*
 * Build-time prerender for the Ganak SPA (INFRA-SPA-PRERENDER).
 *
 * WHY: Ganak is a pure client-rendered Vite + React SPA. The server ships a
 * near-empty HTML shell (`<div id="root"></div>`) and JavaScript draws every page
 * in the browser. Crawlers and AI answer-engines that read raw HTML before running
 * JS see a blank page, so nothing ranks. This script renders each route with React
 * on the server (ReactDOMServer via Vite's SSR pipeline) AFTER `npm run build`, and
 * writes the real HTML to `dist/<route>/index.html`. Cloudflare Pages serves those
 * static files ahead of the `/* /index.html 200` SPA fallback, so a crawler curling
 * `/festival/diwali` now gets real content, while the same JS bundle still loads and
 * renders the interactive app.
 *
 * APPROACH — in-process SSR, no headless browser:
 *   - No Chromium is downloaded or launched. Rendering happens in Node through
 *     Vite `ssrLoadModule`, so this also runs in Cloudflare's build CI (which has
 *     no Chrome) with zero extra infra.
 *   - A jsdom window/document/localStorage is installed on globalThis for the
 *     target route before each render, so the app's `window.location.pathname`
 *     reads resolve to the route being frozen and storage-guarded providers work.
 *
 * WHAT GETS BAKED: the synchronous, place-independent content of a route (festival
 * identity/meaning/worship guide, bilingual Devanagari headers, calculator copy),
 * plus the per-route <title>/description/canonical the client would set. The
 * place-dependent festival timing block is computed in a client useEffect (default
 * New Delhi) and is deliberately NOT baked, so each visitor sees their own city.
 *
 * HYDRATION: the app mounts with `createRoot().render()`, not `hydrateRoot()`.
 * createRoot discards the prerendered markup and re-renders from scratch, so there
 * is zero hydration-mismatch risk even though prerendered timing would differ by
 * place. The prerendered HTML exists purely for crawlers.
 *
 * NOT wired into the default `npm run build` Cloudflare runs — production deploys
 * are unaffected until the owner opts in. Run explicitly:
 *     npm run build && npm run prerender      (or: npm run build:seo)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";
import { JSDOM } from "jsdom";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DIST = path.join(ROOT, "dist");
const ORIGIN = "https://ganakapp.com";

// Representative subset (task scope): home, a festival page, the calculators
// catalogue and one calculator. Widen the rollout by adding real path routes here
// (see src/kundli-app.tsx path helpers) — not ?screen= query modes.
const ROUTES = [
  "/",
  "/festival/diwali",
  "/calculators",
  "/calculator/rashi",
];

// Install a jsdom environment for `route` on globalThis so app modules that read
// window/document/localStorage during render resolve against this route.
function installDom(route) {
  const dom = new JSDOM("<!doctype html><html><head></head><body></body></html>", {
    url: `${ORIGIN}${route}`,
    pretendToBeVisual: true,
  });
  const { window } = dom;
  globalThis.window = window;
  globalThis.document = window.document;
  globalThis.localStorage = window.localStorage;
  globalThis.HTMLElement = window.HTMLElement;
  globalThis.customElements = window.customElements;
  globalThis.CSS = window.CSS || { supports: () => false };
  if (!("navigator" in globalThis) || !globalThis.navigator?.userAgent) {
    try { globalThis.navigator = window.navigator; } catch { /* read-only in Node — fine */ }
  }
  return dom;
}

function outPathFor(route) {
  if (route === "/") return path.join(DIST, "index.html");
  const clean = route.replace(/^\/+|\/+$/g, "");
  return path.join(DIST, clean, "index.html");
}

// Merge rendered app markup + per-route <head> tags into the built shell.
function composePage(templateHtml, rendered) {
  const dom = new JSDOM(templateHtml);
  const doc = dom.window.document;

  doc.documentElement.setAttribute("lang", rendered.lang || "en");
  if (rendered.title) doc.title = rendered.title;

  const upsertMeta = (selector, attr, key, value) => {
    if (!value) return;
    let node = doc.head.querySelector(selector);
    if (!node) {
      node = doc.createElement("meta");
      node.setAttribute(attr, key);
      doc.head.appendChild(node);
    }
    node.setAttribute("content", value);
  };
  upsertMeta('meta[name="description"]', "name", "description", rendered.description);
  upsertMeta('meta[property="og:title"]', "property", "og:title", rendered.title);
  upsertMeta('meta[property="og:description"]', "property", "og:description", rendered.description);
  upsertMeta('meta[property="og:url"]', "property", "og:url", rendered.canonical);

  let canonical = doc.head.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = doc.createElement("link");
    canonical.setAttribute("rel", "canonical");
    doc.head.appendChild(canonical);
  }
  if (rendered.canonical) canonical.setAttribute("href", rendered.canonical);

  const root = doc.getElementById("root");
  if (!root) throw new Error("template has no #root");
  root.innerHTML = rendered.appHtml;

  return "<!doctype html>\n" + doc.documentElement.outerHTML;
}

async function main() {
  const templatePath = path.join(DIST, "index.html");
  if (!fs.existsSync(templatePath)) {
    console.error("✗ dist/index.html not found — run `npm run build` first.");
    process.exit(1);
  }
  const template = fs.readFileSync(templatePath, "utf8");

  const vite = await createServer({
    root: ROOT,
    logLevel: "error",
    appType: "custom",
    server: { middlewareMode: true, hmr: false, ws: false },
  });

  const results = [];
  try {
    for (const route of ROUTES) {
      const dom = installDom(route);
      try {
        const mod = await vite.ssrLoadModule("/src/entry-prerender.tsx");
        const rendered = mod.renderRoute();
        if (!rendered.appHtml || rendered.appHtml.length < 200) {
          throw new Error(`rendered markup suspiciously short (${rendered.appHtml.length} bytes)`);
        }
        const html = composePage(template, rendered);
        const out = outPathFor(route);
        fs.mkdirSync(path.dirname(out), { recursive: true });
        fs.writeFileSync(out, html, "utf8");
        const rel = path.relative(ROOT, out);
        results.push({ route, ok: true });
        console.log(`✓ ${route.padEnd(22)} → ${rel} (${html.length} bytes, app ${rendered.appHtml.length} bytes)`);
      } catch (err) {
        results.push({ route, ok: false, error: String((err && err.stack) || err) });
        console.error(`✗ ${route.padEnd(22)} FAILED: ${(err && err.message) || err}`);
      } finally {
        dom.window.close();
      }
    }
  } finally {
    await vite.close();
  }

  const failed = results.filter((r) => !r.ok);
  console.log(`\nPrerendered ${results.length - failed.length}/${results.length} routes.`);
  if (failed.length) {
    for (const f of failed) console.error(`\n--- ${f.route} ---\n${f.error}`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
