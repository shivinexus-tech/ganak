import { panchangTerm, SIGN_ORDER, SIGN_EN_WESTERN } from "../i18n/panchang-terms";
/* Transit duration + event gloss helpers (SPLIT-UI-CHART-05). Wire deferred.

   Bilingual by construction (bug-bash 2026-08-18 F6). Everything a reader sees on a
   transit row used to be English-only regardless of the language toggle: the gloss
   that IS the answer-before-data explanation, the countdown, and the sign-duration.
   Every string here now comes in both languages, keyed the same way as
   LUNATION_GLOSS, which was already correct. `lang` defaults to "en" so existing
   call sites keep working while they are threaded through. */

const HI_UNITS = { y: "वर्ष", m: "माह", d: "दिन", h: "घंटे" };

function fmtDur(ms, lang = "en") {
  const hi = lang === "hi";
  const days = Math.round(ms / 86400000);
  if (days < 31) return hi ? `${days} ${HI_UNITS.d}` : days + (days === 1 ? " day" : " days");
  const months = Math.floor(days / 30.44);
  const remD = Math.round(days - months * 30.44);
  const years = Math.floor(months / 12);
  const remM = months % 12;
  const parts = [];
  if (years) parts.push(hi ? `${years} ${HI_UNITS.y}` : years + "y");
  if (remM) parts.push(hi ? `${remM} ${HI_UNITS.m}` : remM + "m");
  if (!years && remD) parts.push(hi ? `${remD} ${HI_UNITS.d}` : remD + "d");
  return parts.join(" ") || (hi ? `${days} ${HI_UNITS.d}` : days + " days");
}

/* A transit that has begun and has no computed end within the window. */
const ongoingLabel = (lang) => (lang === "hi" ? "चल रहा है" : "ongoing");

/* event detail enrichment */
const EVENT_DESC = {
  // "Sankranti" is matched before the generic "enters" so the solar-ingress gloss wins.
  "Sankranti": {
    en: "Sankranti marks the Sun's entry into a new sign, shifting seasonal energies and the rhythm of nature.",
    hi: "संक्रांति सूर्य का नई राशि में प्रवेश है, जिससे ऋतु-ऊर्जा और प्रकृति की लय बदलती है।",
  },
  "Purnima": {
    en: "Full moon — a peak of lunar power, heightened intuition and emotional intensity.",
    hi: "पूर्ण चन्द्र — चन्द्र-बल का शिखर; अन्तर्ज्ञान और भावनाओं की प्रबलता।",
  },
  "Amavasya": {
    en: "New moon — a reset point, ideal for new beginnings and introspection.",
    hi: "नव चन्द्र — पुनरारम्भ का बिन्दु; नए आरम्भ और आत्म-चिन्तन के लिए अनुकूल।",
  },
  "enters": {
    en: "A planet changing signs shifts its character and influence across domains of life.",
    hi: "ग्रह के राशि बदलने पर उसका स्वभाव और प्रभाव जीवन के भिन्न क्षेत्रों में बदल जाता है।",
  },
  "retrograde": {
    en: "A planet appears to move backward, triggering introspection, review, and the ripening of past karma.",
    hi: "ग्रह पीछे चलता प्रतीत होता है — यह आत्म-निरीक्षण, पुनरावलोकन और पूर्व-कर्म के परिपाक का काल है।",
  },
  "direct": {
    en: "A planet resumes forward motion, completing its review cycle and moving intention into action.",
    hi: "ग्रह पुनः मार्गी होता है — पुनरावलोकन का चक्र पूर्ण होता है और संकल्प क्रिया में बदलता है।",
  },
};

/* Countdown, or count-UP for an event already past.

   The Panchang date picker lets a reader look at any date, and the events card is
   rebuilt from the selected date while the countdown is measured from the real
   clock — so on any past date every `until` is negative. There was no negative
   branch, so the `days > 0 ? … : hours > 0 ? … : "Today"` chain fell through and
   labelled every single row "Today", next to that row's own 2026 timestamp
   (bug-bash 2026-08-18 F16). Past events now say how long ago they were. */
