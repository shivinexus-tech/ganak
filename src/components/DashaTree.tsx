/* Vimshottari dasha tree UI — pure extraction (SPLIT-UI-CHART-03). Wire deferred. */

import React from "react";
import { fmtDateZone, panchangTime } from "./format";
import { vimSubOf, DASHA_LEVELS } from "../engine/dasha";
import { planetName } from "../i18n/panchang-terms";

/* ------------------------------------------------------------------------------
   ONE date rendering for the whole Vimshottari surface — the mahadasha table and
   the marriage card in ChartScreen, and every level of this tree.
   Handoffs F5 + F12 from plans/audits/2026-08-19-dasha-transit-fix.md.

   Both defects lived in `fmtDateT(ms, tz, withTime)`:

   · its locale was hardcoded "en-IN" in BOTH languages, so a Hindi reader's own
     dasha table printed "15 Jun 1990" — while the marriage card a few inches
     below it on the same screen printed "जून 2026", because that one already
     asked for the reader's locale;
   · its with-time branch dropped the YEAR, so the sookshma and prana rows read
     "31 Dec, 11:48 PM – 1 Jan, 4:02 AM" and a list straddling New Year appeared
     to run backwards.

   `fmtDateZone` is the app's existing language-aware date helper — DailyScreen
   and MatchingScreen already use it — and it already carries a `withYear` flag.
   Routing through it fixes both without adding a third date formatter to the
   codebase, which is what the handoff asked for. `fmtDateT` is left alone
   because RectifyScreen and JyotishBnnScreen still call it and neither file
   belongs to this lane.

   The year is now printed at EVERY level. A dasha spans years by its nature and
   there is no "today" for its dates to be read relative to, so the year is never
   the redundant noise it would be on a panchang clock.

   These helpers live here rather than in ChartScreen because ChartScreen imports
   this module; the other direction would be an import cycle.
------------------------------------------------------------------------------ */
const dashaDate = (ms, tz, lang) => fmtDateZone(ms, tz, lang, undefined, true);
const dashaMoment = (ms, tz, lang) => `${dashaDate(ms, tz, lang)}, ${panchangTime(ms, tz, lang)}`;

function DashaTree({ periods, level, now, openD, toggle, C, tz, lang = "en" }) {
  const levelHi = ["अंतर्दशा", "प्रत्यंतरदशा", "सूक्ष्म दशा", "प्राण दशा"];
  const stamp = (ms) => (level >= 2 ? dashaMoment(ms, tz, lang) : dashaDate(ms, tz, lang));
  return (
    <div style={{ marginLeft: level ? 11 : 0, borderLeft: level ? `0.0625rem solid ${C.line}` : "none", paddingLeft: level ? 11 : 0 }}>
      {level > 0 && <div style={{ fontSize: "var(--font-micro)", letterSpacing: ".12em", textTransform: "uppercase", color: C.muted, margin: "0.25rem 0 0.125rem 0.125rem" }}>{lang === "hi" ? levelHi[level] : DASHA_LEVELS[level]}</div>}
      {periods.map((p) => {
        const live = now >= p.start && now < p.end;
        const key = level + ":" + p.start;
        const open = openD.has(key);
        const canDrill = level < 3;
        /* vimSubOf, not vimSub(p.lord, p.start, p.end - p.start): a period clipped to
           the birth instant keeps its true span in fullStart/fullEnd, and its children
           must be proportioned over THAT span and then clipped the same way. Using the
           displayed start here re-proportioned the whole sub-tree over a shortened
           period (bug-bash 2026-08-18 F2). */
        const kids = open && canDrill ? vimSubOf(p) : null;
        return (
          <div key={p.start}>
            <div
              onClick={canDrill ? () => toggle(key) : undefined}
              style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.375rem 0.5rem", cursor: canDrill ? "pointer" : "default", borderRadius: "0.4375rem", background: live ? "var(--surface-hover)" : "transparent" }}
            >
              <span style={{ color: C.muted, fontSize: "var(--font-micro)", width: "0.5625rem", flexShrink: 0 }}>{canDrill ? (open ? "▾" : "▸") : ""}</span>
              <span style={{ color: live ? C.gold : C.ivory, fontWeight: live ? 600 : 400, fontSize: "var(--font-small)", minWidth: "3.875rem" }}>{planetName(lang, p.lord)}</span>
              <span style={{ color: C.muted, fontSize: "var(--font-label)", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>{stamp(p.start)} – {stamp(p.end)}</span>
              {live && <span style={{ color: C.gold, fontSize: "var(--font-micro)", letterSpacing: ".14em", textTransform: "uppercase" }}>{lang === "hi" ? "अभी" : "now"}</span>}
            </div>
            {kids && <DashaTree periods={kids} level={level + 1} now={now} openD={openD} toggle={toggle} C={C} tz={tz} lang={lang} />}
          </div>
        );
      })}
    </div>
  );
}

export { DashaTree, dashaDate, dashaMoment };
