import React, { useState, useEffect } from "react";
import { T } from "../components/ui-style-contract";
import PlaceInput from "../components/PlaceInput";
import { zoneOffset } from "../engine/panchang";
import { computeMatch } from "../engine/matching";

/* Kundali Matching UI — pure extraction (SPLIT-UI-MATCH-01).
   computeKundli is injected from the shell until the chart engine is extracted. */

function DoshaCard({ C, card, ok, title, good, bad }) {
  return (
    <div style={{ ...card, padding: "0.875rem 1rem", borderLeft: `0.1875rem solid ${ok ? "var(--good)" : C.sindoor}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.375rem" }}>
        <span style={{ fontSize: "var(--font-body)" }}>{ok ? "✓" : "⚠"}</span>
        <span style={{ fontFamily: "var(--font-display-family)", color: ok ? "var(--good)" : C.sindoor, fontSize: "var(--font-body)" }}>{title}</span>
      </div>
      <div style={{ color: C.muted, fontSize: "var(--font-small)", lineHeight: 1.5 }}>{ok ? good : bad}</div>
    </div>
  );
}

function MatchPerson({ C, card, title, name, setName, date, setDate, time, setTime, place, setPlace, lang, onConfirmed, idPrefix }) {
  const hi = lang === "hi";
  const inp = { width: "100%", padding: "0.625rem 0.75rem", background: "var(--surface-sunken)", border: `0.0625rem solid ${C.line}`, borderRadius: "0.5rem", color: C.ivory, fontFamily: "var(--font-body-family)", fontSize: "var(--font-body)", boxSizing: "border-box" };
  const lab = { display: "block", ...T.label, color: C.muted, marginBottom: "0.3125rem" };
  return (
    <div style={{ ...card, padding: T.s4 }}>
      <div style={{ fontFamily: "var(--font-display-family)", color: C.gold, fontSize: "var(--font-title)", marginBottom: "0.75rem" }}>{title}</div>
      <div style={{ display: "grid", gap: "0.625rem" }}>
        <div><label style={lab}>{hi ? "नाम" : "Name"}</label><input style={inp} value={name} onChange={(e) => setName(e.target.value)} placeholder={hi ? "वैकल्पिक" : "optional"} /></div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.625rem" }}>
          <div><label style={lab}>{hi ? "जन्म तिथि" : "Date of birth"}</label><input style={inp} type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
          <div><label style={lab}>{hi ? "जन्म समय" : "Time"}</label><input style={inp} type="time" value={time} onChange={(e) => setTime(e.target.value)} /></div>
        </div>
        <div><label style={lab} htmlFor={`${idPrefix}-place`}>{hi ? "जन्म स्थान" : "Place of birth"}</label><PlaceInput inputId={`${idPrefix}-place`} value={place} onPick={setPlace} onConfirmed={onConfirmed} C={C} lang={lang} /></div>
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
  /* Stale-place guard (bug bash 2026-08-18, F5). PlaceInput's strict mode exists for
     exactly this — every other calculator wires it. Without it, typing "Chennai" over
     "New Delhi" and pressing Match computed the whole reading, and printed the PDF
     header, for Delhi. Default false because a place is only "confirmed" once
     PlaceInput has told us the visible text still matches the selected place. */
  const [bConfirmed, setBConfirmed] = useState(false);
  const [gConfirmed, setGConfirmed] = useState(false);
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
    if (!bConfirmed || !gConfirmed) {
      const who = !bConfirmed && !gConfirmed ? (hi ? "दोनों व्यक्तियों" : "both people") : !bConfirmed ? (hi ? "वर" : "the groom") : (hi ? "कन्या" : "the bride");
      setRes(null);
      setErr(hi ? `गणना से पहले ${who} का जन्म स्थान सुझावों में से चुनें — जो नाम टाइप किया गया है वह अभी चुने हुए स्थान से मेल नहीं खाता।`
                : `Choose a birth place from the suggestions for ${who} before matching — the typed name does not match the selected place yet.`);
      return;
    }
    const btz = zoneOffset(bPlace.zone, by, bm, bd) ?? 5.5;
    const gtz = zoneOffset(gPlace.zone, gy, gm, gd) ?? 5.5;
    setRes(computeMatch(computeKundli,
      { y: by, m: bm, day: bd, hh: bhh, mi: bmi, tz: btz, lat: bPlace.lat, lon: bPlace.lon },
      { y: gy, m: gm, day: gd, hh: ghh, mi: gmi, tz: gtz, lat: gPlace.lat, lon: gPlace.lon }
    ));
    setTimeout(() => { const el = document.getElementById("matchresult"); if (el) el.scrollIntoView({ behavior: "smooth" }); }, 150);
  };

  /* ONE verdict, computed once in the engine (matching.ts → matchVerdict) and rendered
     here. The screen used to band the Ashtakoota total on its own AND print the
     Dashakoota band as a second headline, so 1,826 of the 104,976 combinations showed
     two opposite answers on one scroll, and the English low band read as a refusal
     where the Hindi only asked for care (bug bash F3/F4). The per-system numbers
     below are now SCORES; they are never labelled as a verdict. */
  const TONE = { good: "var(--good)", gold: C.gold, accent: "var(--accent)", caution: C.sindoor };
  const kootaHi = { Varna: "वर्ण", Vashya: "वश्य", Tara: "तारा", Yoni: "योनि", "Graha Maitri": "ग्रह मैत्री", Gana: "गण", Bhakoot: "भकूट", Nadi: "नाड़ी" };

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "0.875rem" }}>
        <MatchPerson C={C} card={card} lang={lang} idPrefix="match-groom" onConfirmed={setBConfirmed} title={hi ? "वर" : "Groom"} name={boyName} setName={setBoyName} date={bDate} setDate={setBDate} time={bTime} setTime={setBTime} place={bPlace} setPlace={setBPlace} />
        <MatchPerson C={C} card={card} lang={lang} idPrefix="match-bride" onConfirmed={setGConfirmed} title={hi ? "कन्या" : "Bride"} name={girlName} setName={setGirlName} date={gDate} setDate={setGDate} time={gTime} setTime={setGTime} place={gPlace} setPlace={setGPlace} />
      </div>
      <button onClick={run} style={{ marginTop: "1rem", width: "100%", padding: "0.8125rem 0", background: "linear-gradient(180deg, var(--accent), var(--accent-strong) 55%, var(--accent))", color: "var(--on-accent)", border: "0.0625rem solid var(--gold)", borderRadius: "0.5625rem", fontFamily: "var(--font-display-family)", fontWeight: 700, fontSize: "var(--font-title)", letterSpacing: "0.06em", cursor: "pointer", boxShadow: "0 6px 18px var(--accent-soft)" }}>
        {hi ? "कुंडलियों का मिलान करें" : "Match the kundalis"}
      </button>
      {err && <p role="alert" style={{ color: C.sindoor, fontSize: "var(--font-small)", marginTop: "0.625rem" }}>{err}</p>}

      {res && (() => {
        const V = res.verdict;
        const vcolor = TONE[V.tone] || C.gold;
        const vlabel = hi ? V.labelHi : V.labelEn;
        const mBoy = res.manglik.boy, mGirl = res.manglik.girl, mOk = !res.manglik.oneSided;
        const mProf = mBoy ? res.manglik.boyProfile : res.manglik.girlProfile;
        const mRefs = mProf.refs.filter((r) => r.counted).map((r) => (hi ? r.labelHi : r.labelEn)).join(hi ? ", " : ", ");
        return (
          <div id="matchresult" style={{ marginTop: "1.25rem" }}>
            <div className="no-print" style={{ display: "flex", justifyContent: "flex-end", marginBottom: "0.375rem" }}>
              <button onClick={() => window.print()} style={{ display: "inline-flex", alignItems: "center", gap: "0.4375rem", padding: "0.5rem 1rem", borderRadius: "0.5625rem", border: `0.0625rem solid ${C.gold}`, background: "var(--surface-sunken)", color: C.gold, cursor: "pointer", fontFamily: "var(--font-body-family)", fontSize: "var(--font-small)" }}>
                ⬇ {hi ? "पीडीएफ़ सहेजें" : "Save as PDF"}
              </button>
            </div>
            <div className="print-only" style={{ textAlign: "center", marginBottom: "1.125rem", borderBottom: `0.125rem solid ${C.gold}`, paddingBottom: "0.75rem" }}>
              <div style={{ fontFamily: "var(--font-display-family)", fontSize: "var(--font-display)", color: C.gold }}>{hi ? "कुण्डली मिलान" : "Kundali Matching"}</div>
              <div style={{ fontSize: "var(--font-small)", color: C.ivory, marginTop: "0.25rem" }}>
                {(boyName || (hi ? "वर" : "Groom"))} ({bDate} · {bTime} · {bPlace?.label}) &nbsp;✦&nbsp; {(girlName || (hi ? "कन्या" : "Bride"))} ({gDate} · {gTime} · {gPlace?.label})
              </div>
              <div style={{ fontSize: "var(--font-label)", color: C.muted, marginTop: "0.1875rem", letterSpacing: ".08em" }}>Ganak · ganak.pages.dev</div>
            </div>
            <div style={{ ...card, padding: "1.375rem 1.25rem", textAlign: "center", borderTop: `0.1875rem solid ${vcolor}` }}>
              <div style={{ ...T.label, color: C.muted }}>{hi ? "मिलान का निष्कर्ष" : "Match verdict"}</div>
              <div style={{ fontFamily: "var(--font-display-family)", fontSize: "var(--font-heading)", color: vcolor, lineHeight: 1.2, margin: "0.375rem 0 0.5rem" }}>{vlabel}</div>
              <div style={{ color: C.muted, fontSize: "var(--font-small)", fontVariantNumeric: "tabular-nums" }}>
                {hi ? "अष्टकूट" : "Ashtakoota"} {V.ashta} / {V.ashtaMax} &nbsp;·&nbsp; {hi ? "दशकूट" : "Dashakoota"} {V.dasha} / {V.dashaMax}
              </div>
              {V.blocks.length > 0 && (
                <div style={{ color: C.sindoor, fontSize: "var(--font-small)", marginTop: "0.4375rem", lineHeight: 1.5 }}>
                  {hi ? "साथ में देखने योग्य" : "Standing alongside the score"}: {V.blocks.map((b) => (hi ? b.hi : b.en)).join(", ")}
                </div>
              )}
              {V.systemsDiffer && (
                <div style={{ color: C.muted, fontSize: "var(--font-label)", marginTop: "0.375rem", lineHeight: 1.5 }}>
                  {hi ? "दोनों पद्धतियाँ इस जोड़ी को अलग-अलग पढ़ती हैं; ऊपर का निष्कर्ष अधिक सतर्क पाठ के अनुसार है।" : "The two systems read this pairing differently; the verdict above follows the more cautious of the two."}
                </div>
              )}
              <div style={{ color: C.muted, fontSize: "var(--font-label)", marginTop: "0.5rem", lineHeight: 1.5 }}>
                {hi ? "अंक बातचीत का आरम्भ-बिन्दु हैं, अंतिम निर्णय नहीं।" : "The scores open the conversation; they do not close it."}
              </div>
            </div>

            <div style={{ ...T.label, color: C.muted, margin: "0.875rem 0 0.5rem" }}>{hi ? "अष्टकूट गुण मिलान" : "Ashtakoota Guna Milan"}</div>
            <div style={{ ...card, padding: "0.5rem 0.25rem", overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--font-small)", minWidth: "22.5rem" }}>
                <thead><tr style={{ color: C.muted, textAlign: "left", fontSize: "var(--font-label)", letterSpacing: ".05em", textTransform: "uppercase" }}>
                  <th style={{ padding: "0.4375rem 0.625rem" }}>{hi ? "कूट" : "Koota"}</th><th style={{ padding: "0.4375rem 0.625rem" }}>{hi ? "विवरण" : "Detail"}</th><th style={{ padding: "0.4375rem 0.625rem", textAlign: "right" }}>{hi ? "अंक" : "Points"}</th>
                </tr></thead>
                <tbody>
                  {res.kootas.map((k) => {
                    const full = k.got === k.max, zero = k.got === 0;
                    return (
                      <tr key={k.name} style={{ borderTop: "0.0625rem solid var(--line-soft)" }}>
                        <td style={{ padding: "0.5rem 0.625rem", fontFamily: "var(--font-display-family)", color: C.ivory, whiteSpace: "nowrap" }}>{hi ? (kootaHi[k.name] || k.name) : k.name}</td>
                        <td style={{ padding: "0.5rem 0.625rem", color: C.muted, fontSize: "var(--font-small)" }}>{hi ? k.noteHi : k.note}</td>
                        <td style={{ padding: "0.5rem 0.625rem", textAlign: "right", fontVariantNumeric: "tabular-nums", color: zero ? C.sindoor : full ? "var(--good)" : C.gold, fontWeight: 700, whiteSpace: "nowrap" }}>{k.got} / {k.max}</td>
                      </tr>
                    );
                  })}
                  <tr style={{ borderTop: `0.125rem solid ${C.line}` }}>
                    <td style={{ padding: "0.5625rem 0.625rem", fontFamily: "var(--font-display-family)", color: C.gold }} colSpan={2}>{hi ? "कुल" : "Total"}</td>
                    <td style={{ padding: "0.5625rem 0.625rem", textAlign: "right", fontFamily: "var(--font-display-family)", fontWeight: 700, color: vcolor, whiteSpace: "nowrap" }}>{res.total} / 36</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "0.625rem", marginTop: "0.875rem" }}>
              <DoshaCard C={C} card={card} ok={!res.nadiDosha} title={hi ? "नाड़ी दोष" : "Nadi dosha"}
                good={hi ? "स्पष्ट — दोनों की नाड़ियाँ अलग हैं।" : "Clear — the partners have different nadis."} bad={hi ? "उपस्थित — दोनों की नाड़ी समान है। परंपरा में इसे सावधानी का संकेत माना जाता है; संपूर्ण कुंडली का परीक्षण आवश्यक है।" : "Present — both share the same nadi. The weightiest koota (8 points lost); tradition advises caution, though strong overall charts and remedies are said to mitigate it."} />
              <DoshaCard C={C} card={card} ok={!res.bhakootDosha} title={hi ? "भकूट दोष" : "Bhakoot dosha"}
                good={hi ? "स्पष्ट — चंद्र राशियों का संबंध अनुकूल है।" : "Clear — the Moon signs are favourably placed."} bad={hi ? "उपस्थित — चंद्र राशियाँ 2/12, 5/9 या 6/8 संबंध में हैं। भावनात्मक सामंजस्य और समृद्धि के लिए पूरी कुंडली देखें।" : "Present — the Moon signs form a 2/12, 5/9 or 6/8 axis, said to bear on emotional harmony, health and prosperity."} />
              <DoshaCard C={C} card={card} ok={mOk} title={hi ? "मांगलिक दोष" : "Manglik (Mangal) dosha"}
                good={hi
                  ? (res.manglik.both
                      ? `दोनों मांगलिक हैं — वर की ${res.manglik.boyProfile.rawCount}/3 और कन्या की ${res.manglik.girlProfile.rawCount}/3 सन्दर्भ-स्थितियों में; परंपरा में परस्पर मांगलिक को निरस्त माना जाता है।`
                      : "स्पष्ट — लग्न, चन्द्र और शुक्र—तीनों सन्दर्भों से किसी की भी मांगलिक स्थिति नहीं बनती।")
                  : (res.manglik.both
                      ? `Both partners carry Manglik indications — ${res.manglik.boyProfile.rawCount} of 3 references for the groom, ${res.manglik.girlProfile.rawCount} of 3 for the bride. A mutual Manglik is traditionally treated as cancelling.`
                      : "Clear — Mars falls in no Manglik house from the Lagna, the Moon or Venus for either partner.")}
                bad={hi
                  ? `${mBoy ? "वर" : "कन्या"} की कुंडली में मांगलिक स्थिति बनती है (${mRefs} से मंगल 1, 2, 4, 7, 8 या 12 भाव में), दूसरे की नहीं। ${mProf.mitigationCount > 0 ? "कुछ शमन-योग भी उपस्थित हैं। " : ""}पूरी कुंडली किसी योग्य ज्योतिषी से देखने पर ही निर्णय लें।`
                  : `${mBoy ? "The groom" : "The bride"} carries Manglik indications and the other does not — Mars falls in house 1, 2, 4, 7, 8 or 12 counted from the ${mRefs}, the same Lagna/Moon/Venus check Ganak's Mangal Dosha calculator uses.${mProf.mitigationCount > 0 ? " Traditional mitigations are also present." : ""} Read it with the full charts and an astrologer before drawing a conclusion.`} />
              <DoshaCard C={C} card={card} ok={res.papa.balanced} title={hi ? "पापसाम्य (पाप-भार)" : "Papasamyam (papa load)"}
                good={hi ? `संतुलित — वर ${res.papa.boy.total}/15, कन्या ${res.papa.girl.total}/15। दोनों का पापग्रह-भार तुलनीय है, जिसे परम्परा में अनुकूल माना जाता है।` : `Balanced — groom ${res.papa.boy.total}/15, bride ${res.papa.girl.total}/15. Comparable malefic loads, traditionally considered favourable.`}
                bad={hi ? `असंतुलित — वर ${res.papa.boy.total}/15, कन्या ${res.papa.girl.total}/15। ${res.papa.heavier === "boy" ? "वर" : "कन्या"} पर पापग्रह-भार अधिक है। यह अनेक पारम्परिक दृष्टियों में से एक है, अंतिम निर्णय नहीं।` : `Uneven — groom ${res.papa.boy.total}/15, bride ${res.papa.girl.total}/15. The ${res.papa.heavier === "boy" ? "groom" : "bride"} carries the heavier malefic load (Sun, Mars, Saturn, Rahu, Ketu in houses 1,2,4,7,8,12 from Lagna, Moon and Venus). One traditional lens among many, not a verdict.`} />
            </div>

            <p style={{ color: C.muted, fontSize: "var(--font-label)", marginTop: "0.875rem", lineHeight: 1.55 }}>
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
              return (
                <div style={{ marginTop: "1.25rem" }}>
                  <div style={{ ...T.label, color: C.muted, marginBottom: "0.5rem" }}>{hi ? "दशकूट मिलान · दक्षिण भारतीय · 10 कूट" : "Dashakoota · South Indian · 10 kutas"}</div>
                  <div style={{ ...card, padding: "0.5rem 0.25rem", overflowX: "auto" }}>
                    <table>
                      <thead><tr><th>{hi ? "कूट" : "Kuta"}</th><th>{hi ? "अर्थ" : "Meaning"}</th><th style={{ textAlign: "right" }}>{hi ? "अंक" : "Points"}</th></tr></thead>
                      <tbody>
                        {d.kootas.map((k) => {
                          const crit = (k.name === "Rajju" || k.name === "Vedha") && k.got === 0;
                          return (
                            <tr key={k.name} style={crit ? { background: "var(--bad-surface)" } : null}>
                              <td style={{ fontFamily: "var(--font-display-family)", color: crit ? C.sindoor : C.gold, whiteSpace: "nowrap" }}>{hi ? KI[k.name].hi : k.name}</td>
                              <td style={{ fontSize: "var(--font-small)", color: C.muted }}>{hi ? KI[k.name].mHi : KI[k.name].en}</td>
                              <td style={{ textAlign: "right", fontVariantNumeric: "tabular-nums", color: k.got === 0 ? C.sindoor : C.ivory, whiteSpace: "nowrap" }}>{k.got} / {k.max}</td>
                            </tr>
                          );
                        })}
                        <tr><td style={{ fontFamily: "var(--font-display-family)", color: C.gold }} colSpan={2}>{hi ? "कुल" : "Total"}</td><td style={{ textAlign: "right", fontFamily: "var(--font-display-family)", fontWeight: 700, color: C.gold, whiteSpace: "nowrap" }}>{d.total} / 36</td></tr>
                      </tbody>
                    </table>
                  </div>
                  {(d.rajjuDosha || d.vedhaDosha) && (
                    <p style={{ color: C.sindoor, fontSize: "var(--font-small)", marginTop: "0.625rem", lineHeight: 1.55 }}>
                      {d.rajjuDosha && (hi ? `रज्जु दोष — दोनों की ${d.rajjuGroupHi} रज्जु समान है; दक्षिण परम्परा में इसे विवाह की स्थिरता हेतु गम्भीर माना जाता है। ` : `Rajju dosha — both share the same ${d.rajjuGroup} rajju, treated in the South-Indian tradition as a serious factor for marital stability. `)}
                      {d.vedhaDosha && (hi ? "वेध दोष — दोनों नक्षत्र परस्पर वेध करते हैं। " : "Vedha dosha — the two stars obstruct each other. ")}
                      {hi ? "इसे किसी योग्य ज्योतिषी से पूरी कुंडली सहित जँचवाएँ; यह अकेला निषेध नहीं है।" : "Have this reviewed with the full charts by a qualified astrologer; it is not a stand-alone prohibition."}
                    </p>
                  )}
                  <p style={{ color: C.muted, fontSize: "var(--font-label)", marginTop: "0.625rem", lineHeight: 1.55 }}>
                    {hi ? "दशकूट दक्षिण भारत में प्रचलित है और अष्टकूट के साथ-साथ देखा जाता है। रज्जु और वेध सबसे संवेदनशील माने जाते हैं। दोनों पद्धतियाँ एक ही मान्य नक्षत्र-राशि गणित पर आधारित हैं। यहाँ केवल अंक दिए गए हैं; ऊपर दिया गया एक ही निष्कर्ष दोनों पद्धतियों और उपस्थित दोषों—दोनों को साथ लेकर बना है।" : "Dashakoota is the South-Indian counterpart, read alongside Ashtakoota. Rajju and Vedha are treated as the most sensitive factors. Both systems use the same validated nakshatra/rashi maths. This table gives the score only — the single verdict at the top of the page already reads both systems together with any dosha that is standing."}
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
