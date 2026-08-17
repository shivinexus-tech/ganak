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

**Site-wide companion gate:**
[`plans/ganak-site-capability-placement-register.md`](ganak-site-capability-placement-register.md)
is authoritative for shared controls, inherited state and backlog rows 1–61. Every screen
register in §10 must first satisfy that site's G1/G2 inheritance matrix. A screen-level
mockup cannot omit a global/contextual capability merely because its own visible-control
table does not mention it.

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
| Calendar systems and holiday overlays | Shared Date & Calendar Context beside Date on applicable routes; defaults also reviewable in Personalize | No calendar convention/holiday capability is deleted; changing naming never changes timing. Personalize is not the only discoverability path. | Switch each supported convention + holiday mode, inspect date and time invariant. |
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
| **Provisional — revisit on dependency** *(added 2026-08-16)* | A real, working capability whose final form depends on work that has not landed yet. It ships in its current form and is **not** treated as approved. Requires a named **revisit trigger**: the backlog rows or destinations whose arrival re-opens it. | Yes. It must be truthful and complete for what exists today, and must degrade to fewer items rather than to a broken or placeholder state. |

**Hard gate:** a buildable screen may contain only `Preserve`, `Move`, `Improve`,
`New — owner-approved`, `Provisional — revisit on dependency`, or clearly non-interactive
`Decorative / data-only` rows. A
`Deferred — omit` or `Remove` row is absent from the working screen. A control with a blank
destination, state-preservation rule or acceptance proof fails this contract.

#### 10.1.1 Canonical screen-fixture integrity gate

A visual screen that mixes independently typed dates, festival names, Panchang values or
timings is **data-invalid even when its visual composition is approved**. Every buildable
Figma screen and every screenshot used for approval must bind to one named immutable
fixture containing, at minimum:

`fixtureId`, selected civil date, place label, latitude, longitude, IANA zone, calendar
convention, language and—when applicable—canonical festival slug. That same fixture must
produce the weekday/day lord, sunrise and sunset, Tithi/Paksha/month, Nakshatra, Yoga,
Karana, good/avoid timings, festival hero, local observance date/parana and chronological
upcoming list. Individual values must not be manually substituted from another day, city
or year.

**Required checks before a frame is shown as approved:**

1. civil date, weekday and day lord agree;
2. festival identity agrees with its deciding Tithi/Paksha/month and local occurrence;
3. all astronomical and Muhurat values use the same place, coordinates, zone and date;
4. every “coming up” item is later than the selected date and uses the intended year;
5. the displayed calendar convention is explicit; and
6. the fixture is compared against Ganak's current route/engine for the same URL inputs.

The first canonical Festival-Day sample is
`today-delhi-2026-07-25-devshayani-v1`: New Delhi, India
(`28.6139`, `77.209`, `Asia/Kolkata`), Saturday 25 July 2026, Amanta calendar,
`/festival/devshayani-ekadashi`. Verified Ganak values are Ekadashi until 11:35 AM,
Shukla Paksha, Ashadha, Jyeshtha until 7:34 AM on 26 July, Brahma Yoga until 9:07 PM,
Vishti Karana until 11:35 AM, sunrise 5:38 AM, sunset 7:16 PM, Abhijit Muhurat
12:00–12:55 PM and Rahu Kalam 9:03–10:45 AM. The previous Figma frame mixed
25 July, 4 August and 2025 data and therefore had no valid approval status until this
fixture replaced every conflicting value.

**Rule 7 — calculated values are generated, never typed (added 2026-08-16).** Every
astronomical value on a frame must be produced by running Ganak's own engine for that
frame's own stated place and date, and pasted without alteration. A value that was typed
by hand, or copied from a sibling frame, fails this gate even when it looks plausible.
The reviewable artefact for a frame pack is therefore the **generator output**, not the
frame: a pack is approvable only when each frame's civil date, sunrise and sunset can be
reproduced by re-running the engine for that frame's inputs.

**Audit finding 2026-08-16 — the Vrat Guide fixture pack fails this rule.** All four
frames (`Fixture A`, `B`, `C`, `D`) display `sunrise 5:52 AM / sunset 7:08 PM`. Running
`sunEvents` from `src/engine/panchang.ts` for New Delhi (`28.6139`, `77.209`, UTC+5:30)
returns:

| Date | Engine sunrise | Engine sunset |
|---|---|---|
| Saturday 25 July 2026 | 5:38 AM | 7:16 PM |
| Sunday 23 August 2026 | 5:54 AM | 6:53 PM |
| Monday 24 August 2026 | 5:55 AM | 6:52 PM |

