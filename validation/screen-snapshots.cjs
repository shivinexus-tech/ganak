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
function renderCalc({ slug, lang, seed, press, birth }) {
  const store = []; let idx = 0; let captured = null; let birthSeeded = false;
  React.useState = function patchedUseState(init) {
    const i = idx++;
    if (!(i in store)) {
      let v = typeof init === 'function' ? init() : init;
      // `birth` is the FIRST {date,time} state the screen declares. Seeding it is how
      // the gate types a birth into the form before pressing Calculate.
      if (birth && !birthSeeded && v && typeof v === 'object' && 'date' in v && 'time' in v) { birthSeeded = true; v = { ...birth }; }
      store[i] = v;
    }
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

/* --- 3f. the birth CLOCK, not just the birth date, picks the timezone (F1) --- */
/* The engine fix landed on 2026-08-18; the call sites did not, so for one more day
   the screen still printed the noon-offset answer. This is the rendered half: type a
   birth on a daylight-saving transition day, press Calculate, and read what a reader
   would read. Sections 1-2 can never see this — they render initial state only.
   Offsets below are the IANA rules for those dates, not values copied from the app. */
const NY_PLACE = { ...PLACE, label: 'New York, United States', name: 'New York, United States', lat: 40.71, lon: -74.01, zone: 'America/New_York' };
const DST_CASES = [
  // 2024-03-10: DST began at 02:00, so 00:30 was still EST (−5). The noon-UTC offset
  // was −4, which printed pada 1 / "Se" — one whole pada, i.e. a different name.
  { slug: 'nakshatra', birth: { date: '2024-03-10', time: '00:30' }, place: NY_PLACE, expect: /Purva Bhadrapada, pada 2\b/, wrong: /pada 1\b/, offset: 'UTC−05:00', why: 'NY 2024-03-10 00:30 is EST −5 (DST starts at 02:00)' },
  { slug: 'baby-name', birth: { date: '2024-03-10', time: '00:30' }, place: NY_PLACE, expect: /Suggested starting sound: So\b/, wrong: /sound: Se\b/, offset: 'UTC−05:00', why: 'the naming syllable follows the pada' },
  // 1961-10-29: clocks went back at 02:00, so 00:30 was still EDT (−4). The noon-UTC
  // offset was −5, which printed Leo instead of Cancer — a different ascendant.
  { slug: 'lagna', birth: { date: '1961-10-29', time: '00:30' }, place: NY_PLACE, expect: /ascendant is Cancer\b/, wrong: /ascendant is Leo\b/, offset: 'UTC−04:00', why: 'NY 1961-10-29 00:30 is EDT −4 (DST ends at 02:00)' },
];
for (const c of DST_CASES) {
  const text = safeRender(`${c.slug}.en (DST day)`, { slug: c.slug, lang: 'en', place: NY_PLACE, birth: c.birth, press: { props: { place: c.place } } });
  if (text === null) continue;
  const line = text.split('\n').find((l) => c.expect.test(l) || c.wrong.test(l)) || '(no answer line)';
  if (!c.expect.test(text) || c.wrong.test(text)) {
    console.error(`FAIL ${c.slug}.en (DST day): ${c.why}. The screen printed: ${line}`);
    console.error('    The birth CLOCK must reach zoneOffset — zoneOffset(zone, y, m, day, hh, mi).');
    failures++;
  }
  if (!text.includes(c.offset)) {
    console.error(`FAIL ${c.slug}.en (DST day): the offset shown to the reader should be ${c.offset}.`);
    failures++;
  }
}
/* …and an Indian birth at the same clock is untouched. India has never used DST, so
   wiring the clock through must be invisible to the audience this app is built for. */
for (const lang of LANGS) {
  const withClock = safeRender(`rashi.${lang} (India, 00:30)`, { slug: 'rashi', lang, birth: { date: '2024-03-10', time: '00:30' }, press: {} });
  const noon = safeRender(`rashi.${lang} (India, 12:00)`, { slug: 'rashi', lang, birth: { date: '2024-03-10', time: '12:00' }, press: {} });
  if (withClock === null || noon === null) continue;
  if (!withClock.includes('UTC+05:30') || !noon.includes('UTC+05:30')) {
    console.error(`FAIL rashi.${lang}: an Indian birth must be computed at UTC+05:30 whatever the clock says.`);
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

/* --- 3g. answer-line copy that only exists AFTER Calculate (F12, F13, Sade Sati) --- */
/* None of this is in a baseline: it renders only once a result exists, which is why
   four separate copy defects sat in the most-read calculator pages unseen. */
const ANS = {};
for (const slug of SLUGS) for (const lang of LANGS) ANS[`${slug}.${lang}`] = safeRender(`${slug}.${lang} (copy)`, { slug, lang, seed: tagged(slug) }) || '';

/* Hindi jyotish names a भाव with a Sanskrit ordinal (प्रथम, द्वितीय, तृतीय …), which is
   what src/data/dosha-explainers.ts prints on the same page. "1वें"/"7वें" is a digit
   with a Hindi suffix glued on — the page was speaking two dialects of its own subject. */
for (const slug of SLUGS) {
  const bad = ANS[`${slug}.hi`].split('\n').filter((l) => /[0-9]+वें/.test(l));
  if (bad.length) {
    console.error(`FAIL ${slug}.hi: digit-plus-suffix house ordinal instead of a Hindi ordinal:`);
    bad.slice(0, 3).forEach((l) => console.error(`    ${l}`));
    console.error('    A भाव is प्रथम / द्वितीय / तृतीय …, never "1वें".');
    failures++;
  }
}
/* Every Hindi answer sentence ends the way Hindi sentences end. Three of them ended
   with a Latin full stop and no verb — "आपका जन्म-पक्षी: मोर." */
for (const slug of ['nakshatra', 'pancha-pakshi', 'western-relationship', 'rashi', 'lagna', 'sun-sign']) {
  const lines = ANS[`${slug}.hi`].split('\n');
  const i = lines.findIndex((l) => /सीधा उत्तर/.test(l));
  const line = i < 0 ? '' : (lines[i].replace(/^.*सीधा उत्तर/, '').trim() || lines[i + 1] || '');
  if (line && !/।$/.test(line)) {
    console.error(`FAIL ${slug}.hi: the answer sentence does not end in a danda: ${line}`);
    console.error('    Hindi sentences close with ।, and read as sentences (…है।), not as a label plus a full stop.');
    failures++;
  }
}
/* "n/7 planets are enclosed" could never read below 4/7 — the Rahu–Ketu axis halves
   the chart, so the larger half always holds at least four. A reader saw 4/7 and heard
   "more than halfway to the yoga" when it is in fact the floor. */
for (const lang of LANGS) {
  const t = ANS[`kala-sarpa.${lang}`];
  // Matches the COUNT being called "enclosed", not the word itself — the explainer
  // legitimately speaks of "the enclosed planets" once the pattern is present.
  if (/\d+\s*(?:\/\s*7|of the seven)[^.\n]*enclos|enclos[^.\n]*\d+\s*(?:\/\s*7|of the seven)/.test(t)
      || /\d+[^.\n]*(?:fall inside|inside) the Rahu–Ketu arc/.test(t)
      || /\d+\s*\/\s*7\s*ग्रह घिरे/.test(t) || /ग्रह राहु–केतु अर्धवृत्त के भीतर आते हैं/.test(t)) {
    console.error(`FAIL kala-sarpa.${lang}: the count is described as "enclosed", which cannot fall below 4 of 7 and so reads as partial progress.`);
    console.error('    Say what the number is: the largest group on one side of the axis.');
    failures++;
  }
  if (!/largest group on one side|एक ओर सबसे बड़ा समूह/.test(t)) {
    console.error(`FAIL kala-sarpa.${lang}: the answer must say the count is the largest group on one side of the Rahu–Ketu axis.`);
    failures++;
  }
}
/* The Sade Sati footnote described a defect that was fixed on 2026-08-18: retrograde
   re-entries are merged into one passage, so phases no longer split into segments.
   The sentence outlived the bug and became false. */
for (const lang of LANGS) {
  const t = ANS[`sade-sati.${lang}`];
  if (/shows those segments separately|खंड अलग-अलग दिखाता है/.test(t)) {
    console.error(`FAIL sade-sati.${lang}: the phase list still tells the reader Ganak splits a phase into separate retrograde segments. It does not — the returns are merged into one passage.`);
    failures++;
  }
  // Scoped to the footnote's own words: SADE_SATI_METHOD_COPY further down the page
  // already says "same passage", so a looser check would pass on a deleted footnote.
  if (!/one continuous span|एक सतत अवधि/.test(t)) {
    console.error(`FAIL sade-sati.${lang}: the phase list must say each phase is one continuous span, in the merged-passage wording src/data/sade-sati-report.ts already uses.`);
    failures++;
  }
}

/* --- 3h. a bad field is named, and a birth date is never silently corrected (F9) --- */
/* 29 February 1990 was accepted and quietly became 1 March: Ganak changed someone's
   birth date and then answered with confidence. One message — "Check the date, time
   and place" — also covered four different controls, including a Check-date field it
   did not mention at all. */
const BAD_INPUTS = [
  { what: '29 Feb in a non-leap year', birth: { date: '1990-02-29', time: '12:00' }, must: [/29 February 1990 is not a real date/, /will not move it/] },
  { what: 'a year outside the ephemeris', birth: { date: '0999-06-21', time: '09:15' }, must: [/1800–2150/] },
  { what: 'an impossible clock', birth: { date: '1990-06-21', time: '24:00' }, must: [/time of birth/, /23:59/] },
];
for (const c of BAD_INPUTS) {
  const text = safeRender(`rashi.en (${c.what})`, { slug: 'rashi', lang: 'en', birth: c.birth, press: {} });
  if (text === null) continue;
  if (ANSWER_MARK.test(text)) {
    console.error(`FAIL rashi.en (${c.what}): Ganak answered instead of saying what was wrong. Silent correction of a birth date is not acceptable.`);
    failures++;
  }
  for (const re of c.must) {
    if (!re.test(text)) {
      console.error(`FAIL rashi.en (${c.what}): the message must match ${re} — it has to name the field and say why.`);
      console.error(`    got: ${text.split('\n').filter((l) => /Enter|not a real|1800|23:59|calculat/i.test(l)).slice(0, 2).join(' | ') || '(no message)'}`);
      failures++;
    }
  }
}
/* Hindi readers get the same named field, not an English message or a generic one. */
for (const c of [{ what: '29 Feb in a non-leap year', birth: { date: '1990-02-29', time: '12:00' }, must: /जन्म तिथि/ },
                 { what: 'an impossible clock', birth: { date: '1990-06-21', time: '24:00' }, must: /जन्म समय/ }]) {
  const text = safeRender(`rashi.hi (${c.what})`, { slug: 'rashi', lang: 'hi', birth: c.birth, press: {} });
  if (text === null) continue;
  if (ANSWER_MARK.test(text) || !c.must.test(text)) {
    console.error(`FAIL rashi.hi (${c.what}): the Hindi reader must get the same named-field message, not an answer.`);
    failures++;
  }
}

/* The Sade Sati check date is its own field and must be named as one. */
{
  const text = safeRender('sade-sati.en (blank check date)', { slug: 'sade-sati', lang: 'en', press: { props: {} }, birth: { date: '1990-01-01', time: '12:00' } });
  if (text && !/check date/i.test(text) && !ANSWER_MARK.test(text)) {
    console.error('FAIL sade-sati.en: a rejected calculation must name the check date field when that is the field at fault.');
    failures++;
  }
}

/* ------------------------------------------------- 4. content parity, not just language */
/* The defect this exists for (JYOTISH-HINDI-PARITY, 2026-08-18): the BNN and Bhrigu
   screens printed ONE generic Hindi sentence in place of EVERY meaning — the same
   sentence 7× in bnn.hi and 19× in bhrigu.hi — while an English reader got a
   distinct interpretation each time. Every existing gate was green: nothing leaked,
   no language mixed, the copy was fluent Hindi. It was simply a thinner product,
   and only a human reading two baselines side by side could see it.

   So compare the two baselines POSITIONALLY. Both languages render the same JSX, so
   an en/hi pair with the same line count is aligned line for line: if English says
   two different things at lines i and j, Hindi saying the identical thing at both is
   a meaning that was collapsed, not translated.

   Only lines long enough to be a phrase count (a repeated one-word label such as
   "secondary" is legitimately the same word twice). The floor is 12 characters; at
   the time of writing this check finds nothing even at 8, so the margin is generous
   rather than tuned to hide something. */
const PHRASE_MIN = 12;
const parityKeys = [...new Set([...fresh.keys()]
  .filter((k) => k.endsWith('.en')).map((k) => k.slice(0, -3)))]
  .filter((k) => fresh.has(`${k}.hi`));

for (const key of parityKeys) {
  const en = fresh.get(`${key}.en`).split('\n');
  const hi = fresh.get(`${key}.hi`).split('\n');
  if (en.length !== hi.length) continue; // structures diverge; positions mean nothing
  const byHindi = new Map();
  en.forEach((line, i) => {
    if (line.length < PHRASE_MIN || !line.includes(' ')) return;
    if (!byHindi.has(hi[i])) byHindi.set(hi[i], new Set());
    byHindi.get(hi[i]).add(line);
  });
  for (const [hiLine, englishVariants] of byHindi) {
    if (englishVariants.size < 2) continue;
    console.error(`FAIL ${key}: ${englishVariants.size} distinct English meanings collapse to one Hindi sentence`);
    console.error(`    hi: ${hiLine.slice(0, 100)}`);
    [...englishVariants].slice(0, 3).forEach((v) => console.error(`    en: ${v.slice(0, 100)}`));
    console.error('    Hindi readers must get one meaning per row, not a generic sentence repeated.');
    failures++;
  }
}

/* --------------------------- 4. every English signification has a Hindi twin */
/* The rendered check above only sees the rows this fixture happens to produce. This
   half is exhaustive: a signification table and its Hindi twin must carry exactly the
   same keys, so adding an English meaning without a Hindi one fails at once instead
   of waiting for a chart that lands on it. Astrological significations carry religious
   weight — the twin must be a TRANSLATION of the English Ganak already states, never a
   meaning invented to fill a hole. */
const bhriguEn = loadApp('src/engine/bhrigu.ts');
const bhriguHi = loadApp('src/data/bhrigu-copy-hi.ts');
const TWINS = [
  ['BNN_KARAKA', bhriguEn.BNN_KARAKA, bhriguHi.BNN_KARAKA_HI],
  ['BNN_MEANING', bhriguEn.BNN_MEANING, bhriguHi.BNN_MEANING_HI],
  ['BCP_HOUSE_THEME', bhriguEn.BCP_HOUSE_THEME, bhriguHi.BCP_HOUSE_THEME_HI],
];
for (const [name, english, hindi] of TWINS) {
  const missing = Object.keys(english).filter((k) => !hindi[k]);
  const extra = Object.keys(hindi).filter((k) => !english[k]);
  if (missing.length) {
    console.error(`FAIL ${name}: ${missing.length} signification(s) English-only: ${missing.slice(0, 6).join(', ')}`);
    console.error('    Add the Hindi translation in src/data/bhrigu-copy-hi.ts — do not invent a meaning.');
    failures++;
  }
  if (extra.length) {
    console.error(`FAIL ${name}: Hindi key(s) with no English original: ${extra.slice(0, 6).join(', ')}`);
    failures++;
  }
}
/* Shadbala's six sub-strengths carry their own Hindi label; the table used to be
   English-only and the Hindi chart printed "Sthana Dig Kala Cheshta Naisargika Drik". */
const { BALA_PARTS } = loadApp('src/engine/shadbala.ts');
const balaGaps = BALA_PARTS.filter((b) => !b.labelHi || !b.noteHi).map((b) => b.k);
if (balaGaps.length) {
  console.error(`FAIL BALA_PARTS: no Hindi label for ${balaGaps.join(', ')}`);
  failures++;
}

/* ------------------------------- 5. the yoga catalogue, exhaustively (YOGAS-HINDI-PARITY) */
/* The positional check in § 4 now sees the yogas panel, because snapshot-results.cjs
   mirrors it — but it only sees the SIX yogas the pinned fixture chart happens to
   produce. 79 distinct English interpretations are reachable from detectYogas, so a
   missing Hindi meaning could sit for years in a yoga no baseline lands on. This half
   is exhaustive: every key, instantiated over every parameter set the detection rules
   can hand it.

   The invariant is content parity, not spelling: if two parameter sets produce two
   DIFFERENT English sentences, they must produce two different Hindi sentences.
   Reinstating a generic Hindi sentence fails here immediately, with no baseline
   involved. Yoga significations carry religious weight, so a yoga with no English
   text must not be given a Hindi one either — the key-set assertion holds both ways. */
const classical = loadApp('src/engine/classical.ts');
const yogaHi = loadApp('src/data/yoga-copy-hi.ts');
const { YOGA_EN, YOGA_PARAM_SPACE } = classical;
const { YOGA_HI } = yogaHi;

const yogaMissing = Object.keys(YOGA_EN).filter((k) => !YOGA_HI[k]);
const yogaExtra = Object.keys(YOGA_HI).filter((k) => !YOGA_EN[k]);
const yogaUntested = Object.keys(YOGA_EN).filter((k) => !(YOGA_PARAM_SPACE[k] || []).length);
if (yogaMissing.length) {
  console.error(`FAIL YOGA_HI: ${yogaMissing.length} yoga(s) English-only: ${yogaMissing.join(', ')}`);
  console.error('    Add the Hindi translation in src/data/yoga-copy-hi.ts — translate what Ganak already says, do not invent a signification.');
  failures++;
}
if (yogaExtra.length) {
  console.error(`FAIL YOGA_HI: Hindi yoga(s) with no English original: ${yogaExtra.join(', ')}`);
  failures++;
}
if (yogaUntested.length) {
  console.error(`FAIL YOGA_PARAM_SPACE: no parameter set for ${yogaUntested.join(', ')} — the yoga would go unchecked.`);
  failures++;
}

let yogaRows = 0;
const yogaEnToHiText = new Map(); // hindi sentence -> set of distinct english sentences
const yogaEnToHiName = new Map();
const yogaLatinInHi = [];
const yogaBlank = [];
for (const key of Object.keys(YOGA_EN)) {
  if (!YOGA_HI[key]) continue;
  for (const params of YOGA_PARAM_SPACE[key] || []) {
    const en = { name: YOGA_EN[key].name(params), text: YOGA_EN[key].text(params) };
    const hi = { name: YOGA_HI[key].name(params), text: YOGA_HI[key].text(params) };
    yogaRows++;
    for (const [field, e, h] of [['text', en.text, hi.text], ['name', en.name, hi.name]]) {
      if (!e || !h) { yogaBlank.push(`${key} ${field} (${JSON.stringify(params)})`); continue; }
      if (!DEVANAGARI.test(h)) yogaBlank.push(`${key} ${field}: Hindi is not Devanagari — "${h}"`);
      if (/[A-Za-z]/.test(h)) yogaLatinInHi.push(`${key} ${field}: "${h}"`);
      const bucket = field === 'text' ? yogaEnToHiText : yogaEnToHiName;
      if (!bucket.has(h)) bucket.set(h, new Set());
      bucket.get(h).add(e);
    }
  }
}
if (yogaBlank.length) {
  console.error(`FAIL yoga copy: ${yogaBlank.length} empty or non-Devanagari Hindi string(s): ${yogaBlank.slice(0, 5).join(' | ')}`);
  failures++;
}
if (yogaLatinInHi.length) {
  console.error(`FAIL yoga copy: Latin script inside Hindi yoga copy: ${yogaLatinInHi.slice(0, 5).join(' | ')}`);
  console.error('    Graha names come from planetName(lang, …) in src/i18n/panchang-terms.ts, never a hand-written spelling.');
  failures++;
}
for (const [field, bucket] of [['text', yogaEnToHiText], ['name', yogaEnToHiName]]) {
  for (const [hiLine, englishVariants] of bucket) {
    if (englishVariants.size < 2) continue;
    console.error(`FAIL yoga ${field}: ${englishVariants.size} distinct English yoga ${field}s collapse to one Hindi ${field}`);
    console.error(`    hi: ${hiLine.slice(0, 110)}`);
    [...englishVariants].slice(0, 3).forEach((v) => console.error(`    en: ${v.slice(0, 110)}`));
    console.error('    A Hindi reader must get one meaning per yoga, not a generic sentence repeated.');
    failures++;
  }
}
const yogaEnTexts = new Set([...yogaEnToHiText.values()].flatMap((s) => [...s]));

/* ------------------------ 6. the CAST chart, rendered for real (2026-08-19) --------
   `chart.en` / `chart.hi` are a COMPOSED MIRROR — snapshot-results.cjs re-assembles a
   few values out of computeKundli with the display helpers. That mirror is green on
   every defect below, because a mirror can only ever show the lines somebody
   remembered to mirror. Four of the five findings the 2026-08-18 bug bash left in this
   screen lived in lines the mirror does not contain:

     · the birth-panchang block printed all five values in English on a Hindi screen;
     · the Papa Dosha card printed the engine's internal keys ("moon: 3") in English;
     · the dosha panel followed the reader's ayanamsa while naming none, and linked to
       pages that hard-force Lahiri — a different Kala Sarpa NAME on the same birth;
     · switching Jyotish panels UNMOUNTED the matching form, destroying two people's
       birth records and the computed match with no user action.

   So this section renders the real ChartScreen with a real computeKundli result seeded
   into its own `result` slot — the technique snapshot-results.cjs already uses for the
   match result — and asserts on what a reader would actually see. No baseline: these
   are invariants, so they must not be re-blessable by regenerating a file. */
const chartMod = (() => {
  const rel = `src/.snapshot-chartseed-${process.pid}.tsx`;
  const abs = path.join(ROOT, rel);
  fs.writeFileSync(abs,
    'export { ComfortProvider } from "./accessibility/ComfortProvider";\n' +
    'export { default as Screen } from "./screens/ChartScreen";\n', 'utf8');
  try { return loadApp(rel); } finally { try { fs.unlinkSync(abs); } catch { /* gone */ } }
})();
const { computeKundli } = loadApp('src/engine/kundli.ts');
const { JYOTISH_GROUPS } = loadApp('src/components/JyotishPanelNav.tsx');
const marriageTiming = loadApp('src/engine/marriage-timing.ts');

/* ChartScreen declares exactly three null-initialised slots, in this order: place,
   result, chartContext. Seeding by ORDER OF NULLS rather than by hook index keeps the
   gate correct when the screen gains, loses or reorders any non-null state — and the
   count itself is asserted below, so a fourth null cannot slip past unnoticed. */
const CHART_NULL_SLOTS = ['place', 'result', 'chartContext'];
/* The open panel is set the only way a reader can set it — through the URL. Seeding it
   as a hook value would prove nothing about the ?panel= wiring, and a hook seeded by
   initial VALUE cannot see a lazy initialiser anyway. */
function renderChart({ lang, activePanel = 'kundli', ayanamsa = 'lahiri', birth = FIXTURE, urlSearch = `?panel=${activePanel}` }) {
  const r = computeKundli({
    y: birth.y, m: birth.m, day: birth.day, hh: birth.hh, mi: birth.mi,
    tz: birth.tz, lat: birth.lat, lon: birth.lon, ayanamsa,
  });
  const form = {
    name: 'Snapshot',
    date: `${birth.y}-${String(birth.m).padStart(2, '0')}-${String(birth.day).padStart(2, '0')}`,
    time: `${String(birth.hh).padStart(2, '0')}:${String(birth.mi).padStart(2, '0')}`,
  };
  const seedFor = { place: PLACE, result: r, chartContext: { form, place: PLACE, ayanamsa } };
  const realState = React.useState;
  let nulls = 0;
  /* Patched ONLY while ChartScreen's own body runs. Its children — ChartVault and
     MatchMaker — are rendered by React afterwards and declare null slots of their own
     (that is the whole point of the F9 fix), so a patch left in place would swallow
     theirs and the slot count below would stop meaning anything. */
  const Wrapped = (props) => {
    React.useState = function seeded(init) {
      if (init && typeof init === 'object' && 'name' in init && 'date' in init && 'time' in init) return [form, () => {}];
      if (init === null) {
        const slot = CHART_NULL_SLOTS[nulls++];
        if (slot) return [seedFor[slot], () => {}];
      }
      if (init === 'lahiri') return [ayanamsa, () => {}];
      return realState(init);
    };
    try { return chartMod.Screen(props); } finally { React.useState = realState; }
  };
  /* urlPrefGet reads window.location.search inside a useState initialiser and swallows
     any throw, so a bare object is all the screen needs to restore ?panel=. */
  const hadWindow = 'window' in global;
  if (urlSearch !== null && !hadWindow) global.window = { location: { search: urlSearch } };
  try {
    const html = renderToStaticMarkup(React.createElement(chartMod.ComfortProvider, null,
      React.createElement(Wrapped, { C, card, lang })));
    return { html, text: toText(html), nulls };
  } finally {
    React.useState = realState;
    if (urlSearch !== null && !hadWindow) delete global.window;
  }
}

const PANEL_KEYS = JYOTISH_GROUPS.map((g) => g.key);
/* Each panel's container and a string that only its contents produce, so "mounted"
   means the component really rendered rather than a nav entry naming it. */
const PANELS = [
  { key: 'matching', id: 'match-panel', marker: /Guna Milan|कुण्डली मिलान/ },
  { key: 'vault', id: 'vault', marker: /id="vault"/ },
];
const RESULTS_ID = 'chart-results';
const containerHidden = (html, id) => new RegExp(`<div id="${id}" hidden(=""|\\s|>)`).test(html);
const containerPresent = (html, id) => new RegExp(`<div id="${id}"[\\s>]`).test(html);

/* --- 6a. F9: switching panels must HIDE, never unmount --- */
/* MatchMaker holds two names, two dates, two times, two places and the computed match
   in ten useState slots. Unmounting it threw all ten away, so a couple who tapped
   "Vault" and came back were shown the hard-coded demo births instead of their own.
   AGENTS.md: "no state resets without a user action" — moving to another panel is not
   a request to discard two birth records. */
let panelChecks = 0;
for (const key of PANEL_KEYS) {
  const { html, nulls } = renderChart({ lang: 'en', activePanel: key });
  if (nulls !== CHART_NULL_SLOTS.length) {
    console.error(`FAIL chart panels: ChartScreen now declares ${nulls} null-initialised state slots, not ${CHART_NULL_SLOTS.length}.`);
    console.error('    Update CHART_NULL_SLOTS in this gate to name them in order — the seeding above is silently wrong until you do.');
    failures++;
    break;
  }
  for (const p of PANELS) {
    if (!containerPresent(html, p.id)) {
      console.error(`FAIL chart panels: with panel="${key}" the ${p.key} panel is not mounted at all.`);
      console.error('    Render it always and set hidden={activePanel !== "…"}. Unmounting destroys everything the reader typed into it.');
      failures++;
    } else if (containerHidden(html, p.id) !== (key !== p.key)) {
      console.error(`FAIL chart panels: with panel="${key}" the ${p.key} panel hidden=${containerHidden(html, p.id)} (expected ${key !== p.key}).`);
      failures++;
    } else panelChecks++;
  }
  const resultsShouldHide = key === 'matching' || key === 'vault';
  if (!containerPresent(html, RESULTS_ID)) {
    console.error(`FAIL chart panels: with panel="${key}" the cast chart's result column is not mounted.`);
    failures++;
  } else if (containerHidden(html, RESULTS_ID) !== resultsShouldHide) {
    console.error(`FAIL chart panels: with panel="${key}" the result column hidden=${containerHidden(html, RESULTS_ID)} (expected ${resultsShouldHide}).`);
    failures++;
  } else panelChecks++;
}

/* --- 6b. F9: the open panel survives a reload and a shared link --- */
for (const key of ['matching', 'vault', 'dashas']) {
  const { html } = renderChart({ lang: 'en', urlSearch: `?panel=${key}` });
  const shown = PANELS.filter((p) => containerPresent(html, p.id) && !containerHidden(html, p.id)).map((p) => p.key);
  const expect = key === 'dashas' ? [] : [key];
  if (JSON.stringify(shown) !== JSON.stringify(expect)) {
    console.error(`FAIL chart panels: ?panel=${key} opened ${JSON.stringify(shown)} instead of ${JSON.stringify(expect)}.`);
    console.error('    activePanel must initialise from urlPrefGet("panel") and be written back with urlPrefSet, the way chartStyle already is.');
    failures++;
  }
}
{
  const src = fs.readFileSync(path.join(ROOT, 'src/screens/ChartScreen.tsx'), 'utf8');
  if (!/urlPrefSet\(\s*["']panel["']/.test(src)) {
    console.error('FAIL chart panels: choosing a panel never writes it to the URL — reload and Back would still lose it.');
    failures++;
  }
}

/* --- 6c. F14: the birth panchang is the reader's language, all five values --- */
/* These come out of computeKundli as canonical English ("Shukravara (Fri)", "Priti",
   "Vishti") and were interpolated raw, so a Hindi reader's own birth panchang was in
   English. Only tithi/paksha/nakshatra had tables in panchang-terms.ts; the vara, the
   yoga and the karana had none, which is exactly why those were the ones left. */
const PANCHANG_LABELS_HI = ['वार', 'तिथि', 'नक्षत्र', 'योग', 'करण'];
{
  const { text } = renderChart({ lang: 'hi' });
  const lines = text.split('\n');
  const start = lines.lastIndexOf('पञ्चाङ्ग');
  if (start < 0) {
    console.error('FAIL chart.hi: the birth-panchang block did not render — this check has stopped proving anything.');
    failures++;
  } else {
    const blk = lines.slice(start);
    for (const label of PANCHANG_LABELS_HI) {
      const i = blk.indexOf(label);
      if (i < 0) { console.error(`FAIL chart.hi: birth panchang has no "${label}" row.`); failures++; continue; }
      const value = blk[i + 1] || '';
      if (/[A-Za-z]/.test(value)) {
        console.error(`FAIL chart.hi: the birth panchang prints "${label}" in English: ${value}`);
        console.error('    Route it through panchangTerm(lang, "vara"|"tithi"|"paksha"|"nakshatra"|"yoga"|"karana", …).');
        failures++;
      }
    }
  }
}
/* Exhaustive, so a value this one fixture never lands on cannot hide: every yoga,
   karana and vara the engine can return must have a Devanagari name. */
{
  const { YOGAS, KARANAS_MOV, karanaName } = loadApp('src/engine/panchang.ts');
  /* karanaName covers the four fixed karanas by their own elongation windows rather
     than by a hand-copied list, so a rename in the engine shows up here. */
  const allKaranas = [...new Set([...KARANAS_MOV,
    ...[0, 57, 58, 59].map((k) => karanaName(k * 6 + 0.5))])];
  const varas = terms.VARA_EN ? [...terms.VARA_EN] : [];
  /* A missing table must read as a failure, not as a stack trace that aborts the gate
     before the checks below it ever run. */
  const hiOf = (kind, v) => { try { return terms.panchangTerm('hi', kind, v); } catch { return ''; } };
  const untranslated = [
    ...YOGAS.filter((y) => !DEVANAGARI.test(hiOf('yoga', y))).map((y) => `yoga ${y}`),
    ...allKaranas.filter((k) => !DEVANAGARI.test(hiOf('karana', k))).map((k) => `karana ${k}`),
    ...(varas.length ? varas : ['(no VARA_EN table)'])
      .filter((v) => !DEVANAGARI.test(hiOf('vara', `${v} (x)`))).map((v) => `vara ${v}`),
  ];
  if (untranslated.length) {
    console.error(`FAIL panchang terms: ${untranslated.length} value(s) have no Devanagari name: ${untranslated.slice(0, 8).join(', ')}`);
    console.error('    Add them to YOGA_HI / KARANA_HI / VARA_HI in src/i18n/panchang-terms.ts.');
    failures++;
  }
}

/* --- 6d. F13: the Papa Dosha card names its three references, in both languages --- */
/* English was the degraded language here: Hindi mapped the keys, English printed the
   engine's own "lagna: 4 · moon: 3 · venus: 2". */
const PAPA_EXPECT = { en: [/\bLagna: \d/, /\bMoon: \d/, /\bVenus: \d/], hi: [/लग्न: \d/, /चन्द्र: \d/, /शुक्र: \d/] };
for (const lang of LANGS) {
  const { text } = renderChart({ lang });
  for (const re of PAPA_EXPECT[lang]) {
    if (!re.test(text)) {
      console.error(`FAIL chart.${lang}: the Papa Dosha card does not name its reference points (${re}).`);
      failures++;
    }
  }
  if (/\b(lagna|moon|venus): \d/.test(text)) {
    console.error(`FAIL chart.${lang}: the Papa Dosha card prints the engine's internal keys instead of words.`);
    console.error(`    ${text.split('\n').find((l) => /\b(lagna|moon|venus): \d/.test(l))}`);
    failures++;
  }
}

/* --- 6e. F7: the dosha panel names the ayanamsa it used --- */
/* It reads the chart the reader is looking at, so it follows the ayanamsa chips — but
   every "Full page →" beneath it routes through code that hard-forces Lahiri. On a
   Raman chart the same birth gave Shankhachuda here and Karkotaka there. Either the
   panel is pinned or it says so; silence is the one thing AGENTS.md forbids. */
const doshaBlock = (text) => {
  const lines = text.split('\n');
  const i = lines.findIndex((l) => /^(Dosha analysis|दोष विश्लेषण)$/.test(l));
  return i < 0 ? '' : lines.slice(i, i + 20).join('\n');
};
for (const lang of LANGS) {
  for (const [ay, label] of [['lahiri', 'Lahiri'], ['raman', 'Raman']]) {
    const blk = doshaBlock(renderChart({ lang, ayanamsa: ay }).text);
    if (!blk) { console.error(`FAIL chart.${lang}: the dosha panel did not render.`); failures++; continue; }
    if (!blk.includes(label)) {
      console.error(`FAIL chart.${lang}: the dosha panel on a ${label} chart never names the ayanamsa it computed with.`);
      failures++;
    }
    /* On anything but Lahiri the panel must also warn that the page it links to will
       answer differently — a link that quietly contradicts its own card is the defect. */
    const warns = /Lahiri \(Chitrapaksha\)/.test(blk) && /Full page|विस्तृत पृष्ठ/.test(blk);
    if (ay !== 'lahiri' && !warns) {
      console.error(`FAIL chart.${lang}: on a ${label} chart the dosha panel must say the linked full pages compute with Lahiri.`);
      console.error(`    ${blk.split('\n').slice(-3).join(' | ')}`);
      failures++;
    }
  }
}

/* --- 6f. F22: "no supportive window" states the range it searched --- */
/* A 2075 birth returns zero windows because the horizon (twenty years from today)
   falls before the chart's first dasha begins. Rendered as "No clearly supportive
   window found in the next twenty years", that reads as a finding about the marriage.
   The 18-year floor was never stated at all. The numbers below come from the engine's
   own exported constants, so the sentence cannot drift from the arithmetic. */
const FLOOR = marriageTiming.MARRIAGE_AGE_FLOOR_YEARS;
const HORIZON = marriageTiming.MARRIAGE_HORIZON_YEARS;
if (!(FLOOR > 0 && HORIZON > 0)) {
  console.error('FAIL marriage timing: the age floor and horizon must be exported constants the screen can print.');
  failures++;
}
for (const lang of LANGS) {
  for (const [what, birth] of [['beyond the horizon', { ...FIXTURE, y: 2075 }], ['ordinary', FIXTURE]]) {
    const { text } = renderChart({ lang, birth });
    const lines = text.split('\n');
    const i = lines.findIndex((l) => /^(Marriage — supportive timing|विवाह — सम्भावित समय)$/.test(l));
    const blk = i < 0 ? '' : lines.slice(i, i + 6).join('\n');
    if (!blk) { console.error(`FAIL chart.${lang}: the marriage-timing block did not render.`); failures++; continue; }
    if (!blk.includes(String(FLOOR)) || !blk.includes(String(HORIZON))) {
      console.error(`FAIL chart.${lang} (${what} birth): the marriage block must state both edges of the search — age ${FLOOR} and ${HORIZON} years from today.`);
      console.error(`    ${blk.split('\n')[2] || '(no range line)'}`);
      failures++;
    }
  }
  const empty = renderChart({ lang, birth: { ...FIXTURE, y: 2075 } }).text;
  if (/next twenty years|आगामी बीस वर्षों/.test(empty)) {
    console.error(`FAIL chart.${lang}: an empty window list still reads as a finding about the marriage rather than a limit of the range searched.`);
    failures++;
  }
}

if (failures) {
  console.error(`\n✗ screen-snapshots FAILED (${failures})`);
  console.error('If the change was intentional: node validation/snapshot-generate.cjs --write, then commit the diff.');
  process.exit(1);
}

const covered = SCREENS.filter((s) => !s.skip).length;
const skipped = SCREENS.filter((s) => s.skip);
console.log(`✓ screen-snapshots: ${fresh.size} baselines match · ${covered} screens × ${LANGS.length} languages + chart/transit/match/prashna results`);
console.log(`✓ calculator cross-seeding: ${clean} mismatched-result renders identical to no result (0 crashes, 0 foreign answers) · ${answered} own-result renders still answer`);
console.log(`✓ yoga content parity: ${Object.keys(YOGA_EN).length} yoga templates × ${yogaRows} parameter sets · ${yogaEnTexts.size} distinct English interpretations → ${yogaEnToHiText.size} distinct Hindi (no collapse)`);
console.log(`✓ cast chart rendered for real: ${panelChecks} panel visibility checks across ${PANEL_KEYS.length} panels (nothing unmounts) · ?panel= restores the open panel · birth panchang, Papa references, dosha ayanamsa and the marriage search range all read in both languages`);
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
