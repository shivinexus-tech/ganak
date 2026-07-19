# Ganak backend proxy

This is a small, standalone server for Ganak's future AI explanations. It keeps the Anthropic API key on the server, where website visitors cannot read it. The web app is **not connected to this server yet**.

## What it provides

- `POST /api/explain`
- Anthropic Messages API proxying with the key read from `ANTHROPIC_API_KEY`
- local-development CORS access for `http://localhost:5173`
- per-IP in-memory rate limiting: 20 requests per 15 minutes
- JSON errors in the consistent shape `{ "error": "...", "code": "..." }`
- no API keys, Anthropic response bodies, or stack traces returned to the browser

The in-memory limiter is suitable for this foundation and a single running server. A later multi-instance production deployment should use a shared rate-limit store.

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
| `ANTHROPIC_MODEL` | Anthropic model identifier, changeable without editing code | `claude-sonnet-4-20250514` |
| `PORT` | Local server port | `3001` |
| `ALLOWED_ORIGINS` | Comma-separated browser origins permitted by CORS | `http://localhost:5173` |
| `TRUST_PROXY` | Set to `1` only when the chosen host documents one trusted proxy hop | `0` |

## Deploy later

The code is host-agnostic and does not assume a platform. Choosing between Vercel, Railway, Render, Cloudflare, or another host is the owner's decision. Before deploying:

1. add `ANTHROPIC_API_KEY` through the host's secret/environment settings;
2. set `ALLOWED_ORIGINS` to the final Ganak website origin (multiple origins are comma-separated);
3. set the start command to `npm start` with `server/` as the service root, or `node server/index.js` from the repository root;
4. follow the host's proxy documentation before setting `TRUST_PROXY=1`;
5. replace the in-memory limiter with a shared store if the service runs more than one instance.

Do not expose the server's `.env` file, and do not place the API key in the React/Vite app or any variable beginning with `VITE_`.