The 25 July row reproduces the canonical values recorded above, confirming engine and
contract agree. The displayed pair `5:52 AM / 7:08 PM` matches **no** date in the pack —
it was neither calculated nor copied, but invented. `Fixture B` compounds this: its
context ribbon reads *Saturday, 25 July 2026* while its entire content concerns fasting
on 23–24 August. Until regenerated, no frame in that pack holds approval status,
irrespective of the board's label.

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

**Inherited site-wide controls:** the Today frame must instantiate the shared G1 header and
G2 Date & Calendar Context component defined in the site capability register. This places
Calendar System and Holiday Overlay beside the existing Date control without changing the
locked Today answer hierarchy.

**Editable Figma implementation (2026-08-13):** component `206:135` on component page
`204:2` now supplies this ribbon. Today special `104:49` and ordinary `116:49` use
instances `208:49` and `209:135`; their page content and ribbon geometry are unchanged.

### 10.3 Festivals — discovery, calendar and search, desktop website

**Visual source:** the approved Ganak desktop system from §10.2 (wordmark, navigation,
pale blue-white canvas `#F9FCFD`, white reading surfaces `#FFFFFF`, pale-blue utility
and selected surfaces `#ECF4F7`, pale-blue floral context ribbon, navy/gold hierarchy
and floral footer).
This screen is a working discovery surface, not a decorative festival gallery. Rows and
search results use Ganak's live festival registry and permanent guide routes.

#### 10.3.1 Owner-approved adaptive Festivals structure (2026-08-11)

The approved option letters identify product states, not four competing pages. Ganak has
one Festivals destination and one live festival registry. Its presentation adapts as
follows:

| Approved state | When it appears | Required behaviour |
|---|---|---|
| **A — default list** | First visit, anonymous use, or a user with no applicable explicit follows/preferences. | Show the compact chronological **Upcoming this month** list, search and access to the complete year. This is the default Festivals page. |
| **B — optional Calendar view** | The user explicitly chooses Calendar from the Festivals destination. | Show the month-grid view over the same festival data and canonical guide routes. This is a view, not a second route or duplicate data source. Returning to List resolves to A or D according to the user's current explicit preferences. |
| **D — returning-user personalised list** | Automatically when the approved preferences store contains at least one applicable explicit follow/preference. | Prioritise relevant observances and explain why they appear. Never hide the complete list/calendar. Clearing all applicable follows/preferences returns the list to A. Religious preference data remains local-first and must not sync or enter analytics without explicit granular consent. |
| **C — not a separate destination** | Never as an independent Festivals landing state. | Today already owns “today and next.” Useful current/next information may appear in Today or within A, but C must not become a duplicate route or template. |

The implementation must use a dedicated stable Festivals view state for List versus
Calendar (provisionally `festivalView`; do not overload the existing calendar-system key
`cal`). The final key and URL/history behaviour must be documented before code. B wins
only when the user chooses Calendar; returning to List then resolves to A or D. D is
derived from the approved `preferences` store, never inferred from analytics or passive
browsing.

**Acceptance:** first visit resolves to A; choosing Calendar resolves to B; Back/reload
preserve the chosen view; an explicit applicable follow/preference makes the returning
List resolve to D; clearing all applicable follows/preferences returns it to A; the full
list and Calendar remain reachable in every state; religious preferences produce no
telemetry or sync without granular consent.

#### 10.3.2 Owner-approved multi-tag observance taxonomy (2026-08-11)

The current binary Festival/Fasting split is insufficient for migration. One observance
may belong to several useful families, so Ganak must keep one canonical observance record
with one presentation-driving `primaryType` and multiple searchable facets:

| Field | Rule | Examples |
|---|---|---|
| `primaryType` | Exactly one of `vrat`, `festival`, or `astronomical-event`; selects the answer-first treatment, not a separate data source. | Ekadashi → `vrat`; Raksha Bandhan → `festival`; Surya Grahan → `astronomical-event`. |
| `observanceFamily` | One or more recurring/religious families where relevant. | `ekadashi`, `pradosha`, `sankashti`, `eclipse`. |
| `cadence` | Optional recurrence facet. | `monthly`, `annual`, `adhika-masa`. |
| `deityTradition` | Zero or more reviewed content facets; this metadata does not imply a user's personal belief. | Ekadashi → `vishnu`; Pradosh → `shiva`. |
| `region` | Zero or more regional applicability facets, with `all-india` only when reviewed as true. | `tamil-nadu`, `bengal`, `north-india`. |
| `canonicalSlug` | One permanent guide identity shared by List, Calendar, search, Today and detail. | `/festival/devshayani-ekadashi`. |

The default Festivals destination remains chronological and complete. Its first-level
views may offer **All observances**, **Vrats & fasts**, **Festivals**, and
**Astronomical events / eclipses**; deity, tradition and region remain supporting facets
for search and explicit personalisation rather than a wall of default filter controls.
An observance must remain discoverable through every applicable facet without being
duplicated or disappearing from the complete list. Religious preference choices stay
local-first and are never inferred from passive browsing or sent to analytics without
explicit granular consent.

