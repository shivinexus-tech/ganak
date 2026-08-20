# Prashna house system above 60° — bug bash F17, closed 2026-08-19

**Lane:** `claude/prashna-house-system`, worktree `.scratch/worktrees/prashna-houses`, base `origin/main` `f8c0273`.
**Owned:** `src/screens/PrashnaScreen.tsx`, `validation/prashna-calc.js`, `validation/prashna-high-latitude.cjs`,
`validation/prashna-249-chart.cjs`, `validation/snapshots/prashna-result.{en,hi}.txt`, this note.
**Read but never edited:** `src/screens/ChartScreen.tsx`, `src/engine/kundli.ts`, `src/engine/houses.ts`.

---

## 1. What an astrologer in Reykjavík used to see

The same app, the same place, the same minute, two pages — and two different sets of houses.

Reykjavík, 2026-06-21 at 12:00Z, sidereal cusps as each screen printed them:

```
  house |  Prashna (horary) |  Jyotish (chart)  |  gap
      1 |  Leo 23°00′       |  Leo 23°00′       |    0.00°
      2 |  Vir 23°00′       |  Vir 11°04′       |   11.94°
      3 |  Lib 23°00′       |  Lib  7°04′       |   15.94°
      4 |  Sco 23°00′       |  Sco 15°12′       |    7.80°
      5 |  Sag 23°00′       |  Sag 29°34′       |    6.57°
      6 |  Cap 23°00′       |  Aqu  0°36′       |    7.61°
      7 |  Aqu 23°00′       |  Aqu 23°00′       |    0.00°
      8 |  Pis 23°00′       |  Pis 11°04′       |   11.94°
      9 |  Ari 23°00′       |  Ari  7°04′       |   15.94°
     10 |  Tau 23°00′       |  Tau 15°12′       |    7.80°
     11 |  Gem 23°00′       |  Gem 29°34′       |    6.57°
     12 |  Can 23°00′       |  Leo  0°36′       |    7.61°
  Prashna system: equal        Jyotish system: Placidus
```

Twelve o'clock is the mild hour. Swept across the whole day the worst single cusp at Reykjavík stood
**81.34°** apart between the two screens, and at the Arctic Circle **133°**. Because KP judges a
question on the sub-lord of a *cusp*, a cusp in the wrong sign is a different answer to the question,
not a cosmetic difference.

Ten northern places were affected — everything between 60° and the polar circle, in both hemispheres.
The before/after sweep (24 hours × 31 latitudes, `.scratch/f17/sweep.cjs`):

| latitude | worst cross-surface gap BEFORE | AFTER |
|---|---|---|
| 59.99° (Oslo side) | 0.00° | 0.00° |
| 60.01° | 59.03° | **0.00°** |
| Helsinki 60.17° | 59.71° | **0.00°** |
| Whitehorse 60.72° | 62.12° | **0.00°** |
| Anchorage 61.22° | 64.45° | **0.00°** |
| Yellowknife 62.45° | 70.73° | **0.00°** |
| Trondheim 63.43° | 76.40° | **0.00°** |
| **Reykjavík 64.15°** | **81.34°** | **0.00°** |
| Fairbanks 64.84° | 92.35° | **0.00°** |
| 66.0° | 116.97° | **0.00°** |
| Arctic Circle 66.5635° | 132.98° | **0.00°** |
| −60.01°, −62.45°, −64.15°, −66.56° (south) | 59.09°–133.31° | **0.00°** |

Above the polar circle the two surfaces still differ, deliberately and by a documented product
decision — see §4.

## 2. The cause

`PR_placidus` inside the parity-frozen markers of `src/screens/PrashnaScreen.tsx` opened with

```js
if (Math.abs(lat) > 60) return null;     // → PR_ring falls back to equal house
```

