# Backlog 46 — independent adversarial bug bash: accessibility / comfort system

**Target:** https://ganakapp.com (production, commit `9376836`)
**Tester:** independent bug-bash agent (no code written, `src/` untouched)
**Method:** Chrome browser pane — `read_page`, `computer` (click/type/key/screenshot), `form_input`,
`resize_window`, `read_console_messages`, `read_network_requests`, `javascript_tool` (measurement only).

```
START:  Sat Aug  1 19:19:57 PDT 2026
END:    Sat Aug  1 19:58:07 PDT 2026
        (38 minutes wall clock, continuous)
```

---

## Session log (roughly in order)

| ~time | What I did |
|---|---|
| 19:20 | Opened production at 390×844. Fresh state: only `ganak:approved-storage:v1` in localStorage. First-run comfort offer appeared. |
| 19:21 | Inspected first-run dialog semantics (`role=dialog`, `aria-modal`, `aria-labelledby`), auto-focus, Tab cycle (4 tabs wraps → trap OK), focus ring, Escape. |
| 19:23 | Overflow probe on Today EN @390 — clean. Baseline computed font sizes + `--scale` / `data-comfort-*` attributes. |
| 19:24–19:32 | Personalize hub: ARIA on presets / segmented control / sliders; `<details>` sections (closed content correctly unfocusable). Switched **Simple & Large / Balanced / Detailed**, measured full font-size histograms on Today and on a festival page for all three. |
| 19:33–19:38 | Read-aloud: hooked `speechSynthesis.speak` for observation. Tested Listen on Today, festival summary, "Listen to the steps", vidhi (HI). Verified second-reader-resets-first, route change stops speech, language change stops speech, Stop works, spam-clicking. |
| 19:38–19:41 | Dark mode: set Dark, swept Today / festival / Prashna / Personalize. Contrast scan (WCAG formula) over every leaf text node. OS-auto + `prefers-color-scheme: dark`. Checked `prefers-reduced-motion` / `prefers-contrast` rules in the stylesheets. |
| 19:41–19:44 | 320×720 sweep, EN + HI: Today, Prashna, Chart, Personalize, festival, `?muhurat=wedding`. Devanagari leak scan on every HI route. |
| 19:44–19:48 | "Set it up for a parent" 3-step flow, EN and HI, incl. keyboard Tab trap / focus ring / Escape / focus return. Follow star on a festival page. |
| 19:48–19:52 | Personalize: every section opened, review-remembered-data panel, analytics consent on/off, network sweep for telemetry, **Clear all preferences** + reload. Home place vs Today city persistence. |
| 19:52–19:55 | Error handling: garbage city text, `/festival/not-a-real-thing`, `?lang=zz&screen=nope&lat=abc&lon=999&zone=Mars/Olympus`. Console on every route, both languages. |
| 19:55–19:58 | Focus-indicator audit (keyboard-modality-correct) on Daily + Jyotish. Guidance-depth root cause (`.expert-only` / `.guided-only`). Eclipse read-aloud date check in EN and HI. |

---

## Findings

