# ChartScreen — the five findings the matching lane could not touch (F7, F9, F13, F14, F22)

- **Date:** 2026-08-19
- **Branch:** `claude/chartscreen-matching-remainder` (worktree off `origin/main` `b9ceee5`)
- **Source:** `plans/audits/2026-08-18-bugbash-matching-dosha.md`, carried forward by
  `plans/audits/2026-08-18-matching-remainder-fix.md` § "NOT closed — and why, honestly"
- **Files changed:** `src/screens/ChartScreen.tsx`, `src/components/JyotishPanelNav.tsx`,
  `src/i18n/panchang-terms.ts`, `src/engine/marriage-timing.ts`,
  `validation/screen-snapshots.cjs`
- **Pre-flight:** `plans/task-log.md` row `CLAUDE-FIX-DASHA-TRANSIT-2026-08-18` reserves
  `ChartScreen.tsx`, `marriage-timing.ts` and `kundli.ts`, but the capacity note on row
  `CLAUDE-AGENT-CAPACITY-EXHAUSTED-2026-08-19` records that lane as **never started**, and
  its worktree `.scratch/worktrees/fix-dasha` still sits at base `b9ceee5` with nothing
  committed. This lane was dispatched over those files deliberately. **`src/engine/kundli.ts`
  was not edited at all** — see F14 below for why the engine did not need to change.

## In plain words — what a reader used to get, and what they get now

| | Before | Now |
|---|---|---|
| **Moving between Jyotish panels** | Filling in both people on the Matching panel and then tapping **Vault**, **Kundli** or **KP** threw away *everything*: both names, both dates, both times, both birth places and the computed match. Coming back showed the hard-coded demo couple (New Delhi 1990-04-12 / Mumbai 1992-11-20) as though nothing had been typed. Reload, Back, Forward and a shared link lost the open panel too. | Nothing is thrown away. Every panel stays alive and is simply hidden while another is open, so a couple can look at the Vault and come back to their own two births and their own score. The open panel is now written into the address bar, so reload, Back and a shared link land where the reader was. |
| **The dosha panel and the zodiac setting** | The Kala Sarpa / Pitra / Papa panel quietly followed whichever ayanamsa chip the reader had pressed, and named none. The three "Full page →" links beneath it go to pages that always compute with Lahiri. On the same 1970 Delhi birth the panel said **Shankhachuda** and its own link said **Karkotaka**; the panel said **1 Pitra indication**, the page said **none**. | The panel still follows the chart it sits inside — a dosha card disagreeing with the houses drawn six inches above it would be worse — but it now prints the convention it used, and when that is not Lahiri it says in plain words that the linked page computes with Lahiri and can answer differently. |
| **The Papa Dosha card in English** | `lagna: 4 · moon: 3 · venus: 2` — the program's own internal words, in the language a Hindi reader was already being served properly. | `Lagna: 4 · Moon: 3 · Venus: 2`, from the same shared vocabulary the rest of the app uses. |
| **The birth panchang in Hindi** | A Hindi reader's own birth panchang was printed in English: `वार Shukravara (Fri) · तिथि Krishna Saptami · नक्षत्र Shatabhisha · योग Priti · करण Vishti`. | `वार शुक्रवार · तिथि कृष्ण सप्तमी · नक्षत्र शतभिषा · योग प्रीति · करण विष्टि`. |
| **"No supportive window"** | *"No clearly supportive window found in the next twenty years."* — read as a statement about the marriage, when it is a statement about how far Ganak looked. The other edge of the search, an 18-year age floor, was never mentioned anywhere. | Both edges are named before the list: *"Searched between age 18 — the marriageable-age floor Ganak uses — and 20 years from today."* An empty list now says so is a limit of the range, not a finding about the chart. |

## Findings closed, with evidence

Every "before" block below is a real render of the real screen, produced by seeding a
real `computeKundli` result into ChartScreen's own `result` slot — the technique
`validation/snapshot-results.cjs` already uses for the match result. Harness kept at
`.scratch/chartfix/` (gitignored).

### F9 (P1) — switching panels destroyed both people's birth data

**Reproduced.** `ChartScreen.tsx:500` (pre-fix) conditionally *mounted* `MatchMaker`;
line 495 did the same for `ChartVault` and line 504 for the whole result column:

```
activePanel=kundli  : matchForm=false vaultPanel=false results=true
activePanel=matching: matchForm=true  vaultPanel=false results=false
activePanel=vault   : matchForm=false vaultPanel=true  results=false
activePanel=dashas  : matchForm=false vaultPanel=false results=true
activePanel=tools   : matchForm=false vaultPanel=false results=true
```

