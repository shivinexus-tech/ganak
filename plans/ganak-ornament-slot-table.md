# Ganak — Ornament Slot Table

**Status:** revised 2026-08-20, replacing the 2026-08-20 draft. Working document for
placing and commissioning ornament. The rejection log
(`plans/ganak-design-rejection-log.md`) remains the historical record.

## 1. What the first draft got wrong

The first draft read the nine approved floral items as scoped Festival/Vrat, found no
floral legal on Today, and concluded the owner had to choose between accepting bare
non-festival screens and widening the scope of existing pieces.

That framing was wrong, because it missed the rule already on file:

> **Controlled improvisation.** New work may vary motif, density and colour balance
> within named evidenced families and roles. A genuinely new family, or an existing
> extraction used in a new structural job, returns to the owner.

Generating new ornament inside an approved family was never prohibited. The library was
never meant to be a fixed set of nine.

Two further facts from the record:

- The approved floral family (`743:16083`) reports `screenDesignsCreated: 0`,
  `screensChanged: 0`. Nine finished, isolatable, transparent artworks were approved on
  2026-08-19 and applied to **zero** screens.
- The nine are **isolatable transparent assets**, not crops — the family is generative by
  construction.

So the missing artefact was never a wider denylist or a scope extension. It is the
mapping below: ornaments are catalogued by **family and role**, screens are described by
**slot**, and nobody had written the line between the two vocabularies. Every agent
therefore invented that mapping per round, which is the variance the owner has been
rejecting.

## 2. The three vocabularies this table joins

**Families** — evidenced groups, not interchangeable assets:

| Family | Members | Scope today |
|---|---|---|
| `FLORAL-SWEEP` | side-growing restrained / rich / editorial | Festival, Vrat |
| `FLORAL-STRUCTURE` | vertical climbing vine, bottom-right corner garden, open floral arch | Festival, Vrat |
| `FLORAL-TRANSITION` | horizontal botanical transition, wide botanical ending band | Festival, Vrat |
| `FLORAL-SUPPORT` | deity-adjacent foliage | Festival, Vrat |
| `RULE` | fine antique/luminous-gold rules | cross-site |
| `EDGE` | crimson/navy/gold edge systems | cross-site |
| `LATTICE` | narrow textile/lattice bands | cross-site |
| `CORNER` | subtle connected corners/edges | cross-site |
| `ENDING` | single ending bands | cross-site |
| `CEREMONIAL` | arches, niches, temple frames, cartouches, ribbons, scalloped crowns | Festival, Vrat only — **currently uncomponentized** |

**Roles** — the structural job a piece performs: `anchor`, `path`, `transition`,
`boundary`, `divider`, `field`, `ending`, `support`.

**Density modes** — `Restrained` and `Rich` are approved. `Celebratory` is Festival/Vrat
hero only. `Balanced` is rejected: the owner's reason, restated 2026-08-20, is that it
carried no structure.

## 3. Rules every new piece must satisfy

1. **Connected, never floating.** A detached flourish is rejected on sight
   (`REJ-007`). Ornament attaches to a content edge, a corner or a boundary it shares
   with real content.
2. **Structure before decoration.** This is what separates `Restrained` and `Rich`, which
   the owner approved, from `Balanced`, which he rejected.
3. **Scoped by archetype.** A Festival asset is not a Today asset (`REJ-008`).
4. **Retrieval before generation.** Check the family for an existing piece that fits the
   role before making a new one (`REJ-009`).
5. **Never competes with data.** Ornament loses to any timing, date or value.
6. **No repetition.** No band on every card; no universal edge; no full enclosure.
7. **The faded coral stem is excluded by resemblance, not only by identity.** Owner
   instruction, 2026-08-20, shown against the element itself: *"i dont want it on any
   screen ... any part of this ... any similarity to this not allowed - hated this colour
   and everything about it."*

   **Identity.** Exact node `485:51`, image hash
   `b7559c796e972db13b8aa54daba3a1405264f488`, archived component `760:21` and child
   `760:22`, the `REJ-017` crop signature (an `88x446` clipped wrapper over a `1536x1119`
   raster at `x=-21,y=-253`), and any fragment, partial crop, resize, recolour, trace,
   redraw or derivative. A new piece may not quote a portion of it.

   **Resemblance.** Independently of lineage, no ornament on any screen may use this
   palette: **faded coral / salmon / orange-red blooms, washed-out sage green foliage,
   thin gold curl tendrils, on an ivory or cream ground.** Shape is not the test and is
   not restricted — a tall, narrow, vertical, side-growing or climbing botanical remains
   permitted in Ganak's own colours.

   **The distinguishing test.** Ganak's approved florals are deep crimson blooms with
   strong green foliage on white or pale blue. The rejected element is faded coral on
   ivory. If a piece reads as the second, it fails regardless of where it came from.
   This is consistent with `REJ-004`, which already rejected a dominant dull ivory/cream
   atmosphere.

   **Supersession.** `REJ-017` recorded that the owner rejected only the exact element and
   had cancelled any categorical rejection of vertical, tall, narrow, side-growing or
   botanical compositions. The shape half of that narrowing stands. The colour half does
   not: the owner has now extended the rejection to visual resemblance in the palette
   above. Where this entry and `REJ-017` conflict, this entry governs.

   **Grounds.** Per `REJ-004A`, the ivory/cream ground is rejected independently of the
   ornament, everywhere and at any size — page canvas, card and panel surfaces, ribbons,
   context bands, ornament backings and exported artwork. The owner identifies this ground
   as the primary reason Ganak reads dull. Approved grounds are cool: `#F9FCFD`, `#FFFFFF`,
   `#ECF4F7`. Any new ornament must be produced on a transparent or cool ground.

   This rule is unconditional, applies to every slot in §4, and is not relaxed by any
   approval in this document, including §6.

