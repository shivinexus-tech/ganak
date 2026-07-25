# Public developer API — deployment

**Backlog item:** #5 · **Task:** `CURSOR-P0-DEV-API-DEPLOY-01`

The web app stays on **Cloudflare Pages** (`https://ganak.pages.dev`). The API is a
separate **Node/Express** service in `server/` that bundles `src/engine/*` at startup.
It cannot run on Pages; deploy it as its own container/web service.

---

## Recommended host (v1)

**Render** (free web service + Docker) — `render.yaml` at repo root.

Alternatives with the same `Dockerfile`: Railway, Fly.io, Google Cloud Run, any host
that runs a Node 20 container and sets environment variables.

---

## One-time setup (owner)

1. Open [Render Dashboard](https://dashboard.render.com/) → **New** → **Blueprint**.
2. Connect the `shivinexus-tech/ganak` repo and apply `render.yaml`.
3. Generate a production API key (do not commit it):

   ```bash
   node -e "console.log(require('crypto').randomBytes(24).toString('hex'))"
   ```

4. In Render → **ganak-api** → **Environment**, set:

   | Variable | Example |
   |----------|---------|
   | `API_KEYS` | `[{"key":"<paste-key>","name":"production","quotaPerDay":1000}]` |
   | `PUBLIC_API_URL` | `https://ganak-api.onrender.com` (your actual Render URL) |
   | `ALLOWED_ORIGINS` | `https://ganak.pages.dev` (already in blueprint) |
   | `TRUST_PROXY` | `1` (already in blueprint) |

5. Wait for the first deploy. Render health check: `GET /health`.
6. Run production smoke from your machine:

   ```bash
   export PATH="/opt/homebrew/bin:$PATH"
   GANAK_API_BASE_URL=https://<your-service>.onrender.com \
   GANAK_API_KEY=<paste-key> \
   node scripts/dev-api-production-smoke.mjs
   ```

7. Optional: add a custom domain (e.g. `api.ganak.pages.dev` is **not** automatic —
   use Render custom domain or Cloudflare DNS CNAME to Render).

---

## Local container check (before pushing)

```bash
export PATH="/opt/homebrew/bin:$PATH"
docker build -t ganak-api .
docker run --rm -p 8080:8080 \
  -e API_KEYS='[{"key":"local-docker","name":"docker","quotaPerDay":1000}]' \
  -e ALLOWED_ORIGINS=http://localhost:5173 \
  ganak-api
```

In another terminal:

```bash
curl -s -H "x-api-key: local-docker" \
  "http://127.0.0.1:8080/v1/panchang?date=2026-07-19&lat=28.61&lon=77.21&tz=Asia/Kolkata" | head
```

First request may take ~2s while esbuild bundles engines.

---

## What “done” means for backlog #5

- [ ] Service deployed and reachable on HTTPS
- [ ] `API_KEYS` set in host secrets (not in git)
- [ ] `PUBLIC_API_URL` matches live base URL
- [ ] `scripts/dev-api-production-smoke.mjs` passes against production
- [ ] `plans/backlog-acceptance-register.md` row #5 updated with live URL evidence

**Still documented limitations after deploy:** per-process quotas, env-var key rotation,
no developer portal — see `server/README.md`.

---

## `/api/explain` (AI proxy)

Not required for the public **calculation API**. If you later expose `/api/explain`:

- set `ANTHROPIC_API_KEY` in the host
- set `API_SHARED_SECRET` and send it as `x-ganak-key`
- set a billing alert on the Anthropic account

Leave both unset for calculation-only v1.
