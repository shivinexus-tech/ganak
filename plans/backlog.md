# Ganak — Product Backlog

Rebuilt 2026-07-18 into a phased launch plan reflecting the owner's strategy.
Status verified against `src/kundli-app.tsx`, not assumed.

**Closure contract:** acceptance criteria and the definition of done for every
consolidated open package are canonical in
[`plans/backlog-acceptance-register.md`](backlog-acceptance-register.md). A checkbox
must not be closed merely because code exists; the linked acceptance and evidence
requirements must pass. **Bug bash (owner, 2026-07-22): no item is 100%
until at least two different agents have each spent 30+ focused minutes trying to
break the finished feature, recorded in `plans/task-log.md`.** Gates prove the maths;
only an adversarial human-style pass proves the feature works. **Then send the owner the
live deep-linked production URL and wait for approval — that is the final gate.** See
the register for both rules. Nested/duplicate checkboxes map to one package in that
register so they cannot be counted as separate progress.

## Strategy (owner, 2026-07-18)

- **Free to start.** Hook users first, gather heavy user feedback, let real usage
  guide the roadmap.
- **Fastest path to a web launch**, leading with Panchang.
- **Phase 1 web scope (owner-expanded 2026-07-21):** Daily/Panchang, Festivals/Vrats,
  Prashna, Muhurat and the completed/polished Jyotish section are all visible.
  Existing hidden engines must close the recorded competitor gaps before exposure.
- **Web first; Android + Apple wait a little** (after web proves out).
- **Monetize narrowly, later, and only where it costs money:** saving charts
  (needs paid storage), and possibly parts of the Jyotish section + the AI
  features (which cost per-call). Investment level still TBD.
- **Hard rule: never ads on the Panchang section.**

---

## P0 — Parallel-agent architecture and pure UI split

**Owner decision, 2026-07-19:** Ganak must support at least ten agents working
concurrently. The old single-file structure is now a delivery blocker. Replace it
gradually with one-writer-per-module ownership; do not allow concurrent edits to the
same file.

- [x] **EPIC-UI-SPLIT: Pure UI extraction** — move UI without changing behaviour,
      styling, text, state transitions or astronomy. Extract one cohesive slice at a
      time, run every gate + build + browser smoke test, then continue.
  - [x] Prashna screen (first slice; parity markers preserved and gate repointed).
  - [x] Shared place search and shared display primitives. _(SPLIT-UI-02 REVIEW — places.ts + PlaceInput; tokens/format already from UI-01)_
  - [x] Daily/Panchang modules wired (`MuhuratHub`, `CalendarPage`, engines). _(SPLIT-UI-03-WIRE)_
  - [x] **DailyScreen chrome peel** — place/date/calendar strip + gochar →
        `src/screens/DailyScreen.tsx`. _(SPLIT-UI-DAILY-SCREEN — shell 377 → 143)_
  - [x] Fasts, festivals and vrat-vidhi UI. _(inside MuhuratHub / VratVidhiCard)_
  - [x] Muhurat finder and hora UI. _(MuhuratHub)_
  - [x] Chart form and primary chart UI. _(ChartScreen — SHELL-FINISH-48H)_
  - [x] Kundali matching UI. _(MatchingScreen)_
  - [x] Dashas and divisional-chart UI. _(inside ChartScreen)_
  - [x] Rectification, KP, BNN and Bhrigu tools. _(Rectify / JyotishBnn)_
  - [x] Reduce `kundli-app.tsx` to navigation, shared app state and composition.
        _(**143 lines** — nav, lang, shared place, compose Daily/Prashna/Chart)_
  - [x] **EPIC-UI-SPLIT complete** for the single-file bottleneck (2026-07-19).
- [ ] **EPIC-10-LANES: Ten concurrent implementation lanes** — after the relevant
      modules exist, give each lane an isolated Git branch + worktree and exclusive
      file ownership: Daily, Festivals/Vrats, Muhurat, Chart, Matching, Prashna,
      Hora/Gochar, specialist Jyotish tools, validation, and backend/deployment.
- [ ] **Integration lane** — one designated integrator owns shared shell/design-token
      changes, reviews each branch, merges sequentially and reruns all gates.
- [x] **Module ownership map** — live board at `plans/module-ownership-map.md`
      (lane → files → exists? → status → who reserves next). Records agent,
      branch/worktree, allowed files, dependencies and status before work starts.
      No unreserved shared-file edits.
- [x] **Durable task log** — `plans/task-log.md`; every agent records assignment,
      files, branch/worktree, validation evidence, blocker and handoff.
- [ ] Update the older `plans/parallel-agent-brief.md` into the live ten-lane board
      once the UI modules are available; its single-file instructions are historical.

**Concurrency rule:** ten agents may work at once, but never ten writers in one file.
Parallel safety comes from separate modules + separate worktrees + an integration
owner, not from relying on Git to reconcile overlapping generated code.

---

## PHASE 1 — Free web launch (Panchang + Festivals/Vrats + Prashna + Muhurat + Jyotish)

The owner expanded Phase 1 on 2026-07-21 from a narrow launch into a full
competitor-gap launch. Panchang remains the flagship, but complete Festivals/Vrats,
Muhurat and polished public Jyotish are now first-class launch gates too.

**✅ LAUNCH TENSION RESOLVED (owner, 2026-07-18): baseline now, grow after.**
Launch bar = Tiers 1+2 wired & verified (mostly done) + vrat vidhis for the ~15–20
most-observed fasts. That's the "credible baseline" — weeks, not months. The
exhaustive beyond-Drik long tail (Tier 3) grows *post-launch*, fed by user feedback.
So Phase 1's content gate is now finite and near, not open-ended.

**Content gates (must clear before a credible Panchang launch — scope = all 4
traditions + regional + beyond-Drik, see §C-SCOPE):**
- [ ] **P1-CONTENT: Fasts & festivals coverage** — see §C1 and
      `plans/drik-gap-analysis.md`. **Batch 1 done** (Tier-1 monthly cycle + Diwali/
      Chhath cluster). **Next batch (P0):** Chaitra Navratri, Gudi Padwa/Ugadi, Vat
      Savitri, Kartika Purnima, Tulasi Vivah, Pongal, Anant Chaturdashi, Pitru Paksha
      list surfacing, Varalakshmi, remaining Tamil/Shakta Tier-2. Brief:
      `plans/codex-task-p1-content-batch2.md`.
- [x] **P1-VRATVIDHI: Vrat vidhis & fasting guidance** — see §C2. **MERGED 2026-07-20**
      (`9987c83`). Owner verification pass done; 16 observances wired. Executed by
      **Codex** (task ID `CLAUDE-P1-VRATVIDHI-VERIFY` is legacy — initially assigned to
      Claude Code, owner reassigned before work started). Brief:
      `plans/claude-task-p1-vratvidhi-verify.md`.