`false` there is not "hidden" — it is *not in the document*, so React discarded all ten
of MatchMaker's `useState` slots. AGENTS.md: *"no state resets without a user action."*

**Fixed.** All three render always and carry `hidden`, which is exactly what the sibling
sections inside the result column already do (the effect at `ChartScreen.tsx:171` sets
`child.hidden`). `activePanel` initialises from `urlPrefGet("panel")` and is written back
with `urlPrefSet`, the way `chartStyle` already did — and the valid keys come from
`JYOTISH_GROUPS` in the nav itself, never a second hand-written list.

```
panel=kundli   matchMounted=true vaultMounted=true resultsMounted=true
panel=dashas   matchMounted=true vaultMounted=true resultsMounted=true
panel=matching matchMounted=true vaultMounted=true resultsMounted=true
panel=tools    matchMounted=true vaultMounted=true resultsMounted=true
panel=vault    matchMounted=true vaultMounted=true resultsMounted=true
```

`hidden` is a text-invisible attribute, so a rendered-text gate cannot prove it actually
hides anything. That half was checked in a live browser against the app's own stylesheet:

```
div[hidden] in the running app : display "none", height 0, text absent from innerText
same div shown                 : height 127.5px
stylesheet rules setting `display` on a plain div : none
```

### F7 (P1) — the dosha panel silently followed the reader's ayanamsa

**Reproduced** at 1970-07-10 06:00 Delhi, the audit's own case:

```
--- ayanamsa=lahiri ---            --- ayanamsa=raman ---
Kala Sarpa                          Kala Sarpa
Shankhachuda · fortune, dharma…     Karkotaka · change, depth and longevity
Pitra Dosha                         Pitra Dosha
1 indication                        No indications found
Papa Dosha                          Papa Dosha
Load 7/15 · high                    Load 9/15 · high
Full page →                         Full page →
(no convention named anywhere)      (no convention named anywhere)
```

**Decision, recorded rather than assumed.** The brief offered two fixes: pin the panel to
Lahiri, or print the active ayanamsa and carry it through the links. The engine-side leak
was fixed on 2026-08-18 (`plans/audits/2026-08-18-ayanamsa-leak-fix.md`), so the ayanamsa
now travels with the request and either is technically available.

**Chosen: print it, do not pin.** Pinning would make the panel disagree with the chart it
is part of — the reader would see Rahu in one house in the diamond above and a Kala Sarpa
type computed from a different house immediately below, silently. That is the same class
of defect, moved. Carrying the ayanamsa *through the link* is not available to this lane:
`UtilityCalculatorScreen.tsx` is owned by another agent and has no ayanamsa parameter, so
the link cannot be made to agree — it can only be made honest.

```
lahiri : Computed with the ayanamsa this chart was cast on: Lahiri (Chitrapaksha).
raman  : Computed with the ayanamsa this chart was cast on: Raman (B.V. Raman). The
         “Full page →” links below always compute with Lahiri (Chitrapaksha), so their
         answers can differ from this panel.
```

The line is gold rather than muted whenever it is not Lahiri, so the disagreement is not
buried in fine print. **Follow-up for whoever owns the calculator pages:** teach
`/calculator/kala-sarpa|pitra-dosha|papa-dosha` to accept an ayanamsa, and this note can
become a link that carries it instead of a warning that it will not.

### F13 (P2) — English printed the engine's internal keys

**Reproduced:** `lagna: 4 · moon: 3 · venus: 2` (English), against a correct
`लग्न: 4 · चन्द्र: 3 · शुक्र: 2` in Hindi — English was the degraded language here.

**Fixed:** `Lagna: 4 · Moon: 3 · Venus: 2`. The two grahas resolve through
`planetName(lang, …)` so their names can never drift from the rest of the app; the
ascendant is not a graha and has no entry in that table, so it keeps its own pair. An
unrecognised reference falls through to its own key rather than being mislabelled.

### F14 (P2) — the birth panchang was English-only in Hindi

**Reproduced** (Hindi, fixture birth):

```
वार  Shukravara (Fri)      →   वार  शुक्रवार
तिथि Krishna Saptami       →   तिथि कृष्ण सप्तमी
नक्षत्र Shatabhisha          →   नक्षत्र शतभिषा
योग  Priti                 →   योग  प्रीति
करण  Vishti                →   करण  विष्टि
```

