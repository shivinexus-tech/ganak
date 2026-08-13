/* Muhurat hub UI — pure extraction (SPLIT-UI-03g). Wire deferred.
   Broad imports; unused ones are fine for now until wire trims. */

import React, { useState, useMemo, useEffect } from "react";
import { T } from "../components/ui-style-contract";
import { fmtTime, fmtTimeD, fmtDeg } from "../components/format";
import { tr, trN, obsLabel } from "../i18n";
import { L } from "../i18n";
import { CHOG_NAME, OBS_NAME, FEST_NAME } from "../data/festival-meta";
import {
  SIGNS, NAKSHATRAS, TITHIS, YOGAS, zoneOffset, sunEvents, moonEvents,
} from "../engine/panchang";
import {
  dayMuhurat, findMuhurat, muhuratForDate, muhuratScanRange, muhuratShuddhi,
  MUHURTA_RULES, vaishnavaEkadashi, NAK_GOOD, dayScore,
} from "../engine/muhurat";
import { dayHoras, nightHoras, analyzeHora, horaResultText, HORA_GLYPH, HORA_COLOR, HORA_NAME, HORA_NATURE, HORA_PLANET_KEYS, horaDetectPlanet, horaIntent, HORA_CLARIFY, HORA_ACTIVITY_MAP, horaWindowsForPlanet } from "../engine/hora";
import { adjudicate, nextCleanWindow } from "../engine/hora-verdict";
import { computeLagnaPanchaka, panchakaRem, PANCHAKA_TYPE } from "../engine/panchaka";
import { obsKind } from "../engine/festivals";
import { festivalPathForKey } from "../data/festival-pages";
import PlaceInput from "../components/PlaceInput";
import { natalAnchors, applyPersonalisation } from "../engine/personal-muhurat";
import {
  PM_NATAL_SECTION, PM_NATAL_HINT, PM_NATAL_UNCONFIRMED, PM_BIRTH_LABELS,
  PM_COUNT, PM_BADGE, PM_SET_ASIDE_REASON, PM_SPECIAL_NAMES, PM_SPECIAL_CAUTION_NOTE,
  PM_SPECIAL_CHIP, PM_ANNOTATE_NOTE, PM_RESULT_NOTE, PM_YOUR_STAR, PM_RASHIS,
} from "../data/personal-muhurat-ui";
import { vaishnavaEkadashiDay } from "../engine/muhurat";
import { VIM_LORDS } from "../engine/dasha";
import { MUH_CATS, EVENTS, MUHURAT_GUIDANCE, SAMSKARA_INPUTS, PURCHASE_ACTIONS, PANCHAKA_NAME, PANCHAKA_SHORT, PANCHAKA_GLOSS } from "../data/muhurat-ui";
import DailyWindowsCard from "../components/DailyWindowsCard";
import SeasonClockCard from "../components/SeasonClockCard";
import TimingLanes from "../components/TimingLanes";
import { trikonaLords } from "../engine/personal-hora";
import { ascendantAt } from "../engine/ephemeris";
import { ayanAt } from "../engine/panchang";
import { computeTodayPanchang } from "../engine/today-panchang";
import { searchUpcoming } from "../engine/search-upcoming";
import { planetGochar } from "../engine/gochar";
import { fmtDur, eventDetail } from "../engine/transit-copy";
import { observancesFor, scanPanchangCalendar, EKADASHI_NAMES, PRADOSH_NAMES_BY_DAY, ekadashiIdentityMonth, eventsForDay } from "../engine/festivals";
import { urlPrefGet, urlPrefPush } from "../components/url-prefs";
import MuhuratActions from "../components/MuhuratActions";
import { privacyEvent } from "../telemetry/privacy-events";
import { panchangTerm, panchangTermAt, signName, signLabel } from "../i18n/panchang-terms";
import ReadAloudButton from "../accessibility/ReadAloudButton";
import { useDepth, useComfort } from "../accessibility/ComfortProvider";
import { Badge, Card, DataRow, SectionHeader } from "../components/ui-primitives";
import { calendarMonthLabel } from "../engine/calendar-conventions";

/**
 * What Muhurat reads aloud: the verdict first, then the recommended time, then the windows
 * to avoid. Warnings are never dropped at any guidance depth, and the spoken string is
 * built here and passed straight to the speech control — it is never sent to telemetry.
 */
function muhuratSpeech(lang, { headline, good = [], avoid = [], note = "" }) {
  const hi = lang === "hi";
  const lines = [headline];
  if (good.length) lines.push(`${hi ? "शुभ समय" : "Good times"}: ${good.join(", ")}।`);
  else lines.push(hi ? "इस समय के लिए कोई शुभ खिड़की सूचीबद्ध नहीं है।" : "No auspicious window is listed for this period.");
  if (avoid.length) lines.push(`${hi ? "सावधानी, इन समयों से बचें" : "Take care, avoid these times"}: ${avoid.join(", ")}।`);
  if (note) lines.push(note);
  return lines.filter(Boolean);
}


