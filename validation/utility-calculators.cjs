#!/usr/bin/env node
'use strict';
const assert = require('node:assert');
const fs = require('node:fs');
const { loadApp, ROOT } = require('./_load-app.cjs');
const data = loadApp('src/data/utility-calculators.ts');
const calc = loadApp('src/engine/utility-calculators.ts');

const expected = ['rashi','sun-sign','lagna','nakshatra','baby-name','mangal-dosha','kala-sarpa','pitra-dosha','papa-dosha','sade-sati','shraddha-tithi','pancha-pakshi','western-natal','western-relationship'];
assert.deepStrictEqual(data.UTILITY_CALCULATORS.map(x=>x.slug), expected, 'approved calculator inventory changed');
assert(data.UTILITY_CALCULATORS.every(x=>x.en&&x.hi&&x.blurbEn&&x.blurbHi), 'catalogue must be bilingual');
const paths = expected.map(x=>`/calculator/${x}`);
assert(paths.every((p,i)=>data.utilityFromPath(p)?.calculator?.slug===expected[i]), 'every calculator needs a permanent route');
assert(data.EXCLUDED_CALCULATOR_FAMILIES.every(x=>!expected.includes(x)), 'excluded calculator family was exposed');

const delhi = { y:1990,m:1,day:1,hh:12,mi:0,tz:5.5,lat:28.6139,lon:77.209 };
const q=calc.quickBirth(delhi);
assert.strictEqual(q.rashi, 'Kumbha (Aquarius)', 'Moon-sign anchor: Delhi 1990-01-01 noon IST');
assert.strictEqual(q.sunSign, 'Dhanu (Sagittarius)', 'sidereal Sun anchor');
assert.strictEqual(q.nakshatra, 'Dhanishta', 'nakshatra anchor');
assert.strictEqual(q.pada, 4, 'nakshatra pada anchor');
assert.strictEqual(q.syllable, 'Ge', 'name-sound anchor');
assert.strictEqual(q.syllableHi, 'गे', 'Hindi name-sound anchor');
const drikNamingPairs = [
  ['Chu','चु'],['Che','चे'],['Cho','चो'],['Laa','ला'],['Lee','ली'],['Loo','लू'],['Le','ले'],['Lo','लो'],
  ['A','अ'],['Ee','ई'],['U','उ'],['E','ए'],['O','ओ'],['Vaa','वा'],['Vee','वी'],['Vu','वु'],
  ['Ve','वे'],['Vo','वो'],['Kaa','का'],['Kee','की'],['Ku','कु'],['Gha','घ'],['Ing','ङ'],['Chha','छ'],
  ['Ke','के'],['Ko','को'],['Haa','हा'],['Hee','ही'],['Hu','हु'],['He','हे'],['Ho','हो'],['Daa','डा'],
  ['Dee','डी'],['Doo','डू'],['De','डे'],['Do','डो'],['Maa','मा'],['Mee','मी'],['Moo','मू'],['Me','मे'],
  ['Mo','मो'],['Taa','टा'],['Tee','टी'],['Too','टू'],['Te','टे'],['To','टो'],['Paa','पा'],['Pee','पी'],
  ['Poo','पू'],['Sha','ष'],['Na','ण'],['Tha','ठ'],['Pe','पे'],['Po','पो'],['Raa','रा'],['Ree','री'],
  ['Roo','रू'],['Re','रे'],['Ro','रो'],['Taa','ता'],['Tee','ती'],['Too','तू'],['Te','ते'],['To','तो'],
  ['Naa','ना'],['Nee','नी'],['Noo','नू'],['Ne','ने'],['No','नो'],['Yaa','या'],['Yee','यी'],['Yoo','यू'],
  ['Ye','ये'],['Yo','यो'],['Bhaa','भा'],['Bhee','भी'],['Bhoo','भू'],['Dhaa','धा'],['Phaa','फा'],['Dha','ढ'],
  ['Bhe','भे'],['Bho','भो'],['Jaa','जा'],['Jee','जी'],['Khee','खी'],['Khoo','खू'],['Khe','खे'],['Kho','खो'],
  ['Gaa','गा'],['Gee','गी'],['Gu','गु'],['Ge','गे'],['Go','गो'],['Saa','सा'],['See','सी'],['Soo','सू'],
  ['Se','से'],['So','सो'],['Daa','दा'],['Dee','दी'],['Doo','दू'],['Tha','थ'],['Jha','झ'],['Yna','ञ'],
  ['De','दे'],['Do','दो'],['Cha','च'],['Chee','ची'],
];
assert.strictEqual(drikNamingPairs.length, 108, 'Drik bilingual naming fixture must cover all 108 padas');
assert.deepStrictEqual(
  data.NAMING_SYLLABLES.flat().map((en,index)=>[en,data.NAMING_SYLLABLES_HI.flat()[index]]),
  drikNamingPairs,
  'all 108 English/Hindi naming sounds must remain positionally aligned to the declared Drik convention',
);
assert.strictEqual(data.NAMING_SYLLABLES_HI.length, 27, 'Hindi naming table must cover 27 nakshatras');
assert(data.NAMING_SYLLABLES_HI.every(row=>row.length===4&&row.every(x=>/[\u0900-\u097F]/.test(x))), 'Hindi naming table must contain 108 Devanagari sounds');
const mangal=calc.mangalDosha(delhi);
assert.strictEqual(mangal.refs.length,3,'Mangal must check Lagna, Moon and Venus separately');
assert(mangal.refs.every(x=>[1,2,4,7,8,12].includes(x.house)===x.counted),'Mangal house rule drift');
const ks=calc.kalaSarpa(delhi); assert(ks.enclosed>=0&&ks.enclosed<=7,'Kala Sarpa geometry invalid'); assert(ks.typeKey&&ks.typeEn&&ks.typeHi,'Kala Sarpa named type missing');
const pit=calc.pitraDosha(delhi); assert(pit.checks.length===5&&['none','single','multiple'].includes(pit.grade),'Pitra Dosha structure invalid'); assert(pit.checks.every(c=>c.en&&c.hi),'Pitra checks must be bilingual');
const papa=calc.papaDosha(delhi); assert(papa.byRef.length===3&&['low','moderate','high'].includes(papa.grade),'Papa Dosha structure invalid'); assert(papa.total>=0&&papa.total<=15,'Papa total out of range');
const ss=calc.sadeSati(delhi,Date.UTC(2026,6,22)); assert(['rising','middle','setting','not active'].includes(ss.phase),'Sade Sati phase invalid');
const sh=calc.shraddhaTithi(delhi); assert(sh.tithi&&sh.fortnight&&sh.amanta,'Shraddha identity incomplete');
const pp=calc.panchaPakshi(delhi); assert(calc.BIRDS.includes(pp.bird),'Pancha Pakshi bird invalid');
const wn=calc.westernNatal(delhi); assert(wn.bigThree.sun==='Capricorn','Western tropical Sun anchor'); assert(wn.system.includes('Tropical'),'Western/Vedic separation missing');
const wr=calc.westernRelationship(delhi,{...delhi,y:1992}); assert.strictEqual(wr.composite.length,7,'composite must cover seven classical bodies');