**Minimum migration examples:** Ekadashi = `vrat` + `ekadashi` + `vishnu` + recurring;
Pradosh = `vrat` + `pradosha` + `shiva` + monthly; Surya Grahan =
`astronomical-event` + `eclipse` + `solar`. The migrated registry fails acceptance if
any of these cannot be found from both the complete chronological list and each relevant
first-level view/search facet.

| Screen element | Decision | Real target / behaviour | State that must survive | Acceptance proof |
|---|---|---|---|---|
| Shared Ganak header and primary navigation | **Move** | Same destinations as §10.2, with Festivals visibly current. | `lang`, place, coordinates, zone, selected date and applicable route state. | Open every destination and return; Festivals remains the selected destination when appropriate. |
| Language selector | **Preserve** | Existing EN/HI application toggle. | Festival/calendar view, search query, place and date context. | Switch EN↔HI in the list, year view, search and an opened guide. |
| Personalize access | **Move** | Existing comfort, language, privacy and data controls; not an account/profile promise. | Approved local-first preferences and current Festival context. | Change/review a preference and return without losing the current list/search state. |
| Place field | **Move** | Existing shared place selector; dates and timings update for that place. | `city`, `lat`, `lon`, `zone`, `lang` and current Festival context. | Change city, open a guide, return/reload and confirm the same place. |
| Date / Today context | **Move** | Existing selected-date context and explicit Today action; not an independent festival-date database. | `date`, place, `lang`, `cal`, `hol` and browser history. | Pick a date, open Festivals, open a guide and return without reset. |
| Sunrise / sunset values in the shared ribbon | **Decorative / data-only** | Existing calculated local values; hide if unavailable. | Place, zone and date. | Compare with the current Daily result for the same inputs. |
| Page title and plain-language introduction | **Improve** | In A/D, explain that users can browse **Upcoming this month**, search an observance or open Calendar; D additionally explains its explicit-preference basis. | Language, selected context and applicable explicit preferences. | EN/HI copy clearly distinguishes discovery, personal priority and the full guide. |
| Observance views (replacing binary Festival / Fasting tabs) | **Improve** | One canonical chronological registry with first-level All, Vrats & fasts, Festivals and Astronomical events/eclipses views; no duplicated observance records. | Selected view, place, date and `lang`; Vaishnava date note remains truthful where applicable. | Find Ekadashi, Pradosh and Surya Grahan from All and their relevant view/search facet; verify canonical guide routes and dates. |
| Upcoming festival and fast rows | **Improve** | Whole row opens the existing canonical `/festival/<slug>` guide; no inline expansion. | Festival slug, place, coordinates, zone, `lang` and Back destination. | Every visible row opens the correct guide and browser Back returns to the same context. |
| Festival artwork / thumbnail | **Decorative / data-only** | Owned Ganak art may identify a row or featured observance; it does not create a second action. | Same destination as its parent row. | Image has meaningful alt text; clicking its row opens the canonical guide. |
| Date and relative-day label | **Decorative / data-only** | Existing calculated local occurrence and relative-day value. | Place, zone, selected date and language. | Compare displayed dates with the current Festival/Fasting list for the same place. |
| Search field and Search action | **Preserve** | Existing festival/tithi search powered by `searchUpcoming`; Festival/Fast results open canonical guides and tithi-only results remain plainly informational. | Search query, place, zone, language and Back destination. | Search a festival, a fast and a tithi; reload/Back retain the originating context without a false link. |
| Calendar view (B) / full-year access | **New — owner-approved** | B is the optional month-grid presentation over the same registry; existing full-year grouping remains reachable. It must not fork routes, calculations or content. | Dedicated Festival view state, visible month/year, place, zone, `lang` and Back destination. | Switch A/D↔B, move month/year, open a guide, reload and Back; place and view remain intact. |
| Returning-user personalised list (D) | **New — owner-approved** | After an explicit applicable follow/preference, prioritise relevant observances with a plain reason while keeping the complete chronological list and Calendar available. | Approved local-first preferences, List view, place, date and `lang`. | Add a follow/preference, return to Festivals and see D; clear all applicable choices and see A; no consent-free sync/analytics. |
| Deity, tradition and region facets | **New — owner-approved, progressive** | Store reviewed multi-tag metadata now; expose it through search and explicit Personalize choices. Do not crowd the default page with every facet as a filter chip. | Search query, explicit local-first preferences, place and `lang`; no passive religious-profile inference. | Relevant observances can be found; clearing a preference restores A; no religious facet enters sync or analytics without granular consent. |
| Standalone current/next landing (C) | **Remove** | Today already owns current and next observance context; C would duplicate that job. | N/A. | C is absent as a route, template and navigation destination. |
| Inline expand chevron or in-list festival preview | **Remove** | Rows navigate directly to the full canonical guide; the earlier inline preview was deliberately retired. | N/A. | One row has one clear destination and no competing expand action. |
| Reminder / Save / Share | **Deferred — omit** | Backlog #37; discovery must not promise an unbuilt calendar/export/recipient flow. | N/A. | Absent until #37 is implemented and accepted. |

