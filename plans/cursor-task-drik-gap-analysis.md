# Cursor task — Drik coverage gap analysis (research only, NO code)

Read `.cursorrules` and `AGENTS.md`.

## Coordination — IMPORTANT
**Claude is refactoring ALL of `src/` right now (EPIC-SPLIT).** Do **NOT** touch
`src/`, `validation/`, or any code. This task is **pure research → one Markdown
doc**. That keeps you fully parallel with zero collision risk.

## Why this task
This is the single highest-value method in the content backlog (§C1): Ganak's
festival coverage is the Phase-1 launch gate, and the objective way to find what's
missing is to diff against the benchmark. Right now nobody knows the true size of
the gap.

## Deliverable: `plans/drik-gap-analysis.md`

For **calendar year 2026, New Delhi**, go month by month through Drik Panchang's
festival/vrat listings and compare against what Ganak already covers.

Ganak's current coverage (read these — do not modify):
- `plans/content-tier1.md`, `plans/content-tier2.md` — what's been wired
- `plans/festival-daypart-audit.md` — the 28 Tier-1 festivals with day-parts
- `plans/festival-variants.md` — tradition/regional variants

Produce a table:

| Month | Drik observance | In Ganak? | Tradition/region | Priority | Source |
|---|---|---|---|---|---|

- **In Ganak?** — ✅ present / ❌ missing / ⚠️ present but variant missing
- **Priority** — P1 (widely observed, householder-relevant), P2 (regional/nice), P3 (niche)
- **Source** — link the Drik page for each

Then summarize:
1. **Total gap count** by priority.
2. **The P1 misses** — the ones that would embarrass us at launch.
3. Any Ganak entry whose **date disagrees** with Drik (flag loudly — that's a bug).

## Hard rules
- **Hindu observances only** (Buddha Purnima excepted).
- Sourced — link Drik for every row. Mark 🟢 verified / 🟡 uncertain.
- Do not invent. If Drik is ambiguous, say so.
- **No code. No commits.** Leave the doc for Claude to review.
