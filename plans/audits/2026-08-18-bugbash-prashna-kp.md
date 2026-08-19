# Bug bash — Prashna / KP horary suite (independent adversarial pass)

- **Date:** 2026-08-18
- **Agent:** independent adversarial test agent (Claude), branch `claude/bugbash-prashna-kp`,
  worktree synced to `origin/main` at `55362e1` (merged before the pass started, so today's
  timezone/DST and birth-input fixes are in the base).
- **Mandate:** the Prashna suite's *numbers* have had heavy verification
  (`validation/prashna-249.cjs`, `-chart`, `-input`, `-practitioner`, `-sublord-boundary`,
  `-sublord-labels`, `prashna-parity.js`, `prashna-calc.js`) plus a documented primary-source
  check against the KSK Readers (`plans/prashna-249-ksk-verify.md`). What it had never had is a
  hostile pass over everything *around* the numbers. This pass is that.
- **Scope:** `src/engine/kp-horary.ts`, `src/screens/PrashnaScreen.tsx`, `src/engine/dasha.ts`
  (Ruling Planets + KP exports), `src/engine/houses.ts`, `src/engine/special-points.ts`, and the
  mounting shell `src/kundli-app.tsx` where it decides the Prashna screen's lifetime.
- **Standing:** READ-ONLY on all product code. Nothing under `src/` or `validation/` was
  modified, and nothing inside the **parity-frozen** engine markers was touched. This document
  is the only write. Probe scripts live in `.scratch/bugbash/` (gitignored).

_(pass log and findings follow; this document was written incrementally as the pass ran)_

## Pass log

| # | Pass | What it probed | How |
|---|------|----------------|-----|
| 1 | Method correctness vs the classical source | The 1–249 number→ascendant→sub-lord map re-derived and cross-checked against `kp-horary.ts` for all 249 × 5 moments; the KSK worked anchor "number 139 = 20° Libra Nirayana" (Reader VI scan p.269, printed-folio table in `plans/prashna-249-ksk-verify.md`); verdict-vs-significator-grid agreement over 17,928 judgements; the favour/deny house sets against the rotational 12th-from rule; whether Ganak *states* which reading it follows where it had to choose; whether the Ruling Planets rule it cites is actually implemented. | `.scratch/bugbash/p1-sweep.cjs`, `p1-grid.cjs`, hand re-derivation |
| 2 | Boundary conditions | Ascendant at exactly 0°00′00″ (n=1) and the table's extremes (n=145 → 29°26′, n=147 → 0°33′); latitude 59.999 / 60 / 60.0001 / 66.5 / 69.65 / 85 / 89.9 / 90 / −90 in both modes; judgment years 1, 1200, 1799, 1800, 2150, 2151, 3000, 9999; midnight and dawn; DST spring-forward in `Europe/London` and `America/New_York`; the same number asked twice. | `.scratch/bugbash/bounds.cjs`, `tz.cjs` |
| 3 | The moment of judgement | Which instant is captured and where; stability across re-render, language switch, tab change, reload; the interaction between the cast-lock and the mode toggle; the judgment-place override's timezone story. | source contract + `tz.cjs` + component wiring |
| 4 | Bilingual & copy | Both languages on the seeded result surface (verdict card, "What your number set", plain lines, "How this was judged", graha table, cuspal table, significator grid, disclosures). Answer-before-data order verified in the rendered text. | `.scratch/bugbash/render.cjs`, `r2.cjs`, `denyhunt.cjs` |
| 5 | Journey integrity | Mount/unmount lifetime, URL round-trip, stale-result clearing, the lock's survival, error visibility, share-card vs screen. | source + `sharecard.cjs` |

### How the result surface was rendered

`renderToStaticMarkup` runs no handlers, so the committed Prashna snapshot only ever sees the
**empty form** — no verdict, no chart, no cuspal table. Following the technique recorded in
`plans/audits/2026-08-18-bugbash-matching-dosha.md`, the probe intercepts `React.useState`,
uses the unique `useState('time')` (the `mode` slot) as the marker for "PrashnaScreen's hook
sequence starts here", and seeds the `result` / `selected` / `numberInput` / `showFull` /
`locked` slots with a **real** `PR_castNumber` + `PR_judge` output. Every "Observed" block
below is literal harness output.

---

## Findings

### F1 — P1 · "Houses judged" on the answer card contradicts the same card's own reasoning

`NumberSetBox` prints `favor.join(' · ')` under the label **"Houses judged" / "विचारित भाव"**.
`q.favor` is only half of what the verdict judged: `PR_judge` scores `q.favor` **and** `q.deny`,
and for four topics (health, litigation, general, plus every question where the deny side fires)
the **judged cusp itself** is not in `q.favor` at all.

**Reproduction** — number `11`, topic **Health**, New Delhi, 2026-08-18 12:00 IST.

**Observed** (literal harness output, English):

