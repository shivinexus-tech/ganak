# P0-PRASHNA-249-RESEARCH — findings & owner checkpoint

Status: **REVIEW — awaiting owner approval before any code**
Date: 2026-07-20 · Brief: [prashna-number-method-research.md](prashna-number-method-research.md)
Canonical table: [prashna-249-table.md](prashna-249-table.md) (computed, cross-checked)

---

## 1. The method, verified

**KP Horary Number Prashna** is confirmed as the established method matching the owner's
suggestion. How it works, corroborated across independent sources and reproduced by
computation:

1. The querent, focused sincerely on **one** question, gives a number **1–249**.
2. Each number maps to a fixed segment of the sidereal zodiac — sign, nakshatra (star
   lord) and Vimshottari **sub lord**. The number **fixes the Prashna ascendant at the
   start degree of that segment**. This replaces the time-based lagna and nothing else.
3. Cusps 2–12 come from **Placidus** for the *moment and place of judgment*; **planets
   stay at their actual positions for that moment**. So the number personalises the
   houses; the sky stays real.
4. Judgment is unchanged KP: the question's primary cusp sub-lord, its star/sub
   connections to the favour/deny house groups, significators, dasha for timing.

**The number is not the prediction and not numerology** — two different numbers given
for the same question at the same moment give different house frames over the same sky.
That's the entire mechanism, and the UI copy must say so plainly.

### Why 249 (settled by computation, not by sources)

27 nakshatras × 9 subs = 243 segments, spans proportional to Vimshottari years (so
**not equal** — 0°40′ for Sun subs up to 2°13′20″ for Venus subs; one web source
claiming "249 equal portions" is simply wrong). Six of the 243 subs straddle a rashi
boundary and are split into two numbered entries — computed splits at **22/23, 62/63,
105/106, 145/146, 188/189, 228/229** — giving exactly 249. The published PDF table
agrees with the computation on every spot-checked row and all six splits, and the
computation caught one transcription typo in the PDF (no. 116). Conclusion for
implementation: **the engine and its gate recompute the table from the Vimshottari
proportions; nothing is hand-transcribed.**

---

## 2. Research questions from the brief — answers

