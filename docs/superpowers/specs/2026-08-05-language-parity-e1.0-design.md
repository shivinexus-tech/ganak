# Spec B — E-1.0: one name table, one language per screen

**Date:** 2026-08-05
**Status:** Draft for owner approval
**Backlog:** `E-1.0` (`plans/backlog.md:1227`) + `I18N-DEVANAGARI-TERMS` (`plans/backlog.md:244`)
**History:** owner-directed 2026-07-28 · reserved 2026-07-29 · retired stale 2026-08-03 with zero commits
**Size:** large — phased; Phase 1 is independently shippable

---

## Problem Statement

Ganak's language toggle is a veneer over roughly twenty files that each decide,
independently, how to name a sign, a nakshatra or a planet. Hindi mode leaks English
(`Saturn`, `Dhanishta`, `Kumbha (Aquarius)`); English mode leaks Devanagari
(`शुक्र Venus enters Kanya`). Two separate owner-reported findings — E-1.0 on
2026-07-28 and `I18N-DEVANAGARI-TERMS` from the 2026-07-28 Codex bug bash — are the
same defect seen from opposite sides.

**The duplication is measurable and already producing contradictions.** The same
nakshatra is spelled three different ways in three files:

| File | `Purva Phalguni` renders as |
|---|---|
| `src/i18n/panchang-terms.ts:40` | पूर्वा फाल्गुनी |
| `src/screens/UtilityCalculatorScreen.tsx:34` | पूर्व फाल्गुनी |
| `src/engine/muhurat.ts:12`, `src/engine/daily-windows.ts:12` | पूर्वाफाल्गुनी |

Aquarius is कुम्भ in `UtilityCalculatorScreen.tsx:30` and कुंभ in `MuhuratHub.tsx:63`.
A Hindi reader moving between two screens sees two spellings of their own birth star.

**The fix already exists and was half-installed.** `src/i18n/panchang-terms.ts` is
the shared bilingual lookup the backlog asks someone to "design later" — it was
built, it covers tithi / paksha / month / sign / nakshatra, and it documents the
correct architecture. **Only 4 of ~21 relevant files import it.**
`MuhuratHub.tsx` is the proof that adoption stalled mid-file: it imports
`panchangTerm` on line 43 **and** declares its own duplicate `SIGN_HI` on line 63.

So this is not a design problem. It is an unfinished migration, plus one missing
table (planets), plus the absence of any gate to hold the line.

Separately, the owner decided on 2026-07-28 that **English mode should use English
sign names** (Kanya → Virgo) while the mathematics stays sidereal Lahiri. That is a
vocabulary decision layered on top of the same migration, and is cheapest to do while
every call site is already being touched.

## Goals

1. One lookup module owns every sign, nakshatra and planet name. Ad-hoc per-file
   tables are deleted, not merely bypassed.
2. Switching the toggle switches **every** user-facing name — no leak in either
   direction, on any screen.
3. English mode names the 12 signs in English (Virgo), with calculation provably
   unchanged and sidereal disclosure intact.
4. A permanent gate makes a language leak a build failure, so the zero state survives
   the next agent.
5. Every existing gate stays green; no computed value changes anywhere.

## Non-Goals

- **Translating deep interpretive prose.** The KP / Ashtakavarga / BNN / Bhrigu
  paragraphs are `E-0.6`, a specialist Hindi authoring job, not a lookup swap.
- **Changing any calculation, ayanamsha or house system.** This is labels only.
- **Renaming proper festival and event names.** `Kanya Sankranti`, `Purnima`,
  `Makar Sankranti` stay Sanskrit in both languages — they are event names.
- **Reworking the Western/Tropical calculators' vocabulary.** They legitimately use
  Western names; their framing is `E-1.1`, a separate product decision.
- **Adding a third language.** The module should not obstruct it, but nothing here
  is built for it.

## User Stories

- As a Hindi-mode reader, I want my birth star spelled the same way on every screen,
  so I can trust that two screens are describing the same thing.
