# Ekadashi names and the lunar month — sourcing note

**Status:** SOURCED — implemented, gated by `validation/ekadashi-lunar-naming.cjs`
**Research date:** 2026-08-18
**Scope:** which lunar month each named Ekadashi belongs to, which reckoning
(Amanta or Purnimanta) that month name follows, and what happens in an Adhika
Masa. No change to any *date* rule follows from this note; see § 6 for the two
date defects it uncovered.

---

## 1. Why this note exists

`src/engine/festivals.ts` derived each Ekadashi's name from the **Gregorian**
month (`monthNames[(m - 1 + 9) % 12]`). Ekadashi names are lunar-month names, so
the two drifted apart. The audit
`plans/audits/2026-08-18-snapshot-coverage-extension.md` (item 3) caught the 2027
symptoms; the sweep below shows the damage was much wider — 167 of 297 fasts
across 2024–2035 carried the wrong name.

The naming table itself was **not** re-derived from the app's code, because the
app's code was the thing under suspicion. It is established here against two
independent published references and then checked, date by date, for twelve
years.

## 2. Primary reference

**Drik Panchang — Ekadashi dates, New Delhi**
`https://www.drikpanchang.com/vrats/ekadashidates.html?geoname-id=1261481&year=YYYY`
fetched 2026-08-18 for 2024 … 2035 (twelve years, 297 Ekadashis).

Each entry there carries three things Ganak needs together: the civil date, the
vrata name, and the lunar month + paksha ("Magha, Krishna Ekadashi"). Drik is
Ganak's declared benchmark (AGENTS.md), and it is the only source found that
publishes the month label alongside every dated occurrence, which is what makes
a per-date check possible rather than a table-to-table comparison.

**Source confidence: HIGH** for the month/paksha attribution and the names;
**HIGH** for the dates as an India (New Delhi) reference.

## 3. Corroborating reference

**Wikipedia, "Ekadashi"** — table of the 24 named Ekadashis by lunar month and
paksha. It agrees with Drik on every month/paksha slot. Its spellings differ in
eight places; all are the same observance under a regional name:

| Ganak | Drik | Wikipedia |
| --- | --- | --- |
| Papmochani | Papamochani | Papavimocani |
| Devshayani | Devshayani | Shayani |
| Aja | Aja | Annada |
| Parivartini | Parsva | Parsva |
| Indira | Indira | Indra |
| Papankusha | Papankusha | Pasankusa |
| Devutthana | Devutthana | Prabodhini |
| Safala | Saphala | Saphala |
| Jaya | Jaya | Bhaimi / Jaya |

Ganak's spellings are unchanged by this work — renaming would move routes,
guide pages and every snapshot, and no source calls them wrong.

**Source confidence: HIGH** — two independent references, no slot in dispute.

## 4. The convention Ganak follows — Purnimanta

The 24 names are attributed to lunar months in the **Purnimanta (North Indian)**
reckoning, in which Krishna paksha *precedes* Shukla paksha inside a month. Drik
states the two conventions explicitly on the vrata pages, e.g. Yogini Ekadashi:

> "Yogini Ekadashi falls during Krishna Paksha of Ashadha month according to
> North Indian calendar and during Krishna Paksha of Jyaishta month according to
> South Indian calendar."

(`https://www.drikpanchang.com/ekadashis/yogini/yogini-ekadashi-date-time.html`)

**Where the two traditions disagree, and what Ganak does.** They disagree on
every *Krishna-paksha* Ekadashi, and only there:

- **Shukla paksha** — Amanta and Purnimanta give the same month name. No conflict.
- **Krishna paksha** — the Purnimanta month is one ahead of the Amanta month.
  Kamika is *Shravana* Krishna in the North and *Ashadha* Krishna in the South;
  Yogini is *Ashadha* Krishna in the North and *Jyeshtha* Krishna in the South.

**Ganak follows the Purnimanta attribution**, which is what `EKADASHI_NAMES` is
keyed on and what the majority of published lists (Drik, Wikipedia, the ISKCON
calendars) use. This is a naming convention only: the **date** of the fast is
identical in both traditions — the same tithi, the same day. A South-Indian
reader sees the right day under a month label from the Northern reckoning.

The implementation therefore reads the day's Purnimanta month from the panchang
engine (`lunarMonthInfo(sunrise, isKrishna).purnimanta`) and never the civil
month. `src/engine/festivals.ts` already had the correct helper
(`ekadashiIdentityMonth`) and the Muhurat hub already used it; only the calendar
scan did not.

