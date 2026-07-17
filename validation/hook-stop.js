#!/usr/bin/env node
// Claude Code Stop hook. Claude cannot declare "done" while the build is red.
// exit 2 = keep working. stop_hook_active guards against an infinite loop.
'use strict';
const fs = require('fs');
const { execSync } = require('child_process');

let raw = '';
process.stdin.on('data', d => (raw += d));
process.stdin.on('end', () => {
  try { if (JSON.parse(raw).stop_hook_active) process.exit(0); } catch { /* fall through */ }

  const checks = [
    'node validation/parse-check.js kundli-app.jsx',
    'node validation/ui-lint.js',
  ];
  // Prashna gates only apply once the engine is actually spliced in.
  if (fs.existsSync('kundli-app.jsx') &&
      fs.readFileSync('kundli-app.jsx', 'utf8').includes('END ENGINE')) {
    checks.push('node validation/prashna-calc.js');
    checks.push('node validation/prashna-parity.js kundli-app.jsx');
  }

  const failed = [];
  for (const c of checks) {
    try { execSync(c, { stdio: 'inherit' }); }
    catch { failed.push(c); }
  }
  if (failed.length) {
    console.error(`\nBuild is red — cannot finish. Failing checks:\n  ${failed.join('\n  ')}`);
    process.exit(2);
  }
  process.exit(0);
});
