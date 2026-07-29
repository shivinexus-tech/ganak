# Audit B — MuhuratHub "Fasts & festivals" + festival-interaction gate

Agent: independent adversarial audit (Audit B). Application source treated as read-only.
Scope: `src/screens/MuhuratHub.tsx` (F&F list block only, ~L447–627) and
`validation/festival-interaction.cjs`. CalendarPage / festival-pages.ts out of scope (Audit A owns).

Verified: `node validation/festival-interaction.cjs` → **PASS**
(`125 festival + 41 fast keys routed; 6 failure fixtures caught`, exit 0).
`npm run build` → **PASS** (built in 1.45s, no TS/compile errors).

## Verdict

The **implementation is correct and passes every contract clause.** The old invisible
whole-row toggle is gone; the primary action is a real `<a href>`, the quick-details
toggle is a distinct, labelled, keyboard-native `<button>` with correctly-bound
`aria-expanded`/`aria-controls`, an open-state chevron, viewport reveal, and an in-panel
bilingual "Open full guide" link. No P0/P1 defects in the UI.

The **gate, however, is partly theatre.** Several of its MuhuratHub clauses are
whole-file substring greps that are satisfied by unrelated text elsewhere in the same
file, so real regressions of those specific clauses would pass unnoticed. Details below.
No gate weakness currently masks a live bug — the code happens to be right — but the gate
does not actually guard what it claims to for at least three clauses.

---

## PASS/FAIL per contract clause (MuhuratHub F&F block)

| # | Contract clause | Result | Evidence |
|---|---|---|---|
| 1 | Primary row is a real `<a href>` opening canonical `/festival/<slug>` | PASS | L510–517 `<a href={festHref(path)}>` |
| 2 | href preserves lang + city | PASS | `festHref` L86–96 sets `lang`, `city`, `lat`, `lon`, `zone` (URL query only, no storage) |
| 3 | Separate, visually-distinct chevron toggle (not the whole row) | PASS | dedicated `<button className="ff-toggle">` L527–537, own 46px cell + left border |
| 4 | `aria-expanded` bound to boolean open-state (collapsed = "false", not omitted) | PASS | L494 `const open = Boolean(...)`; L530 `aria-expanded={open}` |
| 5 | `aria-controls` → panel `id`, ids match | PASS | L531 `aria-controls={panelId}`, L542 `id={panelId}`, `panelId` L497 |
| 6 | aria-expanded cannot disagree with rendered panel | PASS | same `open` gates both L530 attr and L539 `{open && ...}` render |
| 7 | Visible open-state chevron with rotation | PASS | L536 `›`, `transform: open ? "rotate(90deg)" : "none"` |
| 8 | scrollIntoView reveals panel in viewport | PASS | L78–83 useEffect on `fexp`, `block:"nearest"` |
| 9 | In-panel bilingual "Open full guide" link | PASS | L609–612, guarded by `path &&` |
| 10 | Old invisible whole-row `role="button"` toggle removed | PASS | no `role="button"` on the row; row is `<a>` or non-interactive `<div>` fallback |
| 11 | Toggle has an accessible name | PASS | L532 dynamic `aria-label` ("Show/Hide quick details: <name>") |
| 12 | Keyboard reachable + visible focus | PASS | native `<button>`; `.ff-toggle:focus-visible` + `.ff-row:focus-visible` outlines L455 |
| 13 | Null path (no page) → visible bilingual fallback, not broken link/silent row | PASS | L518–526 renders "Full page not available yet / पूरा पृष्ठ अभी उपलब्ध नहीं"; toggle still works |

All 13 clauses PASS.

---

## Findings

### F-B1 — GATE THEATRE: "visible open-state chevron" clause is unenforced (P2)
`validation/festival-interaction.cjs:74-76,104`. `hasVisibleAffordance(HUB)` returns true
if `rotate(90deg)` **or** any of `[›▸▾▼]` appears **anywhere** in the file. Those chars
occur independently at `MuhuratHub.tsx:319` (`▾`/`▴` panchang toggle), `:611`
("Open full guide ›"), and `:626` ("more ›"). So deleting the toggle's chevron span
(L536) — the exact regression this clause targets — still passes the gate. The rotation
half is likewise unguarded because the `[›▸▾▼]` fallback alone satisfies it.
Repro: remove L536; gate still green.

### F-B2 — GATE THEATRE: in-panel "Open full guide" link not actually checked (P2)
`festival-interaction.cjs:105` greps for `Open full guide` + `पूरी मार्गदर्शिका खोलें`
anywhere in the file. Both strings already appear in the **primary row's aria-label**
(`MuhuratHub.tsx:513`), independent of the in-panel link (L609–611). Deleting the in-panel
link — the contract's explicit requirement (brief §3 "Open full guide inside the panel") —
leaves the gate green. The gate cannot distinguish the aria-label from the panel link.

### F-B3 — GATE WEAKNESS: primary-row navigation not uniquely enforced (P3)
`festival-interaction.cjs:98` greps for literal `href={festHref(path)}`, which appears at
both `MuhuratHub.tsx:511` (primary row) and `:610` (in-panel link). Removing the primary
row anchor while keeping the in-panel link still passes, even though the row would then be
non-navigable. The clause "primary row opens the canonical page" is not what's actually
tested.

