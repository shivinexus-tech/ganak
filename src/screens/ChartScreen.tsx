/* Chart screen — birth form, vault, matching, and full chart results.
   Extracted from kundli-app.tsx (SHELL-FINISH-48H). Pure move. */

import React, { useState, useEffect } from "react";
import { T } from "../components/ui-style-contract";
import { Card, SectionHeader } from "../components/ui-primitives";
import { fmtDeg, fmtDateT } from "../components/format";
import { searchOffline, searchOnline } from "../data/places";
import MatchMaker from "./MatchingScreen";
import DiamondChart from "../components/DiamondChart";
import SouthChart from "../components/SouthChart";
import EastChart from "../components/EastChart";
import { urlPrefGet, urlPrefSet } from "../components/url-prefs";
import { useDepth } from "../accessibility/ComfortProvider";
import { VARGAS, SPECIAL_CHARTS, PLANET_GLYPH } from "../data/chart-divisions";
import { vargaSign } from "../engine/varga";
import { SEVEN } from "../engine/classical";
import { BALA_PARTS } from "../engine/shadbala";
import { KP_PLANETS, vimSub } from "../engine/dasha";
import { computeKundli } from "../engine/kundli";
import { kalaSarpaFromRows, pitraDoshaFromRows, papaCount } from "../engine/doshas";
import { marriageWindows } from "../engine/marriage-timing";
import { DashaTree } from "../components/DashaTree";
import { ChartVault } from "../components/ChartVault";
import { JyotishPanelNav } from "../components/JyotishPanelNav";
import { BNNModule, BhriguModule } from "./JyotishBnnScreen";
/* Same reason as JyotishPanelNav: the "browse all calculators" card used to emit a
   bare ?lang=, silently discarding the reader's city on the way in. */
import { utilityHref } from "./UtilityCalculatorScreen";
import { RectifyModule } from "./RectifyScreen";
import { SIGNS, NAKSHATRAS, AYANAMSA, zoneOffset } from "../engine/panchang";
import { dateProblem, timeProblem, fieldMessage, F_BIRTH_DATE, F_BIRTH_TIME } from "../components/birth-input";

/* The UTC offset AT THE BIRTH MOMENT. `zoneOffset` resolves a local wall clock, so a
   birth on a daylight-saving transition day gets the offset that was actually in force
   when it happened instead of the one the rest of that civil day happens to use. Falls
   back to the day-level form only when the clock has not been typed yet. */
const tzAtBirth = (zone: string, y: number, m: number, day: number, hh: number, mi: number) =>
  (Number.isFinite(hh) ? zoneOffset(zone, y, m, day, hh, Number.isFinite(mi) ? mi : 0) : zoneOffset(zone, y, m, day));
import { panchangTerm, signLabel, signShort, SIGN_SHORT_EN, padaText, planetName, planetShort } from "../i18n/panchang-terms";
import LifeInterpretationCard from "../components/LifeInterpretationCard";
import { buildLifeReading, SIGN_TRAITS } from "../data/life-interpretation";

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

const PLANET_COLOR = { Sun: "color-mix(in srgb, #C05A0C, var(--ink) 26%)", Moon: "color-mix(in srgb, #4E6E96, var(--ink) 26%)", Mars: "color-mix(in srgb, #BB3A2A, var(--ink) 26%)", Mercury: "color-mix(in srgb, #2C7D4F, var(--ink) 26%)", Jupiter: "color-mix(in srgb, #9A7000, var(--ink) 26%)", Venus: "color-mix(in srgb, #B3537F, var(--ink) 26%)", Saturn: "color-mix(in srgb, #46588F, var(--ink) 26%)", Rahu: "color-mix(in srgb, #6E5C82, var(--ink) 26%)", Ketu: "color-mix(in srgb, #8A5A36, var(--ink) 26%)" };

/* Jaimini chara karakas. The engine names the role and its signification in
   English only; before 2026-08-18 the Hindi screen replaced all SEVEN meanings
   with one generic sentence and printed the role and the graha in Latin — the
   same "Hindi reader gets a thinner product" defect the BNN screen had. Same
   {en, hi} shape as HOUSE_TOPICS below, keyed by the engine's role name. */
const CHARA_KARAKA_HI = {
  Atmakaraka: { role: "आत्मकारक", meaning: "आत्मा, जीवन का केंद्रीय सूत्र" },
  Amatyakaraka: { role: "अमात्यकारक", meaning: "आजीविका और परामर्श" },
  Bhratrikaraka: { role: "भ्रातृकारक", meaning: "भाई-बहन और गुरु" },
  Matrikaraka: { role: "मातृकारक", meaning: "माता और पालन-पोषण" },
  Putrakaraka: { role: "पुत्रकारक", meaning: "संतान और शिष्य" },
  Gnatikaraka: { role: "ज्ञातिकारक", meaning: "बंधु-बांधव, प्रतिद्वंद्वी और बाधाएँ" },
  Darakaraka: { role: "दारकारक", meaning: "जीवनसाथी और साझेदारी" },
};

const HOUSE_TOPICS = [
  { en: "self and vitality", hi: "स्वभाव और जीवन-बल" },
  { en: "speech, family and savings", hi: "वाणी, परिवार और बचत" },
  { en: "siblings, courage and effort", hi: "भाई-बहन, साहस और प्रयास" },
  { en: "home, mother and inner comfort", hi: "घर, माता और मन का सुख" },
  { en: "children, learning and creativity", hi: "संतान, विद्या और सृजन" },
  { en: "service, health and conflicts", hi: "सेवा, स्वास्थ्य और संघर्ष" },
  { en: "marriage and partnerships", hi: "विवाह और साझेदारी" },
  { en: "change, vulnerability and longevity", hi: "परिवर्तन, संवेदनशीलता और आयु" },
  { en: "dharma, fortune and teachers", hi: "धर्म, भाग्य और गुरु" },
  { en: "career, karma and public work", hi: "कर्म, करियर और सार्वजनिक कार्य" },
  { en: "gains, networks and fulfilment", hi: "लाभ, संबंध-जाल और पूर्णता" },
  { en: "release, expenses and private life", hi: "त्याग, खर्च और निजी जीवन" },
];

const SPECIAL_POINT_COPY = {
  "Bhava Lagna": { en: "Body and lived vitality through the day.", hi: "दिन भर की देह-ऊर्जा और जीवनी-शक्ति।", useEn: "Use it as a vitality lens, not as a replacement for the main Lagna.", useHi: "इसे मुख्य लग्न का विकल्प नहीं, जीवन-बल का सूक्ष्म संकेत मानें।" },
  "Hora Lagna": { en: "Wealth, resources and practical capacity.", hi: "धन, संसाधन और व्यवहारिक क्षमता।", useEn: "Helpful when reading earning capacity and material support.", useHi: "आय, संसाधन और भौतिक सहारे को पढ़ते समय उपयोगी।" },
  "Ghati Lagna": { en: "Power, authority, visibility and command.", hi: "शक्ति, अधिकार, प्रतिष्ठा और प्रभाव।", useEn: "Use with the 10th house and Sun/Saturn themes for status questions.", useHi: "प्रतिष्ठा के प्रश्नों में दशम भाव और सूर्य/शनि के साथ पढ़ें।" },
  "Sree Lagna": { en: "Prosperity, grace and comfort flow.", hi: "समृद्धि, कृपा और सुख का प्रवाह।", useEn: "A Lakshmi-oriented prosperity point; formulas vary, so read gently.", useHi: "लक्ष्मी-प्रधान समृद्धि बिंदु; सूत्र बदलते हैं, इसलिए सावधानी से पढ़ें।" },
  "Bhrigu Bindu": { en: "A karmic focus point between Moon and Rahu.", hi: "चन्द्र और राहु के बीच कर्म-फोकस बिंदु।", useEn: "Often read with transits as a sensitive trigger point.", useHi: "गोचर के साथ इसे संवेदनशील सक्रिय-बिंदु की तरह पढ़ा जाता है।" },
  "Yogi Point": { en: "Supportive point showing where help and ease may arise.", hi: "सहायक बिंदु जहाँ से सहयोग और सहजता मिल सकती है।", useEn: "Its planet is read as a helper when well-supported.", useHi: "इसका ग्रह समर्थ हो तो सहायक माना जाता है।" },
  "Avayogi Point": { en: "Testing point showing friction or delay.", hi: "परीक्षा-बिंदु जहाँ घर्षण या विलम्ब दिख सकता है।", useEn: "Use it to name caution, not fear.", useHi: "इसे सावधानी बताने के लिए लें, भय पैदा करने के लिए नहीं।" },
  Fortuna: { en: "Flow of fortune and ease, borrowed from the Lot of Fortune idea.", hi: "भाग्य और सहज प्रवाह का बिंदु।", useEn: "A supporting sensitive point; not a classical Vedic core factor.", useHi: "सहायक संवेदनशील बिंदु; वैदिक मूल-कारक नहीं।" },
  "Gulika / Mandi": { en: "Saturnine shadow point, traditionally treated as sensitive and malefic.", hi: "शनि-स्वभाव छाया बिंदु, परम्परा में संवेदनशील/पाप प्रभाव वाला।", useEn: "Read with restraint and house context.", useHi: "इसे संयम और भाव-संदर्भ के साथ पढ़ें।" },
  Dhuma: { en: "Smoke point — obscuration and obstacles.", hi: "धूम बिंदु — धुंधलापन और बाधा।", useEn: "Useful as a caution marker.", useHi: "सावधानी-सूचक की तरह उपयोगी।" },
  Vyatipata: { en: "Disruption point — sudden imbalance.", hi: "व्यतीपात — अचानक असंतुलन का बिंदु।", useEn: "Do not read alone; combine with house and dasha evidence.", useHi: "अकेले न पढ़ें; भाव और दशा के प्रमाण के साथ जोड़ें।" },
  Parivesha: { en: "Halo point — intensity around the house it occupies.", hi: "परिवेष — जिस भाव में हो वहाँ तीव्रता।", useEn: "A secondary sensitive point.", useHi: "द्वितीयक संवेदनशील बिंदु।" },
  Indrachapa: { en: "Rainbow point — unusual openings and visibility.", hi: "इन्द्रचाप — असामान्य अवसर और दृश्यता।", useEn: "Treat as a supportive nuance only.", useHi: "केवल सहायक सूक्ष्म संकेत की तरह लें।" },
  Upaketu: { en: "Comet point — sudden change and separation themes.", hi: "उपकेतु — अचानक बदलाव और अलगाव के विषय।", useEn: "Use as a timing sensitivity, not a standalone verdict.", useHi: "इसे समय-संवेदनशील संकेत मानें, अकेला निर्णय नहीं।" },
};

const RP_SOURCE_LABELS = {
  ascSignLord: { en: "Asc sign lord", hi: "लग्न राशि स्वामी" },
  ascStarLord: { en: "Asc star lord", hi: "लग्न नक्षत्र स्वामी" },
  ascSubLord: { en: "Asc sub-lord", hi: "लग्न उप-स्वामी" },
  moonSignLord: { en: "Moon sign lord", hi: "चन्द्र राशि स्वामी" },
  moonStarLord: { en: "Moon star lord", hi: "चन्द्र नक्षत्र स्वामी" },
  moonSubLord: { en: "Moon sub-lord", hi: "चन्द्र उप-स्वामी" },
  dayLord: { en: "Day lord", hi: "वार स्वामी" },
};

/* The Ashtakavarga grid is 12 rashi columns wide and has always scrolled sideways on a
   phone. Scrolling used to carry the planet label off-screen, so the reader lost track
   of which row they were reading — worse than the width itself. Pinning the label
   column fixes that, which is what makes the 3-akshara Devanagari headers affordable.
   The opaque background is required: without it the scrolling cells show through. */
const STICKY_COL = {
  position: "sticky" as const,
  left: 0,
  zIndex: 1,
  background: "var(--surface-raised)",
  textAlign: "left" as const,
};

