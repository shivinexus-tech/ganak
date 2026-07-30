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
  - [x] Retrograde/direct calendar and planetary combustion, rise and set calendar.
        _(Shipped 2026-07-26, `CLAUDE-P0-PLANET-CALENDAR-01` REVIEW: engine
        `planet-calendar.ts` + `PlanetCalendarCard` in the Daily gochar area —
        a 12-month retrograde/direct + combustion (Asta/Udaya rise-set) calendar
        for the five star planets, "now" summary, bilingual Devanagari planet
        names, place-aware. Gate pins 2026 Mercury R×3 (Feb-26) + set/rise
        alternation. Open: deploy + owner sign-off + 2nd bug bash.)_
  - [ ] Standalone Sade Sati calculator and report.
  - [ ] Standalone Mangal Dosha analysis from Lagna, Moon and Venus, with sourced
        exceptions/cancellation rules and a plain-language verdict.
  - [ ] Dedicated Kala Sarpa Dosha analysis with explicit caveats against
        fear-based or universal claims. _(v1 built 2026-07-25, `CLAUDE-P0-DOSHAS-01`
        REVIEW: 12 named types by Rahu house + full/partial geometry; enriched
        `/calculator/kala-sarpa` + Kundli `#doshas` card; non-fatalistic caveats.
        Open: deploy, owner sign-off, second bug bash.)_
  - [ ] Papasamyam/Papa Dosham and Pitra Dosha analyses with documented conventions.
        _(v1 built 2026-07-25, `CLAUDE-P0-DOSHAS-01` REVIEW: Pitra Dosha = 5
        transparent same-sign checks (Sun/nodes/Saturn/9th-lord); Papa Dosha =
        malefic-load count from Lagna/Moon/Venus; Papasamyam = two-chart balance
        in Matching. Owner chose Both — Kundli sections + standalone
        `/calculator/pitra-dosha` & `/calculator/papa-dosha`. Engine `doshas.ts`,
        gate `validation/doshas.cjs`. Open: deploy, owner sign-off, second bug bash.)_
  - [ ] Finish and validate Arudha Padas, Bhavabala presentation, and Special
        Lagnas/Upagrahas; expose their existing engines with useful explanations.
  - [ ] Expose and polish every already-built specialist panel: Graha/Bhava detail,
        Bhava Chalit, D1–D60 divisional charts, Vimshottari sub-dashas,
        Ashtakavarga, Shadbala, Yoga detection, Gochar, rectification, KP
        sub-lords/significators, BNN, Bhrigu and the existing plain-language reading.
        No engine counts as launched while its route/panel is hidden, untranslated,
        visually unfinished or missing validation evidence.
  - [ ] South- and East-Indian chart styles in addition to the current chart.
        _(Both shipped 2026-07-26, `CLAUDE-P0-CHARTSTYLES-AYAN-01` REVIEW:
        **South** = sign-fixed 4×4 grid + lagna wedge; **East** = Bengali
        diamond-in-square, convention verified (Rashi-fixed, Aries top-centre,
        anti-clockwise) with lagna-compartment tint. Three-way North/South/East
        toggle, choice persisted in URL (`cstyle`); degrees + retro on both. Gate
        `chart-styles-ayanamsha.cjs` pins both layouts. Open: deploy + sign-off.)_
  - [ ] Keep and expose multiple ayanamshas without changing Ganak's default
        Lahiri + mean Rahu/Ketu convention. _(Shipped 2026-07-26,
        `CLAUDE-P0-CHARTSTYLES-AYAN-01` REVIEW: Lahiri (default) + Raman + KP +
        True Chitrapaksha selectable in the Kundli screen; changing it auto-recasts
        a live chart; gate pins the offsets + verifies the Raman shift. Default
        unchanged. Open: deploy + sign-off.)_
  - [ ] Complete the general Dosha explanation layer and finish Ruling Planets,
        reusing existing engine work only after rule/anchor verification.
  - [ ] Complete the answer-before-data life interpretation layer so the public
        Kundli is more than a collection of technical tables; qualify uncertainty
        and keep detailed calculations available below each plain-language result.
        _(Modules and current-main hookup complete: bilingual 27-nakshatra/12-sign
        data, six-area builder, answer-first card, release guard and non-vacuous
        copy/safety gate. Because Jyotish is already public, the card and its nav
        link remain hidden until all sign entries are owner-verified. Still open:
        owner high-risk content review, EN/HI phone visual QA, release and
        production verification.)_
  - [x] Downloadable Kundli PDF and general PDF reports, with bilingual rendering,
        chart legibility and print verification. _(Shipped 2026-07-26,
        `CLAUDE-P0-PDF-PRINT-01` REVIEW. Owner chose **browser print-to-PDF**
        (no heavy deps, offline): global `@media print` stylesheet hides the
        interactive chrome, expands collapsibles and prints a clean report; a
        bilingual "Save as PDF" button + print-only report header (name · DOB ·
        place · ayanamsa · Ganak) on both the **Kundli** and **Match** results.
        Gate `print-reports.cjs`. Open: deploy + owner sign-off + print QA on a
        real printer/PDF.)_
      _(P0-JYOTISH-PUBLIC-LAUNCH; owner scope 2026-07-21)_
