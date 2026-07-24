/* Chart screen — birth form, vault, matching, and full chart results.
   Extracted from kundli-app.tsx (SHELL-FINISH-48H). Pure move. */

import React, { useState, useEffect } from "react";
import { T } from "../components/tokens";
import { fmtDeg, fmtDateT } from "../components/format";
import { searchOffline, searchOnline } from "../data/places";
import MatchMaker from "./MatchingScreen";
import DiamondChart from "../components/DiamondChart";
import { VARGAS, SPECIAL_CHARTS, SIGN_SHORT, PLANET_GLYPH } from "../data/chart-divisions";
import { vargaSign } from "../engine/varga";
import { SEVEN } from "../engine/classical";
import { BALA_PARTS } from "../engine/shadbala";
import { KP_PLANETS, vimSub } from "../engine/dasha";
import { computeKundli } from "../engine/kundli";
import { DashaTree } from "../components/DashaTree";
import { ChartVault } from "../components/ChartVault";
import { JyotishPanelNav } from "../components/JyotishPanelNav";
import { BNNModule, BhriguModule } from "./JyotishBnnScreen";
import { RectifyModule } from "./RectifyScreen";
import { SIGNS, NAKSHATRAS, AYANAMSA, zoneOffset, PLANET_DEVA } from "../engine/panchang";

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

