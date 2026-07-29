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
- **Two hard filters + two soft layers.** The hard filters (which can remove a day) are
  both properly-sourced muhurta rules; the soft layers only mark/rank, never remove:
  - **Tarabala** (birth Nakshatra → day's Moon-star), `taraBala` reused. *Hard filter.*
  - **Chandrabala** (birth Moon-sign → day's Moon-sign, waxing/waning aware),
    `chandraBala` reused. *Hard filter.*
  - **Advanced strength** = the day's transit **Moon Bhinnashtakavarga bindu count**,
    via `computeKundli` → `computeAshtakavarga` reused. *Soft — ranks, never removes.*
  - **Special-nakshatra (Adhanadi) caution** — the day's Moon-star at ordinal
    **{1, 10, 16, 18, 22, 25}** from the birth star (Janma, Karma, Sanghatika,
    Samudayika, Vainasika, Manasa). *Soft — the day is **kept and marked**, never removed*,
    and labelled "a personal tradition, not a classical muhurta rule." Owner decision
    2026-07-25 after the source hunt came back negative; see §3.1.
- Owner-chosen behaviour: **filter weak days out automatically** — implemented as a
  *graded, visible* filter (see §5) so it never silently changes the general results.
  Only the two sourced hard filters remove days; strength and the named caution only
  annotate.
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
a dedicated anchor gate (§8) so the personalisation method is validated, not assumed.

### 3.1 Special-nakshatra (Adhanadi) caution — honest provenance (source hunt: negative)

Owner asked (2026-07-25) to hunt a primary text **before** building this rule. The hunt
returned negative, and that result shapes the design: the named set ships as a **soft,
honestly-labelled personal caution**, never a hard filter and never presented as sourced
muhurta doctrine.

- **What is attested (secondary only):** the Adhanadi "special nakshatras" scheme counted
  from the Janma Nakshatra, with names/positions Janma (1), Karma (10), Sanghatika (16),
  Samudayika (18), Vainasika (**22nd** — owner-chosen over the disputed 23rd), Manasa (25).
- **What could NOT be established (two failures):**
  1. **No classical primary text.** Targeted searches for Prasna Marga, Brihat Samhita,
     Muhurta Chintamani and Kalaprakashika found no citation; every detailed source is a
     modern astrology site or teaching note (one explicitly carries no citation).
  2. **Purpose mismatch.** The sources use this set for **transit/gochara timing** ("a
     malefic transiting your Vainasika nakshatra brings loss in that life-area"), *not* for
     **muhurta election**. No reachable source rejects a muhurta day on this basis. The
     ordinals are also unstable across sources (Vainasika 22/23; Abhisheka 13/28).
- **Owner decision 2026-07-25 (after seeing the negative hunt):** include the 6-set as an
  **honest personal/tradition caution** — the day is **kept and marked**, never removed,
  and every surface (UI, spec, acceptance register) labels it *"a personal tradition, not a
  classical muhurta rule."* It never poses as sourced doctrine and never overrides the two
  sourced hard filters.
- **Sources consulted (secondary):**
  `astrobix.com/.../1162-adhanadi-nakshatra-meaning...`,
  `shrifreedom.org/vedic-astrology/navatara-chakra/`,
  `astroveda.wikidot.com/special-nakshatras-taras`,
  `horasarvam.blogspot.com/2023/08/aadhanaadi-nakshatras-special-nakshatras.html`.
- **Open item (surfaced, not parked):** if a primary text is ever found (or the owner
  supplies a lineage text), the caution can be upgraded to a sourced rule — logged as an
  explicit open backlog line, not a silent TODO.

## 4. Architecture

### 4.1 New engine — `src/engine/personal-muhurat.ts` (owns all natal logic)

Pure overlay module. Never mutates a finder day's own fields. Exports:

- `natalAnchors(place, ayanamsa, birth)` → `{ janmaNak, janmaSign, moonBav }`
  - `janmaNak` (0–26), `janmaSign` (0–11) from the birth Moon (reuse `moonSidMs` at the
    birth instant, same technique as `medical-muhurat.ts:natalMoonSign`).
  - `moonBav` = `computeAshtakavarga(signOf, ascSign).bav.Moon` (12-length bindu array),
    where `signOf`/`ascSign` come from `computeKundli` on the birth details.
- `personalFit(anchors, day)` → `{ tara, taraGood, chandraGood, special, specialCaution,
  specialName, moonBindu, strength, coreOk, verdict }` for one finder day.
  - `day` supplies `{ ms, moonNak, moonSign, waxing }` — all already on a
    `muhuratScanRange` result row (or derivable from `ms` via the panchang helpers).
  - `taraGood` = `!(tara in {1,3,5,7})`; `chandraGood` from `chandraBala` lookup;
    `moonBindu` = `moonBav[day.moonSign]` (0–8); `strength` = bucket of `moonBindu`.
  - `special` = ordinal-from-Janma `((moonNak - janmaNak + 27) % 27) + 1`; a lookup maps
    `{1,10,16,18,22,25}` to their names (Janma/Karma/Sanghatika/Samudayika/Vainasika/
    Manasa). `specialCaution` = `special in {1,10,16,18,22,25}`; `specialName` = the mapped
    name (or null). This is a **soft caution only** — it does *not* feed `coreOk`.
  - `coreOk` = `taraGood && chandraGood` (the hard-cut predicate — the two sourced muhurta
    filters only). A day may be `coreOk === true` yet still carry a `specialCaution` mark.
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
2. **Hard cut (removed → `setAside`):** a day is removed only when `coreOk` is false, i.e.
   it fails Tarabala (tara ∈ {1,3,5,7}) **or** Chandrabala — the two sourced muhurta
   filters. Each removed day keeps its precise reason so the "tap to view" list explains it.
3. **Soft annotations on kept days (never remove):**
   - **Advanced strength** — kept days sort by `moonBindu` desc, then the finder's own
     score; a very-low-bindu day (`moonBindu ≤ 2`) is **kept and flagged** "weaker
     strength", never deleted by strength alone.
   - **Special-nakshatra caution** — a kept day whose Moon-star is at ordinal
     {1,10,16,18,22,25} from Janma is **kept and marked** with the named caution
     ("18th from your birth star — Samudayika · a personal tradition, not a classical
     muhurta rule"). Never removed.
4. **Safety fallback (`mode: "annotate"`):** if the hard cut would leave fewer than **3**
   kept days in the chosen range, the engine does not filter — it returns all days in
   original order, each annotated with its fit, plus a bilingual note
   ("Few days suit your birth star in this range — showing all, marked"). The user is never
   stranded with an empty or near-empty list.

## 6. What the user sees

- **Count line** (top of results, bilingual): "6 of 21 days set aside for your birth star ·
  tap to view" → tapping reveals the `setAside` days, each with a plain reason (Tarabala or
  Chandrabala — the two filters that actually remove days).
- **Fit badge** per kept day (bilingual): birth-star supportive · Moon-sign supportive ·
  strength as filled/empty dots (●●●○) from `moonBindu`. A kept day at a special nakshatra
  also shows a small **caution chip** — "18th from your birth star — Samudayika" — with a
  tap-through note reading *"a personal tradition, not a classical muhurta rule."* The day
  is still offered; the chip is advisory only.
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
- **Special-nakshatra anchor (soft caution):** pins `special` ordinal + `specialName` for
  the set `{1,10,16,18,22,25}` and proves it is **advisory, not a cut** — an 18th-from-Janma
  day (Tarabala tara 9 = good) comes back `specialCaution === true` **and** `coreOk === true`
  (kept, marked, not removed); a control day at the 20th has `specialCaution === false`.
- **Ashtakavarga anchor:** one fixed birth chart pins `bav.Moon` per-sign totals and the
  structural invariant `sum(sav) === 337`.
- **Filter behaviour:** a synthetic day list proves the hard cut removes only `!coreOk`
  days (Tara/Chandra only), that strength and `specialCaution` rank/mark but never remove,
  and that the `<3` fallback flips to annotate-only.
- **Prove-the-guard:** perturb a tara table / bindu value / an entry in the avoided-ordinal
  set → the relevant anchor fails → restore.
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