- As a Hindi-mode reader, I want planet and sign names in Devanagari everywhere —
  including the Kundli tables, dosha pages and Dashakoota — so Hindi is a real mode
  and not a partial translation.
- As an English-mode reader, I want the signs named in English, so I am not asked to
  learn Sanskrit vocabulary before I can read my own chart.
- As an English-mode reader who knows Jyotish, I want it stated that these English
  names denote **sidereal** signs, so I do not mistake the app for a tropical one.
- As the next agent, I want one obvious place to add a name and a gate that fails if
  I hardcode one instead, so I cannot recreate the mess by accident.
- As the owner, I want proof that renaming labels did not move a single number.

## Requirements

### Phase 1 — P0: complete the migration and lock it

**B1. `panchang-terms.ts` becomes complete.**
Add a `signEn` display mode, plus the `planet` table (nine grahas) **if Spec A has
not already added it** — A3 introduces the same table for the transits card, and
whichever spec lands first owns it. The module keeps its existing contract: unknown
values fall through unchanged; `panchangTerm` stays the single entry point.

*Acceptance:*
- `panchangTerm("hi", "planet", "Venus")` → `शुक्र`; `("en", …)` → `Venus`.
- All 27 nakshatra, 12 sign and 9 planet keys resolve in both languages.
- Unknown input returns input, unchanged.

**B2. Every ad-hoc table is deleted and its call sites migrated.**
Confirmed targets:

| File | Tables to remove |
|---|---|
| `src/screens/UtilityCalculatorScreen.tsx:30–37` | `SIGN_HI`, `PLANET_HI`, `TERM_HI`, `ASPECT_HI` + `PL_ALL`/`localTerm`/`signOnly`/`westernSign` |
| `src/screens/MuhuratHub.tsx:63` | `SIGN_HI` (file already imports `panchangTerm`) |
| `src/engine/daily-windows.ts:12,14` | `NAK_HI`, `SIGN_HI` |
| `src/engine/muhurat.ts:12` | `NAK_HI` |
| `src/screens/PrashnaScreen.tsx:142` | `RASHI_EN` — **inside the parity-frozen markers**, display-only |
| `src/engine/panchang.ts:23` | `PLANET_DEVA` — after Chart/PlanetCalendar migrate |

*Acceptance:*
- `grep -rE "(SIGN|NAK|PLANET|TERM|RASHI)_(HI|EN|DEVA)\s*[:=]" src/` returns **only**
  `src/i18n/panchang-terms.ts`.
- `validation/prashna-parity` remains EXACT 198/6 — the frozen region's numbers are
  untouched; only a display constant moves.
- Every existing gate green; `npm run build` green.

**B3. Gate: `validation/language-leak-scan.cjs`** — the zero-oracle promised on
2026-07-29 and never built. Precedent: `validation/route-reachability.cjs` (214
lines), which made an equally invisible defect mechanical.

Asserts, per screen, for both languages:
1. **EN mode** renders zero Devanagari codepoints (`/[ऀ-ॿ]/`) outside an explicit
   allow-list (the Ganak wordmark गणक, deliberate bilingual glosses).
2. **HI mode** renders zero Latin-script sign / nakshatra / planet names, checked
   against the module's own key list.
3. **No duplicate table** exists outside `src/i18n/` (the grep in B2, as a gate).
4. Each check names the file and line it failed on.

*Acceptance:* the gate is written first and **fails on `main` today**, listing the
real leaks. Then it goes green and stays in the canonical suite.

### Phase 2 — P0: the English sign vocabulary

**B4. English mode names signs in English.**
`Kanya` → `Virgo` and the other eleven, everywhere a sign is displayed in EN. Hindi
keeps कन्या. Sanskrit is retained for event names (`Kanya Sankranti`) — the gate
must distinguish these, so event names are matched against `festival-meta.ts` rather
than the sign table.

*Acceptance:*
- Given EN mode, when any sign is displayed, then it reads the English name with no
  parenthetical Sanskrit.
