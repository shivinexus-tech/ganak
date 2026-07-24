---
name: hindi-devotional-language
description: >-
  Write and review Ganak user-facing Hindi for festivals, vrats, kathas, puja
  steps, verdicts, and diet guidance. Use when translating English worship
  guides, fixing Hindi copy, or when the owner reports disrespectful phrasing.
---

# Hindi devotional language (Ganak)

Read `plans/festival-vrat-voice-research.md`, `plans/hindi-devotional-language.md`, and `plans/religious-content-policy.md` first.

## Core rule

**Hindi is a devotional rewrite, not a translation.** English is the draft; Hindi must sound like a respectful household worship guide a Hindi-speaking elder would read aloud without embarrassment.

## Workflow

1. Understand the **religious action** (fast type, deity, offering, story beat). Check how Bhaskar/NBT/Drik frame the same festival in `plans/festival-vrat-voice-research.md`.
2. Fix **English** if it sounds like an essay (*May care flow both ways*, *ethical partnership*) before writing Hindi.
2. Write Hindi in **plain शुद्ध हिन्दी** — avoid English calques and bureaucratic Sanskritized jargon unless it is the traditional term (e.g. संकल्प, नैवेद्य).
3. For kathas: use **named figures, scene, devotion, divine grace** — respectful throughout.
4. For puja steps: use **आदरपूर्वक, श्रद्धापूर्वक, कुल-परम्परानुसार** — not lecturing tone.
5. Run `node validation/hindi-devotional-language.cjs`, `node validation/hindi-worship-glossary.cjs`, and `node validation/devotional-voice-english.cjs` before claiming done.

## High-risk English → Hindi traps

| English | Never write | Write instead |
|---------|-------------|---------------|
| bare / barefoot | नंगा, नंगी, नंगे पाँव | बिना जूते के; शिला या वन-भूमि पर |
| meagre offering | तुच्छ भेंट | साधारण या विनम्र भेंट |
| revulsion | घृणा | विकर्षण, अरुचि |
| humiliation | अपमान | अपकार, दुर्व्यवहार |
| lighter observance | से हल्का | की अपेक्षा संक्षिप्त / सरल रूप |
| ease the fast | व्रत हल्का करना | व्रत समाप्त करना / व्रत खोलना |

## Safe uses of हल्का

OK when describing **observance type**, not ranking one festival below another:
- हल्का व्रत, हल्का भोजन, हल्के सात्त्विक व्यंजन, हल्की मालिश (अभ्यंग स्नान)

## Files that carry Hindi worship copy

- `src/data/vrat-vidhis.ts` — base guide fields
- `src/data/major-festival-guides.ts`, `durga-puja-guides.ts`, `vrat-guide-enrichments.ts`
- `src/data/regional-kathas/**` — kathas (merged last into guides)
- `src/data/navadurga-pages.ts`, `festival-meta.ts`
- `src/screens/FestivalGuideScreen.tsx`, `VratVidhiCard.tsx` labels via `VRAT_VIDHI_LABELS`

## Validation

```bash
export PATH="/opt/homebrew/bin:$PATH"
node validation/hindi-devotional-language.cjs
node validation/hindi-worship-glossary.cjs
```

## Release (owner + agents)

Before a major Hindi content deploy, follow `plans/hindi-release-checklist.md`:
- Agents: both gates above + no machine translation
- Owner: spot-check four URLs (`hartalika-teej`, `chhath`, `karva-chauth`, `diwali`) with `?lang=hi`

## Glossary

Use spellings from `plans/hindi-worship-glossary.md` for संकल्प, नैवेद्य, पारण, निर्जला, उद्यापन, and UI labels.

## No machine translation

Never paste Google Translate (or other MT) into repo Hindi. Rewrite devotionally using this skill.
