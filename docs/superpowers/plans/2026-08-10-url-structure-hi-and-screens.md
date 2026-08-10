# URL Structure — `/hi/` and Product Paths Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give every Ganak page a language-explicit, product-explicit address — `/prashna`, `/jyotish`, `/hi/festival/diwali` — so that all 396 page-language combinations are separately indexable, and the Hindi content that already exists in the code stops being invisible to search.

**Architecture:** Language moves from a query parameter into a `/hi` path prefix, and screens move from `?screen=` into real paths. One new pure function splits `/hi/<rest>` into `{lang, rest}` before the three existing path matchers run, so those matchers are untouched. Because `applyRouteMetadata()` already builds the canonical from `window.location.pathname`, **moving the language into the path fixes the canonical-collapse bug for free** — no change to the Codex-owned `route-metadata.ts`. `hreflang` is emitted at build time only, in the prerendered head, which is where Google reads it.

**Tech Stack:** React 18, Vite 6, the existing `scripts/build-seo.mjs` emitter from register row 62, Cloudflare Pages `_redirects`.

## Global Constraints

- **Register rows 64 and 66. Owner decision 2026-08-10** — recorded in `plans/backlog.md`.
- **Do not edit `src/metadata/route-metadata.ts` or `index.html`.** `CODEX-P0-ROWS-38-39` is `ACTIVE` on both. This plan is designed so neither needs changing — verify that assumption holds before starting, and STOP if it does not.
- `src/kundli-app.tsx` is **also** touched by that lane. Confirm in `plans/task-log.md` that the lane has cleared before Task 2, and declare the overlap in your own task-log row.
- Latin slugs only. Never emit Devanagari in a URL — percent-encoding makes a shared WhatsApp link unreadable.
- **No automatic language redirect.** Google advises against it, and it would leave Googlebot, which crawls from the US, never seeing a Hindi page.
- Browser storage is banned project-wide. The URL is the state carrier; that does not change here.
- Old `?screen=` and `?lang=` URLs must keep working forever. People have shared them.
- Every task ends with a gate proven non-vacuous by mutation. Paste both sides.
- Prefix shell commands with `export PATH="/opt/homebrew/bin:$PATH"`.

## Target URL map

| English | Hindi | Screen |
|---|---|---|
| `/` | `/hi/` | Panchang (daily) |
| `/prashna` | `/hi/prashna` | Prashna |
| `/jyotish` | `/hi/jyotish` | Jyotish (chart) |
| `/festival/<slug>` × 181 | `/hi/festival/<slug>` | Festival guide |
| `/calculator/<slug>` × 14 | `/hi/calculator/<slug>` | Calculator |
| `/calculators` | `/hi/calculators` | Catalogue |
| `/muhurat/medical` | `/hi/muhurat/medical` | Medical Muhurat |

**200 English + 200 Hindi = 400 sitemap URLs** (198 today + `/prashna` + `/jyotish`, doubled).

**Unresolved sub-decision — `/jyotish` vs `/kundli`.** `kundli` is the higher-volume Indian
search term and is what Prokerala and AstroSage name the route. Settle it with real query
data from register row 63, but **before** row 63 submits — renaming an indexed URL forfeits
its position. Until settled, this plan builds `/jyotish` and Task 5 makes the rename a
one-line change.

---

### Task 1: Path-language parser (pure function, no UI)

**Files:**
- Create: `src/components/path-route.ts`
- Test: `validation/path-route.cjs`

**Interfaces:**
- Produces: `splitLangPath(pathname) → { lang: "en"|"hi", rest: string, prefixed: boolean }` and `withLang(pathname, lang) → string`. Tasks 2–4 import exactly these.

- [ ] **Step 1: Write the failing gate**

Create `validation/path-route.cjs`:

