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

**F9 BEHAVIORAL DOUBLE-TAP — now VERIFIED (Claude Code, 2026-07-28).** The open
"real-tap confirmation" gap is closed. The earlier background-tab timer clamp only defeats
`setTimeout`-staged taps; a real OS double-tap can be fired with the browser tool's
`computer{action:"double_click"}` after growing the viewport height so the Cast button is
on-screen (320×1400). Captured on the deployed bundle at **https://ganakapp.com/?screen=prashna**
(KP number, Marriage, 108) — before: `value=108, editable, no New question, no result`;
**after a real double-click: `value=108, readOnly=true, New question present, result present`**
— exactly one locked result; the second tap on the swapped New-question control was swallowed.
Also verified live: deliberate single New-question resets (mouse), keyboard activation resets,
chip-change / mode-toggle / EN↔HI↔EN all keep the lock and result, Back/Forward safely resets
the screen (no recast bypass), F8 (`007`→`7`; `1.5`/`-5`/`0`/`250`/`999`/`१०८`/emoji stay invalid
+ Cast disabled), F6 footnotes (number=KP-New, time=Lahiri), **0 console errors on production**.

### F10 · P2 — full Prashna chart overflowed the page horizontally at 320px
Found during the F9 verification above. With the **Full Prashna chart** expanded, the
5-column planetary table (`Graha/Rashi/Nakshatra/Star-Sub/House`) is intrinsically ~382px
wide; it sat in an `overflow-x: visible` parent, so it pushed the whole page to
`scrollWidth 440 > clientWidth 320` — a real horizontal page overflow (the existing "no 320px
overflow" notes tested the collapsed state). **F10 FIXED — Claude Code, 2026-07-28 (`f6a3440`,
in `main`), below the parity-frozen markers:** the table is wrapped in an
`overflow-x: auto` container (`minWidth: 300`) so it scrolls inside itself; the page no longer
overflows at 320/360/390, and the table scrolls within its wrapper. **Gates:** parity EXACT
198/6, prashna-249 33/33, prashna-249-chart 14/14, prashna-249-input PASS (adds the F10 wrapper
check), parse-check, build all green. **Live-verified** on ganakapp.com: expanded chart →
`wrapOverflowX=auto`, `pageOverflow=false`, `scrollWidth=320`.

---

## Agent-2 continuation — Codex, 2026-07-28 (F9 onward; closing matrix)

**Pre-flight (`CLAUDE-PRASHNA-249-ENGINE`): Stopped midway.** Claude Code remains the
engine owner and the row remains `REVIEW`; the earlier Codex continuation stopped at
F9 under the fresh-P1 rule. The owner supplied the merged F9 fix (`03341c0`) and
explicitly resumed this testing/docs-only pass. Product source stayed read-only.

**Required baseline — PASS on the current `main` tree:**

```text
prashna-249.cjs                 33/33 PASS
prashna-249-chart.cjs           14/14 PASS
prashna-249-input.cjs           5/5 PASS (including F10 wrapper)
prashna parity                  EXACT 198 values / 6 charts
parse-check kundli-app.tsx      clean
npm run build                   132 modules, PASS
```

**F9 behavioral confirmation — PASS.** In the visible foreground in-app browser at
320×844, a real double-click/tap action on **Cast the answer** for Marriage #108 left
the answer intact: input `108`, `readOnly=true`, **New question** present, and
**Houses judged** present. The replacement reset control did not consume the second tap.

**Completed live matrix (`ganak.pages.dev`, canonically redirected to `ganakapp.com`):**

- **All boundaries/splits vs `plans/prashna-249-table.md`:** 1, 22/23, 62/63,
  105/106, 124/125, 145/146, 188/189, 228/229 and 249 all rendered the expected
  sign, nakshatra lord, sub-lord and ascendant segment. Twins 33/116/199 exposed
  only the P2 display discrepancy below; the engine anchors remained exact.
- **All 12 chips:** each cast #108, retained its selected question identity and
  showed the exact configured **Houses judged** list.
- **Place paths:** blank and garbage city text did not replace the selected place;
  Reykjavik cast successfully and the expanded chart visibly disclosed
  `equal houses — high-latitude fallback`; Ushuaia cast successfully with the
  southern-place name and #249 result. Place navigation did not leave an old result.
- **Language:** EN→HI→EN mid-result preserved the locked #249 answer and read-only
  field. The Hindi verdict, guidance and detail values rendered in Devanagari; no
  English verdict badge leaked. The documented bilingual technical glosses remain
  intentional (earlier F7). Devanagari-digit and emoji number inputs remained visible
  but invalid with Cast disabled.
