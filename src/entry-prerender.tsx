/*
 * SSR entry used only by scripts/prerender.mjs (INFRA-SPA-PRERENDER).
 *
 * This is NOT part of the client bundle and never ships to the browser. It renders
 * the exact same provider tree main.tsx mounts, but with ReactDOMServer, so the
 * synchronous, place-independent content of a route (festival identity, meaning,
 * worship guide, bilingual Devanagari headers, calculator copy) becomes real HTML
 * a crawler can read before any JS runs. Place-dependent timing is intentionally
 * left out: it is computed in a client useEffect (default New Delhi) and must stay
 * client-side so each visitor sees their own city — see the hydration note in
 * scripts/prerender.mjs. The client boots with createRoot().render(), which
 * discards this markup and re-renders, so there is no hydration-mismatch risk.
 *
 * The prerender script sets a jsdom `window`/`document`/`location` for the target
 * route on globalThis BEFORE calling render(), so the app's
 * `window.location.pathname` reads resolve to the route being frozen.
 */
import React from "react";
import { renderToString } from "react-dom/server";

import AppErrorBoundary from "./components/AppErrorBoundary";
import { ComfortProvider } from "./accessibility/ComfortProvider";
import AccessibilityRoot from "./accessibility/AccessibilityRoot";
import KundliApp from "./kundli-app";

import { festivalGuideFromPath } from "./screens/FestivalGuideScreen";
import { utilityFromPath } from "./data/utility-calculators";
import { medicalMuhuratFromPath } from "./screens/MedicalMuhuratScreen";
import { routeMetadata, canonicalOrigin } from "./metadata/route-metadata";

function currentPath() {
  return typeof window !== "undefined" ? window.location.pathname : "/";
}

function currentLang() {
  try {
    const q = typeof window !== "undefined" ? window.location.search : "";
    const v = new URLSearchParams(q).get("lang");
    return v === "hi" ? "hi" : "en";
  } catch {
    return "en";
  }
}

// Mirror the meta computation kundli-app runs in its route-metadata effect, which
// renderToString does not execute. Same helpers, same inputs → identical <title>,
// description and canonical the client would set.
export function renderRoute() {
  const path = currentPath();
  const lang = currentLang();
  const festival = festivalGuideFromPath(path);
  const utility = utilityFromPath(path);
  const medical = medicalMuhuratFromPath(path);
  const meta = routeMetadata({ lang, mode: "daily", festival, utility, medical, muhurat: null });
  const canonical = canonicalOrigin() + (meta.canonicalPath || path || "/");

  const appHtml = renderToString(
    <AppErrorBoundary>
      <ComfortProvider>
        <AccessibilityRoot>
          <KundliApp />
        </AccessibilityRoot>
      </ComfortProvider>
    </AppErrorBoundary>
  );

  return {
    appHtml,
    lang,
    title: meta.title,
    description: meta.description,
    canonical,
  };
}
