# Spec C — Reservation liveness: a claim must be backed by something real

**Date:** 2026-08-05
**Status:** Draft for owner approval
**Origin:** post-mortem of `CLAUDE-EN-SIGN-NAMES-E1.0` (reserved 2026-07-29, retired stale 2026-08-03, zero commits)
**Related:** `plans/ganak-gate-decay-rootcause.md` § *the product between the files*
**Size:** small-to-medium — one gate, one schema tightening, one cleanup pass

---

## Problem Statement

`plans/task-log.md` is how five agents avoid overwriting each other. A row saying
`ACTIVE` or `RESERVED` locks a set of files: other agents read it, believe someone is
working, and route around it.

Nothing verifies the claim. A row can name a branch that was never created and a
worktree that never existed, and it will lock those files indefinitely.

**This is not hypothetical. It is the current state of the log.** Of the 7 rows
claiming live ownership today:

| Row | Claims | Reality |
|---|---|---|
| `CODEX-P0-SADE-SATI-REPORT-33` | `codex/sade-sati-report-33` / worktree **TBD** | branch does not exist |
| `CLAUDE-P0-MANGAL-THREE-REF-34` | `claude/mangal-three-ref-34` / worktree **TBD** | branch does not exist |
| `CURSOR-P0-ARUDHA-BHAVA-SPECIAL-35` | `cursor/arudha-bhava-special-35` / worktree **TBD** | branch does not exist |
| `CODEX-P0-RULING-PLANETS-RULEMAP-36` | `codex/ruling-planets-rulemap-36` / worktree **TBD** | branch does not exist |

Four P0 backlog items appear reserved by nobody. The literal string `worktree TBD` is
in the log — the row announced its own emptiness and the process had no way to hear
it. **But the deeper finding is worse than an empty reservation** (see below): the
work those rows describe was in fact built, and then lost in a different way.

**How E-1.0 died, precisely.** On 2026-07-29 at 16:12 a Claude session working inside
the Prashna-249 worktree recorded the owner's new sign-names decision. At 16:16 it
wrote a reservation row and filled the worktree column with *the worktree it happened
to be standing in* — one belonging to a different, nearly-finished task. It then
returned to Prashna 249 and closed that task at 23:28 the same night. The borrowed
worktree was cleaned up with it. Five days later the row was still `ACTIVE`, and it
blocked `CODEX-JYOTISH-CRITICAL-UX-2026-08-03` from finishing real work.

**How Jyotish 33–36 died — a different failure, found while writing this spec.**
The four rows are *not* abandoned work. Investigation on 2026-08-05 found:

| Time (2026-07-28) | Event |
|---|---|
| 14:58 | `559eb8e` creates four `RESERVED` rows — Codex #33, Claude #34, Cursor #35, Codex #36, every one with `worktree TBD` |
| 15:31 | `d6fc641` — **Codex builds all four itself**, on `codex/jyotish-33-36`: 598 insertions, 4 engine/data modules, 4 new gates, ChartScreen + dasha wiring |

In that same commit Codex **replaced** the four placeholder rows with one honest row —
`CODEX-P0-JYOTISH-33-36-BUILD | REVIEW | Codex | codex/jyotish-33-36 · .scratch/worktrees/jyotish-33-36`.
Real branch, real worktree, correct status. Codex's bookkeeping was right.

**The commit was never merged.** The work *and* its corrected bookkeeping both live on
a branch that is now **157 commits behind `main`**. `main` therefore still carries the
four stale placeholder rows, while the commit that retires them sits unintegrated. The
files are absent from `main` entirely.

Three distinct failures, all worth fixing:

1. **A bookmark and a commitment were indistinguishable.** (E-1.0) The agent did the
   right thing by capturing the decision. It had no vocabulary for "captured, not
   started", so it used the vocabulary for "in progress".
2. **The claim was never checked against reality.** `AGENTS.md:38` already requires
   an exclusive branch and worktree per agent. The rule existed; enforcement did not.
3. **Finished work reached `REVIEW` and no one integrated it.** (Jyotish 33–36) This
   is the most expensive of the three: 598 validated lines produced, correctly
   recorded, and invisible for 8 days because nothing watches for a `REVIEW` branch
   that never merges. E-1.0 lost intent; this lost delivered value.

The cost: five days of a visible defect, one agent blocked mid-task, and eight days of
finished P0 Jyotish work stranded on an unmerged branch while `main` moved 157 commits
away from it.

## Goals

1. A row claiming live ownership is backed by a branch that exists — mechanically
   verified, not trusted.
2. Capturing a decision without starting work has its own honest status, so agents
   stop reaching for `ACTIVE`.
3. A claim that goes quiet is surfaced automatically, not discovered by the next
   agent who trips over it.
4. Finished work cannot go quiet — a `REVIEW` branch that never merges is surfaced
   before `main` drifts out of reach of it.
5. The four stale rows in the log today are reconciled against the work that already
   exists, so the log matches reality.
6. Zero added friction for an agent doing real work.

## Non-Goals

