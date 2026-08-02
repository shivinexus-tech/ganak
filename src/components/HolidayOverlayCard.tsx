import React from "react";
import { T } from "./ui-style-contract";
import {
  HOLIDAY_OVERLAY_MODES, INDIA_HOLIDAY_DATASET, holidaysForDate,
} from "../data/india-holidays";

export function HolidayOverlaySelect({ mode, onMode, lang }) {
  const L = lang === "hi" ? "hi" : "en";
  return (
    <label style={{ display: "inline-flex", flexDirection: "column", gap: "0.25rem" }}>
      <span style={{ ...T.label, color: "var(--muted)", fontSize: T.fMicro }}>{L === "hi" ? "सरकारी अवकाश ओवरले" : "Government holidays"}</span>
      <select
        value={mode}
        onChange={(event) => onMode(event.target.value)}
        aria-label={L === "hi" ? "अवकाश ओवरले चुनें" : "Choose holiday overlay"}
        style={{
          height: T.ctrlH, borderRadius: T.rMd, border: "0.0625rem solid var(--line)",
          background: "var(--surface-sunken)", color: "var(--ink)", padding: "0 0.625rem", fontFamily: T.body, minWidth: "10.5rem",
        }}
      >
        {HOLIDAY_OVERLAY_MODES.map((item) => <option key={item.id} value={item.id}>{item[L]}</option>)}
      </select>
    </label>
  );
}

export default function HolidayOverlayCard({ isoDate, mode, onMode, lang, C, card }) {
  const L = lang === "hi" ? "hi" : "en";
  const holidays = holidaysForDate(isoDate, mode);
  const yearSupported = Number(isoDate.slice(0, 4)) === INDIA_HOLIDAY_DATASET.year;
  if (mode === "off" || (yearSupported && holidays.length === 0)) return null;
  return (
    <section aria-label={L === "hi" ? "सरकारी अवकाश ओवरले" : "Government holiday overlay"} style={{ ...card, padding: "0.875rem 1rem", marginBottom: "0.75rem", borderLeft: "4px solid var(--muted)" }}>
      <div style={{ marginBottom: holidays.length ? 8 : 0 }}>
        <div style={{ ...T.label, color: "var(--muted)" }}>{L === "hi" ? "सरकारी अवकाश · अलग ओवरले" : "Government holidays · separate overlay"}</div>
        <div style={{ color: C.muted, fontSize: T.fMicro, marginTop: "0.1875rem" }}>{L === "hi" ? "यह हिंदू पंचांग की गणना नहीं बदलता" : "This never changes the Hindu Panchang calculation"}</div>
      </div>
      {mode !== "off" && !yearSupported && <div role="status" style={{ marginTop: "0.625rem", color: C.muted, fontSize: T.fSmall }}>{L === "hi" ? "इस वर्ष की आधिकारिक सूची अभी गणक में सत्यापित नहीं है। पंचांग की गणना उपलब्ध रहती है।" : "The official list for this year is not yet verified in Ganak. Panchang calculations remain available."}</div>}
      {holidays.map((holiday) => <div key={holiday.date + holiday.name.en} style={{ marginTop: "0.625rem", padding: "0.625rem 0.6875rem", borderRadius: T.rSm, background: "var(--surface-sunken)", border: "0.0625rem solid var(--line)" }}>
        <div style={{ color: "var(--ink)", fontFamily: T.serif, fontSize: "var(--font-body)", fontWeight: 600 }}>{holiday.name[L]}</div>
        <div style={{ color: C.muted, fontSize: T.fMicro, marginTop: "0.1875rem" }}>{holiday.kind === "national" ? (L === "hi" ? "भारत का राष्ट्रीय अवकाश" : "National holiday of India") : (L === "hi" ? "2026 केंद्रीय सरकार राजपत्रित सूची · दिल्ली/नई दिल्ली कार्यालय" : "2026 Central Government gazetted list · Delhi/New Delhi offices")}</div>
        {holiday.lunarNotice && <div style={{ color: C.muted, fontSize: T.fMicro, marginTop: "0.1875rem", fontStyle: "italic" }}>{L === "hi" ? "चन्द्र-दर्शन के कारण बाद की सरकारी अधिसूचना लागू हो सकती है।" : "A later government notification may apply when the date depends on moon sighting."}</div>}
      </div>)}
      {mode === "gazetted" && <div style={{ color: C.muted, fontSize: T.fMicro, marginTop: "0.5625rem", lineHeight: 1.45 }}>{L === "hi" ? "राज्य, बैंक और स्थानीय अवकाश अलग हो सकते हैं; यह सूची उन्हें सार्वभौमिक नहीं मानती।" : "State, bank and local holidays can differ; this overlay does not present them as universal."}</div>}
    </section>
  );
}
