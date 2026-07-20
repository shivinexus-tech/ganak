# Ganak — Project Conventions (canonical, for ALL agents)

Product name: **Ganak** (गणक — Sanskrit for "one who calculates," a fitting name
for an astrology engine). Renamed from "Janma Kundli" on 2026-07-17; the working
directory and repo history still say "Kundli" in places — that's cosmetic, not a
second product.

A Vedic panchang + kundli app. The app is being migrated from one large React file
into feature modules. `src/kundli-app.tsx` remains the integration shell during the
transition. Benchmark: Drik Panchang. Goal: beat it.
Vite + React scaffold; `npm install` then `npm run dev` (Node 18+).

**Design principle: answer-before-data.** A plain-language verdict always renders
before the technical chart. Users are observant householders and curious diaspora,
not practising astrologers. Every jargon term gets a plain-English gloss.

**Owner's standing UX principles (2026-07-17):** plain-language messages that help
navigation; no state resets without a user action; the user must always be able to
tell what the app is doing. UI must follow the language toggle (hi/en) everywhere.

## Architecture invariants
- **Modular migration is owner-approved (2026-07-19).** New source files are allowed
  for pure extraction into `src/screens/`, `src/features/`, `src/components/` and
  `src/engine/`. Do not combine a move with redesign, copy changes or new behaviour.
- **ONE WRITER PER FILE.** Agents may work concurrently only when their file scopes
  do not overlap. `src/kundli-app.tsx`, shared design tokens and shared navigation are
  integration-owned: reserve them in `plans/task-log.md` before editing.
- **Isolated branches/worktrees for concurrent code.** Each coding agent gets an
  exclusive branch + worktree and an explicit allowed-file list. One integrator
  reviews and merges branches sequentially, running all gates after every merge.
- **No orphans.** After replacing anything, grep the old name; zero orphaned
  references is the standard. Diagnose structurally, don't patch the surface.
- **No browser storage.** `localStorage` / `sessionStorage` are banned outright.
  Small UI prefs may use URL query params (see `urlPrefGet`/`urlPrefSet`).
- **Phone-first, no console.** Errors must surface visibly in the UI. Silent
  failure is unacceptable. Ship complete code, never partial.
- **Astronomy conventions: Lahiri ayanamsa, mean Rahu/Ketu** — matching Drik
  Panchang defaults. Never silently switch; it changes every chart in the app.

## Validation gates — run after EVERY structural edit, paste passing output
```bash
node validation/parse-check.js src/kundli-app.tsx    # syntax, duplicates, orphans, storage ban
node validation/prashna-parity.js src/screens/PrashnaScreen.tsx # Prashna engine == validated engine
node validation/prashna-calc.js                      # 24 self-tests vs Drik anchors
node validation/muhurat-anchors.cjs                  # muhurat rules vs Drik 2026 published dates
node validation/panchaka-windows.cjs                 # no sub-minute/same-minute display windows or gaps
node validation/festival-deeplinks.cjs               # permanent festival routes + existing card default
node validation/festival-page-coverage.cjs            # every in-scope openable label has a valid page
```
Never claim work is done without pasting the passing output. Evidence before
assertions. If a gate fails, fix the cause — never weaken a gate to pass it
(whitelisting a genuine browser global in parse-check is the one allowed exception).

## Workflow
- **Check before you edit.** Read `plans/task-log.md` and
  `plans/module-ownership-map.md` first. Report to the owner in plain language:
  **In progress** (another agent has those files), **Unassigned** (no reservation —
  do not code until one exists), or **Stopped midway** (task exists but paused —
  say **which agent** stopped, where, and why using the log, handoff docs, and git).
  Full rules live in `plans/task-log.md` § Pre-flight check.
- **Owner steers by backlog, not by clicking Allow.** Priorities live in
  `plans/backlog.md`. Feature plans live in `plans/`. Agents work autonomously
  inside the sandbox; the owner decides *what* is next by reading the backlog
  and `plans/task-log.md`, not by approving each shell command.
- Work passes: research → UI (owner sign-off on UX) → build → gates →
  browser/phone smoke test.
- Every agent assignment and handoff is recorded in `plans/task-log.md`, including
  branch/worktree, owned files, gate output and blockers.
- **Temp backups stay inside the repo:** use `.scratch/` (gitignored), never
  `/tmp` or paths outside the project.
- **Recovery vault (agents must never touch):** `~/Ganak-Recovery/LATEST` is a
  protected restore copy. Refresh it with `scripts/snapshot-recovery.sh` after
  green gates or before a big risky change. Agents must not edit, delete, or
  overwrite anything under `~/Ganak-Recovery/`.
- The owner is non-technical: explain in plain language, one step at a time, and
  ask before anything irreversible or scope-changing *as a product decision*
  (new feature, monetization, launch), not for routine shell/tool calls.
- **Standing git policy (owner, 2026-07-19):** after a finished backlog slice or
  docs sync with green gates (or docs-only), **commit and push without asking**.
  Ask only for risky/unstable work, or when the owner said “don’t push.”
  See `plans/how-you-steer.md`.
- Complete fixes only. If a fix is partial, say so explicitly.

## Design system
- Control height 42px, corner radius 11px (tokens `T.ctrlH`, `T.rMd`).
- Bilingual section headers (Devanagari + uppercase English) — `SecHead` pattern.
- Summary-card-first layout, collapsible detail below.
- Palette: cream `#FAF5EA`, gold `#A86A12`, sindoor `#C2451E`, ink `#3B3147`,
  muted `#8C8173`, line `#E7DDC6`.
