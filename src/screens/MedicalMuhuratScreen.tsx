import React, { useEffect, useState } from "react";
import PlaceInput from "../components/PlaceInput";
import { zoneOffset } from "../engine/panchang";
import { medicalMuhuratScan, natalMoonSign } from "../engine/medical-muhurat";
import {
  MEDICAL_SAFETY, MEDICAL_INTRO, MEDICAL_CONFIRM, MEDICAL_TRADITION_NOTE,
  MEDICAL_EXCLUSION, MEDICAL_LABELS, MEDICAL_RESULT_NOTE, MEDICAL_NO_WINDOW,
  MEDICAL_REFUSAL, MEDICAL_TITLE,
  MEDICAL_NATAL_SECTION, MEDICAL_NATAL_HINT, MEDICAL_JANMA, MEDICAL_BIRTHSIGN, MEDICAL_RASHIS,
} from "../data/medical-muhurat-ui";

/* Dedicated, deliberately conservative screen for timing a planned, clinician-approved
   procedure. The safety wall renders FIRST and the finder will not run until the user
   confirms their care team said the timing is flexible. No outcome is predicted, scored
   or ranked. See plans/claude-medical-muhurat-findings.md (owner Option C, 2026-07-25). */

/* Path route helper, mirroring festivalGuideFromPath/utilityFromPath in the shell. */
export function medicalMuhuratFromPath(pathname: string) {
  return pathname === "/muhurat/medical" || pathname === "/muhurat/medical/" ? { kind: "medical" } : null;
}

const two = (n: number) => String(n).padStart(2, "0");
function fmtTime(ms: number, tz: number, hi: boolean): string {
  const d = new Date(ms + tz * 3600000);
  const h = d.getUTCHours(), m = d.getUTCMinutes();
  if (hi) return `${two(h)}:${two(m)}`;
  const ap = h < 12 ? "AM" : "PM"; let h12 = h % 12; if (h12 === 0) h12 = 12;
  return `${h12}:${two(m)} ${ap}`;
}
const DOW_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DOW_HI = ["रवि", "सोम", "मंगल", "बुध", "गुरु", "शुक्र", "शनि"];
const MON_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MON_HI = ["जन॰", "फ़र॰", "मार्च", "अप्रैल", "मई", "जून", "जुल॰", "अग॰", "सित॰", "अक्तू॰", "नव॰", "दिस॰"];
const NAK_HI: { [k: string]: string } = {
  Ashwini: "अश्विनी", Bharani: "भरणी", Krittika: "कृत्तिका", Rohini: "रोहिणी", Mrigashira: "मृगशिरा",
  Ardra: "आर्द्रा", Punarvasu: "पुनर्वसु", Pushya: "पुष्य", Ashlesha: "आश्लेषा", Magha: "मघा",
  "Purva Phalguni": "पूर्वाफाल्गुनी", "Uttara Phalguni": "उत्तराफाल्गुनी", Hasta: "हस्त", Chitra: "चित्रा",
  Swati: "स्वाति", Vishakha: "विशाखा", Anuradha: "अनुराधा", Jyeshtha: "ज्येष्ठा", Mula: "मूल",
  "Purva Ashadha": "पूर्वाषाढ़ा", "Uttara Ashadha": "उत्तराषाढ़ा", Shravana: "श्रवण", Dhanishta: "धनिष्ठा",
  Shatabhisha: "शतभिषा", "Purva Bhadrapada": "पूर्वाभाद्रपदा", "Uttara Bhadrapada": "उत्तराभाद्रपदा", Revati: "रेवती",
};

