# Ganak Website — Site Capability & Placement Register

**Status:** mandatory migration gate; site-wide authority above individual screen mockups
**Owner decision recorded:** 2026-08-13
**Scope:** current Ganak website capabilities, every repository backlog row and their
permanent home in the approved website information architecture.

## 1. Why this register exists

The screen-level migration contract prevented invented buttons, but it did not prevent a
working **site-wide** capability from disappearing when a prototype showed only one
screen. Calendar System exposed the defect: Ganak supports five calendar conventions and
preserves `cal` in URLs, yet every approved Figma screen omitted the control.

From now on, a screen is not implementation-ready merely because its visible controls are
mapped. It must also instantiate every shared capability required by its route class and
must inherit every applicable state key from this register. A missing inherited control is
a migration defect, not an aesthetic simplification.

## 2. Placement classes

| Class | Meaning | Examples | Prototype rule |
|---|---|---|---|
| **G1 · Global visible** | Available from every public website screen. | Primary navigation, language, Personalize. | Must be present through the shared site shell. |
| **G2 · Global contextual** | Shared state shown where users need to understand or change the current result. | Place, civil date, Calendar System, holiday overlay. | Use the shared context component on every applicable route; Personalize may store a default but cannot be its only home. |
| **G3 · Global preference** | Durable preference managed centrally, with contextual shortcuts where useful. | Comfort, light/dark, Guided/Expert, speaking rate, followed observances, privacy/data. | Personalize is the canonical management home; the content screen may expose a safe shortcut. |
| **J · Shared journey** | A destination or capability reached from several sections but not universal chrome. | Calendar/search, festival guide, Muhurat finder, calculator catalogue, feedback. | At least one clear internal home plus preserved deep links/back state. |
| **S · Screen-specific** | Meaningful only inside one job. | Prashna question, Muhurat purpose/range, chart style/ayanamsha, Festival Listen. | Appears only in the owning journey; never promoted to global clutter. |
| **N · Non-UI/platform** | Infrastructure or governance with no product control. | Domain, metadata, API deployment, ten-lane governance, performance profiling. | No decorative Figma control; document the operational owner/evidence. |
| **D · Deferred/omit** | Approved or candidate work that is not safely usable yet. | Push notifications, accounts, subscriptions, editorial platform. | Reserve its future home in this register, but do not show a working control before acceptance. |

## 3. Shared state and route inheritance matrix

`✓` means visible and changeable in context. `I` means inherited/preserved but normally
not shown as a top-level control. `—` means the value must not be implied to control that
journey.

| Route family | Language | Home place | Civil date | Calendar convention | Holiday overlay | Comfort/depth | Journey-specific state |
|---|---:|---:|---:|---:|---:|---:|---|
| Today / Panchang | ✓ | ✓ | ✓ | ✓ | ✓ | I | `screen=daily`, `date`, `cal`, `hol` |
| Festivals List/Calendar | ✓ | ✓ | ✓ | ✓ | ✓ | I | Festival view, month/year, search, follow-derived A/D |
| Festival guide | ✓ | ✓ | I | I | — | I | Canonical slug, guide intent, Follow, Listen, origin |
| Muhurat | ✓ | ✓ | ✓ | I | — | I | `muhurat`, `maction`, `mfrom`, `mto`, optional natal input |
| Prashna | ✓ | ✓ | I | — | — | I | Method, topic, question/number, fresh-result lifecycle |
| Jyotish / Matching | ✓ | I | — | — | — | I | Explicit birth place/date/time, `cstyle`, ayanamsha, panels, saved chart |
| Calculators | ✓ | I | — | — | — | I | Calculator slug and each calculator's explicit inputs |
| Personalize | ✓ | ✓ | — | **Default only** | **Default only** | ✓ | Preferences review/change/clear; consent state |
| Legal / Privacy / Feedback | ✓ | I | — | — | — | I | Consent/feedback payload only; no sensitive accidental context |

**Boundary rules**

