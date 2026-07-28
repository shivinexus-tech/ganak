# Row #29 — round 2 adversarial route audit

Date: 2026-07-28
Tree tested: `main` at `1fd42fc` (contains integrated identity commit
`16f0ef4`)
Scope: read-only route, named-variant, alias and timing verification.

## Round verdict

**Identity calculation fix: PASS. Route migration: FAIL. Timing completeness:
FAIL.**

The integrated fix correctly repairs all 24 Ekadashi identities and all seven
weekday-Pradosh computed keys. A real 800-day scan produces all 31 variant keys
and each canonical key has a registered route. The old public URLs, however, are
only listed in a redirect object; the actual route resolver ignores that object.
All ten legacy paths fall through as unknown. This is the top remaining route P0.

Inventory counts remain:

| Measure | Count |
|---|---:|
| Direct canonical routes | 181 |
| Corrected named variant identities | 31 (24 Ekadashi + 7 Pradosh) |
| Metadata-only routes | 77 |
| Routes with `timing:null` | 96 |
| Routes without hero mapping | 76 |
| Legacy redirects declared | 10 |
| Legacy paths actually resolved/redirected | **0** |
| Unique fast keys produced by 800-day scan | 38 |
| Unique festival keys produced by 800-day scan | 124 |
| Scanned keys absent from registry | 0 |

## What round 1 fixed successfully

1. The independent fixture matches the conventional 24-name Ekadashi sequence.
   The former `Vaisakha_Krishna_11 → Nrisimha Jayanti` identity is absent.
2. `observancesFor(..., dow)` now emits
   `pradosh_Sunday` through `pradosh_Saturday`, exactly matching registry keys.
3. The 800-day production scanner emits every one of the 24 Ekadashi keys and all
   seven weekday-Pradosh keys.
4. Canonical slugs are unique and route coverage stays at 181.

## Remaining P0 defects

### R2-ROUTE-01 — declared legacy redirects are not wired

Severity: **P0**
Cause: `FESTIVAL_LEGACY_PATH_REDIRECTS` is exported by
`src/data/festival-pages.ts`, but neither `festivalGuideFromPath` nor the shell
imports or applies it. `festivalGuideFromPath` only reads
`FESTIVAL_GUIDE_ROUTES[normalizedPath]`.

Every declared migration path currently returns `null`:

| Old path | Intended canonical path |
|---|---|
| `/festival/nrisimha-jayanti` | `/festival/narasimha-jayanti` |
| `/festival/pap-mochini-ekadashi` | `/festival/papmochani-ekadashi` |
| `/festival/padma-ekadashi` | `/festival/parivartini-ekadashi` |
| `/festival/dev-uthani-ekadashi` | `/festival/devutthana-ekadashi` |
| `/festival/putrada-ekadashi-paush-shukla` | `/festival/pausha-putrada-ekadashi` |
| `/festival/putrada-ekadashi-shravan-krishna` | `/festival/shravana-putrada-ekadashi` |
| `/festival/safala-ekadashi-magh-shukla` | `/festival/jaya-ekadashi` |
| `/festival/safala-ekadashi-paush-krishna` | `/festival/safala-ekadashi` |
| `/festival/shatila-ekadashi` | `/festival/shattila-ekadashi` |
| `/festival/phalaharini-ekadashi` | `/festival/vijaya-ekadashi` |

Required fix:

- Resolve aliases before route lookup and replace the browser URL with the
  canonical path, or install equivalent production redirects.
- Do not add aliases as second live identities.
- Add a gate that calls the same resolver the shell calls and verifies all ten
  old paths land on the intended canonical key/path.
- The existing identity gate is insufficient: it only verifies that old paths
  are absent and redirect targets exist.

### R2-TIME-01 — deciding kala exists in the engine but is discarded by page timing

Severity: **P0**

The date-selection engine has a deciding kala for the following routes, while
their metadata has `timing:null`. `findLocalFestivalOccurrence` therefore calls
`vratDetail(..., null)` rather than a route-appropriate timing calculation. The
page can label the selection basis, but does not provide the promised useful
local worship/observance window.