| ID | Sev | Title | Route/journey | Lang | Viewport | Reproduction | Observed | Expected | Evidence |
|---|---|---|---|---|---|---|---|---|---|
| B46-01 | **P0** | "Guidance depth" slider does nothing anywhere in the app | Personalize → Appearance & comfort; effect checked on Today, festival, Prashna | EN + HI | all | Set preset Simple & Large (depth `guided`), note page; set Detailed (depth `expert`); compare | `document.body.innerText.length` is **4909 on Today and 7860 on the festival page at guided, balanced *and* expert** — byte-identical; leaf-text-node count identical (266 / 63). The only stylesheet rule keyed on depth is `html[data-depth="guided"] .expert-only, html[data-depth="expert"] .guided-only { display:none !important }`, and `document.querySelectorAll('.expert-only').length === 0` and `.guided-only === 0` on Today, on `/festival/sankashti` and on Prashna | Guided should show more hand-holding / Expert more detail, as the slider's live label ("Guided ↔ Expert") promises | Measured text lengths above; CSS rule dumped from `document.styleSheets`; class counts 0/0 on three routes |
| B46-02 | **P1** | Dark mode does not apply to any content screen — only the top bar and comfort-styled controls turn dark | Personalize → Light & dark → Dark; then Today, festival, Prashna, Jyotish, `?muhurat=…` | EN + HI | 320 & 390 | Personalize → Dark → open Today | `data-color-mode="dark"`, `--bg: #18151C`, `--ink: #FFF8EE`, `body` background `srgb(0.13,0.11,0.12)` — but the screen container div hard-codes `background: rgb(250,245,234); color: rgb(59,49,71)` and covers the full 7235 px page. Screenshot: black strip with "Personalize", black "Listen" pill, everything below is the normal cream light theme. Same on `/festival/sankashti` (`rgb(255,253,247)`, 7225 px tall) and Prashna. Personalize itself *is* correctly dark | Dark mode should repaint the whole app | Computed styles above; two screenshots (Today dark, Prashna dark) both fully cream below the top bar |
| B46-03 | **P1** | Read-aloud states the eclipse is **today** when it is 10 days away | `/festival/surya-grahan` → "🔊 Listen to the steps" / "🔊 विधि सुनें" | EN **and** HI | any | Open `/festival/surya-grahan?lang=en`, press "Listen to the steps" | First utterance is `"A solar grahan is in the sky today."` (HI: `"आज सूर्य ग्रहण है।"`) while the same page displays **Wednesday, 12 August 2026** and Today's list says "Surya Grahan (solar eclipse) — in 10 days". Control: `/festival/amavasya` (also 12 Aug) opens with just `"Amavasya।"`, so this is specific to the eclipse copy | Read-aloud must not assert "today" for a future observance — blind/low-vision users have no visual date to correct it | `speechSynthesis.speak` intercept captured the utterance text verbatim in both languages; page date string `Wednesday, 12 August 2026` |
| B46-04 | **P1** | Third-party analytics beacon fires on every page load with the analytics consent OFF | every route | EN + HI | all | Fresh profile, consent unchecked (`privacy.analytics: false`), load any page, read network | `POST https://ganakapp.com/cdn-cgi/rum?` → 204 on **every** page load, and `<script src="https://static.cloudflareinsights.com/beacon.min.js/v4513226…">` is injected on every page. Turning the in-app consent ON produced **no additional** request — the checkbox has no observable network effect at all | Footer says "anonymous usage events only when consented"; consent must fail closed, i.e. no telemetry request before opt-in | `read_network_requests` shows the RUM POST on 5 consecutive loads with `analytics:false` in localStorage; script list from `document.querySelectorAll('script')` |
| B46-05 | **P1** | "Simple & Large" barely enlarges anything — 40 % of on-screen text does not scale at all | Today (worst), also date picker / festival calendar / hora strip everywhere | EN + HI | 320 & 390 | Personalize → Detailed, measure; → Simple & Large, measure | Root font-size only moves 16 → 17 → 18 px across the three presets. Today body copy: **13.00 px (Detailed) → 13.81 px (Balanced) → 14.63 px (Simple & Large)**; small print 10.50 → 11.16 → 11.81 px; tithi headline 19 → 20.19 → 21.38 px. Font-size histograms of all 266 text nodes show **106 nodes (40 %) identical in both extremes**, including 13 nodes at **9.5 px** (hora timeline hour labels), 32 at 12.5 px (language switcher, every festival date "Sun, 2 Aug"), 12 at 13.5 px (date picker "Sun, 2 Aug 2026", every planetary-event row), 22 at 14 px (every festival name in the calendar), 1 at 46 px (the "Ganak" wordmark), plus the hero subtitle fixed at 14.5 px and the city input fixed at 13.5 px inline | The preset an elderly parent is steered into should enlarge the whole page; 14.6 px body / 9.5 px labels is not "Simple & Large" | Two full font-size histograms (Detailed vs Simple & Large) with per-bucket counts; per-element `getComputedStyle` values quoted above |
| B46-06 | **P1** | Primary Daily / Prashna / Jyotish navigation has no visible focus indicator and no state exposed to assistive tech | every screen (global header) | EN + HI | all | Tab to the Daily/Prashna/Jyotish switcher | The three buttons carry only a `style` attribute — no `aria-current`, no `aria-pressed`, no `role=tab`; selection is background colour only (`rgb(255,255,255)` vs transparent). With `:focus-visible` matching true, computed `outline-style: none`, `outline-width` unused, `box-shadow: none`, `border: 0`, background unchanged → **zero focus indication**. Modality-correct scan: on Jyotish **3 of 31** focusables show no style change on focus (exactly these three); on Daily **4 of 81** (these three + one genuinely `disabled` button). Every other control uses `.comfort-focus` with a 3 px `rgb(138,86,13)` outline and is fine | Focus must be visible (WCAG 2.4.7) and the active screen must be programmatically determinable | Computed styles above; before/after focus snapshot diff over all focusables on two routes |
| B46-07 | **P2** | Secondary copy fails WCAG AA contrast, and OS "increase contrast" does not fix it | every screen (light theme, which is all content screens) | EN + HI | all | Any content route | Muted text `#8C8173` on the cream page `#FAF5EA` = **3.51 : 1** (AA needs 4.5 : 1 for text < 18.66 px). **101 text nodes on Today** use this colour, at 10.5 px (19), 11 px (9), 11.5 px (15), 12–12.5 px (10), 13 px (34), 14–15.4 px (14). Worse cases: "First pick an activity above" `#8C8173` on `#E7DDC6` = **2.83 : 1**; inactive Prashna/Jyotish tab labels on `#F1E9D5` = **3.15 : 1**. The `@media (prefers-contrast: more)` block only sets `--line: currentColor` and thickens the focus ring — it does not touch `--muted` | AA contrast for body copy; `prefers-contrast: more` should raise text contrast | WCAG relative-luminance ratios computed in-page over every leaf text node; 153 of 266 nodes below 4.5 : 1 on Today (some of those sit on gradients and are fine — the 101 muted-on-cream ones are verified plain-background) |
| B46-08 | **P2** | Horizontal page overflow at 320 px caused by the Smarta / ISKCON sampradaya toggle | Today, and `?screen=daily&muhurat=…` | EN **and** HI | **320** | Resize to 320, load `/?lang=hi&screen=daily` | `document.documentElement.scrollWidth` **332** vs `clientWidth` **320** in HI (**325 vs 320** in EN). Offending nodes: `SPAN` "स्मार्तISKCON" left 221 → right 332, and its `BUTTON` "ISKCON" left 266 → right 332. Screenshot capture width came back as 332.5 px, confirming the page itself scrolls sideways | No horizontal scroll at 320 px | scrollWidth/clientWidth numbers + per-element bounding rects, both languages |
| B46-09 | **P2** | Escape does not close the "Set it up for a parent" modal | Personalize → 👪 Set it up for a parent | EN + HI | all | Open the flow, press Escape (tried ×3) | Modal stays open at step 3/3, focus stays inside. Only × or Done closes it. The first-run comfort offer, by contrast, *does* close on Escape — so the behaviour is inconsistent between the two modals | Escape closes any dismissible modal | `document.querySelector('[role=dialog]')` still present after 3 Escape presses; step counter still "3 / 3" |
| B46-10 | **P2** | Text spills out of preset cards and follow-star chips at 320 px | Personalize | EN + HI | **320** | Resize to 320, open Personalize | At the *smallest* preset (Detailed): "Balanced" label box `clientWidth 53` vs `scrollWidth 67`; "Detailed" 53 vs 62; follow chips "Pradosham" 56 vs 80, "Hanuman" 56 vs 70, "Ekadashi" 56 vs 65, "Ganesha" 52 vs 61, "Purnima", "Major festivals". At **Simple & Large** it is far worse: "Balanced" label 38 vs 75 — roughly half the word outside its card. `overflow: visible; white-space: normal` on a single unbreakable word, so the text visibly runs over the neighbouring card rather than being clipped | Labels fit or wrap inside their card at 320 px | Per-element `clientWidth`/`scrollWidth`; dark-mode 320 screenshot shows "Balance"/"Comfortal" running over the card border |
| B46-11 | **P2** | Untranslated English strings inside the Hindi Today screen | `/?lang=hi&screen=daily` | HI | all | Load Hindi Today, scan leaf text nodes with no Devanagari | Genuine leaks (excluding the intentional bilingual pairs like "व्रत एवं पर्व / Fasts & festivals"): the month line **"Ashadha (Amanta) / Shravana (Purnimanta) · Krishna Paksha 18"**, the whole month name in "2 अगस्त 2026 · **Ashadha**", the Hora card's **"Sunday, 2 August 2026"** and **"Chaturthi · Krishna Paksha"** (the main card above is fully Hindi), **"Simha (Leo)"** in the Udaya Lagna line, all 13 ascendant `<option>`s ("Mesha (Aries)" … "Meena (Pisces)"), and the planetary-event rows **"Amavasya — new moon" / "Purnima — full moon" / "Surya enters Simha · Sankranti"** (while sibling rows are "मंगल Mars enters Mithuna") | Hindi UI in Hindi | Leaf-node scan filtered to Latin-only strings, run on `/?lang=hi&screen=daily`; other HI routes (Prashna, Chart, both festival pages) were clean apart from proper nouns |
| B46-12 | **P2** | City search fails silently on an unmatched query | Today place field; same widget in Personalize | EN + HI | all | Type `qqzzxx` into "Change city…" | No suggestion list, no "no place found" message, no spinner, no `role=alert` / `aria-live` anywhere on the page — the field just sits there. Typing `Pune` immediately produces 7 suggestions, so the control is alive; the empty case is simply unhandled | A bilingual "no matching place" message | Screenshot of the field with `qqzzxx` and nothing below; `[role=alert],[role=status],[aria-live]` query returns `[]` |
| B46-13 | **P2** | City autocomplete has no combobox semantics and the input has no accessible name | Today + Personalize place fields | EN + HI | all | Inspect `#daily-place-input` | Attributes are only `id`, `placeholder`, `autocomplete=off`, inline `style` — no `aria-label`, no `<label for>`, no `role=combobox`, no `aria-expanded`, no `aria-controls`; the suggestion popup contains **0** `role=listbox` and **0** `role=option`. A screen-reader user gets an unlabelled text box and is never told suggestions appeared. (The Personalize copy is wrapped in a `<label>`, so that one is named.) The input also hard-codes `font-size: 13.5px` inline, so it ignores the comfort scale | Named input + ARIA 1.2 combobox pattern | Attribute dump above; `document.querySelectorAll('[role=option]').length === 0` while 7 suggestions were on screen |
| B46-14 | **P2** | Hora timeline SVG is an unlabelled graphic | Today → Planetary hours | EN + HI | all | Inspect the `viewBox="0 0 320 240"` SVG | No `role`, no `aria-label`, no `<title>`; it contains 16 `<text>` nodes so a screen reader reads a bare stream of "00:13 01:20 02:27 …" with no context. Those labels are also the 9.5 px non-scaling text from B46-05 | `role="img"` + a summary label, or `aria-hidden` with an adjacent text equivalent | SVG attribute dump |
| B46-15 | **P3** | Nonexistent festival slug silently renders the home page | `/festival/not-a-real-thing?lang=hi` | EN + HI | all | Open the URL | Renders the normal Panchang home screen with HTTP 200 and the bogus URL still in the address bar — no "not found" message in either language (soft-404) | A bilingual not-found state, or a redirect | Page innerText is the standard home screen; `location.href` unchanged |
| B46-16 | **P3** | "Review remembered data" shows raw internal identifiers | Personalize → Privacy & data → Review remembered data | EN **and** HI | all | Expand the panel | Shows `Comfort — simple-large` and `Language — hi` (HI: `आराम — simple-large`, `भाषा — hi`) instead of "Simple & Large" / "हिन्दी" | Human-readable values in a panel whose whole purpose is user-facing transparency | Panel innerText captured in both languages |
| B46-17 | **P3** | A city chosen on Today is silently forgotten on reload | Today place field | EN + HI | all | Pick "Pune, Maharashtra, India" on Today, then open `https://ganakapp.com/` | Place reverts to New Delhi; `preferences.homePlace` stayed `null` — only the URL carried Pune. Setting the *same* city under Personalize → Place & language does persist correctly (sunrise recomputed to 6:12 AM for Pune after reload). Nothing on Today hints that a second, separate step is needed | Either remember it, or say "set this as your home place" | localStorage before/after; URL comparison; sunrise time change |
| B46-18 | **P3** | English read-aloud text carries a Devanagari danda | Today → Listen (EN) | EN | all | Start Listen on Today in English | Utterances are `"For New Delhi, India, today is Chaturthi, Krishna Paksha.।"` and `"The Nakshatra is Purva Bhadrapada.।"` — a full stop followed by `।`. Also on the festival page: `"Sankashti Chaturthi।"` | English speech text should not contain `।` | `speechSynthesis.speak` intercept, verbatim strings |
| B46-19 | **P3** | Document title not updated on the Personalize route | `?screen=personalize` reached from another screen | EN + HI | all | On `?screen=chart`, click Personalize | `document.title` stays "गणक ज्योतिष — वैदिक जन्म कुंडली" while the Personalize hub is showing. Deep-linking straight to `?screen=personalize` also keeps the generic Panchang title | Title reflects the current screen | `document.title` vs `main` heading "आपका गणक" |
| B46-20 | **P3** | Focus is dropped to `<body>` when the first-run offer is dismissed with Escape; and "Personalize" untranslated inside Hindi sentences | first-run offer; HI copy | HI | all | Escape the first-run dialog | `document.activeElement` becomes `BODY`, so a keyboard user restarts from the top of the document. Separately, the Hindi first-run copy reads "बाद में **Personalize** में बदल सकते हैं।" and the Hindi Place section reads "कैलेंडर पद्धति **Today** स्क्रीन पर…" | Move focus to `main` / a skip target; translate or consistently brand the screen names | `activeElement` after Escape; innerText of both strings |

