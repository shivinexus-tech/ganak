# Ganak Website Redesign — Feature & Journey Preservation Contract

**Status:** required design-to-code gate — approved visual direction, no product-code implementation yet
**Owner decision recorded:** 2026-08-04
**Scope:** public Ganak **website**, not the future native/mobile-app visual track.

## 1. Purpose

The approved desktop visual direction improves the website's hierarchy, readability and
devotional warmth. It must **not** become a visual rewrite that loses accurate Panchang
behaviour, working calendar repairs, Muhurat flows, permanent guide pages, calculator
routes, preferences or bilingual support.

This contract is the implementation gate: a feature can move, be simplified or be given a
better entry point only when its replacement is named here and passes the same journey.
Nothing is deleted merely because it is absent from a first-screen mockup.

### Approved visual composition, expressed as component rules

- The desktop reference is a visual master, **not a screenshot to ship**. Build original
  components and owned/licensed art; never crop or embed reference screenshots.
- Header plus floral place/date/sunrise/sunset ribbon; answer-first festival/Panchang body;
  dense Panchang table; and floral footer are presentation regions only.
- Real Ganak data replaces all illustrative copy, dates, images and timings. Do not include
  a competitor attribution or invented tool, result or button.
- A new visible control must either execute a real mapped action or remain absent. In
  particular, global search, geolocation, profile/account and any reminder action must not
  be shown as working until their corresponding approved feature exists.

## 2. Primary persona and the journey we protect

### Primary persona

**Diaspora household Panchang keeper** — the owner-confirmed primary Panchang user in
`plans/ganak-redesign-requirements.md` §4.1: they need the observance and timings for
their own city, a clear answer before technical detail, English or Hindi, and a trustworthy
route into practical festival guidance.

`AGENTS.md` refers to `plans/ganak-personas.md`; that file is not present in this
worktree. This contract therefore uses the named owner-confirmed persona above rather
than inventing a persona. Restore/locate the catalogue before a broader product spec is
written.

### End-to-end journey, walked against the current code

| Step | Household job | Current implementation evidence | Current state | New website obligation |
|---:|---|---|---|---|
| 1 | Open Ganak from the root or a shared link, in English or Hindi. | `src/kundli-app.tsx:94-114` reads `lang`, `screen`, direct path routes and applies route metadata. | Works. | Keep language, path and metadata; the visual shell cannot force a home reset. |
| 2 | Confirm or change the city used for every daily timing. | `src/kundli-app.tsx:116-118` restores `city`, `lat`, `lon`, `zone`; `DailyScreen.tsx:49-63` consumes shared place state. | Works. | The floral ribbon's Place field remains the single shared source of truth; no decorative duplicate field. |
| 3 | Select a day, return to today, or open the date chooser. | `DailyScreen.tsx:71-103, 225-289` validates `date`, handles previous/next/today and month/year selection. | Works. | The ribbon Date field invokes this same state; URL date and browser Back behaviour remain intact. |
| 4 | Learn what matters today: observance, auspicious time and avoid time. | `DailyScreen.tsx:338-343`; `MuhuratHub.tsx:312-317` computes and narrates Good/Avoid windows. | Data works; old first viewport buries the answer. | Lead with the existing result; do not alter the astronomical calculation, verdict vocabulary or warning visibility. |
| 5 | Open a festival, learn the local date and follow/listen if useful. | `MuhuratHub.tsx:233-246`; `FestivalGuideScreen.tsx:80-83, 215-404`. | Works via rows/direct paths; discovery is weak. | Upcoming Festival points to its canonical guide and keeps city + language. |
| 6 | Check the full month/year calendar or find an observance. | `DailyScreen.tsx:93, 144-152`; `MuhuratHub.tsx:579-582`; `CalendarPage.tsx:13-130`. | Works; it is an internal overlay and easily hidden by the Daily scroll. | The visible Panchang/Calendar entry invokes the existing calendar/search view until a dedicated canonical route replaces it. |
| 7 | Find a good day for a real purpose. | `MuhuratHub.tsx:95-122, 585-850`; `MuhuratActions` is rendered at `MuhuratHub.tsx:850`. | Finder works, but a direct `?muhurat=wedding` begins amid generic Daily content (audit P0). | Muhurat nav must land at the finder context with `muhurat`, `maction`, place, language and range intact. |
| 8 | Return later, use Prashna or Jyotish without losing the shared place/language. | `kundli-app.tsx:98-103, 252-261`; `PrashnaScreen.tsx:622-1008`; `ChartScreen.tsx:46+`. | Calculation flows work; Prashna currently under-exposes its chosen place. | Persistent nav changes destination without state loss; Prashna visibly names its inherited place. |

