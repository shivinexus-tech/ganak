# The three samvatsara names — verification and one correction

**Lane:** `CLAUDE-SAMVATSARA-VERIFICATION-2026-08-18`
**Worked:** 2026-08-19 · branch `claude/samvatsara-verification`
**Files touched:** `src/engine/panchang.ts` (`samvatInfo`, `SAMVATSARA`),
`src/engine/calendar-conventions.ts` (`TAMIL_YEARS_EN` comment only),
`validation/samvatsara-years.cjs` (new).

---

## 0. The question, and the answer in one paragraph

On 2026-08-18 in Delhi, Ganak's full-panchang table prints three era years on
three adjacent rows with **three different names from the same sixty-year
cycle** — Shaka 1948 **Parabhava**, Vikram 2083 **Siddharthi**, Gujarati 2082
**Pingala** — from three hard-coded offsets carrying no source. The
calendar-types spec (`plans/2026-08-18-calendar-types-regional-names-spec.md`
§ 6.3) marked this *unverified* rather than asserting a bug. It was right to.

**All three values for that day are correct**, and three different names on one
day is not a defect: they are three separate reckonings that roll on three
different days and, in the northern case, follow a different *rule*. But two of
the three offsets are the right shape and the third is not. The northern
(Vikram) cycle **expunges** a year roughly every 85 solar years; a fixed
arithmetic offset cannot express that. Ganak's `(vikram + 9) % 60` was right
only for Vikram years 2000–2084 — Gregorian 1943-03 to 2028-03 — and wrong on
both sides of that window, including **every year from 2028 onwards**, which was
under two years away when this was found. That one is now fixed; the other two
are verified and unchanged.

| System | Verdict | Confidence |
|---|---|---|
| Shaka (southern luni-solar) | **Correct — unchanged.** Rule matches a primary source verbatim; 192/192 published years | **HIGH** |
| Vikram (northern Barhaspatya) | **Was wrong — corrected.** 107 of 191 published years disagreed | **HIGH** |
| Gujarati (Kartikadi) | **Correct — unchanged.** 192/192 published years, two independent publishers | **MEDIUM** (see § 4) |
| Two romanisations | **Genuinely different traditions — documented, deliberately not merged** | **HIGH** |

---

## 1. Sources

| Tag | Source | Fetched | Used for |
|---|---|---|---|
| **[SD]** | R. Sewell & S. B. Dikshit, *The Indian Calendar* (London, 1896), Arts. 53–62. Public domain; full text `archive.org/stream/IndianCalendarSewelDikshit` | 2026-08-19 | The rule for all three systems; the expunction mechanism; the 1896 measurement of the north–south lead |
| **[W]** | `en.wikipedia.org/wiki/Samvatsara` | 2026-08-19 | Corroborates [SD] on the 361.026721 d Jovian year, the ~85-year expunction, and north-keeps / south-abandoned |
| **[D]** | `drikpanchang.com` day-panchang, New Delhi (`geoname-id=1261481`) — all three era rows plus the Barhaspatya boundary instants, sampled 15 June of every year **1900–2090** (191 years) and daily across each roll-over | 2026-08-19 | The published series every assertion is measured against |
| **[O]** | `outlookindia.com` Ugadi 2026 brand-studio page; `astrogle.com` *Parabhava Nama Samvatsara Ugadi Predictions 2026-27* | 2026-08-19 | Independent confirmation of the Shaka value |
| **[G]** | `hinducalculator.com/gujarati-samvat/` — "Gujarati Samvat 2082 (Pingala)" for August 2026 | 2026-08-19 | Independent confirmation of the Gujarati value |
| **[R]** | `mypandit.com/festivals/gujarati-new-year/` — "Gujarati Vikram Samvat 2082 commences on Wednesday, 22 October 2025"; and, for the Chaitra roll, `subkuz.com` / `bharatarticles.com` — Vikram Samvat 2082 begins 30 March 2025, Chaitra Shukla Pratipada | 2026-08-19 | The two 2025 **roll dates**, where [D] could not be re-queried (see the note under this table) |

**A limit on [D].** Drik Panchang began returning a rate-limit challenge partway
through this work. 191 yearly samples and the 2026 roll-overs were already
captured and are what every [D] claim below rests on; the four 2025 roll dates
could not be fetched. Those four rows are therefore sourced differently and say
so — the roll *date* comes from [R], and the *values* on each side come from the
[D] samples already held for 2025 and 2026 plus the proven step-of-one rule. No
attempt was made to work around the challenge.

