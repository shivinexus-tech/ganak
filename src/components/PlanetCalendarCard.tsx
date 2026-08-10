import React, { useMemo, useState } from "react";
import { T } from "./ui-style-contract";
import { panchangTerm } from "../i18n/panchang-terms";
import { retrogradeEvents, combustionEvents, planetStatesAt } from "../engine/planet-calendar";

/* Consolidated 12-month planetary calendar: retrograde/direct stations and
   combustion (Asta / Udaya) for the five star planets. Collapsible; computes on
   first open. Place only affects the displayed local date, not the events. */
const DAY = 86400000;

function PlanetCalendarCard({ tz, placeLabel, lang, C, card }: any) {
  const hi = lang === "hi";
  const [open, setOpen] = useState(false);
  const fromMs = Date.now();
  const data = useMemo(() => (open ? {
    retro: retrogradeEvents(fromMs, fromMs + 365 * DAY),
    comb: combustionEvents(fromMs, fromMs + 365 * DAY),
    now: planetStatesAt(fromMs),
  } : null), [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const pname = (p: string) => panchangTerm(hi ? "hi" : "en", "planet", p);
  const fmtD = (t: number) => new Date(t + tz * 3600000).toLocaleDateString(hi ? "hi-IN" : "en-US", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

  const nowRetro = data ? data.now.filter((s: any) => s.retro).map((s: any) => pname(s.planet)) : [];
  const nowComb = data ? data.now.filter((s: any) => s.combust).map((s: any) => pname(s.planet)) : [];

  const row = (key: string, dateT: number, name: string, tag: string, warn: boolean) => (
    <div key={key} style={{ display: "flex", gap: "0.75rem", alignItems: "baseline", padding: "0.5rem 0.125rem", borderBottom: "0.0625rem solid var(--line-soft)" }}>
      <span style={{ color: C.gold, fontSize: "var(--font-label)", fontVariantNumeric: "tabular-nums", minWidth: "6rem", whiteSpace: "nowrap" }}>{fmtD(dateT)}</span>
      <span style={{ fontFamily: "var(--font-display-family)", fontSize: "var(--font-body)", color: C.ivory, flex: 1 }}>{name}</span>
      <span style={{ fontSize: "var(--font-small)", color: warn ? C.sindoor : "var(--good)", fontWeight: 500, whiteSpace: "nowrap" }}>{tag}</span>
    </div>
  );

  return (
    <div className="rise2" style={{ ...card, padding: "1rem 1.25rem", marginTop: "0.75rem" }}>
      <button onClick={() => setOpen((v) => !v)} style={{ width: "100%", textAlign: "left", background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.625rem" }}>
        <span>
          <span style={{ ...T.label, color: C.muted, display: "block" }}>{hi ? "वक्री · अस्त पंचांग · आगामी 12 माह" : "Retrograde & combustion calendar · next 12 months"}</span>
          <span style={{ fontSize: "var(--font-label)", color: C.muted, fontStyle: "italic" }}>{hi ? "ग्रह कब वक्री/मार्गी होते हैं और कब सूर्य के निकट अस्त/उदय होते हैं" : "when planets turn retrograde/direct and when they set into or rise from the Sun's rays"}</span>
        </span>
        <span style={{ color: C.muted, fontSize: "var(--font-small)", transform: open ? "rotate(180deg)" : "none", transition: "transform .2s" }}>▼</span>
      </button>

      {data && (
        <div style={{ marginTop: "0.875rem" }}>
          <div style={{ fontSize: "var(--font-small)", color: C.ivory, lineHeight: 1.6, marginBottom: "0.875rem", padding: "0.625rem 0.75rem", background: "var(--surface-hover)", border: `0.0625rem solid ${C.line}`, borderRadius: "0.625rem" }}>
            <strong style={{ color: C.gold }}>{hi ? "अभी" : "Right now"}: </strong>
            {nowRetro.length ? `${hi ? "वक्री" : "Retrograde"}: ${nowRetro.join(", ")}. ` : `${hi ? "कोई ग्रह वक्री नहीं" : "No planet is retrograde"}. `}
            {nowComb.length ? `${hi ? "अस्त" : "Combust"}: ${nowComb.join(", ")}.` : `${hi ? "कोई ग्रह अस्त नहीं।" : "No planet is combust."}`}
          </div>

          <div style={{ fontSize: "var(--font-micro)", textTransform: "uppercase", letterSpacing: ".12em", color: C.gold, fontWeight: 600, margin: "0.25rem 0 0.25rem" }}>{hi ? "वक्री एवं मार्गी" : "Retrograde & direct"}</div>
          {data.retro.length === 0 ? <div style={{ fontSize: "var(--font-small)", color: C.muted, padding: "0.375rem 0" }}>{hi ? "आगामी वर्ष में कोई स्थिति-परिवर्तन नहीं।" : "No station changes in the year ahead."}</div>
            : data.retro.map((e: any) => row("r" + e.planet + e.t, e.t, pname(e.planet), hi ? (e.retro ? "वक्री ℞" : "मार्गी") : (e.retro ? "retrograde ℞" : "direct"), e.retro))}

          <div style={{ fontSize: "var(--font-micro)", textTransform: "uppercase", letterSpacing: ".12em", color: C.gold, fontWeight: 600, margin: "1rem 0 0.25rem" }}>{hi ? "अस्त एवं उदय" : "Combustion — set (Asta) & rise (Udaya)"}</div>
          {data.comb.length === 0 ? <div style={{ fontSize: "var(--font-small)", color: C.muted, padding: "0.375rem 0" }}>{hi ? "आगामी वर्ष में कोई अस्त/उदय नहीं।" : "No set/rise events in the year ahead."}</div>
            : data.comb.map((e: any) => row("c" + e.planet + e.t, e.t, pname(e.planet), hi ? (e.set ? "अस्त" : "उदय") : (e.set ? "sets (combust)" : "rises"), e.set))}

          <div style={{ fontSize: "var(--font-micro)", color: C.muted, marginTop: "0.75rem", fontStyle: "italic", lineHeight: 1.5 }}>
            {hi ? "निरयण (लाहिरी) · तिथियाँ " : "Sidereal (Lahiri) · dates in "}{placeLabel || (hi ? "स्थानीय" : "local")}{hi ? " समयानुसार। अस्त-कक्षाएँ: मंगल 17°, बुध 14°, गुरु 11°, शुक्र 10°, शनि 15°। शुभ कार्यों (विशेषतः विवाह) में गुरु/शुक्र अस्त और वक्री का विचार किया जाता है।" : " time. Combustion orbs: Mars 17°, Mercury 14°, Jupiter 11°, Venus 10°, Saturn 15°. Guru/Shukra Asta and retrogression are traditionally weighed for auspicious work, especially marriage."}
          </div>
        </div>
      )}
    </div>
  );
}

export default PlanetCalendarCard;
export { PlanetCalendarCard };
