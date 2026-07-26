# Birth-chart-personalised Muhurat (v1) — design

**Status:** design approved by owner — ready for implementation plan
**Author:** Claude, 2026-07-25
**Branch:** `claude/personal-muhurat` (off `main` @ `2a00313`)
**Backlog:** `P0-MUHURAT-FULL-PARITY` — *"Birth-chart-personalized Muhurat only after
its method is sourced and validated; never silently mix natal filtering into the
general finder."* (`plans/backlog.md`)

---

## 1. Goal

Let a user personalise the existing Muhurat finder with their **birth details** so the
recommended days are filtered and ranked by classical **natal timing strength**, while
the general (no-birth-details) finder stays exactly as it is today. A householder should
be able to say "of your good marriage days, these suit *your* birth star" without any
astrologer knowledge — answer-first, bilingual, honest.

## 2. Scope

**In (v1):**
- An **opt-in** "Personalise with your birth star" panel inside the existing Muhurat
  finder (`MuhuratHub`), for the general finder categories (marriage, engagement,
  property, vehicle, Bhoomi/construction, business, travel, housewarming, documents).
- Three natal filters, all reusing already-shipped validated engines:
  - **Tarabala** (birth Nakshatra → day's Moon-star), `taraBala` reused.
  - **Chandrabala** (birth Moon-sign → day's Moon-sign, waxing/waning aware),
    `chandraBala` reused.
  - **Advanced strength** = the day's transit **Moon Bhinnashtakavarga bindu count**,
    via `computeKundli` → `computeAshtakavarga` reused.
- Owner-chosen behaviour: **filter weak days out automatically** — implemented as a
  *graded, visible* filter (see §5) so it never silently changes the general results.
- Bilingual (en/hi) throughout, following the app-wide language toggle.
- Birth details held in **URL prefs only, never stored** (project no-storage ban).

**Out (v1):**
- No edits to `src/engine/muhurat.ts`, no edits to the in-review MuhuratHub finder
  logic beyond an additive, isolated personalisation panel. A **new** engine file owns
  all natal logic.
- No outcome score, no "guaranteed auspicious" claim, no per-user persistence.
- No new astronomy. Every value comes from engines the app already computes and ships.
- Medical Muhurat is untouched — it keeps its own dedicated `/muhurat/medical` overlay.

## 3. Why the method is already "sourced and validated"

The backlog gates this feature on a sourced, validated method. It exists in-tree today:

- `taraBala(currentNak)` and `chandraBala(currentSign, waxing)` —
  `src/engine/daily-windows.ts:187,178`. Both are textbook Panchang Muhurta filters
  (Tara 1/3/5/7 = Janma/Vipat/Pratyak/Naidhana avoided; Chandrabala favourable from
  1/3/6/7/10/11 + paksha extras). Already **shipped and personalised in the Daily card**
  (`src/components/DailyWindowsCard.tsx`), so the concept is live and owner-seen.
- `computeAshtakavarga(signOf, ascSign)` — `src/engine/classical.ts:23`. Returns per-sign
  bindu arrays (`bav.Moon`, `sav`) from the natal chart, driven by the standard BPHS
  benefic-point tables. Used by the main Kundli engine (`src/engine/kundli.ts:122`).

Gap: the current gate `validation/daily-windows.cjs` only shape-checks these (lengths
12/27); it does not anchor the auspiciousness *logic* or the bindu totals. This spec adds
a dedicated anchor gate (§6) so the personalisation method is validated, not assumed.

## 4. Architecture

### 4.1 New engine — `src/engine/personal-muhurat.ts` (owns all natal logic)

Pure overlay module. Never mutates a finder day's own fields. Exports:

- `natalAnchors(place, ayanamsa, birth)` → `{ janmaNak, janmaSign, moonBav }`
  - `janmaNak` (0–26), `janmaSign` (0–11) from the birth Moon (reuse `moonSidMs` at the
    birth instant, same technique as `medical-muhurat.ts:natalMoonSign`).
  - `moonBav` = `computeAshtakavarga(signOf, ascSign).bav.Moon` (12-length bindu array),
    where `signOf`/`ascSign` come from `computeKundli` on the birth details.
- `personalFit(anchors, day)` → `{ tara, taraGood, chandraGood, moonBindu, strength,
  coreOk, verdict }` for one finder day.
  - `day` supplies `{ ms, moonNak, moonSign, waxing }` — all already on a
    `muhuratScanRange` result row (or derivable from `ms` via the panchang helpers).
  - `taraGood` = `!(tara in {1,3,5,7})`; `chandraGood` from `chandraBala` lookup;
    `moonBindu` = `moonBav[day.moonSign]` (0–8); `strength` = bucket of `moonBindu`.
  - `coreOk` = `taraGood && chandraGood` (the hard-cut predicate).
- `applyPersonalisation(days, anchors, opts)` → `{ kept, setAside, mode }` implementing
  the graded filter and safety fallback (§5). `days` is the **existing** finder output;
  the function only partitions and ranks it.

Written untyped to match the sibling engines (`muhurat.ts`, `medical-muhurat.ts`).

### 4.2 UI — additive panel in `MuhuratHub`

An opt-in collapsible section rendered *below* the existing finder controls, matching the
medical screen's "Personalise" pattern (`MedicalMuhuratScreen.tsx:128`): birth date, birth
time, and an **independent** birth-place input. Turning it on and supplying valid details
re-partitions the already-computed result list; turning it off restores the untouched
general list instantly. No new shared/nav/token files are edited.

## 5. The graded filter (owner: "filter weak days out automatically")

Honoured, but made explicit and non-silent so it satisfies the backlog rule:

1. **Default (no birth details):** general finder output is passed through unchanged.
   Zero natal logic runs. This is the invariant that keeps the promise.
2. **Hard cut (removed → `setAside`):** a day is removed when `coreOk` is false, i.e. it
   fails Tarabala (tara ∈ {1,3,5,7}) **or** Chandrabala. Each removed day keeps a reason
   so the "tap to view" list can explain it.
3. **Advanced strength = ranking, not a second hard cut:** surviving (`kept`) days sort by
   `moonBindu` desc, then by the finder's own score. A very-low-bindu day (`moonBindu ≤ 2`)
   is **kept but flagged** "weaker strength" — never deleted by strength alone. This stops
   three stacked filters from collapsing the list.
4. **Safety fallback (`mode: "annotate"`):** if the hard cut would leave fewer than **3**
   kept days in the chosen range, the engine does not filter — it returns all days in
   original order, each annotated with its fit, plus a bilingual note
   ("Few days suit your birth star in this range — showing all, marked"). The user is never
   stranded with an empty or near-empty list.

## 6. What the user sees

- **Count line** (top of results, bilingual): "6 of 21 days set aside for your birth star ·
  tap to view" → tapping reveals the `setAside` days each with a plain reason.
- **Fit badge** per kept day (bilingual): birth-star supportive · Moon-sign supportive ·
  strength shown as filled/empty dots (●●●○) from `moonBindu`.
- **One-line honest gloss**, medical-screen tone: a traditional personal-timing guide, not
  a guarantee of outcome — consistent with answer-before-data honesty.
- **Language:** all of the above follow the app hi/en toggle.
- **Storage:** birth date/time/place live in URL prefs only; nothing persisted to the
  device or a server (project ban). Closing the tab clears them.

## 7. Error handling & edge cases

- Missing/partial/invalid birth details → personalisation simply does not apply; the
  general list shows, with a plain bilingual "add your birth date, time and place to
  personalise" prompt. No silent partial filtering.
- Unresolvable birth place / high-latitude sunrise failure in `computeKundli` → fall back
  to annotate-only mode with a visible bilingual note; never crash, never blank.
- Range with no candidate days at all → unchanged from today's empty-state copy;
  personalisation adds nothing to filter.
- Language switch mid-result must not clear the panel or re-run astronomy (UX rule).

## 8. Testing — `validation/personal-muhurat.cjs` (new, TDD)

RED → GREEN → prove-the-guard, mirroring `validation/medical-muhurat.cjs`:

- **Tarabala anchor:** a fixed (birthNak, dayMoonNak) pair pins the expected tara number
  and good/bad (e.g. same-star ⇒ tara 1 ⇒ avoided).
- **Chandrabala anchor:** a fixed (birthSign, dayMoonSign, paksha) triple pins good/bad,
  including a waxing-only extra sign.
- **Ashtakavarga anchor:** one fixed birth chart pins `bav.Moon` per-sign totals and the
  structural invariant `sum(sav) === 337`.
- **Filter behaviour:** a synthetic day list proves the hard cut removes only `!coreOk`
  days, strength ranks (does not cut) survivors, and the `<3` fallback flips to
  annotate-only.
- **Prove-the-guard:** perturb a tara table / bindu value → anchors fail → restore.
- **No-regression:** the general finder path is untouched; `deep-muhurats.cjs`,
  `muhurat-anchors.cjs`, `samskara-muhurats.cjs`, `panchaka-windows.cjs`, `parse-check`,
  and the production build all stay green.

## 9. Isolation / coordination

- New lane, own branch `claude/personal-muhurat` + worktree; own allowed-file list:
  `src/engine/personal-muhurat.ts` (new), `src/data/personal-muhurat-ui.ts` (new),
  a new additive personalisation component, `validation/personal-muhurat.cjs` (new), and
  the minimal `MuhuratHub` wiring for the opt-in panel.
- **Not touched:** `src/engine/muhurat.ts`, shared shell/tokens/nav, the in-review
  MuhuratHub finder logic (rows #16/#17), medical Muhurat. If the MuhuratHub wiring turns
  out to overlap in-review work, coordinate with the owner before editing rather than
  co-writing the file.
- Closeout follows the standing policy: update the acceptance register + sheet sync, run
  all canonical gates + build, browser/phone EN-HI smoke, then owner live-URL sign-off
  and a two-agent bug bash before any 100% closure (backlog bug-bash rule).
