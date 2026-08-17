/* The address parser and the canonical link builder.
 *
 * Pure functions over `src/routes/route-map.ts`. No React, no DOM, no I/O — so
 * the validation harness, the prerenderer and the app shell all get the same
 * answer, and `validation/route-contract.cjs` can exercise every address.
 *
 * EVERY internal link goes through `buildPath` / `buildAddress`. Nothing in the
 * codebase should hand-write a URL string: that is how `/kundli` and `/Kundli`
 * and `/kundli/` end up as three pages with one page's ranking split between
 * them.
 *
 * Language lives in the path, not a query parameter, so every page has an
 * address that says what language it is. `splitLangPath` runs BEFORE the
 * festival/calculator/medical matchers, which then see an unprefixed path and
 * stay unchanged.
 */

import {
  ROUTES, LANGS, DEFAULT_LANG, STATE_KEYS, ADDRESS_CARRIED_KEYS, PLACE_STATE_KEYS,
  LEGACY_SCREEN_ROUTES, routeById, cityBySlug, CITY_ROUTES,
} from "../routes/route-map";
import type { Lang, RouteDef } from "../routes/route-map";

/* Slugs are lower-case Latin words joined by single hyphens. Never Devanagari:
   percent-encoding makes a shared WhatsApp link unreadable. */
const SLUG = "[a-z0-9]+(?:-[a-z0-9]+)*";

const PREFIXED_LANGS = LANGS.filter((code) => code !== DEFAULT_LANG);

function normalize(pathname: string): string {
  const clean = String(pathname || "/").replace(/\/{2,}/g, "/");
  return clean.length > 1 ? clean.replace(/\/+$/, "") : clean;
}

/* ---------------------------------------------------------------------------
   Language prefix. `/hi` is matched as a whole segment only — `/hindi/...` and
   `/hip` are English. Tasks 2-4 of the merged plan import exactly these two.
   --------------------------------------------------------------------------- */
export function splitLangPath(pathname: string): { lang: Lang; rest: string; prefixed: boolean } {
  const clean = normalize(pathname);
  for (const code of PREFIXED_LANGS) {
    if (clean === `/${code}`) return { lang: code, rest: "/", prefixed: true };
    if (clean.startsWith(`/${code}/`)) {
      return { lang: code, rest: clean.slice(code.length + 1) || "/", prefixed: true };
    }
  }
  return { lang: DEFAULT_LANG, rest: clean, prefixed: false };
}

/* Build the address of `pathname` in `lang`, idempotently. Path only — use
   `twinAddress` when the state riding on the URL has to come across too. */
export function withLang(pathname: string, lang: string): string {
  const { rest } = splitLangPath(pathname);
  if (lang === DEFAULT_LANG || !PREFIXED_LANGS.includes(lang as Lang)) return rest;
  return rest === "/" ? `/${lang}/` : `/${lang}${rest}`;
}

/* ---------------------------------------------------------------------------
   Parsing a path into a route.
   --------------------------------------------------------------------------- */
const PATTERNS = new WeakMap<RouteDef, RegExp>();

function patternFor(def: RouteDef): RegExp {
  const cached = PATTERNS.get(def);
  if (cached) return cached;
  const body = def.path.replace(/:[a-z]+/g, `(${SLUG})`);
  /* The city segment is optional: /panchang/hora and /panchang/hora/delhi are
     both this route. */
  const city = def.city ? `(?:\\/(${SLUG}))?` : "";
  const built = new RegExp(`^${body}${city}$`);
  PATTERNS.set(def, built);
  return built;
}

export type ParsedRoute = {
  found: boolean;
  lang: Lang;
  /* Route id from the map, or null when nothing in the map owns this path. */
  route: string | null;
  city: string | null;
  params: Record<string, string>;
  /* The path with the language prefix removed — what the existing matchers see. */
  rest: string;
};

function notFound(lang: Lang, rest: string): ParsedRoute {
  return { found: false, lang, route: null, city: null, params: {}, rest };
}

export function parsePath(pathname: string): ParsedRoute {
  const { lang, rest } = splitLangPath(pathname);
  for (const def of ROUTES) {
    const match = patternFor(def).exec(rest);
    if (!match) continue;
    const params: Record<string, string> = {};
    def.params.forEach((name, index) => { params[name] = match[index + 1]; });
    const city = def.city ? (match[def.params.length + 1] || null) : null;
    /* A city outside the cap is not an address Ganak owns. Enforcing the cap in
       the parser, not only in the emitter, is what stops it from being a
       convention a later lane can drift past. */
    if (city && !cityBySlug(city)) return notFound(lang, rest);
    return { found: true, lang, route: def.id, city, params, rest };
  }
  return notFound(lang, rest);
}

/* ---------------------------------------------------------------------------
   Building a canonical path.
   --------------------------------------------------------------------------- */
export type AddressSpec = {
  route: string;
  lang?: string;
  city?: string | null;
  params?: Record<string, string>;
  state?: Record<string, string | null | undefined>;
};

