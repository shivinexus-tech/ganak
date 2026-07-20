# Ganak — Module ownership map (live board)

**This is the live coordination board.** Before editing any code, find your lane
here, confirm the file exists, and reserve it in `plans/task-log.md`.

Verified 2026-07-20 — shell **143 lines**; live at **ganak.pages.dev**.

> **Note:** `CLAUDE-P1-VRATVIDHI-VERIFY` was initially assigned to Claude Code; the
> owner reassigned it to **Codex**, who merged it (`9987c83`). The task ID and brief
> filename still say `CLAUDE-` — that is legacy naming only.

---

## Honest status

| | Lanes |
|---|---|
| ✅ **Assignable now** | Chart polish · Validation · EPIC-IA/DS · P1 deeplinks |
| ✅ **Recently merged** | Festival content (Slices A–F) · Vrat vidhi verify (Codex) |
| ♾️ **Always open** | Research/docs in `plans/` |

Architecture + deploy + privacy + perf: **done**. Launch gate is now **content polish +
deeplinks**.

---

## The board

| # | Lane | Status | Who may reserve next |
|---|---|---|---|
| 1 | Daily/Panchang | **MERGED** | ✅ Open (EPIC-IA nav cleanup) |
| 2 | **Festivals/Vrats content** | **MERGED** (106 keys 2026) | ✅ Open for P2 gaps |
| 2b | **Vrat vidhis** | **MERGED** (16 wired) | ✅ Open for new festival vidhi stubs |
| 3 | Muhurat | **MERGED** | ✅ Open |
| 4 | Chart | **MERGED** (hidden) | ✅ Open for panel peels |
| 5–10 | Matching, Prashna, Hora, Jyotish, Validation, Backend | **MERGED** / open | ✅ Reservable |

### Shared files

| File | Note |
|---|---|
| `src/kundli-app.tsx` | Shell 143 lines — open; reserve before edit |
| `src/engine/festivals.ts` | Open — coordinate via `plans/task-log.md` |
| `src/data/vrat-vidhis.ts` | Open — extend when new festivals land |

---

## What unlocks launch credibility

```
Done   — festival calendar (~106 keys) · vrat vidhi verify (Codex, was CLAUDE-* ID)
Owner  — npm run smoke (one time) · contact email for legal page
Next   — owner Sentry DSN (`plans/error-monitoring.md`) · analytics/feedback · EPIC-IA nav (parked)
```

Agents not on the above: Chart panel peels, validation gates, `sunSidMs` perf,
or docs/research.
