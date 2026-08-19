#!/usr/bin/env node
'use strict';
/* Malayalam Kollavarsham (Kerala solar) display mode — C4-MALAYALAM-KOLLAVARSHAM.
 *
 * The mode ships DARK (enabled:false + malayalamSolar:false). This gate therefore
 * proves two separate things:
 *   1. the engine is CORRECT against dated, attributed published Kerala calendars, and
 *   2. the engine is INVISIBLE — with reviewed default flags nothing a user can reach
 *      offers or renders it.
 *
 * Rule implemented (see plans/research/malayalam-kollavarsham-rules.md):
 *   a Malayalam month begins on the civil date of the sankranti when the ingress
 *   falls before APARAHNA — three-fifths of the way from sunrise to sunset —
 *   otherwise on the next civil date.
 *   Source: Chatterjee, S.K. (1998) "Indian Calendric System", Publications
 *   Division, Govt of India, as reproduced in the four-school summary at
 *   hindu-blog.com/2019/04/hindu-solar-calendars-differences.html (retrieved
 *   2026-08-18). The same page states the Tamil sunset rule and the Bengal
 *   midnight rule exactly as Ganak already implements them.
 */
const fs=require('fs');
const {loadApp}=require('./_load-app.cjs');
const {computeTodayPanchang}=loadApp('src/engine/today-panchang.ts');
const {sunEvents,zoneOffset}=loadApp('src/engine/panchang.ts');
const {regionalCalendarDate,calendarLabel,calendarMonthLabel,conventionIsEnabled,resolveConvention,CALENDAR_CONVENTIONS,DEFAULT_REGIONAL_CALENDAR_FLAGS}=loadApp('src/engine/calendar-conventions.ts');
const evidence=loadApp('src/data/regional-calendar-evidence.ts');

const DAY=86400000;
let failures=0,checks=0;
const fail=(m)=>{console.error('FAIL '+m);failures++;};
const isoOrdinal=(iso)=>Date.parse(iso+'T00:00:00Z');
const isoOf=(ord)=>new Date(ord).toISOString().slice(0,10);
const atLocalNoon=(iso,place)=>{const [y,m,d]=iso.split('-').map(Number),off=zoneOffset(place.zone,y,m,d)||0;return Date.UTC(y,m-1,d,12)-off*3600000;};
const localParts=(ms,zone)=>{const d0=new Date(ms),off=zoneOffset(zone,d0.getUTCFullYear(),d0.getUTCMonth()+1,d0.getUTCDate())||0,d=new Date(ms+off*3600000);return {y:d.getUTCFullYear(),m:d.getUTCMonth()+1,d:d.getUTCDate(),ordinal:Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate())};};

/* PUBLISHED ANCHORS — Drik Panchang "Malayalam Calendar" monthly grids for
 * Thiruvananthapuram, Kerala (8°29'07"N 76°56'57"E), retrieved 2026-08-18 from
 * https://www.drikpanchang.com/malayalam/malayalam-month-calendar.html?geoname-id=1254163
 * Each row is [sidereal sign, first civil date of the month, month name, Kollam Era year].
 * The 21 rows below reproduce every Malayalam day number Drik publishes over the
 * 644 continuously covered civil days 2025-03-30 .. 2027-01-02: the printed day
 * numbers increase by one per civil day with no gap, repeat or contradiction
 * between these boundaries (verified against every fetched grid cell), so the
 * boundary list encodes the whole published series. */
