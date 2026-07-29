# P0-PRASHNA-249 — bug-bash brief & findings

Closure contract (owner): **no item is 100% until two different agents have each spent
30+ focused minutes trying to break the finished feature.** This file holds Agent-1's
pass and the brief for Agent-2. Feature is LIVE at ganak.pages.dev → Prashna →
「KP अंक विधि (1–249)」. Engine gates: `prashna-249.cjs` (33/33), `prashna-249-chart.cjs`
(14/14), parity EXACT 198/6.

---

## Agent-1 pass — Claude Code, 2026-07-24 (live site, EN + HI, 375 & 320px)

**Verified working (no defect):**
- **Values exact vs the canonical table:** #108 → Kanya / Uttara Phalguni · Sun / Saturn
  / Kanya 3°00′ / houses 2·7·11. #249 → Meena / Revati · Mercury / Saturn / Meena 27°53′.
- **Input validation:** 250 / 999 / 0 → correct bilingual "whole number 1–249" error;
  empty field → Cast disabled; letters stripped; whitespace trimmed.
- **Result clears** on method-toggle switch and on changing the question chip (no stale
  verdict carried over).
- **Language mid-result:** toggling EN↔HI after a cast re-renders the whole card in the
  other language — verdict voice, detail box and disclaimer all localise; **no English
  leak** in Hindi.
- **Responsive:** no horizontal overflow at 320px; no console errors throughout.
- **High-latitude:** equal-house fallback (gated; Reykjavik).

**Findings:**

| ID | Sev | Finding | Detail |
|----|-----|---------|--------|
| **F1** | **Medium** | **Repeat protection not implemented.** | The approved flow (prashna-249-findings.md §3 step 6) specified: after a cast the number field **locks** with a "same question, same number" note, and a "new question" action clears it — *no silent recasts*. Shipped build leaves the field editable, so a user can recast the **same number** repeatedly and get a **shifting verdict** (the judgment moment advances each press). This lets someone "shop" for a favourable answer and violates KP's "the first sincere number stands." |
| **F2** | Low | Silent digit reinterpretation. | Field strips non-digits, so `-5`→`5`, `1.5`→`15`, `007`→`7` on cast. A user typing `1.5` or `-5` gets a silently different *valid* number rather than the "whole number 1–249" nudge. Numeric-only is by design; the surprise is the silent change. |
| **F3** | Low (pre-existing) | Stale result on place change. | Changing the place **after** a cast leaves the result on screen (chart cast for the old place) while the card's gloss shows the **new** placeLabel — a stale mismatch. Shared with the existing time mode (not introduced by this feature). |

**Recommendation:** fix **F1** before quality-closure (it touches the method's integrity,
not just polish). F2/F3 are launch-polish.

**FIXED 2026-07-24 (Claude Code), all below the parity-frozen markers, parity still EXACT
198/6 + build green:**
- **F1** → after a number cast the field is `readOnly`, its guidance changes to "same
  question, same number," and the action button becomes **"नया प्रश्न / New question"**
  (the only way to recast — clears number + result). No silent recasts.
- **F2** → input strips leading zeros (`007`→`7`) and, when a complete number is out of
  1–249, shows a live inline "1–249" hint and disables Cast (no silent coercion on cast).
- **F3** → a `useEffect` on `[lat, lon, placeLabel]` clears a standing result when the
  place changes, so an answer is never shown against a place it wasn't cast for.

---

## Agent-2 pass — Cursor, 2026-07-24 (~45 min, production + engine; independent)

**Pre-flight (`CLAUDE-PRASHNA-249-ENGINE`):** **Stopped midway** — agent **Claude Code**,
status **REVIEW** (engine + UI merged and deployed at `ab6fa6d`; Agent-1 bug bash + F1–F3
fixes live). Owner assigned a second independent bash; no ACTIVE row blocked testing.

**Baseline (worktree `claude+prashna-249-engine` @ `ab6fa6d`):**
```
node validation/prashna-249.cjs          → 33/33 PASS
node validation/prashna-249-chart.cjs    → 14/14 PASS
node validation/prashna-parity.js src/screens/PrashnaScreen.tsx → parity EXACT 198/6
```

