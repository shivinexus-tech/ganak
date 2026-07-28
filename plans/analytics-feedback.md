# Analytics and feedback deployment

Ganak now has a privacy-limited integration seam; it is disabled unless production
provides `VITE_ANALYTICS_ENDPOINT` and `VITE_FEEDBACK_ENDPOINT`.

Allowed analytics events are fixed in `src/telemetry/privacy-events.ts`. Properties
are restricted to area/action/language/outcome. Query strings, city, coordinates,
birth details, email, cookies and browser storage are not sent.

The feedback form sends only the typed message (maximum 2,000 characters) and the
current path. It tells users not to include email and fails visibly when no endpoint
is configured.

Before row #38 can close, the owner must choose/configure the endpoints, update the
published privacy notice, verify the production dashboard, and complete a no-PII
network audit plus an independent privacy bug bash.