Nothing in the repository, in KP, or in spherical astronomy puts a boundary at 60°. Placidus is
undefined exactly where a cusp-defining ecliptic point is **circumpolar**, `|tan φ · tan δ| ≥ 1` —
and since an ecliptic point's declination never exceeds the obliquity, that first bites at the
**polar circle, ~66.56°**. `src/engine/houses.ts`, the Placidus behind the Jyotish chart screen, has
always used that geometric test. The horary screen was refusing Placidus to places that have it.

**Why no gate saw it.** `validation/prashna-parity.js` compares the screen's copy of the engine with
`validation/prashna-calc.js`'s copy. Both carried the same flat 60. Its case list even names
*"Reykjavik, equal-house fallback"* — it was exercising the wrong branch in both copies and calling
the agreement EXACT. And `validation/prashna-high-latitude.cjs`, written a day earlier precisely to
break that tautology, had pinned its Björk anchor to the **equal** ring, so the error was written
into the external gate as the expected answer.

## 3. The fix, and which system is right

**One line deleted in each of the two copies** — the flat cutoff — leaving the geometric circumpolar
test that was already inside the solver. Below the polar circle both screens now compute Placidus;
above it Placidus genuinely does not exist and `PR_ring` falls back to equal house as before.

**Which system each surface should use, and the source.** KP is a Placidus system. The primary
casting rule is explicit — *"for the other cusps take only the LATITUDE, prepared per the PLACIDUS
system"* (K.S. Krishnamurti, **KP Reader VI, Section IV**, "Erection of horary horoscope";
page-pinned in `plans/prashna-249-ksk-verify.md`, rules 1 and 9). So wherever Placidus exists, KP
horary uses it, and the Jyotish chart screen was the one already right. **Confidence: high** — this
is not a case where sources disagree; it is a case where one screen had an unsourced constant.

Above the polar circle the KP Readers record **no polar convention at all**, so nothing there can be
attributed to KSK. `plans/prashna-249-ksk-verify.md` rule 9 already records Ganak's equal-house
choice as a **product decision, explicitly not doctrine**, and that stands unchanged.

**A consequence worth stating plainly:** genuine Placidus houses grow very unequal towards the pole —
at Fairbanks a house reaches 123°, at the polar circle 173°, and seven grahas can honestly fall in
one of them. That is a property of the system, not a bug, and it is the reason the polar fallback
exists at all. The old 120°-wide-house assertion in the gate was a fair proxy while everything above
60° was equal-house; it has been **replaced by a stronger check**, not dropped (§5).

## 4. What still differs between the two screens, and why it is not this lane's call

Above the polar circle:

* **Prashna** falls back to **equal house** (rule 9).
* **Jyotish** falls back to **Porphyry** (`src/engine/kundli.ts`, "Porphyry (Placidus undefined at
  this latitude)").

Neither is doctrine; both are honestly named on their own screen. One app should still pick one
convention. Unifying them edits `src/engine/kundli.ts` — another lane's file — and changes shipped
Jyotish charts, so it is a product call, not a fix. `validation/prashna-high-latitude.cjs` now prints
the difference on every run rather than asserting it away.

The Prashna screen's own astrologer footnote now says so in both languages: *"equal houses — above
the polar circle Placidus does not exist; the Jyotish chart screen falls back to Porphyry there"* /
*"समान भाव — ध्रुव वृत्त के ऊपर प्लेसिडस सम्भव नहीं; ज्योतिष कुंडली वहाँ पोर्फ़री लेती है"*.

Also measured and recorded: above the polar circle, in the equal ring, the real Midheaven lands in
houses **7 through 12** depending on the hour — not only the 9th–11th that holds at lower latitudes.
The gate no longer over-claims the narrower range.

### OPEN HANDOFF (found here, belongs to the Jyotish lane): the chart screen's polar ascendant

`PrashnaScreen` received a **polar quadrant correction** on 2026-08-18: above the polar circle the
textbook ascendant arctangent lands in the wrong quadrant for part of the day and returns the
**descendant** as the rising degree. `src/engine/kundli.ts` never received it, and still does it:

