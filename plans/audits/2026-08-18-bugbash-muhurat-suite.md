# Bug bash — Muhurat suite (second independent adversarial pass)

- **Date:** 2026-08-18
- **Agent:** independent adversarial test agent (Claude Code), branch `claude/bugbash-muhurat-suite`,
  worktree based on `origin/main` `8752753`.
- **Mandate:** `plans/backlog.md` P0-MUHURAT-FULL-PARITY — *"exceptionally strong Muhurat parity"*.
  Rows #16/#17 are explicitly held below 100% until "Claude Code completes the reserved second
  bug-bash pass". This is that pass. It is the **second** adversarial pass on the deep-muhurat work
  (Cursor ran the first on 2026-07-24 and found one P2).
- **Scope:** `src/engine/muhurat.ts`, `src/engine/medical-muhurat.ts`, `src/engine/personal-muhurat.ts`,
  `src/engine/daily-windows.ts`, `src/engine/panchaka.ts`, `src/data/muhurat-ui.ts`,
  `src/data/medical-muhurat-ui.ts`, `src/data/personal-muhurat-ui.ts`, `src/screens/MuhuratHub.tsx`,
  `src/screens/MedicalMuhuratScreen.tsx`, and the nine existing gates.
- **Standing:** READ-ONLY on all product code. Nothing under `src/` or `validation/` was modified.
  This document is the only write. Probe scripts live in `.scratch/bugbash/` (gitignored).

## Baseline — every existing gate was green before and after this pass

```
✓ muhurat-anchors PASSED (recall ≥ 80% on all categories)
✓ deep-muhurats PASSED (8 distinct public Muhurat engines, bilingual chips/guidance, dated anchors, clean-window checks)
✓ samskara-muhurats PASSED (5 distinct engines and bilingual input models; published rule tables; 5 dated comparator anchors; seasonal coverage)
✓ property-vehicle-muhurats PASSED (dedicated deed/registration/purchase and purchase/delivery flows; bilingual rationale; ranked clean-window results)
✓ medical-muhurat PASSED (conservative syzygy-avoidance scan, Drik-anchored ±1d, bilingual safety copy, no outcome claims)
✓ muhurat-actions PASSED (stable URL state, ICS export, calendar reminder and no browser storage)
✓ panchaka-windows PASSED (3308 Panchaka/Lagna windows tile sunrise-to-sunrise without gaps or overlaps)
✓ daily-windows PASSED (2995 intervals across 370 days; no zero/overlap defects; 3-city regional anchors)
✓ personal-muhurat PASSED (Tarabala/Chandrabala hard filters, Moon-BAV strength, Adhanadi soft caution)
```

**Every finding below is invisible to all nine gates.**

## Pass log

| # | Pass | What it probed | How |
|---|------|----------------|-----|
| 1 | Rule correctness vs references | Every `MUHURTA_RULES` nakshatra/tithi/weekday set re-derived against the classical canon; Ganda Moola and the engine's own `INAUSP_NAK` cross-checked against each activity's `auspNak`; Rahu/Yamaganda/Gulika/Abhijit/Panchaka/Bhadra/Chandrabala/Tarabala filters traced from engine to pixel; convention-dependence checked for whether it is *stated*. | `.scratch/bugbash/p1-*.cjs`, hand re-derivation |
| 2 | Window arithmetic and boundaries | Midnight-crossing windows and their date carry; zero/sub-minute windows; excluded-vs-merely-marked; overlapping exclusions; polar no-sunrise; DST transition days; first/last day of a search range; 400-day cap. | `.scratch/bugbash/p2-*.cjs`, `p3-*.cjs` |
| 3 | The "no result" path | What a reader is told when a finder returns nothing, per category and per language. | rendered output + source |
| 4 | Bilingual + responsible copy | Rendered text of MuhuratHub and MedicalMuhuratScreen in both languages with the result state seeded, using the `validation/_snapshot-render.cjs` interception technique from `plans/audits/2026-08-18-bugbash-matching-dosha.md`. | `.scratch/bugbash/render-*.cjs` |
| 5 | Cross-surface consistency | The same activity/day asked of the finder, the daily-windows card, the Panchaka surface, the personal overlay and the medical finder — checked for disagreement. | `.scratch/bugbash/p5-*.cjs` |

---

## Findings

