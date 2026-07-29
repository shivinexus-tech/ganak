# Festival display-label adversarial fixture matrix

Date: 2026-07-28  
Lane: independent read-only audit for `CODEX-BUGBASH-FESTIVAL-LABELS-2026-07-28`  
Application source: read-only; this report is the only file owned by this lane.

## Verdict

The in-progress `obsLabel` fix correctly resolves all 41 registered observance
labels in English and Hindi, including the seven modern weekday-name Pradosh keys.
The gate must also pin legacy numeric compatibility and reject malformed suffixes:
the current formatter still accepts `pradosh_1junk` as Som Pradosh and emits raw
keys or a blank label for other unknown input.

There is one additional **P0 user-facing defect outside the formatter**:
`searchUpcoming` still filters Pradosh results using the retired numeric engine
keys. Both generic and named Pradosh searches return zero results. Generic
Ekadashi search is also intercepted by the first named-variant substring match and
returns only Kamada Ekadashi.

## Production data contract found

- Engine output: seven modern keys, `pradosh_Sunday` through
  `pradosh_Saturday`; each occurrence has `baseKey: "pradosh"` and
  `isVariant: true`.
- Backward compatibility: historical engine output used `pradosh_0` through
  `pradosh_6`, Sunday-first.
- Registry: `OBS_NAME` contains 10 generic observances, seven modern Pradosh
  variants, and 24 canonical Ekadashi variants: 41 total.
- Dedicated routes read the bilingual title directly from `OBS_NAME`.
- Daily summary, Daily “Coming up”, Fasts & Festivals list, calendar year/search,
  and the Hora note all call `obsLabel`, but with four different object shapes.

## Required gate matrix

Every row below must pass in both `en` and `hi`. For registered labels, an
unsupported language such as `fr` must fall back to English.

### A. Modern Pradosh engine keys — 7

Test each key twice:

1. direct/calendar shape: `{ key }`;
2. generated/list shape:
   `{ key, baseKey: "pradosh", isVariant: true, fasting: true }`.

| Engine key | English | Hindi |
|---|---|---|
| `pradosh_Sunday` | Ravi Pradosh | रवि प्रदोष |
| `pradosh_Monday` | Som Pradosh | सोम प्रदोष |
| `pradosh_Tuesday` | Bhaum Pradosh | भौम प्रदोष |
| `pradosh_Wednesday` | Budh Pradosh | बुध प्रदोष |
| `pradosh_Thursday` | Guru Pradosh | गुरु प्रदोष |
| `pradosh_Friday` | Shukra Pradosh | शुक्र प्रदोष |
| `pradosh_Saturday` | Shani Pradosh | शनि प्रदोष |

Also generate all seven through
`observancesFor(false, 13, "Chaitra", dow)` and assert:

- `dow` 0–6 emits the exact Sunday–Saturday key above;
- the generated object formats to the corresponding bilingual label;
- the key round-trips to the matching permanent route:
  `/festival/ravi-pradosh` through `/festival/shani-pradosh`.

### B. Legacy numeric Pradosh keys — 7

These are compatibility inputs only; they must never become second route
identities. Test both the direct and `baseKey/isVariant` shapes.

| Legacy key | English | Hindi |
|---|---|---|
| `pradosh_0` | Ravi Pradosh | रवि प्रदोष |
| `pradosh_1` | Som Pradosh | सोम प्रदोष |
| `pradosh_2` | Bhaum Pradosh | भौम प्रदोष |
| `pradosh_3` | Budh Pradosh | बुध प्रदोष |
| `pradosh_4` | Guru Pradosh | गुरु प्रदोष |
| `pradosh_5` | Shukra Pradosh | शुक्र प्रदोष |
| `pradosh_6` | Shani Pradosh | शनि प्रदोष |

The parser must use an exact pattern such as `^pradosh_([0-6])$`, not
`parseInt`, so compatibility does not silently bless malformed keys.

### C. Named Ekadashi keys — 24

For every row, assert registry/engine bilingual parity and format both:

1. `{ key }`, used by `CalendarPage`;
2. `{ key, baseKey: "ekadashi", isVariant: true, fasting: true }`, emitted by
   the engine and used in the Daily/Muhurat surfaces.