- **Phone widths:** result screens at 320, 360 and 390px had
  `documentElement.scrollWidth === innerWidth`; no horizontal overflow.
- **F1–F6 regression:** F1 lock and deliberate reset PASS; F2 `1.5`, `-5`, 0,
  250 and 999 stayed invalid while `007`→`7` PASS; F3 place transition cleared the
  old session; F4 locked chip tap ignored; F5 mode toggle hid then restored the same
  locked answer; F6 expanded number chart said `KP-New ayanamsa (KP number method)`.
- **Console/network:** zero warning/error console entries throughout. The production
  document and versioned app/Cloudflare assets loaded without a visible failed-request
  state; no network failure surfaced in the page or console.

### F11 · P2 — two exact twin ascendants display one minute low

The canonical table and engine map all three structural twins to exactly
`15°40′00″` within their signs. The live answer-card formatter renders:

```text
#33  → Vrishabha 15°39′   (should be 15°40′)
#116 → Kanya 15°39′       (should be 15°40′)
#199 → Makara 15°40′      (correct)
```

Sign, star, sub-lord and the underlying engine value are correct; this is a
floating-point-to-minute display inconsistency at an exact boundary. It is **P2**:
misleading by one displayed minute, but it does not select a different KP segment or
change the judgment. No product fix was made in this bug-bash continuation.

**Close-out:** the interrupted matrix is now complete. **No P0/P1 remains open from
this pass.** F9 is behaviorally confirmed fixed. F11 remains open as P2 polish, and
the existing owner live-URL sign-off plus primary-source/cusp-verification items remain
outside this bug-bash closure; therefore the engine row should not be represented as
fully quality/source-closed solely from this pass.

---

## Agent-2 final-closure sweep — Codex, 2026-07-28 (46 focused production minutes)

**Pre-flight:** `origin/main` had advanced from the supplied `45c1416` to `9d6fa2f`.
The ownership case remained **Stopped midway historically**: Claude Code had shipped
F9/F10 and stopped for an independent Agent-2 review. A prior Codex continuation had
already recorded a closing matrix with F11 P2 open, so this owner-directed run was a
fresh production audit rather than an assumption that the earlier note was sufficient.
The shared checkout contained unrelated edits; all product work used isolated branch
`codex/prashna-249-f12-final-closure`.

**Baseline on fetched main — PASS:**

```text
prashna-249-input.cjs           5/5 PASS before new tests
prashna-249.cjs                 33/33 PASS
prashna-249-chart.cjs           14/14 PASS
prashna parity                  EXACT 198 values / 6 charts
prashna-calc.js                 24/24 PASS
parse-check kundli-app.tsx      clean
npm run build                   132 modules, PASS
```

### Independent production evidence

- **Repeat lock:** a real foreground double-click at 320px and rapid triple taps on
  Cast produced exactly one locked #108 result. The input stayed read-only; chip
  changes were ignored; number→time→number and EN→HI→EN restored the same answer.
  A reset inside the 600ms replacement-button window was swallowed; one deliberate
  later New-question click reset correctly. Back/Forward or section navigation ended
  the old document without surfacing a stale result.
- **Canonical table:** 1, 22/23, 62/63, 105/106, 124/125, 145/146, 188/189,
  228/229, 249, the 33/116/199 twins and anchor 108 all matched the expected sign,
  star lord and sub-lord. F11 was independently reproduced before its fix.
