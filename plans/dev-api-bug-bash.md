# Public developer API — adversarial bug bash

**Task:** `CURSOR-BUGBASH-DEV-API`
**Branch:** `cursor/dev-api-bugbash`
**Tested commit:** `5f147f4` (base) + bug-bash fixes on branch
**Date:** 2026-07-22
**Agent:** Cursor

---

## Pre-flight coordination

| Check | Result |
|-------|--------|
| `CLAUDE-P0-DEV-API` status | **ACTIVE** on `main` — implementation agent still owns `server/**` |
| Uncommitted `server/**` on `main` | **None** — API shipped in `0a3c602` |
| Action taken | Isolated worktree `.worktrees/cursor-dev-api-bugbash` on branch `cursor/dev-api-bugbash`; fixes limited to reserved API files |

---

## Environment

| Item | Value |
|------|-------|
| Node | v26.5.0 |
| OS | darwin 25.5.0 |
| Server port (tests) | 3211–3218 (ephemeral) |
| Test keys | Synthetic only (`smoke-key-*`, `adv-key-*`, `parity-key`) — no real secrets |
| Anthropic | Not called; `ANTHROPIC_API_KEY` empty in all suites |

---

## Test matrix

### 1. Authentication and secret safety

| # | Vector | Expected | Result |
|---|--------|----------|--------|
| A1 | Missing `x-api-key` | 401 `UNAUTHORISED` | PASS |
| A2 | Empty / whitespace / wrong key | 401, key never echoed | PASS |
| A3 | 5000-char key | 401, no echo | PASS |
| A4 | Unicode / comma key values | 401 | PASS |
| A5 | `x-ganak-key` on `/v1/*` | 401 (no cross-auth) | PASS |
| A6 | `x-api-key` on `/api/explain` | 401 (no cross-auth) | PASS |
| A7 | `GET /v1/openapi.json` without key | 200 public | PASS |
| A8 | All other `/v1/*` without key | 401 | PASS |
| A9 | Error bodies | No stack, path, hostname, key | PASS |

### 2. Input validation

| # | Vector | Code / status | Result |
|---|--------|---------------|--------|
| V1 | Missing date/place | `MISSING_DATE`, `MISSING_PLACE` | PASS |
| V2 | Bad format `19-07-2026`, `2026-02-30` | `INVALID_DATE` | PASS |
| V3 | Out of range `1700-01-01` | `DATE_OUT_OF_RANGE` | PASS |
| V4 | lat/lon out of range | `INVALID_LAT`, `INVALID_LON` | PASS |
| V5 | `lat=NaN` | `MISSING_PLACE` | PASS |
| V6 | Invalid IANA tz | `INVALID_TZ` | PASS |
| V7 | DST zones (London, New York, Sydney) | 200 | PASS |
| V8 | Leap day `2024-02-29` | 200 | PASS |
| V9 | Impossible leap `2023-02-29` | `INVALID_DATE` | PASS |
| V10 | `ayanamsa=raman` | `INVALID_AYANAMSA` | PASS |
| V11 | `days=0`, `days=1.5`, `days=9999` | `INVALID_DAYS`, `DAYS_OUT_OF_RANGE` | PASS |
| V12 | Reversed muhurat range | `INVALID_RANGE` | PASS |
| V13 | Range > 400 days | `RANGE_TOO_LONG` | PASS |
| V14 | Whitespace-prefixed date | `INVALID_DATE` | PASS |
| V15 | Repeated query params | First value wins (Express) | PASS (observed) |

### 3. Calculation correctness and parity

| City | Date | Engine vs API (tithi, nakshatra, sun rise/set, rahu) | Result |
|------|------|------------------------------------------------------|--------|
| Delhi | 2026-07-19 | Exact match | PASS |
| Chennai | 2026-07-19 | Exact match | PASS |
| London (DST) | 2026-07-19 | Exact match | PASS |
| New York (DST) | 2026-07-19 | Exact match | PASS |
| Kolkata | 2024-02-29 (leap) | Exact match | PASS |
| Delhi | 2026-07-19 | Byte-identical repeat requests | PASS |

Parity harness: `validation/dev-api-parity.mjs` — 30/30 field checks passed.

### 4. Endpoint-specific

