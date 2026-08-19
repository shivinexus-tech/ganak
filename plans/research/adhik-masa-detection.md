# Adhika Masa detection — sourcing note and fix record

**Status:** FIXED — gated by `validation/adhik-masa.cjs`
**Research date:** 2026-08-18
**Scope:** how `src/engine/panchang.ts` decides that a lunar month is Adhika
(intercalary), what that decision was getting wrong, which festival dates it
was corrupting, and what it still does not handle.
**Handed off from:** `plans/research/ekadashi-lunar-month-naming.md` § 6b, where
the defect was found while fixing Ekadashi names and could not be fixed because
`panchang.ts` was reserved by another agent.

---

## 1. The rule

The amanta lunar month runs new moon → new moon. It is **Adhika Masa** when the
Sun does not enter a new sidereal rasi anywhere inside it — no sankranti, no
name of its own, so it borrows the next month's name and that name then occurs
twice in the year (Adhika, then nija/suddha).

Wikipedia states the rule and the naming in one sentence:

> "When the Sun does not at all transit into a new rāshi (30° sidereal zodiac)
> but simply keeps moving within a rāshi in a lunar month (before a new moon),
> then that lunar month will be named according to the first upcoming transit."

(`https://en.wikipedia.org/wiki/Adhika-masa`, fetched 2026-08-18.)

Two consecutive Adhika Masas are **impossible**. A synodic month is 29.3–29.8
days and a sidereal solar month 29.3–31.5 days; a month can miss a sankranti
only by a small margin, and the next month then starts that much closer to the
following one. The observed spacing is one Adhika Masa every ~32.5 months.

## 2. The defect

`ensureLmWindow` answered the question by sampling the Sun's sign **one hour
inside each end** of the month:

```js
const sStart = Math.floor(sunSidMs(prevNM + 3600000) / 30);
const sEnd   = Math.floor(sunSidMs(nextNM - 3600000) / 30);
```

That is blind to any sankranti inside those two one-hour slivers. **Mesha
Sankranti 2029 falls at 14 Apr 03:41 IST, 31 minutes after the new moon at
03:10 IST.** The probe stepped straight over it, the lunation looked
sankranti-free, and Ganak reported:

```
2029-03-15 09:49 -> 2029-04-14 03:10  ADHIK Chaitra (Adhik)
2029-04-14 03:10 -> 2029-05-13 19:12  ADHIK Vaishakha (Adhik)
```

Two intercalary months back to back. Over 1900–2100 the shortcut invented
**four** impossible months — March 1907, March 1926, April 2029, June 2045 —
each one a real month that had its sankranti in the first hour after its own
new moon.

Sweep numbers, same script, before and after the fix:

| 1900–2100 | before | after |
| --- | --- | --- |
| lunar months scanned | 2488 | 2488 |
| Adhika Masas found | **80** | **76** |
| back-to-back pairs | **4** | **0** |
| mean gap between them | 31.00 | **32.65** (published ~32.5) |
| gaps outside 27–36 | 6 | 2 (both genuine Kshaya years, § 6) |

## 3. The fix

The month owns the **half-open interval `[prevNM, nextNM)`**, and the Sun's sign
is read at those two real instants instead of at a guessed offset:

```js
const sStart = Math.floor(sunSidMs(prevNM) / 30);
const sEnd   = Math.floor(sunSidMs(nextNM - 1) / 30);
```

**Boundary conventions, stated because both cases occur in real data:**

- A sankranti **exactly at the new moon** belongs to the month that *opens*
  there, not the one that closes. `sStart` is read *at* `prevNM`, i.e. after any
  ingress at that instant, which puts it inside the new month. (2029 is the near
  case: 31 minutes after.)
- A sankranti **in the final minutes before the next new moon** still belongs to
  *this* month. `sEnd` is read at `nextNM - 1` ms, the last instant the month
  owns. (Real case: Dhanu Sankranti 1963-12-16 06:47 IST, 48 minutes before the
  new moon at 07:35 — the old probe missed it too.)

The Sun never retrogrades, so `sStart !== sEnd` is exactly "at least one
sankranti instant lies in `[prevNM, nextNM)`". `validation/adhik-masa.cjs`
does not take that on trust: for all 2487 months it solves for the actual
ingress **instants** and asserts the engine's flag agrees.

## 4. Published references

All fetched 2026-08-18.

