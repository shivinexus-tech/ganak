# Cursor task — Wire vrat vidhis into a verdict-first expandable UI

Hand this to Cursor. Read `.cursorrules` and `AGENTS.md` first. This is a real
feature build in `src/kundli-app.tsx`.

## Coordination (READ FIRST)
- **You (Cursor) are the SOLE writer on `src/kundli-app.tsx` for this task.** No
  other agent will edit it while you work. Do not run parallel agents on it.
- **Do NOT commit.** Leave your changes uncommitted in the working tree. The
  owner's Claude Code session reviews, runs the gates, and commits. This keeps one
  committer and avoids branch tangles.
- When done, run the gates (below), paste the passing output, and tell the owner
  it's ready for review.

## What to build
The sourced, bilingual vrat-vidhi content already exists in `plans/vrat-vidhis.md`
(researched, not yet in the UI). Wire it into the app so that when a user views a
fast in the Daily / Fasts-&-Festivals area, they can see how to observe it.

**Scope for THIS task: only three observances — Ekadashi, Pradosh, Sankashti.**
Build them as ONE reusable card component so the remaining ~12 can be added later
by just supplying data. Do not wire all 15 yet.

## UI pattern (follow the app's existing conventions)
- **Answer-before-data (verdict-first):** show a short plain-language summary line
  first (e.g. "Fast from grains today; break it tomorrow morning after sunrise"),
  then an **expandable** section revealing the detail: Vidhi, Diet rules, Sankalpa,
  Puja steps, Paran (fast-breaking window), Udyapan.
- **Bilingual** (English + Hindi) following the app's `lang` toggle — every label
  and body string needs both. Match how existing components read `lang`.
- **Reuse the design system:** use the `T` design tokens (control height 42, radius
  `T.rMd`), the app's color palette (`C`), the `SecHead`/card patterns already in
  the file. Do not invent new colors, spacings, or font sizes — match neighbours.
- Collapsed by default; expands on tap. No layout overflow at 390px phone width.

## Hard rules
- No `localStorage` / `sessionStorage`.
- Religious content: use ONLY what's in `plans/vrat-vidhis.md` (it's sourced). Do
  not invent or paraphrase-in new ritual instructions.
- Complete, not partial — if you can't finish all three cleanly, do fewer fully.

## Gates — run after your edit, paste the output
```
export PATH="/opt/homebrew/bin:$PATH"
node validation/parse-check.js src/kundli-app.tsx    # must be clean (syntax/orphans/storage)
node validation/prashna-parity.js src/kundli-app.tsx # must stay EXACT
node validation/prashna-calc.js                      # 24/24
node validation/muhurat-anchors.cjs                  # must pass
node validation/content-dates.cjs                    # 17/17 day-part + 7/7 solar
```
Also start the dev server (`npm run dev`) and confirm the card expands/collapses and
renders in both languages with no console errors.

## Definition of done
Three vidhi cards (Ekadashi, Pradosh, Sankashti), verdict-first + expandable,
bilingual, reusing the design system, all gates green, no console errors, left
uncommitted for owner review.
