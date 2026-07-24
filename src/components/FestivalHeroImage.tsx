import React from "react";
import { T } from "./tokens";
import { heroArtForKey } from "../data/festival-hero-art";

function FestivalHeroImage({ imageKey, lang, C }) {
  if (!imageKey) return null;
  const L = lang === "hi" ? "hi" : "en";
  const art = heroArtForKey(imageKey);
  const src = `/festival-images/${imageKey}.svg`;
  const alt = art?.alt?.[L] || (L === "hi" ? "पर्व चित्र" : "Festival illustration");
  return (
    <div style={{
      marginBottom: 14,
      borderRadius: T.rMd,
      overflow: "hidden",
      border: `1px solid ${C.line}`,
      background: "#1a1030",
      minHeight: 140,
    }}>
      <img
        src={src}
        alt={alt}
        width={640}
        height={240}
        style={{ display: "block", width: "100%", height: "auto", minHeight: 140, maxHeight: 240, objectFit: "cover" }}
        loading="eager"
        decoding="async"
      />
    </div>
  );
}

export default FestivalHeroImage;