- [ ] **P0 before go-live — matching and marriage-completion suite.** Finish
      Dashakoota alongside the existing Ashtakoota path; add a downloadable match
      PDF/report and a clearly qualified marriage prediction/timing view. State the
      method and limitations; never present a match score or timing estimate as a
      certainty. _(P0-MATCHING-LAUNCH; owner scope 2026-07-21.
      **Dashakoota + explanations + marriage timing shipped 2026-07-26,
      `CLAUDE-P0-MATCHING-DASHAKOOTA-01` REVIEW:** 10-koota South-Indian system
      (36 pts, Rajju/Vedha hard-blocks) beside Ashtakoota with a bilingual table +
      verdict bands + dosha callouts; a heavily-qualified marriage-timing section
      in the Kundli screen (`#marriage`) listing supportive Venus/Jupiter/7th-lord
      dasha windows with a "not a prediction" caveat. Gates `dashakoota.cjs` +
      `marriage-timing` engine. **Still open: downloadable match PDF/report**
      (part of the PDF-reports epic), deploy + owner sign-off + 2nd bug bash.)_
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
      Shipped 2026-07-22: twelve distinct bilingual answer-first routes; Lahiri
      Vedic and tropical Western methods visibly separated; permanent canonical
      metadata; calculation/method source map; approved-inventory and exclusion
      guard; canonical gates/build; EN/HI desktop and 390px phone smoke; live
      production verification. **Reopened by the independent 2026-07-24 bug bash:**
      fix independent birthplaces for Western relationship; reject a cleared or
      unselected place instead of calculating with stale coordinates; reject future
      death dates and prevent pre-death annual rows in Shraddha Tithi; add graceful
      unsupported-calculator routing; localize Hindi naming syllables. Re-run the
      full 60-minute adversarial matrix before restoring 100% closure.
      _(P0-UTILITY-CALCULATORS; owner scope 2026-07-21)_
- [ ] **P0 — Calculator pages must be content-rich, not one-line answers (owner,
      2026-07-25).** Owner feedback on the dosha calculators: the pages are "very
      surface level" — an answer line and a method note, but they "don't render or
      explain anything to an enthusiast." An astrologer reads a chart themselves; the
      people who actually use a calculator are curious non-experts who want to
      *understand*. Every calculator page (all vedic + western utility routes AND the
      dosha pages) must teach: what this concept is (plain, sourced), how the user's
      own result was derived (the specific placements that produced it, not just the
      generic rule), what it means in balanced non-fatalistic terms, common myths vs
      reality, and when/whether to consult a qualified person. Keep answer-first, keep
      it bilingual and phone-readable, keep sources/conventions honest.
      **Follow-up (owner, 2026-07-26): describe IMPACT, not just a taxonomy.** The
      v2 dosha pages now *list* the kinds (12 Kala Sarpa types, 5 Pitra forms, 6
      papa houses) but only give a one-line descriptor per entry — they still don't
      tell the reader *how each one actually affects life* (temperament, timing,
      the areas it colours, what tends to ease it). Every enumerated type/form must
      gain a short, non-fatalistic "how it tends to show up / what helps" impact
      note, and the user's own type should get an expanded personalised read — not
      just a highlight. Then roll the full template to the remaining calculators
      (Mangal Dosha, Sade Sati, Rashi, Nakshatra, Lagna, etc.). Applies
      retroactively to the shipped `CLAUDE-P0-DOSHAS-01` pages
      (`/calculator/kala-sarpa`, `/pitra-dosha`, `/papa-dosha`). _(P0-CALCULATOR-DEPTH)_