1. A shared link's explicit `city/lat/lon/zone`, `date`, `cal`, `hol` or `lang` wins for
   that link without silently overwriting the stored default.
2. Calendar convention changes the naming/presentation system, not the underlying civil
   instant, place or astronomical timings.
3. Holiday overlays remain visibly distinct from calculated Hindu observances.
4. Jyotish birth place is an explicit chart input. Home place may prefill only when the
   user can see and change it; it never silently replaces a saved/cast birth place.
5. Prashna visibly names its inherited current place; changing global place changes the
   next calculation, not an already-issued result without a new user action.
6. Religious follow/tradition preferences remain local-first and never enter analytics or
   sync without explicit granular consent.

## 4. Shared components and permanent homes

| Capability | Class | Canonical website home | Contextual copies | State/behaviour that must survive | Acceptance proof |
|---|---|---|---|---|---|
| Product identity + Today/Festivals/Muhurat/Prashna/Jyotish | G1 | Shared site header | Compact mobile navigation | `lang`, place and applicable route state | Every destination + reload + Back/Forward. |
| Shared website footer | G1/J/G3 | Shared site shell after page-specific content | None; screens use one linked instance rather than local copies | `lang`; Back origin; only destination-applicable shared context; no sensitive route payload on legal/feedback links | Exactly one EN/HI component instance per public screen; real-route matrix; 320/390/768/1280px, keyboard and AA proof. |
| Language | G1/G3 | Header and Personalize | Content-level bilingual controls only where required | Current route and all meaningful inputs/results | EN↔HI route matrix; no reset or mixed-language shell. |
| Personalize | G1 | Header | First-run/parent setup and contextual Follow/Listen shortcuts | Approved `preferences` store | Review/change/clear; direct storage calls remain absent. |
| Place | G2/G3 | Shared Date & Calendar Context on Today/Festivals/Muhurat; default in Personalize | Visible inherited-place line in Prashna/Festival guide | `city`, `lat`, `lon`, `zone` | Change place, traverse routes, reload and return. |
| Civil date + previous/next/Today/direct entry | G2 | Shared Date & Calendar Context on Today/Festivals; date/range context on Muhurat | Festival occurrence/date; explicit birth date in Jyotish is separate | `date`; browser history | Invalid/far date, Today, Back/Forward, EN/HI, #58 boundary matrix. |
| Calendar System | G2/G3 | **Beside Date** in shared context component; default also reviewable in Personalize | Calendar view header | `cal` values: Amanta, Purnimanta, Gregorian, Tamil Thirukanitha, Bengali Vishuddha Siddhanta | Switch all five; place/date/lang persist; astronomy/timings invariant; disable/fallback remains truthful. |
| Holiday Overlay | G2/G3 | Same contextual calendar control group; collapsed/secondary by default | Calendar legend/markers | `hol`: off/national/gazetted | Discoverability EN/HI phone/desktop; no empty holiday card; URL restoration; #12 QA. |
| Sunrise/sunset/local-time context | G2 data | Shared context ribbon on date-dependent pages | Festival/Muhurat timing cards | Place, zone, date | Same fixture values or hide when unavailable. |
| Comfort/light-dark/depth/speech rate | G3 | Personalize | First-run choice; Listen controls | Approved preferences only | Presets, OS inheritance, AA, real-device follow-up under #46. |
| Followed observances/tradition | G3 | Personalize | Festival star/Follow; adaptive Festivals D | Local-first; no passive inference/sync/analytics | Add/clear; A↔D; privacy network audit. |
| Privacy, consent and remembered-data review | G3 | Personalize + public Privacy | Contextual consent only at actual sensitive contribution | Actual provider/config state | Wording matches network behaviour; review/clear; #38/#43. |
| Listen | J/S | Today Panchang, Festival story/vidhi and Muhurat content where supported | Personalize controls speech defaults | Language, voice availability, play/stop | EN/HI start/stop/error; no fake button. |
| Calendar/search/year | J | Festivals B + Panchang Calendar quick access | Festival discovery/search | Place, date, `cal`, `hol`, view/query | Search/year/open guide/Back; full list never hidden. |
| Feedback | J | Persistent truthful feedback entry/footer | Context may name originating route, never sensitive raw inputs by default | Provider availability + consent boundary | Delivery/error/network no-PII audit; absent/disabled truthfully until #38 configured. |
| Authentication/account | D | Future Personalize / account area | Optional Google login only when built | No content gating; deletion/recovery/sync | Omit until #55 accepted; no profile-looking fake control. |
| Reminder/share/export | S/J | Accepted Muhurat result; future calendar/guide actions | Never a generic global bell | Confirmed city/local window; no browser storage | #37 device import; #11 recurrence/DST/unsubscribe before broader exposure. |
| Global search | D/J | Future shared header/search destination | Guided empty states | Route/content index; no storage | Omit until #59 accepted; no decorative search field. |

