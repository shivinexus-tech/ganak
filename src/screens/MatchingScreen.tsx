import React, { useState, useEffect } from "react";
import { T } from "../components/ui-style-contract";
import PlaceInput from "../components/PlaceInput";
import { zoneOffset } from "../engine/panchang";
import { computeMatch } from "../engine/matching";

/* Kundali Matching UI — pure extraction (SPLIT-UI-MATCH-01).
   computeKundli is injected from the shell until the chart engine is extracted. */

function DoshaCard({ C, card, ok, title, good, bad }) {
  return (
    <div style={{ ...card, padding: "14px 16px", borderLeft: `3px solid ${ok ? "#1F7A4D" : C.sindoor}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <span style={{ fontSize: 15 }}>{ok ? "✓" : "⚠"}</span>
        <span style={{ fontFamily: "Eczar, serif", color: ok ? "#1F7A4D" : C.sindoor, fontSize: 15 }}>{title}</span>
      </div>
      <div style={{ color: C.muted, fontSize: 12.5, lineHeight: 1.5 }}>{ok ? good : bad}</div>
    </div>
  );
}

function MatchPerson({ C, card, title, name, setName, date, setDate, time, setTime, place, setPlace, lang }) {
  const hi = lang === "hi";
  const inp = { width: "100%", padding: "10px 12px", background: "#FFFDF7", border: `1px solid ${C.line}`, borderRadius: 8, color: C.ivory, fontFamily: "Spectral, serif", fontSize: 15, boxSizing: "border-box" };
  const lab = { display: "block", ...T.label, color: C.muted, marginBottom: 5 };
  return (
    <div style={{ ...card, padding: T.s4 }}>
      <div style={{ fontFamily: "Eczar, serif", color: C.gold, fontSize: 16, marginBottom: 12 }}>{title}</div>
      <div style={{ display: "grid", gap: 10 }}>
        <div><label style={lab}>{hi ? "नाम" : "Name"}</label><input style={inp} value={name} onChange={(e) => setName(e.target.value)} placeholder={hi ? "वैकल्पिक" : "optional"} /></div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div><label style={lab}>{hi ? "जन्म तिथि" : "Date of birth"}</label><input style={inp} type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
          <div><label style={lab}>{hi ? "जन्म समय" : "Time"}</label><input style={inp} type="time" value={time} onChange={(e) => setTime(e.target.value)} /></div>
        </div>
        <div><label style={lab}>{hi ? "जन्म स्थान" : "Place of birth"}</label><PlaceInput value={place} onPick={setPlace} C={C} lang={lang} /></div>
      </div>
    </div>
  );
}

function MatchMaker({ C, card, computeKundli, lang = "en" }) {
  const hi = lang === "hi";
  const [boyName, setBoyName] = useState("");
  const [girlName, setGirlName] = useState("");
  const [bDate, setBDate] = useState("1990-04-12");
  const [bTime, setBTime] = useState("09:30");
  const [bPlace, setBPlace] = useState({ label: "New Delhi, India", lat: 28.61, lon: 77.21, zone: "Asia/Kolkata" });
  const [gDate, setGDate] = useState("1992-11-20");
  const [gTime, setGTime] = useState("14:15");
  const [gPlace, setGPlace] = useState({ label: "Mumbai, India", lat: 19.08, lon: 72.88, zone: "Asia/Kolkata" });
  const [res, setRes] = useState(null);
  const [err, setErr] = useState("");
  // Editing either person invalidates the previous match: drop the old result so
  // stale scores don't linger AND the print-only header (which only renders when
  // `res` exists) can never pair new birth details with old scores (Codex F2).
  useEffect(() => { setRes(null); setErr(""); }, [boyName, girlName, bDate, bTime, bPlace, gDate, gTime, gPlace]);

  const run = () => {
    setErr("");
    const [by, bm, bd] = (bDate || "").split("-").map(Number);
    const [bhh, bmi] = (bTime || "").split(":").map(Number);
    const [gy, gm, gd] = (gDate || "").split("-").map(Number);
    const [ghh, gmi] = (gTime || "").split(":").map(Number);
    if (!by || isNaN(bhh) || !gy || isNaN(ghh)) { setErr(hi ? "दोनों व्यक्तियों की पूरी जन्म तिथि और समय भरें।" : "Enter a complete date and time of birth for both people."); return; }
    if (!bPlace || !gPlace) { setErr(hi ? "दोनों व्यक्तियों का जन्म स्थान सुझावों में से चुनें।" : "Pick a birth place for both people from the suggestions."); return; }
    const btz = zoneOffset(bPlace.zone, by, bm, bd) ?? 5.5;
    const gtz = zoneOffset(gPlace.zone, gy, gm, gd) ?? 5.5;
    setRes(computeMatch(computeKundli,
      { y: by, m: bm, day: bd, hh: bhh, mi: bmi, tz: btz, lat: bPlace.lat, lon: bPlace.lon },
      { y: gy, m: gm, day: gd, hh: ghh, mi: gmi, tz: gtz, lat: gPlace.lat, lon: gPlace.lon }
    ));
    setTimeout(() => { const el = document.getElementById("matchresult"); if (el) el.scrollIntoView({ behavior: "smooth" }); }, 150);
  };

  const verdict = (t) => t >= 33 ? [hi ? "उत्कृष्ट मिलान" : "Excellent match", "#1F7A4D"] : t >= 25 ? [hi ? "बहुत अच्छा मिलान" : "Very good match", C.gold] : t >= 18 ? [hi ? "स्वीकार्य मिलान" : "Acceptable match", "#B0610F"] : [hi ? "सावधानी आवश्यक" : "Not recommended", C.sindoor];
  const kootaHi = { Varna: "वर्ण", Vashya: "वश्य", Tara: "तारा", Yoni: "योनि", "Graha Maitri": "ग्रह मैत्री", Gana: "गण", Bhakoot: "भकूट", Nadi: "नाड़ी" };

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
        <MatchPerson C={C} card={card} lang={lang} title={hi ? "वर" : "Groom"} name={boyName} setName={setBoyName} date={bDate} setDate={setBDate} time={bTime} setTime={setBTime} place={bPlace} setPlace={setBPlace} />
        <MatchPerson C={C} card={card} lang={lang} title={hi ? "कन्या" : "Bride"} name={girlName} setName={setGirlName} date={gDate} setDate={setGDate} time={gTime} setTime={setGTime} place={gPlace} setPlace={setGPlace} />
      </div>
      <button onClick={run} style={{ marginTop: 16, width: "100%", padding: "13px 0", background: "linear-gradient(180deg, #E08A22, #C9711A 55%, #B0610F)", color: "#FFF8E9", border: "1px solid #D98E33", borderRadius: 9, fontFamily: "Eczar, serif", fontWeight: 700, fontSize: 16, letterSpacing: "0.06em", cursor: "pointer", boxShadow: "0 6px 18px rgba(168,106,18,.25)" }}>
        {hi ? "कुंडलियों का मिलान करें" : "Match the kundalis"}
      </button>
      {err && <p style={{ color: C.sindoor, fontSize: 13, marginTop: 10 }}>{err}</p>}

      {res && (() => {
        const [vlabel, vcolor] = verdict(res.total);
        const mBoy = res.manglik.boy, mGirl = res.manglik.girl, mOk = res.manglik.cancelled;
        return (
          <div id="matchresult" style={{ marginTop: 20 }}>
            <div className="no-print" style={{ display: "flex", justifyContent: "flex-end", marginBottom: 6 }}>
              <button onClick={() => window.print()} style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "8px 16px", borderRadius: 9, border: `1px solid ${C.gold}`, background: "#FFFDF7", color: C.gold, cursor: "pointer", fontFamily: "Spectral, serif", fontSize: 13 }}>
                ⬇ {hi ? "पीडीएफ़ सहेजें" : "Save as PDF"}
              </button>
            </div>
            <div className="print-only" style={{ textAlign: "center", marginBottom: 18, borderBottom: `2px solid ${C.gold}`, paddingBottom: 12 }}>
              <div style={{ fontFamily: "Eczar, serif", fontSize: 24, color: C.gold }}>{hi ? "कुण्डली मिलान" : "Kundali Matching"}</div>
              <div style={{ fontSize: 13, color: C.ivory, marginTop: 4 }}>
                {(boyName || (hi ? "वर" : "Groom"))} ({bDate} · {bTime} · {bPlace?.label}) &nbsp;✦&nbsp; {(girlName || (hi ? "कन्या" : "Bride"))} ({gDate} · {gTime} · {gPlace?.label})
              </div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 3, letterSpacing: ".08em" }}>Ganak · ganak.pages.dev</div>
            </div>
            <div style={{ ...card, padding: "22px 20px", textAlign: "center", borderTop: `3px solid ${vcolor}` }}>
              <div style={{ ...T.label, color: C.muted }}>{hi ? "अष्टकूट गुण मिलान" : "Ashtakoota Guna Milan"}</div>
              <div style={{ fontFamily: "Eczar, serif", fontSize: 46, color: vcolor, lineHeight: 1.1, margin: "4px 0" }}>{res.total}<span style={{ fontSize: 22, color: C.muted }}> / 36</span></div>
              <div style={{ fontFamily: "Eczar, serif", fontSize: 18, color: vcolor }}>{vlabel}</div>
            </div>

            <div style={{ ...card, padding: "8px 4px", overflowX: "auto", marginTop: 14 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5, minWidth: 360 }}>
                <thead><tr style={{ color: C.muted, textAlign: "left", fontSize: 11, letterSpacing: ".05em", textTransform: "uppercase" }}>
                  <th style={{ padding: "7px 10px" }}>{hi ? "कूट" : "Koota"}</th><th style={{ padding: "7px 10px" }}>{hi ? "विवरण" : "Detail"}</th><th style={{ padding: "7px 10px", textAlign: "right" }}>{hi ? "अंक" : "Points"}</th>
                </tr></thead>
                <tbody>
                  {res.kootas.map((k) => {
                    const full = k.got === k.max, zero = k.got === 0;
                    return (
                      <tr key={k.name} style={{ borderTop: "1px solid #EBDFC6" }}>
                        <td style={{ padding: "8px 10px", fontFamily: "Eczar, serif", color: C.ivory, whiteSpace: "nowrap" }}>{hi ? (kootaHi[k.name] || k.name) : k.name}</td>
                        <td style={{ padding: "8px 10px", color: C.muted, fontSize: 12.5 }}>{hi ? "चंद्र राशि और जन्म नक्षत्र पर आधारित संगति" : k.note}</td>
                        <td style={{ padding: "8px 10px", textAlign: "right", fontVariantNumeric: "tabular-nums", color: zero ? C.sindoor : full ? "#1F7A4D" : C.gold, fontWeight: 700, whiteSpace: "nowrap" }}>{k.got} / {k.max}</td>
                      </tr>
                    );
                  })}
                  <tr style={{ borderTop: `2px solid ${C.line}` }}>
                    <td style={{ padding: "9px 10px", fontFamily: "Eczar, serif", color: C.gold }} colSpan={2}>{hi ? "कुल" : "Total"}</td>
                    <td style={{ padding: "9px 10px", textAlign: "right", fontFamily: "Eczar, serif", fontWeight: 700, color: vcolor, whiteSpace: "nowrap" }}>{res.total} / 36</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10, marginTop: 14 }}>
              <DoshaCard C={C} card={card} ok={!res.nadiDosha} title={hi ? "नाड़ी दोष" : "Nadi dosha"}
                good={hi ? "स्पष्ट — दोनों की नाड़ियाँ अलग हैं।" : "Clear — the partners have different nadis."} bad={hi ? "उपस्थित — दोनों की नाड़ी समान है। परंपरा में इसे सावधानी का संकेत माना जाता है; संपूर्ण कुंडली का परीक्षण आवश्यक है।" : "Present — both share the same nadi. The weightiest koota (8 points lost); tradition advises caution, though strong overall charts and remedies are said to mitigate it."} />
              <DoshaCard C={C} card={card} ok={!res.bhakootDosha} title={hi ? "भकूट दोष" : "Bhakoot dosha"}
                good={hi ? "स्पष्ट — चंद्र राशियों का संबंध अनुकूल है।" : "Clear — the Moon signs are favourably placed."} bad={hi ? "उपस्थित — चंद्र राशियाँ 2/12, 5/9 या 6/8 संबंध में हैं। भावनात्मक सामंजस्य और समृद्धि के लिए पूरी कुंडली देखें।" : "Present — the Moon signs form a 2/12, 5/9 or 6/8 axis, said to bear on emotional harmony, health and prosperity."} />
              <DoshaCard C={C} card={card} ok={mOk} title={hi ? "मांगलिक दोष" : "Manglik (Mangal) dosha"}
                good={hi ? ((mBoy || mGirl) ? "दोनों मांगलिक हैं — परंपरा में दोष का परस्पर निरसन माना जाता है।" : "स्पष्ट — लग्न से कोई भी मांगलिक नहीं है।") : ((mBoy || mGirl) ? "Both partners are Manglik — the dosha is considered mutually cancelled." : "Clear — neither partner is Manglik from the Lagna.")}
                bad={hi ? `${mBoy ? "वर" : "कन्या"} मांगलिक है और दूसरा व्यक्ति नहीं। विवाह निर्णय से पहले किसी योग्य ज्योतिषी से संपूर्ण परीक्षण कराएँ।` : (mBoy ? "The groom" : "The bride") + " is Manglik (Mars falls in house 1, 2, 4, 7, 8 or 12 from the Lagna) while the other is not. Traditionally flagged for marriage; an astrologer can advise on remedies and the Moon/Venus-based checks."} />
              <DoshaCard C={C} card={card} ok={res.papa.balanced} title={hi ? "पापसाम्य (पाप-भार)" : "Papasamyam (papa load)"}
                good={hi ? `संतुलित — वर ${res.papa.boy.total}/15, कन्या ${res.papa.girl.total}/15। दोनों का पापग्रह-भार तुलनीय है, जिसे परम्परा में अनुकूल माना जाता है।` : `Balanced — groom ${res.papa.boy.total}/15, bride ${res.papa.girl.total}/15. Comparable malefic loads, traditionally considered favourable.`}
                bad={hi ? `असंतुलित — वर ${res.papa.boy.total}/15, कन्या ${res.papa.girl.total}/15। ${res.papa.heavier === "boy" ? "वर" : "कन्या"} पर पापग्रह-भार अधिक है। यह अनेक पारम्परिक दृष्टियों में से एक है, अंतिम निर्णय नहीं।` : `Uneven — groom ${res.papa.boy.total}/15, bride ${res.papa.girl.total}/15. The ${res.papa.heavier === "boy" ? "groom" : "bride"} carries the heavier malefic load (Sun, Mars, Saturn, Rahu, Ketu in houses 1,2,4,7,8,12 from Lagna, Moon and Venus). One traditional lens among many, not a verdict.`} />
            </div>

            <p style={{ color: C.muted, fontSize: 12, marginTop: 14, lineHeight: 1.55 }}>
              {hi ? "गुण मिलान दोनों चंद्र राशियों और जन्म नक्षत्रों से सहज तथा पारंपरिक संगति देखता है। अधिक अंक उत्साहजनक हैं, पर यह अंतिम निर्णय नहीं है। मांगलिक स्थिति, सप्तम भाव और उसके स्वामी, शुक्र, गुरु तथा चल रही दशाओं को भी साथ में देखें।" : "Guna Milan reads instinctive and karmic compatibility from each Moon's nakshatra and rashi. A high score is encouraging but never the whole story — Manglik status, the 7th house and its lord, Venus and Jupiter, and the running dashas all matter. Treat this as a structured starting point rather than a verdict. Varna, Vashya, Gana and Yoni carry minor source variation between traditions; Nadi, Bhakoot and the Manglik check follow the standard rules and use the same validated ephemeris as the rest of the app."}
            </p>

            {res.dasha && (() => {
              const d = res.dasha;
              const KI = {
                Dina: { hi: "दिन", en: "day-to-day harmony", mHi: "दैनिक सामंजस्य व शुभता" },
                Gana: { hi: "गण", en: "temperament (deva/manushya/rakshasa)", mHi: "स्वभाव (देव/मनुष्य/राक्षस)" },
                Mahendra: { hi: "महेन्द्र", en: "wellbeing & progeny", mHi: "कल्याण व संतति" },
                "Stree Deergha": { hi: "स्त्री दीर्घ", en: "protection & longevity for the wife", mHi: "स्त्री की रक्षा व दीर्घायु" },
                Yoni: { hi: "योनि", en: "instinctive compatibility", mHi: "सहज/शारीरिक अनुकूलता" },
                Rasi: { hi: "राशि", en: "emotional & prosperity axis", mHi: "भावनात्मक व समृद्धि अक्ष (भकूट)" },
                Rasyadhipati: { hi: "राश्यधिपति", en: "sign-lord friendship", mHi: "राशि-स्वामियों की मैत्री" },
                Vashya: { hi: "वश्य", en: "mutual attraction", mHi: "परस्पर आकर्षण" },
                Rajju: { hi: "रज्जु", en: "stability & longevity of the marriage", mHi: "विवाह की स्थिरता व दीर्घता" },
                Vedha: { hi: "वेध", en: "mutual obstruction", mHi: "परस्पर बाधा" },
              };
              const V = { poor: [hi ? "सावधानी आवश्यक" : "Needs caution", C.sindoor], moderate: [hi ? "मध्यम" : "Moderate", "#B0610F"], good: [hi ? "अच्छा मिलान" : "Good match", C.gold], "very-good": [hi ? "बहुत अच्छा" : "Very good", "#1F7A4D"], excellent: [hi ? "उत्कृष्ट" : "Excellent", "#1F7A4D"] };
              const [vl, vc] = V[d.verdict];
              return (
                <div style={{ marginTop: 20 }}>
                  <div style={{ ...T.label, color: C.muted, marginBottom: 8 }}>{hi ? "दशकूट मिलान · दक्षिण भारतीय · 10 कूट" : "Dashakoota · South Indian · 10 kutas"}</div>
                  <div style={{ ...card, padding: "8px 4px", overflowX: "auto" }}>
                    <table>
                      <thead><tr><th>{hi ? "कूट" : "Kuta"}</th><th>{hi ? "अर्थ" : "Meaning"}</th><th style={{ textAlign: "right" }}>{hi ? "अंक" : "Points"}</th></tr></thead>
                      <tbody>
                        {d.kootas.map((k) => {
                          const crit = (k.name === "Rajju" || k.name === "Vedha") && k.got === 0;
                          return (
                            <tr key={k.name} style={crit ? { background: "rgba(194,69,30,.06)" } : null}>
                              <td style={{ fontFamily: "Eczar, serif", color: crit ? C.sindoor : C.gold, whiteSpace: "nowrap" }}>{hi ? KI[k.name].hi : k.name}</td>
                              <td style={{ fontSize: 12.5, color: C.muted }}>{hi ? KI[k.name].mHi : KI[k.name].en}</td>
                              <td style={{ textAlign: "right", fontVariantNumeric: "tabular-nums", color: k.got === 0 ? C.sindoor : C.ivory, whiteSpace: "nowrap" }}>{k.got} / {k.max}</td>
                            </tr>
                          );
                        })}
                        <tr><td style={{ fontFamily: "Eczar, serif", color: C.gold }} colSpan={2}>{hi ? "कुल" : "Total"}</td><td style={{ textAlign: "right", fontFamily: "Eczar, serif", fontWeight: 700, color: vc, whiteSpace: "nowrap" }}>{d.total} / 36 · {vl}</td></tr>
                      </tbody>
                    </table>
                  </div>
                  {(d.rajjuDosha || d.vedhaDosha) && (
                    <p style={{ color: C.sindoor, fontSize: 12.5, marginTop: 10, lineHeight: 1.55 }}>
                      {d.rajjuDosha && (hi ? `रज्जु दोष — दोनों की ${d.rajjuGroupHi} रज्जु समान है; दक्षिण परम्परा में इसे विवाह की स्थिरता हेतु गम्भीर माना जाता है। ` : `Rajju dosha — both share the same ${d.rajjuGroup} rajju, treated in the South-Indian tradition as a serious factor for marital stability. `)}
                      {d.vedhaDosha && (hi ? "वेध दोष — दोनों नक्षत्र परस्पर वेध करते हैं। " : "Vedha dosha — the two stars obstruct each other. ")}
                      {hi ? "इसे किसी योग्य ज्योतिषी से पूरी कुंडली सहित जँचवाएँ; यह अकेला निषेध नहीं है।" : "Have this reviewed with the full charts by a qualified astrologer; it is not a stand-alone prohibition."}
                    </p>
                  )}
                  <p style={{ color: C.muted, fontSize: 12, marginTop: 10, lineHeight: 1.55 }}>
                    {hi ? "दशकूट दक्षिण भारत में प्रचलित है और अष्टकूट के साथ-साथ देखा जाता है। रज्जु और वेध सबसे संवेदनशील माने जाते हैं। दोनों पद्धतियाँ एक ही मान्य नक्षत्र-राशि गणित पर आधारित हैं; अंक आरम्भ-बिन्दु हैं, अंतिम निर्णय नहीं।" : "Dashakoota is the South-Indian counterpart, read alongside Ashtakoota. Rajju and Vedha are treated as the most sensitive factors. Both systems use the same validated nakshatra/rashi maths; the score is a starting point for conversation, never a final verdict."}
                  </p>
                </div>
              );
            })()}
          </div>
        );
      })()}
    </div>
  );
}



export default MatchMaker;
export { MatchMaker, MatchPerson, DoshaCard };