**Inherited site-wide controls:** A, B and D use the same G1 header and G2 Date & Calendar
Context component. Calendar convention and holiday overlay apply to the List and Calendar
over the same registry; switching A/D↔B must not reset them.

**Editable Figma implementation (2026-08-13):** A `135:50`, B `135:254` and D
`135:662` use shared instances `209:222`, `209:309` and `209:396`. They no longer carry
independent copy-pasted context ribbons.

### 10.4 Festival Detail — canonical guide, desktop website

**Reference content:** `/festival/devshayani-ekadashi` is the first editable sample because
it matches the approved visual master's Vishnu artwork and has distinct route content:
Vishnu's symbolic rest, Chaturmas beginning, an Ekadashi fast and local parana. The
template remains content-adaptive; it does not make every festival look like Devshayani.

#### 10.4.1 Owner-approved intent-adaptive guide templates (2026-08-11)

The three approved detail options are one canonical guide system with deterministic
intent variants, not three copies of a festival page:

| Approved template | Content intent | Answer-first emphasis |
|---|---|---|
| **1 — normal festival** | Default for a named festival that is neither primarily a story journey nor a vrat/fasting observance. | Local date/timing, plain meaning and the appropriate devotional path. |
| **2 — story** | A reviewed story-dominant festival guide or an explicit Meaning & Story journey supported by that guide. | The reviewed katha/significance and devotional meaning, while local date/timing remains visible and reachable. |
| **3 — vrat** | Vrat, Ekadashi and fasting observances. | Fast date, tithi boundaries, applicable parana and practical/safety guidance before supporting detail. |

Selection is deterministic from reviewed festival metadata and the user's explicit guide
intent: vrat takes template 3, story takes template 2, otherwise template 1. The same
canonical festival slug, place, language and reviewed content source remain authoritative;
templates must not fork calculations or create duplicate guides. If a section or mapped
artwork is unavailable, omit it rather than substituting an irrelevant generic story,
deity or result.

**Acceptance:** an ordinary named festival resolves to 1; a reviewed story journey
resolves to 2; an Ekadashi/vrat resolves to 3. Direct URL, browser Back, place, language,
Follow, Listen and guide history remain intact. All dates and timings come from Ganak's
existing engine/data contract, not Figma sample values.

