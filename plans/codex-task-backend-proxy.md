# Codex task — Backend proxy foundation (new `server/` folder, separate codebase)

Read `.cursorrules` and `AGENTS.md`. This is **new infrastructure in a NEW folder**,
completely separate from the app — which is exactly why it's safe to build in
parallel while Cursor edits `src/kundli-app.tsx`.

## Why this exists (context)
The web app runs entirely in the browser, so it CANNOT safely hold a secret API
key (anyone can read a web page's code). Future AI features (chart explanation,
natural-language muhurat search) need to call an LLM, which needs a key. The fix is
a small server that holds the key: the app calls the server, the server calls the
LLM. This is the "backend proxy" (Phase 4 on the roadmap, built ahead now because
it's a clean separate-file parallel task and it unblocks the highest-value features).

## Coordination
- **Create everything under a new `server/` directory. Do NOT touch
  `src/kundli-app.tsx` or anything under `src/` or `validation/`.** Cursor owns the
  app file. Zero overlap.
- **Do not commit.** Leave the new folder uncommitted for Claude to review + commit.

## Task — build a minimal, runnable proxy
- A small **Node + Express** (or Fastify) server in `server/`, hosting-agnostic
  (runs locally with `node server/index.js`; deployable later to a free tier).
- **One endpoint** to start: `POST /api/explain` that accepts a JSON body, reads the
  LLM key from an **environment variable** (never hardcoded — use a `.env.example`
  showing `ANTHROPIC_API_KEY=` but never a real key), calls the Anthropic Messages
  API, and returns the model's text response.
- **CORS** allowing the local dev origin (`http://localhost:5173`).
- **Basic rate limiting** (per-IP, simple in-memory is fine for the foundation) so a
  future public deploy isn't trivially abused.
- **A clear error contract** (JSON `{ error, code }`), and it must not leak the key
  or stack traces to the client.
- `server/package.json`, `server/README.md` (how to run + deploy), `.env.example`.
- **Do NOT wire it into the app yet** — this is the standalone foundation. The app
  integration is a separate later task (single-writer on the app file).

## Hard rules
- **Never commit a real API key.** Only `.env.example` with a placeholder.
- Keep it minimal and readable — a foundation, not a framework.
- Note in the README: hosting choice (Vercel/Railway/Render/Cloudflare) is the
  owner's decision; keep the code host-agnostic.

## Definition of done
`server/` runs locally, `POST /api/explain` proxies to the LLM using an env-var key,
CORS + rate limit + safe errors in place, README + `.env.example` present, app
untouched, nothing committed. Tell the owner it's ready for review.