function MuhuratHub({ todayP, place, lang, ayanamsa = "lahiri", calendarMode = "canonical", isToday = true, onCal = () => {}, onChangeCity = () => {}, C, card }) {
  const { showPlainHelp, showExpert } = useDepth();
  const { preferences, updatePreferences } = useComfort();
  const tz = todayP.tz;
  const nowMs = isToday ? Date.now() : null;
  const lp = useMemo(() => { try { return computeLagnaPanchaka(place, ayanamsa, todayP.anchor); } catch (e) { return { lagnaSchedule: [], panchakaWindows: [], tz }; } }, [place, ayanamsa, todayP.anchor, tz]);
  const curLagnaW = isToday && nowMs != null ? (lp.lagnaSchedule || []).find((w) => nowMs >= w.start && nowMs < w.end) : null;
  const curPanchW = isToday && nowMs != null ? (lp.panchakaWindows || []).find((w) => nowMs >= w.start && nowMs < w.end) : null;
  const [evKey, setEvKey] = useState("purchase");
  const [tab, setTab] = useState("fasting");
  const [fq, setFq] = useState("");
  // Preserve language + selected city on the canonical festival page and Back trip
  // (URL query only — no localStorage/sessionStorage).
  const festHref = (path) => {
    const p = new URLSearchParams();
    p.set("lang", lang);
    if (place && place.label) {
      p.set("city", place.label);
      p.set("lat", String(place.lat));
      p.set("lon", String(place.lon));
      if (place.zone) p.set("zone", place.zone);
    }
    return `${path}?${p.toString()}`;
  };
  const [horaQuestion, setHoraQuestion] = useState("");
  const [horaResult, setHoraResult] = useState(null);
  const [horaAsc, setHoraAsc] = useState(null);
  const [horaSel, setHoraSel] = useState(null);
  // Day/night toggle for the hora dial (Task 9). null = auto (follows the clock
  // when isToday, otherwise defaults to day).
  const [horaPeriod, setHoraPeriod] = useState(null);
  // Practitioner view: reveals hora windows the belts block (greyed, belt named)
  // instead of silently hiding them. Default OFF — the default behaviour is a
  // hard block: a favourable hora that falls inside Rahu Kaal/Gulika/Yamaganda
  // is never offered as a clean recommendation.
  //
  // A first-class field on ComfortProvider's GanakPreferences shape
  // (src/accessibility/ComfortProvider.tsx), so it is read/written through
  // the same updatePreferences() every other screen uses for its preferences
  // and survives any write from any owner of that bucket — no more foreign
  // key riding along in the raw storage record.
  const showBlockedHoras = preferences.horaShowBlocked;
  const setShowBlockedHoras = (value) => updatePreferences({ horaShowBlocked: value });
  const [showPanch, setShowPanch] = useState(false);
  const [dragMs, setDragMs] = useState(null);  // dragged time on arc
  const isoAtOffset = (days) => new Date(Date.now() + tz * 3600000 + days * 86400000).toISOString().slice(0, 10);
  const validMuhuratKey=(value)=>MUH_CATS.some(c=>c.key===value) ? value : null;
  const [mfCat, setMfCat] = useState(() => validMuhuratKey(urlPrefGet("muhurat")));
  const validIso=(value)=>/^\d{4}-\d{2}-\d{2}$/.test(value || "") ? value : null;
  const [mfFrom, setMfFrom] = useState(() => validIso(urlPrefGet("mfrom")) || isoAtOffset(0));
  const [mfTo, setMfTo] = useState(() => validIso(urlPrefGet("mto")) || isoAtOffset(90));
  const [mfPreset, setMfPreset] = useState("90");
  const [mfErr, setMfErr] = useState(null);
  const [mfBusy, setMfBusy] = useState(false);
  const [samskaraProfiles, setSamskaraProfiles] = useState({});
  const initialAction=()=>{const cat=validMuhuratKey(urlPrefGet("muhurat")),spec=PURCHASE_ACTIONS[cat],value=urlPrefGet("maction");return spec?.options.some((x)=>x.value===value)?value:(spec?.options[0]?.value||"");};
  const [purchaseAction,setPurchaseAction]=useState(initialAction);
  const [ans, setAns] = useState(null);
  /* Opt-in birth-star personalisation (P0-MUHURAT-FULL-PARITY). Overlay only: with no birth
     details the finder behaves exactly as before, which is what "never silently mix natal
     filtering into the general finder" requires. Birth details are never stored. */
  const [pmOpen, setPmOpen] = useState(false);
  const [pmDate, setPmDate] = useState("");
  const [pmTime, setPmTime] = useState("12:00");
  const [pmPlace, setPmPlace] = useState(null);
  const [pmPlaceOk, setPmPlaceOk] = useState(false);
  const pmReady = Boolean(pmDate && pmPlace && pmPlaceOk);
  /* Signature of the birth details a result was computed from. Stored on `ans` so the
     "your selection changed" notice can also fire when the user adds, edits or removes
     birth details after a search — otherwise the old un-personalised list stays on screen
     looking like a finished answer. Empty string means "no personalisation". */
  const pmSig = pmReady ? `${pmDate}|${pmTime}|${pmPlace.label}` : "";
  const chooseMfCat=(key)=>{ const next=validMuhuratKey(key); setMfCat(next); setMfErr(null); if(next) { urlPrefPush("muhurat",next); const first=PURCHASE_ACTIONS[next]?.options[0]?.value || ""; setPurchaseAction(first); if(first) urlPrefPush("maction",first); } if(ans&&next) findDays(null,null,next); };
  useEffect(()=>{ const restore=()=>setMfCat(validMuhuratKey(urlPrefGet("muhurat"))); window.addEventListener("popstate",restore); return()=>window.removeEventListener("popstate",restore); },[]);
  const finderTopPanchaka = useMemo(() => { try { if (!ans || !ans.days) return null; const top = ans.days.filter((d) => d.valid)[0]; return top ? computeLagnaPanchaka(place, "lahiri", top.rise) : null; } catch (e) { return null; } }, [ans, place]);
  const mfYmd = (iso) => { const [y, m, d] = iso.split("-").map(Number); return { y, m, d }; };
  // Previous results stay on screen until the new ones replace them — the app
  // never blanks the user's answer without a finished user action.
  const findDays = (fromIso, toIso, catKey) => {
    const cat = catKey || mfCat;
    if (!cat || mfBusy) return;
    setMfErr(null);
    const from = mfYmd(fromIso || mfFrom), to = mfYmd(toIso || mfTo);
    if (Date.UTC(from.y, from.m - 1, from.d) > Date.UTC(to.y, to.m - 1, to.d)) {
      setMfErr(lang === "hi" ? "प्रारम्भ तिथि, अन्तिम तिथि के बाद है — कृपया सुधारें।" : "The start date is after the end date — please fix the range.");
      return;
    }
    setMfBusy(true);
    setTimeout(() => {
      try {
        const dd = muhuratScanRange(place, "lahiri", from, to, cat);
        const chosenAction=PURCHASE_ACTIONS[cat] ? purchaseAction : "";
        // Natal anchors only when the user has opted in with complete birth details.
        let anchors = null;
        if (pmReady) {
          const [by, bm, bd] = pmDate.split("-").map(Number);
          const [bhh, bmi] = (pmTime || "12:00").split(":").map(Number);
          if (by) anchors = natalAnchors(pmPlace, "lahiri", { y: by, m: bm, day: bd, hh: bhh || 0, mi: bmi || 0 });
        }
        setAns({ category: cat, days: dd, from: fromIso || mfFrom, to: toIso || mfTo, profile: SAMSKARA_INPUTS[cat] ? { ...(samskaraProfiles[cat] || {}) } : null, action: chosenAction, anchors, pmSig });
        privacyEvent("muhurat_search",{action:cat,language:lang,outcome:dd.some((d)=>d.valid)?"found":"none"});
      } catch (e) {
        if (typeof console !== "undefined") console.error("muhurat scan failed:", e);
        setMfErr(lang === "hi" ? "गणना नहीं हो सकी — कृपया छोटी अवधि आज़माएँ या पुनः प्रयास करें।" : "Couldn't complete the search — try a shorter date range or try again.");
      } finally {
        setMfBusy(false);
      }
    }, 30);
  };
  // Startup scan: was a sync 400-day useMemo (~16.6s freeze). Now async + 90 days —
  // the list only shows top 10; CalendarPage owns the full year behind a click.
  const SCAN_DAYS = 90, SCAN_CAP = 46;
  const [cal, setCal] = useState({ fasts: [], festivals: [] });
  const [calBusy, setCalBusy] = useState(true);
  useEffect(() => {
    let alive = true;
    setCalBusy(true);
    const id = setTimeout(() => {
      try {
        const r = scanPanchangCalendar(todayP.anchor, tz, SCAN_DAYS, SCAN_CAP, place, calendarMode);
        if (alive) setCal(r);
      } catch (e) {
        if (alive) setCal({ fasts: [], festivals: [] });
      } finally {
        if (alive) setCalBusy(false);
      }
    }, 0);
    return () => { alive = false; clearTimeout(id); };
  }, [todayP.anchor, tz, place, calendarMode]);
  const [trad, setTrad] = useState("smarta");
  useEffect(() => { let alive = true; (async () => { try { const st = (typeof window !== "undefined" && window.storage) ? window.storage : null; if (st) { const r = await st.get("janma_trad"); if (alive && r && r.value) setTrad(r.value); } } catch (e) {} })(); return () => { alive = false; }; }, []);
  const chooseTrad = (v) => { setTrad(v); try { const st = (typeof window !== "undefined" && window.storage) ? window.storage : null; if (st) st.set("janma_trad", v); } catch (e) {} };
  const effFasts = useMemo(() => {
    if (trad !== "vaishnava") return cal.fasts;
    try {
      return cal.fasts.map((f) => {
        if (obsKind(f.key) !== "ekadashi") return f;
        const v = vaishnavaEkadashiDay(place, ayanamsa, f.ms);
        return { ...f, ms: v.ms, shifted: v.shifted, reason: v.reason };
      }).sort((a, b) => a.ms - b.ms);
    } catch (e) { return cal.fasts; }
  }, [cal, trad, place, ayanamsa]);
  const fmtT = (ms) => fmtTime(ms, tz);
  const fmtDay = (ms) => new Date(ms + tz * 3600000).toLocaleDateString(lang === "hi" ? "hi-IN" : "en-IN", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
  const natColor = (nat) => nat === "good" ? "var(--good)" : nat === "bad" ? C.sindoor : C.gold;
  // Auspicious/avoid must never be carried by hue alone — roughly 8% of men cannot separate
  // these two. Every nature-coded surface pairs the colour with this glyph.
  const natGlyph = (nat) => nat === "good" ? "✓" : nat === "bad" ? "⚠" : "•";
  const shubhaGlyph = (shubha) => shubha ? "✓" : "⚠";
  const inWin = (w) => isToday && w && nowMs >= w.start && nowMs < w.end;

  // current choghadiya + auspicious/avoid state right now
  const allChogha = [...(todayP.choghaDay || []), ...(todayP.choghaNight || [])];
  const curChogha = allChogha.find((c) => inWin(c));
  const inAvoid = inWin(todayP.rahu) || inWin(todayP.yama) || inWin(todayP.gulika);
  const inAbhijit = inWin(todayP.abhijit);
  const nowState = inAbhijit ? "good" : inAvoid ? "bad" : curChogha ? curChogha.nat : "neutral";

  // Hora adjudication context: every hora window offered below is reconciled against
  // the forbidden belts before it is shown as a recommendation (Task 8). nextRise is
  // the real following sunrise from computeTodayPanchang — never rise + 86400000.
  const horaCtx = { rahu: todayP.rahu || null, gulika: todayP.gulika || null, yama: todayP.yama || null, abhijit: todayP.abhijit || null, chogha: allChogha };
  const nextRise = todayP.nextRise;

  // Task 9: day/night dial state, lifted to the top of the component (not
  // computed inside the dial's render IIFE below) so the verdict-telemetry
  // effect can be a plain Hook that runs unconditionally on every render. The
  // dial IIFE has an early return when rise/set are unavailable; a useEffect
  // placed after that early return would be skipped on some renders and not
  // others, which breaks React's rule that hooks run in the same order every
  // time. These are used both by the dial/lane markup below and by the effect.
  const horaHasRiseSet = todayP.rise != null && todayP.set != null;
  const horaAutoPeriod = isToday && nowMs != null && horaHasRiseSet && (nowMs < todayP.rise || nowMs > todayP.set) ? "night" : "day";
  const activeHoraPeriod = horaPeriod || horaAutoPeriod;
  const horaDomainStart = activeHoraPeriod === "day" ? todayP.rise : todayP.set;
  const horaDomainEnd = activeHoraPeriod === "day" ? todayP.set : nextRise;
  const activeHoras = horaHasRiseSet
    ? (activeHoraPeriod === "day" ? dayHoras(todayP.dow, todayP.rise, todayP.set) : nightHoras(todayP.dow, todayP.set, nextRise))
    : [];
  const horaNowInDomain = isToday && nowMs != null && horaHasRiseSet && nowMs >= horaDomainStart && nowMs <= horaDomainEnd;
  const horaDialDur = horaHasRiseSet ? (horaDomainEnd - horaDomainStart) / 12 : 0;
  const curHoraDialIdx = horaNowInDomain ? Math.min(11, Math.max(0, Math.floor((nowMs - horaDomainStart) / horaDialDur))) : null;
  const showHoraDialIdx = horaSel != null ? horaSel : curHoraDialIdx;

  // Fix (Task 9): Clear horaSel whenever the active hora period changes, whether
  // from manual toggle or automatic flip (clock crossing sunrise/sunset). The
  // resolved activeHoraPeriod (not raw horaPeriod) is the dependency so both
  // paths trigger the reset. Unconditional hook at top level.
  useEffect(() => {
    setHoraSel(null);
  }, [activeHoraPeriod]);

  // Step 5: verdict telemetry, once per selection/period/language change. No
  // question text, place or birth data — only the fixed dictionary's
  // outcome/language fields (see src/telemetry/privacy-events.ts).
  useEffect(() => {
    if (showHoraDialIdx == null || !activeHoras[showHoraDialIdx]) return;
    const v = adjudicate({ start: activeHoras[showHoraDialIdx].start, end: activeHoras[showHoraDialIdx].end }, horaCtx);
    privacyEvent("hora_verdict_shown", { outcome: v.status, language: lang });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showHoraDialIdx, activeHoraPeriod, lang]);

  // Answer line (owner request, 2026-08-11): one plain-language sentence for
  // the hora running right now, rendered FIRST in the hora section, before
  // the dial — the section used to lead with the arc/lane-strip data and
  // never stated an answer. Built only from data the dial/lanes already
  // consume: activeHoras (dayHoras/nightHoras), adjudicate() for the
  // verdict, HORA_NATURE for what the hora suits, CHOG_NAME for the
  // Choghadiya grade at night. No new astrology, no new engine calls.
  const horaAnswerLine = (() => {
    if (!horaHasRiseSet) {
      // Polar-type dates: no sunrise/sunset, so no hora windows exist to
      // report on at all. Degrade to a truthful sentence, never a blank.
      return {
        tone: null,
        en: "No sunrise or sunset time is available for this date and place, so hora hours can't be shown.",
        hi: "इस तिथि और स्थान के लिए सूर्योदय या सूर्यास्त का समय उपलब्ध नहीं है, इसलिए होरा समय नहीं दिखाया जा सकता।",
      };
    }
    const periodEn = activeHoraPeriod === "day" ? "day" : "night";
    const periodHi = activeHoraPeriod === "day" ? "दिन" : "रात";
    if (!(isToday && horaNowInDomain) || curHoraDialIdx == null || !activeHoras[curHoraDialIdx]) {
      // No "now" to report — either a date other than today, or (today) the
      // clock is outside the period currently shown (e.g. the night dial is
      // open while it is still daytime). State what the section shows
      // instead of pretending a current hora exists.
      const dateNote = isToday ? "" : (lang === "hi" ? " — आज नहीं" : " — not today");
      return {
        tone: null,
        en: `Showing ${periodEn} horas, ${fmtT(horaDomainStart)}–${fmtT(horaDomainEnd)}${dateNote}. Tap an hour below for its status.`,
        hi: `${periodHi} की होरा दिखाई जा रही है, ${fmtT(horaDomainStart)}–${fmtT(horaDomainEnd)}${dateNote}। नीचे किसी घंटे पर टैप कर उसका विवरण देखें।`,
      };
    }

    const cur = activeHoras[curHoraDialIdx];
    const planetEn = HORA_NAME[cur.ruler].en, planetHi = HORA_NAME[cur.ruler].hi;
    const natureEn = HORA_NATURE[cur.ruler].en, natureHi = HORA_NATURE[cur.ruler].hi;
    const v = adjudicate({ start: cur.start, end: cur.end }, horaCtx);

    if (activeHoraPeriod === "night") {
      // Finding 3 (task 8): Rahu Kaal, Gulika and Yamaganda are built from
      // daylight only and never overlap a night window, so v.status here is
      // always "clean" — reporting that as "clear of the forbidden periods"
      // would claim a check ran that could never find anything wrong. The
      // Choghadiya grade (v.grade/v.gradeKey, already computed from
      // choghaNight via horaCtx.chogha) is real information after dark.
      const grade = v.grade;
      const gradeWordEn = grade === "good" ? "favourable" : grade === "bad" ? "best avoided" : "neutral";
      const gradeWordHi = grade === "good" ? "अनुकूल" : grade === "bad" ? "टालने योग्य" : "सामान्य";
      const badgeEn = grade === "good" ? "Favourable" : grade === "bad" ? "Avoid" : "Neutral";
      const badgeHi = grade === "good" ? "अनुकूल" : grade === "bad" ? "टालें" : "सामान्य";
      const gradeNameEn = v.gradeKey ? CHOG_NAME[v.gradeKey]?.en : null;
      const gradeNameHi = v.gradeKey ? CHOG_NAME[v.gradeKey]?.hi : null;
      return {
        tone: grade === "good" ? "good" : grade === "bad" ? "bad" : "default",
        badgeEn, badgeHi,
        en: `It's ${planetEn}'s hora until ${fmtT(cur.end)} — favours ${natureEn}, currently ${gradeWordEn}${gradeNameEn ? ` (${gradeNameEn})` : ""} by Choghadiya.`,
        hi: `${fmtT(cur.end)} तक ${planetHi} होरा है — ${natureHi} के लिए उपयुक्त, अभी चौघड़िया अनुसार ${gradeWordHi}${gradeNameHi ? ` (${gradeNameHi})` : ""}।`,
      };
    }

    // Day
    if (v.status === "clean") {
      return {
        tone: "good", badgeEn: "Clear", badgeHi: "स्पष्ट",
        en: `It's ${planetEn}'s hora until ${fmtT(cur.end)} — favours ${natureEn}, and is clear of the forbidden periods.`,
        hi: `${fmtT(cur.end)} तक ${planetHi} होरा है — ${natureHi} के लिए उपयुक्त, और निषिद्ध अवधियों से मुक्त।`,
      };
    }
    const beltNamesEn = v.blockedBy.map((k) => tr("en", k + "L")).join(", ");
    const beltNamesHi = v.blockedBy.map((k) => tr("hi", k + "L")).join(", ");
    if (v.status === "partial") {
      const u = v.usable[0];
      return {
        tone: "warn", badgeEn: "Partly blocked", badgeHi: "आंशिक रूप से बाधित",
        en: `It's ${planetEn}'s hora until ${fmtT(cur.end)} — favours ${natureEn}, but ${beltNamesEn} cuts in; use ${fmtT(u.start)}–${fmtT(u.end)}.`,
        hi: `${fmtT(cur.end)} तक ${planetHi} होरा है — ${natureHi} के लिए उपयुक्त, पर ${beltNamesHi} इसमें कटौती करता है; ${fmtT(u.start)}–${fmtT(u.end)} का प्रयोग करें।`,
      };
    }
    // status === "blocked": fully cut, so point at the next window that
    // actually has usable time — scanned across BOTH day and night horas
    // (mirrors nextCleanBlock's excludePlanets branch below) so "no window
    // left today" is never claimed while the other period still has one.
    const allWinsToday = [...dayHoras(todayP.dow, todayP.rise, todayP.set), ...nightHoras(todayP.dow, todayP.set, nextRise)]
      .map((w) => ({ start: w.start, end: w.end }));
    const alt = nextCleanWindow(allWinsToday, horaCtx, nowMs);
    const altEn = alt ? `Next clear window: ${fmtT(alt.verdict.usable[0].start)}–${fmtT(alt.verdict.usable[0].end)}.` : "No clear window left today — check tomorrow.";
    const altHi = alt ? `अगला स्पष्ट समय: ${fmtT(alt.verdict.usable[0].start)}–${fmtT(alt.verdict.usable[0].end)}।` : "आज और कोई स्पष्ट समय नहीं — कल देखें।";
    return {
      tone: "bad", badgeEn: "Blocked", badgeHi: "बाधित",
      en: `It's ${planetEn}'s hora until ${fmtT(cur.end)}, but it's fully inside ${beltNamesEn} — not usable now. ${altEn}`,
      hi: `${fmtT(cur.end)} तक ${planetHi} होरा है, पर यह पूरी तरह ${beltNamesHi} में है — अभी उपयोग योग्य नहीं। ${altHi}`,
    };
  })();

  const askHora = (q, action) => {
    privacyEvent("hora_ask", { action, language: lang });
    const r = analyzeHora(q);
    privacyEvent("hora_ask_outcome", { outcome: r.status, language: lang });
    setHoraResult(r);
  };

  // One window + its verdict, shared by the "timing" and "answer" hora branches.
  // A blocked window is hidden by default (hard block); the practitioner toggle
  // reveals it greyed out with the blocking belt named — never colour alone.
  const horaVerdictRow = (w, i, p) => {
    const v = adjudicate({ start: w.start, end: w.end }, horaCtx);
    if (v.status === "blocked" && !showBlockedHoras) return null;
    const isNow = isToday && Date.now() >= w.start && Date.now() < w.end;
    // Finding 3: Rahu Kaal, Gulika and Yamaganda are computed by dividing DAYLIGHT
    // into eighths — there is no night belt for a night hora to collide with, so
    // every night window adjudicates "clean" and this badge would only ever say
    // "Clear": true, but informationally empty, and it implies a check ran that
    // found nothing wrong. For night windows only, show the Choghadiya grade
    // instead — real information after dark, already computed by the same
    // adjudicate() call above (R4, graded from choghaNight via horaCtx.chogha).
    // Day windows below are completely unchanged.
    const isNight = w.period === "night";
    const gradeTone = v.grade === "good" ? "good" : v.grade === "bad" ? "bad" : "default";
    return (
      <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", fontVariantNumeric: "tabular-nums", opacity: v.status === "blocked" ? 0.55 : 1 }}>
        <span style={{ fontSize: T.fSmall, color: C.ivory, fontWeight: isNow ? 700 : 400 }}>{fmtT(w.start)} – {fmtT(w.end)}</span>
        <span style={{ fontSize: T.fMicro, color: C.muted }}>{w.period === "day" ? (lang === "hi" ? "दिन" : "day") : (lang === "hi" ? "रात" : "night")}</span>
        {isNight ? (
          <Badge tone={gradeTone} density="compact">
            {v.gradeKey ? trN(lang, CHOG_NAME, v.gradeKey) : (lang === "hi" ? "सामान्य" : "Neutral")}
          </Badge>
        ) : (
          <Badge tone={v.status === "clean" ? "good" : v.status === "partial" ? "warn" : "bad"} density="compact">
            {v.status === "clean" ? (lang === "hi" ? "स्पष्ट" : "Clear") : v.status === "partial" ? (lang === "hi" ? "आंशिक रूप से बाधित" : "Partly blocked") : (lang === "hi" ? "बाधित" : "Blocked")}
          </Badge>
        )}
        {v.status === "partial" && v.usable[0] && (
          <span style={{ fontSize: T.fMicro, color: C.gold }}>{lang === "hi" ? "प्रयोग करें " : "use "}{fmtT(v.usable[0].start)}–{fmtT(v.usable[0].end)}</span>
        )}
        {v.blockedBy.length > 0 && (
          <span style={{ fontSize: T.fMicro, color: C.sindoor }}>{v.blockedBy.map((k) => tr(lang, k + "L")).join(", ")}</span>
        )}
        {isNow && <span style={{ fontSize: T.fMicro, color: HORA_COLOR[p], fontWeight: 700 }}>● {lang === "hi" ? "अभी" : "now"}</span>}
      </div>
    );
  };

  // Shown once per rendered list of hora windows that includes a night entry
  // (Finding 3), not repeated on every row — explains once why the belt check
  // differs after dark instead of leaving the reader to infer it from a badge
  // that quietly changed meaning.
  const nightApplicabilityNote = (wins) => !wins.some((w) => w.period === "night") ? null : (
    <div style={{ fontSize: T.fMicro, color: C.muted, fontStyle: "italic", marginTop: "0.3125rem" }}>
      {lang === "hi"
        ? "राहु काल, गुलिक काल व यमगण्ड केवल दिन में होते हैं — रात में लागू नहीं होते; रात्रि अवधियों के लिए इसके बजाय चौघड़िया श्रेणी दिखाई गई है।"
        : "Rahu Kalam, Gulika and Yamaganda are daytime periods and don't apply at night — night windows show the Choghadiya grade instead."}
    </div>
  );

  // Never dead-end: when every window for a planet is blocked (or the answer's
  // intent was "avoid"), point at the next window that actually has usable time.
  //
  // excludePlanets is set only for the "avoid" answer: hr.planets there are the
  // planets FAVOURABLE for the activity (see horaResultText in hora.ts) — the
  // very hours the user was just told to stay away from. Offering "next clean
  // window" scoped to one of those planets would hand back exactly what the
  // user asked to avoid, so the alternative is built instead from every hora
  // (day + night) NOT ruled by any flagged planet, then adjudicated as usual.
  const nextCleanBlock = (planet, excludePlanets) => {
    if (todayP.rise == null || todayP.set == null) return null;
    const exclude = excludePlanets && excludePlanets.length ? excludePlanets : null;
    const planetWins = exclude
      ? [...dayHoras(todayP.dow, todayP.rise, todayP.set), ...nightHoras(todayP.dow, todayP.set, nextRise)]
          .filter((w) => !exclude.includes(w.ruler))
          .map((w) => ({ start: w.start, end: w.end }))
      : horaWindowsForPlanet(planet, todayP.dow, todayP.rise, todayP.set, nextRise).map((w) => ({ start: w.start, end: w.end }));
    const alt = nextCleanWindow(planetWins, horaCtx, isToday ? Date.now() : todayP.rise);
    const freeLabel = exclude ? exclude.map((p) => HORA_NAME[p][lang === "hi" ? "hi" : "en"]).join(lang === "hi" ? ", " : ", ") : null;
    return (
      <div style={{ fontSize: T.fMicro, color: C.gold, marginTop: "0.5rem" }}>
        {alt
          ? (lang === "hi"
              ? (exclude ? `${freeLabel} से मुक्त अगला समय: ${fmtT(alt.verdict.usable[0].start)}–${fmtT(alt.verdict.usable[0].end)}` : `अगला स्पष्ट समय: ${fmtT(alt.verdict.usable[0].start)}–${fmtT(alt.verdict.usable[0].end)}`)
              : (exclude ? `Next window free of ${freeLabel}: ${fmtT(alt.verdict.usable[0].start)}–${fmtT(alt.verdict.usable[0].end)}` : `Next clear window: ${fmtT(alt.verdict.usable[0].start)}–${fmtT(alt.verdict.usable[0].end)}`))
          : (lang === "hi" ? "आज और कोई स्पष्ट समय नहीं — कल देखें।" : "No clear window left today — check tomorrow.")}
      </div>
    );
  };

  const ev = EVENTS.find((e) => e.key === evKey);
  const goodSlots = allChogha.filter((c) => ev.good.includes(c.key) && c.end > nowMs).slice(0, 6);
  const avoidSlots = [["rahu", todayP.rahu], ["gulika", todayP.gulika], ["yama", todayP.yama]].filter(([, w]) => w && w.end > nowMs);

  // Status pill and section heading now come from the shared primitives instead of a
  // per-screen fork. The nature glyph rides along so the state is never colour-only.
  const pill = (txt, nat) => <Badge tone={nat === "good" ? "good" : nat === "bad" ? "bad" : "accent"} density="compact">{txt}</Badge>;
  const SecHead = ({ deva, en, right }) => (
    <div style={{ margin: `${T.s6} 0 ${T.s3}`, borderBottom: `0.0625rem solid ${C.line}`, paddingBottom: T.s2 }}>
      {/* lang was pinned to "hi" here, so "व्रत एवं पर्व", "मुहूर्त खोज" and "होरा"
          stayed Devanagari even in English mode. Follow the reader's choice. */}
      <SectionHeader hi={deva} en={en} lang={lang === "hi" ? "hi" : "en"} density="compact" actions={right} />
    </div>
  );

  return (
    <div>
      {/* ===== TODAY SUMMARY (primary, plain-language) ===== */}
      {(() => {
        const p = todayP, DAY = 86400000, dayStart = p.anchor;
        const L2 = lang === "hi" ? "hi" : "en";
        const obs = observancesFor(p.krishna, p.tithiDay, ekadashiIdentityMonth(p.months, p.krishna), p.dow, p.anchor, calendarMode);
        const OBS_GLOSS = { ekadashi: { en: "Fasting day for Vishnu", hi: "विष्णु का व्रत" }, purnima: { en: "Full moon", hi: "पूर्ण चंद्र" }, amavasya: { en: "New moon", hi: "नवचंद्र" }, pradosh: { en: "Evening fast for Shiva", hi: "शिव संध्या व्रत" }, sankashti: { en: "Fast for Ganesha", hi: "गणेश व्रत" }, masikShivaratri: { en: "Monthly Shivaratri", hi: "मासिक शिवरात्रि" }, kalashtami: { en: "Kala Bhairava day", hi: "काल भैरव दिवस" } };
        const dayEvents = eventsForDay(obs, cal.festivals, dayStart, tz);
        const nkIdx = NAKSHATRAS.indexOf(p.naks[0].name), nkLord = nkIdx >= 0 ? VIM_LORDS[nkIdx % 9] : null;
        const isSelectedDay = (ms) => eventsForDay([], [{ key: "candidate", ms }], dayStart, tz).length > 0;
        const nextFast = (effFasts || []).find((f) => f.ms >= dayStart && !isSelectedDay(f.ms));
        const nextFest = (cal.festivals || []).find((f) => f.ms >= dayStart && !isSelectedDay(f.ms));
        const away = (ms) => { const d = Math.round((ms - dayStart) / DAY); return d <= 0 ? (lang === "hi" ? "आज" : "today") : d === 1 ? (lang === "hi" ? "कल" : "tomorrow") : (lang === "hi" ? d + " दिन में" : "in " + d + " days"); };
        // "Coming up" summary rows follow the same interaction contract as the
        // Fasts & Festivals list: the whole row opens the canonical festival page
        // (lang+city preserved). A key with no page falls back to a plain,
        // non-interactive row rather than a broken link.
        const comingRow = (kind, item, label, dotColor) => {
          const p = festivalPathForKey(kind, item.key);
          const body = (<>
            <span style={{ width: "0.4375rem", height: "0.4375rem", borderRadius: "50%", background: dotColor, flexShrink: 0 }} />
            <span style={{ flex: 1, minWidth: 0, fontSize: T.fSmall, color: C.ivory, overflowWrap: "break-word" }}>{label}</span>
            <span style={{ fontSize: T.fMicro, color: C.gold, fontWeight: 600, flexShrink: 0 }}>{away(item.ms)}</span>
          </>);
          if (!p) return <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", minHeight: T.ctrlH, padding: "0.125rem 0" }}>{body}</div>;
          return (
            <a href={festHref(p)} className="ff-row" aria-label={(lang === "hi" ? "पूरी मार्गदर्शिका खोलें: " : "Open full guide: ") + label} style={{ display: "flex", alignItems: "center", gap: "0.5rem", minHeight: T.ctrlH, padding: "0.1875rem 0.1875rem", borderRadius: "0.5rem", textDecoration: "none", color: "inherit" }}>
              {body}
              <span aria-hidden="true" style={{ color: C.muted, fontSize: T.fSmall, flexShrink: 0 }}>›</span>
            </a>
          );
        };
        const goodW = [["abhijit", p.abhijit]].filter((x) => x[1]);
        const avoidW = [["rahu", p.rahu], ["gulika", p.gulika], ["yama", p.yama]].filter((x) => x[1]);
        const winName = { abhijit: { en: "Abhijit Muhurat", hi: "अभिजित मुहूर्त" }, rahu: { en: "Rahu Kalam", hi: "राहु काल" }, gulika: { en: "Gulika Kalam", hi: "गुलिक काल" }, yama: { en: "Yamaganda", hi: "यमगण्ड" } };
        const dObj = new Date(dayStart + tz * 3600000);
        return (
          <div className="rise" style={{ ...card, padding: 0, overflow: "hidden", marginBottom: T.s4 }}>
            <div style={{ background: "linear-gradient(135deg, var(--surface-raised), var(--surface-sunken))", padding: `${T.s4} ${T.s5} ${T.s3}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.625rem", flexWrap: "wrap" }}>
                <div>
                  <div style={{ ...T.label, color: C.muted }}>{isToday ? (lang === "hi" ? "आज" : "Today") : (lang === "hi" ? "चुनी हुई तारीख़" : "Selected date")}</div>
                  <div style={{ fontFamily: T.serif, fontSize: T.fDisplay, color: C.ivory, lineHeight: 1.1 }}>{dObj.toLocaleDateString(L2 === "hi" ? "hi-IN" : "en-IN", { weekday: "long", timeZone: "UTC" })}</div>
                  <div style={{ fontSize: T.fSmall, color: C.muted, marginTop: "0.125rem" }}>{dObj.toLocaleDateString(L2 === "hi" ? "hi-IN" : "en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })}{p.months ? (()=>{const month=calendarMonthLabel(calendarMode,p,p.rise,L2,place);return month?" · "+month:"";})() : ""}</div>
                </div>
                {isToday && <span style={{ fontSize: T.fSmall, padding: "0.3125rem 0.75rem", borderRadius: T.rPill, background: `color-mix(in srgb, ${natColor(nowState)}, var(--surface-active) 88%)`, color: natColor(nowState), fontFamily: T.serif, fontWeight: 600, whiteSpace: "nowrap" }}>{nowState === "good" ? tr(lang, "auspiciousNow") : nowState === "bad" ? tr(lang, "cautionNow") : tr(lang, "neutralNow")}</span>}
              </div>
            </div>
            <div style={{ padding: `${T.s3} ${T.s5}`, borderTop: "0.0625rem solid " + C.line }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "0.625rem" }}>
                <span style={{ fontFamily: T.serif, fontSize: T.fHeading, color: C.gold }}>{panchangTerm(L2, "tithi", p.tithis[0].name)}</span>
                <span style={{ fontSize: T.fMicro, color: C.muted, fontVariantNumeric: "tabular-nums" }}>{p.tithis[0].end ? (lang === "hi" ? "तक " : "till ") + fmtT(p.tithis[0].end) : ""}</span>
              </div>
              <div style={{ fontSize: T.fSmall, color: C.muted, marginTop: "0.125rem" }}>{panchangTerm(L2, "paksha", p.paksha)} · {lang === "hi" ? (p.krishna ? "कृष्ण (क्षीयमान)" : "शुक्ल (वर्धमान)") : (p.krishna ? "waning moon" : "waxing moon")} · {lang === "hi" ? "चंद्र दिवस " + p.tithiDay : "lunar day " + p.tithiDay}</div>
              {dayEvents.length > 0 && <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "0.375rem", marginTop: "0.5rem" }}>
                {dayEvents.map((event) => {
                const isFast = event.kind === "fast";
                const eventPath = festivalPathForKey(event.kind, event.key);
                const eventLabel = isFast ? obsLabel(lang, event) : trN(lang, FEST_NAME, event.key);
                const baseKey = event.baseKey || event.key;
                const isEclipse = event.key === "suryaGrahan" || event.key === "chandraGrahan";
                const gloss = isFast ? OBS_GLOSS[baseKey]?.[L2] : isEclipse ? (lang === "hi" ? "स्थान के अनुसार दृश्यता और सूतक देखें" : "Check local visibility and Sutak") : (lang === "hi" ? "आज का पर्व" : "Festival today");
                const caution = Boolean(event.fasting || isEclipse);
                const chipStyle = { display: "inline-flex", alignItems: "center", gap: "0.4375rem", padding: "0.3125rem 0.6875rem", borderRadius: T.rMd, background: caution ? "var(--bad-surface)" : "var(--surface-hover)", border: `0.0625rem solid color-mix(in srgb, ${caution ? C.sindoor : C.gold}, var(--surface-active) 70%)` };
                const inner = (<>
                  <span style={{ fontSize: T.fSmall, fontWeight: 600, color: caution ? C.sindoor : C.gold }}>{eventLabel}</span>
                  {gloss && <span style={{ fontSize: T.fMicro, color: C.muted }}>· {gloss}</span>}
                </>);
                if (!eventPath) return <div key={`${event.kind}:${event.key}`} style={chipStyle}>{inner}</div>;
                return <a key={`${event.kind}:${event.key}`} href={festHref(eventPath)} className="ff-row" aria-label={(lang === "hi" ? "पूरी मार्गदर्शिका खोलें: " : "Open full guide: ") + eventLabel} style={{ ...chipStyle, textDecoration: "none", color: "inherit", cursor: "pointer" }}>{inner}<span aria-hidden="true" style={{ color: C.muted, fontSize: T.fMicro, flexShrink: 0 }}>›</span></a>;
              })}</div>}
              {p.pitruPaksha && (() => {
                const pp = p.pitruPaksha;
                const SP = { mahalaya: { en: "Sarva Pitru Amavasya (Mahalaya)", hi: "सर्वपितृ अमावस्या (महालय)" }, purnimaShraddha: { en: "Purnima Shraddha — Pitru Paksha begins", hi: "पूर्णिमा श्राद्ध — पितृ पक्ष आरंभ" }, avidhavaNavami: { en: "Avidhava Navami", hi: "अविधवा नवमी" }, ghataChaturdashi: { en: "Ghata Chaturdashi", hi: "घट चतुर्दशी" } };
                const tithiName = pp.krishna ? (TITHIS[(pp.shraddhaTithi - 1) % 14] || "") : "Purnima";
                const label = pp.special ? SP[pp.special][L2] : (lang === "hi" ? tithiName + " श्राद्ध" : tithiName + " Shraddha");
                return (
                  <div style={{ marginTop: "0.5rem", padding: "0.4375rem 0.6875rem", borderRadius: T.rMd, background: "rgba(120,90,60,.07)", border: "0.0625rem solid " + C.line }}>
                    <div style={{ fontSize: T.fSmall, fontWeight: 600, color: C.ivory }}>{lang === "hi" ? "पितृ पक्ष · " : "Pitru Paksha · "}{label}</div>
                    <div style={{ fontSize: T.fMicro, color: C.muted, marginTop: "0.125rem" }}>{lang === "hi" ? "श्राद्ध व तर्पण का पक्ष — विवाह, गृह प्रवेश आदि शुभ कार्य वर्जित" : "Fortnight for shraddha & tarpan — weddings, housewarming & other auspicious work are avoided"}</div>
                  </div>
                );
              })()}
              {p.ayyappaMandala && (() => {
                const av = p.ayyappaMandala, finalDay = av.day === 41;
                return (
                  <div style={{ marginTop: "0.5rem", padding: "0.4375rem 0.6875rem", borderRadius: T.rMd, background: "var(--bad-surface)", border: "0.0625rem solid var(--bad-surface)" }}>
                    <div style={{ fontSize: T.fSmall, fontWeight: 600, color: C.ivory }}>
                      {lang === "hi" ? `अय्यप्पा मंडल व्रतम · 41 में से दिन ${av.day}` : `Ayyappa Mandala Vratham · day ${av.day} of 41`}
                      {finalDay ? (lang === "hi" ? " · मंडल पूजा" : " · Mandala Pooja") : ""}
                    </div>
                    <div style={{ fontSize: T.fMicro, color: C.muted, marginTop: "0.125rem" }}>
                      {lang === "hi" ? "सरल सात्त्विक जीवन, दैनिक प्रार्थना व संयम — विस्तृत नियम गुरु स्वामी या मंदिर परंपरा से लें" : "Simple sattvic living, daily prayer and restraint — follow a Guru Swami or temple tradition for the full discipline"}
                    </div>
                  </div>
                );
              })()}
            </div>
            <div style={{ padding: `${T.s3} ${T.s5}`, borderTop: "0.0625rem solid " + C.line }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: T.s2, marginBottom: "0.4375rem" }}>
                <div style={{ ...T.label, color: C.muted }}>{isToday ? (lang === "hi" ? "आज के शुभ व अशुभ समय" : "Good & avoid times today") : (lang === "hi" ? "चुनी हुई तारीख़ के शुभ व अशुभ समय" : "Good & avoid times for this date")}</div>
                <ReadAloudButton
                  lang={L2 === "hi" ? "hi" : "en"}
                  compact
                  label={L2 === "hi" ? "🔊 सुनें" : "🔊 Listen"}
                  text={muhuratSpeech(L2, {
                    headline: L2 === "hi"
                      ? `${isToday ? "आज" : "इस दिन"} ${panchangTerm("hi", "tithi", p.tithis[0].name)} तिथि है।`
                      : `${isToday ? "Today" : "On this date"} the tithi is ${p.tithis[0].name}.`,
                    good: goodW.map((x) => `${winName[x[0]][L2]} ${fmtT(x[1].start)} – ${fmtT(x[1].end)}`),
                    avoid: avoidW.map((x) => `${winName[x[0]][L2]} ${fmtT(x[1].start)} – ${fmtT(x[1].end)}`),
                  })}
                />
              </div>
              {goodW.map((x) => <DataRow
                key={x[0]}
                density="compact"
                tone="good"
                divider={false}
                label={winName[x[0]][L2]}
                value={`${fmtT(x[1].start)}–${fmtT(x[1].end)}`}
                badge={<Badge tone="good" density="compact">{L2 === "hi" ? "शुभ" : "Good"}</Badge>}
              />)}
              {avoidW.map((x) => <DataRow
                key={x[0]}
                density="compact"
                tone="bad"
                divider={false}
                label={winName[x[0]][L2]}
                value={`${fmtT(x[1].start)}–${fmtT(x[1].end)}`}
                badge={<Badge tone="bad" density="compact">{L2 === "hi" ? "टालें" : "Avoid"}</Badge>}
              />)}
              {showPlainHelp && <p style={{ margin: "0.5rem 0 0", fontSize: T.fSmall, color: C.ivory, lineHeight: 1.55 }}>
                {lang === "hi"
                  ? "सरल भाषा में: ✓ वाले समय में कोई भी शुभ काम आरम्भ किया जा सकता है, और ⚠ या ✗ वाले समय में नया काम आरम्भ करने से बचें।"
                  : "In plain words: begin anything auspicious during a ✓ time, and avoid starting something new during a ⚠ or ✗ time."}
              </p>}
              {isToday && curChogha && <div style={{ fontSize: T.fMicro, color: C.muted, marginTop: "0.375rem" }}>{lang === "hi" ? "अभी चौघड़िया: " : "Now: "}<span style={{ color: natColor(curChogha.nat), fontWeight: 600 }}>{trN(lang, CHOG_NAME, curChogha.key)}</span></div>}
              {isToday && curLagnaW && <div style={{ fontSize: T.fMicro, color: C.muted, marginTop: "0.25rem" }}>{lang === "hi" ? "उदय लग्न: " : "Udaya Lagna: "}<span style={{ color: C.ivory }}>{signLabel(lang, SIGNS[curLagnaW.sign])}</span>{curPanchW && <> · {lang === "hi" ? "पञ्चक: " : "Panchaka: "}<span style={{ color: curPanchW.shubha ? "var(--good)" : C.sindoor, fontWeight: 600 }}>{trN(lang, PANCHAKA_NAME, curPanchW.type)}{curPanchW.shubha ? " ✓" : " ✗"}</span></>}</div>}
            </div>
            <div style={{ padding: `${T.s3} ${T.s5}`, borderTop: "0.0625rem solid " + C.line, display: "flex", flexWrap: "wrap", gap: `0.375rem ${T.s5}` }}>
              <div style={{ flex: "1 1 130px" }}>
                <div style={{ fontSize: T.fMicro, color: C.muted }}>☀ {lang === "hi" ? "सूर्य" : "Sun"}</div>
                <div style={{ fontSize: T.fSmall, color: C.ivory, fontVariantNumeric: "tabular-nums" }}>{p.rise ? fmtT(p.rise) : "—"} → {p.set ? fmtT(p.set) : "—"}</div>
              </div>
              <div style={{ flex: "1 1 130px" }}>
                <div style={{ fontSize: T.fMicro, color: C.muted }}>☾ {lang === "hi" ? "चंद्र" : "Moon"}</div>
                <div style={{ fontSize: T.fSmall, color: C.ivory, fontVariantNumeric: "tabular-nums" }}>{p.moonrise ? fmtT(p.moonrise) : "—"} → {p.moonset ? fmtT(p.moonset) : "—"}</div>
              </div>
              <div style={{ flex: "1 1 100%" }}>
                <div style={{ fontSize: T.fMicro, color: C.muted }}>✦ {lang === "hi" ? "नक्षत्र" : "Nakshatra"}</div>
                <div style={{ fontSize: T.fSmall, color: C.ivory }}>{panchangTerm(L2, "nakshatra", p.naks[0].name)}{nkLord ? " · " + (lang === "hi" ? "स्वामी " : "ruler ") + trN(lang, HORA_NAME, nkLord) : ""}{p.naks[0].end ? " · " + (lang === "hi" ? "तक " : "till ") + fmtT(p.naks[0].end) : ""}</div>
              </div>
            </div>
            {(nextFast || nextFest) && <div style={{ padding: `${T.s3} ${T.s5}`, borderTop: "0.0625rem solid " + C.line, background: "var(--surface-hover)" }}>
              <div style={{ ...T.label, color: C.muted, marginBottom: "0.375rem" }}>{lang === "hi" ? "आगामी" : "Coming up"}</div>
              {nextFast && comingRow("fast", nextFast, obsLabel(lang, { key: nextFast.key, baseKey: nextFast.key }), C.sindoor)}
              {nextFest && comingRow("festival", nextFest, trN(lang, FEST_NAME, nextFest.key), C.gold)}
            </div>}
            <button type="button" onClick={() => setShowPanch((v) => !v)} style={{ width: "100%", padding: "0.6875rem", border: "none", borderTop: "0.0625rem solid " + C.line, background: "transparent", color: C.gold, cursor: "pointer", fontFamily: T.serif, fontSize: T.fSmall, fontWeight: 500 }}>
              {showPanch ? (lang === "hi" ? "पंचांग छिपाएँ ▴" : "Hide full panchang ▴") : (lang === "hi" ? "पूरा पंचांग देखें ▾" : "View full panchang ▾")}
            </button>
          </div>
        );
      })()}

      {showPanch && todayP && (() => {
        const P = todayP, ptz = P.tz, A = P.anchor;
        const upto = (name, end) => <>{name} <span style={{ color: C.muted }}>{lang === "hi" ? "तक" : "upto"}</span> <span style={{ color: C.gold }}>{fmtTimeD(end, ptz, A)}</span></>;
        const multi = (entries) => (
          <span style={{ display: "inline-flex", flexDirection: "column", gap: "0.1875rem", alignItems: "flex-end" }}>
            {(Array.isArray(entries) ? entries : []).map((e3, k) => <span key={k}>{upto(e3.name, e3.end)}</span>)}
          </span>
        );
        const span2 = (w, color) => w ? <span style={{ color, fontVariantNumeric: "tabular-nums" }}>{fmtTime(w.start, ptz)} – {fmtTime(w.end, ptz)}</span> : "—";
        const rows = [];
        rows.push(["Sunrise", <span style={{ color: C.gold }}>{fmtTime(P.rise, ptz)}</span>]);
        rows.push(["Sunset", <span style={{ color: C.gold }}>{fmtTime(P.set, ptz)}</span>]);
        rows.push(["Moonrise", P.moonrise ? <span style={{ color: C.gold }}>{fmtTime(P.moonrise, ptz)}</span> : "—"]);
        rows.push(["Moonset", P.moonset ? <span style={{ color: C.gold }}>{fmtTime(P.moonset, ptz)}</span> : "—"]);
        rows.push(["Tithi", multi(P.tithis)]);
        rows.push(["Nakshatra", multi(P.naks)]);
        rows.push(["Yoga", multi(P.yogasP)]);
        rows.push([lang === "hi" ? "करण (तिथि का आधा भाग)" : "Karana (half of a tithi)", multi(P.karanas)]);
        rows.push([tr(lang, "pakshaL"), P.paksha]);
        rows.push([tr(lang, "varaL"), P.vara]);
        rows.push([tr(lang, "amantaL"), P.months.amanta]);
        rows.push([tr(lang, "purnimantaL"), P.months.purnimanta]);
        rows.push([tr(lang, "moonsignL"), P.moonSignEnd ? upto(signLabel(lang, P.moonSign), P.moonSignEnd) : signLabel(lang, P.moonSign)]);
        rows.push([tr(lang, "sunsignL"), signLabel(lang, P.sunSign)]);
        rows.push([lang === "hi" ? "प्रविष्टे (सौर मास में बीते दिन)" : "Pravishte (days into the solar month)", String(P.pravishte)]);
        rows.push([lang === "hi" ? "शक संवत् (राष्ट्रीय पंचांग वर्ष)" : "Shaka Samvat (national calendar year)", P.samvat.shaka]);
        rows.push([lang === "hi" ? "विक्रम संवत् (उत्तर भारतीय पंचांग वर्ष)" : "Vikram Samvat (north Indian calendar year)", P.samvat.vikram]);
        rows.push([lang === "hi" ? "गुजराती संवत् (गुजराती पंचांग वर्ष)" : "Gujarati Samvat (Gujarati calendar year)", P.samvat.guj]);
        rows.push([tr(lang, "abhijitL"), P.abhijit ? span2(P.abhijit, C.gold) : <span style={{ color: C.muted }}>{tr(lang, "abhijitNone")}</span>]);
        rows.push([tr(lang, "rahuL"), span2(P.rahu, C.sindoor)]);
        rows.push([tr(lang, "gulikaL"), span2(P.gulika, C.sindoor)]);
        rows.push([tr(lang, "yamaL"), span2(P.yama, C.sindoor)]);
        return (
          <>
          <div className="rise" style={{ ...card, padding: "1.125rem 1.25rem", marginBottom: T.s4 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: T.s3, marginBottom: "0.625rem", borderBottom: `0.0625rem solid ${C.line}`, paddingBottom: T.s3 }}>
              <span style={{ fontFamily: T.serif, color: C.gold, fontSize: T.fHeading }}>{lang === "hi" ? "विस्तृत पञ्चाङ्ग" : "Full panchang"}</span>
            </div>
            <div style={{ marginBottom: "0.875rem" }}>
              <span style={{ fontFamily: T.serif, fontSize: "var(--font-title)", color: C.gold }}>{P.dateLabel}</span>
              {place && place.label ? <span style={{ fontSize: "var(--font-small)", color: C.muted }}> · {place.label}</span> : null}
            </div>
            <div style={{ borderTop: `0.0625rem solid ${C.line}` }}>
              {rows.map(([k, v], idx) => (
                <div key={k + idx} style={{ display: "flex", justifyContent: "space-between", gap: "0.875rem", padding: "0.5rem 0.125rem", borderBottom: `0.0625rem solid var(--line-soft)`, fontSize: "var(--font-body)", alignItems: "baseline" }}>
                  <span style={{ color: C.muted, whiteSpace: "nowrap" }}>{k}</span>
                  <span style={{ textAlign: "right", overflowWrap: "break-word" }}>{v}</span>
                </div>
              ))}
            </div>
            <p style={{ color: C.muted, fontSize: "var(--font-label)", margin: "0.75rem 0 0" }}>Panchang day reckoned from local sunrise · times accurate to ±3 minutes</p>
          </div>

          <div className="rise" style={{ ...card, padding: "1rem 1.25rem", marginBottom: T.s4 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: T.s3, marginBottom: "0.5rem", borderBottom: `0.0625rem solid ${C.line}`, paddingBottom: T.s3 }}>
              <span style={{ fontFamily: T.serif, color: C.gold, fontSize: T.fHeading }}>{lang === "hi" ? "चौघड़िया" : "Choghadiya"}</span>
            </div>
            <div style={{ fontSize: T.fMicro, color: C.muted, marginBottom: "0.5rem" }}>{lang === "hi" ? "घंटे-दर-घंटे शुभ/अशुभ समय" : "Hour-by-hour good & avoid times"}</div>
            {[["dayChogha", todayP.choghaDay], ["nightChogha", todayP.choghaNight]].map(([lbl, slots]) => slots && (
              <div key={lbl} style={{ marginBottom: "0.625rem" }}>
                <div style={{ fontSize: "var(--font-label)", color: C.muted, marginBottom: "0.3125rem" }}>{tr(lang, lbl)}</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(108px, 1fr))", gap: "0.375rem" }}>
                  {slots.map((c, i) => {
                    const live = inWin(c);
                    return (
                      <Card
                        key={i}
                        density="compact"
                        elevated={false}
                        tone={live ? (c.nat === "good" ? "good" : c.nat === "bad" ? "bad" : "accent") : "default"}
                        style={{ borderRadius: T.rSm, borderLeft: `0.1875rem solid ${natColor(c.nat)}` }}
                      >
                        <div style={{ fontFamily: "var(--font-display-family)", fontSize: "var(--font-small)", color: natColor(c.nat) }}>{natGlyph(c.nat)} {trN(lang, CHOG_NAME, c.key)}{live && " ●"}</div>
                        <div style={{ fontSize: "var(--font-micro)", color: C.muted, fontVariantNumeric: "tabular-nums" }}>{fmtT(c.start)}–{fmtT(c.end)}</div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <div className="rise technical-only" style={{ ...card, padding: "1rem 1.25rem", marginBottom: T.s4 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: T.s3, marginBottom: "0.375rem", borderBottom: `0.0625rem solid ${C.line}`, paddingBottom: T.s3 }}>
              <span style={{ fontFamily: T.serif, color: C.gold, fontSize: T.fHeading }}>{lang === "hi" ? "उदय लग्न" : "Udaya Lagna"}</span>
            </div>
            <div style={{ fontSize: T.fMicro, color: C.muted, marginBottom: "0.5rem" }}>{lang === "hi" ? "सूर्योदय से अगले सूर्योदय तक प्रत्येक राशि का उदयकाल" : "Each rising sign, sunrise to next sunrise"}</div>
            {(lp.lagnaSchedule || []).map((w, i) => {
              const live = isToday && nowMs != null && nowMs >= w.start && nowMs < w.end;
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.625rem", padding: "0.4375rem 0.125rem", borderBottom: "0.0625rem solid var(--line-soft)", flexWrap: "wrap", background: live ? "var(--surface-hover)" : undefined }}>
                  <span style={{ flex: "1 1 auto", fontFamily: T.serif, fontSize: "var(--font-body)", color: C.ivory }}>{signLabel(lang, SIGNS[w.sign])}{live ? " ●" : ""}</span>
                  <span style={{ fontSize: T.fSmall, color: C.muted, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>{fmtTime(w.start, lp.tz)} – {fmtTime(w.end, lp.tz)}</span>
                  <span style={{ flex: "0 0 auto", textAlign: "right", fontSize: T.fMicro, fontWeight: 600, color: w.shubha ? "var(--good)" : C.sindoor }}>{shubhaGlyph(w.shubha)} {trN(lang, PANCHAKA_SHORT, w.type)}</span>
                </div>
              );
            })}
          </div>

          <div className="rise technical-only" style={{ ...card, padding: "1rem 1.25rem", marginBottom: T.s4 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: T.s3, marginBottom: "0.375rem", borderBottom: `0.0625rem solid ${C.line}`, paddingBottom: T.s3 }}>
              <span style={{ fontFamily: T.serif, color: C.gold, fontSize: T.fHeading }}>{lang === "hi" ? "पञ्चक रहित मुहूर्त" : "Panchaka Rahita"}</span>
            </div>
            <div style={{ fontSize: T.fMicro, color: C.muted, marginBottom: "0.5rem" }}>{lang === "hi" ? "शुभ (दोषरहित) व पञ्चक-दोष काल" : "Auspicious (blemish-free) vs Panchaka-dosha windows"}</div>
            {(lp.panchakaWindows || []).map((w, i) => {
              const live = isToday && nowMs != null && nowMs >= w.start && nowMs < w.end;
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.5625rem", padding: "0.5rem 0.125rem", borderBottom: "0.0625rem solid var(--line-soft)", background: live ? "var(--surface-hover)" : undefined }}>
                  <span style={{ flexShrink: 0, fontSize: T.fSmall, fontWeight: 700, color: w.shubha ? "var(--good)" : C.sindoor }}>{shubhaGlyph(w.shubha)}</span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: T.fSmall, color: w.shubha ? "var(--good)" : C.sindoor, fontWeight: 600 }}>{trN(lang, PANCHAKA_NAME, w.type)}</span>
                    {live && <span style={{ fontSize: T.fMicro, color: C.gold }}> ● {lang === "hi" ? "अभी" : "now"}</span>}
                    <span style={{ display: "block", fontSize: T.fMicro, color: C.muted }}>{trN(lang, PANCHAKA_GLOSS, w.type)}</span>
                  </span>
                  <span style={{ fontSize: T.fSmall, color: C.muted, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>{fmtTime(w.start, lp.tz)} – {fmtTime(w.end, lp.tz)}</span>
                </div>
              );
            })}
            <p style={{ color: C.muted, fontSize: T.fMicro, margin: "0.625rem 0 0", lineHeight: 1.5, fontStyle: "italic" }}>{lang === "hi" ? "विवाह, गृहप्रवेश आदि हेतु शुभ (पञ्चक रहित) काल चुनें।" : "For marriage, housewarming etc., choose Shubha (Rahita) windows."}</p>
          </div>
          </>
        );
      })()}

      {/* festivals & fasting */}
      <SecHead deva="व्रत एवं पर्व" en="Fasts & festivals" right={tab === "fasting" ? (
        <span style={{ display: "inline-flex", gap: "0.25rem" }}>
          {[["smarta", lang === "hi" ? "स्मार्त" : "Smarta"], ["vaishnava", "ISKCON"]].map(([v, l]) => (
            <button key={v} onClick={() => chooseTrad(v)} style={{ minHeight: T.ctrlH, fontSize: T.fMicro, padding: `0 ${T.s3}`, borderRadius: T.rPill, border: `0.0625rem solid ${trad === v ? C.gold : C.line}`, background: trad === v ? "var(--accent-soft)" : "transparent", color: trad === v ? C.gold : C.muted, cursor: "pointer" }}>{l}</button>
          ))}
        </span>
      ) : null} />
      <div style={{ ...card, padding: 0, overflow: "hidden" }}>
        <style>{`.ff-row{transition:background .12s ease;} .ff-row:hover{background:var(--surface-hover);} .ff-row:focus-visible{outline:0.125rem solid var(--accent);outline-offset:-2px;background:var(--accent-soft);}`}</style>
        <div style={{ display: "flex", gap: "0.375rem", padding: "0.625rem 0.75rem 0.375rem" }}>
          {[["fasting", "fastingTab"], ["festival", "festivalTab"]].map(([k, lbl]) => (
            <button key={k} onClick={() => setTab(k)} style={{ minHeight: T.ctrlH, padding: `0 ${T.s4}`, borderRadius: T.rPill, fontFamily: "var(--font-display-family)", fontSize: "var(--font-small)", cursor: "pointer", border: `0.0625rem solid ${tab === k ? C.gold : "transparent"}`, background: tab === k ? "var(--accent-soft)" : "transparent", color: tab === k ? C.gold : C.muted }}>{tr(lang, lbl)}</button>
          ))}
        </div>
        {tab === "fasting" && trad === "vaishnava" && (
          <div style={{ fontSize: "var(--font-label)", color: C.muted, padding: "0 0.75rem 0.5rem", fontStyle: "italic", lineHeight: 1.45 }}>
            {lang === "hi" ? "ISKCON (वैष्णव) तिथियों में कुछ एकादशी व्रत एक दिन बाद पड़ सकते हैं।" : "ISKCON (Vaishnava) dates may fall a day later for some Ekadashi fasts."}
          </div>
        )}
        {(() => {
          if (calBusy) {
            return <div style={{ padding: "0.75rem", fontSize: "var(--font-small)", color: C.muted, fontStyle: "italic" }}>{lang === "hi" ? "पंचांग देखा जा रहा है…" : "Checking the panchang…"}</div>;
          }
          const source = tab === "fasting" ? effFasts : cal.festivals;
          // Cap the upcoming list, but never let a grahan (Sutak-bearing, high-value)
          // fall off the end: local-time date shifts can reshuffle the window and push
          // it past the cap in far-west timezones. Always re-include any within-window grahan.
          const capped = source.slice(0, 10);
          const grahanExtra = source.filter((f) => (f.key === "suryaGrahan" || f.key === "chandraGrahan") && !capped.includes(f));
          const items = grahanExtra.length ? [...capped, ...grahanExtra].sort((a, b) => a.ms - b.ms) : capped;
          if (!items.length) return <div style={{ padding: "0.75rem", fontSize: "var(--font-small)", color: C.muted, fontStyle: "italic" }}>{tr(lang, "noneToday")}</div>;
          const LL = lang === "hi" ? "hi" : "en";
          const DAY = 86400000;
          const away = (ms) => { const dd = Math.round((ms - todayP.anchor) / DAY); return dd <= 0 ? (lang === "hi" ? "आज" : "today") : (lang === "hi" ? dd + " दिन" : dd + "d"); };
          const monthLbl = (ms) => new Date(ms + tz * 3600000).toLocaleDateString(lang === "hi" ? "hi-IN" : "en-IN", { month: "long", timeZone: "UTC" });
          let lastMonth = null;
          return items.map((it) => {
            const kind = tab === "fasting" ? obsKind(it.key) : it.key;
            const name = tab === "fasting" ? obsLabel(lang, { key: it.key, baseKey: kind, isVariant: it.key !== kind }) : trN(lang, FEST_NAME, it.key);
            const mLbl = monthLbl(it.ms);
            const header = mLbl !== lastMonth ? <div style={{ ...T.label, color: C.muted, padding: "0.75rem 0.75rem 0.125rem" }}>{mLbl}</div> : null;
            lastMonth = mLbl;
            const id = tab + ":" + it.key + ":" + it.ms;
            const path = festivalPathForKey(tab === "fasting" ? "fast" : "festival", it.key);
            const dateCell = <span style={{ flexShrink: 0, fontSize: "var(--font-small)", color: C.muted, fontVariantNumeric: "tabular-nums" }}><span style={{ color: C.gold }}>{fmtDay(it.ms)}</span> · {away(it.ms)}</span>;
            return (
              <div key={id}>
                {header}
                {path ? (
                  <a
                    href={festHref(path)}
                    className="ff-row"
                    aria-label={(lang === "hi" ? "पूरी मार्गदर्शिका खोलें: " : "Open full guide: ") + name}
                    style={{ borderTop: "0.0625rem solid var(--line-soft)", textDecoration: "none", color: "inherit", padding: "0.6875rem 0.75rem", display: "flex", justifyContent: "space-between", gap: "0.625rem", alignItems: "baseline" }}
                  >
                    <span style={{ fontSize: "var(--font-body)", color: C.ivory, flex: 1, minWidth: 0, overflowWrap: "break-word" }}>{name}</span>
                    <span style={{ display: "inline-flex", alignItems: "baseline", gap: "0.5rem", flexShrink: 0 }}>{dateCell}<span aria-hidden="true" style={{ color: C.muted, fontSize: "var(--font-body)" }}>›</span></span>
                  </a>
                ) : (
                  <div style={{ borderTop: "0.0625rem solid var(--line-soft)", padding: "0.6875rem 0.75rem", display: "flex", justifyContent: "space-between", gap: "0.625rem", alignItems: "baseline" }}>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: "var(--font-body)", color: C.ivory, display: "block", overflowWrap: "break-word" }}>{name}</span>
                      <span style={{ fontSize: "var(--font-label)", color: C.sindoor }}>{lang === "hi" ? "पूरा पृष्ठ अभी उपलब्ध नहीं" : "Full page not available yet"}</span>
                    </span>
                    {dateCell}
                  </div>
                )}
              </div>
            );
          });
        })()}
        <div style={{ borderTop: `0.0625rem solid ${C.line}`, padding: "0.625rem 0.75rem", display: "flex", gap: "0.5rem" }}>
          <input value={fq} onChange={(e) => setFq(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && fq.trim()) onCal({ type: "search", q: fq.trim() }); }} placeholder={tr(lang, "searchPlaceholder")} style={{ flex: 1, minWidth: 0, height: T.ctrlH, boxSizing: "border-box", padding: "0 0.75rem", borderRadius: T.rMd, border: `0.0625rem solid ${C.line}`, background: "var(--surface-sunken)", color: C.ivory, fontFamily: T.body, fontSize: "var(--font-small)" }} />
          <button onClick={() => fq.trim() && onCal({ type: "search", q: fq.trim() })} style={{ height: T.ctrlH, boxSizing: "border-box", padding: "0 1rem", borderRadius: T.rMd, fontFamily: T.serif, fontSize: "var(--font-small)", cursor: "pointer", border: `0.0625rem solid ${C.gold}`, background: "var(--surface-hover)", color: C.gold, flexShrink: 0 }}>{tr(lang, "searchBtn")}</button>
        </div>
        <button onClick={() => onCal({ type: "year" })} style={{ width: "100%", padding: "0.5625rem", border: "none", background: "transparent", color: C.gold, cursor: "pointer", fontFamily: T.serif, fontSize: T.fSmall, letterSpacing: ".02em" }}>{tr(lang, "moreLabel")} ›</button>
      </div>
      {/* muhurat finder */}
      <SecHead deva="मुहूर्त खोज" en="Muhurat finder" />
      {/* Sub-tabs: the everyday celebratory finder vs the dedicated, safety-gated medical
          timing tool. Medical is never a chip in the grid (that would read as casual and
          skip its safety wall); it gets its own tab that routes to /muhurat/medical. */}
      <div role="tablist" aria-label={lang === "hi" ? "मुहूर्त प्रकार" : "Muhurat type"} style={{ display: "flex", gap: "0.375rem", marginBottom: "0.625rem", flexWrap: "wrap" }}>
        <span role="tab" aria-selected="true" style={{ height: T.ctrlH, boxSizing: "border-box", display: "inline-flex", alignItems: "center", padding: "0 0.8125rem", borderRadius: T.rMd, fontFamily: T.body, fontSize: "var(--font-small)", fontWeight: 600, border: `0.0938rem solid ${C.gold}`, background: "var(--accent-soft)", color: C.gold }}>
          {lang === "hi" ? "सामान्य मुहूर्त" : "Everyday muhurat"}
        </span>
        <a role="tab" aria-selected="false" href={`/muhurat/medical?lang=${lang}`} className="comfort-focus" style={{ height: T.ctrlH, boxSizing: "border-box", display: "inline-flex", alignItems: "center", gap: "0.375rem", padding: "0 0.8125rem", borderRadius: T.rMd, textDecoration: "none", fontFamily: T.body, fontSize: "var(--font-small)", border: `0.0938rem solid ${C.line}`, background: "var(--surface-sunken)", color: C.ivory }}>
          {lang === "hi" ? "चिकित्सा समय" : "Medical timing"}
          <span aria-hidden="true" style={{ color: C.muted }}>›</span>
        </a>
      </div>
      <div id="muhurat-finder" style={{ ...card, padding: T.s4 }}>
        <div style={{ marginBottom: "1rem" }}>
          <div style={{ fontSize: "var(--font-small)", color: C.muted, marginBottom: "0.5rem", fontStyle: "italic" }}>
            {lang === "hi" ? "क्या करने जा रहे हैं और कब तक — चुनें, सर्वोत्तम दिन क्रमानुसार मिलेंगे।" : "Pick what you're planning and when — get the best days, ranked."}
          </div>
          <div style={{ display: "flex", gap: "0.375rem", flexWrap: "wrap", marginBottom: "0.625rem" }}>
            {MUH_CATS.map((c) => { const on = mfCat === c.key; return (
              <button key={c.key} onClick={() => chooseMfCat(c.key)}
                style={{ height: T.ctrlH, boxSizing: "border-box", padding: "0 0.8125rem", borderRadius: T.rMd, cursor: "pointer", fontFamily: T.body, fontSize: "var(--font-small)",
                  border: `0.0938rem solid ${on ? C.gold : C.line}`, background: on ? "var(--accent-soft)" : "var(--surface-sunken)", color: on ? C.gold : C.ivory }}>
                {lang === "hi" ? c.hi : c.en}
              </button>
            ); })}
          </div>
          <div style={{ display: "flex", gap: "0.4375rem", flexWrap: "wrap", marginBottom: "0.5rem" }}>
            <label style={{ display: "flex", flexDirection: "column", gap: "0.1875rem", flex: 1, minWidth: "8.75rem", ...T.label, color: C.muted }}>
              {lang === "hi" ? "से" : "From"}
              <input type="date" value={mfFrom} onChange={(e) => { setMfFrom(e.target.value); setMfPreset(null); }}
                style={{ height: T.ctrlH, boxSizing: "border-box", padding: "0 0.625rem", borderRadius: T.rMd, border: `0.0625rem solid ${C.line}`, background: "var(--surface-sunken)", color: C.ivory, fontFamily: T.body, fontSize: "var(--font-small)", letterSpacing: "normal", textTransform: "none" }} />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: "0.1875rem", flex: 1, minWidth: "8.75rem", ...T.label, color: C.muted }}>
              {lang === "hi" ? "तक" : "To"}
              <input type="date" value={mfTo} onChange={(e) => { setMfTo(e.target.value); setMfPreset(null); }}
                style={{ height: T.ctrlH, boxSizing: "border-box", padding: "0 0.625rem", borderRadius: T.rMd, border: `0.0625rem solid ${C.line}`, background: "var(--surface-sunken)", color: C.ivory, fontFamily: T.body, fontSize: "var(--font-small)", letterSpacing: "normal", textTransform: "none" }} />
            </label>
          </div>
          <div style={{ display: "flex", gap: "0.375rem", marginBottom: "0.625rem" }}>
            {[["90", lang === "hi" ? "90 दिन" : "90 days", () => [isoAtOffset(0), isoAtOffset(90)]],
              ["year", lang === "hi" ? "इस वर्ष" : "This year", () => [isoAtOffset(0), new Date(Date.now() + tz * 3600000).getUTCFullYear() + "-12-31"]]].map(([pk, label, mk]) => {
              const on = mfPreset === pk;
              return (
                <button key={pk} onClick={() => { const [f, t] = mk(); setMfFrom(f); setMfTo(t); setMfPreset(pk); if (mfCat) findDays(f, t); }}
                  style={{ padding: "0.25rem 0.75rem", borderRadius: T.rPill, border: `0.0938rem solid ${on ? C.gold : C.line}`, background: on ? "var(--accent-soft)" : "transparent", color: on ? C.gold : C.muted, fontSize: "var(--font-label)", cursor: "pointer", fontFamily: T.body }}>
                  {label}
                </button>
              );
            })}
          </div>
          {MUHURAT_GUIDANCE[mfCat] && <div style={{ margin: "0.625rem 0", padding: "0.6875rem 0.75rem", borderRadius:T.rMd, background:"var(--surface-raised)", border:`0.0625rem solid ${C.line}`, color:C.ivory, fontSize: "var(--font-small)", lineHeight:1.55 }}>{MUHURAT_GUIDANCE[mfCat][lang === "hi" ? "hi" : "en"]}</div>}
          {PURCHASE_ACTIONS[mfCat] && (() => {
            const spec=PURCHASE_ACTIONS[mfCat], selected=spec.options.find((x)=>x.value===purchaseAction) || spec.options[0];
            return <div style={{ margin: "0.625rem 0" }}>
              <label style={{ ...T.label,color:C.muted,display:"flex",flexDirection:"column",gap: "0.25rem" }}>{spec.label[lang === "hi" ? "hi" : "en"]}
                <select value={selected.value} onChange={(e)=>{setPurchaseAction(e.target.value);urlPrefPush("maction",e.target.value);}} style={{height:T.ctrlH,borderRadius:T.rMd,border:`0.0625rem solid ${C.line}`,background:"var(--surface-sunken)",padding: "0 0.625rem",fontFamily:T.body,color:C.ivory}}>
                  {spec.options.map((x)=><option key={x.value} value={x.value}>{x[lang === "hi" ? "hi" : "en"]}</option>)}
                </select>
              </label>
              <div style={{fontSize: "var(--font-label)",color:C.muted,lineHeight:1.5,marginTop: "0.3125rem"}}>{selected.note[lang === "hi" ? "hi" : "en"]}</div>
            </div>;
          })()}
          {SAMSKARA_INPUTS[mfCat] && (() => {
            const spec=SAMSKARA_INPUTS[mfCat], profile=samskaraProfiles[mfCat] || {};
            const setProfile=(key,value)=>setSamskaraProfiles(prev=>({ ...prev, [mfCat]:{ ...(prev[mfCat]||{}), [key]:value } }));
            return <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))", gap: "0.5rem", margin: "0.625rem 0" }}>
              <label style={{ ...T.label,color:C.muted }}>{lang === "hi" ? "शिशु की जन्म-तिथि" : "Child's birth date"}<input type="date" value={profile.birthDate || ""} onChange={e=>setProfile("birthDate",e.target.value)} style={{ display:"block",width:"100%",height:T.ctrlH,boxSizing:"border-box",marginTop: "0.25rem",padding: "0 0.5625rem",borderRadius:T.rMd,border:`0.0625rem solid ${C.line}`,background:"var(--surface-sunken)",color:C.ivory,fontFamily:T.body }} /></label>
              <label style={{ ...T.label,color:C.muted }}>{spec.secondaryLabel[lang === "hi" ? "hi" : "en"]}<select value={profile[spec.secondary] || ""} onChange={e=>setProfile(spec.secondary,e.target.value)} style={{ display:"block",width:"100%",height:T.ctrlH,boxSizing:"border-box",marginTop: "0.25rem",padding: "0 0.5625rem",borderRadius:T.rMd,border:`0.0625rem solid ${C.line}`,background:"var(--surface-sunken)",color:C.ivory,fontFamily:T.body }}><option value="">{lang === "hi" ? "चुनें" : "Choose"}</option>{(spec.options || NAKSHATRAS.map((en,i)=>({value:String(i),en,hi:panchangTermAt("hi","nakshatra",i)}))).map(o=><option key={o.value} value={o.value}>{lang === "hi" ? o.hi : o.en}</option>)}</select></label>
              <div style={{ gridColumn:"1 / -1",fontSize: "var(--font-label)",color:C.muted,lineHeight:1.45 }}>{lang === "hi" ? "ये विवरण संस्कार-सन्दर्भ स्पष्ट करते हैं; परिणाम सामान्य पंचांग और संस्कार-विशिष्ट लग्न-शुद्धि है, पूर्ण जन्म-कुण्डली मुहूर्त नहीं।" : "These details clarify the ceremony context; results use general Panchang plus ceremony-specific lagna screening, not a full personalized natal election."}</div>
            </div>;
          })()}
          {/* Opt-in birth-star personalisation. Collapsed by default so the general finder is
              untouched for anyone who doesn't want it. */}
          <details open={pmOpen} onToggle={(e) => setPmOpen(e.currentTarget.open)}
            style={{ margin: "0.625rem 0", padding: "0.6875rem 0.75rem", borderRadius: T.rMd, background: "var(--surface-raised)", border: `0.0625rem solid ${C.line}` }}>
            <summary style={{ cursor: "pointer", color: C.gold, fontFamily: T.serif, fontSize: "var(--font-small)" }}>
              {PM_NATAL_SECTION[lang === "hi" ? "hi" : "en"]}
            </summary>
            <div style={{ fontSize: "var(--font-label)", color: C.muted, lineHeight: 1.55, margin: "0.5rem 0 0.625rem" }}>
              {PM_NATAL_HINT[lang === "hi" ? "hi" : "en"]}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: "0.5rem" }}>
              <label style={{ ...T.label, color: C.muted }}>{PM_BIRTH_LABELS.date[lang === "hi" ? "hi" : "en"]}
                <input type="date" value={pmDate} max={new Date().toISOString().slice(0, 10)} onChange={(e) => setPmDate(e.target.value)}
                  style={{ display: "block", width: "100%", height: T.ctrlH, boxSizing: "border-box", marginTop: "0.25rem", padding: "0 0.5625rem", borderRadius: T.rMd, border: `0.0625rem solid ${C.line}`, background: "var(--surface-sunken)", color: C.ivory, fontFamily: T.body }} /></label>
              <label style={{ ...T.label, color: C.muted }}>{PM_BIRTH_LABELS.time[lang === "hi" ? "hi" : "en"]}
                <input type="time" value={pmTime} onChange={(e) => setPmTime(e.target.value)}
                  style={{ display: "block", width: "100%", height: T.ctrlH, boxSizing: "border-box", marginTop: "0.25rem", padding: "0 0.5625rem", borderRadius: T.rMd, border: `0.0625rem solid ${C.line}`, background: "var(--surface-sunken)", color: C.ivory, fontFamily: T.body }} /></label>
              <label style={{ ...T.label, color: C.muted, gridColumn: "1 / -1" }}>{PM_BIRTH_LABELS.place[lang === "hi" ? "hi" : "en"]}
                <PlaceInput value={pmPlace} onPick={setPmPlace} onConfirmed={setPmPlaceOk} C={C} lang={lang} /></label>
              {pmDate && !pmReady && (
                <div role="note" style={{ gridColumn: "1 / -1", fontSize: "var(--font-label)", color: C.gold, lineHeight: 1.45 }}>
                  {PM_NATAL_UNCONFIRMED[lang === "hi" ? "hi" : "en"]}
                </div>
              )}
            </div>
          </details>
          <button onClick={() => findDays()} disabled={!mfCat || mfBusy}
            style={{ width: "100%", height: T.ctrlH, boxSizing: "border-box", borderRadius: T.rMd, fontFamily: T.serif, fontSize: "var(--font-body)", cursor: mfCat && !mfBusy ? "pointer" : "default", border: "none", background: mfCat && !mfBusy ? "linear-gradient(180deg, var(--accent), var(--accent-strong))" : C.line, color: mfCat && !mfBusy ? "var(--on-accent)" : C.ivory, fontWeight: 600 }}>
            {mfBusy ? (lang === "hi" ? "पंचांग देखा जा रहा है…" : "Checking the panchang…")
              : !mfCat ? (lang === "hi" ? "पहले ऊपर कार्य चुनें" : "First pick an activity above")
              : (lang === "hi" ? "शुभ दिन खोजें" : "Find good days")}
          </button>
          {mfErr && (
            <div style={{ marginTop: "0.625rem", padding: "0.625rem 0.75rem", borderRadius: T.rMd, background: "var(--bad-surface)", border: `0.0938rem solid ${C.sindoor}`, color: C.sindoor, fontSize: "var(--font-small)" }}>{mfErr}</div>
          )}
          {ans && !mfBusy && (ans.from !== mfFrom || ans.to !== mfTo || ans.category !== mfCat || (ans.pmSig || "") !== pmSig) && (
            <div style={{ marginTop: "0.625rem", padding: "0.5625rem 0.75rem", borderRadius: T.rMd, background: "var(--accent-soft)", border: `0.0625rem solid var(--accent-line)`, color: "var(--accent-strong)", fontSize: "var(--font-small)", lineHeight: 1.45 }}>
              {lang === "hi" ? "चुनाव बदल गया है — नए परिणामों हेतु \"शुभ दिन खोजें\" दबाएँ। नीचे पिछले परिणाम दिख रहे हैं।" : "Your selection changed — press \"Find good days\" to update. The results below are from your previous search."}
            </div>
          )}
          {ans && (() => {
            const catInfo = MUH_CATS.find((c) => c.key === ans.category) || { hi: "", en: "" };
            const scanValid = ans.days.filter((d) => d.valid);
            // Birth-star overlay. Without anchors this is a no-op and `allValid` is exactly
            // what the finder always produced. Tarabala + Chandrabala are the only filters
            // that remove a day; Ashtakavarga strength ranks, and the Adhanadi caution marks.
            const personal = ans.anchors ? applyPersonalisation(scanValid, ans.anchors) : null;
            const allValid = personal ? personal.kept : scanValid;
            const days = allValid.slice(0, 8);
            const pmSpecial = Object.fromEntries(PM_SPECIAL_NAMES.map((s) => [s.key, s]));
            const pmBadges = (r) => {
              if (!r || !r.fit) return null;
              const f = r.fit, L = (o) => o[lang === "hi" ? "hi" : "en"];
              const sp = f.specialCaution && pmSpecial[f.specialName];
              return (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3125rem", marginTop: "0.375rem" }}>
                  <span style={{ fontSize: "var(--font-label)", padding: "0.0625rem 0.5rem", borderRadius: "0.625rem", background: `color-mix(in srgb, ${f.taraGood ? "var(--good)" : C.sindoor}, var(--surface-active) 88%)`, color: f.taraGood ? "var(--good)" : C.sindoor }}>{L(f.taraGood ? PM_BADGE.taraGood : PM_BADGE.taraBad)}</span>
                  <span style={{ fontSize: "var(--font-label)", padding: "0.0625rem 0.5rem", borderRadius: "0.625rem", background: `color-mix(in srgb, ${f.chandraGood ? "var(--good)" : C.sindoor}, var(--surface-active) 88%)`, color: f.chandraGood ? "var(--good)" : C.sindoor }}>{L(f.chandraGood ? PM_BADGE.chandraGood : PM_BADGE.chandraBad)}</span>
                  {f.strength != null && <span title={L(PM_BADGE.strength)} style={{ fontSize: "var(--font-label)", color: C.gold, letterSpacing: "0.0625rem" }}>{"●".repeat(f.strength) + "○".repeat(4 - f.strength)}</span>}
                  {sp && <span title={L(PM_SPECIAL_CAUTION_NOTE)} style={{ fontSize: "var(--font-label)", padding: "0.0625rem 0.5rem", borderRadius: "0.625rem", background: "var(--surface-hover)", color: C.muted }}>⚑ {L(PM_SPECIAL_CHIP(sp, sp.ord))}</span>}
                </div>
              );
            };
            const qual = (sc) => sc >= 5 ? { t: lang === "hi" ? "अति शुभ" : "Highly auspicious", c: "var(--good)" } : sc >= 3 ? { t: lang === "hi" ? "शुभ" : "Auspicious", c: C.gold } : sc >= 1 ? { t: lang === "hi" ? "सामान्य" : "Workable", c: "var(--accent)" } : { t: lang === "hi" ? "टालें" : "Better avoided", c: C.sindoor };
            const dl = (r) => new Date(r.rise + r.tz * 3600000).toLocaleDateString(lang === "hi" ? "hi-IN" : "en-US", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
            const dlFull = (r) => new Date(r.rise + r.tz * 3600000).toLocaleDateString(lang === "hi" ? "hi-IN" : "en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
            const fmtIso = (iso) => new Date(iso + "T00:00:00Z").toLocaleDateString(lang === "hi" ? "hi-IN" : "en-US", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
            const top = days[0];
            const samskaraSpec=SAMSKARA_INPUTS[ans.category], profile=ans.profile || {};
            const profileReady=!samskaraSpec || Boolean(profile.birthDate && profile[samskaraSpec.secondary] !== undefined && profile[samskaraSpec.secondary] !== "");
            // tally the reasons the excluded days were skipped, most-common first
            const blockerTally = (() => {
              const m = new Map();
              for (const d of ans.days) { if (d.valid) continue; for (const b of (d.blockers || [])) { if (!m.has(b.en)) m.set(b.en, { en: b.en, hi: b.hi, n: 0 }); m.get(b.en).n++; } }
              return [...m.values()].sort((a, b) => b.n - a.n).slice(0, 4);
            })();
            const whyList = blockerTally.map((b) => (lang === "hi" ? b.hi : b.en) + " (" + b.n + ")").join(lang === "hi" ? ", " : ", ");
            return (
              <div style={{ marginTop: "0.875rem", paddingTop: "0.875rem", borderTop: `0.0625rem solid ${C.line}` }}>
                <div style={{ fontFamily: "var(--font-display-family)", fontSize: "var(--font-body)", color: C.ivory }}>
                  {(lang === "hi" ? "शुभ दिन · " : "Best days · ")}{lang === "hi" ? catInfo.hi : catInfo.en} <span style={{ color: C.muted, fontSize: "var(--font-small)" }}>· {fmtIso(ans.from || mfFrom)} – {fmtIso(ans.to || mfTo)}</span>
                </div>
                {personal && (
                  <div style={{ marginTop: "0.5rem", padding: "0.5625rem 0.6875rem", borderRadius: T.rSm, background: "var(--accent-soft)", border: `0.0625rem solid var(--accent-line)`, fontSize: "var(--font-small)", lineHeight: 1.5, color: "var(--accent-strong)" }}>
                    {ans.anchors.janmaSign >= 0 && ans.anchors.janmaSign <= 11 && (
                      <div style={{ marginBottom: "0.1875rem" }}>{PM_YOUR_STAR[lang === "hi" ? "hi" : "en"]}: {PM_RASHIS[ans.anchors.janmaSign][lang === "hi" ? "hi" : "en"]}</div>
                    )}
                    <div>{personal.mode === "annotate"
                      ? PM_ANNOTATE_NOTE[lang === "hi" ? "hi" : "en"]
                      : PM_COUNT(personal.kept.length, scanValid.length)[lang === "hi" ? "hi" : "en"]}</div>
                    {personal.mode === "filter" && personal.setAside.length > 0 && (
                      <details style={{ marginTop: "0.25rem" }}>
                        <summary style={{ cursor: "pointer", color: C.muted, fontSize: "var(--font-label)" }}>
                          {lang === "hi" ? "टाले गए दिन देखें" : "See the days set aside"}
                        </summary>
                        {/* Every set-aside day is listed. This list exists to prove the filter
                            is not hiding days arbitrarily, so a silent cap would defeat its
                            only purpose — the count above must always match what renders. */}
                        <div style={{ marginTop: "0.25rem", maxHeight: "18rem", overflowY: "auto" }}>
                          {personal.setAside.map((r, i) => (
                            <div key={i} style={{ fontSize: "var(--font-label)", color: C.muted, lineHeight: 1.5 }}>
                              {dl(r)} — {(!r.fit.taraGood ? PM_SET_ASIDE_REASON.tara : PM_SET_ASIDE_REASON.chandra)[lang === "hi" ? "hi" : "en"]}
                            </div>
                          ))}
                        </div>
                      </details>
                    )}
                  </div>
                )}
                {samskaraSpec && <div style={{ marginTop: "0.5rem",padding: "0.5625rem 0.6875rem",borderRadius:T.rSm,background:profileReady?"var(--good-surface)":"var(--surface-hover)",border:`0.0625rem solid ${profileReady?"var(--good-surface)":C.line}`,fontSize: "var(--font-small)",lineHeight:1.5,color:profileReady?"var(--good)":C.gold }}>{profileReady ? (lang === "hi" ? "संस्कार-सन्दर्भ दर्ज है। नीचे का निर्णय पंचांग व संस्कार-विशिष्ट निषेध/लग्न-काल पर आधारित है।" : "Ceremony context recorded. The verdict below applies the Panchang and ceremony-specific exclusions/lagna windows.") : (lang === "hi" ? "सन्दर्भ अधूरा है। दिन देख सकते हैं, पर शिशु की जन्म-तिथि और संस्कार-विशिष्ट विकल्प भरकर कुलाचार से पुष्टि करें।" : "Context is incomplete. You can review dates, but add the birth date and ceremony-specific choice, then confirm family custom.")}</div>}
                {days.length === 0 ? (
                  <div style={{ fontSize: "var(--font-small)", color: C.muted, marginTop: "0.625rem", lineHeight: 1.6 }}>
                    <span style={{ color: C.sindoor, fontWeight: 600 }}>{lang === "hi" ? "इस अवधि में कोई शुभ मुहूर्त नहीं।" : "No auspicious muhurat in this range."}</span>
                    {whyList && <><br />{(lang === "hi" ? "अधिकांश दिन इन कारणों से टले: " : "Most days were skipped because of: ") + whyList + "."}</>}
                    <br />{(lang === "hi" ? "शुभ काल: " : "When it's possible: ") + MUHURTA_RULES[ans.category].monthsLabel[lang === "hi" ? "hi" : "en"] + ". " + (lang === "hi" ? "बड़ी अवधि आज़माएँ।" : "Try a wider range.")}
                  </div>
                ) : (
                  <>
                    {top && (
                      <div style={{ marginTop: "0.75rem", ...card, borderRadius: T.rSm, padding: "0.75rem 0.875rem", background: "var(--surface-raised)", border: `0.0938rem solid ${C.gold}` }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: T.s2, marginBottom: "0.1875rem" }}>
                          <div style={{ ...T.label, color: C.gold }}>{lang === "hi" ? "सर्वोत्तम दिन" : "Best day"}{pmBadges(top)}</div>
                          <ReadAloudButton
                            lang={lang === "hi" ? "hi" : "en"}
                            compact
                            label={lang === "hi" ? "🔊 सुनें" : "🔊 Listen"}
                            text={muhuratSpeech(lang === "hi" ? "hi" : "en", {
                              headline: lang === "hi"
                                ? `${catInfo.hi} के लिए सर्वोत्तम दिन ${dlFull(top)} है। निर्णय: ${qual(top.score).t}।`
                                : `The best day for ${catInfo.en} is ${dlFull(top)}. Verdict: ${qual(top.score).t}.`,
                              good: [
                                ...(top.samskaraWindows || []).slice(0, 3).map((w) => `${signName(lang, w.sign)} ${lang === "hi" ? "लग्न" : "Lagna"} ${fmtTime(w.start, top.tz)} – ${fmtTime(w.end, top.tz)}`),
                                ...(top.activityWindows || []).slice(0, 3).map((w) => `${w.kind === "panchaka-rahita" ? (lang === "hi" ? "पञ्चक रहित" : "Panchaka Rahita") : trN(lang, CHOG_NAME, w.key)} ${fmtTime(w.start, top.tz)} – ${fmtTime(w.end, top.tz)}`),
                              ],
                              avoid: (top.factors || []).filter((f) => !f.g).slice(0, 4).map((f) => (lang === "hi" ? f.hi : f.en)),
                              note: profileReady ? "" : (lang === "hi" ? "सन्दर्भ अधूरा है — कुलाचार से पुष्टि करें।" : "Context is incomplete — confirm with family custom."),
                            })}
                          />
                        </div>
                        <div style={{ fontFamily: "var(--font-display-family)", fontSize: "var(--font-heading)", color: C.ivory, lineHeight: 1.25 }}>{dlFull(top)}</div>
                        <div style={{ fontSize: "var(--font-label)", color: C.muted, margin: "0.1875rem 0 0.5rem" }}>
                          {(lang === "hi" ? (panchangTermAt("hi", "nakshatra", top.nak) || top.nakName) : top.nakName)} · {(lang === "hi" ? "तिथि " : "tithi ") + top.tithiNum}
                          <span style={{ marginLeft: "0.5rem", fontSize: "var(--font-label)", padding: "0.0625rem 0.5625rem", borderRadius: "0.625rem", background: `color-mix(in srgb, ${qual(top.score).c}, var(--surface-active) 88%)`, color: qual(top.score).c }}>{qual(top.score).t}</span>
                        </div>
                        <div style={{ fontSize: "var(--font-small)", color: C.ivory, marginBottom: "0.625rem", lineHeight: 1.5 }}>{(lang === "hi" ? "क्यों यह दिन: " : "Why this day: ") + (top.factors.filter((f) => f.g).map((f) => lang === "hi" ? f.hi : f.en).join(lang === "hi" ? ", " : ", ") || "—")}</div>
                        {showExpert && <div style={{ fontSize: "var(--font-small)", color: C.muted, marginBottom: "0.625rem", lineHeight: 1.5 }}>
                          <div><strong style={{ color: C.ivory }}>{lang === "hi" ? "पूरा गणना-आधार" : "Full scoring basis"}</strong></div>
                          <div>{(lang === "hi" ? "अंक: " : "Score: ") + top.score + " · " + (lang === "hi" ? "नक्षत्र " : "Nakshatra ") + top.nakName + " · " + (lang === "hi" ? "तिथि " : "tithi ") + top.tithiNum}</div>
                          {top.factors.filter((f) => !f.g).length > 0 && <div>{(lang === "hi" ? "प्रतिकूल कारक: " : "Adverse factors: ") + top.factors.filter((f) => !f.g).map((f) => lang === "hi" ? f.hi : f.en).join(", ")}</div>}
                          {whyList && <div>{(lang === "hi" ? "अन्य दिन इन कारणों से टले: " : "Other days were skipped because of: ") + whyList}</div>}
                          <div>{(lang === "hi" ? "गणना: लाहिरी अयनांश · स्थानीय सूर्योदय आधार · " : "Method: Lahiri ayanamsa · local sunrise basis · ") + (place?.label || "")}</div>
                        </div>}
                        {PURCHASE_ACTIONS[ans.category] && (()=>{const selected=PURCHASE_ACTIONS[ans.category].options.find((x)=>x.value===ans.action)||PURCHASE_ACTIONS[ans.category].options[0];return <div style={{fontSize: "var(--font-small)",color:C.gold,marginBottom: "0.625rem",lineHeight:1.5}}><strong>{selected[lang==="hi"?"hi":"en"]}:</strong> {selected.note[lang==="hi"?"hi":"en"]}</div>;})()}
                        {(top.samskaraWindows || []).length ? (
                          <>
                            <div style={{ ...T.label, color:"var(--good)", marginBottom: "0.3125rem" }}>{lang === "hi" ? "संस्कार के अनुकूल लग्न-काल" : "Ceremony-specific lagna windows"}</div>
                            <div style={{ display:"flex", flexDirection:"column", gap: "0.25rem", marginBottom: "0.5rem" }}>
                              {top.samskaraWindows.slice(0,6).map((w,i)=><div key={i} style={{ display:"flex", justifyContent:"space-between", gap: "0.625rem", fontSize: "var(--font-small)" }}><span style={{ color:"var(--good)" }}>✓ {signName(lang, w.sign)} {lang === "hi" ? "लग्न" : "Lagna"}</span><span style={{ color:C.ivory, fontVariantNumeric:"tabular-nums" }}>{fmtTime(w.start,top.tz)} – {fmtTime(w.end,top.tz)}</span></div>)}
                            </div>
                            <div style={{ fontSize: "var(--font-label)", color:C.muted, lineHeight:1.45 }}>{lang === "hi" ? "तिथि, नक्षत्र, वार और इस संस्कार के लग्न/कुण्डली नियम लागू हैं। पञ्चक दोष नीचे द्वितीयक सावधानी है।" : "Tithi, nakshatra, weekday and this Samskara's lagna/chart rules are applied. Panchaka dosha remains a secondary caution."}</div>
                          </>
                        ) : (top.activityWindows || []).length ? (
                          <>
                            <div style={{ ...T.label, color:"var(--good)", marginBottom: "0.3125rem" }}>{lang === "hi" ? "कार्य-विशिष्ट शुद्ध समय" : "Activity-specific clean windows"}</div>
                            <div style={{ display:"flex", flexDirection:"column", gap: "0.25rem", marginBottom: "0.5rem" }}>
                              {top.activityWindows.slice(0,6).map((w,i)=><div key={i} style={{ display:"flex", justifyContent:"space-between", gap: "0.625rem", fontSize: "var(--font-small)" }}><span style={{ color:"var(--good)" }}>✓ {w.kind === "panchaka-rahita" ? (lang === "hi" ? "पञ्चक रहित" : "Panchaka Rahita") : trN(lang, CHOG_NAME, w.key)}</span><span style={{ color:C.ivory, fontVariantNumeric:"tabular-nums" }}>{fmtTime(w.start,top.tz)} – {fmtTime(w.end,top.tz)}</span></div>)}
                            </div>
                            <div style={{ fontSize: "var(--font-label)", color:C.muted, lineHeight:1.45 }}>{lang === "hi" ? "ऊपर के समय इस कार्य की अलग छँटाई से निकले हैं; राहु/गुलिक/यमगण्ड हटाए गए हैं।" : "These windows come from this activity's own filter; Rahu, Gulika and Yamaganda are excluded."}</div>
                          </>
                        ) : finderTopPanchaka && (finderTopPanchaka.panchakaWindows || []).length ? (() => {
                          const ptz = finderTopPanchaka.tz;
                          const shubha = finderTopPanchaka.panchakaWindows.filter((w) => w.shubha);
                          const dosha = finderTopPanchaka.panchakaWindows.filter((w) => !w.shubha);
                          return (
                            <>
                              <div style={{ ...T.label, color: "var(--good)", marginBottom: "0.3125rem" }}>{lang === "hi" ? "पञ्चक रहित (शुभ) · लग्न आधारित" : "Panchaka Rahita (Shubha) · lagna-based"}</div>
                              {shubha.length ? (
                                <div style={{ display: "flex", flexDirection: "column", gap: "0.1875rem", marginBottom: "0.5rem" }}>
                                  {shubha.slice(0, 6).map((w, i) => (
                                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "var(--font-small)", fontVariantNumeric: "tabular-nums" }}>
                                      <span style={{ color: "var(--good)", fontWeight: 700 }}>✓</span>
                                      <span style={{ color: C.ivory }}>{fmtTime(w.start, ptz)} – {fmtTime(w.end, ptz)}</span>
                                    </div>
                                  ))}
                                </div>
                              ) : <div style={{ fontSize: "var(--font-label)", color: C.muted, fontStyle: "italic", marginBottom: "0.5rem" }}>{lang === "hi" ? "इस दिन कोई पूर्ण पञ्चक-रहित काल नहीं — अभिजित देखें" : "No fully-clear window this day — use Abhijit below"}</div>}
                              {top.abhijit && <div style={{ fontSize: "var(--font-label)", color: C.gold, fontVariantNumeric: "tabular-nums", marginBottom: "0.5rem" }}>{tr(lang, "abhijitL")}: {fmtTime(top.abhijit.start, top.tz)} – {fmtTime(top.abhijit.end, top.tz)}</div>}
                              {dosha.length > 0 && (<>
                                <div style={{ ...T.label, color: C.sindoor, marginBottom: "0.25rem" }}>{lang === "hi" ? "पञ्चक दोष · टालें" : "Panchaka dosha · avoid"}</div>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.1875rem 0.625rem", marginBottom: "0.3125rem" }}>
                                  {dosha.slice(0, 8).map((w, i) => <span key={i} style={{ fontSize: "var(--font-label)", color: C.sindoor, fontVariantNumeric: "tabular-nums" }}>{trN(lang, PANCHAKA_SHORT, w.type)} {fmtTime(w.start, ptz)}–{fmtTime(w.end, ptz)}</span>)}
                                </div>
                              </>)}
                              <div style={{ fontSize: "var(--font-label)", color: C.sindoor, fontVariantNumeric: "tabular-nums" }}>{tr(lang, "rahuL")} {fmtTime(top.rahu.start, top.tz)}–{fmtTime(top.rahu.end, top.tz)}</div>
                            </>
                          );
                        })() : (
                          <>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.25rem 0.625rem" }}>
                              {top.choghaDay.filter((c) => c.nat === "good").map((c, i) => <span key={i} style={{ fontSize: "var(--font-label)", color: "var(--good)", fontVariantNumeric: "tabular-nums" }}>{trN(lang, CHOG_NAME, c.key)} {fmtTime(c.start, top.tz)}–{fmtTime(c.end, top.tz)}</span>)}
                              {top.abhijit && <span style={{ fontSize: "var(--font-label)", color: C.gold, fontVariantNumeric: "tabular-nums" }}>{tr(lang, "abhijitL")} {fmtTime(top.abhijit.start, top.tz)}–{fmtTime(top.abhijit.end, top.tz)}</span>}
                            </div>
                            <div style={{ fontSize: "var(--font-label)", color: C.sindoor, marginTop: "0.375rem", fontVariantNumeric: "tabular-nums" }}>{tr(lang, "avoidWindows")}: {tr(lang, "rahuL")} {fmtTime(top.rahu.start, top.tz)}–{fmtTime(top.rahu.end, top.tz)}</div>
                          </>
                        )}
                        <MuhuratActions result={top} category={ans.category} categoryLabel={lang === "hi" ? catInfo.hi : catInfo.en} action={ans.action} actionLabel={PURCHASE_ACTIONS[ans.category]?.options.find((x)=>x.value===ans.action)?.[lang === "hi" ? "hi" : "en"]} from={ans.from} to={ans.to} place={place} lang={lang} onChangeCity={onChangeCity} C={C} />
                      </div>
                    )}
                    {days.length > 1 && (
                      <div style={{ marginTop: "0.75rem" }}>
                        <div style={{ ...T.label, color: C.muted, marginBottom: "0.375rem" }}>{(lang === "hi" ? "अन्य शुभ दिन" : "Other good days") + (allValid.length > 1 ? " · " + (allValid.length - 1) : "")}</div>
                        {days.slice(1).map((r, i) => { const Q = qual(r.score); return (
                          <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: "0.625rem", padding: "0.4375rem 0", borderBottom: "0.0625rem solid var(--line-soft)", alignItems: "baseline" }}>
                            <span style={{ minWidth: "5.75rem", fontFamily: "var(--font-display-family)", fontSize: "var(--font-small)", color: C.ivory }}>{dl(r)}</span>
                            <span style={{ fontSize: "var(--font-label)", padding: "0.0625rem 0.5625rem", borderRadius: "0.625rem", background: `color-mix(in srgb, ${Q.c}, var(--surface-active) 88%)`, color: Q.c, whiteSpace: "nowrap" }}>{Q.t}</span>
                            <span style={{ flex: 1, textAlign: "right", fontSize: "var(--font-label)", color: C.muted, lineHeight: 1.4 }}>{r.factors.filter((f) => f.g).map((f) => lang === "hi" ? f.hi : f.en).join(" · ") || "—"}</span>
                            {pmBadges(r)}
                          </div>
                        ); })}
                      </div>
                    )}
                    {personal && (
                      <div style={{ fontSize: "var(--font-label)", color: C.muted, marginTop: "0.5rem", lineHeight: 1.5 }}>{PM_RESULT_NOTE[lang === "hi" ? "hi" : "en"]}</div>
                    )}
                    <div style={{ fontSize: "var(--font-label)", color: C.muted, marginTop: "0.5rem", fontStyle: "italic" }}>{SAMSKARA_INPUTS[ans.category] ? (lang === "hi" ? "केवल मास, तिथि, नक्षत्र, वार और संस्कार-विशिष्ट लग्न/कुण्डली शुद्धि पर खरे दिन दिखाए गए हैं।" : "Only dates passing month, tithi, nakshatra, weekday and Samskara-specific lagna/chart screening are shown.") : (lang === "hi" ? "केवल इस कार्य की तिथि, नक्षत्र, वार और समय-खिड़की शुद्धि पर खरे दिन दिखाए गए हैं।" : "Only dates passing this activity's tithi, nakshatra, weekday and clean-window shuddhi are shown.")}</div>
                    {whyList && (
                      <div style={{ marginTop: "0.75rem", padding: "0.625rem 0.75rem", borderRadius: T.rMd, background: "var(--surface-raised)", border: `0.0625rem solid ${C.line}` }}>
                        <div style={{ ...T.label, color: C.muted, marginBottom: "0.25rem" }}>{lang === "hi" ? "अन्य दिन क्यों शामिल नहीं" : "Why other days weren't included"}</div>
                        <div style={{ fontSize: "var(--font-label)", color: C.ivory, lineHeight: 1.5 }}>{whyList}</div>
                      </div>
                    )}
                  </>
                )}
                <div style={{ fontSize: "var(--font-label)", color: C.muted, marginTop: "0.75rem", lineHeight: 1.5, fontStyle: "italic" }}>
                  {SAMSKARA_INPUTS[ans.category]
                    ? (lang === "hi" ? "दिन तिथि, नक्षत्र, वार व करण से चुने जाते हैं; संस्कार हेतु लग्न/कुण्डली शुद्धि भी लागू है।" : "Days are screened by tithi, nakshatra, weekday and karana; ceremony-specific lagna/chart screening is also applied.")
                    : (lang === "hi" ? "दिन तिथि, नक्षत्र, वार व करण से चुने जाते हैं; समय-काल चुने हुए कार्य की अलग शुद्धि से निकाले जाते हैं। विवाह जैसे बड़े कार्यों हेतु वर-वधू की कुंडली मिलान भी किसी आचार्य से कराएँ।" : "Days are screened by tithi, nakshatra, weekday and karana; the time windows use this activity's own clean-window rules. For weddings and other major events, also match the charts with a practitioner.")}
                </div>
              </div>
            );
          })()}
        </div>
        <div style={{ ...T.label, color: C.muted, textAlign: "center", margin: "0.125rem 0 0.875rem" }}>{lang === "hi" ? "— या आज का समय देखें —" : "— or check a time today —"}</div>
        <div style={{ fontSize: "var(--font-small)", color: C.muted, marginBottom: "0.625rem", lineHeight: 1.5 }}>{tr(lang, "finderHint")}</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem", marginBottom: "0.875rem" }}>
          {EVENTS.map((e) => (
            <button key={e.key} onClick={() => setEvKey(e.key)} style={{ padding: "0.4375rem 0.75rem", borderRadius: "0.5rem", fontFamily: "var(--font-display-family)", fontSize: "var(--font-small)", cursor: "pointer", border: `0.0625rem solid ${evKey === e.key ? C.gold : C.line}`, background: evKey === e.key ? "var(--accent-soft)" : "transparent", color: evKey === e.key ? C.gold : C.muted }}>{lang === "hi" ? e.hi : e.en}</button>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "0.875rem" }}>
          <div>
            <div style={{ ...T.label, color: "var(--good)", marginBottom: "0.375rem" }}>{tr(lang, "goodWindows")}</div>
            {goodSlots.length === 0 ? <div style={{ fontSize: "var(--font-small)", color: C.muted, fontStyle: "italic" }}>{lang === "hi" ? "आज इसके लिए और कोई शुभ समय नहीं — कल देखें।" : "No more good windows for this today — check tomorrow."}</div> :
              goodSlots.map((c, i) => (
                <div key={i} style={{ fontSize: "var(--font-small)", padding: "0.25rem 0", display: "flex", justifyContent: "space-between", gap: "0.5rem" }}>
                  <span style={{ color: C.ivory }}>{trN(lang, CHOG_NAME, c.key)}</span>
                  <span style={{ color: C.muted, fontVariantNumeric: "tabular-nums" }}>{fmtT(c.start)}–{fmtT(c.end)}</span>
                </div>
              ))}
            {todayP.abhijit && todayP.abhijit.end > nowMs && (
              <div style={{ fontSize: "var(--font-small)", padding: "0.25rem 0", display: "flex", justifyContent: "space-between", gap: "0.5rem" }}>
                <span style={{ color: C.gold }}>{tr(lang, "abhijitL")}</span>
                <span style={{ color: C.muted, fontVariantNumeric: "tabular-nums" }}>{fmtT(todayP.abhijit.start)}–{fmtT(todayP.abhijit.end)}</span>
              </div>
            )}
          </div>
          <div>
            <div style={{ ...T.label, color: C.sindoor, marginBottom: "0.375rem" }}>{tr(lang, "avoidWindows")}</div>
            {avoidSlots.map(([k, w], i) => (
              <div key={i} style={{ fontSize: "var(--font-small)", padding: "0.25rem 0", display: "flex", justifyContent: "space-between", gap: "0.5rem" }}>
                <span style={{ color: C.ivory }}>{tr(lang, k + "L")}</span>
                <span style={{ color: C.muted, fontVariantNumeric: "tabular-nums" }}>{fmtT(w.start)}–{fmtT(w.end)}</span>
              </div>
            ))}
          </div>
        </div>
        {evKey === "wedding" && <div style={{ fontSize: "var(--font-label)", color: C.muted, marginTop: "0.75rem", fontStyle: "italic", lineHeight: 1.5 }}>{lang === "hi" ? "विवाह का पूर्ण मुहूर्त तिथि, नक्षत्र व लग्न पर निर्भर — यह केवल दिन के शुभ समय दिखाता है।" : "A full wedding muhurat depends on tithi, nakshatra and lagna — this shows favourable times within the day only."}</div>}
      </div>

      <SeasonClockCard place={place} lang={lang} ayanamsa={ayanamsa} atMs={todayP.anchor} isToday={isToday} C={C} card={card} />

      <DailyWindowsCard data={todayP.dailyWindows} place={place} lang={lang} C={C} card={card} />

      {/* hora timeline (secondary) */}
      <SecHead deva="होरा" en="Planetary hours" />
      {/* Change 1 — the answer line: one plain-language sentence for the hora
          running right now, FIRST in the section, before the dial. See
          horaAnswerLine above for how each state (clear/partial/blocked/
          night/not-today/no-data) is built. */}
      <div style={{ ...card, padding: "0.75rem 0.875rem", marginBottom: "0.75rem" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", flexWrap: "wrap" }}>
          {horaAnswerLine.tone && (
            <Badge tone={horaAnswerLine.tone} density="compact">
              {lang === "hi" ? horaAnswerLine.badgeHi : horaAnswerLine.badgeEn}
            </Badge>
          )}
          <p style={{ margin: 0, flex: "1 1 12rem", fontSize: T.fBody, color: C.ivory, lineHeight: 1.4 }}>
            {lang === "hi" ? horaAnswerLine.hi : horaAnswerLine.en}
          </p>
        </div>
      </div>
      {/* today — hero */}
      {(() => {
        const rise = todayP.rise, set = todayP.set;
        const obs = observancesFor(todayP.krishna, todayP.tithiDay, ekadashiIdentityMonth(todayP.months, todayP.krishna), todayP.dow, todayP.anchor, calendarMode);
        const note = obs.length
          ? (isToday ? (lang === "hi" ? "आज " : "Today is ") : (lang === "hi" ? "इस तारीख़ को " : "This date is ")) + obsLabel(lang, obs[0]) + (obs[0].fasting ? (lang === "hi" ? " — व्रत का दिन" : " — a fasting day") : "")
          : panchangTerm(lang, "nakshatra", todayP.naks[0].name) + (lang === "hi" ? " नक्षत्र · " : " nakshatra · ") + panchangTerm(lang, "tithi", todayP.tithis[0].name);
        const E = todayP.elong != null ? todayP.elong : (todayP.tithiNum || 0) * 12;
        const k = (1 - Math.cos(E * Math.PI / 180)) / 2, waxing = E < 180, mR = 22, rx = (mR * Math.abs(2 * k - 1)).toFixed(1);
        const moonLit = waxing
          ? "M 0 " + (-mR) + " A " + mR + " " + mR + " 0 0 1 0 " + mR + " A " + rx + " " + mR + " 0 0 " + (k < 0.5 ? 1 : 0) + " 0 " + (-mR) + " Z"
          : "M 0 " + (-mR) + " A " + mR + " " + mR + " 0 0 0 0 " + mR + " A " + rx + " " + mR + " 0 0 " + (k < 0.5 ? 0 : 1) + " 0 " + (-mR) + " Z";
        const phNames = lang === "hi"
          ? ["अमावस्या", "वर्धमान चंद्र", "अष्टमी", "वर्धमान", "पूर्णिमा", "क्षीयमान", "अष्टमी", "क्षीयमान चंद्र"]
          : ["New moon", "Waxing crescent", "First quarter", "Waxing gibbous", "Full moon", "Waning gibbous", "Last quarter", "Waning crescent"];
        const phIdx = (E < 11.25 || E >= 348.75) ? 0 : E < 78.75 ? 1 : E < 101.25 ? 2 : E < 168.75 ? 3 : E < 191.25 ? 4 : E < 258.75 ? 5 : E < 281.25 ? 6 : 7;
        const head = (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.75rem", flexWrap: "wrap" }}>
            <div>
              <div style={{ fontFamily: "var(--font-display-family)", fontSize: "var(--font-heading)", color: C.ivory, lineHeight: 1.12 }}>{lang === "hi" ? new Date(todayP.anchor + tz * 3600000).toLocaleDateString("hi-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric", timeZone: "UTC" }) : todayP.dateLabel}</div>
              <div style={{ fontSize: "var(--font-small)", color: C.muted, marginTop: "0.125rem" }}>{panchangTerm(lang, "tithi", todayP.tithis[0].name)} · {panchangTerm(lang, "paksha", todayP.paksha)}</div>
            </div>
            {isToday ? pill(nowState === "good" ? tr(lang, "auspiciousNow") : nowState === "bad" ? tr(lang, "cautionNow") : tr(lang, "neutralNow"), nowState) : null}
          </div>
        );
        const moonRow = (
          <div style={{ padding: "0.75rem 1.25rem 0.9375rem", display: "flex", gap: "0.9375rem", alignItems: "center" }}>
            <svg viewBox="-26 -26 52 52" width="46" height="46" style={{ flexShrink: 0 }}>
              <circle cx="0" cy="0" r={mR} fill="var(--ink)" />
              <path d={moonLit} fill="var(--gold)" />
              <circle cx="0" cy="0" r={mR} fill="none" stroke="var(--line)" strokeWidth="0.75" />
            </svg>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: "var(--font-body)", color: C.ivory, lineHeight: 1.35 }}>{note}</div>
              <div style={{ fontSize: "var(--font-label)", color: C.muted, marginTop: "0.125rem" }}>{phNames[phIdx]}{todayP.abhijit ? " · " + tr(lang, "abhijitL") + " " + fmtT(todayP.abhijit.start) + "–" + fmtT(todayP.abhijit.end) : ""}</div>
            </div>
          </div>
        );
        if (rise == null || set == null) {
          return (<div className="rise" style={{ ...card, borderRadius: T.rLg, padding: 0, overflow: "hidden", borderTop: `0.1875rem solid ${natColor(nowState)}` }}>
            <div style={{ background: "linear-gradient(135deg, var(--surface-raised), var(--surface-sunken))", padding: "1rem 1.25rem" }}>{head}</div>{moonRow}</div>);
        }
        // Task 9: which period (day/night) is on screen, and the shared time
        // axis for it. Aliased from the top-level consts (see above the
        // askHora definition) so the render below and the telemetry effect
        // never compute two different answers for "what's the active hora".
        const activePeriod = activeHoraPeriod;
        const domainStart = horaDomainStart;
        const domainEnd = horaDomainEnd;
        const horas = activeHoras;
        const dayFrac = (ms) => domainEnd > domainStart ? Math.max(0, Math.min(1, (ms - domainStart) / (domainEnd - domainStart))) : 0;
        const AW = 320, AH = 240, cx = AW / 2, cy = AH - 60, R = 132;
        const arcPt = (f) => { const a = Math.PI - f * Math.PI; return [cx + R * Math.cos(a), cy - R * Math.sin(a)]; };
        const arcPoly = (f0, f1, n) => { const p = []; for (let i = 0; i <= n; i++) { const xy = arcPt(f0 + (f1 - f0) * i / n); p.push(xy[0].toFixed(1) + "," + xy[1].toFixed(1)); } return p.join(" "); };
        const seg = (w) => (w && w.end > domainStart && w.start < domainEnd) ? [dayFrac(w.start), dayFrac(w.end)] : null;
        const segPoly = (sv, color, w) => sv ? <polyline points={arcPoly(sv[0], sv[1], 16)} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" /> : null;
        const showNow = isToday && nowMs != null;
        const nowInDomain = horaNowInDomain;
        const sunXY = nowInDomain ? arcPt(dayFrac(nowMs)) : [0, 0];
        const radPt = (f, r) => { const a = Math.PI - f * Math.PI; return [cx + r * Math.cos(a), cy - r * Math.sin(a)]; };
        const curHoraIdx = curHoraDialIdx;
        const showHora = showHoraDialIdx;

        // Arc dragging: convert SVG mouse position to time
        const handleArcDrag = (evt) => {
          const svg = evt.currentTarget;
          const rect = svg.getBoundingClientRect();
          const x = evt.clientX - rect.left, y = evt.clientY - rect.top;
          // Convert to SVG coords (accounting for viewBox)
          const svgX = x * (AW / rect.width), svgY = y * (AH / rect.height);
          // Compute angle: atan2(cy - y, x - cx), then map to [0, 1] fraction
          const dx = svgX - cx, dy = cy - svgY;
          const angle = Math.atan2(dy, dx) / Math.PI; // [-1, 1]
          const frac = Math.max(0, Math.min(1, 1 - angle)); // map to [0,1] = domain start → domain end
          const ms = domainStart + frac * (domainEnd - domainStart);
          setDragMs(ms);
        };
        const handleArcLeave = () => setDragMs(null);

        // Compute auspiciousness and details at dragged time. Choghadiya is
        // period-aware — dragging the night dial must read choghaNight, not
        // the day segments, or the readout would silently show stale/no data.
        const activeChogha = activePeriod === "day" ? (todayP.choghaDay || []) : (todayP.choghaNight || []);
        const dragInfo = dragMs != null && dragMs >= domainStart && dragMs <= domainEnd ? (() => {
          const chog = activeChogha.find(c => dragMs >= c.start && dragMs < c.end) || null;
          const inRahu = todayP.rahu && dragMs >= todayP.rahu.start && dragMs < todayP.rahu.end;
          const inAbhijit = todayP.abhijit && dragMs >= todayP.abhijit.start && dragMs < todayP.abhijit.end;
          const isDangerous = inRahu || (chog && chog.nat === "bad");
          const isGood = inAbhijit || (chog && chog.nat === "good");
          return { time: dragMs, chog, inRahu, inAbhijit, isDangerous, isGood };
        })() : null;
        
return (

          <div className="rise" style={{ ...card, borderRadius: T.rLg, padding: 0, overflow: "hidden", borderTop: `0.1875rem solid ${natColor(nowState)}` }}>
            <div style={{ background: "linear-gradient(135deg, var(--surface-raised), var(--surface-sunken))", padding: "1rem 1.25rem 0.25rem" }}>
              {head}
              {(() => {
                const tabs = [
                  { key: "day", en: "Day", hi: "दिन" },
                  { key: "night", en: "Night", hi: "रात" },
                ];
                return (
                  <div role="tablist" aria-label={lang === "hi" ? "दिन या रात" : "Day or night"} style={{ display: "flex", gap: "0.375rem", margin: "0.375rem 0 0.5rem" }}>
                    {tabs.map((t) => (
                      <button key={t.key} type="button" role="tab" aria-selected={activePeriod === t.key}
                        onClick={() => setHoraPeriod(t.key)}
                        style={{ minHeight: T.ctrlH, padding: `0 ${T.s3}`, borderRadius: T.rPill, cursor: "pointer",
                          border: `0.0625rem solid ${activePeriod === t.key ? C.gold : C.line}`,
                          background: activePeriod === t.key ? "var(--accent-soft)" : "transparent",
                          color: activePeriod === t.key ? C.gold : C.muted, fontSize: T.fMicro }}>
                        {lang === "hi" ? t.hi : t.en}
                      </button>
                    ))}
                  </div>
                );
              })()}
              <svg role="img" aria-label={activePeriod === "day"
                  ? (lang === "hi" ? "आज दिन का होरा चक्र — सूर्योदय से सूर्यास्त तक प्रत्येक ग्रह की होरा; विवरण नीचे सूची में है।" : "Today's daytime planetary-hour dial — each hora from sunrise to sunset; the same information is listed below.")
                  : (lang === "hi" ? "आज रात का होरा चक्र — सूर्यास्त से अगले सूर्योदय तक प्रत्येक ग्रह की होरा; विवरण नीचे सूची में है।" : "Tonight's planetary-hour dial — each hora from sunset to the next sunrise; the same information is listed below.")}
                viewBox={"0 0 " + AW + " " + AH} style={{ width: "100%", maxWidth: 380, display: "block", margin: "2px auto 0", cursor: "crosshair" }} onMouseMove={handleArcDrag} onMouseLeave={handleArcLeave} onTouchMove={handleArcDrag} onTouchEnd={handleArcLeave}>
                <line x1="8" y1={cy} x2={AW - 8} y2={cy} stroke="var(--line)" strokeWidth="1" />
                {horas.map((h, i) => { const cur = curHoraIdx === i, sel = horaSel === i; const v = adjudicate({ start: h.start, end: h.end }, horaCtx); const tone = v.status === "blocked" ? "var(--bad)" : v.status === "partial" ? "var(--accent)" : v.grade === "good" ? "var(--good)" : v.grade === "bad" ? "var(--bad)" : "var(--muted)"; return (
                  <g key={i}>
                    <polyline points={arcPoly(i / 12, (i + 1) / 12, 8)} fill="none" stroke={HORA_COLOR[h.ruler]} strokeWidth={cur || sel ? 5.5 : 3} strokeOpacity={cur ? 1 : sel ? 0.85 : 0.36} strokeLinecap="butt" />
                    <polyline points={arcPoly(i / 12, (i + 1) / 12, 8)} fill="none" stroke={tone} strokeWidth="1.5" strokeOpacity="0.8" transform="translate(0,7)" />
                    <polyline points={arcPoly(i / 12, (i + 1) / 12, 8)} fill="none" stroke="transparent" strokeWidth="18" style={{ cursor: "pointer" }} onClick={() => setHoraSel(i)} />
                  </g>); })}
                {Array.from({ length: 13 }, (_, i) => {
                  const a = radPt(i / 12, R - 5), b = radPt(i / 12, R + 4);
                  // The first (i=0) and last (i=12) rim ticks mark the same two instants as
                  // the arrow-end labels drawn below (↑ start / end ↓) and were printing on
                  // top of them. Keep the tick mark for geometry but drop its text label —
                  // the 11 interior ticks are unaffected and the two end instants stay
                  // readable from the arrow labels.
                  const showTickLabel = i !== 0 && i !== 12;
                  const labelPt = radPt(i / 12, R + 16);
                  return <g key={i}><line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="var(--line)" strokeWidth="1" />{showTickLabel && (() => { const tm = domainStart + i * (domainEnd - domainStart) / 12; const timeLabel = fmtT(tm).replace(" AM", "a").replace(" PM", "p"); return <text x={labelPt[0]} y={labelPt[1]} textAnchor="middle" style={{ fontSize: 9.5, fill: C.muted, fontVariantNumeric: "tabular-nums" }}>{timeLabel}</text>; })()}</g>;
                })}
                {showHora != null && horas[showHora] && (() => { const g = radPt((showHora + 0.5) / 12, R - 16); return <text x={g[0]} y={g[1] + 4} textAnchor="middle" style={{ fontSize: 13, fontWeight: 700, fill: HORA_COLOR[horas[showHora].ruler] }}>{HORA_GLYPH[horas[showHora].ruler]}</text>; })()}
                {dragInfo ? (() => {
                  const dxy = arcPt(dayFrac(dragMs));
                  return <circle cx={dxy[0]} cy={dxy[1]} r="7" fill="none" stroke={dragInfo.isGood ? C.gold : dragInfo.isDangerous ? C.sindoor : C.muted} strokeWidth="2.5" opacity="0.7" />;
                })() : null}
                {nowInDomain
                  ? <g><circle cx={sunXY[0]} cy={sunXY[1]} r="11" fill={C.gold} opacity="0.22" style={{ animation: "softpulse 3s ease-in-out infinite" }} /><circle cx={sunXY[0]} cy={sunXY[1]} r="5" fill="var(--accent)" stroke="var(--on-accent)" strokeWidth="1.5" /></g>
                  : (showNow ? <text x={cx} y={cy - 10} textAnchor="middle" style={{ fontSize: 12, fill: C.muted }}>{horaAutoPeriod === "day" ? (lang === "hi" ? "दिन" : "day") : (lang === "hi" ? "रात्रि" : "night")}</text> : null)}
                <text x="10" y={cy - 6} style={{ fontSize: 10.5, fill: C.muted }}>{activePeriod === "day" ? "\u2191" : "\u2193"} {fmtT(domainStart)}</text>
                <text x={AW - 10} y={cy - 6} textAnchor="end" style={{ fontSize: 10.5, fill: C.muted }}>{fmtT(domainEnd)} {activePeriod === "day" ? "\u2193" : "\u2191"}</text>
              </svg>
              <TimingLanes
                domain={{ start: domainStart, end: domainEnd }}
                period={activePeriod}
                horas={horas}
                chogha={activeChogha}
                blockers={[["rahu", todayP.rahu], ["gulika", todayP.gulika], ["yama", todayP.yama]].filter(([, w]) => w).map(([key, w]) => ({ key, window: w }))}
                abhijit={todayP.abhijit || null}
                personal={horaAsc != null ? trikonaLords(horaAsc) : null}
                nowMs={isToday ? nowMs : null}
                lang={lang}
                onSelect={(w) => setHoraSel(horas.findIndex((h) => h.start === w.start))}
              />
              {dragInfo ? (
                <div style={{ display: "flex", alignItems: "center", gap: "0.4375rem", padding: "0.375rem 0.125rem 0.125rem", flexWrap: "wrap", justifyContent: "center", fontVariantNumeric: "tabular-nums" }}>
                  <span style={{ fontFamily: T.serif, fontSize: T.fSmall, color: dragInfo.isGood ? C.gold : dragInfo.isDangerous ? C.sindoor : C.muted }}>{dragInfo.isGood ? "✓ Auspicious" : dragInfo.isDangerous ? "✗ Inauspicious" : "○ Neutral"}</span>
                  <span style={{ fontSize: T.fMicro, color: C.muted }}>{fmtT(dragInfo.time)}</span>
                  {dragInfo.chog && <span style={{ fontSize: T.fMicro, color: C.muted }}>· {trN(lang, CHOG_NAME, dragInfo.chog.key)}</span>}
                  {dragInfo.inRahu && <span style={{ fontSize: T.fMicro, color: C.sindoor }}>· {tr(lang, "rahuL")}</span>}
                </div>
              ) : showHora != null && (
                <div style={{ display: "flex", alignItems: "center", gap: "0.4375rem", padding: "0.375rem 0.125rem 0.125rem", flexWrap: "wrap", justifyContent: "center", fontVariantNumeric: "tabular-nums" }}>
                  <span style={{ fontFamily: T.serif, fontSize: T.fSmall, color: HORA_COLOR[horas[showHora].ruler] }}>{HORA_GLYPH[horas[showHora].ruler]} {trN(lang, HORA_NAME, horas[showHora].ruler)} {lang === "hi" ? "होरा" : "hora"}</span>
                  <span style={{ fontSize: T.fMicro, color: C.muted }}>{fmtT(horas[showHora].start)}–{fmtT(horas[showHora].end)} · {trN(lang, HORA_NATURE, horas[showHora].ruler)}</span>
                  {(() => {
                    const v = adjudicate({ start: horas[showHora].start, end: horas[showHora].end }, horaCtx);
                    return (
                      <>
                        {v.gradeKey && <span style={{ fontSize: T.fMicro, color: C.muted }}> · {trN(lang, CHOG_NAME, v.gradeKey)}</span>}
                        {v.status === "blocked" && <span style={{ fontSize: T.fMicro, color: C.sindoor }}> · ⚠ {lang === "hi" ? "बाधित" : "blocked"}</span>}
                        {v.status === "partial" && (
                          <span style={{ fontSize: T.fMicro, color: C.gold }}>
                            {" "}· ! {lang === "hi" ? "आंशिक रूप से बाधित" : "Partly blocked"}
                            {v.usable[0] && <> · {lang === "hi" ? "प्रयोग करें " : "use "}{fmtT(v.usable[0].start)}–{fmtT(v.usable[0].end)}</>}
                          </span>
                        )}
                      </>
                    );
                  })()}
                  {horaSel != null && <button onClick={() => setHoraSel(null)} style={{ border: "none", background: "transparent", color: C.gold, cursor: "pointer", fontSize: T.fMicro, padding: "0 0.125rem" }} aria-label={lang === "hi" ? "हटाएँ" : "reset"}>✕</button>}
                </div>
              )}
            </div>
            {moonRow}
          </div>
        );
      })()}

      {/* hora advisor */}
      <div style={{ ...card, padding: "0.75rem 0.875rem", marginTop: "0.75rem" }}>
        <div style={{ ...T.label, color: C.muted, marginBottom: "0.25rem" }}>{lang === "hi" ? "होरा सलाह" : "Hora Advice"}</div>
        <div style={{ fontSize: T.fMicro, color: C.muted, marginBottom: "0.5rem" }}>{lang === "hi" ? "किसी कार्य के लिए शुभ होरा पूछें" : "Ask which hora suits an activity"}</div>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <input
            value={horaQuestion}
            onChange={(e) => setHoraQuestion(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") askHora(horaQuestion, "typed"); }}
            placeholder={lang === "hi" ? "जैसे: व्यापार के लिए कौन सी होरा?" : "e.g. best hora for business?"}
            style={{ flex: "1 1 180px", minWidth: "9.375rem", height: T.ctrlH, boxSizing: "border-box", padding: "0 0.75rem", borderRadius: T.rMd, border: `0.0625rem solid ${C.line}`, background: C.panel, color: C.ivory, fontFamily: T.body, fontSize: "var(--font-small)" }}
          />
          <button type="button" onClick={() => askHora(horaQuestion, "button")} style={{ height: T.ctrlH, boxSizing: "border-box", padding: "0 1.125rem", borderRadius: T.rMd, border: "none", background: "linear-gradient(180deg, var(--accent), var(--accent-strong))", color: "var(--on-accent)", cursor: "pointer", fontFamily: T.serif, fontSize: "var(--font-small)", fontWeight: 600 }}>
            {lang === "hi" ? "पूछें" : "Ask"}
          </button>
        </div>

        {!horaResult && (
          <div style={{ display: "flex", gap: "0.375rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
            {[{ en: "Best hora for business", hi: "व्यापार के लिए होरा" }, { en: "Hora for travel", hi: "यात्रा के लिए होरा" }, { en: "Good time to study", hi: "अध्ययन का समय" }, { en: "Buying gold", hi: "सोना खरीदना" }, { en: "Marriage hora", hi: "विवाह होरा" }].map((ex, i) => (
              <button key={i} type="button" onClick={() => { setHoraQuestion(ex.en); askHora(ex.en, "example"); }} style={{ minHeight: T.ctrlH, fontSize: T.fMicro, padding: `0 ${T.s3}`, borderRadius: T.rPill, border: `0.0625rem solid ${C.line}`, background: C.panel, color: C.muted, cursor: "pointer" }}>
                {ex[lang === "hi" ? "hi" : "en"]}
              </button>
            ))}
          </div>
        )}

        {horaResult && (() => {
          const LL = lang === "hi" ? "hi" : "en";
          if (horaResult.status === "timing") {
            const p = horaResult.planet;
            const wins = (todayP.rise != null && todayP.set != null) ? horaWindowsForPlanet(p, todayP.dow, todayP.rise, todayP.set, nextRise) : [];
            const rows = wins.map((w, i) => horaVerdictRow(w, i, p));
            const anyVisible = rows.some((r) => r !== null);
            return (
              <div style={{ marginTop: "0.625rem", padding: "0.625rem 0.75rem", background: "var(--surface-hover)", borderRadius: T.rMd, borderLeft: `0.1875rem solid ${HORA_COLOR[p]}` }}>
                <div style={{ fontSize: T.fBody, color: HORA_COLOR[p], fontWeight: 600, marginBottom: "0.4375rem" }}>{HORA_GLYPH[p]} {HORA_NAME[p][LL]} {lang === "hi" ? "होरा — आज" : "hora — today"}</div>
                {wins.length === 0 ? (
                  <div style={{ fontSize: T.fSmall, color: C.muted }}>{lang === "hi" ? "आज का समय उपलब्ध नहीं।" : "Times unavailable for today."}</div>
                ) : !anyVisible ? (
                  <>
                    <div style={{ fontSize: T.fSmall, color: C.muted }}>{lang === "hi" ? "आज की सभी अवधि राहु काल, गुलिक या यमगण्ड से बाधित हैं।" : "Every window today falls in Rahu Kaal, Gulika or Yamaganda."}</div>
                    {nextCleanBlock(p)}
                  </>
                ) : (
                  <>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.3125rem" }}>{rows}</div>
                    {nightApplicabilityNote(wins)}
                  </>
                )}
                <div style={{ fontSize: T.fMicro, color: C.muted, marginTop: "0.4375rem" }}>{lang === "hi" ? "उपयुक्त: " : "Good for: "}{HORA_NATURE[p][LL]}</div>
              </div>
            );
          }
          if (horaResult.status === "clarify") {
            const tree = horaResult.tree;
            return (
              <div style={{ marginTop: "0.625rem", padding: "0.625rem 0.75rem", background: "var(--surface-hover)", borderRadius: T.rMd, borderLeft: `0.1875rem solid ${C.gold}` }}>
                <div style={{ fontSize: T.fSmall, color: C.ivory, marginBottom: "0.5rem" }}>{tree.q[LL]}</div>
                <div style={{ display: "flex", gap: "0.375rem", flexWrap: "wrap" }}>
                  {tree.options.map((opt, i) => (
                    <button key={i} type="button" onClick={() => setHoraResult({ status: "answer", intent: horaResult.intent || "general", planets: opt.planets, act: opt.act })} style={{ minHeight: T.ctrlH, fontSize: T.fMicro, padding: `0 ${T.s3}`, borderRadius: T.rPill, border: `0.0625rem solid ${C.gold}`, background: C.panel, color: C.gold, cursor: "pointer", fontWeight: 500 }}>
                      {opt.label[LL]}
                    </button>
                  ))}
                </div>
              </div>
            );
          }
          if (horaResult.status === "unknown" || horaResult.status === "empty") {
            return (
              <div style={{ marginTop: "0.625rem", padding: "0.625rem 0.75rem", background: "rgba(140,129,118,.08)", borderRadius: T.rMd }}>
                <div style={{ fontSize: T.fSmall, color: C.muted, marginBottom: "0.5rem" }}>{lang === "hi" ? "इनमें से आज़माएँ:" : "Try one of these:"}</div>
                <div style={{ display: "flex", gap: "0.375rem", flexWrap: "wrap" }}>
                  {[{ en: "business", hi: "व्यापार" }, { en: "travel", hi: "यात्रा" }, { en: "marriage", hi: "विवाह" }, { en: "study", hi: "अध्ययन" }, { en: "property", hi: "संपत्ति" }, { en: "health", hi: "स्वास्थ्य" }, { en: "worship", hi: "पूजा" }].map((ex, i) => (
                    <button key={i} type="button" onClick={() => { setHoraQuestion(ex.en); askHora(ex.en, "retry"); }} style={{ minHeight: T.ctrlH, fontSize: T.fMicro, padding: `0 ${T.s3}`, borderRadius: T.rPill, border: `0.0625rem solid ${C.line}`, background: C.panel, color: C.muted, cursor: "pointer" }}>{ex[LL]}</button>
                  ))}
                </div>
              </div>
            );
          }
          const hr = horaResultText(horaResult, horaAsc);
          if (!hr) return null;
          return (
            <div style={{ marginTop: "0.625rem", padding: "0.625rem 0.75rem", background: "var(--surface-hover)", borderRadius: T.rMd, borderLeft: `0.1875rem solid ${C.gold}` }}>
              <div style={{ fontSize: T.fBody, color: C.ivory, marginBottom: hr.planets.length ? "0.5rem" : 0 }}>{hr.text[LL]}</div>
              {horaResult.conf === "medium" && (
                <div style={{ fontSize: T.fMicro, color: C.muted, marginTop: "0.25rem", marginBottom: "0.25rem", fontStyle: "italic" }}>
                  {lang === "hi" ? "सर्वोत्तम अनुमान — आपके प्रश्न से एक से अधिक कार्य मेल खाए।" : "Best guess — your question matched more than one activity."}
                </div>
              )}
              {hr.planets.length > 0 && (
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  {hr.planets.map((p) => (
                    <span key={p} style={{ fontSize: T.fMicro, padding: "0.25rem 0.5625rem", borderRadius: T.rSm, background: C.panel, color: HORA_COLOR[p], border: `0.0625rem solid ${HORA_COLOR[p]}`, fontWeight: 600 }}>{HORA_GLYPH[p]} {HORA_NAME[p][LL]}</span>
                  ))}
                </div>
              )}
              {horaResult.status === "answer" && horaResult.intent !== "avoid" && todayP.rise != null && todayP.set != null && (() => {
                // Finding 1: the answer names EVERY planet in hr.planets (e.g. "Venus &
                // Jupiter hora are favourable for marriage") but used to time only
                // hr.planets[0] — Jupiter would be named and never timed. Every named
                // planet now gets its own compact heading + window list below, reusing
                // horaVerdictRow (not a second renderer) for each. The "all blocked" line
                // further down is a fallback for a planet whose windows are all blocked,
                // but it cannot actually fire today: Rahu Kaal/Gulika/Yamaganda are
                // computed only as eighths of daylight (todayP.rise..todayP.set), so a
                // night window can never adjudicate "blocked", and horaWindowsForPlanet
                // always returns at least one night window per planet — so anyVisible
                // below can never be false. A planet never silently vanishes from the
                // list because a night row is always offered, not because of this
                // fallback; it stays in as cheap insurance should night belts ever be
                // added.
                const groups = hr.planets
                  .map((tp) => ({ tp, wins: horaWindowsForPlanet(tp, todayP.dow, todayP.rise, todayP.set, nextRise) }))
                  .filter((g) => g.wins.length > 0);
                if (!groups.length) return null;
                return (
                  <div style={{ marginTop: "0.5rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {groups.map((g) => {
                      const rows = g.wins.map((w, i) => horaVerdictRow(w, i, g.tp));
                      const anyVisible = rows.some((r) => r !== null);
                      return (
                        <div key={g.tp}>
                          <div style={{ fontSize: T.fMicro, color: HORA_COLOR[g.tp], fontWeight: 600, marginBottom: "0.3125rem" }}>{HORA_GLYPH[g.tp]} {HORA_NAME[g.tp][LL]} {lang === "hi" ? "होरा आज" : "hora today"}</div>
                          {anyVisible ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>{rows}</div>
                          ) : (
                            <div style={{ fontSize: T.fMicro, color: C.muted }}>{lang === "hi" ? "आज की सभी अवधि बाधित हैं।" : "Every window today is blocked."}</div>
                          )}
                          {!anyVisible && nextCleanBlock(g.tp)}
                        </div>
                      );
                    })}
                    {nightApplicabilityNote(groups.flatMap((g) => g.wins))}
                  </div>
                );
              })()}
              {horaResult.intent === "avoid" && hr.planets.length > 0 && todayP.rise != null && todayP.set != null && nextCleanBlock(hr.planets[0], hr.planets)}
              {hr.note && <div style={{ fontSize: T.fMicro, color: C.gold, marginTop: "0.5rem", lineHeight: 1.5 }}>★ {hr.note[LL]}</div>}
            </div>
          );
        })()}

        <label className="comfort-choice" style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: T.fMicro, color: C.muted }}>
          <input type="checkbox" checked={showBlockedHoras} onChange={(e) => setShowBlockedHoras(e.target.checked)} />
          {lang === "hi" ? "बाधित होरा भी दिखाएँ (ज्योतिषी दृश्य)" : "Show blocked horas too (practitioner view)"}
        </label>

        <div style={{ marginTop: "0.625rem", paddingTop: "0.625rem", borderTop: `0.0625rem solid ${C.line}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
            <span style={{ fontSize: T.fMicro, color: C.muted }}>{lang === "hi" ? "व्यक्तिगत सलाह — अपना लग्न:" : "Personalize — your ascendant:"}</span>
            <select value={horaAsc == null ? "" : horaAsc} onChange={(e) => setHoraAsc(e.target.value === "" ? null : parseInt(e.target.value))} style={{ minHeight: T.ctrlH, fontSize: T.fMicro, padding: `0 ${T.s2}`, borderRadius: T.rSm, border: `0.0625rem solid ${C.line}`, background: C.panel, color: C.ivory, fontFamily: T.body, maxWidth: "11.25rem" }}>
              <option value="">{lang === "hi" ? "— चुनें —" : "— none —"}</option>
              {SIGNS.map((sg, i) => <option key={i} value={i}>{signName(lang, i)}</option>)}
            </select>
          </div>
          <div style={{ fontSize: T.fMicro, color: C.muted, marginTop: "0.3125rem", fontStyle: "italic" }}>{lang === "hi" ? "लग्न नहीं पता? 'कुंडली' टैब में कुंडली बनाएँ।" : "Don't know it? Cast your chart in the Chart tab."}</div>
        </div>
      </div>

    </div>
  );
}

export { MuhuratHub };
