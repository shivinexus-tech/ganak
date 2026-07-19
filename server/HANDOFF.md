# Ganak backend proxy — reviewer handoff

**Prepared for:** Claude Code / owner review  
**Status:** complete standalone foundation, uncommitted  
**Scope:** all work is inside `server/`; no app integration was attempted

## Why this was built

The browser app cannot safely contain an Anthropic API key because visitors can inspect browser-delivered code. This standalone Node server keeps the key outside the app and provides one controlled endpoint for future Ganak AI explanations.

The React app is intentionally **not connected yet**. Integration belongs to a later single-writer task on `src/kundli-app.tsx`.

## Files added

| File | Purpose |
|---|---|
| `server/index.js` | Express server, `/api/explain`, Anthropic proxy, validation, CORS, rate limiting and safe errors |
| `server/package.json` | Standalone Node package and start commands |
| `server/package-lock.json` | Reproducible dependency versions |
| `server/.env.example` | Safe environment-variable template with no real key |
| `server/.gitignore` | Prevents `.env`, `node_modules` and npm debug logs from being committed |
| `server/README.md` | Non-technical local setup, API contract and host-agnostic deployment guidance |

## Endpoint contract

### `POST /api/explain`

Request body:

```json
{
  "prompt": "Explain this result simply.",
  "language": "en",
  "context": {
    "verdict": "Auspicious",
    "window": "11:59-12:54"
  }
}
```

- `prompt`: required non-empty string; maximum 12,000 characters
- `context`: optional JSON value or string; maximum 32,000 serialized characters
- `language`: optional `en` or `hi`; defaults to `en`

Success:

```json
{
  "text": "Plain-language model response."
}
```

Every failure follows one stable shape:

```json
{
  "error": "Plain-language message.",
  "code": "STABLE_ERROR_CODE"
}
```

## Security and cost controls

- The key is read only from `ANTHROPIC_API_KEY` on the server.
- No real key or `server/.env` file was created.
- `.env` is explicitly ignored by Git.
- The browser cannot choose the model, output-token limit or system instruction.
- Requests are limited to 20 per IP per 15 minutes.
- Request and context sizes are bounded.
- Only configured browser origins are accepted; the default is `http://localhost:5173`.
- Anthropic response bodies, API keys and stack traces are never returned to clients.
- Logs contain only generic failure descriptions and upstream HTTP status numbers—never prompts, context or keys.
- The Anthropic call has a 30-second timeout.
- The model is configurable through `ANTHROPIC_MODEL` without source edits.

## Anthropic request behavior

The proxy sends:

- `POST https://api.anthropic.com/v1/messages`
- `x-api-key` from `ANTHROPIC_API_KEY`
- `anthropic-version: 2023-06-01`
- a server-controlled model and `max_tokens`
- a Ganak-specific system instruction enforcing answer-before-data and forbidding invented astronomical values or festival dates

The default model is `claude-sonnet-4-20250514`, but it can be changed through the environment before deployment.

## Local verification performed

Dependencies installed successfully:

```text
added 72 packages
found 0 vulnerabilities
```

Server syntax and secret checks:

```text
✓ no Anthropic key value found
✓ no server/.env file present
✓ server/index.js syntax is valid
```

Local endpoint smoke tests:

| Scenario | Result |
|---|---|
| Valid request without a configured key | `503 SERVICE_NOT_CONFIGURED` |
| Missing prompt | `400 INVALID_PROMPT` |
| Malformed JSON | `400 INVALID_JSON` |
| Disallowed browser origin | `403 CORS_NOT_ALLOWED` |
| Preflight from `http://localhost:5173` | `204`, correct CORS headers |
| Unknown route | `404 NOT_FOUND` |
| Rate-limit headers | Present; limit reported as 20 per 900 seconds |

No live paid Anthropic response was requested because no real API key was supplied. The upstream call and response parsing are implemented, but a reviewer with a development key should perform one final live smoke test before app integration.

## Existing Ganak validation evidence

The standard app gates were run even though no app file was intentionally edited:

```text
✓ parse-check clean
✓ Prashna parity EXACT: 198 values across 6 charts; 0 mismatches
✓ Prashna calculation: 24 pass / 0 fail
✓ Muhurat anchors passed: recall at least 80% for every category
✓ Tier-2 solar/nakshatra anchors: 7/7
✓ Festival day-part anchors: 17/17
✓ Ayyappa day counter and boundaries matched
```

## Important repository coordination note

`src/kundli-app.tsx` became modified by another active session while this server task was in progress. Codex did not edit it. The intended Codex changes are only the new files under `server/`.

Review with:

```bash
git status --short --untracked-files=all
git diff -- src validation
```

Do not include the concurrent `src/kundli-app.tsx` change in the backend commit unless its owning session has handed it off separately.

## Reviewer checklist

1. Confirm all new files are under `server/`.
2. Confirm `.env.example` contains no key and `server/.env` does not exist.
3. Review the request limits and the 20-per-15-minute rate limit.
4. Decide whether the default model is appropriate for expected cost and quality; deployment can override it without editing code.
5. Run `cd server && npm start` and repeat the no-key smoke test.
6. Optionally add a temporary development key through `server/.env`, perform one successful explanation, then remove `.env` before handoff.
7. Review and commit only after the owner approves.

## Deliberately deferred

- No changes under `src/` or `validation/`
- No frontend call to `/api/explain`
- No hosting-platform decision or deployment files
- No user accounts, billing or chart persistence
- No distributed rate-limit store for multi-instance hosting
- No production monitoring or failure analytics

These are separate roadmap decisions. The current server is intentionally a minimal, host-agnostic foundation.
