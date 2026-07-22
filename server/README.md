# Ganak server — public API and AI proxy

Two separate things live here:

| | What | Auth | Cost per call |
|---|---|---|---|
| **`/v1/*`** | **Public developer API** — panchang, festivals, muhurat, hora, panchaka | per-key `x-api-key` | none (local computation) |
| `/api/explain` | AI explanation proxy (not wired to the app) | `x-ganak-key` shared secret | **real money** (Anthropic) |

---

# Public developer API (v1)

Read-only calculation endpoints backed by **the same engines as ganak.pages.dev**.
`server/api/engines.mjs` bundles `src/engine/*` at startup with esbuild rather than
reimplementing anything, so the API cannot drift from the website — there is one
implementation of the astronomy, not two.

**No personal data.** A request carries a place and a date; a response carries a
calculation. Nothing is stored. That keeps the API outside the privacy surface
described in `plans/legal-privacy-terms-draft.md`.

## Quick start

```bash
curl -H "x-api-key: YOUR_KEY" \
  "http://localhost:3001/v1/panchang?date=2026-07-19&lat=28.61&lon=77.21&tz=Asia/Kolkata"
```

```json
{
  "version": "v1",
  "query": { "lat": 28.61, "lon": 77.21, "tz": "Asia/Kolkata", "date": "2026-07-19", "ayanamsa": "lahiri" },
  "panchang": {
    "paksha": "Shukla Paksha",
    "tithi": [{ "name": "Shashthi", "endsAt": "2026-07-19T22:00:47.983Z" }],
    "nakshatra": [{ "name": "Uttara Phalguni", "endsAt": "2026-07-19T12:41:50.647Z" }],
    "month": { "amanta": "Ashadha", "purnimanta": "Ashadha", "isAdhikMasa": false },
    "sun": { "rise": "2026-07-19T00:05:27.249Z", "set": "2026-07-19T13:49:33.064Z", "sign": "Karka" },
    "inauspicious": { "rahuKalam": { "from": "...", "to": "..." } }
  }
}
```

## Endpoints

Full machine-readable description: **`GET /v1/openapi.json`** (public, no key needed).

| Endpoint | Returns |
|---|---|
| `GET /v1/panchang` | Tithi, nakshatra, yoga, karana, paksha, lunar month, samvat, sun/moon timings, auspicious and inauspicious windows |
| `GET /v1/festivals` | Fasts and festivals in a range, each with its `decidingKala` |
| `GET /v1/muhurat` | One date, or ranked days across a range for an activity |
| `GET /v1/hora` | The twelve daytime planetary hours |
| `GET /v1/panchaka` | Lagna schedule and Panchaka Rahita windows |
| `GET /v1/me` | Your key's name and remaining quota — does not consume quota |
| `GET /v1/` | Endpoint discovery |

Common parameters: `lat`, `lon` (required), `tz` (IANA, default `UTC`), `date` or
`from`/`to` as `YYYY-MM-DD` between 1900 and 2100, `ayanamsa` (`lahiri` default, or `kp`).

## Contract guarantees

These are promises, enforced by `npm run smoke:api`:

- **Instants are always ISO 8601 UTC strings**, never epoch milliseconds.
- **Windows are always `{ from, to }`.**
- **Errors are always `{ error, code }`** — match on `code`, never on the message.
  No stack traces, file paths, upstream hostnames or key material ever appear.
- **Responses never expose engine internals.** Everything crossing the boundary is
  mapped in `server/api/contract.mjs`, so an internal rename breaks a test here rather
  than someone's integration.
- **Deterministic**: identical inputs give byte-identical output, so responses are
  safe to cache.

## Conventions and limits — stated, not implied

- **Lahiri (Chitrapaksha) ayanamsa by default**, matching Drik Panchang's default and
  the rest of Ganak. `ayanamsa=kp` selects the Krishnamurti value, 5′48″ smaller.
- **Regional variation is real.** Hindu observance dates legitimately differ by region
  and sampradaya. `decidingKala` is returned on every observance precisely so a
  difference from another panchang can be explained rather than guessed at.
- **Not a religious authority.** For an observance that matters, users should confirm
  with their family tradition or local acharya.

## Authentication and quotas

Send your key as the **`x-api-key`** header.

Keys come from the `API_KEYS` environment variable:

```
API_KEYS=[{"key":"...","name":"acme","quotaPerDay":1000}]
```

A bare comma-separated list also works for local use and gets `API_DEFAULT_QUOTA`.

Every response carries `X-Quota-Limit`, `X-Quota-Remaining` and `X-Quota-Reset`
(UTC midnight). Over quota returns **429 `QUOTA_EXCEEDED`** with `Retry-After`.
There is also a per-key burst limit, `API_RATE_PER_MIN` (default 60), returning
**429 `RATE_LIMITED`**.

### ⚠️ v1 limits an operator must know

- **Keys live in an env var, not a database.** Rotating a key means editing the
  variable and restarting. Deliberate: the API has no datastore, and quietly inventing
  one was the wrong call to make here.
- **Quotas are counted in memory, per process.** Correct for a single instance. A
  multi-instance deployment needs a shared store, or each instance will grant the full
  quota independently.
- Both are the same limitation the AI proxy's rate limiter has, and both should be
  revisited together when a datastore exists.

## Verifying it

```bash
npm run smoke:api
```

43 checks over real HTTP: auth rejection, the published shape of every endpoint,
ISO/window conventions, no-internals-leaked, determinism, all eleven validation error
codes, error non-leakage, JSON 404, quota enforcement and isolation between keys, and
security headers. Needs **no** API key of any kind and costs nothing.

---

# AI proxy (`/api/explain`)

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
