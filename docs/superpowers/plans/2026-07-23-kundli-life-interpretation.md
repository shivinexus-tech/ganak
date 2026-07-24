# Answer-first Kundli Life Interpretation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an answer-first, six-area plain-language reading to the top of the birth-chart screen, driven only by values the engine already computes.

**Architecture:** A new content data module (`src/data/life-interpretation.ts`) holds bilingual, source-cited trait text keyed by Janma Nakshatra (27) and sign (12); `buildLifeReading()` assembles six areas from a chart's Moon nakshatra, Moon sign and Lagna sign. A dumb presentational component renders them. `ChartScreen` calls the builder and renders the card as the first result section, and the old bottom "short reading" plus its `NAK_NOTE`/`SIGN_NOTE` tables are removed (no-orphans). A validation gate enforces completeness + a safety register and proves itself non-vacuously.

**Tech Stack:** React 18 + TypeScript, Vite. Validation gates are Node `.cjs` scripts loading modules via `validation/_load-app.cjs` (esbuild bundle). No test framework — gates + `validation/parse-check.js` are the tests.

## Global Constraints

- **No engine change.** Read only `r.moon.nak`, `r.moon.sign`, `r.ascSign`. Never edit `src/engine/*` or `src/kundli-app.tsx`.
- **Bilingual everywhere.** Every user-facing string has `{ en, hi }`; UI follows the `lang` prop. Devanagari for `hi`.
- **Attribution voice (spec §B).** Copy attributes to the tradition ("Classical texts associate…"), never a second-person verdict ("You are…").
- **Sourced (spec §A).** Every entry cites *Brihat Parashara Hora Shastra* and/or *Phaladeepika* in a non-empty `source`.
- **Safety register (spec §7.2).** No health/medical claim, death/lifespan, guaranteed money, marriage prediction, fear/pressure, or body-shaming. Enforced by the gate.
- **Index order** matches `NAKSHATRAS` (0 = Ashwini … 26 = Revati) and `SIGNS` (0 = Aries/Mesha … 11 = Pisces/Meena) in `src/engine/panchang.ts`.
- **No browser storage.** (Project rule; this feature uses none.)
- **Reserve before editing `ChartScreen.tsx`** in `plans/task-log.md` (screen file).
- Prefix Node/gate/`npm` commands with `export PATH="/opt/homebrew/bin:$PATH"`. Git commands run bare.

**Note on content vs. code:** Tasks 1's data entries are the *creative deliverable* — the plan specifies the schema, sources, voice, and fully-worked exemplars, and the Task 2 gate guarantees completeness + safety. The remaining trait strings are authored during execution to match the exemplars; they are content, not pre-cannable code.

---

### Task 1: Content data module + reading builder

**Files:**
- Create: `src/data/life-interpretation.ts`
- Modify: `plans/task-log.md` (reservation row)

**Interfaces:**
- Produces:
  - `NAKSHATRA_TRAITS: { nature: {en,hi}; strengths: {en,hi}; source: string; status: "sourced"|"owner-verified" }[]` (length 27)
  - `SIGN_TRAITS: { mind: {en,hi}; relating: {en,hi}; work: {en,hi}; outward: {en,hi}; source: string; status: "sourced"|"owner-verified" }[]` (length 12)
  - `buildLifeReading({ nak, moonSign, ascSign }): { areaKey; label:{en,hi}; text:{en,hi}; source; status }[]` — 6 areas in order `nature, mind, strengths, relating, work, outward`.

- [ ] **Step 1: Reserve files in the task log.** Add this row under "Active and recent tasks" in `plans/task-log.md`:

```
| KUNDLI-INTERP-01 | IN PROGRESS | Claude Code | `claude/kundli-life-interpretation` | `src/data/life-interpretation.ts` (new), `src/components/LifeInterpretationCard.tsx` (new), `validation/life-interpretation-copy.cjs` (new), `src/screens/ChartScreen.tsx` | Answer-first six-area life reading on the Chart screen; spec `docs/superpowers/specs/2026-07-23-kundli-life-interpretation-design.md` | No engine change. Reserved by owner instruction 2026-07-23. |
```

- [ ] **Step 2: Create the module skeleton with the builder and two fully-worked exemplars per table.** Write `src/data/life-interpretation.ts`:

