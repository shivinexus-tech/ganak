# Analytics and feedback deployment

## Final owner decisions — 2026-07-28

- **Product analytics and replay:** PostHog Cloud EU (Frankfurt).
- **Feedback, protected research data and future account/profile data:** Supabase
  South Asia (Mumbai).
- **Hosting, DNS and edge controls:** Cloudflare Pages on `ganakapp.com`.
- **Automation:** Codex/Claude may read aggregate PostHog dashboards and produce a
  daily anomaly note plus a weekly navigation/retention recommendation. An agent
  may recommend a pivot; it must not deploy one automatically.
- **Authentication later:** optional Google sign-in through Supabase Auth. Ganak
  will not create a default library of birth charts. A signed-in user may instead
  choose regional, sampradaya and spiritual-interest preferences.
- **Notice:** describe collection once in the general privacy policy and keep a
  persistent Privacy link/opt-out control. Do not interrupt every calculator or
  form with repeated notices.

These are approved product decisions, not evidence that the services are live.
Production remains disabled until the projects, keys, policy and audit below exist.

## Collection boundary

PostHog will run cookieless (`cookieless_mode: "always"`), with IP capture disabled,
global autocapture enabled and session replay enabled. This preserves the project's
ban on cookies, `localStorage` and `sessionStorage`.

Replay is for navigation and UX observation, including Kundli, Matching, Prashna
and calculators, but it is **private by default**:

- mask every input value;
- strip every query string before capture;
- do not capture network request/response bodies;
- mask question text, names, email, birth date/time/place and generated personal
  results in PostHog;
- retain safe interface structure, labels, clicks, scrolls, dead clicks, rage
  clicks, route names, language and success/failure outcomes.

This is not "replay disabled." It lets the owner and an AI agent see where a user
went, what control they used and where they got stuck without turning the general
analytics dashboard into a searchable birth/question archive. PostHog documents
that browser-side masking prevents masked values from being sent at all.

Precise place, question text or correctness fixtures that the owner wants for
research belong in a separate Supabase research table with restricted access,
shorter retention and an explicit `research_use` record. They must never be copied
into PostHog event properties, replay, URLs or person profiles.

Retention is fixed at 12 months for PostHog aggregate events, 30 days for session
replays, and 24 months for volunteered feedback/research records. Deletion requests
must remove the matching Supabase record; no indefinite raw-data archive.

The first research library is **spiritual activity**, not people's birth charts:
region, language, sampradaya/tradition, observances followed, reminder choices,
Shravana/Savan interests, completed activities and volunteered feedback. Raw chart
inputs/results are excluded unless a later, separately reviewed research workflow
is deliberately added.

## Existing repository seam

`src/telemetry/privacy-events.ts` currently exposes only a fixed event dictionary
and stays disabled without `VITE_ANALYTICS_ENDPOINT`. Properties are restricted to
area/action/language/outcome. `FeedbackCard` is visible but cannot deliver without
`VITE_FEEDBACK_ENDPOINT`.

The provider integration must preserve the fixed manual events while adding
PostHog's safe autocapture/replay configuration and a Supabase feedback function.
Provider project keys belong in Cloudflare environment variables; no secret key may
ship in the browser bundle.

## Required dashboards and agent reports

Initial PostHog views:

1. Landing area → next area → useful action → result/feedback funnel.
2. Navigation paths by language, device class and anonymous new/returning cohort.
3. Dead clicks, rage clicks, repeated Back/Forward and abandoned forms.
4. Festival/observance interest by region/language, starting with Shravana/Savan.
5. Calculator/Muhurat completion and visible failure outcomes, never raw inputs.

Daily agent note: new breakage, sharp funnel changes and privacy anomalies only.
Weekly agent note: the three strongest behavior patterns, evidence, confidence,
recommended IA/personalization experiment and a clear "do not conclude" section.

## Closure checklist for row #38

- Create the owner-controlled PostHog EU project and Supabase Mumbai project.
- Publish the approved general privacy wording and opt-out route before collection.
- Configure PostHog cookieless/IP-off/private-by-default capture.
- Create least-privilege Supabase feedback and research tables/functions.
- Connect Cloudflare public environment variables; keep server secrets server-side.
- Verify dashboard events, one replay and one delivered feedback message.
- Prove full query strings and sensitive input/result values are absent on the wire.
- Run the mandatory independent privacy bug bash.
