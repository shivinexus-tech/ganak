# Festival day rules — sourcing note

**Status:** IN PROGRESS (research complete, implementation under way)
**Research date:** 2026-08-18
**Scope:** which *kala* (part of the day) decides the civil date of an observance,
for the three defects handed over by
`plans/research/adhik-masa-detection.md` § 7 and
`plans/research/ekadashi-lunar-month-naming.md` § 5.
**Owned gates:** `validation/festival-day-rules.cjs` (new),
`validation/adhik-masa.cjs` (its two pinned residuals), `validation/ekadashi-lunar-naming.cjs`.

---

## 0. The one sentence

Ganak ran **every** Vaishakha festival on the sunrise (*udaya*) rule. Three of
them do not use it: Narasimha Jayanti and Chhinnamasta Jayanti are decided at
**sunset**, and Vat Savitri at **midday**. Because the wrong kala was being
asked, two festivals could vanish entirely and a third was up to a day late —
in most years, not rare ones.

---

## 1. Narasimha Jayanti and Chhinnamasta Jayanti — sunset, not sunrise

### 1.1 The rule

Both are **Vaishakha Shukla Chaturdashi**. Drik Panchang states the reason the
day is decided in the evening, on every Narasimha Jayanti page:

> "It is believed that Lord Narasimha was appeared during sunset while
> Chaturdashi was prevailing."

and the puja window it publishes is named **Sayana Kala** — e.g. 2024-05-21,
New Delhi, "04:24 PM to 07:09 PM". Sunrise that day is 05:27 and sunset 19:09,
so that window is exactly the **last fifth of the daytime**, the fifth of the
five equal day-parts (`pratah, purvahna, madhyahna, aparahna, sayahna`) that
Ganak's `scanDayParts` already computes for its other four names.

The day rule implemented here, stated exactly:

> **Take the day on which Chaturdashi is prevailing at sunset.**
> If Chaturdashi is prevailing at sunset on two consecutive days, take the
> **later** of the two.
> If it is prevailing at sunset on neither day, fall back to the day with the
> greater Chaturdashi share of **Sayahna Kala** (the last fifth of the daytime).

**Source confidence: HIGH for the dates** (13 published dates re-derived below,
none missed). **MEDIUM for the wording of the tie-break**: Drik publishes the
dates but not the nirnaya sentence, so the "later of the two" clause is derived
from its 2025 date rather than quoted from a text. Both branches are exercised
by real years, so both are gated.

### 1.2 Why sunset and not the whole Sayahna window

The narrower criterion is forced by the data. In **2024** Chaturdashi runs
21 May 17:39 → 22 May 18:47 and so is present in the Sayahna window on *both*
days (89 min on the 21st, 144 min on the 22nd). "Greatest Sayahna overlap"
would give 22 May. Drik publishes **21 May**. Only the 21st has Chaturdashi at
the *sunset instant* (the 22nd's Chaturdashi ends 18:47, 22 minutes before
sunset at 19:09). Sunset-instant is therefore the operative test, and Sayahna
is only the documented fallback for the years where no sunset carries it.

### 1.3 Every published date checked

New Delhi (`geoname-id=1261481`), Drik Panchang, all fetched 2026-08-18.
Narasimha Jayanti: `drikpanchang.com/dashavatara/narasimha/narasimha-jayanti-date-time.html?year=YYYY`
Chhinnamasta Jayanti: `drikpanchang.com/hindu-goddesses/parvati/mahavidya/chhinnamasta/jayanti/goddess-chhinnamasta-jayanti-date.html?year=YYYY`

