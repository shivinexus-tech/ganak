# B10 — nakshatra pada and KP sub-lord labels on the language fault line

**Date:** 2026-08-18 · **Branch:** `claude/pada-sublord-language` · **Backlog:** E-1.0 follow-up B10

E-1.0 centralised the 12 rashi, 27 nakshatra and 9 graha names into
`src/i18n/panchang-terms.ts` and gated them. Two label families were named in the backlog as
**never audited**: the nakshatra **pada** (quarter) and the KP **sub-lord / star-lord /
sign-lord** labels. This is that audit.

## How this was verified

Grep alone has missed this class of defect twice, and the backlog says so. Every finding below
was confirmed by **rendering the real screen in both languages** and reading the text a reader
would actually get, not by pattern-matching source.

The obstacle was that all of these surfaces exist *only after the reader casts a chart*, which
is exactly why the committed snapshots never saw them (`snapshot-generate.cjs` records
`chart: "chart body appears only after a cast"`). So the audit drove the real components with a
real cast seeded into their state — `ChartScreen` (full result), `RectifyModule` (a real
rectification sweep) and `PrashnaScreen` (a cast verdict with the astrologer tables open) —
through the existing harness (`validation/_snapshot-render.cjs`, `_load-app.cjs`,
`_snapshot-env.cjs`, frozen clock, Mumbai 1990-06-15 08:30 fixture). That render is what
produced the Hindi output quoted in the "reader sees now" column.

Rendering, not grep, is what found L10 (Prashna printing `Me/Ju` in Hindi two rows above a
table that printed `चन्द्र/गुरु`) and P5 (the snapshot mirror itself printing the English word
"pada" into the Hindi baseline, which is why no baseline review could ever have caught P1).

Severity: **high** = a whole table or panel in the wrong language; **medium** = one readout or
an inconsistent spelling of the same word; **low** = a single token or an internal
inconsistency the reader can still parse.

## A. Nakshatra pada

| # | Where | What a reader saw | What it must be | Sev | Status |
|---|---|---|---|---|---|
| P1 | `src/screens/ChartScreen.tsx:489` (birth summary) | hi: `शतभिषा · पाद 3` | `शतभिषा · चरण 3` — one spelling app-wide | med | **Fixed** — `padaText(lang, …)` |
| P2 | `src/screens/RectifyScreen.tsx:75` (lagna marker) | hi: `पुनर्वसु पाद 4` | `पुनर्वसु चरण 4` | med | **Fixed** — `padaText(lang, …)` |
| P3 | `src/screens/UtilityCalculatorScreen.tsx:115` (nakshatra answer) | hi: `… चरण 3` from a hand-written `hi?"चरण":"pada"` | same words, from the shared helper | med | **Fixed** — `padaText(lang, …)` |
| P4 | `src/screens/RectifyScreen.tsx:63` (time-step control) | hi: `चरण` meaning *step*, on the same screen that labels the pada | `अंतराल` for the step; `चरण` reserved for the pada | low | **Fixed** |
| P5 | `validation/snapshot-results.cjs` (the chart mirror) | hi baseline read `शतभिषा pada 3` — the English word inside the Hindi baseline | the app's real pada label | med | **Fixed** + baseline re-generated |
| P6 | `src/screens/PrashnaScreen.tsx:1276/1306/1310/1400` and the PNG export | hi: `हस्त-2`, en: `Hasta-2` | unchanged | — | **Accepted, no change.** The hyphen form is the KP convention and carries no language. |

**Judgement call, recorded so the owner can overturn it:** the Hindi pada label is now **चरण**,
not **पाद**. Both are correct Sanskrit-derived words; Hindi almanacs and the plain-language
Quick Calculator (the surface a householder meets first) already said चरण, so चरण wins and पाद
is retired. The pada **number** stays in Latin digits — Ganak writes every other number that way
in Hindi (degrees, times, years), and a single Devanagari numeral in a Latin table reads as a
typo, not as care. Drik Panchang's Hindi pages were requested as external evidence for this
choice; the site returned 403/404 to the sandbox, so the decision rests on internal consistency.

## B. KP / dasha lord labels

The engine returns lords in English (`"Venus"`). Every row below printed that straight into a
Hindi screen.

