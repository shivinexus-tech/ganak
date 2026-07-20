# Prashna 249 — answers to the owner's questions (2026-07-20)

Follow-up to `plans/prashna-249-findings.md` §6. Research only; no code written.
Covers: Q1 feedback (chart rendering for lay users), Q2 ayanamsa in detail,
Q3 Hindi naming, and plain-language restatements of Q4 and Q5.

---

## 0. Live bug found while testing (unrelated to the 249 work)

While driving the Prashna screen on **ganak.pages.dev** to answer Q1, the verdict
rendered:

> "It connects to your **2th** house — wealth & family — a supportive signal."

`src/screens/PrashnaScreen.tsx` lines 295, 299, 303 hardcode `${h}th`, so every
house prints "th": **1th, 2th, 3th, 21th**. The 2nd and 3rd houses are common in
these readings, so most users will see it.

Hindi is unaffected (Devanagari ordinals are formed differently there).

Not fixed — the brief said research first. One-line fix, ready on your word.
Logged as `P1-PRASHNA-ORDINAL`.

---

## 1. Q1 — "the chart is for astrologers, not day-to-day users"

### First, a correction worth knowing

The Prashna screen **already does not show a chart by default.** Verified live on
mobile (375px). What renders after "Ask now", in order:

1. **Favourable / अनुकूल** — the verdict, in words, first
2. Plain-language reasoning ("Saturn holds the deciding vote here — it is the
   sub-lord of your 10th house, the house of career & standing")
3. A timeliness line ("The question is ripe; the answer applies now")
4. Provenance ("Cast for 20/07/2026, 12:53:55 at New Delhi")
5. Three small chips: **LAGNA · NAKSHATRA · SUB-LORD**, each with a one-line gloss
6. **"Full Prashna chart"** — collapsed, opens only on tap

So the structure you're asking for is largely already built. The instinct is right,
though — there are still expert artifacts in tier 1.

### What the research says

Nielsen Norman Group's rule for progressive disclosure is a two-part test, and the
part people fail is the first:

> "You must disclose everything that users frequently need up front, so that they
> have to progress to the secondary display only on **rare** occasions."

And the failure mode named explicitly: *"confusing features appear on the initial
screen, slowing performance."* Also: stick to **two levels maximum**.

Measured benefit of getting it right: roughly **30–50% faster initial task
completion** while advanced features stay **70–90% discoverable**.

### Applying it to Prashna — what I'd change

| Element | Tier today | Recommendation | Why |
|---|---|---|---|
| Verdict word (Favourable) | 1 | **Keep tier 1** | It is the answer. Correct already. |
| Reasoning sentences | 1 | **Keep, but compress** — see below | It is *why*, in words. |
| "Question is ripe" line | 1 | Keep | Answers "does this apply now?" |
| Cast-at time/place | 1 | Keep | Provenance = trust; also proves no birth data used |
| **LAGNA / NAKSHATRA / SUB-LORD chips** | 1 | **Move to tier 2** | These are the expert artifacts. A lay user cannot act on "Krittika-3". |
| Full chart table | 2 | Keep in tier 2 | Correct already. |

**The repetition problem.** My live test produced four near-identical lines:

> It connects to your 2th house — wealth & family — a supportive signal.
> It connects to your 6th house — obstacles, illness & debt — a supportive signal.
> It connects to your 11th house — gains & fulfilment — a supportive signal.
> It connects to your 10th house — career & standing — a supportive signal.

Four sentences with one shape reads as machine output, and it buries the verdict by
pushing everything down. Suggest collapsing to one sentence naming the two strongest
and a count: *"It also supports your standing, gains and family life."*

**A genuine comprehension trap.** That 6th-house line says *"obstacles, illness &
debt — a supportive signal"*. That is correct KP (for a job question the 6th is the
house of service, so it *supports*), but a lay reader sees "illness & debt" and
"supportive" in one breath and concludes the app is broken. Where a house's plain
gloss contradicts its role in *this* question, the gloss should be question-specific
("the house of service and employment") rather than the generic list.