### Existing inventory before designing anything new

The website already has a precise Panchang engine, local-place state, date picker,
calendar systems, holiday overlays, festival guide routes, search/year calendar,
Muhurat finder and actions, read-aloud, follow preferences, Prashna, Jyotish,
calculator routes and comfort/language preferences. The visual redesign **uses** these;
it is not authority to replace them with static panels.

### Success in user steps

A household keeper can, at 390px and desktop width, open a saved link, see the local
answer, change city/date, open the relevant festival or calendar, begin a Muhurat search,
switch language, and return without a state reset. A Prashna/Jyotish user can reach the
existing specialist journeys from visible navigation without losing language or place.

## 3. Preservation rules — hard requirements

1. **Keep engines and data contracts.** No visual task edits Panchang, festival,
   Muhurat, Prashna or Jyotish calculation logic, ayanamsa conventions or source data.
2. **Keep public links alive.** Existing paths and supported query keys continue to load
   the same job. If a new canonical location is introduced, the old URL redirects or
   resolves to it with all recognised values preserved.
3. **Keep state intentional.** A destination change must retain shared `lang`, city,
   coordinates, zone, selected date and applicable calendar/Muhurat preferences. A
   user action may change state; a visual rerender may not.
4. **No fake interactions.** A search input, profile control, current-location icon,
   reminder, Share, Follow or Listen control only appears if it has its documented
   live capability. The approved visual reference does not grant new features.
5. **One home only after parity.** Calendar, festivals and Muhurat may be de-duplicated
   only after the destination that replaces an old entry passes this contract. Do not
   remove a route or existing reachable action during the first visual implementation.
6. **Accessibility and bilingual parity are release conditions.** EN/HI, keyboard,
   focus, visible state, touch-target and contrast behaviour must be kept or improved.
7. **No hidden privacy change.** The redesign does not add analytics, account/login,
   network calls or new persistence. Preferences stay on the approved adapter and URL
   state remains shareable.

## 4. URL, route and state compatibility matrix

| Current entry | State that must survive | New visual entry/home | Required proof |
|---|---|---|---|
| `/?screen=daily&lang=…` | `lang`, shared place, `date`, `cal`, `hol` | **Today / Panchang** nav; floral Place + Date ribbon | Reload, previous/next day and language toggle retain state. |
| `/?screen=prashna&lang=…` | `lang`, shared place and coordinates | **Prashna** nav | Current place is visible; a calculation uses the same location. |
| `/?screen=chart&lang=…&cstyle=…` | `lang`, `cstyle`, chart/saved-chart behaviour | **Jyotish** nav | North/South/East choice and saved-chart flow still work. |
| `/?muhurat=<category>&maction=…&mfrom=…&mto=…` | purpose, action, date range, shared place/language | **Muhurat** nav and finder hero | Direct link opens the matching finder rather than generic Daily top. |
| `/festival/<slug>?lang=…` | permanent slug, place, language, follow preference | **Festivals** nav + guide pages | Existing, legacy and unknown-slug paths retain their current resolved/not-found behaviour. |
| Calendar and festival search opened from Daily | view type/query, shared place/language | Panchang/Calendar quick access | Year, search and back return to the originating Daily context. |
| `/calculators`, `/calculator/<slug>?lang=…` | calculator slug, language, calculation inputs | Jyotish tools / existing footer link until new menu is built | Catalogue and every calculator remain internally reachable. |
| `/muhurat/medical` | path, shared place/language | Muhurat medical entry only when it is explicitly surfaced | Existing direct route remains unchanged. |

