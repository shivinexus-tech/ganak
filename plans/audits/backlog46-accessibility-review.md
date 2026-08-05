# Backlog #46 — Phase 1 code review of the accessibility/comfort implementation

**Reviewer:** Claude Code (integrator lane `claude/a11y-backlog46`)
**Date:** 2026-08-01
**Baseline reviewed:** `9376836` (`refactor: enforce single design-token source`) and its parents
`8ee7f84` (`feat: add accessibility comfort and personalize system`), `93e5f08`, plus the
closeout commit `6aa0c5d`. Worktree checked out at `origin/main`.
**Method:** read-only source review of `src/styles/design-tokens.css`,
`src/components/ui-style-contract.ts`, `src/accessibility/**`, `src/storage/approved-storage.ts`,
`src/telemetry/privacy-events.ts`, `src/main.tsx`, `src/screens/**`, `src/components/**`,
`validation/accessibility-comfort.cjs`, `validation/privacy-events.cjs`; plus mechanical
inventories of hard-coded colour and px values across `src/`.

Findings are ordered by severity. "Intentional staged limitation" is called out where it
applies, and those are **not** counted as defects.

---

## Summary

| Severity | Count |
|---|---|
| P0 | 0 |
| P1 | 4 |
| P2 | 7 |
| P3 | 5 |

The comfort architecture itself is sound: one token file, a genuinely single storage
boundary, sanitised preferences, fail-closed telemetry, a real focus trap and a coordinated
speech singleton. **The defects are almost entirely at the boundary between the new system
and the legacy UI**: the legacy screens never consume the semantic tokens, so two of the
four advertised comfort dimensions (dark mode, and size for most content) do not reach the
app, and a third (Guided ↔ Expert) has no consumers at all.

---

## P1 findings

### R-01 · P1 · Dark mode does not reach the application — only the Personalize wrapper honours it
**File:** `src/kundli-app.tsx:72-75`, `:76-81`, `:111`, `:112-159`
```
const C = { bg: "#FAF5EA", panel: "#FFFFFF", line: "#E7DDC6",
            gold: "#A86A12", sindoor: "#C2451E", ivory: "#3B3147", muted: "#8C8173" };
```
`C` is the palette object threaded into **every** screen (`kundli-app.tsx:198,205,207,214,218,221`).
It is a frozen set of light-mode hex literals. The root container at `:111` also paints
`background: …${C.bg}` and `color: C.ivory` directly.

**Reproduction:** Personalize → Appearance & comfort → Light & dark → **Dark**. Return to Today.
**Observed:** `html[data-color-mode="dark"]` is set and the token layer flips, but Today,
Muhurat, Festivals, Prashna and Jyotish keep rendering cream `#FAF5EA` surfaces with
`#3B3147` ink. Only the thin `AccessibilityRoot` strip and the Personalize hub go dark.
**Expected:** every launch route follows the colour-mode preference.
**Why it is P1 not P0:** the app is still fully usable and legible — it is simply always
light. Nothing is lost or wrong; an advertised preference is inert.

### R-02 · P1 · `--scale` (Simple & Large) barely moves the legacy screens
**Files:** `src/kundli-app.tsx:137,140,161,166,172,175,181`; `src/screens/ChartScreen.tsx` (299 raw
numeric style values), `src/screens/MuhuratHub.tsx` (256), `src/screens/DailyScreen.tsx` (110),
`src/screens/JyotishBnnScreen.tsx` (99), and 20 more files — ~1,300 raw numeric style values in total.

`--scale` works by setting the root `font-size`, so only `rem`/`em`-derived values grow.
Legacy code uses unitless React numbers, which React serialises as **px**: `fontSize: 46`
(hero), `fontSize: 14px` (table cells, `kundli-app.tsx:137`), `fontSize: 13.5`, `12.5`, `10.5`,
`padding: "40px 20px 80px"`, `maxWidth: 760`.
**Reproduction:** first-run → **Simple & Large**; compare Today before/after.
**Observed:** only the `T.*` token consumers grow. The hero, tables, most row labels, chips
and captions stay pinned at their px sizes, so the preset produces an inconsistent, partly
enlarged page rather than a uniformly larger one.
**Expected:** Simple & Large enlarges all body content proportionally; mathematically
required geometry (SVG charts, canvas, fixed diagram dimensions) is explicitly exempt.

