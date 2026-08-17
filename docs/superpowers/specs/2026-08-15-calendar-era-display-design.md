# Ganak — Era display and the Panchang date line

**Status:** design, not yet approved. Written 2026-08-15 for backlog row **#70 —
Calendar types and regional Panchang-name display**, whose first required step is a spec.
Covers the era/samvat half of that row. The regional calendar-type half depends on the
open *region-once vs calendar-picker* decision and is scoped in §7, not designed here.

---

## 1. Premise

The Panchang date line names the **month** and the **lunar day**, and never the **year**.
It is therefore not a whole Hindu date.

This is not a theoretical gap. On 2026-08-14 the owner — who knows this domain — could
not tell which dropdown option was "the Hindu Panchang", and could not find Vikram Samvat
in the app at all, while comparing it against Drik. All three samvats Ganak computes
(Shaka, Vikram, Gujarati) render only inside the Muhurat detail table, several scrolls
down. A reader who wants to know what year it is has no reason to look there.

The fix is small. The decisions behind it are not, because **"the year" is not one
number** — Ganak already computes three, the four new regional calendars in #76–#79 each
add a fourth, and two of them share a name with something they are not.

## 2. What is already true (audited against `main` `f037247`, 2026-08-15)

- Five calendar reckonings ship: default Amanta lunar, Gregorian, Purnimanta lunar,
  Tamil solar (Thirukanitha), Bengali solar (Vishuddha Siddhanta).
- The dropdown labels were rewritten in plain language and are **no longer the problem**:
  "South & West Indian lunar (default)", "Regular January–December", "North Indian lunar
  (Sawan etc.)", "Tamil calendar", "Bengali calendar". Do not re-solve this.
- `samvatInfo` computes Shaka, Vikram and Gujarati Samvat, each as
  `"<year> <samvatsara name>"`.
- The Tamil and Bengali solar modes **already print their own era year** on their own
  line (Tamil samvatsara name; Bangabda number).
- `calendarLabel()` is explicitly an interpretation-only layer: the file header states it
  "consumes the canonical Panchang result and never feeds a value back into astronomy or
  festival rules". **That constraint governs everything below.**
- **Defect, open:** `samvatInfo` derives each era's samvatsara name with a different
  offset — Shaka `+11`, Vikram `+9`, Gujarati `+8`. Vikram and Shaka denote the *same*
  year and must resolve to the *same* samvatsara; they do not. For 2026-08-14 at New
  Delhi the engine returns Shaka 1948 **Parabhava** but Vikram 2083 **Siddharthi**, 17
  places apart. See register row #81 / `C4-SAMVATSARA-OFFSET`.

## 3. The name-collision table

The single largest correctness risk in this area is that **several different things are
called almost the same thing**, and three of them sit within ~57 of each other:

| Era | Type | Year on 2026-08-15 | Year starts | Status in Ganak |
|---|---|---|---|---|
| Vikram Samvat | lunar, north Indian | 2083 | Chaitra Shukla 1 | computed |
| Gujarati Samvat | lunar, Kartik start | 2082 | Kartik Shukla 1 | computed |
| Shaka Samvat | lunar, national | 1948 | Chaitra Shukla 1 | computed |
| Bikram Sambat | **solar**, Nepali | 2083 | Baisakh 1 | **absent** (#77) |
| Kollam Era | solar, Malayalam | ~1201 | Chingam 1 | **absent** (#76) |
| Bangabda | solar, Bengali | 1433 | Boishakh 1 | computed + displayed |
| Odia anka | regnal, skips numbers | — | own rule | **absent** (#78) |
| Gaurabda | Gaudiya | — | own rule | **absent** (#80) |

Two consequences fall straight out of this table:

1. **Vikram Samvat and Gujarati Samvat disagree for roughly seven months of every year**
   (Chaitra start vs Kartik start). A Gujarat reader shown a bare "Samvat 2083" between
   Chaitra and Kartik is being shown someone else's year.
2. **Vikram Samvat (lunar) and Bikram Sambat (Nepali solar) currently show the same
   number, 2083, and are different calendars.** When #77 ships, both will be on screen in
   the same product. Whatever wording is chosen must survive that.

## 4. Decisions this spec proposes

### D1 — The year belongs on the date line permanently. **Recommend: yes.**
A date with no year is incomplete, and the detail table is not discoverable. Cost is a few
characters of micro text.

### D2 — Which era leads?
Options:
- **(a) Vikram Samvat always.** Most widely recognised in Ganak's current EN/HI reader
  base; it is what the owner went looking for. Wrong for Gujarat for ~7 months a year.
- **(b) Shaka Samvat always.** India's national civil calendar; unambiguous; but very few
  householders think in Shaka years.
- **(c) Era follows the selected reckoning.** North Indian lunar → Vikram; default Amanta
  → Vikram, or Gujarati Samvat once region is known; Tamil/Bengali → their own era
  (already true); Gregorian → none.

**Recommend (c), with (a) as the interim** until the *region-once vs calendar-picker*
decision lands. (c) is the only option that stays correct as #76–#80 add four more eras,
and it collapses into "your calendar shows your year" — which is the same principle as
the region-once recommendation. Shipping (a) first is safe because it is what (c) resolves
to for the two lunar modes today.

### D3 — Bare year number, or year plus samvatsara name?
Drik prints both ("2083 Siddharthi"). **Recommend bare number for now**, for two reasons:
the line already carries two month names during the Krishna fortnight and is micro text;
and **the samvatsara name is currently wrong for Vikram** (§2). Revisit only after #81 is
fixed — shipping a cited-wrong name next to a correct year is worse than omitting it.

### D4 — Which modes get an era.
- Two lunar modes: **yes** (this spec).
- Gregorian: **no** — it is the civil calendar and carries no samvat.
- Tamil / Bengali solar: **no change** — they already print their own era.
- #76–#79 when they ship: **their own era**, never Vikram.

### D5 — Wording is part of correctness, not copy.
- Never print a bare "Samvat <n>" — always name the era.
- Never render Bikram Sambat as "Vikram Samvat" or vice versa, in either language.
- The era must never appear without the reckoning it belongs to; a year alone is
  meaningless across the table in §3.

## 5. The contract

1. **Interpretation-only.** Era text is derived from the already-computed Panchang result.
   It must never be read back by astronomy, festival, muhurat or fasting rules. Any future
   need to *calculate* from an era is a change to the engine, not to this layer.
2. **One source.** Era values come from `samvatInfo` alone. No screen recomputes a year.
3. **Absent is valid.** If the era value is missing the line renders without it, never as
   an empty separator, a `0` or an `undefined`.
4. **Both languages, always.** An era added in English without its Hindi form is
   incomplete, not partial.

### 5.1 Shipped against this contract (this branch, unmerged)

`calendarLabel()` prefixes the two lunar modes with the Vikram Samvat year, bare number,
EN and HI. Gregorian and both solar modes untouched. Verified for New Delhi, 15 Aug 2026:

```
EN  Vikram Samvat 2083 · Amanta · Shravana · Shukla Paksha · lunar day 3
HI  विक्रम संवत् 2083 · अमान्त · श्रावण · शुक्ल पक्ष · चंद्र दिवस 3
```

This is D1 + D2(a) + D3 + D4. It is deliberately the smallest change that closes the
reported gap and does not foreclose D2(c).

## 6. Validation

Gates, not screenshots. Extend the existing regional-calendar gates rather than adding a
parallel one:

1. **Presence per mode** — the era renders for both lunar modes and is absent for
   Gregorian, across a full year and multiple cities, in EN and HI. A mode that silently
   stops printing its era must fail.
2. **Dated anchors** — pinned year values across a Chaitra boundary (Vikram/Shaka roll)
   and a Kartik boundary (Gujarati roll), so an off-by-one in the new-year rule fails.
3. **Cross-era agreement** — *new, and the one that would have caught #81*: for any given
   instant, every era that denotes the same year must resolve to the same samvatsara name.
   Vikram and Shaka must agree; today they do not. **Watch this gate fail before fixing
   #81**, per the TDD requirement — a gate green on arrival proves nothing.
4. **Collision wording** — once #77 lands, assert that Nepali never renders the string
   "Vikram Samvat" and the lunar modes never render "Bikram Sambat", in either language.

## 7. Out of scope here

The regional calendar-type display half of row #70 — which reckonings appear, how they are
named, where the control lives, URL/state behaviour — is **blocked on the open
*region-once vs calendar-picker* decision**, because that decision determines whether the
control is a picker at all. The audit inventory that row #70 required is delivered and
recorded in the row. Design that half after the owner answers.

## 8. Known weaknesses

1. **D2(a) is knowingly wrong for Gujarat for ~7 months a year.** Accepted as interim
   because the alternative is blocking a small fix on an unmade product decision; it
   resolves when D2(c) lands.
2. **The line grows.** During the Krishna fortnight it now carries an era, two month names
   and a lunar day. If it wraps badly on narrow desktop widths, the answer is to shorten
   the reckoning word, not to drop the year.
3. **This spec assumes the year matters to readers.** Evidence is one expert user
   (the owner) failing to find it. With analytics still unconnected, that is a sample of
   one — the same weakness Phase 0 of the migration design exists to fix.

## 9. Open questions for the owner

1. **D2** — confirm (c) as the target and (a) as the interim, or pick differently.
2. **D3** — is a bare year acceptable long-term, or must Ganak match Drik and print the
   samvatsara name once #81 is fixed?
3. Should the era also appear on the future regional month-grid pages and in share/OG
   text, or only on the app's date line?