export default function ChartScreen({ C, card, lang }) {
  // Guidance depth. Guided keeps the chart and the plain reading; Balanced is unchanged;
  // Expert additionally states the calculation basis. The chart itself, every date and
  // every caution stay visible at all three depths.
  const { showPlainHelp, showExpert, showTechnical } = useDepth();
  const hi = lang === "hi";
  const [form, setForm] = useState({ name: "", date: "", time: "" });
  const [place, setPlace] = useState(null);
  const [query, setQuery] = useState("");
  const [sugs, setSugs] = useState([]);
  const [searching, setSearching] = useState(false);
  const [tzOverride, setTzOverride] = useState("");
  const [result, setResult] = useState(null);
  const [chartContext, setChartContext] = useState(null);
  const [varga, setVarga] = useState("D1");
  const [refPt, setRefPt] = useState("lagna");
  const [ayanamsa, setAyanamsa] = useState("lahiri");
  // Chart style (North diamond / South grid) survives reload + sharing via the URL.
  const [chartStyle, setChartStyle] = useState(() => { const s = urlPrefGet("cstyle"); return s === "south" || s === "east" ? s : "north"; });
  const chooseStyle = (v) => { setChartStyle(v); urlPrefSet("cstyle", v); };
  const [err, setErr] = useState("");
  const [casting, setCasting] = useState(false);
  const [activePanel, setActivePanel] = useState("kundli");
  const resultsRef = React.useRef(null);

  useEffect(() => {
    if (!result) return;
    requestAnimationFrame(() => document.getElementById("summary")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }, [result]);

  useEffect(() => {
    const root = resultsRef.current;
    if (!root) return;
    const groupAt = {
      summary: "kundli", reading: "kundli", chart: "kundli", yogas: "kundli", planets: "kundli",
      karakas: "kundli", special: "kundli", chalit: "kundli", av: "kundli", arudha: "kundli",
      doshas: "kundli", "birth-panchang": "kundli",
      kp: "tools", ksig: "tools", shadbala: "tools", rectify: "tools",
      bnn: "dashas", bhrigu: "dashas", dasha: "dashas", marriage: "dashas",
    };
    let group = null;
    Array.from(root.children).forEach((child) => {
      if (child.id && groupAt[child.id]) group = groupAt[child.id];
      child.hidden = Boolean(group && group !== activePanel);
    });
  }, [activePanel, result, showTechnical, showPlainHelp, showExpert]);

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

  // A cast chart is only valid for the inputs it was cast from. Any user edit to
  // those inputs drops the old result so stale astrology can never look like it
  // belongs to the newly-typed person/place (Codex F1). loadChart sets state
  // directly (not via these handlers), so vault-load is unaffected.
  const clearResult = () => { setResult(null); setChartContext(null); setErr(""); };
  const set = (k, v) => { setForm((f) => ({ ...f, [k]: v })); clearResult(); };

  const onQuery = (q) => {
    setQuery(q);
    setPlace(null);
    setTzOverride("");
    clearResult();
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

  // Resolve the UTC offset automatically from the place's timezone at the birth
  // MOMENT — the date alone is not enough. On a daylight-saving transition day the
  // offset changes partway through the day, so a birth before the change was shown
  // (and computed) with the offset that only began afterwards. That is an hour of
  // error: ~15° of ascendant, and a whole nakshatra pada.
  const [yy, mm2, dd2] = (form.date || "").split("-").map(Number);
  const [hhA, miA] = (form.time || "").split(":").map(Number);
  const autoTz = place && place.zone && yy ? tzAtBirth(place.zone, yy, mm2, dd2, hhA, miA) : null;

  const loadChart = (c) => {
    if (!c || !c.form || !c.place) return;
    setForm(c.form); setPlace(c.place); setQuery(c.place.label);
    setTzOverride(c.tzOverride != null ? c.tzOverride : ""); setAyanamsa(c.ayanamsa || "lahiri");
    setErr("");
    /* A saved chart is only as good as what was saved. Vault entries predating the
       guards above (and any hand-edited or shared payload) can still carry an
       impossible birth date, and computeKundli would quietly roll it forward. Same
       rule as the form: refuse, and name the field. */
    const sp = dateProblem(c.form.date, F_BIRTH_DATE) || timeProblem(c.form.time, F_BIRTH_TIME);
    if (sp) { setResult(null); setChartContext(null); setErr(fieldMessage(sp, hi)); return; }
    try {
      const [y, m, day] = c.form.date.split("-").map(Number);
      const [hh, mi] = c.form.time.split(":").map(Number);
      const tz = c.tzOverride !== "" && c.tzOverride != null ? parseFloat(c.tzOverride) : tzAtBirth(c.place.zone, y, m, day, hh, mi);
      setResult(computeKundli({ y, m, day, hh, mi, tz, lat: c.place.lat, lon: c.place.lon, ayanamsa: c.ayanamsa || "lahiri" }));
      setChartContext({ form: { ...c.form }, place: { ...c.place }, ayanamsa: c.ayanamsa || "lahiri" });
    } catch (e) { setErr(lang === "hi" ? "यह सहेजी हुई कुंडली नहीं खुल सकी — शायद यह ख़राब है। कोई और सहेजी कुंडली आज़माएँ या विवरण फिर से भरें।" : "This saved chart couldn't be loaded — it may be corrupted. Try another saved chart, or re-enter the details."); }
  };

  const generate = () => {
    setErr("");
    // Drop any prior chart up front: if this cast fails validation below, the user
    // is left with the guard message and no stale result (Codex F1).
    setResult(null); setChartContext(null);
    /* Each field is checked on its own, and named. "Enter a complete date and time
       of birth" only asked whether a year and an hour PARSED, so three impossible
       births sailed through and were cast as though they were real:
         · 29 February 1990 was cast FOR 1 MARCH 1990, while the report header
           printed 1990-02-29 — two different birthdays on one page.
         · Year 999 was answered from an ephemeris whose ΔT fits stop at 1800.
         · 24:00 was read as 00:00 of the next day — a whole sign of ascendant.
       And a half-typed date ("1990-06") reached the timezone step, where the reader
       was told the PLACE could not be resolved. Never correct a birth date on the
       reader's behalf; say which field is wrong and why (components/birth-input). */
    const dp = dateProblem(form.date, F_BIRTH_DATE);
    if (dp) { setErr(fieldMessage(dp, hi)); return; }
    const tp = timeProblem(form.time, F_BIRTH_TIME);
    if (tp) { setErr(fieldMessage(tp, hi)); return; }
    const [y, m, day] = form.date.split("-").map(Number);
    const [hh, mi] = form.time.split(":").map(Number);
    // Use the picked place if present; otherwise, if the typed text resolves to
    // exactly one known place, adopt it and cast in the same click (no second press).
    let effPlace = place;
    if (!effPlace) {
      const offline = searchOffline(query);
      if (offline.length === 1) { effPlace = offline[0]; choosePlace(offline[0]); }
      else { setErr(lang === "hi" ? "जन्म स्थान लिखना शुरू करें और सुझावों में से चुनें।" : "Start typing the birth place and pick it from the suggestions."); return; }
    }
    const tz = tzOverride !== "" ? parseFloat(tzOverride) : tzAtBirth(effPlace.zone, y, m, day, hh, mi);
    if (tz === null || isNaN(tz)) { setErr(lang === "hi" ? "इस स्थान का समय-क्षेत्र नहीं मिला — कृपया नीचे UTC ऑफ़सेट स्वयं भरें।" : "Couldn't resolve the timezone for this place — enter the UTC offset manually below."); return; }
    setCasting(true);
    setActivePanel("kundli");
    requestAnimationFrame(() => {
      try {
        setResult(computeKundli({ y, m, day, hh, mi, tz, lat: effPlace.lat, lon: effPlace.lon, ayanamsa }));
        setChartContext({ form: { ...form }, place: { ...effPlace }, ayanamsa });
      } catch {
        setErr(lang === "hi" ? "कुंडली नहीं बन सकी। विवरण जाँचकर फिर प्रयास करें।" : "The chart couldn't be cast. Check the details and try again.");
      } finally {
        setCasting(false);
      }
    });
  };

  // Changing the ayanamsa after a chart is cast recomputes it live from the same
  // birth data — so picking Raman/KP visibly updates instead of silently waiting
  // for a re-cast.
  useEffect(() => {
    if (!chartContext) return;
    const c = chartContext;
    if (c.ayanamsa === ayanamsa) return;
    const [y, m, day] = (c.form.date || "").split("-").map(Number);
    const [hh, mi] = (c.form.time || "").split(":").map(Number);
    const tz = tzOverride !== "" ? parseFloat(tzOverride) : tzAtBirth(c.place.zone, y, m, day, hh, mi);
    if (!y || isNaN(hh) || tz == null || isNaN(tz)) return;
    setResult(computeKundli({ y, m, day, hh, mi, tz, lat: c.place.lat, lon: c.place.lon, ayanamsa }));
    setChartContext({ ...c, ayanamsa });
  }, [ayanamsa]); // eslint-disable-line react-hooks/exhaustive-deps

  const inputStyle = {
    width: "100%", boxSizing: "border-box", background: "var(--surface-sunken)",
    border: `0.0625rem solid ${C.line}`, borderRadius: "0.375rem", color: C.ivory,
    padding: "0.625rem 0.75rem", fontSize: "var(--font-body)", fontFamily: "var(--font-body-family)", outline: "none",
  };
  const labelStyle = { ...T.label, color: C.muted, display: "block", marginBottom: "0.375rem" };

  const Eyebrow = ({ deva, en, id }) => (
    <div id={id} style={{ display: "flex", alignItems: "baseline", gap: T.s3, margin: `${T.s8} 0 ${T.s4}`, borderBottom: `1px solid ${C.line}`, paddingBottom: T.s3, scrollMarginTop: 64 }}>
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
  // Sign-indexed planets for the sign-fixed South chart (varga sign, not house).
  const vPlanetsSign = r
    ? r.rows.map((p) => ({ label: PLANET_GLYPH[p.name], sign: vargaSign(p.lon, varga), retro: p.retro, deg: p.deg }))
    : [];
  // Jyotish is public. The integration may merge safely, but the interpretation
  // stays unreleased until the owner has verified every high-risk sign entry.
  const lifeInterpretationReady = SIGN_TRAITS.every((entry) => entry.status === "owner-verified");


  return (
    <>
      {r && (
        <Card density="compact" tone="sunken" elevated={false} style={{ padding: 0, marginBottom: T.s3 }}>
          <JyotishPanelNav lang={lang} C={C} place={place} showTechnical={showTechnical} activeGroup={activePanel} onSelectGroup={setActivePanel} />
        </Card>
      )}
          <>
        {/* birth details */}
        <section className="rise2" style={{ ...card, padding: "1.5rem" }}>
          <SectionHeader hi="जन्म विवरण" en="BIRTH DETAILS" lang={lang === "hi" ? "hi" : "en"} density="compact" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "0.875rem" }}>
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
                <div style={{ position: "absolute", left: 0, right: 0, top: "100%", zIndex: 10, background: "var(--surface-active)", border: `0.0625rem solid ${C.gold}`, borderRadius: "0.5rem", marginTop: "0.25rem", overflow: "hidden", boxShadow: "0 12px 30px rgba(95,70,20,.18)" }}>
                  {sugs.map((p) => (
                    <button
                      key={p.label + p.lat}
                      onClick={() => choosePlace(p)}
                      className="sug"
                      style={{ display: "block", width: "100%", textAlign: "left", padding: "0.625rem 0.875rem", background: "transparent", border: "none", borderBottom: `0.0625rem solid ${C.line}`, color: C.ivory, fontFamily: "var(--font-body-family)", fontSize: "var(--font-body)", cursor: "pointer" }}
                    >
                      {p.label}
                      <span style={{ color: C.muted, fontSize: "var(--font-label)", marginLeft: "0.5rem" }}>
                        {Math.abs(p.lat).toFixed(2)}°{p.lat >= 0 ? "N" : "S"}, {Math.abs(p.lon).toFixed(2)}°{p.lon >= 0 ? "E" : "W"}
                      </span>
                    </button>
                  ))}
                  {searching && <div style={{ padding: "0.5rem 0.875rem", color: C.muted, fontSize: "var(--font-label)" }}>{lang === "hi" ? "और स्थान खोजे जा रहे हैं…" : "Searching more places…"}</div>}
                </div>
              )}
              {place && (
                <p style={{ color: C.muted, fontSize: "var(--font-small)", margin: "0.5rem 0 0" }}>
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
                onChange={(e) => { setTzOverride(e.target.value); clearResult(); }}
                placeholder={lang === "hi" ? "जैसे: +5.5" : "e.g. +5.5"}
              />
            </div>
          </div>
          {err && <p style={{ color: C.sindoor, fontSize: "var(--font-body)", margin: "0.75rem 0 0" }}><span aria-hidden="true">⚠ </span>{err}</p>}
          <div style={{ marginTop: "1rem" }}>
            <label style={labelStyle}>{lang === "hi" ? "अयनांश" : "Ayanamsa"}</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "0.5rem", marginTop: "0.375rem" }}>
              {Object.entries(AYANAMSA).map(([k, v]) => (
                <button key={k} onClick={() => setAyanamsa(k)}
                  style={{ padding: "0.5625rem 0.625rem", borderRadius: "0.5rem", cursor: "pointer", fontSize: "var(--font-small)", fontWeight: 600,
                    border: ayanamsa === k ? "0.0938rem solid var(--accent)" : "0.0625rem solid var(--line)",
                    background: ayanamsa === k ? "var(--accent-soft)" : "var(--surface-raised)",
                    color: ayanamsa === k ? C.gold : C.muted }}>
                  {v.label}
                </button>
              ))}
            </div>
            <p style={{ color: C.muted, fontSize: "var(--font-label)", margin: "0.375rem 0 0", lineHeight: 1.5 }}>
              {lang === "hi"
                ? "लाहिरी सरकारी/वैदिक मानक (डिफ़ॉल्ट) है। रमन इससे ~1°28′ भिन्न है; KP (कृष्णमूर्ति) ~5′48″ पहले — उप-स्वामी कार्य हेतु; ट्रू चित्रपक्ष चित्रा को ठीक 180° पर रखता है और व्यवहार में लाहिरी के समान रहता है।"
                : "Lahiri is the government/Vedic standard (default). Raman differs by ~1°28′; KP (Krishnamurti) is ~5′48″ earlier — needed for sub-lord work; True Chitrapaksha fixes Spica at exactly 180° and in practice coincides with Lahiri."}
            </p>
          </div>
          <button
            onClick={generate}
            disabled={casting}
            aria-describedby="cast-status"
            className="castBtn" style={{ marginTop: "1.125rem", width: "100%", padding: "0.875rem 0", background: `linear-gradient(180deg, var(--accent), var(--accent-strong) 55%, var(--accent))`, color: "var(--on-accent)", border: "0.0625rem solid var(--gold)", borderRadius: "0.5625rem", fontFamily: "var(--font-display-family)", fontWeight: 700, fontSize: "var(--font-title)", letterSpacing: "0.07em", cursor: "pointer", boxShadow: "0 6px 18px var(--accent-soft)" }}
          >
            {casting ? (lang === "hi" ? "कुंडली बन रही है…" : "Casting your chart…") : (lang === "hi" ? "कुंडली बनाएँ" : "Cast the chart")}
          </button>
          <div id="cast-status" role="status" aria-live="polite" style={{ minHeight: "1.4em", marginTop: T.s2, color: casting ? C.gold : C.muted, fontSize: T.fSmall, textAlign: "center" }}>
            {casting ? (lang === "hi" ? "ग्रहों की स्थिति निकाली जा रही है।" : "Calculating planetary positions…") : result ? (lang === "hi" ? "कुंडली तैयार है। जन्म विवरण पर ले जाया गया।" : "Chart ready. Moved to Birth summary.") : ""}
          </div>
          <p style={{ color: C.muted, fontSize: "var(--font-label)", margin: "0.625rem 0 0", lineHeight: 1.5 }}>
            {lang === "hi"
              ? "UTC ऑफ़सेट जन्म स्थान और तिथि से स्वतः निकाला जाता है, ऐतिहासिक डेलाइट सेविंग सहित। सूर्य और चन्द्र आर्क-सेकंड परिशुद्धता वाले एफ़ेमेरिस (Meeus/VSOP) से, और पाँच तारा-ग्रह VSOP87 से (प्रकाश-काल, वार्षिक विपथन व नमन सहित) — लगभग आर्क-सेकंड तक सटीक स्थितियाँ।"
              : "The UTC offset is resolved automatically from the birth place and date, including historical daylight saving. Sun and Moon use an arc-second ephemeris (Meeus/VSOP), and the five star-planets use VSOP87 with light-time, annual aberration, and nutation — apparent positions accurate to about an arc-second, validated against Meeus's worked example (Venus) to 0.8″."}
          </p>
        </section>

        <Card density="compact" tone="sunken" elevated={false} style={{ marginTop: T.s4 }}>
          <SectionHeader hi="त्वरित कैलकुलेटर" en="QUICK CALCULATORS" lang={lang === "hi" ? "hi" : "en"} density="compact" />
          <p style={{ color: C.ivory, fontSize: T.fBody, lineHeight: 1.55, margin: `0 0 ${T.s2}` }}>
            {hi
              ? "पूरी कुंडली बनाए बिना राशि, लग्न, नक्षत्र, साढ़ेसाती या दोष का एक स्पष्ट उत्तर पाएँ।"
              : "Get a focused answer for Rashi, Lagna, Nakshatra, Sade Sati or a dosha without opening the full chart workspace."}
          </p>
          <p style={{ color: C.muted, fontSize: T.fSmall, lineHeight: 1.5, margin: `0 0 ${T.s3}` }}>
            {hi
              ? "वैदिक लाहिरी और पाश्चात्य ट्रॉपिकल विधियाँ अलग रखी गई हैं।"
              : "Vedic Lahiri and Western Tropical methods stay clearly separated."}
          </p>
          <a
            href={utilityHref("/calculators", lang, place)}
            className="comfort-focus"
            style={{ minHeight: T.ctrlH, display: "inline-flex", alignItems: "center", padding: `0 ${T.s4}`, border: `0.0625rem solid ${C.gold}`, borderRadius: T.rMd, color: C.gold, textDecoration: "none", fontWeight: 700 }}
          >
            {hi ? "सभी ज्योतिष कैलकुलेटर देखें →" : "Browse all astrology calculators →"}
          </a>
        </Card>

        {activePanel === "vault" && <div id="vault" style={{ scrollMarginTop: 72 }}>
          <ChartVault snapshot={{ form, place, tzOverride, ayanamsa }} result={result} onLoad={loadChart} C={C} card={card} lang={lang} />
        </div>}

        {/* kundali matching */}
        {activePanel === "matching" && <><Eyebrow id="match" deva="कुण्डली मिलान" en="Kundali matching · Guna Milan" />
        <MatchMaker C={C} card={card} computeKundli={computeKundli} lang={lang} /></>}
          </>

      {r && activePanel !== "matching" && activePanel !== "vault" && (
          <div ref={resultsRef}>
            {/* Save-as-PDF (print). Hidden in the printed output itself. */}
            <div className="no-print" style={{ display: "flex", justifyContent: "flex-end", marginBottom: "0.375rem" }}>
              <button onClick={() => window.print()} style={{ display: "inline-flex", alignItems: "center", gap: "0.4375rem", padding: "0.5rem 1rem", borderRadius: "0.5625rem", border: `0.0625rem solid ${C.gold}`, background: "var(--surface-sunken)", color: C.gold, cursor: "pointer", fontFamily: "var(--font-body-family)", fontSize: "var(--font-small)" }}>
                ⬇ {hi ? "पीडीएफ़ सहेजें" : "Save as PDF"}
              </button>
            </div>
            {/* print-only report header (the on-screen form inputs are hidden in print) */}
            <div className="print-only" style={{ textAlign: "center", marginBottom: "1.125rem", borderBottom: `0.125rem solid ${C.gold}`, paddingBottom: "0.75rem" }}>
              <div style={{ fontFamily: "var(--font-display-family)", fontSize: "var(--font-display)", color: C.gold }}>{((chartContext?.form || form).name) || (hi ? "जन्म कुंडली" : "Janma Kundli")}</div>
              <div style={{ fontSize: "var(--font-small)", color: C.ivory, marginTop: "0.25rem" }}>{(chartContext?.form || form).date} · {(chartContext?.form || form).time} · {(chartContext?.place || place)?.label}</div>
              <div style={{ fontSize: "var(--font-label)", color: C.muted, marginTop: "0.1875rem", letterSpacing: ".08em" }}>{hi ? "अयनांश" : "Ayanamsa"}: {AYANAMSA[chartContext?.ayanamsa || ayanamsa]?.label || (chartContext?.ayanamsa || ayanamsa)} · Ganak · ganak.pages.dev</div>
            </div>

            {/* identity strip */}
            <Eyebrow id="summary" deva="जन्म विवरण" en="Birth summary" />
            {showPlainHelp && <p style={{ margin: "0 0 0.75rem", padding: "0.625rem 0.75rem", borderRadius: T.rMd, background: "var(--surface-raised)", border: "0.0625rem solid var(--line)", color: C.ivory, fontSize: "var(--font-small)", lineHeight: 1.55 }}>
              {hi
                ? "सबसे ज़रूरी तीन बातें नीचे हैं — लग्न, चन्द्र राशि और जन्म नक्षत्र। बाक़ी विवरण नीचे क्रम से मिलेगा; पूरा पढ़ना आवश्यक नहीं।"
                : "The three that matter most are just below — your Lagna, Moon sign and birth Nakshatra. Everything else follows in order; you do not have to read all of it."}
            </p>}
            {showExpert && <p style={{ margin: "0 0 0.75rem", color: C.muted, fontSize: "var(--font-label)", fontVariantNumeric: "tabular-nums" }}>
              {(hi ? "गणना आधार: " : "Calculation basis: ")}
              {(hi ? "अयनांश " : "ayanamsa ") + (AYANAMSA[ayanamsa]?.label || ayanamsa)}
              {hi ? " · मध्यम राहु/केतु · पूर्ण-राशि भाव · भाव-संधि श्रीपति" : " · mean Rahu/Ketu · whole-sign houses · Sripati bhava cusps"}
              {/* E-1.0 B5: English mode now labels the rashi in English ("Virgo"), with no
                  Sanskrit gloss. That makes this line load-bearing — it is the only thing
                  telling a Western-trained reader these are SIDEREAL signs, not tropical. */}
              {!hi && <> · sign names are <strong>sidereal</strong> (Lahiri), not tropical — “Virgo” here is the sidereal Kanya</>}
            </p>}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "0.75rem" }}>
              {[
                [hi ? "लग्न" : "Lagna (Ascendant)", `${signLabel(lang, SIGNS[r.ascSign])} ${fmtDeg(r.ascDeg)}`],
                [hi ? "राशि (चन्द्र राशि)" : "Rashi (Moon sign)", signLabel(lang, SIGNS[r.moon.sign])],
                [hi ? "जन्म नक्षत्र" : "Janma Nakshatra", `${panchangTerm(lang, "nakshatra", NAKSHATRAS[r.moon.nak])} · ${padaText(lang, r.moon.pada)}`],
                [hi ? "सूर्य राशि" : "Surya (Sun sign)", signLabel(lang, SIGNS[r.sun.sign])],
              ].map(([k, v]) => (
                <div key={k} style={{ ...card, padding: "0.875rem 1rem" }}>
                  <div style={{ ...T.label, color: C.muted, marginBottom: "0.375rem" }}>{k}</div>
                  <div style={{ fontFamily: "var(--font-display-family)", fontSize: "var(--font-title)", color: C.gold, overflowWrap: "break-word" }}>{v}</div>
                </div>
              ))}
            </div>

            {lifeInterpretationReady && (
              <>
                <Eyebrow id="reading" deva="फलादेश" en="Your reading" />
                <LifeInterpretationCard
                  C={C}
                  card={card}
                  lang={lang}
                  reading={buildLifeReading({ nak: r.moon.nak, moonSign: r.moon.sign, ascSign: r.ascSign })}
                />
              </>
            )}

            {/* chart */}
            <Eyebrow id="chart" deva="षोडशवर्ग" en={`${curVarga.k} · ${curVarga.name}`} />
            <div className="rise" style={{ ...card, padding: "1.25rem 0.875rem 1.125rem" }}>
              {/* reference lagna: contained segmented control, wraps 4→2×2 on narrow screens */}
              <div style={{ margin: "0 0.25rem 0.75rem" }}>
                <div style={{ ...T.label, color: C.muted, marginBottom: "0.4375rem", textAlign: "center" }}>{hi ? "भावों की गणना यहाँ से" : "Houses counted from"}</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "0.25rem", background: "var(--surface-sunken)", border: `0.0625rem solid ${C.line}`, borderRadius: "0.75rem", padding: "0.25rem" }}>
                  {REFS.map((rf) => (
                    <button key={rf.k} onClick={() => setRefPt(rf.k)}
                      style={{ padding: "0.5rem 0.25rem", borderRadius: "0.5625rem", cursor: "pointer", fontFamily: "var(--font-body-family)", fontSize: "var(--font-small)", lineHeight: 1.25, border: rf.k === refPt ? `0.0625rem solid ${C.accentLine || "var(--accent-line)"}` : "0.0625rem solid transparent", background: rf.k === refPt ? "var(--surface-active)" : "transparent", color: rf.k === refPt ? C.gold : C.muted, boxShadow: rf.k === refPt ? "var(--elevation-1)" : "none", fontWeight: rf.k === refPt ? 600 : 400 }}>
                      <span style={{ fontFamily: "var(--font-display-family)", display: "block", fontSize: "var(--font-small)" }}>{rf.deva}</span>
                      {hi ? null : rf.en}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ fontSize: "var(--font-label)", color: C.muted, textAlign: "center", margin: "0 0.25rem 0.5rem", fontStyle: "italic", lineHeight: 1.4 }}>
                {lang === "hi" ? "षोडशवर्ग हर एक जीवन-क्षेत्र को विस्तार से दिखाते हैं — विवरण हेतु किसी भी वर्ग को दबाएँ।" : "Divisional charts each zoom into one area of life — tap any chart to see its focus."}
              </div>
              {/* varga strip: single horizontally-scrollable row, never overflows the card */}
              <div className="hscroll" style={{ display: "flex", gap: "0.375rem", overflowX: "auto", padding: "0.125rem 0.25rem 0.5rem", margin: "0 0 0.25rem", WebkitOverflowScrolling: "touch" }}>
                {VARGAS.map((v) => (
                  <button key={v.k} className="chip" title={hi ? `${v.k} विभागीय कुंडली` : `${v.name} — ${v.theme}`}
                    onClick={(e) => { setVarga(v.k); try { e.currentTarget.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" }); } catch {} }}
                    style={{ flexShrink: 0, padding: "0.4375rem 0.875rem", borderRadius: "1.125rem", cursor: "pointer", fontFamily: "var(--font-body-family)", fontSize: "var(--font-small)", letterSpacing: ".03em", border: `0.0625rem solid ${v.k === varga ? C.gold : C.line}`, background: v.k === varga ? "var(--accent-soft)" : "var(--surface-active)", color: v.k === varga ? C.gold : C.muted, fontWeight: v.k === varga ? 600 : 400 }}>
                    {v.k}
                  </button>
                ))}
              </div>
              <p style={{ textAlign: "center", color: C.gold, fontSize: "var(--font-small)", margin: "0.5rem 0 0.125rem", fontFamily: "var(--font-display-family)", letterSpacing: ".04em" }}>
                {hi ? `${curVarga.k} विभागीय कुंडली — जीवन के इस क्षेत्र का सूक्ष्म अध्ययन` : `${curVarga.name} — ${curVarga.theme}`}
              </p>
              {refNote && <p style={{ textAlign: "center", color: C.muted, fontSize: "var(--font-label)", margin: "0.125rem 0 0.625rem" }}>{refNote}</p>}
              {!refNote && <div style={{ height: "0.625rem" }} />}
              {/* chart-style switch — North diamond / South grid; choice persists in the URL */}
              <div style={{ display: "flex", justifyContent: "center", marginBottom: "0.75rem" }}>
                <div style={{ display: "inline-flex", background: "var(--surface-sunken)", borderRadius: "0.625rem", padding: "0.1875rem", border: `0.0625rem solid ${C.line}` }}>
                  {[["north", hi ? "उत्तर भारतीय" : "North"], ["south", hi ? "दक्षिण भारतीय" : "South"], ["east", hi ? "पूर्व भारतीय" : "East"]].map(([sk, slabel]) => (
                    <button key={sk} onClick={() => chooseStyle(sk)}
                      style={{ padding: "0.375rem 1rem", borderRadius: "0.5rem", fontFamily: "var(--font-body-family)", fontSize: "var(--font-small)", cursor: "pointer", border: "none",
                        background: chartStyle === sk ? C.panel || "var(--surface-active)" : "transparent", color: chartStyle === sk ? C.gold : C.muted, fontWeight: chartStyle === sk ? 600 : 400 }}>
                      {slabel}
                    </button>
                  ))}
                </div>
              </div>
              {chartStyle === "south" || chartStyle === "east" ? (
                (() => {
                  const StyleChart = chartStyle === "east" ? EastChart : SouthChart;
                  return (
                    <StyleChart
                      key={chartStyle + varga + refPt}
                      title={form.name ? `${form.name} · ${(place && place.label) || ""}` : (place && place.label) || (hi ? "जन्म कुंडली" : "Birth chart")}
                      ascSign={vAscSign}
                      planets={vPlanetsSign}
                      showDeg={varga === "D1"}
                      lagnaLabel={refPt === "lagna" ? "LAGNA" : refPt === "surya" ? "SURYA" : refPt === "chandra" ? "CHANDRA" : "KARAKAMSA"}
                      gold={C.gold} ivory={C.ivory} muted={C.muted} sindoor={C.sindoor}
                    />
                  );
                })()
              ) : (
              <DiamondChart
                key={varga + refPt}
                title={form.name ? `${form.name} · ${(place && place.label) || ""}` : (place && place.label) || (hi ? "जन्म कुंडली" : "Birth chart")}
                ascSign={vAscSign}
                houseOfPlanet={vPlanets}
                showDeg={varga === "D1"}
                lagnaLabel={refPt === "lagna" ? "LAGNA" : refPt === "surya" ? "SURYA" : refPt === "chandra" ? "CHANDRA" : "KARAKAMSA"}
                gold={C.gold} ivory={C.ivory} muted={C.muted} sindoor={C.sindoor}
              />
              )}
              <p style={{ textAlign: "center", color: C.muted, fontSize: "var(--font-label)", margin: "0.5rem 0 0" }}>
                {chartStyle === "east" ? (hi ? "राशियाँ स्थिर (मेष ऊपर, वामावर्त); भाव लग्न से" : "Signs fixed (Aries top, anti-clockwise); houses from the lagna") : chartStyle === "south" ? (hi ? "राशियाँ स्थिर हैं; भाव लग्न से गिने जाते हैं" : "Signs are fixed; houses are counted from the lagna") : (hi ? "हर भाव की संख्या उसकी राशि दिखाती है" : "Numbers mark the rashi in each house")} · <span style={{ color: C.sindoor }}>℞</span> {hi ? "वक्री" : "retrograde"}
                {varga === "D2" && (hi ? " · होरा कुंडली में केवल कर्क (चन्द्र) और सिंह (सूर्य) राशियाँ होती हैं" : " · the Hora chart uses only Cancer (Moon) and Leo (Sun)")}
              </p>
            </div>

            {/* yogas */}
            <Eyebrow id="yogas" deva="योग" en={`Yogas detected · ${r.yogas.length}`} />
            {r.yogas.length === 0 ? (
              <p style={{ color: C.muted, fontSize: "var(--font-body)" }}>{lang === "hi" ? "इस कुंडली में कोई प्रमुख शास्त्रीय योग नहीं मिला।" : "No major classical yogas were found in this chart."}</p>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "0.75rem" }}>
                {r.yogas.map((yg) => (
                  <div key={yg.name} className="rise" style={{ ...card, padding: "0.875rem 1rem", borderLeft: `0.1875rem solid ${yg.kind === "good" ? C.gold : C.sindoor}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "0.5rem", marginBottom: "0.375rem", flexWrap: "wrap" }}>
                      <span style={{ fontFamily: "var(--font-display-family)", fontSize: "var(--font-body)", color: yg.kind === "good" ? C.gold : C.sindoor }}>{hi ? yg.nameHi : yg.name}</span>
                      <span style={{ fontSize: "var(--font-micro)", letterSpacing: ".12em", textTransform: "uppercase", color: C.muted, whiteSpace: "nowrap" }}>{yg.kind === "good" ? (hi ? "शुभ" : "auspicious") : (hi ? "चुनौतीपूर्ण" : "challenging")}</span>
                    </div>
                    {/* YOGAS-HINDI-PARITY, 2026-08-18: this line used to be
                        `hi ? "<one generic sentence>" : yg.text` — every detected yoga
                        got the same Hindi sentence while English got a distinct meaning
                        each time. The meaning now travels with the yoga in both
                        languages (src/engine/classical.ts + src/data/yoga-copy-hi.ts),
                        so the screen only chooses which one to print. */}
                    <div style={{ fontSize: "var(--font-small)", lineHeight: 1.55 }}>{hi ? yg.textHi : yg.text}</div>
                  </div>
                ))}
              </div>
            )}

            {/* planetary table */}
            <Eyebrow id="planets" deva="ग्रह स्थिति" en="Planetary positions (sidereal)" />
            <div className="rise" style={{ ...card, padding: "0.875rem 1rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "0.625rem", marginBottom: "0.75rem" }}>
                {[
                  { n: "Lagna", deva: "La", sign: r.ascSign, deg: r.ascDeg, nak: r.ascNak, house: 1 },
                  ...r.rows.map(p => ({ n: p.name, deva: PLANET_GLYPH[p.name], sign: p.sign, deg: p.deg, nak: p.nak, house: p.house, retro: p.retro, color: PLANET_COLOR[p.name] }))
                ].map((p, i) => (
                  <div key={p.n} style={{ background: "var(--surface-raised)", border: `0.0625rem solid ${C.line}`, borderRadius: "0.625rem", padding: "0.625rem 0.75rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4375rem", marginBottom: "0.5rem" }}>
                      <span style={{ width: "0.4375rem", height: "0.4375rem", borderRadius: "0.1875rem", background: p.color || C.gold, flexShrink: 0 }} />
                      <span style={{ fontSize: "var(--font-small)", fontWeight: 600, color: C.ivory, flex: 1, overflowWrap: "break-word" }}>
                        {p.n === "Lagna" ? (hi ? "लग्न" : "Lagna") : planetName(lang, p.n)}{p.retro && <span style={{ color: C.sindoor, marginLeft: "0.125rem" }}>℞</span>}
                      </span>
                    </div>
                    <div style={{ fontSize: "var(--font-label)", color: C.muted, lineHeight: 1.4 }}>
                      <div><span style={{ fontWeight: 600, color: C.ivory }}>{signLabel(lang, SIGNS[p.sign])}</span> {fmtDeg(p.deg)}</div>
                      <div style={{ fontSize: "var(--font-micro)", marginTop: "0.1875rem" }}>{panchangTerm(lang, "nakshatra", NAKSHATRAS[p.nak]).split(" ")[0]}</div>
                      <div style={{ fontSize: "var(--font-micro)", marginTop: "0.125rem", color: C.gold }}>H{p.house}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ textAlign: "center", color: C.muted, fontSize: "var(--font-label)", paddingTop: "0.625rem", borderTop: `0.0625rem solid ${C.line}` }}>
                {hi ? "अयनांश (लाहिरी)" : "Ayanamsa (Lahiri)"}: <span style={{ color: C.ivory, fontVariantNumeric: "tabular-nums" }}>{fmtDeg(r.ayan)}</span> · {hi ? "वक्री ग्रह" : "Retrograde"} ℞ <span style={{ color: C.sindoor }}>{hi ? "सिंदूरी रंग में" : "shown in vermillion"}</span>
              </div>
            </div>

            {/* KP sub-lords */}
            <Eyebrow id="kp" deva="के॰पी॰ उपस्वामी" en="KP sub-lords (Krishnamurti Paddhati)" />
            <div className="rise" style={{ ...card, padding: "0.5rem 0.25rem", overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--font-small)", minWidth: "22.5rem" }}>
                <thead>
                  <tr style={{ color: C.muted, textAlign: "left", fontSize: "var(--font-label)", letterSpacing: ".05em", textTransform: "uppercase" }}>
                    <th style={{ padding: "0.375rem 0.625rem" }}>{hi ? "ग्रह" : "Graha"}</th>
                    <th style={{ padding: "0.375rem 0.625rem" }}>{hi ? "राशि" : "Sign"}</th>
                    <th style={{ padding: "0.375rem 0.625rem" }}>{hi ? "नक्षत्र" : "Nakshatra"}</th>
                    <th style={{ padding: "0.375rem 0.625rem" }}>{hi ? "नक्षत्र स्वामी" : "Star lord"}</th>
                    <th style={{ padding: "0.375rem 0.625rem" }}>{hi ? "उप-स्वामी" : "Sub lord"}</th>
                    <th style={{ padding: "0.375rem 0.625rem" }}>{hi ? "उप-उप स्वामी" : "Sub-sub"}</th>
                  </tr>
                </thead>
                <tbody>
                  {r.rows.map((p) => (
                    <tr key={p.name} style={{ borderTop: "0.0625rem solid var(--line-soft)" }}>
                      <td style={{ padding: "0.4375rem 0.625rem", whiteSpace: "nowrap" }}>
                        <span style={{ color: PLANET_COLOR[p.name], fontWeight: 600 }}>{PLANET_GLYPH[p.name]}</span> {planetName(lang, p.name)}{p.retro ? <span style={{ color: C.sindoor }}> ℞</span> : ""}
                      </td>
                      <td style={{ padding: "0.4375rem 0.625rem", color: C.muted, whiteSpace: "nowrap" }}>{signShort(lang, p.sign)} {fmtDeg(p.deg)}</td>
                      <td style={{ padding: "0.4375rem 0.625rem", color: C.muted, fontSize: "var(--font-label)" }}>{panchangTerm(lang, "nakshatra", NAKSHATRAS[p.nak])}</td>
                      <td style={{ padding: "0.4375rem 0.625rem", color: PLANET_COLOR[p.kp.starLord] }}>{planetName(lang, p.kp.starLord)}</td>
                      <td style={{ padding: "0.4375rem 0.625rem", color: PLANET_COLOR[p.kp.subLord], fontWeight: 700 }}>{planetName(lang, p.kp.subLord)}</td>
                      <td style={{ padding: "0.4375rem 0.625rem", color: PLANET_COLOR[p.kp.subSub] }}>{planetName(lang, p.kp.subSub)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p style={{ color: C.muted, fontSize: "var(--font-label)", margin: "0.625rem 0 0", lineHeight: 1.5 }}>
              {hi ? <>हर नक्षत्र (13°20′) को विंशोत्तरी अनुपात के नौ उप-भागों में बाँटा जाता है। KP में <span style={{ color: C.gold }}>उप-स्वामी</span> निर्णायक माना जाता है। {ayanamsa === "lahiri" ? "मानक KP उप-स्वामी देखने के लिए ऊपर कृष्णमूर्ति अयनांश चुनें।" : "गणना कृष्णमूर्ति अयनांश पर है।"}</> : <>Each nakshatra (13°20′) is split into nine Vimshottari-proportioned <em>subs</em>, starting from the star lord — the 249-division scheme. The <span style={{ color: C.gold }}>sub lord</span> is the deciding factor in KP. {ayanamsa === "lahiri" ? "You're on Lahiri ayanamsa; switch to KP (Krishnamurti) above for the canonical KP sub-lords." : "Computed on the KP (Krishnamurti) ayanamsa."}</>}
            </p>

            <div style={{ ...T.label, color: C.muted, margin: "1.125rem 0 0.5rem" }}>
              {hi ? "भाव-संधि उप-स्वामी" : "Cuspal sub-lords"} · {hi ? (r.kpData.houseSystem === "Placidus" ? "प्लासिडस" : "पॉर्फ़िरी") : r.kpData.houseSystem}
            </div>
            <div className="rise" style={{ ...card, padding: "0.5rem 0.25rem", overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--font-small)", minWidth: "22.5rem" }}>
                <thead>
                  <tr style={{ color: C.muted, textAlign: "left", fontSize: "var(--font-label)", letterSpacing: ".05em", textTransform: "uppercase" }}>
                    <th style={{ padding: "0.375rem 0.625rem" }}>{hi ? "भाव" : "Bhava"}</th>
                    <th style={{ padding: "0.375rem 0.625rem" }}>{hi ? "संधि" : "Cusp"}</th>
                    <th style={{ padding: "0.375rem 0.625rem" }}>{hi ? "नक्षत्र" : "Nakshatra"}</th>
                    <th style={{ padding: "0.375rem 0.625rem" }}>{hi ? "नक्षत्र स्वामी" : "Star"}</th>
                    <th style={{ padding: "0.375rem 0.625rem" }}>{hi ? "उप-स्वामी" : "Sub"}</th>
                    <th style={{ padding: "0.375rem 0.625rem" }}>{hi ? "उप-उप" : "Sub-sub"}</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => {
                    const L = r.kpData.cusps[h], sl = r.kpData.cuspSubLords[h];
                    if (L == null || !sl) return null;
                    const nakIdx = Math.floor(L / (360 / 27));
                    const angular = h === 1 || h === 4 || h === 7 || h === 10;
                    return (
                      <tr key={h} style={{ borderTop: "0.0625rem solid var(--line-soft)", background: angular ? "var(--surface-hover)" : "transparent" }}>
                        <td style={{ padding: "0.4375rem 0.625rem", fontFamily: "var(--font-display-family)", color: angular ? C.gold : C.ivory, whiteSpace: "nowrap" }}>{h}{h === 1 ? (hi ? " (लग्न)" : " (Asc)") : h === 10 ? (hi ? " (दशम)" : " (MC)") : ""}</td>
                        <td style={{ padding: "0.4375rem 0.625rem", color: C.muted, whiteSpace: "nowrap" }}>{signShort(lang, Math.floor(L / 30))} {fmtDeg(L % 30)}</td>
                        <td style={{ padding: "0.4375rem 0.625rem", color: C.muted, fontSize: "var(--font-label)" }}>{panchangTerm(lang, "nakshatra", NAKSHATRAS[nakIdx])}</td>
                        <td style={{ padding: "0.4375rem 0.625rem", color: PLANET_COLOR[sl.starLord] }}>{planetName(lang, sl.starLord)}</td>
                        <td style={{ padding: "0.4375rem 0.625rem", color: PLANET_COLOR[sl.subLord], fontWeight: 700 }}>{planetName(lang, sl.subLord)}</td>
                        <td style={{ padding: "0.4375rem 0.625rem", color: PLANET_COLOR[sl.subSub] }}>{planetName(lang, sl.subSub)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p style={{ color: C.muted, fontSize: "var(--font-label)", margin: "0.625rem 0 0", lineHeight: 1.5 }}>
              {hi ? <>भाव-संधियाँ {r.kpData.houseSystem === "Placidus" ? "KP के मानक प्लासिडस भाव-पद्धति" : "इस अक्षांश के लिए पॉर्फ़िरी विकल्प"} से निकली हैं। <span style={{ color: C.gold }}>भाव-संधि उप-स्वामी</span> बताता है कि उस भाव के विषय फलित होने की क्षमता रखते हैं। {ayanamsa === "lahiri" ? "मानक KP फल हेतु ऊपर कृष्णमूर्ति अयनांश चुनें।" : ""}</> : <>Cusps use {r.kpData.houseSystem === "Placidus" ? "the Placidus system (semi-arcs trisected in time) — the KP standard" : "a Porphyry fallback because Placidus is undefined at this latitude"}. The <span style={{ color: C.gold }}>cuspal sub-lord</span> is the cornerstone of KP analysis — it signifies whether the matters of that house will fructify. {ayanamsa === "lahiri" ? "Switch to KP ayanamsa above for canonical KP cusps." : ""}</>}
            </p>

            {/* KP significators */}
            <Eyebrow id="ksig" deva="के॰पी॰ सूचक" en="KP significators & ruling planets" />
            {(() => {
              const RP = r.rulingPlanets;
              const topRp = RP.ranked?.[0];
              const Chip = ({ pl, dim }) => (
                <span style={{ display: "inline-block", padding: "0.125rem 0.4375rem", borderRadius: "0.375rem", fontSize: "var(--font-label)", fontWeight: 600, margin: "0.125rem 0.1875rem 0.125rem 0",
                  color: dim ? C.muted : "var(--on-accent)", background: dim ? "transparent" : PLANET_COLOR[pl], border: dim ? `0.0625rem solid ${PLANET_COLOR[pl]}` : "none" }}>
                  {planetName(lang, pl)}
                </span>
              );
              const RPItem = ({ label, pl }) => (
                <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3125rem", marginRight: "0.75rem", marginBottom: "0.25rem" }}>
                  <span style={{ fontSize: "var(--font-micro)", color: C.muted, textTransform: "uppercase", letterSpacing: ".04em" }}>{label}</span>
                  <span style={{ color: PLANET_COLOR[pl], fontWeight: 700, fontSize: "var(--font-small)" }}>{planetName(lang, pl)}</span>
                </span>
              );
              return (
                <div>
                  {topRp && (
                    <div className="rise" style={{ ...card, padding: "0.875rem 1rem", borderLeft: "0.25rem solid var(--accent)", marginBottom: "0.75rem", background: "var(--surface-raised)" }}>
                      <div style={{ ...T.label, color: C.gold, marginBottom: "0.375rem" }}>{hi ? "पहले पढ़ें · शासक ग्रह का सार" : "Read first · ruling-planet summary"}</div>
                      <p style={{ margin: 0, color: C.ivory, lineHeight: 1.6, fontSize: "var(--font-small)" }}>
                        {hi ? <>इस जन्म-क्षण में सबसे समर्थ शासक ग्रह <strong style={{ color: PLANET_COLOR[topRp.planet] }}>{panchangTerm("hi", "planet", topRp.planet) || topRp.planet}</strong> है — यह {topRp.count} संकेतों में आया है। KP में बार-बार आने वाला ग्रह प्रश्न/घटना के फलित होने में अधिक ध्यान योग्य माना जाता है; इसे वादा नहीं, प्राथमिकता-सूचक मानें।</> : <>The strongest Ruling Planet at this birth moment is <strong style={{ color: PLANET_COLOR[topRp.planet] }}>{topRp.planet}</strong> — it appears through {topRp.count} source{topRp.count > 1 ? "s" : ""}. In KP, repeated ruling planets are read as higher-priority witnesses for timing and judgement; treat this as a priority signal, not a promise.</>}
                      </p>
                    </div>
                  )}
                  <div className="rise" style={{ ...card, padding: "0.875rem 1rem", borderLeft: "0.1875rem solid var(--accent)", marginBottom: "0.875rem" }}>
                    <div style={{ ...T.label, color: C.gold, marginBottom: "0.5rem" }}>{hi ? "शासक ग्रह · जन्म क्षण" : "Ruling Planets · birth moment"}</div>
                    <div style={{ display: "flex", flexWrap: "wrap", rowGap: "0.25rem" }}>
                      <RPItem label={hi ? "लग्न स्वामी" : "Asc lord"} pl={planetName(lang, RP.ascSignLord)} />
                      <RPItem label={hi ? "लग्न नक्षत्र" : "Asc star"} pl={planetName(lang, RP.ascStarLord)} />
                      <RPItem label={hi ? "लग्न उप" : "Asc sub"} pl={planetName(lang, RP.ascSubLord)} />
                      <RPItem label={hi ? "चन्द्र स्वामी" : "Moon lord"} pl={planetName(lang, RP.moonSignLord)} />
                      <RPItem label={hi ? "चन्द्र नक्षत्र" : "Moon star"} pl={planetName(lang, RP.moonStarLord)} />
                      <RPItem label={hi ? "चन्द्र उप" : "Moon sub"} pl={planetName(lang, RP.moonSubLord)} />
                      <RPItem label={hi ? "वार स्वामी" : "Day lord"} pl={planetName(lang, RP.dayLord)} />
                    </div>
                  </div>

                  {RP.ranked && (
                    <div className="rise" style={{ ...card, padding: "0.75rem 0.875rem", marginBottom: "0.875rem" }}>
                      <div style={{ ...T.label, color: C.muted, marginBottom: "0.5rem" }}>{hi ? "समर्थन क्रम · कौन-सा ग्रह कितनी बार आया" : "Support ranking · how often each planet appears"}</div>
                      <div style={{ display: "grid", gap: "0.5rem" }}>
                        {RP.ranked.map((rp, idx) => (
                          <div key={rp.planet} style={{ display: "grid", gridTemplateColumns: "1.75rem minmax(3.375rem, 4.375rem) 1fr", alignItems: "center", gap: "0.5rem" }}>
                            <span style={{ color: C.muted, fontSize: "var(--font-micro)" }}>#{idx + 1}</span>
                            <span style={{ color: PLANET_COLOR[rp.planet], fontWeight: 700 }}>{planetName(lang, rp.planet)}</span>
                            <span style={{ color: C.muted, fontSize: "var(--font-micro)", lineHeight: 1.4 }}>
                              {rp.sources.map((s) => hi ? RP_SOURCE_LABELS[s].hi : RP_SOURCE_LABELS[s].en).join(" · ")}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div style={{ ...T.label, color: C.muted, margin: "0.25rem 0 0.5rem" }}>
                    {hi ? "भाव सूचक (सबसे प्रबल पहले)" : "House significators (strongest first)"}
                  </div>
                  <div className="rise" style={{ ...card, padding: "0.5rem 0.25rem", overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--font-small)", minWidth: "23.75rem" }}>
                      <thead>
                        <tr style={{ color: C.muted, textAlign: "left", fontSize: "var(--font-label)", letterSpacing: ".05em", textTransform: "uppercase" }}>
                          <th style={{ padding: "0.375rem 0.625rem" }}>{hi ? "भाव" : "Bhava"}</th>
                          <th style={{ padding: "0.375rem 0.625rem" }}>{hi ? "स्थित ग्रह" : "Occupants"}</th>
                          <th style={{ padding: "0.375rem 0.625rem" }}>{hi ? "स्वामी" : "Owner"}</th>
                          <th style={{ padding: "0.375rem 0.625rem" }}>{hi ? "सूचक ग्रह" : "Significators"}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                          <tr key={h} style={{ borderTop: "0.0625rem solid var(--line-soft)", verticalAlign: "top" }}>
                            <td style={{ padding: "0.5rem 0.625rem", fontFamily: "var(--font-display-family)", color: C.ivory }}>{h}</td>
                            <td style={{ padding: "0.5rem 0.625rem", whiteSpace: "nowrap" }}>{r.kpSig.occupants[h].length ? r.kpSig.occupants[h].map((pl) => <Chip key={pl} pl={pl} />) : <span style={{ color: C.muted, fontSize: "var(--font-label)" }}>—</span>}</td>
                            <td style={{ padding: "0.5rem 0.625rem" }}>{r.kpSig.owner[h] ? <Chip pl={r.kpSig.owner[h]} dim /> : "—"}</td>
                            <td style={{ padding: "0.5rem 0.625rem" }}>{r.kpSig.ordered[h].map((pl) => <Chip key={pl} pl={pl} />)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div style={{ fontSize: "var(--font-label)", color: C.muted, marginTop: "0.375rem", fontStyle: "italic" }}>{lang === "hi" ? "— का अर्थ है कोई नहीं" : "— means none"}</div>

                  <div style={{ ...T.label, color: C.muted, margin: "1.125rem 0 0.5rem" }}>
                    {hi ? "हर ग्रह द्वारा सूचित भाव" : "Houses signified by each planet"}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "0.5rem" }}>
                    {KP_PLANETS.map((pl) => (
                      <div key={pl} className="rise" style={{ ...card, padding: "0.5625rem 0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span style={{ color: PLANET_COLOR[pl], fontWeight: 700, fontSize: "var(--font-small)", minWidth: "3.25rem" }}>{PLANET_GLYPH[pl]} {planetShort(lang, pl)}</span>
                        <span style={{ color: C.ivory, fontSize: "var(--font-small)", fontVariantNumeric: "tabular-nums" }}>{r.kpSig.housesOf[pl].length ? r.kpSig.housesOf[pl].join(", ") : "—"}</span>
                      </div>
                    ))}
                  </div>
                  <p style={{ color: C.muted, fontSize: "var(--font-label)", margin: "0.75rem 0 0", lineHeight: 1.5 }}>
                    {hi ? <>ग्रह जिन भावों का सूचक है, अपनी दशा-भुक्ति में उनके विषय सक्रिय कर सकता है—विशेषतः जब वह शासक ग्रह भी हो। राहु-केतु अपने नक्षत्र और राशि स्वामियों के प्रतिनिधि की तरह भी फल देते हैं। {ayanamsa === "lahiri" ? "मानक KP सूचक हेतु कृष्णमूर्ति अयनांश चुनें।" : "गणना KP अयनांश पर है।"}</> : <>A planet promises the matters of every house it signifies; during its dasha/bhukti — especially when it is also a Ruling Planet — those houses fructify. Rahu and Ketu also act as agents of their star and sign lords (apply that nuance when judging the nodes). {ayanamsa === "lahiri" ? "Switch to KP ayanamsa above for canonical KP significators." : "Computed on the KP ayanamsa."}</>}
                  </p>
                </div>
              );
            })()}

            {/* jaimini karakas */}
            <Eyebrow id="karakas" deva="चर कारक" en="Jaimini chara karakas" />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "0.75rem" }}>
              {r.karakas.map((kk, i) => (
                <div key={kk.role} style={{ ...card, padding: "0.8125rem 0.9375rem", border: `0.0625rem solid ${i === 0 ? C.gold : C.line}`, boxShadow: i === 0 ? `0 0 22px var(--accent-soft), ${card.boxShadow}` : card.boxShadow }}>
                  <div style={{ ...T.label, color: i === 0 ? C.gold : C.muted, marginBottom: "0.375rem" }}>{hi ? (CHARA_KARAKA_HI[kk.role] || {}).role || kk.role : kk.role}</div>
                  <div style={{ fontSize: "var(--font-body)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ width: "0.5rem", height: "0.5rem", borderRadius: "0.25rem", background: PLANET_COLOR[kk.planet], boxShadow: `0 0 6px ${PLANET_COLOR[kk.planet]}55`, flexShrink: 0 }} />
                    {panchangTerm(lang, "planet", kk.planet)}
                    <span style={{ color: C.muted, fontSize: "var(--font-small)", fontVariantNumeric: "tabular-nums" }}>{fmtDeg(kk.deg)} {signLabel(lang, SIGNS[kk.sign])}</span>
                  </div>
                  <div style={{ color: C.muted, fontSize: "var(--font-label)", marginTop: "0.3125rem" }}>{hi ? (CHARA_KARAKA_HI[kk.role] || {}).meaning || kk.meaning : kk.meaning}</div>
                </div>
              ))}
            </div>

            {/* shadbala */}
            {showTechnical && <>
            <Eyebrow id="shadbala" deva="षड्बल" en="Shadbala · six-fold strength" />
            <div style={{ ...card, padding: "0.75rem 1rem", marginBottom: "0.75rem", background: "var(--surface-raised)" }}>
              <p style={{ margin: 0, fontSize: "var(--font-small)", color: C.ivory, lineHeight: 1.55 }}>
                {lang === "hi"
                  ? <>षड्बल मापता है कि हर ग्रह अपने फल देने में कितना बलवान है। यहाँ सबसे बलवान <strong style={{ color: C.gold }}>{panchangTerm("hi", "planet", r.shadbala.ranked[0])}</strong> है — इसके कारकत्व अपेक्षाकृत सहजता से फलित होते हैं; सबसे निर्बल <strong style={{ color: C.sindoor }}>{panchangTerm("hi", "planet", r.shadbala.ranked[6])}</strong> है — इसके कारकत्व अधिक प्रयास माँग सकते हैं।</>
                  : <>Shadbala measures how much strength each planet has to deliver its results. Here <strong style={{ color: C.gold }}>{r.shadbala.ranked[0]}</strong> is strongest — its matters tend to come with more ease; <strong style={{ color: C.sindoor }}>{r.shadbala.ranked[6]}</strong> is weakest — its matters may take more effort.</>}
              </p>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginBottom: "0.75rem" }}>
              {BALA_PARTS.map((b) => (
                <span key={b.k} style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", fontSize: "var(--font-label)", color: C.muted }}>
                  <span style={{ width: "0.625rem", height: "0.625rem", borderRadius: "0.1875rem", background: b.color }} />
                  {hi ? b.labelHi : b.label} <span style={{ opacity: 0.7 }}>({hi ? b.noteHi : b.note})</span>
                </span>
              ))}
            </div>
            {(() => {
              const maxR = Math.max(...SEVEN.map((p) => r.shadbala.perPlanet[p].totalR));
              return (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "0.75rem" }}>
                  {r.shadbala.ranked.map((p, rank) => {
                    const x = r.shadbala.perPlanet[p];
                    const strong = x.ratio >= 1;
                    return (
                      <div key={p} className="rise" style={{ ...card, padding: "0.875rem 1rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.625rem" }}>
                          <span style={{ width: "0.5625rem", height: "0.5625rem", borderRadius: "0.3125rem", background: PLANET_COLOR[p], flexShrink: 0 }} />
                          <span style={{ fontFamily: "var(--font-display-family)", fontSize: "var(--font-title)", color: C.ivory }}>{hi ? panchangTerm("hi", "planet", p) : p}</span>
                          <span style={{ marginLeft: "auto", fontSize: "var(--font-label)", color: C.muted }}>#{rank + 1}</span>
                          <span style={{ fontSize: "var(--font-micro)", fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase", padding: "0.1875rem 0.5rem", borderRadius: "0.625rem", color: strong ? "var(--good)" : C.sindoor, background: strong ? "rgba(63,126,46,.1)" : "var(--bad-surface)" }}>{strong ? (hi ? "प्रबल" : "strong") : (hi ? "निर्बल" : "weak")}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem", marginBottom: "0.625rem" }}>
                          <span style={{ fontFamily: "var(--font-display-family)", fontSize: "var(--font-display)", color: C.gold, lineHeight: 1 }}>{x.totalR.toFixed(2)}</span>
                          <span style={{ fontSize: "var(--font-label)", color: C.muted }}>{hi ? "रूप · अपेक्षित" : "Rupas · needs"} {x.required} · {(x.ratio * 100).toFixed(0)}%</span>
                        </div>
                        <div style={{ display: "flex", height: "0.625rem", borderRadius: "0.3125rem", overflow: "hidden", background: "var(--surface-sunken)", marginBottom: "0.5rem" }}>
                          {BALA_PARTS.map((b) => {
                            const w = Math.max(0, x[b.k]) / 60 / maxR * 100;
                            return w > 0 ? <span key={b.k} title={`${hi ? b.labelHi : b.label}: ${(x[b.k] / 60).toFixed(2)}`} style={{ width: `${w}%`, background: b.color }} /> : null;
                          })}
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.1875rem 0.625rem", fontSize: "var(--font-label)" }}>
                          {BALA_PARTS.map((b) => (
                            <span key={b.k} style={{ color: C.muted, display: "flex", justifyContent: "space-between" }}>
                              <span style={{ color: b.color }}>{hi ? b.labelHi : b.label}</span>
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
            <p style={{ color: C.muted, fontSize: "var(--font-label)", margin: "0.75rem 0 0", lineHeight: 1.5 }}>
              {hi ? <>बल रूप में है (1 रूप = 60 विरूप)। अपेक्षित न्यूनतम से ऊपर का ग्रह अपने कारकत्व देने में अधिक समर्थ माना जाता है। सबसे प्रबल: <span style={{ color: C.gold }}>{panchangTerm("hi", "planet", r.shadbala.ranked[0])}</span> · सबसे निर्बल: <span style={{ color: C.sindoor }}>{panchangTerm("hi", "planet", r.shadbala.ranked[6])}</span>। चेष्टा और कुछ काल उप-बल अन्य सॉफ़्टवेयर से थोड़ा भिन्न हो सकते हैं।</> : <>Strength in Rupas (1 Rupa = 60 Virupas). A planet clearing its required minimum is well-placed to deliver its significations. Strongest: <span style={{ color: C.gold }}>{r.shadbala.ranked[0]}</span> · weakest: <span style={{ color: C.sindoor }}>{r.shadbala.ranked[6]}</span>. Cheshta and some Kala sub-balas are modelled and may differ slightly from other software.</>}
            </p>

            {/* special lagnas & points */}
            </>}
            <Eyebrow id="special" deva="विशेष लग्न व बिन्दु" en="Special lagnas & sensitive points" />
            {(() => {
              const SP = r.special;
              const hOf = (L) => ((Math.floor(L / 30) - r.ascSign + 12) % 12) + 1;
              const Tile = ({ item, accent }) => (
                <div style={{ ...card, padding: "0.75rem 0.875rem", borderLeft: `0.1875rem solid ${accent}` }}>
                  <div style={{ ...T.label, color: C.muted, marginBottom: "0.3125rem" }}>{item.k}</div>
                  <div style={{ fontFamily: "var(--font-display-family)", fontSize: "var(--font-body)", color: C.ivory, display: "flex", alignItems: "baseline", gap: "0.4375rem", flexWrap: "wrap" }}>
                    {signLabel(lang, SIGNS[Math.floor(item.v / 30)])} <span style={{ fontSize: "var(--font-small)", color: C.muted, fontVariantNumeric: "tabular-nums" }}>{fmtDeg(item.v % 30)}</span>
                    <span style={{ fontSize: "var(--font-label)", color: C.gold }}>H{hOf(item.v)}</span>
                    {item.pl && <span style={{ fontSize: "var(--font-label)", color: PLANET_COLOR[item.pl] }}>· {item.pl}</span>}
                  </div>
                  <div style={{ color: C.muted, fontSize: "var(--font-micro)", marginTop: "0.25rem", lineHeight: 1.45 }}>{hi ? (SPECIAL_POINT_COPY[item.k]?.hi || "यह विशेष बिंदु कुंडली के एक सूक्ष्म जीवन-विषय को दर्शाता है।") : (SPECIAL_POINT_COPY[item.k]?.en || item.note)}</div>
                  <div style={{ color: C.muted, fontSize: "var(--font-micro)", marginTop: "0.25rem", lineHeight: 1.45, fontStyle: "italic" }}>{hi ? (SPECIAL_POINT_COPY[item.k]?.useHi || "") : (SPECIAL_POINT_COPY[item.k]?.useEn || "")}</div>
                </div>
              );
              const Group = ({ title, items, accent }) => (
                <>
                  <div style={{ ...T.label, color: accent, margin: "1rem 0 0.5rem", fontWeight: 600 }}>{title}</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: "0.625rem" }}>
                    {items.map((it) => <Tile key={it.k} item={it} accent={accent} />)}
                  </div>
                </>
              );
              return (
                <div>
                  <div style={{ ...card, padding: "0.75rem 1rem", marginBottom: "0.75rem", background: "var(--surface-raised)", borderLeft: `0.25rem solid var(--accent)` }}>
                    <p style={{ margin: 0, fontSize: "var(--font-small)", lineHeight: 1.6, color: C.ivory }}>
                      {hi ? "ये मुख्य लग्न का विकल्प नहीं हैं। ये सूक्ष्म बिंदु बताते हैं कि धन, अधिकार, समृद्धि, बाधा या संवेदनशीलता किस भाव में जोर पकड़ सकती है। पहले मुख्य कुंडली पढ़ें, फिर इन्हें सहायक संकेत की तरह जोड़ें।" : "These do not replace the main Lagna. They are secondary lenses showing where wealth, authority, prosperity, friction or sensitivity may concentrate. Read the main chart first, then use these as supporting signals."}
                    </p>
                  </div>
                  <Group title={hi ? "विशेष लग्न" : "Special Lagnas"} items={SP.lagnas} accent={C.gold} />
                  <Group title={hi ? "संवेदनशील बिंदु" : "Sensitive Points"} items={SP.points} accent="color-mix(in srgb, #6E5C82, var(--ink) 26%)" />
                  <div style={{ ...card, padding: "0.75rem 0.875rem", marginTop: "0.625rem", borderLeft: `0.1875rem solid var(--good)`, display: "inline-block" }}>
                    <span style={{ ...T.label, color: C.muted, marginRight: "0.5rem" }}>{hi ? "इन्दु लग्न (धन)" : "Indu Lagna (wealth)"}</span>
                    <span style={{ fontFamily: "var(--font-display-family)", fontSize: "var(--font-body)", color: "color-mix(in srgb, #2C7D4F, var(--ink) 26%)" }}>{signLabel(lang, SIGNS[SP.induSign])}</span>
                  </div>
                  <Group title={hi ? "उपग्रह · छाया बिंदु" : "Upagrahas · shadow sub-planets"} items={SP.upagrahas} accent="var(--bad)" />
                  <p style={{ color: C.muted, fontSize: "var(--font-label)", margin: "0.75rem 0 0", lineHeight: 1.5 }}>
                    {hi ? "भाव, होरा और घटी लग्न सूर्योदय से आगे बढ़ते हैं। गुलिक दिन के शनि-शासित आठवें भाग में उदित लग्न है। श्री लग्न जैसे कुछ बिंदुओं के सूत्र परम्पराओं में थोड़ा बदलते हैं।" : "Bhava / Hora / Ghati lagnas advance from sunrise (1 sign per 5 / 2.5 / 1 ghatis). Gulika is the lagna rising during Saturn's eighth of the day. Some points (Sree Lagna especially) follow formulas that vary slightly between traditions."}
                  </p>
                </div>
              );
            })()}

            {/* bhava chalit + bhava bala */}
            <Eyebrow id="chalit" deva="भाव चलित" en="Bhava Chalit & Bhava Bala" />
            <div style={{ ...card, padding: "0.75rem 1rem", marginBottom: "0.75rem", background: "var(--surface-raised)", borderLeft: `0.25rem solid var(--accent)` }}>
              <p style={{ margin: 0, fontSize: "var(--font-small)", lineHeight: 1.6, color: C.ivory }}>
                {hi ? <>सबसे मजबूत भाव <strong style={{ color: C.gold }}>H{r.bhava.strongest}</strong> है — {HOUSE_TOPICS[r.bhava.strongest - 1].hi} अपेक्षाकृत सहज चलते हैं। सबसे कमजोर भाव <strong style={{ color: C.sindoor }}>H{r.bhava.weakest}</strong> है — {HOUSE_TOPICS[r.bhava.weakest - 1].hi} में अधिक जागरूकता और प्रयास चाहिए।</> : <>The strongest house is <strong style={{ color: C.gold }}>H{r.bhava.strongest}</strong> — {HOUSE_TOPICS[r.bhava.strongest - 1].en} tend to have more support. The weakest is <strong style={{ color: C.sindoor }}>H{r.bhava.weakest}</strong> — {HOUSE_TOPICS[r.bhava.weakest - 1].en} may need more awareness and effort.</>}
              </p>
            </div>
            <div className="rise" style={{ ...card, padding: "1.25rem 0.875rem 0.75rem" }}>
              <DiamondChart
                title={hi ? "भाव चलित — वास्तविक भाव-संधि के अनुसार ग्रह" : "Bhava Chalit — planets by true house cusp"}
                ascSign={r.ascSign}
                houseOfPlanet={r.rows.map((p) => ({ label: PLANET_GLYPH[p.name], house: r.bhava.chalit[p.name], retro: p.retro }))}
                gold={C.gold} ivory={C.ivory} muted={C.muted} sindoor={C.sindoor}
              />
              {(() => {
                const shifts = r.rows.filter((p) => p.house !== r.bhava.chalit[p.name]);
                return shifts.length ? (
                  <p style={{ textAlign: "center", color: C.muted, fontSize: "var(--font-label)", margin: "0.25rem 0 0", lineHeight: 1.6 }}>
                    {hi ? "राशि कुंडली से भाव बदला: " : "Shifted from the rasi chart: "}
                    {shifts.map((p, i) => (
                      <span key={p.name}>
                        {i > 0 && ", "}
                        <span style={{ color: C.ivory }}>{p.name}</span> <span style={{ color: C.sindoor }}>H{p.house}→H{r.bhava.chalit[p.name]}</span>
                      </span>
                    ))}
                  </p>
                ) : (
                  <p style={{ textAlign: "center", color: C.muted, fontSize: "var(--font-label)", margin: "0.25rem 0 0" }}>{hi ? "किसी ग्रह का भाव नहीं बदला—भाव-संधियाँ राशियों के निकट हैं।" : "No planets shift house — cusps align closely with the signs."}</p>
                );
              })()}
            </div>

            <div style={{ ...T.label, color: C.muted, margin: "1.125rem 0 0.625rem" }}>
              {hi ? "भाव बल · भावों की शक्ति (रूप)" : "Bhava Bala · house strength (Rupas)"}
            </div>
            {(() => {
              const maxB = Math.max(...r.bhava.bhavaBala.map((b) => b.total));
              return (
                <div style={{ display: "grid", gap: "0.5rem" }}>
                  {r.bhava.bhavaBala.map((b) => {
                    const strong = b.house === r.bhava.strongest, weak = b.house === r.bhava.weakest;
                    return (
                      <div key={b.house} style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                        <span style={{ width: "1.875rem", fontFamily: "var(--font-display-family)", fontSize: "var(--font-body)", color: strong ? C.gold : weak ? C.sindoor : C.ivory, flexShrink: 0 }}>H{b.house}</span>
                        <span style={{ width: "3.375rem", fontSize: "var(--font-label)", color: C.muted, flexShrink: 0 }}>{signShort(lang, b.sign)} · <span style={{ color: PLANET_COLOR[b.lord] }}>{PLANET_GLYPH[b.lord]}</span></span>
                        <div style={{ flex: 1, height: "0.875rem", background: "var(--surface-sunken)", borderRadius: "0.4375rem", overflow: "hidden" }}>
                          <div style={{ width: `${Math.max(4, b.total / maxB * 100)}%`, height: "100%", background: strong ? `linear-gradient(90deg, var(--gold), var(--accent))` : weak ? "var(--bad)" : "var(--line)", borderRadius: "0.4375rem" }} />
                        </div>
                        <span style={{ width: "2.375rem", textAlign: "right", fontSize: "var(--font-small)", fontVariantNumeric: "tabular-nums", color: strong ? C.gold : C.ivory, flexShrink: 0 }}>{b.total.toFixed(1)}</span>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
            <p style={{ color: C.muted, fontSize: "var(--font-label)", margin: "0.75rem 0 0", lineHeight: 1.5 }}>
              {hi ? <>भाव-संधियाँ श्रीपति पद्धति से निकली हैं। भाव बल में भाव-स्वामी का षड्बल, दिशा और प्राप्त दृष्टियाँ शामिल हैं। सबसे प्रबल भाव: <span style={{ color: C.gold }}>H{r.bhava.strongest}</span> · सबसे निर्बल: <span style={{ color: C.sindoor }}>H{r.bhava.weakest}</span>।</> : <>Cusps use the Sripati method (Lagna and Midheaven as 1st & 10th bhava-madhya, intermediate cusps trisected). Bhava Bala is led by each house lord's Shadbala, adjusted for the bhava's directional fitness and the aspects it receives. Strongest house: <span style={{ color: C.gold }}>H{r.bhava.strongest}</span> · weakest: <span style={{ color: C.sindoor }}>H{r.bhava.weakest}</span>.</>}
            </p>

            {/* ashtakavarga */}
            {showTechnical && <>
            <Eyebrow id="av" deva="अष्टकवर्ग" en="Ashtakavarga" />
            <div className="rise" style={{ ...card, padding: "1.25rem 0.875rem 1rem" }}>
              <DiamondChart
                title={hi ? "सर्वाष्टकवर्ग · भाववार बिंदु" : "Sarvashtakavarga · bindus by house"}
                ascSign={r.ascSign}
                houseOfPlanet={Array.from({ length: 12 }, (_, h) => {
                  const v = r.av.sav[(r.ascSign + h) % 12];
                  return { label: String(v), house: h + 1, color: v >= 30 ? "var(--good)" : v <= 24 ? "var(--bad)" : C.ivory };
                })}
                gold={C.gold} ivory={C.ivory} muted={C.muted} sindoor={C.sindoor}
              />
              <p style={{ textAlign: "center", color: C.muted, fontSize: "var(--font-label)", margin: "0.5rem 0 0" }}>
                <span style={{ color: "var(--good)" }}>30+</span> {hi ? "प्रबल" : "strong"} · 25–29 {hi ? "औसत" : "average"} · <span style={{ color: "var(--bad)" }}>≤24</span> {hi ? "सहयोग अपेक्षित · कुल 337 — अधिक बिंदु वाले भावों में गोचर सामान्यतः बेहतर फल देते हैं" : "needs support · 337 total — transits through high-bindu houses tend to give better results"}
              </p>
            </div>
            <div className="rise2" style={{ ...card, padding: "0.5rem 1.125rem 0.75rem", overflowX: "auto", marginTop: "0.75rem" }}>
              <table style={{ minWidth: "38rem", borderCollapse: "separate", borderSpacing: 0 }}>
                <thead>
                  <tr><th style={STICKY_COL}>{hi ? "ग्रह" : "Graha"}</th>{SIGN_SHORT_EN.map((_, i) => <th key={i} style={{ textAlign: "center", whiteSpace: "nowrap" }}>{signShort(lang, i)}</th>)}<th style={{ textAlign: "center" }}>Σ</th></tr>
                </thead>
                <tbody>
                  {["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"].map((p) => (
                    <tr key={p}>
                      <td style={{ ...STICKY_COL, whiteSpace: "nowrap" }}>
                        <span style={{ display: "inline-block", width: "0.4375rem", height: "0.4375rem", borderRadius: "0.25rem", background: PLANET_COLOR[p], marginRight: "0.5rem" }} />{PLANET_GLYPH[p]}
                      </td>
                      {r.av.bav[p].map((v, i) => (
                        <td key={i} style={{ textAlign: "center", fontVariantNumeric: "tabular-nums", color: i === r.rows.find((q) => q.name === p).sign ? C.gold : C.ivory, fontWeight: i === r.rows.find((q) => q.name === p).sign ? 600 : 400 }}>{v}</td>
                      ))}
                      <td style={{ textAlign: "center", color: C.muted }}>{r.av.bav[p].reduce((x, y) => x + y, 0)}</td>
                    </tr>
                  ))}
                  <tr>
                    <td style={{ ...STICKY_COL, color: C.gold, fontWeight: 600 }}>{hi ? "सर्वाष्टक" : "SAV"}</td>
                    {r.av.sav.map((v, i) => <td key={i} style={{ textAlign: "center", color: C.gold, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{v}</td>)}
                    <td style={{ textAlign: "center", color: C.gold, fontWeight: 600 }}>337</td>
                  </tr>
                </tbody>
              </table>
              <p style={{ color: C.muted, fontSize: "var(--font-label)", margin: "0.625rem 0 0.25rem" }}>{hi ? "सुनहरा खाना ग्रह की अपनी राशि दर्शाता है। भिन्नाष्टकवर्ग की हर पंक्ति राशि अनुसार उस ग्रह के बिंदु दिखाती है।" : "Gold cell marks each graha's own sign. Bhinnashtakavarga rows show every planet's bindus per sign."}</p>
            </div>

            {/* arudha padas */}
            </>}
            <Eyebrow id="arudha" deva="आरूढ पद" en="Arudha padas" />
            <div style={{ ...card, padding: "0.75rem 1rem", marginBottom: "0.75rem", background: "var(--surface-raised)", borderLeft: `0.25rem solid var(--accent)` }}>
              <p style={{ margin: 0, fontSize: "var(--font-small)", lineHeight: 1.6, color: C.ivory }}>
                {hi ? <>आरूढ़ पद “लोगों को क्या दिखाई देता है” बताते हैं — भीतर की सच्चाई नहीं। <strong style={{ color: C.gold }}>आरूढ़ लग्न</strong> सार्वजनिक छवि है, और <strong style={{ color: C.gold }}>उपपद</strong> विवाह/साथी की सामाजिक छवि को दिखाता है।</> : <>Arudha padas show “how life appears to others,” not the inner truth. <strong style={{ color: C.gold }}>Arudha Lagna</strong> is public image, while <strong style={{ color: C.gold }}>Upapada</strong> shows the visible/social face of marriage and partner matters.</>}
              </p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "0.75rem" }}>
              {r.arudhas.map((a, i) => {
                const ARUDHA_MEAN = hi ? ["दिखाई देने वाली छवि और प्रतिष्ठा", "धन और वाणी", "भाई-बहन और साहस", "घर और सुख", "संतान और सृजन", "सेवा और संघर्ष", "साझेदारी", "आयु और परिवर्तन", "धर्म और भाग्य", "कर्म और प्रतिष्ठा", "लाभ और संबंध-जाल", "विवाह और जीवनसाथी"] : ["perceived image & status", "wealth & speech", "siblings & courage", "home & comforts", "children & creativity", "service & conflicts", "partnerships", "longevity & change", "dharma & fortune", "career & status", "gains & networks", "marriage & spouse"];
                const special = a.h === 1 ? "AL" : a.h === 12 ? "UL" : a.h === 7 ? "A7" : null;
                const hot = a.h === 1 || a.h === 12;
                return (
                  <div key={a.h} className="rise" style={{ ...card, padding: "0.75rem 0.875rem", border: `0.0625rem solid ${hot ? C.gold : C.line}` }}>
                    <div style={{ ...T.label, color: hot ? C.gold : C.muted, marginBottom: "0.3125rem" }}>
                      {a.h === 1 ? (hi ? "आरूढ़ लग्न" : "Arudha Lagna") : a.h === 12 ? (hi ? "उपपद" : "Upapada") : `A${a.h}`}{special && a.h !== 1 && a.h !== 12 ? "" : ""}
                    </div>
                    <div style={{ fontFamily: "var(--font-display-family)", fontSize: "var(--font-title)", color: hot ? C.gold : C.ivory }}>{signLabel(lang, SIGNS[a.sign])}</div>
                    <div style={{ color: C.muted, fontSize: "var(--font-label)", marginTop: "0.25rem" }}>{ARUDHA_MEAN[i]}</div>
                  </div>
                );
              })}
            </div>

            {/* doshas — Kala Sarpa, Pitra, Papa. Answer-first, non-fatalistic. */}
            <Eyebrow id="doshas" deva="दोष विश्लेषण" en="Dosha analysis" />
            {(() => {
              const ksa = kalaSarpaFromRows(r.rows, r.ascSign);
              const pit = pitraDoshaFromRows(r.rows, r.ascSign);
              const papa = papaCount(r);
              const gradeHi = { low: "न्यून", moderate: "मध्यम", high: "उच्च" };
              const ksAnswer = ksa.full
                ? (hi ? `पूर्ण ${ksa.typeHi} काल सर्प (राहु ${ksa.rahuHouse}वें भाव)` : `Full ${ksa.typeEn} Kala Sarpa (Rahu in house ${ksa.rahuHouse})`)
                : ksa.partial
                  ? (hi ? `आंशिक रचना · ${ksa.enclosed}/7 ग्रह घिरे` : `Partial pattern · ${ksa.enclosed}/7 enclosed`)
                  : (hi ? `पूर्ण रचना नहीं · ${ksa.enclosed}/7 ग्रह एक ओर` : `Not a full pattern · ${ksa.enclosed}/7 on one side`);
              const pitAnswer = pit.count === 0
                ? (hi ? "कोई पितृ दोष संकेत नहीं" : "No indications found")
                : (hi ? `${pit.count} संकेत मिले` : `${pit.count} indication${pit.count > 1 ? "s" : ""}`);
              const cards = [
                { id: "kala-sarpa", head: hi ? "काल सर्प" : "Kala Sarpa", answer: ksAnswer,
                  detail: hi ? `${ksa.typeHi} · ${ksa.areaHi}` : `${ksa.typeEn} · ${ksa.areaEn}`,
                  hot: ksa.full || ksa.partial },
                { id: "pitra-dosha", head: hi ? "पितृ दोष" : "Pitra Dosha", answer: pitAnswer,
                  detail: pit.count ? pit.checks.filter((c) => c.fired).map((c) => hi ? c.hi : c.en).join(" · ") : (hi ? "सूर्य व नवम भाव आधारित जाँच" : "Sun & 9th-house based checks"),
                  hot: pit.count >= 2 },
                { id: "papa-dosha", head: hi ? "पाप दोष" : "Papa Dosha", answer: hi ? `भार ${papa.total}/15 · ${gradeHi[papa.grade]}` : `Load ${papa.total}/15 · ${papa.grade}`,
                  detail: papa.byRef.map((rr) => `${hi ? { lagna: "लग्न", moon: "चन्द्र", venus: "शुक्र" }[rr.ref] : rr.ref}: ${rr.points}`).join(" · "),
                  hot: papa.grade === "high" },
              ];
              return (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "0.75rem" }}>
                    {cards.map((cd) => (
                      <div key={cd.id} className="rise" style={{ ...card, padding: "0.875rem 1rem", border: `0.0625rem solid ${cd.hot ? C.gold : C.line}` }}>
                        <div style={{ ...T.label, color: cd.hot ? C.gold : C.muted, marginBottom: "0.375rem" }}>{cd.head}</div>
                        <div style={{ fontFamily: "var(--font-display-family)", fontSize: "var(--font-title)", color: cd.hot ? C.gold : C.ivory, lineHeight: 1.35 }}>{cd.answer}</div>
                        <div style={{ color: C.muted, fontSize: "var(--font-label)", marginTop: "0.375rem", lineHeight: 1.5 }}>{cd.detail}</div>
                        <a href={utilityHref(`/calculator/${cd.id}`, lang, place)} style={{ display: "inline-block", marginTop: "0.5rem", fontSize: "var(--font-label)", color: C.gold, textDecoration: "none" }}>
                          {hi ? "विस्तृत पृष्ठ →" : "Full page →"}
                        </a>
                      </div>
                    ))}
                  </div>
                  <p style={{ margin: "0.625rem 0.125rem 0", color: C.muted, fontSize: "var(--font-small)", lineHeight: 1.6 }}>
                    {hi
                      ? "ये पारम्परिक व्याख्यात्मक रचनाएँ हैं, स्पष्ट नियमों के साथ दिखाई गई हैं—किसी अनिष्ट या शाप की भविष्यवाणी नहीं। परम्पराएँ भिन्न होती हैं; किसी योग्य ज्योतिषी से परामर्श करें।"
                      : "These are traditional interpretive patterns shown with the exact rule that fired — not a prediction of harm or a curse. Traditions differ; please consult a qualified jyotishi."}
                  </p>
                </>
              );
            })()}

            {/* dasha */}
            <Eyebrow id="rectify" deva="जन्म समय शोधन" en="Birth-time rectification" />
            <RectifyModule form={chartContext?.form || form} place={chartContext?.place || place} ayanamsa={chartContext?.ayanamsa || ayanamsa} C={C} card={card} lang={lang} />

            <Eyebrow id="bnn" deva="भृगु नन्दी नाडी" en="Bhrigu Nandi Nadi · lagneless" />
            <BNNModule bnn={r.bnn} rows={r.rows} tz={r.tz} C={C} card={card} lang={lang} />

            <Eyebrow id="bhrigu" deva="भृगु चक्र · सरल पद्धति" en="Bhrigu Chakra & Saral Paddhati" />
            <BhriguModule rows={r.rows} ascSign={r.ascSign} birthMs={r.birthMs} tz={r.tz} C={C} card={card} lang={lang} />

            <Eyebrow id="dasha" deva="विंशोत्तरी दशा" en="Vimshottari dasha · maha to prana" />
            <div className="rise" style={{ ...card, padding: "0.5rem 1.125rem 1rem", overflowX: "auto" }}>
              <table>
                <thead><tr><th>{hi ? "स्वामी" : "Lord"}</th><th>{hi ? "आरम्भ" : "From"}</th><th>{hi ? "अंत" : "To"}</th><th>{hi ? "वर्ष" : "Years"}</th></tr></thead>
                <tbody>
                  {r.dashas.map((dsh) => {
                    const isNow = r.current && dsh.lord === r.current.lord && dsh.start === r.current.start;
                    return (
                      <tr key={dsh.start} style={isNow ? { background: "var(--surface-hover)" } : null}>
                        <td style={{ color: isNow ? C.gold : C.ivory, fontWeight: isNow ? 600 : 400 }}>
                          {planetName(lang, dsh.lord)}{isNow && (hi ? " · वर्तमान" : " · current")}
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
                      <div style={{ margin: "1rem 0.125rem 0.25rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--font-micro)", color: C.muted, letterSpacing: ".14em", textTransform: "uppercase", marginBottom: "0.4375rem" }}>
                          <span>{planetName(lang, r.current.lord)} {hi ? "महादशा" : "mahadasha"}</span>
                          <span style={{ color: C.gold }}>{pct.toFixed(0)}% {hi ? "पूर्ण" : "elapsed"}</span>
                        </div>
                        <div style={{ height: "0.375rem", background: "var(--surface-sunken)", borderRadius: "0.1875rem", overflow: "hidden", border: `0.0625rem solid ${C.line}` }}>
                          <div style={{ width: `${pct}%`, height: "100%", background: `linear-gradient(90deg, ${C.gold}, var(--accent-strong))`, borderRadius: "0.1875rem" }} />
                        </div>
                      </div>
                    );
                  })()}
                  <p style={{ fontSize: "var(--font-body)", lineHeight: 1.6, color: C.ivory, margin: "1rem 0 0.625rem" }}>
                    {hi ? <>अभी <span style={{ color: C.gold }}>{planetName(lang, r.current.lord)} महादशा</span> चल रही है—यह अवधि उस ग्रह के कारकत्व, स्थिति और स्वामित्व वाले भावों को प्रमुख बनाती है।</> : <>The native runs <span style={{ color: C.gold }}>{planetName(lang, r.current.lord)} mahadasha</span> — a period classically associated with {DASHA_NOTE[r.current.lord]}.</>}
                  </p>
                  {r.curAntar && (
                    <div style={{ margin: "1.125rem 0 0.375rem", padding: "0.8125rem 0.875rem", borderRadius: "0.625rem", background: "var(--surface-hover)", border: `0.0625rem solid ${C.line}` }}>
                      <div style={{ ...T.label, color: C.muted, marginBottom: "0.5625rem" }}>{hi ? "अभी चल रहा क्रम · पाँचों स्तर" : "Running now · all five levels"}</div>
                      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.25rem 0.375rem" }}>
                        {[[hi ? "महा" : "Maha", r.current.lord], [hi ? "अंतर" : "Antar", r.curAntar.lord], [hi ? "प्रत्यंतर" : "Pratyantar", r.curPratya && r.curPratya.lord], [hi ? "सूक्ष्म" : "Sookshma", r.curSookshma && r.curSookshma.lord], [hi ? "प्राण" : "Prana", r.curPrana && r.curPrana.lord]].map(([lvl, lord], i) =>
                          lord ? (
                            <React.Fragment key={lvl}>
                              {i > 0 && <span style={{ color: C.line, fontSize: "var(--font-small)" }}>›</span>}
                              <span style={{ display: "inline-flex", flexDirection: "column", lineHeight: 1.25 }}>
                                <span style={{ fontSize: "var(--font-micro)", letterSpacing: ".1em", textTransform: "uppercase", color: C.muted }}>{lvl}</span>
                                <span style={{ fontFamily: "var(--font-display-family)", fontSize: "var(--font-body)", color: C.gold }}>{planetName(lang, lord)}</span>
                              </span>
                            </React.Fragment>
                          ) : null
                        )}
                      </div>
                      {r.curPrana && (
                        <div style={{ fontSize: "var(--font-label)", color: C.muted, marginTop: "0.5625rem" }}>
                          {hi ? "वर्तमान प्राण" : "Current prana"}: {planetName(lang, r.curPrana.lord)} · {fmtDateT(r.curPrana.start, r.tz, true)} – {fmtDateT(r.curPrana.end, r.tz, true)}
                        </div>
                      )}
                    </div>
                  )}
                  <div style={{ ...T.label, color: C.muted, margin: "1rem 0 0.25rem" }}>
                    {planetName(lang, r.current.lord)} {hi ? "के भीतर अंतरदशाएँ — आगे के स्तर खोलने के लिए किसी अवधि को दबाएँ" : "Antardashas — tap any period to drill down"}
                  </div>
                  <DashaTree periods={r.antars} level={0} now={Date.now()} openD={openD} toggle={toggleD} C={C} tz={r.tz} lang={lang} />
                </>
              )}
            </div>

            {/* marriage timing — supportive Vimshottari windows, heavily qualified */}
            <Eyebrow id="marriage" deva="विवाह — सम्भावित समय" en="Marriage — supportive timing" />
            {(() => {
              const mw = marriageWindows(r);
              const fmtY = (t) => new Date(t + r.tz * 3600000).toLocaleDateString(hi ? "hi-IN" : "en-US", { month: "short", year: "numeric", timeZone: "UTC" });
              return (
                <div className="rise" style={{ ...card, padding: "1rem 1.25rem" }}>
                  <p style={{ fontSize: "var(--font-small)", lineHeight: 1.6, color: C.ivory, margin: "0 0 0.75rem" }}>
                    {hi
                      ? <>विवाह के कारक — शुक्र व गुरु, सप्तम भाव का स्वामी (<strong>{planetName(lang, mw.seventhLord)}</strong>){mw.occ7.length ? <> तथा सप्तम में स्थित ग्रह</> : null} — जिन दशा-अवधियों में सक्रिय होते हैं, परम्परा उन्हें विवाह हेतु अनुकूल मानती है।</>
                      : <>Periods run by the marriage significators — Venus &amp; Jupiter, the 7th lord (<strong>{planetName(lang, mw.seventhLord)}</strong>){mw.occ7.length ? <> and planets in the 7th</> : null} — are traditionally seen as supportive for marriage.</>}
                  </p>
                  {mw.windows.length === 0 ? (
                    <p style={{ color: C.muted, fontSize: "var(--font-small)" }}>{hi ? "आगामी बीस वर्षों में कोई स्पष्ट अनुकूल अवधि नहीं मिली।" : "No clearly supportive window found in the next twenty years."}</p>
                  ) : (
                    <div style={{ display: "grid", gap: "0.5rem" }}>
                      {mw.windows.map((w, i) => (
                        <div key={i} style={{ display: "flex", gap: "0.75rem", alignItems: "baseline", padding: "0.5rem 0.125rem", borderBottom: "0.0625rem solid var(--line-soft)" }}>
                          <span style={{ color: C.gold, fontSize: "var(--font-small)", minWidth: "8rem", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>{fmtY(w.start)} – {fmtY(w.end)}</span>
                          <span style={{ fontSize: "var(--font-small)", color: C.ivory, flex: 1 }}>{hi ? `${planetName(lang, w.maha)} / ${planetName(lang, w.antar)} दशा` : `${planetName(lang, w.maha)} / ${planetName(lang, w.antar)} dasha`}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <p style={{ color: C.muted, fontSize: "var(--font-label)", marginTop: "0.75rem", lineHeight: 1.55 }}>
                    {hi ? "यह भविष्यवाणी नहीं है। विवाह का वास्तविक समय गोचर (विशेषतः गुरु), नवांश, आयु, व्यक्तिगत इच्छा और अनेक कारकों पर निर्भर करता है। इसे किसी योग्य ज्योतिषी से पूरी कुंडली सहित समझें।" : "This is not a prediction. Actual timing depends on transits (especially Jupiter), the navamsa, age, personal choice and many other factors. Read it with the full chart and a qualified astrologer."}
                  </p>
                </div>
              );
            })()}

            {/* panchang */}
            <Eyebrow id="birth-panchang" deva="पञ्चाङ्ग" en="Birth panchang" />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "0.75rem" }}>
              {[
                [hi ? "वार" : "Vara", r.panchang.weekday],
                [hi ? "तिथि" : "Tithi", `${r.panchang.paksha} ${r.panchang.tithiName}`],
                [hi ? "नक्षत्र" : "Nakshatra", r.panchang.nak],
                [hi ? "योग" : "Yoga", r.panchang.yoga],
                [hi ? "करण" : "Karana", r.panchang.karana],
              ].map(([k, v]) => (
                <div key={k} style={{ ...card, padding: "0.875rem 1rem" }}>
                  <div style={{ ...T.label, color: C.muted, marginBottom: "0.375rem" }}>{k}</div>
                  <div style={{ fontSize: "var(--font-body)" }}>{v}</div>
                </div>
              ))}
            </div>

          </div>
      )}
    </>
  );
}