### R-03 · P1 · Guided ↔ Expert is a setting with zero consumers
**Files:** `src/styles/design-tokens.css:119-120`; `src/accessibility/ComfortProvider.tsx:101`;
`src/screens/PersonalizeScreen.tsx:155,181`
```
html[data-depth="guided"] .expert-only { display: none !important; }
html[data-depth="expert"] .guided-only { display: none !important; }
```
`grep -rn "expert-only\|guided-only\|preferences.depth" src` returns **no consumer outside
PersonalizeScreen's own slider**. No component in the app carries either class.
**Reproduction:** Personalize → Guidance depth → drag Guided ↔ Expert. Visit any route.
**Observed:** nothing whatsoever changes. The preset cards also advertise
"Bigger type · guided" and "More detail · expert" (`PersonalizeScreen.tsx:105-107`), which is
not true today.
**Expected:** Guided shows verdict-first plain language and essential actions; Expert adds
calculations, technical terms and supporting data, without ever hiding warnings, dates,
actions or safety information.

### R-04 · P1 · `data-depth="balanced"` is undefined in CSS — both variants would render at once
**File:** `src/styles/design-tokens.css:119-120`
Only `guided` and `expert` have rules. `ComfortProvider` can legitimately set
`depth: "balanced"` (it is the default — `ComfortProvider.tsx:49,66`). Under the default
preference, **both** `.guided-only` and `.expert-only` are visible.
**Why it matters now:** it is latent today only because R-03 means nothing uses the classes.
The moment adoption starts (Phase 3C), the default preference renders duplicated and
contradictory content. This must be fixed *before* adoption, not after.

---

## P2 findings

### R-05 · P2 · OS "increased contrast" is ignored in dark mode
**File:** `src/styles/design-tokens.css:91-97` vs `164-168`
`@media (prefers-contrast: more) { :root { --line: currentColor; } }` has selector specificity
(0,1,0). The dark override `html[data-color-mode="dark"] { … --line: var(--theme-line-dark); }`
is (0,1,1) and wins regardless of source order.
**Reproduction:** macOS/iOS **Increase Contrast** on + Ganak in Dark.
**Observed:** borders stay the low-contrast `#5B5260`.
**Expected:** increased-contrast borders in **both** modes (and in `prefers-color-scheme: dark`
auto mode, which has the same problem).

### R-06 · P2 · Read-aloud can pick an English voice for Hindi on the first use
**File:** `src/accessibility/ReadAloudButton.tsx:21-25,110-111`
`window.speechSynthesis.getVoices()` returns `[]` until the engine fires `voiceschanged` in
Chrome/Edge. `preferredVoice()` is called synchronously inside `speak()` with no
`voiceschanged` wait and no retry.
**Observed:** the first 🔊 सुनें tap after a cold load can fall back to the browser default
(usually `en-US`), which reads Devanagari as gibberish or silence. A second tap works.
**Expected:** the Hindi voice is used on the first attempt, or the user is told visibly that
no Hindi voice is installed.

### R-07 · P2 · Speech has no watchdog — a stalled utterance leaves the button stuck on "Stop"
**File:** `src/accessibility/ReadAloudButton.tsx:98-121`
State goes to `speaking` immediately on `speak()`. If the platform never fires `onstart`,
`onend` **or** `onerror` (a well-known Safari/iOS and Chrome-background-tab behaviour), the
button stays "■ Stop" forever with no audio and no visible error.
**Expected:** if speech has not started within a short window, surface the existing bilingual
error and return to idle.

### R-08 · P2 · Muhurat has no Listen control at all
**Files:** `src/screens/MuhuratHub.tsx` (no `ReadAloudButton` import), `MedicalMuhuratScreen.tsx`
Today, festival guides and vidhi cards have Listen (`validation/accessibility-comfort.cjs:165-170`
gates all three). Muhurat — the screen whose whole output is *"do this at this time, avoid
that"* — has none. This is exactly the content the low-literacy/elder audience needs read out.
*(Known gap, recorded in the register; scheduled as Phase 3D of this task.)*

### R-09 · P2 · Colour-only meaning survives in Muhurat despite the colour-blind-safe rule
**File:** `src/screens/MuhuratHub.tsx:145,411,584,668`
```
const natColor = (nat) => nat === "good" ? "#1F7A4D" : nat === "bad" ? C.sindoor : C.gold;
…<span style={{ width: 7, height: 7, borderRadius: "50%", background: w.shubha ? "#1F7A4D" : C.sindoor }} />
```
The Choghadiya nature swatch and the Panchaka dot carry their meaning **only** in colour —
no ✓/⚠ glyph and no text. `PersonalizeScreen.tsx:182` explicitly promises "Meaning beyond
colour". ~8% of men cannot distinguish these two hues.
**Expected:** every auspicious/avoid signal pairs an icon or word with the colour.

### R-10 · P2 · Hard-coded light-only input backgrounds will be unreadable once dark mode lands
**File:** `src/screens/MuhuratHub.tsx:500,516,525,530,550,561,562`; `src/screens/ChartScreen.tsx:369`
`background: "#FFFDF7"` combined with `color: C.ivory`. Today `C.ivory` is dark ink so it
reads; the moment R-01 is fixed and `C.ivory` becomes `var(--ink)` (near-white in dark), these
become **white text on a white field**.
**Expected:** these must be migrated in the same change as R-01, not after it. Listed here so
the dependency is explicit rather than discovered in production.