```js
#!/usr/bin/env node
'use strict';
const assert = require('node:assert/strict');
const { loadApp } = require('./_load-app.cjs');
const { splitLangPath, withLang } = loadApp('src/components/path-route.ts');

const cases = [
  ["/",                      { lang: "en", rest: "/",                 prefixed: false }],
  ["/hi",                    { lang: "hi", rest: "/",                 prefixed: true  }],
  ["/hi/",                   { lang: "hi", rest: "/",                 prefixed: true  }],
  ["/prashna",               { lang: "en", rest: "/prashna",          prefixed: false }],
  ["/hi/prashna",            { lang: "hi", rest: "/prashna",          prefixed: true  }],
  ["/festival/diwali",       { lang: "en", rest: "/festival/diwali",  prefixed: false }],
  ["/hi/festival/diwali",    { lang: "hi", rest: "/festival/diwali",  prefixed: true  }],
  ["//hi//festival//diwali", { lang: "hi", rest: "/festival/diwali",  prefixed: true  }],
  ["/hindi/festival",        { lang: "en", rest: "/hindi/festival",   prefixed: false }],
  ["/hip",                   { lang: "en", rest: "/hip",              prefixed: false }],
];
for (const [input, expected] of cases) {
  assert.deepEqual(splitLangPath(input), expected, `splitLangPath(${JSON.stringify(input)})`);
}

assert.equal(withLang("/festival/diwali", "hi"), "/hi/festival/diwali");
assert.equal(withLang("/hi/festival/diwali", "en"), "/festival/diwali");
assert.equal(withLang("/hi/festival/diwali", "hi"), "/hi/festival/diwali");
assert.equal(withLang("/", "hi"), "/hi/");
assert.equal(withLang("/hi/", "en"), "/");

/* Round-trip: switching language twice must return the original path. */
for (const [input] of cases) {
  const { rest } = splitLangPath(input);
  assert.equal(splitLangPath(withLang(rest, "hi")).rest, rest, `round-trip ${input}`);
}

console.log(`path-route gate: PASS — ${cases.length} split cases, withLang round-trips clean.`);
```

- [ ] **Step 2: Run it, confirm it fails**

```bash
export PATH="/opt/homebrew/bin:$PATH"; node validation/path-route.cjs
```

Expected: build error — no such file `src/components/path-route.ts`.

- [ ] **Step 3: Implement**

Create `src/components/path-route.ts`:

```ts
/* Language lives in the path, not a query parameter, so every page has an address
   that says what language it is. This runs BEFORE the festival/calculator/medical
   matchers, which then see an unprefixed path and stay unchanged.

   `/hi` is matched as a whole segment only — `/hindi/...` and `/hip` are English. */

const SUPPORTED = ["hi"] as const;

function normalize(pathname: string): string {
  const clean = String(pathname || "/").replace(/\/{2,}/g, "/");
  return clean.length > 1 ? clean.replace(/\/+$/, "") : clean;
}

export function splitLangPath(pathname: string) {
  const clean = normalize(pathname);
  for (const code of SUPPORTED) {
    if (clean === `/${code}`) return { lang: code, rest: "/", prefixed: true };
    if (clean.startsWith(`/${code}/`)) {
      return { lang: code, rest: clean.slice(code.length + 1) || "/", prefixed: true };
    }
  }
  return { lang: "en" as const, rest: clean, prefixed: false };
}

/* Build the address of `pathname` in `lang`, idempotently. */
export function withLang(pathname: string, lang: string): string {
  const { rest } = splitLangPath(pathname);
  if (lang !== "hi") return rest;
  return rest === "/" ? "/hi/" : `/hi${rest}`;
}
```

- [ ] **Step 4: Run the gate, confirm PASS**

```bash
export PATH="/opt/homebrew/bin:$PATH"; node validation/path-route.cjs
```

Expected: `path-route gate: PASS — 10 split cases, withLang round-trips clean.`

- [ ] **Step 5: Prove non-vacuous**

Change `if (clean === `/${code}`)` to `if (false)`, run, confirm failure on the `/hi` case, restore, confirm PASS. Paste both.

- [ ] **Step 6: Commit**

```bash
git add src/components/path-route.ts validation/path-route.cjs
git commit -m "feat(routing): parse the /hi language prefix out of the path

Pure function, no UI wiring yet. Matches /hi as a whole segment only, so
/hindi/... and /hip stay English. The existing festival, calculator and
medical matchers see an unprefixed path and need no change."
```

---

### Task 2: Screen paths and language prefix in the app shell

