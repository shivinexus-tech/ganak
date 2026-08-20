# Ganak Figma redesign: memory and quality bottleneck investigation

**Date:** 2026-08-20

**Prepared for:** Shivie, Ganak owner

**Purpose:** independent evidence brief for a second opinion from Claude
**Disposition:** investigation and proposed recovery only; the redesign is **not solved** and production must not resume on the strength of this document.

## Evidence labels used here

- **Direct evidence** means owner wording, a current Figma inspection, a repository record, or a task-history event inspected for this audit.
- **Agent report** means a claim made in a prior agent/QA handoff that this audit did not independently reproduce in full.
- **Inference** means the best explanation connecting confirmed facts; it is explicitly identified and should be challenged.

Primary repository evidence: `plans/ganak-figma-authority.md`, `plans/ganak-design-feedback-ledger.md`, `plans/ganak-design-rejection-log.md`, `plans/ganak-figma-prototype-state.json`, `plans/ganak-redesign-requirements.md`, and `plans/task-log.md`. Primary task evidence includes root `01a017af-6f82-7760-89c6-f54e21c97720`, Design Director `019faab9-9aee-7620-a5e0-9b604d37b3a2`, Floral/Vrat `01a00933-7378-7331-a468-574b8e9cd62c`, Lane A `01a01848-2816-7db2-a4a8-f356acc34370`, Lane C `01a01848-2f6e-7510-8f97-71e3cfbcefcf`, independent QA `01a018d9-dca3-70b3-a851-b46eccd965cf`, visual-art QA `01a01ac0-0ddc-7683-aec4-6fe23ed651d6`, responsive QA `01a01abf-f400-7850-80a0-59575ed7b637`, bilingual QA `01a01abf-f955-7353-881c-4d595838f47f`, and accessibility QA `01a01ac0-0303-7f62-a3bf-05b3208ade26`.

