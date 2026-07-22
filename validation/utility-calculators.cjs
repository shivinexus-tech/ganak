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
console.log(`UTILITY CALCULATORS PASSED (${expected.length} bilingual permanent journeys; exclusions guarded)`);
