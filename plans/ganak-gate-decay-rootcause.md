# Why Ganak's own rules keep getting broken — root-cause analysis

**Date:** 2026-08-02 · **Author:** Claude Code · **Method:** `superpowers:systematic-debugging`
**Status:** root cause identified and reproduced. **No code changed.**
**Related:** [`ganak-architecture-audit.md`](ganak-architecture-audit.md) (and its 2026-08-02 correction header)

---

## The question

The architecture audit reported three problems — a god-file, scattered colours, scattered
Hindi/English text. But `AGENTS.md` already forbids all three, and
[`src/i18n.ts`](src/i18n.ts) literally says *"Shared by every screen; integration-owned.
Add strings here, don't fork."*

So the useful question isn't "what's broken." It's:

> **The rules exist and are clearly written. Why do they keep being broken anyway?**

Fixing the symptoms without answering this guarantees they re-grow.

---

## Phase 1 — Evidence

**1. The rules are not just documented, they are automated.** There are **69 validation
gates** in `validation/` (AGENTS.md lists only 25 — 44 more exist undocumented).

**2. A design-system gate already exists and is thorough.**
[`validation/design-system-primitives.cjs`](validation/design-system-primitives.cjs)
runs **202 checks**: zero raw hex anywhere in `src/`, no px font sizes that bypass
`--scale`, four universal primitives that carry no values of their own, primitive
adoption on six named screens, a guidance ladder consumed on all five launch journeys.

**3. CI runs every gate on every push to main.**
[`.github/workflows/quality-checks.yml`](.github/workflows/quality-checks.yml) loops over
`validation/*.cjs`, plus the two argument-taking gates, plus a production build, on
`push: [main]`, on every PR, and on a daily 06:00 UTC cron.

**4. The gate is failing right now, on committed code, at HEAD:**

```
✗ design-system-primitives FAILED (1/202)
  - raw colour literal in src/screens/PersonalMuhuratScreen.tsx: #FFFDF7, #1F7A4D, #1F7A4D
```

`git status src/` is clean — this is not an uncommitted local edit. It is the state of the
branch, and the branch is level with `main`.

**5. The violating lines show the real shape of the problem:**

```
:97   background: "#FFFDF7", color: C.ivory
:131  color: f.taraGood ? "#1F7A4D" : C.sindoor
:205  <p style={{ color: "#B4462A", ... }}>
```

Note the mixture: raw hex **and** `C.ivory`/`C.sindoor` — the *old* prop-drilled palette —
in the same expression. This screen was never migrated to the token system at all.

**6. It is not one orphan file.** **24 files** still reference the old
`C.gold`/`C.ivory`/`C.sindoor` palette; **7 files** still contain raw hex.

---

## Phase 2 — Pattern analysis

Compare what got migrated against what didn't. The gate's own `ADOPTERS` list names the
six screens the design-system pass covered:

```
MuhuratHub · DailyScreen · FestivalGuideScreen · PrashnaScreen · ChartScreen · PersonalizeScreen
```

`PersonalMuhuratScreen.tsx` is **not on that list.** Neither are `MedicalMuhuratScreen`,
`UtilityCalculatorScreen`, `MatchingScreen`, `RectifyScreen`, `JyotishBnnScreen`,
`CalendarPage`.

So the migration had a scope list, the scope list was smaller than the codebase, and the
gate's *global* no-hex sweep is stricter than the migration that preceded it.

**The gate was therefore committed already-red** — it asserts a standard across all of
`src/` that the accompanying migration only delivered on six screens.

---

## Phase 3 — Hypothesis and test

**Hypothesis:** *Gates in this repo are advisory in practice. They can fail without
stopping anything, so violations accumulate silently.*

**Test — trace the deploy path:**

| Link in the chain | Verified state |
|---|---|
| Gate detects the violation | ✅ Yes — fails loudly, names the file and the three colours |
| CI runs the gate on push to main | ✅ Yes — `quality-checks.yml` runs the whole suite |
| CI failure blocks the merge | ❌ **No branch protection is configured in the repo** |
| CI failure blocks the production deploy | ❌ **No** — Cloudflare Pages watches the `main` branch, not the Actions result |

