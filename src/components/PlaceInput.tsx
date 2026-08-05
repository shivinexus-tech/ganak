import React, { useState } from "react";
import { T } from "./ui-style-contract";
import { searchOffline, searchOnline } from "../data/places";

/* ---------------- compact reusable place search ---------------- */
/* onConfirmed (optional) turns on "strict" mode for callers that must not calculate
   with a stale place (the utility calculators): the parent is told, on every change,
   whether the visible text still matches the selected place. In strict mode the field
   also does NOT auto-snap typed text back to the last place on blur — a user who
   typed garbage keeps seeing their garbage, so the parent can block and explain,
   instead of silently reusing the old coordinates. Callers without onConfirmed
   (Daily, Prashna) keep the original behaviour untouched. */
function PlaceInput({ value, onPick, C, lang = "en", onConfirmed, inputId }) {
  const [q, setQ] = useState(value ? value.label : "");
  const [sugs, setSugs] = useState([]);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const deb = React.useRef(null);
  const seq = React.useRef(0);

  React.useEffect(() => {
    if (onConfirmed) return; // strict mode: never resync silently; keep typed text visible
    if (!open && value) setQ(value.label);
  }, [value, open, onConfirmed]);

  const confirmed = !!value && q.trim().length > 0 && q.trim().toLowerCase() === String(value.label || "").toLowerCase();
  React.useEffect(() => {
    if (onConfirmed) onConfirmed(confirmed);
  }, [confirmed, onConfirmed]);

  const onChange = (text) => {
    setQ(text);
    setOpen(true);
    const offline = searchOffline(text);
    setSugs(offline);
    if (deb.current) clearTimeout(deb.current);
    if (text.trim().length < 2) { setBusy(false); return; }
    const my = ++seq.current;
    setBusy(true);
    deb.current = setTimeout(async () => {
      try {
        const online = await searchOnline(text);
        if (my !== seq.current) return;
        const seen = new Set(offline.map((o) => o.label.toLowerCase()));
        setSugs(offline.concat(online.filter((o) => !seen.has(o.label.toLowerCase()))).slice(0, 8));
      } catch { /* offline results already shown */ }
      finally { if (my === seq.current) setBusy(false); }
    }, 350);
  };

  const pick = (p) => {
    onPick(p);
    setQ(p.label);
    setSugs([]);
    setOpen(false);
  };

  // ARIA 1.2 combobox wiring. Without it a screen-reader user gets an unlabelled text box
  // and is never told that suggestions appeared.
  const listId = `${inputId || "place"}-suggestions`;
  const statusId = `${inputId || "place"}-status`;
  const searched = q.trim().length >= 2 && !busy;
  const noMatch = open && searched && sugs.length === 0;
  const popupOpen = open && (sugs.length > 0 || busy);

  return (
    <div style={{ position: "relative", minWidth: "11.25rem", flex: "0 1 240px" }}>
      <input
        id={inputId}
        value={q}
        onChange={(e) => onChange(e.target.value)}
        onFocus={(e) => { e.target.select(); setOpen(true); }}
        placeholder={lang === "hi" ? "शहर बदलें…" : "Change city…"}
        aria-label={lang === "hi" ? "शहर खोजें" : "Search for a city"}
        role="combobox"
        aria-expanded={popupOpen}
        aria-controls={listId}
        aria-describedby={noMatch ? statusId : undefined}
        aria-autocomplete="list"
        autoComplete="off"
        style={{ width: "100%", height: T.ctrlH, boxSizing: "border-box", background: C.panel || "var(--surface-sunken)", border: `0.0625rem solid ${noMatch ? "var(--bad)" : C.line}`, borderRadius: T.rMd, color: C.ivory, padding: "0 0.75rem", fontSize: "var(--font-small)", fontFamily: "var(--font-body-family)" }}
      />
      {popupOpen && (
        <div id={listId} role="listbox" aria-label={lang === "hi" ? "मिलते-जुलते स्थान" : "Matching places"} style={{ position: "absolute", left: 0, right: 0, top: "100%", zIndex: 20, background: C.panel || "var(--surface-active)", border: `0.0625rem solid ${C.gold}`, borderRadius: "0.5rem", marginTop: "0.25rem", overflow: "hidden", boxShadow: "var(--elevation-3)" }}>
          {sugs.map((p) => (
            <button key={p.label + p.lat} className="sug comfort-focus" role="option" aria-selected="false" onClick={() => pick(p)}
              style={{ display: "block", width: "100%", minHeight: T.ctrlH, textAlign: "left", padding: "0.5rem 0.75rem", background: "transparent", border: "none", borderBottom: `0.0625rem solid ${C.line}`, color: C.ivory, fontFamily: "var(--font-body-family)", fontSize: "var(--font-small)", cursor: "pointer" }}>
              {p.label}
            </button>
          ))}
          {busy && <div style={{ padding: "0.5rem 0.75rem", color: C.muted, fontSize: "var(--font-label)" }}>{lang === "hi" ? "और स्थान खोजे जा रहे हैं…" : "Searching more places…"}</div>}
        </div>
      )}
      {/* An unmatched search used to do nothing at all — no list, no message, no spinner. */}
      {noMatch && (
        <div id={statusId} role="status" style={{ marginTop: "0.25rem", color: "var(--bad)", fontSize: "var(--font-label)", lineHeight: 1.45 }}>
          {lang === "hi"
            ? "इस नाम का कोई स्थान नहीं मिला। नज़दीकी बड़े शहर का नाम आज़माएँ।"
            : "No place found with that name. Try the nearest larger city."}
        </div>
      )}
    </div>
  );
}


export default PlaceInput;
export { PlaceInput };