```ts
// Answer-first life-interpretation copy for the Chart screen.
// Bilingual, sourced to Brihat Parashara Hora Shastra + Phaladeepika, written as
// ATTRIBUTION ("Classical texts associate…"), never as a second-person verdict.
// Index order matches NAKSHATRAS / SIGNS in src/engine/panchang.ts.
// Supersedes the old NAK_NOTE / SIGN_NOTE one-liners in ChartScreen.

type Bi = { en: string; hi: string };
type Status = "sourced" | "owner-verified";
export type NakTrait = { nature: Bi; strengths: Bi; source: string; status: Status };
export type SignTrait = { mind: Bi; relating: Bi; work: Bi; outward: Bi; source: string; status: Status };

const SRC = "Brihat Parashara Hora Shastra; Phaladeepika";

// 27 entries, index 0 = Ashwini … 26 = Revati.
export const NAKSHATRA_TRAITS: NakTrait[] = [
  { // 0 Ashwini
    nature: {
      en: "Classical texts link Ashwini to the Ashwini Kumaras, the divine physicians — a swift, pioneering star. Those born under it are described as quick to begin, eager to help, and restless until in motion.",
      hi: "शास्त्र अश्विनी को अश्विनी कुमारों — देव-वैद्यों — से जोड़ते हैं; यह तीव्र, अग्रणी नक्षत्र है। इसमें जन्मे व्यक्ति शीघ्र आरम्भ करने वाले, सहायता को तत्पर और गति में रहने तक बेचैन कहे गए हैं।",
    },
    strengths: {
      en: "The tradition associates Ashwini with initiative, a healer's instinct, and a gift for fresh starts and swift rescue.",
      hi: "परम्परा अश्विनी को पहल-शक्ति, उपचार की सहज प्रवृत्ति और नए आरम्भ व त्वरित सहायता की क्षमता से जोड़ती है।",
    },
    source: SRC, status: "sourced",
  },
  { // 1 Bharani
    nature: {
      en: "Classical texts place Bharani under Yama, lord of restraint and passage, ruled by Venus — a star of intense creative force held in discipline. Those born under it are described as strong-willed, enduring, and able to carry heavy responsibility.",
      hi: "शास्त्र भरणी को यम — संयम व संक्रमण के स्वामी — के अधीन और शुक्र द्वारा शासित बताते हैं; यह अनुशासन में बँधी प्रबल सृजन-शक्ति का नक्षत्र है। इसमें जन्मे व्यक्ति दृढ़-इच्छाशक्ति, सहनशील और भारी उत्तरदायित्व वहन करने में सक्षम कहे गए हैं।",
    },
    strengths: {
      en: "The tradition associates Bharani with creative power, moral resolve, and the capacity to see difficult things through to completion.",
      hi: "परम्परा भरणी को सृजन-शक्ति, नैतिक संकल्प और कठिन कार्यों को पूर्ण करने की क्षमता से जोड़ती है।",
    },
    source: SRC, status: "sourced",
  },
  // AUTHOR the remaining 25 entries here — indices 2 (Krittika) … 26 (Revati), in
  // strict index order — matching the exemplar voice/length (3–4 lines). Seed
  // material: expand each existing ChartScreen NAK_NOTE line into `nature`, add a
  // `strengths` line. Both langs, cite SRC. Do NOT reorder; index = nakshatra.
];

// 12 entries, index 0 = Aries/Mesha … 11 = Pisces/Meena.
// mind/relating/work are read at the Moon sign; outward at the Lagna sign — so a
// sign as the Moon and the same sign rising get DIFFERENT copy.
export const SIGN_TRAITS: SignTrait[] = [
  { // 0 Aries / Mesha
    mind: {
      en: "With the Moon in Mesha, classical texts describe a quick, courageous mind — decisive, direct, happiest when acting on an impulse rather than sitting with it.",
      hi: "मेष में चन्द्र होने पर शास्त्र तीव्र, साहसी मन का वर्णन करते हैं — निर्णायक, स्पष्ट, जो सोचने से अधिक तुरन्त कर्म में प्रसन्न रहता है।",
    },
    relating: {
      en: "In relationships the tradition associates Mesha with warmth and frankness — loyal and protective, quick to spark and quick to forgive.",
      hi: "सम्बन्धों में परम्परा मेष को ऊष्मा व स्पष्टवादिता से जोड़ती है — निष्ठावान व रक्षक, शीघ्र उत्तेजित और शीघ्र क्षमाशील।",
    },
    work: {
      en: "Classical texts lean Mesha toward pioneering, leading, and physically energetic work — starting ventures more than maintaining them.",
      hi: "शास्त्र मेष को अग्रणी, नेतृत्वकारी और शारीरिक रूप से ऊर्जावान कार्य की ओर झुकाते हैं — कार्य आरम्भ करने में, बनाए रखने से अधिक।",
    },
    outward: {
      en: "With Mesha rising, the tradition describes a direct, energetic first impression — others tend to meet a confident, forthright presence.",
      hi: "मेष लग्न होने पर परम्परा स्पष्ट, ऊर्जावान प्रथम-छवि का वर्णन करती है — लोग प्रायः एक आत्मविश्वासी, मुखर उपस्थिति से मिलते हैं।",
    },
    source: SRC, status: "sourced",
  },
  { // 1 Taurus / Vrishabha
    mind: {
      en: "With the Moon in Vrishabha — where classical texts call it exalted — the mind is described as steady, patient and sensuous, seeking comfort, beauty and what endures.",
      hi: "वृषभ में चन्द्र होने पर — जहाँ शास्त्र उसे उच्च का कहते हैं — मन स्थिर, धैर्यवान व रसिक बताया गया है, जो सुख, सौन्दर्य और स्थायित्व की खोज करता है।",
    },
    relating: {
      en: "In relationships the tradition associates Vrishabha with loyalty, warmth and constancy — slow to give trust, steadfast once it is given.",
      hi: "सम्बन्धों में परम्परा वृषभ को निष्ठा, ऊष्मा व स्थिरता से जोड़ती है — विश्वास देने में धीमा, एक बार दे देने पर अटल।",
    },
    work: {
      en: "Classical texts lean Vrishabha toward patient, tangible and value-building work — finance, land, food, art and craft.",
      hi: "शास्त्र वृषभ को धैर्यपूर्ण, ठोस और मूल्य-निर्माण वाले कार्य की ओर झुकाते हैं — वित्त, भूमि, भोजन, कला व शिल्प।",
    },
    outward: {
      en: "With Vrishabha rising, the tradition describes a calm, grounded first impression — others tend to meet a steady, reassuring presence.",
      hi: "वृषभ लग्न होने पर परम्परा शान्त, स्थिर प्रथम-छवि का वर्णन करती है — लोग प्रायः एक स्थिर, आश्वस्त करती उपस्थिति से मिलते हैं।",
    },
    source: SRC, status: "sourced",
  },
  // AUTHOR the remaining 10 signs here — indices 2 (Gemini/Mithuna) … 11
  // (Pisces/Meena), in strict index order — matching the exemplar voice/length.
  // Seed for `outward`: the existing ChartScreen SIGN_NOTE line for that sign (it
  // was used at the ascendant). mind/relating/work authored fresh. index = sign.
];

const NAK_LABEL = { en: "Nature & temperament", hi: "स्वभाव" };
const STR_LABEL = { en: "Strengths & talents", hi: "सामर्थ्य" };
const MIND_LABEL = { en: "Mind & emotions", hi: "मन व भाव" };
const REL_LABEL = { en: "How you relate", hi: "सम्बन्ध" };
const WORK_LABEL = { en: "Work leanings", hi: "कार्य व वृत्ति" };
const OUT_LABEL = { en: "How others see you", hi: "बाह्य छवि" };

export function buildLifeReading({ nak, moonSign, ascSign }: { nak: number; moonSign: number; ascSign: number }) {
  const n = NAKSHATRA_TRAITS[nak];
  const s = SIGN_TRAITS[moonSign];
  const a = SIGN_TRAITS[ascSign];
  if (!n || !s || !a) return [];
  return [
    { areaKey: "nature", label: NAK_LABEL, text: n.nature, source: n.source, status: n.status },
    { areaKey: "mind", label: MIND_LABEL, text: s.mind, source: s.source, status: s.status },
    { areaKey: "strengths", label: STR_LABEL, text: n.strengths, source: n.source, status: n.status },
    { areaKey: "relating", label: REL_LABEL, text: s.relating, source: s.source, status: s.status },
    { areaKey: "work", label: WORK_LABEL, text: s.work, source: s.source, status: s.status },
    { areaKey: "outward", label: OUT_LABEL, text: a.outward, source: a.source, status: a.status },
  ];
}
```

