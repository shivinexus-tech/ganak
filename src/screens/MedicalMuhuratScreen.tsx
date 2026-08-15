import React, { useEffect, useState } from "react";
import { panchangTerm, weekdayName, WEEKDAY_SHORT_EN } from "../i18n/panchang-terms";
import PlaceInput from "../components/PlaceInput";
import { zoneOffset } from "../engine/panchang";
import { medicalMuhuratScan, natalMoonSign } from "../engine/medical-muhurat";
import { panchangTime } from "../components/format";
import {
  MEDICAL_SAFETY, MEDICAL_INTRO, MEDICAL_CONFIRM, MEDICAL_TRADITION_NOTE,
  MEDICAL_EXCLUSION, MEDICAL_LABELS, MEDICAL_RESULT_NOTE, MEDICAL_NO_WINDOW, MEDICAL_NO_SOLAR_DATA,
  MEDICAL_REFUSAL, MEDICAL_TITLE,
  MEDICAL_NATAL_SECTION, MEDICAL_NATAL_HINT, MEDICAL_JANMA, MEDICAL_BIRTHSIGN, MEDICAL_RASHIS,
  MEDICAL_NATAL_UNCONFIRMED,
} from "../data/medical-muhurat-ui";

/* Dedicated, deliberately conservative screen for timing a planned, clinician-approved
   procedure. The safety wall renders FIRST and the finder will not run until the user
   confirms their care team said the timing is flexible. No outcome is predicted, scored
   or ranked. See plans/claude-medical-muhurat-findings.md (owner Option C, 2026-07-25). */

/* Path route helper, mirroring festivalGuideFromPath/utilityFromPath in the shell. */
export function medicalMuhuratFromPath(pathname: string) {
  return pathname === "/muhurat/medical" || pathname === "/muhurat/medical/" ? { kind: "medical" } : null;
}

