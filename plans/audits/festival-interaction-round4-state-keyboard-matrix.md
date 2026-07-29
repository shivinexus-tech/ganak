# Festival-interaction bug bash — Round 4 (independent adversarial audit)

Focus: state preservation, second-activation/collapse, keyboard, representative
entry-type matrix, gate rigor. Application source was **read-only** throughout;
the only writes were this file and throwaway scripts in `$TMPDIR`.

- Gate run: `node validation/festival-interaction.cjs` → **PASS**
  `✓ festival-interaction clean: 125 festival + 41 fast keys routed; CalendarPage + MuhuratHub interaction/a11y contract enforced; 11 failure fixtures caught`
- Files inspected: `src/screens/MuhuratHub.tsx`, `src/screens/CalendarPage.tsx`,
  `src/data/festival-pages.ts`, `validation/festival-interaction.cjs`.

## Verdict

The interaction contract holds on every axis I tested. State preservation,
second-activation collapse, and keyboard all **PASS**. The full entry-type matrix
(eclipse, multi-day Chhath, named Ekadashi / weekday Pradosh, minor/metadata-only,
Navadurga/Navratri) resolves to registered routes, and a live 2025/2026/2027 engine
scan emits **zero** unresolved keys. One real gate-rigor gap found: the round-3
answer-first **observance chip is not individually gated** and could silently
regress to a static `<div>` while the gate stays green (P2). No P0/P1.

---

## Axis 1 — STATE PRESERVATION → PASS

`festHref(path)` (MuhuratHub.tsx:86–96; CalendarPage.tsx:42–52) builds the query
string **only** from the `lang` and `place` props:

```
p.set("lang", lang); if (place && place.label) { p.set("city", ...); lat/lon/zone }
```

It does not read `tab`, `trad`, `fexp`, `isToday`, or the selected date, so every
generated href carries the correct `lang`+`city` regardless of tab, trad, or a
non-today selected date. Verified for all three ff-row anchor kinds and the
CalendarPage `fest-row` anchor.

- **Tab switch** (MuhuratHub.tsx:475) and **trad switch** (`chooseTrad`, line 467)
  both call `setFexp(null)`. The trad buttons only render when `tab === "fasting"`
  (line 464), so there is no cross-tab leak.
- **Vaishnava (ISKCON) shift**: `effFasts` (169–178) rewrites only `f.ms` for
  shifted Ekadashis; `f.key` is unchanged, so `festivalPathForKey("fast", key)`
  resolves to the same canonical page (correct — same festival, later observance).
- **aria-expanded vs rendered panel after a tab/trad switch**: `open = Boolean(fexp
  && fexp.id === id)` (line 511) with `id = tab + ":" + it.key + ":" + it.ms`
  (line 508). `tab` is part of the id, and a vaishnava shift changes `it.ms` →
  a stale `fexp.id` can never match a new row id; `setFexp(null)` also fires on
  every switch. The button's `aria-expanded={open}` (547) and the panel's
  `{open && (…)}` (556) derive from the same `open`, and the controlled panel
  carries `id={panelId}` (559). **No path** produces aria/panel disagreement.

Checked and cleared. (Observation, not a defect: the selected non-today date is
intentionally *not* encoded in the href — the canonical festival page is
date-agnostic, and Back-restoration of the app's selected date relies on the
browser bfcache that real `<a>` navigation preserves. This is the design's
stated mechanism, app-wide, not introduced by this fix. See P3 below.)

## Axis 2 — SECOND-ACTIVATION / COLLAPSE → PASS

Toggle handler (MuhuratHub.tsx:550): `onClick={() => setFexp(open ? null : nextFexp)}`.
A second tap on an open toggle calls `setFexp(null)` and touches **only** the
`fexp` state. `place` (city), `todayP` (date), `lang`, `tab`, and `trad` are all
props/independent state and are untouched. Collapse is non-destructive. PASS.

## Axis 3 — KEYBOARD → PASS

- Primary rows are native `<a href>` (F&F list 527–534, comingRow 236–239,
  observance chip 272, CalendarPage 86–96): Enter activates, natively focusable.
- Quick-details toggle is a native `<button type="button">` (544–554): Enter and
  Space both activate; `onClick` only, no interception.
- `grep preventDefault` over both screens: **none**. The only `onKeyDown` is the
  F&F search input (line 640, Enter→search) — unrelated to the rows.
- Visible focus present for every surface:
  `.ff-row:focus-visible`, `.ff-toggle:focus-visible` (MuhuratHub.tsx:472) and
  `.fest-row:focus-visible` (CalendarPage.tsx:102) — 2px `#A86A12` outline.

PASS.

## Axis 4 — REPRESENTATIVE ENTRY-TYPE MATRIX → PASS

Driven via `validation/_load-app.cjs` loading `festival-meta.ts` + `festival-pages.ts`
+ `engine/festivals.ts`. All resolved to **registered** routes in
`FESTIVAL_PAGE_ROUTES`:

