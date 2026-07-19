# Ganak — Roadmap breakdown, user stories & parallel task plan

Written by Claude 2026-07-18 at the owner's request: synthesize the user research,
prioritize by epic, write user stories, and decompose into tasks that **multiple
agents can run simultaneously**. The central enabler is fixing the single-file
bottleneck — covered first because everything else's parallelism depends on it.

---

## 0. THE ENABLER — split the single file into modules

**Problem:** `src/kundli-app.tsx` is one ~6,200-line file. The project's single-
writer rule (necessary because merging concurrent edits to one giant file creates
duplicate/orphaned code) means **only one agent can touch the app at a time.** That
is the hard ceiling on speed. Content, UI, and engine work all queue behind each
other even though they're logically independent.

**Fix:** split into modules so different agents own different files:

| New module | Contains | Who typically owns it |
|---|---|---|
| `src/engine/` | ephemeris, panchang, festivals, muhurat, prashna math (parity-gated) | careful engine work (rare) |
| `src/data/` | observance data — festivals, vidhis, variants, ekadashi names | **content agents (grows fastest)** |
| `src/screens/` | Daily, Chart, Prashna screen components | UI agents |
| `src/components/` | shared UI (Card, SecHead, Badge, VratVidhiCard…) | UI agents |
| `src/kundli-app.tsx` | thin shell: nav + wiring the screens together | integrator |

**Payoff:** after the split, a content agent can add festivals in `src/data/` while
a UI agent restyles a screen in `src/screens/` while the engine stays untouched —
**true parallelism, no collisions.** This also shrinks each file so agents hold it
in context and reviews are faster.

**Cost / risk:** it's a big refactor of a validated file. Mitigation: the parity/
calc/anchor gates prove the engine is unchanged after the move; do it as ONE
focused single-writer task (Claude, most gate-disciplined), verifying gates after
each extraction. It briefly pauses parallel code work — a one-time investment.

**Sequencing:** finish the current parallel round (remaining vidhis, backend proxy,
this doc), THEN do the split, THEN unlock module-level parallel ownership. This is
proposed as **EPIC-SPLIT** and should run before scaling up the agent count.

---

## 1. User research synthesis (personas → needs)

Synthesized from the roadmap doc, the Kimi context doc, and Ganak's own messaging
audit. These are the target users (Hindu householders + diaspora; practitioners are
lower priority per owner).

### Persona A — Observant Householder (PRIMARY)
- **Who:** Indian householder who follows daily panchang/rituals.
- **Context:** opens the app ~7am, wants the answer in seconds, closes it. Mid-range
  Android, mixed connectivity.
- **Needs:** today's tithi/nakshatra, is there a fast today, Rahu Kalam, festival
  alerts, how to observe a fast (vidhi), auspicious timing for a task (muhurat).
- **Pain if unmet:** overwhelm, jargon, wrong dates, "is today X or tomorrow?"

### Persona B — Diaspora Devotee (PRIMARY)
- **Who:** Indian abroad (US/UK/etc.) staying culturally connected.
- **Needs:** plain-language, warm tone, correct dates *in their timezone*, "when is
  the next Ekadashi," festival meaning explained, English-first with Hindi option.
- **Pain if unmet:** timezone confusion, missing festivals, cultural disconnection.

### Persona C — Serious Practitioner (LOWER PRIORITY)
- **Who:** astrologers/learners.
- **Needs:** deep chart tools (Kundli, dashas, KP, divisionals, matching).
- **Strategy:** reach mainstream first; this persona monetizes later. Chart section
  is hidden at launch.

---

## 2. Epic priority order (for planning)

1. **EPIC-CONTENT** — festival + vrat coverage & accuracy (P1 launch gate).
2. **EPIC-SPLIT** — modularize the file (enables all parallel work below).
3. **EPIC-IA** — two-zone nav + gut MuhuratHub (launch polish).
4. **EPIC-DS** — design-system consistency (launch polish).
5. **EPIC-LAUNCH** — deploy + monitoring + analytics + feedback (Phase 1 ship).
6. **EPIC-PLATFORM** — backend proxy → AI features (foundation started now).
7. **EPIC-MOBILE** — PWA → Capacitor (Phase 3).

---