| Tag | Source | What it pins |
| --- | --- | --- |
| P | `prokerala.com/festivals/adhik-masam.html` | Adhik Masam starts: 2023-07-18, 2026-05-17, **2029-03-16**, 2031-08-19 |
| H | `hindupad.com/adhik-maas-in-2012-2015-2018-2023-2026-next-adhika-masam/` | month doubled per year: 2026 Jyeshtha, **2029 Chaitra**, 2031 Bhadrapada (19 Aug – 16 Sep 2031), 2034 Ashadha |
| W | `en.wikipedia.org/wiki/Adhika-masa` | the rule; "No adhika-masa falls during the months of Margashirsha to Magha"; adhika Kartika "extremely rare" — once in 1901–2150, in **1963** |
| D | `drikpanchang.com` Hindu calendar, New Delhi (`geoname-id=1261481`), Apr/May/Jun 2029 | every 2029 festival date in § 5 |

**Source confidence: HIGH.** P and H agree independently on all four modern
years, and the corrected engine reproduces both of W's structural constraints
without being told them: no Adhika Margashirsha/Pausha/Magha anywhere in
1900–2100, and exactly one Adhika Kartika, in 1963. Drik's own April 2029 page
labels 9 April 2029 "Parama Ekadashi (**Chaitra Adhika**, Krishna Ekadashi)" —
the adhika month is Chaitra and it ends before 14 April, which is precisely the
corrected output.

No source found dissents. Nothing here is pinned to the live sky.

## 5. What moved — every changed festival date

Only five lunar months in 1900–2100 change, so only five years can move. All
five diffs are month-level corrections; three of the five are in years no user
will look at, and the whole user-visible impact is 2029.

**2029, New Delhi — checked date for date against Drik [D]:**

| Festival | before | after | Drik 2029 | |
| --- | --- | --- | --- | --- |
| Gudi Padwa | *absent* | 14 Apr | 14 Apr | corrected |
| Ugadi | *absent* | 14 Apr | 14 Apr | corrected |
| Chaitra Navratri / Ghatasthapana | *absent* | 14 Apr | 14 Apr | corrected |
| Akshaya Tritiya | 16 Apr | 16 May | 16 May | corrected |
| Parashurama Jayanti | 16 Apr | 16 May | 16 May | corrected |
| Matangi Jayanti | 17 Apr | 16 May | (Vaishakha Shukla 3) | corrected |
| Bagalamukhi Jayanti | 22 Apr | 21 May | (Vaishakha Shukla 8) | corrected |
| Sita Navami | 23 Apr | 22 May | 22 May | corrected |
| Buddha Purnima | 28 Apr | 27 May | 27 May | corrected |
| Narada Jayanti | 29 Apr | 28 May | 28 May | corrected |
| Shani Jayanti | 13 May | 12 Jun | 12 Jun | corrected |
| Vat Savitri | 13 May | 12 Jun | 11 Jun | corrected by a month, ±1 day left (§ 7a) |
| Narasimha Jayanti | 27 Apr | *absent* | 26 May | wrong month → swallowed (§ 7b) |
| Chhinnamasta Jayanti | 27 Apr | *absent* | 26 May | wrong month → swallowed (§ 7b) |
| Kamada Ekadashi | unnamed | 24 Apr, named | 24 Apr | corrected |
| Varuthini Ekadashi | unnamed | 9 May, named | 9 May | corrected |

The worst of it was that **2029 had no nija Chaitra at all**: the Hindu New Year
— Gudi Padwa, Ugadi and the start of Chaitra Navratri — simply did not appear in
Ganak's 2029 calendar.

**1907, 1926, 2045** — the same shape, and every moved date lands one lunar month
later, into the month the corrected calendar gives it:

- 1907: Gangaur 17 Mar → 15 Apr, Lakshmi Panchami 19 Mar → 17 Apr, Ram Navami /
  Swaminarayan Jayanti / Tara Jayanti 23 Mar → 22 Apr, Hanuman Jayanti 29 Mar →
  28 Apr. (The adhika month is Phalguna, not Chaitra.)
- 1926: the same six, 16/18/22/29 Mar → 15/17/21/27 Apr.
- 2045: Gupt Navratri (Ashadha) 16 Jun → 15 Jul, Guru Purnima 29 Jun → 28 Jul,
  and 29 Jun is now correctly Vat Purnima; Dhumavati Jayanti reappears on 22 Jun.

**1963** is a Kshaya Masa year and is discussed in § 6: Vivah Panchami, Gita
Jayanti, Annapurna/Bhairavi/Dattatreya Jayanti move into November 1963 and two
Ekadashis change month label.

Nothing else in 1900–2100 changes. That is not a spot check: `lunarMonthInfo`
and `amantaMonthIdx` are the only consumers of `ensureLmWindow`, and every one
of the 2488 lunar months in the range was diffed month by month.

## 6. NOT handled — Kshaya Masa

