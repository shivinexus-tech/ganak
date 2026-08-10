#!/usr/bin/env node
'use strict';
/* Regenerate the committed screen baselines (VERIFY-SNAPSHOTS, backlog #65).
     node validation/snapshot-generate.cjs          # summary only
     node validation/snapshot-generate.cjs --write  # rewrite validation/snapshots/

   Never auto-writes on a normal run: a baseline must change only because a human
   meant it to, and the resulting diff IS the review artifact. */

const fs = require('fs');
const path = require('path');
const { freezeClock, C, card, PLACE } = require('./_snapshot-env.cjs');
freezeClock(); // MUST precede any loadApp — modules capture Date at import time

const { renderScreenText } = require('./_snapshot-render.cjs');
const { ROOT } = require('./_load-app.cjs');

const OUT_DIR = path.join(ROOT, 'validation', 'snapshots');
const noop = () => {};
const base = (lang) => ({ C, card, lang, place: PLACE, onPlace: noop });

/* Screens rendered in their INITIAL state. renderToStaticMarkup runs no effects
   and no handlers, so anything that appears only after the reader acts is covered
   by snapshot-results.cjs instead. `note` records why, so the coverage claim stays
   honest rather than implied. */
const SCREENS = [
  { key: 'daily', entry: 'src/screens/DailyScreen.tsx', props: base },
  { key: 'personalize', entry: 'src/screens/PersonalizeScreen.tsx',
    props: (lang) => ({ ...base(lang), onLanguage: noop, onClearPreferences: noop, onBack: noop }) },
  { key: 'prashna', entry: 'src/screens/PrashnaScreen.tsx', props: base,
    note: 'verdict appears only after casting — covered by result snapshots' },
  { key: 'chart', entry: 'src/screens/ChartScreen.tsx', props: (lang) => ({ C, card, lang }),
    note: 'chart body appears only after a cast — covered by result snapshots' },
  { key: 'matching', entry: 'src/screens/MatchingScreen.tsx', props: base,
    note: 'Dashakoota appears only after both charts are entered' },
  { key: 'medical', entry: 'src/screens/MedicalMuhuratScreen.tsx', props: base },
  /* Not standalone screens: these are inner modules that a parent feeds with
     already-computed data (a scanned calendar, a rectification run, a BNN result).
     Rendering them would mean fabricating that data, which proves nothing about
     what a reader sees. Recorded as skips so the coverage claim stays honest. */
  { key: 'calendar', entry: 'src/screens/CalendarPage.tsx', exportName: 'CalendarPage',
    skip: 'inner module — needs a pre-scanned calendar from its parent' },
  { key: 'rectify', entry: 'src/screens/RectifyScreen.tsx', exportName: 'RectifyModule',
    skip: 'inner module — needs a rectification result from its parent' },
  { key: 'bnn', entry: 'src/screens/JyotishBnnScreen.tsx', exportName: 'BNNModule',
    skip: 'inner module — needs a computed BNN result from its parent' },
];

const LANGS = ['en', 'hi'];

function generate({ write }) {
  const out = new Map();
  for (const s of SCREENS) {
    if (s.skip) continue;
    for (const lang of LANGS) {
      let text;
      try {
        text = renderScreenText(s.entry, s.props(lang), s.exportName);
      } catch (e) {
        text = `RENDER ERROR: ${String(e && e.message).split('\n')[0]}`;
      }
      out.set(`${s.key}.${lang}`, text);
    }
  }

  const { generateResults } = require('./snapshot-results.cjs');
  for (const [key, text] of generateResults()) out.set(key, text);

  if (write) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
    for (const [key, text] of out) {
      fs.writeFileSync(path.join(OUT_DIR, `${key}.txt`), text + '\n', 'utf8');
    }
  }
  return out;
}

if (require.main === module) {
  const write = process.argv.includes('--write');
  const map = generate({ write });
  const errors = [...map.entries()].filter(([, v]) => v.startsWith('RENDER ERROR'));
  for (const [k, v] of errors) console.error(`  ${k}: ${v}`);
  const skipped = SCREENS.filter((s) => s.skip);
  console.log(`${write ? 'wrote' : 'generated'} ${map.size} snapshots · ${SCREENS.length - skipped.length} screens × ${LANGS.length} languages + results · ${errors.length} render error(s)`);
  for (const s of skipped) console.log(`  skipped ${s.key}: ${s.skip}`);
  console.log('NOTE: rendered TEXT only — this proves copy and language, never layout or overflow.');
  if (errors.length) process.exit(1);
}

module.exports = { SCREENS, LANGS, generate, OUT_DIR };