### Things I actively tried to break that held up (no bug)

- **Focus trapping and focus return** in both modals: first-run offer cycles 4 focusables and wraps; parent-setup cycles 3; focus returns exactly to the "👪 Set it up for a parent" trigger after Done. Focus ring is a clear `3px solid rgb(138,86,13)` / `rgb(229,173,85)` on every `.comfort-focus` control.
- **Clear all preferences** — inline confirm ("Clear comfort, place, language and follow preferences? / Yes, clear / Cancel") is exposed via `role=alert`; clearing wipes preset, home place, language, follows and analytics consent, the UI updates instantly, the `?lang=` param is dropped from the URL, and after reload `firstRunComplete:false` brings the first-run offer back. Clean.
- **Preference persistence** — preset, scale, warmth, depth, colour mode, language, follows, speech rate and analytics consent all survive a hard reload.
- **Read-aloud coordination** — starting a second reader resets the first button from "■ Stop" back to "🔊 Listen" and flips `aria-pressed`; SPA route change stops speech; language switch stops speech and relabels the button ("🔊 आज का पंचांग सुनें"); Stop works; 8 rapid clicks left label and engine state consistent. Hindi vidhi uses a `hi-IN` voice.
- **Parent setup flow** — all 3 steps fully translated in Hindi (sample → language → Listen demo → "पूरा हुआ"), writes `preset: simple-large` + `language`.
- **Colour is never the only channel for good/avoid** in the places I checked: the Today "Good & avoid times" card renders `✓Abhijit Muhurat` and `✗Rahu Kalam` / `✗Gulika Kalam`; Choghadiya windows sit under literal "Good windows today" / "Best avoided today" headings; Panchaka reads "Panchaka Rahita ✓". I found **no** colour-only auspicious/avoid instance. (Cosmetic mismatch only: the Personalize legend previews `⚠ Avoid` while Today actually renders `✗`.)
- **Bad query params** `?lang=zz&screen=nope&city=&lat=abc&lon=999&zone=Mars/Olympus` → clean fallback to EN / New Delhi / Daily, no crash, no console noise.
- **Muhurat "no results"** (Wedding, 90 days, inside Devshayana) → a genuinely good explanatory empty state listing why days were skipped.
- **Console** — `read_console_messages` returned **"No console logs"** on every route I visited, in both languages, including the bad-slug and bad-param routes. Zero warnings, zero errors.
- **Collapsed `<details>` sections** in Personalize are correctly unfocusable when closed (verified by `.focus()` failing to take).
- **OS inheritance** — `prefers-color-scheme: dark` with mode Auto correctly yields `data-color-mode="dark"`; `@media (prefers-reduced-motion: reduce)` and `@media (prefers-contrast: more)` rules exist in the shipped CSS.
- **Layout** at 390 px is clean on every route tested (docSW == 390); 320 px is clean on Prashna, Chart, and both festival pages.

