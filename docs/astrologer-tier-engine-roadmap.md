# Ganak — engine roadmap for the astrologer tier

**Purpose.** Astrologers are a core audience and the intended paying segment. Their bar for
*computational depth* is set by Cosmic Insights (mobile) and Jagannatha Hora / Parashara's
Light (desktop). This roadmap lists, in priority order, the engine work to reach that bar —
so a serious practitioner can run their whole workflow in Ganak.

**Positioning (why this wins).** JHora is powerful but looks like 2005; Cosmic Insights is
deep but cluttered; both are computation-first and client-cold. Ganak's edge is **astrologer-
grade computation + a clean, bilingual, presentable UX and a plain-language reading layer the
incumbents lack.** Match the P0/P1 math, keep the presentation, and Ganak becomes the tool
astrologers use *with clients*, not just for back-office calculation.

**Status of this doc.** Priorities are firm; current-depth claims marked *(verify)* still need
an engine code-read to confirm — the Bash sandbox was throwing argument-size errors when this
was drafted, so only the exposed chart nav was confirmed, not each module's internals.

---

## Baseline — what Ganak already has (astrologer-relevant)
Confirmed from the live chart (`JyotishPanelNav` + `ChartScreen`): 16 divisional charts
(Shodasavarga), Grahas, Yogas, Karakas, Special points, **Bhava Bala**, Ashtakavarga, Arudha,
**Vimshottari dasha**, KP sub-lords + KP significators, **Shadbala**, birth-time rectification,
Guna Milan matching, saved charts. Plus, outside the chart: **Prashna (horary)**, a strong
Daily panchang, muhurat finder, and festival engine. This is a strong base — the gaps below
are specific modules, not a rebuild.

## Scope decision (owner, 2026-07-24): everything is committed
Per owner direction, **all modules below are in scope for the astrologer tier** — nothing is
deprioritised or cut. But "all P0" can't sequence the work, and some modules genuinely depend on
others, so the phase numbers below are a **build order driven by dependencies + daily-use value**,
not a priority ranking. Read "P0/P1/P2/P3" as "Wave 1/2/3/4 — the order to build, all committed."
Each module is parity-gated (anchored test values vs JHora/Cosmic/Drik) before it ships. This is a
large multi-module engine program; the sequence keeps every wave shippable.

## Phase V0 — Verify current depth first (blocks accurate estimation)
Read the engine to confirm how deep today's modules go, so P1 scope is real, not assumed:
1. **Vimshottari** — does it go Mahadasha → Antar → Pratyantar → Sookshma → Prana, or stop early?
2. **Ashtakavarga** — SAV + BAV only, or also Prastarashtaka / Kakshya / transit-AV?
3. **Divisional charts** — all 16 with Vargottama + Vimshopaka Bala, or charts without scoring?
4. **Karakas** — Chara karakas (Jaimini) or only Sthira/natural karakas?
5. **Yogas** — how many/which yogas are detected?
Effort: S (read-only). Output: turns every *(verify)* row below into a confirmed task or a "done".

## Phase P0 — Table stakes astrologers use daily
| Module | Best-in-class | Ganak today | Why it matters | Effort |
|---|---|---|---|---|
| **Transits / Gochar** | Cosmic, JHora, PL: interactive transits, Sade Sati, transit-over-natal, AV-transit | **Absent** | Every consultation checks current transits; the single biggest hole | **L** |
| **Multi-dasha systems** | Vimshottari, Yogini, Ashtottari, Kalachakra, Chara | **Vimshottari only** | Astrologers cross-check dashas; Yogini & Chara are everyday | **L** |
| **Deep Vimshottari sub-periods** | Antar→Pratyantar→Sookshma→Prana | *(verify)* | Timing precision lives in the deeper levels | **S–M** |