Current checkpoint: [Figma Batch 01 section `769:17254`](https://www.figma.com/design/ynavdn3IEdBoGsIP43c4bD/Ganak?node-id=769-17254).

## 1. Executive summary

The redesign did not stall because Ganak lacked feedback, agents, assets, rules, or QA. It stalled because those controls did not reliably govern the exact rendered screen that reached Shivie.

The operating system optimized for distributing work and recording facts, but not for enforcing decision precedence, source lineage, or whole-screen quality. Feedback lived mainly as prose. Agents could comply with one sentence while violating the visual intent behind it, or overgeneralize one rejection into a global ban. Reviewers passed their assigned categories; the status was then promoted into a broader “quality PASS” that the evidence did not justify. Screen clones accumulated local fixes instead of being regenerated from corrected sources and shared components. No single reviewer was accountable for asking the plain question: “Does this complete screen look finished, coherent, bilingual, and free of every known rejected pattern?”

The clearest incident is Batch 01. Repository and task records say two independent reviewers passed all twelve desktop primaries and the section was promoted to `OWNER REVIEW`. Immediately afterward, Shivie found Hindi on English screens, a repeatedly rejected floral element, purposeless ribbons, an empty/unbalanced Today panel, poor Property Finder button geometry, sparse and poorly composed ornament use, and careless color application. Shivie therefore became the true full-screen bug bash. A PASS that requires the owner to discover those defect classes is not a full-screen quality pass.

The records prove **at least eight distinct rework/restart cycles** between the approved archetypes and the current Batch 01. Shivie reports substantially more—“50+” removals and “10+ full iterations” for one returning element—but older/vanished histories are not fully accessible, so this audit does not present those figures as independently counted facts.

The recovery should preserve the current work. It should not start another twelve-screen redraw. First freeze the review clones; convert owner decisions into a machine-readable manifest with explicit precedence and conflict blocking; audit and correct shared sources/components; regenerate clones; run mechanical gates; then run a cold, blind whole-screen review at natural scale and contact-sheet scale. The owner sees a batch only when every known finding is closed and the label says exactly what passed.

## 2. Minimum defensible timeline of restart/rework cycles

The rows below are distinct because each changed authority, sources, composition, or review status. They are not individual tiny edits.

| Minimum cycle | Date | Task / evidence | What restarted or was reworked | Defects that repeated or escaped |
|---:|---|---|---|---|
| 1 | 2026-08-10 | Prototype state; approved Today special `104:49` and ordinary `116:49` | Editable Today reconstruction and ordinary-day no-hero alternatives reached visual QA/owner approval. | Later responsive candidates drifted into locally redrawn shells and generic stacked cards; approved hierarchy did not reliably control descendants. |
| 2 | 2026-08-11 | Prototype state; background X/Y and close-up comparisons | Pale-blue/white baseline was selected and applied to Festival A/D and detail 1–3. | Dull ivory/cream later returned in four review frames and then again in Batch 01 as four exact dominant fills. |
| 3 | 2026-08-18 | Design Director; Lane A/B/C workbenches; owner-review queue | Parallel lanes restarted screen-family production under a one-integrator model. | Read-only reviewers found responsive candidates with zero shared instances, detached/local shells, unfinished whitespace, missing states, and weak lineage. |
| 4 | 2026-08-19 | Historical four-frame section `652:13736`; independent QA | Today/Panchang and Festival/Vrat desktop + 390px pair were promoted after exact-node QA. | PASS was withdrawn when the owner rejected the Vrat asset/crop and Today ornament treatment; the baseline is now `CHANGES REQUESTED`. |
| 5 | 2026-08-19 | Authority record; nodes `675:14247`–`675:14253` | Rejected floral pieces were replaced with an invented textile/bookplate correction. | Owner rejected it because it did not match the existing vocabulary; removal of one wrong element caused another unsupported composition rather than source-led recomposition. |
| 6 | 2026-08-19 | Visual vocabulary `707:14247`; `REJ-015` | A recovered ornament vocabulary and “Balanced” composition attempted to systematize use. | “Balanced” was rejected as generic/sparse and compositionally weak; creating a library did not create a selection or placement discipline. |
| 7 | 2026-08-19–20 | Lane A `01a01848-…`; Floral/Vrat; `REJ-016`, then `REJ-017` | Exact `485:51`/`b7559c…` was globally rejected, followed by a second screenshot-crop correction. | Initial response overgeneralized the screenshot into a visual-family ban; later owner scope correction narrowed it to the exact crop signature because hash `c69d89…33732` also served legitimate crops. This is both a recurrence and an interpretation failure. |
| 8 | 2026-08-20 | Design Director, independent QA, visual-art QA; Batch `769:17254`; commit `ad50cc2` | Twelve desktop primaries were corrected, dual-PASSed, renamed `OWNER REVIEW`, and presented. | Owner immediately found the same classes: rejected element recurrence, empty Today balance, purposeless ribbons, bad button geometry, language leakage, weak ornament composition, and mindless color use. The earlier PASS was narrower than its promotion implied. |

**Minimum count:** eight. **Direct owner testimony:** the root task says the exact element had been rejected “atleast 50 + times” and had cost “atleast 10+ full iterations.” This audit treats that as credible owner experience, not as a separately verifiable event count. **Unavailable/vanished history:** the root task itself began because the earlier floral task had vanished from the panel; some pinned tasks are `notLoaded`, Lane B is not exposed as a separately titled pinned task, and paginated history/tool output is incomplete. The real count may be higher.

## 3. Confirmed incidents

### 3.1 Ivory/cream drift returned after explicit approval

**Direct repository evidence.** Approved-safe bases are canvas `#F9FCFD`, surface `#FFFFFF`, and secondary `#ECF4F7`. The four repeatedly denied dominant values are:

- `#F9FAF9` canvas;
- `#FCFBF8` header;
- `#FFFDFC` cards, panels, and inputs;
- `#FAF9F4` Today hero.

The authority says the drift was first corrected in the four-frame review set and later found again in Batch 01, requiring upstream corrections at shared-context nodes `206:108`, `206:115`, `274:690`, `552:61`, `552:68`, and `552:86`, followed by source and clone refreshes. This is not a vague aesthetic disagreement: the same forbidden surface role recurred after a recorded correction.

### 3.2 Rejected floral asset `485:51` returned through bad authority

**Direct repository evidence.** Exact node `485:51`, image hash `b7559c796e972db13b8aa54daba3a1405264f488`, composition `485:24`, and exact/derived presentations are archive-only under `REJ-016` / `GDF-062`. Historical exact-hash instances include `493:22`, `495:22`, `495:23`, and `495:24`; former shared component `760:21`/child `760:22` was moved to rejected archive `778:2`.

The serious cause is recorded in governance itself: an earlier authority row incorrectly described `485:51` as approved. Later agents could therefore “follow the memory” and still revive the rejected asset. This is a precedence failure, not simply a careless crop choice.

### 3.3 Exact screenshot crop required a different rule

**Direct task and repository evidence.** The screenshot culprit was wrapper `762:16314`, 88×446 (ratio 5.07:1), clipping a 1536×1119 raster at `x=-21,y=-253`; corresponding source nodes are `116:391`/`116:392`, canonical wrapper/raster `107:50`/`107:51`, and Batch raster `762:16315`. Its hash is `c69d89b16c8068f8f06ea86b4a3852a19db33732`.

The first correction treated the screenshot as a broad ban on tall/narrow botanical edge crops. The owner then clarified that only the exact faded red/orange, muted-green, gold-curl, ivory-backed crop was rejected; the same raster contains materially different legitimate crops. `REJ-017` therefore uses crop geometry/signature rather than globally denying the hash or all vertical botanical art. This incident demonstrates the two-sided interpretation failure: too narrow (hash-only) can miss visual recurrence; too broad (shape/family ban) can reject valid art.

### 3.4 Removal left Today unfinished

**Direct owner evidence; current visual inspection supports the concern but does not adjudicate taste.** Shivie said the ordinary/non-hero Today panel became empty on the left after floral stems were removed. The root task acknowledged that removal was treated as completion instead of triggering recomposition, content-width adjustment, or selection of a suitable approved ornament. The A/B/C comparison `811:18395` later chose C/no added ornament (`811:19095`) for one exact slot, because other structural ornament already existed. That slot-specific decision does not establish that the complete panel was balanced; it shows how a narrow decision can be promoted beyond its scope.

### 3.5 Ornament library existed but composition did not

**Direct repository evidence and owner evidence.** Inventory `800:2` contains 68 deduplicated items; approved floral set `760:20` has nine assets and structural border set `759:20` has ten. Despite that breadth, the owner found sparse use, weak alignment/indentation, and ribbons inserted where there was insufficient room (twisted gold on Today and crimson elsewhere). A library proves availability and provenance; it does not prove purpose, fit, scale, breathing room, or hierarchy.

### 3.6 Property Finder button geometry escaped review

**Direct owner evidence; exact property values not independently extracted.** Batch primary `769:19487` contains the Property Finder and its “Find best days” action. Shivie reported that the button looked badly sized and that its label began without adequate space. This audit inspected the current full-screen screenshot, but did not run a Figma-script measurement of that button and therefore does not assert exact padding values. The incident is still confirmed as owner-detected after dual PASS, and it belongs to a missing component-geometry coverage class.

### 3.7 Hindi leakage escaped an English-screen PASS

**Direct owner evidence.** Shivie reported Hindi text leakage on English screens, including screens not annotated individually. `GDF-016` already requires complete address-language screens. The Batch PASS claimed exact-node QA, but the owner found language mixing afterward. This proves that either the language scan did not cover every visible string/descendant/state or its result was not a prerequisite for the promoted status.

### 3.8 Narrow QA was promoted to whole-screen quality

**Direct task-history evidence.** The Batch handoff reported zero denied fills, zero rejected hash/crop use, zero sub-12px text, zero overflow/reviewer prose/native contamination, plus specific contrast ratios. It then said permanent ornament/surface review and independent exact-node QA passed 12/12. The owner’s next review found defect classes outside or incompletely covered by those measurements. Root task `01a017af-…` then explicitly concluded the batch should be considered failed as a quality checkpoint despite the prior PASS.

## 4. Root-cause analysis

### 4.1 Memory and decision-precedence failure

**Confirmed:** contradictory authority existed: `485:51` was once recorded as approved, then explicitly rejected. Multiple duplicate task-log rows retain superseded language. Feedback is spread across requirements, authority, ledger, rejection log, prototype JSON, task rows, task histories, screenshots, and Figma labels.

**Inference:** agents did not “forget” in the human sense; retrieval returned several plausible truths without a deterministic resolver. A newer direct owner correction could lose to an older, more structured “approved” entry or a visually named component. Memory volume increased while decision determinism did not.

### 4.2 Feedback interpretation failure: too narrow and too broad

**Confirmed:** hash-only rejection failed to capture a different crop with the same disliked appearance. The response then swung too broad, proposing a ban on tall/thin or vertical botanical art, until the owner clarified that legitimate crops shared the raster. “Remove this ornament” was also interpreted narrowly as deletion rather than recomposition; “blue/white is safe” was interpreted broadly as indiscriminate blue application.

**Inference:** feedback was translated directly into rules without an explicit scope tuple: exact node, visual signature, semantic role, screen family, allowed exceptions, and non-goals. Agents filled those gaps by inference, producing oscillation.

### 4.3 Source-lineage and cloning failure

**Confirmed:** responsive QA found reviewed Today and Festival candidates with zero shared component instances and locally authored shells. Authority itself prohibits detached redraws. Review clones were later patched and refreshed repeatedly. Exact rejected assets could survive in descendants or clones after source-level changes.

**Inference:** clone-first correction created multiple writable truths. When fixes were applied to the review clone rather than the canonical source/component, subsequent regeneration or family propagation could resurrect the old defect. Conversely, local clone fixes made a single batch look clean without making the system clean.

### 4.4 QA-scope and false-PASS failure

**Confirmed:** reviewers produced real, useful measurements—contrast, minimum text size, overflow, native contamination, exact hashes/crops—and those checks did catch issues. However, the status communicated to the owner implied a broader quality guarantee than those gates provided. Earlier specialist audits had already returned `CHANGES REQUESTED` for generic composition, detached ornaments, blank bands, and zero component instances.

**Inference:** there was no typed status system. `PASS` was a free-text word that could mean “contrast passed,” “my assigned findings are zero,” or “the whole screen is owner-ready.” Aggregation treated multiple narrow passes as a holistic pass, even when their scopes did not cover composition or geometry.

### 4.5 Fragmented ownership and handoff failure

**Confirmed:** one integrator, Lane A/B/C, Design Director, independent QA, ornament reviewer, bilingual reviewer, accessibility reviewer, and responsive reviewer all existed. The owner nevertheless found cross-category defects. The root communication task was also repeatedly used for worker updates despite the owner asking three times to keep it feedback-only.

**Inference:** accountability was fragmented by category rather than by final artifact. Each agent could complete its lane while the full screen remained unowned. Handoffs transmitted findings and IDs, but not a single executable closure state across all categories.

### 4.6 Asset-library selection and composition failure

**Confirmed:** Ganak has a large, categorized inventory, but owner complaints concern purpose, density, alignment, breathing room, and visual fit. `REJ-015` records that a supposedly “Balanced” composition was rejected. A/B/C selection chose no ornament for one slot but did not solve the entire panel.

**Inference:** the pipeline treated provenance and availability as proxies for art direction. It lacked semantic roles (“transition,” “niche,” “footer,” “ceremonial hero”), density budgets, collision/breathing-space checks, and whole-screen comparison. Mechanical provenance is necessary but aesthetically insufficient.

### 4.7 Language and component-geometry coverage gaps

**Confirmed:** bilingual rules and reviewers existed, yet Hindi leaked onto English screens. The owner found an obviously poor action button after QA. Existing checks emphasized text size, contrast, and target dimensions, not label inset, asymmetric padding, optical centering, hug/fill behavior, or every visible string in nested/overridden instances.

**Inference:** checks were property-based but not component-contract-based. A button can be 42px tall and still look broken. A root frame can be English while an overridden child string remains Hindi.

### 4.8 Concurrency and management bottlenecks

**Confirmed:** multiple tasks ran simultaneously; some were `notLoaded`, one floral task vanished from the panel, large histories were paginated/truncated, and the integrator had to reconcile lane work, owner feedback, Figma mutation, docs, QA, and messaging. The task log contains current and superseded rows with the same canonical ID.

**Inference:** parallelism increased throughput of local activity but also multiplied snapshots of authority and handoff latency. One integrator became a serial bottleneck while still being expected to perform art direction, implementation, governance, and QA aggregation. More agents made the queue wider, not the final judgment faster.

## 5. Why the existing controls failed

| Control | What it did help with | Why it did not prevent recurrence |
|---|---|---|
| Feedback ledger | Recovered many owner decisions and attached GDF IDs. | Prose rules were not uniformly executable; conflicts and precedence were not machine-resolved; “active” did not guarantee every descendant/state was checked. |
| Rejection log | Preserved exact nodes, hashes, fills, screenshots, and reasons. | It was added/updated after failures; hash rules could be too narrow, visual-family rules too broad, and archive labels could coexist with stale approved language. |
| Design Director | Centralized integration and stopped unrestricted shared edits. | It became the reconciliation bottleneck and also the status promoter. It could validate evidence packets without independently seeing every complete screen at both natural and contact-sheet scale. |
| Independent QA | Found genuine regressions and supplied exact-node evidence. | Its scope was narrower than “whole-screen quality”; exact-node/property checks did not cover visual purpose, optical geometry, every language override, or all states. |
| Specialist agents | Added expertise in accessibility, responsive behavior, language, ornament, and art direction. | Findings were distributed across tasks; no single artifact-level owner reconciled all findings before promotion. Specialists could pass their lane while another lane remained red. |
| Automated checks | Measured contrast, sizes, overflow, fills, hashes/crops, and contamination. | They did not encode semantic background roles comprehensively, crop signatures and exceptions as data, component geometry contracts, ornament provenance/role, or a language-purity traversal over every visible descendant. |
| Approval cycles | Gave the owner meaningful direction choices. | The owner was shown screens with known or discoverable implementation-quality defects, so preference review became bug bash. Repeated owner review consumed the scarce resource the system was supposed to protect. |

The lesson is not that ledgers or specialists are useless. They are necessary evidence sources. They failed because the process allowed evidence to remain advisory and allowed a narrow PASS to change the batch’s overall state.

## 6. Proposed solution, alternatives, and trade-offs

### 6.1 Non-negotiable decision model

Use this precedence order:

1. latest direct owner feedback tied to an exact artifact/scope;
2. earlier direct owner feedback not superseded;
3. owner-approved manifest entry;
4. agent summary or inferred visual rule;
5. historical label/name.

If two applicable records conflict, create a **conflict block**. The affected source and descendants cannot be promoted or regenerated until the owner or designated integrator resolves the conflict. Agents must not infer which side “probably” applies.

### 6.2 Machine-readable reject/approval manifest

Add one manifest (JSON/YAML) generated or reviewed from owner decisions. Each entry should include:

```yaml
id: REJ-017
decision: rejected
precedence: direct_owner
decided_at: 2026-08-20T...
scope:
  file: ynavdn3IEdBoGsIP43c4bD
  exact_nodes: [107:50, 107:51, 116:391, 116:392, 762:16314, 762:16315]
  exact_crop_signature:
    wrapper: [88, 446]
    raster: [1536, 1119]
    offset: [-21, -253]
  roles: [active_screen, shared_component, owner_review]
exceptions:
  allowed_hashes_with_other_crops: [c69d89...33732]
reason: exact faded ivory-backed floral edge crop does not match Ganak
supersedes: [earlier-broad-family-ban]
```

Approvals need the same rigor: exact source, allowed roles, density, screen families, and explicit non-transferability. The manifest should be the input to gates; Markdown remains human explanation.

**Trade-off:** setup cost and some rigidity. **Benefit:** decisions stop depending on recall, naming, or task chronology.

### 6.3 Executable Figma gates

Run against canonical sources, shared components, generated review clones, and all visible descendants:

- **Language purity:** English roots contain no Devanagari except explicitly whitelisted proper/source terms; Hindi roots contain no unintended English UI. Traverse instance overrides and hidden-to-visible states.
- **Asset/crop signatures:** exact rejected hashes, nodes, names, crop transforms, wrapper/raster geometry, and approved exceptions. A hash can be allowed only under listed crop signatures/roles.
- **Semantic background roles:** classify canvas/header/card/panel/input/hero/footer/empty-region; enforce permitted fills by role and area, not a blind global palette ban.
- **Component geometry:** component contract for 42px control height, minimum horizontal padding, label-to-edge inset, icon gap, optical vertical centering, radius, hug/fill rules, minimum/maximum width, and text overflow. Fail altered detached buttons.
- **Ornament provenance:** every visible ornament points to an approved library component or explicit exploration; record semantic role, density mode, source lineage, and screen-family permission.
- **Composition heuristics:** flag ornament collisions, insufficient clear space, repeated decorative bands, large unexplained empty regions, detached instance count, and locally redrawn shared shells for human review. Do not pretend these heuristics decide beauty.

Every gate result must name its scope, nodes, states, and exclusions. “PASS” alone is invalid output.

### 6.4 Correct source/shared components before clone regeneration

Freeze Batch 01 clones as evidence. Build a lineage map from each primary to canonical screen source and shared components. Fix the earliest authoritative source of each defect. Only after source gates pass should review clones be regenerated. No local clone patch may close a source defect.

**Trade-off:** some apparently finished clone edits will be discarded. **Benefit:** the next batch inherits the fix instead of resurrecting the defect.

### 6.5 Two-scale holistic screenshot review

For each candidate:

1. inspect at natural scale for padding, type, alignment, crop quality, and local collisions;
2. inspect in a same-size contact sheet with all peers for rhythm, density, color drift, repeated ornament, and family coherence;
3. inspect long/sparse/error and EN/HI companions, not only the primary desktop state.

The reviewer must answer composition questions, not merely gate questions: Is negative space intentional? Does every ornament have a job? Does the action geometry look professional? Does the screen belong to Ganak? Is an old rejected pattern visually back under a new node?

### 6.6 Cold/blind visual reviewer

Use a reviewer that did not build the screen, did not write the ledger entry, and initially receives only the product baseline, target persona/journey, approved references, and screenshots—not the builder’s claimed fixes or PASS status. After the cold critique, reveal the reject manifest and ask for regression matching.

**Trade-off:** extra review round. **Benefit:** reduces confirmation bias and “checking the checklist I already satisfied.”

### 6.7 Exact status definitions

**NARROW GATE PASS** means one named gate passed for listed nodes/states. It must never promote a screen or batch.

**FULL-SCREEN QUALITY PASS** means all of the following are true for the exact candidate set:

- canonical lineage/shared-component gate passed;
- rejection/approval manifest has no conflicts or active violations;
- EN/HI purity passed for every visible string and required state;
- background-role, asset/crop, component-geometry, ornament-provenance, accessibility-visible, overflow, and state-coverage gates passed;
- natural-scale review has zero open findings;
- contact-sheet review has zero open findings;
- a cold/blind reviewer has zero P0/P1/P2 findings or every finding has a documented closure and recheck;
- known limitations are listed and do not contradict the review decision.

Only the integrator may assign this status, and only by linking the evidence bundle. “12/12” is meaningless without the category matrix.

### 6.8 Owner review only after zero known findings

Shivie’s checkpoint should answer product-direction questions: coherence, emotional fit, weakest screen, and preference. It should not be the first language, geometry, provenance, or holistic bug bash. If any reviewer has an open finding, the batch remains internal.

### 6.9 Preserve current work

Do not restart from zero. Preserve:

- the twelve current primaries as a frozen failed/contested baseline;
- approved archetypes and shared responsive components that pass lineage review;
- the 68-item inventory and role-specific approved sets;
- exact rejection evidence and historical archives;
- corrections that can be proven at the source.

Discard or regenerate only detached clones, stale overrides, and unsupported local compositions. This separates valuable work from contaminated lineage.

### 6.10 Alternatives

| Alternative | Advantage | Cost/risk | Recommendation |
|---|---|---|---|
| Continue current process with stricter reminders | Fastest to restart. | Same prose-memory and PASS-promotion failures remain. | Reject. |
| Single designer does everything sequentially | Stronger aesthetic continuity. | Slow, key-person risk, still vulnerable to memory and self-review bias. | Use one integrator, not one unchecked worker. |
| Rebuild all screens from zero | Clean psychological reset. | Destroys valid work and can repeat the same governance defects. | Reject unless lineage audit proves sources unusable. |
| Gates-only process | Deterministic and scalable. | Cannot judge composition, purpose, sacred warmth, or optical quality. | Necessary but insufficient. |
| Integrator + isolated writers + mechanical QA + blind holistic QA | Keeps speed while separating construction, enforcement, and judgment. | More upfront tooling and disciplined status handling. | Recommended. |

### 6.11 Small recovery implementation sequence

| Step | Owner | Dependency | Output/evidence |
|---:|---|---|---|
| 1. Freeze and inventory | Integrator | None | Immutable list of Batch 01 primaries, their sources, shared instances, overrides, and screenshot hashes. No visual edits. |
| 2. Resolve authority conflicts | Integrator + Shivie only for true conflicts | Step 1 | Machine-readable manifest; explicit supersedes/exception fields; zero unresolved conflicts for Batch 01. |
| 3. Build gates | Mechanical QA owner | Step 2 | Mutation-proved scripts for language, crop/hash, background roles, geometry, provenance, and lineage. Each deliberately broken fixture must fail. |
| 4. Audit sources | Integrator + isolated source owners | Steps 1–3 | Finding matrix locating each defect at shared component, source, or clone; correction plan with one writer per node subtree. |
| 5. Correct upstream | Isolated writers; integrator merges sequentially | Step 4 | Corrected shared components/sources; source gates pass; no review-clone patching. |
| 6. Regenerate candidates | Integrator | Step 5 | Fresh Batch 01 descendants with lineage report and byte/image comparison against frozen baseline. |
| 7. Mechanical QA | Independent QA | Step 6 | Complete category-by-node/state matrix; zero violations. |
| 8. Holistic QA | Cold visual reviewer + language reviewer | Step 7 | Natural-scale and contact-sheet reports; zero known findings after recheck. |
| 9. Owner checkpoint | Shivie | Step 8 | Direction decision only; feedback becomes new manifest entries before any further propagation. |

## 7. Recommended operating model

### Roles

- **One integrator:** owns authority resolution, shared system, lineage map, sequential integration, and status promotion. The integrator does not self-certify holistic quality.
- **Isolated writers:** one node subtree each; no shared edits; receive a manifest subset and source IDs; return exact diffs and screenshots.
- **Mechanical QA:** read-only, mutation-proved, covers every required node/state. It cannot use the label “full-screen.”
- **Holistic visual QA:** cold reviewer, natural-scale plus contact sheet, accountable for the complete artifact rather than one category.
- **Owner:** reviews only after zero known findings, at a predictable cadence.

### Cadence

1. One internal checkpoint after source correction, not after every screen.
2. One internal checkpoint after regenerated mechanical QA.
3. One owner checkpoint per coherent batch only after full-screen pass.
4. New owner feedback is recorded immediately with scope and precedence, but production pauses only for affected sources/descendants—not the entire redesign unless the rule is global.

### Management limits

- Maximum one active writer per source/component subtree.
- Maximum one integrator queue of three ready handoffs; do not spawn more lanes when the queue is full.
- No task status copied between threads without exact evidence links.
- A vanished/unavailable task is not authority. Its committed artifacts and manifest entries survive; uncommitted claims do not.
- The root owner-communication task remains feedback-only, as Shivie explicitly requested.

## 8. Questions for Claude / second-opinion reviewer

Please challenge this document rather than endorse it by default:

1. Which claimed root causes are unsupported or over-inferred from the available evidence?
2. Is eight the correct minimum defensible cycle count? Can you locate additional distinct, accessible cycles without double-counting small corrections?
3. Are there missing causes—model visual limitations, Figma API constraints, task-history retrieval, prompt design, organizational incentives, or owner-review cadence—that better explain recurrence?
4. Is a machine-readable manifest feasible with Figma’s available APIs, especially crop transforms, instance overrides, semantic roles, and image hashes?
5. Which proposed gates can be reliable, and which would create false confidence or false positives?
6. How would you define and test component optical geometry without pretending aesthetic judgment is mechanical?
7. Is the proposed one-integrator model still a bottleneck? What alternative preserves coherent art direction without centralizing every decision?
8. Should cold visual QA be one reviewer, two independent reviewers, or a structured comparison panel? What is the minimum evidence needed?
9. How can current work be preserved while proving that contaminated clones do not re-enter the source lineage?
10. What simpler recovery sequence would reach a trustworthy owner checkpoint faster?
11. What evidence would falsify this audit’s central thesis that the core failure is enforcement and scope, not lack of feedback?
12. Propose a better operating model if this one is too heavy for Ganak’s size.

## 9. Limitations and unknowns

- This audit did not edit Figma and did not perform an exhaustive scripted traversal of every current Batch 01 descendant. It directly inspected the current section screenshot and key screen screenshots, while exact hashes/fills/geometry otherwise come from repository records and task histories.
- It did not independently measure the Property Finder button’s padding or inspect every reported Hindi leak. Those incidents are direct owner findings after the reported PASS, not independently quantified layer audits here.
- Some task histories are paginated, truncated, `notLoaded`, vanished from the panel, or represented only through later summaries. Lane B is partly represented by Floral/Vrat and governance evidence rather than one clearly exposed lane history.
- Dates are taken from repository/task records; some task metadata uses epoch timestamps and the audit did not reconstruct every wall-clock event.
- The owner’s “50+” removals and “10+ iterations” are quoted as testimony, not independently counted.
- A screenshot can show visible quality but not keyboard behavior, route correctness, dynamic states, assistive semantics, or production responsiveness. The current Batch label itself acknowledges those separate gates.
- This document does not decide whether the current aesthetic direction is good. It investigates why rejected and obviously unfinished elements repeatedly survived the workflow.
- No claim here means every visual problem has been discovered. The redesign remains unresolved.

## 10. Appendix: owner complaint → enforcement mechanism

| Major owner complaint | Evidence classification | Enforcement mechanism |
|---|---|---|
| Ivory/cream keeps returning | Direct records and owner history | Semantic background-role gate; exact denied fills; source-first correction; manifest precedence. |
| Rejected floral asset/crop returned repeatedly | Direct nodes/hashes/crop records | Exact node/hash/crop manifest; transform signature; descendant traversal; archive excluded from active lineage. |
| Feedback was first undergeneralized, then overgeneralized | Direct `REJ-016` → broad family instruction → `REJ-017` correction | Scope tuple plus explicit exceptions/non-goals; conflict block; owner resolves only true ambiguity. |
| Ribbons placed without purpose or room | Direct owner report | Ornament semantic-role field; provenance gate; collision/clear-space heuristic; cold natural-scale review. |
| Today became empty/unbalanced after removal | Direct owner report; slot decision evidence | Removal cannot close without full-screen recomposition review; contact-sheet and natural-scale pass; source regenerated. |
| Property Finder “Find best days” button looks wrong | Direct owner report | Component geometry contract: height, inset, padding symmetry, icon gap, optical centering, hug/fill, overflow; natural-scale optical review. |
| Hindi leaked onto English screens | Direct owner report; existing GDF rule | Full descendant/override language-purity gate across every state; bilingual reviewer sign-off before promotion. |
| Large ornament library barely or poorly used | Direct inventory + owner report | Role/density map, provenance manifest, purposeful-use review; no quota that forces decoration. |
| Blue applied mindlessly | Direct owner report / root history | Background and accent roles, density limits, relationship rules; contact-sheet color-balance review. |
| Narrow QA became whole-screen PASS | Direct handoff sequence | Typed statuses; narrow passes cannot promote; full-screen definition requires category matrix and holistic zero-findings review. |
| Owner forced to be final bug bash | Direct owner experience | Owner checkpoint only after zero known findings; cold reviewer and regression QA happen first. |
| Too many agents but still slow | Direct task topology; inference on bottleneck | Cap work in progress; one integrator queue; isolated writers; no new lanes while integration queue is full; durable manifest instead of task memory. |

## Bottom line

Ganak should not add another feedback document and hope agents remember it. The project already has enough prose. The missing control is an enforceable chain from the latest owner decision to canonical sources, generated descendants, typed QA results, and a blind whole-screen judgment. Preserve the good work, freeze the contested batch, correct upstream, and do not ask Shivie to review again until the system can honestly say there are zero known findings.
