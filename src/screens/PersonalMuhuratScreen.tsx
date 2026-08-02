import React, { useEffect, useState } from "react";
import PlaceInput from "../components/PlaceInput";
import { muhuratScanRange } from "../engine/muhurat";
import { natalAnchors, applyPersonalisation } from "../engine/personal-muhurat";
import { MUH_CATS } from "../data/muhurat-ui";
import {
  PM_TITLE, PM_INTRO, PM_NATAL_SECTION, PM_NATAL_HINT, PM_NATAL_UNCONFIRMED,
  PM_BIRTH_LABELS, PM_COUNT, PM_BADGE, PM_SET_ASIDE_REASON, PM_SPECIAL_NAMES,
  PM_SPECIAL_CAUTION_NOTE, PM_SPECIAL_CHIP, PM_ANNOTATE_NOTE, PM_RESULT_NOTE,
  PM_NO_BIRTH_PROMPT, PM_NONE, PM_NO_SOLAR, PM_YOUR_STAR, PM_RASHIS, PM_NAK_HI,
} from "../data/personal-muhurat-ui";

/* Dedicated screen for birth-chart-personalised Muhurat (owner route decision 2026-07-25).
   Runs the UNCHANGED general finder (muhuratScanRange), then optionally overlays the natal
   fit (personal-muhurat.ts). The general finder result is shown as-is until the user opts in
   with birth details — the natal logic never silently changes the general results.
   See docs/superpowers/specs/2026-07-25-personal-muhurat-design.md. */

/* Path route helper, mirroring medicalMuhuratFromPath in the shell. */
export function personalMuhuratFromPath(pathname: string) {
  return pathname === "/muhurat/personal" || pathname === "/muhurat/personal/" ? { kind: "personal" } : null;
}

/* The general (non-samskara) finder categories personalisation applies to. */
const SAMSKARA = new Set(["mundan", "naming", "annaprashana", "vidyarambha", "upanayana"]);
const GENERAL_CATS = MUH_CATS.filter((c: any) => !SAMSKARA.has(c.key));

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

