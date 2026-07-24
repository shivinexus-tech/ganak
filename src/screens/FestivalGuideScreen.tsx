/* Shareable festival-guide entry screen. The normal Fasts & Festivals list keeps
   its existing click/expand behaviour; these routes are an additional entry path. */

import React, { useEffect, useState } from "react";
import { T } from "../components/tokens";
import PlaceInput from "../components/PlaceInput";
import { fmtTimeD } from "../components/format";
import VratVidhiCard from "../components/VratVidhiCard";
import NavadurgaDayGuide, { NavadurgaSeasonLinks } from "../components/NavadurgaDayGuide";
import FestivalHeroImage from "../components/FestivalHeroImage";
import { VRAT_VIDHI } from "../data/vrat-vidhis";
import { CHHATH_SHARED_KEYS, FESTIVAL_PAGE_ROUTES, FEST_META, OBS_META } from "../data/festival-pages";
import { sankrantiPunyaKala, scanPanchangCalendar } from "../engine/festivals";
import { chhathTimings } from "../engine/chhath";
import { vratDetail } from "../engine/muhurat";
import { navratriTimings, navadurgaDatesFor } from "../engine/navratri";
import { zoneOffset } from "../engine/panchang";

const FESTIVAL_GUIDE_ROUTES = FESTIVAL_PAGE_ROUTES;
const DAY_MS = 86400000;
const SCAN_DAYS = 430;
const SCAN_FAST_DAYS = 430;

const DECIDING_KALA_LABELS = Object.freeze({
  udaya: { en: "the tithi prevailing at local sunrise", hi: "स्थानीय सूर्योदय पर प्रचलित तिथि" },
  "udaya-fallback": { en: "the tithi prevailing at local sunrise", hi: "स्थानीय सूर्योदय पर प्रचलित तिथि" },
  pratahkala: { en: "the local morning period", hi: "स्थानीय प्रातःकाल" },
  "pratahkala-kshaya": { en: "the morning rule after a skipped tithi", hi: "क्षय तिथि के बाद प्रातःकाल का नियम" },
  purvahna: { en: "the local forenoon period", hi: "स्थानीय पूर्वाह्न काल" },
  madhyahna: { en: "the local midday period", hi: "स्थानीय मध्याह्न काल" },
  aparahna: { en: "the local afternoon period", hi: "स्थानीय अपराह्न काल" },
  pradosha: { en: "the local evening Pradosha period", hi: "स्थानीय सायंकालीन प्रदोष काल" },
  nishita: { en: "the local Nishita (midnight) period", hi: "स्थानीय निषीथ (मध्यरात्रि) काल" },
  arunodaya: { en: "the local pre-dawn period", hi: "स्थानीय अरुणोदय काल" },
  moonrise: { en: "local moonrise", hi: "स्थानीय चन्द्रोदय" },
  sunset: { en: "local sunset", hi: "स्थानीय सूर्यास्त" },
  "solar-ingress": { en: "the exact moment Surya enters the next rashi", hi: "सूर्य के अगली राशि में प्रवेश का ठीक क्षण" },
  "same-as-makar-sankranti": { en: "the same solar date as Makar Sankranti", hi: "मकर संक्रांति की वही सौर तिथि" },
  "next-sunrise": { en: "the next local sunrise in the observance sequence", hi: "पर्व-क्रम का अगला स्थानीय सूर्योदय" },
  "sequence-from-shashthi": { en: "the day counted from Shashthi in the festival sequence", hi: "पर्व-क्रम में षष्ठी से गिना गया दिन" },
  "aippasi-shukla-shashti": { en: "Aippasi Shukla Shashthi", hi: "ऐप्पसी शुक्ल षष्ठी" },
  "ashtami-navami-sandhi": { en: "the Ashtami–Navami junction", hi: "अष्टमी–नवमी संधि" },
  "aparahna-shraddha": { en: "the local Aparahna Shraddha period", hi: "स्थानीय अपराह्न श्राद्ध काल" },
  "day-after-holika": { en: "the day after Holika Dahan", hi: "होलिका दहन के अगले दिन" },
  "ghatasthapana-pratipada": { en: "the Pratipada rule for Ghatasthapana", hi: "घटस्थापना का प्रतिपदा नियम" },
  "kanya-sankranti-vishwakarma": { en: "Kanya Sankranti for Vishwakarma Puja", hi: "विश्वकर्मा पूजा के लिए कन्या संक्रांति" },
  "kartik-amavasya-purnimanta": { en: "Kartika Amavasya in the Purnimanta calendar", hi: "पूर्णिमान्त पंचांग की कार्तिक अमावस्या" },
  "kojagara-nishita-purnima": { en: "Purnima prevailing in the Nishita period", hi: "निषीथ काल में प्रचलित पूर्णिमा" },
  "last-shravana-shukla-friday": { en: "the last Friday of Shravana Shukla Paksha", hi: "श्रावण शुक्ल पक्ष का अंतिम शुक्रवार" },
  "mahalaya-amavasya": { en: "Mahalaya Amavasya", hi: "महालया अमावस्या" },
  "paush-shukla-ashtami-span": { en: "the Pausha Shukla Ashtami observance span", hi: "पौष शुक्ल अष्टमी का पर्व-क्रम" },
  "15th-day-from-bhadrapada-shukla-8": { en: "the fifteenth day from Bhadrapada Shukla Ashtami", hi: "भाद्रपद शुक्ल अष्टमी से पंद्रहवाँ दिन" },
  "durga-shashthi-saraswati-avahan": { en: "the Durga Shashthi rule for Saraswati Avahan", hi: "सरस्वती आवाहन का दुर्गा षष्ठी नियम" },
  "durga-saptami-saraswati-puja": { en: "the Durga Saptami rule for Saraswati Puja", hi: "सरस्वती पूजा का दुर्गा सप्तमी नियम" },
  "syzygy-near-node": { en: "a Sun–Moon alignment near a lunar node", hi: "चन्द्र-पात के निकट सूर्य–चन्द्र संरेखण" },
  vijayadashami: { en: "the Vijayadashami selection rule", hi: "विजयादशमी का तिथि-निर्णय नियम" },
});

