# Festival and vrat devotional-guide audit

**Priority:** P0 before go-live
**Owner direction:** 2026-07-22

## Problem confirmed

The issue is corpus-wide rather than limited to Mahalaya:

- `VratVidhiCard` always renders a safety panel, falling back to one shared safety
  message even when an observance has no special risk.
- Existing coverage gates check that sections exist and are bilingual, but do not
  check devotional tone, useful worship depth or festival-specificity.
- Batch guide work placed research distinctions and defensive qualifiers in public
  copy. Common patterns include “no universal,” “do not,” “not interchangeable,”
  “ask the committee/authority,” “many families” and “not a substitute.”
- A uniform schema encouraged every festival to carry meaning, regional, safety and
  udyapan prose even when a concise, direct guide would serve the worshipper better.

## Required product result

Every public fast and festival must become a concise, inspiring, source-backed
worship guide that can replace searching several advertisement-heavy websites.
It must respect the user's religious sentiment and family/sampradaya choices while
still giving a useful complete household path to someone without inherited guidance.

The canonical voice and safety rules are in `plans/religious-content-policy.md`.

## Work sequence

1. **Component correction**
   - Stop rendering a default safety panel on every `VratVidhiCard`.
   - Render a short Health/Safety note only when that guide explicitly supplies one.
   - Keep it after the worship guidance unless immediate fasting risk genuinely
     requires earlier placement.
2. **Inventory**
   - Generate the exact set of every public `VRAT_VIDHI` and major-festival guide.
   - Record route, guide key, source note, unique practice, timing rule, story,
     dietary rule and whether a specific safety note is justified.
3. **Rewrite in bounded families**
   - Bengal Durga Puja and Shakta/Navratri.
   - Ekadashi/Pradosh/Sankashti and monthly vrats.
   - Diwali five-day sequence.
   - Holika/Holi and spring festivals.
   - Rama/Krishna/Hanuman/Ganesha festivals.
   - Teej, Karva Chauth, Ahoi, Vat and family-welfare vrats.
   - Chhath, Skanda, Ayyappa and regional sequences.
   - Remaining major, regional and Jayanti guides.
4. **Story and methodology depth**
   - Each guide must identify a suitable source-backed katha, scripture passage,
     stotra, nama-japa or listening option.
   - Provide a complete simple household worship sequence before advanced variants.
5. **Permanent quality gate**
   - Reject the owner's prohibited research/defensive phrases in public guide data.
   - Reject accidental shared verdict/meaning/diet paragraphs across unrelated
     observances.
   - Require an explicit guide-specific reason for every safety note.
   - Keep bilingual completeness and route coverage gates.
6. **Visual and production review**
   - Representative page from every family in EN/HI, desktop and 390px phone.
   - Verify the guide reads as instructions rather than an essay, has no language
     mixing or overflow, and has zero browser errors.
   - Commit, push, deploy and verify representative production routes.

## Mahalaya correction benchmark

The corrected page should follow this direction:

- Verdict: Mahalaya opens Devi Paksha through ancestor remembrance and the sacred
  invocation of Maa Durga; invite the user to begin with early-morning Chandipath or
  Mahishasuramardini according to tradition.
- Meaning: explain the close of Pitru Paksha and invocation of Durga without
  comparing it to a “generic Amavasya fast.”
- Diet: “A simple or vegetarian meal until the recitation ends is generally
  advised,” followed only by a concise named tradition choice if sourced.
- Story: explain Mahishasuramardini, Devi's arrival and the devotional importance of
  Chandipath; remove commentary about broadcasts, modern unification or authority.
- Worship: give preparation, ancestor remembrance, lamp, flowers, Chandipath or
  listening path, Devi invocation, prayer and conclusion in order.
- Safety: no generic access, crowd, committee, police or authority warning.

## Definition of done

- Exact public guide inventory has zero unaudited entries.
- Every guide meets the eight corpus-level checks in the religious-content policy.
- No mandatory generic safety box remains.
- Prohibited defensive/research phrases have zero public-guide matches except an
  explicitly reviewed, genuinely necessary context.
- Source notes and validators preserve authenticity without leaking research prose
  into the UI.
- All canonical gates, content gates and production build pass.
- EN/HI family matrix and phone/desktop production verification pass.
- Local backlog, task log and Google Sheet contain evidence before 100% closure.