- **Replacing `task-log.md` with a tracker.** The log is a plain markdown file that
  five different agents can read and append to. That property is why it works. This
  spec adds a check, not a system.
- **Preventing an agent from stopping work.** Stopping is fine and often correct.
  The failure is stopping *silently while still holding the lock*.
- **Auto-editing the log.** The gate reports; a human or an agent acts. A gate that
  rewrites the coordination record is a worse failure mode than the one being fixed.
- **Enforcing timelines or estimates.** Not the problem.
- **Retroactively auditing the 190 historical rows.** Only rows claiming live
  ownership are in scope.

## User Stories

- As an agent starting work, I want to know instantly whether a blocking row is real,
  so I do not route around a ghost or wait for an owner who does not exist.
- As an agent capturing an owner decision mid-task, I want a status that honestly says
  "recorded, not started", so I am not forced to overstate it.
- As an agent whose session is ending, I want the log to reflect that I stopped, so
  the next agent inherits the truth.
- As the owner, I want to see at a glance which reservations are real, so "in
  progress" means something when I read the log.
- As an agent finishing work, I want `REVIEW` to start a visible clock, so my delivered
  work cannot sit unnoticed until `main` has moved past it.
- As the owner, I want to be told when finished work is waiting to be integrated, so
  value I already paid for is not silently lost.
- As the owner, I want the four stale rows reconciled with the work that exists, so the
  P0s I asked for weeks ago are either merged or honestly re-opened.

## Requirements

### P0 — Must have

**C1. A status that means "recorded, not started".**
Add `PARKED` to the status vocabulary, defined as: *the decision is captured, no
branch exists, no files are locked.* A `PARKED` row **claims no files** — its owned-
files column must be empty or read `none (parked)`.

The existing vocabulary (`RESERVED`, `ACTIVE`, `REVIEW`, `MERGED`, `STOPPED MIDWAY`)
is unchanged. `RESERVED` and `ACTIVE` keep their meaning and now carry a real
obligation.

*Acceptance:*
- Given a `PARKED` row, when another agent reads the log, then it treats those files
  as free.
- Given a `PARKED` row that lists owned files, then the gate fails — parking cannot
  be used to lock files by the back door.
- `AGENTS.md` and the `task-log.md` rules header document the distinction in one
  sentence each: *`PARKED` = written down. `RESERVED` = branch cut, files locked.*

**C2. Gate: `validation/task-log-liveness.cjs`.**
Runs in the canonical suite. Parses `plans/task-log.md`, selects rows whose status
begins `ACTIVE` or `RESERVED`, and for each asserts:

1. **The branch exists.** `git rev-parse --verify <branch>` succeeds. `main` is a
   valid value (integration-owned work); anything else must resolve.
2. **No placeholder claims.** The branch/worktree cell does not contain `TBD`,
   `TODO`, `???` or an empty value.
3. **The worktree, if named, exists** in `git worktree list`.
4. **No borrowed worktree.** A worktree path named by a live row is not also named by
   a different live row. *(This is the exact E-1.0 failure.)*
5. **Owned files are declared.** A live row lists at least one file or directory.

Every failure prints the row id, the offending cell, and the one-line remedy.

*Acceptance:*
- The gate **fails on `main` today**, naming all four phantom rows. A gate that
  passes on first run has not been tested against the bug it exists to catch.
- After C5's cleanup, the gate passes.
- Given an agent cuts a branch and reserves correctly, the gate passes with no extra
  steps.

**C3. Staleness surfacing.**
A live row whose branch has had no commit for **7 days** is reported as `STALE` by the
gate — as a warning, not a failure. Reported, never auto-edited.

*Acceptance:*
- Given a branch last committed 8 days ago, then the gate output lists it under
  `STALE — confirm or retire`, and the exit code is unchanged.
- Given a row on `main`, then staleness is measured from the row's own last edit in
  git history rather than from branch activity.

**C4. Pre-flight tells the truth.**
`CLAUDE.md` already requires reporting *In progress / Unassigned / Stopped midway*
before code edits. Extend that report to run the gate and state, in the pre-flight
message: how many live rows exist, how many are backed by real branches, and which
are stale. The owner sees the real state before work starts, not after.

*Acceptance:* a pre-flight that skips the liveness check is incomplete, the same way
one that skips reading the log is.

**C5. Reconcile the four stale rows with the work that already exists.**
*(Revised 2026-08-05 — the original wording assumed these rows were abandoned. They
are not; see Problem Statement.)*

The remedy is integration, not retirement. In order:

1. Rebase `codex/jyotish-33-36` onto current `main` (157 commits behind). Expected
   conflicts are confined to `ChartScreen.tsx` (7 commits on `main` since divergence)
   and `UtilityCalculatorScreen.tsx` (1); `utility-calculators.ts` and `dasha.ts` have
   had **zero** `main` commits since and should merge clean.
2. Run the four gates the branch introduces — `sade-sati-report.cjs`,
   `mangal-dosha.cjs`, `ruling-planets.cjs`, `jyotish-special-panels.cjs` — plus the
   full canonical suite and a production build. Eight-day-old work must re-earn its
   green against a `main` that has since had a design-system overhaul.