export default function MedicalMuhuratScreen({ lang, C, card, place, onPlace }: any) {
  const hi = lang === "hi";
  const bi = (o: { en: string; hi: string }) => (hi ? o.hi : o.en);

  const todayStr = new Date().toISOString().slice(0, 10);
  const plus = (days: number) => new Date(Date.now() + days * 864e5).toISOString().slice(0, 10);
  const [from, setFrom] = useState(todayStr);
  const [to, setTo] = useState(plus(21));
  const [agreed, setAgreed] = useState(false);
  const [confirmed, setConfirmed] = useState(true); // shell place is pre-filled (New Delhi default)
  const [result, setResult] = useState<any[] | null>(null);
  const [error, setError] = useState("");
  // R10: optional Janma Rashi personalisation. Its own independent birth place so it
  // never disturbs the procedure place. Applied only when all three are provided.
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("12:00");
  const [birthPlace, setBirthPlace] = useState<any>(null);
  const [birthConfirmed, setBirthConfirmed] = useState(false);
  const [natalSign, setNatalSign] = useState<number | null>(null);

  useEffect(() => {
    document.title = `${bi(MEDICAL_TITLE)} | Ganak`;
    let meta = document.querySelector('meta[name="description"]') as any;
    if (!meta) { meta = document.createElement("meta"); meta.name = "description"; document.head.appendChild(meta); }
    meta.content = bi(MEDICAL_INTRO);
    let canonical = document.querySelector('link[rel="canonical"]') as any;
    if (!canonical) { canonical = document.createElement("link"); canonical.rel = "canonical"; document.head.appendChild(canonical); }
    canonical.href = location.origin + "/muhurat/medical";
  }, [hi]);

  const run = () => {
    setError("");
    if (!agreed) { setResult(null); setError(hi ? "जारी रखने से पहले नीचे दिया गया कथन जाँचें।" : "Please confirm the statement below before continuing."); return; }
    if (!confirmed || !place) { setResult(null); setError(hi ? "सुझावों में से एक स्थान चुनें।" : "Choose a place from the suggestions."); return; }
    const [fy, fm, fd] = from.split("-").map(Number);
    const [ty, tm, td] = to.split("-").map(Number);
    if (!fy || !ty) { setError(hi ? "एक तिथि सीमा चुनें।" : "Pick a date range."); return; }
    const start = Date.UTC(fy, fm - 1, fd), end = Date.UTC(ty, tm - 1, td);
    if (end < start) { setResult(null); setError(hi ? "अंतिम तिथि आरंभ के बाद होनी चाहिए।" : "The end date must be on or after the start date."); return; }
    if ((end - start) / 864e5 > 92) { setResult(null); setError(hi ? "कृपया लगभग 90 दिनों तक की सीमा चुनें।" : "Please choose a range of about 90 days or less."); return; }
    // Optional natal overlay: only when birth date, place and a confirmed pick are present.
    let ns: number | null = null;
    if (birthDate && birthPlace && birthConfirmed) {
      const [by, bm, bd] = birthDate.split("-").map(Number);
      const [bhh, bmi] = birthTime.split(":").map(Number);
      if (by) ns = natalMoonSign(birthPlace, "lahiri", { y: by, m: bm, day: bd, hh: bhh || 0, mi: bmi || 0 });
    }
    setNatalSign(ns);
    setResult(medicalMuhuratScan(place, "lahiri", { y: fy, m: fm, d: fd }, { y: ty, m: tm, d: td }, ns));
  };

  const label = (o: { en: string; hi: string }) => bi(o);
  const panel = { ...card, padding: 16, marginBottom: 14 };
  const dateInput = { display: "block", width: "100%", height: 42, marginTop: 5, border: `1px solid ${C.line}`, borderRadius: 11, padding: "0 11px", background: "#FFFDF7", color: C.ivory } as any;

  const cleanDays = result ? result.filter((r) => r.clean && !r.janmaRashi) : [];

  return (
    <div>
      <h2 style={{ fontFamily: "Eczar, serif", color: C.gold, fontSize: 24, margin: "0 0 4px" }}>{bi(MEDICAL_TITLE)}</h2>
      <p style={{ color: C.muted, fontSize: 14.5, margin: "0 0 16px" }}>{bi(MEDICAL_INTRO)}</p>

      {/* SAFETY WALL — always first, before any input or result */}
      <div role="note" style={{ ...card, padding: 16, marginBottom: 16, borderLeft: `4px solid ${C.gold}`, background: "rgba(168,106,18,.06)" }}>
        <div style={{ fontFamily: "Eczar, serif", color: C.gold, fontSize: 13, letterSpacing: ".08em", marginBottom: 6 }}>
          {hi ? "पहले पढ़ें" : "READ FIRST"}
        </div>
        <p style={{ margin: 0, color: C.ivory, fontSize: 14, lineHeight: 1.6 }}>{bi(MEDICAL_SAFETY)}</p>
        <p style={{ margin: "10px 0 0", color: C.muted, fontSize: 13, lineHeight: 1.6 }}>{bi(MEDICAL_REFUSAL)}</p>
      </div>

      {/* Inputs */}
      <div style={panel}>
        <div style={{ display: "grid", gap: 10 }}>
          <label style={{ fontSize: 13, color: C.muted }}>{hi ? "आरंभ तिथि" : "From"}
            <input type="date" value={from} min={todayStr} onChange={(e) => setFrom(e.target.value)} style={dateInput} />
          </label>
          <label style={{ fontSize: 13, color: C.muted }}>{hi ? "अंतिम तिथि" : "To"}
            <input type="date" value={to} min={from} onChange={(e) => setTo(e.target.value)} style={dateInput} />
          </label>
          <label style={{ fontSize: 13, color: C.muted }}>{hi ? "स्थान" : "Place"}
            <PlaceInput value={place} onPick={onPlace} onConfirmed={setConfirmed} C={C} lang={lang} />
          </label>
        </div>

        {/* R10: optional Janma Rashi personalisation — clearly separate, opt-in, its own place */}
        <details style={{ marginTop: 12, borderTop: `1px solid ${C.line}`, paddingTop: 10 }}>
          <summary style={{ cursor: "pointer", color: C.gold, fontSize: 13.5, fontFamily: "Eczar, serif" }}>{bi(MEDICAL_NATAL_SECTION)}</summary>
          <p style={{ fontSize: 12.5, color: C.muted, lineHeight: 1.6, margin: "8px 0 10px" }}>{bi(MEDICAL_NATAL_HINT)}</p>
          <div style={{ display: "grid", gap: 10 }}>
            <label style={{ fontSize: 13, color: C.muted }}>{hi ? "जन्म तिथि" : "Birth date"}
              <input type="date" value={birthDate} max={todayStr} onChange={(e) => setBirthDate(e.target.value)} style={dateInput} />
            </label>
            <label style={{ fontSize: 13, color: C.muted }}>{hi ? "जन्म समय" : "Birth time"}
              <input type="time" value={birthTime} onChange={(e) => setBirthTime(e.target.value)} style={dateInput} />
            </label>
            <label style={{ fontSize: 13, color: C.muted }}>{hi ? "जन्म स्थान" : "Birth place"}
              <PlaceInput value={birthPlace} onPick={setBirthPlace} onConfirmed={setBirthConfirmed} C={C} lang={lang} />
            </label>
          </div>
        </details>

        {/* Required confirmation — gates the finder */}
        <label style={{ display: "flex", gap: 10, alignItems: "flex-start", marginTop: 14, cursor: "pointer" }}>
          <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} style={{ marginTop: 3, width: 18, height: 18, accentColor: C.gold, flexShrink: 0 }} />
          <span style={{ fontSize: 13.5, color: C.ivory, lineHeight: 1.5 }}>{bi(MEDICAL_CONFIRM)}</span>
        </label>

        <button onClick={run} disabled={!agreed} className="castBtn" style={{
          marginTop: 14, width: "100%", height: 46, border: "none", borderRadius: 12, cursor: agreed ? "pointer" : "not-allowed",
          background: agreed ? C.gold : "#D8CDB4", color: "#fff", fontFamily: "Eczar, serif", fontSize: 16, fontWeight: 600, opacity: agreed ? 1 : 0.7,
        }}>{hi ? "दिन खोजें" : "Find days"}</button>
        {error && <p role="alert" style={{ color: "#B4462A", fontSize: 13, margin: "10px 0 0" }}>{error}</p>}
      </div>

      {/* Results */}
      {result && (
        <div style={{ marginBottom: 14 }}>
          {cleanDays.length === 0 ? (
            <div style={{ ...panel, color: C.muted, fontSize: 14, lineHeight: 1.6 }}>{bi(MEDICAL_NO_WINDOW)}</div>
          ) : (
            <>
              <p style={{ color: C.muted, fontSize: 13, margin: "0 0 6px" }}>
                {hi ? `${cleanDays.length} उपलब्ध दिन · ${result.length - cleanDays.length} टाले गए` : `${cleanDays.length} available · ${result.length - cleanDays.length} set aside`}
              </p>
              {natalSign != null && (
                <p style={{ color: C.gold, fontSize: 12.5, margin: "0 0 10px" }}>{bi(MEDICAL_BIRTHSIGN)}: {bi(MEDICAL_RASHIS[natalSign])}</p>
              )}
              <div style={{ display: "grid", gap: 8 }}>
                {result.map((r, i) => {
                  const dstr = `${hi ? DOW_HI[r.dow] : DOW_EN[r.dow]} ${r.day} ${hi ? MON_HI[r.m - 1] : MON_EN[r.m - 1]}`;
                  const nak = hi ? (NAK_HI[r.nakName] || r.nakName) : r.nakName;
                  if (!r.clean || r.janmaRashi) {
                    const reasonText = !r.clean ? bi(MEDICAL_EXCLUSION[r.reason as "purnima" | "amavasya"]) : bi(MEDICAL_JANMA);
                    return (
                      <div key={i} style={{ ...card, padding: "10px 14px", opacity: 0.6 }}>
                        <span style={{ fontWeight: 600, color: C.muted }}>{dstr}</span>
                        <span style={{ float: "right", fontSize: 11, letterSpacing: ".1em", color: C.muted, textTransform: "uppercase" }}>{label(MEDICAL_LABELS.setAside)}</span>
                        <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>{reasonText}</div>
                      </div>
                    );
                  }
                  return (
                    <div key={i} style={{ ...card, padding: "12px 14px", borderLeft: `3px solid ${C.gold}` }}>
                      <span style={{ fontWeight: 700, color: C.gold, fontSize: 15 }}>{dstr}</span>
                      <span style={{ float: "right", fontSize: 11, letterSpacing: ".1em", color: C.gold, textTransform: "uppercase" }}>{label(MEDICAL_LABELS.available)}</span>
                      <div style={{ fontSize: 12.5, color: C.muted, marginTop: 4 }}>
                        {nak} · {hi ? (r.paksha === "shukla" ? "शुक्ल पक्ष" : "कृष्ण पक्ष") : (r.paksha === "shukla" ? "Shukla paksha" : "Krishna paksha")}
                      </div>
                      <div style={{ fontSize: 13, color: C.ivory, marginTop: 8 }}>
                        {r.abhijit
                          ? <><strong style={{ color: C.gold }}>{fmtTime(r.abhijit.start, r.tz, hi)} – {fmtTime(r.abhijit.end, r.tz, hi)}</strong> · {label(MEDICAL_LABELS.abhijit)}</>
                          : <span style={{ color: C.muted }}>{label(MEDICAL_LABELS.noAbhijitWed)}</span>}
                      </div>
                      <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>
                        {label(MEDICAL_LABELS.rahu)}: {fmtTime(r.rahu.start, r.tz, hi)} – {fmtTime(r.rahu.end, r.tz, hi)}
                      </div>
                    </div>
                  );
                })}
              </div>
              <p style={{ color: C.muted, fontSize: 12.5, margin: "12px 0 0", lineHeight: 1.6 }}>{bi(MEDICAL_RESULT_NOTE)}</p>
            </>
          )}
        </div>
      )}

      {/* Honest, read-only tradition note — collapsible, never prescriptive */}
      <details style={{ ...card, padding: "12px 16px" }}>
        <summary style={{ cursor: "pointer", color: C.gold, fontFamily: "Eczar, serif", fontSize: 14 }}>
          {hi ? "परंपरा शल्य-समय को कैसे देखती है" : "How tradition views surgical timing"}
        </summary>
        <p style={{ margin: "10px 0 0", color: C.muted, fontSize: 13, lineHeight: 1.65 }}>{bi(MEDICAL_TRADITION_NOTE)}</p>
      </details>
    </div>
  );
}
