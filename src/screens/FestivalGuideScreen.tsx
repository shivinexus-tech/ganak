/* Shareable festival-guide entry screen. The normal Fasts & Festivals list keeps
   its existing click/expand behaviour; these routes are an additional entry path. */

import React, { useEffect, useState } from "react";
import { T } from "../components/tokens";
import PlaceInput from "../components/PlaceInput";
import { fmtTimeD } from "../components/format";
import VratVidhiCard from "../components/VratVidhiCard";
import { VRAT_VIDHI } from "../data/vrat-vidhis";
import { CHHATH_SHARED_KEYS, FESTIVAL_PAGE_ROUTES, FEST_META, OBS_META } from "../data/festival-pages";
import { scanPanchangCalendar } from "../engine/festivals";
import { vratDetail } from "../engine/muhurat";
import { zoneOffset } from "../engine/panchang";

const FESTIVAL_GUIDE_ROUTES = FESTIVAL_PAGE_ROUTES;
const DAY_MS = 86400000;
const SCAN_DAYS = 430;
const SCAN_FAST_DAYS = 430;

function normalizedFestivalPath(pathname) {
  const clean = String(pathname || "/").replace(/\/{2,}/g, "/");
  return clean.length > 1 ? clean.replace(/\/+$/, "") : clean;
}

function festivalGuideFromPath(pathname) {
  return FESTIVAL_GUIDE_ROUTES[normalizedFestivalPath(pathname)] || null;
}

function matchKeysForGuide(guide) {
  if (!guide) return [];
  if (guide.key === "chhath" || (guide.status === "shared" && guide.vidhiKey === "chhath")) {
    return [...CHHATH_SHARED_KEYS];
  }
  return [guide.key];
}

function pickOccurrence(items, nowMs) {
  if (!items || !items.length) return null;
  const sorted = [...items].sort((a, b) => a.ms - b.ms);
  const upcoming = sorted.find((item) => item.ms >= nowMs - 0.5 * DAY_MS);
  return upcoming || sorted[sorted.length - 1];
}

function findLocalFestivalOccurrence(guide, place, nowMs = Date.now()) {
  if (!guide || !place || !Number.isFinite(place.lat) || !Number.isFinite(place.lon)) {
    throw new Error("place-required");
  }
  const probe = new Date(nowMs);
  const tz = zoneOffset(place.zone, probe.getUTCFullYear(), probe.getUTCMonth() + 1, probe.getUTCDate()) ?? 5.5;
  const fromMs = nowMs - 14 * DAY_MS;
  const cal = scanPanchangCalendar(fromMs, tz, SCAN_DAYS, SCAN_FAST_DAYS, place);
  const keys = new Set(matchKeysForGuide(guide));
  const pool = guide.sourceKind === "observance" ? cal.fasts : cal.festivals;
  const hits = pool.filter((item) => keys.has(item.key));
  const hit = pickOccurrence(hits, nowMs);
  if (!hit) return { hit: null, detail: null, tz };
  const meta = guide.sourceKind === "observance" ? OBS_META[guide.metaKey] : FEST_META[guide.metaKey];
  const timing = meta && meta.timing ? meta.timing : null;
  const detail = vratDetail(place, "lahiri", hit.ms, timing);
  return { hit, detail, tz, timing };
}

function formatLocalDate(ms, tz, lang) {
  const d = new Date(ms + tz * 3600000);
  return d.toLocaleDateString(lang === "hi" ? "hi-IN" : "en-IN", {
    weekday: "long", year: "numeric", month: "long", day: "numeric", timeZone: "UTC",
  });
}

