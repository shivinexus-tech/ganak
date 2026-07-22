/* Daily / Panchang screen — place/date chrome, MuhuratHub, gochar.
   Extracted from kundli-app.tsx (SPLIT-UI-DAILY-SCREEN). Pure move. */

import React, { useState, useMemo, useEffect } from "react";
import { T } from "../components/tokens";
import { fmtTime } from "../components/format";
import PlaceInput from "../components/PlaceInput";
import {
  SIGNS, zoneOffset, PLANET_DEVA,
} from "../engine/panchang";
import { computeTodayPanchang } from "../engine/today-panchang";
import { CalendarPage } from "./CalendarPage";
import { MuhuratHub } from "./MuhuratHub";
import { scanPanchangCalendar } from "../engine/festivals";
import { planetGochar, PLANET_PERIOD_DAYS } from "../engine/gochar";
import { fmtDur, eventDetail } from "../engine/transit-copy";
import { CALENDAR_CONVENTIONS, DEFAULT_REGIONAL_CALENDAR_FLAGS, calendarLabel, conventionIsEnabled, resolveConvention } from "../engine/calendar-conventions";
import { loadRegionalCalendarFlags } from "../engine/regional-calendar-flags";
import { runRegionalCalendarShadow } from "../monitoring/regional-calendar-shadow";
import { urlPrefGet, urlPrefPush, urlPrefSet } from "../components/url-prefs";
import HolidayOverlayCard from "../components/HolidayOverlayCard";
import { holidayDatesForYear, resolveHolidayMode } from "../data/india-holidays";

