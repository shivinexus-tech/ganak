# Link /calculators from the app — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the 14-calculator catalogue reachable from inside Ganak, so `/calculators` stops being an orphan route that only someone handed the URL can find.

**Architecture:** A bilingual footer link in the shell (`src/kundli-app.tsx`), rendered on every screen. The footer already exists and renders site-wide, so one link makes the catalogue reachable from every page — including festival, calculator and medical routes — without touching primary navigation (EPIC-IA is PARKED, and restructuring nav is a separate owner decision). `validation/route-reachability.cjs` is the test: it currently fails on `/calculators` and must pass afterwards.

**Tech Stack:** Vite + React (untyped shell), plain `<a href>` navigation (the app uses real paths, not a router), CommonJS validation gates.

## Global Constraints

- Bilingual EN/HI everywhere, following the app-wide `lang` prop — never ship an English-only string.
- No browser storage; the link is a plain `<a href>`, no state.
- Semantic design tokens only — **no raw colour literals** (`design-system-primitives` fails the build on any raw hex; this is what made it red for days).
- Use `C.*` / `T.*` from the shell's existing palette and style contract; add no new values.
- Lahiri ayanamsa, mean Rahu/Ketu — untouched by this change.
- Never weaken a gate to make it pass.

## File Structure

| File | Responsibility | Change |
|---|---|---|
| `src/kundli-app.tsx` | app shell: nav, footer, route composition | Modify — add the footer link |
| `validation/route-reachability.cjs` | proves every route is reachable | No change — it is the test |

---

### Task 1: Add a bilingual footer link to the calculator catalogue

**Files:**
- Modify: `src/kundli-app.tsx` (the `<footer>` block, currently at lines 262–267)
- Test: `validation/route-reachability.cjs` (existing gate, no edit)

**Interfaces:**
- Consumes: `lang` (`"en" | "hi"`), `C.gold`, `C.muted`, `T.fLabel`, `T.s8` — all already in scope inside `KundliApp`.
- Produces: nothing importable. The observable output is an `<a href="/calculators">` in the rendered footer on every screen.

- [ ] **Step 1: Run the gate and watch it fail on /calculators**

Run:
```bash
node validation/route-reachability.cjs
```
Expected: exits 1, and the report contains the line
```
/calculators              — NOTHING (orphan)
```
This is the failing test. Do not proceed until you have seen it fail.

- [ ] **Step 2: Add the link to the footer**

In `src/kundli-app.tsx`, find the footer block:

```jsx
        {/* Footer stays accurate with or without optional telemetry endpoints. */}
        <footer style={{ textAlign: "center", color: C.muted, fontSize: T.fLabel, marginTop: T.s8, letterSpacing: ".06em" }}>
          {lang === "hi"
            ? "ॐ · गणना आपके डिवाइस पर · न खाता · शहर खोज ऑनलाइन · सेवा जुड़ने पर केवल अनाम उपयोग-घटनाएँ"
            : "ॐ · computed on your device · no account · city search online · anonymous usage events only when configured"}
        </footer>
```

Replace it with (the link sits above the existing line, keeping that copy byte-for-byte unchanged):

```jsx
        {/* Footer stays accurate with or without optional telemetry endpoints.
            The calculator catalogue is linked here so it is reachable from every screen —
            it shipped as an orphan route and validation/route-reachability.cjs now guards that. */}
        <footer style={{ textAlign: "center", color: C.muted, fontSize: T.fLabel, marginTop: T.s8, letterSpacing: ".06em" }}>
          <div style={{ marginBottom: T.s3 }}>
            <a href={`/calculators?lang=${lang}`} className="comfort-focus" style={{ color: C.gold, textDecoration: "none", borderBottom: `0.0625rem solid ${C.line}`, paddingBottom: "0.125rem" }}>
              {lang === "hi" ? "ज्योतिष कैलकुलेटर — राशि, लग्न, नक्षत्र, मांगलिक और अन्य" : "Astrology calculators — Rashi, Lagna, Nakshatra, Mangal Dosha and more"}
            </a>
          </div>
          {lang === "hi"
            ? "ॐ · गणना आपके डिवाइस पर · न खाता · शहर खोज ऑनलाइन · सेवा जुड़ने पर केवल अनाम उपयोग-घटनाएँ"
            : "ॐ · computed on your device · no account · city search online · anonymous usage events only when configured"}
        </footer>
```

Three details that matter:
- `?lang=${lang}` preserves the reader's language across the navigation — the project requires language to survive route changes.
- `className="comfort-focus"` reuses the shared focus ring, so keyboard users get the same treatment as every other control.
- Colours come from `C.gold` / `C.line`; **no raw hex** — a literal here fails `design-system-primitives`.

- [ ] **Step 3: Run the gate and watch it pass**

Run:
```bash
node validation/route-reachability.cjs
```
Expected: `/calculators` now reports `direct link in src/kundli-app.tsx`. The gate still exits 1 — but **only** for `/muhurat/medical`, which is out of scope for this plan (see "Explicitly not in scope"). Confirm `/calculators` is no longer in the orphan list.

- [ ] **Step 4: Confirm nothing else regressed**

Run:
```bash
node validation/parse-check.js src/kundli-app.tsx
```
Expected: `✓ parse-check clean: src/kundli-app.tsx`

Run:
```bash
node validation/design-system-primitives.cjs
```
Expected: `✓ design-system-primitives PASS` — this gate was red for days over three raw colour literals; do not re-break it.

Run:
```bash
npm run build
```
Expected: `✓ built in <n>s`

- [ ] **Step 5: Verify in a browser, both languages**

Start the preview with launch config `kundli-verify` (port 5199) — never a raw shell server.

Check English at `http://localhost:5199/`:
- The footer shows "Astrology calculators — Rashi, Lagna, Nakshatra, Mangal Dosha and more".
- Clicking it lands on `/calculators?lang=en` and the catalogue lists 14 calculators.

Check Hindi at `http://localhost:5199/?lang=hi`:
- The footer link reads "ज्योतिष कैलकुलेटर — राशि, लग्न, नक्षत्र, मांगलिक और अन्य".
- Clicking it lands on `/calculators?lang=hi` and the catalogue renders in Hindi.

Check reachability from a deep route — `http://localhost:5199/muhurat/medical` — the footer link must be present there too (this is the property that makes a site-wide footer the right place).

At 375px width, confirm `document.body.scrollWidth === window.innerWidth` (no horizontal overflow) and that the console has zero errors.

- [ ] **Step 6: Commit**

```bash
git add src/kundli-app.tsx
git commit -m "fix(nav): link the calculator catalogue from the site-wide footer

/calculators shipped as an orphan — 14 calculators, closed at 100%, with zero
inbound links anywhere in src/. A footer link makes it reachable from every
screen and turns route-reachability green for that route. Language is carried
through so the catalogue opens in the reader's language."
```

---

## Explicitly not in scope (surfaced, not silently parked)

1. **`/muhurat/medical` is still an orphan.** The gate will keep failing on it after this plan. It needs its own decision — link it (it is a safety-bounded tool, so placement matters) or remove it. Not folded in here because linking a medical-timing page is a product judgement, not a mechanical fix.
2. **Prominence.** A footer link guarantees *reachability*, which is what the gate measures and what the orphan bug was. It does not make the calculators *prominent*. If the owner wants real discovery — a card on Daily, or a fourth nav tab beside Daily/Prashna/Jyotish — that is an IA change and belongs to EPIC-IA, which is PARKED. Raise it; do not decide it inside this plan.
