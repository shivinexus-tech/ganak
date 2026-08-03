import React, { useEffect, useState } from "react";
import { T } from "./components/ui-style-contract";
import PrashnaScreen from "./screens/PrashnaScreen";
import ChartScreen from "./screens/ChartScreen";
import DailyScreen from "./screens/DailyScreen";
import FestivalGuideScreen, { festivalGuideFromPath } from "./screens/FestivalGuideScreen";
import UtilityCalculatorScreen from "./screens/UtilityCalculatorScreen";
import { utilityFromPath } from "./data/utility-calculators";
import MedicalMuhuratScreen, { medicalMuhuratFromPath } from "./screens/MedicalMuhuratScreen";
import FeedbackCard from "./components/FeedbackCard";
import { applyRouteMetadata, routeMetadata } from "./metadata/route-metadata";
import { privacyEvent } from "./telemetry/privacy-events";
import { useComfort } from "./accessibility/ComfortProvider";
import { FEST_NAME } from "./data/festival-meta";
import { urlPrefGet, urlPrefSet, urlPrefsSet } from "./components/url-prefs";
import {
  scanPanchangCalendar, ayyappaMandalaFor,
} from "./engine/festivals";
import {
  muhuratScanRange, muhuratForDate, muhuratShuddhi, MUHURTA_RULES,
} from "./engine/muhurat";

/* ============================================================
   GANAK — shell: nav, shared prefs/place, screen compose
   ============================================================ */

function pageHeroCopy(lang, mode, directFestivalGuide, utilityRoute = null, medicalRoute = null, muhuratRoute = null) {
  const hi = lang === "hi";
  if (utilityRoute) return { eyebrow: hi ? "ज्योतिष कैलकुलेटर" : "ASTROLOGY CALCULATORS", detail: hi ? "स्पष्ट उत्तर · पारदर्शी पद्धति · स्थायी लिंक" : "Clear answers · transparent methods · permanent links" };
  if (medicalRoute) return { eyebrow: hi ? "चिकित्सा मुहूर्त" : "MEDICAL MUHURAT", detail: hi ? "सुरक्षा प्रथम · केवल लचीली तिथियाँ · उपचार में कभी विलम्ब नहीं" : "Safety first · flexible dates only · never delay care" };
  if (directFestivalGuide) {
    const hasFullGuide = Boolean(directFestivalGuide.vidhiKey);
    return {
      eyebrow: hasFullGuide
        ? (hi ? "व्रत एवं पूजा" : "FASTING & WORSHIP")
        : (hi ? "पर्व एवं व्रत" : "FESTIVAL & OBSERVANCE"),
      detail: hasFullGuide
        ? (hi
            ? "पर्व-तिथि · स्थानीय समय · व्रत एवं पूजा मार्गदर्शन"
            : "Festival date · local timing · fasting and worship guidance")
        : (hi
            ? "पर्व-तिथि · स्थानीय समय · प्रमाणित पंचांग परिचय"
            : "Festival date · local timing · verified calendar overview"),
    };
  }
  if (muhuratRoute) return { eyebrow: hi ? "शुभ मुहूर्त" : "SHUBH MUHURAT", detail: hi ? "कार्य · स्थान · अवधि · कारण सहित चुने हुए शुभ समय" : "Activity · place · date range · ranked windows with reasons" };
  if (mode === "prashna") {
    return {
      eyebrow: hi ? "प्रश्न" : "PRASHNA",
      detail: hi
        ? "प्रश्न का क्षण · चुना हुआ स्थान · स्पष्ट मार्गदर्शन"
        : "Question moment · selected place · clear guidance",
    };
  }
  if (mode === "chart") {
    return {
      eyebrow: hi ? "ज्योतिष" : "JYOTISH",
      detail: hi
        ? "वैदिक जन्म कुंडली · लाहिरी अयनांश · पूर्ण-राशि भाव · विंशोत्तरी दशा"
        : "Vedic birth chart · Lahiri ayanamsa · whole-sign houses · Vimshottari dasha",
    };
  }
  return {
    eyebrow: hi ? "पञ्चाङ्ग" : "PANCHANG",
    detail: hi
      ? "तिथि · व्रत एवं त्योहार · शुभ समय"
      : "Tithi · fasts and festivals · auspicious timings",
  };
}


