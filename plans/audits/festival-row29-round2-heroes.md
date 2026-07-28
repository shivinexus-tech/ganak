# Festival row #29 — round 2 adversarial hero/gate audit

Date: 2026-07-28
Tree tested: `main` at `1fd42fc`, plus the six-file uncommitted raster batch visible
in the shared working tree
Scope: read-only application/validation sources; this report is the only edit

## Round verdict

**Round 2 is not green.** The strengthened gates are connected to the raster
runtime and now fail honestly instead of crashing. The new six-file batch raises
coverage from 3/57 to **9/57 guide keys**, but there are only **8 distinct
compositions** because `ganeshChaturthi.webp` and `sankashti.webp` remain identical.

Exact remaining closure defects:

- **48 missing guide-key WebPs**;
- **1 unapproved byte-identical pair**;
- **7 missing festival profiles**;
- two eclipse images are technically relevant to eclipse type but devotionally
  contradict the page's own restriction by showing an actively lit puja setting
  during the eclipse;
- the validator's “decodable” claim is structural only and can accept a fake,
  header-only payload;
- duplicate reporting stops after the first collision;
- hero closure is still guide-key-only and does not account for the 77 overview
  routes with no `vidhiKey`.

The eclipse route/timing gate is now green because both eclipse rasters exist and
all underlying timing checks pass. The overall row and hero gates correctly remain
red.

## Current raster inventory

All nine files are WebP lossy images, exactly 1280×480, larger than the 10 KB gate
floor, and independently decoded successfully with `/opt/homebrew/bin/dwebp`.

| Key | Bytes | SHA-256 | Visual relevance review |
|---|---:|---|---|
| `chandraGrahan` | 47,820 | `ae4bd78e3e9377d2282929dbeac91e3894949630e40d29be4915ac4e61ff4b55` | Clear blood-moon eclipse. **Defect:** lit diya, open scripture, kalash and temple make this read as puja during the eclipse, while the guide says ritual restrictions apply. |
| `chhath` | 153,526 | `597ecfc5ed8e25b047798bf3b34b17fa04e209612fc234082a9ada93ba16607b` | Strong Chhath arghya, river, family, baskets, sugarcane and Sun. Sunrise versus sunset is visually ambiguous, but the subject is correct for the shared four-day guide. |
| `diwali` | 118,478 | `fd7219081f4f260fe01b0f717a27dedd046f3c93672f7be93ebb2676ca5659fb` | Lakshmi centred on lotus with lamps; also Saraswati and Ganesha. Substantively relevant, though broader than the registry alt. |
| `ganeshChaturthi` | 84,218 | `af00b58067efc3c6b9c1aa658440278831a4dd4dc190b7fe86f8a629b7228385` | Ganesha image passes subject review in isolation. |
| `karvaChauth` | 76,926 | `06f585180870077643a3ba7319066273ce537a1f7b52f84cf76f2d6ce5951e90` | Strong named ritual: sieve, full moon, karva, thali, diya and spouse. |
| `mahaShivaratri` | 93,820 | `c10359ef3be7666493337ee2e053ff9acda649dcd6282d8b9a69bb79876db0ad` | Strong night worship: Shiva lingam, bilva, abhisheka, trishul, mala and moon. |
| `makarSankranti` | 92,542 | `a67e11e0c65236d7b60f5d7d4a486e63786f7702b981470e7c21ec16d4bae532` | Strong Surya/harvest identity: arghya, til-gud, sesame, fields and kites. |
| `sankashti` | 84,218 | `af00b58067efc3c6b9c1aa658440278831a4dd4dc190b7fe86f8a629b7228385` | **Defect:** exact Ganesh Chaturthi file. It does not visually distinguish the recurring moonrise fast. |
| `suryaGrahan` | 91,046 | `02881189827cd5b3ccc4e85faaec7b3b05417265ccdcdf70af3696ab3f49b996` | Unmistakable total solar eclipse. **Defect:** prominent lit diya, temple and worship cloth imply temple puja during grahan, directly conflicting with `FEST_META.suryaGrahan.rules`. |

The six new files (`chandraGrahan`, `chhath`, `karvaChauth`,
`mahaShivaratri`, `makarSankranti`, `suryaGrahan`) were untracked at the tested
moment. “Built in the shared tree” must not be reported as committed or delivered.

## Exact gate runs

### `node validation/festival-hero-relevance.cjs`

**Exit 1, expected and correct.**

- 9/57 rasters present;
- 49 reported problems;
- 48 missing WebPs;
- one duplicate:
  `ganeshChaturthi.webp` = `sankashti.webp`,
  SHA-256 `af00b580…7228385`.

It also successfully reads all registry entries, bilingual alt text, runtime
component wiring, dimensions and sizes for present files.

### `node validation/festival-row-29.cjs`

**Exit 1, expected and correct.**

Reports the same 48 missing assets and duplicate, plus these exact missing profiles:

1. `plans/festival-profiles/ayyappa-mandala-begins.md`
2. `plans/festival-profiles/ayyappa-mandala-puja.md`
3. `plans/festival-profiles/chandra-grahan.md`
4. `plans/festival-profiles/skanda-sashti-begins.md`
5. `plans/festival-profiles/skanda-sashti-soorasamharam.md`
6. `plans/festival-profiles/skanda-sashti-thirukalyanam.md`
7. `plans/festival-profiles/surya-grahan.md`

Unlike round 1, it does not crash on the deleted `FestivalHeroImage.tsx`.

### `node validation/eclipse-sutak-pages.cjs`

**Exit 0.**

Passed:

- both routes and bilingual guides;
- four 2026 grahan events;
- Delhi non-visible February solar behavior;
- Cape Town visible solar contacts and Sutak/Moksha;
- Delhi March lunar visibility;
- London August grast-asta Moksha clamp;
- festival-screen grahan wiring;
- both raster presence/format checks.

This gate does not and should not be treated as visual devotional sign-off.

### `node validation/devotional-guide-quality.cjs`

**Exit 0.**

Passed 57 dynamically discovered bilingual guides, seven named-route semantic
profiles, and its own short/copy/anchor/product-meta failure fixtures. This closes
the stale 50-key inventory defect from round 1, but only seven routes have
named-semantic anchors; it is not exhaustive semantic sign-off for every route.

## Mutation proof and remaining validator defects

Direct execution of `runMutationFixtures()` prints
`MUTATION_FIXTURES_PASS`. The fixtures prove rejection of:

- bad RIFF/WebP signature;
- a chunk whose declared length exceeds the file;
- a file below 10 KB;
- 640×240 instead of 1280×480;
- an unapproved duplicate;
- and acceptance of an explicitly allowlisted duplicate.

Two adversarial probes expose gaps:

### P1 — structural header is not actual decodability

A fabricated 10,000-byte zero buffer with only:

- RIFF/WEBP labels,
- one claimed VP8 chunk,
- VP8 start bytes,
- and 1280×480 header dimensions

returns `problems: []`. It contains no valid compressed frame. The gate therefore
checks parseable dimensions, not actual decode. All real files independently pass
`dwebp`, but the gate itself does not prove that.

Required fix: invoke an available decoder in the gate, or use a decoding library,
and add this exact header-only file as a rejection fixture. If external decoder
availability is a portability concern, make the repository ship/use one known
decoder path rather than silently weakening the assertion.

### P2 — only the first duplicate group is reported

For hashes `a=x, b=x, c=y, d=y`, `duplicateProblems()` returns only the `a|b`
problem because it returns inside the loop. Missing art currently dominates the
output, but later batches could contain several copied pairs.

Required fix: accumulate every unapproved collision. Also handle three or more keys
sharing one hash by comparing each additional key to the first canonical key, and
add a two-group fixture.

### P1 — route scope remains narrower than the owner requirement

Both raster gates derive keys from `VRAT_VIDHI`, not
`FESTIVAL_PAGE_ROUTES`. The prior exhaustive inventory found 77 overview routes
with `vidhiKey: null`; those routes cannot request a raster and are invisible to
the hero gate. The gate can become green at 57/57 while those named observances
remain hero-less.

Required fix: create an explicit route-art disposition manifest. Every one of the
181 direct routes must resolve to one of:

- a route-specific raster;
- a deliberately approved shared-family raster;
- owned Navadurga art;
- or an owner-approved exclusion with reason.

No implicit `vidhiKey: null` omission should pass.

### P2 — visual relevance is still manual metadata, not evidence

The validator checks that `subject`, `template`, and alt strings exist, but it
cannot establish that pixels depict those claims. This round caught the eclipse
ritual contradiction only through visual inspection.

Required fix: retain a human review ledger alongside technical gates with reviewer,
date, route/key, required motifs, forbidden motifs, and image hash. The gate should
require the current file hash to match the reviewed hash, so replacing pixels
invalidates prior sign-off.

## Remaining art priority after this batch

There are 48 missing guide-key rasters. Recommended next order:

1. Replace `sankashti` with moonrise-fast-specific art.
2. Revise both eclipse heroes to avoid active temple/puja imagery during grahan.
3. Durga Puja and Navratri family, with milestone-distinct compositions.
4. Skanda/Ayyappa named milestones, aligned with the new semantic profiles.
5. Diwali cluster and reviewed major festivals.
6. Recurring families and remaining long tail.
7. Resolve the separate 77 overview-route hero scope before any global completion
   claim.

## Round-2 closure statement

This round provides a useful test–fix cycle: the raster migration no longer has
obsolete SVG crashes, six technically valid images were added, eclipse timing
coverage is green, and semantic guide fixtures are stronger. It is not a passing
quality round because overall hero/profile gates remain red, visual contradictions
remain, and technical validator gaps were reproduced.