### URL keys that must not be silently dropped

| Key | Meaning / current owner |
|---|---|
| `lang`, `screen` | Shell language and main mode — `kundli-app.tsx:94-99` |
| `city`, `lat`, `lon`, `zone` | Shared geographic context — `kundli-app.tsx:116-118` |
| `date` | Selected Panchang date — `DailyScreen.tsx:71-103` |
| `cal`, `hol` | Calendar convention and holiday overlay — `DailyScreen.tsx:53-63` |
| `muhurat`, `maction`, `mfrom`, `mto` | Muhurat finder intent and range — `MuhuratHub.tsx:95-122` |
| `cstyle` | Jyotish chart presentation choice — `ChartScreen.tsx:63-65` |

### Baseline route exception — must be resolved by the redesign, not hidden

On 2026-08-04, `node validation/route-reachability.cjs` found one current,
pre-existing failure: **`/muhurat/medical` is rendered by
`MedicalMuhuratScreen.tsx` but no internal Ganak link reaches it.** It is a real
direct URL, not a candidate for deletion. The first navigation implementation must
either give it an explicit, truthful Muhurat entry or retain an internally reachable
medical-Muhurat link in an appropriate existing destination. The route gate must be
green before this redesign can claim complete feature preservation.

## 5. Feature-to-new-design map

| Existing capability | Approved visual location | Non-negotiable behaviour | Test owner must run |
|---|---|---|---|
| Product identity, language and all real destinations | Header navigation | Header has real routes; it never becomes a static mockup. | Every destination opens and Back works. |
| Shared Place + date stepping/picking + Today | Floral context ribbon | One place source, valid date input, current selected date shown, no reset. | Change city/date → visit each primary destination → return/reload. |
| Sunrise/sunset and local-time context | Ribbon / timing context | Values are calculated for selected city/date; hide rather than fake if unavailable. | Compare with existing Daily values for same input. |
| Today answer + Good/Avoid | Main answer + dark timing panel | Explicit Good/Avoid text and icon; warnings remain visible at every comfort depth. | Compare existing Daily same date/place; EN/HI; colour-blind-safe labels. |
| Full Panchang data | Dense lower Panchang table | Same local-day values, timing end labels and detail access; no information invented from a visual. | Existing Daily data contract and relevant engine gates. |
| Fasts/festivals and upcoming rows | Festival rail + Festivals destination | Rows route to canonical guide; guides retain place/language and direct URLs. | Open row, shared URL, Hindi switch, legacy slug. |
| Festival guide meaning, vidhi, aarti, local timing, Follow, Listen | Festival detail — not the Today card | Follow stays consent/local-first; Listen uses existing TTS; content is never reduced to a teaser. | Guide route EN/HI, follow toggle, TTS state, local timing. |
| Calendar, year view and festival search | Panchang/Calendar quick access | Existing views remain reachable even while a future dedicated route is planned. | Open year + search; back; no state loss. |
| Calendar systems and holiday overlays | Personalize/settings or collapsed Daily preference block | No calendar convention/holiday capability is deleted; changing naming never changes timing. | Switch each supported convention + holiday mode, inspect date and time invariant. |
| Muhurat finder + ceremony/purchase context | Dedicated Muhurat destination | URL category/action/range hydrate the finder and actions (save/share/calendar) continue. | Direct shared links; results; actions; changed city/date. |
| Hora, season clock, daily windows, planetary events | Muhurat / Panchang detail, not silently discarded | Every current result gains a mapped detail entry before removal from Daily. | Link inventory and existing route-reachability regression. |
| Prashna methods, topics, result/chart | Prashna destination | No birth data needed; inherited place is visible; answer/chart tier behaviour preserved. | Both methods, new question clears stale result, EN/HI, shared place. |
| Jyotish cast, panels, saved charts, matching and PDF | Jyotish destination | No saved chart, chart-style or expert tool is lost behind new navigation. | Cast, saved chart, matching, print/PDF, each panel and Hindi. |
| Calculator catalogue + direct calculators | Jyotish tools and footer until permanent menu exists | No current calculator becomes orphaned. | Catalogue-to-every-calculator and direct URL matrix. |
| Comfort, appearance, language, privacy and data controls | Personalize access point | Approved storage adapter only; preferences survive and can be reviewed/cleared. | Preset, colour mode, depth, language, clear preferences. |
| Feedback / analytics boundary | Existing feedback surface only | No provider/network change bundled into UI redesign. | Network/privacy regression independently owned by rows #38–39. |