**Files:**
- Modify: `src/kundli-app.tsx:97-104`
- Test: `validation/route-reachability.cjs` (existing, must stay green), `validation/screen-routes.cjs` (create)

**Interfaces:**
- Consumes: `splitLangPath`, `withLang` from Task 1.
- Produces: `screenFromPath(rest) → "daily"|"prashna"|"chart"|null`, exported from `kundli-app.tsx` for the emitter and gate.

**Pre-flight:** confirm `CODEX-P0-ROWS-38-39` has cleared `src/kundli-app.tsx` in `plans/task-log.md`. If still `ACTIVE`, STOP and report.

- [ ] **Step 1: Write the failing gate**

Create `validation/screen-routes.cjs`:

```js
#!/usr/bin/env node
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { loadApp } = require('./_load-app.cjs');
const { screenFromPath } = loadApp('src/kundli-app.tsx');

assert.equal(screenFromPath("/"), "daily");
assert.equal(screenFromPath("/prashna"), "prashna");
assert.equal(screenFromPath("/jyotish"), "chart");
assert.equal(screenFromPath("/festival/diwali"), null, "festival paths are not screen paths");
assert.equal(screenFromPath("/calculator/rashi"), null);
assert.equal(screenFromPath("/nope"), null);

const src = fs.readFileSync('src/kundli-app.tsx', 'utf8');
assert.ok(src.includes('splitLangPath'), 'shell must read the language from the path');
assert.ok(/href=\{`?\/(hi\/)?prashna/.test(src) || src.includes('withLang'),
  'nav must produce real hrefs, not onClick-only handlers');
assert.ok(src.includes('urlPrefGet("screen")'),
  'the legacy ?screen= form must still be read so old shared links keep working');
assert.ok(src.includes('urlPrefGet("lang")'),
  'the legacy ?lang= form must still be read so old shared links keep working');

console.log('screen-routes gate: PASS — /prashna and /jyotish resolve, legacy query forms still honoured.');
```

- [ ] **Step 2: Run it, confirm it fails**

Expected: `screenFromPath is not a function`.

- [ ] **Step 3: Implement**

In `src/kundli-app.tsx`, add near the other matchers and export it:

```js
/* Screens are paths now, not ?screen= values. The query form is still read as a
   fallback so every link anyone has already shared keeps working. */
export function screenFromPath(rest) {
  const clean = String(rest || "/").replace(/\/{2,}/g, "/").replace(/(.)\/+$/, "$1");
  if (clean === "/") return "daily";
  if (clean === "/prashna") return "prashna";
  if (clean === "/jyotish") return "chart";
  return null;
}
```

Replace lines 97–104 with:

```js
  const rawPath = typeof window !== "undefined" ? window.location.pathname : "/";
  const { lang: pathLang, rest: routePath, prefixed: langInPath } = splitLangPath(rawPath);
  const [lang, setLang] = useState(() => {
    if (langInPath) return pathLang;
    const v = urlPrefGet("lang");
    return v === "hi" || v === "en" ? v : detectLang();
  });
  const chooseLang = (v) => { setLang(v); urlPrefSet("lang", v); };
  const pathScreen = screenFromPath(routePath);
  const [mode, setMode] = useState(() => {
    if (pathScreen) return pathScreen;
    const v = urlPrefGet("screen");
    return v === "prashna" || v === "daily" || v === "chart" ? v : "daily";
  });
  const chooseMode = (v) => { setMode(v); urlPrefSet("screen", v); };
  const directFestivalGuide = festivalGuideFromPath(routePath);
  const utilityRoute = utilityFromPath(routePath);
  const medicalRoute = medicalMuhuratFromPath(routePath);
  const muhuratRoute = urlPrefGet("muhurat");
