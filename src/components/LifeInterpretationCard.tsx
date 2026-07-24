// Answer-first life reading card. Dumb/presentational: it renders whatever
// buildLifeReading() produced. No chart logic here.
import React from "react";

export default function LifeInterpretationCard({ reading, lang, C, card }) {
  if (!reading || !reading.length) return null;
  const L = lang === "hi" ? "hi" : "en";
  return (
    <div className="rise" style={{ ...card, padding: "22px 24px" }}>
      {reading.map((area) => (
        <div key={area.areaKey} style={{ marginBottom: 16 }}>
          <div style={{ fontFamily: "Eczar, serif", color: C.gold, fontSize: 13.5, letterSpacing: 0.2, marginBottom: 4 }}>
            {area.label[L]}
          </div>
          <p style={{ margin: 0, fontSize: 15.5, lineHeight: 1.7 }}>{area.text[L]}</p>
        </div>
      ))}
      <p style={{ margin: "6px 0 0", color: C.muted, fontSize: 13, lineHeight: 1.6 }}>
        {L === "hi"
          ? "परम्परा के भाव में — चिंतन और जिज्ञासा हेतु; किसी योग्य ज्योतिषी के परामर्श का विकल्प नहीं।"
          : "Offered in the spirit of the tradition, for reflection and curiosity — not a substitute for your own judgment or a qualified jyotishi's reading."}
      </p>
    </div>
  );
}
