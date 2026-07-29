#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
assert.equal(fs.readFileSync('public/_redirects','utf8').trim(),'/* /index.html 200','SPA deep-link fallback missing');
const src=fs.readFileSync('src/metadata/route-metadata.ts','utf8');
assert(src.includes('DEFAULT_CANONICAL_ORIGIN = "https://ganakapp.com"'),'branded canonical fallback missing');
assert(src.includes('new URL(configured).origin'),'configured domain must be validated and normalized');
const html=fs.readFileSync('index.html','utf8');
assert(html.includes('<link rel="canonical" href="https://ganakapp.com/" />'),'static canonical must use branded domain');
assert(html.includes('<meta property="og:url" content="https://ganakapp.com/" />'),'static Open Graph URL must use branded domain');
const wrangler=JSON.parse(fs.readFileSync('wrangler.jsonc','utf8'));
assert.equal(wrangler.vars?.VITE_CANONICAL_ORIGIN,'https://ganakapp.com','Cloudflare canonical build variable missing');
console.log('✓ canonical-deployment PASSED (SPA fallback and branded canonical origin)');
