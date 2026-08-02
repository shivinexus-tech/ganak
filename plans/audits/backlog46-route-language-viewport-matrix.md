# Backlog #46 — route × language × viewport verification matrix

**Branch:** `claude/a11y-backlog46` · **Date:** 2026-08-01
**Method:** every route loaded in a real browser at a real viewport width, then measured
in-page. Nothing here is an estimate — each cell is a number the page reported.

Measurement definitions (the probe is `.scratch/audit.js`, run inside each loaded route):

| Column | What is measured |
|---|---|
| **ov** | `documentElement.scrollWidth − clientWidth`. Any value above 0 is horizontal page overflow. |
| **lc** | Leaf text nodes whose computed colour vs. resolved background is **below 4.5:1** (WCAG relative-luminance formula). Disabled controls and gradient-backed text are excluded — the first is exempt under WCAG 1.4.3, the second cannot be measured against a single colour. |
| **oe** | Elements whose `scrollWidth` exceeds their `clientWidth` **and** extend past the viewport, without their own `overflow-x: auto`. |
| **cl** | Labels clipped by `text-overflow: ellipsis`. |
| **st** | Interactive elements shorter than 24px. |

---

## A. Phone widths — every launch route, both languages

Preset **Balanced**, colour mode **Light**.

| Width | Route | Lang | ov | lc | oe | cl | st |
|---|---|---|---|---|---|---|---|
| 320 | Today `?screen=daily` | EN | 0 | 0 | 0 | 0 | 0 |
| 320 | Today | HI | 0 | 0 | 0 | 0 | 0 |
| 320 | Ask/Prashna `?screen=prashna` | EN | 0 | 0 | 0 | 0 | 0 |
| 320 | Ask/Prashna | HI | 0 | 0 | 0 | 0 | 0 |
| 320 | Jyotish `?screen=chart` | EN | 0 | 0 | 0 | 0 | 0 |
| 320 | Jyotish | HI | 0 | 0 | 0 | 0 | 0 |
| 320 | Festival detail `/festival/purnima` | EN | 0 | 0 | 0 | 0 | 0 |
| 320 | Festival detail | HI | 0 | 0 | 0 | 0 | 0 |
| 320 | Muhurat `?screen=daily&muhurat=wedding` | HI | 0 | 0 | 0 | 0 | 0 |
| 320 | Personalize `?screen=personalize` | EN | 0 | 0 | 0 | 0 | 3 † |
| 320 | Personalize | HI | 0 | 0 | 0 | 0 | 3 † |
| 390 | Today | EN | 0 | 0 | 0 | 0 | 0 |
| 390 | Today | HI | 0 | 0 | 0 | 0 | 0 |
| 390 | Ask/Prashna | EN | 0 | 0 | 0 | 0 | 0 |
| 390 | Ask/Prashna | HI | 0 | 0 | 0 | 0 | 0 |
| 390 | Jyotish | EN | 0 | 0 | 0 | 0 | 0 |
| 390 | Jyotish | HI | 0 | 0 | 0 | 0 | 0 |
| 390 | Festival detail | EN | 0 | 0 | 0 | 0 | 0 |
| 390 | Festival detail | HI | 0 | 0 | 0 | 0 | 0 |
| 390 | Muhurat | HI | 0 | 0 | 0 | 0 | 0 |
| 390 | Personalize | EN | 0 | 0 | 0 | 0 | 3 † |
| 390 | Personalize | HI | 0 | 0 | 0 | 0 | 3 † |

† **Not a defect, and stated rather than hidden.** The three are the privacy checkboxes,
which are 21px tall — but each is wrapped in a `<label>` measuring **125–130px**, and the
whole label is the hit target. The comfort sliders beside them, which genuinely *were*
21px before this pass, now measure **46px**.

## B. Tablet and desktop

| Width | Route | Lang | ov | lc | oe | cl | st |
|---|---|---|---|---|---|---|---|
| 768 | Today | HI | 0 | 0 | 0 | 0 | 0 |
| 768 | Jyotish | EN | 0 | 0 | 0 | 0 | 0 |
| 1280 | Today | HI | 0 | 0 | 0 | 0 | 0 |
| 1280 | Jyotish | EN | 0 | 0 | 0 | 0 | 0 |

