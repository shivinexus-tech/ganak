#!/usr/bin/env node
'use strict';
/* Screen snapshot gate (VERIFY-SNAPSHOTS, backlog #65).
   Spec: docs/superpowers/specs/2026-08-10-screen-snapshot-verification-design.md

   The other gates prove the maths and the structure. None of them proved what a
   reader SEES, which is how three language defects reached main in August 2026:
   the Devanagari gochar leak, SecHead pinned to lang="hi", and four raw
   NAKSHATRAS[...] sites that printed "Shatabhisha" in Hindi. The last survived a
   16-table migration AND its own purpose-built gate, because those sites consulted
   no table for a table-scanning gate to find.

   An intentional copy change is EXPECTED to fail this. Re-baseline with
     node validation/snapshot-generate.cjs --write
   and commit the diff — that diff is the review artifact.

   SCOPE: rendered TEXT only. renderToStaticMarkup produces no layout box, so
   overflow, contrast and touch targets at 375px still need a human at 375px. */

const fs = require('fs');
const path = require('path');
const { generate, OUT_DIR, SCREENS, LANGS } = require('./snapshot-generate.cjs');
const { loadApp, ROOT } = require('./_load-app.cjs');

const fresh = generate({ write: false });
let failures = 0;

function diffLines(expected, actual) {
  const e = expected.split('\n'), a = actual.split('\n');
  const out = [];
  for (let i = 0; i < Math.max(e.length, a.length) && out.length < 40; i++) {
    if (e[i] !== a[i]) {
      if (e[i] !== undefined) out.push(`    -${i + 1}: ${e[i]}`);
      if (a[i] !== undefined) out.push(`    +${i + 1}: ${a[i]}`);
    }
  }
  return out;
}

/* ------------------------------------------------ 1. nothing changed unexpectedly */
for (const [key, actual] of fresh) {
  const file = path.join(OUT_DIR, `${key}.txt`);
  if (!fs.existsSync(file)) {
    console.error(`FAIL ${key}: no committed baseline. Run: node validation/snapshot-generate.cjs --write`);
    failures++;
    continue;
  }
  const expected = fs.readFileSync(file, 'utf8').replace(/\n$/, '');
  if (expected !== actual) {
    console.error(`FAIL ${key}: rendered text changed`);
    diffLines(expected, actual).forEach((l) => console.error(l));
    failures++;
  }
}

/* ------------------------------------------- 2. one language per screen, as rendered */
/* language-leak-scan owns the SOURCE half of this (no duplicate name tables). This is
   the RENDERED half it cannot see: the four raw NAKSHATRAS[...] sites contained no
   table at all, so only rendered output could ever have caught them. */
const DEVANAGARI = /[ऀ-ॿ]/;
const ALLOWED_IN_EN = ['गणक', 'ॐ', 'हिन्दी', 'भाषा'];
const terms = loadApp('src/i18n/panchang-terms.ts');
const LATIN_TERMS = [
  ...Object.keys(terms.SIGN_HI), ...Object.keys(terms.NAKSHATRA_HI), ...Object.keys(terms.PLANET_HI),
].filter((t) => !['Sun', 'Moon'].includes(t)); // also plain English words; covered by the sign/nakshatra checks

/* E-1.0 (owner, 2026-07-28; "plain Virgo" confirmed 2026-08-05): English mode names the
   12 rashi in English. The Devanagari check above cannot see this half — "Kanya (Virgo)"
   and "(Karka)" are pure Latin script, so they sailed past every gate and shipped in the
   Muhurat ascendant picker, the full-panchang Moon/Sun sign rows and the season clock.
   Sanskrit survives in EXACTLY one place: a proper event name such as "Kanya Sankranti",
   which festival-meta.ts owns — so those are subtracted from the text, not exempted by
   pattern, and a bare "Kanya" anywhere else is a failure. */
const fest = loadApp('src/data/festival-meta.ts');
const EVENT_NAMES_EN = [...Object.values(fest.FEST_NAME || {}), ...Object.values(fest.OBS_NAME || {})]
  .map((v) => (v && typeof v === 'object' ? v.en : v))
  .filter((s) => typeof s === 'string' && s)
  .sort((a, b) => b.length - a.length);