## 4. The slot table

`Pre-authorised` = a new piece may be generated for this slot without returning to the
owner, provided it is in the named family and role. `Owner` = the slot needs one
authorisation before any new work, because it puts a family into a job it has not held.

### 4.1 Cross-site — Today, Full Panchang, Calendar, Festivals list, Muhurat, Property finder, Prashna

| Slot | Family | Role | Mode | New work | Empty |
|---|---|---|---|---|---|
| Masthead band | `EDGE` or `LATTICE` | boundary | Restrained | Pre-authorised | No |
| Context ribbon top/bottom | `RULE` | boundary | Restrained | Pre-authorised | No |
| Between major sections | `RULE` | divider | Restrained | Pre-authorised | Yes |
| Card or panel corner | `CORNER` | anchor | Restrained | Pre-authorised | Yes |
| Page ending, above footer | `ENDING` | ending | Restrained | Pre-authorised | Yes |
| Footer band | `FLORAL-TRANSITION` | ending | Rich | Pre-authorised | No |
| Today — non-hero panel, left | None in the current composition | — | — | Family permission does not override the completed A/B/C comparison; §6 | **Yes — selected** |
| Today — special hero lower-right / answer-card edge | None in the current composition | — | — | Removed source-first after cold art-direction finding; no substitute; §6 | **Yes — selected** |

### 4.2 Festival and Vrat screens

| Slot | Family | Role | Mode | New work | Empty |
|---|---|---|---|---|---|
| Hero side anchor | `FLORAL-SWEEP` | anchor | Restrained or Rich | Pre-authorised | No |
| Hero vertical path | `FLORAL-STRUCTURE` | path | Rich | Pre-authorised | Yes |
| Deity adjacency | `FLORAL-SUPPORT` | support | Restrained | Pre-authorised | Yes |
| Section opening | `FLORAL-SWEEP` | transition | Rich | Pre-authorised | Yes |
| Section ending | `FLORAL-TRANSITION` | transition | Restrained | Pre-authorised | Yes |
| Corner anchor | `FLORAL-STRUCTURE` | anchor | Rich | Pre-authorised | Yes |
| Page ending | `FLORAL-TRANSITION` | ending | Rich | Pre-authorised, once only | Yes |
| Ceremonial crown or arch | `CEREMONIAL` | anchor | Celebratory | **Owner** — family is uncomponentized; local crops are prohibited | Yes |
| Masthead, rules, footer | as §4.1 | — | — | — | — |

### 4.3 Everywhere else

Any slot not named above takes **no ornament**. This replaces the previous default, under
which anything not yet rejected was permitted.

## 5. What a job for a slot now looks like

Because family, role, mode and slot are all named, a commission is a sentence with no
judgment left in it:

> Generate one new `FLORAL-SWEEP` piece for the Festival hero side anchor.
> Role: anchor. Mode: Rich. Connected to the headline's left edge, not floating.
> Source-inspired within the approved family. Isolatable transparent asset.
> Do not place it on any other slot.

Compare with the instruction that produced ten rejected rounds: *"replace those floral
stems with something better."*

An agent that cannot name the family, role, mode and slot for a piece it is about to
place has not been given a job yet, and must ask rather than choose.

## 6. Owner decision — recorded 2026-08-20

**Family permission, not a placement requirement:** `FLORAL-SWEEP` in the `anchor`
role at `Restrained` density may be considered for Today's non-hero left panel and
special hero/answer-card edge. That permission never establishes that either current
composition needs an ornament.

The approval covers both routes:

- **Existing family members** — `01 Side-growing Restrained` (`760:2`) and its siblings at
  restrained density — may now be placed in these two slots. Under controlled
  improvisation this was previously an owner decision, because it puts an existing
  extraction into a new structural job. That decision is this entry.
- **Newly generated pieces** in the same family, role and density are pre-authorised and
  do not return to the owner.

**Excluded without exception:** the rejected stem, whole or in part, per §3 rule 7. The
owner attached this condition to the approval itself — the approval opens the family, not
the rejected asset or any fragment of it.

**Current operational decisions supersede placement:** the same-screen comparison
`811:18395` chose C `811:19095` — no added ornament — because it was compositionally
strongest. A and B used valid library families but were rejected for this Today slot on
density, backing and role, not because the families were illegal. Current ordinary
Today therefore keeps that slot empty. Current Today special also keeps its lower-right
slot empty after the pasted flourish was removed source-first without replacement and
the resulting composition passed cold art-direction review. Any future ornament in
either slot requires a fresh same-screen comparison and independent review; the family
permission above is not an automatic placement, propagation instruction or machine
`requiredPlacements` rule.

## 7. Enforcement

Every family member is a named component id and every slot is a named node, so this table
is machine-checkable: fail any ornament outside its slot's family, any `REQUIRED` slot left
empty, and any locally-cropped piece from an uncomponentized family. Note that the
`machineEnforcement` block in `plans/ganak-figma-prototype-state.json` is data with no
reader — nothing in the repository enforces it today, despite the `MACHINE ENFORCED`
label in the rejection log.
