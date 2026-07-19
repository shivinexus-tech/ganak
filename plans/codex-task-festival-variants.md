# Codex task — Festival tradition & regional variant policy (research/doc only)

Hand this to Codex. Read `.cursorrules` and `AGENTS.md` first.

## Coordination (READ FIRST — three agents are active)
- **Cursor is the SOLE writer on `src/kundli-app.tsx` right now** (building a UI
  feature). **You (Codex) MUST NOT touch `src/kundli-app.tsx`.** Editing it would
  collide with Cursor and create the exact duplicate/orphan failure this project
  guards against.
- **Your deliverable is ONE NEW FILE: `plans/festival-variants.md`.** Do not edit
  any existing source or other existing doc.
- **Do NOT commit.** Leave the new file uncommitted; the owner's Claude Code session
  reviews and commits. Tell the owner when it's ready.

## Task
Your own day-part audit (`plans/festival-daypart-audit.md`, §"Required product
corrections") flagged festivals that must NOT silently collapse tradition/regional
variants. Research and document the correct handling + sourced 2026 dates for each,
so they can later be wired as distinct events with a clear rule.

For each festival below, produce a row/section with: the variant name, the deciding
rule (kala + tradition), the **sourced** 2026 New Delhi (or anchor-place) date per
variant, source links (Drik + a second source or named text), and confidence 🟢/🟡.

1. **Ram Navami** — Smarta vs Vaishnava/ISKCON date split (Madhyahna rule).
2. **Krishna Janmashtami** — Smarta vs Vaishnava/ISKCON policy (Nishita + Rohini);
   note when they coincide vs differ.
3. **Maha Navami / Durga Puja** — general Vedic rule vs Bengal rule.
4. **Nag Panchami** — North-Indian Shravana Shukla vs Gujarat's Krishna-paksha
   Nag Pancham (separate event).
5. **Hanuman Jayanti** — the North-Indian Chaitra Purnima observance vs the Tamil/
   Telugu/Kannada regional dates (separate events, do not reuse one calc).
6. **Rath Yatra** — decide the product policy: does "Puri Rath Yatra" display Puri's
   fixed ceremonial date worldwide, or recompute per user city? Recommend + source.

## Rules
- **Hindu observances only** (Buddha Purnima excepted). Sourced, never invented —
  cite Drik + a second source or a named textual authority. Mark 🟡 where sources
  disagree; do not fabricate a "classical" citation to look complete.
- **Bilingual** names/glosses (English + Hindi) for each variant.
- This is research, not code. If a rule truly can't be sourced, say so plainly.

## Definition of done
`plans/festival-variants.md` with all six festivals' variants documented, sourced,
bilingual, confidence-marked, left uncommitted for owner review.
