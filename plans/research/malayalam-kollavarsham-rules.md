# Malayalam Kollavarsham (Kerala solar calendar) — sourced rule note

**Status:** implemented as a DARK engine mode (C4-MALAYALAM-KOLLAVARSHAM)
**Research date:** 2026-08-18
**Scope:** display/interpretation layer only. Nothing here feeds Ganak's astronomy or its
festival rules; Onam and Vishu continue to be dated by the existing festival engine and were
not touched. The mode ships `enabled:false` with its own `malayalamSolar:false` rollout flag,
so no calendar picker, label or route changes for any user.

## 1. The month-start rule that was implemented

**In plain words:** Kerala reckons a solar month from the sankranti (the Sun's sidereal entry
into a rasi), but the *civil date* that carries day 1 is decided by **aparahna** — the moment
three-fifths of the way from that day's sunrise to that day's sunset (13:17–13:47 across the
twelve 2026 sankranti days at Thiruvananthapuram). If the sankranti happens **before** aparahna, that same civil date is day 1 of the
new month. If it happens at or after aparahna, day 1 is the **next** civil date.

This is Kerala's own convention. It is **not** the Tamil rule already in Ganak (sankranti
before *sunset* → same day) and **not** the Bengal rule (sankranti before midnight → next
sunrise; after midnight → the sunrise after that). The three modes share one sidereal-ingress
engine in `src/engine/calendar-conventions.ts`; only the civil-day cut-off differs.

