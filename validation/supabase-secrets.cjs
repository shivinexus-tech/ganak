#!/usr/bin/env node
'use strict';
// Security gate: the Supabase SERVICE key (and any service_role token) must NEVER ship
// in the built client bundle. Also: no `VITE_`-prefixed service key in source (Vite would
// inline that into the browser). Run after `npm run build`.
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');

// 1) Source must not define a VITE_-prefixed service key anywhere (that would inline to client).
const grepSrc = (dir, re, hits) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name === 'dist' || e.name.startsWith('.')) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) grepSrc(p, re, hits);
    else if (/\.(ts|tsx|js|jsx|mjs|cjs)$/.test(e.name)) {
      const t = fs.readFileSync(p, 'utf8');
      if (re.test(t)) hits.push(path.relative(root, p));
    }
  }
  return hits;
};
const viteServiceHits = grepSrc(path.join(root, 'src'), /VITE_[A-Z_]*SERVICE[A-Z_]*KEY/, []);
assert.strictEqual(viteServiceHits.length, 0,
  `client-inlined service key in source: ${viteServiceHits.join(', ')}`);

// 2) If a build exists, the client bundle must not contain the service key name/role token.
const dist = path.join(root, 'dist');
if (fs.existsSync(dist)) {
  const bad = [];
  const scan = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) scan(p);
      else if (/\.(js|html|css)$/.test(e.name)) {
        const t = fs.readFileSync(p, 'utf8');
        if (t.includes('SUPABASE_SERVICE_KEY') || /"role"\s*:\s*"service_role"/.test(t) || t.includes('service_role')) {
          bad.push(path.relative(root, p));
        }
      }
    }
  };
  scan(dist);
  assert.strictEqual(bad.length, 0, `service key/role leaked into client bundle: ${bad.join(', ')}`);
  console.log('supabase-secrets: OK (bundle scanned, no service key/role leak)');
} else {
  console.log('supabase-secrets: OK (source clean; run after `npm run build` to scan the bundle)');
}
