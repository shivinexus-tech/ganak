/* Muhurat hub UI — pure extraction (SPLIT-UI-03g). Wire deferred.
   Broad imports; unused ones are fine for now until wire trims. */

import React, { useState, useMemo, useEffect } from "react";
import { T } from "../components/tokens";
import { fmtTime, fmtTimeD, fmtDeg } from "../components/format";
import { tr, trN, obsLabel } from "../i18n";
import { L } from "../i18n";
import { CHOG_NAME, OBS_NAME, FEST_NAME, OBS_META, FEST_META } from "../data/festival-meta";
import { VRAT_VIDHI } from "../data/vrat-vidhis";
import VratVidhiCard from "../components/VratVidhiCard";
import {
  SIGNS, NAKSHATRAS, TITHIS, YOGAS, zoneOffset, sunEvents, moonEvents,
} from "../engine/panchang";
import {
  dayMuhurat, findMuhurat, muhuratForDate, muhuratScanRange, muhuratShuddhi,
  MUHURTA_RULES, vaishnavaEkadashi, vratDetail, NAK_HI, NAK_GOOD, dayScore,
} from "../engine/muhurat";
import { dayHoras, analyzeHora, horaResultText, HORA_GLYPH, HORA_COLOR, HORA_NAME, HORA_NATURE, HORA_PLANET_KEYS, horaDetectPlanet, horaIntent, HORA_CLARIFY, HORA_ACTIVITY_MAP, horaWindowsForPlanet } from "../engine/hora";
import { computeLagnaPanchaka, panchakaRem, PANCHAKA_TYPE } from "../engine/panchaka";
import { obsKind } from "../engine/festivals";
import { vaishnavaEkadashiDay } from "../engine/muhurat";
import { VIM_LORDS } from "../engine/dasha";
import { MUH_CATS, EVENTS, PANCHAKA_NAME, PANCHAKA_SHORT, PANCHAKA_GLOSS } from "../data/muhurat-ui";
import { ascendantAt } from "../engine/ephemeris";
import { ayanAt } from "../engine/panchang";
import { computeTodayPanchang } from "../engine/today-panchang";
import { searchUpcoming } from "../engine/search-upcoming";
import { planetGochar } from "../engine/gochar";
import { fmtDur, eventDetail } from "../engine/transit-copy";
import { observancesFor, scanPanchangCalendar, EKADASHI_NAMES, PRADOSH_NAMES_BY_DAY } from "../engine/festivals";