## 6. Known weaknesses the redesign may fix — only with a mapped replacement

| Current problem | Allowed improvement | Must not happen |
|---|---|---|
| Daily hides the answer beneath header/setup controls. | Put local answer and timing card first. | Lose date/place/calendar controls or make them decorative. |
| Festivals/Muhurat are hard to discover in three-mode navigation. | Add real visible web navigation. | Remove permanent guide/deep links or create a dead nav label. |
| `?muhurat=wedding` does not focus the finder. | Route/render the finder context directly. | Drop `muhurat`/`maction` state or duplicate finder logic. |
| Prashna does not visibly identify its selected place. | Surface the shared place in the screen context. | Add a second unsynchronised location model. |
| Calendar/search are buried. | Give them a mapped Panchang/Calendar entry. | Delete the repaired calendar because it is not in the first desktop screen. |
| Today repeats major modules in an unprioritised scroll. | Link to mapped destinations progressively. | Remove a module before its replacement is found from within the app. |

## 7. Implementation sequence and gates

### Phase A — baseline, before visual code

1. Freeze this matrix and attach a route inventory to every visual pull request.
2. Record browser evidence for the protected journeys at 390px and 1280px, EN and HI.
3. Capture same-input Panchang/Muhurat fixtures for selected places and dates; visual
   work must render these values, not copied mockup numbers.
4. Mark every visual element as **mapped**, **not yet real (omit)** or **future
   feature (do not imply it works)**.

### Phase B — build non-destructively

1. Build the new shell/ribbon/answer/table as presentation components around current
   props and engines. Do not rewrite engines, URL helpers or the storage adapter.
2. Wire each top-nav/quick-access item one by one and prove it with its old path.
3. Keep a transitional internal path to every feature while its new entry gains test
   coverage. Deletion is a later, separately reviewed cleanup.
4. Use original decorative assets or CSS/SVG motifs; never ship a screenshot or a
   generated mockup as the interface.

### Phase C — parity verification before owner preview

| Gate | Required result |
|---|---|
| Route + state | All rows in §4 load; recognised query keys survive navigation/reload/back. |
| Feature reachability | Every §5 feature has at least one internal entry point; `route-reachability` stays green. |
| Calculation parity | No engine/input change; relevant Panchang, Muhurat and Prashna gates pass unchanged. |
| Language | English and Hindi labels, selected values and route metadata follow the toggle. |
| Responsive/accessibility | 320, 390, 768 and 1280px; light/dark and comfort presets; no overflow, clipped controls or colour-only status. |
| Interaction | Keyboard focus, date chooser, calendar back, festival link, Muhurat direct link, Follow/Listen, chart save/print are exercised in-browser. |
| Privacy | No new analytics/network/storage calls; telemetry/privacy task is independently verified. |

### Release condition

The owner sees a functional preview using real Ganak values and accepts it. Only then may
the implementation be merged and a Cloudflare preview/live deployment be considered. A
visual approval does not waive the compatibility gates above.

## 8. Handoff checklist for every redesign slice

- [ ] Scope names its exact routes, source files and no-touch engine/data boundaries.
- [ ] Every moved control has a row in §5 and a reachable replacement.
- [ ] The slice preserves all applicable URL keys from §4.
- [ ] The implementation uses real current data and a truthfully-labelled UI.
- [ ] EN/HI, keyboard, comfort, desktop and phone evidence is attached.
- [ ] Relevant calculation/route/accessibility gates pass; no gate is weakened.
- [ ] Legacy presentation is removed only after the replacement proves parity.
- [ ] Owner approves the working preview before live deployment.

## 9. Explicit exclusions

