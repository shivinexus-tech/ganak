# Pradosha (प्रदोष काल) — which definition Ganak follows, and why

Research note, 2026-08-19. Written for the fix on branch
`claude/pradosha-single-definition`. Raised by `XS-PRADOSHA-TWO` in the
2026-08-19 cross-surface consistency audit (finding F3).

This is a **religious-accuracy** matter, so nothing here is chosen for ease of
implementation. Every claim below is dated and attributed, and the gate that
protects it (`validation/daily-windows.cjs`) is anchored to **published third-party
times**, never to Ganak's own output.

---

## 1. The defect, reproduced before anything was changed

Three call sites computed a window called "Pradosha", using **two** different
definitions:

| Site | Surface the reader sees | Rule |
|---|---|---|
| `src/engine/daily-windows.ts` | Panchang → Daily windows card, row **"Pradosha"** | `sunset − dayLen/10` … `sunset + nightLen/10` — 1.5 muhurtas either side of sunset |
| `src/engine/festivals.ts` (`scanDayParts`) | *decides* the observance day for Pradosh Vrat, Dhanteras, Diwali, Ahoi Ashtami, Govatsa Dwadashi | identical to `daily-windows.ts` |
| `src/engine/lakshmi-puja.ts` | Festival guide → Lakshmi Puja panel, **"Pradosh Kaal"** | `sunset` … `sunset + nightLen/5` — three night-muhurtas from sunset |

Reproduced across five cities and five evenings, **25 of 25 disagreed**:

```
New Delhi  2026-01-09  sunset 17:41  |  A 16:38..19:02  |  B 17:41..20:24  >> start +63 min, end +81 min
New Delhi  2026-03-01  sunset 18:20  |  A 17:11..19:35  |  B 18:20..20:49  >> start +69 min, end +74 min
New Delhi  2026-05-14  sunset 19:04  |  A 17:42..20:06  |  B 19:04..21:09  >> start +81 min, end +63 min
New Delhi  2026-11-08  sunset 17:31  |  A 16:26..18:50  |  B 17:31..20:09  >> start +65 min, end +79 min
Mumbai     2026-11-08  sunset 18:02  |  A 16:54..19:18  |  B 18:02..20:34  >> start +68 min, end +76 min
Chennai    2026-07-25  sunset 18:38  |  A 17:21..19:45  |  B 18:38..20:53  >> start +77 min, end +67 min
Kolkata    2026-01-09  sunset 17:08  |  A 16:03..18:27  |  B 17:08..19:46  >> start +65 min, end +79 min
London     2026-07-25  sunset 20:59  |  A 19:25..21:49  |  B 20:59..22:38  >> start +95 min, end +50 min

25 of 25 sampled city-evenings differ.  Worst disagreement: start 95 min, end 95 min.
```

`A` = `daily-windows.ts` / `festivals.ts`. `B` = `lakshmi-puja.ts`.

**And the engine decided with one and displayed the other.** The Lakshmi Puja
panel on the Diwali festival page printed window `B`, while the very page it sat on
had been placed on that date by window `A`.

---

## 2. The published sources

### 2.1 Drik Panchang — Ganak's declared benchmark

Fetched 2026-08-19, `https://www.drikpanchang.com/vrats/pradoshdates.html`.

Drik states the rule in its own words on the Pradosh dates page:

> "For Pradosham Vrat, day is fixed when Trayodashi Tithi falls during Pradosh
> Kaal which starts after Sunset."

and on the New Delhi edition of the same page:

> "The time window after Sunset when Trayodashi Tithi and Pradosh time overlaps
> is auspicious for Shiva Puja."

Both sentences place the window **after** sunset, not around it.

Drik's *published times* settle it beyond argument. Checking all 49 published
2026 Pradosh Puja rows for two cities against the candidate rule
`start = local sunset`, `end = sunset + (night length)/5`:

```
=== New Delhi — Drik published vs (sunset .. sunset + nightLen/5) ===
  2026-01-01  Drik 17:35..20:19   Ganak 17:35..20:19   Δstart +0  Δend +0  MATCH
  2026-02-14  Drik 18:10..20:44   Ganak 18:10..20:44   Δstart +0  Δend +0  MATCH
  2026-05-14  Drik 19:04..21:09   Ganak 19:04..21:09   Δstart +0  Δend +0  MATCH
  2026-08-10  Drik 19:05..21:14   Ganak 19:05..21:14   Δstart +0  Δend +0  MATCH
  2026-11-06  Drik 17:33..20:09   Ganak 17:32..20:09   Δstart -1  Δend +0  MATCH
  2026-12-06  Drik 17:24..20:07   Ganak 17:24..20:07   Δstart +0  Δend +0  MATCH
  22/25 published dates match the rule to within 2 minutes.

=== Washington DC — Drik published vs (sunset .. sunset + nightLen/5) ===
  2026-01-15  Drik 17:10..20:01   Ganak 17:10..20:01   Δstart +0  Δend +0  MATCH
  2026-03-16  Drik 19:16..21:40   Ganak 19:15..21:39   Δstart -1  Δend -1  MATCH
  2026-07-26  Drik 20:25..22:21   Ganak 20:25..22:21   Δstart +0  Δend +0  MATCH
  2026-11-06  Drik 17:02..19:46   Ganak 17:02..19:46   Δstart +0  Δend +0  MATCH
  22/24 published dates match the rule to within 2 minutes.
```

The five rows that are not a two-ended match are the days where **Drik itself
clips the puja window to the Trayodashi tithi** — and on every one of those five,
the *unclipped* end still agrees to within one minute:

```
  Delhi 2026-03-01  Drik 18:21..19:09   Ganak 18:20..20:49   start matches; Drik's END is the tithi ending
  Delhi 2026-06-12  Drik 19:36..21:20   Ganak 19:19..21:19   end matches;   Drik's START is the tithi beginning
  Delhi 2026-12-21  Drik 17:36..20:13   Ganak 17:28..20:12   end matches;   Drik's START is the tithi beginning
  DC    2026-03-30  Drik 19:30..21:25   Ganak 19:29..21:46   start matches; Drik's END is the tithi ending
  DC    2026-11-21  Drik 18:26..19:40   Ganak 16:50..19:40   end matches;   Drik's START is the tithi beginning
```

So **all 49 published rows** are consistent with
`[sunset, sunset + nightLen/5] ∩ Trayodashi`. None is consistent with a window
opening before sunset. The two cities span both a DST-observing zone and a
non-DST one, and the full seasonal range of night lengths.

### 2.2 The classical reckoning

The Kāla-nirṇaya literature — *Nirṇaya Sindhu* and *Dharma Sindhu*, the texts
traditional pañcāṅga-makers follow — defines Pradoṣa as beginning at local sunset
and running **6 ghaṭikās (3 muhūrtas)**. Six ghaṭikās is 2 h 24 m *only at the
equinox*; a muhūrta is a fifteenth of the night, so a proportional night-muhūrta
reckoning is the same rule expressed the way every other Vedic window in this
app is expressed. Three night-muhūrtas = 3/15 = **one fifth of the night**,
starting at sunset. This is exactly Drik's published behaviour.

Consulted 2026-08-19 via the Dharma Sindhu text hosted at
`https://www.kamakoti.org/kamakoti/dharmasindhu/` (Chapter 3,
*Kāla-Māsa-Pakṣa-Tithi Nirṇaya*) and secondary summaries of the ghaṭikā rule.

### 2.3 The dissenting convention — recorded, not hidden

English Wikipedia's *Pradosha* article (read 2026-08-19,
`https://en.wikipedia.org/wiki/Pradosha`) gives a different rule:

> "The auspicious three-hour period 1.5 hours before and after sunset is
> considered as the most suited and optimal time for worship of Shiva on this
> day."

That is a **fixed 90 minutes of clock time either side of sunset** — a genuinely
circulating popular convention, repeated by a number of Indian news and devotional
sites. It is a minority position: it cites no scriptural source, it does not scale
with the season, and no pañcāṅga publisher checked here computes its published
times that way.