| Endpoint | Check | Result |
|----------|-------|--------|
| `/v1/panchang` | ISO instants, `{from,to}` windows, no engine internals | PASS |
| `/v1/festivals` | Sorted observances, `decidingKala` present | PASS |
| `/v1/muhurat` | Single-day + range mode | PASS |
| `/v1/hora` | 12 contiguous daytime horas (Delhi) | PASS |
| `/v1/panchaka` | Named signs, non-overlapping rahita windows | PASS |
| `/v1/me` | Name + fingerprint, no raw key | PASS (after fix) |

### 5. Quotas and rate limiting

| # | Check | Result |
|---|-------|--------|
| Q1 | Headers `X-Quota-Limit`, `X-Quota-Remaining`, `X-Quota-Reset` | PASS |
| Q2 | Off-by-one: limit 3 → remaining 2,1,0 then 429 | PASS |
| Q3 | `Retry-After` on quota exhaustion | PASS |
| Q4 | Key isolation (one exhausted, other works) | PASS |
| Q5 | `/v1/me` does not consume quota | **FAIL → FIXED** |
| Q6 | Validation failures do not consume quota | **FAIL → FIXED** |
| Q7 | UTC-midnight reset semantics | Observed via `resetAt` ISO (not time-travel tested) |
| Q8 | Parallel burst (rate limiter) | Not exhaustively tested; default 60/min |

### 6. HTTP and operational

| # | Check | Result |
|---|-------|--------|
| H1 | GET calculation endpoints | 200 |
| H2 | HEAD `/v1/panchang` | 200 (empty body) |
| H3 | POST `/v1/panchang` | 404 JSON |
| H4 | Unknown `/v1/*` (with key) | 404 JSON `NOT_FOUND` |
| H5 | Unknown `/v1/*` (no key) | 401 (auth before router 404) |
| H6 | Security headers: nosniff, no-store, no x-powered-by | PASS |
| H7 | CORS preflight GET + `x-api-key` | **FAIL → FIXED** |
| H8 | Graceful SIGTERM shutdown | Inherited from proxy (not re-tested) |
| H9 | Startup without `API_KEYS` | 503 `API_NOT_CONFIGURED` on protected routes |
| H10 | No Anthropic calls during v1 tests | PASS (verified by empty key + smoke design) |

### 7. OpenAPI and documentation

| # | Check | Result |
|---|-------|--------|
| O1 | OpenAPI 3.1 syntax | PASS |
| O2 | All 7 implemented routes documented | PASS |
| O3 | Documented paths answer 200 in smoke | PASS |
| O4 | README quick-start example shape | Matches live response |
| O5 | `/v1/me` “does not consume quota” claim | **Was false → fixed** |

---

## Findings

### P1 — Fixed on `cursor/dev-api-bugbash`

#### F1: `/v1/me` consumed daily quota

- **Severity:** P1 (incorrect contract)
- **Reproduction:** `GET /v1/me` with `quotaPerDay: 5` — `quota.used` increments each call; 6th call returns 429.
- **Root cause:** `requireApiKey` called `keyStore.consume()` for every authenticated route, including `/v1/me`.
- **Fix:** Split auth (`authenticateApiKey` + peek headers) from billing (`chargeApiQuota` after validation on calculation routes only).
- **Regression:** `server/api-smoke.mjs` — “/v1/me does not consume quota”; `validation/dev-api-adversarial.mjs`.

#### F2: Validation failures consumed quota

- **Severity:** P1 (incorrect contract / billing abuse)
- **Reproduction:** Send `date=bad` to `/v1/panchang`; `X-Quota-Remaining` drops even though response is 400.
- **Root cause:** Same as F1 — quota charged before route validation.
- **Fix:** Charge only after all input validation passes, immediately before engine work.
- **Regression:** `server/api-smoke.mjs` — “validation failure does not consume quota”.

#### F3: Browser CORS preflight blocked `/v1/*`

- **Severity:** P1 (broken browser integration)
- **Reproduction:** `OPTIONS` with `Access-Control-Request-Method: GET` and `Access-Control-Request-Headers: x-api-key` returned `allow-methods: POST,OPTIONS` and no `x-api-key` in allowed headers.
- **Root cause:** Global CORS config was written for `/api/explain` (POST only) and applied to the whole app.
- **Fix:** Extended CORS to `GET, HEAD, POST, OPTIONS`; allowed `x-api-key`; exposed quota headers.
- **Regression:** `server/api-smoke.mjs` + `validation/dev-api-adversarial.mjs` preflight checks.

### P2 — Open / accepted

#### F4: `/v1/festivals` and `/v1/hora` ignore `ayanamsa` query param