- **All 12 question chips:** each #108 result preserved the selected question and
  rendered its exact configured Houses-judged list. Live verdict sampling covered
  Not yet (#108), Mixed (#42) and Favourable (#249).
- **Determinism:** two #42 casts within one minute were identical across verdict,
  summary, sign, star, sub-lord and houses.
- **Places:** blank/garbage input did not replace the selected city. A locked answer
  was cleared by a real place transition. Reykjavik disclosed the equal-house
  high-latitude fallback; Ushuaia cast #249 with the correct southern place and no
  stale New Delhi/Reykjavik answer.
- **Language:** direct `?lang=hi` loaded Hindi-only method names/descriptions and all
  12 Hindi chips. Locked EN→HI→EN results preserved the number and lock; Hindi verdict
  and guidance rendered in Devanagari without an English verdict leak. Intentional
  bilingual technical labels remained.
- **Layout/chart:** 320/360/390px all had
  `documentElement.scrollWidth === innerWidth`. At 320px the expanded chart wrapper
  measured `clientWidth=205`, `scrollWidth=382`, `overflow-x:auto`; a real horizontal
  touch scroll moved it to `scrollLeft=150` while page width stayed 320. Collapse
  preserved the locked result.
- **Conventions:** expanded number mode said KP-New ayanamsa; time mode said Lahiri,
  with no cross-mode leak.
- **Diagnostics:** final integrated asset `index-ChyoZmlr.js`; zero production console
  warnings/errors. The app bundle, stylesheet and seven fonts were observed and
  fetched successfully.

### F11 · P2 — FIXED (`7880d99`)

The exact 15°40′ structural twins #33/#116 previously displayed 15°39′ because the
generic minute formatter floored a binary value just below the exact minute. A
number-mode-only formatter now rounds to the nearest arcsecond before deriving
degrees/minutes. It is used for both the answer-card ascendant and the expanded
number-chart Lagna; time-mode formatting is unchanged.

**TDD:** the new behavioral regression failed before the formatter existed, then
passed for noisy 15°40′ and 27°53′ anchors. Production #33 now renders
`Vrishabha 15°40′` in both answer and expanded-chart state.

### F12 · P1 — overlong digits silently selected a different number — FIXED (`7880d99`)

**Exact pre-fix production repro:** enter `123456789`; the field silently became
`123`, the hint disappeared and Cast enabled. This was the same chart-changing input
integrity class as F8. The prior `slice(0, 3)` happened to keep `999999…` blocked only
because it produced `999`.

**Fix:** normalize leading zeros first, but preserve any normalized value longer than
three digits as visibly invalid. `007` and `0007` still become `7`; `1234`,
`123456789` and `0001234` remain visible with the 1–249 warning and Cast disabled.
The production fuzz matrix also rejected decimal/sign, exponent, embedded-space,
Latin-letter, Devanagari, Arabic-Indic and full-width numeral strings.

**TDD/gates after both fixes:**

```text
prashna-249-input.cjs           8/8 PASS (F8/F10/F11/F12)
prashna-249.cjs                 33/33 PASS
prashna-249-chart.cjs           14/14 PASS
prashna parity                  EXACT 198 values / 6 charts
prashna-calc.js                 24/24 PASS
parse-check kundli-app.tsx      clean
npm run build                   132 modules, PASS
```

### F13 · P2 (global deployment, not Prashna) — favicon returns HTML

A strict production asset fetch downloaded 8/9 requested stylesheet/font/image
assets. `/favicon.ico` returned `text/html` (the SPA fallback document), so the asset
checker rejected it as an image MIME mismatch. This does not affect the Prashna
bundle, calculations or journeys, and produced no console/network error in the app,
but the global favicon deployment should be corrected in the branding/platform lane.
It was not expanded into this exclusively scoped feature fix.

**Resolution (2026-07-29): FIXED.** `main` commit `23e4a56` added an owned,
self-contained Ganak SVG favicon, selected it explicitly in `index.html`, and placed
the legacy `/favicon.ico` → `/favicon.svg` redirect before the SPA fallback.
Production verification on `ganakapp.com` now returns `301` followed by
`200 image/svg+xml` (650 bytes), and the live document exposes
`rel="icon"` with `type="image/svg+xml"`. The favicon regression gate passes 5/5.

**Technical close-out:** the required independent production matrix exceeds 30
minutes and has **no open P0/P1**. F11 and F12 are fixed and live. Codex gives a clean
technical sign-off on `https://ganakapp.com/?screen=prashna`. F13 is unrelated P2
platform polish and is now resolved. The older `CLAUDE-PRASHNA-249-ENGINE` row remains `REVIEW` because
its separate owner live-URL acceptance, numeric house-cusp cross-check and Reader
II/VI page-pin are outside this bug-bash authority.

---

## External KP-New cusp cross-check (2026-07-29) — Claude Code · `CLAUDE-PRASHNA-249-CUSP-VERIFY`

This closes the standing verification item *"KP-New cusp numeric cross-check"* on the
`CLAUDE-PRASHNA-249-ENGINE` row. The cross-check ran to completion — and it **found a
correctness bug (F14, P1)**. **F14 was FIXED on 2026-07-29** (branch
`claude/prashna-249-f14-ramc`; see "### F14 — FIXED" below); after the fix the full
1..249 × 3-latitude sweep matches Swiss Ephemeris to **0.0000″** on all 12 cusps for
every chart (0 mis-converging). The cross-check is now a clean pass.

### Reference chosen and why it is trustworthy

**Swiss Ephemeris** (npm package `sweph` 2.10.3, N-API binding to the Astrodienst C
library), function `swe_houses_armc(ARMC, geolat, eps, 'P')`. It is the house-cusp
engine behind astro.com and the large majority of professional KP/Vedic software; its
Placidus implementation is the de-facto industry reference. `houses_armc` returns the
**tropical** Placidus cusps as a pure function of `(ARMC, latitude, obliquity)` — no
date, ephemeris or ayanamsa — which isolates exactly the Placidus semi-arc math under
test and removes every ayanamsa-convention ambiguity (the obliquity is passed in
explicitly). Ganak builds its cusps on the tropical sky and then subtracts the
ayanamsa, so the identity checked is:

>  Ganak sidereal cusp  +  KP-New ayanamsa(at the instant)  ==  Swiss Ephemeris tropical Placidus cusp

For each chart the reference is fed Ganak's **own** reconstructed `(ARMC, eps, lat)`:
`eps` and JD are standard published formulae, and the ARMC is obtained by an
independent robust inversion of the standard ascendant equation. Swiss Ephemeris's
returned ascendant is checked against the number's ascendant as a self-consistency
guard on the reconstruction.

### Fixed inputs and Ganak's cusps (the three pinned anchors — all CORRECT)

Instant for all: **2026-07-24 10:00:00 UTC** (15:30 IST). eps = 23.435837°, KP-New
ayanamsa = 24.137692°.

| Input | Number | Place (lat) | Ganak sidereal cusps 1..12 | Worst Δ vs Swiss |
|---|---|---|---|---|
| A | 108 | New Delhi (28.6139) | 153.000, 180.891, 211.318, 242.882, 274.409, 304.854, 333.000, 0.891, 31.318, 62.882, 94.409, 124.854 | **0.0000″** |
| B | 200 | New Delhi (28.6139) | 287.778, 328.248, 3.959, 32.279, 56.326, 79.969, 107.778, 148.248, 183.959, 212.279, 236.326, 259.969 | **0.0000″** |
| C | 108 | London (51.5074) | 153.000, 176.533, 206.281, 242.138, 278.392, 308.780, 333.000, 356.533, 26.281, 62.138, 98.392, 128.780 | **0.0000″** |

Tolerance: a few arc-minutes (task brief). Measured worst on these three: **0.0000″**.
When the number→RAMC inversion converges, Ganak's Placidus cusp math is **exactly**
correct against the industry reference. These three are pinned as GREEN anchors in
`validation/prashna-249-chart.cjs` (§1b), guard proven by perturbation.

### F14 (P1) — `PR_ramcForAsc` mis-converges for a latitude-dependent band of numbers — FIXED 2026-07-29

A full sweep of all 1..249 at three latitudes (New Delhi, London, Sydney; 747 Placidus
charts, high-lat equal-house cases excluded) found **72 charts** whose houses disagree
with Swiss Ephemeris beyond tolerance — worst **276231″ ≈ 76.7°**. The offenders are
contiguous, latitude-dependent number bands:

- **New Delhi:** #39–53 (15 numbers)
- **London:** #29–65 (37 numbers)
- **Sydney:** #37–56 (20 numbers)

**Worked example — #45, New Delhi.** The number's tropical ascendant is 89.027°. The
RAMC that actually produces that ascendant is **345.26°** (→ MC 344.00°, cusp 2
111.85°, cusp 11 17.95°). But Ganak's `PR_ramcForAsc` returns **RAMC ≈ 0°** (→ MC 0.00°,
cusp 2 124.89°, cusp 11 34.70°). Swiss Ephemeris confirms Ganak's cusps are the correct
Placidus cusps *for RAMC 0* — i.e. Ganak solved the Placidus geometry correctly but
from the **wrong RAMC**. The ascendant (cusp 1) is still shown correctly because
`PR_castNumber` pins it directly (`trop[1] = ascTrop`), so cusp 1 and its opposite
cusp 7 stay right, but MC and cusps 2,3,11,12 (and their derived opposites 5,6,8,9) are
built from the wrong RAMC and are **inconsistent with the pinned ascendant**.

