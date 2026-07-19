/* Vrat vidhi card — pure extraction (SPLIT-UI-CONTENT-01). Wire deferred. */

import React from "react";
import { T } from "./tokens";
import { VRAT_VIDHI_LABELS, VRAT_VIDHI_SAFETY } from "../data/vrat-vidhis";

function VratVidhiCard({ data, lang, C }) {
  const [open, setOpen] = useState(false);
  if (!data) return null;
  const L = lang === "hi" ? "hi" : "en";
  const lbl = (k) => VRAT_VIDHI_LABELS[k][L];
  const txt = (obj) => (obj && (obj[L] || obj.en)) || "";
  const section = (title, body) => (
    <div style={{ marginTop: 8 }}>
      <div style={{ ...T.label, color: C.gold, marginBottom: 3 }}>{title}</div>
      <div style={{ fontSize: T.fSmall, color: C.ivory, lineHeight: 1.55 }}>{body}</div>
    </div>
  );
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      style={{ marginTop: 8, width: "100%", boxSizing: "border-box", border: `1px solid ${C.line}`, borderRadius: T.rMd, background: "#FFFDF7", overflow: "hidden" }}
    >
      <div style={{ padding: "9px 11px", fontSize: T.fSmall, color: C.ivory, lineHeight: 1.5, fontWeight: 600 }}>
        {txt(data.verdict)}
      </div>
      <button
        type="button"
        aria-expanded={open}
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        style={{ width: "100%", minHeight: T.ctrlH, boxSizing: "border-box", padding: "0 11px", border: "none", borderTop: `1px solid ${C.line}`, background: open ? "rgba(168,106,18,.06)" : "transparent", color: C.gold, cursor: "pointer", fontFamily: T.serif, fontSize: T.fSmall, fontWeight: 500, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, textAlign: "left" }}
      >
        <span>{open ? lbl("hideHowTo") : lbl("showHowTo")}</span>
        <span aria-hidden="true" style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .15s", flexShrink: 0 }}>▾</span>
      </button>
      {open && (
        <div style={{ padding: "10px 11px 12px", borderTop: `1px solid ${C.line}`, display: "flex", flexDirection: "column", gap: 2 }}>
          <div style={{ padding: "7px 9px", borderRadius: T.rSm, background: "rgba(194,69,30,.06)", border: "1px solid rgba(194,69,30,.18)" }}>
            <div style={{ ...T.label, color: C.sindoor, marginBottom: 3 }}>{lbl("safety")}</div>
            <div style={{ fontSize: T.fMicro, color: C.muted, lineHeight: 1.5 }}>{txt(VRAT_VIDHI_SAFETY)}</div>
          </div>
          {section(lbl("vidhi"), (
            <ol style={{ margin: 0, paddingLeft: 18 }}>
              {(data.vidhi || []).map((step, i) => (
                <li key={i} style={{ marginBottom: 4 }}>{txt(step)}</li>
              ))}
            </ol>
          ))}
          {section(lbl("diet"), (
            data.dietAvoid || data.dietLighter ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {data.dietAvoid && <div><span style={{ color: C.sindoor, fontWeight: 600 }}>{lbl("avoid")}: </span>{txt(data.dietAvoid)}</div>}
                {data.dietLighter && <div><span style={{ color: "#1F7A4D", fontWeight: 600 }}>{lbl("lighter")}: </span>{txt(data.dietLighter)}</div>}
              </div>
            ) : txt(data.diet)
          ))}
          {section(lbl("sankalpa"), <span style={{ fontStyle: "italic" }}>{txt(data.sankalpa)}</span>)}
          {section(lbl("puja"), txt(data.puja))}
          {section(lbl("paran"), txt(data.paran))}
          {section(lbl("udyapan"), txt(data.udyapan))}
        </div>
      )}
    </div>
  );
}

export default VratVidhiCard;
export { VratVidhiCard };
