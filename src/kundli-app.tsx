import React, { useState, useMemo, useEffect } from "react";
import { T } from "./components/tokens";
import { fmtDeg, fmtTimeD, fmtTime, fmtDateT } from "./components/format";
import PrashnaScreen from "./screens/PrashnaScreen";
import { VRAT_VIDHI, VRAT_VIDHI_LABELS, VRAT_VIDHI_SAFETY } from "./data/vrat-vidhis";
import { CHOG_NAME, OBS_NAME, FEST_NAME, OBS_META, FEST_META } from "./data/festival-meta";
import { searchOffline, searchOnline } from "./data/places";
import PlaceInput from "./components/PlaceInput";
import MatchMaker from "./screens/MatchingScreen";
import DiamondChart from "./components/DiamondChart";
import { VARGAS, SPECIAL_CHARTS, SIGN_SHORT, PLANET_GLYPH } from "./data/chart-divisions";
import { vargaSign } from "./engine/varga";
import { SEVEN } from "./engine/classical";
import { BALA_PARTS } from "./engine/shadbala";
import { KP_PLANETS, vimSub } from "./engine/dasha";
import { computeKundli } from "./engine/kundli";
import { planetGochar, PLANET_PERIOD_DAYS } from "./engine/gochar";
import { fmtDur, eventDetail } from "./engine/transit-copy";
import { DashaTree } from "./components/DashaTree";
import { ChartVault } from "./components/ChartVault";
import { BNNModule, BhriguModule } from "./screens/JyotishBnnScreen";
import { RectifyModule } from "./screens/RectifyScreen";

/* ============================================================
   JANMA — Vedic Kundli
   Built-in low-precision ephemeris (Schlyter formulas, ±0.5°),
   Lahiri ayanamsa, whole-sign houses, Vimshottari dasha.
   ============================================================ */

import {
  D2R, rev, sd, cdg, tdg, atan2d, ascendantAt,
  moonGeo, jdeFromD, sunPos, moonLon, planetGeoLon, tropicalLongitudes,
} from "./engine/ephemeris";

import {
  SIGNS, NAKSHATRAS, YOGAS, TITHIS, KARANAS_MOV, karanaName, PLANET_DEVA,
  sunEvents, moonEvents, RAHU_SEGMENT, YAMA_SEGMENT, GULIKA_SEGMENT,
  setAyanMode, ayanAt, sunSidMs, moonSidMs, elongMs, lunYogaMs, planetSidMs,
  jdOf, AYANAMSA, SIGN_LORD, VIM_LORDS,
  solveCross, lunarMonthInfo, samvatInfo, upcomingEvents, choghaSlots,
  amantaMonthIdx, pitruPakshaDay, zoneOffset,
} from "./engine/panchang";

import {
  dayHoras, horaWindowsForPlanet, HORA_GLYPH, HORA_COLOR, HORA_NAME, HORA_NATURE,
  analyzeHora, horaResultText,
} from "./engine/hora";

import { tr, trN, obsLabel } from "./i18n";

import { computeLagnaPanchaka } from "./engine/panchaka";
import { computeTodayPanchang } from "./engine/today-panchang";
import { urlPrefGet, urlPrefSet } from "./components/url-prefs";
import { CalendarPage } from "./screens/CalendarPage";
import { MuhuratHub } from "./screens/MuhuratHub";

import {
  ayyappaMandalaFor, EKADASHI_NAMES, PRADOSH_NAMES_BY_DAY, observancesFor,
  FESTIVALS, FAST_KALA_RULES, scanPanchangCalendar, obsKind,
} from "./engine/festivals";

import {
  NAK_HI, muhuratForDate, vaishnavaEkadashi, vratDetail,
  vaishnavaEkadashiDay, MUHURTA_RULES, muhuratShuddhi, muhuratScanRange,
} from "./engine/muhurat";

/* ---------------- static data ---------------- */
const NAK_NOTE = ["Swift, pioneering, healing instincts; restless until in motion.", "Intense, creative, carries burdens with discipline and will.", "Sharp, purifying, cuts through illusion; natural critic and cook.", "Magnetic, fertile, drawn to beauty, comfort and growth.", "Curious seeker, gentle wanderer, always tracing a scent.", "Stormy depth; transformation through upheaval and inquiry.", "Renewal and return; optimistic, philosophical, expansive.", "Nourishing, dutiful, deeply caring; the nurturer's star.", "Penetrating insight, hypnotic charm, guards its inner world.", "Regal, ancestral pride, seeks honor and a throne of its own.", "Pleasure-loving, artistic, generous in love and leisure.", "Steady patron, kind contracts, friendship as dharma.", "Skilled hands, wit, craft; mastery through dexterity.", "Brilliant architect of beauty; dazzling, design-minded.", "Independent as wind; flexible, restless, self-made.", "Goal-locked ambition; triumph after sustained effort.", "Devoted friend, disciplined heart, success in foreign lands.", "Eldest's burden; protective, intense, occult-leaning.", "Root-cutter; radical truth-seeking, destroys to rebuild.", "Invincible declarations; early victories, proud spirit.", "Later victory; enduring, ethical, universally respected.", "The listener; learned, fame through knowledge and word.", "Wealthy rhythm; music, abundance, marches to its own drum.", "Hundred healers; secretive, mystical, vast like the void.", "Fierce ascetic fire; intensity hidden under calm.", "Deep wisdom of the serpent; compassion, slow sure progress.", "The nourishing fish; gentle completion, protector of travelers."];

const SIGN_NOTE = ["fiery initiative, courage, a head-first approach to life", "steadfast patience, sensuality, devotion to comfort and worth", "quicksilver intellect, duality, endless curiosity", "tidal emotion, deep memory, fierce protectiveness of home", "solar dignity, generosity, a need to shine and lead", "discerning precision, service, the healer-analyst's eye", "harmonizing grace, diplomacy, life measured in relationships", "penetrating intensity, secrecy, the power to transform", "dharmic optimism, far horizons, the philosopher-archer", "mountain ambition, discipline, slow unstoppable ascent", "humanitarian vision, detachment, the reformer's mind", "boundless compassion, imagination, dissolving of edges"];

const DASHA_NOTE = {
  Ketu: "detachment, spiritual turning points, sudden severances that liberate",
  Venus: "love, art, comfort and wealth; relationships take center stage",
  Sun: "authority, recognition, father-figures; the self is forged in light",
  Moon: "emotional tides, home, mother, public connection and care",
  Mars: "drive, courage, property, conflict that builds strength",
  Rahu: "worldly hunger, foreign influence, dizzying rise and obsession",
  Jupiter: "wisdom, children, fortune, teachers; expansion and grace",
  Saturn: "discipline, karma's audit, slow rewards through endurance",
  Mercury: "intellect, commerce, communication; the mind quickens",
};

