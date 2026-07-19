# Handoff — Cursor → Claude: remaining vrat vidhis

**From:** Cursor (this session)  
**To:** Claude Code (owner review + gates + commit)  
**Date:** 2026-07-18  
**Do not commit from Cursor** — leave for Claude (one committer).

---

## What this is

Continuation of the vrat-vidhi UI. The reusable card + first three entries
were already committed:

- `bd877df` — Content(cursor): vrat vidhi cards — Ekadashi/Pradosh/Sankashti

This handoff covers the **uncommitted** follow-on: fill out the rest of
`VRAT_VIDHI` from `plans/vrat-vidhis.md` and show cards on the Festivals tab too.

Task brief that was followed: `plans/cursor-task-vidhis-remaining.md`.

---

## Files touched

| Path | Change |
|------|--------|
| `src/kundli-app.tsx` only | **Modified, uncommitted** (~+356 lines) |

**Do not commit** the untracked `server/` folder — that is Codex’s separate
backend work, not part of this handoff.

---

## What was built

### Data — `VRAT_VIDHI` keys (15 total)

Already in prior commit: `ekadashi`, `pradosh`, `sankashti`

**Added in this uncommitted diff:**

| Key | Observance | Where it shows |
|-----|------------|----------------|
| `purnima` | Purnima / Satyanarayan | Fasts tab |
| `amavasya` | Amavasya | Fasts tab |
| `masikShivaratri` | Masik Shivaratri | Fasts tab |
| `mahaShivaratri` | Maha Shivaratri | Festivals tab |
| `navratri` | Navratri (Chaitra + Sharad shared copy) | Festivals tab |
| `karvaChauth` | Karva Chauth | Festivals tab |
| `ahoiAshtami` | Ahoi Ashtami | Festivals tab |
| `hartalikaTeej` | Hartalika Teej | Festivals tab |
| `sheetlaAshtami` | Sheetla Ashtami (Basoda) | Festivals tab |
| `ganeshChaturthi` | Ganesh Chaturthi | Festivals tab |
| `janmashtami` | Janmashtami | Festivals tab |
| `chhath` | Chhath (4-day sequence) | **Data only — see caveat** |

Each entry has bilingual `en`/`hi`: `verdict`, `vidhi[]`, `diet` (or
`dietAvoid`/`dietLighter`), `sankalpa`, `puja`, `paran`, `udyapan`.  
Content is **only** from `plans/vrat-vidhis.md` — not invented.

### UI wiring

- Reused existing `VratVidhiCard` (no restyle).
- Render condition changed from fasting-only to **both tabs**:

```tsx
{VRAT_VIDHI[kind] && <VratVidhiCard data={VRAT_VIDHI[kind]} lang={lang} C={C} />}
```

(`kind` is already `obsKind(it.key)` on Fasts, `it.key` on Festivals.)

### Caveat — Chhath

`chhath` is in `VRAT_VIDHI` with a `// TODO: source — Chhath is not yet a
calendar festival key…` comment. There is **no** `chhath` entry in
`FESTIVALS` / scanner, so the card cannot appear in the UI until a calendar
item is added. Data is ready for that later wiring.

---

## Gates Cursor already ran (all green)

```
export PATH="/opt/homebrew/bin:$PATH"
node validation/parse-check.js src/kundli-app.tsx
# ✓ parse-check clean (syntax, no duplicates, no orphans, no browser storage)

node validation/prashna-parity.js src/kundli-app.tsx
# ✓ parity EXACT

node validation/prashna-calc.js
# ALL TESTS PASSED (24 pass / 0 fail)

node validation/muhurat-anchors.cjs
# ✓ muhurat-anchors PASSED

node validation/content-dates.cjs
# ✓ 7/7 Tier-2 solar/nakshatra
# ✓ 17/17 festival day-part anchors
```

**Please re-run the same gates yourself before committing** (standing project rule).

---

## Smoke checks Cursor did

- Dev server: `http://localhost:5173/` (may still be running from earlier).
- **Purnima** (Fasts) — expand/collapse OK in EN and HI (`?lang=hi`).
- **Janmashtami** (Festivals) — expand/collapse OK in EN and HI.
- Verdict-first + bilingual sections present; no page JS errors observed on those paths.

Note: the list UI only shows the first ~10 upcoming items; farther festivals
(e.g. Karva Chauth in late Oct from a mid-July “today”) may need search or
scrolling the year view to manually spot-check.

---

## Suggested review checklist for Claude

1. Diff `src/kundli-app.tsx` only — ignore `server/`.
2. Spot-check 2–3 new entries against `plans/vrat-vidhis.md` (accuracy / no invention).
3. Confirm festival-tab cards appear (e.g. Janmashtami, Hartalika).
4. Re-run the five gates; paste output in the commit message / PR note.
5. Commit message suggestion (match repo style):

```
Content(cursor): remaining vrat vidhis in VRAT_VIDHI + show cards on Festivals tab

Extends sourced bilingual observance guidance beyond Ekadashi/Pradosh/Sankashti.
Chhath data included but not calendar-wired yet.
```

---

## Out of scope / not done

- No new calendar festival for Chhath.
- No Chaitra-specific Navratri key (shared `navratri` copy covers both per the research doc).
- No redesign of `VratVidhiCard`.
- No commit from Cursor.
