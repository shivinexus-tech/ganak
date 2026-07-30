# Handoff: multi-creator knowledge base for Kundli life interpretation

## The problem
Build a persistent, **multi-creator Vedic-astrology knowledge base** — synthesised from popular
YouTube teachers (KRS / Kapiel Raaj, Lunar Astro, Saptarishis Astrology, and other well-known
ones) **alongside the classical texts** (Brihat Parashara Hora Shastra, Phaladeepika) — and use it
as the source layer for the app's answer-first Chart interpretation copy.

Per placement, the KB should capture real, source-backed traits for all **39 placements**
(27 nakshatras + 12 signs, each sign in both its Moon role and its Lagna/rising role), with source
provenance, and feed both the current 3–4-line summary card and the planned "tap for more" deep view.

## The crux (why this is being handed off)
The knowledge these teachers put out lives mostly in their **YouTube videos**, and from the Claude Code
sandbox those videos are **unreachable** — tested three ways, all blocked:
- `WebFetch` on the watch page → only nav/footer HTML (transcript is JS-rendered, absent).
- A public transcript service (youtubetranscript.com) → **HTTP 403**.
- YouTube `timedtext` captions API → **empty**.

The **written** footprint (creator sites, article write-ups, Substacks that synthesise the same school)
IS fetchable and was used for the current copy — but the creators' **video-only** synthesis is not.

**What to solve:** a reliable pipeline to pull the actual teaching from these creators' videos at scale.
Likely candidates a less-restricted environment can use: the `youtube-transcript-api` Python package,
`yt-dlp --write-auto-sub --skip-download`, an official YouTube Data API + captions, or a paid
transcript/LLM service. Then synthesise per-placement traits **across multiple creators** into the KB.

## Product context
The Chart screen shows an answer-first life reading — six areas (Nature & temperament, Mind & emotions,
Strengths, How you relate, Work leanings, How others see you) driven by the person's **Janma Nakshatra,
Moon sign, and Lagna sign**. Copy is **bilingual (English + Hindi)**, written as **attribution**
("Classical texts associate…", never "You are…"), and sits behind an **owner-verified gate** (hidden
until the owner approves each entry). The owner wants the trait content to reflect the depth of these
well-known teachers — not generic astrology sites or an AI's memory.

## Current state (what already exists)
- **`src/data/life-interpretation.ts`** — 27 nakshatra + 12 sign entries (EN+HI). Current copy was
  enriched from written web sources ("round 3"). **This is uncommitted, in worktree branch
  `claude/kundli-life-interpretation`.** The version squash-merged to `main` earlier is the older,
  thinner copy — start from the worktree copy, not `main`.
- **`docs/interpretation-knowledge-base.md`** — the standing KB: 91 synthesised trait records +
  sourcing method/provenance. Extend this.
- **`validation/life-interpretation-copy.cjs`** — the gate: completeness, a bilingual **safety
  register** (no health/death/money/marriage/fear/body-shaming claims), a **rejected-word guard**
  (owner-struck wording), the `buildLifeReading` contract, and non-vacuous self-tests. Must stay green.
- **`plans/kundli-interpretation-review.md`** — owner review checklist.
- **`.scratch/traits.md`** — the raw corpus (same content as the KB).

## Constraints (must hold)
1. **Copyright** — synthesise facts across **many** creators in **original wording**. Never reproduce
   one creator's script/verbatim phrasing into the product. Trait associations aren't copyrightable;
   specific expression is.
2. **Attribution honesty** — the card cites "Brihat Parashara Hora Shastra; Phaladeepika". Keep that
   only for genuinely classical traits. Where a trait is a creator's personal/idiosyncratic take,
   omit it or adjust the credit — don't cite a classical text for a YouTuber's opinion.
3. **Natural bilingual Hindi** — everyday register, not stiff tatsama. The owner has already rejected:
   अगुआई, ऊष्म/ऊष्ण-forms, अभिव्यंजक, सर्वाधिक, प्रथम-छवि, बहादुर मन, द्वारा शासित, and English "the
   tradition" / "lean … toward". The gate's rejected-word guard enforces these — add to it, don't weaken it.
4. **Trait accuracy per sign/nakshatra** — traits must actually fit. Known owner corrections:
   Cancer = *emotional* (not thoughtful); "thoughtful" belongs to Virgo/Taurus/Capricorn/Pisces;
   Sagittarius = *adventurous* (not thoughtful). Multi-creator sourcing exists precisely to get this right.
5. **Format** — summary card is **3–4 lines per area**; the KB holds the deeper material for the future
   expandable view. Don't bloat the card.
6. **No engine change** — the reading reads only `r.moon.nak`, `r.moon.sign`, `r.ascSign`.
7. **Gate green** — `node validation/life-interpretation-copy.cjs` must pass (prefix Node with
   `export PATH="/opt/homebrew/bin:$PATH"`), plus the canonical gates and `npm run build`.
8. **Gating / owner sign-off** — content stays behind the owner-verified gate; the owner validates
   before anything is user-visible.

## Definition of done
- KB (`docs/interpretation-knowledge-base.md`) extended with per-placement traits **synthesised from
  multiple named creators + classical**, each with source provenance.
- `src/data/life-interpretation.ts` regenerated from the KB — EN+HI, accurate, natural, gate green,
  no verbatim reproduction, attribution honest.
- Owner validates the enriched copy.

## The one clean shortcut for creator-specific nuance
Where a creator's insight lives only in a video that can't be transcribed, the **owner can paste a few
bullets** from what they watched; those get folded in (synthesised, guarded, citation kept honest).

## Pointers
- Branch: `claude/kundli-life-interpretation`.
- Feature: `src/data/life-interpretation.ts`, `src/components/LifeInterpretationCard.tsx`,
  `src/screens/ChartScreen.tsx` (hookup is a separate deferred task).
- Spec/plan: `docs/superpowers/specs/2026-07-23-kundli-life-interpretation-design.md`,
  `docs/superpowers/plans/2026-07-23-kundli-life-interpretation.md`.