```
Ascendant sub-lord
Sun
shows whether the question is genuine and ripens at all — the yes/no itself is read from the 6th cusp sub-lord
Ascendant
Aries 15°33′
where the number fixed your chart
Houses judged
1 · 5 · 11
Saturn is the deciding influence here — it works slowly, rewarding patience and steady effort rather than haste.
In your favour: hopes and gains.
Working against it: work and daily duties · distance and expense.
```

and three lines further down, in the same reading:

```
Saturn holds the deciding vote here — it is the sub-lord of your 6th house, the house of obstacles, illness & debt.
For this question, your 6th house — obstacles, illness & debt — counts against the outcome.
For this question, your 12th house — loss, expense & distance — counts against the outcome.
```

**Expected** — "Houses judged" must name every house the judgment actually weighed: for Health
that is `1 · 5 · 11` (favour) **and** `6 · 8 · 12` (deny), with the judged cusp 6 marked. As
printed, the card tells a practitioner auditing it that houses 6 and 12 were not judged, on the
same card that scores them, and that the reading is "read from the 6th cusp sub-lord" while 6 is
absent from the list of judged houses.

**Cause** — `src/screens/PrashnaScreen.tsx:1523` (`NumberSetBox`, `<NumRow label={... 'Houses judged'} value={favor.join(' · ')} />`),
fed from `src/screens/PrashnaScreen.tsx:940` (`<NumberSetBox … favor={v.q.favor} …>`) — only
`q.favor` is passed; `q.deny` and `q.cusp` never reach the box.

**Suggested fix** — pass `q.deny` and `q.cusp` too and render them as separate labelled rows
("judged on", "supporting", "opposing"), or rename the label to "Supporting houses". Do not
silently widen the existing row: a practitioner reads that list as the scoring inputs.

### F2 — P1 · The plain-language "Working against it" line prints the *favourable* meaning of the house, contradicting the technical layer directly beneath it

`HOUSE_PLAIN_DENY` (`src/screens/PrashnaScreen.tsx:634-641`) carries deny-side phrasing for houses
**1, 2, 3, 9, 10, 11 only**. Houses **4, 5, 6, 7, 8 and 12** fall through to `HOUSE_PLAIN` — the
*favour* vocabulary — so tier 1 and tier 2 print two different meanings for the same house in the
same reading. This is precisely the failure mode the code comment above `HOUSE_PLAIN_DENY` says it
exists to prevent ("Favour labels … read as bugs when they appear under 'Working against it'"); the
table was left incomplete.

**Reproduction A — Health, number `11`**, New Delhi, 2026-08-18 12:00 IST. Verdict: *Not yet*.

**Observed:**

```
Working against it: work and daily duties · distance and expense.
…
For this question, your 6th house — obstacles, illness & debt — counts against the outcome.
```

For a **recovery** question the 6th house is the disease house. Tier 1 tells the reader their
*work and daily duties* are standing between them and recovery. Nothing in the chart says that.

**Reproduction B — Marriage, number `3`**, same moment. Verdict: *Favourable*.

```
In your favour: the other person · money and family.
Working against it: work and daily duties.
…
For this question, your 6th house — obstacles, illness & debt — counts against the outcome.
```

Here the 6th is the 12th-from-the-7th (the negation of marriage). Tier 1 again says "work and
daily duties".

**Reproduction C — Money, number `1`**, same moment. Verdict: *Not yet*.

```
Working against it: children and creative work · distance and expense.
…
For this question, your 5th house — children & creativity — counts against the outcome.
```

**Expected** — the plain line must carry a deny-side phrase for every house any question can deny.
The reachable gaps, confirmed by sweeping all 249 numbers × 12 topics at one moment
(`.scratch/bugbash/denyhunt.cjs`): `children:h4`, `travel:h4` (covered by `HOUSE_PLAIN_DENY_BY_Q`),
`money:h5`, `career:h5`, `venture:h5`, `health:h6`, `marriage:h6`, `general:h6`, `litigation:h7`,
`health:h8`, `money:h8`, `lost:h8`, `education:h8`, `property:h8`, `venture:h8`, `general:h8`, and
`h12` for eight topics. Uncovered and actively misleading: **4, 5, 6, 7**.

**Cause** — `src/screens/PrashnaScreen.tsx:634-641` (`HOUSE_PLAIN_DENY`, six of twelve houses) and
the fallback at `src/screens/PrashnaScreen.tsx:688-693` (`plainDeny` → `return P[h]`).

**Suggested fix** — complete `HOUSE_PLAIN_DENY` for 4, 5, 6, 7, 8, 12, and for the houses whose
denying sense is question-specific (6 under health = illness; 6 under marriage = separation) add
`HOUSE_PLAIN_DENY_BY_Q` entries. Source them the same way `plans/prashna-house-glosses.md` sources
the favour side. Until then the fallback should print the tier-2 framing ("for this question, this
counts against") rather than the favour phrase.
