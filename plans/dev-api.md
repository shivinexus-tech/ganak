# Public developer API — build record (CLAUDE-P0-DEV-API)

Built 2026-07-22. Reference docs: `server/README.md`. Spec: `GET /v1/openapi.json`.

---

## The decision that shaped everything else

The API **bundles `src/engine/*` at startup with esbuild** rather than reimplementing
or copying any astronomy (`server/api/engines.mjs`). Same trick
`validation/_load-app.cjs` already uses to let the gates test real app code.

Why it matters: **the API cannot silently disagree with the website**, because there
is only one implementation of the calculations. The alternative — a server-side copy
of the maths — would have drifted the first time anyone touched an engine, and the
divergence would have surfaced as a support complaint rather than a failing test.

Verified rather than assumed. API output for 19 Jul 2026, New Delhi, against what
ganak.pages.dev renders for the same day:

| | Website | API |
|---|---|---|
| Tithi | Shashthi till 3:30 AM | Shashthi till 3:30 am ✓ |
| Sunrise / sunset | 5:35 AM → 7:19 PM | 5:35 am → 7:19 pm ✓ |
| Nakshatra | Uttara Phalguni till 6:11 PM | Uttara Phalguni till 6:11 pm ✓ |
| Rahu Kalam | 5:36 PM–7:19 PM | 5:36 pm–7:19 pm ✓ |
| Abhijit | 12:00 PM–12:54 PM | 12:00 pm–12:54 pm ✓ |

Exact on every value.

## What was built

| Piece | File |
|---|---|
| Engine bridge | `server/api/engines.mjs` |
| Public response contract | `server/api/contract.mjs` |
| Key auth + daily quotas | `server/api/keys.mjs` |
| Routes + validation | `server/api/v1.mjs` |
| OpenAPI 3.1 spec | `server/api/openapi.mjs` |
| Contract/security tests | `server/api-smoke.mjs` (`npm run smoke:api`) |
| Wiring, rate limit, quota headers | `server/index.js` |

Seven endpoints: `panchang`, `festivals`, `muhurat`, `hora`, `panchaka`, `me`, plus
discovery at `/v1/`.

### Contract, not internals

Every value crossing the boundary is mapped in `contract.mjs`. Engine objects are
never returned directly, because a published API is a promise and the engines are
free to change. An internal rename now breaks a test in this repo instead of
somebody's integration.

Three conventions enforced by tests: instants are **ISO 8601 UTC** (never epoch ms),
windows are **`{from,to}`**, errors are **`{error,code}`** with a stable code.

Guessing the shapes would have shipped four bugs — the engines return
`{fasts,festivals}` not an array of days, hora yields `ruler` not `planet`, panchaka
returns a **sign index** rather than a name, and `dayHoras` takes `(weekday, rise, set)`
rather than a place. All four were caught by inspecting real output before writing the
mapping.

## Verification

`npm run smoke:api` — **43/43 passing**, over real HTTP, no key of any kind required,
zero cost:

- auth: missing key, wrong key, standard error shape, supplied key never echoed back
- every path in the OpenAPI spec answers 200 (the spec cannot list a route that does
  not exist without failing)
- published shape: versioned, echoes query, ISO instants, `{from,to}` windows, no
  engine internals (`tithis`/`yogasP`/`choghaDay` absent)
- determinism: identical inputs → byte-identical output, so responses are cacheable
- all eleven validation codes: `MISSING_DATE`, `INVALID_DATE`, `DATE_OUT_OF_RANGE`,
  `MISSING_PLACE`, `INVALID_LAT`, `INVALID_LON`, `INVALID_TZ`, `INVALID_AYANAMSA`,
  `DAYS_OUT_OF_RANGE`, `INVALID_RANGE`, plus JSON 404
- errors carry no stack frames or filesystem paths
- quotas: headers present, exhaustion → 429 `QUOTA_EXCEEDED` with `Retry-After`, and
  one key's exhaustion does not affect another
- `/v1/me` reports quota without exposing the raw key
- security headers: `nosniff`, `no-store`, no `x-powered-by`

Sandbox note: the sandbox cannot bind sockets, so the suite was executed by running
the server through the Browser-pane launch config and driving every check from a real
browser origin. Same approach that previously exposed two real CORS bugs the CLI-only
tests had missed.

## ⚠️ Deliberate v1 limits — an operator must know these

1. **Keys live in an env var, not a database.** Rotation = edit and restart. The API
   has no datastore, and quietly inventing one was not the right call to make inside
   this task.
2. **Quotas are in-memory, per process.** Correct for a single instance; a
   multi-instance deployment will grant the full quota per instance. Needs a shared
   store, alongside the same fix for the AI proxy's rate limiter.
3. **Not deployed.** Hosting is the owner's decision and `P1-HIDE-DEPLOY` covers the
   web app only. The API runs locally and is ready to deploy; nothing about it assumes
   a platform.
4. **esbuild is now a server dependency** and `src/engine/*` must be present at
   runtime. A future optimisation is a prebuilt engine bundle at deploy time; not done
   because runtime bundling costs ~1s once at startup and keeps deployment simple.

## Not in scope here

Billing, usage dashboards, per-endpoint pricing, key self-service, SDKs, and the
public developer portal. All belong with Phase 4 monetization, not with a working v1.