```
lat 68.9585  lon 18.956  2026-06-21
   0:00Z  Prashna asc Cap 3.25   Jyotish asc Can 3.25   Δ 180.00°
  22:00Z  Prashna asc Tau 0.74   Jyotish asc Sco 0.74   Δ 180.00°
```

18 of 96 sampled polar hours. The whole Jyotish chart is rotated by six houses for those hours.
`validation/prashna-high-latitude.cjs` proves it against the published definition of a rising degree
(altitude 0° **and** east of the meridian **and** rising a minute later), prints it as an
**OPEN HANDOFF** line, and flips to ✓ by itself once the correction lands — the same pattern
`validation/prashna-judgment-zone.cjs` uses, so it cannot be forgotten and does not redden the board.

**The exact change, for the lane that owns `src/engine/kundli.ts`.** After computing `ascSid`
(and the tropical ascendant that feeds `placidusCusps`), apply the same correction the Prashna engine
uses — take the hour angle of the computed point and, if it is west of the meridian, take its
opposite:

```js
// RA of an ecliptic degree on the ecliptic itself: tan(RA) = cos(eps)·tan(lambda)
const raOfEcl = (lam, eps) => rev(atan2d(cdg(eps) * sd(lam), cdg(lam)));
// ascTrop is the raw arctangent ascendant; ramcK the RAMC already computed at line ~195
if (sd(rev(ramcK - raOfEcl(ascTrop, epsObl))) > 0) ascTrop = rev(ascTrop + 180);
```

then derive `ascSid` from the corrected `ascTrop`. Below the polar circle `sin(H)` is never positive
there, so it is a no-op for every latitude Ganak's other gates cover. It must be verified against the
definition of a rising degree, not against the Prashna copy.

## 5. The gate, re-anchored so it can never again mean "the two copies agree"

`validation/prashna-high-latitude.cjs`:

* **[1] The published charts now anchor Placidus, and anchor it harder.** Björk (Reykjavík 64.15°N,
  Astrotheme, Rodden AA) and Sibelius (Hämeenlinna 60.98°N, Rodden B) are both *below* the polar
  circle, so both are Placidus — and in Placidus **the tenth cusp IS the Midheaven**. The gate used to
  assert the equal-house relation `cusp 10 == asc + 270°`; it now asserts `cusp 10 == the published
  MC` to the arcminute, against the same published literal, plus `cusp 4 == published MC + 180°`, plus
  an explicit "this must NOT be an equal ring". Measured: 2.1′ and 2.3′ from the printed figures,
  tolerance 4′.
* **[1b] The equal branch moved to where it belongs** — five polar latitudes, both hemispheres, five
  hours each, both engine copies: system must be `equal`, every cusp exactly `asc + 30(h−1)`, and the
  externally recovered MC must **not** be cusp 10.
* **[2b] NEW — the published definition of Placidus.** Placidus divides time: a point takes a
  semi-diurnal arc `SD = 90° + AD` to go from the eastern horizon to the meridian, where
  `sin AD = tan φ · tan δ`. The intermediate cusps trisect those arcs. For every Placidus chart in the
  sweep the gate takes the cusp longitude the engine **returned**, converts it to RA and declination
  by the published formulas, computes that point's own semi-arc, and checks it stands where the
  definition says: `RA(11) = RAMC + SD/3`, `RA(12) = RAMC + 2SD/3`, `RA(2) = RAMC + 180 − 2SN/3`,
  `RA(3) = RAMC + 180 − SN/3`. **1,728 cusps, worst residual 0.00301°**, tolerance 0.02°. This is the
  check that replaced the 120° cap: a cap admits any wrong cusp under 120°, the trisection admits
  exactly one value, and neither engine copy is ever compared to the other.
* **[3] Placement, not a proxy.** "No more than 6 grahas in one house" was a proxy for the collapsed
  ring of F3 and is false for a legitimate 173° Placidus house. Replaced by the thing it stood for:
  every graha must actually **lie inside** the house the engine says it is in. Kept as-is for the
  equal ring, where a 30° house makes it meaningful.
