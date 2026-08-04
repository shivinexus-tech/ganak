# Navigation everywhere + calculator / medical-muhurat placement — design

**Status:** design approved by owner 2026-08-03 — spec for review before an implementation plan
**Author:** Claude, 2026-08-03
**Branch:** to be cut from `origin/main`
**Backlog:** `P0-UTILITY-CALCULATORS` (reachability), `P0-MUHURAT-FULL-PARITY` (medical placement),
targeted slice of the parked `EPIC-IA`
**Root cause this closes:** `plans/ganak-gate-decay-rootcause.md` § *the product between the files*

---

## 1. Problem

Three route families render without Ganak's navigation, so a visitor who lands on one is
trapped:

| Route | Can you get in? | Can you get back? |
|---|---|---|
| `/calculators` (14 calculators) | footer link (added 2026-08-02) | ❌ **no** |
| `/muhurat/medical` | ❌ no | ❌ **no** |
| `/festival/…` | yes (many links) | ✅ yes (`homeHref`) |

`src/kundli-app.tsx:210` deliberately suppresses the Daily/Prashna/Jyotish tab row on all
three. The owner's verdict on the footer link — *"I don't feel it makes sense design wise"* —
is correct: it satisfied a gate metric (reachability) rather than a user need (navigation).

**The reframe that drives this design.** The calculators carry permanent URLs, canonical tags
and share metadata: most of their traffic arrives from search or a shared link, never touching
the home page. The expensive defect is therefore not the missing entry link but the **missing
exit** — an acquisition surface that leaks every visitor it attracts. Owner confirmed the
calculators serve **both** acquisition and existing users, so both directions need real design.

## 2. Scope

**In:**
1. Ganak's navigation renders on every screen, including path routes.
2. Nav tabs actually navigate from a path route (see §4.1 — this is the load-bearing part).
3. The 14 calculators get a home inside the **Jyotish** section.
4. Each calculator result offers an onward step into the full chart.
5. Medical Muhurat is linked from the **Muhurat** section.
6. The 2026-08-02 footer link is removed — **after** 3–5 ship, never before.

**Out:**
- The full EPIC-IA nav redesign. This is a targeted slice; do not restructure the three
  primary journeys, rename tabs, or re-order the Daily screen.
- Any engine, astronomy or calculation change. Nothing in `src/engine/**` is touched.
- A fourth top-level tab — ruled out by measurement, §3.

## 3. Decision: no fourth tab (settled by measurement, not taste)

Measured on production at 320 px: the three tabs occupy **275 px**, leaving **45 px** of
headroom. Every candidate label exceeds it:

| Label | Width | Fits in 45 px? |
|---|---|---|
| "Calculators" | 127 px | no |
| "Charts" | 93 px | no |
| "Tools" | 83 px | no |
| "कैलकुलेटर" | 110 px | no |

Any fourth tab wraps the nav to two lines on a small phone, which reads as broken and
conflicts with the standing elder-friendly requirement ("few clear destinations"). The
calculators therefore live **inside Jyotish**, whose subject matter they share (every one
takes birth details and answers a chart question) and which is the zone the owner intends to
monetise.

## 4. Design

### 4.1 Nav tabs must navigate by PATH, not by state — the critical constraint

**This is the part that silently breaks if implemented naively.**

`chooseMode` calls `urlPrefSet`, which does
`history.replaceState(null, "", "?" + query)`. A URL beginning with `?` **keeps the current
path**. Verified live on production: from `/calculators`, applying `chooseMode("daily")`
produced `/calculators?lang=en&screen=daily` — the path never changed, `utilityFromPath` still
matched, and the calculator catalogue stayed on screen.

So **un-hiding the tab row without changing its behaviour would ship visibly broken tabs** —
the tab would highlight while the page ignored it. That is worse than today's dead end.

**Required behaviour:** when the app is on a path route (`/calculators`, `/calculator/…`,
`/muhurat/medical`, `/festival/…`), each nav tab must perform a real navigation to the root
path carrying the mode, e.g. `/?screen=daily&lang=hi&city=…&lat=…&lon=…&zone=…`. On the root
path (`/`), tabs keep today's cheap `replaceState` behaviour — no full page load, no
regression to the existing journey.

Reuse the pattern `FestivalGuideScreen.tsx:238` already establishes:
`const homeHref = \`/?lang=${L}&screen=daily\``.

### 4.2 Calculators inside Jyotish

A section registered in `JYOTISH_GROUPS` (`src/components/JyotishPanelNav.tsx:5`) so it
appears in the Jyotish panel navigation like every other panel, titled bilingually
("Quick answers · one question, one result" / "त्वरित उत्तर · एक प्रश्न, एक परिणाम"), listing
the 14 calculators as links to their existing `/calculator/<slug>` routes.

**Placement within Jyotish:** below the chart form and above the technical panels. The birth
chart remains the first thing in its own section; the calculators are a shortcut, not a
replacement. The owner has asked to see this rendered before it ships.

### 4.3 Onward step from a calculator

Each calculator result ends with a bilingual link into the full chart —
"See this in your full chart →" / "इसे अपनी पूर्ण कुण्डली में देखें →" — pointing at
`/?screen=chart&lang=…` with any place parameters preserved. This is the acquisition
conversion: today the visitor gets an answer and leaves.

### 4.4 Medical Muhurat in the Muhurat section

A link from the Muhurat area (where someone already thinking about timing is looking), not the
footer — a health-adjacent tool should not sit beside a privacy notice. Copy must carry the
page's own framing ("Timing for a planned procedure"), never implying medical advice.

### 4.5 Footer link removed

