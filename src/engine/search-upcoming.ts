/* Upcoming observances search (SPLIT-UI-03e-engine). Wire deferred. */

import { TITHIS, moonSidMs, sunSidMs, sunEvents, zoneOffset } from "./panchang";
import { rev } from "./ephemeris";
import { EKADASHI_NAMES, PRADOSH_NAMES_BY_DAY, obsKind, scanPanchangCalendar } from "./festivals";
import { FEST_NAME, OBS_NAME } from "../data/festival-meta";
import { TITHI_HI } from "../i18n/panchang-terms";

function searchUpcoming(query, fromMs, tz, maxN = 24, place = null) {
  const q = (query || "").trim().toLowerCase();
  const qraw = (query || "").trim();
  if (!q) return [];
  
  const DAY = 86400000;

  const genericEkadashi = q === "ekadashi" || qraw === "एकादशी";
  const genericPradosh = q === "pradosh" || q === "pradosh vrat" || qraw === "प्रदोष" || qraw === "प्रदोष व्रत";

  // Preserve every matching named variant: an unqualified shared term such as
  // "Putrada Ekadashi" must offer both canonical annual observances.
  const ekVariantMatches = genericEkadashi ? [] : Object.entries(EKADASHI_NAMES)
    .filter(([, names]) => names.en.toLowerCase().includes(q) || names.hi.includes(qraw))
    .map(([key]) => key);
  
  // Check if query matches a pradosh variant
  const pradoshDayMatches = [];
  for (const [dayNum, names] of Object.entries(PRADOSH_NAMES_BY_DAY)) {
    if (names.en.toLowerCase().includes(q) || names.hi.includes(qraw)) {
      pradoshDayMatches.push(Number(dayNum));
    }
  }
  
  // If ekadashi variant or pradosh variant matched, use scanPanchangCalendar which has lunar context
  if (genericEkadashi || genericPradosh || ekVariantMatches.length || pradoshDayMatches.length) {
    const r = scanPanchangCalendar(fromMs, tz, 430, 430, place);
    const out = [];
    const pradoshKeys = ["pradosh_Sunday", "pradosh_Monday", "pradosh_Tuesday", "pradosh_Wednesday", "pradosh_Thursday", "pradosh_Friday", "pradosh_Saturday"];
    for (const fast of r.fasts) {
      if ((genericEkadashi && obsKind(fast.key) === "ekadashi") || ekVariantMatches.includes(fast.key)) {
        const label = EKADASHI_NAMES[fast.key]?.en || OBS_NAME.ekadashi.en;
        out.push({ ms: fast.ms, kind: "fast", key: fast.key, label });
      } else if ((genericPradosh && obsKind(fast.key) === "pradosh") || pradoshDayMatches.some((day) => fast.key === pradoshKeys[day])) {
        const day = pradoshKeys.indexOf(fast.key);
        const label = PRADOSH_NAMES_BY_DAY[day]?.en || OBS_NAME.pradosh.en;
        out.push({ ms: fast.ms, kind: "fast", key: fast.key, label });
      }
    }
    out.sort((a, b) => a.ms - b.ms);
    return out.slice(0, maxN);
  }
  
  /* Generic tithi search.

     Both halves of this used to be wrong (bug-bash 2026-08-18 F3, F14):

     1. The matchers were Latin-only, so a Devanagari query never reached this
        branch at all — it fell through to the festival matcher and came back with
        whatever festival happened to contain the word ("सप्तमी" returned Durga Puja
        Saptami and Ratha Saptami, not the next Saptami tithis). Same query, same
        toggle, different answer set. `TITHI_HI` is the app's one source of truth
        for Devanagari tithi names, so both scripts now enter here.

     2. The date was picked by sampling the tithi at local NOON and reporting the
        first civil day on which the tithi was current then. Purnima runs 27 Aug
        09:10 → 28 Aug 09:50 IST in 2026, so noon on the 27th sat inside it and the
        search answered 27 Aug — while Ganak's event card and the Devanagari path
        both answered 28 Aug. The app's own observance rule for purnima/amavasya
        (`FAST_KALA_RULES`, kala "udaya") is the *sunrise* rule: the day belongs to
        the tithi prevailing at its sunrise. That is the majority reading in the
        Hindu calendar tradition and already what every other Ganak surface applies,
        so the tithi branch now applies it too and the two scripts agree by
        construction. A tithi that never prevails at any sunrise is *kshaya* — it
        has no calendar day and is not listed, exactly as festivals.ts treats it. */
  const lowerT = TITHIS.map((t) => t.toLowerCase());
  const hiOf = (name) => TITHI_HI[name] || "";
  const matchesTithi = (name) => {
    const en = name.toLowerCase(), hi = hiOf(name);
    return en === q || en.startsWith(q) || q.startsWith(en) || (!!hi && (qraw === hi || hi.startsWith(qraw)));
  };
  const tIdx = lowerT.findIndex((t, i) => matchesTithi(TITHIS[i]));
  const isPurnima = matchesTithi("Purnima") || "purnima".startsWith(q) || q.includes("poornima");
  const isAmavasya = matchesTithi("Amavasya") || "amavasya".startsWith(q) || q.includes("amavas");
  const out = [];

  let targets = [];
  if (tIdx >= 0 && tIdx <= 13) targets = [tIdx, tIdx + 15];
  else if (isPurnima) targets = [14];
  else if (isAmavasya) targets = [29];

  if (targets.length) {
    const nameOf = (tg) => tg === 14 ? "Purnima" : tg === 29 ? "Amavasya" : TITHIS[tg % 15];
    const zone = place && place.zone;
    const lat = Number(place && place.lat), lon = Number(place && place.lon);
    // `Number(null)` is 0, not NaN — testing only isFinite would silently take
    // every place-less search to sunrise on the equator at longitude 0.
    const hasPlace = !!place && place.lat != null && place.lon != null
      && Number.isFinite(lat) && Number.isFinite(lon);
    /* Sunrise for civil day k, mirroring scanDayParts: the selected place's real
       sunrise when we have coordinates, and the same 06:00-local fallback that
       festivals.ts uses when we do not, so both paths degrade identically. */
    const sunriseOf = (k) => {
      const d = new Date(fromMs + k * DAY + tz * 3600000);
      const y = d.getUTCFullYear(), m = d.getUTCMonth() + 1, day = d.getUTCDate();
      const off = (zone && zoneOffset(zone, y, m, day)) ?? tz;
      if (!hasPlace) return Date.UTC(y, m - 1, day, 6) - off * 3600000;
      const ev = sunEvents(y, m, day, off, lat, lon);
      return ev && ev.rise != null ? ev.rise : Date.UTC(y, m - 1, day, 6) - off * 3600000;
    };
    for (let k = 0; k < 430 && out.length < maxN + 2; k++) {
      const rise = sunriseOf(k);
      const tn = Math.floor(rev(moonSidMs(rise) - sunSidMs(rise)) / 12);
      if (!targets.includes(tn)) continue;
      // A vriddhi tithi prevails at two consecutive sunrises; list its first day only.
      const prev = [...out].reverse().find((o) => o._tg === tn);
      if (prev && rise - prev.ms <= 1.5 * DAY) continue;
      out.push({ ms: rise, kind: "tithi", label: nameOf(tn), paksha: (tn === 14 || tn === 29) ? null : (tn >= 15 ? "Krishna" : "Shukla"), _tg: tn });
    }
    out.sort((a, b) => a.ms - b.ms);
    return out.slice(0, maxN).map((o) => ({ ms: o.ms, kind: o.kind, label: o.label, paksha: o.paksha }));
  }

  // Festival/fast name search (generic fasts without variants)
  const matchN = (dict, key) => { const e = dict[key]; return !!e && (key.toLowerCase().includes(q) || (e.en && e.en.toLowerCase().includes(q)) || (e.hi && e.hi.includes(qraw))); };
  const r = scanPanchangCalendar(fromMs, tz, 430, 430, place);
  for (const f of r.festivals) if (matchN(FEST_NAME, f.key)) out.push({ ms: f.ms, kind: "festival", key: f.key });
  for (const f of r.fasts) {
    // Skip if it's a variant (has underscore) - variants are handled above
    if (!f.key.includes("_") && matchN(OBS_NAME, f.key)) out.push({ ms: f.ms, kind: "fast", key: f.key });
  }
  out.sort((a, b) => a.ms - b.ms);
  return out.slice(0, maxN);
}

export { searchUpcoming };
