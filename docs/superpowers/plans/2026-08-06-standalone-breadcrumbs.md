# Standalone-page breadcrumbs — implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Give every standalone (deep-linked) Ganak page a compact, discoverable breadcrumb that orients the user and gives one-click paths up to the home / parent, replacing reliance on the invisible clickable logo.

**Architecture:** One pure trail-builder (`breadcrumbTrail`) + one presentational component (`Breadcrumbs`) in a new module. The shell (`kundli-app.tsx`) already detects the three standalone routes (`directFestivalGuide`, `utilityRoute`, `medicalRoute`); it passes that context to `breadcrumbTrail` and renders `<Breadcrumbs>` as the first element of the content container whenever a standalone route is active. The everyday Daily/Prashna/Jyotish app is unchanged (no breadcrumb there — it is the home).

**Tech Stack:** React (function components), the app's existing token objects (`C` colors, `T` sizing), `validation/*.cjs` source/behaviour gates via `validation/_load-app.cjs`, `validation/parse-check.js`, `vite build`.

## Global Constraints

- Node/npm at `/opt/homebrew/bin`: prefix shell with `export PATH="/opt/homebrew/bin:$PATH"`.
- Work in an isolated git worktree off the latest `origin/main`; commit only scoped files; end commit messages with `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`; push per repo policy (auto-deploys `origin/main` → ganak.pages.dev).
- Write the new module **untyped, JS-style** (no local `type`/`interface` aliases, no ambient-type annotations like `Record`/`HTMLElement`, no `as const`) so `validation/parse-check.js` stays clean — see the medical-muhurat modules for the pattern.
- Bilingual: every label has an English and a Hindi form; the component takes `lang` (`'en'`/`'hi'`).
- Do not touch any parity-frozen engine region or unrelated files. `MuhuratHub`/`MedicalMuhuratScreen` are NOT modified by this plan.
- No `localStorage`/`sessionStorage`.

## Design spec (review target for design-critique)

**Placement.** First child of the content container (the centred `max-width` wrapper in `kundli-app.tsx`), rendered **above** the centred "Ganak" header, left-aligned. Shown only when `directFestivalGuide || utilityRoute || medicalRoute` is truthy; never on the everyday Daily/Prashna/Jyotish view.

**Trails (localised):**
| Route | Trail (EN) | Links |
|---|---|---|
| `/muhurat/medical` | Ganak › Muhurat › Medical timing | Ganak→`/?lang=<l>`, Muhurat→`/?lang=<l>&screen=daily#muhurat-finder`, current=no link |
| `/calculators` (catalogue / notfound) | Ganak › Calculators | Ganak→home, current=no link |
| `/calculator/<slug>` | Ganak › Calculators › <calc name> | Ganak→home, Calculators→`/calculators?lang=<l>`, current=no link |
| `/festival/<key>` | Ganak › <festival name> | Ganak→home, current=no link |

**Copy:** Ganak/गणक · Muhurat/मुहूर्त · Medical timing/चिकित्सा समय · Calculators/कैलकुलेटर · festival name from `FEST_NAME[key]` (`{en,hi}`), falling back to the key. Separator glyph `›` (U+203A).

**Visual:** single line, sans (`T.body`), ~`T.fSmall` (≈13px). Link segments `color: C.gold`, `text-decoration: none`; **current (last) segment `color: C.ink`** (dark — the legible "you are here" anchor, not a link); separators `color: C.muted`. Links get `min-height: 44px` (real tap target); small `margin-bottom` before the header.

> **Design-critique fixes applied (2026-08-06):** (1) current crumb is `C.ink`, **not** `C.muted` — `C.muted #8C8173` on cream is ≈3.5:1 (fails AA 4.5:1) and reverses the "current = clear anchor" convention; `C.ink #3B3147` is ≈10:1. (2) Links carry `min-height: 44px` (the earlier `padding: 0.375rem 0` was ≈30px, below its own stated target). (3) The "Muhurat" crumb's `#muhurat-finder` anchor is **best-effort** (the finder mounts after async compute, so on-load scroll may not reach it) — it still lands on the correct Daily screen; do not claim it lands on the finder. Add `title={label}` to the truncating current span so the full text is recoverable. Gold links (`#A86A12` ≈4.0:1) are the app's inherited brand colour used app-wide — out of scope to change here.

