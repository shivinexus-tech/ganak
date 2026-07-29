# Festival display-label bug bash

Date: 2026-07-28

Audit lane: independent, application source read-only

Task: `CODEX-BUGBASH-FESTIVAL-LABELS-2026-07-28`

Inspected branch/HEAD: `main` at `d68a96a`, plus the integration owner's in-progress `src/i18n.ts` fix

## Verdict

**The reported raw-key display defect is fixed in the current working tree, but the
complete label journey is not yet ready to close because named Pradosh search is
broken.**

The current formatter resolves all 41 registered observance labels in English and
Hindi, including all 7 canonical weekday Pradosh keys and all 24 named Ekadashi
keys. The dedicated routes also remain safe because their page titles come directly
from reviewed bilingual metadata rather than from the internal key.

## Root cause and blast radius

Before the in-progress fix, `obsLabel` treated every `pradosh_*` suffix as a legacy
number. The engine now emits canonical keys such as `pradosh_Thursday`; therefore
`parseInt("Thursday")` produced `NaN` and the formatter returned the raw key.

That fallback could reach these visible surfaces:

1. Daily/Muhurat **today summary badge** — `MuhuratHub.tsx:194,224`.
2. Daily/Muhurat **Coming up** fast — `MuhuratHub.tsx:287`.
3. Daily/Muhurat **upcoming fasting list** — `MuhuratHub.tsx:461-464`.
4. Daily/Muhurat **Hora hero sentence** — `MuhuratHub.tsx:817-820`.
5. Calendar **full-year rows** — `CalendarPage.tsx:25-27,35-42`.

The current fix at `i18n.ts:64-80` resolves an exact `OBS_NAME[key]` before the
legacy numeric branch, closing all five paths for both `en` and `hi`.

## Findings

### P1 — all seven named Pradosh searches return no results

`search-upcoming.ts:25-48` correctly recognises the seven English/Hindi Pradosh
names, but it still filters scanner results using obsolete numeric keys:

```text
pradosh_0 … pradosh_6
```

The scanner now emits:

```text
pradosh_Sunday … pradosh_Saturday
```

Reproduced from 2026-01-01 with the real 430-day scanner:

| Query | Result count |
|---|---:|
| Ravi Pradosh / रवि प्रदोष | 0 / 0 |
| Som Pradosh / सोम प्रदोष | 0 / 0 |
| Bhaum Pradosh / भौम प्रदोष | 0 / 0 |
| Budh Pradosh / बुध प्रदोष | 0 / 0 |
| Guru Pradosh / गुरु प्रदोष | 0 / 0 |
| Shukra Pradosh / शुक्र प्रदोष | 0 / 0 |
| Shani Pradosh / शनि प्रदोष | 0 / 0 |

This does not leak a raw ID because no row renders, but it makes the named
observance undiscoverable from both language modes. Replace the numeric comparison
with the canonical weekday key map and pin all fourteen EN/HI queries.

### P2 — today's Ekadashi is deliberately downgraded to the generic label

Both today-facing calls use
`observancesFor(..., null, todayP.dow)` (`MuhuratHub.tsx:194` and `:817`).
Passing a null lunar month means an Ekadashi day can only become the generic
“Ekadashi / एकादशी”, even though `todayP.months.idx` is already available.

This is not a raw-key leak, and the upcoming/year lists do show named Ekadashis.
It is nevertheless an identity inconsistency between two parts of the same page.
Either pass a canonical month token into `observancesFor`, or document and gate
that the today card intentionally remains generic.

### P2 — the new gate does not exercise the search or route/metadata consumers

`validation/festival-display-labels.cjs` currently proves direct formatter calls,
generated Pradosh objects, and the 41-entry label dictionary. It would still pass
with the P1 search failure above.

Extend it to cover:

- every named Pradosh query in English and Hindi, using the real scanner;
- every named Ekadashi query in English and Hindi;
- every emitted fast in all three production call shapes:
  `{key}`, `{key, baseKey:key}`, and
  `{key, baseKey:obsKind(key), isVariant:key!==baseKey}`;
- all 31 named-variant page entries, asserting route title, page heading,
  document-title input and metadata title/description never equal or contain the
  internal key;
- mutations for an unknown raw-looking Pradosh/Ekadashi key, so malformed future
  engine output cannot silently reach the UI.

## Passing evidence

Current working-tree checks:

```text
FESTIVAL DISPLAY LABELS PASSED (41 observances; 7 Pradosh weekdays; EN/HI direct + generated paths)
safe named variant routes 31
Nirjala Ekadashi 1 Jyeshtha_Shukla_11 Nirjala Ekadashi
निर्जला एकादशी 1 Jyeshtha_Shukla_11 Nirjala Ekadashi
```

An 800-day real calendar scan was also passed through `obsLabel` in both languages:
all 24 Ekadashis, all 7 Pradosh variants and all 10 generic recurring observances
resolved to reviewed labels; none rendered an underscore-bearing internal key.

## Closure recommendation

Do not close the bug bash on the formatter check alone. Fix the seven canonical
Pradosh search comparisons, add the search/consumer assertions above, then smoke:

1. Hindi Daily/Muhurat today badge, Coming up, upcoming list and Hora sentence.
2. Hindi and English full-year calendar.
3. Search all seven Pradosh names in both languages and at least one named
   Ekadashi in both languages.
4. Open one Pradosh and one Ekadashi dedicated route; verify heading,
   `document.title`, description and social metadata contain only human labels.
