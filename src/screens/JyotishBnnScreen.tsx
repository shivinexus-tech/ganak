/* BNN + Bhrigu UI modules — pure extraction (SPLIT-UI-JYOTISH-02). Wire deferred. */

import React, { useState, useMemo } from "react";
import { T } from "../components/ui-style-contract";
import { fmtDateT } from "../components/format";
import { signShort, panchangTerm } from "../i18n/panchang-terms";
import {
  BNN_PLANETS, BNN_KARAKA, bnnRelations, bnnReading, bnnTiming,
  bcpTimeline, bspRules, jupiterProgression,
} from "../engine/bhrigu";
import { planetGochar } from "../engine/gochar";

function BNNModule({ bnn, rows, tz, C, card, lang = "en" }) {
  const hi = lang === "hi";
  /* Planet names are engine keys, not display text: every screen must print them
     through the one i18n table (E-1.0 / language-leak-scan). Caught 2026-08-18 by
     the first rendered snapshot of this module, which showed "Venus" and "Saturn"
     in Hindi mode. Colour maps and state still key off the English name. */
  const PL = (name) => panchangTerm(lang, "planet", name);
  const [sex, setSex] = useState("male");
  const [ref, setRef] = useState("Jupiter");
  const setSexAnd = (sx) => { setSex(sx); setRef(sx === "male" ? "Jupiter" : "Venus"); };
  const fmtD = (deg) => `${Math.floor(deg)}°${String(Math.floor((deg % 1) * 60)).padStart(2, "0")}′`;
  const rel = bnnRelations(rows, ref);
  const reading = bnnReading(rows, ref);
  const dirColor = { East: "var(--accent)", South: "var(--bad)", West: "var(--good)", North: "color-mix(in srgb, #3B5BA8, var(--ink) 26%)" };
  const YEAR_MS = 365.25 * 86400000;
  const nowMs = Date.now();
  const timing = useMemo(() => bnnTiming(rows, nowMs - 1.5 * YEAR_MS, 14 * 365), [rows]);
  const satNow = useMemo(() => { try { return planetGochar("Saturn", Date.now(), 2).seq[0].sign; } catch (e) { return null; } }, []);

  const lab = { display: "block", ...T.label, color: C.muted, marginBottom: "0.375rem" };
  const relationHi = { conjunct: "युति", trine: "त्रिकोण", opposition: "विरोध", active: "सक्रिय" };
  const themeText = (theme) => hi ? "इन दोनों ग्रहों के कारकत्व साथ सक्रिय होते हैं; फल पूरी ग्रह-श्रृंखला और बल के साथ देखकर समझें।" : theme;
  const tag = (name, extra) => (
    <span key={name} style={{ display: "inline-flex", alignItems: "baseline", gap: "0.3125rem", fontSize: "var(--font-small)" }}>
      <span style={{ fontFamily: "var(--font-display-family)", color: C.ivory }}>{name}</span>
      {extra && <span style={{ fontSize: "var(--font-label)", color: C.muted }}>{extra}</span>}
    </span>
  );

  const RELS = [
    ["conjunct", hi ? "युति" : "Conjunct", hi ? "एक राशि — सबसे प्रबल मेल" : "same sign — strongest blend"],
    ["h2", hi ? "द्वितीय · भविष्य" : "2nd · future", hi ? "आगे की कर्तरी" : "kartari (ahead)"],
    ["h12", hi ? "द्वादश · अतीत" : "12th · past", hi ? "पीछे की कर्तरी" : "kartari (behind)"],
    ["h7", hi ? "सप्तम · विरोध" : "7th · opposition", hi ? "सीधा विरोध" : "direct opposition"],
    ["h5", hi ? "पंचम · त्रिकोण" : "5th · trine", hi ? "कार्यात्मक युति" : "functional conjunction"],
    ["h9", hi ? "नवम · त्रिकोण" : "9th · trine", hi ? "कार्यात्मक युति" : "functional conjunction"],
    ["h3", hi ? "तृतीय" : "3rd", hi ? "द्वितीयक" : "secondary"],
    ["h11", hi ? "एकादश" : "11th", hi ? "द्वितीयक" : "secondary"],
    ["hidden", hi ? "गुप्त · 4/6/8/10" : "Hidden · 4/6/8/10", hi ? "कारकत्व को रोकता या भीतर मोड़ता है" : "afflicts / denies the karaka"],
  ];

  return (
    <div>
      {/* controls */}
      <div style={{ ...card, padding: "1rem", display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "flex-end" }}>
        <div>
          <label style={lab}>{hi ? "कुंडली" : "Chart of"}</label>
          <div style={{ display: "flex", gap: "0.375rem" }}>
            {[["male", hi ? "वर" : "Male"], ["female", hi ? "कन्या" : "Female"]].map(([k, t]) => (
              <button key={k} onClick={() => setSexAnd(k)} style={{ padding: "0.5rem 0.875rem", borderRadius: "0.5rem", fontFamily: "var(--font-display-family)", fontSize: "var(--font-small)", cursor: "pointer", border: `0.0625rem solid ${sex === k ? C.gold : C.line}`, background: sex === k ? "var(--accent-soft)" : "transparent", color: sex === k ? C.gold : C.muted }}>{t}</button>
            ))}
          </div>
        </div>
        <div style={{ flex: 1, minWidth: "10rem" }}>
          <label style={lab}>{hi ? "जिसे लग्न मानकर पढ़ें" : "Read from (lagna)"}</label>
          <select value={ref} onChange={(e) => setRef(e.target.value)} style={{ width: "100%", padding: "0.5625rem 0.75rem", borderRadius: "0.5rem", border: `0.0625rem solid ${C.line}`, background: "var(--surface-sunken)", color: C.ivory, fontFamily: "var(--font-body-family)", fontSize: "var(--font-body)" }}>
            {BNN_PLANETS.map((p) => <option key={p} value={p}>{PL(p)}{p === "Jupiter" ? (hi ? " — जीव / स्वयं (वर)" : " — jeeva / self (male)") : p === "Venus" ? (hi ? " — जीवनसाथी / स्वयं (कन्या)" : " — spouse / self (female)") : ""}</option>)}
          </select>
        </div>
      </div>

      {/* directional chart */}
      <div style={{ ...T.label, color: C.muted, margin: "1.125rem 0 0.5rem" }}>{hi ? "दिशा चक्र · ग्रह अंश के क्रम में (कम अंश आरंभ करता है)" : "Directional chart · planets ordered by degree (lower initiates)"}</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "0.625rem" }}>
        {bnn.directional.map((d) => (
          <div key={d.direction} style={{ ...card, padding: "0.75rem 0.875rem", borderTop: `0.1875rem solid ${dirColor[d.direction]}` }}>
            <div style={{ fontFamily: "var(--font-display-family)", fontSize: "var(--font-body)", color: dirColor[d.direction], marginBottom: "0.5rem" }}>{d.direction}</div>
            {d.planets.length === 0 ? <div style={{ fontSize: "var(--font-small)", color: C.muted, fontStyle: "italic" }}>—</div> :
              d.planets.map((p) => (
                <div key={p.name} style={{ display: "flex", justifyContent: "space-between", gap: "0.5rem", fontSize: "var(--font-small)", padding: "0.125rem 0" }}>
                  <span style={{ fontFamily: "var(--font-display-family)", color: C.ivory }}>{PL(p.name)}{p.retro ? <span style={{ color: C.sindoor, fontSize: "var(--font-label)" }}> ℞</span> : ""}</span>
                  <span style={{ color: C.muted, fontSize: "var(--font-label)", fontVariantNumeric: "tabular-nums" }}>{signShort(lang, p.sign)} {fmtD(p.deg)}</span>
                </div>
              ))}
          </div>
        ))}
      </div>

      {/* relation grid from reference */}
      <div style={{ ...T.label, color: C.muted, margin: `${T.s5} 0 ${T.s2}` }}>
        {hi ? `${PL(ref)} के साथ संबंध` : `Combinations with ${ref}`} <span style={{ textTransform: "none", letterSpacing: 0 }}>— {hi ? "पारंपरिक कारकत्व" : BNN_KARAKA[ref]}</span>
      </div>
      <div style={{ ...card, padding: "0.375rem 0.25rem" }}>
        {RELS.map(([key, title, sub], i) => {
          const names = rel.buckets[key];
          const isHidden = key === "hidden";
          const strong = key === "conjunct" || key === "h5" || key === "h9";
          return (
            <div key={key} style={{ display: "grid", gridTemplateColumns: "128px 1fr", gap: "0.625rem", padding: "0.5625rem 0.75rem", borderTop: i ? "0.0625rem solid var(--line-soft)" : "none", alignItems: "start" }}>
              <div>
                <div style={{ fontFamily: "var(--font-display-family)", fontSize: "var(--font-small)", color: isHidden ? C.sindoor : strong ? "var(--good)" : C.gold }}>{title}</div>
                <div style={{ fontSize: "var(--font-micro)", color: C.muted }}>{sub}</div>
              </div>
              <div style={{ paddingTop: "0.0625rem" }}>
                {names.length === 0 ? <span style={{ fontSize: "var(--font-small)", color: C.line }}>—</span> :
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.25rem 0.875rem" }}>
                    {names.map((n) => tag(PL(n), BNN_KARAKA[n].split(",")[0]))}
                  </div>}
              </div>
            </div>
          );
        })}
      </div>

      {/* core combinations */}
      <div style={{ ...T.label, color: C.muted, margin: `${T.s5} 0 ${T.s2}` }}>{hi ? "सात मुख्य ग्रह-संबंध" : "Seven core combinations"}</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "0.5rem" }}>
        {bnn.coreCombos.map((c) => (
          <div key={c.pair.join()} style={{ ...card, padding: "0.6875rem 0.8125rem", borderLeft: `0.1875rem solid ${c.active ? "var(--good)" : C.line}`, opacity: c.active ? 1 : 0.6 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ fontFamily: "var(--font-display-family)", fontSize: "var(--font-body)", color: c.active ? C.ivory : C.muted }}>{PL(c.pair[0])} + {PL(c.pair[1])}</span>
              <span style={{ fontSize: "var(--font-micro)", letterSpacing: ".1em", textTransform: "uppercase", color: c.active ? "var(--good)" : C.muted }}>{c.active ? (hi ? "सक्रिय" : "active") : "—"}</span>
            </div>
            <div style={{ fontSize: "var(--font-label)", color: C.muted, marginTop: "0.1875rem" }}>{c.relation}</div>
            <div style={{ fontSize: "var(--font-label)", color: c.active ? C.ivory : C.muted, marginTop: "0.3125rem", lineHeight: 1.4, fontStyle: c.active ? "normal" : "italic" }}>{themeText(c.meaning)}</div>
          </div>
        ))}
      </div>

      {/* modulators */}
      {(bnn.parivartana.length > 0 || (bnn.rahuKetu && (bnn.rahuKetu.rahuSide.length || bnn.rahuKetu.ketuSide.length)) || bnn.retroShadow.length > 0) && (
        <div style={{ ...card, padding: "0.8125rem 0.9375rem", marginTop: "1rem", fontSize: "var(--font-small)", color: C.muted, lineHeight: 1.6 }}>
          {bnn.parivartana.length > 0 && <div><span style={{ color: C.gold, fontFamily: "var(--font-display-family)" }}>{hi ? "परिवर्तन योग" : "Parivartana"}</span> {hi ? "(राशि-विनिमय — दोनों को अपनी राशि जैसा पढ़ें)" : "(exchange — read each as in its own sign)"}: {bnn.parivartana.map((p) => p.map(PL).join(" ⇄ ")).join("; ")}</div>}
          {bnn.rahuKetu && <div style={{ marginTop: bnn.parivartana.length ? 6 : 0 }}><span style={{ color: C.gold, fontFamily: "var(--font-display-family)" }}>{hi ? "राहु–केतु विभाजन" : "Rahu–Ketu split"}</span> {hi ? "(अलग पक्ष के ग्रह पृथक कार्य करते हैं)" : "(separated planets act apart)"}: {hi ? "राहु पक्ष" : "Rahu side"} — {bnn.rahuKetu.rahuSide.map(PL).join(", ") || "—"} · {hi ? "केतु पक्ष" : "Ketu side"} — {bnn.rahuKetu.ketuSide.map(PL).join(", ") || "—"}</div>}
          {bnn.retroShadow.length > 0 && <div style={{ marginTop: "0.375rem" }}><span style={{ color: C.gold, fontFamily: "var(--font-display-family)" }}>{hi ? "वक्री छाया" : "Retrograde shadow"}</span> {hi ? "(द्वादश राशि से भी पढ़ें)" : "(also reads from the 12th sign)"}: {bnn.retroShadow.map((r) => `${PL(r.name)} → ${signShort(lang, r.shadowSign)}`).join(", ")}</div>}
        </div>
      )}

      {/* Jupiter transit timing */}
      <div style={{ ...T.label, color: C.muted, margin: `${T.s5} 0 ${T.s2}` }}>{hi ? "गुरु गोचर · समय" : "Jupiter transit · timing"}</div>
      <div style={{ fontSize: "var(--font-label)", color: C.muted, marginBottom: "0.5rem", lineHeight: 1.5 }}>
        {hi ? "वास्तविक गुरु गोचर — नई राशि में प्रवेश करते समय वह जन्मकुंडली के युति, त्रिकोण या विरोध वाले ग्रहों को सक्रिय करता है।" : "Real Jupiter transit — as it enters each sign it activates the natal planets it conjuncts, trines or opposes, bringing that combination into season."}{satNow != null && <> {hi ? "कर्म-घड़ी शनि अभी" : "Saturn, the fate-clock, currently transits"} <span style={{ color: C.gold }}>{signShort(lang, satNow)}</span>{hi ? " में है।" : "."}</>}
      </div>
      <div style={{ ...card, padding: "0.25rem 0.25rem", maxHeight: "26.875rem", overflowY: "auto" }}>
        {timing.map((p, i) => {
          const isNow = p.enter != null && p.exit != null && nowMs >= p.enter && nowMs < p.exit;
          const quiet = p.activated.length === 0;
          return (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "94px 1fr", gap: "0.625rem", padding: "0.5rem 0.75rem", borderTop: i ? "0.0625rem solid var(--line-soft)" : "none", background: isNow ? "var(--surface-hover)" : "transparent", alignItems: "start" }}>
              <div>
                <div style={{ fontFamily: "var(--font-display-family)", fontSize: "var(--font-body)", color: isNow ? C.gold : C.ivory }}>{signShort(lang, p.sign)}{isNow && <span style={{ fontSize: "var(--font-micro)", letterSpacing: ".12em" }}> {hi ? "अभी" : "NOW"}</span>}</div>
                <div style={{ fontSize: "var(--font-micro)", color: C.muted, fontVariantNumeric: "tabular-nums" }}>{p.enter ? fmtDateT(p.enter, tz, false) : "…"}</div>
              </div>
              <div style={{ paddingTop: "0.0625rem" }}>
                {quiet ? <span style={{ fontSize: "var(--font-small)", color: C.line }}>{hi ? "— शांत (जन्म ग्रह से संबंध नहीं)" : "— quiet (no natal contact)"}</span> :
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.25rem 0.375rem" }}>
                    {p.activated.map((a) => {
                      const c = a.relation === "conjunct" ? { bg: "var(--good-surface)", fg: "var(--good)", b: "var(--good)" } : a.relation === "trine" ? { bg: "transparent", fg: C.gold, b: C.line } : { bg: "transparent", fg: C.muted, b: C.line };
                      return <span key={a.planet} title={themeText(a.theme)} style={{ fontSize: "var(--font-label)", padding: "0.125rem 0.5rem", borderRadius: "0.6875rem", border: `0.0625rem solid ${c.b}`, background: c.bg, color: c.fg }}>{PL(a.planet)} <span style={{ fontSize: "var(--font-micro)", opacity: 0.8 }}>{hi ? (relationHi[a.relation] || a.relation) : a.relation}</span></span>;
                    })}
                  </div>}
                {isNow && !quiet && (
                  <div style={{ marginTop: "0.375rem", fontSize: "var(--font-label)", color: C.muted, lineHeight: 1.45 }}>
                    {p.activated.filter((a) => a.relation === "conjunct" || a.relation === "trine").slice(0, 2).map((a) => <div key={a.planet}>{hi ? "गुरु" : "Jupiter"} + {PL(a.planet)}: {themeText(a.theme)}</div>)}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Tier C — hedged traditional reading (themes, not prediction) */}
      <div style={{ ...T.label, color: C.muted, margin: `${T.s5} 0 ${T.s2}` }}>{hi ? `परंपरा इसे कैसे पढ़ती है · ${PL(ref)}` : `How the tradition reads this · ${ref}`}</div>
      <div style={{ ...card, padding: "1rem 1.125rem", borderTop: `0.1875rem solid ${C.gold}` }}>
        <div style={{ fontSize: "var(--font-small)", color: C.ivory, lineHeight: 1.6 }}>
          {hi ? <><span style={{ fontFamily: "var(--font-display-family)", color: C.gold }}>{PL(reading.self)}</span> को संदर्भ मानकर बीएनएन परंपरा इन सक्रिय ग्रह-संबंधों को विषयों के रूप में पढ़ती है:</> : <>With <span style={{ fontFamily: "var(--font-display-family)", color: C.gold }}>{reading.self}</span> as the reference ({reading.selfKaraka}), BNN tradition reads its active combinations as these themes:</>}
        </div>
        {reading.active.length === 0 ? (
          <div style={{ fontSize: "var(--font-small)", color: C.muted, marginTop: "0.625rem", fontStyle: "italic" }}>{hi ? `${PL(reading.self)} के साथ कोई ग्रह-संबंध नहीं है — इसे मुख्यतः उसकी राशि के गुणों से पढ़ें।` : `No planets stand in combination with ${reading.self} — the tradition would read it as largely on its own, taking the quality of its sign.`}</div>
        ) : (
          <ul style={{ margin: "0.625rem 0 0", padding: 0, listStyle: "none" }}>
            {reading.active.map((a) => (
              <li key={a.planet} style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "0.625rem", padding: "0.375rem 0", borderTop: "0.0625rem solid var(--line-soft)", alignItems: "baseline" }}>
                <span style={{ fontFamily: "var(--font-display-family)", fontSize: "var(--font-small)", color: C.gold, whiteSpace: "nowrap" }}>+ {PL(a.planet)} <span style={{ fontSize: "var(--font-micro)", color: C.muted }}>{a.relation}</span></span>
                <span style={{ fontSize: "var(--font-small)", color: C.muted, lineHeight: 1.45 }}>{themeText(a.theme)}</span>
              </li>
            ))}
          </ul>
        )}
        {reading.obstructed.length > 0 && (
          <div style={{ fontSize: "var(--font-label)", color: C.muted, marginTop: "0.75rem", lineHeight: 1.45 }}>
            <span style={{ color: C.sindoor }}>{hi ? "अवरुद्ध रूप में पढ़ें" : "Read as obstructed"}</span> {hi ? "(गुप्त 4/6/8/10 भावों में)" : "(in the hidden 4/6/8/10 houses)"}: {reading.obstructed.map((o) => PL(o.planet)).join(", ")} — {hi ? "इन कारकत्वों को रुका हुआ या भीतर की ओर मुड़ा माना जाता है।" : "the tradition treats these significations as held back or turned inward."}
          </div>
        )}
        <div style={{ fontSize: "var(--font-label)", color: C.muted, marginTop: "0.875rem", paddingTop: "0.75rem", borderTop: `0.0625rem dashed ${C.line}`, lineHeight: 1.55, fontStyle: "italic" }}>
          {hi ? <>ये बीएनएन परंपरा के व्याख्यात्मक विषय हैं, आपके बारे में निश्चित भविष्यवाणी नहीं। वास्तविक पठन में पूरी ग्रह-<em>श्रृंखला</em>, ग्रहबल और गुरु–शनि समय को साथ देखा जाता है। यह दृश्य किसी विशेष घटना, स्वास्थ्य या निश्चित समय का दावा नहीं करता और योग्य ज्योतिषी का विकल्प नहीं है।</> : <>These are interpretive themes from the BNN tradition, not predictions about you. A real reading is the whole <em>chain</em> weighed together — by each planet's strength, the surrounding combinations, and Jupiter/Saturn timing — and is the judgment of a practitioner. This view deliberately stops at themes: it makes no claim about specific events, health, or timing, and isn't a substitute for a qualified astrologer.</>}
        </div>
      </div>

      <p style={{ color: C.muted, fontSize: "var(--font-label)", marginTop: "1rem", lineHeight: 1.55 }}>
        {hi ? <>यह बीएनएन की गणना-रचना दिखाता है—दिशा समूह, चुने हुए कारक के संबंध और उन पर काम करने वाले संशोधक। यह अंतिम फलादेश नहीं है; नाड़ी पठन जिस संरचित आधार से बनता है, उसे समझने का साधन है।</> : <>This surfaces the BNN geometry — directional grouping, the combinations with your chosen karaka, and the modulators acting on them — plus each planet's traditional signification. It deliberately stops short of a verdict: BNN reads the <em>chain</em> of combinations, with intensity set by exaltation, debilitation, retrogression and exchange, and the same combination means different things in different chains. Treat this as the structured input a Nadi reading is built from, not the reading itself.</>}
      </p>
    </div>
  );
}