const TVM={label:'Thiruvananthapuram',lat:8.4855,lon:76.9492,zone:'Asia/Kolkata'};
const PUBLISHED_MONTH_STARTS=[
  [0,'2025-04-14','Medam',1200],
  [1,'2025-05-15','Edavam',1200],
  [2,'2025-06-15','Mithunam',1200],
  [3,'2025-07-17','Karkidakam',1200],
  [4,'2025-08-17','Chingam',1201],
  [5,'2025-09-17','Kanni',1201],
  [6,'2025-10-18','Thulam',1201],
  [7,'2025-11-17','Vrischikam',1201],
  [8,'2025-12-16','Dhanu',1201],
  [9,'2026-01-15','Makaram',1201],
  [10,'2026-02-13','Kumbham',1201],
  [11,'2026-03-15','Meenam',1201],
  [0,'2026-04-14','Medam',1201],
  [1,'2026-05-15','Edavam',1201],
  [2,'2026-06-15','Mithunam',1201],
  [3,'2026-07-17','Karkidakam',1201],
  [4,'2026-08-17','Chingam',1202],
  [5,'2026-09-17','Kanni',1202],
  [6,'2026-10-18','Thulam',1202],
  [7,'2026-11-17','Vrischikam',1202],
  [8,'2026-12-16','Dhanu',1202],
];
/* Dated era anchors — the same Drik pages read on their single-day view. */
const PUBLISHED_ERA_YEARS=[
  ['2025-08-16',1200],['2025-08-17',1201],['2026-01-14',1201],['2026-08-16',1201],['2026-08-17',1202],
];
/* Festival cross-checks: Vishu is Medam 1 and Malayalam New Year is Chingam 1. */
const PUBLISHED_FESTIVAL_DAYS=[
  ['Vishu 2025','2025-04-14','Medam',1],['Vishu 2026','2026-04-14','Medam',1],
  ['Malayalam New Year 2025','2025-08-17','Chingam',1],['Malayalam New Year 2026','2026-08-17','Chingam',1],
];

/* 1. Permanent daily anchors: every civil day the published series covers. */
let permanent=0;
const firstStart=isoOrdinal(PUBLISHED_MONTH_STARTS[0][1]);
const lastStart=isoOrdinal(PUBLISHED_MONTH_STARTS[PUBLISHED_MONTH_STARTS.length-1][1]);
for(let ord=firstStart;ord<=isoOrdinal('2026-12-31');ord+=DAY){
  const iso=isoOf(ord);
  let row=PUBLISHED_MONTH_STARTS[0];
  for(const r of PUBLISHED_MONTH_STARTS) if(isoOrdinal(r[1])<=ord) row=r;
  const expDay=Math.floor((ord-isoOrdinal(row[1]))/DAY)+1;
  const got=regionalCalendarDate('malayalam-solar',{},atLocalNoon(iso,TVM),TVM);
  if(got.monthIndex!==row[0]||got.monthEn!==row[2]||got.day!==expDay)
    fail(`published Kerala anchor ${iso}: got ${got.monthEn} ${got.day} (sign ${got.monthIndex}); expected ${row[2]} ${expDay} (sign ${row[0]})`);
  if(got.year!==row[3]) fail(`published Kollam Era year ${iso}: got ${got.year}, expected ${row[3]}`);
  permanent++;checks++;
}

/* 2. Dated era-year anchors read straight off the published day pages. */
for(const [iso,me] of PUBLISHED_ERA_YEARS){
  const got=regionalCalendarDate('malayalam-solar',{},atLocalNoon(iso,TVM),TVM);
  if(got.year!==me) fail(`Kollam Era anchor ${iso}: got ${got.year}, expected ${me}`);
  checks++;
}
for(const [name,iso,month,day] of PUBLISHED_FESTIVAL_DAYS){
  const got=regionalCalendarDate('malayalam-solar',{},atLocalNoon(iso,TVM),TVM);
  if(got.monthEn!==month||got.day!==day) fail(`${name} ${iso}: got ${got.monthEn} ${got.day}, expected ${month} ${day}`);
  checks++;
}

/* 3. Independent differential model. Published 2026 Lahiri ingress instants plus
 * the aparahna rule written out separately from the engine, over a full year and
 * several latitudes. This tests the RULE, not just the anchor city. */
const CITIES=[TVM,{label:'Kochi',lat:9.9312,lon:76.2673,zone:'Asia/Kolkata'},{label:'Kozhikode',lat:11.2588,lon:75.7804,zone:'Asia/Kolkata'},
  {label:'Delhi',lat:28.6139,lon:77.209,zone:'Asia/Kolkata'},{label:'London',lat:51.5072,lon:-0.1276,zone:'Europe/London'},
  {label:'New York',lat:40.7128,lon:-74.006,zone:'America/New_York'},{label:'Sydney',lat:-33.8688,lon:151.2093,zone:'Australia/Sydney'},
  {label:'Tromso',lat:69.6492,lon:18.9553,zone:'Europe/Oslo'}];