| Key | English | Hindi |
|---|---|---|
| `Chaitra_Shukla_11` | Kamada Ekadashi | कामदा एकादशी |
| `Vaisakha_Shukla_11` | Mohini Ekadashi | मोहिनी एकादशी |
| `Jyeshtha_Shukla_11` | Nirjala Ekadashi | निर्जला एकादशी |
| `Ashadha_Shukla_11` | Devshayani Ekadashi | देवशयनी एकादशी |
| `Shravan_Shukla_11` | Shravana Putrada Ekadashi | श्रावण पुत्रदा एकादशी |
| `Bhadrapad_Shukla_11` | Parivartini Ekadashi | परिवर्तिनी एकादशी |
| `Ashwin_Shukla_11` | Papankusha Ekadashi | पापांकुशा एकादशी |
| `Kartik_Shukla_11` | Devutthana Ekadashi | देवोत्थान एकादशी |
| `Margshirsh_Shukla_11` | Mokshada Ekadashi | मोक्षदा एकादशी |
| `Paush_Shukla_11` | Pausha Putrada Ekadashi | पौष पुत्रदा एकादशी |
| `Magh_Shukla_11` | Jaya Ekadashi | जया एकादशी |
| `Phalgun_Shukla_11` | Amalaki Ekadashi | आमलकी एकादशी |
| `Chaitra_Krishna_11` | Papmochani Ekadashi | पापमोचनी एकादशी |
| `Vaisakha_Krishna_11` | Varuthini Ekadashi | वरूथिनी एकादशी |
| `Jyeshtha_Krishna_11` | Apara Ekadashi | अपरा एकादशी |
| `Ashadha_Krishna_11` | Yogini Ekadashi | योगिनी एकादशी |
| `Shravan_Krishna_11` | Kamika Ekadashi | कामिका एकादशी |
| `Bhadrapad_Krishna_11` | Aja Ekadashi | अजा एकादशी |
| `Ashwin_Krishna_11` | Indira Ekadashi | इंदिरा एकादशी |
| `Kartik_Krishna_11` | Rama Ekadashi | रमा एकादशी |
| `Margshirsh_Krishna_11` | Utpanna Ekadashi | उत्पन्ना एकादशी |
| `Paush_Krishna_11` | Safala Ekadashi | सफला एकादशी |
| `Magh_Krishna_11` | Shattila Ekadashi | षट्तिला एकादशी |
| `Phalgun_Krishna_11` | Vijaya Ekadashi | विजया एकादशी |

Also assert every key is produced in an 800-day live scan and round-trips to its
permanent page, as `festival-variant-identity.cjs` already does.

### D. Generic observances — 10

Test direct `{ key }` and `{ key, baseKey: key }`.

| Key | English | Hindi |
|---|---|---|
| `ekadashi` | Ekadashi | एकादशी |
| `pradosh` | Pradosh Vrat | प्रदोष व्रत |
| `sankashti` | Sankashti Chaturthi | संकष्टी चतुर्थी |
| `vinayakaChaturthi` | Vinayaka Chaturthi | विनायक चतुर्थी |
| `skandaShashti` | Skanda Shashti | स्कंद षष्ठी |
| `masikDurgashtami` | Masik Durgashtami | मासिक दुर्गाष्टमी |
| `kalashtami` | Kalashtami | कालाष्टमी |
| `masikShivaratri` | Masik Shivaratri | मासिक शिवरात्रि |
| `purnima` | Purnima | पूर्णिमा |
| `amavasya` | Amavasya | अमावस्या |

### E. Caller-shape regression fixtures

The gate should explicitly model every current call site rather than testing only
one convenient object:

| Surface | Shape passed to `obsLabel` | Required result |
|---|---|---|
| Daily “Today” summary | complete `observancesFor` object | exact variant EN/HI |
| Daily Hora note | complete `observancesFor` object | exact variant EN/HI |
| Daily “Coming up” | `{ key, baseKey: key }` | exact variant EN/HI |
| Fasts & Festivals list | `{ key, baseKey: obsKind(key), isVariant }` | exact variant EN/HI |
| Calendar year/search | `{ key }` | exact variant EN/HI |
| Dedicated route | `entry.title` from `OBS_NAME` | exact route EN/HI |

No output may contain `pradosh_`, match
`^[A-Za-z]+_(Shukla|Krishna)_11$`, be blank, or be `undefined`.

### F. Malformed and unknown mutation fixtures

Expected behavior: never show an implementation key to a user. A malformed
Pradosh input should fall back to the localized generic Pradosh label; an unknown
`*_11` variant should fall back to localized generic Ekadashi. A completely
unknown/missing key should return a safe localized generic observance label (or a
deliberately visible development error outside production), never raw/blank UI.