### F1 — P0 · Wedding, engagement, Griha Pravesh, Bhoomi Puja and Construction print "Rahu, Gulika and Yamaganda are excluded" over windows that were never filtered for them

The result card renders one fixed sentence under the "Activity-specific clean windows" list
(`src/screens/MuhuratHub.tsx:1090`):

> **EN:** "These windows come from this activity's own filter; Rahu, Gulika and Yamaganda are excluded."
> **HI:** "ऊपर के समय इस कार्य की अलग छँटाई से निकले हैं; राहु/गुलिक/यमगण्ड हटाए गए हैं।"

For the seven Choghadiya-based categories that sentence is true. For the six categories in
`PANCHAKA_WINDOW_CATEGORIES` (`wedding`, `engagement`, `housewarming`, `bhoomi`, `construction`,
`puja`) it is false: those windows come from `computeLagnaPanchaka` and are filtered on
`w.shubha` alone. No Rahu/Gulika/Yamaganda test is ever applied to them.

**Reproduction** — New Delhi, Lahiri, `muhuratScanRange` 2026-01-01 → 2026-12-31, `valid` days only,
counting displayed `activityWindows` that overlap the same row's own `rahu`/`gulika`/`yama`:

```
category       validDays  windows  overlapping Rahu/Gulika/Yama
wedding             85       538        182   (34%)
engagement          53       334        115   (34%)
housewarming        87       546        177   (32%)
bhoomi (Jan–Apr)    38       238         80   (34%)
construction (J–A)  32       199         65   (33%)
--- control: the categories the sentence is true for ---
business (Jan–Apr)  31        76          0
travel   (Jan–Apr)  33       119          0
document (Jan–Apr)  34        68          0
vehicle  (Jan–Apr)  51       133          0
property (Jan–Apr)  27        54          0
```

Concrete instances (all New Delhi 2026, IST):

```
Wedding / Engagement, 2026-02-26
  displayed  ✓ Panchaka Rahita 07:41–10:41
  same row   Gulika Kalam 09:41–11:07   Yamaganda 06:49–08:15
  -> the printed 3-hour "clean" wedding window contains 1h00m of Gulika and 34m of Yamaganda.

Housewarming, 2026-03-01
  displayed  ✓ Panchaka Rahita 14:39–17:00
  same row   Rahu Kalam 16:53–18:20     Gulika Kalam 15:27–16:53
  -> the window ends 7 minutes INSIDE Rahu Kalam and holds Gulika Kalam whole.

Bhoomi Puja / Construction, 2026-01-01
  displayed  ✓ Panchaka Rahita 08:11–09:53
  same row   Gulika Kalam 09:49–11:06   Yamaganda 07:13–08:31
```

**Observed** — the reader is told a wedding/Griha-Pravesh window is free of Rahu, Gulika and
Yamaganda when a third of them are not.

**Expected** — either the window list is filtered against `[rahu, gulika, yama]` the way
`cleanChoghadiyaWindows` already does, or the sentence is made conditional on the window kind.
Silently asserting an exclusion that was not performed is worse than performing neither: the same
screen prints the Rahu Kalam interval elsewhere, so a careful reader can catch Ganak contradicting
itself on one card.

**Cause**
- `src/engine/muhurat.ts:419-429` — `activityWindows()`. The `PANCHAKA_WINDOW_CATEGORIES` branch
  (lines 421-427) filters on `w.shubha` and clamps to the day; it never builds the
  `avoid = [info.rahu, info.gulika, info.yama]` list that `cleanChoghadiyaWindows`
  (lines 412-418) builds three lines above it.
- `src/screens/MuhuratHub.tsx:1090` — the unconditional copy.

Note the fallback path at `muhurat.ts:426` (`return clean.length ? clean : cleanChoghadiyaWindows(...)`)
means the *same category on a different day* can produce properly-filtered Choghadiya windows. So the
guarantee the sentence makes holds on some days and not others, with no visible difference.

**Suggested fix** — in `activityWindows`, run the Panchaka branch's output through the same
`avoid.some(overlaps)` rejection (or clip the windows around the three intervals rather than
dropping them whole, since Panchaka windows are long). Add a gate assertion: for every category and
every valid day, no returned `activityWindow` may overlap that day's `rahu`, `gulika` or `yama`.
`validation/deep-muhurats.cjs` already walks these rows, so the assertion costs one loop.


---