**Source.** The four-school classification traces to the Government of India Calendar Reform
Committee material reproduced in Chatterjee, S.K. (1998), *Indian Calendric System*,
Publications Division, Ministry of Information and Broadcasting, Government of India. The
wording used here was read at
[hindu-blog.com — Hindu Solar Calendars: Differences](https://www.hindu-blog.com/2019/04/hindu-solar-calendars-differences.html)
(retrieved 2026-08-18), which cites Chatterjee (1998) together with Dershowitz & Reingold,
*Calendrical Calculations*, and Aslaksen & Doegar, *Indian Calendars* (NUS). It states the
Malayalam school as: the month begins on the same day if the sankranti happens before
aparahna, i.e. before 3/5 of the time from sunrise to sunset, otherwise on the next day — and
in the same list states the Tamil sunset rule and the Bengal midnight rule **exactly as Ganak
already implements them**, which is what makes it a usable reference rather than one blog.

**Conflicting source, recorded rather than hidden.** myzodiaq.in's "Malayalam Panchang" page
(retrieved 2026-08-18) gives the same 3/5 aparahna threshold but the opposite polarity
("before aparahna → the month begins the *next* day; after aparahna → two days later"), and
likewise inverts the era arithmetic (−824/−825). That reading is refuted by the published
calendars themselves: the Kumbham 2026 sankranti falls at 04:14 IST — far before aparahna —
and every published Kerala calendar starts Kumbham that same day, 13 February 2026. The
majority convention (Chatterjee's) is what is implemented; the outlier is noted here.

**Confidence: high** for the rule as implemented — one attributed textual source, and a
mechanical fit to 21 consecutive published month boundaries and 627 published day numbers
(below) with zero exceptions, including the three 2026 boundaries where the aparahna rule and
the Tamil sunset rule disagree.

## 2. The era year (Kollavarsham / Malayalam Era)

The Kollam Era begins in 825 CE and the era year turns over at **Chingam 1**, not at Medam 1.
Implemented as: months Chingam (Simha) through Dhanu — the Aug–Dec stretch — take
`Gregorian year − 824`; Makaram through Karkidakam — the Jan–Jul stretch of the same era year
— take `Gregorian year − 825`.

Dated anchors (Drik Panchang, Thiruvananthapuram, retrieved 2026-08-18):

| Civil date | Published Kollavarsham |
|---|---|
| 16 Aug 2025 | 1200 |
| 17 Aug 2025 (Chingam 1) | 1201 |
| 14 Jan 2026 | 1201 |
| 16 Aug 2026 | 1201 |
| 17 Aug 2026 (Chingam 1) | 1202 |

**Known regional disagreement (majority convention implemented).** Modern Kerala, the state
government calendar and every published almanac consulted open the Kollam year at **Chingam 1**.
Historically parts of North Malabar opened it at **Kanni 1** (Kanya), and Medam 1 (Vishu) is
still widely kept as an astrological/agricultural new year. Ganak implements the Chingam
turnover; the month sequence itself is unaffected by that choice.

## 3. Dated anchors the gate pins

`validation/malayalam-kollavarsham.cjs` pins 21 consecutive published month boundaries for
**Thiruvananthapuram** (8°29′07″N 76°56′57″E) from Drik Panchang's Malayalam monthly calendar
grids (`drikpanchang.com/malayalam/malayalam-month-calendar.html?geoname-id=1254163`, all
retrieved 2026-08-18). Those grids print a Malayalam day number on every cell; across the 644
continuously covered civil days 2025-03-30 → 2027-01-02 the numbers increase by exactly one
per day with no gap, repeat or contradiction, so the boundary list reproduces the whole
published series and the gate re-derives 627 daily labels from it.

| Malayalam month | Day 1 (2025) | Day 1 (2026) |
|---|---|---|
| Medam (Vishu) | 14 Apr 2025 | 14 Apr 2026 |
| Edavam | 15 May 2025 | 15 May 2026 |
| Mithunam | 15 Jun 2025 | 15 Jun 2026 |
| Karkidakam | 17 Jul 2025 | 17 Jul 2026 |
| **Chingam (Malayalam New Year, Onam month)** | **17 Aug 2025 → ME 1201** | **17 Aug 2026 → ME 1202** |
| Kanni | 17 Sep 2025 | 17 Sep 2026 |
| Thulam | 18 Oct 2025 | 18 Oct 2026 |
| Vrischikam | 17 Nov 2025 | 17 Nov 2026 |
| Dhanu | 16 Dec 2025 | 16 Dec 2026 |
| Makaram | — | 15 Jan 2026 |
| Kumbham | — | 13 Feb 2026 |
| Meenam | — | 15 Mar 2026 |

**The boundaries that prove it is Kerala's rule and not a neighbour's**, using the published
2026 Lahiri ingress instants already frozen in `src/data/regional-calendar-evidence.ts`:

- **Makara, 14 Jan 2026 15:13 IST** — after aparahna (13:41 that day) but before sunset. Tamil Thai 1
  is 14 Jan; Kerala's Makaram 1 is **15 Jan**. A Malayalam mode that silently reused the Tamil
  branch fails here.
- **Mithuna, 15 Jun 2026 12:59 IST** — after local noon but before aparahna (13:38 that day). Kerala
  starts Mithunam that same day, 15 Jun. A "midday" cut-off fails here.
- **Tula, 17 Oct 2026 19:57 IST** and **Karka, 16 Jul 2026 23:45 IST** — after aparahna and
  after sunset, so Kerala and Tamil Nadu agree (18 Oct, 17 Jul) while Bengal runs a day later.

Anchors are dated and attributed. Nothing is pinned to "the sky at run time".

## 4. Month names

Indexed by sidereal sign, so Chingam sits at Simha (index 4):
Medam, Edavam, Mithunam, Karkidakam, Chingam, Kanni, Thulam, Vrischikam, Dhanu, Makaram,
Kumbham, Meenam — with Malayalam script (മേടം … മീനം) and Devanagari for the Hindi reader.
Drik romanises three of these differently (Metam, Itavam, Karkatakam); Ganak uses the
spellings in common Kerala English usage, and the gate matches on those.

## 5. Limits, stated

- The published anchors are **Thiruvananthapuram**. Aparahna is a local-sunrise/sunset
  quantity, so the day-1 date is *expected* to shift for distant places; that is the rule
  working, not drift. The gate covers 8 cities for a full year against an independently
  written model of the rule, so a rule change cannot hide behind location.
- Ganak computes its own ingress instants; the smallest 2026 margin between an ingress and its
  aparahna cut-off is 39 minutes (Mithuna, 15 Jun 2026), so a minute-level ephemeris difference
  against a published almanac cannot flip a boundary.
- The mode is **dark**. It has no picker entry, no route, no telemetry shadow and no festival
  wiring; `/?cal=malayalam-solar` recovers to the Ganak default and says so. Turning it on is a
  separate decision that depends on the still-open owner question about whether users choose a
  calendar from a menu at all.
