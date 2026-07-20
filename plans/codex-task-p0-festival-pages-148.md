# Codex task — dedicated pages for 148 remaining openable labels

**ID:** `CODEX-P0-FESTIVAL-PAGES-148`
**Agent:** Codex
**Status:** MERGED — completed 2026-07-20
**Owner assigned:** 2026-07-20
**Parent backlog:** `P0-FESTIVAL-PAGES-ALL`
**Inventory:** `plans/festival-page-link-inventory.md`

Read `AGENTS.md` and `.cursorrules`. Log `RESERVED` → `ACTIVE` → `MERGED` in
`plans/task-log.md` before editing.

---

## Goal

Give **148 remaining openable labels** a stable, shareable dedicated-page URL
(`/festival/<slug>`), bilingual, refresh-safe, while **keeping** the existing Fasts
& Festivals inline click/expand behaviour unchanged.

This is **route + page coverage**, not inventing new ritual vidhis for every item.

---

## Counts (owner-confirmed 2026-07-20)

| Bucket | Count |
|--------|------:|
| Total openable labels today | 166 |
| Already have dedicated pages | 4 routes covering Hartalika, Chaitra Navratri, Sharad Navratri, Chhath |
| **Excluded this task — multi-day (separate later tasks)** | **15** |
| **In scope for this task** | **148** |

### Excluded from this task (do not invent page boundaries here)

| Family | Labels | Why deferred |
|--------|-------:|--------------|
| Chhath | 4 | Already has `/festival/chhath` |
| Bengal Durga Puja sequence (Mahalaya → Dashami) | 6 | Multi-day structure TBD |
| Skanda Sashti milestones (begins / Soorasamharam / Thirukalyanam) | 3 | Multi-day structure TBD |
| Ayyappa Mandala (begins + Mandala Pooja) | 2 | Multi-day structure TBD |

**Also out of scope (separate owner tracks):**

- Navadurga nine-day pages for Chaitra/Sharad (owner image/content requirement).
- Place-aware local timing on festival pages (`P0-FESTIVAL-PAGE-PLACE`) — leave the
  current “open Daily Panchang for local timing” note **or** a clear bilingual
  placeholder; do not block this 148-route task on place wiring.
- Inventing full `VRAT_VIDHI` steps for festivals that lack sourced vidhis.
- Eclipse sutak UI feature (grahan dates already fire as calendar keys).

---

## What “done” means for each of the 148

Every in-scope key from `FEST_NAME` / displayed `OBS_NAME` variants must have:

1. A **stable slug** → URL `/festival/<slug>` (trailing slash OK).
2. A **dedicated page** that loads on direct visit / refresh (SPA fallback already OK).
3. **Bilingual** title + body (EN + HI via existing lang toggle / `?lang=`).
4. Content level:
   - **If** a matching `VRAT_VIDHI` key exists → reuse `VratVidhiCard` fully expanded
     (same pattern as today’s four guides).
   - **Else** → render a **meta page** from `FEST_META` / `OBS_META` / `FEST_NAME` /
     `OBS_NAME`: name, deity, gloss, rules/timing when present. Plain-language;
     no invented mantras or step lists.
5. Existing list card click/expand **unchanged** (still collapses by default).
6. Language switch must **preserve** the festival route.

Named Ekadashi and weekday Pradosh labels **are in the 148** — each gets its own
URL (e.g. `/festival/mokshada-ekadashi`, `/festival/ravi-pradosh`). Recurring base
labels (`ekadashi`, `pradosh`, …) also get pages.

---

## Architecture (required — do not hand-copy 148 route objects)

Hand-maintaining 148 entries in `FESTIVAL_GUIDE_ROUTES` will drift. Prefer:

1. **Single registry** derived from live openable keys (`FEST_NAME` + `OBS_NAME`
   variants), with:
   - `key` (engine/meta key)
   - `slug` (kebab-case, stable)
   - optional `vidhiKey` when a guide exists
   - `excludeFromCoverage` flag **only** for the deferred multi-day families above
2. Extend `FestivalGuideScreen` to resolve any registry slug, not just four hard-coded
   routes.
3. Wire shell routing so unknown `/festival/*` still falls through cleanly; known
   slugs render the guide/meta page.
4. Optional: link from calendar/list rows to the dedicated URL later — **not required**
   for this task’s “done”; routes must work when typed/shared.

Slug rules:

- Deterministic from key: `hartalikaTeej` → `hartalika-teej`.
- No collisions; if two keys would collide, document and disambiguate once.
- Do not rename the four existing routes.

