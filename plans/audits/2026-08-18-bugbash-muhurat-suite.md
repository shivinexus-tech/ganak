# Bug bash — Muhurat suite (second independent adversarial pass)

- **Date:** 2026-08-18
- **Agent:** independent adversarial test agent (Claude Code), branch `claude/bugbash-muhurat-suite`,
  worktree based on `origin/main` `8752753`.
- **Mandate:** `plans/backlog.md` P0-MUHURAT-FULL-PARITY — *"exceptionally strong Muhurat parity"*.
  Rows #16/#17 are explicitly held below 100% until "Claude Code completes the reserved second
  bug-bash pass". This is that pass. It is the **second** adversarial pass on the deep-muhurat work
  (Cursor ran the first on 2026-07-24 and found one P2).
- **Scope:** `src/engine/muhurat.ts`, `src/engine/medical-muhurat.ts`, `src/engine/personal-muhurat.ts`,
  `src/engine/daily-windows.ts`, `src/engine/panchaka.ts`, `src/data/muhurat-ui.ts`,
  `src/data/medical-muhurat-ui.ts`, `src/data/personal-muhurat-ui.ts`, `src/screens/MuhuratHub.tsx`,
  `src/screens/MedicalMuhuratScreen.tsx`, and the nine existing gates.
- **Standing:** READ-ONLY on all product code. Nothing under `src/` or `validation/` was modified.
  This document is the only write. Probe scripts live in `.scratch/bugbash/` (gitignored).

## Baseline — every existing gate was green before and after this pass

```
✓ muhurat-anchors PASSED (recall ≥ 80% on all categories)
✓ deep-muhurats PASSED (8 distinct public Muhurat engines, bilingual chips/guidance, dated anchors, clean-window checks)
✓ samskara-muhurats PASSED (5 distinct engines and bilingual input models; published rule tables; 5 dated comparator anchors; seasonal coverage)
✓ property-vehicle-muhurats PASSED (dedicated deed/registration/purchase and purchase/delivery flows; bilingual rationale; ranked clean-window results)
✓ medical-muhurat PASSED (conservative syzygy-avoidance scan, Drik-anchored ±1d, bilingual safety copy, no outcome claims)
✓ muhurat-actions PASSED (stable URL state, ICS export, calendar reminder and no browser storage)
✓ panchaka-windows PASSED (3308 Panchaka/Lagna windows tile sunrise-to-sunrise without gaps or overlaps)
✓ daily-windows PASSED (2995 intervals across 370 days; no zero/overlap defects; 3-city regional anchors)
✓ personal-muhurat PASSED (Tarabala/Chandrabala hard filters, Moon-BAV strength, Adhanadi soft caution)
```

**Every finding below is invisible to all nine gates.**

## Pass log

| # | Pass | What it probed | How |
|---|------|----------------|-----|
| 1 | Rule correctness vs references | Every `MUHURTA_RULES` nakshatra/tithi/weekday set re-derived against the classical canon; Ganda Moola and the engine's own `INAUSP_NAK` cross-checked against each activity's `auspNak`; Rahu/Yamaganda/Gulika/Abhijit/Panchaka/Bhadra/Chandrabala/Tarabala filters traced from engine to pixel; convention-dependence checked for whether it is *stated*. | `.scratch/bugbash/p1-*.cjs`, hand re-derivation |
| 2 | Window arithmetic and boundaries | Midnight-crossing windows and their date carry; zero/sub-minute windows; excluded-vs-merely-marked; overlapping exclusions; polar no-sunrise; DST transition days; first/last day of a search range; 400-day cap. | `.scratch/bugbash/p2-*.cjs`, `p3-*.cjs` |
| 3 | The "no result" path | What a reader is told when a finder returns nothing, per category and per language. | rendered output + source |
| 4 | Bilingual + responsible copy | Rendered text of MuhuratHub and MedicalMuhuratScreen in both languages with the result state seeded, using the `validation/_snapshot-render.cjs` interception technique from `plans/audits/2026-08-18-bugbash-matching-dosha.md`. | `.scratch/bugbash/render-*.cjs` |
| 5 | Cross-surface consistency | The same activity/day asked of the finder, the daily-windows card, the Panchaka surface, the personal overlay and the medical finder — checked for disagreement. | `.scratch/bugbash/p5-*.cjs` |

---

## Findings