**`src/engine/kundli.ts` was NOT changed.** The brief allowed editing the five strings at
lines 79 and 200, but the engine is right as it stands: `src/i18n/panchang-terms.ts` says
in its own header that the engine speaks one canonical language internally and
localisation belongs at the edge, and three of the five values (tithi, paksha, nakshatra)
already had tables there. The missing halves were the tables, not the engine. Added to
`panchang-terms.ts`: `YOGA_HI` (27), `KARANA_HI` (11) and `VARA_HI` (7) — the vara is
built from the existing `WEEKDAY_HI` array rather than typed a second time, because two
spellings of Friday on one screen is the exact defect that module exists to prevent. All
three are registered in `TABLES`, so `panchangTerm(lang, "yoga" | "karana" | "vara", …)`
works with the same "(Fri)" suffix-stripping and same fall-through-on-unknown behaviour as
the tables beside them.

### F22 (P2) — the twenty-year horizon read as an astrological finding

**Reproduced** at a 2075 birth, where the horizon (twenty years from today) falls before
the chart's first dasha even begins:

```
en: No clearly supportive window found in the next twenty years.
hi: आगामी बीस वर्षों में कोई स्पष्ट अनुकूल अवधि नहीं मिली।
    (the 18-year floor at marriage-timing.ts:23 appeared nowhere on the screen)
```

**Fixed on the screen, as the previous lane recommended.** `MARRIAGE_AGE_FLOOR_YEARS` and
`MARRIAGE_HORIZON_YEARS` are exported from `src/engine/marriage-timing.ts` and used both
by the arithmetic and by the sentence, so the two cannot drift. **No field was added to
the returned object** — an unrendered computed field is the F23 defect the 2026-08-18 lane
spent its branch removing, and these constants are rendered on every chart, empty list or
not:

```
en: Searched between age 18 — the marriageable-age floor Ganak uses — and 20 years from
    today. Periods outside that range are not shown.
    No clearly supportive window falls inside that range. That is a limit of the range,
    not a finding about the chart — supportive periods can fall outside it.
hi: खोज की सीमा: जन्म से 18 वर्ष की आयु से लेकर आज से 20 वर्ष आगे तक। इस सीमा के बाहर की अवधियाँ यहाँ नहीं दिखतीं।
    उपर्युक्त सीमा के भीतर कोई स्पष्ट अनुकूल अवधि नहीं मिली। यह सीमा का परिणाम है, कुंडली का निष्कर्ष नहीं — इस
    सीमा के बाहर अनुकूल अवधि हो सकती है।
```

## The gate — `validation/screen-snapshots.cjs` § 6

The existing `chart.en` / `chart.hi` baselines are a **composed mirror**: `snapshot-results.cjs`
re-assembles a few values out of `computeKundli` with the display helpers. Four of these
five findings lived in lines that mirror does not contain, and it was green on all of them.

§ 6 renders the real `ChartScreen` with a real `computeKundli` result seeded into its own
`result` slot and asserts, with **no baseline** — these are invariants, so they must not be
re-blessable by regenerating a file:

- **6a (F9)** every panel keeps all three containers mounted; exactly the inactive ones
  carry `hidden`. It also asserts ChartScreen still declares exactly three
  null-initialised state slots, so a fourth one cannot silently shift the seeding.
- **6b (F9)** `?panel=matching|vault|dashas` opens the right panel, and the source really
  calls `urlPrefSet("panel", …)`.
- **6c (F14)** no Latin script in any of the five Hindi birth-panchang values — plus an
  **exhaustive** sweep of all 27 yogas, all 11 karanas (the four fixed ones derived through
  `karanaName` rather than a hand-copied list) and all 7 varas, so a value this fixture
  never lands on cannot hide.
- **6d (F13)** both languages name the three Papa references in words, and the raw keys
  appear in neither.
- **6e (F7)** the dosha panel names its ayanamsa on a Lahiri chart and on a Raman one, and
  on a Raman one it also warns about the linked pages.
- **6f (F22)** the marriage block prints both edges of the search, on an ordinary birth and
  on one beyond the horizon, and the old "next twenty years" sentence is gone.

### Fail-then-pass

New gate, three source files reverted to `b9ceee5`, gate kept:

```
FAIL chart panels: with panel="kundli" the matching panel is not mounted at all.
FAIL chart panels: with panel="kundli" the vault panel is not mounted at all.
FAIL chart panels: with panel="kundli" the cast chart's result column is not mounted.
…(the same three for dashas, matching, tools, vault)
FAIL chart panels: ?panel=matching opened [] instead of ["matching"].
FAIL chart panels: ?panel=vault opened [] instead of ["vault"].
FAIL chart panels: choosing a panel never writes it to the URL — reload and Back would still lose it.
FAIL chart.hi: the birth panchang prints "वार" in English: Shukravara (Fri)
FAIL chart.hi: the birth panchang prints "तिथि" in English: Krishna Saptami
FAIL chart.hi: the birth panchang prints "नक्षत्र" in English: Shatabhisha
FAIL chart.hi: the birth panchang prints "योग" in English: Priti
FAIL chart.hi: the birth panchang prints "करण" in English: Vishti
FAIL panchang terms: 39 value(s) have no Devanagari name: yoga Vishkambha, yoga Priti, …
FAIL chart.en: the Papa Dosha card does not name its reference points (/\bLagna: \d/).
FAIL chart.en: the Papa Dosha card does not name its reference points (/\bMoon: \d/).
FAIL chart.en: the Papa Dosha card does not name its reference points (/\bVenus: \d/).
FAIL chart.en: the Papa Dosha card prints the engine's internal keys instead of words.
    lagna: 4 · moon: 3 · venus: 2
FAIL chart.en: the dosha panel on a Lahiri chart never names the ayanamsa it computed with.
FAIL chart.en: the dosha panel on a Raman chart never names the ayanamsa it computed with.
FAIL chart.en: on a Raman chart the dosha panel must say the linked full pages compute with Lahiri.
FAIL chart.hi: (the same three)
FAIL marriage timing: the age floor and horizon must be exported constants the screen can print.
FAIL chart.en (beyond the horizon birth): the marriage block must state both edges of the search…
FAIL chart.en (ordinary birth): the marriage block must state both edges of the search…
FAIL chart.en: an empty window list still reads as a finding about the marriage rather than a
     limit of the range searched.
FAIL chart.hi: (the same three)

✗ screen-snapshots FAILED (41)
```

Fixes restored:

```
✓ screen-snapshots: 58 baselines match · 27 screens × 2 languages + chart/transit/match results
✓ calculator cross-seeding: 728 mismatched-result renders identical to no result (0 crashes,
  0 foreign answers) · 28 own-result renders still answer
✓ yoga content parity: 25 yoga templates × 110 parameter sets · 110 distinct English
  interpretations → 110 distinct Hindi (no collapse)
✓ cast chart rendered for real: 15 panel visibility checks across 5 panels (nothing unmounts) ·
  ?panel= restores the open panel · birth panchang, Papa references, dosha ayanamsa and the
  marriage search range all read in both languages
```

**No baseline moved.** All 58 committed snapshots still match byte for byte: the chart
screen's baseline is its uncast, empty-form state, and none of these five findings is
visible there — which is precisely why they survived so long.

## Full suite

```
96 passed, 0 failed.
```

`npm run build` clean (`✓ built in 1.22s`, sitemap 200 URLs, 200 route HTML files).
Typecheck noise in the four touched files went from 15 pre-existing errors to 13; two were
removed by giving `JyotishPanelNav`'s `onSelectGroup` its key parameter.

## What this pass did NOT cover — stated explicitly

1. **No dev-server pass of the fixed code.** The Browser pane's launch config runs from the
   main repository, so it served `main`'s `ChartScreen`, not this worktree's — verified by
   fetching `/src/screens/ChartScreen.tsx` from the running server and finding neither
   `match-panel` nor `"vara"`. What *was* proved in the live browser is the one thing a
   text render cannot prove: `hidden` really produces `display: none` under this app's
   stylesheet, and nothing in it sets `display` on a plain `div`. The interaction itself —
   type a couple, tap Vault, tap Matching, confirm the two births are still there — has not
   been performed by a human and should be, once this is merged and running.
2. **Nothing at 375px.** No layout, overflow, contrast or touch-target check. The dosha
   panel gained a line and the marriage block gained two; all three are `--font-label`
   inside existing cards, but nobody has looked at them on a phone.
3. **The "Full page →" links still disagree with a non-Lahiri panel.** They are now
   *honest* about it, not *consistent* with it. Making them consistent needs an ayanamsa
   parameter on the calculator pages, which this lane does not own — see F7 above.
4. **Mounting cost not measured.** `MatchMaker` and `ChartVault` now mount on every chart
   screen rather than on demand. Neither computes anything on mount (`MatchMaker` holds a
   null result until the reader presses Match; `ChartVault` does one read through the
   approved-storage adapter), and the full gate suite did not slow measurably, but no
   profile was taken on a low-end phone.
5. **`plans/task-log.md`, `plans/backlog.md`, the acceptance register and the sheet-sync
   file were not touched** — out of this lane's scope. The closeout row for these five
   findings still needs writing by whoever integrates this branch.
