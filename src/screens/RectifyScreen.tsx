/* Birth-time rectification UI — pure extraction (SPLIT-UI-JYOTISH-03). Wire deferred. */

import React, { useState, useMemo, useEffect } from "react";
import { T } from "../components/ui-style-contract";
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
  const lordColor = { Sun: "var(--bad)", Moon: "color-mix(in srgb, #5B7Fb0, var(--ink) 26%)", Mars: "color-mix(in srgb, #B23B2E, var(--ink) 26%)", Mercury: "var(--good)", Jupiter: "var(--accent)", Venus: "color-mix(in srgb, #9A5BA3, var(--ink) 26%)", Saturn: "color-mix(in srgb, #52606D, var(--ink) 26%)", Rahu: "color-mix(in srgb, #6B4E8A, var(--ink) 26%)", Ketu: "color-mix(in srgb, #7A6A52, var(--ink) 26%)" };
  const HOUSES = [[7, hi ? "विवाह" : "Marriage"], [5, hi ? "संतान जन्म" : "Childbirth"], [10, hi ? "नई नौकरी / करियर" : "New job / career"], [4, hi ? "संपत्ति / घर" : "Property / home"], [12, hi ? "विदेश गमन" : "Foreign move"], [9, hi ? "उच्च शिक्षा / पिता" : "Higher education / father"], [2, hi ? "धन / पारिवारिक घटना" : "Wealth / family event"], [6, hi ? "बीमारी / शल्यक्रिया" : "Illness / surgery"], [8, hi ? "शोक / आकस्मिक परिवर्तन" : "Bereavement / upheaval"]];
  const startMaha = dash.tl[0];
  const startBal = (startMaha.end - dash.birthMs) / YEAR;

  const addEvent = () => { if (!evDate) return; setEvents([...events, { id: Date.now(), date: evDate, house: evHouse }].sort((a, b) => a.date.localeCompare(b.date))); setEvDate(""); };
  const evRun = (e) => { const [ey, em, ed] = e.date.split("-").map(Number); const ms = Date.UTC(ey, em - 1, ed) - tz * 3600000; return runDashaAt(dash.tl, ms); };
  const houseLord = (h) => SIGN_LORD[(mk.sign + h - 1) % 12];

  const Marker = ({ label, children, color }) => (
    <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem", padding: "0.5rem 0.125rem", borderBottom: "0.0625rem solid var(--line-soft)", fontSize: "var(--font-body)", alignItems: "baseline" }}>
      <span style={{ ...T.label, color: C.muted }}>{label}</span>
      <span style={{ textAlign: "right", color: color || C.ivory }}>{children}</span>
    </div>
  );

  return (
    <div>
      <p style={{ color: C.muted, fontSize: "var(--font-small)", lineHeight: 1.55, margin: "0 0 0.875rem" }}>
        {hi ? "जन्म समय को आगे-पीछे करके देखें कि कौन-से संकेत बदलते हैं। लग्न लगभग हर 4 मिनट में 1° बदलता है; नवांश (D-9), षष्ट्यांश (D-60) और केपी उप-स्वामी अधिक तेजी से बदलते हैं। ज्ञात जीवन-घटनाएँ जोड़कर देखें कि कौन-सा संभावित समय उपयुक्त दशा से मेल खाता है। यह निर्णय में सहायता का उपकरण है, स्वतः अंतिम उत्तर नहीं।" : "Move the birth time and watch what's sensitive to it. The lagna shifts ~1° every 4 minutes; the navamsa (D-9) and shashtiamsa (D-60) ascendants and the KP sub-lord move faster — these are what a rectifier narrows by. Add known life events below to see which candidate time lands them on a fitting dasha. This is an instrument for your judgement, not an automatic answer."}
      </p>

      {/* controls */}
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "0.875rem" }}>
        <div>
          <div style={{ ...T.label, color: C.muted, marginBottom: "0.3125rem" }}>{hi ? "समय-सीमा" : "Window"}</div>
          <div style={{ display: "flex", gap: "0.3125rem" }}>{[15, 30, 60].map((w) => <button key={w} onClick={() => setHalfWin(w)} style={{ padding: "0.3125rem 0.75rem", borderRadius: "0.4375rem", fontFamily: "var(--font-display-family)", fontSize: "var(--font-small)", cursor: "pointer", border: `0.0625rem solid ${halfWin === w ? C.gold : C.line}`, background: halfWin === w ? "var(--accent-soft)" : "transparent", color: halfWin === w ? C.gold : C.muted }}>±{w}m</button>)}</div>
        </div>
        <div>
          <div style={{ ...T.label, color: C.muted, marginBottom: "0.3125rem" }}>{hi ? "चरण" : "Step"}</div>
          <div style={{ display: "flex", gap: "0.3125rem" }}>{[1, 2, 4].map((st) => <button key={st} onClick={() => setStepMin(st)} style={{ padding: "0.3125rem 0.75rem", borderRadius: "0.4375rem", fontFamily: "var(--font-display-family)", fontSize: "var(--font-small)", cursor: "pointer", border: `0.0625rem solid ${stepMin === st ? C.gold : C.line}`, background: stepMin === st ? "var(--accent-soft)" : "transparent", color: stepMin === st ? C.gold : C.muted }}>{st}m</button>)}</div>
        </div>
      </div>

      {/* slider + selected markers */}
      <div style={{ ...card, padding: "1rem 1.125rem", borderTop: `0.1875rem solid ${C.gold}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.625rem" }}>
          <span style={{ fontFamily: "var(--font-display-family)", fontSize: "var(--font-display)", color: C.gold, fontVariantNumeric: "tabular-nums" }}>{fmtMin(selC)}</span>
          <span style={{ fontSize: "var(--font-label)", color: C.muted }}>{hi ? "संभावित जन्म समय" : "candidate birth time"} {Math.abs(selC - centerMin) < 0.1 ? (hi ? "(दर्ज समय)" : "(as entered)") : (selC > centerMin ? "+" : "−") + fmtMin(Math.abs(selC - centerMin)).slice(3) + (hi ? " मिनट" : " min")}</span>
        </div>
        <input type="range" min={lo} max={hiMin} step={0.25} value={selC} onChange={(e) => setSel(+e.target.value)} style={{ width: "100%", accentColor: C.gold, marginBottom: "0.875rem" }} />
        <Marker label={hi ? "लग्न" : "Lagna"} color={C.ivory}>{SIGN_SHORT[mk.sign]} {dms(mk.deg)} · {NAKSHATRAS[mk.nak]} {hi ? "पाद" : "pada"} {mk.pada}</Marker>
        <Marker label={hi ? "नवांश D-9 लग्न" : "Navamsa D-9 lagna"} color={C.gold}>{SIGN_SHORT[mk.d9]}</Marker>
        <Marker label={hi ? "षष्ट्यांश D-60 लग्न" : "Shashtiamsa D-60 lagna"} color={C.gold}>{SIGN_SHORT[mk.d60]}</Marker>
        <Marker label={hi ? "केपी लग्न उप-स्वामी" : "KP ascendant sub-lord"} color={lordColor[mk.subLord]}>{mk.subLord}</Marker>
        <Marker label={hi ? "आरंभिक महादशा" : "Starting mahadasha"} color={lordColor[startMaha.lord]}>{startMaha.lord} · {startBal.toFixed(2)} {hi ? "वर्ष शेष" : "yrs balance"}</Marker>
      </div>

      {/* sweep table */}
      <div style={{ ...T.label, color: C.muted, margin: `${T.s5} 0 ${T.s2}` }}>{hi ? "समय परीक्षण · बदलाव चिह्नित" : "Sweep · transitions highlighted"}</div>
      <div style={{ ...card, padding: "0.25rem 0.25rem", maxHeight: "22.5rem", overflowY: "auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "62px 1fr 46px 46px 64px", gap: "0.375rem", padding: "0.4375rem 0.75rem", ...T.label, color: C.muted, position: "sticky", top: 0, background: "var(--surface-raised)" }}>
          <span>{hi ? "समय" : "Time"}</span><span>{hi ? "लग्न" : "Lagna"}</span><span>D9</span><span>D60</span><span>{hi ? "उप" : "Sub"}</span>
        </div>
        {sweep.map((r, i) => {
          const isSel = Math.abs(r.totalMin - selC) <= stepMin / 2;
          const ch = (on, val, key) => <span style={{ color: on ? C.gold : C.muted, fontWeight: on ? 600 : 400 }}>{val}{on && key !== "lagna" ? " ←" : ""}</span>;
          return (
            <div key={i} onClick={() => setSel(r.totalMin)} style={{ display: "grid", gridTemplateColumns: "62px 1fr 46px 46px 64px", gap: "0.375rem", padding: "0.375rem 0.75rem", borderTop: i ? "0.0625rem solid var(--line-soft)" : "none", fontSize: "var(--font-small)", cursor: "pointer", background: isSel ? "var(--accent-soft)" : r.chSign ? "var(--bad-surface)" : "transparent", alignItems: "baseline", fontVariantNumeric: "tabular-nums" }}>
              <span style={{ color: isSel ? C.gold : C.ivory }}>{fmtMin(r.totalMin).slice(0, 5)}</span>
              <span style={{ color: r.chSign ? C.sindoor : C.ivory, fontWeight: r.chSign ? 600 : 400 }}>{SIGN_SHORT[r.sign]} {dms(r.deg)}{r.chSign ? " ⟵ sign" : ""}</span>
              {ch(r.chD9, SIGN_SHORT[r.d9])}{ch(r.chD60, SIGN_SHORT[r.d60])}{ch(r.chSub, r.subLord.slice(0, 3))}
            </div>
          );
        })}
      </div>

      {/* event anchors */}
      <div style={{ ...T.label, color: C.muted, margin: `${T.s5} 0 ${T.s2}` }}>{hi ? "जीवन-घटना आधार · दशा मिलान" : "Event anchors · dasha fit"}</div>
      <div style={{ ...card, padding: T.s4 }}>
        <div style={{ fontSize: "var(--font-label)", color: C.muted, marginBottom: "0.75rem", lineHeight: 1.5 }}>{hi ? "तिथि सहित जीवन-घटनाएँ जोड़ें। हर घटना के लिए चल रही महादशा–अंतर्दशा दिखाई जाएगी; ✓ बताता है कि वही ग्रह घटना-भाव का स्वामी भी है। कई स्वतंत्र घटनाओं में बना रहने वाला मेल समय को सीमित करने में सहायता करता है।" : "Add dated life events. For the candidate time above, each shows the running mahadasha–antardasha; a ✓ marks where that lord also rules the event's house. The fit that holds across all events points to the time."}</div>
        <div style={{ display: "flex", gap: "0.4375rem", flexWrap: "wrap", marginBottom: "0.875rem", alignItems: "center" }}>
          <input type="date" value={evDate} onChange={(e) => setEvDate(e.target.value)} style={{ padding: "0.5rem 0.625rem", borderRadius: "0.4375rem", border: `0.0625rem solid ${C.line}`, background: "var(--surface-sunken)", color: C.ivory, fontFamily: "var(--font-body-family)", fontSize: "var(--font-small)" }} />
          <select value={evHouse} onChange={(e) => setEvHouse(+e.target.value)} style={{ padding: "0.5rem 0.625rem", borderRadius: "0.4375rem", border: `0.0625rem solid ${C.line}`, background: "var(--surface-sunken)", color: C.ivory, fontFamily: "var(--font-body-family)", fontSize: "var(--font-small)" }}>
            {HOUSES.map(([h, lbl]) => <option key={h} value={h}>{lbl} ({h}H)</option>)}
          </select>
          <button onClick={addEvent} style={{ padding: "0.5rem 1rem", borderRadius: "0.4375rem", fontFamily: "var(--font-display-family)", fontSize: "var(--font-small)", cursor: "pointer", border: `0.0625rem solid ${C.gold}`, background: "var(--surface-hover)", color: C.gold }}>{hi ? "जोड़ें" : "Add"}</button>
        </div>
        {events.length === 0 ? <div style={{ fontSize: "var(--font-small)", color: C.muted, fontStyle: "italic" }}>{hi ? "अभी कोई घटना नहीं — विवाह, संतान जन्म या करियर परिवर्तन सामान्य आधार होते हैं।" : "No events yet — marriage, a child's birth, or a career change are the usual anchors."}</div> : (
          <div style={{ display: "grid", gap: "0.375rem" }}>
            {events.map((e) => {
              const rd = evRun(e), hl = houseLord(e.house);
              const hit = rd && (rd.maha === hl || rd.antar === hl);
              const lbl = (HOUSES.find(([h]) => h === e.house) || [e.house, (hi ? "भाव " : "House ") + e.house])[1];
              return (
                <div key={e.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.625rem", padding: "0.5rem 0.6875rem", border: `0.0625rem solid ${C.line}`, borderRadius: "0.5rem" }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontFamily: "var(--font-display-family)", fontSize: "var(--font-small)", color: C.ivory }}>{lbl} <span style={{ color: C.muted, fontSize: "var(--font-label)" }}>· {e.house}H (lord {hl})</span></div>
                    <div style={{ fontSize: "var(--font-label)", color: C.muted }}>{e.date}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0 }}>
                    {rd ? <span style={{ fontSize: "var(--font-small)", color: C.ivory }}><span style={{ color: lordColor[rd.maha] }}>{rd.maha}</span>–<span style={{ color: lordColor[rd.antar] }}>{rd.antar}</span></span> : <span style={{ color: C.muted, fontSize: "var(--font-label)" }}>—</span>}
                    {hit && <span style={{ fontSize: "var(--font-small)", color: "var(--good)" }} title={hi ? "दशा स्वामी घटना-भाव का भी स्वामी है" : "dasha lord rules the event house"}>✓</span>}
                    <button onClick={() => setEvents(events.filter((x) => x.id !== e.id))} style={{ padding: "0.1875rem 0.5rem", borderRadius: "0.375rem", fontSize: "var(--font-label)", cursor: "pointer", border: `0.0625rem solid ${C.line}`, background: "transparent", color: C.muted }}>✕</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <p style={{ color: C.muted, fontSize: "var(--font-label)", marginTop: "0.875rem", lineHeight: 1.55, fontStyle: "italic" }}>
        {hi ? "जन्म-समय शोधन केवल गणित नहीं, विवेकपूर्ण निर्णय है। ये संकेत और दशा-मेल संभावनाएँ घटाते हैं; किसी समय को सेकंड तक प्रमाणित नहीं करते। ✓ केवल यह जाँचता है कि चल रही दशा का स्वामी घटना-भाव का स्वामी भी है। भरोसा करने से पहले कई स्वतंत्र घटनाओं से पुष्टि करें।" : "Rectification is judgement, not arithmetic — these markers and dasha fits narrow the field; they don't certify a time to the second. The ✓ checks only whether a running dasha lord rules the event house; a full rectification also weighs antardasha lords' placements, transits over the natal lagna, and the navamsa. Treat this as a workbench, and confirm against several independent events before trusting a time."}
      </p>
    </div>
  );
}

export { RectifyModule };
