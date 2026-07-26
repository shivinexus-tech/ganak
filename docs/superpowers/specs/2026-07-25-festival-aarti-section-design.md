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

A festival can need **several** aartis (Diwali = Ganesh + Lakshmi + Om Jai Jagdish
Hare). So the field is an **optional array**, `aartis`:

```js
aartis: [
  { title: { en: "Ganesh Aarti — Jai Ganesh Deva", hi: "..." },
    intro: { en: "Sung first, invoking Ganesha before the main worship.", hi: "..." },
    verses: "..." },                                  // Devanagari, \n-separated lines
  { title: { en: "Lakshmi Aarti — Om Jai Lakshmi Mata", hi: "..." },
    intro: { en: "The Goddess's own aarti at the heart of the puja.", hi: "..." },
    verses: "..." },
  { title: { en: "Om Jai Jagdish Hare", hi: "..." },
    intro: { en: "The universal aarti that closes the worship.", hi: "..." },
    verses: "..." },
]
```

- `aartis` — an **ordered array**; order follows worship order (invocation → deity →
  universal close), per `plans/festival-aarti-standard.md` §2.
- Each entry: `verses` (single Devanagari string, line breaks preserved, identical in
  EN and HI — the aarti proper), `title` (bilingual toggle heading), `intro`
  (bilingual context; the `en` line is the "English meaning" shown in EN mode).
- The field is optional. Guides without it render exactly as today. Observances where
  a lamp-aarti does not apply (eclipses, Makar Sankranti Surya arghya, plain
  Ekadashi/Pradosh timing pages) intentionally carry **no** `aartis`.

If the `guide()` factory is used, thread `aartis` through it the same optional way
`safety` is threaded (`...(x.aartis ? { aartis: ... } : {})`).

Orthography and layout for all verses follow `plans/festival-aarti-standard.md`.

## Rendering

In `VratVidhiCard`, after the Puja section (`section(lbl("puja"), pujaBody)`) and
before the stories block, add:

```jsx
{data.aartis && data.aartis.length > 0 && (
  <div style={{ marginTop: 8 }}>
    <div style={{ ...T.label, color: C.gold, marginBottom: 3 }}>{lbl("aarti")}</div>
    {data.aartis.map((a, i) => (
      <details key={i} style={{ borderTop: `1px solid ${C.line}`, paddingTop: 8, marginTop: i ? 6 : 0 }}>
        <summary style={{ color: C.gold, fontWeight: 700, cursor: "pointer" }}>
          {txt(a.title)}
        </summary>
        {a.intro && txt(a.intro) && (
          <div style={{ fontSize: T.fMicro, color: C.muted, lineHeight: 1.5, margin: "6px 0" }}>
            {txt(a.intro)}
          </div>
        )}
        <div style={{ whiteSpace: "pre-line", fontSize: T.fSmall, color: C.ivory,
                      lineHeight: 1.7, marginTop: 6 }}>
          {a.verses}
        </div>
      </details>
    ))}
    <div style={{ fontSize: T.fMicro, color: C.muted, lineHeight: 1.5, marginTop: 8 }}>
      {lbl("aartiDisclaimer")}
    </div>
  </div>
)}
```

Each aarti is its own collapsible; the section header (`aarti` label) sits above the
list, and **one** small muted disclaimer sits at the bottom of the whole block —
"widely-sung version; your family's wording may differ" (`aartiDisclaimer` label),
never per-verse.

New labels in `VRAT_VIDHI_LABELS`:
```js
aarti: { en: "Aarti (devotional lamp-song)", hi: "आरती" },
aartiDisclaimer: {
  en: "This is a widely-sung version; your family's wording may differ.",
  hi: "यह व्यापक रूप से गाई जाने वाली आरती है; आपके परिवार की परम्परा में शब्द भिन्न हो सकते हैं।",
},
```
`whiteSpace: "pre-line"` preserves the `\n` line breaks per verse. The block reuses
existing tokens; no new colors. Verified against the card's `overflow: hidden`
container — long Devanagari lines wrap, no horizontal overflow.

## Phase 1 scope — North Indian deity aartis

Order: **Ganesh invocation → deity aarti(s) → closing aarti**, where the **closing
aarti is chosen by deity family** (owner rule, 2026-07-26; `festival-aarti-standard.md`
§2): Vishnu-family → *Om Jai Jagdish Hare*; Shiva/Shakti-family → *Om Jai Shiv Omkara*;
Hanuman → the Rama aarti. If the deity aarti already *is* the family closer, it is not
repeated. **Owner-confirmed final** `aartis` set per guide slug (2026-07-26, all cells
resolved incl. Janmashtami/Govardhan research):

