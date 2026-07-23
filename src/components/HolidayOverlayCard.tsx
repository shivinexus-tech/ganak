import React from "react";
import { T } from "./tokens";
import {
  HOLIDAY_OVERLAY_MODES, INDIA_HOLIDAY_DATASET, holidaysForDate,
} from "../data/india-holidays";

export default function HolidayOverlayCard({ isoDate, mode, onMode, lang, C, card }) {
  const L = lang === "hi" ? "hi" : "en";
  const holidays = holidaysForDate(isoDate, mode);
  const yearSupported = Number(isoDate.slice(0, 4)) === INDIA_HOLIDAY_DATASET.year;
  if (mode === "off" || (yearSupported && holidays.length === 0)) return null;
  return (
    <section aria-label={L === "hi" ? "सरकारी अवकाश ओवरले" : "Government holiday overlay"} style={{ ...card, padding: "14px 16px", marginBottom: 12, borderLeft: "4px solid #315B7D" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
        <div>
          <div style={{ ...T.label, color: "#315B7D" }}>{L === "hi" ? "सरकारी अवकाश · अलग ओवरले" : "Government holidays · separate overlay"}</div>
          <div style={{ color: C.muted, fontSize: T.fMicro, marginTop: 3 }}>{L === "hi" ? "यह हिंदू पंचांग की गणना नहीं बदलता" : "This never changes the Hindu Panchang calculation"}</div>
        </div>
        <select value={mode} onChange={(event) => onMode(event.target.value)} aria-label={L === "hi" ? "अवकाश ओवरले चुनें" : "Choose holiday overlay"} style={{ height: T.ctrlH, borderRadius: T.rMd, border: "1px solid #A9BDCD", background: "#F6FAFD", color: "#284B66", padding: "0 10px", fontFamily: T.body }}>
          {HOLIDAY_OVERLAY_MODES.map((item) => <option key={item.id} value={item.id}>{item[L]}</option>)}
        </select>
      </div>
      {mode !== "off" && !yearSupported && <div role="status" style={{ marginTop: 10, color: C.muted, fontSize: T.fSmall }}>{L === "hi" ? "इस वर्ष की आधिकारिक सूची अभी गणक में सत्यापित नहीं है। पंचांग की गणना उपलब्ध रहती है।" : "The official list for this year is not yet verified in Ganak. Panchang calculations remain available."}</div>}
      {holidays.map((holiday) => <div key={holiday.date + holiday.name.en} style={{ marginTop: 10, padding: "10px 11px", borderRadius: T.rSm, background: "#F2F7FA", border: "1px solid #D4E0E8" }}>
        <div style={{ color: "#284B66", fontFamily: T.serif, fontSize: 15, fontWeight: 600 }}>{holiday.name[L]}</div>
        <div style={{ color: C.muted, fontSize: T.fMicro, marginTop: 3 }}>{holiday.kind === "national" ? (L === "hi" ? "भारत का राष्ट्रीय अवकाश" : "National holiday of India") : (L === "hi" ? "2026 केंद्रीय सरकार राजपत्रित सूची · दिल्ली/नई दिल्ली कार्यालय" : "2026 Central Government gazetted list · Delhi/New Delhi offices")}</div>
        {holiday.lunarNotice && <div style={{ color: C.muted, fontSize: T.fMicro, marginTop: 3, fontStyle: "italic" }}>{L === "hi" ? "चन्द्र-दर्शन के कारण बाद की सरकारी अधिसूचना लागू हो सकती है।" : "A later government notification may apply when the date depends on moon sighting."}</div>}
      </div>)}
      {mode === "gazetted" && <div style={{ color: C.muted, fontSize: T.fMicro, marginTop: 9, lineHeight: 1.45 }}>{L === "hi" ? "राज्य, बैंक और स्थानीय अवकाश अलग हो सकते हैं; यह सूची उन्हें सार्वभौमिक नहीं मानती।" : "State, bank and local holidays can differ; this overlay does not present them as universal."}</div>}
    </section>
  );
}
