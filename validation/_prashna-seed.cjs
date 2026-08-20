'use strict';
/* Render the Prashna RESULT surface — the verdict card, the plain-language lines,
   the graha / cuspal / significator tables and the Ruling Planets panel.

   WHY THIS EXISTS. `renderToStaticMarkup` runs no handlers, so the committed screen
   baseline (validation/snapshots/prashna.*.txt) only ever saw the EMPTY FORM: 37
   lines ending at "Ask now", with no occurrence of "favourable", "lagna", "cusp" or
   "sub-lord" anywhere in it. Every one of the seventeen findings in the 2026-08-18
   KP horary bug bash lived on the surface that baseline could not see, and all
   seventeen passed all nine Prashna gates. This closes that hole the same way
   snapshot-results.cjs closed it for the matching screen.

   The reading is built by PrashnaScreen's OWN `PR_buildResult` — the function
   `ask()` calls — so the baseline records the shipping composition rather than a
   hand-assembled object that could drift away from it. Only the state slots are
   seeded; every string on the page comes from the shipping JSX.

   The interception keys on `useState('time')`, the `mode` slot: it is the only
   string slot in this screen initialised to 'time', and it is the first hook
   PrashnaScreen declares, so it marks where the component's own hook sequence
   begins and the remaining slots are seeded by their initial values (not by call
   order), which stays correct if the screen gains or reorders state. */

const fs = require('fs');
const path = require('path');
const { loadApp, ROOT } = require('./_load-app.cjs');
const { toText } = require('./_snapshot-render.cjs');
const { C, card } = require('./_snapshot-env.cjs');

/* One bundle for the screen, the engine exports and ComfortProvider: esbuild inlines
   a fresh React context per bundle, so a separately-loaded provider gives the screen
   a different context and useComfort() throws (see _snapshot-render.cjs). */
let CACHE = null;
function mod() {
  if (CACHE) return CACHE;
  const tmpRel = `src/.prashna-seed-${process.pid}.tsx`;
  const tmpAbs = path.join(ROOT, tmpRel);
  fs.writeFileSync(tmpAbs,
    'export { ComfortProvider } from "./accessibility/ComfortProvider";\n' +
    'export { default as Screen, PR_buildResult, QUESTIONS } from "./screens/PrashnaScreen";\n', 'utf8');
  try { CACHE = loadApp(tmpRel); } finally { try { fs.unlinkSync(tmpAbs); } catch { /* gone */ } }
  return CACHE;
}

/* Pinned judgment moments and places. Declared inputs, not captured sky. */
const READINGS = [
  { key: 'number', label: 'KP number 139, marriage, New Delhi',
    mode: 'number', number: 139, topic: 'marriage',
    ms: Date.UTC(2026, 7, 18, 6, 30), lat: 28.6139, lon: 77.2090, zone: 'Asia/Kolkata',
    placeLabel: 'New Delhi' },
  { key: 'time', label: 'time mode, health, New Delhi',
    mode: 'time', topic: 'health',
    ms: Date.UTC(2026, 7, 18, 6, 30), lat: 28.6139, lon: 77.2090, zone: 'Asia/Kolkata',
    placeLabel: 'New Delhi' },
  { key: 'polar', label: 'time mode, career, Tromso (equal-house fallback)',
    mode: 'time', topic: 'career',
    ms: Date.UTC(2026, 7, 18, 12, 0), lat: 69.6496, lon: 18.9560, zone: 'Europe/Oslo',
    placeLabel: 'Tromso' },
];

function buildReading(r) {
  const { PR_buildResult, QUESTIONS } = mod();
  const q = QUESTIONS.find((x) => x.key === r.topic);
  if (!q) throw new Error(`no Prashna topic "${r.topic}"`);
  return PR_buildResult({ ms: r.ms, lat: r.lat, lon: r.lon, zone: r.zone,
    placeLabel: r.placeLabel, mode: r.mode, number: r.number, q });
}

/* `showFull` opens the astrologer tables; the reading is `locked` because a cast
   reading always is (bug bash F10). Everything else keeps its shipped default. */
function renderReading(r, lang) {
  const React = require('react');
  const { renderToStaticMarkup } = require('react-dom/server');
  const { ComfortProvider, Screen } = mod();
  const result = buildReading(r);

  const realUseState = React.useState;
  let inScreen = false, seeded = 0;
  React.useState = function seededUseState(init) {
    if (init === 'time') { inScreen = true; return realUseState(r.mode); }
    if (!inScreen) return realUseState(init);
    seeded += 1;
    if (seeded === 1 && init === null) return [r.topic, () => {}];        // selected
    if (seeded === 2 && init === '') return [r.mode === 'number' ? String(r.number) : '', () => {}]; // numberInput
    if (seeded === 3 && init === null) return [r.unlocked ? null : result, () => {}];  // result
    if (seeded === 5) return [true, () => {}];                            // showFull — open the tables
    if (seeded === 7 && init === false) return [!r.unlocked, () => {}];    // locked — a cast reading always is
    if (seeded === 8 && init === false) return [!!r.override, () => {}];  // useCustom — the judgment-place panel
    if (seeded === 12 && init === '' && r.override) return [r.override.when || '', () => {}];  // customWhen
    if (seeded === 13 && r.override && 'zone' in r.override) return [r.override.zone, () => {}]; // customZone
    return realUseState(init);
  };
  let text;
  try {
    text = toText(renderToStaticMarkup(React.createElement(ComfortProvider, null,
      React.createElement(Screen, {
        C, card, lang, lat: r.lat, lon: r.lon, zone: r.zone, placeLabel: r.placeLabel,
      }))));
  } finally {
    React.useState = realUseState;
  }
  /* Seeding by hook POSITION is the only way in — the slots are local `useState`
     calls with no handle on them — and a position is exactly the thing an
     unrelated edit can shift. So refuse to hand back a render that does not
     contain the reading it was asked for. Without this, adding one `useState` to
     PrashnaScreen would quietly turn every prashna-result baseline back into a
     picture of the empty form, and the gate would go on passing on it. */
  if (!r.unlocked) {
    const verdict = lang === 'hi'
      ? ['अनुकूल', 'प्रतिकूल', 'मिश्रित', 'अभी नहीं']
      : ['Favourable', 'Not favourable', 'Mixed', 'Not yet'];
    const marker = lang === 'hi' ? 'शासक ग्रह' : 'Ruling Planets';
    if (!verdict.some((w) => text.includes(w)) || !text.includes(marker)) {
      throw new Error(
        `prashna seed: the ${r.key}/${lang} render carries no verdict and/or no astrologer tables. ` +
        'The state slots are seeded by hook position and PrashnaScreen\'s useState order has ' +
        'moved — re-derive the indices in validation/_prashna-seed.cjs before re-baselining.');
    }
  }
  return text;
}

function prashnaResultText(lang) {
  return READINGS.map((r) => `=== ${r.label} ===\n${renderReading(r, lang)}`).join('\n\n');
}

module.exports = { READINGS, buildReading, renderReading, prashnaResultText };