---

## Axes covered / not covered

**Covered**

1. EN + HI on Today, Prashna, Chart/Jyotish, Personalize, two festival pages, `?muhurat=wedding`, bad slug, bad params.
2. 320 px and 390 px with `scrollWidth` vs `clientWidth` plus per-element bounding-box overflow on every route above.
3. Keyboard: focus order, focus visibility (modality-correct scan across all focusables on two routes), focus trapping in both modals, Escape, focus return to trigger, `<details>` behaviour.
4. All three presets measured with computed font sizes and full histograms on two content-heavy routes.
5. Light, Dark and OS-auto across Today, festival, Prashna, Jyotish, Personalize, with real contrast ratios.
6. First-run comfort offer triggered from a genuinely cleared state.
7. "Set it up for a parent" — all 3 steps, both languages.
8. Every Personalize section, review-remembered-data, and a full clear + reload.
9. Reload persistence of every preference.
10. Back/Forward, deep links to `?screen=personalize` and to festival pages.
11. Read-aloud on Today, festival summary, festival steps, Hindi vidhi, and the parent-flow demo.
12. Analytics consent on/off with a network sweep.
13. Colour-blind-safe good/avoid across Today, Choghadiya, Panchaka, Hora, Muhurat.
14. Console on every route, both languages.
15. Error handling: garbage place text, nonexistent slug, junk query params, spam-clicking Listen.