export function buildPath(spec: AddressSpec): string {
  const def = routeById(spec.route);
  if (!def) throw new Error(`buildPath: unknown route "${spec.route}" — add a row to route-map.ts`);

  const params = spec.params || {};
  let path = def.path;
  for (const name of def.params) {
    const value = params[name];
    if (!value) throw new Error(`buildPath: route "${def.id}" needs a :${name}`);
    if (!new RegExp(`^${SLUG}$`).test(value)) {
      throw new Error(`buildPath: :${name} "${value}" is not a URL-safe slug`);
    }
    path = path.replace(`:${name}`, value);
  }

  const city = spec.city || null;
  if (city) {
    if (!def.city) throw new Error(`buildPath: route "${def.id}" takes no city segment`);
    if (!cityBySlug(city)) {
      throw new Error(`buildPath: "${city}" is not one of the ${CITY_ROUTES.length} capped city routes`);
    }
    path = `${path === "/" ? "" : path}/${city}`;
  }

  return withLang(path, spec.lang || DEFAULT_LANG);
}

/* ---------------------------------------------------------------------------
   State. The URL is the state carrier — browser storage is banned project-wide —
   so the builder has to be able to put every §4 key back on the address.
   --------------------------------------------------------------------------- */
function stateKeysFor(def: RouteDef): string[] {
  const skip = new Set<string>(ADDRESS_CARRIED_KEYS);
  /* On a city route the slug IS the place, so re-emitting city/lat/lon/zone
     would let an address contradict itself. */
  if (def.city) for (const key of PLACE_STATE_KEYS) skip.add(key);
  return STATE_KEYS.filter((key) => !skip.has(key));
}

export function buildAddress(spec: AddressSpec): string {
  const def = routeById(spec.route);
  if (!def) throw new Error(`buildAddress: unknown route "${spec.route}"`);
  const path = buildPath(spec);
  const state = spec.state || {};

  const query = new URLSearchParams();
  for (const key of stateKeysFor(def)) {
    const value = state[key];
    if (value === null || value === undefined || value === "") continue;
    query.set(key, String(value));
  }
  const search = query.toString();
  return search ? `${path}?${search}` : path;
}

export type ParsedAddress = ParsedRoute & { state: Record<string, string> };

export function parseAddress(url: string): ParsedAddress {
  const raw = String(url || "/");
  const cut = raw.search(/[?#]/);
  const pathname = cut === -1 ? raw : raw.slice(0, cut);
  const search = cut === -1 || raw[cut] !== "?" ? "" : raw.slice(cut + 1).split("#")[0];
  const query = new URLSearchParams(search);

  let parsed = parsePath(pathname);

  /* Legacy shared links. `?lang=` and `?screen=` are still read so that every
     URL anyone has already shared keeps working; they are then canonicalised
     into the address and never emitted again. */
  const legacyLang = query.get("lang");
  if (!splitLangPath(pathname).prefixed && (legacyLang === "hi" || legacyLang === "en")) {
    parsed = { ...parsed, lang: legacyLang };
  }
  const legacyScreen = query.get("screen");
  if (parsed.route === "panchang" && legacyScreen && LEGACY_SCREEN_ROUTES[legacyScreen]) {
    parsed = { ...parsed, route: LEGACY_SCREEN_ROUTES[legacyScreen] };
  }

  const def = parsed.route ? routeById(parsed.route) : null;
  const state: Record<string, string> = {};
  if (def) {
    for (const key of stateKeysFor(def)) {
      const value = query.get(key);
      if (value !== null && value !== "") state[key] = value;
    }
    /* Read back off the address itself, which is where they now live. */
    state.lang = parsed.lang;
    state.screen = def.screen;
    if (def.city && parsed.city) state.city = parsed.city;
  }

  return { ...parsed, state };
}

/* ---------------------------------------------------------------------------
   The language switch. Under "one language per address" (contract §10.6) this is
   a real navigation, not an in-page toggle, so it has to carry the place, the
   date and any route-specific state across to the twin address.
   --------------------------------------------------------------------------- */
export function twinAddress(url: string, lang: string): string {
  const parsed = parseAddress(url);
  if (!parsed.found || !parsed.route) {
    /* Not an address we own — still honour the switch rather than dropping the
       visitor on the root, and keep whatever was riding on the URL. */
    const raw = String(url || "/");
    const cut = raw.search(/[?#]/);
    const tail = cut === -1 ? "" : raw.slice(cut);
    return withLang(cut === -1 ? raw : raw.slice(0, cut), lang) + tail;
  }
  return buildAddress({ ...parsed, lang });
}

/* ---------------------------------------------------------------------------
   Enumeration, for the prerendering and hreflang lanes.
   --------------------------------------------------------------------------- */
export type Address = {
  route: string;
  lang: Lang;
  path: string;
  /* The same page in the other language. Reciprocity — A names B and B names A —
     is the part Google actually validates. */
  altPath: string;
  city: string | null;
  params: Record<string, string>;
};

export function addressPair(spec: Omit<AddressSpec, "lang">): Address[] {
  const paths = LANGS.map((lang) => ({ lang, path: buildAddress({ ...spec, lang }) }));
  return paths.map(({ lang, path }) => ({
    route: spec.route,
    lang,
    path,
    altPath: paths.find((other) => other.lang !== lang)!.path,
    city: spec.city || null,
    params: spec.params || {},
  }));
}

/* Every address the map can enumerate on its own — that is, every route with no
   parameters, times its cities, times the languages. Festival and calculator
   slugs live in their own data modules, so the prerender lane supplies those and
   calls `addressPair` per slug. */
export function expandRoutes(): Address[] {
  const out: Address[] = [];
  for (const def of ROUTES) {
    if (def.params.length > 0) continue;
    out.push(...addressPair({ route: def.id }));
    if (def.city) {
      for (const city of CITY_ROUTES) out.push(...addressPair({ route: def.id, city: city.slug }));
    }
  }
  return out;
}