## 3. User stories by epic (prioritized)

Format: **As a [persona], I want [capability] so that [value].** Each story lists
its tasks with the **module it touches** (post-split), so the scheduler can run
non-overlapping tasks in parallel.

### EPIC-CONTENT
- **B1.** As a householder, I want every fast I observe to show *how* to observe it
  (vidhi, diet, paran) so I don't need to look it up elsewhere.
  - T: wire remaining ~12 vidhis → `src/data/vidhis` *(Cursor, in progress)*
- **B2.** As a diaspora user, I want festivals shown for *my* region/tradition so the
  date is right for me.
  - T: wire tradition/regional variants (Smarta/Vaishnava, Bengal, Gujarat, regional
    Hanuman) as distinct events → `src/data/festivals` + a tradition selector in
    `src/screens/Daily`
- **B3.** As any user, I want the festival list to be *complete* vs Drik so I trust it.
  - T: Drik-diff gap analysis → `plans/` doc *(research, any agent)*
  - T: wire the gap-fill festivals → `src/data/festivals`
- **B4.** As a householder, I want per-festival day-parts to be exact so dates never
  land a day off.
  - T: apply the sourced day-part table as the principled default → `src/engine/festivals`

### EPIC-SPLIT
- **D1.** As the owner, I want the app split into modules so multiple agents can build
  at once without collisions.
  - T: extract `src/engine/`, `src/data/`, `src/components/`, `src/screens/`; keep
    gates green at each step → single-writer, Claude.

### EPIC-IA
- **A1.** As a householder, I want a clear tab layout so I always know where features
  live (fixes "too many taps / unclear where things are").
  - T: 4-tab nav + gut MuhuratHub into dedicated screens → `src/screens/*`
- **C1.** As a practitioner, I want the 17 flat chart sub-sections grouped so I can
  navigate them.
  - T: Jyotish sub-nav (Kundli/Dashas/Matching/Tools/Vault) → `src/screens/Chart`

### EPIC-DS
- **A2.** As any user, I want a visually consistent app so it feels trustworthy.
  - T: universal Card + rigid spacing scale + shared primitives → `src/components/*`

### EPIC-LAUNCH
- **A3.** As any user, I want to reach Ganak at a real web address on my phone.
  - T: deploy to a free host → new config; T: error monitoring; T: analytics +
    feedback button → `src/components/Feedback`; T: privacy note.

### EPIC-PLATFORM
- **C2.** As a user, I want to ask questions about my chart in plain language.
  - T: backend proxy foundation → `server/` *(Codex, in progress)*
  - T: AI chart-explanation feature → `src/screens/Chart` + `server/`

### EPIC-MOBILE
- **A4.** As a user, I want Ganak installable on my phone as an app.
  - T: PWA manifest + service worker → new files; T: Capacitor shell → new project.

---

## 4. Parallel scheduling — what can run at the same time

**Rule:** two tasks can run in parallel iff they touch different files/modules.

**Current round (pre-split — limited parallelism):**
| Agent | Task | Touches | Safe? |
|---|---|---|---|
| Cursor | remaining vidhis | `src/kundli-app.tsx` | sole writer on app file |
| Codex | backend proxy | `server/` (new) | ✅ separate |
| Claude | this breakdown + reviews | `plans/` | ✅ separate |

**After EPIC-SPLIT (full parallelism unlocked) — example round:**
| Agent | Task | Module |
|---|---|---|
| Agent 1 | festival gap-fill + variants | `src/data/` |
| Agent 2 | design-system pass | `src/components/` |
| Agent 3 | nav / IA cleanup | `src/screens/` |
| Agent 4 | AI feature wiring | `server/` + `src/screens/Chart` |
| Claude | review + gates + integrate | (reads all) |

That is the speed you want — but it depends on the split landing first.

---

## 5. Recommended immediate sequence
1. **Now (parallel):** Cursor→vidhis, Codex→proxy, Claude→this doc + reviews. *(running)*
2. **Next (single-writer, Claude):** EPIC-SPLIT — modularize the file, gates green.
3. **Then (full parallel):** content, DS, IA, AI features across modules at once.
4. **Then:** EPIC-LAUNCH — deploy the website.

The split is the hinge. Everything after it goes faster.