/* ---- CODEX-BUGBASH regression fixes (CLAUDE-FIX-UTILITY-CALCULATOR-BUGBASH) ---- */

// F4 — unknown / excluded / malformed calculator paths must resolve to an explicit
// not-found route, never null (null let Daily render silently under an invalid URL).
for (const p of ['/calculator/numerology','/calculator/gemstone','/calculator/vastu','/calculator/rashii','/calculator/','/calculator/RASHI','/calculators/foo'])
  assert.strictEqual(data.utilityFromPath(p)?.kind, 'notfound', `unknown calculator path must be not-found: ${p}`);
// a valid trailing slash still resolves the real calculator
assert.strictEqual(data.utilityFromPath('/calculator/rashi/')?.calculator?.slug, 'rashi', 'valid trailing slash must still resolve');
// paths outside the calculator namespace stay null so Daily/festival routing is intact
for (const p of ['/','/festival/diwali','/prashna']) assert.strictEqual(data.utilityFromPath(p), null, `non-calculator path must stay null: ${p}`);

// F3 — a future death is rejected outright; a past death never yields an occurrence
// before "now", and rolls forward when this year's tithi has already passed.
const nowRef = Date.UTC(2026,6,24,0,0), nowYear = new Date(nowRef).getUTCFullYear();
const future = calc.shraddhaTithi({...delhi, y:2099}, nowRef);
assert.strictEqual(future.future, true, 'a future death date must be rejected');
assert.strictEqual(future.annual, undefined, 'a future death must produce no annual occurrence');
const past = calc.shraddhaTithi(delhi, nowRef);
assert.strictEqual(past.future, false, 'a past death must calculate');
assert(Array.isArray(past.annual) && past.annual.length >= 1, 'a past death must yield upcoming occurrence(s)');
assert(past.annual.every(o => o.apMid >= nowRef), 'no annual Shraddha occurrence may precede now');
assert(past.annual.every(o => o.year >= nowYear), 'annual occurrences must be this year or later');

