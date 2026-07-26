# Festival Aarti Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add full Devanagari aarti lyrics (one collapsible per aarti, deity-family
ordered) after the Puja section of each North Indian festival/vrat guide, rendering in
both the in-app Fasts & Festivals list and the standalone `/festival/...` routes.

**Architecture:** A new optional `aartis` **array** field on guide data objects, whose
entries are reusable text constants defined once in a new `src/data/aarti-texts.ts` and
referenced by guides. `VratVidhiCard` renders the array as collapsibles with one bottom
disclaimer. A new `validation/festival-aarti.cjs` gate reads the real runtime data via
`_load-app.cjs` and enforces structure + Devanagari + orthography + first-line anchors,
with a **coverage list that grows per content batch** so every commit stays green.

**Tech Stack:** React (TSX), plain-object bilingual `{en,hi}` data modules, Node CommonJS
validation gates (`.cjs`) using `validation/_load-app.cjs`.

**Spec:** `docs/superpowers/specs/2026-07-25-festival-aarti-section-design.md`
**Standard:** `plans/festival-aarti-standard.md`

## Global Constraints

- Node/npm live at `/opt/homebrew/bin` (off harness PATH). Prefix Node commands with
  `export PATH="/opt/homebrew/bin:$PATH"`. Git commands are run bare, one per call.
- Never write outside the repo. Temp files go in `.scratch/` only. Never touch
  `~/Ganak-Recovery/` or the ACTIVE hero-art files (`src/data/festival-hero-art.ts`,
  `src/components/FestivalHeroImage.tsx`, `public/festival-images/**`).
- **Reserve a task-log row before any code edit** (Task 1, Step 1).
- All user-facing text is a bilingual `{ en, hi }` object.
- Devanagari orthography follows `plans/festival-aarti-standard.md` §1 exactly:
  `ॐ` (never `ओम्`), anusvara `ं` vs chandrabindu `ँ`, single danda `।` per line,
  double danda `॥` per stanza, one sung line per text line, blank line between stanzas,
  **Devanagari only** (no Latin inside verse text).
- `aartis` is optional. Guides without it render exactly as today. Observances with no
  lamp-aarti (eclipses, Makar Sankranti, plain Ekadashi) carry none (gate allow-list).
- Reusable aarti texts are defined **once** in `aarti-texts.ts` and referenced — never
  duplicated per guide.
- The gate must be **green at every commit**: its coverage list starts at `["diwali"]`
  and each content task appends its keys.
- Sourcing: cross-validate 2–3 authentic sources per aarti (drikpanchang.com is an
  app sourcing host and a good anchor); record sources in the citations section of
  `plans/festival-aarti-standard.md`. Owner proof-reads each batch before it is Green.

## Owner-confirmed aarti sets (source of truth: spec table)

| Guide key(s) | File | Aartis (order) |
|---|---|---|
| `diwali` | vrat-vidhis inline | Ganesh · Lakshmi · Om Jai Jagdish Hare |
| `dhanteras` | major-guides `guide()` | Ganesh · Lakshmi · Om Jai Jagdish Hare |
| `ganeshChaturthi` | vrat-vidhis inline | Ganesh only |
| `janmashtami` | vrat-vidhis inline | Ganesh · Kunj Bihari · Om Jai Jagdish Hare |
| `govardhanPuja` | major-guides `guide()` | Ganesh · Shri Govardhan Maharaj · Om Jai Jagdish Hare |
| `ramNavami` | major-guides `guide()` | Ganesh · Rama · Om Jai Jagdish Hare |
| `hanumanJ` | major-guides `guide()` | Hanuman · Rama |
| `chaitraNavratri`, `sharadNavratri` | vrat-vidhis inline | Ganesh · Jai Ambe Gauri · Ambe Tu Hai Jagdambe Kaali · Om Jai Shiv Omkara |
| `mahaShivaratri`, `masikShivaratri`, `pradosh` | vrat-vidhis inline | Ganesh · Om Jai Shiv Omkara |
| `karvaChauth` | vrat-vidhis inline | Ganesh · Gauri/Karva Mata · Om Jai Shiv Omkara |
| `ahoiAshtami` | vrat-vidhis inline | Ganesh · Ahoi Mata · Om Jai Shiv Omkara |
| `hartalikaTeej` | vrat-vidhis inline | Ganesh · Om Jai Shiv Omkara · Gauri |
| `purnima` (Satyanarayan) | vrat-vidhis inline | Ganesh · Satyanarayan · Om Jai Jagdish Hare |

## File Structure

