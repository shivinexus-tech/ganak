# Festival Aarti Section — Design

**Date:** 2026-07-25
**Author:** Claude Code (owner-directed)
**Status:** Approved design → ready for implementation plan

## Problem

The Fasts & Festivals full guides (rendered by `VratVidhiCard`) walk a fixed set
of worship sections — verdict, meaning, vidhi, diet, sankalpa, puja, stories,
regional, paran, udyapan — but never give the household the **aarti** itself: the
devotional lamp-song sung at the close of the puja. Users following the guide
have to leave the app to find the words. The owner wants the full aarti lyrics
available in-app, on each relevant festival, in Devanagari.

## Owner decisions (brainstorming, 2026-07-25)

1. **Content:** full aarti **lyrics** (the complete Devanagari song text), not a
   how-to note or an external link.
2. **Scope, phased:** *Phase 1* — all North Indian festivals and vrats that have a
   deity lamp-aarti. *Phase 2* — the remaining/regional observances.
3. **Format:** **Devanagari always**, identical in both language modes (an aarti is
   sung in the original). In **English mode**, a short English meaning/intro line
   sits above the verses. Verses are never transliterated or translated line-by-line.
4. **Placement:** immediately **after the Puja section**, as a **collapsible**
   toggle (tap to expand), matching the existing Shodashopachara `<details>` pattern.
5. **Reach:** appears **everywhere the full guide renders** — the in-app Fasts &
   Festivals list *and* the shareable standalone `/festival/...` guide routes, since
   both render the same `VratVidhiCard`. No per-surface gating.

## Architecture context

- `VratVidhiCard` ([src/components/VratVidhiCard.tsx](../../../src/components/VratVidhiCard.tsx))
  renders each guide's sections from a data object. Section labels come from
  `VRAT_VIDHI_LABELS` in [src/data/vrat-vidhis.ts](../../../src/data/vrat-vidhis.ts).
- Guide content lives as bilingual `{ en, hi }` objects. `MAJOR_FESTIVAL_GUIDES`
  ([src/data/major-festival-guides.ts](../../../src/data/major-festival-guides.ts))
  supplies 17 guides via a `guide()` factory; more base guides are defined inline in
  `VRAT_VIDHI`, then merged with Durga/Sequence/Grahan guide sets.
- `FestivalGuideScreen` renders `VratVidhiCard` for both the in-app list and the
  standalone routes, so a new card section reaches both automatically.

**Pre-flight (task-log):** the ACTIVE `CURSOR-P0-FESTIVAL-HERO-ART-01` lane owns
`festival-hero-art.ts`, `FestivalHeroImage.tsx`, `public/festival-images/**` and its
gates — **none** of the files below. Backlog row #29 holds the festival/fast pages at
quality-Red, so aarti content must be sourced, reviewed, and gated. This is a clean,
non-overlapping lane requiring its own reserved task-log row before editing.

## Data model

A new **optional** field on any guide object:

```js
aarti: {
  title: { en: "Aarti of Lakshmi — Om Jai Lakshmi Mata", hi: "श्री लक्ष्मी जी की आरती" },
  intro: { en: "Sung at the close of the puja while circling the lamp before the Goddess.",
           hi: "पूजा के अंत में देवी के सम्मुख दीपक घुमाते हुए गाई जाती है।" },
  verses: "ॐ जय लक्ष्मी माता,\nमैया जय लक्ष्मी माता।\n…"   // Devanagari, \n-separated lines
}
```

- `verses` — a **single Devanagari string**, line breaks preserved, rendered
  identically in EN and HI. This is the aarti proper.
- `title` — bilingual heading for the collapsible toggle.
- `intro` — short bilingual context line. In EN mode the `en` line supplies the
  "English meaning". In HI mode the `hi` line shows (or is omitted if empty).
- The field is optional. Guides without it render exactly as today. Observances
  where a lamp-aarti does not apply (eclipses, Makar Sankranti Surya arghya, plain
  Ekadashi/Pradosh timing pages) intentionally carry **no** `aarti`.

If the `guide()` factory is used, thread `aarti` through it the same optional way
`safety` is threaded (`...(x.aarti ? { aarti: ... } : {})`).

## Rendering

In `VratVidhiCard`, after the Puja section (`section(lbl("puja"), pujaBody)`) and
before the stories block, add:

```jsx
{data.aarti && (
  <details style={{ marginTop: 8, borderTop: `1px solid ${C.line}`, paddingTop: 8 }}>
    <summary style={{ color: C.gold, fontWeight: 700, cursor: "pointer" }}>
      {txt(data.aarti.title) || lbl("aarti")}
    </summary>
    {data.aarti.intro && txt(data.aarti.intro) && (
      <div style={{ fontSize: T.fMicro, color: C.muted, lineHeight: 1.5, margin: "6px 0" }}>
        {txt(data.aarti.intro)}
      </div>
    )}
    <div style={{ whiteSpace: "pre-line", fontSize: T.fSmall, color: C.ivory,
                  lineHeight: 1.7, marginTop: 6 }}>
      {data.aarti.verses}
    </div>
  </details>
)}
```

New label in `VRAT_VIDHI_LABELS`:
```js
aarti: { en: "Aarti (devotional lamp-song)", hi: "आरती" },
```
`whiteSpace: "pre-line"` preserves the `\n` line breaks without needing an array.
The block reuses existing tokens; no new colors. Verified against the card's
`overflow: hidden` container — long Devanagari lines wrap, no horizontal overflow.

## Phase 1 scope — North Indian deity aartis

Guides that get an `aarti` in Phase 1 (each keyed to its guide slug):