function MuhuratHub({ todayP, place, lang, ayanamsa = "lahiri", isToday = true, onCal = () => {}, C, card }) {
  const tz = todayP.tz;
  const nowMs = isToday ? Date.now() : null;
  const lp = useMemo(() => { try { return computeLagnaPanchaka(place, ayanamsa, todayP.anchor); } catch (e) { return { lagnaSchedule: [], panchakaWindows: [], tz }; } }, [place, ayanamsa, todayP.anchor, tz]);
  const curLagnaW = isToday && nowMs != null ? (lp.lagnaSchedule || []).find((w) => nowMs >= w.start && nowMs < w.end) : null;
  const curPanchW = isToday && nowMs != null ? (lp.panchakaWindows || []).find((w) => nowMs >= w.start && nowMs < w.end) : null;
  const [evKey, setEvKey] = useState("purchase");
  const [tab, setTab] = useState("fasting");
  const [fq, setFq] = useState("");
  const [fexp, setFexp] = useState(null);
  const fexpDetail = useMemo(() => { if (!fexp) return null; try { return vratDetail(place, ayanamsa, fexp.ms, fexp.timing); } catch (e) { return null; } }, [fexp, place, ayanamsa]);
  const [horaQuestion, setHoraQuestion] = useState("");
  const [horaResult, setHoraResult] = useState(null);
  const [horaAsc, setHoraAsc] = useState(null);
  const [horaSel, setHoraSel] = useState(null);
  const [showPanch, setShowPanch] = useState(false);
  const [dragMs, setDragMs] = useState(null);  // dragged time on arc
  const isoAtOffset = (days) => new Date(Date.now() + tz * 3600000 + days * 86400000).toISOString().slice(0, 10);
  const [mfCat, setMfCat] = useState(null);
  const [mfFrom, setMfFrom] = useState(isoAtOffset(0));
  const [mfTo, setMfTo] = useState(isoAtOffset(90));
  const [mfPreset, setMfPreset] = useState("90");
  const [mfErr, setMfErr] = useState(null);
  const [mfBusy, setMfBusy] = useState(false);
  const [ans, setAns] = useState(null);
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
        setAns({ category: cat, days: dd, from: fromIso || mfFrom, to: toIso || mfTo });
      } catch (e) {
        if (typeof console !== "undefined") console.error("muhurat scan failed:", e);
        setMfErr(lang === "hi" ? "गणना नहीं हो सकी — कृपया छोटी अवधि आज़माएँ या पुनः प्रयास करें।" : "Couldn't complete the search — try a shorter date range or try again.");
      } finally {
        setMfBusy(false);
      }
    }, 30);
  };
  const cal = useMemo(() => { try { return scanPanchangCalendar(todayP.anchor, tz, 400, 46, place); } catch (e) { return { fasts: [], festivals: [] }; } }, [todayP.anchor, tz, place]);
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
  const natColor = (nat) => nat === "good" ? "#1F7A4D" : nat === "bad" ? C.sindoor : C.gold;
  const inWin = (w) => isToday && w && nowMs >= w.start && nowMs < w.end;

  // current choghadiya + auspicious/avoid state right now
  const allChogha = [...(todayP.choghaDay || []), ...(todayP.choghaNight || [])];
  const curChogha = allChogha.find((c) => inWin(c));
  const inAvoid = inWin(todayP.rahu) || inWin(todayP.yama) || inWin(todayP.gulika);
  const inAbhijit = inWin(todayP.abhijit);
  const nowState = inAbhijit ? "good" : inAvoid ? "bad" : curChogha ? curChogha.nat : "neutral";

  const ev = EVENTS.find((e) => e.key === evKey);
  const goodSlots = allChogha.filter((c) => ev.good.includes(c.key) && c.end > nowMs).slice(0, 6);
  const avoidSlots = [["rahu", todayP.rahu], ["gulika", todayP.gulika], ["yama", todayP.yama]].filter(([, w]) => w && w.end > nowMs);

  const Row = ({ label, children, color }) => (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "7px 2px", borderBottom: "1px solid #F1EADA", fontSize: 13.5, alignItems: "baseline" }}>
      <span style={{ ...T.label, color: C.muted }}>{label}</span>
      <span style={{ textAlign: "right", color: color || C.ivory, fontVariantNumeric: "tabular-nums" }}>{children}</span>
    </div>
  );
  const pill = (txt, color) => <span style={{ fontSize: 11, padding: "2px 9px", borderRadius: 11, background: color + "20", color, fontFamily: "Eczar, serif" }}>{txt}</span>;
  const SecHead = ({ deva, en, right }) => (
    <div style={{ display: "flex", alignItems: "baseline", gap: T.s3, margin: `${T.s6}px 0 ${T.s3}px`, borderBottom: `1px solid ${C.line}`, paddingBottom: T.s2 }}>
      <span style={{ fontFamily: T.serif, color: C.gold, fontSize: T.fTitle }}>{deva}</span>
      <span style={{ ...T.label, color: C.muted }}>{en}</span>
      {right ? <span style={{ marginLeft: "auto" }}>{right}</span> : null}
    </div>
  );

  return (
    <div>
      {/* ===== TODAY SUMMARY (primary, plain-language) ===== */}
      {(() => {
        const p = todayP, DAY = 86400000, dayStart = p.anchor;
        const L2 = lang === "hi" ? "hi" : "en";
        const obs = observancesFor(p.krishna, p.tithiNum, null, p.dow);
        const OBS_GLOSS = { ekadashi: { en: "Fasting day for Vishnu", hi: "विष्णु का व्रत" }, purnima: { en: "Full moon", hi: "पूर्ण चंद्र" }, amavasya: { en: "New moon", hi: "नवचंद्र" }, pradosh: { en: "Evening fast for Shiva", hi: "शिव संध्या व्रत" }, sankashti: { en: "Fast for Ganesha", hi: "गणेश व्रत" }, masikShivaratri: { en: "Monthly Shivaratri", hi: "मासिक शिवरात्रि" }, kalashtami: { en: "Kala Bhairava day", hi: "काल भैरव दिवस" } };
        const fastObs = obs.find((o) => o.fasting) || obs[0];
        const nkIdx = NAKSHATRAS.indexOf(p.naks[0].name), nkLord = nkIdx >= 0 ? VIM_LORDS[nkIdx % 9] : null;
        const nextFast = (effFasts || []).find((f) => f.ms >= dayStart);
        const nextFest = (cal.festivals || []).find((f) => f.ms >= dayStart);
        const away = (ms) => { const d = Math.round((ms - dayStart) / DAY); return d <= 0 ? (lang === "hi" ? "आज" : "today") : d === 1 ? (lang === "hi" ? "कल" : "tomorrow") : (lang === "hi" ? d + " दिन में" : "in " + d + " days"); };
        const goodW = [["abhijit", p.abhijit]].filter((x) => x[1]);
        const avoidW = [["rahu", p.rahu], ["gulika", p.gulika], ["yama", p.yama]].filter((x) => x[1]);
        const winName = { abhijit: { en: "Abhijit Muhurat", hi: "अभिजित मुहूर्त" }, rahu: { en: "Rahu Kalam", hi: "राहु काल" }, gulika: { en: "Gulika Kalam", hi: "गुलिक काल" }, yama: { en: "Yamaganda", hi: "यमगण्ड" } };
        const dObj = new Date(dayStart + tz * 3600000);
        return (
          <div className="rise" style={{ ...card, padding: 0, overflow: "hidden", marginBottom: T.s4 }}>
            <div style={{ background: "linear-gradient(135deg, #FCF4E0, #F5E8CD)", padding: T.s4 + "px " + T.s5 + "px " + T.s3 + "px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, flexWrap: "wrap" }}>
                <div>
                  <div style={{ ...T.label, color: C.muted }}>{lang === "hi" ? "आज" : "Today"}</div>
                  <div style={{ fontFamily: T.serif, fontSize: T.fDisplay, color: C.ivory, lineHeight: 1.1 }}>{dObj.toLocaleDateString(L2 === "hi" ? "hi-IN" : "en-IN", { weekday: "long", timeZone: "UTC" })}</div>
                  <div style={{ fontSize: T.fSmall, color: C.muted, marginTop: 2 }}>{dObj.toLocaleDateString(L2 === "hi" ? "hi-IN" : "en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })}{p.months ? " · " + p.months.amanta : ""}</div>
                </div>
                {isToday && <span style={{ fontSize: T.fSmall, padding: "5px 12px", borderRadius: T.rPill, background: natColor(nowState) + "1F", color: natColor(nowState), fontFamily: T.serif, fontWeight: 600, whiteSpace: "nowrap" }}>{nowState === "good" ? tr(lang, "auspiciousNow") : nowState === "bad" ? tr(lang, "cautionNow") : tr(lang, "neutralNow")}</span>}
              </div>
            </div>
            <div style={{ padding: T.s3 + "px " + T.s5 + "px", borderTop: "1px solid " + C.line }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 }}>
                <span style={{ fontFamily: T.serif, fontSize: T.fHeading, color: C.gold }}>{p.tithis[0].name}</span>
                <span style={{ fontSize: T.fMicro, color: C.muted, fontVariantNumeric: "tabular-nums" }}>{p.tithis[0].end ? (lang === "hi" ? "तक " : "till ") + fmtT(p.tithis[0].end) : ""}</span>
              </div>
              <div style={{ fontSize: T.fSmall, color: C.muted, marginTop: 2 }}>{p.paksha} · {lang === "hi" ? (p.krishna ? "कृष्ण (क्षीयमान)" : "शुक्ल (वर्धमान)") : (p.krishna ? "waning moon" : "waxing moon")} · {lang === "hi" ? "चंद्र दिवस " + p.tithiNum : "lunar day " + p.tithiNum}</div>
              {obs.length > 0 && <div style={{ marginTop: 8, display: "inline-flex", alignItems: "center", gap: 7, padding: "5px 11px", borderRadius: T.rMd, background: fastObs.fasting ? "rgba(194,69,30,.08)" : "rgba(168,106,18,.08)", border: "1px solid " + (fastObs.fasting ? C.sindoor : C.gold) + "33" }}>
                <span style={{ fontSize: T.fSmall, fontWeight: 600, color: fastObs.fasting ? C.sindoor : C.gold }}>{obsLabel(lang, fastObs)}</span>
                {OBS_GLOSS[fastObs.baseKey || fastObs.key] && <span style={{ fontSize: T.fMicro, color: C.muted }}>· {OBS_GLOSS[fastObs.baseKey || fastObs.key][L2]}</span>}
              </div>}
              {p.pitruPaksha && (() => {
                const pp = p.pitruPaksha;
                const SP = { mahalaya: { en: "Sarva Pitru Amavasya (Mahalaya)", hi: "सर्वपितृ अमावस्या (महालय)" }, purnimaShraddha: { en: "Purnima Shraddha — Pitru Paksha begins", hi: "पूर्णिमा श्राद्ध — पितृ पक्ष आरंभ" }, avidhavaNavami: { en: "Avidhava Navami", hi: "अविधवा नवमी" }, ghataChaturdashi: { en: "Ghata Chaturdashi", hi: "घट चतुर्दशी" } };
                const tithiName = pp.krishna ? (TITHIS[(pp.shraddhaTithi - 1) % 14] || "") : "Purnima";
                const label = pp.special ? SP[pp.special][L2] : (lang === "hi" ? tithiName + " श्राद्ध" : tithiName + " Shraddha");
                return (
                  <div style={{ marginTop: 8, padding: "7px 11px", borderRadius: T.rMd, background: "rgba(120,90,60,.07)", border: "1px solid " + C.line }}>
                    <div style={{ fontSize: T.fSmall, fontWeight: 600, color: C.ivory }}>{lang === "hi" ? "पितृ पक्ष · " : "Pitru Paksha · "}{label}</div>
                    <div style={{ fontSize: T.fMicro, color: C.muted, marginTop: 2 }}>{lang === "hi" ? "श्राद्ध व तर्पण का पक्ष — विवाह, गृह प्रवेश आदि शुभ कार्य वर्जित" : "Fortnight for shraddha & tarpan — weddings, housewarming & other auspicious work are avoided"}</div>
                  </div>
                );
              })()}
              {p.ayyappaMandala && (() => {
                const av = p.ayyappaMandala, finalDay = av.day === 41;
                return (
                  <div style={{ marginTop: 8, padding: "7px 11px", borderRadius: T.rMd, background: "rgba(194,69,30,.06)", border: "1px solid rgba(194,69,30,.2)" }}>
                    <div style={{ fontSize: T.fSmall, fontWeight: 600, color: C.ivory }}>
                      {lang === "hi" ? `अय्यप्पा मंडल व्रतम · 41 में से दिन ${av.day}` : `Ayyappa Mandala Vratham · day ${av.day} of 41`}
                      {finalDay ? (lang === "hi" ? " · मंडल पूजा" : " · Mandala Pooja") : ""}
                    </div>
                    <div style={{ fontSize: T.fMicro, color: C.muted, marginTop: 2 }}>
                      {lang === "hi" ? "सरल सात्त्विक जीवन, दैनिक प्रार्थना व संयम — विस्तृत नियम गुरु स्वामी या मंदिर परंपरा से लें" : "Simple sattvic living, daily prayer and restraint — follow a Guru Swami or temple tradition for the full discipline"}
                    </div>
                  </div>
                );
              })()}
            </div>
            <div style={{ padding: T.s3 + "px " + T.s5 + "px", borderTop: "1px solid " + C.line }}>
              <div style={{ ...T.label, color: C.muted, marginBottom: 7 }}>{lang === "hi" ? "आज के शुभ व अशुभ समय" : "Good & avoid times today"}</div>
              {goodW.map((x) => <div key={x[0]} style={{ display: "flex", alignItems: "center", gap: 8, padding: "3px 0", fontVariantNumeric: "tabular-nums" }}>
                <span style={{ color: "#1F7A4D", fontSize: T.fSmall, fontWeight: 700 }}>✓</span>
                <span style={{ flex: 1, fontSize: T.fSmall, color: C.ivory }}>{winName[x[0]][L2]}</span>
                <span style={{ fontSize: T.fSmall, color: C.muted }}>{fmtT(x[1].start)}–{fmtT(x[1].end)}</span>
              </div>)}
              {avoidW.map((x) => <div key={x[0]} style={{ display: "flex", alignItems: "center", gap: 8, padding: "3px 0", fontVariantNumeric: "tabular-nums" }}>
                <span style={{ color: C.sindoor, fontSize: T.fSmall, fontWeight: 700 }}>✗</span>
                <span style={{ flex: 1, fontSize: T.fSmall, color: C.ivory }}>{winName[x[0]][L2]}</span>
                <span style={{ fontSize: T.fSmall, color: C.muted }}>{fmtT(x[1].start)}–{fmtT(x[1].end)}</span>
              </div>)}
              {isToday && curChogha && <div style={{ fontSize: T.fMicro, color: C.muted, marginTop: 6 }}>{lang === "hi" ? "अभी चौघड़िया: " : "Now: "}<span style={{ color: natColor(curChogha.nat), fontWeight: 600 }}>{trN(lang, CHOG_NAME, curChogha.key)}</span></div>}
              {isToday && curLagnaW && <div style={{ fontSize: T.fMicro, color: C.muted, marginTop: 4 }}>{lang === "hi" ? "उदय लग्न: " : "Udaya Lagna: "}<span style={{ color: C.ivory }}>{SIGNS[curLagnaW.sign]}</span>{curPanchW && <> · {lang === "hi" ? "पञ्चक: " : "Panchaka: "}<span style={{ color: curPanchW.shubha ? "#1F7A4D" : C.sindoor, fontWeight: 600 }}>{trN(lang, PANCHAKA_NAME, curPanchW.type)}{curPanchW.shubha ? " ✓" : " ✗"}</span></>}</div>}
            </div>
            <div style={{ padding: T.s3 + "px " + T.s5 + "px", borderTop: "1px solid " + C.line, display: "flex", flexWrap: "wrap", gap: "6px " + T.s5 + "px" }}>
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
                <div style={{ fontSize: T.fSmall, color: C.ivory }}>{p.naks[0].name}{nkLord ? " · " + (lang === "hi" ? "स्वामी " : "ruler ") + trN(lang, HORA_NAME, nkLord) : ""}{p.naks[0].end ? " · " + (lang === "hi" ? "तक " : "till ") + fmtT(p.naks[0].end) : ""}</div>
              </div>
            </div>
            {(nextFast || nextFest) && <div style={{ padding: T.s3 + "px " + T.s5 + "px", borderTop: "1px solid " + C.line, background: "rgba(168,106,18,.04)" }}>
              <div style={{ ...T.label, color: C.muted, marginBottom: 6 }}>{lang === "hi" ? "आगामी" : "Coming up"}</div>
              {nextFast && <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "2px 0" }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: C.sindoor, flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: T.fSmall, color: C.ivory }}>{obsLabel(lang, { key: nextFast.key, baseKey: nextFast.key })}</span>
                <span style={{ fontSize: T.fMicro, color: C.gold, fontWeight: 600 }}>{away(nextFast.ms)}</span>
              </div>}
              {nextFest && <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "2px 0" }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: C.gold, flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: T.fSmall, color: C.ivory }}>{trN(lang, FEST_NAME, nextFest.key)}</span>
                <span style={{ fontSize: T.fMicro, color: C.gold, fontWeight: 600 }}>{away(nextFest.ms)}</span>
              </div>}
            </div>}
            <button type="button" onClick={() => setShowPanch((v) => !v)} style={{ width: "100%", padding: "11px", border: "none", borderTop: "1px solid " + C.line, background: "transparent", color: C.gold, cursor: "pointer", fontFamily: T.serif, fontSize: T.fSmall, fontWeight: 500 }}>
              {showPanch ? (lang === "hi" ? "पंचांग छिपाएँ ▴" : "Hide full panchang ▴") : (lang === "hi" ? "पूरा पंचांग देखें ▾" : "View full panchang ▾")}
            </button>
          </div>
        );
      })()}

      {showPanch && todayP && (() => {
        const P = todayP, ptz = P.tz, A = P.anchor;
        const upto = (name, end) => <>{name} <span style={{ color: C.muted }}>upto</span> <span style={{ color: C.gold }}>{fmtTimeD(end, ptz, A)}</span></>;
        const multi = (entries) => (
          <span style={{ display: "inline-flex", flexDirection: "column", gap: 3, alignItems: "flex-end" }}>
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
        rows.push(["Paksha", P.paksha]);
        rows.push(["Weekday", P.vara]);
        rows.push(["Amanta Month", P.months.amanta]);
        rows.push(["Purnimanta Month", P.months.purnimanta]);
        rows.push(["Moonsign", P.moonSignEnd ? upto(P.moonSign, P.moonSignEnd) : P.moonSign]);
        rows.push(["Sunsign", P.sunSign]);
        rows.push([lang === "hi" ? "प्रविष्टे (सौर मास में बीते दिन)" : "Pravishte (days into the solar month)", String(P.pravishte)]);
        rows.push([lang === "hi" ? "शक संवत् (राष्ट्रीय पंचांग वर्ष)" : "Shaka Samvat (national calendar year)", P.samvat.shaka]);
        rows.push([lang === "hi" ? "विक्रम संवत् (उत्तर भारतीय पंचांग वर्ष)" : "Vikram Samvat (north Indian calendar year)", P.samvat.vikram]);
        rows.push([lang === "hi" ? "गुजराती संवत् (गुजराती पंचांग वर्ष)" : "Gujarati Samvat (Gujarati calendar year)", P.samvat.guj]);
        rows.push(["Abhijit Muhurat", P.abhijit ? span2(P.abhijit, C.gold) : <span style={{ color: C.muted }}>None — avoided on Budhavara</span>]);
        rows.push(["Rahu Kalam", span2(P.rahu, C.sindoor)]);
        rows.push(["Gulikai Kalam", span2(P.gulika, C.sindoor)]);
        rows.push(["Yamaganda", span2(P.yama, C.sindoor)]);
        return (
          <>
          <div className="rise" style={{ ...card, padding: "18px 20px", marginBottom: T.s4 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: T.s3, marginBottom: 10, borderBottom: `1px solid ${C.line}`, paddingBottom: T.s3 }}>
              <span style={{ fontFamily: T.serif, color: C.gold, fontSize: T.fHeading }}>विस्तृत पञ्चाङ्ग</span>
              <span style={{ ...T.label, color: C.muted }}>Full panchang</span>
            </div>
            <div style={{ marginBottom: 14 }}>
              <span style={{ fontFamily: T.serif, fontSize: 16, color: C.gold }}>{P.dateLabel}</span>
              {place && place.label ? <span style={{ fontSize: 13, color: C.muted }}> · {place.label}</span> : null}
            </div>
            <div style={{ borderTop: `1px solid ${C.line}` }}>
              {rows.map(([k, v], idx) => (
                <div key={k + idx} style={{ display: "flex", justifyContent: "space-between", gap: 14, padding: "8px 2px", borderBottom: `1px solid #F1EADA`, fontSize: 14, alignItems: "baseline" }}>
                  <span style={{ color: C.muted, whiteSpace: "nowrap" }}>{k}</span>
                  <span style={{ textAlign: "right", overflowWrap: "anywhere" }}>{v}</span>
                </div>
              ))}
            </div>
            <p style={{ color: C.muted, fontSize: 11.5, margin: "12px 0 0" }}>Panchang day reckoned from local sunrise · times accurate to ±3 minutes</p>
          </div>

          <div className="rise" style={{ ...card, padding: "16px 20px", marginBottom: T.s4 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: T.s3, marginBottom: 8, borderBottom: `1px solid ${C.line}`, paddingBottom: T.s3 }}>
              <span style={{ fontFamily: T.serif, color: C.gold, fontSize: T.fHeading }}>चौघड़िया</span>
              <span style={{ ...T.label, color: C.muted }}>Choghadiya</span>
            </div>
            <div style={{ fontSize: T.fMicro, color: C.muted, marginBottom: 8 }}>{lang === "hi" ? "घंटे-दर-घंटे शुभ/अशुभ समय" : "Hour-by-hour good & avoid times"}</div>
            {[["dayChogha", todayP.choghaDay], ["nightChogha", todayP.choghaNight]].map(([lbl, slots]) => slots && (
              <div key={lbl} style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 12, color: C.muted, marginBottom: 5 }}>{tr(lang, lbl)}</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(108px, 1fr))", gap: 6 }}>
                  {slots.map((c, i) => {
                    const live = inWin(c);
                    return (
                      <div key={i} style={{ ...card, borderRadius: T.rSm, padding: "8px 10px", borderLeft: `3px solid ${natColor(c.nat)}`, background: live ? natColor(c.nat) + "12" : undefined }}>
                        <div style={{ fontFamily: "Eczar, serif", fontSize: 13.5, color: natColor(c.nat) }}>{trN(lang, CHOG_NAME, c.key)}{live && " ●"}</div>
                        <div style={{ fontSize: 10.5, color: C.muted, fontVariantNumeric: "tabular-nums" }}>{fmtT(c.start)}–{fmtT(c.end)}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <div className="rise" style={{ ...card, padding: "16px 20px", marginBottom: T.s4 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: T.s3, marginBottom: 6, borderBottom: `1px solid ${C.line}`, paddingBottom: T.s3 }}>
              <span style={{ fontFamily: T.serif, color: C.gold, fontSize: T.fHeading }}>उदय लग्न</span>
              <span style={{ ...T.label, color: C.muted }}>Udaya Lagna</span>
            </div>
            <div style={{ fontSize: T.fMicro, color: C.muted, marginBottom: 8 }}>{lang === "hi" ? "सूर्योदय से अगले सूर्योदय तक प्रत्येक राशि का उदयकाल" : "Each rising sign, sunrise to next sunrise"}</div>
            {(lp.lagnaSchedule || []).map((w, i) => {
              const live = isToday && nowMs != null && nowMs >= w.start && nowMs < w.end;
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 2px", borderBottom: "1px solid #F1EADA", flexWrap: "wrap", background: live ? "rgba(168,106,18,.06)" : undefined }}>
                  <span style={{ flex: "1 1 auto", fontFamily: T.serif, fontSize: 14.5, color: C.ivory }}>{SIGNS[w.sign]}{live ? " ●" : ""}</span>
                  <span style={{ fontSize: T.fSmall, color: C.muted, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>{fmtTime(w.start, lp.tz)} – {fmtTime(w.end, lp.tz)}</span>
                  <span style={{ flex: "0 0 66px", textAlign: "right", fontSize: T.fMicro, fontWeight: 600, color: w.shubha ? "#1F7A4D" : C.sindoor }}>{trN(lang, PANCHAKA_SHORT, w.type)}</span>
                </div>
              );
            })}
          </div>

          <div className="rise" style={{ ...card, padding: "16px 20px", marginBottom: T.s4 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: T.s3, marginBottom: 6, borderBottom: `1px solid ${C.line}`, paddingBottom: T.s3 }}>
              <span style={{ fontFamily: T.serif, color: C.gold, fontSize: T.fHeading }}>पञ्चक रहित मुहूर्त</span>
              <span style={{ ...T.label, color: C.muted }}>Panchaka Rahita</span>
            </div>
            <div style={{ fontSize: T.fMicro, color: C.muted, marginBottom: 8 }}>{lang === "hi" ? "शुभ (दोषरहित) व पञ्चक-दोष काल" : "Auspicious (blemish-free) vs Panchaka-dosha windows"}</div>
            {(lp.panchakaWindows || []).map((w, i) => {
              const live = isToday && nowMs != null && nowMs >= w.start && nowMs < w.end;
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 9, padding: "8px 2px", borderBottom: "1px solid #F1EADA", background: live ? "rgba(168,106,18,.06)" : undefined }}>
                  <span style={{ flexShrink: 0, width: 7, height: 7, borderRadius: "50%", background: w.shubha ? "#1F7A4D" : C.sindoor }} />
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: T.fSmall, color: w.shubha ? "#1F7A4D" : C.sindoor, fontWeight: 600 }}>{trN(lang, PANCHAKA_NAME, w.type)}</span>
                    {live && <span style={{ fontSize: T.fMicro, color: C.gold }}> ● {lang === "hi" ? "अभी" : "now"}</span>}
                    <span style={{ display: "block", fontSize: T.fMicro, color: C.muted }}>{trN(lang, PANCHAKA_GLOSS, w.type)}</span>
                  </span>
                  <span style={{ fontSize: T.fSmall, color: C.muted, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>{fmtTime(w.start, lp.tz)} – {fmtTime(w.end, lp.tz)}</span>
                </div>
              );
            })}
            <p style={{ color: C.muted, fontSize: T.fMicro, margin: "10px 0 0", lineHeight: 1.5, fontStyle: "italic" }}>{lang === "hi" ? "विवाह, गृहप्रवेश आदि हेतु शुभ (पञ्चक रहित) काल चुनें।" : "For marriage, housewarming etc., choose Shubha (Rahita) windows."}</p>
          </div>
          </>
        );
      })()}

      {/* festivals & fasting */}
      <SecHead deva="व्रत एवं पर्व" en="Fasts & festivals" right={tab === "fasting" ? (
        <span style={{ display: "inline-flex", gap: 4 }}>
          {[["smarta", lang === "hi" ? "स्मार्त" : "Smarta"], ["vaishnava", "ISKCON"]].map(([v, l]) => (
            <button key={v} onClick={() => { chooseTrad(v); setFexp(null); }} style={{ fontSize: T.fMicro, padding: "3px 9px", borderRadius: T.rPill, border: `1px solid ${trad === v ? C.gold : C.line}`, background: trad === v ? "rgba(168,106,18,.1)" : "transparent", color: trad === v ? C.gold : C.muted, cursor: "pointer" }}>{l}</button>
          ))}
        </span>
      ) : null} />
      <div style={{ ...card, padding: 0, overflow: "hidden" }}>
        <div style={{ display: "flex", gap: 6, padding: "10px 12px 6px" }}>
          {[["fasting", "fastingTab"], ["festival", "festivalTab"]].map(([k, lbl]) => (
            <button key={k} onClick={() => { setTab(k); setFexp(null); }} style={{ padding: "6px 14px", borderRadius: T.rPill, fontFamily: "Eczar, serif", fontSize: 13, cursor: "pointer", border: `1px solid ${tab === k ? C.gold : "transparent"}`, background: tab === k ? "rgba(168,106,18,.1)" : "transparent", color: tab === k ? C.gold : C.muted }}>{tr(lang, lbl)}</button>
          ))}
        </div>
        {tab === "fasting" && trad === "vaishnava" && (
          <div style={{ fontSize: 11.5, color: C.muted, padding: "0 12px 8px", fontStyle: "italic", lineHeight: 1.45 }}>
            {lang === "hi" ? "ISKCON (वैष्णव) तिथियों में कुछ एकादशी व्रत एक दिन बाद पड़ सकते हैं।" : "ISKCON (Vaishnava) dates may fall a day later for some Ekadashi fasts."}
          </div>
        )}
        {(() => {
          const items = (tab === "fasting" ? effFasts : cal.festivals).slice(0, 10);
          if (!items.length) return <div style={{ padding: "12px", fontSize: 12.5, color: C.muted, fontStyle: "italic" }}>{tr(lang, "noneToday")}</div>;
          const LL = lang === "hi" ? "hi" : "en";
          const DAY = 86400000;
          const away = (ms) => { const dd = Math.round((ms - todayP.anchor) / DAY); return dd <= 0 ? (lang === "hi" ? "आज" : "today") : (lang === "hi" ? dd + " दिन" : dd + "d"); };
          const monthLbl = (ms) => new Date(ms + tz * 3600000).toLocaleDateString(lang === "hi" ? "hi-IN" : "en-IN", { month: "long", timeZone: "UTC" });
          let lastMonth = null;
          return items.map((it) => {
            const kind = tab === "fasting" ? obsKind(it.key) : it.key;
            const meta = tab === "fasting" ? OBS_META[kind] : FEST_META[it.key];
            const name = tab === "fasting" ? obsLabel(lang, { key: it.key, baseKey: kind, isVariant: it.key !== kind }) : trN(lang, FEST_NAME, it.key);
            const mLbl = monthLbl(it.ms);
            const header = mLbl !== lastMonth ? <div style={{ ...T.label, color: C.muted, padding: "12px 12px 2px" }}>{mLbl}</div> : null;
            lastMonth = mLbl;
            const id = tab + ":" + it.key + ":" + it.ms;
            const open = fexp && fexp.id === id;
            return (
              <div key={id}>
                {header}
                <div style={{ borderTop: "1px solid #F3ECDC", background: open ? "rgba(168,106,18,.05)" : undefined }}>
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => setFexp(open ? null : { id, ms: it.ms, timing: meta ? meta.timing : null, shifted: it.shifted, reason: it.reason })}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setFexp(open ? null : { id, ms: it.ms, timing: meta ? meta.timing : null, shifted: it.shifted, reason: it.reason }); } }}
                    style={{ cursor: "pointer", padding: "10px 12px", display: "flex", justifyContent: "space-between", gap: 10, alignItems: "baseline" }}
                  >
                    <span style={{ fontSize: 14, color: C.ivory, flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</span>
                    <span style={{ flexShrink: 0, fontSize: 12.5, color: C.muted, fontVariantNumeric: "tabular-nums" }}><span style={{ color: C.gold }}>{fmtDay(it.ms)}</span> · {away(it.ms)}</span>
                  </div>
                  {open && (() => {
                    const d = fexpDetail;
                    return (
                      <div style={{ padding: "0 12px 10px", marginTop: -2, paddingTop: 8, borderTop: "1px dashed #EBDFC6", display: "flex", flexDirection: "column", gap: 5, alignItems: "flex-start" }}>
                        {meta && meta.gloss && <div style={{ fontSize: T.fSmall, color: C.ivory }}>{meta.gloss[LL]}{meta.deity && <span style={{ color: C.muted }}> · {meta.deity[LL]}</span>}</div>}
                        {d && d.info && <div style={{ fontSize: T.fMicro, color: C.muted }}>{d.info.lmonthName} · {d.info.krishna ? (lang === "hi" ? "कृष्ण पक्ष" : "Krishna Paksha") : (lang === "hi" ? "शुक्ल पक्ष" : "Shukla Paksha")} · {(lang === "hi" ? (NAK_HI[d.info.nak] || d.info.nakName) : d.info.nakName)}</div>}
                        {d && (d.parana || d.moonrise != null || d.sunset != null || d.stars) && (
                          <div style={{ fontSize: T.fSmall, color: "#1F7A4D", fontWeight: 600, background: "rgba(31,122,77,.07)", border: "1px solid rgba(31,122,77,.22)", borderRadius: T.rSm, padding: "5px 10px", fontVariantNumeric: "tabular-nums" }}>
                            {d.parana ? <>{lang === "hi" ? "पारण: " : "Parana: "}{fmtTimeD(d.parana.start, d.tz, it.ms)}{lang === "hi" ? " से" : " onwards"}{d.parana.dwadashiEnd > d.parana.start && <span style={{ color: C.muted, fontWeight: 400 }}> · {lang === "hi" ? "द्वादशी समाप्त " : "Dwadashi ends "}{fmtTimeD(d.parana.dwadashiEnd, d.tz, it.ms)}</span>}</>
                              : d.moonrise != null ? <>{lang === "hi" ? "चंद्रोदय पर व्रत खोलें: " : "Break fast after moonrise: "}{fmtTimeD(d.moonrise, d.tz, it.ms)}</>
                              : d.stars ? <>{lang === "hi" ? "तारे दिखाई देने के बाद व्रत खोलें" : "Break the fast after the stars are visible"}</>
                              : <>{lang === "hi" ? "संध्या पूजा सूर्यास्त से: " : "Evening puja from sunset: "}{fmtTimeD(d.sunset, d.tz, it.ms)}</>}
                          </div>
                        )}
                        {fexp && fexp.shifted && <div style={{ color: C.gold, fontSize: T.fMicro }}>{fexp.reason === "spans" ? (lang === "hi" ? "वैष्णव तिथि — दो अरुणोदय पर एकादशी; दूसरे दिन व्रत" : "Vaishnava date — Ekadashi at two dawns; observed on the second") : (lang === "hi" ? "वैष्णव तिथि — अरुणोदय पर दशमी होने से व्रत एक दिन आगे" : "Vaishnava date — Dashami touched arunodaya (dawn), so the fast shifts one day")}</div>}
                        {meta && meta.rules && <div style={{ color: C.muted, fontSize: T.fMicro, fontStyle: "italic" }}>{meta.rules[LL]}</div>}
                        {VRAT_VIDHI[kind] && <VratVidhiCard data={VRAT_VIDHI[kind]} lang={lang} C={C} />}
                      </div>
                    );
                  })()}
                </div>
              </div>
            );
          });
        })()}
        <div style={{ borderTop: `1px solid ${C.line}`, padding: "10px 12px", display: "flex", gap: 8 }}>
          <input value={fq} onChange={(e) => setFq(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && fq.trim()) onCal({ type: "search", q: fq.trim() }); }} placeholder={tr(lang, "searchPlaceholder")} style={{ flex: 1, minWidth: 0, height: T.ctrlH, boxSizing: "border-box", padding: "0 12px", borderRadius: T.rMd, border: `1px solid ${C.line}`, background: "#FFFDF7", color: C.ivory, fontFamily: T.body, fontSize: 13.5 }} />
          <button onClick={() => fq.trim() && onCal({ type: "search", q: fq.trim() })} style={{ height: T.ctrlH, boxSizing: "border-box", padding: "0 16px", borderRadius: T.rMd, fontFamily: T.serif, fontSize: 13.5, cursor: "pointer", border: `1px solid ${C.gold}`, background: "rgba(168,106,18,.08)", color: C.gold, flexShrink: 0 }}>{tr(lang, "searchBtn")}</button>
        </div>
        <button onClick={() => onCal({ type: "year" })} style={{ width: "100%", padding: "9px", border: "none", background: "transparent", color: C.gold, cursor: "pointer", fontFamily: T.serif, fontSize: T.fSmall, letterSpacing: ".02em" }}>{tr(lang, "moreLabel")} ›</button>
      </div>
      {/* muhurat finder */}
      <SecHead deva="मुहूर्त खोज" en="Muhurat finder" />
      <div style={{ ...card, padding: T.s4 }}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12.5, color: C.muted, marginBottom: 8, fontStyle: "italic" }}>
            {lang === "hi" ? "क्या करने जा रहे हैं और कब तक — चुनें, सर्वोत्तम दिन क्रमानुसार मिलेंगे।" : "Pick what you're planning and when — get the best days, ranked."}
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
            {MUH_CATS.map((c) => { const on = mfCat === c.key; return (
              <button key={c.key} onClick={() => { setMfCat(c.key); setMfErr(null); if (ans) findDays(null, null, c.key); }}
                style={{ height: T.ctrlH, boxSizing: "border-box", padding: "0 13px", borderRadius: T.rMd, cursor: "pointer", fontFamily: T.body, fontSize: 13,
                  border: `1.5px solid ${on ? C.gold : C.line}`, background: on ? "rgba(168,106,18,.1)" : "#FFFDF7", color: on ? C.gold : C.ivory }}>
                {lang === "hi" ? c.hi : c.en}
              </button>
            ); })}
          </div>
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 8 }}>
            <label style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1, minWidth: 140, ...T.label, color: C.muted }}>
              {lang === "hi" ? "से" : "From"}
              <input type="date" value={mfFrom} onChange={(e) => { setMfFrom(e.target.value); setMfPreset(null); }}
                style={{ height: T.ctrlH, boxSizing: "border-box", padding: "0 10px", borderRadius: T.rMd, border: `1px solid ${C.line}`, background: "#FFFDF7", color: C.ivory, fontFamily: T.body, fontSize: 13.5, letterSpacing: "normal", textTransform: "none" }} />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1, minWidth: 140, ...T.label, color: C.muted }}>
              {lang === "hi" ? "तक" : "To"}
              <input type="date" value={mfTo} onChange={(e) => { setMfTo(e.target.value); setMfPreset(null); }}
                style={{ height: T.ctrlH, boxSizing: "border-box", padding: "0 10px", borderRadius: T.rMd, border: `1px solid ${C.line}`, background: "#FFFDF7", color: C.ivory, fontFamily: T.body, fontSize: 13.5, letterSpacing: "normal", textTransform: "none" }} />
            </label>
          </div>
          <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
            {[["90", lang === "hi" ? "90 दिन" : "90 days", () => [isoAtOffset(0), isoAtOffset(90)]],
              ["year", lang === "hi" ? "इस वर्ष" : "This year", () => [isoAtOffset(0), new Date(Date.now() + tz * 3600000).getUTCFullYear() + "-12-31"]]].map(([pk, label, mk]) => {
              const on = mfPreset === pk;
              return (
                <button key={pk} onClick={() => { const [f, t] = mk(); setMfFrom(f); setMfTo(t); setMfPreset(pk); if (mfCat) findDays(f, t); }}
                  style={{ padding: "4px 12px", borderRadius: T.rPill, border: `1.5px solid ${on ? C.gold : C.line}`, background: on ? "rgba(168,106,18,.1)" : "transparent", color: on ? C.gold : C.muted, fontSize: 11.5, cursor: "pointer", fontFamily: T.body }}>
                  {label}
                </button>
              );
            })}
          </div>
          <button onClick={() => findDays()} disabled={!mfCat || mfBusy}
            style={{ width: "100%", height: T.ctrlH, boxSizing: "border-box", borderRadius: T.rMd, fontFamily: T.serif, fontSize: 14, cursor: mfCat && !mfBusy ? "pointer" : "default", border: "none", background: mfCat && !mfBusy ? "linear-gradient(180deg, #E08A22, #C9711A)" : C.line, color: mfCat && !mfBusy ? "#FFF8E9" : C.muted, fontWeight: 600 }}>
            {mfBusy ? (lang === "hi" ? "पंचांग देखा जा रहा है…" : "Checking the panchang…")
              : !mfCat ? (lang === "hi" ? "पहले ऊपर कार्य चुनें" : "First pick an activity above")
              : (lang === "hi" ? "शुभ दिन खोजें" : "Find good days")}
          </button>
          {mfErr && (
            <div style={{ marginTop: 10, padding: "10px 12px", borderRadius: T.rMd, background: "rgba(194,69,30,.08)", border: `1.5px solid ${C.sindoor}`, color: C.sindoor, fontSize: 13 }}>{mfErr}</div>
          )}
          {ans && !mfBusy && (ans.from !== mfFrom || ans.to !== mfTo || ans.category !== mfCat) && (
            <div style={{ marginTop: 10, padding: "9px 12px", borderRadius: T.rMd, background: "#FDF3E0", border: `1px solid #E0B25E`, color: "#8A5A00", fontSize: 12.5, lineHeight: 1.45 }}>
              {lang === "hi" ? "चुनाव बदल गया है — नए परिणामों हेतु \"शुभ दिन खोजें\" दबाएँ। नीचे पिछले परिणाम दिख रहे हैं।" : "Your selection changed — press \"Find good days\" to update. The results below are from your previous search."}
            </div>
          )}
          {ans && (() => {
            const catInfo = MUH_CATS.find((c) => c.key === ans.category) || { hi: "", en: "" };
            const allValid = ans.days.filter((d) => d.valid);
            const days = allValid.slice(0, 8);
            const qual = (sc) => sc >= 5 ? { t: lang === "hi" ? "अति शुभ" : "Highly auspicious", c: "#1F7A4D" } : sc >= 3 ? { t: lang === "hi" ? "शुभ" : "Auspicious", c: C.gold } : sc >= 1 ? { t: lang === "hi" ? "सामान्य" : "Workable", c: "#9A7B2E" } : { t: lang === "hi" ? "टालें" : "Better avoided", c: C.sindoor };
            const dl = (r) => new Date(r.rise + r.tz * 3600000).toLocaleDateString(lang === "hi" ? "hi-IN" : "en-US", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
            const dlFull = (r) => new Date(r.rise + r.tz * 3600000).toLocaleDateString(lang === "hi" ? "hi-IN" : "en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
            const fmtIso = (iso) => new Date(iso + "T00:00:00Z").toLocaleDateString(lang === "hi" ? "hi-IN" : "en-US", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
            const top = days[0];
            // tally the reasons the excluded days were skipped, most-common first
            const blockerTally = (() => {
              const m = new Map();
              for (const d of ans.days) { if (d.valid) continue; for (const b of (d.blockers || [])) { if (!m.has(b.en)) m.set(b.en, { en: b.en, hi: b.hi, n: 0 }); m.get(b.en).n++; } }
              return [...m.values()].sort((a, b) => b.n - a.n).slice(0, 4);
            })();
            const whyList = blockerTally.map((b) => (lang === "hi" ? b.hi : b.en) + " (" + b.n + ")").join(lang === "hi" ? ", " : ", ");
            return (
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${C.line}` }}>
                <div style={{ fontFamily: "Eczar, serif", fontSize: 15.5, color: C.ivory }}>
                  {(lang === "hi" ? "शुभ दिन · " : "Best days · ")}{lang === "hi" ? catInfo.hi : catInfo.en} <span style={{ color: C.muted, fontSize: 13 }}>· {fmtIso(ans.from || mfFrom)} – {fmtIso(ans.to || mfTo)}</span>
                </div>
                {days.length === 0 ? (
                  <div style={{ fontSize: 12.5, color: C.muted, marginTop: 10, lineHeight: 1.6 }}>
                    <span style={{ color: C.sindoor, fontWeight: 600 }}>{lang === "hi" ? "इस अवधि में कोई शुभ मुहूर्त नहीं।" : "No auspicious muhurat in this range."}</span>
                    {whyList && <><br />{(lang === "hi" ? "अधिकांश दिन इन कारणों से टले: " : "Most days were skipped because of: ") + whyList + "."}</>}
                    <br />{(lang === "hi" ? "शुभ काल: " : "When it's possible: ") + MUHURTA_RULES[ans.category].monthsLabel[lang === "hi" ? "hi" : "en"] + ". " + (lang === "hi" ? "बड़ी अवधि आज़माएँ।" : "Try a wider range.")}
                  </div>
                ) : (
                  <>
                    {top && (
                      <div style={{ marginTop: 12, ...card, borderRadius: T.rSm, padding: "12px 14px", background: "#FBF5E7", border: `1.5px solid ${C.gold}` }}>
                        <div style={{ ...T.label, color: C.gold, marginBottom: 3 }}>{lang === "hi" ? "सर्वोत्तम दिन" : "Best day"}</div>
                        <div style={{ fontFamily: "Eczar, serif", fontSize: 19, color: C.ivory, lineHeight: 1.25 }}>{dlFull(top)}</div>
                        <div style={{ fontSize: 12, color: C.muted, margin: "3px 0 8px" }}>
                          {(lang === "hi" ? (NAK_HI[top.nak] || top.nakName) : top.nakName)} · {(lang === "hi" ? "तिथि " : "tithi ") + top.tithiNum}
                          <span style={{ marginLeft: 8, fontSize: 11, padding: "1px 9px", borderRadius: 10, background: qual(top.score).c + "20", color: qual(top.score).c }}>{qual(top.score).t}</span>
                        </div>
                        <div style={{ fontSize: 12.5, color: C.ivory, marginBottom: 10, lineHeight: 1.5 }}>{(lang === "hi" ? "क्यों यह दिन: " : "Why this day: ") + (top.factors.filter((f) => f.g).map((f) => lang === "hi" ? f.hi : f.en).join(lang === "hi" ? ", " : ", ") || "—")}</div>
                        {finderTopPanchaka && (finderTopPanchaka.panchakaWindows || []).length ? (() => {
                          const ptz = finderTopPanchaka.tz;
                          const shubha = finderTopPanchaka.panchakaWindows.filter((w) => w.shubha);
                          const dosha = finderTopPanchaka.panchakaWindows.filter((w) => !w.shubha);
                          return (
                            <>
                              <div style={{ ...T.label, color: "#1F7A4D", marginBottom: 5 }}>{lang === "hi" ? "पञ्चक रहित (शुभ) · लग्न आधारित" : "Panchaka Rahita (Shubha) · lagna-based"}</div>
                              {shubha.length ? (
                                <div style={{ display: "flex", flexDirection: "column", gap: 3, marginBottom: 8 }}>
                                  {shubha.slice(0, 6).map((w, i) => (
                                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, fontVariantNumeric: "tabular-nums" }}>
                                      <span style={{ color: "#1F7A4D", fontWeight: 700 }}>✓</span>
                                      <span style={{ color: C.ivory }}>{fmtTime(w.start, ptz)} – {fmtTime(w.end, ptz)}</span>
                                    </div>
                                  ))}
                                </div>
                              ) : <div style={{ fontSize: 12, color: C.muted, fontStyle: "italic", marginBottom: 8 }}>{lang === "hi" ? "इस दिन कोई पूर्ण पञ्चक-रहित काल नहीं — अभिजित देखें" : "No fully-clear window this day — use Abhijit below"}</div>}
                              {top.abhijit && <div style={{ fontSize: 12, color: C.gold, fontVariantNumeric: "tabular-nums", marginBottom: 8 }}>{tr(lang, "abhijitL")}: {fmtTime(top.abhijit.start, top.tz)} – {fmtTime(top.abhijit.end, top.tz)}</div>}
                              {dosha.length > 0 && (<>
                                <div style={{ ...T.label, color: C.sindoor, marginBottom: 4 }}>{lang === "hi" ? "पञ्चक दोष · टालें" : "Panchaka dosha · avoid"}</div>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "3px 10px", marginBottom: 5 }}>
                                  {dosha.slice(0, 8).map((w, i) => <span key={i} style={{ fontSize: 11.5, color: C.sindoor, fontVariantNumeric: "tabular-nums" }}>{trN(lang, PANCHAKA_SHORT, w.type)} {fmtTime(w.start, ptz)}–{fmtTime(w.end, ptz)}</span>)}
                                </div>
                              </>)}
                              <div style={{ fontSize: 11.5, color: C.sindoor, fontVariantNumeric: "tabular-nums" }}>{tr(lang, "rahuL")} {fmtTime(top.rahu.start, top.tz)}–{fmtTime(top.rahu.end, top.tz)}</div>
                            </>
                          );
                        })() : (
                          <>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 10px" }}>
                              {top.choghaDay.filter((c) => c.nat === "good").map((c, i) => <span key={i} style={{ fontSize: 12, color: "#1F7A4D", fontVariantNumeric: "tabular-nums" }}>{trN(lang, CHOG_NAME, c.key)} {fmtTime(c.start, top.tz)}–{fmtTime(c.end, top.tz)}</span>)}
                              {top.abhijit && <span style={{ fontSize: 12, color: C.gold, fontVariantNumeric: "tabular-nums" }}>{tr(lang, "abhijitL")} {fmtTime(top.abhijit.start, top.tz)}–{fmtTime(top.abhijit.end, top.tz)}</span>}
                            </div>
                            <div style={{ fontSize: 11.5, color: C.sindoor, marginTop: 6, fontVariantNumeric: "tabular-nums" }}>{tr(lang, "avoidWindows")}: {tr(lang, "rahuL")} {fmtTime(top.rahu.start, top.tz)}–{fmtTime(top.rahu.end, top.tz)}</div>
                          </>
                        )}
                      </div>
                    )}
                    {days.length > 1 && (
                      <div style={{ marginTop: 12 }}>
                        <div style={{ ...T.label, color: C.muted, marginBottom: 6 }}>{(lang === "hi" ? "अन्य शुभ दिन" : "Other good days") + (allValid.length > 1 ? " · " + (allValid.length - 1) : "")}</div>
                        {days.slice(1).map((r, i) => { const Q = qual(r.score); return (
                          <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 10, padding: "7px 0", borderBottom: "1px solid #F1EADA", alignItems: "baseline" }}>
                            <span style={{ minWidth: 92, fontFamily: "Eczar, serif", fontSize: 13.5, color: C.ivory }}>{dl(r)}</span>
                            <span style={{ fontSize: 11, padding: "1px 9px", borderRadius: 10, background: Q.c + "20", color: Q.c, whiteSpace: "nowrap" }}>{Q.t}</span>
                            <span style={{ flex: 1, textAlign: "right", fontSize: 11.5, color: C.muted, lineHeight: 1.4 }}>{r.factors.filter((f) => f.g).map((f) => lang === "hi" ? f.hi : f.en).join(" · ") || "—"}</span>
                          </div>
                        ); })}
                      </div>
                    )}
                    <div style={{ fontSize: 11, color: C.muted, marginTop: 8, fontStyle: "italic" }}>{lang === "hi" ? "केवल मास, तिथि, नक्षत्र व वार शुद्धि पर खरे दिन दिखाए गए हैं।" : "Only dates passing month, tithi, nakshatra & weekday shuddhi are shown."}</div>
                    {whyList && (
                      <div style={{ marginTop: 12, padding: "10px 12px", borderRadius: T.rMd, background: "#FBF5E7", border: `1px solid ${C.line}` }}>
                        <div style={{ ...T.label, color: C.muted, marginBottom: 4 }}>{lang === "hi" ? "अन्य दिन क्यों शामिल नहीं" : "Why other days weren't included"}</div>
                        <div style={{ fontSize: 12, color: C.ivory, lineHeight: 1.5 }}>{whyList}</div>
                      </div>
                    )}
                  </>
                )}
                <div style={{ fontSize: 11, color: C.muted, marginTop: 12, lineHeight: 1.5, fontStyle: "italic" }}>
                  {lang === "hi" ? "दिन तिथि, नक्षत्र, वार व करण से चुने जाते हैं; समय-काल पञ्चक रहित (लग्न आधारित) से निकाले जाते हैं। विवाह जैसे बड़े कार्यों हेतु वर-वधू की कुंडली मिलान भी किसी आचार्य से कराएँ।" : "Days are screened by tithi, nakshatra, weekday and karana; the time windows use Panchaka Rahita (lagna-based). For weddings and other major events, also match the charts with a practitioner."}
                </div>
              </div>
            );
          })()}
        </div>
        <div style={{ ...T.label, color: C.muted, textAlign: "center", margin: "2px 0 14px" }}>{lang === "hi" ? "— या आज का समय देखें —" : "— or check a time today —"}</div>
        <div style={{ fontSize: 12.5, color: C.muted, marginBottom: 10, lineHeight: 1.5 }}>{tr(lang, "finderHint")}</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
          {EVENTS.map((e) => (
            <button key={e.key} onClick={() => setEvKey(e.key)} style={{ padding: "7px 12px", borderRadius: 8, fontFamily: "Eczar, serif", fontSize: 13, cursor: "pointer", border: `1px solid ${evKey === e.key ? C.gold : C.line}`, background: evKey === e.key ? "rgba(168,106,18,.1)" : "transparent", color: evKey === e.key ? C.gold : C.muted }}>{lang === "hi" ? e.hi : e.en}</button>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
          <div>
            <div style={{ ...T.label, color: "#1F7A4D", marginBottom: 6 }}>{tr(lang, "goodWindows")}</div>
            {goodSlots.length === 0 ? <div style={{ fontSize: 12.5, color: C.muted, fontStyle: "italic" }}>{lang === "hi" ? "आज इसके लिए और कोई शुभ समय नहीं — कल देखें।" : "No more good windows for this today — check tomorrow."}</div> :
              goodSlots.map((c, i) => (
                <div key={i} style={{ fontSize: 13, padding: "4px 0", display: "flex", justifyContent: "space-between", gap: 8 }}>
                  <span style={{ color: C.ivory }}>{trN(lang, CHOG_NAME, c.key)}</span>
                  <span style={{ color: C.muted, fontVariantNumeric: "tabular-nums" }}>{fmtT(c.start)}–{fmtT(c.end)}</span>
                </div>
              ))}
            {todayP.abhijit && todayP.abhijit.end > nowMs && (
              <div style={{ fontSize: 13, padding: "4px 0", display: "flex", justifyContent: "space-between", gap: 8 }}>
                <span style={{ color: C.gold }}>{tr(lang, "abhijitL")}</span>
                <span style={{ color: C.muted, fontVariantNumeric: "tabular-nums" }}>{fmtT(todayP.abhijit.start)}–{fmtT(todayP.abhijit.end)}</span>
              </div>
            )}
          </div>
          <div>
            <div style={{ ...T.label, color: C.sindoor, marginBottom: 6 }}>{tr(lang, "avoidWindows")}</div>
            {avoidSlots.map(([k, w], i) => (
              <div key={i} style={{ fontSize: 13, padding: "4px 0", display: "flex", justifyContent: "space-between", gap: 8 }}>
                <span style={{ color: C.ivory }}>{tr(lang, k + "L")}</span>
                <span style={{ color: C.muted, fontVariantNumeric: "tabular-nums" }}>{fmtT(w.start)}–{fmtT(w.end)}</span>
              </div>
            ))}
          </div>
        </div>
        {evKey === "wedding" && <div style={{ fontSize: 11.5, color: C.muted, marginTop: 12, fontStyle: "italic", lineHeight: 1.5 }}>{lang === "hi" ? "विवाह का पूर्ण मुहूर्त तिथि, नक्षत्र व लग्न पर निर्भर — यह केवल दिन के शुभ समय दिखाता है।" : "A full wedding muhurat depends on tithi, nakshatra and lagna — this shows favourable times within the day only."}</div>}
      </div>

      {/* hora timeline (secondary) */}
      <SecHead deva="होरा" en="Planetary hours" />
      {/* today — hero */}
      {(() => {
        const rise = todayP.rise, set = todayP.set;
        const obs = observancesFor(todayP.krishna, todayP.tithiNum, null, todayP.dow);
        const note = obs.length
          ? (lang === "hi" ? "आज " : "Today is ") + obsLabel(lang, obs[0]) + (obs[0].fasting ? (lang === "hi" ? " — व्रत का दिन" : " — a fasting day") : "")
          : todayP.naks[0].name + (lang === "hi" ? " नक्षत्र · " : " nakshatra · ") + todayP.tithis[0].name;
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
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontFamily: "Eczar, serif", fontSize: 22, color: C.ivory, lineHeight: 1.12 }}>{todayP.dateLabel}</div>
              <div style={{ fontSize: 12.5, color: C.muted, marginTop: 2 }}>{todayP.tithis[0].name} · {todayP.paksha}</div>
            </div>
            {isToday ? pill(nowState === "good" ? tr(lang, "auspiciousNow") : nowState === "bad" ? tr(lang, "cautionNow") : tr(lang, "neutralNow"), natColor(nowState)) : null}
          </div>
        );
        const moonRow = (
          <div style={{ padding: "12px 20px 15px", display: "flex", gap: 15, alignItems: "center" }}>
            <svg viewBox="-26 -26 52 52" width="46" height="46" style={{ flexShrink: 0 }}>
              <circle cx="0" cy="0" r={mR} fill="#3A3550" />
              <path d={moonLit} fill="#F3E7C8" />
              <circle cx="0" cy="0" r={mR} fill="none" stroke="#D8C9A6" strokeWidth="0.75" />
            </svg>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 14, color: C.ivory, lineHeight: 1.35 }}>{note}</div>
              <div style={{ fontSize: 11.5, color: C.muted, marginTop: 2 }}>{phNames[phIdx]}{todayP.abhijit ? " · " + tr(lang, "abhijitL") + " " + fmtT(todayP.abhijit.start) + "–" + fmtT(todayP.abhijit.end) : ""}</div>
            </div>
          </div>
        );
        if (rise == null || set == null) {
          return (<div className="rise" style={{ ...card, borderRadius: T.rLg, padding: 0, overflow: "hidden", borderTop: `3px solid ${natColor(nowState)}` }}>
            <div style={{ background: "linear-gradient(135deg, #FCF4E0, #F5E8CD)", padding: "16px 20px" }}>{head}</div>{moonRow}</div>);
        }
        const dayFrac = (ms) => set > rise ? Math.max(0, Math.min(1, (ms - rise) / (set - rise))) : 0;
        const AW = 320, AH = 240, cx = AW / 2, cy = AH - 60, R = 132;
        const arcPt = (f) => { const a = Math.PI - f * Math.PI; return [cx + R * Math.cos(a), cy - R * Math.sin(a)]; };
        const arcPoly = (f0, f1, n) => { const p = []; for (let i = 0; i <= n; i++) { const xy = arcPt(f0 + (f1 - f0) * i / n); p.push(xy[0].toFixed(1) + "," + xy[1].toFixed(1)); } return p.join(" "); };
        const seg = (w) => (w && w.end > rise && w.start < set) ? [dayFrac(w.start), dayFrac(w.end)] : null;
        const segPoly = (sv, color, w) => sv ? <polyline points={arcPoly(sv[0], sv[1], 16)} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" /> : null;
        const showNow = isToday && nowMs != null;
        const isDay = showNow && nowMs >= rise && nowMs <= set;
        const sunXY = isDay ? arcPt(dayFrac(nowMs)) : [0, 0];
        const radPt = (f, r) => { const a = Math.PI - f * Math.PI; return [cx + r * Math.cos(a), cy - r * Math.sin(a)]; };
        const horas = dayHoras(todayP.dow, rise, set);
        const horaDur = (set - rise) / 12;
        const curHoraIdx = isDay ? Math.min(11, Math.max(0, Math.floor((nowMs - rise) / horaDur))) : null;
        const showHora = horaSel != null ? horaSel : curHoraIdx;
        
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
          const frac = Math.max(0, Math.min(1, 1 - angle)); // map to [0,1] = sunrise → sunset
          const ms = rise + frac * (set - rise);
          setDragMs(ms);
        };
        const handleArcLeave = () => setDragMs(null);
        
        // Compute auspiciousness and details at dragged time
        const dragInfo = dragMs && dragMs >= rise && dragMs <= set ? (() => {
          const chog = todayP.choghaDay ? todayP.choghaDay.find(c => dragMs >= c.start && dragMs < c.end) : null;
          const inRahu = todayP.rahu && dragMs >= todayP.rahu.start && dragMs < todayP.rahu.end;
          const inAbhijit = todayP.abhijit && dragMs >= todayP.abhijit.start && dragMs < todayP.abhijit.end;
          const isDangerous = inRahu || (chog && chog.nat === "rik");
          const isGood = inAbhijit || (chog && chog.nat === "shubh");
          return { time: dragMs, chog, inRahu, inAbhijit, isDangerous, isGood };
        })() : null;
        
return (

          <div className="rise" style={{ ...card, borderRadius: T.rLg, padding: 0, overflow: "hidden", borderTop: `3px solid ${natColor(nowState)}` }}>
            <div style={{ background: "linear-gradient(135deg, #FCF4E0, #F5E8CD)", padding: "16px 20px 4px" }}>
              {head}
              <svg viewBox={"0 0 " + AW + " " + AH} style={{ width: "100%", maxWidth: 380, display: "block", margin: "2px auto 0", cursor: "crosshair" }} onMouseMove={handleArcDrag} onMouseLeave={handleArcLeave} onTouchMove={handleArcDrag} onTouchEnd={handleArcLeave}>
                <line x1="8" y1={cy} x2={AW - 8} y2={cy} stroke="#E3D4B0" strokeWidth="1" />
                {horas.map((h, i) => { const cur = curHoraIdx === i, sel = horaSel === i; return (
                  <g key={i}>
                    <polyline points={arcPoly(i / 12, (i + 1) / 12, 8)} fill="none" stroke={HORA_COLOR[h.ruler]} strokeWidth={cur || sel ? 5.5 : 3} strokeOpacity={cur ? 1 : sel ? 0.85 : 0.36} strokeLinecap="butt" />
                    <polyline points={arcPoly(i / 12, (i + 1) / 12, 8)} fill="none" stroke="transparent" strokeWidth="18" style={{ cursor: "pointer" }} onClick={() => setHoraSel(i)} />
                  </g>); })}
                {Array.from({ length: 13 }, (_, i) => { 
                  const a = radPt(i / 12, R - 5), b = radPt(i / 12, R + 4); 
                  const timeLabel = (() => { const tm = rise + i * (set - rise) / 12; const h = Math.floor(tm / 3600000) % 24, m = Math.floor((tm % 3600000) / 60000); return (h < 10 ? "0" : "") + h + (m > 0 ? ":" + (m < 10 ? "0" : "") + m : ""); })();
                  const labelPt = radPt(i / 12, R + 16);
                  return <g key={i}><line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#E3D4B0" strokeWidth="1" /><text x={labelPt[0]} y={labelPt[1]} textAnchor="middle" style={{ fontSize: 9.5, fill: C.muted, fontVariantNumeric: "tabular-nums" }}>{timeLabel}</text></g>; 
                })}
                {showHora != null && (() => { const g = radPt((showHora + 0.5) / 12, R - 16); return <text x={g[0]} y={g[1] + 4} textAnchor="middle" style={{ fontSize: 13, fontWeight: 700, fill: HORA_COLOR[horas[showHora].ruler] }}>{HORA_GLYPH[horas[showHora].ruler]}</text>; })()}
                {dragMs ? (() => { 
                  const dxy = arcPt(dayFrac(dragMs)); 
                  const chog = todayP.choghaDay ? todayP.choghaDay.find(c => dragMs >= c.start && dragMs < c.end) : null;
                  const inRahu = todayP.rahu && dragMs >= todayP.rahu.start && dragMs < todayP.rahu.end;
                  const inAbhijit = todayP.abhijit && dragMs >= todayP.abhijit.start && dragMs < todayP.abhijit.end;
                  const isDangerous = inRahu || (chog && chog.nat === "rik");
                  const isGood = inAbhijit || (chog && chog.nat === "shubh");
                  return <circle cx={dxy[0]} cy={dxy[1]} r="7" fill="none" stroke={isGood ? C.gold : isDangerous ? C.sindoor : C.muted} strokeWidth="2.5" opacity="0.7" />; 
                })() : null}
                {isDay
                  ? <g><circle cx={sunXY[0]} cy={sunXY[1]} r="11" fill={C.gold} opacity="0.22" style={{ animation: "softpulse 3s ease-in-out infinite" }} /><circle cx={sunXY[0]} cy={sunXY[1]} r="5" fill="#E89A2B" stroke="#FFF6E6" strokeWidth="1.5" /></g>
                  : (showNow ? <text x={cx} y={cy - 10} textAnchor="middle" style={{ fontSize: 12, fill: C.muted }}>{lang === "hi" ? "रात्रि" : "night"}</text> : null)}
                <text x="10" y={cy - 6} style={{ fontSize: 10.5, fill: C.muted }}>↑ {fmtT(rise)}</text>
                <text x={AW - 10} y={cy - 6} textAnchor="end" style={{ fontSize: 10.5, fill: C.muted }}>{fmtT(set)} ↓</text>
              </svg>
              {dragInfo ? (
                <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "6px 2px 2px", flexWrap: "wrap", justifyContent: "center", fontVariantNumeric: "tabular-nums" }}>
                  <span style={{ fontFamily: T.serif, fontSize: T.fSmall, color: dragInfo.isGood ? C.gold : dragInfo.isDangerous ? C.sindoor : C.muted }}>{dragInfo.isGood ? "✓ Auspicious" : dragInfo.isDangerous ? "✗ Inauspicious" : "○ Neutral"}</span>
                  <span style={{ fontSize: T.fMicro, color: C.muted }}>{fmtT(dragInfo.time)}</span>
                  {dragInfo.chog && <span style={{ fontSize: T.fMicro, color: C.muted }}>· {trN(lang, CHOG_NAME, dragInfo.chog.key)}</span>}
                  {dragInfo.inRahu && <span style={{ fontSize: T.fMicro, color: C.sindoor }}>· Rahu Kalam</span>}
                </div>
              ) : showHora != null && (
                <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "6px 2px 2px", flexWrap: "wrap", justifyContent: "center", fontVariantNumeric: "tabular-nums" }}>
                  <span style={{ fontFamily: T.serif, fontSize: T.fSmall, color: HORA_COLOR[horas[showHora].ruler] }}>{HORA_GLYPH[horas[showHora].ruler]} {trN(lang, HORA_NAME, horas[showHora].ruler)} {lang === "hi" ? "होरा" : "hora"}</span>
                  <span style={{ fontSize: T.fMicro, color: C.muted }}>{fmtT(horas[showHora].start)}–{fmtT(horas[showHora].end)} · {trN(lang, HORA_NATURE, horas[showHora].ruler)}</span>
                  {horaSel != null && <button onClick={() => setHoraSel(null)} style={{ border: "none", background: "transparent", color: C.gold, cursor: "pointer", fontSize: T.fMicro, padding: "0 2px" }} aria-label="reset">✕</button>}
                </div>
              )}
            </div>
            {moonRow}
          </div>
        );
      })()}

      {/* hora advisor */}
      <div style={{ ...card, padding: "12px 14px", marginTop: 12 }}>
        <div style={{ ...T.label, color: C.muted, marginBottom: 4 }}>{lang === "hi" ? "होरा सलाह" : "Hora Advice"}</div>
        <div style={{ fontSize: T.fMicro, color: C.muted, marginBottom: 8 }}>{lang === "hi" ? "किसी कार्य के लिए शुभ होरा पूछें" : "Ask which hora suits an activity"}</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input
            value={horaQuestion}
            onChange={(e) => setHoraQuestion(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") setHoraResult(analyzeHora(horaQuestion)); }}
            placeholder={lang === "hi" ? "जैसे: व्यापार के लिए कौन सी होरा?" : "e.g. best hora for business?"}
            style={{ flex: "1 1 180px", minWidth: 150, height: T.ctrlH, boxSizing: "border-box", padding: "0 12px", borderRadius: T.rMd, border: `1px solid ${C.line}`, background: C.panel, color: C.ivory, fontFamily: T.body, fontSize: 13.5 }}
          />
          <button type="button" onClick={() => setHoraResult(analyzeHora(horaQuestion))} style={{ height: T.ctrlH, boxSizing: "border-box", padding: "0 18px", borderRadius: T.rMd, border: "none", background: "linear-gradient(180deg, #E08A22, #C9711A)", color: "#FFF8E9", cursor: "pointer", fontFamily: T.serif, fontSize: 13.5, fontWeight: 600 }}>
            {lang === "hi" ? "पूछें" : "Ask"}
          </button>
        </div>

        {!horaResult && (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
            {[{ en: "Best hora for business", hi: "व्यापार के लिए होरा" }, { en: "Hora for travel", hi: "यात्रा के लिए होरा" }, { en: "Good time to study", hi: "अध्ययन का समय" }, { en: "Buying gold", hi: "सोना खरीदना" }, { en: "Marriage hora", hi: "विवाह होरा" }].map((ex, i) => (
              <button key={i} type="button" onClick={() => { setHoraQuestion(ex.en); setHoraResult(analyzeHora(ex.en)); }} style={{ fontSize: T.fMicro, padding: "5px 10px", borderRadius: T.rPill, border: `1px solid ${C.line}`, background: C.panel, color: C.muted, cursor: "pointer" }}>
                {ex[lang === "hi" ? "hi" : "en"]}
              </button>
            ))}
          </div>
        )}

        {horaResult && (() => {
          const LL = lang === "hi" ? "hi" : "en";
          if (horaResult.status === "timing") {
            const p = horaResult.planet;
            const wins = (todayP.rise != null && todayP.set != null) ? horaWindowsForPlanet(p, todayP.dow, todayP.rise, todayP.set) : [];
            return (
              <div style={{ marginTop: 10, padding: "10px 12px", background: "rgba(168,106,18,.06)", borderRadius: T.rMd, borderLeft: `3px solid ${HORA_COLOR[p]}` }}>
                <div style={{ fontSize: T.fBody, color: HORA_COLOR[p], fontWeight: 600, marginBottom: 7 }}>{HORA_GLYPH[p]} {HORA_NAME[p][LL]} {lang === "hi" ? "होरा — आज" : "hora — today"}</div>
                {wins.length === 0 ? (
                  <div style={{ fontSize: T.fSmall, color: C.muted }}>{lang === "hi" ? "आज का समय उपलब्ध नहीं।" : "Times unavailable for today."}</div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    {wins.map((w, i) => {
                      const isNow = isToday && Date.now() >= w.start && Date.now() < w.end;
                      return (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontVariantNumeric: "tabular-nums" }}>
                          <span style={{ fontSize: T.fSmall, color: C.ivory, fontWeight: isNow ? 700 : 400 }}>{fmtT(w.start)} – {fmtT(w.end)}</span>
                          <span style={{ fontSize: T.fMicro, color: C.muted }}>{w.period === "day" ? (lang === "hi" ? "दिन" : "day") : (lang === "hi" ? "रात" : "night")}</span>
                          {isNow && <span style={{ fontSize: T.fMicro, color: HORA_COLOR[p], fontWeight: 700 }}>● {lang === "hi" ? "अभी" : "now"}</span>}
                        </div>
                      );
                    })}
                  </div>
                )}
                <div style={{ fontSize: T.fMicro, color: C.muted, marginTop: 7 }}>{lang === "hi" ? "उपयुक्त: " : "Good for: "}{HORA_NATURE[p][LL]}</div>
              </div>
            );
          }
          if (horaResult.status === "clarify") {
            const tree = horaResult.tree;
            return (
              <div style={{ marginTop: 10, padding: "10px 12px", background: "rgba(168,106,18,.06)", borderRadius: T.rMd, borderLeft: `3px solid ${C.gold}` }}>
                <div style={{ fontSize: T.fSmall, color: C.ivory, marginBottom: 8 }}>{tree.q[LL]}</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {tree.options.map((opt, i) => (
                    <button key={i} type="button" onClick={() => setHoraResult({ status: "answer", intent: horaResult.intent || "general", planets: opt.planets, act: opt.act })} style={{ fontSize: T.fMicro, padding: "6px 11px", borderRadius: T.rPill, border: `1px solid ${C.gold}`, background: C.panel, color: C.gold, cursor: "pointer", fontWeight: 500 }}>
                      {opt.label[LL]}
                    </button>
                  ))}
                </div>
              </div>
            );
          }
          if (horaResult.status === "unknown" || horaResult.status === "empty") {
            return (
              <div style={{ marginTop: 10, padding: "10px 12px", background: "rgba(140,129,118,.08)", borderRadius: T.rMd }}>
                <div style={{ fontSize: T.fSmall, color: C.muted, marginBottom: 8 }}>{lang === "hi" ? "इनमें से आज़माएँ:" : "Try one of these:"}</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {[{ en: "business", hi: "व्यापार" }, { en: "travel", hi: "यात्रा" }, { en: "marriage", hi: "विवाह" }, { en: "study", hi: "अध्ययन" }, { en: "property", hi: "संपत्ति" }, { en: "health", hi: "स्वास्थ्य" }, { en: "worship", hi: "पूजा" }].map((ex, i) => (
                    <button key={i} type="button" onClick={() => { setHoraQuestion(ex.en); setHoraResult(analyzeHora(ex.en)); }} style={{ fontSize: T.fMicro, padding: "5px 10px", borderRadius: T.rPill, border: `1px solid ${C.line}`, background: C.panel, color: C.muted, cursor: "pointer" }}>{ex[LL]}</button>
                  ))}
                </div>
              </div>
            );
          }
          const hr = horaResultText(horaResult, horaAsc);
          if (!hr) return null;
          return (
            <div style={{ marginTop: 10, padding: "10px 12px", background: "rgba(168,106,18,.06)", borderRadius: T.rMd, borderLeft: `3px solid ${C.gold}` }}>
              <div style={{ fontSize: T.fBody, color: C.ivory, marginBottom: hr.planets.length ? 8 : 0 }}>{hr.text[LL]}</div>
              {hr.planets.length > 0 && (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {hr.planets.map((p) => (
                    <span key={p} style={{ fontSize: T.fMicro, padding: "4px 9px", borderRadius: T.rSm, background: C.panel, color: HORA_COLOR[p], border: `1px solid ${HORA_COLOR[p]}`, fontWeight: 600 }}>{HORA_GLYPH[p]} {HORA_NAME[p][LL]}</span>
                  ))}
                </div>
              )}
              {horaResult.withTiming && horaResult.intent !== "avoid" && todayP.rise != null && todayP.set != null && (() => {
                const tp = hr.planets[0];
                const wins = horaWindowsForPlanet(tp, todayP.dow, todayP.rise, todayP.set);
                if (!wins.length) return null;
                return (
                  <div style={{ marginTop: 8, fontSize: T.fMicro, color: C.muted, lineHeight: 1.6 }}>
                    <span style={{ color: HORA_COLOR[tp], fontWeight: 600 }}>{HORA_GLYPH[tp]} {HORA_NAME[tp][LL]} {lang === "hi" ? "होरा आज" : "hora today"}: </span>
                    {wins.map((w, i) => {
                      const isNow = isToday && Date.now() >= w.start && Date.now() < w.end;
                      return <span key={i} style={{ fontVariantNumeric: "tabular-nums", fontWeight: isNow ? 700 : 400, color: isNow ? HORA_COLOR[tp] : C.ivory }}>{fmtT(w.start)}–{fmtT(w.end)}{isNow ? " ●" : ""}{i < wins.length - 1 ? " · " : ""}</span>;
                    })}
                  </div>
                );
              })()}
              {hr.note && <div style={{ fontSize: T.fMicro, color: C.gold, marginTop: 8, lineHeight: 1.5 }}>★ {hr.note[LL]}</div>}
            </div>
          );
        })()}

        <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${C.line}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: T.fMicro, color: C.muted }}>{lang === "hi" ? "व्यक्तिगत सलाह — अपना लग्न:" : "Personalize — your ascendant:"}</span>
            <select value={horaAsc == null ? "" : horaAsc} onChange={(e) => setHoraAsc(e.target.value === "" ? null : parseInt(e.target.value))} style={{ fontSize: T.fMicro, padding: "5px 8px", borderRadius: T.rSm, border: `1px solid ${C.line}`, background: C.panel, color: C.ivory, fontFamily: T.body, maxWidth: 180 }}>
              <option value="">{lang === "hi" ? "— चुनें —" : "— none —"}</option>
              {SIGNS.map((sg, i) => <option key={i} value={i}>{sg}</option>)}
            </select>
          </div>
          <div style={{ fontSize: T.fMicro, color: C.muted, marginTop: 5, fontStyle: "italic" }}>{lang === "hi" ? "लग्न नहीं पता? 'कुंडली' टैब में कुंडली बनाएँ।" : "Don't know it? Cast your chart in the Chart tab."}</div>
        </div>
      </div>

    </div>
  );
}

export { MuhuratHub };
