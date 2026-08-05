/* Vrat vidhi card — pure extraction (SPLIT-UI-CONTENT-01). Wire deferred. */

import React, { useState } from "react";
import { T, R as RT } from "./ui-style-contract";
import { VRAT_VIDHI_LABELS } from "../data/vrat-vidhis";
import { kathaParagraphs, parseKathaLine } from "../data/guide-katha-format";
import ReadAloudButton from "../accessibility/ReadAloudButton";

function VratVidhiCard({ data, lang, C, initiallyOpen = false }) {
  const [open, setOpen] = useState(initiallyOpen);
  if (!data) return null;
  const L = lang === "hi" ? "hi" : "en";
  const lbl = (k) => VRAT_VIDHI_LABELS[k][L];
  const txt = (obj) => (obj && (obj[L] || obj.en)) || "";
  const section = (title, body) => (
    <div style={{ marginTop: "0.5rem" }}>
      <div style={{ ...T.label, color: C.gold, marginBottom: "0.1875rem" }}>{title}</div>
      <div style={{ fontSize: T.fSmall, color: C.ivory, lineHeight: 1.55 }}>{body}</div>
    </div>
  );
  const stepList = (steps) => (
    <ol style={{ margin: "0.3125rem 0 0", paddingLeft: "1.25rem" }}>
      {(steps || []).map((step, i) => (
        <li key={i} style={{ marginBottom: "0.375rem" }}>{txt(step)}</li>
      ))}
    </ol>
  );
  const pujaBody = data.pujaMaterials || data.pujaPanchopachara || data.pujaShodashopachara || data.pujaCompletion ? (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
      <div>{txt(data.puja)}</div>
      {data.pujaMaterials && (
        <div style={{ padding: "0.5rem 0.5625rem", borderRadius: T.rSm, background: "var(--surface-hover)", border: `0.0625rem solid ${C.line}` }}>
          <div style={{ ...T.label, color: C.gold, marginBottom: "0.1875rem" }}>{lbl("materials")}</div>
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
        <details style={{ borderTop: `0.0625rem solid ${C.line}`, paddingTop: "0.5rem" }}>
          <summary style={{ color: C.gold, fontWeight: 700, cursor: "pointer" }}>{lbl("shodashopachara")}</summary>
          {stepList(data.pujaShodashopachara)}
        </details>
      )}
      {data.pujaCompletion && (
        <div>
          <div style={{ fontWeight: 700, color: C.ink, marginBottom: "0.1875rem" }}>{lbl("afterPuja")}</div>
          <div>{txt(data.pujaCompletion)}</div>
        </div>
      )}
    </div>
  ) : txt(data.puja);
  const listenText = [
    txt(data.verdict), txt(data.meaning),
    ...(data.vidhi || []).map(txt),
    txt(data.puja), txt(data.paran),
  ].filter(Boolean);
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      style={{ marginTop: "0.5rem", width: "100%", boxSizing: "border-box", border: `0.0625rem solid ${C.line}`, borderRadius: T.rMd, background: "var(--surface-sunken)", overflow: "hidden" }}
    >
      <div style={{ padding: "0.5625rem 0.6875rem", fontSize: T.fSmall, color: C.ivory, lineHeight: 1.5, fontWeight: 600 }}>
        {txt(data.verdict)}
      </div>
      <button
        type="button"
        aria-expanded={open}
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        style={{ width: "100%", minHeight: T.ctrlH, boxSizing: "border-box", padding: "0 0.6875rem", border: "none", borderTop: `0.0625rem solid ${C.line}`, background: open ? "var(--surface-hover)" : "transparent", color: C.gold, cursor: "pointer", fontFamily: T.serif, fontSize: T.fSmall, fontWeight: 500, display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem", textAlign: "left" }}
      >
        <span>{open ? lbl("hideHowTo") : lbl("showHowTo")}</span>
        <span aria-hidden="true" style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .15s", flexShrink: 0 }}>▾</span>
      </button>
      {open && (
        <div style={{ padding: "0.625rem 0.6875rem 0.75rem", borderTop: `0.0625rem solid ${C.line}`, display: "flex", flexDirection: "column", gap: "0.125rem" }}>
          {listenText.length > 0 && <div style={{ marginTop: RT.s2 }}><ReadAloudButton text={listenText} lang={L} compact label={L === "hi" ? "🔊 विधि सुनें" : "🔊 Listen to the steps"} /></div>}
          {data.meaning && section(lbl("meaning"), txt(data.meaning))}
          {section(lbl("vidhi"), (
            <ol style={{ margin: 0, paddingLeft: "1.125rem" }}>
              {(data.vidhi || []).map((step, i) => (
                <li key={i} style={{ marginBottom: "0.25rem" }}>{txt(step)}</li>
              ))}
            </ol>
          ))}
          {section(lbl("diet"), (
            data.dietAvoid || data.dietLighter ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.3125rem" }}>
                {data.dietAvoid && <div><span style={{ color: C.sindoor, fontWeight: 600 }}>{lbl("avoid")}: </span>{txt(data.dietAvoid)}</div>}
                {data.dietLighter && <div><span style={{ color: "var(--good)", fontWeight: 600 }}>{lbl("lighter")}: </span>{txt(data.dietLighter)}</div>}
              </div>
            ) : txt(data.diet)
          ))}
          {section(lbl("sankalpa"), <span style={{ fontStyle: "italic" }}>{txt(data.sankalpa)}</span>)}
          {section(lbl("puja"), pujaBody)}
          {data.aartis && data.aartis.length > 0 && (
            <div style={{ marginTop: "0.5rem" }}>
              <div style={{ ...T.label, color: C.gold, marginBottom: "0.1875rem" }}>{lbl("aarti")}</div>
              {data.aartis.map((a, i) => (
                <details key={i} style={{ borderTop: `0.0625rem solid ${C.line}`, paddingTop: "0.5rem", marginTop: i ? 6 : 0 }}>
                  <summary style={{ color: C.gold, fontWeight: 700, cursor: "pointer" }}>
                    {txt(a.title)}
                  </summary>
                  {a.intro && txt(a.intro) && (
                    <div style={{ fontSize: T.fMicro, color: C.muted, lineHeight: 1.5, margin: "0.375rem 0" }}>
                      {txt(a.intro)}
                    </div>
                  )}
                  <div style={{ fontSize: T.fSmall, lineHeight: 1.8, marginTop: "0.375rem" }}>
                    <div style={{ whiteSpace: "pre-line", color: C.gold, fontWeight: 600 }}>{a.refrain}</div>
                    {a.stanzas.map((s, j) => (
                      <React.Fragment key={j}>
                        <div style={{ whiteSpace: "pre-line", color: C.ivory, marginTop: "1em" }}>{s}</div>
                        <div style={{ color: C.gold, fontWeight: 600, marginTop: "0.1em" }}>{a.cue}</div>
                      </React.Fragment>
                    ))}
                  </div>
                </details>
              ))}
              <div style={{ fontSize: T.fMicro, color: C.muted, lineHeight: 1.5, marginTop: "0.5rem" }}>
                {lbl("aartiDisclaimer")}
              </div>
            </div>
          )}
          {data.stories && section(lbl("stories"), (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
              {data.stories.map((story, i) => {
                const raw = txt(story);
                const { region, body } = parseKathaLine(raw);
                return (
                  <div
                    key={i}
                    style={{
                      padding: "0.5625rem 0.625rem",
                      borderRadius: T.rSm,
                      background: "var(--surface-hover)",
                      border: `0.0625rem solid ${C.line}`,
                    }}
                  >
                    {region && (
                      <div style={{ ...T.label, color: C.gold, marginBottom: "0.3125rem", lineHeight: 1.4 }}>{region}</div>
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
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {data.regional.map((tradition, i) => {
                const raw = txt(tradition);
                const paras = kathaParagraphs(raw);
                const [head, ...body] = paras.length > 1 ? paras : [raw];
                return (
                  <div
                    key={i}
                    style={{
                      padding: "0.5625rem 0.625rem",
                      borderRadius: T.rSm,
                      background: "var(--surface-hover)",
                      border: `0.0625rem solid ${C.line}`,
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
            <div style={{ marginTop: "0.5625rem", padding: "0.4375rem 0.5625rem", borderRadius: T.rSm, background: "var(--surface-hover)", border: `0.0625rem solid ${C.line}` }}>
              <div style={{ ...T.label, color: C.gold, marginBottom: "0.1875rem" }}>{lbl("safety")}</div>
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
