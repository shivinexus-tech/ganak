#!/usr/bin/env node
// ============================================================================
// validation/route-contract.cjs — the gate over Ganak's address contract.
//
// WHY THIS EXISTS
// Six to eight downstream lanes (app-shell wiring, prerendering with reciprocal
// hreflang, legacy redirects, the sitemap sweep) all build against ONE frozen
// route map. If that map, the parser or the builder drifts, every one of those
// lanes silently ships a different idea of what Ganak's URLs are. This gate is
// what makes "adding a route is adding a row" true rather than aspirational.
//
// It asserts four things:
//   1. every address round-trips — parse(build(x)) deep-equals x
//   2. every route has an English and a Hindi form, each naming the other twin
//   3. the §4 state keys survive a parse and a rebuild
//   4. the city cap is enforced, at parse time and not merely by convention
//
// AND it proves itself non-vacuous: `checkContract()` is re-run against four
// deliberately broken contracts and must throw for each. A gate that cannot
// fail is not a gate, so that proof is permanent rather than a pasted anecdote.
// ============================================================================
'use strict';

const assert = require('node:assert/strict');
const { loadApp } = require('./_load-app.cjs');

const map = loadApp('src/routes/route-map.ts');
const route = loadApp('src/components/path-route.ts');
const places = loadApp('src/data/places.ts');

/* ---------------------------------------------------------------------------
   The contract check, expressed over an injected surface so that the mutation
   harness at the bottom can hand it broken versions of the same functions.
   --------------------------------------------------------------------------- */