### The wider principle for Ganak

Your elder-friendly constraint and this are the same rule: **tier 1 answers the
question in words the user already knows; tier 2 shows the working.** A chart is
evidence, not an answer. Astrologers want the evidence and will tap for it — and
because they tap, you also learn from analytics how many of your users actually are
astrologers, which is worth knowing before Phase 2 reveals the birth chart.

---

## 2. Q2 — Ayanamsa, explained properly

### What ayanamsa is

The zodiac can be measured from two different zero points:

- **Tropical (sāyana)** — zero is the spring equinox, where the sun crosses the
  celestial equator in March.
- **Sidereal (nirayana)** — zero is fixed against the actual stars. This is what
  Vedic astrology uses.

The two drift apart because the Earth wobbles (precession), about **50 arc-seconds
per year**, roughly 1° every 72 years. Today the gap is about **24°**.

**Ayanamsa is that gap.** Every sidereal position = tropical position − ayanamsa.

### Why there is more than one

Nobody can point at a spot in the sky and prove "sidereal zero is exactly *here*."
Different schools fixed it against different reference stars. So we get:

- **Lahiri (Chitrapaksha)** — the Government of India standard, anchored near
  Spica/Chitra. What Drik Panchang uses by default, and what Ganak uses.
- **KP (Krishnamurti)** — Krishnamurti's own value, **5'48" smaller than Lahiri**
  (our engine: `kp: { offset: -0.096667 }`).

5'48" is about a tenth of a degree — roughly a fifth of the moon's width. Tiny.

### Why such a tiny number can matter here