// F1 — the independent-birthplace fix relies on: two different places give different
// natals, and the composite is symmetric under A/B swap (the synastry-worthy invariant).
const sydney = {...delhi, lat:-33.8688, lon:151.2093, tz:11};
assert.notStrictEqual(calc.westernNatal(delhi).bigThree.ascendant, calc.westernNatal(sydney).bigThree.ascendant, 'different birthplaces must give different natals');
const comp = r => r.composite.map(c=>`${c.name}:${c.sign}`).join('|');
assert.strictEqual(comp(calc.westernRelationship(delhi,sydney)), comp(calc.westernRelationship(sydney,delhi)), 'composite must be symmetric under A/B swap');

// F6 — Vedic and Western never share a longitude (they differ by the ~24° ayanamsa),
// though they can fall in the same 30° sign. Invariant is on separation, not on signs.
const sidSun = calc.quickBirth(delhi).chart.rows.find(r=>r.name==='Sun').lon;
const tropSun = calc.westernNatal(delhi).planets.find(p=>p.name==='Sun').lon;
const sep = ((tropSun - sidSun) % 360 + 360) % 360;
assert(sep > 20 && sep < 28, `Vedic/Western Sun must differ by the ayanamsa (~24°), got ${sep.toFixed(2)}°`);

// Source guards complement the browser matrix for stateful UI defects.
const screenSource=fs.readFileSync('src/screens/UtilityCalculatorScreen.tsx','utf8');
const placeSource=fs.readFileSync('src/components/PlaceInput.tsx','utf8');
assert(screenSource.includes('place={placeB} onPlace={setPlaceB} onConfirmed={setConfirmedB}'), 'person B must retain an independent confirmed place');
assert(screenSource.includes('if(!confirmedA||!place)')&&screenSource.includes('if(item.slug==="western-relationship"&&(!confirmedB||!placeB))'), 'calculation must reject unconfirmed A/B places');
assert(placeSource.includes('onConfirmed(confirmed)')&&placeSource.includes('if (onConfirmed) return'), 'strict PlaceInput mode must report divergence and avoid stale snap-back');
assert(screenSource.includes('hi?q.syllableHi:q.syllable'), 'Hindi baby-name answer must use the sourced Devanagari sound');
assert(screenSource.includes('JYOTISH WORKSPACE')&&screenSource.includes('ज्योतिष कार्यक्षेत्र'), 'catalogue and details must visibly remain inside the bilingual Jyotish workspace');
assert(screenSource.includes('utilityHref("/",lang,place,{screen:"chart"})'), 'calculator pages must provide a Kundli parent link');
assert(screenSource.includes('utilityHref(`/calculator/${x.slug}/`,lang,place)'), 'catalogue detail links must preserve language and place context');
assert(screenSource.match(/utilityHref\("\/calculators\/",lang,place\)/g)?.length>=3, 'detail, catalogue and not-found journeys must preserve context when returning to calculators');
assert(screenSource.includes('params.set("city",String(place.label))')&&screenSource.includes('params.set("zone",String(place.zone))'), 'calculator journey URLs must carry the selected city and timezone');
assert((screenSource.match(/onClick=\{followUtilityLink\}/g)||[]).length>=5&&screenSource.includes('window.dispatchEvent(new PopStateEvent("popstate"))'), 'calculator-internal links must navigate without reloading and re-asking an accepted linked-city choice');

/* ---- 2026-08-18 bug-bash fixes (F2, F3, F8, F10) ---- */

