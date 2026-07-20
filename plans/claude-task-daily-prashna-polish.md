# Claude task brief — Daily / Prashna / Muhurat polish + docs

Hand this whole file to Claude Code. Read `AGENTS.md` and `.cursorrules` first.
Log every chip in `plans/task-log.md` (RESERVED → ACTIVE → MERGED).

**You own polish on Daily, Prashna, Muhurat, and coordination docs.**  
**Codex owns:** (1) content data, (2) Chart/Jyotish shell wire, (3) hide Chart + deploy.  
**Cursor is idle** unless the owner reassigns.

Stay off `src/kundli-app.tsx` while Codex Track 2 (Chart wire) is ACTIVE. Prefer module files only.

---

## Housekeeping first (docs, ~15 min)

1. Mark `SPLIT-UI-03-WIRE` as **MERGED** in `plans/task-log.md` (wire landed in `3b3b6b2`).
2. Refresh stale lines in `plans/module-ownership-map.md` that still say Daily is “Waiting”
   (Daily is MERGED; lanes 1 and 7 are open).
3. Commit+push docs-only.

---

## Chip queue (small, tedious, high care — do in order)

Do one chip per commit when practical. Gates after any code change.

### Chip A — Zero-length panchaka windows
- **Bug:** Muhurat finder can show e.g. अग्नि 9:31 PM–9:31 PM.
- **Fix:** Filter or merge windows where `end <= start` (or duration &lt; 1 minute) before render.
- **Files:** `src/engine/panchaka.ts` and/or `src/screens/MuhuratHub.tsx`
- **Done:** Browser: finder top-day panchaka list has no zero-span rows; gates green.

### Chip B — E-0.7 Muhurat window labels bilingual
- **Backlog:** “Rahu Kalam” / “Abhijit Muhurat” etc. still English in Hindi mode.
- **Files:** `src/screens/MuhuratHub.tsx`, `src/i18n.ts` (add strings, don’t fork dicts)
- **Copy:** Match existing tone; bilingual en+hi.
- **Done:** Toggle hi — those labels translate; gates green.

### Chip C — Muhurat “why this day” factors bilingual
- **Source:** `plans/messaging-copy-signoff.md` §4 (approved table).
- **Files:** mostly `src/engine/muhurat.ts` (`dayScore` factors → `{en,hi}`), consumers in MuhuratHub.
- **Done:** Hindi mode shows Hindi factors; English unchanged; gates green.

### Chip D — Prashna messaging leftovers
- **Source:** Remaining open items in `plans/messaging-audit.md` /
  `plans/messaging-copy-signoff.md` that touch **Prashna only**.
- **Files:** `src/screens/PrashnaScreen.tsx` (+ `src/i18n.ts` if needed)
- **Forbidden:** Chart-screen bilingual (that’s Codex/Cursor Chart track).
- **Done:** Listed items closed; Prashna 24/24 + parity still EXACT; browser smoke chips.

### Chip E — Dead `parseMuhuratQuery` AI path
- Remove or hard-disable the unused Anthropic fetch (no key in web build).
- Leave a one-line comment pointing to Phase 4 backend proxy / `plans/backlog.md`.
- **Files:** wherever that path lives (likely MuhuratHub or nearby).
- **Done:** No network call to Anthropic from the client; gates green.

### Chip F (optional) — Startup scan note
- Profile / document the ~1.8s `scanPanchangCalendar` cost; propose a cheap win in
  `plans/` (do **not** ship a risky behaviour change without owner OK).
- **Files:** `plans/` + maybe a tiny safe cache later if owner approves.

---

## Allowed files (default)

| Area | Paths |
|---|---|
| Daily / Muhurat UI | `src/screens/MuhuratHub.tsx`, `src/screens/CalendarPage.tsx`, `src/components/VratVidhiCard.tsx` |
| Engines (polish only) | `src/engine/panchaka.ts`, `src/engine/muhurat.ts`, `src/engine/hora.ts` |
| Prashna | `src/screens/PrashnaScreen.tsx` |
| Shared i18n | `src/i18n.ts` (add keys; never duplicate `L`) |
| Docs | `plans/task-log.md`, `plans/module-ownership-map.md`, new short notes under `plans/` |

## Forbidden while Codex Chart wire (Track 2) is ACTIVE
- `src/kundli-app.tsx`
- Chart peel modules Codex is wiring (`kundli.ts`, `shadbala.ts`, BNN/Rectify screens, etc.)
- Content ownership: `src/data/festival-meta.ts`, `src/data/vrat-vidhis.ts` (Codex Track 1)

If you need a shared export, stop and ask the owner — don’t fight Codex on the same file.

---

## Gates (after every code chip)

```bash
export PATH="/opt/homebrew/bin:$PATH"
node validation/parse-check.js <files you touched>
node validation/prashna-parity.js src/screens/PrashnaScreen.tsx
node validation/prashna-calc.js
node validation/muhurat-anchors.cjs
node validation/content-dates.cjs
npm run build
```

Browser smoke the path you changed (Daily / finder / Prashna). Paste gate evidence; commit+push per owner standing policy; one-line status to owner.

---

## Done when
Chips A–E are MERGED (F optional), task-log updated, and you have not touched the shell during Codex’s Chart wire.