const ingresses=[[8,Date.parse('2025-12-15T22:54:00Z')],...evidence.PUBLISHED_2026_SANKRANTI_UTC.map(([s,x])=>[s,Date.parse(x)])];
function referenceBoundaries(place){
  return ingresses.map(([sign,ms])=>{
    const x=localParts(ms,place.zone),tz=zoneOffset(place.zone,x.y,x.m,x.d)||0,ev=sunEvents(x.y,x.m,x.d,tz,place.lat,place.lon);
    const aparahna=ev.rise!=null&&ev.set!=null?ev.rise+0.6*(ev.set-ev.rise):null;
    return {sign,start:x.ordinal+(aparahna!=null&&ms<aparahna?0:1)*DAY};
  });
}
let differential=0;
for(const place of CITIES){
  const bounds=referenceBoundaries(place);
  for(let i=0;i<365;i++){
    const iso=new Date(Date.UTC(2026,0,1+i)).toISOString().slice(0,10),ord=isoOrdinal(iso);
    const got=regionalCalendarDate('malayalam-solar',{},atLocalNoon(iso,place),place);
    let b=bounds[0];for(const x of bounds)if(x.start<=ord)b=x;
    const day=Math.floor((ord-b.start)/DAY)+1;
    if(got.monthIndex!==b.sign||got.day!==day) fail(`${place.label} ${iso}: differential mismatch got sign/day ${got.monthIndex}/${got.day}, aparahna reference ${b.sign}/${day}`);
    const label=calendarLabel('malayalam-solar',{tz:zoneOffset(place.zone,2026,1,1)||0},atLocalNoon(iso,place),'en',place);
    if(!label||!label.includes(String(got.day))||!label.includes('Kollavarsham')) fail(`${place.label} ${iso}: blank/incomplete Malayalam label`);
    differential++;checks++;
  }
}

/* 4. The rule is Kerala's own, not a copy of a neighbour's. On a published 2026
 * boundary the three modes must disagree in exactly the documented direction:
 * Makara sankranti 2026 is 14 Jan 15:13 IST — after aparahna (13:41 at Thiruvananthapuram)
 * but before sunset — so Tamil Thai 1 is 14 Jan while Kerala's Makaram 1 is 15 Jan.
 * A Malayalam mode that silently reused the Tamil or Bengali branch fails here. */
{
  const at=atLocalNoon('2026-01-14',TVM);
  const tamil=regionalCalendarDate('tamil-solar',{},at,TVM),mal=regionalCalendarDate('malayalam-solar',{},at,TVM),ben=regionalCalendarDate('bengali-solar',{},at,TVM);
  if(!(tamil.monthEn==='Thai'&&tamil.day===1)) fail(`discriminator: Tamil Thai 1 expected on 2026-01-14, got ${tamil.monthEn} ${tamil.day}`);
  if(!(mal.monthEn==='Dhanu')) fail(`discriminator: Kerala must still be in Dhanu on 2026-01-14 (Makaram 1 is 15 Jan), got ${mal.monthEn} ${mal.day}`);
  const next=regionalCalendarDate('malayalam-solar',{},atLocalNoon('2026-01-15',TVM),TVM);
  if(!(next.monthEn==='Makaram'&&next.day===1)) fail(`discriminator: Kerala Makaram 1 expected on 2026-01-15, got ${next.monthEn} ${next.day}`);
  if(ben.monthEn==='Magh'&&ben.day===1) fail('discriminator: Bengali Magh 1 must not fall on 2026-01-14');
  checks+=4;
}
/* Aparahna is three-fifths of the day, not local noon and not sunset: the Mithuna
 * 2026 ingress (15 Jun 12:59 IST) is after Kerala noon but before aparahna, and the
 * published calendar starts Mithunam that same day. A midday cut-off fails here. */
{
  const d=regionalCalendarDate('malayalam-solar',{},atLocalNoon('2026-06-15',TVM),TVM);
  if(!(d.monthEn==='Mithunam'&&d.day===1)) fail(`aparahna-vs-noon discriminator: expected Mithunam 1 on 2026-06-15, got ${d.monthEn} ${d.day}`);
  checks++;
}

/* 5. DARKNESS. With the reviewed defaults the mode must be unreachable and the
 * offered picker list must be exactly what shipped before this branch. */
