# Bug bash — city selection and city persistence journey

**Date:** 2026-08-10
**Agent:** Claude Code (independent adversarial pass, report-only)
**Target:** https://ganakapp.com (live production)
**Code under test:** `c75bcaf` — `origin/main` == `origin/production` (identical); verified in worktree `.scratch/worktrees/bugbash-city`
**Scope:** first-run city selection, local city persistence, shared-link city conflict, conflict boundaries, language/accessibility, failure handling, regression gates
**Contract:** `plans/city-preference-migration-contract.md`
**Product code changed:** none.

---

## Verdict: **FAIL**

One **P1** remains open. Per the closeout rule, this journey must not be marked PASS while a P0/P1 is open.

The core contract is in far better shape than the verdict suggests. Every load-bearing
rule — no Delhi default, opt-in location, the blocking two-choice link question, "a linked
city never overwrites the saved default", no bypass from malformed parameters — holds under
adversarial testing. The P1 is a **false-positive conflict**: the app asks a blocking
question when there is no conflict, and in the most realistic form of the bug the two
buttons it offers are *word-for-word identical*.

| Severity | Count |
|---|---|
| P0 | 0 |
| P1 | 1 |
| P2 | 3 |
| P3 | 3 |

---

## P1 findings

### P1-1 · Link-conflict dialog fires when the linked city *is* the remembered city, offering two identical choices

**Contract rule violated:** §7 "Do not ask when there is no real conflict."

`samePlace()` (`src/accessibility/AccessibilityRoot.tsx:38`) requires exact equality of
**label AND lat AND lon AND zone**. Any difference in coordinate precision or label casing
makes the same city compare as a different city, so the blocking modal opens.

**Why this is not a theoretical edge case.** `nearestCity()`
(`src/data/places.ts:44-59`) returns the matched city's **label and zone** but the
**caller's own GPS coordinates**:

```js
best = { label, lat, lon, zone: ZONES[zoneIndex] };   // lat/lon are the *caller's* args
```

So every visitor who used **"Use my device location"** has a saved city like
`{label: "Mumbai, India", lat: 19.076, lon: 72.8777}` — the CITY_DB label with their own
GPS coordinates. Ganak's own share links use the rounded CITY_DB coordinates
(`lat=19.08`). The two never compare equal, so **any Ganak share link for the user's own
city triggers the conflict modal**, with both buttons naming the same city.

**Reproduction (verified live, 2026-08-10):**

1. Fresh browser at https://ganakapp.com.
2. Save a device-location-shaped preference — exactly what `nearestCity` writes for a user standing in Mumbai:
   ```js
   const KEY='ganak:approved-storage:v1';
   const env=JSON.parse(localStorage.getItem(KEY));
   env.stores.preferences.homePlace={label:"Mumbai, India",lat:19.076,lon:72.8777,zone:"Asia/Kolkata"};
   localStorage.setItem(KEY,JSON.stringify(env));
   ```
3. Open a standard Ganak share link for the same city:
   `https://ganakapp.com/?city=Mumbai%2C+India&lat=19.08&lon=72.88&zone=Asia%2FKolkata`

**Expected:** the link matches the remembered city; it opens normally with no question.

**Actual —** blocking modal, city-dependent content withheld (`body.innerText.length` 374 vs 5111 for a normal load):

> CONFIRM THE CITY
> Which city's Panchang would you like?
> **This link is set to Mumbai, India, but your remembered city is Mumbai, India.** Your remembered preference will not be changed automatically.
> [ View Mumbai, India for this link ]
> [ Use my remembered city: Mumbai, India ]

The user is asked to choose between two buttons whose visible text is identical, with no
way to tell them apart, and Escape is (correctly, for a blocking dialog) swallowed — so the
question cannot be dismissed, only answered arbitrarily.

**Other confirmed triggers of the same root cause:**

| URL vs remembered `Mumbai, India / 19.08 / 72.88` | Prompted? | Button text |
|---|---|---|
| `lat=19.08&lon=72.88` (exact) | no ✓ | — |
| `lat=19.0760&lon=72.8777` (precision) | **yes ✗** | both read "Mumbai, India" |
| `city=mumbai%2C+india` (casing) | **yes ✗** | "View mumbai, india…" / "…Mumbai, India" |

The casing/label variant is also reachable without device location: the in-app search
returns **both** `Mumbai, India` (offline CITY_DB) and `Mumbai, Maharashtra, India`
(Open-Meteo geocoder) as pickable options — observed live — so two users who both picked
"Mumbai" can hold labels and coordinates that never compare equal.