**States & responsive:** hover on links may deepen colour (reuse `.comfort-focus` class already in the app for focus ring). At 320px keep one line — never wrap; the **current** (last) label truncates with ellipsis (`max-width` + `overflow:hidden; text-overflow:ellipsis; white-space:nowrap`) and carries `title={label}`; ancestor links never truncate. Theme-aware: use the same token vars the surrounding header uses.

**Accessibility:** wrap in `<nav aria-label="Breadcrumb">` containing an ordered list `<ol>`/`<li>`; the current page uses `aria-current="page"` and is a `<span>`, ancestors are `<a>`.

## File structure

- Create: `src/components/Breadcrumbs.tsx` — `breadcrumbTrail(ctx, lang)` (pure) + default `Breadcrumbs` component.
- Create: `validation/breadcrumbs.cjs` — behaviour gate for `breadcrumbTrail`.
- Modify: `src/kundli-app.tsx` — import, compute `breadcrumbCtx`, render `<Breadcrumbs>` above the header on standalone routes.

---

### Task 1: `breadcrumbTrail` pure builder + gate

**Files:**
- Create: `src/components/Breadcrumbs.tsx` (function only in this task)
- Test: `validation/breadcrumbs.cjs`

**Interfaces:**
- Produces: `breadcrumbTrail(ctx, lang)` where `ctx = { medical: <bool>, utility: <utilityRoute|null>, festival: <directFestivalGuide|null> }`. `utilityRoute` is `{kind:'catalogue'} | {kind:'calculator', calculator:{en,hi,slug}} | {kind:'notfound'}`. `festival` is the guide object with `.key`. Returns an array of `{ label, href }`, localised for `lang`, where the **last** item has `href === null` (current page) and every earlier item has a non-null `href` string.

- [ ] **Step 1: Write the failing gate** — `validation/breadcrumbs.cjs`:

```js
#!/usr/bin/env node
'use strict';
const { loadApp } = require('./_load-app.cjs');
const { breadcrumbTrail } = loadApp('src/components/Breadcrumbs.tsx');
let failures = 0;
const check = (c, m) => { if (c) console.log('PASS  ' + m); else { failures++; console.error('FAIL  ' + m); } };
const labels = (t) => t.map((x) => x.label);
const lastNoLink = (t) => t.length > 0 && t[t.length - 1].href === null && t.slice(0, -1).every((x) => typeof x.href === 'string' && x.href.length > 0);

const med = breadcrumbTrail({ medical: true }, 'en');
check(JSON.stringify(labels(med)) === JSON.stringify(['Ganak', 'Muhurat', 'Medical timing']), 'medical EN trail');
check(lastNoLink(med), 'medical: only the current (last) item has no href');
check(/lang=en/.test(med[0].href) && /muhurat-finder/.test(med[1].href), 'medical ancestor hrefs (home + finder anchor)');
const medHi = breadcrumbTrail({ medical: true }, 'hi');
check(JSON.stringify(labels(medHi)) === JSON.stringify(['गणक', 'मुहूर्त', 'चिकित्सा समय']), 'medical HI trail');

const cat = breadcrumbTrail({ utility: { kind: 'catalogue' } }, 'en');
check(JSON.stringify(labels(cat)) === JSON.stringify(['Ganak', 'Calculators']), 'calculator catalogue trail');
check(lastNoLink(cat), 'catalogue: current has no href');

const detail = breadcrumbTrail({ utility: { kind: 'calculator', calculator: { en: 'Mangal Dosha', hi: 'मंगल दोष', slug: 'mangal-dosha' } } }, 'en');
check(JSON.stringify(labels(detail)) === JSON.stringify(['Ganak', 'Calculators', 'Mangal Dosha']), 'calculator detail trail');
check(/\/calculators/.test(detail[1].href), 'calculator detail: Calculators links to /calculators');

const fest = breadcrumbTrail({ festival: { key: 'diwali' } }, 'en');
check(fest.length === 2 && fest[0].label === 'Ganak' && fest[1].href === null && fest[1].label.length > 0, 'festival trail = Ganak > <name>, current no link');

if (failures) { console.error(`\nbreadcrumbs FAILED: ${failures}`); process.exit(1); }
console.log('\nBREADCRUMBS GATE PASSED');
```