```

Add the import at the top:

```js
import { splitLangPath, withLang } from "./components/path-route";
```

Update the unknown-festival check on line 107 to use `routePath` instead of `window.location.pathname`.

- [ ] **Step 4: Convert the nav to real links**

The mode buttons at `kundli-app.tsx:225` are `<button onClick={() => chooseMode(mk)}>`. Replace with anchors so crawlers can follow them — this is also why the codebase has only 16 `<a href>` tags against 198 routes:

```jsx
<a key={mk} href={withLang(mk === "daily" ? "/" : mk === "prashna" ? "/prashna" : "/jyotish", lang)}
   className="comfort-focus" aria-current={mode === mk ? "page" : undefined}
   style={{ display: "inline-flex", alignItems: "center", minHeight: T.ctrlH, padding: `0 ${T.s5}`, borderRadius: T.rSm, fontFamily: T.serif, fontSize: T.fBody, textDecoration: "none", border: "none", background: mode === mk ? C.panel : "transparent", color: mode === mk ? C.gold : C.ivory, fontWeight: mode === mk ? 700 : 400, boxShadow: mode === mk ? T.e1 : "none", transition: "all .15s" }}>{label}</a>
```

Add a language link beside it:

```jsx
<a href={withLang(routePath, lang === "hi" ? "en" : "hi")} className="comfort-focus"
   style={{ color: C.gold, textDecoration: "none", fontWeight: 600 }}>
  {lang === "hi" ? "English" : "हिन्दी में देखें"}
</a>
```

- [ ] **Step 5: Verify both gates**

```bash
export PATH="/opt/homebrew/bin:$PATH"; node validation/screen-routes.cjs && node validation/route-reachability.cjs && node validation/parse-check.js src/kundli-app.tsx
```

Expected: all PASS. `route-reachability` must still find every route linked from inside the app.

- [ ] **Step 6: Prove non-vacuous**

Change `if (clean === "/prashna") return "prashna";` to return `null`, run, confirm failure, restore, confirm PASS. Paste both.

- [ ] **Step 7: Commit**

```bash
git add src/kundli-app.tsx validation/screen-routes.cjs
git commit -m "feat(routing): /prashna and /jyotish paths, /hi language prefix

Two of three product areas had no address at all. The nav becomes real
anchors rather than onClick handlers, which also fixes the crawlable
link graph — the codebase had 16 <a href> tags against 198 routes.

Legacy ?screen= and ?lang= are still read, so shared links never break."
```

---

### Task 3: Emit 400 pages with reciprocal hreflang

**Files:**
- Modify: `scripts/seo-routes.mjs`, `scripts/build-seo.mjs`, `validation/prerender-seo.mjs`

**Interfaces:**
- `publicRoutes()` now returns both languages: each entry gains `lang` and `altPath`.

`hreflang` is emitted **only** in the prerendered head. Google reads it from served HTML, and doing it at build time avoids touching the Codex-owned `route-metadata.ts` at runtime.

- [ ] **Step 1: Extend the gate**

Append to `validation/prerender-seo.mjs`:

```js
assert.equal(routes.length, 400, `expected 400 routes across both languages, got ${routes.length}`);
assert.equal(routes.filter((r) => r.lang === "hi").length, 200, "expected 200 Hindi routes");
assert.ok(routes.some((r) => r.path === "/prashna"), "/prashna missing");
assert.ok(routes.some((r) => r.path === "/hi/jyotish"), "/hi/jyotish missing");

for (const route of routes) {
  const rel = route.path === "/" ? "index.html" : `${route.path.replace(/^\//, "").replace(/\/$/, "")}/index.html`;
  const html = fs.readFileSync(distPath(rel), "utf8");
  const self = `<link rel="alternate" hreflang="${route.lang}" href="${origin()}${route.path}"`;
  const alt  = `<link rel="alternate" hreflang="${route.lang === "hi" ? "en" : "hi"}" href="${origin()}${route.altPath}"`;
  assert.ok(html.includes(self), `self hreflang missing for ${route.path}`);
  assert.ok(html.includes(alt), `reciprocal hreflang missing for ${route.path}`);
  assert.ok(html.includes(`<link rel="alternate" hreflang="x-default"`), `x-default missing for ${route.path}`);
  assert.ok(html.includes(`<html lang="${route.lang}"`) || html.includes(`lang="${route.lang}"`),
    `html lang attribute wrong for ${route.path}`);
}