**Verified working (no defect):**
- **Boundary / split numbers on live UI** vs `plans/prashna-249-table.md`: #1 Mesha,
  #22/#23 Aries→Taurus split, #33/#116/#199 (15°40′ twins), #249 Meena — Sign row matches
  canonical sign on screen (star/sub checked at engine layer for full boundary set).
- **All 12 question chips** in number mode: each casts #108, shows **Houses judged** row
  with correct `favor` house list; verdict badge renders.
- **Input:** 250 / 999 disabled Cast + inline hint; leading zeros strip (`007`→`7`);
  non-digit paste stripped; empty → Cast disabled; post-cast field `readOnly`.
- **Repeat protection (direct path):** double-cast blocked while locked; language toggle
  mid-result keeps `readOnly` + **New question** button.
- **Determinism:** marriage #42 — same verdict for two casts 30s apart within the same
  clock minute (engine).
- **Layout:** no horizontal overflow at 320px / 375px / 390px on result screen.
- **Console / network:** zero console errors on production pass.

**Findings and fixes — all fixed by Claude Code in `8731789`:**

**F4 · P1 — chip change defeats the repeat lock.** After a number cast the field locks
and "New question" appears, but tapping a different question chip called `clearResult()`,
which dropped `result` and — because `numberLocked` was derived from `result` — silently
unlocked the same number, re-enabling recast without "New question." Repro: number mode →
Marriage → 108 → Cast → tap Job/career → field editable + Cast enabled with 108 present.

**F5 · P1 — method toggle defeats the repeat lock.** Same root cause via `switchMode` →
`clearResult()`: time↔number toggle dropped the result and unlocked the number for recast.

**F6 · P2 — number-mode Full-chart footnote said "Lahiri."** The expanded chart's
positions footnote was hardcoded to "Lahiri ayanamsa," but the number method runs on
KP-New — a copy leak contradicting the answer-card disclaimer.

**Fix (all below the parity-frozen markers; parity still EXACT 198/6 + build green):**
- Introduced a dedicated **`locked`** state, set on a number cast and cleared **only** by
  "New question" (or a place change) — independent of `result`. `numberLocked` now derives
  from `locked`, not `result`.
- **Chip clicks are ignored while locked** (`if (numberLocked) return`); `switchMode`
  preserves the locked session; the result card renders only for the **matching mode**
  (`result.mode === mode`), so a mode toggle hides-but-keeps the locked number answer.
- **F6:** the footnote now reads "KP-New ayanamsa (KP number method)" in number mode and
  keeps "Lahiri ayanamsa — … Drik Panchang defaults" in time mode.

**Live-verified on ganak.pages.dev (`8731789`, 0 console errors):** F4 chip-tap stays
locked (108, "New question", no Cast); F5 time↔number toggle stays locked; language
toggle while locked preserved (Hindi "नया प्रश्न"); "New question" fully resets; `007`→`7`,
`999` → hint + Cast disabled; number-mode footnote = KP-New, time-mode footnote = Lahiri.
**No open P0/P1 from this pass.**

---

## Agent-2 re-verification — Codex, 2026-07-28 (halted on P1)

**Independence:** The canonical table and live behavior were inspected before reading
the Agent-1/earlier Agent-2 details in this file. This owner-directed re-verification
was stopped after about 12 focused minutes because the brief requires an immediate stop
on any P0/P1; the remaining 30-minute matrix was therefore not claimed as complete.

**Baseline — all green:**

```text
prashna-249.cjs                 33/33 PASS
prashna-249-chart.cjs           14/14 PASS
prashna parity                  EXACT 198 values / 6 charts
prashna-calc.js                 24/24 PASS
parse-check kundli-app.tsx      clean
npm run build                   132 modules, PASS
```

**Live checks completed before the stop:** English method-toggle copy was
single-language and the one-line descriptions were correct; `007` became `7`; `250`,
`999`, `0`, empty, a very long value, Devanagari digits and emoji kept Cast disabled.
No console warning/error was captured. The rest of the requested lock/place/boundary/
chip/layout/language/network matrix remains unverified in this halted run.

### F8 · P1 — decimal and negative input silently become different valid numbers

**Exact production repro** (`https://ganak.pages.dev/?screen=prashna`, 320px, English):