| Screen element | Decision | Real target / behaviour | State that must survive | Acceptance proof |
|---|---|---|---|---|
| Shared Ganak header and primary navigation | **Move** | Same destinations as §10.2, with Festivals visibly current. | `lang`, place, coordinates, zone, festival slug and Back destination. | Open each destination and return; direct festival URL remains permanent. |
| Language selector | **Preserve** | Existing EN/HI toggle changes guide navigation, answer, timing and supported devotional content. | Festival slug, place and current guide position where practical. | Switch EN↔HI on the direct route without returning to Today. |
| Personalize access | **Move** | Existing Personalize hub; not a new login/account menu. | Approved preferences, festival slug, place and language. | Open and return without losing the guide. |
| Place field | **Move** | Existing shared place selector recalculates the guide's local date and timing. | `city`, `lat`, `lon`, `zone`, festival slug and `lang`. | Change city and confirm local date/timing refreshes without changing guide. |
| Back to Festivals | **Move** | Returns to the Festival discovery context when entered there; normal browser Back remains valid. | Originating tab/view/search, place and language. | Open from list/search/year and return to the same context. |
| Intent-adaptive template selection (1/2/3) | **New — owner-approved** | Resolve the canonical guide to normal-festival, story or vrat presentation using the reviewed intent rule above; never randomly or from passive tracking. | Festival slug, explicit guide intent, originating Festival state, place and `lang`. | Test one ordinary festival, one reviewed story journey and one Ekadashi/vrat; each uses the correct emphasis without changing its source data. |
| Festival hero artwork | **Improve** | Existing owned, festival-appropriate Ganak art; Devshayani uses reclining Vishnu, while other guides use their own mapped art or omit the hero. | Festival identity and language-specific alt text. | Test Devshayani and at least one unrelated festival; no generic or mismatched deity art. |
| Festival title, bilingual identity and answer-first summary | **Improve** | Existing canonical guide title and reviewed route-specific verdict/meaning, never placeholder prose. | Festival slug and `lang`. | Compare English/Hindi text with the existing guide data; named observances do not collapse into a generic base fast. |
| Local date and timing card | **Improve** | Existing place-aware festival occurrence, deciding period and applicable parana/puja window; calculation rules remain untouched. | Festival slug, place, zone and language. | Compare with `findLocalFestivalOccurrence` for two cities and the relevant validation anchors. |
| Follow | **Preserve** | Existing star toggle through approved preferences storage; local-first, with religious preference excluded from sync/analytics without explicit granular consent. | Followed state, festival slug and language. | Toggle, reload, review/clear preference and confirm no direct browser storage call. |
| Listen | **Preserve** | Existing Web Speech read-aloud for the guide's title, verdict, meaning and supported content. | Language, current festival and play/stop UI state. | Start/stop in EN and Hindi; unsupported voice/error is visibly explained. |
| Meaning / significance and story | **Preserve** | Existing reviewed route-specific content and shared guide material where explicitly labelled. | Festival slug and language. | Named variant keeps its own meaning; source-boundary wording remains visible. |
| Vrat / Puja Vidhi | **Preserve** | Existing `VratVidhiCard` steps, who-it-is-for guidance, fasting boundaries and supported regional notes. | Festival slug, language and comfort depth. | Open the section in EN/HI; step order and caveats match current data. |
| Aarti / mantra / devotional readings | **Preserve** | Existing guide content only where supplied and reviewed; absent rather than invented when unavailable. | Festival slug, language and comfort depth. | A guide with content shows it; a guide without content has no empty or fake section. |
| Technical method / source boundary | **Preserve** | Existing expert-depth Lahiri/mean-node/local-sunrise note and route-specific sourcing boundary. | Guided/Expert preference and language. | Guided view stays plain; Expert view reveals the method without changing the result. |
| Related observances / season links | **Move** | Existing canonical routes only (for example Navadurga season links where supported). | Destination slug, place and language. | Every visible related link resolves; no invented recommendation card. |
| Reminder / Save / Share | **Deferred — omit** | Backlog #37; no calendar/export/recipient behaviour is implied before the feature is implemented. | N/A. | Absent from the working Figma screen and implementation. |
| Donation, booking, premium or commerce CTA | **Deferred — omit** | No such Festival-guide capability or owner-approved commercial journey exists in this migration slice. | N/A. | No decorative or dead commercial action appears. |

**Inherited site-wide controls:** Festival Detail uses the G1 header and inherits G2 place,
selected date, calendar convention and holiday-overlay state from its origin. The shared
context ribbon keeps that state visible and changeable without adding a second guide-specific
holiday card; browser Back returns to the exact originating context.

**Editable Figma implementation (2026-08-13):** Detail frames `135:866`, `135:1089`
and `135:1312` use shared instances `209:483`, `209:570` and `209:657`. The three intent
templates remain otherwise visually unchanged.

### 10.5 Working procedure for every later screen

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

### 10.6 Vrat / Festival Guide — desktop website  `(added 2026-08-16)`

**Visual source:** the `Vrat Guide Pack` fixture frames (`Fixture A` richest,
`B` split tradition, `C` longest name, `D` sparse content). The stress-variant method is
adopted: a guide template is reviewable only as a pack covering its richest, sparsest and
longest-name cases, never as a single showpiece frame.

**Structurally sound and retained without change:** the previous/next observance pair
(the crawl spine for all 181 guides), the collapsing artwork slot, and the
method/source and health notes.