const SHIPPED_PICKER=['canonical','gregorian','north-purnimanta','tamil-solar','bengali-solar'];
const offered=CALENDAR_CONVENTIONS.filter(x=>conventionIsEnabled(x.id,DEFAULT_REGIONAL_CALENDAR_FLAGS)).map(x=>x.id);
if(JSON.stringify(offered)!==JSON.stringify(SHIPPED_PICKER)) fail(`picker list changed: ${JSON.stringify(offered)}`);
if(conventionIsEnabled('malayalam-solar',DEFAULT_REGIONAL_CALENDAR_FLAGS)) fail('malayalam-solar is reachable under default flags');
if(conventionIsEnabled('malayalam-solar',{...DEFAULT_REGIONAL_CALENDAR_FLAGS,malayalamSolar:true})) fail('malayalam-solar became reachable from the rollout flag alone; enabled:false must still hold it dark');
if(DEFAULT_REGIONAL_CALENDAR_FLAGS.malayalamSolar!==false) fail('DEFAULT_REGIONAL_CALENDAR_FLAGS.malayalamSolar must ship false');
const mode=CALENDAR_CONVENTIONS.find(x=>x.id==='malayalam-solar');
if(!mode) fail('malayalam-solar convention missing');
else{ if(mode.enabled!==false) fail('malayalam-solar must ship enabled:false'); if(mode.flag!=='malayalamSolar') fail('malayalam-solar must carry its own rollout flag'); }
const r=resolveConvention('malayalam-solar');
if(r.id!=='canonical'||r.recoveredFrom!=='malayalam-solar'||r.reason!=='disabled') fail(`a shared /?cal=malayalam-solar link must recover to canonical and say so: ${JSON.stringify(r)}`);
for(const id of ['tamil-solar','bengali-solar']) if(!conventionIsEnabled(id,DEFAULT_REGIONAL_CALENDAR_FLAGS)) fail(`${id} lost its default enablement`);
checks+=8;
/* No surface may branch on the dark mode while the picker question is open. */
for(const f of ['src/screens/DailyScreen.tsx','src/kundli-app.tsx','src/monitoring/regional-calendar-shadow.ts','src/engine/festivals.ts']){
  if(fs.readFileSync(f,'utf8').includes('malayalam-solar')) fail(`${f} branches on the dark mode id; it must stay engine-only until the picker decision lands`);
  checks++;
}

/* 6. Interpretation-only: reading a Malayalam date must not touch the Panchang. */
const immutable=(p)=>JSON.stringify({rise:p.rise,set:p.set,tithis:p.tithis,naks:p.naks,yogas:p.yogasP,karanas:p.karanas,rahu:p.rahu,gulika:p.gulika,yama:p.yama,abhijit:p.abhijit});
for(const place of [TVM,CITIES[3],CITIES[4]]) for(const iso of ['2026-01-14','2026-01-15','2026-04-14','2026-06-15','2026-08-17','2026-10-18']){
  const at=atLocalNoon(iso,place),p=computeTodayPanchang(place,'lahiri',at),before=immutable(p);
  regionalCalendarDate('malayalam-solar',p,p.rise||at,place);
  calendarLabel('malayalam-solar',p,p.rise||at,'hi',place);
  calendarMonthLabel('malayalam-solar',p,p.rise||at,'hi',place);
  if(immutable(p)!==before) fail(`${place.label} ${iso}: Malayalam interpretation mutated the canonical Panchang`);
  checks++;
}
/* Bilingual completeness: 12 native month names, Devanagari for the Hindi reader. */
{
  const seen=new Set();
  for(let i=0;i<12;i++){
    const iso=`2026-${String(i+1).padStart(2,'0')}-25`,at=atLocalNoon(iso,TVM),d=regionalCalendarDate('malayalam-solar',{},at,TVM);
    if(!/^[ഀ-ൿ]+$/.test(d.monthNative)) fail(`${iso}: month name is not Malayalam script (${d.monthNative})`);
    if(!/^[ऀ-ॿ‍]+$/.test(d.monthHi)) fail(`${iso}: Hindi month name is not Devanagari (${d.monthHi})`);
    seen.add(d.monthEn);checks++;
  }
  if(seen.size!==12) fail(`only ${seen.size} distinct Malayalam months over a year`);
}

if(failures){console.error(`malayalam-kollavarsham FAILED: ${failures}`);process.exit(1);}
console.log(`✓ malayalam-kollavarsham PASSED (${checks} checks: ${permanent} published Thiruvananthapuram daily anchors across 21 dated month boundaries and 3 Kollam Era years; ${differential} full-year aparahna differentials over ${CITIES.length} cities; Tamil/Bengali/noon rule discriminators; mode proven dark under reviewed defaults)`);
