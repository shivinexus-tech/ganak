#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
/* The favicon 301 (CODEX-P2-FAVICON-FIX, live and production-verified) legitimately sits
   above the SPA fallback — Cloudflare takes the first matching rule, so a catch-all first
   would swallow it. Assert the contract instead of one exact file body: the SPA fallback
   must exist and must be the LAST rule, so nothing can ever be shadowed by it. */
const redirects = fs.readFileSync('public/_redirects', 'utf8').trim().split('\n').map((line) => line.trim()).filter(Boolean);
assert.ok(redirects.includes('/* /index.html 200'), 'SPA deep-link fallback missing');
assert.equal(redirects[redirects.length - 1], '/* /index.html 200', 'the SPA catch-all must stay last or it shadows every other rule');
const src=fs.readFileSync('src/metadata/route-metadata.ts','utf8');
assert(src.includes('DEFAULT_CANONICAL_ORIGIN = "https://ganakapp.com"'),'branded canonical fallback missing');
assert(src.includes('new URL(configured).origin'),'configured domain must be validated and normalized');
const html=fs.readFileSync('index.html','utf8');
assert(html.includes('<link rel="canonical" href="https://ganakapp.com/" />'),'static canonical must use branded domain');
assert(html.includes('<meta property="og:url" content="https://ganakapp.com/" />'),'static Open Graph URL must use branded domain');
const wrangler=JSON.parse(fs.readFileSync('wrangler.jsonc','utf8'));
assert.equal(wrangler.vars?.VITE_CANONICAL_ORIGIN,'https://ganakapp.com','Cloudflare canonical build variable missing');
console.log('✓ canonical-deployment PASSED (SPA fallback and branded canonical origin)');
