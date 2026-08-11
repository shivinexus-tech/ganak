import React from "react";
import { FEST_NAME } from "../data/festival-meta";

/* Breadcrumbs for the standalone (deep-linked) pages — medical muhurat, calculators,
   festival guides. On those pages the Daily/Prashna/Jyotish tabs are hidden, so the
   breadcrumb is the visible, discoverable way up/home (a clickable logo alone is not,
   per NN/g). Written untyped, JS-style, to keep validation/parse-check.js clean.
   Trail: an array of { label, href }; the LAST item is the current page (href === null),
   every earlier item is a link. */

const LBL = {
  ganak: { en: "Ganak", hi: "गणक" },
  muhurat: { en: "Muhurat", hi: "मुहूर्त" },
  medical: { en: "Medical timing", hi: "चिकित्सा समय" },
  jyotish: { en: "Jyotish", hi: "ज्योतिष" },
  calculators: { en: "Calculators", hi: "कैलकुलेटर" },
};
const pick = (o, lang) => (o && (lang === "hi" ? o.hi : o.en)) || "";

function calculatorContextQuery(search, lang) {
  const source = new URLSearchParams(search || "");
  const out = new URLSearchParams({ lang: lang === "hi" ? "hi" : "en" });
  if (["city", "lat", "lon", "zone"].every((key) => source.get(key))) {
    for (const key of ["city", "lat", "lon", "zone"]) out.set(key, source.get(key));
  }
  return out.toString();
}

function breadcrumbTrail(ctx, lang, search = "") {
  const l = lang === "hi" ? "hi" : "en";
  const trail = [{ label: pick(LBL.ganak, l), href: `/?lang=${l}` }];
  if (ctx && ctx.medical) {
    // The #muhurat-finder anchor is best-effort — the finder mounts after async
    // panchang compute, so an on-load scroll may not reach it; it still lands on Daily.
    trail.push({ label: pick(LBL.muhurat, l), href: `/?lang=${l}&screen=daily#muhurat-finder` });
    trail.push({ label: pick(LBL.medical, l), href: null });
  } else if (ctx && ctx.utility) {
    const u = ctx.utility;
    const utilityQuery = calculatorContextQuery(search, l);
    const chartQuery = new URLSearchParams(utilityQuery);
    chartQuery.set("screen", "chart");
    trail.push({ label: pick(LBL.jyotish, l), href: `/?${chartQuery.toString()}` });
    if (u.kind === "calculator" && u.calculator) {
      trail.push({ label: pick(LBL.calculators, l), href: `/calculators/?${utilityQuery}` });
      trail.push({ label: pick(u.calculator, l), href: null });
    } else {
      trail.push({ label: pick(LBL.calculators, l), href: null });
    }
  } else if (ctx && ctx.festival && ctx.festival.key) {
    const name = FEST_NAME[ctx.festival.key];
    trail.push({ label: (name && pick(name, l)) || ctx.festival.key, href: null });
  }
  return trail;
}

function Breadcrumbs({ ctx, lang, C }) {
  const trail = breadcrumbTrail(ctx, lang, typeof location === "undefined" ? "" : location.search);
  const followUtilityLink = (event) => {
    if (!ctx?.utility || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const href = event.currentTarget.getAttribute("href");
    if (!href) return;
    window.history.pushState(window.history.state, "", href);
    window.dispatchEvent(new PopStateEvent("popstate"));
    window.scrollTo({ top: 0, behavior: "auto" });
  };
  if (trail.length < 2) return null;
  const sep = { margin: "0 0.375rem", color: C.muted };
  return (
    <nav aria-label={lang === "hi" ? "मार्ग-सूची" : "Breadcrumb"} style={{ marginBottom: "0.5rem" }}>
      <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", alignItems: "center", flexWrap: "nowrap", fontSize: "var(--font-small)", fontFamily: "inherit", overflow: "hidden" }}>
        {trail.map((item, i) => {
          const last = i === trail.length - 1;
          return (
            <li key={i} style={{ display: "flex", alignItems: "center", minWidth: 0, flexShrink: last ? 1 : 0 }}>
              {i > 0 && <span aria-hidden="true" style={sep}>›</span>}
              {last || item.href === null
                ? <span aria-current="page" title={item.label} style={{ color: C.ivory, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", minWidth: 0 }}>{item.label}</span>
                : <a href={item.href} onClick={followUtilityLink} className="comfort-focus" style={{ color: C.gold, textDecoration: "none", whiteSpace: "nowrap", minHeight: 44, padding: "0.375rem 0", display: "inline-flex", alignItems: "center" }}>{item.label}</a>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export { breadcrumbTrail, calculatorContextQuery };
export default Breadcrumbs;
