# Event-engine reference cross-check — eclipse, Sutak, Panchaka, Sankranti, Navratri

Lane: `claude/eclipse-panchaka-reference` (worktree `.scratch/worktrees/eclipse-ref`), opened 2026-08-18.
Extends the C3 daily-Panchang cross-check (`plans/backlog.md` § C3, closed 2026-08-14) to the
**event** engines, which were never checked field-by-field against a published reference.

Benchmark, per `AGENTS.md`: **Drik Panchang**. Independent second opinions where Drik is
silent or where a second authority is needed: NASA/Espenak eclipse canon (via the Danjon
shadow rule in Meeus, *Astronomical Algorithms* ch. 54) and timeanddate.com.

Every reference below was fetched from the live Drik page for the **named city and the named
eclipse date**, in Drik's own 24-hour display mode, and each fetch was **verified to be the
eclipse asked for**. That check is not ceremony: Drik's solar page silently falls back to the
site's "current" eclipse when asked for a date it has no page for, and four early readings in
this lane ("2 Aug 2027 not visible in Delhi/Mumbai/Cairo/Karachi") were that fallback serving
the 6 Feb 2027 eclipse. They were discarded, not recorded. Reference HTML is kept under
`.scratch/drik/` (gitignored) with `.scratch/verify-drik.py` as the guard.

---

## 1. Sutak — the rules Drik actually publishes

Source: <https://www.drikpanchang.com/eclipse/sutak-grahan.html>, read 2026-08-18. Verbatim:

- "Sutak is observed for 12 hours before Solar Eclipse and for 9 hours before Lunar Eclipse"
- "For children, sick and old people food limitation is restricted to only single Prahar or 3 hours"
- "Sutak is observed only when Eclipse is visible at the place under discussion"

Source: Drik lunar eclipse page footer ("Hinduism and Lunar Eclipse"), read 2026-08-18:

- "Unless Lunar Eclipse is visible to the naked eye, it is of no significance to Hindus…
  Penumbral Lunar Eclipses are not visible to the naked eye hence no rituals related to
  Chandra Grahan should be observed."
- "If Chandra Grahan is not visible in your city but it is visible some city near to that
  then you should not observe it."
- "Chandra Grahan is considered even if the Moon is not visible due to cloudy weather."

