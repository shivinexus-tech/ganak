#!/usr/bin/env node
'use strict';
const assert = require('node:assert');
const { loadApp } = require('./_load-app.cjs');
const data = loadApp('src/data/utility-calculators.ts');
const calc = loadApp('src/engine/utility-calculators.ts');

const expected = ['rashi','sun-sign','lagna','nakshatra','baby-name','mangal-dosha','kala-sarpa','sade-sati','shraddha-tithi','pancha-pakshi','western-natal','western-relationship'];
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
const mangal=calc.mangalDosha(delhi);
assert.strictEqual(mangal.refs.length,3,'Mangal must check Lagna, Moon and Venus separately');
assert(mangal.refs.every(x=>[1,2,4,7,8,12].includes(x.house)===x.counted),'Mangal house rule drift');
const ks=calc.kalaSarpa(delhi); assert(ks.enclosed>=0&&ks.enclosed<=7,'Kala Sarpa geometry invalid');
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

console.log(`UTILITY CALCULATORS PASSED (${expected.length} bilingual permanent journeys; exclusions guarded; F1/F3/F4/F6 regressions)`);