**Root cause.** `PR_ramcForAsc` (`src/screens/PrashnaScreen.tsx`, in the number-method
region BELOW the frozen parity markers, ~lines 275–283) bisects `[0°,360°)` using the
test `norm360(ascOf(mid) - target) < 180`. The ascendant is monotonic in RAMC over a
full turn, but this wrap-around test collapses the interval toward the wrong boundary
when the true RAMC lies in the "far" half relative to the midpoint — so it returns a
wrong RAMC (often ≈0) instead of the true root. This is a classic wrap-unsafe
bisection. The frozen Lahiri time engine is unaffected (it never inverts an ascendant;
it computes RAMC from sidereal time), so Prashna parity is untouched.

**Product impact.** `PR_judge` reads `chart.cusps[q.cusp]` to pick the cuspal sub-lord
and `chart.cusps[h]` sign-lords to find significators. For an affected number, cusps
other than 1/7 are wrong, so the sub-lord and significators — and therefore the
**yes/no/mixed verdict** — are wrong for every question type whose judged cusp is not
1 or 7 (career/10, money/11, health/6, education & property/4, children/5, disputes/6,
lost/2, venture/10, general/1-ok). Only marriage (cusp 7) and "general" (cusp 1) are
immune. The size of the affected band depends on latitude.