// Negative assertions read the CODE, not the comments: the comments deliberately
// quote the defect they replaced (`?? 5.5`), and a comment must never fail a gate.
const screenCode = screenSource.split('\n').map((l) => l.replace(/^\s*\/\/.*$/, '')).join('\n');

// F10 — the not-found guard was case-sensitive and assumed a single leading slash,
// so "/Calculator/rashi" and "//calculator/rashi" fell through to null and the DAILY
// screen rendered under a calculator address. A wrong-case namespace must land on the
// not-found page, and must NOT be quietly resolved to a calculator nobody typed.
for (const p of ['/Calculator/rashi','//calculator/rashi','//calculators','/CALCULATORS/','/Calculators/rashi','///calculator/rashi'])
  assert.strictEqual(data.utilityFromPath(p)?.kind, 'notfound', `wrong-case or double-slashed calculator URL must be not-found: ${p}`);
// …while the real routes and the non-calculator routes are untouched.
assert.strictEqual(data.utilityFromPath('/calculator/rashi')?.calculator?.slug, 'rashi', 'the canonical calculator route must still resolve');
assert.strictEqual(data.utilityFromPath('/calculators')?.kind, 'catalogue', 'the catalogue route must still resolve');
for (const p of ['/','/festival/diwali','/prashna','/calendar/2026']) assert.strictEqual(data.utilityFromPath(p), null, `non-calculator path must stay null: ${p}`);

