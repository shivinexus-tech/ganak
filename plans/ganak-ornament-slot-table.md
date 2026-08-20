# Ganak — Ornament Slot Table

**Status:** draft, 2026-08-20. Replaces the rejection log as the *working* document for
placing ornament. The rejection log (`plans/ganak-design-rejection-log.md`) remains the
historical record and is not superseded as evidence.

## 1. The rule that makes this work

The rejection log is a **denylist**: it bans exact elements after the owner has seen and
rejected them, and it deliberately declines to generalise. Anything not yet listed is
therefore legal by default, so it can only ever prevent the last mistake, never the next
one. Ten owner-review rounds have been spent inside that loop.

This table inverts it.

> **An ornament may appear only if this table names it for that slot.
> Anything not named here is prohibited, without needing a rejection entry.**

Three consequences, all intended:

1. A brand-new wrong ornament is illegal on arrival. No rejection round required.
2. "Use your judgment" is removed. A slot offers a named list; there is nothing to invent.
3. Where a slot may not be empty, "no ornament" stops being an available answer.

## 2. Item register — active vocabulary

Names, numbers and roles transcribed from `ORNAMENT LIBRARY · COMPLETE INVENTORY ·
OWNER VIEW` (`800:2`), 2026-08-20.

### 2.1 Approved floral set (`760:20`) — **Festival / Vrat scope only**

| # | Name | Component | Recorded role |
|---|---|---|---|
| 01 | Side-growing Restrained | `760:2` | restrained side anchor; purposeful single placement |
| 02 | Side-growing Rich | `760:4` | rich editorial anchor; **not a universal edge** |
| 03 | Side-growing Editorial | `760:6` | story/editorial hero or section opening |
| 04 | Horizontal Botanical Transition | `760:8` | transition or section ending; use once with purpose |
| 05 | Vertical Climbing Vine | `760:10` | vertical structural path; content-aware placement |
| 06 | Bottom-right Corner Garden | `760:12` | corner anchor where composition supports it |
| 07 | Open Floral Arch | `760:14` | ceremonial/editorial only; **never a mandatory frame** |
| 08 | Wide Botanical Ending Band | `760:16` | ending or major transition; **never repeated on every card** |
| 09 | Deity-adjacent Foliage | `760:18` | deity-adjacent support; no compulsory full frame |

**Every one of the nine is scoped Festival/Vrat.** None is approved for Today, Full
Panchang, Muhurat, Prashna or Calendar.

### 2.2 Cross-site structural borders / rules (`759:20`) — usable on every screen

| # | Name | Component | Recorded role |
|---|---|---|---|
| 10 | Crimson Navy Gold Edge | `757:6` | restrained edge; selected page/section **boundary** |
| 14 | Twisted Gold Rule | `759:16` | fine structural **divider** |
| 17 | Powder Blue Lattice Band | `759:2` | restrained field/transition; **avoid repetition** |

Remaining variants of the set (`759:4`–`759:18`) carry the same restraint condition:
*"No wedding-card enclosure, no repeated band on every card."*

### 2.3 Not available for placement

| Group | Count | Why |
|---|---|---|
| Festival / Vrat ceremonial | 14 | Festival and Vrat screens only; *never imported into Today, Muhurat, Prashna* |
| Dividers, corners, frames, cartouches | 17 | Largely `EXPLORATION` source crops, e.g. `31 · Architectural Corner · Scalloped`, `35 · Broad Ceremonial Crown` — not production components |
| Textile exploration | — | e.g. `21 · Corrected-source Powder-blue Lattice` — *"not production component"* |
| Rejected / archive | 15 | Never, under any circumstance |
| Arches, niches, cartouches, **ribbons** | — | Recorded 2026-08-19 as uncomponentized: *"lanes may not crop them locally"* |

## 3. What this explains

**The empty left panel on ordinary Today was not an oversight.** The comparison recorded
at `811:18395` chose *"C — no added ornament"*. Given §2.1, that was the only legal
outcome available: no approved floral is scoped to Today, and the only cross-site items
are structural lines. The library is 68 items deep and roughly three of them are legal on
a non-festival screen.

**The ribbon complaints are role violations, not new rejections.** `14 · Twisted Gold
Rule` is approved cross-site — as a *fine structural divider*, a line between sections.
`10 · Crimson Navy Gold Edge` is approved as a *page or section boundary*. Both were
placed as decorative flourishes in spaces too small for them. The items are legal; the
roles are not. Nothing was checking role.

## 4. Slot table — Batch 01 desktop primaries

`REQUIRED` means the slot may not be empty. `—` means no ornament is permitted.

| Screen | Slot | Permitted items | May be empty |
|---|---|---|---|
| 01/02 Today | Masthead band | `10` or `17`, single instance | No |
| 01/02 Today | Context ribbon edge | `14` as a boundary line only | Yes |
| 01/02 Today | Non-hero panel, left | **none currently legal — see §5** | **blocked** |
| 01/02 Today | Footer band | full-width floral footer band | No |
| 03 Full Panchang | Masthead band | `10` or `17` | No |
| 03 Full Panchang | Section dividers | `14` between major sections only | Yes |
| 03 Full Panchang | Footer band | full-width floral footer band | No |
| 04 Calendar · 05/06 Festivals | Masthead, dividers, footer | as Full Panchang | — |
| 07 Festival story · 08 Vrat guide | Hero side anchor | `01`, `02` or `03` — one only | No |
| 07 Festival story · 08 Vrat guide | Section opening | `03` or `04` — once per page | Yes |
| 07 Festival story · 08 Vrat guide | Deity adjacency | `09` | Yes |
| 07 Festival story · 08 Vrat guide | Page ending | `08` — once, never per-card | Yes |
| 09 Muhurat hub · 10 Property finder | Masthead, dividers, footer | as Full Panchang | — |
| 09 Muhurat hub · 10 Property finder | Anywhere else | — | — |
| 11/12 Prashna | Masthead, dividers, footer | as Full Panchang | — |
| 11/12 Prashna | Anywhere else | — | — |
| **Any slot not listed above** | | **none** | — |

## 5. The decision this forces — owner

Today, Full Panchang, Muhurat, Prashna and Calendar have **no approved decorative
ornament at all**. Only structural edges, dividers and lattice bands are legal there.

Two honest options:

- **A · Accept it.** Non-festival screens are decorated structurally — edges, rules,
  lattice, floral footer — and stay visually quieter than Festival and Vrat. The Today
  left panel is then solved by layout, not ornament.
- **B · Approve a non-festival set.** Extend one or more of the nine floral items, or a
  new item, to cross-site scope with an explicit role and a restraint condition.

Until this is answered, "the panel looks empty" cannot be fixed by any agent, because
every available fix is prohibited. That is the actual blocker, and it has been sitting
underneath the last several iterations unrecorded.

## 6. Enforcement

This table is enforceable mechanically: every permitted item is a named component id, and
every slot is a named node. A check must fail a screen that renders an ornament outside
the list for its slot, and fail a `REQUIRED` slot that is empty. Note that the existing
`machineEnforcement` block in `plans/ganak-figma-prototype-state.json` is data only — no
program in the repository reads it, so today nothing is enforced despite the
`MACHINE ENFORCED` label in the rejection log.
