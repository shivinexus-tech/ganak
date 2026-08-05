# Ganak — UX / IA / Navigation audit

**Date:** 2026-07-25 · **Method:** live audit of https://ganak.pages.dev (mobile 375px
+ desktop), all three tabs plus the festival / calendar / search surfaces.
**Scope:** information architecture, navigation, interaction consistency, layout —
not engine correctness or content accuracy.

---

## Reframe: the visual system is not the problem

The palette, typography, spacing, and writing (bilingual, detailed, calm) are
coherent and pleasant. What's broken is **information architecture, navigation, and
interaction consistency** — how the app is *organized* and how you *move and act* in
it. "Everything feels broken" is real, but the fix is **structural, not cosmetic**.
Don't repaint — re-plumb.

## The spine problem (root cause of most of the rest)

The top-level structure is inverted. The only global navigation is three tabs —
**Daily / Prashna / Jyotish** — but the app's real scope (its own tagline: "Tithi ·
fasts and festivals · auspicious timings") is much larger. Everything that doesn't
fit those three tabs was dumped into **"Daily," now a ~14-section infinite scroll**:

> Panchang controls → Today → Good/Avoid times → Sun/Moon → Coming up → **entire
> Fasts & Festivals module** → **entire Muhurat Finder** → Season & Vedic clock →
> Decision windows → **entire Planetary Hours (Hora) module** → Upcoming planetary
> events → footer.

Festivals, Muhurat, and the Calendar are **major features with no top-level entry
point**. That single decision cascades into most issues below.

## Systemic issues (cut across screens)

| # | Issue | Evidence | Severity |
|---|-------|----------|----------|
| 1 | **IA doesn't match scope.** 3 tabs hide Festivals, Muhurat, Calendar inside the Daily scroll. | Daily = 14 stacked modules | HIGH |
| 2 | **Duplicated features, two homes.** Muhurat is inline in Daily *and* a separate MuhuratHub (backlog: "gut MuhuratHub"). Festivals are inline *and* guide pages *and* a full-year calendar. | backlog EPIC-IA; Daily module | HIGH |
| 3 | **No persistent navigation.** Tab bar scrolls away; to switch sections you scroll back to the top. No sticky header, no bottom nav on mobile. | tab bar not sticky | HIGH |
| 4 | **Inconsistent interaction rules.** Daily events expand on tap; calendar & search rows do nothing; festival pages are separate routes. Same-looking things behave differently. | CalendarPage dead rows vs DailyScreen expand | HIGH |
| 5 | **Unfinished seams shipped.** Calendar/search rows ("Wire deferred"); crude hero art (now removed); a duplicated Navadurga image (now fixed). | code + 2026-07-25 session | MED |
| 6 | **Controls before content.** Calendar-system and Government-holidays selectors take prime above-the-fold space before any panchang is shown. | home screen | MED |
| 7 | **Desktop = stretched mobile.** One narrow centered column, large empty side margins, no real desktop layout. | desktop screen | MED |
| 8 | **Heavy header tax.** Language toggle + large brand + tagline + om divider fill most of the first screen, repeated on every tab, before any content. | every screen | MED |

## Screen-by-screen

- **Daily — HIGH.** The core problem child; five apps in one scroll. Should become a
  true "today" summary that *links out* to Festivals / Muhurat / Hora as their own
  destinations.