| Guide key | Deity / aarti |
|-----------|---------------|
| `diwali` | Lakshmi — *Om Jai Lakshmi Mata* |
| `dhanteras` | Dhanvantari / Lakshmi |
| `govardhanPuja` | Krishna / Govardhan |
| `ganeshChaturthi` | Ganesha — *Jai Ganesh Deva* |
| `janmashtami` | Krishna — *Aarti Kunj Bihari ki* |
| `ramNavami` | Rama — *Shri Ramchandra Kripalu* (aarti form) |
| `hanumanJ` | Hanuman — *Aarti Kije Hanuman Lala ki* |
| `sharadNavratri`, `chaitraNavratri` | Durga — *Jai Ambe Gauri* |
| `mahaShivaratri`, `masikShivaratri`, `pradosh` | Shiva — *Om Jai Shiv Omkara* |
| `karvaChauth` | Gauri / Karva Mata |
| `ahoiAshtami` | Ahoi Mata |
| `hartalikaTeej` | Gauri–Shankar |
| `purnima` (Satyanarayan) | Vishnu — *Om Jai Jagdish Hare* |

Exact final list is confirmed during implementation against which keys actually
render a full guide; any key without a clean, standard North Indian aarti is deferred
to Phase 2 rather than padded. Phase 2 covers Rath Yatra, Ugadi/Gudi Padwa, Chhath,
Skanda/Kanda Sashti, Ayyappa, Buddha Purnima, and other regional observances.

## Content quality & sourcing (the substantive work)

Aarti texts are traditional, widely-published devotional songs (effectively
traditional/public-domain). Method (owner-directed 2026-07-25):

- **Cross-validate 2–3 authentic sources against each other** per aarti; enter the
  most widely-sung standard Devanagari text with zero transcription errors.
- **Record the sources used per aarti** in a citations doc (mirroring
  `plans/major-festival-guide-research.md`) so proof-reading is auditable and the
  gate can cite provenance.

Known challenge classes to handle explicitly:

- **Regional/sampradaya wording variants** — the same aarti differs by region/sect.
  Choose the common version and add a non-prescriptive "your family's wording may
  differ" note, consistent with the app voice and the existing `regional` sections.
- **Festival→aarti mapping** — some festivals have a general and a deity-specific
  aarti; decide the canonical one editorially, and allow more than one where genuine.
- **Devanagari orthography consistency** — sources agree on words but differ on
  spelling (ॐ vs ओम्, anusvara vs chandrabindu, half-letters, nukta). Fix one house
  orthographic standard so aartis look consistent across the app.
- **Provenance / copyright** — confirm each is genuinely traditional/public-domain,
  not a modern copyrighted arrangement; note authorship where known (e.g. *Om Jai
  Jagdish Hare*, Pt. Shardha Ram Phillauri, 1870).

Passes the row-#29 quality bar: independent EN/HI review, two-agent bug bash,
production verification. Backlog: `P1-FESTIVAL-AARTI-CONTENT`.

## Validation gate

New `validation/festival-aarti.cjs` asserts, for every Phase-1 guide key:

1. An `aarti` object exists with non-empty `title`, `intro`, and `verses`.
2. `verses` contains Devanagari (Unicode range `ऀ–ॿ`) and is multi-line
   (at least 4 `\n`-separated non-empty lines) — catches empty/placeholder/garbled
   entries.
3. A **first-line anchor** per aarti (e.g. `diwali` verses start with `ॐ जय लक्ष्मी माता`)
   — catches a wrong or swapped aarti.
4. Guides intentionally without aarti (eclipses, Makar Sankranti, plain Ekadashi)
   are **not** required to have one (explicit allow-list, so the gate can't be
   satisfied by silently dropping the field).

Gate is added to the standard `.cjs` suite. Existing festival gates
(`festival-row-29`, devotional-language gates) must stay green.

## Files touched

- `src/data/major-festival-guides.ts` — add `aarti` to relevant `guide({...})` calls;
  thread `aarti` through the `guide()` factory.
- `src/data/vrat-vidhis.ts` — add `aarti` label to `VRAT_VIDHI_LABELS`; add `aarti`
  to inline base guides (e.g. `diwali`, `mahaShivaratri`, `ganeshChaturthi`, …).
- `src/components/VratVidhiCard.tsx` — render the collapsible aarti block.
- `validation/festival-aarti.cjs` — new structure + Devanagari + anchor gate.
- `plans/task-log.md` — reserved row for this lane.

## Testing / gates

- New `validation/festival-aarti.cjs` RED→GREEN with a prove-the-guard step
  (blank a `verses` string → gate fails → restore).
- Full `.cjs` suite: no new reds beyond the known pre-existing hero-art/other-lane
  failures noted in the task log.
- Production build passes.
- Browser check on the dev server (`kundli-dev`), EN + HI, 375px: open a Phase-1
  festival guide (e.g. Diwali), confirm the Aarti toggle appears after Puja, expands
  to Devanagari verses, English intro shows in EN mode, no 375px horizontal overflow,
  0 console errors. Repeat on a standalone `/festival/...` route.

## Out of scope (tracked separately)

This spec covers **aarti-in-guide** only. Related work is separate backlog items:

- **Aarti discoverability UI** (`P1-FESTIVAL-AARTI-FINDER`) — a dedicated aarti
  finder/index, input-driven navigation (search a deity/festival → its aarti), and
  stable per-aarti deep-links. Its own spec/plan later.
- **Aarti SEO** (`P1-FESTIVAL-AARTI-SEO`) — per-aarti titles, meta and structured
  data; depends on the finder/deep-link routes.
- **Phase 2 regional aartis** — remaining/regional observances, follow-up content pass.

Also out of scope here:

- Transliteration or line-by-line translation of verses (owner chose Devanagari-only).
- Audio playback / sing-along timing.
- Any change to hero-art files (owned by the ACTIVE Cursor lane).
