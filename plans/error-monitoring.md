# Ganak — Phase 1 error monitoring

**Task:** `CURSOR-P1-ERROR-MONITOR`  
**Goal:** Phone crashes must not be invisible. Capture failures without ads,
analytics cookies, or browser storage.

## What shipped in the app

- Tiny reporter: `src/monitoring/error-reporter.ts`
  - Posts crash payloads to Sentry’s store API when `VITE_SENTRY_DSN` is set at
    **build** time.
  - No `@sentry/*` SDK (avoids sessionStorage / session tooling).
  - No `localStorage` / `sessionStorage`.
  - Sends only: error type/message, truncated stack, path (no query string),
    release tag, and optional React component stack.
  - Does **not** send place names, birth data, Prashna questions, or URL prefs.
  - Rate-limited in memory (~8s) so a tight loop cannot flood.
- React safety net: `src/components/AppErrorBoundary.tsx` — bilingual full-page
  recovery (“Try again” / “Reload”), never a blank white screen.
- Wired from `src/main.tsx` (global `error` + `unhandledrejection` listeners).

Without a DSN the reporter is a silent no-op — local `npm run dev` stays clean.

## Owner setup (one-time, ~10 minutes)

1. Create a free Sentry account → new **Browser JavaScript** project named `ganak`.
2. Copy the **DSN** (looks like `https://abc…@o123.ingest.sentry.io/456`).
3. In **Cloudflare Pages → ganak → Settings → Environment variables**:
   - Name: `VITE_SENTRY_DSN`
   - Value: the DSN
   - Apply to **Production** (and Preview if you want preview crash reports).
4. Trigger a new production deploy (empty commit or “Retry deployment”) so Vite
   inlines the DSN into the built JS. Changing the env alone does not update an
   already-built bundle.
5. Smoke-test: open https://ganak.pages.dev, temporarily force an error in DevTools
   (`throw new Error("ganak-sentry-smoke")` in the console after load), confirm
   the event appears in Sentry within a minute.

## Build verification

The reporter must use a direct `import.meta.env.VITE_SENTRY_DSN` reference. Vite
cannot inline the value if `import.meta.env` is hidden inside a string or dynamic
`Function(...)` call. The regression check is:

```bash
node validation/error-monitoring-config.cjs
```

For a build-time injection check, build with a non-secret test DSN and pass the
same value to the gate. The gate reports only pass/fail; it never prints the DSN.

## Privacy

Update the published privacy note when the DSN is live: crash reports may leave
the device only when something fails. Draft already adjusted in
`plans/legal-privacy-terms-draft.md`. Still **no analytics** and **no ads**.

## Out of scope (separate backlog items)

- Product analytics / feedback form
- Server/proxy monitoring (`server/` is not production yet)