- [ ] **TESTING STANDARD — calculator-type features need 4–5 recorded adversarial
      rounds before Done (owner, 2026-07-25).** Prompted by a stale-result bug the
      owner caught on the live dosha calculators (result did not visibly refresh
      after changing inputs; fixed in `CLAUDE-P0-DOSHAS-01` by auto-clearing the
      result on any input change). For any calculator/finder-style feature (utility
      calculators, muhurat/prashna finders, matching, dosha pages), a minimum of
      **4–5 iterative test→fix rounds** must be recorded in `plans/task-log.md`
      before it is marked Done — covering: re-calculation after every input change
      (date, time, place, language, second person), stale-result clearing, the
      unconfirmed/blank/stale-place guard, boundary and invalid inputs, EN/HI and
      phone-width, and live production behaviour (not just localhost). Gates prove the
      maths; these rounds prove the *interaction* works. This is in addition to the
      two-agent 30-minute bug-bash rule in the closure contract. _(TEST-STD-CALCULATORS)_
- [ ] **P1 — script/language consistency for rashi, nakshatra and planet names
      (owner, 2026-07-26).** In Hindi mode, sign (rashi) and nakshatra names — and
      in places planet names — still render as Latin transliteration (e.g. "Kumbha
      (Aquarius)", "Dhanishta", "Saturn") instead of Devanagari (कुम्भ, धनिष्ठा,
      शनि). Today localization is patchy and per-screen: `UtilityCalculatorScreen`
      has ad-hoc `SIGN_HI`/`TERM_HI`/`PLANET_HI` maps and `localTerm`/`signOnly`
      helpers, while `SIGNS`/`NAKSHATRAS`/`PLANET_DEVA` from the engine are mixed
      Latin. This leaks English into Hindi journeys across the dosha pages, Kundli
      screen, utility calculators and matching. Solution (design later): ONE shared
      bilingual lookup for the 12 rashis, 27 nakshatras, 9 grahas (+ tithi/yoga/
      karana already partly done) used by every screen, so `lang` alone flips the
      script everywhere; remove the scattered per-file maps. Add a gate that fails
      if a user-facing sign/nakshatra/planet string renders Latin while `lang==="hi"`.
      Cross-cutting; coordinate with EPIC-DS. _(I18N-DEVANAGARI-TERMS)_
- [ ] **P0 before go-live — exceptionally strong Panchang and calendar parity.**
      Ganak must close every gap identified in the 2026-07-21 competitor comparison,
      while retaining answer-before-data, Hindi/English journeys, local-time accuracy
      and the no-ads-on-Panchang rule. “Present in the engine” is not complete until
      it is visible, explained, validated and phone-usable. Required scope:
  - [x] Dedicated Bhadra/Vishti interval and warning; Dur Muhurat; Varjyam; Amrit
        Kalam; Brahma, Nishita, Godhuli and reusable Pradosha Muhurtas.
  - [x] Chandrabalam, Tarabalam, Disha Shool/Vara Shula, Nalla Neram, Gowri Nalla
        Neram and Anandadi Yoga.
  - [x] Dedicated Sarvartha Siddhi, Amrita Siddhi, Ravi Yoga, Ravi/Guru Pushya,
        Dwipushkar, Tripushkar and Ganda Moola calculations/calendars.
  - [x] Ritu/season, solstice/equinox and Vedic/Ghati clock.
  - [ ] **Direct date entry and better Panchang date picker.** The current calendar
        popup forces month-by-month navigation, which is painful when checking a
        far-future or past Panchang date. Add a direct typed date input plus a
        year/month jump picker so a user can enter or select a specific date quickly.
        The selected date must survive URL reload/Back/Forward, respect the selected
        city/timezone, validate invalid dates visibly, and never reset unless the
        user explicitly chooses today or changes the date. _(Backlog #58;
        owner feedback 2026-07-29)_
  - [x] User-controlled lunar/Gregorian presentation, Amanta/Purnimanta switch and
        pre-launch Tamil Thirukanitha/Bengali Vishuddha Siddhanta calendar-base
        switches. Complete Tamil/Bengali-language journeys remain a separate
        post-launch item; both named calculation/base modes are required now.
        Implementation must follow the isolation, invariance, differential-testing,
        staged-rollout and fallback contract in
        `plans/regional-calendar-risk-plan.md`.
        Shipped 2026-07-22: both named regional modes, native month labels and
        year/day interpretation; 730 dual-published daily anchors, 5,110 full-year
        seven-city differentials with zero unexplained mismatches, 25 observance
        anchors, 24 native terms, URL-backed place/date/language/mode state,
        production shadow comparison and independent edge kill switches.
  - [ ] Printable/PDF calendar, Google Calendar/calendar-feed export, reminders and
        push integration, with selected city, timezone and language preserved.
  - [ ] Public/national holidays and approved calendar overlays. Core data and
        calculation separation shipped 2026-07-22:
        three national dates plus the opt-in 17-date 2026 Central Government
        gazetted layer, explicit jurisdiction/year and moon-notification labels,
        URL-backed toggle, blue collision-safe calendar marks, EN/HI phone/browser
        checks and a permanent source/inventory gate. State, bank and local closures
        remain correctly outside this Central layer rather than being guessed.
        **UI placement implemented 2026-07-24:** empty holiday cards are removed and
        the off/national/gazetted control sits in the Daily calendar-options row beside
        the calendar convention selector. Final closeout now needs EN/HI phone/desktop
        bug bash, URL restoration, calendar-marker discovery and production verification.
      _(P0-PANCHANG-CALENDAR-PARITY; owner scope 2026-07-21)_