function FestivalGuideScreen({ guide, lang, C, card, place, onPlace }) {
  const L = lang === "hi" ? "hi" : "en";
  const data = guide && guide.vidhiKey ? VRAT_VIDHI[guide.vidhiKey] : null;
  const meta = guide
    ? (guide.sourceKind === "observance" ? OBS_META[guide.metaKey] : FEST_META[guide.metaKey])
    : null;
  const title = guide ? guide.title[L] : "";
  const homeHref = `/?lang=${L}&screen=daily`;
  const [localTiming, setLocalTiming] = useState({ status: "idle", hit: null, detail: null, tz: null, error: null });
  const [retryTick, setRetryTick] = useState(0);

  useEffect(() => {
    if (!title || typeof document === "undefined") return undefined;
    const previousTitle = document.title;
    document.title = `${title} · Ganak`;
    return () => { document.title = previousTitle; };
  }, [title]);

  useEffect(() => {
    if (!guide || !place) {
      setLocalTiming({ status: "idle", hit: null, detail: null, tz: null, error: null });
      return undefined;
    }
    let cancelled = false;
    setLocalTiming((prev) => ({ ...prev, status: "loading", error: null }));
    const timer = setTimeout(() => {
      try {
        const result = findLocalFestivalOccurrence(guide, place);
        if (cancelled) return;
        if (!result.hit) {
          setLocalTiming({
            status: "empty",
            hit: null,
            detail: null,
            tz: result.tz,
            error: null,
          });
          return;
        }
        setLocalTiming({
          status: "ready",
          hit: result.hit,
          detail: result.detail,
          tz: result.tz,
          error: null,
        });
      } catch (e) {
        if (cancelled) return;
        setLocalTiming({
          status: "error",
          hit: null,
          detail: null,
          tz: null,
          error: e,
        });
      }
    }, 0);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [guide, place, retryTick]);

  if (!guide) return null;

  const timingText = meta && meta.timing
    ? ({
        parana: { en: "This observance has a paran (fast-completion) time.", hi: "इस व्रत में पारण का समय लागू होता है।" },
        sunrise: { en: "Sunrise or daybreak matters for this observance.", hi: "इस पर्व में सूर्योदय या प्रातःकाल महत्वपूर्ण है।" },
        morning: { en: "The morning period matters for this observance.", hi: "इस पर्व में प्रातःकाल महत्वपूर्ण है।" },
        midnight: { en: "The midnight or Nishita period matters for this observance.", hi: "इस पर्व में मध्यरात्रि या निषीथ काल महत्वपूर्ण है।" },
        sunset: { en: "The evening or sunset period matters for this observance.", hi: "इस व्रत में संध्या या सूर्यास्त का समय महत्वपूर्ण है।" },
        moonrise: { en: "Moonrise matters for completing this observance.", hi: "इस व्रत के समापन में चन्द्रोदय महत्वपूर्ण है।" },
        stars: { en: "Star sighting matters for completing this observance.", hi: "इस व्रत के समापन में तारा-दर्शन महत्वपूर्ण है।" },
      }[meta.timing] || null)
    : null;

  const d = localTiming.detail;
  const hit = localTiming.hit;
  const tz = localTiming.tz;

  return (
    <main className="rise" aria-labelledby="festival-guide-title">
      <a
        href={homeHref}
        style={{ display: "inline-flex", alignItems: "center", minHeight: T.ctrlH, padding: "0 14px", marginBottom: T.s3, border: `1px solid ${C.line}`, borderRadius: T.rMd, background: C.panel, color: C.ivory, textDecoration: "none", fontSize: T.fSmall }}
      >
        ‹ {L === "hi" ? "आज के पंचांग पर वापस जाएँ" : "Back to today's panchang"}
      </a>

      <section style={{ ...card, padding: "20px", overflow: "hidden" }}>
        <div style={{ ...T.label, color: C.gold, marginBottom: 6 }}>
          {data
            ? (L === "hi" ? "व्रत एवं पूजा मार्गदर्शिका" : "FASTING & WORSHIP GUIDE")
            : (L === "hi" ? "पर्व एवं व्रत परिचय" : "FESTIVAL & OBSERVANCE OVERVIEW")}
        </div>
        <h2 id="festival-guide-title" style={{ margin: "0 0 5px", color: C.ivory, fontFamily: T.serif, fontSize: T.fHeading, lineHeight: 1.2 }}>
          {title}
        </h2>
        <p style={{ margin: "0 0 14px", color: C.muted, fontSize: T.fSmall, lineHeight: 1.55 }}>
          {data
            ? (L === "hi"
                ? "पहले संक्षिप्त उत्तर, फिर व्रत, पूजा, पारण और उद्यापन की पूरी विधि।"
                : "A clear answer first, followed by the complete fasting, puja, paran and udyapan guidance.")
            : (L === "hi"
                ? "गणक में अभी उपलब्ध पंचांग परिचय नीचे है। विस्तृत पूजा-विधि स्रोत और समीक्षा के बाद ही जोड़ी जाएगी।"
                : "Below is the calendar description currently available in Ganak. Detailed worship guidance will be added only after it is sourced and reviewed.")}
        </p>

        <div style={{ marginBottom: 14, padding: "12px 13px", borderRadius: T.rMd, border: `1px solid ${C.line}`, background: "rgba(168,106,18,.06)" }}>
          <div style={{ ...T.label, color: C.gold, marginBottom: 8 }}>
            {L === "hi" ? "आपके शहर का समय" : "LOCAL DATE & TIMING"}
          </div>
          <div style={{ marginBottom: 10, maxWidth: 320 }}>
            <PlaceInput value={place} onPick={onPlace} C={C} lang={lang} />
          </div>
          {place && place.label && (
            <div style={{ fontSize: T.fMicro, color: C.muted, marginBottom: 8, fontStyle: "italic" }}>
              {L === "hi" ? `सभी समय ${place.label} के अनुसार` : `All times shown for ${place.label}`}
            </div>
          )}
          {localTiming.status === "loading" && (
            <div style={{ fontSize: T.fSmall, color: C.muted, fontStyle: "italic" }} role="status">
              {L === "hi" ? "आपके शहर के लिए तारीख़ और समय निकाले जा रहे हैं…" : "Working out the date and timing for your city…"}
            </div>
          )}
          {localTiming.status === "error" && (
            <div style={{ display: "grid", gap: 8 }} role="alert">
              <div style={{ fontSize: T.fSmall, color: C.sindoor, lineHeight: 1.5 }}>
                {L === "hi"
                  ? "इस स्थान के लिए तारीख़ निकाल नहीं सके। शहर फिर से चुनें या दोबारा कोशिश करें — मार्गदर्शिका यहीं रहेगी।"
                  : "We couldn't work out the date for this place. Pick the city again or retry — your guide stays on this page."}
              </div>
              <button
                type="button"
                onClick={() => setRetryTick((n) => n + 1)}
                style={{
                  justifySelf: "start", height: T.ctrlH, padding: "0 14px", borderRadius: T.rMd,
                  border: `1px solid ${C.gold}`, background: "rgba(168,106,18,.08)", color: C.gold,
                  fontFamily: T.serif, fontSize: T.fSmall, cursor: "pointer",
                }}
              >
                {L === "hi" ? "फिर से कोशिश करें" : "Try again"}
              </button>
            </div>
          )}
          {localTiming.status === "empty" && (
            <div style={{ fontSize: T.fSmall, color: C.muted, lineHeight: 1.5 }}>
              {L === "hi"
                ? "अगले लगभग एक वर्ष में इस पर्व की तिथि इस स्थान के लिए सूची में नहीं मिली। शहर बदलकर देखें।"
                : "No date for this observance turned up in the next year for this place. Try another city."}
            </div>
          )}
          {localTiming.status === "ready" && hit && tz != null && (
            <div style={{ display: "grid", gap: 6 }}>
              <div style={{ fontSize: T.fBody, color: C.ivory, lineHeight: 1.45 }}>
                <strong style={{ color: C.gold }}>{formatLocalDate(hit.ms, tz, L)}</strong>
              </div>
              {d && (d.parana || d.moonrise != null || d.sunset != null || d.stars) && (
                <div style={{
                  fontSize: T.fSmall, color: "#1F7A4D", fontWeight: 600,
                  background: "rgba(31,122,77,.07)", border: "1px solid rgba(31,122,77,.22)",
                  borderRadius: T.rSm, padding: "7px 10px", fontVariantNumeric: "tabular-nums", lineHeight: 1.45,
                }}>
                  {d.parana
                    ? <>{L === "hi" ? "पारण: " : "Parana: "}{fmtTimeD(d.parana.start, d.tz, hit.ms)}{L === "hi" ? " से" : " onwards"}{d.parana.dwadashiEnd > d.parana.start && <span style={{ color: C.muted, fontWeight: 400 }}> · {L === "hi" ? "द्वादशी समाप्त " : "Dwadashi ends "}{fmtTimeD(d.parana.dwadashiEnd, d.tz, hit.ms)}</span>}</>
                    : d.moonrise != null
                      ? <>{L === "hi" ? "चंद्रोदय पर व्रत खोलें: " : "Break fast after moonrise: "}{fmtTimeD(d.moonrise, d.tz, hit.ms)}</>
                      : d.stars
                        ? <>{L === "hi" ? "तारे दिखाई देने के बाद व्रत खोलें" : "Break the fast after the stars are visible"}</>
                        : <>{L === "hi" ? "संध्या पूजा सूर्यास्त से: " : "Evening puja from sunset: "}{fmtTimeD(d.sunset, d.tz, hit.ms)}</>}
                </div>
              )}
              {hit.decidingKala && !(d && (d.parana || d.moonrise != null || d.sunset != null || d.stars)) && (
                <div style={{ fontSize: T.fMicro, color: C.muted }}>
                  {L === "hi" ? "निर्णायक काल: " : "Deciding period: "}{hit.decidingKala}
                </div>
              )}
              {timingText && (
                <div style={{ fontSize: T.fMicro, color: C.muted, lineHeight: 1.45 }}>{timingText[L]}</div>
              )}
            </div>
          )}
        </div>

        {data ? (
          <VratVidhiCard data={data} lang={lang} C={C} initiallyOpen />
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {meta && meta.gloss && (
              <div style={{ padding: "12px 13px", borderRadius: T.rMd, background: C.panel, border: `1px solid ${C.line}`, color: C.ivory, fontSize: T.fSmall, lineHeight: 1.55 }}>
                {meta.gloss[L]}
              </div>
            )}
            {meta && meta.deity && (
              <div style={{ color: C.muted, fontSize: T.fSmall, lineHeight: 1.5 }}>
                <strong style={{ color: C.ivory }}>{L === "hi" ? "आराध्य: " : "Deity: "}</strong>{meta.deity[L]}
              </div>
            )}
            {meta && meta.rules && (
              <div style={{ color: C.muted, fontSize: T.fSmall, lineHeight: 1.55 }}>
                <strong style={{ color: C.ivory }}>{L === "hi" ? "परम्परा: " : "Observance: "}</strong>{meta.rules[L]}
              </div>
            )}
            {timingText && localTiming.status !== "ready" && (
              <div style={{ color: C.muted, fontSize: T.fSmall, lineHeight: 1.55 }}>
                <strong style={{ color: C.ivory }}>{L === "hi" ? "समय: " : "Timing: "}</strong>{timingText[L]}
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}

export default FestivalGuideScreen;
export {
  FESTIVAL_GUIDE_ROUTES,
  festivalGuideFromPath,
  normalizedFestivalPath,
  findLocalFestivalOccurrence,
  matchKeysForGuide,
};