**Result: hypothesis confirmed.** A failing gate produces a red ✗ on GitHub and a
**successful production deploy**. The two systems don't talk to each other.

> ⚠️ **One link I could not verify from here:** whether the Cloudflare Pages project has
> been manually configured to wait on GitHub checks. That setting lives in the Cloudflare
> dashboard, not the repo. Default Pages behaviour is to deploy on push regardless of
> checks, and nothing in `wrangler.jsonc` changes it — but please confirm in the dashboard
> before treating this as settled.

---

## Root cause

**Ganak's quality rules are enforced by detection, not by prevention.**

Every mechanism in the repo tells you *after the fact* that a rule was broken. Nothing
*stops* the break. Specifically:

1. **Gates are run by hand.** AGENTS.md's instruction is *"run after EVERY structural
   edit, paste passing output"* — a discipline, dependent on each agent remembering, on
   each task, to run 69 scripts.
2. **CI exists but is not a gate.** It runs everything, reports honestly, and then has no
   authority. No branch protection, no deploy dependency.
3. **`main` auto-deploys.** So the *fastest* path from "agent finished" to "users see it"
   bypasses the check entirely.
4. **Sweeps outrun migrations.** The design-system gate asserts a repo-wide standard while
   the migration behind it covered six of thirteen screens. That gap became permanent debt
   the moment it was committed, because nothing forced it closed.

This single mechanism explains **all three** symptoms in the audit:

| Symptom | Same mechanism |
|---|---|
| Colours scattered (7 files raw hex, 24 on the old palette) | Gate catches it; nothing blocks it; incomplete migration froze in place |
| `kundli-app.tsx` god-file | **No gate covers it at all** — nothing measures file responsibility or route-table growth, so it grows unopposed |
| Hindi/English inline ×417 (up from 346) | **No gate covers it at all** — `i18n.ts`'s "don't fork" is a code comment, and a comment cannot fail a build |

Note the sharper version of that table: where a gate exists, the problem is *contained but
unfixed*. Where no gate exists, the problem is *actively growing*. Inline bilingual
ternaries went **346 → 417 during this audit's own session.** That's the tell.

---

## What follows from this (not yet done — for the owner to direct)

Ordered by leverage. Each is small; none is a refactor.

1. **Make CI authoritative.** Turn on branch protection for `main` requiring
   `quality-checks` to pass, and point Cloudflare Pages at the check. This converts 69
   existing gates from advisory to binding **without writing a single new gate.** Highest
   leverage change available in this repo.
2. **Get the gate green.** Five raw colours in one file
   ([`PersonalMuhuratScreen.tsx:97,131,132,205`](src/screens/PersonalMuhuratScreen.tsx:97)).
   Small — but it must be first, because branch protection on a red gate blocks everyone.
3. **Finish or narrow the design-system migration.** Either migrate the 7 remaining
   screens off the `C` palette, or add them to the gate as *explicitly recorded*
   exceptions with a task ID. What must not persist is a gate asserting a standard the
   codebase doesn't meet — that trains agents to treat red as normal.
4. **Add the two missing gates**, since "no gate = grows unopposed" is now demonstrated:
   - a **ratchet** on inline `lang === "hi"` in `src/screens/` — fail if the count exceeds
     today's 417, so it can only go down;
   - a **route-table check** — new routes must come from the registry, not from editing
     `kundli-app.tsx`.
5. **Re-audit before trusting any of this.** The tree changed under a read-only audit
   mid-session. See below.

---

## Process finding — this cost real accuracy

The architecture audit ran against a working tree that **changed while it was being
read**. Three of its conclusions were wrong as a result, including a recommendation
(Decision 4, the storage adapter) for something that **already existed and shipped**.

`git fetch` was run at the start and the branch reported as 4 commits behind — but the
audit then read the *working tree* rather than the fetched ref, and did not re-check at
the end. Being "4 behind" was the warning; it wasn't acted on.

**Standing fix for any future audit or bug bash in this repo:** pin to an explicit commit
(`git rev-parse HEAD`), record it in the report header, read via `git show <sha>:<path>`
rather than the working tree, and re-verify the SHA before publishing. In a repo with ~10
concurrent agents and an auto-deploying `main`, the working tree is not a stable subject.
