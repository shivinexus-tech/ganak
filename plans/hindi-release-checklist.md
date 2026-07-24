# Hindi release checklist — before major deploys

Use this when shipping **festival/vrat content** or any wide Hindi copy change. Record completion in `plans/task-log.md` evidence column.

## 1. Automated gates (agents — mandatory)

```bash
export PATH="/opt/homebrew/bin:$PATH"
node validation/hindi-devotional-language.cjs
node validation/hindi-worship-glossary.cjs
node validation/devotional-guide-quality.cjs
```

Paste passing output in the task-log row.

## 2. No machine translation (agents — mandatory)

- Hindi must be **authored or rewritten** using `.cursor/skills/hindi-devotional-language/SKILL.md`.
- **Do not** paste output from Google Translate, ChatGPT without the skill, or other MT tools into `src/data/**`.
- If English source changes, **rewrite Hindi** — do not run find-replace on English words in Hindi strings.

## 3. Native-speaker spot check (owner — before major release)

Open each URL on **phone width**, language **हिन्दी**, expand the full worship guide:

| Festival | URL |
|----------|-----|
| Hartalika Teej | https://ganak.pages.dev/festival/hartalika-teej?lang=hi |
| Chhath | https://ganak.pages.dev/festival/chhath?lang=hi |
| Karva Chauth | https://ganak.pages.dev/festival/karva-chauth?lang=hi |
| Diwali | https://ganak.pages.dev/festival/diwali?lang=hi |

**Owner checks:**
- [ ] No word sounds crude, insulting, or embarrassingly literal (e.g. नंगी, तुच्छ, अपमान).
- [ ] Tone feels respectful and devotional — like a household puja guide, not an essay or lecture.
- [ ] Core terms match `plans/hindi-worship-glossary.md` (संकल्प, पारण, नैवेद्य, निर्जला where relevant).
- [ ] Kathas read as proper stories, not one-line morals.

**Sign-off:** Owner replies “Hindi spot check OK” in chat or adds `Hindi release checklist signed YYYY-MM-DD` to the task-log evidence line.

## 4. When to run this checklist

- Any change touching `src/data/vrat-vidhis.ts`, `regional-kathas/**`, `major-festival-guides.ts`, `durga-puja-guides.ts`, or Hindi in festival screens.
- Before calling a P0/P1 festival content slice **done** on production.