- **Create** `src/data/aarti-texts.ts` — reusable aarti text constants (each
  `{ title:{en,hi}, intro:{en,hi}, verses:string }`), grouped reusable vs single-use.
- **Modify** `src/data/vrat-vidhis.ts` — add `aarti`/`aartiDisclaimer` labels; add
  `aartis` arrays to inline guides.
- **Modify** `src/data/major-festival-guides.ts` — thread `aartis` through `guide()`;
  add `aartis` to `dhanteras`, `govardhanPuja`, `ramNavami`, `hanumanJ`.
- **Modify** `src/components/VratVidhiCard.tsx` — render the aarti list + disclaimer.
- **Create** `validation/festival-aarti.cjs` — structure/Devanagari/orthography/anchor
  + growing coverage gate.
- **Modify** `plans/task-log.md` — reserved lane row.
- **Modify** `plans/festival-aarti-standard.md` — append per-aarti source citations.

---

## Task 1: Reserve lane + section labels

**Files:**
- Modify: `plans/task-log.md` (append one row)
- Modify: `src/data/vrat-vidhis.ts:13-32` (`VRAT_VIDHI_LABELS`)

**Interfaces:**
- Produces: `VRAT_VIDHI_LABELS.aarti`, `VRAT_VIDHI_LABELS.aartiDisclaimer` — each
  `{ en:string, hi:string }`, consumed by `VratVidhiCard` (Task 3) and the gate (Task 4).

- [ ] **Step 1: Reserve the task-log row**

Append to the "Active and recent tasks" table in `plans/task-log.md`:

```
| CLAUDE-FESTIVAL-AARTI-01 | ACTIVE | Claude Code | worktree `claude/festival-aarti` | `src/data/aarti-texts.ts` (new), `src/data/vrat-vidhis.ts`, `src/data/major-festival-guides.ts`, `src/components/VratVidhiCard.tsx`, `validation/festival-aarti.cjs` (new), `plans/festival-aarti-standard.md`, own task-log row | Aarti section: Devanagari aartis after Puja on N.Indian festival/vrat guides (spec 2026-07-25). Code+gate first, content by batch, owner-verified. Isolated branch — no auto-deploy until owner approves merge. | Pre-flight 2026-07-26: clean lane; no overlap with ACTIVE hero-art files. |
```

- [ ] **Step 2: Add the two labels**

In `src/data/vrat-vidhis.ts`, inside `VRAT_VIDHI_LABELS` (before the closing `};` at
line 32), add:

```js
  aarti: { en: "Aarti (devotional lamp-song)", hi: "आरती" },
  aartiDisclaimer: {
    en: "This is a widely-sung version; your family's wording may differ.",
    hi: "यह व्यापक रूप से गाई जाने वाली आरती है; आपके परिवार की परम्परा में शब्द भिन्न हो सकते हैं।",
  },
```

- [ ] **Step 3: Parse-check the file**

Run: `export PATH="/opt/homebrew/bin:$PATH"; node -e "require('./validation/_load-app.cjs').loadApp('src/data/vrat-vidhis.ts')"`
Expected: exits 0, no error (labels object still valid).

- [ ] **Step 4: Commit**

```bash
git add plans/task-log.md src/data/vrat-vidhis.ts
git commit -m "feat(aarti): reserve lane + add aarti section labels"
```

---

## Task 2: Aarti-texts module + Diwali proof slice + factory threading

**Files:**
- Create: `src/data/aarti-texts.ts`
- Modify: `src/data/vrat-vidhis.ts` (add `aartis` to inline `diwali` object)
- Modify: `src/data/major-festival-guides.ts:7-13` (thread `aartis` through `guide()`)

**Interfaces:**
- Produces: `src/data/aarti-texts.ts` exports named constants of type
  `{ title:{en,hi}, intro:{en,hi}, verses:string }`. Task 2 defines exactly:
  `GANESH_AARTI`, `LAKSHMI_AARTI`, `OM_JAI_JAGDISH_HARE`. Later content tasks add more.
- Produces: inline `diwali.aartis = [GANESH_AARTI, LAKSHMI_AARTI, OM_JAI_JAGDISH_HARE]`.
- Consumes: nothing from later tasks.

- [ ] **Step 1: Create `src/data/aarti-texts.ts` with the three Diwali aartis**

Create the file. `verses` must hold the **full, cross-validated Devanagari text**
(2–3 sources incl. drikpanchang.com), entered per `plans/festival-aarti-standard.md`
§1 — **not placeholders** (the gate rejects Latin text and requires ≥4 Devanagari
lines). The skeletons below show the required first-line anchors and shape; replace the
`… (complete per standard)` with the complete verses before running the gate:

```ts
// Reusable and festival-specific aarti texts. Defined once, referenced by guides.
// Devanagari orthography follows plans/festival-aarti-standard.md §1.

type Bi = { en: string; hi: string };
export type Aarti = { title: Bi; intro: Bi; verses: string };

export const GANESH_AARTI: Aarti = {
  title: { en: "Ganesh Aarti — Jai Ganesh Deva", hi: "श्री गणेश जी की आरती — जय गणेश देवा" },
  intro: {
    en: "Sung first, to invoke Ganesha before the main worship.",
    hi: "मुख्य पूजा से पूर्व गणेश-आवाहन हेतु सबसे पहले गाई जाती है।",
  },
  // Anchor first line: "जय गणेश जय गणेश जय गणेश देवा"
  verses: "जय गणेश जय गणेश जय गणेश देवा।\nमाता जाकी पार्वती पिता महादेवा॥\n… (complete per standard)",
};

export const LAKSHMI_AARTI: Aarti = {
  title: { en: "Lakshmi Aarti — Om Jai Lakshmi Mata", hi: "श्री लक्ष्मी जी की आरती — ॐ जय लक्ष्मी माता" },
  intro: {
    en: "The Goddess Lakshmi's own aarti, at the heart of the Diwali puja.",
    hi: "दीपावली पूजा के केन्द्र में देवी लक्ष्मी की आरती।",
  },
  // Anchor first line: "ॐ जय लक्ष्मी माता"
  verses: "ॐ जय लक्ष्मी माता, मैया जय लक्ष्मी माता।\n… (complete per standard)",
};

export const OM_JAI_JAGDISH_HARE: Aarti = {
  title: { en: "Om Jai Jagdish Hare", hi: "ॐ जय जगदीश हरे" },
  intro: {
    en: "The universal Vishnu aarti that closes the worship.",
    hi: "पूजा का समापन करने वाली विष्णु की सर्वमान्य आरती।",
  },
  // Anchor first line: "ॐ जय जगदीश हरे"
  verses: "ॐ जय जगदीश हरे, स्वामी जय जगदीश हरे।\n… (complete per standard)",
};
```

- [ ] **Step 2: Wire Diwali's `aartis` array**

In `src/data/vrat-vidhis.ts`: add the import at the top (with the other data imports):

```js
import { GANESH_AARTI, LAKSHMI_AARTI, OM_JAI_JAGDISH_HARE } from "./aarti-texts";
```

Then on the inline `diwali` object (inside the `VRAT_VIDHI = { … }` literal), add a
property alongside its existing fields:

```js
    aartis: [GANESH_AARTI, LAKSHMI_AARTI, OM_JAI_JAGDISH_HARE],
```

- [ ] **Step 3: Thread `aartis` through the `guide()` factory**

In `src/data/major-festival-guides.ts`, in the `guide` factory object (lines 7–13),
add the optional spread next to the existing `safety` spread:

```js
  ...(x.aartis ? { aartis: x.aartis } : {}),
```

- [ ] **Step 4: Parse-check both data files load**

Run: `export PATH="/opt/homebrew/bin:$PATH"; node -e "const {loadApp}=require('./validation/_load-app.cjs'); const v=loadApp('src/data/vrat-vidhis.ts'); if(!Array.isArray(v.VRAT_VIDHI.diwali.aartis)||v.VRAT_VIDHI.diwali.aartis.length!==3) throw new Error('diwali aartis not wired'); console.log('ok');"`
Expected: prints `ok`.

- [ ] **Step 5: Commit**

```bash
git add src/data/aarti-texts.ts src/data/vrat-vidhis.ts src/data/major-festival-guides.ts
git commit -m "feat(aarti): aarti-texts module + Diwali aartis + guide() factory threading"
```

---

## Task 3: Render the aarti block in VratVidhiCard

**Files:**
- Modify: `src/components/VratVidhiCard.tsx:92` (insert after the puja `section(...)` call)

**Interfaces:**
- Consumes: `data.aartis` (array of `Aarti`), `VRAT_VIDHI_LABELS.aarti` /
  `.aartiDisclaimer` via `lbl()`, existing `txt()` helper, `T` tokens, `C` colors.
- Produces: rendered collapsibles; no exported symbol.

- [ ] **Step 1: Insert the aarti render block**

In `src/components/VratVidhiCard.tsx`, immediately after the line
`{section(lbl("puja"), pujaBody)}` (line 92) and before the
`{data.stories && …}` block, insert:

```jsx
          {data.aartis && data.aartis.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <div style={{ ...T.label, color: C.gold, marginBottom: 3 }}>{lbl("aarti")}</div>
              {data.aartis.map((a, i) => (
                <details key={i} style={{ borderTop: `1px solid ${C.line}`, paddingTop: 8, marginTop: i ? 6 : 0 }}>
                  <summary style={{ color: C.gold, fontWeight: 700, cursor: "pointer" }}>
                    {txt(a.title)}
                  </summary>
                  {a.intro && txt(a.intro) && (
                    <div style={{ fontSize: T.fMicro, color: C.muted, lineHeight: 1.5, margin: "6px 0" }}>
                      {txt(a.intro)}
                    </div>
                  )}
                  <div style={{ whiteSpace: "pre-line", fontSize: T.fSmall, color: C.ivory, lineHeight: 1.7, marginTop: 6 }}>
                    {a.verses}
                  </div>
                </details>
              ))}
              <div style={{ fontSize: T.fMicro, color: C.muted, lineHeight: 1.5, marginTop: 8 }}>
                {lbl("aartiDisclaimer")}
              </div>
            </div>
          )}
```

- [ ] **Step 2: Parse-check the component builds**

Run: `export PATH="/opt/homebrew/bin:$PATH"; npx tsc --noEmit -p tsconfig.json 2>&1 | grep -i vratvidhi || echo "no VratVidhiCard type errors"`
Expected: prints `no VratVidhiCard type errors` (or the full build passes in Task 5).

- [ ] **Step 3: Commit**

```bash
git add src/components/VratVidhiCard.tsx
git commit -m "feat(aarti): render aarti collapsibles after puja with bottom disclaimer"
```

---

## Task 4: Validation gate `validation/festival-aarti.cjs`

**Files:**
- Create: `validation/festival-aarti.cjs`

**Interfaces:**
- Consumes: `VRAT_VIDHI` from `loadApp('src/data/vrat-vidhis.ts')`.
- Produces: an executable gate; exit 0 = pass, throw = fail. Coverage constant
  `COVERED` (array of guide keys) grows in later tasks.

- [ ] **Step 1: Write the gate**

Create `validation/festival-aarti.cjs`:

```js
#!/usr/bin/env node
'use strict';

/* Festival aarti gate: every COVERED guide has a well-formed aartis array —
   Devanagari, multi-line, correct orthography, expected first-line anchors.
   Standard: plans/festival-aarti-standard.md §5. */

const assert = require('node:assert');
const { loadApp } = require('./_load-app.cjs');
const { VRAT_VIDHI } = loadApp('src/data/vrat-vidhis.ts');

// Guide keys whose aartis are implemented and must validate. GROWS per content task.
const COVERED = ['diwali'];

// Expected first-line anchor fragments per guide (order matters).
const ANCHORS = {
  diwali: ['जय गणेश', 'ॐ जय लक्ष्मी माता', 'ॐ जय जगदीश हरे'],
};

const DEVANAGARI = /[ऀ-ॿ]/;      // range ऀ–ॿ
const LATIN = /[A-Za-z]/;
const firstLine = (v) => String(v).split('\n').map((s) => s.trim()).filter(Boolean)[0] || '';
const nonEmptyLines = (v) => String(v).split('\n').map((s) => s.trim()).filter(Boolean);

for (const key of COVERED) {
  const guide = VRAT_VIDHI[key];
  assert(guide, `missing guide: ${key}`);
  const list = guide.aartis;
  assert(Array.isArray(list) && list.length > 0, `${key}: aartis must be a non-empty array`);
  const anchors = ANCHORS[key];
  assert(anchors && anchors.length === list.length, `${key}: ANCHORS length must match aartis length`);

  list.forEach((a, i) => {
    assert(a.title && a.title.en && a.title.hi, `${key}[${i}]: title {en,hi} required`);
    assert(a.intro && a.intro.en && a.intro.hi, `${key}[${i}]: intro {en,hi} required`);
    assert(typeof a.verses === 'string' && a.verses.trim(), `${key}[${i}]: verses required`);
    assert(DEVANAGARI.test(a.verses), `${key}[${i}]: verses must contain Devanagari`);
    assert(nonEmptyLines(a.verses).length >= 4, `${key}[${i}]: verses must have >= 4 lines`);
    // Orthography: reject the spelled-out ओम् (must use ॐ) and Latin inside verses.
    assert(!/ओम्/.test(a.verses), `${key}[${i}]: use ॐ, not ओम्`);
    assert(!LATIN.test(a.verses), `${key}[${i}]: verses must be Devanagari only (no Latin)`);
    assert(firstLine(a.verses).includes(anchors[i]), `${key}[${i}]: first line must start with "${anchors[i]}"`);
  });
}

console.log(`festival-aarti: OK (${COVERED.length} guide(s), ${COVERED.reduce((n, k) => n + VRAT_VIDHI[k].aartis.length, 0)} aartis)`);
```

