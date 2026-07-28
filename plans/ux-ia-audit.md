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
