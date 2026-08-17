/* The Ganak address contract — the one source of truth for every URL the site owns.
 *
 * THIS FILE IS DATA, NOT CODE. Adding a route is adding a row here; it is never
 * editing the app shell. That property is the whole point: the shell-wiring,
 * prerendering, hreflang, redirect and sitemap lanes all read this table, so they
 * can be built in parallel without colliding on `kundli-app.tsx`.
 *
 * Frozen by the merged plan `docs/superpowers/plans/2026-08-10-url-structure-hi-and-screens.md`
 * and binding under `plans/ganak-website-migration-contract.md` §4.
 *
 * Two rules that are easy to get wrong:
 *
 *   ONE LANGUAGE PER ADDRESS (§10.6, §10.8). Hindi is a separate address under
 *   `/hi/`, not an in-page toggle. `?lang=` is read for old shared links and then
 *   canonicalised away — it is never emitted.
 *
 *   THE CITY GOES IN THE PATH. `/panchang/rahu-kalam/bengaluru`, never
 *   `?city=bengaluru`. That is where the search volume is; a query-string city
 *   barely gets indexed.
 */

export const LANGS = ["en", "hi"] as const;
export type Lang = (typeof LANGS)[number];
export const DEFAULT_LANG: Lang = "en";

/* The only language that gets a path prefix today. Adding one is adding a row
   here and in LANGS — see `src/components/path-route.ts`, which matches a prefix
   as a whole segment only so `/hindi/...` and `/hip` stay English. */
export const LANG_PREFIX: Record<Lang, string> = { en: "", hi: "/hi" };

/* Every URL key from §4 "URL keys that must not be silently dropped", in the
   order the contract lists them. The builder emits query parameters in exactly
   this order so that one piece of state has exactly one address. */
export const STATE_KEYS = [
  "lang", "city", "lat", "lon", "zone", "date", "cal", "hol",
  "muhurat", "maction", "mfrom", "mto", "cstyle", "screen",
] as const;
export type StateKey = (typeof STATE_KEYS)[number];

/* Keys the address itself carries, so they are never also query parameters:
   `lang` is the `/hi/` prefix and `screen` is the path. Putting them back in the
   query would give the same page two addresses, which is the canonical-collapse
   bug this whole scheme exists to fix. They still survive a parse — they come
   back as parsed state, read off the address instead of out of the query. */
export const ADDRESS_CARRIED_KEYS = ["lang", "screen"] as const;

/* Place keys implied by a city segment. On a city route the slug is the place,
   so carrying these too would let `/panchang/hora/delhi?city=Mumbai` exist —
   an address that contradicts itself. The builder drops them there. */
export const PLACE_STATE_KEYS = ["city", "lat", "lon", "zone"] as const;

export type RouteKind = "screen" | "festival" | "calculator" | "catalogue" | "muhurat" | "concept";
export type Screen = "daily" | "prashna" | "chart";

export type RouteDef = {
  /* Stable identifier. Links are built from this, never from a hand-written string. */
  id: string;
  /* English path pattern, without the language prefix. `:name` marks a parameter. */
  path: string;
  kind: RouteKind;
  /* Which shell screen renders it — consumed by the shell-wiring lane. */
  screen: Screen;
  /* Parameter names, in the order they appear in the pattern. */
  params: readonly string[];
  /* Whether an optional trailing city segment is part of this address. */
  city: boolean;
  /* One line on what the address is for. Read by humans, not by code. */
  note: string;
};

