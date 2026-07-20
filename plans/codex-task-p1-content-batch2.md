# Codex task — P1-CONTENT batch 2 (festival calendar gaps)

**ID:** `CODEX-P1-CONTENT-02`  
**Agent:** Codex (or any agent — reserve in `plans/task-log.md` first)  
**Status:** RESERVED — ready to start  
**Owner assigned:** 2026-07-20

Read `AGENTS.md` and `.cursorrules`. Log RESERVED → ACTIVE → MERGED in
`plans/task-log.md` before editing.

---

## Goal

Close the **next P1 festival/fast gaps** so Ganak's 2026 calendar is credible for
launch. Batch 1 (Tier-1 monthly cycle + Diwali/Chhath cluster) is MERGED. This batch
targets the remaining **P1 misses** from `plans/drik-gap-analysis.md` (updated
priority list below — Diwali/Chhath items are **done**, skip them).

**Not:** invent ritual text, mantras, or sankalpa. Sourced placement + bilingual
name/gloss only unless a vidhi already exists in `plans/vrat-vidhis.md`.

---

## Priority list (ship in this order)

### Slice A — high-visibility annual (tithi rules, mostly Tier 1)

| Key (suggested) | Observance | 2026 Delhi anchor (verify) | Notes |
|---|---|---|---|
| `chaitraNavratri` | Chaitra Navratri begins | ~Mar 19 | Sharad exists; Chaitra missing |
| `gudiPadwa` / `ugadi` | Gudi Padwa / Ugadi | ~Mar 19 | Chaitra Shukla 1; may share day with Chaitra Navratri |
| `vatSavitri` | Vat Savitri Vrat | ~May 16 | Married women's vrat |
| `vatPurnima` | Vat Purnima | ~Jun 29 | Western-India variant |
| `anantChaturdashi` | Anant Chaturdashi / Ganesh Visarjan | ~Sep 25 | Closes Ganesh utsava |
| `kartikaPurnima` | Kartika Purnima / Dev Deepawali | ~Nov 24 | Named Purnima, not generic |
| `tulasiVivah` | Tulasi Vivah | ~Nov 21 | Vaishnava |
| `pongal` | Pongal (Tamil harvest) | Jan 14 | Distinct label from Makar Sankranti same day |

### Slice B — engine already computes; surface in list

| Item | Work |
|---|---|
| Pitru Paksha span | Engine + Muhurat blocker exist; add **list entries** for period start + Sarva Pitru Amavasya (see `content-tier2.md` §2A) |

### Slice C — needs computed rules (Tier 1.5 / Tier 2)

| Key | Rule | Notes |
|---|---|---|
| `varalakshmi` | Friday before Shravana Purnima | Researched in `content-tier1.md`; needs calc hook |
| `mahalakshmiVrat` | 16-day span OR culmination day only | Owner preference: start with **culmination day** (Krishna 8) unless owner wants full span |

### Slice D — Tamil / Shakta (after A–C if time)

From `plans/content-tier2.md`: Arudra Darshan, Vaikasi Visakam, Aadi Pooram, annual
Skanda Shashti (6-day), remaining Shakta gaps in §2E. Each needs nakshatra-in-solar-month
or multi-day logic — **one festival per commit**, gates after each.

---

## Allowed files

- `src/data/festival-meta.ts` (`FEST_META`, `FEST_NAME`, `OBS_META` as needed)
- `src/engine/festivals.ts` (calc hooks, `FESTIVALS` array, day-part policy)
- `validation/content-dates.cjs` (2026 Delhi regression anchors per new entry)
- `plans/` research notes (source links, owner-verify queue)
- `plans/task-log.md`, `plans/drik-gap-analysis.md` (append “shipped” notes)

## Forbidden (unless owner reassigns)

- `src/kundli-app.tsx`, `src/screens/*` (shell/UI)
- `src/data/vrat-vidhis.ts` (Codex vidhi verify — task ID still says `CLAUDE-*`; see brief history)
- `server/**`

---

## Method (per observance)

1. **Source** — Drik Panchang page for New Delhi 2026 + one independent source
   (gov.in Utsav, regional tourism, or named text). Record URLs in commit or
   `plans/phase1-content-*.md`.
2. **Day-part** — explicit kala from `festival-daypart-audit.md` / existing patterns.
   Never assume noon unless sourced.
3. **Bilingual** — `{ en, hi }` name + short gloss in `festival-meta.ts`.
4. **Anchor** — add 2026 Delhi date to `validation/content-dates.cjs`.
5. **Gates** (after each slice or at end of session):
   ```bash
   export PATH="/opt/homebrew/bin:$PATH"
   node validation/parse-check.js src/engine/festivals.ts
   node validation/parse-check.js src/data/festival-meta.ts
   node validation/content-dates.cjs
   node validation/prashna-parity.js src/screens/PrashnaScreen.tsx
   node validation/prashna-calc.js
   node validation/muhurat-anchors.cjs
   npm run build
   ```
6. **Commit+push** per slice (owner standing policy). Check `git status` for foreign
   staged files before commit (INCIDENT-02).

---

## Done when

- [ ] Slice A entries fire on correct 2026 dates (content-dates anchors green)
- [ ] Pitru Paksha visible in fasts/festivals list (Slice B)
- [ ] No unsourced ritual claims; regional variants labelled as regional
- [ ] `plans/drik-gap-analysis.md` updated with what shipped
- [ ] Task-log MERGED with gate evidence

## Parallelism

Ran **in parallel** with `CLAUDE-P1-VRATVIDHI-VERIFY` (vidhi verify — **Codex
executed**; ID/filename legacy from initial Claude assignment). No file overlap.
Do **not** run two agents on `festivals.ts` at once.
