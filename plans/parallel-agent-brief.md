# Ganak — Parallel-Agent Work Brief

Hand this whole file to Codex or Cursor. It is self-contained. Pick your assigned
section. **Read the "Iron rules" first — they are non-negotiable and exist because
this is a single-file app where parallel edits create duplicate/orphaned code.**

Project: Ganak — Hindu Panchang + Jyotish web app. Repo:
github.com/shivinexus-tech/ganak. One React file: `src/kundli-app.tsx` (~6,000 lines).
Benchmark: Drik Panchang. Canonical conventions: `AGENTS.md` (read it).

---

## Iron rules (all agents)

1. **ONE writer on `src/kundli-app.tsx` at a time.** As of this brief, **Claude Code
   is actively editing that file** (day-part + adhik-month fixes). **Codex and Cursor:
   do NOT touch `src/kundli-app.tsx`.** Your tasks below are research/writing into
   NEW files under `plans/`. This is how we avoid clobbering each other.
2. **Your deliverable is a Markdown doc in `plans/`, not code.** Claude wires the
   content into the engine afterward (single writer). You never edit the app file.
3. **Hindu observances only.** No Jain/Christian/Islamic entries. Exception: Buddha
   Purnima is included (owner's call). See `plans/content-tier1.md` scope note.
4. **Accuracy is non-negotiable — this is religious content.** Every date/rule/vidhi
   must be *sourced* (cite Drik Panchang + a second source, or a named classical
   text). Do NOT invent. Where sources genuinely disagree, use Drik as the default
   and note the variant. Mark each entry 🟢 verified / 🟡 needs check.
5. **Bilingual.** Every user-facing name/gloss needs English + Hindi (Devanagari).
6. **Commit protocol:** commit ONLY your own new `plans/*.md` file (separate files
   never conflict). Do not commit `src/kundli-app.tsx`. Message prefix: `Content(codex):`
   or `Content(cursor):`. Then tell the owner it's ready so Claude can integrate + gate.

---

## ASSIGNMENT A — Codex: Festival day-part audit
**Deliverable: `plans/festival-daypart-audit.md`**

Context: Ganak's festival scanner currently decides every festival's date using the
tithi at a single day-part (noon). That's wrong — the shastra assigns different
*deciding day-parts* per festival. This caused Hartalika Teej to land a day early.
Claude is fixing the *mechanism* (per-festival day-part selection); YOU supply the
*sourced table* of which day-part each festival uses.

For EVERY Tier-1 festival in the app (list them from `FESTIVALS` in the repo, or from
`plans/content-tier1.md`), produce a row:

| Festival | Deciding day-part | Source(s) | 2026 correct date (Drik) | Conf |

Day-part vocabulary: **Udaya** (sunrise-prevailing — the default for most),
**Pratahkala** (early morning), **Madhyahna** (midday — e.g. Ganesh Chaturthi),
**Aparahna** (afternoon — shraddha), **Pradosha** (evening — e.g. some vrats),
**Nishita** (midnight — Janmashtami, Diwali Lakshmi Puja), **Moonrise** (Karva Chauth,
Sankashti). For each festival, name the day-part and cite the source that says so.
Flag any where your sources disagree.

This directly feeds Claude's fix. Highest value: the ones most likely to be a day off
(where the tithi transitions near a day-part boundary).

---

## ASSIGNMENT B — Cursor: Vrat vidhis (fasting guidance)
**Deliverable: `plans/vrat-vidhis.md`**

Context: the Panchang launch bar (see `plans/backlog.md`, C2) requires vrat vidhis for
the ~15–20 most-observed fasts. This is sourced content, not code.

For each of these fasts, produce a structured, sourced entry:
Ekadashi, Pradosh, Sankashti Chaturthi, Purnima (Satyanarayan), Amavasya,
Masik Shivaratri, Maha Shivaratri, the Navratris (Chaitra + Sharad), Karva Chauth,
Ahoi Ashtami, Hartalika Teej, Sheetla Ashtami, Ganesh Chaturthi, Janmashtami,
Chhath (if you can source the 4-day arghya sequence).

Each entry, bilingual (en + hi):
- **Vidhi** — how to observe it, step by step.
- **Diet rules** — permitted/forbidden (nirjala / phalahar / grains-avoided / saatvic).
- **Sankalpa** — the intention/vow (short).
- **Puja steps** — deity, offerings, sequence.
- **Paran** — the fast-breaking window rule (when + what).
- **Udyapan** — concluding ritual, where applicable.
- **Source(s)** — cite. Mark 🟢/🟡.

Keep tone plain and warm (answer-before-data): a householder should understand it
without knowing jargon. Gloss any Sanskrit term inline.

---

## What Claude Code is doing in parallel (do not duplicate)
- Fixing the festival day-part **mechanism** in `src/kundli-app.tsx` (sunrise/Udaya
  default + per-festival overrides) — will consume Assignment A's table when ready.
- Fixing `guptNavratriAshadha` not firing (adhik/leap-month month-matching bug).
- Re-running all validation gates after each change.

## How to run the gates (verification, read-only)
```
export PATH="/opt/homebrew/bin:$PATH"
node validation/parse-check.js src/kundli-app.tsx
node validation/content-dates.cjs
```
(You won't touch code, but you can run these to sanity-check dates against your research.)
