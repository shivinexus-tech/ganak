# Festival row #29 — round 3 independent hero review

Date: 2026-07-28

Integrated base: `main` at `b835494`

Review scope: base plus the raster/gate changes visibly present but not yet committed
in the shared working tree

## Verdict

Round 3 shows substantial progress but is **not green**:

- **31/57 worship-guide keys** have WebPs; **26 remain missing**.
- All 31 files are 1280×480, above 10 KB, structurally valid, and independently
  decode with both Sharp (the strengthened gate) and `dwebp`.
- All 31 hashes are now distinct. The prior Ganesh Chaturthi/Sankashti duplicate is
  fixed.
- Only **29 of the 31 present files are used by direct route entries**.
  `ayyappaMandala` and `kandaSashtiAnnual` are base/orphan guide assets; routed
  milestone pages use their separate keys.
- The hero gate correctly fails on the 26 missing files.
- The row gate additionally reveals three new timing-contract gaps:
  `aparahna` for Bhai Dooj and Dussehra, and `madhyahna` for Ram Navami.
- The seven profiles missing in round 2 are now present; no profile defect remains
  in the row-gate output.

The new Ayyappa, Skanda and Bengal Durga milestone art is meaningfully distinct.
However, the Gupt/Navratri batch includes devotional/iconographic ambiguity and
several square compositions padded into a nominal landscape file. The eclipse
puja-during-grahan contradiction recorded in round 2 also remains.

## Technical inventory

Every present asset passed:

- internal RIFF/WebP/chunk parsing;
- exact 1280×480 dimensions;
- minimum 10,000-byte threshold;
- Sharp full-pixel decode with `failOn: "error"`;
- independent `/opt/homebrew/bin/dwebp` decode.

| Key | Bytes | SHA-256 prefix | Route/relevance result |
|---|---:|---|---|
| `amavasya` | 70,760 | `a5ad9d0a` | Strong: moonless night and household ancestor remembrance |
| `ayyappaMandala` | 109,616 | `4ed41674` | Technically valid, but not a direct route hero key |
| `ayyappaMandalaBegins` | 113,376 | `eb334f92` | Strong and distinct: Guru Swami places mala at opening |
| `ayyappaMandalaPuja` | 141,442 | `86b584e7` | Strong and distinct: decorated closing worship |
| `chaitraNavratri` | 32,092 | `1f4bd0f2` | Shailaputri/bull iconography; represents day 1 rather than the whole nine-day season; square art with blurred side padding |
| `chandraGrahan` | 47,820 | `ae4bd78e` | Eclipse clear; still shows active lamp, scripture and kalash during grahan, conflicting with restriction copy |
| `chhath` | 153,526 | `597ecfc5` | Strong family river arghya imagery |
| `diwali` | 118,478 | `fd721908` | Strong Lakshmi/lamps; broader Saraswati/Ganesha composition than alt |
| `durgaPujaAshtami` | 161,962 | `9ef15c54` | Distinct evening/Sandhi-style lamp worship |
| `durgaPujaDashami` | 174,718 | `85aa1724` | Strong sindoor farewell and visarjan procession |
| `durgaPujaMahalaya` | 83,806 | `e8678256` | Strong tarpan plus unfinished idol at Bengal riverside |
| `durgaPujaNavami` | 175,964 | `374e273b` | Strong homa/bhog culmination |
| `durgaPujaSaptami` | 151,874 | `fc585d13` | Distinct file; registry subject is generic Durga, so milestone motifs remain human-reviewed only |
| `durgaPujaShashthi` | 155,180 | `1361ce91` | Distinct file; registry subject is generic Durga, so milestone motifs remain human-reviewed only |
| `ekadashi` | 94,108 | `4269aaa5` | Shared family asset for 25 named Ekadashi routes; no named-variant visual distinction |
| `ganeshChaturthi` | 84,218 | `af00b580` | Strong Ganesha festival image |
| `guptNavratriAshadha` | 43,230 | `a819b86e` | **Reject/review:** dark four-armed goddess on donkey with scales and sword is not self-evidently the registry's generic Durga and risks fabricated/misidentified iconography; square art with blurred padding |
| `guptNavratriMagha` | 47,942 | `bcb6bb81` | **Reject/review:** hybrid lotus/lion figure with conch/discus/mace/lotus reads as conflated Durga-Lakshmi-Vishnu iconography; square art with blurred padding |
| `kandaSashtiAnnual` | 100,554 | `4542a9fe` | Technically valid, but not a direct route hero key |
| `karvaChauth` | 76,926 | `06f58518` | Strong sieve, moon, karva and spouse ritual |
| `mahaShivaratri` | 93,820 | `c10359ef` | Strong lingam, bilva, abhisheka and night setting |
| `makarSankranti` | 92,542 | `a67e11e0` | Strong arghya, harvest, til-gud and kites |
| `masikDurgashtami` | 37,242 | `af361c1d` | Distinct file but generic-Durga relevance still relies on manual review |
| `purnima` | 80,002 | `103b905e` | Strong full-moon household worship |
| `sankashti` | 94,256 | `24c32ab` | Replacement is unique; must retain visible moonrise-fast identity in final review |
| `sharadNavratri` | 48,778 | `8d601b9d` | Generic four-armed lion-riding Devi; square art with blurred padding, weak nine-night/season identity |
| `skandaSashtiBegins` | 97,788 | `bb562b8b` | Strong opening household sankalpa with Murugan and Vel |
| `skandaSashtiSoorasamharam` | 162,426 | `a8006390` | Strong non-graphic victory/transformation composition with Vel, peacock and rooster |
| `skandaSashtiThirukalyanam` | 199,418 | `71b9d5c8` | Strong distinct divine-wedding ceremony |
| `skandaShashti` | 94,788 | `10e71d8d` | Monthly family asset distinct from annual milestones |
| `suryaGrahan` | 91,046 | `02881189` | Eclipse clear; still shows prominent lit diya/temple worship during grahan, conflicting with restriction copy |