### R-11 · P2 · The focus-visible ring is overridden globally by an `!important`-style rule
**File:** `src/kundli-app.tsx:131`
```
input:focus, select:focus, button:focus-visible { border-color: #A86A12 !important;
  box-shadow: 0 0 0 3px rgba(168,106,18,.22); outline: none; }
```
`outline: none` on `button:focus-visible` removes the token focus ring
(`design-tokens.css:137-141`) for every button that is not also `.comfort-focus`, replacing it
with a 3px gold glow that is fixed in px (does not respond to `prefers-contrast: more`) and is
a hard-coded light-mode gold on any future dark surface.
**Expected:** one focus treatment, token-driven, honouring increased contrast.

---

## P3 findings

- **R-12 · P3 · Un-scaled flash on load.** `ComfortProvider.tsx:132-137` reads preferences in an
  effect, so the first paint is always the 106.25% default. A user on Simple & Large sees the
  page reflow. Acceptable for now; noted.
- **R-13 · P3 · Modals do not `inert` the background.** `useModalFocus.ts` traps Tab and Escape
  correctly, but the page behind `FirstRunComfortOffer`/`ParentSetup` is not `aria-hidden`/
  `inert`, so a screen-reader user can swipe out of the dialog.
- **R-14 · P3 · `aria-pressed` on the Listen button doubles up with a changing label.** The
  accessible name already flips Listen → Stop; `aria-pressed` on top of that is announced
  redundantly ("Stop, pressed"). Harmless, slightly noisy.
- **R-15 · P3 · `validation/accessibility-comfort.cjs:162` pins literal fallback hexes.**
  `includesAll(placeInput, ['background: C.panel || "#FFFDF7"', …])` makes the gate assert the
  presence of hard-coded hex fallbacks, which is the opposite of the single-token rule. The
  gate should assert the semantic fallback instead.
- **R-16 · P3 · Preset cards reference an undefined token.** `PersonalizeScreen.tsx:111` uses
  `var(--sacred, var(--accent))`; `--sacred` does not exist in the token file. It falls back
  correctly, so this is dead code, not a bug.

---

## Explicitly verified as correct (no action)

| Review axis | Verdict |
|---|---|
| Single token source | **PASS.** `src/styles/design-tokens.css` is the only file matching `/token/i` under `src/`; `ui-style-contract.ts` carries no values and the gate proves it (`accessibility-comfort.cjs:59-82`). |
| WCAG-AA token contrast | **PASS.** 10 light/dark pairs are computed from the real declared hex values at gate time, all ≥ 4.5:1. The gate parses the file rather than restating fixtures. |
| Preference persistence via the approved adapter | **PASS.** `approvedStorage` is the single boundary, one auditable root key, envelope-versioned, allow-listed store names, every read sanitised through `sanitizePreferences` with range/enum clamping and a 64-item / 128-char follow cap. |
| No direct `localStorage`/`sessionStorage` | **PASS.** Gate walks every source file and excludes only the adapter itself (`accessibility-comfort.cjs:118-125`). |
| Analytics fail-closed | **PASS.** `privacy-events.ts` returns early unless there is an endpoint **and** `analyticsConsentGranted()` **and** an allow-listed event name; props are allow-listed to four keys and truncated. Spoken text is never passed to it. |
| Tradition/deity preferences local-first | **PASS.** Follows live only in the approved store; `sensitiveSync` defaults false and records consent only; the bilingual sensitivity notice is present (`PersonalizeScreen.tsx:193`). |
| TTS single-session coordination | **PASS.** Module-level `activeSpeechId` plus `ganak:tts-start` / `ganak:tts-stop-all` events; unmount and route-change cancel; `canceled`/`interrupted` errors correctly ignored. (Robustness gaps are R-06/R-07.) |
| Deep links / Back-Forward / first-run | **PASS.** Personalize is a real `pushState` entry with `ganakPersonalize` state and scroll restore; explicit URL `lang`/place win over stored preferences for that link only; `popstate` re-syncs. |
| Modal focus management | **PASS.** Initial focus, `data-modal-autofocus`, Tab cycling both directions, Escape, and focus restoration to the previous element. |
| EN/HI parity in the new surfaces | **PASS.** Every string in Personalize, the first-run offer, parent setup, storage errors and speech errors has both languages. |

---

## What Phase 3 must therefore do

R-01, R-02 and R-10 collapse into **one** change: migrate the legacy screens onto the semantic
tokens and rem-based sizes (backlog #46 item A). R-03 and R-04 are item C. R-08 is item D.
R-09 is fixed by the shared `Badge` primitive in item B. R-05, R-06, R-07, R-11 and R-15 are
standalone fixes.
