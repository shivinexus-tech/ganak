/* Vimshottari dasha tree UI — pure extraction (SPLIT-UI-CHART-03). Wire deferred. */

import React from "react";
import { fmtDateT } from "./format";
import { vimSub, DASHA_LEVELS } from "../engine/dasha";
import { planetName } from "../i18n/panchang-terms";

function DashaTree({ periods, level, now, openD, toggle, C, tz, lang = "en" }) {
  const levelHi = ["अंतर्दशा", "प्रत्यंतरदशा", "सूक्ष्म दशा", "प्राण दशा"];
  return (
    <div style={{ marginLeft: level ? 11 : 0, borderLeft: level ? `0.0625rem solid ${C.line}` : "none", paddingLeft: level ? 11 : 0 }}>
      {level > 0 && <div style={{ fontSize: "var(--font-micro)", letterSpacing: ".12em", textTransform: "uppercase", color: C.muted, margin: "0.25rem 0 0.125rem 0.125rem" }}>{lang === "hi" ? levelHi[level] : DASHA_LEVELS[level]}</div>}
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
              style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.375rem 0.5rem", cursor: canDrill ? "pointer" : "default", borderRadius: "0.4375rem", background: live ? "var(--surface-hover)" : "transparent" }}
            >
              <span style={{ color: C.muted, fontSize: "var(--font-micro)", width: "0.5625rem", flexShrink: 0 }}>{canDrill ? (open ? "▾" : "▸") : ""}</span>
              <span style={{ color: live ? C.gold : C.ivory, fontWeight: live ? 600 : 400, fontSize: "var(--font-small)", minWidth: "3.875rem" }}>{planetName(lang, p.lord)}</span>
              <span style={{ color: C.muted, fontSize: "var(--font-label)", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>{fmtDateT(p.start, tz, level >= 2)} – {fmtDateT(p.end, tz, level >= 2)}</span>
              {live && <span style={{ color: C.gold, fontSize: "var(--font-micro)", letterSpacing: ".14em", textTransform: "uppercase" }}>{lang === "hi" ? "अभी" : "now"}</span>}
            </div>
            {kids && <DashaTree periods={kids} level={level + 1} now={now} openD={openD} toggle={toggle} C={C} tz={tz} lang={lang} />}
          </div>
        );
      })}
    </div>
  );
}

export { DashaTree };
