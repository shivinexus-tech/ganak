# Birth-chart-personalised Muhurat — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax.

**Goal:** A dedicated `/muhurat/personal` screen that runs the existing Muhurat finder for a chosen activity/range/place, then filters + ranks the days by the user's birth chart (opt-in), honestly and bilingually.

**Architecture:** New self-contained screen (mirrors `MedicalMuhuratScreen`) that calls the unchanged `muhuratScanRange` and a new pure overlay engine `personal-muhurat.ts`. Two sourced hard filters (Tarabala, Chandrabala) remove days; Ashtakavarga strength ranks; the Adhanadi 6-set is a soft, labelled caution. Zero edits to `muhurat.ts` or the in-review `MuhuratHub`; only additive route wiring in the shell.

**Tech Stack:** Vite + React (untyped engine modules), CommonJS validation gates (`.cjs`), reused engines `daily-windows.ts` (`taraBala`/`chandraBala`), `classical.ts` (`computeAshtakavarga`), `kundli.ts` (`computeKundli`), `panchang.ts` (`moonSidMs`/`zoneOffset`).

## Global Constraints

- Lahiri ayanamsa, mean Rahu/Ketu — never switch (copy `"lahiri"` verbatim into every engine call).
- No browser storage; birth details live only in component state / URL prefs.
- Bilingual EN/HI everywhere, following the app `lang` prop.
- Every gate must pass and be pasted; never weaken a gate to pass it.
- The Adhanadi 6-set `{1,10,16,18,22,25}` is a SOFT caution (kept + marked), never a hard cut. Only Tarabala + Chandrabala remove days.
- Phone-first (375px), no console errors, errors surface visibly in the UI.

---

### Task 1: Overlay engine `personal-muhurat.ts` + gate (TDD)

**Files:**
- Create: `src/engine/personal-muhurat.ts`
- Test: `validation/personal-muhurat.cjs`

**Interfaces:**
- Consumes: `taraBala`, `chandraBala` from `./daily-windows`; `computeAshtakavarga` from `./classical`; `computeKundli` from `./kundli`; `moonSidMs`, `zoneOffset`, `NAKSHATRAS` from `./panchang`.
- Produces:
  - `natalAnchors(place, ayanamsa, birth) → { janmaNak:0..26, janmaSign:0..11, moonBav:number[12] }`
  - `personalFit(anchors, day) → { tara, taraGood, chandraGood, special, specialCaution, specialName, moonBindu, strength, coreOk }` where `day = { rise, nak, tn }` (finder row fields).
  - `applyPersonalisation(days, anchors) → { kept, setAside, mode }` — `mode` is `"filter"` or `"annotate"`.

- [ ] **Step 1: Write failing gate** `validation/personal-muhurat.cjs` covering:
  Tarabala (same-star ⇒ tara 1 ⇒ !good); Chandrabala (birthSign 0, daySign 2, shukla ⇒ distance 3 ⇒ good); special-caution (18th-from-Janma ⇒ specialCaution true AND coreOk still true; 20th ⇒ false); Ashtakavarga (`sum(sav)===337` and `moonBav.length===12`); filter behaviour (only `!coreOk` removed; `<3` survivors ⇒ mode `"annotate"`); prove-the-guard (perturb `SPECIAL_ORD` → special anchor fails).
- [ ] **Step 2: Run gate, expect RED** — `node validation/personal-muhurat.cjs` fails (module missing).
- [ ] **Step 3: Implement `personal-muhurat.ts`** — the AVOID_TARA set `{1,3,5,7}`, `SPECIAL_ORD` map `{1,10,16,18,22,25}`→names, ordinal `((nak-janmaNak+27)%27)+1`, moonSign from `moonSidMs(rise)`, `coreOk = taraGood && chandraGood`, strength buckets from `moonBindu` (0–1,2–3,4–5,6–8 → 1..4 dots), `applyPersonalisation` partition + `<3` fallback.
- [ ] **Step 4: Run gate, expect GREEN.**
- [ ] **Step 5: Prove-the-guard** — perturb, confirm RED, restore, confirm GREEN.
- [ ] **Step 6: Commit** engine + gate.

### Task 2: Bilingual copy `personal-muhurat-ui.ts`

**Files:** Create `src/data/personal-muhurat-ui.ts` (all `{en,hi}` pairs).

