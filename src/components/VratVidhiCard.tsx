/* Vrat vidhi card — pure extraction (SPLIT-UI-CONTENT-01). Wire deferred. */

import React, { useState } from "react";
import { T } from "./tokens";
import { VRAT_VIDHI_LABELS } from "../data/vrat-vidhis";
import { kathaParagraphs, parseKathaLine } from "../data/guide-katha-format";

function VratVidhiCard({ data, lang, C, initiallyOpen = false }) {
  const [open, setOpen] = useState(initiallyOpen);
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
  const stepList = (steps) => (
    <ol style={{ margin: "5px 0 0", paddingLeft: 20 }}>
      {(steps || []).map((step, i) => (
        <li key={i} style={{ marginBottom: 6 }}>{txt(step)}</li>
      ))}
    </ol>
  );
  const pujaBody = data.pujaMaterials || data.pujaPanchopachara || data.pujaShodashopachara || data.pujaCompletion ? (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div>{txt(data.puja)}</div>
      {data.pujaMaterials && (
        <div style={{ padding: "8px 9px", borderRadius: T.rSm, background: "rgba(168,106,18,.06)", border: `1px solid ${C.line}` }}>
          <div style={{ ...T.label, color: C.gold, marginBottom: 3 }}>{lbl("materials")}</div>
          <div>{txt(data.pujaMaterials)}</div>
        </div>
      )}
      {data.pujaPanchopachara && (
        <div>
          <div style={{ fontWeight: 700, color: C.ink }}>{lbl("panchopachara")}</div>
          {stepList(data.pujaPanchopachara)}
        </div>
      )}
      {data.pujaShodashopachara && (
        <details style={{ borderTop: `1px solid ${C.line}`, paddingTop: 8 }}>
          <summary style={{ color: C.gold, fontWeight: 700, cursor: "pointer" }}>{lbl("shodashopachara")}</summary>
          {stepList(data.pujaShodashopachara)}
        </details>
      )}
      {data.pujaCompletion && (
        <div>
          <div style={{ fontWeight: 700, color: C.ink, marginBottom: 3 }}>{lbl("afterPuja")}</div>
          <div>{txt(data.pujaCompletion)}</div>
        </div>
      )}
    </div>
  ) : txt(data.puja);
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
          {data.meaning && section(lbl("meaning"), txt(data.meaning))}
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
          {section(lbl("puja"), pujaBody)}
          {data.stories && section(lbl("stories"), (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {data.stories.map((story, i) => {
                const raw = txt(story);
                const { region, body } = parseKathaLine(raw);
                return (
                  <div
                    key={i}
                    style={{
                      padding: "9px 10px",
                      borderRadius: T.rSm,
                      background: "rgba(168,106,18,.04)",
                      border: `1px solid ${C.line}`,
                    }}
                  >
                    {region && (
                      <div style={{ ...T.label, color: C.gold, marginBottom: 5, lineHeight: 1.4 }}>{region}</div>
                    )}
                    <div style={{ fontSize: T.fSmall, color: C.ivory, lineHeight: 1.65 }}>
                      {kathaParagraphs(body).map((para, j) => (
                        <p key={j} style={{ margin: j ? "0.7em 0 0" : 0 }}>{para}</p>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
          {data.regional && section(lbl("regional"), (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {data.regional.map((tradition, i) => {
                const raw = txt(tradition);
                const paras = kathaParagraphs(raw);
                const [head, ...body] = paras.length > 1 ? paras : [raw];
                return (
                  <div
                    key={i}
                    style={{
                      padding: "9px 10px",
                      borderRadius: T.rSm,
                      background: "rgba(168,106,18,.04)",
                      border: `1px solid ${C.line}`,
                    }}
                  >
                    <div style={{ fontWeight: 700, color: C.ink, marginBottom: body.length ? 6 : 0, lineHeight: 1.45 }}>
                      {head}
                    </div>
                    {body.map((para, j) => (
                      <p key={j} style={{ margin: j ? "0.65em 0 0" : 0, fontSize: T.fSmall, color: C.ivory, lineHeight: 1.65 }}>
                        {para}
                      </p>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
          {section(lbl("paran"), txt(data.paran))}
          {section(lbl("udyapan"), txt(data.udyapan))}
          {data.safety && (
            <div style={{ marginTop: 9, padding: "7px 9px", borderRadius: T.rSm, background: "rgba(168,106,18,.05)", border: `1px solid ${C.line}` }}>
              <div style={{ ...T.label, color: C.gold, marginBottom: 3 }}>{lbl("safety")}</div>
              <div style={{ fontSize: T.fMicro, color: C.muted, lineHeight: 1.5 }}>{txt(data.safety)}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default VratVidhiCard;
export { VratVidhiCard };