| Year | Chaturdashi (Ganak) | Drik Narasimha | Drik Chhinnamasta | Ganak **before** | rule branch |
| --- | --- | --- | --- | --- | --- |
| 1996 | 01 May 19:59 → 02 May 18:56 | **02 May** | — | 02 May | sayahna fallback (no sunset day) |
| 2024 | 21 May 17:39 → 22 May 18:48 | **21 May** | **21 May** | 22 May ✗ | sunset, day 1 |
| 2025 | 10 May 17:30 → 11 May 20:02 | **11 May** | **11 May** | 11 May | sunset on **both** → later |
| 2026 | 29 Apr 19:52 → 30 Apr 21:13 | (30 Apr) | **30 Apr** | 30 Apr | sunset, day 2 |
| 2027 | 18 May 16:04 → 19 May 16:03 | **18 May** | — | 19 May ✗ | sunset, day 1 |
| 2028 | 07 May 06:06 → 08 May 03:33 | **07 May** | **07 May** | **ABSENT** ✗ | sunset, day 1 |
| 2029 | 26 May 06:35 → 27 May 03:15 | **26 May** | **26 May** | **ABSENT** ✗ | sunset, day 1 |
| 2030 | 16 May 00:15 → 16 May 20:37 | **16 May** | — | 16 May | sunset, single day |
| 2031 | 05 May 13:42 → 06 May 11:40 | **05 May** | — | 06 May ✗ | sunset, day 1 |
| 2032 | 23 May 10:10 → 24 May 09:26 | **23 May** | — | 24 May ✗ | sunset, day 1 |
| 2033 | 12 May 13:03 → 13 May 14:52 | **12 May** | — | 13 May ✗ | sunset, day 1 |
| 2034 | 01 May 12:42 → 02 May 15:13 | **01 May** | — | 02 May ✗ | sunset, day 1 |
| 2035 | 20 May 06:11 → 21 May 07:55 | **20 May** | **20 May** | 21 May ✗ | sunset, day 1 |

Chhinnamasta Jayanti agrees with Narasimha Jayanti on **every year sampled**
(2024, 2025, 2026, 2028, 2029, 2035 — six for six), including the two years
where the sunset rule and the sunrise rule disagree (2024, 2035). That is the
evidence for giving it the same rule; it was **not** assumed from the shared
tithi.

**Ganak was wrong in 10 of the 12 years 2024–2035** — absent in two of them.
2026 and 2030 are the only years where the old sunrise rule happened to agree.

### 1.4 How often each branch fires (Delhi, 1900–2100)

Swept over all 201 Vaishakha Shukla Chaturdashis:

- exactly one sunset-prevailing day: **191 years**
- two sunset-prevailing days (→ later): **7 years** — 1900, 1901, 1956, 1962,
  1963, **2025**, 2088
- no sunset-prevailing day (→ Sayahna fallback): **3 years** — **1996**, 2073, 2082

Both non-trivial branches are anchored to a published Drik date (2025 and 1996),
so neither is a rule invented for a case nobody has checked.

### 1.5 Scope — what this rule was NOT applied to

The generalisation is deliberately narrow: **only these two observances change.**
Every other festival keeps the kala it already had (sunrise, midday, aparahna,
pradosha, nishita, moonrise, sunset). A blanket "if the tithi is skipped, use
the day it begins" rule was explicitly rejected — different observances use
different day rules, and Drik's own 2029 pages show it: Vat Savitri and Shani
Jayanti share a tithi and land on different days.

---

## 2. Vat Savitri — midday, not sunrise

### 2.1 The defect

Ganak ran Vat Savitri on the same sunrise-Amavasya rule as Shani Jayanti, so the
two could never separate. Drik separates them whenever Jyeshtha Amavasya ends
early in the morning.

### 2.2 The rule implemented

> **Take the day on which Amavasya prevails during Madhyahna** — the middle
> fifth of the daytime. When Amavasya reaches into Madhyahna on two consecutive
> days, take the day that holds the **greater share** of it.