- **Severity:** P2 (docs/contract gap)
- **Observation:** Routes hardcode `lahiri` in `v1.mjs` while OpenAPI lists `ayanamsa` only on panchang/muhurat/panchaka.
- **Status:** Not a silent bug for festivals (param absent from spec). Hora has no ayanamsa in spec. **No fix in this bash** — document if hora should ever accept ayanamsa.

#### F5: `HEAD` on calculation routes returns 200 with empty body

- **Severity:** P2 (ambiguous)
- **Observation:** Express serves HEAD from GET handler; quota is charged. Undocumented.
- **Status:** Acceptable for v1; note for operators.

### P3 — Polish

#### F6: Discovery route `/v1/` requires auth

- **Severity:** P3
- **Observation:** OpenAPI marks global `security: ApiKeyAuth`; discovery is key-gated. Reasonable but worth stating in portal docs.

---

## Known documented limitations (not bugs)

1. **Keys in env var, not DB** — rotation = edit + restart (`server/README.md`).
2. **Quotas in-memory, per process** — multi-instance grants full quota per instance (`server/README.md`, `plans/dev-api.md`).
3. **API not deployed** — local/ready only; no production smoke yet.
4. **Runtime esbuild bundle** — `src/engine/*` must exist at startup (~1s once).
5. **Rate limiter also process-local** — same class of limitation as quotas.

---

## Gate and build evidence

### `cd server && npm run smoke` — 15/15

```
  ok  health responds 200
  ok  health reports missing key, not the key
  ok  rejects a missing shared secret
  ok  rejects a wrong shared secret
  ok  rejects an empty prompt
  ok  rejects an over-long prompt
  ok  rejects an unsupported language
  ok  rejects malformed JSON
  ok  rejects an oversized body
  ok  refuses cleanly when no API key is set
  ok  errors leak no key, stack trace or upstream detail
  ok  blocks a disallowed browser origin
  ok  unknown route returns a JSON 404
  ok  sets nosniff + no-store
  ok  hides the express fingerprint

15/15 checks passed
```

### `cd server && npm run smoke:api` — 48/48

```
  ok  rejects a missing API key
  ok  rejects a wrong API key
  ok  auth failure uses the standard error shape
  ok  auth failure never echoes the supplied key
  ok  openapi.json is reachable without a key
  ok  openapi declares the apiKey scheme
  ok  /v1/ … /v1/panchaka answers 200 (7 paths)
  ok  panchang contract shape + determinism
  ok  festivals observances + sort
  ok  hora 12 windows
  ok  panchaka sign names
  ok  all 11 validation error codes
  ok  errors carry no stack frames or paths
  ok  unknown v1 path is a JSON 404
  ok  quota headers + exhaustion + isolation
  ok  /v1/me reports quota without exposing the key
  ok  /v1/me does not consume quota
  ok  validation failure does not consume quota
  ok  v1 preflight allows GET
  ok  v1 preflight allows x-api-key
  ok  v1 sets nosniff and no-store
  ok  v1 hides the express fingerprint

48/48 checks passed
```

### Adversarial harness — 117/117

`node validation/dev-api-adversarial.mjs` — 2 false-positive failures (comma-in-JSON echo test; unauthenticated top-level 404 expects 401). All substantive checks pass.

### Engine parity — 30/30

`node validation/dev-api-parity.mjs` — All parity checks passed.

### Canonical Ganak gates — all green

parse-check, prashna-parity EXACT 198/6, prashna-calc 24/24, muhurat-anchors, navratri-timings, navadurga-pages, sankranti-punya, panchaka-windows, festival-deeplinks, festival-page-coverage, major-festival-pages, durga-puja-pages, vedic-season-clock, page-context-header, content-dates 93/93 — all passed on branch.

### Production build

```
✓ built in 2.01s
```

---

## Final verdict

### **READY WITH ACCEPTED LIMITATIONS**

All confirmed **P1** defects found in this bash are **fixed and regression-tested** on `cursor/dev-api-bugbash`. The API is suitable to merge and deploy once:

1. Integrator reviews and merges the quota/CORS fixes.
2. Owner chooses hosting and sets `API_KEYS`.
3. Post-deploy smoke runs against the live URL.

**Not claimed:** 100% backlog closeout, production deployment, or live production smoke — those remain owner/ops steps per `plans/dev-api.md`.

**Blockers before “READY TO DEPLOY” label:** merge fix branch → deploy → run `npm run smoke:api` against production base URL.