for (const [key, text] of fresh) {
  if (key.endsWith('.en')) {
    const stripped = ALLOWED_IN_EN.reduce((s, w) => s.split(w).join(''), text);
    const noEvents = EVENT_NAMES_EN.reduce((s, name) => s.split(name).join(''), text);
    const sanskritSigns = terms.SIGN_ORDER.filter((s) => new RegExp(`\\b${s}\\b`).test(noEvents));
    if (sanskritSigns.length) {
      const bad = noEvents.split('\n')
        .filter((l) => sanskritSigns.some((s) => new RegExp(`\\b${s}\\b`).test(l))).slice(0, 5);
      console.error(`FAIL ${key}: Sanskrit rashi names in English output: ${sanskritSigns.join(', ')}`);
      bad.forEach((l) => console.error(`    ${l}`));
      console.error('    English mode shows the English sign name (E-1.0). Use signLabel(lang, …) / signName(lang, i).');
      failures++;
    }
    if (DEVANAGARI.test(stripped)) {
      const bad = stripped.split('\n').filter((l) => DEVANAGARI.test(l)).slice(0, 5);
      console.error(`FAIL ${key}: Devanagari in English output:`);
      bad.forEach((l) => console.error(`    ${l}`));
      failures++;
    }
  }
  if (key.endsWith('.hi')) {
    const leaked = LATIN_TERMS.filter((t) =>
      new RegExp(`\\b${t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`).test(text));
    if (leaked.length) {
      console.error(`FAIL ${key}: Latin term names in Hindi output: ${leaked.slice(0, 8).join(', ')}`);
      failures++;
    }
  }
}

/* ---------------------------------------------------- 3. calculator result renders
   Sections 1-2 render every screen in its INITIAL state, so they can never see what
   a calculator prints AFTER Calculate — which is where the 2026-08-18 bug bash found
   its P0: the stale-answer guard was a useEffect, and effects run after the render
   that already handed the previous calculator's result to the new calculator's
   renderer. Measured on the pre-fix code: 104 of 182 cross pairs threw during render
   (taking the whole app to the error boundary) and the other 78 printed an answer
   belonging to a different calculator.

   The invariant proved here is render-time and shape-independent: a result whose
   slug is not the route's slug must render EXACTLY as no result at all. */

const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { toText } = require('./_snapshot-render.cjs');
const { C, card, PLACE, FIXTURE } = require('./_snapshot-env.cjs');

const ANSWER_MARK = /ANSWER FIRST|सीधा उत्तर/;

/* One bundle, many renders. _snapshot-render.cjs rebuilds per call (right for ~50
   renders, far too slow for the ~800 this sweep needs). The provider must sit in the
   SAME bundle as the screen or useComfort() sees a different React context. */
const CALC_ENTRY = `src/.snapshot-calcseed-${process.pid}.tsx`;
fs.writeFileSync(path.join(ROOT, CALC_ENTRY),
  'export { ComfortProvider } from "./accessibility/ComfortProvider";\n' +
  'export { default as Screen } from "./screens/UtilityCalculatorScreen";\n', 'utf8');
let CalcScreen, CalcProvider;
try {
  const mod = loadApp(CALC_ENTRY);
  CalcScreen = mod.Screen; CalcProvider = mod.ComfortProvider;
} finally { try { fs.unlinkSync(path.join(ROOT, CALC_ENTRY)); } catch { /* gone */ } }

const dataMod = loadApp('src/data/utility-calculators.ts');
const engine = loadApp('src/engine/utility-calculators.ts');
const SLUGS = dataMod.UTILITY_CALCULATORS.map((c) => c.slug);

