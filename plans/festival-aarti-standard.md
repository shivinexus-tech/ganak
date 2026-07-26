# Festival Aarti — Rendering & Orthography Standard

**Purpose:** one house standard so every aarti in Ganak looks and reads
consistently, no matter who enters it or from which source. Keep it basic; the goal
is consistency, not scholarship. Companion to
`docs/superpowers/specs/2026-07-25-festival-aarti-section-design.md`.

**Product principle (owner, 2026-07-26):** this exists for users who lack an
authentic source and are hunting through ad-cluttered, noisy apps to find an aarti.
So the aarti must be **clean, complete, correct, and easy to reach — never wrapped in
ads or clutter.** That principle overrides any temptation to shorten or decorate.

---

## 1. Orthography (Devanagari house rules)

Apply these when two sources agree on the words but differ on spelling.

- **Om:** always the single glyph `ॐ` (U+0950). Never `ओम्` or `ऒम`.
- **Nasalization:** anusvara `ं` before a consonant (जगदीश, मंगल); chandrabindu `ँ`
  only for a genuinely nasalized open vowel (माँ, मैं, हूँ).
- **Conjuncts / halant:** keep standard print conjuncts (कृपा, प्रभु, स्वामी); do not
  break them with an explicit halant unless the word genuinely ends in one (जगत्).
- **Nukta:** use only where the standard word requires it; most aartis need none.
- **Line end:** single danda `।` at the end of each sung line.
- **Stanza / refrain end:** double danda `॥` at the end of a full stanza or the
  repeated refrain.
- **Numerals:** avoid inline numerals; if a verse is numbered, use Devanagari digits
  (१, २…) or omit. Do not use Latin digits.
- **No Latin:** verses are Devanagari only — no transliteration inside the verse text.
- **Whitespace:** exactly one sung line per text line; one blank line between stanzas.
  Trailing/leading spaces trimmed. This is what `white-space: pre-line` renders.

## 2. Which aartis a festival gets (editorial mapping rule)

Standard North Indian puja order gives up to **three** aartis for a major festival:

1. **Ganesh invocation aarti** — *Jai Ganesh Deva* — where the tradition opens with
   Ganesh (most major pujas).
2. **The festival deity's own aarti** — e.g. Lakshmi, Durga, Shiva, Krishna, Ram,
   Hanuman.
3. **Closing aarti — chosen by the deity family** (owner rule, 2026-07-26):
   - **Vishnu-related** (Vishnu, Lakshmi, Krishna, Ram, Satyanarayan) → *Om Jai
     Jagdish Hare*.
   - **Shiva- or Shakti-related** (Shiva, Durga, Gauri/Parvati, Devi forms) → *Om Jai
     Shiv Omkara*.
   - **Hanuman-related** → the **Rama aarti is a must** as the paired close.

Rules:
- Order in the UI follows worship order: **invocation → deity → closing.**
- A single-deity vrat may carry just its deity aarti (1), optionally + the close.
- If the deity aarti already **is** the family's closing aarti (e.g. a pure Shiva
  festival whose deity aarti is *Om Jai Shiv Omkara*), do **not** repeat it as a
  separate closer.
- Include an aarti only where it is genuinely customary; do not pad to reach three.
- Confirmed per-festival list lives in the spec once the owner signs off.

## 3. Layout / rendering

- Each aarti = one collapsible `<details>` in `VratVidhiCard`, titled from `title`.
- The aarti block sits **after the Puja section**, before the kathas.
- **English meaning** (`intro.en`) shows above the verses in **English mode only**;
  Hindi mode shows `intro.hi` or nothing.
- Verses render in `white-space: pre-line` (line breaks preserved), Devanagari in
  both language modes.
- **One shared disclaimer** at the **bottom** of the whole aarti block, in small
  muted text (`T.fMicro`, `C.muted`):
  - EN: "This is a widely-sung version; your family's wording may differ."
  - HI: "यह व्यापक रूप से गाई जाने वाली आरती है; आपके परिवार की परम्परा में शब्द भिन्न हो सकते हैं।"
- No ads, no interstitials, no unrelated links inside or around the aarti.

## 4. Sourcing, provenance & the copyright workaround

- Cross-validate **2–3 authentic sources** per aarti; enter the most widely-sung
  standard text.
- **Provenance workaround:** include only aartis that are **traditional devotional
  texts in long-standing public/temple use** — public domain by age and tradition
  (e.g. *Om Jai Jagdish Hare*, Pt. Shardha Ram Phillauri, 1870). This avoids any
  licensing question. Where a popular arrangement has known *modern* authorship,
  fall back to a long-established public-domain version rather than the modern one.
- Record, per aarti, the **2–3 sources checked** and a one-line provenance note in a
  citations file (mirroring `plans/major-festival-guide-research.md`).

## 5. Validation hooks (for `validation/festival-aarti.cjs`)

- Every Phase-1 guide key has a non-empty `aartis` array.
- Each aarti: non-empty `title`, `intro`, `verses`; `verses` contains Devanagari
  (range `ऀ`–`ॿ`) and ≥ 4 non-empty lines.
- Orthography spot-checks: reject `ओम्` in verses (must be `ॐ`); reject Latin letters
  inside verse text.
- First-line anchor per named aarti (catches a wrong/swapped aarti).
- Explicit allow-list of guides that correctly carry **no** aarti (eclipses, Makar
  Sankranti Surya arghya, plain Ekadashi/Pradosh timing pages).

---

## 6. Source citations (per aarti)

Cross-validated Devanagari sources. drikpanchang.com is the primary anchor (an
app-approved host); a second/third source is checked per aarti during drafting.

### Diwali proof slice (verified 2026-07-26)
- **Ganesh — Jai Ganesh Deva:** drikpanchang `/lyrics/aarti/shree-ganesh/jay-ganesh-aarti.html` (hi). Standard couplet form; parenthetical regional variants and `x2` repeat markers dropped for a clean single reading.
- **Lakshmi — Om Jai Lakshmi Mata:** drikpanchang `/lyrics/aarti/lakshmi-mata/lakshmi-mata-aarti.html` (hi). Full 8-stanza form.
- **Om Jai Jagdish Hare:** drikpanchang `/lyrics/aarti/lord-narayan/jai-jagdish-aarti.html` (hi). Standard couplet form (echo half-lines condensed). **Note:** source has a typo `स्वमी` in one line — corrected to `स्वामी` here (example of why 2–3 sources are cross-checked).