export default function DailyScreen({ C, card, lang, place, onPlace }) {
  const [ayanamsa] = useState("lahiri");
  const [regionalFlags,setRegionalFlags]=useState(DEFAULT_REGIONAL_CALENDAR_FLAGS);
  const [calendarState, setCalendarState] = useState(() => resolveConvention(urlPrefGet("cal"),DEFAULT_REGIONAL_CALENDAR_FLAGS));
  const calendarMode=calendarState.id;
  const [holidayMode, setHolidayMode] = useState(() => resolveHolidayMode(urlPrefGet("hol")));
  const chooseCalendarMode = (value) => { const next = resolveConvention(value,regionalFlags); setCalendarState(next); urlPrefPush("cal", next.id); };
  const chooseHolidayMode = (value) => { const next = resolveHolidayMode(value); setHolidayMode(next); urlPrefPush("hol", next); };
  useEffect(() => {
    const restore=()=>{ setCalendarState(resolveConvention(urlPrefGet("cal"),regionalFlags)); setHolidayMode(resolveHolidayMode(urlPrefGet("hol"))); const date=urlPrefGet("date");setPanchDate(validDate(date)?date:todayISO); };
    window.addEventListener("popstate",restore); return()=>window.removeEventListener("popstate",restore);
  },[regionalFlags]);
  useEffect(()=>{ let active=true; loadRegionalCalendarFlags().then(flags=>{ if(!active)return; setRegionalFlags(flags); setCalendarState(resolveConvention(urlPrefGet("cal"),flags)); }); return()=>{active=false;}; },[]);
  const todayISO = (() => {
    const nowU = new Date();
    let off = null;
    try { off = place ? zoneOffset(place.zone, nowU.getUTCFullYear(), nowU.getUTCMonth() + 1, nowU.getUTCDate()) : null; } catch (e) { off = null; }
    const d = off == null ? new Date(Date.now() - nowU.getTimezoneOffset() * 60000) : new Date(Date.now() + off * 3600000);
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
  })();
  const validDate=(value)=>/^\d{4}-\d{2}-\d{2}$/.test(value||"")&&!Number.isNaN(Date.parse(value+"T00:00:00Z"));
  const [panchDate, setPanchDate] = useState(() => {const value=urlPrefGet("date");return validDate(value)?value:todayISO;});
  const choosePanchDate=(value)=>{setPanchDate(value);urlPrefPush("date",value);};
  const [calOpen, setCalOpen] = useState(false);
  const [calYM, setCalYM] = useState(null);
  const [calView, setCalView] = useState(null);
  const [expandedEvent, setExpandedEvent] = useState(null);
  const [, setClockTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setClockTick((t) => t + 1), 60000);
    return () => clearInterval(id);
  }, []);
  const prevTodayRef = React.useRef(todayISO);
  useEffect(() => {
    if (prevTodayRef.current !== todayISO) {
      if (panchDate === prevTodayRef.current) {setPanchDate(todayISO);urlPrefSet("date",todayISO);}
      prevTodayRef.current = todayISO;
    }
  }, [todayISO, panchDate]);
  const isPanchToday = panchDate === todayISO;
  const todayP = useMemo(() => {
    try {
      if (!place) return null;
      if (isPanchToday) return computeTodayPanchang(place, ayanamsa);
      const [py, pm, pd] = panchDate.split("-").map(Number);
      const ptz = (zoneOffset(place.zone, py, pm, pd)) ?? 5.5;
      return computeTodayPanchang(place, ayanamsa, Date.UTC(py, pm - 1, pd, 12) - ptz * 3600000);
    } catch { return null; }
  }, [place, ayanamsa, panchDate, isPanchToday]);
  useEffect(()=>{ if(place&&todayP?.rise)runRegionalCalendarShadow(todayP,todayP.rise,place); },[place,todayP]);
  const calMarks = useMemo(() => {
    if (!calYM || !place) return { fest: new Set(), fast: new Set(), holiday: new Set() };
    try {
      const [cy, cm] = calYM.split("-").map(Number);
      const ctz = (zoneOffset(place.zone, cy, cm, 1)) ?? 5.5;
      const first = new Date(Date.UTC(cy, cm - 1, 1));
      const gs = new Date(Date.UTC(cy, cm - 1, 1 - first.getUTCDay()));
      const fromMs = Date.UTC(gs.getUTCFullYear(), gs.getUTCMonth(), gs.getUTCDate(), 12) - ctz * 3600000;
      const r = scanPanchangCalendar(fromMs, ctz, 42, 46, place);
      const toISO = (ms) => { const d = new Date(ms + ctz * 3600000); return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`; };
      return { fest: new Set(r.festivals.map((f) => toISO(f.ms))), fast: new Set(r.fasts.map((f) => toISO(f.ms))), holiday: holidayDatesForYear(cy, holidayMode) };
    } catch (e) { return { fest: new Set(), fast: new Set(), holiday: new Set() }; }
  }, [calYM, place, ayanamsa, holidayMode]);

  return (
    <>
      {calView && <CalendarPage view={calView} place={place} lang={lang} onBack={() => setCalView(null)} C={C} card={card} />}

      {!todayP && (
        <div className="rise" style={{ marginBottom: 20 }}>
          <div style={{ ...card, padding: "18px 20px", borderColor: "#E0B25E" }}>
            <div style={{ fontFamily: "Eczar, serif", fontSize: 17, color: C.ivory, marginBottom: 6 }}>
              {lang === "hi" ? "इस स्थान या तारीख़ के लिए आज का पंचांग नहीं बन सका।" : "We couldn't work out the panchang for this place or date."}
            </div>
            <div style={{ fontSize: 13.5, color: C.muted, marginBottom: 14, lineHeight: 1.55 }}>
              {lang === "hi" ? "कृपया दूसरी तारीख़ चुनें, या नीचे कोई और शहर खोजें।" : "Try picking a different date, or search for another city below."}
            </div>
            <div style={{ maxWidth: 320 }}><PlaceInput value={place} onPick={onPlace} C={C} lang={lang} /></div>
          </div>
        </div>
      )}

      {todayP && (
        <>
          <div className="rise" style={{ position: "relative", zIndex: calOpen ? 50 : 1, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginBottom: 20 }}>
            <div style={{ flex: "1 1 200px", minWidth: 180 }}><PlaceInput value={place} onPick={onPlace} C={C} lang={lang} /></div>
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
              const step = (delta) => { const dt = new Date(baseUTC); dt.setUTCDate(dt.getUTCDate() + delta); choosePanchDate(iso(dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate())); };
              const shiftMonth = (delta) => { const [cy, cm] = calYM.split("-").map(Number); const dt = new Date(Date.UTC(cy, cm - 1 + delta, 1)); setCalYM(`${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, "0")}`); };
              const openCal = () => { setCalYM(panchDate.slice(0, 7)); setCalOpen(true); };
              const arrowBtn = { width: 42, padding: 0, height: "100%", cursor: "pointer", border: "none", background: "transparent", color: C.gold, fontSize: 18, fontWeight: 400, lineHeight: 1, fontFamily: T.body };
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
                    <div style={{ display: "inline-flex", alignItems: "stretch", height: T.ctrlH, boxSizing: "border-box", border: `1px solid ${C.line}`, borderRadius: T.rMd, background: "#FFFDF7", overflow: "hidden" }}>
                      <button onClick={() => step(-1)} style={arrowBtn} aria-label={lang === "hi" ? "पिछला दिन" : "Previous day"}>‹</button>
                      <button onClick={openCal} aria-label={lang === "hi" ? "तारीख़ चुनें" : "Choose date"} style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "0 12px", borderLeft: `1px solid ${C.line}`, borderRight: `1px solid ${C.line}`, background: calOpen ? "rgba(168,106,18,.07)" : "transparent", borderTop: "none", borderBottom: "none", cursor: "pointer", height: "100%" }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="1.8" strokeLinecap="round" style={{ flexShrink: 0 }}><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="16" y1="2" x2="16" y2="6" /></svg>
                        <span style={{ fontFamily: T.body, fontSize: 13.5, fontWeight: 400, color: C.ivory, whiteSpace: "nowrap" }}>{dateLabel}</span>
                        <span style={{ color: C.gold, fontSize: 11, transform: calOpen ? "rotate(180deg)" : "none", transition: "transform .15s" }}>▾</span>
                      </button>
                      <button onClick={() => step(1)} style={arrowBtn} aria-label={lang === "hi" ? "अगला दिन" : "Next day"}>›</button>
                    </div>
                    {calOpen && grid && (
                      <>
                        <div onClick={() => setCalOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 40 }} />
                        <div style={{ position: "absolute", top: "calc(100% + 8px)", left: 0, zIndex: 41, background: C.panel, border: `1px solid ${C.line}`, borderRadius: 14, boxShadow: "0 14px 36px rgba(60,40,10,.17)", padding: 14, width: 318, maxWidth: "calc(100vw - 40px)" }}>
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
                              const hasFest = calMarks.fest.has(cIso), hasFast = calMarks.fast.has(cIso), hasHoliday = calMarks.holiday.has(cIso);
                              return (
                                <button key={i} onClick={() => { choosePanchDate(cIso); setCalOpen(false); }} style={{ position: "relative", aspectRatio: "1", display: "flex", alignItems: "center", justifyContent: "center", border: isT && !isSel ? `1.5px solid ${C.gold}` : "1.5px solid transparent", borderRadius: T.rSm, cursor: "pointer", background: isSel ? C.gold : "transparent", color: isSel ? "#FFF8EC" : c.inMonth ? C.ivory : "#C9BFA8", fontFamily: "Eczar, serif", fontSize: 14.5, padding: 0 }}>
                                  {c.d}
                                  {(hasFest || hasFast) && <span style={{ position: "absolute", bottom: 3, display: "flex", gap: 2 }}>
                                    {hasFest && <span style={{ width: 4, height: 4, borderRadius: "50%", background: isSel ? "#FFF8EC" : C.gold }} />}
                                    {hasFast && <span style={{ width: 4, height: 4, borderRadius: "50%", background: isSel ? "#FFF8EC" : C.sindoor }} />}
                                    {hasHoliday && <span style={{ width: 4, height: 4, borderRadius: "50%", background: isSel ? "#FFF8EC" : "#315B7D" }} />}
                                  </span>}
                                </button>
                              );
                            })}
                          </div>
                          <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 10, fontSize: 10.5, color: C.muted }}>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><span style={{ width: 6, height: 6, borderRadius: "50%", background: C.gold }} /> {lang === "hi" ? "पर्व" : "Festival"}</span>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><span style={{ width: 6, height: 6, borderRadius: "50%", background: C.sindoor }} /> {lang === "hi" ? "व्रत" : "Fast"}</span>
                            {holidayMode !== "off" && <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><span style={{ width: 6, height: 6, borderRadius: "50%", background: "#315B7D" }} /> {lang === "hi" ? "सरकारी अवकाश" : "Government holiday"}</span>}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                  {!isPanchToday && <button onClick={() => choosePanchDate(todayISO)} style={{ height: T.ctrlH, boxSizing: "border-box", padding: "0 16px", borderRadius: T.rMd, fontFamily: T.serif, fontSize: 13.5, cursor: "pointer", border: `1px solid ${C.gold}`, background: "rgba(168,106,18,.08)", color: C.gold }}>{lang === "hi" ? "आज पर लौटें" : "Back to today"}</button>}
                </div>
              );
            })()}
          </div>
          {place && <div style={{ margin:"-12px 0 16px", display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
            <select value={calendarMode} onChange={(e) => chooseCalendarMode(e.target.value)} aria-label={lang === "hi" ? "कैलेंडर पद्धति" : "Calendar convention"} style={{ height:T.ctrlH, borderRadius:T.rMd, border:`1px solid ${C.line}`, background:"#FFFDF7", color:C.ivory, padding:"0 10px", fontFamily:T.body }}>
              {CALENDAR_CONVENTIONS.filter(x => conventionIsEnabled(x.id,regionalFlags)).map(x => <option key={x.id} value={x.id}>{lang === "hi" ? x.hi : x.en}</option>)}
            </select>
            <div style={{ fontSize:T.fMicro, color:C.muted, lineHeight:1.45 }}>
              <div>{calendarLabel(calendarMode, todayP, todayP.rise, lang === "hi" ? "hi" : "en", place)}</div>
              <div style={{ fontStyle:"italic" }}>{lang === "hi" ? `समय ${place.label} के अनुसार · पद्धति बदलने से खगोलीय गणना नहीं बदलती` : `Times for ${place.label} · changing the convention never changes the astronomy`}</div>
              {(calendarMode==="tamil-solar"||calendarMode==="bengali-solar")&&<div style={{marginTop:3,fontStyle:"normal"}}>{calendarMode==="tamil-solar"?(lang==="hi"?"तिरुकणित · सूर्य का निरयण राशि-प्रवेश और तमिल सूर्यास्त नियम":"Thirukanitha · sidereal solar ingress with the Tamil sunset rule"):(lang==="hi"?"विशुद्ध सिद्धान्त · सूर्य का निरयण राशि-प्रवेश और बंगाल सूर्योदय नियम":"Vishuddha Siddhanta · sidereal solar ingress with the Bengal sunrise rule")}</div>}
              {calendarState.recoveredFrom && <div role="status" style={{ marginTop:3,color:C.sindoor,fontStyle:"normal" }}>{calendarState.reason === "disabled" ? (lang === "hi" ? "यह क्षेत्रीय पद्धति अस्थायी रूप से बन्द है; आपकी तिथि, स्थान और भाषा रखते हुए गणक मानक दिखाया गया है।" : "That regional mode is temporarily disabled; Ganak default is shown without losing your date, place or language.") : (lang === "hi" ? "यह कैलेंडर पद्धति समर्थित नहीं है; गणक मानक दिखाया गया है।" : "That calendar mode is unsupported; Ganak default is shown.")}</div>}
            </div>
          </div>}
          <HolidayOverlayCard isoDate={panchDate} mode={holidayMode} onMode={chooseHolidayMode} lang={lang} C={C} card={card} />
          <MuhuratHub todayP={todayP} place={place} lang={lang} ayanamsa={ayanamsa} isToday={isPanchToday} onCal={setCalView} C={C} card={card} />

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
                        <div style={{ fontSize: 10.5, color: C.muted, marginTop: 4, fontStyle: "italic" }}>{lang === "hi" ? "सायन (लाहिरी) · समय " : "Sidereal (Lahiri) · times in "}{(place && place.label) || (lang === "hi" ? "स्थानीय" : "local")}{lang === "hi" ? " समय अनुसार · धीमे ग्रहों हेतु ±1 दिन" : " time · ±1 day for slow planets"}</div>
                      </div>
                    );
                  })()}
                </div>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}
