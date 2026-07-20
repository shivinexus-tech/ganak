# Ganak Phase 1 web deployment

## Production

- Public URL: https://ganak.pages.dev
- Host: Cloudflare Pages (Free)
- Cloudflare project: `ganak`
- Source repository: `shivinexus-tech/ganak`
- Production branch: `main`
- Build command: `npm run build`
- Build output directory: `dist`
- Root directory: repository root
- Backend status: not deployed and not connected; `server/` remains a separate future service.

Cloudflare's GitHub app is restricted to the Ganak repository. Every push to
`main` now starts an automatic production build. Pull-request and non-production
branches can receive preview deployments without replacing production.

## Redeploy

Normal redeployment needs no hosting command:

1. Merge validated code into `main` and push it to GitHub.
2. Cloudflare Pages automatically runs `npm run build`.
3. When the build succeeds, https://ganak.pages.dev updates automatically.

To check a deployment, open Cloudflare Dashboard → Workers & Pages → `ganak` →
Deployments. A failed build does not replace the last working production version.

Before merging a launch change, run `npm run build` locally plus the validation
gates required by `AGENTS.md`.

## Launch verification — 2026-07-19

Production was checked at a 390 × 844 phone viewport:

- Daily loaded with New Delhi panchang data.
- The Phase 1 navigation contained Daily and Prashna only; no Chart button.
- A live General Prashna produced a verdict and supporting reasons.
- Legacy `?screen=chart` links fell back to Daily instead of exposing Chart.
- Browser console errors: 0.

## Follow-up copy found during smoke testing

Daily still contains the pre-existing hint “Cast your chart in the Chart tab.”
The Chart tab is intentionally hidden in Phase 1, so the Daily-screen owner should
replace or hide that hint in a separate UI task. This deployment task did not edit
`src/kundli-app.tsx` or Cursor's extracted screens.
