# Bhakti — naming and address contract, plus permanent pages for the aartis we already have

**Date:** 2026-08-14
**Author:** Claude Code (owner-directed)
**Status:** Approved design → filed as a backlog row, **sequenced after the redesign track**
**Backlog ID:** `P2-BHAKTI-ADDRESS-CONTRACT`

---

## 1. Problem

Ganak has fourteen aartis. Every one of them lives **inside** a festival page, as a
block of that page. None of them has a web address of its own.

That has four consequences:

- A visitor cannot send anyone "the Hanuman aarti." They can only send a festival page
  and say "scroll down."
- Nobody can bookmark one, or return to one directly.
- Search engines have nothing to point at, so the aartis can never be found by anyone
  searching for them by name — which is how almost everyone looks for them.
- The same aarti is repeated on several festival pages, so even if the pages were
  visible, they would compete with each other rather than reinforcing one page.

Separately, the owner has proposed a full devotional section — search, seven kinds of
devotional text, browsing by deity and by occasion, curated guides. That plan is sound
and is recorded here as the destination. But Ganak has **only one** of those seven kinds
of text, and only fourteen items of it. Building four ways to browse a nearly empty
library is premature.

**What is not premature** is the decision underneath it: what these things are called,
and what their web addresses look like. Addresses are effectively permanent. Once a page
has one and search engines have learned it, changing it costs traffic and requires
forwarding rules that leak value on every hop. And a plan to give aartis flat addresses
(`/aarti/<name>`) is **already queued** in the backlog. If that ships as written, every
devotional page Ganak ever publishes inherits a shape that cannot express the difference
between a chalisa and a bhajan — and undoing it is a site-wide rename.

So this spec does the cheap, irreversible part now and defers the expensive, reversible
part.

## 2. Owner decisions (2026-08-14)

1. **Option A chosen.** Lock the naming and address contract, and give the fourteen
   existing aartis permanent pages. Do not build the full section yet.
2. **Sequenced after the redesign.** No implementation begins until the redesign track
   lands. Building new pages mid-redesign means building them twice.
3. **The full devotional section remains the destination**, not a rejected idea. The
   contract in §4 is written so every later part slots in without a rename.

## 3. Goals and non-goals

**Goals**

- Freeze the vocabulary: what each kind of devotional text is called, in both languages.
- Freeze the address shape for every kind of devotional page Ganak will ever publish.
- Give each of the fourteen existing aartis exactly one permanent, shareable page.
- Make those pages reachable, so none of them is an orphan.
- Leave every later phase — search, deity pages, occasion guides, six more text kinds —
  buildable without changing anything decided here.

**Non-goals** (explicitly deferred, not rejected)

- Search across devotional content.
- Browsing by deity.
- Browsing by occasion, and the curated occasion guides.
- Any new devotional text. The corpus stays at fourteen aartis for this row.
- The other six kinds of text. Their names and addresses are reserved; none is built.
- Making Ganak visible to search engines. That is a separate, larger, cross-cutting fix
  and it is what actually turns these pages into traffic. This row does not depend on it,
  but this row does not pay off without it.
- Audio, and regional-language aartis. Both are already separate backlog rows.

## 4. The contract

This section is the deliverable. Everything else in the spec exists to serve it.

### 4.1 Section name

**Bhakti · भक्ति.** One section, one root.

### 4.2 The seven forms

These are the seven kinds of devotional composition Ganak recognises. The names are
fixed. Nothing is filed under a name that is not on this list, and nothing on this list
is collapsed into another entry — in particular, "Bhajan" is **one form among seven**,
not an umbrella for all of them.

| Form | Address word | What it is, plainly | Example |
|---|---|---|---|
| Bhajan | `bhajan` | A devotional song | Achyutam Keshavam |
| Aarti | `aarti` | The song sung while the lamp is offered | Om Jai Jagdish Hare |
| Chalisa | `chalisa` | A forty-verse devotional composition | Hanuman Chalisa |
| Stotra | `stotra` | A hymn in praise of a deity | Mahalakshmi Ashtakam |
| Mantra | `mantra` | A sacred formula for recitation | Gayatri Mantra |
| Naamavali | `naamavali` | A sequence of divine names | Vishnu Ashtottara Namavali |
| Paath | `paath` | A long text read or recited in full | Sundarkand |

**Naming decision:** the owner's proposal called the last one "longer path." That is a
description, not a name — and "path" reads as a file path in English. The tradition's own
word is **पाठ / Paath**, which is what users search for ("sundarkand path"). Filed under
`paath`.

### 4.3 Address shape

| Kind of page | Address | Built in this row? |
|---|---|---|
| Section home | `/bhakti` | Yes — minimal |
| All texts of one form | `/bhakti/<form>` | Only `/bhakti/aarti` |
| **A single composition** | `/bhakti/<form>/<slug>` | Yes — all fourteen |
| All texts for one deity | `/bhakti/deity/<deity>` | No — reserved |
| A curated occasion guide | `/bhakti/guides/<slug>` | No — reserved |

**Decision — no festival tree under Bhakti.** The owner's proposal included
`/bhakti/festivals/<festival>`. Ganak already publishes 181 festival pages at their own
addresses. A second festival tree inside Bhakti would duplicate them and split whatever
search value they earn — exactly the failure the owner's own proposal warns against.
Instead: the existing festival pages link **into** Bhakti, and Bhakti links back out to
them. One festival page per festival, permanently.