| # | Where | What a reader saw (Hindi) | What it must be | Sev | Status |
|---|---|---|---|---|---|
| L1 | `ChartScreen.tsx:657–659` — KP planet table, star / sub / sub-sub columns | `मृगशिरा Mars Mercury Mercury` (9 rows × 3 columns) | `मृगशिरा मंगल बुध बुध` | **high** | **Fixed** — `planetName(lang, …)` |
| L2 | `ChartScreen.tsx:695–697` — cuspal sub-lords table | 12 rows × 3 columns of `Jupiter Rahu Venus` | `गुरु राहु शुक्र` | **high** | **Fixed** |
| L3 | `ChartScreen.tsx:738–744` — Ruling Planets strip | `लग्न स्वामी Moon · लग्न उप Rahu …` — directly above a ranked list that already read `राहु`, `शुक्र`. The same panel contradicted itself. | `लग्न स्वामी चन्द्र · लग्न उप राहु` | **high** | **Fixed** |
| L4 | `ChartScreen.tsx:716` — `Chip`, used by the house-significator table | every occupant / owner / significator chip in English, 12 rows | Devanagari | **high** | **Fixed** |
| L5 | `ChartScreen.tsx:798` — "houses signified by each planet" | `Sun Moo Mar Mer …` — English clipped to 3 letters, in Hindi | `सूर्य चन्द्र मंगल …` | med | **Fixed** — `planetShort(lang, …)` |
| L6 | `ChartScreen.tsx:619, 653` — planet cards and the KP graha column | `Sun`, `Saturn ℞` | `सूर्य`, `शनि ℞` | med | **Fixed** |
| L7 | `ChartScreen.tsx:1131, 1148, 1158, 1170, 1178, 1184` — Vimshottari table, the five running levels, current prana, antardasha heading | `राहु` nowhere: `Rahu 15 Jun 1990 …`, `अभी Saturn महादशा`, `वर्तमान प्राण: Saturn` | Devanagari lords throughout | **high** | **Fixed** |
| L8 | `src/components/DashaTree.tsx:26` | every drill-down level (antar → prana) in English | Devanagari | **high** | **Fixed** |
| L9 | `RectifyScreen.tsx:78, 79, 95, 121, 125` | `केपी लग्न उप-स्वामी: Rahu`, `आरंभिक महादशा: Rahu`, sweep column `Ket`/`Ven`, `7H (lord Saturn)`, `Saturn–Rahu` | Devanagari; sweep column via `planetShort` | **high** | **Fixed** |
| L10 | `PrashnaScreen.tsx:1310` — practitioner table, Star/Sub column | `बुध` row, then `Me/Ju` — Latin abbreviations two rows above a cuspal table that printed `चन्द्र/गुरु` | hi `बुध/गुरु`; English keeps the KP `Me/Ju` convention | **high** | **Fixed** |
| L11 | `JyotishBnnScreen.tsx:233, 237` | `Jupiter चक्र`, occupant list in English | `गुरु चक्र` | med | **Fixed** |
| L12 | `UtilityCalculatorScreen.tsx:115` (9th lord, English branch) | no leak — English branch only | — | low | **Normalised** through the shared helper so the gate has one shape to check |
| L13 | `ChartScreen.tsx:1200–1201, 1210` (marriage 7th lord / window lords) | no leak — Hindi branch already localised | — | low | **Normalised**, same reason |

## C. Abbreviations that were never translated

| # | Where | Reader saw | Should be | Sev | Status |
|---|---|---|---|---|---|
| A1 | `ChartScreen.tsx:692` — cuspal table row labels | hi: `1 (Asc)`, `10 (MC)` | `1 (लग्न)`, `10 (दशम)` | med | **Fixed** |
| A2 | `ChartScreen.tsx:670` — cuspal table heading | hi: `भाव-संधि उप-स्वामी · Placidus`, while the note below already said `प्लासिडस` | `· प्लासिडस` / `· पॉर्फ़िरी` | low | **Fixed** |
| A3 | `RectifyScreen.tsx:108, 121` — event anchors | hi: `विवाह (7H)`, `· 7H (lord Saturn)` | `विवाह (7 भाव)`, `· 7 भाव (स्वामी शनि)` | med | **Fixed** |
| A4 | `src/data/chart-divisions.ts` `PLANET_GLYPH` — used in the KP table, planet cards and all three chart diagrams | Latin stubs `Su Mo Ma Me Ju Ve Sa Ra Ke` in Hindi | a Devanagari glyph set, or a stated decision that these are language-neutral chart symbols | low | **Handed off — not fixed.** Shared by `DiamondChart` / `SouthChart` / `EastChart`; changing it is a chart-design decision, not a translation, and the full graha name now sits next to every occurrence. |
| A5 | `ChartScreen.tsx:625` (`H{p.house}`) and `:956` (`H1→H2` in Bhava Chalit) | hi: `H11` | `भाव 11` — or a stated decision to keep `H` as a chart symbol | low | **Handed off — not fixed.** Same dense-grid design call as A4; both cells are width-constrained. |

## D. Found while rendering, outside the B10 fault line — recorded, not fixed

Left alone deliberately: these are the graha/section-copy families, not pada or sub-lord, and
copy work in this screen belongs to other agents this week. Each has its exact fix.

