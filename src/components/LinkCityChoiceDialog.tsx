import React from "react";
import { useModalFocus } from "../accessibility/useModalFocus";
import { T } from "./ui-style-contract";

type Place = { label: string; lat: number; lon: number; zone: string };

export default function LinkCityChoiceDialog({ lang, linkedPlace, savedPlace, onUseLinked, onUseSaved }: {
  lang: "hi" | "en";
  linkedPlace: Place;
  savedPlace: Place;
  onUseLinked: () => void;
  onUseSaved: () => void;
}) {
  const hi = lang === "hi";
  const dialogRef = useModalFocus(true, () => {});
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="link-city-title" aria-describedby="link-city-help" style={{ position: "fixed", inset: 0, zIndex: 1000, display: "grid", placeItems: "center", padding: T.s4, background: "color-mix(in srgb, var(--ink), transparent 28%)" }}>
      <section ref={dialogRef} style={{ width: "min(100%, 30rem)", padding: T.s6, borderRadius: T.rLg, border: "0.0625rem solid var(--line)", background: "var(--surface-active)", boxShadow: T.e3 }}>
        <div style={{ color: "var(--accent)", fontSize: T.fLabel, fontWeight: 700, letterSpacing: ".08em" }}>{hi ? "शहर की पुष्टि करें" : "CONFIRM THE CITY"}</div>
        <h1 id="link-city-title" style={{ margin: `${T.s2} 0`, fontFamily: T.serif, fontSize: T.fTitle, lineHeight: 1.2 }}>
          {hi ? "किस शहर का पंचांग देखें?" : "Which city’s Panchang would you like?"}
        </h1>
        <p id="link-city-help" style={{ margin: `0 0 ${T.s5}`, color: "var(--muted)", lineHeight: 1.55 }}>
          {hi
            ? `इस लिंक में ${linkedPlace.label} है, लेकिन आपका याद रखा शहर ${savedPlace.label} है। आपकी याद रखी पसंद अपने-आप नहीं बदलेगी।`
            : `This link is set to ${linkedPlace.label}, but your remembered city is ${savedPlace.label}. Your remembered preference will not be changed automatically.`}
        </p>
        <div style={{ display: "grid", gap: T.s3 }}>
          <button type="button" data-modal-autofocus className="comfort-control comfort-focus" onClick={onUseLinked} style={{ minHeight: T.ctrlH, border: 0, borderRadius: T.rMd, padding: `${T.s2} ${T.s4}`, background: "var(--accent)", color: "var(--on-accent)", fontWeight: 700, cursor: "pointer" }}>
            {hi ? `${linkedPlace.label} का पंचांग देखें` : `View ${linkedPlace.label} for this link`}
          </button>
          <button type="button" className="comfort-control comfort-focus" onClick={onUseSaved} style={{ minHeight: T.ctrlH, border: "0.0625rem solid var(--line)", borderRadius: T.rMd, padding: `${T.s2} ${T.s4}`, background: "var(--surface-active)", color: "var(--ink)", fontWeight: 700, cursor: "pointer" }}>
            {hi ? `मेरा याद रखा शहर रखें: ${savedPlace.label}` : `Use my remembered city: ${savedPlace.label}`}
          </button>
        </div>
        <p style={{ margin: `${T.s4} 0 0`, color: "var(--muted)", fontSize: T.fLabel, lineHeight: 1.45 }}>
          {hi ? "बाद में सामान्य शहर खोज से शहर बदलने पर ही आपकी याद रखी पसंद बदलेगी।" : "Your remembered city changes only when you deliberately choose another city using the normal city search."}
        </p>
      </section>
    </div>
  );
}