3. Merging carries Codex's own row consolidation with it, which retires the four
   placeholder rows automatically. **Do not hand-retire them first** — that would
   discard correct bookkeeping and create a conflict for no reason.
4. Only if a lane genuinely fails to survive rebase does it return to the backlog as
   unassigned, recorded honestly with what failed and why.

*Acceptance:*
- Four placeholder rows gone from `main`, replaced by the consolidated `REVIEW` row.
- The four new gates pass on the rebased result, alongside the full suite.
- Any lane that could not be salvaged is named explicitly, with evidence — not
  quietly dropped.
- `validation/task-log-liveness.cjs` green afterwards.

**C10. Gate: unmerged-delivery surfacing.**
Extend `validation/task-log-liveness.cjs` to cover rows whose status begins `REVIEW`
or `READY` — the state Jyotish 33–36 was lost in. For each, report:

1. **Commits ahead of `main`** — the work waiting to land.
2. **Commits behind `main`** — how far the branch has drifted. Warn past **30**;
   157 is how an easy merge becomes an archaeology project.
3. **Days since the branch's last commit.**

Warning-only, like C3. The point is visibility, not obstruction.

*Acceptance:*
- The gate flags `codex/jyotish-33-36` today, reporting 1 ahead / 157 behind / 8 days.
- After C5, that row no longer appears.
- A `REVIEW` branch cut this morning produces no warning.

### P1 — Should have

**C6.** A one-line reservation helper that cuts the branch **and** writes the row from
the same input, so the branch cannot be aspirational and the worktree cannot be
inherited from wherever the agent happened to be standing. Removing the manual step
removes the failure.

**C7.** The Tier A CI job (`.github/workflows`, added 2026-07-29) runs the liveness
gate on its daily cron, so a reservation that dies overnight is reported the next
morning rather than five days later.

### P2 — Future

**C8.** `MERGED` rows whose branches still exist could be reported for cleanup. Real
but low value; not now.

**C9.** The deeper pattern — *no gate can see the product between the files* — is
already recorded in `plans/ganak-gate-decay-rootcause.md` and produced
`route-reachability.cjs`. This gate is the second instance. If a third appears, that
class of defect deserves its own standing review rather than another one-off gate.

## Success Metrics

**Leading (at merge):**
- Live rows with a non-existent branch: **4 → 0**.
- Occurrences of `worktree TBD` in live rows: **4 → 0**.
- Live rows sharing a worktree with another live row: **0**, enforced.
- P0 backlog items whose log row contradicts reality: **4 → 0**.
- Delivered-but-unmerged commits stranded on `REVIEW` branches: **1 known (598 lines)
  → 0**, and surfaced automatically thereafter.

**Lagging (30 and 90 days):**
- Rows retired as `STOPPED MIDWAY — stale`: target **0** (they should be caught as
  `STALE` within 7 days and confirmed or retired deliberately instead).
- Agent-sessions blocked by a stale reservation: currently **1 known**
  (`CODEX-JYOTISH-CRITICAL-UX-2026-08-03`) → target **0**.
- Median age of a live reservation at retirement: target **< 7 days**, versus 5 days
  *undetected* in the E-1.0 case.

## Open Questions

- **(owner)** Is 7 days the right staleness threshold? Some work legitimately pauses
  across a weekend plus a research detour. *Non-blocking — shipping 7 days as a
  warning-only signal, trivially tunable.*
- ~~**(owner) — BLOCKING for C5.** Retire the four phantom P0s or re-pick them?~~
  **VOID (2026-08-05).** The question rested on a false premise — the work was built,
  not abandoned. **Owner directed: proceed with the merge.** C5 is now an integration
  task, not a cleanup task.
- **(owner)** If a lane fails to survive the rebase — most likely the Arudha/Bhava
  presentation work in `ChartScreen.tsx`, which `main` has since restyled — do you
  want it re-implemented against current `main`, or returned to the backlog for later?
  *Non-blocking — I will report exactly what did not survive before deciding anything.*
- **(engineering)** Should the gate fail or warn when a live row's branch exists but
  has **zero** commits beyond `main` — the exact E-1.0 shape? Failing immediately
  would penalise an agent who just cut a branch. *Proposed: warn, and let C3's
  7-day staleness escalate it.*

## Timeline Considerations

No external deadline, but this one blocks value **today**, and more urgently than first
assessed: 598 lines of finished P0 Jyotish work sit on a branch drifting further from
`main` every day. Merge cost rises with every commit that lands — it was low on July
28 and is 157 commits higher now. **C5 is the time-sensitive item in all three specs.**

**Suggested order across the three specs:**
1. **C first** — it is the cheapest, it unblocks four P0s immediately, and it is the
   guard that would have prevented A and B from rotting for five days.
2. **A** — small, visible, proves the structured-event pattern.
3. **B Phase 1** — the migration and the leak gate.
4. **B Phase 2** — the sign vocabulary, once the open question is answered.

Doing C first is not process for its own sake: A and B will each need a reservation,
and both are exactly the kind of multi-day work the previous attempt failed at.
