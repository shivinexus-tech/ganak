# Ganak full-screen quality review protocol

This protocol is mandatory before a Ganak Figma batch can be shown to the owner. A specialist `NARROW_PASS` is useful evidence but can never promote a screen or batch.

## Roles

| Role | Responsibility | Cannot do |
|---|---|---|
| Mechanical QA | Run decision, lineage, language, surface, geometry, provenance and overflow gates against every required node/state. | Judge beauty or issue `FULL_SCREEN_PASS`. |
| Accessibility QA | Contrast, visible focus intent, reading order, touch targets, reflow/zoom risk, non-colour semantics and comfort. | Treat screenshot-visible contrast as complete accessibility. |
| Ornament/background QA | Verify provenance, role, density, clear space, crop identity, surface semantics and rejected-pattern regression. | Approve a whole screen because ornaments alone pass. |
| Ornament Artist & Library Curator | Use atlas `723:14636` to propose a named-job library selection or explicit no-ornament decision. Keep `RESTRAINED`, `RICH` and Festival/Vrat/ceremonial-only `CELEBRATORY` identifiable; keep new source-derived work in multi-alternative `EXPLORATION`. | Use rejected `BALANCED`, revive rejected assets/crops, approve their own proposal, release a library item, or integrate a screen. |
| Blind visual QA | Review screenshots cold, without builder status claims; judge complete composition at natural and contact-sheet scale. | Edit the candidate or rely on builder explanations. |
| Visual Art release QA | Independently decide the exact current desktop node's background, every ornament, no-ornament alternative, composition balance and rejected resemblance from fresh natural-scale and batch-context evidence. Record a matching content fingerprint at the end of review. | Approve authored work, inherit a source/clone/older pass, leave a visual finding open, or retain PASS after any mutation/reclone. |
| Integrator | Aggregate every screen-level finding, verify source-first repair and regenerated lineage, and compute admission. | Self-certify missing reviewer categories or override an open finding. |

## Required evidence packet

The packet must list:

- exact Figma file, section, screen and source/shared-component node IDs;
- immutable natural-scale screenshot evidence for every primary and required state;
- one same-scale contact sheet for the complete batch;
- manifest version and decision IDs applied;
- mechanical evidence for visible text, surfaces, controls, ornaments, assets/crops and source lineage;
- all reviewer identities, scope, exact status and evidence;
- one exact `visualArtReviews` record per current desktop node, containing the natural-scale screenshot, batch-context screenshot, explicit background decision, complete ornament inventory with `KEEP`/`REMOVE`/`REPLACE`/`PROPOSE`, purpose/provenance/fit/clear-space/alignment/scale, explicit no-ornament comparison, balance/empty/dull/crowded assessment, rejected-resemblance evidence, zero unresolved findings, independent non-author reviewer, and matching before/after content fingerprint;
- one exact `ornamentCuratorReviews` record per current desktop node: atlas `723:14636`, independent curator identity, screen content fingerprint and post-review mutation status, `LIBRARY_ORNAMENT` or literal `NO_ORNAMENT`, named job, rationale, identifiable mode, permitted context, exact approved-library node/component provenance, placement, clear space, alignment and scale, explicit no-ornament comparison, composition-completeness rationale, independent Visual Art PASS and Director release. `BALANCED` is invalid; `CELEBRATORY` is limited to Festival/Vrat/ceremonial heroes. Any edit invalidates the record. Any new source-derived proposal remains `EXPLORATION` with at least two alternatives and `autoApproved=false` / `directorReleased=false`;
- every finding, including severity, screen, category, source-level cause, correction node and recheck;
- explicit limitations.

Generate the human checklist with:

```bash
node scripts/generate-figma-review-packet.mjs plans/figma-review-evidence/batch-01-recovery.json
```

Check operational admission with:

```bash
node validation/figma-design-governance.cjs --admit plans/figma-review-evidence/batch-01-recovery.json
```

The admission command must exit non-zero until `FULL_SCREEN_PASS` is genuinely earned.

## Natural-scale review checklist

For every screen and required state, answer **PASS**, **FINDING**, or **NOT PROVEN** with one sentence of evidence:

1. Is the composition balanced, with deliberate visual weight rather than accidental gaps?
2. Is negative space intentional after every removal or collapse?
3. Do columns, baselines, margins, grid, alignment and indentation read consistently?
4. Are component proportions professional, including label inset, padding, centring and surrounding breathing room?
5. Does every ornament have a named structural purpose, approved provenance, suitable scale and sufficient clear space?
6. Are ribbons, borders, transitions and floral finishes placed where their geometry and hierarchy make sense?
7. Are surface and accent colours appropriate to their semantic role rather than applied because they are available?
8. Is the selected address language pure across every visible descendant and override?
9. Is answer-before-data hierarchy preserved without capping practitioner depth?
10. Does the screen feel finished without relying on an explanation from its builder?

## Contact-sheet review checklist

1. Do all screens belong to one Ganak website without becoming monotonous clones?
2. Is colour density coherent across families, with no recurring ivory drift or mindless blue wash?
3. Are ornament roles varied purposefully rather than repeated as stickers or omitted indiscriminately?
4. Do screen densities and footer/ending treatments form a consistent rhythm?
5. Does one screen look conspicuously sparse, crowded, misaligned or less resolved than its peers?
6. Has an earlier rejected visual pattern returned under a new node, crop, name or hash?

## Typed dispositions

- `BLOCKED_FROM_OWNER_REVIEW`: any required review missing, any unresolved conflict, any open finding, any required screen/state absent, or source-first lineage unproven.
- `NARROW_PASS`: one named category passed for its exact declared scope. This is never an admission state.
- `FULL_SCREEN_PASS`: all mandatory roles cover every required screen; all mechanical gates pass; natural/contact-sheet judgements are complete; blind visual QA is cold; source-first lineage is proven; exact independent Visual Art records are complete and mutation-stable; unresolved conflicts and known findings are both zero.

The historical label inside Figma is not the operational disposition. No exact current desktop node may be labelled `OWNER REVIEW`, `RELEASED` or `FULL_SCREEN_PASS`, and no owner link may be sent, until the evidence packet and admission gate pass the Visual Art charter. Any mutation or reclone invalidates that node's Visual Art record.