**Suggested direction (not implemented):** compare places by proximity and normalised
label (e.g. same zone plus coordinates within a small tolerance, label compared
case-insensitively) rather than exact quadruple equality. Note the existing gate
`validation/link-city-choice.cjs` asserts `!samePlace(...)` is *used*; it does not
constrain how `samePlace` decides, so this defect passes the gate.

---

## P2 findings

### P2-1 · Both blocking dialogs overflow the viewport at every mobile width

**Contract acceptance test affected:** "phone widths have no horizontal overflow."

The dialog card is **19px wider than the viewport at every phone width**, clipped 9.5px on
each side — the rounded corners and side borders are sliced off (see screenshot evidence below).

**Root cause.** The global `box-sizing: border-box` reset lives in a `<style>` block inside
`src/kundli-app.tsx` (line ~130), and the blocking dialogs render *before* that shell mounts.
Measured while the conflict dialog is open: `document.querySelectorAll('style').length === 0`,
a fresh `<div>` computes `box-sizing: content-box`. So the section's
`width: min(100%, 30rem)` resolves to the content box and padding is added *outside* it:
`283.875 + 2×26.5625 + 2×1 = 339px` in a 320px viewport.

| Viewport | Card width | Overflow |
|---|---|---|
| 320 | 339.0 | +19 ✗ |
| 360 | 379.0 | +19 ✗ |
| 375 | 394.0 | +19 ✗ |
| 390 | 409.0 | +19 ✗ |
| 414 | 433.0 | +19 ✗ |
| 768 | 565.1 | fits ✓ |
| 1280 | 565.1 | fits ✓ |

No horizontal document scrollbar appears (the overlay is `position: fixed`), so this is
visual clipping rather than a scrolling defect. Note the desktop card is also **565.1px**
rather than the intended 480px (`30rem`) — same cause. Affects `FirstRunPlaceDialog` and
`LinkCityChoiceDialog` equally.

### P2-2 · "Use device location" can silently assign a city and timezone thousands of km away

**Contract rule strained:** §2 — a *failed* lookup shows guidance, but this path does not
fail. It succeeds, confidently, with the wrong answer.

`nearestCity()` has **no maximum-distance guard**: it returns the closest CITY_DB entry no
matter how far away, and the user sees that city's name as their own. Because panchang
timings are timezone-derived, a wrong zone shifts sunrise, tithi and every muhurat.

Measured with the shipped gazetteer (`.scratch/nearest-probe.mjs`, 2026-08-11 reference date):

| Device location | Assigned label | Assigned zone | True zone | Offset error | Distance |
|---|---|---|---|---|---|
| Honolulu, Hawaii | San Francisco, USA | America/Los_Angeles | Pacific/Honolulu | **3h** | 3854 km |
| Novosibirsk, Russia | Srinagar, India | Asia/Kolkata | Asia/Novosibirsk | **1h30** | 2411 km |
| Reykjavik, Iceland | Glasgow, UK | Europe/London | Atlantic/Reykjavik | 1h | 1339 km |
| Anchorage, Alaska | Vancouver, Canada | America/Vancouver | America/Anchorage | 1h | 2129 km |
| Tashkent, Uzbekistan | Kabul, Afghanistan | Asia/Kabul | Asia/Tashkent | 30m | 749 km |
| Almaty, Kazakhstan | Srinagar, India | Asia/Kolkata | Asia/Almaty | 30m | 1034 km |
| Male, Maldives | Thiruvananthapuram, India | Asia/Kolkata | Indian/Maldives | 30m | 614 km |

A user in Honolulu who taps "Use my device location" is told their city is **San Francisco**
and receives timings three hours out, with no warning and no prompt to search manually.
Within the covered diaspora corridors the mapping is accurate (Mumbai GPS → Mumbai, 1 km).

### P2-3 · A deliberate Hindi choice is not remembered; the next normal visit reverts to English

**Standing principle violated:** AGENTS.md — "no state resets without a user action";
undermines contract §9 language parity in practice.

`src/kundli-app.tsx:98`:
```js
const chooseLang = (v) => { setLang(v); urlPrefSet("lang", v); };   // URL only — no persistence
```
Compare the city control two lines later, which *does* persist:
```js
const setPanchPlace=(next)=>{ …; updatePreferences({homePlace:{…}}); };   // line 122
```

