# Branded domain deployment

The app accepts a validated `VITE_CANONICAL_ORIGIN` at build time. Route-aware
canonical and Open Graph URLs use that origin; `https://ganak.pages.dev` remains the
honest fallback until the owner buys and approves a domain.

Cloudflare Pages deep-link fallback is provided by `public/_redirects`.

Row #39 still requires owner-controlled work: purchase/ownership review, DNS,
Cloudflare custom-domain attachment, HTTPS issuance, pages.dev-to-domain redirect,
and production checks for route/language preservation, search metadata, share
previews and error-reporting origin.
