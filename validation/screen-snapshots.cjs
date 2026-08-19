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
