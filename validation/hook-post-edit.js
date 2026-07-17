#!/usr/bin/env node
// Claude Code PostToolUse hook. Runs the gate after any edit to kundli-app.jsx.
// exit 0 = allow, exit 2 = block and feed stderr back to Claude so it must fix.
// No jq dependency — Node is already required by this project.
'use strict';
const { execSync } = require('child_process');

let raw = '';
process.stdin.on('data', d => (raw += d));
process.stdin.on('end', () => {
  let filePath = '';
  try { filePath = (JSON.parse(raw).tool_input || {}).file_path || ''; }
  catch { process.exit(0); }                       // unparseable payload: don't block
  if (!/kundli-app\.jsx$/.test(filePath)) process.exit(0);  // not our file

  try {
    execSync('node validation/parse-check.js kundli-app.jsx', { stdio: 'inherit' });
    process.exit(0);
  } catch {
    console.error('\nparse-check failed after your edit to kundli-app.jsx. Fix it before continuing.');
    process.exit(2);
  }
});
