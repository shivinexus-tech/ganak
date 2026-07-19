import React, { useState } from "react";
import { T } from "../components/tokens";
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

function MatchPerson({ C, card, title, name, setName, date, setDate, time, setTime, place, setPlace }) {
  const inp = { width: "100%", padding: "10px 12px", background: "#FFFDF7", border: `1px solid ${C.line}`, borderRadius: 8, color: C.ivory, fontFamily: "Spectral, serif", fontSize: 15, boxSizing: "border-box" };
  const lab = { display: "block", ...T.label, color: C.muted, marginBottom: 5 };
  return (
    <div style={{ ...card, padding: T.s4 }}>
      <div style={{ fontFamily: "Eczar, serif", color: C.gold, fontSize: 16, marginBottom: 12 }}>{title}</div>
      <div style={{ display: "grid", gap: 10 }}>
        <div><label style={lab}>Name</label><input style={inp} value={name} onChange={(e) => setName(e.target.value)} placeholder="optional" /></div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div><label style={lab}>Date of birth</label><input style={inp} type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
          <div><label style={lab}>Time</label><input style={inp} type="time" value={time} onChange={(e) => setTime(e.target.value)} /></div>
        </div>
        <div><label style={lab}>Place of birth</label><PlaceInput value={place} onPick={setPlace} C={C} /></div>
      </div>
    </div>
  );
}