function decidingKalaLabel(kala, lang) {
  const label = DECIDING_KALA_LABELS[kala];
  return label ? label[lang === "hi" ? "hi" : "en"] : null;
}

function normalizedFestivalPath(pathname) {
  const clean = String(pathname || "/").replace(/\/{2,}/g, "/");
  return clean.length > 1 ? clean.replace(/\/+$/, "") : clean;
}

function festivalGuideFromPath(pathname) {
  return FESTIVAL_GUIDE_ROUTES[normalizedFestivalPath(pathname)] || null;
}

function matchKeysForGuide(guide) {
  if (!guide) return [];
  if (guide.sourceKind === "navadurga") return [guide.parentKey];
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
  if (!hit) return { hit: null, detail: null, punyaKala: null, tz };
  const meta = guide.sourceKind === "observance" ? OBS_META[guide.metaKey] : FEST_META[guide.metaKey];
  const timing = meta && meta.timing ? meta.timing : null;
  const isChhathSequence = guide.vidhiKey === "chhath" || timing === "chhath-sequence";
  const detail = timing === "navratri"
    ? { navratri: navratriTimings(place, hit.ms) }
    : isChhathSequence
      ? { chhath: chhathTimings(place, hit.ms) }
      : vratDetail(place, "lahiri", hit.ms, timing);
  const punyaKala = /Sankranti$/.test(hit.key) ? sankrantiPunyaKala(hit.ms, place, tz) : null;
  return {
    hit,
    detail,
    punyaKala,
    tz: detail.navratri ? detail.navratri.tz : detail.chhath ? detail.chhath.tz : detail.tz,
    timing,
  };
}

function formatLocalDate(ms, tz, lang) {
  const d = new Date(ms + tz * 3600000);
  return d.toLocaleDateString(lang === "hi" ? "hi-IN" : "en-IN", {
    weekday: "long", year: "numeric", month: "long", day: "numeric", timeZone: "UTC",
  });
}

function formatLocalClock(ms, tz, refMs, lang) {
  const locale = lang === "hi" ? "hi-IN" : "en-IN";
  const d = new Date(ms + tz * 3600000);
  const ref = new Date(refMs + tz * 3600000);
  const clock = d.toLocaleTimeString(locale, {
    hour: "2-digit", minute: "2-digit", hour12: lang !== "hi", hourCycle: lang === "hi" ? "h23" : undefined, timeZone: "UTC",
  });
  const sameDay = d.getUTCFullYear() === ref.getUTCFullYear()
    && d.getUTCMonth() === ref.getUTCMonth()
    && d.getUTCDate() === ref.getUTCDate();
  if (sameDay) return clock;
  const date = d.toLocaleDateString(locale, { month: "short", day: "numeric", timeZone: "UTC" });
  return `${clock}, ${date}`;
}

