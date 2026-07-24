# Hindi devotional language — owner policy (2026-07-24)

English devotional copy often uses neutral words (*bare*, *meagre*, *barefoot*) that machine translation or hurried drafting turns into **disrespectful Hindi**. Ganak must read like a trusted household worship guide, not a rough translation.

## Non-negotiables

1. **Never use undressing vocabulary** (`नंगा`, `नंगी`, `नंगे`) for deities, devotees, stones, floors, or pilgrimage — even when English says *bare* or *barefoot*.
2. **Never insult offerings or devotees** (`तुच्छ भेंट`, `घृणा`, slurs).
3. **Prefer plain respectful Hindi** over literary English calques.
4. Run `node validation/hindi-devotional-language.cjs` after any Hindi user-facing edit.

## Preferred replacements

| English sense | Avoid | Prefer |
|---------------|-------|--------|
| barefoot | नंगे पाँव | बिना जूते के, जूते-रहित पाद से |
| bare stone / ground | नंगी शिला | शिला पर, कठोर शैल पर, वन-भूमि पर |
| meagre / humble offering | तुच्छ भेंट | साधारण भेंट, विनम्र भेंट, थोड़ी सी भेंट |
| revulsion (priest fled) | घृणा | विकर्षण, अरुचि, दूर हो गए |
| dirty (houses) | — | `गंदे घर` OK for physical untidiness only |

## Regression gate

```bash
node validation/hindi-devotional-language.cjs
```

Scans `src/data`, `src/screens`, `src/components` for blocked patterns.