export default function PersonalMuhuratScreen({ lang, C, card, place, onPlace }: any) {
  const hi = lang === "hi";
  const bi = (o: { en: string; hi: string }) => (hi ? o.hi : o.en);

  const todayStr = new Date().toISOString().slice(0, 10);
  const plus = (days: number) => new Date(Date.now() + days * 864e5).toISOString().slice(0, 10);
  const [cat, setCat] = useState("wedding");
  const [from, setFrom] = useState(todayStr);
  // 120 days by default: long enough that the default activity (wedding) still returns
  // days during Chaturmas, short enough to stay ~2s. Users can widen to a full year.
  const [to, setTo] = useState(plus(120));
  const [confirmed, setConfirmed] = useState(true); // shell place is pre-filled (New Delhi default)
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const scanSeq = React.useRef(0);
  // Opt-in natal personalisation. Its own independent birth place.
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("12:00");
  const [birthPlace, setBirthPlace] = useState<any>(null);
  const [birthConfirmed, setBirthConfirmed] = useState(false);

  useEffect(() => {
    document.title = `${bi(PM_TITLE)} | Ganak`;
    let meta = document.querySelector('meta[name="description"]') as any;
    if (!meta) { meta = document.createElement("meta"); meta.name = "description"; document.head.appendChild(meta); }
    meta.content = bi(PM_INTRO);
    let canonical = document.querySelector('link[rel="canonical"]') as any;
    if (!canonical) { canonical = document.createElement("link"); canonical.rel = "canonical"; document.head.appendChild(canonical); }
    canonical.href = location.origin + "/muhurat/personal";
  }, [hi]);

  // Any input that feeds the calculation invalidates a shown result (no stale lists,
  // and no state reset without a user action). Depends on place PRIMITIVES, not identity.
  useEffect(() => {
    scanSeq.current++; // abandon any in-flight chunked scan; its results are now stale
    setBusy(false);
    setResult(null);
  }, [cat, from, to, place?.lat, place?.lon, place?.label, birthDate, birthTime, birthConfirmed, birthPlace]);

  /* A full year must be searchable: wedding and several other activities are barred for
     ~4 months by Chaturmas/Devshayana, so a short cap can hide every valid day (a 120-day
     Delhi wedding scan finds 6 days; a 365-day scan finds 122). A year of muhurat
     astronomy is ~7s of work, which would freeze the tab if run in one go — so the scan is
     chunked and yields to the browser between chunks, with visible progress. */
  const MAX_RANGE_DAYS = 365;
  // 60-day chunks: enough yields to keep the tab responsive and the progress bar moving,
  // few enough that background-tab timer throttling (~1s per yield) cannot dominate.
  const CHUNK_DAYS = 60;

  const run = async () => {
    setError("");
    if (!confirmed || !place) { setResult(null); setError(hi ? "सुझावों में से एक स्थान चुनें।" : "Choose a place from the suggestions."); return; }
    const [fy, fm, fd] = from.split("-").map(Number);
    const [ty, tm, td] = to.split("-").map(Number);
    if (!fy || !ty) { setError(hi ? "एक तिथि सीमा चुनें।" : "Pick a date range."); return; }
    const start = Date.UTC(fy, fm - 1, fd), end = Date.UTC(ty, tm - 1, td);
    if (end < start) { setResult(null); setError(hi ? "अंतिम तिथि आरंभ के बाद होनी चाहिए।" : "The end date must be on or after the start date."); return; }
    if ((end - start) / 864e5 > MAX_RANGE_DAYS) { setResult(null); setError(hi ? `कृपया लगभग एक वर्ष (${MAX_RANGE_DAYS} दिन) तक की सीमा चुनें।` : `Please choose a range of about a year (${MAX_RANGE_DAYS} days) or less.`); return; }
    if (birthDate && birthDate > todayStr) { setResult(null); setError(hi ? "जन्म तिथि भविष्य की नहीं हो सकती।" : "Birth date cannot be in the future."); return; }

    // Natal anchors first: cheap, and a failure here must not waste the whole scan.
    let anchors: any = null;
    if (birthDate && birthPlace && birthConfirmed) {
      const [by, bm, bd] = birthDate.split("-").map(Number);
      const [bhh, bmi] = birthTime.split(":").map(Number);
      if (by) anchors = natalAnchors(birthPlace, "lahiri", { y: by, m: bm, day: bd, hh: bhh || 0, mi: bmi || 0 });
    }

    const my = ++scanSeq.current;
    setResult(null);
    setBusy(true);
    setProgress(0);
    const totalDays = Math.round((end - start) / 864e5) + 1;
    const days: any[] = [];
    try {
      for (let cur = start; cur <= end; cur += CHUNK_DAYS * 864e5) {
        if (my !== scanSeq.current) return; // inputs changed — abandon this scan
        const chunkEnd = Math.min(cur + (CHUNK_DAYS - 1) * 864e5, end);
        const a = new Date(cur), b = new Date(chunkEnd);
        days.push(...muhuratScanRange(
          place, "lahiri",
          { y: a.getUTCFullYear(), m: a.getUTCMonth() + 1, d: a.getUTCDate() },
          { y: b.getUTCFullYear(), m: b.getUTCMonth() + 1, d: b.getUTCDate() },
          cat,
        ));
        setProgress(Math.min(100, Math.round(((chunkEnd - start) / 864e5 + 1) / totalDays * 100)));
        await new Promise((r) => setTimeout(r, 0)); // let the browser paint the progress
      }
    } catch (e: any) {
      if (my !== scanSeq.current) return;
      setBusy(false);
      setError(hi ? "गणना पूरी नहीं हो सकी। कृपया छोटी अवधि आज़माएँ।" : "The calculation could not finish. Please try a shorter range.");
      return;
    }
    if (my !== scanSeq.current) return;
    // Chunking splits the engine's own ranking, so restore its order across the whole range.
    days.sort((a, b) => (b.score || 0) - (a.score || 0) || a.rise - b.rise);
    setBusy(false);
    setResult({ scan: days, anchors });
  };

  const panel = { ...card, padding: 16, marginBottom: 14 };
  const dateInput = { display: "block", width: "100%", height: 42, marginTop: 5, border: `1px solid ${C.line}`, borderRadius: 11, padding: "0 11px", background: "#FFFDF7", color: C.ivory } as any;
  const specialByKey: { [k: string]: any } = Object.fromEntries(PM_SPECIAL_NAMES.map((s: any) => [s.key, s]));

  const nakLabel = (nakName: string) => (hi ? (PM_NAK_HI[nakName] || nakName) : nakName);
  const dateLabel = (r: any) => `${hi ? DOW_HI[r.dow] : DOW_EN[r.dow]} ${r.day} ${hi ? MON_HI[r.m - 1] : MON_EN[r.m - 1]}`;
  const pakshaLabel = (r: any) => (hi ? (r.krishna ? "कृष्ण पक्ष" : "शुक्ल पक्ष") : (r.krishna ? "Krishna paksha" : "Shukla paksha"));

  // Derived display: general list, or personalised partition.
  const scan = result ? result.scan : null;
  const validDays = scan ? scan.filter((d: any) => d.valid) : [];
  const anchors = result ? result.anchors : null;
  const personalised = anchors ? applyPersonalisation(validDays, anchors) : null;

  const Dots = ({ n }: { n: number }) => (
    <span style={{ letterSpacing: 1, color: C.gold }}>{"●".repeat(n) + "○".repeat(4 - n)}</span>
  );

  const KeptCard = ({ d }: { d: any }) => {
    const f = d.fit;
    const win = (d.activityWindows || [])[0];
    return (
      <div style={{ ...card, padding: "12px 14px", borderLeft: `3px solid ${C.gold}` }}>
        <span style={{ fontWeight: 700, color: C.gold, fontSize: 15 }}>{dateLabel(d)}</span>
        {f && f.strength != null && (
          <span style={{ float: "right", fontSize: 12 }} title={bi(PM_BADGE.strength)}><Dots n={f.strength} /></span>
        )}
        <div style={{ fontSize: 12.5, color: C.muted, marginTop: 4 }}>{nakLabel(d.nakName)} · {pakshaLabel(d)}</div>
        {win && (
          <div style={{ fontSize: 13, color: C.ivory, marginTop: 8 }}>
            <strong style={{ color: C.gold }}>{fmtTime(win.start, d.tz, hi)} – {fmtTime(win.end, d.tz, hi)}</strong>
          </div>
        )}
        {f && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
            <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: f.taraGood ? "rgba(31,122,77,.1)" : "rgba(194,69,30,.1)", color: f.taraGood ? "#1F7A4D" : C.sindoor }}>{bi(f.taraGood ? PM_BADGE.taraGood : PM_BADGE.taraBad)}</span>
            <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: f.chandraGood ? "rgba(31,122,77,.1)" : "rgba(194,69,30,.1)", color: f.chandraGood ? "#1F7A4D" : C.sindoor }}>{bi(f.chandraGood ? PM_BADGE.chandraGood : PM_BADGE.chandraBad)}</span>
          </div>
        )}
        {f && f.specialCaution && specialByKey[f.specialName] && (
          <details style={{ marginTop: 8 }}>
            <summary style={{ cursor: "pointer", fontSize: 12, color: C.muted }}>⚑ {bi(PM_SPECIAL_CHIP(specialByKey[f.specialName], specialByKey[f.specialName].ord))}</summary>
            <p style={{ fontSize: 12, color: C.muted, lineHeight: 1.55, margin: "6px 0 0" }}>{bi(PM_SPECIAL_CAUTION_NOTE)}</p>
          </details>
        )}
      </div>
    );
  };

  const AsideCard = ({ d }: { d: any }) => {
    const f = d.fit;
    const reason = f && !f.taraGood ? PM_SET_ASIDE_REASON.tara : PM_SET_ASIDE_REASON.chandra;
    return (
      <div style={{ ...card, padding: "10px 14px", opacity: 0.6 }}>
        <span style={{ fontWeight: 600, color: C.muted }}>{dateLabel(d)}</span>
        <span style={{ float: "right", fontSize: 11, letterSpacing: ".1em", color: C.muted, textTransform: "uppercase" }}>{bi(PM_BADGE.setAside)}</span>
        <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>{bi(reason)}</div>
      </div>
    );
  };

  return (
    <div>
      <h2 style={{ fontFamily: "Eczar, serif", color: C.gold, fontSize: 24, margin: "0 0 4px" }}>{bi(PM_TITLE)}</h2>
      <p style={{ color: C.muted, fontSize: 14.5, margin: "0 0 16px" }}>{bi(PM_INTRO)}</p>

      {/* Inputs */}
      <div style={panel}>
        <div style={{ display: "grid", gap: 10 }}>
          <label style={{ fontSize: 13, color: C.muted }}>{bi(PM_BIRTH_LABELS.activity)}
            <select value={cat} onChange={(e) => setCat(e.target.value)} style={dateInput}>
              {GENERAL_CATS.map((c: any) => <option key={c.key} value={c.key}>{hi ? c.hi : c.en}</option>)}
            </select>
          </label>
          <label style={{ fontSize: 13, color: C.muted }}>{bi(PM_BIRTH_LABELS.from)}
            <input type="date" value={from} min={todayStr} onChange={(e) => setFrom(e.target.value)} style={dateInput} />
          </label>
          <label style={{ fontSize: 13, color: C.muted }}>{bi(PM_BIRTH_LABELS.to)}
            <input type="date" value={to} min={from} onChange={(e) => setTo(e.target.value)} style={dateInput} />
          </label>
          <label style={{ fontSize: 13, color: C.muted }}>{bi(PM_BIRTH_LABELS.place2)}
            <PlaceInput value={place} onPick={onPlace} onConfirmed={setConfirmed} C={C} lang={lang} />
          </label>
        </div>

        {/* Opt-in natal personalisation — clearly separate, its own place */}
        <details style={{ marginTop: 12, borderTop: `1px solid ${C.line}`, paddingTop: 10 }}>
          <summary style={{ cursor: "pointer", color: C.gold, fontSize: 13.5, fontFamily: "Eczar, serif" }}>{bi(PM_NATAL_SECTION)}</summary>
          <p style={{ fontSize: 12.5, color: C.muted, lineHeight: 1.6, margin: "8px 0 10px" }}>{bi(PM_NATAL_HINT)}</p>
          <div style={{ display: "grid", gap: 10 }}>
            <label style={{ fontSize: 13, color: C.muted }}>{bi(PM_BIRTH_LABELS.date)}
              <input type="date" value={birthDate} max={todayStr} onChange={(e) => setBirthDate(e.target.value)} style={dateInput} />
            </label>
            <label style={{ fontSize: 13, color: C.muted }}>{bi(PM_BIRTH_LABELS.time)}
              <input type="time" value={birthTime} onChange={(e) => setBirthTime(e.target.value)} style={dateInput} />
            </label>
            <label style={{ fontSize: 13, color: C.muted }}>{bi(PM_BIRTH_LABELS.place)}
              <PlaceInput value={birthPlace} onPick={setBirthPlace} onConfirmed={setBirthConfirmed} C={C} lang={lang} />
            </label>
            {birthDate && !(birthPlace && birthConfirmed) && (
              <p role="note" style={{ fontSize: 12, color: C.gold, margin: 0, lineHeight: 1.5 }}>{bi(PM_NATAL_UNCONFIRMED)}</p>
            )}
          </div>
        </details>

        <button onClick={run} disabled={busy} aria-busy={busy} className="castBtn" style={{
          marginTop: 14, width: "100%", height: 46, border: "none", borderRadius: 12, cursor: busy ? "progress" : "pointer",
          background: busy ? "var(--surface-hover, #D8CDB4)" : C.gold, color: busy ? C.ivory : "#fff",
          fontFamily: "Eczar, serif", fontSize: 16, fontWeight: 600,
        }}>{busy
          ? (hi ? `खोज रहे हैं… ${progress}%` : `Searching… ${progress}%`)
          : (hi ? "दिन खोजें" : "Find days")}</button>
        {error && <p role="alert" style={{ color: "#B4462A", fontSize: 13, margin: "10px 0 0" }}>{error}</p>}
      </div>

      {/* Results */}
      {result && (
        <div style={{ marginBottom: 14 }}>
          {scan.length === 0 ? (
            <div style={{ ...panel, color: C.muted, fontSize: 14, lineHeight: 1.6 }}>{bi(PM_NO_SOLAR)}</div>
          ) : validDays.length === 0 ? (
            <div style={{ ...panel, color: C.muted, fontSize: 14, lineHeight: 1.6 }}>{bi(PM_NONE)}</div>
          ) : !personalised ? (
            <>
              <p role="note" style={{ ...panel, marginBottom: 10, color: C.gold, fontSize: 13, lineHeight: 1.6 }}>{bi(PM_NO_BIRTH_PROMPT)}</p>
              <div style={{ display: "grid", gap: 8 }}>{validDays.map((d: any, i: number) => (
                <div key={i} style={{ ...card, padding: "12px 14px", borderLeft: `3px solid ${C.gold}` }}>
                  <span style={{ fontWeight: 700, color: C.gold, fontSize: 15 }}>{dateLabel(d)}</span>
                  <div style={{ fontSize: 12.5, color: C.muted, marginTop: 4 }}>{nakLabel(d.nakName)} · {pakshaLabel(d)}</div>
                </div>
              ))}</div>
            </>
          ) : (
            <>
              {anchors && anchors.janmaSign >= 0 && anchors.janmaSign <= 11 && (
                <p style={{ color: C.gold, fontSize: 12.5, margin: "0 0 6px" }}>{bi(PM_YOUR_STAR)}: {bi(PM_RASHIS[anchors.janmaSign])}</p>
              )}
              {personalised.mode === "annotate" ? (
                <p role="note" style={{ color: C.gold, fontSize: 13, margin: "0 0 8px", lineHeight: 1.6 }}>{bi(PM_ANNOTATE_NOTE)}</p>
              ) : (
                <p style={{ color: C.muted, fontSize: 13, margin: "0 0 8px" }}>{bi(PM_COUNT(personalised.kept.length, validDays.length))}</p>
              )}
              <div style={{ display: "grid", gap: 8 }}>
                {personalised.kept.map((d: any, i: number) => <KeptCard key={"k" + i} d={d} />)}
                {personalised.setAside.map((d: any, i: number) => <AsideCard key={"a" + i} d={d} />)}
              </div>
              <p style={{ color: C.muted, fontSize: 12.5, margin: "12px 0 0", lineHeight: 1.6 }}>{bi(PM_RESULT_NOTE)}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
