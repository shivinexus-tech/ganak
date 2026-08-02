# PRD — Aarti Phase-2 Breadth + Multi-Language (Marathi / Bengali / Gujarati)

**Owner scope 2026-08-01.** Builds on shipped Phase 1 (14 Hindi aartis, 16 festivals).
Backlog: `P2-FESTIVAL-AARTI-BREADTH`, `P2-FESTIVAL-AARTI-FINDER`, `P2-FESTIVAL-AARTI-SEO`,
`INFRA-SPA-PRERENDER`. Priority list: `plans/aarti-phase2-priority.md`. Content standard:
`plans/festival-aarti-standard.md`.

---

## Problem Statement

Ganak's 14 aartis are **Hindi (Devanagari) only** and live inline inside festival pages.
Regional Hindu communities sing **different aartis in their own languages** — Maharashtrians
open Ganpati worship with *Sukhkarta Dukhharta* (Marathi), Bengalis sing their own Durga/Kali
aartis (Bengali script), Gujaratis have their own aarti tradition. Ganak serves **none** of
them, and offers no way to read a familiar aarti in one's own script. Competitors already do:
DrikPanchang carries ~81 aartis with Hindi + English + a separate Marathi collection; Sri
Mandir personalizes by deity with wide language reach. Result: we miss the regional devotee
*and* the diaspora reader, and stay invisible in regional-language search.

## Owner decisions (2026-08-01)

1. **Breadth:** add the ~20 highest-search aartis (`plans/aarti-phase2-priority.md`), by demand.
2. **Languages:** add **Marathi, Bengali, Gujarati** — **Both** native region aartis *and*
   transliterated pan-Indian ones.
3. **Language UX:** a **per-aarti script toggle**, independent of the app's EN/HI setting.
4. **Sourcing bar:** every aarti **cross-checked against ≥5 authentic sources** (DrikPanchang,
   Sri Mandir, reputable news/lyric sites, + a native-language source for regional scripts).
5. **Reach all** audiences (diaspora + urban-India); learn, then pivot. **Audio deprioritised.**

## Goals (measurable)

1. Grow distinct aartis **14 → ~35–40** (Phase-2 priority tiers), demand-ranked.
2. Ship **3 new languages** (mr, bn, gu) selectable per-aarti, covering native + transliterated.
3. **100% of shipped aartis carry ≥5 recorded sources**, ≥1 native-language source per non-Hindi
   script; discrepancies noted.
4. Every aarti reachable at a **standalone URL** (via `P2-FESTIVAL-AARTI-FINDER`) so regional
   content is linkable and search-discoverable.
5. **Leading metric target:** ≥15% of aarti sessions use a non-Hindi script within 30 days of GA
   (signal that the regional bet is real). Reassess and pivot on the data.

## Non-Goals (and why)

1. **Translating the whole app UI** into mr/bn/gu — only aarti *content* is multilingual; app
   chrome stays EN/HI. (Huge effort, not needed for the content win.)
2. **Audio / sing-along** — owner-deprioritised for now. (Licensing/recording cost.)
3. **Machine-transliterated text shipped unverified** — the 5-source accuracy bar forbids it.
4. **Tamil / Telugu / Kannada / Odia / Punjabi** this version — later, once the 3-language
   pattern proves out.
5. **Online puja / chadhava / priest services** — Sri Mandir's ops-heavy lane; out of scope.

## User Stories

- *As a Maharashtrian devotee,* I want *Sukhkarta Dukhharta* in Marathi so I can open Ganpati
  worship the way my family does.
- *As a Bengali devotee,* I want the Durga and Kali aartis in **Bengali script** so I can sing
  them correctly during Puja.
- *As a Gujarati devotee,* I want the aarti in **Gujarati script** rather than only Devanagari.
- *As a diaspora devotee who reads little Devanagari,* I want a familiar aarti in a script (or
  Roman) I can follow.
- *As any user,* I want to switch **one aarti's** language without changing the whole app, and
  have it remember my choice.
- *As a devotee unsure of wording,* I want confidence the text is right — cross-checked, with a
  "your family's wording may differ" note for genuine variants.
- *As the content owner,* I want every aarti verifiably cross-checked against ≥5 authentic
  sources before it goes live.

