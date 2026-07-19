# Cursor task — remaining vrat vidhis (extend the existing pattern)

Read `.cursorrules` and `AGENTS.md`. This continues the vidhi feature you already
built (Ekadashi/Pradosh/Sankashti). The reusable `VratVidhiCard` + `VRAT_VIDHI`
data object already exist in `src/kundli-app.tsx` — this is mostly **data entry**
into that structure, not new engineering.

## Coordination
- **You are the SOLE writer on `src/kundli-app.tsx`.** Claude is on docs, Codex is
  on a separate backend folder — neither touches the app file. Do not commit; leave
  changes for Claude to review + gate + commit.

## Task
Add the remaining observances from `plans/vrat-vidhis.md` into the existing
`VRAT_VIDHI` object, so their vidhi cards appear the same way Ekadashi's does. From
the sourced doc, wire these (skip any that aren't in the doc):
Purnima (Satyanarayan), Amavasya, Masik Shivaratri, Maha Shivaratri, Navratri,
Karva Chauth, Ahoi Ashtami, Hartalika Teej, Sheetla Ashtami, Ganesh Chaturthi,
Janmashtami, and Chhath (4-day — represent its sequence clearly).

For each: fill vidhi / diet / sankalpa / puja / paran / udyapan with **both `en`
and `hi`** using ONLY the sourced content in `plans/vrat-vidhis.md`. Match the key
shape already used for Ekadashi. Wire each to the right observance `kind` so the
card shows when that fast is viewed.

## Hard rules
- Bilingual (en + hi) for every field — same as the existing entries.
- Content ONLY from `plans/vrat-vidhis.md` (sourced). Do not invent ritual detail.
- No `localStorage`. Reuse the existing `VratVidhiCard`; do not restyle it.
- If a vidhi's content is incomplete in the doc, add what's there and leave a
  `// TODO: source` comment rather than inventing.

## Gates (run, paste output, leave uncommitted)
```
export PATH="/opt/homebrew/bin:$PATH"
node validation/parse-check.js src/kundli-app.tsx
node validation/prashna-parity.js src/kundli-app.tsx
node validation/prashna-calc.js
node validation/muhurat-anchors.cjs
node validation/content-dates.cjs
```
Plus: dev server, confirm 2–3 of the new cards expand and render in both languages,
no console errors. Then tell the owner it's ready for review.