- This contract does not approve new global search, accounts/login, reminders,
  analytics, provider setup, native packaging, payments or an app-only IA.
- It does not change the calculation source, religious content, DPDP/GDPR posture,
  data storage rules or owner-gated interpretation release.
- It is not a promise that every current first-screen panel stays on Today. It is a
  promise that every **working job** remains reachable and state-safe.

## 10. Screen-level decision register — required before a Figma screen can become build scope

Sections 2–8 protect journeys and route/state behaviour. This register is the practical
last check: it records the product decision for **every visible control, row or apparent
control** on a particular visual screen. It prevents an illustrative label in a reference
from silently becoming a Ganak feature.

### 10.1 Allowed decision states

| State | Meaning | May appear as a working Figma / website control? |
|---|---|---|
| **Preserve** | Existing Ganak capability; same job and a named current route/action. | Yes, once the target and state proof are recorded. |
| **Move** | Existing capability is relocated; its replacement remains reachable. | Yes, once the old and new entry are both mapped. |
| **Improve** | Existing capability gets clearer copy/presentation but retains the same calculation, data and user job. | Yes, once its behaviour and acceptance proof are recorded. |
| **New — owner-approved** | A genuinely new feature explicitly approved by the owner. | Only after its backlog/implementation owner and privacy implications are recorded. |
| **Deferred — omit** | Useful but not yet approved or not yet implemented. | No. It must be absent, not disabled-looking or decorative-clickable. |
| **Remove** | Invented, duplicate, misleading or deliberately retired. | No. It must not appear in a buildable screen. |
| **Decorative / data-only** | Visual treatment or calculated display with no independent action. | Yes, but it must not look like a button or input. |

**Hard gate:** a buildable screen may contain only `Preserve`, `Move`, `Improve`,
`New — owner-approved`, or clearly non-interactive `Decorative / data-only` rows. A
`Deferred — omit` or `Remove` row is absent from the working screen. A control with a blank
destination, state-preservation rule or acceptance proof fails this contract.

### 10.2 Today — Festival Day, desktop website

**Visual source:** approved desktop Today composition, used only as visual direction. It
does not grant functionality. This register governs the editable Figma reconstruction and
website implementation, not a reference-backed visual image.

