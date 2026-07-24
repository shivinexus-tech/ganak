# Hindi devotional language — owner policy (2026-07-24)

English devotional copy often uses neutral words (*bare*, *meagre*, *barefoot*, *lighter observance*) that hurried translation turns into **disrespectful or vulgar Hindi**. Ganak must read like a trusted household worship guide, not a rough calque.

## Non-negotiables

1. **Write Hindi devotionally, do not translate word-for-word.** If the English draft says *bare stone*, the Hindi should say **शिला पर शयन**, not **नंगी शिला**.
2. **Never use undressing vocabulary** (`नंगा`, `नंगी`, `नंगे`) for deities, devotees, stones, floors, or pilgrimage.
3. **Never insult offerings or devotees** (`तुच्छ भेंट`, `घृणा`, slurs).
4. **Do not dismiss an observance** with `से हल्का` — use **की अपेक्षा संक्षिप्त** or **सरल रूप**.
5. Run `node validation/hindi-devotional-language.cjs` after any Hindi user-facing edit.

## Preferred replacements

| English sense | Avoid | Prefer |
|---------------|-------|--------|
| barefoot | नंगे पाँव | बिना जूते के, जूते-रहित पाद से |
| bare stone / ground | नंगी शिला | शिला पर, कठोर शैल पर, वन-भूमि पर |
| meagre / humble offering | तुच्छ भेंट | साधारण भेंट, विनम्र भेंट |
| revulsion (priest fled) | घृणा | विकर्षण, अरुचि, दूर हो गए |
| humiliation | अपमान | अपकार, दुर्व्यवहार, दण्ड |
| lighter than another vrat | से हल्का | की अपेक्षा संक्षिप्त, सरल रूप |
| end the fast | व्रत हल्का करते | व्रत समाप्त करते, व्रत खोलते |
| struck (Chandesha story) | मार बैठे | प्रहार कर दिया, आघात किया |
| dirty (houses) | — | `गंदे घर` OK for physical untidiness only |
| light fast / light meal | — | `हल्का व्रत`, `हल्का भोजन` OK when describing observance type |

## Agent workflow (mandatory for Hindi religious copy)

1. Draft or revise **English** worship guide text first (verdict → meaning → diet → sankalpa → puja → paran).
2. **Rewrite in Hindi** as a household pujari would speak — not as a dictionary translation.
3. Read the Hindi aloud mentally: would a grandmother find any word crude or belittling?
4. Use spellings from `plans/hindi-worship-glossary.md` for संकल्प, नैवेद्य, पारण, निर्जला, उद्यापन.
5. Run `node validation/hindi-devotional-language.cjs` and `node validation/hindi-worship-glossary.cjs`.
6. For release-bound work, follow `plans/hindi-release-checklist.md` (owner spot-check on four high-traffic pages).

## Regression gate

```bash
node validation/hindi-devotional-language.cjs
node validation/hindi-worship-glossary.cjs
```

Scans `src/data`, `src/screens`, `src/components`, and all merged `VRAT_VIDHI` Hindi fields.

## Skills

Agents must load `.cursor/skills/hindi-devotional-language/SKILL.md` before editing Hindi festival or vrat content.

## Glossary and release

- Canonical worship terms: `plans/hindi-worship-glossary.md`
- Before major Hindi content deploy: `plans/hindi-release-checklist.md` (gates + owner spot-check URLs)
- Gate: `node validation/hindi-worship-glossary.cjs`

## No machine translation

Hindi religious copy is **authored in Hindi** (devotional rewrite), never pasted from Google Translate or other MT. English is the drafting language only.
