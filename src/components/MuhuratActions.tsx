import React, { useState } from "react";
import { T } from "./tokens";
import { privacyEvent } from "../telemetry/privacy-events";

function ymd(ms, tz) {
  return new Date(ms + tz * 3600000).toISOString().slice(0, 10);
}

function pad(n) {
  return String(n).padStart(2, "0");
}

function icsStamp(ms) {
  const d = new Date(ms);
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;
}

function icsDate(ms, tz) {
  return ymd(ms, tz).replaceAll("-", "");
}

function nextIcsDate(ms, tz) {
  return ymd(ms + 86400000, tz).replaceAll("-", "");
}

function localTime(ms, tz) {
  const d = new Date(ms + tz * 3600000);
  return `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
}

function cleanText(value) {
  return String(value || "").replace(/[\\,;\n]/g, (m) => ({ "\\": "\\\\", ",": "\\,", ";": "\\;", "\n": "\\n" }[m]));
}

export function muhuratShareUrl({ category, from, to, place, lang, action }) {
  const url = new URL(typeof window === "undefined" ? "https://ganak.pages.dev/" : window.location.href);
  url.pathname = "/";
  url.search = "";
  url.searchParams.set("screen", "daily");
  url.searchParams.set("muhurat", category);
  url.searchParams.set("mfrom", from);
  url.searchParams.set("mto", to);
  url.searchParams.set("lang", lang);
  if (action) url.searchParams.set("maction", action);
  if (place) {
    url.searchParams.set("city", place.label);
    url.searchParams.set("lat", String(place.lat));
    url.searchParams.set("lon", String(place.lon));
    url.searchParams.set("zone", place.zone);
  }
  return url.toString();
}

export function muhuratIcs({ result, categoryLabel, placeLabel, actionLabel, lang }) {
  const first = (result.activityWindows || result.samskaraWindows || [])[0];
  const start = first?.start || result.abhijit?.start || result.rise;
  const end = first?.end || result.abhijit?.end || Math.min(result.set, start + 3600000);
  const localWindow = `${localTime(start, result.tz)}–${localTime(end, result.tz)}`;
  const title = lang === "hi"
    ? `गणक मुहूर्त · ${actionLabel || categoryLabel}`
    : `Ganak Muhurat · ${actionLabel || categoryLabel}`;
  const description = lang === "hi"
    ? `${placeLabel} का स्थानीय मुहूर्त: ${localWindow}। गणक द्वारा चुना गया दिन। अंतिम निर्णय में परिवार/परम्परा और व्यावहारिक आवश्यकताएँ भी देखें।`
    : `Local Muhurat for ${placeLabel}: ${localWindow}. A day selected by Ganak. Confirm family tradition and practical requirements before acting.`;
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Ganak//Muhurat//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:ganak-${result.y}-${result.m}-${result.day}-${result.rise}@ganak`,
    `DTSTAMP:${icsStamp(Date.now())}`,
    `DTSTART;VALUE=DATE:${icsDate(result.rise, result.tz)}`,
    `DTEND;VALUE=DATE:${nextIcsDate(result.rise, result.tz)}`,
    `SUMMARY:${cleanText(title)}`,
    `DESCRIPTION:${cleanText(description)}`,
    `LOCATION:${cleanText(placeLabel)}`,
    "BEGIN:VALARM",
    "TRIGGER:-PT24H",
    "ACTION:DISPLAY",
    `DESCRIPTION:${cleanText(title)}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ].join("\r\n");
}

export default function MuhuratActions({ result, category, categoryLabel, action, actionLabel, from, to, place, lang, C }) {
  const [notice, setNotice] = useState("");
  const shareUrl = muhuratShareUrl({ category, from, to, place, lang, action });
  const copyShare = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setNotice(lang === "hi" ? "स्थायी लिंक कॉपी हुआ।" : "Permanent link copied.");
      privacyEvent("muhurat_share",{action:category,language:lang});
    } catch (e) {
      setNotice(lang === "hi" ? "लिंक कॉपी नहीं हुआ—पता-पट्टी से कॉपी करें।" : "Couldn’t copy the link—copy it from the address bar.");
    }
  };
  const exportCalendar = () => {
    const body = muhuratIcs({ result, categoryLabel, placeLabel: place.label, actionLabel, lang });
    const url = URL.createObjectURL(new Blob([body], { type: "text/calendar;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `ganak-${category}-${ymd(result.rise, result.tz)}.ics`;
    a.click();
    URL.revokeObjectURL(url);
    setNotice(lang === "hi" ? "कैलेंडर फ़ाइल तैयार है; इसमें 24 घंटे पहले स्मरण है।" : "Calendar file ready; it includes a 24-hour reminder.");
    privacyEvent("muhurat_export",{action:category,language:lang});
  };
  return (
    <div className="no-print" style={{ marginTop: T.s3, paddingTop: T.s3, borderTop: `1px solid ${C.line}` }}>
      <div style={{ ...T.label, color: C.muted, marginBottom: 7 }}>{lang === "hi" ? "सहेजें एवं साझा करें" : "SAVE & SHARE"}</div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button onClick={copyShare} style={{ minHeight: T.ctrlH, borderRadius: T.rMd, padding: "8px 13px", border: `1px solid ${C.gold}`, background: "#FFF", color: C.gold, cursor: "pointer" }}>
          {lang === "hi" ? "स्थायी लिंक कॉपी करें" : "Copy permanent link"}
        </button>
        <button onClick={exportCalendar} style={{ minHeight: T.ctrlH, borderRadius: T.rMd, padding: "8px 13px", border: `1px solid ${C.line}`, background: "#FFF", color: C.ivory, cursor: "pointer" }}>
          {lang === "hi" ? "कैलेंडर + स्मरण (.ics)" : "Calendar + reminder (.ics)"}
        </button>
      </div>
      <div style={{ fontSize: T.fMicro, color: C.muted, lineHeight: 1.5, marginTop: 7 }}>
        {lang === "hi" ? "कोई ब्राउज़र संग्रह नहीं। स्मरण आपके कैलेंडर ऐप में रहता है।" : "No browser storage. The reminder stays in your calendar app."}
      </div>
      {notice && <div role="status" style={{ fontSize: T.fSmall, color: C.gold, marginTop: 6 }}>{notice}</div>}
    </div>
  );
}