| Route | Engine deciding kala | Missing page timing |
|---|---|---|
| `/festival/ram-navami` | `madhyahna` | local Madhyahna birth-puja window |
| `/festival/hanuman-j` | `udaya` | sunrise/daybreak boundary |
| `/festival/sita-navami` | `udaya` | sunrise boundary |
| `/festival/narasimha-jayanti` | `udaya` | sunrise/day observance boundary |
| `/festival/guru-purnima` | `udaya` | sunrise/day boundary |
| `/festival/hartalika-teej` | `udaya` | sunrise/tithi and completion rule |
| `/festival/anant-chaturdashi` | `aparahna` | local Aparahna window |
| `/festival/maha-ashtami` | `udaya` | sunrise/tithi boundary |
| `/festival/maha-navami` | `aparahna` | local Aparahna window |
| `/festival/dussehra` | `aparahna` | local Vijayadashami/Aparahna window |
| `/festival/sharad-purnima` | `nishita` | local Nishita window |
| `/festival/bhai-dooj` | `aparahna` | local tilak/Aparahna window |
| `/festival/tulasi-vivah` | `aparahna` | local Aparahna window |
| `/festival/gita-jayanti` | `udaya` | sunrise/tithi boundary |
| `/festival/pitru-paksha-begins` | `aparahna-shraddha` | local Shraddha/Aparahna window |
| `/festival/sarva-pitru-amavasya` | `aparahna-shraddha` | local Shraddha/Aparahna window |

Required fix:

- Introduce explicit timing modes for `madhyahna`, `aparahna`, `nishita`,
  `udaya`, and `aparahna-shraddha`, or a typed deciding-kala adapter that
  produces the same visible local answer.
- Gate each mode with at least one independent city/date anchor.
- Fail when an engine `kala`/special deciding rule is paired with
  `timing:null`, unless an explicit reviewed exemption explains why no displayed
  window applies.

### R2-TIME-02 — `timing:null` remains a broad silent fallback

Severity: **P0 for fasting/completion-sensitive pages; P1 otherwise**

There are still 96 routes with `timing:null`. Not all require a clock window, but
the current schema cannot distinguish “reviewed: date-only” from “not
implemented.” This masks missing timing on the 16 proven examples above and on
metadata-only fasts.

Required fix:

- Replace nullable ambiguity with an explicit state:
  `timingMode`, `dateOnlyReason`, or `timingResearchRequired`.
- A published route must have exactly one of those states.
- Prioritize the 16 engine/page mismatches above, then audit the remainder.

### R2-ALIAS-02 — Chhath milestone intent is still non-addressable

Severity: **P1, promote to P0 if milestone links are advertised**

Four calendar keys share `/festival/chhath`; there is no stable path/fragment for
Nahay Khay, Kharna, Sandhya Arghya or Usha Arghya/Paran. The route can find the
sequence, but a shared link cannot preserve which milestone the user opened.

Required fix: add stable milestone fragments/query state without browser storage,
or distinct canonical milestone routes that render the same sequence focused on
the selected day.

## Focused gate evidence

Exact results on the integrated tree:

```text
PASS  independent fixture anchors all 24 Ekadashi month/paksha identities
PASS  all seven computed weekday Pradosh keys round-trip to direct routes
PASS  800-day live scan produces every named Ekadashi and weekday Pradosh route key
PASS  incorrect historical slugs have canonical, non-duplicating redirect targets
FESTIVAL VARIANT IDENTITY PASSED

PASS  166 live openable labels inventoried
PASS  162 required labels covered
PASS  181 unique direct routes are valid
PASS  18 season-specific Navadurga routes are valid
FESTIVAL PAGE COVERAGE PASSED

FESTIVAL DEEPLINK REGRESSION PASSED
SANKRANTI PUNYA KALA REGRESSION PASSED
NAVRATRI TIMING REGRESSION PASSED
PANCHAKA WINDOW REGRESSION PASSED
```

Additional adversarial probes:

```text
fasts unique 38 missing registry 0
festivals unique 124 missing registry 0
legacy redirects declared 10
legacy paths resolved by festivalGuideFromPath 0
```

## Round 2 acceptance boundary

The corrected 31 named identities may be credited as a successful fix round.
Row #29 cannot pass route/timing quality until `R2-ROUTE-01` and
`R2-TIME-01` are fixed and independently rerun. The green current gates must not
be interpreted as redirect or exhaustive timing coverage.
