#!/usr/bin/env node
// ============================================================================
// validation/_load-app.cjs — shared loader for the validation harnesses.
//
// WHY THIS EXISTS
// The harnesses used to do `ts.transpileModule(oneBigFile)` and then append
// `module.exports = { ...internals }`. That only worked because the whole app
// lived in ONE flat scope. It cannot follow `import` statements, so it breaks
// the moment src/ is split into modules (EPIC-SPLIT).
//
// This bundles the entry point *with its imports* into CommonJS via esbuild
// (already present as a Vite dependency) and returns the real exports. It works
// identically before and after the split — so the gates keep protecting us
// through the whole refactor.
//
//   const { loadApp } = require('./_load-app.cjs');
//   const app = loadApp();            // default entry: src/kundli-app.tsx
//   app.scanPanchangCalendar(...)     // whatever the module exports
// ============================================================================
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

function loadApp(entry = 'src/kundli-app.tsx') {
  let esbuild;
  try { esbuild = require('esbuild'); }
  catch { console.error('validation: esbuild not found. Run `npm install` first.'); process.exit(1); }

  const entryAbs = path.isAbsolute(entry) ? entry : path.join(ROOT, entry);
  if (!fs.existsSync(entryAbs)) { console.error(`validation: no such entry: ${entryAbs}`); process.exit(1); }

  // Temp bundle must live INSIDE the project: it `require`s react at runtime, and
  // Node resolves node_modules relative to the file's own location.
  const tmp = path.join(__dirname, `.bundle-${process.pid}-${Date.now()}.tmp.cjs`);
  try {
    esbuild.buildSync({
      entryPoints: [entryAbs],
      outfile: tmp,
      bundle: true,
      format: 'cjs',
      platform: 'node',
      target: 'node18',
      jsx: 'transform',
      logLevel: 'silent',
      // React isn't needed to exercise the engine — leave it as a runtime require
      // so the bundle stays small and module-level code still evaluates.
      external: ['react', 'react-dom', 'react/jsx-runtime'],
    });
    return require(tmp);
  } finally {
    try { fs.unlinkSync(tmp); } catch (e) { /* temp file already gone */ }
  }
}

module.exports = { loadApp, ROOT };