| Screen element | Decision | Real target / behaviour | State that must survive | Acceptance proof |
|---|---|---|---|---|
| Eyebrow line | **Improve** | The observance's own name in the page language. It never carries a fixture id, board label or internal identifier. | Festival slug, place, `lang`. | `Fixture B` renders its real observance name; no string matching `FIXTURE [A-Z]` survives in any frame or build. |
| Page headline | **Improve** | Always the **meaning** of the day, one sentence, never a restatement of the name and never an instruction. The name lives in the eyebrow and the document title. | Festival slug, `lang`. | All four fixtures answer the same question in the same voice; `B` names its observance somewhere above the fold. |
| Sub-heading below the headline | **Improve** | Optional single supporting line. Vertical space beneath it is fixed and independent of whether it wraps. | `lang`. | `Fixture B`'s two-line sub-heading leaves the same gap as `A`'s one-line sub-heading. |
| Explanatory paragraph | **Improve** | Devotee-facing prose only. Text describing the design's own behaviour is a register entry, never page content. | `lang`. | No frame contains a sentence addressed to a reviewer (see the note-removal list below). |
| Follow control | **Preserve** | The shipped follow capability — `festival:<key>` appended to the local `preferences.following` list, shared with the Personalize “What you follow” surface. Labelled with the observance name where known. | Local-first follow preference; festival key; `lang`. | Present and operable on **every** guide including the sparse fixture; toggling it appears in Personalize; a sparse day never removes it. |
| Listen control | **Preserve** | Existing single-session read-aloud. | `lang`, current guide. | Reads the guide in the page language. |
| “Read in Hindi” / “Read in English” | **Improve** | A language **switch to the twin address** under the merged `/hi/` scheme — not an in-page toggle. Carries place, date and observance across. | `city`, `lat`, `lon`, `zone`, `date`, festival slug. | Following it from any guide lands on the same observance, same place, same date, in the other language; reciprocal `hreflang` present on both. |
| All section and field labels | **Improve** | **One language per address.** `Diet rules` on the English page, `आहार नियम` on the Hindi page. Paired in-place labels (`Diet rules / आहार नियम`) are retired. | `lang`. | No frame or built page renders both scripts for the same label. |
| Sacred terms | **Preserve** | `Sankalpa`, `Vidhi`, `Paran`, `Udyapan`, `Aarti` and observance names remain untransliterated on the English address — they are names, not translations. | `lang`. | Present in Latin script on the English page and Devanagari on the Hindi page. |
| Artwork slot | **Preserve** | Collapses cleanly when no mapped artwork exists; never a placeholder or generated image. | Festival slug. | `Fixture D` closes the slot with no gap and no broken frame. |
| Previous / Next observance | **Preserve** | Permanent guide routes for the adjacent observances, with dates. | Place, `lang`, calendar convention. | Both open real guides; the pair is present on every guide, giving crawlers a complete chain. |
| Method / source note | **Improve** | Calculation basis for the displayed values. **Required on every guide page**, not only fasting guides (owner, 2026-08-16). Citations open without changing selected state. | Place, date, calendar convention, `lang`. | Present on all four fixtures and on a non-fasting observance; opening a citation preserves route state. |
| Health note | **Improve** | Medical-suitability wording. **Required on every guide page** (owner, 2026-08-16); on non-fasting observances it carries the same wording, since a guide may still describe optional restraint. | `lang`. | Present on all four fixtures and on a non-fasting observance, in the page language. |
| Last-updated stamp and “how Ganak calculates” link | **Deferred — omit** | Recorded here because both are required for citation by answer engines; neither has an owner decision or destination yet. | N/A. | Absent until specified. |
| Aarti language chooser (`हिन्दी \| मराठी \| बंगला \| गुजराती`) | **Deferred — omit** | Content-language choice for a single section is a distinct capability from the site language address, and has no mapped storage or destination. | N/A. | Absent from working screens until mapped. |

#### 10.6.1 Reviewer notes to be removed from content positions

The following strings sit in devotee-facing content slots while addressing the reviewer.
Each is deleted from the frame; where it recorded a requirement, that requirement is
already captured in the table above.

| Frame | String |
|---|---|
| `Fixture C` hero | “The full observance name remains visible in both scripts, including on the action below.” |
| `Fixture D` hero | “Only verified content appears. Unavailable story, regional tradition, and mapped artwork are absent.” |
| Reading block | “Shravana Putrada Ekadashi story in English and Hindi, displayed without clipping.” |
| Regional traditions | “Regional tattva to read or hear / पढ़ने या सुनने योग्य क्षेत्रीय जानकारी” |
| Method note | “Source and calculation basis remain visible here; citations open without changing selected state.” |

#### 10.6.2 Long-name proof must cover the four places names actually break

`Fixture C` proves a long observance name fits the headline and the primary action. That
is the controlled case. The pack is complete only when the same name is also shown in the
document title, the previous/next observance pair, the primary action at the narrowest
supported width, and the calendar/discovery row.

#### 10.6.3 Variation is expressed as component options, never as edited or copied parts

Recorded because it governs how every later screen is built (owner, 2026-08-16):

- A page that needs to differ **selects a different option** on a shared part.
- A shared part is **never edited to satisfy one page**; the need for that is the signal
  that the part requires a new option. Editing the part *for every screen that uses it*
  is a different act, is permitted, and is governed by the sweep obligation in §10.8.
- A shared part is **never duplicated** to create a one-off. A genuine one-off is declared
  as such in this register, together with the explicit statement that site-wide token and
  component changes will not reach it.
- Site-wide change therefore has exactly two levers: the design tokens, and the shared
  part itself. Both remain able to move every screen at once.

### 10.7 Full Panchang — desktop website  `(added 2026-08-16)`

**Visual source:** frame `Full Panchang · CANONICAL Delhi 2026-07-25 · APPROVAL`
(1536 × 1820, English only). Audited 2026-08-16 against §4, §10.1 and §10.1.1.