const BIRTH = {
  y: FIXTURE.y, m: FIXTURE.m, day: FIXTURE.day, hh: FIXTURE.hh, mi: FIXTURE.mi,
  tz: FIXTURE.tz, lat: FIXTURE.lat, lon: FIXTURE.lon,
};
const RESULTS = {
  rashi: engine.quickBirth(BIRTH), 'sun-sign': engine.quickBirth(BIRTH), lagna: engine.quickBirth(BIRTH),
  nakshatra: engine.quickBirth(BIRTH), 'baby-name': engine.quickBirth(BIRTH),
  'mangal-dosha': engine.mangalDosha(BIRTH), 'kala-sarpa': engine.kalaSarpa(BIRTH),
  'pitra-dosha': engine.pitraDosha(BIRTH), 'papa-dosha': engine.papaDosha(BIRTH),
  'sade-sati': engine.sadeSati(BIRTH, Date.now()),
  'shraddha-tithi': engine.shraddhaTithi(BIRTH), 'pancha-pakshi': engine.panchaPakshi(BIRTH),
  'western-natal': engine.westernNatal(BIRTH),
  'western-relationship': engine.westernRelationship(BIRTH, { ...BIRTH, y: 1992 }),
};
const tagged = (slug) => ({ slug, data: RESULTS[slug], tz: FIXTURE.tz, tzB: null, placeLabel: PLACE.label, placeLabelB: '' });

/* A minimal useState machine so the gate can PRESS Calculate. renderToStaticMarkup
   runs no handlers, so the button's onClick is captured off the element tree through
   createElement, invoked, and the recorded setState values are applied for a second
   render. Only useState is intercepted — useMemo/useRef/useContext stay React's own. */
const realUseState = React.useState;
/* The screen is compiled with the AUTOMATIC JSX runtime (tsconfig wins), so the
   button element is created by jsx()/jsxs(), never by React.createElement. */
const jsxRuntime = require('react/jsx-runtime');
const realJsx = { jsx: jsxRuntime.jsx, jsxs: jsxRuntime.jsxs };
function renderCalc({ slug, lang, seed, press }) {
  const store = []; let idx = 0; let captured = null;
  React.useState = function patchedUseState(init) {
    const i = idx++;
    if (!(i in store)) store[i] = typeof init === 'function' ? init() : init;
    // The result state is the only one that starts as null; seeding it is exactly the
    // post-navigation state a route change leaves behind.
    if (seed !== undefined && store[i] === null && !store.seeded) { store.seeded = true; store[i] = seed; }
    return [store[i], (v) => { store[i] = typeof v === 'function' ? v(store[i]) : v; }];
  };
  for (const name of ['jsx', 'jsxs']) {
    jsxRuntime[name] = function patchedJsx(type, props, ...rest) {
      if (press && props && props.className === 'castBtn' && typeof props.onClick === 'function') captured = props.onClick;
      return realJsx[name](type, props, ...rest);
    };
  }
  const props = { C, card, lang, place: PLACE, onPlace: () => {}, route: dataMod.utilityFromPath(`/calculator/${slug}`), ...(press && press.props) };
  try {
    const el = () => React.createElement(CalcProvider, null, React.createElement(CalcScreen, props));
    let html = renderToStaticMarkup(el());
    if (press) {
      if (!captured) throw new Error('Calculate button was not rendered');
      // press.defer stands in for the browser: the screen hands the blocking
      // computation to window.setTimeout so the busy state can paint first. Holding
      // that callback lets the gate see the frame the reader sees.
      const queue = [];
      const hadWindow = 'window' in global;
      if (press.defer && !hadWindow) global.window = { setTimeout: (fn) => { queue.push(fn); return 1; } };
      try { captured(); }               // real calculate(): validates, computes, sets state
      finally { if (press.defer && !hadWindow) delete global.window; }
      idx = 0; store.seeded = true;     // keep the store, replay the render with it
      html = renderToStaticMarkup(el());
      if (press.defer) {
        const during = toText(html);
        queue.forEach((fn) => fn());
        idx = 0;
        return { during, after: toText(renderToStaticMarkup(el())) };
      }
    }
    return toText(html);
  } finally { React.useState = realUseState; jsxRuntime.jsx = realJsx.jsx; jsxRuntime.jsxs = realJsx.jsxs; }
}

/* Sections 3b-3d assert on copy. A throw there IS a failure (it is what took the
   whole app to the error boundary), so it is recorded rather than allowed to abort
   the gate with a stack trace. */
function safeRender(label, opts) {
  try { return renderCalc(opts); }
  catch (e) { console.error(`FAIL ${label}: the screen threw during render — ${String(e.message).split('\n')[0]}`); failures++; return null; }
}