// F2 — the stale-answer guard must be a RENDER-TIME invariant, not an effect. An
// effect runs after the render that already handed the previous calculator's result
// to the new calculator's renderer. The rendered proof is in screen-snapshots.cjs
// (728 mismatched-result renders); these guard the shape it depends on.
assert(screenSource.includes('setResult({slug:item.slug,data:r'), 'a result must record the calculator it was computed for');
assert(screenSource.includes('const shown = result && item && result.slug===item.slug ? result : null;'), 'the answer must be gated on result.slug === the route slug at render time');
assert(!/\{result&&/.test(screenCode), 'no renderer may read the raw result state — render through the slug-matched value');
assert(!/const q=result/.test(screenCode), 'answer/detail/report must read the slug-matched result, never the raw state');

// F3 — a malformed zone in a shared or hand-edited URL must fail visibly instead of
// silently computing the chart in Indian Standard Time (a New York birth came back
// two signs away, with no message anywhere).
assert(!screenCode.includes('?? 5.5') && !screenCode.includes('??5.5'), 'the IST fallback for an unresolvable timezone must not come back');
assert(screenSource.includes('if(tzA===null){setResult(null);setError(zoneError(hi,place));return;}'), 'an unusable timezone must block the calculation with a visible error');
assert(/zoneError=\(hi:boolean,place:any\)=>hi/.test(screenSource), 'the timezone error must be bilingual');
assert(screenSource.includes('typeof place?.zone==="string"'), 'a non-string zone must be rejected before Intl, which would otherwise answer with the READER\'s own timezone');
assert(screenSource.includes('offsetLabel(shown.tz)'), 'the screen must show which UTC offset the answer was computed on');

// F8 — up to six seconds of blocking compute must show a busy state; the owner's
// standing rule is that a user can always tell what the app is doing.
assert(screenSource.includes('setBusy(true)') && screenSource.includes('disabled={busy}') && screenSource.includes('aria-busy={busy}'), 'Calculate must show a busy state while it computes');
assert(screenSource.includes('window.setTimeout(run,0)'), 'the blocking computation must yield to a paint first, or the busy state never appears');

// F14 — the birth-date field was labelled `तिथि`, which everywhere else in Ganak means
// the lunar day, not a calendar date. Two other screens already say `जन्म तिथि`.
assert(/dateLabel=labels\?labels\.date:\(hi\?"जन्म तिथि":"Date of birth"\)/.test(screenSource),
  'the birth-date field must be labelled जन्म तिथि / Date of birth — तिथि alone means the lunar day');
assert(!/hi\?"तिथि":"Date"/.test(screenSource), 'the bare तिथि label must not come back');

// F9 — a birth date is never silently corrected, and every rejection names its field.
assert(screenSource.includes('function dateProblem') && screenSource.includes('function timeProblem'),
  'date and time must be validated per field, not by one shared catch-all message');
assert(/YEAR_MIN=1800, YEAR_MAX=2150/.test(screenSource),
  'a year range guard must exist — the ΔT polynomials in src/engine/ephemeris.ts only run 1800-2150');
assert(!/:\s*"Could not calculate\. Check the date, time and place\."/.test(screenSource),
  'the one generic message that covered four different fields must not come back');

// F11 — the error boundary must let go of a crash when the reader navigates away.
// It used to clear `error` only from the Try again button, and this app navigates by
// pushState + popstate, so after one crash every later route still rendered
// "Something went wrong" — with document.title, <link rel=canonical> and the meta
// description frozen on the page that crashed, because the crashed screen's effects
// never ran again. Nine navigations were observed in that state in the 2026-08-18
// bug bash. The boundary is a class with lifecycle, so this is driven directly rather
// than through renderToStaticMarkup, which runs no lifecycle at all.
{
  const React = require('react');
  const { renderToStaticMarkup } = require('react-dom/server');
  // The boundary imports the error reporter, which reads `import.meta.env` — a Vite
  // build-time value the shared loader does not define. Bundle it here with that one
  // definition supplied, rather than changing a loader other lanes share.
  globalThis.__viteEnvStub = {};
  const esbuild = require('esbuild');
  const path = require('node:path');
  const tmp = path.join(__dirname, `.boundary-${process.pid}.tmp.cjs`);
  let Boundary;
  try {
    esbuild.buildSync({
      entryPoints: [path.join(ROOT, 'src/components/AppErrorBoundary.tsx')],
      outfile: tmp, bundle: true, format: 'cjs', platform: 'node', target: 'node18',
      jsx: 'transform', logLevel: 'silent',
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      define: { 'import.meta.env.VITE_SENTRY_DSN': 'undefined', 'import.meta.env': 'globalThis.__viteEnvStub' },
    });
    Boundary = require(tmp).default;
  } finally { try { fs.unlinkSync(tmp); } catch (e) { /* gone */ } }

  const listeners = {};
  const realWindow = global.window, realLocation = global.location;
  global.window = {
    addEventListener: (t, fn) => { (listeners[t] = listeners[t] || []).push(fn); },
    removeEventListener: (t, fn) => { listeners[t] = (listeners[t] || []).filter((f) => f !== fn); },
  };
  global.location = { search: '?lang=en', reload() {} };
  try {
    const b = new Boundary({ children: null });
    b.setState = (patch) => { b.state = { ...b.state, ...patch }; };
    assert(typeof b.componentDidMount === 'function', 'the error boundary must subscribe to route changes — it has no componentDidMount at all, so a crash is permanent for the session');
    b.componentDidMount();
    assert((listeners.popstate || []).length === 1, 'the error boundary must listen for popstate — a route change is when to try again');

    b.state = { error: new Error('boom') };
    listeners.popstate.forEach((fn) => fn());
    assert.strictEqual(b.state.error, null, 'a route change must clear the crash state, or every later page keeps showing "Something went wrong"');

    // …and the crash screen itself must offer a way back INTO the app. Try again
    // re-renders the same broken route and Reload reloads it; without a link the
    // reader is stuck on the crash screen whatever they press.
    for (const [lang, wantLabel] of [['en', 'panchang'], ['hi', 'पंचांग']]) {
      global.location = { search: `?lang=${lang}`, reload() {} };
      const inst = new Boundary({ children: null });
      inst.state = { error: new Error('boom') };
      const html = renderToStaticMarkup(inst.render());
      assert(/<a [^>]*href="\/\?lang=/.test(html), `the crash screen must link back into the app (${lang})`);
      assert(html.includes(wantLabel), `the crash screen's way back must be labelled in the reader's language (${lang})`);
    }

    assert(typeof b.componentWillUnmount === 'function', 'the error boundary must remove its popstate listener on unmount');
    b.componentWillUnmount();
    assert((listeners.popstate || []).length === 0, 'the popstate listener must be removed on unmount');
  } finally {
    if (realWindow === undefined) delete global.window; else global.window = realWindow;
    if (realLocation === undefined) delete global.location; else global.location = realLocation;
  }
}

console.log(`UTILITY CALCULATORS PASSED (${expected.length} bilingual permanent journeys; Jyotish context bridge; 108 Drik-aligned English/Hindi pairs; F1-F7 + 2026-08-18 F2/F3/F8/F10 regressions)`);
