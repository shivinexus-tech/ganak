# Ganak — Module ownership map (live board)

**This is the live coordination board.** Before editing any code, find your lane
here, confirm the file exists, and reserve it in `plans/task-log.md`.

Verified 2026-07-20 — shell **143 lines**; live at **ganak.pages.dev**.

---

## Honest status

| | Lanes |
|---|---|
| ✅ **Assignable now** | Content (Codex batch 2) · Vidhi verify (Claude) · Chart polish · Validation · EPIC-IA/DS |
| 🔒 **Reserved** | `CODEX-P1-CONTENT-02` · `CLAUDE-P1-VRATVIDHI-VERIFY` |
| ♾️ **Always open** | Research/docs in `plans/` |

Architecture + deploy + privacy + perf: **done**. Launch gate is now **content**.

---

## The board

| # | Lane | Status | Who may reserve next |
|---|---|---|---|
| 1 | Daily/Panchang | **MERGED** | ✅ Open (EPIC-IA nav cleanup) |
| 2 | **Festivals/Vrats content** | **Partial** | 🔒 Codex (`CODEX-P1-CONTENT-02`) |
| 2b | **Vrat vidhis** | **Partial** (15 wired) | 🔒 Claude (`CLAUDE-P1-VRATVIDHI-VERIFY`) |
| 3 | Muhurat | **MERGED** | ✅ Open |
| 4 | Chart | **MERGED** (hidden) | ✅ Open for panel peels |
| 5–10 | Matching, Prashna, Hora, Jyotish, Validation, Backend | **MERGED** / open | ✅ Reservable |

### Shared files

| File | Note |
|---|---|
| `src/kundli-app.tsx` | Shell 143 lines — open; reserve before edit |
| `src/engine/festivals.ts` | 🔒 Codex content batch |
| `src/data/vrat-vidhis.ts` | 🔒 Claude vidhi verify |

---

## What unlocks launch credibility

```
Codex  — CODEX-P1-CONTENT-02     → more festivals on calendar (P1 gaps)
Claude — CLAUDE-P1-VRATVIDHI     → owner sign-off on vidhi cards
Owner  — npm run smoke (one time) · contact email for legal page
Later  — error monitoring · analytics/feedback · EPIC-IA nav cleanup
```

Agents not on the above: Chart panel peels, validation gates, `sunSidMs` perf,
or docs/research.
