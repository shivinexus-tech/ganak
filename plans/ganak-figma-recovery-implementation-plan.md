# Ganak Figma quality-enforcement recovery plan

**Approved by:** Shivie, 2026-08-20
**Implements:** `plans/audits/2026-08-20-figma-redesign-memory-quality-bottleneck-investigation.md`
**Current disposition:** Batch 01 is preserved but blocked from owner review during enforcement rollout.

## Primary persona and journey

**Primary persona:** P1, the household Panchang keeper. The recovery also protects practitioner depth, but P1 is the person most harmed when an English screen leaks Hindi, a primary action looks broken, or the Today answer feels visibly unfinished.

1. P1 opens Ganak Today in their chosen language.
2. They recognize one coherent Ganak website and understand the answer before technical data.
3. They change date/place or open Full Panchang without encountering broken controls or mixed language.
4. They continue to Festivals, Muhurat, or Prashna with consistent geometry and trustworthy visual roles.
5. Shivie reviews product direction only after internal QA has found and closed implementation-quality defects.

### Walk against current evidence

| Journey step | Status | Evidence |
|---|---|---|
| 1. Open Today in chosen language | **Broken in review evidence** | Owner reported Hindi leakage on English screens after Batch 01 dual PASS; current primary `769:17261`. |
| 2. Recognize a finished coherent site | **Broken** | Owner reported an empty/unbalanced Today panel, recurring rejected ornament, arbitrary ribbons, sparse/poor ornament composition, and careless blue use. |
| 3. Use context/actions confidently | **Broken** | Owner reported poor `Find best days` button geometry on Property Finder `769:19487`; earlier responsive QA found detached shared systems. |
| 4. Continue across families | **Unproven** | Batch 01 covers twelve desktop primaries, but responsive, dynamic, keyboard and assistive states remain separately gated. |
| 5. Owner receives direction-only review | **Broken** | Owner became the first effective whole-screen bug bash after promotion. |

## Existing inventory to preserve

- Figma file `ynavdn3IEdBoGsIP43c4bD` and Batch 01 section `769:17254`.
- Twelve current desktop primaries, canonical source candidates, shared responsive components, and all historical/rejected/archive frames.
- Complete ornament inventory `800:2`, owner-approved floral set `760:20`, structural border set `759:20`, and archive `778:2`.
- Canonical human records and prototype JSON. They remain evidence inputs; the new manifest does not delete them.
- Investigation commit `f73867b` and its evidence-separated incident analysis.

## Success in user steps

- P1 sees only the selected language on every visible part of a review screen.
- P1 can identify and use every primary control without cramped labels, edge collisions, clipping, or undersized targets.
- P1 sees a deliberately balanced Today answer area; removal of rejected art does not leave an accidental hole.
- P1 sees ornaments only where they clarify hierarchy or finish a section, with enough space and approved provenance.
- Shivie receives one coherent batch with zero known findings, not twelve screens requiring a manual bug bash.

## Ownership and dependencies

| Phase | Writer | Exact repository files / Figma nodes | Dependency |
|---|---|---|---|
| 0 | This task | this plan; own task-log row | Current main and Design Director status inspected; promotion frozen. |
| 1 | This task | new manifest + new schema only | Canonical records read-only; unresolved ambiguity remains a manifest conflict. |
| 2 | This task | new gate, known-incident fixtures, packet generator | Phase 1 schema and manifest. |
| 3 | This task | new review protocol and Batch 01 evidence packet | Phase 2 typed statuses and admission computation. |
| 4A audit | This task, read-only | Batch primaries `769:17261`, `769:17610`, `769:17962`, `769:18390`, `769:18558`, `769:18753`, `769:18984`, `769:19148`, `769:19326`, `769:19487`, `769:19662`, `769:19843`; sources/shared nodes named by lineage audit | Design Director acknowledges no mutation conflict. |
| 4B source correction | Design Director as sole Figma integrator, or an explicitly isolated node writer it assigns | Exact shared/source nodes from 4A; **never review clones first** | Mechanical findings accepted; exact node ownership recorded before mutation. |
| 4C regeneration | Design Director | Batch section descendants only after corrected sources pass | 4B source gates green. |
| 4D review | independent mechanical, accessibility, ornament/background and cold visual reviewers | read-only regenerated nodes and screenshots | Regeneration complete; no builder self-approval. |

## Promotion freeze

Until Phase 4D closes, Batch 01's operational status is `BLOCKED_FROM_OWNER_REVIEW`, regardless of historical Figma labels or task-log prose. Historical labels are preserved as evidence, not deleted or silently rewritten. Only the machine admission command may produce `FULL_SCREEN_PASS`, and only when every mandatory review category is present, every required screen is covered, conflicts are zero, and known findings are zero.

## Phase exit evidence

- Phase 1: schema-valid manifest; deterministic precedence; contradictions and unresolved conflicts demonstrated by failing fixtures.
- Phase 2: one read-only gate automatically included by `scripts/run-all-gates.sh`; mutation fixtures reproduce each named incident class.
- Phase 3: generated evidence packet and human protocol; narrow PASS cannot promote; admission command fails while Batch 01 findings remain open.
- Phase 4: source-before-clone lineage proof, regenerated screenshots, category matrix, cold review, zero findings or an honest blocked disposition.

No phase may claim the redesign solved merely because tooling exists.