### F2 — P0 · The Muhurat hub prints the same interval, to the minute, under "Good windows today" and "Best avoided today"

`MuhuratHub`'s today strip (`src/screens/MuhuratHub.tsx:458`) builds its good list as

```js
const goodSlots = allChogha.filter((c) => ev.good.includes(c.key) && c.end > nowMs).slice(0, 6);
const avoidSlots = [["rahu", todayP.rahu], ["gulika", todayP.gulika], ["yama", todayP.yama]].filter(...)
```

`goodSlots` is never tested against `avoidSlots`. Choghadiya and Rahu/Gulika/Yamaganda are both
carved from the same eighths of the day, so a bad eighth does not merely *overlap* a good
Choghadiya — it **is** one, boundary for boundary. The two columns then render side by side.

**Reproduction** — rendered text of MuhuratHub, New Delhi, panchang day 2026-02-26, English,
result state seeded with a real `muhuratScanRange` wedding run
(`.scratch/bugbash/render-muhurat.cjs` + `r1.cjs`). Literal harness output:

```
Good windows today
Shubh        6:49 AM–8:15 AM
Labh        12:34 PM–2:00 PM
Amrit        2:00 PM–3:26 PM
Shubh        4:52 PM–6:18 PM
Amrit        6:18 PM–7:52 PM
Shubh        9:26 PM–10:59 PM
Abhijit Muhurat  12:11 PM–12:57 PM
Best avoided today
Rahu Kalam   2:00 PM–3:26 PM
Gulika Kalam 9:41 AM–11:07 AM
Yamaganda    6:49 AM–8:15 AM
```

`Amrit 2:00 PM–3:26 PM` **is** `Rahu Kalam 2:00 PM–3:26 PM`. `Shubh 6:49 AM–8:15 AM` **is**
`Yamaganda 6:49 AM–8:15 AM`. Two of the six windows offered for a wedding that day are the two
windows the same card tells the reader to avoid.

**Frequency** — Delhi, 20 days from 2026-02-01, all six event chips:

```
New purchase             23 / 137 good windows are a Rahu/Gulika/Yamaganda interval
New venture / business   23 / 137
Puja / ritual            23 / 137
Travel                   29 / 183
Housewarming             23 / 137
Wedding-related          23 / 137
  2026-02-02 [travel]   good "char"  13:56–15:17  ==  avoid "Gulika Kalam" 13:56–15:17
  2026-02-03 [purchase] good "amrit" 12:34–13:56  ==  avoid "Gulika Kalam" 12:34–13:56
  2026-02-03 [purchase] good "shubh" 15:18–16:40  ==  avoid "Rahu Kalam"   15:18–16:40
```

**Expected** — the Choghadiya recommendation excludes the three belts, exactly as
`muhurat.ts:52` (`dayMuhurat`) and `muhurat.ts:412-418` (`cleanChoghadiyaWindows`) already do.
This is not a matter of taste: **the same screen already states this policy as its own rule.**
`src/screens/MuhuratHub.tsx:100-104` says of the hora dial —

> "Default OFF — the default behaviour is a hard block: a favourable hora that falls inside
> Rahu Kaal/Gulika/Yamaganda is never offered as a clean recommendation."

The Choghadiya strip fifteen hundred lines below breaks that stated rule, and there is no
practitioner toggle for it either.

**Cause** — `src/screens/MuhuratHub.tsx:458`. One `.filter` is missing; `avoidSlots` is built on the
very next line, so the data is already in hand.

**Suggested fix** — filter `goodSlots` against `avoidSlots` (or reuse
`cleanChoghadiyaWindows`), and — since a blocked window is information a practitioner wants —
either grey it with the belt named, matching the hora dial's `showBlockedHoras` behaviour, or
drop it. Gate: for every day and every event chip, no `goodSlot` may overlap `rahu`, `gulika`
or `yama`.

---

### F3 — P0 · Chandra Bala is inverted for the whole of Krishna Paksha: Ashtama Chandra (8th from the natal Moon) is reported as "supportive", and the 5th/9th as "weak"

`src/engine/daily-windows.ts:176-183`

```ts
function chandraBala(currentSign: number, waxing: boolean) {
  const base = new Set([1,3,6,7,10,11]);
  const extra = waxing ? [2,5,9] : [4,8,12];
  ...good: base.has(distance) || extra.includes(distance)
}
```

