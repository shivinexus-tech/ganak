import React, { useState, useMemo, useEffect } from "react";
import { T } from "./components/tokens";
import { fmtTime } from "./components/format";
import PrashnaScreen from "./screens/PrashnaScreen";
import PlaceInput from "./components/PlaceInput";
import ChartScreen from "./screens/ChartScreen";
import { CHOG_NAME, OBS_NAME, FEST_NAME, OBS_META, FEST_META } from "./data/festival-meta";
import {
  SIGNS, NAKSHATRAS, zoneOffset, PLANET_DEVA,
} from "./engine/panchang";
import { tr, trN, obsLabel } from "./i18n";
import { computeTodayPanchang } from "./engine/today-panchang";
import { urlPrefGet, urlPrefSet } from "./components/url-prefs";
import { CalendarPage } from "./screens/CalendarPage";
import { MuhuratHub } from "./screens/MuhuratHub";
import {
  scanPanchangCalendar, ayyappaMandalaFor,
} from "./engine/festivals";
import { planetGochar, PLANET_PERIOD_DAYS } from "./engine/gochar";
import { fmtDur, eventDetail } from "./engine/transit-copy";
import {
  muhuratScanRange, muhuratForDate, muhuratShuddhi, MUHURTA_RULES,
} from "./engine/muhurat";

