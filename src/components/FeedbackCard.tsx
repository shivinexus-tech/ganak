import React, { useState } from "react";
import { T } from "./ui-style-contract";
import { privacyEvent } from "../telemetry/privacy-events";

const ENDPOINT = String(import.meta.env?.VITE_FEEDBACK_ENDPOINT || "").trim();

export default function FeedbackCard({ lang, C, card }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const send = async () => {
    const text = message.trim();
    if (text.length < 5) return setStatus(lang === "hi" ? "कृपया थोड़ा और लिखें।" : "Please add a little more detail.");
    if (!ENDPOINT) return setStatus(lang === "hi" ? "प्रतिक्रिया सेवा अभी जुड़ी नहीं है।" : "The feedback service is not connected yet.");
    try {
      const res = await fetch(ENDPOINT, { method: "POST", credentials: "omit", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: text.slice(0, 2000), path: location.pathname }) });
      if (!res.ok) throw new Error("feedback failed");
      setMessage("");
      setStatus(lang === "hi" ? "धन्यवाद—प्रतिक्रिया भेजी गई।" : "Thank you—feedback sent.");
      privacyEvent("feedback_sent", { area: location.pathname, language: lang, outcome: "sent" });
    } catch (e) {
      setStatus(lang === "hi" ? "प्रतिक्रिया नहीं भेजी जा सकी—बाद में फिर प्रयास करें।" : "Couldn’t send feedback—please try again later.");
    }
  };
  return (
    <div className="no-print" style={{ ...card, marginTop: T.s5, padding: T.s3 }}>
      <button onClick={() => setOpen(!open)} aria-expanded={open} style={{ width: "100%", minHeight: T.ctrlH, border: 0, background: "transparent", color: C.gold, cursor: "pointer", textAlign: "left" }}>
        {lang === "hi" ? "प्रतिक्रिया दें" : "Send feedback"}
      </button>
      {open && <div>
        <div style={{ fontSize: T.fSmall, color: C.muted, lineHeight: 1.5, marginBottom: "0.5rem" }}>{lang === "hi" ? "ईमेल न लिखें। संदेश और वर्तमान पृष्ठ ही भेजे जाते हैं।" : "Do not include email. Only your message and the current page are sent."}</div>
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} maxLength={2000} rows={4} style={{ width: "100%", border: `1px solid ${C.line}`, borderRadius: T.rMd, padding: 10, font: "inherit" }} />
        <button onClick={send} style={{ marginTop: "0.5rem", minHeight: T.ctrlH, borderRadius: T.rMd, border: 0, padding: "0.5rem 1rem", background: C.gold, color: "var(--on-accent)", cursor: "pointer" }}>{lang === "hi" ? "भेजें" : "Send"}</button>
        {status && <div role="status" style={{ marginTop: "0.4375rem", fontSize: T.fSmall, color: C.muted }}>{status}</div>}
      </div>}
    </div>
  );
}
