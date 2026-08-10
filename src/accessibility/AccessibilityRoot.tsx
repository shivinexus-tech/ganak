import React, { useEffect, useMemo, useRef, useState } from "react";
import { R as T } from "../components/ui-style-contract";
import PersonalizeScreen from "../screens/PersonalizeScreen";
import FirstRunComfortOffer from "./FirstRunComfortOffer";
import { useComfort } from "./ComfortProvider";
import FirstRunPlaceDialog from "../components/FirstRunPlaceDialog";
import LinkCityChoiceDialog from "../components/LinkCityChoiceDialog";
import { approvedStorage } from "../storage/approved-storage";

const DEFAULT_PLACE = { label: "New Delhi, India", lat: 28.61, lon: 77.21, zone: "Asia/Kolkata" };

function urlValue(key: string) {
  try { return new URLSearchParams(window.location.search).get(key); }
  catch { return null; }
}

function placeFromUrl() {
  const label = urlValue("city"), zone = urlValue("zone"), rawLat = urlValue("lat"), rawLon = urlValue("lon");
  const lat = rawLat == null || rawLat.trim() === "" ? NaN : Number(rawLat);
  const lon = rawLon == null || rawLon.trim() === "" ? NaN : Number(rawLon);
  let validZone = false;
  try { if (zone) { new Intl.DateTimeFormat("en", { timeZone: zone }).format(); validZone = true; } } catch { /* invalid shared timezone */ }
  return label && zone && validZone && Number.isFinite(lat) && Math.abs(lat) <= 90 && Number.isFinite(lon) && Math.abs(lon) <= 180
    ? { label, zone, lat, lon }
    : null;
}

function replaceQuery(values: Record<string, string | number | null>) {
  const query = new URLSearchParams(window.location.search);
  Object.entries(values).forEach(([key, value]) => value == null || value === "" ? query.delete(key) : query.set(key, String(value)));
  window.history.replaceState(window.history.state, "", `${window.location.pathname}?${query.toString()}${window.location.hash}`);
}

function placeSignature(place: { label: string; lat: number; lon: number; zone: string } | null) {
  return place ? `${place.label}|${place.lat}|${place.lon}|${place.zone}` : "";
}

function samePlace(a: { label: string; lat: number; lon: number; zone: string } | null, b: { label: string; lat: number; lon: number; zone: string } | null) {
  return !!a && !!b && a.label === b.label && a.lat === b.lat && a.lon === b.lon && a.zone === b.zone;
}

function detectLanguage(): "hi" | "en" {
  try {
    const languages = navigator.languages?.length ? navigator.languages : [navigator.language || "en"];
    return languages.some((language) => String(language).toLowerCase().startsWith("hi")) ? "hi" : "en";
  } catch { return "en"; }
}