## Requirements

### P0 — Must-have (the viable core: infra + a proven vertical slice)

**R1 — Multi-script data model.** Extend the aarti type so one aarti can carry several
language renderings, and native regional aartis are first-class entries.
```ts
type AartiScript = { refrain: string; cue: string; stanzas: string[] };
type Aarti = {
  slug: string;                    // stable id → /aarti/<slug>
  title: Bi; intro: Bi;            // app-label + context (EN/HI)
  family: 'vishnu'|'shiva-shakti'|'ganesh'|'hanuman'|'surya'|'devi'|'other';
  origin: 'pan-indian'|'marathi'|'bengali'|'gujarati';
  langs: {                         // only the languages this aarti actually has
    hi?: AartiScript;              // Hindi (Devanagari)
    mr?: AartiScript;              // Marathi (Devanagari, Marathi wording)
    bn?: AartiScript;              // Bengali script
    gu?: AartiScript;              // Gujarati script
    roman?: AartiScript;           // Roman transliteration (P1)
  };
  primaryLang: keyof Aarti['langs'];
  sources: Record<string, string[]>;   // per-lang ≥5 citations
};
```
*Acceptance:*
- [ ] Given an aarti with `langs.hi` + `langs.mr` + `langs.bn`, the model stores and returns
  each independently; a festival can reference it and it renders in `primaryLang` by default.
- [ ] Native regional aartis (e.g. Sukhkarta Dukhharta, `origin:'marathi'`) exist as their own
  entries with `langs.mr` (+ optional transliterations), not forced into a Hindi shell.
- [ ] Existing 14 Phase-1 aartis migrate to `langs.hi` with **no visual change** (backward-safe).

**R2 — Per-aarti language toggle.** A small language chip row on each aarti (e.g. `हिन्दी ·
मराठी · বাংলা · ગુજરાતી`), showing **only the languages that aarti has**, independent of the
app's EN/HI setting, defaulting to `primaryLang`, remembering the user's last choice.
*Acceptance:*
- [ ] Given an aarti with hi+mr+bn, the toggle shows exactly those three; switching re-renders
  refrain/cue/stanzas in the chosen language without changing app language or reloading.
- [ ] The choice persists across aartis in the session (e.g. localStorage) and does not alter the
  festival guide's EN/HI mode.
- [ ] An aarti with only one language shows **no** toggle (no dead control).
- [ ] Correct fonts/rendering per script; no 375px horizontal overflow; 0 console errors.

**R3 — 5-source validation + citations.** Every aarti-language shipped must record **≥5
authentic sources** (DrikPanchang, Sri Mandir, ≥2 reputable news/lyric sites, and — for mr/bn/gu
— **≥1 native-language source**), cross-validated (majority agreement; genuine variants noted).
*Acceptance:*
- [ ] A citations file records ≥5 sources per aarti-language, with ≥1 native-language source for
  each non-Hindi rendering.
- [ ] `validation/festival-aarti.cjs` extended: fails if a shipped `langs.X` has <5 recorded
  sources, or if script ranges don't match the declared language (e.g. `bn` text must be in the
  Bengali Unicode block), or Latin leaks into a native-script body.
- [ ] Orthography rules per script applied (ॐ not ओम् for Devanagari; equivalent per script).

**R4 — Vertical slice proven end-to-end.** Ship the model + toggle + gate on a small,
representative set spanning all three new languages and both content types:
- Ganesh: `hi` (have) + **`mr` native (Sukhkarta Dukhharta)** + `bn`/`gu` transliterated.
- Durga: `hi` (have) + **`bn` native (Bengali Durga aarti)** + `mr`/`gu`.
- One Gujarati-origin or Gujarati-transliterated aarti to exercise `gu` natively.
*Acceptance:*
- [ ] The slice renders correctly in every declared language, passes the gate + build, EN/HI app
  modes both fine, and is **owner-skimmed** (incl. a native check for bn/gu — see Open Questions).

### P1 — Should-have (breadth + reach, fast-follow)

- **R5 — Full Phase-2 breadth.** All Tier-1 and Tier-2 aartis from the priority list, each in
  Hindi + its applicable regional languages (native where the aarti is regional; transliterated
  otherwise). *Acceptance: every Tier-1/2 aarti live with ≥5 sources per language, gated, skimmed.*