function checkContract(api) {
  const {
    ROUTES, CITY_ROUTES, CITY_ROUTE_CAP, STATE_KEYS, LANGS,
    parsePath, parseAddress, buildPath, buildAddress, addressPair, expandRoutes, twinAddress,
  } = api;

  /* ---- 1. The map is a table, and every row is well formed ---------------- */
  assert.ok(ROUTES.length > 0, 'the route map must not be empty');
  const ids = ROUTES.map((r) => r.id);
  assert.equal(new Set(ids).size, ids.length, 'route ids must be unique');
  const paths = ROUTES.map((r) => r.path);
  assert.equal(new Set(paths).size, paths.length, 'route path patterns must be unique');

  for (const def of ROUTES) {
    assert.ok(def.path.startsWith('/'), `${def.id}: path pattern must be absolute`);
    assert.ok(!/[A-Z]/.test(def.path), `${def.id}: path patterns are lower case only`);
    assert.ok(!/[^\x20-\x7E]/.test(def.path), `${def.id}: Latin slugs only — never Devanagari in a URL`);
    assert.equal(typeof def.city, 'boolean', `${def.id}: must declare whether it takes a city segment`);
    assert.ok(Array.isArray(def.params), `${def.id}: must declare its parameters`);
    for (const name of def.params) {
      assert.ok(def.path.includes(`:${name}`), `${def.id}: declares :${name} but the pattern lacks it`);
    }
    const declared = (def.path.match(/:[a-z]+/g) || []).map((s) => s.slice(1));
    assert.deepEqual(declared, [...def.params], `${def.id}: pattern parameters and params[] disagree`);
  }

  /* Every address the merged 2026-08-10 plan froze, plus the four owner-approved
     daily-concept routes, must be present. This list is the contract's floor:
     a lane may add rows, never quietly drop one. */
  for (const expected of [
    '/', '/prashna', '/kundli', '/festival/:slug', '/calculator/:slug',
    '/calculators', '/muhurat/medical',
    '/panchang/hora', '/panchang/rahu-kalam', '/panchang/choghadiya', '/panchang/abhijit-muhurat',
  ]) {
    assert.ok(paths.includes(expected), `route map is missing the frozen address ${expected}`);
  }

  /* ---- 2. The city cap -------------------------------------------------- */
  assert.ok(CITY_ROUTE_CAP <= 25,
    `the city cap is an owner decision (2026-08-16, ~20 cities). Raising it to ${CITY_ROUTE_CAP} ` +
    'multiplies 4 concepts by every place in the gazetteer, which is the thin-content pattern ' +
    'search engines penalise. Take it back to the owner, do not edit this number.');
  assert.ok(CITY_ROUTES.length <= CITY_ROUTE_CAP,
    `city list (${CITY_ROUTES.length}) exceeds the cap (${CITY_ROUTE_CAP})`);
  assert.ok(CITY_ROUTES.length >= 15, 'the city list has collapsed — expected roughly 20 cities');

  const citySlugs = CITY_ROUTES.map((c) => c.slug);
  assert.equal(new Set(citySlugs).size, citySlugs.length, 'city slugs must be unique');
  for (const city of CITY_ROUTES) {
    assert.ok(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(city.slug), `city slug not URL-safe: ${city.slug}`);
    assert.ok(city.place, `city ${city.slug} must name a gazetteer place`);
  }

  /* ---- 3. Round-trip: parse(build(x)) deep-equals x ---------------------- */
  const samples = [];
  for (const def of ROUTES) {
    const params = {};
    for (const name of def.params) params[name] = name === 'slug' ? 'diwali' : 'sample';
    for (const lang of LANGS) {
      samples.push({ route: def.id, lang, city: null, params, state: {} });
      if (def.city) {
        for (const city of CITY_ROUTES) {
          samples.push({ route: def.id, lang, city: city.slug, params, state: {} });
        }
      }
    }
  }

  for (const spec of samples) {
    const built = buildAddress(spec);
    const parsed = parseAddress(built);
    assert.ok(parsed.found, `built address does not parse back: ${built}`);
    assert.equal(parsed.route, spec.route, `route lost in round-trip: ${built}`);
    assert.equal(parsed.lang, spec.lang, `lang lost in round-trip: ${built}`);
    assert.equal(parsed.city, spec.city, `city lost in round-trip: ${built}`);
    assert.deepEqual(parsed.params, spec.params, `params lost in round-trip: ${built}`);
    assert.equal(buildAddress(parsed), built, `rebuild is not stable: ${built}`);
  }

  /* Canonical shapes worth pinning by hand, because a refactor that "still
     round-trips" can still have moved the language or the city. */
  assert.equal(buildPath({ route: 'panchang', lang: 'en' }), '/');
  assert.equal(buildPath({ route: 'panchang', lang: 'hi' }), '/hi/');
  assert.equal(buildPath({ route: 'prashna', lang: 'hi' }), '/hi/prashna');
  assert.equal(buildPath({ route: 'kundli', lang: 'en' }), '/kundli');
  assert.equal(buildPath({ route: 'festival', lang: 'hi', params: { slug: 'diwali' } }), '/hi/festival/diwali');
  assert.equal(buildPath({ route: 'rahu-kalam', lang: 'en', city: 'bengaluru' }), '/panchang/rahu-kalam/bengaluru');
  assert.equal(buildPath({ route: 'rahu-kalam', lang: 'hi', city: 'bengaluru' }), '/hi/panchang/rahu-kalam/bengaluru');
  assert.equal(buildPath({ route: 'choghadiya', lang: 'en' }), '/panchang/choghadiya');

  /* The city belongs in the path. A query-string city is where the search
     volume is NOT, so the builder must never be able to emit one for a
     city-capable route. */
  const cityAddress = buildAddress({
    route: 'hora', lang: 'en', city: 'delhi',
    state: { city: 'Somewhere Else', lat: '1', lon: '2', zone: 'Asia/Tokyo' },
  });
  assert.equal(cityAddress, '/panchang/hora/delhi',
    'a city route must carry its place in the path and never contradict it in the query');

  /* ---- 4. Both languages, and reciprocal twins --------------------------- */
  for (const def of ROUTES) {
    const params = {};
    for (const name of def.params) params[name] = 'diwali';
    const pair = addressPair({ route: def.id, params });
    assert.equal(pair.length, 2, `${def.id}: must have exactly one address per language`);

    const byLang = Object.fromEntries(pair.map((a) => [a.lang, a]));
    for (const lang of LANGS) {
      assert.ok(byLang[lang], `${def.id}: no ${lang} address — every route needs both forms`);
    }
    assert.notEqual(byLang.en.path, byLang.hi.path, `${def.id}: the two languages share one address`);
    assert.equal(byLang.en.altPath, byLang.hi.path, `${def.id}: English does not name Hindi as its twin`);
    assert.equal(byLang.hi.altPath, byLang.en.path, `${def.id}: Hindi does not name English as its twin`);
    assert.ok(byLang.hi.path.startsWith('/hi/'), `${def.id}: the Hindi address must live under /hi/`);
    assert.ok(!byLang.en.path.startsWith('/hi/'), `${def.id}: the English address must not live under /hi/`);
  }

  /* Reciprocity across the whole enumerated surface — this is the exact
     property the hreflang lane asserts against the built HTML, checked here
     first so a broken map is caught before it reaches a build. */
  const all = expandRoutes();
  assert.ok(all.length > 0, 'expandRoutes() returned nothing');
  const byPath = new Map(all.map((a) => [a.path, a]));
  assert.equal(byPath.size, all.length, 'expandRoutes() emitted a duplicate address');
  for (const address of all) {
    const partner = byPath.get(address.altPath);
    assert.ok(partner, `altPath has no address: ${address.path} -> ${address.altPath}`);
    assert.equal(partner.altPath, address.path,
      `hreflang not reciprocal: ${address.path} <-> ${address.altPath}`);
    assert.notEqual(partner.lang, address.lang, `${address.path}: twin is in the same language`);
  }
  assert.equal(all.filter((a) => a.lang === 'en').length, all.filter((a) => a.lang === 'hi').length,
    'the two languages have a different number of addresses');

  /* ---- 5. The §4 state keys survive parse and rebuild -------------------- */
  const CONTRACT_KEYS = [
    'lang', 'city', 'lat', 'lon', 'zone', 'date', 'cal', 'hol',
    'muhurat', 'maction', 'mfrom', 'mto', 'cstyle', 'screen',
  ];
  for (const key of CONTRACT_KEYS) {
    assert.ok(STATE_KEYS.includes(key), `§4 key dropped from the contract: ${key}`);
  }

  /* Query-carried keys, on a route that has no city segment of its own. */
  const queryState = {
    city: 'Delhi, India', lat: '28.66', lon: '77.23', zone: 'Asia/Kolkata',
    date: '2026-08-16', cal: 'amanta', hol: 'on',
    muhurat: 'travel', maction: 'start', mfrom: '2026-08-16', mto: '2026-08-20',
    cstyle: 'south',
  };
  const stateful = buildAddress({ route: 'panchang', lang: 'hi', state: queryState });
  const back = parseAddress(stateful);
  for (const [key, value] of Object.entries(queryState)) {
    assert.equal(back.state[key], value, `§4 key did not survive the round-trip: ${key}`);
  }
  /* lang and screen are carried by the address itself, not by a query parameter —
     that is what "one language per address" means. They must still come back. */
  assert.equal(back.state.lang, 'hi', '§4 key lang did not survive the round-trip');
  assert.equal(back.state.screen, 'daily', '§4 key screen did not survive the round-trip');
  assert.equal(buildAddress(back), stateful, 'a stateful address does not rebuild identically');

  assert.equal(parseAddress('/kundli?cstyle=south').state.cstyle, 'south');
  assert.equal(parseAddress('/kundli?cstyle=south').state.screen, 'chart');
  assert.equal(parseAddress('/hi/prashna').state.screen, 'prashna');

  /* ---- 6. The language switch is a navigation that carries state --------- */
  assert.equal(
    twinAddress('/festival/diwali?city=Delhi%2C+India&date=2026-08-16', 'hi'),
    '/hi/festival/diwali?city=Delhi%2C+India&date=2026-08-16',
    'switching language must carry place and date to the twin address');
  assert.equal(twinAddress('/hi/panchang/hora/delhi?date=2026-08-16', 'en'),
    '/panchang/hora/delhi?date=2026-08-16');
  assert.equal(twinAddress('/', 'hi'), '/hi/');
  assert.equal(twinAddress('/hi/', 'en'), '/');
  assert.equal(twinAddress(twinAddress('/kundli?cstyle=south', 'hi'), 'en'), '/kundli?cstyle=south',
    'switching language twice must return the original address');

  /* ---- 7. Parsing: normalisation, legacy forms, and what is NOT an address */
  assert.equal(parsePath('/hi/festival/diwali/').route, 'festival');
  assert.equal(parsePath('//hi//festival//diwali').route, 'festival');
  assert.equal(parsePath('/hi/festival/diwali').lang, 'hi');
  assert.equal(parsePath('/hindi/festival').lang, 'en', '/hindi is not the Hindi prefix');
  assert.equal(parsePath('/hip').found, false, '/hip is not an address');
  assert.equal(parsePath('/nope').found, false);
  assert.equal(parsePath('/panchang').found, false, '/panchang is a namespace, not an address');
  assert.equal(parsePath('/PRASHNA').found, false, 'addresses are case sensitive');

  /* The cap is enforced by the parser, not merely by the emitter: an
     uncapped city is not an address Ganak owns. */
  assert.equal(parsePath('/panchang/hora/delhi').city, 'delhi');
  assert.equal(parsePath('/panchang/hora/paris').found, false,
    'a city outside the cap must not resolve — otherwise the cap is only a convention');
  assert.equal(parsePath('/festival/diwali/delhi').found, false,
    'only city-capable routes take a city segment');
  assert.throws(() => buildPath({ route: 'hora', lang: 'en', city: 'paris' }), /paris/,
    'the builder must refuse a city outside the cap');
  assert.throws(() => buildPath({ route: 'festival', lang: 'en', params: { slug: 'diwali' }, city: 'delhi' }),
    /city/, 'the builder must refuse a city on a route that has no city segment');
  assert.throws(() => buildPath({ route: 'festival', lang: 'en' }), /slug/,
    'the builder must refuse a missing parameter rather than emit a broken path');
  assert.throws(() => buildPath({ route: 'not-a-route', lang: 'en' }), /not-a-route/);

  /* Old shared links keep working: the legacy query forms resolve to the same
     route and canonicalise to the path address. Emitting the 301s is Task 4's
     job; understanding them is the parser's. */
  assert.equal(parseAddress('/?screen=prashna').route, 'prashna');
  assert.equal(parseAddress('/?screen=chart&cstyle=south').route, 'kundli');
  assert.equal(parseAddress('/?lang=hi').lang, 'hi');
  assert.equal(buildAddress(parseAddress('/?screen=prashna&lang=hi')), '/hi/prashna',
    'a legacy query link must canonicalise to its path address');
  assert.equal(buildAddress(parseAddress('/?screen=chart&cstyle=south')), '/kundli?cstyle=south',
    'canonicalising a legacy link must not drop the state it carried');

  return { routes: ROUTES.length, cities: CITY_ROUTES.length, addresses: all.length, samples: samples.length };
}