> **Correction to an existing comment.** `src/data/festival-meta.ts` labelled the
> same table "Canonical north-Indian **amanta** month/paksha identity". North
> Indian *is* Purnimanta; the comment contradicted the data it sat above. The
> comment is fixed in this change; the 24 rows were already right.

## 5. Adhika Masa

An intercalary (Adhika / Purushottama) month carries **two extra Ekadashis of
its own**, which do **not** take the surrounding month's names:

- **Padmini Ekadashi** — Adhika Masa **Shukla** paksha
- **Parama Ekadashi** — Adhika Masa **Krishna** paksha

Confirmed by Drik's dated lists (Padmini 27 May 2026, Parama 11 June 2026;
Padmini 26 Mar 2029, Parama 9 Apr 2029; and the 2031 and 2034 pairs) and by
Wikipedia ("Padmini Vishuddha Ekadashi", "Parama Shuddha Ekadashi").

One secondary blog (rudraksha-ratna.com) prints the 2026 pair **swapped**
(Parama 27 May, Padmini 11 June). It is wrong: 27 May 2026 is Shukla Ekadashi,
and the Shukla one is Padmini. Recorded here so the disagreement is not silently
resolved. **Source confidence on the pair: HIGH** (Drik + Wikipedia + the
paksha rule agree; one blog dissents and is internally inconsistent).

**What Ganak ships today.** The Adhika pair is detected and deliberately shown
**unnamed** — the plain "Ekadashi" label — rather than borrowing an ordinary
month's vrata name. That is the safe failure: a devotee sees an Ekadashi on the
right day with no name, instead of being told it is Mohini or Amalaki when it is
not. Naming them properly needs two new labels *and* two guide pages, because
`validation/festival-page-coverage.cjs` requires a route for every named label.
**Handoff, not done here.**

Adhika Masa years inside the swept range: 2026, 2029, 2031, 2034.

## 6. Two date defects found while sourcing this (not naming defects)

**(a) Kshaya Ekadashi vanished from the calendar — FIXED here.**
Ganak only emitted a fast when the tithi prevailed at sunrise. When an Ekadashi
tithi is *kshaya* — it begins after one sunrise and ends before the next — the
fast disappeared entirely. Drik, New Delhi, Yogini Ekadashi 2026: tithi begins
08:16 on 10 July, ends 05:22 on 11 July, sunrise 11 July is 05:30; Drik places
the vrata on **10 July**, the day the tithi begins. Ganak showed nothing at all.
Twelve fasts were missing across 2024–2035 (2025-06-21, 2025-12-30, 2026-07-10,
2026-11-20, 2027-07-29, 2028-04-05, 2031-08-28, 2032-09-15, 2032-12-12,
2033-05-24, 2033-10-04, 2034-12-21). The scan now emits the kshaya Ekadashi on
the day the tithi begins. It only ever **adds** days; no existing day moved.
The same kshaya rule may apply to Pradosh, Purnima and Amavasya — **not**
investigated, **not** changed. Handoff.

**(b) Adhika Masa is mis-detected in 2029 — NOT fixed (other agent's file).**
`src/engine/panchang.ts`, `ensureLmWindow`, samples the sun one hour after the
new moon (`sunSidMs(prevNM + 3600000)`). Mesha Sankranti 2029 falls at
14 Apr 2029 03:41 IST, **31 minutes after** the new moon at 03:10 IST, so that
lunation looks sankranti-free and is flagged Adhika — giving two consecutive
Adhika months, which is astronomically impossible. Consequences: Kamada
(24 Apr 2029) and Varuthini (9 May 2029) lose their names, and — much wider than
Ekadashi — `amantaMonthIdx` returns Vaishakha for a Chaitra month, which moves
every 2029 festival keyed on the month index (Chaitra Navratri, Ram Navami,
Akshaya Tritiya …). **P0 handoff to the panchang owner.** The two affected dates
are pinned as documented exceptions in the new gate so the defect cannot hide.

## 7. What the gate proves

`validation/ekadashi-lunar-naming.cjs`, 2024–2035, New Delhi:

- the published reference is itself a clean one-step Purnimanta cycle;
- Ganak emits the same **number** of Ekadashis as the reference in all twelve years;
- every Ekadashi carries the reference's name, or is one of ten documented
  unnamed days (eight Adhika, two from defect 6b) — each of which is separately
  asserted to be **unnamed, never mis-named**;
- 172 windows of 24 consecutive fasts contain each of the 24 identities exactly
  once — no duplicate, no omission inside a lunar year;
- consecutive fasts advance exactly one step around the cycle;
- the engine table and the display table agree in both languages;
- date drift against the reference is pinned at ≤ 19 of 297 (all ±1 day, the
  separate tithi-boundary item) so it can shrink but never silently grow.