## 5. Backlog-to-placement register — rows 1–61

Every backlog item gets a permanent destination even when it is operational or deferred.
“Future” reserves IA only; it does not approve a functioning prototype control.

| # | Capability | Placement class | Permanent website home / migration disposition |
|---:|---|---|---|
| 1 | Approved utility calculators | J | Jyotish → Tools catalogue; keep every permanent calculator route and footer fallback until nav parity passes. |
| 2 | Navadurga pages + Saptashati | J | Festivals search/calendar → canonical Navadurga guides and seasonal sequence. |
| 3 | All built Jyotish panels | S/J | Jyotish grouped navigation: Kundli, Dashas, Matching, Tools, Vault. |
| 4 | Answer-first Kundli interpretation | S | Jyotish Reading, before technical charts; hidden until owner content release gate clears. |
| 5 | Public developer API | N/J | Future Developers documentation; no consumer-app control until production API, keys and quotas exist. |
| 6 | Samskara Muhurats | S/J | Muhurat Finder activity catalogue and direct hydrated URLs. |
| 7 | Panchang intervals | S | Today → Panchang detail / daily decision windows; answer-first summary remains above. |
| 8 | Bala, Disha, regional timings | S | Today → Panchang detail / regional daily timings, progressively disclosed. |
| 9 | Siddhi/special-yoga calendars | J | Muhurat/Panchang detail → dedicated special-yoga calendar. |
| 10 | Calendar modes/regional bases | **G2/G3** | Shared Date & Calendar Context beside Date; stored default in Personalize. Never hide only in settings. |
| 11 | Calendar PDF/feed/reminders | D/J | Calendar view actions after PDF/ICS/Google Calendar/reminder acceptance; omit until built. |
| 12 | Holiday overlays | **G2/G3** | Shared contextual calendar group + calendar legend; no standalone empty card. |
| 13 | Bengal Durga Puja pages | J | Festivals → canonical six-day sequence/guides. |
| 14 | Skanda Sashti/Ayyappa sequences | J | Festivals → canonical sequence/guides; monthly Skanda Shashti remains distinct. |
| 15 | Eclipse visibility/Sutak | S/J | Astronomical events in Festivals; local visibility/Sutak on canonical eclipse guide and relevant Today context. |
| 16 | Marriage/engagement/housewarming Muhurat | S | Muhurat Finder categories and stable direct state. |
| 17 | Bhoomi/construction/business/travel/documents | S | Muhurat Finder categories and stable direct state. |
| 18 | Birth-chart-personalised Muhurat | D/S | Optional explicit advanced step inside Muhurat result; general result always remains available. |
| 19 | Medical Muhurat | S/J | Muhurat → Medical timing with safety wall first; direct route retained. |
| 20 | Planetary event calendars | S/J | Jyotish → Gochar/planetary calendars; relevant upcoming summary may link from Today detail. |
| 21 | Kala Sarpa/Pitra/Papasamyam | D/S | Jyotish → optional Doshas; omit unreleased analyses and retain non-fatalistic answer-first rules. |
| 22 | Chart styles + ayanamshas | S | Jyotish chart controls; Lahiri/mean nodes remains visible default, URL state retained. |
| 23 | Kundli/Match/PDF reports | S | Result-level Save as PDF/Print; never global calendar PDF. |
| 24 | Dashakoota/matching/marriage timing | S | Jyotish → Matching; qualified timing inside the result. |
| 25 | Prashna 1–249 | D/S | Prashna → clearly labelled alternative method; absent until source/engine approval. |
| 26 | Routes/metadata/sitemap/SEO | N | Platform registry and public route templates; no user-facing control. |
| 27 | Editorial publishing | D/J | Future Learn/Stories destination; no generated thin article cards before editorial platform. |
| 28 | Push notifications | D/G3 | Future Personalize → Notifications plus contextual reminder opt-ins; omit until service/scheduler/revoke works. |
| 29 | Festival/vrat direct-page coverage | J | Festivals List/Calendar/Search → canonical guides. |
| 30 | Ritu/equinox/Vedic clock | S | Today → Panchang detail / Season and Vedic Clock. |
| 31 | Property-purchase Muhurat | S | Muhurat Finder → Property with stable action/range state. |
| 32 | Vehicle-purchase Muhurat | S | Muhurat Finder → Vehicle with stable action/range state. |
| 33 | Sade Sati report | D/S | Jyotish → Tools when sourced report is integrated; no dead tile meanwhile. |
| 34 | Mangal Dosha three-reference | D/S | Jyotish → Tools/Doshas when integrated; preserve separate Lagna/Moon/Venus evidence. |
| 35 | Arudha/Bhavabala/Special points | D/S | Jyotish technical panels after presentation/anchor acceptance. |
| 36 | Ruling Planets | D/S | Jyotish KP/Prashna expert detail after source/rule approval. |
| 37 | Save/share/export Muhurat | S | Accepted Muhurat result only; explicit city/local-time confirmation before export. |
| 38 | Analytics + feedback | N/J/G3 | PostHog/Supabase platform seam; feedback entry + Personalize privacy controls only when configured and disclosed. |
| 39 | Branded domain | N | Deployment/canonical infrastructure; no UI control. |
| 40 | Route-aware identity/metadata | N | Shared route registry/shell metadata; no UI control beyond correct page identity. |
| 41 | Understand users without login | N/J | Moderated research + consent-safe analytics; feedback/research opt-in, never forced account. |
| 42 | Social/community channels | D/J | Future footer/community links only after owner accounts, rules and moderation exist. |
| 43 | Privacy and Terms | J/G3 | Public footer routes + Personalize Privacy & Data; must describe actual current behaviour. |
| 44 | Chhath verification | J | Existing four canonical Festival guides/sequence; no new navigation family. |
| 45 | Backend smoke check | N | Operations/CI evidence only. |
| 46 | Comfort/design system | G3 | Personalize + first-run/parent setup; all screens inherit tokens, scale, density, depth and AA rules. |
| 47 | Long-tail festival content | J | Same canonical Festivals registry/guides; no separate long-tail destination. |
| 48 | Everyday navigation/MuhuratHub cleanup | G1/J | Five-destination shared nav and answer-first route landing; no state reset. |
| 49 | Ten-lane governance | N | Repository task log/ownership/integration process only. |
| 50 | Broader interface languages | D/G1/G3 | Header/Personalize language system when full journeys exist; do not ship label-only languages. |
| 51 | Full regional-language calendars | D/G2 | Same shared Calendar System/context once complete language journeys pass. |
| 52 | Prashnavali | D/S | Future distinct Prashna method after approval/source; omit meanwhile. |
| 53 | Prioritise through feedback | N | Product operations/dashboard; no user-facing control beyond truthful feedback. |
| 54 | Android/iOS delivery | N | Native packaging/store work; website IA remains independent. |
| 55 | Accounts/cloud sync | D/G3 | Future Personalize/account; optional/additive, never gates free Panchang. |
| 56 | Saved charts/AI/subscriptions | D/S | Jyotish Vault/AI/purchase context only after account, billing and entitlement acceptance; Panchang never paywalled. |
| 57 | `sunSidMs` performance | N | Profiling/engine operations only. |
| 58 | Direct date entry/date picker | G2 | Shared Date control on Today/Festivals; Muhurat uses its explicit range inputs. |
| 59 | Global site search | D/J | Future header/guided search destination after complete route/content index. |
| 60 | Marathi/Bengali/Gujarati Aarti | D/S | Festival guide Aarti language control, independent from app EN/HI; staged review rules apply. |
| 61 | Native Aarti review | N | Human content-release gate; no separate UI destination. |