### F1 — P0 · Wedding, engagement, Griha Pravesh, Bhoomi Puja and Construction print "Rahu, Gulika and Yamaganda are excluded" over windows that were never filtered for them

The result card renders one fixed sentence under the "Activity-specific clean windows" list
(`src/screens/MuhuratHub.tsx:1090`):

> **EN:** "These windows come from this activity's own filter; Rahu, Gulika and Yamaganda are excluded."
> **HI:** "ऊपर के समय इस कार्य की अलग छँटाई से निकले हैं; राहु/गुलिक/यमगण्ड हटाए गए हैं।"

For the seven Choghadiya-based categories that sentence is true. For the six categories in
`PANCHAKA_WINDOW_CATEGORIES` (`wedding`, `engagement`, `housewarming`, `bhoomi`, `construction`,
`puja`) it is false: those windows come from `computeLagnaPanchaka` and are filtered on
`w.shubha` alone. No Rahu/Gulika/Yamaganda test is ever applied to them.

**Reproduction** — New Delhi, Lahiri, `muhuratScanRange` 2026-01-01 → 2026-12-31, `valid` days only,
counting displayed `activityWindows` that overlap the same row's own `rahu`/`gulika`/`yama`:

```
category       validDays  windows  overlapping Rahu/Gulika/Yama
wedding             85       538        182   (34%)
engagement          53       334        115   (34%)
housewarming        87       546        177   (32%)
bhoomi (Jan–Apr)    38       238         80   (34%)
construction (J–A)  32       199         65   (33%)
--- control: the categories the sentence is true for ---
business (Jan–Apr)  31        76          0
travel   (Jan–Apr)  33       119          0
document (Jan–Apr)  34        68          0
vehicle  (Jan–Apr)  51       133          0
property (Jan–Apr)  27        54          0
```

Concrete instances (all New Delhi 2026, IST):

```
Wedding / Engagement, 2026-02-26
  displayed  ✓ Panchaka Rahita 07:41–10:41
  same row   Gulika Kalam 09:41–11:07   Yamaganda 06:49–08:15
  -> the printed 3-hour "clean" wedding window contains 1h00m of Gulika and 34m of Yamaganda.

Housewarming, 2026-03-01
  displayed  ✓ Panchaka Rahita 14:39–17:00
  same row   Rahu Kalam 16:53–18:20     Gulika Kalam 15:27–16:53
  -> the window ends 7 minutes INSIDE Rahu Kalam and holds Gulika Kalam whole.

Bhoomi Puja / Construction, 2026-01-01
  displayed  ✓ Panchaka Rahita 08:11–09:53
  same row   Gulika Kalam 09:49–11:06   Yamaganda 07:13–08:31
```

**Observed** — the reader is told a wedding/Griha-Pravesh window is free of Rahu, Gulika and
Yamaganda when a third of them are not.

**Expected** — either the window list is filtered against `[rahu, gulika, yama]` the way
`cleanChoghadiyaWindows` already does, or the sentence is made conditional on the window kind.
Silently asserting an exclusion that was not performed is worse than performing neither: the same
screen prints the Rahu Kalam interval elsewhere, so a careful reader can catch Ganak contradicting
itself on one card.

**Cause**
- `src/engine/muhurat.ts:419-429` — `activityWindows()`. The `PANCHAKA_WINDOW_CATEGORIES` branch
  (lines 421-427) filters on `w.shubha` and clamps to the day; it never builds the
  `avoid = [info.rahu, info.gulika, info.yama]` list that `cleanChoghadiyaWindows`
  (lines 412-418) builds three lines above it.
- `src/screens/MuhuratHub.tsx:1090` — the unconditional copy.

Note the fallback path at `muhurat.ts:426` (`return clean.length ? clean : cleanChoghadiyaWindows(...)`)
means the *same category on a different day* can produce properly-filtered Choghadiya windows. So the
guarantee the sentence makes holds on some days and not others, with no visible difference.

**Suggested fix** — in `activityWindows`, run the Panchaka branch's output through the same
`avoid.some(overlaps)` rejection (or clip the windows around the three intervals rather than
dropping them whole, since Panchaka windows are long). Add a gate assertion: for every category and
every valid day, no returned `activityWindow` may overlap that day's `rahu`, `gulika` or `yama`.
`validation/deep-muhurats.cjs` already walks these rows, so the assertion costs one loop.