function fmtTime(ms: number, tz: number, hi: boolean): string {
  return panchangTime(ms, tz, hi ? "hi" : "en");
}
const DOW_EN = WEEKDAY_SHORT_EN;
const MON_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MON_HI = ["जन॰", "फ़र॰", "मार्च", "अप्रैल", "मई", "जून", "जुल॰", "अग॰", "सित॰", "अक्तू॰", "नव॰", "दिस॰"];

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

  // F1/F2: any change to an input that feeds the calculation invalidates a shown
  // result. Clearing it here dismisses a stale list when the range/place/birth details
  // change, AND hides the result the moment the "timing is flexible" confirmation is
  // withdrawn. Depends on place PRIMITIVES (the shell may hand a fresh object each
  // render), never the object identity, so it does not wipe results on every render.
  useEffect(() => {
    setResult(null);
    setNatalSign(null);
  }, [from, to, place?.lat, place?.lon, place?.label, confirmed, agreed, birthDate, birthTime, birthConfirmed, birthPlace]);

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
    if (birthDate && birthDate > todayStr) {
      setResult(null);
      setError(hi ? "जन्म तिथि भविष्य की नहीं हो सकती।" : "Birth date cannot be in the future.");
      return;
    }
    if (birthDate && birthPlace && birthConfirmed) {
      const [by, bm, bd] = birthDate.split("-").map(Number);
      const [bhh, bmi] = birthTime.split(":").map(Number);
      if (by) ns = natalMoonSign(birthPlace, "lahiri", { y: by, m: bm, day: bd, hh: bhh || 0, mi: bmi || 0 });
    }
    setNatalSign(ns);
    setResult(medicalMuhuratScan(place, "lahiri", { y: fy, m: fm, d: fd }, { y: ty, m: tm, d: td }, ns));
  };

  const label = (o: { en: string; hi: string }) => bi(o);
  const panel = { ...card, padding: "1rem", marginBottom: "0.875rem" };
  const dateInput = { display: "block", width: "100%", height: "2.625rem", marginTop: "0.3125rem", border: `0.0625rem solid ${C.line}`, borderRadius: "0.6875rem", padding: "0 0.6875rem", background: "var(--surface-sunken)", color: C.ivory } as any;

  const cleanDays = result ? result.filter((r) => r.clean && !r.janmaRashi) : [];

  return (
    <div>
      <h2 style={{ fontFamily: "var(--font-display-family)", color: C.gold, fontSize: "var(--font-display)", margin: "0 0 0.25rem" }}>{bi(MEDICAL_TITLE)}</h2>

      {/* SAFETY WALL — first substantive content, before any astrological framing, input or result */}
      <div role="note" style={{ ...card, padding: "1rem", marginBottom: "1rem", borderLeft: `4px solid ${C.gold}`, background: "var(--surface-hover)" }}>
        <div style={{ fontFamily: "var(--font-display-family)", color: C.gold, fontSize: "var(--font-small)", letterSpacing: ".08em", marginBottom: "0.375rem" }}>
          {hi ? "पहले पढ़ें" : "READ FIRST"}
        </div>
        <p style={{ margin: 0, color: C.ivory, fontSize: "var(--font-body)", lineHeight: 1.6 }}>{bi(MEDICAL_SAFETY)}</p>
        <p style={{ margin: "0.625rem 0 0", color: C.muted, fontSize: "var(--font-small)", lineHeight: 1.6 }}>{bi(MEDICAL_REFUSAL)}</p>
      </div>
      <p style={{ color: C.muted, fontSize: "var(--font-body)", margin: "0 0 1rem" }}>{bi(MEDICAL_INTRO)}</p>

      {/* Inputs */}
      <div style={panel}>
        <div style={{ display: "grid", gap: "0.625rem" }}>
          <label style={{ fontSize: "var(--font-small)", color: C.muted }}>{hi ? "आरंभ तिथि" : "From"}
            <input type="date" value={from} min={todayStr} onChange={(e) => setFrom(e.target.value)} style={dateInput} />
          </label>
          <label style={{ fontSize: "var(--font-small)", color: C.muted }}>{hi ? "अंतिम तिथि" : "To"}
            <input type="date" value={to} min={from} onChange={(e) => setTo(e.target.value)} style={dateInput} />
          </label>
          <label style={{ fontSize: "var(--font-small)", color: C.muted }}>{hi ? "स्थान" : "Place"}
            <PlaceInput value={place} onPick={onPlace} onConfirmed={setConfirmed} C={C} lang={lang} />
          </label>
        </div>

        {/* R10: optional Janma Rashi personalisation — clearly separate, opt-in, its own place */}
        <details style={{ marginTop: "0.75rem", borderTop: `0.0625rem solid ${C.line}`, paddingTop: "0.625rem" }}>
          <summary style={{ cursor: "pointer", color: C.gold, fontSize: "var(--font-small)", fontFamily: "var(--font-display-family)" }}>{bi(MEDICAL_NATAL_SECTION)}</summary>
          <p style={{ fontSize: "var(--font-small)", color: C.muted, lineHeight: 1.6, margin: "0.5rem 0 0.625rem" }}>{bi(MEDICAL_NATAL_HINT)}</p>
          <div style={{ display: "grid", gap: "0.625rem" }}>
            <label style={{ fontSize: "var(--font-small)", color: C.muted }}>{hi ? "जन्म तिथि" : "Birth date"}
              <input type="date" value={birthDate} max={todayStr} onChange={(e) => setBirthDate(e.target.value)} style={dateInput} />
            </label>
            <label style={{ fontSize: "var(--font-small)", color: C.muted }}>{hi ? "जन्म समय" : "Birth time"}
              <input type="time" value={birthTime} onChange={(e) => setBirthTime(e.target.value)} style={dateInput} />
            </label>
            <label style={{ fontSize: "var(--font-small)", color: C.muted }}>{hi ? "जन्म स्थान" : "Birth place"}
              <PlaceInput value={birthPlace} onPick={setBirthPlace} onConfirmed={setBirthConfirmed} C={C} lang={lang} />
            </label>
            {birthDate && !(birthPlace && birthConfirmed) && (
              <p role="note" style={{ fontSize: "var(--font-label)", color: C.gold, margin: 0, lineHeight: 1.5 }}>{bi(MEDICAL_NATAL_UNCONFIRMED)}</p>
            )}
          </div>
        </details>

        {/* Required confirmation — gates the finder */}
        <label style={{ display: "flex", gap: "0.625rem", alignItems: "flex-start", marginTop: "0.875rem", cursor: "pointer" }}>
          <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} style={{ marginTop: 3, width: 18, height: 18, accentColor: C.gold, flexShrink: 0 }} />
          <span style={{ fontSize: "var(--font-small)", color: C.ivory, lineHeight: 1.5 }}>{bi(MEDICAL_CONFIRM)}</span>
        </label>

        <button onClick={run} disabled={!agreed} className="castBtn" style={{
          marginTop: "0.875rem", width: "100%", height: "2.875rem", border: "none", borderRadius: "0.75rem", cursor: agreed ? "pointer" : "not-allowed",
          background: agreed ? C.gold : "var(--line)", color: "var(--on-accent)", fontFamily: "var(--font-display-family)", fontSize: "var(--font-title)", fontWeight: 600, opacity: agreed ? 1 : 0.7,
        }}>{hi ? "दिन खोजें" : "Find days"}</button>
        {error && <p role="alert" style={{ color: "var(--bad)", fontSize: "var(--font-small)", margin: "0.625rem 0 0" }}>{error}</p>}
      </div>

      {/* Results */}
      {result && (
        <div style={{ marginBottom: "0.875rem" }}>
          {result.length === 0 ? (
            <div style={{ ...panel, color: C.muted, fontSize: "var(--font-body)", lineHeight: 1.6 }}>{bi(MEDICAL_NO_SOLAR_DATA)}</div>
          ) : cleanDays.length === 0 ? (
            <div style={{ ...panel, color: C.muted, fontSize: "var(--font-body)", lineHeight: 1.6 }}>{bi(MEDICAL_NO_WINDOW)}</div>
          ) : (
            <>
              <p style={{ color: C.muted, fontSize: "var(--font-small)", margin: "0 0 0.375rem" }}>
                {hi ? `${cleanDays.length} उपलब्ध दिन · ${result.length - cleanDays.length} टाले गए` : `${cleanDays.length} available · ${result.length - cleanDays.length} set aside`}
              </p>
              {natalSign != null && (
                <p style={{ color: C.gold, fontSize: "var(--font-small)", margin: "0 0 0.625rem" }}>{bi(MEDICAL_BIRTHSIGN)}: {bi(MEDICAL_RASHIS[natalSign])}</p>
              )}
              <div style={{ display: "grid", gap: "0.5rem" }}>
                {result.map((r, i) => {
                  const dstr = `${hi ? weekdayName("hi", r.dow, true) : DOW_EN[r.dow]} ${r.day} ${hi ? MON_HI[r.m - 1] : MON_EN[r.m - 1]}`;
                  const nak = hi ? (panchangTerm("hi", "nakshatra", r.nakName) || r.nakName) : r.nakName;
                  if (!r.clean || r.janmaRashi) {
                    const reasonText = !r.clean ? bi(MEDICAL_EXCLUSION[r.reason as "purnima" | "amavasya"]) : bi(MEDICAL_JANMA);
                    return (
                      <div key={i} style={{ ...card, padding: "0.625rem 0.875rem", opacity: 0.6 }}>
                        <span style={{ fontWeight: 600, color: C.muted }}>{dstr}</span>
                        <span style={{ float: "right", fontSize: "var(--font-label)", letterSpacing: ".1em", color: C.muted, textTransform: "uppercase" }}>{label(MEDICAL_LABELS.setAside)}</span>
                        <div style={{ fontSize: "var(--font-small)", color: C.muted, marginTop: "0.25rem" }}>{reasonText}</div>
                      </div>
                    );
                  }
                  return (
                    <div key={i} style={{ ...card, padding: "0.75rem 0.875rem", borderLeft: `0.1875rem solid ${C.gold}` }}>
                      <span style={{ fontWeight: 700, color: C.gold, fontSize: "var(--font-body)" }}>{dstr}</span>
                      <span style={{ float: "right", fontSize: "var(--font-label)", letterSpacing: ".1em", color: C.gold, textTransform: "uppercase" }}>{label(MEDICAL_LABELS.available)}</span>
                      <div style={{ fontSize: "var(--font-small)", color: C.muted, marginTop: "0.25rem" }}>
                        {nak} · {hi ? (r.paksha === "shukla" ? "शुक्ल पक्ष" : "कृष्ण पक्ष") : (r.paksha === "shukla" ? "Shukla paksha" : "Krishna paksha")}
                      </div>
                      <div style={{ fontSize: "var(--font-small)", color: C.ivory, marginTop: "0.5rem" }}>
                        {r.abhijit
                          ? <><strong style={{ color: C.gold }}>{fmtTime(r.abhijit.start, r.tz, hi)} – {fmtTime(r.abhijit.end, r.tz, hi)}</strong> · {label(MEDICAL_LABELS.abhijit)}</>
                          : <span style={{ color: C.muted }}>{label(MEDICAL_LABELS.noAbhijitWed)}</span>}
                      </div>
                      <div style={{ fontSize: "var(--font-label)", color: C.muted, marginTop: "0.25rem" }}>
                        {label(MEDICAL_LABELS.rahu)}: {fmtTime(r.rahu.start, r.tz, hi)} – {fmtTime(r.rahu.end, r.tz, hi)}
                      </div>
                    </div>
                  );
                })}
              </div>
              <p style={{ color: C.muted, fontSize: "var(--font-small)", margin: "0.75rem 0 0", lineHeight: 1.6 }}>{bi(MEDICAL_RESULT_NOTE)}</p>
            </>
          )}
        </div>
      )}

      {/* Honest, read-only tradition note — collapsible, never prescriptive */}
      <details style={{ ...card, padding: "0.75rem 1rem" }}>
        <summary style={{ cursor: "pointer", color: C.gold, fontFamily: "var(--font-display-family)", fontSize: "var(--font-body)" }}>
          {hi ? "परंपरा शल्य-समय को कैसे देखती है" : "How tradition views surgical timing"}
        </summary>
        <p style={{ margin: "0.625rem 0 0", color: C.muted, fontSize: "var(--font-small)", lineHeight: 1.65 }}>{bi(MEDICAL_TRADITION_NOTE)}</p>
      </details>
    </div>
  );
}