| # | Where | Reader sees | Fix |
|---|---|---|---|
| O1 | `ChartScreen.tsx:855` — Shadbala card header | **both** languages print `सूर्य Sun` | `{hi ? panchangTerm("hi", "planet", p) : p}` — show one language |
| O2 | `ChartScreen.tsx:871` + `src/engine/shadbala.ts:27–33` — `BALA_PARTS` | Hindi table rows read `Sthana Dig Kala Cheshta Naisargika Drik` | add `labelHi` (`स्थान दिग् काल चेष्टा नैसर्गिक दृक्`) to `BALA_PARTS`; the section intro already uses those words |
| O3 | `ChartScreen.tsx:521–522` — reference-point buttons | English mode shows `लग्न` above `Lagna`; **Hindi shows `लग्न` twice** | drop the unconditional `{rf.deva}` span, or render it only when `!hi` |

**No defect in this family lives in a file another agent owns.** All ten forbidden files
(`today-panchang.ts`, `panchang.ts`, `format.ts`, `DailyWindowsCard.tsx`, `SeasonClockCard.tsx`,
`DailyScreen.tsx`, `MuhuratHub.tsx`, `FestivalGuideScreen.tsx`, `MedicalMuhuratScreen.tsx`,
`kundli-app.tsx`) were checked and render no pada or lord label at all. `DailyWindowsCard.tsx:18`
mentions a "three-pada nakshatra" / `त्रिपाद नक्षत्र` in prose, correctly in both languages.
Nothing inside PrashnaScreen's parity-frozen markers was touched — L10 is at line 1310, a
thousand lines below `END ENGINE`.

## E. What now stops this coming back

`src/i18n/panchang-terms.ts` gains `padaLabel`, `padaText`, `planetName` and `planetShort`, and
`validation/language-leak-scan.cjs` gains three checks:

- **0 (extended):** the pada label and the lord helpers are asserted like the name tables —
  one spelling, `padaText` rejects anything outside 1–4, the compact English lord labels are
  proven collision-free, and unknown input degrades instead of throwing.
- **1e — pada labels come from one place.** A hand-written pada word (`"पाद"`, or `"चरण"` /
  `"pada"` on a line about padas) outside `src/i18n/` fails the gate. `RAJJU_NAMES_HI` is
  exempted by name, with the reason recorded in the gate: there, पाद is the *feet* group of the
  marriage Rajju koota, a different quantity that happens to share the word.
- **1f — a lord may not be rendered raw.** Shape-based, like the existing check that catches
  `{NAKSHATRAS[i]}`: an expression ending in `…Lord`, `.subSub`, `.cuspSub`, `.star` or `.sub`
  may not be interpolated into JSX or a template without `planetName` / `planetShort`; a bare
  `{lord}` / `{pl}` in JSX text and a hand-clipped `.slice(` on a lord fail too. A line that
  branches on language *and* localises one side is allowed — that is the Prashna case where
  English legitimately keeps the KP `Me/Ju` abbreviations.

Proof the checks bite, not just pass — one defect from each family put back:

```
$ node validation/language-leak-scan.cjs      # पाद/pada written by hand again at ChartScreen:489
AssertionError: A second spelling of the pada label:
  src/screens/ChartScreen.tsx:489 — pada label written by hand: पाद, pada
Call padaText(lang, n) — or padaLabel(lang) for the bare word — from src/i18n/panchang-terms.ts.

$ node validation/language-leak-scan.cjs      # {p.kp.subLord} and {p.lord} unwrapped again
AssertionError: A KP/dasha lord reaches the screen in the engine's own language:
  src/components/DashaTree.tsx:26 — lord rendered unlocalised: {p.lord}
  src/screens/ChartScreen.tsx:658 — lord rendered unlocalised: {p.kp.subLord}
Wrap it: planetName(lang, x.subLord) — or planetShort(lang, x.subLord) in a narrow column.

$ node validation/language-leak-scan.cjs      # both reverted to the fixed form
✓ language-leak-scan: 124 files · 1 source of truth · 12 rashi (+12 English aliases) ·
  27 nakshatra · 9 grahas · 4 padas · 9 lord labels · index and string accessors agree
```

`validation/snapshot-results.cjs` now also mirrors the KP star/sub/sub-sub lords, the twelve
cuspal sub-lords, the ruling planets and the dasha lords, so the *committed* Hindi baseline
carries Devanagari for all of them and a regression shows up as a review diff, not only as a
gate failure.

## F. Honest limits

- Rendered **text** only. The rectifier's sweep column and the KP tables now carry Devanagari
  where they carried three Latin letters; nobody has looked at them at 375 px. Overflow,
  wrapping and column width in Hindi still need a human or a browser pass.
- The audit fixture is one chart (Mumbai, 1990-06-15 08:30, Lahiri). It exercises all nine
  grahas as lords across the tables, but a chart with different sub-lords would not add
  coverage — the defect was in the rendering path, not in any value.
- A4 and A5 are open by decision, not by oversight: Latin `Su`/`H11` chart symbols still appear
  in Hindi. They need a chart-design call, and both now sit next to a fully localised name.
- D-section items (O1–O3) are real language defects that remain live in `ChartScreen`.
