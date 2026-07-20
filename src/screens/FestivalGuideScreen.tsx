/* Shareable festival-guide entry screen. The normal Fasts & Festivals list keeps
   its existing click/expand behaviour; these routes are an additional entry path. */

import React, { useEffect } from "react";
import { T } from "../components/tokens";
import VratVidhiCard from "../components/VratVidhiCard";
import { VRAT_VIDHI } from "../data/vrat-vidhis";

const FESTIVAL_GUIDE_ROUTES = Object.freeze({
  "/festival/hartalika-teej": {
    slug: "hartalika-teej",
    vidhiKey: "hartalikaTeej",
    title: { en: "Hartalika Teej", hi: "हरतालिका तीज" },
  },
  "/festival/chaitra-navratri": {
    slug: "chaitra-navratri",
    vidhiKey: "chaitraNavratri",
    title: { en: "Chaitra Navratri", hi: "चैत्र नवरात्रि" },
  },
  "/festival/sharad-navratri": {
    slug: "sharad-navratri",
    vidhiKey: "sharadNavratri",
    title: { en: "Sharad Navratri", hi: "शारदीय नवरात्रि" },
  },
  "/festival/chhath": {
    slug: "chhath",
    vidhiKey: "chhath",
    title: { en: "Chhath — four-day observance", hi: "छठ — चार-दिवसीय व्रत" },
  },
});

function normalizedFestivalPath(pathname) {
  const clean = String(pathname || "/").replace(/\/{2,}/g, "/");
  return clean.length > 1 ? clean.replace(/\/+$/, "") : clean;
}

function festivalGuideFromPath(pathname) {
  return FESTIVAL_GUIDE_ROUTES[normalizedFestivalPath(pathname)] || null;
}

function FestivalGuideScreen({ guide, lang, C, card }) {
  const L = lang === "hi" ? "hi" : "en";
  const data = guide ? VRAT_VIDHI[guide.vidhiKey] : null;
  const title = guide ? guide.title[L] : "";
  const homeHref = `/?lang=${L}&screen=daily`;

  useEffect(() => {
    if (!title || typeof document === "undefined") return undefined;
    const previousTitle = document.title;
    document.title = `${title} · Ganak`;
    return () => { document.title = previousTitle; };
  }, [title]);

  if (!guide || !data) return null;

  return (
    <main className="rise" aria-labelledby="festival-guide-title">
      <a
        href={homeHref}
        style={{ display: "inline-flex", alignItems: "center", minHeight: T.ctrlH, padding: "0 14px", marginBottom: T.s3, border: `1px solid ${C.line}`, borderRadius: T.rMd, background: C.panel, color: C.ivory, textDecoration: "none", fontSize: T.fSmall }}
      >
        ‹ {L === "hi" ? "आज के पंचांग पर वापस जाएँ" : "Back to today's panchang"}
      </a>

      <section style={{ ...card, padding: "20px", overflow: "hidden" }}>
        <div style={{ ...T.label, color: C.gold, marginBottom: 6 }}>
          {L === "hi" ? "व्रत एवं पूजा मार्गदर्शिका" : "FASTING & WORSHIP GUIDE"}
        </div>
        <h2 id="festival-guide-title" style={{ margin: "0 0 5px", color: C.ivory, fontFamily: T.serif, fontSize: T.fHeading, lineHeight: 1.2 }}>
          {title}
        </h2>
        <p style={{ margin: "0 0 14px", color: C.muted, fontSize: T.fSmall, lineHeight: 1.55 }}>
          {L === "hi"
            ? "पहले संक्षिप्त उत्तर, फिर व्रत, पूजा, पारण और उद्यापन की पूरी विधि।"
            : "A clear answer first, followed by the complete fasting, puja, paran and udyapan guidance."}
        </p>
        <div style={{ marginBottom: 12, padding: "9px 11px", borderRadius: T.rMd, border: `1px solid ${C.line}`, background: "rgba(168,106,18,.06)", color: C.muted, fontSize: T.fSmall, lineHeight: 1.5 }}>
          {L === "hi"
            ? "तारीख़ और पूजा का समय आपके शहर के अनुसार बदलता है। नीचे जिस स्थानीय समय का उल्लेख है, उसे देखने के लिए इस पर्व को दैनिक पंचांग में खोलें।"
            : "The date and puja time depend on your city. Open this festival in the Daily Panchang to see the local timing referred to below."}
        </div>
        <VratVidhiCard data={data} lang={lang} C={C} initiallyOpen />
      </section>
    </main>
  );
}

export default FestivalGuideScreen;
export { FESTIVAL_GUIDE_ROUTES, festivalGuideFromPath, normalizedFestivalPath };
