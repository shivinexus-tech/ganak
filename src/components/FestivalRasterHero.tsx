import React from "react";
import { T } from "./ui-style-contract";
import { heroArtForKey } from "../data/festival-hero-art";

// Real festival hero: an AI-generated raster normalized to a 1280×480 WebP by
// scripts/process-festival-images.mjs (public/festival-images/raster/<key>.webp).
// It renders ONLY when that file exists — festivals without one show no banner
// at all, never a placeholder. There is deliberately no SVG fallback.
function FestivalRasterHero({ imageKey, lang, C }) {
  const src = imageKey ? `/festival-images/raster/${imageKey}.webp` : null;
  const [failed, setFailed] = React.useState(false);

  // Re-arm when navigating between festivals.
  React.useEffect(() => { setFailed(false); }, [src]);

  if (!src || failed) return null;
  const L = lang === "hi" ? "hi" : "en";
  const art = heroArtForKey(imageKey);
  const alt = art?.alt?.[L] || (L === "hi" ? "पर्व चित्र" : "Festival illustration");

  return (
    <img
      src={src}
      alt={alt}
      width={1280}
      height={480}
      loading="eager"
      decoding="async"
      onError={() => setFailed(true)}
      style={{ display: "block", width: "100%", height: "auto", aspectRatio: "8 / 3", objectFit: "cover", borderRadius: T.rMd, border: `1px solid ${C.line}`, background: C.panel, marginBottom: 14 }}
    />
  );
}

export default FestivalRasterHero;