**Fixture status:** this frame's displayed values **do** reconcile with the canonical
fixture `today-delhi-2026-07-25-devshayani-v1` — Ekadashi until 11:35 AM, Shukla Paksha,
Ashadha, Jyeshtha until 7:34 AM on 26 July, Brahma Yoga until 9:07 PM, Vishti Karana
until 11:35 AM, sunrise 5:38 AM, sunset 7:16 PM, Abhijit 12:00–12:55 PM, Rahu Kalam
9:03–10:45 AM. It therefore passes §10.1.1 rules 1–6, unlike the Vrat Guide pack.

**Retained without change:** the lean context ribbon (three controls, two read-outs, no
gate machinery); the Decision Windows block; and the tradition-separation labelling —
Gowri marked *kept separate from North-Indian daily windows*, Bala marked *favourable
only · no personal details required*, both footnoted *not a personal chart*.

**Colour-only status is already solved on this screen** and must not regress: every
tinted tile and pill pairs a ✓ / ! glyph and a word with its colour, closing the gap the
2026-08-01 accessibility review found in the shipped Muhurat surface.

| Screen element | Decision | Real target / behaviour | State that must survive | Acceptance proof |
|---|---|---|---|---|
| Primary navigation active state | **Improve** | Full Panchang is a distinct destination; the navigation must not mark **Today** as current while this page is shown. Whether Full Panchang is a peer destination or a child of Today, the page states where it is. | Current route, `lang`, place, `date`, `cal`, `hol`. | Loading Full Panchang never renders Today as the active item. |
| Breadcrumb / return path | **New — owner-approved** | A `Today › Full Panchang` trail in the context ribbon, the first element linking back. Currently the only surface marker is the small ochre `FULL PANCHANG` line above the headline. | Place, `date`, `cal`, `hol`, `lang` carried back to Today unchanged. | From Full Panchang, the trail returns to Today for the same place and date; Back behaves normally. |
| Site footer | **Move** | The shared footer already drawn for the guide template — this month's observances, other cities, Hora, Muhurat finder, language twin, about, sources and methods, privacy, terms. Full Panchang currently ends on the decorative border with no footer at all. | `lang`, place, `date`. | The same footer component instance renders here and on a guide; every link resolves. |
| Masthead decorative artwork | **Improve** | The botanical motif is retained as an edge and border treatment and removed from the band containing the wordmark and primary navigation. The wordmark must not be the lowest-contrast text in its own header. | N/A. | First-fixation and contrast check: the wordmark is legible and is not subordinate to adjacent artwork. |
| Midnight-crossing date markers | **Improve** | **One** convention for a time that continues past midnight, applied identically in Sun/Moon, Choghadiya, Decision Windows and Gowri. Explained **once**, in the Day Reckoning block. The frame currently uses three visual treatments and three separate explanatory notes. | Place, zone, `date`, `cal`. | A single marker style across all four blocks; exactly one explanatory sentence on the page. |
| Section-label typography | **Improve** | The label tier must be distinguishable by something other than Latin uppercase and letterspacing — weight, rule, size step or tint. Devanagari has neither uppercase nor an equivalent letterspacing convention, so the current scheme collapses the label tier into the footnote tier in Hindi. | `lang`. | The Hindi twin of this frame shows the same three visual tiers as the English one. |
| Hindi twin of this frame | **Improve** | Required before approval. The frame is English-only, so approval would otherwise cover only the half of the design that works. | `lang`, place, `date`. | A Devanagari frame of the same fixture exists and passes this register. |
| Choghadiya and Gowri grids | **Improve** | One tile component and one column count for both. Choghadiya currently runs four across, Gowri five, for the same content type on the same page. | Place, zone, `date`. | Both grids instantiate the same part with different options, per §10.6.3. |
| Core Panchang / Sun-Moon / Calendar-Season card row | **Improve** | One column structure across the three cards. The `26 Jul` qualifier in the Moonset row currently lands in an unlabelled third column in an alert colour and reads as a warning rather than a date. | Place, zone, `date`, `cal`. | The three cards share a structure; the date qualifier uses the §-wide midnight convention, not an alert treatment. |
| “Continue from this day” block | **Improve** | Retained, but the primary next step also needs an entry above the fold. It is the page's only dark, highest-contrast surface and sits roughly 70% down an 1820px page, so the strongest element is the one most visitors never reach. | `muhurat`, place, `date`, `cal`, `lang`. | The Muhurat next step is reachable without scrolling; the deep-link still hydrates the finder. |
| Footnote and secondary-value type | **Improve** | Measured against a 12px floor and 4.5:1 contrast. The footnote tier is roughly half the size of the values it sits under, in grey on white. | Comfort/scale preference. | Measured pass at every comfort preset, per the existing accessibility gate. |
| Personalize control in the header | **Preserve** | Existing Personalize entry, per §10.2. | Approved local-first preferences, current route. | Unchanged from §10.2. |

#### 10.7.1 Guide-template evidence boards — what they already close

