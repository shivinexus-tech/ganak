import React, { useEffect, useMemo, useState } from "react";
import { T } from "./tokens";
import { computeVedicSeasonClock, TROPICAL_EVENTS } from "../engine/vedic-season-clock";

export default function SeasonClockCard({ place, lang, ayanamsa = "lahiri", atMs, isToday = true, C, card }) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!isToday) return undefined;
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [isToday]);
  const data = useMemo(() => {
    try {
      if (!place) return null;
      const when = isToday ? Date.now() : atMs;
      return computeVedicSeasonClock(place, ayanamsa, when);
    } catch {
      return null;
    }
  }, [place, ayanamsa, atMs, isToday, tick]);
  if (!data) {
    return (
      <section style={{ ...card, padding: "16px 18px", marginBottom: 14, border: `1px solid ${C.line}` }}>
        <div style={{ ...T.label, color: C.gold, marginBottom: 4 }}>{lang === "hi" ? "ऋतु और वैदिक घड़ी उपलब्ध नहीं" : "Season and Vedic clock unavailable"}</div>
        <div style={{ fontSize: 12.5, color: C.muted, lineHeight: 1.55 }}>
          {lang === "hi" ? "इस स्थान/तारीख़ पर सूर्योदय नहीं मिला, इसलिए घटी-घड़ी और ऋतु-सीमा सुरक्षित रूप से नहीं निकाली जा सकती।" : "Sunrise is unavailable for this place/date, so the Ghati clock and season boundary cannot be calculated safely."}
        </div>
      </section>
    );
  }
  const fmtDate = (ms) => new Date(ms + data.tz * 3600000).toLocaleDateString(lang === "hi" ? "hi-IN" : "en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
  const fmtTime = (ms) => new Date(ms + data.tz * 3600000).toLocaleTimeString(lang === "hi" ? "hi-IN" : "en-IN", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: "UTC" });
  const g = data.ghati;
  const tropical = data.tropicalNext;
  const tropicalMeta = tropical ? TROPICAL_EVENTS.find((e) => e.key === tropical.key) : null;
  return (
    <section style={{ ...card, padding: "16px 18px", marginBottom: 14 }}>
      <div style={{ ...T.label, color: C.gold, marginBottom: 4 }}>{lang === "hi" ? "ऋतु और वैदिक घड़ी" : "Season and Vedic clock"}</div>
      <div style={{ fontFamily: T.serif, fontSize: 17, color: C.ivory, lineHeight: 1.35 }}>
        {lang === "hi"
          ? `अभी ${data.ritu.hi} (${data.ritu.signHi}) में हैं${g ? ` · घड़ी ${g.ghati} घटी ${g.pal} पल ${g.vipal} विपल` : ""}।`
          : `You are in ${data.ritu.en} (${data.ritu.sign})${g ? ` · clock ${g.ghati} ghati ${g.pal} pal ${g.vipal} vipal` : ""}.`}
      </div>
      <div style={{ fontSize: 12.5, color: C.muted, marginTop: 6, lineHeight: 1.55 }}>
        {lang === "hi"
          ? `ऋतु सूर्य की निरयण राशि से गिनी जाती है। अगली ऋतु ${data.ritu.next.hi} ${fmtDate(data.ritu.nextMs)} को शुरू होगी।`
          : `Ritu follows the sidereal Sun sign. Next season ${data.ritu.next.en} begins ${fmtDate(data.ritu.nextMs)}.`}
      </div>
      {g && (
        <div style={{ marginTop: 8, fontSize: 12.5, color: C.ivory, lineHeight: 1.5 }}>
          {lang === "hi"
            ? `घटी-घड़ी आज के सूर्योदय (${fmtTime(g.sunrise)}) से अगले सूर्योदय (${fmtTime(g.nextSunrise)}) तक की ६० घटी में गिनी जाती है — स्थानीय समय।`
            : `The Ghati clock counts 60 ghatis from today's sunrise (${fmtTime(g.sunrise)}) to the next sunrise (${fmtTime(g.nextSunrise)}) — local time.`}
        </div>
      )}
      {tropical && tropicalMeta && (
        <div style={{ marginTop: 10, padding: "10px 12px", borderRadius: T.rSm, background: "#FBF5E7", fontSize: 12.5, lineHeight: 1.55 }}>
          <div style={{ color: C.gold, marginBottom: 3 }}>{lang === "hi" ? "अगला खगोलीय बिंदु" : "Next astronomical point"}</div>
          <div style={{ color: C.ivory }}>{lang === "hi" ? tropical.hi : tropical.en} · {fmtDate(tropical.ms)}</div>
          <div style={{ color: C.muted, marginTop: 4 }}>{lang === "hi" ? tropicalMeta.glossHi : tropicalMeta.glossEn}</div>
          <div style={{ color: C.muted, marginTop: 6, fontStyle: "italic" }}>
            {lang === "hi"
              ? "यह खगोलीय विषुव/अयन है — मकर संक्रांति जैसे धार्मिक पर्व अलग नियम से गिने जाते हैं।"
              : "This is the tropical equinox/solstice — religious festivals such as Makar Sankranti follow separate calendar rules."}
          </div>
        </div>
      )}
    </section>
  );
}
