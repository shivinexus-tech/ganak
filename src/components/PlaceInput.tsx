import React, { useState } from "react";
import { T } from "./tokens";
import { searchOffline, searchOnline } from "../data/places";

/* ---------------- compact reusable place search ---------------- */
/* onConfirmed (optional) turns on "strict" mode for callers that must not calculate
   with a stale place (the utility calculators): the parent is told, on every change,
   whether the visible text still matches the selected place. In strict mode the field
   also does NOT auto-snap typed text back to the last place on blur — a user who
   typed garbage keeps seeing their garbage, so the parent can block and explain,
   instead of silently reusing the old coordinates. Callers without onConfirmed
   (Daily, Prashna) keep the original behaviour untouched. */
function PlaceInput({ value, onPick, C, lang = "en", onConfirmed }) {
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

  return (
    <div style={{ position: "relative", minWidth: 180, flex: "0 1 240px" }}>
      <input
        value={q}
        onChange={(e) => onChange(e.target.value)}
        onFocus={(e) => { e.target.select(); setOpen(true); }}
        placeholder={lang === "hi" ? "शहर बदलें…" : "Change city…"}
        autoComplete="off"
        style={{ width: "100%", height: T.ctrlH, boxSizing: "border-box", background: "#FFFDF7", border: `1px solid ${C.line}`, borderRadius: T.rMd, color: C.ivory, padding: "0 12px", fontSize: 13.5, fontFamily: "Spectral, serif", outline: "none" }}
      />
      {open && (sugs.length > 0 || busy) && (
        <div style={{ position: "absolute", left: 0, right: 0, top: "100%", zIndex: 20, background: "#FFFFFF", border: `1px solid ${C.gold}`, borderRadius: 8, marginTop: 4, overflow: "hidden", boxShadow: "0 12px 30px rgba(95,70,20,.18)" }}>
          {sugs.map((p) => (
            <button key={p.label + p.lat} className="sug" onClick={() => pick(p)}
              style={{ display: "block", width: "100%", textAlign: "left", padding: "8px 12px", background: "transparent", border: "none", borderBottom: `1px solid ${C.line}`, color: C.ivory, fontFamily: "Spectral, serif", fontSize: 13, cursor: "pointer" }}>
              {p.label}
            </button>
          ))}
          {busy && <div style={{ padding: "8px 12px", color: C.muted, fontSize: 12 }}>{lang === "hi" ? "और स्थान खोजे जा रहे हैं…" : "Searching more places…"}</div>}
        </div>
      )}
    </div>
  );
}


export default PlaceInput;
export { PlaceInput };