**Reproduction (verified live):** fresh visitor → select Mumbai → click **हिन्दी** in the
header → UI turns Hindi and URL gains `lang=hi`, but stored `preferences.language` stays
`"auto"` → navigate to bare `https://ganakapp.com/` → **UI is English again**
(`aria-pressed="true"` on English, "Times shown for Mumbai, India", "Personalize"), while
the city is correctly still Mumbai.

So the city is remembered and the language is not, in the same visit. A Hindi-first user
re-selects Hindi on every visit. Note `AccessibilityRoot.chooseLanguage` (used by the
Personalize screen) *does* call `updatePreferences({language})` — the two language controls
are asymmetric.

---

## P3 findings

### P3-1 · City-search combobox ignores ArrowUp/ArrowDown and never exposes an active option

`src/components/PlaceInput.tsx` declares `role="combobox"` with `aria-autocomplete="list"`
and `aria-controls`, but has no keydown handling. Measured live in the first-run dialog:
ArrowDown changes nothing, `aria-activedescendant` stays `null`, every option keeps
`aria-selected="false"`, and option `id`s are empty strings (so `aria-activedescendant`
could not reference one even if set).

**Not a blocker:** the suggestions are real `<button>` elements inside the focus trap, so
they are ordinary tab stops and the dialog is completable by keyboard (verified focus order:
device-location button → input → option 1 → option 2). This is an ARIA APG pattern deviation
that costs screen-reader users the expected "option N of M" semantics, not an operability failure.

### P3-2 · Hindi UI shows English city names

The Hindi conflict dialog reads `इस लिंक में London, UK है, लेकिन आपका याद रखा शहर Mumbai, India है।`
— fully translated chrome around Latin-script city names, because the gazetteer labels are
English-only. Consistent across the app and arguably acceptable; recorded so it is a decision
rather than an oversight.

### P3-3 · Document title stays English while a Hindi blocking dialog is shown

Loading `?lang=hi` on a first run leaves `document.title` as "Ganak Panchang — Today's Tithi,
Festivals and Muhurat"; the shell owns the title and has not mounted behind the dialog. It
corrects itself as soon as a city is chosen.

---

## Verified correct (no defect)

These were attacked and held.

**Fresh visitor**
- First-run dialog is the *only* thing rendered — `#root` has exactly one child,
  `body.innerText.length === 339`. No Delhi, no timings, nothing city-dependent behind it.
- **Nothing is written to storage before selection** (`localStorage` key absent).
- Manual city search works and is reachable; device-location button is present and autofocused.
- **Location permission is requested only from the button handler** — no prompt on load
  (`navigator.permissions.query({name:'geolocation'})` observed before any interaction).
- **Denied location** → visible `role="alert"`: *"Location permission was not granted. You can
  search for your city below."* / Hindi: *"स्थान की अनुमति नहीं मिली। आप नीचे शहर खोज सकते हैं।"*
  Manual search stays available; nothing is persisted.

**No Delhi flash.** The most likely structural risk — `panchEff = panchPlace || DEFAULT_PLACE`
with `DEFAULT_PLACE = New Delhi` (`kundli-app.tsx:117,124`) while a bare URL carries no city —
**did not reproduce**. Observed a bare-URL revisit from first byte via a same-origin iframe
sampled on every animation frame and every 4ms: the first non-empty paint already carried
Mumbai with the URL rewritten. No Delhi frame, no `NaN`, no `Invalid Date` in any test.

**Remembered city**
- Mumbai survives reload and a bare-URL revisit; URL is rewritten to the saved city.
- A deliberate change through the normal control (→ Chennai) updates view, URL **and** the
  remembered default; the control stays reachable on the normal screens.

**Linked-city conflict** — both branches behave exactly as the contract specifies.
- Blocking dialog appears before any city-dependent content (`#root` has only the dialog).
- Choose **London**: view is London, dialog closes, **saved preference stays Mumbai**; a later
  normal visit returns to Mumbai.
- Choose **Mumbai**: view and URL switch to Mumbai, preference stays Mumbai, and
  `history.length` is unchanged (uses `replaceState` — no history pollution).
- Hindi parity confirmed on the conflict dialog: title, eyebrow, both buttons, explanation and
  footer all Devanagari with zero English leak.

**Conflict boundaries**
- Exact-match link does not ask.
- Malformed/partial parameters never bypass the first-run gate and never corrupt the
  preference. With **no** saved city: `?city=London,UK` alone, missing `zone`, and
  `zone=Bogus/Zone` each fall through to the first-run chooser with nothing written.
  With Mumbai saved, each falls back to Mumbai and rewrites the URL cleanly.
- **A linked city is never saved.** Verified both with a remembered city (choosing "View
  London" leaves Mumbai stored) and with none (a valid London link opens London and leaves
  `homePlace` `null`).