- [ ] **P0 before go-live — exceptionally strong festival and vrat completion.**
      Close every festival/vrat gap in the competitor comparison: complete all
      openable-label pages, full local timing, household guidance, fasting/paran,
      explicit regional distinctions, sect/calendar distinctions where supported,
      printable/exportable festival calendars and opt-in reminders. Specifically:
  - [ ] **P0 story-quality correction — replace significance summaries with
        genuine devotional narratives.** The public heading **“Stories Remembered”**
        must contain stories, not recycled significance copy, symbolism, ritual
        instructions, regional notes, editorial caveats or one-line associations.
        Complete the following batches strictly in this order:
    1. **Six Bengal Durga Puja pages:** Mahalaya, Shashthi, Saptami, Ashtami,
       Navami and Vijaya Dashami.
    2. **Major festivals:** the five-day Diwali sequence; Holika Dahan and
       Rangwali Holi; Chaitra and Sharad Navratri; Dussehra; Janmashtami; and
       Ganesh Chaturthi.
    3. **Other annual festivals** in the complete published guide inventory.
    4. **Recurring vrats**, including Ekadashi, Pradosh, Purnima and Sankashti.
    5. **Regional and monthly observances** in the complete published guide
       inventory.

        A qualifying story names its central figures, establishes the situation or
        conflict, narrates what happened, gives the outcome and explains why the
        episode is remembered for that observance. Move existing non-story material
        to “Why this day matters”, “Regional traditions”, worship steps or an
        appropriately labelled living-tradition/source note; do not discard accurate
        material merely because it was in the wrong section. Each story must be a
        concise, readable devotional narrative rather than an essay, with natural
        independently reviewed English and Hindi versions. Record scriptural,
        documented living-tradition or regional/oral provenance internally and label
        differing traditions without presenting one as universal.

        **Definition of done:** all five batches are complete; every published guide
        has at least one relevant narrative with named figures and action (or an
        explicitly justified non-narrative observance whose section is renamed);
        no story entry is merely symbolism, practice, disclaimer or metadata; source
        traceability exists; EN/HI desktop and phone presentation is readable; and a
        strengthened semantic regression gate rejects short associations, misplaced
        ritual/regional/editorial prose and duplicated generic stories. The gate must
        be proven non-vacuous by deliberately substituting significance copy into a
        story fixture and showing that validation fails. The slice is not complete
        after Mahalaya or any single batch.
        _(P0-FESTIVAL-STORY-QUALITY; owner scope 2026-07-22)_
  - [x] Bengal Durga Puja: separate, substantive Mahalaya, Shashthi, Saptami,
        Ashtami, Navami and Vijaya Dashami pages. Shipped and production-verified
        2026-07-22 with six exact Delhi date anchors, devotional EN/HI guidance,
        desktop + 390px route matrix and permanent content/timing gates.
  - [x] Separate substantive Skanda Sashti sequence and Ayyappa Mandala sequence
        pages (five milestone routes with distinct guides, sequence UI and
        multi-year anchors). Chhath four-day journey closed under row #29.
  - [x] Eighteen season-specific Chaitra/Sharad Navadurga pages plus the sourced
        Durga Saptashati reading plan; Gupt Navratris stay distinct.
  - [x] Location-aware eclipse visibility, contact windows, Sutak start/end and
        safe household guidance. Shipped 2026-07-24 with topocentric solar
        visibility, lunar moonrise overlap, no-Sutak handling for non-visible
        cities and EN/HI festival + MuhuratHub wiring.
  - [ ] **Aarti section — full aarti lyrics on festival/vrat pages.** Add a
        collapsible Devanagari aarti (with an English meaning line in EN mode) after
        the Puja section of each relevant guide, rendering in both the in-app Fasts
        & Festivals list and the standalone `/festival/...` routes. Design:
        `docs/superpowers/specs/2026-07-25-festival-aarti-section-design.md`. Phase 1
        = North Indian deity festivals & vrats; Phase 2 = remaining/regional.
        _(P1-FESTIVAL-AARTI; owner scope 2026-07-25)_
    - [ ] **Aarti content sourcing & proof-reading (the substantive work).** For each
          aarti, cross-validate **2–3 authentic sources against each other** and enter
          the most widely-sung standard Devanagari text with zero transcription errors.
          Handle known challenges: regional/sampradaya **wording variants** (choose the
          common version, add a non-prescriptive "your family's wording may differ"
          note consistent with the app voice); **which aarti maps to each festival**
          (editorial mapping; a festival may carry more than one); **Devanagari
          orthography consistency** (ॐ vs ओम्, anusvara/chandrabindu, half-letters,
          nukta — sources agree on words but differ on spelling); **provenance/
          copyright** (confirm each is genuinely traditional/public-domain, not a
          modern copyrighted arrangement) recorded per aarti in a citations doc like
          the existing festival-guide research file. Must pass the new
          `validation/festival-aarti.cjs` gate **and** the row-#29 quality bar
          (independent EN/HI review, two-agent bug bash, production verification).
          _(P1-FESTIVAL-AARTI-CONTENT; owner scope 2026-07-25)_
    - [ ] **Aarti discoverability UI — find/open an aarti directly.** Beyond embedding
          aartis in guides, add a direct way to reach one: a dedicated aarti
          finder/index, input-driven navigation (user types/searches a deity or
          festival → lands on its aarti), and stable per-aarti deep-links. Reuse the
          existing search/route patterns; keep additive to current festival routes.
          _(P1-FESTIVAL-AARTI-FINDER; owner scope 2026-07-25)_
    - [ ] **Aarti SEO.** Per-aarti page titles, meta descriptions and structured data
          so each aarti is search-discoverable (e.g. "Lakshmi Aarti — Om Jai Lakshmi
          Mata"), consistent with the existing festival-page SEO work. Depends on the
          finder/deep-link routes above.
          _(P1-FESTIVAL-AARTI-SEO; owner scope 2026-07-25)_
  - [ ] **P0 owner-quality reset — audit and rewrite every festival/fast page.**
        Owner rejected the current festival and fast page quality on 2026-07-24;
        previous automated route/profile/katha gates no longer count as quality
        acceptance. Create a dedicated task that audits every festival, vrat, fast,
        recurring observance and named variant page, records defects route by route,
        rewrites weak English/Hindi devotional copy, verifies timing/profile/hero
        relevance, strengthens semantic gates, and completes at least **five**
        iterative test-fix rounds by a minimum of **two agents** before any Green
        closeout. Do not restore row #29 to Done/100% without those rounds,
        full gates, phone/desktop smoke and production verification recorded.
        **Hero-art note 2026-07-28:** the real raster pipeline and first three images
        (`diwali`, `ganeshChaturthi`, `sankashti`) are preserved; remaining festival
        heroes are batchable row-#29 quality work, not an active Cursor source edit.
      _(P0-FESTIVAL-VRAT-PARITY; owner scope 2026-07-21)_
- [ ] **P0 before go-live — exceptionally strong Muhurat parity.** Complete every
      gap from the competitor comparison and keep the verdict/explanation stronger
      than a raw date list:
  - [ ] Deep, separately validated engines and pages for marriage, engagement,
        property purchase, vehicle purchase, Bhoomi Puja/construction, business,
        travel, housewarming and document signing/registration. The existing generic
        “purchase” category does **not** close the property or vehicle gaps.
        **Implementation pass 2026-07-24:** eight distinct public finder categories
        now have separate chips/guidance, rule tables, blockers and clean-window
        logic, with `validation/deep-muhurats.cjs` guarding against fallback to
        generic purchase/business behavior. Cursor bug bash found and fixed one P2
        stale footer-copy issue. Cursor's implementation is merged; rows #16/#17
        stay below 100% until Claude Code completes the reserved second bug-bash
        pass and production verification follows the push.
  - [x] Samskara Muhurtas: Mundan/tonsure, Namakaran, Annaprashan, Vidyarambha and
        Upanayana, with tradition and regional conventions stated.
  - [ ] Birth-chart-personalized Muhurat only after its method is sourced and
        validated; never silently mix natal filtering into the general finder.
  - [ ] Save/share/export the chosen Muhurat and create calendar reminders.
  - [x] Surgery/medical Muhurat under the separate Claude research brief
        `plans/claude-task-surgery-medical-muhurat.md`. It is strictly for optional
        timing preferences around clinician-approved, non-urgent care; it must never
        delay urgent treatment or claim to improve medical safety/outcomes.
        **v1 shipped 2026-07-25** (owner-approved Option C): dedicated route
        `/muhurat/medical`, safety wall first + mandatory "timing is flexible"
        checkbox, conservative Purnima/Amavasya avoidance (covers eclipses),
        neutral Abhijit Muhurta + Rahu Kaal, honest krura-karma tradition note,
        plus an optional opt-in Janma Rashi (birth Moon-sign, R10) overlay. No
        birth chart required in the base finder, no outcome score, no storage.
        Merged to `main`. Body-part Moon rule (R9) intentionally omitted. Engine
        `src/engine/medical-muhurat.ts`; gate `validation/medical-muhurat.cjs`;
        findings `plans/claude-medical-muhurat-findings.md`. **Closed at 100% on
        2026-07-28:** independent Codex bug bash fixed safety-wall order, polar
        no-sunrise copy and bypassed future birth dates; PR #4 merged as `557664c`;
        production EN/HI 320px verification passed with zero overflow or console errors.
      _(P0-MUHURAT-FULL-PARITY; owner scope 2026-07-21; v1 built 2026-07-25)_
  - [x] **Independent review + bug bash of the medical Muhurat feature** — completed by a
        different agent (Cursor/Codex) than the builder (Claude Code). Second
        adversarial pass on live `/muhurat/medical`: engine correctness
        (Purnima/Amavasya + eclipse coverage, Abhijit/Rahu Kaal, natal Janma Rashi
        overlay), safety framing (safety wall first, confirmation gates the finder, no
        medical-outcome/success claims), DST + high-latitude places, EN/HI at 320–390px,
        and regressions on the F1–F3 fixes. F4–F6 were fixed with TDD and verified
        in production. Brief/refs: task-log row
        `MEDICAL-MUHURAT-BUGBASH-02` and `plans/claude-medical-muhurat-findings.md`.
      _(follow-up to P0-MEDICAL-MUHURAT v1; owner-requested 2026-07-25)_
- [ ] **P0 before go-live — discoverability, publishing and public platform.** Ship
      all of the following as launch gates rather than post-launch polish:
  - [ ] Clean path-based routes for every public screen and calculator; preserve
        redirects for old `?screen=` links and the selected language.
  - [ ] Unique browser title, description, canonical URL and social/share metadata
        per page; sitemap, robots rules and broad but substantive SEO landing pages.
  - [ ] Editorial astrology/news publishing area with authorship, dates, corrections,
        sources, topic/archive routes and a standard that prevents thin SEO pages.
  - [ ] A documented, rate-limited public developer API with versioning, keys,
        quotas, abuse controls, privacy terms and stable error contracts. Local
        implementation and the 2026-07-24 adversarial bug-bash fixes are merged;
        production hosting, API keys and live smoke remain before closure.
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
- [ ] **P0 before go-live — complete festival and vrat page-link coverage (no
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
      rules: `plans/festival-page-link-inventory.md`. **Technical route coverage
      shipped 2026-07-22:** Bengal Durga Puja ×6 substantive guides + routes; zero
      deferred labels. **Reopened 2026-07-24:** owner rejected the actual festival
      and fast page quality; route existence is not enough for closure.
      _(P0-FESTIVAL-PAGES-ALL — shipped 2026-07-22)_
- [ ] **P0 BUG BASH — festival interaction dead ends and invisible expansion.**
      Calendar year/search rows are true static dead ends. The Fasts & Festivals
      list technically expands inline, but has no visible state affordance,
      `aria-expanded`, scroll/reveal behavior or direct-page navigation, so a
      phone tap appears to do nothing. Audit every festival/fast entry surface,
      use one consistent row-action contract, wire canonical pages, preserve
      language/city/date/tab/Back state, add route-derived interaction and
      accessibility gates, then complete an EN/HI phone/desktop bug bash with at
      least two agents and production verification. Full brief:
      `plans/festival-interaction-dead-end-bugbash.md`.
      **Fix delivered locally + 2 independent audits (`P0-FESTIVAL-INTERACTION-DEAD-END-BUGBASH`, 2026-07-28):**
      one interaction contract across every festival/fast surface — CalendarPage
      year+search dead rows and MuhuratHub F&F rows now open the canonical
      `/festival/...` page via real `<a href>` (lang+city preserved); the F&F
      inline preview is a separate accessible chevron toggle
      (`aria-expanded`/`aria-controls`, open-state chevron, in-viewport reveal,
      bilingual "Open full guide"); tithi-only rows stay non-interactive; unmapped
      keys show a visible bilingual error. New route-derived gate
      `validation/festival-interaction.cjs` (166 keys + live engine emission
      coverage + 11 element-scoped failure fixtures, prove-the-guard verified).
      Live-verified EN/HI at 390×844 + 1280px; both audit agents PASS (gate
      hardened after audit). **Shipped `main` `2e3b4c4`, Cloudflare-deployed and
      production-verified on `ganak.pages.dev`:** HI phone + EN desktop F&F links,
      259 former-dead full-year rows now links, real click → guide (lang+city
      preserved) → Back restores the list, no overflow, zero console errors.
      A round-3 pass also caught + fixed two more daily-screen dead-ends (the
      "Coming up" summary rows and the answer-first observance chip, `b8a4ef7`);
      a round-4 independent audit (state/keyboard/entry-type matrix) passed and
      closed one gate gap (`e99a2e7`). **Still open before check-off:** owner
      live-URL sign-off only.
- [x] **RESOLVED 2026-07-29 — Fasts & Festivals row: one consistent action
      (owner chose Option A).** Owner reported the row behaved inconsistently
      (sometimes an inline preview, sometimes straight to the page) and read it as
      an EN/HI difference. **Root cause:** the row had two actions — a wide
      name-link (navigate) plus a separate 46px chevron (expand inline preview);
      identical in EN and HI, so the perceived language difference was just which
      control was tapped. **The dual-action row was the UX problem.** Owner chose
      **Option A: the whole row opens the canonical festival page; inline preview
      dropped entirely** — now consistent with the CalendarPage rows, "Coming up"
      rows and observance chip, which were already whole-row links. Implemented in
      `src/screens/MuhuratHub.tsx` (removed the toggle + inline panel + `fexp`
      state and now-orphaned imports/helpers) and the gate
      `validation/festival-interaction.cjs` rewritten to assert no toggle /
      aria-expanded remains and every festival/fast surface is a whole-row anchor.
      The per-entry timing that the preview used to show (parana, arghya,
      ghatasthapana, eclipse sutak, vrat vidhi) is unchanged on the dedicated
      festival page the row now opens — one tap away, not lost. Verified EN/HI at
      390×844: 0 toggles, whole-row links navigate (incl. eclipse/named-Ekadashi),
      Back restores the list, 0 console errors. Gates + build green.
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
      deep-linked URL for feedback. **Q1 closed 2026-07-22** after owner production
      approval and independent bug bash `CURSOR-BUGBASH-PRASHNA` (F1–F4 fixed in
      `fc82a52`). 249 number engine remains blocked on `P0-PRASHNA-249-KSK-VERIFY`.)_
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
      **First-pass citation index 2026-07-24: `plans/prashna-249-ksk-verify.md`.**
      Confirmed **Reader VI — *Horary Astrology*** is the primary text (correcting a
      secondary-source Reader III mis-attribution). 4/8 core rules primary-text verified
      (number→lagna, ruling planets, significators, repeat/sincerity); 4/8 remain
      web-corroborated pending **Reader II** page-pin (the 249 Vimshottari basis and the
      cuspal-sub-lord-as-final-judge thesis, the 12th-from negation) — whose-place stays
      a Ganak self-service adaptation, not KSK doctrine. Book-strict closure still needs
      an owned-copy page-pin + the KP-ayanamsa constant (KP-Old vs KP-New).
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
- [ ] **Kundli life interpretation — "Classic life-areas" mode (TO BE DECIDED LATER).**
      The v1 interpretation card ships the low-risk **Character & aptitude** set
      (Nature · Mind · Strengths · How you relate · Work leanings — see
      `docs/superpowers/specs/2026-07-23-kundli-life-interpretation-design.md`).
      A second **Classic life-areas** set (Personality · Career & wealth · Marriage
      & family · Health · Fortune) was explicitly deferred by the owner 2026-07-23,
      NOT dropped. It is gated on (a) the engine gaining house-lord / D-9 logic those
      areas honestly require — nakshatra + Moon sign alone can't derive them — and
      (b) an owner decision on the fatalism/health/wealth-claim risk. Revisit once
      Phase-1 feedback shows whether users actually ask for predictive life-areas.
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
- [ ] **Global site search / guided input (before go-live):** a user who does not
      know where a festival, vrat, muhurat, calculator or Panchang term lives should
      not be clueless. Add a prominent search/input box that accepts English, Hindi,
      Sanskrit/transliteration and common aliases, then routes to the right page or
      shows clear suggestions. It should cover public festival pages, recurring
      vrats, calculators, Muhurat needs, Panchang terms and help-style questions;
      no dead-end results, no browser storage, and phone keyboard UX must be tested.
      _(Backlog #59; owner feedback 2026-07-29)_
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
- **E-1.0 English (Western) sign names in EN mode — sidereal preserved (owner, 2026-07-28).**
  In English mode, show the 12 rashi by their English names (Mesha→Aries … **Kanya→Virgo**
  … Meena→Pisces) instead of the romanised Sanskrit. **Calculation stays 100% sidereal
  (Lahiri)** — this is a *label* change only; "Virgo" here means the sidereal sign, not
  tropical. Hindi mode keeps कन्या etc. **Blast radius mapped:** `src/engine/panchang.ts`
  `SIGNS` (already `"Mesha (Aries)"`), `PrashnaScreen.tsx` local `RASHI_EN` (**inside the
  parity-frozen markers** — display-only, parity compares numbers not names, but edit
  carefully), `UtilityCalculatorScreen`, `MuhuratHub`, `daily-windows.ts`, the Daily gochar
  line; update gates `prashna-calc.js` + `vedic-season-clock.cjs` if they assert Sanskrit
  strings. **Keep Sanskrit for proper festival names** (`Kanya Sankranti` etc. in
  `festival-meta.ts` — those are event names, not sign displays). Folds in the
  language-leak fixes (leaked Hindi planet names like `शुक्र` on the EN gochar line).
  **Owner directed: proceed.** Being executed as a focused pass; also build a permanent
  `validation/language-leak-scan` gate as the "zero leaks" oracle.
- **E-1.1 Western-calculator display — rethink (owner, 2026-07-28).** The app keeps a
  Western/Tropical calculator group (`western-natal`, `western-relationship`) deliberately
  separated from Vedic. Owner wants it **kept for now but presented better** (it's a
  sidereal-first app; Western sits awkwardly beside it). Revisit the framing/placement/
  labelling — e.g. clearer "not our core method" separation, or a distinct section — as a
  product/UX decision. Not a removal; a presentation rethink.
- **E-1.2 Back-button behaviour on city change — DEFERRED (owner, 2026-07-29).** Commit
  `e63a38d` changed the place-URL write from `pushState` → `replaceState` (`setPanchPlace`
  in `src/kundli-app.tsx`), so the browser Back button no longer returns to the previous
  city (it exits the screen instead). Owner: **leave as-is for now, observe user behaviour,
  decide later.** Trade-off: `pushState` = Back undoes the last city change but can pile up
  history if many cities are tried; `replaceState` (current) = Back exits cleanly but no
  city undo. The `regional-calendar-modes` gate now accepts either wiring so it no longer
  blocks on this deferred choice. Revisit with usage data.

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
