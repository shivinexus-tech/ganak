#!/usr/bin/env node
'use strict';
/* Regenerate the committed screen baselines (VERIFY-SNAPSHOTS, backlog #65).
     node validation/snapshot-generate.cjs          # summary only
     node validation/snapshot-generate.cjs --write  # rewrite validation/snapshots/

   Never auto-writes on a normal run: a baseline must change only because a human
   meant it to, and the resulting diff IS the review artifact. */

const fs = require('fs');
const path = require('path');
const { freezeClock, C, card, PLACE, FIXTURE } = require('./_snapshot-env.cjs');
freezeClock(); // MUST precede any loadApp — modules capture Date at import time

const { renderScreenText } = require('./_snapshot-render.cjs');
const { ROOT, loadApp } = require('./_load-app.cjs');

const OUT_DIR = path.join(ROOT, 'validation', 'snapshots');
const noop = () => {};
const base = (lang) => ({ C, card, lang, place: PLACE, onPlace: noop });

/* Inner modules (BNN, Bhrigu, Rectify) are fed by their parent with a computed
   chart. That data is NOT fabricated here: it is the REAL engine run at the
   pinned fixture — the same composition snapshot-results.cjs uses. Computed once
   and cached, because computeKundli is the expensive part of this gate. */
let KUNDLI = null;
function kundli() {
  if (!KUNDLI) {
    const { computeKundli } = loadApp('src/engine/kundli.ts');
    KUNDLI = computeKundli({
      y: FIXTURE.y, m: FIXTURE.m, day: FIXTURE.day, hh: FIXTURE.hh, mi: FIXTURE.mi,
      tz: FIXTURE.tz, lat: FIXTURE.lat, lon: FIXTURE.lon, ayanamsa: FIXTURE.ayanamsa,
    });
  }
  return KUNDLI;
}

/* Birth form for the rectification workbench, pinned to the same fixture chart. */
const RECT_FORM = {
  date: `${FIXTURE.y}-${String(FIXTURE.m).padStart(2, '0')}-${String(FIXTURE.day).padStart(2, '0')}`,
  time: `${String(FIXTURE.hh).padStart(2, '0')}:${String(FIXTURE.mi).padStart(2, '0')}`,
};

/* Calculator routes come from the app's OWN router (utilityFromPath), never from
   hand-built objects — a route shape the router can't produce would prove nothing. */
const { utilityFromPath, UTILITY_CALCULATORS } = loadApp('src/data/utility-calculators.ts');
const utilityScreen = (key, pathname) => ({
  key, entry: 'src/screens/UtilityCalculatorScreen.tsx',
  props: (lang) => ({ ...base(lang), route: utilityFromPath(pathname) }),
});
const CALCULATOR_SCREENS = [
  utilityScreen('utility-catalogue', '/calculators'),
  utilityScreen('utility-notfound', '/calculator/numerology'),
  ...UTILITY_CALCULATORS.map((c) => ({
    ...utilityScreen(`utility-${c.slug}`, `/calculator/${c.slug}`),
    note: 'answer, method detail and report appear only after Calculate — not reachable by static render',
  })),
];

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

  /* Inner modules. The original skip note said these "need a pre-scanned calendar
     / rectification / BNN result from the parent", so fabricating one would prove
     nothing. Two thirds of that was wrong (checked 2026-08-18):
       · CalendarPage scans the year ITSELF, in a useMemo — and useMemo DOES run
         under renderToStaticMarkup. Nothing is fed to it but a view descriptor.
       · RectifyModule likewise sweeps, rectifies and builds its dasha timeline in
         its own useMemos from a birth form.
     Only BNN/Bhrigu really are parent-fed — and the parent feeds them the output of
     computeKundli, so the honest fix is to run the real engine at the pinned
     fixture rather than to invent a result. */
  { key: 'calendar-year', entry: 'src/screens/CalendarPage.tsx', exportName: 'CalendarPage',
    props: (lang) => ({ ...base(lang), view: { type: 'year' }, calendarMode: 'canonical', onBack: noop }) },
  { key: 'calendar-search', entry: 'src/screens/CalendarPage.tsx', exportName: 'CalendarPage',
    props: (lang) => ({ ...base(lang), view: { type: 'search', q: 'ekadashi' }, calendarMode: 'canonical', onBack: noop }),
    /* KNOWN DEFECT RECORDED, NOT BLESSED (2026-08-18): this baseline's 2027 rows
       carry wrong Ekadashi names — "Apara" twice in June, Yogini absent, Kamika
       and Aja each a lunar month late. Cause: src/engine/festivals.ts:576 names a
       fast's lunar month from the GREGORIAN month ((m - 1 + 9) % 12), which drifts
       apart from the real lunar month. A baseline is a record of what a reader
       sees, so the wrong names stay here until the engine is fixed — the fix will
       show up as the diff. See plans/audits/2026-08-18-snapshot-coverage-extension.md. */
    note: 'search results for the pinned query; typing further is a live interaction' },
  { key: 'rectify', entry: 'src/screens/RectifyScreen.tsx', exportName: 'RectifyModule',
    props: (lang) => ({ C, card, lang, place: PLACE, ayanamsa: FIXTURE.ayanamsa, form: RECT_FORM }),
    note: 'event-anchor rows appear only after the reader adds an event' },
  { key: 'bnn', entry: 'src/screens/JyotishBnnScreen.tsx', exportName: 'BNNModule',
    props: (lang) => { const r = kundli(); return { C, card, lang, bnn: r.bnn, rows: r.rows, tz: r.tz }; },
    note: 'read from Jupiter (the male default); switching the reference is an interaction' },
  { key: 'bhrigu', entry: 'src/screens/JyotishBnnScreen.tsx', exportName: 'BhriguModule',
    props: (lang) => { const r = kundli(); return { C, card, lang, rows: r.rows, ascSign: r.ascSign, birthMs: r.birthMs, tz: r.tz }; } },

  ...CALCULATOR_SCREENS,
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