## C. Dark mode

Today, 375px, `colorMode: dark`, measured over every leaf text node on the route:

| Stage | Nodes below 4.5:1 |
|---|---|
| Before this pass (baseline `9376836`) | **42** — and the page was in fact still cream: the screens hard-coded a light palette, so "dark mode" only repainted the top bar. |
| After the palette migration | 18 |
| After the UA form-control fix | 7 |
| After the pre-paint preference load | **2**, both false positives — one is a `disabled` button (WCAG-exempt) and one is dark ink on the gold gradient "Ask" button, ~8.7:1, which the scanner cannot read through a gradient. |

Verified live in the browser: `body` background `rgb(24,21,28)`, ink `rgb(255,248,238)`,
inputs and selects on the dark surface, `data-color-mode="dark"` persisted through a reload.

## D. Comfort presets on a content-heavy route

Today at 390px, **Detailed** vs **Simple & Large**, comparing computed `font-size` for every
text-bearing element:

| Metric | Value |
|---|---|
| Text nodes compared | 307 |
| Nodes that scale between the two extremes | **275 (95%)** |
| Nodes unchanged | 16 — all `<option>` elements, whose size the browser fixes in the native dropdown; the `<select>` itself scales |
| SVG nodes excluded | 16 — viewBox user units, mathematically required |
| Root font-size | 16px → 18px |

For comparison, the independent bug bash measured **40% of text not scaling at all** on the
production baseline. No horizontal overflow at 320px in either preset, in either language.

## E. Guidance depth actually changes content

`document.body.innerText.length` at each depth — the exact metric the bug bash used to
prove the setting was inert:

| Route | Guided | Balanced | Expert | Warnings intact at all three |
|---|---|---|---|---|
| Today (390, EN) | 5252 | 4958 | 5099 | ✓ Rahu Kalam present at every depth |
| Festival `/festival/sankashti` | 7990 | 7860 | 7942 | ✓ |
| Ask/Prashna | 1180 | — | 1032 | ✓ |

On the baseline these were byte-identical (4909 / 4909 / 4909 on Today). Balanced is
deliberately unchanged from what shipped, so enabling the ladder cannot remove content from
the default preference.

## F. Behavioural checks

| Check | Result |
|---|---|
| Escape closes the "Set it up for a parent" modal | **PASS** — dialog count 1 → 0; the 7 `inert` siblings are restored on close |
| An open modal removes the rest of the app from the accessibility tree | **PASS** — 7 siblings marked `inert` + `aria-hidden` while open, all cleaned up after |
| Escape returns focus to a real target, never `<body>` | **PASS** |
| Document title on the Personalize route | **PASS** — "Personalize Ganak — comfort, place and privacy" (HI: "आपका गणक — रूप, आराम और गोपनीयता"), restored on leaving |
| Dark-mode preference survives a reload | **PASS** — written to the approved store, applied before first paint |
| Comfort slider touch target | **PASS** — 46px (was 21px) |
| Hindi Today untranslated leaks | **PASS** — the only Latin strings left are the intentional bilingual section headers, the "English" language toggle and the proper noun "ISKCON" |
| Muhurat Listen | **PASS** — 2 read-aloud controls on Today; bilingual; speaks verdict → recommended time → avoid warnings |
| Unknown `/festival/<slug>` | **PASS** — bilingual not-found panel with a route back, instead of the silent home screen |
| Unmatched city search | **PASS** — bilingual "no place found" message in a `role="status"` region |

## G. Not covered here, and why

- **Real screen-reader output** (VoiceOver / TalkBack / NVDA). The roles, names, `aria-*`
  state and focus order are verified programmatically; how a specific screen reader voices
  them is not, and needs a human on a real device.
- **Audible speech.** There is no audio sink in this environment, so read-aloud is verified
  by utterance text, state transitions, cross-button coordination and error handling — not
  by listening.
- **Physical touch.** Target sizes are measured geometrically, not tapped with a thumb.
- **Programmatic scrolling.** The harness browser freezes `scrollIntoView`/`scrollTo`
  (a known limitation recorded in earlier rounds), so reveal-on-open behaviour is verified
  by measured geometry rather than by watching the page move.