export default function KundliApp() {
  // Choosing a city anywhere in the app is a deliberate user action, so it is remembered as
  // the home place — it used to survive only in the URL and vanish on a plain reload.
  const { updatePreferences } = useComfort();
  // The shared palette every screen receives. These are semantic custom properties, not
  // values: light/dark, warmth and the later brand swap all resolve in
  // src/styles/design-tokens.css, so no screen needs to know which mode it is in.
  const C = {
    bg: "var(--bg-active)", panel: "var(--surface-active)", line: "var(--line)",
    gold: "var(--gold)", sindoor: "var(--bad)", ivory: "var(--ink)", muted: "var(--muted)",
    good: "var(--good)", accent: "var(--accent)", soft: "var(--surface-sunken)",
    hover: "var(--surface-hover)", accentSoft: "var(--accent-soft)", lineSoft: "var(--line-soft)",
    onAccent: "var(--on-accent)",
  };
  const card = {
    background: "var(--surface-active)",
    border: `0.0625rem solid ${C.line}`,
    borderRadius: T.rLg,
    boxShadow: T.e2,
  };

  const detectLang = () => { try { const ls = (navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || "en"]).map((x) => String(x || "").toLowerCase()); return ls.some((l) => l.startsWith("hi")) ? "hi" : "en"; } catch (e) { return "en"; } };
  // Language and screen survive a reload via the URL (?lang=hi&screen=prashna) —
  // browser storage is banned in this project, but the address bar is not storage.
  const [lang, setLang] = useState(() => { const v = urlPrefGet("lang"); return v === "hi" || v === "en" ? v : detectLang(); });
  const chooseLang = (v) => { setLang(v); urlPrefSet("lang", v); };
  const [mode, setMode] = useState(() => { const v = urlPrefGet("screen"); return v === "prashna" || v === "daily" || v === "chart" ? v : "daily"; });
  const chooseMode = (v) => { setMode(v); urlPrefSet("screen", v); };
  const directFestivalGuide = festivalGuideFromPath(typeof window !== "undefined" ? window.location.pathname : "/");
  const utilityRoute = utilityFromPath(typeof window !== "undefined" ? window.location.pathname : "/");
  const medicalRoute = medicalMuhuratFromPath(typeof window !== "undefined" ? window.location.pathname : "/");
  const muhuratRoute = urlPrefGet("muhurat");
  // A /festival/ path that matches no guide used to render the home screen silently, so a
  // stale or mistyped shared link looked like it had worked. Say so instead.
  const unknownFestivalPath = typeof window !== "undefined"
    && /^\/festival\//.test(window.location.pathname)
    && !directFestivalGuide;
  const hero = pageHeroCopy(lang, mode, directFestivalGuide, utilityRoute, medicalRoute, muhuratRoute);
  useEffect(() => {
    const meta=routeMetadata({lang,mode,festival:directFestivalGuide,utility:utilityRoute,medical:medicalRoute,muhurat:muhuratRoute});
    applyRouteMetadata({...meta,lang,path:typeof window!=="undefined"?window.location.pathname:"/"});
    privacyEvent("page_view",{area:directFestivalGuide?"festival":utilityRoute?"calculator":medicalRoute?"medical-muhurat":muhuratRoute?"muhurat":mode,language:lang});
  },[lang,mode,directFestivalGuide,utilityRoute,medicalRoute,muhuratRoute]);

  const DEFAULT_PLACE = { label: "New Delhi, India", lat: 28.61, lon: 77.21, zone: "Asia/Kolkata" };
  const placeFromUrl=()=>{const label=urlPrefGet("city"),lat=Number(urlPrefGet("lat")),lon=Number(urlPrefGet("lon")),zone=urlPrefGet("zone");return label&&zone&&Number.isFinite(lat)&&Math.abs(lat)<=90&&Number.isFinite(lon)&&Math.abs(lon)<=180?{label,lat,lon,zone}:null;};
  // Shared place: Daily and Prashna both read it; URL state preserves it across
  // regional-mode changes, reload and browser Back/Forward without storage.
  const [panchPlace, setPanchPlaceState] = useState(placeFromUrl);
  const setPanchPlace=(next)=>{setPanchPlaceState(next);if(next){urlPrefsSet({city:next.label,lat:next.lat,lon:next.lon,zone:next.zone});updatePreferences({homePlace:{label:next.label,lat:next.lat,lon:next.lon,zone:next.zone}});}};
  useEffect(()=>{const restore=()=>setPanchPlaceState(placeFromUrl());window.addEventListener("popstate",restore);return()=>window.removeEventListener("popstate",restore);},[]);
  const panchEff = panchPlace || DEFAULT_PLACE;

  return (
    <div style={{ minHeight: "100vh", background: `radial-gradient(68.75rem 43.75rem at 85% -8%, color-mix(in srgb, var(--accent), transparent 92%), transparent 60%), radial-gradient(56.25rem 43.75rem at -12% 35%, color-mix(in srgb, var(--accent), transparent 95%), transparent 55%), ${C.bg}`, color: C.ivory, fontFamily: T.body }}>
      <style>{`
        html { scroll-behavior: smooth; }
        *, *::before, *::after { box-sizing: border-box; min-width: 0; }
        img, svg { max-width: 100%; height: auto; }
        button { font: inherit; }
        .hscroll { scrollbar-width: none; -ms-overflow-style: none; }
        .hscroll::-webkit-scrollbar { display: none; }
        .drawline { stroke-dasharray: 1700; stroke-dashoffset: 1700; animation: draw 1.5s cubic-bezier(.4,0,.2,1) forwards; }
        @keyframes draw { to { stroke-dashoffset: 0; } }
        @keyframes riseIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
        @keyframes softpulse { 0%, 100% { opacity: .35; } 50% { opacity: .8; } }
        .rise { animation: riseIn .55s cubic-bezier(.2,.7,.3,1) both; }
        .rise2 { animation: riseIn .55s cubic-bezier(.2,.7,.3,1) .08s both; }
        @media (prefers-reduced-motion: reduce) {
          .drawline { animation: none; stroke-dashoffset: 0; }
          .rise, .rise2 { animation: none; }
          * { transition: none !important; }
        }
        input, select, button { transition: border-color .15s ease, box-shadow .15s ease, background .15s ease, transform .1s ease, color .15s ease; }
        /* One focus treatment for the whole app: the token ring, which also thickens under
           the OS "increase contrast" setting. Never outline:none. */
        input:focus-visible, select:focus-visible, textarea:focus-visible, button:focus-visible, a:focus-visible, summary:focus-visible, [tabindex]:focus-visible {
          outline: 0.1875rem solid var(--focus); outline-offset: 0.125rem;
        }
        input:focus, select:focus, textarea:focus { border-color: var(--accent); }
        .castBtn:hover { filter: brightness(1.07); box-shadow: var(--elevation-3); }
        .castBtn:active { transform: translateY(0.0625rem); }
        .chip:hover { border-color: var(--accent-line) !important; color: var(--accent) !important; }
        .sug:hover { background: var(--surface-hover) !important; }
        table { border-collapse: collapse; width: 100%; }
        td, th { padding: var(--space-3) var(--space-2); border-bottom: 0.0625rem solid var(--line-soft); text-align: left; font-size: var(--font-body); }
        tbody tr:last-child td { border-bottom: none; }
        tbody tr:hover td { background: var(--surface-hover); }
        th { font-size: var(--font-label); letter-spacing: var(--label-letter-spacing); text-transform: uppercase; color: var(--muted); font-weight: 400; }
        @media (max-width: 40rem) {
          .utility-header { margin-bottom: var(--space-3) !important; justify-content: center !important; }
          .comfort-preset-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
        }

        /* Print / Save-as-PDF: hide interactive chrome, show the report cleanly. */
        .print-only { display: none; }
        @media print {
          @page { margin: 12mm; }
          html, body { background: #fff !important; }
          nav, input, select, textarea, footer, .no-print { display: none !important; }
          button { display: none !important; }
          .print-only { display: block !important; }
          * { box-shadow: none !important; text-shadow: none !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .rise, .rise2 { animation: none !important; }
          section, table, svg, .card { break-inside: avoid; }
          h1, h2, h3 { break-after: avoid; }
          a { text-decoration: none !important; color: inherit !important; }
          details { display: block !important; }
          details > summary { display: none !important; }
          details > *:not(summary) { display: revert !important; }
        }
      `}</style>

      <div style={{ maxWidth: "47.5rem", margin: "0 auto", padding: `${T.s8} ${T.s5} 5rem` }}>
        <div className="utility-header" style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", flexWrap: "wrap", gap: T.s2, marginBottom: `calc(-1 * ${T.s6})`, position: "relative", zIndex: 2 }}>
          <span style={{ fontSize: T.fMicro, color: C.muted, letterSpacing: ".08em" }}>भाषा · Language</span>
          <span style={{ display: "inline-flex", border: `0.0625rem solid ${C.line}`, borderRadius: T.rPill, overflow: "hidden", background: C.panel }}>
            {[["hi", "हिन्दी"], ["en", "English"]].map(([v, l]) => (
              <button key={v} onClick={() => chooseLang(v)} aria-label={v === "hi" ? "हिन्दी चुनें" : "Switch to English"} aria-pressed={lang === v} style={{ padding: `${T.s2} ${T.s3}`, minHeight: T.ctrlH, border: "none", cursor: "pointer", fontFamily: T.serif, fontSize: T.fSmall, background: lang === v ? C.accentSoft : "transparent", color: lang === v ? C.gold : C.muted, fontWeight: lang === v ? 600 : 400 }}>{l}</button>
            ))}
          </span>
        </div>
        {/* hero */}
        <header className="rise" style={{ textAlign: "center", marginBottom: T.s8 }}>
          <h1 style={{ fontFamily: T.serif, fontWeight: 700, fontSize: "2.875rem", margin: `${T.s2} 0 ${T.s1}`, lineHeight: 1.08 }}>
            <span style={{ color: C.gold }}>{lang === "hi" ? "गणक" : "Ganak"}</span>
          </h1>
          <div style={{ fontFamily: T.serif, color: C.gold, fontSize: T.fSmall, letterSpacing: "0.18em" }}>{hero.eyebrow}</div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: T.s3, margin: `${T.s3} 0` }}>
            <span style={{ height: "0.0625rem", width: "4rem", background: "linear-gradient(90deg, transparent, var(--accent-line))" }} />
            <span style={{ color: C.gold, fontSize: T.fSmall }}>ॐ</span>
            <span style={{ height: "0.0625rem", width: "4rem", background: "linear-gradient(270deg, transparent, var(--accent-line))" }} />
          </div>
          <p style={{ color: C.muted, fontSize: T.fBody, margin: 0, letterSpacing: ".02em" }}>
            {hero.detail}
          </p>
        </header>

        {!directFestivalGuide && !utilityRoute && !medicalRoute && <div style={{ display: "flex", justifyContent: "center", marginBottom: T.s5 }}>
          <div role="group" aria-label={lang === "hi" ? "मुख्य भाग चुनें" : "Choose section"} style={{ display: "inline-flex", flexWrap: "wrap", justifyContent: "center", background: C.soft, borderRadius: T.rMd, padding: "0.1875rem", border: `0.0625rem solid ${C.line}` }}>
            {[["daily", lang === "hi" ? "आज · पंचांग" : "Daily"], ["prashna", lang === "hi" ? "प्रश्न" : "Prashna"], ["chart", lang === "hi" ? "ज्योतिष" : "Jyotish"]].map(([mk, label]) => (
              // The unselected label is a real, actionable control, so it carries full ink
              // contrast rather than the muted tone; selection is gold + weight + elevation.
              <button key={mk} onClick={() => chooseMode(mk)} className="comfort-focus" aria-pressed={mode === mk} aria-current={mode === mk ? "page" : undefined} style={{ minHeight: T.ctrlH, padding: `0 ${T.s5}`, borderRadius: T.rSm, fontFamily: T.serif, fontSize: T.fBody, cursor: "pointer", border: "none", background: mode === mk ? C.panel : "transparent", color: mode === mk ? C.gold : C.ivory, fontWeight: mode === mk ? 700 : 400, boxShadow: mode === mk ? T.e1 : "none", transition: "all .15s" }}>{label}</button>
            ))}
          </div>
        </div>}

        {unknownFestivalPath && (
          <div role="alert" style={{ ...card, padding: `${T.s5} ${T.s5}`, marginBottom: T.s5, borderColor: "var(--bad)" }}>
            <div style={{ fontFamily: T.serif, fontSize: T.fHeading, color: C.ivory, marginBottom: T.s2 }}>
              {lang === "hi" ? "यह पर्व-पृष्ठ नहीं मिला।" : "That festival page could not be found."}
            </div>
            <div style={{ fontSize: T.fSmall, color: C.muted, marginBottom: T.s3, lineHeight: 1.55 }}>
              {lang === "hi"
                ? "लिंक पुराना या ग़लत हो सकता है। नीचे आज का पंचांग है; व्रत एवं पर्व सूची से सही पृष्ठ खोलें।"
                : "The link may be old or mistyped. Today's Panchang is below — open the right page from the Fasts and festivals list."}
            </div>
            <a href={`/?lang=${lang}&screen=daily`} className="comfort-focus" style={{ display: "inline-flex", alignItems: "center", minHeight: T.ctrlH, padding: `0 ${T.s4}`, borderRadius: T.rMd, border: `0.0625rem solid ${C.gold}`, color: C.gold, textDecoration: "none", fontWeight: 600 }}>
              {lang === "hi" ? "आज का पंचांग खोलें" : "Open today's Panchang"}
            </a>
          </div>
        )}

        {directFestivalGuide && (
          <FestivalGuideScreen
            guide={directFestivalGuide}
            lang={lang}
            C={C}
            card={card}
            place={panchEff}
            onPlace={setPanchPlace}
          />
        )}

        {utilityRoute && <UtilityCalculatorScreen route={utilityRoute} lang={lang} C={C} card={card} place={panchEff} onPlace={setPanchPlace} />}

        {medicalRoute && <MedicalMuhuratScreen lang={lang} C={C} card={card} place={panchEff} onPlace={setPanchPlace} />}


        {!directFestivalGuide && !utilityRoute && !medicalRoute && mode === "prashna" && (
          <PrashnaScreen lat={panchEff?.lat} lon={panchEff?.lon} placeLabel={panchEff?.label} lang={lang} />
        )}

        {!directFestivalGuide && !utilityRoute && !medicalRoute && mode === "daily" && (
          <DailyScreen C={C} card={card} lang={lang} place={panchEff} onPlace={setPanchPlace} />
        )}

        {!directFestivalGuide && !utilityRoute && !medicalRoute && mode === "chart" && (
          <ChartScreen C={C} card={card} lang={lang} />
        )}

        <FeedbackCard lang={lang} C={C} card={card} />

        {/* Footer stays accurate with or without optional telemetry endpoints. */}
        <footer style={{ textAlign: "center", color: C.muted, fontSize: T.fLabel, marginTop: T.s8, letterSpacing: ".06em" }}>
          {lang === "hi"
            ? "ॐ · गणना आपके डिवाइस पर · न खाता · शहर खोज ऑनलाइन · सेवा जुड़ने पर केवल अनाम उपयोग-घटनाएँ"
            : "ॐ · computed on your device · no account · city search online · anonymous usage events only when configured"}
        </footer>
      </div>
    </div>
  );
}

/* Named exports for the validation harnesses (validation/_load-app.cjs bundles this
   module and reads them). Kept as one explicit list so the gates never depend on
   flat-file scope — which is what lets src/ be split into modules safely. */
export {
  scanPanchangCalendar,
  FEST_NAME,
  ayyappaMandalaFor,
  muhuratScanRange,
  muhuratForDate,
  muhuratShuddhi,
  MUHURTA_RULES,
  pageHeroCopy,
};
