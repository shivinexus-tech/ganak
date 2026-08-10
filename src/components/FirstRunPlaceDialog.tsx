import React, { useState } from "react";
import { useModalFocus } from "../accessibility/useModalFocus";
import { nearestCity } from "../data/places";
import { T } from "./ui-style-contract";
import PlaceInput from "./PlaceInput";

type Place = { label: string; lat: number; lon: number; zone: string };

export default function FirstRunPlaceDialog({ lang, onPick }: { lang: "hi" | "en"; onPick: (place: Place) => void }) {
  const hi = lang === "hi";
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const dialogRef = useModalFocus(true, () => {});
  const C = {
    panel: "var(--surface-active)", line: "var(--line)", gold: "var(--gold)",
    ivory: "var(--ink)", muted: "var(--muted)",
  };

  const useDeviceLocation = () => {
    setError("");
    if (!navigator.geolocation) {
      setError(hi ? "यह ब्राउज़र डिवाइस का स्थान साझा नहीं कर सकता। कृपया शहर खोजें।" : "This browser cannot share device location. Please search for your city.");
      return;
    }
    setBusy(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const place = nearestCity(coords.latitude, coords.longitude);
        setBusy(false);
        if (!place) {
          setError(hi ? "स्थान पढ़ा नहीं जा सका। कृपया शहर खोजें।" : "Your location could not be read. Please search for your city.");
          return;
        }
        onPick(place);
      },
      () => {
        setBusy(false);
        setError(hi ? "स्थान की अनुमति नहीं मिली। आप नीचे शहर खोज सकते हैं।" : "Location permission was not granted. You can search for your city below.");
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    );
  };

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="first-place-title" aria-describedby="first-place-help" style={{ position: "fixed", inset: 0, zIndex: 1000, display: "grid", placeItems: "center", padding: T.s4, background: "color-mix(in srgb, var(--ink), transparent 28%)" }}>
      <section ref={dialogRef} style={{ width: "min(100%, 30rem)", padding: T.s6, borderRadius: T.rLg, border: "0.0625rem solid var(--line)", background: "var(--surface-active)", boxShadow: T.e3 }}>
        <div style={{ color: "var(--accent)", fontSize: T.fLabel, fontWeight: 700, letterSpacing: ".08em" }}>{hi ? "पहले अपना शहर चुनें" : "CHOOSE YOUR CITY FIRST"}</div>
        <h1 id="first-place-title" style={{ margin: `${T.s2} 0`, fontFamily: T.serif, fontSize: T.fTitle, lineHeight: 1.15 }}>{hi ? "आपका पंचांग कहाँ के लिए है?" : "Where should Ganak calculate for?"}</h1>
        <p id="first-place-help" style={{ margin: `0 0 ${T.s5}`, color: "var(--muted)", lineHeight: 1.55 }}>
          {hi ? "सूर्योदय, तिथि और शुभ समय शहर के अनुसार बदलते हैं। गणक इस डिवाइस पर आपकी पसंद याद रखेगा; आप इसे बाद में कभी भी बदल सकते हैं।" : "Sunrise, tithi and auspicious timings change by city. Ganak will remember your choice on this device, and you can change it anytime."}
        </p>
        <button type="button" data-modal-autofocus className="comfort-control comfort-focus" disabled={busy} onClick={useDeviceLocation} style={{ width: "100%", minHeight: T.ctrlH, border: 0, borderRadius: T.rMd, padding: `0 ${T.s4}`, background: "var(--accent)", color: "var(--on-accent)", fontWeight: 700, cursor: busy ? "wait" : "pointer" }}>
          {busy ? (hi ? "डिवाइस का स्थान लिया जा रहा है…" : "Getting device location…") : (hi ? "मेरे डिवाइस का स्थान लें" : "Use my device location")}
        </button>
        <div aria-hidden="true" style={{ display: "flex", alignItems: "center", gap: T.s3, margin: `${T.s4} 0`, color: "var(--muted)", fontSize: T.fLabel }}><span style={{ flex: 1, borderTop: "0.0625rem solid var(--line)" }} />{hi ? "या" : "OR"}<span style={{ flex: 1, borderTop: "0.0625rem solid var(--line)" }} /></div>
        <label htmlFor="first-run-place" style={{ display: "block", marginBottom: T.s2, fontWeight: 700 }}>{hi ? "शहर खोजें" : "Search for a city"}</label>
        <PlaceInput inputId="first-run-place" value={null} onPick={onPick} C={C} lang={lang} />
        {error && <p role="alert" style={{ margin: `${T.s3} 0 0`, color: "var(--bad)", fontSize: T.fSmall, lineHeight: 1.45 }}>{error}</p>}
        <p style={{ margin: `${T.s4} 0 0`, color: "var(--muted)", fontSize: T.fLabel, lineHeight: 1.45 }}>
          {hi ? "डिवाइस स्थान केवल आपके अनुरोध पर पढ़ा जाता है। आपकी सटीक जगह गणना के लिए इसी डिवाइस पर रहती है।" : "Device location is read only after you ask. Your exact location stays on this device for calculations."}
        </p>
      </section>
    </div>
  );
}
