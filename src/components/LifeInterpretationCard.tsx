// Answer-first life reading card. Dumb/presentational: it renders whatever
// buildLifeReading() produced. No chart logic here.
import React from "react";

export default function LifeInterpretationCard({ reading, lang, C, card }) {
  if (!reading || !reading.length) return null;
  const L = lang === "hi" ? "hi" : "en";
  return (
    <div className="rise" style={{ ...card, padding: "1.375rem 1.5rem" }}>
      {reading.map((area) => (
        <div key={area.areaKey} style={{ marginBottom: "1rem" }}>
          <div style={{ fontFamily: "var(--font-display-family)", color: C.gold, fontSize: "var(--font-small)", letterSpacing: 0.2, marginBottom: "0.25rem" }}>
            {area.label[L]}
          </div>
          <p style={{ margin: 0, fontSize: "var(--font-body)", lineHeight: 1.7 }}>{area.text[L]}</p>
        </div>
      ))}
      <p style={{ margin: "0.375rem 0 0", color: C.muted, fontSize: "var(--font-small)", lineHeight: 1.6 }}>
        {L === "hi"
          ? "परम्परा के भाव में — आत्मचिंतन और जिज्ञासा हेतु; किसी योग्य ज्योतिषी के परामर्श का विकल्प नहीं।"
          : "Offered in the spirit of the tradition, for reflection and curiosity — not a substitute for your own judgment or a qualified jyotishi's reading."}
      </p>
    </div>
  );
}