- Given a Sankranti or festival row, then the Sanskrit event name is unchanged.
- **Given identical inputs, when a chart is cast before and after, then every
  degree, house cusp, dasha date and yoga verdict is identical.** Captured as a
  recorded before/after fixture, not an eyeball check.

**B5. Sidereal disclosure travels with the English names.**
Wherever English sign names appear in a chart context, the screen states the zodiac
is sidereal (Lahiri). One clear line, not a repeated badge on every row.

*Acceptance:* a reader who knows tropical astrology cannot conclude from any screen
that these are tropical signs.

**B6.** Gates asserting Sanskrit strings (`validation/prashna-calc.js`,
`validation/vedic-season-clock.cjs`) are updated to the new vocabulary — updated, not
weakened. Assertions must still fail if the wrong sign is produced.

### P1 — Should have

**B7.** Fold in Spec A's P2 leftovers: `Purnima — full moon` / `Amavasya`
(`panchang.ts:190–191`) hardcode an English gloss inside the engine.

**B8.** Dashakoota, dosha pages and Kundli tables — the specific surfaces the
2026-07-28 bug bash named — get an explicit browser pass in both languages at 375px.

### P2 — Future

**B9.** A third language would need only new tables if B1–B3 hold. Do not build for
it; do not obstruct it.

**B10.** Nakshatra pada and sub-lord labels are on the same architectural fault line
but were not audited here. Note for a later sweep rather than pretending coverage.

## Success Metrics

**Leading (at merge):**
- Duplicate name tables outside `src/i18n/`: currently **7** → target **0**.
- Files importing `panchangTerm`: currently **4** → target ≥ **15**.
- Spelling variants of `Purva Phalguni`: currently **3** → target **1**.
- `language-leak-scan` findings: red with a real count → **0**.
- Chart-value diff before/after Phase 2: **0 differences** across the fixture set.

**Lagging (next two bug bashes):**
- Zero language findings raised against Jyotish or Panchang surfaces.
- `I18N-DEVANAGARI-TERMS` and `E-1.0` both closed in
  `plans/backlog-acceptance-register.md` with gate evidence attached.

## Open Questions

- ~~**(owner) — BLOCKING for Phase 2.** English mode: plain `Virgo`, or
  `Virgo (Kanya)`?~~ **RESOLVED (owner, 2026-08-05): plain `Virgo`.** No Sanskrit
  gloss in English mode. This makes B5's sidereal disclosure load-bearing — with the
  Sanskrit removed, the disclosure is the only signal that these are sidereal signs,
  so it is P0, not decoration.
- **(owner)** Hindi mode currently shows `कुम्भ` on one screen and `कुंभ` on another.
  Which spelling is canonical? *Non-blocking — I will take `panchang-terms.ts` as
  the source of truth and note every value I standardised, for your review.*
- **(engineering)** `PrashnaScreen.tsx:142` sits inside the parity-frozen markers.
  Parity compares numbers, not display names, so the edit is safe — but it needs an
  explicit re-run of `prashna-parity` and `prashna-calc` in the same commit.
- **(owner)** Does the sidereal disclosure (B5) belong on the chart header, or once
  in an About/method note? *Non-blocking — chart header unless told otherwise.*

## Timeline Considerations

**Phase 1 is independently valuable and should ship alone.** It removes the
contradictory spellings, deletes the duplication and installs the gate — without
touching the vocabulary decision. If Phase 2 is later reconsidered, Phase 1 is not
wasted.

**Phase 2 depends on Phase 1.** Renaming signs across seven duplicate tables is how
this becomes a multi-day job with regressions; renaming them in one module is a small
change.

**Dependency:** Spec A should land first. It is the same defect in miniature and
proves the structured-event pattern on one card before it is applied to twenty files.

**Reservation discipline:** own branch, own worktree, per `AGENTS.md:38` and Spec C.
The previous attempt recorded itself against another task's worktree and produced
nothing; that failure mode is now explicitly designed against.
