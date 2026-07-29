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

## Production closeout — 2026-07-28

- Cloudflare deployed branded-origin commit `e6afa4e`.
- The apex returned HTTPS 200 for a Hindi Pongal deep link.
- `ganak.pages.dev` and `www.ganakapp.com` returned path/query-preserving 301s to
  the apex.
- Production EN/HI checks covered Daily, Prashna, Jyotish, Pongal, calculator
  catalogue/detail/not-found, Medical Muhurat and the Muhurat finder.
- Titles, Open Graph titles/URLs, canonicals and route heroes matched their product
  areas. The audit found and fixed generic calculator titles, invalid not-found
  canonicals and inherited Panchang heroes on Medical/Muhurat pages before closure.

Row #39 is complete. External DNS, search and social-preview caches can take time
to refresh, but they no longer require an application or Cloudflare change.
