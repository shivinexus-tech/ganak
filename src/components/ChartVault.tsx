/* Chart vault / export / share — pure extraction (SPLIT-UI-CHART-04). Wire deferred.
   Uses the host preview API (window.storage) when present; prefs stay in the URL. */

import React, { useState, useEffect } from "react";
import { T } from "./tokens";
import { SIGN_SHORT } from "../data/chart-divisions";

function ChartVault({ snapshot, result, onLoad, C, card, lang = "en" }) {
  const store = (typeof window !== "undefined" && window.storage) ? window.storage : null;
  const [saved, setSaved] = useState([]);
  const [msg, setMsg] = useState("");
  const [imp, setImp] = useState("");
  const [confirmId, setConfirmId] = useState(null);
  const ready = !!(result && snapshot && snapshot.form && snapshot.place);
  const t = (en, hi) => (lang === "hi" ? hi : en);

  const refresh = async () => {
    if (!store) return;
    try {
      const res = await store.list("chart:");
      const keys = (res && res.keys) || [];
      const items = [];
      for (const k of keys) { try { const r = await store.get(k); if (r && r.value) items.push(JSON.parse(r.value)); } catch (e) {} }
      items.sort((a, b) => (b.savedAt || 0) - (a.savedAt || 0));
      setSaved(items);
    } catch (e) {}
  };
  useEffect(() => { refresh(); }, []);
  const flash = (m) => { setMsg(m); setTimeout(() => setMsg(""), 2600); };

  const saveCurrent = async () => {
    if (!store) { flash("Saving isn't available in this preview — export or share still work."); return; }
    if (!ready) { flash(t("Cast a chart first.", "पहले कुंडली बनाएँ।")); return; }
    const id = "chart:" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const name = (snapshot.form.name || "").trim() || snapshot.place.label || "Unnamed";
    const obj = { id, name, savedAt: Date.now(), form: snapshot.form, place: snapshot.place, tzOverride: snapshot.tzOverride, ayanamsa: snapshot.ayanamsa, summary: `${snapshot.form.date} ${snapshot.form.time} · ${snapshot.place.label}` };
    try { await store.set(id, JSON.stringify(obj)); flash("Saved “" + name + "”."); await refresh(); } catch (e) { flash("Save failed."); }
  };
  const remove = async (id) => { if (!store) return; try { await store.delete(id); await refresh(); flash(lang === "hi" ? "हटा दिया गया।" : "Removed."); setConfirmId(null); } catch (e) {} };
  const askRemove = (id) => {
    if (confirmId === id) { remove(id); return; }
    setConfirmId(id);
    setTimeout(() => setConfirmId((cur) => (cur === id ? null : cur)), 4000);
  };

  const copy = async (text, okMsg) => {
    try { await navigator.clipboard.writeText(text); flash(okMsg); } catch (e) { setImp(text); flash("Copy unavailable — text placed below to copy manually."); }
  };

  const exportJSON = () => {
    if (!ready) { flash(t("Cast a chart first.", "पहले कुंडली बनाएँ।")); return; }
    const data = {
      app: "Ganak", exportedAt: new Date().toISOString(),
      birth: { name: snapshot.form.name, date: snapshot.form.date, time: snapshot.form.time, place: snapshot.place.label, lat: snapshot.place.lat, lon: snapshot.place.lon, tz: result.tz, ayanamsa: snapshot.ayanamsa },
      ascendant: { sign: SIGN_SHORT[result.ascSign], degree: result.ascDeg },
      planets: result.rows.map((p) => ({ name: p.name, sign: SIGN_SHORT[p.sign], degree: p.deg, retro: !!p.retro })),
      currentDasha: result.current ? result.current.lord : null,
    };
    const text = JSON.stringify(data, null, 2);
    const fname = (snapshot.form.name || "kundli").replace(/[^\w-]+/g, "_") + "-kundli.json";
    let downloaded = false;
    try {
      const blob = new Blob([text], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = fname; document.body.appendChild(a); a.click();
      document.body.removeChild(a); URL.revokeObjectURL(url); downloaded = true;
    } catch (e) {}
    copy(text, downloaded ? t("Exported — downloaded and copied to clipboard.", "निर्यात हुआ — डाउनलोड और क्लिपबोर्ड पर कॉपी हुआ।") : t("Copied chart JSON to clipboard.", "कुंडली JSON क्लिपबोर्ड पर कॉपी हुआ।"));
  };

  const shareCode = () => {
    if (!ready) { flash(t("Cast a chart first.", "पहले कुंडली बनाएँ।")); return; }
    try {
      const code = btoa(encodeURIComponent(JSON.stringify({ form: snapshot.form, place: snapshot.place, tzOverride: snapshot.tzOverride, ayanamsa: snapshot.ayanamsa })));
      copy(code, t("Share code copied — paste into another session's Import box.", "साझा कोड कॉपी हुआ — दूसरे सत्र के इम्पोर्ट बॉक्स में पेस्ट करें।"));
    } catch (e) { flash(t("Couldn't build a share code — cast a chart first and try again.", "साझा कोड नहीं बना — पहले कुंडली बनाएँ और पुनः प्रयास करें।")); }
  };

  const importChart = () => {
    const code = imp.trim(); if (!code) { flash(t("Paste a share code first.", "पहले एक साझा कोड पेस्ट करें।")); return; }
    try {
      const obj = JSON.parse(decodeURIComponent(atob(code)));
      if (!obj.form || !obj.place) throw new Error("bad");
      onLoad(obj); setImp(""); flash(t("Chart loaded.", "कुंडली लोड हुई।"));
    } catch (e) { flash(t("That share code doesn't look right — check that you copied the whole thing and try again.", "यह साझा कोड सही नहीं लगता — देखें कि आपने पूरा कोड कॉपी किया है और पुनः प्रयास करें।")); }
  };

  const btn = (label, fn, on = true) => (
    <button onClick={fn} style={{ padding: "7px 13px", borderRadius: 7, fontFamily: "Eczar, serif", fontSize: 13, cursor: "pointer", border: `1px solid ${on ? C.gold : C.line}`, background: on ? "rgba(168,106,18,.08)" : "transparent", color: on ? C.gold : C.muted, opacity: on ? 1 : 0.55 }}>{label}</button>
  );

  return (
    <div style={{ ...card, padding: 16, marginTop: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <span style={{ fontFamily: "Eczar, serif", fontSize: 15, color: C.ivory }}>{t("Saved charts", "सहेजी हुई कुंडलियाँ")}</span>
        <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
          {btn(t("Save current", "वर्तमान सहेजें"), saveCurrent, ready)}
          {btn(t("Export JSON", "JSON निर्यात"), exportJSON, ready)}
          {btn(t("Share code", "साझा कोड"), shareCode, ready)}
        </div>
      </div>

      {saved.length > 0 ? (
        <div style={{ marginTop: 12, display: "grid", gap: 6, maxHeight: 220, overflowY: "auto" }}>
          {saved.map((c) => (
            <div key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, padding: "8px 11px", border: `1px solid ${C.line}`, borderRadius: 8 }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontFamily: "Eczar, serif", fontSize: 13.5, color: C.ivory, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.name}</div>
                <div style={{ fontSize: 11, color: C.muted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.summary}</div>
              </div>
              <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                <button onClick={() => onLoad(c)} style={{ padding: "5px 11px", borderRadius: 6, fontSize: 12.5, fontFamily: "Eczar, serif", cursor: "pointer", border: `1px solid ${C.gold}`, background: "transparent", color: C.gold }}>{t("Load", "लोड")}</button>
                <button onClick={() => askRemove(c.id)} aria-label={confirmId === c.id ? (lang === "hi" ? "पक्का हटाएँ" : "Confirm delete") : (lang === "hi" ? "हटाएँ" : "Delete")} style={{ padding: "5px 9px", borderRadius: 6, fontSize: confirmId === c.id ? 12 : 13, cursor: "pointer", border: `1px solid ${confirmId === c.id ? C.sindoor : C.line}`, background: confirmId === c.id ? "rgba(194,69,30,.08)" : "transparent", color: confirmId === c.id ? C.sindoor : C.muted, fontWeight: confirmId === c.id ? 600 : 400, whiteSpace: "nowrap" }}>{confirmId === c.id ? (lang === "hi" ? "हटाएँ?" : "Delete?") : "✕"}</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ marginTop: 10, fontSize: 12, color: C.muted, fontStyle: "italic" }}>
          {store ? t("No saved charts yet — cast one and press Save current.", "अभी कोई सहेजी कुंडली नहीं — एक बनाएँ और \"वर्तमान सहेजें\" दबाएँ।") : t("Saving isn't available in this preview. Export and Share still work here.", "इस प्रीव्यू में सहेजना उपलब्ध नहीं। निर्यात और साझा फिर भी काम करते हैं।")}
        </div>
      )}

      <div style={{ marginTop: 12, display: "flex", gap: 7, alignItems: "stretch", flexWrap: "wrap" }}>
        <input value={imp} onChange={(e) => setImp(e.target.value)} placeholder={t("Paste a share code to import…", "इम्पोर्ट हेतु साझा कोड पेस्ट करें…")} style={{ flex: 1, minWidth: 180, padding: "8px 11px", borderRadius: 7, border: `1px solid ${C.line}`, background: "#FFFDF7", color: C.ivory, fontFamily: "Spectral, serif", fontSize: 13.5 }} />
        {btn(t("Import", "इम्पोर्ट"), importChart, true)}
      </div>
      {msg && <div style={{ marginTop: 10, fontSize: 12.5, color: C.gold }}>{msg}</div>}
    </div>
  );
}



/* upcoming-occurrence search: tithi name, ekadashi/pradosh variants, festival, or fast */

export { ChartVault };
