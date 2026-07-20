# Ganak — Product Backlog

Rebuilt 2026-07-18 into a phased launch plan reflecting the owner's strategy.
Status verified against `src/kundli-app.tsx`, not assumed.

## Strategy (owner, 2026-07-18)

- **Free to start.** Hook users first, gather heavy user feedback, let real usage
  guide the roadmap.
- **Fastest path to a web launch**, leading with Panchang.
- **Phase 1 web scope:** Daily/Panchang + Prashna + Muhurat visible. Birth-chart
  section hidden until it's polished + partly monetizable.
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

## PHASE 1 — Free web launch (Panchang + Prashna + Muhurat)

Small scope on the *plumbing*, but the **content is NOT ready** — the Panchang
is the flagship and its observance coverage is ~30%. Content gates below are
first-class launch blockers, not nice-to-haves.

**✅ LAUNCH TENSION RESOLVED (owner, 2026-07-18): baseline now, grow after.**
Launch bar = Tiers 1+2 wired & verified (mostly done) + vrat vidhis for the ~15–20
most-observed fasts. That's the "credible baseline" — weeks, not months. The
exhaustive beyond-Drik long tail (Tier 3) grows *post-launch*, fed by user feedback.
So Phase 1's content gate is now finite and near, not open-ended.

**Content gates (must clear before a credible Panchang launch — scope = all 4
traditions + regional + beyond-Drik, see §C-SCOPE):**
- [ ] **P1-CONTENT: Fasts & festivals coverage** — see the Content Track (§C1).
      Fill the tradition + observance gaps (Shakta, Tamil/regional, missing
      tithi vratas: Skanda Shashti, Gupt Navratri, Rath Yatra, Sheetla Ashtami,
      Durgashtami, etc.). Method: diff vs Drik + beyond-Drik sources + owner
      walkthrough. Enabling step: move content to a structured data file (§C-SCOPE.4).
- [ ] **P1-VRATVIDHI: Vrat vidhis & fasting guidance** — see §C2. For each fast:
      the vidhi (how to observe), what's permitted/forbidden to eat, sankalpa,
      puja steps, timing/paran (breaking-fast window), and udyapan where it
      applies. Owner wants this *on* the Panchang launch, not later. Sourced +
      owner-verified, never AI-invented (§C-SCOPE.3).

**Plumbing:**
- [ ] **Hide the birth-chart tab** for launch (leaves Daily + Prashna; Muhurat
      lives inside Daily). Also removes the currently-broken "Save charts" feature
      from the free tier automatically (it lives inside the Chart tab).
- [ ] **Deploy to a web host** — this IS the web launch. App only runs on
      localhost today. Static Vite build → free tier (Vercel / Netlify /
      Cloudflare Pages). No backend needed for this scope.
- [ ] **Error monitoring** — owner wants failure points logged. Phone-only means
      crashes are invisible without this. Sentry free tier or similar.
- [ ] **Analytics + a feedback channel** — owner wants "immense user input."
      Privacy-friendly analytics + an in-app feedback button/form.
- [ ] **Light privacy note** — needed once analytics is added.
      _Draft exists: `plans/legal-privacy-terms-draft.md`. Ship blockers from §4:_
  - [ ] **Fix false footer + self-host fonts** — `CLAUDE-LAUNCH-PRIVACY` (Claude).
  - [ ] Run `server` smoke suite (Claude — was UNRUN in sandbox).
- [x] Optional polish before launch: Muhurat window labels bilingual (E-0.7). _(CHIP-B)_
- [x] **MuhuratHub startup perf** — kill 16.6s sync 400-day scan.
      `CURSOR-MUHURAT-PERF` (async + 90d) + `CURSOR-LUNAR-CACHE` (shared
      lunation window for `amantaMonthIdx`) → scan90 ~0.7s, scan400 ~1.1s.
      Still open: sunEvents reuse, sunSidMs investigate
      (`plans/perf-startup-scan.md`).

**Product polish (recommended for launch, in-place, no rewrite):**
- [ ] Everyday-zone nav cleanup + gut MuhuratHub — see **EPIC-IA**.
- [ ] Design-system pass (universal Card, spacing scale, shared primitives) —
      see **EPIC-DS**. Directly fixes the "visual inconsistency" pain.

**Not needed for Phase 1:** accounts, data persistence, backend proxy, AI,
Android, SDUI/paywalls. Deliberately out of scope to keep the launch fast.

---

## PHASE 2 — Broaden the free app, iterate on feedback

- [ ] **Reveal the birth-chart section** once its deep sub-section glosses are
      translated (E-0.6) and it's had a polish pass. Full Jyotish, still free.
      Apply the Jyotish-zone hierarchy (Kundli/Dashas/Matching/Tools/Vault
      sub-nav) at this point — see **EPIC-IA**.
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
- Sade Sati tracker — needs backend + push
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
**Status: partially in motion (Phase 1 already leads with Everyday, hides Jyotish).**
The organizing insight: Ganak is two culturally-distinct zones under one brand —
- **Everyday zone** (householders + diaspora): Panchang, Muhurat, Festivals, Hora,
  Prashnavali. Warm, plain-language, scannable.
- **Jyotish zone** (serious practitioners, lower-priority persona): Kundli, Dashas,
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
- [ ] **Jyotish-zone hierarchy (Phase 2, with the chart reveal):** the 17 flat
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
- **Fasts & festivals** — ⚠️ *engine built, content ~30% covered.* 400-day scan
  works, but only ~14 festivals + ~7 monthly observances, and only Smarta +
  ISKCON traditions. NOT launch-ready — see Content Track §C1. (Was wrongly
  marked Done before 2026-07-18.)
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