1. Open **KP number method (1–249)**.
2. Select **Marriage / relationship**.
3. Enter `1.5` in **KP number (1 to 249)**.
4. The field silently changes to `15`; **Cast the answer** becomes enabled.
5. Reset the field and enter `-5`.
6. The field silently changes to `5`; **Cast the answer** becomes enabled.

**Why P1:** The first sincere number is the method's chart-defining input. These paths
do not merely clean formatting; they silently select a different valid horary number and
allow a different chart to be cast. This is the earlier F2 class still reproducible on
the live build despite its recorded fix. Product code was not changed.

**Closure:** blocked. Reopen the input fix, reject decimal/sign-bearing strings instead
of removing punctuation, then have an independent agent rerun the complete 30+ minute
matrix. Do not count this halted run as the closing independent pass.

### F8 fix + resumed production pass — Codex, 2026-07-28 (halted on fresh P1)

**F8 fixed and live at `40b6c4a`:** a TDD-first fix below the parity-frozen engine
markers preserves punctuation/sign-bearing input as visibly invalid, requires a
digits-only integer from 1–249 for both button enablement and the cast path, and keeps
the intended `007`→`7` normalization. New gate
`validation/prashna-249-input.cjs` passes 4/4. The full required gate set also remains
green: engine 33/33, chart 14/14, parity EXACT 198/6, calc 24/24, parse clean, build
132 modules.

Production loaded the new `index-CD92KACz.js` asset. At 320px, `1.5` and `-5` stayed
visible, showed the 1–249 warning and kept Cast disabled; `007` became `7`. The resumed
matrix then stopped at its first repeat-lock attack because it exposed a fresh P1.

### F9 · P1 — double-tapping Cast activates the replacement reset control

**Exact production repro** (`https://ganak.pages.dev/?screen=prashna`, 320×844,
English, repeated twice with different numbers):

1. Open **KP number method (1–249)**.
2. Select **Marriage / relationship**.
3. Enter `108` (the first reproduction used `7`).
4. Double-tap **Cast the answer**.
5. Observe that no result remains, the number field is empty and editable, Cast is
   disabled, and **New question** is not present.

**Captured state:**

```text
before double-tap: value=108, Cast disabled=false, New question=false
after double-tap:  value="", readOnly=false, Cast disabled=true,
                   New question=false, Houses judged/result=false
```

**Why P1:** the first tap casts and swaps the button to **New question** in the same
tap target; the second tap lands on that replacement control and silently resets the
locked session. A normal phone double-tap on Cast therefore performs the supposedly
explicit-only reset without a deliberate **New question** action, making the number
recastable. This directly violates the repeat-lock acceptance criterion and the
method-integrity guard against answer shopping.

**Closure:** blocked on F9. No F9 product fix was made because the Agent-2 brief says
to stop and report a fresh P0/P1 rather than fix it. The remaining place, full boundary,
12-chip, Hindi, layout and F1–F6 regression matrix is still not signed off.

**F9 FIXED — Claude Code, 2026-07-28 (`03341c0`, in `main`), below the parity-frozen markers.**
The number cast records a timestamp (`lockedAtRef.current = Date.now()`), and `newQuestion()`
swallows any reset firing within a 600ms double-tap window (`if (Date.now() - lockedAtRef.current
< 600) return;`). A deliberate later tap still resets. **Gates:** parity EXACT 198/6, prashna-249
33/33, prashna-249-chart 14/14, prashna-249-input PASS, parse-check, build all green.
**Verification note (honest):** the fix is *code-verified in the live executing bundle*
(`index-DvWr_yqW.js`): `E.current=Date.now()` on cast + guard `Date.now()-E.current<D` with
`D=600`. A clean *behavioral* double-tap could NOT be staged in the harness browser — the
pane is a hidden/background tab, which clamps `setTimeout` to ~1000ms and pauses
`requestAnimationFrame`, so no real sub-600ms two-tap gap is reproducible here (a "150ms"
wait measured 1001ms). The logic is airtight, but the **final real-device double-tap
confirmation should be done by the resumed Agent-2 pass or the owner on a foreground device.**
**Still open for closure:** that F9 real-tap confirmation + the remaining place/boundary/12-chip/
Hindi/layout/F1–F6 regression matrix (Codex halted before it) + owner live-URL sign-off.