- **Fasts & Festivals (inline) + Calendar + Search — HIGH.** Three overlapping
  surfaces for the same content; the standalone calendar and search rows are dead
  ends (can't open a festival — logged bug in `backlog.md`).
- **Muhurat — HIGH.** Split-brained: a finder inline in Daily plus a separate hub;
  unclear which is canonical.
- **Prashna — GOOD.** Clean, focused, well-scoped (a hand-guided area; shows what
  "good" looks like here).
- **Jyotish — MED.** Reasonable, but chart casting + saved charts + Kundali matching
  are stacked on one page; could be sub-navigated.
- **Festival guide pages — GOOD/MED.** Content-rich, now with real art for some; fine
  as destinations once navigation actually reaches them.

---

# Part II — The deeper layer: instrument vs companion

Part I is about how the app is *wired*. This part is about how it *relates to a
person* — comprehension and emotional connection. It is the more important half.

## Central thesis

**Ganak behaves like an almanac when its users want a guide.** An almanac is a
reference instrument: accurate data, and it trusts you to know what to do with it. A
guide is a companion: it knows who you are, tells you what today *means for you*, and
leads you to the one thing that matters. Ganak is a brilliant instrument bolted to a
flat data dump. That single gap — **instrument vs. companion** — is the source of
*both* "it's confusing" *and* "a user wouldn't feel connected."

## Seven deeper layers

1. **Data without meaning — the missing "so what?"** The app shows
   `Panchaka Rahita ✓`, `Anandadi Yoga: Musala`, `Disha Shool points East`,
   `21 ghati 53 pal 40 vipal` with almost no interpretation of meaning or action.
   Experts parse it; everyone else feels lost. Confusion here is *unexplained
   expertise*, not clutter.
2. **No editorial hierarchy — nothing leads.** ~14 modules render at equal weight
   simultaneously. Nothing answers "what matters most right now?" Today's Ekadashi is
   no more prominent than the ghati clock. Flatness = the app doesn't know what's
   important, so the user must decide every time.
3. **It never learns who you are.** Stateless and impersonal. Ascendant is asked only
   inside Hora and forgotten elsewhere; Smarta/ISKCON filters shape nothing else;
   five calendar systems are raw *settings* instead of the human question "which
   tradition do you follow?" A Tamil Shaivite, a Bengali Shakta and an ISKCON devotee
   all get the same generic surface with different toggles. None feels like *their*
   panchang.
4. **Encyclopedic tone, not devotional warmth.** Copy explains mechanisms ("Ritu is a
   global astronomical calculation from the sidereal Sun sign") rather than
   significance. Panchang is emotional and sacred for most users; the app treats a
   spiritual practice as an engineering readout. Accuracy earns respect, not
   attachment.
5. **Festivals as timetables, not stories.** Primary surfaces reduce a festival to a
   row + timing table. People connect through story, meaning and memory. The rich
   guide pages exist but the emotional core (why the day matters, the deity's story,
   the ritual) is buried behind mechanics. The app leads with *when* and hides *why* —
   and *why* is what people feel.
6. **Too many overlapping ways to ask the same question.** "Good & avoid times" +
   Muhurat Finder (15 chips) + "check a time today" (6 chips) + separate MuhuratHub +
   Hora's own ask box + "Today's decision windows." One intent ("is now good for X?"),
   five+ doors. Redundant paths read as confusing and untrustworthy.
7. **The expert/novice fork is unresolved.** Courts experts (KP sub-lords, VSOP87
   footnotes, ghati/pal/vipal) *and* novices (a friendly "Inauspicious now" pill), and
   fully serves neither. No persona, no progressive disclosure, no "simple by default,
   depth on demand." Being everything to everyone is why it belongs to no one.

## Would a user feel connected? — No: informed, not accompanied

It's a precise instrument you *consult*, not a companion you *belong to*. It answers
"what is true about the sky today?" rigorously, but never the questions people arrive
with: *what does today mean for me? what should I do? is this an okay moment? does
this app get my tradition, my situation, my mood?*

Connection would require four things it currently lacks:

- **It knows me** — tradition, region, deity, chart — captured once, honored everywhere.
- **It leads** — one clear "today, for you," not fourteen equal panels.
- **It means something** — interpretation over raw fields; the "so what," always.
- **It feels sacred** — reverence and warmth in the *daily* experience, not just on festival pages.

Fixing navigation (Part I) makes it *usable*; fixing this layer (Part II) makes it
*loved*.

## Suggested sequencing (not started — for later)

Highest leverage is issues **#1–#4 together**:
1. Define a real top-level IA (likely **Panchang · Festivals · Muhurat · Jyotish ·
   Prashna**).
2. Give it persistent navigation (sticky top and/or bottom nav on mobile).
3. Break the Daily mega-scroll into destinations.
4. One consistent rule: *tap a thing → open its detail.*

Everything else (desktop layout, header slimming, controls placement) is downstream
polish. Recommended next step when ready: compare this against the owner's own
wireframes and derive the target IA from them.
