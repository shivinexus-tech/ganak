# Branded domain deployment

Canonical host: `https://ganakapp.com`.

The app accepts a validated `VITE_CANONICAL_ORIGIN` at build time and also uses
`https://ganakapp.com` as its checked-in fallback. Route-aware canonical and Open
Graph URLs use that origin. Cloudflare Pages deep-link fallback is provided by
`public/_redirects`.

## Cloudflare state — 2026-07-28

- The owner controls `ganakapp.com`.
- Cloudflare Pages project `ganak` has `ganakapp.com` and `www.ganakapp.com` attached.
- Proxied apex and `www` CNAME records point to `ganak.pages.dev`.
- Google Trust Services certificates are issued for both branded hosts.
- Active rule `ganak_canonical_redirect_rule` permanently redirects
  `ganak.pages.dev` and `www.ganakapp.com` to `https://ganakapp.com`.
- Redirects preserve the page path and query string. Verified examples:
  `/festival/pongal?lang=hi` and `/muhurat?lang=hi`.

Row #39 still requires the post-deployment production matrix: branded-host deep
links in both languages, route-aware canonical/Open Graph output, share preview,
and error-reporting origin.