Shani Jayanti is left on the sunrise rule, which is what Drik's own Shani
Jayanti pages reproduce ("Shani Jayanti is observed on Amavasya Tithi during
Jyeshtha month according to North Indian Purnimanta calendar").

**Source confidence: HIGH for the dates, MEDIUM for the rule statement.** No
published source found states the kala for Vat Savitri. Drik publishes the
dates and the tithi timestamps but no nirnaya sentence; Wikipedia ("Savitri
Vrata") records only the *tithi* dispute (Nirnayamrit: Jyeshtha Amavasya;
Skanda Purana: Jyeshtha Purnima) which Ganak already models as Vat Savitri vs
Vat Purnima. The kala below is therefore **derived from twelve years of
published dates**, not quoted. See § 2.4 for the alternative formulation that
fits the same data and the years where the two could differ.

### 2.3 Every published date checked

`drikpanchang.com/festivals/savitri/vat-savitri-date-time.html?geoname-id=1261481&year=YYYY`
and `.../festivals/shani-jayanti/shani-jayanti-date-time.html`, all fetched 2026-08-18.

| Year | Jyeshtha Amavasya (Ganak) | Drik Vat Savitri | Drik Shani Jayanti | Ganak **before** |
| --- | --- | --- | --- | --- |
| 2024 | 05 Jun 19:55 → 06 Jun 18:07 | **06 Jun** | 06 Jun | 06 Jun |
| 2025 | 26 May 12:12 → 27 May 08:32 | **26 May** | 27 May | 27 May ✗ |
| 2026 | 16 May 05:11 → 17 May 01:31 | **16 May** | 16 May | 16 May |
| 2028 | 23 May 14:10 → 24 May 13:46 | **24 May** | — | 24 May |
| 2029 | 11 Jun 08:18 → 12 Jun 09:21 | **11 Jun** | 12 Jun | 12 Jun ✗ |
| 2030 | 31 May 09:16 → 01 Jun 11:51 | **31 May** | **01 Jun** | 01 Jun ✗ |
| 2031 | 20 May 11:15 → 21 May 12:47 | **20 May** | — | 21 May ✗ |
| 2034 | 17 May 12:31 → 18 May 08:42 | **17 May** | — | 18 May ✗ |

2028 is the case that rules out the simpler "always take the day Amavasya
begins": Amavasya begins 14:10 on 23 May, **after** Madhyahna has closed
(10:55–13:40), so the 23rd carries none of it and the 24th — which holds only
its first five minutes — is the day Drik publishes. Ganak reproduces that.

**Second, independent source for the split:** `nayidrishtipanchang.com`
(Hindi), "वट सावित्री व्रत 2029", gives **11 June 2029** with the same Amavasya
timestamps. **Disagreement, recorded not hidden:** that page adds "इस दिन शनि
जयंती भी मनाई जाएगी" (Shani Jayanti will also be observed that day), i.e. it
does *not* split the two. Drik does split them, and Drik is Ganak's declared
benchmark (AGENTS.md), so Ganak follows Drik: Vat Savitri 11 June, Shani
Jayanti 12 June 2029.

### 2.4 The formulation question, left open honestly

Two statements of the rule fit **all eight** published dates identically:

- **(A) implemented** — Amavasya prevailing during Madhyahna; greater share wins.
- **(B) alternative** — Amavasya prevailing at the *instant Aparahna begins*
  (three fifths of the way from sunrise to sunset). Single-valued, no tie-break.

They can only diverge when Amavasya both starts inside Madhyahna on one day and
ends inside Madhyahna on the next. § 5 of the gate reports how often that
happens in 1900–2100. (A) was chosen because it reuses the existing, already
gated `tithiKalaOverlap` machinery and is a standard *vyapini* formulation
rather than an instant probe. **Open question for the owner / a sourcing pass:
find a Dharmasindhu or Nirnayasindhu sentence that settles A vs B.**

---

## 3. Padmini and Parama Ekadashi — the leap-month fasts, named

See `plans/research/ekadashi-lunar-month-naming.md` § 5, which sourced the pair
and deliberately left them unnamed because naming them required two guide
pages. This change adds the names and the pages.

- **Padmini Ekadashi** — Adhika Masa **Shukla** paksha
- **Parama Ekadashi** — Adhika Masa **Krishna** paksha

Sourced there to Drik's dated lists (Padmini 27 May 2026, Parama 11 June 2026;
Padmini 26 Mar 2029, Parama 9 Apr 2029) and Wikipedia's Ekadashi table
("Padmini Vishuddha Ekadashi", "Parama Shuddha Ekadashi"). One secondary blog
(rudraksha-ratna.com) prints the 2026 pair swapped; it is wrong (27 May 2026 is
Shukla Ekadashi and the Shukla one is Padmini) and the disagreement is recorded
rather than resolved silently. **Source confidence: HIGH.**

Affected years in the swept range: **2026** (27 May, 11 June), **2029**,
**2031**, **2034**.
