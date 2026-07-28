# Cursor — bug bash brief: Public developer API (v1)

**Task ID:** `CURSOR-BUGBASH-DEV-API` · **Owner-assigned 2026-07-24**
**Time:** 30 focused minutes minimum. **Target:** local `server/` on `127.0.0.1` (not deployed)
**Code:** `server/index.js`, `server/api/*` (read-only for bash agent)

---

## Your job is to break it, not to confirm it works

`CLAUDE-P0-DEV-API` built the API and `npm run smoke:api` already passes **44/44**.
That is exactly why implementer testing does not count as a bug bash. Find what the
contract tests missed.

**Do not fix non-trivial product defects** — log them for `CLAUDE-P0-DEV-API` or a
follow-up fix task. Trivial harness fixes in `validation/` are OK.

---

## High-value attack vectors

### 1. Quota accounting 🔴
- `/v1/me` is documented and in OpenAPI as **not consuming quota** — verify.
- Do **400 validation failures** consume quota?
- Do **404 unknown /v1/*** paths consume quota?
- When quota is exhausted, can `/v1/me` still report state?

### 2. Auth separation 🔴
- `x-api-key` must not work on `/api/explain`.
- `x-ganak-key` must not work on `/v1/*`.
- API key must not be accepted via query string.

### 3. Rate limit vs quota
- `API_RATE_PER_MIN` should return `RATE_LIMITED`, distinct from `QUOTA_EXCEEDED`.
- Per-key rate limit should not let one key exhaust another's minute window.

### 4. Contract parity
- OpenAPI documents `ayanamsa` on `/v1/festivals` — does the handler honour it?
- Every documented path returns the published `{ error, code }` shape on failure.
- Errors never echo keys, stack frames or filesystem paths.

### 5. CORS and browser callers
- Disallowed `Origin` must fail (403 `CORS_NOT_ALLOWED`).
- Allowed origin GET to `/v1/panchang` succeeds.

### 6. Edge inputs
- High latitude (Reykjavik), leap day, DST boundaries, `days` at max (400).
- Oversized query strings; scientific-notation `lat` (`1e2`).

---

## Gates (after any trivial fix)

```bash
cd server && npm run smoke:api   # expect 44/44
cd server && npm run smoke       # proxy guards if shell allows bind
```

---

## Report

Add `CURSOR-BUGBASH-DEV-API` to `plans/task-log.md` with minutes spent, vectors
attacked, and every finding (P0/P1/P2). Reopen backlog item **#5** until P0/P1 are
closed or accepted.
