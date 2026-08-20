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
7. **The rejected stem is excluded whole and in part, everywhere.** Owner instruction,
   2026-08-20: *"that or any part of it shouldnt come on any screen."* This covers exact
   node `485:51`, image hash `b7559c796e972db13b8aa54daba3a1405264f488`, archived
   component `760:21` and child `760:22`, the faded crop of `REJ-017`, and **any fragment,
   partial crop, resize, recolour, trace, redraw or derivative of any of them**. A new
   piece may not quote a portion of it. This rule is unconditional and is not relaxed by
   any approval in §4, including §6.

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
| Today — non-hero panel, left | `FLORAL-SWEEP` | anchor | Restrained | Pre-authorised — owner, 2026-08-20; §3 rule 7 applies | No |
| Today — answer card edge | `FLORAL-SWEEP` | anchor | Restrained | Pre-authorised — owner, 2026-08-20; §3 rule 7 applies | Yes |

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

**Approved:** `FLORAL-SWEEP` in the `anchor` role at `Restrained` density is now legal on
**Today's non-hero left panel** and **Today's answer-card edge**. This is the first time a
floral family has been opened to an everyday screen.

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

**What this unblocks:** the recorded comparison for that panel (`811:18395`) chose
*"C — no added ornament"* because no other option was legal. It now has legal options, and
subsequent work there does not need to come back to the owner.

## 7. Enforcement

Every family member is a named component id and every slot is a named node, so this table
is machine-checkable: fail any ornament outside its slot's family, any `REQUIRED` slot left
empty, and any locally-cropped piece from an uncomponentized family. Note that the
`machineEnforcement` block in `plans/ganak-figma-prototype-state.json` is data with no
reader — nothing in the repository enforces it today, despite the `MACHINE ENFORCED`
label in the rejection log.