function FestivalGuideScreen({ guide, lang, C, card, place, onPlace }) {
  const L = lang === "hi" ? "hi" : "en";
  const isNavadurga = guide && guide.contentKind === "navadurga";
  const data = guide && guide.vidhiKey && !isNavadurga ? VRAT_VIDHI[guide.vidhiKey] : null;
  const hasFullGuide = Boolean(data || isNavadurga);
  const meta = guide
    ? (guide.sourceKind === "observance" ? OBS_META[guide.metaKey] : FEST_META[guide.metaKey])
    : null;
  const title = guide ? guide.title[L] : "";
  const homeHref = `/?lang=${L}&screen=daily`;
  const [localTiming, setLocalTiming] = useState({ status: "idle", hit: null, detail: null, punyaKala: null, tz: null, error: null });
  const [retryTick, setRetryTick] = useState(0);

  useEffect(() => {
    if (!title || typeof document === "undefined") return undefined;
    const previousTitle = document.title;
    document.title = `${title} · Ganak`;
    return () => { document.title = previousTitle; };
  }, [title]);

  useEffect(() => {
    if (!guide || !place) {
      setLocalTiming({ status: "idle", hit: null, detail: null, punyaKala: null, tz: null, error: null });
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
            punyaKala: null,
            tz: result.tz,
            error: null,
          });
          return;
        }
        setLocalTiming({
          status: "ready",
          hit: result.hit,
          detail: result.detail,
          punyaKala: result.punyaKala,
          tz: result.tz,
          error: null,
        });
      } catch (e) {
        if (cancelled) return;
        setLocalTiming({
          status: "error",
          hit: null,
          detail: null,
          punyaKala: null,
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
        navratri: { en: "The Ghatasthapana and full-fast parana times below are calculated for your city.", hi: "नीचे घटस्थापना और पूर्ण व्रत के पारण का समय आपके शहर के लिए निकाला गया है।" },
        "lakshmi-puja": { en: "Lakshmi Puja muhurat and Pradosh Kaal below are calculated for your city.", hi: "नीचे लक्ष्मी पूजा का मुहूर्त और प्रदोष काल आपके शहर के अनुसार हैं।" },
        "chhath-sequence": { en: "The four-day Chhath sequence and arghya times below are for your city.", hi: "नीचे चार-दिवसीय छठ क्रम और अर्घ्य के समय आपके शहर के अनुसार हैं।" },
      }[meta.timing] || null)
    : null;

  const d = localTiming.detail;
  const hit = localTiming.hit;
  const tz = localTiming.tz;
  const navratri = d && d.navratri;
  const lakshmiPuja = d && d.lakshmiPuja;
  const chhathSeq = d && d.chhath;
  const punyaKala = localTiming.punyaKala;
  const decidingLabel = hit ? decidingKalaLabel(hit.decidingKala, L) : null;
  const clock = (ms) => fmtTimeD(ms, tz, ms);
  const paranaBasis = navratri && ({
    "navami-end": {
      en: "Navami ends at this time; complete the full nine-day fast afterwards.",
      hi: "इस समय नवमी समाप्त होती है; पूर्ण नौ-दिवसीय व्रत का पारण इसके बाद करें।",
    },
    sunrise: {
      en: "Navami ends before dawn, so complete the full nine-day fast after local sunrise.",
      hi: "नवमी भोर से पहले समाप्त होती है, इसलिए पूर्ण नौ-दिवसीय व्रत का पारण स्थानीय सूर्योदय के बाद करें।",
    },
    "next-sunrise": {
      en: "Navami ends after sunset, so complete the full nine-day fast after the following local sunrise.",
      hi: "नवमी सूर्यास्त के बाद समाप्त होती है, इसलिए पूर्ण नौ-दिवसीय व्रत का पारण अगले स्थानीय सूर्योदय के बाद करें।",
    },
  }[navratri.parana.basis]);
  let navadurgaDateInfo = null;
  if (isNavadurga && localTiming.status === "ready" && hit && place) {
    try { navadurgaDateInfo = navadurgaDatesFor(place, hit.ms, guide.day); }
    catch { navadurgaDateInfo = null; }
  }

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
          {hasFullGuide
            ? (L === "hi" ? "व्रत एवं पूजा मार्गदर्शिका" : "FASTING & WORSHIP GUIDE")
            : (L === "hi" ? "पर्व एवं व्रत परिचय" : "FESTIVAL & OBSERVANCE OVERVIEW")}
        </div>
        <h2 id="festival-guide-title" style={{ margin: "0 0 5px", color: C.ivory, fontFamily: T.serif, fontSize: T.fHeading, lineHeight: 1.2 }}>
          {title}
        </h2>
        {guide.vidhiKey && <FestivalHeroImage imageKey={guide.vidhiKey} lang={lang} C={C} />}
        <p style={{ margin: "0 0 14px", color: C.muted, fontSize: T.fSmall, lineHeight: 1.55 }}>
          {hasFullGuide
            ? (L === "hi"
                ? (isNavadurga ? "पहले इस देवी और स्थानीय दिवस का स्पष्ट उत्तर, फिर क्रमबद्ध गृह-पूजा और आज का सप्तशती पाठ।" : "पहले संक्षिप्त उत्तर, फिर व्रत, पूजा, पारण और उद्यापन की पूरी विधि।")
                : (isNavadurga ? "A clear Goddess and local-day answer first, followed by step-by-step household puja and today's Saptashati reading." : "A clear answer first, followed by the complete fasting, puja, paran and udyapan guidance."))
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
          {localTiming.status === "ready" && hit && tz != null && !isNavadurga && (
            <div style={{ display: "grid", gap: 6 }}>
              <div style={{ fontSize: T.fBody, color: C.ivory, lineHeight: 1.45 }}>
                <strong style={{ color: C.gold }}>{formatLocalDate(hit.ms, tz, L)}</strong>
              </div>
              {navratri && (
                <div style={{
                  display: "grid", gap: 7, fontSize: T.fSmall, color: "#1F7A4D", fontWeight: 600,
                  background: "rgba(31,122,77,.07)", border: "1px solid rgba(31,122,77,.22)",
                  borderRadius: T.rSm, padding: "9px 10px", fontVariantNumeric: "tabular-nums", lineHeight: 1.45,
                }}>
                  {navratri.ghatasthapana.primary ? (
                    <div>
                      {L === "hi" ? "घटस्थापना: " : "Ghatasthapana: "}
                      {clock(navratri.ghatasthapana.primary.start)}–{clock(navratri.ghatasthapana.primary.end)}
                    </div>
                  ) : navratri.ghatasthapana.abhijit ? (
                    <div>
                      {L === "hi" ? "घटस्थापना का अभिजित समय: " : "Abhijit Ghatasthapana time: "}
                      {clock(navratri.ghatasthapana.abhijit.start)}–{clock(navratri.ghatasthapana.abhijit.end)}
                    </div>
                  ) : (
                    <div style={{ color: C.sindoor }}>
                      {L === "hi" ? "इस तिथि पर वैध घटस्थापना अवधि नहीं मिली।" : "No valid Ghatasthapana window was found on this date."}
                    </div>
                  )}
                  {navratri.ghatasthapana.preferred.length > 0 && (
                    <div style={{ color: C.ivory, fontWeight: 500 }}>
                      {L === "hi" ? "मुख्य समय के भीतर विशेष अनुकूल अवधि: " : "Especially suitable period within that window: "}
                      {navratri.ghatasthapana.preferred.map((window) => `${clock(window.start)}–${clock(window.end)}`).join(", ")}
                    </div>
                  )}
                  {navratri.ghatasthapana.primary && navratri.ghatasthapana.abhijit && (
                    <div style={{ color: C.ivory, fontWeight: 500 }}>
                      {L === "hi" ? "वैकल्पिक अभिजित अवधि: " : "Alternative Abhijit period: "}
                      {clock(navratri.ghatasthapana.abhijit.start)}–{clock(navratri.ghatasthapana.abhijit.end)}
                    </div>
                  )}
                  <div style={{ borderTop: `1px solid ${C.line}`, paddingTop: 7 }}>
                    {L === "hi" ? "पूर्ण नौ-दिवसीय व्रत का पारण: " : "Full nine-day fast — parana: "}
                    {formatLocalDate(navratri.parana.start, tz, L)}, {clock(navratri.parana.start)} {L === "hi" ? "के बाद" : "onwards"}
                  </div>
                  {paranaBasis && <div style={{ color: C.muted, fontSize: T.fMicro, fontWeight: 400 }}>{paranaBasis[L]}</div>}
                </div>
              )}
              {chhathSeq && (
                <div style={{
                  display: "grid", gap: 7, fontSize: T.fSmall, color: "#1F7A4D", fontWeight: 600,
                  background: "rgba(31,122,77,.07)", border: "1px solid rgba(31,122,77,.22)",
                  borderRadius: T.rSm, padding: "9px 10px", fontVariantNumeric: "tabular-nums", lineHeight: 1.45,
                }}>
                  {chhathSeq.days.map((day) => (
                    <div key={day.key} style={{ color: C.ivory, fontWeight: 500 }}>
                      {day.label[L]}: {formatLocalDate(day.ms, tz, L)}
                    </div>
                  ))}
                  {chhathSeq.sandhya && (
                    <div>
                      {L === "hi" ? "संध्या अर्घ्य (सूर्यास्त): " : "Sandhya arghya (sunset): "}
                      {clock(chhathSeq.sandhya.start)}–{clock(chhathSeq.sandhya.end)}
                    </div>
                  )}
                  {chhathSeq.usha && (
                    <div>
                      {L === "hi" ? "उषा अर्घ्य (सूर्योदय): " : "Usha arghya (sunrise): "}
                      {clock(chhathSeq.usha.start)}–{clock(chhathSeq.usha.end)}
                    </div>
                  )}
                </div>
              )}
              {lakshmiPuja && (
                <div style={{
                  display: "grid", gap: 7, fontSize: T.fSmall, color: "#1F7A4D", fontWeight: 600,
                  background: "rgba(31,122,77,.07)", border: "1px solid rgba(31,122,77,.22)",
                  borderRadius: T.rSm, padding: "9px 10px", fontVariantNumeric: "tabular-nums", lineHeight: 1.45,
                }}>
                  {lakshmiPuja.primary ? (
                    <div>
                      {L === "hi" ? "लक्ष्मी पूजा का शुभ मुहूर्त: " : "Lakshmi Puja muhurat: "}
                      {clock(lakshmiPuja.primary.start)}–{clock(lakshmiPuja.primary.end)}
                    </div>
                  ) : (
                    <div style={{ color: C.sindoor }}>
                      {L === "hi" ? "इस तिथि पर लक्ष्मी पूजा का मुहूर्त नहीं मिला।" : "No Lakshmi Puja muhurat was found on this date."}
                    </div>
                  )}
                  {lakshmiPuja.pradosh && (
                    <div style={{ color: C.ivory, fontWeight: 500 }}>
                      {L === "hi" ? "प्रदोष काल: " : "Pradosh Kaal: "}
                      {clock(lakshmiPuja.pradosh.start)}–{clock(lakshmiPuja.pradosh.end)}
                    </div>
                  )}
                  {lakshmiPuja.amavasya && (
                    <div style={{ color: C.muted, fontWeight: 400, fontSize: T.fMicro }}>
                      {L === "hi" ? "अमावस्या तिथि: " : "Amavasya tithi: "}
                      {formatLocalClock(lakshmiPuja.amavasya.start, tz, hit.ms, L)}
                      {" – "}
                      {formatLocalClock(lakshmiPuja.amavasya.end, tz, hit.ms, L)}
                    </div>
                  )}
                </div>
              )}
              {punyaKala && (
                <div style={{ display: "grid", gap: 5, padding: "9px 10px", borderRadius: T.rSm, background: "rgba(31,122,77,.07)", border: "1px solid rgba(31,122,77,.22)", fontSize: T.fSmall, color: "#1F7A4D", fontVariantNumeric: "tabular-nums", lineHeight: 1.45 }}>
                  <div><strong>{L === "hi" ? "संक्रांति क्षण: " : "Sankranti moment: "}</strong>{formatLocalClock(punyaKala.ingress, tz, hit.ms, L)}</div>
                  <div><strong>{L === "hi" ? "पुण्य काल: " : "Punya Kala: "}</strong>{formatLocalClock(punyaKala.punya.start, punyaKala.tz, hit.ms, L)}–{formatLocalClock(punyaKala.punya.end, punyaKala.tz, hit.ms, L)}</div>
                  <div><strong>{L === "hi" ? "महा पुण्य काल: " : "Maha Punya Kala: "}</strong>{formatLocalClock(punyaKala.mahaPunya.start, punyaKala.tz, hit.ms, L)}–{formatLocalClock(punyaKala.mahaPunya.end, punyaKala.tz, hit.ms, L)}</div>
                  {punyaKala.carriedToDaylight && <div style={{ color: C.muted, fontWeight: 400 }}>{L === "hi" ? "सूर्यास्त के बाद की संक्रांति होने से पूजा का समय अगले स्थानीय सूर्योदय से है।" : "Because ingress is outside daylight, the worship window begins at the applicable local sunrise."}</div>}
                </div>
              )}
              {d && !navratri && !lakshmiPuja && !chhathSeq && (d.parana || d.moonrise != null || d.sunset != null || d.sunrise != null || d.nishita || d.morning || d.stars) && (
                <div style={{
                  fontSize: T.fSmall, color: "#1F7A4D", fontWeight: 600,
                  background: "rgba(31,122,77,.07)", border: "1px solid rgba(31,122,77,.22)",
                  borderRadius: T.rSm, padding: "7px 10px", fontVariantNumeric: "tabular-nums", lineHeight: 1.45,
                }}>
                  {d.parana
                    ? <>{L === "hi" ? "पारण: " : "Parana: "}{fmtTimeD(d.parana.start, d.tz, hit.ms)}{L === "hi" ? " से" : " onwards"}{d.parana.dwadashiEnd > d.parana.start && <span style={{ color: C.muted, fontWeight: 400 }}> · {L === "hi" ? "द्वादशी समाप्त " : "Dwadashi ends "}{fmtTimeD(d.parana.dwadashiEnd, d.tz, hit.ms)}</span>}</>
                    : d.moonrise != null
                      ? <>{L === "hi" ? "चंद्रोदय पर व्रत खोलें: " : "Break fast after moonrise: "}{fmtTimeD(d.moonrise, d.tz, hit.ms)}</>
                      : d.nishita
                        ? <>{L === "hi" ? "निषीथ काल (मुख्य पूजा): " : "Nishita period (main puja): "}{clock(d.nishita.start)}–{clock(d.nishita.end)}</>
                        : d.morning
                          ? <>{L === "hi" ? "प्रातः पूजा: " : "Morning puja: "}{clock(d.morning.start)}–{clock(d.morning.end)}</>
                          : d.sunrise != null
                            ? <>{L === "hi" ? "प्रातः / सूर्योदय: " : "Morning — from sunrise: "}{fmtTimeD(d.sunrise, d.tz, hit.ms)}</>
                            : d.stars
                              ? <>{L === "hi" ? "तारे दिखाई देने के बाद व्रत खोलें" : "Break the fast after the stars are visible"}</>
                              : <>{L === "hi" ? "संध्या पूजा सूर्यास्त से: " : "Evening puja from sunset: "}{fmtTimeD(d.sunset, d.tz, hit.ms)}</>}
                </div>
              )}
              {decidingLabel && !(d && (navratri || lakshmiPuja || chhathSeq || d.parana || d.moonrise != null || d.sunset != null || d.sunrise != null || d.nishita || d.morning || d.stars)) && (
                <div style={{ fontSize: T.fMicro, color: C.muted }}>
                  {L === "hi" ? "तिथि तय होने का आधार: " : "Date chosen by: "}{decidingLabel}
                </div>
              )}
              {timingText && (
                <div style={{ fontSize: T.fMicro, color: C.muted, lineHeight: 1.45 }}>{timingText[L]}</div>
              )}
            </div>
          )}
          {localTiming.status === "ready" && isNavadurga && (
            <div style={{ fontSize: T.fSmall, color: C.muted, lineHeight: 1.5 }}>
              {L === "hi"
                ? "इस देवी का स्थानीय दिवस नीचे दिखाया गया है। तिथि दोहरने या क्षय होने पर गणक उसे स्पष्ट रूप से बताएगा।"
                : "This Goddess's local day is shown below. Ganak will state clearly if the tithi repeats or has no separate sunrise date."}
            </div>
          )}
        </div>

        {isNavadurga ? (
          <NavadurgaDayGuide guide={guide} dateInfo={navadurgaDateInfo} lang={lang} C={C} />
        ) : data ? (
          <>
            <VratVidhiCard data={data} lang={lang} C={C} initiallyOpen />
            {(guide.key === "chaitraNavratri" || guide.key === "sharadNavratri") && (
              <NavadurgaSeasonLinks parentKey={guide.key} lang={lang} C={C} />
            )}
          </>
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
  decidingKalaLabel,
};