## Phase P1 — Depth serious practitioners expect
| Module | Best-in-class | Ganak today | Why it matters | Effort |
|---|---|---|---|---|
| **Varshaphal (annual/Tajika)** | PL: Muntha, year-lord, Tajika yogas, 4 annual dashas | **Absent** | Yearly readings are a core paid client service | **L** |
| **Avasthas** (planetary states) | PL: 6 kinds/planet (Baladi, Jagradadi, Deeptadi, Lajjitadi…) | **Absent** | Standard dignity layer astrologers cite | **M** |
| **Argala** (Jaimini intervention) | JHora, PL | **Absent** | Expected in serious Jaimini work | **M** |
| **Chara dasha + fuller Jaimini** | Chara dasha (Parashara & KN Rao), Chara karakas | Arudha yes; **Chara dasha no** | Completes the Jaimini toolkit | **M–L** |
| **Ashtakavarga depth** | Prastarashtaka, Kakshya, transit-AV | *(verify — likely SAV/BAV only)* | Prastaraka/Kakshya + AV-transit are the predictive payoff | **M** |

## Phase P2 — Rounding out the professional toolkit
| Module | Notes | Effort |
|---|---|---|
| **Structured remedies** (per-chart/nakshatra) | Cosmic has it; Ganak only has festival vidhis. Keep it non-fatalistic, sourced. | **M** |
| **Divisional scoring** (Vargottama, Vimshopaka Bala) | Only if V0 shows charts lack scoring | **S–M** |
| **Dosha calculators** (Mangal, Kaal Sarp, Sade Sati detail) | Common client questions; frame constructively | **M** |
| **Client-facing report export (PDF)** | The "use it with clients" wedge JHora/Cosmic do poorly | **M** |

## Phase P3 — Differentiators / research
Sudarshana Chakra · group/relationship (synastry) analysis · deeper yoga library · Tajika
aspects. Build only if astrologer feedback pulls them forward.

---

## Cross-cutting constraints
- **Engine track, not content.** All of this is astronomy/algorithm implementation in
  `src/engine/*`, distinct from the interpretation-copy work.
- **Parity-gated.** The existing `prashna-parity` / `prashna-calc` gates prove the engine is
  unchanged after refactors; every new calculator needs anchored test values (validate against
  JHora/Drik/Cosmic outputs for known charts), added as a validation gate.
- **No regression.** Chart tab is already live; new modules slot into `JyotishPanelNav` groups
  (Dashas group gains Yogini/Chara; a new Transits/Gochar destination; Tools gains Varshaphal).
- **Clean UX is the moat** — do not copy the cluttered incumbents; each module keeps the
  current presentation quality and offers a bilingual reading, not just a table.

## Monetization — DON'T paywall the math; paywall the practice
Jagannatha Hora is free and already computes everything (transits, all dashas, full Jaimini,
Ashtakavarga). Gating *computation* behind a paywall means charging for what astrologers get
free elsewhere — a losing move. Instead:
- **Free:** the full computation suite (charts, dashas, transits, Jaimini, Ashtakavarga). Win
  astrologers on **UX** — clean, mobile, bilingual, presentable — which JHora/Cosmic can't match.
- **Paid "Jyotish Pro":** the **practice workflow** — multi-client vault, **branded PDF/report
  export**, the rich interpretation/reading layer, saved & bulk charts, cloud sync. Durable
  willingness-to-pay because it's convenience and client-delivery, not a formula they can get free.
- The hook is *"run your practice in Ganak,"* not *"unlock a calculation."*

## Owner decisions (recommended 2026-07-24)
1. **Ayanamsa/house system — Lahiri-first, multi-ayanamsa-aware.** New modules read the existing
   global ayanamsa toggle (Lahiri default; KP already works); add **Raman** + **Pushya-paksha
   (True Chitra)** as selectable — cheap, signals seriousness. One parameterized engine, no forks.
   Houses already covered (whole-sign + Placidus + Bhava Chalit/Sripati) — no new work.
2. **Dashas — all committed.** Build order within the dasha wave: deepen **Vimshottari** to
   Sookshma/Prana → **Yogini** → **Chara (Jaimini)** → **Ashtottari** → **Kalachakra last**, with
   extra validation (its calculation is complex/contested; a subtle error would hurt credibility
   with this exact audience, so it ships only against strong anchored test charts).
3. **PDF client report — promoted to P1.** Strongest "switch to Ganak" wedge for working
   astrologers; build right after P0 compute; keep lightweight and branded. (Moved up from P2.)
4. **Free/paid — reframed as above:** computation free, practice-workflow paid.

## Suggested sequence
**V0 (verify)** → **P0 Transits + multi-dasha** (biggest daily value) → **P1 Varshaphal +
Jaimini suite + Avasthas** → **P2 remedies + PDF export** → **P3 as feedback dictates.**