**Ganak does not follow it.** The disagreement is stated on the surface — the
Pradosh Vrat guide copy in `src/data/vrat-vidhis.ts` and the Pradosh route note in
`src/data/festival-route-content.ts` both name the rule Ganak uses and note that a
popular alternative places the window either side of sunset, so a reader whose
family follows that convention is not silently contradicted.

Note that **neither** published convention matches what `daily-windows.ts` and
`festivals.ts` were computing. Ganak's old window was 1.5 *seasonal muhurtas*
either side of sunset — not the classical rule, and not the fixed-90-minute
popular one either. It matched nothing.

---

## 3. The decision

**Pradosha begins at local sunset and runs for the first fifth of the night**
(three night-muhurtas; six ghaṭikās at the equinox), where the night is sunset to
the *next* sunrise.

```
pradosha = { start: sunset, end: sunset + (nextSunrise - sunset) / 5 }
```

One implementation, `pradoshaWindow()` in `src/engine/daily-windows.ts`, imported
by `festivals.ts` and `lakshmi-puja.ts`. The two other copies are deleted. The
festival engine now **decides the observance day and displays the window with the
same function**.

`lakshmi-puja.ts` had it right all along; the Panchang card and the festival
day-decider were the wrong ones.

---

## 4. What the fix changes for a reader

Ganak was placing **two Pradosh Vrat days in 2026 that no published pañcāṅga
lists** — 15 February and 29 April for New Delhi — because the hour of the old
window that sat *before* sunset caught Trayodashi on an extra evening. After the
fix Ganak's 2026 Pradosh list is Drik's 25 dates exactly.

For the days Ganak did get right, the printed window was wrong at both ends by
about an hour: on 8 November 2026 in New Delhi the Panchang card said Pradosha ran
**16:26–18:50** when the observance actually runs **17:31–20:09**. A devotee who
arrived at 18:40 for the window Ganak printed would have found it, by Ganak's own
festival page, only just begun; one who took the card at its word and finished by
18:50 would have missed all but the first hour.

---

## 5. Neighbours checked

Same-quantity-implemented-twice was audited across the observance windows:

| Window | Copies found | Status |
|---|---|---|
| **Pradosha** | 3 (`daily-windows.ts`, `festivals.ts`, `lakshmi-puja.ts`) — **2 different rules** | Fixed here: one function, all three read it |
| **Nishitha** | 4 (`daily-windows.ts`, `festivals.ts`, `lakshmi-puja.ts`, `muhurat.ts`) — all agree numerically | 3 consolidated here; `muhurat.ts` is outside this lane's file scope — **handed off** |
| **Brahma Muhurta** | 1 (`daily-windows.ts`) | Single already |
| **Godhuli** | 1 (`daily-windows.ts`) | Single already; sourced against Drik on 4 anchors in 2026-08 |
| **Rahu / Gulika / Yama Kalam** | 2 (`muhurat.ts`, `medical-muhurat.ts`) — both `eighth(SEGMENT[dow])`, agree today | Outside this lane's file scope — **handed off** |
| **Sandhya** | 0 — not computed anywhere as a named window | Nothing to reconcile |
| **Sutak** | Eclipse sutak lives in `eclipse.ts` only | Outside this lane's file scope; single copy |

The `muhurat.ts` / `medical-muhurat.ts` duplicates are the next place this defect
class will surface: four hand-maintained copies of Nishitha and two of Rahu Kalam,
agreeing only by luck.

---

## 6. The gate

`validation/daily-windows.cjs` now asserts, against **published Drik Panchang
times for two cities across a full year** (never against Ganak's own output):

1. The Pradosha window matches Drik's published Pradosh Puja start/end on every
   unclipped date, and matches at the unclipped end on the tithi-clipped ones.
2. The window begins **at** sunset — a regression that reopens it before sunset
   fails immediately.
3. Ganak's 2026 Pradosh Vrat **date list** for New Delhi is exactly Drik's 25
   published dates — this is the *decide* half, and it is what caught the two
   phantom fast days.
4. All three call sites return the **identical** interval, so the definition
   cannot silently fork again.
