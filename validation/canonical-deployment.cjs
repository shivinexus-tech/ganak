#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
assert.equal(fs.readFileSync('public/_redirects','utf8').trim(),'/* /index.html 200','SPA deep-link fallback missing');
const src=fs.readFileSync('src/metadata/route-metadata.ts','utf8');
assert(src.includes('https://ganak.pages.dev'),'current public fallback origin missing');
assert(src.includes('new URL(configured).origin'),'configured domain must be validated and normalized');
console.log('✓ canonical-deployment PASSED (deep-link fallback and validated configurable canonical origin)');