- [ ] **Step 2: Run the gate — expect PASS on Diwali**

Run: `export PATH="/opt/homebrew/bin:$PATH"; node validation/festival-aarti.cjs`
Expected: `festival-aarti: OK (1 guide(s), 3 aartis)`

- [ ] **Step 3: Prove the guard — temporarily break Diwali's first aarti**

In `src/data/aarti-texts.ts`, temporarily change `GANESH_AARTI.verses` first line to
`"Jai Ganesh"` (Latin). Run the gate.
Run: `export PATH="/opt/homebrew/bin:$PATH"; node validation/festival-aarti.cjs`
Expected: throws `AssertionError: diwali[0]: verses must be Devanagari only (no Latin)` (or the anchor assert). Then **revert** the change and re-run — expect PASS again.

- [ ] **Step 4: Commit**

```bash
git add validation/festival-aarti.cjs
git commit -m "test(aarti): festival-aarti gate (structure + Devanagari + orthography + anchors)"
```

---

## Task 5: Browser-verify the Diwali proof slice + production build

**Files:** none (verification only — Diwali's full text was entered in Task 2)

- [ ] **Step 1: Confirm sources recorded**

Verify the three Diwali aarti sources (2–3 each) are recorded in the citations section
of `plans/festival-aarti-standard.md`. If not, add them.

- [ ] **Step 2: Re-run the gate**

Run: `export PATH="/opt/homebrew/bin:$PATH"; node validation/festival-aarti.cjs`
Expected: `festival-aarti: OK (1 guide(s), 3 aartis)`

- [ ] **Step 3: Production build**

Run: `export PATH="/opt/homebrew/bin:$PATH"; npm run build`
Expected: build succeeds, `dist/` emitted, no type errors.

- [ ] **Step 4: Browser check (dev server `kundli-dev`)**

Start the `kundli-dev` preview. Open the Diwali festival guide (in-app Fasts &
Festivals list, and the standalone `/festival/diwali` route). Verify, in EN and HI at
375px width:
- an "Aarti" section appears after the Puja steps;
- three collapsibles (Ganesh, Lakshmi, Om Jai Jagdish Hare) each expand to Devanagari;
- the English intro line shows in EN mode, Hindi intro in HI mode;
- one small muted disclaimer at the bottom of the block;
- no horizontal overflow at 375px; 0 console errors.
Capture a screenshot of the expanded Diwali aarti as proof.

- [ ] **Step 5: Commit any source citations added**

```bash
git add plans/festival-aarti-standard.md
git commit -m "docs(aarti): record Diwali aarti sources"
```
(If citations were already committed in Task 2, this step is a no-op — skip it.)

> **⛔ OWNER CHECKPOINT — HARD PAUSE.** Diwali is the proof slice and the end of the
> autonomous "frame now" scope. Do **not** start Task 6+. Present the working Diwali
> aarti (screenshot + the three texts) to the owner for proof-reading and an explicit
> go-ahead before drafting the remaining aartis. Nothing merges to `main` (production)
> until the owner approves.

---

## Task 6: Vishnu-family content batch

**Files:**
- Modify: `src/data/aarti-texts.ts` (add `KUNJ_BIHARI_AARTI`, `GOVARDHAN_MAHARAJ_AARTI`, `RAMA_AARTI`, `SATYANARAYAN_AARTI`)
- Modify: `src/data/vrat-vidhis.ts` (`aartis` on `janmashtami`, `purnima`)
- Modify: `src/data/major-festival-guides.ts` (`aartis` on `dhanteras`, `govardhanPuja`, `ramNavami`)
- Modify: `validation/festival-aarti.cjs` (extend `COVERED` + `ANCHORS`)

**Interfaces:**
- Consumes: `GANESH_AARTI`, `LAKSHMI_AARTI`, `OM_JAI_JAGDISH_HARE` (Task 2).
- Produces: four new `Aarti` constants; wired guides; extended coverage.

- [ ] **Step 1: Add the four new aarti constants**

In `src/data/aarti-texts.ts`, add (full verified Devanagari per standard; anchors shown):

- `KUNJ_BIHARI_AARTI` — anchor first line `"आरती कुंजबिहारी की"`.
- `GOVARDHAN_MAHARAJ_AARTI` — anchor first line `"श्री गोवर्धन महाराज"`.
- `RAMA_AARTI` — anchor first line `"आरती कीजै रामचन्द्र जी की"`.
- `SATYANARAYAN_AARTI` — anchor first line `"जय लक्ष्मीरमणा"`.

Each object mirrors the Task 2 shape (`title`/`intro`/`verses`, bilingual).

- [ ] **Step 2: Wire the guides**

`src/data/vrat-vidhis.ts` imports the new constants and sets:
```js
    // janmashtami:
    aartis: [GANESH_AARTI, KUNJ_BIHARI_AARTI, OM_JAI_JAGDISH_HARE],
    // purnima (Satyanarayan):
    aartis: [GANESH_AARTI, SATYANARAYAN_AARTI, OM_JAI_JAGDISH_HARE],
```
`src/data/major-festival-guides.ts` imports the new constants and, inside each
`guide({ … })` call, adds an `aartis:` key (threaded by the factory from Task 2):
```js
    // dhanteras:
    aartis: [GANESH_AARTI, LAKSHMI_AARTI, OM_JAI_JAGDISH_HARE],
    // govardhanPuja:
    aartis: [GANESH_AARTI, GOVARDHAN_MAHARAJ_AARTI, OM_JAI_JAGDISH_HARE],
    // ramNavami:
    aartis: [GANESH_AARTI, RAMA_AARTI, OM_JAI_JAGDISH_HARE],
```

- [ ] **Step 3: Extend the gate coverage**

In `validation/festival-aarti.cjs`, set:
```js
const COVERED = ['diwali', 'dhanteras', 'janmashtami', 'govardhanPuja', 'ramNavami', 'purnima'];
```
and add matching `ANCHORS` entries:
```js
  dhanteras: ['जय गणेश', 'ॐ जय लक्ष्मी माता', 'ॐ जय जगदीश हरे'],
  janmashtami: ['जय गणेश', 'आरती कुंजबिहारी की', 'ॐ जय जगदीश हरे'],
  govardhanPuja: ['जय गणेश', 'श्री गोवर्धन महाराज', 'ॐ जय जगदीश हरे'],
  ramNavami: ['जय गणेश', 'आरती कीजै रामचन्द्र जी की', 'ॐ जय जगदीश हरे'],
  purnima: ['जय गणेश', 'जय लक्ष्मीरमणा', 'ॐ जय जगदीश हरे'],
```

- [ ] **Step 4: Run the gate**

Run: `export PATH="/opt/homebrew/bin:$PATH"; node validation/festival-aarti.cjs`
Expected: `festival-aarti: OK (6 guide(s), …)`

- [ ] **Step 5: Commit**

```bash
git add src/data/aarti-texts.ts src/data/vrat-vidhis.ts src/data/major-festival-guides.ts validation/festival-aarti.cjs plans/festival-aarti-standard.md
git commit -m "content(aarti): Vishnu batch — Dhanteras, Janmashtami, Govardhan, Ram Navami, Satyanarayan"
```

> **Owner checkpoint:** owner proof-reads this batch's texts before Green.

---

## Task 7: Shiva/Shakti-family content batch

**Files:**
- Modify: `src/data/aarti-texts.ts` (add `OM_JAI_SHIV_OMKARA`, `JAI_AMBE_GAURI_AARTI`, `AMBE_TU_HAI_JAGDAMBE_AARTI`, `GAURI_AARTI`)
- Modify: `src/data/vrat-vidhis.ts` (`aartis` on `chaitraNavratri`, `sharadNavratri`, `mahaShivaratri`, `masikShivaratri`, `pradosh`, `hartalikaTeej`)
- Modify: `validation/festival-aarti.cjs` (extend `COVERED` + `ANCHORS`)

**Interfaces:**
- Consumes: `GANESH_AARTI` (Task 2).
- Produces: four new constants; wired guides; extended coverage.

- [ ] **Step 1: Add the four new constants**

In `src/data/aarti-texts.ts`, add (full verified Devanagari; anchors shown):
- `OM_JAI_SHIV_OMKARA` — anchor `"ॐ जय शिव ओंकारा"`.
- `JAI_AMBE_GAURI_AARTI` — anchor `"जय अम्बे गौरी"`.
- `AMBE_TU_HAI_JAGDAMBE_AARTI` — anchor `"अम्बे तू है जगदम्बे काली"`.
- `GAURI_AARTI` — anchor per chosen source (record in standard).

- [ ] **Step 2: Wire the guides**

`src/data/vrat-vidhis.ts` imports and sets:
```js
    // chaitraNavratri & sharadNavratri (both):
    aartis: [GANESH_AARTI, JAI_AMBE_GAURI_AARTI, AMBE_TU_HAI_JAGDAMBE_AARTI, OM_JAI_SHIV_OMKARA],
    // mahaShivaratri, masikShivaratri, pradosh (each):
    aartis: [GANESH_AARTI, OM_JAI_SHIV_OMKARA],
    // hartalikaTeej:
    aartis: [GANESH_AARTI, OM_JAI_SHIV_OMKARA, GAURI_AARTI],
```

- [ ] **Step 3: Extend the gate coverage**

Append to `COVERED`: `'chaitraNavratri','sharadNavratri','mahaShivaratri','masikShivaratri','pradosh','hartalikaTeej'`.
Add matching `ANCHORS` (Navratri = 4 entries; Shivaratri/Masik/Pradosh = 2; Hartalika = 3):
```js
  chaitraNavratri: ['जय गणेश', 'जय अम्बे गौरी', 'अम्बे तू है जगदम्बे काली', 'ॐ जय शिव ओंकारा'],
  sharadNavratri: ['जय गणेश', 'जय अम्बे गौरी', 'अम्बे तू है जगदम्बे काली', 'ॐ जय शिव ओंकारा'],
  mahaShivaratri: ['जय गणेश', 'ॐ जय शिव ओंकारा'],
  masikShivaratri: ['जय गणेश', 'ॐ जय शिव ओंकारा'],
  pradosh: ['जय गणेश', 'ॐ जय शिव ओंकारा'],
  hartalikaTeej: ['जय गणेश', 'ॐ जय शिव ओंकारा', /* GAURI anchor */ ''],
```
Set the Hartalika Gauri anchor to the chosen source's first line (non-empty).

- [ ] **Step 4: Run the gate**

Run: `export PATH="/opt/homebrew/bin:$PATH"; node validation/festival-aarti.cjs`
Expected: `festival-aarti: OK (12 guide(s), …)`

- [ ] **Step 5: Commit**

```bash
git add src/data/aarti-texts.ts src/data/vrat-vidhis.ts validation/festival-aarti.cjs plans/festival-aarti-standard.md
git commit -m "content(aarti): Shiva/Shakti batch — Navratri (2 Durga), Shivaratri set, Hartalika"
```

> **Owner checkpoint:** owner proof-reads this batch's texts before Green.

---

## Task 8: Remaining content batch (Ganesh, Hanuman, Karva Chauth, Ahoi)

**Files:**
- Modify: `src/data/aarti-texts.ts` (add `HANUMAN_AARTI`, `RAMA_AARTI` reuse, `KARVA_MATA_AARTI`, `AHOI_MATA_AARTI`)
- Modify: `src/data/vrat-vidhis.ts` (`aartis` on `ganeshChaturthi`, `karvaChauth`, `ahoiAshtami`)
- Modify: `src/data/major-festival-guides.ts` (`aartis` on `hanumanJ`)
- Modify: `validation/festival-aarti.cjs` (extend `COVERED` + `ANCHORS` to full Phase 1)

**Interfaces:**
- Consumes: `GANESH_AARTI`, `RAMA_AARTI` (Task 6), `OM_JAI_SHIV_OMKARA` (Task 7).
- Produces: `HANUMAN_AARTI`, `KARVA_MATA_AARTI`, `AHOI_MATA_AARTI`; full Phase-1 coverage.

- [ ] **Step 1: Add the new constants**

In `src/data/aarti-texts.ts`, add (full verified Devanagari; anchors shown):
- `HANUMAN_AARTI` — anchor `"आरती कीजै हनुमान लला की"`.
- `KARVA_MATA_AARTI` — anchor per chosen source (Karva Chauth Gauri/Karva Mata aarti).
- `AHOI_MATA_AARTI` — anchor per chosen source.
(Karva Mata & Ahoi Mata are regionally variable — extra source care; record sources.)

- [ ] **Step 2: Wire the guides**

`src/data/vrat-vidhis.ts`:
```js
    // ganeshChaturthi:
    aartis: [GANESH_AARTI],
    // karvaChauth:
    aartis: [GANESH_AARTI, KARVA_MATA_AARTI, OM_JAI_SHIV_OMKARA],
    // ahoiAshtami:
    aartis: [GANESH_AARTI, AHOI_MATA_AARTI, OM_JAI_SHIV_OMKARA],
```
`src/data/major-festival-guides.ts` (`hanumanJ`, via factory):
```js
    aartis: [HANUMAN_AARTI, RAMA_AARTI],
```

- [ ] **Step 3: Extend the gate coverage to full Phase 1**

Append to `COVERED`: `'ganeshChaturthi','hanumanJ','karvaChauth','ahoiAshtami'`.
Add matching `ANCHORS`:
```js
  ganeshChaturthi: ['जय गणेश'],
  hanumanJ: ['आरती कीजै हनुमान लला की', /* RAMA anchor */ 'आरती कीजै रामचन्द्र जी की'],
  karvaChauth: ['जय गणेश', /* KARVA anchor */ '', 'ॐ जय शिव ओंकारा'],
  ahoiAshtami: ['जय गणेश', /* AHOI anchor */ '', 'ॐ जय शिव ओंकारा'],
```
Set the Karva and Ahoi anchors to the chosen sources' first lines (non-empty).

- [ ] **Step 4: Run the gate — full Phase 1 covered**

Run: `export PATH="/opt/homebrew/bin:$PATH"; node validation/festival-aarti.cjs`
Expected: `festival-aarti: OK (16 guide(s), …)`

- [ ] **Step 5: Commit**

```bash
git add src/data/aarti-texts.ts src/data/vrat-vidhis.ts src/data/major-festival-guides.ts validation/festival-aarti.cjs plans/festival-aarti-standard.md
git commit -m "content(aarti): Ganesh Chaturthi, Hanuman Jayanti, Karva Chauth, Ahoi Ashtami"
```

> **Owner checkpoint:** owner proof-reads this batch's texts before Green.

---

## Task 9: Full-suite verification + browser matrix + handoff

**Files:** none (verification only)

- [ ] **Step 1: Run the full `.cjs` gate suite**

Run: `export PATH="/opt/homebrew/bin:$PATH"; for f in validation/*.cjs; do echo "== $f"; node "$f" || echo "RED: $f"; done`
Expected: `festival-aarti.cjs` GREEN; no *new* reds vs. the known pre-existing failures
recorded in `plans/task-log.md` (hero-art WIP etc.). Investigate any new red.

- [ ] **Step 2: Production build**

Run: `export PATH="/opt/homebrew/bin:$PATH"; npm run build`
Expected: build succeeds.

- [ ] **Step 3: Browser matrix**

On `kundli-dev`, spot-check one festival per family in EN + HI at 375px, in-app list
and standalone route:
- Vishnu: `/festival/ram-navami` (Ganesh · Rama · Om Jai Jagdish Hare)
- Shakti: `/festival/sharad-navratri` (4 aartis incl. both Durga)
- Shiva: a Shivaratri guide (Ganesh · Om Jai Shiv Omkara)
- Hanuman: `/festival/hanuman-jayanti` (Hanuman · Rama, no Ganesh/close)
Confirm: correct aartis, order, intro language switch, one bottom disclaimer, no 375px
overflow, 0 console errors. Screenshot each family as proof.

- [ ] **Step 4: Update the task-log row to REVIEW with evidence**

Edit the `CLAUDE-FESTIVAL-AARTI-01` row: status `REVIEW`, record gate results, build
hash, browser matrix evidence, and "Open: owner proof-read of all batches; two-agent
bug bash + production verification per row #29 closure contract."

- [ ] **Step 5: Commit**

```bash
git add plans/task-log.md
git commit -m "chore(aarti): full-suite + browser matrix verified; task-log REVIEW"
```

> **Not Green until:** owner proof-reads every batch, a second agent runs a 30-min bug
> bash, and the live production URL is owner-approved (row #29 closure contract).

---

## Self-Review Notes

- **Spec coverage:** data model (Task 2), labels (Task 1), render + bottom disclaimer
  (Task 3), deity-family sets (Tasks 2/6/7/8 match the spec table), gate incl.
  orthography + anchors + allow-list-by-omission (Task 4, grown 6/7/8), both surfaces
  (Task 3 renders in the shared `VratVidhiCard`; verified Task 5/9), standard file
  citations (Tasks 5–8). Finder UI + SEO are out of scope (separate backlog items).
- **Coverage-green invariant:** `COVERED` starts `['diwali']` and grows only as real
  content lands, so every commit passes the gate.
- **Type consistency:** `Aarti = { title:Bi, intro:Bi, verses:string }` used uniformly;
  guides reference constants by the exact exported names listed per task.
- **Placeholder note:** verse bodies are the one thing drafted at execution against
  2–3 live sources (they cannot be pre-verified in the plan); each is pinned by an
  exact first-line anchor + the gate + an owner proof-read checkpoint, which is the
  enforceable acceptance.