- Back / Forward / reload never silently change the city: Back from a chosen London link
  returns to Mumbai; Forward re-presents the conflict question rather than silently applying
  London; the preference is untouched throughout.
- Language switching does not change the city or the saved default.

**Failure handling**
- **Failed persistence** surfaces visibly. With `Storage.prototype.setItem` throwing
  `QuotaExceededError`, selecting a city shows a `role="alert"`: *"यह ब्राउज़र शहर को याद नहीं
  रख सका। इस बार गणना सही शहर के लिए होगी, लेकिन अगली बार आपको फिर चुनना पड़ सकता है।"*
  The app still mounts and calculates for the chosen city.
- No silent errors, blank screens, `NaN` or `Invalid Date` in any scenario tested.
- **Zero console errors or warnings** across every journey (capture verified working by
  emitting a probe log).

**Security.** City labels are rendered as text, not markup. `<img src=x onerror=…>` and
`"><script>…</script>` payloads in `?city=` appear as literal button text, execute nothing
(`parent.__xss` never set, zero injected nodes), and leave the preference untouched. A
1200-character label and a quote-escaping payload in `?zone=` are likewise inert.

**Accessibility of the blocking dialogs.** Both have `role="dialog"`, `aria-modal="true"`,
`aria-labelledby` and `aria-describedby`. `useModalFocus` autofocuses
`[data-modal-autofocus]`, marks sibling roots `aria-hidden` + `inert`, and restores focus on
close. Verified against the live handler: **Tab at the last element wraps to the first**,
**Shift+Tab at the first wraps to the last** (both with `preventDefault`), and **Escape is
swallowed so the blocking dialog cannot be dismissed** — correct, since there is no valid
state without a city. Both buttons state their city explicitly.

---

## Test matrix

| # | Case | EN | HI | 320 | 375 | 390 | Desktop | Result |
|---|---|---|---|---|---|---|---|---|
| 1 | Fresh visitor — no Delhi before selection | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | PASS |
| 2 | Nothing persisted before selection | ✓ | ✓ | – | – | – | ✓ | PASS |
| 3 | Manual city search + select | ✓ | ✓ | – | – | ✓ | ✓ | PASS |
| 4 | "Use device location" present | ✓ | ✓ | – | – | ✓ | ✓ | PASS |
| 5 | Permission requested only on tap | ✓ | ✓ | – | – | – | ✓ | PASS |
| 6 | Denied location → bilingual recovery | ✓ | ✓ | – | – | – | ✓ | PASS |
| 7 | Device location → distant city/zone | – | – | – | – | – | – | **P2-2** |
| 8 | Mumbai survives reload | ✓ | ✓ | – | – | ✓ | ✓ | PASS |
| 9 | Mumbai survives bare-URL revisit | ✓ | ✓ | – | – | ✓ | ✓ | PASS |
| 10 | Normal change → new remembered default | ✓ | – | – | – | – | ✓ | PASS |
| 11 | City change reachable throughout | ✓ | ✓ | – | – | ✓ | ✓ | PASS |
| 12 | London link → blocking question first | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | PASS |
| 13 | Choose London → view London, pref Mumbai | ✓ | ✓ | – | – | ✓ | ✓ | PASS |
| 14 | Later normal visit → Mumbai | ✓ | ✓ | – | – | ✓ | ✓ | PASS |
| 15 | Choose Mumbai → URL+view Mumbai, pref Mumbai | ✓ | ✓ | – | – | ✓ | ✓ | PASS |
| 16 | Matching link does not ask | ✓ | – | – | – | – | ✓ | PASS |
| 17 | Same city, different precision/case | ✓ | – | – | – | ✓ | ✓ | **P1-1** |
| 18 | Malformed/partial params — no bypass | ✓ | – | – | – | ✓ | ✓ | PASS |
| 19 | Malformed params — no crash/NaN/corruption | ✓ | – | – | – | ✓ | ✓ | PASS |
| 20 | XSS in city/zone params | ✓ | – | – | – | ✓ | ✓ | PASS |
| 21 | Back / Forward / reload preserve city | ✓ | – | – | – | ✓ | ✓ | PASS |
| 22 | Language switch preserves city | ✓ | ✓ | – | – | ✓ | ✓ | PASS |
| 23 | Language choice itself persists | ✓ | ✓ | – | – | ✓ | ✓ | **P2-3** |
| 24 | Linked city never becomes default | ✓ | ✓ | – | – | ✓ | ✓ | PASS |
| 25 | Focus trap: Tab / Shift+Tab wrap | ✓ | – | – | – | – | ✓ | PASS |
| 26 | Escape does not dismiss blocking dialog | ✓ | – | – | – | – | ✓ | PASS |
| 27 | Focus restoration on close | ✓ | – | – | – | – | ✓ | PASS |
| 28 | Buttons state both cities | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | PASS |
| 29 | Combobox keyboard (arrow keys) | ✓ | – | – | – | – | ✓ | **P3-1** |
| 30 | Dialog horizontal overflow | ✓ | ✓ | ✗ | ✗ | ✗ | ✓ | **P2-1** |
| 31 | Screen-reader names / ARIA structure | ✓ | ✓ | – | – | – | ✓ | PASS |
| 32 | Failed persistence → visible guidance | ✓ | ✓ | – | – | – | ✓ | PASS |
| 33 | No content behind the modal | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | PASS |
| 34 | Console errors / warnings | ✓ | ✓ | – | – | ✓ | ✓ | PASS (0) |

