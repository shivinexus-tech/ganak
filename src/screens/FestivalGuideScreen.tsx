/* Shareable festival-guide entry screen. The normal Fasts & Festivals list keeps
   its existing click/expand behaviour; these routes are an additional entry path. */

import React, { useEffect } from "react";
import { T } from "../components/tokens";
import VratVidhiCard from "../components/VratVidhiCard";
import { VRAT_VIDHI } from "../data/vrat-vidhis";
import { FESTIVAL_PAGE_ROUTES, FEST_META, OBS_META } from "../data/festival-pages";

const FESTIVAL_GUIDE_ROUTES = FESTIVAL_PAGE_ROUTES;

function normalizedFestivalPath(pathname) {
  const clean = String(pathname || "/").replace(/\/{2,}/g, "/");
  return clean.length > 1 ? clean.replace(/\/+$/, "") : clean;
}

function festivalGuideFromPath(pathname) {
  return FESTIVAL_GUIDE_ROUTES[normalizedFestivalPath(pathname)] || null;
}

function FestivalGuideScreen({ guide, lang, C, card }) {
  const L = lang === "hi" ? "hi" : "en";
  const data = guide && guide.vidhiKey ? VRAT_VIDHI[guide.vidhiKey] : null;
  const meta = guide
    ? (guide.sourceKind === "observance" ? OBS_META[guide.metaKey] : FEST_META[guide.metaKey])
    : null;
  const title = guide ? guide.title[L] : "";
  const homeHref = `/?lang=${L}&screen=daily`;

  useEffect(() => {
    if (!title || typeof document === "undefined") return undefined;
    const previousTitle = document.title;
    document.title = `${title} · Ganak`;
    return () => { document.title = previousTitle; };
  }, [title]);

  if (!guide) return null;

  const timingText = meta && meta.timing
    ? ({
        parana: { en: "This observance has a paran (fast-completion) time.", hi: "इस व्रत में पारण का समय लागू होता है।" },
        sunrise: { en: "Sunrise or daybreak matters for this observance.", hi: "इस पर्व में सूर्योदय या प्रातःकाल महत्वपूर्ण है।" },
        morning: { en: "The morning period matters for this observance.", hi: "इस पर्व में प्रातःकाल महत्वपूर्ण है।" },
        midnight: { en: "The midnight or Nishita period matters for this observance.", hi: "इस पर्व में मध्यरात्रि या निषीथ काल महत्वपूर्ण है।" },
        sunset: { en: "The evening or sunset period matters for this observance.", hi: "इस व्रत में संध्या या सूर्यास्त का समय महत्वपूर्ण है।" },
        moonrise: { en: "Moonrise matters for completing this observance.", hi: "इस व्रत के समापन में चन्द्रोदय महत्वपूर्ण है।" },
        stars: { en: "Star sighting matters for completing this observance.", hi: "इस व्रत के समापन में तारा-दर्शन महत्वपूर्ण है।" },
      }[meta.timing] || null)
    : null;

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
          {data
            ? (L === "hi" ? "व्रत एवं पूजा मार्गदर्शिका" : "FASTING & WORSHIP GUIDE")
            : (L === "hi" ? "पर्व एवं व्रत परिचय" : "FESTIVAL & OBSERVANCE OVERVIEW")}
        </div>
        <h2 id="festival-guide-title" style={{ margin: "0 0 5px", color: C.ivory, fontFamily: T.serif, fontSize: T.fHeading, lineHeight: 1.2 }}>
          {title}
        </h2>
        <p style={{ margin: "0 0 14px", color: C.muted, fontSize: T.fSmall, lineHeight: 1.55 }}>
          {data
            ? (L === "hi"
                ? "पहले संक्षिप्त उत्तर, फिर व्रत, पूजा, पारण और उद्यापन की पूरी विधि।"
                : "A clear answer first, followed by the complete fasting, puja, paran and udyapan guidance.")
            : (L === "hi"
                ? "गणक में अभी उपलब्ध पंचांग परिचय नीचे है। विस्तृत पूजा-विधि स्रोत और समीक्षा के बाद ही जोड़ी जाएगी।"
                : "Below is the calendar description currently available in Ganak. Detailed worship guidance will be added only after it is sourced and reviewed.")}
        </p>
        <div style={{ marginBottom: 12, padding: "9px 11px", borderRadius: T.rMd, border: `1px solid ${C.line}`, background: "rgba(168,106,18,.06)", color: C.muted, fontSize: T.fSmall, lineHeight: 1.5 }}>
          {L === "hi"
            ? "शहर के अनुसार तारीख़ और पूजा-समय दिखाने वाला स्थान चयन अलग निर्धारित अपडेट में जोड़ा जा रहा है। तब तक अपने शहर का समय दैनिक पंचांग में देखें।"
            : "Place selection for city-specific dates and puja times is tracked in a separate update. Until then, check the Daily Panchang for your city."}
        </div>
        {data ? (
          <VratVidhiCard data={data} lang={lang} C={C} initiallyOpen />
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {meta && meta.gloss && (
              <div style={{ padding: "12px 13px", borderRadius: T.rMd, background: C.panel, border: `1px solid ${C.line}`, color: C.ivory, fontSize: T.fSmall, lineHeight: 1.55 }}>
                {meta.gloss[L]}
              </div>
            )}
            {meta && meta.deity && (
              <div style={{ color: C.muted, fontSize: T.fSmall, lineHeight: 1.5 }}>
                <strong style={{ color: C.ivory }}>{L === "hi" ? "आराध्य: " : "Deity: "}</strong>{meta.deity[L]}
              </div>
            )}
            {meta && meta.rules && (
              <div style={{ color: C.muted, fontSize: T.fSmall, lineHeight: 1.55 }}>
                <strong style={{ color: C.ivory }}>{L === "hi" ? "परम्परा: " : "Observance: "}</strong>{meta.rules[L]}
              </div>
            )}
            {timingText && (
              <div style={{ color: C.muted, fontSize: T.fSmall, lineHeight: 1.55 }}>
                <strong style={{ color: C.ivory }}>{L === "hi" ? "समय: " : "Timing: "}</strong>{timingText[L]}
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}

export default FestivalGuideScreen;
export { FESTIVAL_GUIDE_ROUTES, festivalGuideFromPath, normalizedFestivalPath };
