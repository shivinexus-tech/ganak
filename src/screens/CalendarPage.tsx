/* Calendar page — pure extraction (SPLIT-UI-03f). Wire deferred. */

import React from "react";
import { T } from "../components/tokens";
import { fmtTime } from "../components/format";
import { tr, trN, obsLabel } from "../i18n";
import { FEST_NAME } from "../data/festival-meta";
import { zoneOffset } from "../engine/panchang";
import { scanPanchangCalendar } from "../engine/festivals";
import { searchUpcoming } from "../engine/search-upcoming";

function CalendarPage({ view, place, lang, onBack, C, card }) {
  const now = new Date();
  const tz = (zoneOffset(place.zone, now.getUTCFullYear(), now.getUTCMonth() + 1, now.getUTCDate())) ?? 5.5;
  const [q, setQ] = useState(view.type === "search" ? (view.q || "") : "");
  const MO = lang === "hi" ? ["जनवरी", "फ़रवरी", "मार्च", "अप्रैल", "मई", "जून", "जुलाई", "अगस्त", "सितंबर", "अक्तूबर", "नवंबर", "दिसंबर"] : ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const MOs = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const WD = lang === "hi" ? ["रवि", "सोम", "मंगल", "बुध", "गुरु", "शुक्र", "शनि"] : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const fmtFull = (ms) => { const d = new Date(ms + tz * 3600000); return `${WD[d.getUTCDay()]}, ${d.getUTCDate()} ${MOs[d.getUTCMonth()]} ${d.getUTCFullYear()}`; };

  const yearData = useMemo(() => {
    if (view.type !== "year") return null;
    const year = now.getUTCFullYear();
    const from = Date.UTC(year, 0, 1, 6) - tz * 3600000;
    const r = scanPanchangCalendar(from, tz, 366, 366, place);
    const all = [...r.festivals.map((f) => ({ ms: f.ms, kind: "festival", key: f.key })), ...r.fasts.map((f) => ({ ms: f.ms, kind: "fast", key: f.key }))]
      .filter((x) => new Date(x.ms + tz * 3600000).getUTCFullYear() === year).sort((a, b) => a.ms - b.ms);
    const byMonth = Array.from({ length: 12 }, () => []);
    for (const it of all) byMonth[new Date(it.ms + tz * 3600000).getUTCMonth()].push(it);
    return { year, byMonth };
  }, [view.type, tz, place]);

  const results = useMemo(() => view.type === "search" ? searchUpcoming(q, Date.now(), tz, 30, place) : null, [view.type, q, tz, place]);

  const labelOf = (it) => it.kind === "tithi"
    ? ((it.paksha ? (lang === "hi" ? (it.paksha === "Krishna" ? "कृष्ण " : "शुक्ल ") : it.paksha + " ") : "") + it.label)
    : (it.kind === "fast" ? obsLabel(lang, {key: it.key}) : trN(lang, FEST_NAME, it.key));

  const Row = ({ it, first }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 2px", borderTop: first ? "none" : `1px solid ${C.line}` }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: it.kind === "festival" ? C.gold : C.sindoor, flexShrink: 0 }} />
      <span style={{ flex: 1, fontFamily: T.serif, fontSize: T.fBody, color: C.ivory }}>{labelOf(it)}</span>
      <span style={{ fontSize: T.fSmall, color: C.gold, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>{fmtFull(it.ms)}</span>
    </div>
  );

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 60, background: C.bg, overflowY: "auto" }}>
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "0 18px 60px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, position: "sticky", top: 0, background: C.bg, padding: "14px 0 12px", zIndex: 2, borderBottom: `1px solid ${C.line}`, marginBottom: 18 }}>
          <button onClick={onBack} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "9px 15px", borderRadius: T.rMd, border: `1px solid ${C.line}`, background: C.panel, color: C.ivory, cursor: "pointer", fontFamily: T.serif, fontSize: T.fSmall }}>‹ {tr(lang, "backLabel")}</button>
          <span style={{ fontFamily: T.serif, fontSize: T.fHeading, color: C.gold }}>{view.type === "year" ? `${tr(lang, "calTitle")}${yearData ? " · " + yearData.year : ""}` : tr(lang, "searchTitle")}</span>
        </div>

        {view.type === "search" && (
          <div style={{ marginBottom: 20 }}>
            <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder={tr(lang, "searchPlaceholder")} style={{ width: "100%", boxSizing: "border-box", padding: "12px 15px", borderRadius: T.rMd, border: `1px solid ${C.line}`, background: C.panel, color: C.ivory, fontFamily: T.body, fontSize: T.fBody }} />
            <div style={{ fontSize: T.fMicro, color: C.muted, marginTop: 7 }}>{tr(lang, "searchHint")}</div>
          </div>
        )}

        {view.type === "year" && yearData && yearData.byMonth.map((items, mi) => items.length === 0 ? null : (
          <div key={mi} style={{ marginBottom: 16 }}>
            <div style={{ ...T.label, color: C.muted, marginBottom: 5 }}>{MO[mi]}</div>
            <div style={{ ...card, padding: "4px 14px" }}>{items.map((it, i) => <Row key={i} it={it} first={i === 0} />)}</div>
          </div>
        ))}
        {view.type === "year" && yearData && <div style={{ fontSize: T.fMicro, color: C.muted, fontStyle: "italic", padding: "2px 2px 14px", lineHeight: 1.5 }}>{tr(lang, "regionalNote")}</div>}

        {view.type === "search" && (results == null || results.length === 0
          ? <div style={{ color: C.muted, fontStyle: "italic", fontSize: T.fBody, padding: "16px 2px" }}>{q.trim() ? tr(lang, "noResults") : tr(lang, "searchHint")}</div>
          : <div style={{ ...card, padding: "4px 14px" }}>{results.map((it, i) => <Row key={i} it={it} first={i === 0} />)}</div>
        )}
      </div>
    </div>
  );
}

export { CalendarPage };