/* ---------------------------------------------------------------------------
   Run 1 — the real contract must pass.
   --------------------------------------------------------------------------- */
const REAL = {
  ROUTES: map.ROUTES,
  CITY_ROUTES: map.CITY_ROUTES,
  CITY_ROUTE_CAP: map.CITY_ROUTE_CAP,
  STATE_KEYS: map.STATE_KEYS,
  LANGS: map.LANGS,
  parsePath: route.parsePath,
  parseAddress: route.parseAddress,
  buildPath: route.buildPath,
  buildAddress: route.buildAddress,
  addressPair: route.addressPair,
  expandRoutes: route.expandRoutes,
  twinAddress: route.twinAddress,
};

const stats = checkContract(REAL);

/* Every capped city must be a real gazetteer place, or the concept pages would
   render a city Ganak cannot compute a panchang for. */
const gazetteer = new Set(places.CITY_DB.map((row) => row[0]));
for (const city of map.CITY_ROUTES) {
  assert.ok(gazetteer.has(city.place),
    `city route "${city.slug}" names "${city.place}", which is not in CITY_DB`);
}
console.log(`PASS  ${map.CITY_ROUTES.length} capped cities all resolve in the gazetteer`);

/* The shell-wiring, prerender and redirect lanes import exactly these two names
   and build against exactly these semantics (merged plan, Task 1). The case
   table below is copied verbatim from that plan so those lanes cannot be broken
   from underneath by a refactor here. */