## 6. Prototype and implementation gates

Before any Figma screen or code slice is called ready:

1. identify its route family from §3;
2. instantiate every applicable G1/G2 component and preserve every `I` state;
3. show only accepted J/S actions with real destinations;
4. check every backlog row affected by the slice in §5;
5. prove there is no working current capability without an internal home;
6. prove no deferred item appears as a functioning control;
7. verify the canonical data fixture, EN/HI, keyboard, comfort and responsive states;
8. record old entry → new entry → state proof before removing any legacy presentation.

The shared-component audit must fail if a date/calendar-dependent approved frame lacks
the Date & Calendar Context component, or if a detached/copy-pasted context group silently
diverges from the component source. It must also fail when a public approval frame lacks
the shared Website footer, contains more than one footer, detaches/rebuilds the footer
locally, or exposes a footer label without a real mapped destination.

## 7. Figma shared-context evidence — 2026-08-13

The editable visual master now implements the G2 rule rather than leaving it as prose:

| Artifact | Figma node | Evidence |
|---|---:|---|
| Shared component page | `204:2` | Dedicated page `Component — Website date & calendar context`. |
| Shared component | `206:135` | `Website / Date & Calendar Context`, built from the approved floral ribbon rather than a generic UI kit. |
| Editable properties | `Place#206:0`, `Date#206:1`, `Calendar context#206:2`, `Sunrise#206:3`, `Sunset#206:4` | Place, date, calendar/holiday state and solar times remain screen-instance data; floral artwork and geometry remain governed by the component. |