**Interfaces:** Produces `PM_TITLE, PM_INTRO, PM_NATAL_HINT, PM_BIRTH_LABELS, PM_COUNT(kept,total), PM_BADGE (tara/chandra/strength), PM_SPECIAL_NAMES (6), PM_SPECIAL_CAUTION_NOTE, PM_ANNOTATE_NOTE, PM_RESULT_NOTE, PM_NO_BIRTH_PROMPT, PM_NO_SOLAR, PM_RASHIS[12], PM_NAK_HI` — exact copy written in the file, honest tone, the special caution labelled "a personal tradition, not a classical muhurta rule."

- [ ] **Step 1:** Write the file with every string EN+HI.
- [ ] **Step 2:** `node validation/parse-check.js` on it (via shell wire later) — for now `node -e "require('esbuild')"` not needed; verify no syntax error by importing in Task 3 build.
- [ ] **Step 3: Commit.**

### Task 3: `PersonalMuhuratScreen.tsx` + `personalMuhuratFromPath`

**Files:** Create `src/screens/PersonalMuhuratScreen.tsx`.

**Interfaces:**
- Consumes: `muhuratScanRange` from `../engine/muhurat`; `natalAnchors`, `applyPersonalisation`, `personalFit` from `../engine/personal-muhurat`; `PlaceInput`; `MUH_CATS` from `../data/muhurat-ui`; all copy from `../data/personal-muhurat-ui`.
- Produces: default export `PersonalMuhuratScreen({lang,C,card,place,onPlace})`; named `personalMuhuratFromPath(pathname) → {kind:"personal"}|null` for `/muhurat/personal`.

- [ ] **Step 1:** Build the screen mirroring `MedicalMuhuratScreen`: activity `<select>` (the 10 general `MUH_CATS` keys, excluding samskara), from/to dates, place `PlaceInput`; an opt-in `<details>` "Personalise with your birth star" with birth date/time/independent place; run() calls `muhuratScanRange` then, if birth confirmed, `natalAnchors` + `applyPersonalisation`; renders count line, kept-day cards with fit badge + optional special-caution chip, set-aside list, annotate-mode note, honest result note; document.title + canonical `/muhurat/personal`.
- [ ] **Step 2:** `node validation/parse-check.js src/screens/PersonalMuhuratScreen.tsx` — expect exit 0.
- [ ] **Step 3: Commit.**

### Task 4: Shell route wiring (additive only) `kundli-app.tsx`

**Files:** Modify `src/kundli-app.tsx` (imports; `personalRoute` const; `pageHeroCopy` case; `routeMetadata`/`privacyEvent`; render line; add `!personalRoute` to the daily/prashna/chart mode guards).

- [ ] **Step 1:** Add import + `const personalRoute = personalMuhuratFromPath(...)`; thread into hero, metadata, page_view; render `{personalRoute && <PersonalMuhuratScreen .../>}`; guard the three `mode===` blocks and the place-search block with `!personalRoute`.
- [ ] **Step 2:** `node validation/parse-check.js src/kundli-app.tsx` — expect exit 0 (no dup/orphan/storage).
- [ ] **Step 3: Commit.**

### Task 5: Gates + build + browser smoke

- [ ] **Step 1:** Run the full canonical gate list from AGENTS.md + `personal-muhurat.cjs` + `deep-muhurats.cjs` + `muhurat-anchors.cjs` + `samskara-muhurats.cjs` + `panchaka-windows.cjs`; paste output.
- [ ] **Step 2:** `npm run build` — expect green.
- [ ] **Step 3:** Dev server (`kundli-dev`), open `/muhurat/personal`, EN+HI at 375px: run a wedding search, turn on personalisation with a sample birth, verify count line / badges / caution chip / set-aside list / annotate fallback; read console (0 errors); screenshot.
- [ ] **Step 4: Commit** any fixes.

### Task 6: Merge, deploy, verify, close

- [ ] **Step 1:** Merge `claude/personal-muhurat` → `main`, run all gates again post-merge, push.
- [ ] **Step 2:** Verify live on `https://ganak.pages.dev/muhurat/personal` (EN/HI, 0 console errors).
- [ ] **Step 3:** Update `plans/task-log.md`, `plans/backlog.md` (mark the item), acceptance register + sheet sync; `node scripts/sync-backlog-sheet.mjs --check`.
- [ ] **Step 4:** Send owner the deep-linked live URL for sign-off (final gate). Two-agent bug bash remains before 100% closure.