### 4.4 Slug rules

A slug is the last part of the address — the bit that names the composition.

- Latin transliteration, lowercase, words joined by hyphens. No diacritics, no Devanagari
  in the address itself.
- **The name people search for**, not the formal ceremonial title. `hanuman-chalisa`, not
  `shri-hanuman-chalisa-paath`.
- Honorifics (`shri`, `ji`, `maharaj`) are dropped unless they are genuinely part of the
  searched name.
- Where a composition is known by its opening line, the opening line is the slug:
  `om-jai-shiv-omkara`, `aarti-kije-hanuman-lala-ki`.
- **A published slug never changes.** Correcting a slug means publishing a redirect and
  accepting the loss; it is an owner decision, not an implementation choice.

### 4.5 One canonical page per composition

A composition has **exactly one** page, no matter how many festivals, deities or
occasions point at it. Om Jai Jagdish Hare is sung at many festivals; it gets one address.
Every other surface — festival pages, later deity pages, later guides, later search
results — is a pointer to that one page, never a copy of it.

Where a text genuinely belongs to two forms, the **form it is named by wins**: Hanuman
Chalisa is filed as a chalisa even though it is also recited as a paath.

### 4.6 The contract is enforced, not remembered

A regression gate asserts that every devotional address in the app matches §4.3, that
every form word is one of the seven in §4.2, and that no two pages carry the same
composition. The gate must be proven non-vacuous — it fails when an off-contract address
is introduced deliberately, and passes when it is removed.

Without this, the contract is a document somebody stops reading in three months.

## 5. Scope of work

1. **Write the contract into the repository** as the single reference for all devotional
   naming and addressing, and add the gate described in §4.6.
2. **Fourteen permanent pages** at `/bhakti/aarti/<slug>`, each showing the full
   Devanagari text with its existing refrain/cue layout, its English meaning line, and
   which festivals it belongs to.
3. **A minimal `/bhakti` home and `/bhakti/aarti` list**, so every new page is reachable
   from navigation. Ganak's existing orphan gate fails any page nothing links to, so this
   is required, not optional polish.
4. **Festival pages link out** to each aarti's own page. The inline text stays where it
   is — the guide still works end to end without leaving the page.
5. **Per-page title, description and canonical address**, so the pages are correct the
   moment search visibility is fixed rather than needing a second pass then.
6. **Supersede the flat-address plan.** The queued aarti-finder row is amended to build on
   `/bhakti/aarti/<slug>` rather than `/aarti/<slug>`. Its search element stays deferred.

Both language modes throughout. The Devanagari text is identical in both, as the existing
aarti standard requires.

## 6. What this changes for a visitor

| Task | Today | After |
|---|---|---|
| Send someone one specific aarti | Impossible — only a festival page and "scroll down" | One address, one tap to share |
| Bookmark an aarti for daily use | Impossible | Works |
| Find "hanuman aarti" from search | Nothing to find | A page exists and is correctly titled — findable once crawlability is fixed |
| Read the aarti while following a festival guide | Works | Unchanged |

## 7. Success measure

Ganak's UI work is not started without a measured task to move. This row's task is:
**reach one specific devotional text directly.**

- **Today: 0 of 14.** No aarti can be linked, bookmarked or shared on its own.
- **On completion: 14 of 14**, each verified by opening its address directly in both
  languages and confirming the text renders.
- **After crawlability is fixed** (separate row): number of these addresses indexed, and
  visits arriving on them. Not claimable from this row alone, and this spec does not
  claim it.

## 8. Dependencies and sequencing

- **Starts after the redesign track lands.** Owner decision, 2026-08-14. These pages
  reuse shared page furniture that the redesign is actively changing; building first means
  building twice.
- **Does not depend on** search-engine visibility, new content, or the full Bhakti
  section. It is deliberately shaped to be finishable on its own.
- **Blocks** the aarti search work, the aarti SEO row and the regional-language aarti row
  — all three need permanent addresses to exist first.
- **Its value is capped** until Ganak is crawlable. Worth stating plainly: this row makes
  fourteen pages shareable; it makes them *findable on Google* only in combination with
  the prerender row.

## 9. Risks

| Risk | Handling |
|---|---|
| Flat `/aarti/...` addresses ship during the redesign from the older queued row | §5.6 amends that row now, before either is started |
| Fourteen pages is thin for a section called Bhakti | The section home says plainly what is there today; no fake breadth, no empty category tiles |
| A slug is chosen badly and has to change later | Slugs are reviewed by the owner once, before publication — cheap then, expensive after |
| The contract drifts as later phases are built | The gate in §4.6, not the document, is what holds it |
| Deferred phases are read as cancelled | §3 records them as deferred with their addresses already reserved |

## 10. Explicitly not decided here

- Whether Bhakti gets a primary navigation entry. The redesign owns navigation; this row
  reaches its pages from wherever the redesign puts devotional content.
- Which deities get pages, and in what order.
- Whether occasion guides are written by the owner or sourced. That is a content-policy
  question and carries religious risk (recommending what to read on a given day is a
  claim, and traditions disagree); it is deferred with the guides themselves.