### Verdict (original STOP — now resolved)

- **Placidus cusp MATH: externally VERIFIED correct** against Swiss Ephemeris (0.0000″
  on every convergent chart; 675/747 charts at time of discovery). Three anchors pinned.
- **Number→RAMC inversion: was BROKEN (F14, P1)** for a latitude-dependent band; corrupted
  houses 2–12 and the verdict for those numbers. **Now FIXED — see below.**

### F14 — FIXED (2026-07-29, `claude/prashna-249-f14-ramc`)

**The fix.** `PR_ramcForAsc` was rewritten from the wrap-unsafe `lo=0,hi=360` bisection
to a **wrap-safe coarse-scan + in-cell bisection**: RAMC is scanned in small (0.5°) steps
to find the single wrap-free cell whose *forward* ascendant-arc contains the target
(`norm360(target − ascOf(r0)) ≤ norm360(ascOf(r1) − ascOf(r0))`), then bisected inside
that continuous, strictly-monotonic cell where no 360°→0° wrap can be straddled. A
full-resolution nearest-RAMC fallback handles any near-circumpolar geometric edge so the
function never returns a silently-wrong angle. The change is entirely BELOW the frozen
parity markers; the Lahiri time engine and `prashna-parity` (EXACT 198/6) are untouched.

**Why the old code failed (mechanism, London #29).** Target ascendant 64.14° needs
RAMC ≈ 303.3°. The ascendant wraps 360°→0° near RAMC ≈ 262°, so on the first bisection
step (mid = 180°, asc = 243.43°, `norm360(243.43 − 64.14) = 179.29 < 180` → `hi = 180`)
the true root at 303° was discarded, and the search collapsed to RAMC ≈ 0°.

**Post-fix evidence — the identical full sweep re-run against the fixed code:**

```
Checked 747 placidus charts against Swiss Ephemeris (tolerance 300"/5').
Worst per-cusp diff overall: 0.0" (0.00') at #19 London
All numbers agree within tolerance.
```

Worst per-cusp diff across the entire 1..249 × 3-latitude sweep is **0.0000″** (down from
276231″ ≈ 76.7°); **0 charts mis-converging** (was 72). Standalone, the new root-find
reproduces the target ascendant to 0.000000″ and matches an independent coarse-scan
inversion of the RAMC to 0.000000″ on all 747 charts.

**TDD anchors (RED→GREEN).** Three anchors inside the formerly-broken bands were added to
`validation/prashna-249-chart.cjs` §1b — **#45 New Delhi, #40 London, #45 Sydney** — with
their Swiss-Ephemeris-verified tropical cusps. On the pre-fix bisection they FAIL
(max Δ 60313.75″/201094.06″/66080.60″ ≈ 16.75°/55.86°/18.36°) while the convergent #108/#200
anchors still pass (17 pass / 3 fail); on the fix all pass (**20 pass / 0 fail**). Guard
proven by perturbation (reverting the source → exactly those three fail).

Evidence harnesses (not shipped; `.scratch/` is gitignored): `prashna-cusp-compute.cjs`
+ `refcheck/prashna-cusp-swisseph.cjs` (3-input demo), `prashna-cusp-fullrange.cjs` +
`refcheck/prashna-cusp-fullcheck.cjs` (full 1..249 × 3-latitude sweep), plus the fix-side
re-run harness `f14-fullrange-wt.cjs` and RED/GREEN checks `f14-algo-test.cjs` /
`f14-red-cmp.cjs`.
