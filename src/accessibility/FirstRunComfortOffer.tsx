import React from "react";
import { R as T } from "../components/ui-style-contract";
import { useComfort } from "./ComfortProvider";
import { useModalFocus } from "./useModalFocus";

export default function FirstRunComfortOffer({ lang, onParentSetup }: { lang: "hi" | "en"; onParentSetup: () => void }) {
  const { preferences, ready, applyPreset, dismissFirstRun } = useComfort();
  const dialogRef = useModalFocus(ready && !preferences.firstRunComplete, dismissFirstRun);
  if (!ready || preferences.firstRunComplete) return null;
  const hi = lang === "hi";

  const choose = (preset: "simple-large" | "balanced") => {
    applyPreset(preset);
    dismissFirstRun();
  };

  const sample = (preset: "simple-large" | "balanced", large: boolean) => (
    <button
      type="button"
      className="comfort-focus"
      data-modal-autofocus={large ? "true" : undefined}
      onClick={() => choose(preset)}
      style={{
        display: "grid", gap: "0.5rem", textAlign: "left", padding: "0.875rem",
        border: "0.0625rem solid var(--line)", borderRadius: T.rMd,
        background: "var(--surface-active)", color: "var(--ink)", cursor: "pointer",
      }}
    >
      <span aria-hidden="true" style={{ display: "grid", gap: large ? "0.625rem" : "0.35rem" }}>
        <span style={{ fontFamily: T.serif, fontWeight: 700, fontSize: large ? "1.25rem" : "1rem" }}>{hi ? "आज का पंचांग" : "Today's Panchang"}</span>
        <span style={{ height: large ? "0.625rem" : "0.45rem", width: "86%", borderRadius: T.rPill, background: "var(--line)" }} />
        <span style={{ height: large ? "0.625rem" : "0.45rem", width: "62%", borderRadius: T.rPill, background: "var(--line)" }} />
      </span>
      <strong style={{ color: "var(--accent)", fontSize: large ? "1rem" : "0.875rem" }}>
        {large ? (hi ? "सरल और बड़ा" : "Simple & Large") : (hi ? "संतुलित" : "Balanced")}
      </strong>
    </button>
  );

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="comfort-offer-title" style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "flex-end", justifyContent: "center", background: "rgba(20,16,24,.38)", padding: "1rem" }}>
      <section ref={dialogRef} style={{ width: "min(100%, 35rem)", maxHeight: "calc(100dvh - 2rem)", overflowY: "auto", padding: "1.25rem", borderRadius: "1rem", background: "var(--surface-active)", color: "var(--ink)", boxShadow: T.e3 }}>
        <div aria-hidden="true" style={{ fontSize: "1.6rem", marginBottom: "0.35rem" }}>Aa</div>
        <h2 id="comfort-offer-title" style={{ margin: 0, fontFamily: T.serif, fontSize: T.fHeading }}>
          {hi ? "गणक आपको कैसा दिखे?" : "How would you like Ganak to look?"}
        </h2>
        <p style={{ margin: "0.4rem 0 1rem", color: "var(--muted)", fontSize: T.fBody }}>
          {hi ? "नमूना देखकर चुनें। बाद में “अपना बनाएँ · Personalize” में बदल सकते हैं।" : "Choose by looking at the samples. You can change this later in Personalize."}
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "0.75rem" }}>
          {sample("simple-large", true)}
          {sample("balanced", false)}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", justifyContent: "space-between", marginTop: "1rem" }}>
          <button type="button" className="comfort-control comfort-focus" onClick={() => { dismissFirstRun(); onParentSetup(); }} style={{ border: "none", background: "transparent", color: "var(--accent)", cursor: "pointer", fontWeight: 700 }}>
            {hi ? "👪 माता-पिता के लिए सेट करें" : "👪 Set it up for a parent"}
          </button>
          <button type="button" className="comfort-control comfort-focus" onClick={dismissFirstRun} style={{ border: "none", background: "transparent", color: "var(--muted)", cursor: "pointer" }}>
            {hi ? "अभी नहीं" : "Not now"}
          </button>
        </div>
      </section>
    </div>
  );
}