- [ ] **Step 2: Run it, verify RED**

Run: `export PATH="/opt/homebrew/bin:$PATH"; node validation/breadcrumbs.cjs`
Expected: FAIL — module `src/components/Breadcrumbs.tsx` has no `breadcrumbTrail` export (load error / undefined).

- [ ] **Step 3: Write the minimal module** — `src/components/Breadcrumbs.tsx`:

```jsx
import React from "react";
import { FEST_NAME } from "../data/festival-meta";

const LBL = {
  ganak: { en: "Ganak", hi: "गणक" },
  muhurat: { en: "Muhurat", hi: "मुहूर्त" },
  medical: { en: "Medical timing", hi: "चिकित्सा समय" },
  calculators: { en: "Calculators", hi: "कैलकुलेटर" },
};
const pick = (o, lang) => (o && (lang === "hi" ? o.hi : o.en)) || "";

function breadcrumbTrail(ctx, lang) {
  const l = lang === "hi" ? "hi" : "en";
  const home = `/?lang=${l}`;
  const trail = [{ label: pick(LBL.ganak, l), href: home }];
  if (ctx && ctx.medical) {
    trail.push({ label: pick(LBL.muhurat, l), href: `/?lang=${l}&screen=daily#muhurat-finder` });
    trail.push({ label: pick(LBL.medical, l), href: null });
  } else if (ctx && ctx.utility) {
    const u = ctx.utility;
    if (u.kind === "calculator" && u.calculator) {
      trail.push({ label: pick(LBL.calculators, l), href: `/calculators?lang=${l}` });
      trail.push({ label: pick(u.calculator, l), href: null });
    } else {
      trail.push({ label: pick(LBL.calculators, l), href: null });
    }
  } else if (ctx && ctx.festival && ctx.festival.key) {
    const name = FEST_NAME[ctx.festival.key];
    trail.push({ label: (name && pick(name, l)) || ctx.festival.key, href: null });
  }
  return trail;
}

export { breadcrumbTrail };
```

- [ ] **Step 4: Run the gate, verify GREEN**

Run: `node validation/breadcrumbs.cjs`
Expected: `BREADCRUMBS GATE PASSED` (all checks PASS).

- [ ] **Step 5: Prove the guard** — temporarily change `medical: null` handling to always drop the current-no-link (e.g. give the last item an href); re-run → the `lastNoLink` checks FAIL; restore → PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/Breadcrumbs.tsx validation/breadcrumbs.cjs
git commit -m "feat(nav): breadcrumbTrail builder + gate for standalone pages"
```

---

### Task 2: `Breadcrumbs` presentational component

**Files:**
- Modify: `src/components/Breadcrumbs.tsx` (add the default component + export)

**Interfaces:**
- Consumes: `breadcrumbTrail` (Task 1).
- Produces: `export default function Breadcrumbs({ ctx, lang, C })` — renders the localized trail as an accessible `<nav><ol>`; ancestors are `<a>`, the current item is a `<span aria-current="page">` that truncates.

- [ ] **Step 1: Add the component** (append before the `export`, and update the export line):