function MatchMaker({ C, card, computeKundli }) {
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

  const run = () => {
    setErr("");
    const [by, bm, bd] = (bDate || "").split("-").map(Number);
    const [bhh, bmi] = (bTime || "").split(":").map(Number);
    const [gy, gm, gd] = (gDate || "").split("-").map(Number);
    const [ghh, gmi] = (gTime || "").split(":").map(Number);
    if (!by || isNaN(bhh) || !gy || isNaN(ghh)) { setErr("Enter a complete date and time of birth for both people."); return; }
    if (!bPlace || !gPlace) { setErr("Pick a birth place for both people from the suggestions."); return; }
    const btz = zoneOffset(bPlace.zone, by, bm, bd) ?? 5.5;
    const gtz = zoneOffset(gPlace.zone, gy, gm, gd) ?? 5.5;
    setRes(computeMatch(computeKundli,
      { y: by, m: bm, day: bd, hh: bhh, mi: bmi, tz: btz, lat: bPlace.lat, lon: bPlace.lon },
      { y: gy, m: gm, day: gd, hh: ghh, mi: gmi, tz: gtz, lat: gPlace.lat, lon: gPlace.lon }
    ));
    setTimeout(() => { const el = document.getElementById("matchresult"); if (el) el.scrollIntoView({ behavior: "smooth" }); }, 150);
  };

  const verdict = (t) => t >= 33 ? ["Excellent match", "#1F7A4D"] : t >= 25 ? ["Very good match", C.gold] : t >= 18 ? ["Acceptable match", "#B0610F"] : ["Not recommended", C.sindoor];

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
        <MatchPerson C={C} card={card} title="वर · Groom" name={boyName} setName={setBoyName} date={bDate} setDate={setBDate} time={bTime} setTime={setBTime} place={bPlace} setPlace={setBPlace} />
        <MatchPerson C={C} card={card} title="कन्या · Bride" name={girlName} setName={setGirlName} date={gDate} setDate={setGDate} time={gTime} setTime={setGTime} place={gPlace} setPlace={setGPlace} />
      </div>
      <button onClick={run} style={{ marginTop: 16, width: "100%", padding: "13px 0", background: "linear-gradient(180deg, #E08A22, #C9711A 55%, #B0610F)", color: "#FFF8E9", border: "1px solid #D98E33", borderRadius: 9, fontFamily: "Eczar, serif", fontWeight: 700, fontSize: 16, letterSpacing: "0.06em", cursor: "pointer", boxShadow: "0 6px 18px rgba(168,106,18,.25)" }}>
        Match the kundalis
      </button>
      {err && <p style={{ color: C.sindoor, fontSize: 13, marginTop: 10 }}>{err}</p>}

      {res && (() => {
        const [vlabel, vcolor] = verdict(res.total);
        const mBoy = res.manglik.boy, mGirl = res.manglik.girl, mOk = res.manglik.cancelled;
        return (
          <div id="matchresult" style={{ marginTop: 20 }}>
            <div style={{ ...card, padding: "22px 20px", textAlign: "center", borderTop: `3px solid ${vcolor}` }}>
              <div style={{ ...T.label, color: C.muted }}>Ashtakoota Guna Milan</div>
              <div style={{ fontFamily: "Eczar, serif", fontSize: 46, color: vcolor, lineHeight: 1.1, margin: "4px 0" }}>{res.total}<span style={{ fontSize: 22, color: C.muted }}> / 36</span></div>
              <div style={{ fontFamily: "Eczar, serif", fontSize: 18, color: vcolor }}>{vlabel}</div>
            </div>

            <div style={{ ...card, padding: "8px 4px", overflowX: "auto", marginTop: 14 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5, minWidth: 360 }}>
                <thead><tr style={{ color: C.muted, textAlign: "left", fontSize: 11, letterSpacing: ".05em", textTransform: "uppercase" }}>
                  <th style={{ padding: "7px 10px" }}>Koota</th><th style={{ padding: "7px 10px" }}>Detail</th><th style={{ padding: "7px 10px", textAlign: "right" }}>Points</th>
                </tr></thead>
                <tbody>
                  {res.kootas.map((k) => {
                    const full = k.got === k.max, zero = k.got === 0;
                    return (
                      <tr key={k.name} style={{ borderTop: "1px solid #EBDFC6" }}>
                        <td style={{ padding: "8px 10px", fontFamily: "Eczar, serif", color: C.ivory, whiteSpace: "nowrap" }}>{k.name}</td>
                        <td style={{ padding: "8px 10px", color: C.muted, fontSize: 12.5 }}>{k.note}</td>
                        <td style={{ padding: "8px 10px", textAlign: "right", fontVariantNumeric: "tabular-nums", color: zero ? C.sindoor : full ? "#1F7A4D" : C.gold, fontWeight: 700, whiteSpace: "nowrap" }}>{k.got} / {k.max}</td>
                      </tr>
                    );
                  })}
                  <tr style={{ borderTop: `2px solid ${C.line}` }}>
                    <td style={{ padding: "9px 10px", fontFamily: "Eczar, serif", color: C.gold }} colSpan={2}>Total</td>
                    <td style={{ padding: "9px 10px", textAlign: "right", fontFamily: "Eczar, serif", fontWeight: 700, color: vcolor, whiteSpace: "nowrap" }}>{res.total} / 36</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10, marginTop: 14 }}>
              <DoshaCard C={C} card={card} ok={!res.nadiDosha} title="Nadi dosha"
                good="Clear — the partners have different nadis." bad="Present — both share the same nadi. The weightiest koota (8 points lost); tradition advises caution, though strong overall charts and remedies are said to mitigate it." />
              <DoshaCard C={C} card={card} ok={!res.bhakootDosha} title="Bhakoot dosha"
                good="Clear — the Moon signs are favourably placed." bad="Present — the Moon signs form a 2/12, 5/9 or 6/8 axis, said to bear on emotional harmony, health and prosperity." />
              <DoshaCard C={C} card={card} ok={mOk} title="Manglik (Mangal) dosha"
                good={(mBoy || mGirl) ? "Both partners are Manglik — the dosha is considered mutually cancelled." : "Clear — neither partner is Manglik from the Lagna."}
                bad={(mBoy ? "The groom" : "The bride") + " is Manglik (Mars falls in house 1, 2, 4, 7, 8 or 12 from the Lagna) while the other is not. Traditionally flagged for marriage; an astrologer can advise on remedies and the Moon/Venus-based checks."} />
            </div>

            <p style={{ color: C.muted, fontSize: 12, marginTop: 14, lineHeight: 1.55 }}>
              Guna Milan reads instinctive and karmic compatibility from each Moon's nakshatra and rashi. A high score is encouraging but never the whole story — Manglik status, the 7th house and its lord, Venus and Jupiter, and the running dashas all matter. Treat this as a structured starting point rather than a verdict. Varna, Vashya, Gana and Yoni carry minor source variation between traditions; Nadi, Bhakoot and the Manglik check follow the standard rules and use the same validated ephemeris as the rest of the app.
            </p>
          </div>
        );
      })()}
    </div>
  );
}



export default MatchMaker;
export { MatchMaker, MatchPerson, DoshaCard };