- **R6 — Roman transliteration** (`langs.roman`) for diaspora "reach all." *Acceptance: Roman
  option appears in the toggle where present; scheme consistent across aartis.*
- **R7 — Standalone aarti pages** (delivered by `P2-FESTIVAL-AARTI-FINDER`): `/aarti/<slug>` per
  aarti, language toggle preserved in the URL (e.g. `?lang=bn`) for shareable regional deep links.

### P2 — Future (design-for, don't build)

- App-wide regional language; more scripts (Tamil/Telugu/Kannada/Odia); audio sing-along;
  personalization by deity/region (Sri Mandir-style) — the model's `langs`/`origin`/`family`
  fields are designed so these don't require a rewrite.

## Success Metrics

**Leading (days–weeks):** aarti-page views; script-toggle usage rate; **% of aarti sessions using
a non-Hindi language** (target ≥15% at 30 days); regional-city engagement (Pune/Kolkata/Ahmedabad);
share-link clicks on `?lang=` deep links.
**Lagging (weeks–months):** organic search traffic to `/aarti/*` (needs FINDER + prerender);
retention of regional users; diaspora reach (non-India sessions on aarti pages).
*Measurement:* privacy-safe event counts already in the app (`src/telemetry/privacy-events.ts`);
evaluate at 1 week, 1 month, 1 quarter; **pivot** on which languages/aartis actually pull.

## Open Questions

- **[owner]** Does the ≥5-source rule apply **retroactively** to the 14 shipped Hindi aartis, or
  only to new/regional ones? (Blocking for scope sizing.)
- **[owner/content]** **Native-script accuracy without a native reviewer is the biggest risk.**
  Bengali/Gujarati text assembled from sources (the fetch tool refuses verbatim lyrics; we rely on
  search snippets + cross-validation) needs a **native-language sanity check** before Green. Do we
  have a Bengali/Gujarati reviewer, or does owner skim suffice with the ≥5-source + script-range
  gate as the safety net? (Blocking for bn/gu GA.)
- **[content/eng]** Transliteration method for the "same aarti transliterated": prefer a
  **source-published** regional version where one exists (DrikPanchang Marathi, etc.); only where
  none exists, use verified Indic script-conversion (never raw machine output). Confirm this order.
- **[design/data]** Roman scheme — IAST vs ITRANS vs simple phonetic. Tie to "reach all, learn,
  pivot"; pick the most readable for lay diaspora users. (Non-blocking; P1.)
- **[product]** Should native regional aartis also surface on the relevant **festival page**
  (e.g. Sukhkarta on Ganesh Chaturthi), or only on their standalone page? (Non-blocking.)

## Timeline / Phasing

- **The SEO payoff depends on `P2-FESTIVAL-AARTI-FINDER` + `INFRA-SPA-PRERENDER`** (standalone,
  crawlable pages). Content + toggle can ship **inline first** and gain SEO once those land.
- **Phase A (P0):** data model + per-aarti toggle + 5-source gate + vertical slice (Ganesh mr/bn/gu,
  Durga bn native). Ship inline in festival guides.
- **Phase B (P1):** breadth rollout by tier × language; Roman; wire to standalone pages when FINDER
  is ready.
- **Phase C (P2):** additional scripts / app-wide language / audio — later, data-driven.
- **Sequencing rule:** ship Phase A, read the non-Hindi-usage metric, then decide how far to push
  bn/gu breadth vs. doubling down on Marathi (or vice-versa). Do not build all languages × all
  aartis blind.

## Risks

- **Regional-script accuracy** (see Open Questions) — mitigated by ≥5 sources incl. native, the
  script-range gate, and a native/owner skim gate before Green.
- **Sourcing throughput** — verbatim fetch is blocked; assembling from snippets across 5 sources ×
  4 languages × 20 aartis is heavy. Mitigate by shipping the vertical slice first and pacing by tier.
- **Content commoditization** — lyrics alone aren't a moat; the wedge is clean UX + panchang-accurate
  context + regional reach. Keep the render clean and ad-free (product principle).