**Deliberately not relied on.** Popular Hindi news coverage of the Hindu new year
is not usable here: for Vikram Samvat 2081 alone, three outlets published three
different samvatsara names (*Kalayukta*, *Krodhi*, *Pingala*), and one national
outlet gave Vikram 2083 as *Roudra* — which is the Barhaspatya samvatsara running
in mid-2026, not the one the year opened under. That confusion is itself evidence
that the distinction below is real and worth getting right.

---

## 2. What the three systems actually are

[SD] Art. 62 is the load-bearing passage. The sixty-year cycle exists in **two**
forms, and the split is historical, not regional taste:

- The **Barhaspatya (Jovian)** cycle of the **north**. Its year is the time the
  mean Jupiter takes to cross one sign — **361.026721 days** by the
  Surya-Siddhanta, *"about 4.232 days less than a solar year"* [SD Art. 54]. So
  the cycle creeps forward against the solar year, and *"when two Barhaspatya
  samvatsaras begin during one solar year the first is said to be expunged"* —
  *kshaya*. [SD] puts one expunction *"in every period of 85 solar years"*, with
  the actual interval alternating 85 and 86.
- The **luni-solar** cycle of the **south**. [SD] Art. 62: the cycle of Jupiter
  was in use in southern India before Saka 828 (A.D. 905-6), but from that year
  (Arya Siddhanta) or Saka 831 (A.D. 908-9) (Surya-Siddhanta) *"the expunction of
  the samvatsaras was altogether neglected, with the result that the 60-year
  cycle in the south became luni-solar from that year."* It has been a plain
  cyclic count of years ever since. [W] says the same.

That single historical fact produces the whole phenomenon the owner noticed.
Because the north kept expunging and the south stopped, **the northern count has
been running ahead of the southern for a thousand years, and the lead grows by
one every ~85 years.** [SD] measured it in 1896: *"At present the northern
samvatsara has advanced by 12 on the southern."*

Three different names on one day is therefore the expected output of a correct
engine, not a symptom.

---

## 3. System by system

### 3.1 Shaka — southern luni-solar — VERIFIED, unchanged

[SD] Art. 62 gives the rule outright: *"add 11 to the current Saka year, and
divide by 60; the remainder is the corresponding luni-solar cycle year"*,
counting Prabhava as 1, and *"the samvatsaras of Jupiter's and the southern
cycle, are always to be taken as current years, not expired."*

Ganak's field `shaka` holds the **expired** year (1948 during 2026-27 — the
number panchangs print), so current = expired + 1 and the 1-based remainder
`(current + 11) mod 60` is exactly the 0-based index `(shaka + 11) % 60`. The
shipped code is the primary rule, transcribed correctly.

| Date | City | Ganak | Published | Verdict |
|---|---|---|---|---|
| 2024-06-15 | Delhi | 1946 Krodhi | 1946 Krodhi [D] | ✅ |
| 2025-06-15 | Delhi | 1947 Vishvavasu | 1947 Vishvavasu [D] | ✅ |
| 2026-03-18 | Delhi | 1947 Vishvavasu | 1947 Vishvavasu [D] | ✅ (day before Ugadi) |
| 2026-03-19 | Delhi | **1948 Parabhava** | 1948 Parabhava [D][O] | ✅ (Ugadi roll) |
| 2026-08-18 | Delhi | 1948 Parabhava | 1948 Parabhava [D] | ✅ |
| 1900-06-15 | Delhi | 1822 Sharvari | 1822 Sharvari [D] | ✅ |
| 1950-06-15 | Delhi | 1872 Vikriti | 1872 Vikriti [D] | ✅ |
| 2000-06-15 | Delhi | 1922 Vikrama | 1922 Vikrama [D] | ✅ |
| 2050-06-15 | Delhi | 1972 Pramoda | 1972 Pramoda [D] | ✅ |
| 2100-06-15 | Delhi | 2022 Raudra | 2022 Raudra [D] | ✅ |

Swept every year **1900–2100** against [D]: **192 of 192 exact**, zero
mismatches, and the year number and the name each advance by exactly one every
year with no skips. Confirmed independently for 2026 by [O].

