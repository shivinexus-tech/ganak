# Row #29 — round 4 route-content verification

Date: 2026-07-28

Integrated commit: `904ec04`

Additional state observed: uncommitted edits in
`validation/festival-hero-relevance.cjs` and `validation/festival-row-29.cjs`.
Those edits were visible to the requested gate run and were not modified here.

## Verdict

**Gate files pass; rendered route-content contract fails for all 108 intended
overlays.**

The data and screen were validated independently, but their field schemas differ:

| Data module exports | Screen reads |
|---|---|
| `identity` | — |
| `meaning` | `meaning` |
| `practice` | — |
| `completion` | — |
| `timingNote` | `timingNote` |
| `sourceBoundary` | `sourceBoundary` |
| — | `verdict` |

`FestivalGuideScreen` defines completeness as:

```text
verdict && timingNote && sourceBoundary
```

No route-content record has a `verdict` field. Therefore
`routeContentComplete === false` for every one of the 108 records, including all
77 metadata-only routes, all 24 named Ekadashis and all seven weekday Pradoshs.
The answer-first card never renders for this content; required routes render the
visible “distinct guide is not available yet” fallback instead.

This is a **P0 integration defect**. It prevents the new content from reaching
users even though both component gates are green.

## Exact requested gate output

```text
FESTIVAL ROUTE CONTENT PASSED (77 full routes + 24 Ekadashi + 7 Pradosh; 57 hero families; failure fixtures proven)

PASS  canonical route key drives route-specific content lookup
PASS  metadata-only and named-variant routes require distinct content
PASS  bilingual verdict, meaning, timing note and source boundary render answer-first
PASS  missing required content surfaces a visible bilingual error
FESTIVAL ROUTE CONTENT WIRING PASSED

festival-row-29.cjs PASS — 57 guide keys, 181 routes, profiles, heroes, timing wiring

FESTIVAL DEEPLINK REGRESSION PASSED

PASS  166 live openable labels inventoried
PASS  162 required labels covered (159 generated/milestone pages + 3 existing)
PASS  4 Chhath labels use the existing shared page
PASS  0 multi-day labels are explicitly deferred
PASS  181 unique direct routes are valid
PASS  18 season-specific Navadurga routes are valid
PASS  guard simulation rejects a new label without a route
FESTIVAL PAGE COVERAGE PASSED
```

## Independent contract probe

Registry/data inspection produced:

```text
requiredEntries: 162
needsRouteContent: 108
missing route-content records: 0
records incomplete under the screen's field contract: 108
```

The 108/108 failure is deterministic:

- `festivalRouteContentFor(guide.key)` returns a record.
- `localizedRouteContentField(routeContent, "verdict", L)` returns `""`.
- `routeContentComplete` becomes false.
- `RouteSpecificAnswer` is skipped.
- Because these routes satisfy `requiresRouteContent`, the fallback `role=alert`
  is displayed.

## Why the green gates missed it

1. `festival-route-content.cjs` validates the data schema:
   `identity`, `meaning`, `practice`, `completion`, `timingNote`,
   `sourceBoundary`.
2. `festival-route-content-wiring.cjs` performs source-string assertions for a
   different schema:
   `verdict`, `meaning`, `timingNote`, `sourceBoundary`.
3. Neither gate loads both modules and calls the same completeness predicate used
   by the screen.
4. The wiring gate's message “bilingual verdict … render answer-first” is
   therefore a false positive.

## Required fix

Choose one shared schema and enforce it end to end. The least destructive mapping
for the current records is:

| Render purpose | Existing data field |
|---|---|
| Route identity/title | `identity` |
| Answer-first actionable verdict | `practice` |
| Explanation | `meaning` |
| Completion/paran boundary | `completion` |
| Timing note | `timingNote` |
| Tradition/source boundary | `sourceBoundary` |

The route card should render all six fields in the active language. If the product
requires a separate `verdict`, add it to all 108 records and the data gate instead;
do not silently alias it without agreeing on semantics.

## Gate strengthening required

Replace the two disconnected structural claims with a contract integration test:

1. Load `festival-route-content.ts` and `FestivalGuideScreen.tsx`.
2. Export or share the required field list/completeness helper.
3. Iterate the exact 108 required keys.
4. For each key and language, assert that the component contract accepts the
   record and every displayed field is non-empty.
5. Keep a mutation fixture deleting one required field and prove it fails.
6. Render at least one metadata-only route, one Ekadashi and one Pradosh; assert
   the answer card is present and the fallback alert is absent.

Acceptance output must say:

```text
PASS 108/108 route-content records satisfy the rendered component contract
PASS metadata-only, Ekadashi and Pradosh samples render answer-first without fallback
```

Until that passes, round 4 is a recorded failed test/fix iteration, not content
delivery.
