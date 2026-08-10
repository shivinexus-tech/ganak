'use strict';
/* Render a screen to the text a reader would see.
   renderToStaticMarkup runs NO effects and produces NO layout box — so this
   proves copy, labels and language, never overflow or contrast. Every report
   built on it must say so. */

const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { loadApp } = require('./_load-app.cjs');

const BLOCK = /<\/(p|div|li|tr|h[1-6]|section|article|header|footer|table|thead|tbody|button|label|option|summary|details|nav|span)\s*>/gi;

function toText(html) {
  return String(html)
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, '')
    .replace(BLOCK, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(Number(d)))
    .split('\n')
    .map((line) => line.replace(/[ \t ]+/g, ' ').trim())
    .filter(Boolean)
    .join('\n');
}

/* Screens call useComfort(), which throws outside ComfortProvider — the same wrapper
   src/main.tsx puts around the app.
   The provider MUST be bundled together with the screen. esbuild inlines a fresh
   React context object per bundle, so loading them separately gives the provider one
   context and the screen another, and useComfort still throws. One temp entry that
   imports both keeps them on the same context. */
const fs = require('fs');
const path = require('path');
const { ROOT } = require('./_load-app.cjs');

let seq = 0;
function loadScreenWithProvider(entry) {
  const rel = entry.replace(/^src\//, '').replace(/\.tsx?$/, '');
  const tmpRel = `src/.snapshot-entry-${process.pid}-${++seq}.tsx`;
  const tmpAbs = path.join(ROOT, tmpRel);
  fs.writeFileSync(tmpAbs,
    `export { ComfortProvider } from "./accessibility/ComfortProvider";\n` +
    `export { default as Screen } from "./${rel}";\n`, 'utf8');
  try {
    return loadApp(tmpRel);
  } finally {
    try { fs.unlinkSync(tmpAbs); } catch { /* already gone */ }
  }
}

function renderScreenText(entry, props) {
  const { ComfortProvider, Screen } = loadScreenWithProvider(entry);
  if (typeof Screen !== 'function') throw new Error(`no default export from ${entry}`);
  const tree = React.createElement(ComfortProvider, null, React.createElement(Screen, props));
  return toText(renderToStaticMarkup(tree));
}

module.exports = { toText, renderScreenText };