**Not covered, and why**

- **Keyboard *activation* (Enter/Space) of controls.** The harness delivers key events with an empty `key` identity (verified: a listener on the focused button logged `keydown::true` / `keyup::true` with `e.key === ''`), so Chrome never synthesises the click. Tab, Shift-Tab and Escape *do* work, so reachability, focus order, focus visibility, trapping and Escape are genuinely tested; "can I press this button with the keyboard" is **not** — I fell back to `element.click()` for those steps. No Enter/Space finding is reported.
- **Actual audible speech.** The pane has no audio sink, so utterance `start`/`end` events fire only intermittently. I verified the queued utterance *text*, `aria-pressed`, and button labels instead. Chunk 2+ of a reading is queued on the previous chunk's `end`, so for B46-03 I could only capture and verify the **first** utterance.
- **Screenshot of the deep-page contrast cases.** The browser pane goes `visibilityState: "hidden"` between calls, which blocks programmatic and wheel scrolling, so I could not capture a screenshot of below-the-fold elements (e.g. the Hora "Ask" area). Those findings are backed by computed styles instead of images. Note: my first contrast pass flagged the Hora "Ask" button at 1.03 : 1 — on inspection it has a `linear-gradient(#E08A22,#C9711A)` background, so that was a scanner artefact and is **not** reported.
- **A real screen reader (VoiceOver/NVDA).** ARIA was audited structurally (roles, names, states, live regions), not aurally.
- **Real touch, pinch-zoom, and 200 % browser zoom.**
- **Prashna beyond topic selection** and the Jyotish chart cast — I checked their overflow, console, focus indicators and unnamed-control counts, but did not complete a full reading journey; they were outside the comfort/a11y feature under test.
- One anomaly I could **not** reproduce and therefore do not report: a single `ref`-based click on the Detailed preset card landed inside the card's rect but did not select it; every later attempt worked.