/* ============================================================
   GANAK — shell: nav, shared prefs, Daily + Prashna + Chart compose
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

  const [panchPlace, setPanchPlace] = useState(null); // panchang city, independent of birth place
  const [ayanamsa] = useState("lahiri");
  const [panchDate, setPanchDate] = useState(() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; });
  const [calOpen, setCalOpen] = useState(false);
  const [calYM, setCalYM] = useState(null);
  const [calView, setCalView] = useState(null);
  const [expandedEvent, setExpandedEvent] = useState(null); // which upcoming event card is open
  const DEFAULT_PLACE = { label: "New Delhi, India", lat: 28.61, lon: 77.21, zone: "Asia/Kolkata" };
  const panchEff = panchPlace || DEFAULT_PLACE;
  const [, setClockTick] = useState(0);
  useEffect(() => { const id = setInterval(() => setClockTick((t) => t + 1), 60000); return () => clearInterval(id); }, []);
  const todayISO = (() => {
    const nowU = new Date();
    let off = null;
    try { off = panchEff ? zoneOffset(panchEff.zone, nowU.getUTCFullYear(), nowU.getUTCMonth() + 1, nowU.getUTCDate()) : null; } catch (e) { off = null; }
    const d = off == null ? new Date(Date.now() - nowU.getTimezoneOffset() * 60000) : new Date(Date.now() + off * 3600000);
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
  })();
  const prevTodayRef = React.useRef(todayISO);
  useEffect(() => {
    if (prevTodayRef.current !== todayISO) {
      if (panchDate === prevTodayRef.current) setPanchDate(todayISO);
      prevTodayRef.current = todayISO;
    }
  }, [todayISO, panchDate]);
  const isPanchToday = panchDate === todayISO;
  const todayP = useMemo(() => {
    try {
      if (!panchEff) return null;
      if (isPanchToday) return computeTodayPanchang(panchEff, ayanamsa);
      const [py, pm, pd] = panchDate.split("-").map(Number);
      const ptz = (zoneOffset(panchEff.zone, py, pm, pd)) ?? 5.5;
      return computeTodayPanchang(panchEff, ayanamsa, Date.UTC(py, pm - 1, pd, 12) - ptz * 3600000);
    } catch { return null; }
  }, [panchEff, ayanamsa, panchDate, isPanchToday]);
  const calMarks = useMemo(() => {
    if (!calYM || !panchEff) return { fest: new Set(), fast: new Set() };
    try {
      const [cy, cm] = calYM.split("-").map(Number);
      const ctz = (zoneOffset(panchEff.zone, cy, cm, 1)) ?? 5.5;
      const first = new Date(Date.UTC(cy, cm - 1, 1));
      const gs = new Date(Date.UTC(cy, cm - 1, 1 - first.getUTCDay()));
      const fromMs = Date.UTC(gs.getUTCFullYear(), gs.getUTCMonth(), gs.getUTCDate(), 12) - ctz * 3600000;
      const r = scanPanchangCalendar(fromMs, ctz, 42, 46, panchEff);
      const toISO = (ms) => { const d = new Date(ms + ctz * 3600000); return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`; };
      return { fest: new Set(r.festivals.map((f) => toISO(f.ms))), fast: new Set(r.fasts.map((f) => toISO(f.ms))) };
    } catch (e) { return { fest: new Set(), fast: new Set() }; }
  }, [calYM, panchEff, ayanamsa]);


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

        {calView && <CalendarPage view={calView} place={panchEff} lang={lang} onBack={() => setCalView(null)} C={C} card={card} />}

        {mode === "prashna" && (
          <PrashnaScreen lat={panchEff?.lat} lon={panchEff?.lon} placeLabel={panchEff?.label} lang={lang} />
        )}

        {mode === "daily" && !todayP && (
          <div className="rise" style={{ marginBottom: 20 }}>
            <div style={{ ...card, padding: "18px 20px", borderColor: "#E0B25E" }}>
              <div style={{ fontFamily: "Eczar, serif", fontSize: 17, color: C.ivory, marginBottom: 6 }}>
                {lang === "hi" ? "इस स्थान या तारीख़ के लिए आज का पंचांग नहीं बन सका।" : "We couldn't work out the panchang for this place or date."}
              </div>
              <div style={{ fontSize: 13.5, color: C.muted, marginBottom: 14, lineHeight: 1.55 }}>
                {lang === "hi" ? "कृपया दूसरी तारीख़ चुनें, या नीचे कोई और शहर खोजें।" : "Try picking a different date, or search for another city below."}
              </div>
              <div style={{ maxWidth: 320 }}><PlaceInput value={panchEff} onPick={setPanchPlace} C={C} lang={lang} /></div>
            </div>
          </div>
        )}

        {mode === "daily" && todayP && (
          <>
            <div className="rise" style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginBottom: 20 }}>
              <div style={{ flex: "1 1 200px", minWidth: 180 }}><PlaceInput value={panchEff} onPick={setPanchPlace} C={C} lang={lang} /></div>
              {(() => {
                const [py, pm, pd] = panchDate.split("-").map(Number);
                const baseUTC = Date.UTC(py, pm - 1, pd);
                const WD = lang === "hi" ? ["रवि", "सोम", "मंगल", "बुध", "गुरु", "शुक्र", "शनि"] : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
                const WD1 = lang === "hi" ? ["र", "सो", "मं", "बु", "गु", "शु", "श"] : ["S", "M", "T", "W", "T", "F", "S"];
                const MO = lang === "hi" ? ["जन", "फ़र", "मार्च", "अप्रैल", "मई", "जून", "जुल", "अग", "सित", "अक्तू", "नव", "दिस"] : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                const MOL = lang === "hi" ? ["जनवरी", "फ़रवरी", "मार्च", "अप्रैल", "मई", "जून", "जुलाई", "अगस्त", "सितंबर", "अक्तूबर", "नवंबर", "दिसंबर"] : ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                const wd = new Date(baseUTC).getUTCDay();
                const dateLabel = `${WD[wd]}, ${pd} ${MO[pm - 1]} ${py}`;
                const iso = (y, m, d) => `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
                const step = (delta) => { const dt = new Date(baseUTC); dt.setUTCDate(dt.getUTCDate() + delta); setPanchDate(iso(dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate())); };
                const shiftMonth = (delta) => { const [cy, cm] = calYM.split("-").map(Number); const dt = new Date(Date.UTC(cy, cm - 1 + delta, 1)); setCalYM(`${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, "0")}`); };
                const openCal = () => { setCalYM(panchDate.slice(0, 7)); setCalOpen(true); };
                const arrowBtn = { padding: "0 14px", height: "100%", cursor: "pointer", border: "none", background: "transparent", color: C.gold, fontSize: 20, lineHeight: 1, fontFamily: "Eczar, serif" };
                let grid = null, hdr = "";
                if (calOpen && calYM) {
                  const [cy, cm] = calYM.split("-").map(Number);
                  hdr = `${MOL[cm - 1]} ${cy}`;
                  const startDow = new Date(Date.UTC(cy, cm - 1, 1)).getUTCDay();
                  grid = [];
                  for (let i = 0; i < 42; i++) { const dt = new Date(Date.UTC(cy, cm - 1, 1 - startDow + i)); grid.push({ y: dt.getUTCFullYear(), m: dt.getUTCMonth() + 1, d: dt.getUTCDate(), inMonth: dt.getUTCMonth() + 1 === cm }); }
                }
                return (
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    <div style={{ position: "relative" }}>
                      <div style={{ display: "inline-flex", alignItems: "stretch", height: T.ctrlH, boxSizing: "border-box", border: `1px solid ${C.line}`, borderRadius: T.rMd, background: C.panel, overflow: "hidden", boxShadow: "0 1px 2px rgba(60,40,10,.05)" }}>
                        <button onClick={() => step(-1)} style={arrowBtn} aria-label={lang === "hi" ? "पिछला दिन" : "Previous day"}>‹</button>
                        <button onClick={openCal} aria-label={lang === "hi" ? "तारीख़ चुनें" : "Choose date"} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "0 14px", borderLeft: `1px solid ${C.line}`, borderRight: `1px solid ${C.line}`, background: calOpen ? "rgba(168,106,18,.08)" : "transparent", borderTop: "none", borderBottom: "none", cursor: "pointer", height: "100%" }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0 }}><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="16" y1="2" x2="16" y2="6" /></svg>
                          <span style={{ fontFamily: "Eczar, serif", fontSize: 15, color: C.ivory, whiteSpace: "nowrap" }}>{dateLabel}</span>
                          <span style={{ color: C.gold, fontSize: 11, transform: calOpen ? "rotate(180deg)" : "none", transition: "transform .15s" }}>▾</span>
                        </button>
                        <button onClick={() => step(1)} style={arrowBtn} aria-label={lang === "hi" ? "अगला दिन" : "Next day"}>›</button>
                      </div>
                      {calOpen && grid && (
                        <>
                          <div onClick={() => setCalOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 40 }} />
                          <div style={{ position: "absolute", top: "calc(100% + 8px)", left: 0, zIndex: 41, background: C.panel, border: `1px solid ${C.line}`, borderRadius: 14, boxShadow: "0 14px 36px rgba(60,40,10,.17)", padding: 14, width: 318 }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                              <button onClick={() => shiftMonth(-1)} style={{ ...arrowBtn, padding: "4px 12px", fontSize: 18 }} aria-label="Previous month">‹</button>
                              <span style={{ fontFamily: "Eczar, serif", fontSize: 16, color: C.ivory }}>{hdr}</span>
                              <button onClick={() => shiftMonth(1)} style={{ ...arrowBtn, padding: "4px 12px", fontSize: 18 }} aria-label="Next month">›</button>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, marginBottom: 3 }}>
                              {WD1.map((w, i) => <div key={i} style={{ textAlign: "center", fontSize: 10.5, color: C.muted, fontWeight: 600, padding: "3px 0" }}>{w}</div>)}
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
                              {grid.map((c, i) => {
                                const cIso = iso(c.y, c.m, c.d);
                                const isT = cIso === todayISO, isSel = cIso === panchDate;
                                const hasFest = calMarks.fest.has(cIso), hasFast = calMarks.fast.has(cIso);
                                return (
                                  <button key={i} onClick={() => { setPanchDate(cIso); setCalOpen(false); }} style={{ position: "relative", aspectRatio: "1", display: "flex", alignItems: "center", justifyContent: "center", border: isT && !isSel ? `1.5px solid ${C.gold}` : "1.5px solid transparent", borderRadius: T.rSm, cursor: "pointer", background: isSel ? C.gold : "transparent", color: isSel ? "#FFF8EC" : c.inMonth ? C.ivory : "#C9BFA8", fontFamily: "Eczar, serif", fontSize: 14.5, padding: 0 }}>
                                    {c.d}
                                    {(hasFest || hasFast) && <span style={{ position: "absolute", bottom: 3, display: "flex", gap: 2 }}>
                                      {hasFest && <span style={{ width: 4, height: 4, borderRadius: "50%", background: isSel ? "#FFF8EC" : C.gold }} />}
                                      {hasFast && <span style={{ width: 4, height: 4, borderRadius: "50%", background: isSel ? "#FFF8EC" : C.sindoor }} />}
                                    </span>}
                                  </button>
                                );
                              })}
                            </div>
                            <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 10, fontSize: 10.5, color: C.muted }}>
                              <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><span style={{ width: 6, height: 6, borderRadius: "50%", background: C.gold }} /> {lang === "hi" ? "पर्व" : "Festival"}</span>
                              <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><span style={{ width: 6, height: 6, borderRadius: "50%", background: C.sindoor }} /> {lang === "hi" ? "व्रत" : "Fast"}</span>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                    {!isPanchToday && <button onClick={() => setPanchDate(todayISO)} style={{ height: T.ctrlH, boxSizing: "border-box", padding: "0 16px", borderRadius: T.rMd, fontFamily: T.serif, fontSize: 13.5, cursor: "pointer", border: `1px solid ${C.gold}`, background: "rgba(168,106,18,.08)", color: C.gold }}>{lang === "hi" ? "आज" : "Today"}</button>}
                  </div>
                );
              })()}
            </div>
            {panchEff && <div style={{ fontSize: T.fMicro, color: C.muted, margin: "-12px 0 16px", fontStyle: "italic" }}>{lang === "hi" ? `सभी समय ${panchEff.label} के अनुसार` : `All times shown for ${panchEff.label}`}</div>}
            <MuhuratHub todayP={todayP} place={panchEff} lang={lang} ayanamsa={ayanamsa} isToday={isPanchToday} onCal={setCalView} C={C} card={card} />

            <div className="rise2" style={{ ...card, padding: "16px 20px", marginTop: 12 }}>
              <div style={{ ...T.label, color: C.muted, marginBottom: 4 }}>
                {lang === "hi" ? "आगामी ग्रह गोचर" : "Upcoming planetary events"}
              </div>
              <div style={{ fontSize: 11.5, color: C.muted, fontStyle: "italic", marginBottom: 10, lineHeight: 1.45 }}>
                {lang === "hi" ? "आने वाले दिनों में ग्रह किस राशि में प्रवेश करते हैं या वक्री/मार्गी होते हैं" : "when each planet changes sign, or turns retrograde or direct, in the days ahead"}
              </div>
              {todayP.events.map((e2) => {
                const ed = eventDetail(e2, Date.now());
                const isExp = expandedEvent === (e2.t + e2.label);
                return (
                  <div key={e2.t + e2.label} style={{ borderBottom: `1px solid #F1EADA`, padding: "10px 2px" }}>
                    <button
                      onClick={() => setExpandedEvent(isExp ? null : (e2.t + e2.label))}
                      style={{ width: "100%", textAlign: "left", background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}
                    >
                      <span style={{ fontSize: 13.5, display: "flex", gap: 14, alignItems: "baseline", flex: 1 }}>
                        <span style={{ color: C.gold, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap", minWidth: 92, fontSize: 12.5 }}>
                          {new Date(e2.t + todayP.tz * 3600000).toLocaleDateString(lang === "hi" ? "hi-IN" : "en-US", { month: "short", day: "numeric", timeZone: "UTC" })} · {fmtTime(e2.t, todayP.tz)}
                        </span>
                        <span style={{ color: e2.label.includes("℞") ? C.sindoor : C.ivory, flex: 1, overflow: "hidden", textOverflow: "ellipsis" }}>{e2.label}</span>
                      </span>
                      <span style={{ color: C.muted, fontSize: 11, whiteSpace: "nowrap", fontWeight: 500 }}>{ed.timeStr}</span>
                      <span style={{ color: C.muted, fontSize: 13, transform: isExp ? "rotate(180deg)" : "none", transition: "transform .2s" }}>▼</span>
                    </button>
                    {isExp && (() => {
                      const pl = e2.planet || "Sun";
                      const span = PLANET_PERIOD_DAYS[pl] || 400;
                      const g = planetGochar(pl, Date.now() - 60 * 86400000, span + 120);
                      const nowMs = Date.now();
                      const curIdx = g.seq.reduce((acc, x, i) => (x.enter === null || x.enter <= nowMs ? i : acc), 0);
                      return (
                        <div style={{ marginTop: 10, paddingTop: 12, borderTop: `1px solid #EEDCC4`, fontSize: 13, color: C.ivory, lineHeight: 1.55 }}>
                          <div style={{ fontSize: 12.5, color: C.muted, fontStyle: "italic", marginBottom: 12 }}>{ed.desc}</div>
                          <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: ".1em", color: C.gold, marginBottom: 2, fontWeight: 600 }}>
                            {PLANET_DEVA[pl]} {pl} {lang === "hi" ? "राशि गोचर" : "Rashi Gochar"}
                          </div>
                          <div style={{ fontSize: 11, color: C.muted, fontStyle: "italic", marginBottom: 10 }}>
                            {lang === "hi" ? "यह ग्रह अभी किस राशि से गुज़र रहा है" : "which zodiac sign this planet is currently moving through"}
                          </div>
                          <div style={{ position: "relative", paddingLeft: 4 }}>
                            {g.seq.map((x, i) => {
                              const isCur = i === curIdx;
                              const dur = x.enter && x.exit ? fmtDur(x.exit - x.enter) : x.enter && !x.exit ? "ongoing" : null;
                              const stationsInSign = g.stations.filter((st) => (x.enter ? st.t >= x.enter : true) && (x.exit ? st.t < x.exit : true));
                              return (
                                <div key={i} style={{ display: "flex", gap: 12, paddingBottom: 14 }}>
                                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                                    <span style={{ width: 11, height: 11, borderRadius: 6, background: isCur ? C.gold : "#D8C9A8", boxShadow: isCur ? `0 0 8px ${C.gold}88` : "none", zIndex: 1 }} />
                                    {i < g.seq.length - 1 && <span style={{ width: 2, flex: 1, background: "#E4D7BD", marginTop: 2 }} />}
                                  </div>
                                  <div style={{ paddingBottom: 2, flex: 1 }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "baseline", flexWrap: "wrap" }}>
                                      <span style={{ fontFamily: "Eczar, serif", fontSize: 15, color: isCur ? C.gold : C.ivory, fontWeight: isCur ? 700 : 500 }}>
                                        {SIGNS[x.sign].split(" ")[0]}
                                      </span>
                                      {dur && <span style={{ fontSize: 11, color: C.muted }}>{dur}</span>}
                                    </div>
                                    <div style={{ fontSize: 11.5, color: C.muted, marginTop: 2, fontVariantNumeric: "tabular-nums" }}>
                                      {x.enter ? new Date(x.enter + todayP.tz * 3600000).toLocaleDateString(lang === "hi" ? "hi-IN" : "en-US", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }) + " · " + fmtTime(x.enter, todayP.tz) : (lang === "hi" ? "पहले से गोचर में" : "transiting since before")}
                                      {isCur && <span style={{ color: C.gold, fontWeight: 600 }}>{lang === "hi" ? " · अभी यहाँ" : " · now here"}</span>}
                                    </div>
                                    {stationsInSign.map((st, si) => (
                                      <div key={si} style={{ fontSize: 11, color: C.sindoor, marginTop: 3 }}>
                                        ↺ {lang === "hi" ? (st.retro ? "वक्री होता है" : "मार्गी होता है") : ("turns " + (st.retro ? "retrograde" : "direct"))} — {new Date(st.t + todayP.tz * 3600000).toLocaleDateString(lang === "hi" ? "hi-IN" : "en-US", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          <div style={{ fontSize: 10.5, color: C.muted, marginTop: 4, fontStyle: "italic" }}>{lang === "hi" ? "सायन (लाहिरी) · समय " : "Sidereal (Lahiri) · times in "}{(panchEff && panchEff.label) || (lang === "hi" ? "स्थानीय" : "local")}{lang === "hi" ? " समय अनुसार · धीमे ग्रहों हेतु ±1 दिन" : " time · ±1 day for slow planets"}</div>
                        </div>
                      );
                    })()}
                  </div>
                );
              })}
            </div>

          </>
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
