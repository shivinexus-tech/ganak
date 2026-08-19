# Ganak Redesign — Requirements (master doc)

**Owner:** Shivie · **Maintained by:** Claude + Codex · **Started:** 2026-07-30
**Status:** requirements-gathering — *lock this before building further.*

> This is the single source of truth for the Ganak UI redesign. It consolidates the
> whole discussion to date. Companion docs feed into it:
> [`ganak-product-direction.md`](ganak-product-direction.md) (strategy/direction),
> [`ux-ia-audit.md`](ux-ia-audit.md) (detailed findings). **Open items are marked
> `⬜ DECISION` — the owner resolves those; everything else is agreed.**

---

## 1. Why we're doing this

Ganak is **built but not usable or lovable.** It's technically excellent (accurate
engine, deep content, bilingual, private) but behaves like an **almanac** — a
reference instrument that dumps correct data — when users want a **guide**: a
companion that knows who they are, tells them what today means for them, and leads
them to what matters. That gap causes both "everything is confusing" and "a user
wouldn't feel connected." The redesign fixes structure **and** connection **and** the
visual identity.

## 2. Goals / non-goals

**Goals**
- Make the app *usable* (clear IA, real navigation, consistent interaction).
- Make it *lovable* (leads with meaning, feels sacred, feels personal).
- A fresh visual identity that is warm and alive — not the current dull theme.
- A phone-first first release that remains a real, responsive website on desktop.
- Launch **Ganak Panchang** and **Ganak Jyotish** visibly together under one Ganak
  navigation, with different depth and jobs but one trusted brand.

**Non-goals (now)**
- Rebuilding/altering the astronomy engine or content accuracy.
- Native mobile apps (later, after web proves out).
- Monetization features (later, narrowly — see §5).

## 3. Platform & priority  `(owner directive 2026-07-30)`

- **The website/web app is the first delivery platform.** Native Android and iOS
  applications come later.
- **The first release is phone-first** (✅ owner-confirmed 2026-07-30): primary
  journeys, hierarchy, touch targets and persistent navigation are designed and
  validated on a phone first.