A lunar month can rarely contain **two** sankrantis, which decays a month name
out of the calendar entirely. It happens only around Kartika/Margashirsha/Pausha
and only twice in 1900–2100: **1963-11-16 → 12-16** (Vrishchika + Dhanu) and
**1983-01-14 → 02-13** (Makara + Kumbha) — the two Kshaya years the literature
names. Both are why the fixed sweep still shows two spacings of 5 months rather
than ~32: a Kshaya Masa is flanked by two Adhika Masas inside one year.

Ganak has **no compound name** ("Margashirsha-Pausha") for such a month. It
takes `sEnd`, the later of the two, so the earlier name is the one that drops
out — Kartika in 1963-64, Pausha in 1982-83. Both are names the literature says
*can* be kshaya, which is the check that settled the naming rule: an alternative
formulation ("name the month after the rasi holding its opening new moon") would
have made **Magha** the lost month of 1982-83, and Magha can never be kshaya.

This is a pre-existing gap, deliberately left. The gate pins the exact set of
Kshaya months so it cannot change silently.

## 7. Two defects this fix exposed but did NOT cause — `src/engine/festivals.ts`

Both are in another agent's file. Both are pinned in `validation/adhik-masa.cjs`
so they stay visible and can only shrink.

**(a) Vat Savitri is a day late when Amavasya ends early.** Ganak runs Vat
Savitri on the same udaya-Amavasya rule as Shani Jayanti. Drik splits them when
Amavasya ends soon after sunrise: 2029 Vat Savitri 11 Jun, Shani Jayanti 12 Jun.
Ganak says 12 Jun for both. **Not adhika-related** — Ganak matches Drik exactly
in ordinary years (both 2026-05-16, verified against Drik 2026-08-18). Handoff.

**(b) A kshaya tithi still deletes a festival.** Vaishakha Shukla Chaturdashi
2029 begins after the sunrise of 26 May and ends before the sunrise of 27 May,
so it never prevails at a sunrise and the udaya rule emits nothing: **Narasimha
Jayanti and Chhinnamasta Jayanti vanish from 2029** (Drik: 26 May). The same gap
already drops them from **2028**, a year this fix does not touch — which is what
proves it is pre-existing. The Ekadashi work fixed this for Ekadashi only
(`ekadashi-lunar-month-naming.md` § 6a); the general rule was never applied.
Handoff, and the higher-value of the two.

**(c) OPEN QUESTION for the owner — bigger than either.** Almost no festival
honours Adhika Masa at all. `skipAdhik` is set on exactly **two** rules
(`vatPurnima`, `dhumavatiJayanti`). Every other lunar-month festival matches the
month index in *both* the Adhika and the nija month and, because the scan keeps
the first hit, fires in the **Adhika** month — a month early. Tradition puts
these observances in the nija (suddha) month; the adhika month is *mala masa*,
when auspicious rites are not performed. Measured against Drik for 2029:

| | Ganak (before *and* after this fix) | Drik 2029 |
| --- | --- | --- |
| Ram Navami | 24 Mar | **23 Apr** |
| Gangaur | 18 Mar | **17 Apr** |
| Hanuman Jayanti | 30 Mar | **28 Apr** |
| Lakshmi Panchami, Tara Jayanti, Swaminarayan Jayanti | March | April |

This is untouched by the present fix and affects **every** Adhika Masa year —
2026, 2029, 2031, 2034 and onward. It is a religious-accuracy call on roughly
fifteen festivals per adhika year, so it goes to the owner rather than being
decided here. Recommended fix: `skipAdhik: true` becomes the default for every
lunar-month rule, with an explicit opt-out for the handful of observances that
genuinely are kept in the adhika month.

## 8. What the gate proves

`validation/adhik-masa.cjs`, 1900–2100 (2487 lunar months, ~1m45s):

- for every month, the actual sankranti **instants** are re-solved independently
  and the engine's `adhik` flag must agree with `instant ∈ [prevNM, nextNM)`;
- the naming matches the published rule — nija months take the rasi entered,
  adhika months the first upcoming transit;
- the two real boundary cases are asserted by name: 2029's sankranti inside the
  first hour, 1963's inside the last hour;
- **never two Adhika Masas in a row**;
- exactly 76 Adhika Masas, mean spacing 32.72 months against the published ~32.5;
- every spacing is 29–36 months except two, and each of those two is asserted to
  have a Kshaya Masa between them;
- the Kshaya set is exactly {1963-11-16, 1983-01-14};
- no Adhika Margashirsha/Pausha/Magha, and exactly one Adhika Kartika (1963) [W];
- nine Adhika Masa years pinned to P/H by start date and doubled month name,
  each asserted to hold exactly one Adhika Masa;
- twelve Drik-published 2029 festival dates, including two unchanged controls;
- the two residuals of § 7 pinned, each with the instruction to delete the pin
  when the underlying defect is fixed.