| Guide key | Family | Aartis (in order) |
|-----------|--------|-------------------|
| `diwali` | Vishnu (Lakshmi) | Ganesh · Lakshmi (*Om Jai Lakshmi Mata*) · *Om Jai Jagdish Hare* |
| `dhanteras` | Vishnu (Lakshmi) | Ganesh · Lakshmi (*Om Jai Lakshmi Mata*) · *Om Jai Jagdish Hare* |
| `ganeshChaturthi` | Ganesh | Ganesh (*Jai Ganesh Deva*) — only |
| `janmashtami` | Vishnu (Krishna) | Ganesh · Krishna (*Aarti Kunj Bihari ki*) · *Om Jai Jagdish Hare* |
| `govardhanPuja` | Vishnu (Krishna) | Ganesh · **Govardhan (*Shri Govardhan Maharaj*)** · *Om Jai Jagdish Hare* |
| `ramNavami` | Vishnu (Rama) | Ganesh · Rama (*Aarti Kije Ramchandra ji ki*) · *Om Jai Jagdish Hare* |
| `hanumanJ` | Hanuman | Hanuman (*Aarti Kije Hanuman Lala ki*) · Rama |
| `sharadNavratri`, `chaitraNavratri` | Shakti (Durga) | Ganesh · Durga (*Jai Ambe Gauri*) · Durga (*Ambe Tu Hai Jagdambe Kaali*) · *Om Jai Shiv Omkara* |
| `mahaShivaratri`, `masikShivaratri`, `pradosh` | Shiva | Ganesh · Shiva (*Om Jai Shiv Omkara*) |
| `karvaChauth` | Shakti (Gauri) | Ganesh · Gauri/Karva Mata · *Om Jai Shiv Omkara* |
| `ahoiAshtami` | Shakti (Ahoi Mata) | Ganesh · Ahoi Mata · *Om Jai Shiv Omkara* |
| `hartalikaTeej` | Shiva+Shakti | Ganesh · Shiva (*Om Jai Shiv Omkara*) · Gauri |
| `purnima` (Satyanarayan) | Vishnu | Ganesh · Satyanarayan (*Jai Lakshmi Ramana*) · *Om Jai Jagdish Hare* |

Reusable named texts — **defined once and referenced** by every guide that lists them,
no duplication:
- Ganesh — *Jai Ganesh Deva*
- *Om Jai Jagdish Hare* (Vishnu-family close)
- *Om Jai Shiv Omkara* (Shiva/Shakti-family close; also Shiva deity aarti)
- Krishna — *Aarti Kunj Bihari ki*
- Rama — *Aarti Kije Ramchandra ji ki*
- Durga — *Jai Ambe Gauri* and *Ambe Tu Hai Jagdambe Kaali*

Festival-specific (single-use) texts: Lakshmi *Om Jai Lakshmi Mata*, Govardhan *Shri
Govardhan Maharaj*, Hanuman *Aarti Kije Hanuman Lala ki*, Satyanarayan *Jai Lakshmi
Ramana*, Gauri/Karva Mata, Ahoi Mata.

Content notes for the sourcing pass:
- `karvaChauth` (Karva Mata) and `ahoiAshtami` (Ahoi Mata) aartis are more regionally
  variable than the big-deity ones — give them extra source care.
- `drikpanchang.com` (already an app sourcing host) carries most of these texts and is
  a good anchor for cross-validation.

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

New `validation/festival-aarti.cjs` asserts, per `plans/festival-aarti-standard.md`
§5, for every Phase-1 guide key:

1. A non-empty `aartis` **array** exists; each entry has non-empty `title`, `intro`,
   `verses`.
2. Each `verses` contains Devanagari (Unicode range `ऀ–ॿ`) and is multi-line (at
   least 4 `\n`-separated non-empty lines) — catches empty/placeholder/garbled.
3. **Orthography checks:** reject `ओम्` in verses (must be `ॐ`); reject Latin letters
   inside verse text.
4. A **first-line anchor** per named aarti (e.g. the Diwali Lakshmi aarti starts with
   `ॐ जय लक्ष्मी माता`, its Ganesh aarti with `जय गणेश`) — catches a wrong/swapped
   aarti.
5. Guides intentionally without aarti (eclipses, Makar Sankranti, plain Ekadashi)
   are **not** required to have one (explicit allow-list, so the gate can't be
   satisfied by silently dropping the field).

Gate is added to the standard `.cjs` suite. Existing festival gates
(`festival-row-29`, devotional-language gates) must stay green.

## Files touched

- `src/data/major-festival-guides.ts` — add `aartis` to relevant `guide({...})`
  calls; thread `aartis` through the `guide()` factory.
- `src/data/vrat-vidhis.ts` — add `aarti` + `aartiDisclaimer` labels to
  `VRAT_VIDHI_LABELS`; add `aartis` to inline base guides (e.g. `diwali`,
  `mahaShivaratri`, `ganeshChaturthi`, …).
- `src/components/VratVidhiCard.tsx` — render the aarti list (one collapsible each)
  with the single bottom disclaimer.
- `validation/festival-aarti.cjs` — new structure + Devanagari + orthography + anchor
  gate.
- `plans/festival-aarti-standard.md` — rendering/orthography/sourcing standard (done).
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