assert.equal(typeof route.splitLangPath, 'function', 'Tasks 2-4 import splitLangPath');
assert.equal(typeof route.withLang, 'function', 'Tasks 2-4 import withLang');

const SPLIT_CASES = [
  ['/', { lang: 'en', rest: '/', prefixed: false }],
  ['/hi', { lang: 'hi', rest: '/', prefixed: true }],
  ['/hi/', { lang: 'hi', rest: '/', prefixed: true }],
  ['/prashna', { lang: 'en', rest: '/prashna', prefixed: false }],
  ['/hi/prashna', { lang: 'hi', rest: '/prashna', prefixed: true }],
  ['/festival/diwali', { lang: 'en', rest: '/festival/diwali', prefixed: false }],
  ['/hi/festival/diwali', { lang: 'hi', rest: '/festival/diwali', prefixed: true }],
  ['//hi//festival//diwali', { lang: 'hi', rest: '/festival/diwali', prefixed: true }],
  ['/hindi/festival', { lang: 'en', rest: '/hindi/festival', prefixed: false }],
  ['/hip', { lang: 'en', rest: '/hip', prefixed: false }],
];
for (const [input, expected] of SPLIT_CASES) {
  assert.deepEqual(route.splitLangPath(input), expected, `splitLangPath(${JSON.stringify(input)})`);
}
assert.equal(route.withLang('/festival/diwali', 'hi'), '/hi/festival/diwali');
assert.equal(route.withLang('/hi/festival/diwali', 'en'), '/festival/diwali');
assert.equal(route.withLang('/hi/festival/diwali', 'hi'), '/hi/festival/diwali');
assert.equal(route.withLang('/', 'hi'), '/hi/');
assert.equal(route.withLang('/hi/', 'en'), '/');
for (const [input] of SPLIT_CASES) {
  const { rest } = route.splitLangPath(input);
  assert.equal(route.splitLangPath(route.withLang(rest, 'hi')).rest, rest, `round-trip ${input}`);
}
console.log(`PASS  splitLangPath/withLang: ${SPLIT_CASES.length} merged-plan cases, withLang round-trips clean`);

