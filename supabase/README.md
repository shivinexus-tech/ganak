# Supabase — Ganak general datastore

Ganak's persistence layer (owner decision, `plans/ganak-architecture-audit-pinned.md` §5.2a/§5.4 +
2026-08-02 extension). Spec: `docs/superpowers/specs/2026-08-02-supabase-datastore-foundation-spec.md`.
Plan: `docs/superpowers/plans/2026-08-02-supabase-datastore-p0-plan.md`.

## Guardrails (do not break)

- Panchang stays **anonymous & on-device**. **Birth details are NEVER sent to Supabase.**
- **No login for feedback.** Feedback/events are anonymous, no PII.
- The **service key never appears in the client bundle** — only in Cloudflare Function env / `.dev.vars`.
- **RLS default-deny on every table.** The anon (browser) path can never insert; only the Function
  (service role, which bypasses RLS) can.

## Keys — where each goes

Owner creates a Supabase project (region **ap-south-1 / Mumbai**, free tier) and gets three values:

| Value | Goes to | Used by |
|-------|---------|---------|
| `SUPABASE_URL` | Cloudflare Pages env (Prod + Preview) **and** `VITE_SUPABASE_URL` app env | Function + client |
| `SUPABASE_ANON_KEY` | `VITE_SUPABASE_ANON_KEY` app env | client (future direct reads) |
| `SUPABASE_SERVICE_KEY` | Cloudflare Pages **secret** (Prod + Preview) — **server only** | `/api/feedback` Function |

Local dev: create a git-ignored `.dev.vars` at the repo root:
```
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_SERVICE_KEY=<service-role-key>
```
Never commit `.dev.vars`.

## Apply the migration

Either:
- **Supabase CLI:** `supabase db push` (with the project linked), or
- **SQL editor:** paste `supabase/migrations/0001_feedback_events.sql` into the Supabase SQL editor and run.

Confirm `public.feedback` and `public.events` exist with **RLS enabled**.

## Review feedback (owner)

```bash
export SUPABASE_URL=... SUPABASE_SERVICE_KEY=...
node scripts/export-feedback.mjs
```
Writes `feedback/aarti-corrections.jsonl` (git-ignored) — one JSON row per submission with
slug + lang + suggestion + route, newest first. Review, correct the aarti source, done.
