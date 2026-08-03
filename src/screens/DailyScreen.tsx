/* Daily / Panchang screen — place/date chrome, MuhuratHub, gochar.
   Extracted from kundli-app.tsx (SPLIT-UI-DAILY-SCREEN). Pure move. */

import React, { useState, useMemo, useEffect } from "react";
import { T } from "../components/ui-style-contract";
import { fmtTime } from "../components/format";
import PlaceInput from "../components/PlaceInput";
import {
  SIGNS, NAKSHATRAS, zoneOffset, PLANET_DEVA,
} from "../engine/panchang";
import { computeTodayPanchang } from "../engine/today-panchang";
import { CalendarPage } from "./CalendarPage";
import { MuhuratHub } from "./MuhuratHub";
import { scanPanchangCalendar } from "../engine/festivals";
import { planetGochar, PLANET_PERIOD_DAYS } from "../engine/gochar";
import PlanetCalendarCard from "../components/PlanetCalendarCard";
import { fmtDur, eventDetail, transitLabel } from "../engine/transit-copy";
import { panchangTerm } from "../i18n/panchang-terms";
import { CALENDAR_CONVENTIONS, DEFAULT_REGIONAL_CALENDAR_FLAGS, calendarLabel, conventionIsEnabled, resolveConvention } from "../engine/calendar-conventions";
import { loadRegionalCalendarFlags } from "../engine/regional-calendar-flags";
import { runRegionalCalendarShadow } from "../monitoring/regional-calendar-shadow";
import { urlPrefGet, urlPrefPush, urlPrefSet } from "../components/url-prefs";
import HolidayOverlayCard, { HolidayOverlaySelect } from "../components/HolidayOverlayCard";
import { holidayDatesForYear, resolveHolidayMode } from "../data/india-holidays";
import ReadAloudButton from "../accessibility/ReadAloudButton";
import { useDepth } from "../accessibility/ComfortProvider";
import { Card, SectionHeader } from "../components/ui-primitives";
import { NAK_HI } from "../engine/muhurat";

const TITHI_HI = Object.freeze({
  Pratipada: "प्रतिपदा", Dwitiya: "द्वितीया", Tritiya: "तृतीया", Chaturthi: "चतुर्थी",
  Panchami: "पञ्चमी", Shashthi: "षष्ठी", Saptami: "सप्तमी", Ashtami: "अष्टमी",
  Navami: "नवमी", Dashami: "दशमी", Ekadashi: "एकादशी", Dwadashi: "द्वादशी",
  Trayodashi: "त्रयोदशी", Chaturdashi: "चतुर्दशी", Purnima: "पूर्णिमा", Amavasya: "अमावस्या",
});

export function isValidISODate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) return false;
  const [y, m, d] = value.split("-").map(Number);
  if (y < 100 || y > 9999) return false;
  const parsed = new Date(Date.UTC(y, m - 1, d));
  return parsed.getUTCFullYear() === y && parsed.getUTCMonth() + 1 === m && parsed.getUTCDate() === d;
}

