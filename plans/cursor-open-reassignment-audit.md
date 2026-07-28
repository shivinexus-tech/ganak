# Cursor Open-Items Reassignment Audit

Date: 2026-07-28
Agent: Codex
Scope: rows in `plans/task-log.md` that were assigned to Cursor and still showed
`ACTIVE` or `REVIEW`, plus uncommitted files left in the shared working tree.

## Summary

Cursor had no clean active source-code ownership that should remain assigned to
Cursor. The rows split into three groups:

| Cursor row | Previous state | New owner/state | Decision |
|---|---:|---|---|
| `CURSOR-P0-DEV-API-DEPLOY-01` | ACTIVE | Claude Code / BLOCKED | Deploy files are merged. Remaining work needs backend host, production keys, public URL and live smoke. Backend API ownership returns to Claude Code because Claude owns the API implementation. |
| `CURSOR-P0-MUHURAT-FULL-PARITY-16-17` | REVIEW | Claude Code / MERGED handoff | Implementation is merged as `11083dd`; first bug bash is recorded. Remaining closure is the existing reserved Claude bug bash and production verification. |
| `CURSOR-P0-FESTIVAL-HERO-ART-01` | ACTIVE | Codex / MERGED pipeline, long-tail follow-up | Real raster system and first three images are merged (`082f414`, `d6526e1`). Codex preserved the leftover image-pipeline docs/script/package changes. Remaining festival hero batches belong to row #29 quality work. |
| `CURSOR-P0-HOLIDAY-OVERLAY-12` | ACTIVE | Codex / MERGED, final QA pending | Code is merged (`34bdd47`); the placement decision is no longer open. Remaining work is EN/HI phone/desktop bug bash, URL restoration, calendar-marker discovery and production verification. |
| `CURSOR-LIFE-INTERPRET-WIRE-01` | REVIEW | Codex / duplicate superseded | Do not merge stale branch `cursor/life-interpretation-wire`; life interpretation was integrated later by `CODEX-KUNDLI-INTERPRETATION-HOOKUP-01` and merged as `1326ab8` with owner-verification gating. |
| `CURSOR-P0-DIWALI-MUHURAT-01` | REVIEW | Codex / MERGED, production smoke pending | Code is merged (`2814152`) and gated by `validation/lakshmi-puja-timings.cjs`; remaining work is production smoke and row #29 quality review. |

## Duplicacy Found

`CURSOR-LIFE-INTERPRET-WIRE-01` duplicates the later
`CODEX-KUNDLI-INTERPRETATION-HOOKUP-01` row. The Cursor branch should not be merged:
its tip is an old festival/holiday commit, while `main` already contains the real
life-interpretation integration.

## Uncommitted Items Resolved

The shared worktree contained useful but untracked artifacts:

- festival image pipeline docs and processor script;
- source prompts and handover files;
- three raw source images in `festival-images-src/`;
- raster README;
- bug-bash briefs and UX/IA audit docs;
- package changes for `sharp`.

Resolution:

- keep `sharp` and `npm run festival-images`;
- remove accidental unused `playwright` package entry;
- track the docs/script/raster README;
- ignore `festival-images-src/` so raw 14 MB image sources do not keep dirtying the
  shared repo;
- leave `validation/.fest-test.ts` untracked because it is a scratch file, not a
  permanent gate.

## Remaining Open Work After Reassignment

| Backlog row | Owner | What remains |
|---:|---|---|
| #5 Public developer API | Claude Code when host/secrets are ready | Production host, keys, public URL, production smoke, future shared quota store. |
| #12 Holiday overlays | Codex | Final EN/HI phone/desktop bug bash and production verification. |
| #16/#17 Deep Muhurat parity | Claude Code | Reserved second independent bug bash, any fixes, production verification. |
| #29 Festival/vrat page quality | Codex batches + one later integration owner | Full page-quality audit/rewrite rounds and remaining festival hero batches. |