---

## Severity counts

| Severity | Count | IDs |
|---|---|---|
| P0 | 1 | B46-01 |
| P1 | 5 | B46-02, B46-03, B46-04, B46-05, B46-06 |
| P2 | 8 | B46-07 … B46-14 |
| P3 | 6 | B46-15 … B46-20 |
| **Total** | **20** | |

---

## Disposition — recorded by the primary agent after fixing (2026-08-01)

Every finding below was re-verified in a browser after the fix; the evidence is in
`plans/audits/backlog46-route-language-viewport-matrix.md`.

| ID | Sev | Disposition |
|---|---|---|
| B46-01 | P0 | **FIXED.** `useDepth()` is consumed on all five launch journeys. Guided adds plain-language help and hides technical blocks; Expert adds the calculation basis; Balanced is deliberately byte-identical to what shipped, so the ladder cannot remove content from the default. Measured on Today: 5252 / 4958 / 5099 chars (was 4909 / 4909 / 4909). Rahu Kalam and every other warning render at all three depths. `data-depth="balanced"` is now defined in CSS, which it never was. |
| B46-02 | P1 | **FIXED.** The shared palette `C` and the shell root now resolve to semantic custom properties, so dark mode repaints every screen. Low-contrast nodes on Today in dark: 42 → 2, and both survivors are scanner false positives (a `disabled` control and dark ink on a gold gradient). |
| B46-03 | P1 | **FIXED.** The eclipse verdict no longer asserts "today". It reads "On the day of this solar grahan, …" / "इस सूर्य ग्रहण के दिन, …" (and the lunar equivalent), which is true whether the page shows today or a future date. |
| B46-04 | P1 | **NOT FIXED — owner decision required, outside the repository.** Ganak's own telemetry seam is fail-closed and verified so. The beacon you caught is **Cloudflare Web Analytics**, injected by Cloudflare Pages at the edge; it cannot be removed from source. It is disabled in the Cloudflare dashboard (Web Analytics → the ganakapp.com site → off), or the footer copy has to be changed to disclose it. Escalated to the owner; see the task-log row. |
| B46-05 | P1 | **FIXED.** Type and layout lengths are rem-based, so `--scale` reaches them. 275 of 291 non-SVG text nodes (95%) now scale between Detailed and Simple & Large; the 16 that do not are `<option>` elements whose size the browser fixes inside the native dropdown. |
| B46-06 | P1 | **FIXED.** The switcher carries `.comfort-focus` (the shared 3px token ring, which thickens under OS increased contrast), `aria-pressed` and `aria-current="page"`. The blanket `outline: none` that suppressed focus for every non-`.comfort-focus` button is gone. The unselected label also moved from muted to full ink. |
| B46-07 | P2 | **FIXED.** `#8C8173` is gone; `--muted` is `#70675F`, gate-verified ≥ 4.5:1 against the page and surface. `prefers-contrast: more` now raises `--muted` to full ink instead of only touching borders, and the dark/auto selectors are restated so increased contrast wins there too — previously the dark rule out-specified it. |
| B46-08 | P2 | **FIXED.** 320px HI Today measures scrollWidth 320 = clientWidth 320 (was 332). |
| B46-09 | P2 | **FIXED / verified working.** Escape now closes the parent-setup modal: dialog count 1 → 0, and the seven `inert` siblings are restored. |
| B46-10 | P2 | **FIXED.** Preset-card and follow-chip labels wrap and break inside their box; the cards clip rather than spill. |
| B46-11 | P2 | **FIXED.** Added `src/i18n/panchang-terms.ts` — a presentation-edge transliteration of the engine's tithi, paksha, lunar-month, rashi and nakshatra vocabulary, plus a transit-label localiser. The astronomy still speaks one canonical language internally. Hindi Today now leaks only the intentional bilingual section headers, the "English" toggle and the proper noun "ISKCON". |
| B46-12 | P2 | **FIXED.** An unmatched query shows a bilingual "No place found with that name. Try the nearest larger city." in a `role="status"` region, with the field border turning to `--bad`. |
| B46-13 | P2 | **FIXED.** The place field has an `aria-label`, `role="combobox"`, `aria-expanded`, `aria-controls`, `aria-autocomplete`; the popup is a `role="listbox"` of `role="option"` buttons with 42px targets. Its hard-coded 13.5px is now `var(--font-small)`. |
| B46-14 | P2 | **FIXED.** The hora dial is `role="img"` with a bilingual `aria-label` pointing at the equivalent list below it. |
| B46-15 | P3 | **FIXED.** An unknown `/festival/<slug>` renders a bilingual not-found panel with a link back to Today, instead of silently showing the home screen. |
| B46-16 | P3 | **FIXED.** The transparency panel shows "Simple & Large" / "सरल और बड़ा" and "हिन्दी" instead of `simple-large` and `hi`. |
| B46-17 | P3 | **FIXED.** Choosing a city anywhere — Today included — now records it as the home place, so it survives a plain reload. |
| B46-18 | P3 | **FIXED.** Read-aloud joins with the terminator of the language it is speaking and strips a duplicate, so English no longer carries a danda. |
| B46-19 | P3 | **FIXED.** The Personalize route sets its own bilingual document title and restores the previous one on leaving. |
| B46-20 | P3 | **FIXED.** Closing a modal lands focus on `main` rather than `<body>`. The Hindi copy now brands the screens bilingually ("अपना बनाएँ · Personalize", "आज · Today"). |

**Score: 19 of 20 fixed and re-verified. The one exception (B46-04) is a Cloudflare Pages
dashboard setting, not a code change, and needs the owner.**