`base` is the standard good set. The `extra` arm is where it goes wrong: on a waning
(Krishna-paksha) day the function adds **4, 8 and 12** — the three positions every published
Chandra Bala table treats as the ones to avoid, the 8th (Ashtama Chandra) most emphatically —
and simultaneously demotes 2, 5 and 9 to "weak". The recognised refinement runs the other way:
2/5/9 are the *middling* positions that a strong Moon can redeem; nothing promotes the 8th or
the 12th. No comment, spec or gate in the repo names a source or a competing convention for this,
and `personal-muhurat.ts:11` describes the call only as "waxing/waning aware".

**Reproduction A — the Panchang's Chandra Bala line.** `computeDailyWindows(New Delhi, 2026-08-01)`,
transit Moon in Aquarius, Krishna paksha. Rendered by `DailyWindowsCard.tsx:75`:

```
Chandra Bala supports birth signs: Aries, Taurus, Cancer, Leo, Virgo, Scorpio, Sagittarius, Aquarius, Pisces
  -> Cancer is the 8TH from the transit Moon (Ashtama Chandra) — listed as supportive
  -> Pisces is the 12TH                                        — listed as supportive
  -> Libra  is the 5th  — Ganak: "weak — get a personal check for a major beginning"
```

Over 40 consecutive days from 2026-08-01, Delhi, the 8th-from-Moon sign is called "supportive" on
**24** of them — i.e. on every Krishna-paksha day. `DailyWindowsCard.tsx:81` states the verdict
personally, to a reader who has just picked their own rashi from a dropdown:
`Chandra Bala: supportive` / `चन्द्र बल: अनुकूल`.

**Reproduction B — it removes and keeps days in the personalised Muhurat finder.**
`chandraBala` is one of the two **hard filters** in `personal-muhurat.ts:96`
(`coreOk = taraGood && chandraGood`). Birth `1990-06-25 09:30` New Delhi → Janma Rashi Cancer.
Vehicle Muhurat, New Delhi, 2026-08-01 → 2026-08-05:

```
2026-08-01 transitMoon=Aquarius  8th from Janma  chandraGood=true  => coreOk=true   (day KEPT, badged "Chandra Bala ✓")
2026-08-02 transitMoon=Aquarius  8th from Janma  chandraGood=true  => coreOk=true   (day KEPT)
2026-08-04 transitMoon=Pisces    9th from Janma  chandraGood=false => coreOk=false  (day SET ASIDE, "Chandra Bala weak")
```

Ganak keeps the two Ashtama-Chandra days and sets aside the 9th-house day, then prints the count
as though the filter had protected the reader.

**Expected** — `extra` should add nothing on a waning day (or, if a sourced tradition really does
soften 4/8/12, that tradition must be named on the surface per the project's own
"state which convention you follow" rule). 1, 3, 6, 7, 10, 11 stay good in both pakshas; 4, 8, 12
stay avoided in both.

**Cause** — `src/engine/daily-windows.ts:178`, single line. Consumed at
`daily-windows.ts:233`, `src/components/DailyWindowsCard.tsx:44,75,81`,
`src/engine/personal-muhurat.ts:86,96`.

**Suggested fix** — `const extra = waxing ? [2,5,9] : [];`, then re-baseline
`validation/daily-windows.cjs` and `validation/personal-muhurat.cjs` (neither asserts the
distance→verdict mapping today, which is why this survived both). Add a table assertion:
distances 4, 8 and 12 are never `good`, in either paksha.

---

### F4 — P1 · The Property rule set offers registration days on nakshatras Ganak's own Panchang flags as Ganda Moola, and prints the flagged nakshatra as the *reason* the day is good

`MUHURTA_RULES.property.auspNak` (`src/engine/muhurat.ts:309`) is
`{4, 6, 8, 9, 10, 15, 16, 18, 19, 24, 25, 26}` = Mrigashira, Punarvasu, **Ashlesha**, Magha,
Purva Phalguni, Vishakha, Anuradha, **Mula**, Purva Ashadha, **Purva Bhadrapada**, Uttara
Bhadrapada, Revati.

Three of those — Ashlesha (8), Mula (18), Purva Bhadrapada (24) — are members of the set the very
same file defines twenty lines earlier as
`INAUSP_NAK = new Set([1, 5, 8, 17, 18, 24]); // broadly avoided for new/auspicious work`
(`muhurat.ts:84`). Property is the only category where this happens without a classical warrant:

```
category       auspNak ∩ the engine's own INAUSP_NAK
wedding        Mula                                    <- correct: Mula IS one of the 11 classical Vivah nakshatras
engagement     Mula                                    <- same list, same warrant
mundan         Jyeshtha
property       Ashlesha, Mula, Purva Bhadrapada        <- three, no stated source
vidyarambha    Ardra, Ashlesha, Mula, Purva Bhadrapada <- 22 of 27 nakshatras admitted; see F9
every other    (none)
```

**Reproduction** — Property Muhurat, New Delhi, Lahiri, 2026-01-01 → 2026-06-30. **15 of the 34
valid days offered fall on a nakshatra Ganak's own Panchang flags.** For each, the finder's
"Why this day" line names that nakshatra as a positive reason and scores the day 6 = "Highly
auspicious":

```
2026-01-16  Mula              score 6
   Muhurat finder "Why this day": Mula nakshatra, Friday, 3 good day choghadiya
   Same date, Ganak's daily-windows card: "Ganda Moola"  auspicious=false
2026-02-13  Mula              score 6   -> finder: "Mula nakshatra"        panchang: Ganda Moola, avoid
2026-03-20  Revati            score 6   -> finder: "Revati nakshatra"      panchang: Ganda Moola, avoid
2026-05-14  Revati            score 6   -> finder: "Revati nakshatra"      panchang: Ganda Moola, avoid
2026-01-23  Purva Bhadrapada  score 6   -> finder: "Purva Bhadrapada nakshatra"  (INAUSP_NAK member)
```

**Observed** — a reader choosing a property-registration date is told "Highly auspicious · Why this
day: **Mula nakshatra**", and the same app on the same date tells them the day carries Ganda Moola.
Nothing on either surface reconciles the two. `grep` confirms the word Ganda Moola appears in
exactly two files (`src/engine/daily-windows.ts`, `src/components/DailyWindowsCard.tsx`) — no
Muhurat surface mentions it at all.

**Expected** — two separable things:
1. The `property` nakshatra set needs a stated source. As written it admits Ashlesha and Mula,
   both Gandamoola, while excluding Rohini, Pushya, Hasta, Uttara Phalguni, Uttara Ashadha,
   Dhanishta and Shatabhisha — the stable/fixed stars every other property-type category in this
   same file (`bhoomi`, `construction`, `housewarming`) uses. It is also inconsistent within Ganak:
   `PURCHASE_ACTIONS.property` offers "Sale deed signing" and "Registration" as steps, and those
   route through the `property` rules — while `MUHURTA_RULES.document`, whose own label says
   "Document signing and registration", uses a completely different and much more conventional
   nakshatra list. Ask the same registration question two ways and Ganak answers with two rule sets.
2. Wherever a Muhurat day carries Ganda Moola, that should show as a caution on the Muhurat card,
   the way `muhuratShuddhi` already surfaces Pitru Paksha and Adhik Masa. Silence is what makes it
   a contradiction rather than a stated convention choice.

**Cause** — `src/engine/muhurat.ts:309` (the set), `muhurat.ts:164` (`dayScore` renders any member
of `categoryAuspNak` as a green `g:true` factor, so the flagged star becomes the headline reason),
and the absence of any Ganda Moola term in the Muhurat surfaces.

**Suggested fix** — source or replace the `property` list; either way add a Ganda Moola caution to
`muhuratShuddhi`/`dayScore` so no Ganak surface silently disagrees with another. Gate: for every
category, assert `auspNak ∩ INAUSP_NAK` is empty **or** carries an explicit, commented classical
warrant (wedding/engagement's Mula qualifies; property's three do not today).

---

### F5 — P1 · At a polar latitude the finder returns nothing and blames the wrong thing, then tells the reader to "try a wider range" — the same defect Codex already fixed once, in the medical finder

`muhuratForDate` returns `null` when there is no sunrise (`muhurat.ts:109`), and
`muhuratScanRange` silently `continue`s (`muhurat.ts:437-438`). At Tromsø in June the scan returns
**zero rows**, so the blocker tally is empty and the screen falls through to the generic
no-result copy.

**Reproduction** — Wedding Muhurat, Tromsø (69.65 N), 2026-06-01 → 2026-06-20. Literal rendered
text of MuhuratHub:

