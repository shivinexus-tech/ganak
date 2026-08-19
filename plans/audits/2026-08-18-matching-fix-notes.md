# Marriage-matching correctness fixes — F1, F3, F4, F5, F10

- **Date:** 2026-08-18
- **Branch:** `claude/fix-matching-correctness` (worktree off `origin/main` b14e13c)
- **Source:** `plans/audits/2026-08-18-bugbash-matching-dosha.md`
- **Files changed:** `src/engine/matching.ts`, `src/screens/MatchingScreen.tsx`,
  `validation/dashakoota.cjs`, `validation/doshas.cjs`. No snapshot baseline moved —
  the statically rendered matching screen is the empty form, and its text is unchanged.

## What was fixed

### F1 — matching and the Mangal Dosha calculator gave opposite answers
Matching decided Manglik status from the **Lagna alone**; `/calculator/mangal-dosha`
checks the **Lagna, the Moon and Venus** separately (`methodKey`
`mars-1-2-4-7-8-12-from-lagna-moon-venus`), and `validation/mangal-dosha.cjs` already
asserted that it must. So one birth record got two opposite verdicts on two Ganak screens.

`matching.ts` now carries `manglikProfile()`, a copy of the calculator's three-reference
core applied to an already-computed chart (matching cannot call `mangalDoshaReport`
directly — that function casts its own chart). `cancelled` now means what it says:
**both** partners are Manglik. Previously `cancelled` was true whenever the two Lagna
flags were equal, so a couple who were both Manglik from the Moon were shown the green
"Clear — neither partner is Manglik" card.

This is a **consistency fix, not a new religious ruling**: matching adopted the
convention Ganak already publishes, sources and gates on its own calculator page.

### F3 / F4 — the screen contradicted itself, and the two languages did not match
The screen banded the Ashtakoota total itself and printed the Dashakoota band as a
second headline. 1,826 of the 104,976 nakshatra/rashi combinations put the two at
opposite extremes; 6,966 showed a "Very good"/"Excellent" headline with a Nadi,
Bhakoot, Rajju or Vedha dosha standing.

There is now **one verdict**, computed once in `matching.ts` (`matchVerdict`) and
rendered by the screen from `res.verdict`. Its rules, all visible in the code:

- the band follows the **lower** of the two systems — Ganak never presents the more
  flattering system as the answer;
- **any standing hard-block dosha caps the band at "mixed"**, and the doshas are named
  in the headline card, so a block can never sit forty lines under a green verdict;
- when the two systems disagree by two bands or more the card **says so** instead of
  hiding it;
- both per-system totals stay on screen as **scores**. Neither table prints a verdict
  word any more.

On the language half, the English low band said **"Not recommended"** — an instruction
about someone's marriage, and the fatalistic output the header of `doshas.ts` forbids —
where the Hindi said only "सावधानी आवश्यक". The four bands now carry matched pairs:
Strong / प्रबल मिलान, Favourable / अनुकूल मिलान, Mixed — worth a closer look /
मिश्रित — विस्तृत परीक्षण उपयोगी, Needs a detailed review / विस्तृत परीक्षण आवश्यक.
The gate rejects any band label, in either language, that reads as a refusal.

### F5 — the stale-place guard
`PlaceInput`'s strict mode was built for exactly this and every other calculator wires
it; matching did not. Typing "Chennai" over "New Delhi" without picking a suggestion
computed the whole reading — and printed the PDF header — for Delhi. Both people now
pass `onConfirmed`, and **Match the kundalis** refuses with a visible message naming
whose place is unconfirmed, the same shape `UtilityCalculatorScreen` uses.

### F10 — the Hindi Ashtakoota "Detail" column
All eight rows were one filler sentence, so a Hindi reader was shown no varna, yoni,
gana, nadi or sign lord at all. Each koota now carries a real `noteHi`. Sign lords
resolve through `src/i18n/panchang-terms.ts` (`planetName`), so no second graha table
was created; the koota **category** names (yoni animal, gana, nadi, varna, vashya) are
new Devanagari tables in the engine, which is not vocabulary the i18n module owns.

## Gates

Both new sweeps live with the matching engine, and both sweep rather than anchor —
every one of these defects was true of hundreds or thousands of combinations while
single-example gates stayed green.

- `validation/dashakoota.cjs` — full **104,976-combination** sweep asserting: one
  verdict per (score, score, dosha) input; zero combinations reading "favourable" or
  better with a dosha standing; the band never rises above the lower system's own
  reading; both band labels bilingual, distinct, script-pure and non-fatalistic; all
  **8 of 8** Hindi koota details distinct, Devanagari-only and never a copy of the
  English; plus source assertions that the screen carries no second verdict ladder and
  that the stale-place guard is wired.
- `validation/doshas.cjs` — Manglik agreement swept over **96 real charts and 48
  couples** across six cities and 78 birth years, asserting matching and
  `mangalDoshaReport` agree on presence, reference count, strength and Mars's house
  from each reference; plus the mutual-cancellation semantics and the audit's two
  fixture couples. 36 of the 96 charts are Manglik from the Moon or Venus but not the
  Lagna — the exact case the old rule got wrong — so the sweep is non-vacuous.

Every new assertion was run against the pre-fix behaviour and goes red
(`.scratch/repro/failproof.cjs`, gitignored): 6,966 dosha-under-a-green-headline
combinations, 1,826 opposite-extreme pairs, 1 of 8 distinct Hindi rows, Manglik
disagreement on the first swept chart, and both stale-place assertions.

`bash scripts/run-all-gates.sh` → **90 passed, 0 failed.**

## Deliberately left for the owner

1. **Which reference set matching should use.** Matching now follows the calculator:
   Lagna + Moon + Venus. Some traditions check the Lagna only, or Lagna + Moon. If
   Ganak wants a narrower set, both surfaces must move together — the point of the new
   gate is that they can never move apart. Not changed unilaterally.
2. **Whether a fully mitigated Manglik should count as cancelled in matching.** The
   calculator uses mitigations (own/exalted Mars, Jupiter's support, the
   tradition-specific sign exceptions) to soften *strength*, never to erase presence.
   Matching mirrors that and says "traditional mitigations are also present" without
   cancelling on them. An astrologer's call, not a code call.
3. **The band thresholds.** 75% / 60% / 50% of the lower system, and "a standing block
   caps at mixed", are product conventions chosen to make the screen self-consistent
   and cautious. The cut points are an owner decision; the *consistency* is now gated
   regardless of where they sit.
4. **The wording of the lowest band.** "Needs a detailed review" / "विस्तृत परीक्षण
   आवश्यक" is the non-fatalistic reading `plans/religious-content-policy.md` requires.
   If the owner wants firmer wording it must be equally firm in both languages — the
   gate enforces that neither language may carry a refusal.
5. **F11 (classical Bhakoot/Nadi cancellations) is still absent**, as the audit found.
   Applying the exceptions is a sourced religious-content change and was out of scope
   here; the cards still state the raw rule.
6. **The match *result* surface still has no committed snapshot baseline.**
   `snapshot-generate.cjs` only ever renders the empty form, and `snapshot-results.cjs`
   (outside this branch's file scope) covers the chart and transits only. The new
   sweeps cover the engine and the screen source, but nobody's baseline yet holds the
   rendered result text. Recommended as the next slice.
7. **F2, F6–F9, F12, F13 are untouched** — other agents' scope.
