# Claude task — P1-VRATVIDHI verify + extend

**ID:** `CLAUDE-P1-VRATVIDHI-VERIFY`  
**Agent:** Claude Code  
**Status:** RESERVED — ready to start  
**Owner assigned:** 2026-07-20

Read `AGENTS.md` and `.cursorrules`. Log RESERVED → ACTIVE → MERGED in
`plans/task-log.md` before editing.

---

## Goal

The **core vrat vidhi library is already wired** — `src/data/vrat-vidhis.ts` contains
15 sourced observances matching `plans/vrat-vidhis.md` (Ekadashi through Chhath).
This task is **not** greenfield authoring. It is:

1. **Owner verification queue** — turn `plans/vrat-vidhis.md` §Pre-publish into a
   pass/fail checklist the owner can sign off.
2. **UI smoke** — confirm `VratVidhiCard` expands for each wired kind in both
   languages on ganak.pages.dev (or local build).
3. **Extend** — when Codex adds festivals in `CODEX-P1-CONTENT-02`, add matching
   vidhi stubs **only** where `plans/vrat-vidhis.md` already has sourced content;
   otherwise short gloss-only (no invented steps).
4. **Gap list** — document which of the ~15–20 “most observed” fasts still lack
   full vidhis after this pass.

---

## What's already done (do not redo)

| Module | Status |
|---|---|
| `src/data/vrat-vidhis.ts` | 15 keys: ekadashi, pradosh, sankashti, purnima, amavasya, masikShivaratri, mahaShivaratri, navratri, karvaChauth, ahoiAshtami, hartalikaTeej, sheetlaAshtami, ganeshChaturthi, janmashtami, chhath |
| `src/components/VratVidhiCard.tsx` | Wired via MuhuratHub |
| Safety preamble | `VRAT_VIDHI_SAFETY` bilingual block |

---

## Allowed files

- `src/data/vrat-vidhis.ts` (extend keys only from sourced doc)
- `src/components/VratVidhiCard.tsx` (bugfixes only — no restyle)
- `src/screens/MuhuratHub.tsx` (wire card to new kinds if needed)
- `plans/vrat-vidhis.md` (verification checkmarks, owner queue)
- `plans/claude-task-p1-vratvidhi-verify.md`, `plans/task-log.md`
- Optional: `plans/p1-vratvidhi-owner-queue.md` (new — owner-friendly sign-off table)

## Forbidden (unless owner reassigns)

- `src/engine/festivals.ts`, `src/data/festival-meta.ts` (Codex content batch)
- `src/kundli-app.tsx` (shell — only if tiny import fix; prefer not)
- Inventing mantra/sankalpa text not in `plans/vrat-vidhis.md`

---

## Work plan

### Step 1 — Verification doc (docs-only OK first)

Create `plans/p1-vratvidhi-owner-queue.md`:

| Observance | Wired in VRAT_VIDHI? | Card shows in UI? | Owner ✔ |
|---|---|---|---|
| Ekadashi | yes | smoke | |
| … | | | |

Pull copy from `plans/vrat-vidhis.md` confidence markers (🟢/🟡).

### Step 2 — Browser smoke (both languages)

On Daily → Fasts & festivals → expand each fast that has a vidhi:

- Hindi mode: Devanagari in verdict/vidhi/diet/sankalpa sections
- English mode: unchanged
- 0 console errors
- Paran line uses computed window where `timing: "parana"` etc.

Paste brief smoke notes in task-log.

### Step 3 — Extend for new festivals (after Codex merges batch 2)

When `chaitraNavratri`, `vatSavitri`, etc. land:

- If `vrat-vidhis.md` has a section → wire into `VRAT_VIDHI`
- If not → **do not invent**; add `// TODO: source vidhi` in meta only if Codex left a hook

### Step 4 — Chaitra vs Sharad Navratri

Current `navratri` key is one object. If product needs separate Chaitra/Sharad copy,
split into `chaitraNavratri` + `sharadNavratri` **only after owner confirms** —
`vrat-vidhis.md` already has §8A and §8B drafts.

---

## Gates (after any code change)

```bash
export PATH="/opt/homebrew/bin:$PATH"
node validation/parse-check.js src/data/vrat-vidhis.ts
node validation/parse-check.js src/screens/MuhuratHub.tsx
node validation/prashna-parity.js src/screens/PrashnaScreen.tsx
node validation/prashna-calc.js
node validation/muhurat-anchors.cjs
node validation/content-dates.cjs
npm run build
```

---

## Done when

- [ ] Owner queue doc exists with all 15 wired vidhis listed
- [ ] Browser smoke pasted (hi + en, ≥5 cards spot-checked)
- [ ] Gap list: which top fasts still need sourced vidhi research
- [ ] Task-log MERGED

## Parallelism

Runs parallel with Codex `CODEX-P1-CONTENT-02`. Coordinate: after Codex merges new
festival keys, Claude adds vidhis in a follow-up commit (no same-file edits).
