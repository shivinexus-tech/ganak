#!/usr/bin/env node
'use strict';
/* One language per screen (owner, 2026-08-09: "i dont want a single hindi word on
 * english and vice versa").
 *
 * SectionHeader used to render the OTHER language as a muted subtitle:
 *     <span>{lang === "hi" ? hi : en}</span>
 *     <span …muted…>{lang === "hi" ? en : hi}</span>
 * That put Devanagari under every English heading and English under every Hindi one,
 * on every screen that uses the primitive. This gate stops the pattern coming back —
 * here or anywhere else that renders a bilingual pair.
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert');

const root = process.cwd();
const files = (function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) return walk(full);
    return /\.(tsx?|jsx?)$/.test(e.name) ? [full] : [];
  });
})(path.join(root, 'src'));

/* A ternary that resolves to the language NOT currently selected. Matches the shapes
   actually used in this codebase: `lang === "hi" ? en : hi`, `hi ? en : hi`,
   `lang==="hi"?en:hi`, and the deva/en naming used by the chart Eyebrow. */
const REVERSED = [
  /lang\s*===\s*["']hi["']\s*\?\s*en\s*:\s*hi\b/,
  /lang\s*!==\s*["']hi["']\s*\?\s*hi\s*:\s*en\b/,
  /lang\s*===\s*["']hi["']\s*\?\s*en\s*:\s*deva\b/,
  /\bhi\s*\?\s*en\s*:\s*hi\b/,
];

const offenders = [];
for (const file of files) {
  const rel = path.relative(root, file).split(path.sep).join('/');
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  lines.forEach((line, i) => {
    if (line.trim().startsWith('//') || line.trim().startsWith('*')) return;
    for (const re of REVERSED) {
      if (re.test(line)) offenders.push(`${rel}:${i + 1} → ${line.trim().slice(0, 100)}`);
    }
  });
}

assert.strictEqual(offenders.length, 0,
  `A heading renders the language the reader did NOT choose:\n  ${offenders.join('\n  ')}\n` +
  'Show one language per screen — the unselected string must not be printed as a subtitle.');

/* A header pinned to a literal language ignores the toggle entirely. MuhuratHub's
   SecHead did exactly this (lang="hi"), so "व्रत एवं पर्व", "मुहूर्त खोज" and "होरा"
   stayed Devanagari on the English page. */
const pinned = [];
for (const file of files) {
  const rel = path.relative(root, file).split(path.sep).join('/');
  const source = fs.readFileSync(file, 'utf8');
  const re = /<SectionHeader\b[^>]*\blang=\{?["'](hi|en)["']\}?/g;
  let m;
  while ((m = re.exec(source))) {
    const line = source.slice(0, m.index).split('\n').length;
    pinned.push(`${rel}:${line} → lang="${m[1]}" is hardcoded`);
  }
}
assert.strictEqual(pinned.length, 0,
  `A SectionHeader is pinned to one language and ignores the toggle:\n  ${pinned.join('\n  ')}\n` +
  'Pass the reader\'s lang through instead of a literal.');

/* Positive check: SectionHeader still renders the selected language, so this gate can
   never be satisfied by deleting the heading altogether. */
const prim = fs.readFileSync(path.join(root, 'src/components/ui-primitives.tsx'), 'utf8');
const body = (prim.split('export function SectionHeader')[1] || '').split('\nexport function')[0];
assert(body, 'SectionHeader not found in ui-primitives');
assert(/lang\s*===\s*["']hi["']\s*\?\s*hi\s*:\s*en/.test(body),
  'SectionHeader must still render the SELECTED language');
assert(!/\?\s*en\s*:\s*hi/.test(body),
  'SectionHeader must not render the unselected language');

console.log(`✓ header-language-purity: ${files.length} source files · 0 reversed-language headings`);