- [ ] **Step 3: Author the remaining entries in strict index order** — nakshatra indices 2–26 (Krittika … Revati) and sign indices 2–11 (Gemini … Pisces) — matching the exemplars (attribution voice, 3–4 lines, both languages, `source: SRC`, `status: "sourced"`). The array position **is** the nakshatra/sign, so never reorder or skip. Expand each existing `NAK_NOTE`/`SIGN_NOTE` line as seed. Author the **high-risk fields (`relating`, `work`, `outward`) Hindi-first** — if a line resists natural Hindi it is usually an English-astrology framing; rework it.

- [ ] **Step 4: Smoke-check the builder compiles and returns six areas.** Run:

```bash
export PATH="/opt/homebrew/bin:$PATH"
node -e "const m=require('./validation/_load-app.cjs').loadApp('src/data/life-interpretation.ts'); const r=m.buildLifeReading({nak:0,moonSign:0,ascSign:3}); console.log(r.length, r.map(a=>a.areaKey).join(',')); console.log('outward from ascSign:', r[5].text.en===m.SIGN_TRAITS[3].outward.en);"
```

Expected: `6 nature,mind,strengths,relating,work,outward` then `outward from ascSign: true`.

- [ ] **Step 5: Parse-check the new module.** Run:

```bash
export PATH="/opt/homebrew/bin:$PATH"
node validation/parse-check.js src/data/life-interpretation.ts
```