```jsx
function Breadcrumbs({ ctx, lang, C }) {
  const trail = breadcrumbTrail(ctx, lang);
  if (trail.length < 2) return null;
  const sep = { margin: "0 0.375rem", color: C.muted };
  return (
    <nav aria-label="Breadcrumb" style={{ marginBottom: "0.5rem" }}>
      <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", alignItems: "center", flexWrap: "nowrap", fontSize: "var(--font-small)", fontFamily: "inherit", overflow: "hidden" }}>
        {trail.map((item, i) => {
          const last = i === trail.length - 1;
          return (
            <li key={i} style={{ display: "flex", alignItems: "center", minWidth: 0, flexShrink: last ? 1 : 0 }}>
              {i > 0 && <span aria-hidden="true" style={sep}>›</span>}
              {last || item.href === null
                ? <span aria-current="page" title={item.label} style={{ color: C.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", minWidth: 0 }}>{item.label}</span>
                : <a href={item.href} className="comfort-focus" style={{ color: C.gold, textDecoration: "none", whiteSpace: "nowrap", minHeight: 44, padding: "0.375rem 0", display: "inline-flex", alignItems: "center" }}>{item.label}</a>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export { breadcrumbTrail };
export default Breadcrumbs;
```

(Remove the old `export { breadcrumbTrail };` line so it is declared once.)

- [ ] **Step 2: parse-check clean**

Run: `node validation/parse-check.js src/components/Breadcrumbs.tsx`
Expected: `✓ parse-check clean` (exit 0). If ORPHAN on an ambient/type name, remove that annotation (untyped JS-style).

- [ ] **Step 3: Re-run the behaviour gate** (component addition must not break the builder)

Run: `node validation/breadcrumbs.cjs`
Expected: `BREADCRUMBS GATE PASSED`.

- [ ] **Step 4: Commit**

```bash
git add src/components/Breadcrumbs.tsx
git commit -m "feat(nav): Breadcrumbs component (accessible, truncating, bilingual)"
```

---

### Task 3: Wire into the shell

**Files:**
- Modify: `src/kundli-app.tsx` (import; render above the header on standalone routes)

**Interfaces:**
- Consumes: `Breadcrumbs` default export; the existing `directFestivalGuide`, `utilityRoute`, `medicalRoute`, `lang`, `C`.

- [ ] **Step 1: Import** — add near the other screen imports:

```jsx
import Breadcrumbs from "./components/Breadcrumbs";
```

- [ ] **Step 2: Render above the header.** Find the content container's header block:
```jsx
        <header className="rise" style={{ textAlign: "center", marginBottom: T.s8 }}>
```
Insert immediately BEFORE that `<header …>` line:

```jsx
        {(directFestivalGuide || utilityRoute || medicalRoute) && (
          <Breadcrumbs
            ctx={{ medical: !!medicalRoute, utility: utilityRoute, festival: directFestivalGuide }}
            lang={lang}
            C={C}
          />
        )}
```

- [ ] **Step 3: parse-check + build**

Run: `node validation/parse-check.js src/kundli-app.tsx && npm run build`
Expected: parse-check clean; `✓ built`.

- [ ] **Step 4: Commit**

```bash
git add src/kundli-app.tsx
git commit -m "feat(nav): render breadcrumbs on standalone pages"
```

---

### Task 4: Verify + deploy + live check

- [ ] **Step 1: Gate sweep** — `node validation/breadcrumbs.cjs`, `node validation/parse-check.js src/kundli-app.tsx`, `node validation/parse-check.js src/components/Breadcrumbs.tsx`, `npm run build`. All green.
- [ ] **Step 2: Push** to `origin/main` per repo policy (cherry-pick onto latest tip if it moved; scoped files only).
- [ ] **Step 3: Live-verify** on `https://ganakapp.com` after deploy:
  - `/muhurat/medical?lang=en` → breadcrumb `Ganak › Muhurat › Medical timing`; Ganak and Muhurat are links, current is not; clicking Ganak lands on the Daily home; 0 console errors.
  - `/calculators?lang=en` → `Ganak › Calculators`.
  - a `/calculator/<slug>` page → `Ganak › Calculators › <name>`, Calculators links to `/calculators`.
  - a festival page → `Ganak › <festival name>`.
  - `?lang=hi` shows गणक / मुहूर्त / चिकित्सा समय etc.
  - 320px: single line, no wrap, current truncates if long, no horizontal page overflow.
- [ ] **Step 4:** update `plans/task-log.md` (own row) + this plan's status; note the everyday Daily view is intentionally breadcrumb-free.