Delete the 2026-08-02 footer link **only after** 4.2 and 4.4 are live, so
`route-reachability` never regresses to orphan in between.

## 5. Edge cases

Each of these must be handled explicitly; several are the difference between this working and
this shipping broken.

| # | Edge case | Required behaviour |
|---|---|---|
| E1 | **Nav tab clicked on a path route** (§4.1) | Real path navigation to `/`. Verified broken today; the single highest-risk item. |
| E2 | **Language on navigation** | `lang` survives every hop. From `/calculators?lang=hi`, tapping Daily lands on Hindi Daily. |
| E3 | **Selected city on navigation** | `city`, `lat`, `lon`, `zone` survive the hop, or the user silently loses their place and Daily reverts to New Delhi. |
| E4 | **Browser Back** | After tab-navigating away from a calculator, Back returns to the calculator with its language and inputs, not to a blank home. |
| E5 | **Festival pages already have a way home** (`homeHref`) | Do not render two competing "home" affordances. Either reuse the shared nav and drop the bespoke link, or keep the link and ensure it is visually distinct — decide once, apply to all festival routes. |
| E6 | **Medical safety wall must stay first** | `validation/medical-muhurat.cjs` asserts `{bi(MEDICAL_SAFETY)}` appears before `{bi(MEDICAL_INTRO)}` **in the screen source**. Shell nav renders above the screen and does not affect that assertion — but the safety block must remain the first thing *inside* the page. Re-run that gate. |
| E7 | **Calculator "not found"** (`utility.kind === "notfound"`) | Still renders the not-found message with nav present and canonical `/calculators`; must not 404 into a nav-less shell. |
| E8 | **Stale `screen=` param on a path route** | `/calculators?screen=daily` currently renders calculators while the query claims Daily. After E1 this combination should stop being produced; if it is reached via an old shared link, the path wins and the stale param must not highlight the wrong tab. |
| E9 | **Unknown festival path** (`unknownFestivalPath`) | The existing "that festival page could not be found" alert keeps working, now with nav so the user can leave. |
| E10 | **320 px nav** | Three tabs + no fourth (§3). Confirm no wrap and no horizontal overflow at 320 px in EN and HI; Hindi labels are wider. |
| E11 | **Print** | `nav, input, select, textarea, footer { display: none }` already hides nav in print. Ensure the added nav is inside a `nav`/`.no-print` container so printed festival and calculator pages stay clean. |
| E12 | **Accessibility / comfort** | Tabs keep `min-height: T.ctrlH` (42 px), `className="comfort-focus"`, `aria-current="page"` on the active tab, and must scale with the Simple & Large preset without overflowing. |
| E13 | **Dark mode** | The nav on the new routes uses semantic tokens only. No raw hex — `design-system-primitives` fails the build otherwise, and that gate was the repo's standing red. |
| E14 | **SEO / canonical unchanged** | Adding nav must not alter `canonical`, `og:*` or titles for any calculator, festival or medical route. Re-run `page-context-header`. |
| E15 | **Jyotish panel registry** | The new section must register in `JYOTISH_GROUPS` and satisfy `validation/jyotish-panel-exposure.cjs` (group/destination counts and Hindi markers), not be bolted on outside the nav model. |
| E16 | **Reachability after the footer link is removed** | `route-reachability` must be green for `/calculators` (via Jyotish) and `/muhurat/medical` (via Muhurat) **before** §4.5 deletes the footer link. |
| E17 | **Concurrent-agent conflict** | `kundli-app.tsx` is integration-owned and `ChartScreen.tsx` has reserved sub-sections (`#arudha`, `#chalit`, `#special`). Reserve both in `plans/task-log.md` before editing and stay out of the reserved Chart sections. |

## 6. Testing

**New gate — `validation/route-egress.cjs`** (the mirror of `route-reachability`, and the gap
that let this ship): every path route the shell renders must offer a navigational way back to
the app. Discovered from the shell's `*FromPath` calls like its sibling, so a new route is
covered automatically. Must be proven non-vacuous: deleting the nav from a route makes it fail.

**Extended gate — `route-reachability`**: unchanged mechanism; must report `/calculators` and
`/muhurat/medical` as reachable via their new links.

**Existing gates that must stay green:** `medical-muhurat` (E6), `jyotish-panel-exposure`
(E15), `page-context-header` (E14), `design-system-primitives` (E13), `accessibility-comfort`
(E12), `parse-check`, `prashna-parity` EXACT 198/6, production build.

**Browser matrix:** EN + HI × 320/375 px × light/dark, covering: tab navigation off each of
`/calculators`, `/calculator/rashi`, `/muhurat/medical`, `/festival/diwali`; Back after each;
city and language preserved; no horizontal overflow; zero console errors.

## 7. Sequencing

1. E1 nav-navigates-by-path + nav rendered everywhere (fixes all dead ends).
2. Calculators section in Jyotish (§4.2) + onward step (§4.3).
3. Medical link in the Muhurat section (§4.4).
4. `route-egress` gate + `route-reachability` green.
5. **Only then** remove the footer link (§4.5).

Steps 1 and 4 carry the durable value: they fix the class of bug, not one instance of it.

## 8. Open — owner decisions, surfaced not parked

1. **Where exactly the Quick-answers block sits inside Jyotish.** Spec says below the chart
   form, above the technical panels. The owner asked to see it rendered before it ships.
2. **E5 — festival pages' existing bespoke home link:** keep it alongside the shared nav, or
   drop it in favour of the nav? Needs one decision applied consistently.
3. **Whether the onward step (§4.3) should point at the chart form or at the Jyotish landing.**
   Spec assumes the chart form, since the visitor already supplied birth details.