The component is instantiated exactly once on every currently approved website prototype:

| Approved screen | Frame | Shared instance |
|---|---:|---:|
| Today — special/festival/fast | `104:49` | `208:49` |
| Today — ordinary | `116:49` | `209:135` |
| Festivals A — default list | `135:50` | `209:222` |
| Festivals B — Calendar | `135:254` | `209:309` |
| Festivals D — returning personalised | `135:662` | `209:396` |
| Festival Detail 1 — normal festival | `135:866` | `209:483` |
| Festival Detail 2 — story | `135:1089` | `209:570` |
| Festival Detail 3 — vrat/fast | `135:1312` | `209:657` |

**Audit result:** 8/8 frames contain one instance of component `206:135`; 0 legacy
copy-pasted context ribbons remain; every instance stays at `x=0`, `y=97`,
`1536×132`. Full-frame screenshot QA found no overlaps, clipping, shifted content or
decorative-art mutation. The canonical special-day frame remains internally consistent:
Devshayani Ekadashi, Shukla Ekadashi/Ashadha and Saturday 25 July 2026.

## 8. Figma shared-footer evidence — 2026-08-16

The approved footer is now a reusable bilingual site-shell component rather than a local
Full Panchang drawing:

| Artifact | Figma node | Evidence |
|---|---:|---|
| `Website footer` component set | `349:14` | One master with a `Language` variant axis. |
| English / Hindi variants | `349:2` / `349:8` | Identical geometry, pale-white `color/surface` binding and complete approved floral ending; warm-ivory `color/bg` is forbidden for this component. |
| Full Panchang EN / HI instances | `351:178` / `351:184` | Linked instances in frames `290:794` / `320:2`; old local footer and floral copies removed. |

The component currently proves architecture on those two approval frames only. All other
approved prototypes and the production website remain pending until they instantiate the
same shared component and their visible links have real destinations. The full behavioural,
responsive and no-fake-link rules live in the migration contract's **Shared website footer**
section.