export default function AccessibilityRoot({ children }: { children: React.ReactNode }) {
  const { preferences, ready, updatePreferences, clearPreferences } = useComfort();
  const [routeTick, setRouteTick] = useState(0);
  const [bootstrapKey, setBootstrapKey] = useState(0);
  const [placeStorageWarning, setPlaceStorageWarning] = useState("");
  const [acceptedLinkSignature, setAcceptedLinkSignature] = useState("");
  const returnScrollRef = useRef(0);
  const explicitLanguage = urlValue("lang");
  const initialLanguage = explicitLanguage === "hi" || explicitLanguage === "en"
    ? explicitLanguage
    : preferences.language === "hi" || preferences.language === "en" ? preferences.language : detectLanguage();
  const [lang, setLang] = useState<"hi" | "en">(initialLanguage);
  const [place, setPlace] = useState(() => placeFromUrl() || preferences.homePlace || DEFAULT_PLACE);

  useEffect(() => {
    let scheduled = 0;
    let lastUrl = window.location.href;
    const syncFromUrl = () => {
      const currentUrl = window.location.href;
      if (currentUrl === lastUrl) return;
      lastUrl = currentUrl;
      const nextLanguage = urlValue("lang");
      if (nextLanguage === "hi" || nextLanguage === "en") setLang(nextLanguage);
      const nextPlace = placeFromUrl();
      setPlace(nextPlace || preferences.homePlace || DEFAULT_PLACE);
      setRouteTick((value) => value + 1);
    };
    const scheduleSync = () => {
      window.clearTimeout(scheduled);
      scheduled = window.setTimeout(syncFromUrl, 0);
    };
    window.addEventListener("popstate", syncFromUrl);
    document.addEventListener("click", scheduleSync);
    document.addEventListener("change", scheduleSync);
    return () => {
      window.clearTimeout(scheduled);
      window.removeEventListener("popstate", syncFromUrl);
      document.removeEventListener("click", scheduleSync);
      document.removeEventListener("change", scheduleSync);
    };
  }, [preferences.homePlace]);

  useEffect(() => {
    if (!ready) return;
    const updates: Record<string, string | number | null> = {};
    if (explicitLanguage !== "hi" && explicitLanguage !== "en" && (preferences.language === "hi" || preferences.language === "en")) {
      setLang(preferences.language);
      updates.lang = preferences.language;
    }
    if (!placeFromUrl() && preferences.homePlace) {
      setPlace(preferences.homePlace);
      updates.city = preferences.homePlace.label;
      updates.lat = preferences.homePlace.lat;
      updates.lon = preferences.homePlace.lon;
      updates.zone = preferences.homePlace.zone;
    }
    if (!Object.keys(updates).length) return;
    replaceQuery(updates);
    setBootstrapKey((value) => value + 1);
    setRouteTick((value) => value + 1);
  }, [ready, explicitLanguage, preferences.language, preferences.homePlace]);

  const screen = useMemo(() => urlValue("screen"), [routeTick]);
  const personalizeRoute = screen === "personalize";
  const linkedPlace = placeFromUrl();
  const linkedSignature = placeSignature(linkedPlace);
  const needsFirstPlace = ready && !linkedPlace && !preferences.homePlace;
  const needsLinkCityChoice = ready && !!linkedPlace && !!preferences.homePlace
    && !samePlace(linkedPlace, preferences.homePlace) && acceptedLinkSignature !== linkedSignature;

  // The shell only titles the screens it owns, so Personalize kept whatever title the
  // previous route had left behind — including when it was deep-linked directly.
  useEffect(() => {
    if (!personalizeRoute) return;
    const previous = document.title;
    document.title = lang === "hi" ? "आपका गणक — रूप, आराम और गोपनीयता" : "Personalize Ganak — comfort, place and privacy";
    return () => { document.title = previous; };
  }, [personalizeRoute, lang]);
  const C = useMemo(() => ({
    bg: "var(--bg-active)", panel: "var(--surface-active)", line: "var(--line)",
    gold: "var(--gold)", accent: "var(--accent)", sindoor: "var(--bad)",
    good: "var(--good)", bad: "var(--bad)", ivory: "var(--ink)", ink: "var(--ink)", muted: "var(--muted)",
  }), []);

  const openPersonalize = () => {
    window.dispatchEvent(new window.Event("ganak:tts-stop-all"));
    returnScrollRef.current = window.scrollY;
    const query = new URLSearchParams(window.location.search);
    query.set("screen", "personalize");
    query.set("lang", lang);
    window.history.pushState({ ...(window.history.state || {}), ganakPersonalize: true }, "", `${window.location.pathname}?${query.toString()}${window.location.hash}`);
    setRouteTick((value) => value + 1);
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  const closePersonalize = () => {
    if (window.history.state?.ganakPersonalize) {
      window.history.back();
      window.requestAnimationFrame(() => window.scrollTo({ top: returnScrollRef.current, behavior: "auto" }));
      return;
    }
    replaceQuery({ screen: "daily" });
    setRouteTick((value) => value + 1);
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  const chooseLanguage = (next: "hi" | "en") => {
    setLang(next);
    updatePreferences({ language: next });
    replaceQuery({ lang: next });
    setBootstrapKey((value) => value + 1);
    setRouteTick((value) => value + 1);
  };

  const choosePlace = (next: typeof DEFAULT_PLACE) => {
    const stored = approvedStorage.preferences.write({ ...preferences, homePlace: next } as unknown as Record<string, unknown>);
    setPlaceStorageWarning(stored.ok ? "" : (lang === "hi"
      ? "यह ब्राउज़र शहर को याद नहीं रख सका। इस बार गणना सही शहर के लिए होगी, लेकिन अगली बार आपको फिर चुनना पड़ सकता है।"
      : "This browser could not remember the city. Calculations will use it now, but you may need to choose again next time."));
    setPlace(next);
    setAcceptedLinkSignature(placeSignature(next));
    updatePreferences({ homePlace: next });
    replaceQuery({ city: next.label, lat: next.lat, lon: next.lon, zone: next.zone });
    setBootstrapKey((value) => value + 1);
    setRouteTick((value) => value + 1);
  };

  const useLinkedPlace = () => {
    if (!linkedPlace) return;
    setPlace(linkedPlace);
    setAcceptedLinkSignature(linkedSignature);
    setBootstrapKey((value) => value + 1);
  };

  const useRememberedPlace = () => {
    const saved = preferences.homePlace;
    if (!saved) return;
    setPlace(saved);
    setAcceptedLinkSignature(placeSignature(saved));
    replaceQuery({ city: saved.label, lat: saved.lat, lon: saved.lon, zone: saved.zone });
    setBootstrapKey((value) => value + 1);
    setRouteTick((value) => value + 1);
  };

  const clearAllPreferences = () => {
    clearPreferences();
    const fallbackLanguage = detectLanguage();
    setLang(fallbackLanguage);
    setPlace(DEFAULT_PLACE);
    replaceQuery({ lang: null, city: null, lat: null, lon: null, zone: null });
    setBootstrapKey((value) => value + 1);
    setRouteTick((value) => value + 1);
  };

  return (
    <>
      {needsFirstPlace && <FirstRunPlaceDialog lang={lang} onPick={choosePlace} />}
      {needsLinkCityChoice && linkedPlace && preferences.homePlace && <LinkCityChoiceDialog lang={lang} linkedPlace={linkedPlace} savedPlace={preferences.homePlace} onUseLinked={useLinkedPlace} onUseSaved={useRememberedPlace} />}
      {!personalizeRoute && !needsLinkCityChoice && <FirstRunComfortOffer lang={lang} onParentSetup={openPersonalize} />}
      {!needsFirstPlace && !needsLinkCityChoice && <div style={{ display: personalizeRoute ? "none" : "block" }}>
        <div style={{ maxWidth: "47.5rem", margin: "0 auto", padding: `${T.s2} ${T.s5} 0`, textAlign: "right", background: "var(--bg-active)" }}>
          <button type="button" onClick={openPersonalize} className="comfort-control comfort-focus" style={{ display: "inline-flex", alignItems: "center", gap: T.s2, border: "0.0625rem solid var(--line)", borderRadius: T.rPill, padding: `0 ${T.s3}`, background: "var(--surface-active)", color: "var(--accent)", fontSize: T.fSmall, fontWeight: 700, cursor: "pointer" }}>
            <span aria-hidden="true">⚙</span>{lang === "hi" ? "Personalize · अपना बनाएँ" : "Personalize"}
          </button>
        </div>
        {placeStorageWarning && <div role="alert" style={{ maxWidth: "47.5rem", margin: `${T.s3} auto 0`, padding: `${T.s3} ${T.s4}`, border: "0.0625rem solid var(--bad)", borderRadius: T.rMd, background: "var(--surface-active)", color: "var(--bad)" }}>{placeStorageWarning}</div>}
        <React.Fragment key={bootstrapKey}>{children}</React.Fragment>
      </div>}
      {personalizeRoute && <div style={{ minHeight: "100vh", background: "var(--bg-active)", color: "var(--ink)", padding: `${T.s5} ${T.s4} 5rem` }}>
        <div style={{ maxWidth: "47.5rem", margin: "0 auto" }}>
          <PersonalizeScreen lang={lang} C={C} place={place} onPlace={choosePlace} onLanguage={chooseLanguage} onClearPreferences={clearAllPreferences} onBack={closePersonalize} />
        </div>
      </div>}
    </>
  );
}