/* --- 3a. a foreign result can never reach a renderer (the F2 invariant) --- */
let crashed = 0, foreign = 0, clean = 0;
const crashKinds = new Map();
for (const target of SLUGS) {
  const empty = {};
  for (const lang of LANGS) empty[lang] = renderCalc({ slug: target, lang });
  for (const source of SLUGS) {
    if (source === target) continue;
    for (const lang of LANGS) {
      // Both shapes: the legacy bare engine object (what the pre-fix screen stored)
      // and a properly tagged record belonging to another calculator.
      for (const value of [RESULTS[source], tagged(source)]) {
        let text;
        try { text = renderCalc({ slug: target, lang, seed: value }); }
        catch (e) {
          crashed++;
          const k = `${target}: ${String(e.message).split('\n')[0]}`;
          crashKinds.set(k, (crashKinds.get(k) || 0) + 1);
          continue;
        }
        if (text !== empty[lang]) foreign++; else clean++;
      }
    }
  }
}
if (crashed || foreign) {
  console.error(`FAIL calculator cross-seeding: ${crashed} render crash(es), ${foreign} foreign answer(s) — a result computed for one calculator reached another calculator's renderer.`);
  for (const [k, v] of crashKinds) console.error(`    ${v}x ${k}`);
  console.error('    Render the answer only while result.slug === the route\'s slug. An effect cannot fix this.');
  failures++;
}

/* --- 3b. the calculator's OWN result must still render (the guard must not eat it) --- */
let answered = 0;
for (const slug of SLUGS) {
  for (const lang of LANGS) {
    const text = safeRender(`${slug}.${lang}`, { slug, lang, seed: tagged(slug) });
    if (text === null) continue;
    if (!ANSWER_MARK.test(text)) {
      console.error(`FAIL ${slug}.${lang}: a result computed for THIS calculator did not render an answer.`);
      failures++;
    } else answered++;
  }
}

/* --- 3c. a malformed timezone must fail visibly, never quietly compute in IST --- */
/* A shared link can carry any zone string. `zoneOffset` returns null for an unknown
   one, and the old `?? 5.5` turned that into Indian Standard Time: a New York birth
   came back Kumbha instead of Karka with no message anywhere. */
const BAD_ZONE_PLACE = { ...PLACE, label: 'New York, United States', lat: 40.71, lon: -74.01, zone: 'Mars/X' };
for (const lang of LANGS) {
  const text = safeRender(`lagna.${lang} (bad zone)`, { slug: 'lagna', lang, press: { props: { place: BAD_ZONE_PLACE } } });
  if (text === null) continue;
  const named = text.includes('Mars/X');
  if (!named || ANSWER_MARK.test(text)) {
    console.error(`FAIL lagna.${lang}: an unusable timezone must produce a visible message naming it and no answer (named=${named}, answered=${ANSWER_MARK.test(text)}).`);
    failures++;
  }
}
/* …and a good zone still calculates, and says which offset it used. */
for (const lang of LANGS) {
  const text = safeRender(`lagna.${lang} (good zone)`, { slug: 'lagna', lang, press: {} });
  if (text === null) continue;
  if (!ANSWER_MARK.test(text) || !text.includes('UTC+05:30') || !text.includes(PLACE.label)) {
    console.error(`FAIL lagna.${lang}: a valid place must calculate and show the offset it used.`);
    console.error(`    ${text.split('\n').filter((l) => ANSWER_MARK.test(l) || l.includes('UTC')).join(' | ') || '(no answer, no offset)'}`);
    failures++;
  }
}

