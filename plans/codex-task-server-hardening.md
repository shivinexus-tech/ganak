# Codex task — harden the backend proxy (stay inside `server/`)

Read `.cursorrules` and `AGENTS.md`. You already built the `server/` foundation
(commit `1bf8495`). This continues it.

## Coordination — IMPORTANT
**Claude is refactoring ALL of `src/` right now (EPIC-SPLIT).** Work **only inside
`server/`**. Do **NOT** touch `src/`, `validation/`, or root config. `server/` is
a separate codebase, so you stay fully parallel with zero collision risk.

## Tasks (in priority order)

### 1. Make it testable
Add a minimal test suite for the proxy (node's built-in `node:test` is fine — avoid
adding heavy dependencies). Cover:
- Missing/blank API key → clean `{error, code}`, **never** a stack trace or key leak.
- Rate limiting actually trips after N requests.
- CORS rejects a disallowed origin, allows the configured one.
- Malformed JSON body → 400 with the error contract, not a crash.
Add `npm test` to `server/package.json`.

### 2. Deployment readiness (host-agnostic)
- A `server/DEPLOY.md` comparing the realistic free/cheap options (Vercel,
  Railway, Render, Fly, Cloudflare Workers) for this exact workload: **what each
  costs at low traffic, cold-start behaviour, and how each handles env secrets.**
  The owner's budget is ~$10–50/mo — be concrete about what's free vs paid.
- Whatever config file the recommended host needs (kept minimal).
- A health-check endpoint (`GET /health`) returning `{ok:true}` for uptime monitors.

### 3. Timeouts + resilience
- A request timeout on the upstream LLM call so a hung call can't pin a worker.
- Sensible max request body size.
- Graceful shutdown on SIGTERM (hosts send it on redeploy).

## Hard rules
- **Never commit a real API key** — `.env.example` placeholders only.
- Keep dependencies minimal; justify any new one in the README.
- Do not wire the server into the app — that's a later single-writer task.
- **Do not commit.** Leave for Claude to review, or open a branch.

## Definition of done
Tests pass (`npm test` in `server/`), `DEPLOY.md` gives the owner a concrete
hosting recommendation with real costs, `/health` works, timeouts + graceful
shutdown in place, no secrets committed, `src/` untouched.
