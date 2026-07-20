import React, { useState } from "react";
import { T } from "./components/tokens";
import PrashnaScreen from "./screens/PrashnaScreen";
import ChartScreen from "./screens/ChartScreen";
import DailyScreen from "./screens/DailyScreen";
import { FEST_NAME } from "./data/festival-meta";
import { urlPrefGet, urlPrefSet } from "./components/url-prefs";
import {
  scanPanchangCalendar, ayyappaMandalaFor,
} from "./engine/festivals";
import {
  muhuratScanRange, muhuratForDate, muhuratShuddhi, MUHURTA_RULES,
} from "./engine/muhurat";

/* ============================================================
   GANAK — shell: nav, shared prefs/place, screen compose
   ============================================================ */


export default function KundliApp() {
  const C = {
    bg: "#FAF5EA", panel: "#FFFFFF", line: "#E7DDC6",
    gold: "#A86A12", sindoor: "#C2451E", ivory: "#3B3147", muted: "#8C8173",
  };
  const card = {
    background: "linear-gradient(180deg, #FFFFFF 0%, #FFFCF3 100%)",
    border: `1px solid ${C.line}`,
    borderRadius: T.rLg,
    boxShadow: T.e2,
  };

  const detectLang = () => { try { const ls = (navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || "en"]).map((x) => String(x || "").toLowerCase()); return ls.some((l) => l.startsWith("hi")) ? "hi" : "en"; } catch (e) { return "en"; } };
  // Language and screen survive a reload via the URL (?lang=hi&screen=prashna) —
  // browser storage is banned in this project, but the address bar is not storage.
  const [lang, setLang] = useState(() => { const v = urlPrefGet("lang"); return v === "hi" || v === "en" ? v : detectLang(); });
  const chooseLang = (v) => { setLang(v); urlPrefSet("lang", v); };
  const [mode, setMode] = useState(() => { const v = urlPrefGet("screen"); return v === "prashna" || v === "daily" ? v : "daily"; });
  const chooseMode = (v) => { setMode(v); urlPrefSet("screen", v); };

  // Shared place: Daily and Prashna both read it; Daily owns the picker UI.
  const [panchPlace, setPanchPlace] = useState(null);
  const DEFAULT_PLACE = { label: "New Delhi, India", lat: 28.61, lon: 77.21, zone: "Asia/Kolkata" };
  const panchEff = panchPlace || DEFAULT_PLACE;

  return (
    <div style={{ minHeight: "100vh", background: `radial-gradient(1100px 700px at 85% -8%, rgba(200,122,28,.08), transparent 60%), radial-gradient(900px 700px at -12% 35%, rgba(106,90,200,.05), transparent 55%), ${C.bg}`, color: C.ivory, fontFamily: "Spectral, Georgia, serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Eczar:wght@500;600;700&family=Spectral:ital,wght@0,300;0,400;0,600;1,400&display=swap');
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
        input:focus, select:focus, button:focus-visible { border-color: #A86A12 !important; box-shadow: 0 0 0 3px rgba(168,106,18,.22); outline: none; }
        .castBtn:hover { filter: brightness(1.07); box-shadow: 0 8px 24px rgba(168,106,18,.32); }
        .castBtn:active { transform: translateY(1px); }
        .chip:hover { border-color: #A86A1266 !important; color: #A86A12 !important; }
        .sug:hover { background: rgba(168,106,18,.10) !important; }
        table { border-collapse: collapse; width: 100%; }
        td, th { padding: 10px 8px; border-bottom: 1px solid #EBE2CE; text-align: left; font-size: 14px; }
        tbody tr:last-child td { border-bottom: none; }
        tbody tr:hover td { background: rgba(168,106,18,.05); }
        th { font-size: 10.5px; letter-spacing: .16em; text-transform: uppercase; color: #8C8173; font-weight: 400; }
      `}</style>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "40px 20px 80px" }}>
        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 8, marginBottom: -18 }}>
          <span style={{ fontSize: T.fMicro, color: C.muted, letterSpacing: ".08em" }}>भाषा · Language</span>
          <span style={{ display: "inline-flex", border: `1px solid ${C.line}`, borderRadius: T.rPill, overflow: "hidden", background: C.panel }}>
            {[["hi", "हिन्दी"], ["en", "English"]].map(([v, l]) => (
              <button key={v} onClick={() => chooseLang(v)} aria-label={v === "hi" ? "हिन्दी चुनें" : "Switch to English"} style={{ padding: "5px 13px", border: "none", cursor: "pointer", fontFamily: "Eczar, serif", fontSize: 12.5, background: lang === v ? "rgba(168,106,18,.12)" : "transparent", color: lang === v ? C.gold : C.muted, fontWeight: lang === v ? 600 : 400 }}>{l}</button>
            ))}
          </span>
        </div>
        {/* hero */}
        <header className="rise" style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ fontFamily: "Eczar, serif", color: C.gold, fontSize: 15, letterSpacing: "0.34em" }}>ज्योतिष</div>
          <h1 style={{ fontFamily: "Eczar, serif", fontWeight: 700, fontSize: 46, margin: "8px 0 6px", lineHeight: 1.08 }}>
            <span style={{ color: C.gold }}>Ganak</span>
          </h1>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, margin: "10px 0 12px" }}>
            <span style={{ height: 1, width: 64, background: `linear-gradient(90deg, transparent, ${C.gold}99)` }} />
            <span style={{ color: C.gold, fontSize: 13 }}>ॐ</span>
            <span style={{ height: 1, width: 64, background: `linear-gradient(270deg, transparent, ${C.gold}99)` }} />
          </div>
          <p style={{ color: C.muted, fontSize: 14.5, margin: 0, letterSpacing: ".02em" }}>
            {lang === "hi" ? "वैदिक जन्म कुंडली · लाहिरी अयनांश · पूर्ण-राशि भाव · विंशोत्तरी दशा" : "Vedic birth chart · Lahiri ayanamsa · whole-sign houses · Vimshottari dasha"}
          </p>
        </header>

        <div style={{ display: "flex", justifyContent: "center", marginBottom: T.s5 }}>
          <div style={{ display: "inline-flex", background: "#F1E9D5", borderRadius: T.rMd, padding: 3, border: `1px solid ${C.line}` }}>
            {[["daily", lang === "hi" ? "आज · पंचांग" : "Daily"], ["prashna", lang === "hi" ? "प्रश्न" : "Prashna"]].map(([mk, label]) => (
              <button key={mk} onClick={() => chooseMode(mk)} style={{ padding: "9px 26px", borderRadius: T.rSm, fontFamily: T.serif, fontSize: T.fBody, cursor: "pointer", border: "none", background: mode === mk ? C.panel : "transparent", color: mode === mk ? C.gold : C.muted, fontWeight: mode === mk ? 600 : 400, boxShadow: mode === mk ? T.e1 : "none", transition: "all .15s" }}>{label}</button>
            ))}
          </div>
        </div>

        {mode === "prashna" && (
          <PrashnaScreen lat={panchEff?.lat} lon={panchEff?.lon} placeLabel={panchEff?.label} lang={lang} />
        )}

        {mode === "daily" && (
          <DailyScreen C={C} card={card} lang={lang} place={panchEff} onPlace={setPanchPlace} />
        )}

        {mode === "chart" && (
          <ChartScreen C={C} card={card} lang={lang} />
        )}

        <footer style={{ textAlign: "center", color: C.muted, fontSize: 12, marginTop: 56, letterSpacing: ".06em" }}>
          ॐ · computed locally in your browser · nothing is stored or sent anywhere
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
};