"–" = not separately exercised on that axis; the defect class is width- or
language-independent and was covered on the axes marked.

---

## Regression gates

Run in `.scratch/worktrees/bugbash-city` at `c75bcaf`:

```
$ node validation/first-run-place.cjs
first-run-place: PASS (13 checks)

$ node validation/link-city-choice.cjs
link-city-choice: PASS (9 checks)

$ node validation/parse-check.js src/kundli-app.tsx
note: validation/build-engine.js not found — skipping cutBlock check
✓ parse-check clean: src/kundli-app.tsx  (syntax, no duplicates, no orphans, approved storage adapter only, no internal vrat notes)

$ npm run build
dist/assets/index-6hG2Kq0t.js   2,640.33 kB │ gzip: 745.93 kB
✓ built in 1.21s
build-seo: sitemap 198 URLs, robots.txt written.
build-seo: 198 route HTML files written.
build exit=0
```

**All four gates pass — and P1-1 passes them too.** `link-city-choice.cjs` asserts that
`!samePlace(...)` gates the prompt; it does not constrain how `samePlace` decides equality, so
a same-city false positive is invisible to it. Any fix should add a gate assertion covering
near-identical places (coordinate tolerance and label casing), or the defect can regress green.

---

## Known limitations (not regressions)

1. **Signed-in cross-device account sync is not implemented.** Contract §4 and the
   account-sync conflict rule remain unbuilt. This is a documented future requirement, not a
   defect found in this pass. **No UI or copy falsely claims account sync works** — audited
   `src/**` for sign-in/sync/account claims. The footer states the opposite
   (`kundli-app.tsx:297-298`: "computed on your device · no account"), and
   `PersonalizeScreen.tsx:202` correctly says religious preferences "remain on this device and
   are never synced". Flagging for the owner: that "no account" footer line becomes **false**
   the day Jyotish accounts ship, and will need copy work in the same slice.
2. **Local persistence is per-browser-profile by design** — clearing site data resets to first
   run, which is correct behaviour and the reason §4 exists.

### Testing limitations (disclosed)

- **Physical key events could not be delivered to the page** by the harness (verified: a
  document-level `keydown` capture listener recorded nothing during tool-driven Tab presses).
  Keyboard and focus-trap findings therefore come from reading `useModalFocus`, dispatching
  events against the **real live handler**, and measuring the resulting `document.activeElement`
  and focusable order — not from native browser tabbing. A human keyboard pass is still worth
  doing before closure.
- **The geolocation *success* path was not exercised in-browser**: the test profile had
  geolocation permission denied at browser level, which is what made the denial path testable.
  P2-2 was therefore established against the shipped `nearestCity` implementation and gazetteer
  directly rather than through a live GPS grant.
- **No real screen-reader (VoiceOver/NVDA/TalkBack) was run** — ARIA findings are structural.
- No browser automation driver was installed; adding one is an external dependency and needs
  owner sign-off per AGENTS.md.

---

## Recommended disposition

- **P1-1 blocks quality closure** for this journey and needs a product call on the matching
  rule (coordinate tolerance + case-insensitive label), plus a gate that would catch it.
- **P2-1** is a contained CSS fix (the dialogs should not depend on a reset injected by the
  shell they render before).
- **P2-2** needs an owner decision: cap the match distance and fall back to manual search, or
  accept and disclose the approximation.
- **P2-3** is a two-word fix (`updatePreferences({language: v})` in `chooseLang`) but touches
  the integration-owned shell, so it needs a reservation.