| Screen element | Decision | Real target / behaviour | State that must survive | Acceptance proof |
|---|---|---|---|---|
| Ganak wordmark | **Move** | Root Today entry; not a separate account/profile action. | `lang`, place, date, calendar preferences. | Click from each primary screen; Back behaves normally. |
| Today / Festivals / Muhurat / Prashna / Jyotish navigation | **Move** | Existing mapped destinations in §4. | Shared `lang`, place, coordinates, zone; specialist route state where applicable. | Each destination opens; reload and Back preserve the required state. |
| Language selector | **Preserve** | Existing EN/HI application toggle. | Current route, selected date, place and meaningful route metadata. | Switch EN↔HI on Today, festival, Muhurat, Prashna and Jyotish. |
| Personalize access | **Move** | Existing Personalize / comfort, language, privacy and data controls—not a fake account menu. | Approved local-first preferences and current route context. | Open, change/review/clear a preference; return without a reset. |
| Place field | **Move** | The single existing shared place input and selector. | `city`, `lat`, `lon`, `zone`, `lang`, selected date. | Change city → visit every primary destination → return/reload. |
| Current-location/crosshair icon | **Deferred — omit** | No visual geolocation control until a truthful permissioned capability is explicitly approved and built. | N/A. | Absent from the editable screen and code until approved. |
| Date field and Today action | **Move** | Existing validated date picker, stepping and explicit Today reset. | `date`, place, `lang`, `cal`, `hol`; browser history. | Typed/picked date, Today, reload, Back/Forward and EN/HI parity. |
| Sunrise / sunset ribbon values | **Decorative / data-only** | Calculated local values for the chosen place/date; hide if unavailable. | Place, zone and date. | Compare with current Daily result for the same inputs. |
| Festival headline, description and “Read significance” | **Improve** | Canonical festival guide for the displayed observance; content stays in the guide, not an invented Today detail page. | Festival slug, place and `lang`. | Open current guide; test local timing and Hindi switch. |
| Festival guide links such as Vidhi / Aarti | **Move** | Existing canonical guide sections where that observance supplies them. | Festival slug, place and `lang`. | Open relevant guide section; Follow/Listen remain truthful there. |
| Good / Avoid timing panel | **Improve** | Existing local Panchang/Muhurat results; labels and icon+text remain colour-blind-safe. | Place, zone, date and `lang`. | Compare values and warning wording against current Daily/Muhurat for the same inputs. |
| “View all” in the timing panel | **Deferred — omit** | No new timing-details destination is implied until its exact existing destination and URL behaviour are decided. | N/A. | Absent until mapped. |
| Upcoming festival rows | **Move** | Existing canonical festival-guide routes. | Festival slug, place and `lang`. | Every visible row opens its guide, including Hindi/deep-link behaviour. |
| “View calendar” beside upcoming festivals | **Move** | Existing calendar / festival-search view. | Place, date, language, calendar and holiday choices; Back destination. | Year/search/back flows pass. |
| Panchang table | **Improve** | Existing Panchang data in a dense, readable table; values are not copied from a mockup. | Place, zone, date, calendar system and `lang`. | Compare all displayed fields with current Daily result and relevant engine gates. |
| “Panchang PDF” | **Remove** | It is not a current Ganak capability and has no approved owner decision. | N/A. | Not present in any editable Figma screen or website build. |
| “Sunrise & Sunset” quick-access tile | **Remove** | Duplicates the calculated ribbon already on the same screen; it adds no distinct user job. | N/A. | Not present as an apparent action. |
| Panchang Calendar quick access | **Move** | Existing calendar/year/search view. | Place, date, `lang`, `cal`, `hol`, and Back destination. | Open calendar, search/year view and return without state loss. |
| Today’s Muhurat quick access | **Move** | Existing local daily-timings/Muhurat context. | Place, zone, date and `lang`. | Same timing values as the panel; no duplicate calculation. |
| Muhurat Finder quick access | **Move** | Existing finder, including purpose/action/range. | `muhurat`, `maction`, `mfrom`, `mto`, place and `lang`. | Direct and clicked paths hydrate the same finder context. |
| Prashna quick access | **Move** | Existing Prashna route. | Place, coordinates and `lang`. | Selected place is visible; both methods still work. |
| Jyotish quick access | **Move** | Existing Jyotish route and tool catalogue. | `cstyle`, saved-chart behaviour and `lang`. | Cast, saved charts, matching, calculators and print/PDF remain reachable. |
| Festival Calendar quick access | **Move** | Existing calendar / festival-search view, with a festival-oriented entry treatment only. | Place, date, language, calendar and holiday choices. | Festival discovery and Back flow pass. |
| Follow / Listen controls on the Today card | **Deferred — omit** | Existing Follow and Hindi read-aloud remain on contextual Festival Guide content until a separate Today behaviour is explicitly specified. | Consent/local-first follow preference; selected language. | No duplicate or fake Today control. |
| Reminder / Save / Share | **Deferred — omit** | Backlog #37; it can appear only after a recipient, calendar/export behaviour and consent/data rules are implemented. | Explicit user choice; no sensitive data leakage. | #37 acceptance criteria and live user action pass. |

### 10.3 Working procedure for every later screen

1. Start from the current-route inventory in §4 and capability map in §5, not from a
   mockup or component library.
2. List every item that looks actionable, including icons, labels, cards, rows and
   editable-looking fields.
3. Give each item one state from §10.1; record its real target, state to preserve and
   acceptance proof. A missing answer means `Deferred — omit`.
4. Build only the allowed rows into the editable Figma screen. Put new features in a
   clearly labelled future-flow board, never in the working screen.
5. Before code, compare the approved Figma screen to this register. Before deployment,
   exercise the stated acceptance proofs against the current and redesigned journeys.

This is deliberately a **single appendix to the preservation contract**, not a second
parallel migration plan. It turns the contract's “no fake interaction” rule into a
screen-by-screen stop check.