```
--- en ---
Best days · Wedding · Jun 1, 2026 – Jun 20, 2026
No auspicious muhurat in this range.
When it's possible: Blocked during Devshayana (roughly mid-July to late November), Kharmas
(mid-December to mid-January, mid-March to mid-April) and while Venus or Jupiter is combust.
Try a wider range.

--- hi ---
शुभ दिन · विवाह · 1 जून 2026 – 20 जून 2026
इस अवधि में कोई शुभ मुहूर्त नहीं।
शुभ काल: देवशयन काल, खरमास तथा शुक्र/गुरु अस्त में विवाह वर्जित. बड़ी अवधि आज़माएँ।
```

**Observed** — three separate untruths in four lines. (a) June 1–20 is *before* Devshayani Ekadashi
(≈25 July 2026), so none of the named blocks apply. (b) "Try a wider range" is advice that cannot
work: every day of the Tromsø summer, and every day of the polar night, fails identically. (c) The
real reason — Ganak's Hindu day is defined from local sunrise, and there is no sunrise — is never
stated, which is exactly the silent failure `AGENTS.md` forbids ("the user must always be able to
tell what the app is doing").

**Regression note** — this is a recurrence, in the sibling engine, of a defect the backlog records
as already found and fixed: *"independent Codex bug bash fixed safety-wall order, **polar
no-sunrise copy** and bypassed future birth dates"* (P0-MEDICAL-MUHURAT closure, 2026-07-28).
`MedicalMuhuratScreen` handles it; `MuhuratHub` never got the same treatment.

**Cause** — `src/engine/muhurat.ts:437-438` drops no-sunrise days without recording that it did;
`src/screens/MuhuratHub.tsx:1033-1039` has no branch for "the scan produced no rows at all", only
for "no row passed".

**Suggested fix** — have `muhuratScanRange` report skipped days (e.g. `{rows, noSunriseDays}`) and
give MuhuratHub a distinct message: name the latitude problem, say the Muhurat day cannot be
defined there, and offer the nearest usable city — never "try a wider range". Gate: assert the
polar branch renders a latitude-specific string, the way `validation/medical-muhurat.cjs`
already does for its own screen.

---

### F6 — P0 · The Muhurat card offers wedding windows that sit inside Bhadra, on the same page that says "Avoid starting auspicious work during Bhadra"

Two independent gaps compound:

1. **Bhadra is sampled once, at sunrise.** `dayScore` (`muhurat.ts:176`) tests
   `info.karana === "Vishti"`, and `info.karana` is the karana at the sunrise instant
   (`muhurat.ts:117-118`, `kn = Math.floor(elong / 6)` computed from `ev.rise`). A Bhadra that
   begins after sunrise is invisible to the finder — while `daily-windows.ts:67-80`
   (`bhadraWindows`) already walks the whole sunrise→sunrise day and finds every one.
2. **Even when Bhadra *is* detected it only costs the day two points.** It is never a blocker in
   `muhuratShuddhi`, and `activityWindows` never subtracts the Bhadra interval, so an offered
   "clean window" can lie wholly inside it.

**Reproduction** — Wedding Muhurat, New Delhi, 2026-04-18 → 2026-04-22. Literal rendered text,
top of the page:

```
Best days · Wedding · Apr 18, 2026 – Apr 22, 2026
Best day
Monday, April 20, 2026
Rohini · tithi 3   Highly auspicious
Why this day: Rohini nakshatra, Monday, 4 good day choghadiya
Activity-specific clean windows
✓ Panchaka Rahita   7:28 AM–9:08 AM
✓ Panchaka Rahita  11:23 AM–1:43 PM
✓ Panchaka Rahita   4:00 PM–6:17 PM
✓ Panchaka Rahita   8:36 PM–10:55 PM
✓ Panchaka Rahita   2:08 AM–2:41 AM, Apr 21
✓ Panchaka Rahita   4:08 AM–4:15 AM, Apr 21
```

Further down **the same rendered page**, from `DailyWindowsCard`:

```
Today's decision windows
Avoid starting auspicious work during Bhadra.
```

and its `Bhadra / Vishti · avoid` row for 2026-04-20 reads **17:50–04:15**. Cross-checked:

```
offered 07:28–09:08 (100 min)  overlapsBhadra = false
offered 11:23–13:43 (140 min)  overlapsBhadra = false
offered 16:00–18:17 (136 min)  overlapsBhadra = TRUE   (last 27 min)
offered 20:36–22:55 (139 min)  overlapsBhadra = TRUE   (entirely)
offered 02:08–02:41 ( 33 min)  overlapsBhadra = TRUE   (entirely)
offered 04:08–04:15 (  7 min)  overlapsBhadra = TRUE   (entirely; Bhadra ends 04:15)
muhurat.ts karana sampled at sunrise: "Gara"  -> the finder never mentions Bhadra at all
```

Four of the six wedding windows Ganak offers on its "Highly auspicious" best day are inside the
interval the same page marks "Bhadra / Vishti · avoid", and the "Why this day" line does not
name Bhadra because the karana at 05:50 was Gara.

**Frequency** — New Delhi, 2026-01-01 → 2026-04-30, `valid` days only:

```
category      validDays  daysCarryingBhadra  finderNamedIt  daysWhose OFFERED window sits in Bhadra
wedding          40            20                 9                     19
housewarming     46            21                 7                     20
vehicle          51            22                 7                     11
business         31            13                 2                      4
```

**Expected** — Bhadra is a hard veto for marriage and Griha Pravesh in every published muhurta
source, and the backlog records "Dedicated Bhadra/Vishti interval and warning" as *shipped*. It
shipped on the Panchang card, not in the Muhurat selection. At minimum the finder should read
`bhadraWindows` (the engine already exists and is already imported into the same screen through
`todayP.dailyWindows`), subtract those intervals from `activityWindows`, and name any remaining
Bhadra in the day's factors.

**Cause** — `src/engine/muhurat.ts:117-118` (karana sampled once at sunrise), `muhurat.ts:176`
(scored, never blocked), `muhurat.ts:412-429` (`activityWindows`/`cleanChoghadiyaWindows` never
subtract Bhadra). The correct interval calculation already exists at
`src/engine/daily-windows.ts:67-80` and is unused by `muhurat.ts`.

**Suggested fix** — call `bhadraWindows(info.rise, info.nextRise)` in `activityWindows` and clip;
add a `Bhadra HH:MM–HH:MM` factor whenever the day carries one. Gate: no offered
`activityWindow` may intersect a `bhadra` interval for the same day.

---

### F7 — P2 · A 7-minute wedding window is offered as one of six equal "clean windows"

Same day as F6, `2026-04-20`: the sixth offered wedding window is `4:08 AM–4:15 AM` — seven
minutes, presented in the same `✓` list, same weight and same styling as the 140-minute one above
it. `validation/panchaka-windows.cjs` guards the *Panchaka display* against sub-minute slivers
(`SLIVER_MS = 60000`, `daily-windows`… `collapseSlivers`), but `activityWindows` inherits whatever
survives the day-clamp at `muhurat.ts:425` and applies no usability floor of its own. Across
Delhi 2026 Q1 no window was sub-minute (see CLEAN below), but short tail windows produced by the
`Math.min(w.end, info.rise + 86400000)` clamp are routine.

**Suggested fix** — drop or visually demote windows below a usable length (a muhurta is 48 min;
even 15 min would be a defensible floor), or label the duration so the reader can see it.

---

### F8 — P1 · A range longer than 400 days is silently truncated

`muhuratScanRange` caps its loop at `i < 400` (`muhurat.ts:435`) and returns without any signal.

**Reproduction** — Vehicle Muhurat, New Delhi, 2026-01-01 → 2027-12-31 (730 days requested):

```
730 days requested -> 400 rows returned, 2026-01-01 .. 2027-02-04
330 days dropped, no flag on the result, no message on the screen
```

The screen's own header keeps printing the range the reader asked for — `Best days · Vehicle ·
Jan 1, 2026 – Dec 31, 2027` — over a list that stops in February 2027. A user hunting a wedding
date across two years is shown a truncated answer as if it were complete, and the "no auspicious
muhurat in this range" branch would tell them to "try a wider range" when a wider range is exactly
what was discarded.

**Cause** — `src/engine/muhurat.ts:431-448`; nothing in `MuhuratHub.tsx` validates or reports the
span. (The 90-day preset means most users never hit it, which is why it is P1 and not P0.)

**Suggested fix** — either cap the date inputs at 400 days with a visible message, or have
`muhuratScanRange` return the truncation so the card can say "showing the first 400 days of your
range". Silent truncation is the failure mode `AGENTS.md` names outright.
