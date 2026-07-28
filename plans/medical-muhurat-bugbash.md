# Handover — Medical Muhurat: independent bug bash → 100% (for Codex)

**Task:** `MEDICAL-MUHURAT-BUGBASH-02` (RESERVED in `plans/task-log.md`)
**You are:** Codex — a *different* agent than the builder (Claude Code). That
independence is the point; do a genuine adversarial second pass, don't just re-run the
builder's own checks.
**Owner instruction (2026-07-25):** take this feature to **100% complete** — bug bash,
fix what you find, verify live, and close it out.

---

## 0. Pre-flight (mandatory, per AGENTS.md / CLAUDE.md)
1. Read `plans/task-log.md` (esp. rows `CLAUDE-P0-MEDICAL-MUHURAT` and this
   `MEDICAL-MUHURAT-BUGBASH-02`) and `plans/module-ownership-map.md`. Report which case
   applies (In progress / Unassigned / Stopped midway) before editing code.
2. `git fetch` and confirm you're on the current `origin/main` — the feature is already
   merged and pushed. **Do not trust a stale base.**
3. Node/npm are at `/opt/homebrew/bin` (not on PATH): prefix shell with
   `export PATH="/opt/homebrew/bin:$PATH"`.
4. The sandbox cannot bind listening sockets — run the dev server via the Browser pane
   (`preview_start`), never a raw shell. Launch config `kundli-dev` (root, port 5173)
   serves `main`, which has this feature.

## 1. Current state
- **Live:** https://ganak.pages.dev/muhurat/medical (auto-deployed from `main`).
- **Git:** `origin/main` @ `2a00313` (feature `a0ba550`, fixes `a520984`→`3c18212`).
- A merged worktree/branch `claude/medical-muhurat` still exists (gitignored) — ignore
  it; the owner may delete it.