function isoDate(y, m, d) {
  return `${String(y).padStart(4, "0")}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

export default function DailyScreen({ C, card, lang, place, onPlace }) {
  const { showPlainHelp, showExpert } = useDepth();
  const [ayanamsa] = useState("lahiri");
  const [regionalFlags,setRegionalFlags]=useState(DEFAULT_REGIONAL_CALENDAR_FLAGS);
  const [calendarState, setCalendarState] = useState(() => resolveConvention(urlPrefGet("cal"),DEFAULT_REGIONAL_CALENDAR_FLAGS));
  const focusPlaceInput = () => {
    const input = document.getElementById("daily-place-input");
    if (!input) return;
    input.scrollIntoView({ behavior: "smooth", block: "center" });
    input.focus();
  };
  const calendarMode=calendarState.id;
  const [holidayMode, setHolidayMode] = useState(() => resolveHolidayMode(urlPrefGet("hol")));
  const chooseCalendarMode = (value) => { const next = resolveConvention(value,regionalFlags); setCalendarState(next); urlPrefPush("cal", next.id); };
  const chooseHolidayMode = (value) => { const next = resolveHolidayMode(value); setHolidayMode(next); urlPrefPush("hol", next); };
  const todayISO = (() => {
    const nowU = new Date();
    let off = null;
    try { off = place ? zoneOffset(place.zone, nowU.getUTCFullYear(), nowU.getUTCMonth() + 1, nowU.getUTCDate()) : null; } catch (e) { off = null; }
    const d = off == null ? new Date(Date.now() - nowU.getTimezoneOffset() * 60000) : new Date(Date.now() + off * 3600000);
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
  })();
  const initialUrlDate = urlPrefGet("date");
  const [panchDate, setPanchDate] = useState(() => isValidISODate(initialUrlDate) ? initialUrlDate : todayISO);
  const [dateDraft, setDateDraft] = useState(() => initialUrlDate || todayISO);
  const [dateError, setDateError] = useState(() => initialUrlDate && !isValidISODate(initialUrlDate) ? "invalid" : "");
  const choosePanchDate=(value)=>{
    if (!isValidISODate(value)) { setDateDraft(value); setDateError("invalid"); return false; }
    setPanchDate(value); setDateDraft(value); setDateError(""); urlPrefPush("date",value); return true;
  };
  useEffect(() => {
    const restore=()=>{
      setCalendarState(resolveConvention(urlPrefGet("cal"),regionalFlags));
      setHolidayMode(resolveHolidayMode(urlPrefGet("hol")));
      const date=urlPrefGet("date");
      if (isValidISODate(date)) { setPanchDate(date); setDateDraft(date); setDateError(""); }
      else if (date) { setDateDraft(date); setDateError("invalid"); setCalYM(panchDate.slice(0, 7)); setCalOpen(true); }
      else { setPanchDate(todayISO); setDateDraft(todayISO); setDateError(""); setCalOpen(false); }
    };
    window.addEventListener("popstate",restore); return()=>window.removeEventListener("popstate",restore);
  },[regionalFlags]);
  useEffect(()=>{ let active=true; loadRegionalCalendarFlags().then(flags=>{ if(!active)return; setRegionalFlags(flags); setCalendarState(resolveConvention(urlPrefGet("cal"),flags)); }); return()=>{active=false;}; },[]);
  const [calOpen, setCalOpen] = useState(() => Boolean(initialUrlDate && !isValidISODate(initialUrlDate)));
  const [calYM, setCalYM] = useState(() => initialUrlDate && !isValidISODate(initialUrlDate) ? panchDate.slice(0, 7) : null);
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
      if (panchDate === prevTodayRef.current) {setPanchDate(todayISO);setDateDraft(todayISO);setDateError("");urlPrefSet("date",todayISO);}
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
  const listenText = useMemo(() => {
    if (!todayP) return [];
    const tithi = lang === "hi" ? (TITHI_HI[todayP.tithis[0].name] || todayP.tithis[0].name) : todayP.tithis[0].name;
    const nakIndex = NAKSHATRAS.indexOf(todayP.naks[0].name);
    const nakshatra = lang === "hi" ? (NAK_HI[nakIndex] || todayP.naks[0].name) : todayP.naks[0].name;
    if (lang === "hi") return [
      `${place?.label || "चुने हुए स्थान"} के लिए आज ${tithi} तिथि और ${todayP.krishna ? "कृष्ण पक्ष" : "शुक्ल पक्ष"} है।`,
      `नक्षत्र ${nakshatra} है।`,
      todayP.abhijit ? `शुभ अभिजित मुहूर्त ${fmtTime(todayP.abhijit.start, todayP.tz)} से ${fmtTime(todayP.abhijit.end, todayP.tz)} तक है।` : "आज अभिजित मुहूर्त उपलब्ध नहीं है।",
      todayP.rahu ? `सावधानी: राहु काल ${fmtTime(todayP.rahu.start, todayP.tz)} से ${fmtTime(todayP.rahu.end, todayP.tz)} तक है। महत्वपूर्ण आरम्भ इससे पहले या बाद में रखें।` : "राहु काल उपलब्ध नहीं है।",
    ];
    return [
      `For ${place?.label || "your selected place"}, today is ${tithi}, ${todayP.paksha}.`,
      `The Nakshatra is ${nakshatra}.`,
      todayP.abhijit ? `Auspicious Abhijit Muhurat runs from ${fmtTime(todayP.abhijit.start, todayP.tz)} to ${fmtTime(todayP.abhijit.end, todayP.tz)}.` : "There is no Abhijit Muhurat today.",
      todayP.rahu ? `Avoid important beginnings during Rahu Kalam, from ${fmtTime(todayP.rahu.start, todayP.tz)} to ${fmtTime(todayP.rahu.end, todayP.tz)}.` : "Rahu Kalam is unavailable.",
    ];
  }, [todayP, lang, place]);
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
        <div className="rise" style={{ marginBottom: "1.25rem" }}>
          <div style={{ ...card, padding: "1.125rem 1.25rem", borderColor: "var(--accent-line)" }}>
            <div style={{ fontFamily: "var(--font-display-family)", fontSize: "var(--font-title)", color: C.ivory, marginBottom: "0.375rem" }}>
              {lang === "hi" ? "इस स्थान या तारीख़ के लिए आज का पंचांग नहीं बन सका।" : "We couldn't work out the panchang for this place or date."}
            </div>
            <div style={{ fontSize: "var(--font-small)", color: C.muted, marginBottom: "0.875rem", lineHeight: 1.55 }}>
              {lang === "hi" ? "कृपया दूसरी तारीख़ चुनें, या नीचे कोई और शहर खोजें।" : "Try picking a different date, or search for another city below."}
            </div>
            <div style={{ maxWidth: "20rem" }}><PlaceInput inputId="daily-place-input" value={place} onPick={onPlace} C={C} lang={lang} /></div>
          </div>
        </div>
      )}

      {todayP && (
        <>
          <div className="rise" style={{ position: "relative", zIndex: calOpen ? 50 : 1, display: "flex", gap: "0.625rem", flexWrap: "wrap", alignItems: "center", marginBottom: "1.25rem" }}>
            <div style={{ flex: "1 1 200px", minWidth: "11.25rem" }}><PlaceInput inputId="daily-place-input" value={place} onPick={onPlace} C={C} lang={lang} /></div>
            {(() => {
              const [py, pm, pd] = panchDate.split("-").map(Number);
              const baseUTC = Date.UTC(py, pm - 1, pd);
              const WD = lang === "hi" ? ["रवि", "सोम", "मंगल", "बुध", "गुरु", "शुक्र", "शनि"] : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
              const WD1 = lang === "hi" ? ["र", "सो", "मं", "बु", "गु", "शु", "श"] : ["S", "M", "T", "W", "T", "F", "S"];
              const MO = lang === "hi" ? ["जन", "फ़र", "मार्च", "अप्रैल", "मई", "जून", "जुल", "अग", "सित", "अक्तू", "नव", "दिस"] : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
              const MOL = lang === "hi" ? ["जनवरी", "फ़रवरी", "मार्च", "अप्रैल", "मई", "जून", "जुलाई", "अगस्त", "सितंबर", "अक्तूबर", "नवंबर", "दिसंबर"] : ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
              const wd = new Date(baseUTC).getUTCDay();
              const dateLabel = `${WD[wd]}, ${pd} ${MO[pm - 1]} ${py}`;
              const step = (delta) => { const dt = new Date(baseUTC); dt.setUTCDate(dt.getUTCDate() + delta); choosePanchDate(isoDate(dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate())); };
              const shiftMonth = (delta) => {
                const [cy, cm] = calYM.split("-").map(Number);
                const nextMonthIndex = cy * 12 + cm - 1 + delta;
                const y = Math.floor(nextMonthIndex / 12), m = nextMonthIndex % 12 + 1;
                if (y < 100 || y > 9999) return;
                setCalYM(`${String(y).padStart(4, "0")}-${String(m).padStart(2, "0")}`);
              };
              const openCal = () => { setCalYM(panchDate.slice(0, 7)); setDateDraft(panchDate); setDateError(""); setCalOpen(true); };
              const jumpMonth = (nextYear, nextMonth) => {
                const y = Number(nextYear), m = Number(nextMonth);
                if (!Number.isInteger(y) || y < 100 || y > 9999 || !Number.isInteger(m) || m < 1 || m > 12) {
                  setDateError("year"); return;
                }
                setDateError("");
                setCalYM(`${String(y).padStart(4, "0")}-${String(m).padStart(2, "0")}`);
              };
              const applyDraft = (currentValue = dateDraft) => {
                if (choosePanchDate(currentValue)) {
                  setCalYM(currentValue.slice(0, 7));
                  setCalOpen(false);
                }
              };
              const arrowBtn = { width: "2.625rem", padding: 0, height: "100%", cursor: "pointer", border: "none", background: "transparent", color: C.gold, fontSize: "var(--font-heading)", fontWeight: 400, lineHeight: 1, fontFamily: T.body };
              let grid = null, hdr = "", canPagePrevious = true, canPageNext = true;
              if (calOpen && calYM) {
                const [cy, cm] = calYM.split("-").map(Number);
                hdr = `${MOL[cm - 1]} ${cy}`;
                canPagePrevious = !(cy === 100 && cm === 1);
                canPageNext = !(cy === 9999 && cm === 12);
                const startDow = new Date(Date.UTC(cy, cm - 1, 1)).getUTCDay();
                grid = [];
                for (let i = 0; i < 42; i++) { const dt = new Date(Date.UTC(cy, cm - 1, 1 - startDow + i)); grid.push({ y: dt.getUTCFullYear(), m: dt.getUTCMonth() + 1, d: dt.getUTCDate(), inMonth: dt.getUTCMonth() + 1 === cm }); }
              }
              return (
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
                  <div style={{ position: "relative" }}>
                    <div style={{ display: "inline-flex", alignItems: "stretch", height: T.ctrlH, boxSizing: "border-box", border: `0.0625rem solid ${C.line}`, borderRadius: T.rMd, background: "var(--surface-sunken)", overflow: "hidden" }}>
                      <button onClick={() => step(-1)} style={arrowBtn} aria-label={lang === "hi" ? "पिछला दिन" : "Previous day"}>‹</button>
                      <button onClick={openCal} aria-label={lang === "hi" ? "तारीख़ चुनें" : "Choose date"} style={{ display: "inline-flex", alignItems: "center", gap: "0.4375rem", padding: "0 0.75rem", borderLeft: `0.0625rem solid ${C.line}`, borderRight: `0.0625rem solid ${C.line}`, background: calOpen ? "var(--surface-hover)" : "transparent", borderTop: "none", borderBottom: "none", cursor: "pointer", height: "100%" }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="1.8" strokeLinecap="round" style={{ flexShrink: 0 }}><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="16" y1="2" x2="16" y2="6" /></svg>
                        <span style={{ fontFamily: T.body, fontSize: "var(--font-small)", fontWeight: 400, color: C.ivory, whiteSpace: "nowrap" }}>{dateLabel}</span>
                        <span style={{ color: C.gold, fontSize: "var(--font-label)", transform: calOpen ? "rotate(180deg)" : "none", transition: "transform .15s" }}>▾</span>
                      </button>
                      <button onClick={() => step(1)} style={arrowBtn} aria-label={lang === "hi" ? "अगला दिन" : "Next day"}>›</button>
                    </div>
                    {calOpen && grid && (
                      <>
                        <div onClick={() => setCalOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 40 }} />
                        <div style={{ position: "absolute", top: "calc(100% + 0.5rem)", left: 0, zIndex: 41, background: C.panel, border: `0.0625rem solid ${C.line}`, borderRadius: "0.875rem", boxShadow: "var(--elevation-3)", padding: "0.875rem", width: "19.875rem", maxWidth: "calc(100vw - 2.5rem)" }}>
                          <form onSubmit={(e) => { e.preventDefault(); applyDraft(e.currentTarget.elements.namedItem("panchangDate")?.value || ""); }} style={{ marginBottom: "0.75rem" }}>
                            <label htmlFor="panchang-direct-date" style={{ display: "block", color: C.ivory, fontSize: "var(--font-small)", fontWeight: 600, marginBottom: "0.3125rem" }}>
                              {lang === "hi" ? "सीधे तारीख़ लिखें" : "Enter a date directly"}
                            </label>
                            <div style={{ display: "flex", gap: "0.375rem" }}>
                              <input
                                id="panchang-direct-date"
                                name="panchangDate"
                                type="date"
                                min="0100-01-01"
                                max="9999-12-31"
                                value={dateDraft}
                                onChange={(e) => { setDateDraft(e.target.value); setDateError(""); }}
                                aria-invalid={Boolean(dateError)}
                                aria-describedby={dateError ? "panchang-date-error" : undefined}
                                style={{ height: T.ctrlH, flex: 1, border: `0.0625rem solid ${dateError ? C.sindoor : C.line}`, borderRadius: T.rMd, background: "var(--surface-sunken)", color: C.ivory, padding: "0 0.5625rem", fontFamily: T.body, fontSize: "var(--font-small)" }}
                              />
                              <button type="submit" style={{ height: T.ctrlH, border: "none", borderRadius: T.rMd, padding: "0 0.75rem", cursor: "pointer", background: C.gold, color: "var(--on-accent)", fontFamily: T.body, fontSize: "var(--font-small)", fontWeight: 600 }}>
                                {lang === "hi" ? "दिखाएँ" : "Go"}
                              </button>
                            </div>
                            <div style={{ color: C.muted, fontSize: "var(--font-micro)", marginTop: "0.25rem" }}>
                              {lang === "hi" ? "दिन-महीना-वर्ष चुनें या YYYY-MM-DD लिखें" : "Choose day, month and year, or type YYYY-MM-DD"}
                            </div>
                            {dateError && <div id="panchang-date-error" role="alert" style={{ color: C.sindoor, fontSize: "var(--font-label)", marginTop: "0.25rem" }}>
                              {dateError === "year"
                                ? (lang === "hi" ? "100 से 9999 के बीच सही वर्ष लिखें।" : "Enter a valid year from 100 to 9999.")
                                : (lang === "hi" ? "सही तारीख़ लिखें — जैसे 2026-10-20।" : "Enter a real date, for example 2026-10-20.")}
                            </div>}
                          </form>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                            <button disabled={!canPagePrevious} onClick={() => shiftMonth(-1)} style={{ ...arrowBtn, padding: "0.25rem 0.75rem", fontSize: "var(--font-heading)", opacity: canPagePrevious ? 1 : .3, cursor: canPagePrevious ? "pointer" : "default" }} aria-label={lang === "hi" ? "पिछला महीना" : "Previous month"}>‹</button>
                            <div style={{ display: "flex", gap: "0.3125rem", alignItems: "center" }}>
                              <select
                                value={String(Number(calYM.slice(5, 7)))}
                                onChange={(e) => jumpMonth(calYM.slice(0, 4), e.target.value)}
                                aria-label={lang === "hi" ? "महीना चुनें" : "Choose month"}
                                style={{ height: "2.125rem", maxWidth: "7rem", border: `0.0625rem solid ${C.line}`, borderRadius: T.rSm, background: "var(--surface-sunken)", color: C.ivory, padding: "0 0.3125rem", fontFamily: T.body, fontSize: "var(--font-label)" }}
                              >
                                {MOL.map((month, index) => <option key={month} value={index + 1}>{month}</option>)}
                              </select>
                              <input
                                type="number"
                                min="100"
                                max="9999"
                                inputMode="numeric"
                                value={Number(calYM.slice(0, 4))}
                                onChange={(e) => jumpMonth(e.target.value, calYM.slice(5, 7))}
                                aria-label={lang === "hi" ? "वर्ष लिखें" : "Enter year"}
                                style={{ width: "4.5rem", height: "2.125rem", border: `0.0625rem solid ${dateError === "year" ? C.sindoor : C.line}`, borderRadius: T.rSm, background: "var(--surface-sunken)", color: C.ivory, padding: "0 0.3125rem", fontFamily: T.body, fontSize: "var(--font-label)" }}
                              />
                            </div>
                            <button disabled={!canPageNext} onClick={() => shiftMonth(1)} style={{ ...arrowBtn, padding: "0.25rem 0.75rem", fontSize: "var(--font-heading)", opacity: canPageNext ? 1 : .3, cursor: canPageNext ? "pointer" : "default" }} aria-label={lang === "hi" ? "अगला महीना" : "Next month"}>›</button>
                          </div>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "0.125rem", marginBottom: "0.1875rem" }}>
                            {WD1.map((w, i) => <div key={i} style={{ textAlign: "center", fontSize: "var(--font-micro)", color: C.muted, fontWeight: 600, padding: "0.1875rem 0" }}>{w}</div>)}
                          </div>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "0.125rem" }}>
                            {grid.map((c, i) => {
                              const cIso = isoDate(c.y, c.m, c.d);
                              const isT = cIso === todayISO, isSel = cIso === panchDate;
                              const hasFest = calMarks.fest.has(cIso), hasFast = calMarks.fast.has(cIso), hasHoliday = calMarks.holiday.has(cIso);
                              return (
                                <button key={i} onClick={() => { choosePanchDate(cIso); setCalOpen(false); }} style={{ position: "relative", aspectRatio: "1", display: "flex", alignItems: "center", justifyContent: "center", border: isT && !isSel ? `0.0938rem solid ${C.gold}` : "0.0938rem solid transparent", borderRadius: T.rSm, cursor: "pointer", background: isSel ? C.gold : "transparent", color: isSel ? "var(--on-accent)" : c.inMonth ? C.ivory : "var(--muted)", fontFamily: "var(--font-display-family)", fontSize: "var(--font-body)", padding: 0 }}>
                                  {c.d}
                                  {(hasFest || hasFast) && <span style={{ position: "absolute", bottom: "0.1875rem", display: "flex", gap: "0.125rem" }}>
                                    {hasFest && <span style={{ width: "0.25rem", height: "0.25rem", borderRadius: "50%", background: isSel ? "var(--on-accent)" : C.gold }} />}
                                    {hasFast && <span style={{ width: "0.25rem", height: "0.25rem", borderRadius: "50%", background: isSel ? "var(--on-accent)" : C.sindoor }} />}
                                    {hasHoliday && <span style={{ width: "0.25rem", height: "0.25rem", borderRadius: "50%", background: isSel ? "var(--on-accent)" : "var(--muted)" }} />}
                                  </span>}
                                </button>
                              );
                            })}
                          </div>
                          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", marginTop: "0.625rem", fontSize: "var(--font-micro)", color: C.muted }}>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}><span style={{ width: "0.375rem", height: "0.375rem", borderRadius: "50%", background: C.gold }} /> {lang === "hi" ? "पर्व" : "Festival"}</span>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}><span style={{ width: "0.375rem", height: "0.375rem", borderRadius: "50%", background: C.sindoor }} /> {lang === "hi" ? "व्रत" : "Fast"}</span>
                            {holidayMode !== "off" && <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}><span style={{ width: "0.375rem", height: "0.375rem", borderRadius: "50%", background: "var(--muted)" }} /> {lang === "hi" ? "सरकारी अवकाश" : "Government holiday"}</span>}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                  {!isPanchToday && <button onClick={() => choosePanchDate(todayISO)} style={{ height: T.ctrlH, boxSizing: "border-box", padding: "0 1rem", borderRadius: T.rMd, fontFamily: T.serif, fontSize: "var(--font-small)", cursor: "pointer", border: `0.0625rem solid ${C.gold}`, background: "var(--surface-hover)", color: C.gold }}>{lang === "hi" ? "आज पर लौटें" : "Back to today"}</button>}
                </div>
              );
            })()}
          </div>
          <div style={{ display: "flex", justifyContent: "flex-start", margin: "-0.5rem 0 1rem" }}>
            <ReadAloudButton text={listenText} lang={lang === "hi" ? "hi" : "en"} label={lang === "hi" ? "🔊 आज का पंचांग सुनें" : "🔊 Listen to today's Panchang"} />
          </div>
          {showExpert && <p style={{ margin: "0 0 1rem", padding: "0.625rem 0.75rem", borderRadius: T.rMd, background: "var(--surface-raised)", border: "0.0625rem solid var(--line)", color: C.muted, fontSize: T.fSmall, lineHeight: 1.55, fontVariantNumeric: "tabular-nums" }}>
            <strong style={{ color: C.ivory }}>{lang === "hi" ? "गणना आधार" : "Calculation basis"}</strong>{" · "}
            {(lang === "hi" ? "लाहिरी अयनांश · मध्यम राहु/केतु · स्थानीय सूर्योदय आधार · UTC" : "Lahiri ayanamsa · mean Rahu/Ketu · local sunrise basis · UTC")}
            {(todayP.tz >= 0 ? "+" : "") + todayP.tz}
            {place?.label ? ` · ${place.label}` : ""}
            {todayP.rise ? ` · ${lang === "hi" ? "सूर्योदय" : "sunrise"} ${fmtTime(todayP.rise, todayP.tz)}` : ""}
            {todayP.set ? ` · ${lang === "hi" ? "सूर्यास्त" : "sunset"} ${fmtTime(todayP.set, todayP.tz)}` : ""}
          </p>}
          {showPlainHelp && <p style={{ margin: "0 0 1rem", padding: "0.625rem 0.75rem", borderRadius: T.rMd, background: "var(--surface-raised)", border: "0.0625rem solid var(--line)", color: C.ivory, fontSize: T.fSmall, lineHeight: 1.55 }}>
            {lang === "hi"
              ? "पंचांग दिन के पाँच अंग बताता है। सबसे उपयोगी दो बातें नीचे हैं — कौन-सा समय शुभ है, और किस समय नया काम आरम्भ नहीं करना चाहिए।"
              : "The Panchang describes the five parts of the day. The two things most people need are just below — which times are auspicious, and which times to avoid starting something new."}
          </p>}
          {place && <div style={{ margin: "-0.75rem 0 1rem", display:"flex", alignItems:"flex-end", gap: "0.625rem", flexWrap:"wrap" }}>
            <label style={{ display: "grid", gap: T.s1, ...T.label, color: C.muted }}>
              <span>{lang === "hi" ? "कैलेंडर पद्धति" : "CALENDAR SYSTEM"}</span>
              <select value={calendarMode} onChange={(e) => chooseCalendarMode(e.target.value)} aria-label={lang === "hi" ? "कैलेंडर पद्धति" : "Calendar system"} style={{ height:T.ctrlH, borderRadius:T.rMd, border:`0.0625rem solid ${C.line}`, background:"var(--surface-sunken)", color:C.ivory, padding: "0 0.625rem", fontFamily:T.body }}>
              {CALENDAR_CONVENTIONS.filter(x => conventionIsEnabled(x.id,regionalFlags)).map(x => <option key={x.id} value={x.id}>{lang === "hi" ? x.hi : x.en}</option>)}
              </select>
            </label>
            <HolidayOverlaySelect mode={holidayMode} onMode={chooseHolidayMode} lang={lang} />
            <div style={{ fontSize:T.fMicro, color:C.muted, lineHeight:1.45, flex:"1 1 220px" }}>
              <div>{calendarLabel(calendarMode, todayP, todayP.rise, lang === "hi" ? "hi" : "en", place)}</div>
              <div style={{ fontStyle:"italic" }}>{lang === "hi" ? `समय ${place.label} के अनुसार · दूसरा कैलेंडर चुनने से केवल तारीख़ का नाम बदलता है, समय वही रहता है` : `Times shown for ${place.label} · choosing a different calendar only changes how the date is named, the timings stay the same`}</div>
              {(calendarMode==="tamil-solar"||calendarMode==="bengali-solar")&&<div className="technical-only" style={{marginTop: "0.1875rem",fontStyle:"normal"}}>{calendarMode==="tamil-solar"?(lang==="hi"?"तिरुकणित · सूर्य का निरयण राशि-प्रवेश और तमिल सूर्यास्त नियम":"Thirukanitha · sidereal solar ingress with the Tamil sunset rule"):(lang==="hi"?"विशुद्ध सिद्धान्त · सूर्य का निरयण राशि-प्रवेश और बंगाल सूर्योदय नियम":"Vishuddha Siddhanta · sidereal solar ingress with the Bengal sunrise rule")}</div>}
              {calendarState.recoveredFrom && <div role="status" style={{ marginTop: "0.1875rem",color:C.sindoor,fontStyle:"normal" }}>{calendarState.reason === "disabled" ? (lang === "hi" ? "यह क्षेत्रीय पद्धति अस्थायी रूप से बन्द है; आपकी तिथि, स्थान और भाषा रखते हुए गणक मानक दिखाया गया है।" : "That regional mode is temporarily disabled; Ganak default is shown without losing your date, place or language.") : (lang === "hi" ? "यह कैलेंडर पद्धति समर्थित नहीं है; गणक मानक दिखाया गया है।" : "That calendar mode is unsupported; Ganak default is shown.")}</div>}
            </div>
          </div>}
          <HolidayOverlayCard isoDate={panchDate} mode={holidayMode} onMode={chooseHolidayMode} lang={lang} C={C} card={card} />
          <MuhuratHub todayP={todayP} place={place} lang={lang} ayanamsa={ayanamsa} isToday={isPanchToday} onCal={setCalView} onChangeCity={focusPlaceInput} C={C} card={card} />

          <Card className="rise2" style={{ marginTop: "0.75rem" }}>
            <SectionHeader
              hi="आगामी ग्रह गोचर"
              en="Upcoming planetary events"
              lang={lang === "hi" ? "hi" : "en"}
              density="compact"
            />
            <div style={{ fontSize: "var(--font-label)", color: C.muted, fontStyle: "italic", marginBottom: "0.625rem", lineHeight: 1.45 }}>
              {lang === "hi" ? "आने वाले दिनों में ग्रह किस राशि में प्रवेश करते हैं या वक्री/मार्गी होते हैं" : "when each planet changes sign, or turns retrograde or direct, in the days ahead"}
            </div>
            {todayP.events.map((e2) => {
              const ed = eventDetail(e2, Date.now());
              const isExp = expandedEvent === (e2.t + e2.label);
              return (
                <div key={e2.t + e2.label} style={{ borderBottom: `0.0625rem solid var(--line-soft)`, padding: "0.625rem 0.125rem" }}>
                  <button
                    onClick={() => setExpandedEvent(isExp ? null : (e2.t + e2.label))}
                    className="comfort-focus"
                    aria-expanded={isExp}
                    style={{ width: "100%", minHeight: T.ctrlH, textAlign: "left", background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.625rem", flexWrap: "wrap" }}
                  >
                    <span style={{ fontSize: "var(--font-small)", display: "flex", gap: "0.875rem", alignItems: "baseline", flex: 1 }}>
                      <span style={{ color: C.gold, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap", minWidth: "5.75rem", fontSize: "var(--font-small)" }}>
                        {new Date(e2.t + todayP.tz * 3600000).toLocaleDateString(lang === "hi" ? "hi-IN" : "en-US", { month: "short", day: "numeric", timeZone: "UTC" })} · {fmtTime(e2.t, todayP.tz)}
                      </span>
                      <span style={{ color: e2.label.includes("℞") ? C.sindoor : C.ivory, flex: 1, overflowWrap: "break-word" }}>{transitLabel(lang, e2.label)}</span>
                    </span>
                    <span style={{ color: C.muted, fontSize: "var(--font-label)", whiteSpace: "nowrap", fontWeight: 500 }}>{ed.timeStr}</span>
                    <span style={{ color: C.muted, fontSize: "var(--font-small)", transform: isExp ? "rotate(180deg)" : "none", transition: "transform .2s" }}>▼</span>
                  </button>
                  {isExp && (() => {
                    const pl = e2.planet || "Sun";
                    const span = PLANET_PERIOD_DAYS[pl] || 400;
                    const g = planetGochar(pl, Date.now() - 60 * 86400000, span + 120);
                    const nowMs = Date.now();
                    const curIdx = g.seq.reduce((acc, x, i) => (x.enter === null || x.enter <= nowMs ? i : acc), 0);
                    return (
                      <div style={{ marginTop: "0.625rem", paddingTop: "0.75rem", borderTop: `0.0625rem solid var(--line-soft)`, fontSize: "var(--font-small)", color: C.ivory, lineHeight: 1.55 }}>
                        <div style={{ fontSize: "var(--font-small)", color: C.muted, fontStyle: "italic", marginBottom: "0.75rem" }}>{ed.desc}</div>
                        <div style={{ fontSize: "var(--font-micro)", textTransform: "uppercase", letterSpacing: ".1em", color: C.gold, marginBottom: "0.125rem", fontWeight: 600 }}>
                          {PLANET_DEVA[pl]} {pl} {lang === "hi" ? "राशि गोचर" : "Rashi Gochar"}
                        </div>
                        <div style={{ fontSize: "var(--font-label)", color: C.muted, fontStyle: "italic", marginBottom: "0.625rem" }}>
                          {lang === "hi" ? "यह ग्रह अभी किस राशि से गुज़र रहा है" : "which zodiac sign this planet is currently moving through"}
                        </div>
                        <div style={{ position: "relative", paddingLeft: "0.25rem" }}>
                          {g.seq.map((x, i) => {
                            const isCur = i === curIdx;
                            const dur = x.enter && x.exit ? fmtDur(x.exit - x.enter) : x.enter && !x.exit ? "ongoing" : null;
                            const stationsInSign = g.stations.filter((st) => (x.enter ? st.t >= x.enter : true) && (x.exit ? st.t < x.exit : true));
                            return (
                              <div key={i} style={{ display: "flex", gap: "0.75rem", paddingBottom: "0.875rem" }}>
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                                  <span style={{ width: "0.6875rem", height: "0.6875rem", borderRadius: "0.375rem", background: isCur ? C.gold : "var(--line)", boxShadow: isCur ? "var(--elevation-1)" : "none", zIndex: 1 }} />
                                  {i < g.seq.length - 1 && <span style={{ width: "0.125rem", flex: 1, background: "var(--line)", marginTop: "0.125rem" }} />}
                                </div>
                                <div style={{ paddingBottom: "0.125rem", flex: 1 }}>
                                  <div style={{ display: "flex", justifyContent: "space-between", gap: "0.5rem", alignItems: "baseline", flexWrap: "wrap" }}>
                                    <span style={{ fontFamily: "var(--font-display-family)", fontSize: "var(--font-body)", color: isCur ? C.gold : C.ivory, fontWeight: isCur ? 700 : 500 }}>
                                      {panchangTerm(lang, "sign", SIGNS[x.sign].split(" ")[0])}
                                    </span>
                                    {dur && <span style={{ fontSize: "var(--font-label)", color: C.muted }}>{dur}</span>}
                                  </div>
                                  <div style={{ fontSize: "var(--font-label)", color: C.muted, marginTop: "0.125rem", fontVariantNumeric: "tabular-nums" }}>
                                    {x.enter ? new Date(x.enter + todayP.tz * 3600000).toLocaleDateString(lang === "hi" ? "hi-IN" : "en-US", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }) + " · " + fmtTime(x.enter, todayP.tz) : (lang === "hi" ? "पहले से गोचर में" : "transiting since before")}
                                    {isCur && <span style={{ color: C.gold, fontWeight: 600 }}>{lang === "hi" ? " · अभी यहाँ" : " · now here"}</span>}
                                  </div>
                                  {stationsInSign.map((st, si) => (
                                    <div key={si} style={{ fontSize: "var(--font-label)", color: C.sindoor, marginTop: "0.1875rem" }}>
                                      ↺ {lang === "hi" ? (st.retro ? "वक्री होता है" : "मार्गी होता है") : ("turns " + (st.retro ? "retrograde" : "direct"))} — {new Date(st.t + todayP.tz * 3600000).toLocaleDateString(lang === "hi" ? "hi-IN" : "en-US", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        <div className="technical-only" style={{ fontSize: "var(--font-micro)", color: C.muted, marginTop: "0.25rem", fontStyle: "italic" }}>{lang === "hi" ? "सायन (लाहिरी) · समय " : "Sidereal (Lahiri) · times in "}{(place && place.label) || (lang === "hi" ? "स्थानीय" : "local")}{lang === "hi" ? " समय अनुसार · धीमे ग्रहों हेतु ±1 दिन" : " time · ±1 day for slow planets"}</div>
                        {showExpert && <div style={{ fontSize: "var(--font-micro)", color: C.muted, marginTop: "0.25rem", fontVariantNumeric: "tabular-nums" }}>
                          {(lang === "hi" ? "अयनांश " : "Ayanamsa ") + ayanamsa + " · UTC" + (todayP.tz >= 0 ? "+" : "") + todayP.tz + " · " + (lang === "hi" ? "मध्यम राहु/केतु · पूर्ण-राशि भाव" : "mean Rahu/Ketu · whole-sign houses")}
                        </div>}
                      </div>
                    );
                  })()}
                </div>
              );
            })}
          </Card>
          <PlanetCalendarCard tz={todayP.tz} placeLabel={place && place.label} lang={lang} C={C} card={card} />
        </>
      )}
    </>
  );
}