---

## Coverage gate (mandatory)

Add `validation/festival-page-coverage.cjs` (name flexible) that:

1. Loads the live openable registries (same sources the UI uses).
2. Loads the festival page route registry.
3. **Fails** if any **in-scope** openable key lacks a route.
4. **Fails** if a route points at a missing key / broken slug.
5. Treats the deferred multi-day families as an explicit allowlist (must still be
   listed so they are not forgotten — either covered by a shared parent route with
   documented section deep-links, or marked `deferred` with a comment pointing at the
   follow-up task).

Wire the gate into the release checklist used in `AGENTS.md` / `.cursorrules`
(append one line; do not remove existing gates).

Extend or replace `validation/festival-deeplinks.cjs` so the original four routes
still pass, plus a sample of new routes (named Ekadashi + one festival without vidhi).

---

## Allowed files

- `src/screens/FestivalGuideScreen.tsx` (registry + meta/vidhi page rendering)
- New small module under `src/data/` or `src/features/festivals/` for slug/registry
  generation if needed (pure data/helpers only)
- `src/kundli-app.tsx` — **minimal** route compose only (integration-owned; keep diff tiny)
- `src/components/VratVidhiCard.tsx` — only if needed for meta/vidhi shared chrome
- `validation/festival-deeplinks.cjs` and new coverage gate
- `AGENTS.md`, `.cursorrules` (gate list only)
- `plans/festival-page-link-inventory.md` (mark shipped / deferred)
- `plans/task-log.md`, `plans/backlog.md`, this brief

## Forbidden (unless owner reassigns)

- Inventing new religious steps / mantras / sankalpa not already in
  `src/data/vrat-vidhis.ts` or `plans/vrat-vidhis.md`
- Redesigning Daily / Muhurat UI
- Implementing `P0-FESTIVAL-PAGE-PLACE` place picker on every page (separate task)
- Building Navadurga 9×2 image pages
- Resolving Durga Puja / Skanda / Ayyappa multi-day URL structure in this PR
- Touching `server/**`

---

## Suggested ship slices (mergeable)

Ship in order; run gates after each slice.

| Slice | Scope | Approx. |
|-------|--------|--------:|
| A | Registry + slug helper + coverage gate skeleton; migrate existing 4 routes onto registry | infra |
| B | All remaining `FEST_NAME` keys **except** deferred multi-day exclusions | ~110 |
| C | Recurring `OBS_NAME` bases + 24 named Ekadashis + 7 weekday Pradosh | ~41 |
| D | Smoke: direct URLs EN+HI for 8 samples (4 with vidhi, 4 meta-only); docs sync | QA |

Exact counts may shift slightly if registries grow; **gate must match live keys**, not
this brief’s static 148.

---

## Validation (after structural edits)

```bash
export PATH="/opt/homebrew/bin:$PATH"
node validation/parse-check.js src/kundli-app.tsx
node validation/festival-deeplinks.cjs
node validation/festival-page-coverage.cjs   # new — must pass for in-scope 148
node validation/prashna-parity.js src/screens/PrashnaScreen.tsx
node validation/prashna-calc.js
node validation/muhurat-anchors.cjs
node validation/content-dates.cjs
node validation/panchaka-windows.cjs
npm run build
```

Browser smoke (minimum):

- Existing four URLs still open full guides.
- One new festival **with** vidhi (e.g. Karva Chauth if wired).
- One new festival **without** vidhi (meta page only).
- One named Ekadashi URL.
- Unknown `/festival/not-a-real-slug` does not crash; leaves normal app route.
- `?lang=hi` works on a new route.

Paste gate output in `plans/task-log.md` before marking MERGED.

---

## Follow-up tasks (not this brief)

1. `P0-FESTIVAL-PAGE-PLACE` — place + local timing on every dedicated page.
2. Multi-day families: Bengal Durga Puja, Skanda Sashti, Ayyappa Mandala (structure +
   section deep-links).
3. Navadurga day pages for Chaitra/Sharad (owner images + sourced copy).
4. Optional: calendar/list rows link out to `/festival/<slug>`.

---

## Handoff checklist

- [x] Coverage gate green for all in-scope keys
- [x] Four legacy routes unchanged
- [x] Deferred multi-day families explicitly allowlisted / documented
- [x] No invented ritual text
- [x] Inventory + backlog + task-log updated
- [x] Commit + push per standing policy when gates green