* **[4] NEW — the two surfaces side by side.** 15 latitudes × 4 hours, the horary ring against the
  chart screen's KP ring: same system name, twelve cusps within one arcminute. Worst disagreement now
  **6.47″** (that residue is the two engines' slightly different Lahiri expressions, not house
  division). This is the one section that compares Ganak with Ganak, and it says so: it is a
  consistency check, never the reason to believe either ring is right.

`validation/prashna-249-chart.cjs` had the same tautology in miniature — it asserted "Reykjavík falls
back to equal houses". It is now two-sided: Placidus at Reykjavík and at 66°N, equal house at Tromsø.

### Fail-then-pass

Each perturbation was applied, the gate run, then reverted. **In cases B–E the perturbation was
applied to BOTH copies of the engine — parity stayed EXACT while the new assertions reddened, which
is the whole point.**

```
--- A. reinstate the flat |lat| > 60 cutoff in the SCREEN copy only
    FAIL  Björk — Reykjavík … expected Placidus (this chart is below the polar circle…), got 'equal'
    FAIL  Björk — Reykjavík … cusp 10 is Leo 18°18'53", 2227.1′ from the published MC 25°26′ Virgo
    ...580 FAIL lines total
    ✗ prashna-high-latitude: 14599 passed, 580 failed
    parity: ✗ parity FAILED: worst numeric diff 4.74e+1° | 19 mismatch(es)

--- B. reinstate the flat cutoff in BOTH copies (the F17 state as shipped)
    FAIL  Björk — Reykjavík … expected Placidus …, got 'equal'
    ...588 FAIL lines total
    ✗ prashna-high-latitude: 14195 passed, 588 failed
    parity: ✓ parity EXACT: 198 values across 6 charts | worst numeric diff 5.68e-14° | 0 mismatch(es)

--- C. mis-trisect cusp 11 by 1% in BOTH copies (two copies of one error)
    FAIL  … cusp 11 Aries 16°57'28" is 0.3000° away from the point that trisects its own diurnal arc
    ...552 FAIL lines total
    ✗ prashna-high-latitude: 14393 passed, 552 failed
    parity: ✓ parity EXACT … 0 mismatch(es)

--- D. pin cusp 10 to the real MC inside the equal ring, BOTH copies (the F3 defect)
    FAIL  … 67 north (67°) 00:00Z: equal-house cusp 10 is Pisces 14°04'32", expected ascendant+270°
    FAIL  … cusp 10 equals the real MC — that is an equal ring with a real angle pinned into it
    ...769 FAIL lines total
    ✗ prashna-high-latitude: 14176 passed, 769 failed
    parity: ✓ parity EXACT … 0 mismatch(es)

--- E. report every graha one house early, BOTH copies
    FAIL  … Su at Leo 0°52'07" is reported in house 2, which runs Gemini 19°53'39" to Cancer 18°38'30"
    ...6210 FAIL lines total
    ✗ prashna-high-latitude: 8735 passed, 6210 failed
    parity: ✓ parity EXACT … 0 mismatch(es)

restored, real tree: ✓ prashna-high-latitude: 14945 passed, 0 failed
```

## 6. The two copies are still the same code

Byte-identity was never true here (the engine copy names a temp the screen copy inlines, and the two
files are spaced differently), so a byte comparison would prove nothing. What matters is that the
edit landed in both. `.scratch/f17/twin-proof.cjs` compares the two Placidus implementations directly
over a dense grid — latitude −89° to 89° in 0.25° steps × RAMC 0–359 in 7° steps × three obliquities:

```
Placidus solutions compared        111,228
  cutoff decision disagreements    0
  worst cusp difference            0.00e+0°
  mismatches                       0
```

Plus `prashna-parity.js`: **✓ parity EXACT: 198 values across 6 charts | worst numeric diff
5.68e-14° | 0 mismatch(es)**.