| Kind | Key(s) | Resolved path |
|------|--------|---------------|
| (a) eclipse | `suryaGrahan` | `/festival/surya-grahan` ✓ |
| (a) eclipse | `chandraGrahan` | `/festival/chandra-grahan` ✓ |
| (b) multi-day Chhath | `chhathNahayKhay`,`chhathKharna`,`chhath`,`chhathUshaArghya` | all → `/festival/chhath` ✓ |
| (c) named Ekadashi | `Chaitra_Shukla_11` | `/festival/kamada-ekadashi` ✓ |
| (c) named Ekadashi | `Vaisakha_Shukla_11` | `/festival/mohini-ekadashi` ✓ |
| (c) weekday Pradosh | `pradosh_Sunday` | `/festival/ravi-pradosh` ✓ |
| (c) weekday Pradosh | `pradosh_Monday` | `/festival/som-pradosh` ✓ |
| (d) minor/metadata-only | `pongal`,`vatSavitri`,`vatPurnima`,`anantChaturdashi` | `/festival/pongal`, `/festival/vat-savitri`, `/festival/vat-purnima`, `/festival/anant-chaturdashi` ✓ |
| (e) Navratri festivals | `chaitraNavratri`,`sharadNavratri`,`guptNavratriAshadha`,`guptNavratriMagha`, all 7 `durgaPuja*`, both `*Ghatasthapana` | all registered ✓ |
| (e) Navratri fast | `masikDurgashtami` | `/festival/masik-durgashtami` ✓ |
| (e) Navadurga day-pages | 18 `NAVADURGA_PAGE_ENTRIES` (e.g. `/festival/chaitra-navratri/day-1-shailaputri`) | all registered ✓ |

**Live engine emission** (as the gate does, `scanPanchangCalendar`, New Delhi):

- 2026: 125 festival keys + 36 fast keys emitted → **0 unresolved**, none missing
  from `FEST_NAME`/`OBS_NAME`.
- 2025: 123 fest / 37 fast → **0 unresolved**. 2027: 119 fest / 37 fast → **0 unresolved**.

I tried to find any emitted key that does not resolve to a registered route across
three years; **none exists**. PASS.

## Axis 5 — GATE RIGOR → 1 finding (P2)

### FINDING R4-1 (P2) — Answer-first observance chip is not individually gated; it can silently regress to a static `<div>`

- **File**: `src/screens/MuhuratHub.tsx:264–273` (the round-3 "answer-first"
  observance chip); gate `validation/festival-interaction.cjs:136–142`.
- **Problem**: The chip is a real `<a href={festHref(obsPath)} className="ff-row" …>`
  (line 272), but the gate has **no assertion that names or scopes the chip**. It
  is only counted by the collective predicate
  `hubAnchors = HUB.match(/<a[^>]*className="ff-row"…/g)` with the check
  `hubAnchors.length >= 2` (line 137). The file currently has **3** `ff-row`
  anchors (comingRow, chip, F&F primary). If the chip is reverted to the static
  `<div style={chipStyle}>` that already exists as its own `!obsPath` fallback
  (line 271), the count drops to **2** — still `>= 2` — and every other
  chip-relevant predicate is satisfied by the two *unrelated* surviving anchors.
- **Repro / evidence** (throwaway script, chip anchor → static div):
  ```
  ff-row anchors before: 3 | after chip->div: 2
  gate check hubAnchors.length>=2 : true   (PASSES despite chip regression)
  gate check all anchors ok       : true
  gate check F&F primary href     : true
  gate check comingRow calls      : true
  >>> every chip-relevant gate predicate still passes: true
  ```
  So a regression that turns the chip back into a non-navigating dead element —
  exactly the P0 bug class — ships green.
- **Contrast (why this is the only gap)**: the *other* two new surfaces are
  doubly gated. "Coming up" has named call-site checks
  `comingRow("fast",` / `comingRow("festival",` (line 158) **and** a body check
  requiring `</a>` + `festivalPathForKey(kind, item.key)` + `href={festHref(p)}`
  (lines 159–160). Removing the call sites makes the gate bite (verified:
  `comingRow-calls check passes? false`). The F&F primary row has its own
  `href={festHref(path)}` check (line 142). The chip has neither.
- **Suggested fix (for the fix agent, not applied here)**: add a scoped assertion,
  e.g. match the chip block
  `HUB.match(/obsPath\)\} className="ff-row"[\s\S]*?<\/a>/)` and assert it exists
  and `anchorBlockOk`, or bump the count invariant to `=== 3` / `>= 3` with a
  comment naming the three surfaces. Add a failure fixture mirroring the
  chip→`<div>` regression.

### Secondary observation (not a finding) — `comingRowFn` terminator is brittle

The `comingRowFn` regex (`validation/festival-interaction.cjs:159`) terminates at
the first `\n        };` (8-space `};`). It works today, but it is positionally
fragile — an added `};` at that indentation inside the function would truncate the
scoped block early. Cosmetic robustness note only; the check currently enforces
what it should.

## P3 observation — selected non-today date not carried on the href

`festHref` carries `lang`+`city` but not the selected non-today date. Back-trip
restoration of the app's selected date/tab/trad/scroll relies on the browser
bfcache that native `<a>` navigation preserves (the design's stated,
storage-free mechanism). If bfcache is evicted (e.g. memory pressure on mobile
Safari), Back reloads the app fresh at "today". This is an app-wide property of
the storage-free design, **not** introduced by this fix, and the canonical
festival page is itself date-agnostic — so it is acceptable as-is. Noting only for
completeness.

---

## Per-axis summary

| Axis | Result |
|------|--------|
| 1. State preservation (lang/city across tab/trad/date; aria vs panel) | **PASS** |
| 2. Second-activation / collapse (non-destructive) | **PASS** |
| 3. Keyboard (Enter/Space, no preventDefault, :focus-visible) | **PASS** |
| 4. Entry-type matrix + live 2025/26/27 emission coverage | **PASS** (0 unresolved) |
| 5. Gate rigor | **1 P2** (observance chip under-gated) + 1 cosmetic note |

No P0/P1 defects. The single actionable item is P2 gate hardening for the
observance chip.