**Confidence: high** (primary source, the project's declared benchmark, two independent pages).

### 1a. The "12 hours / 9 hours" in the prose is nominal, not the computed rule

Ganak implemented the prose literally: `sutakStart = localEclipseStart − 12h` (solar) or `− 9h`
(lunar). **Drik's own published times do not follow that arithmetic**, and the gap reaches
**39 minutes**. The rule Drik actually computes, recovered from 13 published anchors and
reproduced exactly, is a **prahar-boundary** rule:

> Divide the local daytime (sunrise→sunset) into four equal **day prahars** and the local night
> (sunset→next sunrise) into four equal **night prahars**. Let `B` be the prahar boundary at or
> immediately before the **local** eclipse start. Sutak begins at the boundary **N prahars**
> before `B` — **N = 4 for solar, N = 3 for lunar**. Sutak for children, the old and the sick
> begins **1 prahar** before `B`. Both end at the local Moksha (eclipse end).

A prahar is one-eighth of a day only at the equinox; away from it a day prahar and a night
prahar differ, which is exactly why the flat-hours version drifts. Four day prahars ≈ 12 hours
and three night prahars ≈ 9 hours only on average — hence the prose.

The rule is **uniquely identified**: the naive alternative "snap `localStart − 9h` back to the
enclosing prahar boundary" reproduces Delhi 7 Sep 2025 but fails Delhi 3 Mar 2026 by ~3 hours,
so it is ruled out. Anchors, all Drik, all verified as the named eclipse:

| # | Eclipse | City | Local start (Drik) | Drik Sutak begins | Prahar rule predicts | Drik kids/old/sick | Rule predicts |
|---|---|---|---|---|---|---|---|
| 1 | 2025-09-07 lunar | Delhi | 21:58 | 12:19 | 12:17 (day prahar 3) | 18:36 | 18:36 = sunset |
| 2 | 2026-03-03 lunar | Delhi | 18:26 (moonrise) | 09:39 | 09:39 (day prahar 2) | 15:28 | 15:29 (day prahar 4) |
| 3 | 2026-03-03 lunar | Chennai | 18:21 (moonrise) | 09:22 | — same shape | 15:19 | — |
| 4 | 2026-03-03 lunar | Kolkata | 17:43 (moonrise) | 08:52 | — same shape | 14:45 | — |
| 5 | 2026-03-03 lunar | Tokyo | 18:51 | 09:01 | — same shape | 14:46 | — |
| 6 | 2026-03-03 lunar | Sydney | 20:51 | 09:56 | — same shape | 16:18 | — |
| 7 | 2026-03-03 lunar | New York | 04:51 | 17:49 (Mar 2) = sunset | 17:49 | 00:08 | 00:07 |
| 8 | 2025-09-07 lunar | London | 19:36 (moonrise) | 09:40 | — same shape | 16:15 | — |
| 9 | 2026-08-28 lunar | London | 03:34 | 16:30 (Aug 27) | 16:34 | 22:30 (Aug 27) | 22:34 |
| 10 | 2026-08-28 lunar | New York | 22:34 (Aug 27) | 12:57 | 13:00 | 19:36 | 19:36 = sunset |
| 11 | 2025-03-14 lunar | New York | 01:11 | 16:03 (Mar 13) | 16:03 | 22:03 (Mar 13) | 22:02 |
| 12 | 2025-03-29 solar | London | 10:07 | 21:16 (Mar 28) | 21:17 | 05:42 | 05:42 = sunrise |
| 13 | 2026-08-12 solar | Reykjavik | 16:47 | 01:33 | 01:27 | 09:20 | 09:16 |
| 14 | 2026-02-17 solar | Johannesburg | 14:26 | 00:22 | 00:17 | 09:08 | 09:02 |
| 15 | 2027-02-06 solar | Buenos Aires | 10:45 | 22:32 (Feb 5) | 22:35 | 06:19 | 06:19 = sunrise |
| 16 | 2027-02-06 solar | Johannesburg | 18:36 | 03:04 | 02:58 | 12:22 | 12:18 |
| 17 | 2025-09-21 solar | Sydney | 05:45 (sunrise) | 17:51 (Sep 21) = sunset | 17:51 | 02:46 | 02:46 |

("Rule predicts" above is a hand check against sunrise/sunset estimated to a few minutes; the
residual is the estimate, not the rule. The gated version computes sunrise/sunset with Ganak's
own solar engine and lands within Drik's rounding — see § 5.)

**Confidence: high.** 17 anchors, 9 cities, both hemispheres, solar and lunar, ordinary,
grast-udaya (eclipse in progress at rise) and grast-asta (luminary sets mid-eclipse).

**Sources disagree, and the disagreement is flagged, not hidden.** For 7 Sep 2025 most Indian
news outlets published "Sutak from 12:57 PM" — the flat `21:58 − 9h` arithmetic, which is what
Ganak did. Drik publishes **12:19**, 38 minutes earlier. Ganak follows Drik, per AGENTS.md;
the app states which convention it follows and gives the nominal hours alongside, so a reader
who was told "12:57" by a newspaper can see why Ganak says otherwise.

### 1b. Sutak when the eclipse is not visible locally — Ganak already agrees

Ganak shows **no Sutak at all** when the eclipse is not visible from the selected place. That
matches Drik's stated rule and Drik's own output ("Sutak Begins — Not Applicable" for Delhi on
12 Aug 2026 solar, 28 Aug 2026 lunar, and 20 Feb 2027 penumbral lunar). **Match — this is a
convention Ganak follows correctly and it is now pinned by a gate.** Other traditions differ
(some hold that Sutak follows the eclipse wherever it occurs); Ganak states the convention it
follows rather than implying it is the only one.

Penumbral-only lunar eclipses fall out correctly for the right reason: Ganak's shadow test is
deliberately **umbral**, so a penumbral eclipse produces no contact, hence no visibility and no
Sutak — the same religious outcome Drik publishes.

---

## 2. Lunar umbral contact times — the fixed 0.73° shadow was wrong

`lunarUmbralMetric` used a hard-coded umbral radius of **0.73°** with the comment
"Approximate umbral radius at the Moon". The true umbral radius scales with the Moon's distance
and ranges roughly 0.64°–0.74° over the sample below, so a constant is right only for eclipses
near mean distance. The error is amplified for shallow eclipses, where the Moon crosses the
shadow edge at a grazing angle.

Standard formula (Chauvenet/Danjon, as given in Meeus ch. 54 and used in the NASA/Espenak
canon): `ρ_umbra = 1.02 × (π_moon + π_sun − s_sun)`, the 1.02 being Danjon's 2% enlargement for
the Earth's atmosphere.

Measured against Drik's published first/last **umbral** contacts (`.scratch/umbra-fit.cjs`):

| shadow model | MAE vs Drik | worst |
|---|---|---|
| fixed 0.73° (before) | **6.00 min** | **12 min** |
| Danjon 1.02 (after) | **1.25 min** | **2 min** |

Per-eclipse, before → after (umbral duration, Ganak vs Drik):

| Eclipse | mag | Ganak before | Ganak after | Drik |
|---|---|---|---|---|
| 2025-09-07 total | 1.36 | 208.0 min | 210.4 min | 208.0 min |
| 2026-03-03 total | 1.14 | 215.1 min | 208.2 min | 205.0 min |
| 2026-08-28 partial | 0.92 | 210.8 min | 199.2 min | 197.0 min |
| 2025-03-14 total | 1.17 | 239.2 min | 219.3 min | 216.0 min |

The 14 Mar 2025 case is the headline: the old code ran the eclipse **23 minutes long**
(12 minutes early at first contact, 11 minutes late at Moksha).

A 1.01 enlargement fits Drik marginally better still (worst 1 min), but 1.02 is the sourced,
standard value and reproduces the NASA canon; fitting 1.01 would be tuning a fudge factor to
absorb Ganak's own ephemeris residual. **Ganak uses 1.02 and declares ±3 min against Drik as
the lunar-contact tolerance.** Confidence: high.

Solar contact geometry needed no change — it was already within ±2 min of Drik at every anchor
(Reykjavik 12 Aug 2026 exact to the minute at both contacts; Johannesburg, Buenos Aires,
London, Madrid, Sydney all within 2 min), because the solar path is topocentric and uses real
disc radii rather than a constant.

---

## 3. "Maximum of the eclipse" was the wrong quantity for solar eclipses

`eclipseDetail` returned `contacts.maximum = eclipseMs`, i.e. the **geocentric syzygy** (exact
new/full moon). For a lunar eclipse that is close to the truth (greatest eclipse is the same
instant everywhere, and syzygy is within ~4 min of it). For a **solar** eclipse, maximum
eclipse is a *local* quantity and syzygy is not it:

| Anchor | Drik local maximum | old Ganak value (syzygy) | error |
|---|---|---|---|
| 2026-02-17 solar, Johannesburg | 15:11 | 14:01 | **70 min** |
| 2026-08-12 solar, Madrid | 20:32 | 19:36 | **56 min** |
| 2026-08-12 solar, Reykjavik | 17:48 | 17:36 | 12 min |
| 2026-03-03 lunar, any city | 17:04 IST | 17:08 IST | 4 min |

Fixed by computing the maximum as the minimum of the same contact metric over the local
contact window — local for solar, global for lunar, from one implementation.

**Handoff (not in this lane's file scope):** `src/screens/FestivalGuideScreen.tsx:585` renders
`festivalClock(grahan.eclipseMs)`. It should render `grahan.contacts.maximum` (falling back to
`grahan.eclipseMs` when there are no contacts). One-line change, owned by another agent.

---

## 4. Sutak for children, the old and the sick was missing entirely

Drik publishes four Sutak fields; Ganak had one. `eclipseDetail` now returns `sutakStart`,
`sutakEnd`, `sutakKidsStart`, `sutakKidsEnd`, plus `sutakPrahar` / `sutakKidsPrahar` and the
nominal hours, and the bilingual convention note names both windows. This matters to exactly
the people least able to fast: a child, an elderly relative or someone unwell was previously
shown only the full window.

---

## 5. What is gated

`validation/eclipse-sutak-pages.cjs` now pins, with the anchors above:

- the prahar Sutak rule for solar (4 prahar) and lunar (3 prahar), against Drik's published
  times, to ±3 minutes;
- the 1-prahar children/old/sick window against Drik's published times, to ±3 minutes;
- "no Sutak when not visible locally" as a **declared convention**, on Delhi/12 Aug 2026 solar,
  Delhi/28 Aug 2026 lunar and Delhi/20 Feb 2027 penumbral lunar;
- lunar umbral contacts against Drik to ±3 minutes on four eclipses spanning magnitude
  0.92–1.36 — the assertion the fixed 0.73° shadow fails by up to 12 minutes;
- solar contacts against Drik to ±3 minutes on four cities;
- Moksha clamping at moonset/sunset (grast-asta) and Sutak anchoring on the local visible start
  (grast-udaya), each against a Drik anchor rather than against Ganak's own arithmetic.