/* Reciprocity is the part Google actually validates: if A points at B, B must point back at A. */
const byPath = new Map(routes.map((r) => [r.path, r]));
for (const route of routes) {
  const partner = byPath.get(route.altPath);
  assert.ok(partner, `altPath has no page: ${route.path} -> ${route.altPath}`);
  assert.equal(partner.altPath, route.path, `hreflang not reciprocal: ${route.path} <-> ${route.altPath}`);
}

console.log(`prerender-seo gate: 400 routes, hreflang reciprocal in both directions.`);
```

- [ ] **Step 2: Run, confirm it fails**

Expected: `expected 400 routes across both languages, got 198`.

- [ ] **Step 3: Implement**

In `scripts/seo-routes.mjs`, add the two screen routes to `FIXED` and emit both languages:

```js
const FIXED = [
  { path: "/",                args: { mode: "daily" } },
  { path: "/prashna",         args: { mode: "prashna" } },
  { path: "/jyotish",         args: { mode: "chart" } },
  { path: "/calculators",     args: { mode: "daily", utility: { kind: "catalogue" } } },
  { path: "/muhurat/medical", args: { mode: "daily", medical: { kind: "medical" } } },
];
```

and replace the body of `publicRoutes()` so every route is produced twice:

```js
export function publicRoutes() {
  const out = [];
  const push = (routePath, args) => {
    for (const lang of ["en", "hi"]) {
      const meta = metadata.routeMetadata({ lang, ...args });
      const base = meta.canonicalPath || routePath;
      const path = lang === "hi" ? (base === "/" ? "/hi/" : `/hi${base}`) : base;
      const altBase = lang === "hi" ? base : (base === "/" ? "/hi/" : `/hi${base}`);
      out.push({
        path,
        lang,
        altPath: lang === "hi" ? base : altBase,
        title: meta.title,
        description: meta.description,
        canonicalPath: path,
      });
    }
  };
  for (const { path: routePath, args } of FIXED) push(routePath, args);
  for (const [routePath, entry] of Object.entries(festivals.FESTIVAL_PAGE_ROUTES)) {
    push(routePath, { mode: "daily", festival: entry });
  }
  for (const calculator of calculators.UTILITY_CALCULATORS) {
    push(`/calculator/${calculator.slug}`, { mode: "daily", utility: { kind: "calculator", calculator } });
  }
  return out;
}
```

In `scripts/build-seo.mjs`, inside `emitRouteHtml`, after the existing head rewrites add:

```js
    const alternates = [
      `<link rel="alternate" hreflang="${route.lang}" href="${escapeHtml(origin() + route.path)}" />`,
      `<link rel="alternate" hreflang="${route.lang === "hi" ? "en" : "hi"}" href="${escapeHtml(origin() + route.altPath)}" />`,
      `<link rel="alternate" hreflang="x-default" href="${escapeHtml(origin() + (route.lang === "hi" ? route.altPath : route.path))}" />`,
    ].join("\n    ");
    html = html.replace("</head>", `    ${alternates}\n  </head>`);
    html = html.replace(/<html lang="[^"]*"/, `<html lang="${route.lang}"`);
```

- [ ] **Step 4: Rebuild and verify**

```bash
export PATH="/opt/homebrew/bin:$PATH"; rm -rf dist && npx vite build && node validation/prerender-seo.mjs
```

Expected: `build-seo: 400 route HTML files written.` and the reciprocity assertion passing.

- [ ] **Step 5: Verify the served bytes**

```bash
grep -o '<link rel="alternate"[^>]*>' dist/hi/festival/diwali/index.html
grep -o '<title>[^<]*</title>' dist/hi/festival/diwali/index.html
```

Expected: three alternate links, and the Hindi title `दिवाली — तिथि, समय और पूजा मार्गदर्शन | Ganak`.

- [ ] **Step 6: Prove non-vacuous**

Break reciprocity by hard-coding `altPath: "/"` for one route, rebuild, confirm `hreflang not reciprocal`, restore, confirm PASS. Paste both.

- [ ] **Step 7: Commit**

```bash
git add scripts/seo-routes.mjs scripts/build-seo.mjs validation/prerender-seo.mjs
git commit -m "feat(seo): emit both languages with reciprocal hreflang