**Plumbing:**
- [ ] **P0 before go-live — finish, polish and expose Ganak Jyotish.** The birth-chart
      section is no longer a Phase-2 reveal. Bring the already-built engines into a
      coherent, bilingual, phone-ready public experience; do not merely unhide the
      current dense screen. This launch gate includes:
  - [ ] Retrograde/direct calendar and planetary combustion, rise and set calendar.
  - [ ] Standalone Sade Sati calculator and report.
  - [ ] Standalone Mangal Dosha analysis from Lagna, Moon and Venus, with sourced
        exceptions/cancellation rules and a plain-language verdict.
  - [ ] Dedicated Kala Sarpa Dosha analysis with explicit caveats against
        fear-based or universal claims.
  - [ ] Papasamyam/Papa Dosham and Pitra Dosha analyses with documented conventions.
  - [ ] Finish and validate Arudha Padas, Bhavabala presentation, and Special
        Lagnas/Upagrahas; expose their existing engines with useful explanations.
  - [ ] Expose and polish every already-built specialist panel: Graha/Bhava detail,
        Bhava Chalit, D1–D60 divisional charts, Vimshottari sub-dashas,
        Ashtakavarga, Shadbala, Yoga detection, Gochar, rectification, KP
        sub-lords/significators, BNN, Bhrigu and the existing plain-language reading.
        No engine counts as launched while its route/panel is hidden, untranslated,
        visually unfinished or missing validation evidence.
  - [ ] South- and East-Indian chart styles in addition to the current chart.
  - [ ] Keep and expose multiple ayanamshas without changing Ganak's default
        Lahiri + mean Rahu/Ketu convention.
  - [ ] Complete the general Dosha explanation layer and finish Ruling Planets,
        reusing existing engine work only after rule/anchor verification.
  - [ ] Complete the answer-before-data life interpretation layer so the public
        Kundli is more than a collection of technical tables; qualify uncertainty
        and keep detailed calculations available below each plain-language result.
  - [ ] Downloadable Kundli PDF and general PDF reports, with bilingual rendering,
        chart legibility and print verification.
      _(P0-JYOTISH-PUBLIC-LAUNCH; owner scope 2026-07-21)_
- [ ] **P0 before go-live — matching and marriage-completion suite.** Finish
      Dashakoota alongside the existing Ashtakoota path; add a downloadable match
      PDF/report and a clearly qualified marriage prediction/timing view. State the
      method and limitations; never present a match score or timing estimate as a
      certainty. _(P0-MATCHING-LAUNCH; owner scope 2026-07-21)_
- [ ] **P0 before go-live — approved utility-calculator catalogue.** Build public,
      cleanly routed calculators for Moon sign/Rashi, Sun sign, Ascendant/Lagna,
      birth Nakshatra, baby-name initials/finder, standalone Mangal Dosha, Kala
      Sarpa, Sade Sati, Shraddha Tithi and Pancha Pakshi. Also include a Western
      natal chart and Western synastry/composite calculators because they were not
      excluded from the owner's approved competitor list; keep them visibly
      separate from Ganak's Vedic defaults. Every calculator needs bilingual
      inputs, answer-first output, sources/convention notes, validation anchors,
      permanent URL and share metadata. Explicitly excluded: numerology
      (Mulank/Bhagyank/Namank), birthstone, Chinese zodiac/calendar, Western
      transit/progression, Vastu, Feng Shui, gemstone and Rudraksha calculators.
      _(P0-UTILITY-CALCULATORS; owner scope 2026-07-21)_
- [ ] **P0 before go-live — exceptionally strong Panchang and calendar parity.**
      Ganak must close every gap identified in the 2026-07-21 competitor comparison,
      while retaining answer-before-data, Hindi/English journeys, local-time accuracy
      and the no-ads-on-Panchang rule. “Present in the engine” is not complete until
      it is visible, explained, validated and phone-usable. Required scope:
  - [ ] Dedicated Bhadra/Vishti interval and warning; Dur Muhurat; Varjyam; Amrit
        Kalam; Brahma, Nishita, Godhuli and reusable Pradosha Muhurtas.
  - [ ] Chandrabalam, Tarabalam, Disha Shool/Vara Shula, Nalla Neram, Gowri Nalla
        Neram and Anandadi Yoga.
  - [ ] Dedicated Sarvartha Siddhi, Amrita Siddhi, Ravi Yoga, Ravi/Guru Pushya,
        Dwipushkar, Tripushkar and Ganda Moola calculations/calendars.
  - [x] Ritu/season, solstice/equinox and Vedic/Ghati clock.
  - [ ] User-controlled lunar/Gregorian presentation, Amanta/Purnimanta switch and
        pre-launch Tamil Thirukanitha/Bengali Vishuddha Siddhanta calendar-base
        switches. Complete Tamil/Bengali-language journeys remain a separate
        post-launch item; both named calculation/base modes are required now.
        Implementation must follow the isolation, invariance, differential-testing,
        staged-rollout and fallback contract in
        `plans/regional-calendar-risk-plan.md`.
  - [ ] Printable/PDF calendar, Google Calendar/calendar-feed export, reminders and
        push integration, with selected city, timezone and language preserved.
  - [ ] Public/national holidays and the owner-reviewed scope for non-Hindu calendar
        overlays; keep them visually separate from Hindu observance calculations.
      _(P0-PANCHANG-CALENDAR-PARITY; owner scope 2026-07-21)_
- [ ] **P0 before go-live — exceptionally strong festival and vrat completion.**
      Close every festival/vrat gap in the competitor comparison: complete all
      openable-label pages, full local timing, household guidance, fasting/paran,
      explicit regional distinctions, sect/calendar distinctions where supported,
      printable/exportable festival calendars and opt-in reminders. Specifically:
  - [ ] Bengal Durga Puja: separate, substantive Mahalaya, Shashthi, Saptami,
        Ashtami, Navami and Vijaya Dashami pages. **Not deferred.**
  - [ ] Separate substantive Skanda Sashti sequence and Ayyappa Mandala sequence
        pages; finish and merge the complete four-day Chhath calendar journey.
  - [x] Eighteen season-specific Chaitra/Sharad Navadurga pages plus the sourced
        Durga Saptashati reading plan; Gupt Navratris stay distinct.
  - [ ] Location-aware eclipse visibility, Sutak start/end and safe household
        guidance; sect-specific calendar views where rules are verified.
      _(P0-FESTIVAL-VRAT-PARITY; owner scope 2026-07-21)_
