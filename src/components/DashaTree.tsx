/* Vimshottari dasha tree UI — pure extraction (SPLIT-UI-CHART-03). Wire deferred. */

import React from "react";
import { fmtDateT } from "./format";
import { vimSub, DASHA_LEVELS } from "../engine/dasha";

function DashaTree({ periods, level, now, openD, toggle, C, tz, lang = "en" }) {
  const levelHi = ["अंतर्दशा", "प्रत्यंतरदशा", "सूक्ष्म दशा", "प्राण दशा"];
  return (
    <div style={{ marginLeft: level ? 11 : 0, borderLeft: level ? `1px solid ${C.line}` : "none", paddingLeft: level ? 11 : 0 }}>
      {level > 0 && <div style={{ fontSize: 9, letterSpacing: ".12em", textTransform: "uppercase", color: C.muted, margin: "4px 0 2px 2px" }}>{lang === "hi" ? levelHi[level] : DASHA_LEVELS[level]}</div>}
      {periods.map((p) => {
        const live = now >= p.start && now < p.end;
        const key = level + ":" + p.start;
        const open = openD.has(key);
        const canDrill = level < 3;
        const kids = open && canDrill ? vimSub(p.lord, p.start, p.end - p.start) : null;
        return (
          <div key={p.start}>
            <div
              onClick={canDrill ? () => toggle(key) : undefined}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 8px", cursor: canDrill ? "pointer" : "default", borderRadius: 7, background: live ? "rgba(168,106,18,.09)" : "transparent" }}
            >
              <span style={{ color: C.muted, fontSize: 10, width: 9, flexShrink: 0 }}>{canDrill ? (open ? "▾" : "▸") : ""}</span>
              <span style={{ color: live ? C.gold : C.ivory, fontWeight: live ? 600 : 400, fontSize: 13.5, minWidth: 62 }}>{p.lord}</span>
              <span style={{ color: C.muted, fontSize: 12, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>{fmtDateT(p.start, tz, level >= 2)} – {fmtDateT(p.end, tz, level >= 2)}</span>
              {live && <span style={{ color: C.gold, fontSize: 9.5, letterSpacing: ".14em", textTransform: "uppercase" }}>{lang === "hi" ? "अभी" : "now"}</span>}
            </div>
            {kids && <DashaTree periods={kids} level={level + 1} now={now} openD={openD} toggle={toggle} C={C} tz={tz} lang={lang} />}
          </div>
        );
      })}
    </div>
  );
}

export { DashaTree };