const PLANET_COLOR = { Sun: "#C05A0C", Moon: "#4E6E96", Mars: "#BB3A2A", Mercury: "#2C7D4F", Jupiter: "#9A7000", Venus: "#B3537F", Saturn: "#46588F", Rahu: "#6E5C82", Ketu: "#8A5A36" };
/* ---------------- formatting ---------------- */
const fmtDate = (ms) => new Date(ms).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });
/* ---------------- main app ---------------- */
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

  const [form, setForm] = useState({ name: "", date: "1995-08-15", time: "06:30" });
  const [place, setPlace] = useState({ label: "New Delhi, India", lat: 28.61, lon: 77.21, zone: "Asia/Kolkata" });
  const [query, setQuery] = useState("New Delhi, India");
  const [sugs, setSugs] = useState([]);
  const [searching, setSearching] = useState(false);
  const [tzOverride, setTzOverride] = useState("");
  const [result, setResult] = useState(null);
  const [varga, setVarga] = useState("D1");
  const [refPt, setRefPt] = useState("lagna");
  const [ayanamsa, setAyanamsa] = useState("lahiri");
  const [err, setErr] = useState("");

  // Vimshottari drill-down: which sub-periods are expanded (keys "level:startMs").
  // Auto-opens the running antar/pratyantar/sookshma chain on each new cast.
  const [openD, setOpenD] = useState(() => new Set());
  const detectLang = () => { try { const ls = (navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || "en"]).map((x) => String(x || "").toLowerCase()); return ls.some((l) => l.startsWith("hi")) ? "hi" : "en"; } catch (e) { return "en"; } };
  // Language and screen survive a reload via the URL (?lang=hi&screen=prashna) —
  // browser storage is banned in this project, but the address bar is not storage.
  const [lang, setLang] = useState(() => { const v = urlPrefGet("lang"); return v === "hi" || v === "en" ? v : detectLang(); });
  const chooseLang = (v) => { setLang(v); urlPrefSet("lang", v); };
  const [mode, setMode] = useState(() => { const v = urlPrefGet("screen"); return v === "chart" || v === "prashna" || v === "daily" ? v : "daily"; });
  const chooseMode = (v) => { setMode(v); urlPrefSet("screen", v); };
  const toggleD = (k) => setOpenD((prev) => { const n = new Set(prev); n.has(k) ? n.delete(k) : n.add(k); return n; });
  useEffect(() => {
    if (!result || !result.curAntar) { setOpenD(new Set()); return; }
    const keys = new Set(["0:" + result.curAntar.start]);
    if (result.curPratya) keys.add("1:" + result.curPratya.start);
    if (result.curSookshma) keys.add("2:" + result.curSookshma.start);
    setOpenD(keys);
  }, [result]);
  const debounceRef = React.useRef(null);
  const seqRef = React.useRef(0);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const onQuery = (q) => {
    setQuery(q);
    setPlace(null);
    setTzOverride("");
    const offline = searchOffline(q);
    setSugs(offline);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (q.trim().length < 2) return;
    const mySeq = ++seqRef.current;
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const online = await searchOnline(q);
        if (mySeq !== seqRef.current) return; // a newer query superseded this one
        const seen = new Set(offline.map((o) => o.label.toLowerCase()));
        const merged = offline.concat(online.filter((o) => !seen.has(o.label.toLowerCase()))).slice(0, 8);
        setSugs(merged);
      } catch {
        /* offline results already shown */
      } finally {
        if (mySeq === seqRef.current) setSearching(false);
      }
    }, 350);
  };

  const choosePlace = (p) => {
    setPlace(p);
    setQuery(p.label);
    setSugs([]);
    setTzOverride("");
  };

  // resolve the UTC offset automatically from the place's timezone on the birth date
  const [yy, mm2, dd2] = (form.date || "").split("-").map(Number);
  const autoTz = place && place.zone && yy ? zoneOffset(place.zone, yy, mm2, dd2) : null;

  const loadChart = (c) => {
    if (!c || !c.form || !c.place) return;
    setForm(c.form); setPlace(c.place); setQuery(c.place.label);
    setTzOverride(c.tzOverride != null ? c.tzOverride : ""); setAyanamsa(c.ayanamsa || "lahiri");
    setErr("");
    try {
      const [y, m, day] = (c.form.date || "").split("-").map(Number);
      const [hh, mi] = (c.form.time || "").split(":").map(Number);
      const tz = c.tzOverride !== "" && c.tzOverride != null ? parseFloat(c.tzOverride) : zoneOffset(c.place.zone, y, m, day);
      setResult(computeKundli({ y, m, day, hh, mi, tz, lat: c.place.lat, lon: c.place.lon, ayanamsa: c.ayanamsa || "lahiri" }));
      setTimeout(() => { const el = document.getElementById("summary"); if (el) el.scrollIntoView({ behavior: "smooth" }); }, 150);
    } catch (e) { setErr(lang === "hi" ? "यह सहेजी हुई कुंडली नहीं खुल सकी — शायद यह ख़राब है। कोई और सहेजी कुंडली आज़माएँ या विवरण फिर से भरें।" : "This saved chart couldn't be loaded — it may be corrupted. Try another saved chart, or re-enter the details."); }
  };

  const generate = () => {
    setErr("");
    const [y, m, day] = (form.date || "").split("-").map(Number);
    const [hh, mi] = (form.time || "").split(":").map(Number);
    if (!y || isNaN(hh)) { setErr(lang === "hi" ? "जन्म की पूरी तारीख़ और समय भरें।" : "Enter a complete date and time of birth."); return; }
    // Use the picked place if present; otherwise, if the typed text resolves to
    // exactly one known place, adopt it and cast in the same click (no second press).
    let effPlace = place;
    if (!effPlace) {
      const offline = searchOffline(query);
      if (offline.length === 1) { effPlace = offline[0]; choosePlace(offline[0]); }
      else { setErr(lang === "hi" ? "जन्म स्थान लिखना शुरू करें और सुझावों में से चुनें।" : "Start typing the birth place and pick it from the suggestions."); return; }
    }
    const tz = tzOverride !== "" ? parseFloat(tzOverride) : zoneOffset(effPlace.zone, y, m, day);
    if (tz === null || isNaN(tz)) { setErr(lang === "hi" ? "इस स्थान का समय-क्षेत्र नहीं मिला — कृपया नीचे UTC ऑफ़सेट स्वयं भरें।" : "Couldn't resolve the timezone for this place — enter the UTC offset manually below."); return; }
    setResult(computeKundli({ y, m, day, hh, mi, tz, lat: effPlace.lat, lon: effPlace.lon, ayanamsa }));
    setTimeout(() => { const el = document.getElementById("summary"); if (el) el.scrollIntoView({ behavior: "smooth" }); }, 150);
  };

  const inputStyle = {
    width: "100%", boxSizing: "border-box", background: "#FFFDF7",
    border: `1px solid ${C.line}`, borderRadius: 6, color: C.ivory,
    padding: "10px 12px", fontSize: 15, fontFamily: "Spectral, serif", outline: "none",
  };
  const labelStyle = { ...T.label, color: C.muted, display: "block", marginBottom: 6 };

  const Eyebrow = ({ deva, en, id }) => (
    <div id={id} style={{ display: "flex", alignItems: "baseline", gap: T.s3, margin: `${T.s8}px 0 ${T.s4}px`, borderBottom: `1px solid ${C.line}`, paddingBottom: T.s3, scrollMarginTop: 64 }}>
      <span style={{ fontFamily: T.serif, color: C.gold, fontSize: T.fHeading }}>{deva}</span>
      <span style={{ ...T.label, color: C.muted }}>{en}</span>
    </div>
  );

  const [panchPlace, setPanchPlace] = useState(null); // panchang city, independent of birth place
  const [panchDate, setPanchDate] = useState(() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; });
  const [calOpen, setCalOpen] = useState(false);
  const [calYM, setCalYM] = useState(null);
  const [calView, setCalView] = useState(null);
  const [expandedEvent, setExpandedEvent] = useState(null); // which upcoming event card is open
  const panchEff = panchPlace || place;
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

  const r = result;
  const curVarga = VARGAS.find((v) => v.k === varga) || VARGAS[0];
  const REFS = [
    { k: "lagna", deva: "लग्न", en: "Lagna" },
    { k: "surya", deva: "सूर्य", en: "Surya" },
    { k: "chandra", deva: "चन्द्र", en: "Chandra" },
    { k: "karakamsa", deva: "कारकांश", en: "Karakamsa" },
  ];
  const akRow = r ? r.rows.find((p) => p.name === r.ak) : null;
  const vAscSign = !r ? 0
    : refPt === "karakamsa" ? vargaSign(akRow.lon, "D9")              // Karakamsa = Atmakaraka's navamsa sign
    : refPt === "surya" ? vargaSign(r.sun.lon, varga)
    : refPt === "chandra" ? vargaSign(r.moon.lon, varga)
    : vargaSign(r.ascSid, varga);
  const refNote = !r ? "" :
    refPt === "surya" ? "houses counted from the Sun — Surya kundli" :
    refPt === "chandra" ? "houses counted from the Moon — Chandra kundli" :
    refPt === "karakamsa" ? `houses counted from ${r.ak}'s navamsa sign — Karakamsa` : "";
  const vPlanets = r
    ? r.rows.map((p) => {
        const vs = vargaSign(p.lon, varga);
        return { label: PLANET_GLYPH[p.name], house: ((vs - vAscSign + 12) % 12) + 1, retro: p.retro, deg: p.deg };
      })
    : [];

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
            {[["daily", lang === "hi" ? "आज · पंचांग" : "Daily"], ["chart", lang === "hi" ? "कुंडली" : "Chart"], ["prashna", lang === "hi" ? "प्रश्न" : "Prashna"]].map(([mk, label]) => (
              <button key={mk} onClick={() => chooseMode(mk)} style={{ padding: "9px 26px", borderRadius: T.rSm, fontFamily: T.serif, fontSize: T.fBody, cursor: "pointer", border: "none", background: mode === mk ? C.panel : "transparent", color: mode === mk ? C.gold : C.muted, fontWeight: mode === mk ? 600 : 400, boxShadow: mode === mk ? T.e1 : "none", transition: "all .15s" }}>{label}</button>
            ))}
          </div>
        </div>

        {calView && <CalendarPage view={calView} place={panchEff} lang={lang} onBack={() => setCalView(null)} C={C} card={card} />}

        {mode === "prashna" && (
          <PrashnaScreen lat={panchEff?.lat} lon={panchEff?.lon} placeLabel={panchEff?.label} lang={lang} />
        )}

        {mode === "chart" && r && (
          <nav className="rise hscroll" style={{ position: "sticky", top: 8, zIndex: 30, display: "flex", gap: 6, overflowX: "auto", padding: "8px 10px", margin: "0 -4px 4px", background: "rgba(250,245,234,.92)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", border: `1px solid ${C.line}`, borderRadius: 12, boxShadow: "0 4px 14px rgba(110,82,24,.08)" }}>
            {[["#chart", "Kundli"], ["#yogas", "Yogas"], ["#planets", "Grahas"], ["#kp", "KP sub-lords"], ["#ksig", "KP significators"], ["#match", "Matching"], ["#karakas", "Karakas"], ["#shadbala", "Shadbala"], ["#special", "Special"], ["#chalit", "Bhava Chalit"], ["#av", "Ashtakavarga"], ["#arudha", "Arudha"], ["#rectify", "Rectify"], ["#bnn", "BNN"], ["#bhrigu", "Bhrigu"], ["#dasha", "Dasha"], ["#reading", "Reading"]].map(([href, label]) => (
              <a key={href} href={href} className="chip" style={{ whiteSpace: "nowrap", textDecoration: "none", fontSize: 12.5, padding: "6px 12px", borderRadius: 8, border: `1px solid ${C.line}`, color: C.muted, background: "#FBF5E7", fontFamily: "Spectral, serif" }}>{label}</a>
            ))}
          </nav>
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
          <>
        {/* birth details */}
        <section className="rise2" style={{ ...card, padding: 24 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 14 }}>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>{lang === "hi" ? "नाम" : "Name"}</label>
              <input style={inputStyle} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder={lang === "hi" ? "जैसे: प्रिया शर्मा" : "e.g. Priya Sharma"} />
            </div>
            <div>
              <label style={labelStyle}>{lang === "hi" ? "जन्म तिथि" : "Date of birth"}</label>
              <input type="date" style={inputStyle} value={form.date} onChange={(e) => set("date", e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>{lang === "hi" ? "जन्म समय" : "Time of birth"}</label>
              <input type="time" style={inputStyle} value={form.time} onChange={(e) => set("time", e.target.value)} />
            </div>
            <div style={{ gridColumn: "1 / -1", position: "relative" }}>
              <label style={labelStyle}>{lang === "hi" ? "जन्म स्थान" : "Place of birth"}</label>
              <input
                style={inputStyle}
                value={query}
                onChange={(e) => onQuery(e.target.value)}
                placeholder={lang === "hi" ? "शहर या गाँव का नाम लिखना शुरू करें…" : "Start typing a city or village name…"}
                autoComplete="off"
              />
              {sugs.length > 0 && !place && (
                <div style={{ position: "absolute", left: 0, right: 0, top: "100%", zIndex: 10, background: "#FFFFFF", border: `1px solid ${C.gold}`, borderRadius: 8, marginTop: 4, overflow: "hidden", boxShadow: "0 12px 30px rgba(95,70,20,.18)" }}>
                  {sugs.map((p) => (
                    <button
                      key={p.label + p.lat}
                      onClick={() => choosePlace(p)}
                      className="sug"
                      style={{ display: "block", width: "100%", textAlign: "left", padding: "10px 14px", background: "transparent", border: "none", borderBottom: `1px solid ${C.line}`, color: C.ivory, fontFamily: "Spectral, serif", fontSize: 14.5, cursor: "pointer" }}
                    >
                      {p.label}
                      <span style={{ color: C.muted, fontSize: 12, marginLeft: 8 }}>
                        {Math.abs(p.lat).toFixed(2)}°{p.lat >= 0 ? "N" : "S"}, {Math.abs(p.lon).toFixed(2)}°{p.lon >= 0 ? "E" : "W"}
                      </span>
                    </button>
                  ))}
                  {searching && <div style={{ padding: "8px 14px", color: C.muted, fontSize: 12 }}>{lang === "hi" ? "और स्थान खोजे जा रहे हैं…" : "Searching more places…"}</div>}
                </div>
              )}
              {place && (
                <p style={{ color: C.muted, fontSize: 12.5, margin: "8px 0 0" }}>
                  <span style={{ color: C.gold }}>✓</span>{" "}
                  {Math.abs(place.lat).toFixed(2)}°{place.lat >= 0 ? "N" : "S"}, {Math.abs(place.lon).toFixed(2)}°{place.lon >= 0 ? "E" : "W"}
                  {place.zone && <> · {place.zone}</>}
                  {autoTz !== null && <> · UTC{autoTz >= 0 ? "+" : ""}{autoTz}{lang === "hi" ? " (जन्म तिथि पर)" : " on the birth date"}{tzOverride !== "" && (lang === "hi" ? " (बदला गया)" : " (overridden)")}</>}
                </p>
              )}
            </div>
            <div>
              <label style={labelStyle}>{lang === "hi" ? "UTC ऑफ़सेट (स्वतः)" : "UTC offset (auto)"}</label>
              <input
                type="number" step="0.25" style={inputStyle}
                value={tzOverride !== "" ? tzOverride : autoTz ?? ""}
                onChange={(e) => setTzOverride(e.target.value)}
                placeholder={lang === "hi" ? "जैसे: +5.5" : "e.g. +5.5"}
              />
            </div>
          </div>
          {err && <p style={{ color: C.sindoor, fontSize: 14, margin: "12px 0 0" }}><span aria-hidden="true">⚠ </span>{err}</p>}
          <div style={{ marginTop: 16 }}>
            <label style={labelStyle}>{lang === "hi" ? "अयनांश" : "Ayanamsa"}</label>
            <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
              {Object.entries(AYANAMSA).map(([k, v]) => (
                <button key={k} onClick={() => setAyanamsa(k)}
                  style={{ flex: 1, padding: "9px 10px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600,
                    border: ayanamsa === k ? "1.5px solid #A86A12" : "1px solid #D9CCAE",
                    background: ayanamsa === k ? "rgba(168,106,18,.10)" : "#FBF6EC",
                    color: ayanamsa === k ? C.gold : C.muted }}>
                  {v.label}
                </button>
              ))}
            </div>
            <p style={{ color: C.muted, fontSize: 11.5, margin: "6px 0 0", lineHeight: 1.5 }}>
              {lang === "hi"
                ? "लाहिरी सरकारी/वैदिक मानक है। KP (कृष्णमूर्ति) हर स्थिति को लगभग 5′48″ पहले खिसकाता है — कृष्णमूर्ति पद्धति के उप-स्वामी कार्य हेतु आवश्यक।"
                : "Lahiri is the government/Vedic standard. KP (Krishnamurti) shifts every position ~5′48″ earlier — required for Krishnamurti Paddhati sub-lord work."}
            </p>
          </div>
          <button
            onClick={generate}
            className="castBtn" style={{ marginTop: 18, width: "100%", padding: "14px 0", background: `linear-gradient(180deg, #E08A22, #C9711A 55%, #B0610F)`, color: "#FFF8E9", border: "1px solid #D98E33", borderRadius: 9, fontFamily: "Eczar, serif", fontWeight: 700, fontSize: 17, letterSpacing: "0.07em", cursor: "pointer", boxShadow: "0 6px 18px rgba(168,106,18,.25)" }}
          >
            {lang === "hi" ? "कुंडली बनाएँ" : "Cast the chart"}
          </button>
          <p style={{ color: C.muted, fontSize: 12, margin: "10px 0 0", lineHeight: 1.5 }}>
            {lang === "hi"
              ? "UTC ऑफ़सेट जन्म स्थान और तिथि से स्वतः निकाला जाता है, ऐतिहासिक डेलाइट सेविंग सहित। सूर्य और चन्द्र आर्क-सेकंड परिशुद्धता वाले एफ़ेमेरिस (Meeus/VSOP) से, और पाँच तारा-ग्रह VSOP87 से (प्रकाश-काल, वार्षिक विपथन व नमन सहित) — लगभग आर्क-सेकंड तक सटीक स्थितियाँ।"
              : "The UTC offset is resolved automatically from the birth place and date, including historical daylight saving. Sun and Moon use an arc-second ephemeris (Meeus/VSOP), and the five star-planets use VSOP87 with light-time, annual aberration, and nutation — apparent positions accurate to about an arc-second, validated against Meeus's worked example (Venus) to 0.8″."}
          </p>
        </section>

        <ChartVault snapshot={{ form, place, tzOverride, ayanamsa }} result={result} onLoad={loadChart} C={C} card={card} lang={lang} />

        {/* kundali matching */}
        <Eyebrow id="match" deva="कुण्डली मिलान" en="Kundali matching · Guna Milan" />
        <MatchMaker C={C} card={card} computeKundli={computeKundli} />
          </>
        )}

        {mode === "chart" && r && (
          <>
            {/* identity strip */}
            <Eyebrow id="summary" deva="जन्म विवरण" en="Birth summary" />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
              {[
                ["Lagna (Ascendant)", `${SIGNS[r.ascSign].split(" ")[0]} ${fmtDeg(r.ascDeg)}`],
                ["Rashi (Moon sign)", SIGNS[r.moon.sign].split(" ")[0]],
                ["Janma Nakshatra", `${NAKSHATRAS[r.moon.nak]} · pada ${r.moon.pada}`],
                ["Surya (Sun sign)", SIGNS[r.sun.sign].split(" ")[0]],
              ].map(([k, v]) => (
                <div key={k} style={{ ...card, padding: "14px 16px" }}>
                  <div style={{ ...T.label, color: C.muted, marginBottom: 6 }}>{k}</div>
                  <div style={{ fontFamily: "Eczar, serif", fontSize: 17, color: C.gold, overflowWrap: "anywhere" }}>{v}</div>
                </div>
              ))}
            </div>

            {/* chart */}
            <Eyebrow id="chart" deva="षोडशवर्ग" en={`${curVarga.k} · ${curVarga.name}`} />
            <div className="rise" style={{ ...card, padding: "20px 14px 18px" }}>
              {/* reference lagna: contained segmented control, wraps 4→2×2 on narrow screens */}
              <div style={{ margin: "0 4px 12px" }}>
                <div style={{ ...T.label, color: C.muted, marginBottom: 7, textAlign: "center" }}>Houses counted from</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 4, background: "#F4ECD9", border: `1px solid ${C.line}`, borderRadius: 12, padding: 4 }}>
                  {REFS.map((rf) => (
                    <button key={rf.k} onClick={() => setRefPt(rf.k)}
                      style={{ padding: "8px 4px", borderRadius: 9, cursor: "pointer", fontFamily: "Spectral, serif", fontSize: 12.5, lineHeight: 1.25, border: rf.k === refPt ? `1px solid ${C.gold}55` : "1px solid transparent", background: rf.k === refPt ? "#FFFFFF" : "transparent", color: rf.k === refPt ? C.gold : C.muted, boxShadow: rf.k === refPt ? "0 2px 8px rgba(110,82,24,.12)" : "none", fontWeight: rf.k === refPt ? 600 : 400 }}>
                      <span style={{ fontFamily: "Eczar, serif", display: "block", fontSize: 13 }}>{rf.deva}</span>
                      {rf.en}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ fontSize: 11.5, color: C.muted, textAlign: "center", margin: "0 4px 8px", fontStyle: "italic", lineHeight: 1.4 }}>
                {lang === "hi" ? "षोडशवर्ग हर एक जीवन-क्षेत्र को विस्तार से दिखाते हैं — विवरण हेतु किसी भी वर्ग को दबाएँ।" : "Divisional charts each zoom into one area of life — tap any chart to see its focus."}
              </div>
              {/* varga strip: single horizontally-scrollable row, never overflows the card */}
              <div className="hscroll" style={{ display: "flex", gap: 6, overflowX: "auto", padding: "2px 4px 8px", margin: "0 0 4px", WebkitOverflowScrolling: "touch" }}>
                {VARGAS.map((v) => (
                  <button key={v.k} className="chip" title={`${v.name} — ${v.theme}`}
                    onClick={(e) => { setVarga(v.k); try { e.currentTarget.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" }); } catch {} }}
                    style={{ flexShrink: 0, padding: "7px 14px", borderRadius: 18, cursor: "pointer", fontFamily: "Spectral, serif", fontSize: 13, letterSpacing: ".03em", border: `1px solid ${v.k === varga ? C.gold : C.line}`, background: v.k === varga ? "rgba(168,106,18,.12)" : "#FFFFFF", color: v.k === varga ? C.gold : C.muted, fontWeight: v.k === varga ? 600 : 400 }}>
                    {v.k}
                  </button>
                ))}
              </div>
              <p style={{ textAlign: "center", color: C.gold, fontSize: 13, margin: "8px 0 2px", fontFamily: "Eczar, serif", letterSpacing: ".04em" }}>
                {curVarga.name} — {curVarga.theme}
              </p>
              {refNote && <p style={{ textAlign: "center", color: C.muted, fontSize: 12, margin: "2px 0 10px" }}>{refNote}</p>}
              {!refNote && <div style={{ height: 10 }} />}
              <DiamondChart
                key={varga + refPt}
                title={form.name ? `${form.name} · ${(place && place.label) || ""}` : (place && place.label) || "Birth chart"}
                ascSign={vAscSign}
                houseOfPlanet={vPlanets}
                showDeg={varga === "D1"}
                lagnaLabel={refPt === "lagna" ? "LAGNA" : refPt === "surya" ? "SURYA" : refPt === "chandra" ? "CHANDRA" : "KARAKAMSA"}
                gold={C.gold} ivory={C.ivory} muted={C.muted} sindoor={C.sindoor}
              />
              <p style={{ textAlign: "center", color: C.muted, fontSize: 12, margin: "8px 0 0" }}>
                Numbers mark the rashi in each house · <span style={{ color: C.sindoor }}>℞</span> retrograde
                {varga === "D2" && " · the Hora chart uses only Cancer (Moon) and Leo (Sun)"}
              </p>
            </div>

            {/* yogas */}
            <Eyebrow id="yogas" deva="योग" en={`Yogas detected · ${r.yogas.length}`} />
            {r.yogas.length === 0 ? (
              <p style={{ color: C.muted, fontSize: 14 }}>{lang === "hi" ? "इस कुंडली में कोई प्रमुख शास्त्रीय योग नहीं मिला।" : "No major classical yogas were found in this chart."}</p>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
                {r.yogas.map((yg) => (
                  <div key={yg.name} className="rise" style={{ ...card, padding: "14px 16px", borderLeft: `3px solid ${yg.kind === "good" ? C.gold : C.sindoor}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                      <span style={{ fontFamily: "Eczar, serif", fontSize: 15.5, color: yg.kind === "good" ? C.gold : C.sindoor }}>{yg.name}</span>
                      <span style={{ fontSize: 9.5, letterSpacing: ".12em", textTransform: "uppercase", color: C.muted, whiteSpace: "nowrap" }}>{yg.kind === "good" ? "auspicious" : "challenging"}</span>
                    </div>
                    <div style={{ fontSize: 13.5, lineHeight: 1.55 }}>{yg.text}</div>
                  </div>
                ))}
              </div>
            )}

            {/* planetary table */}
            <Eyebrow id="planets" deva="ग्रह स्थिति" en="Planetary positions (sidereal)" />
            <div className="rise" style={{ ...card, padding: "14px 16px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10, marginBottom: 12 }}>
                {[
                  { n: "Lagna", deva: "La", sign: r.ascSign, deg: r.ascDeg, nak: r.ascNak, house: 1 },
                  ...r.rows.map(p => ({ n: p.name, deva: PLANET_GLYPH[p.name], sign: p.sign, deg: p.deg, nak: p.nak, house: p.house, retro: p.retro, color: PLANET_COLOR[p.name] }))
                ].map((p, i) => (
                  <div key={p.n} style={{ background: "#FBF5E7", border: `1px solid ${C.line}`, borderRadius: 10, padding: "10px 12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}>
                      <span style={{ width: 7, height: 7, borderRadius: 3, background: p.color || C.gold, flexShrink: 0 }} />
                      <span style={{ fontSize: 13, fontWeight: 600, color: C.ivory, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {p.n}{p.retro && <span style={{ color: C.sindoor, marginLeft: 2 }}>℞</span>}
                      </span>
                    </div>
                    <div style={{ fontSize: 11.5, color: C.muted, lineHeight: 1.4 }}>
                      <div><span style={{ fontWeight: 600, color: C.ivory }}>{SIGNS[p.sign].split(" ")[0]}</span> {fmtDeg(p.deg)}</div>
                      <div style={{ fontSize: 10.5, marginTop: 3 }}>{NAKSHATRAS[p.nak].split(" ")[0]}</div>
                      <div style={{ fontSize: 10.5, marginTop: 2, color: C.gold }}>H{p.house}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ textAlign: "center", color: C.muted, fontSize: 11, paddingTop: 10, borderTop: `1px solid ${C.line}` }}>
                Ayanamsa (Lahiri): <span style={{ color: C.ivory, fontVariantNumeric: "tabular-nums" }}>{fmtDeg(r.ayan)}</span> · Retrograde ℞ shown in <span style={{ color: C.sindoor }}>vermillion</span>
              </div>
            </div>

            {/* KP sub-lords */}
            <Eyebrow id="kp" deva="के॰पी॰ उपस्वामी" en="KP sub-lords (Krishnamurti Paddhati)" />
            <div className="rise" style={{ ...card, padding: "8px 4px", overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 360 }}>
                <thead>
                  <tr style={{ color: C.muted, textAlign: "left", fontSize: 11, letterSpacing: ".05em", textTransform: "uppercase" }}>
                    <th style={{ padding: "6px 10px" }}>Graha</th>
                    <th style={{ padding: "6px 10px" }}>Sign</th>
                    <th style={{ padding: "6px 10px" }}>Nakshatra</th>
                    <th style={{ padding: "6px 10px" }}>Star lord</th>
                    <th style={{ padding: "6px 10px" }}>Sub lord</th>
                    <th style={{ padding: "6px 10px" }}>Sub-sub</th>
                  </tr>
                </thead>
                <tbody>
                  {r.rows.map((p) => (
                    <tr key={p.name} style={{ borderTop: "1px solid #EBDFC6" }}>
                      <td style={{ padding: "7px 10px", whiteSpace: "nowrap" }}>
                        <span style={{ color: PLANET_COLOR[p.name], fontWeight: 600 }}>{PLANET_GLYPH[p.name]}</span> {p.name}{p.retro ? <span style={{ color: C.sindoor }}> ℞</span> : ""}
                      </td>
                      <td style={{ padding: "7px 10px", color: C.muted, whiteSpace: "nowrap" }}>{SIGN_SHORT[p.sign]} {fmtDeg(p.deg)}</td>
                      <td style={{ padding: "7px 10px", color: C.muted, fontSize: 12 }}>{NAKSHATRAS[p.nak]}</td>
                      <td style={{ padding: "7px 10px", color: PLANET_COLOR[p.kp.starLord] }}>{p.kp.starLord}</td>
                      <td style={{ padding: "7px 10px", color: PLANET_COLOR[p.kp.subLord], fontWeight: 700 }}>{p.kp.subLord}</td>
                      <td style={{ padding: "7px 10px", color: PLANET_COLOR[p.kp.subSub] }}>{p.kp.subSub}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p style={{ color: C.muted, fontSize: 11.5, margin: "10px 0 0", lineHeight: 1.5 }}>
              Each nakshatra (13°20′) is split into nine Vimshottari-proportioned <em>subs</em>, starting from the star lord — the 249-division scheme. The <span style={{ color: C.gold }}>sub lord</span> is the deciding factor in KP. {ayanamsa === "lahiri" ? "You're on Lahiri ayanamsa; switch to KP (Krishnamurti) above for the canonical KP sub-lords." : "Computed on the KP (Krishnamurti) ayanamsa."}
            </p>

            <div style={{ ...T.label, color: C.muted, margin: "18px 0 8px" }}>
              Cuspal sub-lords · {r.kpData.houseSystem} houses
            </div>
            <div className="rise" style={{ ...card, padding: "8px 4px", overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 360 }}>
                <thead>
                  <tr style={{ color: C.muted, textAlign: "left", fontSize: 11, letterSpacing: ".05em", textTransform: "uppercase" }}>
                    <th style={{ padding: "6px 10px" }}>Bhava</th>
                    <th style={{ padding: "6px 10px" }}>Cusp</th>
                    <th style={{ padding: "6px 10px" }}>Nakshatra</th>
                    <th style={{ padding: "6px 10px" }}>Star</th>
                    <th style={{ padding: "6px 10px" }}>Sub</th>
                    <th style={{ padding: "6px 10px" }}>Sub-sub</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => {
                    const L = r.kpData.cusps[h], sl = r.kpData.cuspSubLords[h];
                    if (L == null || !sl) return null;
                    const nakIdx = Math.floor(L / (360 / 27));
                    const angular = h === 1 || h === 4 || h === 7 || h === 10;
                    return (
                      <tr key={h} style={{ borderTop: "1px solid #EBDFC6", background: angular ? "rgba(168,106,18,.04)" : "transparent" }}>
                        <td style={{ padding: "7px 10px", fontFamily: "Eczar, serif", color: angular ? C.gold : C.ivory, whiteSpace: "nowrap" }}>{h}{h === 1 ? " (Asc)" : h === 10 ? " (MC)" : ""}</td>
                        <td style={{ padding: "7px 10px", color: C.muted, whiteSpace: "nowrap" }}>{SIGN_SHORT[Math.floor(L / 30)]} {fmtDeg(L % 30)}</td>
                        <td style={{ padding: "7px 10px", color: C.muted, fontSize: 12 }}>{NAKSHATRAS[nakIdx]}</td>
                        <td style={{ padding: "7px 10px", color: PLANET_COLOR[sl.starLord] }}>{sl.starLord}</td>
                        <td style={{ padding: "7px 10px", color: PLANET_COLOR[sl.subLord], fontWeight: 700 }}>{sl.subLord}</td>
                        <td style={{ padding: "7px 10px", color: PLANET_COLOR[sl.subSub] }}>{sl.subSub}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p style={{ color: C.muted, fontSize: 11.5, margin: "10px 0 0", lineHeight: 1.5 }}>
              Cusps use {r.kpData.houseSystem === "Placidus" ? "the Placidus system (semi-arcs trisected in time) — the KP standard" : "a Porphyry fallback because Placidus is undefined at this latitude"}. The <span style={{ color: C.gold }}>cuspal sub-lord</span> is the cornerstone of KP analysis — it signifies whether the matters of that house will fructify. {ayanamsa === "lahiri" ? "Switch to KP ayanamsa above for canonical KP cusps." : ""}
            </p>

            {/* KP significators */}
            <Eyebrow id="ksig" deva="के॰पी॰ सूचक" en="KP significators & ruling planets" />
            {(() => {
              const RP = r.rulingPlanets;
              const Chip = ({ pl, dim }) => (
                <span style={{ display: "inline-block", padding: "2px 7px", borderRadius: 6, fontSize: 12, fontWeight: 600, margin: "2px 3px 2px 0",
                  color: dim ? C.muted : "#FFF8E9", background: dim ? "transparent" : PLANET_COLOR[pl], border: dim ? `1px solid ${PLANET_COLOR[pl]}` : "none" }}>
                  {pl}
                </span>
              );
              const RPItem = ({ label, pl }) => (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, marginRight: 12, marginBottom: 4 }}>
                  <span style={{ fontSize: 10.5, color: C.muted, textTransform: "uppercase", letterSpacing: ".04em" }}>{label}</span>
                  <span style={{ color: PLANET_COLOR[pl], fontWeight: 700, fontSize: 13 }}>{pl}</span>
                </span>
              );
              return (
                <div>
                  <div className="rise" style={{ ...card, padding: "14px 16px", borderLeft: "3px solid #A86A12", marginBottom: 14 }}>
                    <div style={{ ...T.label, color: C.gold, marginBottom: 8 }}>Ruling Planets · birth moment</div>
                    <div style={{ display: "flex", flexWrap: "wrap", rowGap: 4 }}>
                      <RPItem label="Asc lord" pl={RP.ascSignLord} />
                      <RPItem label="Asc star" pl={RP.ascStarLord} />
                      <RPItem label="Asc sub" pl={RP.ascSubLord} />
                      <RPItem label="Moon lord" pl={RP.moonSignLord} />
                      <RPItem label="Moon star" pl={RP.moonStarLord} />
                      <RPItem label="Moon sub" pl={RP.moonSubLord} />
                      <RPItem label="Day lord" pl={RP.dayLord} />
                    </div>
                  </div>

                  <div style={{ ...T.label, color: C.muted, margin: "4px 0 8px" }}>
                    House significators (strongest first)
                  </div>
                  <div className="rise" style={{ ...card, padding: "8px 4px", overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 380 }}>
                      <thead>
                        <tr style={{ color: C.muted, textAlign: "left", fontSize: 11, letterSpacing: ".05em", textTransform: "uppercase" }}>
                          <th style={{ padding: "6px 10px" }}>Bhava</th>
                          <th style={{ padding: "6px 10px" }}>Occupants</th>
                          <th style={{ padding: "6px 10px" }}>Owner</th>
                          <th style={{ padding: "6px 10px" }}>Significators</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                          <tr key={h} style={{ borderTop: "1px solid #EBDFC6", verticalAlign: "top" }}>
                            <td style={{ padding: "8px 10px", fontFamily: "Eczar, serif", color: C.ivory }}>{h}</td>
                            <td style={{ padding: "8px 10px", whiteSpace: "nowrap" }}>{r.kpSig.occupants[h].length ? r.kpSig.occupants[h].map((pl) => <Chip key={pl} pl={pl} />) : <span style={{ color: C.muted, fontSize: 12 }}>—</span>}</td>
                            <td style={{ padding: "8px 10px" }}>{r.kpSig.owner[h] ? <Chip pl={r.kpSig.owner[h]} dim /> : "—"}</td>
                            <td style={{ padding: "8px 10px" }}>{r.kpSig.ordered[h].map((pl) => <Chip key={pl} pl={pl} />)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 6, fontStyle: "italic" }}>{lang === "hi" ? "— का अर्थ है कोई नहीं" : "— means none"}</div>

                  <div style={{ ...T.label, color: C.muted, margin: "18px 0 8px" }}>
                    Houses signified by each planet
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 8 }}>
                    {KP_PLANETS.map((pl) => (
                      <div key={pl} className="rise" style={{ ...card, padding: "9px 12px", display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ color: PLANET_COLOR[pl], fontWeight: 700, fontSize: 13, minWidth: 52 }}>{PLANET_GLYPH[pl]} {pl.slice(0, 3)}</span>
                        <span style={{ color: C.ivory, fontSize: 13, fontVariantNumeric: "tabular-nums" }}>{r.kpSig.housesOf[pl].length ? r.kpSig.housesOf[pl].join(", ") : "—"}</span>
                      </div>
                    ))}
                  </div>
                  <p style={{ color: C.muted, fontSize: 11.5, margin: "12px 0 0", lineHeight: 1.5 }}>
                    A planet promises the matters of every house it signifies; during its dasha/bhukti — especially when it is also a Ruling Planet — those houses fructify. Rahu and Ketu also act as agents of their star and sign lords (apply that nuance when judging the nodes). {ayanamsa === "lahiri" ? "Switch to KP ayanamsa above for canonical KP significators." : "Computed on the KP ayanamsa."}
                  </p>
                </div>
              );
            })()}

            {/* jaimini karakas */}
            <Eyebrow id="karakas" deva="चर कारक" en="Jaimini chara karakas" />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
              {r.karakas.map((kk, i) => (
                <div key={kk.role} style={{ ...card, padding: "13px 15px", border: `1px solid ${i === 0 ? C.gold : C.line}`, boxShadow: i === 0 ? `0 0 22px rgba(168,106,18,.14), ${card.boxShadow}` : card.boxShadow }}>
                  <div style={{ ...T.label, color: i === 0 ? C.gold : C.muted, marginBottom: 6 }}>{kk.role}</div>
                  <div style={{ fontSize: 15.5, display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 4, background: PLANET_COLOR[kk.planet], boxShadow: `0 0 6px ${PLANET_COLOR[kk.planet]}55`, flexShrink: 0 }} />
                    {kk.planet}
                    <span style={{ color: C.muted, fontSize: 12.5, fontVariantNumeric: "tabular-nums" }}>{fmtDeg(kk.deg)} {SIGNS[kk.sign].split(" ")[0]}</span>
                  </div>
                  <div style={{ color: C.muted, fontSize: 12, marginTop: 5 }}>{kk.meaning}</div>
                </div>
              ))}
            </div>

            {/* shadbala */}
            <Eyebrow id="shadbala" deva="षड्बल" en="Shadbala · six-fold strength" />
            <div style={{ ...card, padding: "12px 16px", marginBottom: 12, background: "#FBF5E7" }}>
              <p style={{ margin: 0, fontSize: 13.5, color: C.ivory, lineHeight: 1.55 }}>
                {lang === "hi"
                  ? <>षड्बल मापता है कि हर ग्रह अपने फल देने में कितना बलवान है। यहाँ सबसे बलवान <strong style={{ color: C.gold }}>{PLANET_DEVA[r.shadbala.ranked[0]]}</strong> है — इसके कारकत्व अपेक्षाकृत सहजता से फलित होते हैं; सबसे निर्बल <strong style={{ color: C.sindoor }}>{PLANET_DEVA[r.shadbala.ranked[6]]}</strong> है — इसके कारकत्व अधिक प्रयास माँग सकते हैं।</>
                  : <>Shadbala measures how much strength each planet has to deliver its results. Here <strong style={{ color: C.gold }}>{r.shadbala.ranked[0]}</strong> is strongest — its matters tend to come with more ease; <strong style={{ color: C.sindoor }}>{r.shadbala.ranked[6]}</strong> is weakest — its matters may take more effort.</>}
              </p>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 12 }}>
              {BALA_PARTS.map((b) => (
                <span key={b.k} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11.5, color: C.muted }}>
                  <span style={{ width: 10, height: 10, borderRadius: 3, background: b.color }} />
                  {b.label} <span style={{ opacity: 0.7 }}>({b.note})</span>
                </span>
              ))}
            </div>
            {(() => {
              const maxR = Math.max(...SEVEN.map((p) => r.shadbala.perPlanet[p].totalR));
              return (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 12 }}>
                  {r.shadbala.ranked.map((p, rank) => {
                    const x = r.shadbala.perPlanet[p];
                    const strong = x.ratio >= 1;
                    return (
                      <div key={p} className="rise" style={{ ...card, padding: "14px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                          <span style={{ width: 9, height: 9, borderRadius: 5, background: PLANET_COLOR[p], flexShrink: 0 }} />
                          <span style={{ fontFamily: "Eczar, serif", fontSize: 16, color: C.ivory }}>{PLANET_DEVA[p]} <span style={{ fontFamily: "Spectral, serif", fontSize: 14 }}>{p}</span></span>
                          <span style={{ marginLeft: "auto", fontSize: 11, color: C.muted }}>#{rank + 1}</span>
                          <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase", padding: "3px 8px", borderRadius: 10, color: strong ? "#3F7E2E" : C.sindoor, background: strong ? "rgba(63,126,46,.1)" : "rgba(194,69,30,.08)" }}>{strong ? "strong" : "weak"}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 10 }}>
                          <span style={{ fontFamily: "Eczar, serif", fontSize: 26, color: C.gold, lineHeight: 1 }}>{x.totalR.toFixed(2)}</span>
                          <span style={{ fontSize: 11.5, color: C.muted }}>Rupas · needs {x.required} · {(x.ratio * 100).toFixed(0)}%</span>
                        </div>
                        <div style={{ display: "flex", height: 10, borderRadius: 5, overflow: "hidden", background: "#F1E9D5", marginBottom: 8 }}>
                          {BALA_PARTS.map((b) => {
                            const w = Math.max(0, x[b.k]) / 60 / maxR * 100;
                            return w > 0 ? <span key={b.k} title={`${b.label}: ${(x[b.k] / 60).toFixed(2)}`} style={{ width: `${w}%`, background: b.color }} /> : null;
                          })}
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "3px 10px", fontSize: 11 }}>
                          {BALA_PARTS.map((b) => (
                            <span key={b.k} style={{ color: C.muted, display: "flex", justifyContent: "space-between" }}>
                              <span style={{ color: b.color }}>{b.label}</span>
                              <span style={{ fontVariantNumeric: "tabular-nums", color: x[b.k] < 0 ? C.sindoor : C.ivory }}>{(x[b.k] / 60).toFixed(2)}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
            <p style={{ color: C.muted, fontSize: 11.5, margin: "12px 0 0", lineHeight: 1.5 }}>
              Strength in Rupas (1 Rupa = 60 Virupas). A planet clearing its required minimum is well-placed to deliver its significations. Strongest: <span style={{ color: C.gold }}>{r.shadbala.ranked[0]}</span> · weakest: <span style={{ color: C.sindoor }}>{r.shadbala.ranked[6]}</span>. Cheshta and some Kala sub-balas are modelled and may differ slightly from other software.
            </p>

            {/* special lagnas & points */}
            <Eyebrow id="special" deva="विशेष लग्न व बिन्दु" en="Special lagnas & sensitive points" />
            {(() => {
              const SP = r.special;
              const hOf = (L) => ((Math.floor(L / 30) - r.ascSign + 12) % 12) + 1;
              const Tile = ({ item, accent }) => (
                <div style={{ ...card, padding: "12px 14px", borderLeft: `3px solid ${accent}` }}>
                  <div style={{ ...T.label, color: C.muted, marginBottom: 5 }}>{item.k}</div>
                  <div style={{ fontFamily: "Eczar, serif", fontSize: 15.5, color: C.ivory, display: "flex", alignItems: "baseline", gap: 7, flexWrap: "wrap" }}>
                    {SIGNS[Math.floor(item.v / 30)].split(" ")[0]} <span style={{ fontSize: 12.5, color: C.muted, fontVariantNumeric: "tabular-nums" }}>{fmtDeg(item.v % 30)}</span>
                    <span style={{ fontSize: 11, color: C.gold }}>H{hOf(item.v)}</span>
                    {item.pl && <span style={{ fontSize: 12, color: PLANET_COLOR[item.pl] }}>· {item.pl}</span>}
                  </div>
                  <div style={{ color: C.muted, fontSize: 11.5, marginTop: 4 }}>{item.note}</div>
                </div>
              );
              const Group = ({ title, items, accent }) => (
                <>
                  <div style={{ ...T.label, color: accent, margin: "16px 0 8px", fontWeight: 600 }}>{title}</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 10 }}>
                    {items.map((it) => <Tile key={it.k} item={it} accent={accent} />)}
                  </div>
                </>
              );
              return (
                <div>
                  <Group title="Special Lagnas" items={SP.lagnas} accent={C.gold} />
                  <Group title="Sensitive Points" items={SP.points} accent="#6E5C82" />
                  <div style={{ ...card, padding: "12px 14px", marginTop: 10, borderLeft: `3px solid #2C7D4F`, display: "inline-block" }}>
                    <span style={{ ...T.label, color: C.muted, marginRight: 8 }}>Indu Lagna (wealth)</span>
                    <span style={{ fontFamily: "Eczar, serif", fontSize: 15.5, color: "#2C7D4F" }}>{SIGNS[SP.induSign].split(" ")[0]}</span>
                  </div>
                  <Group title="Upagrahas · shadow sub-planets" items={SP.upagrahas} accent="#C2451E" />
                  <p style={{ color: C.muted, fontSize: 11.5, margin: "12px 0 0", lineHeight: 1.5 }}>
                    Bhava / Hora / Ghati lagnas advance from sunrise (1 sign per 5 / 2.5 / 1 ghatis). Gulika is the lagna rising during Saturn's eighth of the day. Some points (Sree Lagna especially) follow formulas that vary slightly between traditions.
                  </p>
                </div>
              );
            })()}

            {/* bhava chalit + bhava bala */}
            <Eyebrow id="chalit" deva="भाव चलित" en="Bhava Chalit & Bhava Bala" />
            <div className="rise" style={{ ...card, padding: "20px 14px 12px" }}>
              <DiamondChart
                title="Bhava Chalit — planets by true house cusp"
                ascSign={r.ascSign}
                houseOfPlanet={r.rows.map((p) => ({ label: PLANET_GLYPH[p.name], house: r.bhava.chalit[p.name], retro: p.retro }))}
                gold={C.gold} ivory={C.ivory} muted={C.muted} sindoor={C.sindoor}
              />
              {(() => {
                const shifts = r.rows.filter((p) => p.house !== r.bhava.chalit[p.name]);
                return shifts.length ? (
                  <p style={{ textAlign: "center", color: C.muted, fontSize: 12, margin: "4px 0 0", lineHeight: 1.6 }}>
                    Shifted from the rasi chart:{" "}
                    {shifts.map((p, i) => (
                      <span key={p.name}>
                        {i > 0 && ", "}
                        <span style={{ color: C.ivory }}>{p.name}</span> <span style={{ color: C.sindoor }}>H{p.house}→H{r.bhava.chalit[p.name]}</span>
                      </span>
                    ))}
                  </p>
                ) : (
                  <p style={{ textAlign: "center", color: C.muted, fontSize: 12, margin: "4px 0 0" }}>No planets shift house — cusps align closely with the signs.</p>
                );
              })()}
            </div>

            <div style={{ ...T.label, color: C.muted, margin: "18px 0 10px" }}>
              Bhava Bala · house strength (Rupas)
            </div>
            {(() => {
              const maxB = Math.max(...r.bhava.bhavaBala.map((b) => b.total));
              return (
                <div style={{ display: "grid", gap: 8 }}>
                  {r.bhava.bhavaBala.map((b) => {
                    const strong = b.house === r.bhava.strongest, weak = b.house === r.bhava.weakest;
                    return (
                      <div key={b.house} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ width: 30, fontFamily: "Eczar, serif", fontSize: 14, color: strong ? C.gold : weak ? C.sindoor : C.ivory, flexShrink: 0 }}>H{b.house}</span>
                        <span style={{ width: 54, fontSize: 11, color: C.muted, flexShrink: 0 }}>{SIGN_SHORT[b.sign]} · <span style={{ color: PLANET_COLOR[b.lord] }}>{PLANET_GLYPH[b.lord]}</span></span>
                        <div style={{ flex: 1, height: 14, background: "#F1E9D5", borderRadius: 7, overflow: "hidden" }}>
                          <div style={{ width: `${Math.max(4, b.total / maxB * 100)}%`, height: "100%", background: strong ? `linear-gradient(90deg, #E0A43B, #A86A12)` : weak ? "#C2451E" : "#B89A55", borderRadius: 7 }} />
                        </div>
                        <span style={{ width: 38, textAlign: "right", fontSize: 12.5, fontVariantNumeric: "tabular-nums", color: strong ? C.gold : C.ivory, flexShrink: 0 }}>{b.total.toFixed(1)}</span>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
            <p style={{ color: C.muted, fontSize: 11.5, margin: "12px 0 0", lineHeight: 1.5 }}>
              Cusps use the Sripati method (Lagna and Midheaven as 1st & 10th bhava-madhya, intermediate cusps trisected). Bhava Bala is led by each house lord's Shadbala, adjusted for the bhava's directional fitness and the aspects it receives. Strongest house: <span style={{ color: C.gold }}>H{r.bhava.strongest}</span> · weakest: <span style={{ color: C.sindoor }}>H{r.bhava.weakest}</span>.
            </p>

            {/* ashtakavarga */}
            <Eyebrow id="av" deva="अष्टकवर्ग" en="Ashtakavarga" />
            <div className="rise" style={{ ...card, padding: "20px 14px 16px" }}>
              <DiamondChart
                title="Sarvashtakavarga · bindus by house"
                ascSign={r.ascSign}
                houseOfPlanet={Array.from({ length: 12 }, (_, h) => {
                  const v = r.av.sav[(r.ascSign + h) % 12];
                  return { label: String(v), house: h + 1, color: v >= 30 ? "#3F7E2E" : v <= 24 ? "#B25425" : C.ivory };
                })}
                gold={C.gold} ivory={C.ivory} muted={C.muted} sindoor={C.sindoor}
              />
              <p style={{ textAlign: "center", color: C.muted, fontSize: 12, margin: "8px 0 0" }}>
                <span style={{ color: "#3F7E2E" }}>30+</span> strong · 25–29 average · <span style={{ color: "#B25425" }}>≤24</span> needs support · 337 total — transits through high-bindu houses tend to give better results
              </p>
            </div>
            <div className="rise2" style={{ ...card, padding: "8px 18px 12px", overflowX: "auto", marginTop: 12 }}>
              <table style={{ minWidth: 560 }}>
                <thead>
                  <tr><th>Graha</th>{SIGN_SHORT.map((sn) => <th key={sn} style={{ textAlign: "center" }}>{sn}</th>)}<th style={{ textAlign: "center" }}>Σ</th></tr>
                </thead>
                <tbody>
                  {["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"].map((p) => (
                    <tr key={p}>
                      <td style={{ whiteSpace: "nowrap" }}>
                        <span style={{ display: "inline-block", width: 7, height: 7, borderRadius: 4, background: PLANET_COLOR[p], marginRight: 8 }} />{PLANET_GLYPH[p]}
                      </td>
                      {r.av.bav[p].map((v, i) => (
                        <td key={i} style={{ textAlign: "center", fontVariantNumeric: "tabular-nums", color: i === r.rows.find((q) => q.name === p).sign ? C.gold : C.ivory, fontWeight: i === r.rows.find((q) => q.name === p).sign ? 600 : 400 }}>{v}</td>
                      ))}
                      <td style={{ textAlign: "center", color: C.muted }}>{r.av.bav[p].reduce((x, y) => x + y, 0)}</td>
                    </tr>
                  ))}
                  <tr>
                    <td style={{ color: C.gold, fontWeight: 600 }}>SAV</td>
                    {r.av.sav.map((v, i) => <td key={i} style={{ textAlign: "center", color: C.gold, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{v}</td>)}
                    <td style={{ textAlign: "center", color: C.gold, fontWeight: 600 }}>337</td>
                  </tr>
                </tbody>
              </table>
              <p style={{ color: C.muted, fontSize: 12, margin: "10px 0 4px" }}>Gold cell marks each graha's own sign. Bhinnashtakavarga rows show every planet's bindus per sign.</p>
            </div>

            {/* arudha padas */}
            <Eyebrow id="arudha" deva="आरूढ पद" en="Arudha padas" />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
              {r.arudhas.map((a, i) => {
                const ARUDHA_MEAN = ["perceived image & status", "wealth & speech", "siblings & courage", "home & comforts", "children & creativity", "service & conflicts", "partnerships", "longevity & change", "dharma & fortune", "career & status", "gains & networks", "marriage & spouse"];
                const special = a.h === 1 ? "AL" : a.h === 12 ? "UL" : a.h === 7 ? "A7" : null;
                const hot = a.h === 1 || a.h === 12;
                return (
                  <div key={a.h} className="rise" style={{ ...card, padding: "12px 14px", border: `1px solid ${hot ? C.gold : C.line}` }}>
                    <div style={{ ...T.label, color: hot ? C.gold : C.muted, marginBottom: 5 }}>
                      {a.h === 1 ? "Arudha Lagna" : a.h === 12 ? "Upapada" : `A${a.h}`}{special && a.h !== 1 && a.h !== 12 ? "" : ""}
                    </div>
                    <div style={{ fontFamily: "Eczar, serif", fontSize: 16, color: hot ? C.gold : C.ivory }}>{SIGNS[a.sign].split(" ")[0]}</div>
                    <div style={{ color: C.muted, fontSize: 11.5, marginTop: 4 }}>{ARUDHA_MEAN[i]}</div>
                  </div>
                );
              })}
            </div>

            {/* dasha */}
            <Eyebrow id="rectify" deva="जन्म समय शोधन" en="Birth-time rectification" />
            <RectifyModule form={form} place={place} ayanamsa={ayanamsa} C={C} card={card} />

            <Eyebrow id="bnn" deva="भृगु नन्दी नाडी" en="Bhrigu Nandi Nadi · lagneless" />
            <BNNModule bnn={r.bnn} rows={r.rows} tz={r.tz} C={C} card={card} />

            <Eyebrow id="bhrigu" deva="भृगु चक्र · सरल पद्धति" en="Bhrigu Chakra & Saral Paddhati" />
            <BhriguModule rows={r.rows} ascSign={r.ascSign} birthMs={r.birthMs} tz={r.tz} C={C} card={card} />

            <Eyebrow id="dasha" deva="विंशोत्तरी दशा" en="Vimshottari dasha · maha to prana" />
            <div className="rise" style={{ ...card, padding: "8px 18px 16px", overflowX: "auto" }}>
              <table>
                <thead><tr><th>Lord</th><th>From</th><th>To</th><th>Years</th></tr></thead>
                <tbody>
                  {r.dashas.map((dsh) => {
                    const isNow = r.current && dsh.lord === r.current.lord && dsh.start === r.current.start;
                    return (
                      <tr key={dsh.start} style={isNow ? { background: "rgba(168,106,18,.08)" } : null}>
                        <td style={{ color: isNow ? C.gold : C.ivory, fontWeight: isNow ? 600 : 400 }}>
                          {dsh.lord}{isNow && " · current"}
                        </td>
                        <td>{fmtDateT(dsh.start, r.tz, false)}</td>
                        <td>{fmtDateT(dsh.end, r.tz, false)}</td>
                        <td style={{ fontVariantNumeric: "tabular-nums" }}>{dsh.balance.toFixed(1)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {r.current && (
                <>
                  {(() => {
                    const pct = Math.min(100, Math.max(0, ((Date.now() - r.current.start) / (r.current.end - r.current.start)) * 100));
                    return (
                      <div style={{ margin: "16px 2px 4px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, color: C.muted, letterSpacing: ".14em", textTransform: "uppercase", marginBottom: 7 }}>
                          <span>{r.current.lord} mahadasha</span>
                          <span style={{ color: C.gold }}>{pct.toFixed(0)}% elapsed</span>
                        </div>
                        <div style={{ height: 6, background: "#F1E9D5", borderRadius: 3, overflow: "hidden", border: `1px solid ${C.line}` }}>
                          <div style={{ width: `${pct}%`, height: "100%", background: `linear-gradient(90deg, ${C.gold}, #7E520C)`, borderRadius: 3 }} />
                        </div>
                      </div>
                    );
                  })()}
                  <p style={{ fontSize: 14, lineHeight: 1.6, color: C.ivory, margin: "16px 0 10px" }}>
                    The native runs <span style={{ color: C.gold }}>{r.current.lord} mahadasha</span> — a period
                    classically associated with {DASHA_NOTE[r.current.lord]}.
                  </p>
                  {r.curAntar && (
                    <div style={{ margin: "18px 0 6px", padding: "13px 14px", borderRadius: 10, background: "rgba(168,106,18,.05)", border: `1px solid ${C.line}` }}>
                      <div style={{ ...T.label, color: C.muted, marginBottom: 9 }}>Running now · all five levels</div>
                      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "4px 6px" }}>
                        {[["Maha", r.current.lord], ["Antar", r.curAntar.lord], ["Pratyantar", r.curPratya && r.curPratya.lord], ["Sookshma", r.curSookshma && r.curSookshma.lord], ["Prana", r.curPrana && r.curPrana.lord]].map(([lvl, lord], i) =>
                          lord ? (
                            <React.Fragment key={lvl}>
                              {i > 0 && <span style={{ color: C.line, fontSize: 13 }}>›</span>}
                              <span style={{ display: "inline-flex", flexDirection: "column", lineHeight: 1.25 }}>
                                <span style={{ fontSize: 9, letterSpacing: ".1em", textTransform: "uppercase", color: C.muted }}>{lvl}</span>
                                <span style={{ fontFamily: "Eczar, serif", fontSize: 15, color: C.gold }}>{lord}</span>
                              </span>
                            </React.Fragment>
                          ) : null
                        )}
                      </div>
                      {r.curPrana && (
                        <div style={{ fontSize: 11.5, color: C.muted, marginTop: 9 }}>
                          Current prana: {r.curPrana.lord} · {fmtDateT(r.curPrana.start, r.tz, true)} – {fmtDateT(r.curPrana.end, r.tz, true)}
                        </div>
                      )}
                    </div>
                  )}
                  <div style={{ ...T.label, color: C.muted, margin: "16px 0 4px" }}>
                    Antardashas within {r.current.lord} — tap any period to drill down
                  </div>
                  <DashaTree periods={r.antars} level={0} now={Date.now()} openD={openD} toggle={toggleD} C={C} tz={r.tz} />
                </>
              )}
            </div>

            {/* panchang */}
            <Eyebrow deva="पञ्चाङ्ग" en="Birth panchang" />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
              {[
                ["Vara", r.panchang.weekday],
                ["Tithi", `${r.panchang.paksha} ${r.panchang.tithiName}`],
                ["Nakshatra", r.panchang.nak],
                ["Yoga", r.panchang.yoga],
                ["Karana", r.panchang.karana],
              ].map(([k, v]) => (
                <div key={k} style={{ ...card, padding: "14px 16px" }}>
                  <div style={{ ...T.label, color: C.muted, marginBottom: 6 }}>{k}</div>
                  <div style={{ fontSize: 15 }}>{v}</div>
                </div>
              ))}
            </div>

            {/* reading */}
            <Eyebrow id="reading" deva="फलादेश" en="A short reading" />
            <div className="rise" style={{ ...card, padding: "22px 24px", fontSize: 15.5, lineHeight: 1.75 }}>
              <p style={{ margin: "0 0 14px" }}>
                <span style={{ color: C.gold, fontFamily: "Eczar, serif" }}>Lagna · </span>
                With <strong>{SIGNS[r.ascSign]}</strong> rising, the outer temperament carries {SIGN_NOTE[r.ascSign]}.
              </p>
              <p style={{ margin: "0 0 14px" }}>
                <span style={{ color: C.gold, fontFamily: "Eczar, serif" }}>Chandra · </span>
                The Moon in <strong>{SIGNS[r.moon.sign]}</strong>, under <strong>{NAKSHATRAS[r.moon.nak]}</strong> nakshatra
                (pada {r.moon.pada}), shapes the inner life: {NAK_NOTE[r.moon.nak]}
              </p>
              <p style={{ margin: 0, color: C.muted, fontSize: 13 }}>
                Offered in the spirit of the tradition, for reflection and curiosity — not as a substitute for your own judgment or a qualified jyotishi's reading.
              </p>
            </div>
          </>
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