console.log(
  `PASS  route contract: ${stats.routes} routes, ${stats.cities} cities, ` +
  `${stats.addresses} enumerated addresses, ${stats.samples} round-trips`);

/* ---------------------------------------------------------------------------
   Run 2 — the mutation proof. Each entry breaks exactly one guarantee; the
   check must throw for every one. If any mutation passes, this gate is not
   testing what it claims to test and the build fails here rather than later.
   --------------------------------------------------------------------------- */
const MUTATIONS = [
  {
    name: 'a route is broken (/panchang/choghadiya stops resolving)',
    apply: (api) => ({
      ...api,
      parsePath: (p) => (String(p).includes('choghadiya')
        ? { found: false, lang: 'en', route: null, city: null, params: {} }
        : api.parsePath(p)),
      parseAddress: (u) => (String(u).includes('choghadiya')
        ? { found: false, lang: 'en', route: null, city: null, params: {}, state: {} }
        : api.parseAddress(u)),
    }),
  },
  {
    name: 'a twin is broken (the Hindi form stops naming its English twin)',
    apply: (api) => ({
      ...api,
      addressPair: (spec) => api.addressPair(spec).map(
        (a) => (a.lang === 'hi' ? { ...a, altPath: '/' } : a)),
    }),
  },
  {
    name: 'a preserved §4 key is dropped (cstyle disappears on parse)',
    apply: (api) => ({
      ...api,
      parseAddress: (u) => {
        const parsed = api.parseAddress(u);
        const { cstyle, ...rest } = parsed.state || {};
        return { ...parsed, state: rest };
      },
    }),
  },
  {
    name: 'the city cap is raised past the owner decision',
    apply: (api) => ({
      ...api,
      CITY_ROUTE_CAP: 400,
      CITY_ROUTES: [...api.CITY_ROUTES, ...api.CITY_ROUTES.map(
        (c, i) => ({ ...c, slug: `${c.slug}-${i}` }))],
    }),
  },
];

for (const mutation of MUTATIONS) {
  let threw = null;
  try { checkContract(mutation.apply(REAL)); }
  catch (err) { threw = err; }
  assert.ok(threw, `MUTATION SURVIVED — the gate does not catch: ${mutation.name}`);
  console.log(`PASS  mutation caught: ${mutation.name}`);
  console.log(`        -> ${String(threw.message).split('\n')[0].slice(0, 120)}`);
}

console.log(`route-contract gate: PASS — contract holds, and all ${MUTATIONS.length} mutations fail it.`);