- [ ] **P0 before go-live — exceptionally strong Muhurat parity.** Complete every
      gap from the competitor comparison and keep the verdict/explanation stronger
      than a raw date list:
  - [ ] Deep, separately validated engines and pages for marriage, engagement,
        property purchase, vehicle purchase, Bhoomi Puja/construction, business,
        travel, housewarming and document signing/registration. The existing generic
        “purchase” category does **not** close the property or vehicle gaps.
  - [ ] Samskara Muhurtas: Mundan/tonsure, Namakaran, Annaprashan, Vidyarambha and
        Upanayana, with tradition and regional conventions stated.
  - [ ] Birth-chart-personalized Muhurat only after its method is sourced and
        validated; never silently mix natal filtering into the general finder.
  - [ ] Save/share/export the chosen Muhurat and create calendar reminders.
  - [ ] Surgery/medical Muhurat under the separate Claude research brief
        `plans/claude-task-surgery-medical-muhurat.md`. It is strictly for optional
        timing preferences around clinician-approved, non-urgent care; it must never
        delay urgent treatment or claim to improve medical safety/outcomes.
      _(P0-MUHURAT-FULL-PARITY; owner scope 2026-07-21)_
- [ ] **P0 before go-live — discoverability, publishing and public platform.** Ship
      all of the following as launch gates rather than post-launch polish:
  - [ ] Clean path-based routes for every public screen and calculator; preserve
        redirects for old `?screen=` links and the selected language.
  - [ ] Unique browser title, description, canonical URL and social/share metadata
        per page; sitemap, robots rules and broad but substantive SEO landing pages.
  - [ ] Editorial astrology/news publishing area with authorship, dates, corrections,
        sources, topic/archive routes and a standard that prevents thin SEO pages.
  - [ ] A documented, rate-limited public developer API with versioning, keys,
        quotas, abuse controls, privacy terms and stable error contracts.
  - [ ] Push notifications, including permission education, granular opt-in,
        timezone/location correctness and an easy unsubscribe path.
  - [ ] Privacy-friendly analytics plus an in-product feedback channel; update the
        current “no tracking” claim and legal draft in the same release.
  - [ ] Publish Privacy and Terms pages after owner contact details and legal review.
  - [ ] Social/community channels and clear in-product links/moderation ownership.
      _(P0-PUBLIC-PLATFORM-LAUNCH; owner scope 2026-07-21)_
- [x] **P0 before go-live — substantive-page coverage for major festivals.** A
      permanent URL is not complete merely because it resolves. Audit every major
      festival currently using a metadata-only page and promote it to a sourced,
      bilingual guide with significance, household worship, food/fasting rules,
      stories and explicitly labelled regional variants. Never invent a ritual to
      fill a page. Add a reviewed-major-festival inventory and a gate that prevents
      an approved major festival from silently falling back to the thin overview.
      Makar Sankranti is the first correction under `CODEX-P0-MAKAR-GUIDE-01`.
      **Complete:** all 29 festivals in the approved major inventory now have
      reviewed substantive bilingual pages. Seventeen former metadata-only
      routes gained full guides; ten older guides were completed to the same
      standard without replacing validated timing/fasting rules. The permanent
      gate contains the exact expected registry so removing one also fails.
      _(CODEX-P0-MAJOR-FESTIVAL-COVERAGE-ALL — completed 2026-07-21)_
- [x] **P0 before go-live — location-aware Sankranti Punya Kala.** Calculate and
      show the local Sankranti moment, Punya Kala and Maha Punya Kala on Makar and
      other relevant Sankranti pages. Respect the after-sunset carry rule and do
      not substitute sunrise or a generic all-day label. Research boundary and
      sources are recorded in `plans/makar-sankranti-research.md`.
      _(CODEX-P0-SANKRANTI-PUNYA — shipped 2026-07-21)_
- [ ] **P0 before go-live — route-aware page identity and metadata audit.** Every
      screen and permanent route must identify the product area the user actually
      opened: Panchang, Prashna, Festival/Vrat, or Jyotish. Audit the visible hero,
      supporting line, browser title, share/preview metadata, breadcrumbs and footer
      for stale copy inherited from another section. Add automated route-context
      checks so a future page cannot silently show birth-chart language on a fasting
      page or another unrelated product description. The immediate shared-header
      leak is being corrected under `CODEX-P0-PAGE-IDENTITY-01`; the remaining
      title/share/footer audit stays open until checked route by route.
- [x] **P0 before go-live — shareable festival-guide links.** Add stable routes for
      `/festival/hartalika-teej`, `/festival/chaitra-navratri`,
      `/festival/sharad-navratri`, and `/festival/chhath`. This is additive: keep
      the current Fasts & Festivals card click/expand behaviour exactly as it is.
      After launch, compare direct-link use with in-app card use and only reconsider
      navigation after observing real user behaviour. _(P1-FESTIVAL-DEEPLINKS — shipped)_
- [x] **P0 before go-live — complete festival and vrat page-link coverage (no
      tier exclusions).** Every festival, vrat, fast, recurring observance and named
      variant that a user can open anywhere in the website/app must also have a
      stable, shareable dedicated-page URL. This covers the **full current inventory:
      125 festival/calendar labels + 41 fasting/recurring labels = 166 openable
      labels**, not merely P1/P2 items. The first four routes above are complete.
      **Completed Codex slice:** `CODEX-P0-FESTIVAL-PAGES-148` — 148 remaining pages
      excluding the then-separate multi-day implementation slice (Chhath done;
      Bengal Durga Puja ×6, Skanda Sashti ×3, Ayyappa Mandala ×2). These pages are
      now explicit P0 requirements, not deferred. Brief:
      `plans/codex-task-p0-festival-pages-148.md`. Keep the existing in-app
      click/expand action as well. Add a generated coverage gate that compares the
      live openable-item registries against the route registry, so adding a future
      festival without a page link fails validation. Full checkable snapshot and
      rules: `plans/festival-page-link-inventory.md`. **Completed 2026-07-22:**
      Bengal Durga Puja ×6 substantive guides + routes; zero deferred labels.
      _(P0-FESTIVAL-PAGES-ALL — shipped 2026-07-22)_
- [x] **P0 before go-live — place-aware festival pages.** Put the normal Ganak place
      selection box directly on every dedicated festival/vrat page. Replace “Open
      this festival in the Daily Panchang to see the local timing referred to below.”
      with the selected city, the applicable local festival date and the relevant
      local puja/paran/day-part timing on that page. Changing place must visibly
      recalculate without silently clearing the guide; provide bilingual loading,
      failure and recovery messages. Preserve the dedicated route and language while
      the place changes, and keep a Daily Panchang link as optional navigation—not as
      a requirement for understanding the guide.
      _(P0-FESTIVAL-PAGE-PLACE — shipped 2026-07-20)_