| Question | Answer | Basis |
|---|---|---|
| Exact 1–249 boundary table | Computed from first principles; 249 rows incl. 6 sign-boundary splits; matches published table; one PDF typo found (no. 116) | [prashna-249-table.md](prashna-249-table.md) |
| Number selects which degree? | **Start of the segment** becomes the lagna (not midpoint) | KP convention, corroborated by calculator implementations (PanchangBodh, OnlineJyotish, JagannathHora guides) |
| Ayanamsa | **Recommend: Lahiri, with the disclosure line the Prashna screen already shows.** KP Old ≈ Lahiri +≈6′, KP New further; a ~6′ shift can flip a planet's sub occasionally. But Ganak's existing Prashna engine is Lahiri and *already discloses* "KP-style sub-lords, Lahiri ayanamsa, Drik conventions" bilingually (PrashnaScreen line 464–465), the parity gate freezes the engine byte-exact, and consistency across Ganak is the brand. Do **not** advertise the mode as "pure KP"; name it "KP number method — Ganak conventions". Full-KP ayanamsa can be a later owner decision (it's an engine fork, parity re-baseline). | Engine inspection + ayanamsa comparisons (AstroSage, RoxyAPI, destiniq) |
| House system + high-latitude | Placidus — **already in the engine**, with an **equal-house fallback above high latitudes already implemented and disclosed** ("equal houses — high-latitude fallback") | PrashnaScreen lines 120, 186–196, 464 |
| Whose place? | Classical: where the question is *taken up for judgment* (astrologer's place). Ganak is self-service ⇒ querent = judge ⇒ **user's confirmed current place**, via the existing shared place selector. Show the city on the result card. | kpastroapp workflow + KP practice |
| House groups per chip | **Already exist and are gate-locked**: all 12 chips carry `cusp / favor / deny` (e.g. marriage 7: favour 2,7,11 deny 1,6,10) validated by the 24-test calc gate. The number mode reuses the judgment layer unchanged. | PrashnaScreen `QUESTIONS` table, lines 211–224 |
| Ruling planets / Moon check | Standard set: day lord, moment-lagna sign & star lord, Moon sign & star lord; Moon's star-lord connection to the question's houses = sincerity/ripeness check. **Recommend v1.1**, not v1 — additive UI, no engine risk. | kpastroapp workflow |
| Repeat / vague questions | First sincere number stands; no re-asking without genuinely changed circumstances; no test questions; one question at a time. Becomes UI guidance copy (below). | kpastroapp workflow |
| Not Prashnavali | Confirmed distinct (number→verse lookup). Never share naming or copy. | brief + sources |
| Gate + prove-it plan | §5 below | — |

---

## 3. Proposed user flow (for the mock-up)

Mode toggle at the top of the existing Prashna screen — **two named methods, never mixed**:

- **"इस क्षण से पूछें / Ask from this moment"** — the current, unchanged screen.
- **"KP अंक विधि (1–249) / KP number method (1–249)"** — new.

Number-mode flow (phone-first):
1. Question chip (existing 12, unchanged).
2. Number entry 1–249 — large numeric field + a "?" gloss:
   *EN:* "Close your eyes, hold your question, and let one number between 1 and 249
   come to you. It is not a lucky number — the first sincere number is the one.
   Don't change it."
   *HI:* "आँखें बंद कर प्रश्न पर ध्यान रखें और 1 से 249 के बीच जो पहला अंक मन में आए,
   वही दें। यह शुभ-अंक नहीं है — पहला सच्चा अंक ही मान्य है। इसे बदलें नहीं।"
3. Place: the shared confirmed place (city shown; changeable via existing selector).
4. One deliberate button: "उत्तर देखें / Cast the answer" — the moment is captured only
   on this press (no reset without user action, per standing rule).
5. Result: **answer-first** (existing verdict card style), then "आपके अंक ने क्या तय
   किया / what your number set": *number → sign, star lord, sub lord, lagna degree* —
   then the technical chart below, as today.
6. Repeat protection: after a cast, the number field locks with "same question, same
   number" note; a "new question" action clears it. No silent recasts.

Validation: integers 1–249 only; friendly bilingual error otherwise; explicitly reject
0, 250+, decimals with "the tradition prescribes 1–249".

---

## 4. Worked examples (mapping real; planetary layout illustrative)

The number→lagna line in each example is exact from the computed table; the judgment
narrative shows the intended answer-first copy shape (mirroring the engine's existing
`verdict / sub / score` output). Planetary placements are **illustrative** — final
copy will come from the real engine, never hand-authored.

**Favourable — Marriage, number 108**
Number 108 → Kanya (Virgo), star lord Sun (Uttara Phalguni), sub lord Saturn; lagna
fixed at **Virgo 3°00′00″**. 7th cusp ≈ Meena. *Copy shape:* "Your number set the
ascendant at Virgo 3°00′. The 7th-house sub lord connects to houses 2, 7 and 11 —
the marriage houses. **Favourable.** Likely period: Venus dasha windows."

**Unfavourable — Job change, number 45**
Number 45 → Mithuna (Gemini), star lord Mars (Mrigashira), sub lord Sun; lagna at
**Gemini 4°53′20″**. *Copy shape:* "The 10th-house sub lord signifies 5 and 12 —
houses of leaving and loss, not of the new job. **Not favourable now.** Ask again
only when circumstances truly change."

**Mixed — Health recovery, number 200**
Number 200 → Makara (Capricorn), star lord Moon (Shravana), sub lord Mercury; lagna at
**Capricorn 17°46′40″**. *Copy shape:* "Recovery houses 1 and 11 are signified, but
the 6th also stays active. **Recovery indicated, slowly.** Strength returns in the
Moon sub-period; continue treatment."

---

## 5. Implementation & gate plan (after approval — not started)

- `src/engine/kp-horary.ts` (new): `kpNumberToLagna(n)` computing the table from
  Vimshottari constants already in `engine/panchang.ts` (`VIM_LORDS`); pure, no UI.
- PrashnaScreen: mode toggle + number input; **the marker-guarded time-engine slice is
  not edited** — the number path only substitutes the lagna input to the cusp
  computation. Parity gate must stay EXACT on the existing mode.
- New gate `validation/prashna-249.cjs`: recomputes all 249 rows from first principles
  and asserts the engine mapping matches on all 249; pins the 6 splits, the 3
  structural twins (33/116/199 = 15°40′00″), and numbers 1/124/125/249 as named
  anchors. **Prove-the-guard:** temporarily change Saturn's Vimshottari years 19→18 —
  the gate must fail with hundreds of mismatches — then restore and watch it pass.
- Existing gates (parity EXACT, calc 24/24, parse, build) all stay green throughout.

## 6. Open items for the owner (approval needed)

1. **Approve the mode** as designed (separate named toggle, reusing the existing
   judgment engine and chips)?
2. **Ayanamsa**: accept the Lahiri-with-disclosure recommendation ("KP number method —
   Ganak conventions"), or commission a true-KP-ayanamsa fork later?
3. **Naming**: "KP अंक विधि / KP number method (1–249)" — or a Ganak-branded name?
4. Ruling planets + Moon-sincerity note as **v1.1** (after launch of the mode) — OK?
5. Mock-up (next file) — approve the phone-first layout?

Sources: kpastroapp.com casting workflow; kpastrology.com 1–249 PDF (verified against
computation); PanchangBodh / OnlineJyotish / JagannathHora KP-horary implementation
guides; AstroSage & RoxyAPI ayanamsa comparisons. Primary-text verification (KSK
Horary readers) recommended before the engine ships — noted as an implementation
pre-condition, consistent with the project's religious-accuracy rule.