All full SHA-256 values were recomputed in this round; no collision remains.

## Exact missing guide-key rasters (26)

`ahoiAshtami`, `akshaya`, `bhaiDooj`, `buddhaPurnima`, `dhanteras`,
`dussehra`, `govardhanPuja`, `gudiPadwa`, `guruPurnima`, `hanumanJ`,
`hartalikaTeej`, `holika`, `janmashtami`, `kartikaPurnima`,
`masikShivaratri`, `narakChaturdashi`, `pradosh`, `rakshaBandhan`,
`ramNavami`, `rangwaliHoli`, `rathYatra`, `sheetlaAshtami`, `ugadi`,
`varalakshmi`, `vatPurnima`, `vatSavitri`.

## Gate evidence

### `festival-hero-relevance.cjs`

**Exit 1:** `FESTIVAL HERO RELEVANCE FAILED (26 problems; 31/57 rasters
present)`. Every problem is one of the exact missing files above. It reports no
duplicate, decode, dimension, size, registry-alt or component-wiring defect.

The strengthened async mutation suite passes when explicitly awaited:

- corrupt signature;
- truncated chunk;
- undersized file;
- wrong dimensions;
- unapproved duplicate;
- approved duplicate;
- two independent duplicate groups;
- header-only fake WebP rejected by Sharp.

Sharp `0.35.3` is a declared direct dependency in `package.json` and lockfile, so
the decoder is not an accidental global.

### `festival-row-29.cjs`

**Exit 1:** the same 26 missing rasters plus:

- `unsupported timing kind "aparahna" on bhaiDooj`
- `unsupported timing kind "aparahna" on dussehra`
- `unsupported timing kind "madhyahna" on ramNavami`

There are no missing-profile messages. These timing failures must be resolved by
implementing/testing the real timing contract or correcting inaccurate metadata,
not by merely adding strings to the supported set.

## Remaining gate blind spots

### P1 — row gate does not await the async mutation/decode fixtures

`festival-row-29.cjs` calls `runMutationFixtures()` without `await`, inside a
synchronous `try/catch`. Since the function is now async, decode-fixture rejection
and future asynchronous assertion failures cannot be caught and appended to
`problems`. The focused hero gate awaits correctly; the overall closure gate does
not.

Required fix: convert row-gate completion to an awaited async function and run
actual `assertDecodable()` checks for every present asset, or delegate to one shared
awaited inventory validator.

### P1 — route inventory remains out of scope

The gate derives coverage from 57 `VRAT_VIDHI` keys. The product registry has 181
direct routes and 77 overview entries with no `vidhiKey`; those remain invisible.
Conversely, two technically present files are for base keys not used by direct
route entries. A 57/57 future pass still would not prove every named route has an
art disposition.

Required fix: validate an explicit route-to-art/exclusion manifest against
`FESTIVAL_PAGE_ROUTES`, including Navadurga-owned art and approved family sharing.

### P1 — visual review is not hash-bound

The gate proves `subject`, `template` and alt strings exist but not that pixels
match them. The Gupt Navratri iconography and eclipse contradiction pass
automatically.

Required fix: add a human-reviewed ledger containing current SHA-256, reviewer/date,
required motifs and forbidden motifs. Any file replacement must invalidate the old
review hash.

### P2 — native landscape composition is not checked

The Navratri/Gupt files are technically 1280×480 but visibly contain a square
portrait centered over blurred side padding. Exact dimensions therefore do not
prove a purpose-built 8:3 hero or good phone/desktop crop.

Required fix: visual/crop review at 390 px and desktop, recorded against file hash.
An automated entropy/edge heuristic may flag large blurred sidebands, but should
not replace human review.

### P2 — shared family art hides named variants

One `ekadashi.webp` covers 25 named Ekadashi routes and one `pradosh` asset is
planned for eight weekday variants. This may be an intentional family-art policy,
but it contradicts a literal “every named variant gets distinct art” reading.

Required product decision: document approved family sharing in the route-art
manifest or commission variant-specific heroes. Do not let reuse happen merely
because routes share `vidhiKey`.

## Round-3 closure statement

Round 3 is a real improvement: profile gaps are closed, full image decoding and
multi-group duplicate fixtures are implemented, Sankashti is unique, and the
Ayyappa/Skanda/Durga Puja milestone batches are mostly strong. It cannot count as a
passing closure round while 26 files, three timing contracts, two eclipse
contradictions, two Gupt iconography problems, and route-scope/hash-review gaps
remain.