/* --- 3d. answer copy that no baseline could see (F5, F6, F7) --- */
const shr = safeRender('shraddha-tithi.en', { slug: 'shraddha-tithi', lang: 'en', seed: tagged('shraddha-tithi') }) || '';
if (/\b\d{1,2}\/\d{1,2}\/\d{4}\b/.test(shr)) {
  console.error('FAIL shraddha-tithi.en: the annual date is printed as a bare d/m/yyyy — ambiguous for a US-locale reader. Use fmtMs(a.apMid).');
  failures++;
}
if (!/amanta/i.test(shr) || !/purnimanta/i.test(shr)) {
  console.error('FAIL shraddha-tithi.en: the month convention (amanta vs purnimanta) must be stated — north-Indian families reckon purnimanta.');
  failures++;
}
const adhikIn = engine.shraddhaTithi({ ...BIRTH, y: 2010, m: 5, day: 5, hh: 12, mi: 0, tz: 5.5, lat: 28.61, lon: 77.21 });
for (const lang of LANGS) {
  const text = safeRender(`shraddha-tithi.${lang} (Adhik)`, { slug: 'shraddha-tithi', lang, seed: { slug: 'shraddha-tithi', data: adhikIn, tz: 5.5, tzB: null, placeLabel: 'New Delhi, India', placeLabelB: '' } });
  if (text === null) continue;
  if (!/Adhik|अधिक/.test(text)) {
    console.error(`FAIL shraddha-tithi.${lang}: an Adhik (intercalary) month must be shown, not silently stripped from the month name.`);
    failures++;
  }
}
/* --- 3e. the reader can always tell the app is working (F8) --- */
/* One calculation blocks the main thread for up to six seconds (a Shraddha scan at
   polar latitudes). The button used to sit there unchanged, which on a phone reads
   as a dead button. */
for (const lang of LANGS) {
  let stages;
  try { stages = renderCalc({ slug: 'shraddha-tithi', lang, press: { defer: true } }); }
  catch (e) { console.error(`FAIL shraddha-tithi.${lang} (busy): render threw — ${String(e.message).split('\n')[0]}`); failures++; continue; }
  if (!/Calculating|गणना हो रही है/.test(stages.during) || ANSWER_MARK.test(stages.during)) {
    console.error(`FAIL shraddha-tithi.${lang}: pressing Calculate must show a busy state before the blocking computation runs.`);
    failures++;
  }
  if (!ANSWER_MARK.test(stages.after)) {
    console.error(`FAIL shraddha-tithi.${lang}: the deferred computation must still produce the answer.`);
    failures++;
  }
}

const ss = { en: safeRender('sade-sati.en', { slug: 'sade-sati', lang: 'en', seed: tagged('sade-sati') }) || '',
             hi: safeRender('sade-sati.hi', { slug: 'sade-sati', lang: 'hi', seed: tagged('sade-sati') }) || '' };
for (const raw of ['current', 'upcoming', 'past']) {
  if (new RegExp(`\\b${raw}\\b`).test(ss.hi)) {
    console.error(`FAIL sade-sati.hi: the raw English cycle status "${raw}" leaked into the Hindi report.`);
    failures++;
  }
}
if (!/चल रहा है|आने वाला|बीत चुका/.test(ss.hi)) {
  console.error('FAIL sade-sati.hi: the cycle status must be rendered in Hindi.');
  failures++;
}

if (failures) {
  console.error(`\n✗ screen-snapshots FAILED (${failures})`);
  console.error('If the change was intentional: node validation/snapshot-generate.cjs --write, then commit the diff.');
  process.exit(1);
}

const covered = SCREENS.filter((s) => !s.skip).length;
const skipped = SCREENS.filter((s) => s.skip);
console.log(`✓ screen-snapshots: ${fresh.size} baselines match · ${covered} screens × ${LANGS.length} languages + chart/transit results`);
console.log(`✓ calculator cross-seeding: ${clean} mismatched-result renders identical to no result (0 crashes, 0 foreign answers) · ${answered} own-result renders still answer`);
if (skipped.length) console.log(`  not covered (${skipped.length}): ${skipped.map((s) => s.key).join(', ')} — inner modules needing parent-computed data`);
/* A green run must never be read as "this screen is fully proven". Screens whose
   answer only appears after the reader acts are covered in their INITIAL state
   only, and the gate says so out loud rather than leaving it implied. */
const partial = SCREENS.filter((s) => !s.skip && s.note);
if (partial.length) {
  console.log(`  initial state only (${partial.length}): ${[...new Set(partial.map((s) => s.key.replace(/^utility-.*/, 'utility-*')))].join(', ')}`);
  console.log('    — the answer appears after Calculate / Cast; static render cannot press a button.');
}
console.log('  scope: rendered TEXT only — layout, overflow and contrast still need a human at 375px.');