Boards `357-2` (page-foot band close-up) and `380-22` (specimen strip) were reviewed on
2026-08-16 and resolve part of §10.6.2 and the footer gap:

- **Footer exists and is specified** — this month's observances, other cities, Hora,
  Muhurat finder, language twin, about, sources and methods, privacy, terms. §10.7 above
  adopts it for Full Panchang rather than inventing a second footer.
- **Long-name proof at 320px exists** (`FOLLOW · 320PX ACTION`) and **in the calendar row**
  (`CALENDAR LIST ROW`), which completes two of the four places named in §10.6.2. The
  document title and the previous/next pair remain unproven.
- **The 320px specimen is set as text, not as the control.** It proves the label wraps; it
  does not prove the button's height, padding or tap target survive three wrapped lines.
  The proof must be the rendered control.
- **The interaction rules board is adopted into this contract as written:** every tappable
  opens a defined destination; one deliberate next step, with previous/next placed after
  the answer; reminder location is reserved only, never a fake or disabled control; and
  religious preference never syncs or enters analytics without granular consent.

#### 10.7.2 Language mixing is the one systemic defect across all reviewed boards

A single guide page currently applies four different language rules at once: a
Devanagari-only footer, English previous/next controls, an English method note, an English
health note under a paired `Health note / स्वास्थ्य टिप्पणी` label, and paired labels
throughout the body. Under the merged `/hi/` address scheme this resolves to the §10.6
rule — **one language per address**, sacred terms excepted — and that rule governs the
footer, the previous/next pair, the method note and the health note equally.

### 10.8 Where a change belongs — three levels and page settings  `(owner, 2026-08-16)`

The owner requires two things that only look opposed: a single page must be changeable
without disturbing others, **and** a change must be able to reach the whole site at once.
Both hold as long as every change travels through one of three levels and never sideways.

| Level | What lives there | Blast radius when changed |
|---|---|---|
| **Tokens** | Colour, spacing, type scale, radius, density | Every screen, everywhere. This is the site-wide lever. |
| **Shared parts, with options** | Card, tile, data row, timing block, badge, section header, context ribbon, footer | Only the screens that select that option |
| **Content** | This observance's name, this day's calculated values | Only that one page |

**The routing rule — apply in this order:**

1. Can the difference be expressed by **selecting a different option** on an existing
   shared part? → it is a **page setting**. Record it in that screen's register row.
2. Does no suitable option exist, and does only this screen (or a subset) need it? → the
   shared part **gains a new option**.
3. Is the shared part itself **wrong for every screen that uses it**? → **edit the shared
   part.** This is permitted and expected; it is what a shared part is for. It carries one
   obligation, below.
4. Should the difference hold across all parts? → it is a **token** change.
5. Can none of the above serve the screen? → declare a **one-off** in the register,
   together with the explicit statement that token and shared-part changes will not reach
   it.

**The obligation on step 3 — the sweep.** Editing a shared part is a deliberate,
site-wide act. Before it merges, every screen that instantiates that part is opened and
checked, and the register rows naming it are re-read. The prohibited act in §10.6.3 is
narrower than "editing a shared part": it is **editing a shared part in order to fix one
screen**, where the other users of that part are changed without anyone looking. The edit
is not the defect; the unexamined blast radius is.

**Choosing between step 2 and step 3.** A new option costs nothing elsewhere but adds a
choice that must be maintained and documented forever. An edit costs a sweep but keeps the
part simple. Neither is free. Adding an option to avoid a sweep is how a part accumulates
near-duplicate choices nobody can tell apart; editing to avoid documenting an option is
how unrelated screens silently regress. The register records which was chosen and why.

**The screen registers in §10.2–§10.7 are the page-settings panel.** Each row states what
a screen's element is, which shared capability it uses and what state it must preserve —
the written equivalent of a per-page configuration screen. A register row that names a
shared part must also name the **option** that screen selects, so that "the same part,
configured differently" is visible on the page rather than inferred from the picture.

#### 10.8.1 The site footer is generated, not composed

Recorded because it is the clearest instance of `Provisional — revisit on dependency`.

The footer is a **rendering of the site's destination list**, not a hand-placed set of
links. It looks sparse today because most of what it should point to does not exist yet;
it fills in on its own as those destinations ship, provided it is never built as fixed
markup.

- **State:** `Provisional — revisit on dependency`.
- **Revisit trigger:** the arrival of city-aware Panchang addresses, the Hora / Rahu Kalam
  / Choghadiya / Abhijit destinations, the Muhurat finder entry, and the
  about / sources-and-methods pages.
- **Degradation rule:** with fewer destinations it shows fewer links. It never shows a
  disabled link, a placeholder, or a link to a page that does not exist.
- **Consequence:** the footer is not approved or rejected on how it looks today, and a
  visual objection to it is not a blocking finding until its trigger has fired.