- [x] **P0 before go-live — Chaitra + Sharad Navratri Navadurga pages and
      Saptashati plan.** Build nine dedicated Devi day-pages under each of Chaitra
      and Sharad Navratri (18 visible season-specific pages), with verified Goddess
      image/iconography, identity, significance and sourced household puja guidance.
      **Durga Saptashati is part of this launch requirement now, not later:** every
      day-page must contain that day's reading section, and each season's first-day
      page must contain the complete sourced plan for arranging the text across all
      nine days. Keep the implementation appropriate for householders and distinguish
      simple recitation from initiated/lineage ritual. Do not apply this Navadurga
      structure to either Gupt Navratri. **Shipped 2026-07-21:** eighteen stable
      bilingual routes, nine original iconography-checked Goddess portraits,
      step-by-step household puja, day-specific chapters and the full nine-day plan
      on both day-1 pages. Local tithi logic explains repeated or skipped sunrise
      days; dedicated gate: `validation/navadurga-pages.cjs`.
      _(P0-NAVRATRI-18-SAPTASHATI)_
- [x] **P0 before go-live — deep research on Magha and Ashadha Gupt Navratri
      practices.** Treat the two Gupt Navratris as their own research track, not a
      copy of Chaitra/Sharad. Verify the four-Navratri textual basis; regional and
      lineage differences; Ghatasthapana/fasting/public household devotion; the
      claimed relationship to the ten Mahavidyas; whether any day-by-day assignment
      is genuinely established; permitted public stotra/Saptashati practice; and what
      requires diksha or a Guru and must not be presented as self-service tantric
      instruction. Produce sourced bilingual recommendations and an explicit
      safe-to-publish/lineage-only table for owner review before adding detailed
      pages. Brief: `plans/gupt-navratri-deep-research.md`.
      **Shipped on branch `codex/gupt-navratri-timings`:** separate bilingual
      Magha/Ashadha household guides, city-specific Ghatasthapana and full-fast
      Dashami-parana calculations, and a permanent published-anchor regression
      gate. User-facing copy contains no research-source branding and does not
      publish an invented Mahavidya day sequence.
      _(P0-GUPT-NAVRATRI-DEEP-RESEARCH / CODEX-P0-GUPT-TIMINGS-INTEGRATION)_
- [ ] **P0 before go-live — Prashna improvement research + owner-approved number
      method.** The current screen needs a broader product and calculation audit.
      Research and prototype an additional **KP Horary Number (1–249)** mode: the
      user concentrates on one sincere, specific question and supplies the first
      number that comes naturally; the number maps to a KP zodiac subdivision and
      fixes the Prashna ascendant, while the question moment and selected place still
      matter. This is **not numerology** and is separate from the future Prashnavali
      “number → verse” idea. Do not build from the suggestion alone: first bring the
      owner the proposed inputs, plain-language flow, method/convention choices and
      sample outputs for confirmation. Research must resolve KP-vs-Lahiri ayanamsa,
      249-boundary mapping, house cusps, ruling planets, significators, question-house
      rules, repeated-question handling and calculation anchors. After owner sign-off,
      build it as a clearly labelled alternative to—not a silent replacement for—the
      existing time-based Prashna. Full brief: `plans/prashna-number-method-research.md`.
      _(P0-PRASHNA-249-RESEARCH — research done 2026-07-20; findings
      `plans/prashna-249-findings.md`, owner answers `plans/prashna-249-owner-answers.md`.
      **Naming DECIDED:** "कृष्णमूर्ति पद्धति अंक विधि" / "Krishnamurti Paddhati number
      method" — full name, no "KP" initials.
      **Ruling planets + Moon-sincerity DECIDED:** ship both in v1, not deferred.
      **Ayanamsa DECIDED 2026-07-22: option C — Prashna runs on KP ayanamsa.**
      Implementation must **parameterize, not replace**: default KP, keep the Lahiri
      path and its existing 198-value EXACT baseline locked, add a second locked KP
      baseline, so the regression net survives the switch. The 24 self-tests are
      Drik/Lahiri-anchored (`prashna-calc.js:354` asserts 24°13.3′ ±2′) and will fail
      under KP **by design** — do not widen the tolerance; source separate KP anchors
      via P0-PRASHNA-249-KSK-VERIFY. Screen copy at `PrashnaScreen.tsx:472` claims
      Lahiri/Drik conventions and becomes false. Accepted trade-off: Daily and Prashna
      will differ ~11 min on nakshatra transitions — must be disclosed on screen, not
      left to look like a bug. Tithi unaffected, so no festival content changes.
      **Mock-up DECIDED 2026-07-22: not needed.** Label stacks two lines — "अंक विधि"
      normal size over "कृष्णमूर्ति पद्धति" smaller — which fits 375px without shortening
      the name. Review happens on production instead: deploy, then send the owner the
      deep-linked URL for feedback. Q1 still open.)_
- [ ] **P0 — Understand users without login (research DONE, execution pending).**
      Owner blocker: "can't tell who the users are or how they navigate without
      signup." Research says login is **not** the blocker and would not solve it —
      three separate questions, three tools, none needing auth. Full findings:
      `plans/understanding-users-without-login.md`.
      **Do in this order:**
      1. **5 moderated usability tests** (₹0, this week, no launch traffic needed) —
         Nielsen: 5 users surface ~85% of usability problems. At least 2 participants
         should be elders, per the elder-friendly requirement. Answers the EPIC-IA
         "is the nav broken / do people know to tap" question that analytics cannot.
      2. **Instrument behavioural cohorts** — infer astrologer vs everyday user from
         behaviour (opens Full Prashna chart / divisional charts / switches ayanamsa to
         KP vs only reads tithi). No identity needed. Better signal than login.
      3. **Recruit ~10 astrologers into a WhatsApp/Telegram group** + a footer
         "help us improve" link. Recruitment problem, not an auth problem.
      Login stays Phase 4, driven by saved charts + reminders, not by analytics.
      _(P0-USER-INSIGHT)_
- [ ] **P0 blocker on the above — analytics breaks the "no tracking" footer claim.**
      The footer says "no account, no tracking". **Any** analytics, even cookieless or
      self-hosted, makes that false — the same trap as the Google Fonts leak. Footer,
      `plans/legal-privacy-terms-draft.md` §2.2, an in-app plain-language note, and a
      DPDP/GDPR check must all land in **one change** with the instrumentation.
      Tooling: Plausible (~$9/mo, cookieless, custom events) or self-hosted Umami
      (free tier, data stays ours). Cloudflare Web Analytics is free and already
      available but samples data, keeps 30 days, and is weak on custom events — which
      is exactly what we need. Avoid PostHog (cookie/profile based).
      _(P0-ANALYTICS-PRIVACY)_
