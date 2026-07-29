# Audit A — CalendarPage + festival-pages registry (festival interaction dead-end bug bash)

Agent: Independent adversarial Audit A. Application source treated READ-ONLY (no src/ or validation/ edits).
Scope (non-overlapping): `src/screens/CalendarPage.tsx`, `src/data/festival-pages.ts`, registry coverage correctness.
Out of scope (Audit B owns): `src/screens/MuhuratHub.tsx` and the interaction gate design.
Date: 2026-07-28

## Verdict: PASS — no P0/P1/P2 defects found in scope. Two P3 latent-risk notes below.

Both canonical gates pass, my independent coverage proof passes, and live engine output
(full-year calendar + search across languages/places/queries) is fully covered with no
raw-key leak, no wrong-page routing, and safe URL encoding.

---

## Contract clause verdicts

| Clause | Verdict | Evidence |
|---|---|---|
| (a) Every festival/fast row opens `/festival/<slug>` via a real `<a href>` preserving lang + city | PASS | `CalendarPage.tsx:85-97` renders an `<a href={festHref(path)}>`; `festHref` (`:42-52`) always sets `lang`, and sets `city/lat/lon/zone` when `place.label` is present. |
| (b) Tithi-only rows must NOT route to a festival and stay non-interactive | PASS | `CalendarPage.tsx:62-70` returns a plain `<div>` (no href/onClick/tabIndex) for `it.kind === "tithi"`; `festivalPathForKey` is never called for tithi. |
| (c) Unmapped keys show a visible bilingual error, never a silent dead row | PASS | `CalendarPage.tsx:73-83` renders a bilingual fallback (`इस पर्व का पूरा पृष्ठ अभी उपलब्ध नहीं है` / `Full page for this entry isn't available yet`) when `path` is null. |

---

## Verification performed

### 1. Gate runs (both PASS)
- `node validation/festival-interaction.cjs` → `✓ ... 125 festival + 41 fast keys routed ... 6 failure fixtures caught` (exit 0)
- `node validation/festival-page-coverage.cjs` → `FESTIVAL PAGE COVERAGE PASSED` (exit 0)

### 2. Independent coverage proof (my own throwaway script, run then discarded to $TMPDIR)
Loaded `festival-meta.ts` + `festival-pages.ts` and asserted every key resolves:
- FEST_NAME keys: **125** — all resolve via `festivalPathForKey('festival', k)` to a path present in `FESTIVAL_PAGE_ROUTES`, all with `sourceKind === 'festival'` (0 missing, 0 unregistered, 0 cross-namespace).
- OBS_NAME keys: **41** — all resolve via `festivalPathForKey('fast', k)` to a registered route, all with `sourceKind === 'observance'` (0 missing, 0 unregistered, 0 cross-namespace).
- Registered routes: **181** (166 festival/obs + shared Chhath collapse + 18 Navadurga, minus Chhath dedupe).
- Namespace overlap FEST_NAME∩OBS_NAME keys: **0** → the `secondary` fallback in `festivalPathForKey` (`festival-pages.ts:200`) can never resolve a real key to the wrong namespace today.
- Edge calls: `festivalPathForKey('festival','')` → null; `festivalPathForKey('fast',null)` → null (guarded at `:196`).

### 3. Live engine-output coverage (the surface the gate does NOT directly check)
The interaction gate only asserts `FEST_NAME`/`OBS_NAME` keys → routes. It does not assert
that the keys the *engine emits* are members of those registries. I closed that gap empirically:
- Drove `scanPanchangCalendar(from, tz, 366, 366, place)` for 2026 (New Delhi): **125 festival + 36 fast** keys emitted. Every festival key is in `FEST_NAME` (no `trN` raw-key leak) and every festival+fast key resolves to a registered route.
- Drove `searchUpcoming` across 3 places (New Delhi, New York negative-offset zone, and a hostile label `"Kolkata & Co <b>\"onerror=x"`) × 13 queries (incl. empty, single-letter, and a no-match query). Kinds seen: `festival`, `fast`, `tithi`. Zero festival keys outside `FEST_NAME`, zero missing routes.

### 4. XSS / encoding of the query string
`festHref` builds the query via `URLSearchParams`, so a city label with special chars is
percent-encoded: for label `Kolkata & Co <b>"onerror=x` the href becomes
`...&city=Kolkata+%26+Co+%3Cb%3E%22onerror%3Dx&...` (`<`→`%3C`, `"`→`%22`, `&`→`%26`).
React additionally escapes the `href` attribute. No injection vector. PASS.

---

## Findings

No P0/P1/P2 defects. Two P3 latent-risk notes (not live bugs; nothing to fix for this P0):

### P3-A — `festivalPathForKey` secondary fallback can mask a future misclassification (design note)
`src/data/festival-pages.ts:195-201`. For `kind='fast'` the helper falls back to the
*festival* registry (and vice-versa). Today FEST_NAME∩OBS_NAME = ∅, so the fallback is
inert. But if a future observance key were dropped from the observance registry while a
same-named festival slug existed, a fast row would silently open the *festival* page — a
WRONG page (contract-(b)-adjacent) rather than the visible bilingual fallback. Currently
unreachable; flagged as a latent trap in the cross-namespace design. No action required now.

### P3-B — festival label uses `trN`, which returns the raw key on a miss; no gate guards engine-key ⊆ FEST_NAME
`CalendarPage.tsx:38` labels festival rows with `trN(lang, FEST_NAME, it.key)`, and
`src/i18n.ts:62` returns the raw `key` when the dict lacks it. Fast rows are safe
(`obsLabel` falls back to a generic bilingual `व्रत / पर्व` / `Observance`), but the
festival path is not. Today every engine-emitted festival key is in `FEST_NAME` (verified
in step 3), so no raw camelCase key can render. The residual risk is purely forward-looking:
if a new festival rule key is added to `src/engine/festivals.ts` without a matching
`FEST_NAME` entry, the calendar would display the raw key as the label (and, separately,
show the unmapped fallback div). The `festival-interaction.cjs` gate checks
`FEST_NAME → route` but not `engine-emitted-key ∈ FEST_NAME`, so it would not catch this.
Recommendation (optional, for the fix owner, not a P0): add a gate asserting the union of
`scanPanchangCalendar` + `searchUpcoming` festival keys is a subset of `FEST_NAME`.

---

## What I checked and found clean
- `festHref` preserves `lang` unconditionally and `city/lat/lon/zone` when a city is set (`:42-52`).
- Festival/fast rows are real `<a href>` anchors (native keyboard + focus + Back), not JS-only nav (`:85-97`); focus-visible style present (`:102`); visible `›` chevron affordance (`:95`).
- Tithi rows are inert plain divs and never call the router (`:62-70`).
- Unmapped festival/fast → visible bilingual fallback, never a dead div (`:73-83`).
- 125 festival + 41 observance registry keys all map to registered routes with correct `sourceKind`; 0 namespace overlap; empty/null keys guarded.
- Live full-year calendar + multi-place/multi-query search emit only covered keys; no raw-key leak; all three kinds exercised.
- Query-string encoding is XSS-safe via `URLSearchParams` + React attribute escaping.
- Throwaway audit scripts kept in `$TMPDIR` only; nothing written outside the repo except this report.
