# Ganak Figma Visual Authority

**Status:** mandatory governance for the website redesign
**Owner:** Shivie
**Figma file:** `ynavdn3IEdBoGsIP43c4bD` (`Ganak · Visual Master`)
**Canonical integrator task:** `019faab9-9aee-7620-a5e0-9b604d37b3a2` — **Ganak Design Director — Figma master**

## 1. One integrator, parallel isolated lanes

The canonical integrator alone may edit Foundations, shared Components, Variables,
Styles, approved master frames or production-ready screen pages. Screen-family
agents may work concurrently only inside their explicitly assigned `WORKBENCH`
page/section and node subtree.

Lane writers must never edit, detach, replace, rename or rebind shared components;
change variables/styles; touch another lane; or mark their own work `APPROVED`.
They clone or instantiate the approved system inside their workbench, label outputs
`OWNER REVIEW`, and hand exact nodes plus QA evidence to the integrator. The
integrator reviews and moves accepted work into the canonical master sequentially.

This is node-subtree ownership, not informal screen ownership. If a required change
sits outside the assigned workbench subtree, the lane stops and sends a request to
the integrator rather than modifying the shared source.

### Parallel lane allocation

| Lane | Exclusive workbench name | Node subtree | Scope |
|---|---|---:|---|
| A | `WORKBENCH A · Today + Panchang` | `512:4210` | Today special/ordinary and full Panchang states |
| B | `WORKBENCH B · Festivals + Vrat` | `512:4211` | Festival discovery, calendar and guide/vrat states |
| C | `WORKBENCH C · Muhurat + Prashna` | `512:4212` | Muhurat finder/results and Prashna shell conformity |
| D | `WORKBENCH D · Jyotish` | `512:4213` | Kundli, Matching, Dashas, Tools and practitioner workspace |

Only the integrator may resolve cross-lane patterns, update the system, or propagate
an approved change across families.

## 2. Required reading before any Figma work

1. `plans/ganak-redesign-requirements.md`
2. `plans/ganak-website-migration-contract.md`
3. `plans/ganak-site-capability-placement-register.md`
4. `plans/ganak-figma-prototype-state.json`
5. This authority record
6. `plans/ganak-design-feedback-ledger.md`
7. `plans/ganak-design-rejection-log.md`

Each lane writer must name the source component/frame nodes, its exclusive workbench
subtree and the intended decision
state before editing. If an applicable approved node is not known, inspect the
register; do not create a substitute from memory.

Each lane must also list the feedback-ledger IDs applicable to its candidate and
provide proof for each ID in its handoff. No candidate may enter `OWNER REVIEW`
until independent Design QA confirms that the applicable recovered feedback and
regression rules were checked.

## 3. Canonical Figma structure

- Website prototype page: `30:2`
- Website foundations page: `38:2`
- Website components page: `38:3`
- Responsive website components page: `583:3`
- Website utilities page: `38:4`
- Approved visual reference: `31:2` — locked reference only; never ship or crop it
- Semantic variable collection: `VariableCollectionId:33:3`
- Layout collection: `VariableCollectionId:33:4`
- Shared Date & Calendar Context component: `206:135`
- Shared Hindi desktop Date & Calendar Context component: `552:2`
- Shared website footer component set: `349:14`
- Responsive website component sets, created and integrator-QA'd 2026-08-19:
  - Header EN `588:204`; Header HI `590:268`
  - Date & Calendar Context EN `584:116`; HI `587:116`
  - Footer EN `591:161`; HI `592:161`
  - Quick Access EN `593:174`; HI `594:174`
  - Hindi website navigation atom `589:47`
- Linked 390px shared-system proofs: EN `596:67`; HI `596:258`
- Owner review queue page/board: `534:22` / `534:23`

### Shared context state-binding contract

The shared Date & Calendar Context components own visual structure, field labels,
responsive geometry and the five displayed values. Their reusable base variants do
**not** encode a sample date, place or calendar-selection destination. Every screen
instance binds the Place, Date and Calendar System controls to that screen's actual
visible state, preserving `lang`, `city`, `lat`, `lon`, `zone`, `date` and `cal`.
This permits safe page-specific behavior without losing site-wide visual updates.
A displayed value and its control destination must never disagree.

### Product-track boundary

This authority governs the responsive **Ganak website** only. Ganak Phone/native-
mobile explorations are a separate future product track. Phone-shell nodes including
the `518:*` comparison candidates are not website sources and must never replace or
reinterpret the approved website header, navigation, responsive shell, information
architecture or composition. A narrow responsive website proof remains the website;
it is not the Ganak Phone product. Existing phone-derived frames are preserved under
`GANAK PHONE · FUTURE NATIVE APP · PARKED`; they are reusable research for the later
Android/iOS track, not rejected work and not website implementation sources.