Expected: `✓ parse-check clean`.

- [ ] **Step 6: Commit.**

```bash
git add src/data/life-interpretation.ts plans/task-log.md
git commit -m "feat(interp): life-interpretation content module + buildLifeReading"
```

---

### Task 2: Validation gate (completeness + safety, non-vacuous)

**Files:**
- Create: `validation/life-interpretation-copy.cjs`

**Interfaces:**
- Consumes: `NAKSHATRA_TRAITS`, `SIGN_TRAITS`, `buildLifeReading` from Task 1.

- [ ] **Step 1: Write the gate.** Create `validation/life-interpretation-copy.cjs`:

```js
#!/usr/bin/env node
// Guards src/data/life-interpretation.ts: completeness, a safety register, and
// buildLifeReading behaviour. Includes non-vacuous self-tests so the safety guard
// is proven to actually bite (AGENTS.md: prove guards non-vacuously).
'use strict';
const { loadApp } = require('./_load-app.cjs');
const { NAKSHATRA_TRAITS, SIGN_TRAITS, buildLifeReading } = loadApp('src/data/life-interpretation.ts');

const LANGS = ['en', 'hi'];
const fails = [];
const bi = (where, o) => {
  if (!o || typeof o !== 'object') return fails.push(`${where}: missing`);
  for (const l of LANGS) if (!o[l] || !String(o[l]).trim()) fails.push(`${where}.${l}: empty`);
};

// 1. Completeness / structure
if (!Array.isArray(NAKSHATRA_TRAITS) || NAKSHATRA_TRAITS.length !== 27)
  fails.push(`NAKSHATRA_TRAITS must have 27 entries, has ${NAKSHATRA_TRAITS && NAKSHATRA_TRAITS.length}`);
if (!Array.isArray(SIGN_TRAITS) || SIGN_TRAITS.length !== 12)
  fails.push(`SIGN_TRAITS must have 12 entries, has ${SIGN_TRAITS && SIGN_TRAITS.length}`);
(NAKSHATRA_TRAITS || []).forEach((e, i) => {
  bi(`nak[${i}].nature`, e.nature); bi(`nak[${i}].strengths`, e.strengths);
  if (!e.source || !e.source.trim()) fails.push(`nak[${i}].source: empty`);
  if (e.status !== 'sourced' && e.status !== 'owner-verified') fails.push(`nak[${i}].status invalid`);
});
(SIGN_TRAITS || []).forEach((e, i) => {
  for (const f of ['mind', 'relating', 'work', 'outward']) bi(`sign[${i}].${f}`, e[f]);
  if (!e.source || !e.source.trim()) fails.push(`sign[${i}].source: empty`);
  if (e.status !== 'sourced' && e.status !== 'owner-verified') fails.push(`sign[${i}].status invalid`);
});

// 2. Safety register — targets CLAIMS about the person, not archetypal vocabulary.
// Mythic "healer/healing" (Ashwini) and "abundance/wealth" (Dhanishta) as symbolism
// are allowed; predictive / guaranteed / afflictive constructions are not.
const BANNED = [
  { name: 'health/medical', re: /\b(diabet|cancer|tumou?r|asthma|arthrit|infertil|miscarriage|depress(?:ion|ive)|schizophreni|chronic (?:illness|disease)|diagnos|you will (?:fall ill|get sick)|prone to (?:illness|disease))/i },
  { name: 'death/lifespan', re: /\b(death|dying|premature (?:death|end)|life ?span|longevity|short[- ]lived|early demise|how long (?:you|they) (?:will )?live)\b/i },
  { name: 'guaranteed money', re: /\b(guarantee\w*|assured (?:wealth|riches)|will (?:surely|certainly|definitely) (?:be|become) (?:rich|wealthy)|you will (?:be|become) (?:rich|wealthy)|destined to (?:be|become) (?:rich|wealthy))\b/i },
  { name: 'marriage prediction', re: /\b(will (?:marry|divorce)|marriage (?:will|is destined|is delayed|is denied)|denied marriage|delayed marriage|two marriages|widow(?:hood)?|your spouse will)\b/i },
  { name: 'fear/pressure', re: /\b(unless you (?:perform|do|wear|remedy)|beware|doomed|cursed?|calamity will|misfortune will)\b/i },
  { name: 'body-shaming', re: /\b(ugly|unattractive|obese|overweight|too (?:fat|thin)|blemished skin|dark[- ]skinned as (?:inferior|unlucky)|fair[- ]skinned as (?:superior|better))\b/i },
];
const scan = (where, o) => { if (!o) return; for (const l of LANGS) { const s = String(o[l] || ''); for (const b of BANNED) if (b.re.test(s)) fails.push(`${where}.${l}: ${b.name} — "${s.slice(0, 60)}"`); } };
(NAKSHATRA_TRAITS || []).forEach((e, i) => { scan(`nak[${i}].nature`, e.nature); scan(`nak[${i}].strengths`, e.strengths); });
(SIGN_TRAITS || []).forEach((e, i) => { for (const f of ['mind', 'relating', 'work', 'outward']) scan(`sign[${i}].${f}`, e[f]); });

// 3. buildLifeReading behaviour
const sample = buildLifeReading({ nak: 0, moonSign: 0, ascSign: 3 });
if (!Array.isArray(sample) || sample.length !== 6) fails.push(`buildLifeReading must return 6 areas, got ${sample && sample.length}`);
else {
  if (sample.map((a) => a.areaKey).join(',') !== 'nature,mind,strengths,relating,work,outward') fails.push('buildLifeReading area order wrong');
  if (SIGN_TRAITS[3] && sample[5].text.en !== SIGN_TRAITS[3].outward.en) fails.push('outward not read from ascSign');
}

// 4. Non-vacuous self-tests
const mustMatch = ['you will suffer from diabetes', 'indicates a short life', 'you will surely become rich', 'your marriage will fail', 'misfortune will follow unless you wear a gem', 'you are ugly and overweight'];
const mustNot = ['healing instincts and a gift for fresh starts', 'the tradition links this star to abundance and music', 'diplomatic, drawn to partnership and fairness'];
for (const s of mustMatch) if (!BANNED.some((b) => b.re.test(s))) fails.push(`SELFTEST: banned string slipped through: "${s}"`);
for (const s of mustNot) { const h = BANNED.find((b) => b.re.test(s)); if (h) fails.push(`SELFTEST: good string wrongly flagged (${h.name}): "${s}"`); }

if (fails.length) {
  console.error(`✗ life-interpretation-copy: ${fails.length} issue(s):`);
  for (const f of fails.slice(0, 40)) console.error('   ' + f);
  process.exit(1);
}
console.log('✓ life-interpretation-copy PASSED — 27 nakshatra + 12 sign entries complete & safe; buildLifeReading OK; guard non-vacuous');
```