| Mutation | Current result | Required gate result |
|---|---|---|
| `pradosh_7` | raw key | generic Pradosh EN/HI |
| `pradosh_-1` | raw key | generic Pradosh EN/HI |
| `pradosh_01` | incorrectly accepted as Som | reject; generic Pradosh |
| `pradosh_1junk` | incorrectly accepted as Som | reject; generic Pradosh |
| `pradosh_monday` | raw key | generic Pradosh |
| `pradosh_Funday` | raw key | generic Pradosh |
| `pradosh_Thursday_extra` | raw key | generic Pradosh |
| `Unknown_Shukla_11` | raw key in direct shape | generic Ekadashi |
| `Unknown_Shukla_11` + Ekadashi base | generic Ekadashi | retain |
| `unknownInternalKey` | raw camel-case key | safe localized fallback |
| `{}` | `undefined`/blank | safe localized fallback |
| `null` observance | throws | no crash; safe localized fallback |

## Additional defects found

### P0 — Pradosh search still expects retired numeric keys

`src/engine/search-upcoming.ts` identifies the correct weekday number using
`PRADOSH_NAMES_BY_DAY`, but filters the modern scanner output with
`` `pradosh_${dayNum}` ``. The engine now emits
`pradosh_Sunday` … `pradosh_Saturday`.

Reproduced from 2026-01-01, Delhi offset, 430-day search:

| Query | Current results | Expected |
|---|---:|---|
| `Pradosh` | 0 | upcoming Pradosh occurrences |
| `प्रदोष` | 0 | upcoming Pradosh occurrences |
| `Som Pradosh` | 0 | Monday Pradosh occurrences |
| `सोम प्रदोष` | 0 | Monday Pradosh occurrences |

The search fixture should assert both languages and all seven named variants,
using the same modern key table as the engine. A generic Pradosh query must return
all upcoming Pradosh occurrences rather than selecting the first weekday name.

### P1 — Generic Ekadashi search collapses to Kamada

The named-variant loop uses substring matching before generic tithi matching.
Therefore `Ekadashi` and `एकादशी` match the first table entry, Kamada, and return
one Kamada occurrence instead of the upcoming Ekadashi sequence.

Reproduced from 2026-01-01:

| Query | Current results | Expected |
|---|---:|---|
| `Ekadashi` | 1 × `Chaitra_Shukla_11` | all upcoming Ekadashis within result cap |
| `एकादशी` | 1 × `Chaitra_Shukla_11` | all upcoming Ekadashis within result cap |

Exact named queries such as `Kamada Ekadashi`/`कामदा एकादशी` correctly return
the named occurrence.

### P2 — Ambiguous Putrada search silently selects one annual variant

`Putrada Ekadashi`/`पुत्रदा एकादशी` returns only
`Shravan_Shukla_11`; Pausha Putrada is silently omitted because the search stops
at the first substring match. Exact qualified searches should remain distinct,
while an unqualified shared name should return both canonical variants or prompt
the user with both choices.

## Suggested acceptance assertions

1. Exact counts: 7 modern Pradosh, 7 legacy numeric compatibility inputs,
   24 Ekadashi variants, 10 generics.
2. Exact EN/HI label equality for both direct and engine/list object shapes.
3. Registry parity: every engine variant has one `OBS_NAME` entry and one
   permanent route; legacy numeric keys have no route.
4. Exact legacy parsing only; malformed mutations cannot inherit a weekday label.
5. No raw-key, blank, `undefined`, or thrown-error fallback.
6. Search proof for generic Pradosh/Ekadashi plus all seven named Pradosh labels
   and all 24 exact named Ekadashi labels in both languages.
7. A failure fixture that reintroduces numeric search matching or moves generic
   substring matching ahead of generic queries must fail.

## Evidence commands run

```text
node validation/festival-display-labels.cjs
FESTIVAL DISPLAY LABELS PASSED (41 observances; 7 Pradosh weekdays; EN/HI direct + generated paths)

Adversarial direct formatter probe:
pradosh_1junk => Som Pradosh / सोम प्रदोष
pradosh_7 => pradosh_7
Unknown_Shukla_11 => Unknown_Shukla_11
{} => undefined

Adversarial search probe:
Pradosh => 0
Som Pradosh => 0
प्रदोष => 0
सोम प्रदोष => 0
Ekadashi => 1 Chaitra_Shukla_11
एकादशी => 1 Chaitra_Shukla_11
Putrada Ekadashi => 1 Shravan_Shukla_11
पुत्रदा एकादशी => 1 Shravan_Shukla_11
```