- **Sourcing/decisions:** `plans/claude-medical-muhurat-findings.md` (10-rule table with
  confidence tiers; the owner's Option-C and R10 decisions; §6 deferrals).

## 2. What the feature is (and its files)
A dedicated, deliberately conservative timing tool for a **planned, clinician-approved**
procedure. It is NOT the benefic `muhurat.ts` finder and must never be merged into it
(surgery is a *krura/tikshna* act whose electional logic inverts the benefic rules).

| File | Role |
|---|---|
| `src/engine/medical-muhurat.ts` | Engine: `medicalMuhuratScan/Day/Clean`, `natalMoonSign`. Avoids Purnima+Amavasya (syzygy → also covers eclipses). Optional natal Janma Rashi overlay. Untyped, JS-style (matches sibling engines; keeps parse-check clean). |
| `src/data/medical-muhurat-ui.ts` | All EN/HI copy: safety wall, intro, confirm, tradition note, exclusion/label/result copy, natal copy. |
| `src/screens/MedicalMuhuratScreen.tsx` | UI: safety wall first, date range + place, mandatory confirmation checkbox, optional "Personalise" (natal) section, results. |
| `src/kundli-app.tsx` | Additive route wiring: `medicalMuhuratFromPath` → renders at `/muhurat/medical`. |
| `validation/medical-muhurat.cjs` | The gate. |

## 3. How to run
```bash
export PATH="/opt/homebrew/bin:$PATH"
node validation/medical-muhurat.cjs        # the feature gate
node validation/parse-check.js src/screens/MedicalMuhuratScreen.tsx
npm run build                              # authoritative compile gate
```
Full canonical sweep baseline: **31 pass / 5 fail**, and the **5 failures are
pre-existing on base `main`** (festival-hero-relevance, festival-row-29,
devotional-guide-quality, eclipse-sutak-pages, regional-calendar-modes) — unrelated to
this feature. Confirm they fail identically on a clean checkout before blaming this work.

## 4. Already verified by the builder — go BEYOND this, don't just repeat it
- Engine: Purnima/Amavasya set-aside correct across ranges (Drik-anchored ±1 day:
  Purnima 2026-02-01/03-03, Amavasya 2026-01-18/02-17); Abhijit void on Wednesday; Rahu
  Kaal weekday pattern; single-day range; determinism.
- Natal: 2026-02-01 Mumbai birth → Cancer; Janma Rashi days set aside; `medicalMuhuratClean`
  drops janma days.
- UI (EN+HI, 375px): safety-wall-first, confirmation gates finder, no console errors, no
  horizontal overflow, Hindi 24h time + Devanagari.
- Bug-bash fixes already landed: **F1** stale results clear on input change; **F2**
  results hide when the confirmation is unchecked; **F3** hint when a birth date is set
  but the city isn't picked.

## 5. Attack surface (prioritise the angles NOT yet covered)
1. **Timezone / DST places** — pick London, New York, Sydney (DST) and Reykjavik/Anchorage.
   Are Abhijit and Rahu Kaal times correct across a DST transition? Does `zoneOffset`
   fallback (`?? 5.5`) ever mislabel a valid place?
2. **High latitude / no sunrise** — polar city in summer/winter: `sunEvents` returns null
   → those days are skipped. Confirm the day list handles gaps gracefully and the
   "no window" copy isn't misleading; check nothing throws.
3. **Range edges** — from==to, from>to, the 92-day cap boundary, ranges spanning a
   year boundary, typo'd years.
4. **Natal edges** — birth exactly on a sign cusp; birth at high latitude; birth date in
   the future (input has `max=today` — can it be bypassed?); switching language while a
   natal result is shown (does the birth-sign label localise?).
5. **Safety framing (highest value)** — can any result render before the safety wall?
   Can the finder run without the confirmation? Does any copy (EN or HI) imply improved
   surgical success/safety/outcome, a "safe surgery" badge, or medical clearance?
6. **EN/HI at 320px** — no overflow; Hindi copy accuracy (a native-reader check on the
   safety wall, tradition note, and natal hint).
7. **Content accuracy** — spot-check Abhijit and Rahu Kaal times for a fixed city/date
   against Drik Panchang (`*.drikpanchang.com` is reachable).
8. **Accessibility** — checkbox/label association, focus order, the `<details>` sections,
   `role="alert"`/`role="note"` usage.
9. **F1–F3 regression** — confirm the three fixes still hold (change inputs → result
   clears; uncheck confirmation → result hides; birth-date-without-picked-city → hint).

## 6. Intentional design — DO NOT file these as bugs
- Only Purnima + Amavasya are avoided (owner-approved **Option C**, conservative). The
  krura-karma "sharp nakshatra / Rikta tithi" factors are **surfaced read-only** in the
  tradition note and deliberately **not** used to prescribe dates.
- **R9 (body-part Moon / zodiacal-man rule) is intentionally omitted** (heterodox origin,
  and it would require a "what surgery?" input we deliberately avoid).
- Natal (R10) is **optional/opt-in** and never mixed into the base finder; no birth chart
  is required for the base finder.
- "Available" is a cultural timing preference, not an endorsement — that's the intended framing.

## 7. Guardrails you must never weaken
Safety wall renders first; the confirmation checkbox gates the finder; **no**
medical-outcome/success/"safe surgery" claim anywhere; no browser storage (URL prefs
only); no birth chart required in the base finder; keep the engine dedicated (never fold
into `muhurat.ts`); the gate's `outcomeClaim` regex and syzygy/tithi invariants must stay.

## 8. If you find defects (fix policy for 100% closure)
Owner has authorised you to **fix**, not just report:
- Work in an **isolated worktree/branch** (`git worktree add`); don't build on a dirty `main`.
- **TDD**: extend `validation/medical-muhurat.cjs` (or add a gate) first — RED → GREEN;
  prove the guard. Don't weaken existing gates.
- Re-run: medical gate, parse-check (exit 0), `npm run build`, and the muhurat-family
  gates; confirm the 5 pre-existing failures are unchanged.
- Browser-verify EN + HI at 320–390px, 0 console errors.
- Keep commits to your own files; another session has an **uncommitted** "BUG — calendar
  rows" note in `plans/backlog.md` — **do not sweep it into your commit** (stage only your
  hunks).
- Commit message co-author line and PR body footer per repo convention.

## 9. Definition of done (100%)
- [ ] Independent bug bash complete; findings recorded (severity + repro) in this file (§ Findings).
- [ ] Any P0/P1 (and reasonable P2) fixed, TDD-covered, re-verified.
- [ ] Medical gate + parse-check + `npm run build` green; 5 pre-existing failures unchanged.
- [ ] **Live** `ganak.pages.dev/muhurat/medical` verified EN + HI on a phone width (after
      any fix is merged + deployed).
- [ ] `plans/task-log.md`: `CLAUDE-P0-MEDICAL-MUHURAT` → MERGED/100%; this row → MERGED;
      `plans/backlog.md` medical follow-up item checked.
- [ ] Owner given a short closeout (what you attacked, what you found/fixed, live evidence).

## 10. Handback
Do not mark 100% on drafted-but-unverified work. If a defect needs an owner decision
(e.g., a safety-framing judgement call), stop and surface it with the exact repro rather
than guessing.

---
### Findings (Codex to fill in)
_(append F1…/severity/repro/fix here)_
