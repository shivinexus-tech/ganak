import React from "react";
import { T } from "./tokens";

const HERO_ALT = Object.freeze({
  diwali: { en: "Rows of lamps for Lakshmi puja", hi: "लक्ष्मी पूजा के दीप" },
  karvaChauth: { en: "Karva Chauth thali and moon", hi: "करवा चौथ की थाली और चंद्रमा" },
  chhath: { en: "Chhath arghya at the ghat", hi: "घाट पर छठ अर्घ्य" },
  hartalikaTeej: { en: "Shiva and Parvati for Hartalika Teej", hi: "हरतालिका तीज के लिए शिव-पार्वती" },
});

function FestivalHeroImage({ imageKey, lang, C }) {
  if (!imageKey) return null;
  const L = lang === "hi" ? "hi" : "en";
  const src = `/festival-images/${imageKey}.svg`;
  const alt = (HERO_ALT[imageKey] || { en: "Festival illustration", hi: "पर्व चित्र" })[L];
  return (
    <div style={{
      marginBottom: 14,
      borderRadius: T.rMd,
      overflow: "hidden",
      border: `1px solid ${C.line}`,
      background: "#2A2233",
      minHeight: 120,
    }}>
      <img
        src={src}
        alt={alt}
        width={640}
        height={200}
        style={{ display: "block", width: "100%", height: "auto", minHeight: 120, maxHeight: 200, objectFit: "cover" }}
        loading="eager"
        decoding="async"
      />
    </div>
  );
}

export default FestivalHeroImage;