export const ROUTES: readonly RouteDef[] = Object.freeze([
  /* --- The three product areas ------------------------------------------- */
  { id: "panchang", path: "/", kind: "screen", screen: "daily", params: [], city: false,
    note: "Daily Panchang — the site root." },
  { id: "prashna", path: "/prashna", kind: "screen", screen: "prashna", params: [], city: false,
    note: "Prashna. Had no address at all before the merged plan." },
  { id: "kundli", path: "/kundli", kind: "screen", screen: "chart", params: [], city: false,
    note: "Jyotish. The label stays 'Jyotish'; the address is /kundli because that is what Indians search (owner, 2026-08-10)." },

  /* --- Content pages ------------------------------------------------------ */
  { id: "festival", path: "/festival/:slug", kind: "festival", screen: "daily", params: ["slug"], city: false,
    note: "181 permanent observance guides. Slug resolution stays in FestivalGuideScreen; this map owns the shape only." },
  { id: "calculator", path: "/calculator/:slug", kind: "calculator", screen: "daily", params: ["slug"], city: false,
    note: "14 utility calculators. Slug resolution stays in utility-calculators.ts." },
  { id: "calculators", path: "/calculators", kind: "catalogue", screen: "daily", params: [], city: false,
    note: "Calculator catalogue." },
  { id: "muhurat-medical", path: "/muhurat/medical", kind: "muhurat", screen: "daily", params: [], city: false,
    note: "Medical Muhurat. §4 records it as reachable by direct URL only — that gap is the navigation lane's to close, not this map's." },

  /* --- Daily concepts, city-aware (owner-approved 2026-08-16) ------------- */
  /* Each is a real daily question with its own standing search demand, which the
     root Panchang page cannot rank for because it answers all of them at once. */
  { id: "hora", path: "/panchang/hora", kind: "concept", screen: "daily", params: [], city: true,
    note: "Planetary hours for the day." },
  { id: "rahu-kalam", path: "/panchang/rahu-kalam", kind: "concept", screen: "daily", params: [], city: true,
    note: "Rahu Kalam window for the day." },
  { id: "choghadiya", path: "/panchang/choghadiya", kind: "concept", screen: "daily", params: [], city: true,
    note: "Day and night Choghadiya table." },
  { id: "abhijit-muhurat", path: "/panchang/abhijit-muhurat", kind: "concept", screen: "daily", params: [], city: true,
    note: "Abhijit Muhurat window for the day." },
]);

export function routeById(id: string): RouteDef | null {
  return ROUTES.find((def) => def.id === id) || null;
}

/* ---------------------------------------------------------------------------
   THE CITY CAP — an owner decision of 2026-08-16, not a tuning knob.
   ---------------------------------------------------------------------------
   Four concepts multiplied by every place in the gazetteer would be thousands of
   near-identical pages differing only in a timestamp. That is the thin-content
   pattern search engines penalise, and it would put the whole domain at risk to
   chase cities nobody searches a Rahu Kalam for.
   Roughly the top 20 Indian cities is the deliberate ceiling. A later lane must
   NOT quietly raise this number: `validation/route-contract.cjs` fails if it
   moves, and the decision has to go back to the owner.
   --------------------------------------------------------------------------- */
export const CITY_ROUTE_CAP = 20;

/* Slugs are permanent — an address, once indexed, is a promise. Each `place`
   must match a `CITY_DB` label in `src/data/places.ts` exactly; the gate checks
   it, because a city route Ganak cannot compute a panchang for is a broken page.
   Ordered by population, which is also roughly panchang search demand.
   Two deliberate substitutions, so the ~20 are 20 distinct places rather than 20
   rows: Thane and Ghaziabad are suburbs of Mumbai and Delhi and would publish a
   near-duplicate of a page already here, so Varanasi — far higher observance
   search intent — takes a slot, and "New Delhi" is dropped in favour of "Delhi". */
export type CityRoute = { slug: string; place: string };

export const CITY_ROUTES: readonly CityRoute[] = Object.freeze([
  { slug: "delhi", place: "Delhi, India" },
  { slug: "mumbai", place: "Mumbai, India" },
  { slug: "bengaluru", place: "Bengaluru, India" },
  { slug: "hyderabad", place: "Hyderabad, India" },
  { slug: "chennai", place: "Chennai, India" },
  { slug: "kolkata", place: "Kolkata, India" },
  { slug: "pune", place: "Pune, India" },
  { slug: "ahmedabad", place: "Ahmedabad, India" },
  { slug: "jaipur", place: "Jaipur, India" },
  { slug: "lucknow", place: "Lucknow, India" },
  { slug: "surat", place: "Surat, India" },
  { slug: "kanpur", place: "Kanpur, India" },
  { slug: "nagpur", place: "Nagpur, India" },
  { slug: "indore", place: "Indore, India" },
  { slug: "bhopal", place: "Bhopal, India" },
  { slug: "patna", place: "Patna, India" },
  { slug: "visakhapatnam", place: "Visakhapatnam, India" },
  { slug: "vadodara", place: "Vadodara, India" },
  { slug: "ludhiana", place: "Ludhiana, India" },
  { slug: "varanasi", place: "Varanasi, India" },
]);

export function cityBySlug(slug: string): CityRoute | null {
  return CITY_ROUTES.find((city) => city.slug === slug) || null;
}

/* Legacy `?screen=` values, kept readable forever because people have shared
   those links. Reading them is this contract's job; emitting the 301s is the
   redirect lane's. */
export const LEGACY_SCREEN_ROUTES: Record<string, string> = Object.freeze({
  daily: "panchang",
  prashna: "prashna",
  chart: "kundli",
});
