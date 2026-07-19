/* BNN + Bhrigu UI modules — pure extraction (SPLIT-UI-JYOTISH-02). Wire deferred. */

import React, { useState, useMemo } from "react";
import { T } from "../components/tokens";
import { fmtDateT } from "../components/format";
import { SIGN_SHORT } from "../data/chart-divisions";
import {
  BNN_PLANETS, BNN_KARAKA, bnnRelations, bnnReading, bnnTiming,
  bcpTimeline, bspRules, jupiterProgression,
} from "../engine/bhrigu";
import { planetGochar } from "../engine/gochar";

function BNNModule({ bnn, rows, tz, C, card }) {
  const [sex, setSex] = useState("male");
  const [ref, setRef] = useState("Jupiter");
  const setSexAnd = (sx) => { setSex(sx); setRef(sx === "male" ? "Jupiter" : "Venus"); };
  const fmtD = (deg) => `${Math.floor(deg)}°${String(Math.floor((deg % 1) * 60)).padStart(2, "0")}′`;
  const rel = bnnRelations(rows, ref);
  const reading = bnnReading(rows, ref);
  const dirColor = { East: "#A86A12", South: "#C2451E", West: "#1F7A4D", North: "#3B5BA8" };
  const YEAR_MS = 365.25 * 86400000;
  const nowMs = Date.now();
  const timing = useMemo(() => bnnTiming(rows, nowMs - 1.5 * YEAR_MS, 14 * 365), [rows]);
  const satNow = useMemo(() => { try { return planetGochar("Saturn", Date.now(), 2).seq[0].sign; } catch (e) { return null; } }, []);

  const lab = { display: "block", ...T.label, color: C.muted, marginBottom: 6 };
  const tag = (name, extra) => (
    <span key={name} style={{ display: "inline-flex", alignItems: "baseline", gap: 5, fontSize: 13.5 }}>
      <span style={{ fontFamily: "Eczar, serif", color: C.ivory }}>{name}</span>
      {extra && <span style={{ fontSize: 11, color: C.muted }}>{extra}</span>}
    </span>
  );

  const RELS = [
    ["conjunct", "Conjunct", "same sign — strongest blend"],
    ["h2", "2nd · future", "kartari (ahead)"],
    ["h12", "12th · past", "kartari (behind)"],
    ["h7", "7th · opposition", "direct opposition"],
    ["h5", "5th · trine", "functional conjunction"],
    ["h9", "9th · trine", "functional conjunction"],
    ["h3", "3rd", "secondary"],
    ["h11", "11th", "secondary"],
    ["hidden", "Hidden · 4/6/8/10", "afflicts / denies the karaka"],
  ];

  return (
    <div>
      {/* controls */}
      <div style={{ ...card, padding: 16, display: "flex", flexWrap: "wrap", gap: 16, alignItems: "flex-end" }}>
        <div>
          <label style={lab}>Chart of</label>
          <div style={{ display: "flex", gap: 6 }}>
            {[["male", "वर · Male"], ["female", "कन्या · Female"]].map(([k, t]) => (
              <button key={k} onClick={() => setSexAnd(k)} style={{ padding: "8px 14px", borderRadius: 8, fontFamily: "Eczar, serif", fontSize: 13.5, cursor: "pointer", border: `1px solid ${sex === k ? C.gold : C.line}`, background: sex === k ? "rgba(168,106,18,.1)" : "transparent", color: sex === k ? C.gold : C.muted }}>{t}</button>
            ))}
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 160 }}>
          <label style={lab}>Read from (lagna)</label>
          <select value={ref} onChange={(e) => setRef(e.target.value)} style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: `1px solid ${C.line}`, background: "#FFFDF7", color: C.ivory, fontFamily: "Spectral, serif", fontSize: 14.5 }}>
            {BNN_PLANETS.map((p) => <option key={p} value={p}>{p}{p === "Jupiter" ? " — jeeva / self (male)" : p === "Venus" ? " — spouse / self (female)" : ""}</option>)}
          </select>
        </div>
      </div>

      {/* directional chart */}
      <div style={{ ...T.label, color: C.muted, margin: "18px 0 8px" }}>Directional chart · planets ordered by degree (lower initiates)</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10 }}>
        {bnn.directional.map((d) => (
          <div key={d.direction} style={{ ...card, padding: "12px 14px", borderTop: `3px solid ${dirColor[d.direction]}` }}>
            <div style={{ fontFamily: "Eczar, serif", fontSize: 14, color: dirColor[d.direction], marginBottom: 8 }}>{d.direction}</div>
            {d.planets.length === 0 ? <div style={{ fontSize: 12.5, color: C.muted, fontStyle: "italic" }}>—</div> :
              d.planets.map((p) => (
                <div key={p.name} style={{ display: "flex", justifyContent: "space-between", gap: 8, fontSize: 13, padding: "2px 0" }}>
                  <span style={{ fontFamily: "Eczar, serif", color: C.ivory }}>{p.name}{p.retro ? <span style={{ color: C.sindoor, fontSize: 11 }}> ℞</span> : ""}</span>
                  <span style={{ color: C.muted, fontSize: 12, fontVariantNumeric: "tabular-nums" }}>{SIGN_SHORT[p.sign]} {fmtD(p.deg)}</span>
                </div>
              ))}
          </div>
        ))}
      </div>

      {/* relation grid from reference */}
      <div style={{ ...T.label, color: C.muted, margin: `${T.s5}px 0 ${T.s2}px` }}>
        Combinations with {ref} <span style={{ textTransform: "none", letterSpacing: 0 }}>— {BNN_KARAKA[ref]}</span>
      </div>
      <div style={{ ...card, padding: "6px 4px" }}>
        {RELS.map(([key, title, sub], i) => {
          const names = rel.buckets[key];
          const isHidden = key === "hidden";
          const strong = key === "conjunct" || key === "h5" || key === "h9";
          return (
            <div key={key} style={{ display: "grid", gridTemplateColumns: "128px 1fr", gap: 10, padding: "9px 12px", borderTop: i ? "1px solid #EBDFC6" : "none", alignItems: "start" }}>
              <div>
                <div style={{ fontFamily: "Eczar, serif", fontSize: 13, color: isHidden ? C.sindoor : strong ? "#1F7A4D" : C.gold }}>{title}</div>
                <div style={{ fontSize: 10.5, color: C.muted }}>{sub}</div>
              </div>
              <div style={{ paddingTop: 1 }}>
                {names.length === 0 ? <span style={{ fontSize: 13, color: C.line }}>—</span> :
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 14px" }}>
                    {names.map((n) => tag(n, BNN_KARAKA[n].split(",")[0]))}
                  </div>}
              </div>
            </div>
          );
        })}
      </div>

      {/* core combinations */}
      <div style={{ ...T.label, color: C.muted, margin: `${T.s5}px 0 ${T.s2}px` }}>Seven core combinations</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 8 }}>
        {bnn.coreCombos.map((c) => (
          <div key={c.pair.join()} style={{ ...card, padding: "11px 13px", borderLeft: `3px solid ${c.active ? "#1F7A4D" : C.line}`, opacity: c.active ? 1 : 0.6 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
              <span style={{ fontFamily: "Eczar, serif", fontSize: 14, color: c.active ? C.ivory : C.muted }}>{c.pair[0]} + {c.pair[1]}</span>
              <span style={{ fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: c.active ? "#1F7A4D" : C.muted }}>{c.active ? "active" : "—"}</span>
            </div>
            <div style={{ fontSize: 11.5, color: C.muted, marginTop: 3 }}>{c.relation}</div>
            <div style={{ fontSize: 12, color: c.active ? C.ivory : C.muted, marginTop: 5, lineHeight: 1.4, fontStyle: c.active ? "normal" : "italic" }}>{c.meaning}</div>
          </div>
        ))}
      </div>

      {/* modulators */}
      {(bnn.parivartana.length > 0 || (bnn.rahuKetu && (bnn.rahuKetu.rahuSide.length || bnn.rahuKetu.ketuSide.length)) || bnn.retroShadow.length > 0) && (
        <div style={{ ...card, padding: "13px 15px", marginTop: 16, fontSize: 12.5, color: C.muted, lineHeight: 1.6 }}>
          {bnn.parivartana.length > 0 && <div><span style={{ color: C.gold, fontFamily: "Eczar, serif" }}>Parivartana</span> (exchange — read each as in its own sign): {bnn.parivartana.map((p) => p.join(" ⇄ ")).join("; ")}</div>}
          {bnn.rahuKetu && <div style={{ marginTop: bnn.parivartana.length ? 6 : 0 }}><span style={{ color: C.gold, fontFamily: "Eczar, serif" }}>Rahu–Ketu split</span> (separated planets act apart): Rahu side — {bnn.rahuKetu.rahuSide.join(", ") || "—"} · Ketu side — {bnn.rahuKetu.ketuSide.join(", ") || "—"}</div>}
          {bnn.retroShadow.length > 0 && <div style={{ marginTop: 6 }}><span style={{ color: C.gold, fontFamily: "Eczar, serif" }}>Retrograde shadow</span> (also reads from the 12th sign): {bnn.retroShadow.map((r) => `${r.name} → ${SIGN_SHORT[r.shadowSign]}`).join(", ")}</div>}
        </div>
      )}

      {/* Jupiter transit timing */}
      <div style={{ ...T.label, color: C.muted, margin: `${T.s5}px 0 ${T.s2}px` }}>Jupiter transit · timing</div>
      <div style={{ fontSize: 12, color: C.muted, marginBottom: 8, lineHeight: 1.5 }}>
        Real Jupiter transit — as it enters each sign it activates the natal planets it conjuncts, trines or opposes, bringing that combination into season.{satNow != null && <> Saturn, the fate-clock, currently transits <span style={{ color: C.gold }}>{SIGN_SHORT[satNow]}</span>.</>}
      </div>
      <div style={{ ...card, padding: "4px 4px", maxHeight: 430, overflowY: "auto" }}>
        {timing.map((p, i) => {
          const isNow = p.enter != null && p.exit != null && nowMs >= p.enter && nowMs < p.exit;
          const quiet = p.activated.length === 0;
          return (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "94px 1fr", gap: 10, padding: "8px 12px", borderTop: i ? "1px solid #EBDFC6" : "none", background: isNow ? "rgba(168,106,18,.09)" : "transparent", alignItems: "start" }}>
              <div>
                <div style={{ fontFamily: "Eczar, serif", fontSize: 14, color: isNow ? C.gold : C.ivory }}>{SIGN_SHORT[p.sign]}{isNow && <span style={{ fontSize: 9, letterSpacing: ".12em" }}> NOW</span>}</div>
                <div style={{ fontSize: 10.5, color: C.muted, fontVariantNumeric: "tabular-nums" }}>{p.enter ? fmtDateT(p.enter, tz, false) : "…"}</div>
              </div>
              <div style={{ paddingTop: 1 }}>
                {quiet ? <span style={{ fontSize: 12.5, color: C.line }}>— quiet (no natal contact)</span> :
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 6px" }}>
                    {p.activated.map((a) => {
                      const c = a.relation === "conjunct" ? { bg: "rgba(31,122,77,.14)", fg: "#1F7A4D", b: "#1F7A4D" } : a.relation === "trine" ? { bg: "transparent", fg: C.gold, b: C.line } : { bg: "transparent", fg: C.muted, b: C.line };
                      return <span key={a.planet} title={a.theme} style={{ fontSize: 12, padding: "2px 8px", borderRadius: 11, border: `1px solid ${c.b}`, background: c.bg, color: c.fg }}>{a.planet} <span style={{ fontSize: 10, opacity: 0.8 }}>{a.relation}</span></span>;
                    })}
                  </div>}
                {isNow && !quiet && (
                  <div style={{ marginTop: 6, fontSize: 11.5, color: C.muted, lineHeight: 1.45 }}>
                    {p.activated.filter((a) => a.relation === "conjunct" || a.relation === "trine").slice(0, 2).map((a) => <div key={a.planet}>Jupiter + {a.planet}: {a.theme}</div>)}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Tier C — hedged traditional reading (themes, not prediction) */}
      <div style={{ ...T.label, color: C.muted, margin: `${T.s5}px 0 ${T.s2}px` }}>How the tradition reads this · {ref}</div>
      <div style={{ ...card, padding: "16px 18px", borderTop: `3px solid ${C.gold}` }}>
        <div style={{ fontSize: 13, color: C.ivory, lineHeight: 1.6 }}>
          With <span style={{ fontFamily: "Eczar, serif", color: C.gold }}>{reading.self}</span> as the reference ({reading.selfKaraka}), BNN tradition reads its active combinations as these themes:
        </div>
        {reading.active.length === 0 ? (
          <div style={{ fontSize: 12.5, color: C.muted, marginTop: 10, fontStyle: "italic" }}>No planets stand in combination with {reading.self} — the tradition would read it as largely on its own, taking the quality of its sign.</div>
        ) : (
          <ul style={{ margin: "10px 0 0", padding: 0, listStyle: "none" }}>
            {reading.active.map((a) => (
              <li key={a.planet} style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 10, padding: "6px 0", borderTop: "1px solid #EBDFC6", alignItems: "baseline" }}>
                <span style={{ fontFamily: "Eczar, serif", fontSize: 13, color: C.gold, whiteSpace: "nowrap" }}>+ {a.planet} <span style={{ fontSize: 10.5, color: C.muted }}>{a.relation}</span></span>
                <span style={{ fontSize: 12.5, color: C.muted, lineHeight: 1.45 }}>{a.theme}</span>
              </li>
            ))}
          </ul>
        )}
        {reading.obstructed.length > 0 && (
          <div style={{ fontSize: 12, color: C.muted, marginTop: 12, lineHeight: 1.45 }}>
            <span style={{ color: C.sindoor }}>Read as obstructed</span> (in the hidden 4/6/8/10 houses): {reading.obstructed.map((o) => o.planet).join(", ")} — the tradition treats these significations as held back or turned inward.
          </div>
        )}
        <div style={{ fontSize: 11.5, color: C.muted, marginTop: 14, paddingTop: 12, borderTop: `1px dashed ${C.line}`, lineHeight: 1.55, fontStyle: "italic" }}>
          These are interpretive themes from the BNN tradition, not predictions about you. A real reading is the whole <em>chain</em> weighed together — by each planet's strength, the surrounding combinations, and Jupiter/Saturn timing — and is the judgment of a practitioner. This view deliberately stops at themes: it makes no claim about specific events, health, or timing, and isn't a substitute for a qualified astrologer.
        </div>
      </div>

      <p style={{ color: C.muted, fontSize: 12, marginTop: 16, lineHeight: 1.55 }}>
        This surfaces the BNN geometry — directional grouping, the combinations with your chosen karaka, and the modulators acting on them — plus each planet's traditional signification. It deliberately stops short of a verdict: BNN reads the <em>chain</em> of combinations, with intensity set by exaltation, debilitation, retrogression and exchange, and the same combination means different things in different chains. Treat this as the structured input a Nadi reading is built from, not the reading itself.
      </p>
    </div>
  );
}

function BhriguModule({ rows, ascSign, birthMs, tz, C, card }) {
  const YEAR_MS = 365.25 * 86400000;
  const currentAge = Math.max(0, Math.floor((Date.now() - birthMs) / YEAR_MS));
  const birthYear = new Date(birthMs + tz * 3600000).getFullYear();
  const bcp = useMemo(() => bcpTimeline(ascSign, rows, Math.max(1, currentAge - 3), currentAge + 16), [rows, ascSign, currentAge]);
  const bsp = useMemo(() => bspRules(ascSign, rows), [rows, ascSign]);
  const prog = useMemo(() => jupiterProgression(rows, Math.max(0, currentAge - 2), currentAge + 12), [rows, currentAge]);
  const ord = (n) => n + (["th", "st", "nd", "rd"][(n % 100 >> 3 ^ 1) && n % 10] || "th");
  const lordColor = { Sun: "#C2451E", Moon: "#5B7Fb0", Mars: "#B23B2E", Mercury: "#1F7A4D", Jupiter: "#A86A12", Venus: "#9A5BA3", Saturn: "#52606D", Rahu: "#6B4E8A", Ketu: "#7A6A52" };
  const sub = { fontSize: 12, color: C.muted, marginBottom: 8, lineHeight: 1.5 };

  return (
    <div>
      {/* BCP house progression */}
      <div style={{ ...T.label, color: C.muted, margin: "4px 0 8px" }}>Bhrigu Chakra · one house per year</div>
      <div style={sub}>From the Ascendant, year 1 is the 1st house, year 2 the 2nd, and so on — the chakra rotating every 12 years. Each 12-year cycle carries a Cycle Lord (Chakra Swami) that colours it.</div>
      <div style={{ ...card, padding: "4px 4px", maxHeight: 360, overflowY: "auto" }}>
        {bcp.map((b, i) => {
          const isNow = b.age === currentAge;
          return (
            <div key={b.age} style={{ display: "grid", gridTemplateColumns: "74px 86px 1fr", gap: 8, padding: "7px 12px", borderTop: i ? "1px solid #EBDFC6" : "none", background: isNow ? "rgba(168,106,18,.09)" : "transparent", alignItems: "baseline" }}>
              <div>
                <div style={{ fontFamily: "Eczar, serif", fontSize: 13.5, color: isNow ? C.gold : C.ivory }}>age {b.age}{isNow && <span style={{ fontSize: 9, letterSpacing: ".1em" }}> NOW</span>}</div>
                <div style={{ fontSize: 10, color: C.muted }}>~{birthYear + b.age}</div>
              </div>
              <div>
                <div style={{ fontSize: 13, color: C.ivory }}>{ord(b.houseNum)} · {SIGN_SHORT[b.sign]}</div>
                <div style={{ fontSize: 9.5, letterSpacing: ".06em", color: lordColor[b.cycleLord] || C.muted }}>{b.cycleLord} cycle</div>
              </div>
              <div style={{ fontSize: 11.5, color: C.muted, lineHeight: 1.4 }}>
                {b.theme}
                {b.occupants.length > 0 && <span style={{ color: C.gold }}> · {b.occupants.join(", ")} here</span>}
              </div>
            </div>
          );
        })}
      </div>

      {/* BSP implements-rules */}
      <div style={{ ...T.label, color: C.muted, margin: `${T.s5}px 0 ${T.s2}px` }}>Bhrigu Saral · implements-rules <span style={{ textTransform: "none", letterSpacing: 0, fontSize: 10.5 }}>(documented subset)</span></div>
      <div style={sub}>Each rule fixes a year when a planet "implements" a particular house counted from itself. Shown as the house it lands on in this chart, with significations — a structural map, not an event forecast.</div>
      <div style={{ ...card, padding: "4px 4px" }}>
        {bsp.map((r, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "118px 1fr", gap: 10, padding: "9px 12px", borderTop: i ? "1px solid #EBDFC6" : "none", alignItems: "baseline" }}>
            <div>
              <div style={{ fontFamily: "Eczar, serif", fontSize: 13, color: lordColor[r.planet] || C.ivory }}>{r.planet}</div>
              <div style={{ fontSize: 10.5, color: C.muted }}>{r.age ? `age ${r.age}` : "lifelong"} · {ord(r.from)} from self</div>
            </div>
            <div style={{ fontSize: 11.5, color: C.muted, lineHeight: 1.45 }}>
              lands on <span style={{ color: C.ivory }}>{SIGN_SHORT[r.targetSign]}</span> ({ord(r.houseFromLagna)} house) — {r.theme}
              {r.occupants.length > 0 && <span style={{ color: C.gold }}> · with {r.occupants.join(", ")}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Jupiter symbolic progression */}
      <div style={{ ...T.label, color: C.muted, margin: `${T.s5}px 0 ${T.s2}px` }}>Jupiter progression · 1 sign / year</div>
      <div style={sub}>The symbolic counterpart to the real-transit timing in the BNN section: natal Jupiter advanced one sign per year of age. The two methods diverge — that divergence is itself a thing practitioners weigh.</div>
      <div style={{ ...card, padding: "4px 4px", maxHeight: 320, overflowY: "auto" }}>
        {prog.timeline.map((p, i) => {
          const isNow = p.age === currentAge;
          const quiet = p.activated.length === 0;
          return (
            <div key={p.age} style={{ display: "grid", gridTemplateColumns: "90px 60px 1fr", gap: 8, padding: "7px 12px", borderTop: i ? "1px solid #EBDFC6" : "none", background: isNow ? "rgba(168,106,18,.09)" : "transparent", alignItems: "baseline" }}>
              <div style={{ fontFamily: "Eczar, serif", fontSize: 13, color: isNow ? C.gold : C.ivory }}>age {p.age}{isNow && <span style={{ fontSize: 9 }}> NOW</span>}</div>
              <div style={{ fontSize: 12.5, color: C.ivory }}>{SIGN_SHORT[p.progSign]}</div>
              <div style={{ paddingTop: 1 }}>
                {quiet ? <span style={{ fontSize: 12, color: C.line }}>— quiet</span> :
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "3px 6px" }}>
                    {p.activated.map((a) => {
                      const c = a.relation === "conjunct" ? "#1F7A4D" : a.relation === "trine" ? C.gold : C.muted;
                      return <span key={a.planet} title={a.theme} style={{ fontSize: 11.5, padding: "1px 7px", borderRadius: 10, border: `1px solid ${C.line}`, color: c }}>{a.planet} <span style={{ fontSize: 9.5, opacity: 0.8 }}>{a.relation}</span></span>;
                    })}
                  </div>}
              </div>
            </div>
          );
        })}
      </div>

      <p style={{ color: C.muted, fontSize: 12, marginTop: 16, lineHeight: 1.55 }}>
        These are progression mechanics — which house or sign a method points to in a given year — surfaced with the standard significations of those houses. They are a structured map of <em>when</em> the tradition would have you look, not a forecast of what will happen. The BSP set is a widely-documented subset, not the complete proprietary system, and the longevity rules are deliberately excluded. Read alongside a practitioner, not in place of one.
      </p>
    </div>
  );
}

export { BNNModule, BhriguModule };