400 pages, up from 198. The Hindi titles and descriptions already
existed in route-metadata.ts and were simply unreachable — this gives
them addresses. hreflang is build-time only, which is where Google
reads it and avoids touching the Codex-owned runtime metadata."
```

---

### Task 4: Redirect every legacy URL form

**Files:**
- Modify: `scripts/build-seo.mjs` (`emitRedirects`), `validation/prerender-seo.mjs`

Cloudflare `_redirects` matches query strings with a `?` suffix on the rule and is first-match-wins, so these must sit above the SPA catch-all alongside the festival `301`s.

- [ ] **Step 1: Extend the gate**

```js
for (const rule of [
  "/?screen=prashna /prashna 301",
  "/?screen=chart /jyotish 301",
  "/?lang=hi /hi/ 301",
]) {
  const at = redirects.indexOf(rule);
  assert.ok(at !== -1, `missing legacy query redirect: ${rule}`);
  assert.ok(at < catchAllAt, `legacy query redirect must precede the catch-all: ${rule}`);
}
console.log("prerender-seo gate: legacy ?screen= and ?lang= forms redirect to their paths.");
```

- [ ] **Step 2: Run, confirm it fails**

Expected: `missing legacy query redirect: /?screen=prashna /prashna 301`.

- [ ] **Step 3: Implement**

In `emitRedirects()`, before the festival legacy rules:

```js
  const queryForms = [
    "/?screen=prashna /prashna 301",
    "/?screen=chart /jyotish 301",
    "/?screen=daily / 301",
    "/?lang=hi /hi/ 301",
  ];
```

and include `...queryForms,` in the emitted array ahead of `...legacy`.

- [ ] **Step 4: Rebuild, verify, and check ordering**

```bash
export PATH="/opt/homebrew/bin:$PATH"; rm -rf dist && npx vite build && node validation/prerender-seo.mjs && node validation/favicon.cjs && head -12 dist/_redirects
```

Expected: all PASS, favicon ordering invariant intact, query rules visible above the catch-all.

- [ ] **Step 5: Prove non-vacuous** — move `queryForms` after `base`, confirm the ordering assertion fails, restore, confirm PASS.

- [ ] **Step 6: Commit**

```bash
git add scripts/build-seo.mjs validation/prerender-seo.mjs
git commit -m "feat(seo): 301 the legacy ?screen= and ?lang= URLs to their paths

Every link anyone has already shared keeps working and passes its
ranking to the new address."
```

---

### Task 5: Full sweep, sequencing note, and handoff

- [ ] **Step 1: Full gate sweep**

```bash
export PATH="/opt/homebrew/bin:$PATH"; for f in validation/*.cjs; do node "$f" >/dev/null 2>&1 || echo "FAIL: $f"; done; echo "sweep done"
```

Expected: no FAIL lines. Then run the three `.mjs` gates explicitly — the `*.cjs` glob does not reach them:

```bash
export PATH="/opt/homebrew/bin:$PATH"; node validation/prerender-seo.mjs && node validation/backlog-sheet-sync.mjs
```

- [ ] **Step 2: Browser smoke, EN and HI, at 390px**

Use the Browser pane with launch config `kundli-dev`. Visit `/prashna`, `/jyotish`, `/hi/`, `/hi/festival/diwali`. Confirm: correct screen renders, language matches the path, the language link swaps to the mirrored path, zero console errors, no horizontal overflow.

- [ ] **Step 3: The `/jyotish` vs `/kundli` decision**

If the owner has settled it, change the two literals in `screenFromPath` and `FIXED`, plus the `/?screen=chart` redirect target, and rebuild. If not settled, record in `plans/task-log.md` that it is **still open and blocks register row 63**.

- [ ] **Step 4: Update the register**

Move rows 64 and 66 off 0%, and note in row 63 that the URL shape is now frozen and Search Console submission may proceed.

- [ ] **Step 5: Commit and push**

---

## Out of scope

| Item | Where it lives |
|---|---|
| Real body content in prerendered HTML (full SSG) | Row 62 Stage B |
| `og:image` share cards | Row 26 |
| `schema.org` Event JSON-LD | Row 62 Stage B |
| Languages beyond Hindi | Row 50 / Row 60 |
| Search Console submission | Row 63, owner-only |
