#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const src=fs.readFileSync('src/metadata/route-metadata.ts','utf8');
for(const route of ['daily','prashna','chart']) assert(src.includes(`${route}:`),`metadata missing ${route}`);
for(const field of ['document.title','description','canonical','og:title','og:description','og:url']) assert(src.includes(field),`metadata writer missing ${field}`);
assert(src.includes('VITE_CANONICAL_ORIGIN'),'canonical origin must be deployment-configurable');
assert(src.includes('festival')&&src.includes('utility')&&src.includes('medical')&&src.includes('muhurat'),'special routes must receive distinct metadata');
assert(src.includes('utility.kind === "calculator"')&&src.includes('utility.calculator'),'calculator routes must use their resolved calculator identity');
assert(src.includes('item.blurbHi')&&src.includes('item.blurbEn'),'calculator routes must use their own bilingual descriptions');
assert(src.includes('Astrology Calculators | Ganak')&&src.includes('Calculator not found | Ganak'),'calculator catalogue and not-found routes need distinct identity');
const html=fs.readFileSync('index.html','utf8');
assert(html.includes('rel="canonical"')&&html.includes('property="og:title"'),'static fallback metadata missing');
console.log('✓ route-metadata PASSED (route identity, bilingual title/description, canonical and Open Graph coverage)');