- Phone-first does not mean desktop is a stretched mobile column. The same website
  must adapt into a genuine desktop layout (audit issue #7), using wider layouts and
  persistent navigation where they improve comprehension.
- Mobile web and desktop web must expose the same complete Phase-1 journeys; neither
  is a reduced-content edition.

## 4. Target users & positioning

Ganak has two visible, connected zones with different primary jobs:

### 4.1 Ganak Panchang

- **Primary user (✅ owner-confirmed 2026-07-30): the everyday devotee** — observes
  festivals/fasts and wants clear guidance ("what's today, what it means, what to
  do"), with technical depth available but not forced.
- **Highest-propensity first subgroup:** observant Hindu households outside India
  (US, Canada, UK, Europe, Australia, Gulf and other supported places). Their pain is
  sharper because an India date, temple message or family WhatsApp timing may not
  apply in their city.
- **India scale audience:** the household Panchang keeper who values a fast,
  regional, ad-free answer that is easier to understand and share than existing
  alternatives.
- **Adjacent growth audience:** second-generation diaspora Hindus, people
  reconnecting with their family tradition, Hindu parents teaching children, and
  sincere Hinduism learners who need respectful story, terminology and practical
  context. Interest alone may create discovery; recurring observance is the stronger
  retention signal.

### 4.2 Ganak Jyotish

- **Primary depth user:** the serious Jyotish learner who currently combines multiple
  free tools, wants transparent calculations plus explanation, and repeatedly studies
  personal or family charts.
- **Higher-value power user:** the practising astrologer, teacher or advanced
  practitioner who needs a dependable chart library, notes, comparison, export,
  rectification, Prashna/KP and technical audit workflow.
- Practitioners are not forced through a beginner-only product. Jyotish remains
  visibly discoverable and uses progressive disclosure within each report: a clear
  verdict first, calculation evidence and specialist detail behind it.

### 4.3 Shared positioning

- **Positioning:** Ganak helps Hindu households everywhere follow the sacred calendar
  in their own place—and opens into a serious Jyotish workspace when they want to go
  deeper.
- **Wedge:** accuracy is table stakes (competitors like Drik match it); Ganak wins on
  **meaning + warmth + local relevance + privacy + depth when requested**.

## 5. GTM, adoption and business model

### 5.1 Product and launch strategy

- Free to start; gather heavy feedback; let real repeat usage guide the roadmap.
- Web app first; native Android/Apple later.
- **Both zones launch visibly together under one Ganak navigation** (✅
  owner-confirmed 2026-07-30): Daily/Panchang, Festivals/Vrats, Muhurat, Prashna and
  Jyotish are all discoverable in Phase 1. Panchang leads the everyday experience;
  Jyotish is not hidden or deferred.
- **Hard rule: never ads on the Panchang section.**
- Do not claim spiritual endorsement, regional authority or superiority to Drik until
  named reviewers and production evidence support the exact claim.

### 5.2 The adoption wedge

The first devotional adopter is the **diaspora household Panchang keeper**: someone
whose household needs local dates/timings, practical English or Hindi explanation and
the Indian family/regional context. Ganak's first diaspora promise is:

> **Follow your tradition where you live.**
> Local Hindu dates, timings and observance guidance for your city.

India remains the primary scale market. The India promise is:

> **Today's Panchang, clearly explained.**
> The date, meaning and next step—without clutter.

The first premium adopter is the **serious Jyotish learner**, followed by the working
practitioner. They pay for an ongoing workspace and time saved, not for astronomical
numbers that are already free elsewhere.

### 5.3 Beta, early adopter and power-user definitions

- A **beta user** is deliberately recruited before broad promotion, completes real
  tasks and reports problems. Recruitment alone is not proof of adoption.
- An **early adopter** chooses Ganak for a real need, then returns on another date,
  uses another journey, saves useful work, shares a page or submits useful feedback
  without being chased.
- A **devotional power user** returns across at least three weeks, follows multiple
  observances and meaningfully uses date/place/calendar or sharing.
- A **planning power user** completes repeated real Muhurat journeys and revisits or
  shares a result.
- A **Jyotish learner power user** maintains multiple charts and repeatedly uses
  dashas, transits, divisional charts, comparison or study notes.
- A **professional/validator power user** uses the technical workspace across many
  charts and supplies reproducible corrections or source-backed observations. High
  pageviews caused by confusion do not qualify anyone as a power user.

The private beta must test both zones, not only Panchang:

| Cohort | Target |
|---|---:|
| India household Panchang keepers | 10 |
| Diaspora household Panchang keepers | 8 |
| Frequent vrat observers | 5 |
| Adults aged 50+ | 3 |
| Temple/community calendar volunteers | 2 |
| Serious Jyotish students | 6 |
| Informal/family astrologers | 3 |
| Working astrologers or teachers | 3 |

### 5.4 Retention ("stickiness")

**Website retention** comes from being faster than repeating the same Google search:
remembered place/language/tradition, a useful Today summary, the next relevant
observance, permanent local pages, direct date entry, shareable answers and explicitly
saved local charts.

**Future native-app retention** comes from capabilities that earn interruption:
selective festival/vrat/paran reminders, a Today widget, offline essentials, saved
chart vault, personal transit/dasha alerts, Jyotish journal and quick chart/Prashna
workflows. Generic daily "open the app" notifications are not a requirement.

### 5.5 Monetization boundary

**Ganak Panchang is the free trust, acquisition and sharing layer.** Core Panchang,
festival/vrat dates, essential local timings, core vidhis/aartis and everyday
explanation are not paywalled.

**Ganak Jyotish is the prospective revenue layer.** Phase 1 proves demand before
pricing. Potential later paid value includes:

- cloud sync and cross-device chart access;
- a larger organised chart/client library;
- personal transit and dasha dashboards;
- chart comparison, study notes and professional exports;
- selected advanced analysis, rectification and KP workflows;
- premium family/practitioner workspaces; and
- metered AI chart questions or generated reports where each use has a real cost.

Basic chart calculation and explicitly saved on-device charts are not artificially
crippled to create a paywall. Subscription tiers, prices and paywalls remain
⬜ **DECISION after beta evidence and willingness-to-pay interviews**. No lifetime
pricing promise during the learning period.

## 6. Information architecture (requirements)

- **Real top-level navigation.** Both Ganak Panchang and Ganak Jyotish launch visibly
  under one Ganak navigation. The final phone tab set and the exact relationship
  between **Today** and **Full Panchang** remain ⬜ **DECISION after competitor,
  GTM/SEO and phone-prototype review**.
- **Persistent navigation** on every screen (no scroll-to-top to switch). On web this
  may be a top/side navigation; on mobile it is likely a bottom bar with no more than
  five primary destinations.
- **Kill the "Daily" mega-scroll.** Home is a lean "today" summary that *links out* to
  each section as its own destination. Panchang detail (hora, yogas, season clock,
  planetary events) lives inside Panchang, not on the home dump.
- **SEO and app navigation are separate constraints.** Full Panchang, date pages,
  festivals, Muhurat categories and Jyotish tools retain permanent, descriptive,
  crawlable routes even if every route is not a phone bottom-tab item. Global search
  helps users but does not replace direct links and category navigation.
- **One home per feature — remove duplicates.** Muhurat: one home (retire the inline
  Daily finder OR the separate MuhuratHub — pick one). Festivals: one system across
  list + calendar + search + guide pages.
- **One consistent interaction rule:** *tap a thing → open its detail.* Fix the dead
  calendar/search rows (logged bug).

## 7. Experience principles (functional requirements)

1. **Knows me** — a light setup captures language, home place, region/tradition and
   related non-sensitive preferences once and honors them everywhere (calendar
   naming, festival set, tone, hora personalization). These approved preferences are
   remembered locally on that device; the user can review, change or clear them. A
   shared URL's explicit place/date/language overrides the saved default without
   silently rewriting it. No re-asking per module.
2. **Leads** — every screen foregrounds the 1–2 things that matter now; everything
   else is demoted or one tap away. No flat walls of equal-weight modules.
3. **Means something** — every decision-critical result or technical section is
   paired with plain-language meaning and, where relevant, a suggested action.
   Individual values may remain in expert detail rather than creating a wall of
   repetitive explanations. Jargon (KP sub-lords, ghati/pal, raw nakshatra data) is
   **depth-on-demand**, never the unexplained default surface.
4. **Feels sacred** — warmth, reverence, story and imagery woven into the *daily*
   experience, not reserved for festival pages.

## 8. Functional requirements by section

- **Home ("Today, for you")** — leads with the day's meaning (tithi/festival + why it
  matters + fast status), a "what matters now" window list (Abhijit / Rahu Kalam /
  next good window), meaning-first tithi & nakshatra with depth-on-demand, "coming up"
  festivals, a personalization strip, and a quiet link to full panchang.
- **Panchang (detail)** — the full almanac: hora, yogas, season/Vedic clock, planetary
  events, all panchang fields. Home's "full panchang" link lands here. Practitioner
  depth lives here.
- **Festivals** — one unified system: personalised list, full-year calendar, and
  search — **all rows open the festival's guide page** (real art where available).
  Guide pages lead with story/meaning, then local timing, then vidhi.
- **Muhurat** — one canonical finder: pick activity → date range → ranked best days;
  plus "is now good for X?" for today. Remove the split between inline and hub.
- **Jyotish** — chart casting, saved charts, and Kundali matching, sub-navigated
  rather than stacked on one page. Pressing **Calculate** creates a temporary chart;
  it is not retained after the session. The user must actively press **Save on this
  device** to retain it. A saved chart is clearly labelled and supports Rename,
  Export and Delete. The UI explains that clearing browser/site data removes local
  charts. Account-based cross-device sync comes later.
- **Prashna** — keep the current clean design; conform only its shell to the new system.

## 9. Content & tone requirements

- **Meaning-first, plain language**; technical/Sanskrit terms glossed or behind
  depth-on-demand.
- **Bilingual EN/HI** everywhere (as today); language choice honored across the app.
- **Festivals as stories**, not just timetables — lead with why the day matters.
- Warm, devotional, reverent voice — not encyclopedic mechanism-explaining.

## 10. Visual / theme requirements  `LOCKED BASELINE — later decisions recorded per frame`

The earlier theme-option decision is closed. The owner-approved website baseline is
recorded in [`ganak-figma-authority.md`](ganak-figma-authority.md) and the machine-
readable [`ganak-figma-prototype-state.json`](ganak-figma-prototype-state.json).
Those later approvals supersede this document's original July 30 note that the theme
was unsettled.

- The editable Figma file `ynavdn3IEdBoGsIP43c4bD` is the website visual master.
- The approved direction is a light, pale-blue-and-white devotional shell with
  deep-navy ink, crimson action, antique-gold structure and restrained botanical
  green/floral ornament. It is warm and alive without becoming a saturated or dark
  jewel theme.
- Ornament is structural: ribbon, frame, transition, niche or footer. Do not paste
  isolated flower clusters onto unrelated layouts or invent a second ornamental
  vocabulary per screen.
- Approved components, variables and typography are inherited; a screen may not
  redraw them locally merely to move faster.
- `EXPLORATION`, `OWNER REVIEW`, `APPROVED` and `REJECTED` are distinct states.
  Exploration and rejected frames are never implementation sources.
- An owner approval applies to the exact named frame/component and its recorded
  scope. It does not silently approve unrelated screen changes.
- The website remains legible for dense practitioner information, responsive from
  phone to desktop, bilingual, imagery-forward, accessible and restrained.

The preservation contract and placement gate are canonical at
[`ganak-website-migration-contract.md`](ganak-website-migration-contract.md) and
[`ganak-site-capability-placement-register.md`](ganak-site-capability-placement-register.md).

## 11. Non-functional requirements

- **Privacy and local memory:** core calculations remain on-device and no account is
  required. Approved non-sensitive preferences may be remembered locally. Birth
  charts are retained only after the explicit Save action described in §8; never
  automatically.
- This owner-approved requirement intentionally replaces the project's blanket
  browser-storage ban for only these scoped uses. Before implementation, the shared
  engineering convention and privacy gates must be updated to permit an auditable
  preference store and explicit saved-chart store—not arbitrary feature storage.
- **Disclosed analytics:** Ganak may use owner-approved, privacy-controlled PostHog
  analytics and Supabase feedback/research storage. Public privacy wording must
  describe actual production behaviour; the product must not claim "no tracking"
  after analytics is enabled.
- **Behavioural Prashna/Jyotish analytics may include:** completion, selected category,
  language/mode, broad result class, interpretation/detail opens, repeat use, chart
  tool usage and errors.
- **Sensitive content boundary:** raw Prashna question text, names, birth details,
  precise free-text feedback and full personal interpretations are not automatically
  sent to PostHog. A user may separately choose **Share this anonymous question to
  help improve Ganak**; only then may that research content enter a protected
  Supabase dataset under the disclosed consent and deletion policy.
- **Accuracy:** must not regress the engine or timings.
- **Responsive:** phone-first first release; complete and intentionally adapted on
  desktop.
- **Accessibility:** legible contrast, keyboard focus, touch targets.
- **Performance:** fast first paint; heavy modules lazy where possible.
- **Code ownership:** multi-agent repo — one-writer-per-module, scoped commits,
  `git fetch` before trusting main (main auto-deploys to production).

## 12. Do-not-break (assets already good)

Engine accuracy · content depth · bilingual · privacy stance · Prashna screen ·
festival guide content · the real deity-art pipeline
(`festival-images-src` → `npm run festival-images` → `raster/*.webp`).

The redesign also preserves these standing interaction and calculation contracts:

- no state reset without a user action;
- the user can always tell what the app is doing, including visible errors;
- every surface follows the EN/HI language choice;
- answer-before-data and summary-first/detail-on-demand hierarchy;
- permanent festival, calculator and shared-result routes remain valid;
- Lahiri ayanamsa and mean Rahu/Ketu remain the Panchang/Kundli defaults unless a
  specialist screen explicitly and visibly requires another convention; and
- no redesign changes religious dates, timing rules or engine behaviour as a side
  effect.

## 13. Open decisions (owner resolves)

- ⬜ **Theme** — choose from the option set Claude will present.
- ⬜ **Which existing UI decisions to preserve** — owner to list.
- ✅ **Panchang primary user** = everyday devotee; diaspora household Panchang keeper
  is the first adoption wedge; India household keeper is the scale audience.
- ✅ **Jyotish depth user** = serious learner, with practitioners as the prospective
  higher-value power-user segment.
- ✅ **Both Panchang and Jyotish launch visibly together** under one Ganak navigation.
- ✅ **First release is phone-first;** native Android/iOS packaging remains later.
- ⬜ **Final phone navigation and Today/Full-Panchang relationship** — compare no more
  than five primary phone destinations using competitor, GTM/SEO and prototype
  evidence. Full Panchang retains its own crawlable route regardless of tab choice.
- ⬜ **First screen to prototype** — recommend phone-first Today + global navigation
  shell, including the entry to Full Panchang and visible Jyotish.
- ⬜ **Muhurat consolidation** — which of the two existing surfaces is canonical.
- ⬜ **Paid packaging and price tests** — decide only after beta retention and
  willingness-to-pay evidence; Panchang basics remain free and ad-free.

## 14. Working agreement (how we proceed)

- **Requirements-first:** lock this doc before building further.
- **Big design/direction choices → options → owner picks** (e.g. theme).
- **Micro display/layout choices → Claude decides and shows** (owner reacts/overrides);
  no A/B/C questionnaires per widget.
- **Prototype → approve → port** into the live app screen by screen. **Web app first.**
- The web app is the first platform, but the first release experience is
  **phone-first**. Desktop adaptation is part of the same release.

### 14.1 Who decides what

The owner is not expected to become a UI specialist or choose every design value.
Decisions are divided by the kind of judgment they require:

| Decision type | Lead | Examples |
|---|---|---|
| Product intent | Owner | Audience, priorities, religious tone, free/paid boundary, what Ganak should feel like |
| Major experience direction | Agent recommends; owner chooses | Navigation model, Today/Full-Panchang relationship, theme family |
| Design-system and implementation detail | Agent decides and demonstrates | Type scale, spacing, button dimensions, panel padding, responsive breakpoints, component states |
| Evidence-driven usability | Representative users, synthesised by agent | Whether people find Festivals, understand labels, change place or complete a task |

The owner may express reactions in ordinary language ("too dark", "too corporate",
"I cannot tell what to tap", "sacred but old-fashioned", "overwhelming"). The agent
translates that feedback into concrete design changes; specialist design vocabulary
is never required.

If the owner has **no opinion**, the agent chooses and explains the recommended
default using phone usability, elder accessibility, consistency and Ganak's identity.
Multiple options are reserved for choices that materially change the product—not
minor values such as 16px versus 20px padding.

### 14.2 Decision method for every major UI question

1. **Frame one meaningful question**, not a bundle of unrelated preferences.
2. **Investigate first:** current Ganak behaviour, competitors, phone constraints,
   accessibility, SEO/GTM effects and previous owner decisions.
3. **Present no more than 2–3 coherent options**, each with benefits, risks and
   consequences—not disconnected color swatches or widget variants.
4. **Recommend one option clearly.** Do not make the owner infer the professional
   recommendation from a neutral list.
5. **Collect the owner's reaction** in whatever language feels natural; combine or
   reject options when appropriate.
6. **Prototype the consequential choice** with real Ganak content. Visual decisions
   are not locked from prose alone.
7. **Validate risky interaction choices** with representative users and observable
   tasks. Owner taste sets direction; testing verifies usability.
8. **Record the decision and evidence** in this master document before production
   implementation.

### 14.3 Brainstorming sequence

Brainstorm and lock the redesign in this order:

1. Complete screen map and feature ownership.
2. Five-destination phone navigation and Today/Full-Panchang relationship.
3. Today screen information hierarchy: immediate, one-tap and expert-only content.
4. Three complete visual directions applied to the same real Today screen.
5. Owner-selected visual direction.
6. Typography, spacing, color, button, panel and component system.
7. Remaining key-screen prototypes: Full Panchang, Festivals/guide, Muhurat,
   Jyotish home/report and Prashna shell.
8. Representative-user validation, corrections and owner approval.
9. Screen-by-screen production port with existing validation and live verification.

Do not start by choosing isolated colors, fonts or buttons before the information
architecture and Today hierarchy are settled. Visual polish must be applied to a
coherent structure.

### 14.4 Immediate next brainstorming decision

The first design round will compare up to three evidence-backed phone-navigation
models. Every model must:

- keep Ganak Panchang and Ganak Jyotish visibly discoverable;
- support both Today and Full Panchang without recreating the mega-scroll;
- fit no more than five persistent phone destinations;
- provide clear homes for Festivals, Muhurat and Prashna;
- preserve permanent crawlable SEO routes even when a route is not a bottom-tab item;
  and
- explain its desktop adaptation.

The agent will provide a recommendation. The owner may choose, combine, reject or
react without needing to justify the decision in technical design terms.

## 15. Discussion log (so nothing is lost)

- Fixed the crude festival hero art: removed the SVG placeholder system entirely,
  wired real raster art; Diwali + Ganesh/Sankashti live; deity-art pipeline in place.
- Navadurga pages now lead with their real art; duplicate image removed.
- Ran a live UX/IA audit → spine problem (inverted IA, Daily mega-scroll) + 8 systemic
  issues + screen-by-screen.
- Deeper analysis: **instrument vs companion**; 7 reasons it doesn't connect; four
  things connection requires.
- Consolidated strategy/GTM + direction; chose **"Sacred & alive"** feeling.
- Built a first home+nav prototype (dark jewel) → owner: "just OK, too dark," **site
  must come first**, **theme via options**, **document requirements first** → this doc.
- Owner confirmed the requirements follow-up: non-sensitive preferences are
  remembered locally; charts save only on an explicit Save action; behavioural
  analytics is allowed; raw Prashna/question content is consent-gated into protected
  research storage rather than PostHog.
- Owner corrected the first-release priority to **phone-first** while keeping the web
  app as the first platform.
- Competitor/GTM/SEO review found that the personalised Today experience is primarily
  a retention surface while permanent Panchang, festival, Muhurat and Jyotish routes
  are acquisition surfaces. Final Today/Panchang phone navigation remains open for a
  prototype decision; search does not replace crawlable navigation.
- GTM refinement: Ganak Panchang is the free trust/reach layer; Ganak Jyotish is the
  prospective paid depth/workspace layer. Both launch visibly together. Diaspora
  households are the sharp first Panchang wedge; India is the scale market; serious
  learners and practitioners are the prospective premium segment.
- Owner and Codex agreed on the redesign decision method: owner controls product
  intent and major direction; the agent recommends evidence-backed options and owns
  micro design-system decisions; representative users validate risky interactions.
  Brainstorming proceeds from phone IA → Today hierarchy → complete visual directions
  → design system → remaining screens, rather than asking the owner to choose every
  spacing, font or component value.

---

## 16. India revenue model  `(owner: "not okay with zero India revenue" — 2026-07-30)`

**Principle:** India will not pay for a *daily panchang* (free cultural good, replaced
by family/word-of-mouth/aarti books). But India **does** pay around **big life-events**,
for **professional work**, and via **businesses**. Monetize those; never the daily
glance. **No "talk to an astrologer", no gemstones** (owner constraint).

- **16.1 Event-anchored premium artifacts — India *consumer* money.** Indians spend
  heavily on weddings, griha pravesh, naming, vehicle/shop openings. A beautiful,
  personalized, shareable **muhurat report / PDF** for such an event (auspicious
  windows + reasoning + do's, elder-credible) is a **₹99–999 one-time** purchase at a
  moment of high willingness. It is *software output*, not a consultation — inside the
  rules. Candidates: Vivah, Griha Pravesh, Naamkaran, Vahan, business opening, Mundan.
  *Caveat:* some buyers still want a human blessing — pairs well with the creator
  champion (§17.2), whose endorsement makes a computed muhurat feel trustworthy.
- **16.2 Engine-as-API (B2B) — the scalable India money.** License the accurate engine
  to businesses with scale: matrimony (Guna Milan), wedding/event platforms (muhurat),
  content/media (festival dates), temples. Per-call / per-licence; geography-agnostic;
  leans on the crown-jewel engine; no consumer UI needed. Biggest, most defensible.
  *Note:* B2B is a different motion (sales, contracts, docs), not self-serve.
- **16.3 White-label / embeddable widget.** Paid "today's panchang / festival" widget
  for temple sites, community orgs, regional media, priests' pages. B2B2C.
- **16.4 Prosumer tool for working astrologers/priests.** Excellent tool + client chart
  vault + branded PDF reports they hand clients; a business expense that makes them
  look professional. Modest but steady.

**Weighting:** 16.2 (API) = biggest India money; 16.1 (event artifacts) = most
promising India *consumer* revenue and novel vs Drik; 16.3/16.4 = side income. **Daily
Panchang stays free, always.**

## 17. Distribution & credibility  `(the actual make-or-break)`

Product quality is necessary, not sufficient. Drik won on **regional languages + SEO +
word of mouth + spiritual-influencer endorsement** over a decade. Ganak has none at
scale yet. Distribution is a **workstream**, not "gather feedback."

- **17.1 Shareable local pages — the diaspora WhatsApp loop (agreed, let's try).**
  Loop: user finds *their city's* festival date/timing/ritual → forwards to family
  WhatsApp → recipient taps → sets *their* city in one tap → forwards again.
  Requirements (first-class, not afterthought):
  - Tapping **Share** generates a **beautiful image card** with facts baked in ("Diwali
    in Dallas · Oct 20 · Lakshmi Puja 6:04–7:38 pm") — readable without clicking + link.
  - **Rich link previews (Open Graph)** so WhatsApp/iMessage render a gorgeous card.
  - Every page = **permanent, city-aware, crawlable URL** (doubles as SEO — found via
    Google first, then shared).
  - Recipient **sets city in one tap** and instantly sees their own version — zero
    friction, or the loop dies.
  North-star: **viral factor** = new city-sets per sharer from shared links; >~1
  compounds. Fires only if content is better AND sharing is effortless AND recipient
  onboarding is instant — all three, or none.
- **17.2 Creator/practitioner champion — a workstream, not luck.** Target **mid-tier**
  (10k–200k) devotional/astrology creators; give them the pro Jyotish tool free +
  co-branding + referral revenue share; they use it on-camera → their audience = first
  paying Jyotish users + credibility halo. The champion is often also a B2B/pro user —
  champion, power-user and revenue can be one person. *Caveat:* the tool must be
  genuinely excellent first; endorsement amplifies whatever exists, good or bad.
- **17.3 Regional-language gap.** EN/HI only is a real disadvantage vs Drik's regional
  coverage — matters for India reach and diaspora regional families. Roadmap item
  (Phase 2 languages).
- **17.4 SEO.** Permanent crawlable pages for every festival / date / city / tool are
  the acquisition half. In-app global search must **not** replace crawlable public
  routes.

## 18. Success metrics  `(how we know the redesign worked)`

- **18.1 Redesign usability bar — cheap, no analytics (watch ~5 real users):**
  - **Task success:** ≥4/5 first-timers complete "find the next festival + say what to
    do" unaided.
  - **Time-to-answer:** median < ~60s to today's key info / next festival.
  - **Not-lost:** users can say where Festivals / Muhurat live and get back home.
  This is the bar that unlocks "redesign done." Five moderated sessions beat any dashboard.
- **18.2 Ongoing metrics — needs analytics (now permitted):**
  - **Engagement:** return rate on a *different* date (7/28-day); sections per session;
    depth-on-demand opens; % who set city/tradition ("knows me" adoption).
  - **Distribution:** shares per active user; shared-link CTR; **viral factor**; organic
    (SEO) landings.
  - **Money (later):** Jyotish free→save→return; event-report purchases; B2B/API leads.
  Keep to ~3 north stars (engaged returning users who set a city; viral factor;
  task-success) — not a wall of charts.

## 19. Corrections & decisions — 2026-07-30  `(appended by Claude; Codex please merge)`

- **Scope split (agreed).** Separate a lean **"UI redesign requirements"** (what we must
  decide to start fixing the UI) from **"business strategy"** (money, beta, analytics,
  distribution). The UI redesign can start before the business half is finalised. The
  physical file split is a **coordinated step** (to avoid colliding with Codex's edits).
- **"No tracking" clarified.** Owner is **not** advertising "no tracking." Privacy /
  on-device is a *feature*, **not a marketing wedge** — remove "privacy" from the
  competitive *wedge* in §4.3/§5. Analytics (PostHog/Supabase per §11) is permitted;
  keep §11's rule that public wording must match real behaviour.
- **India revenue** — see new §16 (owner is not okay with zero India revenue).
- **Nav math (§6/§13)** — **still open, needs brainstorming.** 5 phone tabs + Panchang/
  Festivals/Muhurat/Jyotish/Prashna leaves no slot for Today/Home. Options to explore:
  Today = the Panchang tab's default view; or fold Prashna under Jyotish; or Today as a
  center home with four others. Resolve before the nav prototype.
- **Platform clarified.** "Phone-first" = the **live website on a mobile browser** is the
  priority (native app deferred — store approvals are slow). Desktop = same site adapting.
- **Jyotish willingness-to-pay** — treat *learner* revenue as "maybe"; the bankable payer
  is the working practitioner (business expense) + event-anchored artifacts (§16.1).
  Validate before building paid features.

---

## 20. Third persona + personalization model  `(2026-07-30)`

### 20.1 The astrology enthusiast (new named persona)

Between the everyday devotee and the serious Jyotish learner/practitioner sits a third,
under-counted persona — the **astrology enthusiast**: not a chart-casting professional,
but someone who *enjoys the sky* — nakshatra-change times, upcoming transits, hora, their
rashi — and will **scroll the detail for pleasure** and return daily to check it.

- **Why it matters:** strong **retention** hook (daily sky-watching) and the natural
  **upsell into paid Jyotish**. The depth is a *delight* for this segment, not
  "practitioner tolerance."
- **Founder note (guard-rail):** the owner *is* this persona — which is likely **why the
  app became a 14-module data-dump** (built to enthusiast taste). Discipline: build the
  **lean home for the everyday-devotee majority you are not**, and a **rich scrollable
  depth surface for the enthusiast you are** — *separately*. Enthusiast detail must never
  leak back onto the devotee home; it lives one tap away in **Full Panchang** (see §21).
- **Design consequence:** **Full Panchang** is reframed from a dumping ground into a
  *deliberately delightful, scrollable "the sky today"* surface (nakshatra timeline,
  upcoming transits, hora) — the enthusiast's home, and a Jyotish on-ramp.

### 20.2 Personalization model — "follow what you keep, not what you are"

- **No sect quiz.** Most Hindus are syncretic ("just Hindu" — some Ekadashi, some Pradosh,
  some Shakta tithis). Asking "which sampradaya?" is unanswerable, forces a false identity,
  and would hide observances people actually keep. **Personalize by observance/deity, not
  by sampradaya.**
- **Never hide — additive only.** The hide-error is asymmetric: dropping an observance
  someone keeps is far worse than showing one they don't. Personalization = **promote +
  remind** what you follow; the rest stays visible/browsable. **Never subtractive.**
- **Inclusive tiered default, no setup wall.** A new user immediately sees region-aware
  common observances (major → browsable), zero questions. Personalization is *optional
  tuning on top*, never a precondition.
- **Soft handle = ishta-devata, not sect.** If anything is asked, ask warmly and
  multi-select: *"who do you pray to?"* (Shiva · Vishnu · Devi · Ganesha · Hanuman · "the
  big festivals" · "a bit of everything"). Each deity implies a set of observances.
- **Learned, not configured.** Grown via **just-in-time asks** ("Ekadashi tomorrow — keep
  this fast? Remind me / Not for me") + optional light preset + quiet behavioural learning.
- **Sequencing (⬜):** personalization is a **v2** for devotees — ship the inclusive tiered
  home + one lightweight just-in-time ask first; defer presets/learning until retention is
  real. (Cheapest test: ask the WhatsApp group / relatives "do you filter a panchang, or
  scroll and pick?")
- **Privacy:** tradition/deity is GDPR special-category (religious belief) — **local-first,
  never synced/analyzed without explicit granular consent** (ties to the storage adapter +
  consent model).

## 21. Today screen hierarchy — LOCKED  `(2026-07-30)`

Screen job: *"tell me what today means for me and the one thing to do — fast — and make me
feel my tradition."* Kills the 14-module mega-scroll. Resolves the §13 "first screen"
item's content.

**Tier 1 — IMMEDIATE (the glance, above the fold)**
- **Frame:** place · date. *(Tradition/deity works silently behind the content; a quiet
  "personalize" control — no religion badge on screen.)*
- **Lead line (always):** weekday · **Tithi + Paksha** · today's fast/festival if any.
- **Adaptive hero:** festival/vrat day → the festival (one-line meaning/story + fast status
  + "what people do today" + imagery = "sacred & alive"); ordinary day → the tithi's plain
  meaning.
- **Right now:** auspicious or not · **the one window that matters** (Abhijit / next good /
  "avoid Rahu Kalam till…").
- **Nakshatra:** compact secondary line under the tithi (present, quieter than tithi).

**Tier 2 — ONE-TAP / scannable (compact cards below the lead)**
- Tithi & Nakshatra — meaning first, tap for raw detail.
- Sun & Moon times (rise/set).
- Good & avoid windows — top 2–3, "see all →" into Muhurat.
- **"Ask the moment"** — the daily Prashna delight card (the pillar).
- Coming up — next 1–3 festivals, tap → guide.
- **"Manage what you follow"** — the quiet personalization entry.

**Tier 3 — EXPERT / DEPTH-ON-DEMAND (OFF the home → one tap into Full Panchang)**
Hora / planetary hours · yogas (Anandadi, Ravi Yoga…) · Panchaka · Disha Shool · Bhadra ·
Vedic clock (ghati/pal/vipal) · season clock · **upcoming planetary events (transits /
retro / ingress — the enthusiast delight)** · all raw fields (paksha, ayanamsa, lagna
degrees…).

**Locked decisions:** the entire technical almanac leaves the home and lives in **Full
Panchang** (which doubles as the astrology-enthusiast's scrollable "sky" surface, §20.1);
adaptive hero; **Tithi is Tier 1**; **Nakshatra is a compact secondary**; the **Prashna
daily card sits on the home** (Tier 2); personalization is **promote/remind, never hide**.
Next: neutral grayscale wireframe of this hierarchy (theme still deferred to §10).

**Nav update (2026-07-30):** Prashna is promoted from a home card to its **own permanent
tab** — a scroll card was burying a daily-ritual pillar (owner: "ask the moment
feels buried"). Navigation is now **5 tabs: Today · Festivals · Muhurat · Prashna · Jyotish**,
which also cleanly separates the **daily horary ritual (Prashna — free, everyone)** from the
**deep chart workspace (Jyotish — paid, practitioner)** — fixing the earlier category error
of folding Prashna into Jyotish. A small "today's question" teaser may still sit on the
Today home and deep-link into the Prashna tab. **This supersedes the 4-tab Model B** for
Prashna's placement (§6/§21).

**✅ Tab label settled (owner, 2026-08-09): the tab is "Prashna", not "Ask".** This entry
previously proposed renaming it to "Ask" for newcomer legibility. The owner resolved it in
favour of the correct term: `src/kundli-app.tsx` already ships "Prashna" / "प्रश्न", the
approved desktop design uses Prashna, and the practitioner audience is the one that matters
for this surface. No rename is required — the code is correct and this doc was the stale
side. Route stays `prashna`.
