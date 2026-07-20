# Ganak backend proxy

This is a small, standalone server for Ganak's future AI explanations. It keeps the Anthropic API key on the server, where website visitors cannot read it. The web app is **not connected to this server yet**.

## What it provides

- `POST /api/explain`
- `GET /health` — liveness probe for the host; reports *whether* a key is configured, never the key
- Anthropic Messages API proxying with the key read from `ANTHROPIC_API_KEY`
- local-development CORS access for `http://localhost:5173`
- per-IP in-memory rate limiting: 20 requests per 15 minutes, with `Retry-After`
- optional shared-secret gate (`API_SHARED_SECRET`), compared in constant time
- JSON errors in the consistent shape `{ "error": "...", "code": "..." }`
- no API keys, Anthropic response bodies, or stack traces returned to the browser
- `nosniff`, `no-referrer`, `DENY` framing and `no-store` on every response
- graceful shutdown on SIGTERM/SIGINT so a deploy does not cut off in-flight requests

The in-memory limiter is suitable for this foundation and a single running server. A later multi-instance production deployment should use a shared rate-limit store.

## ⚠️ Protecting spend

Every successful call to `/api/explain` costs money on the Anthropic account. Two things worth being clear about:

**CORS is not access control.** It stops *other websites* from calling this service from a visitor's browser. It does not stop `curl`, a script, or another server: those send no `Origin` header, and requests without an `Origin` must be allowed through — a same-origin deployment, where the app and this API share a domain, also sends no `Origin`, so requiring one would break the app.

**So the real controls are the rate limiter and `API_SHARED_SECRET`.** The limiter is per-IP, and IPs are cheap for anyone determined. Once this endpoint is public and spending real money, set `API_SHARED_SECRET` and have the caller send it as the `x-ganak-key` header. Leave it unset for local development.

## Verifying it (`npm run smoke`)

`npm run smoke` starts the server on a spare port and checks that each guard actually rejects what it claims to: missing/wrong shared secret, empty prompt, over-long prompt, bad language, malformed JSON, oversized body, disallowed origin, unknown route, missing security headers, and that no error response leaks the secret, the upstream host or a stack trace.

It needs **no Anthropic key** — every case is refused before the upstream call, so the suite costs nothing and is safe to run in CI.

## Run locally

Requirements: Node 18 or newer and an Anthropic API key.

From the repository root:

```bash
cd server
npm install
cp .env.example .env
```

Open `server/.env` and add the real key after `ANTHROPIC_API_KEY=`. Never put a real key in `.env.example` and never commit `.env`.

Start the server from inside `server/`:

```bash
npm start
```

Or start it from the repository root, as requested by the project foundation:

```bash
node server/index.js
```

The server listens on `http://localhost:3001` by default.

## Request contract

Send JSON with:

- `prompt` — required non-empty string, up to 12,000 characters
- `context` — optional string, object, array, number, or boolean containing Ganak-calculated data
- `language` — optional `"en"` or `"hi"`; defaults to `"en"`

Example:

```bash
curl -X POST http://localhost:3001/api/explain \
  -H 'Content-Type: application/json' \
  -d '{
    "prompt": "Explain this result simply.",
    "language": "en",
    "context": {
      "verdict": "Auspicious",
      "window": "11:59-12:54"
    }
  }'
```

Success:

```json
{
  "text": "The model's explanation appears here."
}
```

Errors always use:

```json
{
  "error": "A plain-language message.",
  "code": "STABLE_ERROR_CODE"
}
```

Common status codes are `400` for invalid input, `403` for a disallowed web origin, `413` for an oversized body, `429` for this server's rate limit, `502`/`504` for upstream failures, and `503` when the service has no key or Anthropic is busy.

## Environment settings

| Variable | Purpose | Default |
|---|---|---|
| `ANTHROPIC_API_KEY` | Secret Anthropic API key; required for explanations | none |
| `ANTHROPIC_MODEL` | Anthropic model identifier, changeable without editing code | `claude-sonnet-5` |
| `PORT` | Local server port | `3001` |
| `HOST` | Bind address. Leave unset for container hosts; set `127.0.0.1` when the host's own proxy sits in front | unset (all interfaces) |
| `ALLOWED_ORIGINS` | Comma-separated browser origins permitted by CORS | `http://localhost:5173` |
| `API_SHARED_SECRET` | When set, callers must send it as `x-ganak-key`. **Set this once the endpoint is public.** | unset (open) |
| `TRUST_PROXY` | Set to `1` only when the chosen host documents one trusted proxy hop | `0` |

On the model: `claude-sonnet-5` is the current general-purpose default and suits this task, which is bounded — explain already-calculated values in plain language. If explanations turn out to be high-volume, `claude-haiku-4-5-20251001` is the cheaper swap and needs no code change.

## Deploy later

The code is host-agnostic and does not assume a platform. Choosing between Vercel, Railway, Render, Cloudflare, or another host is the owner's decision. Before deploying:

1. add `ANTHROPIC_API_KEY` through the host's secret/environment settings;
2. set `ALLOWED_ORIGINS` to the final Ganak website origin (multiple origins are comma-separated);
3. **set `API_SHARED_SECRET`** and have the app send it — see "Protecting spend" above;
4. set the start command to `npm start` with `server/` as the service root, or `node server/index.js` from the repository root;
5. point the host's health check at `GET /health`;
6. follow the host's proxy documentation before setting `TRUST_PROXY=1`;
7. replace the in-memory limiter with a shared store if the service runs more than one instance;
8. run `npm run smoke` against the deployed URL's host, or at least locally, before announcing it.

Also worth setting a **billing alert on the Anthropic account** before this is publicly reachable. It is the backstop for everything above.

Do not expose the server's `.env` file, and do not place the API key in the React/Vite app or any variable beginning with `VITE_`.