KP divides the zodiac into **249 subs**. Average sub width is **86.7 arc-minutes**;
the narrowest (Sun's) is **40**. So a 5.8-minute shift is a small but non-trivial
slice of a sub. If the deciding point sits near a boundary, the shift pushes it into
the next sub — and the **sub-lord changes**, which can flip the verdict.

**I measured it** rather than guessing. Over 2,000,000 simulated asking-moments
(`.scratch`, method in this doc's git history):

```
KP vs Lahiri offset       : 5.80 arc-minutes (5'48")
249 subs, mean width      : 86.7 arc-minutes
narrowest sub (Sun)       : 40.0 arc-minutes
Sub-lord differs in       : 6.55% of random asking-moments
i.e. roughly 1 in         : 15 questions
```

**So: about 1 question in 15 would get a different sub-lord — and possibly a
different verdict — if we switched to true KP ayanamsa.** Not rare. Not common.

### An important nuance in our favour

For the **number method specifically**, the number *is* the sub — the 1–249 table is
a fixed division of the zodiac, identical in any sidereal frame. So the headline
input, the lagna's sub, is **ayanamsa-independent**. The 1-in-15 applies to the
things still computed from real positions: the **question-house cusp sub-lord**
(which is what our judgment engine actually reads) and the planets' star/sub lords.
So it still matters — but the method's defining step is unaffected.

### What "re-baselining the frozen parity gate" means

`validation/prashna-parity.js` locks the engine's output to **198 numeric values
across 6 charts**, currently EXACT to 5.68e-14°. That gate is what stops any agent
silently changing Prashna's maths — it has caught real regressions.

Those 198 values were computed under Lahiri. Switching ayanamsa changes nearly all
of them. The gate would fail — correctly. Someone would have to regenerate the
expected values, which means **deliberately deleting our proof that the engine still
matches its validated baseline**, then re-establishing it. Doable, but it is the one
moment where a genuine regression could slip through unnoticed, so it wants care and
a reason — not a casual toggle.

### My recommendation, unchanged but now quantified

Keep **Lahiri**, label the mode **"KP number method — Ganak conventions"**, and keep
the disclosure line the screen already shows. Reasons:

1. Consistency beats theoretical purity here. Every other number in Ganak — panchang,
   festivals, muhurat, the birth chart — is Lahiri. A Prashna on a different ayanamsa
   would silently disagree with the rest of your own app.
2. Drik Panchang, your benchmark, defaults to Lahiri.
3. The 1-in-15 divergence is honest to disclose and is *within* the range where
   sincere KP practitioners already differ from each other (KP-old vs KP-new vs
   Lahiri are all in use).
4. It costs nothing now and stays reversible later.

**But it must be disclosed, not hidden.** A KP practitioner comparing Ganak against
a KP calculator will hit a mismatch about every fifteenth question, and the label is
what turns "this app is wrong" into "this app made a stated choice."

The alternative — a true-KP fork — is legitimate and I can build it. It just costs
the parity re-baseline plus a second set of anchors, and it is not a launch blocker.

---

## 3. Q3 — Hindi naming

There is **no single settled Devanagari name** for the 1–249 method; Hindi KP
material mostly describes it rather than naming it. Terms actually in circulation:

| Term | Devanagari | Note |
|---|---|---|
| Krishnamurti Paddhati | कृष्णमूर्ति पद्धति | The system's proper Hindi name. Universal. |
| KP astrology | केपी ज्योतिष / केपी एस्ट्रोलॉजी | Common, semi-transliterated |
| Prashna chart | प्रश्न कुण्डली | **Already our screen title** |
| Sub-lord | उप नक्षत्र स्वामी | Standard; "उप-नक्षत्र" for the subdivision |
| Ruling planets | शासक ग्रह | Standard |
| The number method | *(no fixed term)* | Described as "1 से 249 के मध्य कोई संख्या" or "1–249 अंक ... विधि" |

A Hindi blog post title shows the idiomatic construction:
*"प्रश्न कुंडली के लिए 1-249 अंक जानने की सरल विधि."* So **"अंक विधि"** is
natural-sounding and readable, just not a fixed technical term.

### Options

| # | Name | For | Against |
|---|---|---|---|
| **A** | **अंक विधि (1–249)** / **Number method (1–249)** | Plainest. "अंक" = number, understood by everyone. Doesn't demand the user know what KP is. | Loses the KP attribution on the tab itself |
| **B** | **KP अंक विधि (1–249)** / **KP number method (1–249)** | Attribution + plain word. Searchable — KP practitioners recognise it instantly. | "KP" is opaque to a first-time devotional user |
| **C** | **कृष्णमूर्ति अंक विधि** / **Krishnamurti number method** | Full respect to the source; no jargon initials | Long on a phone tab |
| **D** | Ganak-branded (e.g. "गणक अंक") | Distinctive | **I'd advise against it.** Branding a traditional method as your own invention is the kind of thing this project has otherwise been careful not to do, and KP users would find it odd. |

**My recommendation was B on the tab, C in the explainer.**

### ✅ DECIDED (owner, 2026-07-20) — option C, full attribution

> **कृष्णमूर्ति पद्धति अंक विधि** — *not* "KP अंक विधि".

The initials are out. The name is spelled in full wherever the method is labelled.

**Strings to use when the mode is built:**

| Slot | Hindi | English |
|---|---|---|
| Mode toggle | कृष्णमूर्ति पद्धति अंक विधि | Krishnamurti Paddhati number method |
| With range, where space allows | कृष्णमूर्ति पद्धति अंक विधि (1–249) | Krishnamurti Paddhati number method (1–249) |
| The other mode (unchanged) | प्रश्न कुण्डली — इसी क्षण से | Prashna — ask from this moment |

Owner's reasoning is consistent with how this project has treated tradition
elsewhere: name the source properly rather than reduce it to initials. It also reads
correctly to a devotional user who has never heard of "KP".

**One layout consequence to solve at mock-up time:** the Hindi string is 27
characters and the English 38 — too long for a two-up segmented toggle at 375px,
where the existing Daily/Prashna control fits comfortably. Options are to stack the
toggle vertically, use two lines per option, or show the full name as a heading with
a shorter switch beneath it. This is a layout problem, not a naming one — the name is
settled. I will bring a solution in the mock-up rather than quietly shortening it.

---

## 4. Q4, restated plainly — "ruling planets, as a later addition?"

**What I was asking.** Full KP horary has an extra layer called **ruling planets**
(शासक ग्रह): at the moment of asking, you note five rulers — the day-lord, and the
sign/star/sub lords of the ascendant and the Moon. A strict KP astrologer uses them
two ways: as a sanity check (does the chart's answer agree with them?) and to
estimate **when** the thing will happen.

There is also a **"is the question sincere?"** test in the tradition — some
practitioners read the Moon's condition as a sign of whether the querent is genuinely
invested, and decline to judge if not.

**The question was:** ship the number method *without* these two, and add them later
as a v1.1?

**My recommendation was: defer both.**

### ✅ DECIDED (owner, 2026-07-20) — ship BOTH in v1, do not defer

Owner's reasoning: shipping the full method is how you find out which parts people
actually use and who the users are. A half-method teaches you less.

**I accept the call.** It is the right instinct for a learning launch, and the "which
features get used" question it serves is answerable — see
`plans/understanding-users-without-login.md`.

**Three consequences that follow, and must not be lost:**

1. **KSK verification scope grows.** `P0-PRASHNA-249-KSK-VERIFY` must now also cover
   the ruling-planet rules (which five, how ranked, how used for timing) and the
   Moon-sincerity doctrine (what condition disqualifies a question). These are
   precisely the areas where popular KP websites vary most, so primary-text anchoring
   matters more here, not less.
2. **Timing is the highest-risk output in the whole app.** "By mid-August" is
   falsifiable in a way "favourable" is not, and it is the sentence a user will quote
   back. It needs hedged, plain wording and a visible reminder that it is traditional
   guidance, not prediction — consistent with the Terms draft §3.2.
3. **"Refuse to answer" needs kind wording.** If the Moon test says the question isn't
   ripe, the screen must explain *why*, in warm plain language, and say what to do
   instead (wait, ask again later, ask more specifically). Written badly it reads as
   a broken button. This is a copy task, and it should be drafted at mock-up time —
   not left to the engine.

---

## 5. Q5, restated plainly — "do you want to see the screen layout first?"

**What I was asking.** Before any code, I'd produce a **mock-up** — a picture of the
proposed screen, phone-width — showing exactly what the user sees: where the number
box sits, what the helper text says, where the verdict appears, what's collapsed.
You'd review the wording and layout and say change-this/keep-that, and only then
would I build.

This is the same checkpoint your brief already requires ("first bring the owner the
proposed inputs, plain-language flow, method/convention choices and sample outputs
for confirmation").

**You can simply say "yes, show me the mock-up first" — or "skip it, build once the
other answers are settled".** Given the IA/elder-friendly concerns you raised, I'd
recommend seeing it.

---

## Decision status

| # | Question | Status |
|---|---|---|
| Q3 | Naming | ✅ **DECIDED 2026-07-20** — "कृष्णमूर्ति पद्धति अंक विधि", full name, no initials |
| Q4 | Ruling planets + Moon-sincerity | ✅ **DECIDED 2026-07-20** — ship **both in v1**; KSK verify scope grows to match |
| Q1 | Chips to tier 2, compress repeated lines, question-specific house glosses | ⏳ open (recommended) |
| Q2 | Lahiri + disclosure, or true-KP fork | ⏳ open (Lahiri recommended; 1-in-15 divergence measured) |
| Q5 | Mock-up before code | ⏳ open (recommended) |
| — | Fix the live **`2th` house** bug now | ⏳ open — it is on production right now |
