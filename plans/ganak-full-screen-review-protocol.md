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
| Independent Visual Art release QA | Bind immutable natural-scale artifacts and one exact-membership contact sheet to every exact current desktop node; decide its background, every ornament, no-ornament alternative, composition balance and rejected resemblance, then record a matching end fingerprint. | Build/reclone the reviewed nodes, approve authored work, reuse source/predecessor evidence, leave a visual finding open, retain PASS after mutation/reclone, or review mobile while mobile is paused. |
| Integrator | Aggregate every screen-level finding, verify source-first repair and regenerated lineage, and compute admission. | Self-certify missing reviewer categories or override an open finding. |

## Required evidence packet

The packet must list:

- exact Figma file, section, screen and source/shared-component node IDs;
- immutable natural-scale screenshot evidence for every primary and required state;
- one same-scale contact sheet for the complete batch;
- manifest version and decision IDs applied;
- mechanical evidence for visible text, surfaces, controls, ornaments, assets/crops and source lineage;
- all reviewer identities, scope, exact status and evidence;
- an independent Visual Art reviewer identity and builder/integrator task IDs proving separation;
- one immutable artifact digest for every natural-scale screenshot and the contact sheet;
- an ordered contact-sheet membership list exactly equal to the current desktop review-node list;
- one exact-node Visual Art record per screen containing a background rationale, composition-balance verdict and rationale, rejected-resemblance verdict and rationale, and zero unresolved findings;
- every visible ornament, including an explicit no-ornament decision where applicable, with keep/remove decision, purpose, library provenance, clear-space, alignment and scale verdicts;
- one current per-node fingerprint derived from exported/audited node state, plus a computed evidence digest binding file, section, ordered node set, node fingerprints, artifact digests, reviewer and review time;
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

## Mandatory desktop Visual Art gate

The Visual Art gate applies to desktop only while mobile is paused. It is mandatory for operational `OWNER_REVIEW`, `RELEASED` and `FULL_SCREEN_PASS`.

Evidence is exact-node evidence, not screen-name evidence. A same-ID mutation changes the exported node fingerprint; a source regeneration or clone changes the node ID. Either event, reordered contact-sheet membership, changed screenshot artifact, reviewer change or review-time change invalidates the binding digest. The batch must return to `BLOCKED_FROM_OWNER_REVIEW` until a reviewer independent of both builders and integrator reviews the new exact nodes.

For each current node the reviewer must record:

1. why the background is appropriate to that screen's density and semantic role;
2. a composition-balance verdict and rationale covering focal weight, negative space, alignment and scale;
3. every ornament decision, including purpose, exact library provenance, surrounding space, alignment and scale;
4. whether the screen resembles any rejected asset, crop or substitute pattern;
5. every open finding; the list must be empty for admission.

A previous holistic PASS, a screenshot URL without an artifact digest, a contact sheet containing predecessor nodes, or a builder's own approval is not admissible Visual Art evidence.

## Mandatory desktop Ornament Library gate

Every current desktop screen must choose exactly one machine-readable ornament mode:

- `RESTRAINED`: sparse, structural use. Owner-approved.
- `RICH`: more expressive but still purposeful composition. Owner-approved.
- `CELEBRATORY`: permitted only for Festival, Vrat or ceremonial-hero contexts.
- `NONE`: permitted only when the no-ornament comparison and independent Visual Art verdict show that the composition remains deliberate and finished.

`BALANCED` is rejected because it does not specify a compositional decision. It is never an alias for Restrained or Rich.

Each exact-node record must state the screen context, mode rationale and permitted contexts; mark the inventory complete; compare the chosen result with no ornament; and list every instance with:

- its exact node and keep/remove decision;
- one named structural/editorial job—not “decoration”;
- exact approved library root and component node;
- placement, clear-space, alignment and scale verdicts;
- creator and independent curator identities where curation is involved.

Library underuse is a finding when `NONE` or a sparse inventory leaves the composition empty or unfinished. Arbitrary decoration, unknown provenance, missing jobs and creator/curator self-approval are blockers.

If no suitable library asset exists, source-derived Ganak-theme work must remain `EXPLORATION` with creator and independent curator evidence. Exploration is not admissible on a review/released screen until a separate decision approves it into the library. The exact-node fingerprint and evidence digest invalidate Ornament Library evidence on mutation or reclone just as they invalidate the parent Visual Art review.

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
- `FULL_SCREEN_PASS`: all mandatory roles, including independent desktop Visual Art QA, cover every exact required node; all mechanical gates pass; immutable natural/contact-sheet binding is current; visual-art judgments are complete; blind visual QA is cold; source-first lineage is proven; unresolved conflicts and known findings are both zero.

The historical label inside Figma is not the operational disposition. No exact current desktop node may be labelled `OWNER REVIEW`, `RELEASED` or `FULL_SCREEN_PASS`, and no owner link may be sent, until the evidence packet and admission gate pass the Visual Art charter. Any mutation or reclone invalidates that node's Visual Art record.