- [ ] **P0 pre-condition for the 249 engine — primary-text verification (KSK).**
      Before the KP-number engine ships, verify the judgment conventions against
      K. S. Krishnamurti's own Horary readers (number fixes the lagna at the sub's
      start; cusp sub-lord promise/denial rules per question; significator hierarchy;
      ruling-planet use; repeat-question doctrine). The web sources agree with each
      other and with our first-principles computation of the 1–249 table, but for a
      devotional audience Ganak anchors on source texts, not on calculator websites —
      same religious-accuracy rule as festival content. Output: a short citations note
      in `plans/` mapping each engine rule to reader/chapter, plus any corrections.
      Blocks implementation, not research.
      **Scope grew again 2026-07-22:** also close the Prashna **deny-side house
      glosses** — the app currently says "your 11th house — gains & fulfilment — which
      works against this matter", the mirror of the illness/supportive bug fixed in
      Q1c. Rests on the "12th from" rule, so it needs primary-text backing. Plus the
      unsourced `lost`/6th cell. See `plans/prashna-house-glosses.md`.
      **Scope grew 2026-07-20** (owner shipped ruling planets + Moon-sincerity in v1):
      must now also anchor the ruling-planet rules (which five, ranking, timing use)
      and the sincerity doctrine — the areas where popular KP sites vary most.
      _(P0-PRASHNA-249-KSK-VERIFY)_
- [x] **P1 — Prashna ordinal bug.** English house labels now use proper ordinals
      (`1st`, `2nd`, `3rd`, `4th`, including `11th`/`12th`) in all three verdict
      reason paths; Hindi copy is unchanged. A permanent copy gate prevents the
      hard-coded `${h}th` form from returning. _(CODEX-P0-PRASHNA-ORDINAL — shipped 2026-07-21)_
- [x] **Historical deployment step — hide the birth-chart tab** for the first preview;
      Chart currently falls back to Daily. **Superseded as launch policy:** the
      completed/polished Jyotish section must be visible before go-live under
      `P0-JYOTISH-PUBLIC-LAUNCH`. _(P1-HIDE-DEPLOY, live preview state)_
- [x] **Deploy to a web host** — https://ganak.pages.dev (Cloudflare Pages, `main`
      auto-deploy). _(P1-HIDE-DEPLOY)_
- [ ] **P0 before go-live — branded domain and clean public URLs.** Replace the
      Cloudflare preview address with an owner-approved Ganak domain. Before any
      purchase, compare suitable `.com`, `.in` and `.app` candidates for availability,
      trademark/confusion risk, prior ownership or blacklist history, matching social
      handles, first-year price and recurring renewal cost; present the shortlist and
      obtain owner approval before spending. Then connect the chosen domain through
      Cloudflare with HTTPS, make it the canonical address, redirect the `pages.dev`
      preview and all old shared links safely, and verify search/share metadata,
      sitemap and analytics/error-reporting origins. In the same launch pass, replace
      implementation-looking navigation such as `?screen=daily` with stable paths
      (`/`, `/prashna`, `/festival/...`) while preserving existing links and the
      selected language. The owner chooses whether Hindi remains `?lang=hi` or moves
      to `/hi/...` after an SEO and usability comparison. _(P0-CUSTOM-DOMAIN)_
- [x] **Error monitoring** — privacy-safe crash reporter + React Error Boundary
      (no Sentry SDK / no browser storage). DSN via `VITE_SENTRY_DSN` at build time.
      Cloudflare production injection and a controlled Sentry event were verified
      end-to-end on 2026-07-21 — see `plans/error-monitoring.md`.
      _(CURSOR-P1-ERROR-MONITOR + CODEX-P1-ERROR-MONITOR-FIX)_
- [ ] **Analytics + a feedback channel** — owner wants "immense user input."
      Privacy-friendly analytics + an in-app feedback button/form.
- [ ] **Publish privacy/terms page** — draft at `plans/legal-privacy-terms-draft.md`;
      footer + fonts accurate _(CLAUDE-LAUNCH-PRIVACY MERGED)_. Needs owner contact
      email + counsel review before linking publicly.
- [ ] **Owner chore:** one local `cd server && npm run smoke` (agents verified via
      browser; suite itself unrun as-written).
- [x] Optional polish before launch: Muhurat window labels bilingual (E-0.7). _(CHIP-B)_
- [x] **MuhuratHub startup perf** — async 90d scan + lunar cache + sunEvents reuse.
      Scan90 ~0.4s bg; scan400 ~1.7s. _(CURSOR-MUHURAT-PERF, CURSOR-LUNAR-CACHE,
      CURSOR-SUNEVENTS-01)_
