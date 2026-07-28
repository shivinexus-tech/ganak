# Festival row #29 — round 4 hero verification

Date: 2026-07-28

Integrated base: `main` at `904ec04`, plus the two visible uncommitted gate-mapping
edits in `validation/festival-hero-relevance.cjs` and
`validation/festival-row-29.cjs`.

## Verdict

Round 4 reaches complete guide-key asset coverage but is **not a valid green
round**.

- Both focused gates print PASS.
- All 57 `VRAT_VIDHI` keys have valid raster files.
- The raster directory contains 58 WebPs because `pongal.webp` is an additional
  route-content parent asset.
- All 58 files are 1280×480, decode through Sharp, exceed the 10 KB floor, and
  have distinct SHA-256 hashes.
- Async mutation fixtures pass.
- The earlier unsupported Madhyahna/Aparahna timing findings are closed.
- Solar-eclipse art was replaced and now correctly shows a covered altar with no
  active offering during grahan.

However, the new “181 routes disposed” assertion is a **false positive**. The gates
accept `FESTIVAL_ROUTE_CONTENT[entry.key].heroKey`, but
`FestivalGuideScreen.tsx` still renders:

```tsx
guide.vidhiKey && <FestivalRasterHero imageKey={guide.vidhiKey} ... />
```

It never renders `routeContent.heroKey`. `/festival/pongal`, for example, still has
`vidhiKey: null`; `pongal.webp` exists and satisfies the new gate mapping, but the
runtime does not request it. The same defect affects the overview-route family.
Therefore the screen remains hero-less while both gates claim all 181 routes are
disposed.

Visual devotional defects also remain in the lunar eclipse, Gupt/Navratri, Sheetla
and copied-composition families.

## Exact gate evidence

### `node validation/festival-hero-relevance.cjs`

Exit 0:

`FESTIVAL HERO RELEVANCE PASSED (57 guides; 181 routes disposed; mutation fixtures rejected)`

It individually reports all 57 guide rasters as 1280×480 and decoder-valid.

### `node validation/festival-row-29.cjs`

Exit 0:

`festival-row-29.cjs PASS — 57 guide keys, 181 routes, profiles, heroes, timing wiring`

No asset, profile, duplicate, timing-kind, decode or mutation failure remains in
the implemented assertions.

### Independent inventory

- Files: 58
- Unique SHA-256 hashes: 58
- Smallest file: 32,092 bytes (`chaitraNavratri`)
- Largest file: 217,590 bytes (`holika`)
- Dimensions: 58/58 exactly 1280×480
- Sharp full decode: 58/58 pass
- `runMutationFixtures()` awaited directly: pass

## P0 — route mapping is not runtime wiring

The uncommitted gate edits load `FESTIVAL_ROUTE_CONTENT` and use:

```js
entry.vidhiKey || FESTIVAL_ROUTE_CONTENT[entry.key]?.heroKey
```

That proves a proposed mapping exists, not that the screen consumes it.

Evidence:

- `/festival/pongal`: `vidhiKey: null`
- `/festival/anant-chaturdashi`: `vidhiKey: null`
- `FestivalGuideScreen` imports and displays route semantic content, but its only
  `FestivalRasterHero` call is guarded by `guide.vidhiKey` and passes only
  `guide.vidhiKey`.
- No `routeContent.heroKey` reference exists in the screen.

Required fix:

1. Runtime chooses one explicit effective key, for example
   `guide.vidhiKey || routeContent?.heroKey`.
2. The screen renders `FestivalRasterHero` from that effective key.
3. Gate checks the real runtime expression/wiring, not only the registry map.
4. Browser-smoke `/festival/pongal` and at least one other former `vidhiKey: null`
   route and assert a successful WebP request plus visible non-zero image bounds.
5. Add a mutation fixture in which route content has a `heroKey` but screen wiring
   ignores it; the gate must fail.

Until that happens, neither focused PASS may be used as route-level closure
evidence.

## Visual relevance recheck

### Closed since round 3

**Surya Grahan:** new SHA-256
`dfd766fc227d229185c6aca64baa99a9a58d494e63266a42b3a052f4659a798a`.
The image shows the eclipse and a fully covered shrine/altar. No lit diya, active
puja or exposed deity remains. This now matches the profile's forbidden-motif
contract.

