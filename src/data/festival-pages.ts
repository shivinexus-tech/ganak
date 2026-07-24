/* Stable dedicated-page registry for every openable festival/observance label.
   Routes are generated from the live metadata keys so page coverage cannot drift
   away from the Fasts & Festivals lists. */

import { FEST_META, FEST_NAME, OBS_META, OBS_NAME } from "./festival-meta";
import { VRAT_VIDHI } from "./vrat-vidhis";
import { NAVADURGA_PAGE_ENTRIES } from "./navadurga-pages";

const CHHATH_SHARED_KEYS = Object.freeze([
  "chhathNahayKhay", "chhathKharna", "chhath", "chhathUshaArghya",
]);

const DEFERRED_MULTI_DAY_KEYS = Object.freeze([]);

const EXCLUDED_PAGE_KEYS = Object.freeze([...CHHATH_SHARED_KEYS]);

const LEGACY_SLUGS = Object.freeze({
  hartalikaTeej: "hartalika-teej",
  chaitraNavratri: "chaitra-navratri",
  sharadNavratri: "sharad-navratri",
  chhath: "chhath",
});

const LEGACY_TITLES = Object.freeze({
  chaitraNavratri: { en: "Chaitra Navratri", hi: "चैत्र नवरात्रि" },
  sharadNavratri: { en: "Sharad Navratri", hi: "शारदीय नवरात्रि" },
  chhath: { en: "Chhath — four-day observance", hi: "छठ — चार-दिवसीय व्रत" },
});

const FESTIVAL_VIDHI_KEYS = Object.freeze({
  skandaSashtiBegins: "skandaSashtiBegins",
  skandaSashtiSoorasamharam: "skandaSashtiSoorasamharam",
  skandaSashtiThirukalyanam: "skandaSashtiThirukalyanam",
  ayyappaMandalaBegins: "ayyappaMandalaBegins",
  ayyappaMandalaPuja: "ayyappaMandalaPuja",
});

/* A key enters this list only after its permanent page has been reviewed against
   the current substantive-major standard: bilingual answer-first guidance,
   significance, household worship, food/fasting boundaries, stories and labelled
   regional variation. The validation gate makes regression to metadata-only fail. */
const REVIEWED_MAJOR_FESTIVAL_KEYS = Object.freeze([
  "makarSankranti",
  "diwali",
  "holika",
  "rangwaliHoli",
  "ramNavami",
  "hanumanJ",
  "akshaya",
  "guruPurnima",
  "rakshaBandhan",
  "dussehra",
  "dhanteras",
  "narakChaturdashi",
  "govardhanPuja",
  "bhaiDooj",
  "gudiPadwa",
  "ugadi",
  "buddhaPurnima",
  "rathYatra",
  "kartikaPurnima",
  "mahaShivaratri",
  "chaitraNavratri",
  "sharadNavratri",
  "ganeshChaturthi",
  "janmashtami",
  "chhath",
  "karvaChauth",
  "ahoiAshtami",
  "hartalikaTeej",
  "sheetlaAshtami",
]);

const slugFromKey = (key) => String(key)
  .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
  .replace(/_/g, "-")
  .replace(/[^A-Za-z0-9-]+/g, "-")
  .replace(/-{2,}/g, "-")
  .replace(/^-|-$/g, "")
  .toLowerCase();

const slugFromEnglish = (name) => String(name)
  .normalize("NFKD")
  .replace(/[’']/g, "")
  .replace(/[^A-Za-z0-9]+/g, "-")
  .replace(/-{2,}/g, "-")
  .replace(/^-|-$/g, "")
  .toLowerCase();

function observanceBaseKey(key) {
  if (String(key).startsWith("pradosh_")) return "pradosh";
  if (String(key).endsWith("_11")) return "ekadashi";
  return key;
}

function makeFestivalEntries() {
  return Object.entries(FEST_NAME).map(([key, title]) => {
    const sharedChhath = CHHATH_SHARED_KEYS.includes(key);
    const deferred = DEFERRED_MULTI_DAY_KEYS.includes(key);
    const slug = sharedChhath ? "chhath" : (deferred ? null : (LEGACY_SLUGS[key] || slugFromKey(key)));
    return Object.freeze({
      sourceKind: "festival",
      key,
      metaKey: key,
      title: LEGACY_TITLES[key] || title,
      slug,
      path: slug ? `/festival/${slug}` : null,
      status: sharedChhath ? "shared" : (deferred ? "deferred" : "required"),
      vidhiKey: sharedChhath ? "chhath" : (FESTIVAL_VIDHI_KEYS[key] || (VRAT_VIDHI[key] ? key : null)),
    });
  });
}

function makeObservanceEntries() {
  const raw = Object.entries(OBS_NAME).map(([key, title]) => {
    const baseKey = observanceBaseKey(key);
    const isNamedVariant = baseKey !== key;
    return {
      sourceKind: "observance",
      key,
      metaKey: baseKey,
      title,
      baseSlug: isNamedVariant ? slugFromEnglish(title.en) : slugFromKey(key),
      vidhiKey: VRAT_VIDHI[baseKey] ? baseKey : null,
    };
  });
  const counts = raw.reduce((out, item) => {
    out[item.baseSlug] = (out[item.baseSlug] || 0) + 1;
    return out;
  }, {});
  return raw.map((item) => {
    const slug = counts[item.baseSlug] > 1
      ? `${item.baseSlug}-${slugFromKey(item.key.replace(/_11$/, ""))}`
      : item.baseSlug;
    return Object.freeze({
      sourceKind: item.sourceKind,
      key: item.key,
      metaKey: item.metaKey,
      title: item.title,
      slug,
      path: `/festival/${slug}`,
      status: "required",
      vidhiKey: item.vidhiKey,
    });
  });
}

const FESTIVAL_PAGE_ENTRIES = Object.freeze([...makeFestivalEntries(), ...makeObservanceEntries()]);

function makeRouteRegistry(entries) {
  const routes = {};
  for (const entry of entries) {
    if (!entry.path || entry.status === "deferred") continue;
    if (entry.status === "shared" && entry.key !== "chhath") continue;
    if (routes[entry.path]) {
      throw new Error(`Duplicate festival page path: ${entry.path}`);
    }
    routes[entry.path] = entry;
  }
  return Object.freeze(routes);
}

const FESTIVAL_PAGE_ROUTES = makeRouteRegistry([...FESTIVAL_PAGE_ENTRIES, ...NAVADURGA_PAGE_ENTRIES]);
const REQUIRED_PAGE_ENTRIES = Object.freeze(FESTIVAL_PAGE_ENTRIES.filter((entry) => entry.status === "required"));
const DEFERRED_PAGE_ENTRIES = Object.freeze(FESTIVAL_PAGE_ENTRIES.filter((entry) => entry.status === "deferred"));
const SHARED_PAGE_ENTRIES = Object.freeze(FESTIVAL_PAGE_ENTRIES.filter((entry) => entry.status === "shared"));

export {
  CHHATH_SHARED_KEYS,
  DEFERRED_MULTI_DAY_KEYS,
  EXCLUDED_PAGE_KEYS,
  FESTIVAL_PAGE_ENTRIES,
  FESTIVAL_PAGE_ROUTES,
  REQUIRED_PAGE_ENTRIES,
  DEFERRED_PAGE_ENTRIES,
  SHARED_PAGE_ENTRIES,
  REVIEWED_MAJOR_FESTIVAL_KEYS,
  NAVADURGA_PAGE_ENTRIES,
  FEST_META,
  OBS_META,
  observanceBaseKey,
  slugFromKey,
};