The parked inventory is explicit so no future integrator has to infer the product
track from appearance:

- Lane A parked section: `554:7622`
  - `537:7450`, `537:7480`, `537:7510`, `537:7557`, `537:7604`, `537:7650`
- Lane B parked section: `556:2`
  - `537:7717`, `537:7882`, `537:7825`, `537:7920`

Every node above has decision state `PARKED PHONE`. Preserve it for later native-app
evaluation, but exclude it from the website Owner Review Queue, website source
lineage, responsive-web proof and integration. Parking is not rejection and does not
approve the node for either product track.

The full node inventory and historical approval dates live in
`plans/ganak-figma-prototype-state.json`.

## 4. Approved baseline

- Owner-approved editable Today special frame: `104:49`
- Owner-approved ordinary Today frame: `116:49`
- Festivals default list: `135:50`
- Festivals calendar: `135:254`
- Festivals returning personalised state: `135:662`
- Festival detail normal/story/vrat: `135:866`, `135:1089`, `135:1312`
- Approved-safe website bases: canvas `#F9FCFD`, surface `#FFFFFF`, secondary
  `#ECF4F7`. These are not the complete or exclusive palette. The wider visual
  grammar permits source-evidenced navy, crimson/burgundy, luminous/antique gold,
  powder blue and botanical greens when their role, relationship, contrast and
  density are explicit; extraction alone is not approval.
- Current Vrat botanical editorial treatment is a specialist handoff into the
  canonical writer. It does not supersede shared components or approve unrelated
  layout changes.

### 4.1 Approved Vrat botanical hero treatment

**Owner decision durably recorded from the read-only specialist handoff on
2026-08-18.** The approved choice is the **bright botanical editorial** direction,
and its approval scope is the Vrat/Festival Guide **hero treatment only**.

- Approved editable source: `485:24`
- Source section: `485:22`
- Botanical artwork node: `485:51`
- Figma image hash: `b7559c796e972db13b8aa54daba3a1405264f488`
- Official Vrat screens: A `357:4`, B `357:212`, C `357:419`, D `357:627`
- Official hero nodes: A `357:117`, B `357:325`, C `357:532`, D `357:740`
- Applied botanical instances: A `493:22`, B `495:22`, C `495:23`, D `495:24`
- Approved instance geometry: `927.36 × 410.32`, bottom-left at `x=0`,
  `y=35.68` — the owner-selected artwork reduced to 92% after review.

The treatment uses a white/pale-blue-white shell, saturated deep navy,
burgundy/crimson, luminous clean gold and restrained blue/green support. The floral
sweep grows from the left/bottom-left; mapped deity artwork occupies the right with a
thin gold edge. Ornament is structural and varies by purpose; the exact textile
border or flower cluster is not pasted onto every screen.

**Decision state:** `485:24` is `APPROVED` as a visual-treatment source. This does
not approve the generated/raster source as a production website asset, nor does it
approve the parent A–D screen layouts, copy or data. Those frames remain
`OWNER REVIEW` until their canonical engine fixtures, shared-component linkage,
EN/HI and responsive evidence pass the migration contract. In particular, sparse D
must retain Follow even when artwork collapses, and its current Follow omission is
not an approved exception.

Specialist task `01a00933-7378-7331-a468-574b8e9cd62c` explicitly stopped writing to
the official Vrat nodes and shared system before handing them over. Under the later
parallel-lane decision, that task may now write only inside `WORKBENCH B · Festivals
+ Vrat`; it remains read-only for these official nodes, approved sources and every
shared component/variable/style. The canonical integrator owns every mutation and
propagation outside that isolated workbench.

## 5. Rejected and non-authoritative sources

The canonical rejection vocabulary, exact node evidence, owner reasons and
prohibited-reuse rules live in
[`plans/ganak-design-rejection-log.md`](ganak-design-rejection-log.md). This section
is only the short authority deny-list; it must not be expanded independently of that
register.

- `79:12` — visual drift from the approved master
- `47:2` — earlier rejected exploration
- `111:49` — superseded ordinary-day hero concept
- Local HTML palette galleries under `plans/mockups/` — historical exploration,
  not the current Figma authority
- Any frame labelled `EXPLORATION`, `SELECT ONE`, `OWNER REVIEW` or `REJECTED`
  until the owner explicitly approves that exact frame

## 6. Decision states

Every reviewable frame or component must have one state in its visible name:

- `EXPLORATION` — alternatives; never propagate
- `OWNER REVIEW` — complete candidate awaiting owner decision
- `APPROVED` — exact approved source; may be propagated within its stated scope
- `REJECTED` — archive only; never reuse
- `PARKED PHONE` — retained for future native-app evaluation; excluded from every
  website source, review and integration path

Do not use “selected,” “final,” or “master” as substitutes for `APPROVED` unless an
owner approval is recorded in this file or the prototype-state register.

## 7. Approval and propagation

The owner approves a system at the archetype/component level, not screen by screen.
After an approved component or archetype exists, the canonical integrator propagates it
without requesting cosmetic approval for each instance. Return to the owner only for
a new component, an exception to the approved system, or a genuine product/UX fork.

### Current two-screen quality gate — owner directive 2026-08-18

Before any broader propagation, the owner must approve two complete representative
responsive-website pilots: (1) Today/Panchang and (2) Festival/Vrat detail. Each
pilot must show the approved desktop website plus responsive-web proofs at 390px and
320px; English and Hindi; representative long, ordinary/special, sparse or error
states; exact approved website-source lineage; and honest limitations. The narrow
proofs must be derived from the website system, never from Ganak Phone/native shell
nodes. Lanes C and D may inventory/audit but must not continue screen production
until both pilots pass.

The live Ganak application is authoritative for working behavior, data, routes and
state preservation only. Its current visual hierarchy, styling and composition are
explicitly not design references for the redesign.

Before calling a batch ready, verify shared-component linkage, source-node identity,
EN/HI, responsive-web 390/320 and desktop states, long content,
empty/error/loading states, contrast, and the migration/placement gates. Record the
exact affected nodes and decision state in the handoff.

The owner-feedback recovery gate added 2026-08-19 is mandatory. Before any mutation,
each lane lists its applicable `GDF` IDs from
`plans/ganak-design-feedback-ledger.md`; every later handoff maps those IDs to exact
node/screenshot evidence. A candidate, wrapper or comparison board remains
`CHANGES REQUESTED` until the independent QA task
`01a018d9-dca3-70b3-a851-b46eccd965cf` passes the exact nodes against the approved
source at the same viewport/state. A GLOBAL or PATTERN item cannot close after one
screen is fixed; every existing affected candidate must be swept.

### Smallest owner-approval batch — owner directive 2026-08-19

The next owner-facing website batch is deliberately limited to two visual-direction
decisions: Today/Panchang desktop EN and Festival/Vrat detail desktop EN. Each has a
390px EN companion only to prove responsive mobile-web reflow; the 390px frame is not
a second design direction and is not Ganak Phone/native work. Hindi and 320px frames
also remain mandatory attached QA evidence, but none are additional visual decisions
for the owner. Only exact-node independent-QA `PASS` candidates may enter the
integrator-owned review surface, now named
`OWNER REVIEW · WEBSITE BASELINE · TODAY + VRAT`; failed, experimental,
parked-phone and production-interaction `CHANGES REQUESTED` work stays outside it.

The responsive shared system above was created before lane resumption. Its linked
EN/HI 390px proof has no text below 13px, no mapped target below 42px, no missing
font, no prohibited Phone/native instance, and a measured minimum text contrast of
5.3:1. Lane A and Lane B must instantiate these variants; a local redraw, detached
copy or scaled desktop shell is not acceptable evidence of shared lineage.

**Visual-direction review batch created 2026-08-19.** Independent QA passed the
visual-direction and accessibility gate on the exact primary source pairs after the
last contrast corrections. The integrator therefore created section `652:13736`, now
named `OWNER REVIEW · WEBSITE BASELINE · TODAY + VRAT`, containing only:

- Today/Panchang desktop EN `652:13737` <- candidate `601:9563`;
- Today/Panchang 390px EN `652:13989` <- candidate `601:8508`;
- Festival/Vrat detail desktop EN `652:14035` <- candidate `535:7265`;
- Festival/Vrat detail 390px EN `652:14120` <- candidate `544:8016`.

The desktop frames are the two owner visual-direction decisions. The 390px frames are
responsive-website QA companions only. On 2026-08-19 the owner rejected the minimal
vertical floral edge and detached lower-right ornament inside the ordinary-Today
panel, then clarified that both must be replaced rather than merely removed. The next
direct paste of Vrat botanical sweep `485:51` was also rejected: `485:51` is the
Festival/Vrat hero source, not the whole Ganak ornament vocabulary and not a universal
replacement.

The subsequent textile-bookplate correction was also rejected by the owner as an
invented composition that did not match the already-created vocabulary. Its nodes
`675:14247`–`675:14253` were removed from panel `652:13964`; rejected sweep
`666:14247` and the old fragments `652:13965`/`652:13967` remain hidden. No active
Today source or 390px companion was changed.