- [ ] **Step 2: Run the gate — expect PASS on the complete Task 1 data.**

```bash
export PATH="/opt/homebrew/bin:$PATH"
node validation/life-interpretation-copy.cjs
```

Expected: `✓ life-interpretation-copy PASSED …`. If it fails on a real entry, fix the entry (not the gate).

- [ ] **Step 3: Prove the guard bites (temporary fault-injection, reverted).** Temporarily change one entry to include `"you will suffer from diabetes"`, run the gate, confirm it exits non-zero with a `health/medical` failure, then revert:

```bash
export PATH="/opt/homebrew/bin:$PATH"
node validation/life-interpretation-copy.cjs; echo "exit=$?"
git checkout src/data/life-interpretation.ts
```

Expected: a `health/medical` failure line and `exit=1` before revert. (The permanent self-tests also assert this every run.)

- [ ] **Step 4: Commit.**

```bash
git add validation/life-interpretation-copy.cjs
git commit -m "test(interp): completeness + safety-register gate with non-vacuous self-tests"
```

---

### Task 3: Presentational card component

**Files:**
- Create: `src/components/LifeInterpretationCard.tsx`

**Interfaces:**
- Consumes: the `buildLifeReading(...)` return shape from Task 1.
- Produces: `default export LifeInterpretationCard({ reading, lang, C, card })` — renders nothing when `reading` is empty.