### 3.2 Vikram — northern Barhaspatya — WAS WRONG, corrected

**The defect.** `SAMVATSARA[(vikram + 9) % 60]` is a fixed offset. Since
`vikram = shaka + 135`, it hard-codes a northern lead of exactly **13** for all
time. The lead is not constant — that is the entire point of the northern
system. Measured against [D]:

| Gregorian span | Northern lead over southern | Ganak's fixed +13 |
|---|---|---|
| 1900 – 1942 | **12** (matches [SD]'s 1896 measurement) | wrong, one ahead |
| 1943 – 2027 | **13** | correct |
| 2028 – 2090 | **14** | wrong, one behind |

**107 of the 191 sampled years 1900–2090 disagreed with the published series.**

The two expunctions in range, both visible directly in [D]:

- **Vikram 2000** (Gregorian 1943): the cycle steps *Jaya → Durmukha*.
  **Manmatha is expunged** — it begins 1942-04-14 and ends 1943-04-10, entirely
  inside one solar year, exactly [SD] Art. 54's condition.
- **Vikram 2085** (Gregorian 2028): the cycle steps *Raudra → Dundubhi*.
  **Durmati is expunged.** Ganak would have printed *2085 Durmati* from
  March 2028 onward. Interval since the previous expunction: **85 years**, the
  figure [SD] gives.

| Date | City | Ganak **before** | Ganak **after** | Published [D] | Verdict |
|---|---|---|---|---|---|
| 1900-06-15 | Delhi | 1957 Pramadi | 1957 Paridhavi | 1957 Paridhavi | fixed |
| 1942-06-15 | Delhi | 1999 Manmatha | 1999 Jaya | 1999 Jaya | fixed |
| 1943-06-15 | Delhi | 2000 Durmukha | 2000 Durmukha | 2000 Durmukha | ✅ unchanged |
| 2025-03-29 | Delhi | 2081 Pingala | 2081 Pingala | 2081 Pingala [D 2024 sample] | ✅ unchanged (day before the roll) |
| 2025-03-30 | Delhi | 2082 Kalayukti | 2082 Kalayukti | 2082 Kalayukti [D 2025 sample] | ✅ unchanged (Ganak turns on the published date, 30 Mar 2025 [R]) |
| 2026-03-18 | Delhi | 2082 Kalayukti | 2082 Kalayukti | 2082 Kalayukti [D] | ✅ unchanged |
| 2026-03-19 | Delhi | 2083 Siddharthi | 2083 Siddharthi | 2083 Siddharthi | ✅ unchanged |
| 2026-08-18 | Delhi | 2083 Siddharthi | 2083 Siddharthi | 2083 Siddharthi | ✅ unchanged |
| 2027-06-15 | Delhi | 2084 Raudra | 2084 Raudra | 2084 Raudra | ✅ unchanged |
| **2028-03-27** | Delhi | **2085 Durmati** | **2085 Dundubhi** | 2085 Dundubhi | **fixed** |
| 2029-06-15 | Delhi | 2086 Dundubhi | 2086 Rudhirodgari | 2086 Rudhirodgari | fixed |
| 2050-06-15 | Delhi | 2107 Svabhanu | 2107 Tarana | 2107 Tarana | fixed |
| 2100-06-15 | Delhi | 2157 Shrimukha | 2157 Bhava | 2157 Bhava | fixed |

*(Nothing in 1943–2027 moved. Every value Ganak has ever shown a live user is
unchanged.)*

**Which instant the name is read at.** [SD] Art. 55: *"the samvatsara which is
current at the beginning of a year is in practice coupled with all the days of
that year"*, and Art. 59 makes "the beginning of the year" the **apparent Mesha
sankranti**. Not Chaitra Shukla 1, and not "now". This matters precisely in the
expunction years: at Chaitra 2028 (~26 March) the running Jovian samvatsara is
still Durmati, but Durmati ends 12 April 2028, *before* Mesha sankranti on ~13
April, so Vikram 2085 opens under Dundubhi. [D] agrees. `samvatInfo` already
computed the Mesha sankranti for the Chaitra-boundary test, so the fix reuses
it; between 1 January and Chaitra it looks back to the previous year's.

**How the correction is computed.** The Barhaspatya samvatsara is a *mean*
motion, so it is a straight arithmetic progression in time. Fitting all **191**
Barhaspatya boundary instants [D] publishes over 1900–2090 gives:

```
period 361.032279 days,  epoch JD 2415300.813243 (start of #47 Pramadi,
                                                  1900-10-08 12:36 IST, in UT)
```

with **residuals under 1.5 hours across 200 years** and no missing or extra
boundary — the number increments by exactly one per period, 191 times out of
191. Evaluating that at each year's Mesha sankranti reproduces [D]'s Vikram
samvatsara for **all 192 years 1900–2100, zero mismatches**. The tightest margin
anywhere in the range is 1.04 days (1942), about 17× the model's own scatter, so
the constants are not balanced on a knife edge.

### 3.3 Why not the classical arithmetic instead

[SD] Art. 59(a) gives a pure integer rule (multiply the expired Kali year by
211, subtract 108, divide by 18000; add the quotient to the Kali year plus 27;
the remainder mod 60 counts from Prabhava as 1). It was implemented and tested.
It agrees with [D] on the *structure* — expunctions 85 years apart — but places
them at **1933, 2018 and 2104** where the modern computation puts them at
**1943, 2028 and ~2113**, so the two disagree in **20 of 192 years** (the ten
years following each expunction). The gap is the Surya-Siddhanta's own Jovian
year, 361.026721 d, against the modern 361.032279 d, plus an epoch difference of
about six weeks.

**This is a genuine disagreement between sources and is recorded, not hidden.**
Ganak implements the modern computation, matching Drik Panchang — the project's
stated benchmark, the anchor for every other gate in the suite, and what a user
checking Ganak against their own panchang will be holding. The classical rule is
not "wrong"; it is a different siddhanta. Both agree that a fixed offset is not
an option.

### 3.4 Not implemented, deliberately

Drik also prints a fourth and fifth field: the Barhaspatya samvatsara running
**right now** with its end instant (Raudra, as of August 2026), distinct from
the one the Vikram year opened under (Siddharthi). Ganak shows neither. That is
a scope choice, not an error — but it is exactly the distinction the national
outlet got wrong (§ 1), so if the era rows are ever promoted out of the
collapsed table, showing the running Barhaspatya year alongside is worth
considering.

---

## 4. Gujarati — Kartikadi — VERIFIED, unchanged, MEDIUM confidence

Gujarat runs the **Kartikadi** Vikram Samvat: the year turns at Kartika Shukla 1
(Bestu Varas, the day after Diwali), not at Chaitra. So for roughly five months
of every year — Chaitra to Diwali — the Gujarati number is **one behind** the
North Indian number while both are called "Vikram Samvat". On 2026-08-18 that is
Vikram 2083 next to Gujarati 2082, and it is correct.

Its samvatsara is a **non-expunging cyclic count**, like the southern one:
`(guj + 8) % 60`.

| Date | City | Ganak | Published | Verdict |
|---|---|---|---|---|
| 2025-10-21 | Ahmedabad | 2081 Anala | 2081 Anala [D 2025 sample] | ✅ (day before Bestu Varas [R]) |
| 2025-10-22 | Ahmedabad | **2082 Pingala** | 2082 Pingala [D 2026 sample][G] | ✅ (Bestu Varas roll — Ganak turns on exactly the published date, 22 Oct 2025 [R]) |
| 2026-06-15 | Delhi | 2082 Pingala | 2082 Pingala [D][G] | ✅ |
| 2026-08-18 | Delhi | 2082 Pingala | 2082 Pingala [D][G] | ✅ |
| 2026-11-09 | Delhi | 2082 Pingala | 2082 Pingala [D] | ✅ (day before roll) |
| 2026-11-10 | Delhi | **2083 Kalayukti** | 2083 Kalayukta [D] | ✅ (roll; spelling — § 5) |
| 1900-06-15 | Delhi | 1956 Virodhikrit | 1956 Virodhikrit [D] | ✅ |
| 1950-06-15 | Delhi | 2006 Plava | 2006 Plava [D] | ✅ |
| 2000-06-15 | Delhi | 2056 Khara | 2056 Khara [D] | ✅ |
| 2050-06-15 | Delhi | 2106 Vrisha | 2106 Vrisha [D] | ✅ |
| 2100-06-15 | Delhi | 2156 Prajapati | 2156 Prajapati [D] | ✅ |

Swept every year **1900–2100** against [D]: **192 of 192 exact**, and both sides
of the Kartika roll in 2025 and 2026 are exact. [G] independently prints
"Gujarati Samvat 2082 (Pingala)" for August 2026.

**Why MEDIUM and not HIGH — flagged, per the standing accuracy gate.** The
*output* is verified twice over. What is **not** independently sourced is the
*derivation of the `+8`*. At a given instant the Gujarati name sits 11 or 12
places ahead of the Shaka name in the same sixty-name cycle, and I could find no
published statement of where that phase comes from — no Gujarati-language
panchang authority, and nothing in [SD]. It reproduces two publishers exactly
across two centuries, which is why it stands unchanged; but it rests on
reproduction, not on a stated rule, and a future agent should not upgrade this
to HIGH without finding one.

---

## 5. The two romanisations — a real difference, documented, not merged

`SAMVATSARA` (`src/engine/panchang.ts`) and `TAMIL_YEARS_EN`
(`src/engine/calendar-conventions.ts`) are both sixty entries, both index 0 =
Prabhava, both in the same order. They differ at exactly six indices:

| # | `SAMVATSARA` (Sanskrit) | `TAMIL_YEARS_EN` (Tamil) |
|---|---|---|
| 3 | Pramoda | Pramodoota |
| 4 | Prajapati | Prajotpatti |
| 29 | Durmukha | Durmukhi |
| 30 | Hemalamba | Hevilambi |
| 46 | Pramadi | Pramadicha |
| 49 | Anala | Nala |

Every one of those six is the standard Tamil form of the same name — the list a
Tamil reader expects on a Tamil calendar. **This is the "two traditions" case,
not the "two spellings of one thing" case, and the spec's instinct to unify them
under the `language-leak-scan` one-source-of-truth rule would have flattened a
real regional difference into a false uniformity.** They stay separate.

What *was* missing is any statement of the relationship, so both files now carry
a comment saying they are the same sixty names in the same order and must not be
merged, and `validation/samvatsara-years.cjs` § 8 asserts both are sixty long,
duplicate-free, and divergent at exactly those six indices. A seventh divergence
— someone editing one list and not the other — now fails a gate.

Two smaller spelling notes, recorded and deliberately left alone (changing them
is a user-facing copy change, outside this lane, and would need a snapshot
re-baseline):

- Ganak #51 **Kalayukti**, Drik **Kalayukta**. Both attested.
- Ganak #59 **Akshaya**, Drik **Kshaya**. Both attested; the classical lists
  carry both readings.

---

## 6. Handoff — not mine to fix

The shipped copy labels the traditional lunisolar Shaka year
**"(national calendar year)"**. That is wrong, and misleading in a way a
practitioner will catch: the **Indian National Calendar** is a *different*,
tropical reckoning that merely shares the era number — its months and its year
boundary are not the traditional ones. The traditional Shaka year is the
lunisolar one this engine computes.

The sentence lives in a screen owned by another agent. **Exact change wanted:**

> `Shaka Samvat (national calendar year)` → `Shaka Samvat (traditional Hindu era year)`
> `शक संवत् (राष्ट्रीय कैलेंडर वर्ष)` → `शक संवत् (पारंपरिक हिंदू संवत वर्ष)`

(Same wording as `plans/2026-08-18-calendar-types-regional-names-spec.md` § 4.)

---

## 7. What is still unverified after this pass

Stated plainly, because an unverified claim is worse than an omission.

1. **The Gujarati `+8` phase** has no published derivation (§ 4). Verified by
   reproduction only.
2. **Before 1900 and after 2090** nothing is checked against a published series
   — [D] does not serve those years. The mean-Jovian model extrapolates cleanly
   and the next expunction should land ~2113, but that is a prediction, not a
   verification.
3. **Ganak vs the classical Surya-Siddhanta rule** disagree in 20 of 192 years
   (§ 3.3). Ganak follows the modern/Drik convention. If the owner ever wants the
   classical one, it is a one-line swap and the gate anchors would all move.
4. **The era rows are still buried** in a collapsed table (spec § 6.1). Nothing
   in this lane changed where they render, and none of it is visible on the Daily
   answer.