The exact historical twelve-treatment vocabulary board was recovered from the
recorded Figma mutation history at `682:22`, using the retained Figma image hashes
and the original approved source lineage. It is explicitly an archive, not an
approved screen or a new design direction. Do not apply any one treatment to Today
without a job-specific decision; the recovery exists to prevent another invented or
single-asset substitution.

This is not production-readiness approval. The source candidates remain
`CHANGES REQUESTED` for interaction implementation: several current Figma reactions
target internal prototype nodes or routes that do not yet exist in the production
router. Owner review of `652:13736` approves or rejects visual direction only; route,
state-preservation and interaction acceptance stay open under `GDF-009`, `GDF-011`,
`GDF-025` and `GDF-047`.

**Binding owner correction, 2026-08-19.** Most of the four-frame baseline is
approved/acceptable and its composition, content, hierarchy and responsive behavior
are frozen. Two recurrent defects alone were corrected:

1. the never-approved `Shashthi devotional mark` is hidden across every website-page
   occurrence: `116:400`, `277:961`, `513:6978`, `513:7319`, `562:8043`,
   `562:8296`, `562:8549`, `562:8864`, `562:9212`, `562:9560`, `562:9910`,
   `601:9802`, `622:10525`, `652:13974`; the page sweep reports zero visible
   occurrences and no substitute symbol was added; and
2. confirmed dull-ivory/off-system background drift in the four review frames was
   restored to approved-safe bases: canvas `#F9FCFD`, surface `#FFFFFF`, secondary
   `#ECF4F7`. This was a targeted correction, not a rule to make every surface pale
   blue. Navy, crimson, gold, botanical art and purposeful source-derived colour
   relationships were not changed.

The rejected mark and palette drift are recorded as `REJ-014` and `REJ-004` in the
canonical rejection log and as `GDF-057` / `GDF-012` in the regression ledger.
Parked Phone and archive `682:22` were not changed.

**Visual-vocabulary clarification, 2026-08-19.** Pale blue/clean white are safe
bases, not a three-colour prison. Section `707:14247`,
`OWNER REVIEW · VISUAL VOCABULARY`, is the compact pre-propagation decision surface.
It uses approved/current source fills plus recovered archive `682:22` to show role
palettes and contrast combinations, ornament families, placement/density rules,
three composition swatches, anti-vocabulary, controlled improvisation and exact
source references. It creates no new screen or production component. New work may
vary motif, density and colour balance only within a named, evidenced family and
role; a genuinely new family—or an old extraction in a new structural job—returns
to the owner.

**Ornament-family owner decision and shared V1, 2026-08-19.** The owner approved
the nine isolatable floral artworks in section `743:16083` as reusable vocabulary
elements, not universal placements. The owner also approved a cross-site family of
restrained structural border elements from the corrected AVIF: fine antique-gold
rules, narrow textile/lattice bands, clean crimson/navy/gold edge systems, subtle
corner/edge framing and single ending bands. Ornate arches, niches, temple-like
frames, elaborate cartouches/ribbons, scalloped crowns and similarly architectural
pieces are **Festival/Vrat-only ceremonial vocabulary**. They are not approved for
Today, Full Panchang, Calendar, Muhurat, Prashna or Jyotish.

The minimum stable shared library is section `753:2` on components page `38:3`:

- cross-site structural-border component set `759:20`, variants `757:6`, `759:2`,
  `759:4`, `759:6`, `759:8`, `759:10`, `759:12`, `759:14`, `759:16`, `759:18`;
- approved floral-vocabulary set `760:20`, variants `760:2`, `760:4`, `760:6`,
  `760:8`, `760:10`, `760:12`, `760:14`, `760:16`, `760:18`; and
- Festival/Vrat-only celebratory hero sweep `760:21`, preserving exact source
  `485:51` and approved hero composition `485:24`.

`Restrained` and `Rich` are contextual usage modes, not competing themes.
`Celebratory` is reserved for Festival/Vrat heroes. `Balanced` remains rejected
under `REJ-015`. Full invitation frames, repeated bands on every card, dull ivory,
detached stickers, invented devotional marks and ornament that competes with data
remain prohibited. The owner-review atlas classification is visible at `755:16083`.
Ceremonial non-floral components beyond the stable V1 are deferred rather than
locally redrawn by lanes.

## 8. Communication

All design feedback is durable only when added to this authority record, the
prototype-state register, feedback ledger, rejection log, or the applicable
canonical contract. Conversation-only decisions must be written here before another
task relies on them.

Specialist handoffs must include: exact node IDs; screenshots; what the owner
approved/rejected; shared components touched; unresolved decisions; and a clear
statement that the specialist has stopped writing to Figma.
