# Festival row 29 — round 5 hero audit

Date: 2026-07-28
Auditor: Codex independent round 5
Audited commit: `77bf024`

## Verdict

The runtime and raster inventory satisfy the P0 hero requirement: all 181 festival
routes have a hero disposition, and all 57 worship-guide rasters are present,
correctly sized, decodable, and byte-unique.

The canonical hero gate is nevertheless red because its source-text assertion is
stale. It looks only for the former literal
`<FestivalRasterHero imageKey={guide.vidhiKey}` while the screen now correctly
renders the broader expression
`imageKey={guide.vidhiKey || routeContent.heroKey}`. This is a validation P0
blocker, not a runtime wiring defect. Full closure must wait for that assertion to
be updated and the gate rerun.

## Route-level disposition

Independent inventory of `FESTIVAL_PAGE_ROUTES` found:

| Disposition | Routes |
| --- | ---: |
| Route-owned Navadurga image (`form.image`) | 18 |
| Worship-guide parent (`vidhiKey`) | 86 |
| Route-content parent (`heroKey`) | 77 |
| Missing disposition | 0 |
| **Total** | **181** |

The screen consumes both parent forms at runtime:

```tsx
<FestivalRasterHero
  imageKey={guide.vidhiKey || routeContent.heroKey}
```

`node validation/festival-row-29.cjs` passed:

```text
festival-row-29.cjs PASS — 57 guide keys, 181 routes, profiles, heroes, timing wiring
```

## Raster inventory

Direct filesystem and Sharp-decoder inspection found:

```text
Guide keys:               57
Raster WebP files:        58
Guide rasters missing:     0
Route-only extras:         1 (pongal)
Invalid rasters:           0
Unique SHA-256 hashes:     58
Duplicate hashes:          0
Smallest file:        32,092 bytes
Largest file:        217,590 bytes
Required dimensions: 1280×480
Mutation fixtures:      PASS
```

Every file passed RIFF/WebP structural inspection, the 1280×480 dimension check,
the 10,000-byte minimum, and full Sharp pixel decode. The validator's malformed,
truncated, and duplicate-asset mutation fixtures were rejected as intended.

## Gate fidelity defect

`node validation/festival-hero-relevance.cjs` inspected and passed all 57 guide
rasters, then exited 1 with exactly one problem:

```text
FestivalGuideScreen must render FestivalRasterHero for guide keys
```

The assertion is:

```js
screen.includes('<FestivalRasterHero imageKey={guide.vidhiKey}')
```

The implementation now allows the guide key or a route-content parent key, so the
literal no longer occurs even though rendering is correctly wired. The gate should
assert the current expression (or, preferably, validate the resolved runtime
contract without depending on JSX formatting). This audit is report-only and does
not change the gate.

## Previously documented visual P1 follow-ups

These are qualitative art-review items and remain separate from P0 mechanical
closure:

- `chandraGrahan.webp`: lit diya, open scripture, and kalash imply active puja
  during an eclipse.
- `guptNavratriAshadha.webp`: ambiguous iconography (dark four-armed goddess,
  donkey, scales, and sword).
- `guptNavratriMagha.webp`: lotus/lion composition and Vishnu-like attributes
  appear conflated.
- `sheetlaAshtami.webp`: cow mount and trident/drum/scales conflict with the
  conventional Sheetla donkey, broom, winnowing fan, and pot.
- `ahoiAshtami.webp`: composition reads like a recoloured Amavasya ancestor
  portrait rather than Ahoi's mother-child, wall-image, and star identity.
- `dhanteras.webp`: reused Diwali-style Saraswati-Lakshmi-Ganesha tableau omits
  Dhanvantari despite the `lakshmi-dhanvantari` registry profile.
- The Navratri images meet 1280×480 mechanically but use centred square portraits
  with blurred side padding, weakening landscape composition and responsive crop.

The exact-hash gate detects byte-for-byte reuse but cannot detect perceptual reuse,
iconographic mistakes, devotional appropriateness, or weak responsive crops. Those
need a hash-bound human visual review or an additional perceptual/crop QA process.

## Round 5 closure state

- Runtime hero coverage: **PASS**
- Raster integrity and uniqueness: **PASS**
- Route/profile/timing aggregate gate: **PASS**
- Canonical hero-relevance gate: **BLOCKED — stale source assertion**
- Known qualitative visual issues: **P1 follow-up, not P0 runtime blockers**

Row 29 should not be called fully green until the stale assertion is corrected and
the canonical gate passes on the same commit.