### F-B4 — GATE WEAKNESS: HUB expand control keyboard-reachability never checked (P2)
The gate has a `rowIsKeyboardReachable` predicate (L58–63) but applies it only to
CalendarPage, never to the HUB toggle. For HUB it only asserts `aria-expanded=`/
`aria-controls=` strings exist (`expandControlHasAria`, L99). A regression turning the
toggle into `<div aria-expanded aria-controls onClick>` (no `onKeyDown`, no `tabIndex`,
not a `<button>`) would PASS the gate while being mouse-only — precisely the "click-only
row" anti-pattern the suite claims to guard. The code is currently a real `<button>`, so
no live bug, but the guard is absent.

### F-B5 — GATE WEAKNESS: whole-file greps, not per-element (P2, umbrella)
`expandControlHasAria(HUB)`, `hasVisibleAffordance(HUB)`, and the lang/city/scrollIntoView
checks all test for substrings anywhere in a 900-line file. `aria-expanded` and
`aria-controls` could sit on two unrelated elements and still pass. The gate proves the
*tokens exist in the file*, not that they co-occur on the toggle. This is the root cause
of F-B1..F-B4.

### F-B6 — GATE WEAKNESS: coverage loop only covers registry keys, not surfaced keys (P3)
`festival-interaction.cjs:119-126` iterates `FEST_NAME`/`OBS_NAME` and asserts each routes.
But the F&F list renders `it.key`, which for fasting variants can be a variant key
(`it.key !== kind`, MuhuratHub.tsx:487,496). If the live fasts pipeline surfaces a variant
key absent from `OBS_NAME`, the coverage loop never tests it; at runtime
`festivalPathForKey` returns null and the UI shows the "Full page not available yet"
fallback. Gracefully handled in the UI (no dead-end), but the gate's claim to catch
"any live registry key missing from the matrix" is only as complete as the two registries
it enumerates — it does not enumerate what the surface actually displays.

### F-B7 — GATE WEAKNESS: old-toggle removal regex is brittle (P3)
`festival-interaction.cjs:109` fails only on the exact shape
`role="button" ... onClick={() => setFexp`. A reintroduced whole-row div toggle written
any other way (e.g. `onClick={onToggle}`, or `role='button'` single-quoted, or >120 chars
between attrs) would slip past. Narrow anti-pattern signature rather than a structural check.

### F-B8 — GATE GAP: HUB row focus style unguarded (P3)
The gate checks `fest-row:focus-visible` for CalendarPage (L90) but has no equivalent
`ff-row:focus-visible` / `ff-toggle:focus-visible` assertion for HUB. The styles exist
(MuhuratHub.tsx:455), but a regression deleting them would not be caught.

### F-B9 — CODE HARDENING (theoretical): toggle rendered unconditionally may yield a near-empty panel (P3)
`MuhuratHub.tsx:527` renders the chevron toggle for every item regardless of available
detail. If an item ever has `meta == null` **and** `fexpDetail == null` **and**
`path == null`, opening it produces an essentially empty panel (dashed border + padding
only) — the "blank panel after interaction" bug class (brief L19). Not reproduced with
current registry data (festival/vrat items yield at least a tithi/info line via
`vratDetail`), so this is latent, not live. Consider gating the toggle on presence of any
displayable detail, or hiding it when the panel would be empty. The gate does not check
this at all.

---

## Gate rigor assessment

**Real parts:** the live-registry coverage loop (every `FEST_NAME`/`OBS_NAME` key resolves
to a registered route) is genuine and valuable — it would catch an unrouted or misrouted
festival key. The `aria-expanded={open}` (L100) and `const open = Boolean(`/`!!` (L102)
literal checks meaningfully pin the boolean-coercion contract. The `aria-controls={panelId}`
+ `id={panelId}` pair (L103) is a reasonable proxy. The six self-contained failure fixtures
(L130–140) correctly exercise the *predicate functions* on synthetic bad input and do bite.

**Theatre / weak parts:** the visible-chevron clause (F-B1), the in-panel guide-link clause
(F-B2), and the primary-row-anchor clause (F-B3) are all satisfiable by unrelated text and
would not catch their own target regressions. HUB toggle keyboard-reachability (F-B4) is
never tested despite a ready-made predicate. The fixtures validate the predicates but the
predicates are then applied to the whole file as blunt substring searches (F-B5), so
passing fixtures do **not** imply the file-level checks are meaningful. Net: the gate would
catch a *routing* regression and an `aria-expanded` binding regression, but would MISS
deletion of the toggle chevron, deletion of the in-panel guide link, removal of the primary
anchor (if the in-panel link remains), and conversion of the toggle to a mouse-only div.

**Recommended hardening (for the owning agent, not applied here):** extract the single F&F
toggle `<button ...>` element via regex and assert `aria-expanded`, `aria-controls`,
`type="button"`/`<button`, the chevron span, and `rotate(90deg)` all occur **within that
element's** substring; assert the in-panel `<a href={festHref(path)}>` link occurs **inside
the `id={panelId}` panel** substring; add a `ff-row:focus-visible` check; and enumerate the
keys the surface can actually emit rather than only the registry.

## What I checked
- Full F&F block MuhuratHub.tsx L447–627 (state L63–96, list render L466–621).
- All 13 contract clauses (table above) — read the actual JSX, not just greps.
- CSS focus styles L455; scrollIntoView effect L78–83; festHref state preservation L86–96.
- Every gate assertion in festival-interaction.cjs L84–144, and traced each MuhuratHub
  clause to the file text that satisfies it (confirmed false-positive sources via grep).
- Ran the gate (PASS, 125+41 keys, 6 fixtures) and `npm run build` (PASS).
