# Festival row 29 — round 5 route audit

Date: 2026-07-28  
Audited revision: `77bf024` (`Preserve Hindi variant observance actions`)  
Scope: independent report-only audit of route inventory, runtime content,
hero selection, legacy redirects, timing contracts, focused gates, and build.

## Result

No genuine route-level P0 defect remains in the audited runtime.

All 181 direct festival routes are accounted for:

| Route category | Count | Round 5 result |
| --- | ---: | --- |
| Substantive guide routes | 55 | Complete |
| Metadata-only routes with dedicated overlays | 77 | Complete |
| Named Ekadashi variants | 24 | Complete |
| Named Pradosh variants | 7 | Complete |
| Navadurga day routes | 18 | Complete |
| **Total** | **181** | **Complete** |

The independent data probe found 108/108 required route-content records, zero
missing bilingual fields, and zero routes without a hero family. The required
fields were `identity`, `meaning`, `practice`, `verdict`, `completion`,
`timingNote`, and `sourceBoundary`, in both English and Hindi.

## Runtime contract

The repaired screen now consumes the content schema that the registry validates:

- `verdict` is a deliberate alias of the route-specific `practice` field.
- `meaning`, `timingNote`, and `sourceBoundary` render in the answer-first panel.
- Missing required route content produces a visible bilingual error.
- Metadata-only and named-variant routes cannot silently fall back to shared
  generic prose.
- Hindi named-variant actions survive the runtime path.

The current hero expression is route-aware:

```tsx
<FestivalRasterHero imageKey={guide.vidhiKey || routeContent.heroKey} />
```

This preserves the reviewed guide hero where one exists and supplies the
route-content hero family for metadata-only pages.

## Hero verification

- 57/57 raster hero families exist.
- Every audited raster is 1280×480.
- All 181 routes resolve to either `vidhiKey` or `routeContent.heroKey`.
- Independent probe: `heroMissing: 0`.
- Route-content wiring gate confirms the route-aware hero expression.

## Legacy redirects

The registry contains ten old-slug redirects and keeps them outside the live
route identity set:

1. `/festival/nrisimha-jayanti` → `/festival/narasimha-jayanti`
2. `/festival/pap-mochini-ekadashi` → `/festival/papmochani-ekadashi`
3. `/festival/padma-ekadashi` → `/festival/parivartini-ekadashi`
4. `/festival/dev-uthani-ekadashi` → `/festival/devutthana-ekadashi`
5. `/festival/putrada-ekadashi-paush-shukla` → `/festival/pausha-putrada-ekadashi`
6. `/festival/putrada-ekadashi-shravan-krishna` → `/festival/shravana-putrada-ekadashi`
7. `/festival/safala-ekadashi-magh-shukla` → `/festival/jaya-ekadashi`
8. `/festival/safala-ekadashi-paush-krishna` → `/festival/safala-ekadashi`
9. `/festival/shatila-ekadashi` → `/festival/shattila-ekadashi`
10. `/festival/phalaharini-ekadashi` → `/festival/vijaya-ekadashi`

`festival-deeplinks.cjs` passed the canonical-route and old-slug checks,
including the local Karva Chauth and Mokshada Ekadashi cases.

## Timing contract

`festival-route-timing-contracts.cjs` passed:

- 16 deciding-kala routes have explicit timing contracts.
- Madhyahna and Aparahna use stable fifths of the local sunrise-to-sunset day.
- Routes without a reviewed deciding-kala rule remain explicitly pending review
  rather than receiving fabricated precision.
- Timing guidance renders bilingually.

## Focused gate evidence

Passed:

```text
FESTIVAL ROUTE CONTENT PASSED
(77 full routes + 24 Ekadashi + 7 Pradosh; 57 hero families;
failure fixtures proven)

FESTIVAL ROUTE CONTENT WIRING PASSED
FESTIVAL ROUTE TIMING CONTRACTS PASSED
FESTIVAL VARIANT IDENTITY PASSED
festival-row-29.cjs PASS — 57 guide keys, 181 routes, profiles, heroes, timing wiring
FESTIVAL DEEPLINK VALIDATION PASSED
FESTIVAL PAGE COVERAGE PASSED
```

Coverage evidence:

```text
166 live labels
162 required
4 Chhath shared
0 deferred
181 unique direct routes
18 Navadurga routes
```

Build:

```text
131 modules transformed
✓ built in 1.73s
```

The existing large-chunk warning remains advisory and is not a route correctness
failure.

## One validation closeout blocker

`festival-hero-relevance.cjs` reported:

```text
FESTIVAL HERO RELEVANCE FAILED (1 problems; 57/57 rasters present)
- FestivalGuideScreen must render FestivalRasterHero for guide keys
```

This is a stale structural assertion, not a runtime hero defect. The gate searches
for the former exact source fragment:

```tsx
<FestivalRasterHero imageKey={guide.vidhiKey}
```

The screen now correctly uses:

```tsx
<FestivalRasterHero imageKey={guide.vidhiKey || routeContent.heroKey}
```

The route-content wiring gate explicitly accepts and verifies the new expression,
and the independent inventory found no missing hero mapping. The remaining
closeout action is to update the stale hero gate assertion to recognize the
route-aware expression, without weakening raster existence, dimensions, or
relevance checks, then rerun it.

## P0 disposition

- Genuine runtime route P0 blockers: **none found**.
- Validation/closure blocker: **one stale hero source-string assertion**.
- Production and phone/desktop smoke status: outside this report-only audit;
  they remain required for the overall row-29 restoration decision.
