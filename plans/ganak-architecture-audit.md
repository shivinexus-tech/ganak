# Ganak — Architecture & Data-Model Audit

**Date:** 2026-07-30 · **Author:** Claude Code · **Type:** read-only audit, no code changed
**Scope:** rendering model, data/domain model, state, module boundaries, build/deploy,
structural bug patterns — assessed against the business goals in
[`ganak-redesign-requirements.md`](ganak-redesign-requirements.md).
**Companion docs:** [`ux-ia-audit.md`](ux-ia-audit.md) (UX/IA), this doc (architecture).

> **Headline.** The engine is genuinely well-separated and is the strongest asset in the
> codebase — the engine-as-API revenue line (§16.2) is *architecturally close*, not far.
> Everything above the engine is unplanned: there is no domain model, no router, no
> storage layer, no design system, and — most consequentially — **no server-rendered
> HTML**, which means the SEO + WhatsApp-share wedge (§17.1/§17.4), the single highest
> priority in the strategy, is currently **impossible to deliver**, not merely
> under-built. That is finding #1 and it is not a tuning problem.

---

## 0. Pre-flight (per AGENTS.md)

This is a **documentation-only** audit; no source file was edited. `git fetch` run at the
start: this branch (`claude/personal-muhurat`) is **4 commits behind `origin/main`** and
3 ahead; all evidence below was read from the working tree, and every cited line was
cross-checked against `origin/main` where the file is untouched by the local branch.

