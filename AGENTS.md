# Ganak — Project Conventions (canonical, for ALL agents)

Product name: **Ganak** (गणक — Sanskrit for "one who calculates," a fitting name
for an astrology engine). Renamed from "Janma Kundli" on 2026-07-17; the working
directory and repo history still say "Kundli" in places — that's cosmetic, not a
second product.

A Vedic panchang + kundli app. The entire app is a single React file:
`src/kundli-app.tsx` (~6,000 lines). Benchmark: Drik Panchang. Goal: beat it.
Vite + React scaffold; `npm install` then `npm run dev` (Node 18+).

**Design principle: answer-before-data.** A plain-language verdict always renders
before the technical chart. Users are observant householders and curious diaspora,
not practising astrologers. Every jargon term gets a plain-English gloss.

**Owner's standing UX principles (2026-07-17):** plain-language messages that help
navigation; no state resets without a user action; the user must always be able to
tell what the app is doing. UI must follow the language toggle (hi/en) everywhere.

## Architecture invariants
- **Single file.** All components live in `src/kundli-app.tsx`. No new source files
  without explicit owner approval.
- **ONE WRITER AT A TIME on kundli-app.tsx.** Never run two agents/sessions that
  edit it concurrently — duplicate/orphaned code from parallel or incomplete edits
  is this project's recurring failure mode. Parallel work is fine for research,
  plans, validation scripts, and docs.
- **No orphans.** After replacing anything, grep the old name; zero orphaned
  references is the standard. Diagnose structurally, don't patch the surface.
- **No browser storage.** `localStorage` / `sessionStorage` are banned outright.
  Small UI prefs may use URL query params (see `urlPrefGet`/`urlPrefSet`).
- **Phone-first, no console.** Errors must surface visibly in the UI. Silent
  failure is unacceptable. Ship complete code, never partial.
- **Astronomy conventions: Lahiri ayanamsa, mean Rahu/Ketu** — matching Drik
  Panchang defaults. Never silently switch; it changes every chart in the app.

## Validation gates — run after EVERY structural edit, paste passing output
```bash
node validation/parse-check.js src/kundli-app.tsx    # syntax, duplicates, orphans, storage ban
node validation/prashna-parity.js src/kundli-app.tsx # inlined Prashna engine == validated engine
node validation/prashna-calc.js                      # 24 self-tests vs Drik anchors
node validation/muhurat-anchors.cjs                  # muhurat rules vs Drik 2026 published dates
```
Never claim work is done without pasting the passing output. Evidence before
assertions. If a gate fails, fix the cause — never weaken a gate to pass it
(whitelisting a genuine browser global in parse-check is the one allowed exception).

## Workflow
- Priorities live in `plans/backlog.md` — the owner maintains order there. Feature
  plans live in `plans/`. Work passes: research → UI (owner sign-off) → build →
  gates → browser/phone smoke test.
- The owner is non-technical: explain in plain language, one step at a time, and
  ask before anything irreversible or scope-changing.
- Complete fixes only. If a fix is partial, say so explicitly.

## Design system
- Control height 42px, corner radius 11px (tokens `T.ctrlH`, `T.rMd`).
- Bilingual section headers (Devanagari + uppercase English) — `SecHead` pattern.
- Summary-card-first layout, collapsible detail below.
- Palette: cream `#FAF5EA`, gold `#A86A12`, sindoor `#C2451E`, ink `#3B3147`,
  muted `#8C8173`, line `#E7DDC6`.