function relTime(untilMs, lang) {
  const hi = lang === "hi";
  const past = untilMs < 0;
  const abs = Math.abs(untilMs);
  const days = Math.floor(abs / 86400000);
  const hours = Math.floor((abs % 86400000) / 3600000);
  if (!past) {
    if (days > 0) return hi ? `${days} ${HI_UNITS.d} ${hours} ${HI_UNITS.h}` : `${days}d ${hours}h`;
    if (hours > 0) return hi ? `${hours} ${HI_UNITS.h}` : `${hours}h`;
    return hi ? "आज" : "Today";
  }
  if (days >= 31) {
    const months = Math.floor(days / 30.44);
    return hi ? `${months} ${HI_UNITS.m} पहले` : `${months} month${months === 1 ? "" : "s"} ago`;
  }
  if (days > 0) return hi ? `${days} ${HI_UNITS.d} पहले` : `${days} day${days === 1 ? "" : "s"} ago`;
  if (hours > 0) return hi ? `${hours} ${HI_UNITS.h} पहले` : `${hours} hour${hours === 1 ? "" : "s"} ago`;
  return hi ? "आज" : "Today";
}

function eventDetail(ev, now, lang = "en") {
  const until = ev.t - now;
  const days = Math.floor(until / 86400000);
  const hours = Math.floor((until % 86400000) / 3600000);
  let entry = null;
  for (const key of Object.keys(EVENT_DESC)) {
    if (ev.label.includes(key)) { entry = EVENT_DESC[key]; break; }
  }
  const desc = entry ? (lang === "hi" ? entry.hi : entry.en) : "";
  const timeStr = relTime(until, lang);
  // Both languages are returned as well, so a call site that has not been threaded
  // through yet can pick the right one without another engine change.
  return {
    desc, timeStr, days, hours, past: until < 0,
    descEn: entry ? entry.en : "", descHi: entry ? entry.hi : "",
    timeStrEn: relTime(until, "en"), timeStrHi: relTime(until, "hi"),
  };
}

/* The engine builds these labels in one canonical language so the rules can key off them.
   Hindi readers still need Devanagari, so the transliteration happens here, in the
   interpretation layer, and never inside the astronomy. Unrecognised labels pass through
   unchanged rather than disappearing. */
/* The lunation gloss is presentation, so the engine emits only the event name
   ("Purnima") and BOTH languages are dressed here (E-1.0 B7). */
const LUNATION_GLOSS = {
  Purnima: { en: "Purnima — full moon", hi: "पूर्णिमा — पूर्ण चन्द्र" },
  Amavasya: { en: "Amavasya — new moon", hi: "अमावस्या — नव चन्द्र" },
};

function transitLabel(lang, label) {
  const text = String(label || "");
  const lunation = LUNATION_GLOSS[text];
  if (lunation) return lang === "hi" ? lunation.hi : lunation.en;
  // English mode names the rashi in English (E-1.0 B4). The engine emits the Sanskrit
  // name, so swap it here — a label change only; the sign is the same sidereal sign.
  // "Sankranti" is an event name and stays Sanskrit in both languages.
  if (lang !== "hi") {
    return SIGN_ORDER.reduce((out, sanskrit, i) =>
      out.replace(new RegExp(`\\b${sanskrit}\\b`), SIGN_EN_WESTERN[i]), text);
  }
  /* Ingress headlines are BUILT in Hindi, not word-swapped.
     `.replace(/ enters /, " प्रवेश ")` left the English subject-verb-object order
     standing — "बुध प्रवेश सिंह" is not a Hindi sentence. Hindi is verb-final, so the
     reading is "बुध का सिंह में प्रवेश" (bug-bash 2026-08-18 F9). Parsing the two
     structured halves out of the canonical label and re-composing them also means the
     planet and sign go through the same term tables as everywhere else; anything that
     does not match this shape falls through to the term-table pass unchanged. */
  const ingress = text.match(/^(\S+) enters (\S+)(\s·\sSankranti)?$/);
  if (ingress) {
    const [, planet, sign, sankranti] = ingress;
    const pl = panchangTerm("hi", "planet", planet);
    const sg = panchangTerm("hi", "sign", sign);
    return `${pl} का ${sg} में प्रवेश${sankranti ? " · संक्रांति" : ""}`;
  }
  let out = text
    .replace(/ turns retrograde ℞/, " वक्री ℞")
    .replace(/ turns direct/, " मार्गी")
    .replace(/ · Sankranti$/, " · संक्रांति")
    .replace(/ enters /, " प्रवेश ");
  // Phrases first, then the two term tables: "full moon" must already be gone before
  // the planet table could touch a stray "Moon".
  out = panchangTerm("hi", "planet", out);
  out = panchangTerm("hi", "sign", out);
  return out;
}

export { fmtDur, ongoingLabel, EVENT_DESC, eventDetail, relTime, transitLabel };
