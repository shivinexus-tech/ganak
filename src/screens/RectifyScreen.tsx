/* Birth-time rectification UI — pure extraction (SPLIT-UI-JYOTISH-03). Wire deferred. */

import React, { useState, useMemo, useEffect } from "react";
import { T } from "../components/tokens";
import { fmtDateT } from "../components/format";
import { SIGN_SHORT } from "../data/chart-divisions";
import { SIGNS, NAKSHATRAS, zoneOffset, SIGN_LORD } from "../engine/panchang";
import { rectSweep, mahaTimelineAt, runDashaAt, VIM_LORDS, rectAtMin } from "../engine/dasha";

function RectifyModule({ form, place, ayanamsa, C, card, lang = "en" }) {
  const hi = lang === "hi";
  const [y, m, day] = (form.date || "1995-08-15").split("-").map(Number);
  const tz = (zoneOffset(place.zone, y, m, day)) ?? 5.5;
  const [hhB, miB] = (form.time || "06:30").split(":").map(Number);
  const centerMin = hhB * 60 + miB;
  const aya = ayanamsa || "lahiri";
  const [halfWin, setHalfWin] = useState(30);
  const [stepMin, setStepMin] = useState(4);
  const [sel, setSel] = useState(centerMin);
  const [events, setEvents] = useState([]);
  const [evDate, setEvDate] = useState("");
  const [evHouse, setEvHouse] = useState(7);
  useEffect(() => { setSel(centerMin); }, [centerMin]);

  const lo = centerMin - halfWin, hiMin = centerMin + halfWin;
  const selC = Math.max(lo, Math.min(hiMin, sel));
  const sweep = useMemo(() => rectSweep(y, m, day, tz, place.lat, place.lon, aya, centerMin, halfWin, stepMin), [y, m, day, tz, place.lat, place.lon, aya, centerMin, halfWin, stepMin]);
  const mk = useMemo(() => rectAtMin(y, m, day, tz, place.lat, place.lon, aya, selC), [y, m, day, tz, place.lat, place.lon, aya, selC]);
  const dash = useMemo(() => mahaTimelineAt(y, m, day, tz, selC, aya), [y, m, day, tz, selC, aya]);

  const YEAR = 365.25 * 86400000;
  const fmtMin = (t) => { const hh = Math.floor(t / 60), mm = Math.floor(t % 60), ss = Math.round((t - hh * 60 - mm) * 60); return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}:${String(Math.min(59, ss)).padStart(2, "0")}`; };
  const dms = (deg) => { const d0 = Math.floor(deg), m0 = Math.round((deg - d0) * 60); return `${d0}°${String(m0).padStart(2, "0")}'`; };
  const lordColor = { Sun: "#C2451E", Moon: "#5B7Fb0", Mars: "#B23B2E", Mercury: "#1F7A4D", Jupiter: "#A86A12", Venus: "#9A5BA3", Saturn: "#52606D", Rahu: "#6B4E8A", Ketu: "#7A6A52" };
  const HOUSES = [[7, hi ? "विवाह" : "Marriage"], [5, hi ? "संतान जन्म" : "Childbirth"], [10, hi ? "नई नौकरी / करियर" : "New job / career"], [4, hi ? "संपत्ति / घर" : "Property / home"], [12, hi ? "विदेश गमन" : "Foreign move"], [9, hi ? "उच्च शिक्षा / पिता" : "Higher education / father"], [2, hi ? "धन / पारिवारिक घटना" : "Wealth / family event"], [6, hi ? "बीमारी / शल्यक्रिया" : "Illness / surgery"], [8, hi ? "शोक / आकस्मिक परिवर्तन" : "Bereavement / upheaval"]];
  const startMaha = dash.tl[0];
  const startBal = (startMaha.end - dash.birthMs) / YEAR;

  const addEvent = () => { if (!evDate) return; setEvents([...events, { id: Date.now(), date: evDate, house: evHouse }].sort((a, b) => a.date.localeCompare(b.date))); setEvDate(""); };
  const evRun = (e) => { const [ey, em, ed] = e.date.split("-").map(Number); const ms = Date.UTC(ey, em - 1, ed) - tz * 3600000; return runDashaAt(dash.tl, ms); };
  const houseLord = (h) => SIGN_LORD[(mk.sign + h - 1) % 12];

  const Marker = ({ label, children, color }) => (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "8px 2px", borderBottom: "1px solid #F1EADA", fontSize: 14, alignItems: "baseline" }}>
      <span style={{ ...T.label, color: C.muted }}>{label}</span>
      <span style={{ textAlign: "right", color: color || C.ivory }}>{children}</span>
    </div>
  );

  return (
    <div>
      <p style={{ color: C.muted, fontSize: 12.5, lineHeight: 1.55, margin: "0 0 14px" }}>
        {hi ? "जन्म समय को आगे-पीछे करके देखें कि कौन-से संकेत बदलते हैं। लग्न लगभग हर 4 मिनट में 1° बदलता है; नवांश (D-9), षष्ट्यांश (D-60) और केपी उप-स्वामी अधिक तेजी से बदलते हैं। ज्ञात जीवन-घटनाएँ जोड़कर देखें कि कौन-सा संभावित समय उपयुक्त दशा से मेल खाता है। यह निर्णय में सहायता का उपकरण है, स्वतः अंतिम उत्तर नहीं।" : "Move the birth time and watch what's sensitive to it. The lagna shifts ~1° every 4 minutes; the navamsa (D-9) and shashtiamsa (D-60) ascendants and the KP sub-lord move faster — these are what a rectifier narrows by. Add known life events below to see which candidate time lands them on a fitting dasha. This is an instrument for your judgement, not an automatic answer."}
      </p>

      {/* controls */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 14 }}>
        <div>
          <div style={{ ...T.label, color: C.muted, marginBottom: 5 }}>{hi ? "समय-सीमा" : "Window"}</div>
          <div style={{ display: "flex", gap: 5 }}>{[15, 30, 60].map((w) => <button key={w} onClick={() => setHalfWin(w)} style={{ padding: "5px 12px", borderRadius: 7, fontFamily: "Eczar, serif", fontSize: 13, cursor: "pointer", border: `1px solid ${halfWin === w ? C.gold : C.line}`, background: halfWin === w ? "rgba(168,106,18,.1)" : "transparent", color: halfWin === w ? C.gold : C.muted }}>±{w}m</button>)}</div>
        </div>
        <div>
          <div style={{ ...T.label, color: C.muted, marginBottom: 5 }}>{hi ? "चरण" : "Step"}</div>
          <div style={{ display: "flex", gap: 5 }}>{[1, 2, 4].map((st) => <button key={st} onClick={() => setStepMin(st)} style={{ padding: "5px 12px", borderRadius: 7, fontFamily: "Eczar, serif", fontSize: 13, cursor: "pointer", border: `1px solid ${stepMin === st ? C.gold : C.line}`, background: stepMin === st ? "rgba(168,106,18,.1)" : "transparent", color: stepMin === st ? C.gold : C.muted }}>{st}m</button>)}</div>
        </div>
      </div>

      {/* slider + selected markers */}
      <div style={{ ...card, padding: "16px 18px", borderTop: `3px solid ${C.gold}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
          <span style={{ fontFamily: "Eczar, serif", fontSize: 26, color: C.gold, fontVariantNumeric: "tabular-nums" }}>{fmtMin(selC)}</span>
          <span style={{ fontSize: 12, color: C.muted }}>{hi ? "संभावित जन्म समय" : "candidate birth time"} {Math.abs(selC - centerMin) < 0.1 ? (hi ? "(दर्ज समय)" : "(as entered)") : (selC > centerMin ? "+" : "−") + fmtMin(Math.abs(selC - centerMin)).slice(3) + (hi ? " मिनट" : " min")}</span>
        </div>
        <input type="range" min={lo} max={hiMin} step={0.25} value={selC} onChange={(e) => setSel(+e.target.value)} style={{ width: "100%", accentColor: C.gold, marginBottom: 14 }} />
        <Marker label={hi ? "लग्न" : "Lagna"} color={C.ivory}>{SIGN_SHORT[mk.sign]} {dms(mk.deg)} · {NAKSHATRAS[mk.nak]} {hi ? "पाद" : "pada"} {mk.pada}</Marker>
        <Marker label={hi ? "नवांश D-9 लग्न" : "Navamsa D-9 lagna"} color={C.gold}>{SIGN_SHORT[mk.d9]}</Marker>
        <Marker label={hi ? "षष्ट्यांश D-60 लग्न" : "Shashtiamsa D-60 lagna"} color={C.gold}>{SIGN_SHORT[mk.d60]}</Marker>
        <Marker label={hi ? "केपी लग्न उप-स्वामी" : "KP ascendant sub-lord"} color={lordColor[mk.subLord]}>{mk.subLord}</Marker>
        <Marker label={hi ? "आरंभिक महादशा" : "Starting mahadasha"} color={lordColor[startMaha.lord]}>{startMaha.lord} · {startBal.toFixed(2)} {hi ? "वर्ष शेष" : "yrs balance"}</Marker>
      </div>

      {/* sweep table */}
      <div style={{ ...T.label, color: C.muted, margin: `${T.s5}px 0 ${T.s2}px` }}>{hi ? "समय परीक्षण · बदलाव चिह्नित" : "Sweep · transitions highlighted"}</div>
      <div style={{ ...card, padding: "4px 4px", maxHeight: 360, overflowY: "auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "62px 1fr 46px 46px 64px", gap: 6, padding: "7px 12px", ...T.label, color: C.muted, position: "sticky", top: 0, background: "#FBF5E7" }}>
          <span>{hi ? "समय" : "Time"}</span><span>{hi ? "लग्न" : "Lagna"}</span><span>D9</span><span>D60</span><span>{hi ? "उप" : "Sub"}</span>
        </div>
        {sweep.map((r, i) => {
          const isSel = Math.abs(r.totalMin - selC) <= stepMin / 2;
          const ch = (on, val, key) => <span style={{ color: on ? C.gold : C.muted, fontWeight: on ? 600 : 400 }}>{val}{on && key !== "lagna" ? " ←" : ""}</span>;
          return (
            <div key={i} onClick={() => setSel(r.totalMin)} style={{ display: "grid", gridTemplateColumns: "62px 1fr 46px 46px 64px", gap: 6, padding: "6px 12px", borderTop: i ? "1px solid #EFE6D2" : "none", fontSize: 12.5, cursor: "pointer", background: isSel ? "rgba(168,106,18,.1)" : r.chSign ? "rgba(194,69,30,.06)" : "transparent", alignItems: "baseline", fontVariantNumeric: "tabular-nums" }}>
              <span style={{ color: isSel ? C.gold : C.ivory }}>{fmtMin(r.totalMin).slice(0, 5)}</span>
              <span style={{ color: r.chSign ? C.sindoor : C.ivory, fontWeight: r.chSign ? 600 : 400 }}>{SIGN_SHORT[r.sign]} {dms(r.deg)}{r.chSign ? " ⟵ sign" : ""}</span>
              {ch(r.chD9, SIGN_SHORT[r.d9])}{ch(r.chD60, SIGN_SHORT[r.d60])}{ch(r.chSub, r.subLord.slice(0, 3))}
            </div>
          );
        })}
      </div>

      {/* event anchors */}
      <div style={{ ...T.label, color: C.muted, margin: `${T.s5}px 0 ${T.s2}px` }}>{hi ? "जीवन-घटना आधार · दशा मिलान" : "Event anchors · dasha fit"}</div>
      <div style={{ ...card, padding: T.s4 }}>
        <div style={{ fontSize: 12, color: C.muted, marginBottom: 12, lineHeight: 1.5 }}>{hi ? "तिथि सहित जीवन-घटनाएँ जोड़ें। हर घटना के लिए चल रही महादशा–अंतर्दशा दिखाई जाएगी; ✓ बताता है कि वही ग्रह घटना-भाव का स्वामी भी है। कई स्वतंत्र घटनाओं में बना रहने वाला मेल समय को सीमित करने में सहायता करता है।" : "Add dated life events. For the candidate time above, each shows the running mahadasha–antardasha; a ✓ marks where that lord also rules the event's house. The fit that holds across all events points to the time."}</div>
        <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 14, alignItems: "center" }}>
          <input type="date" value={evDate} onChange={(e) => setEvDate(e.target.value)} style={{ padding: "8px 10px", borderRadius: 7, border: `1px solid ${C.line}`, background: "#FFFDF7", color: C.ivory, fontFamily: "Spectral, serif", fontSize: 13.5 }} />
          <select value={evHouse} onChange={(e) => setEvHouse(+e.target.value)} style={{ padding: "8px 10px", borderRadius: 7, border: `1px solid ${C.line}`, background: "#FFFDF7", color: C.ivory, fontFamily: "Spectral, serif", fontSize: 13.5 }}>
            {HOUSES.map(([h, lbl]) => <option key={h} value={h}>{lbl} ({h}H)</option>)}
          </select>
          <button onClick={addEvent} style={{ padding: "8px 16px", borderRadius: 7, fontFamily: "Eczar, serif", fontSize: 13.5, cursor: "pointer", border: `1px solid ${C.gold}`, background: "rgba(168,106,18,.08)", color: C.gold }}>{hi ? "जोड़ें" : "Add"}</button>
        </div>
        {events.length === 0 ? <div style={{ fontSize: 12.5, color: C.muted, fontStyle: "italic" }}>{hi ? "अभी कोई घटना नहीं — विवाह, संतान जन्म या करियर परिवर्तन सामान्य आधार होते हैं।" : "No events yet — marriage, a child's birth, or a career change are the usual anchors."}</div> : (
          <div style={{ display: "grid", gap: 6 }}>
            {events.map((e) => {
              const rd = evRun(e), hl = houseLord(e.house);
              const hit = rd && (rd.maha === hl || rd.antar === hl);
              const lbl = (HOUSES.find(([h]) => h === e.house) || [e.house, (hi ? "भाव " : "House ") + e.house])[1];
              return (
                <div key={e.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, padding: "8px 11px", border: `1px solid ${C.line}`, borderRadius: 8 }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontFamily: "Eczar, serif", fontSize: 13.5, color: C.ivory }}>{lbl} <span style={{ color: C.muted, fontSize: 12 }}>· {e.house}H (lord {hl})</span></div>
                    <div style={{ fontSize: 11.5, color: C.muted }}>{e.date}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                    {rd ? <span style={{ fontSize: 13, color: C.ivory }}><span style={{ color: lordColor[rd.maha] }}>{rd.maha}</span>–<span style={{ color: lordColor[rd.antar] }}>{rd.antar}</span></span> : <span style={{ color: C.muted, fontSize: 12 }}>—</span>}
                    {hit && <span style={{ fontSize: 13, color: "#1F7A4D" }} title={hi ? "दशा स्वामी घटना-भाव का भी स्वामी है" : "dasha lord rules the event house"}>✓</span>}
                    <button onClick={() => setEvents(events.filter((x) => x.id !== e.id))} style={{ padding: "3px 8px", borderRadius: 6, fontSize: 12, cursor: "pointer", border: `1px solid ${C.line}`, background: "transparent", color: C.muted }}>✕</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <p style={{ color: C.muted, fontSize: 11.5, marginTop: 14, lineHeight: 1.55, fontStyle: "italic" }}>
        {hi ? "जन्म-समय शोधन केवल गणित नहीं, विवेकपूर्ण निर्णय है। ये संकेत और दशा-मेल संभावनाएँ घटाते हैं; किसी समय को सेकंड तक प्रमाणित नहीं करते। ✓ केवल यह जाँचता है कि चल रही दशा का स्वामी घटना-भाव का स्वामी भी है। भरोसा करने से पहले कई स्वतंत्र घटनाओं से पुष्टि करें।" : "Rectification is judgement, not arithmetic — these markers and dasha fits narrow the field; they don't certify a time to the second. The ✓ checks only whether a running dasha lord rules the event house; a full rectification also weighs antardasha lords' placements, transits over the natal lagna, and the navamsa. Treat this as a workbench, and confirm against several independent events before trusting a time."}
      </p>
    </div>
  );
}

export { RectifyModule };