- [ ] **Step 1: Write the component.** Create `src/components/LifeInterpretationCard.tsx`:

```tsx
// Answer-first life reading card. Dumb/presentational: it renders whatever
// buildLifeReading() produced. No chart logic here.
import React from "react";

export default function LifeInterpretationCard({ reading, lang, C, card }) {
  if (!reading || !reading.length) return null;
  const L = lang === "hi" ? "hi" : "en";
  return (
    <div className="rise" style={{ ...card, padding: "22px 24px" }}>
      {reading.map((area) => (
        <div key={area.areaKey} style={{ marginBottom: 16 }}>
          <div style={{ fontFamily: "Eczar, serif", color: C.gold, fontSize: 13.5, letterSpacing: 0.2, marginBottom: 4 }}>
            {area.label[L]}
          </div>
          <p style={{ margin: 0, fontSize: 15.5, lineHeight: 1.7 }}>{area.text[L]}</p>
        </div>
      ))}
      <p style={{ margin: "6px 0 0", color: C.muted, fontSize: 13, lineHeight: 1.6 }}>
        {L === "hi"
          ? "परम्परा के भाव में — चिंतन और जिज्ञासा हेतु; किसी योग्य ज्योतिषी के परामर्श का विकल्प नहीं।"
          : "Offered in the spirit of the tradition, for reflection and curiosity — not a substitute for your own judgment or a qualified jyotishi's reading."}
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Parse-check the component.**

```bash
export PATH="/opt/homebrew/bin:$PATH"
node validation/parse-check.js src/components/LifeInterpretationCard.tsx
```

Expected: `✓ parse-check clean`.

- [ ] **Step 3: Commit.**

```bash
git add src/components/LifeInterpretationCard.tsx
git commit -m "feat(interp): LifeInterpretationCard presentational component"
```

---

### Task 4: Integrate into ChartScreen (+ no-orphans cleanup)

**Files:**
- Modify: `src/screens/ChartScreen.tsx` (imports ~20; remove `NAK_NOTE`/`SIGN_NOTE` ~22,24; nav array ~184; insert after Birth-summary strip ~307; remove old reading ~883–898)

**Interfaces:**
- Consumes: `LifeInterpretationCard` (Task 3), `buildLifeReading` (Task 1).

- [ ] **Step 1: Add imports.** After the existing `import { SIGNS, NAKSHATRAS, … } from "../engine/panchang";` line, add:

```tsx
import LifeInterpretationCard from "../components/LifeInterpretationCard";
import { buildLifeReading } from "../data/life-interpretation";
```

- [ ] **Step 2: Remove the superseded tables.** Delete the `const NAK_NOTE = [...]` line and the `const SIGN_NOTE = [...]` line (the two long one-liner arrays near the top). Leave `DASHA_NOTE` untouched.

- [ ] **Step 3: Move the "Reading" nav chip to the front** so nav order matches the new page order. In the nav array, remove the trailing `["#reading", "Reading"]` and make it the first element:

```tsx
{[["#reading", "Reading"], ["#chart", "Kundli"], ["#yogas", "Yogas"], ["#planets", "Grahas"], ["#kp", "KP sub-lords"], ["#ksig", "KP significators"], ["#match", "Matching"], ["#karakas", "Karakas"], ["#shadbala", "Shadbala"], ["#special", "Special"], ["#chalit", "Bhava Chalit"], ["#av", "Ashtakavarga"], ["#arudha", "Arudha"], ["#rectify", "Rectify"], ["#bnn", "BNN"], ["#bhrigu", "Bhrigu"], ["#dasha", "Dasha"]].map(([href, label]) => (
```

- [ ] **Step 4: Insert the card as the first result section.** Immediately after the Birth-summary grid closes (the `</div>` before the `{/* chart */}` comment) and before `<Eyebrow id="chart" …/>`, insert:

```tsx
            {/* answer-first reading */}
            <Eyebrow deva="फलादेश" en="Your reading" id="reading" />
            <LifeInterpretationCard C={C} card={card} lang={lang}
              reading={buildLifeReading({ nak: r.moon.nak, moonSign: r.moon.sign, ascSign: r.ascSign })} />

```

- [ ] **Step 5: Remove the old bottom reading section.** Delete the block from `{/* reading */}` / `<Eyebrow id="reading" deva="फलादेश" en="A short reading" />` through its closing `</div>` (the paragraph card ending with the "Offered in the spirit of the tradition…" note). This removes the last uses of `NAK_NOTE`/`SIGN_NOTE`.

- [ ] **Step 6: Verify no orphans.** Run:

```bash
grep -n "NAK_NOTE\|SIGN_NOTE\|A short reading" src/screens/ChartScreen.tsx
grep -rn "NAK_NOTE\|SIGN_NOTE" src/
```

Expected: **no output** from both (zero remaining references anywhere).

- [ ] **Step 7: Parse-check + build.**

```bash
export PATH="/opt/homebrew/bin:$PATH"
node validation/parse-check.js src/screens/ChartScreen.tsx
npm run build
```

Expected: `✓ parse-check clean` and a successful `vite build`.

- [ ] **Step 8: Commit.**

```bash
git add src/screens/ChartScreen.tsx
git commit -m "feat(interp): render life reading first on Chart; drop old bottom reading (no orphans)"
```

---

### Task 5: Full regression, browser smoke, owner-review handoff

**Files:**
- Create: `plans/kundli-interpretation-review.md` (owner review checklist)

- [ ] **Step 1: Run the full gate suite + build.**

```bash
export PATH="/opt/homebrew/bin:$PATH"
node validation/life-interpretation-copy.cjs
node validation/parse-check.js src/screens/ChartScreen.tsx
node validation/prashna-parity.js src/screens/PrashnaScreen.tsx
node validation/prashna-calc.js src/screens/PrashnaScreen.tsx
node validation/muhurat-anchors.cjs
node validation/content-dates.cjs
npm run build
```

Expected: every gate passes and the build succeeds. (Engine gates are unaffected — no engine change — but run them to prove it.)

- [ ] **Step 2: Browser smoke, both languages (temporary un-hide, reverted).** The Chart tab is hidden in production. To view the card, temporarily re-enable it locally: in `src/kundli-app.tsx`, add `"chart"` to the accepted `mode` values and add `["chart", …]` back to the tab list; start the dev server (Browser pane, `kundli-dev`); enter a birth chart; confirm the "Your reading" card renders six areas as the first result section, in both `en` and `hi`; screenshot each. Then revert the local shell change:

```bash
git checkout src/kundli-app.tsx
```

Expected: card shows Nature, Mind, Strengths, How you relate, Work leanings, How others see you — correct for the entered nakshatra/sign/lagna, both languages, 0 console errors. (This local change is **never committed**.)

- [ ] **Step 3: Write the owner-review checklist.** Create `plans/kundli-interpretation-review.md` listing the high-risk fields for owner sign-off: for each of the 12 signs, the `relating`, `work` and `outward` en+hi strings, with a checkbox to flip `status` to `owner-verified`. Note that low-risk fields (27 nakshatra nature/strengths, 12 sign mind) ride on the gate.

- [ ] **Step 4: Update the task log to DONE** with gate evidence, then commit.

```bash
git add plans/kundli-interpretation-review.md plans/task-log.md
git commit -m "docs(interp): owner high-risk review checklist; mark KUNDLI-INTERP-01 done"
```

- [ ] **Step 5: Push the branch.**

```bash
git push origin claude/kundli-life-interpretation
```

---

## Rollout note

Ships behind the hidden Chart tab, so green gates = safe to merge but **not** user-visible. The Phase-2 chart reveal is the go-live gate; the owner reviews the high-risk fields (Task 5 Step 3) before that reveal and flips their `status` to `owner-verified`.
