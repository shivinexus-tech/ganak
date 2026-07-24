---
name: hindi-devotional-language
description: >-
  Write and review Ganak user-facing Hindi for festivals, vrats, kathas, and
  worship guides. Use when translating or drafting Hindi devotional copy, or
  when the owner reports disrespectful or vulgar Hindi phrasing.
---

# Hindi devotional language (Ganak)

Read `plans/hindi-devotional-language.md` and `plans/religious-content-policy.md` first.

## Before shipping Hindi copy

1. Never translate *bare*, *barefoot*, or *naked* with `नंगा/नंगी/नंगे`.
2. Use respectful words for offerings (`साधारण`, `विनम्र`) — not `तुच्छ`.
3. Avoid `घृणा` in kathas; use `विकर्षण` or `अरुचि`.
4. Run `node validation/hindi-devotional-language.cjs` and fix every hit.

## Quick reference

- barefoot → **बिना जूते के**
- slept on bare stone → **शिला या वन-भूमि पर शयन की**
- meagre gift → **साधारण भेंट** or **विनम्र भेंट**