export default function ChartScreen({ C, card, lang }) {
  const hi = lang === "hi";
  const [form, setForm] = useState({ name: "", date: "1995-08-15", time: "06:30" });
  const [place, setPlace] = useState({ label: "New Delhi, India", lat: 28.61, lon: 77.21, zone: "Asia/Kolkata" });
  const [query, setQuery] = useState("New Delhi, India");
  const [sugs, setSugs] = useState([]);
  const [searching, setSearching] = useState(false);
  const [tzOverride, setTzOverride] = useState("");
  const [result, setResult] = useState(null);
  const [chartContext, setChartContext] = useState(null);
  const [varga, setVarga] = useState("D1");
  const [refPt, setRefPt] = useState("lagna");
  const [ayanamsa, setAyanamsa] = useState("lahiri");
  const [err, setErr] = useState("");

  // Vimshottari drill-down: which sub-periods are expanded (keys "level:startMs").
  // Auto-opens the running antar/pratyantar/sookshma chain on each new cast.
  const [openD, setOpenD] = useState(() => new Set());
  // Language and screen survive a reload via the URL (?lang=hi&screen=prashna) —
  // browser storage is banned in this project, but the address bar is not storage.
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
      setChartContext({ form: { ...c.form }, place: { ...c.place }, ayanamsa: c.ayanamsa || "lahiri" });
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
    setChartContext({ form: { ...form }, place: { ...effPlace }, ayanamsa });
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
      <span style={{ fontFamily: T.serif, color: C.gold, fontSize: T.fHeading }}>{lang === "hi" ? deva : en}</span>
    </div>
  );

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
    refPt === "surya" ? (hi ? "सूर्य से भावों की गणना — सूर्य कुंडली" : "houses counted from the Sun — Surya kundli") :
    refPt === "chandra" ? (hi ? "चन्द्र से भावों की गणना — चन्द्र कुंडली" : "houses counted from the Moon — Chandra kundli") :
    refPt === "karakamsa" ? (hi ? `${r.ak} के नवांश से भावों की गणना — कारकांश` : `houses counted from ${r.ak}'s navamsa sign — Karakamsa`) : "";
  const vPlanets = r
    ? r.rows.map((p) => {
        const vs = vargaSign(p.lon, varga);
        return { label: PLANET_GLYPH[p.name], house: ((vs - vAscSign + 12) % 12) + 1, retro: p.retro, deg: p.deg };
      })
    : [];


  return (
    <>
      {r && (
          <JyotishPanelNav lang={lang} C={C} />
      )}
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

        <div id="vault" style={{ scrollMarginTop: 72 }}>
          <ChartVault snapshot={{ form, place, tzOverride, ayanamsa }} result={result} onLoad={loadChart} C={C} card={card} lang={lang} />
        </div>

        {/* kundali matching */}
        <Eyebrow id="match" deva="कुण्डली मिलान" en="Kundali matching · Guna Milan" />
        <MatchMaker C={C} card={card} computeKundli={computeKundli} lang={lang} />
          </>

      {r && (
          <>
            {/* identity strip */}
            <Eyebrow id="summary" deva="जन्म विवरण" en="Birth summary" />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
              {[
                [hi ? "लग्न" : "Lagna (Ascendant)", `${SIGNS[r.ascSign].split(" ")[0]} ${fmtDeg(r.ascDeg)}`],
                [hi ? "राशि (चन्द्र राशि)" : "Rashi (Moon sign)", SIGNS[r.moon.sign].split(" ")[0]],
                [hi ? "जन्म नक्षत्र" : "Janma Nakshatra", `${NAKSHATRAS[r.moon.nak]} · ${hi ? "पाद" : "pada"} ${r.moon.pada}`],
                [hi ? "सूर्य राशि" : "Surya (Sun sign)", SIGNS[r.sun.sign].split(" ")[0]],
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
                <div style={{ ...T.label, color: C.muted, marginBottom: 7, textAlign: "center" }}>{hi ? "भावों की गणना यहाँ से" : "Houses counted from"}</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 4, background: "#F4ECD9", border: `1px solid ${C.line}`, borderRadius: 12, padding: 4 }}>
                  {REFS.map((rf) => (
                    <button key={rf.k} onClick={() => setRefPt(rf.k)}
                      style={{ padding: "8px 4px", borderRadius: 9, cursor: "pointer", fontFamily: "Spectral, serif", fontSize: 12.5, lineHeight: 1.25, border: rf.k === refPt ? `1px solid ${C.gold}55` : "1px solid transparent", background: rf.k === refPt ? "#FFFFFF" : "transparent", color: rf.k === refPt ? C.gold : C.muted, boxShadow: rf.k === refPt ? "0 2px 8px rgba(110,82,24,.12)" : "none", fontWeight: rf.k === refPt ? 600 : 400 }}>
                      <span style={{ fontFamily: "Eczar, serif", display: "block", fontSize: 13 }}>{rf.deva}</span>
                      {hi ? rf.deva : rf.en}
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
                  <button key={v.k} className="chip" title={hi ? `${v.k} विभागीय कुंडली` : `${v.name} — ${v.theme}`}
                    onClick={(e) => { setVarga(v.k); try { e.currentTarget.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" }); } catch {} }}
                    style={{ flexShrink: 0, padding: "7px 14px", borderRadius: 18, cursor: "pointer", fontFamily: "Spectral, serif", fontSize: 13, letterSpacing: ".03em", border: `1px solid ${v.k === varga ? C.gold : C.line}`, background: v.k === varga ? "rgba(168,106,18,.12)" : "#FFFFFF", color: v.k === varga ? C.gold : C.muted, fontWeight: v.k === varga ? 600 : 400 }}>
                    {v.k}
                  </button>
                ))}
              </div>
              <p style={{ textAlign: "center", color: C.gold, fontSize: 13, margin: "8px 0 2px", fontFamily: "Eczar, serif", letterSpacing: ".04em" }}>
                {hi ? `${curVarga.k} विभागीय कुंडली — जीवन के इस क्षेत्र का सूक्ष्म अध्ययन` : `${curVarga.name} — ${curVarga.theme}`}
              </p>
              {refNote && <p style={{ textAlign: "center", color: C.muted, fontSize: 12, margin: "2px 0 10px" }}>{refNote}</p>}
              {!refNote && <div style={{ height: 10 }} />}
              <DiamondChart
                key={varga + refPt}
                title={form.name ? `${form.name} · ${(place && place.label) || ""}` : (place && place.label) || (hi ? "जन्म कुंडली" : "Birth chart")}
                ascSign={vAscSign}
                houseOfPlanet={vPlanets}
                showDeg={varga === "D1"}
                lagnaLabel={refPt === "lagna" ? "LAGNA" : refPt === "surya" ? "SURYA" : refPt === "chandra" ? "CHANDRA" : "KARAKAMSA"}
                gold={C.gold} ivory={C.ivory} muted={C.muted} sindoor={C.sindoor}
              />
              <p style={{ textAlign: "center", color: C.muted, fontSize: 12, margin: "8px 0 0" }}>
                {hi ? "हर भाव की संख्या उसकी राशि दिखाती है" : "Numbers mark the rashi in each house"} · <span style={{ color: C.sindoor }}>℞</span> {hi ? "वक्री" : "retrograde"}
                {varga === "D2" && (hi ? " · होरा कुंडली में केवल कर्क (चन्द्र) और सिंह (सूर्य) राशियाँ होती हैं" : " · the Hora chart uses only Cancer (Moon) and Leo (Sun)")}
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
                      <span style={{ fontSize: 9.5, letterSpacing: ".12em", textTransform: "uppercase", color: C.muted, whiteSpace: "nowrap" }}>{yg.kind === "good" ? (hi ? "शुभ" : "auspicious") : (hi ? "चुनौतीपूर्ण" : "challenging")}</span>
                    </div>
                    <div style={{ fontSize: 13.5, lineHeight: 1.55 }}>{hi ? "यह योग ग्रहों और भावों के एक विशेष संबंध से बनता है। इसका फल ग्रहबल, दशा और पूरी कुंडली के संदर्भ में देखें।" : yg.text}</div>
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
                {hi ? "अयनांश (लाहिरी)" : "Ayanamsa (Lahiri)"}: <span style={{ color: C.ivory, fontVariantNumeric: "tabular-nums" }}>{fmtDeg(r.ayan)}</span> · {hi ? "वक्री ग्रह" : "Retrograde"} ℞ <span style={{ color: C.sindoor }}>{hi ? "सिंदूरी रंग में" : "shown in vermillion"}</span>
              </div>
            </div>

            {/* KP sub-lords */}
            <Eyebrow id="kp" deva="के॰पी॰ उपस्वामी" en="KP sub-lords (Krishnamurti Paddhati)" />
            <div className="rise" style={{ ...card, padding: "8px 4px", overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 360 }}>
                <thead>
                  <tr style={{ color: C.muted, textAlign: "left", fontSize: 11, letterSpacing: ".05em", textTransform: "uppercase" }}>
                    <th style={{ padding: "6px 10px" }}>{hi ? "ग्रह" : "Graha"}</th>
                    <th style={{ padding: "6px 10px" }}>{hi ? "राशि" : "Sign"}</th>
                    <th style={{ padding: "6px 10px" }}>{hi ? "नक्षत्र" : "Nakshatra"}</th>
                    <th style={{ padding: "6px 10px" }}>{hi ? "नक्षत्र स्वामी" : "Star lord"}</th>
                    <th style={{ padding: "6px 10px" }}>{hi ? "उप-स्वामी" : "Sub lord"}</th>
                    <th style={{ padding: "6px 10px" }}>{hi ? "उप-उप स्वामी" : "Sub-sub"}</th>
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
              {hi ? <>हर नक्षत्र (13°20′) को विंशोत्तरी अनुपात के नौ उप-भागों में बाँटा जाता है। KP में <span style={{ color: C.gold }}>उप-स्वामी</span> निर्णायक माना जाता है। {ayanamsa === "lahiri" ? "मानक KP उप-स्वामी देखने के लिए ऊपर कृष्णमूर्ति अयनांश चुनें।" : "गणना कृष्णमूर्ति अयनांश पर है।"}</> : <>Each nakshatra (13°20′) is split into nine Vimshottari-proportioned <em>subs</em>, starting from the star lord — the 249-division scheme. The <span style={{ color: C.gold }}>sub lord</span> is the deciding factor in KP. {ayanamsa === "lahiri" ? "You're on Lahiri ayanamsa; switch to KP (Krishnamurti) above for the canonical KP sub-lords." : "Computed on the KP (Krishnamurti) ayanamsa."}</>}
            </p>

            <div style={{ ...T.label, color: C.muted, margin: "18px 0 8px" }}>
              {hi ? "भाव-संधि उप-स्वामी" : "Cuspal sub-lords"} · {r.kpData.houseSystem}
            </div>
            <div className="rise" style={{ ...card, padding: "8px 4px", overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 360 }}>
                <thead>
                  <tr style={{ color: C.muted, textAlign: "left", fontSize: 11, letterSpacing: ".05em", textTransform: "uppercase" }}>
                    <th style={{ padding: "6px 10px" }}>{hi ? "भाव" : "Bhava"}</th>
                    <th style={{ padding: "6px 10px" }}>{hi ? "संधि" : "Cusp"}</th>
                    <th style={{ padding: "6px 10px" }}>{hi ? "नक्षत्र" : "Nakshatra"}</th>
                    <th style={{ padding: "6px 10px" }}>{hi ? "नक्षत्र स्वामी" : "Star"}</th>
                    <th style={{ padding: "6px 10px" }}>{hi ? "उप-स्वामी" : "Sub"}</th>
                    <th style={{ padding: "6px 10px" }}>{hi ? "उप-उप" : "Sub-sub"}</th>
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
              {hi ? <>भाव-संधियाँ {r.kpData.houseSystem === "Placidus" ? "KP के मानक प्लासिडस भाव-पद्धति" : "इस अक्षांश के लिए पॉर्फ़िरी विकल्प"} से निकली हैं। <span style={{ color: C.gold }}>भाव-संधि उप-स्वामी</span> बताता है कि उस भाव के विषय फलित होने की क्षमता रखते हैं। {ayanamsa === "lahiri" ? "मानक KP फल हेतु ऊपर कृष्णमूर्ति अयनांश चुनें।" : ""}</> : <>Cusps use {r.kpData.houseSystem === "Placidus" ? "the Placidus system (semi-arcs trisected in time) — the KP standard" : "a Porphyry fallback because Placidus is undefined at this latitude"}. The <span style={{ color: C.gold }}>cuspal sub-lord</span> is the cornerstone of KP analysis — it signifies whether the matters of that house will fructify. {ayanamsa === "lahiri" ? "Switch to KP ayanamsa above for canonical KP cusps." : ""}</>}
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
                    <div style={{ ...T.label, color: C.gold, marginBottom: 8 }}>{hi ? "शासक ग्रह · जन्म क्षण" : "Ruling Planets · birth moment"}</div>
                    <div style={{ display: "flex", flexWrap: "wrap", rowGap: 4 }}>
                      <RPItem label={hi ? "लग्न स्वामी" : "Asc lord"} pl={RP.ascSignLord} />
                      <RPItem label={hi ? "लग्न नक्षत्र" : "Asc star"} pl={RP.ascStarLord} />
                      <RPItem label={hi ? "लग्न उप" : "Asc sub"} pl={RP.ascSubLord} />
                      <RPItem label={hi ? "चन्द्र स्वामी" : "Moon lord"} pl={RP.moonSignLord} />
                      <RPItem label={hi ? "चन्द्र नक्षत्र" : "Moon star"} pl={RP.moonStarLord} />
                      <RPItem label={hi ? "चन्द्र उप" : "Moon sub"} pl={RP.moonSubLord} />
                      <RPItem label={hi ? "वार स्वामी" : "Day lord"} pl={RP.dayLord} />
                    </div>
                  </div>

                  <div style={{ ...T.label, color: C.muted, margin: "4px 0 8px" }}>
                    {hi ? "भाव सूचक (सबसे प्रबल पहले)" : "House significators (strongest first)"}
                  </div>
                  <div className="rise" style={{ ...card, padding: "8px 4px", overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 380 }}>
                      <thead>
                        <tr style={{ color: C.muted, textAlign: "left", fontSize: 11, letterSpacing: ".05em", textTransform: "uppercase" }}>
                          <th style={{ padding: "6px 10px" }}>{hi ? "भाव" : "Bhava"}</th>
                          <th style={{ padding: "6px 10px" }}>{hi ? "स्थित ग्रह" : "Occupants"}</th>
                          <th style={{ padding: "6px 10px" }}>{hi ? "स्वामी" : "Owner"}</th>
                          <th style={{ padding: "6px 10px" }}>{hi ? "सूचक ग्रह" : "Significators"}</th>
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
                    {hi ? "हर ग्रह द्वारा सूचित भाव" : "Houses signified by each planet"}
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
                    {hi ? <>ग्रह जिन भावों का सूचक है, अपनी दशा-भुक्ति में उनके विषय सक्रिय कर सकता है—विशेषतः जब वह शासक ग्रह भी हो। राहु-केतु अपने नक्षत्र और राशि स्वामियों के प्रतिनिधि की तरह भी फल देते हैं। {ayanamsa === "lahiri" ? "मानक KP सूचक हेतु कृष्णमूर्ति अयनांश चुनें।" : "गणना KP अयनांश पर है।"}</> : <>A planet promises the matters of every house it signifies; during its dasha/bhukti — especially when it is also a Ruling Planet — those houses fructify. Rahu and Ketu also act as agents of their star and sign lords (apply that nuance when judging the nodes). {ayanamsa === "lahiri" ? "Switch to KP ayanamsa above for canonical KP significators." : "Computed on the KP ayanamsa."}</>}
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
                  <div style={{ color: C.muted, fontSize: 12, marginTop: 5 }}>{hi ? "यह चर कारक जीवन के इस प्रमुख विषय और उससे जुड़ी सीख को दर्शाता है।" : kk.meaning}</div>
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
                  {hi ? ({ sthana: "स्थान", dig: "दिग्", kala: "काल", cheshta: "चेष्टा", naisargika: "नैसर्गिक", drik: "दृक्" }[b.k] || b.label) : b.label} <span style={{ opacity: 0.7 }}>({hi ? ({ sthana: "स्थिति", dig: "दिशा", kala: "समय", cheshta: "गति", naisargika: "प्राकृतिक", drik: "दृष्टि" }[b.k] || b.note) : b.note})</span>
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
                          <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase", padding: "3px 8px", borderRadius: 10, color: strong ? "#3F7E2E" : C.sindoor, background: strong ? "rgba(63,126,46,.1)" : "rgba(194,69,30,.08)" }}>{strong ? (hi ? "प्रबल" : "strong") : (hi ? "निर्बल" : "weak")}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 10 }}>
                          <span style={{ fontFamily: "Eczar, serif", fontSize: 26, color: C.gold, lineHeight: 1 }}>{x.totalR.toFixed(2)}</span>
                          <span style={{ fontSize: 11.5, color: C.muted }}>{hi ? "रूप · अपेक्षित" : "Rupas · needs"} {x.required} · {(x.ratio * 100).toFixed(0)}%</span>
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
              {hi ? <>बल रूप में है (1 रूप = 60 विरूप)। अपेक्षित न्यूनतम से ऊपर का ग्रह अपने कारकत्व देने में अधिक समर्थ माना जाता है। सबसे प्रबल: <span style={{ color: C.gold }}>{PLANET_DEVA[r.shadbala.ranked[0]]}</span> · सबसे निर्बल: <span style={{ color: C.sindoor }}>{PLANET_DEVA[r.shadbala.ranked[6]]}</span>। चेष्टा और कुछ काल उप-बल अन्य सॉफ़्टवेयर से थोड़ा भिन्न हो सकते हैं।</> : <>Strength in Rupas (1 Rupa = 60 Virupas). A planet clearing its required minimum is well-placed to deliver its significations. Strongest: <span style={{ color: C.gold }}>{r.shadbala.ranked[0]}</span> · weakest: <span style={{ color: C.sindoor }}>{r.shadbala.ranked[6]}</span>. Cheshta and some Kala sub-balas are modelled and may differ slightly from other software.</>}
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
                  <div style={{ color: C.muted, fontSize: 11.5, marginTop: 4 }}>{hi ? "यह विशेष बिंदु कुंडली के एक सूक्ष्म जीवन-विषय को दर्शाता है।" : item.note}</div>
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
                  <Group title={hi ? "विशेष लग्न" : "Special Lagnas"} items={SP.lagnas} accent={C.gold} />
                  <Group title={hi ? "संवेदनशील बिंदु" : "Sensitive Points"} items={SP.points} accent="#6E5C82" />
                  <div style={{ ...card, padding: "12px 14px", marginTop: 10, borderLeft: `3px solid #2C7D4F`, display: "inline-block" }}>
                    <span style={{ ...T.label, color: C.muted, marginRight: 8 }}>{hi ? "इन्दु लग्न (धन)" : "Indu Lagna (wealth)"}</span>
                    <span style={{ fontFamily: "Eczar, serif", fontSize: 15.5, color: "#2C7D4F" }}>{SIGNS[SP.induSign].split(" ")[0]}</span>
                  </div>
                  <Group title={hi ? "उपग्रह · छाया बिंदु" : "Upagrahas · shadow sub-planets"} items={SP.upagrahas} accent="#C2451E" />
                  <p style={{ color: C.muted, fontSize: 11.5, margin: "12px 0 0", lineHeight: 1.5 }}>
                    {hi ? "भाव, होरा और घटी लग्न सूर्योदय से आगे बढ़ते हैं। गुलिक दिन के शनि-शासित आठवें भाग में उदित लग्न है। श्री लग्न जैसे कुछ बिंदुओं के सूत्र परम्पराओं में थोड़ा बदलते हैं।" : "Bhava / Hora / Ghati lagnas advance from sunrise (1 sign per 5 / 2.5 / 1 ghatis). Gulika is the lagna rising during Saturn's eighth of the day. Some points (Sree Lagna especially) follow formulas that vary slightly between traditions."}
                  </p>
                </div>
              );
            })()}

            {/* bhava chalit + bhava bala */}
            <Eyebrow id="chalit" deva="भाव चलित" en="Bhava Chalit & Bhava Bala" />
            <div className="rise" style={{ ...card, padding: "20px 14px 12px" }}>
              <DiamondChart
                title={hi ? "भाव चलित — वास्तविक भाव-संधि के अनुसार ग्रह" : "Bhava Chalit — planets by true house cusp"}
                ascSign={r.ascSign}
                houseOfPlanet={r.rows.map((p) => ({ label: PLANET_GLYPH[p.name], house: r.bhava.chalit[p.name], retro: p.retro }))}
                gold={C.gold} ivory={C.ivory} muted={C.muted} sindoor={C.sindoor}
              />
              {(() => {
                const shifts = r.rows.filter((p) => p.house !== r.bhava.chalit[p.name]);
                return shifts.length ? (
                  <p style={{ textAlign: "center", color: C.muted, fontSize: 12, margin: "4px 0 0", lineHeight: 1.6 }}>
                    {hi ? "राशि कुंडली से भाव बदला: " : "Shifted from the rasi chart: "}
                    {shifts.map((p, i) => (
                      <span key={p.name}>
                        {i > 0 && ", "}
                        <span style={{ color: C.ivory }}>{p.name}</span> <span style={{ color: C.sindoor }}>H{p.house}→H{r.bhava.chalit[p.name]}</span>
                      </span>
                    ))}
                  </p>
                ) : (
                  <p style={{ textAlign: "center", color: C.muted, fontSize: 12, margin: "4px 0 0" }}>{hi ? "किसी ग्रह का भाव नहीं बदला—भाव-संधियाँ राशियों के निकट हैं।" : "No planets shift house — cusps align closely with the signs."}</p>
                );
              })()}
            </div>

            <div style={{ ...T.label, color: C.muted, margin: "18px 0 10px" }}>
              {hi ? "भाव बल · भावों की शक्ति (रूप)" : "Bhava Bala · house strength (Rupas)"}
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
              {hi ? <>भाव-संधियाँ श्रीपति पद्धति से निकली हैं। भाव बल में भाव-स्वामी का षड्बल, दिशा और प्राप्त दृष्टियाँ शामिल हैं। सबसे प्रबल भाव: <span style={{ color: C.gold }}>H{r.bhava.strongest}</span> · सबसे निर्बल: <span style={{ color: C.sindoor }}>H{r.bhava.weakest}</span>।</> : <>Cusps use the Sripati method (Lagna and Midheaven as 1st & 10th bhava-madhya, intermediate cusps trisected). Bhava Bala is led by each house lord's Shadbala, adjusted for the bhava's directional fitness and the aspects it receives. Strongest house: <span style={{ color: C.gold }}>H{r.bhava.strongest}</span> · weakest: <span style={{ color: C.sindoor }}>H{r.bhava.weakest}</span>.</>}
            </p>

            {/* ashtakavarga */}
            <Eyebrow id="av" deva="अष्टकवर्ग" en="Ashtakavarga" />
            <div className="rise" style={{ ...card, padding: "20px 14px 16px" }}>
              <DiamondChart
                title={hi ? "सर्वाष्टकवर्ग · भाववार बिंदु" : "Sarvashtakavarga · bindus by house"}
                ascSign={r.ascSign}
                houseOfPlanet={Array.from({ length: 12 }, (_, h) => {
                  const v = r.av.sav[(r.ascSign + h) % 12];
                  return { label: String(v), house: h + 1, color: v >= 30 ? "#3F7E2E" : v <= 24 ? "#B25425" : C.ivory };
                })}
                gold={C.gold} ivory={C.ivory} muted={C.muted} sindoor={C.sindoor}
              />
              <p style={{ textAlign: "center", color: C.muted, fontSize: 12, margin: "8px 0 0" }}>
                <span style={{ color: "#3F7E2E" }}>30+</span> {hi ? "प्रबल" : "strong"} · 25–29 {hi ? "औसत" : "average"} · <span style={{ color: "#B25425" }}>≤24</span> {hi ? "सहयोग अपेक्षित · कुल 337 — अधिक बिंदु वाले भावों में गोचर सामान्यतः बेहतर फल देते हैं" : "needs support · 337 total — transits through high-bindu houses tend to give better results"}
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
              <p style={{ color: C.muted, fontSize: 12, margin: "10px 0 4px" }}>{hi ? "सुनहरा खाना ग्रह की अपनी राशि दर्शाता है। भिन्नाष्टकवर्ग की हर पंक्ति राशि अनुसार उस ग्रह के बिंदु दिखाती है।" : "Gold cell marks each graha's own sign. Bhinnashtakavarga rows show every planet's bindus per sign."}</p>
            </div>

            {/* arudha padas */}
            <Eyebrow id="arudha" deva="आरूढ पद" en="Arudha padas" />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
              {r.arudhas.map((a, i) => {
                const ARUDHA_MEAN = hi ? ["दिखाई देने वाली छवि और प्रतिष्ठा", "धन और वाणी", "भाई-बहन और साहस", "घर और सुख", "संतान और सृजन", "सेवा और संघर्ष", "साझेदारी", "आयु और परिवर्तन", "धर्म और भाग्य", "कर्म और प्रतिष्ठा", "लाभ और संबंध-जाल", "विवाह और जीवनसाथी"] : ["perceived image & status", "wealth & speech", "siblings & courage", "home & comforts", "children & creativity", "service & conflicts", "partnerships", "longevity & change", "dharma & fortune", "career & status", "gains & networks", "marriage & spouse"];
                const special = a.h === 1 ? "AL" : a.h === 12 ? "UL" : a.h === 7 ? "A7" : null;
                const hot = a.h === 1 || a.h === 12;
                return (
                  <div key={a.h} className="rise" style={{ ...card, padding: "12px 14px", border: `1px solid ${hot ? C.gold : C.line}` }}>
                    <div style={{ ...T.label, color: hot ? C.gold : C.muted, marginBottom: 5 }}>
                      {a.h === 1 ? (hi ? "आरूढ़ लग्न" : "Arudha Lagna") : a.h === 12 ? (hi ? "उपपद" : "Upapada") : `A${a.h}`}{special && a.h !== 1 && a.h !== 12 ? "" : ""}
                    </div>
                    <div style={{ fontFamily: "Eczar, serif", fontSize: 16, color: hot ? C.gold : C.ivory }}>{SIGNS[a.sign].split(" ")[0]}</div>
                    <div style={{ color: C.muted, fontSize: 11.5, marginTop: 4 }}>{ARUDHA_MEAN[i]}</div>
                  </div>
                );
              })}
            </div>

            {/* dasha */}
            <Eyebrow id="rectify" deva="जन्म समय शोधन" en="Birth-time rectification" />
            <RectifyModule form={chartContext?.form || form} place={chartContext?.place || place} ayanamsa={chartContext?.ayanamsa || ayanamsa} C={C} card={card} lang={lang} />

            <Eyebrow id="bnn" deva="भृगु नन्दी नाडी" en="Bhrigu Nandi Nadi · lagneless" />
            <BNNModule bnn={r.bnn} rows={r.rows} tz={r.tz} C={C} card={card} lang={lang} />

            <Eyebrow id="bhrigu" deva="भृगु चक्र · सरल पद्धति" en="Bhrigu Chakra & Saral Paddhati" />
            <BhriguModule rows={r.rows} ascSign={r.ascSign} birthMs={r.birthMs} tz={r.tz} C={C} card={card} lang={lang} />

            <Eyebrow id="dasha" deva="विंशोत्तरी दशा" en="Vimshottari dasha · maha to prana" />
            <div className="rise" style={{ ...card, padding: "8px 18px 16px", overflowX: "auto" }}>
              <table>
                <thead><tr><th>{hi ? "स्वामी" : "Lord"}</th><th>{hi ? "आरम्भ" : "From"}</th><th>{hi ? "अंत" : "To"}</th><th>{hi ? "वर्ष" : "Years"}</th></tr></thead>
                <tbody>
                  {r.dashas.map((dsh) => {
                    const isNow = r.current && dsh.lord === r.current.lord && dsh.start === r.current.start;
                    return (
                      <tr key={dsh.start} style={isNow ? { background: "rgba(168,106,18,.08)" } : null}>
                        <td style={{ color: isNow ? C.gold : C.ivory, fontWeight: isNow ? 600 : 400 }}>
                          {dsh.lord}{isNow && (hi ? " · वर्तमान" : " · current")}
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
                          <span>{r.current.lord} {hi ? "महादशा" : "mahadasha"}</span>
                          <span style={{ color: C.gold }}>{pct.toFixed(0)}% {hi ? "पूर्ण" : "elapsed"}</span>
                        </div>
                        <div style={{ height: 6, background: "#F1E9D5", borderRadius: 3, overflow: "hidden", border: `1px solid ${C.line}` }}>
                          <div style={{ width: `${pct}%`, height: "100%", background: `linear-gradient(90deg, ${C.gold}, #7E520C)`, borderRadius: 3 }} />
                        </div>
                      </div>
                    );
                  })()}
                  <p style={{ fontSize: 14, lineHeight: 1.6, color: C.ivory, margin: "16px 0 10px" }}>
                    {hi ? <>अभी <span style={{ color: C.gold }}>{r.current.lord} महादशा</span> चल रही है—यह अवधि उस ग्रह के कारकत्व, स्थिति और स्वामित्व वाले भावों को प्रमुख बनाती है।</> : <>The native runs <span style={{ color: C.gold }}>{r.current.lord} mahadasha</span> — a period classically associated with {DASHA_NOTE[r.current.lord]}.</>}
                  </p>
                  {r.curAntar && (
                    <div style={{ margin: "18px 0 6px", padding: "13px 14px", borderRadius: 10, background: "rgba(168,106,18,.05)", border: `1px solid ${C.line}` }}>
                      <div style={{ ...T.label, color: C.muted, marginBottom: 9 }}>{hi ? "अभी चल रहा क्रम · पाँचों स्तर" : "Running now · all five levels"}</div>
                      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "4px 6px" }}>
                        {[[hi ? "महा" : "Maha", r.current.lord], [hi ? "अंतर" : "Antar", r.curAntar.lord], [hi ? "प्रत्यंतर" : "Pratyantar", r.curPratya && r.curPratya.lord], [hi ? "सूक्ष्म" : "Sookshma", r.curSookshma && r.curSookshma.lord], [hi ? "प्राण" : "Prana", r.curPrana && r.curPrana.lord]].map(([lvl, lord], i) =>
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
                          {hi ? "वर्तमान प्राण" : "Current prana"}: {r.curPrana.lord} · {fmtDateT(r.curPrana.start, r.tz, true)} – {fmtDateT(r.curPrana.end, r.tz, true)}
                        </div>
                      )}
                    </div>
                  )}
                  <div style={{ ...T.label, color: C.muted, margin: "16px 0 4px" }}>
                    {r.current.lord} {hi ? "के भीतर अंतरदशाएँ — आगे के स्तर खोलने के लिए किसी अवधि को दबाएँ" : "Antardashas — tap any period to drill down"}
                  </div>
                  <DashaTree periods={r.antars} level={0} now={Date.now()} openD={openD} toggle={toggleD} C={C} tz={r.tz} lang={lang} />
                </>
              )}
            </div>

            {/* panchang */}
            <Eyebrow deva="पञ्चाङ्ग" en="Birth panchang" />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
              {[
                [hi ? "वार" : "Vara", r.panchang.weekday],
                [hi ? "तिथि" : "Tithi", `${r.panchang.paksha} ${r.panchang.tithiName}`],
                [hi ? "नक्षत्र" : "Nakshatra", r.panchang.nak],
                [hi ? "योग" : "Yoga", r.panchang.yoga],
                [hi ? "करण" : "Karana", r.panchang.karana],
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
                <span style={{ color: C.gold, fontFamily: "Eczar, serif" }}>{hi ? "लग्न" : "Lagna"} · </span>
                {hi ? <><strong>{SIGNS[r.ascSign]}</strong> लग्न बाहरी व्यक्तित्व, जीवन की दिशा और परिस्थितियों से मिलने के ढंग को आकार देता है।</> : <>With <strong>{SIGNS[r.ascSign]}</strong> rising, the outer temperament carries {SIGN_NOTE[r.ascSign]}.</>}
              </p>
              <p style={{ margin: "0 0 14px" }}>
                <span style={{ color: C.gold, fontFamily: "Eczar, serif" }}>{hi ? "चन्द्र" : "Chandra"} · </span>
                {hi ? <><strong>{SIGNS[r.moon.sign]}</strong> राशि में <strong>{NAKSHATRAS[r.moon.nak]}</strong> नक्षत्र (पाद {r.moon.pada}) का चन्द्र मन, भावनात्मक आदतों और भीतर की प्रतिक्रिया-शैली को आकार देता है।</> : <>The Moon in <strong>{SIGNS[r.moon.sign]}</strong>, under <strong>{NAKSHATRAS[r.moon.nak]}</strong> nakshatra (pada {r.moon.pada}), shapes the inner life: {NAK_NOTE[r.moon.nak]}</>}
              </p>
              <p style={{ margin: 0, color: C.muted, fontSize: 13 }}>
                {hi ? "यह परम्परा की भावना में आत्मचिंतन और जिज्ञासा के लिए है—अपने विवेक या योग्य ज्योतिषी के परामर्श का विकल्प नहीं।" : "Offered in the spirit of the tradition, for reflection and curiosity — not as a substitute for your own judgment or a qualified jyotishi's reading."}
              </p>
            </div>
          </>
      )}
    </>
  );
}
