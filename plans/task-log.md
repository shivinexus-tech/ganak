# Ganak — Shared Agent Task Log

Purpose: the durable coordination record for Claude Code, Codex, Cursor and other
agents. Record work here before editing code so parallel branches never claim the
same file.

## Rules

1. One active writer per file. Directory ownership is preferred for feature work.
2. Concurrent coding uses a separate Git branch and worktree per agent.
3. The integration owner alone edits shared shell/navigation/token files while merges
   are in progress.
4. Every entry lists exact allowed files. Anything outside that list requires a new
   reservation before editing.
5. Finish with gate evidence and a handoff. Never mark a task done because code was
   drafted but not validated.

## Status key

- `RESERVED` — assigned; editing may begin.
- `ACTIVE` — work in progress.
- `REVIEW` — implementation complete and left for review.
- `MERGED` — integrated and validated on the integration branch.
- `BLOCKED` — cannot progress; reason and required decision recorded.

## Active and recent tasks

| ID | Status | Agent | Branch/worktree | Exclusive files | Task | Evidence / handoff |
|---|---|---|---|---|---|---|
| SPLIT-ENGINE-01 | MERGED | Codex | `main` @ `a21260d` | `src/kundli-app.tsx`, `src/engine/*`, `plans/codex-handoff-engine-split.md` | Pure astronomy engine split | Gates/build/browser green; handoff `plans/codex-handoff-engine-split.md`; committed+pushed in `a21260d` (2026-07-19) |
| SPLIT-UI-01 | MERGED | Codex | `main` @ `a21260d` | `src/kundli-app.tsx`, `src/screens/PrashnaScreen.tsx`, `src/components/tokens.ts`, `src/components/format.ts`, `validation/prashna-parity.js`, coordination docs | First pure UI slice: extracted Prashna screen plus exact shared tokens/formatter moves; no intended behaviour or styling change | Parse clean; parity EXACT (198 values/6 charts); Prashna 24/24; Muhurat/content anchors pass; production build passes; Daily + Prashna browser smoke pass with 0 console errors; review: `plans/codex-review-ui-split.md`; committed+pushed in `a21260d` (2026-07-19) |
| SPLIT-UI-02 | MERGED | Cursor | `main` | `src/kundli-app.tsx`, `src/data/places.ts`, `src/components/PlaceInput.tsx`, coordination docs | Shared place search + gazetteer extraction (pure move) | Gates green; auto commit+push per owner standing policy 2026-07-19 |
| SPLIT-UI-03a | MERGED | Claude Code | `main` | `src/engine/hora.ts` (new), `src/engine/panchang.ts`, `src/kundli-app.tsx`, coordination docs | Prep slice for Daily: extract the hora (planetary hours) engine out of the shell, and move `SIGN_LORD` to `panchang.ts` so hora needs nothing from the shell | Pure move. Parse clean ×3; parity EXACT (198/6); Prashna 24/24; muhurat-anchors pass; content-dates pass; build passes; browser smoke: hora timeline + advisor + ascendant personalization all correct, 0 console errors. **Guard proven non-vacuous:** removing the new import made parse-check fail with all 8 hora orphans. Shell 4,787 → 4,593 lines. |
| SPLIT-UI-03b | MERGED | Claude Code | `main` | `src/i18n.ts` (new), `src/kundli-app.tsx`, coordination docs | Prep slice for Daily: extract bilingual string dictionary `L` plus `tr`/`trN`/`obsLabel` into a shared i18n module | Pure move. Parse clean ×2; parity EXACT; Prashna 24/24; muhurat-anchors + content-dates pass; build passes; browser smoke both languages (248 Devanagari runs; Yogini Ekadashi/Ravi Pradosh variant labels translate via the rewired cross-module dicts), 0 console errors. **Guard proven:** dropping the import failed parse-check with tr/trN/obsLabel orphans. Shell 4,593 → 4,534. |
| SPLIT-UI-03c | MERGED | Claude Code | `main` | `src/engine/panchaka.ts` (new), `src/engine/ephemeris.ts`, `src/components/format.ts`, `src/kundli-app.tsx`, coordination docs | Final prep slice for Daily: `fmtTime`/`fmtTimeD` → format.ts, `ascendantAt` → ephemeris.ts, `computeLagnaPanchaka` + `PANCHAKA_TYPE` + `panchakaRem` → new panchaka engine | Pure move. Parse clean ×4; parity EXACT; Prashna 24/24; muhurat-anchors + content-dates pass; build passes. Browser: Udaya Lagna schedule, Panchaka Rahita windows, birth chart (Lagna Meena 1°25′, Sun Makara — consistent), and both `computeLagnaPanchaka` callers incl. finder top-day panchaka; 0 errors on instrumented remount. **Guard proven:** dropping both imports failed parse-check with ascendantAt + computeLagnaPanchaka orphans. Shell 4,534 → 4,460. **Daily is now unblocked.** |
| SPLIT-UI-03d | MERGED | Claude Code | `main` @ `bb651fc` | `src/engine/panchang.ts`, `src/kundli-app.tsx` | Move `VIM_LORDS` to the engine — the last shared constant blocking Daily | Gates + build green. **Incident:** the shell half of this edit was swept into another agent's commit `d59d60c` without the `panchang.ts` half, leaving `main` unbuildable; repaired in `bb651fc`. |
| SPLIT-UI-03-WIRE | MERGED | Claude Code | `main` @ `3b3b6b2` | `src/kundli-app.tsx`, Daily modules | Wire peeled Daily modules into the shell | Shell 4,185 → 3,001; gates + browser green; docs `8eeeb9b`. |
| CODEX-P1-BUNDLE | MERGED | Codex | `main` | see `plans/codex-task-phase1-bundle.md` | Tracks 1–3 complete: content, Chart wire, Phase 1 hide + deploy | Production: https://ganak.pages.dev; see `plans/deploy-notes.md`. |
| P1-CONTENT | MERGED | Codex | `main` | `src/data/festival-meta.ts`, `src/data/vrat-vidhis.ts`, `src/engine/festivals.ts`, `validation/content-dates.cjs`, `plans/phase1-content-diwali-chhath.md` | Phase 1 Diwali cluster + complete four-day Chhath calendar sequence | Added 10 bilingual entries; Chhath reuses sourced vidhi; 27/27 day-part anchors, parse ×4, parity 198/6, Prashna 24/24, Muhurat and build pass. |
| SPLIT-UI-CHART-WIRE | MERGED | Codex | `main` | `src/kundli-app.tsx`, `src/screens/RectifyScreen.tsx`, listed Chart/Jyotish peel modules | Import peeled Chart/Jyotish modules and delete shell copies | Shell 3,001 → 1,285 lines (-1,716). Local engine/UI copies removed; missing `useEffect` import fixed in Rectify. Parse, parity 198/6, Prashna 24/24, Muhurat, content 27/27, and build pass. Browser: chart cast, matching 19.5/36, Rectify + BNN reachable, 0 console errors. |
| P1-HIDE-DEPLOY | MERGED | Codex | `main` | `plans/deploy-notes.md`; Cloudflare Pages settings | Deploy the already-hidden Phase 1 web build; do not edit shell | Live at https://ganak.pages.dev. GitHub `main` auto-deploy enabled; Cloudflare access restricted to Ganak. Phone smoke: Daily + Prashna pass, legacy Chart route falls back to Daily, 0 console errors. No shell edits. |
| CLAUDE-DAILY-POLISH | MERGED | Claude Code | `main` | see `plans/claude-task-daily-prashna-polish.md` | Daily/Prashna/Muhurat polish chips A–F | All chips closed (D/E no-op). Leftover: Hindi lunar-month names (not invented). |
| SHELL-FINISH-48H | MERGED | Cursor | `main` | `src/screens/ChartScreen.tsx`, `src/kundli-app.tsx` | Extract ChartScreen; thin shell to nav+compose | Shell **1,285 → 377** lines. Chart tab remains hidden (Daily+Prashna). Gates: parse ×2, parity EXACT, Prashna 24/24, muhurat+content, build pass. |
| SPLIT-UI-DAILY-SCREEN | MERGED | Cursor | `main` | `src/screens/DailyScreen.tsx` (new), `src/kundli-app.tsx`, `plans/backlog.md`, `plans/module-ownership-map.md`, `plans/task-log.md` | Peel remaining Daily chrome into DailyScreen; shell = nav + shared place + compose | Shell **377 → 143** lines. Parse ×2 clean; parity EXACT; Prashna 24/24; muhurat + content 27/27; build pass. Shared `panchPlace` stays in shell (Prashna). |
| CLAUDE-LAUNCH-PRIVACY | MERGED | Claude Code | `main` | `src/kundli-app.tsx`, `src/main.tsx` (font entry), `server/index.js` (CORS fixes), `.claude/launch.json`, `plans/legal-privacy-terms-draft.md`, `plans/task-log.md` | Fix false footer; self-host Eczar+Spectral; verify server guards | **Footer** bilingual + true in both langs (browser-verified). **Fonts:** @fontsource Eczar 500/600/700 + Spectral 300/400/600/400-italic; imports live in `main.tsx` (not the shell — the gate bundler has no font loaders); `dist/` grep 0 google hits, 35 same-origin woff2 incl. Devanagari; `document.fonts.check` passes for Eczar Devanagari; network shows zero Google requests. Gates + build green. **Server guards: 20/20 checks passed over real HTTP** — sandbox forbids sockets, so `npm run smoke` itself cannot run here; instead ran the proxy via Browser-pane launch config `ganak-proxy` (:3199; :3001 was held by Codex's process, untouched) and drove every check from two browser origins. Same-origin: health/404/nosniff/no-store/fingerprint/origin-gate. Allowed-origin: both 401s, all validation 400s, 413, 503-no-key, leak checks. Limiter fired at exactly request 21 (20;w=900), Retry-After 900 readable. **2 real CORS bugs found+fixed:** `allowedHeaders` lacked `x-ganak-key` (browsers could NEVER send the secret — preflight rejected it; curl masked the bug) and `Retry-After` wasn't in `exposedHeaders` (app couldn't read wait time on 429). Owner: `cd server && npm run smoke` still worth one local run. |
| CURSOR-MUHURAT-PERF | MERGED | Cursor | `main` | `src/screens/MuhuratHub.tsx`, `plans/perf-startup-scan.md`, `plans/cursor-task-muhurat-perf.md`, coordination docs | Async + shorten Daily panchang scan (was 16.6s sync 400-day) | **Shipped:** `useEffect`+`setTimeout(0)` + **400→90 days**. Node timing Delhi: 90d **2.8s** / 400d **16.4s** (non-blocking). Parse clean; parity EXACT; Prashna 24/24; muhurat+content; build pass. Brief: `plans/cursor-task-muhurat-perf.md`. |
| CURSOR-LUNAR-CACHE | MERGED | Cursor | `main` | `src/engine/panchang.ts`, `plans/perf-startup-scan.md`, `plans/task-log.md` | Share lunar-month window cache with `amantaMonthIdx` (festivals scan hot path) | **Root cause:** `lunarMonthInfo` was already cached; festivals used uncached `amantaMonthIdx` (~41 ms/day). Shared via `ensureLmWindow`. After: amanta ~4 ms/day; scan90 **4.8s → 0.7s**; scan400 **~16s → 1.1s**. Gates: parse, parity EXACT, Prashna 24/24, muhurat, content 27/27, build. |
| CURSOR-SUNEVENTS-01 | MERGED | Cursor | `main` | `src/engine/festivals.ts`, `plans/perf-startup-scan.md`, `plans/task-log.md` | Chip F #4: rolling reuse of `sunEvents` across adjacent scan days | Parse clean; parity EXACT; Prashna 24/24; muhurat; content 27/27; build pass. Delhi timing: 90d **~0.43s**, 400d **~1.7s**. |
| CODEX-P1-CONTENT-02 | MERGED | Cursor | `main` | `src/engine/festivals.ts`, `src/data/festival-meta.ts`, `validation/content-dates.cjs` | P1 festival calendar batch 2 (Slice A+B) | **2026-07-20.** +11 keys: Chaitra Navratri, Gudi Padwa, Ugadi, Vat Savitri/Purnima, Anant Chaturdashi, Kartika Purnima, Tulasi Vivah, Pongal, Pitru Paksha bookends. 38/38 content-dates anchors green; build green. |
| CLAUDE-P1-VRATVIDHI-VERIFY | RESERVED | Claude Code | `main` | see `plans/claude-task-p1-vratvidhi-verify.md` | Verify wired vidhis + owner queue + UI smoke | 15 observances already in `vrat-vidhis.ts`. Parallel OK with Codex content. |
| CODEX-NEXT | OPEN | Codex | `main` | see notes | Chart panel peels OR assist content batch 2 | Deploy MERGED (ganak.pages.dev). |

## Ten-lane target ownership| CHIP-B-I18N | MERGED | Claude Code | `main` | `src/i18n.ts`, `src/screens/MuhuratHub.tsx` | E-0.7 muhurat window labels bilingual | **Root cause was `tr()` itself** — it tested `L["hi"]` (a top-level key that never exists) so every `tr()` string was English-only in Hindi mode; all 38 dictionary entries already had Hindi that was unreachable. One-line fix + 6 new keys + 11 hardcoded call sites converted. Gates green; browser: Devanagari runs 248 → 290, all 6 window labels translate, English unchanged, 0 console errors. |
| CHIP-C-FACTORS | MERGED | Claude Code | `main` | `src/engine/muhurat.ts` | Muhurat "why this day" factors bilingual (signoff §4) | §4 factor table was **already implemented** as {en,hi} pairs; the real gap was in §5 skip-reasons, where three `hi:` strings were built from English tables. Fixed `nakName`→`NAK_HI` and `WN_SHORT`→`WN_HI` (×2). Browser: "Shravana नक्षत्र (अनुपयुक्त)" → "श्रवण नक्षत्र (अनुपयुक्त)"; gates green, 0 errors. **Left open:** `info.lmonthName` still English inside Chaturmas/month blockers — needs a new Hindi lunar-month table; not invented. |
| CHIP-D-PRASHNA | MERGED (no-op) | Claude Code | `main` | `src/screens/PrashnaScreen.tsx` (read-only) | Prashna messaging leftovers (audit #7, #8, #13) | **All three were already closed** in the earlier Tier 1–3 passes; verified live rather than trusted from docs. #7 error handler logs to console and shows a plain bilingual retry line; #8 switching category clears the stale verdict (confirmed in browser: page returns to pre-ask state); #13 all five table headers bilingual (ग्रह/राशि/नक्षत्र/तारा-उप/भाव) with the persistent Rx legend. Parity EXACT, calc 24/24, parse clean, 0 console errors. No code change.
| CHIP-E-AIPATH | MERGED (no-op) | Claude Code | `main` | none (verification only) | Remove dead `parseMuhuratQuery` Anthropic fetch | **Already removed**; the pointer comment the brief asks for is already at `kundli-app.tsx:620` referencing the Phase-4 backend proxy. Verified by evidence not grep alone: browser network log shows only localhost + `data:` URIs, and `grep -ri anthropic dist/` returns 0 files after a production build. Only external host in the bundle is the user-initiated open-meteo geocoder (plus a Google Fonts stylesheet — flagged for the launch privacy note).
| CHIP-A-SLIVERS | MERGED | Claude Code | `main` | `src/engine/panchaka.ts` | Zero-length panchaka windows in the muhurat finder | Cause: two panchaka boundaries can land inside one 60s scan step, so the bisection emits a sub-minute sliver that formats to the same minute ("अग्नि 9:31 PM–9:31 PM"). Added `collapseSlivers` — absorbs <60s windows into a neighbour (no gaps), then re-merges same-value neighbours; applied to both panchakaWindows and lagnaSchedule. Remainder maths untouched. **Guard proven:** 120-day Delhi scan showed 4 sub-minute / 3 same-minute rows before, 0 / 0 after, 0 coverage gaps both ways. Gates green; browser confirms the exact reported row is gone. |
| CHIP-F-PERF | MERGED (docs) | Claude Code | `main` | `plans/perf-startup-scan.md` (new) | Profile the startup panchang scan, propose cheap wins | Measured, not estimated. **MuhuratHub scans 400 days synchronously in a useMemo on the default screen — 16.6s of frozen main thread**, returning 16 fasts / 46 festivals. Cost is linear at ~40–48 ms/scanned day (42d = 2.0s, 120d = 5.9s, 240d = 9.6s, 400d = 16.6s). Hot primitives: `lunarMonthInfo` 7.97ms (constant across ~30 days), `solveCross` 1.08ms, `sunSidMs` 0.478ms (7.7× `moonSidMs` — inverted, worth investigating). Five ranked proposals; **no behaviour change shipped**, per brief. |
| INCIDENT-02 | NOTED | Claude Code | `main` @ `7adcda6` | — | Claude's Chip A commit swept two of Codex's in-progress Chart-wire files (`src/kundli-app.tsx`, `src/screens/RectifyScreen.tsx`) | I used a targeted `git add` (only `panchaka.ts` + task-log), so those files must have been left **staged** by Codex; `git commit` takes the whole index, not just what you just added. **Verified not harmful:** built HEAD in an isolated worktree — build passes, parse-check clean on the shell, parity EXACT, muhurat-anchors + content-dates pass. History left alone (rewriting risks destroying Codex's WIP; Codex still has further uncommitted changes on top). **Lesson: targeted `git add` is not enough — check `git status` for a foreign staged index before committing while another agent is active.** |
| CLAUDE-LEGAL-01 | MERGED (docs) | Claude Code | `main` | `plans/legal-privacy-terms-draft.md` (new) | Phase-1 privacy + terms draft | Docs-only, zero shell dependency. Facts verified against code, not assumed. **Found 3 accuracy problems that would make a published policy false:** (1) the app footer says "nothing is stored or sent anywhere" but city search hits open-meteo and every load fetches Google Fonts; (2) Google Fonts `@import` leaks visitor IP to Google — recommend self-hosting; (3) `server/api/explain` forwards prompts to Anthropic but is **not wired** to the client (grep + clean production build confirm), so the policy must be updated *before* it is switched on. Footer fix left undone deliberately — shell is Cursor's during ChartScreen. |
| CLAUDE-SERVER-01 | MERGED | Claude Code | `main` | `server/**` only | Harden the backend proxy | Codex's base was already solid (CORS allowlist, rate limit, body caps, safe errors, injection-aware context wrapper), so this adds the genuine gaps: `GET /health`, graceful SIGTERM/SIGINT shutdown, security headers, `Retry-After` on 429, configurable `HOST` bind + friendly bind-failure errors, optional constant-time `API_SHARED_SECRET`, current model default, and `npm run smoke` (14 guard checks, needs no API key). **Key point documented: CORS is not a spend control** — no-Origin requests must be allowed (same-origin deploys send none), so the shared secret is the real lever. ⚠️ **Smoke suite is UNRUN** — this sandbox forbids binding any listening socket, even loopback. Syntax-checked, imports resolve, module executes to the bind. Owner must run `npm run smoke`. |
| CLAUDE-PLACES-01 | MERGED | Claude Code | `main` | `src/data/places.ts` only | Expand offline gazetteer for the diaspora | 222 → **319 cities** (+97): UK incl. Southall/Wembley/Harrow, 32 US hubs, 11 Canadian, Indo-Caribbean (Trinidad/Guyana/Suriname/Jamaica), East+Southern Africa, Gulf, SE Asia, Oceania, subcontinent. 19 IANA zones **appended, never reordered**, so existing indices stay valid. **Found + fixed 3 pre-existing zone bugs** via a longitude-vs-zone checker: Port Louis→America/Bogota and Suva→Indian/Mauritius (off-by-one), Brisbane→Australia/Sydney (DST mismatch — wrong by 1h all summer). All 319 rows now within 3h of solar time and every zone valid per Intl. Gates + build green; live UI suggests "Brampton, Canada" offline. |
| PARALLEL-LANES-01 | MERGED | Claude Code | `main` @ `11d339e` | `plans/module-ownership-map.md`, `plans/parallel-agent-brief.md`, `plans/backlog.md`, `plans/task-log.md` | Turn ten-lane brief into a live ownership board | Docs-only on GitHub as `11d339e`. Stale `src/PrashnaScreen.jsx` removed in follow-up `73c08dd`. |
| SPLIT-UI-MATCH-01 | MERGED | Cursor | `main` | `src/engine/matching.ts`, `src/screens/MatchingScreen.tsx`, `src/kundli-app.tsx` | Extract + wire Kundali Matching | Gates green after wire; MatchMaker via prop-injected computeKundli. |
| SPLIT-UI-CHART-01a | MERGED | Cursor | `main` | `src/components/DiamondChart.tsx`, `src/kundli-app.tsx` | Extract + wire North Indian DiamondChart | Gates green; shell uses imported component. |
| SPLIT-UI-JYOTISH-01a | MERGED | Cursor | `main` @ follow-up | `src/engine/bhrigu.ts`, `src/engine/gochar.ts` | Extract BNN+BCP/BSP calc + gochar helpers for bnnTiming | Modules on GitHub; parse-clean after gochar import fix. |
| SPLIT-UI-JYOTISH-01b | MERGED | Cursor | `main` (modules only) | `src/engine/classical.ts` | Extract Ashtakavarga/Arudhas/Yogas calc | Module on GitHub; shell wire still pending. |
| SPLIT-UI-JYOTISH-01c | MERGED | Cursor | `main` (modules only) | `src/engine/shadbala.ts`, `src/engine/varga.ts` | Extract Shadbala calc + shared `vargaSign` helper | Modules on GitHub; shell wire still pending. Claude owns shell (Daily). |
| SPLIT-UI-JYOTISH-01d | MERGED | Cursor | `main` (modules only) | `src/engine/dasha.ts` | Vimshottari + KP sub-lord/significators + rectification helpers | Own VIM_LORDS (no fight with Claude's panchang WIP). Wire deferred. |
| SPLIT-UI-JYOTISH-01e | MERGED | Cursor | `main` (modules only) | `src/engine/special-points.ts` | Special lagnas / points / upagrahas | Wire deferred. |
| SPLIT-UI-JYOTISH-01f | MERGED | Cursor | `main` (modules only) | `src/engine/bhava.ts` | Bhava Chalit + Bhava Bala | Wire deferred. |
| SPLIT-UI-CHART-01b | MERGED | Cursor | `main` (modules only) | `src/engine/houses.ts` | Placidus cusps | Wire deferred. |
| SPLIT-UI-CHART-01c | MERGED | Cursor | `main` (modules only) | `src/data/chart-divisions.ts` | VARGAS + SPECIAL_CHARTS catalogs | Wire deferred. |
| SPLIT-UI-CHART-02 | MERGED | Cursor | `main` (modules only) | `src/engine/kundli.ts` | `computeKundli` birth-chart engine | Smoke OK (Delhi sample). Shell wire still pending — Daily owns shell. |

| SPLIT-UI-JYOTISH-02 | MERGED | Cursor | `main` (modules only) | `src/screens/JyotishBnnScreen.tsx`, `src/components/format.ts` (fmtDateT), `src/data/chart-divisions.ts` (SIGN_SHORT) | BNN + Bhrigu UI modules | Wire deferred. |
| SPLIT-UI-JYOTISH-03 | MERGED | Cursor | `main` (modules only) | `src/screens/RectifyScreen.tsx` | Birth-time rectification UI | Wire deferred. |

| SPLIT-UI-CHART-03 | MERGED | Cursor | `main` (modules only) | `src/components/DashaTree.tsx`, `src/engine/dasha.ts` (DASHA_LEVELS) | Dasha tree UI | Wire deferred. |
| SPLIT-UI-CONTENT-01 | MERGED | Cursor | `main` (modules only) | `src/components/VratVidhiCard.tsx` | Vrat vidhi card UI | Wire deferred. |

| SPLIT-UI-CHART-04 | MERGED | Cursor | `main` (modules only) | `src/components/ChartVault.tsx` | Vault/export/share UI | Wire deferred. |
| SPLIT-UI-CHART-05 | MERGED | Cursor | `main` (modules only) | `src/engine/transit-copy.ts` | Transit duration + event gloss | Wire deferred. |

| SPLIT-UI-03d | MERGED | Cursor | `main` (modules only) | `src/engine/today-panchang.ts` | computeTodayPanchang engine | Smoke Delhi 2026-07-19 OK. Wire deferred. |
| SPLIT-UI-03e | MERGED | Cursor | `main` (modules only) | `src/engine/search-upcoming.ts` | Upcoming observances search | Wire deferred. |
| SPLIT-UI-03f | MERGED | Cursor | `main` (modules only) | `src/screens/CalendarPage.tsx` | Calendar page UI | Wire deferred — helps Daily. |

| SPLIT-UI-03g | MERGED | Cursor | `main` (modules only) | `src/screens/MuhuratHub.tsx`, `src/data/muhurat-ui.ts`, `src/components/url-prefs.ts` | Muhurat hub UI + catalogs + URL prefs | Parse-clean; wire deferred. Also cleaned accidental scrape pollution in shadbala/search-upcoming. |

| DAILY-HANDOFF-01 | MERGED | Cursor | `main` | `plans/cursor-handoff-daily-ready.md`, `plans/module-ownership-map.md` | Inventory of peeled Daily modules for Claude wire | Docs only. |

## Ten-lane target ownership

**→ Live board with file-existence detail: [`plans/module-ownership-map.md`](module-ownership-map.md)**

These lanes become simultaneously assignable as their files are extracted. A lane
must replace `TBD` with real branch/worktree and exact files before work starts.
**Reality check (2026-07-19): ~4 code lanes are actually open** (Prashna, Validation,
Backend, Content-data) plus unlimited `plans/` research lanes — the rest await UI
extraction. Daily is the highest-leverage next slice; it gates three lanes.

| Lane | Scope | Intended module ownership | Current state |
|---|---|---|---|
| 1 | Daily/Panchang | `src/screens/DailyScreen.tsx`, daily-only components | Waiting — **next slice (SPLIT-UI-03), gates lanes 1/7 and 2/3 UI** |
| 2 | Festivals/Vrats | UI `src/features/festivals/*` TBD; data `src/data/festival-meta.ts` + `src/data/vrat-vidhis.ts` exist | **Partial — data files reservable now** (P1-CONTENT work) |
| 3 | Muhurat | UI `src/features/muhurat/*` TBD; engine `src/engine/muhurat.ts` exists | Partial — engine reservable for fixes |
| 4 | Chart | `src/screens/ChartScreen.tsx`, chart-only components | Waiting for extraction |
| 5 | Matching | `src/features/matching/*` | Waiting for extraction |
| 6 | Prashna | `src/screens/PrashnaScreen.tsx` | Extracted; MERGED on `main` @ `a21260d` |
| 7 | Hora/Gochar | `src/features/hora/*`, `src/features/gochar/*` | Waiting for extraction |
| 8 | Jyotish tools | `src/features/jyotish-tools/*` | Waiting for extraction |
| 9 | Validation | `validation/*` with task-specific reservation | Available for non-overlapping gates |
| 10 | Backend/deployment | `server/*`, hosting/monitoring config | Available now |

## Integration-owned files

- `src/kundli-app.tsx`
- shared navigation and app-level state
- shared design tokens/theme
- `AGENTS.md`, `.cursorrules`, `plans/backlog.md`, this task log

Agents may read these files. They may edit them only when the log explicitly assigns
integration ownership for that task.