**Sankashti:** remains distinct from Ganesh Chaturthi; no hash duplicate.

### P1 — Chandra Grahan still contradicts the profile

`chandraGrahan.webp` is unchanged at
`ae4bd78e3e9377d2282929dbeac91e3894949630e40d29be4915ac4e61ff4b55`.
It prominently shows a lit diya, open scripture, kalash and temple setting while
the eclipsed Moon is overhead. The profile explicitly forbids active temple puja
or lit offering during grahan. Replace it with a quiet, paused/covered shrine or a
pure eclipse/landscape composition.

### P1 — Gupt Navratri iconography remains unsafe

**Ashadha Gupt Navratri** remains
`a819b86e7c558bda4c5b8481a7c318b414fc86033d79ad4a000466edcfdf0144`.
It depicts a dark four-armed goddess riding a donkey with scales, sword and other
mixed attributes. This is not self-evidently the generic Durga named by the
registry and risks presenting fabricated or misidentified iconography as owned
devotional art.

**Magha Gupt Navratri** remains
`bcb6bb81ef1370b10c09c2540da5ba191cedd8e6d4a765ed7b93a0211606d72c`.
Its lotus-seated, lion-accompanied figure carries conch/discus/mace/lotus-like
attributes, reading as a conflated Durga-Lakshmi-Vishnu figure rather than a
sourced Gupt Navratri identity.

Both should use a conservative Devi altar/sadhana composition without inventing a
specific deity form unless that form and every attribute are source-reviewed.

### P1 — Sheetla Ashtami iconography is incorrect

`sheetlaAshtami.webp` shows a blue-white goddess on a cow carrying trident, drum
and scales. Sheetla Mata is conventionally identified with a donkey mount and
cooling/cleansing attributes such as broom, winnowing fan and water pot. The
current image instead mixes Shiva and justice/balance motifs. It should not ship
as Sheetla Mata.

### P1 — Ahoi Ashtami is an Amavasya/ancestor composition

`ahoiAshtami.webp` shows the same basic family-before-garlanded-portraits scene as
`amavasya.webp`, recoloured into a starry night. It does not show the Ahoi wall
image/calendar motif, mother-child vrata identity or the named star-viewing
practice. Distinct SHA-256 hashes do not catch this semantic reuse.

### P1 — Dhanteras is a recoloured Diwali composition and omits Dhanvantari

`dhanteras.webp` repeats the Diwali Saraswati-Lakshmi-Ganesha tableau. Its registry
subject is `lakshmi-dhanvantari`, but Dhanvantari is not depicted. This fails the
named subject contract despite a unique hash.

### P2 — public Navratri heroes remain square art with blurred side padding

`chaitraNavratri`, `sharadNavratri`, `guptNavratriAshadha`,
`guptNavratriMagha`, `masikDurgashtami` and `sheetlaAshtami` are nominally
1280×480 but visibly consist of a centred square devotional portrait and blurred
sidebands. This meets file dimensions without being a purpose-composed landscape
hero.

Chaitra uses only Shailaputri/day-1 imagery for the full season. Sharad uses a
generic lion-riding Devi. Neither communicates the whole nine-night journey as
strongly as the separate Navadurga route art.

## Remaining gate blind spots

1. **Registry-to-runtime gap:** described above; highest priority.
2. **No perceptual duplicate detection:** all hashes are unique, yet Ahoi/Amavasya
   and Dhanteras/Diwali visibly reuse compositions. Add perceptual similarity
   reporting with human adjudication rather than byte-hash only.
3. **No hash-bound review ledger:** the gate cannot enforce required/forbidden
   motifs. A reviewed manifest should bind each current hash to reviewer, date and
   motif decision.
4. **No crop/composition QA:** technical 8:3 dimensions allow square art padded
   with blurred bars.
5. **Uncommitted gate state:** the two mapping edits under test were not part of
   `904ec04` at audit start. Passing uncommitted code is not integrated or
   delivered evidence.

## Round-4 closure statement

Round 4 closes raw raster completeness, exact duplicates, full decoding, profile
coverage, mutation execution, timing-kind expectations and the solar-eclipse
visual defect. It fails route-runtime truthfulness and still has five high-priority
visual families requiring replacement or sourced review. Do not count this as a
passing iteration or restore row #29 to green.
