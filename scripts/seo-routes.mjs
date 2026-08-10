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