function BhriguModule({ rows, ascSign, birthMs, tz, C, card, lang = "en" }) {
  const hi = lang === "hi";
  const PL = (name) => panchangTerm(lang, "planet", name); // see BNNModule — engine key in, display name out
  const YEAR_MS = 365.25 * 86400000;
  const currentAge = Math.max(0, Math.floor((Date.now() - birthMs) / YEAR_MS));
  const birthYear = new Date(birthMs + tz * 3600000).getFullYear();
  const bcp = useMemo(() => bcpTimeline(ascSign, rows, Math.max(1, currentAge - 3), currentAge + 16), [rows, ascSign, currentAge]);
  const bsp = useMemo(() => bspRules(ascSign, rows), [rows, ascSign]);
  const prog = useMemo(() => jupiterProgression(rows, Math.max(0, currentAge - 2), currentAge + 12), [rows, currentAge]);
  const ord = (n) => hi ? `${n}वाँ` : n + (["th", "st", "nd", "rd"][(n % 100 >> 3 ^ 1) && n % 10] || "th");
  const lordColor = { Sun: "var(--bad)", Moon: "color-mix(in srgb, #5B7Fb0, var(--ink) 26%)", Mars: "color-mix(in srgb, #B23B2E, var(--ink) 26%)", Mercury: "var(--good)", Jupiter: "var(--accent)", Venus: "color-mix(in srgb, #9A5BA3, var(--ink) 26%)", Saturn: "color-mix(in srgb, #52606D, var(--ink) 26%)", Rahu: "color-mix(in srgb, #6B4E8A, var(--ink) 26%)", Ketu: "color-mix(in srgb, #7A6A52, var(--ink) 26%)" };
  const sub = { fontSize: "var(--font-label)", color: C.muted, marginBottom: "0.5rem", lineHeight: 1.5 };

  return (
    <div>
      {/* BCP house progression */}
      <div style={{ ...T.label, color: C.muted, margin: "0.25rem 0 0.5rem" }}>{hi ? "भृगु चक्र · प्रति वर्ष एक भाव" : "Bhrigu Chakra · one house per year"}</div>
      <div style={sub}>{hi ? "लग्न से पहला वर्ष प्रथम भाव, दूसरा वर्ष द्वितीय भाव और इसी क्रम में चक्र हर 12 वर्ष में दोहरता है। प्रत्येक 12-वर्षीय चक्र का एक चक्र-स्वामी होता है।" : "From the Ascendant, year 1 is the 1st house, year 2 the 2nd, and so on — the chakra rotating every 12 years. Each 12-year cycle carries a Cycle Lord (Chakra Swami) that colours it."}</div>
      <div style={{ ...card, padding: "0.25rem 0.25rem", maxHeight: "22.5rem", overflowY: "auto" }}>
        {bcp.map((b, i) => {
          const isNow = b.age === currentAge;
          return (
            <div key={b.age} style={{ display: "grid", gridTemplateColumns: "74px 86px 1fr", gap: "0.5rem", padding: "0.4375rem 0.75rem", borderTop: i ? "0.0625rem solid var(--line-soft)" : "none", background: isNow ? "var(--surface-hover)" : "transparent", alignItems: "baseline" }}>
              <div>
                <div style={{ fontFamily: "var(--font-display-family)", fontSize: "var(--font-small)", color: isNow ? C.gold : C.ivory }}>{hi ? "आयु" : "age"} {b.age}{isNow && <span style={{ fontSize: "var(--font-micro)", letterSpacing: ".1em" }}> {hi ? "अभी" : "NOW"}</span>}</div>
                <div style={{ fontSize: "var(--font-micro)", color: C.muted }}>~{birthYear + b.age}</div>
              </div>
              <div>
                <div style={{ fontSize: "var(--font-small)", color: C.ivory }}>{ord(b.houseNum)} · {signShort(lang, b.sign)}</div>
                <div style={{ fontSize: "var(--font-micro)", letterSpacing: ".06em", color: lordColor[b.cycleLord] || C.muted }}>{PL(b.cycleLord)} {hi ? "चक्र" : "cycle"}</div>
              </div>
              <div style={{ fontSize: "var(--font-label)", color: C.muted, lineHeight: 1.4 }}>
                {hi ? "इस वर्ष सक्रिय भाव के सामान्य जीवन-विषय" : b.theme}
                {b.occupants.length > 0 && <span style={{ color: C.gold }}> · {b.occupants.map(PL).join(", ")} {hi ? "यहाँ" : "here"}</span>}
              </div>
            </div>
          );
        })}
      </div>

      {/* BSP implements-rules */}
      <div style={{ ...T.label, color: C.muted, margin: `${T.s5} 0 ${T.s2}` }}>{hi ? "भृगु सरल · सक्रियण नियम" : "Bhrigu Saral · implements-rules"} <span style={{ textTransform: "none", letterSpacing: 0, fontSize: "var(--font-micro)" }}>({hi ? "प्रलेखित अंश" : "documented subset"})</span></div>
      <div style={sub}>{hi ? "प्रत्येक नियम उस आयु को दिखाता है जब ग्रह अपने से गिने विशेष भाव को सक्रिय करता है। यह संरचनात्मक मानचित्र है, घटना की निश्चित भविष्यवाणी नहीं।" : "Each rule fixes a year when a planet \"implements\" a particular house counted from itself. Shown as the house it lands on in this chart, with significations — a structural map, not an event forecast."}</div>
      <div style={{ ...card, padding: "0.25rem 0.25rem" }}>
        {bsp.map((r, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "118px 1fr", gap: "0.625rem", padding: "0.5625rem 0.75rem", borderTop: i ? "0.0625rem solid var(--line-soft)" : "none", alignItems: "baseline" }}>
            <div>
              <div style={{ fontFamily: "var(--font-display-family)", fontSize: "var(--font-small)", color: lordColor[r.planet] || C.ivory }}>{PL(r.planet)}</div>
              <div style={{ fontSize: "var(--font-micro)", color: C.muted }}>{r.age ? `${hi ? "आयु" : "age"} ${r.age}` : (hi ? "जीवनभर" : "lifelong")} · {hi ? `अपने से ${ord(r.from)}` : `${ord(r.from)} from self`}</div>
            </div>
            <div style={{ fontSize: "var(--font-label)", color: C.muted, lineHeight: 1.45 }}>
              {hi ? "पड़ता है" : "lands on"} <span style={{ color: C.ivory }}>{signShort(lang, r.targetSign)}</span> ({hi ? `लग्न से ${ord(r.houseFromLagna)} भाव` : `${ord(r.houseFromLagna)} house`}) — {hi ? "इस भाव के विषय सक्रिय माने जाते हैं" : r.theme}
              {r.occupants.length > 0 && <span style={{ color: C.gold }}> · {hi ? "साथ" : "with"} {r.occupants.map(PL).join(", ")}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Jupiter symbolic progression */}
      <div style={{ ...T.label, color: C.muted, margin: `${T.s5} 0 ${T.s2}` }}>{hi ? "गुरु प्रगति · प्रति वर्ष 1 राशि" : "Jupiter progression · 1 sign / year"}</div>
      <div style={sub}>{hi ? "यह बीएनएन के वास्तविक गोचर समय का प्रतीकात्मक साथी है: जन्म गुरु को हर आयु-वर्ष एक राशि आगे बढ़ाया जाता है। दोनों विधियों के अंतर को साधक साथ में तौलते हैं।" : "The symbolic counterpart to the real-transit timing in the BNN section: natal Jupiter advanced one sign per year of age. The two methods diverge — that divergence is itself a thing practitioners weigh."}</div>
      <div style={{ ...card, padding: "0.25rem 0.25rem", maxHeight: "20rem", overflowY: "auto" }}>
        {prog.timeline.map((p, i) => {
          const isNow = p.age === currentAge;
          const quiet = p.activated.length === 0;
          return (
            <div key={p.age} style={{ display: "grid", gridTemplateColumns: "90px 60px 1fr", gap: "0.5rem", padding: "0.4375rem 0.75rem", borderTop: i ? "0.0625rem solid var(--line-soft)" : "none", background: isNow ? "var(--surface-hover)" : "transparent", alignItems: "baseline" }}>
              <div style={{ fontFamily: "var(--font-display-family)", fontSize: "var(--font-small)", color: isNow ? C.gold : C.ivory }}>{hi ? "आयु" : "age"} {p.age}{isNow && <span style={{ fontSize: "var(--font-micro)" }}> {hi ? "अभी" : "NOW"}</span>}</div>
              <div style={{ fontSize: "var(--font-small)", color: C.ivory }}>{signShort(lang, p.progSign)}</div>
              <div style={{ paddingTop: "0.0625rem" }}>
                {quiet ? <span style={{ fontSize: "var(--font-label)", color: C.line }}>{hi ? "— शांत" : "— quiet"}</span> :
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.1875rem 0.375rem" }}>
                    {p.activated.map((a) => {
                      const c = a.relation === "conjunct" ? "var(--good)" : a.relation === "trine" ? C.gold : C.muted;
                      return <span key={a.planet} title={hi ? "ग्रह-संबंध सक्रिय" : a.theme} style={{ fontSize: "var(--font-label)", padding: "0.0625rem 0.4375rem", borderRadius: "0.625rem", border: `0.0625rem solid ${C.line}`, color: c }}>{PL(a.planet)} <span style={{ fontSize: "var(--font-micro)", opacity: 0.8 }}>{hi ? ({ conjunct: "युति", trine: "त्रिकोण", opposition: "विरोध" }[a.relation] || a.relation) : a.relation}</span></span>;
                    })}
                  </div>}
              </div>
            </div>
          );
        })}
      </div>

      <p style={{ color: C.muted, fontSize: "var(--font-label)", marginTop: "1rem", lineHeight: 1.55 }}>
        {hi ? <>ये प्रगति-विधियाँ बताती हैं कि किस वर्ष परंपरा किस भाव या राशि को देखने को कहती है। यह <em>कब ध्यान दें</em> का संरचित मानचित्र है, क्या होगा की निश्चित भविष्यवाणी नहीं। दीर्घायु संबंधी नियम जानबूझकर शामिल नहीं किए गए हैं; इसे किसी साधक के साथ पढ़ें, उसके स्थान पर नहीं।</> : <>These are progression mechanics — which house or sign a method points to in a given year — surfaced with the standard significations of those houses. They are a structured map of <em>when</em> the tradition would have you look, not a forecast of what will happen. The BSP set is a widely-documented subset, not the complete proprietary system, and the longevity rules are deliberately excluded. Read alongside a practitioner, not in place of one.</>}
      </p>
    </div>
  );
}

export { BNNModule, BhriguModule };
