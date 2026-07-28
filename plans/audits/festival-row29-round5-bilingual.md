# Festival row #29 — Round 5 final bilingual audit

Date: 2026-07-28

Auditor: Codex independent bilingual verification lane

Base: integrated `main` at `77bf024`

Scope: report only; no application or validation edits

## Final verdict

**PASS — no genuine remaining P0 bilingual or devotional blocker found.**

The integrated route overlay has exact 108-route coverage, all required semantic
pairs in both languages, 108 distinct English practices and 108 distinct Hindi
practices. All 31 named variants now preserve route-specific Hindi actions and
cautions. The 57-guide devotional corpus and its failure fixtures also pass.

This verdict is limited to the requested bilingual semantic/devotional scope. It
does not replace timing, artwork, responsive-browser or production-deployment
verification owned by the other Round 5 lanes.

## Overlay verification

Independent registry inspection produced:

```text
total: 108
kind full: 77
kind named-variant: 31
unique practice.en: 108
unique practice.hi: 108
duplicate EN/HI practices: 0
missing Devanagari practice: 0
verdict/practice alias failures: 0
```

The focused gate independently derived expected keys from the route registry,
rather than trusting the overlay's own list:

```text
FESTIVAL ROUTE CONTENT PASSED
(77 full routes + 24 Ekadashi + 7 Pradosh;
57 hero families; failure fixtures proven)
```

For every overlay the gate requires:

- exact route-key coverage and supported route kind;
- an existing devotional/hero family;
- bilingual identity, meaning, practice/verdict, completion, timing note and
  source boundary;
- Devanagari Hindi without detected English prose;
- no product-meta or generic English worship language;
- unique bilingual identity;
- a verdict that is the exact practice-pair alias;
- rejection of the former name-only Hindi variant template.

## Semantic-parity review

All 108 practice pairs were included in the uniqueness/Devanagari/alias scan.
The full-route families had already passed the Round 4 family sample. Round 5
re-read the repaired high-risk named variants where a mistranslation would remove
a defining practice or safety boundary:

| Variant | English action/boundary | Hindi parity result |
|---|---|---|
| Nirjala Ekadashi | Bhima katha; waterless only when medically safe; supported alternative otherwise | Pass — कथा, चिकित्सकीय सुरक्षा, निर्जल condition and alternative all retained |
| Mokshada Ekadashi | Mokshada katha; Gita chapter; ancestor rites under family guidance | Pass — कथा, गीता अध्याय and कुल-मार्गदर्शित पितृ-विधि retained |
| Shattila Ekadashi | accepted sesame use; do not impose all six practices universally | Pass — मान्य तिल use and non-universal boundary retained |
| Som Pradosh | Shiva-Parvati worship; no marriage or emotional-cure promise | Pass — worship and both rejected guarantees retained |
| Shani Pradosh | twilight Shiva worship; service/charity; reject fear and guaranteed Saturn remedies | Pass — सन्ध्या पूजा, सेवा/दान and fear/remedy boundary retained |

The remaining named variants were checked structurally for explicit Hindi
practice rows rather than fallback generation. No route uses either rejected
name-only template.

## Devotional-guide evidence

```text
HINDI DEVOTIONAL LANGUAGE PASSED
(59 source files; 57 merged guides checked)

HINDI WORSHIP GLOSSARY PASSED
(7 core terms; 6 UI labels)

DEVOTIONAL VOICE ENGLISH PASSED
(9 patterns checked)

DEVOTIONAL GUIDE QUALITY PASSED
(57 dynamically discovered bilingual guides;
7 named-route semantic profiles; failure fixtures proven)

MAJOR FESTIVAL PAGE REGRESSION PASSED
(29 reviewed pages)

DURGA PUJA PAGE REGRESSION PASSED
(6 Bengal calendar pages)
```

## Failure-fixture verification

The route-content gate proves that it rejects:

- missing exact coverage;
- generic English meaning;
- product-meta in devotional copy;
- English prose in a Hindi field;
- duplicate bilingual identity;
- the former name-only Hindi Ekadashi practice template.

The 57-guide quality gate proves that it rejects:

- a short devotional story;
- copied stories;
- missing named semantic anchors;
- named-route and global product-meta language;
- copied completion guidance.

Both fixture suites executed and passed during this audit. They are non-vacuous:
each deliberately damaged clone is asserted to produce the intended failure.

## Remaining P0 blockers

**None in the bilingual semantic/devotional scope.**

No content exception, untranslated named-variant action, generic fallback, missing
route, invalid hero family, or unproven failure fixture remains in this lane.