`plans/task-log.md` shows **7 rows with `ACTIVE` / `RESERVED` status** — notably
`CLAUDE-EN-SIGN-NAMES-E1.0` (ACTIVE, owns `panchang.ts`, `PrashnaScreen.tsx`,
`MuhuratHub.tsx`, `daily-windows.ts`, `UtilityCalculatorScreen.tsx`) and four Wave-1
Jyotish calculator reservations (#33–#36). This audit **collides with none of them** —
it writes one new file, `plans/ganak-architecture-audit.md`.

---

# 1. Current-state map

## 1.1 Scale and shape

| Measure | Value |
|---|---|
| Source files in `src/` | 106 (74 `.ts`, 32 `.tsx`) |
| `src/engine/` | 38 files, 388 KB |
| `src/data/` | 26 files, **1.8 MB** (content, not code) |
| `src/screens/` | 12 files, 488 KB |
| `src/components/` | 22 files, 156 KB |
| Production JS bundle | **2,423,354 bytes** (2.42 MB raw / 692 KB gzip), **one chunk** |
| Crawlable path routes | ~199 (181 festival + 14 calculator + `/calculators` + 2 muhurat + `/`) |
| TypeScript `type`/`interface` declarations, whole repo | **19** |

The five largest UI files:

| File | Bytes | Lines | Max line length |
|---|---:|---:|---:|
| [`src/screens/MuhuratHub.tsx`](src/screens/MuhuratHub.tsx) | 96,569 | 1,016 | 1,151 |
| [`src/screens/ChartScreen.tsx`](src/screens/ChartScreen.tsx) | 92,215 | 1,061 | 1,657 |
| [`src/screens/PrashnaScreen.tsx`](src/screens/PrashnaScreen.tsx) | 67,973 | 996 | 905 |
| [`src/screens/FestivalGuideScreen.tsx`](src/screens/FestivalGuideScreen.tsx) | 48,089 | 742 | 445 |
| [`src/screens/UtilityCalculatorScreen.tsx`](src/screens/UtilityCalculatorScreen.tsx) | 36,163 | 121 | **4,504** |

`UtilityCalculatorScreen.tsx` averages ~300 characters per line and has a single 4,504-character
line ([`:65`](src/screens/UtilityCalculatorScreen.tsx:65)). Git conflict resolution is
line-granular, so a file like this is effectively **un-mergeable by two agents at once**.

## 1.2 Rendering model — **client-only SPA, empty shell to every crawler**

This is the most important section of the audit. The chain is short and unambiguous:

1. [`vite.config.ts`](vite.config.ts) is **6 lines** — `react()` plugin and a dev port.
   No SSR, no SSG, no prerender plugin, no `build` block, no `manualChunks`.
2. [`public/_redirects`](public/_redirects) is **2 lines**; the operative one is
   `/* /index.html 200` — every URL on the site is served the identical static shell.
3. [`dist/index.html`](dist/index.html) (the actual deployed artifact) contains
   **hardcoded homepage metadata**: `<title>Ganak Panchang — Today's Tithi…</title>`,
   `og:title`, `og:description`, `og:url` all pointing at `https://ganakapp.com/`.
4. All per-route metadata is applied **client-side, after hydration**, by
   [`applyRouteMetadata()`](src/metadata/route-metadata.ts:64) — a `document.head`
   mutation, called from a `useEffect` at
   [`kundli-app.tsx:98`](src/kundli-app.tsx:98).

**Therefore:** Googlebot's first pass, and *every* non-JS-executing scraper —
WhatsApp, iMessage, Signal, Telegram, Facebook, LinkedIn, Slack, Twitter/X — receives,
for all ~199 routes including all 181 festival pages:

> title: "Ganak Panchang — Today's Tithi, Festivals and Muhurat"
> og:url: `https://ganakapp.com/`
> og:image: *(absent)*

Additional confirmed gaps:

- **No `og:image` anywhere in the repo.** `grep -rn "og:image|twitter:card|og:type|og:site_name"` across
  `src/`, `index.html`, `public/`, `functions/` returns **zero matches**. Link previews
  render as a bare grey box.
- **No `robots.txt`. No `sitemap.xml`.** Neither file exists anywhere in the repo. The
  181 festival routes are reachable only if a crawler already knows the URL —
  and with `<a href>` links appearing just **9 times** in the whole codebase
  (`grep -ro '<a ' src | wc -l` = 9), most of them are not linked from anywhere.
- **10 duplicate-content pairs.** [`festival-pages.ts:33-44`](src/data/festival-pages.ts:33)
  defines `FESTIVAL_LEGACY_PATH_REDIRECTS`, and its own comment
  ([`:30-32`](src/data/festival-pages.ts:30)) says "the deploy adapter can issue a
  canonical redirect from this registry." **No such rule exists in `_redirects`.**
  Instead [`festivalGuideFromPath()`](src/screens/FestivalGuideScreen.tsx:77) resolves the
  legacy path to the canonical guide and renders it, while `applyRouteMetadata` sets
  `canonical = origin + window.location.pathname` ([`route-metadata.ts:81`](src/metadata/route-metadata.ts:81))
  — so `/festival/nrisimha-jayanti` and `/festival/narasimha-jayanti` serve identical
  content and each self-canonicalises. Ten such pairs.
- **The share URL is not a page.** [`muhuratShareUrl()`](src/components/MuhuratActions.tsx:34)
  builds `/?screen=daily&muhurat=…&mfrom=…&city=…&lat=…&lon=…` — a query-string URL on
  the homepage. It is not descriptive, not city-named, and inherits the homepage OG card.
  Requirements §17.1 asks for "a beautiful image card with facts baked in" and
  "permanent, city-aware, crawlable URL"; the current implementation delivers a
  clipboard copy of a homepage query string.

The backlog *does* have `P0-PUBLIC-PLATFORM-LAUNCH`
([`backlog.md:456`](plans/backlog.md:456)) asking for "unique browser title, description,
canonical URL and social/share metadata per page; sitemap, robots rules." **That item is
mis-scoped**: it reads as a content task, but per-page metadata is unachievable in the
current rendering model no matter how much metadata is written. This is an infrastructure
decision, not a copy task.

## 1.3 Routing — five independent parsers, no router

There is no routing library and no route table. [`kundli-app.tsx:92-96`](src/kundli-app.tsx:92)
calls **four separate path-matching functions plus one query-param read**, each defined in
a different module, each re-parsing `window.location.pathname` on every render:

```
festivalGuideFromPath(...)   → src/screens/FestivalGuideScreen.tsx:77
utilityFromPath(...)         → src/data/utility-calculators.ts:50
medicalMuhuratFromPath(...)  → src/screens/MedicalMuhuratScreen.tsx:19
personalMuhuratFromPath(...) → src/screens/PersonalMuhuratScreen.tsx:20
urlPrefGet("muhurat")        → query param, src/components/url-prefs.ts
```

Screen selection is then a **repeated 4-clause negation**, written out verbatim
four times at [`kundli-app.tsx:189, 214, 218, 222`](src/kundli-app.tsx:189):

```jsx
{!directFestivalGuide && !utilityRoute && !medicalRoute && !personalRoute && mode === "daily" && ...}
```

This is O(n) per new route: adding `/muhurat/personal` (commit `a7d763f`, the most recent
feature) required touching **six** locations in the integration-owned shell. That shell is
explicitly reservation-gated by AGENTS.md, so **every new route serialises the entire
agent fleet through one file.**

Two further consequences:

- **`mode` (Daily/Prashna/Jyotish) lives in a query param**, not a path —
  [`kundli-app.tsx:90`](src/kundli-app.tsx:90) reads `urlPrefGet("screen")`. Prashna and
  Jyotish, two of the three top-level products, have **no crawlable URL at all.**
- **Path changes are not observed.** The `popstate` listener at
  [`kundli-app.tsx:110`](src/kundli-app.tsx:110) restores *place from query params* only.
  Nothing subscribes to pathname changes, so all internal navigation is a full document
  load (`<a href>`), re-downloading and re-parsing the 2.42 MB bundle on every hop.

## 1.4 Data / domain model — **there isn't one**

The audit brief asks how `Place`, `Panchang`, `Festival`, `Chart`, `Prashna question`,
`SavedItem`, `Preferences` are represented. The answer for all seven: **ad-hoc object
literals, re-declared per consumer.**

- **19 `type`/`interface` declarations across 106 files.** For comparison, `src/engine/`
  alone has 38 modules.
- **`Place` is declared three times, independently**, in three modules that never share
  the definition:
  - [`src/engine/calendar-conventions.ts:46`](src/engine/calendar-conventions.ts:46) — `{lat, lon, zone}`
  - [`src/engine/regional-calendar-shadow-check.ts:7`](src/engine/regional-calendar-shadow-check.ts:7) — `{lat, lon, zone, label?}`
  - [`src/monitoring/regional-calendar-shadow.ts:3`](src/monitoring/regional-calendar-shadow.ts:3) — `{lat, lon, zone, label?}`

  A fourth, *untyped*, canonical shape is the literal `DEFAULT_PLACE` at
  [`kundli-app.tsx:104`](src/kundli-app.tsx:104), and a fifth conversion lives in
  [`server/api/engines.mjs`](server/api/engines.mjs) `toPlace()`, which exists precisely
  because "Ganak's engines take a `place` object; keep the shape in one spot" — one spot
  *for the API*, separate from the app's.
- **`tsconfig.json` sets `"strict": false`.** With almost no types declared and strict
  mode off, TypeScript is providing close to zero safety here. Most `.tsx` component
  signatures are plain destructured JS —
  e.g. [`DailyScreen({ C, card, lang, place, onPlace })`](src/screens/DailyScreen.tsx:25),
  [`ChartVault({ snapshot, result, onLoad, C, card, lang })`](src/components/ChartVault.tsx:8).
- **Chart, Prashna question and SavedItem have no representation at all** outside the
  component that computes them. `ChartVault` invents an inline record shape at
  [`ChartVault.tsx:36`](src/components/ChartVault.tsx:36) and a second, *different*
  export shape at [`:52-58`](src/components/ChartVault.tsx:52); the share-code format at
  [`:74`](src/components/ChartVault.tsx:74) is a third. Nothing versions or validates them.
- **The one genuinely modelled domain is festivals** —
  [`src/data/festival-pages.ts`](src/data/festival-pages.ts) builds a frozen route
  registry from live metadata keys, throws on duplicate paths
  ([`:172`](src/data/festival-pages.ts:172)), and exposes a reverse lookup
  `festivalPathForKey()` that callers must use. **This is the model to copy.** It is the
  only place in the codebase where a domain entity has an identity, a canonical URL, and a
  gate that fails when they drift.

## 1.5 State management — prop drilling, five stores, one that doesn't exist

There is no context, no store, no reducer. State is `useState` in whichever component
happens to own it, drilled downward:

| Prop | Times drilled |
|---|---:|
| `C={C}` (the palette) | 46 |
| `lang={lang}` | 44 |
| `card={card}` | 24 |

Hook density in the largest screens:

| File | `useState` | `useEffect` | `useMemo` |
|---|---:|---:|---:|
| `MuhuratHub.tsx` | **21** | 3 | 3 |
| `ChartScreen.tsx` | 14 | 2 | 0 |
| `DailyScreen.tsx` | 10 | 5 | 2 |
| `MatchingScreen.tsx` | 10 | 1 | 0 |

There are **five different persistence mechanisms** in play simultaneously:

1. **URL query params** — the sanctioned one.
   [`url-prefs.ts`](src/components/url-prefs.ts) exports five near-identical setters
   (`urlPrefSet`, `urlPrefPush`, `urlPrefsSet`, `urlPrefsPush`) differing only in
   replace-vs-push and single-vs-batch. Used in 5 files, 35 call sites.
2. **URL pathname** — festivals, calculators, medical/personal muhurat (§1.3).
3. **React state only** — lost on reload, and the primary source of the "state reset"
   bugs the prior audit flagged.
4. **`window.storage`** — a host/preview API that **does not exist in production.**
   [`ChartVault.tsx:9`](src/components/ChartVault.tsx:9):
   `const store = (typeof window !== "undefined" && window.storage) ? window.storage : null;`
   and [`MuhuratHub.tsx:131-132`](src/screens/MuhuratHub.tsx:131) for the
   Smarta/ISKCON tradition preference. On Cloudflare Pages `window.storage` is
   `undefined`, so **saved charts and the saved tradition preference silently do nothing
   in production** — the UI degrades to "Saving isn't available in this preview"
   ([`ChartVault.tsx:120`](src/components/ChartVault.tsx:120)). Requirements §8 ("The user
   must actively press **Save on this device**") describes a feature that has **no working
   implementation**.
5. **Cloudflare KV** — one flag endpoint,
   [`functions/api/regional-calendar-flags.ts`](functions/api/regional-calendar-flags.ts),
   read at [`DailyScreen.tsx:43`](src/screens/DailyScreen.tsx:43).

The root cause is a policy contradiction that has not been resolved in code:
**AGENTS.md line 33** says *"No browser storage. `localStorage` / `sessionStorage` are
banned outright"*; **requirements §11** now says local preferences and explicitly-saved
charts are permitted and that "the shared engineering convention and privacy gates must be
updated" before implementation. `validation/parse-check.js` still enforces the ban. Until
someone lands that change, **the "knows me" pillar (§7.1) and the saved-chart vault (§8)
are both blocked at the storage layer**, and `window.storage` is a placeholder standing in
for a decision nobody has made.

## 1.6 Module boundaries

**The engine boundary is real and clean — this is the good news.**

- `grep -rln "react" src/engine` → **zero matches**. No engine module imports React,
  a component, or a screen.
- Only **3 of 38** engine modules reach outward, all into `src/data/` for content
  constants, all trivially injectable:
  - [`search-upcoming.ts:6`](src/engine/search-upcoming.ts:6) → `FEST_NAME, OBS_NAME`
  - [`utility-calculators.ts:4`](src/engine/utility-calculators.ts:4) → `NAMING_SYLLABLES`
  - [`regional-calendar-shadow-check.ts:1`](src/engine/regional-calendar-shadow-check.ts:1) → evidence fixtures
- The boundary is already **proven in production shape**: `server/api/` is a working
  Express API over the same engines.
  [`server/api/engines.mjs`](server/api/engines.mjs) esbuild-bundles six engine entry
  points at startup, with the correct rationale in its own comment: *"the API can never
  silently disagree with the website, because there is only one implementation."*
  [`server/api/v1.mjs`](server/api/v1.mjs) (247 lines) has typed error contracts, input
  validation, and API-key fingerprinting;
  [`Dockerfile`](Dockerfile) and [`render.yaml`](render.yaml) are written. Only
  production hosting and keys remain (`API_KEYS`/`PUBLIC_API_URL` are `sync: false`).

**The UI boundary is not real.** Nine modules carry the marker
`/* … pure extraction (SPLIT-UI-…). Wire deferred. */` — `MuhuratHub`, `CalendarPage`,
`RectifyScreen`, `JyotishBnnScreen`, `ChartVault`, `DashaTree`, `DiamondChart`,
`VratVidhiCard`, `today-panchang`. "Wire deferred" means the code was *moved* out of the
god-file but the god-file's copy was **not deleted** — e.g.
[`DiamondChart.tsx:4`](src/components/DiamondChart.tsx:4): *"shell still hosts a copy
until then"*, [`today-panchang.ts:1`](src/engine/today-panchang.ts:1): *"still copied in
shell"*. The migration AGENTS.md describes is roughly **half-finished, and has been for
weeks**. The `No orphans` invariant (AGENTS.md line 31) is violated by design here.

The real hierarchy is deep composition, not modules:

```
kundli-app.tsx (shell: palette + routing + lang + place)
├── DailyScreen ──── MuhuratHub (1,016 lines, 21 useState) ──── CalendarPage
│                └── PlanetCalendarCard, HolidayOverlayCard, DailyWindowsCard, PlaceInput
├── ChartScreen ──── MatchingScreen, JyotishBnnScreen, RectifyScreen, ChartVault,
│                    DiamondChart, EastChart, SouthChart, DashaTree
├── PrashnaScreen (self-contained — own palette, own inlined engine)
├── FestivalGuideScreen, UtilityCalculatorScreen, MedicalMuhuratScreen, PersonalMuhuratScreen
```

**Collision hotspots, ranked:**

| Rank | File | Why it collides |
|---|---|---|
| 1 | `src/kundli-app.tsx` | Palette + routing + lang + place + hero copy + nav. Reservation-gated. **Every new route must edit it.** |
| 2 | `src/screens/MuhuratHub.tsx` | 96 KB, 21 `useState`, 1,151-char lines. Currently claimed by `CLAUDE-EN-SIGN-NAMES-E1.0`, referenced in three other reservations. |
| 3 | `src/screens/ChartScreen.tsx` | 92 KB; hosts *four* other screens as sub-modules. Reservations #35 and #36 both scope-limit themselves to "only the `#arudha` section" to avoid it. |
| 4 | `src/screens/UtilityCalculatorScreen.tsx` | 4,504-char lines make any two concurrent edits a conflict. |
| 5 | `src/components/tokens.ts` | Integration-owned; **contains no colours**, so it can't absorb the theme work coming in the redesign. |

## 1.7 Design layer (confirming the brief's numbers)

- **1,405** `style={{` blocks across **31** files. `MuhuratHub` 290, `ChartScreen` 255.
- **80 unique hex colours, 288 occurrences.**
- [`tokens.ts`](src/components/tokens.ts) has type scale, spacing, radii, elevation —
  **and no colour tokens at all.**
- The palette is defined **twice**, as two structurally different objects with different
  key names:
  - [`kundli-app.tsx:74-77`](src/kundli-app.tsx:74) — `{bg, panel, line, gold, sindoor, ivory, muted}`
  - [`PrashnaScreen.tsx:8-14`](src/screens/PrashnaScreen.tsx:8) — `{bg, card, ink, muted, line, gold, goldSoft, sindoor, sindoorSoft, amber, amberSoft…}`

  Note `panel` vs `card`, `ivory` vs `ink` — the *same colour* under two names. A theme
  change requires editing both plus 288 hex literals.
- **Bilingual copy is inline, not in the i18n layer.** [`src/i18n.ts`](src/i18n.ts) exists
  (6.4 KB dictionary, header comment: *"Shared by every screen; integration-owned. Add
  strings here, don't fork."*) but is imported by **2 of 32** `.tsx` files
  (`MuhuratHub`, `CalendarPage`). Meanwhile there are **346** inline
  `lang === "hi" ? … : …` ternaries in `src/`. Adding a third language (§17.3, the Drik
  parity gap) means editing 346 expressions across 31 files.

## 1.8 Build & deploy

- **Build:** `vite build`, 6-line config, no options set.
- **Output: a single 2.42 MB / 692 KB-gzip JS chunk.** `grep -rn "React.lazy|Suspense|import("` across
  `src/` → **zero matches**. There is no code splitting of any kind.
  This means a visitor landing on `/festival/karva-chauth` from Google downloads:
  all 181 festival guides, `vrat-vidhis.ts` (204 KB source),
  `major-festival-guides.ts` (144 KB), `festival-route-content.ts` (86 KB),
  `life-interpretation.ts` (72 KB), `festival-meta.ts` (70 KB),
  `sequence-guides.ts` (66 KB), the full Jyotish chart engine, the Prashna KP engine,
  the matching engine, and the 15 KB city gazetteer — **to read one page about one
  festival.** On the mid-range Android phones of the India scale audience this is the
  single largest gap between "phone-first" as a requirement (§3) and as a fact.
- **Deploy:** Cloudflare Pages, auto-deploy from `main`
  ([`wrangler.jsonc`](wrangler.jsonc)), `pages_build_output_dir: ./dist`, one KV binding.
- **Second, unshipped deploy target:** `render.yaml` + `Dockerfile` for the API service.
- **Validation:** 25 gates listed in AGENTS.md, run via
  [`validation/_load-app.cjs`](validation/_load-app.cjs), which esbuild-bundles real app
  modules — the same trick as the API bridge. This harness is a genuine architectural
  asset and it is why the engine can be trusted through a refactor.

## 1.9 Structural bug patterns (not a bug list)

Six patterns that *generate* bugs, each traceable to a missing layer:

1. **No single source for "current context."** Date, place, language, calendar system and
   mode are each held by a different owner with a different persistence rule. `place` lives
   in the shell; `date` and `cal` live in `DailyScreen`; `mode`/`lang` live in the shell;
   `trad` lives in `MuhuratHub`. Each has its own `popstate` restore path
   ([`kundli-app.tsx:110`](src/kundli-app.tsx:110),
   [`DailyScreen.tsx:39-42`](src/screens/DailyScreen.tsx:39)) which restores only *its*
   keys. **Back/forward restores a partial state** — this is the mechanism behind the
   prior audit's "state reset" class of bugs, and it violates the standing contract
   "no state reset without a user action."
2. **Derived state recomputed inline, unmemoised, from `window`.** The four `*FromPath`
   calls at [`kundli-app.tsx:92-95`](src/kundli-app.tsx:92) run every render and return
   **new object identities**, which are then listed as `useEffect` dependencies at
   [`:102`](src/kundli-app.tsx:102). The metadata effect and the `page_view` telemetry
   event therefore re-fire on every render of the shell.
3. **Silent `catch {}`.** `try { … } catch (e) {}` appears throughout —
   [`url-prefs.ts`](src/components/url-prefs.ts) (all five functions),
   [`ChartVault.tsx:23,26,39,67`](src/components/ChartVault.tsx:23),
   [`DailyScreen.tsx:47,78,92`](src/screens/DailyScreen.tsx:47). AGENTS.md line 35 requires
   *"Errors must surface visibly in the UI. Silent failure is unacceptable."* The pattern
   directly contradicts it, and is why a broken calculation renders as an empty card
   rather than a message.
4. **Feature detection standing in for a decision.** `window.storage` (§1.5) makes a
   missing storage layer look like a graceful degradation. The feature is simply absent in
   production and no gate catches it.
5. **Copy-paste divergence from having no shared primitives.** No `<Card>`, `<Button>`,
   `<SectionHeader>` or `<Panel>` component exists — the `card` *object literal* is
   defined once at [`kundli-app.tsx:78-83`](src/kundli-app.tsx:78) and spread into
   `style={{...card, padding: 16}}` at 24 sites. Any variation (padding, border colour,
   hover) is re-invented locally, which is where the 80 hex colours came from.
6. **Half-finished migrations left in the tree.** Nine "Wire deferred" modules (§1.6) mean
   two live copies of the same logic. A fix applied to one copy leaves the other wrong —
   and which copy renders depends on which route you took.

---

# 2. Problems ranked by severity × strategy impact

| # | Problem | Strategy line hit | Severity | Evidence |
|---|---|---|---|---|
| **1** | **Client-only rendering: every crawler and every WhatsApp/iMessage scraper gets the homepage shell for all ~199 routes.** No SSR/SSG/prerender exists. | §17.1 diaspora share loop, §17.4 SEO — *the* growth wedge | **BLOCKER** | `vite.config.ts` (6 lines); `_redirects` `/* /index.html 200`; `dist/index.html`; [`route-metadata.ts:64`](src/metadata/route-metadata.ts:64) |
| **2** | **No `og:image`, no `robots.txt`, no `sitemap.xml`.** Link previews are grey boxes; 181 festival routes are undiscoverable. | §17.1, §17.4 | **BLOCKER** | zero grep matches, repo-wide |
| **3** | **2.42 MB single bundle, zero code splitting.** A festival page loads the entire app. | §3 phone-first, §11 performance, §5.2 India scale market | **HIGH** | `dist/assets/index-*.js`; zero `React.lazy`/`import()` |
| **4** | **No storage layer. `window.storage` is undefined in production**, so saved charts and saved tradition silently no-op. AGENTS.md still bans browser storage; §11 permits it. Unresolved. | §7.1 "knows me", §8 saved charts, §5.4 retention, §16.4 practitioner vault | **HIGH** | [`ChartVault.tsx:9`](src/components/ChartVault.tsx:9), [`MuhuratHub.tsx:131`](src/screens/MuhuratHub.tsx:131); AGENTS.md:33 vs requirements §11 |
| **5** | **No domain model.** 19 types in 106 files; `Place` declared 3×; `strict: false`; Chart/Prashna/SavedItem unmodelled. | §8 saved charts, §16.1 event PDF artifacts, §16.2 API stability | **HIGH** | §1.4 above |
| **6** | **`kundli-app.tsx` is a routing/palette/state god-file that every new route must edit** — serialising ~10 agents through one reservation-gated file. | §11 code ownership, redesign velocity | **HIGH** | [`kundli-app.tsx:92-96, 189, 214-224`](src/kundli-app.tsx:92); commit `a7d763f` |
| **7** | **No design-system layer.** 1,405 inline styles, 80 hex colours, palette defined twice with different key names, `tokens.ts` has no colours. | §10 theme redesign — the owner must pick a theme that then has to be *applied* | **HIGH** | §1.7 above |
| **8** | **Prashna and Jyotish have no crawlable URL** — they are `?screen=` query params. | §5.1 "both zones launch visibly", §17.4 | **MED-HIGH** | [`kundli-app.tsx:90`](src/kundli-app.tsx:90) |
| **9** | **10 duplicate-content festival pairs**, each self-canonicalising. | §17.4 SEO | **MED** | [`festival-pages.ts:33`](src/data/festival-pages.ts:33) vs `_redirects` |
| **10** | **Partial state restore on back/forward** — five owners, five independent `popstate` handlers. | Standing contract "no state reset without a user action" | **MED** | §1.9.1 |
| **11** | **i18n layer exists but is bypassed** — 346 inline ternaries vs 2 files importing `i18n.ts`. | §17.3 regional languages (the Drik parity gap) | **MED** | §1.7 |
| **12** | **Nine "Wire deferred" modules** with live duplicate copies in the shell. | Correctness, agent velocity | **MED** | §1.6 |
| **13** | **Silent `catch {}` throughout.** | AGENTS.md:35, §7 "user can always tell what the app is doing" | **MED** | §1.9.3 |
| **14** | **API is built but not deployed** — the highest-value India revenue line (§16.2) is sitting complete in the repo. | §16.2 | **MED** *(opportunity, not defect)* | [`render.yaml`](render.yaml) `sync: false` |

**Read #1 and #2 together.** They are one problem with two faces, and they gate the entire
acquisition strategy. Every hour spent on theme, IA or copy before this is resolved is
spent on a product that Google and WhatsApp cannot see.

---

# 3. Target architecture

Six layers, strictly one-directional (`↓` = "may import"):

```
  data/content  ──┐
                  ↓
  engine/  (pure, no React, no DOM, no I/O)      ← licensable as-is
                  ↓
  domain/  (entity types + codecs: Place, PanchangDay, Festival,
            Chart, PrashnaQuestion, SavedItem, Preferences)
                  ↓
  app/     (routes, context/store, storage adapter, i18n)
                  ↓
  ui/      (design system: tokens incl. colour, primitives, no business logic)
                  ↓
  screens/ (composition only)
```

### 3.1 Rendering — **static pre-rendering at build time (SSG)**

Not SSR. Ganak's content is deterministic per (route, place, date) and the engine already
runs in Node. The build should emit **real HTML per route**, with correct `<title>`,
`description`, `canonical`, full Open Graph including `og:image`, and JSON-LD `Event`
markup for festivals. React then hydrates over it — the app behaves identically once JS
loads.

- Generate from the **existing registries**, not a hand-written list:
  `FESTIVAL_PAGE_ROUTES` (181), `UTILITY_CALCULATORS` (14), plus the fixed routes. The
  registry already throws on duplicate paths — that guarantee extends to the sitemap for free.
- **`og:image`:** a Cloudflare Pages Function rendering an SVG→PNG card per route
  (festival name, date, city, timing) at request time, cached at the edge. This is the
  "beautiful image card with facts baked in" of §17.1, delivered as a URL rather than a
  client-side canvas — which is the only form WhatsApp can consume.
- **City-aware share URLs:** promote `?city=…&lat=…&lon=…` to a path segment for the
  share surface — `/festival/diwali/dallas` — so the card and the crawlable URL are the
  same artifact. Keep the query form working as a redirect.
- Emit `sitemap.xml` and `robots.txt` in the same build step.

**Explicit trade-off to name:** local timings are place-dependent, so a pre-rendered page
must commit to a default place in its HTML. Recommendation: pre-render each festival page
at the **festival's own regionally-dominant city** (or New Delhi as fallback), put the
date and meaning — the part that *is* place-independent — in the title, description and
OG card, and let hydration re-localise timings to the visitor's place instantly. Crawlers
get a correct, substantive, non-thin page; humans get their own city within one frame.

### 3.2 Engine boundary — **promote to a package, then ship the API**

The engine is already clean (zero React imports). Three steps, none of them a rewrite:

1. Invert the 3 outward imports (§1.6) to **injected parameters** — pass `FEST_NAME` into
   `search-upcoming`, `NAMING_SYLLABLES` into `utility-calculators`. That makes
   `src/engine/` a **zero-dependency leaf.**
2. Add a `src/engine/index.ts` barrel that *is* the public contract, and a gate asserting
   nothing outside it is imported by `screens/` or `server/`. Today the contract is
   implicitly the six entry points inlined in the
   [`engines.mjs` esbuild stdin](server/api/engines.mjs) — make that list explicit and
   validated instead of embedded in a template string.
3. **Deploy the API.** Everything else exists. This is the §16.2 revenue line, and it
   costs a Render deploy plus key generation, not engineering.

### 3.3 Domain model

One `src/domain/` module per entity, exporting a type plus `parse`/`serialise` codecs.
Minimum viable set:

| Entity | Replaces | Must carry |
|---|---|---|
| `Place` | 3 duplicate types + 2 literals | `{label, lat, lon, zone}`, IANA-validated, URL codec |
| `DateContext` | scattered ISO strings + `todayISO()` | civil date + zone + "is today" |
| `Preferences` | `lang`, `cal`, `hol`, `trad`, ascendant | one object, one store, one URL codec |
| `Chart` | `ChartVault`'s three ad-hoc shapes | **versioned** birth input + place + ayanamsa; export/share/save all derive from it |
| `SavedItem<T>` | — | `{id, kind, name, savedAt, schemaVersion, payload}` |
| `Festival` | already good | keep `festival-pages.ts` as the reference implementation |

`Chart` versioning is not optional: saved charts must survive engine upgrades, and the
§16.1 event-report PDF and §16.4 practitioner vault both serialise it.

### 3.4 Storage

Resolve the policy contradiction first (Decision 4, §5), then build **one adapter**,
`src/app/storage.ts`, with exactly two named stores and nothing else:

- `preferences` — non-sensitive, auto-saved, user-clearable, URL always wins on read.
- `savedCharts` — written **only** on explicit user action, per §8/§11.

Everything goes through the adapter; the `parse-check` gate changes from "ban
`localStorage`" to "ban `localStorage` **outside `src/app/storage.ts`**" — which is a
stronger, more auditable rule than the current blanket ban, and satisfies §11's
"auditable preference store."

### 3.5 Routing & state

- **One route table** in `src/app/routes.ts`, built from the registries. One matcher.
  Adding a route = adding a registry entry, **not** editing the shell. This alone removes
  the worst multi-agent serialisation point.
- **Path-based routes for everything public**, including `/prashna` and `/jyotish`
  (query forms redirect). This is already scoped as `P0-CUSTOM-DOMAIN` in the backlog.
- **One `AppContext`** holding `{place, date, preferences}` with a single URL-sync
  effect and a single `popstate` restore — replacing five independent ones and fixing
  problem #10 structurally. Screens read context instead of receiving 46 `C=`, 44 `lang=`
  and 24 `card=` props.

### 3.6 Design system & i18n

- **Colour tokens into `tokens.ts`** (or `ui/theme.ts`) with **semantic** names —
  `surface`, `surfaceRaised`, `textPrimary`, `textMuted`, `accent`, `alert`, `hairline` —
  not `gold`/`ivory`/`sindoor`. Semantic naming is what makes the §10 theme decision
  *swappable*; literal colour names bake one theme into 288 call sites again.
- **Primitives:** `<Card>`, `<Button>`, `<SectionHead>`, `<Field>`, `<Chip>`. The
  `card` object literal and the `btn()` helper inside `ChartVault` are these components
  waiting to be born.
- **Route all strings through `i18n.ts`.** Add a gate that fails on new inline
  `lang === "hi"` ternaries in `screens/` — freezing the count at 346 and driving it down,
  rather than trying to convert all of them at once. This is the precondition for §17.3.

---

# 4. Incremental migration path

Ordered so that **nothing is a big-bang rewrite**, the live app keeps working after every
step, and the SEO-blocking work lands first. Each phase is independently shippable and
independently reversible.

### Phase 0 — Unblock the strategy (highest ROI, ~zero UI risk)

*Touches: build tooling, `public/`, `_redirects`, one Pages Function. Touches no screen.*

1. Add a **prerender step** to the Vite build that walks `FESTIVAL_PAGE_ROUTES` +
   `UTILITY_CALCULATORS` + fixed routes and emits real HTML per route. Reuse
   `routeMetadata()` — it already computes correct per-route titles and descriptions; it
   is simply being called too late. This is a *build* change, not an app change.
2. Emit `sitemap.xml` + `robots.txt` from the same registry walk.
3. Add the **`og:image` Pages Function** and wire `og:image` / `twitter:card` /
   `og:type` / `og:site_name` into the prerendered heads.
4. Add the 10 legacy `301`s to `_redirects` from `FESTIVAL_LEGACY_PATH_REDIRECTS`
   (the code comment already anticipates exactly this) and set `canonicalPath` for them.
5. **New gate:** `validation/prerender-seo.cjs` — every registry route has a built HTML
   file with a unique title, a description, a self-consistent canonical, and an `og:image`.
   Locks the win in permanently.

> Phase 0 converts the growth strategy from impossible to merely-needs-content. It should
> ship **before** the redesign, because the redesign's screens will otherwise be built
> against a rendering model that has to change anyway.

### Phase 1 — Code splitting (`vite.config.ts` + entry points only)

6. `React.lazy` the four heavy independent screens (`ChartScreen`, `PrashnaScreen`,
   `MuhuratHub`, `FestivalGuideScreen`) and `manualChunks` the content in `src/data/`.
   Target: **festival-page first load under ~250 KB gzip**, down from 692 KB. No screen
   internals change — only import sites.

### Phase 2 — Foundations under the redesign (parallel-safe, new files only)

7. `src/domain/` — write the six entity types. **Add, don't yet migrate.** New code uses
   them; old code compiles unchanged. Turn on `strict: true` for `src/domain/` and
   `src/engine/` only, via a second tsconfig — strictness earns its way in rather than
   arriving as a 106-file breakage.
8. `src/app/routes.ts` — the single route table. Rewire `kundli-app.tsx` to consult it
   once. This deletes the 4-clause negation repeated four times and ends "every new route
   edits the shell." One focused, integration-owned change with immediate multi-agent payoff.
9. `src/app/storage.ts` — after Decision 4 lands. Replace `window.storage` at its two call
   sites. Saved charts start actually working.
10. `ui/theme.ts` — semantic colour tokens. Migrate `kundli-app.tsx` and
    `PrashnaScreen.tsx` to a single palette (they are the two definitions; unifying them
    is a ~20-line change). Do **not** touch the 1,405 inline styles yet.

### Phase 3 — Screen-by-screen, riding the redesign

The UI redesign is going to rewrite these screens anyway (requirements §14.3 step 9,
"screen-by-screen production port"). **Pay the architecture cost inside that rewrite, not
separately.** Per screen, in the order the redesign chooses:

- consume `AppContext` instead of `C`/`card`/`lang`/`place` props;
- use `ui/` primitives instead of inline styles;
- move strings to `i18n.ts`;
- **delete the shell's duplicate copy** and drop the "Wire deferred" marker;
- run the existing gates.

Recommended sequence (largest strategic payoff first): **Today/Daily → Festival guide →
Muhurat (consolidating the two homes, §6) → Jyotish → Prashna last** (it is self-contained
and already good; §12 says preserve it).

### Phase 4 — Harvest

11. Invert the 3 engine→data imports; add `src/engine/index.ts` + a boundary gate.
12. **Deploy the API** (Render + keys + live smoke). §16.2 revenue line opens.
13. Ratchet gates: no new inline `lang === "hi"` in `screens/`; no `localStorage` outside
    the storage adapter; no `catch {}` without a visible user-facing surface.

**What this ordering protects:** Phases 0–1 are pure infrastructure and cannot break a
screen. Phase 2 is additive. Phase 3 is the redesign, which is happening regardless. No
step requires the app to be offline, and every step is a normal-sized reviewable commit.

---

# 5. Top 5 decisions for the owner

### Decision 1 — Rendering model: how do crawlers and WhatsApp get real HTML?
*Blocks: the entire growth strategy (§17.1, §17.4).*

| Option | Consequence |
|---|---|
| **A. Build-time prerender (SSG) into the existing Vite build** ✅ | ~1 focused workstream. No framework change, no new hosting, no per-request cost. Trade-off: pages commit to a default place in their HTML (mitigated in §3.1). |
| B. Migrate to Next.js / Remix | Solves it thoroughly and permanently, but is a **framework migration across 32 screens** in parallel with a full UI redesign, by ~10 agents. High collision risk, months. |
| C. Cloudflare edge SSR of the React tree | Full per-request localisation, but puts the 2.42 MB app on the render path and adds a runtime failure mode to every page view. |

**Recommendation: A.** It reuses `routeMetadata()` and the festival registry that already
exist, is a build-config change rather than an app change, and can ship **before** the
redesign. Revisit B only if per-visitor server localisation later proves necessary — SSG
does not foreclose it.

### Decision 2 — Does Phase 0 (SEO/share infrastructure) ship *before* the UI redesign?
*Blocks: sequencing of everything.*

**Recommendation: yes — Phase 0 and Phase 1 first, then the redesign.** Reasons: (a) it is
the #1 strategy risk and it is currently at 0%; (b) it touches build tooling and `public/`,
so it **cannot collide** with the redesign's screen work and can run genuinely in parallel;
(c) redesigned screens built on a client-only model would need reworking once prerendering
lands. The requirements doc's "lock requirements before building further" (§14) governs the
*UI*; this is infrastructure underneath it and does not need the theme decision.

### Decision 3 — Deploy the developer API now, or after the redesign?
*Blocks: §16.2, described as "the biggest, most defensible" India revenue.*

**Recommendation: deploy now, quietly.** The code, contracts, adversarial bug-bash fixes,
Dockerfile and Render blueprint are all merged; what remains is hosting + key generation +
a live smoke run. It is on a **separate service and separate deploy path** — it cannot
destabilise the website. Shipping it converts a finished asset into a live one and lets
B2B conversations start during the redesign instead of after it. *(Owner gate: this
involves an external service (Render) and outward-facing exposure — per AGENTS.md's
autonomy boundary, it needs your go-ahead.)*

### Decision 4 — Resolve the browser-storage contradiction.
*Blocks: "knows me" (§7.1), saved charts (§8) — both are Phase-1 launch requirements, and
both are currently non-functional in production.*

AGENTS.md line 33 bans browser storage outright; requirements §11 permits scoped local
preferences and explicitly-saved charts and says the convention "must be updated." Until
someone lands that edit, `window.storage` remains a dead placeholder and both features are
blocked.

**Recommendation:** amend AGENTS.md to *"`localStorage` is permitted **only** through
`src/app/storage.ts`, which exposes exactly two stores — `preferences` (non-sensitive,
user-clearable) and `savedCharts` (written only on explicit user action). Direct
`localStorage` / `sessionStorage` use anywhere else remains banned and is enforced by
`parse-check`."* This is **stricter and more auditable** than today's rule, because today's
rule is being routed around by a non-existent API rather than obeyed. It also gives §11's
"auditable preference store" a concrete definition. *(This is a convention change and a
privacy-surface change — your call, not an agent's.)*

### Decision 5 — Colour tokens: semantic names or brand names?
*Blocks: whether the §10 theme choice is a one-file change or an 80-colour migration.*

The redesign will produce a chosen theme. If tokens are named `gold` / `sindoor` / `ivory`,
that theme is baked into every call site and the *next* theme change repeats today's
problem. If they are named `accent` / `alert` / `textPrimary`, a theme becomes a values
file.

**Recommendation: semantic names**, with the chosen theme as the first values file and a
gate forbidding new raw hex in `screens/`. Concretely, do this **before** presenting theme
options, so the options can be demonstrated as a token swap on the same screen — which is
exactly the process §10 asks for ("a few distinct theme options applied to the same
screen") and is otherwise three separate hand-restyles.

---

## Appendix — evidence index

| Claim | Source |
|---|---|
| Client-only rendering, no SSR/SSG/prerender | [`vite.config.ts`](vite.config.ts) (6 lines) |
| Every route serves one shell | [`public/_redirects`](public/_redirects) `/* /index.html 200` |
| Deployed HTML carries homepage OG for all routes | [`dist/index.html`](dist/index.html) |
| Metadata applied client-side post-hydration | [`route-metadata.ts:64-87`](src/metadata/route-metadata.ts:64), called [`kundli-app.tsx:98-102`](src/kundli-app.tsx:98) |
| No `og:image` / `twitter:card` / `robots.txt` / `sitemap.xml` | repo-wide grep, 0 matches |
| 2.42 MB single bundle, 0 code splitting | `dist/assets/index-B8SRDw_3.js`; 0 matches for `React.lazy|Suspense|import(` |
| 181 festival + 14 calculator routes | executed `festival-pages.ts` / `utility-calculators.ts` registries |
| 5 route parsers, 4-clause negation ×4 | [`kundli-app.tsx:92-96, 189, 214-224`](src/kundli-app.tsx:92) |
| 19 types / 106 files; `Place` ×3; `strict: false` | grep + [`tsconfig.json`](tsconfig.json) |
| `window.storage` undefined in production | [`ChartVault.tsx:9`](src/components/ChartVault.tsx:9), [`MuhuratHub.tsx:131-132`](src/screens/MuhuratHub.tsx:131) |
| Storage-policy contradiction | AGENTS.md:33 vs [`ganak-redesign-requirements.md` §11](plans/ganak-redesign-requirements.md) |
| Engine has zero React imports | `grep -rln react src/engine` → none |
| Engine-as-API already built | [`server/api/v1.mjs`](server/api/v1.mjs), [`engines.mjs`](server/api/engines.mjs), [`Dockerfile`](Dockerfile), [`render.yaml`](render.yaml) |
| 1,405 inline styles / 31 files; 80 hex / 288 uses | grep counts |
| Palette defined twice, different key names | [`kundli-app.tsx:74-77`](src/kundli-app.tsx:74), [`PrashnaScreen.tsx:8-14`](src/screens/PrashnaScreen.tsx:8) |
| `tokens.ts` has no colours | [`src/components/tokens.ts`](src/components/tokens.ts) |
| 346 inline `lang === "hi"`; `i18n.ts` used by 2 files | grep counts |
| 46 `C=` / 44 `lang=` / 24 `card=` prop drills | grep counts |
| 9 "Wire deferred" duplicate modules | grep `Wire deferred` |
| 10 unrouted legacy redirects | [`festival-pages.ts:33-44`](src/data/festival-pages.ts:33) vs `_redirects` |
| 4,504-char max line | `awk` over `UtilityCalculatorScreen.tsx` |
| 7 ACTIVE/RESERVED agent rows | [`plans/task-log.md`](plans/task-log.md) |