- [ ] Optional engine perf: investigate `sunSidMs` (`plans/perf-startup-scan.md` #5).

**Product polish (recommended for launch, in-place, no rewrite):**
- [ ] Everyday-zone nav cleanup + gut MuhuratHub — see **EPIC-IA**.
      **PARKED 2026-07-20** (owner): user feedback that IA feels broken + elder-friendly
      requirement captured under EPIC-IA; resume after Phase 1 launch blockers.
- [ ] Design-system pass (universal Card, spacing scale, shared primitives) —
      see **EPIC-DS**. Directly fixes the "visual inconsistency" pain.

**Still not required by the 2026-07-21 scope change:** accounts, cross-device data
persistence, paid AI, Android/iOS store packaging, SDUI and paywalls. The backend
work needed for the newly required public API, push and PDF/report delivery is now
Phase-1 infrastructure; broader account/monetization architecture remains deferred.

---

## PHASE 2 — Broaden languages, then iterate on feedback

- [ ] **Full regional-language calendar presentation** — translate complete calendar
      journeys after the English/Hindi web launch is stable. Tamil Thirukanitha and
      Bengali Vishuddha Siddhanta **calculation/base modes are not deferred** and are
      P0 before launch under `plans/regional-calendar-risk-plan.md`. No regional mode
      may ship by changing the validated astronomy engine or by adding scattered
      mode-specific conditionals.
- [ ] **Broader multi-language interface** — languages beyond the current Hindi and
      English pair are explicitly post-launch. Translation must cover complete
      journeys and errors, not only labels. _(Owner priority 2026-07-21)_
- [ ] Prioritize new features by what Phase 1 user feedback actually asks for.
- [ ] Cheap feature candidates: **Prashnavali** (number-pick → verse, very low
      cost). Possibly **Gemstone/Remedy** if users ask.
- Still free. Still no ads on Panchang.

---

## PHASE 3 — Mobile apps (Android + Apple)

Owner will wait a little; sequence after web proves out.

- [ ] **Decide the Android/iOS route** — PWA (cheapest, installable web) vs
      Capacitor (native shell around the web app) vs React Native rewrite. This
      one choice sizes the whole epic.
- [ ] Play Store + App Store accounts, signing, store listings.
- [ ] **Legal — privacy policy + terms** (required before either store lists you).

---

## PHASE 4 — Selective monetization (only where it costs money)

Owner: hook users first; monetize narrowly. Never ads on Panchang.

- [ ] **Backend proxy** (holds API key) — prerequisite for all AI features.
- [ ] **Accounts / auth** + **real data persistence** (replaces the sandbox-only
      `window.storage`).
- [ ] **Paid: Save charts** — the first paid feature (storage costs money).
- [ ] **Paid AI features** (each costs per-call, natural to charge for):
      - AI chart explanation — ask questions about your own chart in natural language.
      - AI Muhurat free-text search — type the request in any language.
- [ ] Possibly paid: parts of the Jyotish section (TBD by demand + cost).
- [ ] Cloud Sync (needs accounts + persistence).
- [ ] **Subscription tiers / paywalls** (Free / Premium / Pro) — the gating layer
      for the paid features above. See EPIC-PLATFORM. Narrow, never on Panchang basics.

**Deferred platform architecture (from Kimi's proposal — good ideas, wrong time):**
The BFF, Server-Driven UI, full auth/RBAC, and paywall tiers proposed in the Kimi
architecture docs (2026-07-18) are tracked as EPIC-PLATFORM below. They belong
*here or later*, gated on a real trigger (scale, or this phase's monetization) —
not pulled forward into the launch. See the epic for the trigger conditions.

---

## LATER / MUCH LATER — features, not near-term

Owner explicitly deferred these.

- Gemstone / Remedy suggestions (unless Phase 2 feedback pulls it forward)
- Vastu Compass
- Numerology (out of scope for core personas)
- Sade Sati **alerts/tracker automation** — the calculator/report is now P0; ongoing
  proactive alerts still need backend scheduling and push
- Proactive Gochar / transit **alerts** (push) — needs backend + accounts + push
  (NOTE: transit *display* already exists in the app)
- Custom Tithi + Reminders — needs push

---

## Epics (cross-phase)

Larger threads that span multiple phases or cut across the whole app. Distilled
from the Kimi architecture docs (2026-07-18) — keeping the good product/design
ideas, deferring the premature infrastructure. Three-way convergence noted where
Kimi, the owner's own words, and Ganak's messaging audit independently agree.

### EPIC-IA — Two-Zone information architecture + navigation cleanup
**Status: PARKED 2026-07-20 (owner).** Feedback received: “information architecture
feels a bit broken” + requirement that the site be **elder-friendly** (few clear
destinations, one job per screen, large type/taps, answer-first). Discussion started
but deferred behind Phase 1 launch blockers. Resume with Everyday-zone nav cleanup
+ gut MuhuratHub; elder-friendly is the default design constraint, not a toggle.

**Prior status: partially in motion.** The live preview still leads with Everyday
and hides Jyotish, but the owner now requires Jyotish completion and exposure before
go-live.
The organizing insight: Ganak is two culturally-distinct zones under one brand —
- **Everyday zone** (householders + diaspora): Panchang, Muhurat, Festivals, Hora,
  Prashnavali. Warm, plain-language, scannable.
- **Jyotish zone** (serious practitioners): Kundli, Dashas,
  Matching, Tools (BNN/BCP/KP/Shadbala/Ashtakavarga), Vault. Dense, technical.

"Jyotish" is a culturally-understood boundary (a householder checking Rahu Kalam
doesn't think they're "doing Jyotish"). This is *also* the resolution to the
branding question: **one app, sub-branded sections** ("Ganak Panchang / Ganak
Jyotish") — Kimi, the market research (Drik/AstroSage all do one app), and the
Phase-1 plan all converge here.

Work:
- [ ] **Everyday-zone nav cleanup (Phase 1-relevant):** clear top-level tabs;
      **gut the overloaded MuhuratHub** (it does ~10 jobs) into dedicated screens;
      fix "too many taps" / "unclear where features live" (owner's own words,
      confirmed by messaging audit). Do in-place in the Vite app — no rewrite.
- [ ] **Jyotish-zone hierarchy (Phase 1, before the chart reveal):** the 17 flat
      chart sub-sections (messaging audit finding) need grouping — Kundli / Dashas /
      Matching / Tools / Vault sub-navigation, not one flat list.

### EPIC-DS — Design-system discipline
**Status: not started. Cross-cutting; Phase 1 polish (helps launch look coherent).**
Targets the owner's own words: "visual inconsistency is hell a lot." The app already
has a `T` design-token object, but values leak/hardcode everywhere — so this is
*enforce + refactor*, not net-new.
- [ ] One **universal Card** component (density variants: comfortable/compact),
      no per-card overrides.
- [ ] **Rigid spacing scale** — 4/8/12/16/20/24/32 only, no exceptions.
- [ ] **Two font weights** (400/500); five sizes (display/title/body/secondary/caption).
- [ ] **Semantic color roles** (text, muted, saffron=devotional/festival,
      red=Rahu/warning, green=auspicious/Abhijit, blue=links).
- [ ] Extract shared primitives: Card, DataRow, Badge, SectionHeader — used everywhere.
- Do in-place in the single file (or as it's split); no stack change.

### EPIC-PLATFORM — BFF / SDUI / Auth / Paywalls (DEFERRED — Phase 4 or later)
**Status: deferred by design. Good ideas at the wrong time (Kimi docs).**
Trigger conditions — build a piece only when one is actually true:
- **BFF / API-key proxy** → when the first server-side secret is needed (the AI
  features). Already listed as the Phase-4 "Backend proxy." ✓ has a real trigger.
- **Auth / accounts / RBAC** → when there's something per-user to protect (saved
  charts, subscriptions). Already Phase 4. ✓
- **Subscription tiers / paywalls** (Free/Premium/Pro) → when there's a paid
  feature to gate. Phase 4 monetization. ✓ Narrow; never on Panchang basics.
- **Server-Driven UI (SDUI)** → ONLY at real scale, when remote layout updates /
  A/B tests / gradual rollouts across many users justify the abstraction. **No
  trigger yet** (0 users). Kimi's own risk note agrees: "start static, add later."
  Explicitly NOT before scale.
Guardrails carried from the review: none of this uses `localStorage`/`sessionStorage`
(project ban); nothing requires rewriting the validated ephemeris engine.

---

## A. Done — already in the app (verified in code)

Feature exists and renders; not a claim of polish/parity.

- **Daily / Panchang** — tithi, nakshatra, yoga, karana, rise/set, Rahu/Gulika/Yama
  kalam, Abhijit, choghadiya, full panchang table, samvats.
- **Fasts & festivals** — engine built; **~37 festivals fire in 2026** (was ~14).
  Diwali cluster + Chhath four-day sequence MERGED 2026-07-19. Still below Drik's
  ~100 — see `plans/drik-gap-analysis.md` for P1/P2 gap list. NOT launch-ready on
  coverage alone — see Content Track §C1.
- **Muhurat date-range finder** — 7 activities, Drik-validated. ✅ 2026-07-17.
- **Prashna (horary)** — verdict-first, birth-data-free. ✅ 2026-07-16.
- **Hora / planetary hours** — with advice input.
- **Gochar / transit display** — upcoming sign changes, retro/direct (display only).
- **Full birth chart (17 sub-sections)** — Kundli, Yogas, Grahas, KP sub-lords,
  KP significators, Kundali Matching / Guna Milan, Karakas, Shadbala, Special
  lagnas, Bhava Chalit, Ashtakavarga, Arudha, Rectification, BNN, Bhrigu,
  Vimshottari Dasha (+ sub-periods), plain-language Reading.
- **Divisional charts** D1–D60. **Dosha** logic in matching.
- **Bilingual hi/en** across Daily, Prashna, Muhurat + core Chart path.
  ✅ Messaging audit (3 tiers) 2026-07-18.

---

## C. Content coverage & correctness track

A quality axis my earlier audits never checked: **is the domain content complete
and correct across traditions?** Form-audits (messaging) and math-gates
(validation) are blind to a *missing* festival. This track owns that. For a
Panchang competing with Drik, this content IS the product — so C1 and C2 are
Phase-1 launch gates (see above), not "later."

### C1 — Fasts & festivals coverage (P1 gate)
Current: ~14 festivals, ~7 monthly observances, Smarta + ISKCON only.
Known-missing (owner-flagged 2026-07-18, non-exhaustive):
- **Whole traditions:** Shakta (only generic Navratri today), Tamil/South-Indian
  Shaiva, Bengali, Odia, regional calendars.
- **Missing recurring tithi observances:** Skanda/Kanda **Shashti** (Murugan) —
  no Shashti at all today; **Durgashtami** (Shukla Ashtami, distinct from the
  Kalashtami that exists); Vinayaka (Shukla) Chaturthi alongside Sankashti;
  Saptami vratas (Ratha/Sheetala Saptami); Masik Durga Navami.
- **Missing annual/regional festivals:** Gupt Navratri (Magha & Ashadha), Rath
  Yatra, Sheetla Ashtami/Basoda, Chhath, Nag Panchami, Teej (Hariyali/Hartalika/
  Kajari), Gudi Padwa/Ugadi, Onam, Pongal, Baisakhi, Bihu, Vishu, regional new
  years, and many more.
- **Present-but-incomplete:** e.g. Sankashti exists but may miss regional
  variants/rules — a second failure mode beyond outright absence.

**Verified coverage spot-check (2026-07-18, against code):**
- ✅ **Pradosh — done well:** all 7 weekday variants named (Ravi/Som/Bhaum/Budh/
  Guru/Shukra/Shani Pradosh).
- ❌ **Named Ashtamis — absent:** no Radha Ashtami, Sheetla Ashtami, Durga/Maha
  Ashtami, Ahoi Ashtami. Only generic monthly Kalashtami.
- ❌ **Pitru Paksha — absent:** only a one-line "tarpana" mention in the Amavasya
  gloss. No 16-day shraddha calendar, no tithi→relative mapping, no Mahalaya
  Amavasya, no prohibitions.
- ❌ **Major named vrats/Purnimas — absent:** no Mahalakshmi Vrat, no Sharad
  Purnima / Kojagari.
- Takeaway: coverage is *uneven* (some things thorough, whole categories missing)
  — confirms ad-hoc noticing won't catch it; needs the systematic methods above.

**Three-tier cost model (corrects the earlier blanket "weeks-to-months"):**
- **Tier 1 — data-only (fast, days).** Fixed tithi/paksha/month + deity + gloss +
  vidhi. Named Ashtamis, Mahalakshmi Vrat, Sharad Purnima, named Purnimas, the
  missing monthly-cycle observances (Shashti, Shukla Durgashtami, Vinayaka
  Chaturthi, Durga Navami), straightforward annual/regional festivals. The
  existing engine already computes the dates from the tithi rule — the work is
  sourcing the placement + text. Calendar time gated by owner's *verification*
  pace, not drafting.
- **Tier 2 — needs new computation (real engineering).** **Pitru Paksha** (16-day
  shraddha calendar on *aparāhna*-vyāpinī tithi — a midday rule, not the sunrise
  tithi used elsewhere; Mahalaya; Bharani/Magha nakshatra shraddhas; **prohibitions
  that must feed into the Muhurat finder** so those days drop out of results).
  Also solar/nakshatra-timed: Chhath (arghya sunrise/sunset), Onam (nakshatra),
  Pongal/Baisakhi (Sankranti). New logic + Drik validation each.
- **Tier-2 progress (2026-07-18):** ✅ Pitru Paksha computation + Muhurat blocker;
  ✅ reusable Tamil/Malayalam solar-month + nakshatra engine; ✅ Thaipusam,
  Panguni Uthiram, Karthigai Deepam, Onam and Vishu; ✅ Ayyappa Mandala Vratham
  day 1→41 with Daily-screen progress and Mandala Pooja endpoint. Seven exact
  2026 anchors pass. Remaining Tamil set: Arudra Darshan, Vaikasi Visakam, Aadi
  Pooram and annual six-day Skanda Shashti; Makaravilakku still needs its
  Ayyappa-specific identity/detail rather than the generic Sankranti entry.
- **NEW P1 date-rule bug found by the Tier-2 verification pass:** Hartalika Teej
  is currently selected from the tithi at noon (13 Sep 2026), but this vrat uses
  the Pratahkala-vyapini rule and Drik places it on **14 Sep 2026**. Fix Hartalika
  first, then audit every Tier-1 festival for its required day-part (sunrise,
  Pratahkala, Madhyahna, Pradosha, moonrise or Nishita) instead of assuming noon.
- **Tier 3 — exhaustive "beyond Drik" long tail.** Hundreds of regional/sampradaya
  observances, each sourced + verified. The *ongoing, post-launch, feedback-fed*
  effort — not a launch wall.

**Build order (owner, 2026-07-18): Tier 1 now → Tier 2 → then discuss Tier 3.**
Enabling step before/with Tier 1: move observance content out of inline
OBS_META/FEST_META into a structured data file (§C-SCOPE.4). Every religious
entry ships only after owner verification (§C-SCOPE.3).

**Method to build the full gap list (owner asked how to find these):**
1. Diff vs Drik Panchang (the benchmark) — pull its festival/vrat list per month
   for a full year, subtract the app's output. Objective, partly automatable
   (same technique as validation/muhurat-anchors.cjs). ← highest value.
2. Owner domain walkthrough — catches what matters to target users + the rituals
   Drik itself under-documents. Irreplaceable.
3. Tithi-cycle map — per tithi × paksha, which observances attach; find tithis
   with nothing wired up (this is how "no Shashti" would've surfaced).
4. Tradition × observance matrix — reveals whole missing traditions.
5. Panchang-element completeness — Gandmool, Panchak, Bhadra, siddhi yogas,
   Disha Shool, etc. vs Drik.

### C2 — Vrat vidhis & fasting guidance (P1 gate, owner-requested 2026-07-18)
"General Vrat vidhis — everything needed for fasting — on the Panchang launch."
Per fast/observance, provide:
- **Vidhi** — how to observe it, step by step.
- **Diet rules** — what's permitted / forbidden (nirjala, phalahar, saatvic,
  grains-avoided, etc.), and any per-tradition differences.
- **Sankalpa** — the intention/vow wording.
- **Puja steps** — the ritual sequence, deity, offerings.
- **Timing / paran** — start time and the fast-breaking window (the app already
  computes some paran windows — build on that).
- **Udyapan** — the concluding ritual, where applicable.
Note: the app already has partial `rules`/`timing` fields in OBS_META and a
`vratDetail` function — extend that structure rather than rebuild. Bilingual.
Must be sourced/accurate (religious content — cite tradition, don't invent).

### C-DAYPART — festival deciding day-part (P1 content-accuracy)
Discovered 2026-07-18 (Codex found Hartalika a day early; Claude found Gupt Navratri
Ashadha silently not firing). Root cause: the festival scanner decided *every*
festival's date from the tithi at **noon**, but shastra assigns a different deciding
day-part per festival (Udaya/sunrise for most; Madhyahna/noon for Ganesh Chaturthi,
Ram Navami; Nishita/midnight for Janmashtami, Shivaratri; Aparahna for Vijayadashami;
moonrise for Karva Chauth/Sankashti).
- ✅ **Mechanism built + both original bugs fixed 2026-07-18.** Hartalika →
  2026-09-14; Gupt Navratri Ashadha → 2026-07-15.
- [x] **Principled day-part pass completed 2026-07-18 (Codex Assignment A).** The
  scanner now derives Udaya, Pratahkala, Purvahna, Madhyahna, Aparahna, Pradosha,
  Nishita and moonrise from each user's exact place and local sunrise/sunset instead
  of fixed clock-hour proxies. Every festival has an explicit sourced kala or special
  policy; Raksha Bandhan and Holika Dahan exclude Bhadra. The fasts loop now applies
  its own deciding kala too. Holika Dahan and Rangwali Holi are separate calendar
  entries. 17 New Delhi regression anchors plus the full validation suite pass.

### C-SCOPE — decided by owner 2026-07-18
**In scope: ALL of Smarta / Vaishnava / Shaiva / Shakta + top regional, AND aim
to cover observances even Drik doesn't.** This is the "beat Drik" bet, applied to
content.

**Religion scope: HINDU ONLY.** Target users are Hindu — no Jain, Christian,
Islamic, or other-religion observances. **Exception (owner 2026-07-18): Buddha
Purnima IS included** (Buddha = Dashavatar of Vishnu; owner's call). Full/new
moons stay as Hindu panchang elements.

Consequences that follow from the "all Hindu traditions + beyond Drik" scope:

1. **This becomes the largest workstream in the project** — and it's a *content /
   research* effort, not a coding one. Code holds it; sourcing and verification
   are the actual work.

2. **"Beyond Drik" means Drik-diff alone is insufficient** (it only finds what Drik
   has). Additional sources required: regional panchangs (Tamil, Bengali, Odia,
   Malayalam, Marathi, Gujarati…), classical nibandha texts (Nirnaya Sindhu,
   Dharmasindhu, Vrata Raj, Hemadri's Chaturvarga Chintamani), sampradaya-specific
   calendars, and the owner's own expert knowledge + community input.

3. **ACCURACY IS NON-NEGOTIABLE (religious content).** Vrat vidhis, diet rules, and
   festival dates must be *sourced*, not generated. An AI-drafted vidhi that's wrong
   is actively harmful. Working rule: Claude may draft/structure/research/diff and
   propose citations, but every entry is a **draft pending source + owner (or pandit/
   text) verification** before it ships. Each entry carries its citation(s).

4. **Enabling architecture — decouple content from code.** Today observances are
   hardcoded in OBS_META/FEST_META inside kundli-app.tsx. "Everything" cannot live
   sanely inline. Move to a **structured data file** (e.g. `data/observances.*`)
   with a schema per entry: id · names (en/hi/regional) · tradition(s) · region(s) ·
   tithi/computation rule · deity · type (vrat/festival) · vidhi · diet · sankalpa ·
   puja steps · paran/timing · udyapan · sources[]. App just renders the data. This
   also lets a content agent or human contributor extend coverage without touching
   app logic (fits the multi-agent goal).

5. **Phasing (comprehensive ≠ all-at-once, and it conflicts with "fastest launch"
   — see launch-tension note in Phase 1):** ship a launch-credible *baseline* first
   (monthly recurring observances complete across all 4 traditions + the major
   annual/regional festivals, especially where Drik is weak — Shakta, regional),
   then grow toward exhaustive coverage as an **ongoing post-launch track fed by
   user feedback** (aligns with the "gather user input" strategy — users surface
   their own missing local observances).

---

## E. Repo debt & small follow-ups

- **E-0.6 Chart deep-gloss Hindi translation** — advanced sub-section paragraphs
  (KP, Ashtakavarga, BNN, Bhrigu, Special Lagnas, Dasha levels) still English-only.
  Specialist-Hindi pass. Gates Phase 2's chart reveal.
- **E-0.7 Muhurat window labels bilingual** — "Rahu Kalam"/"Abhijit Muhurat" in
  finder results still English in Hindi mode. Tiny; optional Phase 1 polish.
- `parseMuhuratQuery` dead AI path — fetch to api.anthropic.com with no key;
  route via proxy (Phase 4) or remove.
- Startup performance — `scanPanchangCalendar` 400-day scan ~1.8s.

---

## Decisions — resolved (owner, 2026-07-18)

- ✅ **Launch bar** — baseline now, grow after (see Phase 1 note).
- ✅ **Investment ceiling** — small budget, ~$10–50/mo. Bites only at Phase 4;
  Phase 1 stays on free tiers. Apple Dev ($99/yr ≈ $8/mo) and a small
  proxy/server fit inside this when they arrive.

## Open decisions — awaiting confirm (research/costs now provided)

- **Umbrella branding** — market research done (2026-07-18): EVERY successful app
  (Drik, AstroSage, AstroYogi, Astrotalk) uses ONE app + feature tabs; none split
  panchang from kundli; the only spin-off anyone makes is a separate *consultation
  marketplace* app (different business model). Recommendation: one Ganak app,
  feature tabs, optional "Ganak Panchang/Jyotish" section labels (cosmetic).
  Awaiting owner confirm.
- **Android route** — cost ladder explained (2026-07-18): PWA $0 → Capacitor
  (Play $25 once, Apple $99/yr) → RN rewrite (skip). Recommendation: PWA first,
  Capacitor when stores + push are wanted. Awaiting owner confirm.
